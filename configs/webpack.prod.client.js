const common = require("./webpack.common");
const path = require('path');
const fs = require('fs-extra');
const webpack = require("webpack");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');
const appAssetsManifest = path.resolve(buildDir, "assets.json");

process.env.NODE_ENV = "production";

fs.emptyDirSync(buildDir);

const clientPublicPath = process.env.CLIENT_PUBLIC_PATH || '/';

const clientConfig = {
    ...common,
    mode: "production",
    module: {
        rules: [
            ...common.module.rules,
            {
                test: /\.module\.(css|scss|sass)$/i,
                use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { importLoaders: 1, modules: true } }, "postcss-loader", "sass-loader"],
            },
            {
                test: /\.(css|scss|sass)$/i,
                exclude: /\.module\.(css|scss|sass)$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"],
            },
            {
                test: /\.(jpg|jpeg|png|gif|mp3|svg|ico)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'static/media/[name].[hash].[ext]',
                        },
                    }
                ]
            }
        ]
    },
    target: 'web',
    name: 'client',
    entry: {
        client: path.resolve(srcDir, 'client.tsx'),
    },
    output: {
        publicPath: clientPublicPath,
        path: path.resolve(buildDir, 'public'),
        filename: 'static/js/[name]-[contenthash:8].js',
        chunkFilename: 'static/js/[name]-[contenthash:8].chunk.js',
        assetModuleFilename: 'static/media/[name].[hash][ext]'
    },
    optimization: {
        ...common.optimization,
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: 'initial',
                    name: 'vendor',
                    test: module => /node_modules/.test(module.resource),
                    enforce: true,
                },
            },
        },
        minimizer: [
            ...common.optimization.minimizer,
            new CssMinimizerPlugin({
                minimizerOptions: {
                    sourceMap: process.env.SOURCE_MAP || true,
                },
                minify: async (data, inputMap, minimizerOptions) => {
                    // eslint-disable-next-line global-require
                    const CleanCSS = require('clean-css');
                    const [[filename, input]] = Object.entries(data);
                    const minifiedCss = await new CleanCSS({ sourceMap: minimizerOptions.sourceMap }).minify({
                        [filename]: {
                            styles: input,
                            sourceMap: inputMap,
                        },
                    });
                    return {
                        code: minifiedCss.styles,
                        map: minifiedCss.sourceMap ? minifiedCss.sourceMap.toJSON() : '',
                        warnings: minifiedCss.warnings,
                    };
                },
            })]
    },
    plugins: [
        ...common.plugins,
        new MiniCssExtractPlugin({
            filename: 'static/css/[name]-[contenthash:8].css',
            chunkFilename: 'static/css/[name]-[contenthash:8].chunk.css',
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new CompressionPlugin({
            algorithm: "gzip",
            test: /\.(js|css|html|svg)$/,
            threshold: 6144,
            minRatio: 0.8
        }),
        new WebpackManifestPlugin({
            fileName: path.resolve(buildDir, 'assets.json'),
            writeToFileEmit: true,
            generate: (seed, files) => {
                const entrypoints = new Set();
                const noChunkFiles = new Set();
                files.forEach(file => {
                    if (file.isChunk) {
                        const groups = (
                            (file.chunk || {})._groups || []
                        ).forEach(group => entrypoints.add(group));
                    } else {
                        noChunkFiles.add(file);
                    }
                });
                const entries = [...entrypoints];
                const entryArrayManifest = entries.reduce((acc, entry) => {
                    const name =
                        (entry.options || {}).name ||
                        (entry.runtimeChunk || {}).name ||
                        entry.id;
                    const allFiles = []
                        .concat(
                            ...(entry.chunks || []).map(chunk =>
                                chunk.files.map(path => !path.startsWith('/.') && clientPublicPath + path)
                            )
                        )
                        .filter(Boolean);

                    const filesByType = allFiles.reduce((types, file) => {
                        const fileType = file.slice(file.lastIndexOf('.') + 1);
                        types[fileType] = types[fileType] || [];
                        types[fileType].push(file);
                        return types;
                    }, {});

                    const chunkIds = [].concat(
                        ...(entry.chunks || []).map(chunk => chunk.ids)
                    );

                    return name
                        ? {
                            ...acc,
                            [name]: { ...filesByType, chunks: chunkIds },
                        }
                        : acc;
                }, seed);
                entryArrayManifest['noentry'] = [...noChunkFiles]
                    .map(file => !file.path.includes('/.') && file.path)
                    .filter(Boolean)
                    .reduce((types, file) => {
                        const fileType = file.slice(file.lastIndexOf('.') + 1);
                        types[fileType] = types[fileType] || [];
                        types[fileType].push(file);
                        return types;
                    }, {});
                return entryArrayManifest;
            },
        }), 
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(rootDir, 'public').replace(/\\/g, '/') + '/**/*',
                    to: buildDir,
                    context: path.resolve(rootDir, '.'),
                },
            ]
        }), 
        new webpack.DefinePlugin({
            'process.env.ASSETS_MANIFEST': JSON.stringify(appAssetsManifest),
            'process.env.PUBLIC_DIR': JSON.stringify(path.resolve(rootDir, "build/public")
            ),
        })
    ]
};

module.exports = clientConfig;
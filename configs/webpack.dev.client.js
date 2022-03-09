const common = require("./webpack.common");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const fs = require('fs-extra');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const webpack = require("webpack");
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'dist');
const srcDir = path.resolve(rootDir, 'src');
const publicDir = path.resolve(rootDir, 'public');
const appAssetsManifest = path.resolve(buildDir, "assets.json");

const clientPublicPath = process.env.CLIENT_PUBLIC_PATH || "/";

const clientConfig = {
    ...common,
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
                            name: '[name].[hash].[ext]',
                        },
                    }
                ]
            }
        ]
    },
    target: 'web',
    mode: "development",
    name: 'client',
    entry: {
        client: path.resolve(srcDir, 'client'),
    },
    output: {
        publicPath: '/',
        path: buildDir,
        filename: '[name].js',
        chunkFilename: '[name].chunk.js',
    },
    devServer: {
        disableHostCheck: true,
        clientLogLevel: 'none',
        publicPath: publicDir,
        noInfo: true,
        overlay: false,
        quiet: true,
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
    },
    devtool: 'inline-source-map',
    plugins: [
        ...common.plugins,
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].chunk.css',
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
        new webpack.DefinePlugin({
            'process.env.ASSETS_MANIFEST': JSON.stringify(appAssetsManifest),
            'process.env.PUBLIC_DIR': JSON.stringify(path.resolve(rootDir, "public")
            ),
        })
]
};

module.exports = clientConfig;
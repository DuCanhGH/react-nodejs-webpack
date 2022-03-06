const common = require("./webpack.common");
const path = require('path');
const fs = require('fs-extra');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');

process.env.NODE_ENV = "production";

fs.emptyDirSync(buildDir);

const clientPublicPath = process.env.CLIENT_PUBLIC_PATH || '/';

const clientConfig = {
    ...common,
    mode: "production",
    target: 'web',
    name: 'client',
    entry: {
        client: path.resolve(srcDir, 'client.tsx'),
    },
    output: {
        publicPath: clientPublicPath,
        path: path.resolve(buildDir, 'public'),
        filename: '[name]-[contenthash:8].js',
        chunkFilename: '[name]-[contenthash:8].chunk.js',
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
        minimizer: [new CssMinimizerPlugin({
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
    plugins: common.plugins.concat([new WebpackManifestPlugin({
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
    }), new CopyPlugin({
        patterns: [
            {
                from: path.resolve(rootDir, 'public').replace(/\\/g, '/') + '/**/*',
                to: buildDir,
                context: path.resolve(rootDir, '.'),
            },
        ]
    })])
};

module.exports = clientConfig;
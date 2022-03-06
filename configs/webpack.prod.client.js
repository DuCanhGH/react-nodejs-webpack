const common = require("./webpack.common");
const path = require('path');
const fs = require('fs-extra');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');
const isDev = process.env.NODE_ENV !== 'production';

fs.emptyDirSync(buildDir);

const clientPublicPath = process.env.CLIENT_PUBLIC_PATH || (isDev ? `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}/` : '/');

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
        path: buildDir,
        filename: '[name].js',
        chunkFilename: '[name].chunk.js',
    },
    optimization: {
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
    plugins: common.plugins.concat([new WebpackManifestPlugin({
        fileName: "assets.json",
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
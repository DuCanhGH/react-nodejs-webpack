const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const rootDir = fs.realpathSync(process.cwd());
const srcDir = path.resolve(rootDir, "src");
const devMode = process.env.NODE_ENV !== "production";
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const common = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: srcDir,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                    },
                },
            },
            {
                test: /\.(ts|tsx)$/,
                use: ["ts-loader"],
            },
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
                use: ["file-loader"],
            },
        ],
    },
    resolve: {
        modules: ["node_modules", srcDir],
        extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
    },
    plugins: [new MiniCssExtractPlugin(), new WebpackManifestPlugin({
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
                            chunk.files.map(path => !path.startsWith('/.') && path)
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
    }), new webpack.WatchIgnorePlugin({ paths: [path.resolve(__dirname, "build/assets.json")] })],
};

module.exports = common;
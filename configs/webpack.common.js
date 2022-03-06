const path = require("path");
const fs = require('fs-extra');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");

const rootDir = fs.realpathSync(process.cwd());
const srcDir = path.resolve(rootDir, "src");
const appAssetsManifest = path.resolve(rootDir, "build/assets.json");

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
                type: 'asset/resource',
            }
        ],
    },
    resolve: {
        modules: ["node_modules", srcDir],
        extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new webpack.WatchIgnorePlugin({ paths: [appAssetsManifest] }),
        new webpack.DefinePlugin({
            'process.env.ASSETS_MANIFEST': JSON.stringify(appAssetsManifest),
            'process.env.PUBLIC_DIR': JSON.stringify(path.resolve(rootDir, process.env.NODE_ENV === "production" ? "build/public" : "public")
            ),
        })].concat(process.env.NODE_ENV === "production" ? [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new CompressionPlugin({
                algorithm: "gzip",
                test: /\.(js|css|html|svg)$/,
                threshold: 6144,
                minRatio: 0.8
            })
        ] : []),
};

module.exports = common;

exports.appAssetsManifest = appAssetsManifest;
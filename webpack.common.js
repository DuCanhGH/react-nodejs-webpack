const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const rootDir = fs.realpathSync(process.cwd());
const srcDir = path.resolve(rootDir, "src");

const appAssetsManifest = path.resolve(__dirname, "build/assets.json");

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
            }
        ],
    },
    resolve: {
        modules: ["node_modules", srcDir],
        extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
    },
    plugins: [new MiniCssExtractPlugin(), new webpack.WatchIgnorePlugin({ paths: [appAssetsManifest] }), new webpack.DefinePlugin({
        'process.env.ASSETS_MANIFEST': JSON.stringify(appAssetsManifest)
    })],
};

module.exports = common;

exports.appAssetsManifest = appAssetsManifest;
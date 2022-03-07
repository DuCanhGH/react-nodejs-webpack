const path = require("path");
const fs = require('fs-extra');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const rootDir = fs.realpathSync(process.cwd());
const srcDir = path.resolve(rootDir, "src");
const buildDir = path.resolve(rootDir, 'build');
const appAssetsManifest = path.resolve(buildDir, "assets.json");

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
            }
        ],
    },
    resolve: {
        modules: ["node_modules", srcDir],
        extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
    },
    plugins: [
        new webpack.WatchIgnorePlugin({ paths: [appAssetsManifest] })
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                parse: {
                    ecma: 8,
                },
                compress: {
                    ecma: 5,
                    warnings: false,
                    comparisons: false,
                    inline: 2,
                },
                mangle: {
                    safari10: true,
                },
                output: {
                    ecma: 5,
                    comments: false,
                    ascii_only: true,
                },
                sourceMap: process.env.SOURCE_MAP ?? true,
            },
        })],
    },
};

module.exports = common;

exports.appAssetsManifest = appAssetsManifest;
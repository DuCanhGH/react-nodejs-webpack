const path = require("path");
const fs = require('fs-extra');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const CompressionPlugin = require("compression-webpack-plugin");
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
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'static/media/[name].[hash].[ext]',
                        },
                    }
                ]
            }
        ],
    },
    resolve: {
        modules: ["node_modules", srcDir],
        extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].css',
            chunkFilename: 'static/css/[name].chunk.css',
        }),
        new webpack.WatchIgnorePlugin({ paths: [appAssetsManifest] })].concat(process.env.NODE_ENV === "production" ? [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new CompressionPlugin({
                algorithm: "gzip",
                test: /\.(js|css|html|svg)$/,
                threshold: 6144,
                minRatio: 0.8
            })
        ] : []),
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
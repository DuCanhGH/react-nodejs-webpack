const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const fs = require('fs-extra');
const webpack = require("webpack");
const common = require("./webpack.common");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const outputDir = path.resolve(buildDir, 'public');
const srcDir = path.resolve(rootDir, 'src');
const appAssetsManifest = path.resolve(buildDir, "assets.json");

process.env.NODE_ENV = "production";

const serverConfig = {
    ...common,
    target: 'node',
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
    name: 'server',
    entry: {
        server: path.join(srcDir, "server")
    },
    externals: [nodeExternals()],
    output: {
        publicPath: '/',
        path: outputDir,
        filename: '../server.js',
    },
    optimization: {
        ...common.optimization,
        minimize: true,
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
            new TerserPlugin({
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
            })
        ],
    },
    node: {
        __dirname: false,
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
        new webpack.DefinePlugin({
            'process.env.ASSETS_MANIFEST': JSON.stringify(appAssetsManifest),
            'process.env.PUBLIC_DIR': JSON.stringify(path.resolve(rootDir, "build/public")
            ),
        })
    ]
};

module.exports = serverConfig;
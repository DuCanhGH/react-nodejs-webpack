const path = require("path");
const fs = require('fs-extra');
const webpack = require("webpack");
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
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    "modules": false
                                }
                            ],
                            "@babel/react",
                            "@babel/preset-typescript"
                        ]
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
        minimizer: []
    }
};

module.exports = common;

exports.appAssetsManifest = appAssetsManifest;
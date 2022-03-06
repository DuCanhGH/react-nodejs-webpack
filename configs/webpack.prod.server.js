const nodeExternals = require('webpack-node-externals');
const path = require('path');
const fs = require('fs-extra');
const webpack = require("webpack");
const common = require("./webpack.common");

const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');
const appAssetsManifest = path.resolve(buildDir, "assets.json");

process.env.NODE_ENV = "production";

const serverConfig = {
    ...common,
    target: 'node',
    mode: "production",
    name: 'server',
    entry: {
        server: path.join(srcDir, "server.ts")
    },
    externals: [nodeExternals()],
    output: {
        publicPath: '/',
        path: buildDir,
        filename: 'server.js',
    },
    node: {
        __dirname: false,
    },
    plugins: [
        ...common.plugins,
        new webpack.DefinePlugin({
            'process.env.ASSETS_MANIFEST': JSON.stringify(appAssetsManifest),
            'process.env.PUBLIC_DIR': JSON.stringify(path.resolve(rootDir, "build/public")
            ),
        })
    ]
};

module.exports = serverConfig;
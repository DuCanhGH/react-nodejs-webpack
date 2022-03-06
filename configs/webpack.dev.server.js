const common = require("./webpack.common");
const path = require('path');
const fs = require('fs-extra');
const nodeExternals = require('webpack-node-externals');
const webpack = require("webpack");
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');
const publicDir = path.resolve(rootDir, 'public');
const appAssetsManifest = path.resolve(buildDir, "assets.json");

const serverConfig = {
    ...common,
    target: 'node',
    mode: "development",
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
    devServer: {
        disableHostCheck: true,
        clientLogLevel: 'none',
        publicPath: publicDir,
        noInfo: true,
        overlay: false,
        quiet: true,
    },
    devtool: 'inline-source-map',
    node: {
        __dirname: false,
    },
    plugins: [
        ...common.plugins,
        new webpack.DefinePlugin({
            'process.env.ASSETS_MANIFEST': JSON.stringify(appAssetsManifest),
            'process.env.PUBLIC_DIR': JSON.stringify(path.resolve(rootDir, "public")
            ),
        })
    ]
};

module.exports = serverConfig;
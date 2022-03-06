const common = require("./webpack.common");
const path = require('path');
const fs = require('fs-extra');
const nodeExternals = require('webpack-node-externals');

const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');
const publicDir = path.resolve(rootDir, 'public');

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
};

module.exports = serverConfig;
const common = require("./webpack.common");
const path = require('path');
const fs = require('fs');
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');
const publicDir = path.resolve(rootDir, 'public');
const nodeExternals = require('webpack-node-externals');

const clientConfig = {
    ...common,
    target: 'web',
    mode: "development",
    name: 'client',
    entry: {
        client: path.resolve(srcDir, 'client.tsx'),
    },
    output: {
        publicPath: '/',
        path: buildDir,
        filename: '[name].js',
        chunkFilename: '[name].js',
    },
    devServer: {
        disableHostCheck: true,
        clientLogLevel: 'none',
        publicPath: publicDir,
        noInfo: true,
        overlay: false,
        quiet: true,
    },
    optimization: {
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
    },
    devtool: 'inline-source-map',
};

const serverConfig = {
    ...common,
    target: 'node',
    mode: "development",
    name: 'server',
    entry: path.join(srcDir, "server.ts"),
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

module.exports = [clientConfig, serverConfig];
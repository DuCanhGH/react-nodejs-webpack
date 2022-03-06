const common = require("./webpack.common");
const path = require('path');
const fs = require('fs');
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');
const nodeExternals = require('webpack-node-externals');

const clientConfig = {
    ...common,
    mode: "production",
    target: 'web',
    name: 'client',
    entry: {
        client: path.resolve(srcDir, 'client.tsx'),
    },
    output: {
        publicPath: '/',
        path: buildDir,
        filename: '[name].js',
        chunkFilename: '[name].js',
        clean: true,
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
};

const serverConfig = {
    ...common,
    target: 'node',
    mode: "production",
    name: 'server',
    entry: path.join(srcDir, "server.ts"),
    externals: [nodeExternals()],
    output: {
        publicPath: '/',
        path: buildDir,
        filename: 'server.js',
        clean: true,
    },
    node: {
        __dirname: false,
    },
};

module.exports = [clientConfig, serverConfig];
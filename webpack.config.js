const path = require('path');
const nodeExternals = require('webpack-node-externals');
const fs = require('fs');
const rootDir = fs.realpathSync(process.cwd());
const srcDir = path.resolve(rootDir, 'src');
const buildDir = path.resolve(rootDir, 'build');

const common = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: srcDir,
                use: {
                    loader: 'babel-loader',
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
                test: /\.(css|scss)$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
                use: ["file-loader"],
            },
        ],
    },
    resolve: {
        modules: ['node_modules', srcDir],
        extensions: ['.js', '.jsx', '.json', ".tsx", ".ts"],
    },
};

const clientConfig = {
    ...common,
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
    devtool: 'source-map',
};

const serverConfig = {
    ...common,
    target: 'node',
    name: 'server',
    entry: {
        server: path.join(srcDir, "server.ts"),
    },
    externals: [nodeExternals()],
    output: {
        publicPath: '/',
        path: buildDir,
        filename: 'server.js',
    },
    devtool: 'source-map',
    node: {
        __dirname: false,
    },
};

module.exports = [clientConfig, serverConfig];
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const fs = require('fs-extra');
const common = require("./webpack.common");
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, 'build');
const srcDir = path.resolve(rootDir, 'src');

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
};

module.exports = serverConfig;
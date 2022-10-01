import fs from "fs-extra";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import webpack from "webpack";
import webpackMerge from "webpack-merge";

import common from "./webpack.common.js";

const { merge } = webpackMerge;
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, "build");
const outputDir = path.resolve(buildDir, "public");
const srcDir = path.resolve(rootDir, "src");
const appAssetsManifest = path.resolve(buildDir, "assets.json");

process.env.NODE_ENV = "production";

/**
 * @type {import('webpack').Configuration}
 */
const serverConfig = {
  target: "node16.17",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.module\.(css|scss|sass)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1, modules: true } },
          "postcss-loader",
          "sass-loader",
        ],
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
            loader: "file-loader",
            options: {
              name: "static/media/[name].[hash].[ext]",
            },
          },
        ],
      },
    ],
  },
  name: "server",
  entry: {
    server: path.join(srcDir, "server"),
  },
  externals: {
    express: "express",
  },
  output: {
    publicPath: "/",
    path: outputDir,
    filename: "../server.js",
    module: true,
    library: {
      type: "module",
    },
  },
  optimization: {},
  node: {
    __dirname: false,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/css/[name]-[contenthash:8].css",
      chunkFilename: "static/css/[name]-[contenthash:8].chunk.css",
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      "process.env.ASSETS_MANIFEST": JSON.stringify(appAssetsManifest),
      "process.env.PUBLIC_DIR": JSON.stringify(path.resolve(rootDir, "build/public")),
    }),
  ],
  experiments: {
    outputModule: true,
  },
};

export default merge(common, serverConfig);

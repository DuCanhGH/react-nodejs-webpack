import webpack from "webpack";
import webpackMerge from "webpack-merge";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import fs from "fs-extra";
import common from "./webpack.common.js";

const { merge } = webpackMerge;
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, "dist");
const srcDir = path.resolve(rootDir, "src");
const appAssetsManifest = path.resolve(buildDir, "assets.json");

/**
 * @type {import('webpack').Configuration}
 */
const serverConfig = {
  target: "node16.17",
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
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  mode: "development",
  name: "server",
  entry: {
    server: path.join(srcDir, "server"),
  },
  output: {
    publicPath: "/",
    path: buildDir,
    filename: "server.js",
    module: true,
    library: {
      type: "module",
    },
  },
  externals: {
    express: "express",
  },
  devtool: "inline-source-map",
  node: {
    __dirname: false,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].chunk.css",
    }),
    new webpack.DefinePlugin({
      "process.env.ASSETS_MANIFEST": JSON.stringify(appAssetsManifest),
      "process.env.PUBLIC_DIR": JSON.stringify(path.resolve(rootDir, "public")),
    }),
  ],
  experiments: {
    outputModule: true,
  },
};

export default merge(common, serverConfig);

import fs from "fs-extra";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import webpack from "webpack";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import webpackMerge from "webpack-merge";

import common from "./webpack.common.js";

const { merge } = webpackMerge;
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, "dist");
const srcDir = path.resolve(rootDir, "src");
const appAssetsManifest = path.resolve(buildDir, "assets.json");

const clientPublicPath = process.env.CLIENT_PUBLIC_PATH || "/";

/**
 * @type {import('webpack').Configuration}
 */
const clientConfig = {
  target: "web",
  mode: "development",
  name: "client",
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
  entry: {
    client: path.resolve(srcDir, "client"),
  },
  output: {
    publicPath: "/",
    path: buildDir,
    filename: "[name].js",
    chunkFilename: "[name].chunk.js",
    module: true,
    library: {
      type: "module",
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: "initial",
          name: "vendor",
          test: (module) => /node_modules/.test(module.resource),
          enforce: true,
        },
      },
    },
  },
  devtool: "inline-source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].chunk.css",
    }),
    new WebpackManifestPlugin({
      fileName: path.resolve(buildDir, "assets.json"),
      writeToFileEmit: true,
      generate: (seed, files) => {
        const entrypoints = new Set();
        const noChunkFiles = new Set();
        files.forEach((file) => {
          if (file.isChunk) {
            ((file.chunk || {})._groups || []).forEach((group) => entrypoints.add(group));
          } else {
            noChunkFiles.add(file);
          }
        });
        const entries = [...entrypoints];
        const entryArrayManifest = entries.reduce((acc, entry) => {
          const name = (entry.options || {}).name || (entry.runtimeChunk || {}).name || entry.id;
          const allFiles = []
            .concat(
              ...(entry.chunks || []).map((chunk) =>
                chunk.files.map((path) => !path.startsWith("/.") && clientPublicPath + path),
              ),
            )
            .filter(Boolean);

          const filesByType = allFiles.reduce((types, file) => {
            const fileType = file.slice(file.lastIndexOf(".") + 1);
            types[fileType] = types[fileType] || [];
            types[fileType].push(file);
            return types;
          }, {});

          const chunkIds = [].concat(...(entry.chunks || []).map((chunk) => chunk.ids));

          return name
            ? {
                ...acc,
                [name]: { ...filesByType, chunks: chunkIds },
              }
            : acc;
        }, seed);
        entryArrayManifest["noentry"] = [...noChunkFiles]
          .map((file) => !file.path.includes("/.") && file.path)
          .filter(Boolean)
          .reduce((types, file) => {
            const fileType = file.slice(file.lastIndexOf(".") + 1);
            types[fileType] = types[fileType] || [];
            types[fileType].push(file);
            return types;
          }, {});
        return entryArrayManifest;
      },
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

export default merge(common, clientConfig);

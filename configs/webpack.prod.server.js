// @ts-check
import "dotenv/config";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import webpack from "webpack";

import { prodDir } from "./constants.js";
import { callAndMergeConfigs } from "./utils/call_and_merge_wp_configs.js";
import commonServerConfig from "./webpack.common.server.js";

const outputDir = path.resolve(prodDir.build, "public");

/** @type {import("webpack").Configuration} */
const prodServerConfig = {
  mode: "production",
  module: {
    rules: [
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
  output: {
    publicPath: "/",
    path: outputDir,
    filename: "../server.js",
    module: true,
    library: {
      type: "module",
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/css/[name]-[contenthash:8].css",
      chunkFilename: "static/css/[name]-[contenthash:8].chunk.css",
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  experiments: {
    outputModule: true,
  },
};

export default callAndMergeConfigs(commonServerConfig, prodServerConfig);

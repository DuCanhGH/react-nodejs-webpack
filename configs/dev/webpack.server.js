// @ts-check
import "dotenv/config";

import fs from "fs-extra";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";

import commonServerConfig from "../common/webpack.server.js";
import { callAndMergeConfigs } from "../utils/call_and_merge_wp_configs.js";

const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, "dist");

/** @type {import("webpack").Configuration} */
const devServerConfig = {
  mode: "development",
  output: {
    publicPath: "/",
    path: buildDir,
    filename: "server.js",
    module: true,
    library: {
      type: "module",
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].chunk.css",
    }),
  ],
  stats: "errors-warnings",
};

export default callAndMergeConfigs(commonServerConfig, devServerConfig);

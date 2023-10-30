// @ts-check
import "dotenv/config";

import MiniCssExtractPlugin from "mini-css-extract-plugin";

import commonServerConfig from "../common/webpack.server.js";
import { clientPublicPath, devBuildDir } from "../shared/constants.js";
import { callAndMergeConfigs } from "../utils/call-and-merge-configs.js";

/** @type {import("webpack").Configuration} */
const devServerConfig = {
  mode: "development",
  output: {
    publicPath: clientPublicPath,
    path: devBuildDir,
    filename: "server.cjs",
  },
  plugins: [new MiniCssExtractPlugin()],
  stats: "errors-warnings",
};

export default callAndMergeConfigs(commonServerConfig, devServerConfig);

// @ts-check
import "dotenv/config";

import fs from "fs-extra";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import commonServerConfig from "../common/webpack.server.js";
import { clientPublicPath, devDir } from "../shared/constants.js";
import { callAndMergeConfigs } from "../utils/call_and_merge_wp_configs.js";

/** @type {import("webpack").Configuration} */
const devServerConfig = {
  mode: "development",
  output: {
    publicPath: clientPublicPath,
    path: devDir.build,
    filename: "server.js",
    module: true,
    library: {
      type: "module",
    },
  },
  plugins: [new MiniCssExtractPlugin()],
  stats: "errors-warnings",
};

export default callAndMergeConfigs(commonServerConfig, devServerConfig);

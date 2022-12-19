// @ts-check
import "dotenv/config";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import webpack from "webpack";

import commonServerConfig from "../common/webpack.server.js";
import { prodAssetModuleFilename, prodDir } from "../shared/constants.js";
import { callAndMergeConfigs } from "../utils/call_and_merge_wp_configs.js";

const outputDir = path.resolve(prodDir.build, "public");

/** @type {import("webpack").Configuration} */
const prodServerConfig = {
  output: {
    publicPath: "/",
    path: outputDir,
    filename: "../server.js",
    assetModuleFilename: prodAssetModuleFilename,
    module: true,
    library: {
      type: "module",
    },
  },
  plugins: [new MiniCssExtractPlugin(), new webpack.optimize.ModuleConcatenationPlugin()],
  experiments: {
    outputModule: true,
  },
};

export default callAndMergeConfigs(commonServerConfig, prodServerConfig);

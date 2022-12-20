// @ts-check
import "dotenv/config";
import "webpack-dev-server";

import MiniCssExtractPlugin from "mini-css-extract-plugin";

import commonClientConfig from "../common/webpack.client.js";
import { clientPublicPath, devDir, WEBPACK_DEV_SERVER_PORT } from "../shared/constants.js";
import convertBoolean from "../utils/bool_conv.js";
import { callAndMergeConfigs } from "../utils/call_and_merge_wp_configs.js";

/** @type {import("webpack").Configuration} */
const devClientConfig = {
  output: {
    publicPath: clientPublicPath,
    path: devDir.build,
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].chunk.js",
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
          // @ts-expect-error
          test: (module) => /node_modules/.test(module.resource),
          enforce: true,
        },
      },
    },
  },
  devtool: convertBoolean(process.env.DEV_SOURCE_MAP) ? "inline-source-map" : undefined,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/css/[name].css",
      chunkFilename: "static/css/[name].chunk.css",
    }),
  ],
  experiments: {
    outputModule: true,
  },
  stats: "errors-warnings",
  infrastructureLogging: {
    level: "error",
  },
  devServer: {
    allowedHosts: "all",
    devMiddleware: {
      publicPath: clientPublicPath,
    },
    static: false,
    compress: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    port: WEBPACK_DEV_SERVER_PORT,
  },
};

export default callAndMergeConfigs(commonClientConfig, devClientConfig);

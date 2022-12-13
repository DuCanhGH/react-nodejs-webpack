// @ts-check
import "dotenv/config";

import MiniCssExtractPlugin from "mini-css-extract-plugin";

import { devDir } from "./constants.js";
import convertBoolean from "./utils/bool_conv.js";
import { callAndMergeConfigs } from "./utils/call_and_merge_wp_configs.js";
import commonClientConfig from "./webpack.common.client.js";

/** @type {import("webpack").Configuration} */
const devClientConfig = {
  mode: "development",
  module: {
    rules: [
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
  output: {
    publicPath: "/",
    path: devDir.build,
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
      filename: "[name].css",
      chunkFilename: "[name].chunk.css",
    }),
  ],
  experiments: {
    outputModule: true,
  },
  stats: "errors-warnings",
};

export default callAndMergeConfigs(commonClientConfig, devClientConfig);

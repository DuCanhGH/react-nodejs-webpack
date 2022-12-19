// @ts-check
import "dotenv/config";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import webpack from "webpack";

import { devDir, prodDir, rootDir, srcDir } from "../shared/constants.js";
import convertBoolean from "../utils/bool_conv.js";
import { callAndMergeConfigs } from "../utils/call_and_merge_wp_configs.js";
import common from "./webpack.shared.js";

/** @type {import("../shared/types").WebpackConfigFunction} */
const serverConfig = async (_, argv) => {
  const isProd = argv.mode === "production";
  const isSourceMapEnabled = convertBoolean(
    isProd ? process.env.PROD_SOURCE_MAP : process.env.DEV_SOURCE_MAP,
  );
  const assetsManifest = isProd ? prodDir.appAssetsManifest : devDir.appAssetsManifest;
  return {
    target: "node16.17",
    name: "server",
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: srcDir,
          use: {
            loader: "swc-loader",
          },
        },
        {
          test: /\.module\.(css|scss|sass)$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                emit: false,
              },
            },
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                modules: true,
                sourceMap: isSourceMapEnabled,
              },
            },
            "postcss-loader",
            {
              loader: "sass-loader",
              options: { sourceMap: isSourceMapEnabled },
            },
          ],
        },
        {
          test: /\.(css|scss|sass)$/i,
          exclude: /\.module\.(css|scss|sass)$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                emit: false,
              },
            },
            "css-loader",
            "postcss-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.(jpg|jpeg|png|gif|mp3|svg|ico)$/,
          type: "asset/resource",
          generator: {
            emit: false,
          },
        },
      ],
    },
    entry: {
      server: path.join(srcDir, "server"),
    },
    externals: {
      express: "express",
    },
    node: {
      __dirname: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.ASSETS_MANIFEST": JSON.stringify(assetsManifest),
        "process.env.PUBLIC_DIR": JSON.stringify(
          path.resolve(rootDir, isProd ? "build/public" : "public"),
        ),
      }),
    ],
    experiments: {
      outputModule: true,
    },
  };
};

export default callAndMergeConfigs(common, serverConfig);
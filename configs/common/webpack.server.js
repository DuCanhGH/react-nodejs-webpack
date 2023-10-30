// @ts-check
import "dotenv/config";

import fs from "fs-extra";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import webpack from "webpack";

import {
  devAppAssetsManifest,
  prodAppPathsManifest,
  rootDir,
  serverEntrypoint,
  srcDir,
  srcServerDir,
} from "../shared/constants.js";
import addPathAliasesToSWC from "../utils/add-path-aliases-to-swc.js";
import convertBoolean from "../utils/bool-conv.js";
import { callAndMergeConfigs } from "../utils/call-and-merge-configs.js";
import readTSConfig from "../utils/read-tsconfig.js";
import common from "./webpack.shared.js";

/** @type {import("../shared/types").WebpackConfigFunction} */
const serverConfig = async (_, argv) => {
  const isProd = argv.mode === "production";
  const isSourceMapEnabled = convertBoolean(
    isProd ? process.env.PROD_SOURCE_MAP : process.env.DEV_SOURCE_MAP,
  );
  const assetsManifest = isProd ? prodAppPathsManifest : devAppAssetsManifest;
  const tsconfig = readTSConfig();
  const swcRc = await fs.readJSON(path.resolve(rootDir, ".swcrc"), "utf-8");
  if (tsconfig && tsconfig.options && tsconfig.options.paths) {
    addPathAliasesToSWC(
      swcRc,
      path.join(rootDir, tsconfig.options.baseUrl ?? "."),
      tsconfig.options.paths,
    );
  }
  return {
    target: "node16.17",
    name: "server",
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: [srcDir, srcServerDir],
          use: {
            loader: "swc-loader",
            options: swcRc,
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
      server: serverEntrypoint,
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
      new webpack.HotModuleReplacementPlugin(),
    ],
    experiments: {
      topLevelAwait: true,
    },
  };
};

export default callAndMergeConfigs(common, serverConfig);

// @ts-check
import "dotenv/config";

import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";

import { clientPublicPath, devDir, prodDir, srcDir } from "../shared/constants.js";
import convertBoolean from "../utils/bool_conv.js";
import { callAndMergeConfigs } from "../utils/call_and_merge_wp_configs.js";
import common from "./webpack.shared.js";

/** @type {import("../shared/types").WebpackConfigFunction} */
const commonClientConfig = (_, argv) => {
  const isProd = argv.mode === "production";
  const isSourceMapEnabled = convertBoolean(
    isProd ? process.env.PROD_SOURCE_MAP : process.env.DEV_SOURCE_MAP,
  );
  return {
    target: "web",
    name: "client",
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: srcDir,
          use: {
            loader: "swc-loader",
            options: {
              jsc: {
                transform: {
                  react: {
                    development: !isProd,
                    refresh: !isProd,
                  },
                },
              },
            },
          },
        },
        {
          test: /\.module\.(css|scss|sass)$/i,
          use: [
            MiniCssExtractPlugin.loader,
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
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"],
        },
        {
          test: /\.(jpg|jpeg|png|gif|mp3|svg|ico)$/,
          type: "asset/resource",
        },
      ],
    },
    entry: {
      client: path.resolve(srcDir, "client"),
    },
    // @ts-expect-error boolean stuff
    plugins: [
      ...[!isProd ? new ReactRefreshPlugin() : false],
      new WebpackManifestPlugin({
        fileName: isProd ? prodDir.appAssetsManifest : devDir.appAssetsManifest,
        writeToFileEmit: true,
        generate: (seed, files) => {
          const entrypoints = new Set();
          /** @type {Set<typeof files[number]>} */
          const noChunkFiles = new Set();
          files.forEach((file) => {
            if (file.isChunk) {
              // @ts-expect-error
              ((file.chunk || {})._groups || []).forEach((/** @type {any} */ group) =>
                entrypoints.add(group),
              );
            } else {
              noChunkFiles.add(file);
            }
          });
          const entries = [...entrypoints];
          /** @type {Record<string, Record<string, string[]>>} */
          const entryArrayManifest = entries.reduce((acc, entry) => {
            const name = (entry.options || {}).name || (entry.runtimeChunk || {}).name || entry.id;
            /** @type {any[]} */
            const allFiles = []
              .concat(
                ...(entry.chunks || []).map(
                  /** @param {any} chunk */
                  (chunk) => {
                    /** @type {string[]} */
                    const returnArr = [];
                    chunk.files.forEach(
                      /** @param {string} path */
                      (path) => !path.startsWith("/.") && returnArr.push(clientPublicPath + path),
                    );
                    return returnArr;
                  },
                ),
              )
              .filter(Boolean);

            const filesByType = allFiles.reduce((types, file) => {
              const fileType = file.slice(file.lastIndexOf(".") + 1);
              types[fileType] = types[fileType] || [];
              types[fileType].push(file);
              return types;
            }, {});
            /** @type {any} */
            const chunkIds = [].concat(
              ...(entry.chunks || []).map(/** @param {any} chunk */ (chunk) => chunk.ids),
            );

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
              if (!file) {
                return types;
              }
              const fileType = file.slice(file.lastIndexOf(".") + 1);
              types[fileType] = types[fileType] || [];
              types[fileType].push(file);
              return types;
            }, {});
          return entryArrayManifest;
        },
      }),
    ].filter(Boolean),
  };
};

export default callAndMergeConfigs(common, commonClientConfig);
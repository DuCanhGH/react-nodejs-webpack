import CompressionPlugin from "compression-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import fs from "fs-extra";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import { WebpackManifestPlugin } from "webpack-manifest-plugin";
import webpackMerge from "webpack-merge";
import WorkboxPlugin from "workbox-webpack-plugin";

import common from "./webpack.common.js";

const { merge } = webpackMerge;
const rootDir = fs.realpathSync(process.cwd());
const buildDir = path.resolve(rootDir, "build");
const srcDir = path.resolve(rootDir, "src");
const appAssetsManifest = path.resolve(buildDir, "assets.json");

process.env.NODE_ENV = "production";

const clientPublicPath = process.env.CLIENT_PUBLIC_PATH || "/";

/**
 * @type {import('webpack').Configuration}
 */
const clientConfig = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.module\.(css|scss|sass)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1, modules: true } },
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(css|scss|sass)$/i,
        exclude: /\.module\.(css|scss|sass)$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"],
      },
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
  target: "web",
  name: "client",
  entry: {
    client: path.resolve(srcDir, "client"),
  },
  output: {
    publicPath: clientPublicPath,
    path: path.resolve(buildDir, "public"),
    filename: "static/js/[name]-[contenthash:8].js",
    chunkFilename: "static/js/[name]-[contenthash:8].chunk.js",
    assetModuleFilename: "static/media/[name].[hash][ext]",
  },
  optimization: {
    minimize: true,
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: "initial",
          name: "vendor",
          test: (module) => /node_modules/.test(module.resource),
          enforce: true,
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
          sourceMap: process.env.SOURCE_MAP ?? true,
        },
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          sourceMap: process.env.SOURCE_MAP || true,
        },
        minify: async (data, inputMap, minimizerOptions) => {
          const CleanCSS = await import("clean-css").then((a) => a.default);
          const [[filename, input]] = Object.entries(data);
          const minifiedCss = await new CleanCSS({ sourceMap: minimizerOptions.sourceMap }).minify({
            [filename]: {
              styles: input,
              sourceMap: inputMap,
            },
          });
          return {
            code: minifiedCss.styles,
            map: minifiedCss.sourceMap ? minifiedCss.sourceMap.toJSON() : "",
            warnings: minifiedCss.warnings,
          };
        },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/css/[name]-[contenthash:8].css",
      chunkFilename: "static/css/[name]-[contenthash:8].chunk.css",
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CompressionPlugin({
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/,
      threshold: 6144,
      minRatio: 0.8,
    }),
    new WebpackManifestPlugin({
      fileName: path.resolve(buildDir, "assets.json"),
      writeToFileEmit: true,
      generate: (seed, files) => {
        const entrypoints = new Set();
        const noChunkFiles = new Set();
        files.forEach((file) => {
          if (file.isChunk) {
            ((file.chunk || {})._groups || []).forEach((group) => entrypoints.add(group));
          } else {
            noChunkFiles.add(file);
          }
        });
        const entries = [...entrypoints];
        const entryArrayManifest = entries.reduce((acc, entry) => {
          const name = (entry.options || {}).name || (entry.runtimeChunk || {}).name || entry.id;
          const allFiles = []
            .concat(
              ...(entry.chunks || []).map((chunk) =>
                chunk.files.map((path) => !path.startsWith("/.") && clientPublicPath + path),
              ),
            )
            .filter(Boolean);

          const filesByType = allFiles.reduce((types, file) => {
            const fileType = file.slice(file.lastIndexOf(".") + 1);
            types[fileType] = types[fileType] || [];
            types[fileType].push(file);
            return types;
          }, {});

          const chunkIds = [].concat(...(entry.chunks || []).map((chunk) => chunk.ids));

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
            const fileType = file.slice(file.lastIndexOf(".") + 1);
            types[fileType] = types[fileType] || [];
            types[fileType].push(file);
            return types;
          }, {});
        return entryArrayManifest;
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(rootDir, "public").replace(/\\/g, "/") + "/**/*",
          to: buildDir,
          context: path.resolve(rootDir, "."),
        },
      ],
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: path.resolve(srcDir, "sw.ts"),
    }),
    new webpack.DefinePlugin({
      "process.env.ASSETS_MANIFEST": JSON.stringify(appAssetsManifest),
      "process.env.PUBLIC_DIR": JSON.stringify(path.resolve(rootDir, "build/public")),
    }),
  ],
};

export default merge(common, clientConfig);

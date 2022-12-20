// @ts-check
import "dotenv/config";

import CompressionPlugin from "compression-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { resolve } from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import WorkboxPlugin from "workbox-webpack-plugin";

import commonClientConfig from "../common/webpack.client.js";
import { prodAssetModuleFilename, prodDir, rootDir, srcDir } from "../shared/constants.js";
import convertBoolean from "../utils/bool_conv.js";
import { callAndMergeConfigs } from "../utils/call_and_merge_wp_configs.js";

const clientPublicPath = process.env.CLIENT_PUBLIC_PATH || "/";

/** @type {import("webpack").Configuration} */
const prodClientConfig = {
  output: {
    publicPath: clientPublicPath,
    path: resolve(prodDir.build, "public"),
    filename: "static/js/[name]-[contenthash:8].js",
    chunkFilename: "static/js/[name]-[contenthash:8].chunk.js",
    assetModuleFilename: prodAssetModuleFilename,
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
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
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
          compress: {
            ecma: 5,
            comparisons: false,
            inline: true,
          },
          mangle: {
            safari10: true,
          },
          sourceMap: convertBoolean(process.env.PROD_SOURCE_MAP) ?? true,
        },
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {},
        minify: async (data, inputMap) => {
          const CleanCSS = (await import("clean-css")).default;
          const [[filename, input]] = Object.entries(data);
          const minifiedCss = new CleanCSS({ sourceMap: false }).minify({
            [filename]: {
              styles: input,
              sourceMap: inputMap,
            },
          });
          return {
            code: minifiedCss.styles,
            // @ts-expect-error
            map: minifiedCss.sourceMap ? minifiedCss.sourceMap.toJSON() : "",
            warnings: minifiedCss.warnings,
          };
        },
      }),
    ],
  },
  devtool: convertBoolean(process.env.PROD_SOURCE_MAP) ? "source-map" : undefined,
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
    new CopyPlugin({
      patterns: [
        {
          from: resolve(rootDir, "public").replace(/\\/g, "/") + "/**/*",
          to: prodDir.build,
          context: resolve(rootDir, "."),
        },
      ],
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: resolve(srcDir, "sw.ts"),
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: convertBoolean(process.env.ANALYZER) ? "static" : "disabled",
      reportFilename: "client.html",
    }),
  ],
};

export default callAndMergeConfigs(commonClientConfig, prodClientConfig);

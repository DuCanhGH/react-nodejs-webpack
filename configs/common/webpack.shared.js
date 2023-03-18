// @ts-check
import webpack from "webpack";

import { devAppAssetsManifest, srcDir } from "../shared/constants.js";

/** @type {import("../shared/types").WebpackConfigFunction} */
const common = async () => ({
  cache: {
    type: "filesystem",
    allowCollectingMemory: true,
    compression: "brotli",
  },
  resolve: {
    modules: ["node_modules", srcDir],
    extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
  },
  plugins: [new webpack.WatchIgnorePlugin({ paths: [devAppAssetsManifest] })],
  optimization: {
    minimizer: [],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          type: "css/mini-extract",
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
});

export default common;

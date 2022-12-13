// @ts-check
import webpack from "webpack";

import { devDir, prodDir, srcDir } from "./constants.js";

/** @type {import("webpack").Configuration} */
const common = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: srcDir,
        use: {
          loader: "swc-loader",
        },
      },
    ],
  },
  resolve: {
    modules: ["node_modules", srcDir],
    extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
  },
  plugins: [
    new webpack.WatchIgnorePlugin({ paths: [prodDir.appAssetsManifest, devDir.appAssetsManifest] }),
  ],
  optimization: {
    minimizer: [],
  },
};

export default common;

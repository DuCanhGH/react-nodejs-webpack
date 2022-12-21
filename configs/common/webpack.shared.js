// @ts-check
import webpack from "webpack";

import { devDir, srcDir } from "../shared/constants.js";

/** @type {import("../shared/types").WebpackConfigFunction} */
const common = async () => ({
  resolve: {
    modules: ["node_modules", srcDir],
    extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
  },
  plugins: [new webpack.WatchIgnorePlugin({ paths: [devDir.appAssetsManifest] })],
  optimization: {
    minimizer: [],
  },
});

export default common;

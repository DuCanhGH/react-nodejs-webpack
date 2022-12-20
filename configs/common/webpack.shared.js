// @ts-check
import webpack from "webpack";

import { devDir, getRoutesList, srcDir } from "../shared/constants.js";

/** @type {import("../shared/types").WebpackConfigFunction} */
const common = async () => ({
  resolve: {
    modules: ["node_modules", srcDir],
    extensions: [".js", ".jsx", ".json", ".tsx", ".ts"],
  },
  plugins: [
    new webpack.WatchIgnorePlugin({ paths: [devDir.appAssetsManifest] }),
    new webpack.DefinePlugin({
      PAGES_MANIFEST: JSON.stringify(await getRoutesList()),
    }),
  ],
  optimization: {
    minimizer: [],
  },
});

export default common;

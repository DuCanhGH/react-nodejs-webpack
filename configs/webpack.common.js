// @ts-check
import fs from "fs-extra";
import path from "path";
import webpack from "webpack";

const rootDir = fs.realpathSync(process.cwd());
const srcDir = path.resolve(rootDir, "src");
const buildDir = path.resolve(rootDir, "build");
export const appAssetsManifest = path.resolve(buildDir, "assets.json");

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
  plugins: [new webpack.WatchIgnorePlugin({ paths: [appAssetsManifest] })],
  optimization: {
    minimizer: [],
  },
};

export default common;

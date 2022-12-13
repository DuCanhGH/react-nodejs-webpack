// @ts-check
import fs from "fs-extra";
import path from "path";

const rootDir = fs.realpathSync(process.cwd());

const __prod_build_dir = path.resolve(rootDir, "build");
const __prod_app_assets_manifest = path.resolve(__prod_build_dir, "assets.json");
const __dev_build_dir = path.resolve(rootDir, "dist");
const __dev_app_assets_manifest = path.resolve(__dev_build_dir, "assets.json");

const srcDir = path.resolve(rootDir, "src");

const prodDir = {
  build: __prod_build_dir,
  appAssetsManifest: __prod_app_assets_manifest,
};
const devDir = {
  build: __dev_build_dir,
  appAssetsManifest: __dev_app_assets_manifest,
};

export { devDir, prodDir, rootDir, srcDir };

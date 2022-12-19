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

const prodAssetModuleFilename = "static/media/[name].[hash][ext]";

const WEBPACK_DEV_SERVER_PORT = +(process.env.WPDS_PORT ?? 9000);

const clientPublicPath = `${
  process.env.NODE_ENV !== "production" ? `http://localhost:${WEBPACK_DEV_SERVER_PORT}` : ""
}${process.env.CLIENT_PUBLIC_PATH ?? "/"}`;

export {
  clientPublicPath,
  devDir,
  prodAssetModuleFilename,
  prodDir,
  rootDir,
  srcDir,
  WEBPACK_DEV_SERVER_PORT,
};

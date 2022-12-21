// @ts-check
import fs from "fs-extra";
import { resolve } from "path";

const rootDir = fs.realpathSync(process.cwd());

const __prod_build_dir = resolve(rootDir, "build");
const __prod_app_assets_manifest = resolve(__prod_build_dir, "assets.json");
const __dev_build_dir = resolve(rootDir, "dist");
const __dev_app_assets_manifest = resolve(__dev_build_dir, "assets.json");

const srcDir = resolve(rootDir, "src");
const srcServerDir = resolve(rootDir, "server");

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

const serverEntrypoint = resolve(srcServerDir, "index");
const clientEntrypoint = resolve(srcDir, "client");

export {
  clientEntrypoint,
  clientPublicPath,
  devDir,
  prodAssetModuleFilename,
  prodDir,
  rootDir,
  serverEntrypoint,
  srcDir,
  srcServerDir,
  WEBPACK_DEV_SERVER_PORT,
};

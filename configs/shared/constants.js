// @ts-check
import fs from "fs-extra";
import path from "path";

const rootDir = fs.realpathSync(process.cwd());

const prodBuildDir = path.resolve(rootDir, "build");
const prodAppPathsManifest = path.resolve(prodBuildDir, "assets.json");

const devBuildDir = path.resolve(rootDir, "dist");
const devAppAssetsManifest = path.resolve(devBuildDir, "assets.json");

const srcDir = path.resolve(rootDir, "src");
const srcServerDir = path.resolve(rootDir, "server");

const prodAssetModuleFilename = "static/media/[name].[hash][ext]";

const WEBPACK_DEV_SERVER_PORT = +(process.env.WPDS_PORT ?? 9000);

const clientPublicPath = `${
  process.env.NODE_ENV !== "production" ? `http://localhost:${WEBPACK_DEV_SERVER_PORT}` : ""
}${process.env.CLIENT_PUBLIC_PATH ?? "/"}`;

const serverEntrypoint = path.resolve(srcServerDir, "index");
const clientEntrypoint = path.resolve(srcDir, "client");

const FILE_TYPES = /** @type {const} */ (["page", "layout", "error", "loader", "loading"]);

const JS_EXTS = /** @type {const} */ ([".js", ".ts", ".jsx", ".tsx"]);

const ROUTES_LIST_FILE = "routes-list.json";

export {
  clientEntrypoint,
  clientPublicPath,
  devAppAssetsManifest,
  devBuildDir,
  FILE_TYPES,
  JS_EXTS,
  prodAppPathsManifest,
  prodAssetModuleFilename,
  prodBuildDir,
  rootDir,
  ROUTES_LIST_FILE,
  serverEntrypoint,
  srcDir,
  srcServerDir,
  WEBPACK_DEV_SERVER_PORT,
};

// @ts-check
import fs from "fs-extra";
import path from "path";
import webpack from "webpack";

import { FILE_TYPES, JS_EXTS, ROUTES_LIST_FILE, srcDir } from "../shared/constants.js";
import { getDirectories } from "../utils/get-directories.js";

const pagesDir = path.join(srcDir, "pages");

/** @typedef {import("../../src/shared/types.js").PagesManifest} PagesManifest */

/**
 * @param {string} filepath
 * @returns
 */
const convertToForwardSlash = (filepath) => filepath.replace(/\\/g, "/");

/**
 * @param {string} filepath
 * @returns
 */
const ensureLeadingSlash = (filepath) => (filepath.startsWith("/") ? filepath : `/${filepath}`);

/**
 * @param {string} filepath
 * @returns
 */
const ensureTrailingSlash = (filepath) => (filepath.endsWith("/") ? filepath : `${filepath}/`);

/**
 * @param {string} filename
 * @returns
 */
const convertFileToReactRouterPath = (filename) =>
  filename.replace(/\[\.{3}.+\]/, "*").replace(/\[(.+)\]/, ":$1");

export class RoutesListPlugin {
  /** @param {{ isProd: boolean }} param */
  constructor({ isProd }) {
    this.isProd = isProd;
  }
  /**
   * @param {string} routePath
   * @returns {Promise<PagesManifest>}
   */
  async getRoutesList(routePath) {
    const pathDir = path.relative(pagesDir, routePath);
    const isRoot = !pathDir.length;
    const resolvedPath = ensureLeadingSlash(convertToForwardSlash(pathDir));
    const lastRouteSegment = isRoot ? "/" : resolvedPath.slice(resolvedPath.lastIndexOf("/") + 1);

    const baseImportPaths = `./pages${ensureTrailingSlash(resolvedPath)}`;
    /** @type {PagesManifest["importPaths"]} */
    const importPaths = {};

    for (const fileType of FILE_TYPES) {
      for (const extension of JS_EXTS) {
        if (fs.existsSync(path.join(srcDir, baseImportPaths, `${fileType}${extension}`))) {
          importPaths[fileType] = `${baseImportPaths}${fileType}`;
        }
      }
    }

    return {
      path: convertFileToReactRouterPath(lastRouteSegment),
      // this should be relative to src/routes.js
      importPaths,
      children: await Promise.all(
        (await getDirectories(routePath)).map((a) => this.getRoutesList(path.join(routePath, a))),
      ),
    };
  }
  /** @param {import("webpack").Compiler} compiler */
  apply(compiler) {
    compiler.hooks.make.tap("RoutesListPlugin", (compilation) => {
      const assetDirRelative = this.isProd ? "../" : "./";
      compilation.hooks.processAssets.tapPromise(
        {
          name: "RoutesListPlugin",
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        async (assets) => {
          const assetPath = assetDirRelative + convertToForwardSlash(ROUTES_LIST_FILE);
          assets[assetPath] = new webpack.sources.RawSource(
            JSON.stringify(await this.getRoutesList(pagesDir)),
          );
        },
      );
    });
  }
}

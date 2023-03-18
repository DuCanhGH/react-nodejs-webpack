import type express from "express";
import fs, { type PathLike } from "fs-extra";
import path from "path";

import { getRoutes } from "../src/routes";
import type { AssetsManifest, PagesManifest } from "../src/types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const handleErrors = <T>(fn: (req: express.Request, res: express.Response) => T | Promise<T>) => {
  return async function (req: express.Request, res: express.Response) {
    try {
      return await fn(req, res);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send(
          process.env.NODE_ENV === "production"
            ? "Internal server error."
            : `An error occurred: ${error}`,
        );
    }
  };
};

const createFetchHeaders = (requestHeaders: express.Request["headers"]): Headers => {
  const headers = new Headers();

  for (const [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }

  return headers;
};

const createFetchRequest = (req: express.Request): Request => {
  const origin = `${req.protocol}://${req.get("host")}`;
  const url = new URL(req.originalUrl || req.url, origin);
  const controller = new AbortController();

  req.on("close", () => {
    controller.abort();
  });

  const init: RequestInit = {
    method: req.method,
    headers: createFetchHeaders(req.headers),
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  return new Request(url.href, init);
};

const jsScriptTagsFromAssets = (assets: AssetsManifest, entrypoint: string, key = "js") => {
  return assets[entrypoint]
    ? assets[entrypoint][key] && typeof assets[entrypoint][key] === "object"
      ? assets[entrypoint][key].filter((a) => !a.endsWith(`.hot-update.${key}`))
      : []
    : [];
};

const rootDir = fs.realpathSync(process.cwd());

const pagesDir = path.join(rootDir, "src/pages");

const getDirectories = async (source: PathLike) =>
  (await fs.readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const convertToForwardSlash = (filepath: string) => filepath.replace(/\\/g, "/");

const ensureLeadingSlash = (filepath: string) =>
  filepath.startsWith("/") ? filepath : `/${filepath}`;

const ensureTrailingSlash = (filepath: string) =>
  filepath.endsWith("/") ? filepath : `${filepath}/`;

const convertFileToReactRouterPath = (filename: string) =>
  filename.replace(/\[\.{3}.+\]/, "*").replace(/\[(.+)\]/, ":$1");

const getRoutesList = async (routePath = pagesDir): Promise<PagesManifest> => {
  const pathDir = path.relative(pagesDir, routePath);
  const isRoot = !pathDir.length;
  const resolvedPath = ensureLeadingSlash(convertToForwardSlash(pathDir));
  const lastRouteSegment = isRoot ? "/" : resolvedPath.slice(resolvedPath.lastIndexOf("/") + 1);

  return {
    path: convertFileToReactRouterPath(lastRouteSegment),
    // this should be relative to src/routes.js
    importPath: `./pages${ensureTrailingSlash(resolvedPath)}`,
    children: await Promise.all(
      (await getDirectories(routePath)).map((a) => getRoutesList(path.join(routePath, a))),
    ),
  };
};

const loadAssetsAndRoutes = async () => {
  let assets: AssetsManifest | undefined;
  const pagesManifest = await getRoutesList();
  const routes = await getRoutes(pagesManifest);
  if (!process.env.ASSETS_MANIFEST) {
    throw new Error(
      "Environment variable ASSETS_MANIFEST not found. There may be a bug in your config.",
    );
  }
  while (!assets) {
    if (!(await fs.pathExists(process.env.ASSETS_MANIFEST))) {
      console.warn("Haven't found assets.json yet, waiting...");
      await delay(5000);
      continue;
    }
    assets = await fs.readJSON(process.env.ASSETS_MANIFEST);
  }
  return {
    assets,
    pagesManifest,
    routes,
  };
};

export {
  convertToForwardSlash,
  createFetchHeaders,
  createFetchRequest,
  delay,
  getRoutesList,
  handleErrors,
  jsScriptTagsFromAssets,
  loadAssetsAndRoutes,
};

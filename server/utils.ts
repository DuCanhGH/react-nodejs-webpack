import type express from "express";
import fs, { type PathLike } from "fs-extra";
import { join, normalize, relative, sep } from "path";

import type { PagesManifest } from "../src/types";

const rootDir = fs.realpathSync(process.cwd());

const pagesDir = normalize("src/pages");

const getDirectories = async (source: PathLike) =>
  (await fs.readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const convertToForwardSlash = (filepath: string) => filepath.split(sep).join("/");

const getRoutesList = async (srcPath = pagesDir): Promise<PagesManifest> => {
  return {
    path: convertToForwardSlash(relative(pagesDir, srcPath)),
    children: await Promise.all(
      (await getDirectories(join(rootDir, srcPath))).map((a) => getRoutesList(join(srcPath, a))),
    ),
  };
};

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

export {
  convertToForwardSlash,
  createFetchHeaders,
  createFetchRequest,
  getDirectories,
  getRoutesList,
  handleErrors,
};

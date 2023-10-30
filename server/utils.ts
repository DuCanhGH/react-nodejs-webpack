import type express from "express";
import fs from "fs-extra";

import type { AssetsManifest } from "../src/shared/types";

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

  req.on("close", () => controller.abort());

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

const loadAssetsAndRoutes = async () => {
  let assets: AssetsManifest | undefined;

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
  };
};

export {
  createFetchHeaders,
  createFetchRequest,
  delay,
  handleErrors,
  jsScriptTagsFromAssets,
  loadAssetsAndRoutes,
};

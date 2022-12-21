import "dotenv/config";

import { installGlobals } from "@remix-run/node";
import { unstable_createStaticHandler as createStaticHandler } from "@remix-run/router";
import compression from "compression";
import express from "express";
import fs from "fs-extra";
import { createServer } from "http";
import { renderToPipeableStream } from "react-dom/server";
import {
  unstable_createStaticRouter as createStaticRouter,
  unstable_StaticRouterProvider as StaticRouterProvider,
} from "react-router-dom/server";

import { getRoutes } from "../src/routes";
import type { AssetsManifest, PagesManifest } from "../src/types";
import ServerHTML from "./serverHtml";

// supplied by Webpack's definePlugin
declare const PAGES_MANIFEST: PagesManifest;

const routes = await getRoutes(PAGES_MANIFEST ?? []);

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let assets: AssetsManifest;

const syncLoadAssets = async () => {
  if (!process.env.ASSETS_MANIFEST) {
    throw new Error(
      "Environment variable ASSETS_MANIFEST not specified. There may have been a bug in your config.",
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
};

installGlobals();
syncLoadAssets();

const jsScriptTagsFromAssets = (assets: AssetsManifest, entrypoint: string, key = "js") => {
  return assets[entrypoint]
    ? assets[entrypoint][key] && typeof assets[entrypoint][key] === "object"
      ? assets[entrypoint][key].filter((a) => !a.endsWith(`.hot-update.${key}`))
      : []
    : [];
};

const renderApp = async (req: express.Request, res: express.Response) => {
  const { query } = createStaticHandler(routes);
  const remixRequest = createFetchRequest(req);
  const context = await query(remixRequest);
  if (context instanceof Response) {
    throw context;
  }
  const router = createStaticRouter(routes, context);
  const { pipe, abort } = renderToPipeableStream(
    <ServerHTML assets={assets}>
      <StaticRouterProvider router={router} context={context} />
    </ServerHTML>,
    {
      bootstrapScripts: jsScriptTagsFromAssets(assets, "client"),
      bootstrapModules: jsScriptTagsFromAssets(assets, "client", "mjs"),
      onError(error) {
        console.error(error);
      },
      onShellError() {
        res.statusCode = 500;
        res.setHeader("content-type", "text/html; charset=UTF-8");
        res.send("<h1>Something went wrong</h1>");
      },
      onShellReady() {
        res.statusCode = 200;
        res.setHeader("content-type", "text/html; charset=UTF-8");
        pipe(res);
      },
    },
  );
  setTimeout(() => {
    abort();
  }, 10000);
};

const app = express();

app.use(compression());

app.use(express.static(process.env.PUBLIC_DIR ?? "public"));

app.get("/api", (_req, res) => {
  res.status(404).json({ message: "hehe", err: true });
});

app.get("*", handleErrors(renderApp));

const port = process.env.PORT || 3000;

const httpServer = createServer(app);

httpServer.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
});

function handleErrors<T>(fn: (req: express.Request, res: express.Response) => T | Promise<T>) {
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
}

function createFetchHeaders(requestHeaders: express.Request["headers"]): Headers {
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
}

function createFetchRequest(req: express.Request): Request {
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
}

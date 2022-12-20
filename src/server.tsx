import "dotenv/config";

import { installGlobals } from "@remix-run/node";
import { unstable_createStaticHandler as createStaticHandler } from "@remix-run/router";
import { html } from "common-tags";
import compression from "compression";
import express from "express";
import fs from "fs-extra";
import { createServer } from "http";
import { renderToPipeableStream } from "react-dom/server";
import {
  unstable_createStaticRouter as createStaticRouter,
  unstable_StaticRouterProvider as StaticRouterProvider,
} from "react-router-dom/server";

import { routes } from "./routes";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

type AssetsManifest = Record<string, Record<string, string[]>>;

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

const cssLinksFromAssets = (assets: AssetsManifest, entrypoint: string) => {
  return assets[entrypoint]
    ? assets[entrypoint].css && typeof assets[entrypoint].css === "object"
      ? assets[entrypoint].css
          .map((asset: string) => html`<link rel="stylesheet" href="${asset}">`)
          .join("")
      : ""
    : "";
};

const jsScriptTagsFromAssets = (assets: AssetsManifest, entrypoint: string, extra = "") => {
  return assets[entrypoint]
    ? assets[entrypoint].js && typeof assets[entrypoint].js === "object"
      ? assets[entrypoint].js.map(
          (asset: string) =>
            html`<script src=${asset} ${
              process.env.NODE_ENV !== "production" ? 'type="module"' : ""
            } ${extra}></script>`,
        )
      : ""
    : "";
};

const renderApp = async (req: express.Request, res: express.Response) => {
  let didError: boolean;
  let error: unknown;
  const { query } = createStaticHandler(routes);
  const remixRequest = createFetchRequest(req);
  const context = await query(remixRequest);
  if (context instanceof Response) {
    throw context;
  }
  const router = createStaticRouter(routes, context);
  const { pipe, abort } = renderToPipeableStream(
    <div id="root">
      <StaticRouterProvider router={router} context={context} />
    </div>,
    {
      onShellError(x: unknown) {
        didError = true;
        error = x;
      },
      onShellReady() {
        res.statusCode = didError ? 500 : 200;
        if (didError) {
          console.error(error);
          return res.send(
            process.env.NODE_ENV === "production"
              ? "Internal server error."
              : `An error occurred: ${error}`,
          );
        }
        res.setHeader("Content-type", "text/html; charset=UTF-8");
        res.write(html`<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta name="description" content="A template. A React app." />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/logo192.png" />
                <link rel="manifest" href="/manifest.json" />
                <title>React App</title>
                ${cssLinksFromAssets(assets, "client")}
              </head>
              <body>`);
        pipe(res);
        res.write(
          html`${jsScriptTagsFromAssets(assets, "client", "defer crossorigin")}</body></html>`,
        );
      },
    },
  );
  setTimeout(abort, 60000);
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

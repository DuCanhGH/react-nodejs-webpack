import "dotenv/config";

import { html } from "common-tags";
import compression from "compression";
import express from "express";
import fs from "fs-extra";
import { createServer } from "http";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

import App from "./App";

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

const renderApp = (req: express.Request, res: express.Response) => {
  let didError: boolean;
  let error: unknown;
  const { pipe, abort } = renderToPipeableStream(
    <div id="root">
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
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

function handleErrors(fn: (req: express.Request, res: express.Response) => void) {
  return async function (req: express.Request, res: express.Response) {
    try {
      return fn(req, res);
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

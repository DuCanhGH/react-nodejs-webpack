import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import Dak2 from "App";
import "dotenv/config";
import { createServer } from "http";
import fs from "fs-extra";
import compression from "compression";
import { html } from "common-tags";
import { ReactElement } from "react";

let assets: string[];

const syncLoadAssets = () => {
  if (!process.env.ASSETS_MANIFEST) {
    throw new Error("Environment variable ASSETS_MANIFEST not specified.");
  }
  if (fs.existsSync(process.env.ASSETS_MANIFEST)) {
    assets = require(process.env.ASSETS_MANIFEST);
  }
};

syncLoadAssets();

const cssLinksFromAssets = (assets: Record<string, any>, entrypoint: string) => {
  return assets[entrypoint]
    ? assets[entrypoint].css && typeof assets[entrypoint].css === "object"
      ? assets[entrypoint].css
          .map((asset: string) => `<link rel="stylesheet" href="${asset}">`)
          .join("")
      : ""
    : "";
};

const jsScriptTagsFromAssets = (assets: Record<string, any>, entrypoint: string): ReactElement => {
  return assets[entrypoint] ? (
    assets[entrypoint].js && typeof assets[entrypoint].js === "object" ? (
      assets[entrypoint].js.map((asset: string) => (
        <script src={asset} key={`asset-scripts-${asset}`}></script>
      ))
    ) : (
      <></>
    )
  ) : (
    <></>
  );
};

const renderApp = (req: express.Request, res: express.Response) => {
  let didError: boolean;
  let error: unknown;
  const { pipe, abort } = renderToPipeableStream(
    <div id="root">
      <StaticRouter location={req.url}>
        <Dak2 />
      </StaticRouter>
      {jsScriptTagsFromAssets(assets, "client")}
    </div>,
    {
      onShellError(x: unknown) {
        didError = true;
        error = x;
      },
      onShellReady() {
        res.statusCode = didError ? 500 : 200;
        if (didError && error) {
          return res.status(500).send(error);
        } else {
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
          res.write(html`</body></html>`);
        }
      },
    },
  );
  setTimeout(abort, 60000);
};

function handleErrors(fn: (req: express.Request, res: express.Response) => void) {
  return async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      return fn(req, res);
    } catch (x) {
      next(x);
    }
  };
}

const app = express();

app.use(compression());

if (process.env.NODE_ENV !== "production") {
  app.use(express.static("dist"));
}

app.use(express.static(process.env.PUBLIC_DIR ?? "public"));

app.get("/api", (req: express.Request, res: express.Response) => {
  res.status(404).json({ message: "hehe", err: true });
});

app.get(
  "*",
  handleErrors(function (req: express.Request, res: express.Response) {
    renderApp(req, res);
  }),
);

const port = process.env.PORT || 3000;

const httpServer = createServer(app);

httpServer.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
});

import "dotenv/config";

import { installGlobals } from "@remix-run/node";
import { createStaticHandler } from "@remix-run/router";
import compression from "compression";
import express from "express";
import { createServer } from "http";
import { renderToPipeableStream } from "react-dom/server";
import { createStaticRouter, StaticRouterProvider } from "react-router-dom/server";

import ServerHTML from "./serverHtml";
import {
  createFetchRequest,
  handleErrors,
  jsScriptTagsFromAssets,
  loadAssetsAndRoutes,
} from "./utils";

installGlobals();

const { assets, pagesManifest, routes } = await loadAssetsAndRoutes();

const renderApp = async (req: express.Request, res: express.Response) => {
  const { query } = createStaticHandler(routes);
  const remixRequest = createFetchRequest(req);
  const context = await query(remixRequest);
  if (context instanceof Response) {
    throw context;
  }
  const router = createStaticRouter(routes, context);
  const { pipe, abort } = renderToPipeableStream(
    <ServerHTML assets={assets} pagesManifest={JSON.stringify(pagesManifest)}>
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

import "dotenv/config";

import { installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router-dom/server";

import { routes } from "../src/routes";
import ServerHTML from "./serverHtml";
import {
  createFetchRequest,
  handleErrors,
  jsScriptTagsFromAssets,
  loadAssetsAndRoutes,
} from "./utils";
installGlobals();

const handler = createStaticHandler(routes);

const { assets } = await loadAssetsAndRoutes();

const renderApp = async (req: express.Request, res: express.Response) => {
  const remixRequest = createFetchRequest(req);
  const context = await handler.query(remixRequest);

  if (context instanceof Response) {
    throw context;
  }

  const router = createStaticRouter(handler.dataRoutes, context);

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
        res.send(renderToStaticMarkup(<h1>Something went wrong</h1>));
      },
      onShellReady() {
        res.statusCode = 200;
        res.setHeader("content-type", "text/html; charset=UTF-8");
        pipe(res);
      },
    },
  );
  setTimeout(abort, 100000);
};

const app = express();

app.use(compression());

app.use(express.static(process.env.PUBLIC_DIR ?? "public"));

app.get("/api", (_req, res) => {
  res.status(404).json({ message: "Hello world!", err: true });
});

app.get("*", handleErrors(renderApp));

export { app };

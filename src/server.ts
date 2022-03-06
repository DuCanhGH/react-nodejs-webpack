import express from "express";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import Dak2 from "App";
import React from "react";
import "dotenv/config";
import { createServer } from "http";
import fs from "fs-extra";

let assets: any;

const syncLoadAssets = () => {
    if (fs.existsSync(process.env.ASSETS_MANIFEST!)) {
        assets = require(process.env.ASSETS_MANIFEST!);
    }
};

syncLoadAssets();

process.on('unhandledRejection', err => {
    console.clear();
    console.error('Unexpected error', err);
    process.exit(1);
});

const cssLinksFromAssets = (assets: Record<string, any>, entrypoint: string) => {
    return assets[entrypoint] ? assets[entrypoint].css && typeof assets[entrypoint].css === "object" ?
        assets[entrypoint].css.map((asset: string) =>
            `<link rel="stylesheet" href="${asset}">`
        ).join('') : '' : '';
};

const jsScriptTagsFromAssets = (assets: Record<string, any>, entrypoint: string) => {
    return assets[entrypoint] ? assets[entrypoint].js && typeof assets[entrypoint].js === "object" ?
        assets[entrypoint].js.map((asset: string) =>
            `<script src="${asset}"></script>`
        ).join('') : '' : '';
};

//temporary fix to wait for @types/react-dom to update.
declare module 'react-dom/server' {
    function renderToPipeableStream(a: React.ReactElement, b: any): any
};

const renderApp = (req: express.Request, res: express.Response) => {
    const app = React.createElement(StaticRouter, {
        location: req.url
    }, React.createElement(Dak2, null));
    let didError: boolean;
    let error: unknown;
    const { pipe, abort } = ReactDOMServer.renderToPipeableStream(app,
        {
            onError(x: unknown) {
                didError = true;
                error = x;
            },
            async onCompleteShell() {
                res.statusCode = didError ? 500 : 200;
                if (didError && error) {
                    return res.status(500).send(error);
                }
                else {
                    res.setHeader("Content-type", "text/html; charset=UTF-8");
                    res.write(`<!DOCTYPE html><html><head><title>This is a template.</title>${cssLinksFromAssets(assets, 'client')}</head><body><div id="root">`);
                    pipe(res);
                    res.write(`</div>${jsScriptTagsFromAssets(assets, 'client')}</body></html>`);
                }
            }
        }
    );
    setTimeout(abort, 60000);
};

function handleErrors(fn: any) {
    return async function (req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            return await fn(req, res);
        }
        catch (x) {
            next(x);
        }
    };
};

const app = express();

app.use(express.static(process.env.PUBLIC_DIR ?? 'public'));

app.get("/api", (req: express.Request, res: express.Response) => {
    res.status(404).json({ message: "hehe", err: true })
});

app.get("*", handleErrors(async function (req: express.Request, res: express.Response) {
    renderApp(req, res);
}));

const port = process.env.PORT || 3000;

const httpServer = createServer(app);

httpServer.listen(port, () => {
    console.log(`🚀 Server started on port ${port}`);
});                       

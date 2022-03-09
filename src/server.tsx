import express from "express";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import Dak2 from "App";
import React from "react";
import "dotenv/config";
import { createServer } from "http";
import fs from "fs-extra";
import compression from 'compression';

let assets: any;
const syncLoadAssets = () => {
    if (fs.existsSync(process.env.ASSETS_MANIFEST!)) {
        assets = require(process.env.ASSETS_MANIFEST!);
    }
};

syncLoadAssets();

interface ErrnoException extends Error {
    errno?: number;
    code?: string;
    path?: string;
    syscall?: string;
    stack?: string;
}

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
    let didError: boolean;
    let error: unknown;
    const { pipe, abort } = ReactDOMServer.renderToPipeableStream(
        <StaticRouter location={req.url}>
            <Dak2 />
        </StaticRouter>,
        {
            onShellError(x: unknown) {
                didError = true;
                error = x;
            },
            onShellReady() {
                res.statusCode = didError ? 500 : 200;
                if (didError && error) {
                    return res.status(500).send(error);
                }
                else {
                    res.setHeader("Content-type", "text/html; charset=UTF-8");
                    res.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="utf-8" />
                        <link rel="icon" href="/favicon.ico" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <meta name="theme-color" content="#000000" />
                        <meta
                        name="description"
                        content="A template. A React app."
                        />
                        <link rel="apple-touch-icon" href="/logo192.png" />
                        <title>React App</title>
                        ${cssLinksFromAssets(assets, 'client')}
                    </head><body><div id="root">`);
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

app.use(compression());

if (process.env.NODE_ENV !== "production") {
    app.use(express.static("dist"));
};

app.use(express.static(process.env.PUBLIC_DIR ?? "public"));

app.get("/api", (req: express.Request, res: express.Response) => {
    res.status(404).json({ message: "hehe", err: true })
});

app.get("*", handleErrors(async function (req: express.Request, res: express.Response) {
    renderApp(req, res);
}));

const port = process.env.PORT || 3000;

const httpServer = createServer(app);

httpServer.once('error', function (err: ErrnoException) {
    console.error(err.message);
    process.exit(1);
});

httpServer.listen(port, () => {
    console.log(`🚀 Server started on port ${port}`);
});
 
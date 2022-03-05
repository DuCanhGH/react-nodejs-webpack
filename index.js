const React = require("react");
const express = require("express");
const ReactDOMServer = require("react-dom/server");
const { StaticRouter } = require("react-router-dom/server");
const { Dak2 } = require("./src/App");
require("dotenv/config");
const { createServer } = require("http");
import path from "path";

const jsScriptTagsFromAssets = (assets,) => {
    return assets ? assets.map(asset =>
        `<script src="${asset}"></script>`
    ).join('') : '';
};

const renderApp = (req, res) => {
    const app = React.createElement(StaticRouter, {
        location: req.url
    }, React.createElement(Dak2, null));
    let didError;
    let error;
    const scripts = ['vendor.js', 'client.js'];
    const { pipe, abort } = ReactDOMServer.renderToPipeableStream(app,
        {
            onError(x) {
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
                    res.write(`<!DOCTYPE html><html><head><title>Dak</title></head><body><div id="root">`);
                    pipe(res);
                    res.write(`</div>${jsScriptTagsFromAssets(scripts)}</body></html>`);
                }
            }
        }
    );
    setTimeout(abort, 60000);
};

function handleErrors(fn) {
    return async function (req, res, next) {
        try {
            return await fn(req, res);
        }
        catch (x) {
            next(x);
        }
    };
};

const app = express();

app.use(express.static(path.join(__dirname)));

app.get("/api", (req, res) => {
    res.status(404).json({ message: "fuck you", err: true })
});

app.get("*", handleErrors(async function (req, res) {
    renderApp(req, res);
}));

const port = process.env.PORT | 3000;

const server = express().use((req, res) => app.handle(req, res));

const httpServer = createServer(server);

httpServer.listen(port, () => {
    console.log(`🚀 Server started on port ${port}`);
});

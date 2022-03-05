const React = require("react");
const express = require("express");
const ReactDOMServer = require("react-dom/server");
const { StaticRouter } = require("react-router-dom/server");
const { Dak2 } = require("./src/App");
require("dotenv/config");
const { createServer } = require("http");

const renderApp = (req, res) => {
    const app = React.createElement(StaticRouter, {
        location: req.url
    }, React.createElement(Dak2, null));
    const markup = ReactDOMServer.renderToString(app);
    return { markup };
};

const app = express();

app.get("/api", (req, res) => {
    res.status(404).json({ message: "fuck you", err: true })
});

app.get("*", (req, res) => {
    const { markup } = renderApp(req, res);
    res.status(200).send(`
    <!DOCTYPE html>
    <html>
        <head>
            <title>This shit is dumb</title>
        </head>
        <body>
            <div id="root">
                ${markup}
            </div>
        </body>
    </html>
    `);
});

const port = process.env.PORT | 3000;

const server = express().use((req, res) => app.handle(req, res));

const httpServer = createServer(server);

httpServer.listen(port, () => {
    console.log(`🚀 Server started on port ${port}`);
});

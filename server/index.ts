import { createServer } from "http";

import { app } from "./server";

const port = process.env.PORT || "5173";

const httpServer = createServer(app);

httpServer.listen(port, () => {
  console.log(`🚀 Server started on port ${port}!`);
});

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept("./server", () => {
    console.log(`🚀 Server reloaded!`);
  });
}

const gracefulShutdown = (signal: NodeJS.Signals) => {
  console.log(`🚀 ${signal} received, closing server...`);
  httpServer.close(() => {
    console.log("🚀 Server closed.");
  });
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

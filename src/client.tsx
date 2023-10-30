import "./app.css";

import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, matchRoutes, RouterProvider } from "react-router-dom";

import { routes } from "./routes";

const container = document.getElementById("root"); //HTML template must have an element that uses the id `root`.
const isDev = process.env.NODE_ENV !== "production";

if (!container) throw new Error("Failed to find the root element");

if (!isDev && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("SW registered.");
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

const lazyMatches = matchRoutes(routes, window.location)?.filter((m) => !!m.route.lazy);

(async () => {
  // Load the lazy matches and update the routes before creating your router
  // so we can hydrate the SSR-rendered content synchronously
  if (!!lazyMatches && lazyMatches.length > 0) {
    await Promise.all(
      lazyMatches.map(async (m) => {
        const routeModule = await m.route.lazy?.();
        Object.assign(m.route, {
          ...routeModule,
          lazy: undefined,
        });
        console.log(m);
      }),
    );
  }

  const router = createBrowserRouter(routes);

  hydrateRoot(
    container,
    <StrictMode>
      <RouterProvider router={router} fallbackElement={null} />
    </StrictMode>,
  );
})();

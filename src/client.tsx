import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { getRoutes } from "./routes";
import { PAGES_MANIFEST_SCRIPT_ID } from "./shared/constants";
import type { PagesManifest } from "./types";

declare global {
  interface Window {
    PAGES_MANIFEST: PagesManifest;
  }
}

const container = document.getElementById("root"); //HTML template must have an element that uses this id `root`.
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

const routes = await getRoutes(window.PAGES_MANIFEST ?? []);

document.getElementById(PAGES_MANIFEST_SCRIPT_ID)?.remove();

const router = createBrowserRouter([routes]);

hydrateRoot(
  container,
  <StrictMode>
    <RouterProvider router={router} fallbackElement={null} />
  </StrictMode>,
);

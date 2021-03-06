import { hydrateRoot } from "react-dom/client";
import Dak2 from "App";
import { BrowserRouter } from "react-router-dom";
import { StrictMode } from "react";

const container = document.getElementById("root"); //HTML template must have an element that uses this id: root.

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

hydrateRoot(
  container,
  <StrictMode>
    <BrowserRouter>
      <Dak2 />
    </BrowserRouter>
  </StrictMode>,
);

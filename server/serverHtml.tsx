import type { ReactNode } from "react";

import type { AssetsManifest } from "../src/types";

const cssLinksFromAssets = (assets: AssetsManifest, entrypoint: string) => {
  return assets[entrypoint] ? (
    assets[entrypoint].css && typeof assets[entrypoint].css === "object" ? (
      assets[entrypoint].css.map((asset) => (
        <link
          rel="stylesheet"
          type="text/css"
          href={asset}
          key={`css-links-client-${encodeURIComponent(asset)}`}
        />
      ))
    ) : (
      <></>
    )
  ) : (
    <></>
  );
};

const ServerHTML = ({ assets, children }: { assets: AssetsManifest; children: ReactNode }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="description" content="A template. A React app." />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/logo192.png" />
      <link rel="manifest" href="/manifest.json" />
      <title>React App</title>
      {cssLinksFromAssets(assets, "client")}
    </head>
    <body>
      <div id="root">{children}</div>
    </body>
  </html>
);

export default ServerHTML;

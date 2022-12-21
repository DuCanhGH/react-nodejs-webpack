import { CacheableResponsePlugin } from "workbox-cacheable-response";
import type { HandlerCallbackOptions } from "workbox-core";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

registerRoute(
  ({ url, sameOrigin }) => {
    const match = url.pathname.match(/(.*)\.(jpe?g|png|woff2?|svg|json)$/);
    return sameOrigin && match && match.length > 0;
  },
  new StaleWhileRevalidate({
    cacheName: "images-fonts-jsonfiles",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

const navigationHandler = async (params: FetchEvent | HandlerCallbackOptions) => {
  return await new NetworkFirst().handle(params);
};

registerRoute(new NavigationRoute(navigationHandler));

self.skipWaiting();
clientsClaim();

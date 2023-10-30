import type { RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
  {
    path: "/",
    lazy: () => import("./pages/layout"),
    children: [
      {
        path: "about",
        lazy: () => import("./pages/about/page"),
      },
      {
        path: "home",
        children: [
          {
            path: ":hoho",
            lazy: () => import("./pages/home/[hoho]/page"),
          },
          {
            path: "hehe",
            lazy: () => import("./pages/home/hehe/page"),
          },
          {
            index: true,
            async loader() {
              const loader = (await import("./pages/home/loader")).default;
              return loader();
            },
            lazy: () => import("./pages/home/page"),
          },
        ],
      },
      {
        index: true,
        lazy: () => import("./pages/page"),
      },
    ],
  },
];

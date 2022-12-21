import type { ReactNode } from "react";
import { createElement, lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";
import type { Entries, StringKeyOf } from "type-fest";

import RootLayout from "./pages/layout";
import type { PagesManifest } from "./types";

type MapRouteObjectToFile = Partial<
  Record<
    keyof RouteObject,
    {
      filename: string;
      shouldBeReactElement?: boolean;
    }
  >
>;

const mapROKeyToFilename: MapRouteObjectToFile = {
  errorElement: {
    filename: "error",
    shouldBeReactElement: true,
  },
};

const convertFilenameToRRPath = (filename: string) =>
  filename.replace(/\[\.{3}.+\]/, "*").replace(/\[(.+)\]/, ":$1");

const getRoutes = async (path: PagesManifest): Promise<RouteObject[]> => {
  const route = `/${path.path}`;
  const isRootRoute = route === "/";
  const importPath = `./pages${route}${!isRootRoute ? "/" : ""}`;
  const lastSegmentOfRoute = route.slice(route.lastIndexOf("/") + 1);
  let routeChildren: RouteObject[] | undefined;
  if (path.children.length > 0) {
    routeChildren = [];
    for (const i of path.children) {
      routeChildren = routeChildren.concat(await getRoutes(i));
    }
  }
  const newRouteEntry: RouteObject = {
    path: convertFilenameToRRPath(lastSegmentOfRoute),
    element: isRootRoute ? (
      <RootLayout>
        <Outlet />
      </RootLayout>
    ) : (
      <Suspense>
        {createElement(
          lazy(() =>
            import(`${importPath}layout`)
              .catch(() => ({
                default: ({ children }: { children: ReactNode }) => <>{children}</>,
              }))
              .then((mod) => ({
                default: () => {
                  const Layout = mod.default;
                  return (
                    <Layout>
                      <Outlet />
                    </Layout>
                  );
                },
              })),
          ),
        )}
      </Suspense>
    ),
    children: [
      ...(routeChildren ?? []),
      {
        index: true,
        element: <Suspense>{createElement(lazy(() => import(`${importPath}page`)))}</Suspense>,
        loader: (
          await import(`${importPath}loader`).catch(() => ({
            default: undefined,
          }))
        ).default,
      },
    ],
  };
  for (const [key, file] of Object.entries(mapROKeyToFilename) as Entries<
    typeof mapROKeyToFilename
  >) {
    if (!file) {
      continue;
    }
    if (file.shouldBeReactElement) {
      newRouteEntry[key] = (
        <Suspense>
          {createElement(
            lazy(() =>
              import(`${importPath}${file.filename}`).catch(() => ({
                default: <></>,
              })),
            ),
          )}
        </Suspense>
      );
      continue;
    }
    newRouteEntry[key] = (
      await import(`${importPath}${file.filename}`).catch(() => ({
        default: undefined,
      }))
    ).default;
  }
  (Object.keys(newRouteEntry) as StringKeyOf<typeof newRouteEntry>[]).forEach(
    (key) => newRouteEntry[key] === undefined && delete newRouteEntry[key],
  );
  return [newRouteEntry];
};

export { getRoutes };

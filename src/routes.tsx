import { createElement, lazy,ReactNode, Suspense } from "react";
import { Outlet, RouteObject } from "react-router-dom";
import type { Entries, StringKeyOf } from "type-fest";

import RootLayout from "./pages/layout";
import { PagesManifest } from "./types";

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

const getRoutes = async (path: PagesManifest): Promise<RouteObject[]> => {
  const route = `/${path.path.replaceAll(/\\/g, "/")}`;
  const importPath = `./pages${route}${route !== "/" ? "/" : ""}`;
  let routeChildren: RouteObject[] | undefined;
  if (path.children.length > 0) {
    routeChildren = [];
    for (const i of path.children) {
      routeChildren = routeChildren.concat(await getRoutes(i));
    }
  }
  const lastSegmentOfRoute = route.slice(route.lastIndexOf("/") + 1);
  const newRouteEntry: RouteObject = {
    path: lastSegmentOfRoute,
    element: (
      <Suspense>
        {createElement(
          lazy(() =>
            import(`${importPath}layout`)
              .catch(() => ({
                default: ({ children }: { children: ReactNode }) => <>{children}</>,
              }))
              .then((Component) => ({
                default: () => (
                  <Component.default>
                    <Outlet />
                  </Component.default>
                ),
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

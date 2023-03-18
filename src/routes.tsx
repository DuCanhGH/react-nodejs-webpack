import type { LazyExoticComponent, ReactNode } from "react";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";

import RootLayout from "./pages/layout";
import type { PagesManifest } from "./types";

const getRoutes = async (pageManifest: PagesManifest): Promise<RouteObject> => {
  const { path, importPath, children } = pageManifest;

  const Layout =
    path === "/"
      ? RootLayout
      : lazy(() =>
          import(`${importPath}layout`).catch(() => ({
            default: ({ children }: { children: ReactNode }) => <>{children}</>,
          })),
        );

  let Page: LazyExoticComponent<any> | undefined;
  let ErrorBoundary: LazyExoticComponent<any> | undefined;

  try {
    Page = lazy(() => import(`${importPath}page`));
  } catch {
    // Do nothing, page.js might not be defined.
  }

  try {
    ErrorBoundary = lazy(() => import(`${importPath}error`));
  } catch {
    // Do nothing, error.js might not be defined.
  }

  const resolvedChildren: RouteObject[] = [];

  for (const child of children) {
    resolvedChildren.push(await getRoutes(child));
  }

  if (Page) {
    const loader = (
      await import(`${importPath}loader`).catch(() => ({
        default: undefined,
      }))
    ).default;

    resolvedChildren.push({
      index: true,
      element: <Page />,
      loader,
    });
  }

  return {
    path,
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    errorElement: ErrorBoundary ? <ErrorBoundary /> : undefined,
    children: resolvedChildren,
  };
};

export { getRoutes };

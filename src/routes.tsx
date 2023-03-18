import type { ReactNode } from "react";
import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";

import RootLayout from "./pages/layout";
import type { PagesManifest } from "./shared/types";

const lazyLoadReactComponent = <T extends (...props: any) => JSX.Element>(
  path: string | undefined,
  fallback?: T,
) => {
  if (!path) {
    return fallback;
  }
  return lazy(() => import(`${path}`));
};

const getRoutes = async (pageManifest: PagesManifest): Promise<RouteObject> => {
  const { path, importPaths, children } = pageManifest;

  const Layout =
    path === "/"
      ? RootLayout
      : lazyLoadReactComponent(importPaths.layout, ({ children }: { children: ReactNode }) => (
          <>{children}</>
        ));

  const Page = lazyLoadReactComponent(importPaths.page);
  const ErrorBoundary = lazyLoadReactComponent(importPaths.error);

  const resolvedChildren: RouteObject[] = [];

  for (const child of children) {
    resolvedChildren.push(await getRoutes(child));
  }

  if (Page) {
    const loaderPath = importPaths.loader;
    const loader = loaderPath ? (await import(`${loaderPath}`)).default : undefined;
    const Loading = lazyLoadReactComponent(importPaths.loading);

    resolvedChildren.push({
      index: true,
      element: Loading ? (
        <Suspense fallback={<Loading />}>
          <Page />
        </Suspense>
      ) : (
        <Page />
      ),
      loader,
    });
  }

  return {
    path,
    element: Layout ? (
      <Layout>
        <Outlet />
      </Layout>
    ) : undefined,
    errorElement: ErrorBoundary ? <ErrorBoundary /> : undefined,
    children: resolvedChildren,
  };
};

export { getRoutes };

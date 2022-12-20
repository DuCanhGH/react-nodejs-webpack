import { RouteObject } from "react-router-dom";

import AboutPage from "./pages/about/page";
import homeLoader from "./pages/home/loader";
import HomePage from "./pages/home/page";
import RootLayout from "./pages/layout";
import NotFoundPage from "./pages/not-found";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/home",
        element: <HomePage />,
        loader: homeLoader,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export { routes };

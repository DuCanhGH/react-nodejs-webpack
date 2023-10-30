import {
  experimental_useEffectEvent as useEffectEvent,
  lazy,
  Suspense,
  useEffect,
  useState,
} from "react";
import { isRouteErrorResponse, Link, Outlet, useLocation, useRouteError } from "react-router-dom";

import logo from "@/logo.svg";

const ReactMarkdown = lazy(() => import("react-markdown"));

type ColorScheme = "light" | "dark";

export const Component = () => {
  const [theme, setTheme] = useState<ColorScheme>("light");
  const location = useLocation();
  const doSomething = useEffectEvent((url: string) => console.log(url, theme));

  useEffect(() => {
    doSomething(location.pathname);
  }, [location]);

  return (
    <div className="App">
      <section className="App-header">
        <Suspense fallback={<p>Loading...</p>}>
          <ReactMarkdown children="*hehe*" />
        </Suspense>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/layout.tsx</code> then save it to see your changes. Also edit{" "}
          <code>src/pages</code> to add new routes!
        </p>
        <p
          style={{
            borderRadius: "6px",
            padding: "12px",
            ...(theme === "light"
              ? {
                  color: "black",
                  backgroundColor: "white",
                }
              : {
                  color: "white",
                }),
          }}
        >
          Click this button, then the links below and check your console:
        </p>
        <button
          onClick={() => {
            setTheme((_old) => (_old === "dark" ? "light" : "dark"));
          }}
          className="App-button"
        >
          {theme.slice(0, 1).toUpperCase() + theme.slice(1)}
        </button>
        <Outlet />
        <div>
          <Link to="/" className="App-link">
            Root
          </Link>
          <Link to="/home" className="App-link">
            Home
          </Link>
          <Link to="/about" className="App-link">
            About
          </Link>
          <a
            className="App-link"
            href="https://react.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React here!
          </a>
        </div>
      </section>
    </div>
  );
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  return (
    <h1>
      {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : JSON.stringify(error)}
    </h1>
  );
};

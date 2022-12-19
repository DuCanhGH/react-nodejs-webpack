import "./app.css";

import {
  experimental_useEffectEvent as useEffectEvent,
  lazy,
  Suspense,
  useEffect,
  useState,
} from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import styles2 from "./adu.module.scss";
import styles from "./app.module.sass";
import logo from "./logo.svg";
//an example of how you can use css/sass/scss files.

const ReactMarkdown = lazy(() => import("react-markdown"));

type ColorScheme = "light" | "dark";

const App = () => {
  const [theme, setTheme] = useState<ColorScheme>("light");
  const location = useLocation();
  const doSomething = useEffectEvent((url: string) => console.log(url, theme));
  useEffect(() => {
    doSomething(location.pathname);
  }, [location]);
  return (
    <>
      <div className="App">
        <header className="App-header">
          <Suspense fallback={<p className={styles.hehe}>Loading...</p>}>
            <ReactMarkdown children="*hehe*" />
          </Suspense>
          <img src={logo} className="App-logo" alt="logo" />
          <p className={styles.hehe}>
            Edit <code>src/App.tsx</code> then save it to see the changes.
          </p>
          <p
            className={styles.hehe}
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
          <Routes>
            <Route path="*" element={<p className={styles2["hehe"]}>Welcome</p>} />
            <Route path="/home" element={<p className={styles2["hehe"]}>To</p>} />
            <Route path="/about" element={<p className={styles2["hehe"]}>React!</p>} />
          </Routes>
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
              href="https://beta.reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React here!
            </a>
          </div>
        </header>
      </div>
    </>
  );
};

export default App;

import "./app.css";

import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";

import styles2 from "./adu.module.scss";
import styles from "./app.module.sass";
import logo from "./logo.svg";
//an example of how you can use css/sass/scss files.

const ReactMarkdown = lazy(() => import("react-markdown"));

const Dak2 = () => {
  return (
    <>
      <div className="App">
        <header className="App-header">
          <Suspense fallback={<p className={styles.hehe}>Loading...</p>}>
            <ReactMarkdown children="*hehe*" />
          </Suspense>
          <img src={logo} className="App-logo" alt="logo" />
          <p className={styles.hehe}>
            Edit <code>src/App.tsx</code>, save and reload to see the changes.
          </p>
          <p className={styles.hehe}>Click the links to see the route changes!</p>
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
              href="https://reactjs.org"
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

export default Dak2;

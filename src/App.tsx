import { Routes, Route, Link } from "react-router-dom";
import { Fragment } from "react";
import styles from "app.module.sass";
import styles2 from "adu.module.scss";
import 'app.css';
import logo from "logo.svg";
//an example of how you can use css/sass/scss files.

const Dak2 = () => {
    return (
        <Fragment>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p className={styles.hehe}>
                        Edit <code>src/App.tsx</code>, save and reload to see the changes.
                    </p>
                    <p className={styles.hehe}>
                        Click the links to see the route changes!
                    </p>
                    <Routes>
                        <Route path="*" element={<p className={styles2['hehe']}>Welcome</p>} />
                        <Route path="/home" element={<p className={styles2['hehe']}>To</p>} />
                        <Route path="/about" element={<p className={styles2['hehe']}>React!</p>} />
                    </Routes>
                    <div>
                        <Link to="/" className="App-link">Root</Link>
                        <Link to="/home" className="App-link">Home</Link>
                        <Link to="/about" className="App-link">About</Link>
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
        </Fragment>
    );
};

export default Dak2;
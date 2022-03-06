import { Routes, Route, Link } from "react-router-dom";
import React from "react";
import styles from "app.module.sass";
import styles2 from "adu.module.scss";
import 'app.css';
//an example of how you can use css/sass/scss files.

const Dak2 = () => {
    return (
        <React.Fragment>
            <Routes>
                <Route path="*" element={<div>I don't know what is this route </div>} />
                <Route path="/home" element={<div>Just for fun</div>} />
                <Route path="/about" element={<div>About</div>} />
            </Routes>
            <Link to="/home">Home</Link>
            <Link to="/about">Dak</Link>
            <div className={styles['hehe']}>Nani</div>
            <p className="hehe">Adu</p>
            <p className={styles2.displaynone}>Adu</p>
            <img src="/img/favicon.ico" />
        </React.Fragment>
    );
};

export default Dak2;
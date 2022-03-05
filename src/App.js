const { Routes, Route, Link } = require("react-router-dom");
const React = require("react");

const Dak2 = () => {
    return (
        React.createElement(React.Fragment, {}, React.createElement(Routes, null, React.createElement(Route, {
            path: "/home",
            element: React.createElement("div", null, "Just for fun")
        }), React.createElement(Route, {
            path: "*",
            element: React.createElement("div", null, "I don't know what is this route ")
        })), React.createElement(Link, {
            to: "/home"
        }, "Home"), React.createElement(Link, {
            to: "/about"
        }, "Dak"))
    );
};

exports.Dak2 = Dak2;
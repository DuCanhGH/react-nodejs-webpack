import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dak2 } from './App';
import { BrowserRouter } from "react-router-dom";

ReactDOM.hydrateRoot(document.getElementById('root'), <BrowserRouter><Dak2 /></BrowserRouter>);
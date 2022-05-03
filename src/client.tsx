import { hydrateRoot } from 'react-dom/client';
import Dak2 from 'App';
import { BrowserRouter } from "react-router-dom";

const container = document.getElementById("root"); //HTML template must have something that uses this id: root.

if (!container) throw new Error('Failed to find the root element');

hydrateRoot(container, <BrowserRouter><Dak2 /></BrowserRouter>);

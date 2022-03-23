import { hydrateRoot } from 'react-dom/client';
import Dak2 from 'App';
import { BrowserRouter } from "react-router-dom";

hydrateRoot(document.getElementById('root')!, <BrowserRouter><Dak2 /></BrowserRouter>);
import { hydrateRoot } from 'react-dom/client';
import Dak2 from 'App';
import { BrowserRouter } from "react-router-dom";
import * as OfflinePluginRuntime from '@lcdp/offline-plugin/runtime';

if (process.env.NODE_ENV === "production") {
  OfflinePluginRuntime.install();
};

hydrateRoot(document.getElementById('root')!, <BrowserRouter><Dak2 /></BrowserRouter>);

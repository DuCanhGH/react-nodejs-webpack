import type { LoaderFunction } from "@remix-run/router";
import { json } from "react-router-dom";

const rand = () => Math.round(Math.random() * 100);

export interface HomeLoaderData {
  message: string;
}

const loader: LoaderFunction = async () => {
  return json<HomeLoaderData>({ message: `To (${rand()})` });
};

export default loader;

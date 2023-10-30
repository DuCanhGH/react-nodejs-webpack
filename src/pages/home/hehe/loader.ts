import type { LoaderFunction } from "react-router-dom";

const loader = (() => {
  return "(nested route!)";
}) satisfies LoaderFunction;

export type Loader = typeof loader;

export default loader;

import type { LoaderFunction } from "@remix-run/router";

const rand = () => Math.round(Math.random() * 100);

const loader = (async () => {
  return {
    message: `To ${rand()}`,
  };
}) satisfies LoaderFunction;

export type Loader = typeof loader;

export default loader;

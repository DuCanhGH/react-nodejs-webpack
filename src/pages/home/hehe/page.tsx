import { useLoaderData } from "@/shared/utils";

import type { Loader } from "./loader";

export const Component = () => {
  const data = useLoaderData<Loader>();
  return <p>Hello world! {JSON.stringify(data)}</p>;
};

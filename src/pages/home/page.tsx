import { useLoaderData } from "@/shared/utils";

import type { Loader } from "./loader";

export const Component = () => {
  const { message } = useLoaderData<Loader>();
  return <p>{message}</p>;
};

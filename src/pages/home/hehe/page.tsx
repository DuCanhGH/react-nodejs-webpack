import { useLoaderData } from "react-router-dom";

export default function Page() {
  const data = useLoaderData();
  return <p>Hello world! {JSON.stringify(data)}</p>;
}

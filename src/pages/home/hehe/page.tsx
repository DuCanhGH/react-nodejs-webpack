import { useLoaderData } from "react-router-dom";

import styles2 from "@/adu.module.scss";

export default function Page() {
  const data = useLoaderData();
  return <p className={styles2["hehe"]}>Hello world! {JSON.stringify(data)}</p>;
}

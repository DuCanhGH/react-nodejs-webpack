import { Await, useLoaderData } from "react-router-dom";

import styles2 from "@/adu.module.scss";

import type { HomeLoaderData } from "./loader";

const HomePage = () => {
  const data = useLoaderData() as HomeLoaderData;
  return (
    <Await resolve={data}>
      <p className={styles2["hehe"]}>{data.message}</p>
    </Await>
  );
};

export default HomePage;

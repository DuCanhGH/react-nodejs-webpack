import { useLoaderData } from "react-router-dom";

import styles2 from "../../adu.module.scss";
import type { HomeLoaderData } from "./loader";

const HomePage = () => {
  const data = useLoaderData() as HomeLoaderData;
  return <p className={styles2["hehe"]}>{data.message}</p>;
};

export default HomePage;

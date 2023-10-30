import { useParams } from "react-router-dom";

export const Component = () => {
  const { hoho } = useParams();

  return <p>Hi, {hoho}!</p>;
};

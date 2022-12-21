import { useParams } from "react-router-dom";

export default function Page() {
  const { hoho } = useParams();
  return <p>Hi, {hoho}!</p>;
}

import { useAuth } from "../auth/AuthContext";
import useQuery from "../api/useQuery";

export default function HomePage() {
  return (
    <>
      <h1>MEV</h1>
      <h2>MEV - a personal curation platform</h2>
      <h3>
        extracting maximum value from all the content, links, and experiences
        you encounter online and in life.
      </h3>
      <button>Register/Login</button>
    </>
  );
}

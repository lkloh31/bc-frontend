import "./App.css";

import { usePage } from "./layout/PageContext";

import Register from "./auth/Register";
import Login from "./auth/Login";
import HomePage from "./home/HomePage";
import Error404 from "./Error404.jsx";

export default function App() {
  const { page } = usePage();

  if (page === "home") return <HomePage />;
  if (page === "register") return <Register />;
  if (page === "login") return <Login />;

  return <Error404 />;
}

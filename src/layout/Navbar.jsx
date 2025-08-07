import "../styles/navbar.css";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { usePage } from "./PageContext";

export default function Navbar() {
  const { token, logout } = useAuth();
  const { setPage } = usePage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <p className="logo" onClick={() => setPage("home")}>
        MEV
      </p>

      <button
        className="menubutton"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle Menu"
      >
        <img src="/images/hamburgericon1.png" alt="menu icon" />
      </button>
      {token ? (
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a onClick={() => setPage("home")}>Daily dose</a>
          <a onClick={() => setPage("map")}>Map</a>
          <a onClick={() => setPage("journal")}>Journal</a>
          <a onClick={() => setPage("add")}>+</a>
          <a onClick={logout}>Log out</a>
        </nav>
      ) : (
        <></>
      )}
    </header>
  );
}

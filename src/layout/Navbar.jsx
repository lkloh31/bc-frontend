import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

import "../styles/components/navbar.css";
import "../App.css";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        MEV
      </Link>

      <button
        className="menubutton"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        {token ? (
          <>
            <a href="#" onClick={closeMenu}>
              Daily dose
            </a>
            <a href="#" onClick={closeMenu}>
              Map
            </a>
            <a href="#" onClick={closeMenu}>
              Journal
            </a>
            <a href="#" onClick={closeMenu}>
              +
            </a>
            <button onClick={handleLogout} className="nav-logout-btn">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/register" onClick={closeMenu}>
              Register
            </Link>
            <Link to="/login" onClick={closeMenu}>
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

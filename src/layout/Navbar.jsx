// src/layout/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import "../styles/components/navbar.css";
import "../App.css";

export default function Navbar() {
  const { token: ctxToken, logout } = useAuth();
  const token = ctxToken || localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout?.();
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login", { replace: true });
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
            <Link to="/dashboard" onClick={closeMenu}>
              Dashboard
            </Link>
            {/* Stubs you can wire up later */}
            <Link to="/daily" onClick={closeMenu}>
              Daily dose
            </Link>
            <Link to="/map" onClick={closeMenu}>
              Map
            </Link>
            <Link to="/journal" onClick={closeMenu}>
              Journal
            </Link>

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

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import "../styles/components/navbar.css";
import "../App.css";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const navbar = document.querySelector(".navbar");

    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar?.classList.add("scrolled");
      } else {
        navbar?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
        className={`menubutton ${menuOpen ? "open" : ""}`}
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
            <Link to="/daily" onClick={closeMenu}>
              Daily dose
            </Link>
            <Link to="/map" onClick={closeMenu}>
              Map
            </Link>
            <Link to="/journal" onClick={closeMenu}>
              Journal
            </Link>
            <Link to="/brain" onClick={closeMenu}>
              Games
            </Link>
            <a href="#" onClick={closeMenu}>
              +
            </a>
            <button onClick={handleLogout} className="nav-logout-btn">
              Log out
            </button>
          </>
        ) : (
          <>
            {/* <Link to="/daily">Daily dose</Link> */}
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

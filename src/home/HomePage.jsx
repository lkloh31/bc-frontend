import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";

import "../styles/pages/homepage.css";
import "../styles/components/button.css";

export default function Homepage() {
  const { token } = useAuth();

  return (
    <div className="homepage">
      <div className="intro-section">
        {/* <h1>MEV</h1> */}
        <h2>MEV - a personal curation platform</h2>
        <h3>
          Extracting maximum value from all the content, links, and experiences
          you encounter online and in life.
        </h3>

        {!token && (
          <div className="auth-buttons">
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        )}

        {token && (
          <div className="welcome-message">
            <h4>Welcome back! You're logged in.</h4>
            <p>Start curating your content and experiences.</p>
          </div>
        )}
      </div>
    </div>
  );
}

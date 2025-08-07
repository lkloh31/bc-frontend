import { useState } from "react";
import { useAuth } from "./AuthContext";
import { usePage } from "../layout/PageContext";

export default function Login() {
  const { login } = useAuth();
  const { setPage } = usePage();

  const [error, setError] = useState(null);

  const tryLogin = async (formData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await login({ username, password });
      setPage("daily");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="auth-heading">Login to your account</h1>
      <form className="auth-form" action={tryLogin}>
        <label>
          <input type="text" name="username" placeholder="Username" required />
        </label>
        <label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </label>
        <button>Login</button>
        {error && <output>{error}</output>}
      </form>
      <a className="auth-link" onClick={() => setPage("register")}>
        Need an account? Register here.
      </a>
    </div>
  );
}

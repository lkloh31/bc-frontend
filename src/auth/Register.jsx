import { useState } from "react";
import { useAuth } from "./AuthContext";
import { usePage } from "../layout/PageContext";

/** A form that allows users to register for a new account */
export default function Register() {
  const { register } = useAuth();
  const { setPage } = usePage();

  const [error, setError] = useState(null);

  const tryRegister = async (formData) => {
    const name = formData.get("name");
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await register({ name, username, password });
      setPage("daily");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="auth-heading">Register</h1>
      <form className="auth-form" action={tryRegister}>
        <label>
          <input type="text" name="name" placeholder="Name" required />
        </label>
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
        <button>Register</button>
        {error && <output>{error}</output>}
      </form>
      <a className="auth-link" onClick={() => setPage("login")}>
        Already have an account? Log in here.
      </a>
    </div>
  );
}

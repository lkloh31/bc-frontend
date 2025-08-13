import { createContext, useContext, useState, useEffect } from "react";

import { API } from "../api/ApiContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const register = async (credentials) => {
    const response = await fetch(API + "/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Registration failed");
      setToken(result.token);
      localStorage.setItem("authToken", result.token);
    } else {
      // Handle non-JSON responses (plain text errors)
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed");
    }
  };

  const login = async (credentials) => {
    const response = await fetch(API + "/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Login failed");
      setToken(result.token);
      localStorage.setItem("authToken", result.token);
    } else {
      // Handle non-JSON responses (plain text errors)
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }

  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const value = { token, register, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within AuthProvider");
  return context;
}

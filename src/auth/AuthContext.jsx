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
    const response = await fetch(API + "/admin/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();
    if (!response.ok) throw result;
    setToken(result.token);
    localStorage.setItem("authToken", result.token);
  };

  const login = async (credentials) => {
    const response = await fetch(API + "/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();
    if (!response.ok) throw result;
    setToken(result.token);

    localStorage.setItem("authToken", result);
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

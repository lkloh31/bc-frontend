// src/App.jsx
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ApiProvider } from "./api/ApiContext";

import Homepage from "./home/HomePage";
import Register from "./components/Register";
import Login from "./components/Login";
import Navbar from "./layout/Navbar";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </ApiProvider>
    </AuthProvider>
  );
}

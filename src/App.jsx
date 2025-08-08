import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { ApiProvider } from "./api/ApiContext";
import Homepage from "./home/HomePage";
import Register from "./components/Register";
import Login from "./components/Login";
import Navbar from "./layout/Navbar";
import MapPage from "./map/MapPage";

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
                <Route path="/map" element={<MapPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ApiProvider>
    </AuthProvider>
  );
}

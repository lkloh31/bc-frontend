import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { ApiProvider } from "./api/ApiContext";
import Homepage from "./home/HomePage";
import Register from "./components/Register";
import Login from "./components/Login";
import Navbar from "./layout/Navbar";
import DailyDose from "./components/Daily";
import News from "./components/News";
// import Weather from "./components/Weather";
// import Currency from "./components/Currency";
// import Stocks from "./components/Stocks";
// import MoodOfTheDay from "./components/MoodOfTheDay";
import MapPage from "./map/MapPage";
import DailyDose from "./home/DailyDose";

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
                <Route path="/daily" element={<DailyDose />} /> 
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/daily" element={<DailyDose />} />
                <Route path="/daily/news" element={<News />} />
                {/* <Route path="/daily/weather" element={<Weather />} />
                <Route path="/daily/currency" element={<Currency />} />
                <Route path="/daily/stocks" element={<Stocks />} />
                <Route path="/daily/mood" element={<MoodOfTheDay />} /> */}
                <Route path="/map" element={<MapPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ApiProvider>
    </AuthProvider>
  );
}

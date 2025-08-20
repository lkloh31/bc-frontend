import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { ApiProvider } from "./api/ApiContext";
import { PlayerProvider } from "./components/music/PlayerContext";
import Homepage from "./home/HomePage";
import Register from "./auth/Register";
import Login from "./auth/Login";
import Navbar from "./layout/Navbar";
import DailyDose from "./components/DailyDose";
import News from "./components/News";
import UserWeather from "./components/weather/UserWeather";
import Exchange from "./components/Exchange";
import Stocks from "./components/Stocks";
import Crypto from "./components/Crypto.jsx";
import MapPage from "./map/MapPage";
import BrainGames from "./pages/BrainGames.jsx";
import JournalPage from "./journal/JournalPage";
import MoodOfTheDay from "./components/MoodOfTheDay";
import MusicPlayer from "./components/music/MusicPlayer";

export default function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <PlayerProvider>
          <Router>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/daily" element={<DailyDose />} />
                  <Route path="/daily/news" element={<News />} />
                  <Route path="/daily/weather" element={<UserWeather />} />
                  <Route path="/daily/exchange" element={<Exchange />} />
                  <Route path="/daily/stocks" element={<Stocks />} />
                  <Route path="/daily/crypto" element={<Crypto />} />
                  <Route path="/daily/mood" element={<MoodOfTheDay />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/brain/*" element={<BrainGames />} />
                  <Route path="/journal" element={<JournalPage />} />
                </Routes>
              </main>
              {/* Music player available across all pages */}
              <MusicPlayer />
            </div>
          </Router>
        </PlayerProvider>
      </ApiProvider>
    </AuthProvider>
  );
}

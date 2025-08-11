import { Link } from "react-router";

import "../styles/pages/daily.css";

export default function DailyDose() {
  return (
    <div className="daily-dose">
      <h2>Daily Intakes...</h2>
      <h3>Quick access to your personalized content.</h3>

      <div className="daily-dose-links">
        <Link to="/daily/news">News</Link>
        <Link to="/daily/weather">Weather</Link>
        <Link to="/daily/currency">Currency</Link>
        <Link to="/daily/stocks">Stocks</Link>
        <Link to="/daily/mood">Mood of the Day</Link>
      </div>
    </div>
  );
}

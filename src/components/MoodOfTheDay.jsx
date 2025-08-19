import React from "react";
import MoodTracker from "./MoodTracker";
import "../styles/pages/daily.css";

export default function MoodOfTheDay() {
  return (
    <div className="daily-dose-container">
      <div className="daily-dose-widget mood-widget">
        <MoodTracker />
      </div>
    </div>
  );
}

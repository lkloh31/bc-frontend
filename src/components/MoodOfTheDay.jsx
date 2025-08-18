import React from 'react';
import MoodTracker from './MoodTracker'; // We will import the widget here
import '../styles/pages/daily.css'; // We can reuse the daily styles

export default function MoodOfTheDay() {
  return (
    <div className="daily-dose-container">
      <div className="daily-dose-header">
        <h1>Mood of the Day</h1>
        <p>Log your emotional state with a single click.</p>
      </div>
      <div className="daily-dose-widget mood-widget">
        <MoodTracker />
      </div>
    </div>
  );
}
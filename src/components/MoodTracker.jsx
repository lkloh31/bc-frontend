import { useState, useEffect } from "react";
import { useApi } from "../api/ApiContext";

const moods = [
  { emoji: "😔", value: 1, label: "Sad" },
  { emoji: "😐", value: 2, label: "Neutral" },
  { emoji: "😊", value: 3, label: "Happy" },
  { emoji: "😄", value: 4, label: "Great" },
  { emoji: "😍", value: 5, label: "Awesome" },
];

const toLocalYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function MoodTracker() {
  const { request } = useApi();
  const [todayMood, setTodayMood] = useState(null);
  const [message, setMessage] = useState("");

  const handleMoodSelect = async (mood) => {
    try {
      const today = toLocalYYYYMMDD(new Date());
      const response = await request("/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moodValue: mood.value, moodDate: today }),
      });
      setTodayMood(response.mood_value);
      setMessage(`Today's mood saved as: ${mood.label}`);
    } catch (error) {
      console.error("Failed to save mood:", error);
      setMessage("Could not save mood. Please try again.");
    }
  };

  return (
    <div className="mood-tracker">
      <h4>How are you feeling today?</h4>
      <div className="mood-options">
        {moods.map((mood) => (
          <button
            key={mood.value}
            className={`mood-button ${
              todayMood === mood.value ? "selected" : ""
            }`}
            onClick={() => handleMoodSelect(mood)}
            title={mood.label}
          >
            {mood.emoji}
          </button>
        ))}
      </div>
      {message && <p className="mood-message">{message}</p>}
    </div>
  );
}

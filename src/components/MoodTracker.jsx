import { useState, useEffect } from "react";
import { useApi } from "../api/ApiContext";
import { useAuth } from "../auth/AuthContext";
import { usePlayer } from "./music/PlayerContext";

// Mood values from 1 to 8
const moods = [
  {
    emoji: "😢",
    value: 1,
    label: "Sad",
    color: "#1e90ff",
    playlist: "37i9dQZF1DX7qK8ma5wgG1",
  },
  {
    emoji: "😤",
    value: 2,
    label: "Frustrated",
    color: "#dc143c",
    playlist: "37i9dQZF1EIXQoxVnQ86uC",
  },
  {
    emoji: "😴",
    value: 3,
    label: "Tired",
    color: "#a9a9a9",
    playlist: "37i9dQZF1DX3Ogo9pFvBkY",
  },
  {
    emoji: "😐",
    value: 4,
    label: "Neutral",
    color: "#d3d3d3",
    playlist: "4dJHrPYVdKgaCE3Lxrv1MZ",
  },
  {
    emoji: "😌",
    value: 5,
    label: "Calm",
    color: "#87ceeb",
    playlist: "6HmX9F7b4ypVSsY6ysED1P",
  },
  {
    emoji: "😊",
    value: 6,
    label: "Happy",
    color: "#ffd700",
    playlist: "37i9dQZF1DXdPec7aLTmlC",
  },
  {
    emoji: "😍",
    value: 7,
    label: "Loved",
    color: "#ff69b4",
    playlist: "6vpL7Ap41ud8Jpfbnnt5sK",
  },
  {
    emoji: "🤩",
    value: 8,
    label: "Thrilled",
    color: "#ff8c00",
    playlist: "0okKcRyYEwq8guFxzAPtlB",
  },
];

// Format date as YYYY-MM-DD
const toLocalYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function MoodTracker() {
  const { request } = useApi();
  const { token } = useAuth();
  const { setPlaylist } = usePlayer();
  const [todayMood, setTodayMood] = useState(null);
  const [message, setMessage] = useState("");

  const today = toLocalYYYYMMDD(new Date());

  // Load today's mood
  useEffect(() => {
    const fetchTodayMood = async () => {
      if (!token) return;

      try {
        const moodsData = await request("/mood", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const todayEntry = moodsData.find((m) => m.mood_date === today);
        if (todayEntry) setTodayMood(todayEntry.mood_value);
      } catch (err) {
        console.error("Failed to fetch today's mood:", err);
      }
    };
    fetchTodayMood();
  }, [request, token, today]);

  const handleMoodSelect = async (mood) => {
    setTodayMood(mood.value);

    if (mood.playlist) setPlaylist(mood.playlist);

    if (!token) {
      const localMoods = JSON.parse(localStorage.getItem("moods") || "{}");
      localMoods[today] = mood.value;
      localStorage.setItem("moods", JSON.stringify(localMoods));
      // setMessage("Saved locally");
      return;
    }

    try {
      const response = await request("/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ moodValue: mood.value, moodDate: today }),
      });

      if (response.error) {
        console.error("Backend error:", response.error);
        setMessage("Failed to save mood");
      } else {
        console.log("Mood saved successfully:", response);
        setMessage("Mood saved!");
      }
    } catch (err) {
      console.error("Failed to save mood:", err);
      setMessage("Failed to save mood");
    }
  };

  return (
    <div className="mood-tracker">
      <h4>How are you feeling today?</h4>
      <div className="mood-options">
        {moods.map((mood) => {
          const isSelected = todayMood === mood.value;
          return (
            <button
              key={mood.value}
              className="mood-button"
              onClick={() => handleMoodSelect(mood)}
              style={{
                border: isSelected
                  ? `2px solid ${mood.color}`
                  : "2px solid transparent",
                backgroundColor: isSelected ? mood.color + "33" : "#f0f0f0",
              }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          );
        })}
      </div>
      {message && <p className="mood-message">{message}</p>}
    </div>
  );
}

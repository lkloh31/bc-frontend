import React from "react";
import { formatTime } from "./useGameTimer";

export default function Timer({ elapsedMs, bestMs }) {
  return (
    <div style={{
      display: "flex",
      gap: "1rem",
      alignItems: "baseline",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
        Time: {formatTime(elapsedMs)}
      </div>
      <div style={{ opacity: 0.75 }}>
        Best: {formatTime(bestMs)}
      </div>
    </div>
  );
}

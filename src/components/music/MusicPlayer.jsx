import React from "react";
import { usePlayer } from "./PlayerContext";

export default function MusicPlayer() {
  const { playlistId, isMinimized, toggleMinimize } = usePlayer();

  if (!playlistId) return null;

  return (
    <div className={`music-player ${isMinimized ? "minimized" : ""}`}>
      <button className="minimize-toggle" onClick={toggleMinimize}>
        {isMinimized ? "▲" : "▼"}
      </button>

      <div className="spotify-iframe-container">
        <iframe
          title="Spotify Player"
          // CORRECTED: Use the official Spotify embed URL and the dynamic playlistId
          src={`https://open.spotify.com/embed/playlist/${playlistId}`}
          width="100%"
          height="100%"
          allow="encrypted-media"
          style={{ borderRadius: "10px", border: 'none' }}
        ></iframe>
      </div>
    </div>
  );
}
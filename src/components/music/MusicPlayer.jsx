import React from "react";
import { usePlayer } from "./PlayerContext";
import { motion } from "framer-motion";

export default function MusicPlayer() {
  const { playlistId, isMinimized, toggleMinimize, closePlayer } = usePlayer();

  if (!playlistId) return null;

  return (
    <motion.div
      drag
      dragConstraints={{ top: -750, left: -1550, right: 0, bottom: 0 }}
      className={`music-player ${isMinimized ? "minimized" : ""}`}
    >
      {/* UPDATED: The order of the buttons inside this div is now swapped */}
      <div className="player-controls">
        <button className="minimize-toggle" onClick={toggleMinimize} title="Minimize/Maximize">
          {isMinimized ? "▲" : "▼"}
        </button>
        <button className="close-button" onClick={closePlayer} title="Close Player">
          ×
        </button>
      </div>

      <div className="spotify-iframe-container">
        <iframe
          title="Spotify Player"
          src={`https://open.spotify.com/embed/playlist/${playlistId}`}
          width="100%"
          height="100%"
          allow="encrypted-media"
          style={{ borderRadius: "10px", border: 'none' }}
        ></iframe>
      </div>
    </motion.div>
  );
}
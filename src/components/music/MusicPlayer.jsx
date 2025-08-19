import React, { useEffect } from "react";
import { usePlayer } from "./PlayerContext";

export default function MusicPlayer() {
  const { playlistId } = usePlayer();

  useEffect(() => {
    if (playlistId) {
      console.log("Mood playlist changed:", playlistId);
    }
  }, [playlistId]);

  if (!playlistId) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: "50%",
        transform: "translateX(-50%)",
        height: "160px",
        width: "340px",
        backgroundColor: "#222",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "10px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
      }}
    >
      <iframe
        title="Spotify Player"
        src={`https://open.spotify.com/embed/playlist/${playlistId}`}
        width="320"
        height="152" // enough to show track 1
        // frameBorder="0"
        allow="encrypted-media"
        style={{ borderRadius: "10px" }}
      ></iframe>
    </div>
  );
}

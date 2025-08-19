import { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playlistId, setPlaylistId] = useState(null);
  // NEW: State to track if the player is minimized
  const [isMinimized, setIsMinimized] = useState(false);

  // NEW: Function to toggle the minimized state
  const toggleMinimize = () => setIsMinimized(prev => !prev);

  const value = {
    playlistId,
    setPlaylist: setPlaylistId,
    isMinimized,
    toggleMinimize,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
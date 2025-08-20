import { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playlistId, setPlaylistId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => setIsMinimized(prev => !prev);

  // NEW: Function to close the player
  const closePlayer = () => setPlaylistId(null);

  const value = {
    playlistId,
    setPlaylist: setPlaylistId,
    isMinimized,
    toggleMinimize,
    closePlayer, // NEW: Export the close function
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
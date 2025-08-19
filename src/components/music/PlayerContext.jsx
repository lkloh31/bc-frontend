import { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [playlistId, setPlaylistId] = useState(null);

  return (
    <PlayerContext.Provider value={{ playlistId, setPlaylist: setPlaylistId }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);

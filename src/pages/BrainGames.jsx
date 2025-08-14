import { Link, Routes, Route, useParams } from "react-router";
import { games } from "../games/index.js";

export default function BrainGames() {
  return (
    <section style={{ padding: 24 }}>
      <h2>BrainGames</h2>

      <ul style={{ display: "flex", gap: "1rem", padding: 0, listStyle: "none", flexWrap: "wrap" }}>
        {games.map(g => (
          <li key={g.id}>
            <Link to={`/brain/${g.id}`}>{g.name}</Link>
          </li>
        ))}
      </ul>

      <Routes>
        <Route index element={<p style={{ marginTop: 12 }}>Pick a game above.</p>} />
        <Route path=":game" element={<GameHost />} />
      </Routes>
    </section>
  );
}

function GameHost() {
  const { game } = useParams();
  const entry = games.find(g => g.id === game);
  if (!entry) return <p style={{ marginTop: 12 }}>Game not found.</p>;
  const Comp = entry.Component;
  return <div style={{ marginTop: 16 }}><Comp /></div>;
}

import { Link, Routes, Route, useParams } from "react-router";
import { games } from "../games/index.js";
import "../styles/pages/BrainGames.css"; 

export default function BrainGames() {
  return (
    <div className="bg-container">
      <div className="bg-wrap">
        <header className="topbar">
          <div className="brand">
            <span className="brand-logo" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 3a3 3 0 0 0-3 3v9a4 4 0 0 0 4 4h.5M8 3h2a3 3 0 0 1 3 3v12M8 3v12m5-12h1a3 3 0 0 1 3 3v9a4 4 0 0 1-4 4h-1"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <h1>BrainGames</h1>
          </div>
        </header>

        <section className="hero">
          <h2>Sharpen your mind — one quick game at a time.</h2>
          <p>Pick a challenge below. Each card routes to its game.</p>
        </section>

        <main className="grid" aria-label="Game selection">
          {games.map((g) => (
            <Link key={g.id} className="card" to={`/brain/${g.id}`}>
              <span className="pill">{readableTag(g.id)}</span>
              <span className="icon" aria-hidden="true">
                {/* generic squares icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <rect x="13" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
              </span>
              <h3>{g.name}</h3>
              <p>{shortDesc(g.id)}</p>
            </Link>
          ))}
        </main>

        <Routes>
          <Route index element={<p className="muted mt">Pick a game above.</p>} />
          <Route path=":game" element={<GameHost />} />
        </Routes>

        <footer className="footer">
          © {new Date().getFullYear()} BrainGames
        </footer>
      </div>
    </div>
  );
}

function readableTag(id) {
  switch (id) {
    case "memorymatch":
    case "simon":
      return "Memory";
    case "reaction":
      return "Speed";
    case "tictactoe":
      return "Classic";
    case "sudoku":
      return "Logic";
    default:
      return "Game";
  }
}
function shortDesc(id) {
  switch (id) {
    case "memorymatch":
      return "Flip cards, find pairs, test recall.";
    case "reaction":
      return "Tap on cue. Track your best time.";
    case "tictactoe":
      return "Play vs. friend or AI.";
    case "sudoku":
      return "Generate puzzles and validate moves.";
    case "simon":
      return "Repeat the sequence—how far can you go?";
    default:
      return "Have fun and stay sharp.";
  }
}

function GameHost() {
  const { game } = useParams();
  const entry = games.find((g) => g.id === game);
  if (!entry) return <p className="muted mt">Game not found.</p>;
  const Comp = entry.Component;

  return (
    <div className="host-stage">      
      <div className="host-card">    
        <Comp />
      </div>
    </div>
  );
}

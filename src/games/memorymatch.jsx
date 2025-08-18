import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { API } from "../api/ApiContext";
import MemoryLeaderboard from "../components/MemoryLeaderboard.jsx";

function shuffledPairs() {
  const base = ["🍎","🍌","🍇","🍑","🍓","🍒","🥝","🍍"];
  const cards = [...base, ...base].map((v, idx) => ({ id: idx, v, open:false, done:false }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryMatch() {
  const { token } = useAuth();
  const [cards, setCards] = useState(shuffledPairs());
  const [sel, setSel] = useState([]);
  const [best, setBest] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // ⬅️ triggers leaderboard reload
  const startRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await fetch(`${API}/games/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.memory?.best_time_ms) setBest(data.memory.best_time_ms);
      }
    })();
  }, [token, API]);

  async function saveBest(ms) {
    if (!token) return;
    try {
      const res = await fetch(`${API}/games/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ game: "memory", timeMs: ms }),
      });
      if (res.ok) {
        const row = await res.json();
        setBest(row.best_time_ms);
        setRefreshKey(k => k + 1); // ⬅️ refresh leaderboard after saving
      }
    } catch {
      // ignore for now
    }
  }

  // timer: start on first flip
  useEffect(() => {
    if (startRef.current == null) {
      const anyOpen = cards.some(c => c.open || c.done);
      if (anyOpen) startRef.current = performance.now();
    }
  }, [cards]);

  // matching logic
  useEffect(() => {
    if (sel.length !== 2) return;
    const [a, b] = sel;
    if (cards[a].v === cards[b].v) {
      setCards(cs => cs.map((c,i) => (i===a||i===b) ? {...c, done:true} : c));
      setSel([]);
    } else {
      const t = setTimeout(() => {
        setCards(cs => cs.map((c,i) => (i===a||i===b) ? {...c, open:false} : c));
        setSel([]);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [sel, cards]);

  const finished = cards.every(c => c.done);

  useEffect(() => {
    if (!finished || startRef.current == null) return;
    const elapsed = Math.round(performance.now() - startRef.current);
    if (!best || elapsed < best) saveBest(elapsed);
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  function flip(i) {
    if (cards[i].open || cards[i].done || sel.length === 2) return;
    setCards(cs => cs.map((c,idx) => idx === i ? {...c, open:true} : c));
    setSel(s => [...s, i]);
  }
  function reset(){
    setCards(shuffledPairs());
    setSel([]);
    startRef.current = null;
  }

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          {finished ? "You matched them all! 🎉" : "Find all pairs"}
          {best != null && <span style={{ marginLeft: 10 }}>Best: {best} ms</span>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,56px)", gap:8 }}>
          {cards.map((c,i)=>(
            <button key={c.id} onClick={()=>flip(i)}
              style={{
                width:56, height:56, fontSize:24,
                background: c.open || c.done ? "#242424" : "#0f0f0f",
                border: c.done ? "2px solid #2ecc71" : "1px solid #444", color:"#fff"
              }}>
              {(c.open || c.done) ? c.v : "?"}
            </button>
          ))}
        </div>
        <button onClick={reset} style={{ marginTop:10 }}>New game</button>
      </div>

      {/* Leaderboard beside the game */}
      <div style={{ width: 320 }}>
        <MemoryLeaderboard refreshKey={refreshKey} apiBase={API} prefix="/games" />
      </div>
    </div>
  );
}

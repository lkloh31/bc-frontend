import { useEffect, useRef, useState } from "react";

const pads = [
  { id: 0, label: "G", color: "#2ecc71" },
  { id: 1, label: "R", color: "#e74c3c" },
  { id: 2, label: "B", color: "#3498db" },
  { id: 3, label: "Y", color: "#f1c40f" },
];

export default function Simon() {
  const [seq, setSeq] = useState([]);     // computer sequence
  const [user, setUser] = useState([]);   // player progress
  const [active, setActive] = useState(null);
  const [playingBack, setPlayingBack] = useState(false);
  const [level, setLevel] = useState(0);
  const audioCtx = useRef(null);

  function tone(i) {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 300 + i * 120;
    gain.gain.value = 0.04;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); setTimeout(() => osc.stop(), 180);
  }

  function start() {
    setSeq([randPad()]);
    setUser([]);
    setLevel(1);
  }

  // playback whenever seq changes
  useEffect(() => {
    if (seq.length === 0) return;
    setPlayingBack(true);
    let i = 0;
    const timer = setInterval(() => {
      setActive(seq[i]); tone(seq[i]);
      setTimeout(() => setActive(null), 220);
      i++;
      if (i >= seq.length) {
        clearInterval(timer);
        setTimeout(() => setPlayingBack(false), 250);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [seq]);

  function press(i) {
    if (playingBack || active !== null) return;
    tone(i); setActive(i); setTimeout(() => setActive(null), 150);

    const next = [...user, i];
    setUser(next);

    // compare against sequence so far
    const idx = next.length - 1;
    if (next[idx] !== seq[idx]) {
      // wrong → reset progress, keep same sequence
      setUser([]);
      flashError();
      return;
    }

    // sequence complete → extend
    if (next.length === seq.length) {
      setUser([]);
      setTimeout(() => {
        setSeq(s => [...s, randPad()]);
        setLevel(l => l + 1);
      }, 400);
    }
  }

  function flashError() {
    setActive(-1);
    setTimeout(() => setActive(null), 300);
  }

  function reset() {
    setSeq([]);
    setUser([]);
    setPlayingBack(false);
    setLevel(0);
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>
        {seq.length === 0 ? "Press Start" : playingBack ? "Watch the sequence…" : "Your turn"}
        {level > 0 && ` — Level ${level}`}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 96px)", gap: 10 }}>
        {pads.map(p => (
          <button
            key={p.id}
            onClick={() => press(p.id)}
            disabled={seq.length === 0}
            style={{
              width: 96, height: 96, borderRadius: 12, border: "1px solid #444",
              background: active === p.id ? lighten(p.color) : p.color,
              color: "#111", fontWeight: 700, fontSize: 18
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button onClick={start}>Start</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

function randPad() { return Math.floor(Math.random() * 4); }
function lighten(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 40);
  const g = Math.min(255, ((n >> 8) & 255) + 40);
  const b = Math.min(255, (n & 255) + 40);
  return `rgb(${r},${g},${b})`;
}

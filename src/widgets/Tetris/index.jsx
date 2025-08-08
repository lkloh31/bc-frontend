import { useEffect, useMemo, useRef, useState } from "react";

export const meta = {
  id: "tetris",
  name: "Tetris",
  defaultProps: { tickMs: 500 }, // lower = faster
  settingsSchema: [{ key: "tickMs", type: "number", label: "Speed (ms)" }],
};

const W = 10, H = 20;

// 7 tetrominoes (I, O, T, S, Z, J, L) with rotation states
const SHAPES = {
  I: [
    [[1,1,1,1]],
    [[1],[1],[1],[1]],
  ],
  O: [
    [[1,1],[1,1]],
  ],
  T: [
    [[1,1,1],[0,1,0]],
    [[1,0],[1,1],[1,0]],
    [[0,1,0],[1,1,1]],
    [[0,1],[1,1],[0,1]],
  ],
  S: [
    [[0,1,1],[1,1,0]],
    [[1,0],[1,1],[0,1]],
  ],
  Z: [
    [[1,1,0],[0,1,1]],
    [[0,1],[1,1],[1,0]],
  ],
  J: [
    [[1,0,0],[1,1,1]],
    [[1,1],[1,0],[1,0]],
    [[1,1,1],[0,0,1]],
    [[0,1],[0,1],[1,1]],
  ],
  L: [
    [[0,0,1],[1,1,1]],
    [[1,0],[1,0],[1,1]],
    [[1,1,1],[1,0,0]],
    [[1,1],[0,1],[0,1]],
  ],
};

const COLORS = {
  I: "#3dd6ff",
  O: "#ffd43d",
  T: "#b23dff",
  S: "#43d675",
  Z: "#ff5e5e",
  J: "#4f7bff",
  L: "#ffa64d",
};

function emptyBoard() {
  return Array.from({ length: H }, () => Array(W).fill(null));
}

function randomPiece() {
  const keys = Object.keys(SHAPES);
  const kind = keys[(Math.random() * keys.length) | 0];
  return { kind, rot: 0, x: 3, y: 0 };
}

function getMatrix(p) {
  const mats = SHAPES[p.kind];
  return mats[p.rot % mats.length];
}

function collide(board, p) {
  const m = getMatrix(p);
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[0].length; c++) {
      if (!m[r][c]) continue;
      const y = p.y + r, x = p.x + c;
      if (x < 0 || x >= W || y >= H) return true;
      if (y >= 0 && board[y][x]) return true;
    }
  }
  return false;
}

function merge(board, p) {
  const m = getMatrix(p);
  const color = COLORS[p.kind];
  const next = board.map(row => row.slice());
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[0].length; c++) {
      if (m[r][c]) {
        const y = p.y + r, x = p.x + c;
        if (y >= 0) next[y][x] = color;
      }
    }
  }
  return next;
}

export default function Tetris({ tickMs = 500 }) {
  const [board, setBoard] = useState(emptyBoard);
  const [curr, setCurr] = useState(randomPiece);
  const [next, setNext] = useState(randomPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const tickRef = useRef();
  const speed = useMemo(() => Math.max(100, tickMs), [tickMs]);

  // gravity
  useEffect(() => {
    if (paused || gameOver) return;
    tickRef.current = setInterval(() => step("down"), speed);
    return () => clearInterval(tickRef.current);
  }, [paused, gameOver, speed, curr, board]);

  // keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (gameOver) return;
      if (e.key === "p") { setPaused(p => !p); return; }
      if (e.key === "r") { reset(); return; }
      if (paused) return;

      if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") step("left");
      if (e.key === "ArrowRight") step("right");
      if (e.key === "ArrowDown") step("down");
      if (e.key === "ArrowUp") step("rot");
      if (e.key === " ") hardDrop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, gameOver, board, curr]);

  function reset() {
    setBoard(emptyBoard());
    setCurr(randomPiece());
    setNext(randomPiece());
    setScore(0);
    setLines(0);
    setPaused(false);
    setGameOver(false);
  }

  function step(action) {
    setCurr((p) => {
      let q = { ...p };
      if (action === "left") q.x -= 1;
      if (action === "right") q.x += 1;
      if (action === "down") q.y += 1;
      if (action === "rot") q = { ...q, rot: q.rot + 1 };

      if (!collide(board, q)) return q;

      if (action === "down" || action === "hard") {
        // lock piece
        const merged = merge(board, p);
        // clear lines
        let cleared = 0;
        const remain = merged.filter(row => row.some(cell => !cell)); // rows with at least one empty
        cleared = H - remain.length;
        const nextBoard = [
          ...Array.from({ length: cleared }, () => Array(W).fill(null)),
          ...remain,
        ];
        if (cleared) {
          setLines((L) => L + cleared);
          setScore((S) => S + [0, 100, 300, 500, 800][cleared] || 0);
        }
        // spawn new piece
        const n = next;
        setBoard(nextBoard);
        setCurr({ ...n, x: 3, y: 0, rot: 0 });
        setNext(randomPiece());
        // game over check
        if (collide(nextBoard, { ...n, x: 3, y: 0, rot: 0 })) {
          setGameOver(true);
          setPaused(true);
        }
      }
      return p;
    });
  }

  function hardDrop() {
    setCurr((p) => {
      let q = { ...p };
      while (!collide(board, { ...q, y: q.y + 1 })) q.y += 1;
      // lock
      const merged = merge(board, q);
      let cleared = 0;
      const remain = merged.filter(row => row.some(cell => !cell));
      cleared = H - remain.length;
      const nextBoard = [
        ...Array.from({ length: cleared }, () => Array(W).fill(null)),
        ...remain,
      ];
      if (cleared) {
        setLines((L) => L + cleared);
        setScore((S) => S + [0, 100, 300, 500, 800][cleared] || 0);
      }
      const n = next;
      setBoard(nextBoard);
      setCurr({ ...n, x: 3, y: 0, rot: 0 });
      setNext(randomPiece());
      if (collide(nextBoard, { ...n, x: 3, y: 0, rot: 0 })) {
        setGameOver(true);
        setPaused(true);
      }
      return q;
    });
  }

  // render
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${W}, 20px)`,
          gridAutoRows: "20px",
          background: "#111",
          padding: 6,
          borderRadius: 6,
          border: "1px solid #333",
        }}
      >
        {merge(board, curr).flat().map((cell, i) => (
          <div
            key={i}
            style={{
              width: 20,
              height: 20,
              background: cell ? cell : "#1b1b1b",
              outline: "1px solid #222",
            }}
          />
        ))}
      </div>

      <div style={{ minWidth: 140 }}>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>Tetris</div>
        <div style={{ marginBottom: 6 }}>Score: {score}</div>
        <div style={{ marginBottom: 6 }}>Lines: {lines}</div>
        <div style={{ marginBottom: 6 }}>
          Next:
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(4, 14px)`,
              gridAutoRows: "14px",
              background: "#111",
              padding: 4,
              marginTop: 4,
              width: 56,
              borderRadius: 4,
              border: "1px solid #333",
            }}
          >
            {(() => {
              const m = getMatrix(next);
              // center in 4x4 preview
              const grid = Array.from({ length: 4 }, () => Array(4).fill(null));
              for (let r = 0; r < m.length; r++) {
                for (let c = 0; c < m[0].length; c++) {
                  if (m[r][c]) grid[r][c] = COLORS[next.kind];
                }
              }
              return grid.flat().map((cell, i) => (
                <div key={i} style={{ width: 14, height: 14, background: cell || "#1b1b1b", outline: "1px solid #222" }} />
              ));
            })()}
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.8, lineHeight: 1.4 }}>
          ↑ rotate • ↓ soft drop • ←/→ move • Space hard drop • P pause • R reset
        </div>

        <div style={{ marginTop: 8 }}>
          <button onClick={() => setPaused(p => !p)}>{paused ? "Resume" : "Pause"}</button>
          <button onClick={reset} style={{ marginLeft: 8 }}>Reset</button>
        </div>

        {gameOver && <div style={{ color: "#ff6961", marginTop: 8 }}>Game Over</div>}
      </div>
    </div>
  );
}

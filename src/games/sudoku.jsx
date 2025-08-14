import { useState } from "react";

// 0 = empty cell
const PUZZLE = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9],
];

const SOLUTION = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9],
];

export default function Sudoku() {
  const [grid, setGrid] = useState(PUZZLE.map(r => r.slice()));
  const [checked, setChecked] = useState(false);

  const fixed = PUZZLE.map(row => row.map(v => v !== 0));
  const solved = isSolved(grid);

  function onChange(r, c, e) {
    const v = e.target.value.replace(/[^\d]/g, "").slice(0,1); // allow 1 digit
    setChecked(false);
    setGrid(g => {
      const copy = g.map(row => row.slice());
      copy[r][c] = v ? Number(v) : 0;
      return copy;
    });
  }

  function check() {
    setChecked(true);
  }

  function solve() {
    setGrid(SOLUTION.map(r => r.slice()));
    setChecked(true);
  }

  function reset() {
    setGrid(PUZZLE.map(r => r.slice()));
    setChecked(false);
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>
        {solved ? "Solved! 🎉" : "Fill the grid (1–9)."}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 36px)",
          gap: 2,
          border: "2px solid #444",
          padding: 4,
          background: "#111",
          width: "fit-content"
        }}
      >
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isFixed = fixed[r][c];
            const correct = val !== 0 && val === SOLUTION[r][c];
            const wrong = checked && val !== 0 && val !== SOLUTION[r][c];

            const thickRight = (c === 2 || c === 5) ? "2px solid #666" : "1px solid #333";
            const thickBottom = (r === 2 || r === 5) ? "2px solid #666" : "1px solid #333";

            return isFixed ? (
              <div
                key={`${r}-${c}`}
                style={{
                  width: 36, height: 36, display: "grid", placeItems: "center",
                  background: "#1f1f1f", color: "#eaeaea",
                  borderRight: thickRight, borderBottom: thickBottom, fontWeight: 700
                }}
              >
                {PUZZLE[r][c]}
              </div>
            ) : (
              <input
                key={`${r}-${c}`}
                value={val || ""}
                onChange={(e) => onChange(r, c, e)}
                inputMode="numeric"
                style={{
                  width: 36, height: 36, textAlign: "center",
                  background: wrong ? "#3b0f0f" : "#0f0f0f",
                  color: "#fff", border: "1px solid #333",
                  borderRight: thickRight, borderBottom: thickBottom,
                  outline: correct ? "2px solid #2ecc71" : "none",
                }}
              />
            );
          })
        )}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button onClick={check}>Check</button>
        <button onClick={solve}>Solve</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

function isSolved(g) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (g[r][c] !== SOLUTION[r][c]) return false;
    }
  }
  return true;
}

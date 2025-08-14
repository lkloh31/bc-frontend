import { useEffect, useState } from "react";

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null)); // 0..8
  const [xTurn, setXTurn] = useState(true);                // you = X, bot = O

  const winner = getWinner(board);
  const full = board.every(Boolean);
  const draw = !winner && full;

  // Status text
  const status = winner
    ? `${winner} wins!`
    : draw
    ? "Draw!"
    : xTurn
    ? "Your turn (X)"
    : "Computer thinking…";

  // Handle your (X) move
  function click(i) {
    if (winner || !xTurn || board[i]) return;        // block if not your turn / game over / occupied
    setBoard(prev => {
      const next = prev.slice();
      next[i] = "X";
      return next;
    });
    setXTurn(false);                                  // hand over to bot
  }

  // Bot (O) makes a random move after you
  useEffect(() => {
    if (winner || draw || xTurn) return;              // only when it's bot's turn
    const empty = board.map((v, i) => (v ? null : i)).filter(i => i !== null);
    if (empty.length === 0) return;

    const idx = empty[Math.floor(Math.random() * empty.length)];
    const t = setTimeout(() => {
      setBoard(prev => {
        // safety check in case user somehow changed state
        if (prev[idx]) return prev;
        const next = prev.slice();
        next[idx] = "O";
        return next;
      });
      setXTurn(true);                                 // back to you
    }, 450);                                          // small delay feels nicer
    return () => clearTimeout(t);
  }, [xTurn, board, winner, draw]);

  function reset() {
    setBoard(Array(9).fill(null));
    setXTurn(true);
  }

  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{status}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,64px)", gap: 6 }}>
        {board.map((val, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            disabled={!!winner || !!val || !xTurn}  // disable during bot's turn & after game end
            style={{
              width: 64,
              height: 64,
              fontSize: 24,
              border: "1px solid #444",
              background: val ? "#1c1c1c" : "#0f0f0f",
              color: "#fff",
              opacity: !xTurn && !val && !winner ? 0.85 : 1,
              cursor: winner || val || !xTurn ? "default" : "pointer",
            }}
          >
            {val}
          </button>
        ))}
      </div>

      <button onClick={reset} style={{ marginTop: 10 }}>New game</button>
    </div>
  );
}

// helper: find a winner on the board
function getWinner(b) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6],         // diags
  ];
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

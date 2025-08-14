import MemoryMatch from "./memorymatch.jsx";
import Reaction    from "./reaction.jsx";
import TicTacToe   from "./tictactoe.jsx";
import Sudoku      from "./sudoku.jsx";
import Simon       from "./simon.jsx";

export const games = [
  { id: "memory",    name: "Memory Match",  Component: MemoryMatch },
  { id: "reaction",  name: "Reaction Test", Component: Reaction },
  { id: "tictactoe", name: "Tic-Tac-Toe",   Component: TicTacToe },
  { id: "sudoku",    name: "Sudoku",        Component: Sudoku },
  { id: "simon",     name: "Simon",         Component: Simon },
];

export type PlayerColor = "red" | "black";

export type BoardSquare = {
  row: number;
  col: number;
};

export type Piece = {
  id: string;
  color: PlayerColor;
  row: number;
  col: number;
};

export type MoveRecord = {
  id: string;
  color: PlayerColor;
  from: BoardSquare;
  to: BoardSquare;
  notation: string;
  timestamp: string;
};

export type GameMode = "human-vs-ai" | "ai-vs-ai";

export type Strategy = "minimax" | "astar";

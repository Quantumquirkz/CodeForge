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

export type DecisionTreeNode = {
  id: string;
  name: string;
  value?: number | string;
  children?: DecisionTreeNode[];
  symbol?: string;
  symbolSize?: number | number[];
  collapsed?: boolean;
  score?: number;
  bestChild?: boolean;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowBlur?: number;
    shadowColor?: string;
  };
  label?: {
    color?: string;
    fontWeight?: number | string;
    fontSize?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number | number[];
    position?: string;
    align?: string;
    verticalAlign?: string;
  };
  tooltip?: {
    formatter?: string;
  };
};

export const BOARD_SIZE = 8;

export type Player = "red" | "black";

export type MoveKind = "slide" | "jump";

export interface Position {
  row: number;
  col: number;
}

export interface Direction {
  dr: number;
  dc: number;
  label: string;
}

export interface MoveStep {
  from: CellIndex;
  over: CellIndex;
  to: CellIndex;
  direction: Direction;
}

export type CellIndex = number;

export interface GameState {
  red: bigint;
  black: bigint;
  turn: Player;
}

export interface Move {
  player: Player;
  from: CellIndex;
  to: CellIndex;
  kind: MoveKind;
  path: CellIndex[];
  steps: MoveStep[];
}

export interface SearchStats {
  expandedNodes: number;
  visitedStates: number;
  durationMs: number;
  depthReached: number;
  reason: string;
}

export interface SearchResult {
  found: boolean;
  moves: Move[];
  finalState: GameState;
  stats: SearchStats;
}

export interface MoveSelectionResult {
  move: Move | null;
  score: number;
  stats: SearchStats;
}

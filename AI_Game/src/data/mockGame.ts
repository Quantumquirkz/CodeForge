import type { Piece } from "../types/game";
import { initialPieces as engineInitialPieces } from "../utils/game";

export const BOARD_SIZE = 8;

export const COLUMN_LABELS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export const INITIAL_PIECES: Piece[] = engineInitialPieces();

export const HEURISTIC_SERIES = {
  red: [] as number[],
  black: [] as number[]
};

export const CHART_X_TICKS: number[] = [];
export const CHART_Y_TICKS = [60, 30, 0, -30, -60];

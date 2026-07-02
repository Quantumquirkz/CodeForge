import { indexFromPosition, positionFromIndex, indicesFromMask, addCell } from "../engine/board";
import { generateMoves, initialState } from "../engine/rules";
import type { GameState, CellIndex, Move } from "../engine/types";
import { BOARD_SIZE, COLUMN_LABELS } from "../data/boardConstants";
import type { BoardSquare, MoveRecord, Piece, PlayerColor } from "../types/game";

const RED_IDS = ["r1", "r2", "r3", "r4", "r5", "r6"] as const;
const BLACK_IDS = ["n1", "n2", "n3", "n4", "n5", "n6"] as const;

/* ── Coordinate conversion ─────────────────────────────────── */

export function engineRowToUiRow(engineRow: number): number {
  return BOARD_SIZE - engineRow;
}

export function uiRowToEngineRow(uiRow: number): number {
  return BOARD_SIZE - uiRow;
}

export function engineIndexToBoardSquare(index: CellIndex): BoardSquare {
  const pos = positionFromIndex(index);
  return { row: engineRowToUiRow(pos.row), col: pos.col };
}

export function boardSquareToEngineIndex(square: BoardSquare): CellIndex {
  return indexFromPosition(uiRowToEngineRow(square.row), square.col);
}

/* ── State conversion ──────────────────────────────────────── */

export function piecesToEngineState(pieces: Piece[], turn: PlayerColor): GameState {
  let red = 0n;
  let black = 0n;
  for (const piece of pieces) {
    const idx = indexFromPosition(uiRowToEngineRow(piece.row), piece.col);
    if (piece.color === "red") {
      red = addCell(red, idx);
    } else {
      black = addCell(black, idx);
    }
  }
  return { red, black, turn };
}

export function engineStateToPieces(state: GameState): Piece[] {
  const pieces: Piece[] = [];
  let ri = 0;
  for (const idx of indicesFromMask(state.red)) {
    const pos = positionFromIndex(idx);
    pieces.push({
      id: RED_IDS[ri++],
      color: "red",
      row: engineRowToUiRow(pos.row),
      col: pos.col
    });
  }
  let bi = 0;
  for (const idx of indicesFromMask(state.black)) {
    const pos = positionFromIndex(idx);
    pieces.push({
      id: BLACK_IDS[bi++],
      color: "black",
      row: engineRowToUiRow(pos.row),
      col: pos.col
    });
  }
  return pieces;
}

/* ── Engine-derived legal moves for a specific piece ───────── */

export function generateLegalMovesForPiece(piece: Piece, pieces: Piece[], turn: PlayerColor): Move[] {
  const state = piecesToEngineState(pieces, turn);
  const pieceEngineIdx = boardSquareToEngineIndex({ row: piece.row, col: piece.col });
  const allMoves = generateMoves(state, piece.color);
  return allMoves
    .filter((move) => move.from === pieceEngineIdx)
    .sort((a, b) => b.path.length - a.path.length || a.to - b.to);
}

export function countLegalMovesForColor(color: PlayerColor, pieces: Piece[], turn: PlayerColor): number {
  const state = piecesToEngineState(pieces, turn);
  const allMoves = generateMoves(state, color);
  return allMoves.filter((move) => move.player === color).length;
}

/* ── Utility helpers ───────────────────────────────────────── */

export function squareToNotation(square: BoardSquare): string {
  return `${COLUMN_LABELS[square.col]}${square.row}`;
}

export function isSameSquare(a: BoardSquare, b: BoardSquare): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isOccupied(row: number, col: number, pieces: Piece[]): boolean {
  return pieces.some((piece) => piece.row === row && piece.col === col);
}

export function getPieceAt(row: number, col: number, pieces: Piece[]): Piece | undefined {
  return pieces.find((piece) => piece.row === row && piece.col === col);
}

export function squareKey(square: BoardSquare): string {
  return `${square.row}:${square.col}`;
}

export function createMoveRecord(
  color: PlayerColor,
  from: BoardSquare,
  to: BoardSquare,
  index: number,
  route?: BoardSquare[]
): MoveRecord {
  const notationRoute = route && route.length > 0 ? route : [from, to];
  return {
    id: `move-${index + 1}`,
    color,
    from,
    to,
    notation: `${color === "red" ? "Rojo" : "Negro"}: ${notationRoute.map(squareToNotation).join(" -> ")}`,
    timestamp: new Date().toLocaleTimeString("es-PA", { hour: "2-digit", minute: "2-digit" })
  };
}

function escapeCsv(value: string): string {
  if (/[",\n\r;]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function moveLogToCsv(moveLog: MoveRecord[]): string {
  const header = [
    "id",
    "color",
    "from",
    "to",
    "notation",
    "timestamp"
  ];

  const rows = moveLog.map((record) => [
    record.id,
    record.color === "red" ? "Rojo" : "Negro",
    squareToNotation(record.from),
    squareToNotation(record.to),
    record.notation,
    record.timestamp
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");
}

export function initialPieces(): Piece[] {
  return engineStateToPieces(initialState());
}

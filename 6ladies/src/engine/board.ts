import { BOARD_SIZE, type CellIndex, type Player, type Position } from "./types";

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function indexFromPosition(row: number, col: number): CellIndex {
  return row * BOARD_SIZE + col;
}

export function positionFromIndex(index: CellIndex): Position {
  return {
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE
  };
}

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function cellBit(index: CellIndex): bigint {
  return 1n << BigInt(index);
}

export function hasCell(mask: bigint, index: CellIndex): boolean {
  return (mask & cellBit(index)) !== 0n;
}

export function addCell(mask: bigint, index: CellIndex): bigint {
  return mask | cellBit(index);
}

export function removeCell(mask: bigint, index: CellIndex): bigint {
  return mask & ~cellBit(index);
}

export function indicesFromMask(mask: bigint): CellIndex[] {
  const cells: CellIndex[] = [];
  for (let index = 0; index < BOARD_SIZE * BOARD_SIZE; index += 1) {
    if (hasCell(mask, index)) {
      cells.push(index);
    }
  }
  return cells;
}

export function maskFromIndices(indices: CellIndex[]): bigint {
  return indices.reduce((mask, index) => addCell(mask, index), 0n);
}

export function squareName(index: CellIndex): string {
  const { row, col } = positionFromIndex(index);
  return `${FILES[col]}${BOARD_SIZE - row}`;
}

export function maskKey(mask: bigint): string {
  return mask.toString(36);
}

export function stateKey(red: bigint, black: bigint, turn: Player): string {
  return `${maskKey(red)}:${maskKey(black)}:${turn}`;
}

export function distanceManhattan(a: CellIndex, b: CellIndex): number {
  const pa = positionFromIndex(a);
  const pb = positionFromIndex(b);
  return Math.abs(pa.row - pb.row) + Math.abs(pa.col - pb.col);
}

export function distanceChebyshev(a: CellIndex, b: CellIndex): number {
  const pa = positionFromIndex(a);
  const pb = positionFromIndex(b);
  return Math.max(Math.abs(pa.row - pb.row), Math.abs(pa.col - pb.col));
}

export function mirroredIndex(index: CellIndex): CellIndex {
  const { row, col } = positionFromIndex(index);
  return indexFromPosition(BOARD_SIZE - 1 - row, BOARD_SIZE - 1 - col);
}


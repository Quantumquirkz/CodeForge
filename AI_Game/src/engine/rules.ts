import {
  addCell,
  distanceChebyshev,
  hasCell,
  indexFromPosition,
  inBounds,
  indicesFromMask,
  maskFromIndices,
  positionFromIndex,
  stateKey
} from "./board";
import type { Direction, GameState, Move, Player, CellIndex } from "./types";

const ALL_DIRECTIONS: Direction[] = [
  { dr: -1, dc: -1, label: "up-left" },
  { dr: -1, dc: 0, label: "up" },
  { dr: -1, dc: 1, label: "up-right" },
  { dr: 0, dc: -1, label: "left" },
  { dr: 0, dc: 1, label: "right" },
  { dr: 1, dc: -1, label: "down-left" },
  { dr: 1, dc: 0, label: "down" },
  { dr: 1, dc: 1, label: "down-right" }
];

const START_FORMATION: CellIndex[] = [
  indexFromPosition(4, 0),
  indexFromPosition(5, 1),
  indexFromPosition(6, 0),
  indexFromPosition(6, 2),
  indexFromPosition(7, 1),
  indexFromPosition(7, 3)
];

export function initialState(): GameState {
  return {
    red: maskFromIndices(START_FORMATION),
    black: maskFromIndices(START_FORMATION.map((cell) => mirroredIndex(cell))),
    turn: "red"
  };
}

export function mirroredIndex(index: CellIndex): CellIndex {
  const { row, col } = positionFromIndex(index);
  return indexFromPosition(7 - row, 7 - col);
}

export function goalCells(player: Player): CellIndex[] {
  return player === "red"
    ? START_FORMATION.map((cell) => mirroredIndex(cell))
    : START_FORMATION;
}

export function goalMask(player: Player): bigint {
  return maskFromIndices(goalCells(player));
}

export function isGoalReached(state: GameState, player: Player): boolean {
  return (state[player] & goalMask(player)) === goalMask(player);
}

export function winner(state: GameState): Player | null {
  if (isGoalReached(state, "red")) {
    return "red";
  }
  if (isGoalReached(state, "black")) {
    return "black";
  }
  return null;
}

export function otherPlayer(player: Player): Player {
  return player === "red" ? "black" : "red";
}

function minDistToGoal(from: CellIndex, player: Player): number {
  return Math.min(...goalCells(player).map((g) => distanceChebyshev(from, g)));
}

export function generateMoves(state: GameState, player: Player = state.turn): Move[] {
  if (winner(state)) {
    return [];
  }

  const ownMask = state[player];
  const occupied = state.red | state.black;
  const moves: Move[] = [];

  for (const from of indicesFromMask(ownMask)) {
    const fromDist = minDistToGoal(from, player);
    const pos = positionFromIndex(from);

    for (const direction of ALL_DIRECTIONS) {
      const overRow = pos.row + direction.dr;
      const overCol = pos.col + direction.dc;
      const landRow = pos.row + 2 * direction.dr;
      const landCol = pos.col + 2 * direction.dc;

      if (!inBounds(landRow, landCol)) continue;

      const over = indexFromPosition(overRow, overCol);
      const land = indexFromPosition(landRow, landCol);

      if (!hasCell(occupied, over)) continue;
      if (hasCell(occupied, land)) continue;

      const landDist = minDistToGoal(land, player);
      if (landDist > fromDist) continue;

      moves.push({
        player,
        from,
        to: land,
        kind: "jump",
        direction,
        path: [from, over, land]
      });
    }
  }

  return moves;
}

export function applyMove(state: GameState, move: Move): GameState {
  if (state.turn !== move.player) {
    throw new Error("It is not that player's turn.");
  }

  const legal = generateMoves(state, move.player).some(
    (candidate) => candidate.from === move.from && candidate.to === move.to
  );

  if (!legal) {
    throw new Error("Illegal move.");
  }

  const nextOwn = addCell(state[move.player], move.to);
  const nextOwnCleared = nextOwn & ~addCell(0n, move.from);

  return move.player === "red"
    ? { red: nextOwnCleared, black: state.black, turn: otherPlayer(move.player) }
    : { red: state.red, black: nextOwnCleared, turn: otherPlayer(move.player) };
}

export function boardOccupancy(state: GameState): bigint {
  return state.red | state.black;
}

export function occupiedBy(state: GameState, index: CellIndex): Player | null {
  if (hasCell(state.red, index)) {
    return "red";
  }
  if (hasCell(state.black, index)) {
    return "black";
  }
  return null;
}

export function isSameState(a: GameState, b: GameState): boolean {
  return stateKey(a.red, a.black, a.turn) === stateKey(b.red, b.black, b.turn);
}

export function pieceDistancesToGoals(state: GameState, player: Player): number[] {
  return indicesFromMask(state[player]).map((piece) => minDistToGoal(piece, player));
}


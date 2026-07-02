import {
  addCell,
  cellBit,
  distanceChebyshev,
  hasCell,
  indexFromPosition,
  inBounds,
  indicesFromMask,
  maskFromIndices,
  mirroredIndex,
  positionFromIndex,
  removeCell,
  stateKey
} from "./board";
import type { Direction, GameState, Move, MoveStep, Player, CellIndex } from "./types";

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

export function goalCells(player: Player): CellIndex[] {
  return player === "red"
    ? START_FORMATION.map((cell) => mirroredIndex(cell))
    : START_FORMATION;
}

export function goalMask(player: Player): bigint {
  return maskFromIndices(goalCells(player));
}

export function isGoalReached(state: GameState, player: Player): boolean {
  return state[player] === goalMask(player);
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

export function isForwardProgress(from: CellIndex, to: CellIndex, player: Player): boolean {
  return minDistToGoal(to, player) <= minDistToGoal(from, player);
}

function moveKey(move: Move): string {
  return `${move.player}:${move.from}:${move.to}:${move.path.join(",")}`;
}

function generateMoveSequences(
  state: GameState,
  player: Player,
  origin: CellIndex,
  current: CellIndex,
  moverMask: bigint,
  visitedLandings: Set<CellIndex>,
  steps: MoveStep[],
  path: CellIndex[],
  seen: Set<string>,
  moves: Move[]
): void {
  const currentPos = positionFromIndex(current);
  const occupied = ((state.red | state.black) & ~moverMask) | cellBit(current);

  for (const direction of ALL_DIRECTIONS) {
    const overRow = currentPos.row + direction.dr;
    const overCol = currentPos.col + direction.dc;
    const landRow = currentPos.row + 2 * direction.dr;
    const landCol = currentPos.col + 2 * direction.dc;

    if (!inBounds(overRow, overCol) || !inBounds(landRow, landCol)) {
      continue;
    }

    const over = indexFromPosition(overRow, overCol);
    const land = indexFromPosition(landRow, landCol);

    if (visitedLandings.has(land)) {
      continue;
    }
    if (!hasCell(occupied, over)) {
      continue;
    }
    if (hasCell(occupied, land)) {
      continue;
    }
    if (!isForwardProgress(current, land, player)) {
      continue;
    }

    const step: MoveStep = {
      from: current,
      over,
      to: land,
      direction
    };
    const nextSteps = [...steps, step];
    const nextPath = [...path, over, land];
    const nextMoverMask = addCell(moverMask, land);
    const nextMove: Move = {
      player,
      from: origin,
      to: land,
      kind: "jump",
      path: nextPath,
      steps: nextSteps
    };
    const key = moveKey(nextMove);
    if (!seen.has(key)) {
      seen.add(key);
      moves.push(nextMove);
    }

    const nextVisited = new Set(visitedLandings);
    nextVisited.add(land);
    generateMoveSequences(
      state,
      player,
      origin,
      land,
      nextMoverMask,
      nextVisited,
      nextSteps,
      nextPath,
      seen,
      moves
    );
  }
}

export function generateMoves(state: GameState, player: Player = state.turn): Move[] {
  if (winner(state)) {
    return [];
  }

  const ownMask = state[player];
  const moves: Move[] = [];
  const seen = new Set<string>();

  for (const from of indicesFromMask(ownMask)) {
    const startMask = addCell(0n, from);
    generateMoveSequences(
      state,
      player,
      from,
      from,
      startMask,
      new Set([from]),
      [],
      [from],
      seen,
      moves
    );
  }

  return moves;
}

function isSameMove(a: Move, b: Move): boolean {
  if (a.player !== b.player || a.from !== b.from || a.to !== b.to || a.kind !== b.kind) {
    return false;
  }
  if (a.path.length !== b.path.length || a.steps.length !== b.steps.length) {
    return false;
  }
  if (a.path.some((cell, index) => cell !== b.path[index])) {
    return false;
  }
  return a.steps.every(
    (step, index) =>
      step.from === b.steps[index].from &&
      step.over === b.steps[index].over &&
      step.to === b.steps[index].to &&
      step.direction.label === b.steps[index].direction.label
  );
}

export function applyMove(state: GameState, move: Move): GameState {
  if (winner(state)) {
    throw new Error("The game is already over.");
  }
  if (state.turn !== move.player) {
    throw new Error("It is not that player's turn.");
  }

  const legal = generateMoves(state, move.player).some((candidate) => isSameMove(candidate, move));

  if (!legal) {
    throw new Error("Illegal move.");
  }

  const nextOwn = addCell(removeCell(state[move.player], move.from), move.to);

  return move.player === "red"
    ? { red: nextOwn, black: state.black, turn: otherPlayer(move.player) }
    : { red: state.red, black: nextOwn, turn: otherPlayer(move.player) };
}

/** Indica si el jugador tiene al menos una jugada legal. */
export function hasAnyMove(state: GameState, player: Player = state.turn): boolean {
  return generateMoves(state, player).length > 0;
}

/**
 * Pasa el turno sin mover (se usa cuando el jugador al turno no tiene
 * jugadas legales; en un juego de solo saltos puede quedarse bloqueado).
 */
export function passTurn(state: GameState): GameState {
  return { red: state.red, black: state.black, turn: otherPlayer(state.turn) };
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

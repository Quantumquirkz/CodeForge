import {
  addCell,
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

function isForwardDirection(direction: Direction, player: Player): boolean {
  // El avance se define respecto a la esquina objetivo: rojo progresa hacia
  // arriba/derecha; negro, hacia abajo/izquierda. Cualquier componente opuesta
  // convertiría el salto en retroceso, aunque la distancia total disminuya.
  if (player === "red") {
    return direction.dr <= 0 && direction.dc >= 0 && (direction.dr !== 0 || direction.dc !== 0);
  }
  return direction.dr >= 0 && direction.dc <= 0 && (direction.dr !== 0 || direction.dc !== 0);
}

function moveKey(move: Move): string {
  return `${move.player}:${move.from}:${move.to}:${move.path.join(",")}`;
}

function generateJumpInDirection(
  state: GameState,
  player: Player,
  origin: CellIndex,
  direction: Direction,
  seen: Set<string>,
  moves: Move[]
): void {
  if (!isForwardDirection(direction, player)) {
    return;
  }

  const occupied = state.red | state.black;
  const originPos = positionFromIndex(origin);
  let row = originPos.row + direction.dr;
  let col = originPos.col + direction.dc;
  const crossed: CellIndex[] = [];

  while (inBounds(row, col)) {
    const current = indexFromPosition(row, col);
    // Se permite saltar una pieza o una cadena contigua; el aterrizaje debe
    // ser la primera casilla vacía después del bloque ocupado.
    if (hasCell(occupied, current)) {
      crossed.push(current);
      row += direction.dr;
      col += direction.dc;
      continue;
    }

    if (crossed.length === 0) {
      return;
    }

    const landing = current;
    const move: Move = {
      player,
      from: origin,
      to: landing,
      kind: "jump",
      path: [origin, ...crossed, landing],
      steps: [
        {
          from: origin,
          over: crossed[0],
          to: landing,
          direction
        }
      ]
    };

    const key = moveKey(move);
    if (!seen.has(key)) {
      seen.add(key);
      moves.push(move);
    }
    return;
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
    for (const direction of ALL_DIRECTIONS) {
      generateJumpInDirection(state, player, from, direction, seen, moves);
    }
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

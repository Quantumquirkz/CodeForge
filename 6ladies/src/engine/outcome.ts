import { distanceChebyshev, indicesFromMask, stateKey } from "./board";
import { generateMoves, goalCells, winner } from "./rules";
import { piecesOffGoal } from "./heuristics";
import type { GameState, Player } from "./types";

/** Resultado de la partida con su motivo (para mostrarlo en la interfaz). */
export interface GameOutcome {
  over: boolean;
  winner: Player | null; // null con over=true significa empate
  reason: string;
}

function totalDistanceToGoal(state: GameState, player: Player): number {
  const goals = goalCells(player);
  return indicesFromMask(state[player])
    .map((p) => Math.min(...goals.map((g) => distanceChebyshev(p, g))))
    .reduce((a, b) => a + b, 0);
}

/**
 * Adjudica una partida estancada (repeticion triple o bloqueo mutuo):
 * gana quien tenga mas fichas en su meta; si empatan, quien este mas cerca
 * (menor distancia total a la meta); si tambien empatan, es tablas.
 */
export function adjudicateStalledGame(state: GameState, cause: string): GameOutcome {
  const redOn = 6 - piecesOffGoal(state, "red");
  const blackOn = 6 - piecesOffGoal(state, "black");
  if (redOn !== blackOn) {
    const w: Player = redOn > blackOn ? "red" : "black";
    return { over: true, winner: w, reason: `${cause}: gana por mas fichas en meta (${Math.max(redOn, blackOn)} vs ${Math.min(redOn, blackOn)})` };
  }
  const redDist = totalDistanceToGoal(state, "red");
  const blackDist = totalDistanceToGoal(state, "black");
  if (redDist !== blackDist) {
    const w: Player = redDist < blackDist ? "red" : "black";
    return { over: true, winner: w, reason: `${cause}: gana por mayor cercania a la meta` };
  }
  return { over: true, winner: null, reason: `${cause}: empate (misma cantidad de fichas en meta y misma cercania)` };
}

/**
 * Evalua el estado de la partida considerando victoria directa, bloqueo mutuo
 * y repeticion triple (con el conteo de posiciones que lleve la interfaz).
 */
export function evaluateOutcome(
  state: GameState,
  positionCounts?: Map<string, number>
): GameOutcome {
  const w = winner(state);
  if (w) {
    return { over: true, winner: w, reason: "Formacion objetivo completada" };
  }
  const key = stateKey(state.red, state.black, state.turn);
  if (positionCounts && (positionCounts.get(key) ?? 0) >= 3) {
    return adjudicateStalledGame(state, "Repeticion triple de posicion");
  }
  const redMoves = generateMoves(state, "red").length;
  const blackMoves = generateMoves(state, "black").length;
  if (redMoves === 0 && blackMoves === 0) {
    return adjudicateStalledGame(state, "Bloqueo mutuo (ningun jugador puede mover)");
  }
  return { over: false, winner: null, reason: "" };
}

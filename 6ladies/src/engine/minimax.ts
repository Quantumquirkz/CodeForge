import { stateKey } from "./board";
import { evaluateState } from "./heuristics";
import { applyMove, generateMoves, isGoalReached, passTurn } from "./rules";
import type { GameState, Move, MoveSelectionResult, Player, SearchStats } from "./types";

/** Opciones de la busqueda adversaria. */
export interface MinimaxOptions {
  /** Presupuesto de tiempo (ms) para la profundizacion iterativa. */
  timeLimitMs?: number;
  /** Conteo de posiciones ya vistas en la partida, para penalizar repetirlas (anti-ciclos). */
  history?: Map<string, number>;
}

const REPEAT_PENALTY = 60;

function orderMoves(state: GameState, perspective: Player, moves: Move[]): Move[] {
  return moves
    .map((move) => ({ move, score: evaluateState(applyMove(state, move), perspective) }))
    .sort((a, b) => (state.turn === perspective ? b.score - a.score : a.score - b.score))
    .map((entry) => entry.move);
}

/**
 * Minimax con poda alfa-beta, tabla de transposicion, ordenamiento de jugadas
 * y PROFUNDIZACION ITERATIVA con limite de tiempo. Ademas penaliza las jugadas
 * que repiten posiciones recientes (evita que IA vs IA se quede en ciclos).
 */
export function chooseBestMove(
  state: GameState,
  perspective: Player,
  maxDepth = 3,
  options: MinimaxOptions = {}
): MoveSelectionResult {
  const startedAt = performance.now();
  const { timeLimitMs = 1500, history } = options;
  const other: Player = perspective === "red" ? "black" : "red";

  const stats = {
    expandedNodes: 0,
    visitedStates: 0,
    durationMs: 0,
    depthReached: 0,
    reason: "profundidad alcanzada"
  } satisfies SearchStats;

  const availableMoves = generateMoves(state, state.turn);
  if (availableMoves.length === 0) {
    stats.durationMs = performance.now() - startedAt;
    return { move: null, score: evaluateState(state, perspective), stats };
  }

  const alphabeta = (
    current: GameState,
    depth: number,
    alpha: number,
    beta: number,
    cache: Map<string, number>
  ): number => {
    stats.expandedNodes += 1;
    const terminal = isGoalReached(current, perspective)
      ? 100000 - (maxDepth - depth)
      : isGoalReached(current, other)
        ? -100000 + (maxDepth - depth)
        : null;

    if (terminal !== null || depth === 0) {
      return terminal ?? evaluateState(current, perspective);
    }

    const hash = `${stateKey(current.red, current.black, current.turn)}:${depth}:${perspective}`;
    const cached = cache.get(hash);
    if (cached !== undefined) {
      return cached;
    }

    const moves = orderMoves(current, perspective, generateMoves(current, current.turn));
    if (moves.length === 0) {
      // Sin jugadas: el turno pasa al rival (regla de bloqueo).
      const score = alphabeta(passTurn(current), depth - 1, alpha, beta, cache);
      cache.set(hash, score);
      return score;
    }

    let best = current.turn === perspective ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    for (const move of moves) {
      const next = applyMove(current, move);
      const score = alphabeta(next, depth - 1, alpha, beta, cache);
      if (current.turn === perspective) {
        best = Math.max(best, score);
        alpha = Math.max(alpha, best);
      } else {
        best = Math.min(best, score);
        beta = Math.min(beta, best);
      }
      if (beta <= alpha) {
        break;
      }
    }

    cache.set(hash, best);
    return best;
  };

  // Puntua cada jugada raiz a una profundidad dada.
  const scoreRoot = (depth: number): { move: Move; score: number }[] => {
    const cache = new Map<string, number>();
    return orderMoves(state, perspective, availableMoves).map((move) => {
      const next = applyMove(state, move);
      let score = alphabeta(next, depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, cache);
      // Anti-repeticion: desalienta volver a posiciones ya vistas
      // (la penalizacion crece con el numero de repeticiones).
      const seen = history?.get(stateKey(next.red, next.black, next.turn)) ?? 0;
      if (seen > 0) {
        score -= REPEAT_PENALTY * seen;
      }
      return { move, score };
    });
  };

  // Profundizacion iterativa: 1, 2, ... hasta maxDepth o hasta agotar el tiempo.
  let bestMove: Move = availableMoves[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const scored = scoreRoot(depth);
    let localBest = scored[0];
    for (const entry of scored) {
      if (entry.score > localBest.score) {
        localBest = entry;
      }
    }
    bestMove = localBest.move;
    bestScore = localBest.score;
    stats.depthReached = depth;
    if (performance.now() - startedAt > timeLimitMs) {
      stats.reason = "limite de tiempo";
      break;
    }
  }

  stats.durationMs = performance.now() - startedAt;
  return { move: bestMove, score: bestScore, stats };
}

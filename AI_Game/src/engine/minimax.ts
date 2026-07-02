import { stateKey } from "./board";
import { evaluateState } from "./heuristics";
import { applyMove, generateMoves, isGoalReached } from "./rules";
import type { GameState, Move, MoveSelectionResult, Player, SearchStats } from "./types";

interface SearchNode {
  score: number;
  move: Move | null;
}

function orderMoves(state: GameState, perspective: Player, moves: Move[]): Move[] {
  return moves
    .map((move) => ({
      move,
      score: evaluateState(applyMove(state, move), perspective)
    }))
    .sort((a, b) => (state.turn === perspective ? b.score - a.score : a.score - b.score))
    .map((entry) => entry.move);
}

export function chooseBestMove(
  state: GameState,
  perspective: Player,
  maxDepth = 3
): MoveSelectionResult {
  const startedAt = performance.now();
  const cache = new Map<string, number>();
  const stats = {
    expandedNodes: 0,
    visitedStates: 0,
    durationMs: 0,
    depthReached: 0,
    reason: "depth reached"
  } satisfies SearchStats;

  const alphabeta = (
    current: GameState,
    depth: number,
    alpha: number,
    beta: number
  ): number => {
    stats.expandedNodes += 1;
    const terminal = isGoalReached(current, perspective)
      ? 100000 - (maxDepth - depth)
      : isGoalReached(current, perspective === "red" ? "black" : "red")
        ? -100000 + (maxDepth - depth)
        : null;

    if (terminal !== null || depth === 0) {
      stats.depthReached = Math.max(stats.depthReached, maxDepth - depth);
      return terminal ?? evaluateState(current, perspective);
    }

    const hash = `${stateKey(current.red, current.black, current.turn)}:${depth}:${perspective}`;
    const cached = cache.get(hash);
    if (cached !== undefined) {
      return cached;
    }

    const moves = orderMoves(current, perspective, generateMoves(current, current.turn));
    if (moves.length === 0) {
      const score = evaluateState(current, perspective) - 50;
      cache.set(hash, score);
      return score;
    }

    let best = current.turn === perspective ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    for (const move of moves) {
      const next = applyMove(current, move);
      const score = alphabeta(next, depth - 1, alpha, beta);
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

  const availableMoves = generateMoves(state, state.turn);
  if (availableMoves.length === 0) {
    stats.durationMs = performance.now() - startedAt;
    stats.visitedStates = cache.size;
    return {
      move: null,
      score: evaluateState(state, perspective),
      stats
    };
  }

  const ordered = orderMoves(state, perspective, availableMoves);
  let bestMove: Move | null = null;
  let bestScore = state.turn === perspective ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

  for (const move of ordered) {
    const next = applyMove(state, move);
    const score = alphabeta(next, maxDepth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    if (
      (state.turn === perspective && score > bestScore) ||
      (state.turn !== perspective && score < bestScore) ||
      bestMove === null
    ) {
      bestMove = move;
      bestScore = score;
    }
  }

  stats.durationMs = performance.now() - startedAt;
  stats.visitedStates = cache.size;
  return {
    move: bestMove,
    score: bestScore,
    stats
  };
}


import { stateKey } from "./board";
import { admissibleMovesToGoal, estimateCostToGoal } from "./heuristics";
import { applyMove, generateMoves, isGoalReached } from "./rules";
import { PriorityQueue } from "./priorityQueue";
import type { GameState, Move, Player, SearchResult } from "./types";

interface AStarNode {
  state: GameState;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
  move: Move | null;
}

function reconstruct(node: AStarNode): Move[] {
  const moves: Move[] = [];
  let current: AStarNode | null = node;
  while (current?.move) {
    moves.push(current.move);
    current = current.parent;
  }
  return moves.reverse();
}

/**
 * Busqueda A* sobre el espacio de estados real (los turnos se alternan,
 * porque las casillas meta estan ocupadas por el rival y deben liberarse).
 *
 *   f(n) = g(n) + weight * h(n)
 *
 * - g(n): numero de jugadas realizadas.
 * - h(n): heuristica ADMISIBLE (fichas fuera de meta del jugador analizado).
 *
 * Con weight = 1 la heuristica es admisible y A* es OPTIMO (minimo numero de
 * jugadas). Con weight > 1 se obtiene A* ponderado: mas rapido, con una cota
 * de suboptimalidad de factor 'weight'. Las jugadas se ordenan por la
 * heuristica informativa (esto solo afecta a la velocidad, no a la optimalidad).
 */
export function solveWithAStar(
  start: GameState,
  perspective: Player,
  maxExpansions = 30000,
  weight = 2
): SearchResult {
  const startedAt = performance.now();
  const open = new PriorityQueue<AStarNode>((a, b) => a.f - b.f || a.h - b.h);
  const bestKnown = new Map<string, number>();
  const h0 = admissibleMovesToGoal(start, perspective);
  const root: AStarNode = { state: start, g: 0, h: h0, f: weight * h0, parent: null, move: null };

  open.push(root);
  bestKnown.set(stateKey(start.red, start.black, start.turn), 0);

  let expanded = 0;
  let bestFrontier = root;

  while (open.size > 0 && expanded < maxExpansions) {
    const current = open.pop();
    if (!current) {
      break;
    }

    expanded += 1;
    if (current.h < bestFrontier.h) {
      bestFrontier = current;
    }

    if (isGoalReached(current.state, perspective)) {
      const durationMs = performance.now() - startedAt;
      return {
        found: true,
        moves: reconstruct(current),
        finalState: current.state,
        stats: {
          expandedNodes: expanded,
          visitedStates: bestKnown.size,
          durationMs,
          depthReached: current.g,
          reason: weight === 1 ? "meta alcanzada (plan optimo)" : "meta alcanzada (A* ponderado)"
        }
      };
    }

    const ordered = generateMoves(current.state, current.state.turn)
      .map((move) => {
        const nextState = applyMove(current.state, move);
        return { move, nextState, order: estimateCostToGoal(nextState, perspective) };
      })
      .sort((a, b) => a.order - b.order);

    for (const candidate of ordered) {
      const nextG = current.g + 1;
      const hash = stateKey(candidate.nextState.red, candidate.nextState.black, candidate.nextState.turn);
      const known = bestKnown.get(hash);
      if (known !== undefined && known <= nextG) {
        continue;
      }

      bestKnown.set(hash, nextG);
      const h = admissibleMovesToGoal(candidate.nextState, perspective);
      const nextNode: AStarNode = {
        state: candidate.nextState,
        g: nextG,
        h,
        f: nextG + weight * h,
        parent: current,
        move: candidate.move
      };
      open.push(nextNode);
    }
  }

  const durationMs = performance.now() - startedAt;
  return {
    found: false,
    moves: reconstruct(bestFrontier),
    finalState: bestFrontier.state,
    stats: {
      expandedNodes: expanded,
      visitedStates: bestKnown.size,
      durationMs,
      depthReached: bestFrontier.g,
      reason: "presupuesto de expansiones agotado"
    }
  };
}

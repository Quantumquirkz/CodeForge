import { stateKey } from "./board";
import { estimateCostToGoal } from "./heuristics";
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

export function solveWithAStar(
  start: GameState,
  perspective: Player,
  maxExpansions = 5000
): SearchResult {
  const startedAt = performance.now();
  const open = new PriorityQueue<AStarNode>((a, b) => a.f - b.f || a.h - b.h);
  const bestKnown = new Map<string, number>();
  const root: AStarNode = {
    state: start,
    g: 0,
    h: estimateCostToGoal(start, perspective),
    f: estimateCostToGoal(start, perspective),
    parent: null,
    move: null
  };

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
          reason: "goal reached"
        }
      };
    }

    const moves = generateMoves(current.state, current.state.turn);
    const ordered = moves
      .map((move) => {
        const nextState = applyMove(current.state, move);
        return {
          move,
          nextState,
          heuristic: estimateCostToGoal(nextState, perspective)
        };
      })
      .sort((a, b) => a.heuristic - b.heuristic);

    for (const candidate of ordered) {
      const nextG = current.g + 1;
      const hash = stateKey(candidate.nextState.red, candidate.nextState.black, candidate.nextState.turn);
      const known = bestKnown.get(hash);
      if (known !== undefined && known <= nextG) {
        continue;
      }

      bestKnown.set(hash, nextG);
      const nextNode: AStarNode = {
        state: candidate.nextState,
        g: nextG,
        h: candidate.heuristic,
        f: nextG + candidate.heuristic,
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
      reason: "search budget exhausted"
    }
  };
}


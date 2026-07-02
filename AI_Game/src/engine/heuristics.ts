import { distanceChebyshev, indicesFromMask, stateKey } from "./board";
import { generateMoves, goalCells, goalMask } from "./rules";
import type { GameState, Player } from "./types";

type CostCache = Map<string, number>;

const costCache: CostCache = new Map();

function assignmentCost(matrix: number[][]): number {
  const size = matrix.length;
  const used = new Array<boolean>(size).fill(false);
  let best = Number.POSITIVE_INFINITY;

  const search = (row: number, cost: number): void => {
    if (cost >= best) {
      return;
    }
    if (row === size) {
      best = cost;
      return;
    }

    for (let col = 0; col < size; col += 1) {
      if (used[col]) {
        continue;
      }
      used[col] = true;
      search(row + 1, cost + matrix[row][col]);
      used[col] = false;
    }
  };

  search(0, 0);
  return best;
}

export function estimateCostToGoal(state: GameState, player: Player): number {
  const cacheKey = `${stateKey(state.red, state.black, player)}:cost`;
  const cached = costCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const pieces = indicesFromMask(state[player]);
  const goals = goalCells(player);

  const matrix = pieces.map((piece) => goals.map((goal) => distanceChebyshev(piece, goal)));
  const matchedDistance = assignmentCost(matrix);
  const onGoal = pieces.filter((piece) => (goalMask(player) & (1n << BigInt(piece))) !== 0n).length;
  const mobility = generateMoves(state, player).length;

  const blockedPenalty = pieces.length - new Set(generateMoves(state, player).map((move) => move.from)).size;
  const score = matchedDistance + (pieces.length - onGoal) * 2 + blockedPenalty * 1.5 - mobility * 0.1;

  costCache.set(cacheKey, score);
  return score;
}

export function evaluateState(state: GameState, perspective: Player): number {
  const opponent = perspective === "red" ? "black" : "red";
  const perspectiveCost = estimateCostToGoal(state, perspective);
  const opponentCost = estimateCostToGoal(state, opponent);
  const terminalBonus = hasWin(state, perspective) ? 10000 : hasWin(state, opponent) ? -10000 : 0;
  return opponentCost - perspectiveCost + terminalBonus;
}

export function hasWin(state: GameState, player: Player): boolean {
  return state[player] === goalMask(player);
}

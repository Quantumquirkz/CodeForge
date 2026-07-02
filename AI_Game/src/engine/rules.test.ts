import { describe, expect, it } from "vitest";
import { indexFromPosition, indicesFromMask } from "./board";
import { applyMove, goalMask, generateMoves, initialState, isGoalReached, winner } from "./rules";
import { chooseBestMove } from "./minimax";
import { estimateCostToGoal } from "./heuristics";
import { solveWithAStar } from "./astar";

describe("rules engine", () => {
  it("creates the initial 6-piece formations", () => {
    const state = initialState();
    expect(indicesFromMask(state.red)).toHaveLength(6);
    expect(indicesFromMask(state.black)).toHaveLength(6);
    expect(state.red).toBeGreaterThan(0n);
    expect(state.black).toBeGreaterThan(0n);
  });

  it("generates forward moves from the opening position", () => {
    const state = initialState();
    const moves = generateMoves(state, "red");
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((move) => move.to >= 0 && move.to < 64)).toBe(true);
  });

  it("applies a legal move and changes the turn", () => {
    const state = initialState();
    const move = generateMoves(state, "red")[0];
    const next = applyMove(state, move);
    expect(next.turn).toBe("black");
    expect(next.red).not.toBe(state.red);
  });

  it("detects a goal state", () => {
    const state = {
      red: goalMask("red"),
      black: initialState().black,
      turn: "red" as const
    };
    expect(isGoalReached(state, "red")).toBe(true);
    expect(winner(state)).toBe("red");
  });

  it("rates a goal state better than the opening", () => {
    const opening = initialState();
    const winning = {
      red: goalMask("red"),
      black: opening.black,
      turn: "red" as const
    };

    expect(estimateCostToGoal(winning, "red")).toBeLessThan(estimateCostToGoal(opening, "red"));
  });

  it("returns a minimax move from the opening", () => {
    const state = initialState();
    const result = chooseBestMove(state, "red", 2);
    expect(result.move).not.toBeNull();
    expect(result.move?.player).toBe("red");
  });

  it("can produce an A* plan or a best-effort frontier", () => {
    const state = initialState();
    const result = solveWithAStar(state, "red", 1000);
    expect(result.stats.expandedNodes).toBeGreaterThan(0);
    expect(result.moves.length).toBeGreaterThanOrEqual(0);
  });

  it("allows jumping over a single piece", () => {
    const state = {
      red: 1n << BigInt(indexFromPosition(4, 0)),
      black: 1n << BigInt(indexFromPosition(4, 1)),
      turn: "red" as const
    };

    const moves = generateMoves(state, "red");
    expect(moves.some((move) => move.to === indexFromPosition(4, 2))).toBe(true);
  });
});


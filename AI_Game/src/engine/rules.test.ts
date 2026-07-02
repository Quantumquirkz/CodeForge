import { describe, expect, it } from "vitest";
import { indexFromPosition, indicesFromMask, squareName } from "./board";
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

    expect(indicesFromMask(state.red).map(squareName).sort()).toEqual(["a2", "a4", "b1", "b3", "c2", "d1"].sort());
    expect(indicesFromMask(state.black).map(squareName).sort()).toEqual(["e8", "f7", "g6", "g8", "h5", "h7"].sort());
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

  it("supports chained jumps as a single move", () => {
    const state = {
      red: 1n << BigInt(indexFromPosition(4, 0)),
      black: (1n << BigInt(indexFromPosition(3, 1))) | (1n << BigInt(indexFromPosition(1, 3))),
      turn: "red" as const
    };

    const moves = generateMoves(state, "red");
    const direct = moves.find((move) => squareName(move.to) === "c6");
    const chained = moves.find((move) => squareName(move.to) === "e8");

    expect(direct).toBeDefined();
    expect(direct?.steps).toHaveLength(1);
    expect(chained).toBeDefined();
    expect(chained?.steps).toHaveLength(2);

    if (chained) {
      const next = applyMove(state, chained);
      expect(indicesFromMask(next.red).map(squareName)).toEqual(["e8"]);
      expect(next.turn).toBe("black");
    }
  });

  it("rejects retrograde jumps", () => {
    const state = {
      red: 1n << BigInt(indexFromPosition(4, 2)),
      black: (1n << BigInt(indexFromPosition(3, 1))) | (1n << BigInt(indexFromPosition(3, 3))),
      turn: "red" as const
    };

    const moves = generateMoves(state, "red");
    expect(moves.some((move) => squareName(move.to) === "a6")).toBe(false);
    expect(moves.some((move) => squareName(move.to) === "e6")).toBe(true);
  });

  it("rejects jumps whose landing square is occupied", () => {
    const state = {
      red: 1n << BigInt(indexFromPosition(4, 2)),
      black: (1n << BigInt(indexFromPosition(3, 3))) | (1n << BigInt(indexFromPosition(2, 4))),
      turn: "red" as const
    };

    const moves = generateMoves(state, "red");
    expect(moves.some((move) => squareName(move.to) === "e6")).toBe(false);
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

  it("does not declare victory when extra pieces remain outside the target set", () => {
    const state = {
      red: goalMask("red") | (1n << BigInt(indexFromPosition(0, 0))),
      black: initialState().black,
      turn: "red" as const
    };

    expect(isGoalReached(state, "red")).toBe(false);
    expect(winner(state)).toBe(null);
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

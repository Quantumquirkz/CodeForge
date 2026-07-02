// @vitest-environment jsdom

import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { generateMoves } from "../engine/rules";
import { useGameState } from "./useGameState";
import { piecesToEngineState, boardSquareToEngineIndex } from "../utils/game";
import type { BoardSquare } from "../types/game";

type Snapshot = ReturnType<typeof useGameState>;

function HookProbe({ onSnapshot }: { onSnapshot: (snapshot: Snapshot) => void }) {
  const snapshot = useGameState();
  onSnapshot(snapshot);
  return null;
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("useGameState human-vs-ai interaction", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let snapshot: Snapshot | null = null;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    snapshot = null;
    act(() => {
      root.render(<HookProbe onSnapshot={(value) => { snapshot = value; }} />);
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  it("lets the human move when playing as red", async () => {
    expect(snapshot).not.toBeNull();
    act(() => {
      snapshot?.setMode("human-vs-ai");
      snapshot?.setHumanColor("red");
    });
    await flush();

    const current = snapshot!;
    const redState = piecesToEngineState(current.pieces, current.currentTurn);
    const move = generateMoves(redState, "red")[0];
    expect(move).toBeDefined();

    const originSquareIndex = move ? move.from : -1;
    const originPiece = current.pieces.find(
      (piece) => boardSquareToEngineIndex({ row: piece.row, col: piece.col }) === originSquareIndex
    );
    expect(originPiece).toBeDefined();
    const origin: BoardSquare = { row: originPiece!.row, col: originPiece!.col };

    act(() => {
      current.selectSquare(origin);
    });
    await flush();

    const afterSelect = snapshot!;
    expect(afterSelect.selectedPieceId).toBeTruthy();
    expect(afterSelect.legalMoves.length).toBeGreaterThan(0);

    const targetSquare = afterSelect.legalMoves[0].to;
    const target: BoardSquare = {
      row: 8 - Math.floor(targetSquare / 8),
      col: targetSquare % 8
    };

    act(() => {
      afterSelect.selectSquare(target);
    });
    await flush();

    expect(snapshot!.moveLog).toHaveLength(1);
    expect(snapshot!.currentTurn).toBe("black");
  });

  it("automatically starts with AI when the human chooses black", async () => {
    act(() => {
      snapshot?.setMode("human-vs-ai");
      snapshot?.setHumanColor("black");
    });
    await flush();

    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });
    await flush();

    expect(snapshot!.moveLog.length).toBeGreaterThan(0);
    expect(snapshot!.currentTurn).toBe("black");
    expect(snapshot!.humanColor).toBe("black");
  });
});

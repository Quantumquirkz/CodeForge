import { useCallback, useEffect, useMemo, useState } from "react";
import { solveWithAStar } from "../engine/astar";
import { evaluateState } from "../engine/heuristics";
import { chooseBestMove } from "../engine/minimax";
import type { Move } from "../engine/types";
import type { BoardSquare, GameMode, MoveRecord, Piece, PlayerColor, Strategy } from "../types/game";
import {
  countLegalMovesForColor,
  createMoveRecord,
  engineIndexToBoardSquare,
  generateLegalMovesForPiece,
  getPieceAt,
  initialPieces,
  isSameSquare,
  piecesToEngineState,
  squareToNotation
} from "../utils/game";

type HookGameState = {
  currentTurn: PlayerColor;
  pieces: Piece[];
  selectedPieceId: string | null;
  legalMoves: BoardSquare[];
  moveLog: MoveRecord[];
  plannedRoute: BoardSquare[];
  plannedMoves: Move[];
  mode: GameMode;
  humanColor: PlayerColor;
  strategy: Strategy;
  summaryMessage: string;
  engineMessage: string;
  searchStatus: string;
  redCost: number;
  blackCost: number;
  redLegalMoves: number;
  blackLegalMoves: number;
  heuristicHistory: [number, number][];
  plannedSteps: number;
  plannedExpandedNodes: number;
  plannedSearchDuration: number | null;
  plannedSearchReason: string | null;
  setMode: (mode: GameMode) => void;
  setHumanColor: (color: PlayerColor) => void;
  setStrategy: (strategy: Strategy) => void;
  resetGame: () => void;
  selectSquare: (square: BoardSquare) => void;
  analyzeWithAStar: () => void;
  advancePlan: () => void;
  playAiMove: () => void;
};

export function useGameState(): HookGameState {
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>("red");
  const [pieces, setPieces] = useState<Piece[]>(() => initialPieces());
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<BoardSquare[]>([]);
  const [moveLog, setMoveLog] = useState<MoveRecord[]>([]);
  const [plannedMoves, setPlannedMoves] = useState<Move[]>([]);
  const [mode, setMode] = useState<GameMode>("human-vs-ai");
  const [humanColor, setHumanColor] = useState<PlayerColor>("red");
  const [strategy, setStrategy] = useState<Strategy>("minimax");
  const [summaryMessage, setSummaryMessage] = useState(
    "Selecciona una ficha y luego una casilla resaltada para realizar una jugada."
  );
  const [engineMessage, setEngineMessage] = useState("Listo para analizar.");
  const [searchStatus, setSearchStatus] = useState("Sin búsquedas aún.");
  const [heuristicHistory, setHeuristicHistory] = useState<[number, number][]>([]);

  /* ── Reset / mode switch ─────────────────────────────────── */

  useEffect(() => {
    if (mode === "human-vs-ai") {
      setCurrentTurn(humanColor);
    } else {
      setCurrentTurn("red");
    }
    clearSelection();
  }, [mode, humanColor]);

  /* ── Derived values ──────────────────────────────────────── */

  const plannedRoute = useMemo(
    () => plannedMoves.map((move) => engineIndexToBoardSquare(move.to)),
    [plannedMoves]
  );

  const redLegalMoves = useMemo(
    () => countLegalMovesForColor("red", pieces, currentTurn),
    [pieces, currentTurn]
  );
  const blackLegalMoves = useMemo(
    () => countLegalMovesForColor("black", pieces, currentTurn),
    [pieces, currentTurn]
  );

  const { redCost, blackCost } = useMemo(() => {
    const state = piecesToEngineState(pieces, currentTurn);
    return {
      redCost: evaluateState(state, "red"),
      blackCost: evaluateState(state, "black")
    };
  }, [pieces, currentTurn]);

  /* ── Helpers ─────────────────────────────────────────────── */

  function clearSelection(): void {
    setSelectedPieceId(null);
    setLegalMoves([]);
  }

  function toggleTurn(): void {
    setCurrentTurn((turn) => (turn === "red" ? "black" : "red"));
  }

  function movePiece(pieceId: string, targetSquare: BoardSquare): void {
    const piece = pieces.find((entry) => entry.id === pieceId);
    if (!piece) {
      return;
    }

    const from = { row: piece.row, col: piece.col };
    const newPieces = pieces.map((entry) =>
      entry.id === pieceId ? { ...entry, row: targetSquare.row, col: targetSquare.col } : entry
    );
    const newTurn = currentTurn === "red" ? "black" : "red";
    const nextState = piecesToEngineState(newPieces, newTurn);
    setHeuristicHistory((prev) => [...prev, [evaluateState(nextState, "red"), evaluateState(nextState, "black")]]);

    setPieces(newPieces);
    setMoveLog((current) => [...current, createMoveRecord(piece.color, from, targetSquare, current.length)]);
    clearSelection();
    toggleTurn();
    setSummaryMessage(
      `${piece.color === "red" ? "Rojo" : "Negro"} movió ${squareToNotation(from)} -> ${squareToNotation(targetSquare)}.`
    );
  }

  function findPieceAtSquare(square: BoardSquare): Piece | undefined {
    return pieces.find((p) => p.row === square.row && p.col === square.col);
  }

  function applyEngineMove(engineMove: Move): void {
    const fromSquare = engineIndexToBoardSquare(engineMove.from);
    const toSquare = engineIndexToBoardSquare(engineMove.to);
    const piece = findPieceAtSquare(fromSquare);
    if (!piece) return;
    movePiece(piece.id, toSquare);
  }

  function matchMoveInList(moveList: BoardSquare[], target: BoardSquare): boolean {
    return moveList.some((m) => isSameSquare(m, target));
  }

  /* ── Actions ─────────────────────────────────────────────── */

  function resetGame(): void {
    setCurrentTurn("red");
    setPieces(initialPieces());
    clearSelection();
    setMoveLog([]);
    setPlannedMoves([]);
    setHeuristicHistory([]);
    setSummaryMessage("Selecciona una ficha y luego una casilla resaltada para realizar una jugada.");
    setEngineMessage("Listo para analizar.");
    setSearchStatus("Sin búsquedas aún.");
  }

  function selectSquare(square: BoardSquare): void {
    const piece = findPieceAtSquare(square);

    if (piece && piece.color === currentTurn) {
      setSelectedPieceId(piece.id);
      setLegalMoves(generateLegalMovesForPiece(piece, pieces, currentTurn));
      setSummaryMessage(`Ficha ${piece.color === "red" ? "roja" : "negra"} en ${squareToNotation(square)} seleccionada.`);
      return;
    }

    if (selectedPieceId && matchMoveInList(legalMoves, square)) {
      movePiece(selectedPieceId, square);
    }
  }

  function analyzeWithAStar(): void {
    const state = piecesToEngineState(pieces, currentTurn);
    const result = solveWithAStar(state, currentTurn, 3000);

    if (result.found && result.moves.length > 0) {
      setPlannedMoves(result.moves);
      setEngineMessage(`Plan A* generado: ${result.moves.length} movimientos.`);
      setSearchStatus(
        `A*: ${result.stats.expandedNodes} nodos, ${result.stats.visitedStates} estados, ${result.stats.durationMs.toFixed(0)}ms`
      );
    } else if (result.moves.length > 0) {
      setPlannedMoves(result.moves);
      setEngineMessage("A* no encontró la meta, pero se guardó la mejor frontera.");
      setSearchStatus(
        `A*: ${result.stats.expandedNodes} nodos expandidos, profundidad ${result.stats.depthReached}`
      );
    } else {
      setEngineMessage("No hay jugadas disponibles para analizar.");
      setSearchStatus("A* no encontró una expansión válida.");
    }
  }

  function advancePlan(): void {
    if (plannedMoves.length === 0) {
      setEngineMessage("No hay plan almacenado.");
      return;
    }

    const [nextMove, ...remaining] = plannedMoves;

    const fromSquare = engineIndexToBoardSquare(nextMove.from);
    const piece = findPieceAtSquare(fromSquare);
    if (!piece) {
      setEngineMessage("La pieza del plan ya no está disponible.");
      setPlannedMoves([]);
      return;
    }

    applyEngineMove(nextMove);
    setPlannedMoves(remaining);
    setEngineMessage(remaining.length === 0 ? "Plan A* completado." : `Se avanzó un paso del plan (quedan ${remaining.length}).`);
  }

  const playAiMove = useCallback(() => {
    const aiColor = mode === "human-vs-ai" ? (humanColor === "red" ? "black" : "red") : currentTurn;
    if (mode === "human-vs-ai" && currentTurn !== aiColor) {
      setEngineMessage("Es el turno del humano.");
      return;
    }

    const state = piecesToEngineState(pieces, currentTurn);

    if (strategy === "minimax") {
      const result = chooseBestMove(state, aiColor, 3);
      if (!result.move) {
        setEngineMessage("Minimax no encontró jugada.");
        setSearchStatus("Sin jugada disponible.");
        return;
      }
      applyEngineMove(result.move);
      setEngineMessage(`Minimax eligió ${squareToNotation(engineIndexToBoardSquare(result.move.from))} -> ${squareToNotation(engineIndexToBoardSquare(result.move.to))}.`);
      setSearchStatus(
        `Minimax: ${result.stats.expandedNodes} nodos, puntuación ${result.score.toFixed(1)}`
      );
    } else {
      const result = solveWithAStar(state, aiColor, 2000);
      if (!result.found || result.moves.length === 0) {
        setEngineMessage("A* no encontró jugada.");
        setSearchStatus("Sin jugada disponible.");
        return;
      }
      const firstMove = result.moves[0];
      applyEngineMove(firstMove);
      setEngineMessage(`A* ejecutó primer paso del plan.`);
      setSearchStatus(
        `A*: ${result.stats.expandedNodes} nodos, profundidad ${result.stats.depthReached}`
      );
    }
  }, [mode, humanColor, strategy, pieces, currentTurn]);

  /* ── return ──────────────────────────────────────────────── */

  return {
    currentTurn,
    pieces,
    selectedPieceId,
    legalMoves,
    moveLog,
    plannedRoute,
    plannedMoves,
    mode,
    humanColor,
    strategy,
    summaryMessage,
    engineMessage,
    searchStatus,
    redCost,
    blackCost,
    redLegalMoves,
    blackLegalMoves,
    heuristicHistory,
    plannedSteps: plannedMoves.length,
    plannedExpandedNodes: 0,
    plannedSearchDuration: null,
    plannedSearchReason: null,
    setMode,
    setHumanColor,
    setStrategy,
    resetGame,
    selectSquare,
    analyzeWithAStar,
    advancePlan,
    playAiMove
  };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { solveWithAStar } from "../engine/astar";
import { evaluateState } from "../engine/heuristics";
import { chooseBestMove } from "../engine/minimax";
import { winner as engineWinner } from "../engine/rules";
import type { Move } from "../engine/types";
import type { BoardSquare, GameMode, MoveRecord, Piece, PlayerColor, Strategy } from "../types/game";
import {
  countLegalMovesForColor,
  createMoveRecord,
  boardSquareToEngineIndex,
  engineIndexToBoardSquare,
  generateLegalMovesForPiece,
  getPieceAt,
  initialPieces,
  piecesToEngineState,
  squareToNotation
} from "../utils/game";

type HookGameState = {
  currentTurn: PlayerColor;
  pieces: Piece[];
  selectedPieceId: string | null;
  legalMoves: Move[];
  winner: PlayerColor | null;
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
  autoPlayActive: boolean;
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
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
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
  const [plannedExpandedNodes, setPlannedExpandedNodes] = useState(0);
  const [plannedSearchDuration, setPlannedSearchDuration] = useState<number | null>(null);
  const [plannedSearchReason, setPlannedSearchReason] = useState<string | null>(null);
  const [autoPlayActive, setAutoPlayActive] = useState(false);

  /* ── Reset / mode switch ─────────────────────────────────── */

  useEffect(() => {
    if (mode === "human-vs-ai") {
      setCurrentTurn(humanColor);
    } else {
      setCurrentTurn("red");
    }
    setAutoPlayActive(false);
    clearSelection();
  }, [mode, humanColor]);

  /* ── Derived values ──────────────────────────────────────── */

  const gameState = useMemo(() => piecesToEngineState(pieces, currentTurn), [pieces, currentTurn]);
  const winner = useMemo(() => engineWinner(gameState), [gameState]);

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
    return {
      redCost: evaluateState(gameState, "red"),
      blackCost: evaluateState(gameState, "black")
    };
  }, [gameState]);

  useEffect(() => {
    if (mode !== "ai-vs-ai" || !autoPlayActive || winner) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const moveState = piecesToEngineState(pieces, currentTurn);

      if (strategy === "minimax") {
        const result = chooseBestMove(moveState, currentTurn, 3);
        if (!result.move) {
          setAutoPlayActive(false);
          setEngineMessage("Minimax no encontró jugada.");
          setSearchStatus("Sin jugada disponible.");
          return;
        }

        const ended = applyEngineMove(result.move);
        setEngineMessage(
          `Minimax eligió ${squareToNotation(engineIndexToBoardSquare(result.move.from))} -> ${squareToNotation(engineIndexToBoardSquare(result.move.to))}.`
        );
        setSearchStatus(`Minimax: ${result.stats.expandedNodes} nodos, puntuación ${result.score.toFixed(1)}`);
        if (ended) {
          setAutoPlayActive(false);
        }
        return;
      }

      const result = solveWithAStar(moveState, currentTurn, 2000);
      if (!result.found || result.moves.length === 0) {
        setAutoPlayActive(false);
        setEngineMessage("A* no encontró jugada.");
        setSearchStatus("Sin jugada disponible.");
        return;
      }

      const firstMove = result.moves[0];
      const ended = applyEngineMove(firstMove);
      setEngineMessage("A* ejecutó primer paso del plan.");
      setSearchStatus(`A*: ${result.stats.expandedNodes} nodos, profundidad ${result.stats.depthReached}`);
      if (ended) {
        setAutoPlayActive(false);
      }
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [autoPlayActive, mode, winner, strategy, pieces, currentTurn]);

  /* ── Helpers ─────────────────────────────────────────────── */

  function clearSelection(): void {
    setSelectedPieceId(null);
    setLegalMoves([]);
  }

  function movePiece(move: Move): boolean {
    const fromSquare = engineIndexToBoardSquare(move.from);
    const targetSquare = engineIndexToBoardSquare(move.to);
    const piece = getPieceAt(fromSquare.row, fromSquare.col, pieces);
    if (!piece) {
      return false;
    }

    const route = [fromSquare, ...move.steps.map((step) => engineIndexToBoardSquare(step.to))];
    const newPieces = pieces.map((entry) =>
      entry.id === piece.id ? { ...entry, row: targetSquare.row, col: targetSquare.col } : entry
    );
    const newTurn = move.player === "red" ? "black" : "red";
    const nextState = piecesToEngineState(newPieces, newTurn);
    setHeuristicHistory((prev) => [...prev, [evaluateState(nextState, "red"), evaluateState(nextState, "black")]]);

    setPieces(newPieces);
    setMoveLog((current) => [...current, createMoveRecord(piece.color, fromSquare, targetSquare, current.length, route)]);
    clearSelection();
    setCurrentTurn(newTurn);

    const nextWinner = engineWinner(nextState);
    if (nextWinner) {
      setPlannedMoves([]);
      setAutoPlayActive(false);
      setSummaryMessage(`Gana ${nextWinner === "red" ? "Rojo" : "Negro"} al completar su formación objetivo.`);
      return true;
    } else {
      setSummaryMessage(
        `${piece.color === "red" ? "Rojo" : "Negro"} movió ${route.map(squareToNotation).join(" -> ")}.`
      );
    }
    return false;
  }

  function findPieceAtSquare(square: BoardSquare): Piece | undefined {
    return pieces.find((p) => p.row === square.row && p.col === square.col);
  }

  function applyEngineMove(engineMove: Move): boolean {
    return movePiece(engineMove);
  }

  function matchMoveInList(moveList: Move[], target: BoardSquare): Move | null {
    const targetIndex = boardSquareToEngineIndex(target);
    return moveList.find((move) => move.to === targetIndex) ?? null;
  }

  /* ── Actions ─────────────────────────────────────────────── */

  function resetGame(): void {
    setCurrentTurn("red");
    setPieces(initialPieces());
    clearSelection();
    setMoveLog([]);
    setPlannedMoves([]);
    setPlannedExpandedNodes(0);
    setPlannedSearchDuration(null);
    setPlannedSearchReason(null);
    setAutoPlayActive(false);
    setHeuristicHistory([]);
    setSummaryMessage("Selecciona una ficha y luego una casilla resaltada para realizar una jugada.");
    setEngineMessage("Listo para analizar.");
    setSearchStatus("Sin búsquedas aún.");
  }

  function selectSquare(square: BoardSquare): void {
    if (winner) {
      setSummaryMessage(`La partida terminó. Gana ${winner === "red" ? "Rojo" : "Negro"}.`);
      return;
    }

    const piece = findPieceAtSquare(square);

    if (piece && piece.color === currentTurn) {
      setSelectedPieceId(piece.id);
      setLegalMoves(generateLegalMovesForPiece(piece, pieces, currentTurn));
      setSummaryMessage(`Ficha ${piece.color === "red" ? "roja" : "negra"} en ${squareToNotation(square)} seleccionada.`);
      return;
    }

    if (selectedPieceId) {
      const selectedMove = matchMoveInList(legalMoves, square);
      if (selectedMove) {
        movePiece(selectedMove);
      }
    }
  }

  function analyzeWithAStar(): void {
    if (winner) {
      setEngineMessage(`La partida ya terminó. Gana ${winner === "red" ? "Rojo" : "Negro"}.`);
      return;
    }

    const result = solveWithAStar(gameState, currentTurn, 3000);

    if (result.found && result.moves.length > 0) {
      setPlannedMoves(result.moves);
      setPlannedExpandedNodes(result.stats.expandedNodes);
      setPlannedSearchDuration(result.stats.durationMs);
      setPlannedSearchReason(result.stats.reason);
      setEngineMessage(`Plan A* generado: ${result.moves.length} movimientos.`);
      setSearchStatus(
        `A*: ${result.stats.expandedNodes} nodos, ${result.stats.visitedStates} estados, ${result.stats.durationMs.toFixed(0)}ms`
      );
    } else if (result.moves.length > 0) {
      setPlannedMoves(result.moves);
      setPlannedExpandedNodes(result.stats.expandedNodes);
      setPlannedSearchDuration(result.stats.durationMs);
      setPlannedSearchReason(result.stats.reason);
      setEngineMessage("A* no encontró la meta, pero se guardó la mejor frontera.");
      setSearchStatus(
        `A*: ${result.stats.expandedNodes} nodos expandidos, profundidad ${result.stats.depthReached}`
      );
    } else {
      setPlannedExpandedNodes(result.stats.expandedNodes);
      setPlannedSearchDuration(result.stats.durationMs);
      setPlannedSearchReason(result.stats.reason);
      setEngineMessage("No hay jugadas disponibles para analizar.");
      setSearchStatus("A* no encontró una expansión válida.");
    }
  }

  function advancePlan(): void {
    if (winner) {
      setEngineMessage(`La partida ya terminó. Gana ${winner === "red" ? "Rojo" : "Negro"}.`);
      return;
    }

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

    const ended = applyEngineMove(nextMove);
    setPlannedMoves(ended ? [] : remaining);
    setEngineMessage(
      ended
        ? "El plan terminó en una jugada ganadora."
        : remaining.length === 0
          ? "Plan A* completado."
          : `Se avanzó un paso del plan (quedan ${remaining.length}).`
    );
  }

  const playAiMove = useCallback(() => {
    if (winner) {
      setEngineMessage(`La partida ya terminó. Gana ${winner === "red" ? "Rojo" : "Negro"}.`);
      return;
    }

    if (mode === "ai-vs-ai") {
      setAutoPlayActive(true);
      setEngineMessage("IA vs IA en ejecución automática. La primera jugada se ejecutará en 2 segundos.");
      return;
    }

    const aiColor = humanColor === "red" ? "black" : "red";
    if (currentTurn !== aiColor) {
      setEngineMessage("Es el turno del humano.");
      return;
    }

    if (strategy === "minimax") {
      const result = chooseBestMove(gameState, aiColor, 3);
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
      const result = solveWithAStar(gameState, aiColor, 2000);
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
  }, [mode, humanColor, strategy, currentTurn, winner, gameState]);

  /* ── return ──────────────────────────────────────────────── */

  return {
    currentTurn,
    pieces,
    selectedPieceId,
    legalMoves,
    winner,
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
    plannedExpandedNodes,
    plannedSearchDuration,
    plannedSearchReason,
    autoPlayActive,
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

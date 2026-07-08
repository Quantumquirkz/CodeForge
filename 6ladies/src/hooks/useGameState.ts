import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { solveWithAStar } from "../engine/astar";
import { evaluateState } from "../engine/heuristics";
import { chooseBestMove } from "../engine/minimax";
import { evaluateOutcome, type GameOutcome } from "../engine/outcome";
import { applyMove, generateMoves, hasAnyMove, passTurn } from "../engine/rules";
import { stateKey } from "../engine/board";
import type { GameState, Move } from "../engine/types";
import type { BoardSquare, GameMode, MoveRecord, Piece, PlayerColor, Strategy } from "../types/game";
import type { DecisionTreeNode } from "../types/game";
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

const AI_DELAY_MS = 700;
const AUTOPLAY_DELAY_MS = 1200;
const MINIMAX_DEPTH = 3;
const ASTAR_BUDGET = 30000;

function labelForTurn(turn: PlayerColor): string {
  return turn === "red" ? "Rojo" : "Negro";
}

function createTreeRoot(): DecisionTreeNode {
  return {
    id: "root",
    name: "Inicio",
    symbol: "roundRect",
    symbolSize: [92, 32],
    collapsed: false,
    children: [],
    itemStyle: {
      color: "#fffdf8",
      borderColor: "#c8892d",
      borderWidth: 1.5
    },
    label: {
      color: "#7a4d08",
      fontWeight: 700,
      fontSize: 13,
      position: "inside",
      align: "center",
      verticalAlign: "middle"
    }
  };
}

function findTreeNode(node: DecisionTreeNode, id: string): DecisionTreeNode | null {
  if (node.id === id) {
    return node;
  }
  for (const child of node.children ?? []) {
    const found = findTreeNode(child, id);
    if (found) {
      return found;
    }
  }
  return null;
}

function appendTreeChild(
  node: DecisionTreeNode,
  parentId: string,
  child: DecisionTreeNode
): DecisionTreeNode {
  if (node.id === parentId) {
    const children = node.children ?? [];
    if (children.some((entry) => entry.id === child.id)) {
      return node;
    }
    return { ...node, children: [...children, child] };
  }

  if (!node.children || node.children.length === 0) {
    return node;
  }

  let changed = false;
  const nextChildren = node.children.map((entry) => {
    const updated = appendTreeChild(entry, parentId, child);
    if (updated !== entry) {
      changed = true;
    }
    return updated;
  });

  return changed ? { ...node, children: nextChildren } : node;
}

function moveTreeId(parentId: string, move: Move): string {
  return `${parentId}::${move.from}-${move.to}-${move.kind}`;
}

function positionTreeId(parentMoveId: string, index: number): string {
  return `${parentMoveId}::pos-${index}`;
}

function buildMoveNode(move: Move, cost: number, isChosen = false): DecisionTreeNode {
  const from = squareToNotation(engineIndexToBoardSquare(move.from));
  const to = squareToNotation(engineIndexToBoardSquare(move.to));
  const name = `${from} -> ${to}`;
  const highlight = isChosen ? "#c8892d" : "#94a3b8";
  return {
    id: "",
    name,
    value: move.kind === "jump" ? `Salto recto · ${cost.toFixed(1)}` : `Salto recto · ${cost.toFixed(1)}`,
    score: cost,
    symbol: "circle",
    symbolSize: 18,
    itemStyle: {
      color: isChosen ? "#f7d79c" : "#ffffff",
      borderColor: highlight,
      borderWidth: isChosen ? 2 : 1.4
    },
    label: {
      color: "#0f172a",
      fontWeight: 600,
      fontSize: 12,
      position: "top",
      align: "center",
      verticalAlign: "middle"
    },
    tooltip: {
      formatter: `${name}<br/>salto recto<br/>Coste: ${cost.toFixed(1)}`
    }
  };
}

type TreeScope = "general" | "red" | "black";

function colorScope(color: PlayerColor): TreeScope {
  return color === "red" ? "red" : "black";
}

type HookGameState = {
  currentTurn: PlayerColor;
  pieces: Piece[];
  selectedPieceId: string | null;
  legalMoves: Move[];
  winner: PlayerColor | null;
  outcome: GameOutcome | null;
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
  aiThinking: boolean;
  decisionTreeGeneral: DecisionTreeNode;
  decisionTreeRed: DecisionTreeNode;
  decisionTreeBlack: DecisionTreeNode;
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
  const [outcome, setOutcome] = useState<GameOutcome | null>(null);
  const [summaryMessage, setSummaryMessage] = useState(
    "Selecciona una ficha y luego una casilla resaltada para realizar un salto recto."
  );
  const [engineMessage, setEngineMessage] = useState("Listo para analizar.");
  const [searchStatus, setSearchStatus] = useState("Sin búsquedas aún.");
  const [heuristicHistory, setHeuristicHistory] = useState<[number, number][]>([]);
  const [plannedExpandedNodes, setPlannedExpandedNodes] = useState(0);
  const [plannedSearchDuration, setPlannedSearchDuration] = useState<number | null>(null);
  const [plannedSearchReason, setPlannedSearchReason] = useState<string | null>(null);
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [decisionTreeGeneral, setDecisionTreeGeneral] = useState<DecisionTreeNode>(() => createTreeRoot());
  const [decisionTreeRed, setDecisionTreeRed] = useState<DecisionTreeNode>(() => createTreeRoot());
  const [decisionTreeBlack, setDecisionTreeBlack] = useState<DecisionTreeNode>(() => createTreeRoot());
  const currentTreePositionId = useRef({
    general: "root",
    red: "root",
    black: "root"
  });
  const treeSequence = useRef({
    general: 0,
    red: 0,
    black: 0
  });

  /* Conteo de posiciones de la partida: detecta la repetición triple y
     alimenta la penalización anti-ciclos de Minimax. Se usa una ref porque
     es un acumulador de la partida, no estado visual. */
  const positionCounts = useRef<Map<string, number>>(new Map());
  const aiTimeoutRef = useRef<number | null>(null);

  /* ── Reset / cambio de modo ─────────────────────────────── */

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, humanColor]);

  /* ── Valores derivados ──────────────────────────────────── */

  const gameState = useMemo(() => piecesToEngineState(pieces, currentTurn), [pieces, currentTurn]);
  const winner = outcome?.winner ?? null;
  const gameOver = Boolean(outcome?.over);

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

  const { redCost, blackCost } = useMemo(() => ({
    redCost: evaluateState(gameState, "red"),
    blackCost: evaluateState(gameState, "black")
  }), [gameState]);

  /* ── Núcleo: aplicar un salto recto del motor al estado de React ── */

  function registerPosition(state: GameState): number {
    const key = stateKey(state.red, state.black, state.turn);
    const seen = (positionCounts.current.get(key) ?? 0) + 1;
    positionCounts.current.set(key, seen);
    return seen;
  }

  function finishGame(result: GameOutcome): void {
    setOutcome(result);
    setPlannedMoves([]);
    setAutoPlayActive(false);
    setAiThinking(false);
    if (result.winner) {
      setSummaryMessage(`Gana ${result.winner === "red" ? "Rojo" : "Negro"}. ${result.reason}.`);
    } else {
      setSummaryMessage(`Empate. ${result.reason}.`);
    }
  }

  function getTreeState(scope: TreeScope): {
    tree: DecisionTreeNode;
    setTree: typeof setDecisionTreeGeneral;
    positionId: string;
    sequence: number;
  } {
    if (scope === "red") {
      return {
        tree: decisionTreeRed,
        setTree: setDecisionTreeRed,
        positionId: currentTreePositionId.current.red,
        sequence: treeSequence.current.red
      };
    }
    if (scope === "black") {
      return {
        tree: decisionTreeBlack,
        setTree: setDecisionTreeBlack,
        positionId: currentTreePositionId.current.black,
        sequence: treeSequence.current.black
      };
    }
    return {
      tree: decisionTreeGeneral,
      setTree: setDecisionTreeGeneral,
      positionId: currentTreePositionId.current.general,
      sequence: treeSequence.current.general
    };
  }

  function setTreePositionId(scope: TreeScope, positionId: string): void {
    currentTreePositionId.current = { ...currentTreePositionId.current, [scope]: positionId };
  }

  function setTreeSequence(scope: TreeScope, sequence: number): void {
    treeSequence.current = { ...treeSequence.current, [scope]: sequence };
  }

  function seedTreeForCurrentPosition(state: GameState, scope: TreeScope): void {
    const treeState = getTreeState(scope);
    const moves = generateMoves(state, state.turn);
    if (findTreeNode(treeState.tree, treeState.positionId)?.children?.length) {
      return;
    }

    const rankedMoves = moves
      .map((move) => {
        const nextState = applyMove(state, move);
        return { move, cost: evaluateState(nextState, state.turn) };
      })
      .sort((a, b) => a.cost - b.cost);

    treeState.setTree((current) => {
      let next = current;
      const positionNode = findTreeNode(next, treeState.positionId);
      if (!positionNode || (positionNode.children ?? []).length > 0) {
        return next;
      }

      for (let i = 0; i < rankedMoves.length; i++) {
        const { move, cost } = rankedMoves[i];
        const moveId = moveTreeId(treeState.positionId, move);
        const moveNode = {
          ...buildMoveNode(move, cost, i === 0),
          id: moveId
        };
        next = appendTreeChild(next, treeState.positionId, moveNode);
      }

      return next;
    });
  }

  function attachNextPosition(move: Move, nextState: GameState, scope: TreeScope): void {
    const treeState = getTreeState(scope);
    const parentId = treeState.positionId;
    const nextSequence = treeState.sequence + 1;
    const moveId = moveTreeId(parentId, move);
    const positionId = positionTreeId(moveId, nextSequence);
    const nextLabel = `Posición ${nextSequence}`;
    const turnLabel = labelForTurn(nextState.turn);

    treeState.setTree((current) => {
      let next = current;
      const existingMove = findTreeNode(next, moveId);
      if (!existingMove) {
        const cost = evaluateState(nextState, move.player);
        next = appendTreeChild(
          next,
          parentId,
          {
            ...buildMoveNode(move, cost, true),
            id: moveId
          }
        );
      }

      const positionNode: DecisionTreeNode = {
        id: positionId,
        name: `${nextLabel} (${turnLabel})`,
        value: `turno ${turnLabel}`,
        symbol: "roundRect",
        symbolSize: [120, 32],
        itemStyle: {
          color: "#ffffff",
          borderColor: turnLabel === "Rojo" ? "#d9213f" : "#475569",
          borderWidth: 1.5
        },
        label: {
          color: "#0f172a",
          fontWeight: 700,
          fontSize: 12,
          position: "inside",
          align: "center",
          verticalAlign: "middle"
        }
      };

      next = appendTreeChild(next, moveId, positionNode);
      return next;
    });

    setTreePositionId(scope, positionId);
    setTreeSequence(scope, nextSequence);
  }

  function movePiece(move: Move): boolean {
    const fromSquare = engineIndexToBoardSquare(move.from);
    const targetSquare = engineIndexToBoardSquare(move.to);
    const piece = getPieceAt(fromSquare.row, fromSquare.col, pieces);
    if (!piece) {
      return false;
    }

    seedTreeForCurrentPosition(gameState, "general");
    seedTreeForCurrentPosition(gameState, colorScope(move.player));
    const route = [fromSquare, ...move.steps.map((step) => engineIndexToBoardSquare(step.to))];
    const newPieces = pieces.map((entry) =>
      entry.id === piece.id ? { ...entry, row: targetSquare.row, col: targetSquare.col } : entry
    );
    let newTurn: PlayerColor = move.player === "red" ? "black" : "red";
    let nextState = piecesToEngineState(newPieces, newTurn);

    setHeuristicHistory((prev) => [...prev, [evaluateState(nextState, "red"), evaluateState(nextState, "black")]]);
    setPieces(newPieces);
    setMoveLog((current) => [...current, createMoveRecord(piece.color, fromSquare, targetSquare, current.length, route)]);
    clearSelection();

    /* Registrar la posición y evaluar el resultado (victoria, repetición
       triple o bloqueo mutuo). */
    registerPosition(nextState);
    const result = evaluateOutcome(nextState, positionCounts.current);
    if (result.over) {
      setCurrentTurn(newTurn);
      attachNextPosition(move, nextState, "general");
      attachNextPosition(move, nextState, colorScope(move.player));
      finishGame(result);
      return true;
    }

    /* Regla de bloqueo: si el jugador al turno no tiene saltos rectos, pasa. */
    let passes = 0;
    while (!hasAnyMove(nextState) && passes < 2) {
      nextState = passTurn(nextState);
      newTurn = nextState.turn;
      passes += 1;
    }
    if (passes > 0) {
      setSummaryMessage(
        `${piece.color === "red" ? "Rojo" : "Negro"} movió ${route.map(squareToNotation).join(" -> ")}. ` +
        `${newTurn === "red" ? "Negro" : "Rojo"} no tiene saltos rectos y pasa el turno.`
      );
    } else {
      setSummaryMessage(`${piece.color === "red" ? "Rojo" : "Negro"} movió ${route.map(squareToNotation).join(" -> ")}.`);
    }
    setCurrentTurn(newTurn);
    attachNextPosition(move, nextState, "general");
    attachNextPosition(move, nextState, colorScope(move.player));
    return false;
  }

  function clearSelection(): void {
    setSelectedPieceId(null);
    setLegalMoves([]);
  }

  function findPieceAtSquare(square: BoardSquare): Piece | undefined {
    return pieces.find((p) => p.row === square.row && p.col === square.col);
  }

  function matchMoveInList(moveList: Move[], target: BoardSquare): Move | null {
    const targetIndex = boardSquareToEngineIndex(target);
    return moveList.find((move) => move.to === targetIndex) ?? null;
  }

  /* ── Jugada de la IA (compartida por ambos modos) ────────── */

  const computeAiMove = useCallback((state: GameState): { move: Move | null; status: string; message: string } => {
    seedTreeForCurrentPosition(state, "general");
    seedTreeForCurrentPosition(state, colorScope(state.turn));
    if (strategy === "minimax") {
      const result = chooseBestMove(state, state.turn, MINIMAX_DEPTH, {
        history: positionCounts.current,
        timeLimitMs: 1200
      });
      if (!result.move) {
        return { move: null, status: "Sin salto recto disponible.", message: "Minimax no encontró salto recto." };
      }
      return {
        move: result.move,
        status: `Minimax: ${result.stats.expandedNodes} nodos, prof. ${result.stats.depthReached}, puntuación ${result.score.toFixed(1)}`,
        message: `Minimax eligió un salto recto de ${squareToNotation(engineIndexToBoardSquare(result.move.from))} a ${squareToNotation(engineIndexToBoardSquare(result.move.to))}.`
      };
    }

    const result = solveWithAStar(state, state.turn, ASTAR_BUDGET);
    if (!result.found || result.moves.length === 0) {
      return {
        move: null,
        status: "Sin plan completo de A*.",
        message: "A* es un planificador: no encontró un plan completo con el presupuesto dado."
      };
    }
    const firstMove = result.moves[0];
    return {
      move: firstMove,
      status: `A*: ${result.stats.expandedNodes} nodos, plan de ${result.moves.length} saltos rectos (${result.stats.reason})`,
      message: `A* ejecutó un salto recto de ${squareToNotation(engineIndexToBoardSquare(firstMove.from))} a ${squareToNotation(engineIndexToBoardSquare(firstMove.to))} (primer paso del plan).`
    };
  }, [strategy]);

  /* ── IA responde AUTOMÁTICAMENTE ─────────────────────────── */

  const aiColor: PlayerColor = humanColor === "red" ? "black" : "red";
  const aiShouldMove =
    !gameOver &&
    ((mode === "human-vs-ai" && currentTurn === aiColor) ||
      (mode === "ai-vs-ai" && autoPlayActive));

  useEffect(() => {
    if (!aiShouldMove) {
      setAiThinking(false);
      return;
    }
    setAiThinking(true);
    if (aiTimeoutRef.current !== null) {
      window.clearTimeout(aiTimeoutRef.current);
    }
    const delay = mode === "ai-vs-ai" ? AUTOPLAY_DELAY_MS : AI_DELAY_MS;
    aiTimeoutRef.current = window.setTimeout(() => {
      const moveState = piecesToEngineState(pieces, currentTurn);
      const { move, status, message } = computeAiMove(moveState);
      setSearchStatus(status);
      setEngineMessage(message);
      setAiThinking(false);
      aiTimeoutRef.current = null;
      if (!move) {
        setAutoPlayActive(false);
        return;
      }
      movePiece(move);
    }, delay);
    return () => {
      if (aiTimeoutRef.current !== null) {
        window.clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiShouldMove, pieces, currentTurn, mode, computeAiMove]);

  /* ── Acciones ────────────────────────────────────────────── */

  function resetGame(): void {
    positionCounts.current = new Map();
    if (aiTimeoutRef.current !== null) {
      window.clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setCurrentTurn("red");
    setPieces(initialPieces());
    clearSelection();
    setMoveLog([]);
    setPlannedMoves([]);
    setPlannedExpandedNodes(0);
    setPlannedSearchDuration(null);
    setPlannedSearchReason(null);
    setAutoPlayActive(false);
    setAiThinking(false);
    setOutcome(null);
    setHeuristicHistory([]);
    setDecisionTreeGeneral(createTreeRoot());
    setDecisionTreeRed(createTreeRoot());
    setDecisionTreeBlack(createTreeRoot());
    currentTreePositionId.current = { general: "root", red: "root", black: "root" };
    treeSequence.current = { general: 0, red: 0, black: 0 };
    setSummaryMessage(
      mode === "ai-vs-ai"
        ? "Pulsa Jugar IA para iniciar la partida automática."
        : humanColor === "red"
          ? "Juegas con Rojas y mueves primero. Selecciona una ficha."
          : "Juegas con Negras. Rojas (IA) mueve primero."
    );
    setEngineMessage("Listo para analizar.");
    setSearchStatus("Sin búsquedas aún.");
  }

  function selectSquare(square: BoardSquare): void {
    if (gameOver) {
      setSummaryMessage(
        winner ? `La partida terminó. Gana ${winner === "red" ? "Rojo" : "Negro"}.` : "La partida terminó en empate."
      );
      return;
    }
    if (mode === "ai-vs-ai") {
      setSummaryMessage("En el modo IA vs IA el tablero es de solo lectura.");
      return;
    }
    if (currentTurn !== humanColor || aiThinking) {
      setSummaryMessage("Espera: la IA está pensando su salto recto.");
      return;
    }

    const piece = findPieceAtSquare(square);

    if (piece && piece.color === currentTurn) {
      setSelectedPieceId(piece.id);
      const moves = generateLegalMovesForPiece(piece, pieces, currentTurn);
      setLegalMoves(moves);
      seedTreeForCurrentPosition(gameState, "general");
      seedTreeForCurrentPosition(gameState, colorScope(currentTurn));
      setSummaryMessage(
        moves.length > 0
          ? `Ficha ${piece.color === "red" ? "roja" : "negra"} en ${squareToNotation(square)} seleccionada. Sus saltos rectos disponibles están resaltados.`
          : `La ficha ${piece.color === "red" ? "roja" : "negra"} en ${squareToNotation(square)} no tiene saltos rectos legales. Prueba otra.`
      );
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
    if (gameOver) {
      setEngineMessage("La partida ya terminó.");
      return;
    }

    const result = solveWithAStar(gameState, currentTurn, ASTAR_BUDGET);

    if (result.found && result.moves.length > 0) {
      setPlannedMoves(result.moves);
      setPlannedExpandedNodes(result.stats.expandedNodes);
      setPlannedSearchDuration(result.stats.durationMs);
      setPlannedSearchReason(result.stats.reason);
      setEngineMessage(`Plan A* generado: ${result.moves.length} saltos rectos (${result.stats.reason}).`);
      setSearchStatus(
        `A*: ${result.stats.expandedNodes} nodos, ${result.stats.visitedStates} estados, ${result.stats.durationMs.toFixed(0)}ms`
      );
    } else {
      setPlannedMoves([]);
      setPlannedExpandedNodes(result.stats.expandedNodes);
      setPlannedSearchDuration(result.stats.durationMs);
      setPlannedSearchReason(result.stats.reason);
      setEngineMessage("A* no encontró un plan completo con el presupuesto dado.");
      setSearchStatus(`A*: ${result.stats.expandedNodes} nodos, ${result.stats.visitedStates} estados, ${result.stats.durationMs.toFixed(0)}ms`);
    }
  }

  function advancePlan(): void {
    if (gameOver) {
      setEngineMessage("La partida ya terminó.");
      return;
    }
    if (plannedMoves.length === 0) {
      setEngineMessage("No hay plan de saltos rectos almacenado.");
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

    const ended = movePiece(nextMove);
    setPlannedMoves(ended ? [] : remaining);
    setEngineMessage(
      ended
        ? "El plan de saltos rectos terminó la partida."
        : remaining.length === 0
          ? "Plan A* de saltos rectos completado."
          : `Se ejecutó un salto recto del plan (quedan ${remaining.length}).`
    );
  }

  const playAiMove = useCallback(() => {
    if (gameOver) {
      setEngineMessage("La partida ya terminó.");
      return;
    }
    if (strategy === "astar" && mode === "ai-vs-ai") {
      setEngineMessage("A* es un planificador: usa Analizar con A* y Avanzar plan en lugar de IA vs IA.");
      return;
    }
    if (aiThinking) {
      setEngineMessage("La IA ya está pensando su salto recto.");
      return;
    }
    if (mode === "ai-vs-ai") {
      const nextActive = !autoPlayActive;
      setAutoPlayActive(nextActive);
      setEngineMessage(nextActive ? "IA vs IA en ejecución automática." : "Partida automática en pausa.");
      return;
    }
    if (currentTurn !== aiColor) {
      setEngineMessage("La IA solo puede mover cuando le toca.");
      return;
    }

    if (aiTimeoutRef.current !== null) {
      window.clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }

    const moveState = piecesToEngineState(pieces, currentTurn);
    const { move, status, message } = computeAiMove(moveState);
    setSearchStatus(status);
    setEngineMessage(message);
    if (move) {
      movePiece(move);
    }
  }, [gameOver, aiThinking, mode, strategy, currentTurn, aiColor, autoPlayActive, pieces, computeAiMove]);

  /* ── return ──────────────────────────────────────────────── */

  return {
    currentTurn,
    pieces,
    selectedPieceId,
    legalMoves,
    winner,
    outcome,
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
    decisionTreeGeneral,
    decisionTreeRed,
    decisionTreeBlack,
    plannedSteps: plannedMoves.length,
    plannedExpandedNodes,
    plannedSearchDuration,
    plannedSearchReason,
    autoPlayActive,
    aiThinking,
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

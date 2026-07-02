import "./app.css";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Header } from "./components/dashboard/Header";
import { MatchSummaryCard } from "./components/dashboard/MatchSummaryCard";
import { KpiCard } from "./components/dashboard/KpiCard";
import { ControlSidebar } from "./components/dashboard/ControlSidebar";
import { BoardPanel } from "./components/dashboard/BoardPanel";
import { PositionReadingCard } from "./components/dashboard/PositionReadingCard";
import { HeuristicChartCard } from "./components/dashboard/HeuristicChartCard";
import { EngineAnalysisCard } from "./components/dashboard/EngineAnalysisCard";
import { GameStateGraphCard } from "./components/dashboard/GameStateGraphCard";
import { CurrentModeCard } from "./components/dashboard/CurrentModeCard";
import { MoveLogCard } from "./components/dashboard/MoveLogCard";
import { WinnerBanner } from "./components/dashboard/WinnerBanner";
import { Icon } from "./components/ui/Icon";
import { useGameState } from "./hooks/useGameState";
import type { GameMode, PlayerColor, Strategy } from "./types/game";

function App() {
  const game = useGameState();
  const currentTurnLabel = game.currentTurn === "red" ? "Rojo" : "Negro";
  const winnerLabel = game.winner ? (game.winner === "red" ? "Rojo" : "Negro") : null;
  const currentModeLabel =
    game.mode === "human-vs-ai"
      ? `Humano vs IA (${game.humanColor === "red" ? "Rojo" : "Negro"})`
      : "IA vs IA";

  const chartRedSeries = game.heuristicHistory.map(([r]) => r);
  const chartBlackSeries = game.heuristicHistory.map(([, b]) => b);
  const graphVisible =
    game.autoPlayActive ||
    game.aiThinking ||
    game.moveLog.length > 0 ||
    game.plannedMoves.length > 0 ||
    game.heuristicHistory.length > 0 ||
    Boolean(game.outcome);

  const kpis = (
    <div className="kpi-grid">
      <KpiCard
        label="Turno"
        value={currentTurnLabel}
        description="Partida en curso"
        icon={<Icon name="turn" className="icon icon--accent" />}
      />
      <KpiCard
        label="Movimientos del turno"
        value={String(game.currentTurn === "red" ? game.redLegalMoves : game.blackLegalMoves)}
        description={game.selectedPieceId ? "Ficha seleccionada" : "Sin ficha seleccionada"}
        icon={<Icon name="route" className="icon icon--accent" />}
      />
      <KpiCard
        label="Coste heurístico"
        value={game.redCost.toFixed(1)}
        description="Evaluación del motor"
        icon={<Icon name="spark" className="icon icon--accent" />}
      />
    </div>
  );

  const rightPanel = (
    <div className="analytics-grid">
      <div className="analytics-grid__top">
        <PositionReadingCard
          turn={currentTurnLabel}
          redLegalMoves={game.redLegalMoves}
          blackLegalMoves={game.blackLegalMoves}
          redCost={game.redCost}
          blackCost={game.blackCost}
        />
        <HeuristicChartCard red={chartRedSeries} black={chartBlackSeries} />
      </div>
      <CurrentModeCard text={currentModeLabel} />
    </div>
  );

  const bottomPanel = (
    <GameStateGraphCard
      active={graphVisible}
      treeDataGeneral={game.decisionTreeGeneral}
      treeDataRed={game.decisionTreeRed}
      treeDataBlack={game.decisionTreeBlack}
      aiThinking={game.aiThinking}
      searchStatus={game.searchStatus}
      plannedExpandedNodes={game.plannedExpandedNodes}
      plannedSearchDuration={game.plannedSearchDuration}
      outcome={game.outcome}
    />
  );

  return (
    <DashboardLayout
      header={<Header />}
      summary={<MatchSummaryCard currentTurnLabel={currentTurnLabel} winnerLabel={winnerLabel} message={game.summaryMessage} />}
      kpis={kpis}
      left={
        <div className="left-stack">
          <ControlSidebar
            mode={game.mode}
            humanColor={game.humanColor}
            strategy={game.strategy}
            gameOver={Boolean(game.winner)}
            autoPlayActive={game.autoPlayActive}
            onModeChange={(value) => game.setMode(value as GameMode)}
            onHumanColorChange={(value) => game.setHumanColor(value as PlayerColor)}
            onStrategyChange={(value) => game.setStrategy(value as Strategy)}
            onReset={game.resetGame}
            onAnalyze={game.analyzeWithAStar}
            onAdvance={game.advancePlan}
            onPlayAi={game.playAiMove}
          />
          <EngineAnalysisCard
            redCost={game.redCost}
            blackCost={game.blackCost}
            engineMessage={game.engineMessage}
            searchStatus={game.searchStatus}
          />
        </div>
      }
      center={
        <>
          <WinnerBanner outcome={game.outcome} onReset={game.resetGame} />
          {game.aiThinking && !game.outcome?.over && (
            <div className="ai-thinking" role="status">
              <span className="ai-thinking__dot" /> La IA está pensando…
            </div>
          )}
          <BoardPanel
            pieces={game.pieces}
            selectedPieceId={game.selectedPieceId}
            legalMoves={game.legalMoves}
            onSelectSquare={game.selectSquare}
          />
          <MoveLogCard moveLog={game.moveLog} />
        </>
      }
      right={rightPanel}
      bottom={bottomPanel}
    />
  );
}

export default App;

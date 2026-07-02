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
import { AStarPlanCard } from "./components/dashboard/AStarPlanCard";
import { CurrentModeCard } from "./components/dashboard/CurrentModeCard";
import { MoveLogCard } from "./components/dashboard/MoveLogCard";
import { Icon } from "./components/ui/Icon";
import { useGameState } from "./hooks/useGameState";

function App() {
  const game = useGameState();
  const currentTurnLabel = game.currentTurn === "red" ? "Rojo" : "Negro";
  const currentModeLabel =
    game.mode === "human-vs-ai"
      ? `Humano vs IA (${game.humanColor === "red" ? "Rojo" : "Negro"})`
      : "IA vs IA";

  const chartRedSeries = game.heuristicHistory.map(([r]) => r);
  const chartBlackSeries = game.heuristicHistory.map(([, b]) => b);

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
      <KpiCard
        label="Ruta planificada"
        value={String(game.plannedRoute.length)}
        description="Pasos pendientes"
        icon={<Icon name="flag" className="icon icon--accent" />}
      />
    </div>
  );

  const rightPanel = (
    <div className="analytics-grid">
      <PositionReadingCard
        turn={currentTurnLabel}
        redLegalMoves={game.redLegalMoves}
        blackLegalMoves={game.blackLegalMoves}
        redCost={game.redCost}
        blackCost={game.blackCost}
      />
      <HeuristicChartCard red={chartRedSeries} black={chartBlackSeries} />
      <EngineAnalysisCard
        redCost={game.redCost}
        blackCost={game.blackCost}
        engineMessage={game.engineMessage}
        searchStatus={game.searchStatus}
      />
      <AStarPlanCard
        steps={game.plannedSteps}
        expandedNodes={game.plannedExpandedNodes}
        searchDuration={game.plannedSearchDuration}
        searchReason={game.plannedSearchReason}
      />
      <CurrentModeCard text={currentModeLabel} />
      <MoveLogCard moveLog={game.moveLog} />
    </div>
  );

  return (
    <DashboardLayout
      header={<Header />}
      summary={<MatchSummaryCard currentTurnLabel={currentTurnLabel} message={game.summaryMessage} />}
      kpis={kpis}
      left={
        <ControlSidebar
          mode={game.mode}
          humanColor={game.humanColor}
          strategy={game.strategy}
          onModeChange={game.setMode}
          onHumanColorChange={game.setHumanColor}
          onStrategyChange={game.setStrategy}
          onReset={game.resetGame}
          onAnalyze={game.analyzeWithAStar}
          onAdvance={game.advancePlan}
          onPlayAi={game.playAiMove}
        />
      }
      center={
        <BoardPanel
          pieces={game.pieces}
          selectedPieceId={game.selectedPieceId}
          legalMoves={game.legalMoves}
          onSelectSquare={game.selectSquare}
        />
      }
      right={rightPanel}
    />
  );
}

export default App;

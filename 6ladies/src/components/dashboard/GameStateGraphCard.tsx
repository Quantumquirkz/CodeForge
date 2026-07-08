import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { TreeChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import type { GameOutcome } from "../../engine/outcome";
import type { DecisionTreeNode } from "../../types/game";
import { simplifyTree, cloneTree } from "../../utils/treeSimplifier";

echarts.use([TreeChart, TooltipComponent, CanvasRenderer]);

type GameStateGraphCardProps = {
  active: boolean;
  treeDataGeneral: DecisionTreeNode;
  treeDataRed: DecisionTreeNode;
  treeDataBlack: DecisionTreeNode;
  aiThinking: boolean;
  searchStatus: string;
  plannedExpandedNodes: number;
  plannedSearchDuration: number | null;
  outcome: GameOutcome | null;
};

type TreeView = "general" | "red" | "black";

function treeLabel(view: TreeView): string {
  if (view === "red") return "Rojas";
  if (view === "black") return "Negras";
  return "General";
}

function treeTone(view: TreeView): string {
  if (view === "red") return "#d9213f";
  if (view === "black") return "#1e293b";
  return "#c8892d";
}

export function GameStateGraphCard({
  active,
  treeDataGeneral,
  treeDataRed,
  treeDataBlack,
  aiThinking,
  searchStatus,
  plannedExpandedNodes,
  plannedSearchDuration,
  outcome
}: GameStateGraphCardProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.EChartsType | null>(null);
  const [view, setView] = useState<TreeView>("general");
  const [compact, setCompact] = useState(true);

  const selectedTree = view === "red" ? treeDataRed : view === "black" ? treeDataBlack : treeDataGeneral;

  const processedTree = useMemo(() => {
    if (!active || !selectedTree) return null;
    const raw = cloneTree(selectedTree);
    if (compact) {
      return simplifyTree(raw);
    }
    return raw;
  }, [active, selectedTree, compact]);

  const option = useMemo<EChartsOption>(() => {
    if (!active || !processedTree) {
      return { backgroundColor: "transparent", series: [] };
    }

    const accent = treeTone(view);

    return {
      backgroundColor: "transparent",
      animationDurationUpdate: 180,
      animationEasingUpdate: "cubicOut",
      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        borderWidth: 0,
        textStyle: {
          color: "#fffdf7",
          fontSize: 12
        }
      },
      series: [
        {
          type: "tree",
          data: [processedTree],
          top: "8%",
          left: "2%",
          right: "6%",
          bottom: "8%",
          symbol: "emptyCircle",
          symbolSize: 12,
          roam: true,
          expandAndCollapse: true,
          initialTreeDepth: compact ? 2 : 20,
          orient: "LR",
          edgeShape: "polyline",
          edgeForkPosition: "50%",
          nodePadding: 14,
          layerPadding: 48,
          label: {
            position: "right",
            verticalAlign: "middle",
            align: "left",
            fontSize: 11,
            fontWeight: 600,
            color: "#0f172a"
          },
          leaves: {
            label: {
              position: "right",
              align: "left",
              verticalAlign: "middle"
            }
          },
          emphasis: {
            focus: "descendant"
          },
          lineStyle: {
            color: accent,
            width: 1.4,
            curveness: 0,
            opacity: 0.6
          }
        }
      ]
    };
  }, [active, processedTree, view, compact]);

  useEffect(() => {
    if (!active || !chartRef.current) {
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
      return;
    }

    const chart = echarts.init(chartRef.current, undefined, { renderer: "canvas" });
    chartInstanceRef.current = chart;

    const resize = () => {
      chart.resize();
    };

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (observer) {
      observer.observe(chartRef.current);
    }

    chart.setOption(option, { notMerge: true, lazyUpdate: true });

    window.addEventListener("resize", resize);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, [active]);

  useEffect(() => {
    if (active) {
      chartInstanceRef.current?.setOption(option, { notMerge: true, lazyUpdate: true });
    }
  }, [active, option]);

  const title = outcome?.over
    ? outcome.winner
      ? `Partida terminada: gana ${outcome.winner === "red" ? "Rojo" : "Negro"}`
      : "Partida terminada en empate"
    : aiThinking
      ? "El árbol crece en tiempo real"
      : compact
        ? "Árbol simplificado (3 ramas máx., 2 niveles de profundidad)"
        : "Árbol de decisiones completo";

  return (
    <section className="analytics-card game-graph-card game-graph-card--large">
      <div className="game-graph-card__header">
        <div>
          <span className="eyebrow">Árbol de decisiones</span>
          <strong className="analytics-card__headline">{treeLabel(view)}</strong>
        </div>
        <div className="game-graph-card__tabs" role="tablist" aria-label="Vistas del árbol">
          <button
            type="button"
            className={`game-graph-card__tab${compact ? " is-active" : ""}`}
            onClick={() => setCompact(true)}
            aria-pressed={compact}
          >
            Compacta
          </button>
          <button
            type="button"
            className={`game-graph-card__tab${!compact ? " is-active" : ""}`}
            onClick={() => setCompact(false)}
            aria-pressed={!compact}
          >
            Completa
          </button>
          <button type="button" className={`game-graph-card__tab${view === "general" ? " is-active" : ""}`} onClick={() => setView("general")}>
            General
          </button>
          <button type="button" className={`game-graph-card__tab${view === "red" ? " is-active" : ""}`} onClick={() => setView("red")}>
            Rojas
          </button>
          <button type="button" className={`game-graph-card__tab${view === "black" ? " is-active" : ""}`} onClick={() => setView("black")}>
            Negras
          </button>
        </div>
      </div>
      {active ? (
        <>
          <p className="analytics-card__text analytics-card__text--muted">{title}</p>
          <div ref={chartRef} className="game-graph-card__chart game-graph-card__chart--large" aria-label="Árbol de decisiones del juego" role="img" />
          <p className="game-graph-card__caption">
            {compact
              ? "Se muestran hasta 3 alternativas por nodo y 2 niveles de profundidad. Pulsa un nodo colapsado para expandirlo y ver los saltos rectos analizados."
              : "Árbol completo con todas las ramas generadas a partir de saltos rectos. Cada nodo es expandible/colapsable."}
            {searchStatus ? ` Estado: ${searchStatus}.` : ""}
            {plannedSearchDuration !== null ? ` Tiempo: ${plannedSearchDuration.toFixed(0)} ms.` : ""}
            {plannedExpandedNodes > 0 ? ` Nodos expandidos: ${plannedExpandedNodes}.` : ""}
          </p>
        </>
      ) : (
        <div className="game-graph-card__empty">
          <span>Árbol inactivo</span>
          <p>Se activará cuando comience una partida o cuando la IA genere saltos rectos.</p>
        </div>
      )}
    </section>
  );
}

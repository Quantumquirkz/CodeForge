import { Badge } from "../ui/Badge";

type EngineAnalysisCardProps = {
  redCost: number;
  blackCost: number;
  engineMessage: string;
  searchStatus: string;
};

export function EngineAnalysisCard({ redCost, blackCost, engineMessage, searchStatus }: EngineAnalysisCardProps) {
  return (
    <section className="analytics-card">
      <span className="eyebrow">Análisis heurístico (motor)</span>
      <div className="engine-metrics">
        <div className="engine-row">
          <span>Coste rojo tras un salto recto</span>
          <strong className="text-red">{redCost.toFixed(2)}</strong>
        </div>
        <div className="engine-row">
          <span>Coste negro tras un salto recto</span>
          <strong className="text-black">{blackCost.toFixed(2)}</strong>
        </div>
      </div>
      <p className="analytics-card__text">{engineMessage}</p>
      <p className="analytics-card__text analytics-card__text--muted">{searchStatus}</p>
      <Badge tone="accent">Motor: minimax</Badge>
    </section>
  );
}

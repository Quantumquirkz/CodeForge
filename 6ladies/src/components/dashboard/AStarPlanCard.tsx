type AStarPlanCardProps = {
  steps: number;
  expandedNodes: number;
  searchDuration: number | null;
  searchReason: string | null;
};

export function AStarPlanCard({ steps, expandedNodes, searchDuration, searchReason }: AStarPlanCardProps) {
  return (
    <section className="analytics-card">
      <span className="eyebrow">Ruta / Plan A* de saltos rectos</span>
      {steps > 0 ? (
        <div className="nested-panel">
          <strong>Plan A*</strong>
          <p>{steps} {steps === 1 ? "salto recto" : "saltos rectos"} planificados.</p>
          {expandedNodes > 0 && (
            <p>Nodos expandidos: {expandedNodes}</p>
          )}
          {searchDuration !== null && (
            <p>Duración: {searchDuration.toFixed(0)}ms</p>
          )}
          {searchReason && (
            <p>Motivo: {searchReason}</p>
          )}
        </div>
      ) : (
        <div className="nested-panel">
          <strong>Plan A*</strong>
          <p>No hay plan de saltos rectos almacenado.</p>
        </div>
      )}
      <div className="nested-panel nested-panel--row">
        <span>Saltos rectos pendientes</span>
        <strong>{steps}</strong>
      </div>
    </section>
  );
}

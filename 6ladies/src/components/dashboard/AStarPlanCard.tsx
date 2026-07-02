type AStarPlanCardProps = {
  steps: number;
  expandedNodes: number;
  searchDuration: number | null;
  searchReason: string | null;
};

export function AStarPlanCard({ steps, expandedNodes, searchDuration, searchReason }: AStarPlanCardProps) {
  return (
    <section className="analytics-card">
      <span className="eyebrow">Ruta / Plan A*</span>
      {steps > 0 ? (
        <div className="nested-panel">
          <strong>Plan A*</strong>
          <p>{steps} paso{steps !== 1 ? "s" : ""} planificado{steps !== 1 ? "s" : ""}.</p>
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
          <p>No hay plan almacenado.</p>
        </div>
      )}
      <div className="nested-panel nested-panel--row">
        <span>Pasos pendientes</span>
        <strong>{steps}</strong>
      </div>
    </section>
  );
}

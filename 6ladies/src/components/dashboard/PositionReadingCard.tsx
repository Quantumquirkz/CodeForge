type PositionReadingCardProps = {
  turn: string;
  redLegalMoves: number;
  blackLegalMoves: number;
  redCost: number;
  blackCost: number;
};

export function PositionReadingCard({ turn, redLegalMoves, blackLegalMoves, redCost, blackCost }: PositionReadingCardProps) {
  return (
    <section className="analytics-card">
      <span className="eyebrow">Lectura de posición</span>
      <div className="reading-grid">
        <div className="reading-metric">
          <span>Turno</span>
          <strong>{turn}</strong>
        </div>
        <div className="reading-metric">
          <span>Legal (R)</span>
          <strong>{redLegalMoves}</strong>
        </div>
        <div className="reading-metric">
          <span>Legal (N)</span>
          <strong>{blackLegalMoves}</strong>
        </div>
      </div>
      <div className="reading-metric reading-metric--wide">
        <span>Coste heurístico (Rojo/Negro)</span>
        <strong className="text-red">{redCost.toFixed(1)}</strong>
        <span> / </span>
        <strong className="text-black">{blackCost.toFixed(1)}</strong>
      </div>
    </section>
  );
}

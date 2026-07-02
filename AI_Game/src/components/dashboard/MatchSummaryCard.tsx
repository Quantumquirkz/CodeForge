type MatchSummaryCardProps = {
  currentTurnLabel: string;
  message: string;
};

export function MatchSummaryCard({ currentTurnLabel, message }: MatchSummaryCardProps) {
  return (
    <section className="summary-card">
      <span className="eyebrow">Resumen de partida</span>
      <h2 className="summary-card__title">{currentTurnLabel} al turno</h2>
      <p className="summary-card__text">{message}</p>
      <div className="legend-row">
        <span className="legend-item">
          <i className="legend-dot legend-dot--red" />
          Rojo
        </span>
        <span className="legend-item">
          <i className="legend-dot legend-dot--black" />
          Negro
        </span>
      </div>
      <div className="summary-card__watermark">♛</div>
    </section>
  );
}

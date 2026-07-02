import { CHART_Y_TICKS } from "../../data/mockGame";

type HeuristicChartCardProps = {
  red: number[];
  black: number[];
};

function mapSeriesToPoints(series: number[], width: number, height: number): string {
  const min = -100;
  const max = 100;
  const step = width / (series.length - 1);
  return series
    .map((value, index) => {
      const x = index * step;
      const clamped = Math.min(max, Math.max(min, value));
      const y = ((max - clamped) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function computeXTicks(count: number): number[] {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i);
  const step = Math.max(1, Math.floor((count - 1) / 4));
  const ticks: number[] = [];
  for (let i = 0; i < count; i += step) {
    ticks.push(i);
  }
  if (ticks[ticks.length - 1] !== count - 1) {
    ticks.push(count - 1);
  }
  return ticks;
}

export function HeuristicChartCard({ red, black }: HeuristicChartCardProps) {
  const width = 260;
  const height = 180;
  const hasData = red.length > 1 && black.length > 1;
  const xTicks = computeXTicks(red.length);

  return (
    <section className="analytics-card">
      <div className="analytics-card__header">
        <span className="eyebrow">Evolución heurística</span>
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
      </div>
      <div className="chart-grid">
        <div className="chart-y-axis">
          {CHART_Y_TICKS.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="chart-stage">
          {hasData ? (
            <>
              <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Gráfica heurística">
                {CHART_Y_TICKS.map((tick) => {
                  const y = ((100 - tick) / 200) * height;
                  return <line key={tick} x1="0" x2={width} y1={y} y2={y} className="chart-grid-line" />;
                })}
                {xTicks.map((_, index) => {
                  const x = (index / (xTicks.length - 1)) * width;
                  return <line key={x} x1={x} x2={x} y1="0" y2={height} className="chart-grid-line chart-grid-line--vertical" />;
                })}
                <polyline points={mapSeriesToPoints(red, width, height)} className="chart-line chart-line--red" />
                <polyline points={mapSeriesToPoints(black, width, height)} className="chart-line chart-line--black" />
              </svg>
              <div className="chart-x-axis">
                {xTicks.map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="chart-empty">
              <span>No hay datos aún.</span>
              <small>La evolución aparecerá cuando se registren movimientos.</small>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

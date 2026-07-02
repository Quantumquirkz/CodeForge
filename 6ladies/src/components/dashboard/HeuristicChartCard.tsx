type HeuristicChartCardProps = {
  red: number[];
  black: number[];
};

const WIDTH = 260;
const HEIGHT = 170;
const PAD = 6;

/** Escala dinámica: se ajusta a los datos reales (con margen del 10 %). */
function computeRange(series: number[][]): [number, number] {
  const all = series.flat();
  if (all.length === 0) {
    return [-10, 10];
  }
  let min = Math.min(...all, 0);
  let max = Math.max(...all, 0);
  if (min === max) {
    min -= 5;
    max += 5;
  }
  const margin = (max - min) * 0.1;
  return [min - margin, max + margin];
}

function toPoints(series: number[], min: number, max: number): string {
  const innerW = WIDTH - PAD * 2;
  const innerH = HEIGHT - PAD * 2;
  const step = series.length > 1 ? innerW / (series.length - 1) : 0;
  return series
    .map((value, index) => {
      const x = PAD + index * step;
      const y = PAD + ((max - value) / (max - min)) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Área bajo la curva (para el relleno suave de cada serie). */
function toArea(series: number[], min: number, max: number): string {
  const points = toPoints(series, min, max);
  const innerW = WIDTH - PAD * 2;
  const baseY = PAD + ((max - 0) / (max - min)) * (HEIGHT - PAD * 2);
  const lastX = series.length > 1 ? PAD + innerW : PAD;
  return `${PAD},${baseY.toFixed(1)} ${points} ${lastX.toFixed(1)},${baseY.toFixed(1)}`;
}

function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min;
  const rawStep = span / (count - 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.ceil(rawStep / pow) * pow;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}

/**
 * Gráfica de evolución de la evaluación heurística por jugada.
 * Valores positivos favorecen al color de la serie. Escala dinámica,
 * línea de cero, relleno de área y valor final de cada serie.
 */
export function HeuristicChartCard({ red, black }: HeuristicChartCardProps) {
  const hasData = red.length > 1 && black.length > 1;
  const [min, max] = computeRange([red, black]);
  const yTicks = niceTicks(min, max);
  const zeroY = PAD + ((max - 0) / (max - min)) * (HEIGHT - PAD * 2);
  const lastRed = red.length > 0 ? red[red.length - 1] : 0;
  const lastBlack = black.length > 0 ? black[black.length - 1] : 0;

  return (
    <section className="analytics-card">
      <div className="analytics-card__header">
        <span className="eyebrow">Evolución heurística</span>
        <div className="legend-row">
          <span className="legend-item">
            <i className="legend-dot legend-dot--red" />
            Rojo {hasData ? `(${lastRed.toFixed(1)})` : ""}
          </span>
          <span className="legend-item">
            <i className="legend-dot legend-dot--black" />
            Negro {hasData ? `(${lastBlack.toFixed(1)})` : ""}
          </span>
        </div>
      </div>
      {hasData ? (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="chart-svg chart-svg--full"
            role="img"
            aria-label="Evolución de la evaluación heurística por jugada"
          >
            {yTicks.map((tick) => {
              const y = PAD + ((max - tick) / (max - min)) * (HEIGHT - PAD * 2);
              return (
                <g key={tick}>
                  <line x1={PAD} x2={WIDTH - PAD} y1={y} y2={y} className="chart-grid-line" />
                  <text x={PAD + 2} y={y - 2} className="chart-tick-label">
                    {tick}
                  </text>
                </g>
              );
            })}
            <line x1={PAD} x2={WIDTH - PAD} y1={zeroY} y2={zeroY} className="chart-zero-line" />
            <polygon points={toArea(red, min, max)} className="chart-area chart-area--red" />
            <polygon points={toArea(black, min, max)} className="chart-area chart-area--black" />
            <polyline points={toPoints(red, min, max)} className="chart-line chart-line--red" />
            <polyline points={toPoints(black, min, max)} className="chart-line chart-line--black" />
          </svg>
          <div className="chart-caption">
            Evaluación por jugada (positivo = ventaja del color). Jugadas: {red.length}
          </div>
        </>
      ) : (
        <div className="chart-empty">
          <span>No hay datos aún.</span>
          <small>La evolución aparecerá cuando se registren movimientos.</small>
        </div>
      )}
    </section>
  );
}

import type { MoveRecord } from "../../types/game";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { moveLogToCsv } from "../../utils/game";

type MoveLogCardProps = {
  moveLog: MoveRecord[];
};

function downloadCsv(csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ai-game-movimientos-${new Date().toISOString().slice(0, 19).replaceAll(":", "-")}.csv`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function MoveLogCard({ moveLog }: MoveLogCardProps) {
  const csv = moveLogToCsv(moveLog);
  const latest = moveLog[moveLog.length - 1] ?? null;

  return (
    <section className="analytics-card analytics-card--log">
      <div className="analytics-card__header">
        <span className="eyebrow">Registro en tiempo real</span>
        <div className="move-log__header-actions">
          <Badge tone="accent">{moveLog.length} movimientos</Badge>
          <Button
            variant="secondary"
            onClick={() => downloadCsv(csv)}
            disabled={moveLog.length === 0}
            ariaLabel="Descargar registro CSV"
          >
            CSV
          </Button>
        </div>
      </div>

      <p className="analytics-card__text analytics-card__text--muted">
        Tabla dinámica de lo que está pasando en la partida. El CSV se genera desde esta vista
        para que puedas descargar el registro completo cuando quieras.
      </p>

      {moveLog.length === 0 ? (
        <div className="empty-log">
          <div className="empty-log__icon">🗎</div>
          <p>Aún no se han realizado jugadas.</p>
          <span>La tabla y el CSV se llenarán en tiempo real.</span>
        </div>
      ) : (
        <>
          <div className="move-log-table__wrap">
            <table className="move-log-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th>Movimiento</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {moveLog.slice().reverse().map((record, index) => (
                  <tr key={record.id} className={latest?.id === record.id ? "move-log-table__row--latest" : ""}>
                    <td>{moveLog.length - index}</td>
                    <td>
                      <span className={`text-${record.color}`}>{record.color === "red" ? "Rojo" : "Negro"}</span>
                    </td>
                    <td className="move-log-table__notation">{record.notation}</td>
                    <td>{record.from.row},{record.from.col}</td>
                    <td>{record.to.row},{record.to.col}</td>
                    <td>{record.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="move-log-table__footer">
            <span>Último movimiento: {latest?.notation ?? "-"}</span>
            <Button
              variant="ghost"
              onClick={() => downloadCsv(csv)}
              disabled={moveLog.length === 0}
              ariaLabel="Descargar CSV del registro"
            >
              ⭳
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

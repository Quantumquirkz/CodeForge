import type { MoveRecord } from "../../types/game";
import { Badge } from "../ui/Badge";

type MoveLogCardProps = {
  moveLog: MoveRecord[];
};

export function MoveLogCard({ moveLog }: MoveLogCardProps) {
  return (
    <section className="analytics-card analytics-card--log">
      <div className="analytics-card__header">
        <span className="eyebrow">Registro de movimientos recientes</span>
        <Badge tone="accent">{moveLog.length} movimientos</Badge>
      </div>
      {moveLog.length === 0 ? (
        <div className="empty-log">
          <div className="empty-log__icon">🗎</div>
          <p>Aún no se han realizado jugadas.</p>
          <span>Los movimientos aparecerán aquí.</span>
        </div>
      ) : (
        <ol className="move-log">
          {moveLog.slice().reverse().map((record) => (
            <li key={record.id}>
              <strong>{record.notation}</strong>
              <span>{record.timestamp}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

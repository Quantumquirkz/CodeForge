import { useEffect, useState } from "react";
import type { GameOutcome } from "../../engine/outcome";
import { Button } from "../ui/Button";

type WinnerBannerProps = {
  outcome: GameOutcome | null;
  onReset: () => void;
};

/**
 * Aviso grande de fin de partida: muestra el ganador (o el empate) y el
 * motivo (formación completada, repetición triple o bloqueo mutuo).
 */
export function WinnerBanner({ outcome, onReset }: WinnerBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!outcome?.over) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [outcome]);

  if (!outcome?.over || !visible) {
    return null;
  }

  const isDraw = outcome.winner === null;
  const colorClass = isDraw
    ? "winner-banner--draw"
    : outcome.winner === "red"
      ? "winner-banner--red"
      : "winner-banner--black";
  const title = isDraw ? "Empate" : `¡Gana ${outcome.winner === "red" ? "Rojo" : "Negro"}!`;

  return (
    <div className={`winner-banner ${colorClass}`} role="alert">
      <span className="winner-banner__trophy">{isDraw ? "🤝" : "🏆"}</span>
      <div className="winner-banner__text">
        <strong className="winner-banner__title">{title}</strong>
        <span className="winner-banner__reason">{outcome.reason}</span>
      </div>
      <Button variant="primary" onClick={onReset}>
        Jugar de nuevo
      </Button>
    </div>
  );
}

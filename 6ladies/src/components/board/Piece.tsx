import type { PlayerColor } from "../../types/game";

type PieceProps = {
  color: PlayerColor;
  selected: boolean;
};

export function Piece({ color, selected }: PieceProps) {
  return (
    <span className={`piece piece--${color}${selected ? " piece--selected" : ""}`} />
  );
}

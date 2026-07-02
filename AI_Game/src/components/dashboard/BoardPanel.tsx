import type { BoardSquare, Piece } from "../../types/game";
import { Board } from "../board/Board";
import { Icon } from "../ui/Icon";

type BoardPanelProps = {
  pieces: Piece[];
  selectedPieceId: string | null;
  legalMoves: BoardSquare[];
  onSelectSquare: (square: BoardSquare) => void;
};

export function BoardPanel({ pieces, selectedPieceId, legalMoves, onSelectSquare }: BoardPanelProps) {
  return (
    <section className="board-panel-card">
      <div className="board-panel-card__header">
        <span className="eyebrow">Tablero interactivo</span>
      </div>
      <Board
        pieces={pieces}
        selectedPieceId={selectedPieceId}
        legalMoves={legalMoves}
        onSelectSquare={onSelectSquare}
      />
      <div className="board-help">
        <Icon name="lightbulb" className="icon icon--accent" />
        <span>Selecciona una ficha y luego una casilla resaltada para ver las jugadas disponibles.</span>
      </div>
    </section>
  );
}

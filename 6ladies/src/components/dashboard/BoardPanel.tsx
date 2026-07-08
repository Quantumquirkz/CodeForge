import type { BoardSquare, Piece } from "../../types/game";
import type { Move } from "../../engine/types";
import { engineIndexToBoardSquare, squareToNotation } from "../../utils/game";
import { Board } from "../board/Board";
import { Icon } from "../ui/Icon";

type BoardPanelProps = {
  pieces: Piece[];
  selectedPieceId: string | null;
  legalMoves: Move[];
  onSelectSquare: (square: BoardSquare) => void;
};

export function BoardPanel({ pieces, selectedPieceId, legalMoves, onSelectSquare }: BoardPanelProps) {
  const previewSquares = legalMoves
    .map((move) => squareToNotation(engineIndexToBoardSquare(move.to)))
    .sort();

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
        <span>
          {selectedPieceId
            ? legalMoves.length > 0
              ? `Saltos rectos disponibles: ${previewSquares.join(", ")}.`
              : "La ficha seleccionada no tiene saltos rectos legales."
            : "Selecciona una ficha para ver sus saltos rectos disponibles."}
        </span>
      </div>
    </section>
  );
}

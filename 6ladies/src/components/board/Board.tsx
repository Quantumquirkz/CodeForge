import { BOARD_SIZE, COLUMN_LABELS } from "../../data/boardConstants";
import type { BoardSquare, Piece as PieceType } from "../../types/game";
import type { Move } from "../../engine/types";
import { squareKey } from "../../utils/game";
import { Piece } from "./Piece";

type BoardProps = {
  pieces: PieceType[];
  selectedPieceId: string | null;
  legalMoves: Move[];
  onSelectSquare: (square: BoardSquare) => void;
};

export function Board({ pieces, selectedPieceId, legalMoves, onSelectSquare }: BoardProps) {
  return (
    <div className="board-shell">
      <div className="board-axis board-axis--top">
        <span />
        {COLUMN_LABELS.map((label) => (
          <span key={`top-${label}`}>{label}</span>
        ))}
        <span />
      </div>
      <div className="board-layout">
        <div className="board-axis board-axis--left">
          {Array.from({ length: BOARD_SIZE }, (_, index) => BOARD_SIZE - index).map((rowLabel) => (
            <span key={`left-${rowLabel}`}>{rowLabel}</span>
          ))}
        </div>
        <div className="board-grid" role="grid" aria-label="Tablero 8x8">
          {Array.from({ length: BOARD_SIZE }, (_, rowIndex) =>
            Array.from({ length: BOARD_SIZE }, (_, colIndex) => {
              const row = BOARD_SIZE - rowIndex;
              const col = colIndex;
              const piece = pieces.find((entry) => entry.row === row && entry.col === col);
              const highlighted = legalMoves.some((move) => {
                const target = move.to;
                const targetRow = BOARD_SIZE - Math.floor(target / BOARD_SIZE);
                const targetCol = target % BOARD_SIZE;
                return targetRow === row && targetCol === col;
              });
              const square = { row, col };
              const isDark = (rowIndex + colIndex) % 2 === 1;

              return (
                <button
                  key={squareKey(square)}
                  type="button"
                  className={`board-square ${isDark ? "board-square--dark" : "board-square--light"}${
                    highlighted ? " board-square--highlight" : ""
                  }`}
                  onClick={() => onSelectSquare(square)}
                  aria-label={`Casilla ${COLUMN_LABELS[col]}${row}`}
                >
                  {piece ? <Piece color={piece.color} selected={piece.id === selectedPieceId} /> : null}
                </button>
              );
            })
          )}
        </div>
        <div className="board-axis board-axis--right">
          {Array.from({ length: BOARD_SIZE }, (_, index) => BOARD_SIZE - index).map((rowLabel) => (
            <span key={`right-${rowLabel}`}>{rowLabel}</span>
          ))}
        </div>
      </div>
      <div className="board-axis board-axis--bottom">
        <span />
        {COLUMN_LABELS.map((label) => (
          <span key={`bottom-${label}`}>{label}</span>
        ))}
        <span />
      </div>
    </div>
  );
}

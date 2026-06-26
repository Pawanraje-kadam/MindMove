import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Position, Move } from '../engine/types';

interface BoardProps {
  showArrows?: boolean;
  bestMove?: Move | null;
}

const Board: React.FC<BoardProps> = ({ showArrows = false, bestMove = null }) => {
  const {
    gameState,
    selectedSquare,
    legalMoves,
    lastMove,
    boardFlipped,
    selectSquare,
    showCoordinates,
    animatingMove,
  } = useGameStore();

  const [arrows, setArrows] = useState<{ from: Position; to: Position }[]>([]);

  const board = gameState.board;
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  // Flip board if needed
  const displayBoard = boardFlipped ? [...board].reverse().map(row => [...row].reverse()) : board;

  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;

  const getSquareClass = (row: number, col: number, pos: Position) => {
    let classes = `chess-square ${isLightSquare(row, col) ? 'chess-square-light' : 'chess-square-dark'}`;

    // Last move highlight
    if (lastMove && 
        ((lastMove.from.row === pos.row && lastMove.from.col === pos.col) || 
         (lastMove.to.row === pos.row && lastMove.to.col === pos.col))) {
      classes += isLightSquare(row, col) ? ' chess-square-hl-light' : ' chess-square-hl-dark';
    }

    // Selected square
    if (selectedSquare && selectedSquare.row === pos.row && selectedSquare.col === pos.col) {
      classes += ' ring-2 ring-[#3d9cf5] ring-offset-2 ring-offset-[#0c1018]';
    }

    return classes;
  };

  const handleSquareClick = (row: number, col: number) => {
    const actualRow = boardFlipped ? 7 - row : row;
    const actualCol = boardFlipped ? 7 - col : col;
    selectSquare({ row: actualRow, col: actualCol });
  };

  // Render piece
  const renderPiece = (piece: any, row: number, col: number) => {
    if (!piece) return null;

    const isAnimating = animatingMove && 
      animatingMove.to.row === (boardFlipped ? 7 - row : row) && 
      animatingMove.to.col === (boardFlipped ? 7 - col : col);

    return (
      <div 
        className={`chess-piece ${isAnimating ? 'animate-move' : ''}`}
        style={{
          transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 180ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <img 
          src={`/pieces/${piece.color}-${piece.type}.svg`} 
          alt={`${piece.color} ${piece.type}`}
          className="w-full h-full object-contain drop-shadow-lg"
          draggable={false}
        />
      </div>
    );
  };

  // Render legal move indicators
  const renderMoveIndicator = (row: number, col: number) => {
    const actualPos = { 
      row: boardFlipped ? 7 - row : row, 
      col: boardFlipped ? 7 - col : col 
    };

    const isLegal = legalMoves.some(m => m.to.row === actualPos.row && m.to.col === actualPos.col);
    if (!isLegal) return null;

    const isCapture = legalMoves.some(m => 
      m.to.row === actualPos.row && 
      m.to.col === actualPos.col && 
      m.captured
    );

    return isCapture ? (
      <div className="capture-ring" />
    ) : (
      <div className="move-dot" />
    );
  };

  return (
    <div className="relative w-full h-full select-none">
      <div className="chess-board relative">
        {displayBoard.map((rowData, row) => 
          rowData.map((piece, col) => {
            const actualRow = boardFlipped ? 7 - row : row;
            const actualCol = boardFlipped ? 7 - col : col;
            const pos = { row: actualRow, col: actualCol };

            return (
              <div
                key={`${row}-${col}`}
                className={getSquareClass(row, col, pos)}
                onClick={() => handleSquareClick(row, col)}
              >
                {/* Coordinates */}
                {showCoordinates && (
                  <>
                    {col === 0 && (
                      <div className={`coord-label coord-rank ${isLightSquare(row, col) ? 'coord-dark' : 'coord-light'}`}>
                        {ranks[row]}
                      </div>
                    )}
                    {row === 7 && (
                      <div className={`coord-label coord-file ${isLightSquare(row, col) ? 'coord-dark' : 'coord-light'}`}>
                        {files[col]}
                      </div>
                    )}
                  </>
                )}

                {/* Piece */}
                {renderPiece(piece, row, col)}

                {/* Move indicators */}
                {renderMoveIndicator(row, col)}

                {/* Check indicator */}
                {gameState.isCheck && gameState.turn === piece?.color && piece?.type === 'king' && (
                  <div className="check-glow" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Analysis Arrows */}
      {showArrows && arrows.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
          {arrows.map((arrow, index) => (
            <g key={index}>
              <line
                x1={`${(arrow.from.col + 0.5) * 12.5}%`}
                y1={`${(arrow.from.row + 0.5) * 12.5}%`}
                x2={`${(arrow.to.col + 0.5) * 12.5}%`}
                y2={`${(arrow.to.row + 0.5) * 12.5}%`}
                stroke="#3d9cf5"
                strokeWidth="4"
                strokeOpacity="0.9"
                strokeLinecap="round"
              />
            </g>
          ))}
        </svg>
      )}

      {/* Best Move Arrow (Analysis) */}
      {showArrows && bestMove && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
          <line
            x1={`${(bestMove.from.col + 0.5) * 12.5}%`}
            y1={`${(bestMove.from.row + 0.5) * 12.5}%`}
            x2={`${(bestMove.to.col + 0.5) * 12.5}%`}
            y2={`${(bestMove.to.row + 0.5) * 12.5}%`}
            stroke="#7cb342"
            strokeWidth="5"
            strokeOpacity="0.85"
            strokeDasharray="6 3"
          />
        </svg>
      )}
    </div>
  );
};

export default Board;

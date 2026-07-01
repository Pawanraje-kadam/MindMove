import { useMemo } from 'react';
import { fenToGameState } from '../../engine/board';
import ChessPiece from '../pieces/ChessPieces';
import { FILE_LETTERS, RANK_NUMBERS } from '../../engine/types';

interface Props {
  fen: string;
  turn: 'white' | 'black';
  size?: number;
}

export default function MiniBoard({ fen, size = 280 }: Props) {
  const state = useMemo(() => {
    try { return fenToGameState(fen); } catch { return null; }
  }, [fen]);

  if (!state) {
    return (
      <div style={{
        width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: 13,
      }}>
        Invalid position
      </div>
    );
  }

  const { board } = state;

  return (
    <div style={{
      width: size, height: size, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
      boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(0,0,0,0.3)',
    }}>
      {Array.from({ length: 64 }, (_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const piece = board[row][col];
        const light = (row + col) % 2 === 0;

        return (
          <div
            key={i}
            style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: light ? 'var(--board-light)' : 'var(--board-dark)',
            }}
          >
            {piece && (
              <div style={{
                position: 'absolute', inset: '10%',
                filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))',
              }}>
                <ChessPiece type={piece.type} color={piece.color} className="w-full h-full" />
              </div>
            )}

            {/* rank label */}
            {col === 0 && (
              <span style={{
                position: 'absolute', top: 2, left: 4, fontSize: 10, fontWeight: 700,
                color: light ? 'var(--board-dark)' : 'var(--board-light)',
                userSelect: 'none', pointerEvents: 'none',
              }}>
                {RANK_NUMBERS[row]}
              </span>
            )}

            {/* file label */}
            {row === 7 && (
              <span style={{
                position: 'absolute', bottom: 1, right: 4, fontSize: 10, fontWeight: 700,
                color: light ? 'var(--board-dark)' : 'var(--board-light)',
                userSelect: 'none', pointerEvents: 'none',
              }}>
                {FILE_LETTERS[col]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

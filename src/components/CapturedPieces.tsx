import { Piece, PieceType, PIECE_VALUES } from '../engine/types';
import ChessPiece from './pieces/ChessPieces';

interface CapturedPiecesProps {
  pieces: Piece[];
  advantage: number;
}

const PIECE_ORDER: PieceType[] = ['queen', 'rook', 'bishop', 'knight', 'pawn'];

export default function CapturedPieces({ pieces, advantage }: CapturedPiecesProps) {
  // Sort and group pieces
  const sorted = [...pieces].sort((a, b) => {
    return PIECE_ORDER.indexOf(a.type) - PIECE_ORDER.indexOf(b.type);
  });

  // Group by type for stacking
  const grouped: { type: PieceType; color: string; count: number }[] = [];
  for (const piece of sorted) {
    const existing = grouped.find(g => g.type === piece.type);
    if (existing) {
      existing.count++;
    } else {
      grouped.push({ type: piece.type, color: piece.color, count: 1 });
    }
  }

  if (pieces.length === 0) {
    return <div className="h-5" />;
  }

  return (
    <div className="flex items-center gap-0.5 min-h-[22px] flex-wrap">
      {grouped.map((group, i) => (
        <div key={i} className="flex -space-x-2">
          {Array.from({ length: group.count }).map((_, j) => (
            <div 
              key={j} 
              className="w-[18px] h-[18px] relative"
              style={{ 
                zIndex: group.count - j,
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
              }}
            >
              <ChessPiece 
                type={group.type} 
                color={group.color as any} 
                className="w-full h-full opacity-90" 
              />
            </div>
          ))}
        </div>
      ))}
      {advantage > 0 && (
        <span className="text-[11px] text-gray-400 ml-1.5 font-bold bg-[#1a1a1a]/50 px-1 rounded">
          +{advantage}
        </span>
      )}
    </div>
  );
}

export function calculateAdvantage(whiteCaptured: Piece[], blackCaptured: Piece[]): { white: number; black: number } {
  const whiteMaterial = whiteCaptured.reduce((sum, p) => sum + PIECE_VALUES[p.type], 0);
  const blackMaterial = blackCaptured.reduce((sum, p) => sum + PIECE_VALUES[p.type], 0);
  const diff = whiteMaterial - blackMaterial;

  return {
    white: diff > 0 ? Math.round(diff / 100) : 0,
    black: diff < 0 ? Math.round(Math.abs(diff) / 100) : 0,
  };
}

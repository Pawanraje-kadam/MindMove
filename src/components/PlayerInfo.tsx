import { PieceColor, Piece, PieceType, PIECE_VALUES } from '../engine/types';
import ChessPiece from './pieces/ChessPieces';

interface PlayerInfoProps {
  color: PieceColor;
  name: string;
  isActive: boolean;
  captured: Piece[];
  isThinking?: boolean;
}

const PIECE_ORDER: PieceType[] = ['queen', 'rook', 'bishop', 'knight', 'pawn'];

export default function PlayerInfo({ color, name, isActive, captured, isThinking }: PlayerInfoProps) {
  // Sort captured pieces
  const sorted = [...captured].sort((a, b) => 
    PIECE_ORDER.indexOf(a.type) - PIECE_ORDER.indexOf(b.type)
  );

  // Calculate material advantage
  const materialValue = captured.reduce((sum, p) => sum + PIECE_VALUES[p.type], 0);
  const advantage = Math.round(materialValue / 100);

  return (
    <div className={`player-bar ${isActive ? 'player-bar-active' : ''}`}>
      {/* Avatar */}
      <div className={`player-avatar ${color === 'white' ? 'player-avatar-white' : 'player-avatar-black'}`}>
        {name[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="player-name truncate">{name}</span>
          
          {isActive && !isThinking && (
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          )}
          
          {isThinking && (
            <div className="thinking-indicator">
              <span>Thinking</span>
              <div className="thinking-dots">
                <div className="thinking-dot" />
                <div className="thinking-dot" />
                <div className="thinking-dot" />
              </div>
            </div>
          )}
        </div>
        
        {/* Captured pieces */}
        <div className="flex items-center gap-0.5 min-h-[20px]">
          {sorted.map((piece, i) => (
            <div key={i} className="w-[18px] h-[18px] -mr-[3px]" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>
              <ChessPiece type={piece.type} color={piece.color} className="w-full h-full opacity-85" />
            </div>
          ))}
          {advantage > 0 && (
            <span 
              className="text-[11px] font-bold ml-2 px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)' }}
            >
              +{advantage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

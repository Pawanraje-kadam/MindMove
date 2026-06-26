import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import ChessPiece from './pieces/ChessPieces';
import GameOverOverlay from './GameOverOverlay';
import { FILE_LETTERS, RANK_NUMBERS, Position } from '../engine/types';
import { findKing, isInCheck } from '../engine/board';
import { sounds } from '../utils/sounds';

interface DragState {
  isDragging: boolean;
  piece: { type: string; color: string } | null;
  from: Position | null;
  pos: { x: number; y: number };
}

export default function Board() {
  const {
    gameState, selectedSquare, legalMoves, lastMove,
    boardFlipped, showCoordinates, selectSquare,
    showPromotionDialog, pendingPromotion, handlePromotion, cancelPromotion,
    gameConfig,
  } = useGameStore();

  const { board, turn, isCheckmate } = gameState;
  const boardRef = useRef<HTMLDivElement>(null);
  
  const [drag, setDrag] = useState<DragState>({
    isDragging: false, piece: null, from: null, pos: { x: 0, y: 0 }
  });
  const [hovered, setHovered] = useState<Position | null>(null);

  const kingInCheck = useMemo(() => {
    if (isInCheck(board, turn)) return findKing(board, turn);
    return null;
  }, [board, turn]);

  const canInteract = useCallback(() => {
    if (gameState.isGameOver) return false;
    if (gameConfig.mode === 'hva' && turn !== gameConfig.playerColor) return false;
    if (gameConfig.mode === 'ava') return false;
    return true;
  }, [gameState.isGameOver, gameConfig, turn]);

  const getSquare = useCallback((x: number, y: number): Position | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const size = rect.width / 8;
    let col = Math.floor((x - rect.left) / size);
    let row = Math.floor((y - rect.top) / size);
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    if (boardFlipped) { col = 7 - col; row = 7 - row; }
    return { row, col };
  }, [boardFlipped]);

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, row: number, col: number) => {
    if (!canInteract()) return;
    const piece = board[row][col];
    if (!piece || piece.color !== turn) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDrag({ isDragging: true, piece: { type: piece.type, color: piece.color }, from: { row, col }, pos: { x: clientX, y: clientY } });
    selectSquare({ row, col });
  }, [board, turn, selectSquare, canInteract]);

  const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!drag.isDragging) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDrag(d => ({ ...d, pos: { x, y } }));
    setHovered(getSquare(x, y));
  }, [drag.isDragging, getSquare]);

  const onDragEnd = useCallback((e: MouseEvent | TouchEvent) => {
    if (!drag.isDragging || !drag.from) {
      setDrag({ isDragging: false, piece: null, from: null, pos: { x: 0, y: 0 } });
      return;
    }
    const x = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const y = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const to = getSquare(x, y);
    
    if (to && (to.row !== drag.from.row || to.col !== drag.from.col)) {
      const move = legalMoves.find(m => m.to.row === to.row && m.to.col === to.col);
      if (move) {
        if (move.piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
          useGameStore.getState().selectSquare(drag.from);
          useGameStore.setState({ pendingPromotion: { from: drag.from, to }, showPromotionDialog: true });
        } else {
          if (move.captured) sounds.capture();
          else if (move.isCastle) sounds.castle();
          else sounds.move();
          if (move.isCheck) setTimeout(() => sounds.check(), 100);
          useGameStore.getState().executeMove(move);
        }
      } else {
        sounds.illegal();
      }
    }
    setDrag({ isDragging: false, piece: null, from: null, pos: { x: 0, y: 0 } });
    setHovered(null);
  }, [drag, legalMoves, getSquare]);

  useEffect(() => {
    if (drag.isDragging) {
      const move = (e: MouseEvent | TouchEvent) => onDragMove(e);
      const end = (e: MouseEvent | TouchEvent) => onDragEnd(e);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('touchend', end);
      return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', end);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('touchend', end);
      };
    }
  }, [drag.isDragging, onDragMove, onDragEnd]);

  const isSelected = (r: number, c: number) => selectedSquare?.row === r && selectedSquare?.col === c;
  const isLegal = (r: number, c: number) => legalMoves.some(m => m.to.row === r && m.to.col === c);
  const isLastMove = (r: number, c: number) => lastMove && ((lastMove.from.row === r && lastMove.from.col === c) || (lastMove.to.row === r && lastMove.to.col === c));
  const isCheck = (r: number, c: number) => kingInCheck?.row === r && kingInCheck?.col === c;
  const isCapture = (r: number, c: number) => isLegal(r, c) && (board[r][c] || legalMoves.some(m => m.to.row === r && m.to.col === c && m.captured));
  const isDragging = (r: number, c: number) => drag.isDragging && drag.from?.row === r && drag.from?.col === c;

  const renderSquare = (idx: number) => {
    const row = Math.floor(idx / 8);
    const col = idx % 8;
    const dRow = boardFlipped ? 7 - row : row;
    const dCol = boardFlipped ? 7 - col : col;
    const piece = board[dRow][dCol];
    const light = (dRow + dCol) % 2 === 0;
    const selected = isSelected(dRow, dCol);
    const legal = isLegal(dRow, dCol);
    const last = isLastMove(dRow, dCol);
    const check = isCheck(dRow, dCol);
    const capture = isCapture(dRow, dCol);
    const dragging = isDragging(dRow, dCol);
    const dropTarget = hovered?.row === dRow && hovered?.col === dCol && legal;

    let bgClass = light ? 'chess-square-light' : 'chess-square-dark';
    if (last || selected) bgClass = light ? 'chess-square-hl-light' : 'chess-square-hl-dark';

    return (
      <div
        key={idx}
        className={`chess-square ${bgClass} no-select`}
        style={{ cursor: canInteract() && piece && piece.color === turn ? 'grab' : 'pointer' }}
        onClick={() => canInteract() && selectSquare({ row: dRow, col: dCol })}
        onMouseDown={e => onDragStart(e, dRow, dCol)}
        onTouchStart={e => onDragStart(e, dRow, dCol)}
      >
        {check && <div className="check-glow" style={{ background: isCheckmate ? 
          'radial-gradient(ellipse at center, rgba(239,83,80,0.9) 0%, rgba(180,0,0,0.5) 40%, transparent 70%)' :
          'radial-gradient(ellipse at center, rgba(239,83,80,0.7) 0%, rgba(180,0,0,0.3) 50%, transparent 75%)'
        }} />}
        
        {piece && !dragging && (
          <div className="chess-piece">
            <ChessPiece type={piece.type} color={piece.color} className="w-full h-full" />
          </div>
        )}

        {legal && !capture && <div className="move-dot" />}
        {capture && <div className="capture-ring" />}
        {dropTarget && <div className="absolute inset-0" style={{ background: 'rgba(124,179,66,0.3)' }} />}

        {showCoordinates && col === 0 && (
          <span className={`coord-label coord-rank ${light ? 'coord-light' : 'coord-dark'}`}>
            {RANK_NUMBERS[dRow]}
          </span>
        )}
        {showCoordinates && row === 7 && (
          <span className={`coord-label coord-file ${light ? 'coord-light' : 'coord-dark'}`}>
            {FILE_LETTERS[dCol]}
          </span>
        )}
      </div>
    );
  };

  const dragStyle = (): React.CSSProperties => {
    if (!drag.isDragging || !boardRef.current) return { display: 'none' };
    const size = boardRef.current.getBoundingClientRect().width / 8;
    return {
      position: 'fixed', left: drag.pos.x - size/2, top: drag.pos.y - size/2,
      width: size, height: size, pointerEvents: 'none', zIndex: 1000,
      filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.5))', transform: 'scale(1.08)',
    };
  };

  return (
    <div className="relative w-full h-full">
      <div ref={boardRef} className="chess-board">
        {Array.from({ length: 64 }, (_, i) => renderSquare(i))}
      </div>

      {drag.isDragging && drag.piece && (
        <div style={dragStyle()}>
          <ChessPiece type={drag.piece.type as any} color={drag.piece.color as any} className="w-full h-full" />
        </div>
      )}

      {!showPromotionDialog && <GameOverOverlay />}

      {showPromotionDialog && pendingPromotion && (
        <div className="overlay" style={{ position: 'absolute', borderRadius: 'var(--radius)' }}>
          <div className="modal" style={{ maxWidth: 320 }}>
            <div className="modal-body">
              <div className="modal-title" style={{ fontSize: 18, marginBottom: 16 }}>Promote Pawn</div>
              <div className="flex gap-3 justify-center">
                {(['queen', 'rook', 'bishop', 'knight'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => { sounds.promotion(); handlePromotion(type); }}
                    className="w-16 h-16 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'var(--bg)', border: '2px solid var(--border)' }}
                  >
                    <ChessPiece type={type} color={turn} className="w-12 h-12" />
                  </button>
                ))}
              </div>
              <button 
                onClick={cancelPromotion}
                className="mt-4 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

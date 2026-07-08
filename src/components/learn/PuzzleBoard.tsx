import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { fenToGameState, generateLegalMoves, moveToUCI } from '../../engine/board';
import ChessPiece from '../pieces/ChessPieces';
import { FILE_LETTERS, RANK_NUMBERS, Position } from '../../engine/types';

interface Props {
  fen: string;
  turn: 'white' | 'black';
  correctMoves: string[];
  onMove: (uci: string, isCorrect: boolean) => void;
  size?: number;
  disabled?: boolean;
  showCorrectMove?: string;
}

function parseUCI(uci: string): { from: Position; to: Position } | null {
  if (uci.length < 4) return null;
  const fcol = uci[0].charCodeAt(0) - 97;
  const frow = 8 - parseInt(uci[1]);
  const tcol = uci[2].charCodeAt(0) - 97;
  const trow = 8 - parseInt(uci[3]);
  if (frow < 0 || frow > 7 || fcol < 0 || fcol > 7 || trow < 0 || trow > 7 || tcol < 0 || tcol > 7) return null;
  return { from: { row: frow, col: fcol }, to: { row: trow, col: tcol } };
}

interface DragState {
  isDragging: boolean;
  from: Position | null;
  pos: { x: number; y: number };
}

export default function PuzzleBoard({ fen, turn, correctMoves, onMove, size = 320, disabled, showCorrectMove }: Props) {
  const state = useMemo(() => {
    try { return fenToGameState(fen); } catch { return null; }
  }, [fen]);

  const boardRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState>({ isDragging: false, from: null, pos: { x: 0, y: 0 } });
  const [hovered, setHovered] = useState<Position | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [lastMoveSquares, setLastMoveSquares] = useState<{ from: Position; to: Position } | null>(null);

  const legalMoves = useMemo(() => {
    if (!state) return [];
    return generateLegalMoves(state);
  }, [state]);

  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return [];
    return legalMoves.filter(m => m.from.row === selectedSquare.row && m.from.col === selectedSquare.col);
  }, [legalMoves, selectedSquare]);

  const getSquare = useCallback((x: number, y: number): Position | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const sqSize = rect.width / 8;
    let col = Math.floor((x - rect.left) / sqSize);
    let row = Math.floor((y - rect.top) / sqSize);
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    return { row, col };
  }, []);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (disabled || !state) return;
    const piece = state.board[row][col];
    if (selectedSquare) {
      const move = legalDestinations.find(m => m.to.row === row && m.to.col === col);
      if (move) {
        const uci = moveToUCI(move);
        const isCorrect = correctMoves.includes(uci);
        setLastMoveSquares({ from: selectedSquare, to: { row, col } });
        setSelectedSquare(null);
        onMove(uci, isCorrect);
        return;
      }
      if (piece && piece.color === turn) {
        setSelectedSquare({ row, col });
        return;
      }
      setSelectedSquare(null);
      return;
    }
    if (piece && piece.color === turn) {
      setSelectedSquare({ row, col });
    }
  }, [selectedSquare, legalDestinations, state, turn, correctMoves, onMove, disabled]);

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, row: number, col: number) => {
    if (disabled || !state) return;
    const piece = state.board[row][col];
    if (!piece || piece.color !== turn) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDrag({ isDragging: true, from: { row, col }, pos: { x: clientX, y: clientY } });
    setSelectedSquare({ row, col });
  }, [state, turn, disabled]);

  const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!drag.isDragging) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDrag(d => ({ ...d, pos: { x, y } }));
    setHovered(getSquare(x, y));
  }, [drag.isDragging, getSquare]);

  const onDragEnd = useCallback((e: MouseEvent | TouchEvent) => {
    if (!drag.isDragging || !drag.from || !state) {
      setDrag({ isDragging: false, from: null, pos: { x: 0, y: 0 } });
      return;
    }
    const x = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const y = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const to = getSquare(x, y);
    if (to && (to.row !== drag.from.row || to.col !== drag.from.col)) {
      const move = legalMoves.find(m => m.from.row === drag.from!.row && m.from.col === drag.from!.col && m.to.row === to.row && m.to.col === to.col);
      if (move) {
        const uci = moveToUCI(move);
        const isCorrect = correctMoves.includes(uci);
        setLastMoveSquares({ from: drag.from, to });
        setSelectedSquare(null);
        onMove(uci, isCorrect);
      }
    }
    setDrag({ isDragging: false, from: null, pos: { x: 0, y: 0 } });
    setHovered(null);
  }, [drag, legalMoves, getSquare, correctMoves, onMove, state]);

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

  useEffect(() => { setSelectedSquare(null); setLastMoveSquares(null); }, [fen]);

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

  const board = state.board;

  const correctMoveHighlight = useMemo(() => {
    if (!showCorrectMove) return null;
    return parseUCI(showCorrectMove);
  }, [showCorrectMove]);

  const canDrag = (r: number, c: number) => {
    if (disabled) return false;
    const p = board[r][c];
    return p && p.color === turn;
  };

  const isLegalTarget = (r: number, c: number) => {
    return legalDestinations.some(m => m.to.row === r && m.to.col === c);
  };

  const isLastFrom = (r: number, c: number) => lastMoveSquares?.from.row === r && lastMoveSquares?.from.col === c;
  const isLastTo = (r: number, c: number) => lastMoveSquares?.to.row === r && lastMoveSquares?.to.col === c;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div ref={boardRef} style={{
        width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
        boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(0,0,0,0.3)',
      }}>
        {Array.from({ length: 64 }, (_, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const piece = board[row][col];
          const light = (row + col) % 2 === 0;
          const selected = selectedSquare?.row === row && selectedSquare?.col === col;
          const legal = isLegalTarget(row, col);
          const lastFrom = isLastFrom(row, col);
          const lastTo = isLastTo(row, col);
          const isCapture = legal && !!piece;
          const isCorrectFrom = correctMoveHighlight?.from.row === row && correctMoveHighlight?.from.col === col;
          const isCorrectTo = correctMoveHighlight?.to.row === row && correctMoveHighlight?.to.col === col;
          const movedPiece = isCorrectFrom && correctMoveHighlight ? board[row][col] : null;

          let bg = light ? 'var(--board-light)' : 'var(--board-dark)';
          if (lastFrom || lastTo) bg = light ? 'rgba(255,213,79,0.4)' : 'rgba(255,213,79,0.35)';
          if (isCorrectFrom || isCorrectTo) bg = light ? 'rgba(124,179,66,0.35)' : 'rgba(124,179,66,0.3)';
          if (selected) bg = 'rgba(61,156,245,0.35)';

          return (
            <div
              key={i}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bg, cursor: canDrag(row, col) ? 'grab' : 'pointer',
                transition: 'background 100ms var(--ease)',
              }}
              onClick={() => handleSquareClick(row, col)}
              onMouseDown={e => onDragStart(e, row, col)}
              onTouchStart={e => onDragStart(e, row, col)}
            >
              {piece && !isCorrectFrom && !(drag.isDragging && drag.from?.row === row && drag.from?.col === col) && (
                <div style={{
                  position: 'absolute', inset: '10%',
                  filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))',
                }}>
                  <ChessPiece type={piece.type} color={piece.color} className="w-full h-full" />
                </div>
              )}

              {isCorrectTo && movedPiece && (
                <div style={{
                  position: 'absolute', inset: '10%',
                  filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))',
                  opacity: 0.85,
                }}>
                  <ChessPiece type={movedPiece.type} color={movedPiece.color} className="w-full h-full" />
                </div>
              )}

              {isCorrectFrom && movedPiece && (
                <div style={{
                  position: 'absolute', inset: '10%',
                  opacity: 0.4,
                }}>
                  <ChessPiece type={movedPiece.type} color={movedPiece.color} className="w-full h-full" />
                </div>
              )}

              {legal && !isCapture && (
                <div style={{
                  width: '25%', height: '25%', borderRadius: '50%',
                  background: 'rgba(124,179,66,0.5)',
                  position: 'absolute', pointerEvents: 'none',
                }} />
              )}

              {legal && isCapture && (
                <div style={{
                  position: 'absolute', inset: '3%', borderRadius: '50%',
                  border: '4px solid rgba(124,179,66,0.5)', pointerEvents: 'none',
                }} />
              )}

              <span style={{
                position: 'absolute', top: 2, left: 4, fontSize: 10, fontWeight: 700,
                color: light ? 'var(--board-dark)' : 'var(--board-light)',
                userSelect: 'none', pointerEvents: 'none', opacity: 0.6,
              }}>
                {col === 0 ? RANK_NUMBERS[row] : ''}
              </span>
              <span style={{
                position: 'absolute', bottom: 1, right: 4, fontSize: 10, fontWeight: 700,
                color: light ? 'var(--board-dark)' : 'var(--board-light)',
                userSelect: 'none', pointerEvents: 'none', opacity: 0.6,
              }}>
                {row === 7 ? FILE_LETTERS[col] : ''}
              </span>
            </div>
          );
        })}
      </div>

      {drag.isDragging && boardRef.current && drag.from && (
        <div style={{
          position: 'fixed', left: drag.pos.x - size / 16, top: drag.pos.y - size / 16,
          width: size / 8, height: size / 8, pointerEvents: 'none', zIndex: 1000,
          filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.5))', transform: 'scale(1.08)',
        }}>
          {(() => {
            const p = board[drag.from.row][drag.from.col];
            return p ? <ChessPiece type={p.type} color={p.color} className="w-full h-full" /> : null;
          })()}
        </div>
      )}
    </div>
  );
}

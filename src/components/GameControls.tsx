import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { sounds } from '../utils/sounds';

export default function GameControls() {
  const {
    undoMove, redoMove, flipBoard, resign, offerDraw,
    gameState, newGame, gameConfig, historyIndex, gameHistory, goToMove,
  } = useGameStore();

  const [showConfirm, setShowConfirm] = useState<'resign' | 'draw' | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < gameHistory.length - 1;

  const handleResign = () => {
    resign();
    sounds.gameEnd();
    setShowConfirm(null);
  };

  const handleDraw = () => {
    offerDraw();
    setShowConfirm(null);
  };

  return (
    <div className="game-controls relative">
      <div className="control-group">
        <button onClick={() => goToMove(0)} disabled={!canUndo} className="control-btn" title="Start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z"/>
          </svg>
        </button>
        <button onClick={undoMove} disabled={!canUndo} className="control-btn" title="Previous">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
        </button>
        <button onClick={redoMove} disabled={!canRedo} className="control-btn" title="Next">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
        <button onClick={() => goToMove(gameHistory.length - 1)} disabled={!canRedo} className="control-btn" title="End">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z"/>
          </svg>
        </button>
      </div>

      <div className="flex-1" />

      {!gameState.isGameOver && (
        <div className="flex items-center gap-2">
          <button onClick={flipBoard} className="control-btn" title="Flip board">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
            </svg>
          </button>
          <button onClick={() => setShowConfirm('draw')} className="control-btn" title="Offer draw">
            <span className="text-xs font-bold">½</span>
          </button>
          <button onClick={() => setShowConfirm('resign')} className="control-btn control-btn-danger" title="Resign">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/>
            </svg>
          </button>
        </div>
      )}

      {gameState.isGameOver && (
        <button
          onClick={() => { sounds.gameStart(); newGame(gameConfig); }}
          className="btn btn-primary btn-sm"
        >
          New Game
        </button>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div 
          className="absolute bottom-full left-0 right-0 mb-2 p-4 rounded-xl animate-fade-in-scale"
          style={{ background: 'var(--raised)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', zIndex: 50 }}
        >
          <p className="text-sm font-semibold text-center mb-3" style={{ color: 'var(--text)' }}>
            {showConfirm === 'resign' ? 'Resign this game?' : 'Offer a draw?'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(null)}
              className="btn btn-secondary btn-sm flex-1"
            >
              Cancel
            </button>
            <button
              onClick={showConfirm === 'resign' ? handleResign : handleDraw}
              className="btn btn-sm flex-1"
              style={{ 
                background: showConfirm === 'resign' ? 'var(--error)' : 'var(--warning)', 
                color: '#000' 
              }}
            >
              {showConfirm === 'resign' ? 'Resign' : 'Offer Draw'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

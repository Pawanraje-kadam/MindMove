import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import Board from './Board';
import EvalBar from './EvalBar';
import MoveList from './MoveList';
import GameControls from './GameControls';
import PlayerInfo from './PlayerInfo';
import ToolsPanel from './ToolsPanel';

export default function GameView() {
  const { gameState, gameConfig, boardFlipped, isThinking } = useGameStore();
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  
  const { turn, capturedPieces } = gameState;

  const getPlayerName = (color: 'white' | 'black') => {
    if (gameConfig.mode === 'hvh') return color === 'white' ? 'Player 1' : 'Player 2';
    if (gameConfig.mode === 'hva') {
      return color === gameConfig.playerColor ? 'You' : 'Indo AI';
    }
    return `AI ${color === 'white' ? '1' : '2'}`;
  };

  const topColor = boardFlipped ? 'white' : 'black';
  const bottomColor = boardFlipped ? 'black' : 'white';

  return (
    <div className="game-container">
      {/* Board Section */}
      <div className="board-section">
        {/* Top Player */}
        <div className="w-full mb-2">
          <PlayerInfo
            color={topColor}
            name={getPlayerName(topColor)}
            isActive={turn === topColor && !gameState.isGameOver}
            captured={capturedPieces[topColor]}
            isThinking={isThinking && turn === topColor}
          />
        </div>

        {/* Board + Eval */}
        <div className="board-with-eval">
          <div className="hidden md:block">
            <EvalBar />
          </div>
          <div className="board-frame">
            <Board />
          </div>
        </div>

        {/* Bottom Player */}
        <div className="w-full mt-2">
          <PlayerInfo
            color={bottomColor}
            name={getPlayerName(bottomColor)}
            isActive={turn === bottomColor && !gameState.isGameOver}
            captured={capturedPieces[bottomColor]}
            isThinking={isThinking && turn === bottomColor}
          />
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden w-full mt-3">
          <MobileControls onOpenSheet={() => setShowMobileSheet(true)} />
        </div>
      </div>

      {/* Desktop Panel */}
      <div className="game-panel">
        <div className="card flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <MoveList />
          </div>
          <GameControls />
        </div>
        <div className="card" style={{ height: 180 }}>
          <ToolsPanel />
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {showMobileSheet && (
        <MobileSheet onClose={() => setShowMobileSheet(false)} />
      )}
    </div>
  );
}

function MobileControls({ onOpenSheet }: { onOpenSheet: () => void }) {
  const { undoMove, redoMove, flipBoard, historyIndex, gameHistory, gameState } = useGameStore();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < gameHistory.length - 1;

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: 'var(--raised)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="control-group">
        <button onClick={undoMove} disabled={!canUndo} className="control-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
        </button>
        <button onClick={redoMove} disabled={!canRedo} className="control-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 text-center">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Move {Math.ceil(gameState.moveHistory.length / 2) || '—'}
        </span>
      </div>

      <button onClick={flipBoard} className="control-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
        </svg>
      </button>

      <button 
        onClick={onOpenSheet}
        className="control-btn"
        style={{ background: 'var(--accent)', color: '#000' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
    </div>
  );
}

function MobileSheet({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'moves' | 'tools'>('moves');

  return (
    <>
      <div 
        className="fixed inset-0 z-50 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div className="bottom-sheet animate-slide-up z-50">
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-tabs">
          <button
            onClick={() => setTab('moves')}
            className={`bottom-sheet-tab ${tab === 'moves' ? 'bottom-sheet-tab-active' : 'bottom-sheet-tab-inactive'}`}
          >
            Moves
          </button>
          <button
            onClick={() => setTab('tools')}
            className={`bottom-sheet-tab ${tab === 'tools' ? 'bottom-sheet-tab-active' : 'bottom-sheet-tab-inactive'}`}
          >
            Tools
          </button>
        </div>
        <div className="bottom-sheet-content" style={{ height: 320 }}>
          {tab === 'moves' ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <MoveList />
              </div>
              <GameControls />
            </div>
          ) : (
            <ToolsPanel />
          )}
        </div>
      </div>
    </>
  );
}

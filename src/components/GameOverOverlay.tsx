import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { sounds } from '../utils/sounds';

export default function GameOverOverlay() {
  const { gameState, newGame, gameConfig, setView } = useGameStore();

  useEffect(() => {
    if (gameState.isGameOver) sounds.gameEnd();
  }, [gameState.isGameOver]);

  if (!gameState.isGameOver) return null;

  let icon = '🏆';
  let title = '';
  let subtitle = '';
  let color = 'var(--accent)';

  if (gameState.isCheckmate) {
    icon = gameState.winner === 'white' ? '♔' : '♚';
    title = 'Checkmate';
    subtitle = `${gameState.winner === 'white' ? 'White' : 'Black'} wins`;
    color = 'var(--success)';
  } else if (gameState.isDraw) {
    icon = '🤝';
    title = 'Draw';
    subtitle = gameState.drawReason?.replace(/_/g, ' ') || 'Game drawn';
    color = 'var(--warning)';
  } else if (gameState.winner) {
    icon = '🏳️';
    title = 'Resigned';
    subtitle = `${gameState.winner === 'white' ? 'White' : 'Black'} wins`;
    color = 'var(--error)';
  }

  return (
    <div className="overlay animate-fade-in" style={{ position: 'absolute', borderRadius: 'var(--radius)' }}>
      <div className="modal animate-fade-in-scale" style={{ boxShadow: `0 0 60px ${color}30, var(--shadow-xl)` }}>
        <div className="modal-body">
          <div className="modal-icon">{icon}</div>
          <div className="modal-title" style={{ color }}>{title}</div>
          <div className="modal-subtitle">{subtitle}</div>
          <div className="modal-actions">
            <button
              onClick={() => { sounds.gameStart(); newGame(gameConfig); }}
              className="btn btn-lg w-full"
              style={{ background: color, color: '#000' }}
            >
              Play Again
            </button>
            <button onClick={() => setView('home')} className="btn btn-secondary w-full">
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

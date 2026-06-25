import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Difficulty, GameMode, PieceColor } from '../engine/types';
import { sounds } from '../utils/sounds';
import ChessPiece from './pieces/ChessPieces';

export default function HomeView() {
  const { newGame, setView } = useGameStore();
  const [mode, setMode] = useState<GameMode>('hva');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');

  const handlePlay = () => {
    sounds.gameStart();
    newGame({ mode, difficulty, playerColor });
  };

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Hero */}
        <div className="home-hero">
          <div className="home-logo">
            <span>IC</span>
          </div>
          <h1 className="home-title">Indo Chess</h1>
          <p className="home-subtitle">Premium Chess Experience</p>
        </div>

        {/* Main Card */}
        <div className="home-card">
          <div className="home-card-header">
            <h2>New Game</h2>
            <p>Configure your match</p>
          </div>

          <div className="home-card-body space-y-6">
            {/* Game Mode */}
            <div>
              <label className="field-label">Game Mode</label>
              <div className="option-grid option-grid-3">
                {[
                  { value: 'hvh' as GameMode, label: 'Local', icon: '👥', desc: '2 Players' },
                  { value: 'hva' as GameMode, label: 'vs AI', icon: '🤖', desc: 'Computer' },
                  { value: 'ava' as GameMode, label: 'Watch', icon: '👁️', desc: 'AI vs AI' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`option-btn ${mode === opt.value ? 'option-btn-active' : ''}`}
                  >
                    <div className="option-icon">{opt.icon}</div>
                    <div className="option-label">{opt.label}</div>
                    <div className="option-desc">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            {(mode === 'hva' || mode === 'ava') && (
              <div>
                <label className="field-label">Difficulty</label>
                <div className="option-grid option-grid-2">
                  {[
                    { value: 'beginner' as Difficulty, label: 'Beginner', elo: '~800' },
                    { value: 'intermediate' as Difficulty, label: 'Intermediate', elo: '~1200' },
                    { value: 'advanced' as Difficulty, label: 'Advanced', elo: '~1600' },
                    { value: 'master' as Difficulty, label: 'Master', elo: '~2000' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDifficulty(opt.value)}
                      className={`option-btn ${difficulty === opt.value ? 'option-btn-active' : ''}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="option-label">{opt.label}</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{opt.elo}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {mode === 'hva' && (
              <div>
                <label className="field-label">Play as</label>
                <div className="option-grid option-grid-2">
                  {(['white', 'black'] as PieceColor[]).map(color => (
                    <button
                      key={color}
                      onClick={() => setPlayerColor(color)}
                      className={`option-btn ${playerColor === color ? 'option-btn-active' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10">
                          <ChessPiece type="king" color={color} className="w-full h-full" />
                        </div>
                        <div className="text-left">
                          <div className="option-label capitalize">{color}</div>
                          <div className="option-desc">{color === 'white' ? 'Move first' : 'Move second'}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Play Button */}
            <button onClick={handlePlay} className="play-btn">
              Play
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            onClick={() => { sounds.gameStart(); newGame({ mode: 'hva', difficulty: 'beginner', playerColor: 'white' }); }}
            className="quick-action"
          >
            <div className="quick-action-icon">⚡</div>
            <div className="quick-action-label">Quick Play</div>
          </button>
          <button onClick={() => setView('analysis')} className="quick-action">
            <div className="quick-action-icon">🔬</div>
            <div className="quick-action-label">Analyze</div>
          </button>
          <button onClick={() => setView('settings')} className="quick-action">
            <div className="quick-action-icon">⚙️</div>
            <div className="quick-action-label">Settings</div>
          </button>
        </div>
      </div>
    </div>
  );
}

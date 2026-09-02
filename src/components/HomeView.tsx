import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Difficulty, GameMode, PieceColor, TimeControl } from '../engine/types';
import { sounds } from '../utils/sounds';
import ChessPiece from './pieces/ChessPieces';
import { logoDataUrl } from '../assets/logoBase64';

const TIME_PRESETS: { label: string; tc: TimeControl | null }[] = [
  { label: '∞', tc: null },
  { label: '1+0', tc: { initial: 60, increment: 0 } },
  { label: '3+0', tc: { initial: 180, increment: 0 } },
  { label: '5+0', tc: { initial: 300, increment: 0 } },
  { label: '10+0', tc: { initial: 600, increment: 0 } },
  { label: '15+5', tc: { initial: 900, increment: 5 } },
];

/* ── Inline SVG icons (24px, stroke-based, single consistent set) ── */
const Icon = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  cpu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  analysis: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M7 14l4-4 4 3 5-6"/>
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
};

export default function HomeView() {
  const { newGame, setView, playerName, setPlayerName } = useGameStore();
  const [mode, setMode] = useState<GameMode>('hva');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [timePreset, setTimePreset] = useState(0); // index into TIME_PRESETS

  const diffs: { value: Difficulty; label: string; elo: string }[] = [
    { value: 'beginner',     label: 'Beginner', elo: '~800'  },
    { value: 'intermediate', label: 'Medium',   elo: '~1200' },
    { value: 'advanced',     label: 'Advanced', elo: '~1600' },
    { value: 'master',       label: 'Master',   elo: '~2000' },
  ];

  const handlePlay = () => {
    sounds.gameStart();
    const tc = TIME_PRESETS[timePreset].tc;
    newGame({ mode, difficulty, playerColor, timeControl: tc ?? undefined });
  };

  return (
    <div className="home-container">
      <div className="home-content stagger">

        {/* Hero */}
        <div className="home-hero">
          <div className="home-logo-wrap">
            <img src={logoDataUrl} alt="MindMove Chess" className="home-logo-img" />
          </div>
          <h1 className="home-title">MIND<span className="home-title-accent">MOVE</span></h1>
          <p className="home-subtitle">Think · Strategize · Win</p>
        </div>

        {/* Main Card */}
        <div className="home-card">
          <div className="home-card-header">
            <h2>New Game</h2>
            <p>Configure your match</p>
          </div>

          <div className="home-card-body" style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Name */}
            <div>
              <label className="field-label">Your name</label>
              <input
                className="input"
                placeholder="Enter your name…"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={22}
              />
            </div>

            {/* Game Mode */}
            <div>
              <label className="field-label">Game Mode</label>
              <div className="option-grid option-grid-3">
                {[
                  { value: 'hvh' as GameMode, label: 'Local', icon: Icon.users, desc: '2 Players' },
                  { value: 'hva' as GameMode, label: 'vs AI',  icon: Icon.cpu,   desc: 'Computer'  },
                  { value: 'ava' as GameMode, label: 'Watch', icon: Icon.eye,   desc: 'AI vs AI'  },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setMode(opt.value)}
                    className={`option-btn ${mode === opt.value ? 'option-btn-active' : ''}`}>
                    <div className="option-icon">{opt.icon}</div>
                    <div className="option-label">{opt.label}</div>
                    <div className="option-desc">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty pills */}
            {(mode === 'hva' || mode === 'ava') && (
              <div>
                <label className="field-label">
                  Difficulty
                  <span style={{ marginLeft:8, color:'var(--accent-hover)', fontWeight:700 }}>
                    {diffs.find(d => d.value === difficulty)?.elo} ELO
                  </span>
                </label>
                <div className="diff-row">
                  {diffs.map(d => (
                    <button key={d.value}
                      className={`diff-pill ${difficulty === d.value ? 'diff-pill-active' : ''}`}
                      onClick={() => setDifficulty(d.value)}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time control */}
            <div>
              <label className="field-label">Time Control</label>
              <div className="diff-row" style={{ flexWrap:'wrap' }}>
                {TIME_PRESETS.map((p, i) => (
                  <button key={i}
                    className={`diff-pill ${timePreset === i ? 'diff-pill-active' : ''}`}
                    style={{ minWidth:44 }}
                    onClick={() => setTimePreset(i)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            {mode === 'hva' && (
              <div>
                <label className="field-label">Play as</label>
                <div className="option-grid option-grid-2">
                  {(['white', 'black'] as PieceColor[]).map(color => (
                    <button key={color} onClick={() => setPlayerColor(color)}
                      className={`option-btn ${playerColor === color ? 'option-btn-active' : ''}`}>
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

            <button onClick={handlePlay} className="play-btn">
              Play
              <span className="play-btn-icon">{Icon.arrow}</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button onClick={() => { sounds.gameStart(); newGame({ mode:'hva', difficulty:'beginner', playerColor:'white' }); }} className="quick-action">
            <div className="quick-action-icon">{Icon.bolt}</div>
            <div className="quick-action-label">Quick Play</div>
          </button>
          <button onClick={() => setView('analysis')} className="quick-action">
            <div className="quick-action-icon">{Icon.analysis}</div>
            <div className="quick-action-label">Analyze</div>
          </button>
          <button onClick={() => setView('settings')} className="quick-action">
            <div className="quick-action-icon">{Icon.gear}</div>
            <div className="quick-action-label">Settings</div>
          </button>
        </div>

      </div>
    </div>
  );
}

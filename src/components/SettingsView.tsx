import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { sounds } from '../utils/sounds';

export default function SettingsView() {
  const { showCoordinates, toggleCoordinates, boardFlipped, flipBoard } = useGameStore();
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  const handleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.toggle(next);
    if (next) sounds.move();
  };

  return (
    <div className="home-container">
      <div className="home-content" style={{ maxWidth: 480 }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Customize your experience</p>
        </div>

        {/* Board Settings */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>Board</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            <SettingRow
              label="Show Coordinates"
              desc="Display rank and file labels"
              checked={showCoordinates}
              onChange={toggleCoordinates}
            />
            <SettingRow
              label="Flip Board"
              desc="View from black's perspective"
              checked={boardFlipped}
              onChange={flipBoard}
            />
          </div>
        </div>

        {/* Sound Settings */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>Sound</h3>
          </div>
          <div>
            <SettingRow
              label="Sound Effects"
              desc="Move, capture, and game sounds"
              checked={soundEnabled}
              onChange={handleSound}
            />
          </div>
        </div>

        {/* Shortcuts */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>Keyboard Shortcuts</h3>
          </div>
          <div className="card-body space-y-3">
            <Shortcut keys={['←', '→']} action="Navigate moves" />
            <Shortcut keys={['↑', '↓']} action="Jump to start/end" />
            <Shortcut keys={['F']} action="Flip board" />
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="card-header">
            <h3>About</h3>
          </div>
          <div className="card-body">
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              Indo Chess features a FIDE-compliant engine with minimax search, alpha-beta pruning, 
              transposition tables, and advanced positional evaluation.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)' }}>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Engine</div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Indo AI v1.0</div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)' }}>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Search</div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>α-β + TT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, desc, checked, onChange }: { 
  label: string; desc: string; checked: boolean; onChange: () => void 
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
      </div>
      <button
        onClick={onChange}
        className="relative w-12 h-7 rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--accent)' : 'var(--elevated)' }}
      >
        <span
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200"
          style={{ left: checked ? '26px' : '4px' }}
        />
      </button>
    </div>
  );
}

function Shortcut({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{action}</span>
      <div className="flex gap-1">
        {keys.map((k, i) => (
          <kbd 
            key={i} 
            className="px-2 py-1 rounded text-[10px] font-mono"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

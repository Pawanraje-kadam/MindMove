import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function ToolsPanel() {
  const { exportFEN, exportGamePGN, importFEN, importPGN, flipBoard, toggleCoordinates } = useGameStore();
  const [tab, setTab] = useState<'quick' | 'import'>('quick');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState('');

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const load = () => {
    if (!input.trim()) return;
    if (input.includes('[') || input.includes('1.')) {
      importPGN(input);
    } else {
      importFEN(input);
    }
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { key: 'quick', label: 'Quick' },
          { key: 'import', label: 'Import' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className="flex-1 py-3 text-xs font-bold uppercase tracking-wide relative transition-colors"
            style={{ color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {t.label}
            {tab === t.key && (
              <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {tab === 'quick' && (
          <div className="grid grid-cols-2 gap-2">
            <ToolBtn icon="📋" label="Copy FEN" onClick={() => copy(exportFEN(), 'FEN')} />
            <ToolBtn icon="📄" label="Copy PGN" onClick={() => copy(exportGamePGN(), 'PGN')} />
            <ToolBtn icon="🔄" label="Flip Board" onClick={flipBoard} />
            <ToolBtn icon="🔢" label="Coords" onClick={toggleCoordinates} />
          </div>
        )}

        {tab === 'import' && (
          <div className="space-y-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste FEN or PGN..."
              className="input textarea text-xs font-mono"
              style={{ minHeight: 60 }}
            />
            <button onClick={load} disabled={!input.trim()} className="btn btn-primary btn-sm w-full">
              Load Position
            </button>
          </div>
        )}
      </div>

      {copied && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold animate-fade-in"
          style={{ background: 'var(--accent)', color: '#000', zIndex: 100 }}
        >
          ✓ {copied} copied
        </div>
      )}
    </div>
  );
}

function ToolBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105"
      style={{ background: 'var(--bg)', border: '1px solid var(--border-subtle)' }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </button>
  );
}

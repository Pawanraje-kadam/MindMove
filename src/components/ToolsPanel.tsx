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
            <ToolBtn icon={ToolIcons.clipboard} label="Copy FEN" onClick={() => copy(exportFEN(), 'FEN')} />
            <ToolBtn icon={ToolIcons.doc} label="Copy PGN" onClick={() => copy(exportGamePGN(), 'PGN')} />
            <ToolBtn icon={ToolIcons.flip} label="Flip Board" onClick={flipBoard} />
            <ToolBtn icon={ToolIcons.grid} label="Coords" onClick={toggleCoordinates} />
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
          style={{ background: 'var(--accent-fill)', color: '#fff', zIndex: 100 }}
        >
          ✓ {copied} copied
        </div>
      )}
    </div>
  );
}

const ToolIcons: Record<string, React.ReactNode> = {
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>
    </svg>
  ),
  flip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M16 3h5v5"/><path d="M21 3l-7.5 7.5"/><path d="M8 21H3v-5"/><path d="M3 21l7.5-7.5"/>
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  ),
};

function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
      style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid var(--border-subtle)', color: 'var(--accent-hover)' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(61,156,245,0.35)';
        e.currentTarget.style.background = 'rgba(61,156,245,0.07)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.background = 'rgba(0,0,0,0.22)';
      }}
    >
      {icon}
      <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </button>
  );
}

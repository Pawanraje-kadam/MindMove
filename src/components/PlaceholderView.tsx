import { useGameStore } from '../store/gameStore';
import { sounds } from '../utils/sounds';

interface Props {
  title: string;
  description: string;
  icon: string;
}

export default function PlaceholderView({ title, description, icon }: Props) {
  const { setView, newGame } = useGameStore();

  return (
    <div className="home-container">
      <div className="text-center max-w-sm">
        {/* Icon with glow */}
        <div className="relative inline-block mb-6">
          <span className="text-6xl block relative z-10">{icon}</span>
          <div 
            className="absolute inset-0 rounded-full scale-150 blur-3xl opacity-20"
            style={{ background: 'var(--accent)' }}
          />
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{description}</p>

        {/* Coming Soon Badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-glow)' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Coming Soon</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => { sounds.gameStart(); newGame({ mode: 'hva', difficulty: 'intermediate', playerColor: 'white' }); }}
            className="btn btn-primary btn-lg w-full"
          >
            Play Chess Now
          </button>
          <button onClick={() => setView('home')} className="btn btn-secondary w-full">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

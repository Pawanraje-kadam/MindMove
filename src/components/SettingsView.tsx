import { useGameStore } from '../store/gameStore';

export default function SettingsView() {
  const { showCoordinates, toggleCoordinates, setView } = useGameStore();

  const themes = [
    { id: 'classic', name: 'Classic' },
    { id: 'wood', name: 'Wood' },
    { id: 'ocean', name: 'Ocean' },
    { id: 'midnight', name: 'Midnight' },
  ];

  const pieceSets = ['staunton', 'alpha', 'merida'];

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Board Theme */}
        <div>
          <h3 className="font-semibold mb-3 text-sm tracking-widest text-white/60">BOARD THEME</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  document.documentElement.setAttribute('data-board-theme', theme.id);
                }}
                className="p-4 rounded-2xl bg-[#111827] border border-white/10 hover:border-[#3d9cf5] transition"
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* Piece Set */}
        <div>
          <h3 className="font-semibold mb-3 text-sm tracking-widest text-white/60">PIECE SET</h3>
          <div className="flex gap-3">
            {pieceSets.map((set, index) => (
              <button key={index} className="px-5 py-3 rounded-xl bg-[#111827] border border-white/10 hover:border-[#3d9cf5]">
                {set}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#111827] p-4 rounded-2xl">
          <span>Show Coordinates</span>
          <button onClick={toggleCoordinates} className="btn btn-secondary">
            {showCoordinates ? 'On' : 'Off'}
          </button>
        </div>

        <button onClick={() => setView('home')} className="mt-6 text-sm text-white/60 hover:text-white">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

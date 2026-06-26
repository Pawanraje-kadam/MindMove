import { useGameStore } from '../store/gameStore';
import EvalBar from './EvalBar';
import MoveList from './MoveList';

export default function AnalysisView() {
  const { evaluation, gameState, setView } = useGameStore();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Analysis</h2>
        <button onClick={() => setView('home')} className="text-sm text-[#3d9cf5]">Back</button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mb-4">
            <div className="text-xs text-white/50 mb-1">EVALUATION</div>
            <div className="eval-bar-enhanced">
              <div 
                className="eval-fill" 
                style={{ width: `${Math.max(5, Math.min(95, 50 + evaluation * 8))}%` }}
              />
            </div>
          </div>
          <MoveList />
        </div>
      </div>
    </div>
  );
}

import { useGameStore } from '../store/gameStore';

export default function EvalBar() {
  const { evaluation, boardFlipped, gameState } = useGameStore();

  const isMate = gameState.isCheckmate;
  const mateFor = isMate ? gameState.winner : null;

  const clampedEval = Math.max(-10, Math.min(10, evaluation));
  let whitePercent = 50 + (clampedEval / 10) * 50;
  if (isMate) whitePercent = mateFor === 'white' ? 100 : 0;

  const getDisplay = () => {
    if (isMate) return mateFor === 'white' ? '1-0' : '0-1';
    if (Math.abs(evaluation) >= 10) return 'M';
    return Math.abs(evaluation).toFixed(1);
  };

  const advantage = evaluation > 0.1 ? 'white' : evaluation < -0.1 ? 'black' : 'equal';
  const topPercent = boardFlipped ? whitePercent : (100 - whitePercent);

  return (
    <div className="eval-bar" style={{ height: '100%' }}>
      <div 
        className="eval-black relative"
        style={{ height: `${topPercent}%` }}
      >
        {((boardFlipped && advantage === 'white') || (!boardFlipped && advantage === 'black')) && (
          <span className="eval-label" style={{ bottom: 4, color: boardFlipped ? '#333' : '#aaa' }}>
            {getDisplay()}
          </span>
        )}
      </div>
      <div className="eval-white relative">
        {((boardFlipped && advantage === 'black') || (!boardFlipped && advantage === 'white')) && (
          <span className="eval-label" style={{ top: 4, color: boardFlipped ? '#aaa' : '#333' }}>
            {getDisplay()}
          </span>
        )}
        {advantage === 'equal' && (
          <span className="eval-label" style={{ top: 4, color: '#888' }}>=</span>
        )}
      </div>
    </div>
  );
}

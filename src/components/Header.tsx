import { useGameStore } from '../store/gameStore';

export default function Header() {
  const { view, gameState, gameConfig, isThinking } = useGameStore();

  const getStatusContent = () => {
    if (view !== 'play') return null;
    
    if (gameState.isGameOver) {
      if (gameState.isCheckmate) {
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(124,179,66,0.15)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              Checkmate • {gameState.winner === 'white' ? 'White' : 'Black'} wins
            </span>
          </div>
        );
      }
      if (gameState.isDraw) {
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,167,38,0.15)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>Draw</span>
          </div>
        );
      }
    }
    
    if (isThinking) {
      return (
        <div className="thinking-indicator">
          <span>Thinking</span>
          <div className="thinking-dots">
            <div className="thinking-dot" />
            <div className="thinking-dot" />
            <div className="thinking-dot" />
          </div>
        </div>
      );
    }
    
    if (gameConfig.mode === 'hva' && gameState.turn === gameConfig.playerColor) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--elevated)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Your turn</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center gap-3">
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7cb342 0%, #558b2f 100%)' }}
        >
          <span className="text-white font-black text-xs">IC</span>
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Indo Chess</span>
      </div>

      {/* Desktop Title */}
      <div className="hidden lg:flex items-center gap-4">
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>Indo Chess</span>
        {view === 'play' && (
          <span 
            className="text-xs font-medium px-2.5 py-1 rounded-md"
            style={{ background: 'var(--elevated)', color: 'var(--text-muted)' }}
          >
            {gameConfig.mode === 'hvh' ? 'Local Game' : 
             gameConfig.mode === 'hva' ? `vs AI • ${gameConfig.difficulty}` : 
             'AI vs AI'}
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* Status */}
      {getStatusContent()}
    </>
  );
}

import { useGameStore } from '../store/gameStore';
import { logoDataUrl } from '../assets/logoBase64';

export default function Header() {
  const { view, gameState, gameConfig, isThinking } = useGameStore();

  return (
    <>
      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:34, height:34, borderRadius:10, flexShrink:0, overflow:'hidden',
          border:'1px solid rgba(61,156,245,0.22)',
          boxShadow:'0 0 14px rgba(61,156,245,0.14)',
        }}>
          <img src={logoDataUrl} alt="MindMove" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:'-0.01em', lineHeight:1.2, color:'var(--text)' }}>
            MIND<span style={{ color:'var(--accent)' }}>MOVE</span>
          </div>
          {view === 'play' && (
            <div style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.2 }}>
              {gameConfig.mode==='hvh' ? '2 Players' :
               gameConfig.mode==='hva' ? `vs AI · ${gameConfig.difficulty}` : 'AI vs AI'}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex:1 }} />

      {/* Status */}
      {view === 'play' && (() => {
        if (gameState.isGameOver) {
          if (gameState.isCheckmate) return (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'rgba(74,222,128,0.12)' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--success)' }}>
                ♔ {gameState.winner==='white'?'White':'Black'} wins
              </span>
            </div>
          );
          if (gameState.isDraw) return (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'rgba(251,146,60,0.12)' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--warning)' }}>Draw</span>
            </div>
          );
        }
        if (isThinking) return (
          <div className="thinking-indicator">
            <span>Thinking</span>
            <div className="thinking-dots">
              <div className="thinking-dot"/><div className="thinking-dot"/><div className="thinking-dot"/>
            </div>
          </div>
        );
        if (gameConfig.mode==='hva' && gameState.turn===gameConfig.playerColor && !gameState.isGameOver) return (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'var(--accent-subtle)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'pulseDot 2s infinite' }}/>
            <span style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)' }}>Your turn</span>
          </div>
        );
        return null;
      })()}
    </>
  );
}

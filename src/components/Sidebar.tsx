import { useGameStore } from '../store/gameStore';
import { AppView } from '../engine/types';
import { logoDataUrl } from '../assets/logoBase64';

const navItems: { view: AppView; label: string; icon: React.ReactNode }[] = [
  { view:'home',     label:'Home',     icon:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg> },
  { view:'play',     label:'Play',     icon:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> },
  { view:'analysis', label:'Analyze',  icon:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg> },
  { view:'puzzles',  label:'Puzzles',  icon:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/></svg> },
  { view:'learn',       label:'Learn',       icon:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/></svg> },
  { view:'realm-chess', label:'Realm Chess', icon:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg> },
  { view:'settings',    label:'Settings',    icon:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg> },
];

export default function Sidebar() {
  const { view, setView } = useGameStore();
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'14px 0' }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:26 }}>
        <div style={{
          width:46, height:46, borderRadius:14, overflow:'hidden',
          border:'1px solid rgba(61,156,245,0.28)',
          boxShadow:'0 0 18px rgba(61,156,245,0.22), 0 4px 12px rgba(0,0,0,0.4)',
          transition:'transform 300ms var(--ease-bounce), box-shadow 300ms var(--ease)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(61,156,245,0.4), 0 6px 16px rgba(0,0,0,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 18px rgba(61,156,245,0.22), 0 4px 12px rgba(0,0,0,0.4)'; }}
        >
          <img src={logoDataUrl} alt="MM" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        </div>
      </div>
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:4, padding:'0 8px' }}>
        {navItems.map(({ view:v, label, icon }) => {
          const active = view === v;
          return (
            <button key={v} onClick={() => setView(v)} title={label}
              className={`side-nav-item ${active ? 'side-nav-item-active' : ''}`}>
              {active && <div className="side-nav-active-bar" />}
              <div className="side-nav-icon">{icon}</div>
              <span className="side-nav-label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

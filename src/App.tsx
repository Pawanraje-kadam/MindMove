import { useGameStore } from './store/gameStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import HomeView from './components/HomeView';
import GameView from './components/GameView';
import AnalysisView from './components/AnalysisView';
import SettingsView from './components/SettingsView';
import PuzzlesView from './components/PuzzlesView';
import LearnView from './components/learn/LearnView';
import PlaceholderView from './components/PlaceholderView';
import RealmChessView from './components/realm-chess/RealmChessView';

export default function App() {
  useKeyboardShortcuts();
  const { view } = useGameStore();

  const renderContent = () => {
    switch (view) {
      case 'home': return <HomeView />;
      case 'play': return <GameView />;
      case 'analysis': return <AnalysisView />;
      case 'settings': return <SettingsView />;
      case 'puzzles': return <PuzzlesView />;
      case 'learn': return <LearnView />;
      case 'realm-chess': return <RealmChessView />;
      case 'leaderboard': return <PlaceholderView title="Leaderboard" description="Rankings coming soon" icon="🏆" />;
      default: return <HomeView />;
    }
  };

  return (
    <>
      {/* Ambient background scene — orbs, glow, grain */}
      <div className="app-bg" aria-hidden="true">
        <div className="app-bg-orb app-bg-orb-a" />
        <div className="app-bg-orb app-bg-orb-b" />
        <div className="app-bg-grain" />
      </div>

      <div className="app">
        <aside className="app-sidebar">
          <Sidebar />
        </aside>
        <div className="app-main">
          <header className="app-header">
            <Header />
          </header>
          <main className="app-content">
            <div key={view} className="view-enter">
              {renderContent()}
            </div>
          </main>
          <nav className="app-mobile-nav safe-area-bottom">
            <MobileNav />
          </nav>
        </div>
      </div>
    </>
  );
}

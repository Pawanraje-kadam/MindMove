import { useGameStore } from './store/gameStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import HomeView from './components/HomeView';
import GameView from './components/GameView';
import AnalysisView from './components/AnalysisView';
import SettingsView from './components/SettingsView';
import PlaceholderView from './components/PlaceholderView';

export default function App() {
  useKeyboardShortcuts();
  const { view } = useGameStore();

  const renderContent = () => {
    switch (view) {
      case 'home': return <HomeView />;
      case 'play': return <GameView />;
      case 'analysis': return <AnalysisView />;
      case 'settings': return <SettingsView />;
      case 'puzzles': return <PlaceholderView title="Puzzles" description="Tactical training coming soon" icon="🧩" />;
      case 'learn': return <PlaceholderView title="Learn" description="Interactive lessons coming soon" icon="📚" />;
      case 'leaderboard': return <PlaceholderView title="Leaderboard" description="Rankings coming soon" icon="🏆" />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="app">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>
      <div className="app-main">
        <header className="app-header">
          <Header />
        </header>
        <main className="app-content">
          {renderContent()}
        </main>
        <nav className="app-mobile-nav">
          <MobileNav />
        </nav>
      </div>
    </div>
  );
}

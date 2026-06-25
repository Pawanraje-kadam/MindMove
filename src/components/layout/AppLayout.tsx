import { ReactNode } from 'react';

interface AppLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  content: ReactNode;
  mobileNav: ReactNode;
}

/**
 * Main application layout shell
 * Provides consistent structure across all views
 */
export default function AppLayout({ sidebar, header, content, mobileNav }: AppLayoutProps) {
  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <aside className="app-sidebar">
        {sidebar}
      </aside>
      
      {/* Main Area */}
      <div className="app-main">
        <header className="app-header">
          {header}
        </header>
        
        <main className="app-content">
          {content}
        </main>
        
        <nav className="app-mobile-nav safe-area-bottom">
          {mobileNav}
        </nav>
      </div>
    </div>
  );
}

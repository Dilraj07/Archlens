import React, { useEffect, useRef } from 'react';
import { useArchStore } from './store/useArchStore';
import { TopNav } from './components/navigation/TopNav';
import { LandingPage } from './pages/LandingPage';
import { LearnSystemDesign } from './features/learn/LearnSystemDesign';
import { ArchitectureExplorer } from './features/architectures/ArchitectureExplorer';
import { ChallengePlayer } from './features/challenges/ChallengePlayer';
import { DesignStudio } from './features/studio/DesignStudio';
import { MasteryDashboard } from './features/mastery/MasteryDashboard';

export const App: React.FC = () => {
  const view = useArchStore((s) => s.view);
  const setView = useArchStore((s) => s.setView);
  const learnTab = useArchStore((s) => s.learnTab);
  const setLearnTab = useArchStore((s) => s.setLearnTab);

  const isPopstateRef = useRef(false);

  // Sync state on popstate (browser back/forward button) and initial load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      isPopstateRef.current = true;

      if (hash.startsWith('#learn/catalog')) {
        setView('learn');
        setLearnTab('catalog');
      } else if (hash.startsWith('#learn')) {
        setView('learn');
        setLearnTab('concepts');
      } else if (hash.startsWith('#architectures')) {
        setView('architectures');
      } else if (hash.startsWith('#challenges')) {
        setView('challenges');
      } else if (hash.startsWith('#studio')) {
        setView('studio');
      } else if (hash.startsWith('#mastery')) {
        setView('mastery');
      } else {
        setView('landing');
      }

      setTimeout(() => {
        isPopstateRef.current = false;
      }, 0);
    };

    // If loaded with a specific hash, parse it
    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, [setView, setLearnTab]);

  // Sync state changes to URL hash and browser history
  useEffect(() => {
    if (isPopstateRef.current) return;

    let targetHash = '';
    if (view === 'learn') {
      targetHash = learnTab === 'catalog' ? '#learn/catalog' : '#learn';
    } else if (view === 'landing') {
      targetHash = '';
    } else {
      targetHash = `#${view}`;
    }

    const currentHash = window.location.hash;
    const normalizedTarget = targetHash ? targetHash : '';
    const normalizedCurrent = currentHash ? currentHash : '';

    if (normalizedCurrent !== normalizedTarget) {
      window.history.pushState(
        { view, learnTab },
        '',
        targetHash || window.location.pathname + window.location.search
      );
    }
  }, [view, learnTab]);

  return (
    <div className="min-h-screen bg-[#131313] text-white flex flex-col font-sans">
      <TopNav />

      <main className="flex-1 flex flex-col relative overflow-hidden h-[calc(100vh-61px)]">
        {view === 'landing' && (
          <div className="flex-1 overflow-y-auto">
            <LandingPage />
          </div>
        )}

        {view === 'learn' && <LearnSystemDesign />}

        {view === 'architectures' && <ArchitectureExplorer />}

        {(view === 'challenges' || view === 'mission_player' || view === 'incident_player' || view === 'daily_incident') && (
          <ChallengePlayer />
        )}

        {view === 'studio' && <DesignStudio />}

        {view === 'mastery' && (
          <div className="flex-1 overflow-y-auto">
            <MasteryDashboard />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

import React from 'react';
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

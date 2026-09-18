import React from 'react';
import { useArchStore } from './store/useArchStore';
import { TopNav } from './components/navigation/TopNav';
import { LandingPage } from './pages/LandingPage';
import { ArchCanvas } from './features/canvas/ArchCanvas';
import { MissionPlayer } from './features/mission/MissionPlayer';
import { IncidentPlayer } from './features/incident/IncidentPlayer';
import { GlassBoxPanel } from './features/glassbox/GlassBoxPanel';
import { MasteryDashboard } from './features/mastery/MasteryDashboard';

export const App: React.FC = () => {
  const view = useArchStore((s) => s.view);
  const selectedNodeId = useArchStore((s) => s.selectedNodeId);

  return (
    <div className="min-h-screen bg-[#131313] text-white flex flex-col font-sans">
      <TopNav />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {view === 'landing' && (
          <div className="flex-1 overflow-y-auto">
            <LandingPage />
          </div>
        )}

        {view === 'mastery' && (
          <div className="flex-1 overflow-y-auto">
            <MasteryDashboard />
          </div>
        )}

        {(view === 'mission_player' || view === 'incident_player' || view === 'daily_incident') && (
          <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-65px)] overflow-hidden">
            {/* Left/Center Canvas View */}
            <div className="flex-1 h-full relative">
              <ArchCanvas />
            </div>

            {/* Middle Glass Box Panel (Docked when node is selected) */}
            {selectedNodeId && <GlassBoxPanel />}

            {/* Right Sidebar: Mission or Incident Workflow */}
            {view === 'mission_player' && <MissionPlayer />}
            {(view === 'incident_player' || view === 'daily_incident') && <IncidentPlayer />}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

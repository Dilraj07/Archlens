import React from 'react';
import { useArchStore } from '../../store/useArchStore';
import { VergeButton } from '../ui/VergePrimitives';
import { Flame, ShieldAlert } from 'lucide-react';

export const TopNav: React.FC = () => {
  const view = useArchStore((s) => s.view);
  const setView = useArchStore((s) => s.setView);
  const startMission = useArchStore((s) => s.startMission);
  const startIncident = useArchStore((s) => s.startIncident);
  const reviewLog = useArchStore((s) => s.reviewLog);

  return (
    <header className="w-full bg-[#131313] border-b border-[#313131] px-4 md:px-8 py-3.5 flex items-center justify-between select-none z-50 sticky top-0">
      {/* Brand Wordmark */}
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('landing')}>
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-wider text-white hover:text-[#3cffd0] transition-colors leading-none">
          ARCHLENS
        </h1>
        <div className="hidden lg:block border-l border-[#313131] pl-3 py-0.5">
          <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano block font-bold">
            Adaptive System Design Tutor
          </span>
          <span className="text-[9px] font-mono text-[#949494] block">
            CodeMyFYP 2026 · Challenge 01
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => startMission('g1-tatkal-10am')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-verge-mono transition-colors rounded-12px ${
            view === 'mission_player'
              ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
              : 'text-[#e9e9e9] hover:text-white'
          }`}
        >
          Guided Missions
        </button>

        <button
          onClick={() => startIncident('i1-tatkal-down')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-verge-mono transition-colors rounded-12px flex items-center gap-1.5 ${
            view === 'incident_player'
              ? 'bg-[#5200ff]/20 text-[#5200ff] border border-[#5200ff] font-bold'
              : 'text-[#e9e9e9] hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#ff3366]" />
          <span>Incident Mode</span>
        </button>

        <button
          onClick={() => setView('mastery')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-verge-mono transition-colors rounded-12px flex items-center gap-1.5 ${
            view === 'mastery'
              ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
              : 'text-[#e9e9e9] hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#3cffd0]" />
          <span>Mastery ({reviewLog.currentStreak}d)</span>
        </button>

        <VergeButton
          variant="primary"
          size="sm"
          onClick={() => startMission('g1-tatkal-10am')}
          className="hidden sm:inline-flex"
        >
          Play Tatkal at 10 AM
        </VergeButton>
      </nav>
    </header>
  );
};

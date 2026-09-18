import React from 'react';
import { useArchStore } from '../../store/useArchStore';
import {
  BookOpen,
  Layers,
  Target,
  Palette,
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const view = useArchStore((s) => s.view);
  const setView = useArchStore((s) => s.setView);
  const selectArchitecture = useArchStore((s) => s.selectArchitecture);
  const activeBlueprintId = useArchStore((s) => s.activeBlueprintId);

  return (
    <header className="w-full bg-[#131313] border-b border-[#313131] px-4 md:px-8 py-3.5 flex items-center justify-between select-none z-50 sticky top-0">
      {/* Brand Wordmark & Sub-brand */}
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('landing')}>
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-wider text-white hover:text-[#3cffd0] transition-colors leading-none">
          ARCHLENS
        </h1>
        <div className="hidden xl:block border-l border-[#313131] pl-3 py-0.5 whitespace-nowrap">
          <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano block font-bold whitespace-nowrap">
            Adaptive System Design Tutor
          </span>
          <span className="text-[9px] font-mono text-[#949494] block whitespace-nowrap">
            CodeMyFYP 2026 · Challenge 01
          </span>
        </div>
      </div>

      {/* Navigation Items: 4 Clear, Core Tabs */}
      <nav className="flex items-center gap-2 md:gap-3">
        {/* Tab 1: Learn */}
        <button
          onClick={() => setView('learn')}
          className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-verge-mono whitespace-nowrap transition-colors rounded-12px flex items-center gap-1.5 ${
            view === 'learn'
              ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
              : 'text-[#e9e9e9] hover:text-white hover:bg-[#202020]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Learn</span>
        </button>

        {/* Tab 2: Architectures */}
        <button
          onClick={() => {
            selectArchitecture(activeBlueprintId || 'simple-app');
          }}
          className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-verge-mono whitespace-nowrap transition-colors rounded-12px flex items-center gap-1.5 ${
            view === 'architectures'
              ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
              : 'text-[#e9e9e9] hover:text-white hover:bg-[#202020]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Architectures</span>
        </button>

        {/* Tab 3: Challenges */}
        <button
          onClick={() => setView('challenges')}
          className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-verge-mono whitespace-nowrap transition-colors rounded-12px flex items-center gap-1.5 ${
            view === 'challenges' || view === 'mission_player' || view === 'incident_player'
              ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
              : 'text-[#e9e9e9] hover:text-white hover:bg-[#202020]'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Challenges</span>
        </button>

        {/* Tab 4: Design Studio */}
        <button
          onClick={() => setView('studio')}
          className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-verge-mono whitespace-nowrap transition-colors rounded-12px flex items-center gap-1.5 ${
            view === 'studio'
              ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
              : 'text-[#e9e9e9] hover:text-white hover:bg-[#202020]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Design Studio</span>
        </button>
      </nav>
    </header>
  );
};

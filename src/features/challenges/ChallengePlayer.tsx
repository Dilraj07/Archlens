import React from 'react';
import { useArchStore } from '../../store/useArchStore';
import { ArchCanvas } from '../canvas/ArchCanvas';
import { MissionPlayer } from '../mission/MissionPlayer';
import { IncidentPlayer } from '../incident/IncidentPlayer';
import { BookOpen } from 'lucide-react';

const CHALLENGES_LIST = [
  {
    id: 'g1-tatkal-10am',
    type: 'mission',
    title: 'The 10 AM Tatkal Rush',
    difficulty: 'Intermediate',
    category: 'Concurrency & Locking',
    oneLiner: '10M users hit "Book" at 10:00 AM. Predict which component bottlenecks first.',
  },
  {
    id: 'g2-cricket-no-cdn',
    type: 'mission',
    title: 'The Cricket Final Over',
    difficulty: 'Beginner',
    category: 'Edge Caching',
    oneLiner: 'CDN cache-miss storm during the final over. Predict the downstream collapse.',
  },
  {
    id: 'g3-slow-analytics',
    type: 'mission',
    title: 'Decoupling Slow Analytics',
    difficulty: 'Intermediate',
    category: 'Async Queues',
    oneLiner: 'Slow analytics writes block customer checkout. Predict how Kafka decouples it.',
  },
  {
    id: 'i1-tatkal-down',
    type: 'incident',
    title: 'On-Call Incident: Tatkal Outage',
    difficulty: 'Advanced',
    category: 'Live Incident Debugging',
    oneLiner: 'A hidden failure degraded booking success rate. Use your inspection budget to diagnose.',
  },
];

export const ChallengePlayer: React.FC = () => {
  const activeMission = useArchStore((s) => s.activeMission);
  const activeIncident = useArchStore((s) => s.activeIncident);
  const startMission = useArchStore((s) => s.startMission);
  const startIncident = useArchStore((s) => s.startIncident);

  const activeChallengeId = activeMission ? activeMission.id : activeIncident ? activeIncident.id : null;

  const handleSelectChallenge = (item: typeof CHALLENGES_LIST[0]) => {
    if (item.type === 'mission') {
      startMission(item.id);
    } else {
      startIncident(item.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131313] text-white overflow-hidden">
      {/* Top Challenge Selection Bar */}
      <div className="bg-[#131313] border-b border-[#313131] px-6 py-3.5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] font-bold">
              Predict-Break-Fix Challenges
            </span>
            <h2 className="text-xl font-display font-black tracking-wider text-white">
              SYSTEM TASKS & ASSIGNMENTS
            </h2>
          </div>

          {/* Quick Challenge Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {CHALLENGES_LIST.map((c) => {
              const isSelected = activeChallengeId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectChallenge(c)}
                  className={`px-3 py-1.5 rounded-12px text-xs font-mono uppercase tracking-verge-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#2d2d2d] text-[#3cffd0] font-bold border border-[#3cffd0]/40'
                      : 'bg-[#181818] text-[#949494] hover:text-white border border-[#313131]'
                  }`}
                >
                  <span>{c.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Area: Canvas (Center) + Challenge Step Workflow (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Center: Interactive Topology Canvas */}
        <div className="flex-1 relative min-h-0">
          <ArchCanvas />
        </div>

        {/* Right: Step-by-Step Task Player Sidebar */}
        <div className="w-full lg:w-[400px] border-l border-[#313131] bg-[#181818] h-full flex flex-col overflow-y-auto shrink-0 z-10">
          {activeMission && <MissionPlayer />}
          {activeIncident && <IncidentPlayer />}
          {!activeMission && !activeIncident && (
            <div className="p-8 text-center my-auto space-y-4">
              <BookOpen className="w-10 h-10 text-[#3cffd0] mx-auto opacity-70" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] font-bold block mb-1">
                  Task Workflow
                </span>
                <h3 className="font-display font-black text-2xl text-white tracking-wider">
                  SELECT A SYSTEM TASK
                </h3>
              </div>
              <p className="text-xs text-[#949494] leading-relaxed max-w-xs mx-auto">
                Pick any assignment from the top bar. You will commit to a prediction, simulate the traffic surge, and learn how to fix the bottleneck!
              </p>
              <button
                onClick={() => handleSelectChallenge(CHALLENGES_LIST[0]!)}
                className="bg-[#3cffd0] hover:bg-white text-black font-mono uppercase tracking-verge-mono font-bold text-xs px-6 py-2.5 rounded-24px transition-all inline-flex items-center gap-1.5"
              >
                Start First Challenge &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

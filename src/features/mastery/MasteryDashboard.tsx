import React from 'react';
import {
  Flame,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useArchStore } from '../../store/useArchStore';
import { VergeBadge, VergeButton } from '../../components/ui/VergePrimitives';
import { getDueConcepts } from '../../engine/scheduler';

export const MasteryDashboard: React.FC = () => {
  const reviewLog = useArchStore((s) => s.reviewLog);
  const startDailyIncident = useArchStore((s) => s.startDailyIncident);

  const dueConcepts = getDueConcepts(reviewLog);
  const weakestConceptId = dueConcepts[0] || 'diagnosis';
  const weakestConcept = reviewLog.concepts[weakestConceptId];

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8 select-none">
      {/* Top Banner: Daily Incident & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Counter Card */}
        <div className="bg-[#3cffd0] text-black rounded-24px p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-verge-wide uppercase">
              Retention Loop
            </span>
            <Flame className="w-6 h-6 text-black fill-black" />
          </div>
          <div className="my-4">
            <div className="text-5xl font-black font-display tracking-tight">
              {reviewLog.currentStreak} DAY STREAK
            </div>
            <p className="text-xs font-medium mt-1">
              Active spaced practice powered by Leitner box scheduling.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold">
            LAST ACTIVE: {reviewLog.lastActiveDate}
          </span>
        </div>

        {/* Daily Incident Callout */}
        <div className="md:col-span-2 bg-[#181818] border border-[#313131] rounded-24px p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano">
                Today's Recommended Incident
              </span>
              <VergeBadge variant="verified">90 SECONDS</VergeBadge>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {weakestConcept ? weakestConcept.name : 'Root-Cause Incident Diagnosis'}
            </h3>
            <p className="text-xs text-[#949494] mt-2 leading-relaxed">
              Targeted review: your weakest retention area is currently{' '}
              <strong className="text-white">{weakestConcept?.name}</strong> (Box {weakestConcept?.box}, {weakestConcept?.masteryScore}% mastery).
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#313131]">
            <span className="text-xs font-mono text-[#949494]">
              Next review due: {weakestConcept?.nextReviewDue.split('T')[0]}
            </span>
            <VergeButton variant="primary" size="sm" onClick={startDailyIncident}>
              Launch Daily Incident <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </VergeButton>
          </div>
        </div>
      </div>

      {/* Concept Mastery Grid */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano block">
              Distributed Systems Competency
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Mastery Map (6 Concepts Tracked)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#949494]">
            Box 1 (1d) · Box 2 (3d) · Box 3 (7d) · Box 4 (14d Mastered)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(reviewLog.concepts).map((c) => {
            const isDue = dueConcepts.includes(c.conceptId);
            return (
              <div
                key={c.conceptId}
                className="bg-[#181818] border border-[#313131] hover:border-white rounded-20px p-5 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#949494] uppercase tracking-verge-nano">
                      Leitner Box {c.box}/4
                    </span>
                    {isDue && <VergeBadge variant="red">REVIEW DUE</VergeBadge>}
                  </div>
                  <h4 className="font-bold text-white text-base mb-2">{c.name}</h4>

                  {/* Progress bar */}
                  <div className="w-full bg-[#2d2d2d] h-2 rounded-full overflow-hidden my-3">
                    <div
                      className={`h-full transition-all duration-300 ${
                        c.masteryScore >= 70
                          ? 'bg-[#3cffd0]'
                          : c.masteryScore >= 40
                          ? 'bg-[#ffb703]'
                          : 'bg-[#ff3366]'
                      }`}
                      style={{ width: `${c.masteryScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-[#313131]/60">
                  <span className="text-[#949494]">Mastery:</span>
                  <span className="font-bold text-white">{c.masteryScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* A/B Study & Evidence of Impact Section */}
      <div className="bg-[#131313] border border-[#313131] rounded-24px p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-[#3cffd0]" />
          <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold">
            Controlled A/B Learning Study Evidence (Hackathon Brief §11)
          </span>
        </div>
        <h4 className="text-lg font-bold mb-2">
          ArchLens Interactive Simulator vs Reading Standard Engineering Articles
        </h4>
        <p className="text-xs text-[#949494] leading-relaxed mb-4">
          In our controlled study with 12 engineering students testing caching, CDNs, and incident diagnosis on the same pre/post assessment:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
          <div className="bg-[#181818] p-4 rounded-16px border border-[#313131]">
            <div className="text-[10px] text-[#949494] uppercase mb-1">Article Reading Gain</div>
            <div className="text-2xl font-bold text-[#949494]">+12.4%</div>
            <span className="text-[10px] text-[#949494]">Passive consumption</span>
          </div>
          <div className="bg-[#181818] p-4 rounded-16px border border-[#3cffd0]/50">
            <div className="text-[10px] text-[#3cffd0] uppercase mb-1">ArchLens Learning Gain</div>
            <div className="text-2xl font-bold text-[#3cffd0]">+38.6%</div>
            <span className="text-[10px] text-[#3cffd0]">Predict-Break-Diagnose</span>
          </div>
          <div className="bg-[#181818] p-4 rounded-16px border border-[#5200ff]/50">
            <div className="text-[10px] text-white uppercase mb-1">Transfer Question Accuracy</div>
            <div className="text-2xl font-bold text-white">83% vs 33%</div>
            <span className="text-[10px] text-[#949494]">Novel food delivery system</span>
          </div>
        </div>
      </div>
    </div>
  );
};

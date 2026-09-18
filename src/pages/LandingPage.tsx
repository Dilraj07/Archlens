import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useArchStore } from '../store/useArchStore';
import { VergeBadge, VergeButton } from '../components/ui/VergePrimitives';

export const LandingPage: React.FC = () => {
  const startMission = useArchStore((s) => s.startMission);
  const startIncident = useArchStore((s) => s.startIncident);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-16 select-none">
      {/* HERO SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <VergeBadge variant="mint">CODE MY FYP 2026</VergeBadge>
          <span className="text-xs font-mono text-[#949494] uppercase tracking-verge-nano">
            CHALLENGE 01: AI FOR LEARNING
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black text-white leading-[0.88] tracking-tight">
          EVERY TOOL LETS YOU BREAK A SYSTEM. ARCHLENS TEACHES YOU TO{' '}
          <span className="text-[#3cffd0]">DEBUG ONE</span>.
        </h1>

        <p className="text-base sm:text-lg text-[#e9e9e9] max-w-3xl leading-relaxed font-sans font-light">
          The skill you actually need when Indian railway ticketing dies at 10:00 AM or streaming crumbles at the final over.
          Predict failure points before observing them, investigate symptoms with a limited diagnostic budget, and master distributed architectures through deterministic simulation.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <VergeButton
            variant="primary"
            size="lg"
            onClick={() => startMission('g1-tatkal-10am')}
          >
            Play Tatkal at 10 AM <ArrowRight className="w-4 h-4 ml-2" />
          </VergeButton>

          <VergeButton
            variant="outline-uv"
            size="lg"
            onClick={() => startIncident('i1-tatkal-down')}
          >
            <ShieldAlert className="w-4 h-4 mr-2 text-[#ff3366]" />
            Enter Incident Mode (Demo Climax)
          </VergeButton>
        </div>
      </div>

      {/* STORYSTREAM STORY TILES */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold">
            Featured Architecture Missions & Incidents
          </span>
          <span className="text-xs font-mono text-[#949494]">
            Simplified for pedagogical learning
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tile 1: Tatkal Rush (Jelly Mint) */}
          <div
            onClick={() => startMission('g1-tatkal-10am')}
            className="bg-[#3cffd0] text-black rounded-24px p-6 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-verge-mono uppercase mb-3">
                <span>MISSION G1</span>
                <span>SPIKES & QUEUES</span>
              </div>
              <h3 className="text-3xl font-display font-black leading-none mb-2">
                TATKAL AT 10:00 AM
              </h3>
              <p className="text-xs font-medium leading-relaxed">
                Millions of users click search simultaneously. Hot-row contention on passenger inventory DBs and external payment latencies.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-black/20 flex items-center justify-between text-xs font-mono font-bold">
              <span>EXPLORE MISSION</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Tile 2: Cricket Final Over (Ultraviolet) */}
          <div
            onClick={() => startMission('g2-cricket-no-cdn')}
            className="bg-[#5200ff]/90 text-white rounded-24px p-6 cursor-pointer hover:scale-[1.02] transition-all border border-[#5200ff] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono tracking-verge-mono uppercase mb-3">
                <span>MISSION G2</span>
                <span className="text-[#3cffd0]">EDGE CDN OFFLOAD</span>
              </div>
              <h3 className="text-3xl font-display font-black leading-none mb-2">
                THE FINAL OVER
              </h3>
              <p className="text-xs text-[#e9e9e9] leading-relaxed">
                Tidal wave of millions of live video streaming players. Experience what happens when edge CDN caching is bypassed.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-mono">
              <span>EXPLORE MISSION</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Tile 3: Incident Mode (Dark Slate with Red Accents) */}
          <div
            onClick={() => startIncident('i1-tatkal-down')}
            className="bg-[#181818] text-white rounded-24px p-6 cursor-pointer hover:scale-[1.02] transition-all border border-[#ff3366] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#ff3366] tracking-verge-mono uppercase mb-3 font-bold">
                <span>INCIDENT I1</span>
                <span>ON-CALL CLIMAX</span>
              </div>
              <h3 className="text-3xl font-display font-black leading-none mb-2">
                PAGER DUTY: TATKAL IS DOWN
              </h3>
              <p className="text-xs text-[#949494] leading-relaxed">
                Error rate 12.4% and climbing. All nodes are masked. Spend your 5 inspection checks, debug through red herrings, and diagnose the root cause.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#313131] flex items-center justify-between text-xs font-mono text-[#3cffd0]">
              <span>ENTER WAR ROOM</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* THE 6-STEP LEARNING LOOP */}
      <div className="bg-[#181818] border border-[#313131] rounded-24px p-6 md:p-8">
        <div className="mb-6">
          <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano block mb-1 font-bold">
            Pedagogical Engine
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            The 6-Step Predict-Break-Diagnose Loop
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="bg-[#131313] p-4 rounded-16px border border-[#313131]">
            <div className="text-[#3cffd0] font-bold mb-1">01. CONTEXT</div>
            <p className="text-[11px] text-[#949494]">Real-world traffic spike mission brief.</p>
          </div>
          <div className="bg-[#131313] p-4 rounded-16px border border-[#313131]">
            <div className="text-[#3cffd0] font-bold mb-1">02. PREDICT</div>
            <p className="text-[11px] text-[#949494]">Commit structured answer before observing.</p>
          </div>
          <div className="bg-[#131313] p-4 rounded-16px border border-[#313131]">
            <div className="text-[#3cffd0] font-bold mb-1">03. BREAK</div>
            <p className="text-[11px] text-[#949494]">Deterministic queueing simulation runs.</p>
          </div>
          <div className="bg-[#131313] p-4 rounded-16px border border-[#313131]">
            <div className="text-[#3cffd0] font-bold mb-1">04. EXPLAIN</div>
            <p className="text-[11px] text-[#949494]">Grounded AI tutor explains exact math.</p>
          </div>
          <div className="bg-[#131313] p-4 rounded-16px border border-[#313131]">
            <div className="text-[#3cffd0] font-bold mb-1">05. FIX</div>
            <p className="text-[11px] text-[#949494]">Apply mitigations to satisfy SLO goals.</p>
          </div>
          <div className="bg-[#131313] p-4 rounded-16px border border-[#3cffd0]/50">
            <div className="text-[#3cffd0] font-bold mb-1">06. MASTERY</div>
            <p className="text-[11px] text-[#e9e9e9]">Leitner-box spaced retention updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

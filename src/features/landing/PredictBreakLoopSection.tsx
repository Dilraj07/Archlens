import React, { useState } from 'react';
import {
  FileText,
  Brain,
  Flame,
  Sparkles,
  Sliders,
  Trophy,
  ArrowRight,
  RotateCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useArchStore } from '../../store/useArchStore';

interface CanvasNode {
  id: string;
  stepNum: string;
  nodeCode: string;
  title: string;
  category: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  borderAccent: string;
  statusText: string;
  statusVariant: 'healthy' | 'locked' | 'critical' | 'solving' | 'mitigated' | 'mastered';
  telemetryLabel: string;
  telemetryValue: string;
}

const NODES: CanvasNode[] = [
  {
    id: 'node-01',
    stepNum: '01',
    nodeCode: 'BRIEF_IN_01',
    title: 'CONTEXT',
    category: 'INCIDENT BRIEF',
    description: 'Inspect live traffic surges, network topology, and SLO latency thresholds.',
    icon: FileText,
    accent: '#3cffd0',
    borderAccent: 'border-[#3cffd0]',
    statusText: 'READY',
    statusVariant: 'healthy',
    telemetryLabel: 'SURGE PROFILE',
    telemetryValue: '1.2k ➔ 15k req/s',
  },
  {
    id: 'node-02',
    stepNum: '02',
    nodeCode: 'HYPOTHESIS_02',
    title: 'PREDICT',
    category: 'ACTIVE COMMIT',
    description: 'Lock in where and why the bottleneck will form before running the simulator.',
    icon: Brain,
    accent: '#c084fc',
    borderAccent: 'border-[#a855f7]',
    statusText: 'LOCKED',
    statusVariant: 'locked',
    telemetryLabel: 'HYPOTHESIS',
    telemetryValue: 'DB Connection Pool',
  },
  {
    id: 'node-03',
    stepNum: '03',
    nodeCode: 'CHAOS_SIM_03',
    title: 'BREAK',
    category: 'QUEUE SATURATION',
    description: 'Deterministic queueing simulation triggers cascade and saturates resources.',
    icon: Flame,
    accent: '#ff3366',
    borderAccent: 'border-[#ff3366]',
    statusText: '504 CRITICAL',
    statusVariant: 'critical',
    telemetryLabel: 'P99 LATENCY',
    telemetryValue: '4,820ms ⚠️ (Full)',
  },
  {
    id: 'node-04',
    stepNum: '04',
    nodeCode: 'SOCRATIC_04',
    title: 'EXPLAIN',
    category: 'LITTLE\'S LAW',
    description: 'AI tutor explains queue bloat using Little’s Law ($L = \\lambda W$) and utilization.',
    icon: Sparkles,
    accent: '#38bdf8',
    borderAccent: 'border-[#38bdf8]',
    statusText: 'DIAGNOSING',
    statusVariant: 'solving',
    telemetryLabel: 'FORMULA',
    telemetryValue: 'L = λ × W (ρ = 0.98)',
  },
  {
    id: 'node-05',
    stepNum: '05',
    nodeCode: 'REMEDIATE_05',
    title: 'FIX',
    category: 'ARCHITECTURAL FIX',
    description: 'Deploy Redis cache-aside, horizontal replicas, or queue shedding to hit SLOs.',
    icon: Sliders,
    accent: '#34d399',
    borderAccent: 'border-[#10b981]',
    statusText: 'RESTORED',
    statusVariant: 'mitigated',
    telemetryLabel: 'SLO RECOVERY',
    telemetryValue: 'p99: 48ms (Passing)',
  },
  {
    id: 'node-06',
    stepNum: '06',
    nodeCode: 'MASTERY_06',
    title: 'MASTERY',
    category: 'SPACED RECALL',
    description: 'Solidify mental models via SM-2 spaced repetition drills on novel architectures.',
    icon: Trophy,
    accent: '#fbbf24',
    borderAccent: 'border-[#fbbf24]',
    statusText: 'CERTIFIED',
    statusVariant: 'mastered',
    telemetryLabel: 'LEARNING GAIN',
    telemetryValue: '+38.6% vs passive',
  },
];

export const PredictBreakLoopSection: React.FC = () => {
  const setView = useArchStore((s) => s.setView);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const getStatusBadge = (variant: CanvasNode['statusVariant'], text: string) => {
    switch (variant) {
      case 'healthy':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#3cffd0]/15 text-[#3cffd0] border border-[#3cffd0]/40">
            <CheckCircle2 className="w-2.5 h-2.5" />
            {text}
          </span>
        );
      case 'locked':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#a855f7]/15 text-[#c084fc] border border-[#a855f7]/40">
            <Zap className="w-2.5 h-2.5" />
            {text}
          </span>
        );
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366]/40 animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" />
            {text}
          </span>
        );
      case 'solving':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40">
            <Activity className="w-2.5 h-2.5" />
            {text}
          </span>
        );
      case 'mitigated':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/40">
            <CheckCircle2 className="w-2.5 h-2.5" />
            {text}
          </span>
        );
      case 'mastered':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/40">
            <Trophy className="w-2.5 h-2.5" />
            {text}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="space-y-4 select-none">
      {/* SECTION TITLE - BEBAS NEUE DISPLAY FONT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3cffd0] animate-pulse" />
            <span className="text-[11px] font-mono text-[#3cffd0] uppercase tracking-verge-nano font-bold">
              How It Works // Architecture Circuit
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white tracking-wider uppercase leading-none">
            THE 6-STEP PREDICT-BREAK-DIAGNOSE LOOP
          </h2>
          <p className="text-xs sm:text-sm text-[#949494] mt-2 font-sans max-w-2xl leading-relaxed">
            Unlike static video courses, ArchLens wires learning like a real distributed circuit: commit a hypothesis,
            simulate the bottleneck live, and repair the topology to satisfy SLOs.
          </p>
        </div>

        <button
          onClick={() => setView('challenges')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold bg-[#3cffd0] text-black hover:bg-white transition-all shadow-lg active:scale-95 shrink-0 self-start md:self-auto"
        >
          <span>SIMULATE CHALLENGES</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* THE ARCHITECTURE CANVAS BOARD */}
      <div className="bg-[#111111] bg-[radial-gradient(#2c2c2c_1px,transparent_1px)] [background-size:20px_20px] border border-[#313131] rounded-24px p-5 sm:p-7 md:p-8 relative overflow-hidden shadow-2xl">
        {/* Canvas Header Telemetry HUD */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#252525] text-[11px] font-mono text-[#777777]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80" />
            </div>
            <span className="text-white font-bold tracking-wider">CANVAS // SIM_CIRCUIT_PBD</span>
            <span className="hidden sm:inline text-[#555555]">|</span>
            <span className="hidden sm:inline text-[#3cffd0]">6 NODES ACTIVE</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#888888]">
            <RotateCw className="w-3 h-3 text-[#3cffd0] animate-spin" style={{ animationDuration: '6s' }} />
            <span>CONTINUOUS FEEDBACK LOOP</span>
          </div>
        </div>

        {/* DESKTOP 2-ROW CONNECTED CANVAS PIPELINE (lg and up) */}
        <div className="hidden lg:block relative">
          {/* SVG Animated Connector Edges */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glow filter */}
              <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Wire 1: Node 01 to Node 02 (Top Row Horizontal) */}
            <path
              d="M 28% 22% L 38% 22%"
              stroke="#313131"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 28% 22% L 38% 22%"
              stroke="#3cffd0"
              strokeWidth="2"
              fill="none"
              className="edge-flow-active opacity-80"
            />

            {/* Wire 2: Node 02 to Node 03 (Top Row Horizontal) */}
            <path
              d="M 61% 22% L 71% 22%"
              stroke="#313131"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 61% 22% L 71% 22%"
              stroke="#a855f7"
              strokeWidth="2"
              fill="none"
              className="edge-flow-active opacity-80"
            />

            {/* Wire 3: Node 03 down to Node 04 (Right Side Turnaround Curve) */}
            <path
              d="M 85% 42% C 97% 42%, 97% 78%, 85% 78%"
              stroke="#313131"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 85% 42% C 97% 42%, 97% 78%, 85% 78%"
              stroke="#ff3366"
              strokeWidth="2"
              fill="none"
              className="edge-flow-active opacity-80"
            />

            {/* Wire 4: Node 04 to Node 05 (Bottom Row Horizontal - Right to Left) */}
            <path
              d="M 71% 78% L 61% 78%"
              stroke="#313131"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 71% 78% L 61% 78%"
              stroke="#38bdf8"
              strokeWidth="2"
              fill="none"
              className="edge-flow-active opacity-80"
            />

            {/* Wire 5: Node 05 to Node 06 (Bottom Row Horizontal - Right to Left) */}
            <path
              d="M 38% 78% L 28% 78%"
              stroke="#313131"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 38% 78% L 28% 78%"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              className="edge-flow-active opacity-80"
            />

            {/* Wire 6: Node 06 curves up to Node 01 (Left Side Loop-Back Curve) */}
            <path
              d="M 15% 58% C 3% 58%, 3% 22%, 15% 22%"
              stroke="#313131"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="none"
            />
            <path
              d="M 15% 58% C 3% 58%, 3% 22%, 15% 22%"
              stroke="#fbbf24"
              strokeWidth="2"
              fill="none"
              className="edge-flow-active opacity-80"
            />
          </svg>

          {/* 6 ArchNode Cards in 2 Rows */}
          <div className="relative z-10 grid grid-cols-3 gap-x-12 gap-y-12">
            {/* ROW 1: 01 CONTEXT -> 02 PREDICT -> 03 BREAK */}
            {[NODES[0], NODES[1], NODES[2]].map((node) => {
              const Icon = node.icon;
              const isHovered = hoveredNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setView('challenges')}
                  className={`relative bg-[#171717] border rounded-20px p-5 transition-all duration-300 cursor-pointer shadow-lg group select-none ${
                    isHovered
                      ? 'scale-[1.02] bg-[#1f1f1f] shadow-2xl'
                      : 'bg-[#151515] hover:bg-[#1a1a1a] border-[#313131]'
                  }`}
                  style={{
                    borderColor: isHovered ? node.accent : undefined,
                    boxShadow: isHovered ? `0 0 24px ${node.accent}30` : undefined,
                  }}
                >
                  {/* XYFlow-style Port Handles (Left and Right) */}
                  <span
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#151515] transition-colors"
                    style={{ backgroundColor: node.accent }}
                  />
                  <span
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#151515] transition-colors"
                    style={{ backgroundColor: node.accent }}
                  />

                  {/* Node Header Bar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#252525]">
                    <span className="font-mono text-[10px] text-[#888888] tracking-mono">
                      NODE // {node.nodeCode}
                    </span>
                    {getStatusBadge(node.statusVariant, node.statusText)}
                  </div>

                  {/* Node Body: Icon + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-10px flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${node.accent}18`,
                        color: node.accent,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold text-white tracking-wide group-hover:text-[#3cffd0] transition-colors leading-none">
                        {node.stepNum}. {node.title}
                      </h3>
                      <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider">
                        {node.category}
                      </span>
                    </div>
                  </div>

                  {/* Node Description */}
                  <p className="text-xs text-[#a0a0a0] leading-relaxed mb-4 group-hover:text-[#d0d0d0] transition-colors min-h-[36px]">
                    {node.description}
                  </p>

                  {/* Node Telemetry Footer */}
                  <div className="pt-2.5 border-t border-[#242424] flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#666666] uppercase">{node.telemetryLabel}:</span>
                    <span className="font-bold" style={{ color: node.accent }}>
                      {node.telemetryValue}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* ROW 2: 06 MASTERY <- 05 FIX <- 04 EXPLAIN */}
            {/* Display in reverse order visually for the loop flow: 06 on left, 05 middle, 04 on right */}
            {[NODES[5], NODES[4], NODES[3]].map((node) => {
              const Icon = node.icon;
              const isHovered = hoveredNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setView('challenges')}
                  className={`relative bg-[#171717] border rounded-20px p-5 transition-all duration-300 cursor-pointer shadow-lg group select-none ${
                    isHovered
                      ? 'scale-[1.02] bg-[#1f1f1f] shadow-2xl'
                      : 'bg-[#151515] hover:bg-[#1a1a1a] border-[#313131]'
                  }`}
                  style={{
                    borderColor: isHovered ? node.accent : undefined,
                    boxShadow: isHovered ? `0 0 24px ${node.accent}30` : undefined,
                  }}
                >
                  {/* XYFlow-style Port Handles (Left and Right) */}
                  <span
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#151515] transition-colors"
                    style={{ backgroundColor: node.accent }}
                  />
                  <span
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#151515] transition-colors"
                    style={{ backgroundColor: node.accent }}
                  />

                  {/* Node Header Bar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#252525]">
                    <span className="font-mono text-[10px] text-[#888888] tracking-mono">
                      NODE // {node.nodeCode}
                    </span>
                    {getStatusBadge(node.statusVariant, node.statusText)}
                  </div>

                  {/* Node Body: Icon + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-10px flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${node.accent}18`,
                        color: node.accent,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold text-white tracking-wide group-hover:text-[#3cffd0] transition-colors leading-none">
                        {node.stepNum}. {node.title}
                      </h3>
                      <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider">
                        {node.category}
                      </span>
                    </div>
                  </div>

                  {/* Node Description */}
                  <p className="text-xs text-[#a0a0a0] leading-relaxed mb-4 group-hover:text-[#d0d0d0] transition-colors min-h-[36px]">
                    {node.description}
                  </p>

                  {/* Node Telemetry Footer */}
                  <div className="pt-2.5 border-t border-[#242424] flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#666666] uppercase">{node.telemetryLabel}:</span>
                    <span className="font-bold" style={{ color: node.accent }}>
                      {node.telemetryValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE / TABLET RESPONSIVE CONNECTED VERTICAL CONDUIT (below lg) */}
        <div className="block lg:hidden relative">
          {/* Vertical Conduit Center Line */}
          <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-[#2d2d2d] z-0" />
          <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#3cffd0] via-[#ff3366] to-[#fbbf24] z-0 opacity-80" />

          <div className="space-y-4 relative z-10 pl-12">
            {NODES.map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.id}
                  onClick={() => setView('challenges')}
                  className="relative bg-[#161616] border border-[#313131] hover:border-[#3cffd0]/70 p-4 rounded-16px cursor-pointer transition-all group select-none"
                >
                  {/* Left Wire Tap Dot */}
                  <span
                    className="absolute -left-12 top-6 w-3 h-3 rounded-full border-2 border-[#111111]"
                    style={{ backgroundColor: node.accent }}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#252525]">
                    <span className="font-mono text-[10px] text-[#777777]">
                      {node.nodeCode}
                    </span>
                    {getStatusBadge(node.statusVariant, node.statusText)}
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div
                      className="w-7 h-7 rounded-8px flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${node.accent}18`,
                        color: node.accent,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white tracking-wide group-hover:text-[#3cffd0] transition-colors leading-none">
                      {node.stepNum}. {node.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#999999] leading-snug mb-3">
                    {node.description}
                  </p>

                  <div className="pt-2 border-t border-[#252525] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#666666]">{node.telemetryLabel}:</span>
                    <span className="font-bold" style={{ color: node.accent }}>
                      {node.telemetryValue}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas Bottom Circuit Status Bar */}
        <div className="mt-8 pt-4 border-t border-[#252525] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#888888]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3cffd0]" />
            <span>Deterministic Queueing Simulator · Zero Hindsight Bias</span>
          </div>

          <button
            onClick={() => setView('challenges')}
            className="flex items-center gap-2 text-[#3cffd0] hover:text-white font-bold transition-colors"
          >
            <span>START PREDICT-BREAK-DIAGNOSE CHALLENGE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

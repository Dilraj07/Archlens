import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useArchStore } from '../../store/useArchStore';
import { ArchCanvas } from '../canvas/ArchCanvas';
import {
  Layers,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sliders,
  Power,
  ChevronDown,
  Info,
  Sparkles,
} from 'lucide-react';
import { CompanyLogo } from '../../components/ui/CompanyLogo';
import { LevelTourOverlay } from './LevelTourOverlay';

const ARCHITECTURE_PRESETS = [
  {
    id: 'simple-app',
    name: 'Level 1: Simple Web App',
    difficulty: 'Beginner',
    tag: 'Monolith + DB',
    description:
      'Classic 2-tier architecture (Client -> App Server -> Database). Great for small traffic, but the single database crashes when traffic spikes.',
  },
  {
    id: 'scaled-app',
    name: 'Level 2: Scaled App (CDN + Cache + LB)',
    difficulty: 'Intermediate',
    tag: '3-Tier Production',
    description:
      'Production-ready architecture with Edge CDN, Load Balancer, 3 App Servers, and Redis Cache to shield the SQL Database from read volume.',
  },
  {
    id: 'amazon',
    name: 'Level 3: Amazon E-Commerce Hyperscale',
    difficulty: 'Advanced',
    tag: 'Microservices & Kafka',
    description:
      'Amazon-inspired distributed architecture with DynamoDB product store, Redis cart cache, Kafka order pipeline, and Aurora DB.',
  },
  {
    id: 'netflix',
    name: 'Level 4: Netflix Video Streaming',
    difficulty: 'Advanced',
    tag: 'Global Edge & NoSQL',
    description:
      'Netflix-inspired streaming architecture featuring Open Connect CDN edge, Zuul gateway, Cassandra cluster, and S3 chunk storage.',
  },
  {
    id: 'tatkal',
    name: 'Level 5: IRCTC Tatkal (10 AM Rush)',
    difficulty: 'Expert',
    tag: 'Extreme Concurrency',
    description:
      'IRCTC-inspired ticket booking under extreme 10:00:00 AM rush. High concurrency, seat cache lock contention, and payment gateways.',
  },
];

export const ArchitectureExplorer: React.FC = () => {
  const activeBlueprintId = useArchStore((s) => s.activeBlueprintId);
  const activeBlueprint = useArchStore((s) => s.activeBlueprint);
  const activeScenario = useArchStore((s) => s.activeScenario);
  const currentResult = useArchStore((s) => s.currentResult);
  const selectedNodeId = useArchStore((s) => s.selectedNodeId);
  const selectArchitecture = useArchStore((s) => s.selectArchitecture);
  const setTrafficLoad = useArchStore((s) => s.setTrafficLoad);
  const updateNodeConfig = useArchStore((s) => s.updateNodeConfig);

  const [explorerMode, setExplorerMode] = useState<'tour' | 'sandbox'>('tour');
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // Rolling latency history (last 60 samples) — updated on every sim result change
  // so users see the *shape* of the response as they drag the slider.
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const lastSampleRef = useRef<number>(0);
  useEffect(() => {
    const now = performance.now();
    if (now - lastSampleRef.current < 120) return;
    lastSampleRef.current = now;
    const v = currentResult.system.userLatencyMs;
    setLatencyHistory((h) => {
      const next = h.length >= 60 ? [...h.slice(-59), v] : [...h, v];
      return next;
    });
  }, [currentResult]);
  // Reset history when the blueprint changes
  useEffect(() => {
    setLatencyHistory([]);
  }, [activeBlueprintId]);

  const sparkPath = useMemo(() => {
    if (latencyHistory.length < 2) return '';
    const W = 120, H = 32, PAD = 2;
    const max = Math.max(300, ...latencyHistory);
    const min = 0;
    const step = (W - PAD * 2) / (latencyHistory.length - 1);
    return latencyHistory
      .map((v, i) => {
        const x = PAD + i * step;
        const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [latencyHistory]);

  const bottleneckId = currentResult.system.bottleneckNodeId;
  const bottleneckNode = bottleneckId
    ? activeBlueprint.nodes.find((n) => n.id === bottleneckId)
    : null;

  // Selected node & its live metrics
  const selectedNode = activeBlueprint.nodes.find((n) => n.id === selectedNodeId);
  const selectedMetrics = selectedNodeId ? currentResult.nodes[selectedNodeId] : null;

  // System-wide health rollup
  const userLatency = currentResult.system.userLatencyMs;
  const errorRate = currentResult.system.errorRate;
  const systemStatus = currentResult.system.status;
  const droppedRequests = Math.round(currentResult.system.totalArrivalRate * errorRate);

  // Traffic slider handler
  const handleTrafficChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTrafficLoad(val, 1);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131313] text-white overflow-hidden select-none">
      {/* ── Top Bar: Blueprint Selector + Mode Switch ── */}
      <div className="bg-[#131313] border-b border-[#222] px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          {/* Blueprint selector with logo */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#3cffd0]/10 border border-[#3cffd0]/30 flex items-center justify-center text-[#3cffd0] shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <CompanyLogo name={activeBlueprintId} size="sm" />
            <div className="relative">
              <select
                value={activeBlueprintId}
                onChange={(e) => selectArchitecture(e.target.value)}
                className="bg-[#1a1a1a] text-white font-mono text-xs rounded-lg px-2.5 py-1.5 pr-7 border border-[#2d2d2d] focus:border-[#3cffd0] outline-none cursor-pointer appearance-none max-w-[260px]"
              >
                {ARCHITECTURE_PRESETS.map((arch) => (
                  <option key={arch.id} value={arch.id} className="bg-[#181818]">
                    {arch.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#555] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1" />

          {/* Metrics strip – only in sandbox mode */}
          {explorerMode === 'sandbox' && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              {/* Rolling latency sparkline */}
              <div className="bg-[#1a1a1a] border border-[#2d2d2d] px-2.5 py-1 rounded-lg flex items-center gap-2">
                <span className="text-[#666]">Latency</span>
                <span className={`font-bold ${
                  userLatency > 300 ? 'text-[#ff3366]' : userLatency > 150 ? 'text-[#ffb703]' : 'text-[#3cffd0]'
                }`}>{Math.round(userLatency)} ms</span>
                {sparkPath && (
                  <svg width="120" height="32" className="ml-1">
                    <path
                      d={sparkPath}
                      fill="none"
                      stroke={userLatency > 300 ? '#ff3366' : userLatency > 150 ? '#ffb703' : '#3cffd0'}
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </div>
              {/* Error rate + dropped */}
              {(errorRate > 0.001 || droppedRequests > 0) && (
                <div className="bg-[#1a1a1a] border border-[#ff3366]/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#666]">Dropped</span>
                  <span className="font-bold text-[#ff3366]">{droppedRequests}/s</span>
                  <span className="text-[#666]">({(errorRate * 100).toFixed(1)}%)</span>
                </div>
              )}
              {/* Bottleneck badge */}
              {bottleneckNode && systemStatus !== 'healthy' && (
                <div className="bg-[#1a1a1a] border border-[#ff3366]/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-alert">
                  <AlertTriangle className="w-3 h-3 text-[#ff3366]" />
                  <span className="text-[#666]">Bottleneck</span>
                  <span className="font-bold text-[#ff3366] truncate max-w-[140px]">{bottleneckNode.name}</span>
                </div>
              )}
              <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase flex items-center gap-1 border ${
                systemStatus === 'healthy' ? 'bg-[#1a1a1a] text-[#3cffd0] border-[#3cffd0]/30'
                  : systemStatus === 'degraded' ? 'bg-[#1a1a1a] text-[#ffb703] border-[#ffb703]/30'
                  : 'bg-[#1a1a1a] text-[#ff3366] border-[#ff3366]/50'
              }`}>
                {systemStatus === 'healthy' && <CheckCircle className="w-3 h-3" />}
                {systemStatus === 'degraded' && <AlertTriangle className="w-3 h-3" />}
                {systemStatus === 'incident' && <XCircle className="w-3 h-3" />}
                {systemStatus}
              </div>
            </div>
          )}

          {/* Mode switch */}
          <div className="flex items-center gap-0.5 bg-[#1a1a1a] p-1 rounded-lg border border-[#252525] shrink-0">
            <button
              onClick={() => setExplorerMode('tour')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 font-bold transition-all ${
                explorerMode === 'tour' ? 'bg-[#3cffd0] text-black' : 'text-[#666] hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Tour</span>
            </button>
            <button
              onClick={() => setExplorerMode('sandbox')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 font-bold transition-all ${
                explorerMode === 'sandbox' ? 'bg-[#252525] text-white border border-[#3cffd0]/20' : 'text-[#666] hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Sandbox</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main Area: Canvas (Left) + Interactive Hyperparameter Inspector (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left: Canvas Area + Bottom Guided Level Tour Overlay */}
        <div className="flex-1 relative flex flex-col min-h-0">
          <div className="flex-1 relative min-h-0">
            <ArchCanvas />
          </div>
          {explorerMode === 'tour' && (
            <div className="shrink-0 z-20">
              <LevelTourOverlay onClose={() => setExplorerMode('sandbox')} />
            </div>
          )}
        </div>

        {/* Right: Interactive Hyperparameter & Tuning Sidebar (hidden in tour mode) */}
        <div className={`w-full lg:w-[420px] bg-[#181818] border-l border-[#313131] flex flex-col h-full overflow-y-auto p-5 space-y-6 shrink-0 z-10 ${explorerMode === 'tour' ? 'hidden' : ''}`}>
          {/* Section 1: Traffic Load Slider (Hyperparameter Control) */}
          <div className="bg-[#131313] border border-[#313131] rounded-20px p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-verge-mono text-[#3cffd0] font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Live Traffic Load
              </span>
              <span className="text-xs font-mono font-bold text-[#3cffd0] bg-[#181818] px-2.5 py-1 rounded-12px border border-[#3cffd0]/30">
                {activeScenario.usersConcurrent.toLocaleString()} users
              </span>
            </div>

            <p className="text-[11px] text-[#949494] mb-4">
              Drag the slider to test how components respond to traffic surges in real time.
            </p>

            <input
              type="range"
              min="500"
              max="150000"
              step="500"
              value={activeScenario.usersConcurrent}
              onChange={handleTrafficChange}
              className="w-full accent-[#3cffd0] cursor-pointer h-2 bg-[#2d2d2d] rounded-lg"
            />

            {/* Quick Load Presets */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] font-mono uppercase tracking-verge-mono">
              <button
                onClick={() => setTrafficLoad(1500, 1)}
                className="bg-[#181818] hover:bg-[#252525] py-1.5 rounded-12px text-[#949494] hover:text-white border border-[#313131] transition-all"
              >
                1.5k (Low)
              </button>
              <button
                onClick={() => setTrafficLoad(25000, 1)}
                className="bg-[#181818] hover:bg-[#252525] py-1.5 rounded-12px text-[#ffb703] border border-[#313131] transition-all font-semibold"
              >
                25k (Peak)
              </button>
              <button
                onClick={() => setTrafficLoad(100000, 1)}
                className="bg-[#181818] hover:bg-[#252525] py-1.5 rounded-12px text-[#ff3366] border border-[#313131] transition-all font-bold"
              >
                100k (Surge)
              </button>
            </div>
          </div>

          {/* Section 2: Selected Component Inspector & Tuner */}
          {selectedNode ? (
            <div className="bg-[#131313] border border-[#313131] rounded-20px p-5 space-y-4">
              {/* Component Title & Health */}
              <div className="flex items-start justify-between gap-2 border-b border-[#313131] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] font-bold">
                    {selectedNode.type.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-base text-white tracking-tight">
                    {selectedNode.name}
                  </h3>
                </div>

                {selectedMetrics && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-12px uppercase tracking-verge-nano border ${
                      selectedMetrics.health === 'healthy'
                        ? 'bg-[#181818] text-[#3cffd0] border-[#3cffd0]/40'
                        : selectedMetrics.health === 'degraded'
                        ? 'bg-[#181818] text-[#ffb703] border-[#ffb703]/40'
                        : 'bg-[#181818] text-[#ff3366] border-[#ff3366] animate-pulse'
                    }`}
                  >
                    {selectedMetrics.health}
                  </span>
                )}
              </div>

              {/* Plain English Explanation */}
              <div className="text-xs text-[#e9e9e9] leading-relaxed bg-[#181818] p-3 rounded-12px border border-[#313131]">
                {selectedMetrics?.health === 'healthy' && (
                  <p>
                    <strong className="text-[#3cffd0]">Operating Smoothly:</strong> This {selectedNode.type} has enough capacity to handle incoming traffic without dropping requests.
                  </p>
                )}
                {selectedMetrics?.health === 'degraded' && (
                  <p className="text-[#ffb703]">
                    <strong>Approaching Saturation:</strong> Utilization is over 70%. Requests are starting to queue up, increasing user latency.
                  </p>
                )}
                {selectedMetrics?.health === 'overloaded' && (
                  <p className="text-[#ff3366]">
                    <strong>Critical Bottleneck:</strong> Demand exceeds capacity! The queue is full, and {Math.round(selectedMetrics.dropped)} requests per second are failing.
                  </p>
                )}
              </div>

              {/* Interactive Component Tuning Controls */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#949494] font-bold block">
                  Tune Component Hyperparameters
                </span>

                {/* Control 1: Replicas */}
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-verge-mono">
                  <span className="text-[#949494]">Server Replicas:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateNodeConfig(selectedNode.id, {
                          replicas: Math.max(1, selectedNode.replicas - 1),
                        })
                      }
                      className="w-7 h-7 rounded-8px bg-[#181818] hover:bg-[#252525] text-white flex items-center justify-center font-bold border border-[#313131]"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-[#3cffd0] w-6 text-center">
                      Ã—{selectedNode.replicas}
                    </span>
                    <button
                      onClick={() =>
                        updateNodeConfig(selectedNode.id, {
                          replicas: Math.min(12, selectedNode.replicas + 1),
                        })
                      }
                      className="w-7 h-7 rounded-8px bg-[#181818] hover:bg-[#252525] text-white flex items-center justify-center font-bold border border-[#313131]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Control 2: Cache Hit Rate (if applicable) */}
                {selectedNode.hitRate !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono uppercase tracking-verge-mono mb-1">
                      <span className="text-[#949494]">Cache Hit Rate:</span>
                      <span className="font-mono font-bold text-[#3cffd0]">
                        {Math.round(selectedNode.hitRate * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.99"
                      step="0.05"
                      value={selectedNode.hitRate}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode.id, {
                          hitRate: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#3cffd0] cursor-pointer h-1.5 bg-[#2d2d2d] rounded"
                    />
                  </div>
                )}

                {/* Control 3: Service Capacity per Replica */}
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-verge-mono">
                  <span className="text-[#949494]">Capacity per Replica:</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      onClick={() =>
                        updateNodeConfig(selectedNode.id, {
                          serviceRatePerReplica: Math.max(
                            500,
                            selectedNode.serviceRatePerReplica - 1000
                          ),
                        })
                      }
                      className="px-2 py-1 bg-[#181818] rounded-8px text-[#949494] hover:text-white border border-[#313131]"
                    >
                      -1k
                    </button>
                    <span className="text-white font-bold">
                      {selectedNode.serviceRatePerReplica.toLocaleString()}
                    </span>
                    <button
                      onClick={() =>
                        updateNodeConfig(selectedNode.id, {
                          serviceRatePerReplica: selectedNode.serviceRatePerReplica + 1000,
                        })
                      }
                      className="px-2 py-1 bg-[#181818] rounded-8px text-[#949494] hover:text-white border border-[#313131]"
                    >
                      +1k
                    </button>
                  </div>
                </div>

                {/* Control 4: Kill/Enable Component Switch */}
                <div className="pt-2 flex items-center justify-between text-xs font-mono uppercase tracking-verge-mono border-t border-[#313131]">
                  <span className="text-[#949494]">Component Status:</span>
                  <button
                    onClick={() =>
                      updateNodeConfig(selectedNode.id, {
                        enabled: !selectedNode.enabled,
                      })
                    }
                    className={`px-3 py-1.5 rounded-12px text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      selectedNode.enabled
                        ? 'bg-[#181818] text-[#3cffd0] border-[#3cffd0]/40'
                        : 'bg-[#181818] text-[#ff3366] border-[#ff3366]'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {selectedNode.enabled ? 'Online (Active)' : 'Crashed (Disabled)'}
                  </button>
                </div>
              </div>

              {/* Glass Box Formulas (Toggleable) */}
              <div className="pt-2 border-t border-[#313131]">
                <button
                  onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                  className="w-full text-left text-[11px] font-mono uppercase tracking-verge-mono text-[#3cffd0] hover:underline flex items-center justify-between"
                >
                  <span>{showFormulaDetails ? 'Hide' : 'Show'} Queueing Math (Glass Box)</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showFormulaDetails ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showFormulaDetails && selectedMetrics && (
                  <div className="mt-3 p-3 bg-[#181818] rounded-12px border border-[#313131] text-[11px] font-mono text-[#949494] space-y-1.5">
                    <div>
                      Offered Load (Î»):{' '}
                      <span className="text-white font-bold">{Math.round(selectedMetrics.offeredLoad)} req/s</span>
                    </div>
                    <div>
                      Service Capacity (Î¼):{' '}
                      <span className="text-white font-bold">{Math.round(selectedMetrics.capacity)} req/s</span>
                    </div>
                    <div>
                      Utilization (Ï = Î»/Î¼):{' '}
                      <span className="text-[#3cffd0] font-bold">
                        {(selectedMetrics.utilization * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      Calculated Latency:{' '}
                      <span className="text-white font-bold">{selectedMetrics.latencyMs.toFixed(1)} ms</span>
                    </div>
                    <div>
                      Formula:{' '}
                      <span className="text-[#3cffd0]">
                        baseLatency / (1 - min(Ï, 0.95)) + wait
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#131313] border border-[#313131] rounded-20px p-6 text-center">
              <Info className="w-8 h-8 text-[#949494] mx-auto mb-2 opacity-50" />
              <h4 className="font-bold text-white text-sm font-mono uppercase tracking-verge-mono">Select Any Component</h4>
              <p className="text-xs text-[#949494] mt-1">
                Click on any node in the architecture diagram to inspect its live metrics and adjust its hyperparameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


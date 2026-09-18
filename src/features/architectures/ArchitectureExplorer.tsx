import React, { useState } from 'react';
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
} from 'lucide-react';

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

  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

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
      {/* Top Architecture Selector Bar */}
      <div className="bg-[#131313] border-b border-[#313131] px-6 py-3.5 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Architecture Selector */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-12px bg-[#3cffd0]/10 border border-[#3cffd0]/30 flex items-center justify-center text-[#3cffd0]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] font-bold">
                SYSTEM TOPOLOGY SHOWROOM
              </div>
              <div className="relative inline-block mt-0.5">
                <select
                  value={activeBlueprintId}
                  onChange={(e) => selectArchitecture(e.target.value)}
                  className="bg-[#181818] text-white font-mono uppercase tracking-verge-mono text-xs rounded-12px px-3 py-1.5 pr-8 border border-[#313131] focus:border-[#3cffd0] outline-none cursor-pointer appearance-none"
                >
                  {ARCHITECTURE_PRESETS.map((arch) => (
                    <option key={arch.id} value={arch.id} className="bg-[#181818]">
                      {arch.name} ({arch.tag})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#949494] absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick System Summary Metrics in Verge styling */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono uppercase tracking-verge-mono">
            <div className="bg-[#181818] border border-[#313131] px-3 py-1.5 rounded-12px flex items-center gap-2">
              <span className="text-[#949494]">Traffic:</span>
              <span className="font-bold text-[#3cffd0]">
                {activeScenario.usersConcurrent.toLocaleString()} req/s
              </span>
            </div>
            <div className="bg-[#181818] border border-[#313131] px-3 py-1.5 rounded-12px flex items-center gap-2">
              <span className="text-[#949494]">Latency:</span>
              <span
                className={`font-bold ${
                  userLatency > 300 ? 'text-[#ff3366]' : userLatency > 150 ? 'text-[#ffb703]' : 'text-[#3cffd0]'
                }`}
              >
                {Math.round(userLatency)} ms
              </span>
            </div>
            <div className="bg-[#181818] border border-[#313131] px-3 py-1.5 rounded-12px flex items-center gap-2">
              <span className="text-[#949494]">Dropped:</span>
              <span className={`font-bold ${droppedRequests > 0 ? 'text-[#ff3366]' : 'text-[#3cffd0]'}`}>
                {droppedRequests.toLocaleString()} ({Math.round(errorRate * 100)}%)
              </span>
            </div>
            <div
              className={`px-3 py-1.5 rounded-12px text-[11px] font-bold uppercase tracking-verge-nano flex items-center gap-1.5 border ${
                systemStatus === 'healthy'
                  ? 'bg-[#181818] text-[#3cffd0] border-[#3cffd0]/40'
                  : systemStatus === 'degraded'
                  ? 'bg-[#181818] text-[#ffb703] border-[#ffb703]/40'
                  : 'bg-[#181818] text-[#ff3366] border-[#ff3366]'
              }`}
            >
              {systemStatus === 'healthy' && <CheckCircle className="w-3.5 h-3.5" />}
              {systemStatus === 'degraded' && <AlertTriangle className="w-3.5 h-3.5" />}
              {systemStatus === 'incident' && <XCircle className="w-3.5 h-3.5" />}
              <span>{systemStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area: Canvas (Left) + Interactive Hyperparameter Inspector (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left: Canvas Area — relative so ArchCanvas (absolute inset-0) can anchor to this */}
        <div className="flex-1 relative min-h-0">
          <ArchCanvas />
        </div>

        {/* Right: Interactive Hyperparameter & Tuning Sidebar */}
        <div className="w-full lg:w-[420px] bg-[#181818] border-l border-[#313131] flex flex-col h-full overflow-y-auto p-5 space-y-6 shrink-0 z-10">
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
                      ×{selectedNode.replicas}
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
                      Offered Load (λ):{' '}
                      <span className="text-white font-bold">{Math.round(selectedMetrics.offeredLoad)} req/s</span>
                    </div>
                    <div>
                      Service Capacity (μ):{' '}
                      <span className="text-white font-bold">{Math.round(selectedMetrics.capacity)} req/s</span>
                    </div>
                    <div>
                      Utilization (ρ = λ/μ):{' '}
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
                        baseLatency / (1 - min(ρ, 0.95)) + wait
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

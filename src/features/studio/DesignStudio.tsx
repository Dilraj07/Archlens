import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  BackgroundVariant,
  Connection,
  Handle,
  Position,
  NodeProps,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useArchStore } from '../../store/useArchStore';
import { NodeType, NodeSpec } from '../../engine/types';
import {
  Server,
  Database,
  HardDrive,
  Layers,
  MessageSquare,
  Shield,
  Smartphone,
  Globe,
  Cpu,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

const TYPE_ICONS: Record<string, React.ElementType> = {
  client: Smartphone,
  cdn: Globe,
  load_balancer: Layers,
  service: Server,
  cache: HardDrive,
  database: Database,
  queue: MessageSquare,
  worker: Cpu,
  rate_limiter: Shield,
};

// ──────────────────────────────────────────────────────
// Custom node rendered inside the React Flow canvas
// ──────────────────────────────────────────────────────
const StudioCustomNode = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as {
    spec: NodeSpec;
    metrics?: {
      health: 'healthy' | 'degraded' | 'overloaded' | 'down';
      utilization: number;
      latencyMs: number;
      dropped: number;
    };
  };

  const { spec, metrics } = nodeData;
  const selectStudioNode = useArchStore((s) => s.selectStudioNode);
  const Icon = TYPE_ICONS[spec.type] || Server;

  let borderClass = 'border-[#313131] bg-[#181818]';
  let badgeColor = 'bg-[#131313] text-[#949494] border border-[#313131]';
  let statusText = 'READY';

  if (metrics) {
    switch (metrics.health) {
      case 'healthy':
        borderClass = 'border-[#3cffd0] bg-[#181818]';
        badgeColor = 'bg-[#131313] text-[#3cffd0] border border-[#3cffd0]/40';
        statusText = 'HEALTHY';
        break;
      case 'degraded':
        borderClass = 'border-[#ffb703] bg-[#181818]';
        badgeColor = 'bg-[#131313] text-[#ffb703] border border-[#ffb703]/40';
        statusText = 'DEGRADED';
        break;
      case 'overloaded':
        borderClass = 'border-[#ff3366] bg-[#181818]';
        badgeColor = 'bg-[#131313] text-[#ff3366] border border-[#ff3366] animate-pulse';
        statusText = 'OVERLOADED';
        break;
    }
  }

  if (selected) {
    borderClass += ' ring-2 ring-white ring-offset-2 ring-offset-[#131313]';
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectStudioNode(id);
      }}
      className={`min-w-[190px] rounded-16px p-3 border transition-all duration-200 cursor-pointer ${borderClass} relative select-none`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#3cffd0] !w-2.5 !h-2.5 !border-[#131313]" />

      {/* Node Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-8px bg-[#131313] border border-[#313131] flex items-center justify-center text-[#3cffd0]">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-white tracking-tight">{spec.name}</span>
        </div>

        <span
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-8px font-bold uppercase tracking-verge-nano ${badgeColor}`}
        >
          {statusText}
        </span>
      </div>

      {/* Node Sub-metrics */}
      {metrics ? (
        <div className="pt-2 border-t border-[#313131]/60 grid grid-cols-2 gap-1 font-mono text-[10px]">
          <div>
            <span className="text-[#949494] block uppercase tracking-verge-nano text-[9px]">Load</span>
            <span
              className={`font-bold ${
                metrics.utilization >= 1.0
                  ? 'text-[#ff3366]'
                  : metrics.utilization >= 0.7
                  ? 'text-[#ffb703]'
                  : 'text-[#3cffd0]'
              }`}
            >
              {Math.round(metrics.utilization * 100)}%
            </span>
          </div>
          <div>
            <span className="text-[#949494] block uppercase tracking-verge-nano text-[9px]">Latency</span>
            <span className="font-bold text-white">{Math.round(metrics.latencyMs)}ms</span>
          </div>
        </div>
      ) : (
        <div className="pt-1.5 border-t border-[#313131]/40 flex items-center justify-between text-[10px] font-mono text-[#777777]">
          <span>Replicas: ×{spec.replicas}</span>
          <span>{spec.serviceRatePerReplica} rps</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[#3cffd0] !w-2.5 !h-2.5 !border-[#131313]" />
    </div>
  );
};

const studioNodeTypes = {
  customNode: StudioCustomNode,
};

// ──────────────────────────────────────────────────────
// Helper: compute a default layered grid position for a new node
// ──────────────────────────────────────────────────────
const LAYER_MAP: Record<string, number> = {
  client: 0,
  cdn: 1,
  load_balancer: 1,
  rate_limiter: 1,
  service: 2,
  cache: 3,
  queue: 3,
  database: 4,
  worker: 4,
  external: 4,
};

function defaultPosition(nodeType: string, index: number): { x: number; y: number } {
  const layer = LAYER_MAP[nodeType] ?? 2;
  return { x: 150 + (index % 4) * 240, y: 60 + layer * 160 };
}

// Convert a store NodeSpec array to React Flow Node[]
function specToRFNode(
  spec: NodeSpec,
  index: number,
  selectedId: string | null,
  metrics?: { health: string; utilization: number; latencyMs: number; dropped: number },
  existingPos?: { x: number; y: number }
): Node {
  return {
    id: spec.id,
    type: 'customNode',
    position: existingPos ?? defaultPosition(spec.type, index),
    selected: selectedId === spec.id,
    data: { spec, metrics },
  };
}

// ──────────────────────────────────────────────────────
// Main DesignStudio component
// ──────────────────────────────────────────────────────
export const DesignStudio: React.FC = () => {
  const studioGraph = useArchStore((s) => s.studioGraph);
  const studioTraffic = useArchStore((s) => s.studioTraffic);
  const studioSimResult = useArchStore((s) => s.studioSimResult);
  const studioSelectedNodeId = useArchStore((s) => s.studioSelectedNodeId);

  const addStudioNode = useArchStore((s) => s.addStudioNode);
  const updateStudioNode = useArchStore((s) => s.updateStudioNode);
  const removeStudioNode = useArchStore((s) => s.removeStudioNode);
  const connectStudioNodes = useArchStore((s) => s.connectStudioNodes);
  const removeStudioEdge = useArchStore((s) => s.removeStudioEdge);
  const simulateStudio = useArchStore((s) => s.simulateStudio);
  const resetStudio = useArchStore((s) => s.resetStudio);
  const loadStudioTemplate = useArchStore((s) => s.loadStudioTemplate);
  const selectStudioNode = useArchStore((s) => s.selectStudioNode);

  const [trafficInput, setTrafficInput] = useState(studioTraffic || 2500);

  // ── CONTROLLED NODES STATE ──────────────────────────
  // React Flow requires nodes to live in local React state.
  // applyNodeChanges handles all drag/select/remove events correctly.
  const [rfNodes, setRfNodes] = useState<Node[]>(() =>
    studioGraph.nodes.map((spec, i) =>
      specToRFNode(spec, i, studioSelectedNodeId, studioSimResult?.nodes[spec.id])
    )
  );

  // ── CONTROLLED EDGES STATE ──────────────────────────
  const [rfEdges, setRfEdges] = useState<Edge[]>(() =>
    studioGraph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: false,
      style: { stroke: '#3cffd0', strokeWidth: 2 },
    }))
  );

  // ── SYNC: store graph → rfNodes when graph structure changes ──
  // We only sync IDs that are NEW (added via palette) or REMOVED.
  // We DO NOT overwrite positions of existing nodes (that would break drag).
  useEffect(() => {
    setRfNodes((prev) => {
      const prevMap = new Map(prev.map((n) => [n.id, n]));
      const storeIds = new Set(studioGraph.nodes.map((s) => s.id));

      // Remove nodes that were deleted from the store
      const kept = prev.filter((n) => storeIds.has(n.id));

      // Add nodes that are new in the store
      const newNodes: Node[] = studioGraph.nodes
        .filter((spec) => !prevMap.has(spec.id))
        .map((spec, i) =>
          specToRFNode(
            spec,
            prev.length + i,         // place new node after existing ones
            studioSelectedNodeId,
            studioSimResult?.nodes[spec.id]
          )
        );

      // Update data (metrics, selected, spec) of existing nodes WITHOUT touching position
      const updated = kept.map((n) => {
        const spec = studioGraph.nodes.find((s) => s.id === n.id);
        if (!spec) return n;
        return {
          ...n,
          selected: studioSelectedNodeId === n.id,
          data: {
            spec,
            metrics: studioSimResult?.nodes[n.id],
          },
        };
      });

      return [...updated, ...newNodes];
    });
  }, [studioGraph.nodes, studioSimResult, studioSelectedNodeId]);

  // ── SYNC: store edges → rfEdges ──────────────────────
  useEffect(() => {
    setRfEdges(
      studioGraph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: Boolean(studioSimResult),
        style: { stroke: '#3cffd0', strokeWidth: 2 },
      }))
    );
  }, [studioGraph.edges, studioSimResult]);

  // ── NODE CHANGE HANDLER (drag, select, remove) ───────
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Let React Flow apply drag / select / remove to local state
      setRfNodes((nds) => applyNodeChanges(changes, nds));

      // Sync selection back to Zustand store
      changes.forEach((c) => {
        if (c.type === 'select') {
          selectStudioNode(c.selected ? c.id : null);
        }
        // If a node is removed via DEL key, also remove from store
        if (c.type === 'remove') {
          removeStudioNode(c.id);
        }
      });
    },
    [selectStudioNode, removeStudioNode]
  );

  // ── EDGE CHANGE HANDLER (select, remove) ────────────
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setRfEdges((eds) => applyEdgeChanges(changes, eds));
      changes.forEach((c) => {
        if (c.type === 'remove') {
          removeStudioEdge(c.id);
        }
      });
    },
    [removeStudioEdge]
  );

  // ── CONNECT (drag handle → handle) ──────────────────
  const handleConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        connectStudioNodes(params.source, params.target);
      }
    },
    [connectStudioNodes]
  );

  // ── RESET: clear controlled state + store ───────────
  const handleReset = useCallback(() => {
    resetStudio();
    // rfNodes/rfEdges will re-sync via useEffect
  }, [resetStudio]);

  const handleLoadTemplate = useCallback(
    (id: string) => {
      loadStudioTemplate(id);
      // rfNodes/rfEdges will re-sync via useEffect
    },
    [loadStudioTemplate]
  );

  // Selected node for the right inspector panel
  const selectedNode = studioGraph.nodes.find((n) => n.id === studioSelectedNodeId);
  const selectedMetrics =
    studioSelectedNodeId && studioSimResult ? studioSimResult.nodes[studioSelectedNodeId] : null;

  // Component palette
  const palette: { type: NodeType; name: string; desc: string; icon: React.ElementType }[] = [
    { type: 'client', name: 'Web Users', desc: 'Traffic generator', icon: Smartphone },
    { type: 'cdn', name: 'Edge CDN', desc: 'Caches static files', icon: Globe },
    { type: 'load_balancer', name: 'Load Balancer', desc: 'Distributes requests', icon: Layers },
    { type: 'service', name: 'App Server', desc: 'Compute / API Logic', icon: Server },
    { type: 'cache', name: 'Redis Cache', desc: 'In-memory fast lookup', icon: HardDrive },
    { type: 'database', name: 'SQL Database', desc: 'Primary transactional store', icon: Database },
    { type: 'queue', name: 'Kafka Queue', desc: 'Asynchronous buffer', icon: MessageSquare },
    { type: 'worker', name: 'Async Worker', desc: 'Background jobs', icon: Cpu },
    { type: 'rate_limiter', name: 'Rate Limiter', desc: 'Shields from traffic spikes', icon: Shield },
  ];

  // Architectural advisor tips
  const advisorTips = useMemo(() => {
    const tips: { type: 'success' | 'warning' | 'info'; text: string }[] = [];
    const hasDB = studioGraph.nodes.some((n) => n.type === 'database');
    const hasCache = studioGraph.nodes.some((n) => n.type === 'cache');
    const hasLB = studioGraph.nodes.some((n) => n.type === 'load_balancer');
    const appServers = studioGraph.nodes.filter((n) => n.type === 'service');

    if (hasDB && !hasCache) {
      tips.push({
        type: 'warning',
        text: 'No Cache Detected: Your Database takes 100% of read queries. Adding a Redis Cache can absorb 80–90% of traffic.',
      });
    }
    if (appServers.length > 1 && !hasLB) {
      tips.push({
        type: 'warning',
        text: 'Multiple App Servers without a Load Balancer: Traffic cannot be shared evenly across servers.',
      });
    }
    if (hasLB && appServers.length > 1) {
      tips.push({
        type: 'success',
        text: 'High Availability: Load Balancer is configured to distribute traffic across redundant app servers.',
      });
    }
    if (studioSimResult) {
      const overloaded = Object.entries(studioSimResult.nodes).filter(([, m]) => m.health === 'overloaded');
      if (overloaded.length > 0) {
        tips.push({
          type: 'warning',
          text: `Bottleneck Alert: ${overloaded.length} component(s) are overloaded! Scale replicas or add a cache to handle the traffic.`,
        });
      } else {
        tips.push({
          type: 'success',
          text: 'Smooth Operation: All components in your system are running within healthy capacity limits!',
        });
      }
    }
    return tips;
  }, [studioGraph, studioSimResult]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131313] text-white overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="bg-[#131313] border-b border-[#313131] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] font-bold">
            Interactive Architecture Sandbox
          </span>
          <h2 className="text-xl font-display font-black tracking-wider text-white">
            DESIGN STUDIO: BUILD YOUR OWN SYSTEM
          </h2>
        </div>

        <div className="flex items-center gap-3 font-mono">
          {/* Traffic slider */}
          <div className="flex items-center gap-2 bg-[#181818] border border-[#313131] px-3 py-1.5 rounded-12px text-xs uppercase tracking-verge-mono">
            <span className="text-[#949494]">Traffic:</span>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={trafficInput}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTrafficInput(val);
                useArchStore.setState({ studioTraffic: val });
              }}
              className="w-24 accent-[#3cffd0] cursor-pointer h-1.5 bg-[#2d2d2d] rounded"
            />
            <span className="text-[#3cffd0] font-bold">{trafficInput.toLocaleString()} req/s</span>
          </div>

          <button
            onClick={simulateStudio}
            className="bg-[#3cffd0] hover:bg-white text-black font-mono uppercase tracking-verge-mono font-bold text-xs px-5 py-2 rounded-24px transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            Simulate Traffic
          </button>

          <button
            onClick={handleReset}
            className="bg-[#2d2d2d] hover:bg-white hover:text-black text-[#e9e9e9] border border-[#313131] font-mono uppercase tracking-verge-mono font-semibold text-xs px-4 py-2 rounded-24px transition-all flex items-center gap-1"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Studio Body: Palette + Canvas + Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* Left Palette */}
        <div className="w-full lg:w-64 bg-[#131313] border-r border-[#313131] p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] font-bold block mb-1">
              Component Palette
            </span>
            <p className="text-[11px] text-[#949494]">
              Click any component below to add it into your architecture canvas.
            </p>
          </div>

          <div className="space-y-2">
            {palette.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => addStudioNode(item.type)}
                  className="w-full text-left p-2.5 rounded-12px bg-[#181818] hover:bg-[#202020] border border-[#313131] hover:border-[#3cffd0]/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-8px bg-[#131313] border border-[#313131] flex items-center justify-center text-[#3cffd0]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-[#3cffd0] transition-colors font-mono uppercase tracking-verge-mono">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#949494]">{item.desc}</div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-[#949494] group-hover:text-[#3cffd0]" />
                </button>
              );
            })}
          </div>

          {/* Starter Topologies */}
          <div className="pt-3 border-t border-[#313131] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#3cffd0] font-bold block">
              Starter Topologies
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs font-mono uppercase tracking-verge-mono">
              <button
                onClick={() => handleLoadTemplate('simple-app')}
                className="text-left px-3 py-1.5 rounded-12px bg-[#181818] hover:bg-[#252525] text-[#e9e9e9] border border-[#313131]"
              >
                2-Tier Web App
              </button>
              <button
                onClick={() => handleLoadTemplate('scaled-app')}
                className="text-left px-3 py-1.5 rounded-12px bg-[#181818] hover:bg-[#252525] text-[#e9e9e9] border border-[#313131]"
              >
                3-Tier with Cache
              </button>
            </div>
          </div>
        </div>

        {/* Center: React Flow Canvas */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0 bg-[#131313]">
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={studioNodeTypes}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onPaneClick={() => selectStudioNode(null)}
              fitView
              minZoom={0.3}
              maxZoom={1.8}
              deleteKeyCode="Delete"
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#2d2d2d" />
              <Controls
                showInteractive={false}
                className="!bg-[#2d2d2d] !border-[#313131] !rounded-20px overflow-hidden [&>button]:!bg-[#2d2d2d] [&>button]:!border-b-[#313131] [&>button]:!text-white hover:[&>button]:!bg-[#3cffd0] hover:[&>button]:!text-black"
              />
            </ReactFlow>

            {/* Helper tip overlay */}
            <div className="absolute top-4 left-4 bg-[#181818] border border-[#313131] px-3 py-1.5 rounded-12px text-[10px] font-mono uppercase tracking-verge-nano text-[#949494] pointer-events-none z-10">
              Tip: Drag nodes freely · Connect via handle → handle · Del to remove edge
            </div>
          </div>
        </div>

        {/* Right Sidebar: Inspector + Advisor */}
        <div className="w-full lg:w-80 bg-[#181818] border-l border-[#313131] p-4 flex flex-col space-y-4 shrink-0 overflow-y-auto z-10">

          {/* Selected Component Tuner */}
          {selectedNode ? (
            <div className="bg-[#131313] border border-[#313131] rounded-16px p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#313131] pb-2.5">
                <div>
                  <span className="text-[9px] uppercase tracking-verge-nano text-[#3cffd0] font-bold block">
                    {selectedNode.type}
                  </span>
                  <h4 className="font-bold text-sm text-white">{selectedNode.name}</h4>
                </div>
                <button
                  onClick={() => removeStudioNode(selectedNode.id)}
                  className="w-7 h-7 rounded-8px bg-[#181818] hover:bg-rose-900 border border-[#ff3366]/40 text-[#ff3366] flex items-center justify-center transition-all"
                  title="Delete node"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedMetrics && (
                <div className="bg-[#181818] p-2.5 rounded-8px border border-[#313131] grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#949494] block uppercase tracking-verge-nano text-[9px]">Load</span>
                    <span className="font-bold text-white block">
                      {Math.round(selectedMetrics.utilization * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[#949494] block uppercase tracking-verge-nano text-[9px]">Latency</span>
                    <span className="font-bold text-[#3cffd0] block">
                      {Math.round(selectedMetrics.latencyMs)} ms
                    </span>
                  </div>
                </div>
              )}

              {/* Replicas */}
              <div className="flex items-center justify-between text-xs uppercase tracking-verge-mono">
                <span className="text-[#949494]">Replicas:</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    onClick={() =>
                      updateStudioNode(selectedNode.id, {
                        replicas: Math.max(1, selectedNode.replicas - 1),
                      })
                    }
                    className="w-6 h-6 rounded bg-[#181818] border border-[#313131] text-white flex items-center justify-center hover:bg-[#252525]"
                  >
                    -
                  </button>
                  <span className="text-[#3cffd0] font-bold w-5 text-center">
                    ×{selectedNode.replicas}
                  </span>
                  <button
                    onClick={() =>
                      updateStudioNode(selectedNode.id, {
                        replicas: Math.min(10, selectedNode.replicas + 1),
                      })
                    }
                    className="w-6 h-6 rounded bg-[#181818] border border-[#313131] text-white flex items-center justify-center hover:bg-[#252525]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-center justify-between text-xs uppercase tracking-verge-mono">
                <span className="text-[#949494]">Capacity/node:</span>
                <span className="text-white font-bold">
                  {selectedNode.serviceRatePerReplica.toLocaleString()} rps
                </span>
              </div>

              {/* Cache hit rate (if applicable) */}
              {selectedNode.hitRate !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1 uppercase tracking-verge-mono">
                    <span className="text-[#949494]">Cache Hit Rate:</span>
                    <span className="text-[#3cffd0] font-bold">
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
                      updateStudioNode(selectedNode.id, {
                        hitRate: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#3cffd0] cursor-pointer h-1.5 bg-[#2d2d2d] rounded"
                  />
                </div>
              )}

              {/* Connect to other nodes */}
              <div className="pt-2 border-t border-[#313131]">
                <span className="text-[10px] font-mono uppercase tracking-verge-nano text-[#949494] block mb-1.5 font-bold">
                  Connect downstream to:
                </span>
                <div className="flex flex-wrap gap-1">
                  {studioGraph.nodes
                    .filter((n) => n.id !== selectedNode.id)
                    .map((target) => (
                      <button
                        key={target.id}
                        onClick={() => connectStudioNodes(selectedNode.id, target.id)}
                        className="px-2 py-1 rounded-8px bg-[#181818] hover:bg-[#252525] text-[10px] font-mono uppercase tracking-verge-mono text-[#e9e9e9] border border-[#313131]"
                      >
                        &rarr; {target.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#131313] border border-[#313131] rounded-16px p-4 text-center">
              <Info className="w-6 h-6 text-[#949494] mx-auto mb-1.5 opacity-50" />
              <h4 className="font-bold text-xs text-white font-mono uppercase tracking-verge-mono">No Component Selected</h4>
              <p className="text-[11px] text-[#949494] mt-1">
                Click a component on canvas to configure replicas, capacity, or connect it.
              </p>
            </div>
          )}

          {/* Architectural Advisor */}
          <div className="bg-[#131313] border border-[#313131] rounded-16px p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono uppercase tracking-verge-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#3cffd0]" />
              Architectural Advisor
            </div>

            <div className="space-y-2">
              {advisorTips.map((tip, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-12px text-[11px] leading-relaxed border ${
                    tip.type === 'warning'
                      ? 'bg-[#181818] border-[#ffb703]/40 text-[#ffb703]'
                      : tip.type === 'success'
                      ? 'bg-[#181818] border-[#3cffd0]/40 text-[#3cffd0]'
                      : 'bg-[#181818] border-[#313131] text-[#e9e9e9]'
                  }`}
                >
                  {tip.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, ExternalLink, Calculator, Activity, Clock, ShieldAlert } from 'lucide-react';
import { useArchStore } from '../../store/useArchStore';
import { VergeBadge } from '../../components/ui/VergePrimitives';

export const GlassBoxPanel: React.FC = () => {
  const selectedNodeId = useArchStore((s) => s.selectedNodeId);
  const selectNode = useArchStore((s) => s.selectNode);
  const activeBlueprint = useArchStore((s) => s.activeBlueprint);
  const currentResult = useArchStore((s) => s.currentResult);

  if (!selectedNodeId) return null;

  const nodeSpec = activeBlueprint.nodes.find((n) => n.id === selectedNodeId);
  const metrics = currentResult.nodes[selectedNodeId];

  if (!nodeSpec) return null;

  return (
    <div className="w-80 md:w-96 bg-[#181818] border-l border-[#313131] h-full flex flex-col p-5 overflow-y-auto text-white select-none">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-[#313131]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#3cffd0] uppercase tracking-verge-nano">
              Glass Box Telemetry
            </span>
            <VergeBadge variant={metrics?.health === 'overloaded' ? 'red' : metrics?.health === 'degraded' ? 'amber' : 'mint'}>
              {metrics?.health || 'UNKNOWN'}
            </VergeBadge>
          </div>
          <h3 className="font-bold text-lg text-white tracking-tight">{nodeSpec.name}</h3>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="p-1 rounded-full text-[#949494] hover:text-white hover:bg-[#2d2d2d] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      {nodeSpec.metadata?.description && (
        <p className="text-xs text-[#949494] mt-3 leading-relaxed">
          {nodeSpec.metadata.description}
        </p>
      )}

      {/* Live Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="bg-[#131313] p-3 rounded-12px border border-[#313131]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#949494] tracking-verge-nano">
              <Activity className="w-3 h-3 text-[#3cffd0]" />
              <span>Utilization (ρ)</span>
            </div>
            <div
              className={`text-xl font-bold font-mono mt-1 ${
                metrics.utilization >= 1.0
                  ? 'text-[#ff3366]'
                  : metrics.utilization >= 0.7
                  ? 'text-[#ffb703]'
                  : 'text-[#3cffd0]'
              }`}
            >
              {(metrics.utilization * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-[#131313] p-3 rounded-12px border border-[#313131]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#949494] tracking-verge-nano">
              <Clock className="w-3 h-3 text-[#3cffd0]" />
              <span>Total Latency</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {metrics.latencyMs}ms
            </div>
          </div>

          <div className="bg-[#131313] p-3 rounded-12px border border-[#313131]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#949494] tracking-verge-nano">
              <Calculator className="w-3 h-3 text-[#949494]" />
              <span>Served / sec</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {metrics.served} req/s
            </div>
          </div>

          <div className="bg-[#131313] p-3 rounded-12px border border-[#313131]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#949494] tracking-verge-nano">
              <ShieldAlert className="w-3 h-3 text-[#ff3366]" />
              <span>Dropped / sec</span>
            </div>
            <div
              className={`text-base font-bold font-mono mt-1 ${
                metrics.dropped > 0 ? 'text-[#ff3366]' : 'text-[#949494]'
              }`}
            >
              {metrics.dropped} req/s
            </div>
          </div>
        </div>
      )}

      {/* Glass Box Mathematical Proof */}
      {metrics && (
        <div className="bg-[#131313] border border-[#313131] rounded-12px p-3.5 my-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#3cffd0] uppercase tracking-verge-mono mb-2.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Mathematical Derivations</span>
          </div>

          <div className="space-y-2 text-[11px] font-mono">
            <div>
              <span className="text-[#949494] block text-[10px]">CAPACITY (μ):</span>
              <span className="text-[#e9e9e9]">{metrics.formula.capacityExpr}</span>
            </div>
            <div>
              <span className="text-[#949494] block text-[10px]">UTILIZATION (ρ = λ / μ):</span>
              <span className="text-[#e9e9e9]">{metrics.formula.utilExpr}</span>
            </div>
            <div>
              <span className="text-[#949494] block text-[10px]">M/M/1 DELAY + WAIT:</span>
              <span className="text-[#e9e9e9] break-words">{metrics.formula.latencyExpr}</span>
            </div>
            <div>
              <span className="text-[#949494] block text-[10px]">DROPPED RATE:</span>
              <span className="text-[#e9e9e9]">{metrics.formula.dropExpr}</span>
            </div>
          </div>
        </div>
      )}

      {/* Downstream Wait Explanation */}
      {metrics && metrics.downstreamWaitMs > 0 && (
        <div className="p-3 bg-[#5200ff]/10 border border-[#5200ff]/40 rounded-12px text-xs text-[#e9e9e9] mt-2">
          <span className="font-bold text-[#3cffd0] font-mono block mb-1">
            SYNC DOWNSTREAM DEPENDENCY
          </span>
          This component spends <span className="font-bold text-white">{metrics.downstreamWaitMs}ms</span> waiting synchronously for downstream child responses.
        </div>
      )}

      {/* Disclaimer / Citation */}
      <div className="mt-auto pt-4 border-t border-[#313131] text-[10px] text-[#949494] font-mono leading-relaxed">
        <div className="flex items-center gap-1 text-[#3cffd0] mb-1">
          <ExternalLink className="w-3 h-3" />
          <span>REAL-WORLD GROUNDING</span>
        </div>
        Inspired by public engineering talks. Metrics are illustrative for teaching queueing and saturation mechanics.
      </div>
    </div>
  );
};

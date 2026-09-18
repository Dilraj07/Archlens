import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
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
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { NodeMetrics, NodeSpec, NodeType } from '../../engine/types';
import { useArchStore } from '../../store/useArchStore';

export interface ArchNodeData {
  spec: NodeSpec;
  metrics?: NodeMetrics;
  isMaskedInIncident?: boolean;
  isCriticalPath?: boolean;
}

const TYPE_ICONS: Record<NodeType, React.ElementType> = {
  client: Smartphone,
  cdn: Globe,
  load_balancer: Layers,
  service: Server,
  cache: HardDrive,
  database: Database,
  queue: MessageSquare,
  worker: Cpu,
  external: Globe,
  rate_limiter: Shield,
};

export const ArchNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as ArchNodeData;
  const { spec, metrics, isMaskedInIncident } = nodeData;

  const selectNode = useArchStore((s) => s.selectNode);
  const inspectNodeInIncident = useArchStore((s) => s.inspectNodeInIncident);
  const activeIncident = useArchStore((s) => s.activeIncident);
  const inspectBudget = useArchStore((s) => s.inspectBudgetRemaining);

  const Icon = TYPE_ICONS[spec.type] || Server;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIncident && isMaskedInIncident) {
      inspectNodeInIncident(id);
    } else {
      selectNode(id);
    }
  };

  // Node health styling
  let borderClass = 'border-[#313131]';
  let badgeColor = 'bg-[#2d2d2d] text-[#949494]';
  let HealthIcon = CheckCircle2;
  let healthLabel = 'HEALTHY';

  if (isMaskedInIncident) {
    borderClass = 'border-[#313131] border-dashed bg-[#1a1a1a]/80';
    badgeColor = 'bg-[#2d2d2d] text-[#949494]';
    HealthIcon = HelpCircle;
    healthLabel = 'MASKED';
  } else if (metrics) {
    switch (metrics.health) {
      case 'healthy':
        borderClass = 'border-[#3cffd0]/70 bg-[#131313]';
        badgeColor = 'bg-[#3cffd0]/20 text-[#3cffd0] border border-[#3cffd0]/40';
        HealthIcon = CheckCircle2;
        healthLabel = 'HEALTHY';
        break;
      case 'degraded':
        borderClass = 'border-[#ffb703] bg-[#131313]';
        badgeColor = 'bg-[#ffb703]/20 text-[#ffb703] border border-[#ffb703]/50';
        HealthIcon = AlertTriangle;
        healthLabel = 'DEGRADED';
        break;
      case 'overloaded':
        borderClass = 'border-[#ff3366] bg-[#131313] shadow-[0_0_15px_rgba(255,51,102,0.2)]';
        badgeColor = 'bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366] animate-alert';
        HealthIcon = XCircle;
        healthLabel = 'CRITICAL';
        break;
      case 'down':
        borderClass = 'border-red-900/50 bg-[#151515] opacity-60';
        badgeColor = 'bg-red-950 text-red-400';
        HealthIcon = XCircle;
        healthLabel = 'OFFLINE';
        break;
    }
  }

  if (selected) {
    borderClass += ' ring-2 ring-white ring-offset-2 ring-offset-[#131313]';
  }

  return (
    <div
      onClick={handleClick}
      className={`min-w-[210px] rounded-20px p-3.5 border transition-all duration-200 cursor-pointer ${borderClass} relative group select-none`}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#3cffd0] !w-2.5 !h-2.5 !border-[#131313]"
      />

      {/* Header: Type Kicker & Health Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-[#949494] text-[10px] font-mono uppercase tracking-verge-nano">
          <Icon className="w-3.5 h-3.5 text-[#3cffd0]" />
          <span>{spec.type.replace('_', ' ')}</span>
        </div>
        <div
          className={`flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-verge-nano ${badgeColor}`}
        >
          <HealthIcon className="w-3 h-3" />
          <span>{healthLabel}</span>
        </div>
      </div>

      {/* Title & Replicas */}
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="font-bold text-white text-sm tracking-tight truncate max-w-[140px]" title={spec.name}>
          {spec.name}
        </h4>
        {spec.replicas > 1 && (
          <span className="font-mono text-[10px] text-[#e9e9e9] bg-[#2d2d2d] px-1.5 py-0.5 rounded-4px border border-[#313131]">
            ×{spec.replicas}
          </span>
        )}
      </div>

      {/* Body: Telemetry or Masked prompt */}
      {isMaskedInIncident ? (
        <div className="mt-1 pt-2 border-t border-[#313131]/60">
          <div className="text-[11px] font-mono text-[#949494] flex items-center justify-between">
            <span>Telemetry: Hidden</span>
            <span className="text-[#3cffd0] font-bold group-hover:underline">
              Inspect {inspectBudget > 0 ? `(${inspectBudget} left)` : ''}
            </span>
          </div>
        </div>
      ) : metrics ? (
        <div className="mt-1 pt-2 border-t border-[#313131]/60 grid grid-cols-2 gap-2 text-left font-mono">
          <div>
            <div className="text-[9px] uppercase tracking-verge-nano text-[#949494]">Utilization</div>
            <div
              className={`text-xs font-bold ${
                metrics.utilization >= 1.0
                  ? 'text-[#ff3366]'
                  : metrics.utilization >= 0.7
                  ? 'text-[#ffb703]'
                  : 'text-[#3cffd0]'
              }`}
            >
              {Math.round(metrics.utilization * 100)}%
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-verge-nano text-[#949494]">Latency</div>
            <div className="text-xs font-bold text-white">{metrics.latencyMs}ms</div>
          </div>
        </div>
      ) : null}

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#3cffd0] !w-2.5 !h-2.5 !border-[#131313]"
      />
    </div>
  );
});

ArchNode.displayName = 'ArchNode';

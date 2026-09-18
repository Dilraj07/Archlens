import { NodeHealth, NodeMetrics, NodeSpec } from './types';

/**
 * Calculates raw capacity (mu) for a node.
 */
export function calculateCapacity(node: NodeSpec): number {
  if (!node.enabled || node.replicas <= 0) {
    return 0;
  }
  return node.serviceRatePerReplica * node.replicas;
}

/**
 * Computes single-node queueing delay and utilization (M/M/1-inspired).
 */
export function calculateNodeMetrics(
  node: NodeSpec,
  offeredLoad: number,
  downstreamWaitMs = 0
): NodeMetrics {
  const capacity = calculateCapacity(node);
  const served = Math.min(offeredLoad, capacity);
  const dropped = Math.max(0, offeredLoad - capacity);

  let utilization = 0;
  let selfLatency = node.baseLatencyMs;
  let health: NodeHealth = 'healthy';

  if (!node.enabled || node.replicas <= 0) {
    utilization = Infinity;
    selfLatency = 10000; // Timeout
    health = 'down';
  } else if (capacity > 0) {
    utilization = offeredLoad / capacity;
    // M/M/1 formula capped at rho = 0.95 to maintain stable upper bound
    const effectiveRho = Math.min(utilization, 0.95);
    selfLatency = node.baseLatencyMs / (1 - effectiveRho);

    if (utilization < 0.7) {
      health = 'healthy';
    } else if (utilization < 1.0) {
      health = 'degraded';
    } else {
      health = 'overloaded';
    }
  }

  // Round values for stable presentation
  const roundedOffered = Math.round(offeredLoad * 100) / 100;
  const roundedCapacity = Math.round(capacity * 100) / 100;
  const roundedServed = Math.round(served * 100) / 100;
  const roundedDropped = Math.round(dropped * 100) / 100;
  const roundedUtil = Math.round(utilization * 100) / 100;
  const roundedSelfLatency = Math.round(selfLatency * 10) / 10;
  const roundedWait = Math.round(downstreamWaitMs * 10) / 10;
  const totalLatency = Math.round((selfLatency + downstreamWaitMs) * 10) / 10;

  return {
    nodeId: node.id,
    capacity: roundedCapacity,
    offeredLoad: roundedOffered,
    served: roundedServed,
    dropped: roundedDropped,
    utilization: roundedUtil,
    selfLatencyMs: roundedSelfLatency,
    downstreamWaitMs: roundedWait,
    latencyMs: totalLatency,
    health,
    formula: {
      capacityExpr: `${node.replicas} replicas × ${node.serviceRatePerReplica} req/s = ${roundedCapacity} req/s`,
      utilExpr: `λ (${roundedOffered}) / μ (${roundedCapacity}) = ${roundedUtil}`,
      latencyExpr: `${node.baseLatencyMs}ms / (1 - min(${roundedUtil}, 0.95)) + wait(${roundedWait}ms) = ${totalLatency}ms`,
      dropExpr: `max(0, λ (${roundedOffered}) - μ (${roundedCapacity})) = ${roundedDropped} req/s`,
    },
  };
}

/**
 * Calculates how much flow a node forwards to a specific outgoing target node.
 */
export function calculateForwardedFlow(
  sourceNode: NodeSpec,
  servedFlow: number,
  targetId: string,
  totalOutgoingEdgesCount: number,
  edgeWeight = 1
): number {
  if (servedFlow <= 0) return 0;

  // Cache or CDN node
  if (sourceNode.type === 'cache' || sourceNode.type === 'cdn') {
    const hitRate = sourceNode.enabled && sourceNode.hitRate !== undefined ? sourceNode.hitRate : 0;
    // Only cache misses forward to downstream backends
    return Math.round(servedFlow * (1 - hitRate) * 100) / 100;
  }

  // Load Balancer
  if (sourceNode.type === 'load_balancer') {
    return totalOutgoingEdgesCount > 0
      ? Math.round(((servedFlow * edgeWeight) / totalOutgoingEdgesCount) * 100) / 100
      : 0;
  }

  // Fanout routing
  if (sourceNode.fanout && sourceNode.fanout[targetId] !== undefined) {
    return Math.round(servedFlow * sourceNode.fanout[targetId] * 100) / 100;
  }

  // Standard 1:1 forwarding
  return Math.round(servedFlow * 100) / 100;
}

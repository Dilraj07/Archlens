import { SimResult, StateDelta } from './types';

/**
 * Computes the exact mathematical difference between two simulation runs.
 * Provides the grounding context for the AI tutor and post-mortem replays.
 */
export function diff(before: SimResult, after: SimResult): StateDelta {
  const latencyDiffMs = Math.round((after.system.userLatencyMs - before.system.userLatencyMs) * 10) / 10;
  const latencyDiffPercent =
    before.system.userLatencyMs > 0
      ? Math.round((latencyDiffMs / before.system.userLatencyMs) * 1000) / 10
      : 0;

  const errorRateDiff = Math.round((after.system.errorRate - before.system.errorRate) * 1000) / 1000;
  const throughputDiff = Math.round((after.system.throughput - before.system.throughput) * 100) / 100;

  const nodeChanges: StateDelta['nodeChanges'] = {};
  let firstOverloadedNodeId: string | undefined;

  for (const nodeId of Object.keys(after.nodes)) {
    const beforeNode = before.nodes[nodeId];
    const afterNode = after.nodes[nodeId];

    if (beforeNode && afterNode) {
      const utilDiff = Math.round((afterNode.utilization - beforeNode.utilization) * 100) / 100;
      const nodeLatencyDiff = Math.round((afterNode.latencyMs - beforeNode.latencyMs) * 10) / 10;
      const droppedDiff = Math.round((afterNode.dropped - beforeNode.dropped) * 100) / 100;
      const healthChanged = beforeNode.health !== afterNode.health;

      nodeChanges[nodeId] = {
        utilDiff,
        latencyDiffMs: nodeLatencyDiff,
        droppedDiff,
        healthChanged,
        oldHealth: beforeNode.health,
        newHealth: afterNode.health,
      };

      if (!firstOverloadedNodeId && afterNode.health === 'overloaded') {
        firstOverloadedNodeId = nodeId;
      }
    }
  }

  // Determine cascade path: nodes whose health degraded or latency jumped, in order along critical path
  const cascadePath: string[] = [];
  for (const nodeId of after.criticalPath) {
    const change = nodeChanges[nodeId];
    if (change && (change.healthChanged || change.latencyDiffMs > 10 || change.droppedDiff > 0)) {
      cascadePath.push(nodeId);
    }
  }

  return {
    before,
    after,
    systemChanges: {
      latencyDiffMs,
      latencyDiffPercent,
      errorRateDiff,
      throughputDiff,
    },
    nodeChanges,
    firstOverloadedNodeId,
    cascadePath,
  };
}

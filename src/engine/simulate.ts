import { ArchGraph, NodeMetrics, NodeSpec, Scenario, SimResult, SystemMetrics } from './types';
import { topologicalSort, getOutgoingEdges, findSynchronousCriticalPath } from './topology';
import { calculateNodeMetrics, calculateForwardedFlow } from './nodeModels';

/**
 * Runs a deterministic simulation on an architecture graph given a traffic scenario.
 * Pure TypeScript, zero external dependencies, completes in < 1ms.
 */
export function simulate(graph: ArchGraph, scenario: Scenario): SimResult {
  const startTime = performance.now();

  // 1. Clone nodes and apply scenario overrides
  const nodeMap: Record<string, NodeSpec> = {};
  for (const node of graph.nodes) {
    const override = scenario.overrides?.[node.id] || {};
    nodeMap[node.id] = { ...node, ...override };
  }

  // 2. Determine execution order (topological sort)
  const sortedNodeIds = topologicalSort(graph);

  // 3. Track incoming traffic flows
  const incomingFlows: Record<string, number> = {};
  for (const id of sortedNodeIds) {
    incomingFlows[id] = 0;
  }

  // Base arrival at entry node
  const totalArrivalRate = scenario.usersConcurrent * scenario.requestsPerUserPerSec;
  incomingFlows[graph.entryNodeId] = totalArrivalRate;

  // 4. Forward pass: compute offered load and route forwarded flow
  const initialMetrics: Record<string, NodeMetrics> = {};

  for (const nodeId of sortedNodeIds) {
    const node = nodeMap[nodeId]!;
    const offered = incomingFlows[nodeId] || 0;
    const metrics = calculateNodeMetrics(node, offered, 0);
    initialMetrics[nodeId] = metrics;

    const outgoingEdges = getOutgoingEdges(graph, nodeId);
    for (const edge of outgoingEdges) {
      const forwarded = calculateForwardedFlow(
        node,
        metrics.served,
        edge.target,
        outgoingEdges.length,
        edge.weight || 1
      );
      incomingFlows[edge.target] = (incomingFlows[edge.target] || 0) + forwarded;
    }
  }

  // 5. Backward pass: compute downstream wait times for synchronous callers
  // If Service A synchronously calls Service B, A's perceived latency includes B's latency!
  const downstreamWaits: Record<string, number> = {};
  for (const id of sortedNodeIds) {
    downstreamWaits[id] = 0;
  }

  // Iterate in reverse topological order
  for (let i = sortedNodeIds.length - 1; i >= 0; i--) {
    const nodeId = sortedNodeIds[i]!;
    const outgoingSyncEdges = getOutgoingEdges(graph, nodeId).filter((e) => !e.isAsync);

    if (outgoingSyncEdges.length > 0) {
      // Downstream wait is max latency among synchronous children
      let maxChildLatency = 0;
      for (const edge of outgoingSyncEdges) {
        const childMetrics = initialMetrics[edge.target];
        if (childMetrics) {
          const childTotal = childMetrics.selfLatencyMs + (downstreamWaits[edge.target] || 0);
          if (childTotal > maxChildLatency) {
            maxChildLatency = childTotal;
          }
        }
      }
      downstreamWaits[nodeId] = maxChildLatency;
    }
  }

  // 6. Final node metrics with downstream wait incorporated
  const finalMetrics: Record<string, NodeMetrics> = {};
  for (const nodeId of sortedNodeIds) {
    const node = nodeMap[nodeId]!;
    const offered = incomingFlows[nodeId] || 0;
    const wait = downstreamWaits[nodeId] || 0;
    finalMetrics[nodeId] = calculateNodeMetrics(node, offered, wait);
  }

  // 7. Find synchronous critical path and calculate user perceived metrics
  const nodeLatencies: Record<string, number> = {};
  for (const [id, m] of Object.entries(finalMetrics)) {
    nodeLatencies[id] = m.selfLatencyMs;
  }
  const criticalPath = findSynchronousCriticalPath(graph, nodeLatencies);

  // Synchronous user latency = sum of self latency on the critical path
  let userLatencyMs = 0;
  for (const pathNodeId of criticalPath) {
    userLatencyMs += finalMetrics[pathNodeId]?.selfLatencyMs || 0;
  }
  userLatencyMs = Math.round(userLatencyMs * 10) / 10;

  // System error rate: product of success rates along critical path
  let successRatio = 1.0;
  for (const pathNodeId of criticalPath) {
    const m = finalMetrics[pathNodeId];
    if (m && m.offeredLoad > 0) {
      const nodeSuccessRate = m.served / m.offeredLoad;
      successRatio *= nodeSuccessRate;
    }
  }
  const errorRate = Math.round((1.0 - successRatio) * 1000) / 1000;

  // Throughput: served rate at sink nodes of the critical path
  const sinkNodeId = criticalPath[criticalPath.length - 1];
  const throughput = sinkNodeId ? finalMetrics[sinkNodeId]?.served || 0 : 0;

  // Find bottleneck node (highest utilization or first overloaded)
  let maxUtil = -1;
  let bottleneckNodeId: string | undefined;
  for (const [id, m] of Object.entries(finalMetrics)) {
    if (m.utilization > maxUtil) {
      maxUtil = m.utilization;
      bottleneckNodeId = id;
    }
  }

  let status: SystemMetrics['status'] = 'healthy';
  if (errorRate > 0.03 || Object.values(finalMetrics).some((m) => m.health === 'overloaded')) {
    status = 'incident';
  } else if (Object.values(finalMetrics).some((m) => m.health === 'degraded')) {
    status = 'degraded';
  }

  const system: SystemMetrics = {
    totalArrivalRate: Math.round(totalArrivalRate * 100) / 100,
    userLatencyMs,
    errorRate,
    throughput: Math.round(throughput * 100) / 100,
    bottleneckNodeId,
    status,
  };

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    graphId: graph.id,
    nodes: finalMetrics,
    system,
    criticalPath,
    executionTimeMs,
  };
}

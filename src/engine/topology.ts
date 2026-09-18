import { ArchGraph, EdgeSpec } from './types';

export class CycleDetectedError extends Error {
  public cycleNodes: string[];

  constructor(message: string, cycleNodes: string[] = []) {
    super(message);
    this.name = 'CycleDetectedError';
    this.cycleNodes = cycleNodes;
  }
}

/**
 * Topologically sorts the nodes of an ArchGraph using Kahn's algorithm.
 * Throws CycleDetectedError if a directed cycle is present.
 */
export function topologicalSort(graph: ArchGraph): string[] {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  // Initialize
  for (const node of graph.nodes) {
    inDegree[node.id] = 0;
    adjList[node.id] = [];
  }

  // Populate edges
  for (const edge of graph.edges) {
    if (inDegree[edge.target] !== undefined) {
      inDegree[edge.target]++;
    }
    if (adjList[edge.source] !== undefined) {
      adjList[edge.source].push(edge.target);
    }
  }

  // Queue nodes with 0 in-degree
  const queue: string[] = [];
  for (const [nodeId, deg] of Object.entries(inDegree)) {
    if (deg === 0) {
      queue.push(nodeId);
    }
  }

  const sorted: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const neighbors = adjList[current] || [];
    for (const neighbor of neighbors) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (sorted.length !== graph.nodes.length) {
    const unresolved = Object.keys(inDegree).filter((id) => inDegree[id] > 0);
    throw new CycleDetectedError(
      `Cycle detected in architecture graph. Nodes involved: ${unresolved.join(', ')}`,
      unresolved
    );
  }

  return sorted;
}

/**
 * Returns outgoing edges from a specific node.
 */
export function getOutgoingEdges(graph: ArchGraph, nodeId: string): EdgeSpec[] {
  return graph.edges.filter((e) => e.source === nodeId);
}

/**
 * Returns incoming edges to a specific node.
 */
export function getIncomingEdges(graph: ArchGraph, nodeId: string): EdgeSpec[] {
  return graph.edges.filter((e) => e.target === nodeId);
}

/**
 * Determines the synchronous critical path from entryNodeId to sink nodes.
 * Strictly ignores edges with isAsync: true (e.g. queues, background analytics).
 */
export function findSynchronousCriticalPath(
  graph: ArchGraph,
  nodeLatencies: Record<string, number>
): string[] {
  const entry = graph.entryNodeId;
  const syncEdges = graph.edges.filter((e) => !e.isAsync);

  const adj: Record<string, string[]> = {};
  for (const node of graph.nodes) {
    adj[node.id] = [];
  }
  for (const e of syncEdges) {
    adj[e.source]?.push(e.target);
  }

  // Memoized DFS to find path with highest cumulative latency
  const memo: Record<string, { latency: number; path: string[] }> = {};

  function dfs(nodeId: string): { latency: number; path: string[] } {
    if (memo[nodeId]) return memo[nodeId];

    const currentLatency = nodeLatencies[nodeId] || 0;
    const children = adj[nodeId] || [];

    if (children.length === 0) {
      const result = { latency: currentLatency, path: [nodeId] };
      memo[nodeId] = result;
      return result;
    }

    let maxChildLatency = -1;
    let bestChildPath: string[] = [];

    for (const child of children) {
      const childRes = dfs(child);
      if (childRes.latency > maxChildLatency) {
        maxChildLatency = childRes.latency;
        bestChildPath = childRes.path;
      }
    }

    const result = {
      latency: currentLatency + (maxChildLatency > 0 ? maxChildLatency : 0),
      path: [nodeId, ...bestChildPath],
    };
    memo[nodeId] = result;
    return result;
  }

  return dfs(entry).path;
}

import { ArchGraph, StateDelta } from '../engine/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that an AI tutor response does not hallucinate numbers or node IDs.
 * Every referenced number must match a simulation StateDelta value within +-2% tolerance.
 */
export function validateTutorResponse(
  numbersUsed: number[],
  nodeIdsReferenced: string[],
  delta: StateDelta,
  graph: ArchGraph
): ValidationResult {
  const errors: string[] = [];

  // Collect all verified numbers from the simulation StateDelta
  const validNumbers: number[] = [
    delta.before.system.totalArrivalRate,
    delta.before.system.userLatencyMs,
    delta.before.system.errorRate,
    delta.before.system.throughput,
    delta.after.system.totalArrivalRate,
    delta.after.system.userLatencyMs,
    delta.after.system.errorRate,
    delta.after.system.throughput,
    delta.systemChanges.latencyDiffMs,
    delta.systemChanges.latencyDiffPercent,
    delta.systemChanges.errorRateDiff,
    delta.systemChanges.throughputDiff,
  ];

  for (const node of Object.values(delta.after.nodes)) {
    validNumbers.push(
      node.capacity,
      node.offeredLoad,
      node.served,
      node.dropped,
      node.utilization,
      node.latencyMs,
      node.selfLatencyMs,
      node.downstreamWaitMs
    );
  }

  // 1. Verify Node IDs
  const validNodeIds = new Set(graph.nodes.map((n) => n.id));
  for (const id of nodeIdsReferenced) {
    if (!validNodeIds.has(id)) {
      errors.push(`Referenced node '${id}' does not exist in architecture graph.`);
    }
  }

  // 2. Verify Numbers (within +-2% tolerance)
  for (const candidate of numbersUsed) {
    // Ignore small integers (like 1, 2, 3, 4, 10, 100 for percentage references)
    if (candidate <= 4 || candidate === 100) continue;

    const matched = validNumbers.some((val) => {
      if (val === 0 && candidate === 0) return true;
      const relativeDiff = Math.abs(candidate - val) / (Math.abs(val) || 1);
      return relativeDiff <= 0.02; // 2% relative tolerance
    });

    if (!matched) {
      errors.push(
        `Number '${candidate}' does not match any simulation ground-truth metric within 2% tolerance.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

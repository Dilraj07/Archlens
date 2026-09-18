import { describe, it, expect } from 'vitest';
import { validateTutorResponse } from '../validate';
import { checkIncidentSpoiler } from '../spoilerGuard';
import { ArchGraph, StateDelta } from '../../engine/types';
import { Incident } from '../../content';

describe('Responsible AI: Numeric & Node ID Validator', () => {
  const mockGraph: ArchGraph = {
    id: 'test-graph',
    name: 'Test Graph',
    description: 'Graph for testing',
    entryNodeId: 'client',
    nodes: [
      { id: 'client', name: 'Client', type: 'client', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 0, enabled: true },
      { id: 'app', name: 'App Server', type: 'service', serviceRatePerReplica: 1000, replicas: 2, baseLatencyMs: 15, enabled: true },
    ],
    edges: [{ id: 'e1', source: 'client', target: 'app' }],
  };

  const mockDelta: StateDelta = {
    before: {
      graphId: 'test-graph',
      nodes: {},
      system: { totalArrivalRate: 1000, userLatencyMs: 25, errorRate: 0, throughput: 1000, status: 'healthy' },
      criticalPath: ['client', 'app'],
      executionTimeMs: 0.1,
    },
    after: {
      graphId: 'test-graph',
      nodes: {
        app: {
          nodeId: 'app',
          capacity: 2000,
          offeredLoad: 5000,
          served: 2000,
          dropped: 3000,
          utilization: 2.5,
          selfLatencyMs: 250,
          downstreamWaitMs: 0,
          latencyMs: 250,
          health: 'overloaded',
          formula: { capacityExpr: '', utilExpr: '', latencyExpr: '', dropExpr: '' },
        },
      },
      system: { totalArrivalRate: 5000, userLatencyMs: 250, errorRate: 0.6, throughput: 2000, status: 'incident' },
      criticalPath: ['client', 'app'],
      executionTimeMs: 0.1,
    },
    systemChanges: {
      latencyDiffMs: 225,
      latencyDiffPercent: 900,
      errorRateDiff: 0.6,
      throughputDiff: 1000,
    },
    nodeChanges: {},
    firstOverloadedNodeId: 'app',
    cascadePath: ['app'],
  };

  it('accepts numbers that match simulation StateDelta within 2% tolerance', () => {
    // 5000 arrival, 2000 capacity, 3000 dropped, 250ms latency
    const valid = validateTutorResponse([5000, 2000, 3000, 250], ['app'], mockDelta, mockGraph);
    expect(valid.isValid).toBe(true);
    expect(valid.errors.length).toBe(0);
  });

  it('rejects hallucinated numbers not present in simulation', () => {
    // 9999 is hallucinated
    const invalid = validateTutorResponse([9999], ['app'], mockDelta, mockGraph);
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors[0]).toContain('does not match any simulation ground-truth');
  });

  it('rejects non-existent node IDs', () => {
    const invalidNode = validateTutorResponse([5000], ['non_existent_node'], mockDelta, mockGraph);
    expect(invalidNode.isValid).toBe(false);
    expect(invalidNode.errors[0]).toContain("node 'non_existent_node' does not exist");
  });
});

describe('Responsible AI: Incident Mode Spoiler Guard', () => {
  const mockIncident: Incident = {
    id: 'i1-test',
    blueprintId: 'tatkal',
    title: 'Test Incident',
    concepts: ['caching'],
    pageAlert: 'Errors climbing',
    baseline: { usersConcurrent: 1000, requestsPerUserPerSec: 1 },
    hiddenFault: {
      type: 'cache_flush',
      targetNodeId: 'seat_cache',
      paramKey: 'hitRate',
      faultValue: 0.1,
      description: 'Flushed cache',
    },
    answer: {
      rootCauseNode: 'seat_cache',
      causeType: 'cache_miss_storm',
    },
    spoilerTerms: ['cache flush', 'hit rate collapsed'],
    inspectBudget: 5,
    redHerrings: ['app'],
    fix: { palette: [], goal: {} },
    postMortemLesson: 'Downstream waits cascade',
  };

  it('detects and blocks candidate responses mentioning root cause node ID', () => {
    const candidate = 'You should check the seat_cache directly because it failed.';
    const check = checkIncidentSpoiler(candidate, mockIncident);
    expect(check.hasSpoiler).toBe(true);
    expect(check.detectedSpoilers[0]).toContain('seat_cache');
  });

  it('detects and blocks candidate responses mentioning cause type', () => {
    const candidate = 'This looks like a cache miss storm causing DB saturation.';
    const check = checkIncidentSpoiler(candidate, mockIncident);
    expect(check.hasSpoiler).toBe(true);
    expect(check.detectedSpoilers[0]).toContain('cache_miss_storm');
  });

  it('detects and blocks candidate responses mentioning blacklist spoiler terms', () => {
    const candidate = 'Someone triggered a cache flush during the 10:00 AM window.';
    const check = checkIncidentSpoiler(candidate, mockIncident);
    expect(check.hasSpoiler).toBe(true);
    expect(check.detectedSpoilers[0]).toContain('cache flush');
  });

  it('permits safe pedagogical guidance that encourages student investigation', () => {
    const candidate = 'Notice the upstream application servers. Are they slow because of local overload or downstream wait times?';
    const check = checkIncidentSpoiler(candidate, mockIncident);
    expect(check.hasSpoiler).toBe(false);
  });
});

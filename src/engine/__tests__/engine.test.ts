import { describe, it, expect } from 'vitest';
import { ArchGraph, Scenario } from '../types';
import { calculateCapacity, calculateNodeMetrics, calculateForwardedFlow } from '../nodeModels';
import { topologicalSort, CycleDetectedError, findSynchronousCriticalPath } from '../topology';
import { simulate } from '../simulate';
import { diff } from '../diff';
import { gradePrediction, checkGoal, gradeDiagnosis } from '../grade';
import { createDefaultReviewLog, recordConceptReview, getDueConcepts } from '../scheduler';

describe('Simulation Engine: Node Models', () => {
  it('calculates capacity correctly for enabled and disabled nodes', () => {
    const node = {
      id: 'srv-1',
      name: 'App Server',
      type: 'service' as const,
      serviceRatePerReplica: 250,
      replicas: 4,
      baseLatencyMs: 15,
      enabled: true,
    };
    expect(calculateCapacity(node)).toBe(1000);

    const disabledNode = { ...node, enabled: false };
    expect(calculateCapacity(disabledNode)).toBe(0);

    const zeroReplicas = { ...node, replicas: 0 };
    expect(calculateCapacity(zeroReplicas)).toBe(0);
  });

  it('calculates M/M/1 utilization and health status classification', () => {
    const node = {
      id: 'db-1',
      name: 'Primary DB',
      type: 'database' as const,
      serviceRatePerReplica: 500,
      replicas: 1,
      baseLatencyMs: 20,
      enabled: true,
    };

    // Under-utilized (rho = 0.40 -> Healthy)
    const lowLoad = calculateNodeMetrics(node, 200);
    expect(lowLoad.utilization).toBe(0.4);
    expect(lowLoad.health).toBe('healthy');
    expect(lowLoad.dropped).toBe(0);

    // Degraded (rho = 0.80 -> Degraded)
    const midLoad = calculateNodeMetrics(node, 400);
    expect(midLoad.utilization).toBe(0.8);
    expect(midLoad.health).toBe('degraded');
    expect(midLoad.dropped).toBe(0);

    // Overloaded (rho = 1.40 -> Overloaded, 200 dropped)
    const overLoad = calculateNodeMetrics(node, 700);
    expect(overLoad.utilization).toBe(1.4);
    expect(overLoad.health).toBe('overloaded');
    expect(overLoad.dropped).toBe(200);
    expect(overLoad.served).toBe(500);
  });

  it('handles cache hit forwarding and bypass', () => {
    const cacheNode = {
      id: 'cache-1',
      name: 'Redis',
      type: 'cache' as const,
      serviceRatePerReplica: 10000,
      replicas: 1,
      baseLatencyMs: 2,
      enabled: true,
      hitRate: 0.85, // 85% cache hit
    };

    // Forwarded flow should only be the 15% cache miss
    const forwarded = calculateForwardedFlow(cacheNode, 1000, 'db-1', 1);
    expect(forwarded).toBe(150);

    // If cache is disabled, hit rate becomes 0 -> 100% forwarded
    const disabledCache = { ...cacheNode, enabled: false };
    const forwardedBypass = calculateForwardedFlow(disabledCache, 1000, 'db-1', 1);
    expect(forwardedBypass).toBe(1000);
  });

  it('splits load evenly across load balancer targets', () => {
    const lbNode = {
      id: 'lb-1',
      name: 'NGINX LB',
      type: 'load_balancer' as const,
      serviceRatePerReplica: 50000,
      replicas: 2,
      baseLatencyMs: 1,
      enabled: true,
    };

    const target1Flow = calculateForwardedFlow(lbNode, 3000, 'srv-1', 3, 1);
    expect(target1Flow).toBe(1000);
  });
});

describe('Simulation Engine: Topology & Graph Analysis', () => {
  const sampleGraph: ArchGraph = {
    id: 'test-graph',
    name: 'Test Topology',
    description: 'Simple test graph',
    entryNodeId: 'client',
    nodes: [
      { id: 'client', name: 'Client', type: 'client', serviceRatePerReplica: 100000, replicas: 1, baseLatencyMs: 0, enabled: true },
      { id: 'lb', name: 'Load Balancer', type: 'load_balancer', serviceRatePerReplica: 50000, replicas: 1, baseLatencyMs: 2, enabled: true },
      { id: 'app', name: 'App Server', type: 'service', serviceRatePerReplica: 1000, replicas: 2, baseLatencyMs: 10, enabled: true },
      { id: 'db', name: 'Database', type: 'database', serviceRatePerReplica: 800, replicas: 1, baseLatencyMs: 25, enabled: true },
    ],
    edges: [
      { id: 'e1', source: 'client', target: 'lb' },
      { id: 'e2', source: 'lb', target: 'app' },
      { id: 'e3', source: 'app', target: 'db' },
    ],
  };

  it('performs topological sort accurately', () => {
    const order = topologicalSort(sampleGraph);
    expect(order).toEqual(['client', 'lb', 'app', 'db']);
  });

  it('detects cycles and throws CycleDetectedError', () => {
    const cyclicGraph: ArchGraph = {
      ...sampleGraph,
      edges: [
        ...sampleGraph.edges,
        { id: 'e-cycle', source: 'db', target: 'app' }, // cycle between app and db!
      ],
    };

    expect(() => topologicalSort(cyclicGraph)).toThrowError(CycleDetectedError);
  });

  it('excludes async edges from synchronous critical path', () => {
    const graphWithQueue: ArchGraph = {
      ...sampleGraph,
      nodes: [
        ...sampleGraph.nodes,
        { id: 'queue', name: 'Message Queue', type: 'queue', serviceRatePerReplica: 5000, replicas: 1, baseLatencyMs: 5, enabled: true },
        { id: 'worker', name: 'Worker', type: 'worker', serviceRatePerReplica: 200, replicas: 1, baseLatencyMs: 2000, enabled: true },
      ],
      edges: [
        ...sampleGraph.edges,
        { id: 'e-async-1', source: 'app', target: 'queue', isAsync: true },
        { id: 'e-async-2', source: 'queue', target: 'worker', isAsync: true },
      ],
    };

    const latencies = { client: 0, lb: 2, app: 15, db: 35, queue: 5, worker: 2000 };
    const criticalPath = findSynchronousCriticalPath(graphWithQueue, latencies);

    expect(criticalPath).toEqual(['client', 'lb', 'app', 'db']);
    expect(criticalPath).not.toContain('queue');
    expect(criticalPath).not.toContain('worker');
  });
});

describe('Simulation Engine: Full Simulation & Diffing', () => {
  const tatkalMiniGraph: ArchGraph = {
    id: 'tatkal-mini',
    name: 'Tatkal Mini',
    description: 'Simplified ticket booking flow',
    entryNodeId: 'client',
    nodes: [
      { id: 'client', name: 'Web/App Client', type: 'client', serviceRatePerReplica: 100000, replicas: 1, baseLatencyMs: 0, enabled: true },
      { id: 'app', name: 'App Servers', type: 'service', serviceRatePerReplica: 500, replicas: 2, baseLatencyMs: 10, enabled: true },
      { id: 'cache', name: 'Seat Cache', type: 'cache', serviceRatePerReplica: 10000, replicas: 1, baseLatencyMs: 2, hitRate: 0.9, enabled: true },
      { id: 'db', name: 'Inventory DB', type: 'database', serviceRatePerReplica: 200, replicas: 1, baseLatencyMs: 20, enabled: true },
    ],
    edges: [
      { id: 'e1', source: 'client', target: 'app' },
      { id: 'e2', source: 'app', target: 'cache' },
      { id: 'e3', source: 'cache', target: 'db' },
    ],
  };

  it('simulates steady state traffic accurately', () => {
    const scenario: Scenario = {
      usersConcurrent: 500,
      requestsPerUserPerSec: 1, // 500 req/s
    };

    const result = simulate(tatkalMiniGraph, scenario);

    expect(result.system.totalArrivalRate).toBe(500);
    expect(result.system.errorRate).toBe(0);
    expect(result.nodes['app']?.health).toBe('healthy');
    // Cache absorbs 90% -> DB only sees 10% (50 req/s)
    expect(result.nodes['db']?.offeredLoad).toBe(50);
    expect(result.nodes['db']?.health).toBe('healthy');
  });

  it('detects bottlenecks and calculates state delta during traffic spikes', () => {
    const baselineScenario: Scenario = { usersConcurrent: 500, requestsPerUserPerSec: 1 };
    const spikeScenario: Scenario = { usersConcurrent: 3000, requestsPerUserPerSec: 1 }; // 3000 req/s vs app capacity 1000

    const baselineResult = simulate(tatkalMiniGraph, baselineScenario);
    const spikeResult = simulate(tatkalMiniGraph, spikeScenario);

    expect(spikeResult.nodes['app']?.health).toBe('overloaded');
    expect(spikeResult.system.errorRate).toBeGreaterThan(0.5);

    const delta = diff(baselineResult, spikeResult);
    expect(delta.firstOverloadedNodeId).toBe('app');
    expect(delta.systemChanges.errorRateDiff).toBeGreaterThan(0.5);
    expect(delta.nodeChanges['app']?.healthChanged).toBe(true);
  });
});

describe('Simulation Engine: Grading & Incident Scoring', () => {
  const mockSimResult = {
    graphId: 'g1',
    nodes: {
      app: {
        nodeId: 'app',
        capacity: 1000,
        offeredLoad: 2500,
        served: 1000,
        dropped: 1500,
        utilization: 2.5,
        selfLatencyMs: 200,
        downstreamWaitMs: 0,
        latencyMs: 200,
        health: 'overloaded' as const,
        formula: { capacityExpr: '', utilExpr: '', latencyExpr: '', dropExpr: '' },
      },
    },
    system: {
      totalArrivalRate: 2500,
      userLatencyMs: 200,
      errorRate: 0.6,
      throughput: 1000,
      bottleneckNodeId: 'app',
      status: 'incident' as const,
    },
    criticalPath: ['client', 'app'],
    executionTimeMs: 0.2,
  };

  it('grades node selection prediction deterministically', () => {
    const spec = {
      kind: 'select_node' as const,
      prompt: 'Which component fails first?',
      expectedNodeId: 'app',
      misconceptions: {
        cdn: 'CDN only serves static cache.',
      },
    };

    const correctGrade = gradePrediction(spec, 'app', mockSimResult);
    expect(correctGrade.correct).toBe(true);
    expect(correctGrade.score).toBe(100);

    const wrongGrade = gradePrediction(spec, 'cdn', mockSimResult);
    expect(wrongGrade.correct).toBe(false);
    expect(wrongGrade.explanation).toContain('CDN only serves static cache');
  });

  it('checks goal satisfaction for SLO targets', () => {
    const passingGoal = { p95LatencyMsMax: 500, errorRateMax: 0.05 };
    const failingResult = mockSimResult; // errorRate 0.6 > 0.05

    const check = checkGoal(passingGoal, failingResult);
    expect(check.pass).toBe(false);
    expect(check.failingReasons.length).toBeGreaterThan(0);
  });

  it('scores incident diagnosis with efficiency bonuses and penalties', () => {
    const incidentSpec = {
      id: 'i1',
      title: 'Tatkal Down',
      answer: {
        rootCauseNode: 'seat_cache',
        causeType: 'cache_miss_storm',
      },
      inspectBudget: 5,
      postMortemLesson: 'Downstream waits cascade upwards.',
    };

    // Perfect diagnosis with 3 checks used (within budget of 5)
    const perfectScore = gradeDiagnosis(
      { rootCauseNode: 'seat_cache', causeType: 'cache_miss_storm' },
      incidentSpec,
      3,
      0
    );
    expect(perfectScore.totalScore).toBe(100); // 50 root + 30 type + 20 efficiency
    expect(perfectScore.isRootCauseCorrect).toBe(true);

    // Correct diagnosis but used 2 hints (-10 pts) and exceeded budget (7 checks)
    const penalizedScore = gradeDiagnosis(
      { rootCauseNode: 'seat_cache', causeType: 'cache_miss_storm' },
      incidentSpec,
      7,
      2
    );
    expect(penalizedScore.totalScore).toBeLessThan(100);
    expect(penalizedScore.scoreBreakdown.hintsPenalty).toBe(10);
  });
});

describe('Simulation Engine: Leitner Spaced Repetition', () => {
  it('advances concept box on success and resets on error', () => {
    const baseLog = createDefaultReviewLog();
    expect(baseLog.concepts['caching']?.box).toBe(1);

    // Success -> box 2
    const successLog = recordConceptReview(baseLog, 'caching', true);
    expect(successLog.concepts['caching']?.box).toBe(2);
    expect(successLog.concepts['caching']?.consecutiveSuccesses).toBe(1);
    expect(successLog.currentStreak).toBe(1);

    // Error -> resets to box 1
    const errorLog = recordConceptReview(successLog, 'caching', false);
    expect(errorLog.concepts['caching']?.box).toBe(1);
    expect(errorLog.concepts['caching']?.consecutiveSuccesses).toBe(0);
  });

  it('prioritizes weakest concept for daily incident review', () => {
    const log = createDefaultReviewLog();
    log.concepts['queues']!.masteryScore = 80;
    log.concepts['diagnosis']!.masteryScore = 5;

    const due = getDueConcepts(log);
    expect(due[0]).toBe('diagnosis');
  });

  it('progresses through Leitner boxes across multi-day reviews', () => {
    let log = createDefaultReviewLog();
    const day1 = new Date('2026-09-19T10:00:00Z');
    log = recordConceptReview(log, 'spikes', true, day1);
    expect(log.concepts['spikes']?.box).toBe(2);

    const day2 = new Date('2026-09-20T10:00:00Z');
    log = recordConceptReview(log, 'spikes', true, day2);
    expect(log.concepts['spikes']?.box).toBe(3);

    const day3 = new Date('2026-09-23T10:00:00Z');
    log = recordConceptReview(log, 'spikes', true, day3);
    expect(log.concepts['spikes']?.box).toBe(4);
    expect(log.concepts['spikes']?.masteryScore).toBeGreaterThanOrEqual(70);
  });
});

describe('Simulation Engine: Cricket Blueprint & Content Validation', () => {
  it('simulates live cricket streaming architecture with edge CDN absorption', () => {
    const cricketGraph: ArchGraph = {
      id: 'cricket-test',
      name: 'Cricket Test',
      description: 'Test streaming',
      entryNodeId: 'client',
      nodes: [
        { id: 'client', name: 'Client', type: 'client', serviceRatePerReplica: 1000000, replicas: 1, baseLatencyMs: 0, enabled: true },
        { id: 'cdn', name: 'Edge CDN', type: 'cdn', serviceRatePerReplica: 250000, replicas: 2, baseLatencyMs: 15, hitRate: 0.98, enabled: true },
        { id: 'origin', name: 'Origin Packager', type: 'service', serviceRatePerReplica: 2000, replicas: 2, baseLatencyMs: 40, enabled: true },
      ],
      edges: [
        { id: 'e1', source: 'client', target: 'cdn' },
        { id: 'e2', source: 'cdn', target: 'origin' },
      ],
    };

    const scenario: Scenario = { usersConcurrent: 50000, requestsPerUserPerSec: 1 }; // 50,000 req/s
    const result = simulate(cricketGraph, scenario);

    expect(result.system.totalArrivalRate).toBe(50000);
    // 98% absorbed by CDN -> only 2% (1,000 req/s) hits origin (origin capacity = 4,000 req/s)
    expect(result.nodes['origin']?.offeredLoad).toBe(1000);
    expect(result.nodes['origin']?.utilization).toBe(0.25);
    expect(result.nodes['origin']?.health).toBe('healthy');
  });

  it('correctly grades slider predictions within tolerance threshold', () => {
    const sliderSpec = {
      kind: 'slider' as const,
      prompt: 'What % hits origin?',
      expectedNumericValue: 100,
      tolerancePercent: 10,
    };

    const mockRes = {
      graphId: 'c1',
      nodes: {},
      system: { totalArrivalRate: 1000, userLatencyMs: 50, errorRate: 0, throughput: 1000, status: 'healthy' as const },
      criticalPath: ['client'],
      executionTimeMs: 0.1,
    };

    // 95 is within 10% of 100
    const passGrade = gradePrediction(sliderSpec, 95, mockRes);
    expect(passGrade.correct).toBe(true);

    // 70 is outside 10% of 100
    const failGrade = gradePrediction(sliderSpec, 70, mockRes);
    expect(failGrade.correct).toBe(false);
  });

  it('correctly grades boolean predictions with Socratic explanation', () => {
    const boolSpec = {
      kind: 'boolean' as const,
      prompt: 'Do viewers notice? (Yes / No)',
      expectedBoolean: false,
    };

    const mockRes = {
      graphId: 'c1',
      nodes: {},
      system: { totalArrivalRate: 1000, userLatencyMs: 50, errorRate: 0, throughput: 1000, status: 'healthy' as const },
      criticalPath: ['client'],
      executionTimeMs: 0.1,
    };

    const pass = gradePrediction(boolSpec, false, mockRes);
    expect(pass.correct).toBe(true);

    const fail = gradePrediction(boolSpec, true, mockRes);
    expect(fail.correct).toBe(false);
  });

  it('propagates downstream wait times synchronously to upstream callers', () => {
    const multiTierGraph: ArchGraph = {
      id: 'wait-test',
      name: 'Wait Propagation',
      description: 'Test downstream wait',
      entryNodeId: 'client',
      nodes: [
        { id: 'client', name: 'Client', type: 'client', serviceRatePerReplica: 10000, replicas: 1, baseLatencyMs: 0, enabled: true },
        { id: 'gateway', name: 'API Gateway', type: 'load_balancer', serviceRatePerReplica: 10000, replicas: 1, baseLatencyMs: 5, enabled: true },
        { id: 'app', name: 'App Server', type: 'service', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 20, enabled: true },
        { id: 'db', name: 'Slow Database', type: 'database', serviceRatePerReplica: 100, replicas: 1, baseLatencyMs: 150, enabled: true },
      ],
      edges: [
        { id: 'e1', source: 'client', target: 'gateway' },
        { id: 'e2', source: 'gateway', target: 'app' },
        { id: 'e3', source: 'app', target: 'db' },
      ],
    };

    const res = simulate(multiTierGraph, { usersConcurrent: 50, requestsPerUserPerSec: 1 });
    // App server should have downstreamWaitMs reflecting DB latency
    expect(res.nodes['app']?.downstreamWaitMs).toBeGreaterThan(150);
    // Gateway should reflect App total latency
    expect(res.nodes['gateway']?.downstreamWaitMs).toBeGreaterThan(170);
  });

  it('handles zero traffic gracefully without division by zero', () => {
    const idleGraph: ArchGraph = {
      id: 'idle-test',
      name: 'Idle Graph',
      description: 'Zero traffic',
      entryNodeId: 'client',
      nodes: [
        { id: 'client', name: 'Client', type: 'client', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 0, enabled: true },
        { id: 'app', name: 'App Server', type: 'service', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 10, enabled: true },
      ],
      edges: [{ id: 'e1', source: 'client', target: 'app' }],
    };

    const res = simulate(idleGraph, { usersConcurrent: 0, requestsPerUserPerSec: 0 });
    expect(res.system.totalArrivalRate).toBe(0);
    expect(res.system.errorRate).toBe(0);
    expect(res.nodes['app']?.utilization).toBe(0);
    expect(res.nodes['app']?.health).toBe('healthy');
  });

  it('handles complete service outage with 100% error rate', () => {
    const outageGraph: ArchGraph = {
      id: 'outage-test',
      name: 'Outage Graph',
      description: 'Crashed backend',
      entryNodeId: 'client',
      nodes: [
        { id: 'client', name: 'Client', type: 'client', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 0, enabled: true },
        { id: 'app', name: 'App Server', type: 'service', serviceRatePerReplica: 1000, replicas: 0, baseLatencyMs: 10, enabled: false }, // Crashed!
      ],
      edges: [{ id: 'e1', source: 'client', target: 'app' }],
    };

    const res = simulate(outageGraph, { usersConcurrent: 100, requestsPerUserPerSec: 1 });
    expect(res.nodes['app']?.health).toBe('down');
    expect(res.system.errorRate).toBe(1);
    expect(res.system.status).toBe('incident');
  });

  it('topologically sorts graph with multiple independent branches', () => {
    const branchGraph: ArchGraph = {
      id: 'branch-graph',
      name: 'Branch Graph',
      description: 'Multi-branch flow',
      entryNodeId: 'client',
      nodes: [
        { id: 'client', name: 'Client', type: 'client', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 0, enabled: true },
        { id: 'branchA', name: 'Branch A', type: 'service', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 10, enabled: true },
        { id: 'branchB', name: 'Branch B', type: 'service', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 10, enabled: true },
        { id: 'sink', name: 'Sink', type: 'database', serviceRatePerReplica: 1000, replicas: 1, baseLatencyMs: 10, enabled: true },
      ],
      edges: [
        { id: 'e1', source: 'client', target: 'branchA' },
        { id: 'e2', source: 'client', target: 'branchB' },
        { id: 'e3', source: 'branchA', target: 'sink' },
        { id: 'e4', source: 'branchB', target: 'sink' },
      ],
    };

    const sorted = topologicalSort(branchGraph);
    expect(sorted[0]).toBe('client');
    expect(sorted[3]).toBe('sink');
    expect(sorted).toContain('branchA');
    expect(sorted).toContain('branchB');
  });
});

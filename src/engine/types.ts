export type NodeType =
  | 'client'
  | 'cdn'
  | 'load_balancer'
  | 'service'
  | 'cache'
  | 'database'
  | 'queue'
  | 'worker'
  | 'external'
  | 'rate_limiter';

export type NodeHealth = 'healthy' | 'degraded' | 'overloaded' | 'down';

export interface NodeSpec {
  id: string;
  name: string;
  type: NodeType;
  serviceRatePerReplica: number; // max req/s per replica
  replicas: number;
  baseLatencyMs: number;
  enabled: boolean;
  hitRate?: number; // for cache / CDN (0.0 to 1.0)
  fanout?: Record<string, number>; // ratio of incoming requests sent to specific child
  failoverNodeId?: string;
  isAsyncConsumer?: boolean;
  metadata?: {
    description?: string;
    sources?: string[];
    illustrative?: boolean;
  };
}

export interface EdgeSpec {
  id: string;
  source: string;
  target: string;
  isAsync?: boolean; // async edges (e.g. into message queues or analytics) excluded from user critical path
  weight?: number; // for load balancer routing weights
}

export interface ArchGraph {
  id: string;
  name: string;
  description: string;
  nodes: NodeSpec[];
  edges: EdgeSpec[];
  entryNodeId: string;
  exitNodeId?: string;
  metadata?: {
    citation?: string;
    inspiredBy?: string;
    disclaimer?: string;
  };
}

export interface Scenario {
  usersConcurrent: number;
  requestsPerUserPerSec: number;
  durationSeconds?: number;
  overrides?: Record<string, Partial<NodeSpec>>;
}

export interface NodeMetrics {
  nodeId: string;
  capacity: number; // mu
  offeredLoad: number; // lambda
  served: number;
  dropped: number;
  utilization: number; // rho
  selfLatencyMs: number;
  downstreamWaitMs: number;
  latencyMs: number; // total = self + downstreamWait
  health: NodeHealth;
  queueBacklog?: number;
  formula: {
    capacityExpr: string;
    utilExpr: string;
    latencyExpr: string;
    dropExpr: string;
  };
}

export interface SystemMetrics {
  totalArrivalRate: number; // lambda_in at client
  userLatencyMs: number; // synchronous critical path latency
  errorRate: number; // 0.0 to 1.0
  throughput: number; // successfully served requests at sink
  bottleneckNodeId?: string;
  status: 'healthy' | 'degraded' | 'incident';
}

export interface SimResult {
  graphId: string;
  nodes: Record<string, NodeMetrics>;
  system: SystemMetrics;
  criticalPath: string[];
  executionTimeMs: number;
}

export interface StateDelta {
  before: SimResult;
  after: SimResult;
  systemChanges: {
    latencyDiffMs: number;
    latencyDiffPercent: number;
    errorRateDiff: number;
    throughputDiff: number;
  };
  nodeChanges: Record<
    string,
    {
      utilDiff: number;
      latencyDiffMs: number;
      droppedDiff: number;
      healthChanged: boolean;
      oldHealth: NodeHealth;
      newHealth: NodeHealth;
    }
  >;
  firstOverloadedNodeId?: string;
  cascadePath: string[];
}

export interface MissionGoal {
  p95LatencyMsMax?: number;
  errorRateMax?: number; // e.g. 0.02 for 2%
  originUtilMax?: number; // e.g. 0.70
  queueBacklogMax?: number;
}

export interface GoalCheckResult {
  pass: boolean;
  metrics: {
    latencyPassed: boolean;
    errorRatePassed: boolean;
    customPassed: boolean;
  };
  failingReasons: string[];
}

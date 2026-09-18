import { z } from 'zod';

export const NodeTypeSchema = z.enum([
  'client',
  'cdn',
  'load_balancer',
  'service',
  'cache',
  'database',
  'queue',
  'worker',
  'external',
  'rate_limiter',
]);

export const NodeSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: NodeTypeSchema,
  serviceRatePerReplica: z.number().nonnegative(),
  replicas: z.number().int().nonnegative(),
  baseLatencyMs: z.number().nonnegative(),
  enabled: z.boolean(),
  hitRate: z.number().min(0).max(1).optional(),
  fanout: z.record(z.number().nonnegative()).optional(),
  failoverNodeId: z.string().optional(),
  isAsyncConsumer: z.boolean().optional(),
  metadata: z
    .object({
      description: z.string().optional(),
      sources: z.array(z.string()).optional(),
      illustrative: z.boolean().optional(),
    })
    .optional(),
});

export const EdgeSpecSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  isAsync: z.boolean().optional(),
  weight: z.number().positive().optional(),
});

export const ArchGraphSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  entryNodeId: z.string(),
  exitNodeId: z.string().optional(),
  nodes: z.array(NodeSpecSchema),
  edges: z.array(EdgeSpecSchema),
  metadata: z
    .object({
      citation: z.string().optional(),
      inspiredBy: z.string().optional(),
      disclaimer: z.string().optional(),
    })
    .optional(),
});

export const PredictionSchema = z.object({
  kind: z.enum(['select_node', 'direction', 'slider', 'boolean']),
  prompt: z.string(),
  expectedNodeId: z.string().optional(),
  expectedDirection: z.enum(['up', 'down', 'same']).optional(),
  expectedNumericValue: z.number().optional(),
  expectedBoolean: z.boolean().optional(),
  tolerancePercent: z.number().optional(),
  sliderMin: z.number().optional(),
  sliderMax: z.number().optional(),
  sliderUnit: z.string().optional(),
  options: z.array(z.string()).optional(),
  misconceptions: z.record(z.string()).optional(),
});

export const FixActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  type: z.enum(['enable', 'add_replica', 'restore_param', 'route_traffic']),
  targetNodeId: z.string(),
  paramKey: z.string().optional(),
  paramValue: z.any().optional(),
  replicaDelta: z.number().int().optional(),
});

export const GoalSchema = z.object({
  p95LatencyMsMax: z.number().optional(),
  errorRateMax: z.number().optional(),
  originUtilMax: z.number().optional(),
  queueBacklogMax: z.number().optional(),
});

export const GuidedMissionSchema = z.object({
  id: z.string(),
  blueprintId: z.string(),
  title: z.string(),
  concepts: z.array(z.string()),
  brief: z.string(),
  baseline: z.object({
    usersConcurrent: z.number(),
    requestsPerUserPerSec: z.number(),
  }),
  event: z.object({
    type: z.string(),
    usersConcurrent: z.number(),
    requestsPerUserPerSec: z.number(),
    description: z.string(),
  }),
  prediction: PredictionSchema,
  fix: z.object({
    palette: z.array(FixActionSchema),
    goal: GoalSchema,
  }),
});

export const IncidentScenarioSchema = z.object({
  id: z.string(),
  blueprintId: z.string(),
  title: z.string(),
  concepts: z.array(z.string()),
  pageAlert: z.string(),
  baseline: z.object({
    usersConcurrent: z.number(),
    requestsPerUserPerSec: z.number(),
  }),
  hiddenFault: z.object({
    type: z.string(),
    targetNodeId: z.string(),
    paramKey: z.string(),
    faultValue: z.any(),
    description: z.string(),
  }),
  answer: z.object({
    rootCauseNode: z.string(),
    causeType: z.string(),
  }),
  spoilerTerms: z.array(z.string()),
  inspectBudget: z.number().int().positive(),
  redHerrings: z.array(z.string()),
  fix: z.object({
    palette: z.array(FixActionSchema),
    goal: GoalSchema,
  }),
  postMortemLesson: z.string(),
});

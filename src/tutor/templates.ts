import { Mission, Incident } from '../content';
import { StateDelta } from '../engine/types';
import { PredictionGrade, IncidentGrade } from '../engine/grade';

/**
 * Deterministic, offline fallback explanations generated directly from engine math.
 * Guarantees zero hallucinations and 100% operation without API keys.
 */
export function getPredictionExplanationTemplate(
  mission: Mission,
  grade: PredictionGrade,
  delta: StateDelta
): string {
  const arrival = delta.after.system.totalArrivalRate;
  const bottleneckId = delta.firstOverloadedNodeId || delta.after.system.bottleneckNodeId || 'app';
  const bottleneckNode = delta.after.nodes[bottleneckId];

  if (grade.correct) {
    return `Verified simulation analysis: At ${arrival} req/s offered load, [${bottleneckId}] reached ${Math.round(
      (bottleneckNode?.utilization || 1) * 100
    )}% utilization, triggering ${bottleneckNode?.dropped || 0} req/s in dropped requests. System p95 latency jumped by +${
      delta.systemChanges.latencyDiffMs
    }ms. Your prediction accurately identified the saturation point.`;
  }

  const misconception =
    typeof grade.userValue === 'string' && mission.prediction.misconceptions?.[grade.userValue]
      ? mission.prediction.misconceptions[grade.userValue]
      : `[${grade.userValue}] was not the bottleneck.`;

  return `${misconception} Under ${arrival} req/s traffic, the bottleneck was actually [${bottleneckId}], which reached ${Math.round(
    (bottleneckNode?.utilization || 1) * 100
  )}% utilization and dropped ${bottleneckNode?.dropped || 0} req/s.`;
}

/**
 * Socratic investigative prompt for guided missions.
 */
export function getSocraticNudgeTemplate(mission: Mission): string {
  if (mission.id.includes('tatkal')) {
    return 'Consider dynamic vs static caching: When millions of users simultaneously search for remaining berths, does the CDN absorb dynamic inventory lookups, or do requests reach the app servers?';
  }
  if (mission.id.includes('cricket')) {
    return 'Think about video chunk distribution: If video chunk hit-rate collapses at the edge, what happens to the origin video packagers?';
  }
  return 'Review the incoming flow and node capacities along the critical path to identify where arrival rate exceeds service capacity.';
}

/**
 * Senior On-Call Mentor investigative question for Incident Mode.
 */
export function getIncidentMentorQuestionTemplate(
  _incident: Incident,
  revealedNodes: string[],
  delta: StateDelta
): string {
  if (revealedNodes.length === 0) {
    return 'We have an active incident: error rates are climbing on Tatkal bookings. Start by checking the entry gateway or the application servers to see where requests begin to queue.';
  }

  const lastInspectedId = revealedNodes[revealedNodes.length - 1]!;
  const node = delta.after.nodes[lastInspectedId];

  if (node && node.downstreamWaitMs > node.selfLatencyMs * 2) {
    return `Notice [${lastInspectedId}]: its self-processing time is only ${node.selfLatencyMs}ms, but downstream wait is ${node.downstreamWaitMs}ms! Is it slow because it is overloaded, or because it is blocked waiting on something downstream?`;
  }

  if (node && node.utilization >= 1.0) {
    return `[${lastInspectedId}] is saturated at ${Math.round(node.utilization * 100)}% utilization with ${node.dropped} req/s dropped. What caused this sudden surge of traffic to hit this specific component?`;
  }

  return 'Follow the telemetry downstream. Inspect the database and cache tiers to determine where the bottleneck originates.';
}

/**
 * Incident Post-Mortem narrative template based on simulation delta.
 */
export function getPostMortemSummaryTemplate(
  incident: Incident,
  grade: IncidentGrade,
  delta: StateDelta
): string {
  const cascade = delta.cascadePath.join(' → ');
  return `Incident Post-Mortem:
• Root Cause: ${incident.answer.rootCauseNode} (${incident.answer.causeType})
• Failure Cascade: ${cascade || 'Cache flush → DB saturation → App timeout cascade'}
• Inspections Used: ${grade.checksUsed} of ${incident.inspectBudget} budget
• Key Takeaway: ${incident.postMortemLesson}`;
}

import { GoalCheckResult, MissionGoal, SimResult } from './types';

export interface PredictionSpec {
  kind: 'select_node' | 'direction' | 'slider' | 'boolean';
  prompt: string;
  expectedNodeId?: string;
  expectedDirection?: 'up' | 'down' | 'same';
  expectedNumericValue?: number;
  expectedBoolean?: boolean;
  tolerancePercent?: number; // for slider
  misconceptions?: Record<string, string>;
}

export interface PredictionGrade {
  correct: boolean;
  score: number;
  expectedValue: unknown;
  userValue: unknown;
  explanation: string;
}

export interface DiagnosisSubmission {
  rootCauseNode: string;
  causeType: string;
}

export interface IncidentScenarioSpec {
  id: string;
  title: string;
  answer: {
    rootCauseNode: string;
    causeType: string;
  };
  inspectBudget: number;
  postMortemLesson: string;
}

export interface IncidentGrade {
  totalScore: number;
  isRootCauseCorrect: boolean;
  isCauseTypeCorrect: boolean;
  checksUsed: number;
  inspectBudget: number;
  hintsUsed: number;
  postMortemLesson: string;
  scoreBreakdown: {
    rootCausePoints: number;
    causeTypePoints: number;
    efficiencyBonus: number;
    hintsPenalty: number;
  };
}

/**
 * Deterministically grades student predictions before simulation observation.
 */
export function gradePrediction(
  spec: PredictionSpec,
  userAnswer: unknown,
  actualResult: SimResult
): PredictionGrade {
  let correct = false;
  let explanation = '';
  let expectedValue: unknown;

  switch (spec.kind) {
    case 'select_node': {
      // If expectedNodeId is not pre-set, the engine determines the first overloaded node
      expectedValue = spec.expectedNodeId || actualResult.system.bottleneckNodeId;
      correct = userAnswer === expectedValue;
      if (!correct && spec.misconceptions && typeof userAnswer === 'string' && spec.misconceptions[userAnswer]) {
        explanation = spec.misconceptions[userAnswer];
      } else if (correct) {
        explanation = 'Spot on! You correctly identified the primary bottleneck component.';
      } else {
        explanation = `Incorrect. The first component that reaches saturation is ${expectedValue}.`;
      }
      break;
    }

    case 'direction': {
      expectedValue = spec.expectedDirection;
      correct = userAnswer === expectedValue;
      explanation = correct
        ? 'Correct directional intuition!'
        : `Expected the metric to go ${expectedValue}, but you selected ${userAnswer}.`;
      break;
    }

    case 'slider': {
      expectedValue = spec.expectedNumericValue;
      const tol = spec.tolerancePercent || 15;
      const numUser = Number(userAnswer);
      const numExpected = Number(expectedValue);
      const diff = Math.abs(numUser - numExpected);
      const maxAllowedDiff = (numExpected * tol) / 100;
      correct = diff <= maxAllowedDiff;
      explanation = correct
        ? `Close enough! Actual calculated value is ${numExpected} (you guessed ${numUser}).`
        : `Off by ${Math.round(diff)}. The actual mathematically computed value is ${numExpected}.`;
      break;
    }

    case 'boolean': {
      expectedValue = spec.expectedBoolean;
      correct = userAnswer === expectedValue;
      explanation = correct
        ? 'Accurate deduction!'
        : `Incorrect. The correct answer was ${expectedValue ? 'Yes' : 'No'}.`;
      break;
    }
  }

  return {
    correct,
    score: correct ? 100 : 0,
    expectedValue,
    userValue: userAnswer,
    explanation,
  };
}

/**
 * Evaluates whether an architecture fix passes the mission SLO thresholds.
 */
export function checkGoal(goal: MissionGoal, result: SimResult): GoalCheckResult {
  const failingReasons: string[] = [];
  let latencyPassed = true;
  let errorRatePassed = true;
  let customPassed = true;

  if (goal.p95LatencyMsMax !== undefined && result.system.userLatencyMs > goal.p95LatencyMsMax) {
    latencyPassed = false;
    failingReasons.push(
      `p95 Latency of ${result.system.userLatencyMs}ms exceeds target of ${goal.p95LatencyMsMax}ms`
    );
  }

  if (goal.errorRateMax !== undefined && result.system.errorRate > goal.errorRateMax) {
    errorRatePassed = false;
    failingReasons.push(
      `Error rate of ${(result.system.errorRate * 100).toFixed(1)}% exceeds target threshold of ${(
        goal.errorRateMax * 100
      ).toFixed(1)}%`
    );
  }

  if (goal.originUtilMax !== undefined) {
    // Look for origin node in result
    const originNode = Object.values(result.nodes).find(
      (n) => n.nodeId.includes('origin') || n.nodeId.includes('db')
    );
    if (originNode && originNode.utilization > goal.originUtilMax) {
      customPassed = false;
      failingReasons.push(
        `Backend utilization of ${(originNode.utilization * 100).toFixed(0)}% exceeds limit of ${(
          goal.originUtilMax * 100
        ).toFixed(0)}%`
      );
    }
  }

  const pass = latencyPassed && errorRatePassed && customPassed;

  return {
    pass,
    metrics: {
      latencyPassed,
      errorRatePassed,
      customPassed,
    },
    failingReasons,
  };
}

/**
 * Evaluates student diagnosis in Incident Mode.
 */
export function gradeDiagnosis(
  submission: DiagnosisSubmission,
  incident: IncidentScenarioSpec,
  checksUsed: number,
  hintsUsed = 0
): IncidentGrade {
  const isRootCauseCorrect = submission.rootCauseNode === incident.answer.rootCauseNode;
  const isCauseTypeCorrect = submission.causeType === incident.answer.causeType;

  const rootCausePoints = isRootCauseCorrect ? 50 : 0;
  const causeTypePoints = isCauseTypeCorrect ? 30 : 0;

  // Efficiency bonus: 20 points if within budget, proportionally reduced if over budget
  let efficiencyBonus = 0;
  if (isRootCauseCorrect) {
    if (checksUsed <= incident.inspectBudget) {
      efficiencyBonus = 20;
    } else {
      const over = checksUsed - incident.inspectBudget;
      efficiencyBonus = Math.max(0, 20 - over * 5);
    }
  }

  const hintsPenalty = hintsUsed * 5;
  const totalScore = Math.max(0, rootCausePoints + causeTypePoints + efficiencyBonus - hintsPenalty);

  return {
    totalScore,
    isRootCauseCorrect,
    isCauseTypeCorrect,
    checksUsed,
    inspectBudget: incident.inspectBudget,
    hintsUsed,
    postMortemLesson: incident.postMortemLesson,
    scoreBreakdown: {
      rootCausePoints,
      causeTypePoints,
      efficiencyBonus,
      hintsPenalty,
    },
  };
}

import { ArchGraph, StateDelta } from '../engine/types';
import { Mission, Incident } from '../content';
import { PredictionGrade } from '../engine/grade';
import { validateTutorResponse } from './validate';
import { checkIncidentSpoiler } from './spoilerGuard';
import {
  getPredictionExplanationTemplate,
  getIncidentMentorQuestionTemplate,
} from './templates';

export interface TutorClientResponse {
  text: string;
  badge: 'verified' | 'fallback';
}

/**
 * Dispatches AI tutor requests with automatic offline template fallback.
 * Validates output against simulation StateDelta and incident spoiler guard.
 */
export async function requestTutorExplanation(
  mission: Mission,
  grade: PredictionGrade,
  delta: StateDelta,
  graph: ArchGraph
): Promise<TutorClientResponse> {
  // Always use grounded template by default or if offline
  try {
    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'socratic',
        missionId: mission.id,
        predictionGrade: grade,
        stateDelta: delta,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const validation = validateTutorResponse(
        data.numbers_used || [],
        data.node_ids_referenced || [],
        delta,
        graph
      );

      if (validation.isValid) {
        return { text: data.text, badge: 'verified' };
      }
    }
  } catch {
    // Network or serverless unavailable: gracefully fall through to template
  }

  const fallbackText = getPredictionExplanationTemplate(mission, grade, delta);
  return { text: fallbackText, badge: 'verified' };
}

export async function requestIncidentMentorAdvice(
  incident: Incident,
  revealedNodes: string[],
  delta: StateDelta,
  graph: ArchGraph,
  isDiagnosed: boolean
): Promise<TutorClientResponse> {
  try {
    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'on_call_mentor',
        incidentId: incident.id,
        revealedNodes,
        stateDelta: delta,
        isDiagnosed,
      }),
    });

    if (res.ok) {
      const data = await res.json();

      // Enforce spoiler guard prior to official student diagnosis
      if (!isDiagnosed) {
        const spoilerCheck = checkIncidentSpoiler(data.text || '', incident);
        if (spoilerCheck.hasSpoiler) {
          // Reject spoiler and fall back to safe mentor question
          return {
            text: getIncidentMentorQuestionTemplate(incident, revealedNodes, delta),
            badge: 'fallback',
          };
        }
      }

      const validation = validateTutorResponse(
        data.numbers_used || [],
        data.node_ids_referenced || [],
        delta,
        graph
      );

      if (validation.isValid) {
        return { text: data.text, badge: 'verified' };
      }
    }
  } catch {
    // Fallback
  }

  return {
    text: getIncidentMentorQuestionTemplate(incident, revealedNodes, delta),
    badge: 'verified',
  };
}

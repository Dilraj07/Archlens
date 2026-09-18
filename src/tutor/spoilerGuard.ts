import { Incident } from '../content';

export interface SpoilerCheckResult {
  hasSpoiler: boolean;
  detectedSpoilers: string[];
}

/**
 * Ensures the AI on-call mentor never reveals or spoils the hidden root cause
 * before the student submits their official diagnosis.
 */
export function checkIncidentSpoiler(
  candidateText: string,
  incident: Incident
): SpoilerCheckResult {
  const normalizedText = candidateText.toLowerCase();
  const detectedSpoilers: string[] = [];

  // 1. Check root cause node id
  if (normalizedText.includes(incident.answer.rootCauseNode.toLowerCase())) {
    detectedSpoilers.push(`Node ID: ${incident.answer.rootCauseNode}`);
  }

  // 2. Check root cause cause type
  const normalizedCauseType = incident.answer.causeType.toLowerCase().replace(/_/g, ' ');
  if (normalizedText.includes(normalizedCauseType)) {
    detectedSpoilers.push(`Cause Type: ${incident.answer.causeType}`);
  }

  // 3. Check specific blacklist terms defined in incident spec
  for (const term of incident.spoilerTerms) {
    if (normalizedText.includes(term.toLowerCase())) {
      detectedSpoilers.push(`Spoiler Term: "${term}"`);
    }
  }

  return {
    hasSpoiler: detectedSpoilers.length > 0,
    detectedSpoilers,
  };
}

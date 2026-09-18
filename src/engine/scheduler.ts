export type ConceptId =
  | 'spikes'
  | 'caching'
  | 'cdn'
  | 'queues'
  | 'replication'
  | 'diagnosis';

export interface ConceptMastery {
  conceptId: ConceptId;
  name: string;
  box: number; // 1 to 4
  masteryScore: number; // 0 to 100
  lastReviewed: string; // ISO date
  nextReviewDue: string; // ISO date
  consecutiveSuccesses: number;
}

export interface ReviewLog {
  concepts: Record<ConceptId, ConceptMastery>;
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
};

export const INITIAL_CONCEPTS: Record<ConceptId, { name: string }> = {
  spikes: { name: 'Spike Handling & Rate Limiting' },
  caching: { name: 'Cache Hit-Ratio & Invalidation' },
  cdn: { name: 'CDN Edge Offload' },
  queues: { name: 'Async Queues & Decoupling' },
  replication: { name: 'Read Replicas & Scaling' },
  diagnosis: { name: 'Root-Cause Incident Diagnosis' },
};

/**
 * Creates default mastery profile for a first-time learner.
 */
export function createDefaultReviewLog(now = new Date()): ReviewLog {
  const todayIso = now.toISOString().split('T')[0]!;
  const concepts: Record<ConceptId, ConceptMastery> = {} as Record<ConceptId, ConceptMastery>;

  for (const [id, meta] of Object.entries(INITIAL_CONCEPTS)) {
    concepts[id as ConceptId] = {
      conceptId: id as ConceptId,
      name: meta.name,
      box: 1,
      masteryScore: 10,
      lastReviewed: now.toISOString(),
      nextReviewDue: now.toISOString(),
      consecutiveSuccesses: 0,
    };
  }

  return {
    concepts,
    currentStreak: 0,
    lastActiveDate: todayIso,
  };
}

/**
 * Updates concept mastery based on review performance using Leitner-box scheduling.
 */
export function recordConceptReview(
  log: ReviewLog,
  conceptId: ConceptId,
  isSuccess: boolean,
  now = new Date()
): ReviewLog {
  const todayStr = now.toISOString().split('T')[0]!;
  const current = log.concepts[conceptId] || {
    conceptId,
    name: INITIAL_CONCEPTS[conceptId]?.name || conceptId,
    box: 1,
    masteryScore: 10,
    lastReviewed: now.toISOString(),
    nextReviewDue: now.toISOString(),
    consecutiveSuccesses: 0,
  };

  let newBox = current.box;
  let newConsecutive = current.consecutiveSuccesses;
  let newMastery = current.masteryScore;

  if (isSuccess) {
    newBox = Math.min(4, current.box + 1);
    newConsecutive += 1;
    newMastery = Math.min(100, current.masteryScore + 20);
  } else {
    // Reset to box 1 upon error to force immediate repetition
    newBox = 1;
    newConsecutive = 0;
    newMastery = Math.max(5, current.masteryScore - 15);
  }

  const intervalDays = BOX_INTERVAL_DAYS[newBox] || 1;
  const nextDueDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  // Update streak if active today
  let streak = log.currentStreak;
  if (streak === 0) {
    streak = 1;
  } else if (log.lastActiveDate !== todayStr) {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (log.lastActiveDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  return {
    ...log,
    currentStreak: streak,
    lastActiveDate: todayStr,
    concepts: {
      ...log.concepts,
      [conceptId]: {
        ...current,
        box: newBox,
        consecutiveSuccesses: newConsecutive,
        masteryScore: newMastery,
        lastReviewed: now.toISOString(),
        nextReviewDue: nextDueDate.toISOString(),
      },
    },
  };
}

/**
 * Identifies which concepts are due for review, prioritized by weakest mastery.
 */
export function getDueConcepts(log: ReviewLog, now = new Date()): ConceptId[] {
  const nowTime = now.getTime();
  const dueList: { id: ConceptId; mastery: number; overdueDays: number }[] = [];

  for (const c of Object.values(log.concepts)) {
    const dueTime = new Date(c.nextReviewDue).getTime();
    if (dueTime <= nowTime) {
      const overdueDays = (nowTime - dueTime) / (1000 * 60 * 60 * 24);
      dueList.push({ id: c.conceptId, mastery: c.masteryScore, overdueDays });
    }
  }

  // Prioritize lowest mastery, then highest overdue days
  dueList.sort((a, b) => a.mastery - b.mastery || b.overdueDays - a.overdueDays);

  if (dueList.length === 0) {
    // If none are strictly due, pick the concept with lowest overall mastery score
    const all = Object.values(log.concepts).sort((a, b) => a.masteryScore - b.masteryScore);
    return all.map((c) => c.conceptId);
  }

  return dueList.map((d) => d.id);
}

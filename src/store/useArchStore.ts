import { create } from 'zustand';
import { ArchGraph, NodeSpec, Scenario, SimResult, StateDelta } from '../engine/types';
import { simulate } from '../engine/simulate';
import { diff } from '../engine/diff';
import { checkGoal, DiagnosisSubmission, gradeDiagnosis, gradePrediction, IncidentGrade, PredictionGrade } from '../engine/grade';
import { createDefaultReviewLog, recordConceptReview, ReviewLog } from '../engine/scheduler';
import { BLUEPRINTS, getBlueprint, getIncident, getMission, Incident, Mission } from '../content';

export type AppView = 'landing' | 'missions' | 'mission_player' | 'incident_player' | 'daily_incident' | 'mastery';

export type MissionStep = 'brief' | 'predict' | 'observe' | 'explain' | 'fix' | 'completed';

export interface TutorMessage {
  id: string;
  sender: 'student' | 'tutor' | 'mentor';
  text: string;
  badge: 'verified' | 'fallback';
  timestamp: number;
}

interface ArchState {
  // Navigation & Active Content
  view: AppView;
  activeBlueprintId: string;
  activeBlueprint: ArchGraph;
  activeMission: Mission | null;
  activeIncident: Incident | null;

  // Selected Node (for Glass Box formula inspector)
  selectedNodeId: string | null;

  // Simulation Engine State
  activeScenario: Scenario;
  baselineResult: SimResult;
  currentResult: SimResult;
  stateDelta: StateDelta | null;
  activeOverrides: Record<string, Partial<NodeSpec>>;

  // Guided Mission Flow State
  missionStep: MissionStep;
  userPrediction: unknown;
  predictionGrade: PredictionGrade | null;
  appliedFixIds: string[];
  goalResult: ReturnType<typeof checkGoal> | null;

  // Incident Mode State
  inspectBudgetRemaining: number;
  revealedNodeIds: string[];
  inspectionLog: { nodeId: string; time: number }[];
  hintsUsed: number;
  userDiagnosis: DiagnosisSubmission | null;
  incidentGrade: IncidentGrade | null;
  isDiagnosed: boolean;
  isIncidentResolved: boolean;

  // AI Tutor & Communication
  tutorMessages: TutorMessage[];
  isTutorThinking: boolean;

  // Spaced Retention & Mastery Profile
  reviewLog: ReviewLog;

  // Core Actions
  setView: (view: AppView) => void;
  selectNode: (nodeId: string | null) => void;
  loadBlueprint: (blueprintId: string) => void;
  startMission: (missionId: string) => void;
  startIncident: (incidentId: string) => void;
  startDailyIncident: () => void;

  // Mission Actions
  setPrediction: (answer: unknown) => void;
  submitPrediction: () => void;
  proceedToObserve: () => void;
  proceedToExplain: () => void;
  proceedToFix: () => void;
  applyFixAction: (actionId: string) => void;
  revertFixAction: (actionId: string) => void;

  // Incident Actions
  inspectNodeInIncident: (nodeId: string) => void;
  requestIncidentHint: () => void;
  submitDiagnosis: (diagnosis: DiagnosisSubmission) => void;

  // Tutor Chat Actions
  addTutorMessage: (msg: Omit<TutorMessage, 'id' | 'timestamp'>) => void;
  setTutorThinking: (thinking: boolean) => void;
}

const LOCAL_STORAGE_MASTERY_KEY = 'archlens_mastery_log_v1';

function loadStoredReviewLog(): ReviewLog {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MASTERY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return createDefaultReviewLog();
}

function persistReviewLog(log: ReviewLog) {
  try {
    localStorage.setItem(LOCAL_STORAGE_MASTERY_KEY, JSON.stringify(log));
  } catch {
    // ignore
  }
}

export const useArchStore = create<ArchState>((set, get) => {
  const defaultBlueprint = BLUEPRINTS['tatkal']!;
  const defaultScenario: Scenario = { usersConcurrent: 1000, requestsPerUserPerSec: 1 };
  const initialBaseline = simulate(defaultBlueprint, defaultScenario);

  return {
    view: 'landing',
    activeBlueprintId: 'tatkal',
    activeBlueprint: defaultBlueprint,
    activeMission: null,
    activeIncident: null,
    selectedNodeId: null,

    activeScenario: defaultScenario,
    baselineResult: initialBaseline,
    currentResult: initialBaseline,
    stateDelta: null,
    activeOverrides: {},

    missionStep: 'brief',
    userPrediction: null,
    predictionGrade: null,
    appliedFixIds: [],
    goalResult: null,

    inspectBudgetRemaining: 5,
    revealedNodeIds: [],
    inspectionLog: [],
    hintsUsed: 0,
    userDiagnosis: null,
    incidentGrade: null,
    isDiagnosed: false,
    isIncidentResolved: false,

    tutorMessages: [],
    isTutorThinking: false,

    reviewLog: loadStoredReviewLog(),

    setView: (view) => set({ view }),

    selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

    loadBlueprint: (blueprintId) => {
      const bp = getBlueprint(blueprintId);
      if (!bp) return;
      const baseScenario: Scenario = { usersConcurrent: 1000, requestsPerUserPerSec: 1 };
      const sim = simulate(bp, baseScenario);
      set({
        activeBlueprintId: blueprintId,
        activeBlueprint: bp,
        activeScenario: baseScenario,
        baselineResult: sim,
        currentResult: sim,
        stateDelta: null,
        activeOverrides: {},
        selectedNodeId: null,
      });
    },

    startMission: (missionId) => {
      const mission = getMission(missionId);
      if (!mission) return;
      const bp = getBlueprint(mission.blueprintId);
      if (!bp) return;

      const baselineScenario: Scenario = {
        usersConcurrent: mission.baseline.usersConcurrent,
        requestsPerUserPerSec: mission.baseline.requestsPerUserPerSec,
      };
      const baselineSim = simulate(bp, baselineScenario);

      set({
        view: 'mission_player',
        activeMission: mission,
        activeIncident: null,
        activeBlueprintId: mission.blueprintId,
        activeBlueprint: bp,
        activeScenario: baselineScenario,
        baselineResult: baselineSim,
        currentResult: baselineSim,
        stateDelta: null,
        activeOverrides: {},
        missionStep: 'brief',
        userPrediction: null,
        predictionGrade: null,
        appliedFixIds: [],
        goalResult: null,
        selectedNodeId: bp.nodes[0]?.id || null,
        tutorMessages: [],
      });
    },

    startIncident: (incidentId) => {
      const incident = getIncident(incidentId);
      if (!incident) return;
      const bp = getBlueprint(incident.blueprintId);
      if (!bp) return;

      const baselineScenario: Scenario = {
        usersConcurrent: incident.baseline.usersConcurrent,
        requestsPerUserPerSec: incident.baseline.requestsPerUserPerSec,
      };
      const baselineSim = simulate(bp, baselineScenario);

      // Injected hidden fault
      const faultOverrides: Record<string, Partial<NodeSpec>> = {
        [incident.hiddenFault.targetNodeId]: {
          [incident.hiddenFault.paramKey]: incident.hiddenFault.faultValue,
        },
      };

      const degradedSim = simulate(bp, {
        ...baselineScenario,
        overrides: faultOverrides,
      });

      const delta = diff(baselineSim, degradedSim);

      set({
        view: 'incident_player',
        activeIncident: incident,
        activeMission: null,
        activeBlueprintId: incident.blueprintId,
        activeBlueprint: bp,
        activeScenario: baselineScenario,
        baselineResult: baselineSim,
        currentResult: degradedSim,
        stateDelta: delta,
        activeOverrides: faultOverrides,
        inspectBudgetRemaining: incident.inspectBudget,
        revealedNodeIds: [],
        inspectionLog: [],
        hintsUsed: 0,
        userDiagnosis: null,
        incidentGrade: null,
        isDiagnosed: false,
        isIncidentResolved: false,
        selectedNodeId: null,
        appliedFixIds: [],
        goalResult: null,
        tutorMessages: [
          {
            id: 'incident-init',
            sender: 'mentor',
            text: `Senior On-Call Mentor online. ${incident.pageAlert} All nodes are currently masked. Inspect individual nodes to check latency and queue drops against your budget of ${incident.inspectBudget} inspections.`,
            badge: 'verified',
            timestamp: Date.now(),
          },
        ],
      });
    },

    startDailyIncident: () => {
      // For MVP, map weakest concept to our incident i1-tatkal-down
      get().startIncident('i1-tatkal-down');
      set({ view: 'daily_incident' });
    },

    setPrediction: (answer) => set({ userPrediction: answer }),

    submitPrediction: () => {
      const { activeMission, userPrediction, activeBlueprint } = get();
      if (!activeMission) return;

      // Event scenario
      const eventScenario: Scenario = {
        usersConcurrent: activeMission.event.usersConcurrent,
        requestsPerUserPerSec: activeMission.event.requestsPerUserPerSec,
      };

      const eventSim = simulate(activeBlueprint, eventScenario);
      const grade = gradePrediction(activeMission.prediction as any, userPrediction, eventSim);

      set({
        predictionGrade: grade,
        missionStep: 'observe',
      });
    },

    proceedToObserve: () => {
      const { activeMission, activeBlueprint, baselineResult } = get();
      if (!activeMission) return;

      const eventScenario: Scenario = {
        usersConcurrent: activeMission.event.usersConcurrent,
        requestsPerUserPerSec: activeMission.event.requestsPerUserPerSec,
      };
      const eventSim = simulate(activeBlueprint, eventScenario);
      const delta = diff(baselineResult, eventSim);

      set({
        currentResult: eventSim,
        activeScenario: eventScenario,
        stateDelta: delta,
        missionStep: 'observe',
      });
    },

    proceedToExplain: () => {
      const { predictionGrade, stateDelta } = get();
      const text = predictionGrade?.correct
        ? `Great intuition! The simulation confirms your prediction: ${predictionGrade.explanation}`
        : `Let's analyze why: ${predictionGrade?.explanation || 'Component became saturated.'} At ${stateDelta?.after.system.totalArrivalRate} req/s, ${stateDelta?.firstOverloadedNodeId || 'a key component'} experienced queue backlog and dropped requests.`;

      get().addTutorMessage({
        sender: 'tutor',
        text,
        badge: 'verified',
      });

      set({ missionStep: 'explain' });
    },

    proceedToFix: () => set({ missionStep: 'fix' }),

    applyFixAction: (actionId) => {
      const { activeMission, activeIncident, appliedFixIds, activeBlueprint, activeScenario, activeOverrides } = get();
      if (appliedFixIds.includes(actionId)) return;

      const palette = activeMission ? activeMission.fix.palette : activeIncident?.fix.palette;
      const action = palette?.find((a) => a.id === actionId);
      if (!action) return;

      const newOverrides = { ...activeOverrides };
      const currentOverride = newOverrides[action.targetNodeId] || {};

      if (action.type === 'enable') {
        newOverrides[action.targetNodeId] = { ...currentOverride, enabled: true };
      } else if (action.type === 'add_replica') {
        const baseNode = activeBlueprint.nodes.find((n) => n.id === action.targetNodeId);
        const currentReplicas = currentOverride.replicas ?? baseNode?.replicas ?? 1;
        newOverrides[action.targetNodeId] = {
          ...currentOverride,
          replicas: currentReplicas + (action.replicaDelta || 1),
        };
      } else if (action.type === 'restore_param' && action.paramKey) {
        newOverrides[action.targetNodeId] = {
          ...currentOverride,
          [action.paramKey]: action.paramValue,
        };
      }

      const updatedSim = simulate(activeBlueprint, {
        ...activeScenario,
        overrides: newOverrides,
      });

      const goal = activeMission ? activeMission.fix.goal : activeIncident?.fix.goal;
      const goalCheck = goal ? checkGoal(goal, updatedSim) : null;
      const nextApplied = [...appliedFixIds, actionId];

      set({
        appliedFixIds: nextApplied,
        activeOverrides: newOverrides,
        currentResult: updatedSim,
        goalResult: goalCheck,
        isIncidentResolved: goalCheck?.pass || false,
      });

      // If goal passed in mission, update mastery!
      if (goalCheck?.pass && activeMission) {
        let updatedLog = get().reviewLog;
        for (const concept of activeMission.concepts) {
          updatedLog = recordConceptReview(updatedLog, concept as any, true);
        }
        persistReviewLog(updatedLog);
        set({ reviewLog: updatedLog });
      }
    },

    revertFixAction: (actionId) => {
      const { activeMission, activeIncident, appliedFixIds, activeBlueprint, activeScenario, activeOverrides } = get();
      if (!appliedFixIds.includes(actionId)) return;

      const palette = activeMission ? activeMission.fix.palette : activeIncident?.fix.palette;
      const action = palette?.find((a) => a.id === actionId);
      if (!action) return;

      const newOverrides = { ...activeOverrides };
      delete newOverrides[action.targetNodeId];

      const updatedSim = simulate(activeBlueprint, {
        ...activeScenario,
        overrides: newOverrides,
      });

      const goal = activeMission ? activeMission.fix.goal : activeIncident?.fix.goal;
      const goalCheck = goal ? checkGoal(goal, updatedSim) : null;

      set({
        appliedFixIds: appliedFixIds.filter((id) => id !== actionId),
        activeOverrides: newOverrides,
        currentResult: updatedSim,
        goalResult: goalCheck,
        isIncidentResolved: goalCheck?.pass || false,
      });
    },

    inspectNodeInIncident: (nodeId) => {
      const { inspectBudgetRemaining, revealedNodeIds, inspectionLog, currentResult } = get();
      if (revealedNodeIds.includes(nodeId)) {
        set({ selectedNodeId: nodeId });
        return;
      }

      if (inspectBudgetRemaining <= 0) return;

      const newBudget = inspectBudgetRemaining - 1;
      const newRevealed = [...revealedNodeIds, nodeId];
      const newLog = [...inspectionLog, { nodeId, time: Date.now() }];

      const nodeMetric = currentResult.nodes[nodeId];
      const inspectionMsg = nodeMetric
        ? `Inspected [${nodeId}]: Utilization ${(nodeMetric.utilization * 100).toFixed(0)}%, Latency ${nodeMetric.latencyMs}ms (${nodeMetric.selfLatencyMs}ms self + ${nodeMetric.downstreamWaitMs}ms downstream wait), Dropped: ${nodeMetric.dropped} req/s.`
        : `Inspected [${nodeId}].`;

      get().addTutorMessage({
        sender: 'mentor',
        text: inspectionMsg,
        badge: 'verified',
      });

      set({
        inspectBudgetRemaining: newBudget,
        revealedNodeIds: newRevealed,
        inspectionLog: newLog,
        selectedNodeId: nodeId,
      });
    },

    requestIncidentHint: () => {
      const { hintsUsed, activeIncident } = get();
      if (!activeIncident) return;

      const nextHints = hintsUsed + 1;
      let hintText = '';

      if (nextHints === 1) {
        hintText = `Hint 1 (Concept): Pay close attention to downstream synchronous waits. If an upstream service has high latency but low self-utilization, the real bottleneck is downstream.`;
      } else if (nextHints === 2) {
        hintText = `Hint 2 (Component): Check the cache hit rate. An empty or invalid cache will cascade entire read volumes onto the database primary.`;
      } else {
        hintText = `Hint 3 (Action): Inspect ${activeIncident.answer.rootCauseNode} and look for cache miss storm patterns.`;
      }

      get().addTutorMessage({
        sender: 'mentor',
        text: hintText,
        badge: 'verified',
      });

      set({ hintsUsed: nextHints });
    },

    submitDiagnosis: (diagnosis) => {
      const { activeIncident, inspectionLog, hintsUsed } = get();
      if (!activeIncident) return;

      const checksCount = inspectionLog.length;
      const grade = gradeDiagnosis(diagnosis, activeIncident as any, checksCount, hintsUsed);

      let updatedLog = get().reviewLog;
      updatedLog = recordConceptReview(updatedLog, 'diagnosis', grade.isRootCauseCorrect);
      persistReviewLog(updatedLog);

      get().addTutorMessage({
        sender: 'mentor',
        text: grade.isRootCauseCorrect
          ? `Diagnosis CONFIRMED: ${diagnosis.rootCauseNode} caused by ${diagnosis.causeType}. Score: ${grade.totalScore}/100. Apply mitigations from the remediation palette to resolve the incident.`
          : `Diagnosis INCORRECT: Identified ${diagnosis.rootCauseNode} as ${diagnosis.causeType}. Review downstream wait times and try again.`,
        badge: 'verified',
      });

      set({
        userDiagnosis: diagnosis,
        incidentGrade: grade,
        isDiagnosed: true,
        reviewLog: updatedLog,
      });
    },

    addTutorMessage: (msg) => {
      const newMsg: TutorMessage = {
        ...msg,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
      };
      set((s) => ({ tutorMessages: [...s.tutorMessages, newMsg] }));
    },

    setTutorThinking: (thinking) => set({ isTutorThinking: thinking }),
  };
});

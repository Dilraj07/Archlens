import { create } from 'zustand';
import { ArchGraph, NodeSpec, NodeType, Scenario, SimResult, StateDelta } from '../engine/types';
import { simulate } from '../engine/simulate';
import { diff } from '../engine/diff';
import { checkGoal, DiagnosisSubmission, gradeDiagnosis, gradePrediction, IncidentGrade, PredictionGrade } from '../engine/grade';
import { createDefaultReviewLog, recordConceptReview, ReviewLog } from '../engine/scheduler';
import { BLUEPRINTS, getBlueprint, getIncident, getMission, Incident, Mission } from '../content';

export type AppView =
  | 'landing'
  | 'learn'
  | 'architectures'
  | 'challenges'
  | 'studio'
  | 'missions'
  | 'mission_player'
  | 'incident_player'
  | 'daily_incident'
  | 'mastery';

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
  learnTab: 'concepts' | 'catalog';
  setLearnTab: (tab: 'concepts' | 'catalog') => void;
  activeBlueprintId: string;
  activeBlueprint: ArchGraph;
  activeMission: Mission | null;
  activeIncident: Incident | null;

  // Selected Node (for Glass Box formula inspector & hyperparameter tuning)
  selectedNodeId: string | null;

  // Simulation Engine State & Hyperparameters
  activeScenario: Scenario;
  baselineResult: SimResult;
  currentResult: SimResult;
  stateDelta: StateDelta | null;
  activeOverrides: Record<string, Partial<NodeSpec>>;
  isSimulating: boolean;

  // Interactive Hyperparameter Tuning
  setTrafficLoad: (usersConcurrent: number, requestsPerUserPerSec?: number) => void;
  updateNodeConfig: (nodeId: string, updates: Partial<NodeSpec>) => void;
  selectArchitecture: (blueprintId: string) => void;

  // Guided Architecture Tour
  tourActiveStep: number | null;
  tourActiveNodeIds: string[] | null;
  setTourStep: (step: number | null, nodeIds: string[] | null) => void;

  // Design Studio (Sandbox) State
  studioGraph: ArchGraph;
  studioTraffic: number;
  studioSimResult: SimResult | null;
  studioSelectedNodeId: string | null;
  addStudioNode: (type: NodeType, name?: string) => void;
  updateStudioNode: (nodeId: string, updates: Partial<NodeSpec>) => void;
  removeStudioNode: (nodeId: string) => void;
  connectStudioNodes: (sourceId: string, targetId: string) => void;
  removeStudioEdge: (edgeId: string) => void;
  simulateStudio: () => void;
  resetStudio: () => void;
  loadStudioTemplate: (blueprintId: string) => void;
  selectStudioNode: (nodeId: string | null) => void;

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
  const defaultBlueprint = BLUEPRINTS['simple-app'] || BLUEPRINTS['tatkal']!;
  const defaultScenario: Scenario = { usersConcurrent: 1000, requestsPerUserPerSec: 1 };
  const initialBaseline = simulate(defaultBlueprint, defaultScenario);

  const initialStudioGraph: ArchGraph = {
    id: 'studio-custom',
    name: 'My Custom Architecture',
    description: 'Custom system designed in the ArchLens Studio sandbox.',
    entryNodeId: 'node_client',
    exitNodeId: 'node_db',
    nodes: [
      {
        id: 'node_client',
        name: 'Web Clients',
        type: 'client',
        serviceRatePerReplica: 50000,
        replicas: 1,
        baseLatencyMs: 0,
        enabled: true,
      },
      {
        id: 'node_lb',
        name: 'Load Balancer',
        type: 'load_balancer',
        serviceRatePerReplica: 30000,
        replicas: 1,
        baseLatencyMs: 2,
        enabled: true,
      },
      {
        id: 'node_server',
        name: 'App Server',
        type: 'service',
        serviceRatePerReplica: 3000,
        replicas: 2,
        baseLatencyMs: 15,
        enabled: true,
      },
      {
        id: 'node_db',
        name: 'SQL Database',
        type: 'database',
        serviceRatePerReplica: 2000,
        replicas: 1,
        baseLatencyMs: 25,
        enabled: true,
      },
    ],
    edges: [
      { id: 'e_client_lb', source: 'node_client', target: 'node_lb' },
      { id: 'e_lb_server', source: 'node_lb', target: 'node_server' },
      { id: 'e_server_db', source: 'node_server', target: 'node_db' },
    ],
  };

  const initialStudioSim = simulate(initialStudioGraph, { usersConcurrent: 2500, requestsPerUserPerSec: 1 });

  return {
    view: 'landing',
    learnTab: 'concepts',
    activeBlueprintId: 'simple-app',
    activeBlueprint: defaultBlueprint,
    activeMission: null,
    activeIncident: null,
    selectedNodeId: null,

    activeScenario: defaultScenario,
    baselineResult: initialBaseline,
    currentResult: initialBaseline,
    stateDelta: null,
    activeOverrides: {},
    isSimulating: true,

    // Guided Architecture Tour
    tourActiveStep: null,
    tourActiveNodeIds: null,
    setTourStep: (step, nodeIds) => set({ tourActiveStep: step, tourActiveNodeIds: nodeIds }),

    // Guided Mission Flow State
    missionStep: 'brief',
    userPrediction: null,
    predictionGrade: null,
    appliedFixIds: [],
    goalResult: null,

    // Incident Mode State
    inspectBudgetRemaining: 5,
    revealedNodeIds: [],
    inspectionLog: [],
    hintsUsed: 0,
    userDiagnosis: null,
    incidentGrade: null,
    isDiagnosed: false,
    isIncidentResolved: false,

    // AI Tutor & Communication
    tutorMessages: [],
    isTutorThinking: false,

    // Spaced Retention & Mastery Profile
    reviewLog: loadStoredReviewLog(),

    // Hyperparameter tuning
    setTrafficLoad: (usersConcurrent, requestsPerUserPerSec = 1) => {
      const { activeBlueprint } = get();
      const newScenario: Scenario = {
        usersConcurrent,
        requestsPerUserPerSec,
      };
      const result = simulate(activeBlueprint, newScenario);
      set({
        activeScenario: newScenario,
        currentResult: result,
      });
    },

    updateNodeConfig: (nodeId, updates) => {
      const { activeBlueprint, activeScenario } = get();
      const updatedNodes = activeBlueprint.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      );
      const updatedBlueprint: ArchGraph = {
        ...activeBlueprint,
        nodes: updatedNodes,
      };

      const result = simulate(updatedBlueprint, activeScenario);
      set({
        activeBlueprint: updatedBlueprint,
        currentResult: result,
      });
    },

    selectArchitecture: (blueprintId) => {
      const bp = getBlueprint(blueprintId);
      if (!bp) return;
      const baseScenario: Scenario = { usersConcurrent: 2500, requestsPerUserPerSec: 1 };
      const sim = simulate(bp, baseScenario);
      set({
        view: 'architectures',
        activeBlueprintId: blueprintId,
        activeBlueprint: bp,
        activeScenario: baseScenario,
        baselineResult: sim,
        currentResult: sim,
        stateDelta: null,
        activeOverrides: {},
        selectedNodeId: bp.nodes[1]?.id || bp.nodes[0]?.id || null,
        tourActiveStep: null,
        tourActiveNodeIds: null,
      });
    },

    setView: (view) => set({ view }),
    setLearnTab: (learnTab) => set({ learnTab }),

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
        tourActiveStep: null,
        tourActiveNodeIds: null,
      });
    },

    // Design Studio
    studioGraph: initialStudioGraph,
    studioTraffic: 2500,
    studioSimResult: initialStudioSim,
    studioSelectedNodeId: null,

    selectStudioNode: (nodeId) => set({ studioSelectedNodeId: nodeId }),

    addStudioNode: (type, name) => {
      const { studioGraph, studioTraffic } = get();
      const nodeCount = studioGraph.nodes.length + 1;
      const id = `node_${type}_${Date.now()}`;
      const defaultRates: Record<NodeType, { rate: number; latency: number; name: string }> = {
        client: { rate: 100000, latency: 0, name: 'Client Traffic' },
        cdn: { rate: 50000, latency: 5, name: 'Edge CDN' },
        load_balancer: { rate: 40000, latency: 2, name: 'Load Balancer' },
        service: { rate: 3000, latency: 15, name: 'App Server' },
        cache: { rate: 25000, latency: 1, name: 'Redis Cache' },
        database: { rate: 1500, latency: 30, name: 'Database' },
        queue: { rate: 30000, latency: 2, name: 'Message Queue' },
        worker: { rate: 2000, latency: 40, name: 'Worker Service' },
        external: { rate: 1000, latency: 80, name: 'Third-party API' },
        rate_limiter: { rate: 35000, latency: 3, name: 'API Gateway / Limiter' },
      };

      const meta = defaultRates[type] || { rate: 3000, latency: 20, name: `${type} node` };

      const newNode: NodeSpec = {
        id,
        name: name || `${meta.name} #${nodeCount}`,
        type,
        serviceRatePerReplica: meta.rate,
        replicas: 1,
        baseLatencyMs: meta.latency,
        enabled: true,
        hitRate: type === 'cache' ? 0.85 : type === 'cdn' ? 0.90 : undefined,
      };

      const updatedGraph: ArchGraph = {
        ...studioGraph,
        nodes: [...studioGraph.nodes, newNode],
      };

      let sim = null;
      try {
        sim = simulate(updatedGraph, { usersConcurrent: studioTraffic, requestsPerUserPerSec: 1 });
      } catch {
        // graph might be temporarily disconnected
      }

      set({
        studioGraph: updatedGraph,
        studioSimResult: sim,
        studioSelectedNodeId: id,
      });
    },

    updateStudioNode: (nodeId, updates) => {
      const { studioGraph, studioTraffic } = get();
      const updatedNodes = studioGraph.nodes.map((n) =>
        n.id === nodeId ? { ...n, ...updates } : n
      );
      const updatedGraph: ArchGraph = { ...studioGraph, nodes: updatedNodes };
      let sim = null;
      try {
        sim = simulate(updatedGraph, { usersConcurrent: studioTraffic, requestsPerUserPerSec: 1 });
      } catch {
        // cycle or disconnected
      }
      set({
        studioGraph: updatedGraph,
        studioSimResult: sim,
      });
    },

    removeStudioNode: (nodeId) => {
      const { studioGraph, studioTraffic, studioSelectedNodeId } = get();
      const updatedNodes = studioGraph.nodes.filter((n) => n.id !== nodeId);
      const updatedEdges = studioGraph.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );
      const updatedGraph: ArchGraph = { ...studioGraph, nodes: updatedNodes, edges: updatedEdges };
      let sim = null;
      try {
        sim = simulate(updatedGraph, { usersConcurrent: studioTraffic, requestsPerUserPerSec: 1 });
      } catch {
        // ignore
      }
      set({
        studioGraph: updatedGraph,
        studioSimResult: sim,
        studioSelectedNodeId: studioSelectedNodeId === nodeId ? null : studioSelectedNodeId,
      });
    },

    connectStudioNodes: (sourceId, targetId) => {
      const { studioGraph, studioTraffic } = get();
      if (sourceId === targetId) return;
      const edgeExists = studioGraph.edges.some(
        (e) => e.source === sourceId && e.target === targetId
      );
      if (edgeExists) return;

      const newEdge = {
        id: `e_${sourceId}_${targetId}`,
        source: sourceId,
        target: targetId,
      };

      const updatedGraph: ArchGraph = {
        ...studioGraph,
        edges: [...studioGraph.edges, newEdge],
      };

      let sim = null;
      try {
        sim = simulate(updatedGraph, { usersConcurrent: studioTraffic, requestsPerUserPerSec: 1 });
      } catch {
        // ignore
      }

      set({
        studioGraph: updatedGraph,
        studioSimResult: sim,
      });
    },

    removeStudioEdge: (edgeId) => {
      const { studioGraph, studioTraffic } = get();
      const updatedEdges = studioGraph.edges.filter((e) => e.id !== edgeId);
      const updatedGraph: ArchGraph = { ...studioGraph, edges: updatedEdges };
      let sim = null;
      try {
        sim = simulate(updatedGraph, { usersConcurrent: studioTraffic, requestsPerUserPerSec: 1 });
      } catch {
        // ignore
      }
      set({
        studioGraph: updatedGraph,
        studioSimResult: sim,
      });
    },

    simulateStudio: () => {
      const { studioGraph, studioTraffic } = get();
      try {
        const sim = simulate(studioGraph, { usersConcurrent: studioTraffic, requestsPerUserPerSec: 1 });
        set({ studioSimResult: sim });
      } catch (err) {
        console.warn('Simulation error on custom studio graph:', err);
      }
    },

    resetStudio: () => {
      set({
        studioGraph: initialStudioGraph,
        studioTraffic: 2500,
        studioSimResult: initialStudioSim,
        studioSelectedNodeId: null,
      });
    },

    loadStudioTemplate: (blueprintId) => {
      // Special-case: 'empty' starts with a single Client node so the canvas is a blank slate
      // without breaking the simulator (which expects at least one source).
      if (blueprintId === 'empty') {
        const emptyGraph: ArchGraph = {
          id: 'studio-empty',
          name: 'Blank Canvas',
          description: 'Start from scratch and build your own architecture.',
          entryNodeId: 'node_client',
          nodes: [
            {
              id: 'node_client',
              type: 'client',
              name: 'Web Users',
              replicas: 1,
              serviceRatePerReplica: 100000,
              baseLatencyMs: 0,
              enabled: true,
            },
          ],
          edges: [],
        };
        const sim = simulate(emptyGraph, { usersConcurrent: 2500, requestsPerUserPerSec: 1 });
        set({
          studioGraph: emptyGraph,
          studioTraffic: 2500,
          studioSimResult: sim,
          studioSelectedNodeId: null,
        });
        return;
      }
      const bp = getBlueprint(blueprintId);
      if (!bp) return;
      const sim = simulate(bp, { usersConcurrent: 2500, requestsPerUserPerSec: 1 });
      set({
        studioGraph: JSON.parse(JSON.stringify(bp)),
        studioTraffic: 2500,
        studioSimResult: sim,
        studioSelectedNodeId: null,
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

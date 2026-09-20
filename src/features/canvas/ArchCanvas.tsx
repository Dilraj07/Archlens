import React, { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Edge,
  Node,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArchNode } from './ArchNode';
import { useArchStore } from '../../store/useArchStore';
import { ArchGraph } from '../../engine/types';

const nodeTypes = {
  archNode: ArchNode,
};

/**
 * Computes deterministic layered layout positions for the architecture nodes.
 */
function computeNodePositions(graph: ArchGraph): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const layers: Record<string, number> = {};

  // Assign layers based on node type
  for (const node of graph.nodes) {
    switch (node.type) {
      case 'client':
        layers[node.id] = 0;
        break;
      case 'cdn':
      case 'load_balancer':
      case 'rate_limiter':
        layers[node.id] = 1;
        break;
      case 'service':
        layers[node.id] = 2;
        break;
      case 'cache':
      case 'queue':
        layers[node.id] = 3;
        break;
      case 'database':
      case 'worker':
      case 'external':
        layers[node.id] = 4;
        break;
      default:
        layers[node.id] = 2;
    }
  }

  // Group nodes by layer
  const nodesByLayer: Record<number, string[]> = {};
  for (const [nodeId, layer] of Object.entries(layers)) {
    if (!nodesByLayer[layer]) nodesByLayer[layer] = [];
    nodesByLayer[layer]!.push(nodeId);
  }

  const LAYER_Y_SPACING = 160;
  const NODE_X_SPACING = 270;

  for (const [layerStr, nodeIds] of Object.entries(nodesByLayer)) {
    const layer = Number(layerStr);
    const totalWidth = (nodeIds.length - 1) * NODE_X_SPACING;
    const startX = -totalWidth / 2; // Perfectly centered at 0

    nodeIds.forEach((id, index) => {
      positions[id] = {
        x: startX + index * NODE_X_SPACING,
        y: layer * LAYER_Y_SPACING + 40,
      };
    });
  }

  return positions;
}

/** Inner component that can access the ReactFlow instance */
const ArchCanvasInner: React.FC = () => {
  const activeBlueprint = useArchStore((s) => s.activeBlueprint);
  const currentResult = useArchStore((s) => s.currentResult);
  const selectedNodeId = useArchStore((s) => s.selectedNodeId);
  const selectNode = useArchStore((s) => s.selectNode);
  const activeIncident = useArchStore((s) => s.activeIncident);
  const revealedNodeIds = useArchStore((s) => s.revealedNodeIds);
  const tourActiveNodeIds = useArchStore((s) => s.tourActiveNodeIds);

  const { fitView } = useReactFlow();
  const positions = useMemo(() => computeNodePositions(activeBlueprint), [activeBlueprint]);

  // Auto-zoom to highlighted nodes whenever tour step changes
  useEffect(() => {
    if (!tourActiveNodeIds || tourActiveNodeIds.length === 0) return;
    const timer = setTimeout(() => {
      fitView({
        nodes: tourActiveNodeIds.map((id) => ({ id })),
        padding: 0.5,
        duration: 500,
        maxZoom: 1.2,
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [tourActiveNodeIds, fitView]);

  // Generate Flow Nodes
  const nodes: Node[] = useMemo(() => {
    return activeBlueprint.nodes.map((nodeSpec) => {
      const isMaskedInIncident =
        Boolean(activeIncident) && !revealedNodeIds.includes(nodeSpec.id);
      const metrics = currentResult.nodes[nodeSpec.id];
      const isCriticalPath = currentResult.criticalPath.includes(nodeSpec.id);
      const isTourActive = tourActiveNodeIds ? tourActiveNodeIds.includes(nodeSpec.id) : false;
      const isTourDimmed = tourActiveNodeIds ? !tourActiveNodeIds.includes(nodeSpec.id) : false;

      return {
        id: nodeSpec.id,
        type: 'archNode',
        position: positions[nodeSpec.id] || { x: 0, y: 0 },
        selected: selectedNodeId === nodeSpec.id,
        data: {
          spec: nodeSpec,
          metrics,
          isMaskedInIncident,
          isCriticalPath,
          isTourActive,
          isTourDimmed,
        },
      };
    });
  }, [
    activeBlueprint.nodes,
    positions,
    selectedNodeId,
    activeIncident,
    revealedNodeIds,
    currentResult,
    tourActiveNodeIds,
  ]);

  // Generate Flow Edges — pipe color/width/animation reflect DOWNSTREAM node load,
  // so dragging the traffic slider makes overloaded pipes visibly go red + pulse.
  const edges: Edge[] = useMemo(() => {
    return activeBlueprint.edges.map((edgeSpec) => {
      const isCriticalPath =
        currentResult.criticalPath.includes(edgeSpec.source) &&
        currentResult.criticalPath.includes(edgeSpec.target);

      const isTourEdge = tourActiveNodeIds
        ? tourActiveNodeIds.includes(edgeSpec.source) || tourActiveNodeIds.includes(edgeSpec.target)
        : false;

      const targetMetrics = currentResult.nodes[edgeSpec.target];
      const util = targetMetrics?.utilization ?? 0;
      const health = targetMetrics?.health;

      let strokeColor = '#313131';
      let strokeWidth = 2;
      let animated = false;
      let extraClass: string | undefined;

      if (tourActiveNodeIds) {
        // Tour mode: preserve narration highlighting
        if (isTourEdge) { strokeColor = '#3cffd0'; strokeWidth = 3; animated = true; }
        else { strokeColor = '#222222'; strokeWidth = 1.5; }
      } else if (edgeSpec.isAsync) {
        strokeColor = '#5200ff';
        animated = util > 0.4;
      } else if (health === 'overloaded') {
        strokeColor = '#ff3366';
        strokeWidth = 4;
        animated = true;
        extraClass = 'edge-flow-active edge-overloaded';
      } else if (health === 'degraded') {
        strokeColor = '#ffb703';
        strokeWidth = 3;
        animated = true;
        extraClass = 'edge-flow-active';
      } else if (util > 0.15) {
        // Any live traffic — pipe glows teal and pulses proportionally
        strokeColor = '#3cffd0';
        strokeWidth = 2 + Math.min(1.5, util * 2);
        animated = true;
        extraClass = 'edge-flow-active';
      } else if (isCriticalPath) {
        strokeColor = '#3cffd0';
        strokeWidth = 2.5;
        animated = true;
        extraClass = 'edge-flow-active';
      }

      return {
        id: edgeSpec.id,
        source: edgeSpec.source,
        target: edgeSpec.target,
        animated,
        className: extraClass ?? (tourActiveNodeIds && isTourEdge ? 'edge-flow-active' : undefined),
        style: {
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: edgeSpec.isAsync ? '4,4' : undefined,
          opacity: tourActiveNodeIds && !isTourEdge ? 0.3 : 1,
        },
      };
    });
  }, [activeBlueprint.edges, currentResult, tourActiveNodeIds]);

  return (
    <div className="absolute inset-0 bg-[#131313]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_e, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#2d2d2d" />
        <Controls
          showInteractive={false}
          className="!bg-[#2d2d2d] !border-[#313131] !rounded-20px overflow-hidden [&>button]:!bg-[#2d2d2d] [&>button]:!border-b-[#313131] [&>button]:!text-white hover:[&>button]:!bg-[#3cffd0] hover:[&>button]:!text-black"
        />
      </ReactFlow>
    </div>
  );
};

export const ArchCanvas: React.FC = () => (
  <ReactFlowProvider>
    <ArchCanvasInner />
  </ReactFlowProvider>
);




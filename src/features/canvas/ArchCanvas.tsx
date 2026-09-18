import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  BackgroundVariant,
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

export const ArchCanvas: React.FC = () => {
  const activeBlueprint = useArchStore((s) => s.activeBlueprint);
  const currentResult = useArchStore((s) => s.currentResult);
  const selectedNodeId = useArchStore((s) => s.selectedNodeId);
  const selectNode = useArchStore((s) => s.selectNode);
  const activeIncident = useArchStore((s) => s.activeIncident);
  const revealedNodeIds = useArchStore((s) => s.revealedNodeIds);

  const positions = useMemo(() => computeNodePositions(activeBlueprint), [activeBlueprint]);

  // Generate Flow Nodes
  const nodes: Node[] = useMemo(() => {
    return activeBlueprint.nodes.map((nodeSpec) => {
      const isMaskedInIncident =
        Boolean(activeIncident) && !revealedNodeIds.includes(nodeSpec.id);
      const metrics = currentResult.nodes[nodeSpec.id];
      const isCriticalPath = currentResult.criticalPath.includes(nodeSpec.id);

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
  ]);

  // Generate Flow Edges
  const edges: Edge[] = useMemo(() => {
    return activeBlueprint.edges.map((edgeSpec) => {
      const isCriticalPath =
        currentResult.criticalPath.includes(edgeSpec.source) &&
        currentResult.criticalPath.includes(edgeSpec.target);

      let strokeColor = '#313131';
      let strokeWidth = 2;
      let animated = false;

      if (edgeSpec.isAsync) {
        strokeColor = '#5200ff';
      } else if (isCriticalPath) {
        strokeColor = '#3cffd0';
        strokeWidth = 2.5;
        animated = true;
      }

      return {
        id: edgeSpec.id,
        source: edgeSpec.source,
        target: edgeSpec.target,
        animated,
        className: isCriticalPath ? 'edge-flow-active' : undefined,
        style: {
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: edgeSpec.isAsync ? '4,4' : undefined,
        },
      };
    });
  }, [activeBlueprint.edges, currentResult.criticalPath]);

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
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="#2d2d2d"
        />
        <Controls
          showInteractive={false}
          className="!bg-[#2d2d2d] !border-[#313131] !rounded-20px overflow-hidden [&>button]:!bg-[#2d2d2d] [&>button]:!border-b-[#313131] [&>button]:!text-white hover:[&>button]:!bg-[#3cffd0] hover:[&>button]:!text-black"
        />
      </ReactFlow>
    </div>
  );
};

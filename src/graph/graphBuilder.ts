import type { BuildingJson, Graph, NodeState, EdgeState, NodeType } from './types';

export function buildGraph(data: BuildingJson): Graph {
  const nodes: Record<string, NodeState> = {};
  const edges: Record<string, EdgeState> = {};
  const adjacencyList: Record<string, string[]> = {};

  const blockedNodesSet = new Set(data.initial_state?.blocked_nodes || []);
  const blockedEdgesSet = new Set(data.initial_state?.blocked_edges || []);
  const closedExitsSet = new Set(data.initial_state?.closed_exits || []);

  for (const rawNode of data.nodes) {
    nodes[rawNode.id] = {
      id: rawNode.id,
      label: rawNode.label,
      type: rawNode.type as NodeType,
      x: rawNode.x,
      y: rawNode.y,
      isBlocked: blockedNodesSet.has(rawNode.id),
      isExitClosed: rawNode.type === 'exit' ? closedExitsSet.has(rawNode.id) : false,
    };
    adjacencyList[rawNode.id] = [];
  }

  for (const rawEdge of data.edges) {
    edges[rawEdge.id] = {
      id: rawEdge.id,
      from: rawEdge.from,
      to: rawEdge.to,
      cost: rawEdge.cost,
      isBlocked: blockedEdgesSet.has(rawEdge.id),
    };

    if (adjacencyList[rawEdge.from]) {
      adjacencyList[rawEdge.from].push(rawEdge.id);
    }
    if (adjacencyList[rawEdge.to] && rawEdge.from !== rawEdge.to) {
      adjacencyList[rawEdge.to].push(rawEdge.id);
    }
  }

  return { nodes, edges, adjacencyList };
}

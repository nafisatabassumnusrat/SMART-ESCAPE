import type { Graph, RouteResult } from './types';

interface PQElement {
  nodeId: string;
  cost: number;
  pathNodes: string[];
  pathEdges: string[];
}

function isLexicographicallySmaller(pathA: string[], pathB: string[]): boolean {
  const len = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < len; i++) {
    if (pathA[i] !== pathB[i]) {
      return pathA[i].localeCompare(pathB[i]) < 0;
    }
  }
  return pathA.length < pathB.length;
}

export function findBestEscapeRoute(graph: Graph, startId: string): RouteResult {
  const startNode = graph.nodes[startId];
  if (!startNode) return { status: 'NO_ROUTE' };
  
  if (startNode.isBlocked) {
    return { status: 'START_BLOCKED' };
  }

  const distances: Record<string, number> = {};
  const bestPaths: Record<string, { pathNodes: string[], pathEdges: string[] }> = {};
  
  for (const nodeId of Object.keys(graph.nodes)) {
    distances[nodeId] = Infinity;
  }
  distances[startId] = 0;
  bestPaths[startId] = { pathNodes: [startId], pathEdges: [] };
  
  const pq: PQElement[] = [];
  pq.push({ nodeId: startId, cost: 0, pathNodes: [startId], pathEdges: [] });
  
  const visited = new Set<string>();

  while (pq.length > 0) {
    pq.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return isLexicographicallySmaller(a.pathNodes, b.pathNodes) ? -1 : 1;
    });

    const current = pq.shift()!;

    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    if (current.cost > distances[current.nodeId]) continue;
    
    const edges = graph.adjacencyList[current.nodeId] || [];
    for (const edgeId of edges) {
      const edge = graph.edges[edgeId];
      if (!edge || edge.isBlocked) continue;

      const neighborId = edge.from === current.nodeId ? edge.to : edge.from;
      const neighbor = graph.nodes[neighborId];
      
      if (!neighbor || neighbor.isBlocked) continue;

      if (neighbor.type === 'exit' && neighbor.isExitClosed) continue;

      const newCost = current.cost + edge.cost;
      const newPathNodes = [...current.pathNodes, neighborId];
      const newPathEdges = [...current.pathEdges, edgeId];

      let isBetter = false;
      if (newCost < distances[neighborId]) {
        isBetter = true;
      } else if (newCost === distances[neighborId]) {
        const existingPath = bestPaths[neighborId]?.pathNodes || [];
        if (isLexicographicallySmaller(newPathNodes, existingPath)) {
          isBetter = true;
        }
      }

      if (isBetter) {
        distances[neighborId] = newCost;
        bestPaths[neighborId] = { pathNodes: newPathNodes, pathEdges: newPathEdges };
        pq.push({
          nodeId: neighborId,
          cost: newCost,
          pathNodes: newPathNodes,
          pathEdges: newPathEdges
        });
      }
    }
  }

  let bestExit: string | null = null;
  let bestExitCost = Infinity;

  for (const nodeId of Object.keys(graph.nodes)) {
    const node = graph.nodes[nodeId];
    if (node.type === 'exit' && !node.isExitClosed && distances[nodeId] < Infinity) {
      const cost = distances[nodeId];
      if (cost < bestExitCost) {
        bestExit = nodeId;
        bestExitCost = cost;
      } else if (cost === bestExitCost) {
        if (!bestExit || nodeId.localeCompare(bestExit) < 0) {
          bestExit = nodeId;
        }
      }
    }
  }

  if (bestExit) {
    return {
      status: 'SUCCESS',
      exitId: bestExit,
      pathNodes: bestPaths[bestExit].pathNodes,
      pathEdges: bestPaths[bestExit].pathEdges,
      totalCost: bestExitCost
    };
  }

  return { status: 'NO_ROUTE' };
}

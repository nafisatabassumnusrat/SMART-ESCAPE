export type NodeType = 'room' | 'junction' | 'exit';

export interface RawNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
}

export interface RawEdge {
  id: string;
  from: string;
  to: string;
  cost: number;
}

export interface RawInitialState {
  blocked_nodes?: string[];
  blocked_edges?: string[];
  closed_exits?: string[];
}

export interface BuildingJson {
  building: string;
  nodes: RawNode[];
  edges: RawEdge[];
  initial_state?: RawInitialState;
}

export interface NodeState {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  isBlocked: boolean;
  isExitClosed: boolean;
}

export interface EdgeState {
  id: string;
  from: string;
  to: string;
  cost: number;
  isBlocked: boolean;
}

export interface Graph {
  nodes: Record<string, NodeState>;
  edges: Record<string, EdgeState>;
  adjacencyList: Record<string, string[]>;
}

export interface RouteResult {
  status: 'SUCCESS' | 'NO_ROUTE' | 'START_BLOCKED';
  exitId?: string;
  pathNodes?: string[];
  pathEdges?: string[];
  totalCost?: number;
}

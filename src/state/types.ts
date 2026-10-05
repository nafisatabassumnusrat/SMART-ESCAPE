import type { BuildingJson, Graph, RouteResult } from '../graph/types';

export type InteractionMode = 'select_start' | 'block_node' | 'block_edge' | 'close_exit';

export interface AppState {
  originalData: BuildingJson | null;
  graph: Graph | null;
  startNode: string | null;
  routeResult: RouteResult | null;
  language: 'en' | 'bn';
  error: string | null;
  interactionMode: InteractionMode;
}

export type Action =
  | { type: 'LOAD_DATA'; payload: { data: BuildingJson; graph: Graph } }
  | { type: 'SET_START_NODE'; payload: string }
  | { type: 'TOGGLE_NODE_BLOCK'; payload: string }
  | { type: 'TOGGLE_EDGE_BLOCK'; payload: string }
  | { type: 'TOGGLE_EXIT_CLOSE'; payload: string }
  | { type: 'SET_ROUTE_RESULT'; payload: RouteResult | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'bn' }
  | { type: 'SET_INTERACTION_MODE'; payload: InteractionMode }
  | { type: 'RESET' };

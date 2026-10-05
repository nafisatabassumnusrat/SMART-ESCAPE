import { useReducer, useEffect } from 'react';
import type { AppState, Action } from './types';
import { buildGraph } from '../graph/graphBuilder';
import { findBestEscapeRoute } from '../graph/dijkstra';

const initialState: AppState = {
  originalData: null,
  graph: null,
  startNode: null,
  routeResult: null,
  language: 'en',
  error: null,
  interactionMode: 'select_start',
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        originalData: action.payload.data,
        graph: action.payload.graph,
        startNode: null,
        error: null,
      };
    case 'SET_START_NODE':
      return { ...state, startNode: action.payload };
    case 'TOGGLE_NODE_BLOCK': {
      if (!state.graph) return state;
      const nodeId = action.payload;
      const newGraph = { ...state.graph, nodes: { ...state.graph.nodes } };
      newGraph.nodes[nodeId] = { ...newGraph.nodes[nodeId], isBlocked: !newGraph.nodes[nodeId].isBlocked };
      return { ...state, graph: newGraph };
    }
    case 'TOGGLE_EDGE_BLOCK': {
      if (!state.graph) return state;
      const edgeId = action.payload;
      const newGraph = { ...state.graph, edges: { ...state.graph.edges } };
      newGraph.edges[edgeId] = { ...newGraph.edges[edgeId], isBlocked: !newGraph.edges[edgeId].isBlocked };
      return { ...state, graph: newGraph };
    }
    case 'TOGGLE_EXIT_CLOSE': {
      if (!state.graph) return state;
      const exitId = action.payload;
      const newGraph = { ...state.graph, nodes: { ...state.graph.nodes } };
      newGraph.nodes[exitId] = { ...newGraph.nodes[exitId], isExitClosed: !newGraph.nodes[exitId].isExitClosed };
      return { ...state, graph: newGraph };
    }
    case 'SET_ROUTE_RESULT':
      return { ...state, routeResult: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_INTERACTION_MODE':
      return { ...state, interactionMode: action.payload };
    case 'RESET': {
      if (!state.originalData) return state;
      const resetGraph = buildGraph(state.originalData);
      return {
        ...state,
        graph: resetGraph,
        startNode: null,
        error: null,
        interactionMode: 'select_start',
      };
    }
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Auto-calculate route when graph or startNode changes
  useEffect(() => {
    if (state.graph && state.startNode) {
      const result = findBestEscapeRoute(state.graph, state.startNode);
      dispatch({ type: 'SET_ROUTE_RESULT', payload: result });
    } else if (!state.startNode) {
      dispatch({ type: 'SET_ROUTE_RESULT', payload: null });
    }
  }, [state.graph, state.startNode]);

  return { state, dispatch };
}

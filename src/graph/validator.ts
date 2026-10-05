import type { BuildingJson } from './types';

export function validateBuildingJson(data: any): { valid: boolean; errors: string[]; parsed?: BuildingJson } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Root must be a JSON object.'] };
  }

  if (typeof data.building !== 'string' || !data.building.trim()) {
    errors.push('Missing or empty "building" name.');
  }

  if (!Array.isArray(data.nodes)) {
    errors.push('Missing or invalid "nodes" array.');
  }

  if (!Array.isArray(data.edges)) {
    errors.push('Missing or invalid "edges" array.');
  }

  if (errors.length > 0) return { valid: false, errors };

  const nodeIds = new Set<string>();

  data.nodes.forEach((node: any, i: number) => {
    if (!node.id || typeof node.id !== 'string') errors.push(`Node at index ${i} is missing a valid "id".`);
    else {
      if (nodeIds.has(node.id)) errors.push(`Duplicate node ID found: "${node.id}"`);
      nodeIds.add(node.id);
    }

    if (typeof node.label !== 'string' || !node.label.trim()) {
      errors.push(`Node "${node.id}" is missing a valid non-empty "label".`);
    }

    if (!['room', 'junction', 'exit'].includes(node.type)) {
      errors.push(`Node "${node.id}" has invalid type "${node.type}".`);
    }

    if (typeof node.x !== 'number') errors.push(`Node "${node.id}" is missing a valid "x" coordinate.`);
    if (typeof node.y !== 'number') errors.push(`Node "${node.id}" is missing a valid "y" coordinate.`);
  });

  const edgeIds = new Set<string>();
  data.edges.forEach((edge: any, i: number) => {
    if (!edge.id || typeof edge.id !== 'string') errors.push(`Edge at index ${i} is missing a valid "id".`);
    else {
      if (edgeIds.has(edge.id)) errors.push(`Duplicate edge ID found: "${edge.id}"`);
      edgeIds.add(edge.id);
    }
    
    if (typeof edge.from !== 'string' || !nodeIds.has(edge.from)) {
      errors.push(`Edge "${edge.id || i}" references invalid/missing from node "${edge.from}".`);
    }
    if (typeof edge.to !== 'string' || !nodeIds.has(edge.to)) {
      errors.push(`Edge "${edge.id || i}" references invalid/missing to node "${edge.to}".`);
    }
    if (typeof edge.cost !== 'number' || edge.cost < 0 || !Number.isInteger(edge.cost)) {
      errors.push(`Edge "${edge.id || i}" has an invalid cost (must be a positive integer).`);
    }
  });

  if (data.initial_state) {
    if (data.initial_state.blocked_nodes && !Array.isArray(data.initial_state.blocked_nodes)) {
      errors.push('"initial_state.blocked_nodes" must be an array.');
    } else if (data.initial_state.blocked_nodes) {
      data.initial_state.blocked_nodes.forEach((id: any) => {
         if (!nodeIds.has(id)) errors.push(`Blocked node "${id}" does not exist.`);
         else {
             const node = data.nodes.find((n: any) => n.id === id);
             if (node && node.type === 'exit') errors.push(`Blocked node "${id}" cannot be an exit.`);
         }
      });
    }

    if (data.initial_state.blocked_edges && !Array.isArray(data.initial_state.blocked_edges)) {
      errors.push('"initial_state.blocked_edges" must be an array.');
    } else if (data.initial_state.blocked_edges) {
      data.initial_state.blocked_edges.forEach((id: any) => {
         if (!edgeIds.has(id)) errors.push(`Blocked edge "${id}" does not exist.`);
      });
    }

    if (data.initial_state.closed_exits && !Array.isArray(data.initial_state.closed_exits)) {
      errors.push('"initial_state.closed_exits" must be an array.');
    } else if (data.initial_state.closed_exits) {
      data.initial_state.closed_exits.forEach((id: any) => {
         if (!nodeIds.has(id)) errors.push(`Closed exit "${id}" does not exist.`);
         else {
             const node = data.nodes.find((n: any) => n.id === id);
             if (node && node.type !== 'exit') errors.push(`Closed exit "${id}" is not an exit.`);
         }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    parsed: errors.length === 0 ? (data as BuildingJson) : undefined
  };
}

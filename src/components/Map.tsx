import React, { useMemo, useState } from 'react';
import type { Graph, RouteResult } from '../graph/types';
import type { InteractionMode } from '../state/types';

interface MapProps {
  graph: Graph;
  startNode: string | null;
  routeResult: RouteResult | null;
  interactionMode: InteractionMode;
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (edgeId: string) => void;
}

export const Map: React.FC<MapProps> = ({ graph, startNode, routeResult, interactionMode, onNodeClick, onEdgeClick }) => {
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; text: string }>({
    visible: false, x: 0, y: 0, text: ''
  });

  const viewBox = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    Object.values(graph.nodes).forEach(node => {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    });

    const padding = 80;
    const width = Math.max(maxX - minX + padding * 2, 200);
    const height = Math.max(maxY - minY + padding * 2, 200);
    return `${minX - padding} ${minY - padding} ${width} ${height}`;
  }, [graph.nodes]);

  const routeEdgeSet = useMemo(() => new Set(routeResult?.pathEdges || []), [routeResult]);
  const routeNodeSet = useMemo(() => new Set(routeResult?.pathNodes || []), [routeResult]);

  const handleMouseMove = (e: React.MouseEvent, text: string) => {
    setTooltip({ visible: true, x: e.clientX + 15, y: e.clientY + 15, text });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <>
      <div className="bg-grid" />
      <svg className="map-svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={{ background: '#f5f7fa', borderRadius: 'var(--radius-lg)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
        {/* Edges */}
        {Object.values(graph.edges).map(edge => {
          const source = graph.nodes[edge.from];
          const target = graph.nodes[edge.to];
          if (!source || !target) return null;

          const isRoute = routeEdgeSet.has(edge.id);
          const isBlocked = edge.isBlocked;
          const cx = (source.x + target.x) / 2;
          const cy = (source.y + target.y) / 2;
          
          const isClickable = interactionMode === 'block_edge';

          return (
            <g key={`edge-${edge.id}`} 
               onClick={() => isClickable && onEdgeClick(edge.id)}
               style={{ cursor: isClickable ? 'pointer' : 'default' }}
               onMouseMove={(e) => handleMouseMove(e, `CORRIDOR: ${edge.from} → ${edge.to} | COST: ${edge.cost}${isBlocked ? ' | BLOCKED' : ''}`)}
               onMouseLeave={handleMouseLeave}>
              <line
                x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                className={`edge-line ${isBlocked ? 'blocked' : ''} ${isRoute ? 'route' : ''}`}
                style={{ strokeWidth: isRoute ? 6 : 4, stroke: isRoute ? 'var(--route-path)' : isBlocked ? 'var(--node-closed)' : '#CBD5E1', opacity: isBlocked ? 0.3 : 1 }}
              />
              <rect x={cx - 16} y={cy - 10} width="32" height="20" rx="4" fill="#fff" stroke="#CBD5E1" strokeWidth="1" />
              <text x={cx} y={cy} fontSize="12" fill="#475569" fontWeight="600" textAnchor="middle" dominantBaseline="middle">{edge.cost}</text>
            </g>
          );
        })}

        {/* Nodes */}
        {Object.values(graph.nodes).map(node => {
          const isSelected = startNode === node.id;
          const isBlocked = node.isBlocked || (node.type === 'exit' && node.isExitClosed);

          let fill = 'var(--node-room)';
          let stroke = 'var(--node-room-text)';
          let textColor = 'var(--node-room-text)';

          if (node.type === 'junction') {
            fill = 'var(--node-junction)';
            stroke = 'var(--node-junction-text)';
            textColor = 'var(--node-junction-text)';
          } else if (node.type === 'exit') {
            fill = 'var(--node-exit)';
            stroke = 'var(--node-exit-text)';
            textColor = 'var(--node-exit-text)';
          }
          
          if (isBlocked) {
            fill = 'var(--node-blocked)';
            stroke = '#94A3B8';
            textColor = '#94A3B8';
          }

          let NodeShape = <circle cx="0" cy="0" r="22" fill={fill} stroke={stroke} strokeWidth="2" />;
          if (node.type === 'junction') NodeShape = <polygon points="0,-24 24,0 0,24 -24,0" fill={fill} stroke={stroke} strokeWidth="2" />;
          if (node.type === 'exit') NodeShape = <rect x="-20" y="-20" width="40" height="40" rx="6" fill={fill} stroke={stroke} strokeWidth="2" />;

          return (
            <g
              key={`node-${node.id}`}
              onClick={() => onNodeClick(node.id)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseMove={(e) => handleMouseMove(e, `${node.label} (${node.id}) | ${node.type.toUpperCase()}${isBlocked ? ' | BLOCKED' : ''}`)}
              onMouseLeave={handleMouseLeave}
            >
              {isSelected && <circle cx="0" cy="0" r="32" fill="none" stroke="#A855F7" strokeWidth="3" opacity="0.6" />}
              {NodeShape}
              <text y="-4" fontSize="12" fontWeight="700" fill={textColor} textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>{node.id}</text>
              <text y="8" fontSize="8" fontWeight="500" fill={textColor} textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>({node.type})</text>
              
              {isBlocked && (
                <g transform="translate(14, -14)">
                  <circle cx="0" cy="0" r="8" fill="#EF4444" />
                  <path d="M-3,-3 L3,3 M-3,3 L3,-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {tooltip.visible && (
        <div className="tooltip visible" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </>
  );
};

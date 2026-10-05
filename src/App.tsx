import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { useAppState } from './state/useAppState';
import { validateBuildingJson } from './graph/validator';
import { buildGraph } from './graph/graphBuilder';
import { translations } from './i18n/translations';
import { Map } from './components/Map';
import { Upload, RotateCcw, ShieldAlert, CheckCircle2, XCircle, Map as MapIcon, MousePointer2, Ban, Link2Off, Lock } from 'lucide-react';

function App() {
  const { state, dispatch } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  
  const t = translations[state.language];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validation = validateBuildingJson(json);
        
        if (!validation.valid || !validation.parsed) {
          dispatch({ type: 'SET_ERROR', payload: validation.errors.join('\n') });
          return;
        }

        const graph = buildGraph(validation.parsed);
        dispatch({ type: 'LOAD_DATA', payload: { data: validation.parsed, graph } });
      } catch (err: any) {
        dispatch({ type: 'SET_ERROR', payload: `Invalid JSON format: ${err.message}` });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMapNodeClick = (nodeId: string) => {
    const node = state.graph?.nodes[nodeId];
    if (!node) return;
    
    if (state.interactionMode === 'select_start') {
      if (node.type !== 'exit' && !node.isBlocked) {
        dispatch({ type: 'SET_START_NODE', payload: nodeId });
      }
    } else if (state.interactionMode === 'block_node') {
      if (node.type !== 'exit') {
        dispatch({ type: 'TOGGLE_NODE_BLOCK', payload: nodeId });
      }
    } else if (state.interactionMode === 'close_exit') {
      if (node.type === 'exit') {
        dispatch({ type: 'TOGGLE_EXIT_CLOSE', payload: nodeId });
      }
    }
  };

  const handleMapEdgeClick = (edgeId: string) => {
    if (state.interactionMode === 'block_edge') {
      dispatch({ type: 'TOGGLE_EDGE_BLOCK', payload: edgeId });
    }
  };

  return (
    <div className="app-container">
      <div className={`app-loader ${!loading ? 'hide' : ''}`}>
        <div className="spinner"></div>
        <h2 style={{ letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{t.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t.initializing}</p>
      </div>

      <header className="header" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="header-brand">
          <div className="header-logo" style={{ color: 'var(--accent-emerald)', background: 'var(--node-exit)', borderRadius: '50%', padding: '4px' }}>
            <MapIcon size={24} />
          </div>
          <div className="header-title">
            <h1 style={{ color: 'var(--text-main)' }}>{t.title}</h1>
            <p style={{ color: 'var(--text-muted)', textTransform: 'none' }}>{t.subtitle}</p>
          </div>
        </div>
        <div className="header-controls">
          <button style={{ background: 'var(--surface-hover)' }} onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'bn' : 'en' })}>
            {t.language}
          </button>
        </div>
      </header>

      <div className="workspace">
        
        {/* LEFT SIDEBAR - LEGEND / MENU */}
        <aside className="left-sidebar">
          <label className="import-zone" style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer' }}>
            <Upload size={20} color="var(--accent-emerald)" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.importBtn}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.importSub}</div>
            <input type="file" accept=".json" onChange={handleFileUpload} ref={fileInputRef} style={{ display: 'none' }} />
          </label>

          <button className="primary" onClick={() => dispatch({ type: 'RESET' })} disabled={!state.originalData} style={{ width: '100%', justifyContent: 'center' }}>
            <RotateCcw size={16} /> {t.resetBtn}
          </button>

          {state.graph && (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>{t.nodeTypes}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--node-room)', border: '2px solid var(--node-room-text)' }}></div> {t.room}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', transform: 'rotate(45deg)', background: 'var(--node-junction)', border: '2px solid var(--node-junction-text)' }}></div> {t.junction}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--node-exit)', border: '2px solid var(--node-exit-text)' }}></div> {t.exit}
              </div>
              
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>{t.states}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--node-blocked)' }}></div> {t.blocked}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--node-closed)' }}></div> {t.closedExit}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #A855F7' }}></div> {t.selectedStart}
              </div>
            </div>
          )}
        </aside>

        {/* CENTER MAIN CONTENT */}
        <main className="main-content">
          {!state.graph ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <MapIcon size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
              <div style={{ color: 'var(--text-muted)' }}>{t.emptyStateText}</div>
            </div>
          ) : (
            <>
              <div className="status-bar">
                <CheckCircle2 size={16} color="var(--accent-emerald)" />
                <span style={{ fontWeight: 600, color: 'var(--accent-emerald)', fontSize: '0.875rem' }}>{t.buildingLoaded}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t.nodesCount}: <strong>{Object.keys(state.graph.nodes).length}</strong></span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t.edgesCount}: <strong>{Object.keys(state.graph.edges).length}</strong></span>
              </div>

              {/* Map Area */}
              <div className="map-wrapper">
                <Map 
                  graph={state.graph} 
                  startNode={state.startNode} 
                  routeResult={state.routeResult}
                  interactionMode={state.interactionMode}
                  onNodeClick={handleMapNodeClick}
                  onEdgeClick={handleMapEdgeClick}
                />
              </div>

              {/* Interaction Modes Panel */}
              <div className="interaction-modes-panel">
                <button 
                  style={{ flex: 1, background: state.interactionMode === 'select_start' ? '#EFF6FF' : 'transparent', border: state.interactionMode === 'select_start' ? '1px solid #93C5FD' : '1px solid transparent', color: state.interactionMode === 'select_start' ? '#1D4ED8' : 'var(--text-main)' }}
                  onClick={() => dispatch({ type: 'SET_INTERACTION_MODE', payload: 'select_start' })}
                >
                  <MousePointer2 size={16} /> {t.selectStart}
                </button>
                <button 
                  style={{ flex: 1, background: state.interactionMode === 'block_node' ? '#FEF2F2' : 'transparent', border: state.interactionMode === 'block_node' ? '1px solid #FCA5A5' : '1px solid transparent', color: state.interactionMode === 'block_node' ? '#B91C1C' : 'var(--text-main)' }}
                  onClick={() => dispatch({ type: 'SET_INTERACTION_MODE', payload: 'block_node' })}
                >
                  <Ban size={16} /> {t.blockNode}
                </button>
                <button 
                  style={{ flex: 1, background: state.interactionMode === 'block_edge' ? '#FFFBEB' : 'transparent', border: state.interactionMode === 'block_edge' ? '1px solid #FDE68A' : '1px solid transparent', color: state.interactionMode === 'block_edge' ? '#B45309' : 'var(--text-main)' }}
                  onClick={() => dispatch({ type: 'SET_INTERACTION_MODE', payload: 'block_edge' })}
                >
                  <Link2Off size={16} /> {t.blockEdge}
                </button>
                <button 
                  style={{ flex: 1, background: state.interactionMode === 'close_exit' ? '#F8FAFC' : 'transparent', border: state.interactionMode === 'close_exit' ? '1px solid #CBD5E1' : '1px solid transparent', color: state.interactionMode === 'close_exit' ? '#334155' : 'var(--text-main)' }}
                  onClick={() => dispatch({ type: 'SET_INTERACTION_MODE', payload: 'close_exit' })}
                >
                  <Lock size={16} /> {t.closeExit}
                </button>
              </div>
            </>
          )}
        </main>

        {/* RIGHT SIDEBAR - ROUTE INFO */}
        <aside className="right-sidebar">
          {state.routeResult ? (
            <>
              {state.routeResult.status === 'SUCCESS' && (
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {t.routeInfo}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t.start}</div>
                      <div style={{ fontWeight: 600, color: '#A855F7' }}>{state.startNode}</div>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>→</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t.exit}</div>
                      <div style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{state.routeResult.exitId}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>{t.path}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    {state.routeResult.pathNodes?.map((n, i) => (
                      <React.Fragment key={i}>
                        <div style={{ padding: '0.25rem 0.5rem', background: n === state.routeResult?.exitId ? 'var(--node-exit)' : '#EFF6FF', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: n === state.routeResult?.exitId ? 'var(--node-exit-text)' : '#1D4ED8', border: '1px solid var(--border)' }}>
                          {n}
                        </div>
                        {i < state.routeResult!.pathNodes!.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.totalCost}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{state.routeResult.totalCost}</div>
                  </div>
                </div>
              )}
              
              {state.routeResult.status === 'START_BLOCKED' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '1.25rem', color: '#B91C1C' }}>
                  <XCircle size={24} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t.startBlocked}</div>
                  <div style={{ fontSize: '0.875rem' }}>{t.startBlockedSub}</div>
                </div>
              )}

              {state.routeResult.status === 'NO_ROUTE' && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '1.25rem', color: '#B45309' }}>
                  <ShieldAlert size={24} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t.noRoute}</div>
                  <div style={{ fontSize: '0.875rem' }}>{t.noRouteSub}</div>
                </div>
              )}
            </>
          ) : (
             <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem', opacity: 0.5 }}>
               <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>{t.routeInfo}</div>
               <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.selectStartPrompt}</div>
             </div>
          )}

          {state.graph && (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>{t.hazardStatus}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{t.hazardStatusSub}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;

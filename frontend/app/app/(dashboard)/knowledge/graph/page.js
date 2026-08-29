'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });
import { useUser, useAuth } from '@clerk/nextjs';
import { Network } from 'lucide-react';

const GraphExplorer = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [fetchError, setFetchError] = useState(false);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch(`http://13.211.60.208:8000/api/v1/graph/ws_1/export`);
        if (response.ok) {
          const data = await response.json();
          setGraphData(data);
        } else {
          setFetchError(true);
        }
      } catch (err) {
        console.warn('[Graph Explorer] Backend unavailable, showing empty state:', err.message);
        setFetchError(true);
      }
    };
    fetchGraph();
  }, []);

  const isEmpty = fetchError || graphData.nodes.length === 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1 className="page-title">Graph Explorer</h1>
        <p className="page-subtitle">Interactive 3D visualization of your workspace relationship intelligence.</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, position: 'relative', borderRadius: '16px', overflow: 'hidden', minHeight: '600px' }}>
        <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>

          {isEmpty ? (
            /* ── Empty / Error state ── */
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px',
              background: '#0A0B0F', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '32px'
            }}>
              <Network size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
              <div>
                <h3 style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: '8px' }}>
                  {fetchError ? 'Knowledge Graph unavailable' : 'No knowledge graph yet'}
                </h3>
                <p style={{ fontSize: '0.875rem', maxWidth: '360px' }}>
                  {fetchError
                    ? 'The API server is not running or has no graph data. Start the backend and ingest documents to populate your graph.'
                    : 'Ingest your first documents via the Connectors page to build your knowledge graph.'}
                </p>
              </div>
            </div>
          ) : (
            /* ── Live 3D Graph ── */
            <>
              {/* Legend */}
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Network size={16} style={{ color: 'var(--accent)' }} />
                  Legend
                </h3>
                <div className="flex-col" style={{ gap: '0.75rem' }}>
                  <div className="flex-row" style={{ gap: '0.75rem' }}><div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6' }}></div> <span style={{ fontSize: '0.9rem' }}>Documents</span></div>
                  <div className="flex-row" style={{ gap: '0.75rem' }}><div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div> <span style={{ fontSize: '0.9rem' }}>Entities</span></div>
                  <div className="flex-row" style={{ gap: '0.75rem' }}><div style={{ width: '12px', height: '12px', background: '#a855f7', borderRadius: '50%', boxShadow: '0 0 10px #a855f7' }}></div> <span style={{ fontSize: '0.9rem' }}>Concepts</span></div>
                </div>
              </div>

              <ForceGraph3D
                graphData={graphData}
                nodeColor={(node) => {
                  if (node.group === "Document") return "#6366F1";
                  if (node.group === "Entity") return "#10B981";
                  return "#8B5CF6";
                }}
                nodeLabel="label"
                linkLabel="label"
                nodeRelSize={6}
                linkWidth={2}
                linkColor={() => "rgba(255, 255, 255, 0.2)"}
                linkDirectionalArrowLength={3}
                linkDirectionalArrowRelPos={1}
                backgroundColor="#0A0B0F"
                width={dimensions.width}
                height={dimensions.height}
                onNodeClick={(node) => setSelectedNode(node)}
              />

              {/* Node Inspector Panel */}
              {selectedNode && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '320px', zIndex: 10, background: 'var(--bg-panel)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-focus)', color: 'var(--text-main)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, color: 'var(--accent)' }}>Node Inspector</h3>
                    <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                  </div>
                  <div className="flex-col" style={{ gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Label</span>
                      <div style={{ fontWeight: '500', fontSize: '1rem' }}>{selectedNode.label}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Type</span>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedNode.group === 'Document' ? '#6366F1' : (selectedNode.group === 'Entity' ? '#10B981' : '#8B5CF6') }}></div>
                        {selectedNode.group}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>System ID</span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{selectedNode.id}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default GraphExplorer;

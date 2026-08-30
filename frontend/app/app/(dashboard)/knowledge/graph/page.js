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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/graph/ws_1/export`);
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
    <div style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div className="page-header">
        <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Graph Explorer</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Interactive 3D visualization of your workspace relationship intelligence.</p>
      </div>

      <div className="glass-panel" style={{ 
        width: '100%',
        maxWidth: '100%',
        position: 'relative', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        height: 'calc(100vh - 220px)',
        minHeight: '480px',
        maxHeight: '600px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        background: 'radial-gradient(circle at 50% 50%, #FAF5FF 0%, #F5F3FF 45%, #FFFFFF 100%)'
      }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>

          {isEmpty ? (
            /* ── Empty / Error state ── */
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px',
              background: 'transparent', color: 'var(--text-secondary)', textAlign: 'center', padding: '32px'
            }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Network size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 650, marginBottom: '8px', fontSize: '1.125rem' }}>
                  {fetchError ? 'Knowledge Graph unavailable' : 'No knowledge graph yet'}
                </h3>
                <p style={{ fontSize: '0.875rem', maxWidth: '360px', color: 'var(--text-muted)' }}>
                  {fetchError
                    ? 'The API server is not running or has no graph data. Start the backend and ingest documents to populate your graph.'
                    : 'Ingest your first documents via the Connectors page to build your knowledge graph.'}
                </p>
              </div>
            </div>
          ) : (
            /* ── Live 3D Graph ── */
            <>
              {/* Floating Legend */}
              <div style={{ 
                position: 'absolute', top: '1.25rem', left: '1.25rem', zIndex: 10, 
                background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', 
                padding: '1rem 1.25rem', borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.9)', 
                color: 'var(--text-primary)', 
                boxShadow: '0 10px 30px rgba(99, 91, 255, 0.08)' 
              }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <Network size={16} color="var(--primary)" />
                  Entity Relationships
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '10px', height: '10px', background: '#635BFF', borderRadius: '50%', boxShadow: '0 0 8px rgba(99, 91, 255, 0.6)' }}></div> 
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Documents</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}></div> 
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Entities & Facts</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '10px', height: '10px', background: '#EC4899', borderRadius: '50%', boxShadow: '0 0 8px rgba(236, 72, 153, 0.6)' }}></div> 
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Concepts</span>
                  </div>
                </div>
              </div>

              {/* Bottom Instructions Tip */}
              <div style={{
                position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
                zIndex: 10, background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(8px)',
                padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border)',
                fontSize: '0.75rem', color: 'var(--text-muted)', pointerEvents: 'none'
              }}>
                Left-click: Rotate • Scroll: Zoom • Right-click: Pan
              </div>

              <ForceGraph3D
                graphData={graphData}
                nodeColor={(node) => {
                  if (node.group === "Document") return "#4F46E5";
                  if (node.group === "Entity") return "#059669";
                  return "#D946EF";
                }}
                nodeLabel="label"
                linkLabel="label"
                nodeRelSize={9}
                nodeResolution={24}
                nodeOpacity={0.95}
                linkWidth={2.5}
                linkColor={() => "rgba(79, 70, 229, 0.45)"}
                linkDirectionalArrowLength={4.5}
                linkDirectionalArrowRelPos={1}
                linkDirectionalParticles={3}
                linkDirectionalParticleWidth={2.5}
                linkDirectionalParticleColor={() => "#635BFF"}
                backgroundColor="rgba(0,0,0,0)"
                showNavInfo={false}
                width={dimensions.width}
                height={dimensions.height}
                onNodeClick={(node) => setSelectedNode(node)}
              />

              {/* Node Inspector Panel */}
              {selectedNode && (
                <div style={{ 
                  position: 'absolute', top: '1.25rem', right: '1.25rem', width: '320px', zIndex: 10, 
                  background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(16px)', 
                  padding: '1.25rem', borderRadius: '16px', 
                  border: '1px solid var(--border)', color: 'var(--text-primary)', 
                  boxShadow: '0 12px 36px rgba(0,0,0,0.08)' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: 'var(--primary)' }}>Node Details</h3>
                    <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>&times;</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Label</span>
                      <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)' }}>{selectedNode.label}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Classification</span>
                      <div style={{ fontWeight: '500', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedNode.group === 'Document' ? '#635BFF' : (selectedNode.group === 'Entity' ? '#10B981' : '#EC4899') }}></div>
                        {selectedNode.group}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>System ID</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all', fontFamily: 'monospace', background: 'var(--surface-soft)', padding: '4px 8px', borderRadius: '6px', marginTop: '2px' }}>{selectedNode.id}</div>
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

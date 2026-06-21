'use client';
import React, { useState, useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useUser, useAuth } from '@clerk/nextjs';
import { Network } from 'lucide-react';

const GraphExplorer = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const response = await fetch(`http://localhost:8000/api/v1/graph/${user.id}/export`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setGraphData(data);
        }
      } catch (err) {
        console.error("Failed to fetch graph data:", err);
      }
    };
    fetchGraph();
  }, [user]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1 className="page-title">Graph Explorer</h1>
        <p className="page-subtitle">Interactive 3D visualization of your workspace relationship intelligence.</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, position: 'relative', borderRadius: '16px', overflow: 'hidden', minHeight: '600px' }}>
        {/* ResizeObserver Target */}
        <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          
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
          nodeColor={(node) => "#3b82f6"} // Modern Blue
          nodeLabel="label"
          linkLabel="label"
          nodeRelSize={5}
          linkWidth={3}
          linkColor={(link) => "rgba(34, 197, 94, 0.4)"} // Soft glowing green edges
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          backgroundColor="#ffffff" // White background per user request
          width={dimensions.width}
          height={dimensions.height}
        />
        </div>
      </div>
    </div>

  );
};

export default GraphExplorer;


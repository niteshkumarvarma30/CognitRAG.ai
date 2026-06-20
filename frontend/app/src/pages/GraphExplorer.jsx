import React, { useState, useEffect, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useUser, useAuth } from '@clerk/clerk-react';

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
    <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1 className="page-title">Graph Explorer</h1>
        <p className="page-subtitle">Interactive 3D visualization of your workspace relationship intelligence.</p>
      </div>

      <div ref={containerRef} className="glass-panel" style={{ flex: 1, overflow: 'hidden', position: 'relative', borderRadius: '16px' }}>
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Legend</h3>
          <div className="flex-col" style={{ gap: '0.5rem' }}>
            <div className="flex-row" style={{ gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '50%' }}></div> <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Documents</span></div>
            <div className="flex-row" style={{ gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '50%' }}></div> <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Entities</span></div>
            <div className="flex-row" style={{ gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: '#9333ea', borderRadius: '50%' }}></div> <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Other Concepts</span></div>
          </div>
        </div>
        
        <ForceGraph3D
          graphData={graphData}
          nodeColor={(node) => "#2563eb"} // Deep Blue for all nodes
          nodeLabel="label"
          linkLabel="label"
          nodeRelSize={5}
          linkWidth={5}
          linkColor={(link) => "#16a34a"} // Solid Green for all edges
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          backgroundColor="#ffffff"
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    </div>
  );
};

export default GraphExplorer;

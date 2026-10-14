'use client';
import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

const graphData = {
  nodes: [
    { id: 'cognitrag', name: 'CognitRAG', role: 'Central Engine', color: '#818CF8', val: 18 },
    { id: 'slack', name: 'Slack', role: 'Slack: discussions and decisions', color: '#38BDF8', val: 10 },
    { id: 'github', name: 'GitHub', role: 'GitHub: pull requests, reviews, issues', color: '#818CF8', val: 10 },
    { id: 'jira', name: 'Jira', role: 'Jira: tickets, status, ownership', color: '#22C55E', val: 10 },
    { id: 'notion', name: 'Notion', role: 'Notion: specs and docs', color: '#F59E0B', val: 10 }
  ],
  links: [
    { source: 'slack', target: 'cognitrag' },
    { source: 'github', target: 'cognitrag' },
    { source: 'jira', target: 'cognitrag' },
    { source: 'notion', target: 'cognitrag' }
  ]
};

export default function HeroGraph3D() {
  const fgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const userInteracted = useRef(false);

  useEffect(() => {
    let angle = 0;
    let animId;
    const rotate = () => {
      if (!userInteracted.current && fgRef.current) {
        angle += 0.003;
        const distance = 160;
        fgRef.current.cameraPosition({
          x: distance * Math.sin(angle),
          z: distance * Math.cos(angle)
        });
        animId = requestAnimationFrame(rotate);
      }
    };
    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      style={{ width: '100%', height: '360px', position: 'relative' }}
      onPointerDown={() => { userInteracted.current = true; }}
    >
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={4}
        nodeColor={(node) => node.color}
        linkColor={() => 'rgba(129, 140, 248, 0.4)'}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        showNavInfo={false}
        enableNodeDrag={false}
        onNodeHover={(node) => setHoveredNode(node)}
        width={420}
        height={360}
      />
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg2)',
          border: '1px solid var(--line)',
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '0.8rem',
          color: 'var(--ink)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {hoveredNode.role}
        </div>
      )}
    </div>
  );
}

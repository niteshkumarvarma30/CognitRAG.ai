'use client';
import React, { useEffect, useState } from 'react';

const FloatingGraphBackground = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    // Generate a static random constellation of nodes that will animate via CSS
    const generatedNodes = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      size: Math.random() * 8 + 4, // 4px to 12px
      delay: Math.random() * 10,
      duration: Math.random() * 15 + 15, // 15s to 30s
    }));

    // Create some random connections between them
    const generatedEdges = [];
    for (let i = 0; i < 20; i++) {
      const source = generatedNodes[Math.floor(Math.random() * generatedNodes.length)];
      const target = generatedNodes[Math.floor(Math.random() * generatedNodes.length)];
      if (source.id !== target.id) {
        // Calculate distance to set width and rotation
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        generatedEdges.push({
          id: i,
          x: source.x,
          y: source.y,
          width: length,
          angle: angle,
          delay: Math.random() * 5
        });
      }
    }

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, []);

  return (
    <div className="floating-bg">
      {/* Render Edges */}
      {edges.map((edge) => (
        <div 
          key={`edge-${edge.id}`}
          className="floating-edge"
          style={{
            left: `${edge.x}%`,
            top: `${edge.y}%`,
            width: `${edge.width}vw`, // approximate scaling
            transform: `rotate(${edge.angle}deg)`,
            animationDelay: `${edge.delay}s`
          }}
        />
      ))}
      
      {/* Render Nodes */}
      {nodes.map((node) => (
        <div 
          key={`node-${node.id}`}
          className="floating-node"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}px`,
            height: `${node.size}px`,
            animationDelay: `${node.delay}s`,
            animationDuration: `${node.duration}s`
          }}
        />
      ))}
    </div>
  );
};

export default FloatingGraphBackground;

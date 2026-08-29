'use client';
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export default function HeroSection({ onEarlyAccess }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // Generate an abstract 3D neural network/graph shape for the background
    const N = 50;
    const nodes = Array.from({ length: N }).map((_, id) => ({ id, val: Math.random() * 1.5 + 1 }));
    const links = Array.from({ length: 60 }).map(() => ({
      source: Math.floor(Math.random() * N),
      target: Math.floor(Math.random() * N)
    }));
    setGraphData({ nodes, links });
  }, []);

  return (
    <section style={{
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '120px',
      paddingBottom: '100px',
      background: 'radial-gradient(circle at top left, rgba(99, 91, 255, 0.05), transparent 50%)',
      paddingLeft: '24px',
      paddingRight: '24px'
    }}>
      {/* 3D Knowledge Graph Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        opacity: 0.6 // Subtle opacity so text is readable
      }}>
        <ForceGraph3D
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeColor={() => '#635bff'}
          linkColor={() => 'rgba(99,91,255,0.2)'}
          showNavInfo={false}
          enableNodeDrag={false}
          enableZoom={false}
        />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '4rem',
        flexWrap: 'wrap',
        pointerEvents: 'none' // Let clicks pass through to Spline...
      }}>
        {/* Left Side */}
        <div style={{ flex: '1 1 60%', minWidth: '300px', pointerEvents: 'auto' /* ...but keep this interactive */ }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'var(--surface-soft)',
            color: 'var(--primary)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: '24px'
          }}>
            COMPANY BRAIN
          </div>
          <h1 style={{
            fontSize: '3.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            margin: '0 0 24px 0'
          }}>
            Your company already has a brain.<br />
            <span style={{ color: 'var(--primary)' }}>Connect it.</span>
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem',
            maxWidth: '560px',
            lineHeight: 1.6,
            margin: '0 0 40px 0'
          }}>
            CognitRAG connects fragmented company knowledge and turns it into trusted context for people and AI agents.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onEarlyAccess} style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Get Early Access
            </button>
            <a href="#how-it-works" style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center'
            }}>
              See How It Works →
            </a>
          </div>
        </div>

        {/* Right Side */}
        <div style={{ flex: '1 1 30%', minWidth: '300px', pointerEvents: 'auto' }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), var(--shadow-xl)',
            border: '1px solid var(--border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}>
              <Search size={20} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9375rem' }}>What changed in billing this week?</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                color: '#0284c7'
              }}>Jira BILL-902</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                color: 'var(--success)'
              }}>GitHub PR #1287</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                color: 'var(--violet)'
              }}>Slack #engineering</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px'
            }}>
              <CheckCircle2 size={16} color="var(--success)" fill="var(--surface)" style={{ strokeWidth: 2, background: 'var(--success)', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)' }}>High Confidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

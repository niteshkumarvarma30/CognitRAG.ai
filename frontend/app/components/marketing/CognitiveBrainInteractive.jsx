'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, CheckCircle2, ShieldCheck, Database, FileText, ArrowRight, Eye } from 'lucide-react';

export default function CognitiveBrainInteractive() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [activeStage, setActiveStage] = useState('brain'); // 'cube' | 'brain' | 'sphere'
  const [selectedScenario, setSelectedScenario] = useState(0);

  const scenarios = [
    {
      inputName: 'Microsoft FY23 10-K.pdf (Dense Financial)',
      inputSnippet: 'Consolidated Statements of Income (Page 48, Note 19)...',
      query: 'What was total FY23 revenue and tax provision?',
      cypher: '(:Company {name: "Microsoft"})-[:REPORTED {year: 2023}]->(:Revenue {val: "$211.9B"})',
      answer: 'FY23 Total Revenue was $211.9B with a tax provision of $16.95B.',
      confidence: '99.8%',
      sources: 'SEC 10-K Filing p.48, Note 19',
      cubeColor: '#F43F5E'
    },
    {
      inputName: 'Slack #incident-902 & GitHub PR #1287',
      inputSnippet: 'DB migration caused 504 gateway timeout on webhook receiver...',
      query: 'Why did customer ACME fail payment webhooks on Tuesday?',
      cypher: '(:Incident {id: "INC-902"})-[:AFFECTED]->(:Customer {id: "ACME"})<-[:RESOLVED_BY]-(:PR {id: 1287})',
      answer: '504 timeouts caused a delivery backlog; switching to idempotent backoff fixed it.',
      confidence: '99.2%',
      sources: 'Jira SUP-404, GitHub PR #1287, Slack',
      cubeColor: '#6366F1'
    },
    {
      inputName: 'Architecture ADR-014 & Living SOP v4.1',
      inputSnippet: 'Monolith payment pipeline decoupling approved by Marcus Vance...',
      query: 'Who approved the microservices split and refund limit policy?',
      cypher: '(:Person {name: "Marcus Vance"})-[:AUTHORED]->(:ADR {id: "ADR-014"})-[:SETS_LIMIT]->(:Policy "$500")',
      answer: 'Authored by VP Eng Marcus Vance; Tier-2 agents can issue refunds up to $500.',
      confidence: '100%',
      sources: 'ADR-014.md, Operations SOP v4.1',
      cubeColor: '#10B981'
    }
  ];

  const current = scenarios[selectedScenario];

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });

    // Determine active stage based on horizontal position
    if (x < 0.32) {
      setActiveStage('cube');
    } else if (x > 0.68) {
      setActiveStage('sphere');
    } else {
      setActiveStage('brain');
    }
  };

  // Dynamic curve offset based on mouse position
  const curveOffsetX = (mousePos.x - 0.5) * 40;
  const curveOffsetY = (mousePos.y - 0.5) * 40;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 20px 50px -12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Top Controls & Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid #F1F5F9',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: activeStage === 'cube' ? '#F43F5E' : activeStage === 'brain' ? '#4F46E5' : '#10B981',
            boxShadow: '0 0 12px currentColor',
            transition: 'all 0.2s ease'
          }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
            Cognitive Pipeline Visualizer
          </span>
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#64748B',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '2px 8px',
            borderRadius: '999px'
          }}>
            Hover with mouse to track
          </span>
        </div>

        {/* Scenario Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['Financial 10-K', 'Dev Incident', 'Policy / SOP'].map((label, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedScenario(idx)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 650,
                cursor: 'pointer',
                border: selectedScenario === idx ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                background: selectedScenario === idx ? '#EEF2FF' : '#FFFFFF',
                color: selectedScenario === idx ? '#4F46E5' : '#64748B',
                transition: 'all 0.15s ease'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2D Interactive Stage */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '340px',
        background: 'radial-gradient(ellipse 90% 70% at 50% 50%, #FAF5FF 0%, #FFFFFF 100%)',
        borderRadius: '18px',
        border: '1px solid #F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        overflow: 'hidden'
      }}>
        {/* Subtle background precision grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(79, 70, 229, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        {/* Interactive SVG Pipeline Canvas */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 1000 360"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Input to Eye line */}
          <line
            x1="220"
            y1="180"
            x2="370"
            y2="180"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Active Flowing Beam from Cube into Brain */}
          <path
            d={`M 220 180 Q ${295 + curveOffsetX * 0.5} ${180 + curveOffsetY * 0.5} 370 180`}
            fill="none"
            stroke="url(#beamGradient)"
            strokeWidth={activeStage === 'cube' ? '4' : '2.5'}
            filter="url(#glowFilter)"
          />

          {/* Animated Flow Dot: Input -> Brain */}
          <circle r="5" fill="#F43F5E">
            <animateMotion
              path={`M 220 180 Q ${295 + curveOffsetX * 0.5} ${180 + curveOffsetY * 0.5} 370 180`}
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Tangled Reasoning Loop inside the Brain Head that untangles to the right */}
          {/* Loop 1: Complex Cognitive Scribble */}
          <path
            d={`M 400 180 
                C ${420 + curveOffsetX} ${130 + curveOffsetY}, ${440 - curveOffsetX} ${240 - curveOffsetY}, ${480 + curveOffsetX * 0.3} ${140}
                C ${520 - curveOffsetX} ${100}, ${450 + curveOffsetY} ${260}, ${510} ${230}
                C ${550} ${210}, ${470} ${140}, ${540 + curveOffsetX * 0.5} ${160}
                C ${580} ${175}, ${600} ${180}, 650 180`}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={activeStage === 'brain' ? '3.5' : '2'}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
            style={{ transition: 'all 0.1s linear' }}
          />

          {/* Loop 2: Secondary Graph Weaver Strand */}
          <path
            d={`M 420 170 
                C ${460 - curveOffsetY} ${110}, ${490 + curveOffsetX} ${250}, ${530} ${170}
                C ${570} ${110}, ${530} ${240}, ${610 + curveOffsetX * 0.2} ${180}
                L 650 180`}
            fill="none"
            stroke="#6366F1"
            strokeWidth={activeStage === 'brain' ? '2.5' : '1.5'}
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* Arrow Output from Head to Sphere */}
          <line
            x1="650"
            y1="180"
            x2="780"
            y2="180"
            stroke="#10B981"
            strokeWidth="3.5"
            markerEnd="url(#arrowhead)"
          />

          {/* Animated Flow Dot: Brain -> Verified Sphere */}
          <circle r="6" fill="#10B981">
            <animateMotion
              path="M 650 180 L 780 180"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Interactive Mouse Tracker Beam */}
          <line
            x1={mousePos.x * 1000}
            y1={mousePos.y * 360}
            x2={activeStage === 'cube' ? 180 : activeStage === 'brain' ? 500 : 820}
            y2={180}
            stroke="rgba(99, 102, 241, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="2 4"
          />

          {/* Mouse Crosshair Point */}
          <circle
            cx={mousePos.x * 1000}
            cy={mousePos.y * 360}
            r="4"
            fill="#4F46E5"
            opacity="0.6"
          />
        </svg>

        {/* 1. LEFT: Raw Data Isometric Cube (The Input) */}
        <div
          onClick={() => setActiveStage('cube')}
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transform: activeStage === 'cube' ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.2s ease',
            width: '210px'
          }}
        >
          {/* Label Badge */}
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: '#F43F5E',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
            background: 'rgba(244, 63, 94, 0.1)',
            padding: '3px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(244, 63, 94, 0.25)'
          }}>
            01. RAW DATA INPUT
          </div>

          {/* 3D-Styled 2D Isometric Cube */}
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '8px 0' }}>
            {/* SVG Isometric Cube */}
            <svg width="90" height="90" viewBox="0 0 100 100">
              {/* Top Face */}
              <polygon points="50,15 85,35 50,55 15,35" fill="#FDA4AF" stroke="#F43F5E" strokeWidth="2" />
              {/* Left Face */}
              <polygon points="15,35 50,55 50,95 15,75" fill="#F43F5E" stroke="#E11D48" strokeWidth="2" />
              {/* Right Face */}
              <polygon points="50,55 85,35 85,75 50,95" fill="#E11D48" stroke="#BE123C" strokeWidth="2" />
            </svg>

            {/* Glowing Icon Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#FFFFFF'
            }}>
              <FileText size={22} />
            </div>
          </div>

          <div style={{
            fontSize: '0.8125rem',
            fontWeight: 750,
            color: '#0F172A',
            textAlign: 'center',
            marginTop: '6px'
          }}>
            Fragmented Enterprise Data
          </div>
          <div style={{
            fontSize: '0.6875rem',
            color: '#64748B',
            textAlign: 'center',
            maxWidth: '170px'
          }}>
            PDFs, Slack, Jira & DBs
          </div>
        </div>

        {/* 2. CENTER: Head Profile Silhouette with Tangled Reasoning Cognitive Core */}
        <div
          onClick={() => setActiveStage('brain')}
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transform: activeStage === 'brain' ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.2s ease',
            width: '260px'
          }}
        >
          {/* Label Badge */}
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: '#4F46E5',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '6px',
            background: 'rgba(79, 70, 229, 0.1)',
            padding: '3px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(79, 70, 229, 0.25)'
          }}>
            02. COGNITIVE REASONING & GRAPH
          </div>

          {/* SVG Head Silhouette with Eye and Disambiguation Hub */}
          <div style={{ position: 'relative', width: '200px', height: '170px' }}>
            <svg width="200" height="170" viewBox="0 0 200 170" style={{ overflow: 'visible' }}>
              {/* Human Head Silhouette Facing Left */}
              <path
                d="M 170 160 
                   L 155 125 
                   C 175 105, 180 50, 145 20 
                   C 115 -5, 60 0, 45 35 
                   C 35 55, 38 75, 42 90 
                   L 30 96 
                   L 32 108 
                   L 46 112 
                   C 42 120, 36 128, 48 135 
                   L 55 138 
                   L 58 160 Z"
                fill="#0F172A"
                opacity="0.95"
              />

              {/* The Eye of the Silhouette (Looking at the Input Cube) */}
              <g transform="translate(48, 70)">
                <ellipse cx="14" cy="8" rx="12" ry="7" fill="#FFFFFF" />
                <circle cx={12 + (mousePos.x - 0.5) * 4} cy={8 + (mousePos.y - 0.5) * 4} r="4" fill="#4F46E5" />
                <circle cx={13 + (mousePos.x - 0.5) * 4} cy={7 + (mousePos.y - 0.5) * 4} r="1.5" fill="#FFFFFF" />
              </g>

              {/* Glowing Coreference & Knowledge Nodes Inside Brain */}
              <circle cx="100" cy="55" r="5" fill="#38BDF8" opacity="0.9" />
              <circle cx="130" cy="70" r="4" fill="#F59E0B" opacity="0.9" />
              <circle cx="115" cy="95" r="6" fill="#10B981" opacity="0.9" />
              <circle cx="85" cy="85" r="4.5" fill="#EC4899" opacity="0.9" />

              {/* Inter-node connection lines inside brain */}
              <line x1="100" y1="55" x2="130" y2="70" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />
              <line x1="130" y1="70" x2="115" y2="95" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" />
              <line x1="115" y1="95" x2="85" y2="85" stroke="#10B981" strokeWidth="1.5" opacity="0.6" />
              <line x1="85" y1="85" x2="100" y2="55" stroke="#EC4899" strokeWidth="1.5" opacity="0.6" />
            </svg>

            {/* Cognitive Center Label */}
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1E293B',
              color: '#F8FAFC',
              fontSize: '0.625rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              border: '1px solid #334155'
            }}>
              Untangling Multi-Hop Paths
            </div>
          </div>

          <div style={{
            fontSize: '0.8125rem',
            fontWeight: 750,
            color: '#0F172A',
            textAlign: 'center',
            marginTop: '10px'
          }}>
            Company Brain Disambiguation
          </div>
          <div style={{
            fontSize: '0.6875rem',
            color: '#64748B',
            textAlign: 'center',
            maxWidth: '200px'
          }}>
            Resolves coreferences & builds verified graph paths
          </div>
        </div>

        {/* 3. RIGHT: Clean Resolved Sphere (The Verified Ground Truth Answer) */}
        <div
          onClick={() => setActiveStage('sphere')}
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transform: activeStage === 'sphere' ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.2s ease',
            width: '210px'
          }}
        >
          {/* Label Badge */}
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            color: '#10B981',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '3px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}>
            03. RESOLVED GROUND TRUTH
          </div>

          {/* 3D-Styled Glowing 2D Sphere */}
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '8px 0' }}>
            <svg width="90" height="90" viewBox="0 0 100 100">
              <defs>
                <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#A7F3D0" />
                  <stop offset="40%" stopColor="#34D399" />
                  <stop offset="85%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="42" fill="url(#sphereGrad)" stroke="#059669" strokeWidth="2" />
            </svg>

            {/* Glowing Icon Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#FFFFFF'
            }}>
              <CheckCircle2 size={28} />
            </div>
          </div>

          <div style={{
            fontSize: '0.8125rem',
            fontWeight: 750,
            color: '#0F172A',
            textAlign: 'center',
            marginTop: '6px'
          }}>
            100% Auditable Truth
          </div>
          <div style={{
            fontSize: '0.6875rem',
            color: '#64748B',
            textAlign: 'center',
            maxWidth: '170px'
          }}>
            Grounded citations & 98.2% faithfulness
          </div>
        </div>
      </div>

      {/* Dynamic Interactive HUD Info Drawer */}
      <div style={{
        marginTop: '18px',
        background: '#F8FAFC',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Search size={14} color="#4F46E5" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0F172A' }}>
              Query: "{current.query}"
            </span>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#475569',
            fontFamily: 'monospace',
            background: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ color: '#4F46E5', fontWeight: 700 }}>Cypher Path: </span>
            {current.cypher}
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: '8px',
          padding: '10px 14px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>
              Ground Truth Answer
            </span>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              background: '#DCFCE7',
              color: '#15803D',
              padding: '1px 6px',
              borderRadius: '999px'
            }}>
              {current.confidence} Confidence
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 650, color: '#0F172A' }}>
            {current.answer}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
            Source: <strong>{current.sources}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

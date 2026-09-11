'use client';
import React, { useState } from 'react';
import { FileText, MessageSquare, GitBranch, CheckCircle2, ArrowRight, ShieldCheck, Database, Sparkles } from 'lucide-react';

export default function GroundedScenariosSection() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const scenarios = [
    {
      source: 'Microsoft FY23 10-K.pdf',
      page: 'Page 48, Note 12',
      icon: FileText,
      color: '#EA580C',
      bgGlow: 'rgba(234, 88, 12, 0.08)',
      borderColor: 'rgba(234, 88, 12, 0.25)',
      type: 'SEC Financial Filing',
      query: 'What was our total FY23 revenue and growth rate?',
      answer: '$211.9B (+7% YoY)',
      detail: 'Extracted from Consolidated Statements of Income with strict June 30 fiscal-year anchoring to avoid date drift.',
      confidence: '99.8%'
    },
    {
      source: 'Slack #incident-902 & PR #1287',
      page: 'Thread: 14:22 UTC',
      icon: MessageSquare,
      color: '#6366F1',
      bgGlow: 'rgba(99, 102, 241, 0.08)',
      borderColor: 'rgba(99, 102, 241, 0.25)',
      type: 'Production Incident',
      query: 'What caused the Webhook 504 timeout during flash sale?',
      answer: 'DB lock contention on webhook queue',
      detail: 'Correlated real-time engineer triage discussion in Slack with merged GitHub migration PR within 32ms.',
      confidence: '99.4%'
    },
    {
      source: 'Architecture ADR-014 & Living SOP',
      page: 'Section 4.2 Auth Limits',
      icon: GitBranch,
      color: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      type: 'Engineering Governance',
      query: 'What is the Tier-2 refund policy limit without VP signoff?',
      answer: 'Approved by VP Eng up to $500',
      detail: 'Traversed organizational policy graph to verify active delegation limits and signed executive approval logs.',
      confidence: '100%'
    }
  ];

  return (
    <section id="grounded-scenarios" style={{
      width: '100%',
      padding: '96px 24px 80px 24px',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(248, 247, 244, 0.4) 0%, rgba(255, 255, 255, 0.9) 100%)'
    }}>
      <div style={{
        maxWidth: '1240px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '720px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(234, 88, 12, 0.1)',
            border: '1px solid rgba(234, 88, 12, 0.2)',
            color: '#EA580C',
            padding: '5px 14px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}>
            <Sparkles size={13} />
            Live Grounded Intelligence
          </div>

          <h2 style={{
            fontSize: 'clamp(1.875rem, 3.2vw, 2.5rem)',
            fontWeight: 850,
            color: '#18181B',
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            margin: '0 0 12px 0'
          }}>
            Real Enterprise Queries. 98.2% Audited Grounding.
          </h2>

          <p style={{
            color: '#52525B',
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: 0
          }}>
            See how CognitRAG queries documents, Slack triage, and codebases to deliver mathematically grounded answers with full citation provenance.
          </p>
        </div>

        {/* 3 Grounded Intelligence Cards Grid */}
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '24px'
        }}>
          {scenarios.map((sc, idx) => {
            const isHovered = hoveredIdx === idx;
            const Icon = sc.icon;

            return (
              <div
                key={sc.type}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: isHovered ? `1.5px solid ${sc.color}` : '1.5px solid #EAE8E3',
                  padding: '26px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isHovered 
                    ? `0 16px 36px ${sc.bgGlow}, 0 2px 8px rgba(0,0,0,0.04)`
                    : '0 4px 20px rgba(0,0,0,0.02)',
                  transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Subtle Background Accent Glow */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: isHovered ? sc.color : 'transparent',
                  transition: 'background 0.2s ease'
                }} />

                <div>
                  {/* Card Header: Type Tag & Grounded Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '18px',
                    gap: '10px'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: sc.bgGlow,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.6875rem',
                      fontWeight: 750,
                      color: sc.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      <Icon size={13} />
                      {sc.type}
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: 'rgba(22, 163, 74, 0.08)',
                      color: '#15803d',
                      fontSize: '0.75rem',
                      fontWeight: 750,
                      border: '1px solid rgba(22, 163, 74, 0.2)'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#16a34a'
                      }} />
                      {sc.confidence} Grounded
                    </div>
                  </div>

                  {/* Query Question */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 650,
                      color: '#71717A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '6px'
                    }}>
                      Prompt Query
                    </div>
                    <div style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#18181B',
                      lineHeight: 1.45,
                      background: '#F9F8F6',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #EAE8E3'
                    }}>
                      "{sc.query}"
                    </div>
                  </div>

                  {/* Grounded Answer Box */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 650,
                      color: '#71717A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '6px'
                    }}>
                      Audited Answer
                    </div>
                    <div style={{
                      fontSize: '1.0625rem',
                      fontWeight: 800,
                      color: sc.color,
                      lineHeight: 1.35
                    }}>
                      {sc.answer}
                    </div>
                    <p style={{
                      fontSize: '0.8125rem',
                      color: '#52525B',
                      lineHeight: 1.5,
                      margin: '6px 0 0 0'
                    }}>
                      {sc.detail}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Source Citation */}
                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid #F4F3EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: '#71717A'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <Database size={13} color="#EA580C" />
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#3F3F46',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {sc.source}
                    </span>
                  </div>

                  <span style={{
                    color: '#A1A1AA',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    flexShrink: 0
                  }}>
                    {sc.page}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

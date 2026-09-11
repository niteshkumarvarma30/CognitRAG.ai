'use client';
import React from 'react';
import { Network, ShieldCheck, Cpu, Database, CheckCircle2, ArrowRight, Bot, Zap } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section id="features" style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: 'var(--space-20, 80px) 24px',
      background: 'var(--bg)',
      scrollMarginTop: '80px'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Section Pill & Title */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '48px'
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(234, 88, 12, 0.1)',
              color: '#EA580C',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: '999px',
              marginBottom: '14px'
            }}>
              Why CognitRAG
            </div>
            <h2 style={{
              fontSize: '2.75rem',
              fontWeight: 850,
              color: 'var(--text-primary)',
              letterSpacing: '-0.035em',
              lineHeight: 1.15,
              margin: 0
            }}>
              A real partner,<br />not a chatbot in disguise
            </h2>
          </div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.0625rem',
            maxWidth: '480px',
            margin: 0,
            lineHeight: 1.6
          }}>
            Most AI tools search text chunks in isolation. CognitRAG connects relationships—anticipating context, resolving coreferences, and growing smarter with every interaction.
          </p>
        </div>

        {/* 4-Card Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          width: '100%'
        }}>
          {/* Bento Card 1: Multi-Hop Traversal (7 cols) */}
          <div style={{
            gridColumn: 'span 7',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '36px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '280px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '16px'
              }}>
                <Network size={14} />
                <span>RELATIONAL INTELLIGENCE</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Advanced Multi-Hop Knowledge Graph Traversal
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: '520px' }}>
                Navigate seamlessly across complex corporate hierarchies, multi-year SEC balance sheets, and microservice dependencies with native Neo4j Cypher pathfinding.
              </p>
            </div>

            {/* Visual Node Chain */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '24px',
              padding: '12px 16px',
              background: 'var(--surface-soft)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              fontSize: '0.75rem',
              fontWeight: 650,
              color: 'var(--text-primary)',
              overflowX: 'auto'
            }}>
              <span style={{ padding: '3px 8px', background: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>Entity: Microsoft</span>
              <span style={{ color: 'var(--primary)' }}>-[:HAS_HOLDING]→</span>
              <span style={{ padding: '3px 8px', background: '#ffffff', borderRadius: '4px', border: '1px solid var(--border)' }}>ABS 2023</span>
              <span style={{ color: 'var(--primary)' }}>-[:REPORTED_IN]→</span>
              <span style={{ padding: '3px 8px', background: 'rgba(22, 163, 74, 0.1)', color: '#15803d', borderRadius: '4px', border: '1px solid rgba(22, 163, 74, 0.25)' }}>10-K Page 78 ($11.84B)</span>
            </div>
          </div>

          {/* Bento Card 2: Zero Silent Hallucinations (5 cols) */}
          <div style={{
            gridColumn: 'span 5',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '36px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(22, 163, 74, 0.08)',
                color: '#15803d',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '16px'
              }}>
                <ShieldCheck size={14} />
                <span>SELF-CORRECTION LOOP</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Self-Correcting Refusal Gate
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Dual-pass validation and dynamic confidence calibration (0.024 Brier score) ensure unverified or out-of-domain queries are rejected rather than silently fabricated.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '24px',
              padding: '12px 16px',
              background: 'rgba(22, 163, 74, 0.06)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(22, 163, 74, 0.2)'
            }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803d' }}>
                Audited Faithfulness Score
              </span>
              <span style={{ fontSize: '1.125rem', fontWeight: 850, color: '#15803d' }}>
                98.2%
              </span>
            </div>
          </div>

          {/* Bento Card 3: Model Context Protocol (MCP) Server (5 cols) */}
          <div style={{
            gridColumn: 'span 5',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '36px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(2, 132, 199, 0.08)',
                color: '#0284c7',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '16px'
              }}>
                <Bot size={14} />
                <span>NATIVE MCP PROTOCOL</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Connect Cursor & Claude
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Turn CognitRAG into your team's live external memory. Connect IDEs and internal AI copilots via open Model Context Protocol.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '20px',
              fontSize: '0.75rem',
              fontWeight: 650,
              color: 'var(--text-secondary)'
            }}>
              <span style={{ padding: '4px 8px', background: 'var(--surface-soft)', borderRadius: '4px' }}>Claude Desktop</span>
              <span>•</span>
              <span style={{ padding: '4px 8px', background: 'var(--surface-soft)', borderRadius: '4px' }}>Cursor IDE</span>
              <span>•</span>
              <span style={{ padding: '4px 8px', background: 'var(--surface-soft)', borderRadius: '4px' }}>LangGraph</span>
            </div>
          </div>

          {/* Bento Card 4: Benchmark Superiority (7 cols) */}
          <div style={{
            gridColumn: 'span 7',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '36px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(217, 119, 6, 0.08)',
                color: '#d97706',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '16px'
              }}>
                <Zap size={14} />
                <span>MATHEMATICAL SUPERIORITY</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                94.2% Context Precision vs. 58.4% Naive RAG
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Tested against 400+ pages of complex enterprise financial and technical filings using RAGAS 0.2.x framework. Zero context fragmentation.
              </p>
            </div>

            {/* Comparison Mini Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span style={{ color: 'var(--primary)' }}>⚡ CognitRAG Hybrid Graph-RAG</span>
                  <span style={{ color: 'var(--primary)' }}>94.2%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-soft)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '94.2%', height: '100%', background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', borderRadius: '999px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Naive Vector RAG (Pinecone / Chroma)</span>
                  <span>58.4%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-soft)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '58.4%', height: '100%', background: '#94a3b8', borderRadius: '999px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

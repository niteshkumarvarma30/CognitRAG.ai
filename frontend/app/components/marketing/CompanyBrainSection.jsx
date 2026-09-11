'use client';
import React from 'react';

export default function CompanyBrainSection() {
  return (
    <section id="product" style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '80px 24px',
      scrollMarginTop: '80px'
    }}>
      <div style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          fontWeight: 750,
          marginBottom: '16px'
        }}>
          THE UNIFIED PIPELINE
        </div>
        <h2 style={{
          fontSize: '2.75rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.18,
          margin: '0 0 16px 0'
        }}>
          One Connected Layer for Everything Your Company Knows
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.125rem',
          maxWidth: '650px',
          margin: '0 0 54px 0',
          lineHeight: 1.6
        }}>
          Automated entity extraction, relationship mapping, and multi-tenant graph storage turn scattered workplace documents into an auditable intelligence core.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%'
        }}>
          {/* Box 1 */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 24px',
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              STAGE 01 • INGESTION
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Multi-Source Connectors
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Real-time synchronization across Slack, Jira, GitHub PRs, SEC 10-K PDFs, and SQL tables.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Chunking • Metadata • Tokenization
            </div>
          </div>

          {/* Box 2: Highlighted Core */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--primary)',
            boxShadow: '0 12px 32px rgba(79, 70, 229, 0.12)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 24px',
            textAlign: 'left',
            position: 'relative',
            transform: 'scale(1.02)'
          }}>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              STAGE 02 • GRAPH ENGINE
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '8px' }}>
              Autonomous Company Brain
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Neo4j knowledge graphs map entities, dependencies, coreferences, and historical decisions.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 650 }}>
              ✓ Sub-50ms Graph + pgvector Hybrid Search
            </div>
          </div>

          {/* Box 3 */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 24px',
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              STAGE 03 • VERIFICATION
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Grounded Intelligence
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Audited by reasoning LLM judges with verifiable subgraphs, page citations, and MCP support.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              100% Auditable Citations • 98.2% Faithfulness
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

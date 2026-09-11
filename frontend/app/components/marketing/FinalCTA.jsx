'use client';
import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function FinalCTA({ onEarlyAccess }) {
  return (
    <section style={{
      background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79, 70, 229, 0.09), var(--surface))',
      borderTop: '1px solid var(--border)',
      padding: 'var(--space-24, 96px) var(--space-6, 24px)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '4px 14px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.75rem',
          fontWeight: 750,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} />
          READY IN 60 SECONDS
        </div>

        <h2 style={{
          fontSize: '3rem',
          fontWeight: 850,
          letterSpacing: '-0.035em',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4, 16px)',
          lineHeight: 1.15,
        }}>
          Make Your Company's<br />Intelligence Usable.
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          maxWidth: '540px',
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          Stop losing context to scattered Slack threads and stale PDFs. Build an auditable knowledge graph that evolves with your team.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4, 16px)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onEarlyAccess} style={{
            padding: '16px 36px',
            background: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
            transition: 'all 150ms ease',
          }}>
            Get Early Access <ArrowRight size={16} />
          </button>
          <button onClick={onEarlyAccess} style={{
            padding: '16px 36px',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            fontWeight: 650,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'all 150ms ease',
          }}>
            Book a 15-Min Demo
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          flexWrap: 'wrap',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          marginTop: '32px'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="#16a34a" /> 14-day free trial on Pro
          </span>
          <span>•</span>
          <span>No credit card required</span>
          <span>•</span>
          <span>Export Neo4j graphs anytime</span>
        </div>
      </div>
    </section>
  );
}

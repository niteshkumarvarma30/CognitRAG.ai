'use client';

import { ArrowRight } from 'lucide-react';

export default function FinalCTA({ onEarlyAccess }) {
  return (
    <section style={{
      background: 'var(--surface-dark)',
      padding: 'var(--space-24) var(--space-6)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient orb */}
      <div style={{
        position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,91,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '2.75rem', fontWeight: 700, letterSpacing: '-0.025em',
          color: 'var(--text-on-dark)', marginBottom: 'var(--space-4)', lineHeight: 1.15,
        }}>
          Make your company's<br />intelligence usable.
        </h2>
        <p style={{
          fontSize: '1.0625rem', color: 'var(--text-on-dark-muted)',
          maxWidth: '480px', margin: '0 auto', lineHeight: 1.6,
          marginBottom: 'var(--space-8)',
        }}>
          Stop losing knowledge to fragmentation. Start building a brain 
          that grows with your company.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onEarlyAccess} style={{
            padding: '14px 32px', background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: '1rem', fontWeight: 650, cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            boxShadow: '0 4px 16px rgba(99,91,255,0.4)',
            transition: 'all 150ms ease',
          }}>
            Get Early Access <ArrowRight size={16} />
          </button>
          <button onClick={onEarlyAccess} style={{
            padding: '14px 32px', background: 'transparent',
            color: 'var(--text-on-dark-muted)', border: '1px solid var(--border-dark)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'all 150ms ease',
          }}>
            Book a Demo
          </button>
        </div>
      </div>
    </section>
  );
}

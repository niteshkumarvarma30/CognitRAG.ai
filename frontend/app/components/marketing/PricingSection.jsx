'use client';

import { ArrowRight } from 'lucide-react';

export default function PricingSection({ onEarlyAccess }) {
  return (
    <section style={{ padding: 'var(--space-24) var(--space-6)', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{
            display: 'inline-block', fontSize: '0.6875rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 'var(--space-3)',
          }}>
            BUILD WITH US
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
            We're working with early teams.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Join design partners shaping the next generation of company intelligence.
            We'll schedule a personalized demo within 48 hours.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-8)' }}>
          <button
            onClick={onEarlyAccess}
            style={{
              padding: '14px 36px', background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: '1rem', fontWeight: 650, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              boxShadow: '0 4px 16px rgba(99,91,255,0.35)',
              transition: 'all 150ms ease',
            }}
          >
            Get Early Access <ArrowRight size={16} />
          </button>
          <button
            onClick={onEarlyAccess}
            style={{
              padding: '14px 36px', background: 'transparent',
              color: 'var(--text-secondary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 150ms ease',
            }}
          >
            Talk to Us
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 'var(--space-6)' }}>
          For enterprise deployments, contact us directly.
        </p>
      </div>
    </section>
  );
}

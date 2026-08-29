'use client';

import { RefreshCw, CheckCircle, GitCompare, ArrowRight } from 'lucide-react';

export default function LivingKnowledgeSection() {
  const steps = [
    { icon: RefreshCw, label: 'Change Detected', detail: 'PR #1287 merged → billing deployment process updated', color: 'var(--info)' },
    { icon: GitCompare, label: 'Diff Generated', detail: 'SOP v3.1 → v3.2: Added human review step before production deploy', color: 'var(--warning)' },
    { icon: CheckCircle, label: 'Human Approved', detail: 'Engineering lead reviewed and approved the updated procedure', color: 'var(--success)' },
  ];

  return (
    <section style={{ padding: 'var(--space-24) var(--space-6)', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{
            display: 'inline-block', fontSize: '0.6875rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 'var(--space-3)',
          }}>
            LIVING KNOWLEDGE
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
            Your company changes every day.<br />Your knowledge should too.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            CognitRAG detects changes across your connected sources, generates diffs, and routes 
            updates through human review before publishing to your living knowledge base.
          </p>
        </div>

        {/* Change pipeline visualization */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <div style={{
                  flex: 1, minWidth: '200px',
                  padding: 'var(--space-5)', background: 'var(--surface-soft)',
                  borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: `${step.color}15`, color: step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 'var(--space-3)',
                  }}>
                    <step.icon size={18} />
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {step.detail}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>

          {/* Result */}
          <div style={{
            marginTop: 'var(--space-6)', padding: 'var(--space-5)',
            background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.15)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          }}>
            <CheckCircle size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                Billing Deployment SOP v3.2 — Updated & Active
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Human review step added before production deployment. Approved by @sarah.chen
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

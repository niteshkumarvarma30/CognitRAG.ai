'use client';
import React from 'react';
import { Info } from 'lucide-react';

export default function EarlyResults() {
  // Evaluated runs from verified internal pipeline and leak suites:
  // 1. Cross-tenant permission test suite: eval_runs id: 'run_perm_leak_gate1_20261014'
  // 2. Direct citation grounding suite: eval_runs id: 'run_pipeline_gate2_20261014'
  // 3. Hinglish code-switching retrieval run: eval_runs id: 'run_hinglish_eval_v2_20261014'

  const metrics = [
    {
      value: '0',
      label: 'Cross-Tenant Permission Leaks',
      sample: 'Sample size: n = 10 leak verification test cases',
      note: 'Verified in Gate 1 test suite',
      evalRunId: 'run_perm_leak_gate1_20261014'
    },
    {
      value: '100%',
      label: 'Citation Grounding on Tool Queries',
      sample: 'Sample size: n = 20 synthetic enterprise questions',
      note: 'Every generated claim maps to an active citation',
      evalRunId: 'run_pipeline_gate2_20261014'
    },
    {
      value: '91.4%',
      label: 'Hinglish Query Retrieval Accuracy',
      sample: 'Sample size: n = 35 mixed English-Hindi queries',
      note: 'Evaluated on Jira, GitHub and Slack questions',
      evalRunId: 'run_hinglish_eval_v2_20261014'
    }
  ];

  return (
    <section id="results" style={{
      padding: '64px 0',
      backgroundColor: 'var(--bg2)',
      borderTop: '1px solid var(--line)',
      borderBottom: '1px solid var(--line)'
    }}>
      <div className="landing-container">
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--cy)',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            Evaluated Benchmarks
          </div>
          <h2 className="font-serif-headline" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--ink)',
            margin: '0 0 10px 0',
            fontWeight: 400
          }}>
            Measured, with sample sizes shown.
          </h2>
          <p style={{
            color: 'var(--mute)',
            fontSize: '0.96rem',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            Early internal results on small samples. Methods and limits are available on request.
          </p>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}>
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '28px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div className="font-serif-headline" style={{
                fontSize: '2.8rem',
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1
              }}>
                {m.value}
              </div>

              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--ink)',
                marginTop: '4px'
              }}>
                {m.label}
              </div>

              <div style={{
                fontSize: '0.8rem',
                color: 'var(--mute)',
                fontFamily: 'monospace'
              }}>
                {m.sample}
              </div>

              <div style={{
                fontSize: '0.78rem',
                color: 'var(--mute)',
                marginTop: '4px'
              }}>
                {m.note}
              </div>
            </div>
          ))}
        </div>

        {/* Hinglish Transparency Note */}
        <div style={{
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.84rem',
          color: 'var(--mute)'
        }}>
          <Info size={16} style={{ color: 'var(--cy)', flexShrink: 0 }} />
          <span>
            <strong>Language note:</strong> Mixed-language Hinglish quality is still actively improving as we expand colloquial developer vocabulary across teams.
          </span>
        </div>
      </div>
    </section>
  );
}

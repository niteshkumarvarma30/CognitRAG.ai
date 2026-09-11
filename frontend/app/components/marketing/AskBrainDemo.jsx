'use client';

import { useState } from 'react';

const DEMO_QUERIES = [
  { category: 'Engineering', query: 'What changed in billing this week?', color: 'var(--primary)' },
  { category: 'Support', query: 'Why is customer ACME seeing payment failures?', color: 'var(--violet)' },
  { category: 'Operations', query: 'What is our current refund policy?', color: 'var(--success)' },
  { category: 'Decisions', query: 'Who decided to switch to microservices?', color: 'var(--info)' },
];

const MOCK_RESPONSES = {
  0: {
    answer: 'Three significant changes were made to the billing service this week: PR #1287 added a human review step to the deployment pipeline, the Billing Deployment SOP was updated to v3.2, and the team resolved incident INC-902 which caused intermittent payment processing failures.',
    sources: [
      { type: 'jira', ref: 'BILL-902', label: 'Jira' },
      { type: 'github', ref: 'PR #1287', label: 'GitHub' },
      { type: 'slack', ref: '#engineering', label: 'Slack' },
    ],
    confidence: 'high',
    verifiedCount: '3 sources verified',
  },
  1: {
    answer: 'Customer ACME is encountering retry timeouts on their webhook receiver. During Tuesday\'s DB migration, 504 Gateway Timeouts caused a webhook delivery backlog. Per support ticket SUP-404, switching ACME to idempotent exponential backoff and clearing the dead-letter queue completely resolved the issue.',
    sources: [
      { type: 'jira', ref: 'SUP-404', label: 'Jira' },
      { type: 'confluence', ref: 'Webhook Architecture & Retries', label: 'Confluence' },
      { type: 'slack', ref: '#customer-success', label: 'Slack' },
    ],
    confidence: 'high',
    verifiedCount: '3 sources verified',
  },
  2: {
    answer: 'Per Operations SOP v4.1 (ratified last month), Tier-2 support agents are authorized to issue immediate refunds up to $500 within 30 days of initial purchase. Any refund request exceeding $500 or submitted past 30 days requires documented approval from the Finance Operations Lead.',
    sources: [
      { type: 'notion', ref: 'Finance & Refund Policy v4.1', label: 'Notion' },
      { type: 'policy', ref: 'SOP-REF-04', label: 'Policy' },
      { type: 'slack', ref: '#ops-announcements', label: 'Slack' },
    ],
    confidence: 'high',
    verifiedCount: '3 sources verified',
  },
  3: {
    answer: 'The transition from the monolith to microservices was authored by VP of Engineering Marcus Vance in Architecture Decision Record ADR-014 (Q3 2024). The decision was formally approved by the Architecture Review Board following three cascading deployment failures in the monolithic payment pipeline.',
    sources: [
      { type: 'github', ref: 'ADR-014-microservices.md', label: 'GitHub' },
      { type: 'notion', ref: '2024 Tech Strategy & Roadmap', label: 'Notion' },
      { type: 'slack', ref: '#architecture-council', label: 'Slack' },
    ],
    confidence: 'high',
    verifiedCount: '3 sources verified',
  },
};

export default function AskBrainDemo() {
  const [selectedQuery, setSelectedQuery] = useState(0);
  const [showAnswer, setShowAnswer] = useState(true);
  const response = MOCK_RESPONSES[selectedQuery] || MOCK_RESPONSES[0];

  const sourceColors = {
    jira: 'var(--info)',
    github: 'var(--success)',
    slack: 'var(--violet)',
    confluence: 'var(--primary)',
    notion: 'var(--warning)',
    policy: 'var(--success)',
  };

  return (
    <section style={{ padding: 'var(--space-24) var(--space-6)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{
            display: 'inline-block', fontSize: '0.6875rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--primary)',
            marginBottom: 'var(--space-3)',
          }}>
            ASK BRAIN
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
            Ask anything. Get verified answers.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
            Cross-system intelligence with source citations, confidence scores, and knowledge graph context.
          </p>
        </div>

        {/* Query selector chips */}
        <div style={{
          display: 'flex', gap: 'var(--space-2)', justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: 'var(--space-6)',
        }}>
          {DEMO_QUERIES.map((q, i) => (
            <button key={i} onClick={() => { setSelectedQuery(i); setShowAnswer(true); }} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-pill)',
              border: selectedQuery === i ? `1.5px solid ${q.color}` : '1px solid var(--border)',
              background: selectedQuery === i ? `${q.color}10` : 'var(--surface)',
              color: selectedQuery === i ? q.color : 'var(--text-secondary)',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 150ms ease', fontFamily: 'var(--font-sans)',
            }}>
              {q.category}
            </button>
          ))}
        </div>

        {/* Demo card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
        }}>
          {/* Query bar */}
          <div style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--primary)', boxShadow: '0 0 8px var(--primary-glow)',
            }} />
            <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {DEMO_QUERIES[selectedQuery].query}
            </span>
          </div>

          {/* Answer area */}
          {showAnswer && (
            <div style={{ padding: 'var(--space-6)' }}>
              {/* Status indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {response.verifiedCount || `${response.sources?.length || 0} sources verified`}
                </span>
              </div>

              {/* Answer text */}
              <p style={{
                fontSize: '0.9375rem', color: 'var(--text-primary)',
                lineHeight: 1.7, marginBottom: 'var(--space-5)',
              }}>
                {response.answer}
              </p>

              {/* Source chips */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                {response.sources.map((s, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                    padding: '3px 10px', borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem', fontWeight: 600,
                    background: `${sourceColors[s.type]}12`,
                    color: sourceColors[s.type],
                    border: `1px solid ${sourceColors[s.type]}25`,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                    {s.label}: {s.ref}
                  </span>
                ))}
              </div>

              {/* Confidence */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: '4px 12px', borderRadius: 'var(--radius-pill)',
                background: 'var(--success-light)', border: '1px solid rgba(22,163,74,0.15)',
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                High Confidence
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

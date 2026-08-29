'use client';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ProofSection() {
  const metrics = [
    { value: '92%', label: 'Context Accuracy', description: 'retrieved context matches ground truth' },
    { value: '88%', label: 'Answer Relevance', description: 'answers address the question asked' },
    { value: '80%', label: 'Faithfulness', description: 'every claim grounded in source context' }
  ];

  return (
    <section style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-16, 64px) var(--space-4, 16px)', textAlign: 'center' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', padding: '48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--success-light, rgba(22, 163, 74, 0.1))', color: 'var(--success)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 'var(--space-6, 24px)' }}>
          <CheckCircle2 size={14} />
          VERIFIED BY AI
        </div>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4, 16px)' }}>
          Transparent evaluation. Real benchmarks.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: 'var(--space-12, 48px)', maxWidth: '700px', margin: '0 auto 48px' }}>
          Our hybrid graph-RAG pipeline is continuously evaluated using RAGAS methodology against real enterprise documents.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', marginBottom: 'var(--space-8, 32px)' }}>
          {metrics.map((metric, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                {metric.value}
              </div>
              <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', marginTop: '4px' }}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          Evaluated on 400 pages of AWS API Gateway Documentation using AWS Bedrock Llama-3-70B judges and True Hybrid Search.
        </div>
      </div>
    </section>
  );
}

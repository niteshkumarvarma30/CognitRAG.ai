'use client';
import React from 'react';
import { Activity, BarChart2, Zap, Target } from 'lucide-react';

export default function Page() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <Activity size={32} color="var(--primary-color)" /> Intelligence Metrics
      </h1>
      
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Welcome to the <strong>Intelligence Metrics</strong> dashboard. This page is actively under construction. Once completed, this suite will monitor the underlying performance of your AI systems. You will be able to track retrieval accuracy (MRR/NDCG), graph traversal latency, semantic cache hit rates, and the generative quality of the LLM responses.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Target size={20} /> <h3 style={{ fontWeight: '600' }}>Retrieval Accuracy</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monitor the precision and recall of your Knowledge Graph and Vector hybrid searches.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Zap size={20} /> <h3 style={{ fontWeight: '600' }}>System Latency</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track end-to-end response times and LLM inference speeds across different routing paths.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <BarChart2 size={20} /> <h3 style={{ fontWeight: '600' }}>Generation Quality</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyze user feedback, hallucination rates, and semantic alignment of answers.</p>
        </div>
      </div>
    </div>
  );
}

'use client';
import React from 'react';
import { Code, Headphones, Settings, Bot } from 'lucide-react';

export default function SolutionsMatrix() {
  const solutions = [
    {
      title: 'Engineering Teams',
      description: 'Reconstruct incident context, trace deployment decisions, and find system ownership in seconds.',
      icon: Code,
      accent: 'var(--primary)',
      accentLight: 'var(--primary-light, rgba(99,91,255,0.08))'
    },
    {
      title: 'Support Teams',
      description: 'Resolve customer issues faster with cross-system root cause analysis and policy verification.',
      icon: Headphones,
      accent: 'var(--violet)',
      accentLight: 'rgba(124, 58, 237, 0.08)'
    },
    {
      title: 'Operations Teams',
      description: 'Maintain living SOPs, track policy changes, and ensure compliance with governed procedures.',
      icon: Settings,
      accent: 'var(--success)',
      accentLight: 'var(--success-light, rgba(22, 163, 74, 0.1))'
    },
    {
      title: 'AI & Platform Teams',
      description: 'Feed verified company context to AI agents through APIs and Model Context Protocol.',
      icon: Bot,
      accent: 'var(--info, #2563EB)',
      accentLight: 'rgba(37, 99, 235, 0.08)'
    }
  ];

  return (
    <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-16, 64px) var(--space-4, 16px)' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 'var(--space-12, 48px)' }}>
        Built for every team that needs context
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6, 24px)' }}>
        {solutions.map((sol, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px', textAlign: 'left' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: sol.accentLight, color: sol.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <sol.icon size={22} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>
              {sol.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
              {sol.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

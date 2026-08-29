'use client';
import React from 'react';
import { Shield, Lock, Eye, Key } from 'lucide-react';

export default function SecuritySection() {
  const cards = [
    {
      icon: Shield,
      title: 'Row-Level Security',
      description: 'Every query filtered by tenant, user role, and source permissions at the database level.'
    },
    {
      icon: Lock,
      title: 'Source-Level Access',
      description: 'Respect original permissions from Slack channels, Jira projects, and Google Drive folders.'
    },
    {
      icon: Eye,
      title: 'Audit Trail',
      description: 'Every retrieval, citation, and agent action logged immutably for compliance.'
    },
    {
      icon: Key,
      title: 'Zero Trust Architecture',
      description: 'JWT validation, RBAC enforcement, and permission-aware caching on every request.'
    }
  ];

  return (
    <section style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', padding: 'var(--space-16, 64px) var(--space-4, 16px)' }}>
      <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 'var(--space-2, 8px)' }}>
        SECURITY & TRUST
      </div>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-12, 48px)' }}>
        Enterprise knowledge needs enterprise control.
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6, 24px)' }}>
        {cards.map((card, i) => (
          <div key={i} style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', textAlign: 'left' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light, rgba(99,91,255,0.08))', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4, 16px)' }}>
              <card.icon size={20} />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '12px', marginBottom: '12px' }}>
              {card.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

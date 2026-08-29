'use client';
import React from 'react';
import { MessageSquare, GitPullRequest, Database, BookOpen, Layers, CheckCircle2, Clock } from 'lucide-react';

export default function IntegrationsGrid() {
  const categories = [
    {
      name: 'Communication',
      items: [
        { name: 'Slack', status: 'Available', icon: MessageSquare },
        { name: 'Microsoft Teams', status: 'Coming Soon', icon: Layers }
      ]
    },
    {
      name: 'Engineering',
      items: [
        { name: 'GitHub', status: 'Available', icon: GitPullRequest },
        { name: 'Jira', status: 'Available', icon: Database },
        { name: 'GitLab', status: 'Coming Soon', icon: GitPullRequest }
      ]
    },
    {
      name: 'Knowledge',
      items: [
        { name: 'Notion', status: 'Available', icon: BookOpen },
        { name: 'Google Workspace', status: 'Available', icon: Database },
        { name: 'Confluence', status: 'Coming Soon', icon: BookOpen }
      ]
    },
    {
      name: 'CRM & Support',
      items: [
        { name: 'Salesforce', status: 'Coming Soon', icon: Layers },
        { name: 'Zendesk', status: 'Coming Soon', icon: MessageSquare }
      ]
    }
  ];

  return (
    <section style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-16, 64px) var(--space-4, 16px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-12, 48px)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4, 16px)' }}>
          Connect Your Entire Stack
        </h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Native integrations with the tools your team uses every day
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-8, 32px)' }}>
        {categories.map((cat, i) => (
          <div key={i}>
            <div style={{ textTransform: 'uppercase', color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
              {cat.name}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cat.items.map((item, j) => {
                const isAvailable = item.status === 'Available';
                return (
                  <div key={j} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <item.icon size={20} color="var(--text-primary)" />
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 500, padding: '4px 8px', borderRadius: 'var(--radius-pill)', background: isAvailable ? 'var(--success-light, rgba(22, 163, 74, 0.1))' : 'var(--bg)', color: isAvailable ? 'var(--success)' : 'var(--text-muted)' }}>
                      {isAvailable ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {item.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

'use client';
import React from 'react';
import { MessageSquare, FileText, GitBranch, BookOpen } from 'lucide-react';

export default function ProblemSection() {
  const cards = [
    { name: 'Slack', icon: MessageSquare, desc: 'Critical decisions buried in threads that disappear' },
    { name: 'Jira', icon: FileText, desc: 'Context scattered across hundreds of tickets and comments' },
    { name: 'GitHub', icon: GitBranch, desc: 'Architectural decisions lost in PR descriptions' },
    { name: 'Notion', icon: BookOpen, desc: 'Product requirements disconnected from actual code' }
  ];

  return (
    <section style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '80px 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '16px'
        }}>
          THE PROBLEM
        </div>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          margin: '0 0 48px 0'
        }}>
          Your knowledge is everywhere.<br />
          Your context isn't.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          width: '100%',
          marginBottom: '40px'
        }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.name} style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderTop: '3px solid rgba(220, 38, 38, 0.3)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                textAlign: 'left'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '12px'
                }}>
                  <Icon size={20} />
                  <span>{card.name}</span>
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5
                }}>
                  {card.desc}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          fontSize: '0.9375rem'
        }}>
          Your team wastes 5+ hours per week searching for context that already exists.
        </div>
      </div>
    </section>
  );
}

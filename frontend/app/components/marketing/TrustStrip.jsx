'use client';
import React from 'react';
import { GitBranch, MessageSquare, FileText, BookOpen, HardDrive, Users } from 'lucide-react';

export default function TrustStrip() {
  const logos = [
    { name: 'Slack', icon: MessageSquare },
    { name: 'GitHub', icon: GitBranch },
    { name: 'Jira', icon: FileText },
    { name: 'Notion', icon: BookOpen },
    { name: 'Google Drive', icon: HardDrive },
    { name: 'Salesforce', icon: Users },
  ];

  return (
    <section style={{
      width: '100%',
      padding: '48px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px'
    }}>
      <div style={{
        color: 'var(--text-muted)',
        fontSize: '0.8125rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        textAlign: 'center',
        fontWeight: 600
      }}>
        Connects to where your team already works
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '48px',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        padding: '0 24px'
      }}>
        {logos.map((logo) => {
          const Icon = logo.icon;
          return (
            <div key={logo.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              opacity: 0.6,
              transition: 'opacity var(--duration-fast) var(--ease-out)',
              cursor: 'default',
              fontSize: '0.9375rem',
              fontWeight: 600
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = 1;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = 0.6;
            }}
            >
              <Icon size={24} />
              <span>{logo.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

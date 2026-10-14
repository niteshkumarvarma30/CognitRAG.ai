'use client';
import React from 'react';
import { MessageSquare, GitPullRequest, CheckSquare, FileText, Lock } from 'lucide-react';

export default function IntegrationsGrid() {
  const tools = [
    {
      name: 'Slack',
      type: 'Chat & Incidents',
      role: 'Discussions, architecture decisions, and live incident threads.',
      access: 'Channel membership copied directly from source.',
      icon: <MessageSquare size={24} style={{ color: '#E01E5A' }} />
    },
    {
      name: 'GitHub',
      type: 'Code & Reviews',
      role: 'Pull requests, code reviews, merged diffs, and issue tracking.',
      access: 'Repository access mirrored from your GitHub organization.',
      icon: <GitPullRequest size={24} style={{ color: 'var(--ind)' }} />
    },
    {
      name: 'Jira',
      type: 'Tasks & Sprints',
      role: 'Ticket resolution states, sprint backlogs, assignees, and priorities.',
      access: 'Audience permissions configured by workspace admin.',
      icon: <CheckSquare size={24} style={{ color: '#0052CC' }} />
    },
    {
      name: 'Notion',
      type: 'Specs & PRDs',
      role: 'Product requirements, architecture decisions, and team notes.',
      access: 'Audience permissions configured by workspace admin.',
      icon: <FileText size={24} style={{ color: 'var(--am)' }} />
    }
  ];

  return (
    <section id="connections" style={{
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
            color: 'var(--ind)',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            Supported Tools
          </div>
          <h2 className="font-serif-headline" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--ink)',
            margin: '0 0 10px 0',
            fontWeight: 400
          }}>
            Four core tools. Zero sync leaks.
          </h2>
          <p style={{
            color: 'var(--mute)',
            fontSize: '1rem',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            CognitRAG connects directly to the four platforms where engineering decisions actually happen.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {tools.map((tool) => (
            <div
              key={tool.name}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg2)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {tool.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {tool.type}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--ink)',
                margin: 0
              }}>
                {tool.name}
              </h3>

              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: 'var(--mute)',
                margin: 0,
                flex: 1
              }}>
                {tool.role}
              </p>

              <div style={{
                borderTop: '1px solid var(--line)',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: 'var(--mute)'
              }}>
                <Lock size={13} style={{ flexShrink: 0, color: 'var(--ind)' }} />
                <span>{tool.access}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

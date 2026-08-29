'use client';
import React from 'react';
import { Link, Brain, ShieldCheck, Zap } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Connect', desc: 'Ingest data from Slack, Jira, GitHub, Google Workspace, and Notion.', icon: Link },
    { num: '02', title: 'Understand', desc: 'Extract entities, map relationships, resolve coreferences, and build a semantic graph.', icon: Brain },
    { num: '03', title: 'Verify', desc: 'Ground every answer in evidence with source citations, timestamps, and confidence scores.', icon: ShieldCheck },
    { num: '04', title: 'Act', desc: 'Deliver trusted context to employees, APIs, and AI agents.', icon: Zap }
  ];

  return (
    <section id="how-it-works" style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '80px 24px'
    }}>
      <div style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          How CognitRAG Works
        </h2>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '1.125rem',
          marginBottom: '64px',
          textAlign: 'center'
        }}>
          Four stages from fragmented data to trusted intelligence
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          width: '100%'
        }}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  opacity: 0.3,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '16px'
                }}>
                  {step.num}
                </div>
                <Icon size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
                <div style={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: 'var(--text-primary)',
                  marginTop: '12px',
                  marginBottom: '8px'
                }}>
                  {step.title}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5
                }}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

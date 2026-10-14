'use client';
import React from 'react';
import { Link2, MessageSquare, CheckCheck } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Connect',
      icon: <Link2 size={22} style={{ color: 'var(--ind)' }} />,
      desc: 'Link your team’s existing tools—Slack, GitHub, Jira and Notion. Authentication respects existing workspace memberships and access levels.'
    },
    {
      num: '02',
      title: 'Ask',
      icon: <MessageSquare size={22} style={{ color: 'var(--cy)' }} />,
      desc: 'Ask questions in plain English or natural Hinglish. CognitRAG routes your query across structured API endpoints, discussion history, and design specs.'
    },
    {
      num: '03',
      title: 'Check',
      icon: <CheckCheck size={22} style={{ color: 'var(--em)' }} />,
      desc: 'Every claim is paired with a direct citation chip. Green for direct tool state, cyan for extracted discussion context, and amber for conflicting documentation.'
    }
  ];

  return (
    <section id="how-it-works" style={{
      padding: '64px 0',
      backgroundColor: 'var(--bg)'
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
            Three Steps
          </div>
          <h2 className="font-serif-headline" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--ink)',
            margin: '0 0 10px 0',
            fontWeight: 400
          }}>
            How CognitRAG works
          </h2>
          <p style={{
            color: 'var(--mute)',
            fontSize: '1rem',
            maxWidth: '540px',
            margin: '0 auto'
          }}>
            A continuous loop from engineering tools to trusted, verifiable answers.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                backgroundColor: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {step.icon}
                </div>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--mute)'
                }}>
                  {step.num}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--ink)',
                margin: 0
              }}>
                {step.title}
              </h3>

              <p style={{
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: 'var(--mute)',
                margin: 0
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

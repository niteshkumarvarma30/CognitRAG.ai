'use client';
import React from 'react';

export default function CompanyBrainSection() {
  return (
    <section style={{
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
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '16px'
        }}>
          THE SOLUTION
        </div>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          margin: '0 0 64px 0'
        }}>
          One connected layer for everything your company knows.
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          width: '100%'
        }}>
          {/* Box 1 */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            minWidth: '250px',
            flex: '1 1 auto'
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Company Data
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              Slack, Jira, GitHub, Docs, CRM
            </div>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>→</div>

          {/* Box 2 */}
          <div style={{
            backgroundColor: 'var(--surface-soft)',
            border: '1px solid rgba(99, 91, 255, 0.3)',
            boxShadow: 'var(--shadow-glow)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 24px',
            minWidth: '280px',
            flex: '1 1 auto'
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)', marginBottom: '8px' }}>
              Company Brain
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              Entities • Relationships • Rules • Decisions
            </div>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>→</div>

          {/* Box 3 */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            minWidth: '250px',
            flex: '1 1 auto'
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Intelligence
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              Answers • SOPs • Skills • Agents
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

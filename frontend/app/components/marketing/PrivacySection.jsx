'use client';
import React from 'react';
import { ShieldCheck, EyeOff, FileText, Lock, AlertCircle } from 'lucide-react';

export default function PrivacySection() {
  const privacyPillars = [
    {
      title: 'Private by default',
      desc: 'CognitRAG uses only sources the asking user can already open. Queries never synthesize information across unauthorized boundaries.',
      icon: <Lock size={20} style={{ color: 'var(--em)' }} />
    },
    {
      title: 'Withheld sources are counted, not described',
      desc: 'If relevant information exists in a document you cannot view, the system reports the count of withheld sources without exposing titles, authors, or snippets.',
      icon: <EyeOff size={20} style={{ color: 'var(--cy)' }} />
    },
    {
      title: 'Audience-mirrored access',
      desc: 'Slack and GitHub membership is copied directly from the source. For Jira and Notion, an administrator sets the exact audience visibility.',
      icon: <ShieldCheck size={20} style={{ color: 'var(--ind)' }} />
    },
    {
      title: 'Every answer is logged',
      desc: 'All queries and generated citations are recorded in structured audit logs, ensuring complete traceability and compliance oversight.',
      icon: <FileText size={20} style={{ color: 'var(--am)' }} />
    }
  ];

  return (
    <section id="privacy" style={{
      padding: '64px 0',
      backgroundColor: 'var(--bg)'
    }}>
      <div className="landing-container">
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--em)',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            Data Governance
          </div>
          <h2 className="font-serif-headline" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--ink)',
            margin: '0 0 10px 0',
            fontWeight: 400
          }}>
            Private by design. Verifiable in code.
          </h2>
          <p style={{
            color: 'var(--mute)',
            fontSize: '1rem',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            Engineered so that team permissions are strictly inherited, not bypassed.
          </p>
        </div>

        <div className="privacy-4col-grid">
          {privacyPillars.map((p) => (
            <div
              key={p.title}
              style={{
                backgroundColor: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {p.icon}
              </div>

              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--ink)',
                margin: 0
              }}>
                {p.title}
              </h3>

              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: 'var(--mute)',
                margin: 0
              }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Security Certification Transparency Notice per Claims Register */}
        <div style={{
          backgroundColor: 'var(--bg2)',
          border: '1px dashed var(--line)',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--mute)',
          fontSize: '0.86rem'
        }}>
          <AlertCircle size={18} style={{ color: 'var(--ind)', flexShrink: 0 }} />
          <span>
            <strong>Certification transparency:</strong> We will list security certifications here only once we hold them.
          </span>
        </div>
      </div>

      <style jsx>{`
        .privacy-4col-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        @media (max-width: 960px) {
          .privacy-4col-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 540px) {
          .privacy-4col-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

'use client';
import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, GitBranch, Database, FileText, Sparkles, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [slackConnected, setSlackConnected] = useState(false);
  const [connectedSources, setConnectedSources] = useState({
    github: false,
    jira: false,
    notion: false,
    drive: false
  });

  const toggleSource = (source) => {
    setConnectedSources(prev => ({ ...prev, [source]: !prev[source] }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'var(--bg, #090d16)',
      padding: '24px',
      color: '#f8fafc'
    }}>
      <div style={{ maxWidth: '580px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '16px' }}>
            <Sparkles size={14} style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#38bdf8' }}>Step {step} of 3</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '8px' }}>
            {step === 1 && 'Install CognitRAG in Slack'}
            {step === 2 && 'Connect Your Data Sources'}
            {step === 3 && "You're All Set!"}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9375rem' }}>
            {step === 1 && 'Your team talks in Slack — install the bot so anyone can ask questions.'}
            {step === 2 && 'CognitRAG indexes your documents and cross-links code, tickets, and docs.'}
            {step === 3 && 'Your company brain is ready to answer questions with claim-level proof.'}
          </p>
        </div>

        {/* Step 1: Slack App Install */}
        {step === 1 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '28px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'rgba(74, 21, 75, 0.3)', border: '1px solid rgba(236, 72, 153, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              fontSize: '2rem'
            }}>
              💬
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>Add CognitRAG Bot to Slack</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.5 }}>
              Enables <code>/ask</code> slash command and thread summaries in your team channels.
            </p>

            <a
              href={`${getApiUrl()}/api/v1/slack/install`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setSlackConnected(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '12px 24px', borderRadius: '10px',
                background: '#4a154b', color: '#fff', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.9375rem', border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 14px rgba(74, 21, 75, 0.4)', cursor: 'pointer'
              }}
            >
              Add to Slack <ExternalLink size={16} />
            </a>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '8px',
                  background: '#2563eb', color: '#fff', border: 'none',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Connect Data Sources */}
        {step === 2 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { id: 'github', label: 'GitHub Repositories', desc: 'PRs, issues, RFCs', icon: <GitBranch size={20} /> },
                { id: 'jira', label: 'Jira Software', desc: 'Epics, tickets, sprints', icon: <FileText size={20} /> },
                { id: 'notion', label: 'Notion Workspace', desc: 'Product specs, handbooks', icon: <Database size={20} /> },
                { id: 'drive', label: 'Google Drive', desc: 'PDFs, spreadsheets, slide decks', icon: <FileText size={20} /> },
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleSource(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', borderRadius: '10px',
                    background: connectedSources[item.id] ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${connectedSources[item.id] ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ color: connectedSources[item.id] ? '#60a5fa' : '#94a3b8' }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{item.desc}</div>
                    </div>
                  </div>
                  <button style={{
                    padding: '6px 14px', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
                    background: connectedSources[item.id] ? '#10b981' : 'rgba(255,255,255,0.08)',
                    color: '#fff', border: 'none', cursor: 'pointer'
                  }}>
                    {connectedSources[item.id] ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setStep(1)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '8px',
                  background: '#2563eb', color: '#fff', border: 'none',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem'
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '36px 28px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              color: '#34d399'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>CognitRAG is Ready!</h3>
            <p style={{ fontSize: '0.9375rem', color: '#94a3b8', marginBottom: '28px', lineHeight: 1.6 }}>
              Your company brain is live. You can ask questions in English or Hinglish on the web dashboard or directly in Slack.
            </p>

            <Link
              href="/home"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '12px 28px', borderRadius: '10px',
                background: '#2563eb', color: '#fff', textDecoration: 'none',
                fontWeight: 600, fontSize: '0.9375rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              Go to Brain Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

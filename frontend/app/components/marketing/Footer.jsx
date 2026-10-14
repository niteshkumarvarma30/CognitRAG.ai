'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      backgroundColor: 'var(--bg)',
      padding: '48px 0 32px'
    }}>
      <div className="landing-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          paddingBottom: '36px',
          borderBottom: '1px solid var(--line)'
        }}>
          {/* Brand & Purpose */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '5px',
                backgroundColor: 'var(--ind)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <ShieldCheck size={14} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                CognitRAG<span style={{ color: 'var(--ind)' }}>.ai</span>
              </span>
            </div>
            <p style={{
              fontSize: '0.86rem',
              lineHeight: 1.5,
              color: 'var(--mute)',
              margin: 0,
              maxWidth: '300px'
            }}>
              Your team&apos;s memory, with proof. Connecting Slack, GitHub, Jira and Notion for Hinglish-speaking engineering teams.
            </p>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Navigation
            </span>
            <a href="#demo" style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: '0.86rem' }}>
              Interactive Demo
            </a>
            <a href="#how-it-works" style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: '0.86rem' }}>
              How It Works
            </a>
            <a href="#connections" style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: '0.86rem' }}>
              Connected Tools
            </a>
            <a href="#privacy" style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: '0.86rem' }}>
              Privacy &amp; Permissions
            </a>
            <a href="#plans" style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: '0.86rem' }}>
              Access Plans
            </a>
            <a href="#faq" style={{ color: 'var(--mute)', textDecoration: 'none', fontSize: '0.86rem' }}>
              FAQ
            </a>
          </div>

          {/* Transparent Disclaimers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--ink)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Transparency
            </span>
            <p style={{ fontSize: '0.82rem', color: 'var(--mute)', margin: 0, lineHeight: 1.5 }}>
              The interactive demo uses static sample data to illustrate evidence-grounded answers.
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--mute)', margin: 0, lineHeight: 1.5 }}>
              We will publish security certifications and compliance documents only once officially held.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--mute)'
        }}>
          <span>&copy; {new Date().getFullYear()} CognitRAG.ai. All rights reserved.</span>
          <span>Engineered for privacy and precision.</span>
        </div>
      </div>
    </footer>
  );
}

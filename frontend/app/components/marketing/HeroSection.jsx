'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const HeroGraph3D = dynamic(() => import('./HeroGraph3D'), { ssr: false });

export default function HeroSection({ onOpenEarlyAccess }) {
  const [canLoad3D, setCanLoad3D] = useState(false);

  useEffect(() => {
    // Check criteria for 3D upgrade:
    // 1. Desktop viewport (> 820px)
    // 2. Not prefers-reduced-motion
    // 3. Not saveData mode
    // 4. WebGL supported
    if (typeof window === 'undefined') return;

    const isDesktop = window.innerWidth >= 820;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection && navigator.connection.saveData;

    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      hasWebGL = false;
    }

    if (isDesktop && !prefersReducedMotion && !saveData && hasWebGL) {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => setCanLoad3D(true));
      } else {
        setTimeout(() => setCanLoad3D(true), 1200);
      }
    }
  }, []);

  return (
    <section style={{
      padding: 'clamp(48px, 8vw, 84px) 0 48px',
      position: 'relative'
    }}>
      <div className="landing-container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--ind)',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--ind)'
            }} />
            For Hinglish-speaking engineering teams
          </div>

          {/* Headline */}
          <h1 className="font-serif-headline" style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: 0,
            fontWeight: 400
          }}>
            Your team&apos;s memory, with&nbsp;proof.
          </h1>

          {/* Lead Paragraph */}
          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'var(--mute)',
            margin: 0,
            maxWidth: '520px'
          }}>
            CognitRAG connects Slack, GitHub, Jira and Notion to give engineering teams verifiable answers. Every claim is tagged with exact source evidence, whether asked in English or mixed Hinglish.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '14px',
            paddingTop: '8px'
          }}>
            <button
              onClick={onOpenEarlyAccess}
              style={{
                backgroundColor: 'var(--ind)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 22px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              Get early access
              <ArrowRight size={16} />
            </button>

            <a
              href="#demo"
              style={{
                color: 'var(--ink)',
                textDecoration: 'none',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '0.95rem',
                fontWeight: 500,
                backgroundColor: 'var(--bg2)',
                transition: 'border-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.borderColor = 'var(--ind)')}
              onMouseLeave={(e) => (e.target.style.borderColor = 'var(--line)')}
            >
              See a sample answer
            </a>
          </div>

          {/* Privacy Note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            color: 'var(--mute)',
            paddingTop: '4px'
          }}>
            <ShieldCheck size={16} style={{ color: 'var(--em)', flexShrink: 0 }} />
            <span>Private by default: only answers from sources you can already open.</span>
          </div>
        </div>

        {/* Right Column: Hero Graph (SVG or 3D upgrade) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '360px',
          position: 'relative'
        }}>
          {canLoad3D ? (
            <HeroGraph3D />
          ) : (
            <svg
              viewBox="0 0 420 360"
              style={{
                width: '100%',
                maxWidth: '420px',
                height: 'auto',
                overflow: 'visible'
              }}
              aria-label="CognitRAG Graph connecting Slack, GitHub, Jira, and Notion to a central intelligence node"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--line)" />
                  <stop offset="100%" stopColor="var(--ind)" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Connecting Lines */}
              <g className="hero-svg-lines">
                <line x1="90" y1="80" x2="210" y2="180" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="330" y1="80" x2="210" y2="180" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="90" y1="280" x2="210" y2="180" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="330" y1="280" x2="210" y2="180" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="5,5" />
              </g>

              {/* Source Nodes */}
              {/* Slack */}
              <g transform="translate(90, 80)">
                <circle r="26" fill="var(--bg2)" stroke="var(--line)" strokeWidth="1.5" />
                <text textAnchor="middle" dy="4" fill="var(--cy)" fontSize="11" fontWeight="600" fontFamily="sans-serif">Slack</text>
              </g>

              {/* GitHub */}
              <g transform="translate(330, 80)">
                <circle r="26" fill="var(--bg2)" stroke="var(--line)" strokeWidth="1.5" />
                <text textAnchor="middle" dy="4" fill="var(--ind)" fontSize="11" fontWeight="600" fontFamily="sans-serif">GitHub</text>
              </g>

              {/* Jira */}
              <g transform="translate(90, 280)">
                <circle r="26" fill="var(--bg2)" stroke="var(--line)" strokeWidth="1.5" />
                <text textAnchor="middle" dy="4" fill="var(--em)" fontSize="11" fontWeight="600" fontFamily="sans-serif">Jira</text>
              </g>

              {/* Notion */}
              <g transform="translate(330, 280)">
                <circle r="26" fill="var(--bg2)" stroke="var(--line)" strokeWidth="1.5" />
                <text textAnchor="middle" dy="4" fill="var(--am)" fontSize="11" fontWeight="600" fontFamily="sans-serif">Notion</text>
              </g>

              {/* Centre CognitRAG Node */}
              <g transform="translate(210, 180)">
                <circle r="42" fill="var(--bg2)" stroke="var(--ind)" strokeWidth="2.5" />
                <circle r="36" fill="rgba(129, 140, 248, 0.12)" />
                <text textAnchor="middle" dy="-2" fill="var(--ink)" fontSize="13" fontWeight="700" fontFamily="sans-serif">CognitRAG</text>
                <text textAnchor="middle" dy="14" fill="var(--mute)" fontSize="9" fontWeight="500" fontFamily="sans-serif">Memory Engine</text>
              </g>
            </svg>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        @media (prefers-reduced-motion: no-preference) {
          .hero-svg-lines line {
            animation: dash 1.6s linear infinite;
          }
        }
      `}</style>
    </section>
  );
}

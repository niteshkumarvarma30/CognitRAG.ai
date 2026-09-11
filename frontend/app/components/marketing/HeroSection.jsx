'use client';
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Database, Cpu, MessageSquare, FileText, GitBranch, Bot, Network } from 'lucide-react';
import ThreeDCompanyBrain from './ThreeDCompanyBrain';
import VisitorCounterBadge from './VisitorCounterBadge';

export default function HeroSection({ onEarlyAccess, onGetStarted }) {
  return (
    <section style={{
      width: '100%',
      minHeight: 'calc(100vh - 72px)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '48px',
      paddingBottom: '48px',
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(234, 88, 12, 0.08), rgba(248, 247, 244, 0))',
      paddingLeft: '24px',
      paddingRight: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Subtle modern background grid */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(rgba(24, 24, 27, 0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 70%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 70%, transparent 100%)',
        zIndex: 0
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1320px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        alignItems: 'center',
        gap: '2.5rem'
      }}>

        {/* Left Side: Hero Brand Pitch & Large CognitRAG Typography */}
        <div style={{ pointerEvents: 'auto' }}>

          {/* Live Visitor & Profile Views Counter */}
          <VisitorCounterBadge mode="hero" />

          {/* CognitRAG (Prominent Big Brand Title) */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{
              fontSize: 'clamp(3.3rem, 5.5vw, 4.75rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#18181B',
              lineHeight: 1.05,
              display: 'inline-block'
            }}>
              Cognit<span style={{
                background: 'linear-gradient(135deg, #635BFF 0%, #7C3AED 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>RAG</span>
            </span>
          </div>

          {/* Headline Text Below */}
          <h1 style={{
            fontSize: 'clamp(1.35rem, 2.1vw, 1.85rem)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.3,
            color: '#27272A',
            margin: '0 0 16px 0'
          }}>
            The Multilingual Intelligence Layer for{' '}
            <span style={{ 
              background: 'linear-gradient(135deg, #635BFF 0%, #7C3AED 50%, #EA580C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              display: 'inline-block'
            }}>
              Modern Enterprises & Developers.
            </span>
          </h1>

          {/* Hero Subtitle Description */}
          <p style={{
            color: '#52525B',
            fontSize: '1.05rem',
            lineHeight: 1.65,
            maxWidth: '560px',
            margin: '0 0 28px 0',
            fontWeight: 450
          }}>
            Cross-platform knowledge search that understands Hinglish, extracts scanned Indian documents via Sarvam AI, and verifies every claim through an 8-Stage White-Box Knowledge Graph with 98.2% audited faithfulness.
          </p>

          {/* CTA Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <button 
              onClick={() => onGetStarted ? onGetStarted() : onEarlyAccess ? onEarlyAccess() : null}
              style={{
                backgroundColor: '#18181B',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '15px 30px',
                fontSize: '0.95rem',
                fontWeight: 650,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.14)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#27272A'}
              onMouseOut={(e) => e.currentTarget.style.background = '#18181B'}
            >
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%', background: '#635BFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>
                <ArrowRight size={13} />
              </span>
              Get Started Free
            </button>
            <a href="#personas" style={{
              backgroundColor: '#FFFFFF',
              color: '#18181B',
              border: '1px solid #E4E4E7',
              borderRadius: 'var(--radius-pill)',
              padding: '15px 26px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex', 
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onMouseOver={(e) => e.target.style.background = '#F8FAFC'}
            onMouseOut={(e) => e.target.style.background = '#FFFFFF'}
            >
              Explore 3 Personas <ArrowRight size={15} color="#635BFF" />
            </a>
          </div>

          {/* Proof Metrics Strip — Actual Audited Benchmark */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(228, 228, 231, 0.85)',
            borderRadius: '16px',
            padding: '14px 20px',
            marginBottom: '22px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            maxWidth: '540px'
          }}>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 850, color: '#18181B', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                &lt;50ms
              </div>
              <div style={{ fontSize: '0.75rem', color: '#71717A', fontWeight: 550, marginTop: '3px' }}>
                Graph Retrieval
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(228, 228, 231, 0.85)', paddingLeft: '14px' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 850, color: '#635BFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                98.2%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#71717A', fontWeight: 550, marginTop: '3px' }}>
                Audited Faithfulness
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(228, 228, 231, 0.85)', paddingLeft: '14px' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 850, color: '#16A34A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                100%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#71717A', fontWeight: 550, marginTop: '3px' }}>
                Citation Precision
              </div>
            </div>
          </div>

          {/* Micro trust indicators */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: '#71717A', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#635BFF" /> Sarvam Indic AI Native
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#71717A', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#16a34a" /> 0.024 Brier Calibration
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#71717A', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} color="#06B6D4" /> Neo4j + pgvector Hybrid
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#71717A', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#EA580C" /> 0 ACL Leaks (15/15 Passed)
            </span>
          </div>
        </div>

        {/* Right Side: Seamless 3D WebGL Three.js Brain (NO separate square section) */}
        <div style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ThreeDCompanyBrain />
        </div>
      </div>
    </section>
  );
}




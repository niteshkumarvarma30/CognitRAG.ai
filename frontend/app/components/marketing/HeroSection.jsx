'use client';
import React from 'react';
import { Search, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Database, Cpu, MessageSquare } from 'lucide-react';

export default function HeroSection({ onEarlyAccess }) {
  return (
    <section style={{
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '130px',
      paddingBottom: '90px',
      background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 91, 255, 0.15), rgba(255, 255, 255, 0))',
      paddingLeft: '24px',
      paddingRight: '24px'
    }}>
      {/* Subtle modern background grid */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(rgba(99, 91, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
        zIndex: 0
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1280px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        alignItems: 'center',
        gap: '3rem'
      }}>

        {/* Left Side: Hero Brand Pitch */}
        <div style={{ pointerEvents: 'auto' }}>


          {/* 3D Glassmorphic Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, rgba(99, 91, 255, 0.12), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(99, 91, 255, 0.3)',
            boxShadow: '0 4px 14px rgba(99, 91, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
            padding: '8px 20px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '6px',
              background: 'linear-gradient(135deg, #635bff, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Sparkles size={13} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              CognitRAG • Autonomous Company Brain
            </span>
          </div>


          <h1 style={{
            fontSize: '3.75rem',
            fontWeight: 850,
            letterSpacing: '-0.035em',
            lineHeight: 1.08,
            color: 'var(--text-primary)',
            margin: '0 0 24px 0'
          }}>
            Your company already has a brain.<br />
            <span style={{ 
              background: 'linear-gradient(135deg, #635bff 0%, #4338ca 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Connect it.
            </span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem',
            maxWidth: '560px',
            lineHeight: 1.6,
            margin: '0 0 40px 0'
          }}>
            CognitRAG connects fragmented company knowledge and turns it into trusted context for people and AI agents.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>

            <button onClick={onEarlyAccess} style={{


              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 650,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 91, 255, 0.4)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={18} /> Get Early Access
            </button>
            <a href="#how-it-works" style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-flex', 
              alignItems: 'center',
              gap: '6px'
            }}>
              Explore Architecture <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Right Side: Seamless 3D Floating Neural Knowledge Network */}
        <div style={{ position: 'relative', width: '100%', height: '440px' }}>

          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            {/* 3D Radial Depth Glow */}
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '20%',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(99, 91, 255, 0.15) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 75%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }} />


            {/* Top Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 750, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                  Live Multi-Hop Neural Graph
                </span>
              </div>
              <span style={{ 
                fontSize: '0.6875rem', 
                fontWeight: 700, 
                padding: '3px 10px', 
                borderRadius: 'var(--radius-pill)', 
                background: 'linear-gradient(135deg, rgba(99, 91, 255, 0.12), rgba(6, 182, 212, 0.12))', 
                color: 'var(--primary)',
                border: '1px solid rgba(99, 91, 255, 0.25)'
              }}>
                GraphRAG + Vector Sync
              </span>
            </div>

            {/* Central 3D Neural Mesh Canvas */}
            <div style={{ position: 'relative', width: '100%', height: '280px', zIndex: 1 }}>
              {/* Complex Neural SVG Synapse Lines */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                  <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#635bff" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#635bff" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="lineGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                {/* Starburst Mesh Network Lines */}
                <line x1="50%" y1="50%" x2="16%" y2="20%" stroke="url(#lineGrad1)" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="84%" y2="20%" stroke="url(#lineGrad1)" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="14%" y2="52%" stroke="url(#lineGrad2)" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="86%" y2="54%" stroke="url(#lineGrad2)" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="22%" y2="84%" stroke="url(#lineGrad3)" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="78%" y2="84%" stroke="url(#lineGrad3)" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="50%" y2="12%" stroke="url(#lineGrad1)" strokeWidth="1.5" strokeDasharray="3 3" />
                
                {/* Secondary Cross Links between peripheral nodes */}
                <line x1="16%" y1="20%" x2="50%" y2="12%" stroke="rgba(99, 91, 255, 0.25)" strokeWidth="1" />
                <line x1="84%" y1="20%" x2="50%" y2="12%" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" />
                <line x1="14%" y1="52%" x2="22%" y2="84%" stroke="rgba(34, 197, 94, 0.25)" strokeWidth="1" />
                <line x1="86%" y1="54%" x2="78%" y2="84%" stroke="rgba(234, 88, 12, 0.25)" strokeWidth="1" />
              </svg>

              {/* Central 3D Core Node */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '78px',
                height: '78px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #635bff 0%, #4338ca 60%, #06b6d4 100%)',
                boxShadow: '0 12px 30px rgba(99, 91, 255, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                zIndex: 4,
                border: '2px solid rgba(255,255,255,0.9)'
              }}>
                <Sparkles size={26} />
                <span style={{ fontSize: '0.625rem', fontWeight: 850, marginTop: '2px', letterSpacing: '0.04em' }}>CognitRAG</span>
              </div>

              {/* Node: Billing Service (Top Center) */}
              <div style={{
                position: 'absolute', left: '50%', top: '12%', transform: 'translate(-50%, -50%)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: '#ffffff',
                border: '1.5px solid #635bff', boxShadow: '0 4px 10px rgba(99, 91, 255, 0.15)',
                fontSize: '0.6875rem', fontWeight: 700, color: '#4338ca', zIndex: 3, display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#635bff' }} />
                Service: Billing
              </div>

              {/* Node: Jira Issue (Top Left) */}
              <div style={{
                position: 'absolute', left: '16%', top: '20%', transform: 'translate(-50%, -50%)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: '#ffffff',
                border: '1.5px solid #0284c7', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.15)',
                fontSize: '0.6875rem', fontWeight: 700, color: '#0284c7', zIndex: 3, display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0284c7' }} />
                Jira BILL-902
              </div>

              {/* Node: GitHub PR (Top Right) */}
              <div style={{
                position: 'absolute', left: '84%', top: '20%', transform: 'translate(-50%, -50%)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: '#ffffff',
                border: '1.5px solid #16a34a', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.15)',
                fontSize: '0.6875rem', fontWeight: 700, color: '#16a34a', zIndex: 3, display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a' }} />
                PR #1287 (Merged)
              </div>

              {/* Node: Postgres Vector Chunks (Mid Left) */}
              <div style={{
                position: 'absolute', left: '14%', top: '52%', transform: 'translate(-50%, -50%)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: '#ffffff',
                border: '1.5px solid #059669', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.15)',
                fontSize: '0.6875rem', fontWeight: 700, color: '#059669', zIndex: 3, display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669' }} />
                pgvector (1536d)
              </div>

              {/* Node: Entity Resolution (Mid Right) */}
              <div style={{
                position: 'absolute', left: '86%', top: '54%', transform: 'translate(-50%, -50%)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: '#ffffff',
                border: '1.5px solid #9333ea', boxShadow: '0 4px 10px rgba(147, 51, 234, 0.15)',
                fontSize: '0.6875rem', fontWeight: 700, color: '#9333ea', zIndex: 3, display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#9333ea' }} />
                Entity: PaymentAPI
              </div>

              {/* Node: Slack Channel (Bottom Left) */}
              <div style={{
                position: 'absolute', left: '22%', top: '84%', transform: 'translate(-50%, -50%)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: '#ffffff',
                border: '1.5px solid #7c3aed', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.15)',
                fontSize: '0.6875rem', fontWeight: 700, color: '#7c3aed', zIndex: 3, display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed' }} />
                Slack #engineering
              </div>

              {/* Node: Sarvam Voice (Bottom Right) */}
              <div style={{
                position: 'absolute', left: '78%', top: '84%', transform: 'translate(-50%, -50%)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: '#ffffff',
                border: '1.5px solid #ea580c', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.15)',
                fontSize: '0.6875rem', fontWeight: 700, color: '#ea580c', zIndex: 3, display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ea580c' }} />
                Sarvam Voice 🎙️
              </div>
            </div>

            {/* Bottom Live Query Bar */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              zIndex: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                  "What changed in billing this week?"
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span style={{ fontSize: '0.75rem', fontWeight: 750, color: '#16a34a' }}>98.4% Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}




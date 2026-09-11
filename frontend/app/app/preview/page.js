'use client';
import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Layers, Eye } from 'lucide-react';
import ThreeDCompanyBrain from '@/components/marketing/ThreeDCompanyBrain';

export default function ParleyPreviewPage() {
  const [activeView, setActiveView] = useState('all');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F7F4',
      color: '#18181B',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '80px'
    }}>
      {/* Top sticky review navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(248, 247, 244, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #EAE8E3',
        padding: '14px 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: '#EA580C',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '999px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              DESIGN PREVIEW
            </span>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: '#18181B' }}>
              CognitRAG — Framer "Parley" Warm Minimalist Theme
            </span>
          </div>

          {/* Quick view switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveView('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: activeView === 'all' ? '1.5px solid #EA580C' : '1px solid #EAE8E3',
                background: activeView === 'all' ? '#FFF' : 'transparent',
                color: activeView === 'all' ? '#EA580C' : '#71717A',
                fontSize: '0.8125rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              All Sections
            </button>
            <button
              onClick={() => setActiveView('hero')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: activeView === 'hero' ? '1.5px solid #EA580C' : '1px solid #EAE8E3',
                background: activeView === 'hero' ? '#FFF' : 'transparent',
                color: activeView === 'hero' ? '#EA580C' : '#71717A',
                fontSize: '0.8125rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              1. Hero & Trust
            </button>
            <button
              onClick={() => setActiveView('bento')}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: activeView === 'bento' ? '1.5px solid #EA580C' : '1px solid #EAE8E3',
                background: activeView === 'bento' ? '#FFF' : 'transparent',
                color: activeView === 'bento' ? '#EA580C' : '#71717A',
                fontSize: '0.8125rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              2. Bento & Pricing
            </button>
          </div>
        </div>
      </header>

      {/* Main presentation content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 0' }}>
        
        {/* Intro Banner */}
        <div style={{
          textAlign: 'center',
          maxWidth: '760px',
          margin: '0 auto 48px auto'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(234, 88, 12, 0.1)',
            color: '#EA580C',
            fontSize: '0.75rem',
            fontWeight: 750,
            padding: '4px 14px',
            borderRadius: '999px',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} /> MATCHING YOUR FRAMER "PARLEY" REFERENCE SCREENSHOTS
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 850,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            color: '#18181B',
            marginBottom: '14px'
          }}>
            Warm Bone Background. Radiant Sunset Card.<br />Clean Bento & Editorial Typography.
          </h1>
          <p style={{
            fontSize: '1.0625rem',
            color: '#71717A',
            lineHeight: 1.6
          }}>
            Here is the design review crafted specifically from your reference images. Review the hero, trust strip, bento grid, and pricing cards below.
          </p>
        </div>

        {/* Live Interactive 3D Cognitive Brain Section (Seamless, No Square Section) */}
        <section style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #EAE8E3',
          padding: '28px',
          marginBottom: '40px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid #F4F3EE',
            paddingBottom: '14px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                LIVE 3D WEBGL COMPONENT
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0 0', color: '#18181B' }}>
                Cognitive Pipeline: 3D Geodesic Knowledge Core & Dynamic Synaptic Links
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EA580C', fontSize: '0.8125rem', fontWeight: 700, background: '#FFF7ED', padding: '4px 12px', borderRadius: '999px', border: '1px solid #FFEDD5' }}>
              <Sparkles size={15} /> Move cursor to rotate 3D neural brain in real-time
            </div>
          </div>

          <ThreeDCompanyBrain />
        </section>

        {/* Section 1: Hero & Trust */}
        {(activeView === 'all' || activeView === 'hero') && (
          <section style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #EAE8E3',
            padding: '32px',
            marginBottom: '40px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid #F4F3EE',
              paddingBottom: '16px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SECTION 01
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0 0', color: '#18181B' }}>
                  Enclosed Sunset Hero Card & Monochromatic Trust Strip
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontSize: '0.8125rem', fontWeight: 650 }}>
                <CheckCircle2 size={16} /> Parley Aesthetic Verified
              </div>
            </div>

            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #EAE8E3' }}>
              <img
                src="/parley-hero-preview.jpg"
                alt="Parley Style Hero Preview"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            <div style={{
              marginTop: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              padding: '16px',
              background: '#FBFBFA',
              borderRadius: '12px',
              border: '1px solid #EAE8E3'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase' }}>Color Harmony</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181B', marginTop: '2px' }}>
                  Bone (#F8F7F4) + Terracotta Sunset Radiant
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase' }}>Typography</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181B', marginTop: '2px' }}>
                  Editorial Sans with Italic Accent (*"with you"*)
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase' }}>Live Stats Integration</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181B', marginTop: '2px' }}>
                  164+ Teams Onboarded • 100% Auditable
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 2: Bento Grid & Pricing */}
        {(activeView === 'all' || activeView === 'bento') && (
          <section style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #EAE8E3',
            padding: '32px',
            marginBottom: '40px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              borderBottom: '1px solid #F4F3EE',
              paddingBottom: '16px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SECTION 02
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0 0', color: '#18181B' }}>
                  "Why CognitRAG" 4-Card Bento Grid & Warm Radiant Pricing
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontSize: '0.8125rem', fontWeight: 650 }}>
                <CheckCircle2 size={16} /> 01-04 Numbered Cards + Featured Sunset Pro Card
              </div>
            </div>

            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #EAE8E3' }}>
              <img
                src="/parley-bento-pricing.jpg"
                alt="Parley Style Bento & Pricing Preview"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            <div style={{
              marginTop: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              padding: '16px',
              background: '#FBFBFA',
              borderRadius: '12px',
              border: '1px solid #EAE8E3'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase' }}>Bento Numbering</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181B', marginTop: '2px' }}>
                  01. Context-aware • 02. Real action • 03. Connects • 04. Learning
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase' }}>Featured Pricing Card</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181B', marginTop: '2px' }}>
                  Pro ($49) highlighted with radiant warm sunset gradient
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase' }}>Pricing Tiers</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181B', marginTop: '2px' }}>
                  Solo ($0) • Pro ($49) • Teams ($89) + Annual Toggle
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Action Bar */}
        <div style={{
          background: '#18181B',
          borderRadius: '20px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          color: '#FFFFFF'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              Ready to implement this live on CognitRAG?
            </h3>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: '#A1A1AA' }}>
              All 12 marketing components will be updated to this warm bone + sunset radiant Framer design.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.875rem', color: '#EA580C', fontWeight: 700 }}>
              Say "go" or "approved" to proceed!
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}

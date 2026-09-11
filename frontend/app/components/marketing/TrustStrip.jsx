'use client';
import React, { useState } from 'react';
import { 
  GitBranch, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  HardDrive, 
  Users, 
  ShieldCheck,
  Lock,
  FileCheck,
  Zap,
  Sparkles,
  Award,
  Cpu,
  Globe2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function TrustStrip() {
  const [hoveredLogo, setHoveredLogo] = useState(null);

  const logos = [
    { name: 'Slack', icon: MessageSquare, color: '#E01E5A', bg: 'rgba(224, 30, 90, 0.08)', tag: 'Hinglish & Sync' },
    { name: 'GitHub', icon: GitBranch, color: '#24292F', bg: 'rgba(36, 41, 47, 0.08)', tag: 'Code & PRs' },
    { name: 'Jira', icon: FileText, color: '#0052CC', bg: 'rgba(0, 82, 204, 0.08)', tag: 'Tickets & Epics' },
    { name: 'Notion', icon: BookOpen, color: '#18181B', bg: 'rgba(24, 24, 27, 0.08)', tag: 'Knowledge Base' },
    { name: 'Neo4j Graph', icon: Cpu, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.08)', tag: 'Subgraphs' },
    { name: 'PostgreSQL', icon: HardDrive, color: '#336791', bg: 'rgba(51, 103, 145, 0.08)', tag: 'pgvector RLS' },
  ];

  const complianceItems = [
    { icon: Award, label: 'Sarvam AI Partner', sub: 'Startup Program Member', color: '#EA580C' },
    { icon: ShieldCheck, label: 'DPDP Act 2023', sub: 'Indian Data Sovereignty', color: '#16A34A' },
    { icon: Lock, label: 'SOC-2 Ready', sub: 'Audited RLS Security', color: '#18181B' },
    { icon: Zap, label: 'Zero Training Retention', sub: '100% Isolated Graphs', color: '#635BFF' }
  ];

  return (
    <section style={{
      width: '100%',
      padding: '48px 24px 64px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '28px',
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 247, 244, 0.6) 50%, rgba(255, 255, 255, 0) 100%)',
      overflow: 'hidden'
    }}>
      {/* 🌟 FEATURED SPOTLIGHT: SARVAM AI PARTNERSHIP HERO CARD 🌟 */}
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        position: 'relative',
        borderRadius: '24px',
        padding: 'clamp(18px, 4vw, 28px) clamp(16px, 4vw, 32px)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 237, 0.9) 50%, rgba(245, 243, 255, 0.95) 100%)',
        border: '1px solid rgba(234, 88, 12, 0.25)',
        boxShadow: '0 16px 40px rgba(234, 88, 12, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        alignItems: 'center',
        gap: '24px',
        overflow: 'hidden'
      }}>
        {/* Glow ambient circle */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.15), transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Left Column: Official Partnership Announcement */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #EA580C, #C2410C)',
              color: '#FFFFFF',
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 750,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
            }}>
              <Sparkles size={13} />
              <span>Official Partnership</span>
            </div>

            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#9A3412',
              background: 'rgba(234, 88, 12, 0.08)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(234, 88, 12, 0.2)'
            }}>
              Sarvam AI Startup Program Member
            </span>
          </div>

          <h3 style={{
            fontSize: 'clamp(1.25rem, 2.2vw, 1.65rem)',
            fontWeight: 800,
            color: '#18181B',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
            margin: '0 0 10px 0'
          }}>
            Backed by <span style={{
              background: 'linear-gradient(135deg, #EA580C 0%, #F97316 60%, #635BFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>Sarvam AI</span> for Sovereign Multilingual Intelligence
          </h3>

          <p style={{
            color: '#52525B',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            margin: 0
          }}>
            CognitRAG is officially part of the <strong>Sarvam Startup Program</strong>. We leverage Sarvam's business-tier infrastructure, Saaras voice STT/TTS across 10+ Indian languages, and Document Digitization to pioneer deterministic enterprise search for India and global tech teams.
          </p>
        </div>

        {/* Right Column: 4 Strategic Pillars Provided by Sarvam AI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(234, 88, 12, 0.2)',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EA580C', fontWeight: 750, fontSize: '0.8125rem', marginBottom: '4px' }}>
              <Zap size={15} />
              <span>Business-Tier SLA</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#71717A', lineHeight: 1.4 }}>
              Prioritized high-throughput concurrency with dedicated queue access.
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(99, 91, 255, 0.2)',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#635BFF', fontWeight: 750, fontSize: '0.8125rem', marginBottom: '4px' }}>
              <Globe2 size={15} />
              <span>10+ Indic Languages</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#71717A', lineHeight: 1.4 }}>
              Native Saaras voice recognition, TTS synthesis & Hinglish normalization.
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', fontWeight: 750, fontSize: '0.8125rem', marginBottom: '4px' }}>
              <FileCheck size={15} />
              <span>Document Digitization</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#71717A', lineHeight: 1.4 }}>
              99.4% OCR precision on scanned bilingual Indian invoices and tax tables.
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0891B2', fontWeight: 750, fontSize: '0.8125rem', marginBottom: '4px' }}>
              <ShieldCheck size={15} />
              <span>DPDP 2023 Sovereign</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#71717A', lineHeight: 1.4 }}>
              100% Indian data residency guaranteeing RBI compliance.
            </div>
          </div>
        </div>
      </div>

      {/* Eyebrow Label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '8px'
      }}>
        <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, transparent, #D4D4D8)' }} />
        <span style={{
          color: '#71717A',
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          textAlign: 'center',
          fontWeight: 750
        }}>
          Seamless Integration Across Enterprise Knowledge Hubs
        </span>
        <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, #D4D4D8, transparent)' }} />
      </div>

      {/* Broad 6-Column Single-Row Horizontal Integrations Showcase */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        maxWidth: '1280px',
        width: '100%'
      }}>
        {logos.map((logo, idx) => {
          const Icon = logo.icon;
          const isHovered = hoveredLogo === idx;

          return (
            <div
              key={logo.name}
              onMouseEnter={() => setHoveredLogo(idx)}
              onMouseLeave={() => setHoveredLogo(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                border: isHovered ? `1px solid ${logo.color}` : '1px solid rgba(228, 228, 231, 0.85)',
                borderRadius: '16px',
                boxShadow: isHovered 
                  ? `0 10px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px ${logo.color}25` 
                  : '0 2px 8px rgba(0, 0, 0, 0.03)',
                transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: isHovered ? logo.bg : 'rgba(244, 244, 245, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                color: isHovered ? logo.color : '#52525B',
                flexShrink: 0
              }}>
                <Icon size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  fontSize: '0.975rem',
                  fontWeight: 700,
                  color: isHovered ? '#18181B' : '#27272A',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {logo.name}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: isHovered ? logo.color : '#A1A1AA',
                  fontWeight: 600,
                  marginTop: '1px',
                  letterSpacing: '0.01em'
                }}>
                  {logo.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Wide Enterprise Security & Compliance Command Bar */}
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        padding: '20px 28px',
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(228, 228, 231, 0.9)',
        borderRadius: '20px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        alignItems: 'center'
      }}>
        {complianceItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '4px 8px',
                borderLeft: idx > 0 ? '1px solid rgba(228, 228, 231, 0.85)' : 'none',
                paddingLeft: idx > 0 ? '20px' : '8px'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(244, 244, 245, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color,
                flexShrink: 0
              }}>
                <Icon size={19} />
              </div>
              <div>
                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: 750,
                  color: '#18181B',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#71717A',
                  fontWeight: 500,
                  marginTop: '2px'
                }}>
                  {item.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

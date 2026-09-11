'use client';
import React, { useEffect } from 'react';
import { 
  X, Code2, Building2, FileText, ArrowRight, 
  ShieldCheck, Lock, Sparkles, Check, ChevronRight
} from 'lucide-react';

export default function PersonaSelectionModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const personas = [
    {
      id: 'dev_studio',
      name: 'Developer Code Studio',
      badge: 'For Engineers & Architects',
      badgeColor: '#635BFF',
      icon: Code2,
      tagline: 'Deep Repository AST, Call-Graph & Voice Search',
      description: 'Explore codebases with AST syntax trees, function call graphs, and voice-to-code search powered by Sarvam Saaras in natural Indian accents.',
      href: '/sign-up?persona=dev_studio',
      highlight: 'Rate-Limited Safe (6,000 TPM Budget)'
    },
    {
      id: 'company_brain',
      name: 'Enterprise Company Brain',
      badge: 'For Tech Teams & Enterprises',
      badgeColor: '#0284C7',
      icon: Building2,
      tagline: 'Cross-Platform Team Intelligence with Hinglish NLP',
      description: 'Connect Slack, Jira, GitHub, and Notion. Resolves colloquial Hinglish chats into verified tickets and code commits with 98.2% audited faithfulness.',
      href: '/sign-up?persona=company_brain',
      highlight: 'Zero Data Collision with Other Personas'
    },
    {
      id: 'bharat_intelligence',
      name: 'Bharat Document Intelligence',
      badge: 'For Indian BFSI, Legal & MSMEs',
      badgeColor: '#D97706',
      icon: FileText,
      tagline: 'Scanned Bilingual OCR + 2-Way Indic Voice RAG',
      description: 'Digitize degraded bilingual invoices, GST circulars, and legal contracts via Sarvam Document Digitization. Ask in Hindi or Tamil and hear spoken answers.',
      href: '/sign-up?persona=bharat_intelligence',
      highlight: 'Powered by Sarvam AI Partnership'
    }
  ];

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 15, 0.82)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          background: '#0B0F19',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: 'clamp(18px, 4vw, 24px) clamp(16px, 4vw, 28px)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          color: '#FFFFFF',
          position: 'relative',
          maxHeight: '94vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
          onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 91, 255, 0.12)', border: '1px solid rgba(99, 91, 255, 0.25)', padding: '3px 12px', borderRadius: 'var(--radius-pill)', color: '#818CF8', fontSize: '0.75rem', fontWeight: 650, marginBottom: '8px' }}>
            <Sparkles size={13} /> Choose Your Dedicated Environment
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#FFFFFF' }}>
            Select Your CognitRAG Persona
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.45' }}>
            Each persona provides a locked, zero-collision workspace tailored to your exact workflows. You can use the same email address across all three with zero cross-talk.
          </p>
        </div>

        {/* 3 Persona Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '14px', marginBottom: '18px' }}>
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <div 
                key={p.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${p.badgeColor}20`, color: p.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} />
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#94A3B8', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px' }}>{p.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', lineHeight: '1.45', margin: '0 0 14px' }}>{p.description}</p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#4ADE80', marginBottom: '14px', fontWeight: 600 }}>
                    <Check size={12} /> {p.highlight}
                  </div>

                  <a
                    href={p.href}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('cognitrag_persona', p.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      background: p.id === 'dev_studio' ? 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)' : p.id === 'bharat_intelligence' ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' : '#1E293B',
                      color: '#FFFFFF',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    Select Persona <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

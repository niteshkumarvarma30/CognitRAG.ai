'use client';
import { useState } from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui';

export default function ConfidenceBreakdown({ confidence = 'high', sourcesCount = 0, score = null }) {
  const [isOpen, setIsOpen] = useState(false);

  const config = {
    high: { 
      label: 'High Confidence', 
      color: 'var(--success)', 
      bg: 'var(--success-light)',
      icon: <ShieldCheck size={14} />,
      desc: 'Multiple verified sources confirm this information. Graph validation passed.'
    },
    moderate: { 
      label: 'Moderate Confidence', 
      color: 'var(--warning)', 
      bg: 'rgba(217, 119, 6, 0.1)',
      icon: <Info size={14} />,
      desc: 'Based on limited sources. Some context may be outdated or incomplete.'
    },
    low: { 
      label: 'Low Confidence', 
      color: 'var(--error)', 
      bg: 'var(--error-light)',
      icon: <AlertTriangle size={14} />,
      desc: 'Very little evidence found. The answer relies on partial matches.'
    },
    conflicting: { 
      label: 'Conflicting Sources', 
      color: 'var(--violet)', 
      bg: 'rgba(124, 58, 237, 0.1)',
      icon: <AlertCircle size={14} />,
      desc: 'Different sources provide contradictory information on this topic.'
    }
  };

  const active = config[confidence.toLowerCase()] || config.high;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', borderRadius: 'var(--radius-pill)',
          background: active.bg, border: `1px solid ${active.color}30`,
          color: active.color, fontSize: '0.75rem', fontWeight: 650,
          cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 150ms ease'
        }}
      >
        {active.icon}
        {active.label}
      </button>

      {/* Popover */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
            width: '260px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)', padding: 'var(--space-4)',
            zIndex: 50,
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Confidence Assessment
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-3)', margin: 0 }}>
            {active.desc}
          </p>
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' 
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sources Grounded:</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sourcesCount}</span>
          </div>
          {score !== null && (
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: 'var(--space-2)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Retrieval Score:</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{(score * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

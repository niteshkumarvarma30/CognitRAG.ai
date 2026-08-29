'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export default function Drawer({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  width = '420px',
  position = 'right',
  className = '',
}) {
  const drawerRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="cr-drawer__backdrop"
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 10, 15, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease forwards',
        }}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`cr-drawer ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed',
          top: 0,
          [position]: 0,
          bottom: 0,
          width,
          maxWidth: '90vw',
          background: 'var(--surface)',
          borderLeft: position === 'right' ? '1px solid var(--border)' : 'none',
          borderRight: position === 'left' ? '1px solid var(--border)' : 'none',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: `slideIn${position === 'right' ? 'Right' : 'Left'} 0.25s var(--ease-out) forwards`,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            {title && <h3 style={{ fontSize: '1.125rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: subtitle ? '2px' : 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'var(--surface-soft)'; e.target.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = 'var(--text-muted)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-6)',
        }}>
          {children}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

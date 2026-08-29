'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open = false,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  destructive = false,
  className = '',
}) {
  const modalRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '520px' },
    lg: { maxWidth: '680px' },
    xl: { maxWidth: '860px' },
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 10, 15, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'modalFadeIn 0.2s ease forwards',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 'var(--space-6)',
        }}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={className}
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            width: '100%',
            ...sizeStyles[size],
            animation: 'modalSlideUp 0.25s var(--ease-out) forwards',
            outline: 'none',
          }}
        >
          {/* Header */}
          {(title || onClose) && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: 'var(--space-5) var(--space-6)',
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                {title && (
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 650,
                    color: destructive ? 'var(--error)' : 'var(--text-primary)',
                    marginBottom: description ? '4px' : 0,
                  }}>
                    {title}
                  </h3>
                )}
                {description && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {description}
                  </p>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--space-1)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div style={{ padding: 'var(--space-6)' }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              padding: 'var(--space-4) var(--space-6)',
              borderTop: '1px solid var(--border)',
            }}>
              {footer}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

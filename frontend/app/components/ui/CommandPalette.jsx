'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowRight, Hash, FileText, Users, GitBranch, BookOpen, X } from 'lucide-react';

const CATEGORY_ICONS = {
  knowledge: FileText,
  entities:  Users,
  decisions: GitBranch,
  sops:      BookOpen,
  ask:       Search,
  default:   Hash,
};

export default function CommandPalette({
  open = false,
  onClose,
  onSelect,
  items = [],
  placeholder = 'Search or ask anything...',
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter items
  const filtered = query.trim()
    ? items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) {
          onClose?.();
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open, onClose]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose?.();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      onSelect?.(filtered[activeIndex]);
      onClose?.();
    }
  }, [filtered, activeIndex, onClose, onSelect]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.children[activeIndex];
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10, 10, 15, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'modalFadeIn 0.15s ease forwards',
        }}
      />

      {/* Palette */}
      <div
        style={{
          position: 'fixed',
          top: '20%', left: '50%',
          transform: 'translateX(-50%)',
          width: '100%', maxWidth: '580px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s var(--ease-out) forwards',
        }}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--border)',
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'none',
              fontSize: '0.9375rem', color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <kbd style={{
            fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
            padding: '2px 6px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          style={{
            maxHeight: '360px', overflowY: 'auto',
            padding: 'var(--space-2)',
          }}
        >
          {filtered.length === 0 && (
            <div style={{
              padding: 'var(--space-8) var(--space-6)',
              textAlign: 'center', color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}>
              {query ? 'No results found' : 'Start typing to search...'}
            </div>
          )}

          {filtered.map((item, index) => {
            const IconComp = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.default;
            const isActive = index === activeIndex;

            return (
              <button
                key={item.id || index}
                onClick={() => { onSelect?.(item); onClose?.(); }}
                onMouseEnter={() => setActiveIndex(index)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  width: '100%', padding: 'var(--space-3) var(--space-4)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--surface-soft)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 100ms ease',
                }}
              >
                <IconComp size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.875rem', fontWeight: 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </div>
                  {item.description && (
                    <div style={{
                      fontSize: '0.75rem', color: 'var(--text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.description}
                    </div>
                  )}
                </div>
                {isActive && <ArrowRight size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: 'var(--space-3) var(--space-5)',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 'var(--space-4)',
          fontSize: '0.6875rem', color: 'var(--text-muted)',
        }}>
          <span><kbd style={{ fontFamily: 'var(--font-mono)', padding: '1px 4px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '3px' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ fontFamily: 'var(--font-mono)', padding: '1px 4px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '3px' }}>↵</kbd> select</span>
          <span><kbd style={{ fontFamily: 'var(--font-mono)', padding: '1px 4px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '3px' }}>esc</kbd> close</span>
        </div>
      </div>
    </>
  );
}

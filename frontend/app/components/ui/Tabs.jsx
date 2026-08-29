'use client';

import { useState } from 'react';

export default function Tabs({
  tabs = [],
  defaultIndex = 0,
  onChange,
  size = 'md',
  variant = 'default',
  className = '',
}) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    onChange?.(index, tabs[index]);
  };

  const sizeStyles = {
    sm: { fontSize: '0.8125rem', padding: '6px 12px' },
    md: { fontSize: '0.875rem', padding: '8px 16px' },
    lg: { fontSize: '0.9375rem', padding: '10px 20px' },
  };

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: variant === 'pills' ? 'var(--space-2)' : '0',
          borderBottom: variant === 'default' ? '1px solid var(--border)' : 'none',
          ...(variant === 'pills' ? {
            background: 'var(--bg)',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          } : {}),
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const baseStyle = {
            ...sizeStyles[size],
            fontWeight: isActive ? 600 : 500,
            cursor: tab.disabled ? 'not-allowed' : 'pointer',
            opacity: tab.disabled ? 0.5 : 1,
            transition: 'all 150ms ease',
            border: 'none',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
          };

          const variantStyle = variant === 'pills'
            ? {
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--surface)' : 'transparent',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
              }
            : {
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-1px',
              };

          return (
            <button
              key={tab.key || index}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleTabClick(index)}
              style={{ ...baseStyle, ...variantStyle }}
            >
              {tab.icon && <tab.icon size={14} />}
              {tab.label}
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  background: isActive ? 'var(--primary-light)' : 'rgba(0,0,0,0.05)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div role="tabpanel" style={{ marginTop: 'var(--space-5)' }}>
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}

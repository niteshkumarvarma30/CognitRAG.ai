'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function GlobalNav({ onEarlyAccess }) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderBottom: '1px solid var(--border)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1200px'
      }}>
        {/* Left: Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--primary)" />
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>CognitRAG</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>| Company Brain</span>
        </div>

        {/* Center: Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['Product', 'Solutions', 'Developers', 'Pricing'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'color var(--duration-fast) var(--ease-out)'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/sign-in" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'color var(--duration-fast) var(--ease-out)'
          }}
          onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
            Sign In
          </Link>
          <button
            onClick={onEarlyAccess}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 18px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity var(--duration-fast) var(--ease-out)'
            }}
            onMouseOver={(e) => e.target.style.opacity = 0.9}
            onMouseOut={(e) => e.target.style.opacity = 1}
          >
            Get Early Access
          </button>
        </div>
      </div>
    </nav>
  );
}

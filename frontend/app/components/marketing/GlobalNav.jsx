'use client';
import React, { useState } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function GlobalNav({ onEarlyAccess }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Personas', href: '#personas' },
    { label: 'Architecture', href: '#how-it-works' },
    { label: 'Benchmarks', href: '#benchmarks' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(248, 247, 244, 0.92)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 clamp(16px, 4vw, 24px)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1200px',
        height: '64px'
      }}>
        {/* Left: Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: '#18181B',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EA580C',
            flexShrink: 0
          }}>
            <Sparkles size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ 
              fontWeight: 850, 
              fontSize: '1.25rem', 
              letterSpacing: '-0.03em', 
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}>
              CognitRAG
            </span>
            <span style={{ fontSize: '0.625rem', fontWeight: 750, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Multilingual Brain
            </span>
          </div>
        </Link>

        {/* Center: Nav links (Desktop only) */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: '28px' }}>
          {navLinks.map(item => (
            <a key={item.label} href={item.href} style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 550,
              transition: 'color var(--duration-fast) var(--ease-out)'
            }}
            onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right: Actions (Desktop only) */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: '16px' }}>
          <Link href="/sign-in" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 550
          }}>
            Sign In
          </Link>
          <button
            onClick={onEarlyAccess}
            style={{
              backgroundColor: '#18181B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 20px',
              fontSize: '0.875rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            Get CognitRAG
          </button>
        </div>

        {/* Mobile Hamburger Trigger (Mobile only) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-only"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div style={{
          width: '100%',
          padding: '16px 0 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }} className="mobile-only">
          {navLinks.map(item => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                padding: '8px 4px'
              }}
            >
              {item.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              Sign In
            </Link>
            <button
              onClick={() => { setMobileOpen(false); onEarlyAccess?.(); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: '#18181B',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 650,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Get CognitRAG
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

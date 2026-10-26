'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShieldCheck } from 'lucide-react';

export default function GlobalNav({ onOpenEarlyAccess }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Demo', href: '#demo' },
    { label: 'Connections', href: '#connections' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Plans', href: '#plans' },
    { label: 'Contact', href: 'mailto:niteshkumarvarma@cognitrag.com' }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(8, 11, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)',
      paddingTop: 'env(safe-area-inset-top, 0px)'
    }}>
      <div className="landing-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px'
      }}>
        {/* Brand */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: 'var(--ink)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--ind)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <ShieldCheck size={16} />
          </div>
          <span style={{
            fontWeight: 700,
            fontSize: '1.05rem',
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            CognitRAG<span style={{ color: 'var(--ind)' }}>.ai</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '24px'
        }} className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                color: 'var(--mute)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--ink)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--mute)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA and Mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            href="/sign-in"
            style={{
              color: 'var(--ink)',
              textDecoration: 'none',
              padding: '6px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid var(--line)',
              backgroundColor: 'transparent',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--ind)'; e.target.style.color = 'var(--ind)'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--ink)'; }}
          >
            Sign In
          </Link>

          <Link
            href="/sign-up?plan=teams"
            style={{
              backgroundColor: 'var(--ind)',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '6px',
              padding: '7px 14px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            Start Free Trial
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              padding: '6px',
              color: 'var(--ink)',
              display: 'flex',
              cursor: 'pointer'
            }}
            className="mobile-toggle"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          backgroundColor: 'var(--bg2)',
          borderBottom: '1px solid var(--line)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }} className="mobile-drawer">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                color: 'var(--ink)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                padding: '6px 0'
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link
              href="/sign-up?plan=teams"
              onClick={() => setMobileOpen(false)}
              style={{
                padding: '8px 12px', background: 'var(--ind)', color: '#fff',
                borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center'
              }}
            >
              Start Teams Trial ($99)
            </Link>
            <Link
              href="/sign-up?plan=solo"
              onClick={() => setMobileOpen(false)}
              style={{
                padding: '8px 12px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)',
                borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center'
              }}
            >
              Start Solo Trial ($29)
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              style={{
                color: 'var(--mute)', textDecoration: 'none', fontSize: '0.85rem', textAlign: 'center', paddingTop: '4px'
              }}
            >
              Already have an account? <span style={{ color: 'var(--ind)', fontWeight: 600 }}>Sign In &rarr;</span>
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 680px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

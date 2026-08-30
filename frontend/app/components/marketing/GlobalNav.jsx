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
        {/* Left: 3D Glowing Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #635bff 0%, #4338ca 50%, #06b6d4 100%)',
            boxShadow: '0 6px 16px rgba(99, 91, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transform: 'perspective(500px) rotateY(-4deg)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}>
            <Sparkles size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ 
              fontWeight: 850, 
              fontSize: '1.45rem', 
              letterSpacing: '-0.025em', 
              background: 'linear-gradient(135deg, #0f172a 0%, #312e81 60%, #4338ca 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.05
            }}>
              CognitRAG
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 750, color: 'var(--primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Company Brain AI
            </span>
          </div>
        </Link>



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

'use client';
import React from 'react';
import { GitBranch, AtSign, Briefcase, Sparkles } from 'lucide-react';

export default function Footer() {
  const links = {
    product: ['Ask Brain', 'Knowledge Graph', 'Semantic Dictionary', 'Integrations', 'AI Agents'],
    company: ['About', 'Blog', 'Careers', 'Contact'],
    legal: ['Privacy Policy', 'Terms of Service', 'Security', 'DPA']
  };

  const columnStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
  const headingStyle = { color: 'var(--text-on-dark)', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' };
  const linkStyle = { color: 'var(--text-on-dark-muted)', fontSize: '0.875rem', textDecoration: 'none', cursor: 'pointer' };

  return (
    <footer style={{ width: '100%', background: 'var(--surface-dark, #0A0A0F)', color: 'var(--text-on-dark, #E8E8ED)', padding: '64px 0 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-4, 16px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '64px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-on-dark)', fontWeight: 700, fontSize: '1.25rem' }}>
              <Sparkles size={20} color="var(--primary)" />
              CognitRAG
            </div>
            <div style={{ color: 'var(--text-on-dark)', fontWeight: 500 }}>The Company Brain</div>
            <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Trusted context for humans and AI agents.
            </div>
          </div>

          <div style={columnStyle}>
            <div style={headingStyle}>Product</div>
            {links.product.map(link => (
              <a key={link} href="#" style={linkStyle}>{link}</a>
            ))}
          </div>

          <div style={columnStyle}>
            <div style={headingStyle}>Company</div>
            {links.company.map(link => (
              <a key={link} href="#" style={linkStyle}>{link}</a>
            ))}
          </div>

          <div style={columnStyle}>
            <div style={headingStyle}>Legal</div>
            {links.legal.map(link => (
              <a key={link} href="#" style={linkStyle}>{link}</a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-dark, #2A2A35)', paddingTop: '32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.8125rem' }}>
            © 2026 CognitRAG. All rights reserved.
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'var(--text-on-dark-muted)' }}><GitBranch size={20} /></a>
            <a href="#" style={{ color: 'var(--text-on-dark-muted)' }}><AtSign size={20} /></a>
            <a href="#" style={{ color: 'var(--text-on-dark-muted)' }}><Briefcase size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

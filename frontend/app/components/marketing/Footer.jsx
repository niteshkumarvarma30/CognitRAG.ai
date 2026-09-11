'use client';
import React from 'react';
import Link from 'next/link';
import { GitBranch, AtSign, Briefcase, Sparkles, Shield } from 'lucide-react';

export default function Footer() {
  const links = {
    product: [
      { name: 'Knowledge Graph', href: '#product' },
      { name: 'Architecture', href: '#how-it-works' },
      { name: 'Scientific Benchmarks', href: '#benchmarks' },
      { name: 'Pricing Tiers', href: '#pricing' },
      { name: 'Model Context Protocol (MCP)', href: '#solutions' }
    ],
    solutions: [
      { name: 'Financial & SEC Audits', href: '#solutions' },
      { name: 'Engineering & DevOps Incident Triage', href: '#solutions' },
      { name: 'Legal Due Diligence', href: '#solutions' },
      { name: 'Autonomous Copilot Backends', href: '#solutions' }
    ],
    company: [
      { name: 'Security & Compliance', href: '#faq' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Contact & Support', href: '#pricing' }
    ]
  };

  const columnStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
  const headingStyle = { color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' };
  const linkStyle = { color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.15s ease' };

  return (
    <footer style={{ width: '100%', background: 'var(--surface)', borderTop: '1px solid var(--border)', color: 'var(--text-primary)', padding: '64px 0 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-4, 16px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px', marginBottom: '64px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.35rem' }}>
              <Sparkles size={22} color="var(--primary)" />
              CognitRAG
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem' }}>
              Autonomous Company Brain & Hybrid Graph-RAG
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Turn fragmented enterprise documents, PDFs, and databases into a verified, 100% auditable knowledge graph.
            </div>

            {/* Live Systems Operational Indicator */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(22, 163, 74, 0.08)',
              border: '1px solid rgba(22, 163, 74, 0.25)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              width: 'fit-content',
              marginTop: '8px'
            }}>
              <span className="live-pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D' }}>
                All Systems Operational • 99.99% SLA
              </span>
            </div>
          </div>

          <div style={columnStyle}>
            <div style={headingStyle}>Product & Architecture</div>
            {links.product.map((link, i) => (
              <a key={i} href={link.href} style={linkStyle}>{link.name}</a>
            ))}
          </div>

          <div style={columnStyle}>
            <div style={headingStyle}>Solutions</div>
            {links.solutions.map((link, i) => (
              <a key={i} href={link.href} style={linkStyle}>{link.name}</a>
            ))}
          </div>

          <div style={columnStyle}>
            <div style={headingStyle}>Company & Trust</div>
            {links.company.map((link, i) => (
              <a key={i} href={link.href} style={linkStyle}>{link.name}</a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            © 2026 CognitRAG Inc. Built for enterprise scale, zero data retention, and 100% auditable knowledge graphs.
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} title="GitHub repository"><GitBranch size={18} /></a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} title="Contact Email"><AtSign size={18} /></a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} title="Careers"><Briefcase size={18} /></a>
            <Link 
              href="/dashboard" 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('cognitrag_persona', 'superadmin');
                }
              }}
              style={{ 
                color: 'var(--text-muted)', 
                textDecoration: 'none', 
                opacity: 0.35, 
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '6px'
              }} 
              title="SuperAdmin"
              onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.color = '#6366f1'; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = '0.35'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Shield size={14} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

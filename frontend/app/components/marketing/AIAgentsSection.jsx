'use client';

import { Bot, ArrowRight, Cpu, FileCode, Shield } from 'lucide-react';

export default function AIAgentsSection() {
  const features = [
    { icon: FileCode, title: 'Structured Skills', desc: 'Define reusable AI skills with input schemas, required context, business rules, and allowed actions.' },
    { icon: Cpu, title: 'Model Context Protocol', desc: 'Expose company knowledge, entities, policies, and rules to any MCP-compatible AI agent or application.' },
    { icon: Shield, title: 'Permission Boundaries', desc: 'Every agent query respects RBAC, source ACLs, and tenant isolation — enforced by the system, not the model.' },
  ];

  return (
    <section id="developers" style={{
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: 'var(--space-24) var(--space-6)',
      position: 'relative',
      overflow: 'hidden',
      scrollMarginTop: '80px',
    }}>
      {/* Subtle architectural grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(79, 70, 229, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.8,
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--primary-light)', color: 'var(--primary)',
            padding: '5px 14px', borderRadius: 'var(--radius-pill)',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}>
            <Bot size={15} /> AI AGENTS & NATIVE MCP
          </div>

          <h2 style={{
            fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: 'var(--space-4)',
            lineHeight: 1.2,
          }}>
            Give your AI agents the actual<br />context of your company.
          </h2>

          <p style={{
            fontSize: '1.0625rem', color: 'var(--text-secondary)',
            maxWidth: '620px', margin: '0 auto', lineHeight: 1.6,
          }}>
            CognitRAG exposes verified company knowledge through Model Context Protocol (MCP) and REST APIs, 
            allowing Claude, Cursor, and internal autonomous agents to reason with mathematically verified subgraph context and 100% citation precision.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-5)',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 200ms ease',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                <f.icon size={22} />
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { Bot, ArrowRight, Cpu, FileCode, Shield } from 'lucide-react';

export default function AIAgentsSection() {
  const features = [
    { icon: FileCode, title: 'Structured Skills', desc: 'Define reusable AI skills with input schemas, required context, business rules, and allowed actions.' },
    { icon: Cpu, title: 'Model Context Protocol', desc: 'Expose company knowledge, entities, policies, and rules to any MCP-compatible AI agent or application.' },
    { icon: Shield, title: 'Permission Boundaries', desc: 'Every agent query respects RBAC, source ACLs, and tenant isolation — enforced by the system, not the model.' },
  ];

  return (
    <section style={{
      background: 'var(--surface-dark)',
      padding: 'var(--space-24) var(--space-6)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(99,91,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,91,255,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'rgba(99,91,255,0.12)', color: 'var(--primary)',
            padding: '4px 14px', borderRadius: 'var(--radius-pill)',
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
          }}>
            <Bot size={14} /> AI AGENTS & MCP
          </div>

          <h2 style={{
            fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em',
            color: 'var(--text-on-dark)', marginBottom: 'var(--space-4)',
          }}>
            Give your AI the context your<br />company actually has.
          </h2>

          <p style={{
            fontSize: '1.0625rem', color: 'var(--text-on-dark-muted)',
            maxWidth: '600px', margin: '0 auto', lineHeight: 1.6,
          }}>
            CognitRAG exposes governed company knowledge through APIs and the Model Context Protocol, 
            enabling AI agents to reason with real organizational context.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--surface-dark-panel)',
              border: '1px solid var(--border-dark)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              transition: 'all var(--duration-normal) var(--ease-out)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: 'rgba(99,91,255,0.12)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                <f.icon size={20} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 650, color: 'var(--text-on-dark)', marginBottom: 'var(--space-2)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-on-dark-muted)', lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

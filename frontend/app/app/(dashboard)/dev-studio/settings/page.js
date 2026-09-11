'use client';
import React from 'react';
import Link from 'next/link';
import { 
  Code2, ArrowLeft, CheckCircle2, Cpu, 
  GitBranch, Terminal, ShieldCheck, Database, Sliders
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function DevStudioSettingsPage() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: 44, height: 44, borderRadius: '12px', 
            background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Code2 size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Developer Code Studio Settings
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              AST index parameters, call-graph traversal limits, and LLM rate limiter budget.
            </p>
          </div>
        </div>

        <Link
          href="/dev-studio"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'var(--surface-soft)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> Back to Code Studio
        </Link>
      </div>

      {/* Grid of Settings Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Token Bucket Budget */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Rate-Limit Budget</h3>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>6,000 TPM Protected</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Ingestion throughput is dynamically throttled to 75% of Groq's 8k TPM limit, guaranteeing zero HTTP 429 errors during multi-file repository indexing.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
            <CheckCircle2 size={14} /> TokenBucketRateLimiter Active
          </div>
        </div>

        {/* Neo4j AST Graph */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Neo4j AST Code Graph</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bolt Driver Connected</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Deterministic indexing parses Python, TypeScript, and Go files into hierarchical AST entities (Modules, Classes, Functions, and CALLS relationships).
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
            <CheckCircle2 size={14} /> Graph Cypher Traversal Enabled
          </div>
        </div>

        {/* User Workspace Info */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Developer Workspace</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Local Sandbox Scoped</span>
            </div>
          </div>
          <div style={{ background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-primary)' }}>{user?.fullName || 'Developer'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{userEmail}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Role: <span style={{ fontWeight: 700, color: '#6366f1' }}>Developer</span>
          </div>
        </div>

      </div>

    </div>
  );
}

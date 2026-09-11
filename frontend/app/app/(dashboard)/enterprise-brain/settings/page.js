'use client';
import React from 'react';
import Link from 'next/link';
import { 
  Building2, ShieldCheck, Cpu, Key, ArrowLeft, 
  CheckCircle2, Lock, Users, Server, Mail, ExternalLink
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function EnterpriseSettingsPage() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: 44, height: 44, borderRadius: '12px', 
            background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Enterprise Brain Workspace Settings
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Tenant isolation, cross-platform connector scopes, and enterprise pilot controls.
            </p>
          </div>
        </div>

        <Link
          href="/enterprise-brain"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'var(--surface-soft)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> Back to Pilot Overview
        </Link>
      </div>

      {/* Grid of Settings Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Pilot Environment Card */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Pilot Environment</h3>
              <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Private Tenant • Isolated Neo4j Subgraph</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Your Enterprise Company Brain is partitioned with strict cryptographic tenant separation. Data ingested during pilot testing never touches Developer Code Studio or Bharat Intelligence partitions.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
            <CheckCircle2 size={14} /> Zero Data Collision Enforced
          </div>
        </div>

        {/* Lead Account Card */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Enterprise Lead</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Pilot Contact</span>
            </div>
          </div>
          <div style={{ background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-primary)' }}>{user?.fullName || 'Enterprise Lead'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{userEmail}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Role: <span style={{ fontWeight: 700, color: '#0284c7' }}>Enterprise Pilot Admin</span>
          </div>
        </div>

        {/* Connected Tooling (Coming Soon) */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Target Connectors</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OAuth Permissions Scoped</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Slack (Hinglish NLP)', 'Jira Cloud', 'Confluence', 'GitHub Enterprise', 'Notion'].map((connector) => (
              <span key={connector} style={{ 
                fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', 
                borderRadius: '6px', background: 'var(--surface-soft)', 
                border: '1px solid var(--border)', color: 'var(--text-secondary)' 
              }}>
                {connector}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Connectors are activated by your Solutions Architect upon pilot approval.
          </p>
        </div>

      </div>

      {/* Solutions Architect Support Box */}
      <div style={{ 
        background: 'rgba(2, 132, 199, 0.05)', border: '1px solid rgba(2, 132, 199, 0.25)', 
        borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Dedicated Enterprise Support
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Have questions regarding custom SLA, on-prem VPC deployment, or pilot expansion?
            </div>
          </div>
        </div>

        <a
          href="mailto:pilot@cognitrag.ai?subject=Enterprise Pilot Query"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px', borderRadius: '8px',
            background: '#0284c7', color: '#ffffff',
            fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none'
          }}
        >
          Contact Solutions Team <ExternalLink size={14} />
        </a>
      </div>

    </div>
  );
}

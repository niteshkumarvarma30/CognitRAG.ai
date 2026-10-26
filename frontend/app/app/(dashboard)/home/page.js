'use client';
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Brain, Loader2, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@/lib/api';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    if (user) {
      const tid = localStorage.getItem('cognitrag_tenant_id');
      setTenantId(tid);
      loadStats(tid);
    }
  }, [user]);

  const loadStats = async (tid) => {
    if (!tid) { setLoading(false); return; }
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/admin/stats?tenant_id=${tid}`);
      if (res.ok) setStats(await res.json());
    } catch (e) { /* non-critical */ }
    setLoading(false);
  };

  const integrations = [
    { id: 'slack',   label: 'Slack App',    emoji: '💬', href: '/integrations' },
    { id: 'github',  label: 'GitHub App',   emoji: '🐙', href: '/integrations' },
    { id: 'jira',    label: 'Jira',         emoji: '📋', href: '/integrations' },
    { id: 'notion',  label: 'Notion',       emoji: '📓', href: '/integrations' },
    { id: 'drive',   label: 'Google Drive', emoji: '📁', href: '/integrations' },
    { id: 'meeting', label: 'Meeting Bot',  emoji: '📹', href: '/integrations' },
  ];

  const getIntegrationStatus = (id) => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`cognitrag_integration_${id}`) === 'connected';
  };

  const langDist = stats?.language_distribution || { en: 60, 'hi-latn': 25, mixed: 15 };
  const contradictionCount = stats?.unresolved_contradictions || 0;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Brain size={28} style={{ color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Company Brain
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          {user?.firstName ? `Welcome back, ${user.firstName}.` : 'Welcome.'} Your team can use{' '}
          <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem' }}>/ask</code>{' '}
          in Slack to query the brain.
        </p>
      </div>

      {/* Integration Status Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '1rem' }}>
          Connections
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {integrations.map(integration => {
            const connected = getIntegrationStatus(integration.id);
            return (
              <Link key={integration.id} href={integration.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  border: `1px solid ${connected ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  background: connected ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{integration.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{integration.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                    {connected
                      ? <><CheckCircle2 size={12} color="#22c55e" /> <span style={{ color: '#22c55e' }}>Connected</span></>
                      : <><XCircle size={12} color="var(--text-muted)" /> <span style={{ color: 'var(--text-muted)' }}>Not connected</span></>
                    }
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Brain Stats */}
      {stats && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '1rem' }}>
            Brain Stats
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'Documents', value: stats.document_count?.toLocaleString() || '0' },
              { label: 'Chunks', value: stats.chunk_count?.toLocaleString() || '0' },
              { label: 'EN Content', value: `${langDist.en || 0}%` },
              { label: 'HI-LATN Content', value: `${langDist['hi-latn'] || 0}%` },
            ].map(s => (
              <div key={s.label} style={{
                padding: '1rem', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contradictions Alert */}
      {contradictionCount > 0 && (
        <Link href="/metrics" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(251,146,60,0.3)',
            background: 'rgba(251,146,60,0.05)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            cursor: 'pointer'
          }}>
            <AlertTriangle size={18} color="#fb923c" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fb923c' }}>
                {contradictionCount} Unresolved Contradiction{contradictionCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Review conflicting claims in the Citation Audit dashboard
              </div>
            </div>
            <ArrowRight size={16} color="#fb923c" style={{ marginLeft: 'auto' }} />
          </div>
        </Link>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, BarChart2, Loader2, RefreshCw } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@/lib/api';
import ContradictionAlert from '@/components/ContradictionAlert';

export default function MetricsPage() {
  const { user } = useUser();
  const [contradictions, setContradictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    if (user) {
      const tid = localStorage.getItem('cognitrag_tenant_id') || user.id;
      setTenantId(tid);
      loadData(tid);
    }
  }, [user]);

  const loadData = async (tid) => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/contradictions?tenant_id=${tid}`);
      if (res.ok) {
        const data = await res.json();
        setContradictions(data.contradictions || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Mock lang + source distribution for display
  const langDist = { en: 60, 'hi-latn': 25, mixed: 15 };
  const sourceDist = { Slack: 45, GitHub: 20, Jira: 20, Notion: 15 };
  const confDist = { '>0.9': 45, '0.7-0.9': 35, '<0.7': 20 };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.3rem' }}>
            📊 Citation Audit Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Contradiction monitoring, confidence calibration, language distribution
          </p>
        </div>
        <button
          onClick={() => loadData(tenantId)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.82rem'
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Contradictions */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Contradictions
          </h2>
          {contradictions.length > 0 && (
            <span style={{
              padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem',
              background: 'rgba(251,146,60,0.15)', color: '#fb923c', fontWeight: 700
            }}>
              {contradictions.filter(c => c.status === 'unresolved').length} unresolved
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : contradictions.length === 0 ? (
          <div style={{
            padding: '2rem', borderRadius: '14px',
            border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.04)',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <CheckCircle2 size={18} color="#22c55e" />
            <div>
              <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.9rem' }}>No contradictions found</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                All retrieved claims are consistent across sources
              </div>
            </div>
          </div>
        ) : (
          <ContradictionAlert
            contradictions={contradictions.filter(c => c.status === 'unresolved')}
            tenantId={tenantId}
            onResolved={() => loadData(tenantId)}
          />
        )}
      </div>

      {/* Distribution Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <DistCard
          title="Language Distribution"
          items={Object.entries(langDist).map(([k, v]) => ({
            label: k.toUpperCase(), value: v,
            color: k === 'en' ? '#60a5fa' : k === 'hi-latn' ? '#c084fc' : '#fb923c'
          }))}
        />
        <DistCard
          title="Confidence Distribution"
          items={Object.entries(confDist).map(([k, v]) => ({
            label: k, value: v,
            color: k === '>0.9' ? '#22c55e' : k === '0.7-0.9' ? '#f59e0b' : '#ef4444'
          }))}
        />
        <DistCard
          title="Source Breakdown"
          items={Object.entries(sourceDist).map(([k, v]) => ({
            label: k, value: v,
            color: k === 'Slack' ? '#60a5fa' : k === 'GitHub' ? '#6b7280' : k === 'Jira' ? '#818cf8' : '#fb923c'
          }))}
        />
      </div>
    </div>
  );
}

function DistCard({ title, items }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <div style={{
      padding: '1.25rem',
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.02)'
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(item => (
          <div key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{item.label}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{item.value}%</span>
            </div>
            <div style={{ height: 4, borderRadius: '999px', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{
                height: '100%', borderRadius: '999px',
                background: item.color,
                width: `${(item.value / total) * 100}%`,
                transition: 'width 0.6s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

/**
 * ContradictionAlert — Surfaces conflicting claims before/during answer
 * Never silently merges contradictions — always shows user both claims
 */
export default function ContradictionAlert({ contradictions = [], tenantId, onResolved }) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <div style={{
      margin: '0.75rem 0',
      borderRadius: '12px',
      border: '1px solid rgba(251,146,60,0.3)',
      background: 'rgba(251,146,60,0.05)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '0.6rem 0.75rem',
        background: 'rgba(251,146,60,0.1)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        borderBottom: '1px solid rgba(251,146,60,0.2)'
      }}>
        <AlertTriangle size={14} color="#fb923c" />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb923c' }}>
          {contradictions.length} Conflicting Claim{contradictions.length > 1 ? 's' : ''} Found
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          These were NOT merged — review required
        </span>
      </div>

      <div style={{ padding: '0.5rem' }}>
        {contradictions.map((c, idx) => (
          <ConflictCard
            key={c.id || idx}
            conflict={c}
            tenantId={tenantId}
            onResolved={onResolved}
          />
        ))}
      </div>
    </div>
  );
}

function ConflictCard({ conflict, tenantId, onResolved }) {
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);

  const { entity, claim_a, claim_b, id } = conflict;

  const handleResolve = async (resolution) => {
    setResolving(true);
    try {
      const { getApiUrl } = await import('@/lib/api');
      const res = await fetch(`${getApiUrl()}/api/v1/contradictions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution, resolved_by: 'user' })
      });
      if (res.ok) {
        setResolved(true);
        onResolved?.();
      }
    } catch (e) {
      console.error('Failed to resolve', e);
    } finally {
      setResolving(false);
    }
  };

  if (resolved) {
    return (
      <div style={{
        padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center',
        gap: '0.5rem', fontSize: '0.75rem', color: '#22c55e'
      }}>
        <CheckCircle2 size={14} /> Resolved
      </div>
    );
  }

  return (
    <div style={{
      padding: '0.5rem 0.75rem',
      borderRadius: '8px',
      marginBottom: '0.4rem',
      background: 'rgba(255,255,255,0.02)'
    }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
        ⚡ Conflict about: <span style={{ color: '#fb923c' }}>{entity}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
        {/* Claim A */}
        <div style={{
          padding: '0.4rem 0.6rem', borderRadius: '8px',
          background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700, marginBottom: '0.2rem' }}>
            Claim A · conf {claim_a?.confidence?.toFixed(2) || '?'}
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {claim_a?.content_snippet || claim_a?.value || '—'}
          </div>
          {claim_a?.raw_ref_url && (
            <a href={claim_a.raw_ref_url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.65rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
              Source <ExternalLink size={9} />
            </a>
          )}
        </div>

        {/* Claim B */}
        <div style={{
          padding: '0.4rem 0.6rem', borderRadius: '8px',
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.2rem' }}>
            Claim B · conf {claim_b?.confidence?.toFixed(2) || '?'}
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {claim_b?.content_snippet || claim_b?.value || '—'}
          </div>
          {claim_b?.raw_ref_url && (
            <a href={claim_b.raw_ref_url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.65rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
              Source <ExternalLink size={9} />
            </a>
          )}
        </div>
      </div>

      {/* Resolve buttons */}
      {id && (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => handleResolve('resolved_by_recency')}
            disabled={resolving}
            style={{
              padding: '3px 10px', borderRadius: '6px', fontSize: '0.68rem',
              cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)'
            }}
          >
            Resolve (most recent wins)
          </button>
          <button
            onClick={() => handleResolve('resolved_by_user')}
            disabled={resolving}
            style={{
              padding: '3px 10px', borderRadius: '6px', fontSize: '0.68rem',
              cursor: 'pointer', border: '1px solid rgba(251,146,60,0.3)',
              background: 'rgba(251,146,60,0.1)', color: '#fb923c'
            }}
          >
            Mark as resolved
          </button>
        </div>
      )}
    </div>
  );
}

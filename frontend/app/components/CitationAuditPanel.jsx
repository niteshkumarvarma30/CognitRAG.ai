'use client';
import { ExternalLink, Info } from 'lucide-react';
import LanguageTagBadge from './LanguageTagBadge';

/**
 * CitationAuditPanel — Renders claim-level source citations
 * Shows per-citation: confidence tier, language tag, source deep-link
 */
export default function CitationAuditPanel({ citations = [], compact = false }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem',
        display: 'flex', alignItems: 'center', gap: '0.4rem'
      }}>
        <Info size={12} /> Sources
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {citations.slice(0, compact ? 3 : 8).map((cite, idx) => (
          <CitationCard key={cite.chunk_id || idx} cite={cite} />
        ))}
      </div>

      {citations.length > (compact ? 3 : 8) && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          +{citations.length - (compact ? 3 : 8)} more sources
        </div>
      )}
    </div>
  );
}

function CitationCard({ cite }) {
  const {
    chunk_id, content_snippet, confidence = 0,
    derivation = 'extracted', source_type = 'unknown',
    language_tag = 'en', raw_ref_url, author
  } = cite;

  const isStructured = derivation === 'structured';
  const conf = parseFloat(confidence) || 0;

  // Confidence tier styling
  const tierColor = isStructured
    ? '#22c55e'
    : conf >= 0.8 ? '#f59e0b'
    : '#ef4444';

  const tierLabel = isStructured
    ? 'STRUCTURED 1.0'
    : `EXTRACTED ${conf.toFixed(2)}`;

  const sourceIcons = {
    slack: '💬', github: '🐙', jira: '📋',
    notion: '📓', drive: '📁',
    meeting_zoom: '📹', meeting_meet: '📹', meeting_teams: '📹',
    pdf: '📄', manual: '📝', unknown: '📄'
  };

  return (
    <div style={{
      padding: '0.6rem 0.75rem',
      borderRadius: '10px',
      border: `1px solid rgba(255,255,255,0.07)`,
      background: 'rgba(255,255,255,0.03)',
      display: 'flex', flexDirection: 'column', gap: '0.3rem'
    }}>
      {/* Top row: tier badge + language tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Confidence tier */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
          padding: '2px 8px', borderRadius: '999px',
          background: `${tierColor}18`,
          border: `1px solid ${tierColor}40`,
          color: tierColor,
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em',
          fontFamily: 'monospace'
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: tierColor, display: 'inline-block'
          }} />
          {tierLabel}
        </span>

        {/* Source type */}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {sourceIcons[source_type]} {source_type?.toUpperCase()}
        </span>

        {/* Language tag */}
        <LanguageTagBadge tag={language_tag} size="xs" />

        {/* Deep link */}
        {raw_ref_url && (
          <a
            href={raw_ref_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.68rem', color: 'var(--accent)',
              textDecoration: 'none', fontWeight: 500
            }}
          >
            View <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* Content snippet */}
      {content_snippet && (
        <div style={{
          fontSize: '0.75rem', color: 'var(--text-secondary)',
          fontStyle: 'italic', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          "{content_snippet}"
        </div>
      )}

      {/* Author */}
      {author && (
        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>
          — {author}
        </div>
      )}
    </div>
  );
}

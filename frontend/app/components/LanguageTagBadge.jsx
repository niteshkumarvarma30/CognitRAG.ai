'use client';

/**
 * LanguageTagBadge — Shows EN / HI-LATN / MIXED pill
 * Used in citation cards, document library, graph explorer
 */
export default function LanguageTagBadge({ tag, size = 'sm' }) {
  const config = {
    'en':      { label: 'EN',      bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    'hi-latn': { label: 'HI',      bg: 'rgba(168,85,247,0.15)', color: '#c084fc', border: 'rgba(168,85,247,0.3)' },
    'mixed':   { label: 'MIX',     bg: 'rgba(249,115,22,0.15)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  };

  const c = config[tag] || config['en'];
  const fontSize = size === 'xs' ? '0.6rem' : '0.65rem';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px',
      borderRadius: '999px',
      fontSize,
      fontWeight: 700,
      letterSpacing: '0.06em',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      fontFamily: 'monospace'
    }}>
      {c.label}
    </span>
  );
}

'use client';
import { Drawer, Badge } from '@/components/ui';
import { ExternalLink, Database, GitBranch, MessageSquare, FileText, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import LanguageTagBadge from './LanguageTagBadge';

export default function SourceReceipt({ isOpen, onClose, source }) {
  if (!source) return null;

  const iconMap = {
    'slack': <MessageSquare size={16} />,
    'github': <GitBranch size={16} />,
    'jira': <FileText size={16} />,
    'notion': <FileText size={16} />,
    'document': <Database size={16} />
  };

  const colorMap = {
    'slack': 'var(--violet, #8b5cf6)',
    'github': 'var(--success, #10b981)',
    'jira': 'var(--info, #3b82f6)',
    'notion': '#f59e0b',
    'document': 'var(--text-secondary, #94a3b8)'
  };

  const type = source.source_type || source.type || 'document';
  const typeIcon = iconMap[type] || <Database size={16} />;
  const typeColor = colorMap[type] || 'var(--text-secondary, #94a3b8)';
  const derivation = source.derivation || (source.confidence === 1.0 ? 'structured' : 'extracted');
  const isStructured = derivation === 'structured';
  const rawUrl = source.raw_ref_url || source.url;

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Source Citation Receipt" 
      subtitle={`Verified Evidence: ${source.block_id || source.ref || source.id || source.chunk_id || 'Block'}`}
      position="right"
      width="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
        
        {/* Source Header Info */}
        <div style={{ 
          background: 'var(--surface-soft, rgba(255,255,255,0.03))', 
          padding: 'var(--space-5, 20px)', 
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                background: `${typeColor}20`, 
                color: typeColor, 
                width: 32, height: 32, 
                borderRadius: 'var(--radius-md, 8px)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {typeIcon}
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary, #fff)', textTransform: 'capitalize' }}>
                  {source.label || type}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #94a3b8)' }}>
                  {source.author ? `By ${source.author} · ` : ''}{source.timestamp || 'Indexed'}
                </div>
              </div>
            </div>
            {rawUrl && (
              <a href={rawUrl} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8',
                textDecoration: 'none', padding: '4px 10px', 
                background: 'rgba(56, 189, 248, 0.12)', borderRadius: '9999px',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                View in {type} <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Derivation Tier & Language */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
              background: isStructured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isStructured ? '#34d399' : '#fbbf24',
              border: `1px solid ${isStructured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              {isStructured ? <ShieldCheck size={12} /> : <Cpu size={12} />}
              {isStructured ? 'STRUCTURED 1.0 (Native API)' : `EXTRACTED ${(source.confidence || 0.8).toFixed(2)} (LLM)`}
            </span>

            {source.language_tag && (
              <LanguageTagBadge tag={source.language_tag} size="sm" />
            )}
          </div>
        </div>

        {/* Claim / Content */}
        <div>
          <div style={{ 
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', 
            textTransform: 'uppercase', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px' 
          }}>
            {source.claim_text ? 'Audited Claim & Content' : 'Retrieved Content Block'}
          </div>
          <div style={{
            background: 'var(--surface, rgba(0,0,0,0.3))', border: '1px solid var(--border, rgba(255,255,255,0.08))',
            padding: '16px', borderRadius: 'var(--radius-lg, 12px)',
            fontSize: '0.875rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.6,
            whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono, monospace)'
          }}>
            {source.claim_text ? (
              <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, color: '#f8fafc' }}>
                "{source.claim_text}"
              </div>
            ) : null}
            {source.content || source.snippet || 'No raw snippet available.'}
          </div>
        </div>

        {/* Audit Details */}
        <div>
          <div style={{ 
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', 
            textTransform: 'uppercase', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px' 
          }}>
            Citation Audit Attributes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Source Type</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#fff', textTransform: 'capitalize' }}>{type}</div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Derivation</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#fff', textTransform: 'capitalize' }}>{derivation}</div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Confidence Tier</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#fff' }}>
                {((source.confidence || 1.0) * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Language Tag</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#fff' }}>{source.language_tag || 'en'}</div>
            </div>
          </div>
        </div>

      </div>
    </Drawer>
  );
}

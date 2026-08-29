'use client';
import { Drawer, Badge, Tabs } from '@/components/ui';
import { ExternalLink, Database, GitBranch, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';

export default function SourceReceipt({ isOpen, onClose, source }) {
  if (!source) return null;

  const iconMap = {
    'slack': <MessageSquare size={16} />,
    'github': <GitBranch size={16} />,
    'jira': <FileText size={16} />,
    'document': <Database size={16} />
  };

  const colorMap = {
    'slack': 'var(--violet)',
    'github': 'var(--success)',
    'jira': 'var(--info)',
    'document': 'var(--text-secondary)'
  };

  const typeIcon = iconMap[source.type] || <Database size={16} />;
  const typeColor = colorMap[source.type] || 'var(--text-secondary)';

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Source Receipt" 
      subtitle={`Verified Evidence: ${source.ref || source.id}`}
      position="right"
      width="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        
        {/* Source Header Info */}
        <div style={{ 
          background: 'var(--surface-soft)', 
          padding: 'var(--space-5)', 
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ 
                background: `${typeColor}20`, 
                color: typeColor, 
                width: 32, height: 32, 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {typeIcon}
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{source.label || source.type}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{source.timestamp || 'Just now'}</div>
              </div>
            </div>
            {source.url && (
              <a href={source.url} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)',
                textDecoration: 'none', padding: '4px 8px', 
                background: 'var(--primary-light)', borderRadius: 'var(--radius-pill)'
              }}>
                View Original <ExternalLink size={12} />
              </a>
            )}
          </div>
          
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            {source.title || 'Source Context'}
          </h3>
        </div>

        {/* Content Snippet */}
        <div>
          <div style={{ 
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', 
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' 
          }}>
            Retrieved Content
          </div>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)',
            fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6,
            whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)'
          }}>
            {source.content || source.snippet || 'No raw snippet available.'}
          </div>
        </div>

        {/* Why this was retrieved */}
        <div>
          <div style={{ 
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', 
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' 
          }}>
            Retrieval Reasoning
          </div>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
            padding: 'var(--space-4)', background: 'var(--success-light)', 
            border: '1px solid rgba(22,163,74,0.2)', borderRadius: 'var(--radius-lg)'
          }}>
            <CheckCircle2 size={18} style={{ color: 'var(--success)', marginTop: 2 }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>
                {source.relevance_score ? `High Relevance Match (${(source.relevance_score * 100).toFixed(1)}%)` : 'Semantic Match'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {source.reason || 'This source was retrieved because its semantic embedding matched the user query intent.'}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div>
          <div style={{ 
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', 
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' 
          }}>
            Metadata
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {(source.metadata ? Object.entries(source.metadata) : []).map(([key, val]) => (
              <div key={key} style={{ 
                padding: 'var(--space-3)', background: 'var(--bg)', 
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' 
              }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{key}</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Drawer>
  );
}

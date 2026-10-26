'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { FileText, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { getApiUrl } from '@/lib/api';
import LanguageTagBadge from '@/components/LanguageTagBadge';

export default function KnowledgeGovernancePage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const getApiBase = () => getApiUrl();

  // Fetch real uploaded documents from the backend
  const fetchDocuments = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const baseUrl = getApiBase();
    try {
      const primaryId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('cognitrag_tenant_id') : '') || '';
      if (!primaryId) {
        setDocuments([]);
        return;
      }
      const res = await fetch(`${baseUrl}/api/v1/documents/${primaryId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!doc?.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${doc.filename}"?\n\nThis will remove the file, all vector chunks from Supabase, in-memory specs, and associated Knowledge Graph nodes from Neo4j.`
    );
    if (!confirmed) return;

    setDeletingId(doc.id);
    const baseUrl = getApiBase();
    try {
      const primaryId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('cognitrag_tenant_id') : '') || '';
      if (!primaryId) return;
      const res = await fetch(`${baseUrl}/api/v1/documents/${primaryId}/${doc.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to delete document: ${errData.detail || 'Server error'}`);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert(`Network error while deleting document: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments(true);
    }
  }, [activeTab, user?.id, isLoaded]);

  // Auto-poll in background while any document is in ingestion process
  useEffect(() => {
    const hasIngesting = documents.some(d => d.status === 'pending' || d.status === 'processing');
    if (!hasIngesting) return;

    const pollTimer = setInterval(() => {
      fetchDocuments(false);
    }, 2500);

    return () => clearInterval(pollTimer);
  }, [documents]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Knowledge Library</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Review your ingested documents and verified memories.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary" onClick={fetchDocuments}>
            Manual Sync
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('documents')}
          style={{ 
            padding: 'var(--space-3) 0', background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'documents' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'documents' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'documents' ? 600 : 500, fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
          }}
        >
          Ingested Documents
          <Badge variant="primary" style={{ fontSize: '0.65rem' }}>{documents.length}</Badge>
        </button>
        <button 
          onClick={() => setActiveTab('contradictions')}
          style={{ 
            padding: 'var(--space-3) 0', background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'contradictions' ? '2px solid var(--error)' : '2px solid transparent',
            color: activeTab === 'contradictions' ? 'var(--error)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'contradictions' ? 600 : 500, fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
          }}
        >
          Contradictions
          <Badge variant="error" style={{ fontSize: '0.65rem' }}>0</Badge>
        </button>
      </div>

      {/* Content Area */}
      <div style={{ paddingTop: 'var(--space-2)' }}>
        
        {/* Active Ingestion Pipeline Banner */}
        {documents.some(d => d.status === 'pending' || d.status === 'processing') && (
          <div style={{
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#38bdf8',
            fontSize: '0.875rem'
          }}>
            <Loader2 size={16} className="animate-spin" />
            <span><strong>Ingestion in Progress:</strong> Documents are actively being processed, chunked, and linked in Supabase & Neo4j. Auto-refreshing...</span>
          </div>
        )}

        {activeTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)' }}>Loading documents...</div>
            ) : documents.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                No documents uploaded yet. Go to Connectors to upload a file!
              </div>
            ) : (
              documents.map(doc => (
                <Card key={doc.id} style={{ padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                      {doc.status === 'completed' ? (
                        <Badge variant="success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={12} /> COMPLETED
                        </Badge>
                      ) : doc.status === 'failed' ? (
                        <Badge variant="error" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> FAILED
                        </Badge>
                      ) : (
                        <Badge variant="warning" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          background: 'rgba(234, 88, 12, 0.15)',
                          color: '#ea580c',
                          border: '1px solid rgba(234, 88, 12, 0.35)',
                          fontWeight: 600
                        }}>
                          <Loader2 size={12} className="animate-spin" /> INGESTING...
                        </Badge>
                      )}
                      {doc.source_type && (
                        <span style={{
                          fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                          textTransform: 'uppercase', fontWeight: 600
                        }}>
                          {doc.source_type}
                        </span>
                      )}
                      {doc.language_tag && (
                        <LanguageTagBadge tag={doc.language_tag} size="sm" />
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uploaded on {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {doc.filename}
                    </p>
                    {doc.raw_ref_url && (
                      <a href={doc.raw_ref_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}>
                        Source Link →
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'var(--space-6)' }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteDocument(doc)}
                      disabled={deletingId === doc.id}
                      style={{ 
                        color: 'var(--error)', 
                        borderColor: 'var(--error)',
                        cursor: deletingId === doc.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {deletingId === doc.id ? <Loader2 size={15} className="animate-spin" /> : <X size={16} />}
                      {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'contradictions' && (
          <div style={{ padding: 'var(--space-4)', background: 'var(--error-light)', borderRadius: 'var(--radius-md)', color: 'var(--error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={18} /> The graph has not detected any conflicts yet.
          </div>
        )}

      </div>
    </div>
  );
}

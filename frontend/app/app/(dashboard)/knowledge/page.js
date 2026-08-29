'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { FileText, X, AlertTriangle } from 'lucide-react';

export default function KnowledgeGovernancePage() {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real uploaded documents from the backend
  useEffect(() => {
    if (activeTab === 'documents') {
      fetch(${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/documents/ws_1)
        .then(res => res.json())
        .then(data => {
          setDocuments(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeTab]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Knowledge Library</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Review your ingested documents and verified memories.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary">Manual Sync</Button>
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
                      <Badge variant={doc.status === 'completed' ? 'success' : doc.status === 'failed' ? 'error' : 'warning'} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={12} /> {doc.status.toUpperCase()}
                      </Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uploaded on {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {doc.filename}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'var(--space-6)' }}>
                    <Button variant="outline" size="sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                      <X size={16} /> Delete
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

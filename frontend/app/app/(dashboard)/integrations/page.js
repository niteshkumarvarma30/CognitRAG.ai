'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { MessageSquare, GitBranch, FileText, Database, ShieldAlert, Loader2, Link as LinkIcon, RefreshCw, HardDrive } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const [statusMsg, setStatusMsg] = useState(searchParams?.get('status') || null);
  const [loadingId, setLoadingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (statusMsg) {
      setTimeout(() => setStatusMsg(null), 5000);
    }
  }, [statusMsg]);

  // Hardcoded for P1.1 Demo UI
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState('');
  
  const connectors = [
    {
      id: 'file-upload',
      name: 'Local File Upload',
      type: 'Direct Ingestion',
      description: 'Upload PDF, TXT, or Markdown files directly into the True Hybrid Search pipeline.',
      icon: FileText,
      color: 'var(--success)',
      status: 'disconnected',
      isEnterprise: false
    },
    {
      id: 'slack',
      name: 'Slack',
      type: 'Communication',
      description: 'Index channel decisions, threads, and company announcements.',
      icon: MessageSquare,
      color: 'var(--violet)',
      status: 'disconnected',
      isEnterprise: true
    },
    {
      id: 'github',
      name: 'GitHub',
      type: 'Code & Architecture',
      description: 'Sync pull requests, architectural decision records (ADRs), and markdown docs.',
      icon: GitBranch,
      color: 'var(--text-primary)',
      status: 'disconnected',
      isEnterprise: true
    },
    {
      id: 'jira',
      name: 'Jira',
      type: 'Project Management',
      description: 'Index epics, tickets, and product requirements.',
      icon: FileText,
      color: 'var(--info)',
      status: 'disconnected',
      isEnterprise: true
    },
    {
      id: 'notion',
      name: 'Notion',
      type: 'Wiki & SOPs',
      description: 'Sync company wikis, standard operating procedures, and product specs.',
      icon: Database,
      color: 'var(--text-primary)',
      status: 'disconnected',
      isEnterprise: true
    }
  ];

  const handleConnect = (connector) => {
    if (connector.isEnterprise) {
      setSelectedEnterprise(connector.name);
      setEnterpriseModalOpen(true);
      return;
    }
    
    // For File Upload, click the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingId('file-upload');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Hardcode tenant_id for the MVP
      formData.append('tenant_id', 'ws_1');

      const res = await fetch(${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/ingest, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatusMsg('success');
      } else {
        const err = await res.json();
        console.error("Upload error:", err);
        setStatusMsg('error');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('error');
    } finally {
      setLoadingId(null);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1000px' }}>
      
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Connectors</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Connect external tools to build your semantic knowledge graph.</p>
      </div>

      {statusMsg === 'success' && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
          Integration connected successfully! We are now syncing your data.
        </div>
      )}

      {statusMsg === 'error' && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--error-light)', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          Failed to connect integration. Please try again.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.txt,.md" 
          onChange={handleFileUpload} 
        />
        
        {connectors.map(connector => (
          <Card key={connector.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: 'var(--space-5)', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 'var(--radius-md)', 
                  background: `${connector.color}15`, color: connector.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <connector.icon size={24} />
                </div>
                {connector.status === 'connected' ? (
                  <Badge variant="success">Connected</Badge>
                ) : (
                  <Badge variant="secondary">Not Connected</Badge>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {connector.name}
                </h3>
                {connector.isEnterprise ? (
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)', textTransform: 'uppercase' }}>Premium</span>
                ) : (
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'var(--success-light)', color: 'var(--success)', textTransform: 'uppercase' }}>Free</span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
                {connector.type}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {connector.description}
              </p>
            </div>

            <div style={{ 
              padding: 'var(--space-4)', borderTop: '1px solid var(--border)', background: 'var(--surface-soft)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)'
            }}>
              {connector.status === 'connected' ? (
                <>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={12} /> Sync: {connector.lastSync}
                  </div>
                  <Button variant="outline" size="sm" style={{ padding: '4px 12px', height: 'auto', fontSize: '0.75rem' }}>Configure</Button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OAuth 2.0</div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleConnect(connector)}
                    disabled={loadingId === connector.id}
                    style={{ padding: '4px 12px', height: 'auto', fontSize: '0.75rem' }}
                  >
                    {loadingId === connector.id ? <Loader2 size={14} className="animate-spin" /> : 'Connect'}
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Enterprise Upgrade Modal */}
      {enterpriseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="animate-scale-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: '400px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '12px', borderRadius: '50%' }}>
                <ShieldAlert size={28} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 'var(--space-2)' }}>
              Enterprise Integration
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
              The <strong>{selectedEnterprise}</strong> connector requires an Enterprise license to securely sync large volumes of organization data.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="outline" style={{ flex: 1 }} onClick={() => setEnterpriseModalOpen(false)}>Cancel</Button>
              <Button variant="primary" style={{ flex: 1 }} onClick={() => setEnterpriseModalOpen(false)}>Contact Sales</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { MessageSquare, GitBranch, FileText, Database, ShieldAlert, Loader2, Link as LinkIcon, RefreshCw, HardDrive, Cloud } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const [statusMsg, setStatusMsg] = useState(searchParams?.get('status') || null);
  const [loadingId, setLoadingId] = useState(null);
  const fileInputRef = useRef(null);
  const [gdriveModalOpen, setGdriveModalOpen] = useState(false);
  const [gdriveFiles, setGdriveFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [syncingGithub, setSyncingGithub] = useState(false);

  const fetchGithubRepos = async () => {
    setGithubModalOpen(true);
    setLoadingRepos(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/integrations/github/repos?tenant_id=ws_1`);
      if (res.ok) {
        const data = await res.json();
        setGithubRepos(data.repos || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingRepos(false);
  };

  const handleSyncGithub = async () => {
    setSyncingGithub(true);
    // In a real app, send selectedRepos to backend. For now, simulate syncing.
    setTimeout(() => {
      setSyncingGithub(false);
      setGithubModalOpen(false);
      setStatusMsg('success');
    }, 1500);
  };

  const fetchGdriveFiles = async () => {
    setGdriveModalOpen(true);
    setLoadingFiles(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}/api/v1/integrations/google-drive/files?tenant_id=ws_1`);
      if (res.ok) {
        const data = await res.json();
        setGdriveFiles(data.files || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingFiles(false);
  };

  const handleSyncSelected = async () => {
    setSyncing(true);
    // In a real app, send selectedFiles to backend. For now, simulate syncing.
    setTimeout(() => {
      setSyncing(false);
      setGdriveModalOpen(false);
      setStatusMsg('success');
    }, 1500);
  };


  useEffect(() => {
    if (statusMsg) {
      setTimeout(() => setStatusMsg(null), 5000);
    }
  }, [statusMsg]);

  // Hardcoded for P1.1 Demo UI
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState('');
  
  const freeConnectors = [
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
      id: 'google-drive',
      name: 'Google Drive',
      type: 'Cloud Storage',
      description: 'Sync Google Docs, Sheets, and PDFs directly from your corporate Google Workspace.',
      icon: Cloud,
      color: 'var(--info)',
      status: 'connected',
      isEnterprise: false
    }
  ];

  const premiumConnectors = [
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
    // TEMPORARILY DISABLED FOR TESTING OAUTH
    // if (connector.isEnterprise) {
    //   setSelectedEnterprise(connector.name);
    //   setEnterpriseModalOpen(true);
    //   return;
    // }
    
    if (connector.id === 'file-upload') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    // Redirect to the FastAPI auth endpoints
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.location.href = `${baseUrl}/api/v1/integrations/${connector.id}/auth?tenant_id=ws_1`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingId('file-upload');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenant_id', 'ws_1');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/ingest`, {
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const renderConnectorCard = (connector) => (
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
                                        <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (connector.id === 'google-drive') fetchGdriveFiles();
                  else if (connector.id === 'github') fetchGithubRepos();
                }}
                style={{ padding: '4px 12px', height: 'auto', fontSize: '0.75rem' }}
              >
                {connector.id === 'google-drive' ? 'Select Files' : connector.id === 'github' ? 'Select Repos' : 'Configure'}
              </Button>
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
  );

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

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".pdf,.txt,.md" 
        onChange={handleFileUpload} 
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        
        {/* Free Connectors Section */}
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            Free Connectors
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
            {freeConnectors.map(renderConnectorCard)}
          </div>
        </div>

        {/* Premium Connectors Section */}
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Premium Connectors
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)', textTransform: 'uppercase' }}>PRO</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
            {premiumConnectors.map(renderConnectorCard)}
          </div>
        </div>

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
              Premium Integration
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
              The <strong>{selectedEnterprise}</strong> connector requires a Premium license to securely sync organization data.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="outline" style={{ flex: 1 }} onClick={() => setEnterpriseModalOpen(false)}>Cancel</Button>
              <Button variant="primary" style={{ flex: 1 }} onClick={() => setEnterpriseModalOpen(false)}>Upgrade Plan</Button>
            </div>
          </div>
        </div>
      )}


      
      {/* GitHub Repo Picker Modal */}
      {githubModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px',
            width: '90%', maxWidth: '600px', border: '1px solid var(--border)',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitBranch size={24} color="var(--text)" /> Select GitHub Repositories
            </h2>
            
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              {loadingRepos ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
                  <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Fetching your repositories...</span>
                </div>
              ) : githubRepos.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No repositories found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {githubRepos.map(repo => (
                    <label key={repo.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedRepos.includes(repo.full_name)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRepos([...selectedRepos, repo.full_name]);
                          else setSelectedRepos(selectedRepos.filter(name => name !== repo.full_name));
                        }}
                      />
                      <GitBranch size={18} color="var(--text-muted)" />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>{repo.name}</span>
                        {repo.private && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Private</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="ghost" onClick={() => setGithubModalOpen(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                disabled={selectedRepos.length === 0 || syncingGithub}
                onClick={handleSyncGithub}
              >
                {syncingGithub ? <Loader2 className="animate-spin" size={16} /> : `Sync ${selectedRepos.length} Repos`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive File Picker Modal */}
      {gdriveModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px',
            width: '90%', maxWidth: '600px', border: '1px solid var(--border)',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cloud size={24} color="var(--info)" /> Select Google Drive Files
            </h2>
            
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              {loadingFiles ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
                  <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Fetching your Google Docs...</span>
                </div>
              ) : gdriveFiles.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No files found matching the criteria.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {gdriveFiles.map(file => (
                    <label key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedFiles([...selectedFiles, file.id]);
                          else setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                        }}
                      />
                      <FileText size={18} color="var(--text-muted)" />
                      <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button variant="ghost" onClick={() => setGdriveModalOpen(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                disabled={selectedFiles.length === 0 || syncing}
                onClick={handleSyncSelected}
              >
                {syncing ? <Loader2 className="animate-spin" size={16} /> : `Sync ${selectedFiles.length} Files`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

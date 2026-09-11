'use client';
import { getApiUrl } from '@/lib/api';
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { MessageSquare, GitBranch, FileText, Database, ShieldAlert, Loader2, Link as LinkIcon, RefreshCw, HardDrive, Cloud, X, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function IntegrationsPage() {
  const { user } = useUser();
  const tenantId = user?.id || 'ws_1';

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

  const [notionModalOpen, setNotionModalOpen] = useState(false);
  const [notionPages, setNotionPages] = useState([]);
  const [loadingNotion, setLoadingNotion] = useState(false);
  const [selectedNotion, setSelectedNotion] = useState([]);
  const [syncingNotion, setSyncingNotion] = useState(false);

  const fetchNotionPages = async () => {
    setNotionModalOpen(true);
    setLoadingNotion(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/integrations/notion/pages?tenant_id=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setNotionPages(data.pages || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingNotion(false);
  };

  const fetchGdriveFiles = async () => {
    setGdriveModalOpen(true);
    setLoadingFiles(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/integrations/google-drive/files?tenant_id=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setGdriveFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingFiles(false);
  };

  const fetchGithubRepos = async () => {
    setGithubModalOpen(true);
    setLoadingRepos(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/integrations/github/repos?tenant_id=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setGithubRepos(data.repos || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingRepos(false);
  };

  const [activeConnections, setActiveConnections] = useState([]);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const url = getApiUrl();
        const res = await fetch(`${url}/api/v1/integrations/active?tenant_id=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveConnections(data.active_integrations || []);
        }
      } catch (e) {
        console.error("Error fetching active integrations:", e);
      }
    };
    fetchActive();
  }, [tenantId]);

  const [jobProgress, setJobProgress] = useState({}); // { [connectorId]: { status, progress } }

  const pollJobStatus = async (jobId, connectorId, setSyncingState, setModalState) => {
    const url = getApiUrl();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${url}/api/v1/ingest/status/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJobProgress(prev => ({ ...prev, [connectorId]: data }));
          if (data.status === 'completed') {
            clearInterval(interval);
            if (setSyncingState) setSyncingState(false);
            if (setModalState) setModalState(false);
            setActiveConnections(prev => [...new Set([...prev, connectorId])]);
            setStatusMsg('success');
          } else if (data.status === 'failed') {
            clearInterval(interval);
            if (setSyncingState) setSyncingState(false);
            alert(`Ingestion failed: ${data.error || 'Unknown error'}`);
          }
        }
      } catch (err) {
        console.error("Error polling job status:", err);
      }
    }, 1000);
  };

  const handleSyncGithub = async () => {
    if (selectedRepos.length === 0) return;
    setSyncingGithub(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/ingest/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, repo_names: selectedRepos })
      });
      if (res.ok) {
        const data = await res.json();
        pollJobStatus(data.job_id, 'github', setSyncingGithub, setGithubModalOpen);
      } else {
        setSyncingGithub(false);
        alert("Failed to queue GitHub sync job.");
      }
    } catch (e) {
      console.error(e);
      setSyncingGithub(false);
    }
  };

  const handleSyncNotion = async () => {
    if (selectedNotion.length === 0) return;
    setSyncingNotion(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/ingest/notion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, page_ids: selectedNotion })
      });
      if (res.ok) {
        const data = await res.json();
        pollJobStatus(data.job_id, 'notion', setSyncingNotion, setNotionModalOpen);
      } else {
        setSyncingNotion(false);
        alert("Failed to queue Notion sync job.");
      }
    } catch (e) {
      console.error(e);
      setSyncingNotion(false);
    }
  };

  const handleSyncSelected = async () => {
    if (selectedFiles.length === 0) return;
    setSyncing(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/ingest/gdrive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, file_ids: selectedFiles })
      });
      if (res.ok) {
        const data = await res.json();
        pollJobStatus(data.job_id, 'google-drive', setSyncing, setGdriveModalOpen);
      } else {
        setSyncing(false);
        alert("Failed to queue Google Drive sync job.");
      }
    } catch (e) {
      console.error(e);
      setSyncing(false);
    }
  };

  const [slackModalOpen, setSlackModalOpen] = useState(false);
  const [slackChannels, setSlackChannels] = useState([]);
  const [loadingSlack, setLoadingSlack] = useState(false);
  const [selectedSlack, setSelectedSlack] = useState([]);
  const [syncingSlack, setSyncingSlack] = useState(false);

  const [jiraModalOpen, setJiraModalOpen] = useState(false);
  const [jiraProjects, setJiraProjects] = useState([]);
  const [loadingJira, setLoadingJira] = useState(false);
  const [selectedJira, setSelectedJira] = useState([]);
  const [syncingJira, setSyncingJira] = useState(false);

  const fetchSlackChannels = async () => {
    setSlackModalOpen(true);
    setLoadingSlack(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/integrations/slack/channels?tenant_id=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setSlackChannels(data.channels || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingSlack(false);
  };

  const fetchJiraProjects = async () => {
    setJiraModalOpen(true);
    setLoadingJira(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/integrations/jira/projects?tenant_id=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setJiraProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingJira(false);
  };

  const handleSyncSlack = async () => {
    if (selectedSlack.length === 0) return;
    setSyncingSlack(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/ingest/slack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, channel_ids: selectedSlack })
      });
      if (res.ok) {
        const data = await res.json();
        pollJobStatus(data.job_id, 'slack', setSyncingSlack, setSlackModalOpen);
      } else {
        setSyncingSlack(false);
        alert("Failed to queue Slack sync job.");
      }
    } catch (e) {
      console.error(e);
      setSyncingSlack(false);
    }
  };

  const handleSyncJira = async () => {
    if (selectedJira.length === 0) return;
    setSyncingJira(true);
    try {
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/ingest/jira`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, project_keys: selectedJira })
      });
      if (res.ok) {
        const data = await res.json();
        pollJobStatus(data.job_id, 'jira', setSyncingJira, setJiraModalOpen);
      } else {
        setSyncingJira(false);
        alert("Failed to queue Jira sync job.");
      }
    } catch (e) {
      console.error(e);
      setSyncingJira(false);
    }
  };


  useEffect(() => {
    if (statusMsg) {
      setTimeout(() => setStatusMsg(null), 5000);
    }
  }, [statusMsg]);

  // Hardcoded for P1.1 Demo UI
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);
  const [demoRequested, setDemoRequested] = useState(false);
  
  const freeConnectors = [
    {
      id: 'file-upload',
      name: 'Local File Upload',
      type: 'Direct Ingestion',
      description: 'Upload PDF, TXT, or Markdown files directly into your isolated True Hybrid Search pipeline (up to 20MB).',
      icon: FileText,
      color: 'var(--success)',
      status: 'disconnected',
      isEnterprise: false
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      type: 'Personal Cloud Storage',
      description: 'Sync personal Google Docs, Sheets, and PDFs directly into your isolated knowledge base.',
      icon: Cloud,
      color: 'var(--info)',
      status: 'disconnected',
      isEnterprise: false
    },
    {
      id: 'github',
      name: 'GitHub (Personal)',
      type: 'Code & Architecture',
      description: 'Index docs, ADRs, READMEs, and merged PRs from up to 2 personal repositories (Free Tier).',
      icon: GitBranch,
      color: 'var(--text-primary)',
      status: 'disconnected',
      isEnterprise: false
    }
  ];

  const premiumConnectors = [
    {
      id: 'slack',
      name: 'Slack (Company)',
      type: 'Team Communication',
      description: 'Continuous real-time indexing of company channels, engineering decisions, and announcement threads.',
      icon: MessageSquare,
      color: 'var(--violet)',
      status: 'disconnected',
      isEnterprise: true
    },
    {
      id: 'jira',
      name: 'Jira (Company)',
      type: 'Project Management',
      description: 'Index sprint epics, tickets, and cross-system product requirements with automatic PR linking.',
      icon: FileText,
      color: 'var(--info)',
      status: 'disconnected',
      isEnterprise: true
    },
    {
      id: 'notion',
      name: 'Notion (Company)',
      type: 'Company Wiki & SOPs',
      description: 'Sync organizational standard operating procedures, architectural specs, and engineering wikis.',
      icon: Database,
      color: 'var(--text-primary)',
      status: 'disconnected',
      isEnterprise: true
    },
    {
      id: 'github-enterprise',
      name: 'GitHub Enterprise Org',
      type: 'Enterprise Codebase',
      description: 'Unlimited organization repositories, real-time webhook ingestion on merged PRs, and Living SOP proposals.',
      icon: GitBranch,
      color: 'var(--primary)',
      status: 'disconnected',
      isEnterprise: true
    }
  ];

  const handleDisconnect = async (connector) => {
    try {
      setLoadingId(connector.id);
      const url = getApiUrl();
      const res = await fetch(`${url}/api/v1/integrations/${connector.id}?tenant_id=${tenantId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActiveConnections(activeConnections.filter(id => id !== connector.id));
        setStatusMsg('');
      } else {
        console.error("Failed to disconnect");
        setStatusMsg('error');
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleConnect = (connector) => {
    if (connector.id === 'file-upload') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    if (connector.isEnterprise) {
      setSelectedEnterprise(connector);
      setDemoRequested(false);
      setEnterpriseModalOpen(true);
      return;
    }

    // Redirect to the FastAPI auth endpoints
    const baseUrl = getApiUrl();
    window.location.href = `${baseUrl}/api/v1/integrations/${connector.id}/auth?tenant_id=${tenantId}`;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingId('file-upload');
    setJobProgress(prev => ({
      ...prev,
      'file-upload': { status: 'processing', progress: `Reading & extracting ${file.name}...` }
    }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenant_id', tenantId);

      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/v1/ingest`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.job_id) {
          pollJobStatus(data.job_id, 'file-upload', () => setLoadingId(null), () => {});
        } else {
          setStatusMsg('success');
          setActiveConnections(prev => [...new Set([...prev, 'file-upload'])]);
          setLoadingId(null);
        }
      } else {
        const err = await res.json();
        console.error("Upload error:", err);
        setStatusMsg('error');
        setLoadingId(null);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('error');
      setLoadingId(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const renderConnectorCard = (connector) => {
    const isConnected = activeConnections.includes(connector.id);
    const connectorStatus = isConnected ? 'connected' : connector.status;
    const progress = jobProgress[connector.id];
    const isJobActive = progress && (progress.status === 'processing' || progress.status === 'pending');

    return (
    <Card key={connector.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ padding: 'var(--space-5)', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: 'var(--radius-md)', 
            background: `${connector.color}15`, color: connector.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <connector.icon size={24} />
          </div>
          {connectorStatus === 'connected' ? (
            <Badge variant="success">Connected</Badge>
          ) : isJobActive ? (
            <Badge variant="warning">Syncing...</Badge>
          ) : (
            <Badge variant="secondary">Not Connected</Badge>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {connector.name}
          </h3>
          {connector.isEnterprise ? (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)', textTransform: 'uppercase' }}>Company</span>
          ) : (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'var(--success-light)', color: 'var(--success)', textTransform: 'uppercase' }}>Free</span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
          {connector.type}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
          {connector.description}
        </p>

        {/* Live Ingestion Progress Bar */}
        {isJobActive && (
          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'var(--surface-soft)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 size={12} className="animate-spin" /> Live Ingestion
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Processing</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.3 }}>
              {progress.progress || 'Processing chunks & graph entities...'}
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: '80%',
                height: '100%',
                background: 'linear-gradient(90deg, #635bff, #06b6d4)',
                borderRadius: '2px',
                animation: 'pulse 1.5s infinite'
              }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        padding: 'var(--space-4)', borderTop: '1px solid var(--border)', background: 'var(--surface-soft)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)'
      }}>
        {connectorStatus === 'connected' ? (
          <>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={12} /> Sync: Active
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDisconnect(connector)}
                disabled={loadingId === connector.id}
                style={{ padding: '4px 8px', height: 'auto', fontSize: '0.75rem', color: 'var(--error)' }}
                title="Disconnect"
              >
                {loadingId === connector.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (connector.id === 'google-drive') fetchGdriveFiles();
                  else if (connector.id === 'github') fetchGithubRepos();
                  else if (connector.id === 'notion') fetchNotionPages();
                  else if (connector.id === 'slack') fetchSlackChannels();
                  else if (connector.id === 'jira') fetchJiraProjects();
                }}
                disabled={loadingId === connector.id}
                style={{ padding: '4px 12px', height: 'auto', fontSize: '0.75rem' }}
              >
                {connector.id === 'google-drive' ? 'Select Files' : 
                 connector.id === 'github' ? 'Select Repos' : 
                 connector.id === 'notion' ? 'Select Pages' : 
                 connector.id === 'slack' ? 'Select Channels' : 
                 connector.id === 'jira' ? 'Select Projects' : 'Upload More'}
              </Button>
            </div>
          </>
        ) : connector.id === 'file-upload' ? (
          <>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct File • Max 20MB</div>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              disabled={loadingId === 'file-upload' || isJobActive}
              style={{ padding: '4px 14px', height: 'auto', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {loadingId === 'file-upload' || isJobActive ? <Loader2 size={14} className="animate-spin" /> : <HardDrive size={14} />}
              Upload File
            </Button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {connector.isEnterprise ? 'Company Brain' : 'OAuth 2.0'}
            </div>
            <Button 
              variant={connector.isEnterprise ? "outline" : "primary"}
              size="sm" 
              onClick={() => handleConnect(connector)}
              disabled={loadingId === connector.id}
              style={{ padding: '4px 12px', height: 'auto', fontSize: '0.75rem' }}
            >
              {loadingId === connector.id ? <Loader2 size={14} className="animate-spin" /> : connector.isEnterprise ? 'Explore' : 'Connect'}
            </Button>
          </>
        )}
      </div>
    </Card>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1000px' }}>
      
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Knowledge Connectors</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Connect tools and ingest data into your isolated semantic knowledge graph. All documents and entities are isolated by your tenant ID.
        </p>
      </div>

      {statusMsg === 'success' && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
          Sync completed successfully! Documents and graph entities are now live in your workspace.
        </div>
      )}

      {statusMsg === 'error' && (
        <div style={{ padding: 'var(--space-4)', background: 'var(--error-light)', color: 'var(--error)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          Failed to process request. Please try again.
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 650, color: 'var(--text-primary)' }}>
              Individual / Free Tier Connectors
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 650, background: 'var(--success-light)', padding: '2px 8px', borderRadius: '12px' }}>
              Included For All Users
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
            {freeConnectors.map(renderConnectorCard)}
          </div>
        </div>

        {/* Premium Connectors Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 650, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Company Brain Connectors
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)', textTransform: 'uppercase' }}>Enterprise</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Multi-seat • Cryptographic Isolation • Living SOPs
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
            {premiumConnectors.map(renderConnectorCard)}
          </div>
        </div>

      </div>

      {/* Enterprise Upgrade Modal */}
      {enterpriseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div className="animate-scale-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--warning-light)', color: 'var(--warning)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                <Sparkles size={13} />
                COMPANY BRAIN SUITE
              </div>
              <button 
                onClick={() => setEnterpriseModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              Unlock {selectedEnterprise?.name || 'Company Connector'}
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
              Company-tier connectors unify organization-wide communication, sprint boards, and wikis into an autonomous living graph with full role-based access control.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface-soft)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)' }}>✓</span> Complete cryptographic tenant data isolation
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)' }}>✓</span> Automated Living SOP generation on merged PRs & threads
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)' }}>✓</span> Unlimited team members and cross-platform query traces
              </div>
            </div>

            {demoRequested ? (
              <div style={{ padding: '12px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                🎉 Request received! Our founding team will reach out within 24 hours.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <Button variant="outline" style={{ flex: 1 }} onClick={() => setEnterpriseModalOpen(false)}>Close</Button>
                  <Button variant="primary" style={{ flex: 1 }} onClick={() => setDemoRequested(true)}>Request Access</Button>
                </div>
                
                {/* Developer/Investor Sandbox Test Mode */}
                <button
                  onClick={() => {
                    setEnterpriseModalOpen(false);
                    const baseUrl = getApiUrl();
                    const targetId = selectedEnterprise?.id === 'github-enterprise' ? 'github' : selectedEnterprise?.id;
                    window.location.href = `${baseUrl}/api/v1/integrations/${targetId}/auth?tenant_id=${tenantId}`;
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textAlign: 'center',
                    padding: '4px'
                  }}
                >
                  (Or click here to test sandbox connection directly)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notion Page Picker Modal */}
      {notionModalOpen && (
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
              <Database size={24} color="var(--text)" /> Select Notion Pages
            </h2>
            
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              {loadingNotion ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
                  <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Fetching your Notion pages...</span>
                </div>
              ) : notionPages.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No pages found. Make sure you selected pages during OAuth.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notionPages.map(page => (
                    <label key={page.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedNotion.includes(page.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedNotion([...selectedNotion, page.id]);
                          else setSelectedNotion(selectedNotion.filter(id => id !== page.id));
                        }}
                      />
                      <FileText size={18} color="var(--text-muted)" />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>{page.name}</span>
                        {page.url && <a href={page.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--info)', textDecoration: 'none' }}>View in Notion</a>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {syncingNotion && jobProgress['notion']?.progress && (
                  <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{jobProgress['notion'].progress}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" disabled={syncingNotion} onClick={() => setNotionModalOpen(false)}>Cancel</Button>
                <Button 
                  variant="primary" 
                  disabled={selectedNotion.length === 0 || syncingNotion}
                  onClick={handleSyncNotion}
                >
                  {syncingNotion ? <><Loader2 className="animate-spin" size={16} /> Syncing...</> : `Sync ${selectedNotion.length} Pages`}
                </Button>
              </div>
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
                        disabled={syncingGithub}
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {syncingGithub && jobProgress['github']?.progress && (
                  <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{jobProgress['github'].progress}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" disabled={syncingGithub} onClick={() => setGithubModalOpen(false)}>Cancel</Button>
                <Button 
                  variant="primary" 
                  disabled={selectedRepos.length === 0 || syncingGithub}
                  onClick={handleSyncGithub}
                >
                  {syncingGithub ? <><Loader2 className="animate-spin" size={16} /> Syncing...</> : `Sync ${selectedRepos.length} Repos`}
                </Button>
              </div>
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
                        disabled={syncing}
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {syncing && jobProgress['google-drive']?.progress && (
                  <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{jobProgress['google-drive'].progress}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" disabled={syncing} onClick={() => setGdriveModalOpen(false)}>Cancel</Button>
                <Button 
                  variant="primary" 
                  disabled={selectedFiles.length === 0 || syncing}
                  onClick={handleSyncSelected}
                >
                  {syncing ? <><Loader2 className="animate-spin" size={16} /> Syncing...</> : `Sync ${selectedFiles.length} Files`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Slack Channel Picker Modal */}
      {slackModalOpen && (
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
              <MessageSquare size={24} color="var(--violet)" /> Select Slack Channels
            </h2>
            
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              {loadingSlack ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
                  <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Fetching your Slack channels...</span>
                </div>
              ) : slackChannels.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No channels found or Slack not connected.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {slackChannels.map(ch => (
                    <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)' }}>
                      <input 
                        type="checkbox" 
                        disabled={syncingSlack}
                        checked={selectedSlack.includes(ch.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSlack([...selectedSlack, ch.id]);
                          else setSelectedSlack(selectedSlack.filter(id => id !== ch.id));
                        }}
                      />
                      <MessageSquare size={18} color="var(--violet)" />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>{ch.name}</span>
                        {ch.topic && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ch.topic}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {syncingSlack && jobProgress['slack']?.progress && (
                  <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{jobProgress['slack'].progress}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" disabled={syncingSlack} onClick={() => setSlackModalOpen(false)}>Cancel</Button>
                <Button 
                  variant="primary" 
                  disabled={selectedSlack.length === 0 || syncingSlack}
                  onClick={handleSyncSlack}
                >
                  {syncingSlack ? <><Loader2 className="animate-spin" size={16} /> Syncing...</> : `Sync ${selectedSlack.length} Channels`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jira Project Picker Modal */}
      {jiraModalOpen && (
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
              <FileText size={24} color="var(--info)" /> Select Jira Projects
            </h2>
            
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              {loadingJira ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
                  <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                  <span style={{ color: 'var(--text-muted)' }}>Fetching your Jira projects...</span>
                </div>
              ) : jiraProjects.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No projects found or Jira not connected.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {jiraProjects.map(proj => (
                    <label key={proj.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border)' }}>
                      <input 
                        type="checkbox" 
                        disabled={syncingJira}
                        checked={selectedJira.includes(proj.key)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedJira([...selectedJira, proj.key]);
                          else setSelectedJira(selectedJira.filter(key => key !== proj.key));
                        }}
                      />
                      <FileText size={18} color="var(--info)" />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>{proj.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Key: {proj.key}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {syncingJira && jobProgress['jira']?.progress && (
                  <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{jobProgress['jira'].progress}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" disabled={syncingJira} onClick={() => setJiraModalOpen(false)}>Cancel</Button>
                <Button 
                  variant="primary" 
                  disabled={selectedJira.length === 0 || syncingJira}
                  onClick={handleSyncJira}
                >
                  {syncingJira ? <><Loader2 className="animate-spin" size={16} /> Syncing...</> : `Sync ${selectedJira.length} Projects`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

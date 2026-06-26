'use client';
import React, { useState, useEffect } from 'react';
import { Puzzle, Webhook, Key, Database, Link as LinkIcon, CheckCircle, Cloud, GitBranch } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';
import useDrivePicker from 'react-google-drive-picker';

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubStatus, setGithubStatus] = useState('');

  const [openPicker, data, authResponse] = useDrivePicker();

  useEffect(() => {
    if (data?.action === 'picked' && authResponse?.access_token) {
      const importFromDrive = async () => {
        setUploadStatus('Importing from Google Drive...');
        try {
          const token = await getToken();
          for (const doc of data.docs) {
            await fetch('http://localhost:8000/api/v1/ingest/google-drive', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                file_id: doc.id,
                file_name: doc.name,
                mime_type: doc.mimeType,
                access_token: authResponse.access_token,
                tenant_id: user.id
              })
            });
          }
          setUploadStatus('Import Complete! Files are now in Knowledge Vault.');
        } catch (err) {
          console.error(err);
          setUploadStatus('Import Failed');
        } finally {
          setTimeout(() => setUploadStatus(''), 5000);
        }
      };
      importFromDrive();
    }
  }, [data, authResponse]);

  useEffect(() => {
    if (!user) return;
    const fetchGithub = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/integrations/github/repos?tenant_id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setGithubRepos(data.repos);
          setGithubConnected(true);
        }
      } catch (err) {
        console.log("GitHub not connected");
      }
    };
    fetchGithub();
  }, [user]);

  const handleIngestGithub = async (repoFullName) => {
    setGithubStatus(`Queuing ${repoFullName}...`);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:8000/api/v1/ingest/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenant_id: user.id,
          repo_full_name: repoFullName
        })
      });
      if (res.ok) {
        setGithubStatus(`Successfully queued ${repoFullName} for ingestion! Check Knowledge Vault shortly.`);
      } else {
        setGithubStatus(`Failed to queue ${repoFullName}`);
      }
    } catch (err) {
      setGithubStatus(`Error connecting to backend.`);
    } finally {
      setTimeout(() => setGithubStatus(''), 5000);
    }
  };

  const handleOpenPicker = () => {
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true
    });
  };
  
  useEffect(() => {
    // Quick and dirty way to check URL params without next/navigation to avoid router issues
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('status') === 'success') {
        setSuccessMsg('Successfully connected Notion!');
      } else if (urlParams.get('status') === 'error') {
        setSuccessMsg('Failed to connect Notion. Please try again.');
      }
    }
  }, []);

  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', marginTop: '10vh' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Loading your secure session...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please wait while we sync your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <Puzzle size={32} color="var(--primary-color)" /> Integrations
      </h1>
      
      {successMsg && (
        <div style={{ padding: '1rem', marginBottom: '2rem', background: successMsg.includes('Success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: successMsg.includes('Success') ? '1px solid #10b981' : '1px solid #ef4444', color: successMsg.includes('Success') ? '#10b981' : '#ef4444', borderRadius: '8px' }}>
          {successMsg}
        </div>
      )}

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Connect your AI Agent to external tools and data sources. Integrate Notion to automatically ingest your company wikis, meeting notes, and documentation directly into your Knowledge Vault.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" style={{ width: '32px' }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Notion</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Workspace Intelligence</p>
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '99px' }}>Official</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sync your Notion pages, wikis, and databases so your AI can answer questions using your company knowledge.
          </p>
          <a 
            href={`http://localhost:8000/api/v1/integrations/notion/auth?tenant_id=${user.id}`}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <LinkIcon size={18} /> Connect Notion
          </a>
        </div>

        {/* Google Drive Integration */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cloud size={24} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Google Drive</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cloud Storage</p>
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '99px' }}>Official</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Select specific files from your Google Drive to instantly import into your Knowledge Vault.
          </p>
          <button 
            onClick={handleOpenPicker}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              background: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            disabled={uploadStatus.includes('Importing')}
          >
            <Cloud size={18} /> {uploadStatus.includes('Importing') ? 'Importing...' : 'Select Files'}
          </button>
          {uploadStatus && <div style={{ fontSize: '0.85rem', color: 'var(--accent)', textAlign: 'center' }}>{uploadStatus}</div>}
        </div>
        {/* GitHub Integration */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitBranch size={28} color="#18181b" />
              </div>
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>GitHub</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Codebase Intelligence</p>
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', borderRadius: '99px' }}>Official</span>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Ingest your codebase directly from GitHub. <br/>
            <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>*For now, we have enabled only Markdown (.md) and Text (.txt) files.</span>
          </p>
          
          {!githubConnected ? (
            <a 
              href={`http://localhost:8000/api/v1/integrations/github/auth?tenant_id=${user.id}`}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                background: '#e11d48', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}
            >
              <LinkIcon size={18} /> Connect GitHub
            </a>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Repositories</h4>
                {githubRepos.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No repositories found.</p>
                ) : (
                  githubRepos.map(repo => (
                    <div key={repo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{repo.name}</span>
                      <button 
                        onClick={() => handleIngestGithub(repo.full_name)}
                        style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                        disabled={githubStatus.includes('Queuing')}
                      >
                        Ingest
                      </button>
                    </div>
                  ))
                )}
              </div>
              {githubStatus && <div style={{ fontSize: '0.85rem', color: 'var(--accent)', textAlign: 'center' }}>{githubStatus}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

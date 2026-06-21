'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, File, GitBranch, MessageSquare, Trash2 } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';

const KnowledgeVault = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8000/api/v1/documents/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !user) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }
    
    setUploadStatus('Uploading & Extracting...');
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('tenant_id', user.id);

    try {
      const res = await fetch('http://localhost:8000/api/v1/ingest', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setUploadStatus('Extraction Complete!');
        fetchDocuments(); // Refresh the list
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        setUploadStatus('Upload Failed');
        setTimeout(() => setUploadStatus(''), 3000);
      }
    } catch (err) {
      setUploadStatus('Upload Failed');
      setTimeout(() => setUploadStatus(''), 3000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId) => {
    if (!user) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/api/v1/documents/${user.id}/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDocuments();
      } else {
        console.error("Failed to delete document");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Knowledge Vault</h1>
        <p className="page-subtitle">Search and retrieve deeply nested information instantly from every connected data source.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div className="input-wrapper">
          <Search size={20} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Search across PDFs, GitHub, Slack, and Notion..." 
            style={{ paddingLeft: '3rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="metrics-grid">
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
            <File size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Documents</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{documents.length} PDFs indexed</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }}>
            <GitBranch size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Repositories</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>0 Repos synced</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Slack</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>0 Channels active</div>
          </div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <div className="panel-header flex-row" style={{ justifyContent: 'space-between' }}>
          <span>Indexed Document Archive</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {uploadStatus && <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{uploadStatus}</span>}
            <input 
              type="file" 
              accept=".pdf" 
              id="file-upload" 
              ref={fileInputRef}
              style={{ display: 'none' }} 
              onChange={handleUpload} 
              disabled={uploadStatus.includes('Uploading')}
            />
            <label htmlFor="file-upload" className="btn-primary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              Upload PDF
            </label>
          </div>
        </div>
        <div className="panel-body">
          {documents.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>No documents uploaded yet.</div>
          ) : (
            <div className="flex-col">
              {documents.map((doc) => (
                <div key={doc.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{doc.filename}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {doc.status}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                      title="Delete document and wipe from Graph"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeVault;


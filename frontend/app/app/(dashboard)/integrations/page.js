'use client';
import React, { useState, useEffect } from 'react';
import { Puzzle, Webhook, Key, Database, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [successMsg, setSuccessMsg] = useState('');
  
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

        {/* Placeholders for others */}
        <div className="card" style={{ padding: '2rem', opacity: '0.5', pointerEvents: 'none' }}>
           <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Google Drive</h3>
           <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Coming Soon</p>
        </div>
        <div className="card" style={{ padding: '2rem', opacity: '0.5', pointerEvents: 'none' }}>
           <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>GitHub</h3>
           <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Coming Soon</p>
        </div>
      </div>
    </div>
  );
}

'use client';
import React from 'react';
import Chat from '@/components/Chat';
import { useUser, useAuth } from '@clerk/nextjs';

const AIPlayground = () => {
  const { user } = useUser();

  return (
    <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <h1 className="page-title">AI Playground</h1>
        <p className="page-subtitle">Interact with your Workspace Memory. Bring your own model (OpenAI, Claude, Gemini).</p>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {user ? <Chat tenantId={user.id} /> : <div style={{ padding: '2rem', textAlign: 'center' }}>Please sign in to access the playground.</div>}
      </div>
    </div>
  );
};

export default AIPlayground;


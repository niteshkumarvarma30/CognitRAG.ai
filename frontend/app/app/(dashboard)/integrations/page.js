'use client';
import React from 'react';
import { Puzzle, Webhook, Key, Database } from 'lucide-react';

export default function Page() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <Puzzle size={32} color="var(--primary-color)" /> Integrations
      </h1>
      
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Welcome to the <strong>Integrations</strong> center. This page is currently in development. Here, you will be able to connect your AI Agent to external tools and data sources. This includes managing API keys, configuring outbound webhooks, and setting up native connectors for platforms like Slack, Notion, GitHub, and Google Drive to enable continuous, automated knowledge ingestion.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Database size={20} /> <h3 style={{ fontWeight: '600' }}>Data Sources</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Connect to Confluence, Jira, Notion, and Google Workspace to sync data automatically.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Webhook size={20} /> <h3 style={{ fontWeight: '600' }}>Webhooks</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure outgoing events so your AI can trigger actions in external systems.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Key size={20} /> <h3 style={{ fontWeight: '600' }}>API Access</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generate and manage Bearer tokens to query your Knowledge Vault via REST API.</p>
        </div>
      </div>
    </div>
  );
}

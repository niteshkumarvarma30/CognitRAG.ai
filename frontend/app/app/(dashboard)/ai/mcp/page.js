'use client';
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Terminal, Key, Copy, CheckCircle2, Server, Globe } from 'lucide-react';

export default function MCPPortalPage() {
  const [copied, setCopied] = useState(false);
  const mcpConfig = `{
  "mcpServers": {
    "cognitrag": {
      "command": "python",
      "args": ["-m", "src.mcp.server"],
      "env": {
        "TENANT_ID": "ws_12345",
        "API_KEY": "cog_sk_test_992837482"
      }
    }
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mcpConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '900px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Model Context Protocol (MCP)</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Connect your local IDE (Cursor, Windsurf) or external AI agents directly to your company's semantic brain.
          </p>
        </div>
        <Button variant="primary">
          <Key size={16} /> Generate API Key
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        <Card style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Terminal size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Local IDE Integration</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Standard I/O Transport</p>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            Paste this configuration into your Cursor or Windsurf MCP settings file. This grants your local coding agent read-only access to company architecture and SOPs.
          </p>
          <div style={{ position: 'relative', background: 'var(--surface-dark)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', overflowX: 'auto' }}>
            <pre style={{ margin: 0, color: '#e5e7eb', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
              {mcpConfig}
            </pre>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyToClipboard}
              style={{ position: 'absolute', top: '8px', right: '8px', color: '#9ca3af', background: 'rgba(255,255,255,0.1)' }}
            >
              {copied ? <CheckCircle2 size={14} color="var(--success)" /> : <Copy size={14} />}
            </Button>
          </div>
        </Card>

        <Card style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--violet)15', color: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Remote AI Agents</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>SSE Web Transport</p>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            Use the SSE (Server-Sent Events) endpoint to connect cloud-based agents (like LangChain or custom orchestrators) to your company brain over the web.
          </p>
          
          <div style={{ padding: 'var(--space-3)', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>SSE Endpoint URL</div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              https://api.cognitrag.com/mcp/sse
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant="success">Active</Badge>
            <Badge variant="secondary">Requires API Key</Badge>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Exposed MCP Tools</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Server size={16} color="var(--primary)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 500 }}>search_company_knowledge</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>Retrieves Vector/Graph chunks</span>
          </div>
          <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Server size={16} color="var(--primary)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 500 }}>get_semantic_dictionary</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>Retrieves governed jargon & acronyms</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}

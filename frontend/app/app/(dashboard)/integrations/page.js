'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageSquare, GitPullRequest, CheckSquare, BookOpen } from 'lucide-react';
import ConnectorCard from '@/components/ConnectorCard';
import { getApiUrl } from '@/lib/api';

const V5_CONNECTORS = [
  {
    id: 'slack',
    title: 'Slack',
    description: 'Index public & private channels. Enables the /cognitrag ask slash command for your entire team.',
    icon: MessageSquare,
    authPath: '/api/v1/slack/install',
  },
  {
    id: 'github',
    title: 'GitHub',
    description: 'Sync pull requests, issues, and code discussion. Auto-responds when @cognitrag is mentioned in PRs.',
    icon: GitPullRequest,
    authPath: '/api/v1/integrations/github/auth',
  },
  {
    id: 'jira',
    title: 'Jira',
    description: 'Ingest projects, sprint boards, and tickets with project-level audience security.',
    icon: CheckSquare,
    authPath: '/api/v1/integrations/jira/auth',
  },
  {
    id: 'notion',
    title: 'Notion',
    description: 'Ingest company RFCs, technical docs, and wikis with granular page-level permission controls.',
    icon: BookOpen,
    authPath: '/api/v1/integrations/notion/auth',
  },
];

export default function IntegrationsPage() {
  const { user } = useUser();
  const [tenantIntegrations, setTenantIntegrations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, [user]);

  const loadStatus = async () => {
    try {
      const tid = localStorage.getItem('cognitrag_tenant_id') || '4aedf36c-6bcb-490a-98cc-6293366dd891';
      const apiBase = getApiUrl();
      const res = await fetch(`${apiBase}/api/v1/integrations?tenant_id=${tid}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = {};
        (data.integrations || []).forEach((item) => {
          mapped[item.integration_type] = item;
        });
        setTenantIntegrations(mapped);
      }
    } catch (e) {
      console.warn('Failed to fetch integrations live status, using cached state', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (providerId) => {
    const conn = V5_CONNECTORS.find((c) => c.id === providerId);
    if (!conn) return;

    const tid = localStorage.getItem('cognitrag_tenant_id') || '4aedf36c-6bcb-490a-98cc-6293366dd891';
    const apiBase = getApiUrl();
    window.location.href = `${apiBase}${conn.authPath}?tenant_id=${tid}`;
  };

  const handleSync = async (providerId) => {
    const tid = localStorage.getItem('cognitrag_tenant_id') || '4aedf36c-6bcb-490a-98cc-6293366dd891';
    const apiBase = getApiUrl();
    await fetch(`${apiBase}/api/v1/integrations/${providerId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tid }),
    });
    await loadStatus();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
          <span>🔌 Workspace Integrations</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Connect your organization tools. CognitRAG respects channel memberships, repository access, and project permissions with strict zero-leak isolation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {V5_CONNECTORS.map((c) => {
          const status = tenantIntegrations[c.id];
          const isConnected = !!status && status.status === 'connected';

          return (
            <ConnectorCard
              key={c.id}
              provider={c.id}
              title={c.title}
              description={c.description}
              icon={c.icon}
              connected={isConnected}
              syncPhase={status?.sync_phase || 'idle'}
              itemsIndexed={status?.items_indexed || 0}
              lastSyncedAt={status?.last_synced_at || null}
              onConnect={handleConnect}
              onSync={handleSync}
            />
          );
        })}
      </div>
    </div>
  );
}

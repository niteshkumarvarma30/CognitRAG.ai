'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageSquare, GitPullRequest, CheckSquare, BookOpen } from 'lucide-react';
import ConnectorCard from '@/components/ConnectorCard';
import ResourcePickerModal from '@/components/ResourcePickerModal';
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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('slack') === 'connected') {
        localStorage.setItem('cognitrag_integration_slack', 'connected');
      }
      if (params.get('github') === 'connected' || params.get('status') === 'success') {
        localStorage.setItem('cognitrag_integration_github', 'connected');
      }
    }
    loadStatus();
  }, [user]);

  const getEffectiveTenantId = () => {
    return user?.id || (typeof window !== 'undefined' ? localStorage.getItem('cognitrag_tenant_id') : '') || '';
  };

  const loadStatus = async () => {
    try {
      const tid = getEffectiveTenantId();
      if (!tid) {
        setLoading(false);
        return;
      }
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
      console.warn('Failed to fetch integrations live status', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (providerId) => {
    const conn = V5_CONNECTORS.find((c) => c.id === providerId);
    if (!conn) return;

    const tid = getEffectiveTenantId();
    const apiBase = getApiUrl();
    window.location.href = `${apiBase}${conn.authPath}?tenant_id=${tid}`;
  };

  const handleSync = async (providerId) => {
    const tid = getEffectiveTenantId();
    const apiBase = getApiUrl();
    await fetch(`${apiBase}/api/v1/integrations/${providerId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tid }),
    });
    await loadStatus();
  };

  const [manageModal, setManageModal] = useState(null);

  const handleManage = (providerId) => {
    const conn = V5_CONNECTORS.find((c) => c.id === providerId);
    const status = tenantIntegrations[providerId];
    setManageModal({
      provider: providerId,
      title: conn ? conn.title : providerId,
      workspaceName: status?.workspace_name || null
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem', color: '#F8FAFC' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🔌 Workspace Integrations</span>
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#94A3B8', marginTop: '6px', maxWidth: '720px', lineHeight: 1.5 }}>
          Connect your organization tools. CognitRAG respects channel memberships, repository access, and project permissions with strict zero-leak isolation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {V5_CONNECTORS.map((c) => {
          const status = tenantIntegrations[c.id];
          const isConnected = !!status && (status.status === 'connected' || status.is_active);

          return (
            <ConnectorCard
              key={c.id}
              provider={c.id}
              title={c.title}
              description={c.description}
              icon={c.icon}
              connected={isConnected}
              workspaceName={status?.workspace_name}
              syncPhase={status?.sync_phase || 'idle'}
              itemsIndexed={status?.items_indexed || 0}
              lastSyncedAt={status?.last_synced_at || null}
              onConnect={handleConnect}
              onSync={handleSync}
              onManage={handleManage}
            />
          );
        })}
      </div>

      {manageModal && (
        <ResourcePickerModal
          isOpen={!!manageModal}
          onClose={() => setManageModal(null)}
          provider={manageModal.provider}
          title={manageModal.title}
          tenantId={getEffectiveTenantId()}
          workspaceName={manageModal.workspaceName}
          onSyncSuccess={loadStatus}
        />
      )}
    </div>
  );
}

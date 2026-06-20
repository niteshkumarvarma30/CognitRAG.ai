import React, { useState, useEffect } from 'react';
import { Brain, FileText, Users, Network, Activity } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';

const HomeDashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [metrics, setMetrics] = useState({
    verified_memories: 0,
    knowledge_assets: 0,
    connected_minds: 0,
    graph_connections: 0,
    memory_health: 100.0
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        const metricsRes = await fetch(`http://localhost:8000/api/v1/metrics/${user.id}`, { headers });
        if (metricsRes.ok) setMetrics(await metricsRes.json());

        const docsRes = await fetch(`http://localhost:8000/api/v1/documents/${user.id}`, { headers });
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setRecentDocs(docsData.slice(0, 3)); // Show top 3 recent documents
        }

        const prefRes = await fetch(`http://localhost:8000/api/v1/memory/${user.id}/${user.id}/preferences`, { headers });
        if (prefRes.ok) {
          const prefData = await prefRes.json();
          setPolicies(prefData);
        }
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      }
    };
    fetchMetrics();
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Workspace Overview</h1>
        <p className="page-subtitle">Real-time intelligence metrics and memory health across your entire organization.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-panel blue">
          <div className="metric-label"><Brain size={16} /> Verified Memories</div>
          <div className="metric-value">{metrics.verified_memories.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Active knowledge nodes</div>
        </div>
        
        <div className="metric-card glass-panel purple">
          <div className="metric-label"><FileText size={16} /> Knowledge Assets</div>
          <div className="metric-value">{metrics.knowledge_assets.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Ingested documents</div>
        </div>
        
        <div className="metric-card glass-panel">
          <div className="metric-label"><Users size={16} /> Connected Minds</div>
          <div className="metric-value">{metrics.connected_minds.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active members</div>
        </div>
        
        <div className="metric-card glass-panel blue">
          <div className="metric-label"><Network size={16} /> Graph Connections</div>
          <div className="metric-value">{metrics.graph_connections.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Relationships mapped</div>
        </div>

        <div className="metric-card glass-panel green">
          <div className="metric-label"><Activity size={16} /> Memory Health</div>
          <div className="metric-value">{metrics.memory_health.toFixed(1)}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>High consistency</div>
        </div>
      </div>

      <div className="split-view">
        <div className="glass-panel">
          <div className="panel-header">Recent Knowledge Extraction</div>
          <div className="panel-body">
            <div className="flex-col">
              {recentDocs.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No recent extractions found.</div>
              ) : (
                recentDocs.map(doc => (
                  <div key={doc.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{doc.filename}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {doc.status} • {new Date(doc.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">Active Policies</div>
          <div className="panel-body">
            <div className="flex-col">
              {policies.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No workspace policies established yet.</div>
              ) : (
                policies.slice(0, 3).map((policy, idx) => {
                  const colors = ['blue', 'purple', 'green'];
                  const colorClass = colors[idx % colors.length];
                  const bgColors = {
                    blue: 'rgba(59, 130, 246, 0.1)',
                    purple: 'rgba(139, 92, 246, 0.1)',
                    green: 'rgba(16, 185, 129, 0.1)'
                  };
                  const borderColors = {
                    blue: 'rgba(59,130,246,0.3)',
                    purple: 'rgba(139,92,246,0.3)',
                    green: 'rgba(16,185,129,0.3)'
                  };
                  return (
                    <div key={idx} className="flex-row" style={{ padding: '1rem', background: bgColors[colorClass], borderRadius: '8px', border: `1px solid ${borderColors[colorClass]}` }}>
                      <span className={`badge ${colorClass}`}>{policy.pref_key}</span>
                      <span style={{ fontSize: '0.9rem' }}>{policy.pref_value}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;

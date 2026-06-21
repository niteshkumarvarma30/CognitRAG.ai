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
      {/* 1. Dynamic Welcome Banner */}
      <div className="welcome-banner">
        <h1 className="welcome-title">Welcome back, {user?.firstName || 'Commander'}</h1>
        <p className="welcome-subtitle">Workspace intelligence is optimal. Neural pathways and memory structures are actively processing.</p>
        <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'pulse 2s infinite' }}></div>
          <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '1px' }}>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* 2. Enhanced Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel blue">
          <div className="flex-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="metric-label"><Brain size={16} /> Verified Memories</div>
              <div className="metric-value">{metrics.verified_memories.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Active knowledge nodes</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="#3b82f6" />
            </div>
          </div>
        </div>
        
        <div className="metric-card glass-panel purple">
          <div className="flex-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="metric-label"><FileText size={16} /> Knowledge Assets</div>
              <div className="metric-value">{metrics.knowledge_assets.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Ingested documents</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#8b5cf6" />
            </div>
          </div>
        </div>
        
        <div className="metric-card glass-panel">
          <div className="flex-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="metric-label"><Users size={16} /> Connected Minds</div>
              <div className="metric-value">{metrics.connected_minds.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active members</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(148, 163, 184, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Users size={20} color="#94a3b8" />
            </div>
          </div>
        </div>
        
        <div className="metric-card glass-panel blue">
          <div className="flex-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="metric-label"><Network size={16} /> Graph Connections</div>
              <div className="metric-value">{metrics.graph_connections.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Relationships mapped</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Network size={20} color="#3b82f6" />
            </div>
          </div>
        </div>

        <div className="metric-card glass-panel green">
          <div className="flex-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="metric-label"><Activity size={16} /> Memory Health</div>
              <div className="metric-value">{metrics.memory_health.toFixed(1)}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>High consistency</div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Activity size={20} color="#10b981" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CognitRAG.ai Memory Infrastructure Showcase */}
      <div className="glass-panel" style={{ marginTop: '2rem', background: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain color="#3b82f6" />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CognitRAG.ai Memory Core</span>
          </div>
        </div>
        <div className="panel-body">
          <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>The Four Pillars of Workspace Memory are actively ingesting, distilling, and indexing your knowledge base.</p>
          <div className="memory-core-grid">
            <div className="memory-pillar">
              <div className="pillar-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}><FileText size={18} color="#60a5fa" /></div>
              <h4 style={{ fontWeight: '600' }}>Living Truth (Semantic)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Vector DB synchronization active. Fact extraction pipeline online.</p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}><span className="badge blue">Healthy</span></div>
            </div>
            <div className="memory-pillar">
              <div className="pillar-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}><Activity size={18} color="#34d399" /></div>
              <h4 style={{ fontWeight: '600' }}>Active Policies (Preference)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Behavioral guidelines and formatting rules are being enforced.</p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}><span className="badge green">{policies.length} Policies</span></div>
            </div>
            <div className="memory-pillar">
              <div className="pillar-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}><Brain size={18} color="#a78bfa" /></div>
              <h4 style={{ fontWeight: '600' }}>Active Context (Session)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Short-term RAM holding immediate conversational trajectory.</p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}><span className="badge purple">Tracking</span></div>
            </div>
            <div className="memory-pillar">
              <div className="pillar-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}><Network size={18} color="#fbbf24" /></div>
              <h4 style={{ fontWeight: '600' }}>Timeline (Episodic)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Historical distillation pipeline archiving conversation states.</p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}><span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Archiving</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="split-view" style={{ marginTop: '2rem' }}>
        {/* 4. Live Network Pulse Feed */}
        <div className="glass-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Network Pulse</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div><span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>Live</span></div>
          </div>
          <div className="panel-body">
            <div className="live-feed-container">
              <div className="live-feed-item" style={{ animationDelay: '0.1s' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>Just now</div>
                <div><span style={{ color: '#10b981' }}>⚡ System Update:</span> Graph Engine optimized.</div>
              </div>
              <div className="live-feed-item" style={{ animationDelay: '0.3s' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>2 mins ago</div>
                <div><span style={{ color: '#8b5cf6' }}>🧠 Memory Distillation:</span> Episodic timeline updated.</div>
              </div>
              <div className="live-feed-item" style={{ animationDelay: '0.5s' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>5 mins ago</div>
                <div><span style={{ color: '#3b82f6' }}>🔗 Graph Mapped:</span> 793 relationship edges verified.</div>
              </div>
              {recentDocs.map((doc, idx) => (
                <div key={doc.id} className="live-feed-item" style={{ animationDelay: `${0.7 + (idx * 0.2)}s` }}>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>{new Date(doc.created_at).toLocaleTimeString()}</div>
                   <div><span style={{ color: '#f59e0b' }}>📄 Document Extracted:</span> {doc.filename} processed.</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Existing Active Policies Block */}
        <div className="glass-panel">
          <div className="panel-header">Learned Preferences</div>
          <div className="panel-body">
            <div className="flex-col">
              {policies.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '1rem' }}>No workspace policies established yet.</div>
              ) : (
                policies.slice(0, 4).map((policy, idx) => {
                  const colors = ['blue', 'purple', 'green'];
                  const colorClass = colors[idx % colors.length];
                  const bgColors = { blue: 'rgba(59, 130, 246, 0.1)', purple: 'rgba(139, 92, 246, 0.1)', green: 'rgba(16, 185, 129, 0.1)' };
                  const borderColors = { blue: 'rgba(59,130,246,0.3)', purple: 'rgba(139,92,246,0.3)', green: 'rgba(16,185,129,0.3)' };
                  return (
                    <div key={idx} className="flex-row" style={{ padding: '1rem', background: bgColors[colorClass], borderRadius: '8px', border: `1px solid ${borderColors[colorClass]}`, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
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

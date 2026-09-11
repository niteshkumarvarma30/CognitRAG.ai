'use client';
import React, { useState, useEffect } from 'react';
import { Brain, Settings, Database, History, ShieldCheck, Users } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/api';

const MemoryHub = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [facts, setFacts] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [activeTab, setActiveTab] = useState('semantic');

  useEffect(() => {
    const fetchMemoryData = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const factsRes = await fetch(`${getApiUrl()}/api/v1/memory/${user.id}/${user.id}/facts`, { headers });
        if (factsRes.ok) setFacts(await factsRes.json());
        
        const prefRes = await fetch(`${getApiUrl()}/api/v1/memory/${user.id}/${user.id}/preferences`, { headers });
        if (prefRes.ok) setPreferences(await prefRes.json());
        
        const epiRes = await fetch(`${getApiUrl()}/api/v1/memory/${user.id}/${user.id}/episodic`, { headers });
        if (epiRes.ok) setTimeline(await epiRes.json());
      } catch (err) {
        console.error("Failed to fetch memory hub data:", err);
      }
    };
    fetchMemoryData();
  }, [user]);

  const tabs = [
    { id: 'semantic', label: 'Living Truth', icon: Database, color: '#6366F1' },
    { id: 'policies', label: 'Policies', icon: Settings, color: '#8B5CF6' },
    { id: 'timeline', label: 'Timeline', icon: History, color: '#F59E0B' },
    { id: 'access', label: 'Access Control', icon: ShieldCheck, color: '#10B981' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Memory Hub</h1>
        <p className="page-subtitle">Central administration for the four pillars of Workspace Memory and Security.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? `${tab.color}15` : 'transparent',
              border: activeTab === tab.id ? `1px solid ${tab.color}40` : '1px solid transparent',
              color: activeTab === tab.id ? tab.color : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: activeTab === tab.id ? '600' : '500'
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'semantic' && (
            <div className="glass-panel">
              <div className="panel-header" style={{ borderBottomColor: 'rgba(99,102,241,0.2)' }}><Database size={20} color="#6366F1" /> Living Truth (Semantic Memory)</div>
              <div className="panel-body">
                <p style={{ color: 'var(--text-muted)' }}>The current established facts of your workspace extracted from documents and chat.</p>
                <div className="flex-col" style={{ marginTop: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                  {facts.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem 0' }}>No facts extracted yet.</div>
                  ) : (
                    facts.map((fact, idx) => (
                      <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #6366F1' }}>
                        <span className="badge blue" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Extracted Fact</span>
                        <div style={{ lineHeight: '1.6' }}>{fact.content || fact.fact}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="glass-panel">
              <div className="panel-header" style={{ borderBottomColor: 'rgba(139,92,246,0.2)' }}><Settings size={20} color="#8B5CF6" /> Workspace Policies (Preferences)</div>
              <div className="panel-body">
                <p style={{ color: 'var(--text-muted)' }}>Rules and formatting preferences the AI must explicitly follow during generation.</p>
                <div className="flex-col" style={{ marginTop: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                  {preferences.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem 0' }}>No active preferences.</div>
                  ) : (
                    preferences.map((pref, idx) => (
                      <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #8B5CF6' }}>
                        <span className="badge purple" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{pref.pref_key}</span>
                        <div style={{ lineHeight: '1.6' }}>{pref.pref_value}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="glass-panel">
              <div className="panel-header" style={{ borderBottomColor: 'rgba(245,158,11,0.2)' }}><History size={20} color="#F59E0B" /> Timeline (Episodic Memory)</div>
              <div className="panel-body">
                <p style={{ color: 'var(--text-muted)' }}>Historical evolution of the workspace, summarized after every conversation turn.</p>
                <div className="timeline-list" style={{ marginTop: '2rem' }}>
                  {timeline.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem 0' }}>No historical episodic memories yet.</div>
                  ) : (
                    timeline.map((episode, idx) => (
                      <div key={idx} className="timeline-item" style={{ gap: '1.5rem' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#F59E0B', border: '3px solid var(--bg-base)', zIndex: 2, marginTop: '4px', boxShadow: '0 0 10px rgba(245,158,11,0.5)' }}></div>
                        <div style={{ flex: 1, padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#F59E0B', fontWeight: '600' }}>{episode.completed_at ? new Date(episode.completed_at).toLocaleString() : 'Recently'}</p>
                          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>{episode.summary}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="glass-panel">
              <div className="panel-header" style={{ borderBottomColor: 'rgba(16,185,129,0.2)' }}><ShieldCheck size={20} color="#10B981" /> Role-Based Access Control</div>
              <div className="panel-body">
                <p style={{ color: 'var(--text-muted)' }}>Manage user permissions and tenant isolation rules enforced by Supabase RLS.</p>
                
                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <Users color="#10B981" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#10B981', margin: 0 }}>Active Role</h3>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Admin</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>You have full read/write access to the Semantic Dictionary and Knowledge Graph.</p>
                  </div>

                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>RLS Policies Enforced</h3>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <ShieldCheck size={16} color="#10B981" /> Tenant Isolation Active
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <ShieldCheck size={16} color="#10B981" /> Admin-only Definitions
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <ShieldCheck size={16} color="#10B981" /> Read-only API Keys
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MemoryHub;


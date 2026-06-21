'use client';
import React, { useState, useEffect } from 'react';
import { Brain, Settings, Database, History } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';

const MemoryHub = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [facts, setFacts] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const fetchMemoryData = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Use user.id for both tenant_id and user_id to match the current backend logic
        const factsRes = await fetch(`http://localhost:8000/api/v1/memory/${user.id}/${user.id}/facts`, { headers });
        if (factsRes.ok) setFacts(await factsRes.json());
        
        const prefRes = await fetch(`http://localhost:8000/api/v1/memory/${user.id}/${user.id}/preferences`, { headers });
        if (prefRes.ok) setPreferences(await prefRes.json());
        
        const epiRes = await fetch(`http://localhost:8000/api/v1/memory/${user.id}/${user.id}/episodic`, { headers });
        if (epiRes.ok) setTimeline(await epiRes.json());
      } catch (err) {
        console.error("Failed to fetch memory hub data:", err);
      }
    };
    fetchMemoryData();
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Memory Hub</h1>
        <p className="page-subtitle">Central administration for the four pillars of Workspace Memory.</p>
      </div>

      <div className="split-view" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel">
          <div className="panel-header"><Database size={20} className="text-accent" /> Living Truth (Semantic Memory)</div>
          <div className="panel-body">
            <p style={{ color: 'var(--text-muted)' }}>The current established facts of your workspace.</p>
            <div className="flex-col" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {facts.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>No facts extracted yet.</div>
              ) : (
                facts.map((fact, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span className="badge blue" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Fact</span>
                    <div>{fact.content || fact.fact}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header"><Settings size={20} className="text-accent-secondary" /> Workspace Policies (Preferences)</div>
          <div className="panel-body">
            <p style={{ color: 'var(--text-muted)' }}>Rules and formatting preferences the AI must follow.</p>
            <div className="flex-col" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {preferences.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>No active preferences.</div>
              ) : (
                preferences.map((pref, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span className="badge purple" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{pref.pref_key}</span>
                    <div>{pref.pref_value}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="split-view">
        <div className="glass-panel">
          <div className="panel-header"><Brain size={20} className="text-success" /> Active Context (Session Memory)</div>
          <div className="panel-body">
            <p style={{ color: 'var(--text-muted)' }}>Short-term RAM containing recent conversational context.</p>
            <div style={{ marginTop: '1.5rem', color: 'var(--text-bright)' }}>
              {timeline.length > 0 ? (
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{timeline[0].summary}</p>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Last updated: {new Date(timeline[0].completed_at).toLocaleString()}</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0' }}>Session context is currently empty.</div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header"><History size={20} className="text-warning" /> Timeline (Episodic Memory)</div>
          <div className="panel-body">
            <p style={{ color: 'var(--text-muted)' }}>Historical evolution of the workspace.</p>
            <div className="flex-col" style={{ marginTop: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {timeline.length <= 1 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>No historical episodic memories yet.</div>
              ) : (
                timeline.slice(1).map((episode, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>{new Date(episode.completed_at).toLocaleString()}</p>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{episode.summary}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryHub;


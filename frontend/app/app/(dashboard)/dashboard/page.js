'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, SkeletonCard } from '@/components/ui';
import { Activity, Users, Database, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    knowledge_assets: 0,
    graph_connections: 0,
    connected_minds: 1,
    verified_memories: 0
  });
  
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    // Fetch metrics
    fetch('http://localhost:8000/api/v1/metrics/ws_1')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error("Failed to fetch metrics", err));

    // Fetch recent documents for Activity feed
    fetch('http://localhost:8000/api/v1/documents/ws_1')
      .then(res => res.json())
      .then(data => {
        // Just take top 3 for dashboard
        setActivities(data.slice(0, 3));
        setLoadingActivities(false);
      })
      .catch(err => {
        console.error("Failed to fetch activity", err);
        setLoadingActivities(false);
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        {[
          { label: 'Documents Ingested', value: metrics.knowledge_assets.toLocaleString(), icon: Zap, color: 'var(--primary)' },
          { label: 'Neo4j Graph Edges', value: metrics.graph_connections.toLocaleString(), icon: Database, color: 'var(--success)' },
          { label: 'Workspace Members', value: metrics.connected_minds.toLocaleString(), icon: Users, color: 'var(--violet)' },
          { label: 'Extracted Memories', value: metrics.verified_memories.toLocaleString(), icon: Activity, color: 'var(--info)' },
        ].map((stat, i) => (
          <Card key={i} style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{stat.label}</div>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        
        <Card style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Activity</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {loadingActivities ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : activities.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent activity found. Upload a document!</div>
            ) : (
              activities.map(act => (
                <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: 'var(--surface-soft)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>New Document Ingested</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{act.filename || act.title || 'Unknown Document'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(act.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-6)' }}>Quick Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link href="/ask" style={{ textDecoration: 'none' }}>
              <Button style={{ width: '100%', justifyContent: 'flex-start' }}>Ask Brain a Question</Button>
            </Link>
            <Link href="/integrations" style={{ textDecoration: 'none' }}>
              <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>Manage Connectors</Button>
            </Link>
            <Link href="/security" style={{ textDecoration: 'none' }}>
              <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>Invite Team Members</Button>
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}

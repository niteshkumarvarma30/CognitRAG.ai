'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { CreditCard, Zap, Database, Activity, CheckCircle2 } from 'lucide-react';

export default function BillingPage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this fetches from /api/v1/billing/usage
    const mockUsage = {
      plan: "Pro",
      billing_period: "August 2026",
      metrics: {
        queries: { used: 1420, limit: 5000 },
        documents: { used: 84, limit: 500 },
        agents: { used: 12, limit: 50 }
      }
    };
    
    setTimeout(() => {
      setUsage(mockUsage);
      setLoading(false);
    }, 600);
  }, []);

  const handleUpgrade = async () => {
    // This would call /api/v1/billing/checkout
    alert("Redirecting to Stripe Checkout...");
  };
  
  const handlePortal = async () => {
    // This would call /api/v1/billing/portal
    alert("Redirecting to Stripe Customer Portal...");
  };

  if (loading) return <div>Loading billing details...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1000px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Billing & Usage</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage your CognitRAG subscription and monitor resource usage.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" onClick={handlePortal}>
            <CreditCard size={16} /> Manage Billing
          </Button>
          <Button variant="primary" onClick={handleUpgrade}>
            Upgrade Plan
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
        
        <Card style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Queries</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Agent Execution</p>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {usage.metrics.queries.used} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {usage.metrics.queries.limit}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--surface-dark)', borderRadius: '3px', marginTop: 'var(--space-3)', overflow: 'hidden' }}>
            <div style={{ width: `${(usage.metrics.queries.used / usage.metrics.queries.limit) * 100}%`, height: '100%', background: 'var(--primary)' }} />
          </div>
        </Card>

        <Card style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--success)15', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Storage</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vector Documents</p>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {usage.metrics.documents.used} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {usage.metrics.documents.limit}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--surface-dark)', borderRadius: '3px', marginTop: 'var(--space-3)', overflow: 'hidden' }}>
            <div style={{ width: `${(usage.metrics.documents.used / usage.metrics.documents.limit) * 100}%`, height: '100%', background: 'var(--success)' }} />
          </div>
        </Card>

        <Card style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--warning)15', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Sub-Agents</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Custom Workflows</p>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {usage.metrics.agents.used} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {usage.metrics.agents.limit}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--surface-dark)', borderRadius: '3px', marginTop: 'var(--space-3)', overflow: 'hidden' }}>
            <div style={{ width: `${(usage.metrics.agents.used / usage.metrics.agents.limit) * 100}%`, height: '100%', background: 'var(--warning)' }} />
          </div>
        </Card>

      </div>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>Current Plan</h3>
        <Card style={{ padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Pro Plan</h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Billing cycle renews on {usage.billing_period}.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>$49<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span></div>
          </div>
        </Card>
      </div>
      
    </div>
  );
}

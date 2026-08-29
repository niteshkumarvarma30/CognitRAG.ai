'use client';
import React from 'react';
import { Card, Button } from '@/components/ui';
import { Shield } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Security & Access</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Manage workspace members, roles, and audit logs.</p>
        </div>
        <Button>Invite Member</Button>
      </div>

      <Card style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Shield size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--border)' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Role-Based Access Control</h3>
        <p style={{ maxWidth: '400px', margin: '0 auto' }}>You are an Admin. More RBAC features will be available after Phase 0.6.</p>
      </Card>
    </div>
  );
}

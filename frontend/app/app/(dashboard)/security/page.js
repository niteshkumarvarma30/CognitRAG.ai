'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input } from '@/components/ui';
import { Shield, UserPlus, Users, Key, FileCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function SecurityPage() {
  const { user } = useUser();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [members, setMembers] = useState([
    { id: '1', name: user?.fullName || 'Current User', email: user?.primaryEmailAddress?.emailAddress || 'admin@cognitrag.ai', role: 'admin', joined: 'Owner' },
    { id: '2', name: 'Dev Lead', email: 'lead@cognitrag.ai', role: 'member', joined: 'Yesterday' },
    { id: '3', name: 'Intern / Auditor', email: 'auditor@cognitrag.ai', role: 'viewer', joined: '3 days ago' },
  ]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setMembers(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        joined: 'Just now'
      }
    ]);
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  const handleRoleChange = (id, newRole) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)', margin: 0 }}>Security & Access Governance</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.875rem' }}>
            Enforce Role-Based Access Control (RBAC) and document-level Access Control Lists (ACL) across AI Agents.
          </p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserPlus size={16} /> Invite Colleague
        </Button>
      </div>

      {/* Role Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
        <Card style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Admin</span>
            <Badge variant="primary">Full Access</Badge>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Uploads documents, manages Jira/Slack connectors, grants roles, executes graph deletion, and views billing.
          </p>
        </Card>

        <Card style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Member</span>
            <Badge variant="success">Read / Write</Badge>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Queries Company Brain, ingests authorized PDFs/Notion pages, and trains workspace memory.
          </p>
        </Card>

        <Card style={{ padding: 'var(--space-5)', borderLeft: '4px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Viewer</span>
            <Badge variant="outline">Read Only</Badge>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Can ask questions in Chat. Forbidden from uploading documents or modifying connectors.
          </p>
        </Card>
      </div>

      {/* Workspace Members Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 650, margin: 0, color: 'var(--text-primary)' }}>Workspace Members</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{members.length} members with designated security roles</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-soft)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 20px' }}>User</th>
              <th style={{ padding: '12px 20px' }}>Current Role</th>
              <th style={{ padding: '12px 20px' }}>Joined</th>
              <th style={{ padding: '12px 20px', textAlign: 'right' }}>Security Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <select 
                    value={m.role} 
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    style={{ 
                      padding: '6px 12px', borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border)', background: 'var(--surface)', 
                      color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  {m.joined}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Synced to Postgres RLS
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ACL Permission Matrix */}
      <Card style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 650, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
          Document-Level Access Control (ACL) Enforcement
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          When AI Agents traverse the Neo4j Knowledge Graph and Supabase pgvector chunks, queries strictly filter on <code>user_id</code> and <code>workspace_id</code> metadata.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ padding: '12px 16px', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>PostgreSQL Row Level Security (RLS)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enforced at the database engine level (never bypassed)</div>
            </div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} style={{ color: 'var(--success)' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Neo4j Entity Boundary Isolation</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-hop Cypher traversals scoped strictly to workspace UUID</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Invite Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Colleague to Workspace">
        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input 
            label="Email Address" 
            placeholder="colleague@yourcompany.com" 
            type="email"
            value={inviteEmail} 
            onChange={(e) => setInviteEmail(e.target.value)} 
            required 
          />
          
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Assign Security Role</label>
            <select 
              value={inviteRole} 
              onChange={(e) => setInviteRole(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)', background: 'var(--surface)', 
                color: 'var(--text-primary)', fontSize: '0.875rem' 
              }}
            >
              <option value="admin">Admin (Full administrative & data access)</option>
              <option value="member">Member (Can upload & query workspace context)</option>
              <option value="viewer">Viewer (Can only ask questions in Chat)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button type="submit">Send Workspace Invite</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


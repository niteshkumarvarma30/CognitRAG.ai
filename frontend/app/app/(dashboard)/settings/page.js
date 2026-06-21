'use client';
import React from 'react';
import { Settings, Users, Shield, Cpu } from 'lucide-react';

export default function Page() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <Settings size={32} color="var(--primary-color)" /> Control Center
      </h1>
      
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Welcome to your <strong>Control Center</strong>. This configuration hub is under construction. When finished, you will use this page to manage the overarching settings of your AI workspace. You will have full control over LLM routing preferences (e.g., forcing open-source vs proprietary models), managing team access, setting system prompts, and defining global security policies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Cpu size={20} /> <h3 style={{ fontWeight: '600' }}>Model Routing</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Override dynamic routing and force specific models (Llama 3, GPT-4, Claude) for different tasks.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Users size={20} /> <h3 style={{ fontWeight: '600' }}>Team Management</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Invite colleagues, assign roles, and manage permissions within your tenant.</p>
        </div>
        <div className="card" style={{ padding: '1.5rem', opacity: '0.6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            <Shield size={20} /> <h3 style={{ fontWeight: '600' }}>Security & Privacy</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure data retention policies, PII redaction, and access logs for your Knowledge Vault.</p>
        </div>
      </div>
    </div>
  );
}

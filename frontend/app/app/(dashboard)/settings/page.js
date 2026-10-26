'use client';
import React, { useState, useEffect } from 'react';
import { Settings, Shield, Cpu, MessageSquare, Database, Key, Check, Copy, CreditCard, Users, ArrowUpRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import RazorpayUpgradeModal from '@/components/billing/RazorpayUpgradeModal';

export default function SettingsPage() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [sarvamEnabled, setSarvamEnabled] = useState(true);
  const [activePlan, setActivePlan] = useState('solo');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('cognitrag_plan');
      if (p) setActivePlan(p);
    }
  }, []);

  const tenantId = user?.id || 'ws_default';

  const copyTenantId = () => {
    navigator.clipboard.writeText(tenantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} style={{ color: 'var(--primary, #38bdf8)' }} /> Workspace Settings
        </h1>
        <p style={{ color: 'var(--text-secondary, #94a3b8)', marginTop: '4px' }}>
          Configure your company brain, subscription plan, Slack bot integration, and language models.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Active Plan & Subscription Tier */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid ' + (activePlan === 'teams' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)'),
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} style={{ color: activePlan === 'teams' ? '#818cf8' : '#10b981' }} /> 
              Subscription Tier: {activePlan === 'teams' ? 'Teams Plan ($99/mo)' : 'Solo Plan ($29/mo)'}
            </h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '6px',
              background: activePlan === 'teams' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: activePlan === 'teams' ? '#a5b4fc' : '#10b981',
              border: '1px solid ' + (activePlan === 'teams' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)')
            }}>
              Active Plan
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Monthly Verified Queries</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                {activePlan === 'teams' ? '15,000 queries' : '2,500 queries'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Reset monthly &bull; Overages blocked</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>User Seats & Collaboration</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                {activePlan === 'teams' ? '5 Included Seats' : '1 Seat (Personal)'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                {activePlan === 'teams' ? '+$15/extra seat &bull; RBAC enabled' : 'Single user workspace'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setUpgradeModalOpen(true)}
              style={{
                backgroundColor: 'var(--ind, #6366f1)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {activePlan === 'teams' ? 'Manage / Renew Subscription' : 'Upgrade Plan with Razorpay'} <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
        {/* Workspace Identity */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: '#38bdf8' }} /> Workspace Identity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Active Tenant ID (PostgreSQL RLS Scope)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  readOnly
                  value={tenantId}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc', fontFamily: 'monospace', fontSize: '0.875rem'
                  }}
                />
                <button
                  onClick={copyTenantId}
                  style={{
                    padding: '8px 14px', borderRadius: '8px',
                    background: copied ? '#10b981' : 'rgba(255,255,255,0.08)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Multilingual & Embedding Engine */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} style={{ color: '#a855f7' }} /> Multilingual Brain Engine
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Hinglish Code-Switched Processing</div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Native Romanized Hindi support via Sarvam AI embedder (never translates before indexing).
              </div>
            </div>
            <input
              type="checkbox"
              checked={sarvamEnabled}
              onChange={(e) => setSarvamEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Slack Bot Integration */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} style={{ color: '#ec4899' }} /> Slack App Configuration
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '12px' }}>
            CognitRAG bot responds to <code>/ask</code> queries directly in your team's Slack channels.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="/integrations"
              style={{
                padding: '8px 16px', borderRadius: '8px', background: '#4a154b',
                color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem'
              }}
            >
              Manage Slack Channels →
            </a>
          </div>
        </div>

        {/* Security & Audit Policies */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: '#10b981' }} /> Citation & Audit Policies
          </h2>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>✓ Strict Claim-Level Auditing: Every generated sentence is mapped to verified source blocks.</div>
            <div>✓ Derivation Tiering: Structured API data receives 1.0 confidence; LLM inferences display score.</div>
            <div>✓ Contradiction Detection: Conflicting statements are never silently merged.</div>
          </div>
        </div>
      </div>

      <RazorpayUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        tenantId={tenantId}
        userEmail={user?.primaryEmailAddress?.emailAddress}
        userName={user?.fullName || user?.firstName}
        onSuccess={(newPlan) => {
          setActivePlan(newPlan);
          setUpgradeModalOpen(false);
        }}
      />
    </div>
  );
}

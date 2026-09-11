'use client';
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Building2, Sparkles, Clock, CheckCircle2, Send, 
  Layers, MessageSquare, Shield, GitPullRequest, ArrowRight
} from 'lucide-react';

export default function EnterpriseBrainDashboardPage() {
  const { user } = useUser();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    company: '',
    teamSize: '50-250',
    integrations: ['Slack', 'Jira'],
    message: ''
  });

  const toggleIntegration = (item) => {
    setFormData(prev => ({
      ...prev,
      integrations: prev.integrations.includes(item)
        ? prev.integrations.filter(i => i !== item)
        : [...prev.integrations, item]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 0 4rem' }}>
      
      {/* Hero Header */}
      <div style={{ 
        textAlign: 'center', marginBottom: '2.5rem',
        padding: '2.5rem 1.5rem', background: 'radial-gradient(ellipse at top, rgba(2, 132, 199, 0.15), transparent 70%)',
        borderRadius: 'var(--radius-xl)', border: '1px solid rgba(2, 132, 199, 0.25)'
      }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          padding: '4px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
          background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', border: '1px solid rgba(2, 132, 199, 0.35)',
          marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          <Clock size={13} /> Coming Soon • Private Enterprise Pilot
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          Enterprise Company Brain
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
          Unify fragmented Slack threads, Jira tickets, Notion wikis, and GitHub commits into a single, verified, 100% auditable knowledge graph with Hinglish NLP understanding.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem' }}>
        
        {/* Sneak Peek & Capabilities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#0284c7' }} /> What We're Launching In Private Pilot
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Colloquial Hinglish NLP', desc: 'Accurately resolves informal bilingual Slack discussions into verified technical SOPs.' },
                { title: 'Cross-Silo Graph Lineage', desc: 'Links customer bug reports to Jira epics, PR diffs, and AWS post-mortems in Neo4j.' },
                { title: 'Multi-Tenant Zero Collision', desc: 'Dedicated isolated compound schema (ws_ent_*) with encrypted RBAC permissions.' },
                { title: 'Audited Faithfulness Engine', desc: 'Dual-judge verification pipeline ensuring zero hallucinated business metrics.' }
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 650, color: 'var(--text-primary)' }}>{feat.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', background: 'var(--surface-soft)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Already have an Enterprise SLA?
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              If your organization has signed a private pilot contract, please reach out to your dedicated Solutions Architect or mention your contract ID in the form.
            </p>
          </div>
        </div>

        {/* Contact & Early Access Form */}
        <div style={{ 
          padding: '1.75rem', background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' 
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Pilot Request Received!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto 20px' }}>
                Thank you, <strong>{formData.name || 'Team'}</strong>. Your request for <strong>Enterprise Company Brain</strong> has been priority-queued. Our engineering team will contact you at <strong>{formData.email}</strong> within 24 hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                style={{ 
                  padding: '8px 18px', borderRadius: '8px', background: 'var(--surface-soft)', 
                  border: '1px solid var(--border)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' 
                }}
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  Request Enterprise Pilot Access
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Be the first to connect your team's knowledge stack.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Work Email Address
                </label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Company / Organization
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Team Size
                  </label>
                  <select 
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="10-50">10 - 50 members</option>
                    <option value="50-250">50 - 250 members</option>
                    <option value="250-1000">250 - 1,000 members</option>
                    <option value="1000+">1,000+ members</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Target Connectors to Pilot
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Slack', 'Jira', 'GitHub', 'Notion', 'Confluence', 'Google Drive'].map(item => {
                    const isChecked = formData.integrations.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleIntegration(item)}
                        style={{ 
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                          background: isChecked ? 'rgba(2, 132, 199, 0.15)' : 'var(--surface-soft)',
                          color: isChecked ? '#0284c7' : 'var(--text-secondary)',
                          border: isChecked ? '1px solid #0284c7' : '1px solid var(--border)'
                        }}
                      >
                        {isChecked ? '✓ ' : '+ '}{item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Specific Requirements or Notes
                </label>
                <textarea 
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your knowledge silos, compliance needs, or rollout timeline..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '12px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff',
                  border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                  marginTop: '6px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                }}
              >
                {loading ? 'Submitting Request...' : (
                  <>Submit Pilot Access Request <Send size={15} /></>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}

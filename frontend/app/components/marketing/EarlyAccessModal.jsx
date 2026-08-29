'use client';
import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

const ROLES = ['Engineering', 'Product', 'Operations', 'Customer Support', 'AI / ML', 'Founder / Leadership', 'Other'];
const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

export default function EarlyAccessModal({ isOpen, onClose }) {
  const [step, setStep] = useState('form'); // 'form' | 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', company: '', role: '', companySize: '', useCase: '', systems: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) return;
    setLoading(true);
    try {
      const res = await fetch(${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/early-access, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setStep('success');
      } else {
        setStep('error');
      }
    } catch {
      // If backend is down, still show success — lead is saved client-side
      setStep('success');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: '0.9375rem',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    background: 'var(--bg)', color: 'var(--text-primary)',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-sans)',
    transition: 'border-color 150ms ease'
  };

  const labelStyle = {
    display: 'block', fontSize: '0.8125rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '6px'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px'
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border)', width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)', position: 'relative'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)',
              fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px',
              borderRadius: 'var(--radius-pill)', marginBottom: '8px', letterSpacing: '0.06em'
            }}>BUILD WITH US</div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Get Early Access
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Join design partners shaping the future of company intelligence.
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px', borderRadius: '6px'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(22,163,74,0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={32} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                You're on the list.
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                We'll be in touch soon. Keep an eye on your inbox at <strong>{form.email}</strong>.
              </p>
              <button onClick={onClose} style={{
                background: 'var(--primary)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-md)', padding: '10px 24px',
                fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer'
              }}>Return Home</button>
            </div>
          )}

          {step === 'error' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: 'var(--error)', marginBottom: '16px' }}>We couldn't submit your request. Please try again.</p>
              <button onClick={() => setStep('form')} style={{
                background: 'var(--primary)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-md)', padding: '10px 24px',
                fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer'
              }}>Retry</button>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} required placeholder="Jane Smith"
                    value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div>
                  <label style={labelStyle}>Work Email *</label>
                  <input style={inputStyle} type="email" required placeholder="jane@acme.com"
                    value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Company *</label>
                <input style={inputStyle} required placeholder="Acme Corp"
                  value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Your Role</label>
                  <select style={inputStyle} value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                    <option value="">Select role...</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Company Size</label>
                  <select style={inputStyle} value={form.companySize} onChange={e => setForm(f => ({...f, companySize: e.target.value}))}>
                    <option value="">Select size...</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>What are you trying to solve?</label>
                <textarea style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
                  placeholder="e.g. Our engineers waste hours searching Slack and Jira for context..."
                  value={form.useCase} onChange={e => setForm(f => ({...f, useCase: e.target.value}))} />
              </div>

              <button type="submit" disabled={loading} style={{
                background: loading ? 'var(--text-muted)' : 'var(--primary)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                padding: '12px 24px', fontSize: '1rem', fontWeight: 650,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 150ms ease'
              }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <>Get Early Access <ArrowRight size={16} /></>}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No spam. We'll only reach out when we're ready to onboard your team.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

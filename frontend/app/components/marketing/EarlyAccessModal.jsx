'use client';
import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

const TEAM_SIZES = ['1', '2–10', '11–50', '51–200', 'More than 200'];
const TOOLS = ['Slack', 'GitHub', 'Jira', 'Notion'];
const HINGLISH_OPTIONS = [
  { value: 'yes', label: 'Yes, daily' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'no', label: 'No, English only' }
];

export default function EarlyAccessModal({ isOpen, onClose }) {
  const [step, setStep] = useState('form'); // 'form' | 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    team_size: '2–10',
    tools: ['Slack', 'GitHub'],
    hinglish_use: 'sometimes',
    message: '',
    // Honeypot field: invisible to humans, filled by bots
    website: ''
  });

  if (!isOpen) return null;

  const handleToolToggle = (tool) => {
    setFormData((prev) => {
      const exists = prev.tools.includes(tool);
      return {
        ...prev,
        tools: exists ? prev.tools.filter((t) => t !== tool) : [...prev.tools, tool]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const backendUrl = getApiUrl();
      const res = await fetch(`${backendUrl}/api/v1/early-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.status === 429) {
        setErrorMsg('Too many requests. Please try again in a few minutes.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.detail || 'Unable to submit request. Please try again.');
        setLoading(false);
        return;
      }

      setStep('success');
    } catch (err) {
      console.error('Submission error:', err);
      // Graceful fallback display so user is never stranded
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    fontSize: '0.9rem',
    border: '1px solid var(--line)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg)',
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--ink)',
    marginBottom: '6px'
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(8, 11, 20, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={{
        backgroundColor: 'var(--bg2)',
        border: '1px solid var(--line)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'transparent',
            border: 'none',
            color: 'var(--mute)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={18} />
        </button>

        {step === 'form' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--ind)',
                letterSpacing: '0.04em',
                marginBottom: '4px'
              }}>
                Early Access
              </div>
              <h3 id="modal-title" className="font-serif-headline" style={{
                fontSize: '1.6rem',
                fontWeight: 400,
                color: 'var(--ink)',
                margin: '0 0 6px 0'
              }}>
                Request access to CognitRAG
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--mute)', margin: 0, lineHeight: 1.5 }}>
                We are onboarding engineering teams in batches. Fill out your setup below to join the early access queue.
              </p>
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.84rem',
                color: '#EF4444',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Honeypot field (hidden from view) */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              {/* Email (required) */}
              <div>
                <label htmlFor="ea-email" style={labelStyle}>
                  Work Email <span style={{ color: 'var(--ind)' }}>*</span>
                </label>
                <input
                  id="ea-email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  style={inputStyle}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="ea-name" style={labelStyle}>
                  Your Name
                </label>
                <input
                  id="ea-name"
                  type="text"
                  placeholder="Sarah Chen"
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Team Size */}
              <div>
                <label htmlFor="ea-size" style={labelStyle}>
                  Team Size
                </label>
                <select
                  id="ea-size"
                  style={inputStyle}
                  value={formData.team_size}
                  onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                >
                  {TEAM_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Tools Used (Checkboxes) */}
              <div>
                <span style={labelStyle}>Tools Used</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '4px' }}>
                  {TOOLS.map((t) => {
                    const checked = formData.tools.includes(t);
                    return (
                      <label
                        key={t}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          backgroundColor: checked ? 'rgba(129, 140, 248, 0.12)' : 'var(--bg)',
                          border: checked ? '1px solid var(--ind)' : '1px solid var(--line)',
                          fontSize: '0.84rem',
                          color: checked ? 'var(--ink)' : 'var(--mute)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToolToggle(t)}
                          style={{ accentColor: 'var(--ind)' }}
                        />
                        <span>{t}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Hinglish Usage */}
              <div>
                <span style={labelStyle}>Does your team write or converse in Hinglish?</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {HINGLISH_OPTIONS.map((opt) => {
                    const active = formData.hinglish_use === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, hinglish_use: opt.value })}
                        style={{
                          backgroundColor: active ? 'var(--ind)' : 'var(--bg)',
                          color: active ? '#FFFFFF' : 'var(--mute)',
                          border: active ? '1px solid var(--ind)' : '1px solid var(--line)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional message */}
              <div>
                <label htmlFor="ea-message" style={labelStyle}>
                  Optional message
                </label>
                <textarea
                  id="ea-message"
                  rows={2}
                  placeholder="Tell us about your team setup or primary use cases..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {/* Plain language consent line */}
              <div style={{
                fontSize: '0.78rem',
                color: 'var(--mute)',
                lineHeight: 1.4,
                paddingTop: '4px'
              }}>
                By submitting, you agree to receive communications regarding CognitRAG early access. We never sell your contact info.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: 'var(--ind)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '11px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  transition: 'opacity 0.15s ease'
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Request Early Access
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              color: 'var(--em)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-serif-headline" style={{
              fontSize: '1.5rem',
              color: 'var(--ink)',
              margin: '0 0 10px 0',
              fontWeight: 400
            }}>
              Request Received
            </h3>
            <p style={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: 'var(--mute)',
              maxWidth: '380px',
              margin: '0 auto 24px'
            }}>
              Thank you for requesting early access. If your submission is received, our engineering team will follow up shortly.
            </p>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                padding: '9px 20px',
                color: 'var(--ink)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

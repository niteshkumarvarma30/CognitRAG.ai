'use client';
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  FileText, Sparkles, Clock, CheckCircle2, Send, 
  Mic, Languages, Building, ShieldCheck, ArrowRight
} from 'lucide-react';

export default function BharatIntelligenceDashboardPage() {
  const { user } = useUser();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    organization: '',
    docVolume: '5,000 - 25,000 pages/mo',
    languages: ['Hindi', 'Tamil', 'Telugu'],
    message: ''
  });

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
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
        padding: '2.5rem 1.5rem', background: 'radial-gradient(ellipse at top, rgba(217, 119, 6, 0.15), transparent 70%)',
        borderRadius: 'var(--radius-xl)', border: '1px solid rgba(217, 119, 6, 0.25)'
      }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          padding: '4px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
          background: 'rgba(217, 119, 6, 0.15)', color: '#f59e0b', border: '1px solid rgba(217, 119, 6, 0.35)',
          marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          <Clock size={13} /> Coming Soon • Sarvam AI Pilot Program
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          Bharat Document Intelligence
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
          Digitize degraded bilingual invoices, stamp-paper deeds, and regulatory circulars with Sarvam Document OCR and 2-way spoken voice QA across 10+ Indian languages.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem' }}>
        
        {/* Capabilities Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#d97706' }} /> Built For Indian BFSI, Legal & MSMEs
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Sarvam Vision Document OCR', desc: 'Recovers degraded low-DPI receipts, watermarked judicial records, and regional GST filings with 99.4% accuracy.' },
                { title: 'Saaras & Bulbul Indic Voice RAG', desc: 'Ask naturally in Hindi, Tamil, Telugu, or Bengali and receive conversational audio explanations.' },
                { title: 'WhatsApp Multi-Modal Flow', desc: 'Field agents can snap a document picture on WhatsApp and get instantaneous verified policy answers.' },
                { title: 'Zero Collision Isolation', desc: 'Strict tenancy scoping (ws_bharat_*) guarantees bank-grade data security.' }
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(217, 119, 6, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
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
              Sarvam AI Partnership Sandbox
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Early pilot organizations receive priority API quotas for Sarvam Saaras ASR and Bulbul TTS endpoints with zero rate-limit throttles.
            </p>
          </div>
        </div>

        {/* Pilot Request Form */}
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
                Waitlist Request Submitted!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto 20px' }}>
                Dhanyavaad, <strong>{formData.name || 'Partner'}</strong>! Your priority access request for <strong>Bharat Document Intelligence</strong> is confirmed. We will reach out to <strong>{formData.email}</strong> with pilot credentials.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                style={{ 
                  padding: '8px 18px', borderRadius: '8px', background: 'var(--surface-soft)', 
                  border: '1px solid var(--border)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' 
                }}
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  Request Bharat Intelligence Pilot
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Early access for Indian enterprises, banks, and legal firms.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Your Name
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Nair"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@firm.in"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Phone / WhatsApp (Optional)
                  </label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Organization / Firm
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Bharat Logistics Ltd"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Monthly Page Volume
                  </label>
                  <select 
                    value={formData.docVolume}
                    onChange={(e) => setFormData({ ...formData, docVolume: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="< 5,000 pages">&lt; 5,000 pages/mo</option>
                    <option value="5,000 - 25,000 pages/mo">5,000 - 25,000 pages/mo</option>
                    <option value="25,000 - 100,000 pages/mo">25,000 - 100,000 pages/mo</option>
                    <option value="100,000+ pages">100,000+ pages/mo</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Target Regional Languages
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Hindi', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Bengali', 'Kannada', 'Malayalam', 'Punjabi', 'Odia'].map(lang => {
                    const isChecked = formData.languages.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        style={{ 
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                          background: isChecked ? 'rgba(217, 119, 6, 0.15)' : 'var(--surface-soft)',
                          color: isChecked ? '#d97706' : 'var(--text-secondary)',
                          border: isChecked ? '1px solid #d97706' : '1px solid var(--border)'
                        }}
                      >
                        {isChecked ? '✓ ' : '+ '}{lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Document Formats & Details
                </label>
                <textarea 
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. Scanned GST circulars, physical receipts, Hindi customer support voice notes..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-soft)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '12px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff',
                  border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                  marginTop: '4px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
                }}
              >
                {loading ? 'Submitting...' : (
                  <>Request Pilot Access <Send size={15} /></>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}

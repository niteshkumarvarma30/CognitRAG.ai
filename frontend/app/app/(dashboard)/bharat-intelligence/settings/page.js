'use client';
import React from 'react';
import Link from 'next/link';
import { 
  FileText, ArrowLeft, CheckCircle2, Globe2, 
  Cpu, Users, ShieldCheck, Mail, ExternalLink, Headphones
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function BharatSettingsPage() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: 44, height: 44, borderRadius: '12px', 
            background: 'rgba(217, 119, 6, 0.12)', color: '#d97706', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Bharat Document Intelligence Settings
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Sarvam AI model quotas, Indian language support, and document digitization configuration.
            </p>
          </div>
        </div>

        <Link
          href="/bharat-intelligence"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'var(--surface-soft)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> Back to Pilot Overview
        </Link>
      </div>

      {/* Grid of Settings Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Sarvam AI Quota Card */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(217, 119, 6, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Sarvam AI Infrastructure</h3>
              <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Zero Rate-Limit Pilot Quota</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Includes priority access to Sarvam Saaras Speech-to-Text and Bulbul Text-to-Speech engines for natural Indian accent recognition across degraded audio and documents.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
            <CheckCircle2 size={14} /> Full Indic Model Access Active
          </div>
        </div>

        {/* Lead Account Card */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Pilot Lead</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organization Contact</span>
            </div>
          </div>
          <div style={{ background: 'var(--surface-soft)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-primary)' }}>{user?.fullName || 'Pilot Lead'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{userEmail}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Role: <span style={{ fontWeight: 700, color: '#d97706' }}>Bharat Pilot Partner</span>
          </div>
        </div>

        {/* Supported Languages */}
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe2 size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Supported Indic Languages</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10 Official Regional Languages</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['Hindi (हिंदी)', 'Tamil (தமிழ்)', 'Telugu (తెలుగు)', 'Marathi (मराठी)', 'Gujarati (ગુજરાતી)', 'Kannada (ಕನ್ನಡ)', 'Bengali (বাংলা)', 'Malayalam (മലയാളം)', 'Punjabi (ਪੰਜਾਬੀ)', 'Odia (ଓଡ଼ିଆ)'].map((lang) => (
              <span key={lang} style={{ 
                fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', 
                borderRadius: '6px', background: 'var(--surface-soft)', 
                border: '1px solid var(--border)', color: 'var(--text-secondary)' 
              }}>
                {lang}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Compliance Box */}
      <div style={{ 
        background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.25)', 
        borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              DPDP Act 2023 & RBI Localization Guaranteed
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              All documents, vector indexes, and voice streams reside exclusively in AWS Mumbai (ap-south-1).
            </div>
          </div>
        </div>

        <a
          href="mailto:bharat@cognitrag.ai?subject=Bharat Pilot Inquiry"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 18px', borderRadius: '8px',
            background: '#d97706', color: '#ffffff',
            fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none'
          }}
        >
          Contact Bharat Desk <ExternalLink size={14} />
        </a>
      </div>

    </div>
  );
}

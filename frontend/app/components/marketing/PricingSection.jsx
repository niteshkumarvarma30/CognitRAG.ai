'use client';
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingSection({ onOpenEarlyAccess }) {
  const plans = [
    {
      name: 'Solo',
      badge: 'Early Access',
      price: 'Free while in early access',
      desc: 'For individual engineers exploring verified answers across connected team tools.',
      features: [
        'Slack, GitHub, Jira and Notion connectors',
        'Verified source chips with every answer',
        'Hinglish & English query support',
        'Direct citation and conflict inspection'
      ],
      ctaText: 'Get early access',
      isPrimary: false
    },
    {
      name: 'Teams',
      badge: 'Pilot Program',
      price: 'Talk to us',
      desc: 'For engineering organizations needing tenant-isolated deployments and workspace governance.',
      features: [
        'Everything in Solo',
        'Tenant-isolated database and vector namespaces',
        'Admin-configured audience rules for Jira & Notion',
        'Query audit logs and priority onboarding'
      ],
      ctaText: 'Talk to us',
      isPrimary: true
    }
  ];

  return (
    <section id="plans" style={{
      padding: '64px 0',
      backgroundColor: 'var(--bg)'
    }}>
      <div className="landing-container">
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--ind)',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            Plans
          </div>
          <h2 className="font-serif-headline" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--ink)',
            margin: '0 0 10px 0',
            fontWeight: 400
          }}>
            Simple access. No unproven tiers.
          </h2>
          <p style={{
            color: 'var(--mute)',
            fontSize: '1rem',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            We are currently in private early access. Connect with us to run CognitRAG on your team&apos;s workspace.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '820px',
          margin: '0 auto'
        }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                backgroundColor: 'var(--bg2)',
                border: plan.isPrimary ? '1.5px solid var(--ind)' : '1px solid var(--line)',
                borderRadius: '12px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  {plan.name}
                </h3>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: plan.isPrimary ? 'rgba(129, 140, 248, 0.15)' : 'var(--bg)',
                  color: plan.isPrimary ? 'var(--ind)' : 'var(--mute)',
                  border: '1px solid var(--line)'
                }}>
                  {plan.badge}
                </span>
              </div>

              <div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  marginBottom: '6px'
                }}>
                  {plan.price}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--mute)', margin: 0, lineHeight: 1.5 }}>
                  {plan.desc}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid var(--line)',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                flex: 1
              }}>
                {plan.features.map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--ink)' }}>
                    <Check size={16} style={{ color: 'var(--em)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onOpenEarlyAccess}
                style={{
                  backgroundColor: plan.isPrimary ? 'var(--ind)' : 'transparent',
                  color: plan.isPrimary ? '#FFFFFF' : 'var(--ink)',
                  border: plan.isPrimary ? 'none' : '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'opacity 0.15s ease'
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
              >
                {plan.ctaText}
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

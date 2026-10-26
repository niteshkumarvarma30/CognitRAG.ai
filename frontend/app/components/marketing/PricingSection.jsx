'use client';
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingSection({ onOpenEarlyAccess }) {
  const plans = [
    {
      name: 'Solo',
      badge: 'Individual',
      price: '$29',
      period: '/ month',
      desc: 'For solo founders, tech leads, and developers indexing their workspace knowledge.',
      features: [
        '1 User Seat',
        '2,500 verified queries / month',
        'Connect Slack, GitHub, Jira & Notion',
        'Hinglish & English query understanding',
        'Claim-level citation receipts with deep links',
        'Standard email support'
      ],
      ctaText: 'Start Solo Trial',
      href: '/sign-up?plan=solo',
      signInHref: '/sign-in?plan=solo',
      isPrimary: false
    },
    {
      name: 'Teams',
      badge: 'Most Popular',
      price: '$99',
      period: '/ month',
      desc: 'For growing engineering and product teams requiring org-wide knowledge governance.',
      features: [
        '5 User Seats included (+$15/extra seat)',
        '15,000 verified queries / month',
        'Everything in Solo plan',
        'Tenant-isolated database & Neo4j graph',
        'Role-Based Access Control (RBAC) governance',
        'Priority Slack & email support'
      ],
      ctaText: 'Start Teams Trial',
      href: '/sign-up?plan=teams',
      signInHref: '/sign-in?plan=teams',
      isPrimary: true
    },
    {
      name: 'Enterprise',
      badge: 'Custom',
      price: 'Contact Us',
      period: '',
      desc: 'For organizations needing custom VPC isolation, custom SLAs, and enterprise compliance.',
      features: [
        'Unlimited seats & custom query limits',
        'Dedicated GCP VPC & private deployment',
        'Custom SSO (Okta, Azure AD, Google)',
        'Enterprise SLA & 99.9% uptime guarantee',
        'SOC2 audit assistance & custom DPA',
        'Dedicated onboarding engineer'
      ],
      ctaText: 'Contact for Demo',
      href: null,
      signInHref: '/sign-in?plan=enterprise',
      isPrimary: false,
      isContact: true
    }
  ];

  return (
    <section id="plans" style={{
      padding: '72px 0',
      backgroundColor: 'var(--bg)'
    }}>
      <div className="landing-container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--ind)',
            letterSpacing: '0.04em',
            marginBottom: '8px'
          }}>
            Transparent Pricing
          </div>
          <h2 className="font-serif-headline" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            color: 'var(--ink)',
            margin: '0 0 10px 0',
            fontWeight: 400
          }}>
            Built for modern engineering teams.
          </h2>
          <p style={{
            color: 'var(--mute)',
            fontSize: '1rem',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            Choose the plan that fits your company size. Every plan includes all 4 integrations and full citation receipts.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '1100px',
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
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  marginBottom: '6px'
                }}>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--ink)'
                  }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ fontSize: '0.9rem', color: 'var(--mute)' }}>
                      {plan.period}
                    </span>
                  )}
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

              {/* Sleek Action Button: Sign Up / Log In */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => {
                    if (plan.href) {
                      window.location.href = plan.href;
                    } else {
                      onOpenEarlyAccess();
                    }
                  }}
                  style={{
                    backgroundColor: plan.isPrimary ? 'var(--ind)' : 'var(--bg2)',
                    color: plan.isPrimary ? '#FFFFFF' : 'var(--ink)',
                    border: plan.isPrimary ? 'none' : '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    fontSize: '0.92rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: plan.isPrimary ? '0 4px 16px rgba(129, 140, 248, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    if (!plan.isPrimary) {
                      e.currentTarget.style.borderColor = 'var(--ind)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    if (!plan.isPrimary) {
                      e.currentTarget.style.borderColor = 'var(--line)';
                    }
                  }}
                >
                  {plan.isContact ? 'Contact for Demo' : 'Sign Up / Log In'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px', fontSize: '0.92rem', color: 'var(--mute)' }}>
          Need a custom quote, annual invoice, or have enterprise queries? Email our team at{' '}
          <a 
            href="mailto:niteshkumarvarma@cognitrag.com" 
            style={{ color: 'var(--ind)', fontWeight: 600, textDecoration: 'none' }}
          >
            niteshkumarvarma@cognitrag.com
          </a>
        </div>
      </div>
    </section>
  );
}

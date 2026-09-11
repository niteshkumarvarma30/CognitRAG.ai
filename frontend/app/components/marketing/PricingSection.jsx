'use client';
import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function PricingSection({ onEarlyAccess }) {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Solo',
      tagline: 'Perfect for individual builders and developers getting started with AI-powered productivity.',
      monthlyPrice: 0,
      annualPrice: 0,
      period: 'free forever',
      ctaText: 'Get started free',
      highlighted: false,
      features: [
        '1 connected workspace',
        'Up to 5 integrations',
        '100 AI tasks / month',
        'Basic memory (30 days)',
        'Email + calendar workflows',
        'REST API & Python SDK',
        'Community support'
      ]
    },
    {
      name: 'Pro',
      tagline: 'The full CognitRAG experience for professionals who want a true AI partner in their work.',
      monthlyPrice: 49,
      annualPrice: 39,
      period: 'per month, billed monthly',
      ctaText: 'Get started free',
      highlighted: true,
      popularBadge: 'MOST POPULAR',
      features: [
        '1 connected workspace',
        'Up to 15 integrations',
        'Unlimited AI tasks / month',
        'Long-term memory (forever)',
        'All workflow templates',
        'Custom workflows & automations',
        'Priority 24/7 support',
        'Team features & live audit'
      ]
    },
    {
      name: 'Teams',
      tagline: 'For growing teams that want shared intelligence, role-based access, and enterprise SLAs.',
      monthlyPrice: 89,
      annualPrice: 79,
      period: 'per seat / month',
      ctaText: 'Talk to sales',
      highlighted: false,
      features: [
        'Multi-seat workspace',
        'Unlimited integrations',
        'Unlimited AI tasks / month',
        'Long-term memory (forever)',
        'Custom fine-tuned embeddings',
        'Custom workflows & integrations',
        'Dedicated account manager',
        'SOC-2 Type II & HIPAA compliance'
      ]
    }
  ];

  return (
    <section id="pricing" style={{
      padding: 'var(--space-24, 96px) var(--space-6, 24px)',
      background: 'var(--bg)',
      scrollMarginTop: '80px',
    }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12, 48px)' }}>
          <div style={{ 
            display: 'inline-block', 
            fontSize: '0.75rem', 
            fontWeight: 800,
            letterSpacing: '0.06em', 
            textTransform: 'uppercase', 
            color: '#EA580C',
            background: 'rgba(234, 88, 12, 0.1)',
            padding: '4px 14px',
            borderRadius: '999px',
            marginBottom: 'var(--space-3, 12px)',
          }}>
            Pricing
          </div>

          <h2 style={{ 
            fontSize: '2.75rem', 
            fontWeight: 850, 
            letterSpacing: '-0.035em', 
            color: 'var(--text-primary)', 
            marginBottom: 'var(--space-4, 16px)' 
          }}>
            Simple, transparent pricing. No surprises.
          </h2>

          <p style={{ 
            fontSize: '1.0625rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '560px', 
            margin: '0 auto', 
            lineHeight: 1.6 
          }}>
            Start free, scale as you grow. Every plan includes core features—upgrade when you need more power or seats.
          </p>

          {/* Billing Cycle Toggle */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius-pill)', 
            padding: '4px',
            marginTop: '28px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <button
              onClick={() => setIsAnnual(false)}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: !isAnnual ? 'var(--primary)' : 'transparent',
                color: !isAnnual ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 650,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: isAnnual ? 'var(--primary)' : 'transparent',
                color: isAnnual ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 650,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Annual</span>
              <span style={{
                background: isAnnual ? '#22c55e' : 'rgba(34, 197, 94, 0.15)',
                color: isAnnual ? '#ffffff' : '#15803d',
                fontSize: '0.6875rem',
                fontWeight: 750,
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.02em'
              }}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', 
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {plans.map((plan, i) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div 
                key={i} 
                style={{
                  background: 'var(--surface)',
                  border: plan.highlighted ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-2xl)',
                  padding: '36px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: plan.highlighted ? '0 12px 36px rgba(99, 91, 255, 0.18)' : 'var(--shadow-sm)',
                  position: 'relative',
                  transform: plan.highlighted ? 'scale(1.02)' : 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Most Popular Badge */}
                {plan.popularBadge && (
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #635bff, #06b6d4)',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    padding: '4px 16px',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: '0 4px 12px rgba(99, 91, 255, 0.4)'
                  }}>
                    {plan.popularBadge}
                  </div>
                )}

                <div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 800, 
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}>
                    {plan.name}
                  </h3>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem', 
                    lineHeight: 1.5,
                    marginBottom: '24px',
                    minHeight: '40px'
                  }}>
                    {plan.tagline}
                  </p>

                  {/* Price Box */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'baseline', 
                    gap: '6px',
                    marginBottom: '8px' 
                  }}>
                    <span style={{ 
                      fontSize: '3.25rem', 
                      fontWeight: 850, 
                      letterSpacing: '-0.04em',
                      color: 'var(--text-primary)',
                      lineHeight: 1
                    }}>
                      {typeof price === 'number' ? `$${price}` : price}
                    </span>
                    {typeof price === 'number' && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 550 }}>
                        / month
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: 'var(--text-muted)', 
                    marginBottom: '28px' 
                  }}>
                    {typeof price === 'number' && price > 0 ? (isAnnual ? 'Billed annually ($948/year)' : 'Billed monthly') : plan.period}
                  </div>

                  {/* Feature Checklist */}
                  <div style={{ 
                    borderTop: '1px solid var(--border)', 
                    paddingTop: '24px',
                    marginBottom: '32px' 
                  }}>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      color: 'var(--text-primary)', 
                      marginBottom: '16px' 
                    }}>
                      What's Included:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {plan.features.map((feat, fIndex) => (
                        <li key={fIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          <Check size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA */}
                <button
                  onClick={onEarlyAccess}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: plan.highlighted ? 'none' : '1px solid var(--border)',
                    background: plan.highlighted ? 'var(--primary)' : 'var(--surface)',
                    color: plan.highlighted ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: plan.highlighted ? '0 4px 16px rgba(99, 91, 255, 0.35)' : 'var(--shadow-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    if (plan.highlighted) e.currentTarget.style.background = 'var(--primary-hover)';
                    else e.currentTarget.style.borderColor = 'var(--text-primary)';
                  }}
                  onMouseOut={(e) => {
                    if (plan.highlighted) e.currentTarget.style.background = 'var(--primary)';
                    else e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Reassurance Footer */}
        <div style={{ 
          marginTop: '48px', 
          textAlign: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '24px',
          flexWrap: 'wrap',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#16a34a" /> 14-day free trial on Pro
          </span>
          <span>•</span>
          <span>No credit card required to start</span>
          <span>•</span>
          <span>Export Neo4j graphs anytime (Zero vendor lock-in)</span>
        </div>

      </div>
    </section>
  );
}

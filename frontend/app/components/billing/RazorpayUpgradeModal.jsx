'use client';
import React, { useState } from 'react';
import { X, Check, Zap, Shield, ArrowRight, Sparkles, CreditCard, Loader2 } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

const getApiBase = () => `${getApiUrl()}/api/v1`;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function RazorpayUpgradeModal({
  isOpen,
  onClose,
  tenantId,
  userEmail,
  userName,
  quotaInfo,
  onSuccess
}) {
  const [selectedPlan, setSelectedPlan] = useState('solo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const planOptions = [
    {
      id: 'solo',
      name: 'Solo Plan',
      price: '₹2,499',
      period: '/month',
      badge: 'Popular',
      queries: '2,500 verified queries/mo',
      features: [
        '2,500 Verified Hybrid CRAG queries',
        '1 Workspace Seat',
        'Full claim citations & confidence scores',
        'Google Drive & PDF ingestion'
      ]
    },
    {
      id: 'teams',
      name: 'Teams Plan',
      price: '₹7,999',
      period: '/month',
      badge: 'Best Value',
      queries: '15,000 verified queries/mo',
      features: [
        '15,000 Verified queries/mo',
        '5 Included Team Seats',
        'Slack Bot (/ask), Jira & GitHub Bots',
        'Role-Based Access Control (RBAC)'
      ]
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // 1. Create order on backend
      const res = await fetch(`${getApiBase()}/billing/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId || 'ws_default',
          plan: selectedPlan,
          user_email: userEmail || ''
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create Razorpay checkout order');
      }

      const orderData = await res.json();

      // 2. Open Razorpay Checkout Window
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'CognitRAG',
        description: `Upgrade to ${orderData.plan_name || selectedPlan.toUpperCase()}`,
        order_id: orderData.order_id,
        prefill: {
          name: userName || '',
          email: userEmail || ''
        },
        theme: {
          color: '#38bdf8'
        },
        handler: async function (response) {
          try {
            // 3. Verify payment signature on backend
            const verifyRes = await fetch(`${getApiBase()}/billing/razorpay/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tenant_id: tenantId || 'ws_default',
                plan: selectedPlan,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed on server.');
            }

            // Successfully upgraded
            if (typeof window !== 'undefined') {
              localStorage.setItem('cognitrag_plan', selectedPlan);
            }

            if (onSuccess) {
              onSuccess(selectedPlan);
            }
            onClose();
          } catch (err) {
            setErrorMessage(err.message || 'Verification failed after payment');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setIsProcessing(false);
        setErrorMessage(response.error?.description || 'Payment was declined or cancelled.');
      });
      razorpayInstance.open();

    } catch (err) {
      console.error('[Razorpay Checkout Error]:', err);
      setErrorMessage(err.message || 'Payment initiation failed.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#0B132B',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
        overflow: 'hidden',
        color: '#F8FAFC',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '10px'
            }}>
              <Zap size={13} />
              {quotaInfo?.used !== undefined ? 'QUERY LIMIT REACHED' : 'UPGRADE WORKSPACE'}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
              Unlock Unlimited Verified Knowledge
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', marginTop: '4px', margin: 0 }}>
              {quotaInfo?.message || 'You have reached your free plan limit. Upgrade to continue asking verified questions.'}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Plan Cards */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {planOptions.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.08)'}`,
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{plan.name}</span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#04101E' : '#94A3B8'
                    }}>
                      {plan.badge}
                    </span>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38BDF8' }}>{plan.price}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{plan.period}</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '6px', fontWeight: 600 }}>
                    {plan.queries}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature List for Selected Plan */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
              What&apos;s included in {selectedPlan.toUpperCase()}:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(planOptions.find(p => p.id === selectedPlan)?.features || []).map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#E2E8F0' }}>
                  <Check size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '0.82rem'
            }}>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748B' }}>
            <Shield size={14} style={{ color: '#10B981' }} />
            <span>Secured by Razorpay &bull; UPI & Cards Accepted</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            style={{
              backgroundColor: '#38BDF8',
              color: '#04101E',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 750,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)',
              transition: 'opacity 0.15s ease',
              opacity: isProcessing ? 0.7 : 1
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Pay {selectedPlan === 'solo' ? '₹2,499' : '₹7,999'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

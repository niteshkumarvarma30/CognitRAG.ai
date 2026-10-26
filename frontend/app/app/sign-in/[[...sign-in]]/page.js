'use client';
import React, { Suspense, useEffect } from 'react';
import { SignIn } from "@clerk/nextjs";

import { useSearchParams, useRouter } from 'next/navigation';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedPlan = searchParams.get('plan') || 'teams';

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedPlan) {
      localStorage.setItem('cognitrag_plan', selectedPlan);
    }
  }, [selectedPlan]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg, #090d16)',
      padding: '24px'
    }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
          🧠 CognitRAG.ai
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9375rem', marginBottom: '14px' }}>
          Multilingual GraphRAG Company Brain
        </p>

        {/* Solo vs Teams Tier Toggle */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          gap: '4px'
        }}>
          <button
            onClick={() => router.push('/sign-in?plan=solo')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: selectedPlan === 'solo' ? 700 : 500,
              color: selectedPlan === 'solo' ? '#FFFFFF' : '#94a3b8',
              backgroundColor: selectedPlan === 'solo' ? 'var(--ind, #6366f1)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Solo ($29/mo)
          </button>
          <button
            onClick={() => router.push('/sign-in?plan=teams')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: selectedPlan === 'teams' ? 700 : 500,
              color: selectedPlan === 'teams' ? '#FFFFFF' : '#94a3b8',
              backgroundColor: selectedPlan === 'teams' ? 'var(--ind, #6366f1)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Teams ($99/mo)
          </button>
        </div>
      </div>

      <SignIn 
        path="/sign-in" 
        routing="path" 
        signUpUrl={`/sign-up?plan=${selectedPlan}`} 
        forceRedirectUrl="/home" 
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#fff' }}>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

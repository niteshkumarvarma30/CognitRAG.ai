'use client';
import React, { Suspense } from 'react';
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const searchParams = useSearchParams();
  const personaParam = searchParams.get('persona');
  const storedPersona = typeof window !== 'undefined' ? localStorage.getItem('cognitrag_persona') : null;
  const persona = personaParam || storedPersona;

  let forceRedirect = '/dev-studio';
  if (persona === 'superadmin' || persona === 'admin') {
    forceRedirect = '/dashboard';
  } else if (persona === 'company_brain' || persona === 'enterprise_brain') {
    forceRedirect = '/enterprise-brain';
  } else if (persona === 'bharat_intelligence') {
    forceRedirect = '/bharat-intelligence';
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', background: 'var(--bg)' }}>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl={forceRedirect} />
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

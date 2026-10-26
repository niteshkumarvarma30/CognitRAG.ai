'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  GlobalNav,
  HeroSection,
  ClaimDemo,
  HowItWorksSection,
  IntegrationsGrid,
  PrivacySection,
  EarlyResults,
  PricingSection,
  FAQSection,
  Footer,
  EarlyAccessModal,
  StartupMarqueeBanner
} from '@/components/marketing';
import { useAuth } from '@clerk/nextjs';

export default function LandingPage() {
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect signed-in users to home dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      backgroundColor: 'var(--bg)',
      color: 'var(--ink)',
      position: 'relative'
    }}>
      <GlobalNav onOpenEarlyAccess={() => setEarlyAccessOpen(true)} />
      <main>
        <HeroSection onOpenEarlyAccess={() => setEarlyAccessOpen(true)} />
        <ClaimDemo />
        <HowItWorksSection />
        <IntegrationsGrid />
        <PrivacySection />
        <EarlyResults />
        <PricingSection onOpenEarlyAccess={() => setEarlyAccessOpen(true)} />
        <StartupMarqueeBanner />
        <FAQSection />
      </main>
      <Footer />
      <EarlyAccessModal
        isOpen={earlyAccessOpen}
        onClose={() => setEarlyAccessOpen(false)}
      />
    </div>
  );
}

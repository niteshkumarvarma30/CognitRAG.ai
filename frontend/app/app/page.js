'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GlobalNav,
  HeroSection,
  TrustStrip,
  ProblemSection,
  CompanyBrainSection,
  HowItWorksSection,
  AskBrainDemo,
  LivingKnowledgeSection,
  SemanticGraphSection,
  AIAgentsSection,
  SecuritySection,
  IntegrationsGrid,
  ProofSection,
  SolutionsMatrix,
  PricingSection,
  FAQSection,
  FinalCTA,
  Footer,
} from '@/components/marketing';
import NeuralGraphBackground from '@/components/marketing/NeuralGraphBackground';
import EarlyAccessModal from '@/components/marketing/EarlyAccessModal';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function LandingPage() {
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', background: 'var(--bg)', position: 'relative' }}>
      <NeuralGraphBackground />
      <GlobalNav onEarlyAccess={() => setEarlyAccessOpen(true)} />

      <HeroSection onEarlyAccess={() => setEarlyAccessOpen(true)} />
      <TrustStrip />
      <ProblemSection />
      <CompanyBrainSection />
      <HowItWorksSection />
      <ProofSection />
      <AskBrainDemo />
      <LivingKnowledgeSection />
      <SemanticGraphSection />
      <AIAgentsSection />
      <SecuritySection />
      <IntegrationsGrid />
      <SolutionsMatrix />
      <PricingSection onEarlyAccess={() => setEarlyAccessOpen(true)} />
      <FAQSection />
      <FinalCTA onEarlyAccess={() => setEarlyAccessOpen(true)} />
      <Footer />

      <EarlyAccessModal isOpen={earlyAccessOpen} onClose={() => setEarlyAccessOpen(false)} />
    </div>
  );
}

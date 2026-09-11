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
  GroundedScenariosSection,
  PersonaShowcaseSection,
  PersonaSelectionModal,
} from '@/components/marketing';
import NeuralGraphBackground from '@/components/marketing/NeuralGraphBackground';
import EarlyAccessModal from '@/components/marketing/EarlyAccessModal';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function LandingPage() {
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to their dedicated persona dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const storedPersona = typeof window !== 'undefined' ? localStorage.getItem('cognitrag_persona') : null;
      if (storedPersona === 'superadmin') {
        router.replace('/dashboard');
      } else if (storedPersona === 'company_brain' || storedPersona === 'enterprise_brain') {
        router.replace('/enterprise-brain');
      } else if (storedPersona === 'bharat_intelligence') {
        router.replace('/bharat-intelligence');
      } else {
        router.replace('/dev-studio');
      }
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <div style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', background: 'var(--bg)', position: 'relative' }}>
      <NeuralGraphBackground />
      <GlobalNav onEarlyAccess={() => setEarlyAccessOpen(true)} />

      <HeroSection 
        onEarlyAccess={() => setEarlyAccessOpen(true)} 
        onGetStarted={() => setPersonaModalOpen(true)} 
      />
      <TrustStrip />
      <PersonaShowcaseSection />
      <GroundedScenariosSection />
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
      <PersonaSelectionModal isOpen={personaModalOpen} onClose={() => setPersonaModalOpen(false)} />
    </div>
  );
}

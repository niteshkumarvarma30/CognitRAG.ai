import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Search, Clock, Network, ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', padding: '4rem 2rem', gap: '6rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* Hero Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '800px', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--border-focus)', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--accent)' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }}></div>
          Workspace Memory Infrastructure
        </div>
        
        <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-0.03em' }} className="text-gradient">
          CognitRAG.ai
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '650px' }}>
          Preserve decisions, connect knowledge, and build your organization's second brain. 
          Knowledge belongs to the workspace, not the employee.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <SignedIn>
            <button className="btn-primary" onClick={() => navigate('/home')}>
              Enter Workspace <ArrowRight size={18} />
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/home">
              <button className="btn-primary">
                Sign In to Start <ArrowRight size={18} />
              </button>
            </SignInButton>
          </SignedOut>
          <button className="btn-secondary">
            Watch Demo
          </button>
        </div>
      </div>

      {/* Animated Workflow Concept */}
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        <div className="flex-row" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>
          <span>Documents</span> • <span>GitHub</span> • <span>Slack</span> • <span>Meetings</span>
        </div>
        
        <div style={{ color: 'var(--accent)', padding: '1rem' }}>↓</div>
        
        <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '700' }}>Workspace Memory</h2>
        
        <div style={{ color: 'var(--accent)', padding: '1rem' }}>↓</div>
        
        <div className="flex-row" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>
          <span>ChatGPT</span> • <span>Claude</span> • <span>Gemini</span> • <span>Cursor</span>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>The Four Pillars of Memory</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Brain size={32} color="var(--accent)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Living Memory</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Current truth and preferences evolve with your workspace across semantic and session boundaries.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Search size={32} color="var(--success)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Knowledge Vault</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Search and retrieve deeply nested information instantly from every connected data source.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Network size={32} color="var(--accent-secondary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Relationship Intelligence</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Graph-powered reasoning powered by Neo4j connects the dots across isolated projects.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Clock size={32} color="var(--warning)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Episodic Timeline</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Preserves not just what is true, but *why* and *when* decisions were made historically.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;

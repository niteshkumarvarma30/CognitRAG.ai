import { useNavigate } from 'react-router-dom';
import { Building2, UserCircle, Brain, Network, Zap, ShieldCheck, Database, ArrowRight, Lock } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          Powered by Sarvam-30B & Neo4j
        </div>
        <h1 className="hero-title">
          Enterprise Knowledge.<br/>
          <span className="gradient-text">Flawlessly Connected.</span>
        </h1>
        <p className="hero-subtitle">
          CognitRAG.ai is the world's first Corrective Cognitive Graph RAG platform. 
          Upload massive technical manuals and query them instantly with zero hallucinations.
        </p>
        
        <div className="hero-cta-group">
          <div className="role-card glass-panel interactive-card" onClick={() => navigate('/company')}>
            <Building2 size={36} className="card-icon" />
            <div className="card-content">
              <h3>Company Portal</h3>
              <p>Deploy your isolated Tenant and Knowledge Graph.</p>
            </div>
            <ArrowRight size={20} className="card-arrow" />
          </div>

          <div className="role-card glass-panel interactive-card" onClick={() => navigate('/employee')}>
            <UserCircle size={36} className="card-icon" />
            <div className="card-content">
              <h3>Employee Portal</h3>
              <p>Query your enterprise data instantly.</p>
            </div>
            <ArrowRight size={20} className="card-arrow" />
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="problem-section glass-panel">
        <div className="section-header">
          <h2 className="error-text">The Problem: Chunk Boundaries</h2>
        </div>
        <div className="problem-content">
          <p>
            Standard AI chatbots rely on basic Vector RAG. When you upload a massive 500-page technical manual, 
            the system slices it into hundreds of isolated "chunks" to fit into the AI's memory. 
          </p>
          <p>
            When an employee asks a complex question, the AI only finds one piece of the puzzle and completely 
            misses the surrounding context because of blind <strong>Chunk Boundaries</strong>. This results in 
            confident hallucinations and "I don't know" answers.
          </p>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="features-section">
        <div className="section-header center">
          <h2>Why CognitRAG.ai is <span className="gradient-text">Different</span></h2>
          <p>We don't just search text. We map relationships.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <Network className="feature-icon" size={32} />
            <h3>Graph RAG Connectivity</h3>
            <p>We use Neo4j to build a mathematical Knowledge Graph of your data. Entities are linked across documents, bridging chunk boundaries to deliver perfect, context-aware answers.</p>
          </div>

          <div className="feature-card glass-panel">
            <Database className="feature-icon" size={32} />
            <h3>Long-Term User Memory</h3>
            <p>Our platform continuously extracts facts from your conversations. The AI remembers your preferences, system architectures, and past questions without you ever having to repeat yourself.</p>
          </div>

          <div className="feature-card glass-panel">
            <Zap className="feature-icon" size={32} />
            <h3>Lightning Fast Caching</h3>
            <p>Our User-Level Semantic Cache memorizes perfectly constructed answers. When you ask a similar question, the response time drops from seconds to 0 milliseconds.</p>
          </div>

          <div className="feature-card glass-panel">
            <Lock className="feature-icon" size={32} />
            <h3>True Multi-Tenant Isolation</h3>
            <p>Enterprise-grade security. Your proprietary PDFs, vectors, and graph relationships are cryptographically sealed off from other companies at the database level.</p>
          </div>
        </div>
      </section>
      
      {/* Footer / Final CTA */}
      <footer className="landing-footer">
        <Brain className="logo-icon glow" size={32} />
        <p>© 2026 CognitRAG.ai. The Future of Enterprise AI.</p>
      </footer>
    </div>
  );
}

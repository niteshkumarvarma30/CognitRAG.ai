import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Search, Clock, Network, ArrowRight, Server, Database, Bot, FileText, Lock, Users, AlertTriangle, Link as LinkIcon, Shield, Compass, Cpu } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import FloatingGraphBackground from '../components/layout/FloatingGraphBackground';

// Helper component for scroll animations
const FadeInSection = ({ children, delay = '0s' }) => {
  const [isVisible, setVisible] = React.useState(false);
  const domRef = React.useRef();
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target); // Unobserve after triggering for better performance
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    const current = domRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);
  
  return (
    <div
      ref={domRef}
      className={`reveal-up ${isVisible ? 'is-visible' : ''}`}
      style={{ animationDelay: delay, opacity: isVisible ? 1 : 0, animationPlayState: isVisible ? 'running' : 'paused' }}
    >
      {children}
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <div className="grid-bg"></div>
      <FloatingGraphBackground />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '4rem 2rem', gap: '8rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* 1. Hero Section */}
        <FadeInSection>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '900px', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.5rem 1.5rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: '500', color: '#60a5fa', backdropFilter: 'blur(10px)' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#60a5fa', borderRadius: '50%', boxShadow: '0 0 10px #60a5fa', animation: 'pulse 2s infinite' }}></div>
              Graph-Powered Workspace Intelligence
            </div>
            
            <h1 style={{ fontSize: '5.5rem', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-0.03em' }} className="welcome-title text-glow">
              CognitRAG.ai
            </h1>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="animated-tagline" style={{ animationDelay: '0.2s' }}>Preserve knowledge.</span>
              <span className="animated-tagline" style={{ animationDelay: '0.4s' }}>Connect context.</span>
              <span className="animated-tagline" style={{ animationDelay: '0.6s' }}>Retain intelligence.</span>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
              <SignedIn>
                <button className="btn-primary" onClick={() => navigate('/home')} style={{ padding: '1rem 2rem', fontSize: '1.1rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>
                  Enter Workspace <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                </button>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal" fallbackRedirectUrl="/home">
                  <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>
                    Sign In to Start <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </FadeInSection>

        {/* 2. The Knowledge Fragmentation Problem */}
        <FadeInSection delay="0.2s">
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '1rem' }}>The Knowledge Fragmentation Problem</h2>
            
            <div className="glass-panel" style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(220, 38, 38, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '1.5rem', fontWeight: '500' }}>
                Organizations create knowledge every day.
              </p>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '2rem' }}>
                Decisions are scattered across conversations, documents, meetings, emails, and countless tools. Over time, valuable context becomes difficult to find, and critical knowledge exists only in the minds of a few people.
              </p>
              
              <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '1rem' }}>Information becomes fragmented:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}><AlertTriangle size={16} color="#ef4444" style={{ marginBottom: '0.5rem' }}/> <br/>Documents become outdated.</div>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}><AlertTriangle size={16} color="#ef4444" style={{ marginBottom: '0.5rem' }}/> <br/>Conversations disappear.</div>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}><AlertTriangle size={16} color="#ef4444" style={{ marginBottom: '0.5rem' }}/> <br/>Decisions are forgotten.</div>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}><AlertTriangle size={16} color="#ef4444" style={{ marginBottom: '0.5rem' }}/> <br/>Context becomes siloed.</div>
                <div className="glass-panel" style={{ padding: '1rem', borderTop: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)', gridColumn: '1 / -1' }}><AlertTriangle size={16} color="#ef4444" style={{ marginBottom: '0.5rem' }}/> <br/>Expertise exists only inside individuals.</div>
              </div>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                As organizations grow, institutional intelligence becomes increasingly difficult to preserve.
              </p>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '1.5rem', borderRadius: '0 8px 8px 0' }}>
                <p style={{ fontSize: '1.3rem', color: '#f87171', fontWeight: '700', margin: 0 }}>
                  When people leave, knowledge leaves with them.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* 3. The CognitRAG.ai Solution */}
        <FadeInSection delay="0.2s">
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '1rem' }}>The CognitRAG.ai Solution</h2>
            
            <div className="glass-panel" style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '1.5rem', borderRadius: '0 8px 8px 0', marginBottom: '2rem' }}>
                <p style={{ fontSize: '1.4rem', color: '#34d399', fontWeight: '700', margin: 0 }}>
                  Knowledge belongs to the workspace, not the employee.
                </p>
              </div>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                CognitRAG.ai continuously transforms documents, conversations, and decisions into a living workspace memory.
              </p>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Powered by hybrid retrieval and graph intelligence, CognitRAG.ai preserves facts, relationships, and historical context so teams, AI systems, and future employees always have access to what the organization already knows.
              </p>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '2rem' }}>
                Instead of storing information inside disconnected tools, CognitRAG.ai creates a persistent intelligence layer that evolves alongside the organization.
              </p>
              
              <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '1rem' }}>Knowledge becomes:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '9999px' }}><Shield size={16} /> Persistent</div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '9999px' }}><Search size={16} /> Searchable</div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '9999px' }}><LinkIcon size={16} /> Connected</div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '9999px' }}><Brain size={16} /> Explainable</div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '9999px' }}><Network size={16} /> Continuously evolving</div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* 4. Why Traditional Knowledge Systems Fail */}
        <FadeInSection delay="0.2s">
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '1rem' }}>Why Traditional Knowledge Systems Fail</h2>
            
            <div className="glass-panel" style={{ padding: '3rem', background: 'rgba(15, 23, 42, 0.6)' }}>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>Traditional tools store information.</p>
              <p style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '600', marginBottom: '2rem' }}>They do not preserve understanding.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>Documents <ArrowRight size={16} style={{ margin: '0 10px', color: 'var(--text-muted)' }}/> <span style={{ color: '#60a5fa' }}>Information</span></div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>People <ArrowRight size={16} style={{ margin: '0 10px', color: 'var(--text-muted)' }}/> <span style={{ color: '#60a5fa' }}>Experience</span></div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>Conversations <ArrowRight size={16} style={{ margin: '0 10px', color: 'var(--text-muted)' }}/> <span style={{ color: '#60a5fa' }}>Decisions</span></div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>Tools <ArrowRight size={16} style={{ margin: '0 10px', color: 'var(--text-muted)' }}/> <span style={{ color: '#60a5fa' }}>Context</span></div>
              </div>

              <p style={{ fontSize: '1.25rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '2rem', fontStyle: 'italic' }}>
                All remain fragmented.<br/>
                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontStyle: 'normal' }}>Searching for information is not the same as preserving knowledge.</span>
              </p>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '1rem' }}>Organizations repeatedly lose:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel glow-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)' }}><Clock size={20} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }}/> Architectural decisions</div>
                <div className="glass-panel glow-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)' }}><Clock size={20} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }}/> Meeting outcomes</div>
                <div className="glass-panel glow-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)' }}><Clock size={20} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }}/> Historical context</div>
                <div className="glass-panel glow-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)' }}><Clock size={20} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }}/> Operational expertise</div>
                <div className="glass-panel glow-card" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)' }}><Clock size={20} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }}/> Lessons learned</div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b', padding: '1.5rem', borderRadius: '0 8px 8px 0' }}>
                <p style={{ fontSize: '1.2rem', color: '#fbbf24', fontWeight: '700', margin: 0 }}>
                  Every transition introduces information loss.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* 5. The CognitRAG.ai Approach (Animated Pipeline) */}
        <FadeInSection delay="0.2s">
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', margin: '2rem 0' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700' }}>The CognitRAG.ai Approach</h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-dim)' }}>CognitRAG.ai creates a living memory for the workspace.</p>
            
            <div className="data-flow-container" style={{ marginTop: '2rem' }}>
              {/* Top Row: Data Sources */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                {['Documents', 'Emails', 'Meetings', 'Chats', 'Repositories', 'Knowledge Bases'].map((src, i) => (
                  <div key={i} className="glass-panel" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>{src}</div>
                ))}
              </div>

              {/* Connecting Paths Down */}
              <div className="flex-row" style={{ gap: '4rem' }}>
                <div className="flow-path"><div className="data-packet" /></div>
                <div className="flow-path"><div className="data-packet packet-blue" /></div>
                <div className="flow-path"><div className="data-packet packet-purple" /></div>
                <div className="flow-path"><div className="data-packet" style={{ animationDelay: '1.5s' }} /></div>
              </div>

              {/* Central Memory Core */}
              <div className="glass-panel glow-card" style={{ padding: '3rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.4)', boxShadow: '0 0 50px rgba(59, 130, 246, 0.15)', width: '100%', maxWidth: '700px' }}>
                <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>CognitRAG.ai</h2>
                <div style={{ fontSize: '1.1rem', color: '#60a5fa', fontWeight: '600', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Graph-Powered Workspace Intelligence</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {['Session Memory', 'Preference Memory', 'Semantic Memory', 'Episodic Memory', 'Knowledge Memory', 'Graph Memory'].map((mem, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500' }}>{mem}</div>
                  ))}
                </div>
              </div>

              {/* Connecting Paths Down */}
              <div className="flex-row" style={{ gap: '6rem' }}>
                <div className="flow-path"><div className="data-packet packet-purple" /></div>
                <div className="flow-path"><div className="data-packet packet-blue" style={{ animationDelay: '0.8s' }} /></div>
                <div className="flow-path"><div className="data-packet" style={{ animationDelay: '0.3s' }} /></div>
              </div>

              {/* Bottom Row: Consumers */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
                {['Humans', 'Teams', 'AI Systems', 'Future Employees'].map((dest, i) => (
                  <div key={i} className="glass-panel" style={{ padding: '1rem 2rem', fontSize: '1rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399' }}>{dest}</div>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* 6. Core Principles */}
        <FadeInSection delay="0.2s">
          <div style={{ width: '100%', maxWidth: '1000px', margin: '2rem 0' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '3rem' }}>Core Principles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="glass-panel glow-card" style={{ padding: '2.5rem', textAlign: 'left' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px', width: 'max-content', marginBottom: '1.5rem' }}><Database size={32} color="#3b82f6" /></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Preserve Knowledge</h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6', fontSize: '1.1rem' }}>Capture information before it disappears.</p>
              </div>
              <div className="glass-panel glow-card" style={{ padding: '2.5rem', textAlign: 'left' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '12px', width: 'max-content', marginBottom: '1.5rem' }}><Network size={32} color="#8b5cf6" /></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Connect Context</h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6', fontSize: '1.1rem' }}>Link facts, decisions, entities, and relationships across the workspace.</p>
              </div>
              <div className="glass-panel glow-card" style={{ padding: '2.5rem', textAlign: 'left' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', width: 'max-content', marginBottom: '1.5rem' }}><Cpu size={32} color="#10b981" /></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Retain Intelligence</h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: '1.6', fontSize: '1.1rem' }}>Ensure organizational expertise survives people, projects, and tools.</p>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* 7. Vision & Mission & Philosophy */}
        <FadeInSection delay="0.2s">
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '4rem', textAlign: 'left', marginBottom: '4rem' }}>
            
            {/* Vision */}
            <div style={{ borderLeft: '4px solid #60a5fa', paddingLeft: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#60a5fa' }}>Vision</h2>
              <p style={{ fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: '1.8', marginBottom: '1rem' }}>Organizations should not lose intelligence because information is fragmented.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-dim)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                <div>Knowledge should outlive conversations.</div>
                <div>Context should outlive documents.</div>
                <div>Experience should outlive individuals.</div>
              </div>
              <p style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: '700' }}>Knowledge belongs to the workspace, not the employee.</p>
            </div>

            {/* Mission */}
            <div style={{ borderLeft: '4px solid #34d399', paddingLeft: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#34d399' }}>Mission</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-main)', fontSize: '1.3rem', lineHeight: '1.8' }}>
                <div>Build the memory layer for organizations.</div>
                <div>Transform fragmented information into persistent intelligence.</div>
                <div>Enable humans and AI systems to share the same understanding.</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '1rem', color: '#10b981' }}>One Memory. Every AI.</div>
              </div>
            </div>

            {/* Philosophy */}
            <div style={{ borderLeft: '4px solid #a78bfa', paddingLeft: '2rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#a78bfa' }}>Philosophy</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', color: 'var(--text-dim)', fontSize: '1.2rem', lineHeight: '1.8' }}>
                <div className="glass-panel" style={{ padding: '1rem 1.5rem', background: 'rgba(139, 92, 246, 0.05)' }}>Child chunks for <strong style={{ color: 'var(--text-main)' }}>retrieval</strong>. Parent chunks for <strong style={{ color: 'var(--text-main)' }}>reasoning</strong>.</div>
                <div className="glass-panel" style={{ padding: '1rem 1.5rem', background: 'rgba(139, 92, 246, 0.05)' }}>Semantic memory preserves <strong style={{ color: 'var(--text-main)' }}>what is true</strong>.</div>
                <div className="glass-panel" style={{ padding: '1rem 1.5rem', background: 'rgba(139, 92, 246, 0.05)' }}>Episodic memory preserves <strong style={{ color: 'var(--text-main)' }}>how we got here</strong>.</div>
                <div className="glass-panel" style={{ padding: '1rem 1.5rem', background: 'rgba(139, 92, 246, 0.05)' }}>Graph memory preserves <strong style={{ color: 'var(--text-main)' }}>how things connect</strong>.</div>
              </div>
              <p style={{ fontSize: '1.5rem', color: '#8b5cf6', fontWeight: '800', marginTop: '2rem', textAlign: 'center' }}>Knowledge belongs to the workspace, not the employee.</p>
            </div>

          </div>
        </FadeInSection>

        {/* 8. Footer */}
        <div style={{ width: '100%', padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800' }}>CognitRAG.ai</h2>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Graph-Powered Workspace Intelligence</div>
          <div style={{ fontSize: '0.9rem', color: '#60a5fa' }}>Workspace Memory Infrastructure</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-dim)', marginTop: '1rem', fontStyle: 'italic' }}>Preserve knowledge. Connect context. Retain intelligence.</div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;

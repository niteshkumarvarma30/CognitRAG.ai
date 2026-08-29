'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { Briefcase, Link as LinkIcon, ShieldCheck, Zap, Bot, ArrowRight, Loader2, MessageSquare, GitBranch, FileText } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [workspaceName, setWorkspaceName] = useState('');
  const [connectedSources, setConnectedSources] = useState([]);
  
  const handleNext = async () => {
    if (step === 1 && !workspaceName.trim()) return;
    
    if (step === 4) {
      // Simulate Finalization
      setIsProcessing(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      return;
    }

    if (step === 2) {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setStep(s => s + 1);
        }, 1200); // simulate oauth connection
        return;
    }
    
    setStep(s => s + 1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', padding: 'var(--space-8)' }}>
      
      {/* Progress Sidebar */}
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <div>
          <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 'var(--space-4)' }}>
            <Bot size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Welcome to CognitRAG</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Let's set up your company's intelligence platform in minutes.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {[
            { num: 1, title: 'Create Workspace', desc: 'Name your environment' },
            { num: 2, title: 'Connect Sources', desc: 'Sync knowledge tools' },
            { num: 3, title: 'Ingestion Scope', desc: 'Define access bounds' },
            { num: 4, title: 'Ask Brain', desc: 'Your first query' }
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', gap: 'var(--space-3)', opacity: step >= s.num ? 1 : 0.4 }}>
              <div style={{ 
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: step > s.num ? 'var(--primary)' : step === s.num ? 'var(--primary-light)' : 'var(--surface-soft)',
                color: step > s.num ? 'white' : step === s.num ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600,
                border: step === s.num ? '1px solid var(--primary)' : 'none'
              }}>
                {step > s.num ? <ShieldCheck size={14} /> : s.num}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ width: '100%', maxWidth: '600px', padding: 'var(--space-8)', boxShadow: 'var(--shadow-xl)' }}>
          
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Create your Workspace</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>This is the secure container for your team's knowledge graph.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>Workspace Name</label>
                  <Input 
                    placeholder="e.g. Acme Corp" 
                    value={workspaceName} 
                    onChange={e => setWorkspaceName(e.target.value)} 
                    style={{ width: '100%', fontSize: '1rem' }} 
                    autoFocus
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>Workspace URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-soft)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 var(--space-3)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>app.cognitrag.ai/</span>
                    <input 
                      type="text" 
                      value={workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-')} 
                      readOnly
                      style={{ border: 'none', background: 'transparent', padding: 'var(--space-3)', flex: 1, outline: 'none', color: 'var(--text-primary)' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Connect Knowledge Sources</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Connect the tools where your company decisions and context live.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                {[
                  { id: 'slack', name: 'Slack', icon: MessageSquare, color: 'var(--violet)' },
                  { id: 'github', name: 'GitHub', icon: GitBranch, color: 'var(--success)' },
                  { id: 'jira', name: 'Jira', icon: FileText, color: 'var(--info)' },
                ].map(source => (
                  <div key={source.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${source.color}15`, color: source.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <source.icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{source.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{source.name} workspace</div>
                      </div>
                    </div>
                    <Button 
                      variant={connectedSources.includes(source.id) ? 'ghost' : 'outline'}
                      onClick={() => setConnectedSources(prev => prev.includes(source.id) ? prev.filter(id => id !== source.id) : [...prev, source.id])}
                    >
                      {connectedSources.includes(source.id) ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 650, color: 'var(--text-primary)' }}>Ingestion Scope</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>CognitRAG is building your semantic graph. Select what to sync.</p>
              </div>

              <div style={{ padding: 'var(--space-6)', background: 'var(--surface-soft)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-8)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <Zap size={24} style={{ color: 'var(--warning)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Initial Graph Extraction</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Parsing 10,000+ chunks into semantic entities...</div>
                  </div>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'var(--primary)', transition: 'width 1s ease' }}></div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
                <ShieldCheck size={32} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Your Brain is Ready</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>{workspaceName}'s graph has been successfully initialized. You can now ask complex questions.</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={isProcessing || (step === 1 && !workspaceName.trim())}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isProcessing && <Loader2 size={16} className="animate-spin" />}
              {step === 4 ? 'Go to Dashboard' : 'Continue'}
              {!isProcessing && step !== 4 && <ArrowRight size={16} />}
            </Button>
          </div>
        </Card>
      </div>

    </div>
  );
}

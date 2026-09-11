'use client';
import React, { useState } from 'react';
import { 
  Building2, 
  Code2, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  GitPullRequest, 
  CheckCircle2, 
  Mic, 
  Volume2, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Globe2, 
  FileSearch,
  Check,
  Terminal,
  Play
} from 'lucide-react';

export default function PersonaShowcaseSection() {
  const [activeTab, setActiveTab] = useState('dev_studio');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  const personas = [
    {
      id: 'dev_studio',
      name: 'Developer Code Studio',
      badge: 'For Engineers & Architects',
      icon: Code2,
      tagline: 'Deep Repository AST, Call-Graph & Voice Search',
      description: 'Explore massive legacy codebases with AST syntax graphs, function call trees, and voice-to-code queries powered by Sarvam Saaras STT in natural Indian accents.'
    },
    {
      id: 'company_brain',
      name: 'Enterprise Company Brain',
      badge: 'For Tech Teams & Enterprises',
      icon: Building2,
      tagline: 'Cross-Platform Team Intelligence with Hinglish NLP',
      description: 'Connect Slack, Jira, GitHub, and Notion into a single deterministic knowledge graph. Resolves colloquial Hinglish chats into verified code commits and tickets with 98.2% audited faithfulness.'
    },
    {
      id: 'bharat_intelligence',
      name: 'Bharat Document Intelligence',
      badge: 'For Indian BFSI, Legal & MSMEs',
      icon: FileText,
      tagline: 'Scanned Bilingual OCR + 2-Way Indic Voice RAG',
      description: 'Digitize degraded bilingual invoices, GST circulars, and legal contracts via Sarvam Document Digitization. Ask questions in Hindi or Tamil and hear spoken verified answers.'
    }
  ];

  return (
    <section id="personas" style={{
      width: '100%',
      position: 'relative',
      padding: 'clamp(48px, 6vw, 80px) clamp(16px, 3vw, 24px)',
      background: 'linear-gradient(180deg, #FAFAFC 0%, #F5F3FF 50%, #FAFAFC 100%)',
      overflow: 'hidden',
      borderTop: '1px solid rgba(99, 91, 255, 0.1)',
      borderBottom: '1px solid rgba(99, 91, 255, 0.1)'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(99, 91, 255, 0.08), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 91, 255, 0.1)',
            border: '1px solid rgba(99, 91, 255, 0.25)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.8125rem',
            fontWeight: 650,
            color: 'var(--primary)',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} />
            <span>Built for Every Modern Workflow • Powered by Sarvam AI</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#18181B',
            lineHeight: 1.2,
            margin: '0 0 14px 0'
          }}>
            One Unified Architecture. <br />
            <span style={{
              background: 'linear-gradient(135deg, #635BFF 0%, #7C3AED 50%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Three Dedicated Enterprise Personas.
            </span>
          </h2>

          <p style={{
            color: '#52525B',
            fontSize: '1.1rem',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Whether you are syncing cross-platform engineering tools, exploring multi-repo codebases, or digitizing scanned bilingual Indian documents, CognitRAG delivers deterministic, 100% cited intelligence backed by an 8-Stage White-Box audit trail.
          </p>
        </div>

        {/* 3-Persona Interactive Tab Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '16px',
          marginBottom: '36px'
        }}>
          {personas.map((p) => {
            const isActive = activeTab === p.id;
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '20px',
                  borderRadius: '16px',
                  border: isActive ? '2px solid #635BFF' : '1px solid #E4E4E7',
                  background: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  boxShadow: isActive ? '0 12px 32px rgba(99, 91, 255, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  transform: isActive ? 'translateY(-2px)' : 'none'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: isActive ? 'linear-gradient(135deg, #635BFF, #7C3AED)' : '#F4F4F5',
                  color: isActive ? '#FFFFFF' : '#71717A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}>
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isActive ? '#635BFF' : '#71717A',
                    marginBottom: '4px'
                  }}>
                    {p.badge}
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 750,
                    color: '#18181B',
                    marginBottom: '4px'
                  }}>
                    {p.name}
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: '#71717A',
                    lineHeight: 1.4
                  }}>
                    {p.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Persona Sandbox Display */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E4E4E7',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Top Bar of Sandbox */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #F4F4F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAFAFC'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 650, color: '#71717A', marginLeft: '12px' }}>
                CognitRAG Live Interactive Showcase — {personas.find(p => p.id === activeTab)?.name}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#15803D',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <CheckCircle2 size={12} /> 100% Deterministic White-Box Trace
              </span>
            </div>
          </div>

          {/* Persona 1: Company Brain Interactive View */}
          {activeTab === 'company_brain' && (
            <div style={{ padding: 'clamp(16px, 4vw, 32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '28px' }}>
              {/* Left Column: Simulated Hinglish Slack Query */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#635BFF', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Step 1: Colloquial Team Message (Slack)
                </div>
                
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4A154B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      #
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B' }}>#prod-incidents</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Slack Workspace • 2 hours ago</div>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.95rem',
                    color: '#334155',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    background: '#FFFFFF',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    margin: 0
                  }}>
                    "Yaar PR #142 staging pe deploy hui ya nahi? Payment webhook timeout ka issue resolve hua kya?"
                  </p>
                </div>

                {/* Sarvam Normalizer Box */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99, 91, 255, 0.06), rgba(124, 58, 237, 0.04))',
                  border: '1px solid rgba(99, 91, 255, 0.25)',
                  borderRadius: '14px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#635BFF', fontWeight: 700, fontSize: '0.8125rem' }}>
                    <Cpu size={15} />
                    <span>Sarvam Indic NLP Entity Normalizer</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', background: '#FFFFFF', border: '1px solid #C7D2FE', padding: '3px 8px', borderRadius: '6px', color: '#4338CA', fontWeight: 600 }}>
                      [Entity: GitHub PR #142]
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#FFFFFF', border: '1px solid #C7D2FE', padding: '3px 8px', borderRadius: '6px', color: '#4338CA', fontWeight: 600 }}>
                      [Target: Staging Cluster]
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#FFFFFF', border: '1px solid #C7D2FE', padding: '3px 8px', borderRadius: '6px', color: '#4338CA', fontWeight: 600 }}>
                      [Jira Ticket: PAY-891]
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Verified Graph Cross-Platform Link Chain */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Step 2: Neo4j Knowledge Graph Multi-Hop Resolution
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0052CC', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>Jira Ticket PAY-891</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>"Payment gateway webhook idempotent retry timeout" • Status: Closed</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700 }}>Resolved</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#24292F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GitPullRequest size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1E293B' }}>GitHub PR #142 (fix/webhook-retry)</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Merged into staging at 10:14 AM by @ananya</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700 }}>Merged</span>
                  </div>
                </div>

                {/* Final Verified Answer */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  borderLeft: '4px solid #16A34A',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803D', marginBottom: '6px' }}>
                    CognitRAG Grounded Response:
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#27272A', lineHeight: 1.5, margin: 0 }}>
                    <strong>Yes.</strong> PR #142 was successfully merged into <code>staging</code> at 10:14 AM by Ananya. It resolved Jira issue <code>PAY-891</code> by increasing the webhook idempotency timeout from 3s to 8s. Staging tests passed at 10:22 AM.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Persona 2: Developer Code Studio Interactive View */}
          {activeTab === 'dev_studio' && (
            <div style={{ padding: 'clamp(16px, 4vw, 32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '28px' }}>
              {/* Left: Voice to Code Query */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#635BFF', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Sarvam Saaras Voice-to-Code Search
                </div>

                <div style={{
                  background: '#0F172A',
                  color: '#F8FAFC',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#94A3B8' }}>
                      <Terminal size={16} color="#38BDF8" />
                      <span>Repo: org/payment-gateway-service</span>
                    </div>

                    <button
                      onClick={() => setVoiceActive(!voiceActive)}
                      style={{
                        background: voiceActive ? '#EF4444' : '#635BFF',
                        border: 'none',
                        color: '#fff',
                        borderRadius: 'var(--radius-pill)',
                        padding: '6px 14px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Mic size={13} />
                      {voiceActive ? 'Listening (Saaras STT)...' : 'Test Voice Search'}
                    </button>
                  </div>

                  <div style={{
                    background: '#1E293B',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    fontSize: '0.9rem',
                    color: '#38BDF8',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {voiceActive 
                      ? '"Bhai authentication middleware me JWT verify kahan hota hai?"' 
                      : '"Where is JWT token validation handled in auth middleware?"'}
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#94A3B8' }}>
                    Transcribed via <strong>Sarvam Saaras STT</strong> (Latency: 280ms • Accent Accuracy: 98.6%)
                  </div>
                </div>

                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '16px'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', marginBottom: '8px' }}>
                    AST Function Call Graph Traversal
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.5 }}>
                    Indexed 42,000 LOC across 182 files. Pinpointed caller chain: <br />
                    <code>server.py</code> → <code>auth_router.py</code> → <code>jwt_handler.py::verify_token</code>
                  </div>
                </div>
              </div>

              {/* Right: Code Snippet & Call Tree */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Target File & AST Graph Subtree
                </div>

                <div style={{
                  background: '#0F172A',
                  borderRadius: '16px',
                  padding: '18px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: '#E2E8F0',
                  lineHeight: 1.6,
                  border: '1px solid #334155'
                }}>
                  <div style={{ color: '#64748B', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '10px' }}>
                    src/middleware/jwt_handler.py (Lines 42-58)
                  </div>
                  <div><span style={{ color: '#F43F5E' }}>async def</span> <span style={{ color: '#38BDF8' }}>verify_jwt_token</span>(token: str):</div>
                  <div style={{ paddingLeft: '16px' }}>payload = jwt.decode(token, SECRET_KEY, algorithms=[<span style={{ color: '#A3E635' }}>"HS256"</span>])</div>
                  <div style={{ paddingLeft: '16px' }}><span style={{ color: '#F43F5E' }}>if</span> payload.get(<span style={{ color: '#A3E635' }}>"exp"</span>) &lt; time.time():</div>
                  <div style={{ paddingLeft: '32px' }}><span style={{ color: '#F43F5E' }}>raise</span> HTTPException(status_code=401, detail=<span style={{ color: '#A3E635' }}>"Token expired"</span>)</div>
                  <div style={{ paddingLeft: '16px' }}><span style={{ color: '#F43F5E' }}>return</span> payload[<span style={{ color: '#A3E635' }}>"tenant_id"</span>]</div>
                </div>

                <div style={{
                  marginTop: '16px',
                  padding: '14px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  fontSize: '0.8125rem',
                  color: '#065F46'
                }}>
                  <strong>AST Citation:</strong> Defined in <code>src/middleware/jwt_handler.py</code> line 42. Called by 14 endpoints in <code>src/api/routes.py</code>.
                </div>
              </div>
            </div>
          )}

          {/* Persona 3: Bharat Document Intelligence Interactive View */}
          {activeTab === 'bharat_intelligence' && (
            <div style={{ padding: 'clamp(16px, 4vw, 32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '28px' }}>
              {/* Left: Scanned Indian Invoice OCR */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Sarvam Document Digitization (Bilingual OCR)
                </div>

                <div style={{
                  background: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#9A3412' }}>
                      📄 Scanned Tax Invoice & Contract (Hindi / English)
                    </span>
                    <span style={{ fontSize: '0.7rem', background: '#EA580C', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 650 }}>
                      99.4% OCR Fidelity
                    </span>
                  </div>

                  <div style={{
                    background: '#FFFFFF',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #FED7AA',
                    fontSize: '0.8rem',
                    color: '#431407',
                    lineHeight: 1.5
                  }}>
                    <strong>मूल चालान (Invoice No):</strong> GST/2024-25/0892 <br />
                    <strong>क्रेता (Buyer):</strong> Sharma Logistics Pvt Ltd <br />
                    <strong>GST दर (Tax Rate):</strong> 18% (CGST 9% + SGST 9%) = ₹36,000 <br />
                    <strong>विलंब शुल्क (Penalty Clause):</strong> 15 दिन उपरांत 2% प्रति माह
                  </div>
                </div>

                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '14px',
                  fontSize: '0.8125rem',
                  color: '#64748B'
                }}>
                  <strong>Formats Ingested:</strong> Scanned bilingual PDFs, camera receipts, Tally XML/Excel exports, and RBI/SEBI circulars.
                </div>
              </div>

              {/* Right: 2-Way Voice RAG with Sarvam Saaras */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', marginBottom: '8px' }}>
                  2-Way Conversational Voice RAG (Hindi / Tamil / English)
                </div>

                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  marginBottom: '16px'
                }}>
                  {/* Spoken Question */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#635BFF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#71717A', fontWeight: 600 }}>Field Manager Voice Query (Hindi)</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 650, color: '#18181B' }}>
                        "इस इनवॉइस में कुल टैक्स और पेनल्टी क्लॉज क्या लिखा है?"
                      </div>
                    </div>
                  </div>

                  {/* Spoken Answer with audio player simulation */}
                  <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '12px',
                    padding: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D' }}>
                        Sarvam Saaras Natural Voice Audio Response
                      </span>
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        style={{
                          background: '#16A34A',
                          border: 'none',
                          color: '#fff',
                          borderRadius: 'var(--radius-pill)',
                          padding: '4px 10px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isPlayingAudio ? <Volume2 size={12} /> : <Play size={12} />}
                        {isPlayingAudio ? 'Playing Hindi Audio...' : 'Play Audio'}
                      </button>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#166534', margin: 0, lineHeight: 1.5 }}>
                      "इस इनवॉइस में कुल 18% GST (₹36,000) है, और भुगतान में 15 दिनों से अधिक की देरी होने पर 2% प्रति माह का विलंब शुल्क देय होगा।"
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '12px 16px',
                  background: '#F4F4F5',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  color: '#71717A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Globe2 size={14} color="#635BFF" />
                  <span>Supports Hindi, Tamil, Telugu, Marathi, Gujarati, Kannada, Bengali, and English.</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Card Footer */}
          <div style={{
            padding: '18px 24px',
            background: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} color="#16A34A" /> Locked at Sign-Up (Zero Clutter)
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#635BFF" /> DPDP Act 2023 & RBI Compliant
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="#06B6D4" /> 10x Lower TCO than Glean
              </span>
            </div>

            <a
              href={`/sign-up?persona=${activeTab}`}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('cognitrag_persona', activeTab);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTab === 'dev_studio' ? 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)' : activeTab === 'bharat_intelligence' ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' : '#18181B',
                color: '#FFFFFF',
                padding: '11px 22px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: activeTab === 'dev_studio' ? '0 4px 14px rgba(99, 91, 255, 0.35)' : activeTab === 'bharat_intelligence' ? '0 4px 14px rgba(217, 119, 6, 0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {activeTab === 'dev_studio' && "Launch Developer Code Studio Free"}
              {activeTab === 'company_brain' && "Launch Enterprise Company Brain Free"}
              {activeTab === 'bharat_intelligence' && "Launch Bharat Intelligence Free"}
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

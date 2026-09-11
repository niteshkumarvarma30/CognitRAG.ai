'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2, Database, Brain, Sparkles, BookOpen, Mic, MicOff } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button, Input, Card, Badge, Skeleton } from '@/components/ui';
import SourceReceipt from './SourceReceipt';
import ConfidenceBreakdown from './ConfidenceBreakdown';

import { getApiUrl } from '@/lib/api';

const getApiBase = () => `${getApiUrl()}/api/v1`;


export default function Chat({ tenantId }) {


  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [workflowStatus, setWorkflowStatus] = useState('');
  const [activeSource, setActiveSource] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, workflowStatus]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processVoiceAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Please allow microphone permissions to use Sarvam Voice Chat.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceAudio = async (audioBlob) => {
    setIsTranscribing(true);
    setWorkflowStatus('Translating spoken Indic audio to English via Sarvam AI...');
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice_query.webm');

      const res = await fetch(`${getApiBase()}/voice/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Sarvam Voice Endpoint Error:", res.status, errText);
        throw new Error(`Sarvam voice transcription failed (${res.status}): ${errText}`);
      }


      const data = await res.json();
      if (data.transcript && data.transcript.trim().length > 0) {
        setInput(data.transcript);
        sendChatMessage(data.transcript);
      } else {
        setWorkflowStatus(data.message || 'No clear speech detected. Please speak closer to your microphone and try again.');
      }
    } catch (err) {
      console.error("Voice error:", err);
      setWorkflowStatus('Could not connect to voice service. Please type your query.');
    } finally {
      setIsTranscribing(false);
    }

  };

  const sendChatMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    const currentChatHistory = [...messages];
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setWorkflowStatus('Connecting to CognitRAG.ai...');

    try {
      const response = await fetch(`${getApiBase()}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          user_id: user?.id || 'default_user',
          message: text,
          chat_history: currentChatHistory
        })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (data.status === 'done') {
                  setMessages(prev => {
                      const newMsgs = [...prev];
                      if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].isStreaming) {
                          const existing = newMsgs[newMsgs.length - 1].content;
                          const finalContent = data.answer?.trim() || existing?.trim() || 'Hello! How can I assist you with your company knowledge today?';
                          newMsgs[newMsgs.length - 1] = { 
                            role: 'assistant', 
                            content: finalContent, 
                            audit_trail: data.audit_trail || []
                          };
                      } else {
                          const finalContent = data.answer?.trim() || 'Hello! How can I assist you with your company knowledge today?';
                          newMsgs.push({ 
                            role: 'assistant', 
                            content: finalContent, 
                            audit_trail: data.audit_trail || []
                          });
                      }
                      return newMsgs;
                  });
                  setWorkflowStatus('');
                } else if (data.token !== undefined) {
                  setMessages(prev => {
                      const newMsgs = [...prev];
                      if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].isStreaming) {
                          const lastMsg = { ...newMsgs[newMsgs.length - 1] };
                          lastMsg.content += data.token;
                          newMsgs[newMsgs.length - 1] = lastMsg;
                      } else {
                          newMsgs.push({ role: 'assistant', content: data.token, isStreaming: true });
                      }
                      return newMsgs;
                  });
                  setWorkflowStatus('');
                } else {
                  setWorkflowStatus(data.status);
                }
              } catch (err) {
                console.error("Failed to parse SSE", err);
              }
            }
          }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered a network error while connecting to CognitRAG.ai backend.' }]);
      setWorkflowStatus('');
    } finally {
      setIsLoading(false);
      setWorkflowStatus('');
    }
  };

  const getConfidenceLevel = (audit_trail) => {
    if (!audit_trail || audit_trail.length === 0) return 'low';
    if (audit_trail.length > 3) return 'high';
    return 'moderate';
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-6)', width: '100%', height: '100%', margin: '0' }}>
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', width: '100%' }}>
        
        {/* Header */}
        <header style={{ 
          padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          background: 'var(--surface-soft)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ 
              width: 42, height: 42, borderRadius: 'var(--radius-md)', 
              background: 'var(--primary-light)', color: 'var(--primary)', 
              display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}>
              <Brain size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 650, margin: 0, color: 'var(--text-primary)' }}>CognitRAG Workspace Brain</h2>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Workspace ID: {tenantId} • Hybrid GraphRAG + Sarvam Voice Active</div>
            </div>
          </div>
        </header>


        {/* Chat Area */}
        <div style={{ 
          flex: 1, padding: 'var(--space-6)', overflowY: 'auto', 
          display: 'flex', flexDirection: 'column', gap: 'var(--space-6)',
          background: 'var(--surface)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)'
        }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '520px', color: 'var(--text-secondary)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                <Brain size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 650, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>How can I help your team today?</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-5)', color: 'var(--text-muted)' }}>
                Ask in English or speak in any Indian language. CognitRAG retrieves verified context from Jira, GitHub, Slack, and Notion.
              </p>
              
              {/* Multilingual Voice Quick Starters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                <button 
                  onClick={() => startVoiceRecording()}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', 
                    borderRadius: 'var(--radius-pill)', border: '1px solid var(--primary)', 
                    background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8125rem', 
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' 
                  }}
                >
                  <Mic size={14} /> Speak in Hindi / Tamil / Telugu
                </button>
                <button 
                  onClick={() => sendChatMessage("What are our recent system architecture and deployment decisions?")}
                  style={{ 
                    padding: '8px 14px', borderRadius: 'var(--radius-pill)', 
                    border: '1px solid var(--border)', background: 'var(--surface-soft)', 
                    color: 'var(--text-secondary)', fontSize: '0.8125rem', cursor: 'pointer' 
                  }}
                >
                  "Recent Architecture Decisions"
                </button>
                <button 
                  onClick={() => sendChatMessage("Summarize current Jira issues and project blockers")}
                  style={{ 
                    padding: '8px 14px', borderRadius: 'var(--radius-pill)', 
                    border: '1px solid var(--border)', background: 'var(--surface-soft)', 
                    color: 'var(--text-secondary)', fontSize: '0.8125rem', cursor: 'pointer' 
                  }}
                >
                  "Summarize Jira Blockers"
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 'var(--space-3)'
            }}>
              {msg.role === 'assistant' && (
                <div style={{ 
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)', 
                  background: 'var(--primary)', color: 'white', flexShrink: 0,
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  <Brain size={16} />
                </div>
              )}
              
              <div style={{ 
                maxWidth: '75%', 
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-soft)', 
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: 'var(--space-4)', 
                borderRadius: 'var(--radius-lg)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                boxShadow: msg.role === 'user' ? 'var(--shadow-sm)' : 'none',
                fontSize: '0.9375rem', lineHeight: 1.6
              }}>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)' }}>{msg.content}</div>

                {/* Assistant Output Enhancements */}
                {msg.role === 'assistant' && msg.audit_trail && msg.audit_trail.length > 0 && !msg.isStreaming && (
                  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sources & Evidence</span>
                      <ConfidenceBreakdown 
                        confidence={getConfidenceLevel(msg.audit_trail)} 
                        sourcesCount={msg.audit_trail.length} 
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {msg.audit_trail.map((audit, idx) => {
                        const chipLabel = audit.ref ? `${audit.type ? audit.type.toUpperCase() + ': ' : ''}${audit.ref}` : `Citation ${idx + 1}`;
                        return (
                          <button 
                            key={idx}
                            onClick={() => setActiveSource({
                              type: audit.type || 'document',
                              title: audit.title || `Source Artifact #${idx + 1}`,
                              content: audit.content,
                              label: audit.label || audit.type || 'Source',
                              ref: audit.ref || `Citation ${idx + 1}`,
                              url: audit.url,
                              timestamp: audit.timestamp || 'Recently synced',
                              relevance_score: audit.confidence || 0.95
                            })}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '4px 10px', borderRadius: 'var(--radius-md)',
                              background: 'var(--surface)', border: '1px solid var(--border)',
                              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                          >
                            <BookOpen size={12} color="var(--primary)" />
                            {chipLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {workflowStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--surface-soft)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {workflowStatus}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: 'var(--space-4) var(--space-5)', 
          background: 'var(--surface)', 
          borderTop: '1px solid var(--border)', 
          borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' 
        }}>
          <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "🔴 Listening... Speak in Hindi, Tamil, Telugu, English..." : isTranscribing ? "Translating with Sarvam AI..." : "Ask anything or speak in any Indian language..."}
                disabled={isLoading || isRecording || isTranscribing}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: isRecording ? '2px solid var(--error)' : '1px solid var(--border)',
                  background: isRecording ? 'var(--error-light)' : 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Sarvam AI Multilingual Voice Button */}
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={isLoading || isTranscribing}
                title={isRecording ? "Stop Recording & Submit" : "Speak in Hindi, Tamil, Telugu, Marathi, etc."}
                style={{
                  background: isRecording ? 'var(--error)' : 'var(--primary-light)',
                  border: isRecording ? '1px solid var(--error)' : '1px solid var(--primary)',
                  color: isRecording ? '#ffffff' : 'var(--primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '10px 14px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                }}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isRecording ? "Stop" : "Voice"}</span>
              </button>

              <button 
                type="submit" 
                disabled={isLoading || isRecording || isTranscribing || !input.trim()}
                style={{ 
                  background: (!input.trim() || isLoading) ? 'var(--border)' : 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  padding: '10px 18px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </div>
          </form>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingLeft: '4px', paddingRight: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ⚡ Powered by <strong>Sarvam AI</strong>: Speak in Hindi, Tamil, Telugu, Marathi, Bengali & get verified English context.
            </span>
            {isRecording && (
              <Badge variant="error" style={{ fontSize: '0.7rem', animation: 'pulse 1s infinite' }}>
                RECORDING AUDIO... CLICK "STOP" TO SUBMIT
              </Badge>
            )}
          </div>
        </div>

      </div>

      <SourceReceipt 
        isOpen={!!activeSource}
        onClose={() => setActiveSource(null)}
        source={activeSource}
      />
    </div>
  );
}

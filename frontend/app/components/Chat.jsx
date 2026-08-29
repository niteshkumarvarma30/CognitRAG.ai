'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2, Database, Brain, Sparkles, BookOpen } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button, Input, Card, Badge, Skeleton } from '@/components/ui';
import SourceReceipt from './SourceReceipt';
import ConfidenceBreakdown from './ConfidenceBreakdown';

const API_BASE = 'http://localhost:8000/api/v1';

export default function Chat({ tenantId }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState('');
  const [activeSource, setActiveSource] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, workflowStatus]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const currentChatHistory = [...messages];
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setWorkflowStatus('Connecting to CognitRAG.ai...');

    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          user_id: user?.id || 'default_user',
          message: userMessage.content,
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
                          newMsgs[newMsgs.length - 1] = { 
                            role: 'assistant', 
                            content: data.answer, 
                            audit_trail: data.audit_trail || []
                          };
                      } else {
                          newMsgs.push({ 
                            role: 'assistant', 
                            content: data.answer, 
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
    <div style={{ display: 'flex', gap: 'var(--space-6)', width: '100%', height: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        
        {/* Header */}
        <header style={{ 
          padding: 'var(--space-5)', borderBottom: '1px solid var(--border)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          background: 'var(--surface-soft)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 'var(--radius-md)', 
              background: 'var(--primary-light)', color: 'var(--primary)', 
              display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}>
              <Brain size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 650, margin: 0, color: 'var(--text-primary)' }}>CognitRAG Workspace</h2>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{tenantId}</div>
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
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '400px', color: 'var(--text-secondary)' }}>
              <Sparkles size={48} style={{ color: 'var(--border)', margin: '0 auto var(--space-4)' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>How can I help you today?</h3>
              <p style={{ fontSize: '0.875rem' }}>Ask me about Jira issues, GitHub architecture, Slack decisions, or Notion documents.</p>
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
                      {msg.audit_trail.map((audit, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveSource({
                            type: audit.type === 'vector_chunk' ? 'document' : 'jira',
                            title: `Source Artifact #${idx + 1}`,
                            content: audit.content,
                            label: audit.type,
                            relevance_score: 0.95
                          })}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', borderRadius: 'var(--radius-md)',
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface)'}
                        >
                          <BookOpen size={12} />
                          Citation {idx + 1}
                        </button>
                      ))}
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
          padding: 'var(--space-5)', background: 'var(--surface)', 
          border: '1px solid var(--border)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' 
        }}>
          <form onSubmit={handleSendMessage} style={{ position: 'relative', display: 'flex', gap: 'var(--space-3)' }}>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your company's knowledge..."
              disabled={isLoading}
              style={{ flex: 1, paddingRight: '3rem' }}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              style={{ position: 'absolute', right: 'var(--space-2)', top: '50%', transform: 'translateY(-50%)', padding: 'var(--space-2)' }}
            >
              <Send size={16} />
            </Button>
          </form>
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

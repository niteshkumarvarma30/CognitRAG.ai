'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Database, Bot, User, Brain, RefreshCw, Server, Zap, Network } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import MemoryManager from './MemoryManager';

const API_BASE = 'http://localhost:8000/api/v1';

export default function Chat({ tenantId }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState('');
  const [graphContext, setGraphContext] = useState('');
  const [showMemoryManager, setShowMemoryManager] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, workflowStatus]);

  const handleResetMemory = async () => {
    if (!window.confirm("Are you sure you want to clear your conversation memory? This will delete all facts, context, and graph relationships learned about you.")) return;
    
    setIsLoading(true);
    setWorkflowStatus('Clearing Long-Term Memory...');
    try {
        await fetch(`${API_BASE}/memory/${tenantId}/${user.id}`, {
            method: 'DELETE'
        });
        setMessages([]);
    } catch (e) {
        console.error("Failed to reset memory", e);
    } finally {
        setIsLoading(false);
        setWorkflowStatus('');
    }
  };

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
          user_id: user.id, // Clerk User ID
          message: userMessage.content,
          chat_history: currentChatHistory
        })
      });

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
                          newMsgs[newMsgs.length - 1] = { role: 'assistant', content: data.answer, context: data.context };
                      } else {
                          newMsgs.push({ role: 'assistant', content: data.answer, context: data.context });
                      }
                      return newMsgs;
                  });
                  setGraphContext(data.graph_context || '');
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
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', width: '100%', height: '100%', maxWidth: '1600px', margin: '0 auto', overflow: 'hidden' }}>
      <div className="glass-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
      
      {/* PREMIUM HEADER */}
      <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(15,23,42,0.6), rgba(15,23,42,0.2))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
            <Brain size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CognitRAG.ai Assistant</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '0.02em' }}>Tenant Space: {tenantId}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Server size={14} style={{ color: '#60a5fa' }} />
            <span>Isolated Environment</span>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

          <button 
            onClick={() => setShowMemoryManager(true)}
            style={{ 
                background: 'rgba(139, 92, 246, 0.1)', 
                color: '#a78bfa', 
                border: '1px solid rgba(139, 92, 246, 0.3)', 
                padding: '0.6rem 1rem', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s'
            }}
            title="Manage Long-Term Memory"
          >
            <Database size={16} />
            <span>Manage Context</span>
          </button>

          <button 
            onClick={handleResetMemory}
            disabled={isLoading}
            style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#f87171', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                padding: '0.6rem 1rem', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s'
            }}
            title="Clear Long-Term Memory & Chat"
          >
            <RefreshCw size={16} />
            <span>Wipe Memory</span>
          </button>
        </div>
      </header>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.8 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Bot size={40} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>How can I help you today?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '400px', textAlign: 'center' }}>Send a message to instantly retrieve information from your organization's connected memory graph.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className={`avatar ${msg.role}`}>
              {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="white" />}
            </div>
            <div className="message-bubble">
              {msg.content.split('\n').map((line, j) => (
                <p key={j} style={{ minHeight: '1.2rem' }}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        
        {isLoading && workflowStatus && (
          <div className="message bot">
            <div className="avatar bot"><Bot size={20} color="white" /></div>
            <div className="message-bubble workflow-indicator">
              <span className="workflow-spinner"></span>
              <span className="workflow-text">{workflowStatus}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,23,42,0.4)' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <input
            type="text"
            placeholder="Ask CognitRAG.ai anything... (e.g. 'What is our current data strategy?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '1.25rem 1.5rem',
              fontSize: '1rem',
              color: 'white',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            style={{
              background: 'linear-gradient(135deg, var(--accent), #2563eb)',
              border: 'none',
              borderRadius: '24px',
              width: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || !input.trim()) ? 0.5 : 1,
              boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
              transition: 'all 0.2s'
            }}
          >
            <Send size={20} color="white" />
          </button>
        </form>
      </div>
      </div>

      <div className="glass-panel" style={{ width: '400px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,23,42,0.4)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Zap size={18} style={{ color: '#8b5cf6' }} />
            Graph Retrieval Stream
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', margin: 0 }}>Live metadata extracted from Neo4j</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', fontSize: '0.875rem', color: 'var(--text-main)', background: 'rgba(2,6,23,0.5)' }}>
          {graphContext ? (
            graphContext.split('\n').filter(line => line.trim()).map((line, idx) => (
              <div key={idx} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(30,41,59,0.5)', borderRadius: '8px', borderLeft: '3px solid #8b5cf6', lineHeight: '1.5', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {line}
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
              <Network size={48} style={{ margin: '0 auto 1rem', color: '#8b5cf6' }} />
              <p style={{ textAlign: 'center', maxWidth: '200px' }}>Ask a question to watch the AI traverse the graph database in real-time.</p>
            </div>
          )}
        </div>
      </div>

      {showMemoryManager && <MemoryManager tenantId={tenantId} onClose={() => setShowMemoryManager(false)} />}
    </div>
  );
}

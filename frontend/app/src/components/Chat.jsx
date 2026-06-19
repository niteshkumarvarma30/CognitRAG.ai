import { useState, useEffect, useRef } from 'react';
import { Send, Database, Bot, User, Brain, RefreshCw } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
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
    <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '1600px', margin: '0 auto', height: '90vh' }}>
      <div className="chat-container glass-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Brain className="logo-icon" size={32} />
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>CognitRAG.ai Assistant</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Connected to Company: {tenantId}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={handleResetMemory}
            disabled={isLoading}
            className="reset-memory-btn"
            style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
            }}
            title="Clear Long-Term Memory & Chat"
          >
            <RefreshCw size={16} />
            <span>Reset Memory</span>
          </button>
          <button 
            onClick={() => setShowMemoryManager(true)}
            className="reset-memory-btn"
            style={{ 
                background: 'rgba(139, 92, 246, 0.1)', 
                color: '#8b5cf6', 
                border: '1px solid rgba(139, 92, 246, 0.2)', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
            }}
            title="Manage Long-Term Memory"
          >
            <Database size={16} />
            <span>Manage Memory</span>
          </button>
          <div className="memory-badge">
            <Database size={16} />
            <span>Isolated Environment</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
            <Bot size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Send a message to start querying your enterprise knowledge graph.</p>
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

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <div className="input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask CognitRAG.ai anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </form>
      </div>

      <div className="glass-panel" style={{ width: '380px', display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} />
          Graph Retrieval
        </h3>
        <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {graphContext ? (
            graphContext.split('\n').filter(line => line.trim()).map((line, idx) => (
              <div key={idx} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '3px solid #8b5cf6', lineHeight: '1.4' }}>
                {line}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>
              <Database size={40} style={{ margin: '0 auto 1rem' }} />
              <p>Ask a question to see the Neo4j knowledge graph traversal.</p>
            </div>
          )}
        </div>
      </div>

      {showMemoryManager && <MemoryManager tenantId={tenantId} onClose={() => setShowMemoryManager(false)} />}
    </div>
  );
}

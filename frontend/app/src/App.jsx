import { useState, useEffect, useRef } from 'react';
import { Send, Database, MessageSquare, CreditCard, Bot, User, Menu, X, Brain } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:8000/api/v1';

// Default mock tenants for the selector
const TENANTS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Tenant A: PostgreSQL' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Tenant B: Intel' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Tenant C: AWS' }
];

const USERS = [
  { id: 'user_123', name: 'Alice' },
  { id: 'user_456', name: 'Bob' }
];

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [tenantId, setTenantId] = useState(TENANTS[0].id);
  const [userId, setUserId] = useState(USERS[0].id);
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Billing State
  const [billingData, setBillingData] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBilling();
    }
  }, [activeTab, tenantId]);

  const fetchBilling = async () => {
    try {
      const res = await fetch(`${API_BASE}/billing/${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setBillingData(data);
      }
    } catch (e) {
      console.error("Failed to fetch billing", e);
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

    try {
      // We pass the previous messages to the backend to simulate full LangGraph State
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          user_id: userId,
          message: userMessage.content,
          chat_history: currentChatHistory
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, context: data.context }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered a network error while connecting to OmniRAG.ai backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar glass-panel">
        <div className="logo-container">
          <Brain className="logo-icon" size={32} />
          <span className="logo-text">OmniRAG.ai</span>
        </div>

        <div className="context-selector">
          <label className="context-label">Active Tenant</label>
          <select 
            className="select-input" 
            value={tenantId} 
            onChange={(e) => setTenantId(e.target.value)}
          >
            {TENANTS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          
          <label className="context-label" style={{marginTop: '0.5rem'}}>Simulate User</label>
          <select 
            className="select-input" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)}
          >
            {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>

        <div className="nav-links">
          <a 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={20} />
            AI Assistant
          </a>
          <a 
            className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <CreditCard size={20} />
            Billing & Usage
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content glass-panel">
        {activeTab === 'chat' && (
          <div className="chat-container">
            <header className="chat-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Support Agent</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Powered by LangGraph & Sarvam</p>
              </div>
              <div className="memory-badge">
                <Database size={16} />
                <span>Episodic Memory Active</span>
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
              
              {isLoading && (
                <div className="message bot">
                  <div className="avatar bot"><Bot size={20} color="white" /></div>
                  <div className="message-bubble typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
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
                  placeholder="Ask OmniRAG.ai anything..."
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
        )}

        {activeTab === 'billing' && (
          <div className="billing-dashboard">
            <div className="billing-header">
              <h1>Usage & Billing</h1>
              <p>Current usage for tenant: {TENANTS.find(t => t.id === tenantId)?.name}</p>
            </div>
            
            <div className="billing-cards">
              <div className="billing-card glass-panel">
                <div className="billing-label">Total Tokens Consumed</div>
                <div className="billing-value">
                  {billingData ? billingData.total_tokens_used.toLocaleString() : '---'}
                </div>
              </div>
              
              <div className="billing-card glass-panel">
                <div className="billing-label">Estimated Bill (USD)</div>
                <div className="billing-value">
                  <span>$</span>{billingData ? billingData.estimated_cost_usd.toFixed(4) : '---'}
                </div>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Architecture Note</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Because you requested to use the internal Supabase <code>transactions</code> table as a replacement for Stripe, this dashboard directly queries your private multi-tenant backend. The users interact with the UI completely decoupled from the database mechanics!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

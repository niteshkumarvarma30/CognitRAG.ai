'use client';
import React, { useState, useEffect } from 'react';
import { Book, Plus, Trash2, Search, Building2, UserCircle } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const SemanticDictionary = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [definitions, setDefinitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [owner, setOwner] = useState('');
  const [scope, setScope] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDefinitions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const token = await getToken();
      const res = await fetch(`/api/v1/semantic/definitions?tenant_id=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDefinitions(data.definitions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`/api/v1/semantic/definition`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          tenant_id: user.id,
          term,
          definition,
          owner: owner || undefined,
          scope: scope || undefined
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to add definition');
      }
      
      setTerm('');
      setDefinition('');
      setOwner('');
      setScope('');
      setIsAdding(false);
      fetchDefinitions();
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this definition?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/v1/semantic/definition/${id}?tenant_id=${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || 'Failed to delete');
        return;
      }
      
      fetchDefinitions();
    } catch (e) {
      console.error(e);
      alert('An error occurred.');
    }
  };

  const filteredDefs = definitions.filter(d => 
    d.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Book style={{ color: 'var(--accent)' }} /> 
            Semantic Dictionary
          </h1>
          <p className="page-subtitle">Govern your business definitions. AI Agents strictly adhere to these definitions when calculating metrics or answering questions.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary"
        >
          <Plus size={18} /> New Definition
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Add Business Definition</h3>
          {errorMsg && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{errorMsg}</div>}
          
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Term / KPI Name *</label>
              <input 
                required 
                type="text" 
                value={term} 
                onChange={e => setTerm(e.target.value)}
                placeholder="e.g. Active Customer"
                style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Business Scope</label>
              <input 
                type="text" 
                value={scope} 
                onChange={e => setScope(e.target.value)}
                placeholder="e.g. Global Sales, Marketing"
                style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Exact Definition *</label>
              <textarea 
                required 
                rows={3}
                value={definition} 
                onChange={e => setDefinition(e.target.value)}
                placeholder="The precise business logic. E.g. 'A user who has logged in at least once in the last 30 days and has a paid subscription.'"
                style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Data Owner (Optional)</label>
              <input 
                type="text" 
                value={owner} 
                onChange={e => setOwner(e.target.value)}
                placeholder="e.g. VP of Finance"
                style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'white' }}
              />
            </div>
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Definition</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="glass-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Governed Terms</span>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search definitions..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '99px', color: 'white', outline: 'none' }}
            />
          </div>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading definitions...</div>
          ) : filteredDefs.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Book size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No semantic definitions found.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add your first definition to govern how AI interprets your data.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredDefs.map((def, idx) => (
                <div key={def.id} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <div style={{ flex: 1, paddingRight: '2rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent)', marginBottom: '0.5rem' }}>{def.term}</h4>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {def.definition}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {def.scope && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Building2 size={14} /> {def.scope}
                        </div>
                      )}
                      {def.owner && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <UserCircle size={14} /> {def.owner}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(def.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SemanticDictionary;

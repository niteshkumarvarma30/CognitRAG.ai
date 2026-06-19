import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Trash2, Plus, Brain, Settings } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/v1';

export default function MemoryManager({ tenantId, onClose }) {
  const { user } = useUser();
  const [facts, setFacts] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newPrefKey, setNewPrefKey] = useState('');
  const [newPrefVal, setNewPrefVal] = useState('');

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const factsRes = await fetch(`${API_BASE}/memory/${tenantId}/${user.id}/facts`);
      const prefsRes = await fetch(`${API_BASE}/memory/${tenantId}/${user.id}/preferences`);
      
      const factsData = await factsRes.json();
      const prefsData = await prefsRes.json();
      
      setFacts(Array.isArray(factsData) ? factsData : []);
      setPreferences(Array.isArray(prefsData) ? prefsData : []);
    } catch (e) {
      console.error("Failed to load memory:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, [tenantId, user.id]);

  const deleteFact = async (factId) => {
    try {
      await fetch(`${API_BASE}/memory/${tenantId}/${user.id}/facts/${factId}`, { method: 'DELETE' });
      setFacts(prev => prev.filter(f => f.id !== factId));
    } catch (e) {
      console.error("Failed to delete fact:", e);
    }
  };

  const deletePreference = async (prefKey) => {
    try {
      await fetch(`${API_BASE}/memory/${tenantId}/${user.id}/preferences/${prefKey}`, { method: 'DELETE' });
      setPreferences(prev => prev.filter(p => p.pref_key !== prefKey));
    } catch (e) {
      console.error("Failed to delete preference:", e);
    }
  };

  const addPreference = async (e) => {
    e.preventDefault();
    if (!newPrefKey.trim() || !newPrefVal.trim()) return;
    
    try {
      await fetch(`${API_BASE}/memory/${tenantId}/${user.id}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newPrefKey.trim(), value: newPrefVal.trim() })
      });
      setNewPrefKey('');
      setNewPrefVal('');
      fetchMemory();
    } catch (e) {
      console.error("Failed to add preference:", e);
    }
  };

  return (
    <div className="memory-manager-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="memory-manager-modal glass-panel" style={{
        width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
        padding: '2rem', borderRadius: '12px'
      }}>
        <div className="memory-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={24} color="#8b5cf6" />
            <h2 style={{ margin: 0 }}>User Memory</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Memory...</div>
        ) : (
          <div className="memory-content">
            
            <section className="memory-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Settings size={18}/> Formatting Preferences</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Explicit rules the AI uses to format your answers.</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {preferences.length === 0 && <li style={{ fontStyle: 'italic', color: 'gray' }}>No preferences explicitly saved.</li>}
                {preferences.map((p, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                    <div>
                      <strong>{p.pref_key}:</strong> {p.pref_value}
                    </div>
                    <button onClick={() => deletePreference(p.pref_key)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>

              <form onSubmit={addPreference} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Rule (e.g. format)" 
                  value={newPrefKey} 
                  onChange={e => setNewPrefKey(e.target.value)} 
                  className="chat-input"
                  style={{ flex: 1 }}
                />
                <input 
                  type="text" 
                  placeholder="Value (e.g. use bullet points)" 
                  value={newPrefVal} 
                  onChange={e => setNewPrefVal(e.target.value)} 
                  className="chat-input"
                  style={{ flex: 2 }}
                />
                <button type="submit" className="primary-btn" style={{ padding: '0.5rem' }}><Plus size={16} /></button>
              </form>
            </section>

            <section className="memory-section" style={{ marginTop: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Brain size={18}/> Extracted User Facts</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Specific facts the AI has automatically learned about you during chat.</p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {facts.length === 0 && <li style={{ fontStyle: 'italic', color: 'gray' }}>No facts automatically extracted yet.</li>}
                {facts.map((f, idx) => (
                  <li key={f.id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                    <span>{f.fact}</span>
                    <button onClick={() => deleteFact(f.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}

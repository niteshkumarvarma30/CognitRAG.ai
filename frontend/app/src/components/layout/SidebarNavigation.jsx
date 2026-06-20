import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  Vault, 
  Network, 
  Clock, 
  Puzzle,
  Settings,
  Terminal,
  Activity
} from 'lucide-react';
import { UserButton, useUser, SignedIn } from '@clerk/clerk-react';

const SidebarNavigation = () => {
  const { user } = useUser();
  return (
    <div className="sidebar-container">
      <div className="flex-row" style={{ marginBottom: '3rem', padding: '0 0.75rem' }}>
        <Brain size={32} className="text-accent" style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 8px var(--accent-glow))' }} />
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em' }} className="text-gradient">CognitRAG.ai</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Memory Infrastructure</span>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Home size={18} /> Home
        </NavLink>
        <NavLink to="/metrics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Activity size={18} /> Intelligence Metrics
        </NavLink>
      </div>

      <div className="nav-section">
        <div className="nav-label">Intelligence</div>
        <NavLink to="/memory-hub" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Brain size={18} /> Memory Hub
        </NavLink>
        <NavLink to="/knowledge-vault" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Vault size={18} /> Knowledge Vault
        </NavLink>
        <NavLink to="/graph-explorer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Network size={18} /> Graph Explorer
        </NavLink>
        <NavLink to="/timeline" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Clock size={18} /> Timeline
        </NavLink>
      </div>

      <div className="nav-section">
        <div className="nav-label">Platform</div>
        <NavLink to="/playground" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Terminal size={18} /> AI Playground
        </NavLink>
        <NavLink to="/integrations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Puzzle size={18} /> Integrations
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} /> Control Center
        </NavLink>
      </div>
      
      <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
        <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</div>
            <div className="flex-row" style={{ marginTop: '0.5rem', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Memory Active</span>
            </div>
          </div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;

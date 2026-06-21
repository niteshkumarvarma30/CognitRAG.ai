'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Brain, 
  Database, // Replaced Vault with Database
  Network, 
  Clock, 
  Puzzle,
  Settings,
  Terminal,
  Activity,
  Receipt
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

const SidebarNavigation = () => {
  const { user } = useUser();
  const pathname = usePathname();

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <div className="sidebar-container">
      <div className="flex-row" style={{ marginTop: '0.5rem', marginBottom: '3rem', padding: '0 0.75rem', flexShrink: 0 }}>
        <Brain size={32} className="text-accent" style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 8px var(--accent-glow))', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em' }} className="text-gradient">CognitRAG.ai</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Memory Infrastructure</span>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        <Link href="/home" className={`nav-link ${isActive('/home')}`}>
          <Home size={18} /> Home
        </Link>
        <Link href="/metrics" className={`nav-link ${isActive('/metrics')}`}>
          <Activity size={18} /> Intelligence Metrics
        </Link>
        <Link href="/brain-bills" className={`nav-link ${isActive('/brain-bills')}`}>
          <Receipt size={18} /> Brain Bills
        </Link>
      </div>

      <div className="nav-section">
        <div className="nav-label">Intelligence</div>
        <Link href="/memory-hub" className={`nav-link ${isActive('/memory-hub')}`}>
          <Brain size={18} /> Memory Hub
        </Link>
        <Link href="/knowledge-vault" className={`nav-link ${isActive('/knowledge-vault')}`}>
          <Database size={18} /> Knowledge Vault
        </Link>
        <Link href="/graph-explorer" className={`nav-link ${isActive('/graph-explorer')}`}>
          <Network size={18} /> Graph Explorer
        </Link>
        <Link href="/timeline" className={`nav-link ${isActive('/timeline')}`}>
          <Clock size={18} /> Timeline
        </Link>
      </div>

      <div className="nav-section">
        <div className="nav-label">Platform</div>
        <Link href="/playground" className={`nav-link ${isActive('/playground')}`}>
          <Terminal size={18} /> AI Playground
        </Link>
        <Link href="/integrations" className={`nav-link ${isActive('/integrations')}`}>
          <Puzzle size={18} /> Integrations
        </Link>
        <Link href="/settings" className={`nav-link ${isActive('/settings')}`}>
          <Settings size={18} /> Control Center
        </Link>
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
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;

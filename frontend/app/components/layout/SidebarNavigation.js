'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Brain, Database, Network, Settings,
  Activity, Shield, Puzzle, MessageSquare
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

const SidebarNavigation = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/') ? 'active' : '';

  return (
    <div className="sidebar-container">
      {/* Logo */}
      <div className="flex-row" style={{ marginTop: '0.5rem', marginBottom: '2.5rem', padding: '0 0.75rem', flexShrink: 0 }}>
        <Brain size={32} style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 8px var(--accent-glow))', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em' }} className="text-gradient">
            CognitRAG.ai
          </h2>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Company Brain
          </span>
        </div>
      </div>

      {/* Workspace */}
      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        <Link href="/home" className={`nav-link ${isActive('/home')}`}>
          <Home size={17} /> Dashboard
        </Link>
        <Link href="/metrics" className={`nav-link ${isActive('/metrics')}`}>
          <Activity size={17} /> Citation Audit
        </Link>
      </div>

      {/* Ask Brain */}
      <div className="nav-section">
        <div className="nav-label">Intelligence</div>
        <Link href="/ask" className={`nav-link ${isActive('/ask')}`}>
          <MessageSquare size={17} /> Ask Brain
        </Link>
        <Link href="/knowledge" className={`nav-link ${isActive('/knowledge')}`}>
          <Database size={17} /> Knowledge Library
        </Link>
        <Link href="/knowledge/graph" className={`nav-link ${isActive('/knowledge/graph')}`}>
          <Network size={17} /> Graph Explorer
        </Link>
      </div>

      {/* Platform */}
      <div className="nav-section">
        <div className="nav-label">Platform</div>
        <Link href="/integrations" className={`nav-link ${isActive('/integrations')}`}>
          <Puzzle size={17} /> Integrations
        </Link>
        <Link href="/security" className={`nav-link ${isActive('/security')}`}>
          <Shield size={17} /> Security & Access
        </Link>
        <Link href="/settings" className={`nav-link ${isActive('/settings')}`}>
          <Settings size={17} /> Settings
        </Link>
      </div>

      {/* User */}
      <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brain Status</div>
            <div className="flex-row" style={{ marginTop: '0.4rem', gap: '0.4rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent-glow)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active</span>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;

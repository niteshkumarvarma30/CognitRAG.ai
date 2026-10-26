'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, SignOutButton, useUser, useAuth } from '@clerk/nextjs';
import { 
  LayoutDashboard, MessageSquare, Plug, Network, 
  Database, Shield, Settings, Bell, ChevronDown, 
  ChevronsUpDown, Brain, Plus, LogOut, Loader2, Code2, Activity,
  Building2, FileText, Menu, X
} from 'lucide-react';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('solo');

  // Sync plan from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('cognitrag_plan');
      if (p) setCurrentPlan(p);
    }
  }, []);

  // Close mobile sidebar on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Auth guard — redirect unauthenticated users to sign-in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const allEmails = [
    user?.primaryEmailAddress?.emailAddress,
    ...(user?.emailAddresses?.map(e => e.emailAddress) || [])
  ].filter(Boolean).map(e => e.toLowerCase().trim());
  const SUPERADMIN_EMAIL = 'niteshkumarvarma5722@gmail.com';
  const isSuperAdmin = allEmails.includes(SUPERADMIN_EMAIL.toLowerCase().trim());
  const currentPersonaInfo = {
    name: 'CognitRAG',
    tag: 'Company Brain AI',
    icon: Brain,
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.15)',
    badgeColor: '#818cf8'
  };

  const navGroups = [
    {
      title: 'Company Brain',
      links: [
        { name: 'Ask Brain', href: '/ask', icon: MessageSquare },
        { name: 'Workspace Integrations', href: '/integrations', icon: Plug },
        { name: 'Knowledge Vault', href: '/knowledge', icon: Database },
        { name: 'Knowledge Graph', href: '/knowledge/graph', icon: Network },
        { name: 'Citation Audit', href: '/metrics', icon: Activity },
      ]
    },
    {
      title: 'Subscription & Org',
      links: [
        { name: 'Plan & Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  if (isSuperAdmin) {
    navGroups[1].links.unshift({
      name: 'Founder Command Center',
      href: '/dashboard',
      icon: LayoutDashboard
    });
  }

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}>
      
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
          className="mobile-only"
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}
        style={{ 
          width: '260px', flexShrink: 0, borderRight: '1px solid var(--border)', 
          background: 'var(--surface)', display: 'flex', flexDirection: 'column',
          zIndex: 100
        }}
      >
        
        {/* Dedicated Persona Identity Header (Locked - Zero Persona Switching) */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
          <div 
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center',
              padding: '8px 12px', background: 'var(--surface-soft)', 
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div style={{ 
                width: 28, height: 28, borderRadius: '6px', 
                background: currentPersonaInfo.bg, color: currentPersonaInfo.color,
                display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0
              }}>
                <currentPersonaInfo.icon size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentPersonaInfo.name}
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: currentPersonaInfo.badgeColor }}>
                  {currentPersonaInfo.tag}
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-only"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                marginLeft: '8px'
              }}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>


        {/* Navigation Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-3)' }}>
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ 
                fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', 
                textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 var(--space-3) var(--space-2)' 
              }}>
                {group.title}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                          padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                          fontSize: '0.875rem', fontWeight: isActive ? 600 : 500,
                          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                          background: isActive ? 'var(--primary-light)' : 'transparent',
                          textDecoration: 'none', transition: 'all 0.15s ease'
                        }}
                        onMouseOver={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--surface-soft)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div style={{ 
          padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)', gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 34, height: 34 } } }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 650, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName || 'User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ 
                  fontSize: '0.625rem', 
                  fontWeight: 700, 
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase', 
                  background: isSuperAdmin ? 'rgba(99, 102, 241, 0.15)' : currentPlan === 'teams' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                  color: isSuperAdmin ? '#818cf8' : currentPlan === 'teams' ? '#a5b4fc' : '#10b981', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  border: '1px solid ' + (isSuperAdmin ? 'rgba(99, 102, 241, 0.3)' : currentPlan === 'teams' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)')
                }}>
                  {isSuperAdmin ? 'Founder' : currentPlan === 'teams' ? 'Teams Plan' : 'Solo Plan'}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </div>
          
          <SignOutButton redirectUrl="/">
            <button style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px', borderRadius: 'var(--radius-sm)', flexShrink: 0
            }} title="Sign out" onMouseOver={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--surface-soft)' }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
              <LogOut size={16} />
            </button>
          </SignOutButton>
        </div>

      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ 
          height: '64px', flexShrink: 0, borderBottom: '1px solid var(--border)', 
          background: 'var(--surface)', display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', padding: '0 clamp(12px, 3vw, 24px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-only"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden' }}>
              <span style={{ color: currentPersonaInfo.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{currentPersonaInfo.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pathname === '/dashboard' ? 'Founder Command Center' : 
                 pathname === '/ask' ? 'Ask Brain' :
                 pathname === '/integrations' ? 'Workspace Integrations' :
                 pathname === '/knowledge' ? 'Knowledge Vault' :
                 pathname === '/knowledge/graph' ? 'Knowledge Graph' :
                 pathname === '/metrics' ? 'Citation Audit' :
                 pathname === '/settings' ? 'Plan & Settings' :
                 pathname.split('/').pop().charAt(0).toUpperCase() + pathname.split('/').pop().slice(1)}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
              cursor: 'pointer', display: 'flex', position: 'relative' 
            }}>
              <Bell size={20} />
              <span style={{ 
                position: 'absolute', top: -2, right: -2, width: 8, height: 8, 
                background: 'var(--error)', borderRadius: '50%', border: '2px solid var(--surface)' 
              }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ 
          flex: 1, 
          overflow: (pathname === '/dev-studio' || pathname === '/knowledge/graph') ? 'hidden' : 'auto', 
          padding: (pathname === '/dev-studio' || pathname === '/knowledge/graph') ? '0' : 'clamp(12px, 3vw, 24px)',
          display: (pathname === '/dev-studio' || pathname === '/knowledge/graph') ? 'flex' : 'block',
          flexDirection: 'column',
          height: (pathname === '/dev-studio' || pathname === '/knowledge/graph') ? 'calc(100vh - 64px)' : 'auto'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}

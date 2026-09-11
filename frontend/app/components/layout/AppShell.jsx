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
  const isAdminView = isSuperAdmin && (pathname === '/dashboard' || pathname === '/metrics' || pathname === '/settings');

  const isEnterpriseView = pathname.startsWith('/enterprise-brain');
  const isBharatView = pathname.startsWith('/bharat-intelligence');

  // Strict zero-crossover navigation: each persona has ONLY its own tools
  let navGroups = [];
  let currentPersonaInfo = {
    name: 'Developer Code Studio',
    tag: 'Active Environment',
    icon: Code2,
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    badgeColor: '#6366f1'
  };

  if (isAdminView) {
    currentPersonaInfo = {
      name: 'SuperAdmin Console',
      tag: 'Platform Governance',
      icon: Shield,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
      badgeColor: '#8b5cf6'
    };
    navGroups = [
      {
        title: 'Admin Governance',
        links: [
          { name: 'Admin Command Center', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Persona Analytics', href: '/metrics', icon: Activity },
          { name: 'Platform Settings', href: '/settings', icon: Settings },
        ]
      }
    ];
  } else if (isEnterpriseView) {
    currentPersonaInfo = {
      name: 'Enterprise Brain',
      tag: 'Private Pilot',
      icon: Building2,
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.12)',
      badgeColor: '#0284c7'
    };
    navGroups = [
      {
        title: 'Enterprise Brain',
        links: [
          { name: 'Pilot Overview & Contact', href: '/enterprise-brain', icon: Building2 },
        ]
      },
      {
        title: 'Workspace',
        links: [
          { name: 'Settings', href: '/enterprise-brain/settings', icon: Settings },
        ]
      }
    ];
  } else if (isBharatView) {
    currentPersonaInfo = {
      name: 'Bharat Intelligence',
      tag: 'Sarvam AI Pilot',
      icon: FileText,
      color: '#d97706',
      bg: 'rgba(217, 119, 6, 0.12)',
      badgeColor: '#d97706'
    };
    navGroups = [
      {
        title: 'Bharat Intelligence',
        links: [
          { name: 'Pilot Program & Contact', href: '/bharat-intelligence', icon: FileText },
        ]
      },
      {
        title: 'Workspace',
        links: [
          { name: 'Settings', href: '/bharat-intelligence/settings', icon: Settings },
        ]
      }
    ];
  } else {
    // Standard Developer Code Studio
    currentPersonaInfo = {
      name: 'Developer Code Studio',
      tag: 'Isolated Container',
      icon: Code2,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)',
      badgeColor: '#6366f1'
    };
    navGroups = [
      {
        title: 'Developer Studio',
        links: [
          { name: 'Code Studio', href: '/dev-studio', icon: Code2 },
          { name: 'AST Call Graph', href: '/knowledge/graph', icon: Network },
          { name: 'Repository Files', href: '/knowledge', icon: Database },
        ]
      },
      {
        title: 'Workspace',
        links: [
          { name: 'Settings', href: '/dev-studio/settings', icon: Settings },
        ]
      }
    ];
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
                  background: isSuperAdmin ? 'rgba(99, 102, 241, 0.15)' : isEnterpriseView ? 'rgba(2, 132, 199, 0.15)' : isBharatView ? 'rgba(217, 119, 6, 0.15)' : '#eef2ff', 
                  color: isSuperAdmin ? '#818cf8' : isEnterpriseView ? '#0284c7' : isBharatView ? '#d97706' : '#4f46e5', 
                  padding: '1px 6px', 
                  borderRadius: '4px', 
                  border: '1px solid ' + (isSuperAdmin ? 'rgba(99, 102, 241, 0.3)' : isEnterpriseView ? 'rgba(2, 132, 199, 0.3)' : isBharatView ? 'rgba(217, 119, 6, 0.3)' : '#c7d2fe')
                }}>
                  {isSuperAdmin ? 'SuperAdmin' : isEnterpriseView ? 'Enterprise Pilot' : isBharatView ? 'Bharat Pilot' : 'Developer'}
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
                {pathname === '/dashboard' ? 'Command Center' : 
                 pathname === '/enterprise-brain' ? 'Pilot Overview' :
                 pathname === '/bharat-intelligence' ? 'Pilot Program' :
                 pathname === '/dev-studio' ? 'Code Studio' :
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

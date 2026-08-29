'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserButton, SignOutButton, useUser, useAuth } from '@clerk/nextjs';
import { 
  LayoutDashboard, MessageSquare, Plug, Network, 
  Database, Shield, Settings, Bell, ChevronDown, 
  ChevronsUpDown, Brain, Plus, LogOut, Loader2
} from 'lucide-react';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [isWorkspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth guard — redirect unauthenticated users to sign-in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // In a real implementation, we would fetch from /api/v1/me here
  // For P0.5 frontend shell, we mock the API response to demonstrate the UI
  useEffect(() => {
    if (isLoaded && user) {
      // Simulate API fetch delay
      setTimeout(() => {
        const mockWorkspaces = [
          { id: 'ws_1', name: 'Acme Corp', slug: 'acme', plan: 'enterprise', role: 'admin' },
          { id: 'ws_2', name: 'Personal', slug: 'personal', plan: 'free', role: 'admin' }
        ];
        setWorkspaces(mockWorkspaces);
        setActiveWorkspace(mockWorkspaces[0]);
        setIsLoading(false);
      }, 600);
    }
  }, [user, isLoaded]);

  const navGroups = [
    {
      title: 'Platform',
      links: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Ask Brain', href: '/ask', icon: MessageSquare },
        { name: 'Connectors', href: '/integrations', icon: Plug },
      ]
    },
    {
      title: 'Knowledge',
      links: [
        { name: 'Graph Explorer', href: '/knowledge/graph', icon: Network },
        { name: 'Library', href: '/knowledge', icon: Database },
      ]
    },
    {
      title: 'Administration',
      links: [
        { name: 'Security & Access', href: '/security', icon: Shield },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  if (!isLoaded || isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ 
        width: '260px', flexShrink: 0, borderRight: '1px solid var(--border)', 
        background: 'var(--surface)', display: 'flex', flexDirection: 'column' 
      }}>
        
        {/* Workspace Switcher */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <button 
            onClick={() => setWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-2) var(--space-3)', background: 'var(--surface-soft)', 
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ 
                width: 24, height: 24, borderRadius: 'var(--radius-sm)', 
                background: 'var(--primary)', color: 'white',
                display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                <Brain size={14} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeWorkspace?.name || 'Select Workspace'}
              </span>
            </div>
            <ChevronsUpDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Workspace Dropdown */}
          {isWorkspaceMenuOpen && (
            <div style={{ 
              position: 'absolute', top: 'calc(100% - var(--space-2))', left: 'var(--space-4)', right: 'var(--space-4)', 
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', 
              boxShadow: 'var(--shadow-lg)', zIndex: 100, padding: 'var(--space-2)', marginTop: '4px'
            }}>
              {workspaces.map(ws => (
                <button 
                  key={ws.id}
                  onClick={() => { setActiveWorkspace(ws); setWorkspaceMenuOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: activeWorkspace?.id === ws.id ? 'var(--surface-soft)' : 'transparent',
                    border: 'none', textAlign: 'left',
                  }}
                  onMouseOver={(e) => { if(activeWorkspace?.id !== ws.id) e.currentTarget.style.background = 'var(--surface-soft)'; }}
                  onMouseOut={(e) => { if(activeWorkspace?.id !== ws.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />}
                </button>
              ))}
              <div style={{ height: '1px', background: 'var(--border)', margin: 'var(--space-1) 0' }} />
              <button 
                onClick={() => router.push('/onboarding')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: 'transparent', border: 'none', color: 'var(--text-secondary)'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Plus size={14} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Create Workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
          {navGroups.map((group, i) => (
            <div key={i} style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ 
                fontSize: '0.75rem', fontWeight: 650, color: 'var(--text-muted)', 
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-2)',
                paddingLeft: 'var(--space-2)'
              }}>
                {group.title}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.links.map(link => {
                  // Basic active matching logic
                  const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <Link href={link.href} style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                        padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                        textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        background: isActive ? 'var(--primary-light)' : 'transparent',
                        fontWeight: isActive ? 600 : 500, fontSize: '0.875rem',
                        transition: 'all 150ms ease'
                      }}>
                        <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                        {link.name}
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
          padding: 'var(--space-4)', borderTop: '1px solid var(--border)', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', overflow: 'hidden' }}>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.fullName || 'User'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.primaryEmailAddress?.emailAddress}</div>
            </div>
          </div>
          
          <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
            <button style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)'
            }} title="Sign out" onMouseOver={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--surface-soft)' }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
              <LogOut size={18} />
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
          justifyContent: 'space-between', padding: '0 var(--space-6)'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {/* Extremely simple breadcrumb for now */}
            {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop().charAt(0).toUpperCase() + pathname.split('/').pop().slice(1)}
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
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

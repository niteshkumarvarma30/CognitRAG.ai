import React from 'react';
import SidebarNavigation from '@/components/layout/SidebarNavigation';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <SidebarNavigation />
      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}

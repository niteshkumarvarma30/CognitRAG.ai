import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNavigation from './SidebarNavigation';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <SidebarNavigation />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

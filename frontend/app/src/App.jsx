import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import HomeDashboard from './pages/HomeDashboard';
import MemoryHub from './pages/MemoryHub';
import KnowledgeVault from './pages/KnowledgeVault';
import GraphExplorer from './pages/GraphExplorer';
import TimelineView from './pages/TimelineView';
import AIPlayground from './pages/AIPlayground';
import { MetricsPage, IntegrationsPage, SettingsPage } from './pages/Placeholders';
import './index.css';

function App() {
  return (
    <Routes>
      {/* Public Landing */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Workspace App Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/metrics" element={<MetricsPage />} />
        
        <Route path="/memory-hub" element={<MemoryHub />} />
        <Route path="/knowledge-vault" element={<KnowledgeVault />} />
        <Route path="/graph-explorer" element={<GraphExplorer />} />
        <Route path="/timeline" element={<TimelineView />} />
        
        <Route path="/playground" element={<AIPlayground />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

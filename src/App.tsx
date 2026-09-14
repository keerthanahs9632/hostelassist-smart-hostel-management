import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { DemoBanner } from './components/common/DemoBanner';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ComplaintsManagement } from './components/admin/ComplaintsManagement';
import { AssetManagement } from './components/admin/AssetManagement';
import { AnalyticsView } from './components/admin/AnalyticsView';
import { PreventiveMaintenanceView } from './components/admin/PreventiveMaintenanceView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { UserRole } from './types';

function MainLayout() {
  const { user, switchDemoRole } = useAuth();
  const [activeView, setActiveView] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectRoleFromLanding = async (role: UserRole) => {
    await switchDemoRole(role);
    setActiveView('dashboard');
  };

  const renderContent = () => {
    if (!user || activeView === 'landing') {
      return (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onSelectRole={handleSelectRoleFromLanding}
        />
      );
    }

    // Role-specific main views
    if (activeView === 'dashboard') {
      if (user.role === 'STUDENT') {
        return <StudentDashboard />;
      }
      if (user.role === 'TECHNICIAN') {
        return <TechnicianDashboard />;
      }
      if (user.role === 'ADMIN') {
        return <AdminDashboard onNavigate={(v) => setActiveView(v)} />;
      }
    }

    // Administrative views
    if (user.role === 'ADMIN') {
      switch (activeView) {
        case 'complaints':
          return <ComplaintsManagement />;
        case 'assets':
          return <AssetManagement />;
        case 'analytics':
          return <AnalyticsView />;
        case 'preventive':
          return <PreventiveMaintenanceView />;
        case 'audit':
          return <AuditLogsView />;
        default:
          return <AdminDashboard onNavigate={(v) => setActiveView(v)} />;
      }
    }

    // Default fallback
    if (user.role === 'STUDENT') return <StudentDashboard />;
    if (user.role === 'TECHNICIAN') return <TechnicianDashboard />;
    return <AdminDashboard onNavigate={(v) => setActiveView(v)} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      <DemoBanner onNavigateToView={setActiveView} />
      <Navbar
        onOpenAuth={handleOpenAuth}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="flex-1 w-full pb-16">
        {renderContent()}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

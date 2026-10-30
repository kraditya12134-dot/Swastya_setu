/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/public/LandingPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewView } from './components/dashboard/OverviewView';
import { PatientListView } from './components/dashboard/PatientListView';
import { PatientDetailView } from './components/dashboard/PatientDetailView';
import { ReferralsView } from './components/dashboard/ReferralsView';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { SettingsView } from './components/dashboard/SettingsView';
import { SafetyGuidelinesView } from './components/dashboard/SafetyGuidelinesView';
import { NearbyHospitalsView } from './components/dashboard/NearbyHospitalsView';
import { UserProfileView } from './components/dashboard/UserProfileView';
import { PatientRegistrationModal } from './components/dashboard/PatientRegistrationModal';
import { ScreeningFormModal } from './components/dashboard/ScreeningFormModal';
import { PrintableReportModal } from './components/dashboard/PrintableReportModal';
import { GoogleAuthModal } from './components/common/GoogleAuthModal';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

import { RoleLoginPage, RoleLoginRoute } from './components/auth/RoleLoginPage';
import { RoleRegisterPage, RoleRegisterRoute } from './components/auth/RoleRegisterPage';

const AccessDeniedView: React.FC = () => {
  const { role, setDashboardTab } = useApp();
  return (
    <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Access Restricted by Role Permissions
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Your active persona ({role.toUpperCase()}) is not authorized to access this module. Row Level Security and frontend policy enforce strict data partitioning.
        </p>
      </div>
      <button
        onClick={() => setDashboardTab('overview')}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Permitted Overview</span>
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { 
    view, 
    setView,
    dashboardTab, 
    isPermittedTab,
    selectedPatientId, 
    setSelectedPatientId,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    isScreeningModalOpen,
    setIsScreeningModalOpen,
    activeScreeningPatient,
    startScreening,
    printableReport,
    setPrintableReport,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useApp();

  // Route state tracking for browser history and direct URL access
  const [currentPath, setCurrentPath] = React.useState<string>(() => {
    return window.location.pathname || '/';
  });

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Determine if active route is a role-specific login route
  const getRoleLoginRoute = (path: string): RoleLoginRoute | null => {
    if (path.startsWith('/login/admin')) return 'admin';
    if (path.startsWith('/login/chw')) return 'chw';
    if (path.startsWith('/login/doctor')) return 'doctor';
    return null;
  };

  // Determine if active route is a role-specific registration route
  const getRoleRegisterRoute = (path: string): RoleRegisterRoute | null => {
    if (path.startsWith('/register/admin')) return 'admin';
    if (path.startsWith('/register/chw')) return 'chw';
    if (path.startsWith('/register/doctor')) return 'doctor';
    return null;
  };

  const roleLoginRoute = getRoleLoginRoute(currentPath);
  const roleRegisterRoute = getRoleRegisterRoute(currentPath);

  // If on a dedicated role login page
  if (roleLoginRoute) {
    return (
      <RoleLoginPage 
        route={roleLoginRoute} 
        onNavigate={(p) => navigateTo(p)} 
      />
    );
  }

  // If on a dedicated role registration page
  if (roleRegisterRoute) {
    return (
      <RoleRegisterPage 
        route={roleRegisterRoute} 
        onNavigate={(p) => navigateTo(p)} 
      />
    );
  }

  return (
    <>
      {view === 'public' ? (
        <LandingPage onNavigateToRoleLogin={(route) => navigateTo(`/login/${route}`)} />
      ) : (
        <DashboardLayout onNavigateToRoleLogin={(route) => navigateTo(`/login/${route}`)}>
          {selectedPatientId ? (
            <PatientDetailView 
              patientId={selectedPatientId} 
              onBack={() => setSelectedPatientId(null)} 
            />
          ) : !isPermittedTab(dashboardTab) ? (
            <AccessDeniedView />
          ) : (
            <div className="transition-opacity duration-200 ease-in-out">
              {dashboardTab === 'overview' && <OverviewView />}
              {dashboardTab === 'patients' && <PatientListView />}
              {dashboardTab === 'referrals' && <ReferralsView />}
              {dashboardTab === 'analytics' && <AnalyticsView />}
              {dashboardTab === 'hospitals' && <NearbyHospitalsView />}
              {dashboardTab === 'settings' && <SettingsView />}
              {dashboardTab === 'safety' && <SafetyGuidelinesView />}
              {dashboardTab === 'profile' && <UserProfileView />}
            </div>
          )}
        </DashboardLayout>
      )}

      {/* Global Modals */}
      <PatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegistered={(newPatient, startScreeningImmediately) => {
          if (startScreeningImmediately) {
            startScreening(newPatient);
          }
        }}
      />

      <ScreeningFormModal
        isOpen={isScreeningModalOpen}
        patient={activeScreeningPatient}
        onClose={() => setIsScreeningModalOpen(false)}
      />

      <PrintableReportModal
        data={printableReport}
        onClose={() => setPrintableReport(null)}
      />

      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

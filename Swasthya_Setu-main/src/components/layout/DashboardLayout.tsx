import React from 'react';
import { 
  Activity, 
  Users, 
  HeartPulse, 
  GitBranch, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  Plus, 
  Languages, 
  Database,
  Sun,
  Moon,
  ShieldCheck,
  User,
  LogOut,
  Lock,
  Building2,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { DashboardTab, UserRole } from '../../types';
import { MedicalDisclaimerBanner } from '../common/MedicalDisclaimerBanner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onNavigateToRoleLogin?: (route: 'admin' | 'chw' | 'doctor') => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onNavigateToRoleLogin }) => {
  const { 
    theme,
    toggleTheme,
    language, 
    toggleLanguage, 
    role, 
    setRole, 
    user, 
    session,
    signOut,
    setIsAuthModalOpen,
    setView, 
    dashboardTab, 
    setDashboardTab,
    isPermittedTab,
    setIsRegisterModalOpen,
    referrals,
    supabaseConfig,
    setSelectedPatientId,
  } = useApp();

  const t = translations[language];

  // Count pending referrals for badge
  const pendingReferralsCount = referrals.filter((r) => r.status === 'pending').length;

  const handleNavClick = (tab: DashboardTab) => {
    setSelectedPatientId(null);
    setDashboardTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Topmost Compact Medical Disclaimer */}
      <MedicalDisclaimerBanner compact={true} />

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)] transition-colors duration-200">
          
          {/* Top Brand Section */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  {t.brandName}
                </h1>
                <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                  {language === 'en' ? 'Health Screening Platform' : 'स्वास्थ्य स्क्रीनिंग मंच'}
                </p>
              </div>
            </div>

            {/* Quick action button for CHW and Admin */}
            {role !== 'clinician' && (
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.registerPatient}</span>
              </button>
            )}
          </div>

          {/* Navigation Links - Filtered by Strict RBAC Permissions */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            
            {/* Overview: Allowed for all roles */}
            {isPermittedTab('overview') && (
              <button
                onClick={() => handleNavClick('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  dashboardTab === 'overview'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{t.menuOverview}</span>
              </button>
            )}

            {/* Patient Registry: Allowed for all roles */}
            {isPermittedTab('patients') && (
              <button
                onClick={() => handleNavClick('patients')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  dashboardTab === 'patients'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t.menuPatients}</span>
              </button>
            )}

            {/* Referrals Queue: Clinician & Admin Only */}
            {isPermittedTab('referrals') && (
              <button
                onClick={() => handleNavClick('referrals')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  dashboardTab === 'referrals'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4" />
                  <span>{t.menuReferrals}</span>
                </div>
                {pendingReferralsCount > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    dashboardTab === 'referrals'
                      ? 'bg-white text-teal-800'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {pendingReferralsCount}
                  </span>
                )}
              </button>
            )}

            {/* Analytics: Clinician & Admin Only */}
            {isPermittedTab('analytics') && (
              <button
                onClick={() => handleNavClick('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  dashboardTab === 'analytics'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t.menuAnalytics}</span>
              </button>
            )}

            {/* Nearby Hospitals: Available to all roles */}
            {isPermittedTab('hospitals') && (
              <button
                onClick={() => handleNavClick('hospitals')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  dashboardTab === 'hospitals'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-teal-500" />
                <span>{t.menuHospitals}</span>
              </button>
            )}

            {/* Settings & DB: Admin Only */}
            {isPermittedTab('settings') && (
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  dashboardTab === 'settings'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>{t.menuSettings}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              </button>
            )}

            {/* Safety Guidelines: Available to all roles */}
            <button
              onClick={() => handleNavClick('safety')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                dashboardTab === 'safety'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              <span>{t.menuSafety}</span>
            </button>

            {/* User Profile: Available to all roles */}
            {isPermittedTab('profile') && (
              <button
                onClick={() => handleNavClick('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  dashboardTab === 'profile'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-teal-500" />
                <span>{t.menuProfile}</span>
              </button>
            )}
          </nav>

          {/* Footer Area: User Card & Role Switcher */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/70 dark:bg-slate-900/60">
            {/* Active User Persona Card (Click opens Profile) */}
            <div 
              onClick={() => handleNavClick('profile')}
              className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-2 shadow-xs cursor-pointer hover:border-teal-500/50 transition-colors group"
              title="Click to view and edit profile"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 tracking-wider transition-colors">
                  {language === 'en' ? 'My Profile' : 'मेरी प्रोफाइल'}
                </span>
                <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded">
                  {role.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-600/10 border border-teal-500/30 overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  )}
                </div>
                <div className="text-xs min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {language === 'en' ? user.name : user.nameHi}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {language === 'en' ? user.centerName : user.centerNameHi}
                  </div>
                </div>
              </div>

              {/* Role Governance: Only Admin-authorized workflows can change roles */}
              {role === 'admin' ? (
                <div 
                  className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700 text-[10px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-slate-400 font-semibold">
                    <span>Admin Role Switcher:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 font-medium">
                    <button
                      onClick={() => setRole('chw')}
                      className="py-1 rounded text-center transition-colors cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      title="Switch to CHW (ASHA)"
                    >
                      CHW
                    </button>
                    <button
                      onClick={() => setRole('clinician')}
                      className="py-1 rounded text-center transition-colors cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      title="Switch to Clinician (Doctor)"
                    >
                      Doctor
                    </button>
                    <button
                      onClick={() => setRole('admin')}
                      className="py-1 rounded text-center transition-colors cursor-pointer bg-teal-600 text-white font-bold"
                      title="Active Admin Persona"
                    >
                      Admin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Role managed by Admin</span>
                  </span>
                  <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:underline">
                    Edit Profile ↗
                  </span>
                </div>
              )}
            </div>

            {/* Exit to Landing Page */}
            <button
              onClick={() => setView('public')}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToHome}</span>
            </button>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors duration-200">
          
          {/* Top Header Bar */}
          <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-200">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white capitalize">{t.brandName}</span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300 capitalize">
                {dashboardTab === 'overview' && t.menuOverview}
                {dashboardTab === 'patients' && t.menuPatients}
                {dashboardTab === 'referrals' && t.menuReferrals}
                {dashboardTab === 'analytics' && t.menuAnalytics}
                {dashboardTab === 'hospitals' && (language === 'en' ? 'Nearby Hospitals' : 'निकटतम अस्पताल')}
                {dashboardTab === 'settings' && t.menuSettings}
                {dashboardTab === 'safety' && (language === 'en' ? 'Safety & Responsible Use' : 'सुरक्षा एवं उत्तरदायी उपयोग')}
                {dashboardTab === 'profile' && (language === 'en' ? 'User Profile' : 'मेरी प्रोफ़ाइल')}
              </span>
            </div>

            {/* Right: DB Status + Theme + Language + User Profile + Google Auth */}
            <div className="flex items-center gap-2.5">
              {/* Supabase status indicator */}
              <button
                onClick={() => {
                  if (role === 'admin') setDashboardTab('settings');
                  else setIsAuthModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  supabaseConfig.isConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
                title={supabaseConfig.isConnected ? 'Supabase Database Active' : 'Offline Local Storage Active (Click to view setup)'}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {supabaseConfig.isConnected ? t.supabaseConnected : t.supabaseLocalDemo}
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Switch Language"
              >
                <Languages className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {/* User Profile Button */}
              <button
                onClick={() => handleNavClick('profile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  dashboardTab === 'profile'
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
                title="View & Edit Profile"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                )}
                <span className="max-w-[100px] truncate hidden sm:inline font-semibold">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {/* Google Auth Status / Login */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Google Authentication Status"
              >
                <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden md:inline">
                  {session?.user ? session.user.email?.split('@')[0] : t.googleSignIn}
                </span>
              </button>
            </div>
          </header>

          {/* Subview Body Container */}
          <main className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

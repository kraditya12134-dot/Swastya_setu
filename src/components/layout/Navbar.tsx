import React from 'react';
import { ArrowRight, Languages, Activity, Sun, Moon, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';

interface NavbarProps {
  onNavigateSection?: (id: string) => void;
  onNavigateToRoleLogin?: (route: 'admin' | 'chw' | 'doctor') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateSection, onNavigateToRoleLogin }) => {
  const { 
    language, 
    toggleLanguage, 
    theme, 
    toggleTheme, 
    setView, 
    session, 
    setIsAuthModalOpen,
    setDashboardTab
  } = useApp();
  const t = translations[language];

  const handleScrollTo = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left group cursor-pointer"
          >
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap block group-hover:text-teal-400 transition-colors">
              {t.brandName}
            </span>
          </button>
        </div>

        {/* Zone 2: 4 concise single-line text links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button 
            onClick={() => handleScrollTo('capabilities')}
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-slate-300"
          >
            {t.navFeatures}
          </button>
          <button 
            onClick={() => handleScrollTo('workflow')}
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-slate-300"
          >
            {t.navWorkflow}
          </button>
          <button 
            onClick={() => {
              setView('dashboard');
              setDashboardTab('safety');
            }}
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-slate-300 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>{t.navSafety}</span>
          </button>
          <button 
            onClick={() => handleScrollTo('disclaimer')}
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-slate-300"
          >
            {t.navDisclaimer}
          </button>
        </nav>

        {/* Zone 3: Controls (Theme + Language + Google Auth + Launch CTA) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-900 border border-slate-700/70 rounded-lg transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-700/70 hover:border-teal-500/40 transition-colors whitespace-nowrap shrink-0"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Google Auth Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 hover:text-white bg-slate-900 border border-slate-700/70 hover:border-teal-500/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Google Sign-In / OAuth Setup"
          >
            {session?.user ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="max-w-[80px] truncate text-emerald-300 font-semibold">
                  {session.user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">{t.googleSignIn}</span>
              </div>
            )}
          </button>

          {/* Primary Launch Platform */}
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm hover:shadow-teal-500/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.launchApp}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};

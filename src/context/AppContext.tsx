/**
 * Global Application Context for Swasthya Setu
 * Manages language, theme (light/dark), user role & RBAC permissions,
 * Supabase Google OAuth, navigation states, modals, and data synchronization.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Language, 
  Theme, 
  Patient, 
  Screening, 
  Referral, 
  AuditLog, 
  SupabaseConfig, 
  DashboardTab 
} from '../types';
import { storage } from '../services/storage';

export const USERS_BY_ROLE: Record<UserRole, User> = {
  chw: {
    id: 'USR-CHW-01',
    name: 'Pooja Verma',
    nameHi: 'पूजा वर्मा',
    role: 'chw',
    designation: 'Community Health Worker / ASHA Facilitator',
    designationHi: 'सामुदायिक स्वास्थ्य कार्यकर्ता / आशा फैसिलिटेटर',
    email: 'pooja.verma@swasthya-setu.gov.in',
    phone: '+91 98765 00123',
    centerName: 'Pipariya Sub-Health Centre (AAM)',
    centerNameHi: 'पिपरिया उप-स्वास्थ्य केंद्र (आयुष्मान आरोग्य मंदिर)',
  },
  clinician: {
    id: 'USR-DOC-02',
    name: 'Dr. Priya Sharma',
    nameHi: 'डॉ. प्रिया शर्मा',
    role: 'clinician',
    designation: 'Medical Officer (MBBS, DNB Fam. Med)',
    designationHi: 'चिकित्सा अधिकारी (एमबीबीएस)',
    email: 'dr.priya.sharma@swasthya-setu.gov.in',
    phone: '+91 98765 00456',
    centerName: 'Bilaspur Community Health Centre (CHC)',
    centerNameHi: 'बिलासपुर सामुदायिक स्वास्थ्य केंद्र (सीएचसी)',
  },
  admin: {
    id: 'USR-ADM-03',
    name: 'Rajeshwer Rao',
    nameHi: 'राजेश्वर राव',
    role: 'admin',
    designation: 'District NCD Program Administrator',
    designationHi: 'जिला गैर-संचारी रोग कार्यक्रम प्रशासक',
    email: 'rajeshwer.rao@swasthya-setu.gov.in',
    phone: '+91 98765 00789',
    centerName: 'District Health Surveillance Headquarters',
    centerNameHi: 'जिला स्वास्थ्य निगरानी मुख्यालय',
  },
};

// Permitted tabs by role (Strict Role-Based Access Control)
export const PERMITTED_TABS_BY_ROLE: Record<UserRole, DashboardTab[]> = {
  chw: ['overview', 'patients', 'hospitals', 'safety', 'profile'],
  clinician: ['overview', 'patients', 'referrals', 'analytics', 'hospitals', 'safety', 'profile'],
  admin: ['overview', 'patients', 'referrals', 'analytics', 'hospitals', 'settings', 'safety', 'profile'],
};

interface AppContextType {
  // Theme
  theme: Theme;
  toggleTheme: () => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  
  // Role & Permissions
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: User;
  isPermittedTab: (tab: DashboardTab) => boolean;
  
  // Profile Management
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string; isCloudSaved?: boolean }>;
  uploadAvatar: (file: File) => Promise<{ url?: string; error?: string; isBucketConfigured?: boolean }>;
  removeAvatar: () => Promise<void>;
  
  // Navigation
  view: 'public' | 'dashboard';
  setView: (view: 'public' | 'dashboard') => void;
  dashboardTab: DashboardTab;
  setDashboardTab: (tab: DashboardTab) => void;
  
  // Data
  patients: Patient[];
  screenings: Screening[];
  referrals: Referral[];
  auditLogs: AuditLog[];
  supabaseConfig: SupabaseConfig;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  
  // Supabase Google Auth
  session: any | null;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Modals
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
  
  isScreeningModalOpen: boolean;
  setIsScreeningModalOpen: (open: boolean) => void;
  activeScreeningPatient: Patient | null;
  startScreening: (patient: Patient) => void;
  
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  
  printableReport: { screening: Screening; patient: Patient } | null;
  setPrintableReport: (data: { screening: Screening; patient: Patient } | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('swasthya_theme') as Theme;
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('swasthya_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Language State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('swasthya_lang') as Language) || 'en';
  });

  // Role State
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('swasthya_role') as UserRole) || 'chw';
  });

  // Navigation
  const [view, setView] = useState<'public' | 'dashboard'>('public');
  const [dashboardTab, setDashboardTabState] = useState<DashboardTab>('overview');

  // Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(storage.getSupabaseConfig());
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Auth State
  const [session, setSession] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isScreeningModalOpen, setIsScreeningModalOpen] = useState(false);
  const [activeScreeningPatient, setActiveScreeningPatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [printableReport, setPrintableReport] = useState<{ screening: Screening; patient: Patient } | null>(null);

  // Check Supabase session on mount
  useEffect(() => {
    const initAuth = async () => {
      const existing = await storage.getSession();
      if (existing) {
        setSession(existing);
      }
    };
    initAuth();

    const { data: sub } = storage.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('swasthya_role', newRole);
    // If current tab is not allowed for the new role, redirect to overview
    if (!PERMITTED_TABS_BY_ROLE[newRole].includes(dashboardTab)) {
      setDashboardTabState('overview');
    }
  };

  const isPermittedTab = (tab: DashboardTab): boolean => {
    return PERMITTED_TABS_BY_ROLE[role].includes(tab);
  };

  const setDashboardTab = (tab: DashboardTab) => {
    if (!isPermittedTab(tab)) {
      setDashboardTabState('overview');
    } else {
      setDashboardTabState(tab);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
    localStorage.setItem('swasthya_lang', next);
  };

  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const [pList, sList, rList] = await Promise.all([
        storage.getPatients(),
        storage.getScreenings(),
        storage.getReferrals(),
      ]);
      setPatients(pList);
      setScreenings(sList);
      setReferrals(rList);
      setAuditLogs(storage.getAuditLogs());
      setSupabaseConfig(storage.getSupabaseConfig());
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await storage.signInWithGoogle();
      if (error) {
        setAuthError(error.message);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await storage.signOut();
      setSession(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const startScreening = (patient: Patient) => {
    setActiveScreeningPatient(patient);
    setIsScreeningModalOpen(true);
  };

  // User profile customization state (persisted across sessions and linked to Supabase profiles)
  const [profileOverrides, setProfileOverrides] = useState<Record<string, Partial<User>>>(() => {
    try {
      const saved = localStorage.getItem('swasthya_user_profiles');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Base persona or authenticated Google user
  const baseUser = USERS_BY_ROLE[role];
  const initialUser: User = session?.user
    ? {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || baseUser.name,
        nameHi: session.user.user_metadata?.full_name || baseUser.nameHi,
        role,
        designation: `${baseUser.designation} (Google Verified)`,
        designationHi: `${baseUser.designationHi} (सत्यापित)`,
        email: session.user.email || baseUser.email,
        phone: baseUser.phone,
        centerName: baseUser.centerName,
        centerNameHi: baseUser.centerNameHi,
        avatarUrl: session.user.user_metadata?.avatar_url,
        preferredLanguage: language,
        isGoogleAuthenticated: true,
      }
    : {
        ...baseUser,
        preferredLanguage: language,
      };

  const userOverride = profileOverrides[initialUser.id] || profileOverrides[role] || {};
  const user: User = {
    ...initialUser,
    ...userOverride,
  };

  const updateUserProfile = async (
    updates: Partial<User>
  ): Promise<{ success: boolean; error?: string; isCloudSaved?: boolean }> => {
    const targetKey = initialUser.id;
    const merged: User = { ...user, ...updates };

    const cloudRes = await storage.saveUserProfile(merged);

    setProfileOverrides((prev) => {
      const next = {
        ...prev,
        [targetKey]: { ...(prev[targetKey] || {}), ...updates },
        [role]: { ...(prev[role] || {}), ...updates },
      };
      try {
        localStorage.setItem('swasthya_user_profiles', JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return next;
    });

    if (updates.preferredLanguage && updates.preferredLanguage !== language) {
      setLanguage(updates.preferredLanguage);
      localStorage.setItem('swasthya_lang', updates.preferredLanguage);
    }

    if (role === 'admin' && updates.role && updates.role !== role) {
      setRole(updates.role);
    }

    storage.addAuditLog({
      userId: user.id,
      userName: updates.name || user.name,
      userRole: user.role,
      action: 'USER_PROFILE_UPDATED',
      details: `Profile updated: ${updates.name || user.name} (${updates.designation || user.designation})`,
    });
    setAuditLogs(storage.getAuditLogs());

    return cloudRes;
  };

  const uploadAvatar = async (file: File) => {
    const res = await storage.uploadProfileAvatar(user.id, file);
    if (res.url) {
      await updateUserProfile({ avatarUrl: res.url });
    }
    return res;
  };

  const removeAvatar = async () => {
    await updateUserProfile({ avatarUrl: '' });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        role,
        setRole,
        user,
        isPermittedTab,
        updateUserProfile,
        uploadAvatar,
        removeAvatar,
        view,
        setView,
        dashboardTab,
        setDashboardTab,
        patients,
        screenings,
        referrals,
        auditLogs,
        supabaseConfig,
        isLoadingData,
        refreshData,
        session,
        authLoading,
        authError,
        signInWithGoogle,
        signOut,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        isScreeningModalOpen,
        setIsScreeningModalOpen,
        activeScreeningPatient,
        startScreening,
        selectedPatientId,
        setSelectedPatientId,
        printableReport,
        setPrintableReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

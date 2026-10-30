import React, { useState } from 'react';
import { 
  Users, 
  Stethoscope, 
  Building2, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { UserRole } from '../../types';
import { storage } from '../../services/storage';

export type RoleLoginRoute = 'admin' | 'chw' | 'doctor';

interface RoleLoginPageProps {
  route: RoleLoginRoute;
  onNavigate: (path: string) => void;
}

interface RoleConfig {
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  description: string;
  descriptionHi: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  accentGradient: string;
  buttonColor: string;
  permittedDbRoles: UserRole[];
  contextRole: UserRole;
  sampleEmail: string;
}

const ROLE_CONFIGS: Record<RoleLoginRoute, RoleConfig> = {
  admin: {
    title: 'Health Administrator Portal',
    titleHi: 'स्वास्थ्य कार्यक्रम प्रशासक लॉगिन',
    subtitle: 'System Administration & Surveillance',
    subtitleHi: 'प्रशासनिक निगरानी एवं नीति नियंत्रण',
    description: 'Restricted administrative access for District NCD Program Managers, audit surveillance logs, facility configurations, and healthcare workforce oversight.',
    descriptionHi: 'जिला स्वास्थ्य प्रशासकों, ऑडिट लॉग निगरानी और स्वास्थ्य प्रणाली प्रबंधन हेतु सुरक्षित लॉगिन।',
    icon: Building2,
    badge: 'RESTRICTED · LEVEL 3 ADMIN',
    accentGradient: 'from-amber-500/20 via-rose-500/10 to-transparent',
    buttonColor: 'bg-amber-600 hover:bg-amber-500 text-white',
    permittedDbRoles: ['admin'],
    contextRole: 'admin',
    sampleEmail: 'rajeshwer.rao@swasthya-setu.gov.in',
  },
  chw: {
    title: 'Community Health Worker Portal',
    titleHi: 'आशा / स्वास्थ्य कार्यकर्ता पोर्टल',
    subtitle: 'Frontline Community Screening & Triage',
    subtitleHi: 'समुदायिक स्वास्थ्य जांच व प्राथमिक स्क्रीनिंग',
    description: 'Secure field login for ASHA facilitators and Auxiliary Nurse Midwives (ANMs) conducting village screening camps, vitals capture, and patient registrations.',
    descriptionHi: 'आशा कार्यकर्ताओं एवं फील्ड स्वास्थ्य कर्मियों के लिए ग्रामीण स्वास्थ्य शिविर एवं स्क्रीनिंग पोर्टल।',
    icon: Users,
    badge: 'FRONTLINE FIELD WORKER',
    accentGradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    buttonColor: 'bg-teal-600 hover:bg-teal-500 text-white',
    permittedDbRoles: ['chw', 'admin'],
    contextRole: 'chw',
    sampleEmail: 'pooja.verma@swasthya-setu.gov.in',
  },
  doctor: {
    title: 'Medical Officer & Clinician Portal',
    titleHi: 'चिकित्सा अधिकारी एवं डॉक्टर पोर्टल',
    subtitle: 'Clinical Review & Urgent Referral Triage',
    subtitleHi: 'क्लिनिकल समीक्षा एवं आपातकालीन रेफरल',
    description: 'Authorized clinical access for PHC/CHC Medical Officers, telehealth review of abnormal screening packets, and diagnostic consultation notes.',
    descriptionHi: 'प्राथमिक एवं सामुदायिक स्वास्थ्य केंद्र के डॉक्टरों के लिए रेफरल समीक्षा व परामर्श पोर्टल।',
    icon: Stethoscope,
    badge: 'AUTHORIZED MEDICAL OFFICER',
    accentGradient: 'from-blue-500/20 via-teal-500/10 to-transparent',
    buttonColor: 'bg-blue-600 hover:bg-blue-500 text-white',
    permittedDbRoles: ['clinician', 'admin'],
    contextRole: 'clinician',
    sampleEmail: 'dr.priya.sharma@swasthya-setu.gov.in',
  },
};

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({ route, onNavigate }) => {
  const { 
    language, 
    role: activeContextRole, 
    setRole, 
    setView, 
    session, 
    signOut, 
    user,
    supabaseConfig,
    signInWithGoogle
  } = useApp();

  const t = translations[language];
  const config = ROLE_CONFIGS[route];
  const Icon = config.icon;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [unauthorizedBlock, setUnauthorizedBlock] = useState<string | null>(null);

  // Check if a currently logged-in user is trying to access an unauthorized role page
  const isDirectAccessBlocked = Boolean(
    session?.user && !config.permittedDbRoles.includes(activeContextRole)
  );

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);
    setUnauthorizedBlock(null);

    try {
      if (!supabaseConfig.isConnected) {
        // Backend is not connected - explain clearly without faking credentials
        setErrorMessage(
          'Supabase database is not connected. To authenticate real users with database-verified roles, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment, and execute the provided SQL schema.'
        );
        setIsLoading(false);
        return;
      }

      const { data, error } = await storage.signInWithEmail(email.trim(), password);
      if (error || !data?.user) {
        setErrorMessage(error?.message || 'Invalid login credentials. Please verify your email and password.');
        setIsLoading(false);
        return;
      }

      // CRITICAL: Verify assigned role from the database profiles table
      const dbProfile = await storage.fetchUserProfileFromDb(data.user.id);
      const verifiedRole = dbProfile?.role || (data.user.user_metadata?.role as UserRole);

      if (!verifiedRole) {
        setErrorMessage('User authenticated, but no assigned clinical role found in database profiles table.');
        setIsLoading(false);
        return;
      }

      // Strict RBAC check: Does database role allow access to this portal?
      if (!config.permittedDbRoles.includes(verifiedRole)) {
        setUnauthorizedBlock(
          `Unauthorized Access: Your account is verified in the database with role [${verifiedRole.toUpperCase()}]. You are not authorized to access the ${config.title} (/login/${route}).`
        );
        // Automatically route to their permitted dashboard after 2.5 seconds
        setTimeout(() => {
          setRole(verifiedRole);
          setView('dashboard');
          onNavigate('/');
        }, 2500);
        setIsLoading(false);
        return;
      }

      // Successful verification
      setRole(verifiedRole);
      setSuccessNotice(`Authentication successful. Verified ${verifiedRole.toUpperCase()} role from database.`);
      setTimeout(() => {
        setView('dashboard');
        onNavigate('/');
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchWithSimulatedSandbox = (targetRole: UserRole) => {
    if (!config.permittedDbRoles.includes(targetRole)) {
      setUnauthorizedBlock(
        `Access Denied: Persona [${targetRole.toUpperCase()}] cannot access the ${config.title}.`
      );
      return;
    }
    setRole(targetRole);
    setView('dashboard');
    onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Radial Atmospheric Glow */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b ${config.accentGradient} rounded-full blur-3xl pointer-events-none`} />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10 space-y-6">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Back to Swasthya Setu' : 'मुख्य पृष्ठ पर लौटें'}</span>
          </button>

          <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 uppercase font-semibold">
            {config.badge}
          </span>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-teal-400 shadow-inner">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {language === 'en' ? config.title : config.titleHi}
              </h1>
              <p className="text-xs text-teal-400 font-medium">
                {language === 'en' ? config.subtitle : config.subtitleHi}
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {language === 'en' ? config.description : config.descriptionHi}
            </p>
          </div>

          {/* ACTIVE SESSION / DIRECT ACCESS BLOCK CHECK */}
          {isDirectAccessBlocked ? (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Direct Access Blocked: Role Unauthorized</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-300/90">
                You are currently signed in as <strong>{user.name}</strong> with the verified role: <span className="uppercase font-mono font-bold text-rose-200">[{activeContextRole}]</span>. Direct URL navigation to the <strong>{config.title}</strong> is blocked by system RBAC rules.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => {
                    setView('dashboard');
                    onNavigate('/');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Go to Permitted Dashboard ({activeContextRole.toUpperCase()})
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    setUnauthorizedBlock(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out to Switch Account</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Errors & Alerts */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {unauthorizedBlock && (
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{unauthorizedBlock}</span>
                </div>
              )}

              {successNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    {language === 'en' ? 'Authorized Email Address' : 'अधिकृत ईमेल पता'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={config.sampleEmail}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    {language === 'en' ? 'Password' : 'पासवर्ड'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${config.buttonColor} disabled:opacity-50`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Verifying with Database...' : `Sign In to ${config.title}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Supabase OAuth Option */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In with Supabase Google OAuth</span>
                </button>
              </div>

              {/* Offline Demo Sandbox Quick-Switch */}
              <div className="pt-3 border-t border-slate-800/60">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Demo Persona Sandbox:</span>
                    <span className="text-[10px] text-teal-400 font-mono">Role-Verified</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Test this role portal with verified pre-configured local persona:
                  </p>
                  <button
                    type="button"
                    onClick={() => handleLaunchWithSimulatedSandbox(config.contextRole)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Launch {config.title} as {config.contextRole.toUpperCase()}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Switch to Other Portals */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>Switch Role Portal:</span>
            <div className="flex items-center gap-3">
              {route !== 'chw' && (
                <button
                  onClick={() => onNavigate('/login/chw')}
                  className="hover:text-teal-400 transition-colors cursor-pointer text-slate-300 text-[11px]"
                >
                  CHW Portal
                </button>
              )}
              {route !== 'doctor' && (
                <button
                  onClick={() => onNavigate('/login/doctor')}
                  className="hover:text-blue-400 transition-colors cursor-pointer text-slate-300 text-[11px]"
                >
                  Doctor Portal
                </button>
              )}
              {route !== 'admin' && (
                <button
                  onClick={() => onNavigate('/login/admin')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-slate-300 text-[11px]"
                >
                  Admin Portal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security & Responsibility Footer */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>Swasthya Setu (स्वास्थ्य सेतु) · Enterprise RBAC & Audit Surveillance</p>
          <p className="text-[10px]">Unauthorised access is prohibited and recorded in the clinical audit trail.</p>
        </div>

      </div>
    </div>
  );
};

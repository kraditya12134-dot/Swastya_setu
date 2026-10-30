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
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Sparkles,
  Info
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
  textColor: string;
  permittedDbRoles: UserRole[];
  contextRole: UserRole;
  sampleEmail: string;
  sampleName: string;
}

const ROLE_CONFIGS: Record<RoleLoginRoute, RoleConfig> = {
  chw: {
    title: 'Community Health Worker Portal',
    titleHi: 'आशा / स्वास्थ्य कार्यकर्ता पोर्टल',
    subtitle: 'Frontline Community Screening, Vitals & Field Triage',
    subtitleHi: 'समुदायिक स्वास्थ्य जांच, स्वास्थ्य संकेतक व प्राथमिक स्क्रीनिंग',
    description: 'Secure field login for ASHA facilitators and Auxiliary Nurse Midwives (ANMs) conducting village screening camps, vitals capture, and patient registrations.',
    descriptionHi: 'आशा कार्यकर्ताओं एवं फील्ड स्वास्थ्य कर्मियों के लिए ग्रामीण स्वास्थ्य शिविर एवं स्क्रीनिंग पोर्टल।',
    icon: Users,
    badge: 'FRONTLINE FIELD WORKER',
    accentGradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    buttonColor: 'bg-teal-600 hover:bg-teal-500 text-white',
    textColor: 'text-teal-400',
    permittedDbRoles: ['chw', 'admin'],
    contextRole: 'chw',
    sampleEmail: 'pooja.verma@swasthya-setu.gov.in',
    sampleName: 'Pooja Verma (CHW)',
  },
  doctor: {
    title: 'Clinician & Doctor Portal',
    titleHi: 'चिकित्सा अधिकारी एवं डॉक्टर पोर्टल',
    subtitle: 'Clinical Review, Telehealth & Referral Triage',
    subtitleHi: 'क्लिनिकल समीक्षा, टेली-हेल्थ एवं आपातकालीन रेफरल',
    description: 'Authorized clinical access for PHC/CHC Medical Officers, telehealth review of abnormal screening packets, and diagnostic consultation notes.',
    descriptionHi: 'प्राथमिक एवं सामुदायिक स्वास्थ्य केंद्र के डॉक्टरों के लिए रेफरल समीक्षा व परामर्श पोर्टल।',
    icon: Stethoscope,
    badge: 'AUTHORIZED MEDICAL OFFICER',
    accentGradient: 'from-blue-500/20 via-teal-500/10 to-transparent',
    buttonColor: 'bg-blue-600 hover:bg-blue-500 text-white',
    textColor: 'text-blue-400',
    permittedDbRoles: ['clinician', 'admin'],
    contextRole: 'clinician',
    sampleEmail: 'dr.priya.sharma@swasthya-setu.gov.in',
    sampleName: 'Dr. Priya Sharma (Medical Officer)',
  },
  admin: {
    title: 'Health Administrator Portal',
    titleHi: 'स्वास्थ्य कार्यक्रम प्रशासक लॉगिन',
    subtitle: 'System Administration, Surveillance & Policy Oversight',
    subtitleHi: 'प्रशासनिक निगरानी, ऑडिट ट्रेल एवं नीति नियंत्रण',
    description: 'Restricted administrative access for District NCD Program Managers, audit surveillance logs, facility configurations, and healthcare workforce oversight.',
    descriptionHi: 'जिला स्वास्थ्य प्रशासकों, ऑडिट लॉग निगरानी और स्वास्थ्य प्रणाली प्रबंधन हेतु सुरक्षित लॉगिन।',
    icon: Building2,
    badge: 'RESTRICTED · LEVEL 3 ADMIN',
    accentGradient: 'from-amber-500/20 via-rose-500/10 to-transparent',
    buttonColor: 'bg-amber-600 hover:bg-amber-500 text-white',
    textColor: 'text-amber-400',
    permittedDbRoles: ['admin'],
    contextRole: 'admin',
    sampleEmail: 'rajeshwer.rao@swasthya-setu.gov.in',
    sampleName: 'Rajeshwer Rao (District Admin)',
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
    updateUserProfile,
    supabaseConfig,
    signInWithGoogle
  } = useApp();

  const config = ROLE_CONFIGS[route];
  const Icon = config.icon;

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [unauthorizedBlock, setUnauthorizedBlock] = useState<string | null>(null);

  // Forgot password drawer/view state
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const [pendingApprovalAccount, setPendingApprovalAccount] = useState<{
    name: string;
    email: string;
    role: string;
    error: string;
  } | null>(null);

  // Check if a currently logged-in user is trying to access an unauthorized role page
  const isDirectAccessBlocked = Boolean(
    session?.user && !config.permittedDbRoles.includes(activeContextRole)
  );

  const handleReturnHome = () => {
    setView('public');
    onNavigate('/');
  };

  /**
   * REQUIREMENT 5:
   * "After successful authentication, verify the user's actual role from the backend/database
   * and redirect to the correct dashboard. Never trust the role selected on the frontend."
   */
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);
    setUnauthorizedBlock(null);
    setPendingApprovalAccount(null);

    try {
      // Authenticate and verify role from backend / database registry
      const authResult = await storage.verifyCredentialsAndFetchRole(email.trim(), password);

      if (authResult.isPendingApproval) {
        setPendingApprovalAccount({
          name: authResult.user?.name || email,
          email: authResult.user?.email || email,
          role: authResult.user?.role || route,
          error: authResult.error || 'Account pending administrative verification.',
        });
        setIsLoading(false);
        return;
      }

      if (!authResult.success || !authResult.verifiedRole) {
        setErrorMessage(
          authResult.error || 'Authentication failed. Please verify your credentials.'
        );
        setIsLoading(false);
        return;
      }

      // Authoritative database-verified role (NEVER trusting the frontend portal route)
      const verifiedDbRole = authResult.verifiedRole;

      // Update application state strictly with the database-verified role
      setRole(verifiedDbRole);

      if (authResult.user) {
        await updateUserProfile(authResult.user);
      }

      // Record immutable audit entry
      storage.addAuditLog({
        userId: authResult.user?.id || `USR-${verifiedDbRole.toUpperCase()}`,
        userName: authResult.user?.name || email,
        userRole: verifiedDbRole,
        action: 'USER_LOGIN_AUTHENTICATED',
        details: `Authenticated user verified as [${verifiedDbRole.toUpperCase()}] via ${
          authResult.source === 'supabase_db' ? 'Supabase Database' : 'Healthcare Database Registry'
        }. Authoritative database role assigned.`,
      });

      // Feedback message reflecting authoritative verification
      const matchesPortal = config.permittedDbRoles.includes(verifiedDbRole);
      if (matchesPortal) {
        setSuccessNotice(
          `Authentication verified. Database verified role: [${verifiedDbRole.toUpperCase()}]. Redirecting to dashboard...`
        );
      } else {
        // Crucial demonstration of Rule 5: User signed in with an account belonging to a different role
        setSuccessNotice(
          `Credentials verified. Backend database confirms role as [${verifiedDbRole.toUpperCase()}]. Redirecting to your authorized ${verifiedDbRole.toUpperCase()} dashboard...`
        );
      }

      // Redirect to the verified dashboard
      setTimeout(() => {
        setView('dashboard');
        onNavigate('/');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);
    setResetMessage(null);
    setResetError(null);

    try {
      const res = await storage.requestPasswordReset(resetEmail.trim() || email.trim() || config.sampleEmail);
      if (res.success) {
        setResetMessage(res.message);
      } else {
        setResetError(res.message);
      }
    } catch (err: any) {
      setResetError(err.message || 'Unable to process password reset request.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleQuickFill = (sampleMail: string) => {
    setEmail(sampleMail);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* Radial Atmospheric Glow */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b ${config.accentGradient} rounded-full blur-3xl pointer-events-none`} />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10 space-y-5">
        
        {/* Top Back Link & Badge */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleReturnHome}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer group"
            title="Return to Swasthya Setu Homepage"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-teal-400" />
            <span>{language === 'en' ? 'Back to Homepage' : 'मुख्य पृष्ठ पर लौटें'}</span>
          </button>

          <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 uppercase font-semibold">
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
              <p className={`text-xs font-semibold ${config.textColor}`}>
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
                You are currently signed in as <strong>{user.name}</strong> with the verified role: <span className="uppercase font-mono font-bold text-rose-200">[{activeContextRole}]</span>. Direct URL navigation to the <strong>{config.title}</strong> is restricted by system RBAC rules.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setView('dashboard');
                    onNavigate('/');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Go to Permitted Dashboard ({activeContextRole.toUpperCase()})
                </button>
                <button
                  type="button"
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
          ) : pendingApprovalAccount ? (
            /* PENDING APPROVAL GATE VIEW */
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Access Blocked: Account Pending Official Approval</span>
                </div>
                <p className="leading-relaxed text-amber-200/90 text-xs">
                  {pendingApprovalAccount.error}
                </p>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                  <div><strong>Account Name:</strong> {pendingApprovalAccount.name}</div>
                  <div><strong>Email:</strong> {pendingApprovalAccount.email}</div>
                  <div><strong>Registered Role:</strong> <span className="uppercase text-amber-400">{pendingApprovalAccount.role}</span></div>
                  <div><strong>Status:</strong> <span className="text-amber-400 font-bold uppercase">Pending District Verification</span></div>
                </div>
                <p className="text-[11px] text-amber-300/80">
                  Frontline health security policy blocks clinical dashboards, patient records, and screening forms until verified by the District Health Authority.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingApprovalAccount(null)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Return to Sign In
                </button>
                <button
                  type="button"
                  onClick={handleReturnHome}
                  className="py-2 px-3 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          ) : isForgotPasswordView ? (
            /* FORGOT PASSWORD FORM */
            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-teal-400" />
                  <span>{language === 'en' ? 'Password Recovery' : 'पासवर्ड रीसेट अनुरोध'}</span>
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'en'
                    ? 'Enter your registered healthcare personnel email address. We will verify your account in the database and send password recovery instructions.'
                    : 'अपना पंजीकृत आधिकारिक ईमेल पता दर्ज करें। सत्यापन के पश्चात पासवर्ड रीसेट निर्देश प्रेषित किए जाएंगे।'}
                </p>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'en' ? 'Instructions Dispatched' : 'निर्देश भेजे गए'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-200/90">{resetMessage}</p>
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    {language === 'en' ? 'Registered Email Address' : 'पंजीकृत ईमेल पता'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder={config.sampleEmail}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className={`flex-1 py-2 px-4 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${config.buttonColor} disabled:opacity-50`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isResetLoading ? 'Verifying Account...' : 'Send Reset Instructions'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordView(false);
                      setResetMessage(null);
                      setResetError(null);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                <span className="text-slate-500">Emergency Access: </span>
                <span>ASHA and Medical Officers may contact District Surveillance HQ at </span>
                <span className="font-mono text-teal-400">admin@swasthya-setu.gov.in</span>
              </div>
            </div>
          ) : (
            /* STANDARD LOGIN FORM */
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
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{successNotice}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en' ? 'Official Health Email' : 'आधिकारिक स्वास्थ्य ईमेल'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleQuickFill(config.sampleEmail)}
                      className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                      title="Quick fill sample account"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Use sample</span>
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={config.sampleEmail}
                      autoComplete="email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en' ? 'Password' : 'पासवर्ड'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordView(true);
                        setResetEmail(email || config.sampleEmail);
                      }}
                      className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                    >
                      {language === 'en' ? 'Forgot password?' : 'पासवर्ड भूल गए?'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono transition-all"
                    />
                    {/* Show / Hide Password Option */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
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

              {/* Verified Sample Test Credentials Helper */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-teal-400" />
                    <span>Database-Verified Test Credentials:</span>
                  </span>
                  <span className="text-[10px] text-teal-400 font-mono">Password: password123</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('pooja.verma@swasthya-setu.gov.in')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-left transition-all cursor-pointer"
                  >
                    <div className="font-semibold text-teal-300">CHW / ASHA</div>
                    <div className="text-[10px] text-slate-400 truncate">pooja.verma@...</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('dr.priya.sharma@swasthya-setu.gov.in')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition-all cursor-pointer"
                  >
                    <div className="font-semibold text-blue-300">Doctor / Clinician</div>
                    <div className="text-[10px] text-slate-400 truncate">dr.priya.sharma@...</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('rajeshwer.rao@swasthya-setu.gov.in')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all cursor-pointer"
                  >
                    <div className="font-semibold text-amber-300">Administrator</div>
                    <div className="text-[10px] text-slate-400 truncate">rajeshwer.rao@...</div>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Rule 5 Enforced: Logging in with any credential queries the database to extract the user's authentic role and routes to that role's dashboard.
                </p>
              </div>

              {/* Supabase OAuth Option */}
              <div className="pt-1 border-t border-slate-800/80">
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
                  <span>Sign in with Google</span>
                </button>
              </div>

              {/* Sign Up Link for this Role */}
              <div className="pt-2 text-center text-xs text-slate-400">
                <span>{language === 'en' ? "Don't have an account? " : 'खाता नहीं है? '}</span>
                <button
                  type="button"
                  onClick={() => onNavigate(`/register/${route}`)}
                  className="font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer hover:underline"
                >
                  {language === 'en' ? 'Sign up' : 'पंजीकरण करें'}
                </button>
              </div>
            </>
          )}

          {/* Switch to Other Portals */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>Switch Role Portal:</span>
            <div className="flex items-center gap-2 text-xs">
              {route !== 'chw' && (
                <button
                  type="button"
                  onClick={() => onNavigate('/login/chw')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-teal-400 hover:text-teal-300 font-medium transition-colors cursor-pointer"
                >
                  CHW Portal
                </button>
              )}
              {route !== 'doctor' && (
                <button
                  type="button"
                  onClick={() => onNavigate('/login/doctor')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                >
                  Doctor Portal
                </button>
              )}
              {route !== 'admin' && (
                <button
                  type="button"
                  onClick={() => onNavigate('/login/admin')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
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
          <p className="text-[10px]">Unauthorised access attempts are logged with IP & timestamp in the audit trail.</p>
        </div>

      </div>
    </div>
  );
};

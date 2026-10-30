import React, { useState } from 'react';
import { 
  Users, 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  ShieldAlert,
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  KeyRound,
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, AccountStatus } from '../../types';
import { storage } from '../../services/storage';

export type RoleRegisterRoute = 'admin' | 'chw' | 'doctor';

interface RoleRegisterPageProps {
  route: RoleRegisterRoute;
  onNavigate: (path: string) => void;
}

interface RegisterConfig {
  role: UserRole;
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  badge: string;
  description: string;
  accentGradient: string;
  buttonColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const REGISTER_CONFIGS: Record<RoleRegisterRoute, RegisterConfig> = {
  chw: {
    role: 'chw',
    title: 'ASHA & CHW Registration',
    titleHi: 'आशा एवं स्वास्थ्य कार्यकर्ता पंजीकरण',
    subtitle: 'Frontline Field Screening & Community Care Intake',
    subtitleHi: 'सामुदायिक स्वास्थ्य जांच एवं फील्ड कार्यकर्ता खाता',
    badge: 'COMMUNITY WORKER ENROLMENT',
    description: 'Register for frontline field screening access. CHW accounts are registered independently and verified by the District Health Authority before accessing patient data.',
    accentGradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    buttonColor: 'bg-teal-600 hover:bg-teal-500 text-white',
    textColor: 'text-teal-400',
    icon: Users,
  },
  doctor: {
    role: 'clinician',
    title: 'Clinician & Doctor Registration',
    titleHi: 'चिकित्सक एवं डॉक्टर पंजीकरण',
    subtitle: 'Clinical Referral Review, Tele-Consult & Triage Access',
    subtitleHi: 'रेफरल समीक्षा एवं टेली-परामर्श पोर्टल खाता',
    badge: 'MEDICAL OFFICER ENROLMENT',
    description: 'Register as an authorized Medical Officer for PHC/CHC tele-referral triage and clinical oversight. Credentials undergo verification by the District Health Authority.',
    accentGradient: 'from-blue-500/20 via-teal-500/10 to-transparent',
    buttonColor: 'bg-blue-600 hover:bg-blue-500 text-white',
    textColor: 'text-blue-400',
    icon: Stethoscope,
  },
  admin: {
    role: 'admin',
    title: 'Health Administrator Registration',
    titleHi: 'स्वास्थ्य कार्यक्रम प्रशासक पंजीकरण',
    subtitle: 'Restricted Program Surveillance & System Governance',
    subtitleHi: 'प्रशासनिक निगरानी एवं जिला स्वास्थ्य नियंत्रण',
    badge: 'RESTRICTED · INVITATION ONLY',
    description: 'Administrative access is strictly restricted and invitation-only. Public self-assignment is prohibited. An authorized district invitation code is required.',
    accentGradient: 'from-amber-500/20 via-rose-500/10 to-transparent',
    buttonColor: 'bg-amber-600 hover:bg-amber-500 text-white',
    textColor: 'text-amber-400',
    icon: Building2,
  },
};

export const RoleRegisterPage: React.FC<RoleRegisterPageProps> = ({ route, onNavigate }) => {
  const { language, setView } = useApp();
  const config = REGISTER_CONFIGS[route];
  const Icon = config.icon;

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [qualification, setQualification] = useState('');
  const [designation, setDesignation] = useState('');
  const [organization, setOrganization] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    status: AccountStatus;
    message: string;
    userName: string;
    email: string;
  } | null>(null);

  const handleReturnHome = () => {
    setView('public');
    onNavigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await storage.registerUser({
        role: config.role,
        name: fullName,
        email,
        phone,
        password,
        confirmPassword,
        location,
        qualification,
        designation,
        organization,
        inviteCode,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed. Please review the inputs.');
        setIsLoading(false);
        return;
      }

      setRegisteredSuccess({
        status: res.status || 'pending',
        message: res.message,
        userName: fullName,
        email,
      });
      setIsLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected registration error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-teal-500 selection:text-white relative overflow-hidden py-12">
      
      {/* Radial Atmospheric Background Glow */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b ${config.accentGradient} rounded-full blur-3xl pointer-events-none`} />

      {/* Main Form Container */}
      <div className="w-full max-w-lg z-10 space-y-5">
        
        {/* Top Back Link & Badge */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleReturnHome}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer group"
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
              {config.description}
            </p>
          </div>

          {/* SUCCESS / PENDING APPROVAL VIEW */}
          {registeredSuccess ? (
            <div className="space-y-4 pt-2">
              {registeredSuccess.status === 'pending' ? (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Account Submitted · Pending District Approval</span>
                  </div>
                  <p className="leading-relaxed text-amber-200/90 text-xs">
                    {registeredSuccess.message}
                  </p>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-300">
                    <div><strong>Registered Name:</strong> {registeredSuccess.userName}</div>
                    <div><strong>Email:</strong> {registeredSuccess.email}</div>
                    <div><strong>Role Requested:</strong> <span className="uppercase text-amber-400">{config.role}</span></div>
                    <div><strong>Security Policy:</strong> Confidential patient data and triage dashboards remain locked until credential clearance is granted.</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Administrator Account Cleared & Activated</span>
                  </div>
                  <p className="leading-relaxed text-emerald-200/90 text-xs">
                    {registeredSuccess.message}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate(`/login/${route}`)}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${config.buttonColor}`}
                >
                  <span>Go to {config.title.split(' ')[0]} Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <>
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    {language === 'en' ? 'Full Name *' : 'पूरा नाम *'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={config.role === 'clinician' ? 'Dr. Sunita Rao' : 'Asha Sharma'}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* 2. Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    {config.role === 'admin' 
                      ? (language === 'en' ? 'Official Health Administration Email *' : 'आधिकारिक प्रशासनिक ईमेल *')
                      : (language === 'en' ? 'Email Address *' : 'ईमेल पता *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@health.gov.in"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                {/* 3. Phone Number (CHW / Doctor) */}
                {config.role !== 'admin' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en' ? 'Phone Number *' : 'फ़ोन नंबर *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* CHW Specific: Location */}
                {route === 'chw' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en' ? 'Location (Village, Sector, or Sub-Centre) *' : 'स्थान (गाँव, सेक्टर या उप-केंद्र) *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Pipariya Sub-Centre, Ward 4"
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                {/* Doctor Specific: Designation & Medical Qualification */}
                {route === 'doctor' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300">
                        {language === 'en' ? 'Medical Qualification *' : 'चिकित्सीय योग्यता *'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          placeholder="e.g. MBBS, MD, DNB"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300">
                        {language === 'en' ? 'Designation *' : 'पदनाम *'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="e.g. Medical Officer"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Specific: Organization & Invitation Code */}
                {route === 'admin' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300">
                        {language === 'en' ? 'Organization / Department *' : 'संस्थान या विभाग *'}
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. District Health Society / State NCD Cell"
                        required
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-amber-300">
                          {language === 'en' ? 'Administrative Invitation Code *' : 'प्रशासनिक आमंत्रण कोड *'}
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono">Demo: SWASTHYA-ADMIN-2026</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500">
                          <KeyRound className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          placeholder="Enter authorized invitation code"
                          required
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-amber-900/60 rounded-xl text-amber-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                        Security Enforcement: Administrator accounts cannot be self-assigned. An authorized invitation code is required to establish program governance privileges.
                      </p>
                    </div>
                  </div>
                )}

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en' ? 'Password *' : 'पासवर्ड *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        className="w-full pl-9 pr-10 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5 text-teal-400" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">
                      {language === 'en' ? 'Confirm Password *' : 'पासवर्ड की पुष्टि *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="w-full pl-9 pr-10 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5 text-teal-400" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Registration Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${config.buttonColor} disabled:opacity-50 mt-2`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Registering Account...' : `Register as ${config.title.split(' ')[0]}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Already Have An Account Link */}
              <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span>{language === 'en' ? 'Already have an account? ' : 'पहले से खाता है? '}</span>
                <button
                  type="button"
                  onClick={() => onNavigate(`/login/${route}`)}
                  className="font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer hover:underline"
                >
                  {language === 'en' ? 'Sign in' : 'साइन इन करें'}
                </button>
              </div>
            </>
          )}

          {/* Switch to Other Registration Portals */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>Register for another role:</span>
            <div className="flex items-center gap-2 text-xs">
              {route !== 'chw' && (
                <button
                  type="button"
                  onClick={() => onNavigate('/register/chw')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-teal-400 hover:text-teal-300 font-medium transition-colors cursor-pointer"
                >
                  CHW Sign Up
                </button>
              )}
              {route !== 'doctor' && (
                <button
                  type="button"
                  onClick={() => onNavigate('/register/doctor')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                >
                  Doctor Sign Up
                </button>
              )}
              {route !== 'admin' && (
                <button
                  type="button"
                  onClick={() => onNavigate('/register/admin')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
                >
                  Admin Sign Up
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security & Responsibility Footer */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>Swasthya Setu (स्वास्थ्य सेतु) · Frontline Healthcare Security Architecture</p>
          <p className="text-[10px]">Accounts undergo database role verification. All activities are recorded in the audit trail.</p>
        </div>

      </div>
    </div>
  );
};

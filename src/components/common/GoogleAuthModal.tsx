import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check,
  User,
  Key
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    language, 
    session, 
    authLoading, 
    authError, 
    signInWithGoogle, 
    signOut, 
    supabaseConfig,
    role
  } = useApp();

  const t = translations[language];
  const [copiedCallback, setCopiedCallback] = useState(false);

  if (!isOpen) return null;

  const callbackUrl = supabaseConfig.url 
    ? `${supabaseConfig.url.replace(/\/$/, '')}/auth/v1/callback`
    : 'https://<your-project-ref>.supabase.co/auth/v1/callback';

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Sign in with Google' : 'गूगल से साइन-इन'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'Enterprise Identity & Role-Based Session Management' : 'सुरक्षित पहचान एवं भूमिका आधारित सत्र प्रबंधन'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Auth Status Box */}
        {session?.user ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Google Session Active</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded font-semibold">
                {role}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {session.user.user_metadata?.avatar_url ? (
                <img
                  src={session.user.user_metadata.avatar_url}
                  alt="Google Avatar"
                  className="w-10 h-10 rounded-full border border-emerald-300"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-200 dark:bg-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-200 font-bold">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {session.user.user_metadata?.full_name || 'Authenticated Health Worker'}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] font-mono">
                  {session.user.email}
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                await signOut();
                onClose();
              }}
              disabled={authLoading}
              className="w-full mt-2 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{authLoading ? 'Signing out...' : 'Sign Out of Google Session'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live Sign-In Button */}
            <div className="space-y-2">
              <button
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-all hover:border-teal-500 cursor-pointer disabled:opacity-50"
              >
                {/* Google "G" icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{authLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>

              {authError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Authentication Configuration Required:</div>
                    <div className="text-[11px] opacity-90 mt-0.5">{authError}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Step-by-Step Configuration Guide */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Google Cloud & Supabase Setup Instructions</span>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed pl-1">
                <li>
                  <strong>Configure Environment</strong>: In your <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">.env</code> file, set:
                  <div className="mt-1 font-mono text-[10px] bg-slate-900 text-teal-300 p-2 rounded">
                    VITE_SUPABASE_URL="https://your-project.supabase.co"<br />
                    VITE_SUPABASE_ANON_KEY="your-anon-key"
                  </div>
                </li>
                <li>
                  <strong>Create Google Cloud OAuth Client</strong>:
                  Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a>, select <em>Web Application</em>, and add the Authorized Redirect URI:
                  <div className="mt-1 flex items-center justify-between gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">
                    <span className="truncate">{callbackUrl}</span>
                    <button
                      onClick={handleCopyCallback}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[10px] shrink-0 font-sans flex items-center gap-1"
                    >
                      {copiedCallback ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCallback ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </li>
                <li>
                  <strong>Enable in Supabase</strong>: In your Supabase Dashboard, navigate to <strong>Authentication &rarr; Providers &rarr; Google</strong>, toggle <em>Enable Google</em>, and paste your Google Client ID and Secret.
                </li>
              </ol>

              <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                <em>Note: If credentials are not set, the platform securely operates in <strong>Offline Demo Storage Mode</strong> with simulated role switching so you can preview all features without breaking the app.</em>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

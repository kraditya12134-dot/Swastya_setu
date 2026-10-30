import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  UserCheck, 
  Languages, 
  ExternalLink,
  AlertCircle,
  Key,
  Shield,
  FileText,
  Clock,
  UserX,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { storage } from '../../services/storage';
import { UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    role, 
    setRole, 
    user, 
    session,
    setIsAuthModalOpen,
    supabaseConfig, 
    refreshData,
    patients,
    screenings,
    referrals,
    auditLogs
  } = useApp();

  const t = translations[language];
  const [copiedSql, setCopiedSql] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [registeredUsersList, setRegisteredUsersList] = useState(() => storage.getRegisteredUsers());

  const pendingUsers = registeredUsersList.filter((u) => u.status === 'pending');

  const handleApproveUser = async (userId: string) => {
    const res = await storage.approveUser(userId, user.name);
    if (res.success) {
      setRegisteredUsersList(storage.getRegisteredUsers());
      setStatusMsg('Healthcare personnel credentials successfully approved and activated.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleRejectUser = async (userId: string) => {
    const res = await storage.rejectUser(userId, 'Administrative discretion');
    if (res.success) {
      setRegisteredUsersList(storage.getRegisteredUsers());
      setStatusMsg('Personnel registration declined.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(storage.getSupabaseSqlSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleResetDemoData = async () => {
    storage.resetToDemoData();
    await refreshData();
    setStatusMsg(language === 'en' ? 'Synthetic demo patients successfully restored.' : 'सिंथेटिक डेमो मरीज डेटा सफलतापूर्वक रीसेट किया गया।');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleExportJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      patients,
      screenings,
      referrals,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swasthya_setu_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.menuSettings}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'en'
            ? 'Backend configuration, Google OAuth credentials, persistence verification, and audit logs'
            : 'बैकएंड सुपाबेस विन्यास, गूगल प्रमाणीकरण, डेटा संग्रहण स्थिति और ऑडिट लॉग'}
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* SECTION 1: SUPABASE BACKEND & GOOGLE OAUTH */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5 transition-colors">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Supabase Backend & Google OAuth Identity
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Role-based secure authentication and relational storage across village health centres.
            </p>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            supabaseConfig.isConnected
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-600' : 'bg-amber-600'}`} />
            <span>{supabaseConfig.isConnected ? 'Cloud Connected' : 'Local Offline Demo'}</span>
          </div>
        </div>

        {/* Persistence Transparency Notice */}
        <div className={`p-4 rounded-xl text-xs space-y-2 border ${
          supabaseConfig.isConnected
            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
            : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
            <span>
              {supabaseConfig.isConnected
                ? 'Active PostgreSQL Synchronization & Row Level Security'
                : 'Offline Demo Storage Active (Browser LocalStorage)'}
            </span>
          </div>
          <p className="leading-relaxed opacity-90">
            {supabaseConfig.isConnected
              ? 'Data is actively synced to your Supabase PostgreSQL tables (patients, screenings, referrals, audit_logs) with Row Level Security (RLS) policies protecting privacy.'
              : 'Never pretend data is persisted if the backend is not connected: Because Supabase credentials are not set in the environment, all registered patients, vitals readings, and referrals are safely stored in your browser local storage. To enable cloud persistence, configure the variables in .env.'}
          </p>
        </div>

        {/* Environment configuration details & Google Sign-In Action */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Environment Variables Status:</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Configure Google OAuth in Supabase</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-slate-400 block text-[10px] font-sans">VITE_SUPABASE_URL</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold truncate block">
                {supabaseConfig.url || 'Not set (Demo mode active)'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-slate-400 block text-[10px] font-sans">VITE_SUPABASE_ANON_KEY</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold truncate block">
                {supabaseConfig.anonKey || 'Not set (Demo mode active)'}
              </span>
            </div>
          </div>
        </div>

        {/* One-Click SQL Schema Script */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Supabase SQL Schema (Tables + Audit Logs + Role RLS Policies):
            </span>
            <button
              onClick={handleCopySql}
              className="text-teal-700 dark:text-teal-400 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
            {storage.getSupabaseSqlSchema()}
          </pre>
          <p className="text-[11px] text-slate-400">
            Paste this SQL script into the <strong>SQL Editor</strong> in your Supabase dashboard to provision tables, audit trail, and role security rules with one click.
          </p>
        </div>
      </div>

      {/* SECTION 2: AUDIT TRAIL LOGS (ADMIN ONLY) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Authorized System Audit Trail
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable log of consent recording, screenings, and referral resolutions.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {auditLogs.length} events logged
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-slate-400">No audit events recorded yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({log.userRole.toUpperCase()})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{log.details}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: SYNTHETIC DATASET CONTROLS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Synthetic Field Demo Data Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Test realistic frontline workflows with pre-loaded patients, vitals readings, and referrals.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-slate-400">Patients in Storage</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">{patients.length}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-slate-400">Screening Records</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">{screenings.length}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-slate-400">Active Referrals</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">{referrals.length}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleResetDemoData}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset 6 Synthetic Demo Patients</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Offline Backup (JSON)</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: PERSONNEL REGISTRATION APPROVALS & ROLE GOVERNANCE */}
      {role === 'admin' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Healthcare Personnel Registration Approvals
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review and approve frontline CHW and Clinician registrations before dashboards and patient records are unlocked.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              {pendingUsers.length} Pending
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 space-y-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
              <div className="font-semibold text-slate-700 dark:text-slate-300">No Pending Registration Approvals</div>
              <p className="text-[11px]">All registered healthcare personnel accounts have been verified and cleared.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((pUser) => (
                <div 
                  key={pUser.id}
                  className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{pUser.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                        {pUser.role}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">#{pUser.id}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                      <span>{pUser.email}</span> · <span>{pUser.phone}</span>
                    </div>
                    {pUser.location && (
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        <strong>Location/Sub-Centre:</strong> {pUser.location}
                      </div>
                    )}
                    {pUser.qualification && (
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        <strong>Qualification:</strong> {pUser.qualification} ({pUser.designation})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRejectUser(pUser.id)}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveUser(pUser.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve & Grant Access</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ROLE & LANGUAGE PROFILE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Role Persona & Language Preferences
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between health worker profiles to test permission-dependent features.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Active User Persona
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="chw">Community Health Worker (ASHA / Pooja Verma)</option>
              <option value="clinician">Clinician / Medical Officer (Dr. Priya Sharma)</option>
              <option value="admin">District Health Administrator (Rajeshwer Rao)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Platform Interface Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="en">English (India)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

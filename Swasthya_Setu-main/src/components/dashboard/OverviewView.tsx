import React from 'react';
import { 
  Users, 
  HeartPulse, 
  AlertTriangle, 
  GitBranch, 
  Activity, 
  ArrowRight, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  FileText,
  Building2,
  Stethoscope,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { Patient, Screening } from '../../types';

export const OverviewView: React.FC = () => {
  const { 
    language, 
    role, 
    user, 
    patients, 
    screenings, 
    referrals, 
    setIsRegisterModalOpen, 
    startScreening, 
    setSelectedPatientId, 
    setDashboardTab,
    setPrintableReport,
    isPermittedTab
  } = useApp();

  const t = translations[language];

  // Calculated metrics
  const totalPatientsCount = patients.length;
  const totalScreeningsCount = screenings.length;
  const highRiskCount = screenings.filter((s) => s.riskLevel === 'high').length;
  const pendingReferralsCount = referrals.filter((r) => r.status === 'pending').length;

  // Triage breakdown
  const lowCount = screenings.filter((s) => s.riskLevel === 'low').length;
  const modCount = screenings.filter((s) => s.riskLevel === 'moderate').length;
  const highCount = highRiskCount;
  const totalRiskScreenings = totalScreeningsCount || 1;

  const lowPct = Math.round((lowCount / totalRiskScreenings) * 100);
  const modPct = Math.round((modCount / totalRiskScreenings) * 100);
  const highPct = Math.round((highCount / totalRiskScreenings) * 100);

  // High risk patients needing attention
  const highRiskPatients = patients.filter((p) => p.lastRiskStatus === 'high').slice(0, 4);

  // Recent screenings
  const recentScreenings = screenings.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
              {role === 'chw' && (language === 'en' ? 'Community Health Worker Portal' : 'आशा कार्यकर्ता पोर्टल')}
              {role === 'clinician' && (language === 'en' ? 'Medical Officer Clinic Workspace' : 'चिकित्सा अधिकारी क्लिनिक')}
              {role === 'admin' && (language === 'en' ? 'District Program Administration' : 'जिला स्वास्थ्य नियंत्रण')}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {language === 'en' ? user.centerName : user.centerNameHi}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === 'en' ? `Welcome, ${user.name}` : `नमस्ते, ${user.nameHi}`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {role === 'chw' && (language === 'en' 
              ? 'Ready for field screenings. Register village residents with consent and stratify health risks.' 
              : 'फील्ड स्वास्थ्य जांच के लिए तैयार। सहमति के साथ ग्रामीणों का पंजीकरण करें और जोखिम स्तर तय करें।')}
            {role === 'clinician' && (language === 'en'
              ? 'Active clinical referral queue. Review flagged patients and verify triage directives.'
              : 'रेफरल सूची सक्रिय है। उच्च जोखिम वाले मरीजों की समीक्षा करें और चिकित्सीय परामर्श दर्ज करें।')}
            {role === 'admin' && (language === 'en'
              ? 'Population health indicators and community screening coverage surveillance.'
              : 'सामुदायिक स्वास्थ्य संकेतक और स्क्रीनिंग निगरानी रिपोर्ट का अवलोकन करें।')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {role !== 'clinician' && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.registerPatient}</span>
            </button>
          )}
          
          <button
            onClick={() => {
              if (patients.length > 0) {
                startScreening(patients[0]);
              } else {
                setIsRegisterModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{t.menuNewScreening}</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Patients */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-teal-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{t.totalPatients}</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalPatientsCount}
          </div>
          <div className="text-[11px] text-slate-400">
            Across 5 local villages
          </div>
        </div>

        {/* Card 2: Completed Screenings */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-teal-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{t.totalScreened}</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalScreeningsCount}
          </div>
          <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
            Active outreach sessions
          </div>
        </div>

        {/* Card 3: High Risk Flags */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{t.highRiskCases}</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {highRiskCount}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            Triage review required
          </div>
        </div>

        {/* Card 4: Pending Referrals */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{t.pendingReferrals}</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {pendingReferralsCount}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            Awaiting clinician consult
          </div>
        </div>
      </div>

      {/* POPULATION RISK BREAKDOWN & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Triage Distribution Bar & Risk Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Risk Distribution Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'en' ? 'Screening Risk Stratification Distribution' : 'स्वास्थ्य जांच जोखिम वर्गीकरण वितरण'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'en' ? 'Standardized protocol outcome across completed field screenings' : 'पूर्ण हुई जांचों का समग्र जोखिम अनुपात'}
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
                {totalScreeningsCount} screenings
              </span>
            </div>

            {/* Segmented Ratio Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${lowPct}%` }} className="bg-emerald-500 h-full transition-all" title={`Low Risk: ${lowPct}%`} />
                <div style={{ width: `${modPct}%` }} className="bg-amber-500 h-full transition-all" title={`Moderate Risk: ${modPct}%`} />
                <div style={{ width: `${highPct}%` }} className="bg-rose-500 h-full transition-all" title={`High Risk: ${highPct}%`} />
              </div>

              <div className="flex items-center justify-between text-xs font-medium pt-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{t.riskLow}: {lowCount} ({lowPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>{t.riskModerate}: {modCount} ({modPct}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>{t.riskHigh}: {highCount} ({highPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* High Priority Follow-up Queue */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'en' ? 'Flagged High-Risk Patient Queue' : 'उच्च जोखिम मरीज प्राथमिकता सूची'}
                </h3>
              </div>
              <button
                onClick={() => setDashboardTab('patients')}
                className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline transition-colors cursor-pointer"
              >
                View all ({totalPatientsCount})
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {highRiskPatients.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No flagged high-risk patients currently require immediate review.
                </div>
              ) : (
                highRiskPatients.map((pt) => (
                  <div key={pt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{pt.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold uppercase">
                          High Risk
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {pt.age}y / {pt.gender} · {pt.village} · {(pt.chronicConditions || []).join(', ') || 'No pre-existing record'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startScreening(pt)}
                        className="px-2.5 py-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Re-screen
                      </button>
                      <button
                        onClick={() => setSelectedPatientId(pt.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="View Patient Record"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right: Recent Screenings Activity (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs flex flex-col justify-between transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{language === 'en' ? 'Recent Screenings Feed' : 'हालिया स्वास्थ्य जांचें'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Live Session</span>
            </div>

            <div className="space-y-3">
              {recentScreenings.map((scr) => {
                const patient = patients.find((p) => p.id === scr.patientId);
                return (
                  <div key={scr.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {patient ? patient.name : scr.patientId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        scr.riskLevel === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : scr.riskLevel === 'moderate'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {scr.riskLevel}
                      </span>
                    </div>

                    {/* Vitals summary line */}
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono flex items-center gap-2">
                      <span>BP: <strong className="text-slate-800 dark:text-white">{scr.vitals.systolic}/{scr.vitals.diastolic}</strong></span>
                      <span>·</span>
                      <span>SpO2: <strong className="text-slate-800 dark:text-white">{scr.vitals.spo2}%</strong></span>
                      <span>·</span>
                      <span>BMI: <strong className="text-slate-800 dark:text-white">{scr.vitals.bmi || '--'}</strong></span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{new Date(scr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {patient && (
                        <button
                          onClick={() => setPrintableReport({ screening: scr, patient })}
                          className="text-teal-700 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom link to referrals or safety guidelines */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {isPermittedTab('referrals') ? (
              <button
                onClick={() => setDashboardTab('referrals')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>{language === 'en' ? 'Manage Referral Queue' : 'रेफरल सूची प्रबंधित करें'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setDashboardTab('safety')}
                className="w-full py-2 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'View Safety & Consent Guidelines' : 'सुरक्षा व सहमति नियम देखें'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

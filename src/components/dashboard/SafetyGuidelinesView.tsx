import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck2, 
  Lock, 
  EyeOff, 
  Stethoscope, 
  DatabaseZap, 
  CheckCircle2,
  Users,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';

export const SafetyGuidelinesView: React.FC = () => {
  const { language } = useApp();
  const t = translations[language];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{language === 'en' ? 'Clinical Governance & Ethical Standards' : 'नैदानिक शासन व नैतिक मानक'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === 'en' ? 'Safety & Responsible-Use Guidelines' : 'सुरक्षा एवं उत्तरदायी उपयोग दिशानिर्देश'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'en'
              ? 'Operational requirements, ethical boundaries, and patient privacy protocols for field health screening.'
              : 'फील्ड स्वास्थ्य जांच हेतु अनिवार्य संचालन नियम, नैतिक सीमाएं और मरीज गोपनीयता प्रोटोकॉल।'}
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 rounded-xl font-medium self-start sm:self-auto">
          PROTOCOL REV: 2026.4-NCD
        </div>
      </div>

      {/* Primary Alert Banner */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">
              {language === 'en' ? 'Non-Diagnostic Prototype Declaration' : 'गैर-नैदानिक प्रोटोटाइप घोषणा'}
            </h3>
            <p className="text-xs text-amber-900/80 dark:text-amber-300/80">
              {language === 'en' ? 'Mandatory acknowledgment for all frontline operators and clinicians' : 'सभी फ्रंटलाइन कार्यकर्ताओं एवं डॉक्टरों के लिए अनिवार्य स्वीकृति'}
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-amber-950/90 dark:text-amber-100/90">
          Swasthya Setu is engineered solely as an <strong>assistive frontline screening-support and workflow coordination prototype</strong>. It does <strong>not</strong> perform automated clinical diagnosis, issue pharmaceutical prescriptions, or replace in-person physical examinations by registered medical practitioners.
        </p>
      </div>

      {/* Eight Core Safety Mandates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Mandate 1: Screening Support, Not Diagnostic Device */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 font-bold text-sm">
            <Stethoscope className="w-5 h-5" />
            <h4>1. Assistive Screening, Never Diagnostic</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Screening results and algorithm-derived risk levels are prioritisation suggestions. They never constitute a definitive diagnosis. Any elevated or abnormal metric must be verified using calibrated diagnostic instruments in a clinical setting.
          </p>
        </div>

        {/* Mandate 2: Professional Medical Advice Required */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <h4>2. Clinical Interpretation & Advice</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Screening findings do not replace professional clinical advice. Community Health Workers must communicate findings empathetically and encourage individuals with flagged indicators to consult a primary care physician without alarming the patient.
          </p>
        </div>

        {/* Mandate 3: Strict Labelling of Simulated Readings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <DatabaseZap className="w-5 h-5" />
            <h4>3. Simulated Readings Must Display "DEMO / SIMULATED"</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Any simulated or demo vitals generated for testing or training purposes must unmistakably display <strong>“DEMO / SIMULATED”</strong> across the user interface and printable summary reports to prevent misinterpretation as authentic patient data.
          </p>
        </div>

        {/* Mandate 4: Informed Patient Consent */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 font-bold text-sm">
            <FileCheck2 className="w-5 h-5" />
            <h4>4. Mandatory Informed Consent</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Frontline operators must obtain explicit informed verbal or written consent from the individual (or legal guardian) before registering demographics or measuring physiological vitals. Consent status is recorded with every screening entry.
          </p>
        </div>

        {/* Mandate 5: Data Minimization & Authorized Access */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 font-bold text-sm">
            <Lock className="w-5 h-5" />
            <h4>5. Data Minimization & Role-Based Access</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Collect strictly necessary clinical and epidemiological information. Data access is enforced through database-level Row Level Security (RLS) restricting records to authenticated health workers, clinicians, and program administrators.
          </p>
        </div>

        {/* Mandate 6: Zero Public Exposure of Sensitive Data */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <EyeOff className="w-5 h-5" />
            <h4>6. Zero Public Exposure of Health Records</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Personally Identifiable Information (PII) including patient names, mobile numbers, and ABHA IDs must never be exposed on public websites, unauthenticated endpoints, or search engines. Screenings are strictly confidential.
          </p>
        </div>

        {/* Mandate 7: Evidence-Based Referral Guidance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 font-bold text-sm">
            <Users className="w-5 h-5" />
            <h4>7. Referral Guidance Without Fabricated Thresholds</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Referrals follow established guidelines (AHA/JNC for hypertension, WHO Asian-Indian for BMI, National TB protocols for cough lasting &gt;2 weeks). Never invent speculative disease diagnoses or unvalidated medical cutoffs.
          </p>
        </div>

        {/* Mandate 8: Synthetic Data Only in Demos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-teal-600 dark:text-teal-400 font-bold text-sm">
            <Info className="w-5 h-5" />
            <h4>8. Synthetic Demo Data Policy</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Real patient data must never be used during software demonstrations, public showcases, or educational workshops. All pre-loaded profiles within Swasthya Setu are entirely fictional synthetic representations.
          </p>
        </div>

      </div>

      {/* Operator Checklist & Affirmation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Frontline Field Operator Compliance Checklist
        </h3>
        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Explain the purpose of the health screening checkup in local dialect before starting.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Ensure the patient rests quietly for 5 minutes prior to measuring resting blood pressure.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Check that the pulse oximeter finger probe is securely fitted and patient hands are warm.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>If blood pressure reads &ge; 180/120 mmHg or SpO2 &lt; 90%, initiate emergency medical transfer immediately.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

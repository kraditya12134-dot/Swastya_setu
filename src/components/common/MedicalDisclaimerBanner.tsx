import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';

interface MedicalDisclaimerBannerProps {
  compact?: boolean;
}

export const MedicalDisclaimerBanner: React.FC<MedicalDisclaimerBannerProps> = ({ compact = false }) => {
  const { language } = useApp();
  const t = translations[language];
  const [isExpanded, setIsExpanded] = useState(!compact);

  if (compact && !isExpanded) {
    return (
      <aside 
        aria-label="Medical prototype disclaimer"
        className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">{t.medicalDisclaimerTitle}:</span>
          <span className="truncate max-w-xl">
            {language === 'en'
              ? 'Screening-support prototype only. Not a diagnostic device. Qualified medical review required.'
              : 'स्क्रीनिंग प्रोटोटाइप मात्र है। चिकित्सीय निदान हेतु डॉक्टर द्वारा जांच अनिवार्य है।'}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0 ml-2"
        >
          {language === 'en' ? 'Full notice' : 'विस्तार से देखें'}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="Medical prototype disclaimer"
      className="w-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 my-3 text-slate-800 dark:text-amber-100/90 text-sm shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-950 dark:text-amber-200 text-sm flex items-center gap-2">
              <span>{t.medicalDisclaimerTitle}</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300">
                {language === 'en' ? 'Assistive Triage Only' : 'केवल स्क्रीनिंग सहायता'}
              </span>
            </h4>
            <p className="text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/80">
              {t.medicalDisclaimerText}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-800 dark:text-amber-300 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                {language === 'en' ? 'Non-diagnostic Decision Support' : 'गैर-नैदानिक निर्णय सहायता'}
              </span>
              <span>•</span>
              <span>{language === 'en' ? 'Clinical Validation Mandatory' : 'चिकित्सकीय प्रमाणीकरण अनिवार्य'}</span>
              <span>•</span>
              <span>{language === 'en' ? 'Simulated readings are clearly labelled' : 'सिम्युलेटेड रीडिंग स्पष्ट रूप से चिह्नित'}</span>
            </div>
          </div>
        </div>
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 p-1 shrink-0"
            title="Collapse notice"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

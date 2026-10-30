import React from 'react';
import { 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  HeartPulse, 
  Stethoscope, 
  FileText, 
  Users, 
  GitBranch, 
  Sparkles, 
  ChevronRight,
  Database,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { Navbar } from '../layout/Navbar';
import { UserRole } from '../../types';

// Verified generated imagery
const HERO_IMG = '/src/assets/images/hero_community_health_1793309291087.jpg';
const DOCTOR_IMG = '/src/assets/images/clinic_telehealth_doctor_1793309291817.jpg';
const KIT_IMG = '/src/assets/images/portable_screening_kit_1793309291550.jpg';

interface LandingPageProps {
  onNavigateToRoleLogin?: (route: 'admin' | 'chw' | 'doctor') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToRoleLogin }) => {
  const { language, setView, setRole, role, setDashboardTab, setIsAuthModalOpen } = useApp();
  const t = translations[language];

  const handleLaunchRole = (targetRole: UserRole) => {
    setRole(targetRole);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      <Navbar onNavigateToRoleLogin={onNavigateToRoleLogin} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
          {/* Subtle teal atmospheric radial glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Proposition */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-medium">
                  <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'en' ? 'Frontline Healthcare Screening Support' : 'प्राथमिक स्वास्थ्य डिजिटल स्क्रीनिंग मंच'}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight">
                  {language === 'en' ? (
                    <>
                      Bridging Communities to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400">Better Health</span>
                    </>
                  ) : (
                    <>
                      स्वास्थ्य सेतु: <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400">समुदाय को बेहतर स्वास्थ्य से जोड़ना</span>
                    </>
                  )}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                  {language === 'en'
                    ? 'Swasthya Setu equips Community Health Workers (ASHAs) and Primary Health Centre Clinicians with a unified digital screening workflow — combining non-invasive vitals tracking, automatic BMI calculation, standardized risk stratification, and seamless referral management.'
                    : 'स्वास्थ्य सेतु आशा कार्यकर्ताओं और प्राथमिक स्वास्थ्य केंद्र के चिकित्सकों को एक एकीकृत डिजिटल स्क्रीनिंग मंच प्रदान करता है — जिसमें गैर-आक्रामक स्वास्थ्य संकेतक, स्वचालित बीएमआई, मानकीकृत जोखिम वर्गीकरण और सुगम रेफरल प्रणाली शामिल है।'}
                </p>

                {/* Role-based Direct Launch Buttons */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      {language === 'en' ? 'Launch demo workspace by role:' : 'भूमिका अनुसार डेमो पोर्टल खोलें:'}
                    </span>
                    {onNavigateToRoleLogin && (
                      <span className="text-[11px] text-teal-400 font-medium hidden sm:inline">
                        Dedicated login routes: /login/chw · /login/doctor · /login/admin
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleLaunchRole('chw')}
                      className="px-4 py-2.5 rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>{language === 'en' ? 'CHW / ASHA Worker' : 'स्वास्थ्य कार्यकर्ता (CHW)'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleLaunchRole('clinician')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-teal-500/50 font-semibold text-xs sm:text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4 text-teal-400" />
                      <span>{language === 'en' ? 'Clinician / Doctor' : 'चिकित्सक / डॉक्टर'}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleLaunchRole('admin')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-teal-500/50 font-semibold text-xs sm:text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'en' ? 'Health Administrator' : 'प्रशासक'}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Dedicated Role Login Routes Navigation */}
                  {onNavigateToRoleLogin && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{language === 'en' ? 'Or open role login page:' : 'या समर्पित लॉगिन पृष्ठ खोलें:'}</span>
                      <button
                        onClick={() => onNavigateToRoleLogin('chw')}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-teal-400 hover:text-teal-300 font-mono text-[11px] cursor-pointer transition-colors"
                      >
                        /login/chw
                      </button>
                      <button
                        onClick={() => onNavigateToRoleLogin('doctor')}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 font-mono text-[11px] cursor-pointer transition-colors"
                      >
                        /login/doctor
                      </button>
                      <button
                        onClick={() => onNavigateToRoleLogin('admin')}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 font-mono text-[11px] cursor-pointer transition-colors"
                      >
                        /login/admin
                      </button>
                    </div>
                  )}
                </div>

                {/* Key Trust Signals & Non-Diagnostic Badge */}
                <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    {language === 'en' ? 'Offline-first Local Storage' : 'ऑफ़लाइन-लोकल स्टोरेज सक्षम'}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    {language === 'en' ? 'Supabase Backend Ready' : 'सुपाबेस क्लाउड डेटाबेस सिंक'}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    {language === 'en' ? 'Decision Support Prototype' : 'निर्णय-सहायता प्रोटोटाइप'}
                  </span>
                </div>
              </div>

              {/* Right Column: Hero Visual Anchor with Glass Overlay */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                  <img
                    src={HERO_IMG}
                    alt="Frontline healthcare worker conducting digital screening"
                    referrerPolicy="no-referrer"
                    className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Floating clinical card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 space-y-2 shadow-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-400" />
                        {language === 'en' ? 'Community Triage Summary' : 'सामुदायिक स्क्रीनिंग सारांश'}
                      </span>
                      <span className="text-teal-400 font-mono text-[11px]">Arogya Mandir Active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">SpO2</div>
                        <div className="text-sm font-bold text-teal-300 tabular-nums">98%</div>
                      </div>
                      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">BP</div>
                        <div className="text-sm font-bold text-white tabular-nums">120/80</div>
                      </div>
                      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">BMI</div>
                        <div className="text-sm font-bold text-emerald-400 tabular-nums">22.4</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section id="workflow" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
                {language === 'en' ? 'Standardized Field Protocol' : 'मानकीकृत फील्ड कार्यप्रणाली'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-balance">
                {language === 'en' 
                  ? 'From Village Screening to Hospital Care in Four Coordinated Steps' 
                  : 'गांव में जांच से लेकर अस्पताल परामर्श तक 4 समन्वित चरण'}
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                {language === 'en'
                  ? 'Designed for low-bandwidth village sub-centres and mobile health outreach camps with clear task boundaries.'
                  : 'कम नेटवर्क वाले ग्रामीण उप-स्वास्थ्य केंद्रों और मोबाइल स्वास्थ्य कैंपों के लिए विशेष रूप से तैयार।'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between group hover:border-teal-500/40 transition-colors">
                <div className="space-y-3">
                  <div className="text-3xl font-black text-slate-700 font-mono">01</div>
                  <h3 className="text-lg font-semibold text-white">
                    {language === 'en' ? 'Patient Identification' : 'मरीज पहचान व पंजीकरण'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'en'
                      ? 'Register village resident with demographic details, contact number, emergency contact, and optional 14-digit ABHA ID.'
                      : 'मरीज का नाम, आयु, संपर्क, आपातकालीन अभिभावक और 14 अंकों की आभा आईडी के साथ त्वरित पंजीकरण।'}
                  </p>
                </div>
                <div className="pt-4 text-xs font-medium text-teal-400 flex items-center gap-1">
                  <span>{language === 'en' ? 'CHW Mobile Task' : 'आशा कार्यकर्ता कार्य'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between group hover:border-teal-500/40 transition-colors">
                <div className="space-y-3">
                  <div className="text-3xl font-black text-slate-700 font-mono">02</div>
                  <h3 className="text-lg font-semibold text-white">
                    {language === 'en' ? 'Vitals & BMI Capture' : 'स्वास्थ्य संकेतक व बीएमआई'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'en'
                      ? 'Record Heart Rate, SpO2, Temperature, Blood Pressure, Height, and Weight with automatic WHO Asian-Indian BMI calculation.'
                      : 'पल्स, ऑक्सीजन, तापमान, बीपी, ऊंचाई और वजन दर्ज करें। सिस्टम तुरंत बीएमआई की गणना करता है।'}
                  </p>
                </div>
                <div className="pt-4 text-xs font-medium text-teal-400 flex items-center gap-1">
                  <span>{language === 'en' ? 'Manual or Simulated Vitals' : 'मैनुअल या सिम्युलेटेड'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between group hover:border-teal-500/40 transition-colors">
                <div className="space-y-3">
                  <div className="text-3xl font-black text-slate-700 font-mono">03</div>
                  <h3 className="text-lg font-semibold text-white">
                    {language === 'en' ? 'Assistive Triage & Risk' : 'सहायक जोखिम वर्गीकरण'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'en'
                      ? 'Standardized decision rules categorize risk into Low, Moderate, or High, identifying hypertensive crisis or hypoxemia flags.'
                      : 'सिस्टम नियमों के आधार पर मरीज को सामान्य, मध्यम या उच्च जोखिम में वर्गीकृत कर चेतावनी दिखाता है।'}
                  </p>
                </div>
                <div className="pt-4 text-xs font-medium text-teal-400 flex items-center gap-1">
                  <span>{language === 'en' ? 'Standardized Criteria' : 'मानकीकृत नियम'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between group hover:border-teal-500/40 transition-colors">
                <div className="space-y-3">
                  <div className="text-3xl font-black text-slate-700 font-mono">04</div>
                  <h3 className="text-lg font-semibold text-white">
                    {language === 'en' ? 'Tele-Referral & Report' : 'रेफरल व रिपोर्ट प्रेषण'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'en'
                      ? 'Route flagged patients directly to the nearest PHC/CHC doctor queue and generate a printable clinical screening report.'
                      : 'आवश्यक मरीजों को प्राथमिक स्वास्थ्य केंद्र या जिला अस्पताल रेफर करें और प्रिंट योग्य रिपोर्ट बनाएं।'}
                  </p>
                </div>
                <div className="pt-4 text-xs font-medium text-teal-400 flex items-center gap-1">
                  <span>{language === 'en' ? 'Doctor Review' : 'डॉक्टर समीक्षा'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ASYMMETRIC BENTO GRID: CAPABILITIES */}
        <section id="capabilities" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 mb-14">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
              {language === 'en' ? 'Core Capabilities' : 'प्रमुख क्षमताएं'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {language === 'en' ? 'Built for Frontline Reality' : 'जमीनी हकीकत को ध्यान में रखकर निर्मित'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Bento Card 1: Clinician Telehealth Hub (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                <div className="inline-flex p-2 rounded-lg bg-teal-500/10 text-teal-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {language === 'en' ? 'Doctor Telehealth & Referral Queue' : 'चिकित्सक रेफरल समीक्षा प्रणाली'}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  {language === 'en'
                    ? 'Primary Care Medical Officers can triage incoming community referrals by urgency (Routine, Urgent, Emergency), inspect vital histories, append treatment notes, and track closed-loop resolution.'
                    : 'चिकित्सा अधिकारी आपातकालीन या उच्च जोखिम वाले मामलों की प्राथमिकता अनुसार समीक्षा कर सकते हैं और परामर्श निर्देश दर्ज कर सकते हैं।'}
                </p>
              </div>
              <div className="relative h-64 overflow-hidden border-t border-slate-800">
                <img
                  src={DOCTOR_IMG}
                  alt="Doctor reviewing screening referrals"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              </div>
            </div>

            {/* Bento Card 2: Portable Screening Kit & Simulated Sensors (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                <div className="inline-flex p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {language === 'en' ? 'Simulated Field Sensors' : 'सिम्युलेटेड फील्ड सेंसर'}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {language === 'en'
                    ? 'Includes interactive sensor simulation for pulse oximeters, digital cuffs, and thermometers for training and demonstration — clearly labelled as non-diagnostic demo feeds.'
                    : 'प्रशिक्षण और डेमो हेतु पल्स ऑक्सीमीटर और बीपी मॉनिटर की सिम्युलेटेड रीडिंग्स की सुविधा, जो स्पष्ट रूप से चिह्नित हैं।'}
                </p>
              </div>
              <div className="relative h-64 overflow-hidden border-t border-slate-800">
                <img
                  src={KIT_IMG}
                  alt="Portable health screening diagnostic kit"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              </div>
            </div>

            {/* Bento Card 3: Dual Backend (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="inline-flex p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {language === 'en' ? 'Transparent Persistence & Supabase' : 'पारदर्शी डेटा स्टोरेज व सुपाबेस'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'We never pretend data is cloud-persisted when unconfigured. Works immediately offline via local browser storage, and seamlessly connects to your Supabase PostgreSQL backend when credentials are provided in .env.'
                  : 'यदि बैकएंड कनेक्ट नहीं है, तो सिस्टम कभी झूठा दावा नहीं करता। यह स्थानीय स्टोरेज में काम करता है और .env में Supabase क्रेडेंशियल मिलने पर तुरंत क्लाउड से जुड़ जाता है।'}
              </p>
              <div className="pt-2 text-xs font-mono text-teal-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span>VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY</span>
              </div>
            </div>

            {/* Bento Card 4: Printable Clinical Reports (6 cols) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="inline-flex p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {language === 'en' ? 'Official Printable Screening Reports' : 'प्रिंट योग्य मेडिकल स्क्रीनिंग रिपोर्ट'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Generate clean, standardized paper reports with vital signs, risk flags, health center stamp blocks, and signature lines for patients to take to the hospital.'
                  : 'मरीजों को अस्पताल ले जाने के लिए स्वास्थ्य संकेतकों, जोखिम चेतावनियों और डॉक्टर के हस्ताक्षर वाली मानक मेडिकल रिपोर्ट प्रिंट करें।'}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">✓</span>
                <span>{language === 'en' ? 'Formatted for standard A4 and PDF output' : 'A4 और पीडीएफ फॉर्मेट हेतु अनुकूलित'}</span>
              </div>
            </div>

          </div>
        </section>

        {/* ABOUT & RESPONSIBLE USE DISCLAIMER */}
        <section id="disclaimer" className="py-16 bg-slate-900/60 border-t border-slate-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-200">
                    {t.medicalDisclaimerTitle}
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    {language === 'en' ? 'Regulatory and Clinical Responsibility Statement' : 'विनियामक व नैदानिक उत्तरदायित्व वक्तव्य'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-amber-100/90 leading-relaxed">
                {t.medicalDisclaimerText}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-amber-500/20 text-xs text-amber-200/90">
                <div>
                  <div className="font-semibold text-white">1. Assistive, Not Autonomous</div>
                  <p className="text-amber-300/80 mt-1">Algorithm outputs are clinical triage recommendations, not binding medical decisions.</p>
                </div>
                <div>
                  <div className="font-semibold text-white">2. Calibrated Devices Required</div>
                  <p className="text-amber-300/80 mt-1">Real-world screenings must use certified, clinically validated sensors and standard cuffs.</p>
                </div>
                <div>
                  <div className="font-semibold text-white">3. Clear Simulation Labels</div>
                  <p className="text-amber-300/80 mt-1">Any simulated demo telemetry is prominently marked to prevent diagnostic confusion.</p>
                </div>
              </div>

              {/* View Complete Safety Guidelines Button */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-amber-500/20">
                <span className="text-xs text-amber-300/90">
                  {language === 'en' ? 'Review our 8 clinical safety rules, data privacy protocols, and consent standards:' : 'हमारे 8 नैदानिक सुरक्षा नियम, डेटा गोपनीयता व सहमति प्रोटोकॉल देखें:'}
                </span>
                <button
                  onClick={() => {
                    setDashboardTab('safety');
                    setView('dashboard');
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>{language === 'en' ? 'Open Safety & Responsible Use Protocol' : 'सुरक्षा व उत्तरदायित्व प्रोटोकॉल पढ़ें'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Launch CTA Strip */}
            <div className="text-center pt-6 space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {language === 'en' ? 'Ready to test the frontline workflow?' : 'क्या आप फ्रंटलाइन कार्यप्रणाली का परीक्षण करने के लिए तैयार हैं?'}
              </h3>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                {language === 'en'
                  ? 'Access the comprehensive application dashboard loaded with synthetic field patients, simulated vitals sensors, and live referral queues.'
                  : 'सिंथेटिक मरीज डेटा, सिम्युलेटेड सेंसर और रेफरल कतारों के साथ संपूर्ण डैशबोर्ड का अनुभव करें।'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => setView('dashboard')}
                  className="px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{language === 'en' ? 'Launch Swasthya Setu Application' : 'स्वास्थ्य सेतु एप्लिकेशन खोलें'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>{language === 'en' ? 'Google Sign-In / Setup' : 'गूगल साइन-इन / सेटअप'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-slate-200">Swasthya Setu (स्वास्थ्य सेतु)</span>
            <span>·</span>
            <span>Bridging Communities to Better Health</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-center sm:text-right">
            <button
              onClick={() => {
                setDashboardTab('safety');
                setView('dashboard');
              }}
              className="hover:text-teal-400 transition-colors cursor-pointer"
            >
              Safety Guidelines
            </button>
            <span>·</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-teal-400 transition-colors cursor-pointer"
            >
              Google Auth Setup
            </button>
            <span>·</span>
            <span>Non-diagnostic prototype · 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

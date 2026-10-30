import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  ShieldAlert, 
  Check, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Phone,
  MapPin, 
  HeartPulse, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle,
  Edit2,
  Calendar,
  Building,
  Info,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { Patient } from '../../types';
import { storage } from '../../services/storage';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (newPatient: Patient, startScreeningImmediately: boolean) => void;
}

const COMMON_CONDITIONS = [
  'Hypertension',
  'Type 2 Diabetes',
  'Asthma / Chronic Bronchitis',
  'Tobacco Consumer (Bidi/Gutka)',
  'Heart Disease History',
  'Previous Stroke',
  'None Known',
];

const COMMON_ALLERGIES = [
  'Penicillin / Antibiotics',
  'Sulfa Drugs',
  'Aspirin / NSAIDs',
  'Dust / Pollen',
  'No Known Drug Allergies (NKDA)',
];

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const { language, user, role, patients, refreshData } = useApp();
  const t = translations[language];

  // Steps: 1 to 8 + Review (9)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Block 1: Personal Information
  const [name, setName] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [abhaId, setAbhaId] = useState('');

  // Block 2: Contact Information
  const [contact, setContact] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [communicationPreference, setCommunicationPreference] = useState<'sms' | 'call' | 'visit'>('visit');

  // Block 3: Address and Location
  const [village, setVillage] = useState('Pipariya');
  const [wardOrBlock, setWardOrBlock] = useState('Ward 4 (AAM Sector)');
  const [district, setDistrict] = useState('Hoshangabad');
  const [stateName, setStateName] = useState('Madhya Pradesh');
  const [pincode, setPincode] = useState('461775');

  // Block 4: Medical History
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [pastSurgeries, setPastSurgeries] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Block 5: Current Health Information
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [lifestyleHabits, setLifestyleHabits] = useState<string[]>([]);

  // Block 6: Screening History (Prior baseline records)
  const [baselineScreeningNotes, setBaselineScreeningNotes] = useState('');
  const [priorCampDate, setPriorCampDate] = useState('');
  const [priorRiskStatus, setPriorRiskStatus] = useState<'none' | 'low' | 'moderate' | 'high'>('none');

  // Block 7: Consent and Privacy
  const [consentObtained, setConsentObtained] = useState(true);
  const [consentDate, setConsentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [privacyNoticeAcknowledged, setPrivacyNoticeAcknowledged] = useState(true);

  // Block 8: Referrals and Follow-up
  const [preferredFacility, setPreferredFacility] = useState('Pipariya Community Health Centre (CHC)');
  const [followUpIntervalMonths, setFollowUpIntervalMonths] = useState<number>(3);
  const [referralNotes, setReferralNotes] = useState('');

  // Review step & options
  const [startImmediately, setStartImmediately] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Toggle selection helpers
  const toggleCondition = (cond: string) => {
    if (cond === 'None Known') {
      setChronicConditions(['None Known']);
      return;
    }
    const filtered = chronicConditions.filter((c) => c !== 'None Known');
    if (filtered.includes(cond)) {
      setChronicConditions(filtered.filter((c) => c !== cond));
    } else {
      setChronicConditions([...filtered, cond]);
    }
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !chronicConditions.includes(customCondition.trim())) {
      setChronicConditions(chronicConditions.filter((c) => c !== 'None Known').concat(customCondition.trim()));
      setCustomCondition('');
    }
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'No Known Drug Allergies (NKDA)') {
      setAllergies(['No Known Drug Allergies (NKDA)']);
      return;
    }
    const filtered = allergies.filter((a) => a !== 'No Known Drug Allergies (NKDA)');
    if (filtered.includes(allergy)) {
      setAllergies(filtered.filter((a) => a !== allergy));
    } else {
      setAllergies([...filtered, allergy]);
    }
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies(allergies.filter((a) => a !== 'No Known Drug Allergies (NKDA)').concat(customAllergy.trim()));
      setCustomAllergy('');
    }
  };

  const toggleHabit = (habit: string) => {
    if (lifestyleHabits.includes(habit)) {
      setLifestyleHabits(lifestyleHabits.filter((h) => h !== habit));
    } else {
      setLifestyleHabits([...lifestyleHabits, habit]);
    }
  };

  // Step-by-step validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) errors.name = 'Full patient name is required.';
      const ageNum = parseInt(age, 10);
      if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 125) {
        errors.age = 'Please enter a valid age between 1 and 125.';
      }
      if (abhaId.trim()) {
        const cleanAbha = abhaId.replace(/[\s-]/g, '');
        if (cleanAbha.length !== 14 || !/^\d+$/.test(cleanAbha)) {
          errors.abhaId = 'ABHA ID must be a 14-digit number (e.g., 91-4402-9812-3321).';
        }
      }
    } else if (step === 2) {
      if (!contact.trim()) {
        errors.contact = 'Primary contact number is required for follow-up.';
      }
      if (!emergencyContact.trim()) {
        errors.emergencyContact = 'Emergency contact person and phone are required.';
      }
    } else if (step === 3) {
      if (!village.trim()) errors.village = 'Village / locality name is required.';
      if (!district.trim()) errors.district = 'District name is required.';
    } else if (step === 7) {
      if (!consentObtained) {
        errors.consentObtained = 'Informed consent is mandatory prior to recording patient data.';
      }
      if (!privacyNoticeAcknowledged) {
        errors.privacyNoticeAcknowledged = 'Privacy protocol must be acknowledged.';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 9));
      setGlobalError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!consentObtained) {
      setGlobalError('Patient informed consent must be recorded before registry submission.');
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);
    setSaveSuccessNotice(null);

    try {
      const generatedId = `PAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      const newPatient: Patient = {
        id: generatedId,
        abhaId: abhaId.trim() || undefined,
        name: name.trim(),
        nameHi: nameHi.trim() || undefined,
        age: parseInt(age, 10),
        gender,
        contact: contact.trim(),
        emergencyContact: emergencyContact.trim(),
        village: village.trim(),
        wardOrBlock: wardOrBlock.trim() || undefined,
        district: district.trim(),
        state: stateName.trim(),
        pincode: pincode.trim() || undefined,
        chronicConditions: chronicConditions.length > 0 ? chronicConditions : ['None Known'],
        allergies: allergies.length > 0 ? allergies : ['No Known Drug Allergies (NKDA)'],
        currentMedications: currentMedications.trim() || undefined,
        pastSurgeries: pastSurgeries.trim() || undefined,
        familyHistory: familyHistory.trim() || undefined,
        lifestyleHabits: lifestyleHabits.length > 0 ? lifestyleHabits : undefined,
        baselineScreeningNotes: baselineScreeningNotes.trim() || undefined,
        preferredFacility: preferredFacility.trim() || undefined,
        followUpIntervalMonths,
        referralNotes: referralNotes.trim() || undefined,
        consentObtained: true,
        consentDate: new Date(consentDate).toISOString(),
        communicationPreference,
        privacyNoticeAcknowledged,
        registeredAt: new Date().toISOString(),
        registeredBy: `${user.name} (${user.role.toUpperCase()})`,
        lastRiskStatus: priorRiskStatus !== 'none' ? priorRiskStatus : undefined,
        lastScreenedAt: priorCampDate ? new Date(priorCampDate).toISOString() : undefined,
      };

      await storage.savePatient(newPatient, user.role, user.name);
      await refreshData();

      const isCloud = storage.getSupabaseConfig().isConnected;
      const notice = isCloud
        ? 'Patient record successfully saved and synced to Supabase.'
        : 'Patient record successfully saved to local demo storage (Supabase not configured).';
      setSaveSuccessNotice(notice);

      setTimeout(() => {
        if (onRegistered) {
          onRegistered(newPatient, startImmediately);
        }
        onClose();
      }, 700);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to complete patient registration. Please check fields.');
      setIsSubmitting(false);
    }
  };

  const STEP_TITLES = [
    'Personal Info',
    'Contact Info',
    'Address & Location',
    'Medical History',
    'Current Health',
    'Screening History',
    'Consent & Privacy',
    'Referrals & Follow-up',
    'Review & Submit',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh] transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  {language === 'en' ? 'New Patient Intake & Registration' : 'नया मरीज पंजीकरण (8 ब्लॉक)'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-semibold uppercase">
                  8-BLOCK DIRECTORY
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'en' 
                  ? 'Standardized Indian frontline healthcare intake protocol' 
                  : 'मानकीकृत प्राथमिक स्वास्थ्य डिजिटल रजिस्ट्री'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker (1 to 8 + Review) */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>
              {currentStep <= 8 ? `Block ${currentStep} of 8: ${STEP_TITLES[currentStep - 1]}` : 'Block 9: Review and Confirm'}
            </span>
            <span className="text-teal-600 dark:text-teal-400 font-mono text-[11px]">
              {Math.round(((currentStep - 1) / 8) * 100)}% Complete
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-9 gap-1.5">
            {STEP_TITLES.map((title, idx) => {
              const stepNum = idx + 1;
              const isPassed = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (stepNum < currentStep) setCurrentStep(stepNum);
                  }}
                  disabled={stepNum > currentStep}
                  title={`${stepNum}. ${title}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-teal-500 shadow-sm'
                      : isPassed
                      ? 'bg-teal-700 dark:bg-teal-600'
                      : 'bg-slate-200 dark:bg-slate-700 opacity-60'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 dark:text-slate-300 space-y-5">
          
          {saveSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 font-semibold animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}

          {globalError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}

          {/* BLOCK 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Block 1: Personal Information (व्यक्तिगत विवरण)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter demographic identity and national ABHA digital health account number.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Full Legal Name (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Meera Devi"
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500 ${
                      stepErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {stepErrors.name && <p className="text-rose-500 text-[10px]">{stepErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    नाम (हिन्दी में - वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={nameHi}
                    onChange={(e) => setNameHi(e.target.value)}
                    placeholder="उदा. मीरा देवी"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Age (Years) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="125"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g., 54"
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500 font-mono ${
                      stepErrors.age ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {stepErrors.age && <p className="text-rose-500 text-[10px]">{stepErrors.age}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Gender (लिंग) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['female', 'male', 'other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize cursor-pointer transition-colors ${
                          gender === g
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                      Ayushman Bharat Health Account (ABHA ID)
                    </label>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                      14-digit National Health ID
                    </span>
                  </div>
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="XX-XXXX-XXXX-XXXX (e.g. 91-4402-9812-3321)"
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500 font-mono ${
                      stepErrors.abhaId ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {stepErrors.abhaId && <p className="text-rose-500 text-[10px]">{stepErrors.abhaId}</p>}
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 2: CONTACT INFORMATION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Block 2: Contact Information (संपर्क विवरण)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Phone numbers for consultation reminders, triage alerts, and designated emergency caregiver.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Primary Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500 font-mono ${
                      stepErrors.contact ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {stepErrors.contact && <p className="text-rose-500 text-[10px]">{stepErrors.contact}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Emergency Contact (Name & Phone) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g., Rakesh (Son) - +91 98765 43211"
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500 ${
                      stepErrors.emergencyContact ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {stepErrors.emergencyContact && <p className="text-rose-500 text-[10px]">{stepErrors.emergencyContact}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Preferred Communication Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'visit', label: 'ASHA Home Visit' },
                      { id: 'call', label: 'Voice Call' },
                      { id: 'sms', label: 'SMS Notification' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCommunicationPreference(opt.id as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          communicationPreference === opt.id
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 3: ADDRESS AND LOCATION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Block 3: Address and Location (पता एवं भौगोलिक स्थान)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Village, ward, sub-centre jurisdiction, district and PIN code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Village / Town / Locality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g., Pipariya"
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500 ${
                      stepErrors.village ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {stepErrors.village && <p className="text-rose-500 text-[10px]">{stepErrors.village}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Ward / Sub-centre Sector
                  </label>
                  <input
                    type="text"
                    value={wardOrBlock}
                    onChange={(e) => setWardOrBlock(e.target.value)}
                    placeholder="e.g., Ward 4 (AAM Sector)"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g., Hoshangabad"
                    className={`w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500 ${
                      stepErrors.district ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {stepErrors.district && <p className="text-rose-500 text-[10px]">{stepErrors.district}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    State / UT
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g., Madhya Pradesh"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g., 461775"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 4: MEDICAL HISTORY */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>Block 4: Medical History (चिकित्सीय इतिहास)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pre-existing non-communicable conditions, surgical history, and familial risk.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Diagnosed Chronic Conditions
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_CONDITIONS.map((c) => {
                    const isSelected = chronicConditions.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCondition(c)}
                        className={`p-2 rounded-xl border text-left text-xs font-medium cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{c}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom condition input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customCondition}
                    onChange={(e) => setCustomCondition(e.target.value)}
                    placeholder="Add other diagnosed condition..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addCustomCondition}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                      Past Major Surgeries / Hospitalizations
                    </label>
                    <input
                      type="text"
                      value={pastSurgeries}
                      onChange={(e) => setPastSurgeries(e.target.value)}
                      placeholder="e.g., Appendectomy (2018), Cesarean delivery"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                      Family Medical History
                    </label>
                    <input
                      type="text"
                      value={familyHistory}
                      onChange={(e) => setFamilyHistory(e.target.value)}
                      placeholder="e.g., Father had premature myocardial infarction"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 5: CURRENT HEALTH INFORMATION */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
                    5
                  </span>
                  <span>Block 5: Current Health Information (वर्तमान स्वास्थ्य स्थिति)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Allergies, ongoing daily medications, and lifestyle consumption habits.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                  Known Drug & Substance Allergies
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_ALLERGIES.map((a) => {
                    const isSelected = allergies.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAllergy(a)}
                        className={`p-2 rounded-xl border text-left text-xs font-medium cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{a}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    placeholder="Add other known allergy..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addCustomAllergy}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Current Daily Medications & Prescriptions
                  </label>
                  <input
                    type="text"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="e.g., Amlodipine 5mg OD, Metformin 500mg BD"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Lifestyle Consumption Habits
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Smokes Bidi / Cigarettes', 'Consumes Chewing Tobacco (Gutka)', 'Consumes Alcohol', 'Sedentary Lifestyle'].map((h) => {
                      const isSel = lifestyleHabits.includes(h);
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => toggleHabit(h)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                            isSel
                              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 6: SCREENING HISTORY */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
                    6
                  </span>
                  <span>Block 6: Screening History (पूर्व स्वास्थ्य जांच इतिहास)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Record any baseline community camp screening dates or previously documented blood pressure checks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Prior Village Camp Check Date (If known)
                  </label>
                  <input
                    type="date"
                    value={priorCampDate}
                    onChange={(e) => setPriorCampDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Prior Documented Risk Classification
                  </label>
                  <select
                    value={priorRiskStatus}
                    onChange={(e) => setPriorRiskStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="none">No Prior Camp Record</option>
                    <option value="low">Low Risk (Nominal)</option>
                    <option value="moderate">Moderate Risk</option>
                    <option value="high">High Risk (Urgent)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Baseline Notes from Previous Health Encounters
                  </label>
                  <textarea
                    rows={3}
                    value={baselineScreeningNotes}
                    onChange={(e) => setBaselineScreeningNotes(e.target.value)}
                    placeholder="e.g., Patient noted occasional morning headaches; advised salt reduction at previous camp check."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 7: CONSENT AND PRIVACY */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
                    7
                  </span>
                  <span>Block 7: Consent and Privacy (सहमति एवं गोपनीयता)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Verify informed verbal or written consent for digital health screening.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentObtained}
                    onChange={(e) => setConsentObtained(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-teal-300 focus:ring-teal-500 mt-0.5 shrink-0"
                  />
                  <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    <strong className="text-teal-900 dark:text-teal-300">Mandatory Informed Consent:</strong> The patient (or designated guardian) has been briefed in their vernacular language regarding the non-invasive nature of physiological vital screenings, and has explicitly consented to this digital health intake.
                  </span>
                </label>
                {stepErrors.consentObtained && (
                  <p className="text-rose-600 font-semibold text-[10px] pl-7">{stepErrors.consentObtained}</p>
                )}

                <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Consent Recorded Date
                    </label>
                    <input
                      type="date"
                      value={consentDate}
                      onChange={(e) => setConsentDate(e.target.value)}
                      className="mt-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-start gap-2 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyNoticeAcknowledged}
                        onChange={(e) => setPrivacyNoticeAcknowledged(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded border-teal-300 focus:ring-teal-500 mt-0.5"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        Privacy protocol acknowledged: No patient identifiable data will be displayed publicly or transferred without authorization.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLOCK 8: REFERRALS AND FOLLOW-UP */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
                    8
                  </span>
                  <span>Block 8: Referrals & Follow-up Plan (रेफरल एवं फॉलो-अप)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Designated referral health facility and scheduled re-screening interval.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Designated Primary Referral Health Facility
                  </label>
                  <select
                    value={preferredFacility}
                    onChange={(e) => setPreferredFacility(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Pipariya Community Health Centre (CHC)">Pipariya Community Health Centre (CHC)</option>
                    <option value="Rampur Primary Health Centre (PHC)">Rampur Primary Health Centre (PHC)</option>
                    <option value="Bilaspur Civil Hospital">Bilaspur Civil Hospital</option>
                    <option value="Hoshangabad District Hospital">Hoshangabad District Hospital</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Recommended Follow-up Interval
                  </label>
                  <select
                    value={followUpIntervalMonths}
                    onChange={(e) => setFollowUpIntervalMonths(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value={1}>1 Month (Urgent / Active Triage)</option>
                    <option value={3}>3 Months (Routine Chronic Follow-up)</option>
                    <option value={6}>6 Months (Nominal Periodic Re-screening)</option>
                    <option value={12}>12 Months (Annual Preventive Check)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                    Intake Notes & Referral Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={referralNotes}
                    onChange={(e) => setReferralNotes(e.target.value)}
                    placeholder="e.g., Patient advised to bring previous prescription slips to PHC consultation."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: REVIEW AND SUBMIT */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Review All 8 Blocks & Confirm Submission</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm accuracy before saving to the permanent clinical registry. Click any block to edit.
                </p>
              </div>

              {/* Review Summary Cards */}
              <div className="space-y-3">
                {/* Block 1 & 2 */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">1. Identity & 2. Contact</span>
                    <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {name} {nameHi ? `(${nameHi})` : ''} · {age} Yrs · {gender.toUpperCase()}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-mono text-[11px] mt-0.5">
                      Contact: {contact} · Emergency: {emergencyContact}
                    </div>
                    {abhaId && <div className="text-teal-600 dark:text-teal-400 font-mono text-[11px]">ABHA: {abhaId}</div>}
                  </div>
                  <button onClick={() => setCurrentStep(1)} className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>

                {/* Block 3 */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">3. Address & Location</span>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                      {village}, {wardOrBlock ? `${wardOrBlock}, ` : ''}{district}, {stateName} {pincode ? `- ${pincode}` : ''}
                    </div>
                  </div>
                  <button onClick={() => setCurrentStep(3)} className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>

                {/* Block 4 & 5 */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">4. Medical History & 5. Current Health</span>
                    <div className="text-slate-800 dark:text-slate-200 mt-0.5">
                      <strong>Conditions:</strong> {chronicConditions.join(', ') || 'None Known'}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                      <strong>Allergies:</strong> {allergies.join(', ') || 'NKDA'}
                    </div>
                    {currentMedications && (
                      <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                        <strong>Daily Meds:</strong> {currentMedications}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setCurrentStep(4)} className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>

                {/* Block 7 & 8 */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">7. Consent & 8. Follow-up Plan</span>
                    <div className="text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Informed consent logged for {new Date(consentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                      Facility: <strong>{preferredFacility}</strong> · Re-screening in <strong>{followUpIntervalMonths} months</strong>
                    </div>
                  </div>
                  <button onClick={() => setCurrentStep(7)} className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>

              {/* Start Screening Prompt */}
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={startImmediately}
                    onChange={(e) => setStartImmediately(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-teal-300 focus:ring-teal-500"
                  />
                  <span className="font-semibold text-teal-950 dark:text-teal-200 text-xs">
                    Launch Physiological Vital Signs Screening Form immediately after registration
                  </span>
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            {currentStep < 9 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Patient...' : 'Save & Register Patient'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

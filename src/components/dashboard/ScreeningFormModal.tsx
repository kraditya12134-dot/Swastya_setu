import React, { useState, useEffect, useId } from 'react';
import { 
  X, 
  HeartPulse, 
  Activity, 
  Thermometer, 
  Scale, 
  Ruler, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  FileText, 
  Building2,
  Clock,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { Patient, Screening, Referral, Vitals, Questionnaire, UserRole } from '../../types';
import { calculateBmi, classifyBloodPressure, evaluateScreeningRisk } from '../../utils/clinicalCalculations';
import { storage } from '../../services/storage';

interface ScreeningFormModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onScreeningSaved?: (screening: Screening, patient: Patient) => void;
}

export const ScreeningFormModal: React.FC<ScreeningFormModalProps> = ({
  isOpen,
  patient,
  onClose,
  onScreeningSaved,
}) => {
  const { language, user, role, refreshData, setPrintableReport } = useApp();
  const t = translations[language];

  // Unique accessible IDs for inputs
  const hrId = useId();
  const spo2Id = useId();
  const tempId = useId();
  const systolicId = useId();
  const diastolicId = useId();
  const heightId = useId();
  const weightId = useId();

  // Vitals State - Defaulting to 0 (Unrecorded) per frontline screening guidelines
  const [heartRate, setHeartRate] = useState<number | ''>(0);
  const [spo2, setSpo2] = useState<number | ''>(0);
  const [temperature, setTemperature] = useState<number | ''>(0);
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [systolic, setSystolic] = useState<number | ''>(0);
  const [diastolic, setDiastolic] = useState<number | ''>(0);
  const [height, setHeight] = useState<number | ''>(0);
  const [weight, setWeight] = useState<number | ''>(0);

  // Questionnaire State
  const [chestPain, setChestPain] = useState(false);
  const [shortnessOfBreath, setShortnessOfBreath] = useState(false);
  const [dizziness, setDizziness] = useState(false);
  const [feverDuration, setFeverDuration] = useState<'none' | '1-2 days' | '3+ days'>('none');
  const [coughDuration, setCoughDuration] = useState<'none' | '1-2 weeks' | '2+ weeks'>('none');
  const [diabetesHistory, setDiabetesHistory] = useState(false);
  const [hypertensionHistory, setHypertensionHistory] = useState(false);
  const [tobaccoUse, setTobaccoUse] = useState(false);
  const [alcoholUse, setAlcoholUse] = useState(false);
  const [currentMedications, setCurrentMedications] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Simulation tag
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulationNote, setSimulationNote] = useState('');

  // Referral creation state
  const [createReferral, setCreateReferral] = useState(false);
  const [destinationFacility, setDestinationFacility] = useState('Rampur Primary Health Centre (PHC)');
  const [referralUrgency, setReferralUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [referralReason, setReferralReason] = useState('');

  // Informed Consent state
  const [consentObtained, setConsentObtained] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Auto-fill existing chronic history if patient has it
  useEffect(() => {
    if (patient) {
      const conds = (patient.chronicConditions || []).join(' ').toLowerCase();
      if (conds.includes('hyper') || conds.includes('bp')) setHypertensionHistory(true);
      if (conds.includes('diabet')) setDiabetesHistory(true);
      if (conds.includes('tobacco') || conds.includes('smok')) setTobaccoUse(true);
    }
  }, [patient]);

  // Real-time BMI
  const numHeight = Number(height) || 0;
  const numWeight = Number(weight) || 0;
  const bmiResult = calculateBmi(numHeight, numWeight);

  // Real-time BP
  const numSystolic = Number(systolic) || 0;
  const numDiastolic = Number(diastolic) || 0;
  const bpResult = numSystolic > 0 && numDiastolic > 0 ? classifyBloodPressure(numSystolic, numDiastolic) : null;

  // Real-time Risk Stratification
  const currentVitals: Vitals = {
    heartRate: Number(heartRate) || 0,
    spo2: Number(spo2) || 0,
    temperature: Number(temperature) || 0,
    tempUnit,
    systolic: numSystolic,
    diastolic: numDiastolic,
    height: numHeight,
    weight: numWeight,
    bmi: bmiResult?.bmi,
    bmiCategory: bmiResult?.category,
    bpClassification: bpResult?.category,
  };

  const currentQuestionnaire: Questionnaire = {
    chestPain,
    shortnessOfBreath,
    dizziness,
    feverDuration,
    coughDuration,
    diabetesHistory,
    hypertensionHistory,
    tobaccoUse,
    alcoholUse,
    currentMedications,
    notes: clinicalNotes,
  };

  const riskEvaluation = evaluateScreeningRisk(currentVitals, currentQuestionnaire);

  // Auto-select referral if risk changes to moderate or high (must be called unconditionally before any early return)
  useEffect(() => {
    if (isOpen && patient && riskEvaluation.riskLevel !== 'low') {
      setCreateReferral(true);
      setReferralUrgency(riskEvaluation.referralUrgency);
      setReferralReason(riskEvaluation.riskFactors.join('; '));
    }
  }, [isOpen, patient, riskEvaluation.riskLevel, riskEvaluation.riskFactors.length, riskEvaluation.referralUrgency]);

  if (!isOpen || !patient) return null;

  // Preset Sensor Simulation Functions (with clear labels)
  const applySensorSimulation = (type: 'normal' | 'borderline' | 'high_risk') => {
    setIsSimulated(true);
    if (type === 'normal') {
      setHeartRate(72);
      setSpo2(99);
      setTemperature(98.4);
      setTempUnit('F');
      setSystolic(118);
      setDiastolic(76);
      setHeight(160);
      setWeight(58);
      setChestPain(false);
      setShortnessOfBreath(false);
      setSimulationNote('Simulated nominal vital signs kit reading.');
    } else if (type === 'borderline') {
      setHeartRate(86);
      setSpo2(95);
      setTemperature(99.2);
      setTempUnit('F');
      setSystolic(138);
      setDiastolic(88);
      setHeight(168);
      setWeight(82);
      setShortnessOfBreath(false);
      setSimulationNote('Simulated borderline pre-hypertension and elevated BMI telemetry.');
    } else {
      setHeartRate(114);
      setSpo2(91);
      setTemperature(101.4);
      setTempUnit('F');
      setSystolic(168);
      setDiastolic(102);
      setHeight(165);
      setWeight(70);
      setShortnessOfBreath(true);
      setChestPain(false);
      setSimulationNote('Simulated urgent triage packet: severe HTN + low SpO2 + febrile.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSaveError(null);
    setSaveSuccessNotice(null);

    try {
      const screeningId = `SCR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      let generatedReferralId: string | undefined = undefined;

      // 1. Create Referral if checked
      if (createReferral) {
        generatedReferralId = `REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newReferral: Referral = {
          id: generatedReferralId,
          screeningId,
          patientId: patient.id,
          patientName: patient.name,
          patientAge: patient.age,
          patientGender: patient.gender,
          patientVillage: patient.village,
          referredBy: `${user.name} (${user.role.toUpperCase()})`,
          referredAt: new Date().toISOString(),
          destinationFacility,
          urgency: referralUrgency,
          reason: referralReason || riskEvaluation.riskFactors.join('; ') || 'Routine clinical review',
          status: 'pending',
        };
        await storage.saveReferral(newReferral);
      }

      // 2. Create Screening record
      const newScreening: Screening = {
        id: screeningId,
        patientId: patient.id,
        screenerId: user.id,
        screenerName: user.name,
        screenerRole: role,
        createdAt: new Date().toISOString(),
        facility: user.centerName,
        vitals: currentVitals,
        questionnaire: currentQuestionnaire,
        consentObtained,
        isSimulated,
        simulationDetails: isSimulated ? simulationNote : undefined,
        riskLevel: riskEvaluation.riskLevel,
        riskFactors: riskEvaluation.riskFactors,
        recommendations: riskEvaluation.recommendations,
        referralId: generatedReferralId,
      };

      await storage.saveScreening(newScreening, user.role, user.name);
      await refreshData();

      const isCloud = storage.getSupabaseConfig().isConnected;
      const notice = isCloud
        ? 'Screening record successfully saved & synced to Supabase database.'
        : 'Screening record saved to local demo storage (Supabase not configured).';
      setSaveSuccessNotice(notice);

      setTimeout(() => {
        if (onScreeningSaved) {
          onScreeningSaved(newScreening, patient);
        }
        // Automatically launch printable report modal preview
        setPrintableReport({ screening: newScreening, patient });
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to save screening:', err);
      setSaveError(err.message || 'Failed to save screening. Please check inputs and retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh] transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  {t.screeningTitle}
                </h3>
                {isSimulated && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold tracking-wider">
                    DEMO / SIMULATED SENSOR READINGS
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {patient.name} · {patient.age}y / {patient.gender} · {patient.village} {patient.abhaId ? `· ABHA: ${patient.abhaId}` : ''}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          
          {saveSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 font-semibold animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-2.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}
          
          {/* INFORMED CONSENT VERIFICATION STRIP */}
          <div className="p-3.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="consent-check"
              checked={consentObtained}
              onChange={(e) => setConsentObtained(e.target.checked)}
              className="rounded border-teal-300 text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5 shrink-0"
              required
            />
            <label htmlFor="consent-check" className="text-slate-800 dark:text-slate-200 leading-snug cursor-pointer font-medium">
              <strong className="text-teal-900 dark:text-teal-300">Informed Consent:</strong> {t.consentCheck}
            </label>
          </div>

          {/* SIMULATED SENSOR CONTROLS STRIP */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  {t.simulateSensors}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ({t.simulateSensorsHelp})
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => applySensorSimulation('normal')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer"
                >
                  Normal Sample
                </button>
                <button
                  type="button"
                  onClick={() => applySensorSimulation('borderline')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
                >
                  Pre-HTN Sample
                </button>
                <button
                  type="button"
                  onClick={() => applySensorSimulation('high_risk')}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-rose-700 dark:text-rose-400 transition-colors cursor-pointer"
                >
                  Urgent Risk Sample
                </button>
              </div>
            </div>

            {isSimulated && (
              <div className="text-[11px] text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>DEMO / SIMULATED READINGS: {t.simulatedNotice}</span>
              </div>
            )}
          </div>

          {/* SECTION 1: VITALS CAPTURE */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>1. Physiological Measurements & Calculated Indicators</span>
              </h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">
                Default: 0 (Unrecorded) · No false clinical triage on 0
              </span>
            </div>

            {/* Zero-default guidance notice */}
            <div className="p-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                <strong>Zero-Defaults Policy:</strong> Fields start at 0 (Unrecorded). 0 is treated strictly as missing data and will never calculate BMI, classify blood pressure, or trigger emergency triage.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Heart Rate */}
              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={hrId} className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {t.heartRate} (BPM)
                  </label>
                  {Number(heartRate) === 0 ? (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      Unrecorded
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.2 rounded">
                      Recorded
                    </span>
                  )}
                </div>
                <input
                  id={hrId}
                  type="number"
                  min="0"
                  max="240"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {Number(heartRate) === 0 ? 'Not measured (0 BPM)' : 'Nominal: 60–100 BPM'}
                </span>
              </div>

              {/* SpO2 */}
              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={spo2Id} className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {t.spo2} (%)
                  </label>
                  {Number(spo2) === 0 ? (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      Unrecorded
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.2 rounded">
                      Recorded
                    </span>
                  )}
                </div>
                <input
                  id={spo2Id}
                  type="number"
                  min="0"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {Number(spo2) === 0 ? 'Not measured (0 %)' : 'Target: ≥ 95%'}
                </span>
              </div>

              {/* Temperature */}
              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={tempId} className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {t.temperature}
                  </label>
                  <div className="flex items-center gap-1">
                    {Number(temperature) === 0 && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        0°
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setTempUnit(tempUnit === 'F' ? 'C' : 'F')}
                      className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      °{tempUnit}
                    </button>
                  </div>
                </div>
                <input
                  id={tempId}
                  type="number"
                  min="0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {Number(temperature) === 0 ? 'Not measured (0°)' : 'Normal: 97.5–99.0°F'}
                </span>
              </div>

              {/* Blood Pressure Systolic / Diastolic */}
              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {t.bloodPressure} (mmHg)
                  </span>
                  {(numSystolic === 0 || numDiastolic === 0) && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      Unrecorded
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    id={systolicId}
                    aria-label="Systolic BP"
                    type="number"
                    min="0"
                    max="260"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Sys"
                    className="w-1/2 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 font-mono text-center"
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    id={diastolicId}
                    aria-label="Diastolic BP"
                    type="number"
                    min="0"
                    max="180"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Dia"
                    className="w-1/2 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 font-mono text-center"
                  />
                </div>
                <div className="text-[10px] truncate text-slate-500 dark:text-slate-400 font-medium">
                  {numSystolic > 0 && numDiastolic > 0 && bpResult ? (
                    <span className={bpResult.isHypertensive ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-700 dark:text-emerald-400'}>
                      {bpResult.category}
                    </span>
                  ) : (
                    'Unrecorded (0/0 mmHg)'
                  )}
                </div>
              </div>
            </div>

            {/* Height, Weight & Calculated BMI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={heightId} className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {t.height} (cm)
                  </label>
                  {numHeight === 0 && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      Unrecorded
                    </span>
                  )}
                </div>
                <input
                  id={heightId}
                  type="number"
                  min="0"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {numHeight === 0 ? 'Not measured (0 cm)' : `${numHeight} cm`}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor={weightId} className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {t.weight} (kg)
                  </label>
                  {numWeight === 0 && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      Unrecorded
                    </span>
                  )}
                </div>
                <input
                  id={weightId}
                  type="number"
                  min="0"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {numWeight === 0 ? 'Not measured (0 kg)' : `${numWeight} kg`}
                </span>
              </div>

              {/* BMI Card */}
              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                bmiResult ? bmiResult.colorClass : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span>{t.bmi}</span>
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono tabular-nums">
                    {bmiResult ? bmiResult.bmi : '--'}
                  </span>
                  <span className="text-[11px] font-semibold">
                    {bmiResult ? (language === 'en' ? bmiResult.category : bmiResult.categoryHi) : 'Unrecorded (Requires height & weight > 0)'}
                  </span>
                </div>
                <span className="text-[10px] opacity-80">
                  {bmiResult ? 'Formula: kg / m² (WHO Asian-Indian standard)' : 'Enter both measurements > 0 to calculate'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: CLINICAL SYMPTOM & RISK QUESTIONNAIRE */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>2. {t.questionnaireTitle}</span>
            </h4>

            {/* Checkbox Symptoms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
                chestPain ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={chestPain}
                  onChange={(e) => setChestPain(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 mt-0.5"
                />
                <span className="leading-tight">{t.symptomChestPain}</span>
              </label>

              <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
                shortnessOfBreath ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={shortnessOfBreath}
                  onChange={(e) => setShortnessOfBreath(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 mt-0.5"
                />
                <span className="leading-tight">{t.symptomShortnessOfBreath}</span>
              </label>

              <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
                dizziness ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={dizziness}
                  onChange={(e) => setDizziness(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 mt-0.5"
                />
                <span className="leading-tight">{t.symptomDizziness}</span>
              </label>

              <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
                diabetesHistory ? 'bg-teal-50 border-teal-300 text-teal-950 font-medium' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={diabetesHistory}
                  onChange={(e) => setDiabetesHistory(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                />
                <span className="leading-tight">{t.diabetesHistory}</span>
              </label>

              <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
                hypertensionHistory ? 'bg-teal-50 border-teal-300 text-teal-950 font-medium' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={hypertensionHistory}
                  onChange={(e) => setHypertensionHistory(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                />
                <span className="leading-tight">{t.hypertensionHistory}</span>
              </label>

              <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-colors ${
                tobaccoUse ? 'bg-amber-50 border-amber-300 text-amber-950 font-medium' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={tobaccoUse}
                  onChange={(e) => setTobaccoUse(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 mt-0.5"
                />
                <span className="leading-tight">{t.tobaccoUse}</span>
              </label>
            </div>

            {/* Dropdown Durations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  {t.coughDuration}
                </label>
                <select
                  value={coughDuration}
                  onChange={(e) => setCoughDuration(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="none">No Cough / सामान्य</option>
                  <option value="1-2 weeks">1 to 2 Weeks</option>
                  <option value="2+ weeks">More than 2 Weeks (TB Protocol Flag)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  {t.feverDuration}
                </label>
                <select
                  value={feverDuration}
                  onChange={(e) => setFeverDuration(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="none">No Fever / सामान्य</option>
                  <option value="1-2 days">1 to 2 Days</option>
                  <option value="3+ days">3 or More Days</option>
                </select>
              </div>
            </div>

            {/* Clinical Observations */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                {t.currentMeds} & Observations
              </label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
          </div>

          {/* SECTION 3: REAL-TIME RISK STRATIFICATION CARD */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            riskEvaluation.riskLevel === 'high'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : riskEvaluation.riskLevel === 'moderate'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${
                  riskEvaluation.riskLevel === 'high'
                    ? 'text-rose-600'
                    : riskEvaluation.riskLevel === 'moderate'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`} />
                <div>
                  <h4 className="font-bold text-sm">
                    {riskEvaluation.riskLevel === 'high' && (language === 'en' ? t.riskHigh : 'उच्च जोखिम (High Risk)')}
                    {riskEvaluation.riskLevel === 'moderate' && (language === 'en' ? t.riskModerate : 'मध्यम जोखिम (Moderate Risk)')}
                    {riskEvaluation.riskLevel === 'low' && (language === 'en' ? t.riskLow : 'सामान्य जोखिम (Low Risk)')}
                  </h4>
                  <p className="text-[11px] opacity-80">
                    {language === 'en' ? 'Automated screening rule engine evaluation' : 'स्क्रीनिंग नियमों पर आधारित त्वरित मूल्यांकन'}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                riskEvaluation.riskLevel === 'high'
                  ? 'bg-rose-200 text-rose-900'
                  : riskEvaluation.riskLevel === 'moderate'
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-emerald-200 text-emerald-900'
              }`}>
                {riskEvaluation.riskLevel}
              </span>
            </div>

            {/* Risk factors bullet list */}
            {riskEvaluation.riskFactors.length > 0 && (
              <div className="space-y-1 text-xs pt-1 border-t border-black/10">
                <div className="font-semibold">{t.riskFactorsIdentified}:</div>
                <ul className="list-disc list-inside space-y-0.5 opacity-90 pl-1">
                  {(language === 'en' ? riskEvaluation.riskFactors : riskEvaluation.riskFactorsHi).map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-1 text-xs pt-1 border-t border-black/10">
              <div className="font-semibold">{t.clinicalRecommendations}:</div>
              <ul className="list-disc list-inside space-y-0.5 opacity-90 pl-1">
                {(language === 'en' ? riskEvaluation.recommendations : riskEvaluation.recommendationsHi).map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 4: REFERRAL OPTION */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createReferral}
                onChange={(e) => setCreateReferral(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="font-bold text-slate-900 text-xs">
                {t.createReferralCheckbox}
              </span>
            </label>

            {createReferral && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    {t.referralCenter}
                  </label>
                  <select
                    value={destinationFacility}
                    onChange={(e) => setDestinationFacility(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Rampur Primary Health Centre (PHC)">Rampur Primary Health Centre (PHC)</option>
                    <option value="Bilaspur Community Health Centre (CHC)">Bilaspur Community Health Centre (CHC)</option>
                    <option value="District Civil Hospital Hoshangabad">District Civil Hospital Hoshangabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    {t.referralUrgency}
                  </label>
                  <select
                    value={referralUrgency}
                    onChange={(e) => setReferralUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="routine">{t.urgencyRoutine}</option>
                    <option value="urgent">{t.urgencyUrgent}</option>
                    <option value="emergency">{t.urgencyEmergency}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Reason for Clinical Escalation
                  </label>
                  <input
                    type="text"
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    placeholder="e.g. Stage 2 HTN with morning headache and non-compliance"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Screener: <span className="font-semibold text-slate-700">{user.name}</span> ({role.toUpperCase()})
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : t.saveScreening}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

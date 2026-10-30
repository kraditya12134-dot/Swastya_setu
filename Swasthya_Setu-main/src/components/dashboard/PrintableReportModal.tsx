import React from 'react';
import { Printer, X, Download, ShieldCheck, HeartPulse, Activity } from 'lucide-react';
import { Screening, Patient } from '../../types';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';

interface PrintableReportModalProps {
  data: { screening: Screening; patient: Patient } | null;
  onClose: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({ data, onClose }) => {
  const { language } = useApp();
  const t = translations[language];

  if (!data) return null;
  const { screening, patient } = data;
  const { vitals, questionnaire } = screening;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="printable-report-card bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:my-0 print:rounded-none">
        
        {/* Action Toolbar (Hidden in Print) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-sm">
              {language === 'en' ? 'Clinical Screening Summary Report' : 'डिजिटल स्वास्थ्य स्क्रीनिंग रिपोर्ट'}
            </span>
            <span className="text-xs text-slate-400 font-mono">#{screening.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Print / Save PDF' : 'प्रिंट या पीडीएफ सहेजें'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto text-slate-900 font-sans space-y-6 text-xs bg-white">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950 uppercase">
                  Swasthya Setu
                </span>
                <span className="text-base font-semibold text-teal-700">
                  (स्वास्थ्य सेतु)
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                Community Health Screening & Clinical Triage Support Platform
              </p>
              <p className="text-[10px] text-slate-500">
                Facility: <span className="font-semibold text-slate-800">{screening.facility}</span>
              </p>
            </div>

            <div className="text-right space-y-0.5 font-mono text-[11px]">
              <div>Report ID: <span className="font-bold">{screening.id}</span></div>
              <div>Date: <span className="font-medium">{new Date(screening.createdAt).toLocaleDateString()}</span></div>
              <div>Time: <span className="font-medium">{new Date(screening.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
              <div>Screener: <span className="font-semibold">{screening.screenerName}</span></div>
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
              Patient Identification
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Age / Gender</span>
                <span className="font-semibold text-slate-800">{patient.age} Years / {patient.gender.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ABHA / Health ID</span>
                <span className="font-mono font-medium text-slate-800">{patient.abhaId || 'Not Linked'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Village & District</span>
                <span className="font-medium text-slate-800">{patient.village}, {patient.district}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Primary Phone</span>
                <span className="font-mono text-slate-800">{patient.contact}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Consent Protocol</span>
                <span className="text-emerald-700 font-semibold">✓ Confirmed & Logged</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-[10px] block">Emergency Contact</span>
                <span className="text-slate-800">{patient.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Vitals Signs Grid */}
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Physiological Screening Vitals</span>
              {screening.isSimulated && (
                <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2.5 py-1 rounded border border-amber-400 font-bold tracking-wider">
                  DEMO / SIMULATED READINGS (NOT REAL TELEMETRY)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono">
              {/* Heart Rate */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Heart Rate</div>
                {vitals.heartRate > 0 ? (
                  <>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{vitals.heartRate}</div>
                    <div className="text-[10px] text-slate-400">BPM</div>
                  </>
                ) : (
                  <div className="text-xs font-semibold text-slate-500 mt-1 italic font-sans">Not recorded</div>
                )}
              </div>

              {/* SpO2 */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">SpO2</div>
                {vitals.spo2 > 0 ? (
                  <>
                    <div className={`text-base font-bold tabular-nums ${vitals.spo2 < 92 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {vitals.spo2}%
                    </div>
                    <div className="text-[10px] text-slate-400">Saturation</div>
                  </>
                ) : (
                  <div className="text-xs font-semibold text-slate-500 mt-1 italic font-sans">Not recorded</div>
                )}
              </div>

              {/* Temperature */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Temperature</div>
                {vitals.temperature > 0 ? (
                  <>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{vitals.temperature}°{vitals.tempUnit}</div>
                    <div className="text-[10px] text-slate-400">Body Temp</div>
                  </>
                ) : (
                  <div className="text-xs font-semibold text-slate-500 mt-1 italic font-sans">Not recorded</div>
                )}
              </div>

              {/* Blood Pressure */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Blood Pressure</div>
                {vitals.systolic > 0 && vitals.diastolic > 0 ? (
                  <>
                    <div className={`text-base font-bold tabular-nums ${vitals.systolic >= 140 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {vitals.systolic}/{vitals.diastolic}
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans truncate">{vitals.bpClassification || 'mmHg'}</div>
                  </>
                ) : (
                  <div className="text-xs font-semibold text-slate-500 mt-1 italic font-sans">Not recorded</div>
                )}
              </div>

              {/* Height / Weight */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Height / Weight</div>
                {vitals.height > 0 || vitals.weight > 0 ? (
                  <>
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {vitals.height > 0 ? `${vitals.height}cm` : 'No Ht'} / {vitals.weight > 0 ? `${vitals.weight}kg` : 'No Wt'}
                    </div>
                    <div className="text-[10px] text-slate-400">Physical</div>
                  </>
                ) : (
                  <div className="text-xs font-semibold text-slate-500 mt-1 italic font-sans">Not recorded</div>
                )}
              </div>

              {/* Calculated BMI */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Calculated BMI</div>
                {vitals.bmi ? (
                  <>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{vitals.bmi}</div>
                    <div className="text-[10px] text-slate-500 font-sans truncate">{vitals.bmiCategory}</div>
                  </>
                ) : (
                  <div className="text-xs font-semibold text-slate-500 mt-1 italic font-sans">Not recorded</div>
                )}
              </div>
            </div>
          </div>

          {/* Questionnaire & Chronic Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-3 space-y-1">
              <span className="font-bold text-slate-700 block text-[11px]">Symptom Questionnaire Findings:</span>
              <ul className="space-y-0.5 text-slate-600 text-[11px] list-disc list-inside">
                <li>Chest pain in last 48h: <span className="font-semibold text-slate-900">{questionnaire.chestPain ? 'YES (FLAGGED)' : 'No'}</span></li>
                <li>Shortness of breath: <span className="font-semibold text-slate-900">{questionnaire.shortnessOfBreath ? 'YES (FLAGGED)' : 'No'}</span></li>
                <li>Dizziness / Fainting: <span className="font-semibold text-slate-900">{questionnaire.dizziness ? 'YES' : 'No'}</span></li>
                <li>Cough duration: <span className="font-semibold text-slate-900">{questionnaire.coughDuration}</span></li>
                <li>Fever duration: <span className="font-semibold text-slate-900">{questionnaire.feverDuration}</span></li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 space-y-1">
              <span className="font-bold text-slate-700 block text-[11px]">Pre-existing Risk History:</span>
              <ul className="space-y-0.5 text-slate-600 text-[11px] list-disc list-inside">
                <li>Diabetes history: <span className="font-semibold text-slate-900">{questionnaire.diabetesHistory ? 'Diagnosed' : 'None reported'}</span></li>
                <li>Hypertension history: <span className="font-semibold text-slate-900">{questionnaire.hypertensionHistory ? 'Diagnosed' : 'None reported'}</span></li>
                <li>Tobacco consumption: <span className="font-semibold text-slate-900">{questionnaire.tobaccoUse ? 'Active' : 'No'}</span></li>
                <li>Medications / Notes: <span className="font-semibold text-slate-900">{questionnaire.notes || 'None noted'}</span></li>
              </ul>
            </div>
          </div>

          {/* Triage Stratification Box */}
          <div className={`p-4 rounded-lg border text-xs space-y-2 ${
            screening.riskLevel === 'high'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : screening.riskLevel === 'moderate'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-xs">
                Triage Risk Classification: {screening.riskLevel.toUpperCase()} RISK
              </span>
              {screening.referralId && (
                <span className="font-mono font-bold text-[11px]">
                  Referral Linked: #{screening.referralId}
                </span>
              )}
            </div>

            {screening.riskFactors.length > 0 && (
              <div>
                <span className="font-semibold">Risk Flags Identified:</span>
                <ul className="list-disc list-inside pl-1 text-[11px] opacity-90">
                  {screening.riskFactors.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <span className="font-semibold">Clinical Action Recommendations:</span>
              <ul className="list-disc list-inside pl-1 text-[11px] opacity-90">
                {screening.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Medical Responsibility Disclaimer */}
          <div className="bg-slate-100 border border-slate-200 rounded p-2.5 text-[9px] text-slate-600 leading-tight">
            <strong>NOTICE & CLINICAL DISCLAIMER:</strong> Swasthya Setu is a frontline screening decision-support prototype, not a certified diagnostic device. This summary provides preliminary triage stratification. Definitive diagnoses and therapeutic decisions require formal clinical evaluation by a licensed physician using verified, calibrated medical instruments.
          </div>

          {/* Stamp & Signature Section */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs border-t border-slate-300">
            <div className="text-center space-y-8">
              <div className="text-slate-400 italic">Verified at Community Health Camp</div>
              <div className="border-t border-slate-400 pt-1">
                <div className="font-semibold text-slate-900">{screening.screenerName}</div>
                <div className="text-[10px] text-slate-500">Community Health Screener Signature / Date</div>
              </div>
            </div>

            <div className="text-center space-y-8">
              <div className="text-slate-400 italic">Medical Officer Review & Stamp</div>
              <div className="border-t border-slate-400 pt-1">
                <div className="font-semibold text-slate-900">Dr. _______________________</div>
                <div className="text-[10px] text-slate-500">Examining Medical Officer Signature / Reg. No.</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

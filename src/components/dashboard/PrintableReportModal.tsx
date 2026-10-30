import React from 'react';
import { Printer, X, ShieldCheck, HeartPulse, AlertTriangle, CheckCircle2, FileText, Stethoscope } from 'lucide-react';
import { Screening, Patient, Referral } from '../../types';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';

interface PrintableReportModalProps {
  data: { screening: Screening; patient: Patient } | null;
  onClose: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({ data, onClose }) => {
  const { language, referrals } = useApp();
  const t = translations[language];

  if (!data) return null;
  const { screening, patient } = data;
  const { vitals, questionnaire } = screening;

  // Find linked referral if any
  const linkedReferral: Referral | undefined = referrals.find(
    (r) => r.screeningId === screening.id || (screening.referralId && r.id === screening.referralId)
  );

  const handlePrint = () => {
    window.print();
  };

  // Measurement validations to exclude missing/zero readings
  const hasValidHR = vitals.heartRate > 0;
  const hasValidSpO2 = vitals.spo2 > 0;
  const hasValidTemp = vitals.temperature > 0;
  const hasValidBP = vitals.systolic > 0 && vitals.diastolic > 0;
  const hasValidHeight = vitals.height > 0;
  const hasValidWeight = vitals.weight > 0;
  const hasValidBMI = Boolean(vitals.bmi && vitals.bmi > 0 && hasValidHeight && hasValidWeight);

  return (
    <div className="printable-report-modal-wrapper fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="printable-report-card bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden my-4 flex flex-col max-h-[95vh]">
        
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
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Print standard A4 medical report"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'en' ? 'Print / Save PDF' : 'प्रिंट या पीडीएफ सहेजें'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close report modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto text-slate-900 font-sans space-y-5 text-xs bg-white">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
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
                Frontline Community Healthcare Screening & Clinical Decision Support System
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Facility: <span className="font-semibold text-slate-800">{screening.facility || 'Community Health Centre'}</span>
              </p>
            </div>

            <div className="text-right space-y-0.5 font-mono text-[11px]">
              <div>Report ID: <span className="font-bold">{screening.id}</span></div>
              <div>Date: <span className="font-medium">{new Date(screening.createdAt).toLocaleDateString()}</span></div>
              <div>Time: <span className="font-medium">{new Date(screening.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
              <div>Screener: <span className="font-semibold">{screening.screenerName} ({screening.screenerRole.toUpperCase()})</span></div>
            </div>
          </div>

          {/* SIMULATED READINGS NOTICE (Clearly labeled as non-diagnostic) */}
          {screening.isSimulated && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-amber-950 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
                    DEMO / SIMULATED READINGS:
                  </span>{' '}
                  <span className="text-[11px]">
                    {screening.simulationDetails || 'This report incorporates simulated sensor telemetry generated for field demonstration and training purposes.'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold uppercase shrink-0">
                Non-Diagnostic
              </span>
            </div>
          )}

          {/* Patient Identification Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Patient Identification & Demographics</span>
              <span className="font-mono text-[10px] font-semibold text-slate-700">Ref: {patient.id}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Full Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">
                  {patient.name} {patient.nameHi ? `(${patient.nameHi})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Age & Gender</span>
                <span className="font-semibold text-slate-800">{patient.age} Years · {patient.gender.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ABHA / Health ID</span>
                <span className="font-mono font-medium text-slate-800">{patient.abhaId || 'Not Linked / Pending'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Village & District</span>
                <span className="font-medium text-slate-800">{patient.village}, {patient.district}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Primary Contact Phone</span>
                <span className="font-mono text-slate-800">{patient.contact}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Emergency Contact</span>
                <span className="text-slate-800">{patient.emergencyContact}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Informed Consent</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Recorded ({patient.consentDate ? new Date(patient.consentDate).toLocaleDateString() : 'Yes'})</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Registered By</span>
                <span className="text-slate-700">{patient.registeredBy || screening.screenerName}</span>
              </div>
            </div>
          </div>

          {/* Vitals Signs Grid (Excluding default zero values) */}
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Physiological Screening Vitals</span>
              <span className="text-[10px] text-slate-500">Non-invasive measurements</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center font-mono">
              {/* Heart Rate */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Heart Rate</div>
                {hasValidHR ? (
                  <>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{vitals.heartRate}</div>
                    <div className="text-[10px] text-slate-400">BPM</div>
                  </>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-400 mt-2 italic font-sans">Unrecorded</div>
                )}
              </div>

              {/* SpO2 */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">SpO2 Oxygen</div>
                {hasValidSpO2 ? (
                  <>
                    <div className={`text-base font-bold tabular-nums ${vitals.spo2 < 92 ? 'text-rose-600 font-black' : 'text-slate-900'}`}>
                      {vitals.spo2}%
                    </div>
                    <div className="text-[10px] text-slate-400">Saturation</div>
                  </>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-400 mt-2 italic font-sans">Unrecorded</div>
                )}
              </div>

              {/* Body Temperature */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Temperature</div>
                {hasValidTemp ? (
                  <>
                    <div className="text-base font-bold text-slate-900 tabular-nums">
                      {vitals.temperature}°{vitals.tempUnit || 'F'}
                    </div>
                    <div className="text-[10px] text-slate-400">Body Temp</div>
                  </>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-400 mt-2 italic font-sans">Unrecorded</div>
                )}
              </div>

              {/* Blood Pressure */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Blood Pressure</div>
                {hasValidBP ? (
                  <>
                    <div className={`text-base font-bold tabular-nums ${vitals.systolic >= 140 ? 'text-rose-600 font-black' : 'text-slate-900'}`}>
                      {vitals.systolic}/{vitals.diastolic}
                    </div>
                    <div className="text-[10px] text-slate-600 font-sans truncate">{vitals.bpClassification || 'mmHg'}</div>
                  </>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-400 mt-2 italic font-sans">Unrecorded</div>
                )}
              </div>

              {/* Height / Weight */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Height / Weight</div>
                {hasValidHeight || hasValidWeight ? (
                  <>
                    <div className="text-xs font-bold text-slate-900 tabular-nums pt-1">
                      {hasValidHeight ? `${vitals.height} cm` : 'Unrecorded'}
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 tabular-nums">
                      {hasValidWeight ? `${vitals.weight} kg` : 'Unrecorded'}
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-400 mt-2 italic font-sans">Unrecorded</div>
                )}
              </div>

              {/* Calculated BMI */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                <div className="text-[10px] text-slate-500 font-sans">Calculated BMI</div>
                {hasValidBMI ? (
                  <>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{vitals.bmi}</div>
                    <div className="text-[10px] text-slate-600 font-sans truncate">{vitals.bmiCategory}</div>
                  </>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-400 mt-2 italic font-sans">Unrecorded</div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Questionnaire & Pre-existing Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-3 space-y-1.5">
              <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                <span>Symptom Screening Findings:</span>
              </span>
              <ul className="space-y-0.5 text-slate-600 text-[11px] list-disc list-inside">
                <li>Chest pain (past 48h): <span className={`font-semibold ${questionnaire.chestPain ? 'text-rose-700 font-bold' : 'text-slate-900'}`}>{questionnaire.chestPain ? 'YES (FLAGGED)' : 'No'}</span></li>
                <li>Shortness of breath: <span className={`font-semibold ${questionnaire.shortnessOfBreath ? 'text-rose-700 font-bold' : 'text-slate-900'}`}>{questionnaire.shortnessOfBreath ? 'YES (FLAGGED)' : 'No'}</span></li>
                <li>Dizziness / Fainting: <span className="font-semibold text-slate-900">{questionnaire.dizziness ? 'YES' : 'No'}</span></li>
                <li>Cough duration: <span className="font-semibold text-slate-900">{questionnaire.coughDuration === 'none' ? 'None reported' : questionnaire.coughDuration}</span></li>
                <li>Fever duration: <span className="font-semibold text-slate-900">{questionnaire.feverDuration === 'none' ? 'None reported' : questionnaire.feverDuration}</span></li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 space-y-1.5">
              <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Medical History & Field Observations:</span>
              </span>
              <ul className="space-y-0.5 text-slate-600 text-[11px] list-disc list-inside">
                <li>Pre-existing Conditions: <span className="font-semibold text-slate-900">{patient.chronicConditions && patient.chronicConditions.length > 0 ? patient.chronicConditions.join(', ') : 'None reported'}</span></li>
                <li>Known Allergies: <span className="font-semibold text-slate-900">{patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None known'}</span></li>
                <li>Diabetes history: <span className="font-semibold text-slate-900">{questionnaire.diabetesHistory ? 'Diagnosed' : 'None reported'}</span></li>
                <li>Hypertension history: <span className="font-semibold text-slate-900">{questionnaire.hypertensionHistory ? 'Diagnosed' : 'None reported'}</span></li>
                <li>Tobacco / Bidi: <span className="font-semibold text-slate-900">{questionnaire.tobaccoUse ? 'Active consumer' : 'No'}</span></li>
              </ul>
              {questionnaire.notes && (
                <div className="pt-1 border-t border-slate-100 text-[11px]">
                  <span className="font-semibold text-slate-700">Staff Notes:</span>{' '}
                  <span className="text-slate-900 italic">{questionnaire.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Triage Stratification Box */}
          <div className={`p-3.5 rounded-lg border text-xs space-y-2 ${
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
                <span className="font-semibold">Identified Risk Flags:</span>
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

          {/* REFERRAL DETAILS (If referral exists) */}
          {linkedReferral && (
            <div className="border border-teal-200 bg-teal-50/60 rounded-lg p-3 space-y-1.5 text-xs text-teal-950">
              <div className="flex items-center justify-between font-bold border-b border-teal-200 pb-1">
                <span className="flex items-center gap-1.5 text-teal-900">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  <span>Clinical Tele-Referral Record (#{linkedReferral.id})</span>
                </span>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-300">
                  Priority: {linkedReferral.urgency.toUpperCase()} · Status: {linkedReferral.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-teal-800 font-semibold">Destination Facility:</span>{' '}
                  <span>{linkedReferral.destinationFacility}</span>
                </div>
                <div>
                  <span className="text-teal-800 font-semibold">Referred By:</span>{' '}
                  <span>{linkedReferral.referredBy} on {new Date(linkedReferral.referredAt).toLocaleDateString()}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-teal-800 font-semibold">Clinical Reason:</span>{' '}
                  <span>{linkedReferral.reason}</span>
                </div>
                {linkedReferral.clinicianNotes && (
                  <div className="sm:col-span-2 bg-white/80 p-2 rounded border border-teal-200">
                    <span className="text-teal-900 font-bold block">Medical Officer Consultation Directive:</span>
                    <p className="text-slate-800 mt-0.5">{linkedReferral.clinicianNotes}</p>
                    {linkedReferral.reviewedBy && (
                      <span className="text-[10px] text-teal-700 block mt-1">
                        Reviewed by: {linkedReferral.reviewedBy}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Responsibility Disclaimer */}
          <div className="bg-slate-100 border border-slate-200 rounded p-2.5 text-[9px] text-slate-600 leading-tight">
            <strong>NOTICE & CLINICAL DISCLAIMER:</strong> Swasthya Setu is a frontline screening decision-support prototype and does not replace autonomous medical diagnosis. Preliminary risk categories must be corroborated by a registered medical practitioner using certified, clinically validated equipment before starting or altering any therapeutic regimen.
          </div>

          {/* Stamp & Signature Section */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs border-t border-slate-300">
            <div className="text-center space-y-7">
              <div className="text-slate-500 italic text-[11px]">Screener Attestation</div>
              <div className="border-t border-slate-400 pt-1">
                <div className="font-semibold text-slate-900">{screening.screenerName}</div>
                <div className="text-[10px] text-slate-500">Community Health Screener Signature & Stamp</div>
              </div>
            </div>

            <div className="text-center space-y-7">
              <div className="text-slate-500 italic text-[11px]">Examining Medical Officer Review</div>
              <div className="border-t border-slate-400 pt-1">
                <div className="font-semibold text-slate-900">Dr. _______________________</div>
                <div className="text-[10px] text-slate-500">Medical Officer Signature / Reg. No. / Date</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

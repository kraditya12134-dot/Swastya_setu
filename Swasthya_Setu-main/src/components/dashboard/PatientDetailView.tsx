import React, { useState } from 'react';
import { 
  ArrowLeft, 
  HeartPulse, 
  Activity, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  GitBranch, 
  AlertTriangle,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Edit3,
  Check,
  X,
  Building,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { Patient } from '../../types';
import { storage } from '../../services/storage';

interface PatientDetailViewProps {
  patientId: string;
  onBack: () => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patientId, onBack }) => {
  const { 
    language, 
    patients, 
    screenings, 
    referrals, 
    startScreening, 
    setPrintableReport,
    user,
    role,
    refreshData
  } = useApp();

  const t = translations[language];

  const patient = patients.find((p) => p.id === patientId);
  const patientScreenings = screenings.filter((s) => s.patientId === patientId);
  const patientReferrals = referrals.filter((r) => r.patientId === patientId);

  // Editing state for authorized roles (CHW, Clinician, Admin)
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Editable Form Fields
  const [editName, setEditName] = useState(patient?.name || '');
  const [editNameHi, setEditNameHi] = useState(patient?.nameHi || '');
  const [editAge, setEditAge] = useState(patient?.age ? String(patient.age) : '');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other'>(patient?.gender || 'female');
  const [editAbhaId, setEditAbhaId] = useState(patient?.abhaId || '');
  const [editContact, setEditContact] = useState(patient?.contact || '');
  const [editEmergencyContact, setEditEmergencyContact] = useState(patient?.emergencyContact || '');
  const [editVillage, setEditVillage] = useState(patient?.village || '');
  const [editWard, setEditWard] = useState(patient?.wardOrBlock || '');
  const [editDistrict, setEditDistrict] = useState(patient?.district || '');
  const [editState, setEditState] = useState(patient?.state || '');
  const [editPincode, setEditPincode] = useState(patient?.pincode || '');
  const [editConditions, setEditConditions] = useState(patient?.chronicConditions?.join(', ') || '');
  const [editAllergies, setEditAllergies] = useState(patient?.allergies?.join(', ') || '');
  const [editMedications, setEditMedications] = useState(patient?.currentMedications || '');
  const [editPastSurgeries, setEditPastSurgeries] = useState(patient?.pastSurgeries || '');
  const [editPreferredFacility, setEditPreferredFacility] = useState(patient?.preferredFacility || '');
  const [editFollowUpMonths, setEditFollowUpMonths] = useState<number>(patient?.followUpIntervalMonths || 3);

  if (!patient) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Patient record not found.</div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditName(patient.name);
    setEditNameHi(patient.nameHi || '');
    setEditAge(String(patient.age));
    setEditGender(patient.gender);
    setEditAbhaId(patient.abhaId || '');
    setEditContact(patient.contact);
    setEditEmergencyContact(patient.emergencyContact);
    setEditVillage(patient.village);
    setEditWard(patient.wardOrBlock || '');
    setEditDistrict(patient.district);
    setEditState(patient.state || '');
    setEditPincode(patient.pincode || '');
    setEditConditions(patient.chronicConditions?.join(', ') || '');
    setEditAllergies(patient.allergies?.join(', ') || '');
    setEditMedications(patient.currentMedications || '');
    setEditPastSurgeries(patient.pastSurgeries || '');
    setEditPreferredFacility(patient.preferredFacility || 'Pipariya Community Health Centre (CHC)');
    setEditFollowUpMonths(patient.followUpIntervalMonths || 3);
    setIsEditing(true);
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const parsedAge = parseInt(editAge, 10);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        throw new Error('Please specify a valid age.');
      }
      if (!editName.trim()) {
        throw new Error('Patient name cannot be empty.');
      }

      const updated: Patient = {
        ...patient,
        name: editName.trim(),
        nameHi: editNameHi.trim() || undefined,
        age: parsedAge,
        gender: editGender,
        abhaId: editAbhaId.trim() || undefined,
        contact: editContact.trim(),
        emergencyContact: editEmergencyContact.trim(),
        village: editVillage.trim(),
        wardOrBlock: editWard.trim() || undefined,
        district: editDistrict.trim(),
        state: editState.trim() || undefined,
        pincode: editPincode.trim() || undefined,
        chronicConditions: editConditions.split(',').map((s) => s.trim()).filter(Boolean),
        allergies: editAllergies.split(',').map((s) => s.trim()).filter(Boolean),
        currentMedications: editMedications.trim() || undefined,
        pastSurgeries: editPastSurgeries.trim() || undefined,
        preferredFacility: editPreferredFacility.trim() || undefined,
        followUpIntervalMonths: editFollowUpMonths,
      };

      await storage.savePatient(updated, user.role, user.name);
      await refreshData();
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Patient Registry' : 'मरीज पंजिका पर लौटें'}</span>
        </button>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => startScreening(patient)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <HeartPulse className="w-4 h-4" />
            <span>{language === 'en' ? 'Conduct New Screening' : 'नई स्वास्थ्य जांच करें'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Patient record updated and synchronized to registry database.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {patient.name}
              </h2>
              {patient.nameHi && (
                <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                  ({patient.nameHi})
                </span>
              )}
              {patient.lastRiskStatus && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  patient.lastRiskStatus === 'high'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                    : patient.lastRiskStatus === 'moderate'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {patient.lastRiskStatus} Risk
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Patient ID: <strong>{patient.id}</strong> {patient.abhaId ? `· ABHA ID: ${patient.abhaId}` : ''}
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono sm:text-right">
            Registered: {new Date(patient.registeredAt).toLocaleDateString()}
            <div className="text-[11px] text-slate-500 dark:text-slate-400">By {patient.registeredBy}</div>
          </div>
        </div>
      </div>

      {/* 8 INFORMATION BLOCKS DIRECTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BLOCK 1: PERSONAL INFORMATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Block 1: Personal Information</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">DEMOGRAPHICS</span>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Full Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Hindi Name</span>
                <span className="text-slate-800 dark:text-slate-200">{patient.nameHi || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Age / Gender</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.age} Yrs / <span className="capitalize">{patient.gender}</span></span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">ABHA National ID</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-semibold">{patient.abhaId || 'Not Linked'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Hindi Name</label>
                <input
                  type="text"
                  value={editNameHi}
                  onChange={(e) => setEditNameHi(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Age</label>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">ABHA ID</label>
                <input
                  type="text"
                  value={editAbhaId}
                  onChange={(e) => setEditAbhaId(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 2: CONTACT INFORMATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Block 2: Contact Information</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">TELECOM</span>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Primary Phone</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{patient.contact}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Communication Channel</span>
                <span className="capitalize text-slate-800 dark:text-slate-200">{patient.communicationPreference || 'ASHA Visit'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Emergency Contact</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.emergencyContact}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Primary Mobile</label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Emergency Contact</label>
                <input
                  type="text"
                  value={editEmergencyContact}
                  onChange={(e) => setEditEmergencyContact(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 3: ADDRESS AND LOCATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Block 3: Address & Location</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">GEOGRAPHY</span>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Village / Locality</span>
                <span className="font-semibold text-slate-900 dark:text-white">{patient.village}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Ward / Sector</span>
                <span className="text-slate-800 dark:text-slate-200">{patient.wardOrBlock || 'Main Village'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">District & State</span>
                <span className="text-slate-900 dark:text-white font-medium">{patient.district}, {patient.state || 'MP'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Postal PIN</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{patient.pincode || '461775'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Village</label>
                <input
                  type="text"
                  value={editVillage}
                  onChange={(e) => setEditVillage(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">District</label>
                <input
                  type="text"
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 4: MEDICAL HISTORY */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Block 4: Medical History</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">CHRONIC & SURGICAL</span>
          </div>

          {!isEditing ? (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Diagnosed Chronic Illnesses</span>
                <div className="flex flex-wrap gap-1.5">
                  {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                    patient.chronicConditions.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">None reported</span>
                  )}
                </div>
              </div>
              {patient.pastSurgeries && (
                <div className="pt-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Past Surgeries / Procedures</span>
                  <span className="text-slate-800 dark:text-slate-200">{patient.pastSurgeries}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Chronic Conditions (comma separated)</label>
                <input
                  type="text"
                  value={editConditions}
                  onChange={(e) => setEditConditions(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Past Surgeries</label>
                <input
                  type="text"
                  value={editPastSurgeries}
                  onChange={(e) => setEditPastSurgeries(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 5: CURRENT HEALTH INFORMATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px]">
                5
              </span>
              <span>Block 5: Current Health Information</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">MEDS & ALLERGIES</span>
          </div>

          {!isEditing ? (
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Known Allergies</span>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies && patient.allergies.length > 0 ? (
                    patient.allergies.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-medium">
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No Known Drug Allergies (NKDA)</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Ongoing Daily Medications</span>
                <span className="text-slate-800 dark:text-slate-200">{patient.currentMedications || 'None recorded'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Allergies (comma separated)</label>
                <input
                  type="text"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Current Medications</label>
                <input
                  type="text"
                  value={editMedications}
                  onChange={(e) => setEditMedications(e.target.value)}
                  className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 7: CONSENT AND PRIVACY */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px]">
                7
              </span>
              <span>Block 7: Consent and Privacy</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">LEGAL & ETHICS</span>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Informed Consent Active & Logged</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Patient consented to periodic frontline physiological vitals tracking. Records are encrypted under Row Level Security and restricted to authorized personnel.
            </p>
            <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-teal-200/50 dark:border-teal-800/50">
              Consent recorded: {patient.consentDate ? new Date(patient.consentDate).toLocaleDateString() : new Date(patient.registeredAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* BLOCK 8: REFERRALS AND FOLLOW-UP */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-[10px]">
                8
              </span>
              <span>Block 8: Referrals & Follow-up Plan</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">CONTINUITY</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Preferred Referral Centre</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {patient.preferredFacility || 'Pipariya Community Health Centre (CHC)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Follow-up Re-screening Interval</span>
              <span className="text-slate-800 dark:text-slate-200">
                Every {patient.followUpIntervalMonths || 3} Months
              </span>
            </div>
            {patientReferrals.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Active Clinical Referrals ({patientReferrals.length})
                </span>
                <div className="space-y-1.5">
                  {patientReferrals.map((r) => (
                    <div key={r.id} className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-[11px] flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{r.destinationFacility}</span>
                        <span className="text-slate-400 text-[10px] block">{r.reason}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BLOCK 6: SCREENING HISTORY (FULL TIMELINE) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs">
              6
            </span>
            <span>Block 6: Physiological Screening History & Triage Records ({patientScreenings.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">TIMELINE</span>
        </div>

        {patientScreenings.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No screenings recorded yet</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              This patient has not yet undergone a digital vital signs checkup.
            </p>
            <button
              onClick={() => startScreening(patient)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Start First Screening
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {patientScreenings.map((screening) => (
              <div 
                key={screening.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                      #{screening.id}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(screening.createdAt).toLocaleDateString()} at {new Date(screening.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      screening.riskLevel === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : screening.riskLevel === 'moderate'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {screening.riskLevel} Risk
                    </span>
                    {screening.isSimulated && (
                      <span className="text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                        DEMO / SIMULATED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Screener: <strong>{screening.screenerName}</strong>
                    </span>
                    <button
                      onClick={() => setPrintableReport({ screening, patient })}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Print Summary</span>
                    </button>
                  </div>
                </div>

                {/* Vitals Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Heart Rate</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {screening.vitals.heartRate > 0 ? `${screening.vitals.heartRate} BPM` : 'Not recorded'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">SpO2</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {screening.vitals.spo2 > 0 ? `${screening.vitals.spo2}%` : 'Not recorded'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Blood Pressure</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {screening.vitals.systolic > 0 && screening.vitals.diastolic > 0
                        ? `${screening.vitals.systolic}/${screening.vitals.diastolic}`
                        : 'Not recorded'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Temperature</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {screening.vitals.temperature > 0 ? `${screening.vitals.temperature}°${screening.vitals.tempUnit}` : 'Not recorded'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">Height / Wt</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {screening.vitals.height > 0 || screening.vitals.weight > 0
                        ? `${screening.vitals.height}cm / ${screening.vitals.weight}kg`
                        : 'Not recorded'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-sans">BMI</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {screening.vitals.bmi || 'Not recorded'}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {screening.recommendations && screening.recommendations.length > 0 && (
                  <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <span className="font-bold block mb-1">Clinical Action Advice:</span>
                    <ul className="list-disc list-inside space-y-0.5 opacity-90">
                      {screening.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

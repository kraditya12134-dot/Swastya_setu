import React, { useState } from 'react';
import { 
  GitBranch, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  FileText, 
  User, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { Referral, ReferralStatus, ReferralUrgency } from '../../types';
import { storage } from '../../services/storage';

export const ReferralsView: React.FC = () => {
  const { 
    language, 
    referrals, 
    refreshData, 
    user, 
    role, 
    screenings, 
    patients, 
    setPrintableReport,
    setSelectedPatientId 
  } = useApp();

  const t = translations[language];

  const [statusFilter, setStatusFilter] = useState<'all' | ReferralStatus>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | ReferralUrgency>('all');
  const [activeNotesModalRef, setActiveNotesModalRef] = useState<Referral | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter referrals
  const filteredReferrals = referrals.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
    return matchesStatus && matchesUrgency;
  });

  const handleUpdateStatus = async (ref: Referral, newStatus: ReferralStatus, notes?: string) => {
    setIsUpdating(true);
    try {
      await storage.updateReferralStatus(ref.id, newStatus, notes, `${user.name} (${user.role.toUpperCase()})`, user.role);
      await refreshData();
      setActiveNotesModalRef(null);
      setNotesInput('');
    } catch (err) {
      console.error('Failed to update referral:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenReport = (ref: Referral) => {
    const scr = screenings.find((s) => s.id === ref.screeningId);
    const pat = patients.find((p) => p.id === ref.patientId);
    if (scr && pat) {
      setPrintableReport({ screening: scr, patient: pat });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.menuReferrals}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'en'
              ? 'Closed-loop tele-referrals connecting community screenings with medical officers'
              : 'सामुदायिक जांच से अस्पताल तक टेली-रेफरल व डॉक्टर समीक्षा प्रणाली'}
          </p>
        </div>

        {/* Quick status tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            All ({referrals.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'pending' ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Pending ({referrals.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusFilter === 'completed' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Completed ({referrals.filter((r) => r.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Urgency Filter Strip */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 text-xs transition-colors">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Filter by Priority Urgency:</span>
        <div className="flex items-center gap-2">
          {(['all', 'emergency', 'urgent', 'routine'] as const).map((urg) => (
            <button
              key={urg}
              onClick={() => setUrgencyFilter(urg)}
              className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors cursor-pointer ${
                urgencyFilter === urg
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {/* Referrals List Cards */}
      <div className="space-y-4">
        {filteredReferrals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <GitBranch className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No referrals matching criteria</div>
            <p className="text-xs text-slate-400">All referrals for this filter have been addressed.</p>
          </div>
        ) : (
          filteredReferrals.map((ref) => (
            <div
              key={ref.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {ref.patientName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({ref.patientAge}y / {ref.patientGender} · {ref.patientVillage})
                    </span>
                    
                    {/* Urgency badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      ref.urgency === 'emergency'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : ref.urgency === 'urgent'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {ref.urgency}
                    </span>

                    {/* Status badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      ref.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : ref.status === 'accepted'
                        ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                    }`}>
                      {ref.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Destination Facility: <strong className="text-slate-800 dark:text-slate-200">{ref.destinationFacility}</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono sm:text-right">
                  <div>Ref ID: {ref.id}</div>
                  <div>{new Date(ref.referredAt).toLocaleDateString()}</div>
                  <div>Referred by: {ref.referredBy}</div>
                </div>
              </div>

              {/* Referral Clinical Reason */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 text-xs border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Screening Escalation Reason:</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{ref.reason}</p>
              </div>

              {/* Doctor Review Notes (if completed or reviewed) */}
              {ref.clinicianNotes && (
                <div className="bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-lg p-3 text-xs space-y-1 text-teal-950 dark:text-teal-200">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Doctor Review Notes:</span>
                    </span>
                    {ref.reviewedBy && (
                      <span className="text-[10px] font-normal text-teal-700 dark:text-teal-400 font-mono">
                        By {ref.reviewedBy} on {ref.reviewedAt ? new Date(ref.reviewedAt).toLocaleDateString() : ''}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed">{ref.clinicianNotes}</p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => handleOpenReport(ref)}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Full Screening Report</span>
                </button>

                {/* Clinician Review Buttons */}
                <div className="flex items-center gap-2">
                  {ref.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(ref, 'accepted')}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Accept Patient
                    </button>
                  )}

                  {ref.status !== 'completed' && (
                    <button
                      onClick={() => {
                        setActiveNotesModalRef(ref);
                        setNotesInput(ref.clinicianNotes || '');
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      {ref.status === 'accepted' ? 'Complete Consultation' : 'Add Clinical Notes & Complete'}
                    </button>
                  )}

                  {ref.status === 'completed' && (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Consultation Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal to add clinician notes */}
      {activeNotesModalRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Doctor Consultation Notes · {activeNotesModalRef.patientName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record diagnosis impressions, medication instructions, and follow-up directives to close the referral loop.
            </p>

            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g. Patient evaluated in OPD. Prescribed Telmisartan 40mg once daily. Salt-restricted diet advised. Scheduled follow-up BP check in 14 days."
              rows={4}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white dark:bg-slate-800"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveNotesModalRef(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(activeNotesModalRef, 'completed', notesInput)}
                disabled={isUpdating}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
              >
                {isUpdating ? 'Saving...' : 'Save & Mark Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

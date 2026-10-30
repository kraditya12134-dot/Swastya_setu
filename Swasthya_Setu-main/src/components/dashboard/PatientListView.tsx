import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  HeartPulse, 
  ChevronRight, 
  Activity, 
  FileText, 
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { Patient, RiskLevel } from '../../types';

export const PatientListView: React.FC = () => {
  const { 
    language, 
    role,
    patients, 
    setIsRegisterModalOpen, 
    startScreening, 
    setSelectedPatientId 
  } = useApp();

  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | RiskLevel>('all');
  const [selectedVillage, setSelectedVillage] = useState('all');

  // Unique list of villages
  const villages = Array.from(new Set(patients.map((p) => p.village))).filter(Boolean);

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      patient.name.toLowerCase().includes(query) ||
      (patient.abhaId && patient.abhaId.toLowerCase().includes(query)) ||
      patient.contact.includes(query) ||
      patient.village.toLowerCase().includes(query);

    const matchesRisk = 
      selectedRiskFilter === 'all' || 
      patient.lastRiskStatus === selectedRiskFilter;

    const matchesVillage = 
      selectedVillage === 'all' || 
      patient.village === selectedVillage;

    return matchesSearch && matchesRisk && matchesVillage;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.menuPatients}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'en' 
              ? 'Authorized community health registry with documented informed consent' 
              : 'सहमति आधारित अधिकृत सामुदायिक स्वास्थ्य पंजिका'}
          </p>
        </div>

        {role !== 'clinician' && (
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.registerPatient}</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between transition-colors">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ABHA ID, village, or phone number..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Village Filter */}
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 focus:outline-none"
          >
            <option value="all">All Villages ({villages.length})</option>
            {villages.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 focus:outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk Only</option>
            <option value="moderate">Moderate Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching patient records found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try modifying your search keywords or clearing applied village/risk filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRiskFilter('all');
                setSelectedVillage('all');
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patient Name & ID</th>
                  <th className="py-3 px-4">Age / Sex</th>
                  <th className="py-3 px-4">Village / Locality</th>
                  <th className="py-3 px-4">Chronic History</th>
                  <th className="py-3 px-4">Consent</th>
                  <th className="py-3 px-4">Last Screened</th>
                  <th className="py-3 px-4">Triage Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedPatientId(patient.id)}
                        className="font-bold text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 text-left block cursor-pointer"
                      >
                        {patient.name}
                      </button>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {patient.abhaId ? `ABHA: ${patient.abhaId}` : patient.id}
                      </div>
                    </td>

                    {/* Age / Gender */}
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      {patient.age}y / <span className="capitalize">{patient.gender}</span>
                    </td>

                    {/* Village */}
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      <div>{patient.village}</div>
                      <div className="text-[10px] text-slate-400">{patient.district}</div>
                    </td>

                    {/* Chronic Conditions */}
                    <td className="py-3 px-4">
                      {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {patient.chronicConditions.map((c, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">None declared</span>
                      )}
                    </td>

                    {/* Consent status */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Logged</span>
                      </span>
                    </td>

                    {/* Last Screened */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {patient.lastScreenedAt ? (
                        new Date(patient.lastScreenedAt).toLocaleDateString()
                      ) : (
                        <span className="text-slate-400 italic">Never</span>
                      )}
                    </td>

                    {/* Risk Status */}
                    <td className="py-3 px-4">
                      {patient.lastRiskStatus ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          patient.lastRiskStatus === 'high'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : patient.lastRiskStatus === 'moderate'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            patient.lastRiskStatus === 'high' ? 'bg-rose-600' : patient.lastRiskStatus === 'moderate' ? 'bg-amber-600' : 'bg-emerald-600'
                          }`} />
                          <span>{patient.lastRiskStatus}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Unscreened</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startScreening(patient)}
                          className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Screen Patient"
                        >
                          <HeartPulse className="w-3.5 h-3.5" />
                          <span>Screen</span>
                        </button>

                        <button
                          onClick={() => setSelectedPatientId(patient.id)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs transition-colors cursor-pointer"
                          title="View Details"
                        >
                          Details
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

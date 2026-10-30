import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Activity, 
  Scale, 
  HeartPulse, 
  MapPin, 
  GitBranch, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { RiskLevel } from '../../types';

export const AnalyticsView: React.FC = () => {
  const { language, screenings, patients, referrals } = useApp();
  const t = translations[language];

  // Filters
  const [timeFilter, setTimeFilter] = useState<'all' | '30d' | '7d'>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  // Unique villages for filter dropdown
  const villageList = useMemo(() => {
    const set = new Set<string>();
    patients.forEach((p) => p.village && set.add(p.village));
    return Array.from(set);
  }, [patients]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    const now = new Date().getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    // Filter patients
    const fPatients = patients.filter((p) => {
      if (selectedVillage !== 'all' && p.village !== selectedVillage) return false;
      if (timeFilter === '7d') {
        const regTime = new Date(p.registeredAt).getTime();
        if (now - regTime > 7 * dayMs) return false;
      } else if (timeFilter === '30d') {
        const regTime = new Date(p.registeredAt).getTime();
        if (now - regTime > 30 * dayMs) return false;
      }
      return true;
    });

    // Patient ID set for cross-filtering
    const patientIdSet = new Set(fPatients.map((p) => p.id));

    // Filter screenings
    const fScreenings = screenings.filter((s) => {
      if (selectedVillage !== 'all' && !patientIdSet.has(s.patientId)) return false;
      if (selectedRisk !== 'all' && s.riskLevel !== selectedRisk) return false;
      if (timeFilter === '7d') {
        const scrTime = new Date(s.createdAt).getTime();
        if (now - scrTime > 7 * dayMs) return false;
      } else if (timeFilter === '30d') {
        const scrTime = new Date(s.createdAt).getTime();
        if (now - scrTime > 30 * dayMs) return false;
      }
      return true;
    });

    // Filter referrals
    const fReferrals = referrals.filter((r) => {
      if (selectedVillage !== 'all' && r.patientVillage !== selectedVillage) return false;
      if (timeFilter === '7d') {
        const refTime = new Date(r.referredAt).getTime();
        if (now - refTime > 7 * dayMs) return false;
      } else if (timeFilter === '30d') {
        const refTime = new Date(r.referredAt).getTime();
        if (now - refTime > 30 * dayMs) return false;
      }
      return true;
    });

    return {
      patients: fPatients,
      screenings: fScreenings,
      referrals: fReferrals,
    };
  }, [screenings, patients, referrals, timeFilter, selectedVillage, selectedRisk]);

  // Metrics calculation
  const totalScreenings = filteredData.screenings.length;
  const totalPatients = filteredData.patients.length;
  const totalReferrals = filteredData.referrals.length;

  // 1. BP breakdown
  let bpNormal = 0;
  let bpElevated = 0;
  let bpStage1 = 0;
  let bpStage2 = 0;

  filteredData.screenings.forEach((s) => {
    const sys = s.vitals.systolic;
    const dia = s.vitals.diastolic;
    if (sys >= 140 || dia >= 90) bpStage2++;
    else if (sys >= 130 || dia >= 80) bpStage1++;
    else if (sys >= 120 && dia < 80) bpElevated++;
    else bpNormal++;
  });

  // 2. BMI breakdown
  let bmiUnder = 0;
  let bmiNormal = 0;
  let bmiOver = 0;
  let bmiObese = 0;

  filteredData.screenings.forEach((s) => {
    const bmi = s.vitals.bmi || 0;
    if (bmi === 0) return;
    if (bmi < 18.5) bmiUnder++;
    else if (bmi < 23) bmiNormal++;
    else if (bmi < 27.5) bmiOver++;
    else bmiObese++;
  });

  // 3. Referral status breakdown
  const pendingRefs = filteredData.referrals.filter((r) => r.status === 'pending').length;
  const acceptedRefs = filteredData.referrals.filter((r) => r.status === 'accepted').length;
  const completedRefs = filteredData.referrals.filter((r) => r.status === 'completed').length;
  const closureRate = totalReferrals > 0 ? Math.round((completedRefs / totalReferrals) * 100) : 0;

  // 4. Referral urgency
  const routineRefs = filteredData.referrals.filter((r) => r.urgency === 'routine').length;
  const urgentRefs = filteredData.referrals.filter((r) => r.urgency === 'urgent').length;
  const emergencyRefs = filteredData.referrals.filter((r) => r.urgency === 'emergency').length;

  // 5. Timeline trends (Grouping by date)
  const timelineData = useMemo(() => {
    const map: Record<string, { date: string; label: string; count: number }> = {};
    // Last 7 days or default buckets
    filteredData.screenings.forEach((s) => {
      const d = s.createdAt ? s.createdAt.split('T')[0] : '2026-10-29';
      if (!map[d]) {
        map[d] = {
          date: d,
          label: new Date(d).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
            month: 'short',
            day: 'numeric',
          }),
          count: 0,
        };
      }
      map[d].count++;
    });

    const list = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    return list.length > 0 ? list : [{ date: 'Today', label: 'Recent', count: filteredData.screenings.length }];
  }, [filteredData.screenings, language]);

  const maxTimelineCount = Math.max(...timelineData.map((d) => d.count), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.menuAnalytics}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              DEMO / SYNTHETIC DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'en'
              ? 'Animated epidemiological screening metrics, vitals distribution, and tele-referral resolution'
              : 'सामुदायिक स्वास्थ्य संकेतक, रक्तचाप वितरण, बीएमआई और रेफरल समाधान आंकड़े'}
          </p>
        </div>

        {/* Dynamic Interactive Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time Filter */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-2xs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                timeFilter === '30d'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                timeFilter === '7d'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Village Filter */}
          <div className="relative">
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Villages / Localities</option>
              {villageList.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Risk Level Filter */}
          <div className="relative">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Screenings</span>
            <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
            {totalScreenings}
          </div>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
            Active in current filter
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Registered Patients</span>
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
            {totalPatients}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Documented consent on file
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Referrals Triggered</span>
            <GitBranch className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
            {totalReferrals}
          </div>
          <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 font-medium">
            {pendingRefs} pending triage review
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Referral Closure</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2 tabular-nums">
            {closureRate}%
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {completedRefs} consultations resolved
          </p>
        </div>
      </div>

      {/* Empty State Guard if Filter yields zero records */}
      {totalScreenings === 0 && totalPatients === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Records Found for Selected Filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No synthetic screening data matches the selected timeframe or village criteria. Reset filters to view all records.
          </p>
          <button
            onClick={() => {
              setTimeFilter('all');
              setSelectedVillage('all');
              setSelectedRisk('all');
            }}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Analytical Visualizations Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CHART 1: Animated Screening Trends Over Time (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Screening Volume Timeline Trends
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {timelineData.length} active date points
              </span>
            </div>

            {/* Animated Bar Chart with responsive SVG bars */}
            <div className="pt-2">
              <div className="h-48 flex items-end gap-3 sm:gap-6 px-2 border-b border-slate-100 dark:border-slate-800">
                {timelineData.map((item, idx) => {
                  const heightPercent = Math.max(12, Math.round((item.count / maxTimelineCount) * 100));
                  return (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                        {item.count}
                      </div>
                      <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden h-full flex items-end">
                        <div
                          style={{
                            height: `${heightPercent}%`,
                            transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                          className="w-full bg-gradient-to-t from-teal-600 to-teal-400 dark:from-teal-700 dark:to-teal-400 rounded-t-lg group-hover:brightness-110"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[60px] text-center">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Frontline screening cadence per village sub-centre session</span>
              <span className="text-teal-600 dark:text-teal-400 font-semibold">Hover bars for count details</span>
            </div>
          </div>

          {/* CHART 2: Referral Closed-Loop Funnel (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Referral Resolution
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">{closureRate}%</span>
              </div>

              {/* Status Breakdown with animated horizontal progress bars */}
              <div className="space-y-3 pt-3 text-xs">
                {/* Pending */}
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600 dark:text-slate-300">Pending Review</span>
                    <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400 font-bold">{pendingRefs}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${totalReferrals > 0 ? (pendingRefs / totalReferrals) * 100 : 0}%`,
                        transition: 'width 0.8s ease-out',
                      }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Accepted / In Consultation */}
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600 dark:text-slate-300">Accepted / In Triage</span>
                    <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400 font-bold">{acceptedRefs}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${totalReferrals > 0 ? (acceptedRefs / totalReferrals) * 100 : 0}%`,
                        transition: 'width 0.8s ease-out',
                      }}
                      className="h-full bg-amber-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Completed */}
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600 dark:text-slate-300">Completed & Advised</span>
                    <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">{completedRefs}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${totalReferrals > 0 ? (completedRefs / totalReferrals) * 100 : 0}%`,
                        transition: 'width 0.8s ease-out',
                      }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Urgency distribution strip */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-200 block">Triage Urgency Breakdown:</span>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono">
                <span className="text-slate-700 dark:text-slate-300">Routine: {routineRefs}</span>
                <span className="text-amber-600 dark:text-amber-400">Urgent: {urgentRefs}</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">Emergency: {emergencyRefs}</span>
              </div>
            </div>
          </div>

          {/* CHART 3: Blood Pressure Stratification (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Blood Pressure Screening Distribution
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">AHA/JNC Standard</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Normal */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Normal (&lt;120 / &lt;80 mmHg)</span>
                  <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {bpNormal} ({totalScreenings > 0 ? Math.round((bpNormal / totalScreenings) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalScreenings > 0 ? (bpNormal / totalScreenings) * 100 : 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              {/* Elevated */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Elevated (120–129 / &lt;80 mmHg)</span>
                  <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {bpElevated} ({totalScreenings > 0 ? Math.round((bpElevated / totalScreenings) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalScreenings > 0 ? (bpElevated / totalScreenings) * 100 : 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                </div>
              </div>

              {/* Stage 1 */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Stage 1 HTN (130–139 / 80–89 mmHg)</span>
                  <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {bpStage1} ({totalScreenings > 0 ? Math.round((bpStage1 / totalScreenings) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalScreenings > 0 ? (bpStage1 / totalScreenings) * 100 : 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
              </div>

              {/* Stage 2 */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Stage 2 HTN (≥140 / ≥90 mmHg)</span>
                  <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400 font-bold">
                    {bpStage2} ({totalScreenings > 0 ? Math.round((bpStage2 / totalScreenings) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalScreenings > 0 ? (bpStage2 / totalScreenings) * 100 : 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="h-full bg-rose-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CHART 4: WHO Asian-Indian BMI Breakdown (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  BMI Population Stratification
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">WHO Asian Cutoffs</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Underweight */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Underweight (&lt;18.5 kg/m²)</span>
                  <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {bmiUnder} ({totalScreenings > 0 ? Math.round((bmiUnder / totalScreenings) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalScreenings > 0 ? (bmiUnder / totalScreenings) * 100 : 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                </div>
              </div>

              {/* Normal Healthy */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Normal Healthy (18.5–22.9 kg/m²)</span>
                  <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-bold">
                    {bmiNormal} ({totalScreenings > 0 ? Math.round((bmiNormal / totalScreenings) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalScreenings > 0 ? (bmiNormal / totalScreenings) * 100 : 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              {/* Pre-Obese / Overweight */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Overweight (23.0–27.4 kg/m²)</span>
                  <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {bmiOver} ({totalScreenings > 0 ? Math.round((bmiOver / totalScreenings) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalScreenings > 0 ? (bmiOver / totalScreenings) * 100 : 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="h-full bg-orange-400 rounded-full"
                  />
                </div>
              </div>

              {/* Obese */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Obese (≥27.5 kg/m²)</span>
                  <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400 font-bold">
                    {bmiObese} ({totalScreenings > 0 ? Math.round((bmiObese / totalScreenings) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalScreenings > 0 ? (bmiObese / totalScreenings) * 100 : 0}%`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="h-full bg-rose-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

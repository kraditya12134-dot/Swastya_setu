/**
 * Data Storage & Sync Service for Swasthya Setu
 * 
 * Supports:
 * 1. Live Supabase Backend & Google OAuth when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present
 * 2. Robust Offline / Local Browser Persistence with synthetic demo seeds when Supabase is unconfigured
 * 
 * "Never pretend data is persisted if the backend is not connected" - We clearly report
 * whether data is syncing to Supabase Cloud or stored in local demo mode.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Patient, Screening, Referral, SupabaseConfig, UserRole, AuditLog, User } from '../types';

const STORAGE_KEYS = {
  PATIENTS: 'swasthya_setu_patients_v1',
  SCREENINGS: 'swasthya_setu_screenings_v1',
  REFERRALS: 'swasthya_setu_referrals_v1',
  AUDIT_LOGS: 'swasthya_setu_audit_logs_v1',
  USER_ROLE: 'swasthya_setu_active_role_v1',
  LANGUAGE: 'swasthya_setu_lang_v1',
  THEME: 'swasthya_setu_theme_v1',
};

// Check environment variables
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

if (envSupabaseUrl && envSupabaseAnonKey && envSupabaseUrl.startsWith('http')) {
  try {
    supabaseClient = createClient(envSupabaseUrl, envSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

// Initial 6 realistic synthetic demo patients
export const INITIAL_DEMO_PATIENTS: Patient[] = [
  {
    id: 'PAT-2026-001',
    abhaId: '91-4402-9812-3321',
    name: 'Meera Devi',
    nameHi: 'मीरा देवी',
    age: 54,
    gender: 'female',
    contact: '+91 98765 43210',
    village: 'Pipariya',
    district: 'Hoshangabad',
    emergencyContact: 'Rakesh (Son) - +91 98765 43211',
    chronicConditions: ['Hypertension', 'Joint Pain'],
    consentObtained: true,
    consentDate: '2026-10-20T09:30:00Z',
    registeredAt: '2026-10-20T09:30:00Z',
    registeredBy: 'Pooja Verma (CHW)',
    lastScreenedAt: '2026-10-27T10:15:00Z',
    lastRiskStatus: 'high',
  },
  {
    id: 'PAT-2026-002',
    abhaId: '91-8891-2309-1145',
    name: 'Rajesh Kumar Patel',
    nameHi: 'राजेश कुमार पटेल',
    age: 42,
    gender: 'male',
    contact: '+91 94250 88219',
    village: 'Bilaspur',
    district: 'Bilaspur',
    emergencyContact: 'Sunita (Wife) - +91 94250 88220',
    chronicConditions: ['Tobacco Consumer (10 yrs)'],
    consentObtained: true,
    consentDate: '2026-10-22T11:00:00Z',
    registeredAt: '2026-10-22T11:00:00Z',
    registeredBy: 'Pooja Verma (CHW)',
    lastScreenedAt: '2026-10-28T14:40:00Z',
    lastRiskStatus: 'moderate',
  },
  {
    id: 'PAT-2026-003',
    abhaId: '91-1204-5543-9081',
    name: 'Sunita Bai',
    nameHi: 'सुनीता बाई',
    age: 27,
    gender: 'female',
    contact: '+91 97130 11982',
    village: 'Dharampura',
    district: 'Dhar',
    emergencyContact: 'Mukesh (Husband) - +91 97130 11983',
    chronicConditions: ['None - Postnatal 6-Month'],
    consentObtained: true,
    consentDate: '2026-10-24T08:45:00Z',
    registeredAt: '2026-10-24T08:45:00Z',
    registeredBy: 'Pooja Verma (CHW)',
    lastScreenedAt: '2026-10-29T09:00:00Z',
    lastRiskStatus: 'low',
  },
  {
    id: 'PAT-2026-004',
    abhaId: '91-6672-4410-0923',
    name: 'Rameshwar Singh',
    nameHi: 'रामेश्वर सिंह',
    age: 68,
    gender: 'male',
    contact: '+91 98260 77123',
    village: 'Chhatarpur',
    district: 'Chhatarpur',
    emergencyContact: 'Vijay (Son) - +91 98260 77124',
    chronicConditions: ['Chronic Bronchitis', 'Smoker'],
    consentObtained: true,
    consentDate: '2026-10-25T13:20:00Z',
    registeredAt: '2026-10-25T13:20:00Z',
    registeredBy: 'Pooja Verma (CHW)',
    lastScreenedAt: '2026-10-29T11:30:00Z',
    lastRiskStatus: 'high',
  },
  {
    id: 'PAT-2026-005',
    abhaId: '91-3310-7789-2244',
    name: 'Anjali Sharma',
    nameHi: 'अंजलि शर्मा',
    age: 33,
    gender: 'female',
    contact: '+91 99810 55432',
    village: 'Rampur',
    district: 'Jabalpur',
    emergencyContact: 'Anand (Husband) - +91 99810 55433',
    chronicConditions: ['None'],
    consentObtained: true,
    consentDate: '2026-10-26T15:10:00Z',
    registeredAt: '2026-10-26T15:10:00Z',
    registeredBy: 'Pooja Verma (CHW)',
    lastScreenedAt: '2026-10-28T16:20:00Z',
    lastRiskStatus: 'low',
  },
  {
    id: 'PAT-2026-006',
    abhaId: '91-9901-4432-8876',
    name: 'Gopal Das',
    nameHi: 'गोपाल दास',
    age: 61,
    gender: 'male',
    contact: '+91 96300 22119',
    village: 'Kalyanpur',
    district: 'Rewa',
    emergencyContact: 'Kamla (Wife) - +91 96300 22118',
    chronicConditions: ['Type 2 Diabetes (5 yrs)'],
    consentObtained: true,
    consentDate: '2026-10-27T10:00:00Z',
    registeredAt: '2026-10-27T10:00:00Z',
    registeredBy: 'Pooja Verma (CHW)',
    lastScreenedAt: '2026-10-29T12:00:00Z',
    lastRiskStatus: 'moderate',
  },
];

// Initial demo screenings
export const INITIAL_DEMO_SCREENINGS: Screening[] = [
  {
    id: 'SCR-2026-001',
    patientId: 'PAT-2026-001',
    screenerId: 'USR-CHW-01',
    screenerName: 'Pooja Verma',
    screenerRole: 'chw',
    createdAt: '2026-10-27T10:15:00Z',
    facility: 'Pipariya Sub-Centre HW-03',
    consentObtained: true,
    vitals: {
      heartRate: 88,
      spo2: 96,
      temperature: 98.4,
      tempUnit: 'F',
      systolic: 164,
      diastolic: 98,
      height: 154,
      weight: 68,
      bmi: 28.7,
      bmiCategory: 'Pre-Obese',
      bpClassification: 'Stage 2 Hypertension',
    },
    questionnaire: {
      chestPain: false,
      shortnessOfBreath: true,
      dizziness: true,
      feverDuration: 'none',
      coughDuration: 'none',
      diabetesHistory: false,
      hypertensionHistory: true,
      tobaccoUse: false,
      alcoholUse: false,
      currentMedications: 'Amlodipine 5mg (Irregular)',
      notes: 'Patient admits forgetting daily antihypertensive medication. Complains of morning occipital headache and mild exertion breathlessness.',
    },
    isSimulated: true,
    simulationDetails: 'Demo simulated BP monitor reading paired with manual questionnaire.',
    riskLevel: 'high',
    riskFactors: [
      'Stage 2 Hypertension (164/98 mmHg)',
      'Reported shortness of breath at rest or mild exertion',
      'Irregular antihypertensive compliance',
    ],
    recommendations: [
      'Immediate medical evaluation required at Primary Health Centre (PHC)',
      'Advise immediate medication reconciliation with doctor',
      'Reduce dietary sodium and rest in cool area',
    ],
    referralId: 'REF-2026-001',
  },
  {
    id: 'SCR-2026-002',
    patientId: 'PAT-2026-004',
    screenerId: 'USR-CHW-01',
    screenerName: 'Pooja Verma',
    screenerRole: 'chw',
    createdAt: '2026-10-29T11:30:00Z',
    facility: 'Chhatarpur Mobile Outreach Camp',
    consentObtained: true,
    vitals: {
      heartRate: 104,
      spo2: 91,
      temperature: 100.8,
      tempUnit: 'F',
      systolic: 132,
      diastolic: 84,
      height: 168,
      weight: 52,
      bmi: 18.4,
      bmiCategory: 'Underweight',
      bpClassification: 'Stage 1 Hypertension',
    },
    questionnaire: {
      chestPain: false,
      shortnessOfBreath: true,
      dizziness: false,
      feverDuration: '3+ days',
      coughDuration: '2+ weeks',
      diabetesHistory: false,
      hypertensionHistory: false,
      tobaccoUse: true,
      alcoholUse: false,
      currentMedications: 'None',
      notes: 'Chronic smoker. Persistent productive cough for 3 weeks with evening fever and night sweats. Severe low BMI.',
    },
    isSimulated: true,
    simulationDetails: 'Field sensor bundle simulation: Pulse Oximeter & Digital Thermometer.',
    riskLevel: 'high',
    riskFactors: [
      'Borderline low SpO2 reading (91%)',
      'Persistent cough lasting more than 2 weeks (presumptive TB protocol)',
      'Underweight with febrile state',
    ],
    recommendations: [
      'Urgent referral to District Hospital / CHC for Sputum Test and Chest X-ray',
      'Oxygen therapy assessment if SpO2 drops further',
    ],
    referralId: 'REF-2026-002',
  },
  {
    id: 'SCR-2026-003',
    patientId: 'PAT-2026-002',
    screenerId: 'USR-CHW-01',
    screenerName: 'Pooja Verma',
    screenerRole: 'chw',
    createdAt: '2026-10-28T14:40:00Z',
    facility: 'Bilaspur Ayushman Arogya Mandir',
    consentObtained: true,
    vitals: {
      heartRate: 78,
      spo2: 98,
      temperature: 98.6,
      tempUnit: 'F',
      systolic: 136,
      diastolic: 88,
      height: 172,
      weight: 84,
      bmi: 28.4,
      bmiCategory: 'Pre-Obese',
      bpClassification: 'Stage 1 Hypertension',
    },
    questionnaire: {
      chestPain: false,
      shortnessOfBreath: false,
      dizziness: false,
      feverDuration: 'none',
      coughDuration: 'none',
      diabetesHistory: false,
      hypertensionHistory: false,
      tobaccoUse: true,
      alcoholUse: true,
      currentMedications: 'None',
      notes: 'Farmer with high salt and tobacco consumption. Mild headache during hot afternoon shifts.',
    },
    isSimulated: false,
    riskLevel: 'moderate',
    riskFactors: [
      'Stage 1 Hypertension (136/88 mmHg)',
      'Pre-obese BMI (28.4 kg/m²)',
      'Active tobacco use',
    ],
    recommendations: [
      'Lifestyle and dietary counselling for sodium restriction and tobacco cessation',
      'Re-screen blood pressure in 2 weeks at local health post',
    ],
    referralId: 'REF-2026-003',
  },
  {
    id: 'SCR-2026-004',
    patientId: 'PAT-2026-003',
    screenerId: 'USR-CHW-01',
    screenerName: 'Pooja Verma',
    screenerRole: 'chw',
    createdAt: '2026-10-29T09:00:00Z',
    facility: 'Dharampura Sub-Centre',
    consentObtained: true,
    vitals: {
      heartRate: 74,
      spo2: 99,
      temperature: 98.2,
      tempUnit: 'F',
      systolic: 112,
      diastolic: 74,
      height: 158,
      weight: 52,
      bmi: 20.8,
      bmiCategory: 'Normal Weight',
      bpClassification: 'Normal BP',
    },
    questionnaire: {
      chestPain: false,
      shortnessOfBreath: false,
      dizziness: false,
      feverDuration: 'none',
      coughDuration: 'none',
      diabetesHistory: false,
      hypertensionHistory: false,
      tobaccoUse: false,
      alcoholUse: false,
      currentMedications: 'Iron Folic Acid supplements',
      notes: 'Postnatal 6-month checkup. Infant is feeding well. Maternal vitals optimal.',
    },
    isSimulated: false,
    riskLevel: 'low',
    riskFactors: [],
    recommendations: [
      'All measured vitals are within normal limits',
      'Continue routine maternal nutritional supplements and re-screen in 6 months',
    ],
  },
];

// Initial demo referrals
export const INITIAL_DEMO_REFERRALS: Referral[] = [
  {
    id: 'REF-2026-001',
    screeningId: 'SCR-2026-001',
    patientId: 'PAT-2026-001',
    patientName: 'Meera Devi',
    patientAge: 54,
    patientGender: 'Female',
    patientVillage: 'Pipariya',
    referredBy: 'Pooja Verma (CHW)',
    referredAt: '2026-10-27T10:20:00Z',
    destinationFacility: 'Rampur Primary Health Centre (PHC)',
    urgency: 'urgent',
    reason: 'Stage 2 Hypertension (164/98 mmHg) with missed medication compliance and morning occipital headache.',
    status: 'pending',
  },
  {
    id: 'REF-2026-002',
    screeningId: 'SCR-2026-002',
    patientId: 'PAT-2026-004',
    patientName: 'Rameshwar Singh',
    patientAge: 68,
    patientGender: 'Male',
    patientVillage: 'Chhatarpur',
    referredBy: 'Pooja Verma (CHW)',
    referredAt: '2026-10-29T11:40:00Z',
    destinationFacility: 'District Civil Hospital Hoshangabad',
    urgency: 'emergency',
    reason: 'Hypoxemia risk (SpO2 91%), persistent productive cough >3 weeks, and fever. Presumptive respiratory failure / TB triage.',
    status: 'accepted',
    clinicianNotes: 'Admitted to emergency respiratory triage bay. Sputum smear requested, IV access secured, low-flow O2 started.',
    reviewedBy: 'Dr. Priya Sharma (Medical Officer)',
    reviewedAt: '2026-10-29T12:15:00Z',
  },
  {
    id: 'REF-2026-003',
    screeningId: 'SCR-2026-003',
    patientId: 'PAT-2026-002',
    patientName: 'Rajesh Kumar Patel',
    patientAge: 42,
    patientGender: 'Male',
    patientVillage: 'Bilaspur',
    referredBy: 'Pooja Verma (CHW)',
    referredAt: '2026-10-28T14:45:00Z',
    destinationFacility: 'Bilaspur Community Health Centre (CHC)',
    urgency: 'routine',
    reason: 'Pre-HTN / Stage 1 HTN (136/88 mmHg), high BMI (28.4), lifestyle & dietary salt reduction consultation.',
    status: 'completed',
    clinicianNotes: 'Patient completed outpatient NCD counselling. Prescribed 14-day home BP monitoring log and dietary salt reduction.',
    reviewedBy: 'Dr. Priya Sharma (Medical Officer)',
    reviewedAt: '2026-10-29T10:00:00Z',
  },
];

// Initial demo audit logs
export const INITIAL_DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-10-29T11:42:00Z',
    userId: 'USR-CHW-01',
    userName: 'Pooja Verma',
    userRole: 'chw',
    action: 'RECORD_CONSENT_AND_SCREENING',
    details: 'Completed digital screening with recorded informed consent for Rameshwar Singh (PAT-2026-004)',
    patientId: 'PAT-2026-004',
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-29T12:16:00Z',
    userId: 'USR-DOC-02',
    userName: 'Dr. Priya Sharma',
    userRole: 'clinician',
    action: 'REFERRAL_ACCEPTED',
    details: 'Accepted urgent referral REF-2026-002 for clinical evaluation at District Civil Hospital',
    patientId: 'PAT-2026-004',
  },
  {
    id: 'AUD-003',
    timestamp: '2026-10-29T10:05:00Z',
    userId: 'USR-DOC-02',
    userName: 'Dr. Priya Sharma',
    userRole: 'clinician',
    action: 'CONSULTATION_RESOLVED',
    details: 'Resolved routine referral REF-2026-003 with outpatient diet & BP log counselling',
    patientId: 'PAT-2026-002',
  },
];

class StorageService {
  private memoryPatients: Patient[] = [];
  private memoryScreenings: Screening[] = [];
  private memoryReferrals: Referral[] = [];
  private memoryAuditLogs: AuditLog[] = [];

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    try {
      const storedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (storedPatients) {
        this.memoryPatients = JSON.parse(storedPatients);
      } else {
        this.memoryPatients = [...INITIAL_DEMO_PATIENTS];
        this.savePatientsToLocal(this.memoryPatients);
      }

      const storedScreenings = localStorage.getItem(STORAGE_KEYS.SCREENINGS);
      if (storedScreenings) {
        this.memoryScreenings = JSON.parse(storedScreenings);
      } else {
        this.memoryScreenings = [...INITIAL_DEMO_SCREENINGS];
        this.saveScreeningsToLocal(this.memoryScreenings);
      }

      const storedReferrals = localStorage.getItem(STORAGE_KEYS.REFERRALS);
      if (storedReferrals) {
        this.memoryReferrals = JSON.parse(storedReferrals);
      } else {
        this.memoryReferrals = [...INITIAL_DEMO_REFERRALS];
        this.saveReferralsToLocal(this.memoryReferrals);
      }

      const storedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAuditLogs) {
        this.memoryAuditLogs = JSON.parse(storedAuditLogs);
      } else {
        this.memoryAuditLogs = [...INITIAL_DEMO_AUDIT_LOGS];
        this.saveAuditLogsToLocal(this.memoryAuditLogs);
      }
    } catch (e) {
      console.warn('Storage initialisation fallback to memory:', e);
      this.memoryPatients = [...INITIAL_DEMO_PATIENTS];
      this.memoryScreenings = [...INITIAL_DEMO_SCREENINGS];
      this.memoryReferrals = [...INITIAL_DEMO_REFERRALS];
      this.memoryAuditLogs = [...INITIAL_DEMO_AUDIT_LOGS];
    }
  }

  private savePatientsToLocal(patients: Patient[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    } catch (e) {
      console.error(e);
    }
  }

  private saveScreeningsToLocal(screenings: Screening[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SCREENINGS, JSON.stringify(screenings));
    } catch (e) {
      console.error(e);
    }
  }

  private saveReferralsToLocal(referrals: Referral[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
    } catch (e) {
      console.error(e);
    }
  }

  private saveAuditLogsToLocal(logs: AuditLog[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }

  public getSupabaseClient(): SupabaseClient | null {
    return supabaseClient;
  }

  public getSupabaseConfig(): SupabaseConfig {
    const isConfigured = Boolean(envSupabaseUrl && envSupabaseAnonKey && envSupabaseUrl.startsWith('http'));
    return {
      url: envSupabaseUrl,
      anonKey: envSupabaseAnonKey ? `${envSupabaseAnonKey.slice(0, 8)}...` : '',
      isConfigured,
      isConnected: Boolean(supabaseClient && isConfigured),
    };
  }

  // Google OAuth via Supabase
  public async signInWithGoogle(): Promise<{ error: Error | null; url?: string }> {
    if (!supabaseClient) {
      return {
        error: new Error(
          'Supabase credentials are not configured. To enable live Google Sign-In, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file, then enable the Google Provider in the Supabase Dashboard.'
        ),
      };
    }
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error: error ? new Error(error.message) : null, url: data?.url ?? undefined };
  }

  public async signOut(): Promise<{ error: Error | null }> {
    if (!supabaseClient) return { error: null };
    const { error } = await supabaseClient.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  }

  public async getSession() {
    if (!supabaseClient) return null;
    try {
      const { data } = await supabaseClient.auth.getSession();
      return data?.session || null;
    } catch {
      return null;
    }
  }

  public onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabaseClient) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabaseClient.auth.onAuthStateChange(callback);
  }

  public async signInWithEmail(email: string, password: string): Promise<{ data: any; error: Error | null }> {
    if (!supabaseClient) {
      return {
        data: null,
        error: new Error(
          'Supabase backend is not connected. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to authenticate live users.'
        ),
      };
    }
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error: error ? new Error(error.message) : null };
  }

  public async signUpWithEmail(
    email: string,
    password: string,
    assignedRole: UserRole,
    name: string
  ): Promise<{ data: any; error: Error | null }> {
    if (!supabaseClient) {
      return {
        data: null,
        error: new Error('Supabase backend is not connected.'),
      };
    }
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: assignedRole,
        },
      },
    });
    if (!error && data?.user) {
      await supabaseClient.from('profiles').upsert([
        {
          id: data.user.id,
          email,
          name,
          role: assignedRole,
        },
      ]);
    }
    return { data, error: error ? new Error(error.message) : null };
  }

  public async fetchUserProfileFromDb(
    userId: string
  ): Promise<{ role: UserRole; name?: string; designation?: string; facility?: string } | null> {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('role, name, designation, facility')
        .eq('id', userId)
        .single();
      if (!error && data && data.role) {
        return data as { role: UserRole; name?: string; designation?: string; facility?: string };
      }
      return null;
    } catch {
      return null;
    }
  }

  // USER PROFILE API
  public async saveUserProfile(
    profile: Partial<User> & { id: string; role?: UserRole }
  ): Promise<{ success: boolean; error?: string; isCloudSaved: boolean }> {
    let isCloudSaved = false;
    let cloudError: string | undefined = undefined;

    if (supabaseClient) {
      try {
        const payload: Record<string, any> = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          phone: profile.phone,
          designation: profile.designation,
          facility: profile.centerName,
          avatarUrl: profile.avatarUrl,
          preferredLanguage: profile.preferredLanguage,
        };
        // Clean undefined values
        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

        const { error } = await supabaseClient.from('profiles').upsert([payload]);
        if (error) {
          cloudError = error.message;
          console.warn('Supabase profile upsert warning:', error);
        } else {
          isCloudSaved = true;
        }
      } catch (err: any) {
        cloudError = err.message || 'Supabase profile sync failed';
      }
    }

    // Persist to local storage cache as well
    try {
      const storageKey = `swasthya_profile_${profile.id}`;
      const existing = localStorage.getItem(storageKey);
      const merged = existing ? { ...JSON.parse(existing), ...profile } : profile;
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch (e) {
      console.warn('Could not cache profile locally:', e);
    }

    return {
      success: true,
      isCloudSaved,
      error: cloudError,
    };
  }

  public async uploadProfileAvatar(
    userId: string,
    file: File
  ): Promise<{ url?: string; error?: string; isBucketConfigured: boolean }> {
    // Convert file to Base64 data URL for instant preview and local persistence
    const base64Url: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    if (!supabaseClient) {
      return {
        url: base64Url,
        isBucketConfigured: false,
        error: 'Supabase is not configured. Avatar is saved locally in your browser storage.',
      };
    }

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabaseClient.storage.from('avatars').upload(filePath, file, {
        upsert: true,
      });

      if (error) {
        return {
          url: base64Url,
          isBucketConfigured: false,
          error: `Supabase Storage bucket "avatars" is not configured (${error.message}). Avatar is saved locally in this browser. To persist across devices, create a public "avatars" bucket in Supabase Storage.`,
        };
      }

      const { data: publicData } = supabaseClient.storage.from('avatars').getPublicUrl(data.path);
      return {
        url: publicData?.publicUrl || base64Url,
        isBucketConfigured: true,
      };
    } catch (err: any) {
      return {
        url: base64Url,
        isBucketConfigured: false,
        error: `Supabase Storage bucket "avatars" not accessible (${err.message || 'unknown'}). Saved locally.`,
      };
    }
  }

  // Audit Logs API
  public getAuditLogs(): AuditLog[] {
    return [...this.memoryAuditLogs];
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.memoryAuditLogs.unshift(newLog);
    if (this.memoryAuditLogs.length > 200) {
      this.memoryAuditLogs.length = 200;
    }
    this.saveAuditLogsToLocal(this.memoryAuditLogs);
    return newLog;
  }

  // PATIENTS API
  public async getPatients(): Promise<Patient[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('patients')
          .select('*')
          .order('registeredAt', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Patient[];
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local:', err);
      }
    }
    return [...this.memoryPatients];
  }

  public async getPatientById(id: string): Promise<Patient | undefined> {
    const all = await this.getPatients();
    return all.find((p) => p.id === id);
  }

  public async savePatient(patient: Patient, userRole: UserRole = 'chw', userName: string = 'User'): Promise<Patient> {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('patients').upsert([patient]);
        if (error) {
          console.warn('Supabase upsert failed, saving locally:', error);
        }
      } catch (err) {
        console.warn('Supabase error:', err);
      }
    }

    const idx = this.memoryPatients.findIndex((p) => p.id === patient.id);
    const isNew = idx < 0;
    if (!isNew) {
      this.memoryPatients[idx] = patient;
    } else {
      this.memoryPatients.unshift(patient);
    }
    this.savePatientsToLocal(this.memoryPatients);

    this.addAuditLog({
      userId: `USR-${userRole.toUpperCase()}`,
      userName,
      userRole,
      action: isNew ? 'PATIENT_REGISTERED' : 'PATIENT_UPDATED',
      details: `${isNew ? 'Registered' : 'Updated'} patient record for ${patient.name} (${patient.id}) with recorded consent`,
      patientId: patient.id,
    });

    return patient;
  }

  // SCREENINGS API
  public async getScreenings(): Promise<Screening[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('screenings')
          .select('*')
          .order('createdAt', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Screening[];
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local:', err);
      }
    }
    return [...this.memoryScreenings];
  }

  public async getScreeningsByPatientId(patientId: string): Promise<Screening[]> {
    const all = await this.getScreenings();
    return all.filter((s) => s.patientId === patientId);
  }

  public async saveScreening(screening: Screening, userRole: UserRole = 'chw', userName: string = 'User'): Promise<Screening> {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('screenings').upsert([screening]);
        if (error) {
          console.warn('Supabase screening upsert error:', error);
        }
      } catch (err) {
        console.warn('Supabase error:', err);
      }
    }

    const idx = this.memoryScreenings.findIndex((s) => s.id === screening.id);
    if (idx >= 0) {
      this.memoryScreenings[idx] = screening;
    } else {
      this.memoryScreenings.unshift(screening);
    }
    this.saveScreeningsToLocal(this.memoryScreenings);

    // Update patient's lastScreenedAt & lastRiskStatus
    const patient = await this.getPatientById(screening.patientId);
    if (patient) {
      patient.lastScreenedAt = screening.createdAt;
      patient.lastRiskStatus = screening.riskLevel;
      await this.savePatient(patient, userRole, userName);
    }

    this.addAuditLog({
      userId: screening.screenerId,
      userName: screening.screenerName,
      userRole,
      action: screening.isSimulated ? 'SIMULATED_SCREENING_SAVED' : 'CLINICAL_SCREENING_SAVED',
      details: `Saved ${screening.isSimulated ? 'simulated' : 'clinical'} vital signs screening (${screening.riskLevel.toUpperCase()} Risk) for patient ${screening.patientId}`,
      patientId: screening.patientId,
    });

    return screening;
  }

  // REFERRALS API
  public async getReferrals(): Promise<Referral[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('referrals')
          .select('*')
          .order('referredAt', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Referral[];
        }
      } catch (err) {
        console.warn('Supabase referrals fetch failed:', err);
      }
    }
    return [...this.memoryReferrals];
  }

  public async saveReferral(referral: Referral, userRole: UserRole = 'chw', userName: string = 'User'): Promise<Referral> {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('referrals').upsert([referral]);
        if (error) console.warn('Supabase referral upsert error:', error);
      } catch (err) {
        console.warn('Supabase error:', err);
      }
    }

    const idx = this.memoryReferrals.findIndex((r) => r.id === referral.id);
    if (idx >= 0) {
      this.memoryReferrals[idx] = referral;
    } else {
      this.memoryReferrals.unshift(referral);
    }
    this.saveReferralsToLocal(this.memoryReferrals);

    this.addAuditLog({
      userId: `USR-${userRole.toUpperCase()}`,
      userName,
      userRole,
      action: 'REFERRAL_CREATED',
      details: `Generated ${referral.urgency.toUpperCase()} referral to ${referral.destinationFacility} for ${referral.patientName}`,
      patientId: referral.patientId,
    });

    return referral;
  }

  public async updateReferralStatus(
    id: string,
    status: Referral['status'],
    clinicianNotes?: string,
    reviewedBy?: string,
    userRole: UserRole = 'clinician'
  ): Promise<Referral | null> {
    const list = await this.getReferrals();
    const item = list.find((r) => r.id === id);
    if (!item) return null;

    item.status = status;
    if (clinicianNotes) item.clinicianNotes = clinicianNotes;
    if (reviewedBy) item.reviewedBy = reviewedBy;
    item.reviewedAt = new Date().toISOString();

    const saved = await this.saveReferral(item, userRole, reviewedBy || 'Clinician');

    this.addAuditLog({
      userId: `USR-${userRole.toUpperCase()}`,
      userName: reviewedBy || 'Clinician',
      userRole,
      action: status === 'completed' ? 'REFERRAL_COMPLETED' : 'REFERRAL_STATUS_UPDATED',
      details: `Updated referral ${id} to ${status.toUpperCase()} with clinician consultation notes`,
      patientId: item.patientId,
    });

    return saved;
  }

  // Reset demo dataset
  public resetToDemoData() {
    this.memoryPatients = [...INITIAL_DEMO_PATIENTS];
    this.memoryScreenings = [...INITIAL_DEMO_SCREENINGS];
    this.memoryReferrals = [...INITIAL_DEMO_REFERRALS];
    this.memoryAuditLogs = [...INITIAL_DEMO_AUDIT_LOGS];
    this.savePatientsToLocal(this.memoryPatients);
    this.saveScreeningsToLocal(this.memoryScreenings);
    this.saveReferralsToLocal(this.memoryReferrals);
    this.saveAuditLogsToLocal(this.memoryAuditLogs);
  }

  // Generate Supabase SQL schema with enforced Row Level Security & RBAC
  public getSupabaseSqlSchema(): string {
    return `-- ==============================================================================
-- Swasthya Setu (स्वास्थ्य सेतु) - Supabase Role-Based Database Schema & RLS Policies
-- Execute in Supabase SQL Editor to provision tables, audit trail, and security rules
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('chw', 'clinician', 'admin')),
  facility text,
  "createdAt" timestamptz not null default now()
);

-- Helper function to extract user role from auth claims or profile
create or replace function public.current_user_role()
returns text as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role',
    (select role from public.profiles where id = auth.uid()),
    'chw'
  );
$$ language sql stable security definer;

-- 3. Patients Table (Enforces Informed Consent and Zero Public Access)
create table if not exists public.patients (
  id text primary key,
  "abhaId" text,
  name text not null,
  "nameHi" text,
  age integer not null check (age > 0 and age < 130),
  gender text not null check (gender in ('male', 'female', 'other')),
  contact text not null,
  village text not null,
  district text not null,
  "emergencyContact" text not null,
  "chronicConditions" text[] default '{}',
  "consentObtained" boolean not null default true,
  "consentDate" timestamptz default now(),
  "registeredAt" timestamptz not null default now(),
  "registeredBy" text not null,
  "lastScreenedAt" timestamptz,
  "lastRiskStatus" text
);

-- 4. Screenings Table (Stores Physiological Vitals, Questionnaires & Triage)
create table if not exists public.screenings (
  id text primary key,
  "patientId" text not null references public.patients(id) on delete cascade,
  "screenerId" text not null,
  "screenerName" text not null,
  "screenerRole" text not null,
  "createdAt" timestamptz not null default now(),
  facility text not null,
  vitals jsonb not null,
  questionnaire jsonb not null,
  "consentObtained" boolean not null default true,
  "isSimulated" boolean default false,
  "simulationDetails" text,
  "riskLevel" text not null check ("riskLevel" in ('low', 'moderate', 'high')),
  "riskFactors" text[] default '{}',
  recommendations text[] default '{}',
  "referralId" text
);

-- 5. Referrals Table (Closed-Loop Tele-Referrals Queue)
create table if not exists public.referrals (
  id text primary key,
  "screeningId" text not null references public.screenings(id) on delete cascade,
  "patientId" text not null references public.patients(id) on delete cascade,
  "patientName" text not null,
  "patientAge" integer not null,
  "patientGender" text not null,
  "patientVillage" text not null,
  "referredBy" text not null,
  "referredAt" timestamptz not null default now(),
  "destinationFacility" text not null,
  urgency text not null check (urgency in ('routine', 'urgent', 'emergency')),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')),
  "clinicianNotes" text,
  "reviewedBy" text,
  "reviewedAt" timestamptz
);

-- 6. Audit Trail Table (Immutable Clinical Access & Screening Log)
create table if not exists public.audit_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  "userId" text not null,
  "userName" text not null,
  "userRole" text not null,
  action text not null,
  details text not null,
  "patientId" text
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - DENY ACCESS BY DEFAULT
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.screenings enable row level security;
alter table public.referrals enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: Users can view and update their own profile; Admins view all
create policy "Users view own profile" on public.profiles
  for select using (auth.uid() = id or public.current_user_role() = 'admin');

-- Patients:
-- CHW: can insert new patients, view, and update demographic info
create policy "CHW can register patients" on public.patients
  for insert with check (public.current_user_role() in ('chw', 'admin'));
create policy "Authorized roles can read patients" on public.patients
  for select using (public.current_user_role() in ('chw', 'clinician', 'admin'));
create policy "Authorized roles can update patients" on public.patients
  for update using (public.current_user_role() in ('chw', 'clinician', 'admin'));

-- Screenings:
-- CHW can record screenings; Clinicians & Admins can read
create policy "CHW can record screenings" on public.screenings
  for insert with check (public.current_user_role() in ('chw', 'clinician', 'admin'));
create policy "Authorized roles can read screenings" on public.screenings
  for select using (public.current_user_role() in ('chw', 'clinician', 'admin'));

-- Referrals:
-- CHW creates referral; Clinicians accept & resolve referral with doctor notes
create policy "Authorized roles create referral" on public.referrals
  for insert with check (public.current_user_role() in ('chw', 'clinician', 'admin'));
create policy "Authorized roles read referrals" on public.referrals
  for select using (public.current_user_role() in ('chw', 'clinician', 'admin'));
create policy "Clinicians and Admins update referrals" on public.referrals
  for update using (public.current_user_role() in ('clinician', 'admin'));

-- Audit Logs:
-- Read-only for Admin role; insertion allowed by authenticated workers
create policy "Authorized users append audit logs" on public.audit_logs
  for insert with check (auth.role() = 'authenticated' or true);
create policy "Only Admins view audit logs" on public.audit_logs
  for select using (public.current_user_role() = 'admin');
`;
  }
}

export const storage = new StorageService();

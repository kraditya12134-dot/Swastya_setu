/**
 * Type definitions for Swasthya Setu (स्वास्थ्य सेतु)
 */

export type UserRole = 'chw' | 'clinician' | 'admin';

export type Language = 'en' | 'hi';

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  nameHi: string;
  role: UserRole;
  designation: string;
  designationHi: string;
  email: string;
  phone: string;
  centerName: string;
  centerNameHi: string;
  avatarUrl?: string;
  preferredLanguage?: Language;
  isGoogleAuthenticated?: boolean;
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface Patient {
  id: string;
  abhaId?: string; // Ayushman Bharat Health Account ID format: XX-XXXX-XXXX-XXXX
  name: string;
  nameHi?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  village: string;
  district: string;
  emergencyContact: string;
  chronicConditions: string[];
  consentObtained: boolean;
  consentDate?: string;
  registeredAt: string;
  registeredBy: string;
  lastScreenedAt?: string;
  lastRiskStatus?: RiskLevel;
  wardOrBlock?: string;
  state?: string;
  pincode?: string;
  allergies?: string[];
  currentMedications?: string;
  communicationPreference?: 'sms' | 'call' | 'visit';
  privacyNoticeAcknowledged?: boolean;
  pastSurgeries?: string;
  familyHistory?: string;
  lifestyleHabits?: string[];
  baselineScreeningNotes?: string;
  preferredFacility?: string;
  followUpIntervalMonths?: number;
  referralNotes?: string;
}

export interface Hospital {
  id: string;
  name: string;
  nameHi?: string;
  lat: number;
  lon: number;
  type?: string; // hospital, clinic, primary_health_centre
  address?: string;
  distanceKm?: number;
  phone?: string;
  emergency?: string;
  operator?: string;
  beds?: string;
  website?: string;
  osmUrl?: string;
}

export interface Vitals {
  heartRate: number; // BPM (40 - 220)
  spo2: number; // % (70 - 100)
  temperature: number; // °F (94 - 106)
  tempUnit: 'F' | 'C';
  systolic: number; // mmHg (70 - 260)
  diastolic: number; // mmHg (40 - 160)
  height: number; // cm (50 - 250)
  weight: number; // kg (10 - 250)
  bmi?: number;
  bmiCategory?: string;
  bpClassification?: string;
}

export interface Questionnaire {
  chestPain: boolean;
  shortnessOfBreath: boolean;
  dizziness: boolean;
  feverDuration: 'none' | '1-2 days' | '3+ days';
  coughDuration: 'none' | '1-2 weeks' | '2+ weeks';
  diabetesHistory: boolean;
  hypertensionHistory: boolean;
  tobaccoUse: boolean;
  alcoholUse: boolean;
  currentMedications: string;
  notes: string;
}

export interface Screening {
  id: string;
  patientId: string;
  screenerId: string;
  screenerName: string;
  screenerRole: UserRole;
  createdAt: string;
  facility: string;
  vitals: Vitals;
  questionnaire: Questionnaire;
  consentObtained: boolean;
  isSimulated: boolean;
  simulationDetails?: string;
  riskLevel: RiskLevel;
  riskFactors: string[];
  recommendations: string[];
  referralId?: string;
}

export type ReferralUrgency = 'routine' | 'urgent' | 'emergency';
export type ReferralStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface Referral {
  id: string;
  screeningId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientVillage: string;
  referredBy: string;
  referredAt: string;
  destinationFacility: string;
  urgency: ReferralUrgency;
  reason: string;
  status: ReferralStatus;
  clinicianNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  patientId?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  isConnected: boolean;
  lastChecked?: string;
}

export type DashboardTab = 'overview' | 'patients' | 'referrals' | 'analytics' | 'hospitals' | 'settings' | 'safety' | 'profile';

# Swasthya Setu (स्वास्थ्य सेतु)
### “Bridging Communities to Better Health”

A frontline healthcare screening-support platform engineered for Community Health Workers (ASHAs), Primary Health Centre Clinicians, and Health Administrators.

---

## ⚕️ Medical Responsibility Notice & Safety Guidelines

**IMPORTANT:** Swasthya Setu is an assistive clinical decision-support and screening-triage prototype, **not a certified diagnostic medical device**. It does not provide medical diagnoses, prescriptions, or autonomous emergency dispatch. All vital signs, risk stratification recommendations, and simulated readings require clinical interpretation and diagnostic validation by a qualified medical practitioner using calibrated diagnostic instruments.

### Core Safety & Responsible-Use Mandates:
1. **Screening-Support Prototype**: Clearly disclaimed across landing pages, dashboards, screening workflows, and printable reports.
2. **Clinical Validation Required**: Screening recommendations never substitute for clinical acumen or physician judgment.
3. **Transparent Simulation**: All synthetic vitals feeds are prominently branded as **"DEMO / SIMULATED"** to prevent clinical confusion.
4. **Mandatory Informed Consent**: Patient registration and screening procedures require active, documented informed consent.
5. **Data Minimization & PII Protection**: Only essential health triage markers are gathered; patient data is protected behind authenticated RBAC boundaries.
6. **No Public PII Exposure**: Patient identifiers, phone numbers, and screening logs are never exposed in public views.
7. **Evidence-Based Referral Guidance**: Standardized WHO/AHA triage rules without invented thresholds or fabricated clinical certs.
8. **Synthetic Demo Data**: Pre-seeded demo cases use synthetic personas exclusively; real-world patient records are prohibited in demonstration environments.

A full **Safety & Responsible Use Guidelines** view is accessible directly in the platform navigation.

---

## 🌟 Key Features

1. **Role-Based Workspaces & Access Control (RBAC)**:
   - **Community Health Worker (CHW / ASHA)**: Rapid village patient registration with mandatory consent, multi-vital physiological capture, simulated sensor readings, WHO Asian-Indian BMI calculation, standardized risk stratification, and automatic referral creation. Access restricted to authorized triage records.
   - **Clinician / Medical Officer (Doctor)**: Inbound tele-referral queue management, triage urgency prioritization, patient clinical history review, and consultation note resolution.
   - **Health Administrator**: Population vitals analytics, hypertension and BMI distribution, village registry coverage, referral closure metrics, and immutable audit logs.
   - **Frontend & Backend Access Enforcement**: Unauthorized dashboard tabs are blocked and hidden based on the active role; Supabase Row Level Security (RLS) policies enforce permission boundaries in PostgreSQL.

2. **Physiological Screening Form**:
   - Heart Rate (BPM)
   - Blood Oxygen Saturation (SpO2 %)
   - Body Temperature (°F / °C toggle)
   - Height (cm) & Weight (kg) with **automatic WHO Asian-Indian BMI calculation**
   - Manually entered Blood Pressure (Systolic & Diastolic mmHg) with **real-time AHA/JNC classification**
   - Symptom & Risk Questionnaire (acute chest pain, dyspnea, fever duration, chronic cough >2 weeks, diabetes/HTN history, tobacco usage)
   - Real-time rule-based Risk Stratification (Low, Moderate, High) with clinical protocol recommendations.

3. **Simulated Sensor Readings**:
   - Interactive simulation mode for field sensor training: Normal, Pre-HTN / Borderline, and Urgent Triage packets.
   - Clearly labeled with disclaimer badges to avoid diagnostic confusion.

4. **Printable Medical Screening Reports**:
   - Clean, standardized paper/PDF print layout (`window.print()`).
   - Includes patient demographics, consent timestamp, vitals summary, triage classification, referral notes, and doctor/screener signature blocks.

5. **Theme Switching (Light / Dark Mode)**:
   - Global persistent theme toggle across the public landing page and application dashboard.
   - Accessible contrast compliant with WCAG guidelines.

6. **User Profile Section**:
   - Accessible directly from the top avatar pill, sidebar navigation, and persona card.
   - Profile picture upload with live preview, change, and remove actions.
   - Editable full name (English & Devanagari), validated 10-digit phone, designation, health center, and interface language.
   - Read-only email display and locked role governance (only Admin can reassign user roles).
   - Real-time save, validation feedback, and Supabase profiles persistence with offline browser caching fallback. Explains storage configuration if the `avatars` bucket is unconfigured.

7. **Block-wise Progressive Patient Registry**:
   - Numbered 5-block registration wizard with visual progress bar and Back/Next navigation:
     1. **Basic Details**: Full name, Hindi name, age, gender, and optional 14-digit ABHA ID.
     2. **Contact & Address**: Phone number, emergency contact, village, ward/block, district, state, and pincode.
     3. **Health & Medical History**: Chronic conditions picker, drug allergies, current medications, and medical history.
     4. **Consent & Privacy**: Mandatory informed patient consent verification, consent date, communication mode (SMS / Call / ASHA Home Visit), and privacy protocol acknowledgment.
     5. **Review & Submit**: Organized summary cards with direct block-edit shortcuts, duplicate record prevention check, and optional immediate screening launch.

8. **Animated Dashboard Graphs & Trends**:
   - Smooth, accessible animated visualizations respecting reduced-motion preferences.
   - Dynamic interactive filters: Time horizon (All Time, 30 Days, 7 Days), Village selector, and Risk Level filter.
   - Animated timeline bar charts depicting frontline screening cadence.
   - Referral closed-loop resolution funnels (Pending, Accepted, Completed) and triage urgency strips.
   - Animated population distribution progress bars for AHA Blood Pressure categories and WHO Asian-Indian BMI cutoffs.
   - Real data driven from stored records with transparent "DEMO / SYNTHETIC DATA" labelling and clean empty states.

9. **Nearby Referral Hospitals Map (OpenStreetMap & Overpass API)**:
   - Interactive map powered by Leaflet and OpenStreetMap tiles.
   - Explicit browser geolocation permission flow ("Use My GPS Location") with pulsing location marker.
   - Manual search bar with OpenStreetMap Nominatim geocoding to explore any Indian district or town (e.g., Bilaspur, Pipariya, Bhopal, Raipur, Delhi).
   - Real places-data retrieved dynamically via the Overpass API public registry (querying hospitals and community clinics within a 25km radius).
   - Displays verified facility data only (name, distance, type, emergency status, address, phone) without fabrication.
   - Synchronized hospital directory list with interactive map markers, zoom-to-facility, and external Google Maps / OpenStreetMap turn-by-turn directions.
   - Prominent clinical responsibility disclaimer emphasizing non-autonomous prototype scope and emergency hotline contact (108 / 112).

10. **Bilingual Support (English / हिन्दी)**:
    - Complete dictionary translations across public website, dashboard, forms, vitals, and reports.

11. **Google Authentication & Supabase Cloud Integration**:
    - Live Google OAuth integration via Supabase Auth (`supabase.auth.signInWithOAuth({ provider: 'google' })`).
    - Active session card with Google avatar, email, and user ID.
    - Step-by-step setup modal with copyable callback URI (`https://<project-ref>.supabase.co/auth/v1/callback`).
    - Offline fallback mode: works smoothly without credentials using local storage. Never fakes cloud auth when unconfigured.

---

## 🔐 Google Cloud OAuth & Supabase Setup Guide

To enable live Google Sign-In:

### Step 1: Create Google Cloud OAuth 2.0 Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Click **Create Credentials** -> **OAuth Client ID**.
3. Select Application type: **Web application**.
4. In **Authorized redirect URIs**, add your Supabase project callback URI:
   ```text
   https://<your-supabase-project-id>.supabase.co/auth/v1/callback
   ```
5. Click **Create** and copy your **Client ID** and **Client Secret**.

### Step 2: Configure Supabase Auth Provider
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> Select your project -> **Authentication** -> **Providers**.
2. Find **Google** and toggle it **Enabled**.
3. Paste the **Client ID** and **Client Secret** obtained in Step 1.
4. Save changes.

### Step 3: Configure Environment Variables
In your local `.env` file (copied from `.env.example`):
```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

---

## 💻 Local Setup in VS Code

### 1. Prerequisites
- **Node.js**: v18 or later
- **npm**: v9 or later

### 2. Installation
```bash
git clone <repository-url>
cd swasthya-setu
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

If left blank, the app will run in **Offline Demo Storage Mode** using browser persistence and 6 synthetic field patients.

### 4. Supabase Database Schema (If using Supabase)
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Go to the app's **Settings & Database** tab and click **"Copy SQL Schema"** (or inspect `storage.getSupabaseSqlSchema()`).
3. Run the SQL script to create `patients`, `screenings`, `referrals`, `profiles`, and `audit_logs` tables with complete Row Level Security (RLS).

### 5. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Building for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
swasthya-setu/
├── src/
│   ├── assets/
│   │   └── images/                 # Verified generated documentary medical imagery
│   ├── components/
│   │   ├── common/
│   │   │   ├── GoogleAuthModal.tsx # Live Google Sign-In & credential setup guide
│   │   │   └── MedicalDisclaimerBanner.tsx
│   │   ├── dashboard/
│   │   │   ├── AccessDeniedView.tsx    # Role-based 403 boundary guard
│   │   │   ├── AnalyticsView.tsx       # Population vitals & triage distribution
│   │   │   ├── OverviewView.tsx        # Frontline KPI cards & recent activities
│   │   │   ├── PatientDetailView.tsx   # Detailed vitals history & consent state
│   │   │   ├── PatientListView.tsx     # Searchable village patient directory
│   │   │   ├── PatientRegistrationModal.tsx # Consent-enforced patient registration
│   │   │   ├── PrintableReportModal.tsx     # A4 standardized screening report
│   │   │   ├── ReferralsView.tsx       # Triage queue & clinician consultation notes
│   │   │   ├── SafetyGuidelinesView.tsx # 8 clinical safety & responsible use rules
│   │   │   ├── ScreeningFormModal.tsx  # Multi-vital capture & simulation mode
│   │   │   └── SettingsView.tsx        # System settings, RLS schema, audit logs
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx     # Role-gated sidebar, theme switch, user profile
│   │   │   └── Navbar.tsx              # Public header with theme & auth modal triggers
│   │   └── public/
│   │       └── LandingPage.tsx         # Dark navy/teal public website & workflow
│   ├── context/
│   │   └── AppContext.tsx          # Global state, theme, language, auth, RBAC
│   ├── services/
│   │   └── storage.ts              # Supabase PostgreSQL + local demo fallback engine
│   ├── types/
│   │   └── index.ts                # TypeScript domain models, consent, and audit logs
│   ├── utils/
│   │   ├── clinicalCalculations.ts # BMI, BP, & Risk evaluation
│   │   └── i18n.ts                 # English / Hindi translation library
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── metadata.json
├── package.json
└── README.md
```

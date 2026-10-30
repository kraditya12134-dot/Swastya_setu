/**
 * Internationalization (English / Hindi) dictionary for Swasthya Setu
 */

export const translations = {
  en: {
    // Brand & Header
    brandName: 'Swasthya Setu',
    brandTagline: 'Bridging Communities to Better Health',
    navFeatures: 'Platform Capabilities',
    navWorkflow: 'Frontline Workflow',
    navAbout: 'About Initiative',
    navSafety: 'Safety & Responsible Use',
    navDisclaimer: 'Medical Disclaimer',
    launchApp: 'Launch Platform',
    backToHome: 'Back to Overview',
    googleSignIn: 'Google Sign-In',

    // Roles
    roleCHW: 'Community Health Worker',
    roleClinician: 'Clinician / Medical Officer',
    roleAdmin: 'Health Administrator',
    switchRole: 'Switch Role',

    // Dashboard Navigation
    menuOverview: 'Dashboard',
    menuPatients: 'Patient Registry',
    menuNewScreening: 'New Screening',
    menuReferrals: 'Referral Queue',
    menuAnalytics: 'Community Analytics',
    menuHospitals: 'Nearby Hospitals',
    menuSettings: 'Settings & Database',
    menuSafety: 'Safety Guidelines',
    menuProfile: 'User Profile',
    menuLogout: 'Exit to Portal',

    // Metric Cards
    totalPatients: 'Registered Patients',
    totalScreened: 'Completed Screenings',
    highRiskCases: 'High Risk / Triage Flags',
    pendingReferrals: 'Pending Referrals',
    todayScreenings: 'Today’s Screenings',
    normalBmiRate: 'Optimal BMI Population',

    // Vitals
    heartRate: 'Heart Rate',
    spo2: 'SpO2 Oxygen Saturation',
    temperature: 'Body Temperature',
    bloodPressure: 'Blood Pressure',
    systolic: 'Systolic (mmHg)',
    diastolic: 'Diastolic (mmHg)',
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    bmi: 'Calculated BMI',
    bmiCategory: 'WHO Category',
    bpStatus: 'BP Classification',

    // Screening Form
    screeningTitle: 'Frontline Digital Health Screening',
    screeningSubtitle: 'Non-invasive vitals capture, symptom questionnaire, and standardized triage support',
    simulateSensors: 'Simulate Field Sensor Readings',
    simulateSensorsHelp: 'Generates realistic demo vitals for field workflow testing and training.',
    simulatedNotice: 'DEMO / SIMULATED SENSOR MODE — For field testing and training only. Clinical validation required.',
    saveScreening: 'Save & Stratify Risk',
    createReferralCheckbox: 'Generate automated referral for clinical consultation',
    consentCheck: 'Informed verbal / written consent confirmed from patient for vitals screening and triage referral',

    // Questionnaire
    questionnaireTitle: 'Clinical Symptom & Risk Questionnaire',
    symptomChestPain: 'Chest pain or discomfort in the last 48 hours',
    symptomShortnessOfBreath: 'Shortness of breath at rest or during minimal exertion',
    symptomDizziness: 'Episodes of severe dizziness, fainting, or lightheadedness',
    feverDuration: 'Fever Duration',
    coughDuration: 'Cough Duration',
    diabetesHistory: 'Diagnosed Diabetes History',
    hypertensionHistory: 'Diagnosed Hypertension History',
    tobaccoUse: 'Tobacco / Beedi Consumption',
    alcoholUse: 'Alcohol Consumption',
    currentMeds: 'Current Prescriptions / Medications',
    notesPlaceholder: 'Observations, family history, or specific complaints...',

    // Patient Form
    registerPatient: 'Register New Patient',
    patientName: 'Full Name',
    abhaNumber: 'ABHA / Health ID (Optional)',
    age: 'Age (Years)',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    contactNumber: 'Primary Phone Number',
    villageLocality: 'Village / Ward / Locality',
    district: 'District / Block',
    emergencyContact: 'Emergency Contact Person & Phone',
    chronicConditions: 'Known Pre-existing Chronic Conditions',
    savePatient: 'Complete Registration',
    consentPatient: 'I confirm that informed consent was obtained prior to capturing personal health demographics',

    // Triage & Risks
    riskLow: 'Low Risk',
    riskModerate: 'Moderate Risk',
    riskHigh: 'High Risk / Immediate Attention',
    riskFactorsIdentified: 'Key Screening Risk Indicators',
    clinicalRecommendations: 'Next-Step Clinical Protocol',

    // Referrals
    referralCenter: 'Destination Health Facility',
    referralUrgency: 'Referral Urgency',
    urgencyRoutine: 'Routine (Within 7 Days)',
    urgencyUrgent: 'Urgent (Within 24–48 Hours)',
    urgencyEmergency: 'Emergency / Immediate Transfer',
    referralStatus: 'Status',
    statusPending: 'Pending Doctor Review',
    statusAccepted: 'Accepted by Facility',
    statusCompleted: 'Consultation Completed',
    clinicianNotes: 'Clinical Review & Action Notes',
    acceptReferral: 'Accept Patient',
    markCompleted: 'Mark Consult Completed',

    // Database Status
    supabaseConnected: 'Supabase Cloud Connected',
    supabaseLocalDemo: 'Local Offline Demo Mode',
    supabaseHelpText: 'Persistent database sync requires Supabase credentials in .env. Currently using local browser storage.',

    // Disclaimer
    medicalDisclaimerTitle: 'Medical Screening Prototype Notice',
    medicalDisclaimerText: 'Swasthya Setu is an assistive clinical decision-support and field screening prototype, not an autonomous diagnostic medical device. It does not provide definitive medical diagnoses, drug prescriptions, or regulatory certifications. All vitals, automated alert categorizations, and simulated sensor readings require clinical evaluation and diagnostic verification by a registered healthcare practitioner using calibrated medical instruments.',
  },

  hi: {
    // Brand & Header
    brandName: 'स्वास्थ्य सेतु',
    brandTagline: 'समुदाय को बेहतर स्वास्थ्य से जोड़ना',
    navFeatures: 'मंच की सुविधाएं',
    navWorkflow: 'कार्यप्रणाली',
    navAbout: 'परियोजना के बारे में',
    navSafety: 'सुरक्षा एवं दिशानिर्देश',
    navDisclaimer: 'चिकित्सा अस्वीकरण',
    launchApp: 'मंच प्रारंभ करें',
    backToHome: 'मुख्य पृष्ठ पर लौटें',
    googleSignIn: 'गूगल साइन-इन',

    // Roles
    roleCHW: 'सामुदायिक स्वास्थ्य कार्यकर्ता (आशा/कार्यकर्ता)',
    roleClinician: 'चिकित्सक / चिकित्सा अधिकारी',
    roleAdmin: 'स्वास्थ्य प्रशासक',
    switchRole: 'भूमिका बदलें',

    // Dashboard Navigation
    menuOverview: 'डैशबोर्ड अवलोकन',
    menuPatients: 'मरीज पंजिका',
    menuNewScreening: 'नई स्वास्थ्य जांच',
    menuReferrals: 'रेफरल सूची',
    menuAnalytics: 'सामुदायिक आंकड़े',
    menuHospitals: 'निकटतम अस्पताल',
    menuSettings: 'सेटिंग्स व डेटाबेस',
    menuSafety: 'सुरक्षा नियम',
    menuProfile: 'मेरी प्रोफ़ाइल',
    menuLogout: 'पोर्टल से बाहर निकलें',

    // Metric Cards
    totalPatients: 'कुल पंजीकृत मरीज',
    totalScreened: 'पूर्ण जांचें',
    highRiskCases: 'उच्च जोखिम मामले',
    pendingReferrals: 'लंबित रेफरल',
    todayScreenings: 'आज की स्वास्थ्य जांचें',
    normalBmiRate: 'सामान्य बीएमआई दर',

    // Vitals
    heartRate: 'हृदय गति (Heart Rate)',
    spo2: 'ऑक्सीजन संतृप्ति (SpO2)',
    temperature: 'शरीर का तापमान',
    bloodPressure: 'रक्तचाप (Blood Pressure)',
    systolic: 'सिस्टोलिक (Systolic mmHg)',
    diastolic: 'डायस्टोलिक (Diastolic mmHg)',
    height: 'ऊंचाई (सेमी)',
    weight: 'वजन (किग्रा)',
    bmi: 'आंकलित बीएमआई (BMI)',
    bmiCategory: 'डब्ल्यूएचओ श्रेणी',
    bpStatus: 'रक्तचाप स्थिति',

    // Screening Form
    screeningTitle: 'डिजिटल स्वास्थ्य स्क्रीनिंग',
    screeningSubtitle: 'सटीक स्वास्थ्य संकेतकों की जांच, लक्षण प्रश्नावली और त्वरित जोखिम वर्गीकरण',
    simulateSensors: 'सेंसर रीडिंग सिमुलेट करें',
    simulateSensorsHelp: 'प्रशिक्षण और फील्ड परीक्षण के लिए वास्तविक नमूना डेटा उत्पन्न करता है।',
    simulatedNotice: 'डेमो / सिम्युलेटेड सेंसर मोड — केवल परीक्षण और प्रशिक्षण हेतु। वास्तविक चिकित्सीय सत्यापन अनिवार्य है।',
    saveScreening: 'जांच सहेजें व जोखिम तय करें',
    createReferralCheckbox: 'डॉक्टर से परामर्श हेतु स्वचालित रेफरल बनाएं',
    consentCheck: 'स्वास्थ्य जांच और टेली-रेफरल हेतु मरीज की पूर्व सूचित सहमति प्राप्त एवं सत्यापित की गई',

    // Questionnaire
    questionnaireTitle: 'लक्षण व स्वास्थ्य इतिहास प्रश्नावली',
    symptomChestPain: 'पिछले 48 घंटों में सीने में दर्द या भारीपन',
    symptomShortnessOfBreath: 'बैठे रहने या थोड़ा चलने पर सांस फूलना',
    symptomDizziness: 'गंभीर चक्कर आना या बेहोशी',
    feverDuration: 'बुखार की अवधि',
    coughDuration: 'खांसी की अवधि',
    diabetesHistory: 'मधुमेह (शुगर) का पूर्व इतिहास',
    hypertensionHistory: 'उच्च रक्तचाप (बीपी) का इतिहास',
    tobaccoUse: 'तंबाकू/बीड़ी का सेवन',
    alcoholUse: 'शराब का सेवन',
    currentMeds: 'वर्तमान दवाइयां',
    notesPlaceholder: 'अन्य लक्षण, पारिवारिक इतिहास या टिप्पणी...',

    // Patient Form
    registerPatient: 'नया मरीज पंजीकृत करें',
    patientName: 'मरीज का पूरा नाम',
    abhaNumber: 'आभा / स्वास्थ्य पहचान संख्या (वैकल्पिक)',
    age: 'आयु (वर्ष)',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    contactNumber: 'मोबाइल नंबर',
    villageLocality: 'गांव / वार्ड / मोहल्ला',
    district: 'जिला / ब्लॉक',
    emergencyContact: 'आपातकालीन संपर्क व्यक्ति व फोन',
    chronicConditions: 'पूर्व पुरानी बीमारियां',
    savePatient: 'पंजीकरण पूरा करें',
    consentPatient: 'मैं पुष्टि करता/करती हूँ कि व्यक्तिगत स्वास्थ्य विवरण दर्ज करने से पूर्व मरीज की सहमति प्राप्त की गई है',

    // Triage & Risks
    riskLow: 'सामान्य / कम जोखिम',
    riskModerate: 'मध्यम जोखिम (जांच अपेक्षित)',
    riskHigh: 'उच्च जोखिम (तत्काल डॉक्टर परामर्श)',
    riskFactorsIdentified: 'चिह्नित जोखिम कारक',
    clinicalRecommendations: 'अनुशंसित चिकित्सीय कदम',

    // Referrals
    referralCenter: 'रेफरल स्वास्थ्य केंद्र',
    referralUrgency: 'रेफरल प्राथमिकता',
    urgencyRoutine: 'सामान्य (7 दिनों में)',
    urgencyUrgent: 'आवश्यक (24-48 घंटों में)',
    urgencyEmergency: 'आपातकालीन (तत्काल स्थानांतरण)',
    referralStatus: 'स्थिति',
    statusPending: 'डॉक्टर की समीक्षा लंबित',
    statusAccepted: 'अस्पताल द्वारा स्वीकृत',
    statusCompleted: 'परामर्श पूर्ण',
    clinicianNotes: 'डॉक्टर की टिप्पणी व उपचार निर्देश',
    acceptReferral: 'मरीज स्वीकार करें',
    markCompleted: 'परामर्श पूर्ण चिह्नित करें',

    // Database Status
    supabaseConnected: 'सुपाबेस क्लाउड कनेक्टेड',
    supabaseLocalDemo: 'ऑफ़लाइन लोकल डेमो मोड',
    supabaseHelpText: 'क्लाउड सिंक के लिए .env में Supabase क्रेडेंशियल आवश्यक हैं। वर्तमान में स्थानीय स्टोरेज उपयोग में है।',

    // Disclaimer
    medicalDisclaimerTitle: 'चिकित्सा स्क्रीनिंग प्रोटोटाइप सूचना',
    medicalDisclaimerText: 'स्वास्थ्य सेतु एक प्राथमिक स्वास्थ्य स्क्रीनिंग और नैदानिक निर्णय-सहायता प्रोटोटाइप है, कोई स्वायत्त चिकित्सीय जांच उपकरण नहीं। यह कोई अंतिम चिकित्सीय निदान, दवा पर्चा या विनियामक प्रमाणीकरण प्रदान नहीं करता। सभी स्वास्थ्य संकेतकों और कृत्रिम रीडिंग्स का पंजीकृत डॉक्टर द्वारा प्रमाणित उपकरणों से पुनः परीक्षण अनिवार्य है।',
  },
};

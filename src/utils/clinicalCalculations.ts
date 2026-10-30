/**
 * Clinical calculations and screening evaluation logic for Swasthya Setu.
 * 
 * DISCLAIMER: This logic supports frontline screening triage and prioritisation.
 * It is not a diagnostic device and does not substitute for qualified clinical examination.
 */

import { Vitals, Questionnaire, RiskLevel } from '../types';

export interface BmiResult {
  bmi: number;
  category: string;
  categoryHi: string;
  colorClass: string;
}

export function calculateBmi(heightCm: number, weightKg: number): BmiResult | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  // WHO Asian-Indian BMI cutoff standards
  if (bmi < 18.5) {
    return {
      bmi,
      category: 'Underweight',
      categoryHi: 'कम वजन (Underweight)',
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    };
  } else if (bmi < 23.0) {
    return {
      bmi,
      category: 'Normal Weight',
      categoryHi: 'सामान्य वजन (Normal)',
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    };
  } else if (bmi < 25.0) {
    return {
      bmi,
      category: 'Overweight (Borderline)',
      categoryHi: 'सीमांत अधिक वजन (Overweight)',
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    };
  } else if (bmi < 30.0) {
    return {
      bmi,
      category: 'Pre-Obese',
      categoryHi: 'पूर्व-मोटापा (Pre-Obese)',
      colorClass: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
    };
  } else {
    return {
      bmi,
      category: 'Obese',
      categoryHi: 'मोटापा (Obese)',
      colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    };
  }
}

export interface BpClassification {
  category: string;
  categoryHi: string;
  isHypertensive: boolean;
  severity: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  colorClass: string;
}

export function classifyBloodPressure(systolic: number, diastolic: number): BpClassification | null {
  // If either measurement is 0 or unrecorded, never classify as Normal BP
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    return null;
  }

  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'Hypertensive Crisis',
      categoryHi: 'अति-गंभीर रक्तचाप (Crisis - तुरंत डॉक्टर देखें)',
      isHypertensive: true,
      severity: 'crisis',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'Stage 2 Hypertension',
      categoryHi: 'स्टेज 2 उच्च रक्तचाप (Stage 2 HTN)',
      isHypertensive: true,
      severity: 'stage2',
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'Stage 1 Hypertension',
      categoryHi: 'स्टेज 1 उच्च रक्तचाप (Stage 1 HTN)',
      isHypertensive: true,
      severity: 'stage1',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'Elevated BP',
      categoryHi: 'बढ़ा हुआ रक्तचाप (Elevated)',
      isHypertensive: false,
      severity: 'elevated',
      colorClass: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    };
  }
  return {
    category: 'Normal BP',
    categoryHi: 'सामान्य रक्तचाप (Normal)',
    isHypertensive: false,
    severity: 'normal',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
  };
}

export interface ScreeningEvaluation {
  riskLevel: RiskLevel;
  riskFactors: string[];
  riskFactorsHi: string[];
  recommendations: string[];
  recommendationsHi: string[];
  requiresDoctorReferral: boolean;
  referralUrgency: 'routine' | 'urgent' | 'emergency';
}

export function evaluateScreeningRisk(
  vitals: Vitals,
  questionnaire: Questionnaire
): ScreeningEvaluation {
  const riskFactors: string[] = [];
  const riskFactorsHi: string[] = [];
  const recommendations: string[] = [];
  const recommendationsHi: string[] = [];

  let hasEmergency = false;
  let hasUrgent = false;

  // 1. SpO2 Check
  if (vitals.spo2 > 0) {
    if (vitals.spo2 < 90) {
      riskFactors.push(`Critical SpO2 reading (${vitals.spo2}%) indicates severe hypoxemia risk`);
      riskFactorsHi.push(`ऑक्सीजन स्तर बहुत कम (${vitals.spo2}%) - हाइपोक्सिमिया का जोखिम`);
      hasEmergency = true;
    } else if (vitals.spo2 < 94) {
      riskFactors.push(`Borderline low SpO2 reading (${vitals.spo2}%)`);
      riskFactorsHi.push(`सीमांत कम ऑक्सीजन स्तर (${vitals.spo2}%)`);
      hasUrgent = true;
    }
  }

  // 2. Blood Pressure Check
  if (vitals.systolic > 0 && vitals.diastolic > 0) {
    const bpClass = classifyBloodPressure(vitals.systolic, vitals.diastolic);
    if (bpClass) {
      if (bpClass.severity === 'crisis') {
        riskFactors.push(`Severe blood pressure elevation (${vitals.systolic}/${vitals.diastolic} mmHg)`);
        riskFactorsHi.push(`अति-गंभीर उच्च रक्तचाप (${vitals.systolic}/${vitals.diastolic} mmHg)`);
        hasEmergency = true;
      } else if (bpClass.severity === 'stage2') {
        riskFactors.push(`Stage 2 Hypertension (${vitals.systolic}/${vitals.diastolic} mmHg)`);
        riskFactorsHi.push(`स्टेज 2 उच्च रक्तचाप (${vitals.systolic}/${vitals.diastolic} mmHg)`);
        hasUrgent = true;
      } else if (bpClass.severity === 'stage1') {
        riskFactors.push(`Stage 1 Hypertension (${vitals.systolic}/${vitals.diastolic} mmHg)`);
        riskFactorsHi.push(`स्टेज 1 उच्च रक्तचाप (${vitals.systolic}/${vitals.diastolic} mmHg)`);
      }
    }
  }

  // 3. Heart Rate Check
  if (vitals.heartRate > 0) {
    if (vitals.heartRate > 120) {
      riskFactors.push(`Marked tachycardia (${vitals.heartRate} BPM)`);
      riskFactorsHi.push(`अत्यधिक तेज हृदय गति (${vitals.heartRate} BPM)`);
      hasUrgent = true;
    } else if (vitals.heartRate < 50) {
      riskFactors.push(`Marked bradycardia (${vitals.heartRate} BPM)`);
      riskFactorsHi.push(`अत्यधिक धीमी हृदय गति (${vitals.heartRate} BPM)`);
      hasUrgent = true;
    }
  }

  // 4. Body Temperature (Only evaluate when recorded > 0)
  if (vitals.temperature > 0) {
    const tempF = vitals.tempUnit === 'C' ? (vitals.temperature * 9) / 5 + 32 : vitals.temperature;
    if (tempF >= 102.5) {
      riskFactors.push(`High fever detected (${vitals.temperature}°${vitals.tempUnit})`);
      riskFactorsHi.push(`तेज बुखार दर्ज (${vitals.temperature}°${vitals.tempUnit})`);
      hasUrgent = true;
    } else if (tempF >= 100.4) {
      riskFactors.push(`Febrile state (${vitals.temperature}°${vitals.tempUnit})`);
      riskFactorsHi.push(`हल्का बुखार दर्ज (${vitals.temperature}°${vitals.tempUnit})`);
    }
  }

  // 5. BMI Check
  const bmiRes = calculateBmi(vitals.height, vitals.weight);
  if (bmiRes) {
    if (bmiRes.bmi >= 30) {
      riskFactors.push(`High BMI category (${bmiRes.bmi} kg/m² - Obese)`);
      riskFactorsHi.push(`अधिक बीएमआई (${bmiRes.bmi} - मोटापा श्रेणी)`);
    } else if (bmiRes.bmi < 16.5) {
      riskFactors.push(`Severe underweight (${bmiRes.bmi} kg/m²)`);
      riskFactorsHi.push(`गंभीर कम वजन (${bmiRes.bmi} kg/m²)`);
    }
  }

  // 6. Clinical Questionnaire Flags
  if (questionnaire.chestPain) {
    riskFactors.push('Reported acute chest pain / discomfort');
    riskFactorsHi.push('सीने में दर्द या बेचैनी की शिकायत');
    hasEmergency = true;
  }
  if (questionnaire.shortnessOfBreath) {
    riskFactors.push('Reported shortness of breath at rest or mild exertion');
    riskFactorsHi.push('सांस फूलने की शिकायत');
    hasUrgent = true;
  }
  if (questionnaire.coughDuration === '2+ weeks') {
    riskFactors.push('Persistent cough lasting more than 2 weeks (presumptive TB protocol)');
    riskFactorsHi.push('2 सप्ताह से अधिक समय से खांसी (टीबी स्क्रीनिंग आवश्यक)');
    hasUrgent = true;
  }
  if (questionnaire.feverDuration === '3+ days') {
    riskFactors.push('Prolonged fever lasting 3 or more days');
    riskFactorsHi.push('3 या अधिक दिनों से लगातार बुखार');
  }
  if (questionnaire.diabetesHistory && questionnaire.hypertensionHistory) {
    riskFactors.push('Co-morbid history of both diabetes and hypertension');
    riskFactorsHi.push('मधुमेह और उच्च रक्तचाप दोनों का पूर्व इतिहास');
  }

  // Assign overall risk level
  let riskLevel: RiskLevel = 'low';
  let referralUrgency: 'routine' | 'urgent' | 'emergency' = 'routine';

  if (hasEmergency) {
    riskLevel = 'high';
    referralUrgency = 'emergency';
    recommendations.push('Immediate medical evaluation required at Primary Health Centre (PHC) or Civil Hospital');
    recommendations.push('Do not delay clinical care; keep patient comfortable and monitor vitals closely');
    recommendationsHi.push('प्राथमिक स्वास्थ्य केंद्र (PHC) या सिविल अस्पताल में तत्काल डॉक्टर से जांच कराएं');
    recommendationsHi.push('मरीज को आराम से बैठाएं और लगातार निगरानी रखें');
  } else if (hasUrgent || riskFactors.length >= 2) {
    riskLevel = 'moderate';
    referralUrgency = 'urgent';
    recommendations.push('Schedule clinician review within 24–48 hours for diagnostic verification');
    recommendations.push('Advise dietary salt reduction, hydration, and medication compliance check');
    recommendationsHi.push('24-48 घंटों के भीतर चिकित्सा अधिकारी से परामर्श की सलाह दें');
    recommendationsHi.push('दवाओं का नियमित सेवन और खानपान में एहतियात बरतें');
  } else {
    riskLevel = 'low';
    referralUrgency = 'routine';
    const hasAnyVitals = (vitals.heartRate > 0) || (vitals.spo2 > 0) || (vitals.temperature > 0) || (vitals.systolic > 0 && vitals.diastolic > 0) || (vitals.height > 0 && vitals.weight > 0);
    if (!hasAnyVitals) {
      recommendations.push('Physiological vital signs (HR, SpO2, BP, Temp, BMI) are currently unrecorded (0). Please measure using calibrated clinical instruments.');
      recommendationsHi.push('स्वास्थ्य संकेतक (हृदय गति, SpO2, रक्तचाप, तापमान, बीएमआई) अभी दर्ज नहीं किए गए हैं (0)। कृपया मान्य उपकरणों से मापें।');
    } else {
      recommendations.push('All measured vitals are within nominal screening ranges');
      recommendationsHi.push('सभी मापे गए स्वास्थ्य संकेतक सामान्य सीमा के भीतर हैं');
    }
    recommendations.push('Encourage continued preventive wellness and routine periodic community re-screening in 6 months');
    recommendationsHi.push('नियमित संतुलित आहार बनाए रखें और 6 महीने बाद पुनः स्क्रीनिंग करवाएं');
  }

  return {
    riskLevel,
    riskFactors,
    riskFactorsHi,
    recommendations,
    recommendationsHi,
    requiresDoctorReferral: riskLevel !== 'low',
    referralUrgency,
  };
}

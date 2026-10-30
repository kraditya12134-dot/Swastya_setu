import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  Camera, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Languages, 
  Phone, 
  Building, 
  Mail, 
  Briefcase, 
  Save, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/i18n';
import { UserRole, Language } from '../../types';

export const UserProfileView: React.FC = () => {
  const { 
    user, 
    role, 
    setRole, 
    updateUserProfile, 
    uploadAvatar, 
    removeAvatar, 
    language, 
    setLanguage, 
    supabaseConfig 
  } = useApp();
  const t = translations[language];

  // Form State
  const [name, setName] = useState(user.name);
  const [nameHi, setNameHi] = useState(user.nameHi || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [designation, setDesignation] = useState(user.designation || '');
  const [centerName, setCenterName] = useState(user.centerName || '');
  const [preferredLang, setPreferredLang] = useState<Language>(user.preferredLanguage || language);
  
  // Role selector for Admin persona
  const [assignedRole, setAssignedRole] = useState<UserRole>(user.role);

  // Avatar preview state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sync with current user when user changes
  useEffect(() => {
    setName(user.name);
    setNameHi(user.nameHi || '');
    setPhone(user.phone || '');
    setDesignation(user.designation || '');
    setCenterName(user.centerName || '');
    setPreferredLang(user.preferredLanguage || language);
    setAssignedRole(user.role);
    setAvatarPreview(user.avatarUrl || null);
  }, [user, language]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = language === 'en' ? 'Full name is required.' : 'पूरा नाम आवश्यक है।';
    } else if (name.trim().length < 2) {
      errors.name = language === 'en' ? 'Name must be at least 2 characters.' : 'नाम कम से कम 2 अक्षरों का होना चाहिए।';
    }

    if (!phone.trim()) {
      errors.phone = language === 'en' ? 'Phone number is required.' : 'फोन नंबर आवश्यक है।';
    } else {
      // Basic Indian phone validation
      const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
      if (cleaned.length < 10) {
        errors.phone = language === 'en' ? 'Enter a valid 10-digit mobile number.' : 'मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।';
      }
    }

    if (!designation.trim()) {
      errors.designation = language === 'en' ? 'Professional designation is required.' : 'पदनाम आवश्यक है।';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(language === 'en' ? 'Please upload a valid image file (JPG, PNG, WebP).' : 'कृपया मान्य छवि फ़ाइल (JPG, PNG) अपलोड करें।');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(language === 'en' ? 'Image file size must be less than 5MB.' : 'छवि का आकार 5MB से कम होना चाहिए।');
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleRemovePhoto = async () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await removeAvatar();
    setSuccessMessage(language === 'en' ? 'Profile picture removed.' : 'प्रोफ़ाइल फ़ोटो हटा दी गई।');
  };

  const handleCancel = () => {
    setName(user.name);
    setNameHi(user.nameHi || '');
    setPhone(user.phone || '');
    setDesignation(user.designation || '');
    setCenterName(user.centerName || '');
    setPreferredLang(user.preferredLanguage || language);
    setAssignedRole(user.role);
    setAvatarPreview(user.avatarUrl || null);
    setAvatarFile(null);
    setValidationErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);
    setStorageNotice(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setStorageNotice(null);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      let finalAvatarUrl = avatarPreview;

      // Handle avatar file upload if changed
      if (avatarFile) {
        const uploadRes = await uploadAvatar(avatarFile);
        if (uploadRes.url) {
          finalAvatarUrl = uploadRes.url;
        }
        if (uploadRes.error) {
          setStorageNotice(uploadRes.error);
        }
      }

      const updates: any = {
        name: name.trim(),
        nameHi: nameHi.trim() || name.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        centerName: centerName.trim(),
        preferredLanguage: preferredLang,
        avatarUrl: finalAvatarUrl || undefined,
      };

      // Only allow role changes if current authenticated persona has Admin permissions
      if (role === 'admin' && assignedRole !== user.role) {
        updates.role = assignedRole;
      }

      const res = await updateUserProfile(updates);

      if (res.isCloudSaved) {
        setSuccessMessage(
          language === 'en'
            ? 'Profile successfully updated and synced to Supabase.'
            : 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई और सुपाबेस से सिंक हो गई।'
        );
      } else {
        setSuccessMessage(
          language === 'en'
            ? 'Profile updated in active session & local storage.'
            : 'प्रोफ़ाइल सक्रिय सत्र और स्थानीय मेमोरी में अपडेट हो गई।'
        );
        if (res.error) {
          setStorageNotice(
            language === 'en'
              ? `Cloud sync note: ${res.error}. Profile saved locally in browser.`
              : `क्लाउड सिंक नोट: ${res.error}। डेटा ब्राउज़र में सुरक्षित है।`
          );
        }
      }

      setAvatarFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // User initials for default avatar fallback
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (n[0] || 'U').toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {language === 'en' ? 'User Profile & Identity' : 'उपयोगकर्ता प्रोफ़ाइल एवं पहचान'}
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {user.role.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'en'
              ? 'Manage clinical persona credentials, contact information, and localization preferences'
              : 'चिकित्सकीय प्रोफाइल, संपर्क जानकारी और भाषा प्राथमिकताओं का प्रबंधन करें'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
            supabaseConfig.isConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{supabaseConfig.isConnected ? 'Cloud Persistence Active' : 'Local Offline Mode'}</span>
          </span>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold">{successMessage}</p>
            {storageNotice && <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">{storageNotice}</p>}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* CARD 1: Profile Photo & Visual Identity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Profile Picture & Identity' : 'प्रोफ़ाइल फोटो एवं पहचान'}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">JPG, PNG, WebP up to 5MB</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-teal-500/40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-md">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-700 dark:text-teal-300 font-bold text-2xl font-mono">
                    {getInitials(name || user.name)}
                  </div>
                )}
              </div>

              {/* Upload badge shortcut */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-500 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Upload & Remove Controls */}
            <div className="space-y-2 flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{avatarPreview ? (language === 'en' ? 'Change Photo' : 'फोटो बदलें') : (language === 'en' ? 'Upload Photo' : 'फोटो अपलोड करें')}</span>
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Remove' : 'हटाएं'}</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === 'en'
                  ? 'Your photo is visible on screening reports, referral receipts, and clinical team directories.'
                  : 'आपकी फोटो स्क्रीनिंग रिपोर्ट और रेफरल रिकॉर्ड पर प्रदर्शित होगी।'}
              </p>
            </div>
          </div>

          {/* Cloud Storage Setup Explanation Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Storage Configuration Architecture:</span>
            </div>
            <p>
              Uploaded photos are instantly cached in your browser. When connecting to a production Supabase instance, photos persist directly to the <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">avatars</code> storage bucket. If the bucket is not yet provisioned in your Supabase project, images remain securely accessible within this browser session.
            </p>
          </div>
        </div>

        {/* CARD 2: Personal & Contact Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Personal & Clinical Details' : 'व्यक्तिगत एवं कार्य विवरण'}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name (English) */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1">
                Full Name (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationErrors.name) {
                    setValidationErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  validationErrors.name
                    ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                }`}
                placeholder="e.g. Pooja Verma"
              />
              {validationErrors.name && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Full Name (Hindi) */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1">
                Full Name (हिन्दी में नाम)
              </label>
              <input
                type="text"
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="उदा. पूजा वर्मा"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1">
                Contact Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (validationErrors.phone) {
                      setValidationErrors((prev) => ({ ...prev, phone: '' }));
                    }
                  }}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 ${
                    validationErrors.phone
                      ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                  }`}
                  placeholder="+91 98765 00000"
                />
              </div>
              {validationErrors.phone && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{validationErrors.phone}</p>
              )}
            </div>

            {/* Professional Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1">
                Professional Designation <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => {
                    setDesignation(e.target.value);
                    if (validationErrors.designation) {
                      setValidationErrors((prev) => ({ ...prev, designation: '' }));
                    }
                  }}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    validationErrors.designation
                      ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-teal-500'
                  }`}
                  placeholder="e.g. ASHA Facilitator / Medical Officer"
                />
              </div>
              {validationErrors.designation && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{validationErrors.designation}</p>
              )}
            </div>

            {/* Health Center / Facility Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1">
                Assigned Health Center / Sub-Centre Facility
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Pipariya Sub-Health Centre (Ayushman Arogya Mandir)"
                />
              </div>
            </div>

            {/* Preferred Language Setting */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-200 mb-1">
                Preferred Interface Language
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Languages className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value as Language)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="en">English (Official Standard)</option>
                  <option value="hi">हिन्दी (National Language)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Account Authentication & Role Governance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Security & Role Access Governance' : 'सुरक्षा एवं भूमिका अनुमति शासन'}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Enforced by RBAC</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Email (Read-only Display) */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-900 dark:text-slate-200">
                Registered Account Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-xs">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
                {user.isGoogleAuthenticated && (
                  <span className="ml-auto text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-sans font-semibold">
                    Google OAuth
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Email is linked to authentication credentials and cannot be changed here.</p>
            </div>

            {/* Role Display / Management */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-900 dark:text-slate-200">
                System Role Assignment
              </label>
              
              {role === 'admin' ? (
                /* Admin-authorized role changer */
                <div className="space-y-1.5">
                  <select
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-teal-300 dark:border-teal-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="chw">Community Health Worker (CHW / ASHA)</option>
                    <option value="clinician">Clinician (Medical Officer / Doctor)</option>
                    <option value="admin">System Administrator (Admin)</option>
                  </select>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>Admin privilege: You are authorized to reassign user operational roles.</span>
                  </p>
                </div>
              ) : (
                /* Non-admin read-only locked role badge */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium">
                    <span className="capitalize font-bold text-teal-700 dark:text-teal-400">
                      {user.role === 'chw' && 'Community Health Worker (CHW)'}
                      {user.role === 'clinician' && 'Clinician / Medical Officer'}
                      {user.role === 'admin' && 'District Administrator'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    Role assignment is managed exclusively by the District Health Surveillance Administrator to maintain medical compliance and regulatory auditability.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Reset Changes' : 'रद्द करें'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? (language === 'en' ? 'Saving Profile...' : 'सहेज रहे हैं...') : (language === 'en' ? 'Save Profile Changes' : 'प्रोफ़ाइल सहेजें')}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

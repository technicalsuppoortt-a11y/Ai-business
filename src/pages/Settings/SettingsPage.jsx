import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Topbar from '../../components/layout/Topbar';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Cpu,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Building2,
  Mail,
  PhoneCall,
  ShieldCheck,
  Save,
  Sparkles,
  Layout,
  MessageSquare
} from 'lucide-react';
import './SettingsPage.css';

// Reusable Professional Custom Dropdown Component
function CustomDropdown({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => String(o.value) === String(value));

  return (
    <div className={`custom-dropdown-container ${isOpen ? 'is-open' : ''}`}>
      <div 
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="custom-dropdown-menu"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {options.map(opt => (
              <div
                key={String(opt.value)}
                className={`custom-dropdown-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && <Check size={14} color="#6366F1" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { userData, brandData } = useAuth();
  const toast = useToast();

  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  // ── UNIVERSAL PERMISSION GUARD ──────────────────────────────────────────────
  const resolveAllowedTools = () => {
    const rootPlanId = userData?.planId;
    const subPlanId = userData?.subscription?.planId;
    
    const isValidId = (id) => id && id !== "free_trial" && id !== "trial" && id !== "free";
    
    const hasValidPaidPlan = 
      isValidId(rootPlanId) || 
      isValidId(subPlanId) || 
      (userData?.subscription?.status === 'active' && userData?.subscription?.type !== 'trial');
    
    const isTrial = !hasValidPaidPlan && (
      userData?.subscription?.type === "trial" ||
      !rootPlanId ||
      rootPlanId === "free_trial" ||
      rootPlanId === "trial" ||
      rootPlanId === "free" ||
      userData?.isTrial === true
    );

    const activePlanId = isValidId(rootPlanId) ? rootPlanId : (isValidId(subPlanId) ? subPlanId : null);

    if (isTrial) {
      // Read from LIVE brandData root first to avoid stale user cache
      const trialTools = brandData?.freeTrialSettings?.allowedTools || userData?.freeTrialSettings?.allowedTools;
      if (Array.isArray(trialTools)) return trialTools;
    } else {
      if (activePlanId && Array.isArray(brandData?.plans)) {
        const matchedPlan = brandData.plans.find((p) => String(p.id) === String(activePlanId));
        if (matchedPlan && Array.isArray(matchedPlan.allowedTools)) return matchedPlan.allowedTools;
      }
      if (Array.isArray(userData?.allowedTools)) return userData.allowedTools;
      if (Array.isArray(userData?.subscription?.allowedTools)) return userData.subscription.allowedTools;
    }
    return null;
  };

  const resolvedAllowedTools = resolveAllowedTools();
  
  // Strict Lock Enforcement: If not explicitly allowed, it MUST be locked.
  const isAllowed = Array.isArray(resolvedAllowedTools) && resolvedAllowedTools.includes('settings');
  const isLocked = !isAllowed;

  useEffect(() => {
    if (isLocked) {
      toast(lang === 'en' ? "🔒 Settings are not included in your current plan. Please upgrade!" : "🔒 الإعدادات غير متاحة في باقتك الحالية. يرجى ترقية الباقة!", "error");
    }
  }, [isLocked, lang, toast]);

  if (isLocked) {
    return <Navigate to="/dashboard" replace />;
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Navigation Tab State (Only 2 Tabs)
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'ai'

  // Account Form State
  const [ownerName, setOwnerName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+966 50 123 4567');
  const [country, setCountry] = useState('Saudi Arabia');
  const [defaultLanguage, setDefaultLanguage] = useState('ar');
  const [logoDisplayMode, setLogoDisplayMode] = useState('both');
  const [showWhatsappLoginBtn, setShowWhatsappLoginBtn] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // AI Key & Engine State
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      setOwnerName(userData.ownerName || '');
      setBrandName(userData.brandName || '');
      setEmail(userData.email || '');
      setDefaultLanguage(userData.defaultLanguage || 'ar');
      setLogoDisplayMode(userData.logoDisplayMode || 'both');
      setShowWhatsappLoginBtn(userData.showWhatsappLoginBtn !== false);
    }
  }, [userData]);



  // Profile Form Save Handler
  const handleSaveProfile = async () => {
    if (!userData?.uid) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        ownerName,
        brandName,
        email,
        defaultLanguage,
        logoDisplayMode,
        showWhatsappLoginBtn
      });
      // Immediately set application language context
      dispatch({ type: 'SET_LANGUAGE', payload: defaultLanguage });
      toast(lang ==='en' ?'Profile & settings updated!' :'تم تحديث البيانات والإعدادات بنجاح!','success');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast(lang === 'en' ? 'Error updating profile data' : 'حدث خطأ أثناء تحديث البيانات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate Settings Completion Percentage
  const calculateCompletion = () => {
    let score = 0;
    if (ownerName) score += 33;
    if (brandName) score += 33;
    if (email) score += 34;
    return score;
  };

  const completionPct = calculateCompletion();

  // Dropdown Options
  const languageOptions = [
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'en', label: 'English (الإنجليزية)' }
  ];

  const countryOptions = [
    { value: 'Saudi Arabia', label: 'Saudi Arabia (المملكة العربية السعودية)' },
    { value: 'United Arab Emirates', label: 'United Arab Emirates (الإمارات العربية المتحدة)' },
    { value: 'Egypt', label: 'Egypt (جمهورية مصر العربية)' },
    { value: 'Kuwait', label: 'Kuwait (دولة الكويت)' },
    { value: 'Qatar', label: 'Qatar (دولة قطر)' },
    { value: 'International', label: 'International / Other (دولي / أخرى)' }
  ];

  const logoDisplayOptions = [
    { value: 'both', label: lang === 'en' ? 'Logo + Brand Name' : 'اللوجو واسم البراند معاً' },
    { value: 'logo', label: lang === 'en' ? 'Logo Only' : 'اللوجو فقط' },
    { value: 'text', label: lang === 'en' ? 'Brand Name Only' : 'الاسم فقط' }
  ];

  const whatsappOptions = [
    { value: 'true', label: lang === 'en' ? 'Yes, Show WhatsApp Button' : 'نعم، إظهار زر الواتساب' },
    { value: 'false', label: lang === 'en' ? 'No, Hide WhatsApp Button' : 'لا، إخفاء زر الواتساب' }
  ];

  return (
    <>
      <Topbar
        title={lang === 'en' ? '⚙ Platform Settings' : '⚙ إعدادات المنصة'}
        subtitle={lang === 'en' ? 'Manage account profile and Google Gemini AI key' : 'إدارة الملف الشخصي ومفتاح التوليد بالذكاء الاصطناعي'}
      />

      <div className="settings-page animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>

        {/* WELCOME HERO BANNER */}
        <div className="settings-welcome-banner">
          <div className="banner-user-left">
            <div className="banner-avatar" style={userData?.photoURL ? { backgroundImage: `url("${userData.photoURL}")` } : {}}>
              {!userData?.photoURL && (userData?.ownerName?.charAt(0).toUpperCase() || 'U')}
            </div>
            <div>
              <h2 className="banner-title">
                {lang === 'en' ? `Settings Overview` : `إعدادات الحساب والمنصة`}
              </h2>
              <p className="banner-subtitle">
                {userData?.email} • <span style={{ color: '#10B981', fontWeight: 800 }}>🟢 {lang === 'en' ? 'Active' : 'نشط'}</span>
              </p>
            </div>
          </div>

          <div className="banner-progress-right">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: 'var(--text, #fff)', marginBottom: 6 }}>
              <span>{lang === 'en' ? 'Configuration Progress' : 'نسبة إكمال الإعدادات'}</span>
              <span>{completionPct}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${completionPct}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #6366F1)', borderRadius: 6, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION BUTTONS (ONLY 2 TABS) */}
        <div className="settings-tabs-nav">
          <button className={`tab-nav-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <UserCheck size={18} />
            <span>{lang === 'en' ? 'Account & Profile Settings' : 'الحساب والملف الشخصي'}</span>
          </button>
          <button className={`tab-nav-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
            <Cpu size={18} />
            <span>{lang === 'en' ? 'AI Engine & Usage' : 'الذكاء الاصطناعي والاستخدام'}</span>
          </button>
        </div>

        {/* TAB CONTENT PANELS */}
        <AnimatePresence mode="wait">

          {/* TAB 1: ACCOUNT & PROFILE */}
          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="settings-card-panel"
            >
              <h3 className="panel-header-title">
                <UserCheck size={22} color="#6366F1" />
                <span>{lang === 'en' ? 'Account & Profile Details' : 'بيانات الحساب والبروفايل'}</span>
              </h3>
              <p className="panel-header-sub">
                {lang === 'en' ? 'Update your personal info, brand identity, and language choices.' : 'تعديل البيانات الشخصية، اسم البراند واللغة المعتمدة بالتقارير.'}
              </p>

              <div className="settings-fields-grid">

                {/* Field 1: Owner Name */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <UserCheck size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'User Name (Owner)' : 'اسم المستخدم (المالك)'}</span>
                    </div>
                    {ownerName ? <span style={{ color: '#10B981', fontSize: 11, fontWeight: 700 }}>✓ Saved</span> : <span style={{ color: '#F59E0B', fontSize: 11 }}>* Required</span>}
                  </label>
                  <input
                    type="text"
                    className="setting-field-input"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder={lang === 'en' ? 'Enter your full name' : 'أدخل اسمك الكامل'}
                  />
                </div>

                {/* Field 2: Brand Name */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <Building2 size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Brand Name (Project)' : 'اسم البراند (المشروع)'}</span>
                    </div>
                    {brandName ? <span style={{ color: '#10B981', fontSize: 11, fontWeight: 700 }}>✓ Saved</span> : <span style={{ color: '#F59E0B', fontSize: 11 }}>* Required</span>}
                  </label>
                  <input
                    type="text"
                    className="setting-field-input"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder={lang === 'en' ? 'Your brand name' : 'اسم براندك'}
                  />
                </div>

                {/* Field 3: Email */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <Mail size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Email Address' : 'البريد الإلكتروني (للمراسلة والتقارير)'}</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    className="setting-field-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>

                {/* Field 4: Phone */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <PhoneCall size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Phone / Contact Number' : 'رقم الهاتف / للتواصل'}</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    className="setting-field-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    dir="ltr"
                  />
                </div>

                {/* Field 5: Language Professional Custom Dropdown */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <Globe size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Default Platform Language' : 'اللغة الافتراضية للمنصة'}</span>
                    </div>
                  </label>
                  <CustomDropdown 
                    options={languageOptions} 
                    value={defaultLanguage} 
                    onChange={setDefaultLanguage} 
                    placeholder="Select Language"
                  />
                </div>

                {/* Field 6: Country Professional Custom Dropdown */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <Globe size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Country / Region' : 'الدولة / المنطقة'}</span>
                    </div>
                  </label>
                  <CustomDropdown 
                    options={countryOptions} 
                    value={country} 
                    onChange={setCountry} 
                    placeholder="Select Country"
                  />
                </div>

                {/* Field 7: Brand Display Style Professional Custom Dropdown */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <Layout size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Brand Display Style' : 'شكل عرض البراند (اللوجو والاسم)'}</span>
                    </div>
                  </label>
                  <CustomDropdown 
                    options={logoDisplayOptions} 
                    value={logoDisplayMode} 
                    onChange={setLogoDisplayMode} 
                    placeholder="Select Display Style"
                  />
                </div>

                {/* Field 8: WhatsApp Button Professional Custom Dropdown */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <MessageSquare size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Show WhatsApp Login Button' : 'إظهار زر الواتساب في صفحة الدخول'}</span>
                    </div>
                  </label>
                  <CustomDropdown 
                    options={whatsappOptions} 
                    value={showWhatsappLoginBtn ? 'true' : 'false'} 
                    onChange={(val) => setShowWhatsappLoginBtn(val === 'true')} 
                    placeholder="Select Option"
                  />
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: AI ENGINE & API KEYS */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="settings-card-panel"
            >
              {/* Plan & Credits Status Bar */}
              <div style={{ marginBottom: "24px", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>
                      {(() => {
                        const plans = brandData?.plans || [];
                        const currentPlan = plans.find(p => String(p.id) === String(userData?.planId));
                        const displayName = currentPlan ? (lang === 'en' ? currentPlan.name_en || currentPlan.name : currentPlan.name_ar || currentPlan.name) : (userData?.planName || 'Free');
                        return (
                          <>{lang === 'en' ? 'Current Plan' : 'الباقة الحالية'}: <span style={{ color: "var(--accent)", textTransform: "capitalize" }}>{displayName}</span></>
                        );
                      })()}
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--text3)" }}>
                      {lang === 'en' ? 'Monthly credits reset automatically.' : 'يتم تجديد الرصيد شهرياً بشكل تلقائي.'}
                    </p>
                  </div>
                  <div style={{ textAlign: lang === 'en' ? 'right' : 'left' }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: ((typeof userData?.credits === 'object' ? userData.credits.credits : userData?.credits) || 0) === 0 ? "var(--red)" : "#10B981" }}>
                      {(() => {
                        const current = (typeof userData?.credits === 'object' ? userData.credits.credits : userData?.credits) || 0;
                        const plans = brandData?.plans || [];
                        const currentPlan = plans.find(p => String(p.id) === String(userData?.planId));
                        const total = userData?.totalCredits ?? (currentPlan ? Number(currentPlan.creditsPerMonth || 0) : current);
                        return `${current} / ${total}`;
                      })()}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                      {lang === 'en' ? 'Credits Remaining' : 'الرصيد المتبقي'}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{
                    width: `${(() => {
                      const current = (typeof userData?.credits === 'object' ? userData.credits.credits : userData?.credits) || 0;
                      const plans = brandData?.plans || [];
                      const currentPlan = plans.find(p => String(p.id) === String(userData?.planId));
                      const total = userData?.totalCredits ?? (currentPlan ? Number(currentPlan.creditsPerMonth || 1) : 1);
                      return Math.min(100, (current / total) * 100);
                    })()}%`,
                    height: "100%",
                    background: (((typeof userData?.credits === 'object' ? userData.credits.credits : userData?.credits) || 0) === 0) ? "var(--red)" : "linear-gradient(90deg, #10B981, #059669)",
                    borderRadius: "10px",
                    transition: "width 0.5s ease"
                  }}></div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* STICKY SAVE ACTIONS BAR */}
        <div className="sticky-save-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#6366F1" />
            <span style={{ fontSize: 13, fontWeight: 800 }}>
              {lang === 'en' ? 'Ready to apply updated settings?' : 'هل تريد حفظ التعديلات الجديدة؟'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
              <Save size={15} />
              <span>{isSaving ? (lang === 'en' ? 'Saving...' : 'جاري الحفظ...') : (lang === 'en' ? 'Save Settings' : 'حفظ الإعدادات')}</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
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
  const [apiKeyInput, setApiKeyInput] = useState(state.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      setOwnerName(userData.ownerName || '');
      setBrandName(userData.brandName || '');
      setEmail(userData.email || '');
      setDefaultLanguage(userData.defaultLanguage || 'ar');
      setLogoDisplayMode(userData.logoDisplayMode || 'both');
      setShowWhatsappLoginBtn(userData.showWhatsappLoginBtn !== false);
      setApiKeyInput(userData.personalOpenAiKey || '');
    }
  }, [userData]);

  // Save API Key Handler
  const handleSaveApiKey = async () => {
    const key = apiKeyInput.trim();
    if (!key) return toast(lang === 'en' ? 'Please enter the API key first' : 'يرجى إدخال المفتاح أولاً', 'error');
    if (!userData?.uid) return;
    try {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, { personalOpenAiKey: key });
      localStorage.setItem('user_openai_api_key', key);
      toast(lang === 'en' ? 'API Key saved successfully ✅' : 'تم حفظ المفتاح الخاص بنجاح ✅', 'success');
    } catch (err) {
      toast(lang === 'en' ? 'Error saving API key' : 'حدث خطأ أثناء حفظ المفتاح', 'error');
    }
  };

  // Remove API Key Handler
  const handleRemoveApiKey = async () => {
    if (!userData?.uid) return;
    try {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, { personalOpenAiKey: '' });
      localStorage.removeItem('app_api_key');
      localStorage.removeItem('user_openai_api_key');
      setApiKeyInput('');
      toast(lang === 'en' ? 'API Key removed successfully 🗑️' : 'تم إزالة المفتاح الخاص بنجاح 🗑️', 'info');
    } catch (err) {
      toast(lang === 'en' ? 'Error removing API key' : 'حدث خطأ أثناء إزالة المفتاح', 'error');
    }
  };

  // Copy API Key
  const handleCopyKey = () => {
    if (!apiKeyInput) return;
    navigator.clipboard.writeText(apiKeyInput);
    toast(lang === 'en' ? 'API Key copied to clipboard 📋' : 'تم نسخ المفتاح إلى الحافظة 📋', 'success');
  };

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
      toast(lang === 'en' ? 'Profile & settings updated! ✓' : 'تم تحديث البيانات والإعدادات بنجاح! ✓', 'success');
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
    if (ownerName) score += 25;
    if (brandName) score += 25;
    if (email) score += 25;
    if (apiKeyInput) score += 25;
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
            <span>{lang === 'en' ? 'AI Engine & Gemini API Keys' : 'الذكاء الاصطناعي والمفاتيح'}</span>
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

                {((typeof userData?.credits === 'object' ? userData.credits.credits : userData?.credits) || 0) === 0 && (
                  <div style={{ color: "var(--red)", fontSize: "12px", fontWeight: "600", background: "rgba(239, 68, 68, 0.1)", padding: "10px", borderRadius: "8px" }}>
                    {lang === 'en' ? '⚠️ Monthly Credits Exhausted. Add your Personal OpenAI API Key below to continue using tools.' : '⚠️ لقد استنفدت رصيدك الشهري. يرجى إضافة مفتاح OpenAI API الخاص بك بالأسفل للاستمرار.'}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="panel-header-title">
                  <Cpu size={22} color="#10B981" />
                  <span>{lang === 'en' ? 'AI Engine & OpenAI API Keys' : 'مفتاح الذكاء الاصطناعي (OpenAI)'}</span>
                </h3>
                <span className={`status-tag ${apiKeyInput ? 'done' : 'pending'}`}>
                  {apiKeyInput ? (lang === 'en' ? '🟢 Key Configured' : '🟢 المفتاح مُفعّل') : (lang === 'en' ? '🔴 Missing Key' : '🔴 المفتاح غير مضاف')}
                </span>
              </div>
              <p className="panel-header-sub">
                {lang === 'en' ? 'Configure your Personal OpenAI API Key to enable real-time dynamic AI analysis once your monthly credits are exhausted.' : 'أضف مفتاح OpenAI API الخاص بك لتشغيل التحليل المباشر بعد نفاد رصيدك الشهري.'}
              </p>

              <div className="api-box-container">
                <label className="setting-field-label" style={{ color: 'var(--text)' }}>
                  <div className="setting-field-label-left">
                    <KeyRound size={16} color="#6366F1" />
                    <span>{lang === 'en' ? 'Personal OpenAI API Key' : 'مفتاح OpenAI API الخاص بك'}</span>
                  </div>
                </label>

                <div className="key-input-wrapper">
                  <div className="key-input-container">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      className="key-input-field"
                      value={apiKeyInput}
                      onChange={e => setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                    />
                    <button className="eye-toggle-btn" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button className="btn-icon" onClick={handleCopyKey} title={lang === 'en' ? 'Copy Key' : 'نسخ المفتاح'}>
                    <Copy size={14} />
                  </button>

                  {userData?.personalOpenAiKey && (
                    <button className="btn btn-red" onClick={handleRemoveApiKey} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                      {lang === 'en' ? 'Stop / Remove Key' : 'إيقاف / إزالة المفتاح'}
                    </button>
                  )}

                  <button className="btn btn-green" onClick={handleSaveApiKey}>
                    {lang === 'en' ? 'Save Key' : 'حفظ المفتاح'}
                  </button>
                </div>

                {/* Expandable Guide Accordion */}
                <div className="guide-accordion">
                  <div className="guide-accordion-header" onClick={() => setIsGuideOpen(!isGuideOpen)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HelpCircle size={16} />
                      <span>{lang === 'en' ? 'How to get an OpenAI API key?' : 'كيف تحصل على مفتاح OpenAI الخاص بك؟'}</span>
                    </div>
                    {isGuideOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {isGuideOpen && (
                    <div className="guide-accordion-body">
                      <ol style={{ paddingInlineStart: 20, margin: 0 }}>
                        <li>1. Go to <strong><a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>OpenAI Platform</a></strong> and sign in with your account.</li>
                        <li>2. Click the <strong>"Create new secret key"</strong> button.</li>
                        <li>3. Name your key and generate it.</li>
                        <li>4. Copy your key (starts with sk-...), paste it into the input above, and click <strong>"Save Key"</strong>.</li>
                      </ol>
                    </div>
                  )}
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

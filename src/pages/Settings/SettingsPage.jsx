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

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
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
    }
  }, [userData]);

  // Sync state.apiKey to input if changed
  useEffect(() => {
    if (state.apiKey) setApiKeyInput(state.apiKey);
  }, [state.apiKey]);

  // Save API Key Handler
  const handleSaveApiKey = () => {
    const key = apiKeyInput.trim();
    if (!key) return toast(lang === 'en' ? 'Please enter the API key first' : 'أدخل المفتاح أولاً', 'error');
    dispatch({ type: 'SET_FIELD', field: 'apiKey', value: key });
    toast(lang === 'en' ? 'API Key saved successfully ✓' : 'تم حفظ مفتاح الـ API بنجاح ✓', 'success');
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
    if (state.apiKey) score += 25;
    return score;
  };

  const completionPct = calculateCompletion();

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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
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

                {/* Field 5: Language Professional Custom Select */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <Globe size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Default Platform Language' : 'اللغة الافتراضية للمنصة'}</span>
                    </div>
                  </label>
                  <div className="pro-select-wrapper">
                    <select
                      className="setting-field-input"
                      value={defaultLanguage}
                      onChange={e => setDefaultLanguage(e.target.value)}
                    >
                      <option value="ar">العربية (Arabic)</option>
                      <option value="en">English (الإنجليزية)</option>
                    </select>
                    <ChevronDown className="pro-select-arrow" size={16} />
                  </div>
                </div>

                {/* Field 6: Country Professional Custom Select */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <Globe size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Country / Region' : 'الدولة / المنطقة'}</span>
                    </div>
                  </label>
                  <div className="pro-select-wrapper">
                    <select className="setting-field-input" value={country} onChange={e => setCountry(e.target.value)}>
                      <option value="Saudi Arabia">Saudi Arabia (المملكة العربية السعودية)</option>
                      <option value="United Arab Emirates">United Arab Emirates (الإمارات العربية المتحدة)</option>
                      <option value="Egypt">Egypt (جمهورية مصر العربية)</option>
                      <option value="Kuwait">Kuwait (دولة الكويت)</option>
                      <option value="Qatar">Qatar (دولة قطر)</option>
                      <option value="International">International / Other</option>
                    </select>
                    <ChevronDown className="pro-select-arrow" size={16} />
                  </div>
                </div>

                {/* Field 7: Brand Display Style Professional Custom Select */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <Layout size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Brand Display Style' : 'شكل عرض البراند (اللوجو والاسم)'}</span>
                    </div>
                  </label>
                  <div className="pro-select-wrapper">
                    <select
                      className="setting-field-input"
                      value={logoDisplayMode}
                      onChange={e => setLogoDisplayMode(e.target.value)}
                    >
                      <option value="both">{lang === 'en' ? 'Logo + Brand Name' : 'اللوجو واسم البراند معاً'}</option>
                      <option value="logo">{lang === 'en' ? 'Logo Only' : 'اللوجو فقط'}</option>
                      <option value="text">{lang === 'en' ? 'Brand Name Only' : 'الاسم فقط'}</option>
                    </select>
                    <ChevronDown className="pro-select-arrow" size={16} />
                  </div>
                </div>

                {/* Field 8: WhatsApp Button Professional Custom Select */}
                <div className="setting-field-group">
                  <label className="setting-field-label">
                    <div className="setting-field-label-left">
                      <MessageSquare size={15} color="#6366F1" />
                      <span>{lang === 'en' ? 'Show WhatsApp Login Button' : 'إظهار زر الواتساب في صفحة الدخول'}</span>
                    </div>
                  </label>
                  <div className="pro-select-wrapper">
                    <select
                      className="setting-field-input"
                      value={showWhatsappLoginBtn ? 'true' : 'false'}
                      onChange={e => setShowWhatsappLoginBtn(e.target.value === 'true')}
                    >
                      <option value="true">{lang === 'en' ? 'Yes, Show WhatsApp Button' : 'نعم، إظهار زر الواتساب'}</option>
                      <option value="false">{lang === 'en' ? 'No, Hide WhatsApp Button' : 'لا، إخفاء زر الواتساب'}</option>
                    </select>
                    <ChevronDown className="pro-select-arrow" size={16} />
                  </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="panel-header-title">
                  <Cpu size={22} color="#10B981" />
                  <span>{lang === 'en' ? 'AI Engine & Gemini API Keys' : 'مفتاح الذكاء الاصطناعي (Google Gemini)'}</span>
                </h3>
                <span className={`status-tag ${state.apiKey ? 'done' : 'pending'}`}>
                  {state.apiKey ? (lang === 'en' ? '🟢 Key Configured' : '🟢 المفتاح مُفعّل') : (lang === 'en' ? '🔴 Missing Key' : '🔴 المفتاح غير مضاف')}
                </span>
              </div>
              <p className="panel-header-sub">
                {lang === 'en' ? 'Configure your Google Gemini API Key to enable real-time dynamic AI analysis across all 15+ business tools.' : 'أضف مفتاح Google Gemini API لتشغيل التحليل المباشر والتوليد الذكي في كافة أدوات المنصة.'}
              </p>

              <div className="api-box-container">
                <label className="setting-field-label" style={{ color: 'var(--text)' }}>
                  <div className="setting-field-label-left">
                    <KeyRound size={16} color="#6366F1" />
                    <span>{lang === 'en' ? 'Google Gemini API Key' : 'مفتاح Google Gemini API الخاص بك'}</span>
                  </div>
                </label>

                <div className="key-input-wrapper">
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
                  <button className="btn btn-secondary" style={{ padding: '10px 14px' }} onClick={handleCopyKey} title={lang === 'en' ? 'Copy Key' : 'نسخ المفتاح'}>
                    <Copy size={14} />
                  </button>
                  <button className="btn btn-green" onClick={handleSaveApiKey}>
                    {lang === 'en' ? 'Save Key' : 'حفظ المفتاح'}
                  </button>
                </div>

                {/* Expandable Guide Accordion */}
                <div className="guide-accordion">
                  <div className="guide-accordion-header" onClick={() => setIsGuideOpen(!isGuideOpen)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HelpCircle size={16} />
                      <span>{lang === 'en' ? 'How to get a free Google Gemini API key?' : 'كيف تحصل على مفتاح Google Gemini مجاني؟'}</span>
                    </div>
                    {isGuideOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {isGuideOpen && (
                    <div className="guide-accordion-body">
                      <ol style={{ paddingInlineStart: 20, margin: 0 }}>
                        <li>1. Go to <strong><a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Google AI Studio</a></strong> and sign in with your Google account.</li>
                        <li>2. Click the <strong>"Get API key"</strong> button from the left menu.</li>
                        <li>3. Select <strong>"Create API key in new project"</strong>.</li>
                        <li>4. Copy your key, paste it into the input above, and click <strong>"Save Key"</strong>.</li>
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

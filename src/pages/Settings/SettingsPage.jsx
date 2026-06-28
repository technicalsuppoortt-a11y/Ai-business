import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Topbar from '../../components/layout/Topbar';
import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const toast = useToast();

  const lang = state.language || 'ar';

  const [ownerName, setOwnerName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('ar');
  const [logoDisplayMode, setLogoDisplayMode] = useState('both');
  const [showWhatsappLoginBtn, setShowWhatsappLoginBtn] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const saveApiKey = () => {
    const key = document.getElementById('api-key-input')?.value?.trim();
    if (!key) return toast(lang === 'en' ? 'Please enter the key first' : 'أدخل المفتاح أولاً', 'error');
    dispatch({ type: 'SET_FIELD', field: 'apiKey', value: key });
    toast(lang === 'en' ? 'API Key saved successfully ✓' : 'تم حفظ مفتاح الـ API ✓', 'success');
  };

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
      // Update local app state language to match the new default language immediately
      dispatch({ type: 'SET_LANGUAGE', payload: defaultLanguage });
      toast(lang === 'en' ? 'Profile updated successfully! ✓' : 'تم تحديث بيانات الملف الشخصي بنجاح! ✓', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast(lang === 'en' ? 'Error updating profile data' : 'حدث خطأ أثناء تحديث البيانات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Topbar 
        title={lang === 'en' ? '⚙ Settings' : '⚙ الإعدادات'} 
        subtitle={lang === 'en' ? 'Account & AI configuration' : 'إعدادات الحساب والذكاء الاصطناعي'} 
      />
      <div className="content-area view-enter">
        {/* AI Settings */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                {lang === 'en' ? '✦ AI Settings' : '✦ إعدادات الذكاء الاصطناعي'}
              </div>
              <div className="card-sub">
                {lang === 'en' ? 'Add your Google Gemini API key to unlock smart AI features in all tools' : 'أضف مفتاح Gemini API لفتح التوليد الذكي في كل الأدوات'}
              </div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: state.apiKey ? 'var(--green)' : 'var(--text3)', boxShadow: state.apiKey ? '0 0 6px var(--green)' : 'none' }} />
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(109,40,217,0.04))', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 14 }}>
            <label className="field-label" style={{ marginBottom: 6 }}>
              {lang === 'en' ? 'Google Gemini API Key' : 'مفتاح Google Gemini API'}
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input id="api-key-input" type="password" className="field-input" placeholder="AIzaSy..." defaultValue={state.apiKey} style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 12 }} />
              <button className="btn btn-green" onClick={saveApiKey}>
                {lang === 'en' ? 'Save Key' : 'حفظ المفتاح'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>
              {lang === 'en' ? '✓ The key is saved locally in your browser and is never sent to any external server' : '✓ المفتاح يُحفظ في متصفحك فقط ولا يُرسل لأي خادم خارجي'}
            </div>
            
            <div style={{ marginTop: 20, padding: 16, background: 'rgba(0,0,0,0.15)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--accent)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>💡</span> {lang === 'en' ? 'How to get a free API key?' : 'كيف تحصل على مفتاح API مجاني؟'}
              </div>
              <ul style={{ fontSize: 11, color: 'var(--text2)', paddingRight: 18, paddingLeft: lang === 'en' ? 18 : 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, direction: lang === 'en' ? 'ltr' : 'rtl' }}>
                {lang === 'en' ? (
                  <>
                    <li>1. Go to <strong><a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>Google AI Studio</a></strong> and sign in with your Google account.</li>
                    <li>2. Click the <strong>"Get API key"</strong> button from the left menu.</li>
                    <li>3. Choose <strong>"Create API key in new project"</strong> to generate a new key.</li>
                    <li>4. Copy the generated key, paste it in the field above, and click "Save Key".</li>
                  </>
                ) : (
                  <>
                    <li>1. اذهب إلى موقع <strong><a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>Google AI Studio</a></strong> وسجل دخول بحساب جوجل.</li>
                    <li>2. اضغط على زر <strong>"Get API key"</strong> من القائمة الجانبية اليسرى.</li>
                    <li>3. اختر <strong>"Create API key in new project"</strong> لتوليد مفتاح جديد.</li>
                    <li>4. انسخ المفتاح الذي يظهر لك وضعه في الخانة بالأعلى ثم اضغط "حفظ".</li>
                  </>
                )}
              </ul>
              <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text3)', fontStyle: 'italic' }}>
                {lang === 'en' ? '* Note: Gemini 1.5 Flash is completely free for personal use and small projects.' : '* ملاحظة: Gemini 1.5 Flash مجاني تماماً للاستخدام الشخصي والمشاريع الصغيرة.'}
              </div>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>
            {lang === 'en' ? 'Account & Profile Settings' : 'إعدادات الحساب والملف الشخصي'}
          </div>
          <div className="card-sub" style={{ marginBottom: 20 }}>
            {lang === 'en' ? 'Update your personal details shown in reports and profile' : 'تعديل بياناتك التي تظهر في التقارير والبروفايل'}
          </div>
          
          <div className="grid-2">
            <div className="field">
              <label className="field-label">
                {lang === 'en' ? 'User Name (Owner)' : 'اسم المستخدم (المالك)'}
              </label>
              <input 
                className="field-input" 
                value={ownerName} 
                onChange={e => setOwnerName(e.target.value)} 
                placeholder={lang === 'en' ? 'Enter your name' : 'أدخل اسمك'}
              />
            </div>
            <div className="field">
              <label className="field-label">
                {lang === 'en' ? 'Brand Name (Project)' : 'اسم البراند (المشروع)'}
              </label>
              <input 
                className="field-input" 
                value={brandName} 
                onChange={e => setBrandName(e.target.value)} 
                placeholder={lang === 'en' ? 'Your brand name' : 'اسم براندك'}
              />
            </div>
            <div className="field">
              <label className="field-label">
                {lang === 'en' ? 'Email Address (For Reports)' : 'البريد الإلكتروني (للمراسلة)'}
              </label>
              <input 
                className="field-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="email@example.com"
                dir="ltr"
              />
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                {lang === 'en' ? '* Changing the email here is only for reports and does not affect your login email.' : '* تغيير الإيميل هنا مخصص للتقارير فقط ولا يغير إيميل تسجيل الدخول.'}
              </div>
            </div>
            <div className="field">
              <label className="field-label">
                {lang === 'en' ? 'Default Language (Landing & Tools)' : 'اللغة الافتراضية (صفحة الهبوط والأدوات)'}
              </label>
              <select 
                className="field-input" 
                value={defaultLanguage} 
                onChange={e => setDefaultLanguage(e.target.value)}
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English (الإنجليزية)</option>
              </select>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                {lang === 'en' ? '* Sets the default language for visitors and tool dashboard users.' : '* تحديد اللغة الرئيسية للزوار ومستخدمي لوحة الأدوات.'}
              </div>
            </div>
            <div className="field">
              <label className="field-label">
                {lang === 'en' ? 'Brand Display Style (Header/Footer)' : 'شكل عرض البراند (اللوجو والاسم)'}
              </label>
              <select 
                className="field-input" 
                value={logoDisplayMode} 
                onChange={e => setLogoDisplayMode(e.target.value)}
              >
                <option value="both">{lang === 'en' ? 'Logo + Brand Name' : 'اللوجو واسم البراند معاً'}</option>
                <option value="logo">{lang === 'en' ? 'Logo Only' : 'اللوجو فقط'}</option>
                <option value="text">{lang === 'en' ? 'Brand Name Only' : 'الاسم فقط'}</option>
              </select>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                {lang === 'en' ? '* Choose how your brand appears on the landing page.' : '* اختر كيف يظهر البراند الخاص بك في صفحة الهبوط.'}
              </div>
            </div>
            <div className="field">
              <label className="field-label">
                {lang === 'en' ? 'Show WhatsApp Login Button' : 'إظهار زر الواتساب في صفحة الدخول'}
              </label>
              <select 
                className="field-input" 
                value={showWhatsappLoginBtn ? 'true' : 'false'} 
                onChange={e => setShowWhatsappLoginBtn(e.target.value === 'true')}
              >
                <option value="true">{lang === 'en' ? 'Yes, Show it' : 'نعم، إظهاره'}</option>
                <option value="false">{lang === 'en' ? 'No, Hide it' : 'لا، إخفاؤه'}</option>
              </select>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                {lang === 'en' ? '* Control visibility of the WhatsApp subscription button on the tools login page.' : '* التحكم في ظهور زر تفعيل الاشتراك عبر الواتساب في صفحة دخول الأدوات.'}
              </div>
            </div>
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={handleSaveProfile} 
            disabled={isSaving}
            style={{ marginTop: 10, minWidth: 150 }}
          >
            {isSaving ? (
              lang === 'en' ? '⏳ Saving...' : '⏳ جاري الحفظ...'
            ) : (
              lang === 'en' ? '💾 Save Profile Details' : '💾 حفظ بيانات البروفايل'
            )}
          </button>
        </div>


        {/* App Info */}
        <div style={{ textAlign: 'center', marginTop: 40, padding: 20, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
            AI Brand Vision Smart OS
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
            Version 2.0.4
          </div>
        </div>
      </div>
    </>
  );
}


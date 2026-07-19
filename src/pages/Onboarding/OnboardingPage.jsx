import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import Topbar from '../../components/layout/Topbar';
import PaymentModal from '../Tools/components/PaymentModal';

export default function OnboardingPage() {
  const { state, dispatch } = useApp();
  const { userData, brandData } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const lang = state.language || 'ar';

  const [adminPhone, setAdminPhone] = useState('');
  const [adminBrandName, setAdminBrandName] = useState('');
  const [adminUid, setAdminUid] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!userData?.brandName) return;
    setAdminBrandName(userData.brandName);

    const fetchAdminPhone = async () => {
      try {
        let currentAdminUid = brandData?.adminUid;
        if (!currentAdminUid && userData.createdBy) {
          currentAdminUid = userData.createdBy;
        }

        if (currentAdminUid) {
          setAdminUid(currentAdminUid);
          const { doc, getDoc } = await import('firebase/firestore');
          const adminDoc = await getDoc(doc(db, 'users', currentAdminUid));
          if (adminDoc.exists()) {
            setAdminPhone(adminDoc.data().phoneNumber || '');
            return;
          }
        }

        // Fallback
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const q = query(collection(db, 'users'), where('role', '==', 'admin'), where('brandName', '==', userData.brandName));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAdminUid(snap.docs[0].id);
          setAdminPhone(snap.docs[0].data().phoneNumber || '');
        }
      } catch (err) {
        console.error('Error fetching admin phone:', err);
      }
    };

    fetchAdminPhone();
  }, [userData, brandData]);

  const sub = userData?.subscription;
  const isTrial = sub?.type === 'trial';
  const expiry = sub?.expiryDate?.toDate ? sub.expiryDate.toDate() : (sub?.expiryDate ? new Date(sub.expiryDate) : null);

  const getDaysRemaining = () => {
    if (!expiry) return 0;
    const diffTime = expiry.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const levels = [
    {
      id: 'beginner', icon: '🗺',
      name_ar: 'مبتدئ', name_en: 'Beginner',
      desc_ar: 'أبدأ مشروعي من الصفر', desc_en: 'Starting my project from scratch',
      color: 'accent',
      perks_ar: ['إرشاد خطوة بخطوة', 'أفكار جاهزة', 'نماذج للنسخ'],
      perks_en: ['Step-by-step guidance', 'Ready ideas', 'Copy templates']
    },
    {
      id: 'medium', icon: '🧭',
      name_ar: 'متوسط', name_en: 'Intermediate',
      desc_ar: 'عندي تجربة وعايز أطور', desc_en: 'I have experience and want to grow',
      color: 'green',
      perks_ar: ['استراتيجيات متقدمة', 'أدوات براندينج', 'تحسين العروض'],
      perks_en: ['Advanced strategies', 'Branding tools', 'Offer optimization']
    },
    {
      id: 'pro', icon: '⚡',
      name_ar: 'محترف', name_en: 'Pro',
      desc_ar: 'عندي براند وعايز أوسّع', desc_en: 'I have a brand and want to scale',
      color: 'amber',
      perks_ar: ['كل الأدوات مفتوحة', 'إعلانات ونمو', 'أنظمة أتمتة'],
      perks_en: ['All tools unlocked', 'Ads & growth', 'Automation systems']
    },
  ];

  const selectLevel = (lvl) => {
    dispatch({ type: 'SET_USER', payload: { level: lvl } });
  };

  const proceed = () => {
    dispatch({ type: 'COMPLETE_STEP', step: 'onboarding' });
    toast(lang === 'en' ? 'Excellent! Let\'s start with Niche Selection 🎯' : 'ممتاز! لنبدأ باختيار النيش 🎯', 'success');
    navigate('/dashboard/tool/analysis-identity');
  };

  const levelDetails = {
    beginner: {
      details_ar: 'مرحلة التأسيس: الأولوية هنا لاكتشاف النيش المناسب، بناء هوية بصرية بسيطة، وتجهيز منتج أولي للبيع.',
      details_en: 'Foundation Stage: The priority is to discover the right niche, build a simple visual identity, and prepare an initial product.',
      advice_ar: '💡 نصيحة: لا تشتت نفسك بكثرة الأدوات. ابدأ بأداة "اختيار النيش"، ثم "بناء الموقع". ركز على إطلاق النسخة الأولى في أسرع وقت ممكن لتبدأ في التعلم من السوق.',
      advice_en: '💡 Advice: Don\'t get distracted by too many tools. Start with "Niche Selection", then "Website Construction". Focus on launching your first version ASAP to learn from the market.'
    },
    medium: {
      details_ar: 'مرحلة النمو: لديك منتج أو خدمة بالفعل، والهدف الآن هو مضاعفة التسويق وجذب عملاء أكثر باستمرار.',
      details_en: 'Growth Stage: You already have a product or service, the goal now is to scale marketing and attract more customers consistently.',
      advice_ar: '💡 نصيحة: ركز على أداة "مصنع المحتوى" و"خطة التسويق". جرب زوايا بيعية جديدة باستخدام أداة "مختبر الإعلانات" لرفع معدلات التحويل وتخفيض التكلفة.',
      advice_en: '💡 Advice: Focus on the "Content Factory" and "Marketing Plan". Test new sales angles using "Ad Creative" to increase conversion rates and lower costs.'
    },
    pro: {
      details_ar: 'مرحلة التوسع (Scaling): البزنس يعمل بنجاح، لكنك تحتاج إلى زيادة حجم المبيعات (Scale) وتقليل الجهد اليدوي عبر الأتمتة.',
      details_en: 'Scaling Stage: The business is working successfully, but you need to increase sales volume and reduce manual effort via automation.',
      advice_ar: '💡 نصيحة: استخدم "أتمتة الإيميل" لاسترجاع المبيعات الضائعة (سلة المتروكات)، وحلل أرقامك بدقة باستخدام "حاسبة الأرباح" لرفع العائد على الإعلانات (ROAS).',
      advice_en: '💡 Advice: Use "Email Automation" to recover lost sales (abandoned carts), and strictly analyze your numbers using "Profit Calculator" to maximize your ROAS.'
    }
  };

  return (
    <>
      <Topbar
        title={lang === 'en' ? '🚀 Start' : '🚀 البداية'}
        subtitle={lang === 'en' ? 'Your first step to building your smart project' : 'خطوتك الأولى لبناء مشروعك الذكي'}
      />
      <div className="content-area view-enter">
        {/* Welcome */}
        <div style={{ textAlign: 'center', padding: '32px 24px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '.1em', marginBottom: 8 }}>
            {lang === 'en' ? 'Step 1 of 7' : 'الخطوة 1 من 7'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, marginBottom: 8 }}>
            {lang === 'en' ? 'Welcome to AI Brand Vision' : 'مرحباً بك في AI Brand Vision'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            {lang === 'en'
              ? 'We will build with you a complete strategy — from idea to brand to content to growth'
              : 'سنبني معك استراتيجية متكاملة — من الفكرة للبراند للمحتوى للنمو'}
          </div>
        </div>

        {isTrial && (
          <div className="trial-alert-card" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(59, 130, 246, 0.04) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            margin: '0 12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            direction: lang === 'ar' ? 'rtl' : 'ltr',
            textAlign: lang === 'ar' ? 'right' : 'left'
          }}>
            <div style={{ flex: '1 1 350px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🎁</span>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  color: 'var(--green)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.15)'
                }}>
                  {lang === 'ar' ? 'فترة تجريبية نشطة' : 'Active Free Trial'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold' }}>
                  ({getDaysRemaining()} {lang === 'ar' ? 'أيام متبقية' : 'days remaining'})
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#E8EDF5', lineHeight: '1.6', margin: 0 }}>
                {lang === 'ar' 
                  ? `أنت الآن تستخدم الفترة المجانية (ينتهي اشتراكك التجريبي خلال ${getDaysRemaining()} يوم بتاريخ ${expiry ? expiry.toLocaleDateString('ar-EG') : '—'}). لتفعيل الاشتراك الكامل والاستفادة من جميع الميزات الحصرية، يمكنك الاشتراك والدفع المباشر (المحافظ الإلكترونية) أو التواصل معنا عبر الواتساب!`
                  : `You are currently using the Free Trial (your trial expires in ${getDaysRemaining()} day(s) on ${expiry ? expiry.toLocaleDateString('en-US') : '—'}). To activate your full subscription and unlock all features, you can pay directly (E-Wallets) or contact us via WhatsApp!`}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {adminPhone && (
                <a 
                  href={`https://wa.me/${adminPhone.replace(/\+/g, '').trim()}?text=${encodeURIComponent(
                    lang === 'ar' 
                      ? `مرحباً، أريد تفعيل اشتراكي بالكامل في منصة ${adminBrandName}`
                      : `Hello, I want to activate my full subscription in ${adminBrandName} platform`
                  )}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  className="whatsapp-activation-btn"
                >
                  <span style={{ fontSize: '16px' }}>💬</span>
                  {lang === 'ar' ? 'عبر الواتساب' : 'Via WhatsApp'}
                </a>
              )}

              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '16px' }}>💳</span>
                {lang === 'ar' ? 'الدفع المباشر' : 'Pay Directly'}
              </button>
            </div>
          </div>
        )}

        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          paymentMethods={brandData?.paymentMethods || {}}
          plans={brandData?.plans || []}
          userData={userData}
          adminUid={adminUid}
          adminBrandName={adminBrandName}
          lang={lang}
        />

        {/* Level Cards */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{lang === 'en' ? 'Where are you now?' : 'أين أنت الآن؟'}</div>
              <div className="card-sub">{lang === 'en' ? 'Choose your level to fully customize the system' : 'اختر مستواك لتخصيص النظام بالكامل'}</div>
            </div>
          </div>
          <div className="grid-3">
            {levels.map(l => (
              <div
                key={l.id}
                onClick={() => selectLevel(l.id)}
                style={{
                  background: state.user.level === l.id ? `rgba(59,130,246,0.08)` : 'var(--bg3)',
                  border: `1px solid ${state.user.level === l.id ? 'rgba(59,130,246,0.4)' : 'var(--line)'}`,
                  borderRadius: 'var(--radius)', padding: 18, cursor: 'pointer',
                  transition: 'all .25s', position: 'relative'
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 10 }}>{l.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  {lang === 'en' ? l.name_en : l.name_ar}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>
                  {lang === 'en' ? l.desc_en : l.desc_ar}
                </div>
                {(lang === 'en' ? l.perks_en : l.perks_ar).map((p, i) => (
                  <div key={i} style={{ fontSize: 10, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <span style={{ color: 'var(--accent)' }}>→</span> {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {state.user.level && levelDetails[state.user.level] && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <h4 style={{ color: '#3B82F6', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>
                {lang === 'en' ? 'Level Details' : 'تفاصيل المستوى'}
              </h4>
              <p style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                {lang === 'en' ? levelDetails[state.user.level].details_en : levelDetails[state.user.level].details_ar}
              </p>
              
              <div style={{
                background: 'rgba(13, 18, 32, 0.5)',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <p style={{ color: '#fff', fontSize: '13px', lineHeight: '1.6', margin: 0, fontWeight: 'bold' }}>
                  {lang === 'en' ? levelDetails[state.user.level].advice_en : levelDetails[state.user.level].advice_ar}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile quick form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>
            {lang === 'en' ? 'Your Basic Information' : 'بياناتك الأساسية'}
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="field-label">{lang === 'en' ? 'Your Name' : 'اسمك'}</label>
              <input
                className="field-input"
                placeholder={lang === 'en' ? 'Ahmed Mohammed' : 'أحمد محمد'}
                value={state.user.name}
                onChange={e => dispatch({ type: 'SET_USER', payload: { name: e.target.value } })}
              />
            </div>
            <div className="field">
              <label className="field-label">{lang === 'en' ? 'Country' : 'الدولة'}</label>
              <select className="field-select" value={state.user.country} onChange={e => dispatch({ type: 'SET_USER', payload: { country: e.target.value } })}>
                <option value="EG">🇪🇬 {lang === 'en' ? 'Egypt' : 'مصر'}</option>
                <option value="SA">🇸🇦 {lang === 'en' ? 'Saudi Arabia' : 'السعودية'}</option>
                <option value="AE">🇦🇪 {lang === 'en' ? 'UAE' : 'الإمارات'}</option>
                <option value="KW">🇰🇼 {lang === 'en' ? 'Kuwait' : 'الكويت'}</option>
                <option value="JO">🇯🇴 {lang === 'en' ? 'Jordan' : 'الأردن'}</option>
                <option value="MA">🇲🇦 {lang === 'en' ? 'Morocco' : 'المغرب'}</option>
                <option value="OTHER">🌍 {lang === 'en' ? 'Other' : 'أخرى'}</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={proceed}>
            {lang === 'en' ? 'Save & Continue' : 'حفظ والاستمرار'}
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}

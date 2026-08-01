import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import Topbar from '../../components/layout/Topbar';
import PaymentModal from '../Tools/components/PaymentModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Compass,
  TrendingUp,
  Zap,
  User,
  Globe,
  CheckCircle2,
  MessageSquare,
  CreditCard,
  Gift,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Lightbulb,
  Target,
  Check
} from 'lucide-react';
import './OnboardingPage.css';

// Sleek Custom Glassmorphic Dropdown Component
function CustomDropdown({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => String(o.value) === String(value)) || options[0];

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <div 
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} color="var(--text3)" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="custom-dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
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
                {String(opt.value) === String(value) && <Check size={14} color="var(--accent)" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OnboardingPage() {
  const { state, dispatch } = useApp();
  const { userData, brandData } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

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
      id: 'beginner',
      IconComponent: Compass,
      name_ar: 'مبتدئ', name_en: 'Beginner',
      desc_ar: 'أبدأ مشروعي من الصفر', desc_en: 'Starting my project from scratch',
      color: '#6366F1',
      bgGlow: 'rgba(99, 102, 241, 0.15)',
      perks_ar: ['إرشاد خطوة بخطوة', 'أفكار جاهزة', 'نماذج للنسخ'],
      perks_en: ['Step-by-step guidance', 'Ready ideas', 'Copy templates']
    },
    {
      id: 'medium',
      IconComponent: TrendingUp,
      name_ar: 'متوسط', name_en: 'Intermediate',
      desc_ar: 'عندي تجربة وعايز أطور', desc_en: 'I have experience and want to grow',
      color: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      perks_ar: ['استراتيجيات متقدمة', 'أدوات براندينج', 'تحسين العروض'],
      perks_en: ['Advanced strategies', 'Branding tools', 'Offer optimization']
    },
    {
      id: 'pro',
      IconComponent: Zap,
      name_ar: 'محترف', name_en: 'Pro',
      desc_ar: 'عندي براند وعايز أوسّع', desc_en: 'I have a brand and want to scale',
      color: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      perks_ar: ['كل الأدوات مفتوحة', 'إعلانات ونمو', 'أنظمة أتمتة'],
      perks_en: ['All tools unlocked', 'Ads & growth', 'Automation systems']
    },
  ];

  const selectLevel = (lvl) => {
    dispatch({ type: 'SET_USER', payload: { level: lvl } });
  };

  const proceed = async () => {
    try {
      if (userData?.uid) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const userRef = doc(db, 'users', userData.uid);
        await updateDoc(userRef, {
          name: state.user.name || '',
          country: state.user.country || 'SA',
          level: state.user.level || 'beginner'
        });
      }
    } catch (err) {
      console.error('Error saving onboarding data:', err);
    }

    dispatch({ type: 'COMPLETE_STEP', step: 'onboarding' });
    toast(lang ==='en' ?'Excellent! Let\'s start with Niche Selection' :'ممتاز! لنبدأ باختيار النيش','success');
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

  const COUNTRY_OPTIONS = [
    { value: 'SA', label: lang === 'en' ? '🇸🇦 Saudi Arabia (السعودية)' : '🇸🇦 المملكة العربية السعودية (Saudi Arabia)' },
    { value: 'AE', label: lang === 'en' ? '🇦🇪 United Arab Emirates (الإمارات)' : '🇦🇪 الإمارات العربية المتحدة (UAE)' },
    { value: 'EG', label: lang === 'en' ? '🇪🇬 Egypt (مصر)' : '🇪🇬 جمهورية مصر العربية (Egypt)' },
    { value: 'KW', label: lang === 'en' ? '🇰🇼 Kuwait (الكويت)' : '🇰🇼 دولة الكويت (Kuwait)' },
    { value: 'QA', label: lang === 'en' ? '🇶🇦 Qatar (قطر)' : '🇶🇦 دولة قطر (Qatar)' },
    { value: 'JO', label: lang === 'en' ? '🇯🇴 Jordan (الأردن)' : '🇯🇴 المملكة الأردنية الهاشمية (Jordan)' },
    { value: 'MA', label: lang === 'en' ? '🇲🇦 Morocco (المغرب)' : '🇲🇦 المملكة المغربية (Morocco)' },
    { value: 'OTHER', label: lang === 'en' ? '🌍 Other / International' : '🌍 دولة أخرى / دولي' }
  ];

  return (
    <>
      <Topbar
        title={lang === 'en' ? '🚀 Start Onboarding' : '🚀 البداية والتأسيس'}
        subtitle={lang === 'en' ? 'Your first step to building your smart project' : 'خطوتك الأولى لبناء مشروعك الذكي وتحديد المسار'}
      />

      <div className="onboarding-container animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>

        {/* HERO WELCOME HEADER */}
        <motion.div 
          className="onboarding-hero-header"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="onboarding-step-pill">
            <Sparkles size={13} />
            <span>{lang === 'en' ? 'Step 1 of 7' : 'الخطوة 1 من 7'}</span>
          </div>
          <h1 className="onboarding-hero-title">
            {lang === 'en' ? 'Welcome to AI Brand Vision' : 'مرحباً بك في منصة AI Brand Vision'}
          </h1>
          <p className="onboarding-hero-subtitle">
            {lang === 'en'
              ? 'We will build a complete strategy with you — from idea to brand to content to sustainable growth.'
              : 'سنبني معك استراتيجية متكاملة لمشروعك — من الفكرة للبراند للمحتوى والتوسع المستدام.'}
          </p>
        </motion.div>

        {/* FREE TRIAL ALERT CARD */}
        {isTrial && (
          <motion.div 
            className="onboarding-trial-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div style={{ flex: 1 }}>
              <div className="trial-badge-row">
                <div className="trial-active-tag">
                  <Gift size={13} />
                  <span>{lang === 'ar' ? 'فترة تجريبية نشطة' : 'Active Free Trial'}</span>
                </div>
                <div className="trial-days-tag">
                  <Clock size={13} color="#F59E0B" />
                  <span>({getDaysRemaining()} {lang === 'ar' ? 'أيام متبقية' : 'days remaining'})</span>
                </div>
              </div>
              <p className="trial-card-text">
                {lang === 'ar' 
                  ? `أنت الآن تستخدم الفترة المجانية (ينتهي اشتراكك التجريبي خلال ${getDaysRemaining()} يوم بتاريخ ${expiry ? expiry.toLocaleDateString('ar-EG') : '—'}). لتفعيل الاشتراك الكامل، يمكنك الدفع المباشر أو التواصل معنا عبر الواتساب!`
                  : `You are currently using the Free Trial (your trial expires in ${getDaysRemaining()} day(s) on ${expiry ? expiry.toLocaleDateString('en-US') : '—'}). To activate full access, pay directly or contact us via WhatsApp!`}
              </p>
            </div>
            
            <div className="trial-actions-row">
              {adminPhone && (
                <a 
                  href={`https://wa.me/${adminPhone.replace(/\+/g, '').trim()}?text=${encodeURIComponent(
                    lang === 'ar' 
                      ? `مرحباً، أريد تفعيل اشتراكي بالكامل في منصة ${adminBrandName}`
                      : `Hello, I want to activate my full subscription in ${adminBrandName} platform`
                  )}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-green"
                  style={{ textDecoration: 'none', padding: '12px 20px', borderRadius: 12 }}
                >
                  <MessageSquare size={16} />
                  <span>{lang === 'ar' ? 'عبر الواتساب' : 'Via WhatsApp'}</span>
                </a>
              )}

              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '12px 20px', borderRadius: 12 }}
              >
                <CreditCard size={16} />
                <span>{lang === 'ar' ? 'الدفع المباشر' : 'Pay Directly'}</span>
              </button>
            </div>
          </motion.div>
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

        {/* EXPERIENCE LEVEL SELECTION CARD */}
        <motion.div 
          className="onboarding-card-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="onboarding-section-title">
            <Target size={20} color="#6366F1" />
            <span>{lang === 'en' ? 'Where are you now?' : 'أين أنت الآن من رحلة مشروعك؟'}</span>
          </h3>
          <p className="onboarding-section-sub">
            {lang === 'en' ? 'Choose your current experience level to fully customize the system recommendations' : 'اختر مستواك لتخصيص أدوات وخريطة طريق المنصة لتناسب احتياجك بدقة'}
          </p>

          <div className="levels-grid">
            {levels.map(l => {
              const isSelected = state.user.level === l.id;
              const IconComp = l.IconComponent;
              return (
                <motion.div
                  key={l.id}
                  onClick={() => selectLevel(l.id)}
                  className={`level-card ${isSelected ? 'selected' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="level-icon-badge" style={{ background: l.bgGlow, color: l.color }}>
                    <IconComp size={22} />
                  </div>
                  <div className="level-card-name">
                    <span>{lang === 'en' ? l.name_en : l.name_ar}</span>
                    {isSelected && <CheckCircle2 size={18} color="var(--accent)" />}
                  </div>
                  <p className="level-card-desc">
                    {lang === 'en' ? l.desc_en : l.desc_ar}
                  </p>
                  {(lang === 'en' ? l.perks_en : l.perks_ar).map((p, i) => (
                    <div key={i} className="level-perk-item">
                      <Check size={12} color={l.color} />
                      <span>{p}</span>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
          
          {/* LEVEL DETAILS ADVICE BOX */}
          <AnimatePresence mode="wait">
            {state.user.level && levelDetails[state.user.level] && (
              <motion.div 
                className="level-advice-box"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="advice-header">
                  <Lightbulb size={18} />
                  <span>{lang === 'en' ? 'Level Focus & Strategy Details' : 'تفاصيل الخطة والتوجيه المخصص'}</span>
                </h4>
                <p className="advice-text">
                  {lang === 'en' ? levelDetails[state.user.level].details_en : levelDetails[state.user.level].details_ar}
                </p>
                
                <div className="advice-quote-card">
                  {lang === 'en' ? levelDetails[state.user.level].advice_en : levelDetails[state.user.level].advice_ar}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* PROFILE BASIC INFORMATION */}
        <motion.div 
          className="onboarding-card-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="onboarding-section-title">
            <User size={20} color="#10B981" />
            <span>{lang === 'en' ? 'Your Basic Information' : 'بياناتك الأساسية'}</span>
          </h3>
          <p className="onboarding-section-sub">
            {lang === 'en' ? 'Help us personalize your business workspace' : 'تخصيص البيانات المطبوعة بالتقارير والاستراتيجيات'}
          </p>

          <div className="onboarding-fields-grid">
            <div className="onboarding-field-group">
              <label className="onboarding-field-label">
                <User size={15} color="#6366F1" />
                <span>{lang === 'en' ? 'Your Name / Owner Name' : 'اسم المستخدم (المالك)'}</span>
              </label>
              <input
                className="onboarding-field-input"
                placeholder={lang === 'en' ? 'e.g. Ahmed Mohamed' : 'مثال: أحمد محمد'}
                value={state.user.name || ''}
                onChange={e => dispatch({ type: 'SET_USER', payload: { name: e.target.value } })}
              />
            </div>

            <div className="onboarding-field-group">
              <label className="onboarding-field-label">
                <Globe size={15} color="#6366F1" />
                <span>{lang === 'en' ? 'Target Country / Region' : 'الدولة المستهدفة'}</span>
              </label>
              <CustomDropdown 
                value={state.user.country || 'SA'}
                onChange={v => dispatch({ type: 'SET_USER', payload: { country: v } })}
                options={COUNTRY_OPTIONS}
              />
            </div>
          </div>
        </motion.div>

        {/* PROCEED ACTION BAR */}
        <motion.div 
          className="onboarding-footer-bar"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <motion.button 
            className="proceed-btn" 
            onClick={proceed}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{lang === 'en' ? 'Save & Start Journey' : 'حفظ واستمرار إلى الانطلاق'}</span>
            {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </motion.button>
        </motion.div>

      </div>
    </>
  );
}

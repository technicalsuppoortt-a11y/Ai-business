import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Video,
  BarChart3,
  Zap,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Copy,
  Lightbulb,
  Wrench,
  ArrowRight,
  ArrowLeft,
  Settings,
  ShieldCheck,
  Globe
} from 'lucide-react';
import './SocialIntegration.css';

export default function SocialIntegration({ stepNumber }) {
  const { state } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [activePlatform, setActivePlatform] = useState('meta');
  
  const platforms = [
    { 
      id: 'meta', 
      name_ar: 'Meta Pixel (فيسبوك وإنستجرام)', 
      name_en: 'Meta Pixel (FB & IG)', 
      desc_ar: 'تتبع زوار فيسبوك وإنستجرام', 
      desc_en: 'FB & Instagram Tracking', 
      IconComp: Share2, 
      color: '#3B82F6' 
    },
    { 
      id: 'tiktok', 
      name_ar: 'TikTok Pixel', 
      name_en: 'TikTok Pixel', 
      desc_ar: 'تتبع حملات تيك توك', 
      desc_en: 'TikTok Ad Conversions', 
      IconComp: Video, 
      color: '#EC4899' 
    },
    { 
      id: 'google', 
      name_ar: 'Google Analytics 4 (GA4)', 
      name_en: 'Google Analytics 4 (GA4)', 
      desc_ar: 'تحليل سلوك الزوار والزيارات', 
      desc_en: 'Traffic & Behavior Analytics', 
      IconComp: BarChart3, 
      color: '#F59E0B' 
    },
    { 
      id: 'snapchat', 
      name_ar: 'Snapchat Pixel', 
      name_en: 'Snapchat Pixel', 
      desc_ar: 'تتبع إعلانات سناب شات', 
      desc_en: 'Snapchat Ads Retargeting', 
      IconComp: Zap, 
      color: '#EAB308' 
    },
  ];

  const contentMap = {
    meta: {
      title_ar: 'إعداد Meta Pixel (فيسبوك وإنستجرام)',
      title_en: 'Setup Meta Pixel (Facebook & Instagram)',
      desc_ar: 'البيكسل هو كود سحري يراقب زوار موقعك لتعرف من اشترى، ومن أضاف للسلة، لتستهدفه بإعلانات لاحقاً.',
      desc_en: 'The pixel is a magic code that monitors your site visitors to know who bought, who added to cart, to target them with ads later.',
      steps_ar: [
        'اذهب إلى Facebook Events Manager.',
        'اضغط على Connect Data Sources واختر Web.',
        'أدخل اسم البيكسل (مثال: UpKlick Pixel).',
        'انسخ الـ Pixel ID (رقم طويل مثل: 1234567890).',
        'اذهب إلى لوحة تحكم UpKlick > الإعدادات > Tracking Codes.',
        'ألصق الـ ID في خانة Meta Pixel واضغط حفظ.'
      ],
      steps_en: [
        'Go to Facebook Events Manager.',
        'Click Connect Data Sources and select Web.',
        'Enter a pixel name (e.g. UpKlick Pixel).',
        'Copy the Pixel ID (a long number like: 1234567890).',
        'Go to UpKlick Dashboard > Settings > Tracking Codes.',
        'Paste the ID into the Meta Pixel field and click save.'
      ],
      tip_ar: 'تأكد من تنزيل إضافة Meta Pixel Helper على متصفح Chrome للتأكد من عمله بشكل صحيح.',
      tip_en: 'Make sure to download the Meta Pixel Helper extension on Chrome browser to ensure it works correctly.',
      color: '#3B82F6'
    },
    tiktok: {
      title_ar: 'إعداد TikTok Pixel',
      title_en: 'Setup TikTok Pixel',
      desc_ar: 'ضروري جداً إذا كنت تنوي إطلاق حملات إعلانية على تيك توك لتتبع المبيعات والتحويلات.',
      desc_en: 'Very necessary if you intend to launch ad campaigns on TikTok to track sales and conversions.',
      steps_ar: [
        'اذهب إلى TikTok Ads Manager.',
        'من القائمة العلوية، اختر Assets ثم Events.',
        'اختر Web Events واضغط Manage.',
        'اضغط Create Pixel، اختر اسم، ثم اختر TikTok Pixel.',
        'اختر Manually Install Code وانسخ الـ Pixel ID.',
        'ألصقه في إعدادات UpKlick.'
      ],
      steps_en: [
        'Go to TikTok Ads Manager.',
        'From the top menu, select Assets then Events.',
        'Select Web Events and click Manage.',
        'Click Create Pixel, choose a name, then select TikTok Pixel.',
        'Choose Manually Install Code and copy the Pixel ID.',
        'Paste it in UpKlick settings.'
      ],
      tip_ar: 'تيك توك بيكسل ممتاز في تتبع الفئة العمرية الشابة وتفاعلهم السريع.',
      tip_en: 'TikTok pixel is excellent at tracking younger demographics and their rapid interaction.',
      color: '#EC4899'
    },
    google: {
      title_ar: 'إعداد Google Analytics 4 (GA4)',
      title_en: 'Setup Google Analytics 4 (GA4)',
      desc_ar: 'الأداة الأقوى عالمياً لفهم مصدر زياراتك، ما الصفحات التي يتصفحونها، وكم يبقون في الموقع.',
      desc_en: 'The world\'s most powerful tool to understand the source of your traffic, what pages they browse, and how long they stay.',
      steps_ar: [
        'اذهب إلى analytics.google.com وأنشئ حساباً مجانياً.',
        'قم بإنشاء Property جديدة وأدخل رابط موقعك.',
        'ستحصل على Measurement ID يبدأ بـ (G-XXXXXXX).',
        'انسخ هذا المعرّف وألصقه في إعدادات UpKlick > Tracking Codes.'
      ],
      steps_en: [
        'Go to analytics.google.com and create a free account.',
        'Create a new Property and enter your website link.',
        'You will get a Measurement ID starting with (G-XXXXXXX).',
        'Copy this ID and paste it in UpKlick Settings > Tracking Codes.'
      ],
      tip_ar: 'لا تعتمد على GA4 للإعلانات فقط، بل لفهم سلوك المستخدم بالكامل.',
      tip_en: 'Don\'t rely on GA4 for ads only, but for understanding the entire user behavior.',
      color: '#F59E0B'
    },
    snapchat: {
      title_ar: 'إعداد Snapchat Pixel',
      title_en: 'Setup Snapchat Pixel',
      desc_ar: 'استهدف جمهور الخليج بفعالية بتتبع إعلانات سناب شات.',
      desc_en: 'Target the Gulf audience effectively by tracking Snapchat ads.',
      steps_ar: [
        'اذهب إلى Snapchat Ads Manager.',
        'من قائمة Assets، اختر Events Manager.',
        'اضغط New Event Source ثم Web.',
        'انسخ الـ Pixel ID المكون من حروف وأرقام.',
        'ألصقه في لوحة تحكم UpKlick الخاص بك.'
      ],
      steps_en: [
        'Go to Snapchat Ads Manager.',
        'From the Assets menu, select Events Manager.',
        'Click New Event Source then Web.',
        'Copy the alphanumeric Pixel ID.',
        'Paste it in your UpKlick dashboard.'
      ],
      tip_ar: 'مهم جداً إذا كان جمهورك المستهدف في السعودية أو الإمارات.',
      tip_en: 'Very important if your target audience is in Saudi Arabia or UAE.',
      color: '#EAB308'
    }
  };

  const currentData = contentMap[activePlatform];

  const handleCopySteps = () => {
    const steps = (lang === 'en' ? currentData.steps_en : currentData.steps_ar).join('\n');
    const textToCopy = `${lang === 'en' ? currentData.title_en : currentData.title_ar}\n\n${steps}`;
    navigator.clipboard.writeText(textToCopy);
    toast(lang === 'en' ? 'Integration steps copied to clipboard! ✅' : 'تم نسخ خطوات الربط إلى الحافظة! ✅', 'success');
  };

  return (
    <ToolDashboardLayout
      id="social-integration"
      title={lang === 'en' ? 'Social & Pixel Integration' : 'ربط السوشيال والبيكسل'}
      subtitle={lang === 'en' ? 'Tracking pixels are the brains behind your ad campaigns. Connect your store to social platforms to track sales and retarget.' : 'أكواد التتبع (Pixels) هي العقل المدبر لحملاتك الإعلانية. اربط متجرك بمنصات التواصل لتتبع المبيعات وإعادة الاستهداف.'}
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="20 - 30"
    >
      <div className="si-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="si-main-grid">
          
          {/* ═══════════════ PLATFORMS SELECTION SIDEBAR ═══════════════ */}
          <div className="si-sidebar">
            {platforms.map(p => {
              const IconComponent = p.IconComp;
              const isActive = activePlatform === p.id;
              return (
                <motion.button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`si-platform-card ${isActive ? 'active' : ''}`}
                  whileHover={{ x: isRtl ? -4 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    '--platform-color': p.color,
                    '--platform-bg-active': `${p.color}15`
                  }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="socialPlatformActivePill" 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `${p.color}15`,
                        border: `1px solid ${p.color}`,
                        borderRadius: '18px',
                        zIndex: 0
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <div className="si-platform-icon-wrap" style={{ zIndex: 1 }}>
                    <IconComponent size={22} />
                  </div>
                  
                  <div style={{ zIndex: 1, flex: 1 }}>
                    <div className="si-platform-title">
                      {lang === 'en' ? p.name_en : p.name_ar}
                    </div>
                    <div className="si-platform-sub">
                      {lang === 'en' ? p.desc_en : p.desc_ar}
                    </div>
                  </div>

                  {isActive && <CheckCircle2 size={18} color={p.color} style={{ zIndex: 1, flexShrink: 0 }} />}
                </motion.button>
              );
            })}
          </div>

          {/* ═══════════════ INSTRUCTIONS PANEL ═══════════════ */}
          <div className="si-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePlatform}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="si-content-panel"
              >
                {/* Panel Title Header */}
                <div>
                  <div 
                    className="si-header-badge" 
                    style={{ 
                      background: `${currentData.color}15`, 
                      color: currentData.color,
                      border: `1px solid ${currentData.color}35`
                    }}
                  >
                    <Sparkles size={12} />
                    <span>{lang === 'en' ? 'Integration Guide' : 'دليل التفعيل المباشر'}</span>
                  </div>
                  
                  <h3 className="si-detail-title">
                    {lang === 'en' ? currentData.title_en : currentData.title_ar}
                  </h3>
                  
                  <p className="si-detail-desc">
                    {lang === 'en' ? currentData.desc_en : currentData.desc_ar}
                  </p>
                </div>

                {/* Steps List Header */}
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text, #F8FAFC)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={18} color={currentData.color} />
                    <span>{lang === 'en' ? 'Step-by-Step Integration Guide' : 'خطوات الربط خطوة بخطوة'}</span>
                  </h4>
                  
                  <div className="si-steps-list">
                    {(lang === 'en' ? currentData.steps_en : currentData.steps_ar).map((step, idx) => (
                      <motion.div 
                        key={idx}
                        className="si-step-item"
                        initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <div 
                          className="si-step-num" 
                          style={{ 
                            background: `${currentData.color}20`, 
                            color: currentData.color, 
                            border: `1px solid ${currentData.color}40`
                          }}
                        >
                          {idx + 1}
                        </div>
                        <span style={{ paddingTop: '2px' }}>{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Pro Tip Card */}
                <div className="si-tip-card">
                  <Lightbulb size={22} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: '900', color: '#F59E0B', fontSize: '13px', marginBottom: '4px' }}>
                      {lang === 'en' ? 'Pro Tip:' : 'نصيحة للمحترفين:'}
                    </span>
                    <span style={{ color: 'var(--text, #F8FAFC)', fontSize: '12.5px', lineHeight: '1.6' }}>
                      {lang === 'en' ? currentData.tip_en : currentData.tip_ar}
                    </span>
                  </div>
                </div>

                {/* Actions Control Bar */}
                <div className="si-actions-bar">
                  <button 
                    onClick={() => navigate('/dashboard/settings')}
                    className="si-btn si-btn-primary"
                    style={{ background: currentData.color }}
                  >
                    <Settings size={15} />
                    <span>{lang === 'en' ? 'Go to Tracking Settings' : 'الذهاب لإعدادات أكواد التتبع'}</span>
                    {isRtl ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                  </button>

                  <button 
                    onClick={handleCopySteps}
                    className="si-btn si-btn-secondary"
                  >
                    <Copy size={15} />
                    <span>{lang === 'en' ? 'Copy Step Guidelines' : 'نسخ دليل الخطوات'}</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </ToolDashboardLayout>
  );
}

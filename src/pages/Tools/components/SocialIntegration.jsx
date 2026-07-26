import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Copy,
  Lightbulb,
  Wrench,
  ArrowRight,
  ArrowLeft,
  Settings,
  X,
  Activity,
  Cpu,
  Radio,
  Layers
} from 'lucide-react';
import './SocialIntegration.css';

export default function SocialIntegration({ stepNumber }) {
  const { state } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [activePlatform, setActivePlatform] = useState('meta');
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const platforms = [
    { 
      id: 'meta', 
      name_ar: 'Meta Pixel (فيسبوك وإنستجرام)', 
      name_en: 'Meta Pixel (FB & IG)', 
      desc_ar: 'تتبع زوار فيسبوك وإنستجرام', 
      desc_en: 'FB & Instagram Tracking', 
      IconComp: Share2, 
      color: '#6366F1',
      status_ar: 'نشط 100%',
      status_en: 'ACTIVE 100%',
      pos: { x: '20%', y: '25%' },
      mobileAngle: 0
    },
    { 
      id: 'tiktok', 
      name_ar: 'TikTok Pixel', 
      name_en: 'TikTok Pixel', 
      desc_ar: 'تتبع حملات تيك توك', 
      desc_en: 'TikTok Ad Conversions', 
      IconComp: Video, 
      color: '#818CF8',
      status_ar: 'جاهز للربط',
      status_en: 'READY TO LINK',
      pos: { x: '80%', y: '25%' },
      mobileAngle: 90
    },
    { 
      id: 'google', 
      name_ar: 'Google Analytics 4 (GA4)', 
      name_en: 'Google Analytics 4 (GA4)', 
      desc_ar: 'تحليل سلوك الزوار والزيارات', 
      desc_en: 'Traffic & Behavior Analytics', 
      IconComp: BarChart3, 
      color: '#6366F1',
      status_ar: 'تتبع متزامن',
      status_en: 'SYNCED',
      pos: { x: '20%', y: '75%' },
      mobileAngle: 180
    },
    { 
      id: 'snapchat', 
      name_ar: 'Snapchat Pixel', 
      name_en: 'Snapchat Pixel', 
      desc_ar: 'تتبع إعلانات سناب شات', 
      desc_en: 'Snapchat Ads Retargeting', 
      IconComp: Zap, 
      color: '#818CF8',
      status_ar: 'متصل بالبيكسل',
      status_en: 'CONNECTED',
      pos: { x: '80%', y: '75%' },
      mobileAngle: 270
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
      color: '#6366F1'
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
      color: '#818CF8'
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
      color: '#6366F1'
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
      color: '#818CF8'
    }
  };

  const currentData = contentMap[activePlatform];

  // Esc key listener to close inspector
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setInspectorOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopySteps = () => {
    const steps = (lang === 'en' ? currentData.steps_en : currentData.steps_ar).join('\n');
    const textToCopy = `${lang === 'en' ? currentData.title_en : currentData.title_ar}\n\n${steps}`;
    navigator.clipboard.writeText(textToCopy);
    toast(lang === 'en' ? 'Integration steps copied to clipboard! ✅' : 'تم نسخ خطوات الربط إلى الحافظة! ✅', 'success');
  };

  const handleNodeClick = (platformId) => {
    setActivePlatform(platformId);
    setInspectorOpen(true);
  };

  return (
    <ToolDashboardLayout
      id="social-integration"
      title={lang === 'en' ? 'Social & Pixel Integration Orbit' : 'مصفوفة ربط السوشيال والبيكسل'}
      subtitle={lang === 'en' ? 'Tracking pixels are the brains behind your ad campaigns. Connect your store to social platforms to track sales and retarget.' : 'أكواد التتبع (Pixels) هي العقل المدبر لحملاتك الإعلانية. اربط متجرك بمنصات التواصل لتتبع المبيعات وإعادة الاستهداف.'}
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="20 - 30"
    >
      <div className="si-orbit-workspace" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* ═══════════════ MOBILE HORIZONTAL PLATFORM DECK ═══════════════ */}
        <div className="si-mobile-deck">
          {platforms.map((p) => {
            const IconComp = p.IconComp;
            const isActive = activePlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleNodeClick(p.id)}
                className={`si-mobile-chip ${isActive ? 'active' : ''}`}
              >
                <IconComp size={16} />
                <span>{lang === 'en' ? p.name_en.split(' ')[0] : p.name_ar.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* ═══════════════ ORBITAL NODE CANVAS (DESKTOP / TABLET) ═══════════════ */}
        <div className="si-orbit-canvas-container">
          
          {/* Animated Electric Indigo Connecting Lines SVG */}
          <svg className="si-orbit-svg-lines" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Lines connecting center (500, 300) to 4 node coordinates */}
            <line x1="500" y1="300" x2="200" y2="150" className="si-orbit-line" />
            <line x1="500" y1="300" x2="800" y2="150" className="si-orbit-line" />
            <line x1="500" y1="300" x2="200" y2="450" className="si-orbit-line" />
            <line x1="500" y1="300" x2="800" y2="450" className="si-orbit-line" />
          </svg>

          {/* CENTRAL CORE NODE */}
          <div className="si-orbit-core-node">
            <div className="si-core-pulse-ring" />
            <div className="si-core-pulse-ring delay-1" />
            
            <div className="si-core-inner">
              <div className="si-core-icon-badge">
                <Cpu size={24} color="#6366F1" />
              </div>
              <div className="si-core-title">
                {lang === 'en' ? 'Social Integration Core' : 'محرك تتبع السوشيال والبيكسل'}
              </div>
              
              <div className="si-core-status-pill">
                <span className="si-status-dot" />
                <span>{lang === 'en' ? 'API GATEWAY: ONLINE' : 'بوابة التتبع: تعمل بنشاط'}</span>
              </div>

              {/* Metrics Bar */}
              <div className="si-core-metrics">
                <div className="si-metric-item">
                  <Activity size={12} color="#818CF8" />
                  <span>{lang === 'en' ? 'Connected: 4/4' : 'المتصل: 4 منصات'}</span>
                </div>
                <div className="si-metric-divider" />
                <div className="si-metric-item">
                  <Radio size={12} color="#6366F1" />
                  <span>{lang === 'en' ? 'Sync: 100%' : 'المزامنة: 100%'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PERIPHERAL PLATFORM NODES */}
          {platforms.map((p) => {
            const IconComp = p.IconComp;
            const isActive = activePlatform === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleNodeClick(p.id)}
                className={`si-orbit-node ${isActive ? 'active' : ''}`}
                style={{ left: p.pos.x, top: p.pos.y }}
              >
                <div className="si-node-pulse-halo" />
                <div className="si-node-icon-box">
                  <IconComp size={22} color="#818CF8" />
                </div>
                
                <div className="si-node-details">
                  <div className="si-node-name">
                    {lang === 'en' ? p.name_en : p.name_ar}
                  </div>
                  <div className="si-node-status-badge">
                    <CheckCircle2 size={11} color="#6366F1" />
                    <span>{lang === 'en' ? p.status_en : p.status_ar}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══════════════ IN-PLACE FOCUS INSPECTOR OVERLAY (REACT PORTAL) ═══════════════ */}
        {createPortal(
          <AnimatePresence>
            {inspectorOpen && (
              <div className="si-orbit-inspector-backdrop" dir={isRtl ? 'rtl' : 'ltr'} onClick={() => setInspectorOpen(false)}>
                <motion.div
                  className="si-orbit-inspector-card"
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header Control Bar */}
                  <div className="si-inspector-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="si-inspector-icon-wrap">
                        {React.createElement(platforms.find(p => p.id === activePlatform)?.IconComp || Share2, { size: 20 })}
                      </div>
                      <div>
                        <h3 className="si-inspector-title">
                          {lang === 'en' ? currentData.title_en : currentData.title_ar}
                        </h3>
                        <p className="si-inspector-sub">
                          {lang === 'en' ? currentData.desc_en : currentData.desc_ar}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectorOpen(false)}
                      className="si-inspector-close-btn"
                      title={lang === 'en' ? 'Close Orbit (Esc)' : 'إغلاق المدار (Esc)'}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Steps Section */}
                  <div className="si-inspector-body">
                    <h4 className="si-section-subtitle">
                      <Wrench size={16} color="#818CF8" />
                      <span>{lang === 'en' ? 'Step-by-Step Integration Guide' : 'خطوات الربط والتفعيل خطوة بخطوة'}</span>
                    </h4>

                    <div className="si-steps-list">
                      {(lang === 'en' ? currentData.steps_en : currentData.steps_ar).map((step, idx) => (
                        <div key={idx} className="si-step-item">
                          <div className="si-step-num">{idx + 1}</div>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pro Tip Card */}
                    <div className="si-tip-card">
                      <Lightbulb size={22} color="#6366F1" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <span className="si-tip-label">
                          {lang === 'en' ? 'Pro Tip:' : 'نصيحة للمحترفين:'}
                        </span>
                        <span className="si-tip-text">
                          {lang === 'en' ? currentData.tip_en : currentData.tip_ar}
                        </span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="si-actions-bar">
                      <button 
                        type="button"
                        onClick={() => {
                          setInspectorOpen(false);
                          navigate('/dashboard/settings');
                        }}
                        className="si-btn si-btn-primary"
                      >
                        <Settings size={15} />
                        <span>{lang === 'en' ? 'Go to Tracking Settings' : 'الذهاب لإعدادات أكواد التتبع'}</span>
                        {isRtl ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                      </button>

                      <button 
                        type="button"
                        onClick={handleCopySteps}
                        className="si-btn si-btn-secondary"
                      >
                        <Copy size={15} />
                        <span>{lang === 'en' ? 'Copy Step Guidelines' : 'نسخ دليل الخطوات'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      </div>
    </ToolDashboardLayout>
  );
}


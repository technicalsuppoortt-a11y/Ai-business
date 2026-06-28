import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function SocialIntegration({ stepNumber }) {
  const { state } = useApp();
  const lang = state.language || 'ar';

  const [activePlatform, setActivePlatform] = useState('meta');
  
  const platforms = [
    { id: 'meta', name: 'Meta Pixel', icon: '🔵' },
    { id: 'tiktok', name: 'TikTok Pixel', icon: '🎵' },
    { id: 'google', name: 'Google Analytics', icon: '📊' },
    { id: 'snapchat', name: 'Snapchat Pixel', icon: '👻' },
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

  return (
    <ToolDashboardLayout
      id="social-integration"
      title={lang === 'en' ? 'Social & Pixel Integration' : 'ربط السوشيال والبيكسل'}
      subtitle={lang === 'en' ? 'Tracking pixels are the brains behind your ad campaigns. Connect your store to social platforms to track sales and retarget.' : 'أكواد التتبع (Pixels) هي العقل المدبر لحملاتك الإعلانية. اربط متجرك بمنصات التواصل لتتبع المبيعات وإعادة الاستهداف.'}
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="20 - 30"
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        
        {/* ═══════════════ PLATFORMS SELECTION ═══════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
                borderRadius: '16px',
                background: activePlatform === p.id ? `${contentMap[p.id].color}20` : 'rgba(13, 18, 32, 0.6)',
                border: `1px solid ${activePlatform === p.id ? contentMap[p.id].color : 'rgba(255,255,255,0.05)'}`,
                color: activePlatform === p.id ? '#fff' : '#8B96A8',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: lang === 'en' ? 'left' : 'right'
              }}
            >
              <span style={{ fontSize: '32px' }}>{p.icon}</span>
              <span style={{ fontSize: '15px', fontWeight: '900', color: activePlatform === p.id ? contentMap[p.id].color : '#E8EDF5' }}>
                {p.name}
              </span>
            </button>
          ))}
        </div>

        {/* ═══════════════ INSTRUCTIONS PANEL ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: `${currentData.color}40`, background: 'rgba(13, 18, 32, 0.6)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: currentData.color, marginBottom: '12px' }}>
            {lang === 'en' ? currentData.title_en : currentData.title_ar}
          </h3>
          <p style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.7', marginBottom: '24px' }}>
            {lang === 'en' ? currentData.desc_en : currentData.desc_ar}
          </p>

          <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛠️</span> {lang === 'en' ? 'Step by Step Integration' : 'خطوات الربط خطوة بخطوة'}
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {(lang === 'en' ? currentData.steps_en : currentData.steps_ar).map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ 
                  flexShrink: 0, 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: `${currentData.color}20`, 
                  color: currentData.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  border: `1px solid ${currentData.color}40`
                }}>
                  {idx + 1}
                </div>
                <p style={{ color: '#8B96A8', fontSize: '13px', lineHeight: '1.6', margin: 0, paddingTop: '2px' }}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <div>
              <span style={{ display: 'block', fontWeight: '900', color: '#F59E0B', fontSize: '12px', marginBottom: '4px' }}>
                {lang === 'en' ? 'Pro Tip:' : 'نصيحة للمحترفين:'}
              </span>
              <span style={{ color: '#E8EDF5', fontSize: '12px', lineHeight: '1.6' }}>
                {lang === 'en' ? currentData.tip_en : currentData.tip_ar}
              </span>
            </div>
          </div>
        </div>

      </div>

    </ToolDashboardLayout>
  );
}

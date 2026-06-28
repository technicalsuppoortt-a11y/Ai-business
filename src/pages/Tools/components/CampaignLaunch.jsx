import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function CampaignLaunch({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  
  // Inputs
  const [url, setUrl] = useState(state.websiteUrl || '');
  const [source, setSource] = useState('facebook');
  const [medium, setMedium] = useState('cpc');
  const [campaignName, setCampaignName] = useState('launch_offer');

  const sources = ['facebook', 'instagram', 'tiktok', 'google', 'snapchat', 'email'];
  const mediums = ['cpc', 'social', 'email', 'organic', 'affiliate'];

  const generatedUrl = url ? `${url}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaignName}` : '';

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    alert(lang === 'en' ? 'Link copied! Use it now in your ad campaign.' : 'تم نسخ الرابط! استخدمه الآن في حملتك الإعلانية.');
    dispatch({ type: 'COMPLETE_STEP', payload: 'campaign-launch' });
  };

  const bottomSections = [
    {
      icon: '🔗',
      title: lang === 'en' ? 'What are UTM Links?' : 'ما هي روابط الـ UTM؟',
      items: [
        lang === 'en' ? 'They are small additions placed at the end of your site link to tell you exactly where the customer came from.' : 'هي إضافات صغيرة توضع في نهاية رابط موقعك لتخبرك من أين جاء العميل بالتحديد.',
        lang === 'en' ? 'Without them, it will show up in analytics as (Direct/None) and you won\'t know which ad brought the sales.' : 'بدونها، سيظهر لك في الإحصائيات (Direct/None) ولن تعرف أي إعلان حقق لك المبيعات.',
        lang === 'en' ? 'They help you know the winning ad (which budget should be increased) and the losing ad (which should be stopped).' : 'تساعدك في معرفة الإعلان الرابح (الذي تجب زيادة ميزانيته) والإعلان الخاسر (الذي يجب إيقافه).'
      ]
    },
    {
      icon: '📈',
      title: lang === 'en' ? 'Post-Launch Tips' : 'نصائح بعد الإطلاق',
      items: [
        lang === 'en' ? 'Do not touch the ad in the first 48 hours! The algorithm needs time to learn and find potential buyers.' : 'لا تلمس الإعلان في أول 48 ساعة! الخوارزمية تحتاج وقتاً لتتعلم وتجد المشترين المحتملين.',
        lang === 'en' ? 'Monitor CPC initially, then monitor CPA after the third day.' : 'راقب تكلفة النقرة (CPC) في البداية، ثم راقب تكلفة الاستحواذ (CPA) بعد اليوم الثالث.',
        lang === 'en' ? 'If the numbers are very bad on the first day (very high CPC), the ad itself is bad and needs to be changed.' : 'إذا كانت الأرقام سيئة جداً في اليوم الأول (تكلفة نقرة عالية جداً)، فالإعلان نفسه سيء ويحتاج تغييراً.'
      ]
    }
  ];

  return (
    <ToolDashboardLayout
      id="campaign-launch"
      title={lang === 'en' ? 'Campaign Launch & Tracking (UTM)' : 'الإطلاق وبناء التتبع (UTM)'}
      subtitle={lang === 'en' ? 'Prepare your tracking links before launching the ad so you know exactly which campaign and which ad brings you sales.' : 'جهّز روابطك التتبعية قبل إطلاق الإعلان لتعرف بالضبط أي حملة وأي إعلان يجلب لك المبيعات.'}
      stepNumber={stepNumber}
      accentColor="#10B981"
      timeEstimate="20 - 40"
      bottomSections={bottomSections}
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Landing Page URL' : 'رابط صفحة الهبوط (URL)'}
            </label>
            <input 
              type="text" 
              className="td-input"
              dir="ltr"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourstore.com/offer"
              style={{ textAlign: 'left', borderColor: url ? '#10B981' : 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {lang === 'en' ? 'Source' : 'المصدر (Source)'}
              </label>
              <select 
                className="td-input"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{ appearance: 'none', background: 'rgba(0,0,0,0.3) url("data:image/svg+xml;utf8,<svg fill=\'%238B96A8\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>") no-repeat right 12px center' }}
              >
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {lang === 'en' ? 'Medium' : 'الوسيط (Medium)'}
              </label>
              <select 
                className="td-input"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                style={{ appearance: 'none', background: 'rgba(0,0,0,0.3) url("data:image/svg+xml;utf8,<svg fill=\'%238B96A8\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>") no-repeat right 12px center' }}
              >
                {mediums.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Campaign Name' : 'اسم الحملة (Campaign Name)'}
            </label>
            <input 
              type="text" 
              className="td-input"
              dir="ltr"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value.replace(/\s+/g, '_'))}
              placeholder="summer_sale"
              style={{ textAlign: 'left', borderColor: campaignName ? '#10B981' : 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>

        </div>

        {/* ═══════════════ OUTPUT PANEL ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(13, 18, 32, 0.6)' }}>
          
          {!url && (
            <div style={{ textAlign: 'center', opacity: 0.4 }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔗</span>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E8EDF5' }}>
                {lang === 'en' ? 'Enter your site URL to generate the tracking link' : 'أدخل رابط موقعك لإنشاء رابط التتبع'}
              </p>
            </div>
          )}

          {url && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#10B981', textAlign: 'center' }}>
                {lang === 'en' ? 'Ready link for the ad:' : 'الرابط الجاهز للإعلان:'}
              </h3>
              
              <div style={{ background: '#000', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', width: '100%', overflowX: 'auto' }}>
                <code style={{ color: '#E8EDF5', fontSize: '13px', whiteSpace: 'nowrap' }} dir="ltr">
                  {generatedUrl}
                </code>
              </div>

              <button 
                onClick={handleCopy}
                className="td-btn-primary"
                style={{ background: '#10B981', color: '#fff', width: '100%' }}
              >
                📋 {lang === 'en' ? 'Copy Link and Launch!' : 'نسخ الرابط والانطلاق!'}
              </button>

            </div>
          )}

        </div>

      </div>

    </ToolDashboardLayout>
  );
}

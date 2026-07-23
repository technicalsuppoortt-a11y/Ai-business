import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link,
  Globe,
  Camera,
  Video,
  PlaySquare,
  Share2,
  Mail,
  MousePointerClick,
  Search,
  Award,
  Tag,
  Sparkles,
  Copy,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  HelpCircle,
  Activity,
  Layers,
  ExternalLink
} from 'lucide-react';
import './CampaignLaunch.css';

export default function CampaignLaunch({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  // Inputs
  const [url, setUrl] = useState(state.websiteUrl || '');
  const [source, setSource] = useState('facebook');
  const [medium, setMedium] = useState('cpc');
  const [campaignName, setCampaignName] = useState('launch_offer');

  const sources = [
    { id: 'facebook', label: 'Facebook', IconComp: Globe },
    { id: 'instagram', label: 'Instagram', IconComp: Camera },
    { id: 'tiktok', label: 'TikTok', IconComp: Video },
    { id: 'google', label: 'Google', IconComp: Search },
    { id: 'snapchat', label: 'Snapchat', IconComp: PlaySquare },
    { id: 'email', label: 'Email', IconComp: Mail }
  ];

  const mediums = [
    { id: 'cpc', label: 'CPC / Paid', IconComp: MousePointerClick },
    { id: 'social', label: 'Social', IconComp: Share2 },
    { id: 'email', label: 'Email', IconComp: Mail },
    { id: 'organic', label: 'Organic', IconComp: Search },
    { id: 'affiliate', label: 'Affiliate', IconComp: Award }
  ];

  const generatedUrl = url ? `${url}${url.includes('?') ? '&' : '?'}utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaignName}` : '';

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    toast(lang === 'en' ? 'Tracking URL copied! Ready to launch. 🚀' : 'تم نسخ رابط التتبع بنجاح! جاهز للإطلاق. 🚀', 'success');
    dispatch({ type: 'COMPLETE_STEP', payload: 'campaign-launch' });
  };

  const bottomSections = [
    {
      icon: <Link size={18} color="#10B981" />,
      title: lang === 'en' ? 'What are UTM Links?' : 'ما هي روابط الـ UTM؟',
      items: [
        lang === 'en' ? 'They are small additions placed at the end of your site link to tell you exactly where the customer came from.' : 'هي إضافات صغيرة توضع في نهاية رابط موقعك لتخبرك من أين جاء العميل بالتحديد.',
        lang === 'en' ? 'Without them, it will show up in analytics as (Direct/None) and you won\'t know which ad brought the sales.' : 'بدونها، سيظهر لك في الإحصائيات (Direct/None) ولن تعرف أي إعلان حقق لك المبيعات.',
        lang === 'en' ? 'They help you know the winning ad (which budget should be increased) and the losing ad (which should be stopped).' : 'تساعدك في معرفة الإعلان الرابح (الذي تجب زيادة ميزانيته) والإعلان الخاسر (الذي يجب إيقافه).'
      ]
    },
    {
      icon: <Rocket size={18} color="#F59E0B" />,
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
      <div className="cl-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="cl-main-grid">
          
          {/* ═══════════════ INPUTS FORM PANEL ═══════════════ */}
          <div className="cl-panel">
            <div className="cl-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Rocket size={20} />
              </div>
              <div>
                <h3 className="cl-panel-title">
                  <span>{lang === 'en' ? 'UTM Tracking Parameters' : 'معايير روابط التتبع (UTM)'}</span>
                </h3>
                <p className="cl-panel-subtitle">
                  {lang === 'en' ? 'Configure landing page URL, ad platform source, and campaign tag.' : 'أدخل رابط موقعك واختر المنصة واسم الحملة لإنشاء رابط التتبع.'}
                </p>
              </div>
            </div>

            {/* Landing Page URL */}
            <div className="cl-form-group">
              <label className="cl-label">
                <Link size={14} color="#10B981" />
                <span>{lang === 'en' ? 'Landing Page URL' : 'رابط صفحة الهبوط (URL)'}</span>
              </label>
              <div className="cl-input-wrap">
                <ExternalLink size={16} className="cl-input-icon" />
                <input 
                  type="text" 
                  className="cl-input"
                  dir="ltr"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourstore.com/offer"
                />
              </div>
            </div>

            {/* Source Platform Grid */}
            <div className="cl-form-group">
              <label className="cl-label">
                <Globe size={14} color="#10B981" />
                <span>{lang === 'en' ? 'Source (Platform)' : 'المصدر (Source)'}</span>
              </label>

              <div className="cl-source-grid">
                {sources.map(s => {
                  const SourceIcon = s.IconComp;
                  const isActive = source === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSource(s.id)}
                      className={`cl-source-btn ${isActive ? 'active' : ''}`}
                    >
                      <SourceIcon size={14} color={isActive ? '#10B981' : 'var(--text2, #94A3B8)'} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medium Selector */}
            <div className="cl-form-group">
              <label className="cl-label">
                <MousePointerClick size={14} color="#10B981" />
                <span>{lang === 'en' ? 'Medium (Traffic Type)' : 'الوسيط (Medium)'}</span>
              </label>

              <div className="cl-source-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
                {mediums.map(m => {
                  const MediumIcon = m.IconComp;
                  const isActive = medium === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMedium(m.id)}
                      className={`cl-source-btn ${isActive ? 'active' : ''}`}
                    >
                      <MediumIcon size={14} color={isActive ? '#10B981' : 'var(--text2, #94A3B8)'} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campaign Name */}
            <div className="cl-form-group" style={{ marginBottom: 0 }}>
              <label className="cl-label">
                <Tag size={14} color="#10B981" />
                <span>{lang === 'en' ? 'Campaign Name' : 'اسم الحملة (Campaign Name)'}</span>
              </label>
              <div className="cl-input-wrap">
                <Tag size={16} className="cl-input-icon" />
                <input 
                  type="text" 
                  className="cl-input"
                  dir="ltr"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value.replace(/\s+/g, '_'))}
                  placeholder="summer_sale_2026"
                />
              </div>
            </div>

          </div>

          {/* ═══════════════ OUTPUT URL PANEL ═══════════════ */}
          <div className="cl-panel">
            <div className="cl-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="cl-panel-title">
                  <span>{lang === 'en' ? 'Generated Tracking URL' : 'رابط التتبع الجاهز للإعلانات'}</span>
                </h3>
                <p className="cl-panel-subtitle">
                  {lang === 'en' ? 'Use this full link in your ad creatives to track conversion sources.' : 'استخدم هذا الرابط في إعلاناتك لمتابعة المصدر بالتحليلات.'}
                </p>
              </div>
            </div>

            <div style={{ minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
              {!url ? (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Link size={28} />
                  </div>
                  <p style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text, #F8FAFC)', margin: '0 0 6px 0' }}>
                    {lang === 'en' ? 'Enter your site URL to generate the tracking link' : 'أدخل رابط موقعك لإنشاء رابط التتبع'}
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text2, #94A3B8)', margin: 0 }}>
                    {lang === 'en' ? 'Track exactly which ad creative and platform brings your orders.' : 'تتبع بالضبط الإعلان والمنصة التي تجلب لك المبيعات.'}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', margin: 'auto 0' }}
                  >
                    {/* Live URL Box */}
                    <div className="cl-url-box">
                      <code className="cl-url-code" dir="ltr">
                        {generatedUrl}
                      </code>
                    </div>

                    {/* Breakdown Badges */}
                    <div className="cl-badge-grid">
                      <div className="cl-utm-badge">
                        <span>Source:</span>
                        <strong>{source}</strong>
                      </div>
                      <div className="cl-utm-badge">
                        <span>Medium:</span>
                        <strong>{medium}</strong>
                      </div>
                      <div className="cl-utm-badge">
                        <span>Campaign:</span>
                        <strong>{campaignName}</strong>
                      </div>
                    </div>

                    {/* Copy Button */}
                    <button 
                      onClick={handleCopy}
                      className="cl-copy-btn"
                    >
                      <Copy size={16} />
                      <span>{lang === 'en' ? 'Copy Link and Complete Step!' : 'نسخ الرابط وإكمال الخطوة!'}</span>
                    </button>

                  </motion.div>
                </AnimatePresence>
              )}
            </div>

          </div>

        </div>
      </div>
    </ToolDashboardLayout>
  );
}

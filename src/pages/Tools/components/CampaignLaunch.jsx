import React, { useState, useEffect, useRef } from 'react';
import useToolCache from '../../../hooks/useToolCache';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
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
  ExternalLink,
  Sliders,
  RotateCcw,
  Wrench,
  Compass,
  Check,
  Terminal,
  Zap
} from 'lucide-react';
import './CampaignLaunch.css';

export default function CampaignLaunch({ stepNumber }) {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  // Inputs & Hooks
  const [url, setUrl] = useState(state.websiteUrl || '');
  const [source, setSource] = useState('facebook');
  const [medium, setMedium] = useState('cpc');
  const [campaignName, setCampaignName] = useState('launch_offer');

  // --- STATE PERSISTENCE & HYDRATION ---
  const { cachedData, isLoadingCache, saveResult } = useToolCache(userData?.uid, 'campaign-launch');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!isLoadingCache && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cachedData?.inputs) {
        if (cachedData.inputs.url !== undefined) setUrl(cachedData.inputs.url);
        if (cachedData.inputs.source !== undefined) setSource(cachedData.inputs.source);
        if (cachedData.inputs.medium !== undefined) setMedium(cachedData.inputs.medium);
        if (cachedData.inputs.campaignName !== undefined) setCampaignName(cachedData.inputs.campaignName);
      } else if (cachedData) {
        // Fallback for old cache structure
        if (cachedData.url !== undefined) setUrl(cachedData.url);
        if (cachedData.source !== undefined) setSource(cachedData.source);
        if (cachedData.medium !== undefined) setMedium(cachedData.medium);
        if (cachedData.campaignName !== undefined) setCampaignName(cachedData.campaignName);
      }
    }
  }, [isLoadingCache, cachedData]);

  useEffect(() => {
    if (isLoadingCache || !hydratedRef.current) return;
    // Immediate save, no debounce
    saveResult({ inputs: { url, source, medium, campaignName } });
  }, [isLoadingCache, url, source, medium, campaignName]);
  // -------------------------------------

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

  // Dynamic Real-time Output URL
  const generatedUrl = url 
    ? `${url}${url.includes('?') ? '&' : '?'}utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaignName}` 
    : '';

  const rawBase = url ? url.split('?')[0] : '';
  const sep = url && url.includes('?') ? '&' : '?';

  const handleCopy = () => {
    if (!generatedUrl) {
      toast(lang === 'en' ? 'Please enter a landing page URL first!' : 'يرجى أدخال رابط صفحة الهبوط أولاً!', 'warning');
      return;
    }
    navigator.clipboard.writeText(generatedUrl);
    toast(lang === 'en' ? 'UTM Link copied to clipboard!' : 'تم نسخ رابط التتبع إلى الحافظة بنجاح!', 'success');
    dispatch({ type: 'COMPLETE_STEP', payload: 'campaign-launch' });
  };

  const bottomSections = [
    {
      icon: <Link size={18} color="#6366F1" />,
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

  if (isLoadingCache || !hydratedRef.current) {
    return (
      <ToolDashboardLayout
        id="campaign-launch"
        title={lang === 'en' ? 'UTM Live Pipeline Builder' : 'منشئ ومجمّع مسار التتبع الحي (UTM Live Pipeline)'}
        subtitle={lang === 'en' ? 'Loading saved workspace...' : 'جاري تحميل مساحة العمل...'}
        stepNumber={stepNumber}
        accentColor="#6366F1"
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Sleek Skeleton Loader */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ height: "150px", flex: 1, background: "rgba(255,255,255,0.02)", borderRadius: "12px", animation: "pulse 1.5s infinite" }}></div>
            <div style={{ height: "150px", flex: 1, background: "rgba(255,255,255,0.02)", borderRadius: "12px", animation: "pulse 1.5s infinite" }}></div>
            <div style={{ height: "150px", flex: 1, background: "rgba(255,255,255,0.02)", borderRadius: "12px", animation: "pulse 1.5s infinite" }}></div>
          </div>
          <div style={{ height: "80px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", animation: "pulse 1.5s infinite" }}></div>
        </div>
      </ToolDashboardLayout>
    );
  }

  return (
    <ToolDashboardLayout
      id="campaign-launch"
      title={lang === 'en' ? 'UTM Live Pipeline Builder' : 'منشئ ومجمّع مسار التتبع الحي (UTM Live Pipeline)'}
      subtitle={lang === 'en' ? 'Real-time data streaming pipeline with interconnected glassmorphic nodes and instant UTM dispatch.' : 'مسار متكامل لتدفق بيانات التتبع لحظياً عبر محطات ذكية ومخرجات موجهة مباشرة.'}
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="20 - 40"
      bottomSections={bottomSections}
    >
      <div className="cl-container" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* ═══════════════ LIVE PIPELINE FLOW BUILDER ═══════════════ */}
        <div className="cl-pipeline-flow-wrapper">
          
          {/* PIPELINE GRID STATIONS (1 to 3) */}
          <div className="cl-pipeline-grid">
            
            {/* 🚰 STATION 1: LANDING PAGE RESERVOIR */}
            <motion.div 
              className="cl-node-card cl-station-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="cl-node-header">
                <div className="cl-station-badge">
                  <span className="cl-badge-dot" />
                  <span>{lang === 'en' ? 'Station 01 · Reservoir' : 'محطة 1 · خزان الرابط'}</span>
                </div>
                <Link size={16} className="cl-node-icon" />
              </div>

              <div className="cl-node-content">
                <h5 className="cl-tile-title">
                  <ExternalLink size={15} />
                  <span>{lang === 'en' ? 'Target Landing Page URL' : 'رابط صفحة الهبوط الأساسي'}</span>
                </h5>
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

              {/* Glowing Connector Pipe to Station 2 */}
              <div className="cl-connector-pipe vertical-mobile">
                <motion.div 
                  className="cl-pipe-glow-line"
                  animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </motion.div>

            {/* 🔀 STATION 2: PARAMETER INJECTION STATION */}
            <motion.div 
              className="cl-node-card cl-station-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="cl-node-header">
                <div className="cl-station-badge">
                  <span className="cl-badge-dot active" />
                  <span>{lang === 'en' ? 'Station 02 · Injection' : 'محطة 2 · حقن المعاملات'}</span>
                </div>
                <Sliders size={16} className="cl-node-icon" />
              </div>

              <div className="cl-dual-branch-container">
                {/* TOP BRANCH: SOURCE PLATFORMS */}
                <div className="cl-branch-channel">
                  <h5 className="cl-tile-title">
                    <Globe size={15} />
                    <span>{lang === 'en' ? 'Source Platform Channels' : 'قنوات منصة المصدر (Source)'}</span>
                  </h5>
                  <div className="cl-chip-flow scrollable">
                    {sources.map(s => {
                      const SourceIcon = s.IconComp;
                      const isActive = source === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSource(s.id)}
                          className={`cl-chip-btn ${isActive ? 'active' : ''}`}
                        >
                          <SourceIcon size={14} color={isActive ? '#818CF8' : '#94A3B8'} />
                          <span>{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="cl-branch-divider" />

                {/* BOTTOM BRANCH: MEDIUM PRESETS */}
                <div className="cl-branch-channel">
                  <h5 className="cl-tile-title">
                    <MousePointerClick size={15} />
                    <span>{lang === 'en' ? 'Medium Presets Channels' : 'وسائط التناقل (Medium)'}</span>
                  </h5>
                  <div className="cl-chip-flow scrollable">
                    {mediums.map(m => {
                      const MediumIcon = m.IconComp;
                      const isActive = medium === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMedium(m.id)}
                          className={`cl-chip-btn ${isActive ? 'active' : ''}`}
                        >
                          <MediumIcon size={14} color={isActive ? '#818CF8' : '#94A3B8'} />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Converging Junction Pipe to Station 3 */}
              <div className="cl-connector-pipe vertical-mobile">
                <motion.div 
                  className="cl-pipe-glow-line"
                  animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </motion.div>

            {/* 🏷️ STATION 3: CAMPAIGN TAGGING STATION */}
            <motion.div 
              className="cl-node-card cl-station-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="cl-node-header">
                <div className="cl-station-badge">
                  <span className="cl-badge-dot purple" />
                  <span>{lang === 'en' ? 'Station 03 · Tagging' : 'محطة 3 · وسم الحملة'}</span>
                </div>
                <Tag size={16} className="cl-node-icon" />
              </div>

              <div className="cl-node-content">
                <h5 className="cl-tile-title">
                  <Tag size={15} />
                  <span>{lang === 'en' ? 'Campaign Tag Name' : 'اسم وسجل الحملة (Campaign Tag)'}</span>
                </h5>
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
                <span className="cl-node-subnote">
                  {lang === 'en' ? 'Spaces automatically convert to underscores.' : 'تحويل المسافات تلقائياً إلى شرطة سفلية _'}
                </span>
              </div>
            </motion.div>

          </div>

          {/* 🛢️ STATION 4: THE FINAL UTM TERMINAL VAULT */}
          <div className="cl-custom-scroll" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px', borderRadius: '24px' }}>
          <motion.div 
            className="cl-terminal-container cl-station-4-vault"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="cl-terminal-header">
              <div className="cl-terminal-title">
                <Terminal size={18} />
                <span>{lang === 'en' ? 'Station 04 · UTM Terminal Vault' : 'محطة 4 · خزنة ومخرج رابط الـ UTM النهائي'}</span>
              </div>
              <div className="cl-terminal-dots">
                <span className="cl-terminal-dot" style={{ background: '#EF4444' }} />
                <span className="cl-terminal-dot" style={{ background: '#F59E0B' }} />
                <span className="cl-terminal-dot" style={{ background: '#10B981' }} />
              </div>
            </div>

            {/* Real-time Color Coded Terminal Window */}
            <div className="cl-terminal-body" dir="ltr">
              <span className={rawBase ? "cl-token-base" : "cl-token-placeholder"}>
                {rawBase || 'https://yourstore.com/offer'}
              </span>
              <span className="cl-token-sep">{sep}utm_source=</span>
              <span className={source ? "cl-token-source" : "cl-token-placeholder"}>
                {source || '[SELECT_SOURCE]'}
              </span>
              <span className="cl-token-sep">&utm_medium=</span>
              <span className={medium ? "cl-token-medium" : "cl-token-placeholder"}>
                {medium || '[SELECT_MEDIUM]'}
              </span>
              <span className="cl-token-sep">&utm_campaign=</span>
              <span className={campaignName ? "cl-token-campaign" : "cl-token-placeholder"}>
                {campaignName || '[CAMPAIGN_TAG]'}
              </span>
            </div>

            {/* Digital Telemetry Gauges */}
            <div className="cl-parameter-breakdown">
              <div className="cl-breakdown-chip telemetry-source">
                <Globe size={13} style={{ color: '#38BDF8' }} />
                <span>Source Gauge: <strong>{source}</strong></span>
              </div>
              <div className="cl-breakdown-chip telemetry-medium">
                <MousePointerClick size={13} style={{ color: '#34D399' }} />
                <span>Medium Gauge: <strong>{medium}</strong></span>
              </div>
              <div className="cl-breakdown-chip telemetry-campaign">
                <Tag size={13} style={{ color: '#C084FC' }} />
                <span>Campaign Gauge: <strong>{campaignName}</strong></span>
              </div>
            </div>

            {/* Tactical Action Dock Valves */}
            <div className="cl-tactical-dock">
              <button
                type="button"
                onClick={handleCopy}
                className="cl-dock-btn primary"
              >
                <Copy size={16} />
                <span>{lang === 'en' ? '1-Click Copy UTM Link' : 'نسخ فوري لرابط الـ UTM'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'COMPLETE_STEP', payload: 'campaign-launch' });
                  toast(lang === 'en' ? 'Campaign Tag saved to tracker!' : 'تم حفظ اسم وسجل الحملة بنجاح!', 'success');
                }}
                className="cl-dock-btn"
              >
                <CheckCircle2 size={16} style={{ color: '#34D399' }} />
                <span>{lang === 'en' ? 'Save Campaign Tag' : 'حفظ وسجل الحملة'}</span>
              </button>
            </div>
          </motion.div>

        </div>
        </div>

      </div>
    </ToolDashboardLayout>
  );
}

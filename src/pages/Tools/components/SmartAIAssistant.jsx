import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { callGemini } from '../../../services/geminiService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Handshake,
  Repeat,
  TrendingUp,
  Mail,
  Briefcase,
  Share2,
  MessageSquare,
  Video,
  Rocket,
  Building2,
  Store,
  Tag,
  Banknote,
  Crown,
  Target,
  Key,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  FileText,
  ShieldAlert,
  Calendar,
  Clock,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Bot,
  Brain,
  Zap,
  HelpCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Lightbulb
} from 'lucide-react';
import './SmartAIAssistant.css';

const GOAL_OPTIONS = [
  { id: 'close_deal', name_ar: 'إغلاق صفقة أولى', name_en: 'Close First Deal', IconComp: Handshake },
  { id: 'retainer', name_ar: 'اتفاق شهري مستمر (Retainer)', name_en: 'Monthly Retainer', IconComp: Repeat },
  { id: 'upsell', name_ar: 'زيادة مبيعات لعميل قائم (Upsell)', name_en: 'Upsell Existing Client', IconComp: TrendingUp }
];

const CHANNEL_OPTIONS = [
  { id: 'cold_email', name_ar: 'إيميل بارد مباشر', name_en: 'Direct Cold Email', IconComp: Mail },
  { id: 'upwork', name_ar: 'منصات العمل الحر (Upwork/Fiverr)', name_en: 'Freelance Platforms', IconComp: Briefcase },
  { id: 'linkedin', name_ar: 'لينكد إن (LinkedIn)', name_en: 'LinkedIn Outreach', IconComp: Share2 },
  { id: 'instagram', name_ar: 'سوشيال ميديا (Insta/TikTok DMs)', name_en: 'Social Media DMs', IconComp: MessageSquare }
];

const CLIENT_OPTIONS = [
  { id: 'creators', name_ar: 'صناع المحتوى والمؤثرين', name_en: 'Content Creators', IconComp: Video },
  { id: 'startups', name_ar: 'الشركات الناشئة والتقنية', name_en: 'Startups & Tech Companies', IconComp: Rocket },
  { id: 'enterprise', name_ar: 'الشركات الكبرى والمؤسسات', name_en: 'Enterprise Corporates', IconComp: Building2 },
  { id: 'local_shops', name_ar: 'المحلات والأنشطة المحلية', name_en: 'Local Shops & Businesses', IconComp: Store }
];

const PRICING_OPTIONS = [
  { id: 'low', name_ar: 'اقتصادي جداً (Low Budget)', name_en: 'Low Budget / Entry-level', IconComp: Tag },
  { id: 'mid', name_ar: 'متوسط ومنافس (Mid Ticket)', name_en: 'Mid Ticket / Competitive', IconComp: Banknote },
  { id: 'premium', name_ar: 'مرتفع/بريميوم (High Ticket)', name_en: 'High Ticket Premium', IconComp: Crown }
];

const extractJSON = (text) => {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return text.substring(start, end + 1);
    }
  } catch (e) {
    console.error('Error extracting JSON string', e);
  }
  return text;
};

export default function SmartAIAssistant({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toastContext = useToast();
  const toast = toastContext?.toast || ((msg) => console.log(msg));

  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  // Selection states
  const [selectedGoal, setSelectedGoal] = useState('close_deal');
  const [selectedChannel, setSelectedChannel] = useState('cold_email');
  const [selectedClient, setSelectedClient] = useState('creators');
  const [selectedPricing, setSelectedPricing] = useState('mid');

  // Gemini API Key Modal
  const [tempApiKey, setTempApiKey] = useState(state.apiKey || '');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // AI loading and output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [result, setResult] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  useEffect(() => {
    if (state.apiKey) {
      setTempApiKey(state.apiKey);
    }
  }, [state.apiKey]);

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) return;
    setIsSavingKey(true);
    try {
      if (tempApiKey.length < 20) throw new Error('Invalid API Key');
      dispatch({ type: 'UPDATE_USER_DATA', payload: { apiKey: tempApiKey.trim() } });
      setShowKeyModal(false);
      toast(lang === 'en' ? 'Gemini API Key saved successfully!' : 'تم حفظ مفتاح Gemini بنجاح!', 'success');
    } catch (err) {
      toast(lang === 'en' ? 'Invalid API key format.' : 'صيغة مفتاح API غير صحيحة.', 'error');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleGenerate = async () => {
    if (analysisMode === 'live') {
      setIsGenerating(true);
      setResult(null);
      try {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'smart-ai-assistant',
          inputs: { selectedGoal, selectedChannel, selectedClient, selectedPricing },
          context: { niche: state.niche, subNiche: state.subNiche, user: state.user },
          lang
        });

        const isObj = typeof liveResult === 'object' && liveResult !== null;
        const textFallback = typeof liveResult === 'string' ? liveResult : JSON.stringify(liveResult);

        const formattedResult = isObj ? {
          is_combination_ideal: liveResult.is_combination_ideal ?? true,
          verdict_badge_ar: liveResult.verdict_badge_ar || 'مزيج استراتيجي عالي الكفاءة',
          verdict_badge_en: liveResult.verdict_badge_en || 'High Efficiency Strategy',
          expert_verdict_ar: liveResult.expert_verdict_ar || liveResult.expert_verdict || textFallback,
          expert_verdict_en: liveResult.expert_verdict_en || liveResult.expert_verdict || textFallback,
          recommended_action_ar: liveResult.recommended_action_ar || '',
          recommended_action_en: liveResult.recommended_action_en || '',
          strategy_title_ar: liveResult.strategy_title_ar || 'استراتيجية النمو المباشرة بالذكاء الاصطناعي',
          strategy_title_en: liveResult.strategy_title_en || 'Live AI Custom Growth Strategy',
          strategy_desc_ar: liveResult.strategy_desc_ar || liveResult.expert_verdict_ar || textFallback,
          strategy_desc_en: liveResult.strategy_desc_en || liveResult.expert_verdict_en || textFallback,
          outreach_subject_ar: liveResult.outreach_subject_ar || 'فكرة مخصصة لتنمية أرباحكم',
          outreach_subject_en: liveResult.outreach_subject_en || 'Custom Idea to Scale Your Revenue',
          outreach_script_ar: liveResult.outreach_script_ar || liveResult.outreach_script || textFallback,
          outreach_script_en: liveResult.outreach_script_en || liveResult.outreach_script || textFallback,
          objections: Array.isArray(liveResult.objections) ? liveResult.objections : [],
          followups: Array.isArray(liveResult.followups) ? liveResult.followups : []
        } : {
          is_combination_ideal: true,
          verdict_badge_ar: 'مزيج استراتيجي عالي الكفاءة',
          verdict_badge_en: 'High Efficiency Strategy',
          expert_verdict_ar: textFallback,
          expert_verdict_en: textFallback,
          recommended_action_ar: '',
          recommended_action_en: '',
          strategy_title_ar: 'استراتيجية النمو المباشرة بالذكاء الاصطناعي',
          strategy_title_en: 'Live AI Custom Growth Strategy',
          strategy_desc_ar: textFallback,
          strategy_desc_en: textFallback,
          outreach_subject_ar: 'فرصة زيادة المبيعات واستحواذ العملاء',
          outreach_subject_en: 'Client Acquisition & Scaling Opportunity',
          outreach_script_ar: textFallback,
          outreach_script_en: textFallback,
          objections: [],
          followups: []
        };

        setResult(formattedResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'smart-ai-assistant',
          data: { selectedGoal, selectedChannel, selectedClient, selectedPricing, result: formattedResult, mode: 'live' }
        });
        toast(lang === 'en' ? 'AI Strategy generated successfully!' : 'تم تحليل وصياغة الاستراتيجية بنجاح!', 'success');
      } catch (err) {
        console.error(err);
        toast(lang === 'en' ? 'Error generating live strategy' : 'حدث خطأ أثناء التوليد المباشر', 'error');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    const activeKey = state.apiKey || tempApiKey;
    if (!activeKey) {
      setShowKeyModal(true);
      toast(lang === 'en' ? 'Please enter a Gemini API Key first.' : 'يرجى إدخال مفتاح API الخاص بـ Gemini أولاً.', 'warning');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    const goalName = GOAL_OPTIONS.find(o => o.id === selectedGoal)?.[lang === 'en' ? 'name_en' : 'name_ar'];
    const channelName = CHANNEL_OPTIONS.find(o => o.id === selectedChannel)?.[lang === 'en' ? 'name_en' : 'name_ar'];
    const clientTypeName = CLIENT_OPTIONS.find(o => o.id === selectedClient)?.[lang === 'en' ? 'name_en' : 'name_ar'];
    const pricingTierName = PRICING_OPTIONS.find(o => o.id === selectedPricing)?.[lang === 'en' ? 'name_en' : 'name_ar'];

    const prompt = `
      You are a world-class Freelance AI Strategist and business consultant.
      Your task is to analyze the freelancer's profile and target settings, correct any strategic mismatches, and outline a complete winning strategy.
      
      Freelancer Profile:
      - Niche: ${state.niche || 'General'}
      - Sub-Niche: ${state.subNiche || 'General Services'}
      
      Freelancer's Selected Target Settings:
      - Target Client Type: ${clientTypeName}
      - Outreach Channel: ${channelName}
      - Pricing Tier: ${pricingTierName}
      - Strategic Goal: ${goalName}
      
      CRITICAL EVALUATION RULE (Path Correction):
      Evaluate if this combination is ideal. 
      Provide the response in JSON format.
      The JSON object MUST contain exactly these keys:
      {
        "is_combination_ideal": boolean,
        "verdict_badge_ar": string,
        "verdict_badge_en": string,
        "expert_verdict_ar": string,
        "expert_verdict_en": string,
        "recommended_action_ar": string,
        "recommended_action_en": string,
        "strategy_title_ar": string,
        "strategy_title_en": string,
        "strategy_desc_ar": string,
        "strategy_desc_en": string,
        "outreach_subject_ar": string,
        "outreach_subject_en": string,
        "outreach_script_ar": string,
        "outreach_script_en": string,
        "objections": Array of 3 objects with keys: "objection_ar", "objection_en", "response_ar", "response_en",
        "followups": Array of 3 objects with keys: "day_ar", "day_en", "message_ar", "message_en"
      }
      
      Return ONLY the raw JSON string.
    `;

    try {
      setLoadingPhase(lang === 'en' ? 'Analyzing target parameters...' : 'جاري تحليل إعدادات الاستهداف الخاصة بك...');
      await new Promise(r => setTimeout(r, 600));
      
      setLoadingPhase(lang === 'en' ? 'Simulating strategic pathways...' : 'جاري محاكاة مسارات الاستراتيجية للمجال...');
      const responseText = await callGemini(prompt, activeKey);
      
      setLoadingPhase(lang === 'en' ? 'Finalizing matrix & script generation...' : 'جاري صياغة الاستراتيجية ومصفوفة الردود...');
      const cleanedJson = extractJSON(responseText).trim();
      const parsedData = JSON.parse(cleanedJson);
      
      setResult(parsedData);
      setIsFallbackActive(false);
      toast(lang === 'en' ? 'AI Strategy generated successfully!' : 'تم تحليل وصياغة الاستراتيجية بنجاح!', 'success');
    } catch (error) {
      console.error('AI Generation Error:', error);
      setIsFallbackActive(true);
      setResult(getFallbackStrategy(state.niche, state.subNiche, clientTypeName, channelName, pricingTierName, goalName));
    } finally {
      setIsGenerating(false);
      setLoadingPhase('');
    }
  };

  const getFallbackStrategy = (niche, subNiche, client, channel, pricing, goal) => {
    return {
      is_combination_ideal: false,
      verdict_badge_ar: 'تنبيه استراتيجي',
      verdict_badge_en: 'Strategic Alert',
      expert_verdict_ar: `اختيارك لاستهداف ${client} عبر ${channel} بمستوى تسعير ${pricing} يحتاج لبعض المعايرة والتحسين لضمان الحصول على عوائد حقيقية تناسب مهاراتك في ${subNiche || niche || 'العمل الحر'}.`,
      expert_verdict_en: `Your selection of targeting ${client} via ${channel} with ${pricing} pricing requires adjustments to ensure realistic returns.`,
      recommended_action_ar: 'ننصحك بالتركيز على تسعير القيمة بدلاً من السعر المنخفض، واستخدام LinkedIn لبناء علاقة مباشرة مع أصحاب القرار.',
      recommended_action_en: 'We recommend focusing on value pricing instead of low-ticket, and using LinkedIn for direct decision-maker outreach.',
      strategy_title_ar: `استراتيجية اختراق السوق في مجال ${subNiche || niche || 'الخدمات الاحترافية'}`,
      strategy_title_en: 'Market Penetration Strategy',
      strategy_desc_ar: `تركز هذه الخطة على تقديم قيمة فائقة للعميل تبدأ باستشارة مجانية أو تشخيص للمشكلة، لإثبات المصداقية وتبرير التسعير المنافس.`,
      strategy_desc_en: 'Focus on providing immense upfront value through a free consultation or diagnosis to establish authority.',
      outreach_subject_ar: `فكرة لزيادة أرباح [اسم الشركة] باستخدام الذكاء الاصطناعي والتصميم`,
      outreach_subject_en: 'Idea to optimize client engagement for [Company Name]',
      outreach_script_ar: `مرحباً [اسم العميل]،\n\nأنا [اسمك]، متخصص في ${subNiche || niche || 'الخدمات الرقمية'}.\nلقد اطلعت على أعمالكم وأعجبني جداً مشروعكم الأخير، ولكن لاحظت فرصة تسويقية مهدرة يمكن سدها بـ...\n\nهل ترحب بمكالمة قصيرة مدتها 10 دقائق لمناقشة الفكرة مجاناً؟`,
      outreach_script_en: `Hi [Client Name],\n\nI am [Your Name], specializing in ${subNiche || niche || 'Digital Services'}.\nI love your work but noticed a potential optimization in...\n\nWould you be open to a quick 10-min call to discuss?`,
      objections: [
        {
          objection_ar: 'سعرك مرتفع جداً مقارنة بالمستقلين الآخرين',
          objection_en: 'Your price is too high compared to others',
          response_ar: 'أتفهم ذلك، ولكن هذا السعر يضمن جودة استثنائية، تسليم ملتزم بالوقت، ودعم فني مستمر، وهو ما يوفر عليك تكلفة إعادة العمل لاحقاً.',
          response_en: 'I understand, but this ensures top-tier quality and ongoing support, saving you rewrite costs later.'
        },
        {
          objection_ar: 'ليس لدينا ميزانية كافية حالياً لهذا المشروع',
          objection_en: 'We do not have enough budget right now',
          response_ar: 'يمكننا تقسيم المشروع إلى مراحل أصغر لتبدأ بأقل تكلفة ممكنة مع جني ثمار الأرباح تدريجياً لتمويل المراحل اللاحقة.',
          response_en: 'We can break down the project into smaller phases to fit your current cash flow.'
        }
      ],
      followups: [
        {
          day_ar: 'بعد يومين',
          day_en: 'After 2 days',
          message_ar: 'مرحباً [اسم العميل]، أردت فقط التأكد من وصول رسالتي السابقة وتوافر فرصة للمناقشة.',
          message_en: 'Hi [Client Name], just checking if you had time to check my previous message.'
        }
      ]
    };
  };

  const copyToClipboard = (text, sectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    toast(lang === 'en' ? 'Script copied to clipboard!' : 'تم نسخ السكريبت إلى الحافظة!', 'success');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <ToolDashboardLayout
      id="smart-ai-assistant"
      title={lang === 'en' ? 'Freelance AI Strategist' : 'الخبير الاستراتيجي للعمل الحر'}
      subtitle={lang === 'en' ? 'A smart system that evaluates your marketing choices, corrects errors, and drafts customized outreach plans.' : 'نظام ذكي يقيم اختياراتك التسويقية، يصحح أخطاء الاستهداف، ويصيغ لك استراتيجية مخصصة بالكامل لمجالك.'}
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="5 - 15"
    >
      <div className="smart-assistant-container" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* BRAND & NICHE PROFILE BANNER */}
        <motion.div 
          className="assistant-profile-banner"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="assistant-profile-info">
            <div className="assistant-avatar-icon">
              <Target size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#fff', fontWeight: '900' }}>
                {lang === 'en' ? 'Your Active Business Profile' : 'ملفك التجاري الحالي'}
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', padding: '3px 12px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: '800' }}>
                  {state.niche ? (lang === 'en' ? `Niche: ${state.niche}` : `النيش: ${state.niche}`) : (lang === 'en' ? 'No niche selected' : 'لم يتم تحديد نيش')}
                </span>
                {state.subNiche && (
                  <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '3px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '800' }}>
                    {state.subNiche}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* API KEY CONTROLLER BUTTON */}
          <button
            onClick={() => setShowKeyModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '12px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Key size={16} color="#F59E0B" />
            <span>{state.apiKey ? (lang === 'en' ? 'Change Gemini Key' : 'تعديل مفتاح Gemini') : (lang === 'en' ? 'Add Gemini Key' : 'إضافة مفتاح Gemini')}</span>
          </button>
        </motion.div>

        {/* GEMINI KEY INTERACTIVE MODAL (CENTERED VIA PORTAL) */}
        {showKeyModal && createPortal(
          <AnimatePresence key="gemini-key-portal">
            <motion.div 
              className="gemini-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeyModal(false)}
            >
              <motion.div 
                className="gemini-modal-card"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Key size={20} color="#F59E0B" />
                    <span>{lang === 'en' ? 'Configure Gemini API Key' : 'إعداد مفتاح الـ API لـ Gemini'}</span>
                  </h3>
                  <button 
                    onClick={() => setShowKeyModal(false)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <p style={{ color: '#94A3B8', fontSize: '12px', lineHeight: 1.6, marginBottom: 20 }}>
                  {lang === 'en' 
                    ? 'Enter your Google Gemini API key to power direct client-side strategic AI calculations.' 
                    : 'أدخل مفتاح الـ API الخاص بـ Google Gemini لتشغيل خبير الاستراتيجيات الذكي مباشرة عبر المتصفح.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <input 
                    type="password"
                    className="setting-field-input"
                    placeholder="AIzaSy..."
                    value={tempApiKey}
                    onChange={e => setTempApiKey(e.target.value)}
                    style={{ fontSize: '14px' }}
                  />

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setShowKeyModal(false)}
                      className="btn btn-secondary"
                      style={{ padding: '10px 18px', borderRadius: '10px', fontSize: '12px' }}
                    >
                      {lang === 'en' ? 'Cancel' : 'إلغاء'}
                    </button>

                    <button 
                      onClick={handleSaveApiKey}
                      disabled={isSavingKey || !tempApiKey.trim()}
                      className="btn btn-primary"
                      style={{ background: '#6366F1', padding: '10px 22px', borderRadius: '10px', fontSize: '12px' }}
                    >
                      {isSavingKey ? '...' : (lang === 'en' ? 'Save Key' : 'حفظ المفتاح')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

        {/* MAIN TWO-COLUMN DASHBOARD */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: PARAMETER CHOOSERS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* GOAL SELECTOR */}
            <div className="assistant-section-card">
              <h4 className="assistant-section-title" style={{ color: '#6366F1' }}>
                <Target size={18} />
                <span>{lang === 'en' ? '1. Strategic Goal' : '1. الهدف الاستراتيجي للمشروع'}</span>
              </h4>
              <div className="assistant-options-grid">
                {GOAL_OPTIONS.map(opt => {
                  const OptIcon = opt.IconComp;
                  const isSelected = selectedGoal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedGoal(opt.id)}
                      className={`assistant-option-btn ${isSelected ? 'active' : ''}`}
                      style={{
                        '--opt-color': '#6366F1',
                        '--opt-rgb': '99, 102, 241'
                      }}
                    >
                      <div className="assistant-opt-icon">
                        <OptIcon size={18} color={isSelected ? '#fff' : '#6366F1'} />
                      </div>
                      <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CLIENT TYPE SELECTOR */}
            <div className="assistant-section-card">
              <h4 className="assistant-section-title" style={{ color: '#10B981' }}>
                <Building2 size={18} />
                <span>{lang === 'en' ? '2. Target Client Type' : '2. الفئة المستهدفة للعملاء'}</span>
              </h4>
              <div className="assistant-options-grid">
                {CLIENT_OPTIONS.map(opt => {
                  const OptIcon = opt.IconComp;
                  const isSelected = selectedClient === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedClient(opt.id)}
                      className={`assistant-option-btn ${isSelected ? 'active' : ''}`}
                      style={{
                        '--opt-color': '#10B981',
                        '--opt-rgb': '16, 185, 129'
                      }}
                    >
                      <div className="assistant-opt-icon">
                        <OptIcon size={18} color={isSelected ? '#fff' : '#10B981'} />
                      </div>
                      <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OUTREACH CHANNEL */}
            <div className="assistant-section-card">
              <h4 className="assistant-section-title" style={{ color: '#3B82F6' }}>
                <Mail size={18} />
                <span>{lang === 'en' ? '3. Outreach Channel' : '3. قناة التواصل والوصول'}</span>
              </h4>
              <div className="assistant-options-grid">
                {CHANNEL_OPTIONS.map(opt => {
                  const OptIcon = opt.IconComp;
                  const isSelected = selectedChannel === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedChannel(opt.id)}
                      className={`assistant-option-btn ${isSelected ? 'active' : ''}`}
                      style={{
                        '--opt-color': '#3B82F6',
                        '--opt-rgb': '59, 130, 246'
                      }}
                    >
                      <div className="assistant-opt-icon">
                        <OptIcon size={18} color={isSelected ? '#fff' : '#3B82F6'} />
                      </div>
                      <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRICING TIER */}
            <div className="assistant-section-card">
              <h4 className="assistant-section-title" style={{ color: '#F59E0B' }}>
                <Tag size={18} />
                <span>{lang === 'en' ? '4. Proposed Pricing' : '4. مستوى التسعير المقترح'}</span>
              </h4>
              <div className="assistant-options-grid">
                {PRICING_OPTIONS.map(opt => {
                  const OptIcon = opt.IconComp;
                  const isSelected = selectedPricing === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedPricing(opt.id)}
                      className={`assistant-option-btn ${isSelected ? 'active' : ''}`}
                      style={{
                        '--opt-color': '#F59E0B',
                        '--opt-rgb': '245, 158, 11'
                      }}
                    >
                      <div className="assistant-opt-icon">
                        <OptIcon size={18} color={isSelected ? '#fff' : '#F59E0B'} />
                      </div>
                      <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Mode Selector */}
            <AnalysisModeSelector 
              mode={analysisMode} 
              onChange={setAnalysisMode} 
              lang={lang} 
              accentColor="#6366F1" 
            />

            {/* ACTION BUTTON */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !state.niche}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: '#fff',
                fontSize: '14px',
                padding: '16px',
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                cursor: 'pointer',
                fontWeight: '800',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {isGenerating ? (
                <>
                  <span className="td-spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff', width: '18px', height: '18px' }} />
                  <span>{loadingPhase}</span>
                </>
              ) : (
                <>
                  <Brain size={18} />
                  <span>{lang === 'en' ? 'Analyze & Draft Strategy' : 'تحليل وتوليد الاستراتيجية الشاملة'}</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT COLUMN: AI CONVERSATION & OUTPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!result && !isGenerating && (
              <div 
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '60px 24px',
                  textAlign: 'center',
                  minHeight: '420px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Bot size={56} color="#818CF8" style={{ marginBottom: 16 }} />
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '900', marginBottom: '8px' }}>
                  {lang === 'en' ? 'AI Business Strategist is Waiting...' : 'الخبير الاستراتيجي للعمل الحر بانتظارك'}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '12.5px', lineHeight: '1.7', maxWidth: '380px', margin: 0 }}>
                  {lang === 'en' 
                    ? 'Set your goal, acquisition channel, target clients, and pricing. The AI will evaluate your plan, highlight errors, and output custom pitches.'
                    : 'حدد أهدافك وقنوات الوصول والتسعير. وسيقوم الخبير الاستراتيجي بمراجعة خطتك، توجيهك للمسار الأصح وصياغة الرسائل المخصصة.'}
                </p>
              </div>
            )}

            {isGenerating && (
              <div 
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '60px 24px',
                  textAlign: 'center',
                  minHeight: '420px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="td-spinner" style={{ width: '48px', height: '48px', borderWidth: '4px', borderColor: 'rgba(99, 102, 241, 0.15)', borderTopColor: '#6366F1', marginBottom: '24px' }} />
                <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '900', marginBottom: '8px' }}>
                  {lang === 'en' ? 'Consulting Strategic Engine...' : 'جاري التشاور مع خبير الأعمال...'}
                </h4>
                <p style={{ color: '#818CF8', fontSize: '12px', fontWeight: '800' }}>
                  {loadingPhase}
                </p>
              </div>
            )}

            {result && (
              <motion.div 
                className="animate-fade-in" 
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                
                {isFallbackActive && (
                  <div 
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      color: '#F59E0B',
                      fontSize: '12px',
                      lineHeight: '1.6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <AlertTriangle size={18} />
                    <span>
                      {lang === 'en' 
                        ? 'Fallback strategy loaded. Please check your Gemini API key and connection settings.' 
                        : 'تم تحميل الاستراتيجية الاحتياطية. يرجى التحقق من صحة مفتاح الـ API الخاص بـ Gemini وصلاحية الاتصال.'}
                    </span>
                  </div>
                )}
                
                {/* EXPERT VERDICT & PATH CORRECTION CARD */}
                <div className={`verdict-result-card ${result.is_combination_ideal ? 'ideal' : 'mismatch'}`}>
                  {/* Badge */}
                  <div className={`verdict-status-badge ${result.is_combination_ideal ? 'ideal' : 'mismatch'}`}>
                    {result.is_combination_ideal ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                    <span>{lang === 'en' ? result.verdict_badge_en : result.verdict_badge_ar}</span>
                  </div>

                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#fff', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color={result.is_combination_ideal ? '#10B981' : '#EF4444'} />
                    <span>{lang === 'en' ? 'AI Strategist Verdict:' : 'حكم وتوجيه الخبير الاستراتيجي:'}</span>
                  </h3>

                  <p style={{ color: '#F1F5F9', fontSize: '13px', lineHeight: '1.8', margin: '0 0 16px 0' }}>
                    {lang === 'en' ? result.expert_verdict_en : result.expert_verdict_ar}
                  </p>

                  {!result.is_combination_ideal && result.recommended_action_ar && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '12px', borderInlineStart: '4px solid #EF4444' }}>
                      <strong style={{ color: '#F87171', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '4px' }}>
                        <Lightbulb size={14} />
                        <span>{lang === 'en' ? 'Recommended Path Correction:' : 'تصحيح المسار المقترح من الخبير:'}</span>
                      </strong>
                      <span style={{ fontSize: '12.5px', color: '#fff', lineHeight: '1.6' }}>
                        {lang === 'en' ? result.recommended_action_en : result.recommended_action_ar}
                      </span>
                    </div>
                  )}
                </div>

                {/* OUTLINE STRATEGY DESCRIPTION */}
                <div className="assistant-section-card">
                  <h4 style={{ color: '#818CF8', fontSize: '11px', fontWeight: '900', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Trophy size={14} color="#818CF8" />
                    <span>{lang === 'en' ? 'PROPOSED STRATEGY' : 'الاستراتيجية الشاملة المقترحة'}</span>
                  </h4>
                  <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '900', margin: '0 0 12px 0' }}>
                    {lang === 'en' ? result.strategy_title_en : result.strategy_title_ar}
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '12.5px', lineHeight: '1.8', margin: 0 }}>
                    {lang === 'en' ? result.strategy_desc_en : result.strategy_desc_ar}
                  </p>
                </div>

                {/* CORE COMMUNICATIONS SCRIPT */}
                <div className="assistant-section-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h4 style={{ color: '#34D399', fontSize: '11px', fontWeight: '900', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} color="#34D399" />
                        <span>{lang === 'en' ? 'Outreach Message Template' : 'سكريبت التواصل الأساسي المقترح'}</span>
                      </h4>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {lang === 'en' ? 'Fully tailored to client psychographics' : 'مكتوب بسيكولوجية عالية تناسب فئة العميل'}
                      </span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(lang === 'en' ? result.outreach_script_en : result.outreach_script_ar, 'script')}
                      className="btn btn-secondary"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Copy size={13} />
                      <span>{copiedSection === 'script' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy Pitch' : 'نسخ الرسالة')}</span>
                    </button>
                  </div>

                  {result.outreach_subject_ar && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', marginBottom: '14px', fontSize: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <strong style={{ color: '#94A3B8' }}>{lang === 'en' ? 'Subject / Hook:' : 'عنوان الرسالة / الخطاف:'}</strong> {lang === 'en' ? result.outreach_subject_en : result.outreach_subject_ar}
                    </div>
                  )}

                  <div className="script-code-container">
                    {lang === 'en' ? result.outreach_script_en : result.outreach_script_ar}
                  </div>
                </div>

                {/* OBJECTION HANDLING MATRIX */}
                <div className="assistant-section-card">
                  <h4 style={{ color: '#F59E0B', fontSize: '11px', fontWeight: '900', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldAlert size={16} color="#F59E0B" />
                    <span>{lang === 'en' ? 'Objection Handling Matrix' : 'مصفوفة معالجة الاعتراضات المحتملة'}</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.objections?.map((obj, idx) => (
                      <div key={idx} className="objection-card-item">
                        <div style={{ color: '#F87171', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <XCircle size={14} color="#F87171" />
                          <span>{lang === 'en' ? 'If Client says:' : 'إذا قال العميل:'} "{lang === 'en' ? obj.objection_en : obj.objection_ar}"</span>
                        </div>
                        <div style={{ color: '#34D399', fontSize: '12px', lineHeight: '1.6', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle size={14} color="#34D399" />
                          <span>{lang === 'en' ? 'Respond with:' : 'الرد الاستراتيجي:'} {lang === 'en' ? obj.response_en : obj.response_ar}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOLLOW-UP TIMELINE SEQUENCE */}
                <div className="assistant-section-card">
                  <h4 style={{ color: '#60A5FA', fontSize: '11px', fontWeight: '900', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={16} color="#60A5FA" />
                    <span>{lang === 'en' ? 'Follow-Up Sequence Roadmap' : 'خطة المتابعة التسلسلية (Follow-ups)'}</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingInlineStart: '12px' }}>
                    {result.followups?.map((fup, idx) => (
                      <div 
                        key={idx}
                        style={{
                          borderInlineStart: '2px solid rgba(96, 165, 250, 0.4)',
                          paddingInlineStart: '16px',
                          position: 'relative'
                        }}
                      >
                        <div 
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#60A5FA',
                            position: 'absolute',
                            top: '4px',
                            insetInlineStart: '-6px',
                            boxShadow: '0 0 10px #60A5FA'
                          }}
                        />
                        <div style={{ color: '#fff', fontSize: '12px', fontWeight: '900', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} color="#60A5FA" />
                          <span>{lang === 'en' ? fup.day_en : fup.day_ar}</span>
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: '12px', lineHeight: '1.7', background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          {lang === 'en' ? fup.message_en : fup.message_ar}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </div>

        </div>

      </div>
    </ToolDashboardLayout>
  );
}

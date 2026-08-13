import React, { useState, useEffect, useRef } from 'react';
import useToolCache from '../../../hooks/useToolCache';
import { createPortal } from 'react-dom';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import { getFreelanceAITemplate } from '../../../services/contentDbService';
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
  X,
  ShieldCheck,
  Bot,
  Brain,
  Zap,
  Terminal,
  Save,
  MessageSquarePlus,
  SlidersHorizontal,
  Layers,
  Lightbulb,
  XCircle,
  CheckCircle,
  Orbit,
  Radio,
  Compass
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

const ORBITAL_COMMAND_NODES = [
  {
    id: 'outreach',
    name_ar: 'صياغة تواصل بارد',
    name_en: 'Write Cold Pitch',
    IconComp: Mail,
    color: '#3B82F6',
    params: { selectedGoal: 'close_deal', selectedChannel: 'cold_email', selectedClient: 'creators', selectedPricing: 'mid' }
  },
  {
    id: 'retainer',
    name_ar: 'عقود ورتينر شركات',
    name_en: 'Corporate Retainer',
    IconComp: Building2,
    color: '#8B5CF6',
    params: { selectedGoal: 'retainer', selectedChannel: 'linkedin', selectedClient: 'enterprise', selectedPricing: 'premium' }
  },
  {
    id: 'upsell',
    name_ar: 'رفع قيمة عميل قائم',
    name_en: 'Upsell Existing Client',
    IconComp: TrendingUp,
    color: '#10B981',
    params: { selectedGoal: 'upsell', selectedChannel: 'instagram', selectedClient: 'startups', selectedPricing: 'mid' }
  },
  {
    id: 'local_win',
    name_ar: 'صفقات أنشطة محليّة',
    name_en: 'Local Shop Wins',
    IconComp: Store,
    color: '#F59E0B',
    params: { selectedGoal: 'close_deal', selectedChannel: 'upwork', selectedClient: 'local_shops', selectedPricing: 'low' }
  }
];

const REVOLVING_STATUS_BADGES = {
  ar: [
    'Synthesizing Neural Logic... (جاري معالجة المنطق العصبي والنيش)',
    'Formulating Precision Output... (جاري بناء سيكولوجية الاستهداف)',
    'Formatting Matrix Output... (جاري تهيئة المصفوفة الاستراتيجية)'
  ],
  en: [
    'Synthesizing Neural Logic...',
    'Formulating Precision Output...',
    'Formatting Matrix Output...'
  ]
};

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
  const { userData } = useAuth();
  const toastContext = useToast();
  const toast = toastContext?.toast || ((msg) => console.log(msg));

  const lang = state.language || 'ar';
  const isRtl = lang?.startsWith('ar');
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  // Selection states
  const [selectedGoal, setSelectedGoal] = useState('close_deal');
  const [selectedChannel, setSelectedChannel] = useState('cold_email');
  const [selectedClient, setSelectedClient] = useState('creators');
  const [selectedPricing, setSelectedPricing] = useState('mid');

  // Gemini API Key Modal
  // (Removed to match rest of tools)

  // AI loading and output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  // Stage mode: 'input' (Stage 1), 'loading' (Stage 2), 'output' (Stage 3)
  const [activeStage, setActiveStage] = useState('input');

  // --- STATE PERSISTENCE & HYDRATION ---
  const { cachedData, isLoadingCache, saveResult } = useToolCache(userData?.uid, 'smart-ai-assistant');
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!isLoadingCache && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cachedData) {
        if (cachedData.analysisMode) setAnalysisMode(cachedData.analysisMode);
        if (cachedData.selectedGoal) setSelectedGoal(cachedData.selectedGoal);
        if (cachedData.selectedChannel) setSelectedChannel(cachedData.selectedChannel);
        if (cachedData.selectedClient) setSelectedClient(cachedData.selectedClient);
        if (cachedData.selectedPricing) setSelectedPricing(cachedData.selectedPricing);
        if (cachedData.activeStage) setActiveStage(cachedData.activeStage);
        if (cachedData.result) setResult(cachedData.result);
      }
    }
  }, [isLoadingCache, cachedData]);

  // Synchronize state changes to Firebase
  useEffect(() => {
    if (isLoadingCache || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({
        analysisMode,
        selectedGoal,
        selectedChannel,
        selectedClient,
        selectedPricing,
        activeStage,
        result
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadingCache, analysisMode, selectedGoal, selectedChannel, selectedClient, selectedPricing, activeStage, result]);



  // Loading badge status interval
  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStatusIndex((prev) => (prev + 1) % 3);
      }, 1300);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const applyOrbitalPreset = (node) => {
    setSelectedGoal(node.params.selectedGoal);
    setSelectedChannel(node.params.selectedChannel);
    setSelectedClient(node.params.selectedClient);
    setSelectedPricing(node.params.selectedPricing);
    toast(
      lang === 'en' 
        ? `Orbital Command Synced: ${node.name_en}` 
        : `تم ربط الأمر المداري: ${node.name_ar}`, 
      'info'
    );
  };


  const handleGenerate = async () => {
    if (analysisMode === 'live') {
      setIsGenerating(true);
      setActiveStage('loading');
      setResult(null);
      try {
        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
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
        setActiveStage('output');
        saveResult({
          analysisMode,
          selectedGoal,
          selectedChannel,
          selectedClient,
          selectedPricing,
          activeStage: 'output',
          result: formattedResult
        });
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'smart-ai-assistant',
          data: { selectedGoal, selectedChannel, selectedClient, selectedPricing, result: formattedResult, mode: 'live' }
        });
        toast(lang === 'en' ? 'AI Core Fusion strategy synthesized!' : 'تم التوليد المداري للاستراتيجية بنجاح!', 'success');
      } catch (err) {
        console.error(err);
        toast(lang === 'en' ? 'Error generating live strategy' : 'حدث خطأ أثناء التوليد المباشر', 'error');
        setActiveStage('input');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    setIsGenerating(true);
    setActiveStage('loading');
    setResult(null);

    const goalName = GOAL_OPTIONS.find(o => o.id === selectedGoal)?.[lang === 'en' ? 'name_en' : 'name_ar'];
    const channelName = CHANNEL_OPTIONS.find(o => o.id === selectedChannel)?.[lang === 'en' ? 'name_en' : 'name_ar'];
    const clientTypeName = CLIENT_OPTIONS.find(o => o.id === selectedClient)?.[lang === 'en' ? 'name_en' : 'name_ar'];
    const pricingTierName = PRICING_OPTIONS.find(o => o.id === selectedPricing)?.[lang === 'en' ? 'name_en' : 'name_ar'];

    try {
      setLoadingPhase(lang === 'en' ? 'Synthesizing Neural Logic...' : 'جاري معالجة المنطق العصبي واختبار المعايير...');
      await new Promise(r => setTimeout(r, 600));
      
      const dbResult = await getFreelanceAITemplate(selectedGoal, selectedChannel, selectedClient, selectedPricing);
      
      if (dbResult && dbResult.content) {
        setResult(dbResult.content);
        setIsFallbackActive(false);
        setActiveStage('output');
        saveResult({
          analysisMode,
          selectedGoal,
          selectedChannel,
          selectedClient,
          selectedPricing,
          activeStage: 'output',
          result: dbResult.content
        });
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'smart-ai-assistant',
          data: { selectedGoal, selectedChannel, selectedClient, selectedPricing, result: dbResult.content, mode: 'fast' }
        });
        toast(lang === 'en' ? 'AI Core Fusion strategy loaded!' : 'تم استدعاء المدار الاستراتيجي بنجاح!', 'success');
      } else {
        throw new Error("No predefined strategy found");
      }
    } catch (error) {
      console.warn('AI Core Loading Fallback:', error);
      setIsFallbackActive(true);
      const fallback = getFallbackStrategy(state.niche, state.subNiche, clientTypeName, channelName, pricingTierName, goalName);
      setResult(fallback);
      setActiveStage('output');
      saveResult({
        analysisMode,
        selectedGoal,
        selectedChannel,
        selectedClient,
        selectedPricing,
        activeStage: 'output',
        result: fallback
      });
      dispatch({
        type: 'SAVE_TOOL_RESULT',
        toolId: 'smart-ai-assistant',
        data: { selectedGoal, selectedChannel, selectedClient, selectedPricing, result: fallback, mode: 'fast' }
      });
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

  const handleSaveToWorkspace = () => {
    if (!result) return;
    dispatch({
      type: 'SAVE_TOOL_RESULT',
      toolId: 'smart-ai-assistant',
      data: { selectedGoal, selectedChannel, selectedClient, selectedPricing, result, mode: analysisMode }
    });
    toast(lang === 'en' ? 'Docked to Workspace successfully!' : 'تم التثبيت في مساحة العمل بنجاح!', 'success');
  };

const handleResetSession = () => {
    setAnalysisMode('fast');
    setSelectedGoal('close_deal');
    setSelectedChannel('cold_email');
    setSelectedClient('creators');
    setSelectedPricing('mid');

    setIsGenerating(false);
    setLoadingPhase('');
    setLoadingStatusIndex(0);
    setResult(null);
    setCopiedSection(null);
    setIsFallbackActive(false);
    setActiveStage('input');
    saveResult({ analysisMode: 'fast', selectedGoal: 'close_deal', selectedChannel: 'cold_email', selectedClient: 'creators', selectedPricing: 'mid', activeStage: 'input', result: null });
  };

  if (isLoadingCache || !hydratedRef.current) {
    return (
      <ToolDashboardLayout
        id="smart-ai-assistant"
        title={lang === 'en' ? 'The Radial AI Core & Orbital Studio' : 'المحرك المداري التفاعلي بالذكاء الاصطناعي'}
        subtitle={lang === 'en' ? 'Loading saved workspace...' : 'جاري تحميل مساحة العمل...'}
        stepNumber={stepNumber}
        accentColor="#3B82F6"
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Sleek Skeleton Loader */}
          <div style={{ height: "400px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", animation: "pulse 1.5s infinite" }}></div>
        </div>
      </ToolDashboardLayout>
    );
  }

  return (
    <ToolDashboardLayout
      id="smart-ai-assistant"
      title={lang === 'en' ? 'The Radial AI Core & Orbital Studio' : 'المحرك المداري التفاعلي بالذكاء الاصطناعي'}
      subtitle={lang === 'en' ? 'An interactive radial ecosystem to calculate market fit, client psychographics, and outreach blueprints.' : 'بيئة تفاعلية مدارية مبتكرة لتحليل ملاءمة السوق وصياغة الاستراتيجيات الحية.'}
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="5 - 15"
    >
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px 0 20px' }}>
          <button
            onClick={handleResetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
          >
            <RefreshCw size={14} />
            {(state?.language || 'ar') === 'en' ? 'Reset / Clear Chat' : 'إعادة ضبط / بدء من جديد'}
          </button>
        </div>
      <div className="radial-ecosystem-root" dir={isRtl ? 'rtl' : 'ltr'}>
        

        <AnimatePresence mode="wait">
          
          {/* ═══════════════ STAGE 1: FLOATING ORBITAL HUB ═══════════════ */}
          {(activeStage === 'input' || (!isGenerating && !result)) && (
            <motion.div 
              key="stage-1-orbital-hub"
              className="orbital-stage-wrapper"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35 }}
            >
              {/* ORBITAL COMMAND NODES RIBBON / ARC */}
              <div className="orbital-nodes-arc">
                <div className="orbital-ring-label">
                  <Orbit size={16} className="orbit-spin-icon" />
                  <span>{lang === 'en' ? 'Orbital Command Capsules:' : 'العُقد المدارية السريعة:'}</span>
                </div>

                <div className="orbital-pills-row">
                  {ORBITAL_COMMAND_NODES.map((node, i) => {
                    const NodeIcon = node.IconComp;
                    return (
                      <motion.button
                        key={node.id}
                        onClick={() => applyOrbitalPreset(node)}
                        className="orbital-pill-node"
                        style={{ '--node-color': node.color }}
                        animate={{ y: [i % 2 === 0 ? -4 : 4, i % 2 === 0 ? 4 : -4, i % 2 === 0 ? -4 : 4] }}
                        transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <NodeIcon size={14} />
                        <span>{lang === 'en' ? node.name_en : node.name_ar}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* CENTRAL AI REACTOR NODE (RADIAL CORE) */}
              <div className="radial-ai-core-hub">
                <div className="core-spinning-neon-ring" />
                <div className="core-glowing-inner-ring" />

                {/* CORE HEADER */}
                <div className="core-header-hud">
                  <div className="core-identity-group">
                    <div className="core-orb-pulse">
                      <Brain size={24} className="core-brain-symbol" />
                    </div>
                    <div>
                      <h3 className="core-matrix-title">
                        {lang === 'en' ? 'RADIAL AI CORE MATRIX' : 'نواة التفاعل الذكي المداري'}
                      </h3>
                      <span className="core-matrix-niche">
                        {state.niche ? `${state.niche} ${state.subNiche ? `• ${state.subNiche}` : ''}` : (lang === 'en' ? 'General Niche' : 'النيش العام')}
                      </span>
                    </div>
                  </div>

                  <div className="core-top-actions">
                    {/* Inline Engine Mode Micro-Toggle */}
                    <div className="engine-micro-toggle">
                      <button
                        onClick={() => setAnalysisMode('fast')}
                        className={`engine-pill ${analysisMode === 'fast' ? 'active-fast' : ''}`}
                      >
                        <Zap size={12} />
                        <span>{lang === 'en' ? 'Fast AI' : 'سريع'}</span>
                      </button>
                      <button
                        onClick={() => setAnalysisMode('live')}
                        className={`engine-pill ${analysisMode === 'live' ? 'active-deep' : ''}`}
                      >
                        <Brain size={12} />
                        <span>{lang === 'en' ? 'Deep AI' : 'عميق'}</span>
                      </button>
                    </div>


                  </div>
                </div>

                {/* RADIAL PARAMETERS SECTORS */}
                <div className="radial-sectors-matrix">
                  
                  {/* SECTOR 1: GOAL */}
                  <div className="radial-sector-card cyan-tint">
                    <div className="sector-title">
                      <Target size={15} />
                      <span>{lang === 'en' ? '1. Strategic Goal' : '1. الهدف الاستراتيجي'}</span>
                    </div>
                    <div className="sector-pills-wrap">
                      {GOAL_OPTIONS.map((opt) => {
                        const OptIcon = opt.IconComp;
                        const isSelected = selectedGoal === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedGoal(opt.id)}
                            className={`sector-chip ${isSelected ? 'active cyan' : ''}`}
                          >
                            <OptIcon size={14} />
                            <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTOR 2: CLIENT */}
                  <div className="radial-sector-card emerald-tint">
                    <div className="sector-title">
                      <Building2 size={15} />
                      <span>{lang === 'en' ? '2. Target Client Type' : '2. فئة العملاء'}</span>
                    </div>
                    <div className="sector-pills-wrap">
                      {CLIENT_OPTIONS.map((opt) => {
                        const OptIcon = opt.IconComp;
                        const isSelected = selectedClient === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedClient(opt.id)}
                            className={`sector-chip ${isSelected ? 'active emerald' : ''}`}
                          >
                            <OptIcon size={14} />
                            <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTOR 3: CHANNEL */}
                  <div className="radial-sector-card purple-tint">
                    <div className="sector-title">
                      <Mail size={15} />
                      <span>{lang === 'en' ? '3. Outreach Channel' : '3. قناة الوصول'}</span>
                    </div>
                    <div className="sector-pills-wrap">
                      {CHANNEL_OPTIONS.map((opt) => {
                        const OptIcon = opt.IconComp;
                        const isSelected = selectedChannel === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedChannel(opt.id)}
                            className={`sector-chip ${isSelected ? 'active purple' : ''}`}
                          >
                            <OptIcon size={14} />
                            <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTOR 4: PRICING */}
                  <div className="radial-sector-card amber-tint">
                    <div className="sector-title">
                      <Tag size={15} />
                      <span>{lang === 'en' ? '4. Proposed Pricing' : '4. مستوى التسعير'}</span>
                    </div>
                    <div className="sector-pills-wrap">
                      {PRICING_OPTIONS.map((opt) => {
                        const OptIcon = opt.IconComp;
                        const isSelected = selectedPricing === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedPricing(opt.id)}
                            className={`sector-chip ${isSelected ? 'active amber' : ''}`}
                          >
                            <OptIcon size={14} />
                            <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* LAUNCH CORE FUSION TRIGGER BUTTON */}
                <div className="core-fusion-trigger-row">
                  <motion.button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="core-fusion-launch-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Cpu size={22} className="fusion-spin-icon" />
                    <span>
                      {lang === 'en' ? 'LAUNCH CORE FUSION SYNTHESIS' : 'تشغيل محرك التوليد والاندماج المداري'}
                    </span>
                    <Zap size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ STAGE 2: CORE FUSION ENGINE ═══════════════ */}
          {activeStage === 'loading' && isGenerating && (
            <motion.div 
              key="stage-2-fusion-engine"
              className="core-fusion-engine-stage"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="fusion-holographic-orb-wrapper">
                <div className="fusion-ring-1" />
                <div className="fusion-ring-2" />
                <div className="fusion-ring-3" />
                
                {/* Revolving Particle Nodes */}
                <div className="fusion-particle p1" />
                <div className="fusion-particle p2" />
                <div className="fusion-particle p3" />

                <div className="fusion-core-sphere">
                  <Brain size={48} className="fusion-brain-pulse" />
                </div>
              </div>

              <div className="fusion-status-display">
                <h3 className="fusion-title">
                  {lang === 'en' ? 'CORE FUSION ENGINE ACTIVE' : 'محرك الاندماج العصبوني نشط الان'}
                </h3>
                
                {/* Dynamic Revolving Status Badge */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={loadingStatusIndex}
                    className="revolving-status-pill"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Sparkles size={14} className="sparkle-revolve" />
                    <span>{REVOLVING_STATUS_BADGES[lang?.startsWith('en') ? 'en' : 'ar'][loadingStatusIndex]}</span>
                  </motion.div>
                </AnimatePresence>

                <span className="fusion-phase-text">
                  {loadingPhase || (lang === 'en' ? 'Synthesizing Neural Logic & Psychographics...' : 'جاري توليد المصفوفة وحساب المسارات...')}
                </span>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ STAGE 3: EXPANDED RADIAL OUTPUT CANVAS ═══════════════ */}
          {activeStage === 'output' && result && !isGenerating && (
            <motion.div 
              key="stage-3-expanded-canvas"
              className="radial-output-canvas-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
            >
              {isFallbackActive && (
                <div className="fallback-pill-alert">
                  <AlertTriangle size={16} />
                  <span>
                    {lang === 'en' 
                      ? 'Fallback strategy loaded. Please verify your Gemini API key.' 
                      : 'تم تحميل الاستراتيجية الاحتياطية. يرجى التحقق من مفتاح API.'}
                  </span>
                </div>
              )}

              {/* EXPERT VERDICT & PATH CORRECTION CARD */}
              <div className={`canvas-verdict-card ${result.is_combination_ideal ? 'ideal' : 'mismatch'}`}>
                <div className="verdict-header-bar">
                  <span className={`verdict-badge-tag ${result.is_combination_ideal ? 'ideal' : 'mismatch'}`}>
                    {result.is_combination_ideal ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    <span>{lang === 'en' ? result.verdict_badge_en : result.verdict_badge_ar}</span>
                  </span>

                  <button 
                    onClick={() => setActiveStage('input')}
                    className="reconfigure-orbit-btn"
                  >
                    <SlidersHorizontal size={13} />
                    <span>{lang === 'en' ? 'Refine Orbital Core' : 'تعديل المعايير النواة'}</span>
                  </button>
                </div>

                <h3 className="verdict-title-row">
                  <ShieldCheck size={22} color={result.is_combination_ideal ? '#10B981' : '#EF4444'} />
                  <span>{lang === 'en' ? 'AI Strategist Verdict:' : 'حكم وتوجيه الخبير الاستراتيجي:'}</span>
                </h3>

                <p className="verdict-body">
                  {lang === 'en' ? result.expert_verdict_en : result.expert_verdict_ar}
                </p>

                {!result.is_combination_ideal && result.recommended_action_ar && (
                  <div className="path-correction-box">
                    <strong className="correction-tag">
                      <Lightbulb size={14} />
                      <span>{lang === 'en' ? 'Recommended Path Correction:' : 'تصحيح المسار المقترح من الخبير:'}</span>
                    </strong>
                    <span className="correction-text">
                      {lang === 'en' ? result.recommended_action_en : result.recommended_action_ar}
                    </span>
                  </div>
                )}
              </div>

              {/* PROPOSED STRATEGY CARD */}
              <div className="canvas-section-card">
                <div className="section-head">
                  <Trophy size={16} className="text-purple-glow" />
                  <h4>{lang === 'en' ? 'PROPOSED STRATEGY' : 'الاستراتيجية الشاملة المقترحة'}</h4>
                </div>
                <h3 className="strategy-headline">
                  {lang === 'en' ? result.strategy_title_en : result.strategy_title_ar}
                </h3>
                <p className="strategy-paragraph">
                  {lang === 'en' ? result.strategy_desc_en : result.strategy_desc_ar}
                </p>
              </div>

              {/* OUTREACH MESSAGE TEMPLATE */}
              <div className="canvas-section-card">
                <div className="section-head-between">
                  <div className="section-head">
                    <FileText size={16} className="text-emerald-glow" />
                    <div>
                      <h4>{lang === 'en' ? 'OUTREACH MESSAGE TEMPLATE' : 'سكريبت التواصل الأساسي المقترح'}</h4>
                      <span className="section-subtitle">
                        {lang === 'en' ? 'Tailored client psychographics pitch' : 'مكتوب بسيكولوجية عالية تناسب فئة العميل'}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => copyToClipboard(lang === 'en' ? result.outreach_script_en : result.outreach_script_ar, 'script')}
                    className="copy-pill-btn"
                  >
                    <Copy size={13} />
                    <span>{copiedSection === 'script' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy Pitch' : 'نسخ الرسالة')}</span>
                  </button>
                </div>

                {result.outreach_subject_ar && (
                  <div className="subject-hook-pill">
                    <strong className="subject-title">{lang === 'en' ? 'Subject / Hook:' : 'عنوان الرسالة / الخطاف:'}</strong>
                    <span>{lang === 'en' ? result.outreach_subject_en : result.outreach_subject_ar}</span>
                  </div>
                )}

                <div className="pitch-code-matrix">
                  {lang === 'en' ? result.outreach_script_en : result.outreach_script_ar}
                </div>
              </div>

              {/* OBJECTION HANDLING MATRIX */}
              <div className="canvas-section-card">
                <div className="section-head">
                  <ShieldAlert size={16} className="text-amber-glow" />
                  <h4>{lang === 'en' ? 'OBJECTION HANDLING MATRIX' : 'مصفوفة معالجة الاعتراضات المحتملة'}</h4>
                </div>
                
                <div className="objections-wrapper">
                  {result.objections?.map((obj, idx) => (
                    <div key={idx} className="objection-card-row">
                      <div className="client-say-line">
                        <XCircle size={14} />
                        <span>{lang === 'en' ? 'If Client says:' : 'إذا قال العميل:'} "{lang === 'en' ? obj.objection_en : obj.objection_ar}"</span>
                      </div>
                      <div className="strategic-reply-line">
                        <CheckCircle size={14} />
                        <span>{lang === 'en' ? 'Strategic Response:' : 'الرد الاستراتيجي:'} {lang === 'en' ? obj.response_en : obj.response_ar}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOLLOW-UP TIMELINE SEQUENCE */}
              <div className="canvas-section-card">
                <div className="section-head">
                  <Calendar size={16} className="text-cyan-glow" />
                  <h4>{lang === 'en' ? 'FOLLOW-UP SEQUENCE ROADMAP' : 'خطة المتابعة التسلسلية (Follow-ups)'}</h4>
                </div>

                <div className="timeline-sequence-list">
                  {result.followups?.map((fup, idx) => (
                    <div key={idx} className="timeline-node-item">
                      <div className="timeline-glow-dot" />
                      <div className="timeline-day-header">
                        <Clock size={13} />
                        <span>{lang === 'en' ? fup.day_en : fup.day_ar}</span>
                      </div>
                      <div className="timeline-msg-bubble">
                        {lang === 'en' ? fup.message_en : fup.message_ar}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FLOATING TACTICAL ORBITAL DOCK */}
              <div className="tactical-orbital-dock">
                <button 
                  onClick={() => copyToClipboard(lang === 'en' ? result.outreach_script_en : result.outreach_script_ar, 'full')}
                  className="orbital-dock-pill copy"
                >
                  <Copy size={15} />
                  <span>{copiedSection === 'full' ? (lang === 'en' ? 'Copied!' : 'تم النسخ!') : (lang === 'en' ? 'Copy Response' : 'نسخ الاستراتيجية')}</span>
                </button>

                <button 
                  onClick={handleGenerate}
                  className="orbital-dock-pill regen"
                >
                  <RefreshCw size={15} />
                  <span>{lang === 'en' ? 'Re-Orbit (Regenerate)' : 'إعادة التوليد المداري'}</span>
                </button>

                <button 
                  onClick={() => setActiveStage('input')}
                  className="orbital-dock-pill branch"
                >
                  <MessageSquarePlus size={15} />
                  <span>{lang === 'en' ? 'Branch Query (Refine)' : 'تعديل مدخلات النواة'}</span>
                </button>

                
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </ToolDashboardLayout>
  );
}

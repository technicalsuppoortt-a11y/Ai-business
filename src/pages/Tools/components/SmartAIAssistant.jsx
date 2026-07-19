import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { callGemini } from '../../../services/geminiService';
import ToolDashboardLayout from './ToolDashboardLayout';

const GOAL_OPTIONS = [
  { id: 'close_deal', name_ar: 'إغلاق صفقة أولى', name_en: 'Close First Deal', icon: '🤝' },
  { id: 'retainer', name_ar: 'اتفاق شهري مستمر (Retainer)', name_en: 'Monthly Retainer', icon: '🔄' },
  { id: 'upsell', name_ar: 'زيادة مبيعات لعميل قائم (Upsell)', name_en: 'Upsell Existing Client', icon: '📈' }
];

const CHANNEL_OPTIONS = [
  { id: 'cold_email', name_ar: 'إيميل بارد مباشر', name_en: 'Direct Cold Email', icon: '📧' },
  { id: 'upwork', name_ar: 'منصات العمل الحر (Upwork/Fiverr)', name_en: 'Freelance Platforms', icon: '💼' },
  { id: 'linkedin', name_ar: 'لينكد إن (LinkedIn)', name_en: 'LinkedIn Outreach', icon: '🔗' },
  { id: 'instagram', name_ar: 'سوشيال ميديا (Insta/TikTok DMs)', name_en: 'Social Media DMs', icon: '📱' }
];

const CLIENT_OPTIONS = [
  { id: 'creators', name_ar: 'صناع المحتوى والمؤثرين', name_en: 'Content Creators', icon: '🎥' },
  { id: 'startups', name_ar: 'الشركات الناشئة والتقنية', name_en: 'Startups & Tech Companies', icon: '🚀' },
  { id: 'enterprise', name_ar: 'الشركات الكبرى والمؤسسات', name_en: 'Enterprise Corporates', icon: '🏢' },
  { id: 'local_shops', name_ar: 'المحلات والأنشطة المحلية', name_en: 'Local Shops & Businesses', icon: '🏪' }
];

const PRICING_OPTIONS = [
  { id: 'low', name_ar: 'اقتصادي جداً (Low Budget)', name_en: 'Low Budget / Entry-level', icon: '🏷️' },
  { id: 'mid', name_ar: 'متوسط ومنافس (Mid Ticket)', name_en: 'Mid Ticket / Competitive', icon: '💵' },
  { id: 'premium', name_ar: 'مرتفع/بريميوم (High Ticket)', name_en: 'High Ticket Premium', icon: '👑' }
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
  const lang = state.language || 'ar';

  // Selection states
  const [selectedGoal, setSelectedGoal] = useState('close_deal');
  const [selectedChannel, setSelectedChannel] = useState('cold_email');
  const [selectedClient, setSelectedClient] = useState('creators');
  const [selectedPricing, setSelectedPricing] = useState('mid');

  // API Key handling
  const [tempApiKey, setTempApiKey] = useState(state.apiKey || '');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(!state.apiKey);

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
      setShowKeyInput(false);
      alert(lang === 'en' ? 'API Key saved successfully! ✅' : 'تم حفظ مفتاح الـ API بنجاح! ✅');
    } catch (err) {
      alert(lang === 'en' ? 'Invalid API key format.' : 'صيغة مفتاح الـ API غير صحيحة.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleGenerate = async () => {
    const activeKey = state.apiKey || tempApiKey;
    if (!activeKey) {
      setShowKeyInput(true);
      alert(lang === 'en' ? 'Please enter a Gemini API Key first.' : 'يرجى إدخال مفتاح الـ API الخاص بـ Gemini أولاً.');
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
      For example:
      - Targeting "Enterprise Companies" with "Low Ticket" pricing or "Cold Spamming/Instagram DMs" is a major mismatch (Enterprise needs High Ticket value and relationship building via LinkedIn or warm referrals).
      - Targeting "Content Creators" with "High Ticket Premium" pricing is often a mismatch unless they are top-tier creators with millions of followers (Mid/Low Ticket is better for average creators).
      - Targeting "Startups" using "Upwork cold bidding" with "Low Ticket" pricing is common, but "Mid Ticket" and "LinkedIn warm outreach" is much better.
      Identify any mismatch in the combination and provide a blunt, realistic correction (e.g., "اختيارك لاستهداف صانعي المحتوى بسعر مرتفع هو اختيار غير موفق..."). Be a strict strategic advisor.
      
      Provide the response in JSON format.
      The JSON object MUST contain exactly these keys:
      {
        "is_combination_ideal": boolean (true if the combination has no strategic mismatches, false otherwise),
        "verdict_badge_ar": string (e.g., "تركيبة ممتازة" or "تحتاج لتعديل"),
        "verdict_badge_en": string (e.g., "Ideal Match" or "Needs Calibration"),
        "expert_verdict_ar": string (1-3 sentences evaluating the combination and correcting any errors),
        "expert_verdict_en": string (1-3 sentences in English evaluating the combination),
        "recommended_action_ar": string (clear recommendation for fixing the mismatch),
        "recommended_action_en": string (clear recommendation in English),
        "strategy_title_ar": string (title of the proposed strategy),
        "strategy_title_en": string (title of the proposed strategy in English),
        "strategy_desc_ar": string (detailed description of the strategic plan),
        "strategy_desc_en": string (detailed description of the strategic plan in English),
        "outreach_subject_ar": string (email subject or message hook),
        "outreach_subject_en": string (email subject or message hook in English),
        "outreach_script_ar": string (the complete outreach message template with placeholders like [اسم العميل] and [اسم شركتك]),
        "outreach_script_en": string (the complete outreach message template in English),
        "objections": Array of 3 objects with keys: "objection_ar", "objection_en", "response_ar", "response_en" (each objection and how to answer it),
        "followups": Array of 3 objects with keys: "day_ar", "day_en", "message_ar", "message_en" (follow-up sequence)
      }
      
      Return ONLY the raw JSON string. Do not wrap it in markdown code blocks.
    `;

    try {
      setLoadingPhase(lang === 'en' ? 'Analyzing your target parameters...' : 'جاري تحليل إعدادات الاستهداف الخاصة بك...');
      await new Promise(r => setTimeout(r, 600));
      
      setLoadingPhase(lang === 'en' ? 'Simulating strategic pathways...' : 'جاري محاكاة مسارات الاستراتيجية للمجال...');
      const responseText = await callGemini(prompt, activeKey);
      
      setLoadingPhase(lang === 'en' ? 'Finalizing matrix & script generation...' : 'جاري صياغة الاستراتيجية ومصفوفة الردود...');
      const cleanedJson = extractJSON(responseText).trim();
      const parsedData = JSON.parse(cleanedJson);
      
      setResult(parsedData);
      setIsFallbackActive(false);
    } catch (error) {
      console.error('AI Generation Error:', error);
      setIsFallbackActive(true);
      // Fallback Strategy if JSON parse or API fails
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
      {/* BRAND & NICHE PROFILE BANNER */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(13, 18, 32, 0.7) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '28px' }}>🎯</div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#fff', fontWeight: 'bold' }}>
              {lang === 'en' ? 'Your Active Business Profile' : 'ملفك التجاري الحالي'}
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                {state.niche ? (lang === 'en' ? `Niche: ${state.niche}` : `النيش: ${state.niche}`) : (lang === 'en' ? 'No niche selected' : 'لم يتم تحديد نيش')}
              </span>
              {state.subNiche && (
                <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  {state.subNiche}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* API KEY CONTROLLER */}
        <div>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              color: '#8B96A8',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {state.apiKey ? '🔑 ' + (lang === 'en' ? 'Change Gemini Key' : 'تعديل مفتاح Gemini') : '🔑 ' + (lang === 'en' ? 'Add Gemini Key' : 'إضافة مفتاح Gemini')}
          </button>
        </div>
      </div>

      {/* API KEY CONFIGURATION DRAWER */}
      {showKeyInput && (
        <div 
          className="animate-fade-in"
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '24px'
          }}
        >
          <h4 style={{ color: '#ef4444', fontSize: '13px', fontWeight: '900', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔑</span> {lang === 'en' ? 'Gemini API Key Required for AI Strategy' : 'مفتاح الـ API الخاص بـ Gemini مطلوب لتشغيل الاستراتيجية الذكية'}
          </h4>
          <p style={{ color: '#8B96A8', fontSize: '11px', margin: '0 0 16px 0', lineHeight: 1.6 }}>
            {lang === 'en' 
              ? 'Enter a Google Gemini API key to activate the intelligent business strategist. It will run completely on the client side.' 
              : 'أدخل مفتاح API الخاص بـ Google Gemini لتشغيل الخبير الاستراتيجي الذكي. يتم تشغيل الكود مباشرة بالمتصفح بشكل آمن.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
            <input 
              type="password"
              className="td-input"
              placeholder="AIzaSy..."
              value={tempApiKey}
              onChange={e => setTempApiKey(e.target.value)}
              style={{ flex: 1, margin: 0, padding: '10px 14px', fontSize: '12px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button 
              onClick={handleSaveApiKey}
              disabled={isSavingKey || !tempApiKey.trim()}
              className="td-btn-primary"
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: 'auto' }}
            >
              {isSavingKey ? '...' : (lang === 'en' ? 'Save Key' : 'حفظ المفتاح')}
            </button>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <div className="td-grid cols-2" style={{ marginBottom: '36px', alignItems: 'start', gap: '24px' }}>
        
        {/* LEFT COLUMN: PARAMETER CHOOSERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* GOAL SELECTOR */}
          <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#6366F1', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🎯 {lang === 'en' ? '1. Strategic Goal' : '1. الهدف الاستراتيجي للمشروع'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedGoal(opt.id)}
                  style={{
                    background: selectedGoal === opt.id ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0, 0, 0, 0.2)',
                    border: `1px solid ${selectedGoal === opt.id ? '#6366F1' : 'rgba(255,255,255,0.04)'}`,
                    color: selectedGoal === opt.id ? '#fff' : '#8B96A8',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                    textAlign: 'start'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                  <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CLIENT TYPE SELECTOR */}
          <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#10B981', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              👤 {lang === 'en' ? '2. Target Client Type' : '2. الفئة المستهدفة للعملاء'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CLIENT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedClient(opt.id)}
                  style={{
                    background: selectedClient === opt.id ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 0, 0, 0.2)',
                    border: `1px solid ${selectedClient === opt.id ? '#10B981' : 'rgba(255,255,255,0.04)'}`,
                    color: selectedClient === opt.id ? '#fff' : '#8B96A8',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                    textAlign: 'start'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                  <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                </button>
              ))}
            </div>
          </div>

          {/* OUTREACH CHANNEL */}
          <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#3B82F6', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🔗 {lang === 'en' ? '3. Outreach Channel' : '3. قناة التواصل والوصول'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CHANNEL_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedChannel(opt.id)}
                  style={{
                    background: selectedChannel === opt.id ? 'rgba(59, 130, 246, 0.12)' : 'rgba(0, 0, 0, 0.2)',
                    border: `1px solid ${selectedChannel === opt.id ? '#3B82F6' : 'rgba(255,255,255,0.04)'}`,
                    color: selectedChannel === opt.id ? '#fff' : '#8B96A8',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                    textAlign: 'start'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                  <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PRICING TIER */}
          <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#F59E0B', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🏷️ {lang === 'en' ? '4. Proposed Pricing' : '4. مستوى التسعير المقترح'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PRICING_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedPricing(opt.id)}
                  style={{
                    background: selectedPricing === opt.id ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 0, 0, 0.2)',
                    border: `1px solid ${selectedPricing === opt.id ? '#F59E0B' : 'rgba(255,255,255,0.04)'}`,
                    color: selectedPricing === opt.id ? '#fff' : '#8B96A8',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                    textAlign: 'start'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                  <span>{lang === 'en' ? opt.name_en : opt.name_ar}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !state.niche}
            className="td-btn-primary"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#fff',
              fontSize: '14px',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
              cursor: 'pointer',
              border: 'none',
              fontWeight: 'bold',
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
                <span>🧠</span>
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
                background: 'rgba(13, 18, 32, 0.4)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🤖</div>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                {lang === 'en' ? 'AI Business strategist is waiting...' : 'الخبير الاستراتيجي للعمل الحر بانتظارك'}
              </h3>
              <p style={{ color: '#8B96A8', fontSize: '12px', lineHeight: '1.6', maxWidth: '360px', margin: 0 }}>
                {lang === 'en' 
                  ? 'Set your goal, acquisition channel, target clients, and pricing. The AI will evaluate your plan, highlight errors, and output custom pitches.'
                  : 'حدد أهدافك وقنوات الوصول والتسعير. وسيقوم الخبير الاستراتيجي بمراجعة خطتك، توجيهك للمسار الأصح وصياغة الرسائل المخصصة.'}
              </p>
            </div>
          )}

          {isGenerating && (
            <div 
              style={{
                background: 'rgba(13, 18, 32, 0.4)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div className="td-spinner" style={{ width: '48px', height: '48px', borderWidth: '4px', borderColor: 'rgba(99, 102, 241, 0.1)', borderTopColor: '#6366F1', marginBottom: '24px' }} />
              <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>
                {lang === 'en' ? 'Consulting the Brain...' : 'جاري التشاور مع خبير الأعمال...'}
              </h4>
              <p style={{ color: '#6366F1', fontSize: '12px', fontWeight: '900', animation: 'pulse 1.5s infinite' }}>
                {loadingPhase}
              </p>
            </div>
          )}

          {result && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {isFallbackActive && (
                <div 
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#F59E0B',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span>⚠️</span>
                  <span>
                    {lang === 'en' 
                      ? 'Fallback strategy loaded. Please check your Gemini API key and connection settings.' 
                      : 'تم تحميل الاستراتيجية الاحتياطية. يرجى التحقق من صحة مفتاح الـ API الخاص بـ Gemini وصلاحية الاتصال.'}
                  </span>
                </div>
              )}
              
              {/* EXPERT VERDICT & PATH CORRECTION CARD */}
              <div 
                style={{
                  background: result.is_combination_ideal 
                    ? 'rgba(16, 185, 129, 0.05)' 
                    : 'rgba(239, 68, 68, 0.05)',
                  border: `1px solid ${result.is_combination_ideal ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Badge */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '16px',
                    insetInlineEnd: '16px',
                    fontSize: '11px',
                    fontWeight: '900',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: result.is_combination_ideal ? '#10B981' : '#EF4444',
                    color: '#fff'
                  }}
                >
                  {lang === 'en' ? result.verdict_badge_en : result.verdict_badge_ar}
                </div>

                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{result.is_combination_ideal ? '✅' : '⚠️'}</span>
                  <span>{lang === 'en' ? 'AI Strategist Verdict:' : 'حكم وتوجيه الخبير الاستراتيجي:'}</span>
                </h3>

                <p style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.8', margin: '0 0 16px 0' }}>
                  {lang === 'en' ? result.expert_verdict_en : result.expert_verdict_ar}
                </p>

                {!result.is_combination_ideal && result.recommended_action_ar && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px', borderLeft: '3px solid #EF4444' }}>
                    <strong style={{ color: '#F0A5A5', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                      💡 {lang === 'en' ? 'Recommended Path Correction:' : 'تصحيح المسار المقترح من الخبير:'}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#fff', lineHeight: '1.6' }}>
                      {lang === 'en' ? result.recommended_action_en : result.recommended_action_ar}
                    </span>
                  </div>
                )}
              </div>

              {/* OUTLINE STRATEGY DESCRIPTION */}
              <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
                <h4 style={{ color: '#6366F1', fontSize: '11px', fontWeight: '900', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  🏆 {lang === 'en' ? 'PROPOSED STRATEGY' : 'الاستراتيجية الشاملة المقترحة'}
                </h4>
                <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '900', margin: '0 0 12px 0' }}>
                  {lang === 'en' ? result.strategy_title_en : result.strategy_title_ar}
                </h3>
                <p style={{ color: '#8B96A8', fontSize: '12px', lineHeight: '1.8', margin: 0 }}>
                  {lang === 'en' ? result.strategy_desc_en : result.strategy_desc_ar}
                </p>
              </div>

              {/* CORE COMMUNICATIONS SCRIPT */}
              <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ color: '#10B981', fontSize: '11px', fontWeight: '900', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      📝 {lang === 'en' ? 'Outreach Message Template' : 'سكريبت التواصل الأساسي المقترح'}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#8B96A8' }}>
                      {lang === 'en' ? 'Fully tailored to client psychographics' : 'مكتوب بسيكولوجية عالية تناسب فئة العميل'}
                    </span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(lang === 'en' ? result.outreach_script_en : result.outreach_script_ar, 'script')}
                    style={{
                      background: copiedSection === 'script' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${copiedSection === 'script' ? '#10B981' : 'rgba(255,255,255,0.08)'}`,
                      color: copiedSection === 'script' ? '#10B981' : '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedSection === 'script' ? (lang === 'en' ? 'Copied! ✓' : 'تم النسخ! ✓') : (lang === 'en' ? 'Copy Pitch' : 'نسخ الرسالة')}
                  </button>
                </div>

                {result.outreach_subject_ar && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <strong style={{ color: '#8B96A8' }}>{lang === 'en' ? 'Subject / Line Hook:' : 'عنوان الرسالة / الخطاف:'}</strong> {lang === 'en' ? result.outreach_subject_en : result.outreach_subject_ar}
                  </div>
                )}

                <div 
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '16px',
                    borderRadius: '10px',
                    color: '#E8EDF5',
                    fontSize: '13px',
                    lineHeight: '1.9',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    border: '1px solid rgba(255,255,255,0.02)'
                  }}
                >
                  {lang === 'en' ? result.outreach_script_en : result.outreach_script_ar}
                </div>
              </div>

              {/* OBJECTION HANDLING MATRIX */}
              <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
                <h4 style={{ color: '#F59E0B', fontSize: '11px', fontWeight: '900', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  🛡️ {lang === 'en' ? 'Objection Handling Matrix' : 'مصفوفة معالجة الاعتراضات المحتملة'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.objections?.map((obj, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        padding: '14px 16px'
                      }}
                    >
                      <div style={{ color: '#EF4444', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>
                        🔴 {lang === 'en' ? 'If Client says:' : 'إذا قال العميل:'} "{lang === 'en' ? obj.objection_en : obj.objection_ar}"
                      </div>
                      <div style={{ color: '#10B981', fontSize: '12px', lineHeight: '1.6' }}>
                        🟢 {lang === 'en' ? 'Respond with:' : 'الرد الاستراتيجي:'} {lang === 'en' ? obj.response_en : obj.response_ar}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOLLOW-UP TIMELINE SEQUENCE */}
              <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
                <h4 style={{ color: '#3B82F6', fontSize: '11px', fontWeight: '900', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  📅 {lang === 'en' ? 'Follow-Up Sequence Roadmap' : 'خطة المتابعة التسلسلية (Follow-ups)'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '8px' }}>
                  {result.followups?.map((fup, idx) => (
                    <div 
                      key={idx}
                      style={{
                        borderLeft: '2px solid rgba(59, 130, 246, 0.3)',
                        paddingLeft: '16px',
                        position: 'relative'
                      }}
                    >
                      {/* Timeline Node dot */}
                      <div 
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#3B82F6',
                          position: 'absolute',
                          left: '-6px',
                          top: '4px',
                          boxShadow: '0 0 8px #3B82F6'
                        }}
                      />
                      <div style={{ color: '#fff', fontSize: '12px', fontWeight: '900', marginBottom: '4px' }}>
                        ⏰ {lang === 'en' ? fup.day_en : fup.day_ar}
                      </div>
                      <div style={{ color: '#8B96A8', fontSize: '11px', lineHeight: '1.7', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        {lang === 'en' ? fup.message_en : fup.message_ar}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </ToolDashboardLayout>
  );
}

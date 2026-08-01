import React, { useState , useRef , useEffect} from 'react';
import useToolCache from "../../../hooks/useToolCache";
import InteractiveToolLayout from './InteractiveToolLayout';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { getSalesReply } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';

export default function SalesTemplates({ stepNumber }) {
  const toast = useToast();
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  const [situation, setSituation] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  const commonSituations_ar = [
    { id: 'discount_request', label: 'العميل يطلب خصم كبير' },
    { id: 'slow_response', label: 'العميل تأخر في الرد' },
    { id: 'out_of_scope', label: 'طلب تعديلات خارج الاتفاق' },
    { id: 'price_increase', label: 'تبرير رفع الأسعار' }
  ];
  const commonSituations_en = [
    { id: 'discount_request', label: 'Client asking for a big discount' },
    { id: 'slow_response', label: 'Client delayed in responding' },
    { id: 'out_of_scope', label: 'Requesting edits outside agreement' },
    { id: 'price_increase', label: 'Justifying a price increase' }
  ];
  const commonSituations = lang === 'en' ? commonSituations_en : commonSituations_ar;

  const handleGenerate = async () => {
    if (!situation) {
      alert(lang === 'en' ? 'Please choose the situation first.' : 'الرجاء اختيار الموقف أولاً.');
      return;
    }

    setIsGenerating(true);
    setResult('');

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: 'sales-templates',
          inputs: { situation, tone },
          context: { niche: state.niche, user: state.user },
          lang,
      uid: userData?.uid || state?.user?.uid
    });
        setResult(liveResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'sales-templates',
          data: { situation, tone, result: liveResult, mode: 'live' }
        });
      } else {
        await new Promise(r => setTimeout(r, 600));

        const sitId = typeof situation === 'string' && !commonSituations.find(c => c.id === situation) 
          ? 'discount_request' 
          : situation;

        const dbResult = await getSalesReply(sitId, tone);
        
        if (dbResult && (dbResult.reply_ar || dbResult.reply_en)) {
          const replyStr = lang === 'en' ? (dbResult.reply_en || dbResult.reply_ar) : dbResult.reply_ar;
          const tipStr = lang === 'en' ? (dbResult.tip_en || dbResult.tip_ar) : dbResult.tip_ar;
          
          let text = `### 💬 ${lang === 'en' ? 'Suggested Professional Reply' : 'الرد الاحترافي المقترح'}\n\n`;
          text += replyStr;
          
          if (tipStr) {
            text += `\n\n---\n**💡 ${lang === 'en' ? 'Sales Tip' : 'نصيحة بيعية'}:** ${tipStr}`;
          }
          setResult(text);
          dispatch({
            type: 'SAVE_TOOL_RESULT',
            toolId: 'sales-templates',
            data: { situation, tone, result: text, mode: 'fast' }
          });
        } else {
          setResult(lang === 'en' 
            ? "No template found for this situation yet. We are constantly expanding our database." 
            : "لم يتم العثور على نموذج لهالموقف بعد. نقوم بإضافة قوالب جديدة باستمرار.");
        }
      }
    } catch (error) {
      console.error(error);
      if (error?.message === 'OUT_OF_CREDITS' || error?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert(lang === 'en' ? 'Reply copied successfully!' : 'تم نسخ الرد بنجاح!');
  };

  const leftContent = (
    <div className="space-y-8 it-animate-fade-up" dir={lang === 'en' ? 'ltr' : 'rtl'}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '10px' }}>
          <button
            onClick={handleResetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={12} />
            {(state?.language || 'ar') === 'en' ? 'Reset / Start Fresh' : 'إعادة ضبط / بدء من جديد'}
          </button>
        </div>
      <div className="it-panel-dark">
        <label className="it-label">{lang === 'en' ? 'What is the current situation?' : 'ما هو الموقف الحالي؟'}</label>
        <textarea 
          placeholder={lang === 'en' ? 'e.g. The client is asking me to do an extra logo for free outside the agreement...' : 'مثال: العميل يطلب مني عمل لوجو إضافي مجاناً خارج الاتفاق...'}
          className="it-input min-h-[140px] text-sm leading-relaxed resize-none border-white/10"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
        />
        <div className="mt-4">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-3 tracking-widest">{lang === 'en' ? 'Select a predefined situation:' : 'أو اختر موقفاً مبرمجاً مسبقاً:'}</p>
          <div className="flex flex-wrap gap-2">
            {commonSituations.map((sit, idx) => (
              <button 
                key={idx}
                onClick={() => setSituation(sit.id)}
                className={`it-chip ${situation === sit.id ? 'it-chip-active' : ''}`}
              >
                + {sit.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="it-panel-glass">
        <label className="it-label">{lang === 'en' ? 'How do you want to come across in your reply?' : 'كيف تريد أن تبدو في ردك؟'}</label>
        <select 
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="it-input text-xs font-black bg-slate-900/80 border-white/10"
        >
          <option value="professional">🛡️ {lang === 'en' ? 'Professional & Firm (to protect your rights)' : 'احترافي وحازم (لحماية حقوقك)'}</option>
          <option value="friendly">🤝 {lang === 'en' ? 'Friendly & Understanding (to retain client)' : 'ودود ومتفهم (للحفاظ على العميل)'}</option>
          <option value="persuasive">💰 {lang === 'en' ? 'Persuasive & Sales (to close the deal)' : 'مقنع وبيعي (لإغلاق الصفقة)'}</option>
          <option value="apologetic">🕊️ {lang === 'en' ? 'Diplomatic (to calm anger)' : 'دبلوماسي (لتهدئة الغضب)'}</option>
        </select>
      </div>

      {/* Dual Mode Selector */}
      <AnalysisModeSelector 
        mode={analysisMode} 
        onChange={setAnalysisMode} 
        lang={lang} 
        accentColor="#10B981" 
      />

      <button 
        onClick={handleGenerate}
        disabled={isGenerating || !situation.trim()}
        className={`it-btn ${isGenerating || !situation.trim() ? 'it-btn-disabled' : 'it-btn-primary'}`}
      >
           {isGenerating ? (
          <span className="flex items-center gap-3">
             <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             {lang === 'en' ? 'Crafting smart reply...' : 'جاري صياغة الرد الذكي...'}
          </span>
        ) : `💬 ${lang === 'en' ? 'Craft Professional Reply' : 'صياغة الرد الاحترافي'}`}
      </button>
    </div>
  );

  const rightContent = (
    <div className="h-full relative flex flex-col gap-6" dir="rtl">
      {!result && !isGenerating && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-40 text-center px-10">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-4xl mb-6 border border-white/5 shadow-2xl">💬</div>
          <h3 className="text-xl font-black text-white mb-2">لا تدع العميل يسيطر على الموقف</h3>
          <p className="text-sm leading-relaxed max-w-xs">{lang === 'en' ? "Write the situation and we'll generate a diplomatic reply that preserves your financial and professional rights while maintaining your professionalism." : 'اكتب الموقف وسنقوم بتوليد رد دبلوماسي يحفظ لك حقك المادي والمعنوي ويحافظ على احترافيتك.'}</p>
        </div>
      )}
      
      {(result || isGenerating) && (
        <div className="it-panel-dark border-emerald-500/20 h-full flex flex-col shadow-2xl overflow-hidden bg-slate-950/40">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 shrink-0">
            <h3 className="it-badge it-badge-emerald">
              <span>✉️</span> الرد الاستراتيجي المقترح
            </h3>
            {result && (
              <button 
                onClick={handleCopy}
                className="text-[10px] bg-white/5 hover:bg-emerald-500 hover:text-slate-900 px-4 py-2 rounded-lg transition-all font-black border border-white/10"
              >
                📋 {lang === 'en' ? 'Copy Text' : 'نسخ النص'}
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto it-scrollbar pr-2">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">✍️</div>
                </div>
                <p className="text-emerald-400 font-black text-xs animate-pulse">يتم تحليل الموقف وصياغة الكلمات المناسبة...</p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm animate-fade-in p-6 bg-black/30 rounded-2xl border border-white/5 shadow-inner">
                {result}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );


  // --- STATE PERSISTENCE & HYDRATION ---
  const { cachedData: cached, isLoadingCache, saveResult } = useToolCache(userData?.uid, 'sales-templates');
  const isLoadedFromCloud = !isLoadingCache;
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.analysisMode !== undefined) setAnalysisMode(cached.analysisMode);
        if (cached.situation !== undefined) setSituation(cached.situation);
        if (cached.tone !== undefined) setTone(cached.tone);
        if (cached.isGenerating !== undefined) setIsGenerating(cached.isGenerating);
        if (cached.result !== undefined) setResult(cached.result);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ analysisMode, situation, tone, isGenerating, result });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, analysisMode, situation, tone, isGenerating, result]);

  const handleResetSession = () => {
    setAnalysisMode('fast');
    setSituation('');
    setTone('professional');
    setIsGenerating(false);
    setResult('');
    saveResult(null);
  };
  // -------------------------------------

  return (
    <InteractiveToolLayout
      id="sales-templates"
      title={lang === 'en' ? 'Smart Sales Templates Library' : 'مكتبة نماذج المبيعات الذكية'}
      subtitle={lang === 'en' ? 'Professional ready-made replies for all awkward and difficult client situations. No room for improvisation.' : 'ردود احترافية جاهزة لكل المواقف المحرجة والصعبة مع العملاء. لا تترك مكاناً للارتجال.'}
      icon="💬"
      stepNumber={stepNumber}
      leftContent={leftContent}
      rightContent={rightContent}
      isGenerating={isGenerating}
    />
  );
}

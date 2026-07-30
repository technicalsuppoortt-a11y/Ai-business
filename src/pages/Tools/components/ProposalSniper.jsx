import React, { useState } from 'react';
import InteractiveToolLayout from './InteractiveToolLayout';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { getProposalTemplate } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';

export default function ProposalSniper({ stepNumber }) {
  const toast = useToast();
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('expert');
  const [proposalLang, setProposalLang] = useState('ar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      alert(lang === 'en' ? 'Please paste the job description first' : 'برجاء لصق وصف الوظيفة أولاً');
      return;
    }
    setIsGenerating(true);
    setResult('');

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: 'proposal-sniper',
          inputs: { jobDescription, tone, proposalLang },
          context: { niche: state.niche, user: state.user },
          lang,
      uid: userData?.uid || state?.user?.uid
    });
        setResult(liveResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'proposal-sniper',
          data: {
            jobDescription,
            tone,
            proposalLang,
            result: liveResult,
            mode: 'live'
          }
        });
      } else {
        await new Promise(r => setTimeout(r, 600));

        // We use 'individual' client type as default for now
        const dbResult = await getProposalTemplate(state.niche || 'general', tone, 'individual');
        
        if (dbResult && (dbResult.template_ar || dbResult.template_en)) {
          const templateStr = (proposalLang === 'en' ? (dbResult.template_en || dbResult.template_ar) : dbResult.template_ar) || '';
          const tipStr = lang === 'en' ? (dbResult.tip_en || dbResult.tip_ar) : dbResult.tip_ar;
          
          let text = `### 📝 ${lang === 'en' ? 'Suggested Proposal Template' : 'قالب العرض المقترح'}\n\n`;
          text += `*(${lang === 'en' ? 'Adjust the parts in brackets to match the job description:' : 'قم بتعديل الأجزاء بين الأقواس لتناسب الوصف الوظيفي:'})*\n\n`;
          text += templateStr;
          
          if (tipStr) {
            text += `\n\n---\n**💡 ${lang === 'en' ? 'Pro Tip' : 'نصيحة ذهبية'}:** ${tipStr}`;
          }
          setResult(text);
          dispatch({
            type: 'SAVE_TOOL_RESULT',
            toolId: 'proposal-sniper',
            data: {
              jobDescription,
              tone,
              proposalLang,
              result: text,
              mode: 'fast'
            }
          });
        } else {
          setResult(lang === 'en' 
            ? "No template found for this combination. We are constantly adding new templates to the database." 
            : "لم يتم العثور على قالب لهذا الاختيار بعد. نحن نضيف قوالب جديدة باستمرار.");
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

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'proposal-sniper' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert(lang === 'en' ? 'Proposal copied successfully!' : 'تم نسخ العرض بنجاح!');
  };

  const toneOptions = [
    { id: 'expert', label_ar: 'خبير وواثق', label_en: 'Expert & Confident' },
    { id: 'friendly', label_ar: 'ودود ومبادر', label_en: 'Friendly & Proactive' },
    { id: 'corporate', label_ar: 'رسمي واحترافي', label_en: 'Formal & Professional' },
    { id: 'creative', label_ar: 'مبدع وخارج الصندوق', label_en: 'Creative & Out-of-box' },
  ];

  const leftContent = (
    <div className="space-y-6 animate-fade-in" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
          {lang === 'en' ? 'Job Description' : 'وصف الوظيفة (Job Description)'}
        </label>
        <textarea 
          placeholder={lang === 'en' ? 'Paste the job listing from Upwork, Mostaql or any platform here... more details = more precise snipe!' : 'الصق هنا إعلان الوظيفة من Upwork أو مستقل أو أي منصة أخرى... كلما زادت التفاصيل كان القنص أدق!'}
          className="premium-input min-h-[180px] py-4 text-sm leading-relaxed text-left focus:bg-blue-900/10 focus:border-blue-500/50 transition-all"
          dir="auto"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-slate-500 font-black uppercase mb-2">
            {lang === 'en' ? 'Tone of Voice' : 'نبرة الصوت'}
          </label>
          <select 
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="premium-input h-12 text-xs font-bold"
          >
            {toneOptions.map(t => (
              <option key={t.id} value={t.id}>{lang === 'en' ? t.label_en : t.label_ar}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 font-black uppercase mb-2">
            {lang === 'en' ? 'Proposal Language' : 'لغة العرض'}
          </label>
          <select 
            value={proposalLang}
            onChange={(e) => setProposalLang(e.target.value)}
            className="premium-input h-12 text-xs font-bold"
          >
            <option value="ar">العربية (Arabic)</option>
            <option value="en">English (الإنجليزية)</option>
          </select>
        </div>
      </div>

      {/* Dual Mode Selector */}
      <AnalysisModeSelector 
        mode={analysisMode} 
        onChange={setAnalysisMode} 
        lang={lang} 
        accentColor="#8B5CF6" 
      />

      <button 
        onClick={handleGenerate}
        disabled={isGenerating || !jobDescription.trim()}
        className={`w-full premium-button flex items-center justify-center gap-3 py-5 text-sm ${
          (!jobDescription.trim() || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ backgroundImage: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)' }}
      >
        {isGenerating ? (lang === 'en' ? 'Analyzing & sniping...' : 'جاري تحليل العميل والقنص...') : `🎯 ${lang === 'en' ? 'Fire the Sniper (Generate Proposal)' : 'أطلق القناص (توليد العرض)'}`}
      </button>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
          <input 
            type="checkbox" 
            checked={state?.completedSteps?.includes('proposal-sniper') || false}
            onChange={handleComplete}
            className="w-5 h-5 rounded accent-purple-500" 
          />
          <span className="text-slate-300 font-bold text-sm">
            {lang === 'en' ? 'Professional proposal extracted ✅' : 'تم استخراج عرض احترافي ✅'}
          </span>
        </label>
      </div>
    </div>
  );

  const rightContent = (
    <div className="h-full relative group">
      {!result && !isGenerating && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
          <span className="text-6xl mb-4">🔭</span>
          <p className="text-xl font-bold">{lang === 'en' ? 'Waiting for your first target...' : 'في انتظار هدفك الأول...'}</p>
          <p className="text-xs mt-2 text-slate-400">{lang === 'en' ? 'Paste the job to analyze the client and write your proposal.' : 'الصق الوظيفة لنحلل العميل ونكتب لك العرض.'}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-slate-900 border border-purple-500/30 p-8 rounded-3xl h-full relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent"></div>
          
          <button 
            onClick={handleCopy}
            className="absolute top-4 left-4 bg-white/10 hover:bg-purple-500 hover:text-white text-slate-300 px-4 py-2 rounded-xl transition-all font-bold text-sm z-10"
          >
            📋 {lang === 'en' ? 'Copy Report' : 'نسخ التقرير'}
          </button>
          
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-sm custom-scrollbar max-h-[500px] overflow-y-auto pr-2 mt-4">
            {result}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <InteractiveToolLayout
      id="proposal-sniper"
      title={lang === 'en' ? 'Proposal Sniper' : 'قناص العروض (Proposal Sniper)'}
      subtitle={lang === 'en' ? 'Paste the job listing, and AI will analyze the client, diagnose their problems, and write an irresistible proposal.' : 'الصق إعلان الوظيفة، وسيقوم الذكاء الاصطناعي بتحليل العميل، تشخيص مشاكله، وكتابة عرض لا يمكن رفضه.'}
      icon="🎯"
      stepNumber={stepNumber}
      leftContent={leftContent}
      rightContent={rightContent}
      isGenerating={isGenerating}
    />
  );
}

import React, { useState } from 'react';
import InteractiveToolLayout from './InteractiveToolLayout';
import { useApp } from '../../../context/AppContext';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';

export default function InterviewPrep({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  const [clientType, setClientType] = useState('startup');
  const [projectType, setProjectType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  const clientTypes = [
    { id: 'startup', label_ar: 'شركة ناشئة (Startup)', label_en: 'Startup', icon: '🚀' },
    { id: 'corporate', label_ar: 'شركة كبرى (Corporate)', label_en: 'Corporate', icon: '🏢' },
    { id: 'individual', label_ar: 'فرد / صاحب عمل حر', label_en: 'Individual / Solo Business', icon: '👤' },
    { id: 'agency', label_ar: 'وكالة (Agency)', label_en: 'Agency', icon: '🤝' },
  ];

  const handleGenerate = async () => {
    if (!projectType.trim()) {
      alert(lang === 'en' ? 'Please enter the project or job type.' : 'الرجاء إدخال نوع المشروع أو الوظيفة.');
      return;
    }
    setIsGenerating(true);
    setResult('');

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'interview-prep',
          inputs: { clientType, projectType },
          context: { niche: state.niche, user: state.user },
          lang
        });
        setResult(liveResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'interview-prep',
          data: { clientType, projectType, result: liveResult, mode: 'live' }
        });
      } else {
        await new Promise(r => setTimeout(r, 600));

      let text = `### 🎤 ${lang === 'en' ? 'Strategic Interview Questions' : 'أسئلة المقابلة الاستراتيجية'}\n\n`;
      text += `*(${lang === 'en' ? 'Ask these questions to position yourself as an expert consultant, not just a worker:' : 'اطرح هذه الأسئلة لتظهر كمستشار خبير وليس مجرد منفذ:'})*\n\n`;

      const q1 = lang === 'en' 
        ? `**Q1: What is the main business goal behind this ${projectType || 'project'}?**\n*Why:* Shows you care about their ROI, not just the technical execution.`
        : `**السؤال 1: ما هو الهدف التجاري (Business Goal) الأساسي من هذا الـ ${projectType || 'مشروع'}؟**\n*السبب:* يظهر أنك تهتم بعوائدهم المالية وليس فقط بالتنفيذ الفني.`;
        
      const q2 = lang === 'en'
        ? `**Q2: How did you try to solve this problem before, and why didn't it work?**\n*Why:* Reveals previous agency failures so you can avoid them and price accordingly.`
        : `**السؤال 2: كيف حاولتم حل هذه المشكلة سابقاً، ولماذا لم تنجح المحاولة؟**\n*السبب:* يكشف لك فشل المستقلين أو الوكالات السابقة لتتجنب أخطاءهم ولتسعّر بناءً على حجم الألم.`;

      const q3 = lang === 'en'
        ? `**Q3: If we finish this perfectly, how will you measure success after 3 months?**\n*Why:* Sets clear expectations so they can't ask for endless revisions.`
        : `**السؤال 3: إذا أنهينا هذا المشروع بشكل مثالي، كيف ستقيسون النجاح بعد 3 أشهر؟**\n*السبب:* يضع معايير واضحة للنجاح حتى لا يطلب العميل تعديلات لا نهائية لاحقاً.`;
      
      let q4 = '';
      if (clientType === 'startup') {
        q4 = lang === 'en' 
          ? `**Q4 (Startup Focus): Startups move fast. Do you have the necessary assets ready, or will I need to build from scratch?**\n*Why:* Startups often lack assets; this protects you from scope creep.`
          : `**السؤال 4 (لشركات الـ Startup): الشركات الناشئة تتحرك بسرعة. هل الأصول والمواد المطلوبة جاهزة، أم سأحتاج لبنائها من الصفر؟**\n*السبب:* الشركات الناشئة غالباً لا تملك أصولاً جاهزة، هذا يحميك من العمل الإضافي المجاني.`;
      } else if (clientType === 'corporate') {
        q4 = lang === 'en'
          ? `**Q4 (Corporate Focus): Who are the final decision-makers for approving the deliverables?**\n*Why:* Corporates have long approval chains. You need to know who really signs off.`
          : `**السؤال 4 (للشركات الكبرى): من هم صناع القرار النهائيين للموافقة على التسليمات؟**\n*السبب:* الشركات الكبرى لديها سلسلة موافقات طويلة، يجب أن تعرف من يملك القرار النهائي.`;
      } else if (clientType === 'agency') {
        q4 = lang === 'en'
          ? `**Q4 (Agency Focus): Will I be communicating directly with the end client, or strictly through your project manager?**\n*Why:* Clarifies workflow and prevents miscommunication bottlenecks.`
          : `**السؤال 4 (للوكالات): هل سأتواصل مع العميل النهائي مباشرة، أم سيكون تواصلي حصرياً عبر مدير المشروع لديكم؟**\n*السبب:* يوضح سير العمل ويمنع اختناقات التواصل.`;
      } else {
        q4 = lang === 'en'
          ? `**Q4 (Individual Focus): Since you are running this solo, what part of the business takes up most of your time right now?**\n*Why:* Helps you offer additional services to take more off their plate.`
          : `**السؤال 4 (للأفراد): بما أنك تدير العمل بمفردك، ما هو الجزء الذي يستنزف معظم وقتك حالياً؟**\n*السبب:* يساعدك في عرض خدمات إضافية لتخفيف العبء عنه.`;
      }

      text += `${q1}\n\n${q2}\n\n${q3}\n\n${q4}\n\n`;
      text += `---\n**💡 ${lang === 'en' ? 'Pro Tip' : 'نصيحة المقابلة'}:** ${lang === 'en' ? 'Let the client talk 80% of the time. You should only talk 20% to ask these questions and prescribe the solution.' : 'دع العميل يتحدث 80% من وقت المكالمة. يجب أن تتحدث أنت 20% فقط لطرح هذه الأسئلة وتقديم الحل (الروشتة).'}`;

      setResult(text);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'interview-prep',
          data: { clientType, projectType, result: text, mode: 'fast' }
        });
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error generating questions' : 'حدث خطأ أثناء توليد الأسئلة. الرجاء المحاولة مجدداً.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'interview-prep' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert(lang === 'en' ? 'Questions copied successfully!' : 'تم نسخ الأسئلة بنجاح!');
  };

  const leftContent = (
    <div className="space-y-6 animate-fade-in" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">{lang === 'en' ? 'Prospect Client Type' : 'نوع العميل المحتمل'}</label>
        <div className="grid grid-cols-2 gap-3">
          {clientTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setClientType(type.id)}
              className={`p-3 rounded-xl border transition-all text-xs font-bold flex items-center gap-2 ${
                clientType === type.id 
                ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              <span className="text-xl">{type.icon}</span>
              <span>{lang === 'en' ? type.label_en : type.label_ar}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">{lang === 'en' ? 'Project or Job Type' : 'نوع المشروع أو الوظيفة'}</label>
        <textarea 
          placeholder={lang === 'en' ? 'e.g. Design a food delivery app, or manage TikTok campaigns for a dental clinic...' : 'مثال: تصميم تطبيق توصيل طلبات، أو إدارة حملات تيك توك لعيادة أسنان...'}
          className="premium-input min-h-[120px] py-4 text-sm leading-relaxed text-right focus:bg-rose-900/10 focus:border-rose-500/50 transition-all resize-none"
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
        />
      </div>

      {/* Dual Mode Selector */}
      <AnalysisModeSelector 
        mode={analysisMode} 
        onChange={setAnalysisMode} 
        lang={lang} 
        accentColor="#E11D48" 
      />

      <button 
        onClick={handleGenerate}
        disabled={isGenerating || !projectType.trim()}
        className={`w-full premium-button flex items-center justify-center gap-3 py-5 text-sm ${
          (!projectType.trim() || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ backgroundImage: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', boxShadow: '0 10px 20px -5px rgba(225, 29, 72, 0.4)' }}
      >
        {isGenerating ? (lang === 'en' ? 'Preparing strategic questions...' : 'جاري تجهيز الأسئلة الاستراتيجية...') : `🎤 ${lang === 'en' ? 'Generate Smart Interview Questions' : 'توليد أسئلة المقابلة الذكية'}`}
      </button>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
          <input 
            type="checkbox" 
            checked={state?.completedSteps?.includes('interview-prep') || false}
            onChange={handleComplete}
            className="w-5 h-5 rounded accent-rose-500" 
          />
          <span className="text-slate-300 font-bold text-sm">{lang === 'en' ? 'Successfully prepared for interview ✅' : 'تم الاستعداد للمقابلة بنجاح ✅'}</span>
        </label>
      </div>
    </div>
  );

  const rightContent = (
    <div className="h-full relative group">
      {!result && !isGenerating && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
          <span className="text-6xl mb-4">🎤</span>
          <p className="text-xl font-bold">{lang === 'en' ? 'Whoever asks leads the conversation.' : 'من يسأل هو من يقود المحادثة.'}</p>
          <p className="text-xs mt-2 text-slate-400">{lang === 'en' ? 'Prepare for your next call with questions that make you look like an indispensable expert.' : 'استعد لمكالمتك القادمة بأسئلة تجعلك تبدو كالخبير الذي لا يستغنى عنه.'}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-3xl h-full relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent"></div>
          
          <button 
            onClick={handleCopy}
            className="absolute top-4 left-4 bg-white/10 hover:bg-rose-500 hover:text-white text-slate-300 px-4 py-2 rounded-xl transition-all font-bold text-xs border border-white/10"
          >
            📋 {lang === 'en' ? 'Copy Questions' : 'نسخ الأسئلة'}
          </button>
          
          <h3 className="text-rose-400 font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <span>🎤</span> {lang === 'en' ? 'Strategic Leadership Questions:' : 'أسئلة القيادة الاستراتيجية:'}
          </h3>
          
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap text-sm custom-scrollbar max-h-[500px] overflow-y-auto pr-2">
            {result}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <InteractiveToolLayout
      id="interview-prep"
      title={lang === 'en' ? 'Smart Interview Preparation' : 'التحضير للمقابلات الذكية'}
      subtitle={lang === 'en' ? 'Whoever asks leads the conversation. Generate custom strategic questions that position you as an expert and uncover the client\'s budget and real expectations.' : 'من يسأل هو من يقود المحادثة. قم بتوليد أسئلة استراتيجية مخصصة لمشروعك تظهرك بمظهر الخبير وتكشف ميزانية العميل وتوقعاته الحقيقية.'}
      icon="🎤"
      stepNumber={stepNumber}
      leftContent={leftContent}
      rightContent={rightContent}
      isGenerating={isGenerating}
    />
  );
}

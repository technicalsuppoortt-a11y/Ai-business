import React, { useState } from 'react';
import InteractiveToolLayout from './InteractiveToolLayout';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';

export default function PortfolioBuilder({ stepNumber }) {
  const toast = useToast();
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  const [projectData, setProjectData] = useState({
    title: '', client: '', challenge: '', solution: '', result: ''
  });
  const [generatedCaseStudy, setGeneratedCaseStudy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCaseStudy = async () => {
    const { title, challenge, solution, result } = projectData;
    if (!title || !challenge || !solution || !result) {
      alert(lang === 'en' ? 'Please fill in all required fields to generate the case study' : 'برجاء ملء جميع الحقول الأساسية لتوليد دراسة الحالة');
      return;
    }
    setIsGenerating(true);
    setGeneratedCaseStudy('');

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: 'portfolio-builder',
          inputs: projectData,
          context: { niche: state.niche, user: state.user },
          lang,
      uid: userData?.uid || state?.user?.uid
    });
        setGeneratedCaseStudy(liveResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'portfolio-builder',
          data: { projectData, result: liveResult, mode: 'live' }
        });
      } else {
        await new Promise(r => setTimeout(r, 400));
        
        let text = `### 🚀 ${title}\n`;
        text += `**${lang === 'en' ? 'Client / Industry' : 'العميل / الصناعة'}:** ${projectData.client || (lang === 'en' ? 'Anonymous' : 'غير محدد')}\n\n`;
        
        text += `**📌 ${lang === 'en' ? 'The Challenge' : 'التحدي (المشكلة)'}:**\n${challenge}\n\n`;
        
        text += `**🛠 ${lang === 'en' ? 'The Solution' : 'الحل المبتكر'}:**\n${solution}\n\n`;
        
        text += `**📈 ${lang === 'en' ? 'Results & Impact' : 'النتائج والأثر'}:**\n${result}\n\n`;
        
        text += `**✨ ${lang === 'en' ? 'Why This Project Matters' : 'القيمة المضافة للعميل'}:**\n`;
        text += lang === 'en' 
          ? `This project clearly demonstrates my capacity to tackle complex challenges and deliver measurable, high-quality results efficiently.` 
          : `هذا المشروع يثبت قدرتي على معالجة التحديات المعقدة وتقديم حلول عملية تحقق نتائج ملموسة ونجاحاً حقيقياً لعملائي.`;

        setGeneratedCaseStudy(text);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'portfolio-builder',
          data: { projectData, result: text, mode: 'fast' }
        });
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
    dispatch({ type: 'COMPLETE_STEP', payload: 'portfolio-builder' });
  };

  const leftContent = (
    <div className="space-y-6 animate-fade-in" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 space-y-6">
        <div>
          <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block tracking-widest">
            {lang === 'en' ? 'Project Title' : 'عنوان المشروع'}
          </label>
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'e.g. E-commerce store for a fashion brand' : 'مثال: تطوير متجر إلكتروني لشركة ملابس'}
            className="premium-input h-12 text-sm"
            value={projectData.title}
            onChange={(e) => setProjectData({...projectData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block tracking-widest">
            {lang === 'en' ? 'Client / Industry (Optional)' : 'العميل / الصناعة (اختياري)'}
          </label>
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'e.g. Saudi specialty coffee store' : 'مثال: متجر سعودي للقهوة المختصة'}
            className="premium-input h-12 text-sm"
            value={projectData.client}
            onChange={(e) => setProjectData({...projectData, client: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block tracking-widest">
            {lang === 'en' ? 'The Challenge (Problem)' : 'التحدي (المشكلة)'}
          </label>
          <textarea 
            placeholder={lang === 'en' ? 'What problem was the client facing before your intervention?' : 'ما هي المشكلة التي كان يعاني منها العميل قبل تدخلك؟'}
            className="premium-input min-h-[80px] py-3 text-sm resize-none"
            value={projectData.challenge}
            onChange={(e) => setProjectData({...projectData, challenge: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block tracking-widest">
            {lang === 'en' ? 'The Solution (What did you do?)' : 'الحل (ماذا فعلت؟)'}
          </label>
          <textarea 
            placeholder={lang === 'en' ? 'Explain the steps and methodology you followed to solve the problem.' : 'اشرح الخطوات والمنهجية التي اتبعتها لحل المشكلة.'}
            className="premium-input min-h-[80px] py-3 text-sm resize-none"
            value={projectData.solution}
            onChange={(e) => setProjectData({...projectData, solution: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block tracking-widest">
            {lang === 'en' ? 'The Result (Numbers)' : 'النتيجة بالأرقام'}
          </label>
          <textarea 
            placeholder={lang === 'en' ? 'e.g. Increased sales by 30% or saved 10 work hours weekly' : 'مثال: زيادة المبيعات 30% أو توفير 10 ساعات عمل أسبوعياً'}
            className="premium-input min-h-[80px] py-3 text-sm resize-none"
            value={projectData.result}
            onChange={(e) => setProjectData({...projectData, result: e.target.value})}
          />
        </div>

        {/* Dual Mode Selector */}
        <AnalysisModeSelector 
          mode={analysisMode} 
          onChange={setAnalysisMode} 
          lang={lang} 
          accentColor="#EC4899" 
        />

        <button 
          onClick={generateCaseStudy}
          disabled={isGenerating || !projectData.title || !projectData.challenge || !projectData.solution || !projectData.result}
          className={`w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-3 transition-all ${
            isGenerating || !projectData.title ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-pink-500 text-white shadow-[0_10px_30px_rgba(236,72,153,0.3)] hover:scale-[1.02]'
          }`}
        >
          {isGenerating ? (lang === 'en' ? 'Crafting professionally...' : 'جاري الصياغة الاحترافية...') : `✨ ${lang === 'en' ? 'Generate Case Study with AI' : 'صياغة دراسة الحالة بالذكاء الاصطناعي'}`}
        </button>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
          <input 
            type="checkbox" 
            checked={state?.completedSteps?.includes('portfolio-builder') || false}
            onChange={handleComplete}
            className="w-5 h-5 rounded accent-pink-500" 
          />
          <span className="text-slate-300 font-bold text-sm">
            {lang === 'en' ? 'Strategic portfolio built ✅' : 'تم بناء معرض الأعمال الاستراتيجي ✅'}
          </span>
        </label>
      </div>
    </div>
  );

  const rightContent = (
    <div className="h-full relative flex flex-col gap-6" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      {!generatedCaseStudy && !isGenerating ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
          <span className="text-6xl mb-4">📁</span>
          <p className="text-xl font-bold">{lang === 'en' ? 'Your portfolio awaits.' : 'معرض أعمالك قيد الانتظار.'}</p>
          <p className="text-xs mt-2 text-slate-400">{lang === 'en' ? 'Fill in the data and we\'ll craft a case study that sells your services for you.' : 'املأ البيانات لنصيغ لك دراسة حالة تبيع خدماتك نيابة عنك.'}</p>
        </div>
      ) : (
        <div className="flex-1 bg-slate-900 border border-pink-500/30 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl flex flex-col">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-pink-500 to-transparent"></div>
          
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
            <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-2">
              <span>✨</span> {lang === 'en' ? 'Ready Case Study' : 'دراسة الحالة الجاهزة'}
            </h3>
            {generatedCaseStudy && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedCaseStudy);
                  alert(lang === 'en' ? 'Case study copied successfully!' : 'تم نسخ دراسة الحالة بنجاح!');
                }}
                className="bg-white/10 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                📋 {lang === 'en' ? 'Copy Text' : 'نسخ النص'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                  <p className="text-pink-400 font-bold text-sm">
                    {lang === 'en' ? 'Turning your project into a success story...' : 'يتم الآن تحويل مشروعك إلى قصة نجاح...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm animate-fade-in">
                {generatedCaseStudy}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <p className="text-[10px] text-pink-400 leading-relaxed italic text-center font-bold">
              {lang === 'en' 
                ? 'Tip: Use these texts in your project descriptions on Behance, LinkedIn, or Upwork Portfolio to increase your proposal acceptance rate.'
                : 'نصيحة: استخدم هذه النصوص في وصف مشاريعك على Behance أو LinkedIn أو Upwork Portfolio لرفع نسبة قبول عروضك.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <InteractiveToolLayout
      id="portfolio-builder"
      title={lang === 'en' ? 'Case Study Builder' : 'منشئ دراسات الحالة (Case Studies)'}
      subtitle={lang === 'en' ? "Clients don't look for pretty pictures, they look for proof of your ability to solve their problems. Turn your past projects into convincing case studies with AI." : 'العملاء لا يبحثون عن مجرد صور جميلة، بل عن دليل على قدرتك على حل مشاكلهم. حوّل مشاريعك السابقة إلى دراسات حالة مقنعة بالذكاء الاصطناعي.'}
      icon="📁"
      stepNumber={stepNumber}
      leftContent={leftContent}
      rightContent={rightContent}
      isGenerating={isGenerating}
    />
  );
}

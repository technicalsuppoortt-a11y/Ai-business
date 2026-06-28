import React, { useState } from 'react';
import InteractiveToolLayout from './InteractiveToolLayout';
import { FREELANCE_DB } from '../../../data/freelanceData';
import { useApp } from '../../../context/AppContext';
import { getPlatformStrategy } from '../../../services/contentDbService';

export default function PlatformRadar({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const [filter, setFilter] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStrategy, setAiStrategy] = useState('');

  const platforms = FREELANCE_DB.platforms;
  
  const filteredPlatforms = platforms.filter(p => {
    if (filter === 'all') return true;
    if (['egypt', 'arab', 'global'].includes(filter)) return p.scope === filter;
    if (filter === 'beginner') return p.level === 'beginner';
    if (filter === 'pro') return p.level === 'pro';
    return p.cats.includes(filter);
  });

  const handleSelectPlatform = (p) => {
    setSelectedPlatform(p);
    setAiStrategy('');
  };

  const handleAnalyze = async () => {
    if (!selectedPlatform) {
      alert(lang === 'en' ? 'Please select a platform first.' : 'الرجاء اختيار منصة أولاً.');
      return;
    }
    setIsGenerating(true);
    setAiStrategy('');

    try {
      await new Promise(r => setTimeout(r, 600));

      const dbResult = await getPlatformStrategy(selectedPlatform.id, state.niche || 'general');
      
      if (dbResult && (dbResult.conquest_plan_ar || dbResult.conquest_plan_en)) {
        const plan = lang === 'en' ? (dbResult.conquest_plan_en || dbResult.conquest_plan_ar) : dbResult.conquest_plan_ar;
        const tip = lang === 'en' ? (dbResult.golden_tip_en || dbResult.golden_tip_ar) : dbResult.golden_tip_ar;
        
        let text = plan;
        if (tip) {
          text += `\n\n**💡 ${lang === 'en' ? 'Golden Tip' : 'السر الأكبر'}:** ${tip}`;
        }
        setAiStrategy(text);
      } else {
        setAiStrategy(lang === 'en' 
          ? "No specific strategy found for this platform/niche yet. We are constantly updating the database." 
          : "لم يتم العثور على استراتيجية مخصصة لهذه المنصة/النيتش بعد. نقوم بتحديث قاعدة البيانات باستمرار.");
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error during generation. Please try again.' : 'حدث خطأ أثناء التوليد. الرجاء المحاولة مجدداً.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'platform-radar' });
  };

  const leftContent = (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'all', label_ar: '🌐 الكل', label_en: '🌐 All' },
          { id: 'egypt', label_ar: '🇪🇬 مصر', label_en: '🇪🇬 Egypt' },
          { id: 'arab', label_ar: '🌙 عربي', label_en: '🌙 Arab' },
          { id: 'global', label_ar: '🚀 عالمي', label_en: '🚀 Global' },
          { id: 'beginner', label_ar: '🟢 مبتدئين', label_en: '🟢 Beginners' },
          { id: 'pro', label_ar: '🔶 محترفين', label_en: '🔶 Professionals' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filter === f.id 
              ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
              : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
            }`}
          >
            {lang === 'en' ? f.label_en : f.label_ar}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-white/5 p-4 rounded-[2rem] max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2">
          {filteredPlatforms.map(p => (
            <div 
              key={p.id}
              onClick={() => handleSelectPlatform(p)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedPlatform?.id === p.id 
                ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center font-black text-xs text-slate-300">
                  {p.abbr}
                </div>
              </div>
              <h3 className={`text-sm font-black mb-1 ${selectedPlatform?.id === p.id ? 'text-amber-400' : 'text-white'}`}>{p.name}</h3>
              <p className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
          <input 
            type="checkbox" 
            checked={state?.completedSteps?.includes('platform-radar') || false}
            onChange={handleComplete}
            className="w-5 h-5 rounded accent-amber-500" 
          />
          <span className="text-slate-300 font-bold text-sm">{lang === 'en' ? 'Target platforms selected ✅' : 'تم اختيار المنصات المستهدفة ✅'}</span>
        </label>
      </div>
    </div>
  );

  const rightContent = (
    <div className="h-full relative flex flex-col gap-6" dir="rtl">
      {!selectedPlatform ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
          <span className="text-6xl mb-4">🌐</span>
          <p className="text-xl font-bold">{lang === 'en' ? 'Platform radar awaits your signal.' : 'رادار المنصات ينتظر إشارتك.'}</p>
          <p className="text-xs mt-2 text-slate-400">{lang === 'en' ? 'Choose a platform from the list to explore it and plan to conquer it.' : 'اختر منصة من القائمة لاستكشافها ووضع خطة اختراقها.'}</p>
        </div>
      ) : (
        <>
          {/* Platform Details Card */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex-shrink-0 animate-scale-up">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-amber-500 to-transparent"></div>
            
            <div className="flex gap-5 items-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-xl font-black text-slate-300">
                {selectedPlatform.abbr}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{selectedPlatform.name}</h3>
                <p className="text-amber-400 text-xs font-bold mt-1 cursor-pointer hover:underline" onClick={() => window.open(selectedPlatform.url, '_blank')}>{selectedPlatform.url.replace('https://', '')} ↗</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-2xl">
                <span className="block text-[10px] text-slate-500 mb-1">{lang === 'en' ? 'Commission' : 'العمولة'}</span>
                <span className="text-sm font-bold text-white">{selectedPlatform.commission}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <span className="block text-[10px] text-slate-500 mb-1">{lang === 'en' ? 'Success Rate' : 'فرصة النجاح'}</span>
                <span className="text-sm font-bold text-amber-400">{selectedPlatform.successRate}</span>
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-3 transition-all ${
                isGenerating ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-amber-500 text-slate-900 hover:scale-[1.02]'
              }`}
            >
              {isGenerating ? (lang === 'en' ? 'Drawing the plan...' : 'جاري رسم الخطة...') : `🚀 ${lang === 'en' ? `Generate Conquest Plan for ${selectedPlatform.name}` : `توليد خطة اكتساح ${selectedPlatform.name}`}`}
            </button>
          </div>

          {/* AI Strategy Area */}
          <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-[2rem] p-6 overflow-y-auto custom-scrollbar relative">
             {!aiStrategy && !isGenerating && (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                 <span className="text-4xl mb-4">🤖</span>
                 <p className="text-xs font-bold text-white">{lang === 'en' ? 'Press generate button to know the secret of success on this platform.' : 'اضغط على زر التوليد لمعرفة سر النجاح في هذه المنصة.'}</p>
               </div>
             )}
             
             {aiStrategy && (
               <div className="animate-fade-in">
                 <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm">
                   {aiStrategy}
                 </div>
               </div>
             )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <InteractiveToolLayout
      id="platform-radar"
      title={lang === 'en' ? 'Full Platform Radar' : 'رادار المنصات الكامل'}
      subtitle={lang === 'en' ? 'Discover where your ideal clients are and get a customized plan to conquer the platform based on your specialty.' : 'اكتشف أين يتواجد عملاؤك المثاليون واحصل على خطة مخصصة لاختراق المنصة بناءً على تخصصك.'}
      icon="🌐"
      stepNumber={stepNumber}
      leftContent={leftContent}
      rightContent={rightContent}
      isGenerating={isGenerating}
    />
  );
}

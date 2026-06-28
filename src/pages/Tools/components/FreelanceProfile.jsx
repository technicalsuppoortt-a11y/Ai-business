import React, { useState } from 'react';
import InteractiveToolLayout from './InteractiveToolLayout';
import { useApp } from '../../../context/AppContext';
import { getBioTemplate } from '../../../services/contentDbService';

export default function FreelanceProfile({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const [isGenerating, setIsGenerating] = useState(false);
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('1');

  const handleGenBio = async () => {
    setIsGenerating(true);
    setBio('');
    
    try {
      await new Promise(r => setTimeout(r, 600));
      
      let expLevel = 'intermediate';
      if (experience === 'fresh' || experience === '1') expLevel = 'beginner';
      if (experience === '5+') expLevel = 'expert';

      const dbResult = await getBioTemplate(state.niche || 'general', expLevel);
      
      if (dbResult && (dbResult.bio_ar || dbResult.bio_en)) {
        const bioText = lang === 'en' ? (dbResult.bio_en || dbResult.bio_ar) : dbResult.bio_ar;
        const tipStr = lang === 'en' ? (dbResult.tip_en || dbResult.tip_ar) : dbResult.tip_ar;
        
        let text = `### 📝 ${lang === 'en' ? 'Professional Bio Template' : 'قالب النبذة الاحترافية'}\n\n`;
        text += `*(${lang === 'en' ? 'Adjust the parts in brackets to match your details:' : 'قم بتعديل الأجزاء بين الأقواس لتناسب تفاصيلك:'})*\n\n`;
        text += bioText;
        
        if (tipStr) {
          text += `\n\n---\n**💡 ${lang === 'en' ? 'Pro Tip' : 'نصيحة ذهبية'}:** ${tipStr}`;
        }
        setBio(text);
      } else {
        setBio(lang === 'en' 
          ? "No bio template found for this combination. We are constantly adding new templates." 
          : "لم يتم العثور على قالب نبذة لهذا الاختيار بعد. نحن نضيف قوالب جديدة باستمرار.");
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Failed to generate bio' : 'فشل توليد النبذة');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'freelance-profile' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bio);
    alert(lang === 'en' ? 'Copied successfully!' : 'تم النسخ بنجاح!');
  };

  const experienceOptions = [
    { id: 'fresh', label_ar: 'أبدأ رحلتي', label_en: 'Just Starting' },
    { id: '1', label_ar: 'سنة واحدة', label_en: '1 Year' },
    { id: '2-3', label_ar: '2-3 سنوات', label_en: '2-3 Years' },
    { id: '5+', label_ar: 'أكثر من 5 سنوات', label_en: '5+ Years' }
  ];

  const leftContent = (
    <div className="space-y-6 animate-fade-in" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
          {lang === 'en' ? 'Exact Job Title' : 'المسمى الوظيفي الدقيق'}
        </label>
        <input 
          type="text" 
          value={state.exactTitle || ''}
          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'exactTitle', value: e.target.value })}
          placeholder="e.g. Senior UI/UX Designer"
          className="premium-input text-left"
          dir="ltr"
        />
        <div className="flex flex-wrap gap-2 mt-4">
          {(FREELANCE_DB.jobTitles[state.niche] || []).slice(0, 5).map(title => (
            <button 
              key={title}
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'exactTitle', value: title })}
              className="px-3 py-1.5 bg-slate-900/50 border border-white/5 rounded-xl text-[10px] text-slate-400 hover:border-blue-500/50 hover:text-blue-400 transition-all font-bold"
            >
              + {title}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
          {lang === 'en' ? 'Years of Experience' : 'سنوات الخبرة'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {experienceOptions.map(exp => (
            <button
              key={exp.id}
              onClick={() => setExperience(exp.id)}
              className={`p-3 rounded-xl border transition-all text-sm font-bold ${
                experience === exp.id 
                ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              {lang === 'en' ? exp.label_en : exp.label_ar}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleGenBio}
        disabled={isGenerating || !state.exactTitle}
        className={`w-full premium-button flex items-center justify-center gap-3 py-5 text-sm ${
          (!state.exactTitle || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)' }}
      >
        {isGenerating ? (lang === 'en' ? 'Generating...' : 'جاري الصياغة...') : `✨ ${lang === 'en' ? 'Generate Bio with AI' : 'توليد النبذة بالذكاء الاصطناعي'}`}
      </button>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
          <input 
            type="checkbox" 
            checked={state?.completedSteps?.includes('freelance-profile') || false}
            onChange={handleComplete}
            className="w-5 h-5 rounded accent-blue-500" 
          />
          <span className="text-slate-300 font-bold text-sm">
            {lang === 'en' ? 'Profile is ready ✅' : 'تم إعداد الملف الشخصي ✅'}
          </span>
        </label>
      </div>
    </div>
  );

  const rightContent = (
    <div className="h-full relative group">
      {!bio && !isGenerating && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
          <span className="text-6xl mb-4">👤</span>
          <p className="text-xl font-bold">
            {lang === 'en' ? 'Your professional identity is built here' : 'هويتك المهنية تُصنع هنا'}
          </p>
        </div>
      )}
      
      {bio && (
        <div className="bg-slate-900 border border-blue-500/20 p-8 rounded-3xl h-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
          
          <button 
            onClick={handleCopy}
            className="absolute top-4 left-4 bg-white/10 hover:bg-blue-500 hover:text-white text-slate-300 px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            📋 {lang === 'en' ? 'Copy Bio' : 'نسخ النبذة'}
          </button>
          
          <h3 className="text-blue-400 font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <span>✨</span> {lang === 'en' ? 'Professional Bio:' : 'النبذة التعريفية (Bio):'}
          </h3>
          
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
            {bio}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <InteractiveToolLayout
      id="freelance-profile"
      title={lang === 'en' ? 'Smart Freelance Profile' : 'ملفك المهني الذكي'}
      subtitle={lang === 'en' ? 'Define your exact job title and generate a professional Bio that grabs clients\' attention from the first moment.' : 'حدد مسماك الوظيفي الدقيق وقم بتوليد نبذة تعريفية (Bio) تخطف أنظار العملاء من اللحظة الأولى.'}
      icon="👤"
      stepNumber={stepNumber}
      leftContent={leftContent}
      rightContent={rightContent}
      isGenerating={isGenerating}
    />
  );
}

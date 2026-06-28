import React, { useState } from 'react';
import InteractiveToolLayout from './InteractiveToolLayout';
import { FREELANCE_DB } from '../../../data/freelanceData';
import { useApp } from '../../../context/AppContext';

export default function SkillsCrafter({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const [selectedCat, setSelectedCat] = useState('design');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  const toggleSkill = (skill) => {
    if (selectedSkills.some(s => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleGenerate = async () => {
    if (selectedSkills.length === 0) {
      alert(lang === 'en' ? 'Please select at least one skill' : 'الرجاء اختيار مهارة واحدة على الأقل');
      return;
    }

    setIsGenerating(true);
    setResult('');

    try {
      await new Promise(r => setTimeout(r, 400));
      
      let text = `### 💎 ${lang === 'en' ? 'Your Value Propositions' : 'عروض القيمة الخاصة بك'}\n\n`;
      text += `*(${lang === 'en' ? 'Use these directly in your bio or proposals to focus on results instead of just naming skills:' : 'استخدم هذه العبارات مباشرة في البايو أو العروض للتركيز على النتائج بدلاً من مجرد سرد المهارات:'})*\n\n`;

      selectedSkills.forEach((skill) => {
        const skillName = skill.name;
        
        // Basic template generation based on category or general
        const valuePropEn = `I don't just provide **${skillName}** services. I deliver a seamless experience that solves your problem and helps you achieve your core business goals efficiently and professionally.`;
        const valuePropAr = `أنا لا أقدم لك مجرد خدمة **${skillName}**. بل أقدم لك تجربة متكاملة تحل مشكلتك وتساعدك على تحقيق أهداف مشروعك الأساسية باحترافية وسرعة.`;
        
        const tipEn = `Instead of saying "I am skilled at ${skillName}", say: "I will use my expertise in ${skillName} to save your time and increase your ROI."`;
        const tipAr = `بدلاً من أن تقول "أنا خبير في ${skillName}"، قل: "سأستخدم خبرتي في ${skillName} لتوفير وقتك وزيادة أرباحك."`;

        text += `### 🎯 ${skillName}\n`;
        text += `**${lang === 'en' ? 'What to tell the client' : 'ماذا تقول للعميل'}:**\n${lang === 'en' ? valuePropEn : valuePropAr}\n\n`;
        text += `**💡 ${lang === 'en' ? 'Pro Tip' : 'نصيحة بيعية'}:** ${lang === 'en' ? tipEn : tipAr}\n\n---\n\n`;
      });

      setResult(text);
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error generating. Please try again.' : 'حدث خطأ أثناء التوليد. الرجاء المحاولة مجدداً.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'skills-crafting' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert(lang === 'en' ? 'Proposals copied successfully!' : 'تم نسخ العروض بنجاح!');
  };

  const leftContent = (
    <div className="space-y-6 animate-fade-in" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {Object.keys(FREELANCE_DB.skillsDB).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-black transition-all border ${
              selectedCat === cat 
              ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
              : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
            }`}
          >
            {{design:'التصميم', dev:'البرمجة', writing:'الكتابة', marketing:'التسويق', video:'الفيديو'}[cat] || cat}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2rem]">
        <label className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">{lang === 'en' ? 'Choose your skills (click to add)' : 'اختر مهاراتك (اضغط للإضافة)'}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {FREELANCE_DB.skillsDB[selectedCat]?.map(skill => {
            const isSelected = selectedSkills.some(s => s.id === skill.id);
            return (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-right ${
                  isSelected 
                  ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <div className={`text-xs font-black ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>{skill.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating || selectedSkills.length === 0}
        className={`w-full premium-button flex items-center justify-center gap-3 py-5 text-sm ${
          (selectedSkills.length === 0 || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)' }}
      >
        {isGenerating ? (lang === 'en' ? 'Converting skills to sales copy...' : 'جاري تحويل المهارات إلى عروض...') : `✨ ${lang === 'en' ? 'Convert Skills to Sales Copy' : 'تحويل المهارات إلى كلام بيعي'}`}
      </button>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
          <input 
            type="checkbox" 
            checked={state?.completedSteps?.includes('skills-crafting') || false}
            onChange={handleComplete}
            className="w-5 h-5 rounded accent-blue-500" 
          />
          <span className="text-slate-300 font-bold text-sm">{lang === 'en' ? 'Sales proposals extracted ✅' : 'تم استخراج العروض البيعية ✅'}</span>
        </label>
      </div>
    </div>
  );

  const rightContent = (
    <div className="h-full relative group">
      {!result && !isGenerating && (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
          <span className="text-6xl mb-4">⚡</span>
          <p className="text-xl font-bold">{lang === 'en' ? 'The client buys the result, not the skill.' : 'العميل يشتري النتيجة، وليس المهارة.'}</p>
          <p className="text-xs mt-2 text-slate-400">{lang === 'en' ? 'Choose your skills and we will turn them into magical sales copy.' : 'اختر مهاراتك وسنحولها إلى جمل بيعية ساحرة.'}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-slate-900 border border-blue-500/30 p-8 rounded-3xl h-full relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
          
          <button 
            onClick={handleCopy}
            className="absolute top-4 left-4 bg-white/10 hover:bg-blue-500 hover:text-white text-slate-300 px-4 py-2 rounded-xl transition-all font-bold text-xs border border-white/10"
          >
            📋 {lang === 'en' ? 'Copy Proposals' : 'نسخ العروض'}
          </button>
          
          <h3 className="text-blue-400 font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <span>✨</span> {lang === 'en' ? 'Your Value Propositions:' : 'عروض القيمة الخاصة بك:'}
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
      id="skills-crafting"
      title={lang === 'en' ? 'Craft Skills into Sales Copy' : 'صياغة المهارات بأسلوب بيعي'}
      subtitle={lang === 'en' ? "Clients don't buy 'skills', they buy 'results'. Select your skills and we'll show you how to turn them into value propositions that instantly convince clients." : "العملاء لا يشترون 'المهارات'، بل يشترون 'النتائج'. اختر مهاراتك وسنريك كيف تحولها لعروض قيمة تقنع العميل فوراً."}
      icon="⚡"
      stepNumber={stepNumber}
      leftContent={leftContent}
      rightContent={rightContent}
      isGenerating={isGenerating}
    />
  );
}

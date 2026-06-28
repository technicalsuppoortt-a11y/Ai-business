import React, { useState, useEffect } from 'react';
import InteractiveToolLayout from './InteractiveToolLayout';
import { useApp } from '../../../context/AppContext';
import { getPricingAnalysisTemplate } from '../../../services/contentDbService';
import { parseTemplate } from '../../../utils/templateParser';

export default function FreelancePricing({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  
  const [goal, setGoal] = useState(2000);
  const [currency, setCurrency] = useState('USD');
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [billablePercent, setBillablePercent] = useState(70);
  const [expenses, setExpenses] = useState(200);

  const [hourlyRate, setHourlyRate] = useState(0);
  const [projectRate, setProjectRate] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [actualHours, setActualHours] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

  const currencySymbols = { USD: '$', EGP: 'ج.م', SAR: 'ر.س', AED: 'د.إ', EUR: '€', GBP: '£' };

  useEffect(() => {
    const billableHoursPerWeek = hoursPerWeek * (billablePercent / 100);
    const billableHoursPerMonth = billableHoursPerWeek * 4.33;
    const neededRevenue = Number(goal) + Number(expenses);
    const rate = billableHoursPerMonth > 0 ? (neededRevenue / billableHoursPerMonth) : 0;
    
    setHourlyRate(Math.ceil(rate));
    setProjectRate(Math.ceil(rate * 10));
    setMonthlyRevenue(Math.ceil(billableHoursPerMonth * rate));
    setActualHours(Math.round(billableHoursPerWeek));
  }, [goal, hoursPerWeek, billablePercent, expenses]);

  const handleAnalyze = async () => {
    setIsGenerating(true);
    setAiAnalysis('');

    try {
      await new Promise(r => setTimeout(r, 400));
      
      const nicheName = state.exactTitle || state.subNiche || state.niche || (lang === 'en' ? 'Freelancer' : 'مستقل');
      const rate = hourlyRate;
      const curr = currencySymbols[currency] || currency;

      let rateLevel = 'competitive';
      if (rate > 100) rateLevel = 'premium';
      else if (rate <= 40) rateLevel = 'low';

      const templateData = await getPricingAnalysisTemplate(rateLevel);
      if (templateData && templateData[lang]) {
        const text = parseTemplate(templateData[lang], { nicheName, rate, curr });
        setAiAnalysis(text);
      } else {
        setAiAnalysis(lang === 'en' ? 'Template not found.' : 'لم يتم العثور على القالب.');
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error during price analysis.' : 'حدث خطأ أثناء تحليل السعر.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'freelance-pricing' });
  };

  const leftContent = (
    <div className="space-y-8 animate-fade-in" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
        <h3 className="text-blue-400 font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
          {lang === 'en' ? 'Monthly Financial Goal' : 'الهدف المالي الشهري'}
        </h3>
        <div className="flex gap-4">
          <div className="w-1/3">
            <label className="text-[10px] text-slate-500 font-black uppercase mb-3 block">
              {lang === 'en' ? 'Currency' : 'العملة'}
            </label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="premium-input h-14 text-center font-bold text-sm"
            >
              {Object.keys(currencySymbols).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 font-black uppercase mb-3 block">
              {lang === 'en' ? 'Net Income Required' : 'صافي الدخل المطلوب'}
            </label>
            <input 
              type="number" 
              value={goal} 
              onChange={(e) => setGoal(Number(e.target.value))}
              className="premium-input h-14 text-xl font-black px-4 text-center"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-bold text-slate-300">{lang === 'en' ? 'Work Hours per Week' : 'ساعات العمل أسبوعياً'}</span>
            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg font-black text-xs">
              {hoursPerWeek} {lang === 'en' ? 'hrs' : 'ساعة'}
            </span>
          </div>
          <input type="range" min="5" max="60" value={hoursPerWeek} 
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-bold text-slate-300">{lang === 'en' ? 'Billable Time Ratio' : 'نسبة الوقت الفعلي (Billable)'}</span>
            <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg font-black text-xs">{billablePercent}%</span>
          </div>
          <input type="range" min="40" max="90" step="5" value={billablePercent} 
            onChange={(e) => setBillablePercent(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-bold text-slate-300">{lang === 'en' ? 'Monthly Expenses' : 'المصاريف الشهرية'}</span>
            <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg font-black text-xs">{expenses} {currencySymbols[currency]}</span>
          </div>
          <input type="range" min="0" max="2000" step="50" value={expenses} 
            onChange={(e) => setExpenses(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
      </div>

      <button 
        onClick={handleAnalyze}
        disabled={isGenerating || hourlyRate === 0}
        className={`w-full premium-button flex items-center justify-center gap-3 py-4 text-sm ${
          (hourlyRate === 0 || isGenerating) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)' }}
      >
        {isGenerating ? (lang === 'en' ? 'Analyzing...' : 'جاري التحليل...') : `✨ ${lang === 'en' ? 'Analyze Price with AI' : 'تحليل السعر بالذكاء الاصطناعي'}`}
      </button>

      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
          <input 
            type="checkbox" 
            checked={state?.completedSteps?.includes('freelance-pricing') || false}
            onChange={handleComplete}
            className="w-5 h-5 rounded accent-blue-500" 
          />
          <span className="text-slate-300 font-bold text-sm">
            {lang === 'en' ? 'Target price set ✅' : 'تم تحديد السعر المستهدف ✅'}
          </span>
        </label>
      </div>
    </div>
  );

  const rightContent = (
    <div className="h-full relative flex flex-col gap-6" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      {/* Result Card */}
      <div className="bg-gradient-to-br from-blue-500/10 via-slate-900 to-purple-500/10 rounded-[2.5rem] border border-blue-500/20 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl flex-shrink-0">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 w-full space-y-10">
          <div className="space-y-2">
            <p className="text-xs text-blue-400 font-black uppercase tracking-[0.3em]">
              {lang === 'en' ? 'Minimum Hourly Rate' : 'الحد الأدنى لسعر ساعتك'}
            </p>
            <div className="text-7xl lg:text-8xl font-black text-white flex items-center justify-center gap-2">
              <span className="text-3xl text-slate-500">{currencySymbols[currency]}</span>
              {hourlyRate}
            </div>
            <p className="text-sm font-bold text-slate-400">{lang === 'en' ? 'per hour' : 'في الساعة الواحدة'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
              <div className="text-2xl font-black text-white mb-1">{projectRate}{currencySymbols[currency]}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-tight">
                {lang === 'en' ? 'Average Project (10 hrs)' : 'سعر مشروع متوسط (10 ساعات)'}
              </div>
            </div>
            <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
              <div className="text-2xl font-black text-white mb-1">{actualHours}</div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-tight">
                {lang === 'en' ? 'Actual billable hours/week' : 'ساعات عمل فعلية أسبوعياً'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Area */}
      <div className="flex-1 bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar relative">
        {!aiAnalysis && !isGenerating && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <span className="text-5xl mb-4">🤖</span>
            <p className="text-sm font-bold text-white">
              {lang === 'en' ? 'Press analyze to learn how to sell this price to your clients' : 'اضغط على زر التحليل لمعرفة كيف تبيع هذا السعر لعملائك'}
            </p>
          </div>
        )}
        {aiAnalysis && (
          <div className="animate-fade-in">
            <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest border-b border-white/10 pb-4">
              <span>✨</span> {lang === 'en' ? 'Client Price Persuasion Strategy' : 'استراتيجية إقناع العميل بالسعر'}
            </h4>
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm">
              {aiAnalysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <InteractiveToolLayout
      id="freelance-pricing"
      title={lang === 'en' ? 'Strategic Pricing Calculator' : 'حاسبة التسعير الاستراتيجية'}
      subtitle={lang === 'en' ? 'Calculate your minimum rate based on your financial goal and available time. Let AI analyze your pricing and help you justify it to clients.' : 'احسب سعرك الأدنى بناءً على هدفك المالي والوقت المتاح. دع الذكاء الاصطناعي يحلل تسعيرك ويساعدك في تبريره للعملاء.'}
      icon="💰"
      stepNumber={stepNumber}
      leftContent={leftContent}
      rightContent={rightContent}
      isGenerating={isGenerating}
    />
  );
}

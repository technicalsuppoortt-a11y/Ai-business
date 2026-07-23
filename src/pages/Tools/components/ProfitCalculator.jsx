import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { getProfitScenarioTemplate } from '../../../services/contentDbService';
import { parseTemplate } from '../../../utils/templateParser';
import { CURRENCY_SYMBOLS } from '../../../data/database';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  DollarSign,
  ShoppingBag,
  Tag,
  Target,
  TrendingUp,
  Percent,
  MousePointerClick,
  CreditCard,
  Calculator,
  TrendingDown,
  Users,
  ShoppingCart,
  PieChart,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Bot
} from 'lucide-react';
import './ProfitCalculator.css';

export default function ProfitCalculator({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  const currencySymbol = (CURRENCY_SYMBOLS[lang] && CURRENCY_SYMBOLS[lang][state.currency]) || CURRENCY_SYMBOLS['ar'][state.currency] || '$';
  
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  // -- Product Economics Inputs --
  const [salePrice, setSalePrice] = useState(49);
  const [productCost, setProductCost] = useState(15);
  
  // -- Ad Campaign Inputs --
  const [dailyBudget, setDailyBudget] = useState(100);
  const [cpc, setCpc] = useState(0.80);
  const [cvr, setCvr] = useState(2.5); // 2.5%

  // -- AI State --
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState('');

  // ----------------------------------------------------
  // ADVANCED CALCULATIONS
  // ----------------------------------------------------
  const dailyVisitors = cpc > 0 ? (dailyBudget / cpc) : 0;
  const dailySales = dailyVisitors * (cvr / 100);
  
  const dailyRevenue = dailySales * salePrice;
  const dailyProductCosts = dailySales * productCost;
  
  // Cost Per Acquisition = Ad Spend / Sales
  const calculatedCpa = dailySales > 0 ? (dailyBudget / dailySales) : 0;
  
  const totalDailyCosts = dailyProductCosts + dailyBudget;
  const netProfitDaily = dailyRevenue - totalDailyCosts;
  
  const profitMargin = dailyRevenue > 0 ? ((netProfitDaily / dailyRevenue) * 100) : 0;
  const roas = dailyBudget > 0 ? (dailyRevenue / dailyBudget) : 0;

  // Formatting helpers
  const fmtCurrency = (val) => `${currencySymbol} ${val.toFixed(2)}`;
  const fmtNumber = (val) => val.toFixed(0);

  const handleAnalyze = async () => {
    setIsGenerating(true);
    setAiInsights('');

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'profit-calculator',
          inputs: { salePrice, productCost, dailyBudget, cpc, cvr, roas: roas.toFixed(2), profitMargin: profitMargin.toFixed(1), netProfitDaily: netProfitDaily.toFixed(2) },
          context: { niche: state.niche, user: state.user },
          lang
        });
        setAiInsights(liveResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'profit-calculator',
          data: { salePrice, productCost, dailyBudget, cpc, cvr, roas, profitMargin, netProfitDaily, result: liveResult, mode: 'live' }
        });
        toast(lang === 'en' ? 'Live AI Financial Insights generated! ✨' : 'تم توليد التحليل المالي بالذكاء الاصطناعي الحي! ✨', 'success');
      } else {
        await new Promise(r => setTimeout(r, 400));
        
        let scenarioId = 'profitable_general';
        
        if (roas >= 2 && profitMargin >= 30) {
          scenarioId = 'profitable_scale';
        } else if (roas >= 2 && profitMargin > 0 && profitMargin < 30) {
          scenarioId = 'profitable_low_margin';
        } else if (roas >= 1 && roas < 2 && cvr >= 2) {
          scenarioId = 'breakeven_high_cvr';
        } else if (roas < 1 && cvr < 1) {
          scenarioId = 'losing_low_cvr';
        } else if (roas < 1 && cvr >= 1 && (salePrice - productCost) < (salePrice * 0.2)) {
          scenarioId = 'losing_pricing_error';
        } else if (roas < 1 && cvr >= 1) {
          scenarioId = 'losing_high_cpc';
        } else if (netProfitDaily < 0) {
          scenarioId = 'losing_general';
        }

        const templateData = await getProfitScenarioTemplate(scenarioId);
        if (templateData && templateData[lang]) {
          const text = parseTemplate(templateData[lang], { 
            margin: profitMargin.toFixed(1), 
            roas: roas.toFixed(2),
            cvr: cvr.toFixed(1),
            cpc: cpc.toFixed(2),
            salePrice: salePrice.toFixed(2), 
            productCost: productCost.toFixed(2)
          });
          setAiInsights(text);
          dispatch({
            type: 'SAVE_TOOL_RESULT',
            toolId: 'profit-calculator',
            data: { salePrice, productCost, dailyBudget, cpc, cvr, roas, profitMargin, netProfitDaily, result: text, mode: 'fast' }
          });
          toast(lang === 'en' ? 'Financial analysis ready! 🚀' : 'التحليل المالي جاهز! 🚀', 'success');
        } else {
          setAiInsights(lang === 'en' ? 'Template not found.' : 'لم يتم العثور على القالب.');
        }
      }
    } catch (error) {
      console.error(error);
      toast(lang === 'en' ? 'An error occurred during analysis.' : 'حدث خطأ أثناء التحليل.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const bottomSections = [
    {
      icon: <ShieldCheck size={18} color="#3B82F6" />,
      title: lang === 'en' ? 'Media Buying Secrets' : 'أسرار الميديا بايينج المتقدمة',
      items: [
        lang === 'en' ? 'A small 1% increase in CVR can double your net profit without increasing ad budget.' : 'زيادة طفيفة بنسبة 1% في معدل التحويل (CVR) قد تضاعف صافي ربحك بدون زيادة ميزانية الإعلانات.',
        lang === 'en' ? 'ROAS below 2.0 often means you are losing money after product costs. Always track Net Profit.' : 'عائد الإعلانات (ROAS) أقل من 2.0 يعني غالباً أنك تخسر بعد خصم تكلفة المنتج. راقب دائماً صافي الربح.',
        lang === 'en' ? 'Increase your Sale Price or add Order Bumps to easily afford higher CPCs.' : 'ارفع سعر البيع أو أضف منتجات مكملة (Order Bumps) لتتمكن من تحمل تكلفة نقرة (CPC) أعلى والتغلب على المنافسين.'
      ]
    },
    {
      icon: <TrendingDown size={18} color="#EF4444" />,
      title: lang === 'en' ? 'Cost & Funnel Control' : 'التحكم في التكاليف والمسار',
      items: [
        lang === 'en' ? 'High CPC means your ad creative is weak or targeting is too narrow.' : 'ارتفاع سعر النقرة (CPC) يعني أن الإعلان ضعيف (Creative) أو الاستهداف ضيق جداً.',
        lang === 'en' ? 'Low CVR means your landing page lacks trust, speed, or a strong offer.' : 'انخفاض معدل التحويل (CVR) يعني أن صفحة الهبوط تفتقر للثقة، السرعة، أو العرض القوي.',
        lang === 'en' ? 'Never rely solely on ROAS. A high ROAS with tiny volume does not scale a business.' : 'لا تعتمد على الـ ROAS فقط. عائد مرتفع مع حجم مبيعات ضعيف لا يبني مشروعاً كبيراً.'
      ]
    }
  ];

  return (
    <ToolDashboardLayout
      id="profit-calculator"
      title={lang === 'en' ? 'Advanced Profit & ROAS Calculator' : 'الحاسبة المتقدمة للأرباح والإعلانات'}
      subtitle={lang === 'en' ? 'Calculate your exact funnel metrics (Budget, CPC, CVR) to predict your daily profit, Cost Per Acquisition (CPA), and ROAS before spending a dime.' : 'احسب تفاصيل مسارك الإعلاني بدقة (الميزانية، النقرة، التحويل) لتتوقع أرباحك اليومية وعائد الإعلانات قبل إنفاق أي دولار.'}
      stepNumber={stepNumber}
      accentColor="#10B981"
      timeEstimate="10 - 20"
      bottomSections={bottomSections}
    >
      <div className="pc-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="pc-main-grid">
          
          {/* ═══════════════ INPUTS FORM ═══════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* SECTION 1: Product Economics */}
            <div className="pc-panel">
              <div className="pc-panel-title-bar" style={{ color: '#3B82F6' }}>
                <Package size={18} color="#3B82F6" />
                <span>{lang === 'en' ? 'Product Economics' : 'اقتصاديات المنتج'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="pc-input-group">
                  <label className="pc-label">
                    <Tag size={12} color="#3B82F6" />
                    <span>{lang === 'en' ? 'Sale Price' : 'سعر البيع'}</span>
                  </label>
                  <div className="pc-input-wrap">
                    <span className="pc-input-symbol prefix">{currencySymbol}</span>
                    <input 
                      type="number" 
                      value={salePrice} 
                      onChange={(e) => setSalePrice(Number(e.target.value))} 
                      className="pc-input has-prefix" 
                      style={{ textAlign: isRtl ? 'right' : 'left' }} 
                    />
                  </div>
                </div>

                <div className="pc-input-group">
                  <label className="pc-label">
                    <ShoppingBag size={12} color="#3B82F6" />
                    <span>{lang === 'en' ? 'Product Cost' : 'تكلفة المنتج'}</span>
                  </label>
                  <div className="pc-input-wrap">
                    <span className="pc-input-symbol prefix">{currencySymbol}</span>
                    <input 
                      type="number" 
                      value={productCost} 
                      onChange={(e) => setProductCost(Number(e.target.value))} 
                      className="pc-input has-prefix" 
                      style={{ textAlign: isRtl ? 'right' : 'left' }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Ad Funnel */}
            <div className="pc-panel">
              <div className="pc-panel-title-bar" style={{ color: '#10B981' }}>
                <Target size={18} color="#10B981" />
                <span>{lang === 'en' ? 'Ad Campaign Estimates' : 'توقعات الحملة الإعلانية'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="pc-input-group">
                  <label className="pc-label">
                    <CreditCard size={12} color="#10B981" />
                    <span>{lang === 'en' ? 'Daily Ad Budget' : 'الميزانية اليومية للإعلانات'}</span>
                  </label>
                  <div className="pc-input-wrap">
                    <span className="pc-input-symbol prefix">{currencySymbol}</span>
                    <input 
                      type="number" 
                      value={dailyBudget} 
                      onChange={(e) => setDailyBudget(Number(e.target.value))} 
                      className="pc-input has-prefix" 
                      style={{ textAlign: isRtl ? 'right' : 'left' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="pc-input-group">
                    <label className="pc-label">
                      <MousePointerClick size={12} color="#10B981" />
                      <span>{lang === 'en' ? 'Cost Per Click (CPC)' : 'تكلفة النقرة (CPC)'}</span>
                    </label>
                    <div className="pc-input-wrap">
                      <span className="pc-input-symbol prefix">{currencySymbol}</span>
                      <input 
                        type="number" 
                        step="0.05" 
                        value={cpc} 
                        onChange={(e) => setCpc(Number(e.target.value))} 
                        className="pc-input has-prefix" 
                        style={{ textAlign: isRtl ? 'right' : 'left' }} 
                      />
                    </div>
                  </div>

                  <div className="pc-input-group">
                    <label className="pc-label">
                      <Percent size={12} color="#10B981" />
                      <span>{lang === 'en' ? 'Conversion Rate (CVR)' : 'معدل التحويل (CVR)'}</span>
                    </label>
                    <div className="pc-input-wrap">
                      <input 
                        type="number" 
                        step="0.1" 
                        value={cvr} 
                        onChange={(e) => setCvr(Number(e.target.value))} 
                        className="pc-input has-suffix" 
                        style={{ textAlign: isRtl ? 'right' : 'left' }} 
                      />
                      <span className="pc-input-symbol suffix">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Mode Selector */}
            <AnalysisModeSelector 
              mode={analysisMode} 
              onChange={setAnalysisMode} 
              lang={lang} 
              accentColor="#10B981" 
            />

            <button 
              onClick={handleAnalyze}
              disabled={isGenerating}
              className="pc-analyze-btn"
            >
              {isGenerating ? (
                <>
                  <span className="td-spinner" /> 
                  <span>{lang === 'en' ? 'Analyzing Financial Data...' : 'جاري التحليل المالي...'}</span>
                </>
              ) : (
                <>
                  <Bot size={16} /> 
                  <span>{lang === 'en' ? 'AI Business Insights' : 'توجيهات الذكاء الاصطناعي'}</span>
                </>
              )}
            </button>
            
          </div>

          {/* ═══════════════ RESULTS DASHBOARD ═══════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TOP HIGHLIGHT METRICS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Daily Net Profit Card */}
              <div className={`pc-metric-card ${netProfitDaily >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: netProfitDaily >= 0 ? '#10B981' : '#EF4444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {lang === 'en' ? 'Daily Net Profit' : 'صافي الربح اليومي'}
                  </span>
                  {netProfitDaily >= 0 ? <ArrowUpRight size={18} color="#10B981" /> : <ArrowDownRight size={18} color="#EF4444" />}
                </div>

                <div className="pc-metric-value">
                  <span style={{ fontSize: '20px', color: 'var(--text2, #8B96A8)' }}>
                    {netProfitDaily < 0 ? '-' : ''}{currencySymbol}
                  </span>
                  <span>{Math.abs(netProfitDaily).toFixed(2)}</span>
                </div>
              </div>

              {/* ROAS & Margin Card */}
              <div className="pc-metric-card secondary">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text2, #94A3B8)', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} color="#10B981" />
                    <span>ROAS</span>
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: roas >= 2 ? '#10B981' : roas >= 1 ? '#F59E0B' : '#EF4444' }} dir="ltr">
                    {roas.toFixed(2)}x
                  </span>
                </div>

                <div style={{ height: '1px', background: 'var(--line, rgba(255,255,255,0.08))' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text2, #94A3B8)', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PieChart size={14} color="#8B5CF6" />
                    <span>{lang === 'en' ? 'Margin' : 'الهامش'}</span>
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: profitMargin >= 30 ? '#10B981' : profitMargin >= 0 ? '#F59E0B' : '#EF4444' }} dir="ltr">
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* DAILY FUNNEL FLOW */}
            <div className="pc-funnel-container">
              <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text, #F8FAFC)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calculator size={15} color="#10B981" />
                <span>{lang === 'en' ? 'Daily Funnel Flow' : 'مسار المبيعات اليومي'}</span>
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="pc-funnel-row">
                  <div className="pc-funnel-label">
                    <div className="pc-funnel-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
                      <Users size={16} />
                    </div>
                    <span>{lang === 'en' ? 'Visitors (Traffic)' : 'الزوار (Traffic)'}</span>
                  </div>
                  <span className="pc-funnel-val" dir="ltr">{fmtNumber(dailyVisitors)}</span>
                </div>

                <div className="pc-funnel-row">
                  <div className="pc-funnel-label">
                    <div className="pc-funnel-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                      <ShoppingCart size={16} />
                    </div>
                    <span>{lang === 'en' ? 'Sales (Orders)' : 'المبيعات (الطلبات)'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text2, #94A3B8)', background: 'var(--bg2, rgba(0,0,0,0.3))', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--line, rgba(255,255,255,0.06))' }}>
                      CPA: {fmtCurrency(calculatedCpa)}
                    </span>
                    <span className="pc-funnel-val" dir="ltr">{fmtNumber(dailySales)}</span>
                  </div>
                </div>

                <div className="pc-funnel-row">
                  <div className="pc-funnel-label">
                    <div className="pc-funnel-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}>
                      <DollarSign size={16} />
                    </div>
                    <span>{lang === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات'}</span>
                  </div>
                  <span className="pc-funnel-val" dir="ltr" style={{ color: '#10B981' }}>{fmtCurrency(dailyRevenue)}</span>
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <AnimatePresence>
              {aiInsights && (
                <motion.div 
                  className="pc-insights-panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                    <Sparkles size={16} color="#10B981" />
                    <span>{lang === 'en' ? 'Smart Financial Analysis' : 'التحليل المالي الذكي'}</span>
                  </h3>
                  
                  <div className="td-raw-output" style={{ margin: 0, borderTop: '1px solid rgba(16, 185, 129, 0.2)', background: 'transparent' }}>
                    <div style={{ color: 'var(--text, #F8FAFC)', fontSize: '13.5px', lineHeight: '1.8', direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                      {aiInsights.split('\n').map((line, i) => (
                        <p key={i} style={{ margin: '0 0 6px 0' }}>{line.replace(/\*/g, '')}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </div>
    </ToolDashboardLayout>
  );
}

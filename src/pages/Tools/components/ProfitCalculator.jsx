import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getProfitScenarioTemplate } from '../../../services/contentDbService';
import { parseTemplate } from '../../../utils/templateParser';
import { CURRENCY_SYMBOLS } from '../../../data/database';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function ProfitCalculator({ stepNumber }) {
  const { state } = useApp();
  const lang = state.language || 'ar';
  const currencySymbol = (CURRENCY_SYMBOLS[lang] && CURRENCY_SYMBOLS[lang][state.currency]) || CURRENCY_SYMBOLS['ar'][state.currency] || '$';
  
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
      await new Promise(r => setTimeout(r, 600));
      
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
      } else {
        setAiInsights(lang === 'en' ? 'Template not found.' : 'لم يتم العثور على القالب.');
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'An error occurred during analysis.' : 'حدث خطأ أثناء التحليل.');
    } finally {
      setIsGenerating(false);
    }
  };

  const bottomSections = [
    {
      icon: '💡',
      title: lang === 'en' ? 'Media Buying Secrets' : 'أسرار الميديا بايينج المتقدمة',
      items: [
        lang === 'en' ? 'A small 1% increase in CVR can double your net profit without increasing ad budget.' : 'زيادة طفيفة بنسبة 1% في معدل التحويل (CVR) قد تضاعف صافي ربحك بدون زيادة ميزانية الإعلانات.',
        lang === 'en' ? 'ROAS below 2.0 often means you are losing money after product costs. Always track Net Profit.' : 'عائد الإعلانات (ROAS) أقل من 2.0 يعني غالباً أنك تخسر بعد خصم تكلفة المنتج. راقب دائماً صافي الربح.',
        lang === 'en' ? 'Increase your Sale Price or add Order Bumps to easily afford higher CPCs.' : 'ارفع سعر البيع أو أضف منتجات مكملة (Order Bumps) لتتمكن من تحمل تكلفة نقرة (CPC) أعلى والتغلب على المنافسين.'
      ]
    },
    {
      icon: '📉',
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

      <div className="td-grid grid-2" style={{ marginBottom: '36px', alignItems: 'start' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 1: Product Economics */}
          <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📦</span> {lang === 'en' ? 'Product Economics' : 'اقتصاديات المنتج'}
            </h4>
            <div className="grid-2" style={{ gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#8B96A8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {lang === 'en' ? 'Sale Price' : 'سعر البيع'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={salePrice} 
                    onChange={(e) => setSalePrice(Number(e.target.value))} 
                    className="td-input" 
                    style={{ fontSize: '16px', fontWeight: 'bold', paddingInlineStart: '48px', textAlign: lang === 'en' ? 'left' : 'right' }} 
                  />
                  <span style={{ position: 'absolute', insetInlineStart: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8B96A8', fontWeight: 'bold' }}>{currencySymbol}</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#8B96A8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {lang === 'en' ? 'Product Cost' : 'تكلفة المنتج'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={productCost} 
                    onChange={(e) => setProductCost(Number(e.target.value))} 
                    className="td-input" 
                    style={{ fontSize: '16px', fontWeight: 'bold', paddingInlineStart: '48px', textAlign: lang === 'en' ? 'left' : 'right' }} 
                  />
                  <span style={{ position: 'absolute', insetInlineStart: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8B96A8', fontWeight: 'bold' }}>{currencySymbol}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Ad Funnel */}
          <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎯</span> {lang === 'en' ? 'Ad Campaign Estimates' : 'توقعات الحملة الإعلانية'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#8B96A8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {lang === 'en' ? 'Daily Ad Budget' : 'الميزانية اليومية للإعلانات'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={dailyBudget} 
                    onChange={(e) => setDailyBudget(Number(e.target.value))} 
                    className="td-input" 
                    style={{ fontSize: '16px', fontWeight: 'bold', paddingInlineStart: '48px', textAlign: lang === 'en' ? 'left' : 'right' }} 
                  />
                  <span style={{ position: 'absolute', insetInlineStart: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8B96A8', fontWeight: 'bold' }}>{currencySymbol}</span>
                </div>
              </div>
              <div className="grid-2" style={{ gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#8B96A8', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {lang === 'en' ? 'Cost Per Click (CPC)' : 'تكلفة النقرة (CPC)'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={cpc} 
                      onChange={(e) => setCpc(Number(e.target.value))} 
                      className="td-input" 
                      style={{ fontSize: '16px', fontWeight: 'bold', paddingInlineStart: '48px', textAlign: lang === 'en' ? 'left' : 'right' }} 
                    />
                    <span style={{ position: 'absolute', insetInlineStart: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8B96A8', fontWeight: 'bold' }}>{currencySymbol}</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#8B96A8', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {lang === 'en' ? 'Conversion Rate (CVR)' : 'معدل التحويل (CVR)'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={cvr} 
                      onChange={(e) => setCvr(Number(e.target.value))} 
                      className="td-input" 
                      style={{ fontSize: '16px', fontWeight: 'bold', paddingInlineEnd: '28px', textAlign: lang === 'en' ? 'left' : 'right' }} 
                    />
                    <span style={{ position: 'absolute', insetInlineEnd: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8B96A8', fontWeight: 'bold' }}>%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isGenerating}
            className="td-btn-primary"
            style={{ 
              background: isGenerating ? 'rgba(16, 185, 129, 0.2)' : '#10B981',
              color: isGenerating ? '#8B96A8' : '#fff'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" /> {lang === 'en' ? 'Analyzing financial data...' : 'جاري التحليل المالي...'}
              </span>
            ) : (
              <span>🤖 {lang === 'en' ? 'AI Business Insights' : 'توجيهات الذكاء الاصطناعي'}</span>
            )}
          </button>
          
        </div>

        {/* ═══════════════ RESULTS DASHBOARD ═══════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TOP HIGHLIGHTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Net Profit Card */}
            <div style={{ background: netProfitDaily >= 0 ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 18, 32, 0.9) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(13, 18, 32, 0.9) 100%)', border: `1px solid ${netProfitDaily >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, padding: '24px', borderRadius: '20px' }}>
              <p style={{ fontSize: '10px', color: netProfitDaily >= 0 ? '#10B981' : '#EF4444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                {lang === 'en' ? 'Daily Net Profit' : 'صافي الربح اليومي'}
              </p>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', direction: 'ltr' }}>
                <span style={{ fontSize: '20px', color: '#8B96A8' }}>{netProfitDaily < 0 ? '-' : ''}{currencySymbol} </span>
                {Math.abs(netProfitDaily).toFixed(1)}
              </div>
            </div>

            {/* ROAS & Margin Card */}
            <div style={{ background: 'rgba(13, 18, 32, 0.8)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#8B96A8', fontWeight: '900', textTransform: 'uppercase' }}>ROAS</span>
                <span style={{ fontSize: '18px', fontWeight: '900', color: roas >= 2 ? '#10B981' : roas >= 1 ? '#F59E0B' : '#EF4444' }} dir="ltr">{roas.toFixed(2)}x</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#8B96A8', fontWeight: '900', textTransform: 'uppercase' }}>{lang === 'en' ? 'Margin' : 'الهامش'}</span>
                <span style={{ fontSize: '18px', fontWeight: '900', color: profitMargin >= 30 ? '#10B981' : profitMargin >= 0 ? '#F59E0B' : '#EF4444' }} dir="ltr">{profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* FUNNEL FLOW */}
          <div style={{ background: 'rgba(13, 18, 32, 0.6)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
              {lang === 'en' ? 'Daily Funnel Flow' : 'مسار المبيعات اليومي'}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', padding: '4px', borderRadius: '6px', fontSize: '14px' }}>👁️</span>
                  <span style={{ fontSize: '12px', color: '#8B96A8', fontWeight: 'bold' }}>{lang === 'en' ? 'Visitors (Traffic)' : 'الزوار (Traffic)'}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }} dir="ltr">{fmtNumber(dailyVisitors)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '4px', borderRadius: '6px', fontSize: '14px' }}>🛍️</span>
                  <span style={{ fontSize: '12px', color: '#8B96A8', fontWeight: 'bold' }}>{lang === 'en' ? 'Sales (Orders)' : 'المبيعات (الطلبات)'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#8B96A8', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>CPA: {fmtCurrency(calculatedCpa)}</span>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }} dir="ltr">{fmtNumber(dailySales)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '4px', borderRadius: '6px', fontSize: '14px' }}>💰</span>
                  <span style={{ fontSize: '12px', color: '#8B96A8', fontWeight: 'bold' }}>{lang === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات'}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }} dir="ltr">{fmtCurrency(dailyRevenue)}</span>
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          {aiInsights && (
            <div className="td-info-panel animate-fade-in" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span>✨</span> {lang === 'en' ? 'Smart Financial Analysis' : 'التحليل المالي الذكي'}
              </h3>
              <div className="td-raw-output" style={{ margin: 0, borderTop: '2px solid rgba(16, 185, 129, 0.3)', background: 'transparent' }}>
                <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.8', direction: lang === 'en' ? 'ltr' : 'rtl', textAlign: lang === 'en' ? 'left' : 'right' }}>
                  {aiInsights.split('\n').map((line, i) => (
                    <p key={i} style={{ marginBottom: '6px' }}>{line.replace(/\*/g, '')}</p>
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

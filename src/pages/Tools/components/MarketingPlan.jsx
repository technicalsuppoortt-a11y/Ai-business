import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getMarketingPlan } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function MarketingPlan({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  
  const savedState = state.toolResults['marketing-plan'] || {};

  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  const [budget, setBudget] = useState(savedState.budget || '500');
  const [duration, setDuration] = useState(savedState.duration || '30'); // days
  const [goal, setGoal] = useState(savedState.goal || 'sales'); // sales, leads, awareness
  const [clientLevel, setClientLevel] = useState(savedState.clientLevel || 'beginner');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(savedState.result || '');

  const goals = [
    { id: 'sales', label_ar: 'مبيعات مباشرة (E-commerce / Services)', label_en: 'Direct Sales (E-commerce / Services)' },
    { id: 'leads', label_ar: 'جمع بيانات عملاء محتملين (B2B / High Ticket)', label_en: 'Lead Generation (B2B / High Ticket)' },
    { id: 'awareness', label_ar: 'وعي بالعلامة التجارية وبناء جمهور', label_en: 'Brand Awareness & Audience Building' }
  ];

  const clientLevels = [
    { id: 'beginner', label_ar: 'مبتدئ (تأسيس)', label_en: 'Beginner (Foundation)' },
    { id: 'intermediate', label_ar: 'متوسط (نمو)', label_en: 'Intermediate (Growth)' },
    { id: 'professional', label_ar: 'محترف (توسع شامل)', label_en: 'Professional (Omnichannel Scale)' }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'marketing-plan',
          inputs: { budget, duration, goal, clientLevel },
          context: { niche: state.niche, user: state.user },
          lang
        });
        setResult(liveResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'marketing-plan',
          data: {
            budget,
            duration,
            goal,
            clientLevel,
            result: liveResult,
            mode: 'live'
          }
        });
      } else {
        await new Promise(r => setTimeout(r, 800));

        // Determine budget tier based on amount
        const bNum = Number(budget);
        let budgetTier = 'starter';
        if (bNum > 1000) budgetTier = 'scale';
        else if (bNum > 300) budgetTier = 'growth';

        const dbResult = await getMarketingPlan(state.niche || 'general', budgetTier, goal, clientLevel);
        
        if (dbResult && (dbResult.plan_ar || dbResult.plan_en)) {
          const plan = lang === 'en' ? (dbResult.plan_en || dbResult.plan_ar) : dbResult.plan_ar;
          setResult(plan);
          dispatch({
            type: 'SAVE_TOOL_RESULT',
            toolId: 'marketing-plan',
            data: {
              budget,
              duration,
              goal,
              clientLevel,
              result: plan,
              mode: 'fast'
            }
          });
        } else {
          setResult(lang === 'en' 
            ? "No specific marketing plan found for this budget/niche yet. We are constantly updating the database." 
            : "لم يتم العثور على خطة تسويقية مخصصة لهذه الميزانية/النيتش بعد. نقوم بتحديث قاعدة البيانات باستمرار.");
        }
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error generating plan. Try again.' : 'حدث خطأ أثناء التوليد. حاول مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert(lang === 'en' ? 'Copied successfully!' : 'تم النسخ بنجاح!');
  };

  const bottomSections = [
    {
      icon: '💰',
      title: lang === 'en' ? 'Flexible Budget Rule' : 'قاعدة الميزانية المرنة',
      items: [
        lang === 'en' ? 'Don\'t spend your entire budget in the first week. Divide it into a "testing" phase and a "scaling" phase.' : 'لا تصرف ميزانيتك بالكامل في أول أسبوع. قسمها إلى مرحلة "اختبار" ومرحلة "توسع".',
        lang === 'en' ? 'If the ad does not succeed in the testing phase (with a small budget), change the video/image immediately instead of increasing the budget.' : 'إذا لم ينجح الإعلان في فترة الاختبار (بميزانية صغيرة)، قم بتغيير الفيديو/الصورة فوراً بدلاً من زيادة الميزانية.',
        lang === 'en' ? 'The 20% Rule: Allocate 20% of your budget for retargeting because they are the most likely to buy.' : 'قاعدة الـ 20%: خصص 20% من ميزانيتك لإعادة الاستهداف (Retargeting) لأنهم الأكثر احتمالية للشراء.'
      ]
    },
    {
      icon: '📊',
      title: lang === 'en' ? 'Metrics Don\'t Lie (KPIs)' : 'مؤشرات لا تكذب (KPIs)',
      items: [
        lang === 'en' ? 'CTR (Click-Through Rate): If it\'s less than 1%, the problem is in the ad itself (boring or doesn\'t grab attention).' : 'CTR (نسبة النقر): إذا كانت أقل من 1%، فالمشكلة في الإعلان نفسه (الإعلان ممل أو لا يشد الانتباه).',
        lang === 'en' ? 'CPA (Cost Per Acquisition): It must always be lower than your profit margin for the campaign to be profitable.' : 'CPA (تكلفة الاستحواذ): يجب أن تكون دائماً أقل من هامش ربحك لكي تكون الحملة رابحة.',
        lang === 'en' ? 'Conversion Rate: If it\'s less than 2%, the problem is usually in your site speed or your price.' : 'Conversion Rate (نسبة التحويل): إذا كانت أقل من 2%، فالمشكلة غالباً في سرعة موقعك أو سعرك.'
      ]
    }
  ];

  return (
    <ToolDashboardLayout
      id="marketing-plan"
      title={lang === 'en' ? 'Marketing Plan Generator' : 'مخطط الحملات (Marketing Plan)'}
      subtitle={lang === 'en' ? 'Draw your ad budget plan and allocation to ensure the best ROI before launching campaigns.' : 'ارسم خطة ميزانيتك الإعلانية وتوزيعها لضمان أفضل عائد على الاستثمار (ROI) قبل تشغيل الحملات.'}
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="30 - 45"
      bottomSections={bottomSections}
    >

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {lang === 'en' ? 'Available Budget' : 'الميزانية المتاحة'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: 'bold', color: '#8B96A8' }}>$</span>
                <input 
                  type="number" 
                  className="td-input"
                  dir="ltr"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500"
                  style={{ textAlign: 'left', paddingLeft: '40px', fontSize: '18px', fontWeight: 'bold', borderColor: budget ? '#3B82F6' : 'rgba(255, 255, 255, 0.08)' }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {lang === 'en' ? 'Duration (Days)' : 'المدة (بالأيام)'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 'bold', color: '#8B96A8' }}>
                  {lang === 'en' ? 'Days' : 'يوم'}
                </span>
                <input 
                  type="number" 
                  className="td-input"
                  dir="ltr"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  style={{ textAlign: 'left', paddingRight: '50px', paddingLeft: '16px', fontSize: '18px', fontWeight: 'bold', borderColor: duration ? '#3B82F6' : 'rgba(255, 255, 255, 0.08)' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {lang === 'en' ? 'Client Level (Complexity)' : 'مستوى العميل (مدى التعقيد)'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {clientLevels.map(lvl => (
                <label key={lvl.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: clientLevel === lvl.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${clientLevel === lvl.id ? '#3B82F6' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}>
                  <input 
                    type="radio" 
                    name="clientLevel" 
                    value={lvl.id}
                    checked={clientLevel === lvl.id}
                    onChange={() => setClientLevel(lvl.id)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: clientLevel === lvl.id ? '#fff' : '#8B96A8' }}>
                    {lang === 'en' ? lvl.label_en : lvl.label_ar}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {lang === 'en' ? 'Main Campaign Goal' : 'الهدف الرئيسي للحملة'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {goals.map(g => (
                <label key={g.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: goal === g.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${goal === g.id ? '#3B82F6' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}>
                  <input 
                    type="radio" 
                    name="goal" 
                    value={g.id}
                    checked={goal === g.id}
                    onChange={() => setGoal(g.id)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: goal === g.id ? '#fff' : '#8B96A8' }}>
                    {lang === 'en' ? g.label_en : g.label_ar}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Dual Mode Selector */}
          <AnalysisModeSelector 
            mode={analysisMode} 
            onChange={setAnalysisMode} 
            lang={lang} 
            accentColor="#3B82F6" 
          />

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="td-btn-primary"
            style={{ 
              background: isGenerating ? 'rgba(59, 130, 246, 0.2)' : '#3B82F6',
              color: isGenerating ? '#8B96A8' : '#fff'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" /> {lang === 'en' ? 'Building plan...' : 'جاري بناء الخطة...'}
              </span>
            ) : (
              <span>✨ {lang === 'en' ? 'Build Smart Marketing Plan' : 'بناء خطة التسويق الذكية'}</span>
            )}
          </button>
        </div>

        {/* ═══════════════ AI OUTPUT ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗺️</span> {lang === 'en' ? 'Ad Plan' : 'الخطة الإعلانية'}
            </h3>
            {result && !isGenerating && (
              <button 
                onClick={handleCopy}
                style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 {lang === 'en' ? 'Copy Plan' : 'نسخ الخطة'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: result && !isGenerating ? 'flex-start' : 'center', justifyContent: result && !isGenerating ? 'flex-start' : 'center' }}>
            {!result && !isGenerating ? (
              <div style={{ textAlign: 'center', opacity: 0.4 }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🗺️</span>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E8EDF5' }}>
                  {lang === 'en' ? 'Enter your budget to draw the optimal spending plan' : 'أدخل ميزانيتك لنرسم لك خطة الإنفاق المثلى'}
                </p>
                <p style={{ fontSize: '12px', color: '#8B96A8', marginTop: '8px' }}>
                  {lang === 'en' ? 'When to spend, where, and what numbers to monitor.' : 'متى تصرف، وأين، وما هي الأرقام التي ستراقبها.'}
                </p>
              </div>
            ) : isGenerating ? (
               <div style={{ textAlign: 'center' }}>
                 <div className="td-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6', marginBottom: '16px' }}></div>
                 <p style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '14px' }}>
                   {lang === 'en' ? 'Drawing a custom advertising financial plan for you...' : 'يتم الآن رسم خطة مالية إعلانية مخصصة لك...'}
                 </p>
               </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const blocks = result.split(/\n\n(?=\*\*)/);
                  const mainTitleBlock = blocks.shift() || '';
                  const titleLines = mainTitleBlock.split('\n\n');
                  const mainTitle = titleLines[0]?.replace(/## /g, '');
                  const subtitle = titleLines[1] || '';
                  
                  return (
                    <>
                      {mainTitle && (
                         <div style={{ background: '#3B82F6', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginBottom: '8px' }}>
                           {mainTitle}
                           {subtitle && <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '6px', fontWeight: 'normal' }}>{subtitle.replace(/\*\*/g, '')}</div>}
                         </div>
                      )}
                      
                      {blocks.map((block, index) => {
                        const lines = block.split('\n');
                        const title = lines[0].replace(/\*\*/g, '').replace(':', '');
                        const content = lines.slice(1).join('\n');
                        
                        // Pick icon
                        let icon = '🎯';
                        if (title.includes('توزيع الميزانية') || title.includes('Budget')) icon = '💰';
                        else if (title.includes('مؤشرات الأداء') || title.includes('KPIs')) icon = '📊';
                        else if (title.includes('أفكار إعلانية') || title.includes('Creatives')) icon = '🎬';
                        
                        return (
                          <div key={index} style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '16px' }}>
                            <h4 style={{ color: '#3B82F6', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{icon}</span> {title}
                            </h4>
                            <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.8' }}>
                              {content.split('\n').map((line, i) => {
                                let formattedLine = line.trim();
                                if (formattedLine.startsWith('-') || formattedLine.match(/^\d+\./)) {
                                  // It's a bullet point or numbered list item
                                  const isNumbered = formattedLine.match(/^\d+\./);
                                  const listSymbol = isNumbered ? formattedLine.match(/^\d+\./)[0] : '•';
                                  formattedLine = formattedLine.replace(/^(-|\d+\.)\s*/, '');
                                  
                                  return (
                                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                      <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>{listSymbol}</span>
                                      <span>
                                        {formattedLine.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
                                          if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={j} style={{ color: '#93C5FD' }}>{part.replace(/\*\*/g, '')}</strong>;
                                          }
                                          if (part.startsWith('*') && part.endsWith('*')) {
                                            return <em key={j} style={{ color: '#60A5FA', fontStyle: 'italic' }}>{part.replace(/\*/g, '')}</em>;
                                          }
                                          return part;
                                        })}
                                      </span>
                                    </div>
                                  );
                                } else if (formattedLine) {
                                  return <p key={i} style={{ margin: '0 0 8px 0', paddingLeft: '16px', paddingRight: '16px', opacity: 0.8, fontStyle: 'italic', fontSize: '12px' }}>{formattedLine}</p>;
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </div>

    </ToolDashboardLayout>
  );
}

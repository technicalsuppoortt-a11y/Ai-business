import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { getMarketingPlan } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  Sprout,
  Zap,
  Award,
  ShoppingCart,
  Target,
  Compass,
  Map,
  PieChart,
  BarChart3,
  Clapperboard,
  Sparkles,
  Copy,
  CheckCircle2,
  Wrench,
  BookOpen,
  ShieldCheck,
  Layers3,
  HelpCircle,
  Check,
  ClipboardList,
  Rocket
} from 'lucide-react';
import './MarketingPlan.css';

export default function MarketingPlan({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  const savedState = state.toolResults['marketing-plan'] || {};

  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  const [budget, setBudget] = useState(savedState.budget || '500');
  const [duration, setDuration] = useState(savedState.duration || '30'); // days
  const [goal, setGoal] = useState(savedState.goal || 'sales'); // sales, leads, awareness
  const [clientLevel, setClientLevel] = useState(savedState.clientLevel || 'beginner');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(savedState.result || '');

  const goals = [
    { id: 'sales', label_ar: 'مبيعات مباشرة (E-commerce / Services)', label_en: 'Direct Sales (E-commerce / Services)', IconComp: ShoppingCart },
    { id: 'leads', label_ar: 'جمع بيانات عملاء محتملين (B2B / High Ticket)', label_en: 'Lead Generation (B2B / High Ticket)', IconComp: Target },
    { id: 'awareness', label_ar: 'وعي بالعلامة التجارية وبناء جمهور', label_en: 'Brand Awareness & Audience Building', IconComp: Compass }
  ];

  const clientLevels = [
    { id: 'beginner', label_ar: 'مبتدئ (مرحلة التأسيس)', label_en: 'Beginner (Foundation)', IconComp: Sprout },
    { id: 'intermediate', label_ar: 'متوسط (مرحلة النمو)', label_en: 'Intermediate (Growth)', IconComp: Zap },
    { id: 'professional', label_ar: 'محترف (توسع شامل ومتقدم)', label_en: 'Professional (Omnichannel Scale)', IconComp: Award }
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
        toast(lang === 'en' ? 'Live AI Marketing Plan generated! ✨' : 'تم بناء خطة التسويق الذكية بالذكاء الاصطناعي الحي! ✨', 'success');
      } else {
        await new Promise(r => setTimeout(r, 500));

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
          toast(lang === 'en' ? 'Marketing plan ready! 🚀' : 'الخطة الإعلانية جاهزة! 🚀', 'success');
        } else {
          setResult(lang === 'en' 
            ? "No specific marketing plan found for this budget/niche yet. We are constantly updating the database." 
            : "لم يتم العثور على خطة تسويقية مخصصة لهذه الميزانية/النيتش بعد. نقوم بتحديث قاعدة البيانات باستمرار.");
          toast(lang === 'en' ? 'Try switching to Live AI mode for custom insights!' : 'جرب التبديل للوضع الحي للحصول على نتائج مخصصة!', 'warning');
        }
      }
    } catch (error) {
      console.error(error);
      toast(lang === 'en' ? 'Error generating plan. Try again.' : 'حدث خطأ أثناء التوليد. حاول مرة أخرى.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast(lang === 'en' ? 'Marketing plan copied to clipboard! ✅' : 'تم نسخ الخطة التسويقية إلى الحافظة! ✅', 'success');
  };

  const getSectionIcon = (titleStr) => {
    const clean = titleStr.toLowerCase();

    if (clean.includes('executive') || clean.includes('overview') || clean.includes('نظرة') || clean.includes('تنفيذية')) {
      return { Icon: ClipboardList, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
    }
    if (clean.includes('target') || clean.includes('audience') || clean.includes('جمهور') || clean.includes('استهداف')) {
      return { Icon: Target, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' };
    }
    if (clean.includes('budget') || clean.includes('allocation') || clean.includes('ميزانية') || clean.includes('توزيع')) {
      return { Icon: PieChart, color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
    }
    if (clean.includes('execution') || clean.includes('step') || clean.includes('تنفيذ') || clean.includes('خطوة')) {
      return { Icon: Zap, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' };
    }
    if (clean.includes('creative') || clean.includes('concepts') || clean.includes('مفاهيم') || clean.includes('إعلاني')) {
      return { Icon: Sparkles, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' };
    }
    if (clean.includes('kpi') || clean.includes('metrics') || clean.includes('مؤشرات') || clean.includes('تحليل')) {
      return { Icon: BarChart3, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' };
    }
    if (clean.includes('summary') || clean.includes('action') || clean.includes('ملخص') || clean.includes('فورية')) {
      return { Icon: Rocket, color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
    }

    return { Icon: Compass, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
  };

  const renderFormattedLines = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      let formattedLine = line.trim();
      if (!formattedLine || formattedLine === '---') return null;

      if (formattedLine.startsWith('### ')) {
        return (
          <h5 key={i} style={{ fontSize: '13.5px', fontWeight: 900, color: '#3B82F6', marginTop: '14px', marginBottom: '8px' }}>
            {formattedLine.replace('### ', '')}
          </h5>
        );
      }

      if (formattedLine.startsWith('-') || formattedLine.match(/^\d+\./)) {
        const isNumbered = formattedLine.match(/^\d+\./);
        const listSymbol = isNumbered ? formattedLine.match(/^\d+\./)[0] : '•';
        formattedLine = formattedLine.replace(/^(-|\d+\.)\s*/, '');

        return (
          <div key={i} className="mp-plan-list-item">
            <span style={{ color: '#3B82F6', fontWeight: 900, flexShrink: 0 }}>{listSymbol}</span>
            <span>
              {formattedLine.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j} style={{ color: '#3B82F6', fontWeight: 800 }}>{part.replace(/\*\*/g, '')}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <em key={j} style={{ color: '#60A5FA', fontStyle: 'italic' }}>{part.replace(/\*/g, '')}</em>;
                }
                return part;
              })}
            </span>
          </div>
        );
      }

      return (
        <p key={i} style={{ margin: '0 0 8px 0', fontSize: '13px', lineHeight: '1.7', color: 'var(--text, #F8FAFC)' }}>
          {formattedLine.split(/(\*\*.*?\*\*)/).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} style={{ color: '#3B82F6', fontWeight: 800 }}>{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  const renderMarkdownPlan = (text) => {
    if (!text) return null;

    // Check if it's formatted as standard text without ## headers
    if (!text.includes('## ')) {
      return (
        <div className="mp-plan-block">
          {renderFormattedLines(text)}
        </div>
      );
    }

    // Split by H2 sections ("## ")
    const rawSections = text.split(/^## /m).filter(Boolean);

    return rawSections.map((sec, secIdx) => {
      const lines = sec.split('\n');
      const titleLine = lines[0] || '';
      const contentLines = lines.slice(1);

      // Handle H1 document header (# Master Advertising...)
      if (titleLine.startsWith('# ') || (secIdx === 0 && text.trim().startsWith('# '))) {
        const cleanTitle = titleLine.replace(/^#\s*/, '').replace(/---/g, '').trim();
        return (
          <div key={secIdx} style={{ background: '#3B82F6', color: '#FFFFFF', padding: '14px 20px', borderRadius: '14px', fontWeight: '900', fontSize: '15px', textAlign: 'center', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)', marginBottom: '16px' }}>
            {cleanTitle}
          </div>
        );
      }

      const sectionTitle = titleLine.trim();
      const cleanSectionTitle = sectionTitle.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]\s*/u, '').trim();
      const { Icon: SecIcon, color: iconColor, bg: iconBg } = getSectionIcon(cleanSectionTitle);

      const bodyText = contentLines.join('\n').trim();

      // Check if body has a table (| ... |)
      const hasTable = bodyText.includes('|') && bodyText.includes('---');
      
      let tableHeaders = [];
      let tableRows = [];
      let nonTablePartsBefore = [];
      let nonTablePartsAfter = [];

      if (hasTable) {
        const allLines = bodyText.split('\n');
        let inTable = false;

        allLines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            inTable = true;
            if (trimmed.includes(':---') || trimmed.includes('---:')) {
              // separator line, skip
            } else if (tableHeaders.length === 0) {
              tableHeaders = trimmed.split('|').filter(c => c.trim() !== '').map(c => c.trim());
            } else {
              const rowCells = trimmed.split('|').filter(c => c.trim() !== '').map(c => c.trim());
              tableRows.push(rowCells);
            }
          } else {
            if (!inTable) {
              nonTablePartsBefore.push(line);
            } else {
              nonTablePartsAfter.push(line);
            }
          }
        });
      }

      return (
        <div key={secIdx} className="mp-plan-block">
          <h4 className="mp-plan-block-title">
            <div className="mp-section-icon-badge" style={{ '--icon-color': iconColor, '--icon-bg': iconBg }}>
              <SecIcon size={17} />
            </div>
            <span>{cleanSectionTitle}</span>
          </h4>

          {/* Text before table */}
          {hasTable && nonTablePartsBefore.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {renderFormattedLines(nonTablePartsBefore.join('\n'))}
            </div>
          )}

          {/* Markdown Table */}
          {hasTable && tableHeaders.length > 0 && (
            <div className="mp-table-wrap">
              <table className="mp-table">
                <thead>
                  <tr>
                    {tableHeaders.map((th, thIdx) => (
                      <th key={thIdx}>{th.replace(/\*\*/g, '')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>
                          {cell.split(/(\*\*.*?\*\*)/).map((part, pIdx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={pIdx} style={{ color: '#3B82F6', fontWeight: 800 }}>{part.replace(/\*\*/g, '')}</strong>;
                            }
                            return part;
                          })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Text after table / standard body */}
          {!hasTable ? renderFormattedLines(bodyText) : (nonTablePartsAfter.length > 0 && renderFormattedLines(nonTablePartsAfter.join('\n')))}
        </div>
      );
    });
  };

  const bottomSections = [
    {
      icon: <DollarSign size={18} color="#3B82F6" />,
      title: lang === 'en' ? 'Flexible Budget Rule' : 'قاعدة الميزانية المرنة',
      items: [
        lang === 'en' ? 'Don\'t spend your entire budget in the first week. Divide it into a "testing" phase and a "scaling" phase.' : 'لا تصرف ميزانيتك بالكامل في أول أسبوع. قسمها إلى مرحلة "اختبار" ومرحلة "توسع".',
        lang === 'en' ? 'If the ad does not succeed in the testing phase (with a small budget), change the video/image immediately instead of increasing the budget.' : 'إذا لم ينجح الإعلان في فترة الاختبار (بميزانية صغيرة)، قم بتغيير الفيديو/الصورة فوراً بدلاً من زيادة الميزانية.',
        lang === 'en' ? 'The 20% Rule: Allocate 20% of your budget for retargeting because they are the most likely to buy.' : 'قاعدة الـ 20%: خصص 20% من ميزانيتك لإعادة الاستهداف (Retargeting) لأنهم الأكثر احتمالية للشراء.'
      ]
    },
    {
      icon: <BarChart3 size={18} color="#10B981" />,
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
      <div className="mp-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mp-main-grid">
          
          {/* ═══════════════ INPUTS FORM PANEL ═══════════════ */}
          <div className="mp-panel">
            <div className="mp-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Map size={20} />
              </div>
              <div>
                <h3 className="mp-panel-title">
                  <span>{lang === 'en' ? 'Campaign Parameters' : 'معايير وميزانية الحملة'}</span>
                </h3>
                <p className="mp-panel-subtitle">
                  {lang === 'en' ? 'Set your ad budget, campaign duration, and primary goal.' : 'أدخل الميزانية المتاحة، مدة النشر والهدف لتقسيم الإنفاق.'}
                </p>
              </div>
            </div>

            {/* Budget & Duration Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
              <div className="mp-form-group" style={{ marginBottom: 0 }}>
                <label className="mp-label">
                  <DollarSign size={13} color="#3B82F6" />
                  <span>{lang === 'en' ? 'Available Budget' : 'الميزانية المتاحة'}</span>
                </label>
                <div className="mp-input-wrap">
                  <span className="mp-input-badge prefix">$</span>
                  <input 
                    type="number" 
                    className="mp-input has-prefix"
                    dir="ltr"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="500"
                    style={{ textAlign: isRtl ? 'right' : 'left' }}
                  />
                </div>
              </div>
              
              <div className="mp-form-group" style={{ marginBottom: 0 }}>
                <label className="mp-label">
                  <Calendar size={13} color="#3B82F6" />
                  <span>{lang === 'en' ? 'Duration (Days)' : 'المدة (بالأيام)'}</span>
                </label>
                <div className="mp-input-wrap">
                  <input 
                    type="number" 
                    className="mp-input has-suffix"
                    dir="ltr"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                    style={{ textAlign: isRtl ? 'right' : 'left' }}
                  />
                  <span className="mp-input-badge suffix">
                    {lang === 'en' ? 'Days' : 'يوم'}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Level */}
            <div className="mp-form-group">
              <label className="mp-label">
                <Sprout size={13} color="#3B82F6" />
                <span>{lang === 'en' ? '1. Client Level (Complexity)' : '1. مستوى العميل (مدى التعقيد)'}</span>
              </label>

              <div className="mp-radio-grid">
                {clientLevels.map(lvl => {
                  const LevelIcon = lvl.IconComp;
                  const isActive = clientLevel === lvl.id;
                  return (
                    <div 
                      key={lvl.id} 
                      onClick={() => setClientLevel(lvl.id)}
                      className={`mp-radio-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="mp-radio-circle">
                        {isActive && <div className="mp-radio-inner" />}
                      </div>

                      <LevelIcon size={16} color={isActive ? '#3B82F6' : 'var(--text2, #94A3B8)'} />

                      <span style={{ fontWeight: '800', fontSize: '13px', color: isActive ? 'var(--text, #F8FAFC)' : 'var(--text2, #94A3B8)' }}>
                        {lang === 'en' ? lvl.label_en : lvl.label_ar}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Campaign Goal */}
            <div className="mp-form-group">
              <label className="mp-label">
                <Target size={13} color="#3B82F6" />
                <span>{lang === 'en' ? '2. Main Campaign Goal' : '2. الهدف الرئيسي للحملة'}</span>
              </label>

              <div className="mp-radio-grid">
                {goals.map(g => {
                  const GoalIcon = g.IconComp;
                  const isActive = goal === g.id;
                  return (
                    <div 
                      key={g.id} 
                      onClick={() => setGoal(g.id)}
                      className={`mp-radio-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="mp-radio-circle">
                        {isActive && <div className="mp-radio-inner" />}
                      </div>

                      <GoalIcon size={16} color={isActive ? '#3B82F6' : 'var(--text2, #94A3B8)'} />

                      <span style={{ fontWeight: '800', fontSize: '13px', color: isActive ? 'var(--text, #F8FAFC)' : 'var(--text2, #94A3B8)' }}>
                        {lang === 'en' ? g.label_en : g.label_ar}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dual Mode Selector */}
            <div style={{ marginTop: '16px' }}>
              <AnalysisModeSelector 
                mode={analysisMode} 
                onChange={setAnalysisMode} 
                lang={lang} 
                accentColor="#3B82F6" 
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mp-generate-btn"
            >
              {isGenerating ? (
                <>
                  <span className="td-spinner" /> 
                  <span>{lang === 'en' ? 'Building Ad Plan...' : 'جاري بناء الخطة...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{lang === 'en' ? 'Build Smart Marketing Plan' : 'بناء خطة التسويق الذكية'}</span>
                </>
              )}
            </button>
          </div>

          {/* ═══════════════ AI MARKETING PLAN OUTPUT PANEL ═══════════════ */}
          <div className="mp-panel">
            <div className="mp-panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieChart size={20} />
                </div>
                <div>
                  <h3 className="mp-panel-title">
                    <span>{lang === 'en' ? 'Master Advertising Strategy' : 'الخطة الإعلانية الشاملة'}</span>
                  </h3>
                  <p className="mp-panel-subtitle">
                    {lang === 'en' ? 'Target spending, key metrics, and ad creative concepts.' : 'طريقة توزيع الإنفاق، مؤشرات الأداء، وأفكار الإعلانات.'}
                  </p>
                </div>
              </div>

              {result && !isGenerating && (
                <button onClick={handleCopy} className="sp-copy-btn" title={lang === 'en' ? 'Copy Plan' : 'نسخ الخطة'}>
                  <Copy size={14} />
                  <span>{lang === 'en' ? 'Copy Plan' : 'نسخ الخطة'}</span>
                </button>
              )}
            </div>

            <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
              {!result && !isGenerating ? (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Map size={28} />
                  </div>
                  <p style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text, #F8FAFC)', margin: '0 0 6px 0' }}>
                    {lang === 'en' ? 'Enter your budget to draw the optimal spending plan' : 'أدخل ميزانيتك لنرسم لك خطة الإنفاق المثلى'}
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text2, #94A3B8)', margin: 0 }}>
                    {lang === 'en' ? 'When to spend, where, and what numbers to monitor.' : 'متى تصرف، وأين، وما هي الأرقام التي ستراقبها.'}
                  </p>
                </div>
              ) : isGenerating ? (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div className="td-spinner" style={{ width: '42px', height: '42px', borderWidth: '4px', borderColor: 'rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6', margin: '0 auto 16px' }} />
                  <p style={{ color: '#3B82F6', fontWeight: '800', fontSize: '14px', margin: 0 }}>
                    {lang === 'en' ? 'Drawing a custom advertising financial plan for you...' : 'يتم الآن رسم خطة مالية إعلانية مخصصة لك...'}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    {renderMarkdownPlan(result)}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>
      </div>
    </ToolDashboardLayout>
  );
}

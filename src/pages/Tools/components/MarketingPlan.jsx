import React, { useState, useEffect } from 'react';
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
  Rocket,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  FileText,
  Activity,
  Layers
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

  // Step Navigator State (1: Goals & Experience, 2: Budget & Duration, 3: Strategy Mode)
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingBadgeIndex, setLoadingBadgeIndex] = useState(0);
  const [activeStrategyTab, setActiveStrategyTab] = useState('all'); // 'all' | 'executive' | 'channels' | 'timeline'

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

  const loadingBadges = lang === 'en'
    ? [
        'Analyzing Target Audience & Goals...',
        'Synthesizing Marketing Channels & Budget Allocation...',
        'Building Strategic Timeline & KPI Metrics...'
      ]
    : [
        'جاري تحليل الجمهور المستهدف والأهداف الاستراتيجية...',
        'جاري توزيع الميزانية على القنوات التسويقية...',
        'جاري صياغة الجدول الزمني ومؤشرات الأداء...'
      ];

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingBadgeIndex((prev) => (prev + 1) % loadingBadges.length);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isGenerating, loadingBadges.length]);

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
        toast(lang === 'en' ? 'Live AI Marketing Plan generated!' : 'تم بناء خطة التسويق الذكية بالذكاء الاصطناعي الحي!', 'success');
      } else {
        await new Promise(r => setTimeout(r, 600));

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
          toast(lang === 'en' ? 'Marketing plan ready!' : 'الخطة الإعلانية جاهزة!', 'success');
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
    toast(lang === 'en' ? 'Marketing plan copied to clipboard!' : 'تم نسخ الخطة التسويقية إلى الحافظة!', 'success');
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
          <h5 key={i} style={{ fontSize: '14px', fontWeight: 900, color: '#60A5FA', marginTop: '16px', marginBottom: '8px' }}>
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
                  return <strong key={j} style={{ color: '#60A5FA', fontWeight: 800 }}>{part.replace(/\*\*/g, '')}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <em key={j} style={{ color: '#93C5FD', fontStyle: 'italic' }}>{part.replace(/\*/g, '')}</em>;
                }
                return part;
              })}
            </span>
          </div>
        );
      }

      return (
        <p key={i} style={{ margin: '0 0 10px 0', fontSize: '13.5px', lineHeight: '1.7', color: '#CBD5E1' }}>
          {formattedLine.split(/(\*\*.*?\*\*)/).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} style={{ color: '#60A5FA', fontWeight: 800 }}>{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  const renderMarkdownPlan = (text) => {
    if (!text) return null;

    if (!text.includes('## ')) {
      return (
        <div className="mp-plan-block">
          {renderFormattedLines(text)}
        </div>
      );
    }

    const rawSections = text.split(/^## /m).filter(Boolean);

    return rawSections.map((sec, secIdx) => {
      const lines = sec.split('\n');
      const titleLine = lines[0] || '';
      const contentLines = lines.slice(1);

      if (titleLine.startsWith('# ') || (secIdx === 0 && text.trim().startsWith('# '))) {
        const cleanTitle = titleLine.replace(/^#\s*/, '').replace(/---/g, '').trim();
        return (
          <div key={secIdx} style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF', padding: '16px 24px', borderRadius: '16px', fontWeight: '900', fontSize: '16px', textAlign: 'center', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)', marginBottom: '20px' }}>
            {cleanTitle}
          </div>
        );
      }

      const sectionTitle = titleLine.trim();
      const cleanSectionTitle = sectionTitle.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]\s*/u, '').trim();
      const { Icon: SecIcon, color: iconColor, bg: iconBg } = getSectionIcon(cleanSectionTitle);

      const bodyText = contentLines.join('\n').trim();

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
              // separator line
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
              <SecIcon size={18} />
            </div>
            <span>{cleanSectionTitle}</span>
          </h4>

          {hasTable && nonTablePartsBefore.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              {renderFormattedLines(nonTablePartsBefore.join('\n'))}
            </div>
          )}

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
                              return <strong key={pIdx} style={{ color: '#60A5FA', fontWeight: 800 }}>{part.replace(/\*\*/g, '')}</strong>;
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
      title={lang === 'en' ? 'Campaign planner' : 'مخطط الحملات'}
      subtitle={lang === 'en' ? 'Interactive canvas deck to structure, allocate, and scale your advertising budget with AI precision.' : 'منصة تفاعلية مخصصة لهيكلة وتوزيع ميزانيتك الإعلانية بدقة عالية وضمان أعلى عائد على الاستثمار.'}
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="30 - 45"
      bottomSections={bottomSections}
    >
      <div className="mp-container" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* ═══════════════ 1. GUIDED ARC STEP NAVIGATOR ═══════════════ */}
        <div className="mp-arc-nav-wrap">
          <div className="mp-arc-nav">
            {/* Step 1 Pill */}
            <div 
              onClick={() => !isGenerating && setCurrentStep(1)}
              className={`mp-arc-step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}
            >
              <div className="mp-step-icon-wrapper">
                {currentStep > 1 ? <Check size={15} /> : <Target size={15} />}
              </div>
              <span>{lang === 'en' ? '1. Goals & Level' : '1. الأهداف والمستوى'}</span>
            </div>

            {/* Step 2 Pill */}
            <div 
              onClick={() => !isGenerating && setCurrentStep(2)}
              className={`mp-arc-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
            >
              <div className="mp-step-icon-wrapper">
                {currentStep > 2 ? <Check size={15} /> : <PieChart size={15} />}
              </div>
              <span>{lang === 'en' ? '2. Channels & Budget' : '2. الميزانية والمدة'}</span>
            </div>

            {/* Step 3 Pill */}
            <div 
              onClick={() => !isGenerating && setCurrentStep(3)}
              className={`mp-arc-step ${currentStep === 3 ? 'active' : ''}`}
            >
              <div className="mp-step-icon-wrapper">
                <Zap size={15} />
              </div>
              <span>{lang === 'en' ? '3. Mode & Generate' : '3. تخصيص الخطة'}</span>
            </div>
          </div>
        </div>

        {/* ═══════════════ 2. MAIN INTERACTIVE CANVAS DECK ═══════════════ */}
        <AnimatePresence mode="wait">
          {/* A. AI LOADING STAGE */}
          {isGenerating ? (
            <motion.div
              key="loading-stage"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="mp-futuristic-loading"
            >
              <div className="mp-core-spinner-wrap">
                <div className="mp-core-ring-outer" />
                <div className="mp-core-ring-inner" />
                <Sparkles size={32} className="mp-core-icon" />
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#F8FAFC', margin: '0 0 8px 0' }}>
                  {lang === 'en' ? 'Synthesizing Advertising Master Strategy...' : 'جاري بناء وصياغة الخطة التسويقية الشاملة...'}
                </h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                  {lang === 'en' ? 'Processing campaign parameters, audience hooks, and KPI metrics' : 'معالجة معايير الحملة، استهداف الجمهور، ومؤشرات الأداء'}
                </p>
              </div>

              <div className="mp-loading-badge">
                <Activity size={14} className="td-spinner" style={{ borderTopColor: '#60A5FA' }} />
                <span>{loadingBadges[loadingBadgeIndex]}</span>
              </div>
            </motion.div>

          ) : result ? (
            /* B. FULL-WIDTH STRATEGY STAGE (OUTPUT CANVAS) */
            <motion.div
              key="strategy-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="mp-strategy-stage"
            >
              <div className="mp-deck-header">
                <div>
                  <h4 className="mp-deck-title">
                    <PieChart size={22} style={{ color: '#10B981' }} />
                    <span>{lang === 'en' ? 'Master Advertising Strategy Deck' : 'خطة الإعلانات والتسويق الشاملة'}</span>
                  </h4>
                  <p className="mp-deck-subtitle">
                    {lang === 'en' ? 'Tailored spending distribution, audience targeting, and creative direction.' : 'طريقة توزيع الإنفاق، استهداف الجمهور، وأفكار الإعلانات.'}
                  </p>
                </div>
              </div>

              <div className="mp-output-content">
                {renderMarkdownPlan(result)}
              </div>

              {/* FLOATING TACTICAL ACTION DOCK */}
              <div className="mp-tactical-dock">
                <button type="button" onClick={handleCopy} className="mp-dock-btn">
                  <Copy size={15} />
                  <span>{lang === 'en' ? 'Quick Copy' : 'النسخ السريع'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({
                      type: 'SAVE_TOOL_RESULT',
                      toolId: 'marketing-plan',
                      data: { budget, duration, goal, clientLevel, result, mode: analysisMode }
                    });
                    toast(lang === 'en' ? 'Strategy saved to database!' : 'تم حفظ الخطة في قاعدة البيانات!', 'success');
                  }}
                  className="mp-dock-btn"
                >
                  <CheckCircle2 size={15} style={{ color: '#34D399' }} />
                  <span>{lang === 'en' ? 'Save Strategy' : 'حفظ الخطة'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult('');
                    setCurrentStep(1);
                  }}
                  className="mp-dock-btn primary"
                >
                  <Wrench size={15} />
                  <span>{lang === 'en' ? 'Modify Inputs' : 'تعديل المدخلات'}</span>
                </button>
              </div>
            </motion.div>

          ) : (
            /* C. CONFIGURATION STEP DECK (GUIDED ARC CANVAS) */
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.25 }}
              className="mp-deck-canvas"
            >
              {/* STEP 1: GOALS & LEVEL */}
              {currentStep === 1 && (
                <div>
                  <div className="mp-deck-header">
                    <div>
                      <h4 className="mp-deck-title">
                        <Target size={22} style={{ color: '#3B82F6' }} />
                        <span>{lang === 'en' ? 'Step 1: Campaign Goals & Client Level' : 'الخطوة 1: أهداف الحملة ومستوى الخبرة'}</span>
                      </h4>
                      <p className="mp-deck-subtitle">
                        {lang === 'en' ? 'Define your experience level and primary conversion objective.' : 'حدد مستوى خبرتك التجارية والهدف الأساسي من الحملة الإعلانية.'}
                      </p>
                    </div>
                  </div>

                  {/* Client Level */}
                  <div className="mp-form-group">
                    <label className="mp-label">
                      <Sprout size={14} color="#3B82F6" />
                      <span>{lang === 'en' ? 'Client Experience Level' : 'مستوى العميل (مدى التعقيد)'}</span>
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
                            <LevelIcon size={18} color={isActive ? '#3B82F6' : '#94A3B8'} />
                            <span className="mp-radio-label">
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
                      <Target size={14} color="#3B82F6" />
                      <span>{lang === 'en' ? 'Main Campaign Objective' : 'الهدف الرئيسي للحملة'}</span>
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
                            <GoalIcon size={18} color={isActive ? '#3B82F6' : '#94A3B8'} />
                            <span className="mp-radio-label">
                              {lang === 'en' ? g.label_en : g.label_ar}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deck Controls */}
                  <div className="mp-deck-controls">
                    <div />
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="mp-btn-primary"
                    >
                      <span>{lang === 'en' ? 'Next: Channels & Budget' : 'التالي: الميزانية والمدة'}</span>
                      {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CHANNELS & BUDGET */}
              {currentStep === 2 && (
                <div>
                  <div className="mp-deck-header">
                    <div>
                      <h4 className="mp-deck-title">
                        <PieChart size={22} style={{ color: '#10B981' }} />
                        <span>{lang === 'en' ? 'Step 2: Budget Allocation & Duration' : 'الخطوة 2: الميزانية والمدة الزمنية'}</span>
                      </h4>
                      <p className="mp-deck-subtitle">
                        {lang === 'en' ? 'Set your available ad spend budget and active campaign timeframe.' : 'أدخل الميزانية المتاحة للمشر ومدد الحملة لتقسيم الإنفاق الفعال.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div className="mp-form-group" style={{ marginBottom: 0 }}>
                      <label className="mp-label">
                        <DollarSign size={14} color="#3B82F6" />
                        <span>{lang === 'en' ? 'Available Budget' : 'الميزانية المتاحة'}</span>
                      </label>
                      <div className="mp-input-wrap">
                        <span className="mp-input-badge prefix">$</span>
                        <input 
                          type="number" 
                          className="mp-input has-prefix"
                          dir={isRtl ? 'rtl' : 'ltr'}
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="500"
                          style={{ textAlign: isRtl ? 'right' : 'left' }}
                        />
                      </div>
                    </div>
                    
                    <div className="mp-form-group" style={{ marginBottom: 0 }}>
                      <label className="mp-label">
                        <Calendar size={14} color="#3B82F6" />
                        <span>{lang === 'en' ? 'Duration (Days)' : 'المدة (بالأيام)'}</span>
                      </label>
                      <div className="mp-input-wrap">
                        <input 
                          type="number" 
                          className="mp-input has-suffix"
                          dir={isRtl ? 'rtl' : 'ltr'}
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

                  {/* Deck Controls */}
                  <div className="mp-deck-controls">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="mp-btn-secondary"
                    >
                      {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      <span>{lang === 'en' ? 'Previous' : 'السابق'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="mp-btn-primary"
                    >
                      <span>{lang === 'en' ? 'Next: Strategy Mode' : 'التالي: تخصيص الخطة'}</span>
                      {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: STRATEGY & EXECUTION MODE */}
              {currentStep === 3 && (
                <div>
                  <div className="mp-deck-header">
                    <div>
                      <h4 className="mp-deck-title">
                        <Zap size={22} style={{ color: '#8B5CF6' }} />
                        <span>{lang === 'en' ? 'Step 3: Strategy Mode & AI Execution' : 'الخطوة 3: نمط التوليد وتنفيذ الخطة'}</span>
                      </h4>
                      <p className="mp-deck-subtitle">
                        {lang === 'en' ? 'Choose Fast DB lookup or Live AI synthesis for custom insights.' : 'اختر التوليد السريع من قاعدة البيانات أو التفكير الحي عبر الذكاء الاصطناعي.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label className="mp-label">
                      <SlidersHorizontal size={14} color="#8B5CF6" />
                      <span>{lang === 'en' ? 'Select Analysis Engine' : 'اختر محرك التحليل والذكاء الاصطناعي'}</span>
                    </label>
                    <AnalysisModeSelector 
                      mode={analysisMode} 
                      onChange={setAnalysisMode} 
                      lang={lang} 
                      accentColor="#3B82F6" 
                    />
                  </div>

                  {/* Summary Box */}
                  <div style={{ background: 'rgba(8, 12, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Target size={16} style={{ color: '#3B82F6' }} />
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {lang === 'en' ? 'Budget & Duration:' : 'الميزانية والمدة:'} <strong style={{ color: '#F8FAFC' }}>${budget} / {duration} {lang === 'en' ? 'days' : 'يوم'}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={16} style={{ color: '#10B981' }} />
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                        {lang === 'en' ? 'Engine:' : 'المحرك:'} <strong style={{ color: '#34D399' }}>{analysisMode === 'live' ? 'Live AI' : 'Fast Database'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Deck Controls */}
                  <div className="mp-deck-controls">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="mp-btn-secondary"
                    >
                      {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      <span>{lang === 'en' ? 'Previous' : 'السابق'}</span>
                    </button>

                    <button 
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="mp-btn-primary"
                      style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}
                    >
                      <Sparkles size={16} />
                      <span>{lang === 'en' ? 'Generate Marketing Plan' : 'إنشاء الخطة التسويقية'}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ToolDashboardLayout>
  );
}

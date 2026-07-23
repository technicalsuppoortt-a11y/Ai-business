import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import ToolDashboardLayout from './ToolDashboardLayout';
import { getLandingMatrixSection } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Target,
  Layers,
  ShoppingBag,
  Users,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Zap,
  AlertTriangle,
  Sliders,
  DollarSign,
  HeartPulse,
  FileText,
  Layout,
  Award,
  Cpu,
  Coins,
  ArrowRight,
  HelpCircle,
  Bookmark
} from 'lucide-react';
import './LandingPageContent.css';

// Glassmorphic Animated Custom Dropdown
function CustomDropdown({ value, onChange, options, label, icon: Icon, placeholder, lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => String(o.value) === String(value)) || options[0];

  return (
    <div className="lpc-dropdown-container" ref={dropdownRef}>
      {label && (
        <label className="lpc-label" style={{ marginBottom: '8px' }}>
          {Icon && <Icon size={14} color="#F43F5E" />}
          <span>{label}</span>
        </label>
      )}
      
      <div 
        className={`lpc-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} color="var(--text2, #94A3B8)" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="lpc-dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {options.map(opt => (
              <div
                key={String(opt.value)}
                className={`lpc-dropdown-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && <Check size={14} color="#F43F5E" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPageContent({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  
  // Base Inputs
  const [productName, setProductName] = useState('');
  const [audience, setAudience] = useState(state.niche || '');
  const [validationError, setValidationError] = useState('');
  
  // Matrix Dropdowns
  const [objective, setObjective] = useState('direct_sales');
  const [awareness, setAwareness] = useState('problem_aware');
  const [pricePoint, setPricePoint] = useState('low_ticket');
  const [emotion, setEmotion] = useState('urgency');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Dropdown Options Definitions
  const objectiveOptions = [
    { value: 'direct_sales', label: lang === 'en' ? 'Direct Sales (Sell Product)' : 'بيع مباشر (منتج / دورة)' },
    { value: 'lead_gen', label: lang === 'en' ? 'Lead Generation (Collect Data)' : 'جمع بيانات العملاء (Lead Gen)' },
    { value: 'booking', label: lang === 'en' ? 'Booking / Consultation Call' : 'حجز استشارة / مكالمة مبيعات' }
  ];

  const awarenessOptions = [
    { value: 'unaware', label: lang === 'en' ? 'Unaware (Needs Problem Education)' : 'غير واعي (يحتاج توعية بالمشكلة)' },
    { value: 'problem_aware', label: lang === 'en' ? 'Problem Aware (Knows Pain)' : 'واعي بالمشكلة وألمها' },
    { value: 'solution_aware', label: lang === 'en' ? 'Solution Aware (Comparing Options)' : 'واعي بالحلول (يقارن الخيارات)' },
    { value: 'product_aware', label: lang === 'en' ? 'Product Aware (Already Knows You)' : 'واعي بالمنتج (يعرف علامتك)' }
  ];

  const pricePointOptions = [
    { value: 'low_ticket', label: lang === 'en' ? 'Free / Low Ticket ($0 - $50)' : 'مجاني / سعر منخفض ($0 - $50)' },
    { value: 'mid_ticket', label: lang === 'en' ? 'Mid Ticket ($50 - $300)' : 'سعر متوسط ($50 - $300)' },
    { value: 'high_ticket', label: lang === 'en' ? 'High Ticket / Premium ($300+)' : 'سعر مرتفع / فاخر ($300+)' }
  ];

  const emotionOptions = [
    { value: 'urgency', label: lang === 'en' ? 'Urgency & Scarcity (FOMO)' : 'إلحاح وندرة (Urgency & Scarcity)' },
    { value: 'aspirational', label: lang === 'en' ? 'Aspirational & Social Status' : 'طموح ومكانة اجتماعية' },
    { value: 'logical', label: lang === 'en' ? 'Logical & ROI Data-Driven' : 'منطقي ولغة أرقام وعائد' },
    { value: 'empathetic', label: lang === 'en' ? 'Empathetic & Pain-Relief' : 'تعاطف وتخفيف الألم' }
  ];

  const handleGenerate = async () => {
    if (!productName.trim() || !audience.trim()) {
      setValidationError(
        lang === 'en' 
          ? 'Please enter both the Product/Offer Name and Target Audience before generating.' 
          : 'يرجى كتابة اسم المنتج والجمهور المستهدف قبل بدء التوليد.'
      );
      toast(
        lang === 'en' ? 'Please fill in the required fields.' : 'يرجى ملء الحقول المطلوبة.', 
        'warning'
      );
      return;
    }
    setValidationError('');
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'landing-page-content',
          inputs: { productName, audience, objective, awareness, pricePoint, emotion },
          context: { niche: audience || state.niche, brandName: productName },
          lang
        });

        const ensureArray = (val) => Array.isArray(val) ? val : (val ? [String(val)] : []);

        if (typeof liveResult === 'object' && liveResult !== null) {
          setGeneratedContent({
            hero: ensureArray(liveResult.hero),
            problem: ensureArray(liveResult.problem),
            offer: ensureArray(liveResult.offer),
            proof: ensureArray(liveResult.proof),
            cta: ensureArray(liveResult.cta)
          });
        } else {
          setGeneratedContent({
            hero: [String(liveResult)],
            problem: [],
            offer: [],
            proof: [],
            cta: []
          });
        }

        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'landing-page-content',
          data: { productName, audience, objective, awareness, pricePoint, emotion, result: liveResult, mode: 'live' }
        });
        toast(lang === 'en' ? 'Intelligent landing page content generated via Live AI!' : 'تم توليد محتوى صفحة الهبوط بالذكاء الاصطناعي بنجاح!', 'success');
      } else {
        const heroMatrix = await getLandingMatrixSection('hero_sections');
        const problemMatrix = await getLandingMatrixSection('problem_sections');
        const offerMatrix = await getLandingMatrixSection('offer_sections');
        const proofMatrix = await getLandingMatrixSection('proof_sections');
        const ctaMatrix = await getLandingMatrixSection('cta_sections');

        const heroKey = `${awareness}_${emotion}`;
        const problemKey = `${awareness}`;
        const offerKey = `${pricePoint}_${emotion}`;
        const proofKey = `${pricePoint}_${objective}`;
        const ctaKey = `${objective}_${emotion}`;

        const getIdeas = (matrix, key) => {
          if (!matrix) return [];
          if (matrix[key] && matrix[key].ideas) return matrix[key].ideas;
          const firstKey = Object.keys(matrix)[0];
          return matrix[firstKey]?.ideas || [];
        };

        const replaceVars = (text) => {
          if (!text) return '';
          return text
            .replace(/\{\{productName\}\}/g, productName)
            .replace(/\{\{audience\}\}/g, audience)
            .replace(/\{\{niche\}\}/g, audience)
            .replace(/\{\{percent\}\}/g, Math.floor(Math.random() * (95 - 60) + 60))
            .replace(/\{\{hours\}\}/g, 24)
            .replace(/\{\{number\}\}/g, '1,000')
            .replace(/\{\{multiplier\}\}/g, '5')
            .replace(/\{\{price\}\}/g, '$99');
        };

        const formatIdea = (idea) => {
          if (idea.headline_ar) {
            return lang === 'en' 
              ? `${replaceVars(idea.headline_en)}\n\n${replaceVars(idea.sub_en)}`
              : `${replaceVars(idea.headline_ar)}\n\n${replaceVars(idea.sub_ar)}`;
          }
          return lang === 'en' ? replaceVars(idea.en) : replaceVars(idea.ar);
        };

        const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

        const hIdea = pickRandom(getIdeas(heroMatrix, heroKey));
        const pIdea = pickRandom(getIdeas(problemMatrix, problemKey));
        const oIdea = pickRandom(getIdeas(offerMatrix, offerKey));
        const prIdea = pickRandom(getIdeas(proofMatrix, proofKey));
        const cIdea = pickRandom(getIdeas(ctaMatrix, ctaKey));

        const content = {
          hero: hIdea ? formatIdea(hIdea) : 'Hero Section',
          problem: pIdea ? formatIdea(pIdea) : 'Problem Section',
          offer: oIdea ? formatIdea(oIdea) : 'Offer Section',
          proof: prIdea ? formatIdea(prIdea) : 'Social Proof Section',
          cta: cIdea ? formatIdea(cIdea) : 'CTA Section'
        };

        setGeneratedContent(content);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'landing-page-content',
          data: { productName, audience, objective, awareness, pricePoint, emotion, result: content, mode: 'fast' }
        });
        toast(lang === 'en' ? 'Landing page matrix content generated!' : 'تم توليد مصفوفة محتوى صفحة الهبوط بنجاح!', 'success');
      }
    } catch (err) {
      console.error(err);
      toast(lang === 'en' ? 'Error generating content' : 'حدث خطأ أثناء التوليد', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copySection = (text) => {
    navigator.clipboard.writeText(text);
    toast(lang === 'en' ? 'Section text copied to clipboard!' : 'تم نسخ نص القسم إلى الحافظة!', 'success');
  };

  return (
    <ToolDashboardLayout
      id="landing-page-content"
      title={lang === 'en' ? 'Landing Page Content Matrix' : 'مصفوفة محتوى صفحة الهبوط'}
      subtitle={lang === 'en' ? 'Generate highly targeted, multi-variable landing page copy based on 4 psychological dimensions.' : 'أنشئ محتوى مخصص بالكامل لصفحة الهبوط بناءً على 4 أبعاد نفسية واستراتيجية.'}
      stepNumber={stepNumber}
      accentColor="#F43F5E"
      timeEstimate="10 - 20"
    >
      <div className="lpc-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="lpc-main-grid">
          
          {/* ═══════════════ INPUTS FORM PANEL ═══════════════ */}
          <div className="lpc-panel">
            <div className="lpc-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="lpc-panel-title">
                  <span>{lang === 'en' ? '4-Dimensional Matrix Inputs' : 'مدخلات المصفوفة رباعية الأبعاد'}</span>
                </h3>
                <p className="lpc-panel-subtitle">
                  {lang === 'en' ? 'Configure offer specs & psychological drivers.' : 'حدد مواصفات العرض والأبعاد النفسية لجمهورك.'}
                </p>
              </div>
            </div>

            {/* Validation Alert Box */}
            <AnimatePresence>
              {validationError && (
                <motion.div 
                  className="lpc-validation-alert"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertTriangle size={18} flexShrink={0} />
                  <span>{validationError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Base Text Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="lpc-form-group">
                <label className="lpc-label">
                  <ShoppingBag size={14} color="#F43F5E" />
                  <span>{lang === 'en' ? 'Product / Offer Name' : 'اسم المنتج أو العرض'}</span>
                  <span className="lpc-label-accent">*</span>
                </label>
                <input 
                  type="text" 
                  className={`lpc-input ${validationError && !productName ? 'error' : ''}`}
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    if (e.target.value.trim() && audience.trim()) setValidationError('');
                  }}
                  placeholder={lang === 'en' ? 'e.g., The Profit System' : 'مثال: نظام الأرباح الإلكترونية'}
                />
              </div>

              <div className="lpc-form-group">
                <label className="lpc-label">
                  <Users size={14} color="#F43F5E" />
                  <span>{lang === 'en' ? 'Target Audience' : 'الجمهور المستهدف'}</span>
                  <span className="lpc-label-accent">*</span>
                </label>
                <input 
                  type="text" 
                  className={`lpc-input ${validationError && !audience ? 'error' : ''}`}
                  value={audience}
                  onChange={(e) => {
                    setAudience(e.target.value);
                    if (productName.trim() && e.target.value.trim()) setValidationError('');
                  }}
                  placeholder={lang === 'en' ? 'e.g., Freelancers & Agencies' : 'مثال: أصحاب الوكالات والمستقلين'}
                />
              </div>
            </div>

            {/* 4 Psychological Dimension Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <CustomDropdown 
                label={lang === 'en' ? '1. Page Objective' : '1. الهدف من الصفحة'}
                icon={Target}
                value={objective}
                onChange={setObjective}
                options={objectiveOptions}
                lang={lang}
              />

              <CustomDropdown 
                label={lang === 'en' ? '2. Audience Awareness' : '2. مستوى وعي الجمهور'}
                icon={Sparkles}
                value={awareness}
                onChange={setAwareness}
                options={awarenessOptions}
                lang={lang}
              />

              <CustomDropdown 
                label={lang === 'en' ? '3. Price/Complexity' : '3. الفئة السعرية / التعقيد'}
                icon={DollarSign}
                value={pricePoint}
                onChange={setPricePoint}
                options={pricePointOptions}
                lang={lang}
              />

              <CustomDropdown 
                label={lang === 'en' ? '4. Emotional Driver' : '4. الدافع العاطفي (Tone)'}
                icon={HeartPulse}
                value={emotion}
                onChange={setEmotion}
                options={emotionOptions}
                lang={lang}
              />
            </div>

            {/* Dual Mode Selector */}
            <div style={{ marginBottom: '20px' }}>
              <AnalysisModeSelector 
                mode={analysisMode} 
                onChange={setAnalysisMode} 
                lang={lang} 
                accentColor="#F43F5E" 
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="td-btn-primary"
              style={{ background: isGenerating ? 'rgba(244, 63, 94, 0.3)' : '#F43F5E', width: '100%' }}
            >
              {isGenerating ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="td-spinner" /> {lang === 'en' ? 'Assembling Matrix...' : 'جاري تجميع محتوى الصفحة...'}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Sparkles size={18} /> {lang === 'en' ? 'Generate Intelligent Content' : 'توليد محتوى ذكي وموجه'}
                </span>
              )}
            </button>
          </div>

          {/* ═══════════════ OUTPUT DISPLAY PANEL ═══════════════ */}
          <div className="lpc-panel">
            <div className="lpc-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layout size={20} />
              </div>
              <div>
                <h3 className="lpc-panel-title">
                  <span>{lang === 'en' ? 'Generated Landing Page Copy' : 'محتوى صفحة الهبوط المولد'}</span>
                </h3>
                <p className="lpc-panel-subtitle">
                  {lang === 'en' ? 'Multi-section targeted copy ready to paste into your website builder.' : 'هيكل محتوى متكامل جاهز للنسخ في موقعك.'}
                </p>
              </div>
            </div>

            {!generatedContent && !isGenerating ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <FileText size={32} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text, #F8FAFC)', marginBottom: '6px' }}>
                  {lang === 'en' ? 'Set 4 dimensions & click generate' : 'حدد الأبعاد الأربعة ثم اضغط توليد المحتوى'}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text2, #8B96A8)', maxWidth: '360px', margin: '0 auto', lineHeight: '1.6' }}>
                  {lang === 'en' ? 'Our matrix adapts Hero, Problem, Offer, Social Proof, and CTA to match your scenario.' : 'يقوم نظامنا بتطوير الهيكل الكامل من البطل والمشكلة والعرض حتى زر الإجراء ليناسب مشروعك.'}
                </p>
              </div>
            ) : isGenerating ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <div className="td-spinner" style={{ width: '42px', height: '42px', borderWidth: '4px', borderColor: 'rgba(244, 63, 94, 0.2)', borderTopColor: '#F43F5E', margin: '0 auto 20px auto' }}></div>
                <h4 style={{ color: '#F43F5E', fontWeight: '900', fontSize: '15px', marginBottom: '6px' }}>
                  {lang === 'en' ? 'Assembling psychological matrix...' : 'جاري تجميع الأنماط النفسية المطابقة...'}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text2, #8B96A8)' }}>
                  {lang === 'en' ? 'Structuring Hero, Offer, Proof, and CTA copy.' : 'يتم تجهيز كافة الأقسام التخصصية لصفحة الهبوط.'}
                </p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
              >
                <ContentSection 
                  icon={Sparkles}
                  title={lang === 'en' ? '1. Hero Section (Headline & Subtitle)' : '1. قسم البطل (العنوان الرئيسي والفرعي)'} 
                  ideas={generatedContent.hero} 
                  onCopy={copySection} 
                  lang={lang} 
                />
                <ContentSection 
                  icon={AlertTriangle}
                  title={lang === 'en' ? '2. The Problem / Agitation' : '2. توضيح المشكلة والألم'} 
                  ideas={generatedContent.problem} 
                  onCopy={copySection} 
                  lang={lang} 
                />
                <ContentSection 
                  icon={Award}
                  title={lang === 'en' ? '3. The Offer & Benefits' : '3. العرض والفوائد الأساسية'} 
                  ideas={generatedContent.offer} 
                  onCopy={copySection} 
                  lang={lang} 
                />
                <ContentSection 
                  icon={Users}
                  title={lang === 'en' ? '4. Social Proof & Credibility' : '4. الإثبات الاجتماعي والمصداقية'} 
                  ideas={generatedContent.proof} 
                  onCopy={copySection} 
                  lang={lang} 
                />
                <ContentSection 
                  icon={Zap}
                  title={lang === 'en' ? '5. Call to Action (CTA)' : '5. النداء لاتخاذ إجراء (CTA)'} 
                  ideas={generatedContent.cta} 
                  onCopy={copySection} 
                  lang={lang} 
                />
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </ToolDashboardLayout>
  );
}

function ContentSection({ icon: Icon, title, ideas, onCopy, lang }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!ideas) return null;
  const ideasList = Array.isArray(ideas) ? ideas : [ideas];
  if (ideasList.length === 0 || (ideasList.length === 1 && !ideasList[0])) return null;

  return (
    <div className="lpc-output-card">
      <div className="lpc-output-header">
        <h4 className="lpc-output-title">
          {Icon && <Icon size={16} />}
          <span>{title}</span>
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {ideasList.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTab(i)}
                className={`lpc-tab-pill ${activeTab === i ? 'active' : ''}`}
              >
                {lang === 'en' ? `Idea ${i+1}` : `فكرة ${i+1}`}
              </button>
            ))}
          </div>
          <button 
            onClick={() => onCopy(ideasList[activeTab])}
            className="lpc-copy-btn-header"
            title={lang === 'en' ? 'Copy Text' : 'نسخ النص'}
          >
            <Copy size={13} />
            <span>{lang === 'en' ? 'Copy' : 'نسخ'}</span>
          </button>
        </div>
      </div>
      <div className="lpc-output-body">
        <pre>
          {ideasList[activeTab]}
        </pre>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { getWebsiteTemplate, getAllWebsiteGalleryTemplates, getDomainIdeasTemplate } from '../../../services/contentDbService';
import { parseTemplate } from '../../../utils/templateParser';
import { callGemini } from '../../../services/geminiService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import { useNavigate } from 'react-router-dom';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Wand2,
  Palette,
  Globe,
  CreditCard,
  Coins,
  Code,
  Copy,
  Eye,
  Sparkles,
  CheckCircle2,
  Key,
  Settings,
  Server,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Layers,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  FolderOpen,
  DollarSign,
  Cpu,
  Monitor,
  CheckSquare
} from 'lucide-react';
import './WebsiteConstruction.css';

export default function WebsiteConstruction({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toast = useToast();

  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  // -- Wizard State --
  const navigate = useNavigate();
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  const [currentStep, setCurrentStep] = useState(1); // 1: Design, 2: Settings, 3: Infrastructure

  // -- API Key Handling --
  const [apiKeyError, setApiKeyError] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  // -- Step 1: Design State --
  const [method, setMethod] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [galleryTemplates, setGalleryTemplates] = useState([]);
  const [selectedGalleryTemplate, setSelectedGalleryTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // -- Step 2: Settings State --
  const [activeTab, setActiveTab] = useState('domain');
  const tabs = [
    { 
      id: 'domain', 
      label_ar: 'ربط الدومين', 
      label_en: 'Domain Connection', 
      desc_ar: 'ربط نطاق خاص بمتجرك', 
      desc_en: 'Connect custom store domain',
      IconComp: Globe 
    },
    { 
      id: 'payment', 
      label_ar: 'بوابات الدفع', 
      label_en: 'Payment Gateways', 
      desc_ar: 'تفعيل Stripe و PayPal', 
      desc_en: 'Enable Stripe & PayPal',
      IconComp: CreditCard 
    },
    { 
      id: 'taxes', 
      label_ar: 'العملة والضرائب', 
      label_en: 'Currency & Taxes', 
      desc_ar: 'ضبط إعدادات المبيعات', 
      desc_en: 'Configure store sales setup',
      IconComp: Coins 
    }
  ];

  // -- Step 3: Infrastructure State --
  const [isGeneratingDomain, setIsGeneratingDomain] = useState(false);
  const [domainMatrix, setDomainMatrix] = useState(null);

  useEffect(() => {
    const loadGallery = async () => {
      const templates = await getAllWebsiteGalleryTemplates();
      setGalleryTemplates(templates);
    };
    loadGallery();
  }, []);

  // ====== STEP 1 METHODS ======
  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) return;
    setIsSavingKey(true);
    try {
      if (tempApiKey.length < 20) throw new Error('Invalid API Key');
      dispatch({ type: 'UPDATE_USER_DATA', payload: { apiKey: tempApiKey.trim() } });
      setApiKeyError(false);
      toast(lang === 'en' ? 'API Key saved successfully! ✅' : 'تم حفظ مفتاح الـ API بنجاح! ✅', 'success');
    } catch (err) {
      toast(lang === 'en' ? 'Invalid API key format.' : 'صيغة مفتاح الـ API غير صحيحة.', 'error');
    } finally {
      setIsSavingKey(false);
    }
  };

  const generateAILandingPage = async () => {
    setIsGenerating(true);
    setGeneratedCode('');
    try {
      if (analysisMode === 'live') {
        const brandName = state.brandName || (lang === 'en' ? 'My Brand' : 'براندي');
        const colorHex = state.primaryColor || '#10B981';
        const secondaryColor = state.secondaryColor || '#0f172a';
        const nicheName = state.subNiche || state.niche || (lang === 'en' ? 'Business' : 'أعمال');

        const liveHtml = await dispatchLiveAiAnalysis({
          toolId: 'website-construction',
          inputs: { brandName, colorHex, secondaryColor, nicheName },
          context: { niche: state.niche, brandName: state.brandName },
          lang
        });

        if (!liveHtml || !liveHtml.trim()) {
          toast(lang === 'en' ? 'No website code returned. Please try again.' : 'لم يتم توليد أي كود. يرجى إعادة المحاولة.', 'warning');
          return;
        }

        const cleanedHtml = liveHtml.replace(/```html|```/g, '').trim();
        setGeneratedCode(`\`\`\`html\n${cleanedHtml}\n\`\`\``);
        setApiKeyError(false);
        toast(lang === 'en' ? 'Website code generated dynamically! ✅' : 'تم توليد كود الموقع بالذكاء الاصطناعي بنجاح! ✅', 'success');
      } else {
        const key = state.apiKey || tempApiKey;
        if (!key) {
          setApiKeyError(true);
          toast(
            lang === 'en' 
              ? 'Gemini API Key is missing! Please enter your API key below or switch to Live mode.' 
              : 'مفتاح الـ API لـ Gemini غير متوفر! يرجى أدناه إدخال المفتاح أو التبديل للوضع المباشر.', 
            'warning'
          );
          return;
        }

        const brandName = state.brandName || (lang === 'en' ? 'My Brand' : 'براندي');
        const colorHex = state.primaryColor || '#10B981';
        const secondaryColor = state.secondaryColor || '#0f172a';
        const nicheName = state.subNiche || state.niche || (lang === 'en' ? 'Business' : 'أعمال');
        const logoUrl = state.logoUrl || state.logo || state.photoURL || '';

        const prompt = `
          You are a world-class landing page designer and developer. 
          Generate a single-file HTML landing page using Tailwind CSS for a brand called "${brandName}" in the "${nicheName}" niche.
          Primary Color: ${colorHex}, Secondary Color: ${secondaryColor}.
          Brand Logo URL: ${logoUrl ? logoUrl : 'None provided, use text logo'}. Please use this logo image URL in the navigation bar.
          The design should be modern, mobile-responsive, and high-converting.
          Include:
          - A Hero section with a strong headline and CTA.
          - A Features/Services section with 3 items.
          - A Testimonials section.
          - A Contact/Footer section.
          Use placeholder images from Unsplash or similar.
          Return ONLY the raw HTML code without markdown code blocks.
        `;

        const aiResponse = await callGemini(prompt, key);
        
        if (!aiResponse || !aiResponse.trim()) {
          toast(
            lang === 'en' 
              ? 'No website code returned from API. Please verify your API key or prompt.' 
              : 'لم يتم إرجاع كود من المفتاح. يرجى التحقق من مفتاح الـ API.', 
            'warning'
          );
          return;
        }

        const cleanedHtml = aiResponse.replace(/```html|```/g, '').trim();
        setGeneratedCode(`\`\`\`html\n${cleanedHtml}\n\`\`\``);
        setApiKeyError(false);
        toast(lang === 'en' ? 'Website code generated dynamically! ✅' : 'تم توليد كود الموقع بالذكاء الاصطناعي بنجاح! ✅', 'success');
      }
    } catch (error) {
      console.error('Gemini Website Generation Error:', error);
      const errorStr = (error.message || '').toLowerCase();
      
      if (errorStr.includes('quota') || errorStr.includes('rate limit') || errorStr.includes('429') || errorStr.includes('limit: 0')) {
        setApiKeyError(true);
        toast(
          lang === 'en' 
            ? 'Quota exceeded for this Gemini API Key! Please wait a minute or try another API key, or switch to Live mode.' 
            : 'تم تجاوز حد استخدام مفتاح Gemini (Quota Exceeded)! يرجى التمهل دقيقة أو استخدام مفتاح جديد أو التبديل للوضع المباشر.', 
          'warning'
        );
      } else if (errorStr.includes('api key') || errorStr.includes('key') || errorStr.includes('invalid')) {
        setApiKeyError(true);
        toast(
          lang === 'en' 
            ? 'Invalid or missing Gemini API Key. Please enter a valid API key below.' 
            : 'مفتاح الـ API لـ Gemini غير صحيح أو مفقود. يرجى أدناه كتابة مفتاح صالح.', 
          'error'
        );
      } else {
        toast(
          lang === 'en' 
            ? `Error generating code: ${error.message || 'Unexpected failure'}` 
            : `حدث خطأ أثناء توليد الكود: ${error.message || 'خطأ غير متوقع'}`, 
          'error'
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectGalleryTemplate = (template) => {
    setSelectedGalleryTemplate(template);
    const brandName = state.brandName || (lang === 'en' ? 'My Brand' : 'براندي');
    const colorHex = state.primaryColor || '#10B981';
    const secondaryColor = state.secondaryColor || '#0f172a';
    const nicheName = state.subNiche || state.niche || (lang === 'en' ? 'Business' : 'أعمال');
    const logoUrl = state.logoUrl || state.logo || state.photoURL || '';
    const brandLogoHtml = logoUrl 
      ? `<img src="${logoUrl}" alt="${brandName}" style="max-height: 40px; width: auto; object-fit: contain;">`
      : `<div class="font-black text-2xl" style="color: ${colorHex};">${brandName}</div>`;

    const templateRawStr = lang === 'en' ? template.code_en : template.code_ar;
    const rawHtml = parseTemplate(templateRawStr, { brandName, colorHex, secondaryColor, nicheName, logoUrl, brandLogoHtml });
    setGeneratedCode(`\`\`\`html\n${rawHtml}\n\`\`\``);
    toast(lang === 'en' ? `Loaded "${template.name_en || template.name_ar}" template!` : `تم تحميل قالب "${template.name_ar || template.name_en}"!`, 'info');
  };

  const copyToClipboard = () => {
    const codeToCopy = generatedCode.replace(/^\`\`\`html\n/, '').replace(/\n\`\`\`$/, '');
    navigator.clipboard.writeText(codeToCopy);
    toast(lang === 'en' ? 'Code copied successfully to clipboard!' : 'تم نسخ الكود بنجاح إلى الحافظة!', 'success');
  };

  const handlePreview = () => {
    const codeToPreview = generatedCode.replace(/^\`\`\`html\n/, '').replace(/\n\`\`\`$/, '');
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(codeToPreview);
    previewWindow.document.close();
  };

  // ====== STEP 3 METHODS ======
  const generateDomainIdeas = async () => {
    if (!state?.brandName) {
      toast(lang === 'en' ? 'Please choose a brand name first in Step 1 of identity.' : 'الرجاء اختيار اسم البراند أولاً.', 'warning');
      return;
    }
    setIsGeneratingDomain(true);
    setDomainMatrix(null);
    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'domain-matrix',
          inputs: { brandName: state.brandName },
          context: { niche: state.niche, brandName: state.brandName },
          lang
        });
        if (typeof liveResult === 'object' && liveResult.classic) {
          setDomainMatrix(liveResult);
        } else {
          setDomainMatrix({ error: typeof liveResult === 'string' ? liveResult : JSON.stringify(liveResult) });
        }
      } else {
        await new Promise(r => setTimeout(r, 600));
        const dbResult = await getDomainIdeasTemplate(state.niche || 'general');
        if (dbResult && dbResult.matrix) {
          setDomainMatrix(dbResult.matrix);
        } else {
          setDomainMatrix({ error: lang === 'en' ? 'Domain matrix not found.' : 'لم يتم العثور على مصفوفة الدومينات.' });
        }
      }
      toast(lang === 'en' ? 'Domain ideas generated!' : 'تم التوصل لأقوى اقتراحات الدومينات!', 'success');
    } catch (error) {
      console.error(error);
      toast(lang === 'en' ? 'Error suggesting domains.' : 'حدث خطأ. يرجى إعادة المحاولة.', 'error');
    } finally {
      setIsGeneratingDomain(false);
    }
  };

  const cleanBrand = (name) => {
    if (!name) return '';
    let cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleaned) return 'yourbrand';
    return cleaned;
  };

  const renderDomainCard = (domainText, description, color) => {
    const extMatch = domainText.match(/\.[a-z0-9]+$/i);
    const ext = extMatch ? extMatch[0] : '';
    const rgbVal = color === '#10B981' ? '16, 185, 129' : color === '#3B82F6' ? '59, 130, 246' : '139, 92, 246';

    return (
      <motion.div 
        key={domainText} 
        className="wc-domain-card"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ 
          '--card-accent': color,
          '--accent-rgb': rgbVal,
          borderInlineStart: `4px solid ${color}`
        }}
        onClick={() => {
          navigator.clipboard.writeText(domainText);
          toast(lang === 'en' ? `Domain "${domainText}" copied to clipboard! ✅` : `تم نسخ الدومين "${domainText}" إلى الحافظة! ✅`, 'success');
        }}
        title={lang === 'en' ? 'Click to copy domain' : 'اضغط لنسخ الدومين'}
      >
        <div className="wc-domain-card-top">
          <div className="wc-domain-name-block">
            <span className="wc-domain-name">{domainText}</span>
            {ext && (
              <span className="wc-domain-ext-badge" style={{ color: color, borderColor: `${color}40`, backgroundColor: `${color}15` }}>
                {ext}
              </span>
            )}
          </div>
          <button 
            className="wc-domain-copy-btn"
            style={{ color: color, borderColor: `${color}35`, backgroundColor: `${color}12` }}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(domainText);
              toast(lang === 'en' ? `Domain "${domainText}" copied to clipboard! ✅` : `تم نسخ الدومين "${domainText}" إلى الحافظة! ✅`, 'success');
            }}
          >
            <Copy size={13} />
            <span>{lang === 'en' ? 'Copy' : 'نسخ'}</span>
          </button>
        </div>

        {description && (
          <div className="wc-domain-desc">
            <CheckCircle2 size={13} color={color} style={{ flexShrink: 0 }} />
            <span>{description}</span>
          </div>
        )}
      </motion.div>
    );
  };

  const renderMatrixSection = () => {
    if (!domainMatrix || domainMatrix.error) {
      return domainMatrix?.error ? <div className="wc-code-box" style={{ color: '#EF4444' }}>{domainMatrix.error}</div> : null;
    }
    const bn = cleanBrand(state.brandName);
    
    let classicList = [];
    if (domainMatrix.classic) {
      if (Array.isArray(domainMatrix.classic.domains)) {
        classicList = domainMatrix.classic.domains;
      } else if (Array.isArray(domainMatrix.classic.formats) && Array.isArray(domainMatrix.classic.extensions)) {
        domainMatrix.classic.formats.forEach(fmt => {
          domainMatrix.classic.extensions.forEach(ext => {
            let dom = fmt.replace('{{brandName}}', bn).replace('{ext}', ext);
            classicList.push({ domain: dom, desc: lang === 'en' ? 'Standard Professional' : 'دومين احترافي ومعتمد' });
          });
        });
      }
    }

    let actionList = [];
    if (domainMatrix.action) {
      if (Array.isArray(domainMatrix.action.domains)) {
        actionList = domainMatrix.action.domains;
      } else if (Array.isArray(domainMatrix.action.prefixesEn) && Array.isArray(domainMatrix.action.extensions) && Array.isArray(domainMatrix.action.formats)) {
        const { prefixesEn, prefixesAr = [], extensions, formats } = domainMatrix.action;
        prefixesEn.forEach((pref, i) => {
          let ext = extensions[Math.floor(Math.random() * extensions.length)];
          let dom = formats[0].replace('{prefix}', pref).replace('{{brandName}}', bn).replace('{ext}', ext);
          let meaning = lang === 'en' ? `Action: ${pref}` : `بمعنى: ${prefixesAr[i] || pref}`;
          actionList.push({ domain: dom, desc: meaning });
        });
      }
    }

    let nicheList = [];
    if (domainMatrix.niche) {
      if (Array.isArray(domainMatrix.niche.domains)) {
        nicheList = domainMatrix.niche.domains;
      } else if (Array.isArray(domainMatrix.niche.extensions) && Array.isArray(domainMatrix.niche.formats)) {
        domainMatrix.niche.extensions.forEach(ext => {
          let dom = domainMatrix.niche.formats[0].replace('{{brandName}}', bn).replace('{ext}', ext);
          nicheList.push({ domain: dom, desc: lang === 'en' ? domainMatrix.niche.desc_en : domainMatrix.niche.desc_ar });
        });
      }
    }

    return (
      <div className="wc-domain-section">
        {classicList.length > 0 && (
          <div className="wc-domain-group">
            <div className="wc-domain-group-title" style={{ color: '#10B981' }}>
              <Sparkles size={18} />
              <span>{lang === 'en' ? domainMatrix.classic.title_en : domainMatrix.classic.title_ar}</span>
            </div>
            <div className="wc-domain-grid">
              {classicList.slice(0, 6).map(item => renderDomainCard(item.domain, item.desc, '#10B981'))}
            </div>
          </div>
        )}

        {actionList.length > 0 && (
          <div className="wc-domain-group">
            <div className="wc-domain-group-title" style={{ color: '#3B82F6' }}>
              <Zap size={18} />
              <span>{lang === 'en' ? domainMatrix.action.title_en : domainMatrix.action.title_ar}</span>
            </div>
            <div className="wc-domain-grid">
              {actionList.map(item => renderDomainCard(item.domain, item.desc, '#3B82F6'))}
            </div>
          </div>
        )}

        {nicheList.length > 0 && (
          <div className="wc-domain-group">
            <div className="wc-domain-group-title" style={{ color: '#8B5CF6' }}>
              <Layers size={18} />
              <span>{lang === 'en' ? domainMatrix.niche.title_en : domainMatrix.niche.title_ar}</span>
            </div>
            <div className="wc-domain-grid">
              {nicheList.map(item => renderDomainCard(item.domain, item.desc, '#8B5CF6'))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ====== RENDER STEP 1 ======
  const renderStep1 = () => (
    <motion.div 
      key="step1"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25 }}
    >
      <div className="wc-section-header">
        <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: '#3B82F6' }} />
        <div>
          <h3 className="wc-section-title">
            <Wand2 size={20} color="#3B82F6" />
            <span>{lang === 'en' ? 'Step 1: Select Website Building Strategy' : 'الخطوة 1: اختر طريقة البناء والبرمجة'}</span>
          </h3>
          <p className="wc-section-desc">
            {lang === 'en' 
              ? 'Choose whether to dynamically generate code with AI or select from pre-built premium Tailwind landing page templates.' 
              : 'اختر بين البناء الديناميكي التلقائي لكود الموقع بالذكاء الاصطناعي، أو تصفح القوالب الجاهزة المبرمجة لـ Tailwind CSS.'}
          </p>
        </div>
      </div>

      <div className="wc-method-grid">
        <motion.div 
          className={`wc-method-card ${method === 'gemini' ? 'active' : ''}`}
          onClick={() => { setMethod('gemini'); setGeneratedCode(''); setSelectedGalleryTemplate(null); }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          style={{ '--accent-color': '#10B981', '--accent-rgb': '16, 185, 129' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="wc-method-icon-wrap">
              <Cpu size={26} />
            </div>
            <div>
              <div className="wc-method-badge">
                {lang === 'en' ? 'AI Dynamic Generator' : 'البناء بالذكاء الاصطناعي'}
              </div>
              <h4 style={{ color: 'var(--text, #F8FAFC)', fontSize: '16px', fontWeight: '900', margin: 0 }}>
                {lang === 'en' ? 'Custom AI Website Code' : 'توليد كود مخصص بالكامل'}
              </h4>
            </div>
          </div>
          <p style={{ color: 'var(--text2, #8B96A8)', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
            {lang === 'en' 
              ? 'Generate a single-file Tailwind CSS landing page tailored to your niche, logo, and primary colors using Gemini or Live AI.' 
              : 'استخدم الذكاء الاصطناعي لكتابة كود صفحة هبوط متكاملة بـ Tailwind CSS بناءً على هويتك، ألوانك ومجالك.'}
          </p>
        </motion.div>

        <motion.div 
          className={`wc-method-card ${method === 'template' ? 'active' : ''}`}
          onClick={() => { setMethod('template'); setGeneratedCode(''); setSelectedGalleryTemplate(null); }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          style={{ '--accent-color': '#C084FC', '--accent-rgb': '192, 132, 252' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="wc-method-icon-wrap">
              <Layout size={26} />
            </div>
            <div>
              <div className="wc-method-badge" style={{ color: '#C084FC' }}>
                {lang === 'en' ? 'Pre-built Templates' : 'معرض القوالب الاحترافية'}
              </div>
              <h4 style={{ color: 'var(--text, #F8FAFC)', fontSize: '16px', fontWeight: '900', margin: 0 }}>
                {lang === 'en' ? 'Premium Template Library' : 'اختر من القوالب الجاهزة'}
              </h4>
            </div>
          </div>
          <p style={{ color: 'var(--text2, #8B96A8)', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
            {lang === 'en' 
              ? 'Browse high-converting, fully responsive landing page models for E-commerce, SaaS, Agencies, and Digital Products.' 
              : 'تصفح مكتبتنا الغنية القاطعة الجاهزة المبرمجة بـ Tailwind لجميع قطاعات الأعمال والتجارة.'}
          </p>
        </motion.div>
      </div>

      {method === 'gemini' && (
        <div className="wc-code-panel">
          <div className="wc-code-header">
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#10B981', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <Code size={20} />
              <span>{lang === 'en' ? 'Custom Website Code (Tailwind CSS)' : 'الكود البرمجي لموقعك (Tailwind CSS)'}</span>
            </h3>
            {generatedCode && !isGenerating && !apiKeyError && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handlePreview} className="wc-btn wc-btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  <Eye size={14} /> {lang === 'en' ? 'Preview Live' : 'معاينة مباشرة'}
                </button>
                <button onClick={copyToClipboard} className="wc-btn wc-btn-primary" style={{ background: '#10B981', padding: '8px 16px', fontSize: '12px' }}>
                  <Copy size={14} /> {lang === 'en' ? 'Copy Code' : 'نسخ الكود'}
                </button>
              </div>
            )}
          </div>

          {apiKeyError ? (
            <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <AlertTriangle size={36} color="#EF4444" style={{ marginBottom: '12px' }} />
              <h4 style={{ color: '#EF4444', fontSize: '15px', fontWeight: '900', marginBottom: '8px' }}>
                {lang === 'en' ? 'Gemini API Key Required' : 'مفتاح API الخاص بـ Gemini مطلوب'}
              </h4>
              <p style={{ color: 'var(--text2, #8B96A8)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6', maxWidth: '500px', marginInline: 'auto' }}>
                {lang === 'en' 
                  ? 'To use dynamic AI building in Fast mode, please provide a valid Google Gemini API Key below or switch to Live AI Analysis mode.' 
                  : 'لاستخدام البناء السريع بالذكاء الاصطناعي، يرجى إدخال مفتاح API لـ Google Gemini أدناه أو التبديل لنمط الذكاء الاصطناعي المباشر.'}
              </p>
              
              <div style={{ maxWidth: '420px', margin: '0 auto 16px auto', display: 'flex', gap: '10px' }}>
                <input 
                  type="password"
                  className="td-input"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                  style={{ flex: 1, margin: 0, padding: '10px 16px', fontSize: '13px' }}
                />
                <button 
                  onClick={handleSaveApiKey}
                  disabled={isSavingKey || !tempApiKey.trim()}
                  className="wc-btn wc-btn-primary"
                  style={{ background: '#10B981', padding: '0 20px', fontSize: '13px' }}
                >
                  {isSavingKey ? '...' : (lang === 'en' ? 'Save' : 'حفظ')}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button 
                  onClick={() => navigate('/dashboard/settings')}
                  style={{ background: 'transparent', color: '#3B82F6', border: 'none', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Settings size={14} /> {lang === 'en' ? 'Go to Settings' : 'الذهاب للإعدادات'}
                </button>
                <button 
                  onClick={() => setApiKeyError(false)}
                  style={{ background: 'transparent', color: 'var(--text2, #8B96A8)', border: 'none', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
              </div>
            </div>
          ) : !generatedCode || isGenerating ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ maxWidth: '560px', width: '100%', margin: '0 auto 20px auto' }}>
                <AnalysisModeSelector 
                  mode={analysisMode} 
                  onChange={setAnalysisMode} 
                  lang={lang} 
                  accentColor="#10B981" 
                />
              </div>

              <button 
                onClick={generateAILandingPage} 
                disabled={isGenerating} 
                className="wc-btn wc-btn-primary" 
                style={{ background: isGenerating ? 'rgba(16, 185, 129, 0.3)' : '#10B981', maxWidth: '320px', margin: '0 auto', width: '100%' }}
              >
                {isGenerating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span className="td-spinner" /> {lang === 'en' ? 'Coding Landing Page...' : 'جاري كتابة كود الموقع...'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Sparkles size={18} /> {lang === 'en' ? 'Generate Landing Page Code' : 'توليد كود صفحة الهبوط'}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="wc-code-box">
              <pre>{generatedCode}</pre>
            </div>
          )}
        </div>
      )}

      {method === 'template' && (
        <div className="wc-code-panel" style={{ borderColor: 'rgba(192, 132, 252, 0.2)' }}>
          {!selectedGalleryTemplate ? (
            <>
              {!selectedCategory ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#C084FC', margin: '0 0 6px 0' }}>
                      {lang === 'en' ? 'Select Template Category' : 'اختر القسم التخصصي لمشروعك'}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text2, #8B96A8)', margin: 0 }}>
                      {lang === 'en' ? 'Filter templates by business industry and type.' : 'قم بتصفية القوالب البرمجية حسب تخصص نشاطك التجاري.'}
                    </p>
                  </div>
                  <div className="wc-category-pills" style={{ justifyContent: 'center' }}>
                    <button 
                      className="wc-category-pill active"
                      onClick={() => setSelectedCategory('All')}
                    >
                      <FolderOpen size={16} />
                      <span>{lang === 'en' ? 'All Templates' : 'جميع القوالب'}</span>
                    </button>
                    {[...new Set(galleryTemplates.map(t => t.category).filter(Boolean))].map(cat => (
                      <button 
                        key={cat}
                        className="wc-category-pill"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        <Layers size={16} />
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="wc-btn wc-btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                      <span>{lang === 'en' ? 'Back to Categories' : 'العودة للأقسام'}</span>
                    </button>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#C084FC', margin: 0 }}>
                      {selectedCategory === 'All' ? (lang === 'en' ? 'All Templates' : 'جميع القوالب') : selectedCategory}
                    </h3>
                  </div>
                  {galleryTemplates.filter(t => selectedCategory === 'All' || t.category === selectedCategory).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2, #8B96A8)' }}>
                      {lang === 'en' ? 'No templates in this category yet.' : 'لا توجد قوالب في هذا القسم حالياً.'}
                    </div>
                  ) : (
                    <div className="wc-template-grid">
                      {galleryTemplates
                        .filter(tpl => selectedCategory === 'All' || tpl.category === selectedCategory)
                        .map(tpl => (
                        <motion.div 
                          key={tpl.id}
                          className="wc-template-card"
                          onClick={() => handleSelectGalleryTemplate(tpl)}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="wc-template-icon">{tpl.icon}</div>
                          <h4 style={{ color: 'var(--text, #F8FAFC)', fontSize: '15px', fontWeight: '900', marginBottom: '6px' }}>
                            {lang === 'en' ? tpl.name_en : tpl.name_ar}
                          </h4>
                          <p style={{ color: 'var(--text2, #8B96A8)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                            {lang === 'en' ? tpl.description_en : tpl.description_ar}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="wc-code-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => setSelectedGalleryTemplate(null)}
                    className="wc-btn wc-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                    <span>{lang === 'en' ? 'Back to Gallery' : 'العودة للمعرض'}</span>
                  </button>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#C084FC', margin: 0 }}>
                    {selectedGalleryTemplate.icon} {lang === 'en' ? selectedGalleryTemplate.name_en : selectedGalleryTemplate.name_ar}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handlePreview} className="wc-btn wc-btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    <Eye size={14} /> {lang === 'en' ? 'Preview Live' : 'معاينة مباشرة'}
                  </button>
                  <button onClick={copyToClipboard} className="wc-btn wc-btn-primary" style={{ background: '#C084FC', padding: '8px 16px', fontSize: '12px' }}>
                    <Copy size={14} /> {lang === 'en' ? 'Copy Code' : 'نسخ الكود'}
                  </button>
                </div>
              </div>
              <div className="wc-code-box">
                <pre>{generatedCode}</pre>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );

  // ====== RENDER STEP 2 ======
  const renderStep2 = () => (
    <motion.div 
      key="step2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25 }}
    >
      <div className="wc-section-header">
        <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: '#10B981' }} />
        <div>
          <h3 className="wc-section-title">
            <SlidersHorizontal size={20} color="#10B981" />
            <span>{lang === 'en' ? 'Step 2: Core Store Configurations' : 'الخطوة 2: الضبط والتهيئة العامة'}</span>
          </h3>
          <p className="wc-section-desc">
            {lang === 'en' 
              ? 'Configure domain connection, global payment gateways, and tax/currency defaults.' 
              : 'خطوات عملية وتوجيهية لربط اسم النطاق الخاص بك، تفعيل بوابات الدفع، وتحديد العملة والضرائب.'}
          </p>
        </div>
      </div>

      <div className="wc-settings-layout">
        <div className="wc-settings-sidebar">
          {tabs.map(tab => {
            const IconComponent = tab.IconComp;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                className={`wc-settings-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ x: isRtl ? -4 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: isActive ? '#10B981' : 'rgba(255,255,255,0.05)', 
                  color: isActive ? '#FFF' : '#10B981',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <IconComponent size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: isActive ? '#FFF' : 'var(--text, #F8FAFC)' }}>
                    {lang === 'en' ? tab.label_en : tab.label_ar}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text2, #8B96A8)' }}>
                    {lang === 'en' ? tab.desc_en : tab.desc_ar}
                  </div>
                </div>
                {isActive && <CheckCircle2 size={18} color="#10B981" />}
              </motion.button>
            );
          })}
        </div>

        <div className="wc-settings-content">
          {activeTab === 'domain' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text, #F8FAFC)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={22} color="#3B82F6" />
                <span>{lang === 'en' ? 'Connect Custom Domain (DNS Setup)' : 'ربط الدومين المخصص (إعدادات الـ DNS)'}</span>
              </h3>
              <p style={{ color: 'var(--text2, #8B96A8)', fontSize: '13.5px', marginBottom: '24px', lineHeight: '1.6' }}>
                {lang === 'en' 
                  ? 'Follow these 4 simple steps in your domain registrar (Namecheap, GoDaddy, Cloudflare) to link your domain.' 
                  : 'اتبع هذه الخطوات الـ 4 في لوحة تحكم شركة الدومين الخاصة بك (مثل Namecheap أو GoDaddy) لربط متجرك.'}
              </p>

              <ul className="wc-steps-list">
                <li className="wc-step-item">
                  <div className="wc-step-num">1</div>
                  <span>{lang === 'en' ? 'Log in to your Domain Registrar -> DNS Management Settings' : 'سجل الدخول لحساب الدومين الخاص بك وأدخل لصفحة إدارة الـ DNS'}</span>
                </li>
                <li className="wc-step-item">
                  <div className="wc-step-num">2</div>
                  <span>{lang === 'en' ? 'Add A Record pointing `@` to IP: 185.199.108.153' : 'أضف سجل A Record واجعل الاسم `@` يشير للعنوان الرقمي IP'}</span>
                </li>
                <li className="wc-step-item">
                  <div className="wc-step-num">3</div>
                  <span>{lang === 'en' ? 'Add CNAME Record pointing `www` to your store slug' : 'أضف سجل CNAME واجعل الاسم `www` يشير إلى رابط متجرك الأصلي'}</span>
                </li>
                <li className="wc-step-item">
                  <div className="wc-step-num">4</div>
                  <span>{lang === 'en' ? 'Save DNS changes and wait 15 - 30 mins for propagation.' : 'احفظ التغييرات وانتظر 15-30 دقيقة لاكتمل تفعيل النطاق.'}</span>
                </li>
              </ul>
            </motion.div>
          )}

          {activeTab === 'payment' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text, #F8FAFC)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={22} color="#8B5CF6" />
                <span>{lang === 'en' ? 'Activate Payment Gateways' : 'تفعيل بوابات الدفع الإلكترونية'}</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="wc-gateway-card stripe">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: '900', color: '#8B5CF6', margin: 0, fontSize: '18px' }}>Stripe Checkout</h4>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#C084FC' }}>
                      {lang === 'en' ? 'Global Cards' : 'عالمي ومعتمد'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text, #F8FAFC)', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                    {lang === 'en' 
                      ? 'Supports Credit/Debit Cards, Apple Pay, Google Pay worldwide with maximum security and instant payouts.' 
                      : 'يدعم الدفع بالبطاقات الائتمانية حول العالم، Apple Pay، و Google Pay بسرعة وأمان عالي.'}
                  </p>
                </div>

                <div className="wc-gateway-card paypal">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: '900', color: '#3B82F6', margin: 0, fontSize: '18px' }}>PayPal Express</h4>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }}>
                      {lang === 'en' ? 'Instant Trust' : 'محبوب وثقة'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text, #F8FAFC)', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                    {lang === 'en' 
                      ? 'Preferred by global buyers for easy 1-click checkout without re-entering card details.' 
                      : 'يفضله ملايين العملاء حول العالم لسهولته وأمانه في إتمام الدفع بزر واحد.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'taxes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text, #F8FAFC)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Coins size={22} color="#F59E0B" />
                <span>{lang === 'en' ? 'Currency & Taxes Configuration' : 'العملة الأساسية والضرائب'}</span>
              </h3>
              
              <ul className="wc-steps-list">
                <li className="wc-step-item">
                  <div className="wc-step-num" style={{ background: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B', color: '#F59E0B' }}>1</div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text, #F8FAFC)' }}>
                      {lang === 'en' ? 'Default Store Currency:' : 'العملة الأساسية للمتجر:'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text2, #8B96A8)' }}>
                      {lang === 'en' ? 'Set from Settings -> General -> Currency (e.g. USD, SAR, EGP).' : 'يتم الضبط من الإعدادات العامة للمتجر حسب جمهورك المستهدف (USD / SAR / EGP).'}
                    </div>
                  </div>
                </li>

                <li className="wc-step-item">
                  <div className="wc-step-num" style={{ background: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B', color: '#F59E0B' }}>2</div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text, #F8FAFC)' }}>
                      {lang === 'en' ? 'Tax Rates (VAT):' : 'ضريبة القيمة المضافة (VAT):'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text2, #8B96A8)' }}>
                      {lang === 'en' ? 'Enable automatic checkout tax calculation in Settings -> Taxes.' : 'تأكد من تفعيل احتساب الضريبة تلقائياً في صفحة إعدادات الضرائب.'}
                    </div>
                  </div>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // ====== RENDER STEP 3 ======
  const renderStep3 = () => (
    <motion.div 
      key="step3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25 }}
    >
      <div className="wc-section-header">
        <div style={{ width: '4px', height: '22px', borderRadius: '4px', background: '#F59E0B' }} />
        <div>
          <h3 className="wc-section-title">
            <Server size={20} color="#F59E0B" />
            <span>{lang === 'en' ? 'Step 3: Domain Infrastructure & Matrix' : 'الخطوة 3: البنية التحتية ومصفوفة الدومينات'}</span>
          </h3>
          <p className="wc-section-desc">
            {lang === 'en' 
              ? 'Generate premium brand domain name combinations and verify setup completion.' 
              : 'استخرج أفضل نطاقات ودومينات تجارية بناءً على اسم براندك ومجالك للبدء بقوة.'}
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--bg3, rgba(30, 41, 59, 0.5))', border: '1px solid var(--line, rgba(255,255,255,0.08))', borderRadius: '20px', padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} />
          <span>{lang === 'en' ? 'Smart Domain Matrix Generator' : 'مولد مصفوفة الدومينات الذكية'}</span>
        </h3>
        <p style={{ color: 'var(--text2, #8B96A8)', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
          {lang === 'en' 
            ? `Generate strategic domain formats based on your brand (${state?.brandName || 'select brand in identity step'}) and niche (${state?.niche || 'general'}).` 
            : `استخرج نماذج استراتيجية للدومينات بناءً على اسم البراند (${state?.brandName || 'يرجى تحديد براند في خطوات الهوية'}) ومجالك (${state?.niche || 'عام'}).`}
        </p>

        <div style={{ maxWidth: '560px', width: '100%', marginBottom: '20px' }}>
          <AnalysisModeSelector 
            mode={analysisMode} 
            onChange={setAnalysisMode} 
            lang={lang} 
            accentColor="#F59E0B" 
          />
        </div>

        <button 
          onClick={generateDomainIdeas}
          disabled={isGeneratingDomain || !state?.brandName}
          className="wc-btn wc-btn-primary"
          style={{ background: isGeneratingDomain ? 'rgba(245, 158, 11, 0.3)' : '#F59E0B', color: isGeneratingDomain ? '#FFF' : '#000' }}
        >
          {isGeneratingDomain ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span className="td-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} /> {lang === 'en' ? 'Analyzing Matrix...' : 'جاري تحليل مصفوفة الدومينات...'}
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Cpu size={18} /> {lang === 'en' ? 'Generate Domain Matrix' : 'توليد مصفوفة الدومينات'}
            </span>
          )}
        </button>
      </div>

      {renderMatrixSection()}

      <div style={{ marginTop: '36px' }}>
        <div style={{ background: 'var(--bg3, rgba(30, 41, 59, 0.4))', border: '1px solid var(--line, rgba(255,255,255,0.08))', borderRadius: '20px', padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckSquare size={24} />
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--text, #F8FAFC)', fontWeight: 900 }}>
              {lang === 'en' ? 'Website Setup Confirmation' : 'تأكيد جاهزية الموقع'}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text2, #8B96A8)', lineHeight: 1.6 }}>
              {lang === 'en' ? 'Confirm that you have generated your website code and reviewed core store settings.' : 'قم بالتأكيد بأنك ولدت كود موقعك وراجعت الإعدادات الأساسية لتحديث حالة الإنجاز.'}
            </p>
          </div>
          <button 
            onClick={() => {
              dispatch({ type: 'COMPLETE_STEP', payload: 'website-construction' });
              toast(lang === 'en' ? 'Step marked as completed!' : 'تم تأكيد إكمال خطوة بناء الموقع!', 'success');
            }}
            className="wc-btn wc-btn-primary"
            style={{ 
              background: state?.completedSteps?.includes('website-construction') ? '#10B981' : '#F59E0B', 
              color: state?.completedSteps?.includes('website-construction') ? '#FFF' : '#000',
              padding: '12px 28px' 
            }}
          >
            {state?.completedSteps?.includes('website-construction') 
              ? (lang === 'en' ? 'Setup Confirmed ✅' : 'تم التأكيد ✅')
              : (lang === 'en' ? 'Confirm Completion' : 'تأكيد الإنجاز')}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <ToolDashboardLayout
      id="website-construction"
      title={lang === 'en' ? 'Website Construction & Setup' : 'بناء وتجهيز الموقع'}
      subtitle={lang === 'en' ? 'A 3-step wizard to build your website, configure settings, and setup the infrastructure.' : 'معالج من 3 خطوات لبناء الموقع، ضبط الإعدادات العامة، وتجهيز البنية التحتية.'}
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="30 - 60"
    >
      <div className="wc-container" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* WIZARD NAVIGATION HEADER */}
        <div className="wc-wizard-header">
          <button 
            className={`wc-wizard-tab ${currentStep === 1 ? 'active' : ''}`}
            onClick={() => setCurrentStep(1)} 
          >
            {currentStep === 1 && (
              <motion.div 
                layoutId="websiteStepTabHighlight" 
                className="wc-wizard-tab-bg" 
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Wand2 size={16} style={{ zIndex: 1 }} />
            <span style={{ zIndex: 1 }}>1. {lang === 'en' ? 'Design & Code' : 'التصميم والكود'}</span>
          </button>

          <button 
            className={`wc-wizard-tab ${currentStep === 2 ? 'active' : ''}`}
            onClick={() => setCurrentStep(2)} 
          >
            {currentStep === 2 && (
              <motion.div 
                layoutId="websiteStepTabHighlight" 
                className="wc-wizard-tab-bg" 
                style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0.25) 100%)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Settings size={16} style={{ zIndex: 1 }} />
            <span style={{ zIndex: 1 }}>2. {lang === 'en' ? 'Settings & DNS' : 'الإعدادات العامة'}</span>
          </button>

          <button 
            className={`wc-wizard-tab ${currentStep === 3 ? 'active' : ''}`}
            onClick={() => setCurrentStep(3)} 
          >
            {currentStep === 3 && (
              <motion.div 
                layoutId="websiteStepTabHighlight" 
                className="wc-wizard-tab-bg" 
                style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(236, 72, 153, 0.25) 100%)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Server size={16} style={{ zIndex: 1 }} />
            <span style={{ zIndex: 1 }}>3. {lang === 'en' ? 'Infrastructure' : 'البنية التحتية'}</span>
          </button>
        </div>

        {/* STEP CONTENT WRAPPER */}
        <div className="wc-panel">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </AnimatePresence>

          {/* WIZARD CONTROLS */}
          <div className="wc-controls">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="wc-btn wc-btn-secondary"
              style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
            >
              {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <span>{lang === 'en' ? 'Previous Step' : 'الخطوة السابقة'}</span>
            </button>
            {currentStep < 3 && (
              <button 
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                className="wc-btn wc-btn-primary"
              >
                <span>{lang === 'en' ? 'Next Step' : 'الخطوة التالية'}</span>
                {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </ToolDashboardLayout>
  );
}

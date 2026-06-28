import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getWebsiteTemplate, getAllWebsiteGalleryTemplates, getDomainIdeasTemplate } from '../../../services/contentDbService';
import { parseTemplate } from '../../../utils/templateParser';
import { callGemini } from '../../../services/geminiService';
import { useNavigate } from 'react-router-dom';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function WebsiteConstruction({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  
  // -- Wizard State --
  const navigate = useNavigate();
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
    { id: 'domain', label_ar: 'ربط الدومين', label_en: 'Domain Connection', icon: '🌐' },
    { id: 'payment', label_ar: 'بوابات الدفع', label_en: 'Payment Gateways', icon: '💳' },
    { id: 'taxes', label_ar: 'العملة والضرائب', label_en: 'Currency & Taxes', icon: '💰' }
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
      // Basic validation: must be at least 20 chars
      if (tempApiKey.length < 20) throw new Error('Invalid API Key');
      dispatch({ type: 'UPDATE_USER_DATA', payload: { apiKey: tempApiKey.trim() } });
      setApiKeyError(false);
      alert(lang === 'en' ? 'API Key saved successfully! ✅' : 'تم حفظ مفتاح الـ API بنجاح! ✅');
    } catch (err) {
      alert(lang === 'en' ? 'Invalid API key format.' : 'صيغة مفتاح الـ API غير صحيحة.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const generateAILandingPage = async () => {
    const key = state.apiKey || tempApiKey;
    if (!key) {
      setApiKeyError(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedCode('');
    try {
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
      
      // Remove any potential markdown wrapping
      const cleanedHtml = aiResponse.replace(/```html|```/g, '').trim();
      setGeneratedCode(`\`\`\`html\n${cleanedHtml}\n\`\`\``);
      setApiKeyError(false);
    } catch (error) {
      console.error(error);
      if (error.message?.includes('API Key') || error.message?.includes('key')) {
        setApiKeyError(true);
      } else {
        alert(lang === 'en' ? 'Error generating website code.' : 'حدث خطأ أثناء توليد كود الموقع.');
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
  };

  const copyToClipboard = () => {
    const codeToCopy = generatedCode.replace(/^\`\`\`html\n/, '').replace(/\n\`\`\`$/, '');
    navigator.clipboard.writeText(codeToCopy);
    alert(lang === 'en' ? 'Code copied successfully!' : 'تم نسخ الكود بنجاح!');
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
      alert(lang === 'en' ? 'Please choose a brand name first.' : 'الرجاء اختيار اسم البراند أولاً.');
      return;
    }
    setIsGeneratingDomain(true);
    setDomainMatrix(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      const dbResult = await getDomainIdeasTemplate(state.niche || 'general');
      if (dbResult && dbResult.matrix) {
        setDomainMatrix(dbResult.matrix);
      } else {
        setDomainMatrix({ error: lang === 'en' ? 'Domain matrix not found.' : 'لم يتم العثور على مصفوفة الدومينات.' });
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error suggesting domains.' : 'حدث خطأ. يرجى إعادة المحاولة.');
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

  const renderDomainCard = (domainText, description, color) => (
    <div 
      key={domainText} 
      className="td-result-card"
      style={{ 
        borderLeftColor: lang === 'en' ? color : 'transparent', 
        borderRightColor: lang === 'ar' ? color : 'transparent',
        background: 'rgba(13, 18, 32, 0.8)',
        cursor: 'copy'
      }}
      onClick={() => {
        navigator.clipboard.writeText(domainText);
      }}
      title={lang === 'en' ? 'Click to copy' : 'اضغط للنسخ'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h5 style={{ fontSize: '18px', fontWeight: 900, color: color, margin: 0 }}>{domainText}</h5>
        <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', color: '#8B96A8', border: `1px solid rgba(255,255,255,0.1)`, backgroundColor: `rgba(0,0,0,0.4)` }}>
          Copy
        </span>
      </div>
      {description && <p style={{ fontSize: '12px', color: '#8B96A8', margin: 0, lineHeight: 1.6 }}>{description}</p>}
    </div>
  );

  const renderMatrixSection = () => {
    if (!domainMatrix || domainMatrix.error) {
      return domainMatrix?.error ? <div className="td-raw-output">{domainMatrix.error}</div> : null;
    }
    const bn = cleanBrand(state.brandName);
    
    const classicList = [];
    if (domainMatrix.classic) {
      domainMatrix.classic.formats.forEach(fmt => {
        domainMatrix.classic.extensions.forEach(ext => {
          let dom = fmt.replace('{{brandName}}', bn).replace('{ext}', ext);
          classicList.push({ domain: dom, desc: lang === 'en' ? 'Standard Professional' : 'دومين احترافي ومعتمد' });
        });
      });
    }

    const actionList = [];
    if (domainMatrix.action) {
      const { prefixesEn, prefixesAr, extensions, formats } = domainMatrix.action;
      prefixesEn.forEach((pref, i) => {
        let ext = extensions[Math.floor(Math.random() * extensions.length)];
        let dom = formats[0].replace('{prefix}', pref).replace('{{brandName}}', bn).replace('{ext}', ext);
        let meaning = lang === 'en' ? `Action: ${pref}` : `بمعنى: ${prefixesAr[i]}`;
        actionList.push({ domain: dom, desc: meaning });
      });
    }

    const nicheList = [];
    if (domainMatrix.niche) {
      domainMatrix.niche.extensions.forEach(ext => {
        let dom = domainMatrix.niche.formats[0].replace('{{brandName}}', bn).replace('{ext}', ext);
        nicheList.push({ domain: dom, desc: lang === 'en' ? domainMatrix.niche.desc_en : domainMatrix.niche.desc_ar });
      });
    }

    return (
      <div style={{ marginTop: '24px' }}>
        {classicList.length > 0 && (
          <div className="td-results-section" style={{ marginBottom: '32px', background: 'transparent', padding: 0 }}>
            <div className="td-results-label" style={{ color: '#10B981', fontSize: '18px', marginBottom: '20px' }}>
              <span className="td-results-line" style={{ background: '#10B981', height: '100%', width: '4px' }} />
              💎 {lang === 'en' ? domainMatrix.classic.title_en : domainMatrix.classic.title_ar}
            </div>
            <div className="td-grid cols-3" style={{ marginBottom: 0 }}>
              {classicList.slice(0, 6).map(item => renderDomainCard(item.domain, item.desc, '#10B981'))}
            </div>
          </div>
        )}

        {actionList.length > 0 && (
          <div className="td-results-section" style={{ marginBottom: '32px', background: 'transparent', padding: 0 }}>
            <div className="td-results-label" style={{ color: '#3B82F6', fontSize: '18px', marginBottom: '20px' }}>
              <span className="td-results-line" style={{ background: '#3B82F6', height: '100%', width: '4px' }} />
              ⚡ {lang === 'en' ? domainMatrix.action.title_en : domainMatrix.action.title_ar}
            </div>
            <div className="td-grid cols-3" style={{ marginBottom: 0 }}>
              {actionList.map(item => renderDomainCard(item.domain, item.desc, '#3B82F6'))}
            </div>
          </div>
        )}

        {nicheList.length > 0 && (
          <div className="td-results-section" style={{ marginBottom: '32px', background: 'transparent', padding: 0 }}>
            <div className="td-results-label" style={{ color: '#8B5CF6', fontSize: '18px', marginBottom: '20px' }}>
              <span className="td-results-line" style={{ background: '#8B5CF6', height: '100%', width: '4px' }} />
              🎯 {lang === 'en' ? domainMatrix.niche.title_en : domainMatrix.niche.title_ar}
            </div>
            <div className="td-grid cols-3" style={{ marginBottom: 0 }}>
              {nicheList.map(item => renderDomainCard(item.domain, item.desc, '#8B5CF6'))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ====== RENDER STEP 1 ======
  const renderStep1 = () => (
    <div className="animate-fade-in">
      <div className="td-section-title">
        <div className="td-section-bar" style={{ background: '#3B82F6' }} />
        {lang === 'en' ? 'Step 1: Choose Building Method' : 'الخطوة 1: اختر طريقة البناء'}
      </div>
      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        <div 
          className={`td-card ${method === 'gemini' ? 'active' : ''}`}
          onClick={() => { setMethod('gemini'); setGeneratedCode(''); setSelectedGalleryTemplate(null); }}
          style={{ '--td-accent': '#10B981', padding: '24px', alignItems: 'flex-start', textAlign: lang === 'en' ? 'left' : 'right', display: 'block' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexDirection: lang === 'en' ? 'row' : 'row' }}>
            <div className="td-card-icon" style={{ margin: 0, width: '56px', height: '56px', fontSize: '24px', background: method === 'gemini' ? '#10B981' : 'rgba(16, 185, 129, 0.1)', color: method === 'gemini' ? '#fff' : '#10B981', borderColor: method === 'gemini' ? 'transparent' : 'rgba(16, 185, 129, 0.2)' }}>🤖</div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '900', marginBottom: '4px' }}>
                {lang === 'en' ? 'AI Building (Dynamic)' : 'البناء بالذكاء الاصطناعي (ديناميكي)'}
              </h4>
              <p style={{ color: '#10B981', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {lang === 'en' ? 'Generate based on your Niche' : 'توليد بناءً على مجالك الحالي'}
              </p>
            </div>
          </div>
          <p style={{ color: '#8B96A8', fontSize: '12px', lineHeight: '1.7', margin: 0 }}>
            {lang === 'en' ? 'Use AI to write the code for a professional landing page based strictly on your identity and field.' : 'استخدم الذكاء الاصطناعي لكتابة كود صفحة هبوط متكاملة بناءً على هويتك ومجالك الذي أدخلته.'}
          </p>
        </div>

        <div 
          className={`td-card ${method === 'template' ? 'active' : ''}`}
          onClick={() => { setMethod('template'); setGeneratedCode(''); setSelectedGalleryTemplate(null); }}
          style={{ '--td-accent': '#C084FC', padding: '24px', alignItems: 'flex-start', textAlign: lang === 'en' ? 'left' : 'right', display: 'block' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexDirection: lang === 'en' ? 'row' : 'row' }}>
            <div className="td-card-icon" style={{ margin: 0, width: '56px', height: '56px', fontSize: '24px', background: method === 'template' ? '#C084FC' : 'rgba(192, 132, 252, 0.1)', color: method === 'template' ? '#fff' : '#C084FC', borderColor: method === 'template' ? 'transparent' : 'rgba(192, 132, 252, 0.2)' }}>🎨</div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '900', marginBottom: '4px' }}>
                {lang === 'en' ? 'Premium Template Gallery' : 'معرض القوالب الاحترافية'}
              </h4>
              <p style={{ color: '#C084FC', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {lang === 'en' ? 'Choose from 10 Ready Models' : 'اختر من ١٠ نماذج جاهزة ومبرمجة'}
              </p>
            </div>
          </div>
          <p style={{ color: '#8B96A8', fontSize: '12px', lineHeight: '1.7', margin: 0 }}>
            {lang === 'en' ? 'Browse our rich library of 10 fully-coded, responsive Tailwind templates tailored for different businesses.' : 'تصفح مكتبتنا الغنية المكونة من ١٠ قوالب احترافية متجاوبة مبرمجة بـ Tailwind.'}
          </p>
        </div>
      </div>

      {method === 'gemini' && (
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✨</span> {lang === 'en' ? 'Your Website Code (Tailwind CSS)' : 'الكود البرمجي لموقعك (Tailwind CSS)'}
            </h3>
            {generatedCode && !isGenerating && !apiKeyError && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePreview} style={{ background: '#0f172a', color: '#fff', border: '1px solid #10B981', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  👁️ {lang === 'en' ? 'Preview' : 'معاينة'}
                </button>
                <button onClick={copyToClipboard} style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  📋 {lang === 'en' ? 'Copy Code' : 'نسخ الكود'}
                </button>
              </div>
            )}
          </div>

          {apiKeyError ? (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
              <h4 style={{ color: '#ef4444', fontSize: '14px', fontWeight: '900', marginBottom: '8px' }}>
                {lang === 'en' ? 'Gemini API Key Required' : 'مفتاح API الخاص بـ Gemini مطلوب'}
              </h4>
              <p style={{ color: '#8B96A8', fontSize: '12px', marginBottom: '20px', lineHeight: '1.6' }}>
                {lang === 'en' 
                  ? 'To use dynamic AI building, please provide a valid Google Gemini API Key. You can enter it below or set it in the platform settings.' 
                  : 'لاستخدام البناء الديناميكي بالذكاء الاصطناعي، يرجى تقديم مفتاح API صالح لـ Google Gemini. يمكنك إدخاله أدناه أو ضبطه في إعدادات المنصة.'}
              </p>
              
              <div style={{ maxWidth: '400px', margin: '0 auto 16px auto', display: 'flex', gap: '10px' }}>
                <input 
                  type="password"
                  className="td-input"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={e => setTempApiKey(e.target.value)}
                  style={{ flex: 1, margin: 0, padding: '10px 16px', fontSize: '12px' }}
                />
                <button 
                  onClick={handleSaveApiKey}
                  disabled={isSavingKey || !tempApiKey.trim()}
                  style={{ background: '#10B981', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isSavingKey ? '...' : (lang === 'en' ? 'Save' : 'حفظ')}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button 
                  onClick={() => navigate('/dashboard/settings')}
                  style={{ background: 'transparent', color: '#3B82F6', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ⚙️ {lang === 'en' ? 'Go to Settings' : 'الذهاب للإعدادات'}
                </button>
                <button 
                  onClick={() => setApiKeyError(false)}
                  style={{ background: 'transparent', color: '#8B96A8', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
              </div>
            </div>
          ) : !generatedCode || isGenerating ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <button onClick={generateAILandingPage} disabled={isGenerating} className="td-btn-primary" style={{ background: isGenerating ? 'rgba(16, 185, 129, 0.2)' : '#10B981', color: isGenerating ? '#8B96A8' : '#fff', maxWidth: '300px', margin: '0 auto' }}>
                {isGenerating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span className="td-spinner" /> {lang === 'en' ? 'Programming website...' : 'جاري برمجة الموقع...'}
                  </span>
                ) : (
                  <span>💻 {lang === 'en' ? 'Generate Custom Website Code' : 'توليد كود الموقع المخصص'}</span>
                )}
              </button>
            </div>
          ) : (
            <div className="td-raw-output" style={{ margin: 0, borderTop: '3px solid #10B981', maxHeight: '500px', overflowY: 'auto' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', direction: 'ltr', textAlign: 'left', fontSize: '12px', fontFamily: 'monospace' }}>
                {generatedCode}
              </pre>
            </div>
          )}
        </div>
      )}

      {method === 'template' && (
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(192, 132, 252, 0.2)', background: 'rgba(192, 132, 252, 0.05)' }}>
          {!selectedGalleryTemplate ? (
            <>
              {!selectedCategory ? (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#C084FC', marginBottom: '24px', textAlign: 'center' }}>
                    {lang === 'en' ? 'Select a Category' : 'اختر قسم لتصفح القوالب'}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    <div 
                      onClick={() => setSelectedCategory('All')}
                      style={{
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(192, 132, 252, 0.2)', borderRadius: '12px', padding: '24px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#C084FC'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.2)'}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
                      <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '800' }}>{lang === 'en' ? 'All Templates' : 'جميع القوالب'}</h4>
                    </div>
                    {[...new Set(galleryTemplates.map(t => t.category).filter(Boolean))].map(cat => (
                      <div 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(192, 132, 252, 0.2)', borderRadius: '12px', padding: '24px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#C084FC'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.2)'}
                      >
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
                        <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '800' }}>{cat}</h4>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      {lang === 'en' ? '← Back to Categories' : '← العودة للأقسام'}
                    </button>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#C084FC', margin: 0 }}>
                      {selectedCategory === 'All' ? (lang === 'en' ? 'All Templates' : 'جميع القوالب') : selectedCategory}
                    </h3>
                  </div>
                  {galleryTemplates.filter(t => selectedCategory === 'All' || t.category === selectedCategory).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8B96A8' }}>
                      {lang === 'en' ? 'No templates in this category yet.' : 'لا توجد قوالب في هذا القسم حالياً.'}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {galleryTemplates
                        .filter(tpl => selectedCategory === 'All' || tpl.category === selectedCategory)
                        .map(tpl => (
                        <div 
                          key={tpl.id}
                          onClick={() => handleSelectGalleryTemplate(tpl)}
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(192, 132, 252, 0.2)',
                            borderRadius: '12px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#C084FC'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.2)'}
                        >
                          <div style={{ fontSize: '32px', marginBottom: '12px', textAlign: 'center' }}>{tpl.icon}</div>
                          <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>
                            {lang === 'en' ? tpl.name_en : tpl.name_ar}
                          </h4>
                          <p style={{ color: '#8B96A8', fontSize: '11px', textAlign: 'center', lineHeight: '1.5', margin: 0 }}>
                            {lang === 'en' ? tpl.description_en : tpl.description_ar}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => setSelectedGalleryTemplate(null)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {lang === 'en' ? '← Back to Gallery' : '← العودة للمعرض'}
                  </button>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#C084FC', margin: 0 }}>
                    {selectedGalleryTemplate.icon} {lang === 'en' ? selectedGalleryTemplate.name_en : selectedGalleryTemplate.name_ar}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handlePreview} style={{ background: '#0f172a', color: '#fff', border: '1px solid #C084FC', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    👁️ {lang === 'en' ? 'Preview' : 'معاينة'}
                  </button>
                  <button onClick={copyToClipboard} style={{ background: '#C084FC', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    📋 {lang === 'en' ? 'Copy Code' : 'نسخ الكود'}
                  </button>
                </div>
              </div>
              <div className="td-raw-output" style={{ margin: 0, borderTop: '3px solid #C084FC', maxHeight: '500px', overflowY: 'auto' }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', direction: 'ltr', textAlign: 'left', fontSize: '12px', fontFamily: 'monospace' }}>
                  {generatedCode}
                </pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  // ====== RENDER STEP 2 ======
  const renderStep2 = () => (
    <div className="animate-fade-in">
      <div className="td-section-title">
        <div className="td-section-bar" style={{ background: '#10B981' }} />
        {lang === 'en' ? 'Step 2: General Settings' : 'الخطوة 2: الإعدادات العامة'}
      </div>
      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderRadius: '16px',
                background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(13, 18, 32, 0.6)',
                border: `1px solid ${activeTab === tab.id ? '#10B981' : 'rgba(255,255,255,0.05)'}`,
                color: activeTab === tab.id ? '#fff' : '#8B96A8',
                cursor: 'pointer', transition: 'all 0.3s ease',
                textAlign: lang === 'en' ? 'left' : 'right', width: '100%',
                flexDirection: lang === 'en' ? 'row' : 'row'
              }}
            >
              <span style={{ fontSize: '28px', opacity: activeTab === tab.id ? 1 : 0.5 }}>{tab.icon}</span>
              <span style={{ fontSize: '16px', fontWeight: '900' }}>{lang === 'en' ? tab.label_en : tab.label_ar}</span>
              {activeTab === tab.id && <span style={{ marginLeft: lang === 'en' ? 'auto' : 0, marginRight: lang === 'en' ? 0 : 'auto', color: '#10B981', fontSize: '18px' }}>●</span>}
            </button>
          ))}
        </div>
        <div className="td-info-panel" style={{ margin: 0, padding: '24px', overflow: 'hidden' }}>
          {activeTab === 'domain' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🌐</span> {lang === 'en' ? 'Connect Custom Domain' : 'ربط الدومين المخصص'}
              </h3>
              <p style={{ color: '#8B96A8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                {lang === 'en' ? 'Make your store link professional instead of using the free domain.' : 'اجعل رابط متجرك احترافياً بدلاً من استخدام النطاق المجاني.'}
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
                <ol style={{ listStylePosition: 'inside', color: '#E8EDF5', fontSize: '14px', lineHeight: '2', padding: 0, margin: 0 }}>
                  <li>{lang === 'en' ? 'Go to ' : 'اذهب إلى '}<strong>Settings &gt; Domains</strong></li>
                  <li>{lang === 'en' ? 'Click on ' : 'اضغط على '}<strong>Add Domain</strong></li>
                  <li>{lang === 'en' ? 'Copy the ' : 'انسخ الـ '}<strong>A Record</strong>{lang === 'en' ? ' and ' : ' و '}<strong>CNAME</strong></li>
                  <li>{lang === 'en' ? 'Paste them in your domain provider.' : 'ألصق السجلات في شركة الدومينات الخاصة بك.'}</li>
                </ol>
              </div>
            </div>
          )}
          {activeTab === 'payment' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>💳</span> {lang === 'en' ? 'Activate Payment Gateways' : 'تفعيل بوابات الدفع'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(99, 91, 255, 0.1)', border: '1px solid rgba(99, 91, 255, 0.3)', padding: '24px', borderRadius: '16px' }}>
                  <h4 style={{ fontWeight: '900', color: '#8B5CF6', marginBottom: '8px', fontSize: '18px' }}>Stripe</h4>
                  <p style={{ color: '#E8EDF5', fontSize: '12px', marginBottom: '16px', lineHeight: '1.6' }}>
                    {lang === 'en' ? 'The best for credit cards worldwide.' : 'الأفضل للبطاقات الائتمانية حول العالم.'}
                  </p>
                </div>
                <div style={{ background: 'rgba(0, 121, 193, 0.1)', border: '1px solid rgba(0, 121, 193, 0.3)', padding: '24px', borderRadius: '16px' }}>
                  <h4 style={{ fontWeight: '900', color: '#3B82F6', marginBottom: '8px', fontSize: '18px' }}>PayPal</h4>
                  <p style={{ color: '#E8EDF5', fontSize: '12px', marginBottom: '16px', lineHeight: '1.6' }}>
                    {lang === 'en' ? 'Preferred by many customers for its ease.' : 'يفضله الكثير من العملاء لسهولته وأمانه.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'taxes' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>💰</span> {lang === 'en' ? 'Currency & Taxes' : 'العملة والضرائب'}
              </h3>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h4 style={{ fontWeight: '900', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
                    {lang === 'en' ? 'Setting Base Currency:' : 'إعداد العملة الأساسية:'}
                  </h4>
                  <p style={{ color: '#8B96A8', fontSize: '12px', lineHeight: '1.6' }}>
                    {lang === 'en' ? 'From ' : 'من '}<strong>Settings &gt; General</strong>
                  </p>
                </div>
                <div>
                  <h4 style={{ fontWeight: '900', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
                    {lang === 'en' ? 'Tax Rates:' : 'الضرائب (Tax Rates):'}
                  </h4>
                  <p style={{ color: '#8B96A8', fontSize: '12px', marginBottom: '12px', lineHeight: '1.6' }}>
                    {lang === 'en' ? 'From ' : 'من '}<strong>Settings &gt; Taxes</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ====== RENDER STEP 3 ======
  const renderStep3 = () => (
    <div className="animate-fade-in">
      <div className="td-section-title">
        <div className="td-section-bar" style={{ background: '#F59E0B' }} />
        {lang === 'en' ? 'Step 3: Infrastructure Setup' : 'الخطوة 3: البنية التحتية'}
      </div>
      
      <div className="td-info-panel" style={{ margin: '0 0 36px 0', display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#F59E0B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🌐</span> {lang === 'en' ? 'Smart Domain Matrix' : 'مصفوفة الدومينات الذكية'}
        </h3>
        <p style={{ color: '#8B96A8', fontSize: '12px', lineHeight: '1.6', marginBottom: '20px' }}>
          {lang === 'en' ? `Generate strategic domain models based on your brand (${state?.brandName || 'please select a brand first'}) and your niche (${state?.niche || 'general'}).` : `استخرج نماذج ذكية واستراتيجية للدومينات بناءً على اسم البراند (${state?.brandName || 'يرجى اختيار براند أولاً'}) ومجالك (${state?.niche || 'عام'}).`}
        </p>
        <button 
          onClick={generateDomainIdeas}
          disabled={isGeneratingDomain || !state?.brandName}
          className="td-btn-primary"
          style={{ background: isGeneratingDomain ? 'rgba(245, 158, 11, 0.2)' : '#F59E0B', color: isGeneratingDomain ? '#8B96A8' : '#000' }}
        >
          {isGeneratingDomain ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span className="td-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} /> {lang === 'en' ? 'Analyzing Matrix...' : 'جاري تحليل مصفوفة الدومينات...'}
            </span>
          ) : (
            <span>🤖 {lang === 'en' ? 'Generate Domain Matrix' : 'توليد مصفوفة الدومينات'}</span>
          )}
        </button>
      </div>
      {renderMatrixSection()}


      <div style={{ marginTop: '36px' }}>
        <div className="td-info-panel" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '40px' }}>✅</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#F0F4FC' }}>
              {lang === 'en' ? 'Platform Setup Completed' : 'إتمام تجهيز المنصة'}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#8B96A8', lineHeight: 1.6 }}>
              {lang === 'en' ? 'Confirm that you have finished the basic settings.' : 'قم بالتأكيد بأنك أنهيت الإعدادات الأساسية.'}
            </p>
          </div>
          <button 
            onClick={() => dispatch({ type: 'COMPLETE_STEP', payload: 'website-construction' })}
            className="td-btn-primary"
            style={{ 
              background: state?.completedSteps?.includes('website-construction') ? '#10B981' : '#F59E0B', 
              color: state?.completedSteps?.includes('website-construction') ? '#fff' : '#000',
              width: 'auto', padding: '0 32px' 
            }}
          >
            {state?.completedSteps?.includes('website-construction') 
              ? (lang === 'en' ? 'Setup Confirmed ✅' : 'تم التأكيد ✅')
              : (lang === 'en' ? 'Confirm Completion' : 'تأكيد الإنجاز')}
          </button>
        </div>
      </div>
    </div>
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
      {/* WIZARD NAVIGATION */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
        <button 
          onClick={() => setCurrentStep(1)} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: currentStep === 1 ? '#3B82F6' : 'rgba(59, 130, 246, 0.1)', color: currentStep === 1 ? '#fff' : '#3B82F6', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          1. {lang === 'en' ? 'Design' : 'التصميم'}
        </button>
        <button 
          onClick={() => setCurrentStep(2)} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: currentStep === 2 ? '#10B981' : 'rgba(16, 185, 129, 0.1)', color: currentStep === 2 ? '#fff' : '#10B981', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          2. {lang === 'en' ? 'Settings' : 'الإعدادات'}
        </button>
        <button 
          onClick={() => setCurrentStep(3)} 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: currentStep === 3 ? '#F59E0B' : 'rgba(245, 158, 11, 0.1)', color: currentStep === 3 ? '#fff' : '#F59E0B', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          3. {lang === 'en' ? 'Infrastructure' : 'البنية التحتية'}
        </button>
      </div>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* WIZARD CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
        <button 
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          style={{ visibility: currentStep === 1 ? 'hidden' : 'visible', padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#8B96A8', cursor: 'pointer' }}
        >
          {lang === 'en' ? '← Previous Step' : '← الخطوة السابقة'}
        </button>
        {currentStep < 3 && (
          <button 
            onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#3B82F6', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {lang === 'en' ? 'Next Step →' : 'الخطوة التالية →'}
          </button>
        )}
      </div>

    </ToolDashboardLayout>
  );
}

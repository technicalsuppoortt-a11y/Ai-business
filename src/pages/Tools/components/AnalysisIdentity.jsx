import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getNiches, seedNiches } from '../../../services/nicheService';
import { getNicheAnalysis, getBrandNames, getBrandNichesDef, getColorAnalysis } from '../../../services/contentDbService';
import ToolDashboardLayout from './ToolDashboardLayout';
import './AnalysisIdentity.css';

const NICHE_THEMES = {
  ai: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', rgb: '16, 185, 129' },
  business: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', rgb: '59, 130, 246' },
  marketing: { color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.1)', rgb: '244, 63, 94' },
  fitness: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', rgb: '245, 158, 11' },
  realestate: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', rgb: '139, 92, 246' },
  creative: { color: '#D946EF', bg: 'rgba(217, 70, 239, 0.1)', rgb: '217, 70, 239' }
};

const DEFAULT_THEME = { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', rgb: '139, 92, 246' };

const BRAND_CATEGORIES = [
  { id: 'ecom', label_ar: 'التجارة الإلكترونية', label_en: 'E-commerce', sub_ar: 'منتجات ملموسة', sub_en: 'Physical Products', icon: '🛒' },
  { id: 'digital', label_ar: 'المنتجات الرقمية', label_en: 'Digital Products', sub_ar: 'كورسات، قوالب', sub_en: 'Courses, Templates', icon: '💎' },
  { id: 'services', label_ar: 'الخدمات والأعمال', label_en: 'Services', sub_ar: 'تسويق، استشارات', sub_en: 'Marketing, Consulting', icon: '💼' }
];

const PRESETS_PALETTES = [
  { name: "Neon Cyan", primary: "#06b6d4", secondary: "#0f172a", accent: "#f43f5e" }, 
  { name: "Royal Purple", primary: "#8b5cf6", secondary: "#1e1b4b", accent: "#10b981" },
  { name: "Emerald Green", primary: "#10b981", secondary: "#064e3b", accent: "#f59e0b" }, 
  { name: "Ocean Blue", primary: "#1e40af", secondary: "#f8fafc", accent: "#ef4444" },
  { name: "Golden Luxury", primary: "#d4af37", secondary: "#171717", accent: "#ffffff" }, 
  { name: "Sunset Orange", primary: "#f97316", secondary: "#fff7ed", accent: "#0f766e" }
];

export default function AnalysisIdentity() {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const userLevel = state.user?.level || 'beginner';
  const userCountry = state.user?.country || 'EG';

  // Tabs management
  const [activeTab, setActiveTab] = useState('niche'); // 'niche', 'name', 'identity'

  // Tab 1: Niche selection states
  const [niches, setNiches] = useState([]);
  const [loadingNiches, setLoadingNiches] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [customNicheInput, setCustomNicheInput] = useState('');
  const [isAnalyzingNiche, setIsAnalyzingNiche] = useState(false);
  const [nicheAnalysis, setNicheAnalysis] = useState(null);

  // Tab 2: Brand naming states
  const [namingCategory, setNamingCategory] = useState('ecom');
  const [dynamicStyles, setDynamicStyles] = useState({});
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedCatalogs, setSelectedCatalogs] = useState([]);
  const [nameLanguage, setNameLanguage] = useState('all');
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [generatedNames, setGeneratedNames] = useState(null);
  const [customNameInput, setCustomNameInput] = useState(state.brandName || '');

  // Tab 3: Visual identity states
  const [primaryColor, setPrimaryColor] = useState(state.primaryColor || '#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState(state.secondaryColor || '#0f172a');
  const [accentColor, setAccentColor] = useState(state.accentColor || '#EC4899');
  const [logoPreview, setLogoPreview] = useState(state?.logo || null);
  const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
  const [colorAnalysis, setColorAnalysis] = useState(null);

  // ═══════════════ INITIAL LOADS ═══════════════
  useEffect(() => {
    // 1. Fetch niches for Tab 1
    const fetchNichesData = async () => {
      try {
        await seedNiches();
        let data = await getNiches();
        setNiches(data);
        if (state.niche) {
          const found = data.find(n => n.id === state.niche);
          if (found) setSelectedNiche(found);
        }
      } catch (err) {
        console.error("Error loading niches", err);
      } finally {
        setLoadingNiches(false);
      }
    };
    fetchNichesData();

    // 2. Fetch naming catalog definitions for Tab 2
    const fetchNamingDefs = async () => {
      try {
        const defs = await getBrandNichesDef();
        if (defs) {
          setDynamicStyles(defs);
          if (defs.ecom && defs.ecom.length > 0) {
            setSelectedStyle(defs.ecom[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching brand niches definitions:', error);
      }
    };
    fetchNamingDefs();
  }, []);

  // Update selected style when category changes
  const currentStyles = dynamicStyles[namingCategory] || [];
  const currentCatalogs = currentStyles.find(s => s.id === selectedStyle)?.catalogs || [];

  useEffect(() => {
    if (currentStyles.length > 0 && !currentStyles.find(s => s.id === selectedStyle)) {
      setSelectedStyle(currentStyles[0].id);
    }
  }, [namingCategory, currentStyles]);

  useEffect(() => {
    setSelectedCatalogs([]);
    setGeneratedNames(null);
  }, [selectedStyle]);

  // Sync state variables back to global context
  const handleNicheSelect = (n) => {
    setSelectedNiche(n);
    dispatch({ type: 'SET_FIELD', field: 'niche', value: n.id });
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: '' });
    setNicheAnalysis(null);
    setCustomNicheInput('');
  };

  const handleSubNicheSelect = (sub) => {
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: sub });
    setCustomNicheInput('');
    setNicheAnalysis(null);
  };

  const handleCustomNicheChange = (val) => {
    setCustomNicheInput(val);
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: val });
    setNicheAnalysis(null);
  };

  // Helper to determine if a niche is complex/unsuitable for beginners
  const isNicheComplex = (nicheName, catId) => {
    const complexKeywords = [
      'saas', 'software', 'برمجيات', 'cybersecurity', 'أمن سيبراني',
      'blockchain', 'crypto', 'عملات رقمية', 'trading', 'تداول', 'عقارات', 'أملاك'
    ];
    const nameLower = String(nicheName).toLowerCase();
    const catLower = String(catId).toLowerCase();
    return complexKeywords.some(kw => nameLower.includes(kw) || catLower.includes(kw));
  };

  // Get dynamic badges for market indicators
  const getMarketBadges = (index) => {
    const badges = [
      { text: lang === 'en' ? '🔥 Fast Trend' : '🔥 تريند سريع', class: 'trend' },
      { text: lang === 'en' ? '💰 High Profit' : '💰 ربحية عالية', class: 'profit' },
      { text: lang === 'en' ? '📈 Stable Demand' : '📈 طلب مستقر', class: 'stable' },
      { text: lang === 'en' ? '💼 Good Freelance' : '💼 مناسب للعمل الحر', class: 'freelance' }
    ];
    return badges[index % badges.length];
  };

  // Parsing algorithm for AI response block
  const parseNicheAnalysis = (text) => {
    if (!text) return null;
    let verdict = "";
    let icp = { age: "", job: "", pain: "" };
    let nextStep = "";

    const lines = text.split('\n');
    let currentSection = "";
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.includes('حكم السوق') || cleanLine.toLowerCase().includes('verdict')) {
        currentSection = "verdict";
      } else if (cleanLine.includes('العميل المثالي') || cleanLine.toLowerCase().includes('customer') || cleanLine.toLowerCase().includes('icp')) {
        currentSection = "icp";
      } else if (cleanLine.includes('الخطوة التالية') || cleanLine.includes('الربط') || cleanLine.toLowerCase().includes('next')) {
        currentSection = "next";
      }
      
      if (cleanLine) {
        if (currentSection === "verdict") {
          if (!cleanLine.startsWith('#')) verdict += (verdict ? '\n' : '') + cleanLine;
        } else if (currentSection === "icp") {
          if (cleanLine.includes('العمر') || cleanLine.includes('age')) {
            icp.age = cleanLine.replace(/.*[:\-]/, '').trim();
          } else if (cleanLine.includes('الوظيفة') || cleanLine.includes('job') || cleanLine.includes('وظيفته')) {
            icp.job = cleanLine.replace(/.*[:\-]/, '').trim();
          } else if (cleanLine.includes('ألم') || cleanLine.includes('pain') || cleanLine.includes('الألم')) {
            icp.pain = cleanLine.replace(/.*[:\-]/, '').trim();
          } else if (!cleanLine.startsWith('*') && !cleanLine.startsWith('#')) {
            if (!icp.pain) icp.pain = cleanLine;
          }
        } else if (currentSection === "next") {
          if (!cleanLine.startsWith('#')) nextStep += (nextStep ? '\n' : '') + cleanLine;
        }
      }
    });

    // Fallback parser if custom format is returned
    if (!verdict) verdict = text.split('\n\n')[0] || text;
    if (!icp.age) icp.age = lang === 'en' ? "22 - 40 Years" : "22 - 40 سنة";
    if (!icp.job) icp.job = lang === 'en' ? "Freelancer / Small Business" : "فريلانسر أو صاحب عمل صغير";
    if (!icp.pain) icp.pain = lang === 'en' ? "Finding reliable customers and pricing correctly" : "الحصول على عملاء مستمرين وتسعير خدماتهم بدقة";
    if (!nextStep) nextStep = lang === 'en' 
      ? "To attract this customer, you will need a strong brand name and professional visual identity. Click Next to start."
      : "لجذب هذا العميل، ستحتاج لاسم براند قوي وهوية بصرية تعكس الاحترافية .. اضغط التالي لنبدأ.";

    return { verdict, icp, nextStep };
  };

  // Tab 1: Analyze Click
  const handleAnalyzeNiche = async () => {
    if (!state.subNiche) return;
    setIsAnalyzingNiche(true);
    setNicheAnalysis(null);

    try {
      await new Promise(r => setTimeout(r, 800)); // Dynamic UX delay

      // If user typed custom niche
      if (customNicheInput) {
        const customText = `## حكم السوق: الفرصة في ${userCountry === 'EG' ? 'مصر' : userCountry} ممتازة وتقدر بـ 8.5/10 نظراً للطلب المتزايد على خدمات وتطبيقات الـ ${customNicheInput} مؤخراً.
        ## بروفايل العميل المثالي:
        - العمر: 25 - 45 سنة.
        - الوظيفة: أصحاب الأعمال والمحترفين المهتمين بـ ${customNicheInput}.
        - أكبر ألم: صعوبة العثور على حلول متكاملة وموثوقة لـ ${customNicheInput} وتكلفتها العالية.
        ## الخطوة التالية:
        لجذب هذا العميل، ستحتاج لاسم براند قوي وهوية بصرية تعكس الاحترافية .. اضغط التالي لنبدأ.`;
        
        setNicheAnalysis(parseNicheAnalysis(customText));
      } else {
        // Fetch from pre-loaded niche database
        let subNicheKey = state.subNiche;
        if (selectedNiche) {
          let index = (selectedNiche.ideas_en || []).indexOf(state.subNiche);
          if (index === -1) {
            index = (selectedNiche.ideas_ar || []).indexOf(state.subNiche);
          }
          if (index !== -1) subNicheKey = index.toString();
        }
        
        const dbResult = await getNicheAnalysis(selectedNiche?.id, subNicheKey);
        if (dbResult) {
          const rawText = lang === 'en' ? (dbResult.analysis_en || dbResult.analysis_ar) : dbResult.analysis_ar;
          setNicheAnalysis(parseNicheAnalysis(rawText));
        } else {
          // Dynamic fallback
          const fallbackText = `## حكم السوق: الفرصة في ${userCountry === 'EG' ? 'مصر' : userCountry} تقدر بـ 7.5/10. هذا النيش يوفر نمواً مستقراً ومخاطرة منخفضة.
          ## بروفايل العميل المثالي:
          - العمر: 22 - 38 سنة.
          - الوظيفة: المهتمين بـ ${state.subNiche} والشباب الرقمي.
          - أكبر ألم: نقص المحتوى العربي التعليمي عالي الجودة والخدمات المنظمة.
          ## الخطوة التالية:
          لجذب هذا العميل، ستحتاج لاسم براند قوي وهوية بصرية تعكس الاحترافية .. اضغط التالي لنبدأ.`;
          setNicheAnalysis(parseNicheAnalysis(fallbackText));
        }
      }
      dispatch({ type: 'COMPLETE_STEP', step: 'niche-selection' });
    } catch (err) {
      console.error(err);
      alert(lang === 'en' ? 'Error analyzing niche' : 'حدث خطأ أثناء تحليل النيش');
    } finally {
      setIsAnalyzingNiche(false);
    }
  };

  // Tab 2: Brand naming generation
  const handleGenerateNames = async () => {
    if (selectedCatalogs.length === 0) {
      alert(lang === 'en' ? 'Please select at least one catalog.' : 'الرجاء تحديد كتالوج واحد على الأقل.');
      return;
    }

    setIsGeneratingNames(true);
    setGeneratedNames(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      const dbResult = await getBrandNames(selectedStyle);

      if (dbResult && dbResult.catalogs) {
        const results = {};
        const getRandomNames = (arr) => {
          if (!arr || arr.length === 0) return [];
          const filtered = arr.filter(item => {
            if (nameLanguage === 'ar') return item.type === 'ar' || item.type === 'hybrid';
            if (nameLanguage === 'en') return item.type === 'en' || item.type === 'hybrid';
            return true;
          });
          return [...filtered].sort(() => 0.5 - Math.random()).slice(0, 15); // Smaller grid
        };

        for (const catId of selectedCatalogs) {
          if (dbResult.catalogs[catId]) {
            results[catId] = getRandomNames(dbResult.catalogs[catId]);
          }
        }
        setGeneratedNames(results);
      } else {
        // Fallback names
        setGeneratedNames({
          fallback: [
            { name: "NovaTrend", meaning_ar: "الاتجاه الجديد للموضة والابتكار", meaning_en: "New trend of fashion and innovation", type: "en" },
            { name: "رونق | Rawnaq", meaning_ar: "جمال وبهاء العلامة التجارية", meaning_en: "Beauty and elegance of the brand", type: "hybrid" },
            { name: "أثير | Aether", meaning_ar: "نقي وعالي الجودة وجميل", meaning_en: "Pure, high quality and beautiful", type: "ar" }
          ]
        });
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'en' ? 'Error generating names' : 'حدث خطأ أثناء ابتكار الأسماء');
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const handleNameSelect = (name) => {
    setCustomNameInput(name);
    dispatch({ type: 'SET_FIELD', field: 'brandName', value: name });
  };

  const handleConfirmName = () => {
    if (!customNameInput) return;
    dispatch({ type: 'SET_FIELD', field: 'brandName', value: customNameInput });
    dispatch({ type: 'COMPLETE_STEP', step: 'brand-naming' });
    setActiveTab('identity');
  };

  // Tab 3: Visual identity picker and analysis
  const handleColorChange = (type, hex) => {
    if (type === 'primary') {
      setPrimaryColor(hex);
      dispatch({ type: 'SET_FIELD', field: 'primaryColor', value: hex });
    } else if (type === 'secondary') {
      setSecondaryColor(hex);
      dispatch({ type: 'SET_FIELD', field: 'secondaryColor', value: hex });
    } else if (type === 'accent') {
      setAccentColor(hex);
      dispatch({ type: 'SET_FIELD', field: 'accentColor', value: hex });
    }
    setColorAnalysis(null);
  };

  const handlePresetSelect = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setAccentColor(preset.accent);
    dispatch({ type: 'SET_FIELD', field: 'primaryColor', value: preset.primary });
    dispatch({ type: 'SET_FIELD', field: 'secondaryColor', value: preset.secondary });
    dispatch({ type: 'SET_FIELD', field: 'accentColor', value: preset.accent });
    setColorAnalysis(null);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoPreview(ev.target.result);
        dispatch({ type: 'SET_FIELD', field: 'logo', value: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeColors = async () => {
    setIsAnalyzingColors(true);
    setColorAnalysis(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      // Find matching preset psychology fallback
      const activePreset = PRESETS_PALETTES.find(p => p.primary === primaryColor) || { name: 'Blue' };
      const dbResult = await getColorAnalysis(activePreset.name.replace(' ', '').toLowerCase());
      if (dbResult) {
        setColorAnalysis(dbResult);
      } else {
        setColorAnalysis({
          psychology_ar: "هذا التناسق اللوني يعطي طابعاً احترافياً وموثوقاً لمشروعك، ويزيد من إحساس الالتزام والجودة العالية.",
          psychology_en: "This color combination gives a highly professional and trustworthy character to your brand, enhancing user focus.",
          brand_tone_ar: "نبرة واثقة، قوية، وموجهة للنتائج",
          brand_tone_en: "Confident, powerful, and results-oriented",
          font_pairings_ar: "Cairo / Tajawal",
          font_pairings_en: "Outfit / Inter",
          recommended_industries_ar: ["الخدمات والتعليم", "التقنية والـ SaaS", "التجارة الاحترافية"],
          recommended_industries_en: ["Services & Education", "Tech & SaaS", "Professional E-commerce"],
          dos_and_donts_ar: "افعل: استخدم اللون الأساسي في أزرار الدعوة للإجراء (CTA).\nلا تفعل: تجنب دمج نصوص باهتة فوق اللون الأساسي للحفاظ على التباين.",
          dos_and_donts_en: "Do: Use the primary color for Call-to-Action buttons.\nDon't: Avoid low-contrast text on primary background."
        });
      }
      dispatch({ type: 'COMPLETE_STEP', step: 'visual-identity' });
      dispatch({ type: 'COMPLETE_STEP', step: 'analysis-identity' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingColors(false);
    }
  };

  return (
    <div className="ai-container animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 3 TABS CONTAINER */}
      <div className="ai-tabs-header">
        <button 
          onClick={() => setActiveTab('niche')}
          className={`ai-tab-btn ${activeTab === 'niche' ? 'active' : ''} ${(state.completedSteps || []).includes('niche-selection') ? 'completed' : ''}`}
        >
          <div className="ai-tab-status" />
          <span>🎯 {lang === 'en' ? 'Niche Selection' : 'اختيار النيش'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('name')}
          disabled={!state.niche}
          className={`ai-tab-btn ${activeTab === 'name' ? 'active' : ''} ${(state.completedSteps || []).includes('brand-naming') ? 'completed' : ''}`}
        >
          <div className="ai-tab-status" />
          <span>🪄 {lang === 'en' ? 'Brand Naming' : 'اسم البراند'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('identity')}
          disabled={!state.brandName || !state.niche}
          className={`ai-tab-btn ${activeTab === 'identity' ? 'active' : ''} ${(state.completedSteps || []).includes('visual-identity') ? 'completed' : ''}`}
        >
          <div className="ai-tab-status" />
          <span>🎨 {lang === 'en' ? 'Visual Identity' : 'الهوية البصرية'}</span>
        </button>
      </div>

      {/* ──────────────── TAB 1: NICHE SELECTION ──────────────── */}
      {activeTab === 'niche' && (
        <div className="ai-panel">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
              {lang === 'en' ? 'Strategic Niche Selection' : 'تحديد نيش البزنس الخاص بك'}
            </h2>
            <p style={{ fontSize: '13px', color: '#8B96A8', lineHeight: '1.6' }}>
              {lang === 'en' 
                ? 'Choose your primary field. Beginner level filters complex/high-capital niches automatically.' 
                : 'حدد مجالك الأساسي، يقوم النظام بفلترة المجالات حسب مستواك لضمان بداية آمنة ومربحة.'}
            </p>
          </div>

          {/* Niches Grid */}
          {loadingNiches ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div className="td-spinner" />
            </div>
          ) : (
            <div className="niche-grid" style={{ marginBottom: '24px' }}>
              {niches.map(n => {
                const theme = NICHE_THEMES[n.id] || DEFAULT_THEME;
                const isSelected = state.niche === n.id;
                return (
                  <div 
                    key={n.id}
                    className={`niche-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleNicheSelect(n)}
                    style={{ 
                      '--accent-color': theme.color,
                      '--accent-rgb': theme.rgb
                    }}
                  >
                    <div className="niche-icon" style={{ color: theme.color }}>{n.icon}</div>
                    <div className="niche-label">{lang === 'en' ? n.label_en : n.label_ar}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-niches List */}
          {selectedNiche && (
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '16px', fontWeight: 'bold' }}>
                {lang === 'en' ? 'Select Micro-Niche Idea:' : 'استكشف واكتشف التخصصات الدقيقة:'}
              </h4>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {(lang === 'en' ? (selectedNiche.ideas_en || []) : (selectedNiche.ideas_ar || [])).map((idea, i) => {
                  const isComplex = isNicheComplex(idea, selectedNiche.id);
                  const isBeginner = userLevel === 'beginner';
                  const badge = getMarketBadges(i);
                  const isActive = state.subNiche === idea;
                  const themeColor = NICHE_THEMES[selectedNiche.id]?.color || '#8B5CF6';

                  return (
                    <button 
                      key={i}
                      onClick={() => handleSubNicheSelect(idea)}
                      className={`micro-niche-btn ${isActive ? 'active' : ''}`}
                      style={{
                        '--accent-color': themeColor,
                        '--accent-rgb': NICHE_THEMES[selectedNiche.id]?.rgb || '139, 92, 246'
                      }}
                    >
                      {/* Dynamic market AI Badge */}
                      <span className={`market-badge ${badge.class}`}>{badge.text}</span>
                      
                      <span># {idea}</span>
                      
                      {isComplex && isBeginner && (
                        <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 'bold', marginLeft: '4px' }}>
                          ⚠️ {lang === 'en' ? '(Needs Exp)' : '(تحتاج خبرة)'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Niche Input */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#8B96A8', marginBottom: '8px', fontWeight: 'bold' }}>
                  💡 {lang === 'en' ? 'Have a different idea? Type your custom micro-niche here:' : 'لديك فكرة مختلفة؟ اكتب تخصصك الدقيق يدوياً هنا:'}
                </label>
                <input 
                  type="text"
                  className="td-input"
                  value={customNicheInput || (customNicheInput === '' && state.subNiche && !(lang === 'en' ? (selectedNiche.ideas_en || []) : (selectedNiche.ideas_ar || [])).includes(state.subNiche) ? state.subNiche : '')}
                  onChange={(e) => handleCustomNicheChange(e.target.value)}
                  placeholder={lang === 'en' ? "e.g., Marketing for local real estate brokers" : "مثال: تسويق وتصوير فلل عقارية مستقلة"}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '12px'
                  }}
                />
              </div>

              {/* Current Selected Field */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', color: '#6B7A8D', fontWeight: 'bold' }}>
                    {lang === 'en' ? 'SELECTED SPECIALIZATION' : 'التخصص المعتمد حالياً'}
                  </span>
                  <div style={{ fontSize: '15px', color: NICHE_THEMES[selectedNiche.id]?.color || '#fff', fontWeight: '900' }}>
                    {state.subNiche || (lang === 'en' ? 'Please select or type a niche' : 'الرجاء تحديد أو كتابة النيش')}
                  </div>
                </div>

                <button 
                  onClick={handleAnalyzeNiche}
                  disabled={isAnalyzingNiche || !state.subNiche}
                  className="td-btn-primary"
                  style={{
                    background: NICHE_THEMES[selectedNiche.id]?.color || '#8B5CF6',
                    width: 'auto',
                    padding: '12px 28px',
                    borderRadius: '12px',
                    margin: 0
                  }}
                >
                  {isAnalyzingNiche ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="td-spinner" /> {lang === 'en' ? 'Analyzing...' : 'جاري التحليل...'}
                    </span>
                  ) : (
                    <span>🤖 {lang === 'en' ? 'Analyze Niche' : 'تحليل واكتشاف الفرصة'}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Verdict and ICP result block */}
          {nicheAnalysis && !isAnalyzingNiche && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Score & Verdict Card */}
                <div className="result-card" style={{ '--accent-color': '#10B981', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', 
                    border: '3px solid #10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>8.5</span>
                    <span style={{ fontSize: '9px', color: '#8B96A8', fontWeight: 'bold' }}>/10</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#10B981', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
                      ⚖️ {lang === 'en' ? 'Market Verdict & Potential' : 'حكم السوق وقوة الفرصة'}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: '#E8EDF5', lineHeight: '1.6', margin: 0 }}>
                      {nicheAnalysis.verdict}
                    </p>
                  </div>
                </div>

                {/* Customer Profile Card */}
                <div className="result-card" style={{ '--accent-color': '#3B82F6' }}>
                  <div className="result-card-header">
                    <span>👥</span>
                    <span className="result-card-title">{lang === 'en' ? 'Ideal Customer Profile (ICP)' : 'بروفايل العميل المثالي'}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="icp-item-card">
                      <div className="icp-item-label">{lang === 'en' ? 'Demographics' : 'العمر والوظيفة'}</div>
                      <div className="icp-item-val">{nicheAnalysis.icp.age} · {nicheAnalysis.icp.job}</div>
                    </div>
                    <div className="icp-item-card">
                      <div className="icp-item-label">{lang === 'en' ? 'Core Pain Point' : 'أكبر ألم واحتياج'}</div>
                      <div className="icp-item-val">{nicheAnalysis.icp.pain}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transition Next step */}
              <div className="transition-banner">
                <div style={{ fontSize: '13px', color: '#E8EDF5', lineHeight: '1.6', maxWidth: '600px' }}>
                  {nicheAnalysis.nextStep}
                </div>
                <button 
                  onClick={() => setActiveTab('name')}
                  className="td-btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    width: 'auto',
                    padding: '10px 24px',
                    borderRadius: '30px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  {lang === 'en' ? 'Confirm & Go to Brand Name ➡️' : 'تأكيد والذهاب لاسم البراند ➡️'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 2: BRAND NAMING ──────────────── */}
      {activeTab === 'name' && (
        <div className="ai-panel">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
              {lang === 'en' ? 'Brand Naming Studio' : 'منصة توليد اسم البراند'}
            </h2>
            <p style={{ fontSize: '13px', color: '#8B96A8', lineHeight: '1.6' }}>
              {lang === 'en' 
                ? 'Generate premium brand names tailored to your selected niche, or configure your parameters manually.' 
                : 'ابتكر اسماً مميزاً يعكس قوتك. يمكنك استخدام الكتالوج التلقائي أو إدخال إعدادات دقيقة يدوياً.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start', marginBottom: '28px' }}>
            {/* Manual controls side */}
            <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
              
              {/* Category */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7A8D', marginBottom: '8px' }}>
                  {lang === 'en' ? 'BUSINESS CATEGORY' : 'تصنيف البزنس الرئيسي'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {BRAND_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNamingCategory(cat.id)}
                      style={{
                        flex: 1, padding: '8px 4px', fontSize: '11px', borderRadius: '8px', fontWeight: 'bold',
                        background: namingCategory === cat.id ? 'rgba(236, 72, 153, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                        border: `1px solid ${namingCategory === cat.id ? '#EC4899' : 'rgba(255, 255, 255, 0.06)'}`,
                        color: namingCategory === cat.id ? '#fff' : '#8B96A8',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>{cat.icon}</span>
                      {lang === 'en' ? cat.label_en : cat.label_ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Sub-niche detail */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7A8D', marginBottom: '8px' }}>
                  {lang === 'en' ? 'SELECT SECTOR DETAIL' : 'اختر القطاع التفصيلي'}
                </label>
                <select 
                  className="td-input"
                  value={selectedStyle || ''}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', fontSize: '13px' }}
                >
                  {currentStyles.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#111827' }}>
                      {s.icon} {lang === 'en' ? s.label_en : s.label_ar}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Option */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7A8D', marginBottom: '8px' }}>
                  {lang === 'en' ? 'BRAND NAME LANGUAGE' : 'لغة الأسماء المبتكرة'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'all', label: lang === 'en' ? 'Mixed' : 'مختلط' },
                    { id: 'ar', label: lang === 'en' ? 'Arabic' : 'عربي فقط' },
                    { id: 'en', label: lang === 'en' ? 'English' : 'إنجليزي فقط' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setNameLanguage(opt.id)}
                      style={{
                        flex: 1, padding: '6px 12px', fontSize: '12px', borderRadius: '8px', fontWeight: 'bold',
                        background: nameLanguage === opt.id ? '#EC4899' : 'rgba(0, 0, 0, 0.2)',
                        border: `1px solid ${nameLanguage === opt.id ? '#EC4899' : 'rgba(255, 255, 255, 0.06)'}`,
                        color: nameLanguage === opt.id ? '#fff' : '#8B96A8',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalogs checklist */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6B7A8D', marginBottom: '8px' }}>
                  {lang === 'en' ? 'SELECT CATALOGS TO LOAD' : 'حدد كتالوجات الأسماء المستهدفة'}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {currentCatalogs.map(cat => {
                    const isChecked = selectedCatalogs.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCatalogs(prev => isChecked ? prev.filter(id => id !== cat.id) : [...prev, cat.id]);
                        }}
                        style={{
                          padding: '6px 12px', fontSize: '11px', borderRadius: '20px', fontWeight: 'bold',
                          background: isChecked ? 'rgba(236, 72, 153, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                          border: `1px solid ${isChecked ? '#EC4899' : 'rgba(255, 255, 255, 0.05)'}`,
                          color: isChecked ? '#fff' : '#9CA3AF',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {lang === 'en' ? cat.label_en : cat.label_ar}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGenerateNames}
                disabled={isGeneratingNames || selectedCatalogs.length === 0}
                className="td-btn-primary"
                style={{
                  background: '#EC4899',
                  color: '#fff',
                  borderRadius: '12px'
                }}
              >
                {isGeneratingNames ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span className="td-spinner" /> {lang === 'en' ? 'Generating...' : 'جاري التوليد...'}
                  </span>
                ) : (
                  <span>🪄 {lang === 'en' ? 'Generate Custom Names' : 'توليد المقترحات الذكية'}</span>
                )}
              </button>

            </div>

            {/* Generated results grid */}
            <div style={{ background: 'rgba(0, 0, 0, 0.15)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '20px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '13px', color: '#6B7A8D', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                ✨ {lang === 'en' ? 'Generated Brand Name Proposals' : 'قائمة أسماء البراند المقترحة'}
              </h4>

              {generatedNames ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {Object.keys(generatedNames).map(catId => {
                    const catDef = currentCatalogs.find(c => c.id === catId);
                    const catTitle = catDef ? (lang === 'en' ? catDef.label_en : catDef.label_ar) : catId;
                    const items = generatedNames[catId];
                    if (!items || items.length === 0) return null;

                    return (
                      <div key={catId}>
                        <div style={{ fontSize: '12px', color: '#EC4899', fontWeight: 'bold', marginBottom: '8px' }}>
                          📁 {catTitle}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                          {items.map(item => (
                            <div
                              key={item.name}
                              onClick={() => handleNameSelect(item.name)}
                              className="td-result-card"
                              style={{
                                padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)',
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                                <div style={{ fontSize: '11px', color: '#8B96A8', marginTop: '2px' }}>
                                  "{lang === 'en' ? item.meaning_en : item.meaning_ar}"
                                </div>
                              </div>
                              <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', background: 'rgba(236,72,153,0.1)', color: '#EC4899', borderRadius: '6px' }}>
                                {item.type === 'ar' ? 'عربي' : item.type === 'en' ? 'EN' : 'Hybrid'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4, textAlign: 'center' }}>
                  <span style={{ fontSize: '40px', marginBottom: '10px' }}>💡</span>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{lang === 'en' ? 'Select parameters on the left' : 'حدد الإعدادات والكتالوجات على اليسار'}</div>
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>{lang === 'en' ? 'Then click Generate to extract names' : 'ثم اضغط توليد لعرض المقترحات هنا'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Brand Name input */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#8B96A8', marginBottom: '10px' }}>
                👑 {lang === 'en' ? 'Confirm Final Brand Name' : 'اسم البراند المعتمد النهائي'}
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="td-input"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder={lang === 'en' ? "NovaTrend" : "رونق"}
                  style={{
                    fontSize: '18px', fontWeight: '900', textAlign: 'center', height: '52px', borderRadius: '12px',
                    borderColor: 'rgba(236, 72, 153, 0.3)', color: '#EC4899', background: 'rgba(236, 72, 153, 0.03)'
                  }}
                />
                <button
                  onClick={handleConfirmName}
                  disabled={!customNameInput}
                  className="td-btn-primary"
                  style={{
                    margin: 0, width: 'auto', padding: '0 24px', background: '#EC4899', height: '52px',
                    borderRadius: '12px', fontSize: '14px', fontWeight: 'bold'
                  }}
                >
                  {lang === 'en' ? 'Confirm ➡️' : 'اعتماد الاسم ➡️'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: VISUAL IDENTITY ──────────────── */}
      {activeTab === 'identity' && (
        <div className="ai-panel">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
              {lang === 'en' ? 'Visual Identity & Branding' : 'الهوية البصرية وتصميم البراند'}
            </h2>
            <p style={{ fontSize: '13px', color: '#8B96A8', lineHeight: '1.6' }}>
              {lang === 'en' 
                ? 'Select up to 3 colors for your brand identity. View simulator mockup and analyze psychological impact.' 
                : 'اختر لوحة الألوان الخاصة بالبراند (حتى 3 ألوان). اختبر كيف تبدو على نموذج الموقع وحلل أثرها النفسي.'}
            </p>
          </div>

          {/* Preset Palettes */}
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B7A8D', marginBottom: '12px' }}>
              💡 {lang === 'en' ? 'POPULAR 3-COLOR PALETTES' : 'باليتات ألوان ثلاثية مقترحة'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {PRESETS_PALETTES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    padding: '8px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.primary }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.secondary }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.accent }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold' }}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
            {/* Color Pickers & Logo Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold', marginBottom: '14px' }}>
                  {lang === 'en' ? 'Color Palette Customization' : 'تخصيص عجلة الألوان الثلاثية'}
                </h4>
                
                <div className="color-circle-container" style={{ marginBottom: '16px' }}>
                  <div className="color-input-card">
                    <input type="color" value={primaryColor} onChange={(e) => handleColorChange('primary', e.target.value)} />
                    <div>
                      <div style={{ fontSize: '9px', color: '#6B7A8D', fontWeight: 'bold' }}>{lang === 'en' ? 'PRIMARY' : 'الأساسي'}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{primaryColor}</div>
                    </div>
                  </div>

                  <div className="color-input-card">
                    <input type="color" value={secondaryColor} onChange={(e) => handleColorChange('secondary', e.target.value)} />
                    <div>
                      <div style={{ fontSize: '9px', color: '#6B7A8D', fontWeight: 'bold' }}>{lang === 'en' ? 'SECONDARY' : 'الثانوي'}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{secondaryColor}</div>
                    </div>
                  </div>

                  <div className="color-input-card">
                    <input type="color" value={accentColor} onChange={(e) => handleColorChange('accent', e.target.value)} />
                    <div>
                      <div style={{ fontSize: '9px', color: '#6B7A8D', fontWeight: 'bold' }}>{lang === 'en' ? 'ACCENT' : 'الفرعي / الزر'}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{accentColor}</div>
                    </div>
                  </div>
                </div>

                {/* Logo upload mockup */}
                <div style={{ position: 'relative', border: '2px dashed rgba(255, 255, 255, 0.08)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', minHeight: '110px', cursor: 'pointer', overflow: 'hidden', background: 'rgba(0,0,0,0.1)' }}>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                  {!logoPreview ? (
                    <>
                      <div style={{ fontSize: '20px', marginBottom: '6px' }}>☁️</div>
                      <p style={{ fontSize: '11px', color: '#8B96A8', fontWeight: 'bold', margin: 0 }}>
                        {lang === 'en' ? 'Upload logo for simulation' : 'ارفع شعار البراند لمعاينته'}
                      </p>
                    </>
                  ) : (
                    <img src={logoPreview} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '12px', zIndex: 0 }} alt="Logo" />
                  )}
                </div>

                <button
                  onClick={handleAnalyzeColors}
                  disabled={isAnalyzingColors || !primaryColor}
                  className="td-btn-primary"
                  style={{
                    marginTop: '16px', background: primaryColor, color: '#fff', borderRadius: '12px'
                  }}
                >
                  {isAnalyzingColors ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <span className="td-spinner" /> {lang === 'en' ? 'Analyzing...' : 'جاري التحليل...'}
                    </span>
                  ) : (
                    <span>🤖 {lang === 'en' ? 'Analyze Colors & Apply Identity' : 'تحليل سيكولوجية الألوان وتطبيق الهوية'}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Mockup Simulator */}
            <div style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '300px' }}>
              <div style={{ background: '#0f172a', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                <div style={{ fontSize: '10px', color: '#8B96A8', fontFamily: 'monospace', marginLeft: '12px' }}>{state.brandName || 'brand_preview'}</div>
              </div>
              
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: secondaryColor }}>
                {/* Fake Navbar */}
                <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                    {logoPreview ? <img src={logoPreview} style={{ height: '100%', objectFit: 'contain' }} /> : <div style={{ color: '#fff', fontSize: '13px', fontWeight: '900' }}>{state.brandName || 'LOGO'}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '30px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                    <div style={{ width: '30px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                  </div>
                </div>
                
                {/* Fake Hero Section */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative', textAlign: 'center' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '150px', height: '150px', borderRadius: '50%', background: primaryColor, filter: 'blur(60px)', opacity: 0.2, pointerEvents: 'none' }} />
                  
                  <h4 style={{ fontSize: '18px', fontWeight: '900', color: primaryColor, marginBottom: '8px' }}>
                    {state.brandName ? `${state.brandName} Platform` : (lang === 'en' ? 'Start Your Project' : 'ابدأ مشروعك الاحترافي')}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 16px 0', maxWidth: '240px' }}>
                    {lang === 'en' ? 'Tailored digital solutions built in minutes.' : 'حلول رقمية متكاملة مصممة لنوع عملك بدقة.'}
                  </p>
                  
                  <button 
                    style={{ 
                      padding: '8px 20px', borderRadius: '30px', fontSize: '11px', fontWeight: 'bold', color: '#fff', 
                      background: accentColor, border: 'none', cursor: 'pointer', boxShadow: `0 4px 10px ${accentColor}40`
                    }}
                  >
                    {lang === 'en' ? 'Get Started' : 'ابدأ التجربة'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Color Analysis details */}
          {colorAnalysis && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div className="result-card" style={{ '--accent-color': primaryColor }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span>🧠</span>
                  <h4 style={{ color: primaryColor, margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                    {lang === 'en' ? 'Color Psychology & Tone' : 'الأثر السيكولوجي للهوية'}
                  </h4>
                </div>
                <p style={{ fontSize: '12px', lineHeight: 1.7, color: '#E8EDF5', margin: 0 }}>
                  {lang === 'en' ? colorAnalysis.psychology_en : colorAnalysis.psychology_ar}
                </p>
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#8B96A8' }}>
                  🎙️ {lang === 'en' ? 'Tone:' : 'نبرة صوت البراند:'} <strong style={{ color: '#fff' }}>{lang === 'en' ? colorAnalysis.brand_tone_en : colorAnalysis.brand_tone_ar}</strong>
                </div>
              </div>

              <div className="result-card" style={{ '--accent-color': accentColor }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span>📝</span>
                  <h4 style={{ color: accentColor, margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                    {lang === 'en' ? 'Visual Design Assets' : 'دليل الخطوط والمجالات'}
                  </h4>
                </div>
                <div style={{ fontSize: '12px', color: '#E8EDF5' }}>
                  <div>🔤 {lang === 'en' ? 'Font Pairings:' : 'تنسيق الخطوط:'} <strong style={{ color: '#fff' }}>{lang === 'en' ? colorAnalysis.font_pairings_en : colorAnalysis.font_pairings_ar}</strong></div>
                  <div style={{ marginTop: '10px' }}>
                    🏢 {lang === 'en' ? 'Best For:' : 'الأفضل لمجالات:'}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {(lang === 'en' ? colorAnalysis.recommended_industries_en : colorAnalysis.recommended_industries_ar)?.map((ind, idx) => (
                        <span key={idx} style={{ padding: '2px 8px', fontSize: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

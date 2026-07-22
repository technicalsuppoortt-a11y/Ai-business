import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { getNiches, seedNiches } from '../../../services/nicheService';
import { getNicheAnalysis, getBrandNames, getBrandNichesDef, getColorAnalysis } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Wand2,
  Palette,
  Scale,
  Users,
  Lightbulb,
  Folder,
  Crown,
  UploadCloud,
  Brain,
  FileText,
  Type,
  Building2,
  Globe,
  Bot,
  Mic,
  HeartPulse,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  Sparkles,
  Cpu,
  Zap,
  Flame,
  Coins,
  TrendingUp,
  Briefcase,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Copy,
  Search,
  AlertTriangle,
  ShoppingCart,
  Gem,
  Droplets,
  Layout,
  HelpCircle,
  Star,
  Bookmark,
  CheckSquare,
  Square,
  Filter,
  RefreshCw,
  Share2
} from 'lucide-react';
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

// Vector Icon Mapper for Niche Categories
const NICHE_ICON_MAP = {
  ai: Cpu,
  business: Briefcase,
  creative: Palette,
  fitness: HeartPulse,
  marketing: Megaphone,
  realestate: Building2
};

const BRAND_CATEGORIES = [
  { id: 'ecom', label_ar: 'التجارة الإلكترونية', label_en: 'E-commerce', sub_ar: 'منتجات ملموسة', sub_en: 'Physical Products', IconComp: ShoppingCart },
  { id: 'digital', label_ar: 'المنتجات الرقمية', label_en: 'Digital Products', sub_ar: 'كورسات، قوالب', sub_en: 'Courses, Templates', IconComp: Gem },
  { id: 'services', label_ar: 'الخدمات والأعمال', label_en: 'Services', sub_ar: 'تسويق، استشارات', sub_en: 'Marketing, Consulting', IconComp: Briefcase }
];

const PRESETS_PALETTES = [
  { name: "Neon Cyan", primary: "#06b6d4", secondary: "#0f172a", accent: "#f43f5e" }, 
  { name: "Royal Purple", primary: "#8b5cf6", secondary: "#1e1b4b", accent: "#10b981" },
  { name: "Emerald Green", primary: "#10b981", secondary: "#064e3b", accent: "#f59e0b" }, 
  { name: "Ocean Blue", primary: "#1e40af", secondary: "#f8fafc", accent: "#ef4444" },
  { name: "Golden Luxury", primary: "#d4af37", secondary: "#171717", accent: "#ffffff" }, 
  { name: "Sunset Orange", primary: "#f97316", secondary: "#fff7ed", accent: "#0f766e" }
];

// Custom Glass Dropdown
function CustomDropdown({ value, onChange, options, placeholder }) {
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
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <div 
        className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} color="var(--text3)" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="custom-dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {options.map(opt => (
              <div
                key={String(opt.value)}
                className={`custom-dropdown-option ${String(opt.value) === String(value) ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && <Check size={14} color="var(--accent)" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalysisIdentity() {
  const { state, dispatch } = useApp();
  const toastContext = useToast();
  const toast = toastContext?.toast || ((msg) => console.log(msg));

  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  const userLevel = state.user?.level || 'beginner';
  const userCountry = state.user?.country || 'EG';

  // Dual Analysis Mode state
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  // Tabs management
  const [activeTab, setActiveTab] = useState('niche'); // 'niche', 'name', 'identity'

  // Tab 1: Niche selection states
  const [niches, setNiches] = useState([]);
  const [loadingNiches, setLoadingNiches] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [customNicheInput, setCustomNicheInput] = useState('');
  const [microSearchQuery, setMicroSearchQuery] = useState('');
  const [showAllMicroNiches, setShowAllMicroNiches] = useState(false);
  const [isAnalyzingNiche, setIsAnalyzingNiche] = useState(false);
  const [nicheAnalysis, setNicheAnalysis] = useState(null);

  // Tab 2: Brand naming states
  const [namingCategory, setNamingCategory] = useState('ecom');
  const [dynamicStyles, setDynamicStyles] = useState({});
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedCatalogs, setSelectedCatalogs] = useState([]);
  const [pinnedNames, setPinnedNames] = useState([]);
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
    setMicroSearchQuery('');
    setShowAllMicroNiches(false);
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

  // Get dynamic badges for market indicators with Lucide Icons
  const getMarketBadges = (index) => {
    const badges = [
      { text: lang === 'en' ? 'Fast Trend' : 'تريند سريع', class: 'trend', IconComp: Flame },
      { text: lang === 'en' ? 'High Profit' : 'ربحية عالية', class: 'profit', IconComp: Coins },
      { text: lang === 'en' ? 'Stable Demand' : 'طلب مستقر', class: 'stable', IconComp: TrendingUp },
      { text: lang === 'en' ? 'Freelance Ready' : 'مناسب للعمل الحر', class: 'freelance', IconComp: Briefcase }
    ];
    return badges[index % badges.length];
  };

  // Toggle all catalogs selection
  const handleToggleAllCatalogs = () => {
    if (selectedCatalogs.length === currentCatalogs.length) {
      setSelectedCatalogs([]);
    } else {
      setSelectedCatalogs(currentCatalogs.map(c => c.id));
    }
  };

  // Pin / Favorite brand name proposal
  const handleTogglePinName = (name) => {
    setPinnedNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
    toast(
      pinnedNames.includes(name) 
        ? (lang === 'en' ? `Removed "${name}" from pinned!` : `تم إزالة "${name}" من المفضلة!`)
        : (lang === 'en' ? `Pinned "${name}" to favorites!` : `تم تثبيت "${name}" في المفضلة!`),
      'info'
    );
  };

  // 1-Click Copy Brand Name
  const handleCopyName = (name, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(name);
    toast(lang === 'en' ? `Copied "${name}" to clipboard!` : `تم نسخ "${name}" إلى الحافظة!`, 'success');
  };

  // Copy Color Palette
  const handleCopyColorPalette = () => {
    const paletteStr = `Primary: ${primaryColor}, Secondary: ${secondaryColor}, Accent: ${accentColor}`;
    navigator.clipboard.writeText(paletteStr);
    toast(lang === 'en' ? 'Color palette copied to clipboard!' : 'تم نسخ باليت الألوان إلى الحافظة!', 'success');
  };

  // Copy Analysis Results
  const handleCopyAnalysis = () => {
    if (!nicheAnalysis) return;
    const summaryStr = `Verdict: ${nicheAnalysis.verdict}\nICP: ${nicheAnalysis.icp.age} | ${nicheAnalysis.icp.job}\nNext: ${nicheAnalysis.nextStep}`;
    navigator.clipboard.writeText(summaryStr);
    toast(lang === 'en' ? 'Analysis copied to clipboard!' : 'تم نسخ نتيجة التحليل إلى الحافظة!', 'success');
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
      if (analysisMode === 'live') {
        const liveData = await dispatchLiveAiAnalysis({
          toolId: 'niche-selection',
          inputs: { nicheName: selectedNiche?.label_ar || state.niche, subNiche: state.subNiche },
          context: { niche: state.niche, user: state.user },
          lang
        });
        if (liveData) {
          const verdict = liveData.market_overview || (lang === 'en' ? `Live AI analysis score: ${liveData.growth_rate || '+20%'}` : `حكم الذكاء الاصطناعي المباشر: معدل النمو ${liveData.growth_rate || '+20%'}`);
          const icp = {
            age: liveData.target_audience?.demographics || '22 - 45',
            job: liveData.target_audience?.pain_points?.[0] || 'Target Customer',
            pain: Array.isArray(liveData.target_audience?.pain_points) ? liveData.target_audience.pain_points.join(', ') : 'Market Needs'
          };
          const nextStep = Array.isArray(liveData.first_steps) ? liveData.first_steps.join(' -> ') : (lang === 'en' ? 'Proceed to brand naming.' : 'الانتقال لااختيار اسم البراند.');
          setNicheAnalysis({ verdict, icp, nextStep });
        }
      } else {
        await new Promise(r => setTimeout(r, 800));

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
      }
      dispatch({ type: 'COMPLETE_STEP', step: 'niche-selection' });
      toast(lang === 'en' ? 'Niche opportunity analyzed!' : 'تم تحليل فرصة النيش بنجاح!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingNiche(false);
    }
  };

  // Tab 2: Brand naming generation
  const handleGenerateNames = async () => {
    if (selectedCatalogs.length === 0 && analysisMode !== 'live') {
      toast(lang === 'en' ? 'Please select at least one catalog.' : 'الرجاء تحديد كتالوج واحد على الأقل.', 'warning');
      return;
    }

    setIsGeneratingNames(true);
    setGeneratedNames(null);

    try {
      if (analysisMode === 'live') {
        const liveData = await dispatchLiveAiAnalysis({
          toolId: 'brand-naming',
          inputs: { category: namingCategory, style: selectedStyle, nameLanguage, catalogs: selectedCatalogs },
          context: { niche: state.niche },
          lang
        });
        if (liveData && liveData.names) {
          const results = {
            live_ai: liveData.names.map(n => ({
              name: n.name,
              meaning_ar: n.slogan || n.meaning,
              meaning_en: n.slogan || n.meaning,
              type: n.style || 'hybrid'
            }))
          };
          setGeneratedNames(results);
        }
      } else {
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
            return [...filtered].sort(() => 0.5 - Math.random()).slice(0, 15);
          };

          for (const catId of selectedCatalogs) {
            if (dbResult.catalogs[catId]) {
              results[catId] = getRandomNames(dbResult.catalogs[catId]);
            }
          }
          setGeneratedNames(results);
        } else {
          setGeneratedNames({
            fallback: [
              { name: "NovaTrend", meaning_ar: "الاتجاه الجديد للموضة والابتكار", meaning_en: "New trend of fashion and innovation", type: "en" },
              { name: "رونق | Rawnaq", meaning_ar: "جمال وبهاء العلامة التجارية", meaning_en: "Beauty and elegance of the brand", type: "hybrid" },
              { name: "أثير | Aether", meaning_ar: "نقي وعالي الجودة وجميل", meaning_en: "Pure, high quality and beautiful", type: "ar" }
            ]
          });
        }
      }
      toast(lang === 'en' ? 'Brand name proposals generated!' : 'تم توليد مقترحات أسماء البراند!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const handleNameSelect = (name) => {
    setCustomNameInput(name);
    dispatch({ type: 'SET_FIELD', field: 'brandName', value: name });
    toast(lang === 'en' ? `Selected "${name}"` : `تم اختيار "${name}"`, 'info');
  };

  const handleConfirmName = () => {
    if (!customNameInput) return;
    dispatch({ type: 'SET_FIELD', field: 'brandName', value: customNameInput });
    dispatch({ type: 'COMPLETE_STEP', step: 'brand-naming' });
    toast(lang === 'en' ? `Brand name "${customNameInput}" confirmed!` : `تم اعتماد اسم البراند "${customNameInput}"!`, 'success');
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
    toast(lang === 'en' ? `Applied "${preset.name}" palette!` : `تم تطبيق باليت "${preset.name}"!`, 'info');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoPreview(ev.target.result);
        dispatch({ type: 'SET_FIELD', field: 'logo', value: ev.target.result });
        toast(lang === 'en' ? 'Logo uploaded for mockup!' : 'تم رفع الشعار للمعاينة!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeColors = async () => {
    setIsAnalyzingColors(true);
    setColorAnalysis(null);
    try {
      if (analysisMode === 'live') {
        const liveData = await dispatchLiveAiAnalysis({
          toolId: 'visual-identity',
          inputs: { primaryColor, secondaryColor, accentColor },
          context: { niche: state.niche, brandName: state.brandName },
          lang
        });
        if (liveData) {
          setColorAnalysis({
            psychology_ar: liveData.psychology || 'تحليل مباشر بالذكاء الاصطناعي للهوية البصرية.',
            psychology_en: liveData.psychology || 'Live AI psychology analysis of visual identity.',
            brand_tone_ar: liveData.audience_perception || 'طابع احترافي ومميز',
            brand_tone_en: liveData.audience_perception || 'Professional brand tone',
            font_pairings_ar: liveData.recommended_fonts || 'Cairo / Tajawal',
            font_pairings_en: liveData.recommended_fonts || 'Inter / Roboto',
            recommended_industries_ar: [state.niche || 'التجارة الرقمية'],
            recommended_industries_en: [state.niche || 'Digital Business'],
            dos_and_donts_ar: Array.isArray(liveData.usage_tips) ? liveData.usage_tips.join('\n') : (liveData.usage_tips || ''),
            dos_and_donts_en: Array.isArray(liveData.usage_tips) ? liveData.usage_tips.join('\n') : (liveData.usage_tips || '')
          });
        }
      } else {
        await new Promise(r => setTimeout(r, 600));
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
      }
      dispatch({ type: 'COMPLETE_STEP', step: 'visual-identity' });
      dispatch({ type: 'COMPLETE_STEP', step: 'analysis-identity' });
      toast(lang === 'en' ? 'Visual identity applied!' : 'تم تطبيق الهوية البصرية بنجاح!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingColors(false);
    }
  };

  // Convert currentStyles to CustomDropdown Options
  const styleOptions = currentStyles.map(s => ({
    value: s.id,
    label: `${lang === 'en' ? s.label_en : s.label_ar}`
  }));

  // Filter Micro Niches based on Search Query
  const rawMicroIdeas = selectedNiche ? (lang === 'en' ? (selectedNiche.ideas_en || []) : (selectedNiche.ideas_ar || [])) : [];
  const filteredIdeas = rawMicroIdeas.filter(idea => 
    !microSearchQuery || idea.toLowerCase().includes(microSearchQuery.toLowerCase())
  );
  const displayedMicroNiches = showAllMicroNiches || microSearchQuery ? filteredIdeas : filteredIdeas.slice(0, 8);

  return (
    <div className="ai-container animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 3 TABS CONTAINER WITH FRAMER MOTION ANIMATED HIGHLIGHT */}
      <div className="ai-tabs-header">
        <button 
          onClick={() => setActiveTab('niche')}
          className={`ai-tab-btn ${activeTab === 'niche' ? 'active' : ''}`}
        >
          {activeTab === 'niche' && (
            <motion.div 
              layoutId="activeTabBadge" 
              className="ai-tab-bg-highlight" 
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Target size={16} style={{ zIndex: 1 }} />
          <span style={{ zIndex: 1 }}>{lang === 'en' ? 'Niche Selection' : 'اختيار النيش'}</span>
          {(state.completedSteps || []).includes('niche-selection') && (
            <CheckCircle2 size={14} color="#10B981" style={{ zIndex: 1 }} />
          )}
        </button>

        <button 
          onClick={() => setActiveTab('name')}
          disabled={!state.niche}
          className={`ai-tab-btn ${activeTab === 'name' ? 'active' : ''}`}
        >
          {activeTab === 'name' && (
            <motion.div 
              layoutId="activeTabBadge" 
              className="ai-tab-bg-highlight" 
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Wand2 size={16} style={{ zIndex: 1 }} />
          <span style={{ zIndex: 1 }}>{lang === 'en' ? 'Brand Naming' : 'اسم البراند'}</span>
          {(state.completedSteps || []).includes('brand-naming') && (
            <CheckCircle2 size={14} color="#10B981" style={{ zIndex: 1 }} />
          )}
        </button>

        <button 
          onClick={() => setActiveTab('identity')}
          disabled={!state.brandName || !state.niche}
          className={`ai-tab-btn ${activeTab === 'identity' ? 'active' : ''}`}
        >
          {activeTab === 'identity' && (
            <motion.div 
              layoutId="activeTabBadge" 
              className="ai-tab-bg-highlight" 
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Palette size={16} style={{ zIndex: 1 }} />
          <span style={{ zIndex: 1 }}>{lang === 'en' ? 'Visual Identity' : 'الهوية البصرية'}</span>
          {(state.completedSteps || []).includes('visual-identity') && (
            <CheckCircle2 size={14} color="#10B981" style={{ zIndex: 1 }} />
          )}
        </button>
      </div>

      {/* ──────────────── TAB 1: NICHE SELECTION ──────────────── */}
      {activeTab === 'niche' && (
        <motion.div 
          className="ai-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Target size={22} color="#6366F1" />
              <span>{lang === 'en' ? 'Strategic Niche Selection' : 'تحديد نيش البزنس الخاص بك'}</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: '1.6' }}>
              {lang === 'en' 
                ? 'Choose your primary field. Beginner level filters complex/high-capital niches automatically.' 
                : 'حدد مجالك الأساسي، يقوم النظام بفلترة المجالات حسب مستواك لضمان بداية آمنة ومربحة.'}
            </p>
          </div>

          {/* Niches Grid with Vector Icon Mapping */}
          {loadingNiches ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div className="td-spinner" />
            </div>
          ) : (
            <div className="niche-grid" style={{ marginBottom: '24px' }}>
              {niches.map(n => {
                const theme = NICHE_THEMES[n.id] || DEFAULT_THEME;
                const isSelected = state.niche === n.id;
                const NicheIconComp = NICHE_ICON_MAP[n.id] || Sparkles;
                return (
                  <motion.div 
                    key={n.id}
                    className={`niche-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleNicheSelect(n)}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      '--accent-color': theme.color,
                      '--accent-rgb': theme.rgb
                    }}
                  >
                    <div className="niche-icon" style={{ color: theme.color }}>
                      <NicheIconComp size={24} />
                    </div>
                    <div className="niche-label">{lang === 'en' ? n.label_en : n.label_ar}</div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Sub-niches Advanced List */}
          {selectedNiche && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '18px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: 12 }}>
                <h4 style={{ fontSize: '14px', color: '#fff', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="var(--accent)" />
                  <span>{lang === 'en' ? 'Select Micro-Niche Idea:' : 'استكشف واكتشف التخصصات الدقيقة الممتازة:'}</span>
                </h4>

                {/* Inline Search Filter Control */}
                <div className="micro-search-box">
                  <Search size={14} color="var(--text3)" />
                  <input 
                    type="text" 
                    value={microSearchQuery}
                    onChange={(e) => setMicroSearchQuery(e.target.value)}
                    placeholder={lang === 'en' ? 'Filter micro-niches...' : 'تصفية التخصصات الدقيقة...'}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                {displayedMicroNiches.map((idea, i) => {
                  const isComplex = isNicheComplex(idea, selectedNiche.id);
                  const isBeginner = userLevel === 'beginner';
                  const badge = getMarketBadges(i);
                  const isActive = state.subNiche === idea;
                  const themeColor = NICHE_THEMES[selectedNiche.id]?.color || '#8B5CF6';
                  const BadgeIcon = badge.IconComp;

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
                      <span className={`market-badge ${badge.class}`}>
                        <BadgeIcon size={10} />
                        <span>{badge.text}</span>
                      </span>
                      
                      <span># {idea}</span>
                      
                      {isComplex && isBeginner && (
                        <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <AlertTriangle size={12} />
                          <span>{lang === 'en' ? '(Needs Exp)' : '(تحتاج خبرة)'}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Show More / Show Less Toggle Button */}
              {rawMicroIdeas.length > 8 && !microSearchQuery && (
                <div style={{ marginBottom: 20 }}>
                  <button 
                    onClick={() => setShowAllMicroNiches(!showAllMicroNiches)}
                    className="action-pill-btn"
                  >
                    <span>{showAllMicroNiches ? (lang === 'en' ? 'Show Less' : 'عرض أقل') : (lang === 'en' ? `Show All (${rawMicroIdeas.length})` : `عرض الكل (${rawMicroIdeas.length})`)}</span>
                    <ChevronDown size={14} style={{ transform: showAllMicroNiches ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>
              )}

              {/* Custom Niche Input */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: 'var(--text2)', marginBottom: '8px', fontWeight: 'bold' }}>
                  <Lightbulb size={16} color="#F59E0B" />
                  <span>{lang === 'en' ? 'Have a custom idea? Type your micro-niche here:' : 'لديك فكرة مختلفة؟ اكتب تخصصك الدقيق يدوياً هنا:'}</span>
                </label>
                <input 
                  type="text"
                  className="setting-field-input"
                  value={customNicheInput || (customNicheInput === '' && state.subNiche && !rawMicroIdeas.includes(state.subNiche) ? state.subNiche : '')}
                  onChange={(e) => handleCustomNicheChange(e.target.value)}
                  placeholder={lang === 'en' ? "e.g., Marketing for local real estate brokers" : "مثال: تسويق وتصوير فلل عقارية مستقلة"}
                />
              </div>

              {/* Dual Mode Selector */}
              <div style={{ marginTop: 20 }}>
                <AnalysisModeSelector 
                  mode={analysisMode} 
                  onChange={setAnalysisMode} 
                  lang={lang} 
                  accentColor={NICHE_THEMES[selectedNiche.id]?.color || '#8B5CF6'} 
                />
              </div>

              {/* Current Selected Field & Analyze Button */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold' }}>
                    {lang === 'en' ? 'SELECTED SPECIALIZATION' : 'التخصص المعتمد حالياً'}
                  </span>
                  <div style={{ fontSize: '15px', color: NICHE_THEMES[selectedNiche.id]?.color || '#fff', fontWeight: '900' }}>
                    {state.subNiche || (lang === 'en' ? 'Please select or type a niche' : 'الرجاء تحديد أو كتابة النيش')}
                  </div>
                </div>

                <button 
                  onClick={handleAnalyzeNiche}
                  disabled={isAnalyzingNiche || !state.subNiche}
                  className="btn btn-primary"
                  style={{
                    background: NICHE_THEMES[selectedNiche.id]?.color || '#8B5CF6',
                    padding: '12px 28px',
                    borderRadius: '12px'
                  }}
                >
                  {isAnalyzingNiche ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="td-spinner" /> {lang === 'en' ? 'Analyzing...' : 'جاري التحليل...'}
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Cpu size={16} />
                      <span>{lang === 'en' ? 'Analyze Niche Opportunity' : 'تحليل واكتشاف الفرصة'}</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Verdict and ICP result block with Quick Action Bar */}
          {nicheAnalysis && !isAnalyzingNiche && (
            <motion.div 
              className="animate-fade-in" 
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Sticky Quick-Action Bar */}
              <div className="quick-action-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    padding: '4px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', fontSize: '12px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <Sparkles size={14} />
                    <span>{lang === 'en' ? 'Score: 8.5/10' : 'تقييم الفرصة: 8.5/10'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleCopyAnalysis} className="action-pill-btn">
                    <Copy size={14} />
                    <span>{lang === 'en' ? 'Copy Result' : 'نسخ النتائج'}</span>
                  </button>
                  <button onClick={() => toast(lang === 'en' ? 'Analysis saved!' : 'تم حفظ التحليل!', 'success')} className="action-pill-btn">
                    <Bookmark size={14} />
                    <span>{lang === 'en' ? 'Save Result' : 'حفظ في المفضلة'}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Score & Verdict Card */}
                <div className="result-card" style={{ '--accent-color': '#10B981', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', 
                    border: '3px solid #10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)', flexShrink: 0
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>8.5</span>
                    <span style={{ fontSize: '9px', color: 'var(--text3)', fontWeight: 'bold' }}>/10</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#10B981', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Scale size={16} />
                      <span>{lang === 'en' ? 'Market Verdict & Potential' : 'حكم السوق وقوة الفرصة'}</span>
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: '1.6', margin: 0 }}>
                      {nicheAnalysis.verdict}
                    </p>
                  </div>
                </div>

                {/* Customer Profile Card */}
                <div className="result-card" style={{ '--accent-color': '#3B82F6' }}>
                  <div className="result-card-header">
                    <Users size={18} color="#3B82F6" />
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
                <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6', maxWidth: '600px' }}>
                  {nicheAnalysis.nextStep}
                </div>
                <button 
                  onClick={() => setActiveTab('name')}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    padding: '12px 24px',
                    borderRadius: '30px'
                  }}
                >
                  <span>{lang === 'en' ? 'Go to Brand Naming' : 'الذهاب لاسم البراند'}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ──────────────── TAB 2: BRAND NAMING ──────────────── */}
      {activeTab === 'name' && (
        <motion.div 
          className="ai-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Wand2 size={22} color="#EC4899" />
              <span>{lang === 'en' ? 'Brand Naming Studio' : 'منصة توليد اسم البراند'}</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: '1.6' }}>
              {lang === 'en' 
                ? 'Generate premium brand names tailored to your selected niche, or configure your parameters manually.' 
                : 'ابتكر اسماً مميزاً يعكس قوتك. يمكنك استخدام الكتالوج التلقائي أو إدخال إعدادات دقيقة يدوياً.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start', marginBottom: '28px' }}>
            {/* Manual controls side */}
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '18px', padding: '24px' }}>
              
              {/* Category */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: '800', color: 'var(--text3)', marginBottom: '8px' }}>
                  <Building2 size={14} color="#EC4899" />
                  <span>{lang === 'en' ? 'BUSINESS CATEGORY' : 'تصنيف البزنس الرئيسي'}</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {BRAND_CATEGORIES.map(cat => {
                    const CatIcon = cat.IconComp;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setNamingCategory(cat.id)}
                        style={{
                          flex: 1, padding: '10px 6px', fontSize: '11px', borderRadius: '10px', fontWeight: '800',
                          background: namingCategory === cat.id ? 'rgba(236, 72, 153, 0.18)' : 'var(--bg2)',
                          border: `1px solid ${namingCategory === cat.id ? '#EC4899' : 'var(--line)'}`,
                          color: namingCategory === cat.id ? '#fff' : 'var(--text3)',
                          cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                        }}
                      >
                        <CatIcon size={16} />
                        <span>{lang === 'en' ? cat.label_en : cat.label_ar}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style Sub-niche detail Professional Custom Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: '800', color: 'var(--text3)', marginBottom: '8px' }}>
                  <Type size={14} color="#EC4899" />
                  <span>{lang === 'en' ? 'SELECT SECTOR DETAIL' : 'اختر القطاع التفصيلي'}</span>
                </label>
                <CustomDropdown 
                  value={selectedStyle || ''}
                  onChange={v => setSelectedStyle(v)}
                  options={styleOptions}
                  placeholder={lang === 'en' ? 'Select Sector Detail...' : 'اختر القطاع التفصيلي...'}
                />
              </div>

              {/* Language Option */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: '800', color: 'var(--text3)', marginBottom: '8px' }}>
                  <Globe size={14} color="#EC4899" />
                  <span>{lang === 'en' ? 'BRAND NAME LANGUAGE' : 'لغة الأسماء المبتكرة'}</span>
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
                        flex: 1, padding: '8px 12px', fontSize: '12px', borderRadius: '10px', fontWeight: '800',
                        background: nameLanguage === opt.id ? '#EC4899' : 'var(--bg2)',
                        border: `1px solid ${nameLanguage === opt.id ? '#EC4899' : 'var(--line)'}`,
                        color: nameLanguage === opt.id ? '#fff' : 'var(--text3)',
                        cursor: 'pointer', transition: 'all 0.2s ease'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalogs checklist with Select All / Deselect All */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: '800', color: 'var(--text3)', margin: 0 }}>
                    <Folder size={14} color="#EC4899" />
                    <span>{lang === 'en' ? 'SELECT CATALOGS TO LOAD' : 'حدد كتالوجات الأسماء المستهدفة'}</span>
                  </label>

                  {currentCatalogs.length > 0 && (
                    <button 
                      onClick={handleToggleAllCatalogs}
                      style={{ background: 'none', border: 'none', color: '#EC4899', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {selectedCatalogs.length === currentCatalogs.length ? <CheckSquare size={12} /> : <Square size={12} />}
                      <span>{selectedCatalogs.length === currentCatalogs.length ? (lang === 'en' ? 'Deselect All' : 'إلغاء التحديد') : (lang === 'en' ? 'Select All' : 'تحديد الكل')}</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentCatalogs.map(cat => {
                    const isChecked = selectedCatalogs.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCatalogs(prev => isChecked ? prev.filter(id => id !== cat.id) : [...prev, cat.id]);
                        }}
                        style={{
                          padding: '6px 14px', fontSize: '11px', borderRadius: '20px', fontWeight: '800',
                          background: isChecked ? 'rgba(236, 72, 153, 0.18)' : 'var(--bg2)',
                          border: `1px solid ${isChecked ? '#EC4899' : 'var(--line)'}`,
                          color: isChecked ? '#fff' : 'var(--text3)',
                          cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: 4
                        }}
                      >
                        {isChecked ? <Check size={12} color="#EC4899" /> : <span>+</span>}
                        <span>{lang === 'en' ? cat.label_en : cat.label_ar}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual Mode Selector */}
              <AnalysisModeSelector 
                mode={analysisMode} 
                onChange={setAnalysisMode} 
                lang={lang} 
                accentColor="#EC4899" 
              />

              <button
                onClick={handleGenerateNames}
                disabled={isGeneratingNames || selectedCatalogs.length === 0}
                className="btn btn-primary"
                style={{
                  background: (isGeneratingNames || selectedCatalogs.length === 0) ? 'rgba(236, 72, 153, 0.35)' : '#EC4899',
                  opacity: (isGeneratingNames || selectedCatalogs.length === 0) ? 0.6 : 1,
                  cursor: (isGeneratingNames || selectedCatalogs.length === 0) ? 'not-allowed' : 'pointer',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  width: '100%',
                  marginTop: 14,
                  transition: 'all 0.25s ease'
                }}
              >
                {isGeneratingNames ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span className="td-spinner" /> {lang === 'en' ? 'Generating...' : 'جاري التوليد...'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <Wand2 size={16} />
                    <span>{lang === 'en' ? 'Generate Custom Names' : 'توليد المقترحات الذكية'}</span>
                  </span>
                )}
              </button>

              {selectedCatalogs.length === 0 && (
                <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 'bold', marginTop: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} />
                  <span>{lang === 'en' ? 'Select at least one catalog above to enable button' : 'اختر كتالوجاً واحداً على الأقل أعلاه لتفعيل زر التوليد'}</span>
                </div>
              )}

            </div>

            {/* Generated results grid with Pin & 1-Click Copy */}
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '18px', padding: '24px', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="#EC4899" />
                <span>{lang === 'en' ? 'Generated Brand Name Proposals' : 'قائمة أسماء البراند المقترحة'}</span>
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
                        <div style={{ fontSize: '12px', color: '#EC4899', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Folder size={14} />
                          <span>{catTitle}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                          {items.map(item => {
                            const isPinned = pinnedNames.includes(item.name);
                            return (
                              <motion.div
                                key={item.name}
                                onClick={() => handleNameSelect(item.name)}
                                whileHover={{ scale: 1.01, x: isRtl ? -4 : 4 }}
                                style={{
                                  padding: '12px 16px', borderRadius: '12px', background: 'var(--bg2)', border: `1px solid ${isPinned ? '#F59E0B' : 'var(--line)'}`,
                                  cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span>{item.name}</span>
                                    {isPinned && <span className="pinned-badge"><Star size={10} fill="#F59E0B" /> {lang === 'en' ? 'Pinned' : 'مفضل'}</span>}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                                    "{lang === 'en' ? item.meaning_en : item.meaning_ar}"
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTogglePinName(item.name); }}
                                    style={{ background: 'none', border: 'none', color: isPinned ? '#F59E0B' : 'var(--text3)', cursor: 'pointer', padding: 4 }}
                                  >
                                    <Star size={16} fill={isPinned ? '#F59E0B' : 'none'} />
                                  </button>
                                  
                                  <button
                                    onClick={(e) => handleCopyName(item.name, e)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4 }}
                                  >
                                    <Copy size={16} />
                                  </button>

                                  <span style={{ fontSize: '9px', fontWeight: '800', padding: '3px 8px', background: 'rgba(236,72,153,0.12)', color: '#EC4899', borderRadius: '6px' }}>
                                    {item.type === 'ar' ? 'عربي' : item.type === 'en' ? 'EN' : 'Hybrid'}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, textAlign: 'center', padding: 20 }}>
                  <Lightbulb size={40} color="#EC4899" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>{lang === 'en' ? 'Select parameters on the left' : 'حدد الإعدادات والكتالوجات على اليسار'}</div>
                  <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text3)' }}>{lang === 'en' ? 'Then click Generate to extract names' : 'ثم اضغط توليد لعرض المقترحات هنا'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Brand Name input */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
            <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '13px', fontWeight: '800', color: 'var(--text2)', marginBottom: '10px' }}>
                <Crown size={18} color="#F59E0B" />
                <span>{lang === 'en' ? 'Confirm Final Brand Name' : 'اسم البراند المعتمد النهائي'}</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="setting-field-input"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder={lang === 'en' ? "NovaTrend" : "رونق"}
                  style={{
                    fontSize: '18px', fontWeight: '900', textAlign: 'center', height: '52px',
                    borderColor: 'rgba(236, 72, 153, 0.4)', color: '#EC4899', background: 'rgba(236, 72, 153, 0.05)'
                  }}
                />
                <button
                  onClick={handleConfirmName}
                  disabled={!customNameInput}
                  className="btn btn-primary"
                  style={{
                    margin: 0, padding: '0 28px', background: '#EC4899', height: '52px',
                    borderRadius: '12px', fontSize: '14px', fontWeight: '800'
                  }}
                >
                  <span>{lang === 'en' ? 'Confirm' : 'اعتماد الاسم'}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ──────────────── TAB 3: VISUAL IDENTITY ──────────────── */}
      {activeTab === 'identity' && (
        <motion.div 
          className="ai-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Palette size={22} color="#10B981" />
                <span>{lang === 'en' ? 'Visual Identity & Branding' : 'الهوية البصرية وتصميم البراند'}</span>
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: '1.6', margin: 0 }}>
                {lang === 'en' 
                  ? 'Select up to 3 colors for your brand identity. View simulator mockup and analyze psychological impact.' 
                  : 'اختر لوحة الألوان الخاصة بالبراند (حتى 3 ألوان). اختبر كيف تبدو على نموذج الموقع وحلل أثرها النفسي.'}
              </p>
            </div>

            <button onClick={handleCopyColorPalette} className="action-pill-btn">
              <Copy size={14} />
              <span>{lang === 'en' ? 'Copy Color Palette' : 'نسخ لوحة الألوان'}</span>
            </button>
          </div>

          {/* Preset Palettes */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text3)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#10B981" />
              <span>{lang === 'en' ? 'POPULAR 3-COLOR PALETTES' : 'باليتات ألوان ثلاثية مقترحة'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {PRESETS_PALETTES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    padding: '10px 14px', borderRadius: '12px', background: 'var(--bg2)', border: '1px solid var(--line)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: preset.primary }} />
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: preset.secondary }} />
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: preset.accent }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text)', fontWeight: '800' }}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
            {/* Color Pickers & Logo Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '18px', padding: '24px' }}>
                <h4 style={{ fontSize: '13px', color: '#fff', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Droplets size={16} color="#10B981" />
                  <span>{lang === 'en' ? 'Color Palette Customization' : 'تخصيص عجلة الألوان الثلاثية'}</span>
                </h4>
                
                <div className="color-circle-container" style={{ marginBottom: '18px' }}>
                  <div className="color-input-card">
                    <input type="color" value={primaryColor} onChange={(e) => handleColorChange('primary', e.target.value)} />
                    <div>
                      <div style={{ fontSize: '9px', color: 'var(--text3)', fontWeight: '800' }}>{lang === 'en' ? 'PRIMARY' : 'الأساسي'}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>{primaryColor}</div>
                    </div>
                  </div>

                  <div className="color-input-card">
                    <input type="color" value={secondaryColor} onChange={(e) => handleColorChange('secondary', e.target.value)} />
                    <div>
                      <div style={{ fontSize: '9px', color: 'var(--text3)', fontWeight: '800' }}>{lang === 'en' ? 'SECONDARY' : 'الثانوي'}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>{secondaryColor}</div>
                    </div>
                  </div>

                  <div className="color-input-card">
                    <input type="color" value={accentColor} onChange={(e) => handleColorChange('accent', e.target.value)} />
                    <div>
                      <div style={{ fontSize: '9px', color: 'var(--text3)', fontWeight: '800' }}>{lang === 'en' ? 'ACCENT' : 'الفرعي / الزر'}</div>
                      <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>{accentColor}</div>
                    </div>
                  </div>
                </div>

                {/* Logo upload mockup */}
                <div style={{ position: 'relative', border: '2px dashed var(--line2)', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', minHeight: '120px', cursor: 'pointer', overflow: 'hidden', background: 'var(--bg2)' }}>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                  {!logoPreview ? (
                    <>
                      <UploadCloud size={28} color="var(--accent)" style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '800', margin: 0 }}>
                        {lang === 'en' ? 'Upload logo for simulation' : 'ارفع شعار البراند لمعاينته'}
                      </p>
                    </>
                  ) : (
                    <img src={logoPreview} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '12px', zIndex: 0 }} alt="Logo" />
                  )}
                </div>

                {/* Dual Mode Selector */}
                <div style={{ marginTop: 20 }}>
                  <AnalysisModeSelector 
                    mode={analysisMode} 
                    onChange={setAnalysisMode} 
                    lang={lang} 
                    accentColor={primaryColor || '#10B981'} 
                  />
                </div>

                <button
                  onClick={handleAnalyzeColors}
                  disabled={isAnalyzingColors || !primaryColor}
                  className="btn btn-primary"
                  style={{
                    marginTop: '16px', background: primaryColor, color: '#fff', borderRadius: '12px', width: '100%'
                  }}
                >
                  {isAnalyzingColors ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <span className="td-spinner" /> {lang === 'en' ? 'Analyzing...' : 'جاري التحليل...'}
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <Cpu size={16} />
                      <span>{lang === 'en' ? 'Analyze Colors & Apply Identity' : 'تحليل سيكولوجية الألوان وتطبيق الهوية'}</span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mockup Simulator */}
            <div style={{ background: '#020617', border: '1px solid var(--line2)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '320px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
              <div style={{ background: '#0f172a', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'monospace', marginLeft: '12px' }}>{state.brandName || 'brand_preview'}</div>
              </div>
              
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: secondaryColor, transition: 'background 0.5s ease' }}>
                {/* Fake Navbar */}
                <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
                    {logoPreview ? <img src={logoPreview} style={{ height: '100%', objectFit: 'contain' }} /> : <div style={{ color: '#fff', fontSize: '14px', fontWeight: '900' }}>{state.brandName || 'LOGO'}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                    <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                  </div>
                </div>
                
                {/* Fake Hero Section */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative', textAlign: 'center' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '160px', height: '160px', borderRadius: '50%', background: primaryColor, filter: 'blur(60px)', opacity: 0.25, pointerEvents: 'none' }} />
                  
                  <h4 style={{ fontSize: '18px', fontWeight: '900', color: primaryColor, marginBottom: '8px', transition: 'color 0.5s ease' }}>
                    {state.brandName ? `${state.brandName} Platform` : (lang === 'en' ? 'Start Your Project' : 'ابدأ مشروعك الاحترافي')}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 18px 0', maxWidth: '260px', lineHeight: 1.6 }}>
                    {lang === 'en' ? 'Tailored digital solutions built in minutes.' : 'حلول رقمية متكاملة مصممة لنوع عملك بدقة.'}
                  </p>
                  
                  <button 
                    style={{ 
                      padding: '10px 24px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', color: '#fff', 
                      background: accentColor, border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${accentColor}50`, transition: 'background 0.5s ease'
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
            <motion.div 
              className="animate-fade-in" 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="result-card" style={{ '--accent-color': primaryColor }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Brain size={18} color={primaryColor} />
                  <h4 style={{ color: primaryColor, margin: 0, fontSize: '14px', fontWeight: '800' }}>
                    {lang === 'en' ? 'Color Psychology & Tone' : 'الأثر السيكولوجي للهوية'}
                  </h4>
                </div>
                <p style={{ fontSize: '12.5px', lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>
                  {lang === 'en' ? colorAnalysis.psychology_en : colorAnalysis.psychology_ar}
                </p>
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mic size={14} color={primaryColor} />
                  <span>{lang === 'en' ? 'Tone:' : 'نبرة صوت البراند:'}</span>
                  <strong style={{ color: '#fff' }}>{lang === 'en' ? colorAnalysis.brand_tone_en : colorAnalysis.brand_tone_ar}</strong>
                </div>
              </div>

              <div className="result-card" style={{ '--accent-color': accentColor }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <FileText size={18} color={accentColor} />
                  <h4 style={{ color: accentColor, margin: 0, fontSize: '14px', fontWeight: '800' }}>
                    {lang === 'en' ? 'Visual Design Assets' : 'دليل الخطوط والمجالات'}
                  </h4>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Type size={14} color={accentColor} />
                    <span>{lang === 'en' ? 'Font Pairings:' : 'تنسيق الخطوط:'}</span>
                    <strong style={{ color: '#fff' }}>{lang === 'en' ? colorAnalysis.font_pairings_en : colorAnalysis.font_pairings_ar}</strong>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Building2 size={14} color={accentColor} />
                      <span>{lang === 'en' ? 'Best For:' : 'الأفضل لمجالات:'}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(lang === 'en' ? colorAnalysis.recommended_industries_en : colorAnalysis.recommended_industries_ar)?.map((ind, idx) => (
                        <span key={idx} style={{ padding: '3px 10px', fontSize: '11px', background: 'var(--bg2)', borderRadius: '10px', border: '1px solid var(--line)', fontWeight: 'bold' }}>
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

    </div>
  );
}

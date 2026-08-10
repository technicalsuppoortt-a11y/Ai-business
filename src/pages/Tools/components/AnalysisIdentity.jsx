import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { getNiches, seedNiches } from "../../../services/nicheService";
import {
  getNicheAnalysis,
  getBrandNames,
  getBrandNichesDef,
  getColorAnalysis,
} from "../../../services/contentDbService";
import AnalysisModeSelector from "../../../components/common/AnalysisModeSelector";
import { dispatchLiveAiAnalysis, callOpenAiApi } from "../../../services/liveAiService";
import ToolDashboardLayout from "./ToolDashboardLayout";
import { useAuth } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
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
  Edit3,
  Flame,
  Coins,
  TrendingUp,
  Briefcase,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Copy,
  Search,
  Filter,
  X,
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
  RefreshCw,
  Share2,
  ExternalLink,
  BarChart3,
  ArrowRightLeft,
  Award,
  Compass,
  ShoppingBag,
  ShieldCheck,
  Loader2,
  Code
} from "lucide-react";
import TypingText from "../../../components/common/TypingText";
import useToolCache from "../../../hooks/useToolCache";

export function getNicheVectorIcon(id, size = 20, color = 'currentColor') {
  switch (id) {
    case 'ai':
      return <Bot size={size} color={color} />;
    case 'business':
      return <Briefcase size={size} color={color} />;
    case 'marketing':
      return <Megaphone size={size} color={color} />;
    case 'ecom':
      return <ShoppingBag size={size} color={color} />;
    case 'fitness':
      return <Dumbbell size={size} color={color} />;
    case 'realestate':
      return <Building2 size={size} color={color} />;
    case 'creative':
      return <Palette size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
}
import "./AnalysisIdentity.css";

const NICHE_THEMES = {
  ai: { color: "#6366F1", bg: "rgba(99, 102, 241, 0.12)", rgb: "99, 102, 241" },
  business: {
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.12)",
    rgb: "99, 102, 241",
  },
  marketing: {
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.12)",
    rgb: "99, 102, 241",
  },
  fitness: {
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.12)",
    rgb: "99, 102, 241",
  },
  realestate: {
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.12)",
    rgb: "99, 102, 241",
  },
  creative: {
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.12)",
    rgb: "99, 102, 241",
  },
};

export const PRESETS_PALETTES = [
  { name: "Cyber Neon",     primary: "#6366F1", secondary: "#10B981", accent: "#F59E0B" },
  { name: "Ocean Trust",    primary: "#3B82F6", secondary: "#1E40AF", accent: "#60A5FA" },
  { name: "Royal Emerald",  primary: "#10B981", secondary: "#047857", accent: "#34D399" },
  { name: "Sunset Gold",    primary: "#F59E0B", secondary: "#B45309", accent: "#FBBF24" },
  { name: "Purple Luxury",  primary: "#8B5CF6", secondary: "#6D28D9", accent: "#C084FC" },
  { name: "Tech Magenta",   primary: "#EC4899", secondary: "#BE185D", accent: "#F472B6" },
  { name: "Dark Stealth",   primary: "#0F172A", secondary: "#334155", accent: "#6366F1" },
];

export const BRAND_CATEGORIES = [
  { id: 'ecom',     label_ar: 'التجارة الإلكترونية', label_en: 'E-commerce',       sub_ar: 'منتجات ملموسة',    sub_en: 'Physical Products',   IconComp: ShoppingCart },
  { id: 'digital',  label_ar: 'المنتجات الرقمية',   label_en: 'Digital Products',   sub_ar: 'كورسات، قوالب',    sub_en: 'Courses, Templates',  IconComp: Gem },
  { id: 'services', label_ar: 'الخدمات والأعمال',    label_en: 'Services',           sub_ar: 'تسويق، استشارات',  sub_en: 'Marketing, Consulting',IconComp: Briefcase }
];

const COUNTRY_OPTIONS = [
  { id: 'sa', name_ar: 'المملكة العربية السعودية', name_en: 'Saudi Arabia', flag: '🇸🇦', region: 'GCC' },
  { id: 'uae', name_ar: 'الإمارات العربية المتحدة', name_en: 'UAE', flag: '🇦🇪', region: 'GCC' },
  { id: 'eg', name_ar: 'جمهورية مصر العربية', name_en: 'Egypt', flag: '🇪🇬', region: 'MENA' },
  { id: 'kw', name_ar: 'دولة الكويت', name_en: 'Kuwait', flag: '🇰🇼', region: 'GCC' },
  { id: 'qa', name_ar: 'دولة قطر', name_en: 'Qatar', flag: '🇶🇦', region: 'GCC' },
  { id: 'bh', name_ar: 'مملكة البحرين', name_en: 'Bahrain', flag: '🇧🇭', region: 'GCC' },
  { id: 'om', name_ar: 'سلطنة عمان', name_en: 'Oman', flag: '🇴🇲', region: 'GCC' },
  { id: 'jo', name_ar: 'المملكة الأردنية الهاشمية', name_en: 'Jordan', flag: '🇯🇴', region: 'MENA' },
  { id: 'ma', name_ar: 'المملكة المغربية', name_en: 'Morocco', flag: '🇲🇦', region: 'MENA' },
  { id: 'dz', name_ar: 'الجمهورية الجزائرية', name_en: 'Algeria', flag: '🇩🇿', region: 'MENA' },
  { id: 'iq', name_ar: 'جمهورية العراق', name_en: 'Iraq', flag: '🇮🇶', region: 'MENA' },
  { id: 'us', name_ar: 'الولايات المتحدة الأمريكية', name_en: 'United States', flag: '🇺🇸', region: 'Global' },
  { id: 'uk', name_ar: 'المملكة المتحدة', name_en: 'United Kingdom', flag: '🇬🇧', region: 'Global' },
  { id: 'de', name_ar: 'جمهورية ألمانيا الاتحادية', name_en: 'Germany', flag: '🇩🇪', region: 'Global' },
  { id: 'ca', name_ar: 'كندا', name_en: 'Canada', flag: '🇨🇦', region: 'Global' },
  { id: 'au', name_ar: 'أستراليا', name_en: 'Australia', flag: '🇦🇺', region: 'Global' },
  { id: 'global', name_ar: 'السوق العالمي الشامل', name_en: 'Worldwide Global Market', flag: '🌐', region: 'Global' },
];

function CategorySelectPrompt({ lang }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      className="ns-panel-card"
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        margin: '20px 0',
      }}
    >
      <div
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(16, 185, 129, 0.25))',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Target size={34} color="#6366F1" />
      </div>

      <div>
        <h3 className="ns-heading-title" style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
          {lang === 'en' ? 'Select a Business Category Above' : 'اختر تخصص البزنس من الأعلى للبدء'}
        </h3>
        <p className="ns-subtext" style={{ fontSize: '13px', maxWidth: '520px', margin: '8px auto 0', lineHeight: '1.6' }}>
          {lang === 'en'
            ? 'Choose any business category (e.g., Real Estate & Finance, AI & Automation, E-Commerce) to activate real-time market intelligence, CAGR metrics, and micro-niche opportunities.'
            : 'اختر أي مجال وتخصص من البطاقات أعلاه (مثل العقارات والخدمات المالية، الذكاء الاصطناعي، التجارة الإلكترونية) لتفعيل التحليل الاستراتيجي المباشر واستكشاف الفرص الفريدة.'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontSize: '12px', fontWeight: '800', background: 'rgba(99, 102, 241, 0.12)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
        <Sparkles size={16} color="#818CF8" />
        <span>{lang === 'en' ? 'Click any category card above to begin' : 'انقر على أي تخصص في الأعلى للبدء بالتحليل'}</span>
      </div>
    </motion.div>
  );
}

function FullPageCategoryLoader({ selectedNiche, lang }) {
  const label = lang === 'en' ? (selectedNiche?.label_en || selectedNiche?.id) : (selectedNiche?.label_ar || selectedNiche?.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="ns-full-category-loader"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: '#6366F1',
              animation: 'spin 1s infinite linear'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderBottomColor: '#10B981',
              animation: 'spin 1.5s infinite linear reverse'
            }}
          />
          <Target size={28} color="#6366F1" />
        </div>

        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px' }}>
            <Sparkles size={14} color="#6366F1" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#818CF8' }}>
              {lang === 'en' ? `Analyzing Category: ${label}` : `جاري تحليل قطاع: ${label}`}
            </span>
          </div>

          <h3 className="ns-heading-title" style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>
            {lang === 'en'
              ? `Generating Deep Market Intelligence for ${label}...`
              : `جاري تجميع دراسة الجدوى والفرص الاستراتيجية لـ ${label}...`}
          </h3>
          <p className="ns-subtext" style={{ fontSize: '12px', maxWidth: '480px', margin: '8px auto 0', lineHeight: '1.6' }}>
            {lang === 'en'
              ? 'Fetching CAGR benchmarks, saturation levels, top market leaders, and high-demand micro-niche opportunities.'
              : 'جاري استدعاء معدلات النمو، درجة تشبع السوق، أبرز المنافسين وأفكار الخدمات الدقيقة عالية الربحية.'}
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '700px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '10px' }}>
          <div className="ns-subcard td-skeleton" style={{ height: '70px', borderRadius: '12px', opacity: 0.25 }} />
          <div className="ns-subcard td-skeleton" style={{ height: '70px', borderRadius: '12px', opacity: 0.25 }} />
          <div className="ns-subcard td-skeleton" style={{ height: '70px', borderRadius: '12px', opacity: 0.25 }} />
        </div>

        <div className="ns-progress-track" style={{ width: '100%', maxWidth: '400px' }}>
          <div className="ns-progress-bar-fill" />
        </div>
      </div>
    </motion.div>
  );
}

function TargetMarketDropdown({ value, onChange, options, lang, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const selectedOption = options.find((c) => c.id === value) || options[0];

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      opt.name_en.toLowerCase().includes(q) ||
      opt.name_ar.toLowerCase().includes(q) ||
      opt.id.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`ns-dropdown-trigger ${isLoading ? 'is-loading' : ''}`}
        style={{
          width: '100%',
          minHeight: '46px',
          borderRadius: '14px',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '20px' }}>{selectedOption.flag}</span>
            {isLoading && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#6366F1',
                  borderRadius: '50%',
                  width: '12px',
                  height: '12px',
                }}
              >
                <Loader2 size={8} color="#fff" className="spin" />
              </span>
            )}
          </div>
          <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <div className="ns-heading-title" style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{lang === 'en' ? selectedOption.name_en : selectedOption.name_ar}</span>
              {isLoading && (
                <span
                  style={{
                    fontSize: '10px',
                    color: '#6366F1',
                    background: 'rgba(99,102,241,0.12)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: '700'
                  }}
                >
                  {lang === 'en' ? 'Updating...' : 'جاري التحديث...'}
                </span>
              )}
            </div>
            {selectedOption.region && (
              <span style={{ fontSize: '10px', color: '#818CF8', fontWeight: '700' }}>
                {selectedOption.region}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
            {options.length} {lang === 'en' ? 'Markets' : 'أسواق'}
          </span>
          {isLoading ? (
            <Loader2 size={16} color="#6366F1" className="spin" />
          ) : (
            <ChevronDown
              size={16}
              color="#94A3B8"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="ns-dropdown-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 9999,
              borderRadius: '14px',
              padding: '10px',
              maxHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} color="#64748B" style={{ position: 'absolute', top: '11px', left: lang === 'ar' ? 'auto' : '10px', right: lang === 'ar' ? '10px' : 'auto' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search market or country...' : 'ابحث عن الدولة أو السوق...'}
                className="ns-dropdown-search-input"
                style={{
                  width: '100%',
                  padding: lang === 'ar' ? '8px 32px 8px 12px' : '8px 12px 8px 32px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredOptions.length === 0 ? (
                <div className="ns-subtext" style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>
                  {lang === 'en' ? 'No markets found' : 'لم يتم العثور على نتائج'}
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.id === value;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        onChange(opt.id);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`ns-dropdown-option ${isSelected ? 'selected' : ''}`}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{opt.flag}</span>
                        <div>
                          <div className="ns-dropdown-option-title" style={{ fontSize: '12px', fontWeight: isSelected ? '800' : '600' }}>
                            {lang === 'en' ? opt.name_en : opt.name_ar}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {opt.region && (
                          <span style={{ fontSize: '9px', background: 'rgba(255, 255, 255, 0.06)', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px' }}>
                            {opt.region}
                          </span>
                        )}
                        {isSelected && <Check size={14} color="#6366F1" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Vector Icon Mapper for Niche Categories
const NICHE_ICON_MAP = {
  ai: Cpu,
  business: Briefcase,
  creative: Palette,
  fitness: HeartPulse,
  marketing: Megaphone,
  realestate: Building2,
};

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <div
        className={`custom-dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
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
            {options.map((opt) => (
              <div
                key={String(opt.value)}
                className={`custom-dropdown-option ${String(opt.value) === String(value) ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && (
                  <Check size={14} color="var(--accent)" />
                )}
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
  const { userData } = useAuth();
  const { cachedData: cached, isCached, isLoadingCache, saveResult } = useToolCache(userData?.uid, "analysis-identity");
  const toast = useToast();

  const lang = state.language || "ar";
  const isRtl = lang === "ar";
  const userLevel = state.user?.level || "beginner";
  const userCountry = state.user?.country || "EG";

  // Dual Independent Analysis Mode states
  const [microNicheMode, setMicroNicheMode] = useState(cached?.microNicheMode ?? "fast"); // 'fast' | 'live'
  const [analysisMode, setAnalysisMode] = useState(cached?.analysisMode ?? "fast"); // 'fast' | 'live'

  // Tabs management
  const [activeTab, setActiveTab] = useState(cached?.activeTab ?? "niche");
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false); // 'niche', 'name', 'identity'

  // Tab 1: Niche selection & Target Country States
  const [niches, setNiches] = useState([]);
  const [loadingNiches, setLoadingNiches] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState(cached?.selectedNiche ?? null);
  const [selectedMicroNiche, setSelectedMicroNiche] = useState(cached?.selectedMicroNiche ?? null);
  const [customNicheInput, setCustomNicheInput] = useState(cached?.customNicheInput ?? "");
  const [microSearchQuery, setMicroSearchQuery] = useState("");
  const [microFilterBadge, setMicroFilterBadge] = useState("all"); // 'all' | 'trend' | 'profit' | 'stable' | 'freelance'
  const [showAllMicroNiches, setShowAllMicroNiches] = useState(false);
  const [isAnalyzingNiche, setIsAnalyzingNiche] = useState(false);
  const [targetCountry, setTargetCountry] = useState(cached?.targetCountry ?? "sa");
  const [isChangingMarket, setIsChangingMarket] = useState(false);
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  const [isGlobalBenchmark, setIsGlobalBenchmark] = useState(cached?.isGlobalBenchmark ?? false);

  const [microNicheActiveTab, setMicroNicheActiveTab] = useState("opportunities"); // 'opportunities' | 'leaders'
  const [liveAiMicroIdeas, setLiveAiMicroIdeas] = useState(cached?.liveAiMicroIdeas ?? []);
  const [isFetchingLiveNiches, setIsFetchingLiveNiches] = useState(false);
  const [nicheAnalysis, setNicheAnalysis] = useState(cached?.nicheAnalysis ?? null);
  const [nicheAnalysisOption, setNicheAnalysisOption] = useState("fast_radar"); // 'fast_radar' | 'deep_360'

  // ── Unified AI State (100% Dynamic Integration) ─────────────
  const [aiData, setAiData] = useState(cached?.aiData ?? {
    benchmark: null,
    microNiches: [],
    marketOpportunities: null,
    topLeaders: [],
    loading: {
      benchmark: false,
      microNiches: false,
      opportunities: false,
      leaders: false
    },
    error: null
  });

  const handleTargetCountryChange = (val) => {
    if (val === targetCountry) return;
    setIsChangingMarket(true);
    setTargetCountry(val);
    setTimeout(() => {
      setIsChangingMarket(false);
    }, 1600);
    setAiData(prev => ({ ...prev, marketOpportunities: null, topLeaders: [] }));
    fetchAIData('benchmark', { country: val });
    fetchAIData('microNiches', { country: val });
    console.log("🚀 USER CLICKED GENERATE (Country):", val);
  };

  const isMarketLoading = isChangingMarket || aiData.loading.benchmark || aiData.loading.microNiches || isFetchingLiveNiches;
  const isCategoryLoading = isChangingCategory || (selectedNiche && (aiData.loading.benchmark || aiData.loading.microNiches));

  // ── Unified AI Data Fetcher ─────────────────────────────────────────
  const fetchAIData = async (type, params = {}) => {
    const activeNiche = params.niche || selectedNiche;
    if (!activeNiche) return;

    const countryObj = COUNTRY_OPTIONS.find((c) => c.id === (params.country || targetCountry)) || COUNTRY_OPTIONS[0];
    const language = params.language || (lang === 'en' ? 'English' : 'Arabic');
    const nicheName = activeNiche.label_en || activeNiche.id;
    const subNicheName = params.microNiche || state.subNiche || customNicheInput || nicheName;

    setAiData(prev => ({
      ...prev,
      loading: { ...prev.loading, [type]: true },
      error: null
    }));

    try {
      let systemPrompt = '';
      let userPrompt = '';

      if (type === 'benchmark') {
        systemPrompt = `You are a market analysis expert. Analyze niche "${nicheName}" in target market "${countryObj.name_en}". Compare this market with the best alternative global market. Return ONLY raw JSON strictly matching: { "primaryMarket": { "cagr": "+XX% CAGR", "saturation": "blue", "saturationText": "status description", "roi": "expected ROI" }, "alternativeMarket": { "name": "country name with flag", "cagr": "+XX% CAGR", "surge": "demand surge description" }, "recommendation": "AI strategic recommendation" }.`;
        userPrompt = `Generate benchmark analysis for "${nicheName}" in "${countryObj.name_en}". Language: ${language}.`;
      } else if (type === 'microNiches') {
        setSelectedMicroNiche(null);
        dispatch({ type: "SET_FIELD", field: "subNiche", value: "" });
        setNicheAnalysis(null);
        setAiData(prev => ({ ...prev, marketOpportunities: null, topLeaders: [] }));
        
        systemPrompt = `You are a business strategist. Generate 8 innovative micro-niche business ideas in "${nicheName}" for "${countryObj.name_en}". Return ONLY raw JSON object with key "ideas" containing an array of 8 micro-niche strings.`;
        userPrompt = `Generate 8 micro-niche business ideas for "${nicheName}" in "${countryObj.name_en}". Language: ${language}.`;
      } else if (type === 'opportunities') {
        const subNicheName = (params && params.microNiche) || state.subNiche || 'General';
        systemPrompt = `Analyze market opportunities in niche "${nicheName}" (Sub-niche: "${subNicheName}") for target market "${countryObj.name_en}". Return ONLY raw JSON object strictly matching: { "strengths": ["strength 1", "strength 2", "strength 3"], "gaps": ["gap 1", "gap 2", "gap 3"], "recommendations": ["recommendation 1", "recommendation 2"] }.`;
        userPrompt = `Analyze market opportunities for sub-niche "${subNicheName}" in "${countryObj.name_en}". Language: ${language}.`;
      } else if (type === 'leaders') {
        const subNicheName = (params && params.microNiche) || state.subNiche || 'General';
        systemPrompt = `List top 10 leading companies in niche "${nicheName}" (Sub-niche: "${subNicheName}") in "${countryObj.name_en}". Return ONLY raw JSON object with key "leaders" containing array of 10 objects: { "name": "company name", "secret": "secret sauce / differentiator", "url": "https://..." }.`;
        userPrompt = `List 10 top market leaders in "${subNicheName}" in "${countryObj.name_en}". Language: ${language}.`;
      }

      const resText = await callOpenAiApi({ uid: userData?.uid || state?.user?.uid, systemPrompt, userPrompt, jsonMode: true, costKey: 'costDeepStrategicAnalysis' });
      const parsed = JSON.parse(resText);

      setAiData(prev => {
        let update = {};
        if (type === 'benchmark') {
          update = { benchmark: parsed };
        } else if (type === 'microNiches') {
          const list = Array.isArray(parsed) ? parsed : (parsed.ideas || Object.values(parsed).find(v => Array.isArray(v)) || []);
          update = { microNiches: list.map(i => typeof i === 'string' ? i : (i?.title || i?.name || JSON.stringify(i))) };
        } else if (type === 'opportunities') {
          update = { marketOpportunities: parsed };
        } else if (type === 'leaders') {
          const list = Array.isArray(parsed) ? parsed : (parsed.leaders || Object.values(parsed).find(v => Array.isArray(v)) || []);
          update = { topLeaders: list };
        }
        return {
          ...prev,
          ...update,
          loading: { ...prev.loading, [type]: false }
        };
      });
    } catch (err) {
      console.error(`Error fetching AI data for ${type}:`, err);
      setAiData(prev => ({
        ...prev,
        loading: { ...prev.loading, [type]: false },
        error: err.message.includes('VITE_OPENAI_API_KEY')
          ? 'Please provide a valid VITE_OPENAI_API_KEY in your .env file to enable Live AI generation.'
          : err.message
      }));
    }
  };

  // ABSOLUTE BLOCK: Zero automated API calls on mount or state change!
  // fetchAIData is ONLY triggered by explicit UI event handlers.

  const fetchLiveMicroNichesFromOpenAI = async (overrideNiche = null) => {
    const targetNiche = overrideNiche || selectedNiche;
    if (!targetNiche) return;
    setIsFetchingLiveNiches(true);
    try {
      const countryObj = COUNTRY_OPTIONS.find((c) => c.id === targetCountry) || COUNTRY_OPTIONS[0];
      const systemPrompt = `You are a top business strategist AI. Generate 6 high-demand micro-niche agency/freelance business ideas tailored specifically for target market: ${countryObj.name_en}. Return JSON object with array "ideas".`;
      const userPrompt = `Main Category: ${targetNiche.label_en || targetNiche.id}. Target Country: ${countryObj.name_en}. Return 6 innovative micro-niche titles in ${lang === "en" ? "English" : "Arabic"}.`;
      const resText = await callOpenAiApi({ uid: userData?.uid || state?.user?.uid, systemPrompt, userPrompt, jsonMode: true, costKey: 'costMicroNicheIdea' });
      const parsed = JSON.parse(resText);
      let rawList = [];
      if (Array.isArray(parsed)) {
        rawList = parsed;
      } else if (parsed && Array.isArray(parsed.ideas)) {
        rawList = parsed.ideas;
      } else if (parsed && typeof parsed === 'object') {
        rawList = Object.values(parsed).find(val => Array.isArray(val)) || [];
      }

      const normalized = rawList.map(item => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          return item.title || item.name || item.idea || item.description || JSON.stringify(item);
        }
        return String(item || '');
      }).filter(Boolean);

      if (normalized.length > 0) {
        setLiveAiMicroIdeas(normalized);
      }
    } catch (e) {
      console.log("OpenAI Live AI micro-niche generation fallback:", e.message);
      const fallbackIdeas = lang === "en" ? [
        `AI-Powered ${targetNiche.label_en || targetNiche.id} Agency`,
        `Automated ${targetNiche.label_en || targetNiche.id} Workflows`,
        `High-Ticket ${targetNiche.label_en || targetNiche.id} Consulting`,
        `Niche ${targetNiche.label_en || targetNiche.id} Performance Marketing`,
        `B2B ${targetNiche.label_en || targetNiche.id} Lead Systems`,
        `Custom ${targetNiche.label_en || targetNiche.id} SaaS Solutions`
      ] : [
        `وكالة أتمتة خدمات ${targetNiche.label_ar || targetNiche.id} بالذكاء الاصطناعي`,
        `حلول أنظمة وسير عمل ${targetNiche.label_ar || targetNiche.id} المتكاملة`,
        `استشارات عالية القيمة High-Ticket في ${targetNiche.label_ar || targetNiche.id}`,
        `تسويق أداء متخصص في مجالات ${targetNiche.label_ar || targetNiche.id}`,
        `نظام جلب وبناء عملاء B2B لقطاع ${targetNiche.label_ar || targetNiche.id}`,
        `حلول برمجية مخصصة للشركات في مجال ${targetNiche.label_ar || targetNiche.id}`
      ];
      setLiveAiMicroIdeas(fallbackIdeas);
    } finally {
      setIsFetchingLiveNiches(false);
    }
  };

  useEffect(() => {
    if (microNicheMode === "live" && selectedNiche && liveAiMicroIdeas.length === 0) {
      fetchLiveMicroNichesFromOpenAI(selectedNiche);
    }
  }, [microNicheMode, selectedNiche, targetCountry]);

  // Tab 2: Brand naming states
  const [namingCategory, setNamingCategory] = useState(cached?.namingCategory ?? "ecom");
  const [dynamicStyles, setDynamicStyles] = useState({});
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedCatalogs, setSelectedCatalogs] = useState([]);
  const [pinnedNames, setPinnedNames] = useState([]);
  const [nameLanguage, setNameLanguage] = useState("all");
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [generatedNames, setGeneratedNames] = useState(cached?.generatedNames ?? null);
  const [customNameInput, setCustomNameInput] = useState(state.brandName || "");

  // Tab 3: Visual identity & Simulator states
  const [primaryColor, setPrimaryColor] = useState(
    state.primaryColor || "#6366F1",
  );
  const [secondaryColor, setSecondaryColor] = useState(
    state.secondaryColor || "#0F172A",
  );
  const [accentColor, setAccentColor] = useState(
    state.accentColor || "#818CF8",
  );
  const [logoPreview, setLogoPreview] = useState(state?.logo || null);
  const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
  const [colorAnalysis, setColorAnalysis] = useState(cached?.colorAnalysis ?? null);
  const [isNewlyGeneratedColors, setIsNewlyGeneratedColors] = useState(false);

  

  const [mockupView, setMockupView] = useState("website"); // 'website' | 'social' | 'card'
  const [brandArchetype, setBrandArchetype] = useState("visionary"); // 'visionary' | 'luxury' | 'agile' | 'expert'

  // ── Tab 3: Extended Simulator & Granular UI Controls ─────────
  const [headingFont, setHeadingFont] = useState("Cairo");
  const [headingColor, setHeadingColor] = useState("#FFFFFF");
  const [bodyTextColor, setBodyTextColor] = useState("#94A3B8");

  const [buttonBgColor, setButtonBgColor] = useState("#6366F1");
  const [buttonTextColor, setButtonTextColor] = useState("#FFFFFF");
  const [buttonBorderColor, setButtonBorderColor] = useState("rgba(99, 102, 241, 0.4)");
  const [buttonRadius, setButtonRadius] = useState("16px");
  const [buttonHoverBg, setButtonHoverBg] = useState("#4F46E5");

  const [heroBgColor, setHeroBgColor] = useState("linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))");
  const [cardBgColor, setCardBgColor] = useState("rgba(30, 41, 59, 0.7)");
  const [cardBorderColor, setCardBorderColor] = useState("rgba(99, 102, 241, 0.25)");

  const [customCssCode, setCustomCssCode] = useState("/* Custom CSS Overrides */\n.live-preview-btn {\n  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);\n}");
  const [appliedCssCode, setAppliedCssCode] = useState("");

  // ═══════════════ INITIAL LOADS ═══════════════
  const hydratedRef = useRef(false);

  // 1. Hydrate state asynchronously when cache loads
  useEffect(() => {
    if (!isLoadingCache && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.microNicheMode !== undefined) setMicroNicheMode(cached.microNicheMode);
        if (cached.analysisMode !== undefined) setAnalysisMode(cached.analysisMode);
        if (cached.activeTab !== undefined) setActiveTab(cached.activeTab);
        if (cached.niches !== undefined) setNiches(cached.niches);
        if (cached.loadingNiches !== undefined) setLoadingNiches(cached.loadingNiches);
        if (cached.selectedNiche !== undefined) setSelectedNiche(cached.selectedNiche);
        if (cached.selectedMicroNiche !== undefined) setSelectedMicroNiche(cached.selectedMicroNiche);
        if (cached.customNicheInput !== undefined) setCustomNicheInput(cached.customNicheInput);
        if (cached.microSearchQuery !== undefined) setMicroSearchQuery(cached.microSearchQuery);
        if (cached.microFilterBadge !== undefined) setMicroFilterBadge(cached.microFilterBadge);
        if (cached.showAllMicroNiches !== undefined) setShowAllMicroNiches(cached.showAllMicroNiches);
        if (cached.isAnalyzingNiche !== undefined) setIsAnalyzingNiche(cached.isAnalyzingNiche);
        if (cached.targetCountry !== undefined) setTargetCountry(cached.targetCountry);
        if (cached.isChangingMarket !== undefined) setIsChangingMarket(cached.isChangingMarket);
        if (cached.isChangingCategory !== undefined) setIsChangingCategory(cached.isChangingCategory);
        if (cached.isGlobalBenchmark !== undefined) setIsGlobalBenchmark(cached.isGlobalBenchmark);
        if (cached.microNicheActiveTab !== undefined) setMicroNicheActiveTab(cached.microNicheActiveTab);
        if (cached.liveAiMicroIdeas !== undefined) setLiveAiMicroIdeas(cached.liveAiMicroIdeas);
        if (cached.isFetchingLiveNiches !== undefined) setIsFetchingLiveNiches(cached.isFetchingLiveNiches);
        if (cached.nicheAnalysis !== undefined) setNicheAnalysis(cached.nicheAnalysis);
        if (cached.nicheAnalysisOption !== undefined) setNicheAnalysisOption(cached.nicheAnalysisOption);
        if (cached.aiData !== undefined) setAiData(cached.aiData);
        if (cached.namingCategory !== undefined) setNamingCategory(cached.namingCategory);
        if (cached.dynamicStyles !== undefined) setDynamicStyles(cached.dynamicStyles);
        if (cached.selectedStyle !== undefined) setSelectedStyle(cached.selectedStyle);
        if (cached.selectedCatalogs !== undefined) setSelectedCatalogs(cached.selectedCatalogs);
        if (cached.pinnedNames !== undefined) setPinnedNames(cached.pinnedNames);
        if (cached.nameLanguage !== undefined) setNameLanguage(cached.nameLanguage);
        if (cached.isGeneratingNames !== undefined) setIsGeneratingNames(cached.isGeneratingNames);
        if (cached.generatedNames !== undefined) setGeneratedNames(cached.generatedNames);
        if (cached.customNameInput !== undefined) setCustomNameInput(cached.customNameInput);
        if (cached.primaryColor !== undefined) setPrimaryColor(cached.primaryColor);
        if (cached.secondaryColor !== undefined) setSecondaryColor(cached.secondaryColor);
        if (cached.accentColor !== undefined) setAccentColor(cached.accentColor);
        if (cached.logoPreview !== undefined) setLogoPreview(cached.logoPreview);
        if (cached.isAnalyzingColors !== undefined) setIsAnalyzingColors(cached.isAnalyzingColors);
        if (cached.colorAnalysis !== undefined) setColorAnalysis(cached.colorAnalysis);
        if (cached.mockupView !== undefined) setMockupView(cached.mockupView);
        if (cached.brandArchetype !== undefined) setBrandArchetype(cached.brandArchetype);
        if (cached.headingFont !== undefined) setHeadingFont(cached.headingFont);
        if (cached.headingColor !== undefined) setHeadingColor(cached.headingColor);
        if (cached.bodyTextColor !== undefined) setBodyTextColor(cached.bodyTextColor);
        if (cached.buttonBgColor !== undefined) setButtonBgColor(cached.buttonBgColor);
        if (cached.buttonTextColor !== undefined) setButtonTextColor(cached.buttonTextColor);
        if (cached.buttonBorderColor !== undefined) setButtonBorderColor(cached.buttonBorderColor);
        if (cached.buttonRadius !== undefined) setButtonRadius(cached.buttonRadius);
        if (cached.buttonHoverBg !== undefined) setButtonHoverBg(cached.buttonHoverBg);
        if (cached.heroBgColor !== undefined) setHeroBgColor(cached.heroBgColor);
        if (cached.cardBgColor !== undefined) setCardBgColor(cached.cardBgColor);
        if (cached.cardBorderColor !== undefined) setCardBorderColor(cached.cardBorderColor);
        if (cached.customCssCode !== undefined) setCustomCssCode(cached.customCssCode);
        if (cached.appliedCssCode !== undefined) setAppliedCssCode(cached.appliedCssCode);

        // Special handling for aiData subfields
        if (cached.aiData !== undefined || cached.marketOpportunities !== undefined || cached.top10Leaders !== undefined) {
          setAiData(prev => ({
             ...prev, 
             ...(cached.aiData || {}),
             marketOpportunities: cached.marketOpportunities || cached.aiData?.marketOpportunities || prev.marketOpportunities,
             topLeaders: cached.top10Leaders || cached.aiData?.topLeaders || prev.topLeaders
          }));
        }
      }
      console.log("🔥 CACHE LOADED:", cached);
    }
  }, [isLoadingCache, cached]);

  // 2. Safe Auto-save (only runs after hydration)
  useEffect(() => {
    if (isLoadingCache || !hydratedRef.current) return;
    
    const timeout = setTimeout(() => {
      const payloadToSave = { 
        microNicheMode, analysisMode, activeTab, niches, loadingNiches, selectedNiche, selectedMicroNiche, customNicheInput, microSearchQuery, microFilterBadge, showAllMicroNiches, isAnalyzingNiche, targetCountry, isChangingMarket, isChangingCategory, isGlobalBenchmark, microNicheActiveTab, liveAiMicroIdeas, isFetchingLiveNiches, nicheAnalysis, nicheAnalysisOption, aiData, namingCategory, dynamicStyles, selectedStyle, selectedCatalogs, pinnedNames, nameLanguage, isGeneratingNames, generatedNames, customNameInput, primaryColor, secondaryColor, accentColor, logoPreview, isAnalyzingColors, colorAnalysis, mockupView, brandArchetype, headingFont, headingColor, bodyTextColor, buttonBgColor, buttonTextColor, buttonBorderColor, buttonRadius, buttonHoverBg, heroBgColor, cardBgColor, cardBorderColor, customCssCode, appliedCssCode,
        marketOpportunities: aiData?.marketOpportunities || null,
        top10Leaders: aiData?.topLeaders || []
      };
      saveResult(payloadToSave);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isLoadingCache, microNicheMode, analysisMode, activeTab, niches, loadingNiches, selectedNiche, selectedMicroNiche, customNicheInput, microSearchQuery, microFilterBadge, showAllMicroNiches, isAnalyzingNiche, targetCountry, isChangingMarket, isChangingCategory, isGlobalBenchmark, microNicheActiveTab, liveAiMicroIdeas, isFetchingLiveNiches, nicheAnalysis, nicheAnalysisOption, aiData, namingCategory, dynamicStyles, selectedStyle, selectedCatalogs, pinnedNames, nameLanguage, isGeneratingNames, generatedNames, customNameInput, primaryColor, secondaryColor, accentColor, logoPreview, isAnalyzingColors, colorAnalysis, mockupView, brandArchetype, headingFont, headingColor, bodyTextColor, buttonBgColor, buttonTextColor, buttonBorderColor, buttonRadius, buttonHoverBg, heroBgColor, cardBgColor, cardBorderColor, customCssCode, appliedCssCode]);
;

  useEffect(() => {
    // 1. Fetch niches for Tab 1

    const fetchNichesData = async () => {
      try {
        await seedNiches();
        let data = await getNiches();
        setNiches(data);
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
            setSelectedStyle((prev) => prev || defs.ecom[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching brand niches definitions:", error);
      }
    };
    fetchNamingDefs();
  }, []);

  // Update selected style when category changes
  const currentStyles = dynamicStyles[namingCategory] || [];
  let currentCatalogs =
    currentStyles.find((s) => s.id === selectedStyle)?.catalogs || [];

  if (!currentCatalogs || currentCatalogs.length === 0) {
    currentCatalogs = [
      { id: 'cat_general_premium', label_en: 'Premium Quality', label_ar: 'جودة متميزة' },
      { id: 'cat_general_modern', label_en: 'Modern Edge', label_ar: 'طابع عصري' },
      { id: 'cat_general_classic', label_en: 'Classic & Trust', label_ar: 'كلاسيك وموثوقية' },
      { id: 'cat_general_creative', label_en: 'Creative Identity', label_ar: 'هوية إبداعية' },
      { id: 'cat_general_global', label_en: 'Global Reach', label_ar: 'وصول عالمي' }
    ];
  }

  const isHydratingStyleCascade = useRef(true);
  useEffect(() => {
    if (isHydratingStyleCascade.current) {
      isHydratingStyleCascade.current = false;
      return;
    }
    if (
      currentStyles.length > 0 &&
      !currentStyles.find((s) => s.id === selectedStyle)
    ) {
      setSelectedStyle(currentStyles[0].id);
      setSelectedCatalogs([]);
    }
  }, [namingCategory, currentStyles]);

  // Sync state variables back to global context
  const handleNicheSelect = (n) => {
    if (selectedNiche?.id === n.id) return;
    setIsChangingCategory(true);
    setSelectedNiche(n);
    dispatch({ type: "SET_FIELD", field: "niche", value: n.id });
    dispatch({ type: "SET_FIELD", field: "subNiche", value: "" });
    setNicheAnalysis(null);
    setCustomNicheInput("");
    setMicroSearchQuery("");
    setShowAllMicroNiches(false);

    setAiData({
      benchmark: null,
      microNiches: [],
      marketOpportunities: null,
      topLeaders: [],
      loading: {
        benchmark: false,
        microNiches: false,
        opportunities: false,
        leaders: false
      },
      error: null
    });
    setLiveAiMicroIdeas([]);
    fetchAIData('benchmark', { niche: n });
    fetchAIData('microNiches', { niche: n });
    console.log("🚀 USER CLICKED GENERATE (Niche):", n);

    setTimeout(() => {
      setIsChangingCategory(false);
    }, 1600);
  };

  const handleSubNicheSelect = (sub) => {
    if (!sub) return;
    setSelectedMicroNiche(sub);
    dispatch({ type: "SET_FIELD", field: "subNiche", value: typeof sub === 'string' ? sub : (sub.title || sub.name || sub.id || sub) });
    setCustomNicheInput("");
    fetchAIData('opportunities', { microNiche: typeof sub === 'string' ? sub : (sub.title || sub.name || sub.id || sub) });
    fetchAIData('leaders', { microNiche: typeof sub === 'string' ? sub : (sub.title || sub.name || sub.id || sub) });
  };

  const handleCustomNicheChange = (val) => {
    setCustomNicheInput(val);
  };

  // Helper to determine if a niche is complex/unsuitable for beginners
  const isNicheComplex = (nicheName, catId) => {
    const complexKeywords = [
      "saas",
      "software",
      "برمجيات",
      "cybersecurity",
      "أمن سيبراني",
      "blockchain",
      "crypto",
      "عملات رقمية",
      "trading",
      "تداول",
      "عقارات",
      "أملاك",
    ];
    const nameLower = String(nicheName).toLowerCase();
    const catLower = String(catId).toLowerCase();
    return complexKeywords.some(
      (kw) => nameLower.includes(kw) || catLower.includes(kw),
    );
  };

  // Get dynamic badges for market indicators with Lucide Icons
  const getMarketBadges = (index) => {
    const badges = [
      {
        text: lang === "en" ? "Fast Trend" : "تريند سريع",
        class: "trend",
        IconComp: Flame,
      },
      {
        text: lang === "en" ? "High Profit" : "ربحية عالية",
        class: "profit",
        IconComp: Coins,
      },
      {
        text: lang === "en" ? "Stable Demand" : "طلب مستقر",
        class: "stable",
        IconComp: TrendingUp,
      },
      {
        text: lang === "en" ? "Freelance Ready" : "مناسب للعمل الحر",
        class: "freelance",
        IconComp: Briefcase,
      },
    ];
    return badges[index % badges.length];
  };

  // Toggle all catalogs selection
  const handleToggleAllCatalogs = () => {
    if (selectedCatalogs.length === currentCatalogs.length) {
      setSelectedCatalogs([]);
    } else {
      setSelectedCatalogs(currentCatalogs.map((c) => c.id));
    }
  };

  // Pin / Favorite brand name proposal
  const handleTogglePinName = (name) => {
    setPinnedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
    toast(
      pinnedNames.includes(name)
        ? lang === "en"
          ? `Removed "${name}" from pinned!`
          : `تم إزالة "${name}" من المفضلة!`
        : lang === "en"
          ? `Pinned "${name}" to favorites!`
          : `تم تثبيت "${name}" في المفضلة!`,
      "info",
    );
  };

  // Safe Copy helper to handle browser permission restrictions gracefully
  const safeCopyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch((err) => {
        console.warn("Navigator clipboard failed, falling back", err);
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
      return Promise.resolve();
    }
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
    document.body.removeChild(textarea);
  };

  // 1-Click Copy Brand Name
  const handleCopyName = (name, e) => {
    e.stopPropagation();
    safeCopyToClipboard(name);
    toast(
      lang === "en"
        ? `Copied "${name}" to clipboard!`
        : `تم نسخ "${name}" إلى الحافظة!`,
      "success",
    );
  };

  // Copy Color Palette
  const handleCopyColorPalette = () => {
    const paletteStr = `Primary: ${primaryColor}, Secondary: ${secondaryColor}, Accent: ${accentColor}`;
    safeCopyToClipboard(paletteStr);
    toast(
      lang === "en"
        ? "Color palette copied to clipboard!"
        : "تم نسخ باليت الألوان إلى الحافظة!",
      "success",
    );
  };

  // Copy Analysis Results
  const handleCopyAnalysis = () => {
    if (!nicheAnalysis) return;
    const summaryStr = `Verdict: ${nicheAnalysis.verdict || ''}\nICP: ${nicheAnalysis.icp?.age || ''} | ${nicheAnalysis.icp?.job || ''}\nNext: ${nicheAnalysis.nextStep || ''}`;
    safeCopyToClipboard(summaryStr);
    toast(
      lang === "en"
        ? "Analysis copied to clipboard!"
        : "تم نسخ نتيجة التحليل إلى الحافظة!",
      "success",
    );
  };

  // Export Complete Brand Kit
  const handleExportBrandKit = () => {
    const kitData = {
      brand_name: state.brandName || customNameInput || "Unassigned Brand",
      niche: selectedNiche
        ? lang === "en"
          ? selectedNiche.label_en
          : selectedNiche.label_ar
        : "General",
      sub_niche: state.subNiche || customNicheInput || "Niche Idea",
      brand_archetype: brandArchetype,
      color_palette: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
      target_audience: nicheAnalysis?.icp || {
        age: "22-45",
        job: "Target Segment",
      },
      generated_at: new Date().toLocaleDateString(),
    };
    const jsonStr = JSON.stringify(kitData, null, 2);
    safeCopyToClipboard(jsonStr);

    // Automatic download as JSON file
    try {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(state.brandName || "brand").toLowerCase()}-brand-kit.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }

    toast(
      lang === "en"
        ? "Complete Brand Kit downloaded & copied to clipboard!"
        : "تم تحميل ملف حقيبة البراند ونسخها للحافظة بنجاح!",
      "success",
    );
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (activeTab === "niche") return state.subNiche ? 33 : 15;
    if (activeTab === "name") return state.brandName ? 66 : 50;
    return 100;
  };

  // Parsing algorithm for AI response block
  const parseNicheAnalysis = (text) => {
    if (!text) return null;
    let verdict = "";
    let icp = { age: "", job: "", pain: "" };
    let nextStep = "";

    const lines = text.split("\n");
    let currentSection = "";
    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (
        cleanLine.includes("حكم السوق") ||
        cleanLine.toLowerCase().includes("verdict")
      ) {
        currentSection = "verdict";
      } else if (
        cleanLine.includes("العميل المثالي") ||
        cleanLine.toLowerCase().includes("customer") ||
        cleanLine.toLowerCase().includes("icp")
      ) {
        currentSection = "icp";
      } else if (
        cleanLine.includes("الخطوة التالية") ||
        cleanLine.includes("الربط") ||
        cleanLine.toLowerCase().includes("next")
      ) {
        currentSection = "next";
      }

      if (cleanLine) {
        if (currentSection === "verdict") {
          if (!cleanLine.startsWith("#"))
            verdict += (verdict ? "\n" : "") + cleanLine;
        } else if (currentSection === "icp") {
          if (cleanLine.includes("العمر") || cleanLine.includes("age")) {
            icp.age = cleanLine.replace(/.*[:\-]/, "").trim();
          } else if (
            cleanLine.includes("الوظيفة") ||
            cleanLine.includes("job") ||
            cleanLine.includes("وظيفته")
          ) {
            icp.job = cleanLine.replace(/.*[:\-]/, "").trim();
          } else if (
            cleanLine.includes("ألم") ||
            cleanLine.includes("pain") ||
            cleanLine.includes("الألم")
          ) {
            icp.pain = cleanLine.replace(/.*[:\-]/, "").trim();
          } else if (!cleanLine.startsWith("*") && !cleanLine.startsWith("#")) {
            if (!icp.pain) icp.pain = cleanLine;
          }
        } else if (currentSection === "next") {
          if (!cleanLine.startsWith("#"))
            nextStep += (nextStep ? "\n" : "") + cleanLine;
        }
      }
    });

    if (!verdict) verdict = text.split("\n\n")[0] || text;
    if (!icp.age) icp.age = lang === "en" ? "22 - 40 Years" : "22 - 40 سنة";
    if (!icp.job)
      icp.job =
        lang === "en"
          ? "Freelancer / Small Business"
          : "فريلانسر أو صاحب عمل صغير";
    if (!icp.pain)
      icp.pain =
        lang === "en"
          ? "Finding reliable customers and pricing correctly"
          : "الحصول على عملاء مستمرين وتسعير خدماتهم بدقة";
    if (!nextStep)
      nextStep =
        lang === "en"
          ? "To attract this customer, you will need a strong brand name and professional visual identity. Click Next to start."
          : "لجذب هذا العميل، ستحتاج لاسم براند قوي وهوية بصرية تعكس الاحترافية .. اضغط التالي لنبدأ.";

    return { verdict, icp, nextStep };
  };

  // Tab 1: Analyze Click
  const handleAnalyzeNiche = async () => {
    if (!state.subNiche) return;
    setIsAnalyzingNiche(true);

    try {
      if (analysisMode === "live") {
        await Promise.all([
          fetchAIData('opportunities'),
          fetchAIData('leaders')
        ]);
      } else {
        // Fast Radar Mode -> Load directly from Firebase / Firestore local DB
        let dbResult = null;
        try {
          dbResult = await getNicheAnalysis(state.subNiche);
        } catch (e) {
          console.log("Firebase getNicheAnalysis fetch:", e);
        }

        if (dbResult && (dbResult.opportunities || dbResult.strengths)) {
          setAiData(prev => ({
            ...prev,
            marketOpportunities: dbResult.opportunities || {
              strengths: dbResult.strengths || [],
              gaps: dbResult.gaps || [],
              recommendations: dbResult.recommendations || []
            },
            topLeaders: dbResult.leaders || dbResult.topLeaders || []
          }));
        } else {
          // Fast Mode Firebase / Local Preset Metrics
          setAiData(prev => ({
            ...prev,
            marketOpportunities: {
              strengths: [
                lang === 'en' ? 'High market demand & strong scalability' : 'طلب مرتفع وإمكانية توسّع ممتازة في السوق',
                lang === 'en' ? 'Low overhead start-up investment' : 'استثمار أولي منخفض التكاليف التشغيلية',
                lang === 'en' ? 'Recurring monthly retainer potential' : 'فرصة بناء عوائد شهرية متكررة Retainers'
              ],
              gaps: [
                lang === 'en' ? 'Lack of specialized local service providers' : 'نقص بالمزودين المتخصصين ذوي الجودة العالية',
                lang === 'en' ? 'Standardized pricing & packaging gap' : 'غياب معايير تسعير وباقات واضحة في السوق'
              ],
              recommendations: [
                lang === 'en' ? 'Focus on high-ticket specialized offers' : 'التركيز على العروض المتخصصة عالية القيمة',
                lang === 'en' ? 'Build strong client case studies early' : 'بناء دراسات حالة ونتائج سريعة للعملاء الأوائل'
              ]
            },
            topLeaders: [
              { name: `${state.subNiche} Hub`, secret: 'Market specialization & speed', url: '#' },
              { name: `Pro ${state.subNiche} Solutions`, secret: 'Automated client acquisition', url: '#' }
            ]
          }));
        }
      }

      const subName = state.subNiche;

      let dynamicAge = "22 - 45";
      if (subName) {
        const n = subName.toLowerCase();
        // 1. Kids / Children / Education (Parents / Educators)
        if (n.includes("أطفال") || n.includes("تعليم") || n.includes("مدرسة") || n.includes("لعب") || n.includes("تربية") || n.includes("kids") || n.includes("children") || n.includes("education") || n.includes("school") || n.includes("learning") || n.includes("toys")) {
          dynamicAge = "25 - 40";
        }
        // 2. Heritage / Culture / Art / Traditional
        else if (n.includes("تراث") || n.includes("ثقافة") || n.includes("فن") || n.includes("تقليدي") || n.includes("تاريخ") || n.includes("heritage") || n.includes("culture") || n.includes("art") || n.includes("traditional") || n.includes("history")) {
          dynamicAge = "25 - 60";
        }
        // 3. Freelancing / Digital Content Creation / Production
        else if (n.includes("إنتاج") || n.includes("صناعة محتوى") || n.includes("فيديو") || n.includes("مستقل") || n.includes("موشن") || n.includes("تسويق") || n.includes("production") || n.includes("content") || n.includes("video") || n.includes("freelance") || n.includes("motion") || n.includes("creator")) {
          dynamicAge = "20 - 38";
        }
        // 4. Gen-Z / Younger Audience
        else if (n.includes("tiktok") || n.includes("gaming") || n.includes("gen-z") || n.includes("student") || n.includes("influencer") || n.includes("ألعاب") || n.includes("طالب")) {
          dynamicAge = "18 - 28";
        }
        // 5. Older / High-End Corporate B2B
        else if (n.includes("b2b") || n.includes("corporate") || n.includes("enterprise") || n.includes("real estate") || n.includes("consulting") || n.includes("شركات") || n.includes("عقارات") || n.includes("استشارات")) {
          dynamicAge = "30 - 55";
        }
        // 6. Mid-Career / SaaS / E-com
        else if (n.includes("saas") || n.includes("ecom") || n.includes("ecommerce") || n.includes("agency") || n.includes("متجر") || n.includes("تجارة")) {
          dynamicAge = "25 - 45";
        }
      }
      setNicheAnalysis({
        verdict: lang === "en" 
          ? `High growth potential identified in ${subName} for target market.`
          : `تم رصد فرصة نمو عالية وممتازة في تخصص ${subName} في السوق المستهدف.`,
        icp: {
          age: (typeof dbResult !== 'undefined' && dbResult?.target_audience?.demographics) ? dbResult.target_audience.demographics : dynamicAge,
          job: subName,
          pain: lang === "en" ? "Demand for high-efficiency specialized AI workflows" : "الاحتياج لنظام وأتمتة مخصصة وعالية الكفاءة"
        },
        nextStep: lang === "en" ? "Proceed to Brand Naming tab." : "الانتقال لتبويب اختيار اسم البراند."
      });

      dispatch({ type: "COMPLETE_STEP", step: "niche-selection" });
      toast(
        lang === "en"
          ? (analysisMode === "live" ? "Niche opportunity analyzed via Live AI!" : "Fast Radar analysis loaded from database!")
          : (analysisMode === "live" ? "تم تحليل فرصة النيش بنجاح بالذكاء الاصطناعي!" : "تم تحميل تحليل الرادار السريع من قاعدة البيانات!"),
        "success",
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingNiche(false);
    }
  };

  // Tab 2: Brand naming generation
  const handleGenerateNames = async () => {
    if (selectedCatalogs.length === 0) {
      const sampleCat = currentCatalogs && currentCatalogs[0]
        ? (lang === "en" ? `+ ${currentCatalogs[0].label_en}` : `+ ${currentCatalogs[0].label_ar}`)
        : "+ Streetwear";

      toast(
        lang === "en"
          ? `Please select at least one catalog category (e.g., ${sampleCat}) under 'SELECT CATALOGS TO LOAD' before generating names.`
          : `الرجاء اختيار كتالوج واحد على الأقل (مثل: ${sampleCat}) من قوائم الكتالوج المتاحة قبل توليد الأسماء.`,
        "warning",
      );
      return;
    }

    setIsGeneratingNames(true);
    setGeneratedNames(null);

    try {
      if (analysisMode === "live") {
        const liveData = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
          toolId: "brand-naming",
          inputs: {
            category: namingCategory,
            style: selectedStyle,
            nameLanguage,
            catalogs: selectedCatalogs,
          },
          context: { niche: state.niche },
          lang,
          costKey: 'costBrandNamingStudio'
        });
        if (liveData && liveData.names) {
          const results = {
            live_ai: liveData.names.map((n) => ({
              name: n.name,
              meaning_ar: n.slogan || n.meaning,
              meaning_en: n.slogan || n.meaning,
              type: n.style || "hybrid",
            })),
          };
          setGeneratedNames(results);
          // EXPLICIT SAVE FOR BRAND NAMES
          setTimeout(() => {
            saveResult({ ...cached, namingCategory, selectedStyle, nameLanguage, selectedCatalogs, generatedNames: results });
          }, 100);
        }
      } else {
        await new Promise((r) => setTimeout(r, 400));
        const dbResult = await getBrandNames(selectedStyle);

        const results = {};
        const getRandomNames = (arr) => {
          if (!arr || arr.length === 0) return [];
          const filtered = arr.filter((item) => {
            if (nameLanguage === "ar")
              return item.type === "ar" || item.type === "hybrid";
            if (nameLanguage === "en")
              return item.type === "en" || item.type === "hybrid";
            return true;
          });
          return [...filtered].sort(() => 0.5 - Math.random()).slice(0, 15);
        };

        const { generateForCatalog } = await import("../../../services/seedPart6_brands");

        for (const catId of selectedCatalogs) {
          let catalogItems = dbResult?.catalogs?.[catId];
          if (!catalogItems || catalogItems.length === 0) {
            catalogItems = generateForCatalog(selectedStyle, catId, 40);
          }
          results[catId] = getRandomNames(catalogItems);
        }

        setGeneratedNames(results);
          // EXPLICIT SAVE FOR BRAND NAMES
          setTimeout(() => {
            saveResult({ ...cached, namingCategory, selectedStyle, nameLanguage, selectedCatalogs, generatedNames: results });
          }, 100);
      }
      toast(
        lang === "en"
          ? "Brand name proposals generated!"
          : "تم توليد مقترحات أسماء البراند!",
        "success",
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const handleNameSelect = (name) => {
    setCustomNameInput(name);
    dispatch({ type: "SET_FIELD", field: "brandName", value: name });
    toast(lang === "en" ? `Selected "${name}"` : `تم اختيار "${name}"`, "info");
  };

  const handleConfirmName = () => {
    if (!customNameInput) return;
    dispatch({ type: "SET_FIELD", field: "brandName", value: customNameInput });
    dispatch({ type: "COMPLETE_STEP", step: "brand-naming" });
    toast(
      lang === "en"
        ? `Brand name "${customNameInput}" confirmed!`
        : `تم اعتماد اسم البراند "${customNameInput}"!`,
      "success",
    );
    setActiveTab("identity");
  };

  // Tab 3: Visual identity picker and analysis
  const handleColorChange = (type, hex) => {
    if (type === "primary") {
      setPrimaryColor(hex);
      dispatch({ type: "SET_FIELD", field: "primaryColor", value: hex });
    } else if (type === "secondary") {
      setSecondaryColor(hex);
      dispatch({ type: "SET_FIELD", field: "secondaryColor", value: hex });
    } else if (type === "accent") {
      setAccentColor(hex);
      dispatch({ type: "SET_FIELD", field: "accentColor", value: hex });
    }
    setColorAnalysis(null);
  };

  const handlePresetSelect = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setAccentColor(preset.accent);
    setButtonBgColor(preset.accent || preset.primary);
    setButtonBorderColor(preset.primary);
    dispatch({
      type: "SET_FIELD",
      field: "primaryColor",
      value: preset.primary,
    });
    dispatch({
      type: "SET_FIELD",
      field: "secondaryColor",
      value: preset.secondary,
    });
    dispatch({ type: "SET_FIELD", field: "accentColor", value: preset.accent });
    setColorAnalysis(null);
    toast(
      lang === "en"
        ? `Applied "${preset.name}" palette!`
        : `تم تطبيق باليت "${preset.name}"!`,
      "info",
    );
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoPreview(ev.target.result);
        dispatch({ type: "SET_FIELD", field: "logo", value: ev.target.result });
        toast(
          lang === "en"
            ? "Logo uploaded for mockup!"
            : "تم رفع الشعار للمعاينة!",
          "success",
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeColors = async () => {
    setIsAnalyzingColors(true);
    setColorAnalysis(null);
    let finalAnalysis = null;
    try {
      if (analysisMode === "live") {
        const liveData = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
          toolId: "visual-identity",
          inputs: { primaryColor, secondaryColor, accentColor },
          context: { niche: state.niche, brandName: state.brandName },
          lang,
          costKey: 'costVisualIdentity'
        });
        if (liveData) {
          setIsNewlyGeneratedColors(true);
          finalAnalysis = {
            psychology_ar:
              liveData.psychology ||
              "تحليل مباشر بالذكاء الاصطناعي للهوية البصرية.",
            psychology_en:
              liveData.psychology ||
              "Live AI psychology analysis of visual identity.",
            brand_tone_ar: liveData.audience_perception || "طابع احترافي ومميز",
            brand_tone_en:
              liveData.audience_perception || "Professional brand tone",
            font_pairings_ar: liveData.recommended_fonts || "Cairo / Tajawal",
            font_pairings_en: liveData.recommended_fonts || "Inter / Roboto",
            recommended_industries_ar: [state.niche || "التجارة الرقمية"],
            recommended_industries_en: [state.niche || "Digital Business"],
            dos_and_donts_ar: Array.isArray(liveData.usage_tips)
              ? liveData.usage_tips.join("\n")
              : liveData.usage_tips || "",
            dos_and_donts_en: Array.isArray(liveData.usage_tips)
              ? liveData.usage_tips.join("\n")
              : liveData.usage_tips || "",
          };
          setColorAnalysis(finalAnalysis);
        }
      } else {
        await new Promise((r) => setTimeout(r, 600));
        const activePreset = PRESETS_PALETTES.find(
          (p) => p.primary === primaryColor,
        ) || { name: "Blue" };
        const dbResult = await getColorAnalysis(
          activePreset.name.replace(" ", "").toLowerCase(),
        );
        if (dbResult) {
          finalAnalysis = dbResult;
          setColorAnalysis(finalAnalysis);
          setIsNewlyGeneratedColors(true);
        } else {
          finalAnalysis = {
            psychology_ar:
              "هذا التناسق اللوني يعطي طابعاً احترافياً وموثوقاً لمشروعك، ويزيد من إحساس الالتزام والجودة العالية.",
            psychology_en:
              "This color combination gives a highly professional and trustworthy character to your brand, enhancing user focus.",
            brand_tone_ar: "نبرة واثقة، قوية، وموجهة للنتائج",
            brand_tone_en: "Confident, powerful, and results-oriented",
            font_pairings_ar: "Cairo / Tajawal",
            font_pairings_en: "Outfit / Inter",
            recommended_industries_ar: [
              "الخدمات والتعليم",
              "التقنية والـ SaaS",
              "التجارة الاحترافية",
            ],
            recommended_industries_en: [
              "Services & Education",
              "Tech & SaaS",
              "Professional E-commerce",
            ],
            dos_and_donts_ar:
              "افعل: استخدم اللون الأساسي في أزرار الدعوة للإجراء (CTA).\nلا تفعل: تجنب دمج نصوص باهتة فوق اللون الأساسي للحفاظ على التباين.",
            dos_and_donts_en:
              "Do: Use the primary color for Call-to-Action buttons.\nDon't: Avoid low-contrast text on primary background.",
          };
          setColorAnalysis(finalAnalysis);
        }
      }
      dispatch({ type: "COMPLETE_STEP", step: "visual-identity" });
      dispatch({ type: "COMPLETE_STEP", step: "analysis-identity" });
      toast(
        lang === "en"
          ? "Visual identity applied!"
          : "تم تطبيق الهوية البصرية بنجاح!",
        "success",
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingColors(false);
      // EXPLICIT SAVE FOR VISUAL IDENTITY
      setTimeout(() => {
        saveResult({ ...cached, colorAnalysis: finalAnalysis, primaryColor: newPrimary, secondaryColor: newSecondary, accentColor: newAccent, headingFont: newFont, bodyTextColor: newBodyColor, heroBgColor: newHeroBg, buttonBgColor: newPrimary, cardBgColor: newCardBg, cardBorderColor: newAccent });
      }, 100);
    }
  };

  // Convert currentStyles to CustomDropdown Options
  const styleOptions = currentStyles.map((s) => ({
    value: s.id,
    label: `${lang === "en" ? s.label_en : s.label_ar}`,
  }));

  // Filter Micro Niches based on Search Query & Live AI Mode
  const rawMicroIdeas = selectedNiche
    ? aiData.microNiches.length > 0
      ? aiData.microNiches
      : liveAiMicroIdeas.length > 0
      ? liveAiMicroIdeas
      : lang === "en"
      ? selectedNiche.ideas_en || []
      : selectedNiche.ideas_ar || []
    : [];
  const filteredIdeas = rawMicroIdeas.filter(
    (idea) =>
      !microSearchQuery ||
      idea.toLowerCase().includes(microSearchQuery.toLowerCase()),
  );
  const displayedMicroNiches =
    showAllMicroNiches || microSearchQuery
      ? filteredIdeas
      : filteredIdeas.slice(0, 8);


  const handleResetSession = () => {
    if (activeTab === "niche") {
      setSelectedNiche(null);
      setSelectedMicroNiche(null);
      dispatch({ type: 'SET_FIELD', field: 'niche', value: '' });
      dispatch({ type: 'SET_FIELD', field: 'subNiche', value: '' });
      setCustomNicheInput("");
      setNicheAnalysis(null);
      setAiData({
        benchmark: null,
        microNiches: [],
        marketOpportunities: null,
        topLeaders: [],
        loading: {
          benchmark: false,
          microNiches: false,
          opportunities: false,
          leaders: false
        },
        error: null
      });
      setLiveAiMicroIdeas([]);
      saveResult({ ...cached, selectedNiche: null, selectedMicroNiche: null, customNicheInput: "", aiData: null, nicheAnalysis: null, liveAiMicroIdeas: [] });
    } else if (activeTab === "name") {
      setGeneratedNames(null);
      setSelectedCatalogs([]);
      setCustomNameInput("");
      setPinnedNames([]);
      saveResult({ ...cached, generatedNames: null, selectedCatalogs: [], customNameInput: "", pinnedNames: [] });
    } else if (activeTab === "identity") {
      setColorAnalysis(null);
      setLogoPreview(null);
      saveResult({ ...cached, colorAnalysis: null, logoPreview: null });
    }
  };

  const activeNicheTitle = 
    selectedMicroNiche?.title || 
    selectedMicroNiche?.name || 
    (typeof selectedMicroNiche === 'string' ? selectedMicroNiche : null) || 
    (lang === "en" ? selectedNiche?.label_en : selectedNiche?.label_ar) ||
    selectedNiche?.title || 
    selectedNiche?.name || 
    (typeof selectedNiche === 'string' ? selectedNiche : null) || 
    (lang === "en" ? "Please select or type a niche" : "الرجاء تحديد أو كتابة النيش");

  const shouldShowAnalysis = Boolean(
    selectedMicroNiche || 
    state.subNiche || 
    selectedNiche || 
    aiData?.marketOpportunities || 
    aiData?.topLeaders
  );

  return (
    <div className="ai-container animate-fade-in" dir={isRtl ? "rtl" : "ltr"}>
      {/* ═══ STEP PROGRESS BAR + FLOATING PILL TAB BAR ═══ */}
      <div className="ai-tabs-header-wrap" style={{ position: 'relative' }}>
        <button
          onClick={handleResetSession}
          style={{
            position: 'absolute',
            left: isRtl ? 'auto' : '20px',
            right: isRtl ? '20px' : 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
        >
          <RefreshCw size={12} />
          {lang === 'en' ? 'Reset' : 'إعادة ضبط'}
        </button>

        {/* Slim progress track */}
        <div className="ai-progress-track">
          <div
            className="ai-progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Centered floating pill container */}
        <div className="ai-tabs-header">
          {/* Tab 01 */}
          <button
            type="button"
            onClick={() => { setIsNewlyGeneratedColors(false); setActiveTab("niche"); }}
            className={`ai-tab-btn ${activeTab === "niche" ? "active" : ""}`}
          >
            <span className="ai-tab-step-badge">01</span>
            <Target size={14} strokeWidth={1.5} />
            <span>{lang === "en" ? "Niche Selection" : "اختيار النيش"}</span>
            {(state.completedSteps || []).includes("niche-selection") && (
              <CheckCircle2
                size={13}
                strokeWidth={1.5}
                color={activeTab === "niche" ? "#ffffff" : "#6366F1"}
              />
            )}
          </button>

          {/* Divider dot */}
          <div
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              flexShrink: 0,
            }}
          />

          {/* Tab 02 */}
          <button
            type="button"
            onClick={() => { setIsNewlyGeneratedColors(false); setActiveTab("name"); }}
            disabled={!state.niche}
            className={`ai-tab-btn ${activeTab === "name" ? "active" : ""}`}
          >
            <span className="ai-tab-step-badge">02</span>
            <Wand2 size={14} strokeWidth={1.5} />
            <span>{lang === "en" ? "Brand Naming" : "اسم البراند"}</span>
            {(state.completedSteps || []).includes("brand-naming") && (
              <CheckCircle2
                size={13}
                strokeWidth={1.5}
                color={activeTab === "name" ? "#ffffff" : "#6366F1"}
              />
            )}
          </button>

          {/* Divider dot */}
          <div
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              flexShrink: 0,
            }}
          />

          {/* Tab 03 */}
          <button
            type="button"
            onClick={() => { setIsNewlyGeneratedColors(false); setActiveTab("identity"); }}
            disabled={!state.brandName || !state.niche}
            className={`ai-tab-btn ${activeTab === "identity" ? "active" : ""}`}
          >
            <span className="ai-tab-step-badge">03</span>
            <Palette size={14} strokeWidth={1.5} />
            <span>{lang === "en" ? "Visual Identity" : "الهوية البصرية"}</span>
            {(state.completedSteps || []).includes("visual-identity") && (
              <CheckCircle2
                size={13}
                strokeWidth={1.5}
                color={activeTab === "identity" ? "#ffffff" : "#6366F1"}
              />
            )}
          </button>
        </div>
      </div>

      {/* ──────────────── TAB 1: NICHE SELECTION ──────────────── */}
      {activeTab === "niche" && (
        <motion.div
          className="ai-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Target size={18} color="#6366F1" strokeWidth={1.5} />
              <span>
                {lang === "en"
                  ? "Strategic Niche Selection"
                  : "تحديد نيش البزنس الخاص بك"}
              </span>
            </h2>
          </div>

          {/* ═══════════════ 1. TARGET MARKET & GLOBAL BENCHMARK FILTER BAR ═══════════════ */}
          <div
            className="ns-panel-card"
            style={{
              padding: '18px 20px',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 100,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              {/* Target Country Selector */}
              <div style={{ flex: '1 1 280px', position: 'relative', zIndex: 200 }}>
                <label
                  className="ns-label"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: '800',
                    marginBottom: '8px',
                  }}
                >
                  <Globe size={16} color="#6366F1" />
                  <span>
                    {lang === 'en'
                      ? 'Select Your Target Market / اختر سوقك المستهدف أولاً'
                      : 'اختر سوقك المستهدف أولاً (Target Market)'}
                  </span>
                </label>
                <TargetMarketDropdown
                  value={targetCountry}
                  onChange={handleTargetCountryChange}
                  options={COUNTRY_OPTIONS}
                  lang={lang}
                  isLoading={isMarketLoading}
                />
              </div>

              {/* Global Benchmark Toggle */}
              <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onClick={() => setIsGlobalBenchmark(!isGlobalBenchmark)}
                  className="ns-benchmark-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: isGlobalBenchmark
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(16, 185, 129, 0.25))'
                      : 'transparent',
                    border: `1px solid ${isGlobalBenchmark ? '#6366F1' : 'rgba(255, 255, 255, 0.1)'}`,
                    padding: '10px 18px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Globe size={18} color={isGlobalBenchmark ? '#10B981' : '#94A3B8'} />
                  <div>
                    <div className="ns-heading-title" style={{ fontSize: '13px', fontWeight: '800' }}>
                      {lang === 'en' ? 'Global Benchmark / عالمي' : 'المقارنة المرجعية العالمية (Global)'}
                    </div>
                    <div className="ns-subtext" style={{ fontSize: '11px' }}>
                      {lang === 'en' ? 'Compare primary vs. top potential market' : 'قارن سوقك المحلي بأفضل سوق بديل'}
                    </div>
                  </div>
                  <div
                    style={{
                      width: '40px',
                      height: '22px',
                      borderRadius: '11px',
                      background: isGlobalBenchmark ? '#10B981' : '#334155',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      marginLeft: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: '3px',
                        left: isGlobalBenchmark ? '21px' : '3px',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Target Market Loading Banner (Suitable for Light & Dark Mode) */}
            <AnimatePresence>
              {isMarketLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="ns-market-loading-banner"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div className="ns-market-flag-avatar">
                        <span>{COUNTRY_OPTIONS.find((c) => c.id === targetCountry)?.flag || '🇸🇦'}</span>
                        <div
                          style={{
                            position: 'absolute',
                            inset: '-4px',
                            borderRadius: '16px',
                            border: '2px solid #6366F1',
                            animation: 'nsPulseGlow 1.5s infinite',
                            pointerEvents: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <div className="ns-market-loading-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Loader2 size={16} color="#6366F1" className="spin" />
                          <span>
                            {lang === 'en'
                              ? `Recalibrating Market Intelligence for ${COUNTRY_OPTIONS.find((c) => c.id === targetCountry)?.name_en || 'Target Market'}...`
                              : `جاري إعادة معايرة واستدعاء بيانات السوق لـ ${COUNTRY_OPTIONS.find((c) => c.id === targetCountry)?.name_ar || 'السوق المستهدف'}...`}
                          </span>
                        </div>
                        <div className="ns-market-loading-subtext" style={{ marginTop: '4px' }}>
                          {lang === 'en'
                            ? 'Updating local CAGR growth rates, market saturation radar, and purchasing power benchmarks.'
                            : 'جاري تحديث معدلات النمو المحلي (CAGR)، مؤشر التشبع، والقوة الشرائية المنافسة.'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.12)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                      <Compass size={14} color="#6366F1" className="spin" />
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366F1' }}>
                        {lang === 'en' ? 'Market Switch Active' : 'تحديث السوق مفعّل'}
                      </span>
                    </div>
                  </div>

                  <div className="ns-progress-track">
                    <div className="ns-progress-bar-fill" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Benchmark Comparative Summary Box */}
            {isGlobalBenchmark && (
              <div
                className="ns-global-card"
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontWeight: '800', fontSize: '13px' }}>
                  <ArrowRightLeft size={16} />
                  <span>
                    {lang === 'en'
                      ? 'AI Benchmark Comparison Cycle: Primary Market vs. Recommended Alternative'
                      : 'دورة المقارنة المرجعية الذكية: سوقك الأساسي مقارنة بالسوق الأكثر نمواً'}
                  </span>
                </div>

                {aiData.loading.benchmark ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '12px', padding: '12px' }}>
                    <Loader2 size={16} className="spin" />
                    <span>{lang === 'en' ? 'Fetching live AI benchmark comparison...' : 'جاري تحليل المقارنة المرجعية عبر الذكاء الاصطناعي...'}</span>
                  </div>
                ) : aiData.benchmark ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      <div className="ns-subcard" style={{ padding: '14px', borderRadius: '12px' }}>
                        <div className="ns-subtext" style={{ fontSize: '12px', fontWeight: '700' }}>
                          {lang === 'en' ? 'Primary Target Country:' : 'سوقك المستهدف الأساسي:'}
                        </div>
                        <div className="ns-heading-title" style={{ fontSize: '15px', fontWeight: '900', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{COUNTRY_OPTIONS.find(c => c.id === targetCountry)?.flag || '🇸🇦'}</span>
                          <span>{lang === 'en' ? COUNTRY_OPTIONS.find(c => c.id === targetCountry)?.name_en : COUNTRY_OPTIONS.find(c => c.id === targetCountry)?.name_ar}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#10B981', marginTop: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} color="#10B981" />
                          <span>{aiData.benchmark.primaryMarket?.cagr || '—'}</span>
                        </div>
                      </div>

                      <div className="ns-opp-card-green" style={{ padding: '14px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>
                          {lang === 'en' ? 'Recommended Benchmark Country:' : 'السوق المرجعي الموصى به:'}
                        </div>
                        <div className="ns-heading-title" style={{ fontSize: '15px', fontWeight: '900', marginTop: '4px' }}>
                          {aiData.benchmark.alternativeMarket?.name || '—'}
                        </div>
                        <div className="ns-list-item" style={{ fontSize: '11px', marginTop: '6px', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Zap size={14} color="#F59E0B" />
                          <span>{aiData.benchmark.alternativeMarket?.surge || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {aiData.benchmark.recommendation && (
                      <div className="ns-subcard" style={{ fontSize: '12px', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={14} color="#F59E0B" />
                        <span className="ns-list-item">{aiData.benchmark.recommendation}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="ns-subtext" style={{ fontSize: '12px', textAlign: 'center', padding: '10px' }}>
                    {lang === 'en' ? 'Select a niche to calculate benchmark comparison.' : 'اختر تخصصاً لحساب المقارنة المرجعية.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Niches Grid with Vector Icon Mapping */}
          {loadingNiches ? (
            <div style={{ textAlign: "center", padding: "24px" }}>
              <div className="td-spinner" />
            </div>
          ) : (
            <div className="niche-grid" style={{ marginBottom: "20px" }}>
              {niches.map((n) => {
                const isSelected = selectedNiche?.id === n.id;
                const NicheIconComp = NICHE_ICON_MAP[n.id] || Sparkles;
                return (
                  <motion.div
                    key={n.id}
                    className={`niche-card ${isSelected ? "active" : ""}`}
                    onClick={() => handleNicheSelect(n)}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="niche-icon">
                      <NicheIconComp size={18} strokeWidth={1.5} />
                    </div>
                    <div className="niche-label">
                      {lang === "en" ? n.label_en : n.label_ar}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ═══════════════ 2. MAIN NICHE STATS & DEEP DIVE SECTION ═══════════════ */}
          {!selectedNiche ? (
            <CategorySelectPrompt lang={lang} />
          ) : isCategoryLoading ? (
            <FullPageCategoryLoader selectedNiche={selectedNiche} lang={lang} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNiche.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="ns-panel-card"
                  style={{
                    padding: '18px 20px',
                    marginBottom: '20px',
                  }}
                >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <BarChart3 size={20} color="#6366F1" />
                <h4 className="ns-heading-title" style={{ margin: 0, fontSize: '14px', fontWeight: '900' }}>
                  {lang === 'en' ? `AI Market Insights: ${selectedNiche.label_en || selectedNiche.id}` : `مؤشرات الذكاء الاصطناعي لتخصص: ${selectedNiche.label_ar || selectedNiche.id}`}
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="ns-subcard" style={{ padding: '14px', borderRadius: '12px' }}>
                  <div className="ns-subtext" style={{ fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={14} color="#10B981" />
                    <span>{lang === 'en' ? 'Market Growth Rate' : 'حجم نمو المجال (CAGR)'}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#10B981', marginTop: '6px' }}>
                    {aiData.loading.benchmark ? '…' : (aiData.benchmark?.primaryMarket?.cagr || '—')}
                  </div>
                </div>

                <div className="ns-subcard" style={{ padding: '14px', borderRadius: '12px' }}>
                  <div className="ns-subtext" style={{ fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={14} color="#3B82F6" />
                    <span>{lang === 'en' ? 'Market Saturation' : 'مدى تشبع السوق'}</span>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: aiData.benchmark?.primaryMarket?.saturation === 'blue' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: aiData.benchmark?.primaryMarket?.saturation === 'blue' ? '#10B981' : '#EF4444',
                        border: `1px solid ${aiData.benchmark?.primaryMarket?.saturation === 'blue' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        display: 'inline-block',
                      }}
                    >
                      {aiData.loading.benchmark ? '…' : (aiData.benchmark?.primaryMarket?.saturationText || '—')}
                    </span>
                  </div>
                </div>

                <div className="ns-subcard" style={{ padding: '14px', borderRadius: '12px' }}>
                  <div className="ns-subtext" style={{ fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coins size={14} color="#F59E0B" />
                    <span>{lang === 'en' ? 'Expected ROI' : 'العائد المتوقع على الاستثمار'}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#F59E0B', marginTop: '6px' }}>
                    {aiData.loading.benchmark ? '…' : (aiData.benchmark?.primaryMarket?.roi || '—')}
                  </div>
                </div>
              </div>
            </div>

          {/* Error Banner */}
          {aiData.error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '16px', marginBottom: '20px', textAlign: 'center', color: '#F87171' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>{aiData.error}</div>
              <button
                type="button"
                onClick={() => {
                  fetchAIData('benchmark');
                  fetchAIData('microNiches');
                }}
                style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
              >
                {lang === 'en' ? 'Retry AI Fetch' : 'إعادة محاولة الاتصال بالذكاء الاصطناعي'}
              </button>
            </div>
          )}

          {/* Sub-niches Advanced List */}
          <div
            className="ns-panel-card"
            style={{
              padding: "18px",
              marginBottom: "20px",
            }}
          >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    color: "#fff",
                    margin: 0,
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Sparkles size={15} color="#6366F1" strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "Select Micro-Niche Idea:"
                      : "استكشف التخصصات الدقيقة الممتازة:"}
                  </span>
                </h4>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button
                      type="button"
                      onClick={() => setMicroNicheMode('fast')}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        background: microNicheMode === 'fast' ? '#6366F1' : 'transparent',
                        color: microNicheMode === 'fast' ? '#fff' : '#94A3B8',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Zap size={12} />
                      <span>{lang === 'en' ? 'Fast Mode (Instant Radar)' : 'النمط السريع (مسبق)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMicroNicheMode('live');
                        fetchAIData('microNiches');
                      }}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        background: microNicheMode === 'live' ? '#6366F1' : 'transparent',
                        color: microNicheMode === 'live' ? '#fff' : '#94A3B8',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Bot size={12} />
                      <span>{lang === 'en' ? 'Live AI (Generate)' : 'ذكاء اصطناعي مباشر (توليد)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMicroNicheMode('custom')}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        background: microNicheMode === 'custom' ? '#6366F1' : 'transparent',
                        color: microNicheMode === 'custom' ? '#fff' : '#94A3B8',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Edit3 size={12} />
                      <span>{lang === 'en' ? 'Custom Idea' : 'فكرة مخصصة'}</span>
                    </button>
                  </div>

                  {microNicheMode === 'live' && (
                    <button
                      type="button"
                      onClick={() => fetchAIData('microNiches')}
                      disabled={aiData.loading.microNiches}
                      style={{
                        background: 'rgba(99, 102, 241, 0.25)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: '#818CF8',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <RefreshCw size={12} className={aiData.loading.microNiches ? 'spin' : ''} />
                      <span>{lang === 'en' ? 'Regenerate via Live AI' : 'توليد أفكار جديدة عبر الذكاء الاصطناعي'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Professional Filter Bar */}
              {microNicheMode !== 'custom' && !aiData.loading.microNiches && (
                <div style={{ marginBottom: '14px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px 14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    {/* Search Input Filter */}
                    <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
                      <Search size={13} color="#818CF8" style={{ position: 'absolute', top: '9px', [isRtl ? 'right' : 'left']: '10px' }} />
                      <input
                        type="text"
                        value={microSearchQuery}
                        onChange={(e) => setMicroSearchQuery(e.target.value)}
                        placeholder={lang === 'en' ? 'Search or filter micro-niches...' : 'تصفية وبحث في التخصصات...'}
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          borderRadius: '8px',
                          padding: isRtl ? '6px 28px 6px 28px' : '6px 28px 6px 28px',
                          color: '#fff',
                          fontSize: '11px',
                          outline: 'none',
                        }}
                      />
                      {microSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMicroSearchQuery('')}
                          style={{ position: 'absolute', top: '7px', [isRtl ? 'left' : 'right']: '8px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Filter Tag Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: lang === 'en' ? 'All' : 'الكل', IconComp: Filter },
                        { id: 'trend', label: lang === 'en' ? 'Fast Trend' : 'تريند سريع', IconComp: Flame },
                        { id: 'profit', label: lang === 'en' ? 'High Profit' : 'ربحية عالية', IconComp: Coins },
                        { id: 'stable', label: lang === 'en' ? 'Stable Demand' : 'طلب مستقر', IconComp: TrendingUp },
                        { id: 'freelance', label: lang === 'en' ? 'Freelance Ready' : 'مناسب للعمل الحر', IconComp: Briefcase },
                      ].map((tag) => {
                        const Icon = tag.IconComp;
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => setMicroFilterBadge(tag.id)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              border: microFilterBadge === tag.id ? '1px solid #6366F1' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: microFilterBadge === tag.id ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                              color: microFilterBadge === tag.id ? '#818CF8' : '#94A3B8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Icon size={12} color={microFilterBadge === tag.id ? '#818CF8' : '#94A3B8'} />
                            <span>{tag.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {microNicheMode === 'custom' ? (
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '16px', borderRadius: '14px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#818CF8', marginBottom: '10px' }}>
                    <Lightbulb size={16} color="#6366F1" />
                    <span>{lang === 'en' ? 'Have a custom idea? Type your micro-niche here:' : 'لديك فكرة مختلفة؟ اكتب تخصصك الدقيق يدوياً هنا:'}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="field-input"
                      style={{ flex: '1 1 240px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}
                      value={customNicheInput}
                      onChange={(e) => handleCustomNicheChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customNicheInput.trim()) {
                          handleSubNicheSelect(customNicheInput.trim());
                        }
                      }}
                      placeholder={lang === 'en' ? 'e.g., Marketing for local real estate brokers' : 'مثال: تسويق وتصوير فلل عقارية مستقلة'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customNicheInput.trim()) {
                          handleSubNicheSelect(customNicheInput.trim());
                        }
                      }}
                      className="btn btn-primary"
                      style={{ padding: '10px 20px', borderRadius: '10px', background: '#6366F1', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                    >
                      <Sparkles size={14} />
                      <span>{lang === 'en' ? 'Analyze Custom Idea' : 'تحليل الفكرة المخصصة'}</span>
                      {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                    </button>
                  </div>
                </div>
              ) : aiData.loading.microNiches && microNicheMode === 'live' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '12px', padding: '16px' }}>
                  <Loader2 size={16} className="spin" />
                  <span>{lang === 'en' ? 'Generating live micro-niches via Live AI...' : 'جاري توليد أفكار التخصصات الدقيقة عبر الذكاء الاصطناعي...'}</span>
                </div>
              ) : (microNicheMode === 'live' && aiData.microNiches.length === 0) ? (
                <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '16px' }}>
                  <div className="ns-subtext" style={{ fontSize: '13px', marginBottom: '12px' }}>
                    {lang === 'en' ? 'No live micro-niche ideas generated yet.' : 'لم يتم توليد أفكار حية بالذكاء الاصطناعي بعد.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchAIData('microNiches')}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}
                  >
                    <Bot size={14} style={{ marginRight: '6px' }} />
                    <span>{lang === 'en' ? 'Generate Live Micro-Niches via OpenAI' : 'توليد تخصصات دقيقة بالذكاء الاصطناعي المباشر'}</span>
                  </button>
                </div>
              ) : (
                (() => {
                  const rawList = microNicheMode === 'live'
                    ? aiData.microNiches
                    : ((selectedNiche && ((lang === 'en' ? selectedNiche.ideas_en : selectedNiche.ideas_ar) || []).length > 0)
                        ? (lang === 'en' ? selectedNiche.ideas_en : selectedNiche.ideas_ar)
                        : []);
                  
                  const filteredList = rawList.map((text, originalIndex) => ({ text, originalIndex }))
                    .filter(({ text, originalIndex }) => {
                      const matchesSearch = !microSearchQuery || text.toLowerCase().includes(microSearchQuery.toLowerCase());
                      if (!matchesSearch) return false;
                      if (microFilterBadge === 'all') return true;
                      const badge = getMarketBadges(originalIndex);
                      return badge.class === microFilterBadge;
                    });

                  if (filteredList.length === 0) {
                    return (
                      <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px dashed rgba(99, 102, 241, 0.3)', marginBottom: '16px' }}>
                        <Filter size={24} color="#818CF8" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                          {lang === 'en' ? 'No micro-niches match your filter.' : 'لا توجد تخصصات دقيقة تطابق الفلتر المحدد.'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
                          {lang === 'en' ? 'Try adjusting your search term or filter category tag.' : 'جرب تغيير كلمة البحث أو إعادة ضبط تصفية الشارات.'}
                        </div>
                        <button
                          type="button"
                          onClick={() => { setMicroSearchQuery(''); setMicroFilterBadge('all'); }}
                          style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818CF8', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          {lang === 'en' ? 'Reset Filter' : 'إعادة ضبط الفلتر'}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="micro-niche-grid-2030">
                      {filteredList.map(({ idea: item, text: ideaText, originalIndex: i }) => {
                        const isMicroNicheSelected = Boolean(
                          selectedMicroNiche && (
                            selectedMicroNiche === ideaText || 
                            selectedMicroNiche === item ||
                            (typeof selectedMicroNiche === 'object' && typeof item === 'object' && (
                              (selectedMicroNiche.id && selectedMicroNiche.id === item.id) || 
                              (selectedMicroNiche.title && selectedMicroNiche.title === item.title) || 
                              (selectedMicroNiche.name && selectedMicroNiche.name === item.name)
                            ))
                          )
                        );
                        const isActive = isMicroNicheSelected || state.subNiche === ideaText;
                        const badge = getMarketBadges(i);
                        const BadgeIcon = badge.IconComp;

                        return (
                          <motion.div
                            key={i}
                            onClick={() => handleSubNicheSelect(ideaText)}
                            className={`micro-niche-card-2030 ${isActive ? "active" : ""}`}
                            whileHover={{ y: -3, scale: 1.015 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="micro-niche-card-header">
                              <span className={`market-badge ${badge.class}`}>
                                <BadgeIcon size={10} strokeWidth={1.5} />
                                <span>{badge.text}</span>
                              </span>
                              {isActive ? (
                                <CheckCircle2 size={15} color="#6366F1" strokeWidth={2} />
                              ) : (
                                <span style={{ fontSize: "10px", color: "#64748B", fontWeight: "700" }}>
                                  #{i + 1}
                                </span>
                              )}
                            </div>

                            <div className="micro-niche-card-title">
                              <span className="micro-niche-hashtag">#</span>
                              <span>{ideaText}</span>
                            </div>

                            <div className="micro-niche-card-footer">
                              <span className="micro-niche-score-tag">
                                <Sparkles size={10} strokeWidth={1.5} />
                                <span>{lang === "en" ? "Live AI Idea" : "فكرة AI مباشرة"}</span>
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })()
              )}

              {/* ═══════════════ 3. MICRO-NICHE DEEP DIVE VIEWS (2-TAB COMPONENT) ═══════════════ */}
              {shouldShowAnalysis && (
                <div
                  className="ns-panel-card"
                  style={{
                    padding: '18px',
                    marginBottom: '20px',
                    marginTop: '16px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setMicroNicheActiveTab('opportunities');
                        if (!aiData.marketOpportunities && !aiData.loading.opportunities) fetchAIData('opportunities');
                      }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        background: microNicheActiveTab === 'opportunities' ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
                        color: microNicheActiveTab === 'opportunities' ? '#fff' : '#94A3B8',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{lang === 'en' ? 'Tab 1: Market Opportunities' : 'فرص السوق والتحليل (Market Opportunities)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMicroNicheActiveTab('leaders');
                        if (aiData.topLeaders.length === 0 && !aiData.loading.leaders) fetchAIData('leaders');
                      }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        background: microNicheActiveTab === 'leaders' ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
                        color: microNicheActiveTab === 'leaders' ? '#fff' : '#94A3B8',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Award size={14} />
                      <span>{lang === 'en' ? 'Tab 2: Top 10 Leaders' : 'أبرز الرواد (Top 10 Leaders)'}</span>
                    </button>
                  </div>

                  {microNicheActiveTab === 'opportunities' && (
                    aiData.loading.opportunities ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '13px', padding: '20px 0' }}>
                        <Loader2 size={18} className="spin" />
                        <span>{lang === 'en' ? 'Analyzing market opportunities via Live AI...' : 'جاري تحليل فرص السوق عبر الذكاء الاصطناعي...'}</span>
                      </div>
                    ) : aiData.marketOpportunities ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                        <div className="ns-opp-card-green" style={{ borderRadius: '12px', padding: '14px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#10B981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={16} />
                            <span>{lang === 'en' ? 'Strengths & Growth Drivers' : 'نقاط القوة والمزايا التنافسية'}</span>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(aiData.marketOpportunities.strengths || []).map((item, idx) => (
                              <li key={idx} className="ns-list-item" style={{ fontSize: '12px', lineHeight: '1.6', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <ShieldCheck size={14} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="ns-opp-card-indigo" style={{ borderRadius: '12px', padding: '14px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#818CF8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Target size={16} />
                            <span>{lang === 'en' ? 'Market Gaps & Opportunities' : 'الفجوات والفرص المتاحة في السوق'}</span>
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(aiData.marketOpportunities.gaps || []).map((item, idx) => (
                              <li key={idx} className="ns-list-item" style={{ fontSize: '12px', lineHeight: '1.6', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <Target size={14} color="#818CF8" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="ns-subtext" style={{ textAlign: 'center', padding: '24px', fontSize: '13px' }}>
                        {lang === 'en' ? 'Click "Analyze Niche" below to fetch live market opportunities.' : 'اضغط "تحليل الفرصة" أدناه لعرض فرص السوق المباشرة.'}
                      </div>
                    )
                  )}

                  {microNicheActiveTab === 'leaders' && (
                    aiData.loading.leaders ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '13px', padding: '20px 0' }}>
                        <Loader2 size={18} className="spin" />
                        <span>{lang === 'en' ? 'Fetching top 10 market leaders via Live AI...' : 'جاري تجميع رواد السوق عبر الذكاء الاصطناعي...'}</span>
                      </div>
                    ) : aiData.topLeaders.length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr className="ns-table-head-row" style={{ textAlign: lang === 'en' ? 'left' : 'right' }}>
                              <th style={{ padding: '10px' }}>#</th>
                              <th style={{ padding: '10px' }}>{lang === 'en' ? 'Company Name' : 'اسم الشركة الرائدة'}</th>
                              <th style={{ padding: '10px' }}>{lang === 'en' ? 'Secret Sauce / Core Strategy' : 'سر التميز وما الذي جعلها تنجح'}</th>
                              <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'en' ? 'Website' : 'رابط الموقع'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aiData.topLeaders.map((leader, index) => (
                              <tr key={index} className="ns-table-row">
                                <td style={{ padding: '10px', fontWeight: '800', color: '#10B981' }}>
                                  {index + 1}
                                </td>
                                <td className="ns-heading-title" style={{ padding: '10px', fontWeight: '800' }}>
                                  {leader.name}
                                </td>
                                <td className="ns-list-item" style={{ padding: '10px', lineHeight: '1.5' }}>
                                  {leader.secret}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                  {leader.url ? (
                                    <a
                                      href={leader.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#6366F1',
                                        fontWeight: '700',
                                        textDecoration: 'none',
                                        fontSize: '11px',
                                        background: 'rgba(99, 102, 241, 0.12)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(99, 102, 241, 0.25)',
                                      }}
                                    >
                                      <span>{lang === 'en' ? 'Visit' : 'زيارة'}</span>
                                      <ExternalLink size={11} />
                                    </a>
                                  ) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="ns-subtext" style={{ textAlign: 'center', padding: '24px', fontSize: '13px' }}>
                        {lang === 'en' ? 'Click "Analyze Niche" below to reveal top market leaders.' : 'اضغط "تحليل الفرصة" أدناه لعرض رواد هذا المجال.'}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Show More / Show Less Toggle Button */}
              {rawMicroIdeas.length > 8 && !microSearchQuery && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    onClick={() => setShowAllMicroNiches(!showAllMicroNiches)}
                    className="action-pill-btn"
                  >
                    <span>
                      {showAllMicroNiches
                        ? lang === "en"
                          ? "Show Less"
                          : "عرض أقل"
                        : lang === "en"
                          ? `Show All (${rawMicroIdeas.length})`
                          : `عرض الكل (${rawMicroIdeas.length})`}
                    </span>
                    <ChevronDown
                      size={13}
                      strokeWidth={1.5}
                      style={{
                        transform: showAllMicroNiches
                          ? "rotate(180deg)"
                          : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </button>
                </div>
              )}



              {/* Current Selected Field & Analyze Section Header */}
              <div
                className="ns-panel-card"
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <span
                      className="ns-subtext"
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {lang === "en"
                        ? "SELECTED SPECIALIZATION"
                        : "التخصص المعتمد حالياً"}
                    </span>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6366F1",
                        fontWeight: "800",
                      }}
                    >
                      {activeNicheTitle}
                    </div>
                  </div>

                  {/* 2. SECOND MODE SWITCH */}
                  <div className="ai-mode-switch-bar" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", borderRadius: "12px" }}>
                    <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "700", paddingLeft: "4px" }}>
                      {lang === "en" ? "Analysis Depth:" : "عمق التحليل:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAnalysisMode("fast")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        border: "none",
                        cursor: "pointer",
                        background: analysisMode === "fast" ? "#10B981" : "transparent",
                        color: analysisMode === "fast" ? "#fff" : "#94A3B8",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Zap size={12} />
                      <span>{lang === "en" ? "Fast Mode (Instant Radar)" : "النمط السريع (رادار فوري)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalysisMode("live")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        border: "none",
                        cursor: "pointer",
                        background: analysisMode === "live" ? "#6366F1" : "transparent",
                        color: analysisMode === "live" ? "#fff" : "#94A3B8",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Bot size={12} />
                      <span>{lang === "en" ? "Live AI (Deep Strategic Analysis)" : "ذكاء اصطناعي مباشر (تحليل استراتيجي عميق)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAnalyzeNiche}
                      disabled={isAnalyzingNiche || !state.subNiche}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "800",
                        border: "1px solid rgba(99, 102, 241, 0.4)",
                        background: "rgba(99, 102, 241, 0.2)",
                        color: "#818CF8",
                        cursor: isAnalyzingNiche || !state.subNiche ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginLeft: "4px",
                      }}
                    >
                      <RefreshCw size={12} className={isAnalyzingNiche ? "spin" : ""} />
                      <span>{lang === "en" ? "Regenerate" : "إعادة التحليل والتوليد"}</span>
                    </button>
                  </div>
                </div>

                {/* Active Badge Indicator for Analysis Mode */}
                <div
                  className="ai-status-indicator-banner"
                  style={{
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {analysisMode === "fast" ? (
                    <>
                      <Zap size={15} color="#10B981" />
                      <span>{lang === "en" ? "Fast Mode Active: Instant radar scoring, basic ICP persona, and fast execution roadmap." : "النمط السريع مفعّل: تتبع فوري للسكور، تحديد العميل المثالي وخطة تنفيذ سريعة."}</span>
                    </>
                  ) : (
                    <>
                      <Bot size={15} color="#818CF8" />
                      <span>{lang === "en" ? "Live AI Deep Strategic Analysis Active: Real-time AI deep-dive into market opportunities & positioning strategy." : "التحليل الاستراتيجي العميق مفعّل: تحليل دراسة جدوى وتنافسية كاملة بالذكاء الاصطناعي المباشر."}</span>
                    </>
                  )}
                </div>

                <button
                  onClick={handleAnalyzeNiche}
                  disabled={isAnalyzingNiche || !state.subNiche}
                  className="btn btn-primary"
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: "800",
                    fontSize: "14px",
                    background: isAnalyzingNiche || !state.subNiche ? "rgba(255,255,255,0.1)" : (analysisMode === "live" ? "#6366F1" : "#10B981"),
                  }}
                >
                  {isAnalyzingNiche ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span className="td-spinner" />{" "}
                      {analysisMode === "live"
                        ? (lang === "en" ? "Generating Live AI Analysis..." : "جاري تشغيل تحليل الذكاء الاصطناعي...")
                        : (lang === "en" ? "Analyzing Fast Radar..." : "جاري تحليل الرادار السريع...")}
                    </span>
                  ) : (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {analysisMode === "live" ? <Bot size={16} strokeWidth={1.5} /> : <Zap size={16} strokeWidth={1.5} />}
                      <span>
                        {lang === "en"
                          ? (analysisMode === "live" ? "Run Live AI Deep Strategic Analysis" : "Analyze Niche Opportunity (Fast Radar)")
                          : (analysisMode === "live" ? "تشغيل التحليل الاستراتيجي العميق بالذكاء الاصطناعي" : "تحليل واكتشاف الفرصة (رادار سريع)")}
                      </span>
                    </span>
                  )}
                </button>
              </div>
            </div>

          {/* Verdict and ICP result block with Quick Action Bar */}
          {nicheAnalysis && !isAnalyzingNiche && (
            <motion.div
              className="animate-fade-in"
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Sticky Quick-Action Bar */}
              <div className="quick-action-bar">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      background: "rgba(99, 102, 241, 0.12)",
                      border: "1px solid rgba(99, 102, 241, 0.25)",
                      color: "#818CF8",
                      fontSize: "11px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      textTransform: "uppercase",
                    }}
                  >
                    <Sparkles size={13} strokeWidth={1.5} />
                    <span>
                      {lang === "en" ? "Score: 8.5/10" : "تقييم الفرصة: 8.5/10"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleCopyAnalysis}
                    className="action-pill-btn"
                  >
                    <Copy size={13} strokeWidth={1.5} />
                    <span>{lang === "en" ? "Copy Result" : "نسخ النتائج"}</span>
                  </button>
                  <button
                    onClick={() =>
                      toast(
                        lang === "en" ? "Analysis saved!" : "تم حفظ التحليل!",
                        "success",
                      )
                    }
                    className="action-pill-btn"
                  >
                    <Bookmark size={13} strokeWidth={1.5} />
                    <span>
                      {lang === "en" ? "Save Result" : "حفظ في المفضلة"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dual Option Tabs for Niche Analysis */}
              <div className="niche-option-tabs">
                <button
                  onClick={() => setNicheAnalysisOption("fast_radar")}
                  className={`niche-option-tab ${nicheAnalysisOption === "fast_radar" ? "active" : ""}`}
                >
                  <Zap size={12} strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "Fast Market Radar"
                      : "رادار السوق السريع"}
                  </span>
                </button>
                <button
                  onClick={() => setNicheAnalysisOption("deep_360")}
                  className={`niche-option-tab ${nicheAnalysisOption === "deep_360" ? "active" : ""}`}
                >
                  <Brain size={12} strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "Deep 360° Strategic Breakdown"
                      : "التحليل الاستراتيجي الشامل"}
                  </span>
                </button>
              </div>

              {nicheAnalysisOption === "fast_radar" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {/* Score & Verdict Card */}
                  <div
                    className="result-card"
                    style={{
                      display: "flex",
                      gap: "14px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "rgba(99, 102, 241, 0.12)",
                        border: "2px solid #6366F1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 14px rgba(99, 102, 241, 0.2)",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "800",
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        8.5
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          color: "#94A3B8",
                          fontWeight: "600",
                        }}
                      >
                        /10
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          color: "#818CF8",
                          fontSize: "13px",
                          fontWeight: "700",
                          marginBottom: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Scale size={14} strokeWidth={1.5} />
                        <span>
                          {lang === "en"
                            ? "Market Verdict & Potential"
                            : "حكم السوق وقوة الفرصة"}
                        </span>
                      </h4>
                      <p
                        className="result-card-desc"
                        style={{
                          fontSize: "12px",
                          lineHeight: "1.5",
                          margin: 0,
                        }}
                      >
                        {nicheAnalysis.verdict}
                      </p>
                    </div>
                  </div>

                  {/* Customer Profile Card */}
                  <div className="result-card">
                    <div className="result-card-header">
                      <Users size={16} color="#6366F1" strokeWidth={1.5} />
                      <span className="result-card-title">
                        {lang === "en"
                          ? "Ideal Customer Profile (ICP)"
                          : "بروفايل العميل المثالي"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <div className="icp-item-card">
                        <div className="icp-item-label">
                          {lang === "en" ? "Demographics" : "العمر والوظيفة"}
                        </div>
                        <div className="icp-item-val">
                          {nicheAnalysis.icp.age} · {nicheAnalysis.icp.job}
                        </div>
                      </div>
                      <div className="icp-item-card">
                        <div className="icp-item-label">
                          {lang === "en"
                            ? "Core Pain Point"
                            : "أكبر ألم واحتياج"}
                        </div>
                        <div className="icp-item-val">
                          {nicheAnalysis.icp.pain}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {/* Revenue Model Card */}
                  <div className="result-card">
                    <div className="result-card-header">
                      <Coins size={16} color="#6366F1" strokeWidth={1.5} />
                      <span className="result-card-title">
                        {lang === "en"
                          ? "Monetization & CAC/LTV"
                          : "نموذج الربحية والقيمة الإجمالية"}
                      </span>
                    </div>
                    <div
                      className="result-card-desc"
                      style={{
                        fontSize: "12px",
                        lineHeight: 1.6,
                      }}
                    >
                      <div>
                        •{" "}
                        {lang === "en"
                          ? "Monetization Model: Subscription / High-Ticket Retainers"
                          : "نموذج الدخل: اشتراكات شهرية أو عقود عالية القيمة"}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        •{" "}
                        {lang === "en"
                          ? "Estimated CAC: $25 - $45 per client"
                          : "تكلفة الاستحواذ المقدرة: 25 - 45 دولار لكل عميل"}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        •{" "}
                        {lang === "en"
                          ? "Predicted LTV: $450+ per year"
                          : "العائد السنوي المتوقع: 450+ دولار سنوياً"}
                      </div>
                    </div>
                  </div>

                  {/* 3-Step Strategy */}
                  <div className="result-card">
                    <div className="result-card-header">
                      <TrendingUp size={16} color="#6366F1" strokeWidth={1.5} />
                      <span className="result-card-title">
                        {lang === "en"
                          ? "3-Step Go-to-Market Strategy"
                          : "خطة الانطلاق في 3 خطوات"}
                      </span>
                    </div>
                    <div
                      className="result-card-desc"
                      style={{
                        fontSize: "12px",
                        lineHeight: 1.6,
                      }}
                    >
                      <div>
                        1.{" "}
                        {lang === "en"
                          ? "Launch MVP offer focusing on core pain point"
                          : "إطلاق العرض الأولي لحل المشكلة الأساسية فقط"}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        2.{" "}
                        {lang === "en"
                          ? "Run targeted LinkedIn / Instagram organic outreach"
                          : "التواصل المباشر المستهدف عبر لينكدإن / إنستغرام"}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        3.{" "}
                        {lang === "en"
                          ? "Scale with client testimonials and referrals"
                          : "التوسع بناءً على نتائج وتوصيات العملاء الأوائل"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transition Next step */}
              <div className="transition-banner">
                <div
                  style={{
                    fontSize: "12px",
                    color: "#F8FAFC",
                    lineHeight: "1.5",
                    maxWidth: "580px",
                  }}
                >
                  {nicheAnalysis.nextStep}
                </div>
                <button
                  onClick={() => { setIsNewlyGeneratedColors(false); setActiveTab("name"); }}
                  className="btn btn-primary"
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                  }}
                >
                  <span>
                    {lang === "en"
                      ? "Go to Brand Naming"
                      : "الذهاب لاسم البراند"}
                  </span>
                  {isRtl ? (
                    <ArrowLeft size={14} strokeWidth={1.5} />
                  ) : (
                    <ArrowRight size={14} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    )}
  </motion.div>
)}

      {/* ──────────────── TAB 2: BRAND NAMING STUDIO ──────────────── */}
      {activeTab === "name" && (
        <motion.div
          className="ai-panel naming-studio-container-2030"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header & Studio Intro */}
          <div style={{ marginBottom: "10px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Wand2 size={18} color="#6366F1" strokeWidth={1.5} />
              <span>
                {lang === "en"
                  ? "Brand Naming Studio"
                  : "منصة توليد اسم البراند"}
              </span>
            </h2>
            <p
              style={{
                fontSize: "12px",
                color: "#94A3B8",
                lineHeight: "1.5",
                margin: 0,
              }}
            >
              {lang === "en"
                ? "Generate premium brand names tailored to your selected niche, or configure your parameters manually."
                : "ابتكر اسماً مميزاً يعكس قوتك. يمكنك استخدام الكتالوج التلقائي أو إدخال إعدادات دقيقة يدوياً."}
            </p>
          </div>

          {/* Full-Width Configuration Studio Card */}
          <div className="naming-config-panel-2030">
            {/* Category Pills */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748B",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <Building2 size={13} color="#6366F1" strokeWidth={1.5} />
                <span>
                  {lang === "en"
                    ? "BUSINESS CATEGORY"
                    : "تصنيف البزنس الرئيسي"}
                </span>
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {BRAND_CATEGORIES.map((cat) => {
                  const CatIcon = cat.IconComp;
                  const isCatSelected = namingCategory === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => setNamingCategory(cat.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`bn-cat-btn ${isCatSelected ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        minWidth: "120px",
                        padding: "10px 14px",
                        fontSize: "12px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: isCatSelected ? "0 0 16px rgba(99,102,241,0.25)" : "none"
                      }}
                    >
                      <CatIcon size={15} color={isCatSelected ? "#6366F1" : "#64748B"} strokeWidth={1.5} />
                      <span>{lang === "en" ? cat.label_en : cat.label_ar}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Grid of Sector Detail, Language & Execution Mode Controls */}
            <div className="naming-params-grid">
              {/* Sector Detail Dropdown */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748B",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Type size={13} color="#6366F1" strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "SELECT SECTOR DETAIL"
                      : "اختر القطاع التفصيلي"}
                  </span>
                </label>
                <CustomDropdown
                  value={selectedStyle || ""}
                  onChange={(v) => setSelectedStyle(v)}
                  options={styleOptions}
                  placeholder={
                    lang === "en"
                      ? "Select Sector Detail..."
                      : "اختر القطاع التفصيلي..."
                  }
                />
              </div>

              {/* Language Selector */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748B",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Globe size={13} color="#6366F1" strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "BRAND NAME LANGUAGE"
                      : "لغة الأسماء المبتكرة"}
                  </span>
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { id: "all", label: lang === "en" ? "Mixed" : "مختلط" },
                    { id: "ar", label: lang === "en" ? "Arabic" : "عربي فقط" },
                    {
                      id: "en",
                      label: lang === "en" ? "English" : "إنجليزي فقط",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setNameLanguage(opt.id)}
                      className={`bn-lang-btn ${nameLanguage === opt.id ? 'active' : ''}`}
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        fontSize: "11px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Mode */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748B",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Cpu size={13} color="#6366F1" strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "GENERATION ENGINE"
                      : "محرك التوليد المستهدف"}
                  </span>
                </label>
                <AnalysisModeSelector
                  mode={analysisMode}
                  onChange={setAnalysisMode}
                  lang={lang}
                  accentColor="#6366F1"
                />
              </div>
            </div>

            {/* Catalogs checklist */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748B",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Folder size={13} color="#6366F1" strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "SELECT CATALOGS TO LOAD"
                      : "حدد كتالوجات الأسماء المستهدفة"}
                  </span>
                </label>

                {currentCatalogs.length > 0 && (
                  <button
                    onClick={handleToggleAllCatalogs}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#818CF8",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {selectedCatalogs.length === currentCatalogs.length ? (
                      <CheckSquare size={12} strokeWidth={1.5} />
                    ) : (
                      <Square size={12} strokeWidth={1.5} />
                    )}
                    <span>
                      {selectedCatalogs.length === currentCatalogs.length
                        ? lang === "en"
                          ? "Deselect All"
                          : "إلغاء التحديد"
                        : lang === "en"
                          ? "Select All"
                          : "تحديد الكل"}
                    </span>
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {currentCatalogs.map((cat) => {
                  const isChecked = selectedCatalogs.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCatalogs((prev) =>
                          isChecked
                            ? prev.filter((id) => id !== cat.id)
                            : [...prev, cat.id],
                        );
                      }}
                      className={`bn-catalog-btn ${isChecked ? 'active' : ''}`}
                      style={{
                        padding: "6px 12px",
                        fontSize: "11px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {isChecked ? (
                        <Check size={12} color="#6366F1" strokeWidth={1.5} />
                      ) : (
                        <span>+</span>
                      )}
                      <span>
                        {lang === "en" ? cat.label_en : cat.label_ar}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate CTA Button */}
            <motion.button
              onClick={handleGenerateNames}
              disabled={isGeneratingNames}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn btn-primary btn-full"
              style={{
                marginTop: 6,
                padding: "12px 24px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                boxShadow: "0 4px 20px rgba(99, 102, 241, 0.35)"
              }}
            >
              {isGeneratingNames ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  <span className="td-spinner" />{" "}
                  {lang === "en" ? "Generating Brand Proposals..." : "جاري توليد الأسماء والمفهوم..."}
                </span>
              ) : (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <Wand2 size={16} strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "Generate Custom Brand Names"
                      : "توليد مقترحات الأسماء الذكية"}
                  </span>
                </span>
              )}
            </motion.button>
          </div>

          {/* Full-Width Generated Proposals Studio */}
          <AnimatePresence mode="wait">
            {generatedNames ? (
              <motion.div
                key="results-active"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="naming-config-panel-2030"
                style={{
                  padding: "20px 24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px" }}>
                  <h4
                    className="ns-heading-title"
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles size={16} color="#6366F1" strokeWidth={1.5} />
                    <span>
                      {lang === "en"
                        ? "Generated Brand Name Proposals"
                        : "قائمة أسماء البراند المقترحة الاحترافية"}
                    </span>
                  </h4>
                  <span style={{ fontSize: "11px", color: "#818CF8", fontWeight: "600" }}>
                    {lang === "en" ? "Click any proposal to adopt" : "انقر على أي اسم لاعتماده فوراً"}
                  </span>
                </div>

                <div className="naming-proposal-grid-2030">
                  {Object.keys(generatedNames).map((catId) => {
                    const catDef = currentCatalogs.find((c) => c.id === catId);
                    const catTitle = catDef
                      ? lang === "en"
                        ? catDef.label_en
                        : catDef.label_ar
                      : catId;
                    const items = generatedNames[catId];
                    if (!items || items.length === 0) return null;

                    return items.map((item, idx) => {
                      const isPinned = pinnedNames.includes(item.name);
                      const isSelected = customNameInput === item.name;

                      return (
                        <motion.div
                          key={`${catId}-${item.name}-${idx}`}
                          onClick={() => handleNameSelect(item.name)}
                          whileHover={{ y: -3, scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          className={`naming-proposal-card-2030 ${isSelected ? "active" : ""}`}
                        >
                          <div className="naming-proposal-header">
                            <span className="market-badge">
                              <Folder size={10} strokeWidth={1.5} />
                              <span>{catTitle}</span>
                            </span>

                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePinName(item.name);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: isPinned ? "#6366F1" : "#64748B",
                                  cursor: "pointer",
                                  padding: 2,
                                }}
                                title={lang === "en" ? "Pin name" : "تثبيت الاسم"}
                              >
                                <Star
                                  size={14}
                                  strokeWidth={1.5}
                                  fill={isPinned ? "#6366F1" : "none"}
                                />
                              </button>

                              <button
                                onClick={(e) => handleCopyName(item.name, e)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#64748B",
                                  cursor: "pointer",
                                  padding: 2,
                                }}
                                title={lang === "en" ? "Copy name" : "نسخ الاسم"}
                              >
                                <Copy size={14} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>

                          <div className="naming-proposal-title">
                            <span>{item.name}</span>
                            {isPinned && (
                              <span className="pinned-badge">
                                <Star size={9} fill="#6366F1" strokeWidth={1.5} />
                                {lang === "en" ? "Pinned" : "مفضل"}
                              </span>
                            )}
                          </div>

                          <div className="naming-proposal-meaning">
                            "{lang === "en" ? item.meaning_en : item.meaning_ar}"
                          </div>

                          <div className="naming-proposal-footer">
                            <span className="domain-badge available">
                              .com {lang === "en" ? "Available" : "متاح"}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNameSelect(item.name);
                                handleConfirmName();
                              }}
                              className="action-pill-btn"
                              style={{
                                fontSize: "10px",
                                padding: "4px 10px",
                                background: isSelected ? "#6366F1" : "rgba(255, 255, 255, 0.05)",
                                color: isSelected ? "#ffffff" : "#F8FAFC"
                              }}
                            >
                              <span>
                                {lang === "en" ? "Adopt & Next" : "اعتماد والتالي"}
                              </span>
                              {isRtl ? (
                                <ArrowLeft size={11} strokeWidth={1.5} />
                              ) : (
                                <ArrowRight size={11} strokeWidth={1.5} />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      );
                    });
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: "rgba(11, 15, 23, 0.5)",
                  border: "1px dashed rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "36px 20px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lightbulb
                  size={32}
                  color="#6366F1"
                  strokeWidth={1.5}
                  style={{ marginBottom: 10, opacity: 0.7 }}
                />
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#F8FAFC",
                  }}
                >
                  {lang === "en"
                    ? "Select parameters above and click Generate"
                    : "حدد الإعدادات والكتالوجات أعلاه ثم اضغط على زر التوليد"}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    marginTop: "4px",
                    color: "#64748B",
                  }}
                >
                  {lang === "en"
                    ? "Your AI brand proposals will appear here in a full-width interactive grid"
                    : "ستظهر المقترحات هنا في شبكة تفاعلية كاملة العرض فور التوليد"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full-Width Confirmed Brand Name Dock */}
          <div
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "18px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                padding: "16px 20px",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "14px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(14px)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#F8FAFC",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                  }}
                >
                  <Crown size={14} color="#818CF8" strokeWidth={1.5} />
                </div>
                <span>
                  {lang === "en"
                    ? "Confirm Final Brand Name"
                    : "اسم البراند المعتمد النهائي"}
                </span>
              </label>

              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <input
                  type="text"
                  className="field-input"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder={lang === "en" ? "e.g. NovaTrend" : "مثال: رونق"}
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    fontWeight: "700",
                    textAlign: isRtl ? "right" : "left",
                    height: "42px",
                    borderColor: "rgba(99, 102, 241, 0.4)",
                    color: "#818CF8",
                    background: "rgba(99, 102, 241, 0.06)",
                  }}
                />
                <button
                  onClick={handleConfirmName}
                  disabled={!customNameInput}
                  className="btn btn-primary"
                  style={{
                    margin: 0,
                    padding: "0 22px",
                    height: "42px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                    cursor: customNameInput ? "pointer" : "not-allowed",
                    opacity: customNameInput ? 1 : 0.6,
                    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)"
                  }}
                >
                  <span>{lang === "en" ? "Confirm Name" : "اعتماد الاسم"}</span>
                  {isRtl ? (
                    <ArrowLeft size={14} strokeWidth={1.5} />
                  ) : (
                    <ArrowRight size={14} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ──────────────── TAB 3: VISUAL IDENTITY STUDIO & BRAND SIMULATOR ──────────────── */}
      {activeTab === "identity" && (
        <motion.div
          className="ai-panel identity-studio-container-2030"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header Bar & Quick Studio Actions */}
          <div className="identity-header-bar-2030">
            <div>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Palette size={18} color="#6366F1" strokeWidth={1.5} />
                <span>
                  {lang === "en"
                    ? "Full Brand Landing Page Simulator & Identity Studio"
                    : "محاكي صفحات الهبوط واستوديو الهوية البصرية الشامل"}
                </span>
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "#94A3B8",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                {lang === "en"
                  ? "Manipulate typography, buttons, hero surfaces, card containers, and custom CSS overrides in real-time across your live landing page mockup."
                  : "تحكم بكل عناصر البراند (الخطوط، الأزرار، الكروت، ألوان الهيرو، وتخصيصات CSS المباشرة) وشاهد التأثير فوراً على معاينة صفحة الهبوط."}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleCopyColorPalette}
                className="action-pill-btn"
              >
                <Copy size={13} strokeWidth={1.5} />
                <span>{lang === "en" ? "Copy Colors" : "نسخ الألوان"}</span>
              </button>
              <button
                type="button"
                onClick={handleExportBrandKit}
                className="action-pill-btn"
                style={{
                  background: "rgba(99, 102, 241, 0.15)",
                  borderColor: "rgba(99, 102, 241, 0.3)",
                  color: "#818CF8",
                }}
              >
                <FileText size={13} strokeWidth={1.5} />
                <span>
                  {lang === "en" ? "Export Brand Kit" : "تصدير حقيبة البراند"}
                </span>
              </button>
            </div>
          </div>

                    {/* Unique Vertical Flow Architecture for Visual Identity (Tab 3) */}
          <div className="identity-vertical-flow-container">
            
            {/* SECTION 1 (TOP): ALL INPUT CONTROLS GRID */}
            <div className="identity-input-grid" style={{ position: "relative" }}>
                            {/* Quick Preview Trigger */}
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: lang === "ar" ? "flex-start" : "flex-end", marginBottom: "4px" }}>
                <button 
                  type="button"
                  onClick={() => setIsPreviewDrawerOpen(true)}
                  style={{
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2))",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    backdropFilter: "blur(8px)",
                    color: "#F8FAFC",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transition: "all 0.3s ease"
                  }}
                  className="hover-glow-effect"
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(99,102,241,0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                  }}
                >
                  <Eye size={14} color="#818CF8" />
                  <span>{lang === "en" ? "Live Preview" : "معاينة مباشرة"}</span>
                </button>
              </div>

              {/* Card A: Color Studio */}
              <div className="identity-input-card">
                {/* Presets Bar */}
              <div style={{ minWidth: "150px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748B",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Sparkles size={13} color="#6366F1" strokeWidth={1.5} />
                  <span>
                    {lang === "en"
                      ? "POPULAR PALETTES"
                      : "باليتات مقترحة متناسقة"}
                  </span>
                </label>
                <div className="identity-preset-grid-2030">
                  {PRESETS_PALETTES.map((preset, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handlePresetSelect(preset)}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="identity-preset-card-2030"
                    >
                      <div style={{ display: "flex", gap: "3px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: preset.primary }} />
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: preset.secondary }} />
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: preset.accent }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "#F8FAFC", fontWeight: "700" }}>
                        {preset.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
                <div style={{ height: '8px' }}></div>
                {/* 3-Color Pickers */}
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748B",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Droplets size={13} color="#6366F1" strokeWidth={1.5} />
                  <span>
                    {lang === "en" ? "COLOR WHEEL" : "عجلة الألوان الثلاثية"}
                  </span>
                </label>

                <div className="identity-color-picker-grid-2030">
                  <div className="identity-color-card-2030">
                    <div className="identity-color-swatch-ring" style={{ borderColor: primaryColor }}>
                      <div className="identity-color-swatch-fill" style={{ background: primaryColor }} />
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "9px", color: "#64748B", fontWeight: "700" }}>
                        {lang === "en" ? "PRIMARY" : "الأساسي"}
                      </div>
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          width: "100%",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>

                  <div className="identity-color-card-2030">
                    <div className="identity-color-swatch-ring" style={{ borderColor: secondaryColor }}>
                      <div className="identity-color-swatch-fill" style={{ background: secondaryColor }} />
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "9px", color: "#64748B", fontWeight: "700" }}>
                        {lang === "en" ? "SECONDARY" : "الثانوي"}
                      </div>
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          width: "100%",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>

                  <div className="identity-color-card-2030">
                    <div className="identity-color-swatch-ring" style={{ borderColor: accentColor }}>
                      <div className="identity-color-swatch-fill" style={{ background: accentColor }} />
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "9px", color: "#64748B", fontWeight: "700" }}>
                        {lang === "en" ? "ACCENT" : "الفرعي / الزر"}
                      </div>
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          width: "100%",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {/* Card B: Brand Assets */}
              <div className="identity-input-card">
                {/* Logo Upload Dock */}
                <div
                  style={{
                    position: "relative",
                    border: "1px dashed rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px",
                    minHeight: "85px",
                    cursor: "pointer",
                    overflow: "hidden",
                    background: "rgba(15, 23, 42, 0.4)",
                  }}
                >
                  <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                />
                {!logoPreview ? (
                  <>
                    <UploadCloud size={20} color="#6366F1" strokeWidth={1.5} style={{ marginBottom: 4 }} />
                    <p style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600", margin: 0 }}>
                      {lang === "en" ? "Upload Logo Image" : "ارفع شعار البراند للمعاينة"}
                    </p>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={logoPreview} style={{ height: "36px", maxWidth: "150px", objectFit: "contain" }} alt="Logo" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogoPreview(null);
                      }}
                      className="action-pill-btn"
                      style={{ fontSize: "10px", padding: "3px 6px" }}
                    >
                      {lang === "en" ? "Remove" : "إزالة"}
                    </button>
                  </div>
                )}
                </div>
                <div style={{ height: '8px' }}></div>
                {/* Brand Archetype Selector */}
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: "8px",
                  }}
                >
                  <Brain size={13} strokeWidth={1.5} color="#6366F1" />
                  <span>
                    {lang === "en"
                      ? "BRAND ARCHETYPE"
                      : "نبرة صوت البراند المستهدفة"}
                  </span>
                </label>
                <div className="archetype-grid">
                  {[
                    { id: "visionary", label_en: "Visionary", label_ar: "ابتكاري مستقبلي" },
                    { id: "luxury", label_en: "Elite Luxury", label_ar: "فاخر راقي" },
                    { id: "agile", label_en: "Disruptor", label_ar: "جريء ومنافس" },
                    { id: "expert", label_en: "Trusted Expert", label_ar: "خبير موثوق" },
                  ].map((arch) => (
                    <motion.button
                      key={arch.id}
                      onClick={() => setBrandArchetype(arch.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`archetype-card ${brandArchetype === arch.id ? "active" : ""}`}
                    >
                      {lang === "en" ? arch.label_en : arch.label_ar}
                    </motion.button>
                  ))}
                </div>
              </div>
              </div>

              {/* Card C: Typography & Style */}
              <div className="identity-input-card">
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6, marginBottom: "10px" }}>
                  <Type size={13} strokeWidth={1.5} color="#818CF8" />
                  <span>{lang === "en" ? "Typography Controls" : "التحكم بالخطوط والنصوص"}</span>
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      {lang === "en" ? "Heading Font Family:" : "نوع خط العناوين:"}
                    </span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {["Cairo", "Tajawal", "Inter", "Outfit", "Roboto"].map((font) => (
                        <button
                          key={font}
                          type="button"
                          onClick={() => setHeadingFont(font)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            border: `1px solid ${headingFont === font ? "#6366F1" : "rgba(255,255,255,0.1)"}`,
                            background: headingFont === font ? "rgba(99,102,241,0.25)" : "transparent",
                            color: headingFont === font ? "#fff" : "#94A3B8",
                            cursor: "pointer",
                          }}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                        {lang === "en" ? "Heading Color:" : "لون العناوين:"}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="color"
                          value={headingColor}
                          onChange={(e) => setHeadingColor(e.target.value)}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", cursor: "pointer", background: "none" }}
                        />
                        <input
                          type="text"
                          value={headingColor}
                          onChange={(e) => setHeadingColor(e.target.value)}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "10px", padding: "3px 6px", width: "100%", outline: "none" }}
                        />
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                        {lang === "en" ? "Body Text Color:" : "لون النصوص الفرعية:"}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="color"
                          value={bodyTextColor}
                          onChange={(e) => setBodyTextColor(e.target.value)}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", cursor: "pointer", background: "none" }}
                        />
                        <input
                          type="text"
                          value={bodyTextColor}
                          onChange={(e) => setBodyTextColor(e.target.value)}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "10px", padding: "3px 6px", width: "100%", outline: "none" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ height: '8px' }}></div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6, marginBottom: "10px" }}>
                  <Wand2 size={13} strokeWidth={1.5} color="#818CF8" />
                  <span>{lang === "en" ? "Button & Border Radius Controls" : "تنسيق الأزرار وحواف العناصر"}</span>
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                        {lang === "en" ? "Primary Button BG:" : "خلفية الزر الرئيسي:"}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="color"
                          value={buttonBgColor}
                          onChange={(e) => setButtonBgColor(e.target.value)}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", cursor: "pointer", background: "none" }}
                        />
                        <input
                          type="text"
                          value={buttonBgColor}
                          onChange={(e) => setButtonBgColor(e.target.value)}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "10px", padding: "3px 6px", width: "100%", outline: "none" }}
                        />
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                        {lang === "en" ? "Button Text Color:" : "لون نص الزر:"}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="color"
                          value={buttonTextColor}
                          onChange={(e) => setButtonTextColor(e.target.value)}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", cursor: "pointer", background: "none" }}
                        />
                        <input
                          type="text"
                          value={buttonTextColor}
                          onChange={(e) => setButtonTextColor(e.target.value)}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "10px", padding: "3px 6px", width: "100%", outline: "none" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      {lang === "en" ? "Border Radius Style:" : "انحناء حواف الأزرار والبطاقات:"}
                    </span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {[
                        { label: "0px (Sharp)", value: "0px" },
                        { label: "8px (Soft)", value: "8px" },
                        { label: "16px (Rounded)", value: "16px" },
                        { label: "9999px (Pill)", value: "9999px" },
                      ].map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setButtonRadius(r.value)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: "700",
                            border: `1px solid ${buttonRadius === r.value ? "#6366F1" : "rgba(255,255,255,0.1)"}`,
                            background: buttonRadius === r.value ? "rgba(99,102,241,0.25)" : "transparent",
                            color: buttonRadius === r.value ? "#fff" : "#94A3B8",
                            cursor: "pointer",
                          }}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card D: Advanced */}
              <div className="identity-input-card identity-input-card-wide">
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6, marginBottom: "10px" }}>
                  <Layout size={13} strokeWidth={1.5} color="#818CF8" />
                  <span>{lang === "en" ? "Hero & Card Surfaces" : "أسطح الهيرو والبطاقات"}</span>
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      {lang === "en" ? "Card Background Style:" : "خلفية البطاقات:"}
                    </span>
                    <input
                      type="text"
                      value={cardBgColor}
                      onChange={(e) => setCardBgColor(e.target.value)}
                      placeholder="rgba(30, 41, 59, 0.7)"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "10px", padding: "5px 8px", width: "100%", outline: "none" }}
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      {lang === "en" ? "Card Border Color:" : "إطار البطاقات:"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="color"
                        value={cardBorderColor.startsWith('#') ? cardBorderColor : '#6366F1'}
                        onChange={(e) => setCardBorderColor(e.target.value)}
                        style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", cursor: "pointer", background: "none" }}
                      />
                      <input
                        type="text"
                        value={cardBorderColor}
                        onChange={(e) => setCardBorderColor(e.target.value)}
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "10px", padding: "3px 6px", width: "100%", outline: "none" }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ height: '8px' }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: "#818CF8", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6 }}>
                    <Code size={13} strokeWidth={1.5} color="#818CF8" />
                    <span>{lang === "en" ? "Live CSS / Funnel Code Editor" : "محرر أكواد CSS المباشر"}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCssCode(customCssCode);
                      toast(
                        lang === "en" ? "Custom CSS applied to live preview!" : "تم تطبيق أكواد CSS المخصصة على المعاينة المباشرة!",
                        "success"
                      );
                    }}
                    style={{
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#10B981",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{lang === "en" ? "Apply Custom Styles" : "تطبيق الأكواد"}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={customCssCode}
                  onChange={(e) => setCustomCssCode(e.target.value)}
                  placeholder="/* Enter custom CSS rules or variables */"
                  style={{
                    width: "100%",
                    background: "#0D1117",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    color: "#7EE787",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    lineHeight: 1.5,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            {/* SECTION 3 (BOTTOM): PRIMARY ACTION BAR */}
            <div className="identity-cta-bar">
              <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <AnalysisModeSelector
                  mode={analysisMode}
                  onChange={setAnalysisMode}
                  lang={lang}
                  accentColor="#6366F1"
                />

                <motion.button
                  onClick={handleAnalyzeColors}
                  disabled={isAnalyzingColors || !primaryColor}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn btn-primary btn-full"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "700",
                    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.35)"
                  }}
                >
                  {isAnalyzingColors ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                      <span className="td-spinner" /> {lang === "en" ? "Analyzing..." : "جاري التحليل..."}
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <Cpu size={15} strokeWidth={1.5} />
                      <span>{lang === "en" ? "Analyze & Apply Identity" : "تحليل سيكولوجية الألوان وتطبيق الهوية"}</span>
                    </span>
                  )}
                </motion.button>
                </div>
              </div>
            </div>

            {/* Slide-Over Drawer for Preview */}
            <div className={`identity-preview-drawer ${isPreviewDrawerOpen ? 'open' : ''}`}>
              <div className="identity-preview-drawer-overlay" onClick={() => setIsPreviewDrawerOpen(false)} />
              <div className={`identity-preview-drawer-content ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
                <button 
                  className="identity-preview-drawer-close"
                  onClick={() => setIsPreviewDrawerOpen(false)}
                >
                  <X size={20} />
                </button>
                <div style={{ width: "100%", height: "100%", overflowY: "auto", padding: "40px 20px" }}>
                  <div className="identity-simulator-header">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", direction: "ltr" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
                  <div style={{ fontSize: "11px", color: "#818CF8", fontFamily: "monospace", fontWeight: "700", marginLeft: "8px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                    <span>{state.brandName ? `${state.brandName.toLowerCase()}_creatify_live_preview` : "creatify_live_preview_v2"}</span>
                  </div>
                </div>

                <div className="mockup-view-tabs">
                  <button
                    type="button"
                    onClick={() => setMockupView("website")}
                    className={`mockup-view-btn ${mockupView === "website" ? "active" : ""}`}
                  >
                    <Layout size={11} strokeWidth={1.5} />
                    <span>{lang === "en" ? "Web Canvas" : "الموقع الإلكتروني"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMockupView("social")}
                    className={`mockup-view-btn ${mockupView === "social" ? "active" : ""}`}
                  >
                    <Share2 size={11} strokeWidth={1.5} />
                    <span>{lang === "en" ? "Social Feed" : "منشورات التواصل"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMockupView("card")}
                    className={`mockup-view-btn ${mockupView === "card" ? "active" : ""}`}
                  >
                    <Gem size={11} strokeWidth={1.5} />
                    <span>{lang === "en" ? "NFC Card" : "بطاقة العمل"}</span>
                  </button>
                </div>
              </div>
                  {/* Viewport content */}
              <div className="identity-simulator-viewport" style={{ background: secondaryColor, borderRadius: "12px", marginTop: "12px" }}>
                {/* Live Custom CSS Injection */}
                {appliedCssCode && <style>{appliedCssCode}</style>}

                <AnimatePresence mode="wait">
                  {mockupView === "website" && (
                    <motion.div
                      key="view-web"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: headingFont }}
                    >
                      <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0, 0, 0, 0.35)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ height: "24px", display: "flex", alignItems: "center" }}>
                          {logoPreview ? (
                            <img src={logoPreview} style={{ height: "100%", objectFit: "contain" }} alt="Logo" />
                          ) : (
                            <div style={{ color: headingColor, fontSize: "14px", fontWeight: "900", fontFamily: headingFont }}>
                              {state.brandName || "NOVA BRAND"}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div style={{ width: "28px", height: "4px", background: "rgba(255,255,255,0.25)", borderRadius: "2px" }} />
                          <div style={{ width: "28px", height: "4px", background: "rgba(255,255,255,0.25)", borderRadius: "2px" }} />
                        </div>
                      </div>

                      <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, position: "relative", textAlign: "center", background: heroBgColor }}>
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "180px",
                            height: "180px",
                            borderRadius: "50%",
                            background: primaryColor,
                            filter: "blur(70px)",
                            opacity: 0.35,
                            pointerEvents: "none",
                          }}
                        />

                        <h3 style={{ fontSize: "20px", fontWeight: "800", color: headingColor, marginBottom: "10px", zIndex: 1, transition: "color 0.3s ease", fontFamily: headingFont }}>
                          {state.brandName ? `${state.brandName} Studio` : lang === "en" ? "Empowering Modern Brands" : "حلول رقمية متكاملة لعلامتك التجارية"}
                        </h3>
                        <p style={{ fontSize: "12px", color: bodyTextColor, margin: "0 0 18px 0", maxWidth: "340px", lineHeight: 1.6, zIndex: 1 }}>
                          {lang === "en" ? "Tailored identity, precision architecture, and scalable growth." : "هوية بصرية دقيقة تعكس جوهر نشاطك التجاري وتزيد من ثقة العملاء."}
                        </p>

                        <button
                          className="live-preview-btn"
                          style={{
                            padding: "10px 26px",
                            borderRadius: buttonRadius,
                            fontSize: "12px",
                            fontWeight: "800",
                            color: buttonTextColor,
                            background: buttonBgColor,
                            border: `1px solid ${buttonBorderColor}`,
                            cursor: "pointer",
                            boxShadow: `0 6px 20px ${buttonBgColor}50`,
                            zIndex: 1,
                            transition: "all 0.3s ease"
                          }}
                        >
                          {lang === "en" ? "Explore Services" : "استكشف خدماتنا"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {mockupView === "social" && (
                    <motion.div
                      key="view-social"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      style={{ flex: 1, padding: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <div style={{ width: "100%", maxWidth: "270px", padding: "18px", borderRadius: buttonRadius, background: cardBgColor, border: `1px solid ${cardBorderColor}`, boxShadow: "0 12px 32px rgba(0,0,0,0.4)", fontFamily: headingFont }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "bold" }}>
                            {state.brandName ? state.brandName.substring(0, 2).toUpperCase() : "AI"}
                          </div>
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: "800", color: headingColor }}>{state.brandName || "Brand Agency"}</div>
                            <div style={{ fontSize: "9px", color: bodyTextColor }}>Sponsored Post</div>
                          </div>
                        </div>
                        <div style={{ width: "100%", height: "100px", borderRadius: "10px", background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: "800", marginBottom: 12, textAlign: "center", padding: "10px", boxShadow: `0 8px 20px ${accentColor}30` }}>
                          {state.subNiche || "Premium Digital Offer"}
                        </div>
                        <div style={{ fontSize: "11px", color: bodyTextColor, lineHeight: 1.4 }}>
                          {lang === "en" ? "Transforming ambitious ideas into scalable digital reality." : "نحول أفكارك الريادية الكبيرة لواقع رقمي ملموس."}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {mockupView === "card" && (
                    <motion.div
                      key="view-card"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      style={{ flex: 1, padding: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <div style={{ width: "270px", height: "150px", borderRadius: buttonRadius, background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`, border: `1px solid ${cardBorderColor}`, padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 16px 36px rgba(0,0,0,0.5)", fontFamily: headingFont }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: "14px", fontWeight: "900", color: headingColor }}>{state.brandName || "NOVA CARD"}</div>
                          <Gem size={16} color={accentColor} />
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: accentColor, fontWeight: "800" }}>{state.subNiche || "Founder & CEO"}</div>
                          <div style={{ fontSize: "10px", color: bodyTextColor, marginTop: 2 }}>contact@{state.brandName ? state.brandName.toLowerCase() : "brand"}.com</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
                </div>
              </div>
            </div>

          </div>

          {/* AI Color Analysis Details with TypingText progressive effect */}
          {colorAnalysis && (
            <motion.div
              className="animate-fade-in"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
                marginTop: "14px",
              }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="result-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <Brain size={16} color="#6366F1" strokeWidth={1.5} />
                  <h4
                    style={{
                      color: "#818CF8",
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    {lang === "en"
                      ? "Color Psychology & Tone"
                      : "الأثر السيكولوجي للهوية"}
                  </h4>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.6,
                    color: "#F8FAFC",
                    margin: 0,
                  }}
                >
                  <TypingText isCached={analysisMode === 'fast' || !isNewlyGeneratedColors}
                    text={lang === "en" ? colorAnalysis.psychology_en : colorAnalysis.psychology_ar}
                    speed={15}
                    delay={50}
                  />
                </p>
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "11px",
                    color: "#94A3B8",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Mic size={13} color="#6366F1" strokeWidth={1.5} />
                  <span>{lang === "en" ? "Tone:" : "نبرة صوت البراند:"}</span>
                  <strong style={{ color: "#fff" }}>
                    <TypingText isCached={analysisMode === 'fast' || !isNewlyGeneratedColors}
                      text={lang === "en" ? colorAnalysis.brand_tone_en : colorAnalysis.brand_tone_ar}
                      speed={15}
                      delay={120}
                    />
                  </strong>
                </div>
              </div>

              <div className="result-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <FileText size={16} color="#6366F1" strokeWidth={1.5} />
                  <h4
                    style={{
                      color: "#818CF8",
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    {lang === "en"
                      ? "Visual Design Assets"
                      : "دليل الخطوط والمجالات"}
                  </h4>
                </div>
                <div style={{ fontSize: "12px", color: "#F8FAFC" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <Type size={13} color="#6366F1" strokeWidth={1.5} />
                    <span>
                      {lang === "en" ? "Font Pairings:" : "تنسيق الخطوط:"}
                    </span>
                    <strong style={{ color: "#fff" }}>
                      <TypingText isCached={analysisMode === 'fast' || !isNewlyGeneratedColors}
                        text={lang === "en" ? colorAnalysis.font_pairings_en : colorAnalysis.font_pairings_ar}
                        speed={15}
                        delay={150}
                      />
                    </strong>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 4,
                      }}
                    >
                      <Building2 size={13} color="#6366F1" strokeWidth={1.5} />
                      <span>
                        {lang === "en" ? "Best For:" : "الأفضل لمجالات:"}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
                    >
                      {(lang === "en"
                        ? colorAnalysis.recommended_industries_en
                        : colorAnalysis.recommended_industries_ar
                      )?.map((ind, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "2px 8px",
                            fontSize: "10px",
                            background: "rgba(99, 102, 241, 0.12)",
                            color: "#818CF8",
                            borderRadius: "4px",
                            border: "1px solid rgba(99, 102, 241, 0.25)",
                            fontWeight: "600",
                          }}
                        >
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

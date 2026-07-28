/**
 * NicheSelection.jsx — 100% Dynamic & Reactive AI-Driven Niche Intelligence Pipeline
 *
 * Direct OpenAI Chat Completions Integration (JSON Mode)
 * Multi-Stage Pipeline:
 *  - Level 1: Macro Market Metrics (cagr, saturation, saturationText, roi)
 *  - Level 2: Micro-Niche Deep Dive (opportunities: strengths/gaps, topLeaders, icp)
 *  - Level 3: Global Benchmark (recommendedCountry, comparisonSummary, keyDifferences)
 *
 * Automatic Micro-Niche Card Click Pipeline:
 *  - Fast Mode (Preset) vs. Live AI (Generate) Mode Toggle
 *  - Clicking any sub-micro card automatically triggers OpenAI Chat Completions API
 *  - Automatically populates Tab 1: Market Opportunities & Tab 2: Top 10 Leaders
 *  - Z-Index fix for Country Dropdown overlay
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { getNiches, seedNiches } from '../../../services/nicheService';
import { callOpenAiApi } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import './AnalysisIdentity.css';
import {
  Globe,
  TrendingUp,
  Target,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Award,
  BarChart3,
  Zap,
  CheckCircle2,
  ArrowRightLeft,
  Bot,
  RefreshCw,
  Search,
  ChevronDown,
  Check,
  Compass,
  Coins,
  Briefcase,
  ShoppingBag,
  Dumbbell,
  Building2,
  Palette,
  Megaphone,
  AlertTriangle,
  Loader2,
  Users,
  Globe2
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// 1. CONSTANTS & MARKET OPTIONS
// ─────────────────────────────────────────────────────────────────
export const NICHE_THEMES = {
  ai:         { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  business:   { color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' },
  marketing:  { color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
  ecom:       { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  fitness:    { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  realestate: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  creative:   { color: '#D946EF', bg: 'rgba(217, 70, 239, 0.1)' },
};
const DEFAULT_THEME = { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };

export const COUNTRY_OPTIONS = [
  { id: 'sa',     name_ar: 'المملكة العربية السعودية',    name_en: 'Saudi Arabia',          flag: '🇸🇦', region: 'GCC'    },
  { id: 'uae',    name_ar: 'الإمارات العربية المتحدة',    name_en: 'UAE',                   flag: '🇦🇪', region: 'GCC'    },
  { id: 'eg',     name_ar: 'جمهورية مصر العربية',         name_en: 'Egypt',                 flag: '🇪🇬', region: 'MENA'   },
  { id: 'kw',     name_ar: 'دولة الكويت',                 name_en: 'Kuwait',                flag: '🇰🇼', region: 'GCC'    },
  { id: 'qa',     name_ar: 'دولة قطر',                    name_en: 'Qatar',                 flag: '🇶🇦', region: 'GCC'    },
  { id: 'bh',     name_ar: 'مملكة البحرين',               name_en: 'Bahrain',               flag: '🇧🇭', region: 'GCC'    },
  { id: 'om',     name_ar: 'سلطنة عمان',                  name_en: 'Oman',                  flag: '🇴🇲', region: 'GCC'    },
  { id: 'jo',     name_ar: 'المملكة الأردنية الهاشمية',  name_en: 'Jordan',                flag: '🇯🇴', region: 'MENA'   },
  { id: 'ma',     name_ar: 'المملكة المغربية',             name_en: 'Morocco',               flag: '🇲🇦', region: 'MENA'   },
  { id: 'dz',     name_ar: 'الجمهورية الجزائرية',         name_en: 'Algeria',               flag: '🇩🇿', region: 'MENA'   },
  { id: 'iq',     name_ar: 'جمهورية العراق',              name_en: 'Iraq',                  flag: '🇮🇶', region: 'MENA'   },
  { id: 'us',     name_ar: 'الولايات المتحدة الأمريكية', name_en: 'United States',          flag: '🇺🇸', region: 'Global' },
  { id: 'uk',     name_ar: 'المملكة المتحدة',             name_en: 'United Kingdom',         flag: '🇬🇧', region: 'Global' },
  { id: 'de',     name_ar: 'جمهورية ألمانيا الاتحادية',  name_en: 'Germany',               flag: '🇩🇪', region: 'Global' },
  { id: 'ca',     name_ar: 'كندا',                        name_en: 'Canada',                flag: '🇨🇦', region: 'Global' },
  { id: 'au',     name_ar: 'أستراليا',                    name_en: 'Australia',             flag: '🇦🇺', region: 'Global' },
  { id: 'global', name_ar: 'السوق العالمي الشامل',         name_en: 'Worldwide Global Market',flag: '🌐', region: 'Global' },
];

export function getNicheVectorIcon(id, size = 20, color = 'currentColor') {
  switch (id) {
    case 'ai':         return <Bot        size={size} color={color} />;
    case 'business':   return <Briefcase  size={size} color={color} />;
    case 'marketing':  return <Megaphone  size={size} color={color} />;
    case 'ecom':       return <ShoppingBag size={size} color={color} />;
    case 'fitness':    return <Dumbbell   size={size} color={color} />;
    case 'realestate': return <Building2  size={size} color={color} />;
    case 'creative':   return <Palette    size={size} color={color} />;
    default:           return <Sparkles   size={size} color={color} />;
  }
}

// ─────────────────────────────────────────────────────────────────
// 2. STRICT OPENAI SYSTEM & USER PROMPT BUILDERS
// ─────────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  return `You are a world-class AI market intelligence strategist and business analyst.

Your objective is to provide precise, data-backed market analysis for a target country and business niche in JSON format.

Output MUST be a single valid JSON object strictly matching this TypeScript interface:

interface NicheSelectionApiResponse {
  // Level 1: Macro Metrics
  cagr: string; // e.g. "+28.4% CAGR"
  saturation: "blue" | "yellow" | "red";
  saturationText: string; // Brief status description (e.g. "Blue Ocean: High demand, low local competition")
  roi: string; // e.g. "40% - 65% Margin | 3 Months Payback"

  // Level 2: Micro-Niche Breakdown
  opportunities: {
    strengths: string[];
    gaps: string[];
  };
  topLeaders: Array<{
    name: string;
    strategy: string;
    url?: string;
  }>;
  icp: {
    ageRange: string;
    targetGroup: string;
    painPoints: string[];
  };

  // Level 3: Global Benchmark (required if global benchmark requested)
  globalComparison?: {
    recommendedCountry: string; // Country name with flag emoji
    comparisonSummary: string; // Brief comparative breakdown vs local target market
    keyDifferences: string[];
  };
}

Rules:
1. Provide realistic, high-value data specifically for the requested micro-niche card and target market.
2. topLeaders must contain 4–6 actual or representative business leaders/competitors in this field.
3. All text MUST be generated in the language specified by the user prompt.
4. Do NOT output markdown code blocks or plain text around the JSON object. Return ONLY raw valid JSON.`;
}

function buildUserPrompt({ selectedNiche, subNiche, targetCountry, isGlobalBenchmark, lang }) {
  const countryObj = COUNTRY_OPTIONS.find(c => c.id === targetCountry) || COUNTRY_OPTIONS[0];
  const mainNicheLabel = selectedNiche?.label_en || selectedNiche?.id || 'Business & Tech';
  const microNicheLabel = subNiche || 'General Business Services';

  return [
    `Target Country Market: "${countryObj.name_en}" (${countryObj.region})`,
    `Primary Niche Category: "${mainNicheLabel}"`,
    `Micro-Niche / Speciality Card Selected: "${microNicheLabel}"`,
    `Include Global Benchmark Evaluation: ${isGlobalBenchmark ? 'YES' : 'NO'}`,
    `Language for ALL generated text fields: ${lang === 'en' ? 'English' : 'Arabic (العربية)'}`,
    '',
    'Generate the complete NicheSelectionApiResponse JSON object for this micro-niche card now.',
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────
// 3. REACTIVE PIPELINE HOOK — useNicheAnalysis
// ─────────────────────────────────────────────────────────────────
function useNicheAnalysis({ selectedNiche, subNiche, targetCountry, isGlobalBenchmark, lang }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [analysisMode, setAnalysisMode] = useState('live'); // 'live' | 'fast'
  const requestIdRef            = useRef(0);

  // Clear data when main inputs change
  useEffect(() => {
    setData(null);
    setError(null);
  }, [selectedNiche?.id, targetCountry, isGlobalBenchmark]);

  const run = useCallback(async (overrideSubNiche) => {
    if (!selectedNiche) return;
    const activeSubNiche = overrideSubNiche !== undefined ? overrideSubNiche : subNiche;

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const systemPrompt = buildSystemPrompt();
      const userPrompt   = buildUserPrompt({
        selectedNiche,
        subNiche: activeSubNiche,
        targetCountry,
        isGlobalBenchmark,
        lang
      });

      const responseRaw = await callOpenAiApi({ systemPrompt, userPrompt, jsonMode: true });

      // Guard against stale response if user rapidly clicked another card
      if (currentRequestId !== requestIdRef.current) return;

      const parsed = JSON.parse(responseRaw);

      if (!parsed.cagr || !parsed.saturation || !parsed.opportunities || !parsed.topLeaders || !parsed.icp) {
        throw new Error('Invalid schema format returned by AI engine.');
      }

      setData(parsed);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      console.error('[useNicheAnalysis] API Error:', err);
      const isApiKeyErr = err.message && err.message.includes('VITE_OPENAI_API_KEY');
      setError(
        isApiKeyErr
          ? 'Please provide a valid VITE_OPENAI_API_KEY in your .env file to enable Live AI generation.'
          : (err.message || (lang === 'en' ? 'Analysis failed. Please try again.' : 'تعذّر إجراء التحليل. الرجاء إعادة المحاولة.'))
      );
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [selectedNiche, subNiche, targetCountry, isGlobalBenchmark, lang]);

  const reset = useCallback(() => {
    requestIdRef.current++;
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, analysisMode, setAnalysisMode, run, reset };
}

// ─────────────────────────────────────────────────────────────────
// 4. MICRO-NICHE GENERATION HOOK — useLiveMicroIdeas
// ─────────────────────────────────────────────────────────────────
function useLiveMicroIdeas() {
  const [ideas, setIdeas]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async ({ selectedNiche, targetCountry, lang }) => {
    if (!selectedNiche) return;
    setLoading(true);
    setError(null);

    const countryObj = COUNTRY_OPTIONS.find(c => c.id === targetCountry) || COUNTRY_OPTIONS[0];

    try {
      const sysPrompt = `You are a business strategist. Return a JSON object with key "ideas" containing an array of 8 lucrative micro-niche service ideas.`;
      const usrPrompt = `Primary Niche: "${selectedNiche.label_en || selectedNiche.id}". Market: "${countryObj.name_en}". Language: ${lang === 'en' ? 'English' : 'Arabic'}.`;
      const raw    = await callOpenAiApi({ systemPrompt: sysPrompt, userPrompt: usrPrompt, jsonMode: true });
      const parsed = JSON.parse(raw);

      const list = Array.isArray(parsed) ? parsed :
                   Array.isArray(parsed.ideas) ? parsed.ideas :
                   Object.values(parsed).find(v => Array.isArray(v)) || [];

      const normalised = list
        .map(i => typeof i === 'string' ? i.trim() : (i?.title || i?.name || i?.idea || ''))
        .filter(Boolean);

      setIdeas(normalised);
    } catch (err) {
      const isApiKeyErr = err.message && err.message.includes('VITE_OPENAI_API_KEY');
      setError(
        isApiKeyErr
          ? 'Please provide a valid VITE_OPENAI_API_KEY in your .env file to enable Live AI generation.'
          : (err.message || (lang === 'en' ? 'Failed to fetch AI micro-niches.' : 'تعذّر توليد الأفكار.'))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setIdeas([]); setError(null); }, []);

  return { ideas, loading, error, fetch, reset };
}

// ─────────────────────────────────────────────────────────────────
// 5. DROPDOWN COMPONENT (With High Z-Index to Prevent Overlapping)
// ─────────────────────────────────────────────────────────────────
function TargetMarketDropdown({ value, onChange, options, lang }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [searchQuery, setSearch] = useState('');
  const dropdownRef             = useRef(null);
  const selectedOption          = options.find(c => c.id === value) || options[0];

  const filtered = options.filter(opt => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return opt.name_en.toLowerCase().includes(q) || opt.name_ar.includes(q) || opt.id.includes(q);
  });

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', zIndex: 999 }}>
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="ns-dropdown-trigger"
        style={{
          width: '100%', minHeight: '48px',
          borderRadius: '14px',
          padding: '0 16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{selectedOption.flag}</span>
          <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <div className="ns-heading-title" style={{ fontSize: '13px', fontWeight: '800' }}>
              {lang === 'en' ? selectedOption.name_en : selectedOption.name_ar}
            </div>
            {selectedOption.region && (
              <span style={{ fontSize: '10px', color: '#818CF8', fontWeight: '700' }}>
                {selectedOption.region}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.15)', color: '#818CF8', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
            {options.length} {lang === 'en' ? 'Markets' : 'أسواق'}
          </span>
          <ChevronDown size={16} color="#94A3B8" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
            className="ns-dropdown-menu"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              zIndex: 9999, borderRadius: '14px',
              padding: '10px',
            }}
          >
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={14} color="#64748B" style={{ position: 'absolute', top: '10px', left: '10px' }} />
              <input
                type="text" placeholder={lang === 'en' ? 'Search country…' : 'ابحث عن دولة…'}
                value={searchQuery} onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                className="ns-dropdown-search-input"
                style={{
                  width: '100%', borderRadius: '8px',
                  padding: '6px 12px 6px 32px', fontSize: '12px', outline: 'none',
                }}
              />
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {filtered.length === 0 ? (
                <div className="ns-subtext" style={{ fontSize: '11px', textAlign: 'center', padding: '12px' }}>
                  {lang === 'en' ? 'No market found' : 'لم يتم العثور على سوق'}
                </div>
              ) : filtered.map(opt => {
                const sel = opt.id === value;
                return (
                  <div key={opt.id}
                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                    className={`ns-dropdown-option ${sel ? 'selected' : ''}`}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>{opt.flag}</span>
                      <span className="ns-dropdown-option-title" style={{ fontSize: '12px', fontWeight: sel ? '800' : '600' }}>
                        {lang === 'en' ? opt.name_en : opt.name_ar}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {opt.region && (
                        <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', padding: '2px 6px', borderRadius: '4px' }}>
                          {opt.region}
                        </span>
                      )}
                      {sel && <Check size={14} color="#6366F1" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 6. UI FEEDBACK COMPONENTS
// ─────────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry, lang }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', textAlign: 'center', gap: '12px', marginTop: '16px',
    }}>
      <AlertTriangle size={32} color="#EF4444" />
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#F87171' }}>{message}</div>
      <button
        type="button" onClick={onRetry}
        style={{
          background: '#EF4444', color: '#fff', border: 'none',
          padding: '10px 22px', borderRadius: '10px', fontSize: '13px',
          fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <RefreshCw size={14} />
        <span>{lang === 'en' ? 'Retry AI Analysis' : 'إعادة المحاولة'}</span>
      </button>
    </div>
  );
}

function MetricCard({ icon, label, value, accent, badgeType, loading }) {
  const getBadgeStyle = (b) => {
    if (b === 'blue') return { bg: 'rgba(16,185,129,0.15)', color: '#10B981', border: 'rgba(16,185,129,0.3)' };
    if (b === 'yellow') return { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: 'rgba(245,158,11,0.3)' };
    if (b === 'red') return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'rgba(239,68,68,0.3)' };
    return null;
  };
  const bStyle = getBadgeStyle(badgeType);

  return (
    <div className="ns-subcard" style={{ padding: '16px', borderRadius: '14px' }}>
      <div className="ns-subtext" style={{ fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        {icon}
        <span>{label}</span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontSize: '12px' }}>
          <Loader2 size={14} className="spin" />
          <span>Analysing…</span>
        </div>
      ) : bStyle ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{
            fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px',
            background: bStyle.bg, color: bStyle.color, border: `1px solid ${bStyle.border}`,
            width: 'fit-content', textTransform: 'uppercase',
          }}>
            {badgeType} Ocean
          </span>
          <div className="ns-heading-title" style={{ fontSize: '13px', fontWeight: '700', lineHeight: '1.4' }}>
            {value}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '16px', fontWeight: '900', color: accent }}>{value}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 7. TAB CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────
function OpportunitiesTab({ data, loading, error, onRetry, lang }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '13px', padding: '24px 0' }}>
        <Loader2 size={18} className="spin" />
        <span>{lang === 'en' ? 'Fetching live micro-niche opportunities via OpenAI…' : 'جاري تحليل الفرص المباشرة من الذكاء الاصطناعي…'}</span>
      </div>
    );
  }
  if (error) return <ErrorBanner message={error} onRetry={onRetry} lang={lang} />;
  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <Sparkles size={26} color="#334155" />
        <div style={{ fontSize: '13px', fontWeight: '700' }}>
          {lang === 'en'
            ? 'Select any micro-niche card above to automatically generate live AI opportunities.'
            : 'اختر أي كارت للتخصص الدقيق أعلاه لتوليد الفرص المباشرة فوراً.'}
        </div>
      </div>
    );
  }

  const strengths = Array.isArray(data.opportunities?.strengths) ? data.opportunities.strengths : [];
  const gaps      = Array.isArray(data.opportunities?.gaps)      ? data.opportunities.gaps      : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
      {strengths.length > 0 && (
        <div className="ns-opp-card-green" style={{ borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#10B981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} />
            <span>{lang === 'en' ? 'Strengths & Market Drivers' : 'نقاط القوة والمزايا التنافسية'}</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {strengths.map((item, i) => (
              <li key={i} className="ns-list-item" style={{ fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <ShieldCheck size={13} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="ns-opp-card-indigo" style={{ borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#818CF8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={15} />
            <span>{lang === 'en' ? 'Market Gaps & Unserved Needs' : 'الفجوات والفرص غير المُستغَلة'}</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {gaps.map((item, i) => (
              <li key={i} className="ns-list-item" style={{ fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Target size={13} color="#818CF8" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TopLeadersTab({ data, loading, error, onRetry, lang }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '13px', padding: '24px 0' }}>
        <Loader2 size={18} className="spin" />
        <span>{lang === 'en' ? 'Fetching real-time top market leaders via OpenAI…' : 'جاري البحث عن أبرز المنافسين والرواد…'}</span>
      </div>
    );
  }
  if (error) return <ErrorBanner message={error} onRetry={onRetry} lang={lang} />;
  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <Award size={26} color="#334155" />
        <div style={{ fontSize: '13px', fontWeight: '700' }}>
          {lang === 'en'
            ? 'Select a micro-niche card above to reveal real market leaders and competitors.'
            : 'اختر تخصصاً دقيقاً لعرض أبرز الشركات والمنافسين في هذا المجال.'}
        </div>
      </div>
    );
  }

  const leaders = Array.isArray(data.topLeaders) ? data.topLeaders : [];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr className="ns-table-head-row" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <th style={{ padding: '10px', width: '32px' }}>#</th>
            <th style={{ padding: '10px' }}>{lang === 'en' ? 'Company / Brand' : 'الشركة / العلامة التجارية'}</th>
            <th style={{ padding: '10px' }}>{lang === 'en' ? 'Core Differentiator & Strategy' : 'استراتيجية التميز'}</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'en' ? 'Link' : 'رابط'}</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader, idx) => (
            <tr key={idx} className="ns-table-row">
              <td className="ns-subtext" style={{ padding: '10px', fontWeight: '800' }}>{idx + 1}</td>
              <td className="ns-heading-title" style={{ padding: '10px', fontWeight: '800' }}>{leader.name}</td>
              <td className="ns-list-item" style={{ padding: '10px', lineHeight: '1.5' }}>{leader.strategy}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {leader.url ? (
                  <a href={leader.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      color: '#6366F1', fontWeight: '700', textDecoration: 'none', fontSize: '11px',
                      background: 'rgba(99,102,241,0.12)', padding: '4px 10px',
                      borderRadius: '6px', border: '1px solid rgba(99,102,241,0.25)',
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
  );
}

function IcpCard({ icp, loading, lang, themeColor }) {
  if (loading) {
    return (
      <div style={{ background: `${themeColor}08`, border: `1px solid ${themeColor}30`, borderRadius: '14px', padding: '18px', marginTop: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '12px' }}>
        <Loader2 size={16} className="spin" />
        <span>{lang === 'en' ? 'Calculating Ideal Customer Persona (ICP)…' : 'جاري تحليل بروفايل العميل المثالي (ICP)…'}</span>
      </div>
    );
  }
  if (!icp) return null;
  const painPoints = Array.isArray(icp.painPoints) ? icp.painPoints : [];

  return (
    <div className="ns-icp-card" style={{ borderRadius: '14px', padding: '18px', marginTop: '18px' }}>
      <div style={{ fontSize: '13px', fontWeight: '800', color: themeColor, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={16} />
        <span>{lang === 'en' ? 'Ideal Customer Persona (ICP)' : 'ملف العميل المثالي (ICP)'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <div className="ns-subcard" style={{ padding: '10px 12px', borderRadius: '8px' }}>
          <span className="ns-subtext" style={{ fontSize: '10px', display: 'block', fontWeight: '700' }}>
            {lang === 'en' ? 'Target Group:' : 'الفئة المستهدفة:'}
          </span>
          <span className="ns-heading-title" style={{ fontSize: '12px', fontWeight: '800' }}>{icp.targetGroup || '—'}</span>
        </div>
        <div className="ns-subcard" style={{ padding: '10px 12px', borderRadius: '8px' }}>
          <span className="ns-subtext" style={{ fontSize: '10px', display: 'block', fontWeight: '700' }}>
            {lang === 'en' ? 'Demographic Age Range:' : 'الفئة العمرية:'}
          </span>
          <span className="ns-heading-title" style={{ fontSize: '12px', fontWeight: '800' }}>{icp.ageRange || '—'}</span>
        </div>
      </div>

      {painPoints.length > 0 && (
        <>
          <div className="ns-subtext" style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>
            {lang === 'en' ? 'Core Client Pain Points:' : 'نقاط الألم الرئيسية للعميل:'}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {painPoints.map((p, i) => (
              <li key={i} className="ns-list-item" style={{ fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Target size={12} color={themeColor} style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function GlobalComparisonCard({ globalComparison, loading, activeCountryObj, lang }) {
  if (loading) {
    return (
      <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '12px' }}>
        <Loader2 size={16} className="spin" />
        <span>{lang === 'en' ? 'Calculating Level 3 Global Benchmark…' : 'جاري تحليل المقارنة العالمية…'}</span>
      </div>
    );
  }
  if (!globalComparison) return null;

  const keyDiffs = Array.isArray(globalComparison.keyDifferences) ? globalComparison.keyDifferences : [];

  return (
    <div className="ns-global-card" style={{ marginTop: '16px', padding: '16px', borderRadius: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontWeight: '800', fontSize: '13px', marginBottom: '12px' }}>
        <ArrowRightLeft size={16} />
        <span>
          {lang === 'en'
            ? 'Level 3 Global Benchmark: Primary Market vs. Top Opportunity Market'
            : 'مقارنة عالمية: سوقك المحلي مقابل أفضل سوق بديل'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <div className="ns-subcard" style={{ padding: '14px', borderRadius: '12px' }}>
          <div className="ns-subtext" style={{ fontSize: '11px', fontWeight: '700' }}>
            {lang === 'en' ? 'Primary Target Country:' : 'سوقك المستهدف الأساسي:'}
          </div>
          <div className="ns-heading-title" style={{ fontSize: '14px', fontWeight: '900', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{activeCountryObj.flag}</span>
            <span>{lang === 'en' ? activeCountryObj.name_en : activeCountryObj.name_ar}</span>
          </div>
        </div>

        <div className="ns-opp-card-green" style={{ padding: '14px', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>
            {lang === 'en' ? 'Recommended Benchmark Market:' : 'السوق المرجعي الموصى به:'}
          </div>
          <div className="ns-heading-title" style={{ fontSize: '14px', fontWeight: '900', marginTop: '4px' }}>
            {globalComparison.recommendedCountry}
          </div>
        </div>
      </div>

      {globalComparison.comparisonSummary && (
        <p className="ns-list-item" style={{ fontSize: '12px', lineHeight: '1.5', marginBottom: '10px' }}>
          {globalComparison.comparisonSummary}
        </p>
      )}

      {keyDiffs.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {keyDiffs.map((d, i) => (
            <li key={i} className="ns-list-item" style={{ fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Globe2 size={13} color="#818CF8" style={{ marginTop: 3, flexShrink: 0 }} />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 8. MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function NicheSelection({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';

  const [niches, setNiches]                 = useState([]);
  const [nichesLoading, setNichesLoading]   = useState(true);
  const [selectedNiche, setSelectedNiche]   = useState(null);

  const [targetCountry, setTargetCountry]         = useState(state.targetCountry || 'sa');
  const [isGlobalBenchmark, setIsGlobalBenchmark] = useState(false);
  const [deepDiveTab, setDeepDiveTab]             = useState('opportunities');
  const [microNicheMode, setMicroNicheMode]       = useState('fast'); // 'fast' | 'live'
  const [microSearchQuery, setMicroSearchQuery]   = useState('');

  const deepDiveRef = useRef(null);

  // Multi-stage Analysis Pipeline
  const analysis = useNicheAnalysis({
    selectedNiche,
    subNiche: state.subNiche,
    targetCountry,
    isGlobalBenchmark,
    lang,
  });

  const microIdeas = useLiveMicroIdeas();

  const activeCountryObj = COUNTRY_OPTIONS.find(c => c.id === targetCountry) || COUNTRY_OPTIONS[0];
  const themeColor       = NICHE_THEMES[selectedNiche?.id]?.color || '#6366F1';
  const getLabel         = n => lang === 'en' ? n.label_en : n.label_ar;

  // Load Niches
  useEffect(() => {
    (async () => {
      setNichesLoading(true);
      try {
        let data = await getNiches();
        if (!data || data.length === 0) { await seedNiches(); data = await getNiches(); }
        setNiches(data);
        if (state.niche) {
          const found = data.find(n => n.id === state.niche);
          if (found) setSelectedNiche(found);
        } else if (data.length > 0) {
          setSelectedNiche(data[0]);
          dispatch({ type: 'SET_FIELD', field: 'niche', value: data[0].id });
        }
      } catch (e) { console.error('Niche load error:', e); }
      finally { setNichesLoading(false); }
    })();
  }, []);

  // Sync with AppContext
  useEffect(() => {
    dispatch({ type: 'SET_FIELD', field: 'targetCountry', value: targetCountry });
    dispatch({ type: 'SET_FIELD', field: 'isGlobalBenchmark', value: isGlobalBenchmark });
  }, [targetCountry, isGlobalBenchmark]);

  // Automatic fetch when selecting a main niche
  const handleNicheSelect = useCallback(n => {
    setSelectedNiche(n);
    dispatch({ type: 'SET_FIELD', field: 'niche',    value: n.id });
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: '' });
    microIdeas.reset();
    analysis.reset();
  }, [analysis, microIdeas, dispatch]);

  // AUTOMATIC SUB-MICRO SELECTION -> Triggers OpenAI Chat Completions API & populates Tab 1 & Tab 2
  const handleSubNicheSelect = useCallback(text => {
    if (!text) return;
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: text });
    // Immediately invoke OpenAI API fetch for this sub-micro niche
    analysis.run(text);

    // Smooth-scroll to deep dive section
    setTimeout(() => {
      if (deepDiveRef.current) {
        deepDiveRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [analysis, dispatch]);

  const handleCountryChange = useCallback(val => {
    setTargetCountry(val);
  }, []);

  // Micro-niches list based on Mode (Fast Mode vs Live AI)
  const presetIdeas = selectedNiche
    ? (lang === 'en' ? selectedNiche.ideas_en : selectedNiche.ideas_ar) || []
    : [];

  const rawIdeas = microNicheMode === 'live'
    ? (microIdeas.ideas.length > 0 ? microIdeas.ideas : presetIdeas)
    : presetIdeas;

  const filteredIdeas = rawIdeas.filter(idea =>
    !microSearchQuery || idea.toLowerCase().includes(microSearchQuery.toLowerCase())
  );

  return (
    <ToolDashboardLayout
      id="niche-selection"
      title={lang === 'en' ? 'Strategic Niche Selection' : 'اختيار التخصص الاستراتيجي'}
      subtitle={lang === 'en'
        ? "Don't just be 'another freelancer'. Choose your niche carefully with live OpenAI market intelligence."
        : "لا تكن مجرد 'مستقل آخر'. اختر تخصصك بدقة بدعم مباشر من تحليل الذكاء الاصطناعي."}
      stepNumber={stepNumber}
    >
      {nichesLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="td-card td-skeleton" style={{ height: '110px', opacity: 0.15 }} />
          ))}
        </div>
      ) : (
        <>
          {/* LEVEL 1: MARKET & NICHE FILTERS (Z-Index 100 relative to avoid overlay overlap) */}
          <div className="ns-panel-card" style={{
            padding: '20px', marginBottom: '24px',
            position: 'relative', zIndex: 100,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: '1 1 280px', position: 'relative', zIndex: 200 }}>
                <label className="ns-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>
                  <Globe size={16} color="#6366F1" />
                  <span>{lang === 'en' ? 'Level 1: Select Target Market Country' : 'المستوى 1: اختر الدولة والسوق المستهدف'}</span>
                </label>
                <TargetMarketDropdown
                  value={targetCountry}
                  onChange={handleCountryChange}
                  options={COUNTRY_OPTIONS}
                  lang={lang}
                />
              </div>

              {/* Global Benchmark Toggle Switch */}
              <div
                onClick={() => setIsGlobalBenchmark(g => !g)}
                className="ns-benchmark-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: isGlobalBenchmark
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(16,185,129,0.25))'
                    : 'transparent',
                  border: `1px solid ${isGlobalBenchmark ? '#6366F1' : 'rgba(255,255,255,0.1)'}`,
                  padding: '12px 18px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.25s ease',
                }}
              >
                <Globe size={18} color={isGlobalBenchmark ? '#10B981' : '#94A3B8'} />
                <div>
                  <div className="ns-heading-title" style={{ fontSize: '13px', fontWeight: '800' }}>
                    {lang === 'en' ? 'Level 3 Global Benchmark' : 'مقارنة السوق العالمي (المستوى 3)'}
                  </div>
                  <div className="ns-subtext" style={{ fontSize: '10px' }}>
                    {lang === 'en' ? 'Compare local vs. global alternative' : 'مقارنة أداء السوق المحلي بالسوق العالمي'}
                  </div>
                </div>
                <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: isGlobalBenchmark ? '#10B981' : '#334155', position: 'relative', marginLeft: '6px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: isGlobalBenchmark ? '21px' : '3px', transition: 'all 0.2s ease' }} />
                </div>
              </div>
            </div>

            {/* Level 3 Global Benchmark Card */}
            {isGlobalBenchmark && (
              <GlobalComparisonCard
                globalComparison={analysis.data?.globalComparison}
                loading={analysis.loading}
                activeCountryObj={activeCountryObj}
                lang={lang}
              />
            )}
          </div>

          {/* PRIMARY NICHE CATEGORY GRID (Z-Index 1) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {niches.map(n => {
              const theme = NICHE_THEMES[n.id] || DEFAULT_THEME;
              const isSelected = state.niche === n.id;
              return (
                <div key={n.id}
                  className={`td-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleNicheSelect(n)}
                  style={{ '--td-accent': theme.color }}
                >
                  <div className="td-card-icon" style={{
                    background: isSelected ? theme.color : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#fff' : theme.color,
                    borderColor: isSelected ? 'transparent' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {getNicheVectorIcon(n.id, 24, isSelected ? '#fff' : theme.color)}
                  </div>
                  <div className="td-card-label" style={{ color: isSelected ? undefined : '#B0BAC8' }}>{getLabel(n)}</div>
                </div>
              );
            })}
          </div>

          {/* LEVEL 1: MACRO METRICS DISPLAY */}
          {selectedNiche && (
            <div className="ns-panel-card" style={{
              border: `1px solid ${themeColor}50`, borderRadius: '16px',
              padding: '20px', marginBottom: '24px',
              position: 'relative', zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${themeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={20} color={themeColor} />
                </div>
                <div>
                  <h4 className="ns-heading-title" style={{ margin: 0, fontSize: '15px', fontWeight: '900' }}>
                    {lang === 'en' ? `Level 1 Macro Metrics: ${getLabel(selectedNiche)}` : `المؤشرات الكلية: ${getLabel(selectedNiche)}`}
                  </h4>
                  <div className="ns-subtext" style={{ fontSize: '11px' }}>
                    {lang === 'en' ? `Market intelligence for ${activeCountryObj.name_en}` : `تحليل بيانات السوق لـ ${activeCountryObj.name_ar}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <MetricCard
                  icon={<TrendingUp size={14} color="#10B981" />}
                  label={lang === 'en' ? 'Market Growth (CAGR)' : 'نمو السوق (CAGR)'}
                  value={analysis.data?.cagr || '—'}
                  accent="#10B981"
                  loading={analysis.loading}
                />
                <MetricCard
                  icon={<Compass size={14} color="#3B82F6" />}
                  label={lang === 'en' ? 'Market Saturation' : 'حالة تشبع السوق'}
                  value={analysis.data?.saturationText || '—'}
                  badgeType={analysis.data?.saturation}
                  accent="#3B82F6"
                  loading={analysis.loading}
                />
                <MetricCard
                  icon={<Coins size={14} color="#F59E0B" />}
                  label={lang === 'en' ? 'Expected ROI Margin' : 'العائد المتوقع ROI'}
                  value={analysis.data?.roi || '—'}
                  accent="#F59E0B"
                  loading={analysis.loading}
                />
              </div>

              {/* ICP Component */}
              <IcpCard icp={analysis.data?.icp} loading={analysis.loading} lang={lang} themeColor={themeColor} />
            </div>
          )}

          {/* LEVEL 2: MICRO-NICHE SELECTION & DEEP DIVE */}
          {selectedNiche && (
            <div className="td-info-panel ns-panel-card" style={{ borderColor: `${themeColor}40`, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                <h3 className="ns-heading-title" style={{ fontSize: '15px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color={themeColor} />
                  <span>{lang === 'en' ? 'Select Micro-Niche Idea:' : 'اختر التخصص الدقيق (Micro-Niche):'}</span>
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Segmented Mode Switch: Fast Mode (Preset) vs Live AI (Generate) */}
                  <div className="ai-mode-switch-bar" style={{ display: 'flex', padding: '3px', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setMicroNicheMode('fast')}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        background: microNicheMode === 'fast' ? themeColor : 'transparent',
                        color: microNicheMode === 'fast' ? '#fff' : '#94A3B8',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Zap size={12} />
                      <span>{lang === 'en' ? 'Fast Mode (Preset)' : 'النمط السريع (مسبق)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMicroNicheMode('live');
                        if (microIdeas.ideas.length === 0 && !microIdeas.loading) {
                          microIdeas.fetch({ selectedNiche, targetCountry, lang });
                        }
                      }}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        background: microNicheMode === 'live' ? themeColor : 'transparent',
                        color: microNicheMode === 'live' ? '#fff' : '#94A3B8',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Bot size={12} />
                      <span>{lang === 'en' ? 'Live AI (Generate)' : 'ذكاء اصطناعي مباشر (توليد)'}</span>
                    </button>
                  </div>

                  {/* Inline Search Filter Control */}
                  <div style={{ position: 'relative', width: '180px' }}>
                    <Search size={13} color="#64748B" style={{ position: 'absolute', top: '9px', left: '10px' }} />
                    <input
                      type="text"
                      value={microSearchQuery}
                      onChange={e => setMicroSearchQuery(e.target.value)}
                      placeholder={lang === 'en' ? 'Filter micro-niches…' : 'تصفية التخصصات…'}
                      className="ns-dropdown-search-input"
                      style={{
                        width: '100%', borderRadius: '8px',
                        padding: '5px 10px 5px 30px', fontSize: '11px', outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Live AI Status / Re-generate Action Bar */}
              {microNicheMode === 'live' && (
                <div className="ns-opp-card-indigo" style={{
                  borderRadius: '12px',
                  padding: '10px 14px', marginBottom: '16px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={18} color="#818CF8" />
                    <div>
                      <div className="ns-heading-title" style={{ fontSize: '12px', fontWeight: '800' }}>
                        {lang === 'en' ? 'Live AI Micro-Niche Generator Active (OpenAI API)' : 'مولّد التخصصات المباشر بالذكاء الاصطناعي مفعّل'}
                      </div>
                      <div className="ns-subtext" style={{ fontSize: '10px' }}>
                        {microIdeas.loading
                          ? (lang === 'en' ? 'Generating custom real-time micro-niches from OpenAI…' : 'جاري استدعاء OpenAI لتوليد أفكار حية…')
                          : (lang === 'en' ? 'Displaying custom real-time micro-niches for target market' : 'عرض أفكار تخصصات مخصصة ومولّدة لحظياً حسب السوق المستهدف')}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => microIdeas.fetch({ selectedNiche, targetCountry, lang })}
                    disabled={microIdeas.loading}
                    style={{
                      background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)',
                      color: '#818CF8', padding: '5px 12px', borderRadius: '8px', fontSize: '11px',
                      fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <RefreshCw size={12} className={microIdeas.loading ? 'spin' : ''} />
                    <span>{lang === 'en' ? 'Regenerate via OpenAI' : 'إعادة التوليد عبر OpenAI'}</span>
                  </button>
                </div>
              )}

              {/* Micro-Niches Chips / Cards */}
              {microIdeas.loading && microNicheMode === 'live' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '12px', marginBottom: '18px' }}>
                  <Loader2 size={16} className="spin" />
                  <span>{lang === 'en' ? 'OpenAI Chat Completions API is generating 8 micro-niches…' : 'جاري توليد 8 تخصصات دقيقة من OpenAI…'}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                  {filteredIdeas.map((ideaText, i) => {
                    const isActive = state.subNiche === ideaText;
                    return (
                      <button key={i} onClick={() => handleSubNicheSelect(ideaText)}
                        className={`ns-chip-btn ${isActive ? 'active' : ''}`}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px', fontSize: '13px', fontWeight: '700',
                          cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          boxShadow: isActive ? `0 0 14px ${themeColor}40` : 'none',
                        }}
                      >
                        <Target size={13} color={isActive ? themeColor : '#64748B'} />
                        <span>{ideaText}</span>
                        {isActive && analysis.loading && <Loader2 size={12} className="spin" color={themeColor} />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Micro-Niche Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '8px', fontWeight: '700' }}>
                  {lang === 'en' ? 'Selected Micro-Niche Card Title:' : 'التخصص الدقيق المختار:'}
                </label>
                <input
                  type="text"
                  onChange={e => handleSubNicheSelect(e.target.value)}
                  value={state.subNiche || ''}
                  placeholder={lang === 'en' ? 'Type or select a micro-niche card above…' : 'اختر كارت التخصص الدقيق أو اكتب تخصصك…'}
                  className="td-input"
                  style={{ borderColor: state.subNiche ? themeColor : 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 'bold' }}
                />
              </div>

              {/* DEEP DIVE ANALYSIS TABS: Tab 1 (Market Opportunities) & Tab 2 (Top 10 Leaders) */}
              <div ref={deepDiveRef} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                  {[
                    { key: 'opportunities', label_en: 'Tab 1: Market Opportunities', label_ar: 'التبويب 1: فرص السوق والتحليل (Market Opportunities)', icon: <Sparkles size={13} /> },
                    { key: 'leaders',        label_en: 'Tab 2: Top 10 Leaders',        label_ar: 'التبويب 2: أبرز الرواد (Top 10 Leaders)',          icon: <Award size={13} /> },
                  ].map(tab => (
                    <button key={tab.key} type="button"
                      onClick={() => setDeepDiveTab(tab.key)}
                      style={{
                        padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '800',
                        border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                        background: deepDiveTab === tab.key ? themeColor : 'transparent',
                        color: deepDiveTab === tab.key ? '#fff' : '#94A3B8',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {tab.icon}
                      <span>{lang === 'en' ? tab.label_en : tab.label_ar}</span>
                    </button>
                  ))}
                </div>

                {deepDiveTab === 'opportunities' && (
                  <OpportunitiesTab
                    data={analysis.data}
                    loading={analysis.loading}
                    error={analysis.error}
                    onRetry={() => analysis.run(state.subNiche)}
                    lang={lang}
                  />
                )}
                {deepDiveTab === 'leaders' && (
                  <TopLeadersTab
                    data={analysis.data}
                    loading={analysis.loading}
                    error={analysis.error}
                    onRetry={() => analysis.run(state.subNiche)}
                    lang={lang}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </ToolDashboardLayout>
  );
}

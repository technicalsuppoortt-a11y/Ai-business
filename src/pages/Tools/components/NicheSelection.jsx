/**
 * NicheSelection.jsx â€” 100% Dynamic & Reactive AI-Driven Niche Intelligence Pipeline
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
import { useAuth } from '../../../context/AuthContext';
import { getNiches, seedNiches } from '../../../services/nicheService';
import { getNicheAnalysis } from '../../../services/contentDbService';
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
  Edit3,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ArrowRightLeft,
  Bot,
  RefreshCw,
  Search,
  Filter,
  X,
  Flame,
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 1. CONSTANTS & MARKET OPTIONS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  { id: 'sa',     name_ar: 'ط§ظ„ظ…ظ…ظ„ظƒط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ط¹ظˆط¯ظٹط©',    name_en: 'Saudi Arabia',          flag: 'ًں‡¸ًں‡¦', region: 'GCC'    },
  { id: 'uae',    name_ar: 'ط§ظ„ط¥ظ…ط§ط±ط§طھ ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ظ…طھط­ط¯ط©',    name_en: 'UAE',                   flag: 'ًں‡¦ًں‡ھ', region: 'GCC'    },
  { id: 'eg',     name_ar: 'ط¬ظ…ظ‡ظˆط±ظٹط© ظ…طµط± ط§ظ„ط¹ط±ط¨ظٹط©',         name_en: 'Egypt',                 flag: 'ًں‡ھًں‡¬', region: 'MENA'   },
  { id: 'kw',     name_ar: 'ط¯ظˆظ„ط© ط§ظ„ظƒظˆظٹطھ',                 name_en: 'Kuwait',                flag: 'ًں‡°ًں‡¼', region: 'GCC'    },
  { id: 'qa',     name_ar: 'ط¯ظˆظ„ط© ظ‚ط·ط±',                    name_en: 'Qatar',                 flag: 'ًں‡¶ًں‡¦', region: 'GCC'    },
  { id: 'bh',     name_ar: 'ظ…ظ…ظ„ظƒط© ط§ظ„ط¨ط­ط±ظٹظ†',               name_en: 'Bahrain',               flag: 'ًں‡§ًں‡­', region: 'GCC'    },
  { id: 'om',     name_ar: 'ط³ظ„ط·ظ†ط© ط¹ظ…ط§ظ†',                  name_en: 'Oman',                  flag: 'ًں‡´ًں‡²', region: 'GCC'    },
  { id: 'jo',     name_ar: 'ط§ظ„ظ…ظ…ظ„ظƒط© ط§ظ„ط£ط±ط¯ظ†ظٹط© ط§ظ„ظ‡ط§ط´ظ…ظٹط©',  name_en: 'Jordan',                flag: 'ًں‡¯ًں‡´', region: 'MENA'   },
  { id: 'ma',     name_ar: 'ط§ظ„ظ…ظ…ظ„ظƒط© ط§ظ„ظ…ط؛ط±ط¨ظٹط©',             name_en: 'Morocco',               flag: 'ًں‡²ًں‡¦', region: 'MENA'   },
  { id: 'dz',     name_ar: 'ط§ظ„ط¬ظ…ظ‡ظˆط±ظٹط© ط§ظ„ط¬ط²ط§ط¦ط±ظٹط©',         name_en: 'Algeria',               flag: 'ًں‡©ًں‡؟', region: 'MENA'   },
  { id: 'iq',     name_ar: 'ط¬ظ…ظ‡ظˆط±ظٹط© ط§ظ„ط¹ط±ط§ظ‚',              name_en: 'Iraq',                  flag: 'ًں‡®ًں‡¶', region: 'MENA'   },
  { id: 'us',     name_ar: 'ط§ظ„ظˆظ„ط§ظٹط§طھ ط§ظ„ظ…طھط­ط¯ط© ط§ظ„ط£ظ…ط±ظٹظƒظٹط©', name_en: 'United States',          flag: 'ًں‡؛ًں‡¸', region: 'Global' },
  { id: 'uk',     name_ar: 'ط§ظ„ظ…ظ…ظ„ظƒط© ط§ظ„ظ…طھط­ط¯ط©',             name_en: 'United Kingdom',         flag: 'ًں‡¬ًں‡§', region: 'Global' },
  { id: 'de',     name_ar: 'ط¬ظ…ظ‡ظˆط±ظٹط© ط£ظ„ظ…ط§ظ†ظٹط§ ط§ظ„ط§طھط­ط§ط¯ظٹط©',  name_en: 'Germany',               flag: 'ًں‡©ًں‡ھ', region: 'Global' },
  { id: 'ca',     name_ar: 'ظƒظ†ط¯ط§',                        name_en: 'Canada',                flag: 'ًں‡¨ًں‡¦', region: 'Global' },
  { id: 'au',     name_ar: 'ط£ط³طھط±ط§ظ„ظٹط§',                    name_en: 'Australia',             flag: 'ًں‡¦ًں‡؛', region: 'Global' },
  { id: 'global', name_ar: 'ط§ظ„ط³ظˆظ‚ ط§ظ„ط¹ط§ظ„ظ…ظٹ ط§ظ„ط´ط§ظ…ظ„',         name_en: 'Worldwide Global Market',flag: 'ًںŒگ', region: 'Global' },
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 2. STRICT OPENAI SYSTEM & USER PROMPT BUILDERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
2. topLeaders must contain 4â€“6 actual or representative business leaders/competitors in this field.
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
    `Language for ALL generated text fields: ${lang === 'en' ? 'English' : 'Arabic (ط§ظ„ط¹ط±ط¨ظٹط©)'}`,
    '',
    'Generate the complete NicheSelectionApiResponse JSON object for this micro-niche card now.',
  ].join('\n');
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3. REACTIVE PIPELINE HOOK â€” useNicheAnalysis
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useNicheAnalysis({ selectedNiche, subNiche, targetCountry, isGlobalBenchmark, lang, uid }) {
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
      if (analysisMode === 'fast') {
        // Fast Radar Mode -> Load directly from Firebase / Firestore local DB
        let dbResult = null;
        try {
          dbResult = await getNicheAnalysis(activeSubNiche || selectedNiche.id);
        } catch (e) {
          console.log('[useNicheAnalysis] Firebase fetch:', e);
        }

        const fastData = {
          cagr: selectedNiche.cagr || '+24.5% CAGR',
          saturation: selectedNiche.saturation || 'blue',
          saturationText: lang === 'en' ? 'Blue Ocean Opportunity' : 'ظپط±طµط© ظ…ط­ظٹط· ط£ط²ط±ظ‚ ظ…ظ†ط®ظپط¶ط© ط§ظ„طھظ†ط§ظپط³ظٹط©',
          roi: selectedNiche.roi || '350% - 500%',
          opportunities: dbResult?.opportunities || {
            strengths: [
              lang === 'en' ? 'High market demand & scalability' : 'ط·ظ„ط¨ ط³ظˆظ‚ظٹ ظ…ط±طھظپط¹ ظˆظ‚ط§ط¨ظ„ظٹط© طھظˆط³ظ‘ط¹ ظ…ظ…طھط§ط²ط©',
              lang === 'en' ? 'Low initial capital requirements' : 'ظ…طھط·ظ„ط¨ط§طھ ط±ط£ط³ ظ…ط§ظ„ ط£ظˆظ„ظٹ ظ…ظ†ط®ظپط¶ط©',
              lang === 'en' ? 'High client retainer potential' : 'ظپط±طµط© ط¹ظ‚ط¯ ط§ط´طھط±ط§ظƒط§طھ ط´ظ‡ط±ظٹط© ظ…طھظƒط±ط±ط© High-Retainer'
            ],
            gaps: [
              lang === 'en' ? 'Shortage of specialized service providers' : 'ظ†ظ‚طµ ط§ظ„ط´ط±ظƒط§طھ ظˆط§ظ„ط®ط¨ط±ط§ط، ط§ظ„ظ…طھط®طµطµظٹظ† ط¨ط§ظ„ظ…ظ†ط·ظ‚ط©',
              lang === 'en' ? 'Lack of standardized service packages' : 'ط¹ط¯ظ… ظˆط¶ظˆط­ ظˆطھظˆط­ظٹط¯ ط¹ط±ظˆط¶ ظˆطھط³ط¹ظٹط± ط§ظ„ط®ط¯ظ…ط§طھ'
            ],
            recommendations: [
              lang === 'en' ? 'Focus on high-ticket specialized offers' : 'ط§ظ„طھط±ظƒظٹط² ط¹ظ„ظ‰ طھظ‚ط¯ظٹظ… ط¹ط±ظˆط¶ High-Ticket ظ…طھط®طµطµط©',
              lang === 'en' ? 'Leverage AI for rapid service delivery' : 'ط§ط³طھط؛ظ„ط§ظ„ ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ظ„طھط³ط±ظٹط¹ ظˆطھط³ظ„ظٹظ… ط§ظ„ط®ط¯ظ…ط§طھ'
            ]
          },
          topLeaders: dbResult?.topLeaders || dbResult?.leaders || [
            { name: `${activeSubNiche || 'Niche'} Leader 1`, secret: 'Early market entry & specialized positioning', url: '#' },
            { name: `${activeSubNiche || 'Niche'} Pro 2`, secret: 'Automated client delivery workflows', url: '#' }
          ],
          icp: dbResult?.icp || {
            age: '25 - 45',
            job: activeSubNiche || 'Business Owner',
            pain: lang === 'en' ? 'Need for automated, high-converting workflows' : 'ط§ظ„ط§ط­طھظٹط§ط¬ ظ„ظ†ط¸ط§ظ… ط¹ظ…ظ„ ظ…ط¤طھظ…طھ ظˆط¹ط§ظ„ظٹ ط§ظ„طھط­ظˆظٹظ„'
          }
        };

        if (currentRequestId !== requestIdRef.current) return;
        setData(fastData);
      } else {
        // Live AI Mode -> Call OpenAI chat/completions API
        const systemPrompt = buildSystemPrompt();
        const userPrompt   = buildUserPrompt({
          selectedNiche,
          subNiche: activeSubNiche,
          targetCountry,
          isGlobalBenchmark,
          lang
        });

        const responseRaw = await callOpenAiApi({ uid, systemPrompt, userPrompt, jsonMode: true });

        if (currentRequestId !== requestIdRef.current) return;

        const parsed = JSON.parse(responseRaw);

        if (!parsed.cagr || !parsed.saturation || !parsed.opportunities || !parsed.topLeaders || !parsed.icp) {
          throw new Error('Invalid schema format returned by AI engine.');
        }

        setData(parsed);
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      console.error('[useNicheAnalysis] API Error:', err);
      const isApiKeyErr = err.message && err.message.includes('VITE_OPENAI_API_KEY');
      setError(
        isApiKeyErr
          ? 'Please provide a valid VITE_OPENAI_API_KEY in your .env file to enable Live AI generation.'
          : (err.message || (lang === 'en' ? 'Analysis failed. Please try again.' : 'طھط¹ط°ظ‘ط± ط¥ط¬ط±ط§ط، ط§ظ„طھط­ظ„ظٹظ„. ط§ظ„ط±ط¬ط§ط، ط¥ط¹ط§ط¯ط© ط§ظ„ظ…ط­ط§ظˆظ„ط©.'))
      );
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [selectedNiche, subNiche, targetCountry, isGlobalBenchmark, lang, analysisMode]);

  const reset = useCallback(() => {
    requestIdRef.current++;
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, analysisMode, setAnalysisMode, run, reset };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 4. MICRO-NICHE GENERATION HOOK â€” useLiveMicroIdeas
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useLiveMicroIdeas() {
  const [ideas, setIdeas]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async ({ selectedNiche, targetCountry, lang, uid }) => {
    if (!selectedNiche) return;
    setLoading(true);
    setError(null);

    const countryObj = COUNTRY_OPTIONS.find(c => c.id === targetCountry) || COUNTRY_OPTIONS[0];

    try {
      const sysPrompt = `You are a business strategist. Return a JSON object with key "ideas" containing an array of 8 lucrative micro-niche service ideas.`;
      const usrPrompt = `Primary Niche: "${selectedNiche.label_en || selectedNiche.id}". Market: "${countryObj.name_en}". Language: ${lang === 'en' ? 'English' : 'Arabic'}.`;
      const raw    = await callOpenAiApi({ uid, systemPrompt: sysPrompt, userPrompt: usrPrompt, jsonMode: true });
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
          : (err.message || (lang === 'en' ? 'Failed to fetch AI micro-niches.' : 'طھط¹ط°ظ‘ط± طھظˆظ„ظٹط¯ ط§ظ„ط£ظپظƒط§ط±.'))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setIdeas([]); setError(null); }, []);

  return { ideas, loading, error, fetch, reset };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 5. DROPDOWN COMPONENT (With High Z-Index to Prevent Overlapping)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TargetMarketDropdown({ value, onChange, options, lang, isLoading }) {
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
        className={`ns-dropdown-trigger ${isLoading ? 'is-loading' : ''}`}
        style={{
          width: '100%', minHeight: '48px',
          borderRadius: '14px',
          padding: '0 16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', transition: 'all 0.2s ease',
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
                  {lang === 'en' ? 'Updating...' : 'ط¬ط§ط±ظٹ ط§ظ„طھط­ط¯ظٹط«...'}
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
          <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.15)', color: '#818CF8', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
            {options.length} {lang === 'en' ? 'Markets' : 'ط£ط³ظˆط§ظ‚'}
          </span>
          {isLoading ? (
            <Loader2 size={16} color="#6366F1" className="spin" />
          ) : (
            <ChevronDown size={16} color="#94A3B8" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          )}
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
                type="text" placeholder={lang === 'en' ? 'Search countryâ€¦' : 'ط§ط¨ط­ط« ط¹ظ† ط¯ظˆظ„ط©â€¦'}
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
                  {lang === 'en' ? 'No market found' : 'ظ„ظ… ظٹطھظ… ط§ظ„ط¹ط«ظˆط± ط¹ظ„ظ‰ ط³ظˆظ‚'}
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 6. UI FEEDBACK COMPONENTS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <span>{lang === 'en' ? 'Retry AI Analysis' : 'ط¥ط¹ط§ط¯ط© ط§ظ„ظ…ط­ط§ظˆظ„ط©'}</span>
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
          <span>Analysingâ€¦</span>
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 7. TAB CONTENT COMPONENTS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OpportunitiesTab({ data, loading, error, onRetry, lang }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '13px', padding: '24px 0' }}>
        <Loader2 size={18} className="spin" />
        <span>{lang === 'en' ? 'Fetching live micro-niche opportunities via Live AIâ€¦' : 'ط¬ط§ط±ظٹ طھط­ظ„ظٹظ„ ط§ظ„ظپط±طµ ط§ظ„ظ…ط¨ط§ط´ط±ط© ظ…ظ† ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹâ€¦'}</span>
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
            : 'ط§ط®طھط± ط£ظٹ ظƒط§ط±طھ ظ„ظ„طھط®طµطµ ط§ظ„ط¯ظ‚ظٹظ‚ ط£ط¹ظ„ط§ظ‡ ظ„طھظˆظ„ظٹط¯ ط§ظ„ظپط±طµ ط§ظ„ظ…ط¨ط§ط´ط±ط© ظپظˆط±ط§ظ‹.'}
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
            <span>{lang === 'en' ? 'Strengths & Market Drivers' : 'ظ†ظ‚ط§ط· ط§ظ„ظ‚ظˆط© ظˆط§ظ„ظ…ط²ط§ظٹط§ ط§ظ„طھظ†ط§ظپط³ظٹط©'}</span>
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
            <span>{lang === 'en' ? 'Market Gaps & Unserved Needs' : 'ط§ظ„ظپط¬ظˆط§طھ ظˆط§ظ„ظپط±طµ ط؛ظٹط± ط§ظ„ظ…ظڈط³طھط؛ظژظ„ط©'}</span>
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
        <span>{lang === 'en' ? 'Fetching real-time top market leaders via Live AIâ€¦' : 'ط¬ط§ط±ظٹ ط§ظ„ط¨ط­ط« ط¹ظ† ط£ط¨ط±ط² ط§ظ„ظ…ظ†ط§ظپط³ظٹظ† ظˆط§ظ„ط±ظˆط§ط¯â€¦'}</span>
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
            : 'ط§ط®طھط± طھط®طµطµط§ظ‹ ط¯ظ‚ظٹظ‚ط§ظ‹ ظ„ط¹ط±ط¶ ط£ط¨ط±ط² ط§ظ„ط´ط±ظƒط§طھ ظˆط§ظ„ظ…ظ†ط§ظپط³ظٹظ† ظپظٹ ظ‡ط°ط§ ط§ظ„ظ…ط¬ط§ظ„.'}
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
            <th style={{ padding: '10px' }}>{lang === 'en' ? 'Company / Brand' : 'ط§ظ„ط´ط±ظƒط© / ط§ظ„ط¹ظ„ط§ظ…ط© ط§ظ„طھط¬ط§ط±ظٹط©'}</th>
            <th style={{ padding: '10px' }}>{lang === 'en' ? 'Core Differentiator & Strategy' : 'ط§ط³طھط±ط§طھظٹط¬ظٹط© ط§ظ„طھظ…ظٹط²'}</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>{lang === 'en' ? 'Link' : 'ط±ط§ط¨ط·'}</th>
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
                    <span>{lang === 'en' ? 'Visit' : 'ط²ظٹط§ط±ط©'}</span>
                    <ExternalLink size={11} />
                  </a>
                ) : 'â€”'}
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
        <span>{lang === 'en' ? 'Calculating Ideal Customer Persona (ICP)â€¦' : 'ط¬ط§ط±ظٹ طھط­ظ„ظٹظ„ ط¨ط±ظˆظپط§ظٹظ„ ط§ظ„ط¹ظ…ظٹظ„ ط§ظ„ظ…ط«ط§ظ„ظٹ (ICP)â€¦'}</span>
      </div>
    );
  }
  if (!icp) return null;
  const painPoints = Array.isArray(icp.painPoints) ? icp.painPoints : [];

  return (
    <div className="ns-icp-card" style={{ borderRadius: '14px', padding: '18px', marginTop: '18px' }}>
      <div style={{ fontSize: '13px', fontWeight: '800', color: themeColor, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Users size={16} />
        <span>{lang === 'en' ? 'Ideal Customer Persona (ICP)' : 'ظ…ظ„ظپ ط§ظ„ط¹ظ…ظٹظ„ ط§ظ„ظ…ط«ط§ظ„ظٹ (ICP)'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <div className="ns-subcard" style={{ padding: '10px 12px', borderRadius: '8px' }}>
          <span className="ns-subtext" style={{ fontSize: '10px', display: 'block', fontWeight: '700' }}>
            {lang === 'en' ? 'Target Group:' : 'ط§ظ„ظپط¦ط© ط§ظ„ظ…ط³طھظ‡ط¯ظپط©:'}
          </span>
          <span className="ns-heading-title" style={{ fontSize: '12px', fontWeight: '800' }}>{icp.targetGroup || 'â€”'}</span>
        </div>
        <div className="ns-subcard" style={{ padding: '10px 12px', borderRadius: '8px' }}>
          <span className="ns-subtext" style={{ fontSize: '10px', display: 'block', fontWeight: '700' }}>
            {lang === 'en' ? 'Demographic Age Range:' : 'ط§ظ„ظپط¦ط© ط§ظ„ط¹ظ…ط±ظٹط©:'}
          </span>
          <span className="ns-heading-title" style={{ fontSize: '12px', fontWeight: '800' }}>{icp.ageRange || 'â€”'}</span>
        </div>
      </div>

      {painPoints.length > 0 && (
        <>
          <div className="ns-subtext" style={{ fontSize: '11px', fontWeight: '700', marginBottom: '8px' }}>
            {lang === 'en' ? 'Core Client Pain Points:' : 'ظ†ظ‚ط§ط· ط§ظ„ط£ظ„ظ… ط§ظ„ط±ط¦ظٹط³ظٹط© ظ„ظ„ط¹ظ…ظٹظ„:'}
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
        <span>{lang === 'en' ? 'Calculating Level 3 Global Benchmarkâ€¦' : 'ط¬ط§ط±ظٹ طھط­ظ„ظٹظ„ ط§ظ„ظ…ظ‚ط§ط±ظ†ط© ط§ظ„ط¹ط§ظ„ظ…ظٹط©â€¦'}</span>
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
            : 'ظ…ظ‚ط§ط±ظ†ط© ط¹ط§ظ„ظ…ظٹط©: ط³ظˆظ‚ظƒ ط§ظ„ظ…ط­ظ„ظٹ ظ…ظ‚ط§ط¨ظ„ ط£ظپط¶ظ„ ط³ظˆظ‚ ط¨ط¯ظٹظ„'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
        <div className="ns-subcard" style={{ padding: '14px', borderRadius: '12px' }}>
          <div className="ns-subtext" style={{ fontSize: '11px', fontWeight: '700' }}>
            {lang === 'en' ? 'Primary Target Country:' : 'ط³ظˆظ‚ظƒ ط§ظ„ظ…ط³طھظ‡ط¯ظپ ط§ظ„ط£ط³ط§ط³ظٹ:'}
          </div>
          <div className="ns-heading-title" style={{ fontSize: '14px', fontWeight: '900', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{activeCountryObj.flag}</span>
            <span>{lang === 'en' ? activeCountryObj.name_en : activeCountryObj.name_ar}</span>
          </div>
        </div>

        <div className="ns-opp-card-green" style={{ padding: '14px', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>
            {lang === 'en' ? 'Recommended Benchmark Market:' : 'ط§ظ„ط³ظˆظ‚ ط§ظ„ظ…ط±ط¬ط¹ظٹ ط§ظ„ظ…ظˆطµظ‰ ط¨ظ‡:'}
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
          {lang === 'en' ? 'Select a Business Category Above' : 'ط§ط®طھط± طھط®طµطµ ط§ظ„ط¨ط²ظ†ط³ ظ…ظ† ط§ظ„ط£ط¹ظ„ظ‰ ظ„ظ„ط¨ط¯ط،'}
        </h3>
        <p className="ns-subtext" style={{ fontSize: '13px', maxWidth: '520px', margin: '8px auto 0', lineHeight: '1.6' }}>
          {lang === 'en'
            ? 'Choose any business category (e.g., Real Estate & Finance, AI & Automation, E-Commerce) to activate real-time market intelligence, CAGR metrics, and micro-niche opportunities.'
            : 'ط§ط®طھط± ط£ظٹ ظ…ط¬ط§ظ„ ظˆطھط®طµطµ ظ…ظ† ط§ظ„ط¨ط·ط§ظ‚ط§طھ ط£ط¹ظ„ط§ظ‡ (ظ…ط«ظ„ ط§ظ„ط¹ظ‚ط§ط±ط§طھ ظˆط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…ط§ظ„ظٹط©طŒ ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹطŒ ط§ظ„طھط¬ط§ط±ط© ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط©) ظ„طھظپط¹ظٹظ„ ط§ظ„طھط­ظ„ظٹظ„ ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹ ط§ظ„ظ…ط¨ط§ط´ط± ظˆط§ط³طھظƒط´ط§ظپ ط§ظ„ظپط±طµ ط§ظ„ظپط±ظٹط¯ط©.'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontSize: '12px', fontWeight: '800', background: 'rgba(99, 102, 241, 0.12)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
        <Sparkles size={16} color="#818CF8" />
        <span>{lang === 'en' ? 'Click any category card above to begin' : 'ط§ظ†ظ‚ط± ط¹ظ„ظ‰ ط£ظٹ طھط®طµطµ ظپظٹ ط§ظ„ط£ط¹ظ„ظ‰ ظ„ظ„ط¨ط¯ط، ط¨ط§ظ„طھط­ظ„ظٹظ„'}</span>
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
              {lang === 'en' ? `Analyzing Category: ${label}` : `ط¬ط§ط±ظٹ طھط­ظ„ظٹظ„ ظ‚ط·ط§ط¹: ${label}`}
            </span>
          </div>

          <h3 className="ns-heading-title" style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>
            {lang === 'en'
              ? `Generating Deep Market Intelligence for ${label}...`
              : `ط¬ط§ط±ظٹ طھط¬ظ…ظٹط¹ ط¯ط±ط§ط³ط© ط§ظ„ط¬ط¯ظˆظ‰ ظˆط§ظ„ظپط±طµ ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹط© ظ„ظ€ ${label}...`}
          </h3>
          <p className="ns-subtext" style={{ fontSize: '12px', maxWidth: '480px', margin: '8px auto 0', lineHeight: '1.6' }}>
            {lang === 'en'
              ? 'Fetching CAGR benchmarks, saturation levels, top market leaders, and high-demand micro-niche opportunities.'
              : 'ط¬ط§ط±ظٹ ط§ط³طھط¯ط¹ط§ط، ظ…ط¹ط¯ظ„ط§طھ ط§ظ„ظ†ظ…ظˆطŒ ط¯ط±ط¬ط© طھط´ط¨ط¹ ط§ظ„ط³ظˆظ‚طŒ ط£ط¨ط±ط² ط§ظ„ظ…ظ†ط§ظپط³ظٹظ† ظˆط£ظپظƒط§ط± ط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ط¯ظ‚ظٹظ‚ط© ط¹ط§ظ„ظٹط© ط§ظ„ط±ط¨ط­ظٹط©.'}
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 8. MAIN COMPONENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function NicheSelection({ stepNumber }) {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';

  const [niches, setNiches]                 = useState([]);
  const [nichesLoading, setNichesLoading]   = useState(true);
  const [selectedNiche, setSelectedNiche]   = useState(null);

  const [targetCountry, setTargetCountry]         = useState(state.targetCountry || 'sa');
  const [isGlobalBenchmark, setIsGlobalBenchmark] = useState(false);
  const [deepDiveTab, setDeepDiveTab]             = useState('opportunities');
  const [microNicheMode, setMicroNicheMode]       = useState('fast'); // 'fast' | 'live' | 'custom'
  const [microSearchQuery, setMicroSearchQuery]   = useState('');
  const [microFilterBadge, setMicroFilterBadge]   = useState('all');
  const [customNicheInput, setCustomNicheInput]   = useState('');

  const deepDiveRef = useRef(null);

  // Multi-stage Analysis Pipeline
  const analysis = useNicheAnalysis({
    selectedNiche,
    subNiche: state.subNiche,
    targetCountry,
    isGlobalBenchmark,
    lang,
    uid: userData?.uid || state?.user?.uid
  });

  const microIdeas = useLiveMicroIdeas();

  const activeCountryObj = COUNTRY_OPTIONS.find(c => c.id === targetCountry) || COUNTRY_OPTIONS[0];
  const themeColor       = NICHE_THEMES[selectedNiche?.id]?.color || '#6366F1';
  const getLabel         = n => lang === 'en' ? n.label_en : n.label_ar;

  // Load Niches
  useEffect(() => {
    // Clear any previously saved niche so no category appears pre-selected
    dispatch({ type: 'SET_FIELD', field: 'niche', value: '' });
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: '' });

    (async () => {
      setNichesLoading(true);
      try {
        let data = await getNiches();
        if (!data || data.length === 0) { await seedNiches(); data = await getNiches(); }
        setNiches(data);
      } catch (e) { console.error('Niche load error:', e); }
      finally { setNichesLoading(false); }
    })();
  }, []);

  // Sync with AppContext
  useEffect(() => {
    dispatch({ type: 'SET_FIELD', field: 'targetCountry', value: targetCountry });
    dispatch({ type: 'SET_FIELD', field: 'isGlobalBenchmark', value: isGlobalBenchmark });
  }, [targetCountry, isGlobalBenchmark]);

  const [isChangingCategory, setIsChangingCategory] = useState(false);

  // Automatic fetch when selecting a main niche
  const handleNicheSelect = useCallback(n => {
    if (selectedNiche?.id === n.id) return;
    setIsChangingCategory(true);
    setSelectedNiche(n);
    dispatch({ type: 'SET_FIELD', field: 'niche',    value: n.id });
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: '' });
    microIdeas.reset();
    analysis.reset();
    setTimeout(() => {
      setIsChangingCategory(false);
    }, 1600);
  }, [selectedNiche, analysis, microIdeas, dispatch]);

  const isCategoryLoading = isChangingCategory || (selectedNiche && analysis.loading);

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

  const [isChangingMarket, setIsChangingMarket] = useState(false);

  const handleCountryChange = useCallback(val => {
    if (val === targetCountry) return;
    setIsChangingMarket(true);
    setTargetCountry(val);
    setTimeout(() => {
      setIsChangingMarket(false);
    }, 1600);
  }, [targetCountry]);

  const isMarketLoading = isChangingMarket || analysis.loading || microIdeas.loading;

  // Micro-niches list based on Mode (Fast Mode vs Live AI)
  const presetIdeas = selectedNiche
    ? (lang === 'en' ? selectedNiche.ideas_en : selectedNiche.ideas_ar) || []
    : [];

  const rawIdeas = microNicheMode === 'live'
    ? microIdeas.ideas
    : (microNicheMode === 'custom' ? [] : presetIdeas);

  const BADGE_CLASSES = ['trend', 'profit', 'stable', 'freelance'];

  const filteredIdeas = rawIdeas
    .map((ideaText, i) => ({ ideaText, badgeClass: BADGE_CLASSES[i % BADGE_CLASSES.length] }))
    .filter(({ ideaText, badgeClass }) => {
      const matchesSearch = !microSearchQuery || ideaText.toLowerCase().includes(microSearchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (microFilterBadge === 'all') return true;
      return badgeClass === microFilterBadge;
    })
    .map(item => item.ideaText);

  return (
    <ToolDashboardLayout
      id="niche-selection"
      title={lang === 'en' ? 'Strategic Niche Selection' : 'ط§ط®طھظٹط§ط± ط§ظ„طھط®طµطµ ط§ظ„ط§ط³طھط±ط§طھظٹط¬ظٹ'}
      subtitle={lang === 'en'
        ? "Don't just be 'another freelancer'. Choose your niche carefully with live AI market intelligence."
        : "ظ„ط§ طھظƒظ† ظ…ط¬ط±ط¯ 'ظ…ط³طھظ‚ظ„ ط¢ط®ط±'. ط§ط®طھط± طھط®طµطµظƒ ط¨ط¯ظ‚ط© ط¨ط¯ط¹ظ… ظ…ط¨ط§ط´ط± ظ…ظ† طھط­ظ„ظٹظ„ ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ."}
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
                  <span>{lang === 'en' ? 'Level 1: Select Target Market Country' : 'ط§ظ„ظ…ط³طھظˆظ‰ 1: ط§ط®طھط± ط§ظ„ط¯ظˆظ„ط© ظˆط§ظ„ط³ظˆظ‚ ط§ظ„ظ…ط³طھظ‡ط¯ظپ'}</span>
                </label>
                <TargetMarketDropdown
                  value={targetCountry}
                  onChange={handleCountryChange}
                  options={COUNTRY_OPTIONS}
                  lang={lang}
                  isLoading={isMarketLoading}
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
                    {lang === 'en' ? 'Level 3 Global Benchmark' : 'ظ…ظ‚ط§ط±ظ†ط© ط§ظ„ط³ظˆظ‚ ط§ظ„ط¹ط§ظ„ظ…ظٹ (ط§ظ„ظ…ط³طھظˆظ‰ 3)'}
                  </div>
                  <div className="ns-subtext" style={{ fontSize: '10px' }}>
                    {lang === 'en' ? 'Compare local vs. global alternative' : 'ظ…ظ‚ط§ط±ظ†ط© ط£ط¯ط§ط، ط§ظ„ط³ظˆظ‚ ط§ظ„ظ…ط­ظ„ظٹ ط¨ط§ظ„ط³ظˆظ‚ ط§ظ„ط¹ط§ظ„ظ…ظٹ'}
                  </div>
                </div>
                <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: isGlobalBenchmark ? '#10B981' : '#334155', position: 'relative', marginLeft: '6px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: isGlobalBenchmark ? '21px' : '3px', transition: 'all 0.2s ease' }} />
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
                        <span>{activeCountryObj?.flag || 'ًں‡¸ًں‡¦'}</span>
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
                              ? `Recalibrating Market Intelligence for ${activeCountryObj?.name_en || 'Target Market'}...`
                              : `ط¬ط§ط±ظٹ ط¥ط¹ط§ط¯ط© ظ…ط¹ط§ظٹط±ط© ظˆط§ط³طھط¯ط¹ط§ط، ط¨ظٹط§ظ†ط§طھ ط§ظ„ط³ظˆظ‚ ظ„ظ€ ${activeCountryObj?.name_ar || 'ط§ظ„ط³ظˆظ‚ ط§ظ„ظ…ط³طھظ‡ط¯ظپ'}...`}
                          </span>
                        </div>
                        <div className="ns-market-loading-subtext" style={{ marginTop: '4px' }}>
                          {lang === 'en'
                            ? 'Updating local CAGR growth rates, market saturation radar, and purchasing power benchmarks.'
                            : 'ط¬ط§ط±ظٹ طھط­ط¯ظٹط« ظ…ط¹ط¯ظ„ط§طھ ط§ظ„ظ†ظ…ظˆ ط§ظ„ظ…ط­ظ„ظٹ (CAGR)طŒ ظ…ط¤ط´ط± ط§ظ„طھط´ط¨ط¹طŒ ظˆط§ظ„ظ‚ظˆط© ط§ظ„ط´ط±ط§ط¦ظٹط© ط§ظ„ظ…ظ†ط§ظپط³ط©.'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.12)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                      <Compass size={14} color="#6366F1" className="spin" />
                      <span style={{ fontSize: '11px', fontWeight: '800', color: "#6366F1" }}>
                        {lang === 'en' ? 'Market Switch Active' : 'طھط­ط¯ظٹط« ط§ظ„ط³ظˆظ‚ ظ…ظپط¹ظ‘ظ„'}
                      </span>
                    </div>
                  </div>

                  <div className="ns-progress-track">
                    <div className="ns-progress-bar-fill" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
              const isSelected = selectedNiche?.id === n.id;
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

          {/* LEVEL 1: MACRO METRICS & MICRO-NICHES DISPLAY */}
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
                    {lang === 'en' ? `Level 1 Macro Metrics: ${getLabel(selectedNiche)}` : `ط§ظ„ظ…ط¤ط´ط±ط§طھ ط§ظ„ظƒظ„ظٹط©: ${getLabel(selectedNiche)}`}
                  </h4>
                  <div className="ns-subtext" style={{ fontSize: '11px' }}>
                    {lang === 'en' ? `Market intelligence for ${activeCountryObj.name_en}` : `طھط­ظ„ظٹظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط³ظˆظ‚ ظ„ظ€ ${activeCountryObj.name_ar}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <MetricCard
                  icon={<TrendingUp size={14} color="#10B981" />}
                  label={lang === 'en' ? 'Market Growth (CAGR)' : 'ظ†ظ…ظˆ ط§ظ„ط³ظˆظ‚ (CAGR)'}
                  value={analysis.data?.cagr || 'â€”'}
                  accent="#10B981"
                  loading={analysis.loading}
                />
                <MetricCard
                  icon={<Compass size={14} color="#3B82F6" />}
                  label={lang === 'en' ? 'Market Saturation' : 'ط­ط§ظ„ط© طھط´ط¨ط¹ ط§ظ„ط³ظˆظ‚'}
                  value={analysis.data?.saturationText || 'â€”'}
                  badgeType={analysis.data?.saturation}
                  accent="#3B82F6"
                  loading={analysis.loading}
                />
                <MetricCard
                  icon={<Coins size={14} color="#F59E0B" />}
                  label={lang === 'en' ? 'Expected ROI Margin' : 'ط§ظ„ط¹ط§ط¦ط¯ ط§ظ„ظ…طھظˆظ‚ط¹ ROI'}
                  value={analysis.data?.roi || 'â€”'}
                  accent="#F59E0B"
                  loading={analysis.loading}
                />
              </div>

              {/* ICP Component */}
              <IcpCard icp={analysis.data?.icp} loading={analysis.loading} lang={lang} themeColor={themeColor} />
            </div>

          {/* LEVEL 2: MICRO-NICHE SELECTION & DEEP DIVE */}
          <div className="td-info-panel ns-panel-card" style={{ borderColor: `${themeColor}40`, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                <h3 className="ns-heading-title" style={{ fontSize: '15px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color={themeColor} />
                  <span>{lang === 'en' ? 'Select Micro-Niche Idea:' : 'ط§ط®طھط± ط§ظ„طھط®طµطµ ط§ظ„ط¯ظ‚ظٹظ‚ (Micro-Niche):'}</span>
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Segmented Mode Switch: Fast Mode (Preset) vs Live AI (Generate) vs Custom Idea */}
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
                      <span>{lang === 'en' ? 'Fast Mode (Instant Radar)' : 'ط§ظ„ظ†ظ…ط· ط§ظ„ط³ط±ظٹط¹ (ظ…ط³ط¨ظ‚)'}</span>
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
                      <span>{lang === 'en' ? 'Live AI (Generate)' : 'ط°ظƒط§ط، ط§طµط·ظ†ط§ط¹ظٹ ظ…ط¨ط§ط´ط± (طھظˆظ„ظٹط¯)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMicroNicheMode('custom')}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        background: microNicheMode === 'custom' ? themeColor : 'transparent',
                        color: microNicheMode === 'custom' ? '#fff' : '#94A3B8',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Edit3 size={12} />
                      <span>{lang === 'en' ? 'Custom Idea' : 'ظپظƒط±ط© ظ…ط®طµطµط©'}</span>
                    </button>
                  </div>

                  {/* Inline Search Filter Control */}
                  <div style={{ position: 'relative', width: '180px' }}>
                    <Search size={13} color="#64748B" style={{ position: 'absolute', top: '9px', left: '10px' }} />
                    <input
                      type="text"
                      value={microSearchQuery}
                      onChange={e => setMicroSearchQuery(e.target.value)}
                      placeholder={lang === 'en' ? 'Filter micro-nichesâ€¦' : 'طھطµظپظٹط© ط§ظ„طھط®طµطµط§طھâ€¦'}
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
                        {lang === 'en' ? 'Live AI Micro-Niche Generator Active' : 'ظ…ظˆظ„ظ‘ط¯ ط§ظ„طھط®طµطµط§طھ ط§ظ„ظ…ط¨ط§ط´ط± ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ظ…ظپط¹ظ‘ظ„'}
                      </div>
                      <div className="ns-subtext" style={{ fontSize: '10px' }}>
                        {microIdeas.loading
                          ? (lang === 'en' ? 'Generating custom real-time micro-niches from Live AIâ€¦' : 'ط¬ط§ط±ظٹ ط§ط³طھط¯ط¹ط§ط، ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ظ„طھظˆظ„ظٹط¯ ط£ظپظƒط§ط± ط­ظٹط©â€¦')
                          : (lang === 'en' ? 'Displaying custom real-time micro-niches for target market' : 'ط¹ط±ط¶ ط£ظپظƒط§ط± طھط®طµطµط§طھ ظ…ط®طµطµط© ظˆظ…ظˆظ„ظ‘ط¯ط© ظ„ط­ط¸ظٹط§ظ‹ ط­ط³ط¨ ط§ظ„ط³ظˆظ‚ ط§ظ„ظ…ط³طھظ‡ط¯ظپ')}
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
                    <span>{lang === 'en' ? 'Regenerate via Live AI' : 'ط¥ط¹ط§ط¯ط© ط§ظ„طھظˆظ„ظٹط¯ ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ'}</span>
                  </button>
                </div>
              )}

              {/* Professional Filter Bar */}
              {microNicheMode !== 'custom' && !microIdeas.loading && (
                <div style={{ marginBottom: '14px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px 14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    {/* Search Input Filter */}
                    <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
                      <Search size={13} color={themeColor} style={{ position: 'absolute', top: '9px', [lang === 'ar' ? 'right' : 'left']: '10px' }} />
                      <input
                        type="text"
                        value={microSearchQuery}
                        onChange={(e) => setMicroSearchQuery(e.target.value)}
                        placeholder={lang === 'en' ? 'Search or filter micro-niches...' : 'طھطµظپظٹط© ظˆط¨ط­ط« ظپظٹ ط§ظ„طھط®طµطµط§طھ...'}
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: `1px solid ${themeColor}40`,
                          borderRadius: '8px',
                          padding: lang === 'ar' ? '6px 28px 6px 28px' : '6px 28px 6px 28px',
                          color: '#fff',
                          fontSize: '11px',
                          outline: 'none',
                        }}
                      />
                      {microSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMicroSearchQuery('')}
                          style={{ position: 'absolute', top: '7px', [lang === 'ar' ? 'left' : 'right']: '8px', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Filter Tag Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: lang === 'en' ? 'All' : 'ط§ظ„ظƒظ„', IconComp: Filter },
                        { id: 'trend', label: lang === 'en' ? 'Fast Trend' : 'طھط±ظٹظ†ط¯ ط³ط±ظٹط¹', IconComp: Flame },
                        { id: 'profit', label: lang === 'en' ? 'High Profit' : 'ط±ط¨ط­ظٹط© ط¹ط§ظ„ظٹط©', IconComp: Coins },
                        { id: 'stable', label: lang === 'en' ? 'Stable Demand' : 'ط·ظ„ط¨ ظ…ط³طھظ‚ط±', IconComp: TrendingUp },
                        { id: 'freelance', label: lang === 'en' ? 'Freelance Ready' : 'ظ…ظ†ط§ط³ط¨ ظ„ظ„ط¹ظ…ظ„ ط§ظ„ط­ط±', IconComp: Briefcase },
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
                              border: microFilterBadge === tag.id ? `1px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                              background: microFilterBadge === tag.id ? `${themeColor}35` : 'transparent',
                              color: microFilterBadge === tag.id ? '#fff' : '#94A3B8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Icon size={12} color={microFilterBadge === tag.id ? '#fff' : '#94A3B8'} />
                            <span>{tag.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Option 3 Custom Idea View */}
              {microNicheMode === 'custom' ? (
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '16px', borderRadius: '14px', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#818CF8', marginBottom: '10px' }}>
                    <Lightbulb size={16} color="#6366F1" />
                    <span>{lang === 'en' ? 'Have a custom idea? Type your micro-niche here:' : 'ظ„ط¯ظٹظƒ ظپظƒط±ط© ظ…ط®طھظ„ظپط©طں ط§ظƒطھط¨ طھط®طµطµظƒ ط§ظ„ط¯ظ‚ظٹظ‚ ظٹط¯ظˆظٹط§ظ‹ ظ‡ظ†ط§:'}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="field-input"
                      style={{ flex: '1 1 240px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}
                      value={customNicheInput}
                      onChange={(e) => setCustomNicheInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customNicheInput.trim()) {
                          handleSubNicheSelect(customNicheInput.trim());
                        }
                      }}
                      placeholder={lang === 'en' ? 'e.g., Marketing for local real estate brokers' : 'ظ…ط«ط§ظ„: طھط³ظˆظٹظ‚ ظˆطھطµظˆظٹط± ظپظ„ظ„ ط¹ظ‚ط§ط±ظٹط© ظ…ط³طھظ‚ظ„ط©'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customNicheInput.trim()) {
                          handleSubNicheSelect(customNicheInput.trim());
                        }
                      }}
                      className="btn btn-primary"
                      style={{ padding: '10px 20px', borderRadius: '10px', background: themeColor, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                    >
                      <Sparkles size={14} />
                      <span>{lang === 'en' ? 'Analyze Custom Idea' : 'طھط­ظ„ظٹظ„ ط§ظ„ظپظƒط±ط© ط§ظ„ظ…ط®طµطµط©'}</span>
                      {lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                    </button>
                  </div>
                </div>
              ) : microIdeas.loading && microNicheMode === 'live' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818CF8', fontSize: '12px', marginBottom: '18px' }}>
                  <Loader2 size={16} className="spin" />
                  <span>{lang === 'en' ? 'Live AI is generating 8 micro-nichesâ€¦' : 'ط¬ط§ط±ظٹ طھظˆظ„ظٹط¯ 8 طھط®طµطµط§طھ ط¯ظ‚ظٹظ‚ط© ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹâ€¦'}</span>
                </div>
              ) : (microNicheMode === 'live' && microIdeas.ideas.length === 0) ? (
                <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '20px' }}>
                  <div className="ns-subtext" style={{ fontSize: '13px', marginBottom: '12px' }}>
                    {lang === 'en' ? 'No live micro-niche ideas generated yet.' : 'ظ„ظ… ظٹطھظ… طھظˆظ„ظٹط¯ ط£ظپظƒط§ط± ط­ظٹط© ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ط¨ط¹ط¯.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => microIdeas.fetch({ selectedNiche, targetCountry, lang })}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: themeColor }}
                  >
                    <Bot size={14} style={{ marginRight: '6px' }} />
                    <span>{lang === 'en' ? 'Generate Live Micro-Niches via OpenAI' : 'طھظˆظ„ظٹط¯ طھط®طµطµط§طھ ط¯ظ‚ظٹظ‚ط© ط¨ط§ظ„ط°ظƒط§ط، ط§ظ„ط§طµط·ظ†ط§ط¹ظٹ ط§ظ„ظ…ط¨ط§ط´ط±'}</span>
                  </button>
                </div>
              ) : filteredIdeas.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px dashed rgba(99, 102, 241, 0.3)', marginBottom: '20px' }}>
                  <Filter size={24} color={themeColor} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                    {lang === 'en' ? 'No micro-niches match your filter.' : 'ظ„ط§ طھظˆط¬ط¯ طھط®طµطµط§طھ ط¯ظ‚ظٹظ‚ط© طھط·ط§ط¨ظ‚ ط§ظ„ظپظ„طھط± ط§ظ„ظ…ط­ط¯ط¯.'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px' }}>
                    {lang === 'en' ? 'Try adjusting your search term or filter category tag.' : 'ط¬ط±ط¨ طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ط¨ط­ط« ط£ظˆ ط¥ط¹ط§ط¯ط© ط¶ط¨ط· طھطµظپظٹط© ط§ظ„ط´ط§ط±ط§طھ.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMicroSearchQuery(''); setMicroFilterBadge('all'); }}
                    style={{ padding: '6px 14px', borderRadius: '8px', background: `${themeColor}25`, border: `1px solid ${themeColor}60`, color: '#fff', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    {lang === 'en' ? 'Reset Filter' : 'ط¥ط¹ط§ط¯ط© ط¶ط¨ط· ط§ظ„ظپظ„طھط±'}
                  </button>
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
                  {lang === 'en' ? 'Selected Micro-Niche Card Title:' : 'ط§ظ„طھط®طµطµ ط§ظ„ط¯ظ‚ظٹظ‚ ط§ظ„ظ…ط®طھط§ط±:'}
                </label>
                <input
                  type="text"
                  onChange={e => handleSubNicheSelect(e.target.value)}
                  value={state.subNiche || ''}
                  placeholder={lang === 'en' ? 'Type or select a micro-niche card aboveâ€¦' : 'ط§ط®طھط± ظƒط§ط±طھ ط§ظ„طھط®طµطµ ط§ظ„ط¯ظ‚ظٹظ‚ ط£ظˆ ط§ظƒطھط¨ طھط®طµطµظƒâ€¦'}
                  className="td-input"
                  style={{ borderColor: state.subNiche ? themeColor : 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 'bold' }}
                />
              </div>

              {/* DEEP DIVE ANALYSIS TABS: Tab 1 (Market Opportunities) & Tab 2 (Top 10 Leaders) */}
              <div ref={deepDiveRef} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'opportunities', label_en: 'Tab 1: Market Opportunities', label_ar: 'ط§ظ„طھط¨ظˆظٹط¨ 1: ظپط±طµ ط§ظ„ط³ظˆظ‚ ظˆط§ظ„طھط­ظ„ظٹظ„ (Market Opportunities)', icon: <Sparkles size={13} /> },
                      { key: 'leaders',        label_en: 'Tab 2: Top 10 Leaders',        label_ar: 'ط§ظ„طھط¨ظˆظٹط¨ 2: ط£ط¨ط±ط² ط§ظ„ط±ظˆط§ط¯ (Top 10 Leaders)',          icon: <Award size={13} /> },
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

                  <button
                    type="button"
                    onClick={() => analysis.run(state.subNiche)}
                    disabled={analysis.loading || !state.subNiche}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '800',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#818CF8',
                      cursor: analysis.loading || !state.subNiche ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <RefreshCw size={13} className={analysis.loading ? 'spin' : ''} />
                    <span>{lang === 'en' ? 'Regenerate Analysis' : 'ط¥ط¹ط§ط¯ط© ط§ظ„طھظˆظ„ظٹط¯ ظˆط§ظ„طھط­ظ„ظٹظ„'}</span>
                  </button>
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
          </motion.div>
        </AnimatePresence>
      )}
    </>
  )}
    </ToolDashboardLayout>
  );
}


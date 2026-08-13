import React, { useState, useEffect, useRef } from "react";
import useToolCache from "../../../hooks/useToolCache";
import { createPortal } from "react-dom";
import { useApp } from "../../../context/AppContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import ToolDashboardLayout from "./ToolDashboardLayout";
import { getLandingMatrixSection } from "../../../services/contentDbService";
import AnalysisModeSelector from "../../../components/common/AnalysisModeSelector";
import { dispatchLiveAiAnalysis } from "../../../services/liveAiService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
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
  Download,
  ShoppingBag,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Star,
  Flame,
  ArrowRight,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Globe,
  Monitor,
  Rocket,
} from "lucide-react";
import "./LandingPageContent.css";

// Glassmorphic Animated Custom Dropdown Component
function CustomDropdown({
  value,
  onChange,
  options,
  label,
  icon: Icon,
  placeholder,
  lang,
}) {
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
    <div className="lpc-dropdown-container" ref={dropdownRef}>
      {label && (
        <label className="lpc-label">
          {Icon && <Icon size={13} color="#818CF8" strokeWidth={1.5} />}
          <span>{label}</span>
        </label>
      )}

      <div
        className={`lpc-dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} color="#94A3B8" />
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
            {options.map((opt) => (
              <div
                key={String(opt.value)}
                className={`lpc-dropdown-option ${String(opt.value) === String(value) ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && (
                  <Check size={13} color="#6366F1" />
                )}
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
  const { userData } = useAuth();
  const toastContext = useToast();
  const toast =
    typeof toastContext === "function"
      ? toastContext
      : toastContext?.toast || ((msg) => console.log(msg));

  const lang = state.language || "ar";
  const isRtl = lang?.startsWith('ar');

  const [analysisMode, setAnalysisMode] = useState("fast"); // 'fast' | 'live'
  const [activeSectionIndex, setActiveSectionIndex] = useState(0); // 0: config, 1: hero, 2: problem, 3: offer, 4: proof, 5: cta
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [isInputDrawerOpen, setIsInputDrawerOpen] = useState(false);
  const [scanningStep, setScanningStep] = useState(0);

  // Base Inputs
  const [productName, setProductName] = useState(state.brandName || "");
  const [audience, setAudience] = useState(state.niche || "");
  const [validationError, setValidationError] = useState("");

  // Matrix Dropdowns
  const [objective, setObjective] = useState("direct_sales");
  const [awareness, setAwareness] = useState("problem_aware");
  const [pricePoint, setPricePoint] = useState("low_ticket");
  const [emotion, setEmotion] = useState("urgency");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Active Idea Tab for each section
  const [activeIdeaIndex, setActiveIdeaIndex] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  // Cycle real-time status badges when generating
  useEffect(() => {
    let interval;
    if (isGenerating) {
      setScanningStep(0);
      interval = setInterval(() => {
        setScanningStep((prev) => (prev + 1) % 3);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Dropdown Options Definitions
  const objectiveOptions = [
    {
      value: "direct_sales",
      label:
        lang === "en"
          ? "Direct Sales (Sell Product)"
          : "بيع مباشر (منتج / دورة)",
    },
    {
      value: "lead_gen",
      label:
        lang === "en"
          ? "Lead Generation (Collect Data)"
          : "جمع بيانات العملاء (Lead Gen)",
    },
    {
      value: "booking",
      label:
        lang === "en"
          ? "Booking / Consultation Call"
          : "حجز استشارة / مكالمة مبيعات",
    },
  ];

  const awarenessOptions = [
    {
      value: "unaware",
      label:
        lang === "en"
          ? "Unaware (Needs Problem Education)"
          : "غير واعي (يحتاج توعية بالمشكلة)",
    },
    {
      value: "problem_aware",
      label:
        lang === "en" ? "Problem Aware (Knows Pain)" : "واعي بالمشكلة وألمها",
    },
    {
      value: "solution_aware",
      label:
        lang === "en"
          ? "Solution Aware (Comparing Options)"
          : "واعي بالحلول (يقارن الخيارات)",
    },
    {
      value: "product_aware",
      label:
        lang === "en"
          ? "Product Aware (Already Knows You)"
          : "واعي بالمنتج (يعرف علامتك)",
    },
  ];

  const pricePointOptions = [
    {
      value: "low_ticket",
      label:
        lang === "en"
          ? "Free / Low Ticket ($0 - $50)"
          : "مجاني / سعر منخفض ($0 - $50)",
    },
    {
      value: "mid_ticket",
      label:
        lang === "en" ? "Mid Ticket ($50 - $300)" : "سعر متوسط ($50 - $300)",
    },
    {
      value: "high_ticket",
      label:
        lang === "en"
          ? "High Ticket / Premium ($300+)"
          : "سعر مرتفع / فاخر ($300+)",
    },
  ];

  const emotionOptions = [
    {
      value: "urgency",
      label:
        lang === "en"
          ? "Urgency & Scarcity (FOMO)"
          : "إلحاح وندرة (Urgency & Scarcity)",
    },
    {
      value: "aspirational",
      label:
        lang === "en" ? "Aspirational & Social Status" : "طموح ومكانة اجتماعية",
    },
    {
      value: "logical",
      label:
        lang === "en" ? "Logical & ROI Data-Driven" : "منطقي ولغة أرقام وعائد",
    },
    {
      value: "empathetic",
      label: lang === "en" ? "Empathetic & Pain-Relief" : "تعاطف وتخفيف الألم",
    },
  ];

  // Canvas Live Section Definitions
  const canvasSections = [
    {
      id: 1,
      key: "hero",
      title_ar: "1. قسم البطل (Hero)",
      title_en: "1. Hero Section",
      icon: Sparkles,
      badge: "HERO",
      badgeColor: "#3B82F6",
      glowColor: "rgba(59, 130, 246, 0.4)",
    },
    {
      id: 2,
      key: "problem",
      title_ar: "2. المشكلة والألم (Problem)",
      title_en: "2. Problem & Pain",
      icon: AlertTriangle,
      badge: "PROBLEM",
      badgeColor: "#F59E0B",
      glowColor: "rgba(245, 158, 11, 0.4)",
    },
    {
      id: 3,
      key: "offer",
      title_ar: "3. العرض والفوائد (Offer)",
      title_en: "3. Offer & Benefits",
      icon: Award,
      badge: "OFFER",
      badgeColor: "#10B981",
      glowColor: "rgba(16, 185, 129, 0.4)",
    },
    {
      id: 4,
      key: "proof",
      title_ar: "4. الإثبات والتوصيات (Proof)",
      title_en: "4. Social Proof",
      icon: Users,
      badge: "PROOF",
      badgeColor: "#8B5CF6",
      glowColor: "rgba(139, 92, 246, 0.4)",
    },
    {
      id: 5,
      key: "cta",
      title_ar: "5. النداء لاتخاذ إجراء (CTA)",
      title_en: "5. Call to Action",
      icon: Zap,
      badge: "CTA",
      badgeColor: "#EC4899",
      glowColor: "rgba(236, 72, 153, 0.4)",
    },
  ];

  // Dock Navigator Section Configuration (Preserved for compatibility)
  const dockSections = [
    {
      id: 0,
      title_ar: "0. لوحة التحكم والمدخلات",
      title_en: "0. Command Deck",
      icon: Sliders,
      badge: "CONSOLE",
    },
    ...canvasSections,
  ];

  // Safe Copy helper
  const safeCopyToClipboard = (text, successMsgEn, successMsgAr) => {
    const copyPromise =
      navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(text)
        : new Promise((resolve, reject) => {
            try {
              const textarea = document.createElement("textarea");
              textarea.value = text;
              textarea.style.position = "fixed";
              textarea.style.opacity = "0";
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
              resolve();
            } catch (e) {
              reject(e);
            }
          });

    copyPromise
      .then(() => {
        toast(lang === "en" ? successMsgEn : successMsgAr, "success");
      })
      .catch((err) => {
        console.error(err);
        toast(
          lang === "en"
            ? "Failed to copy to clipboard"
            : "تعذر النسخ إلى الحافظة",
          "error",
        );
      });
  };

  const handleGenerate = async () => {
    if (!productName.trim() || !audience.trim()) {
      setValidationError(
        lang === "en"
          ? "Please enter both the Product/Offer Name and Target Audience before generating."
          : "يرجى كتابة اسم المنتج والجمهور المستهدف قبل بدء التوليد.",
      );
      toast(
        lang === "en"
          ? "Please fill in the required fields."
          : "يرجى ملء الحقول المطلوبة.",
        "warning",
      );
      setIsInputDrawerOpen(true);
      return;
    }
    setValidationError("");
    setIsGenerating(true);
    setGeneratedContent(null);
    setIsInputDrawerOpen(false); // Close drawer to show canvas loading

    try {
      if (analysisMode === "live") {
        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
          toolId: "landing-page-content",
          inputs: {
            productName,
            audience,
            objective,
            awareness,
            pricePoint,
            emotion,
          },
          context: { niche: audience || state.niche, brandName: productName },
          lang,
        });

        const ensureArray = (val) =>
          Array.isArray(val) ? val : val ? [String(val)] : [];

        if (typeof liveResult === "object" && liveResult !== null) {
          setGeneratedContent({
            hero: ensureArray(liveResult.hero),
            problem: ensureArray(liveResult.problem),
            offer: ensureArray(liveResult.offer),
            proof: ensureArray(liveResult.proof),
            cta: ensureArray(liveResult.cta),
          });
        } else {
          setGeneratedContent({
            hero: [String(liveResult)],
            problem: [],
            offer: [],
            proof: [],
            cta: [],
          });
        }

        dispatch({
          type: "SAVE_TOOL_RESULT",
          toolId: "landing-page-content",
          data: {
            productName,
            audience,
            objective,
            awareness,
            pricePoint,
            emotion,
            result: liveResult,
            mode: "live",
          },
        });
        toast(
          lang === "en"
            ? "Intelligent landing page content generated via Live AI!"
            : "تم توليد محتوى صفحة الهبوط بالذكاء الاصطناعي بنجاح!",
          "success",
        );
      } else {
        const heroMatrix = await getLandingMatrixSection("hero_sections");
        const problemMatrix = await getLandingMatrixSection("problem_sections");
        const offerMatrix = await getLandingMatrixSection("offer_sections");
        const proofMatrix = await getLandingMatrixSection("proof_sections");
        const ctaMatrix = await getLandingMatrixSection("cta_sections");

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
          if (!text) return "";
          return text
            .replace(/\{\{productName\}\}/g, productName)
            .replace(/\{\{audience\}\}/g, audience)
            .replace(/\{\{niche\}\}/g, audience)
            .replace(
              /\{\{percent\}\}/g,
              Math.floor(Math.random() * (95 - 60) + 60),
            )
            .replace(/\{\{hours\}\}/g, 24)
            .replace(/\{\{number\}\}/g, "1,000")
            .replace(/\{\{multiplier\}\}/g, "5")
            .replace(/\{\{price\}\}/g, "$99");
        };

        const formatIdea = (idea) => {
          if (idea.headline_ar) {
            return lang === "en"
              ? `${replaceVars(idea.headline_en)}\n\n${replaceVars(idea.sub_en)}`
              : `${replaceVars(idea.headline_ar)}\n\n${replaceVars(idea.sub_ar)}`;
          }
          return lang === "en" ? replaceVars(idea.en) : replaceVars(idea.ar);
        };

        const pickRandom = (arr) =>
          arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

        const hIdea = pickRandom(getIdeas(heroMatrix, heroKey));
        const pIdea = pickRandom(getIdeas(problemMatrix, problemKey));
        const oIdea = pickRandom(getIdeas(offerMatrix, offerKey));
        const prIdea = pickRandom(getIdeas(proofMatrix, proofKey));
        const cIdea = pickRandom(getIdeas(ctaMatrix, ctaKey));

        const content = {
          hero: hIdea ? [formatIdea(hIdea)] : ["Hero Section"],
          problem: pIdea ? [formatIdea(pIdea)] : ["Problem Section"],
          offer: oIdea ? [formatIdea(oIdea)] : ["Offer Section"],
          proof: prIdea ? [formatIdea(proofMatrix)] : ["Social Proof Section"],
          cta: cIdea ? [formatIdea(ctaMatrix)] : ["CTA Section"],
        };

        setGeneratedContent(content);
        dispatch({
          type: "SAVE_TOOL_RESULT",
          toolId: "landing-page-content",
          data: {
            productName,
            audience,
            objective,
            awareness,
            pricePoint,
            emotion,
            result: content,
            mode: "fast",
          },
        });
        toast(
          lang === "en"
            ? "Landing page matrix content generated!"
            : "تم توليد مصفوفة محتوى صفحة الهبوط بنجاح!",
          "success",
        );
      }

      setIsConsoleCollapsed(true);
      setActiveSectionIndex(1);
    } catch (err) {
      console.error(err);
      toast(
        lang === "en" ? "Error generating content" : "حدث خطأ أثناء التوليد",
        "error",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copySection = (text) => {
    safeCopyToClipboard(
      text,
      "Section text copied to clipboard!",
      "تم نسخ نص القسم إلى الحافظة!",
    );
  };

  const copyAllMarkdown = () => {
    if (!generatedContent) return;
    const formatSection = (title, arr) => {
      const body = Array.isArray(arr) ? arr.join("\n\n") : String(arr || "");
      return `## ${title}\n${body}`;
    };

    const fullMarkdown = [
      `# ${productName || "Landing Page Copy"}`,
      formatSection("1. Hero Section", generatedContent.hero),
      formatSection("2. Problem & Agitation", generatedContent.problem),
      formatSection("3. The Offer & Benefits", generatedContent.offer),
      formatSection("4. Social Proof & Credibility", generatedContent.proof),
      formatSection("5. Call to Action (CTA)", generatedContent.cta),
    ].join("\n\n---\n\n");

    safeCopyToClipboard(
      fullMarkdown,
      "Complete landing page markdown copied to clipboard!",
      "تم نسخ الهيكل الكامل لصفحة الهبوط إلى الحافظة!",
    );
  };

  const exportJson = () => {
    if (!generatedContent) return;
    const exportData = {
      product_name: productName,
      audience,
      objective,
      awareness,
      price_point: pricePoint,
      emotion_driver: emotion,
      content: generatedContent,
      generated_at: new Date().toLocaleDateString(),
    };
    const jsonStr = JSON.stringify(exportData, null, 2);

    try {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(productName || "landing_page").toLowerCase().replace(/[^a-z0-9]/g, "_")}_content.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast(
        lang === "en"
          ? "Landing page JSON exported!"
          : "تم تصدير ملف JSON بنجاح!",
        "success",
      );
    } catch (err) {
      console.error(err);
      safeCopyToClipboard(
        jsonStr,
        "Export JSON copied to clipboard!",
        "تم نسخ JSON إلى الحافظة!",
      );
    }
  };

  const getSectionDataByIndex = (index) => {
    if (!generatedContent) return null;
    switch (index) {
      case 1:
        return {
          title_ar: "1. قسم البطل (Hero)",
          title_en: "1. Hero Section",
          ideas: generatedContent.hero,
          icon: Sparkles,
        };
      case 2:
        return {
          title_ar: "2. توضيح المشكلة والألم",
          title_en: "2. Problem & Agitation",
          ideas: generatedContent.problem,
          icon: AlertTriangle,
        };
      case 3:
        return {
          title_ar: "3. العرض والفوائد الأساسية",
          title_en: "3. Offer & Benefits",
          ideas: generatedContent.offer,
          icon: Award,
        };
      case 4:
        return {
          title_ar: "4. الإثبات الاجتماعي والمصداقية",
          title_en: "4. Social Proof & Credibility",
          ideas: generatedContent.proof,
          icon: Users,
        };
      case 5:
        return {
          title_ar: "5. النداء لاتخاذ إجراء (CTA)",
          title_en: "5. Call to Action (CTA)",
          ideas: generatedContent.cta,
          icon: Zap,
        };
      default:
        return null;
    }
  };

  const activeSectionData = getSectionDataByIndex(activeSectionIndex);

  // Professional Status Badges sweeping during loading
  const scanningBadges = [
    lang === "en" ? "Framing High-Converting Hero..." : "صياغة قسم البطل وتصميم العنونة...",
    lang === "en" ? "Synthesizing Value Proposition & Proof..." : "تحليل مصفوفة المشكلة وإثبات الجودة...",
    lang === "en" ? "Fitting Action-Oriented CTA..." : "ضبط زر اتخاذ الإجراء وحساب التحويل...",
  ];


  // --- STATE PERSISTENCE & HYDRATION ---
  const { cachedData: cached, isLoadingCache, saveResult } = useToolCache(userData?.uid, 'landing-page-content');
  const isLoadedFromCloud = !isLoadingCache;
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (isLoadedFromCloud && !hydratedRef.current) {
      hydratedRef.current = true;
      if (cached) {
        if (cached.analysisMode !== undefined) setAnalysisMode(cached.analysisMode);
        if (cached.activeSectionIndex !== undefined) setActiveSectionIndex(cached.activeSectionIndex);
        if (cached.isConsoleCollapsed !== undefined) setIsConsoleCollapsed(cached.isConsoleCollapsed);
        if (cached.isInputDrawerOpen !== undefined) setIsInputDrawerOpen(cached.isInputDrawerOpen);
        if (cached.scanningStep !== undefined) setScanningStep(cached.scanningStep);
        if (cached.productName !== undefined) setProductName(cached.productName);
        if (cached.audience !== undefined) setAudience(cached.audience);
        if (cached.validationError !== undefined) setValidationError(cached.validationError);
        if (cached.objective !== undefined) setObjective(cached.objective);
        if (cached.awareness !== undefined) setAwareness(cached.awareness);
        if (cached.pricePoint !== undefined) setPricePoint(cached.pricePoint);
        if (cached.emotion !== undefined) setEmotion(cached.emotion);
        if (cached.isGenerating !== undefined) setIsGenerating(cached.isGenerating);
        if (cached.generatedContent !== undefined) setGeneratedContent(cached.generatedContent);
        if (cached.activeIdeaIndex !== undefined) setActiveIdeaIndex(cached.activeIdeaIndex);
      }
    }
  }, [isLoadedFromCloud, cached]);

  useEffect(() => {
    if (!isLoadedFromCloud || !hydratedRef.current) return;
    const timeout = setTimeout(() => {
      saveResult({ analysisMode, activeSectionIndex, isConsoleCollapsed, isInputDrawerOpen, scanningStep, productName, audience, validationError, objective, awareness, pricePoint, emotion, isGenerating, generatedContent, activeIdeaIndex });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoadedFromCloud, analysisMode, activeSectionIndex, isConsoleCollapsed, isInputDrawerOpen, scanningStep, productName, audience, validationError, objective, awareness, pricePoint, emotion, isGenerating, generatedContent, activeIdeaIndex]);

  const handleResetSession = () => {
    setAnalysisMode("fast");
    setActiveSectionIndex(0);
    setIsConsoleCollapsed(false);
    setIsInputDrawerOpen(false);
    setScanningStep(0);
    setProductName(state.brandName || "");
    setAudience(state.niche || "");
    setValidationError("");
    setObjective("direct_sales");
    setAwareness("problem_aware");
    setPricePoint("low_ticket");
    setEmotion("urgency");
    setIsGenerating(false);
    setGeneratedContent(null);
    setActiveIdeaIndex({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
    saveResult(null);
  };
  // -------------------------------------

  
  if (isLoadingCache || !hydratedRef.current) {
    return (
      <ToolDashboardLayout
        id="landing-page-content"
        title={
        lang === "en"
          ? "Landing Page Content Studio"
          : "استوديو وصانع محتوى صفحات الهبوط"
      }
        subtitle={lang === 'en' ? 'Loading saved workspace...' : 'جاري تحميل مساحة العمل...'}
        stepNumber={stepNumber}
        accentColor="#6366F1"
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Sleek Skeleton Loader */}
          <div style={{ height: "400px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", animation: "pulse 1.5s infinite" }}></div>
        </div>
      </ToolDashboardLayout>
    );
  }

  return (
    <ToolDashboardLayout
      id="landing-page-content"
      title={
        lang === "en"
          ? "Landing Page Content Studio"
          : "استوديو وصانع محتوى صفحات الهبوط"
      }
      subtitle={
        lang === "en"
          ? "Interactive Live Canvas Editor for high-converting multi-variable landing page copy."
          : "كانفاس تفاعلي مباشر لصياغة محتوى صفحة الهبوط بناءً على 4 أبعاد نفسية."
      }
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="10 - 20"
    >
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px 0 20px' }}>
          <button
            onClick={handleResetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
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
            <RefreshCw size={14} />
            {(state?.language || 'ar') === 'en' ? 'Reset / Start Fresh' : 'إعادة ضبط / بدء من جديد'}
          </button>
        </div>
      <div className="lpc-deck-workspace" dir={isRtl ? "rtl" : "ltr"}>

        {/* ═══════════════ 1. SLEEK TOP GLASSBAR & MASTER INPUT TRIGGER ═══════════════ */}
        <div className="lpc-canvas-top-bar">
          <div className="lpc-top-bar-info">
            <div className="lpc-live-indicator">
              <span className="lpc-pulse-dot" />
              <span className="lpc-indicator-title">
                {lang === "en" ? "LIVE CANVAS" : "كانفاس مباشر"}
              </span>
            </div>
            
            {productName ? (
              <div className="lpc-product-chip">
                <ShoppingBag size={13} color="#818CF8" />
                <span>{productName}</span>
              </div>
            ) : (
              <span className="lpc-placeholder-chip">
                {lang === "en" ? "No Product Specified" : "لم يتم تحديد منتج بعد"}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsInputDrawerOpen(true)}
            className="lpc-drawer-trigger-btn"
          >
            <Sliders size={15} color="#3B82F6" />
            <span>
              {lang === "en"
                ? "Edit Parameters & 4 Dimensions"
                : "ضبط المدخلات والأبعاد الأربعة"}
            </span>
          </button>
        </div>

        {/* ═══════════════ 2. MASTER OVERLAY INPUT DRAWER / MODAL (PORTAL TO BODY) ═══════════════ */}
        {createPortal(
          <AnimatePresence>
            {isInputDrawerOpen && (
              <div className="lpc-drawer-backdrop-wrapper">
                <motion.div
                  className="lpc-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsInputDrawerOpen(false)}
                />

                <motion.div
                  className="lpc-drawer-content"
                  initial={{ opacity: 0, scale: 0.92, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  {/* Drawer Header */}
                  <div className="lpc-drawer-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="lpc-drawer-header-icon">
                        <Sliders size={18} color="#3B82F6" />
                      </div>
                      <div>
                        <h3 className="lpc-drawer-title">
                          {lang === "en"
                            ? "Master Input Console & 4-D Matrix"
                            : "منصة التحكم البرمجية ومصفوفة الأبعاد الأربعة"}
                        </h3>
                        <p className="lpc-drawer-sub">
                          {lang === "en"
                            ? "Adjust parameters to synthesize high-converting copy"
                            : "اضبط بيانات العرض والدوافع النفسية لجمهورك"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsInputDrawerOpen(false)}
                      className="lpc-drawer-close-btn"
                    >
                      <X size={18} color="#94A3B8" />
                    </button>
                  </div>

                  {/* Validation Alert */}
                  {validationError && (
                    <div className="lpc-validation-alert">
                      <AlertTriangle size={16} />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Main Input Form */}
                  <div className="lpc-drawer-body">
                    <div className="lpc-inputs-2col-grid">
                      <div className="lpc-form-group">
                        <label className="lpc-label">
                          <ShoppingBag size={13} color="#818CF8" strokeWidth={1.5} />
                          <span>
                            {lang === "en"
                              ? "Product / Offer Name"
                              : "اسم المنتج أو العرض"}
                          </span>
                          <span className="lpc-label-accent">*</span>
                        </label>
                        <input
                          type="text"
                          className={`lpc-input ${validationError && !productName ? "error" : ""}`}
                          value={productName}
                          onChange={(e) => {
                            setProductName(e.target.value);
                            if (e.target.value.trim() && audience.trim())
                              setValidationError("");
                          }}
                          placeholder={
                            lang === "en"
                              ? "e.g., Nova Profit Engine"
                              : "مثال: نظام الأرباح الإلكترونية"
                          }
                        />
                      </div>

                      <div className="lpc-form-group">
                        <label className="lpc-label">
                          <Users size={13} color="#818CF8" strokeWidth={1.5} />
                          <span>
                            {lang === "en"
                              ? "Target Audience"
                              : "الجمهور المستهدف"}
                          </span>
                          <span className="lpc-label-accent">*</span>
                        </label>
                        <input
                          type="text"
                          className={`lpc-input ${validationError && !audience ? "error" : ""}`}
                          value={audience}
                          onChange={(e) => {
                            setAudience(e.target.value);
                            if (productName.trim() && e.target.value.trim())
                              setValidationError("");
                          }}
                          placeholder={
                            lang === "en"
                              ? "e.g., Freelancers & Agencies"
                              : "مثال: أصحاب الوكالات والمستقلين"
                          }
                        />
                      </div>
                    </div>

                    {/* 4 Psychological Dimension Dropdowns */}
                    <div className="lpc-dropdowns-2x2-grid">
                      <CustomDropdown
                        label={
                          lang === "en"
                            ? "1. Page Objective"
                            : "1. الهدف من الصفحة"
                        }
                        icon={Target}
                        value={objective}
                        onChange={setObjective}
                        options={objectiveOptions}
                        lang={lang}
                      />

                      <CustomDropdown
                        label={
                          lang === "en"
                            ? "2. Audience Awareness"
                            : "2. مستوى وعي الجمهور"
                        }
                        icon={Sparkles}
                        value={awareness}
                        onChange={setAwareness}
                        options={awarenessOptions}
                        lang={lang}
                      />

                      <CustomDropdown
                        label={
                          lang === "en"
                            ? "3. Price/Complexity"
                            : "3. الفئة السعرية / التعقيد"
                        }
                        icon={DollarSign}
                        value={pricePoint}
                        onChange={setPricePoint}
                        options={pricePointOptions}
                        lang={lang}
                      />

                      <CustomDropdown
                        label={
                          lang === "en"
                            ? "4. Emotional Driver"
                            : "4. الدافع العاطفي (Tone)"
                        }
                        icon={HeartPulse}
                        value={emotion}
                        onChange={setEmotion}
                        options={emotionOptions}
                        lang={lang}
                      />
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="lpc-drawer-footer">
                    <AnalysisModeSelector
                      mode={analysisMode}
                      onChange={setAnalysisMode}
                      lang={lang}
                      accentColor="#6366F1"
                    />

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="lpc-btn-primary"
                    >
                      {isGenerating ? (
                        <span className="lpc-btn-content">
                          <span className="td-spinner" />
                          {lang === "en"
                            ? "Assembling Matrix..."
                            : "جاري تجميع محتوى الصفحة..."}
                        </span>
                      ) : (
                        <span className="lpc-btn-content">
                          <Cpu size={16} strokeWidth={1.5} />
                          {lang === "en"
                            ? "Generate Intelligent Content"
                            : "توليد محتوى ذكي وموجه"}
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* ═══════════════ 3. THE CENTRAL LIVE PAGE CANVAS (FULL PAGE SHOWCASE) ═══════════════ */}
        <div className="lpc-canvas-viewport-wrapper">
          <div className="lpc-browser-frame">
            
            {/* Browser Window Bar */}
            <div className="lpc-browser-bar">
              <div className="lpc-browser-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>

              <div className="lpc-browser-address-bar">
                <Globe size={12} color="#94A3B8" />
                <span className="url">
                  https://{(productName || "brand").toLowerCase().replace(/[^a-z0-9]/g, "")}.com/landing-page
                </span>
                <span className="ssl-badge">
                  <ShieldCheck size={11} color="#10B981" /> SSL
                </span>
              </div>

              <div className="lpc-browser-controls">
                <span className="viewport-badge">
                  <Monitor size={12} /> 100% Desktop View
                </span>
              </div>
            </div>

            {/* Canvas Body (Generated Sections / Loading Scanner / Empty State) */}
            <div className="lpc-canvas-body">
              
              {/* ANIMATED GENERATION SCANNER STATE */}
              {isGenerating && (
                <div className="lpc-scanner-overlay">
                  {/* Visual Beam */}
                  <motion.div
                    className="lpc-scanner-beam"
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Sweeping Real-Time Status Badge */}
                  <div className="lpc-scanner-badge-box">
                    <motion.div
                      key={scanningStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="lpc-scanner-badge"
                    >
                      <Sparkles size={16} className="lpc-spin-icon" color="#3B82F6" />
                      <span>{scanningBadges[scanningStep]}</span>
                    </motion.div>
                  </div>

                  {/* Skeleton Sections */}
                  <div className="lpc-skeleton-canvas">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="lpc-skeleton-section">
                        <div className="lpc-skeleton-title shimmer" />
                        <div className="lpc-skeleton-text shimmer" style={{ width: "80%" }} />
                        <div className="lpc-skeleton-text shimmer" style={{ width: "60%" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EMPTY CANVAS STATE */}
              {!generatedContent && !isGenerating && (
                <div className="lpc-empty-canvas">
                  <div className="lpc-empty-icon-glow">
                    <Layout size={40} color="#3B82F6" />
                  </div>
                  <h4>
                    {lang === "en"
                      ? "Interactive Page Canvas Ready"
                      : "كانفاس صفحة الهبوط المباشر جاهز للتصميم"}
                  </h4>
                  <p>
                    {lang === "en"
                      ? "Click the parameter controller to input your product details & synthesize landing page copy."
                      : "اضغط على زر ضبط المدخلات لإدخال تفاصيل المنتج وتوليد محتوى موجه بالذكاء الاصطناعي."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsInputDrawerOpen(true)}
                    className="lpc-btn-primary"
                    style={{ maxWidth: 300, marginTop: 12 }}
                  >
                    <Sliders size={16} />
                    <span>
                      {lang === "en"
                        ? "Edit Parameters & Generate"
                        : "ضبط المدخلات وبدء التوليد"}
                    </span>
                  </button>
                </div>
              )}

              {/* LIVE GENERATED SECTIONS SHOWCASE */}
              {generatedContent && !isGenerating && (
                <div className="lpc-sections-stack">
                  {canvasSections.map((sec) => {
                    const SecIcon = sec.icon;
                    const ideas = generatedContent[sec.key] || [];
                    const activeIdx = activeIdeaIndex[sec.id] || 0;
                    const currentText = ideas[activeIdx] || ideas[0] || "";

                    return (
                      <div
                        key={sec.id}
                        className="lpc-canvas-section-block"
                        style={{ "--sec-glow": sec.glowColor, "--sec-accent": sec.badgeColor }}
                      >
                        {/* On-Hover Glass Floating Micro-Toolbar */}
                        <div className="lpc-section-hover-toolbar">
                          <div className="lpc-toolbar-badge">
                            <SecIcon size={14} color={sec.badgeColor} />
                            <span className="title">
                              {lang === "en" ? sec.title_en : sec.title_ar}
                            </span>
                            <span className="tag" style={{ background: sec.badgeColor }}>
                              {sec.badge}
                            </span>
                          </div>

                          {/* Variant Pills Selector */}
                          <div className="lpc-toolbar-variants">
                            {ideas.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setActiveIdeaIndex((prev) => ({
                                    ...prev,
                                    [sec.id]: idx,
                                  }))
                                }
                                className={`lpc-variant-pill ${activeIdx === idx ? "active" : ""}`}
                              >
                                {lang === "en" ? `Option ${idx + 1}` : `خيار ${idx + 1}`}
                              </button>
                            ))}
                          </div>

                          {/* Copy Section Action Button */}
                          <button
                            type="button"
                            onClick={() => copySection(currentText)}
                            className="lpc-toolbar-copy-btn"
                          >
                            <Copy size={13} />
                            <span>{lang === "en" ? "Copy Copy" : "نسخ النص"}</span>
                          </button>
                        </div>

                        {/* Visual Section Content Render */}
                        <div className="lpc-section-view-wrapper">
                          {sec.key === "hero" && (
                            <div className="lpc-mockup-hero">
                              <div className="lpc-hero-badge-tag">
                                <Sparkles size={12} color="#3B82F6" />
                                <span>{productName || "BRAND OFFER"}</span>
                              </div>
                              <pre className="lpc-copy-raw-text">{currentText}</pre>
                              <div className="lpc-mockup-btn">
                                <Rocket size={14} />
                                <span>{lang === "en" ? "Get Started Now" : "احصل عليه الآن"}</span>
                              </div>
                            </div>
                          )}

                          {sec.key === "problem" && (
                            <div className="lpc-mockup-problem">
                              <div className="lpc-problem-alert-bar">
                                <AlertTriangle size={14} color="#F59E0B" />
                                <span>{lang === "en" ? "PAIN POINT ANALYSIS" : "تحليل المشكلة والألم"}</span>
                              </div>
                              <pre className="lpc-copy-raw-text">{currentText}</pre>
                            </div>
                          )}

                          {sec.key === "offer" && (
                            <div className="lpc-mockup-offer">
                              <div className="lpc-offer-badge">
                                <Award size={14} color="#10B981" />
                                <span>{lang === "en" ? "VALUE PROPOSITION" : "القيمة المضافة والعرض"}</span>
                              </div>
                              <pre className="lpc-copy-raw-text">{currentText}</pre>
                            </div>
                          )}

                          {sec.key === "proof" && (
                            <div className="lpc-mockup-proof">
                              <div className="lpc-proof-stars">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
                                ))}
                                <span className="proof-tag">5.0 Star Rating</span>
                              </div>
                              <pre className="lpc-copy-raw-text">{currentText}</pre>
                            </div>
                          )}

                          {sec.key === "cta" && (
                            <div className="lpc-mockup-cta">
                              <div className="lpc-cta-urgency">
                                <Flame size={14} color="#EC4899" />
                                <span>{lang === "en" ? "HIGH-CONVERTING CTA" : "دعوة لاتخاذ إجراء مباشر"}</span>
                              </div>
                              <pre className="lpc-copy-raw-text">{currentText}</pre>
                              <div className="lpc-mockup-btn cta-btn">
                                <Zap size={14} />
                                <span>{lang === "en" ? "Take Action Today" : "ابدأ الآن بدون مخاطرة"}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════ 4. FLOATING MASTER ACTION DOCK (BOTTOM CENTER) ═══════════════ */}
        <div className="lpc-floating-master-dock">
          <button
            type="button"
            onClick={copyAllMarkdown}
            disabled={!generatedContent || isGenerating}
            className="lpc-dock-action-btn"
          >
            <Copy size={15} color="#3B82F6" />
            <span>{lang === "en" ? "Copy Complete Page Copy" : "نسخ الهيكل الكامل"}</span>
          </button>

          <button
            type="button"
            onClick={exportJson}
            disabled={!generatedContent || isGenerating}
            className="lpc-dock-action-btn"
          >
            <Download size={15} color="#10B981" />
            <span>{lang === "en" ? "Export Structured JSON" : "تصدير JSON"}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="lpc-dock-action-btn primary"
          >
            <RefreshCw size={15} className={isGenerating ? "lpc-spin-icon" : ""} />
            <span>{lang === "en" ? "Regenerate Whole Page" : "إعادة التوليد"}</span>
          </button>
        </div>

      </div>
    </ToolDashboardLayout>
  );
}

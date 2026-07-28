import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../../context/AppContext";
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
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
  const toastContext = useToast();
  const toast =
    typeof toastContext === "function"
      ? toastContext
      : toastContext?.toast || ((msg) => console.log(msg));

  const lang = state.language || "ar";
  const isRtl = lang === "ar";

  const [analysisMode, setAnalysisMode] = useState("fast"); // 'fast' | 'live'
  const [activeSectionIndex, setActiveSectionIndex] = useState(0); // 0: config, 1: hero, 2: problem, 3: offer, 4: proof, 5: cta
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

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

  // Dock Navigator Section Configuration
  const dockSections = [
    {
      id: 0,
      title_ar: "0. لوحة التحكم والمدخلات",
      title_en: "0. Command Deck",
      icon: Sliders,
      badge: "CONSOLE",
    },
    {
      id: 1,
      title_ar: "1. قسم البطل (Hero)",
      title_en: "1. Hero Section",
      icon: Sparkles,
      badge: "HERO",
    },
    {
      id: 2,
      title_ar: "2. المشكلة والألم (Problem)",
      title_en: "2. Problem & Pain",
      icon: AlertTriangle,
      badge: "PROBLEM",
    },
    {
      id: 3,
      title_ar: "3. العرض والفوائد (Offer)",
      title_en: "3. Offer & Benefits",
      icon: Award,
      badge: "OFFER",
    },
    {
      id: 4,
      title_ar: "4. الإثبات والتوصيات (Proof)",
      title_en: "4. Social Proof",
      icon: Users,
      badge: "PROOF",
    },
    {
      id: 5,
      title_ar: "5. النداء لاتخاذ إجراء (CTA)",
      title_en: "5. Call to Action",
      icon: Zap,
      badge: "CTA",
    },
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
      return;
    }
    setValidationError("");
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      if (analysisMode === "live") {
        const liveResult = await dispatchLiveAiAnalysis({
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
          proof: prIdea ? [formatIdea(prIdea)] : ["Social Proof Section"],
          cta: cIdea ? [formatIdea(cIdea)] : ["CTA Section"],
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

      // Auto collapse console & focus Hero section
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
      "Section text copied to clipboard! ✅",
      "تم نسخ نص القسم إلى الحافظة! ✅",
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
      "Complete landing page markdown copied to clipboard! ✅",
      "تم نسخ الهيكل الكامل لصفحة الهبوط إلى الحافظة! ✅",
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
          ? "Landing page JSON exported! ✅"
          : "تم تصدير ملف JSON بنجاح! ✅",
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
          ? "Interactive Collapsible Command Deck for high-converting multi-variable landing page copy."
          : "لوحة تحكم تفاعلية قابلة للطي لصياغة محتوى صفحة الهبوط بناءً على 4 أبعاد نفسية."
      }
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="10 - 20"
    >
      <div className="lpc-deck-workspace" dir={isRtl ? "rtl" : "ltr"}>
        {/* ═══════════════ 1. MINIMALIST TOP DOCK FLOATING NAVIGATOR ═══════════════ */}
        <div className="lpc-floating-dock-bar">
          {dockSections.map((sec) => {
            const IconComp = sec.icon;
            const isActive = activeSectionIndex === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setActiveSectionIndex(sec.id);
                  if (sec.id === 0) setIsConsoleCollapsed(false);
                }}
                className={`lpc-dock-pill ${isActive ? "active" : ""}`}
              >
                <div className="lpc-dock-pill-icon">
                  <IconComp
                    size={15}
                    color={isActive ? "#FFFFFF" : "#818CF8"}
                  />
                </div>
                <span className="lpc-dock-pill-title">
                  {lang === "en" ? sec.title_en : sec.title_ar}
                </span>
                <span className="lpc-dock-pill-badge">{sec.badge}</span>
              </button>
            );
          })}
        </div>

        {/* ═══════════════ 2. DYNAMIC INPUT COMMAND PANEL (SECTION 0 REFACTOR) ═══════════════ */}
        {activeSectionIndex === 0 && (
          <motion.div
            className="lpc-command-console"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Console Header Rail */}
            <div className="lpc-console-rail">
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div className="lpc-console-badge-icon">
                  <Sliders size={18} color="#818CF8" />
                </div>
                <div>
                  <h3 className="lpc-console-heading">
                    {lang === "en"
                      ? "4-Dimensional Command Console"
                      : "منصة التحكم البرمجية ومصفوفة الأبعاد الأربعة"}
                  </h3>
                  <p className="lpc-console-subtext">
                    {lang === "en"
                      ? "Define offer details & psychological drivers."
                      : "حدد بيانات العرض والدوافع النفسية لجمهورك."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                className="wc-btn wc-btn-secondary"
                style={{ padding: "6px 14px", fontSize: "11px" }}
              >
                {isConsoleCollapsed ? (
                  <Maximize2 size={13} />
                ) : (
                  <Minimize2 size={13} />
                )}
                <span>
                  {isConsoleCollapsed
                    ? lang === "en"
                      ? "Expand"
                      : "توسيع"
                    : lang === "en"
                      ? "Collapse"
                      : "طـي"}
                </span>
              </button>
            </div>

            {/* Validation Alert */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  className="lpc-validation-alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertTriangle size={16} flexShrink={0} />
                  <span>{validationError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsible Console Body */}
            <AnimatePresence initial={false}>
              {!isConsoleCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="lpc-console-body">
                    {/* Base Text Inputs Row (2 Columns) */}
                    <div className="lpc-inputs-2col-grid">
                      <div className="lpc-form-group">
                        <label className="lpc-label">
                          <ShoppingBag
                            size={13}
                            color="#818CF8"
                            strokeWidth={1.5}
                          />
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

                    {/* 4 Psychological Dimension Dropdowns (2x2 Clean Grid) */}
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Distinct Action Bar */}
            <div className="lpc-console-action-bar">
              <AnalysisModeSelector
                mode={analysisMode}
                onChange={setAnalysisMode}
                lang={lang}
                accentColor="#6366F1"
              />

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="lpc-btn-primary"
              >
                {isGenerating ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <span className="td-spinner" />{" "}
                    {lang === "en"
                      ? "Assembling Matrix..."
                      : "جاري تجميع محتوى الصفحة..."}
                  </span>
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Cpu size={16} strokeWidth={1.5} />{" "}
                    {lang === "en"
                      ? "Generate Intelligent Content"
                      : "توليد محتوى ذكي وموجه"}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ 3. IN-CONTEXT CONTENT CANVAS SPOTLIGHT (SECTIONS 1 TO 5) ═══════════════ */}
        {activeSectionIndex >= 1 && activeSectionIndex <= 5 && (
          <div className="lpc-spotlight-copy-wrapper">
            {!generatedContent && !isGenerating ? (
              <div className="lpc-empty-deck-card">
                <FileText size={36} color="#818CF8" />
                <h4>
                  {lang === "en"
                    ? "Configure parameters & click generate"
                    : "حدد الأبعاد الأربعة ثم اضغط توليد المحتوى"}
                </h4>
                <p>
                  {lang === "en"
                    ? "Switch to Section 0 to set product name and target audience."
                    : "انتقل للمحطة 0 لإدخال بيانات المنتج والجمهور المستهدف."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSectionIndex(0);
                    setIsConsoleCollapsed(false);
                  }}
                  className="wc-btn wc-btn-primary"
                  style={{ marginTop: "14px" }}
                >
                  <Sliders size={14} />
                  <span>
                    {lang === "en"
                      ? "Go to Command Deck"
                      : "الانتقال لمنصة التحكم"}
                  </span>
                </button>
              </div>
            ) : isGenerating ? (
              <div className="lpc-loading-deck-card">
                <div className="td-spinner" style={{ width: 32, height: 32 }} />
                <span>
                  {lang === "en"
                    ? "Generating section copy..."
                    : "جاري صياغة وتوليد محتوى القسم..."}
                </span>
              </div>
            ) : (
              activeSectionData && (
                <motion.div
                  className="lpc-live-copy-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Card Header Rail */}
                  <div className="lpc-copy-card-header">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div className="lpc-copy-card-icon">
                        {React.createElement(
                          activeSectionData.icon || Sparkles,
                          { size: 18, color: "#818CF8" },
                        )}
                      </div>
                      <div>
                        <h3 className="lpc-copy-card-title">
                          {lang === "en"
                            ? activeSectionData.title_en
                            : activeSectionData.title_ar}
                        </h3>
                        <span className="lpc-copy-card-tag">
                          SPOTLIGHT COPY ⚡
                        </span>
                      </div>
                    </div>

                    {/* Option Switcher & Copy Action */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "4px" }}>
                        {(activeSectionData.ideas || []).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setActiveIdeaIndex((prev) => ({
                                ...prev,
                                [activeSectionIndex]: i,
                              }))
                            }
                            className={`lpc-idea-pill ${(activeIdeaIndex[activeSectionIndex] || 0) === i ? "active" : ""}`}
                          >
                            {lang === "en"
                              ? `Option ${i + 1}`
                              : `خيار ${i + 1}`}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copySection(
                            (activeSectionData.ideas || [])[
                              activeIdeaIndex[activeSectionIndex] || 0
                            ],
                          )
                        }
                        className="lpc-btn lpc-btn-primary"
                        style={{ padding: "6px 14px", fontSize: "11.5px" }}
                      >
                        <Copy size={13} />
                        <span>{lang === "en" ? "Copy Text" : "نسخ النص"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="lpc-copy-card-body">
                    <pre
                      dir={isRtl ? "rtl" : "ltr"}
                      style={{ textAlign: isRtl ? "right" : "left" }}
                    >
                      {
                        (activeSectionData.ideas || [])[
                          activeIdeaIndex[activeSectionIndex] || 0
                        ]
                      }
                    </pre>
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}

        {/* ═══════════════ FLOATING BOTTOM UTILITY DOCK ═══════════════ */}
        <div className="lpc-bottom-utility-dock">
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={activeSectionIndex === 0}
              onClick={() =>
                setActiveSectionIndex((prev) => Math.max(0, prev - 1))
              }
              className="lpc-btn lpc-btn-secondary"
            >
              {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              <span>{lang === "en" ? "Previous" : "السابق"}</span>
            </button>

            <button
              type="button"
              disabled={activeSectionIndex === 5}
              onClick={() =>
                setActiveSectionIndex((prev) => Math.min(5, prev + 1))
              }
              className="lpc-btn lpc-btn-secondary"
            >
              <span>{lang === "en" ? "Next" : "التالي"}</span>
              {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>

          {generatedContent && !isGenerating && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={copyAllMarkdown}
                className="lpc-btn lpc-btn-secondary"
              >
                <Copy size={13} />
                <span style={{ textWrap: "nowrap" }}>
                  {lang === "en" ? "Copy All Markdown" : "نسخ الكل"}
                </span>
              </button>

              <button
                type="button"
                onClick={exportJson}
                className="lpc-btn lpc-btn-primary"
              >
                <Download size={13} />
                <span>{lang === "en" ? "Export JSON" : "تصدير JSON"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </ToolDashboardLayout>
  );
}

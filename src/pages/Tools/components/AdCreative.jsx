import React, { useState, useEffect, useRef } from "react";
import useToolCache from "../../../hooks/useToolCache";
import { useApp } from "../../../context/AppContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  getAdLabStructure,
  getAdLabTemplate,
} from "../../../services/contentDbService";
import AnalysisModeSelector from "../../../components/common/AnalysisModeSelector";
import { dispatchLiveAiAnalysis } from "../../../services/liveAiService";
import ToolDashboardLayout from "./ToolDashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  AlertCircle,
  Share2,
  Languages,
  Sparkles,
  Copy,
  Clapperboard,
  Film,
  FileText,
  Flame,
  Target,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  Video,
  Zap,
  Brain,
  Lightbulb,
  PlaySquare,
  Camera,
  Globe,
  SlidersHorizontal,
  RotateCcw,
  Wrench,
  Activity,
  Layers,
  Megaphone,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import "./AdCreative.css";

export default function AdCreative({ stepNumber }) {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const lang = state.language || "ar";
  const isRtl = lang === "ar";

  const [analysisMode, setAnalysisMode] = useState("fast"); // 'fast' | 'live'

  const [structure, setStructure] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPain, setSelectedPain] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDialect, setSelectedDialect] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);

  const [activePopover, setActivePopover] = useState(null); // 'product' | 'pain' | 'platform' | 'dialect' | null
  const [loadingBadgeIndex, setLoadingBadgeIndex] = useState(0);
  const [activeAngleTab, setActiveAngleTab] = useState("hook"); // 'hook' | 'visual' | 'script' | 'cta' | 'angles' | 'all'

  const platformColors = {
    tiktok: "#25F4EE",
    facebook: "#1877F2",
    youtube: "#FF0000",
    instagram: "#E1306C",
    linkedin: "#0A66C2",
  };

  const platformIconsMap = {
    tiktok: Video,
    facebook: Globe,
    youtube: PlaySquare,
    instagram: Camera,
    linkedin: Share2,
  };

  const loadingBadges =
    lang === "en"
      ? [
          "Analyzing Product Value Proposition & Persona...",
          "Framing Hook & Angle Variations...",
          "Formatting Multi-Platform Copy & Visual Prompts...",
        ]
      : [
          "جاري تحليل للقيمة المضافة للمنتج والجمهور...",
          "صياغة الخطاف الترويجي والزوايا البيعية...",
          "كتابة السكربت والتوجيهات البصرية الشاملة...",
        ];

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingBadgeIndex((prev) => (prev + 1) % loadingBadges.length);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isGenerating, loadingBadges.length]);

  useEffect(() => {
    const load = async () => {
      const data = await getAdLabStructure();
      if (data) {
        setStructure(data);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    setActivePopover(null);
    try {
      if (analysisMode === "live") {
        const liveResult = await dispatchLiveAiAnalysis({
          uid: userData?.uid || state?.user?.uid,
          toolId: "ad-creative",
          inputs: {
            selectedProduct,
            selectedPain,
            selectedPlatform,
            selectedDialect,
          },
          context: { niche: state.niche },
          lang,
        });

        const formattedResult =
          typeof liveResult === "object" && liveResult !== null
            ? {
                hook_ar: liveResult.hook_ar || liveResult.hook || "",
                hook_en: liveResult.hook_en || liveResult.hook || "",
                visual_ar:
                  liveResult.visual_ar ||
                  liveResult.visualNotes ||
                  liveResult.visual ||
                  "",
                visual_en:
                  liveResult.visual_en ||
                  liveResult.visualNotes ||
                  liveResult.visual ||
                  "",
                script_ar:
                  liveResult.script_ar ||
                  liveResult.body ||
                  liveResult.script ||
                  "",
                script_en:
                  liveResult.script_en ||
                  liveResult.body ||
                  liveResult.script ||
                  "",
                cta_ar: liveResult.cta_ar || liveResult.cta || "",
                cta_en: liveResult.cta_en || liveResult.cta || "",
                ad_angles: liveResult.ad_angles || [],
                tip_ar: liveResult.tip_ar || liveResult.pro_tip_ar || "",
                tip_en: liveResult.tip_en || liveResult.pro_tip_en || "",
              }
            : {
                hook_ar: String(liveResult),
                hook_en: String(liveResult),
                visual_ar: "Live AI visual direction",
                visual_en: "Live AI visual direction",
                script_ar: String(liveResult),
                script_en: String(liveResult),
                cta_ar: "اشترِ الآن واستفد من العرض",
                cta_en: "Shop Now & Claim Offer",
              };

        setResult(formattedResult);
        setIsNewlyGenerated(true);
        const payload = {
          inputs: {
            selectedProduct: selectedProduct || null,
            selectedPain: selectedPain || null,
            selectedPlatform: selectedPlatform || null,
            selectedDialect: selectedDialect || null,
          },
          result: formattedResult,
          analysisMode: "live",
          activeAngleTab,
        };
        console.log("SAVING TO CACHE:", payload);
        saveResult(payload);
        toast(
          lang === "en"
            ? "Live AI Ad Script generated!"
            : "تم توليد السكربت الإعلاني بالذكاء الاصطناعي الحي!",
          "success",
        );
      } else {
        await new Promise((r) => setTimeout(r, 600));
        const dbResult = await getAdLabTemplate(
          selectedProduct,
          selectedPain,
          selectedPlatform,
          selectedDialect,
        );
        if (dbResult && dbResult.content) {
          setResult(dbResult.content);
          setIsNewlyGenerated(true);
          const payload = {
            inputs: {
              selectedProduct: selectedProduct || null,
              selectedPain: selectedPain || null,
              selectedPlatform: selectedPlatform || null,
              selectedDialect: selectedDialect || null,
            },
            result: dbResult.content,
            analysisMode: "fast",
            activeAngleTab,
          };
          console.log("SAVING TO CACHE:", payload);
          saveResult(payload);
          toast(
            lang === "en"
              ? "Ad script ready!"
              : "السكربت الإعلاني جاهز للإنتاج!",
            "success",
          );
        } else {
          setResult({
            error:
              lang === "en"
                ? "Template not found for this configuration."
                : "لم يتم العثور على قالب لهذا التكوين.",
          });
          toast(
            lang === "en"
              ? "Try switching to Live AI mode for custom script!"
              : "جرب التبديل للوضع الحي للحصول على نتائج مخصصة!",
            "warning",
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast(
        lang === "en"
          ? "Error generating ad. Try again."
          : "حدث خطأ أثناء التوليد. حاول مرة أخرى.",
        "error",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast(
      lang === "en"
        ? `${label} copied to clipboard!`
        : `تم نسخ ${label} إلى الحافظة!`,
      "success",
    );
  };

  const bottomSections = [
    {
      icon: <Brain size={18} color="#6366F1" />,
      title:
        lang === "en"
          ? "Psychology of a Successful Ad"
          : "سيكولوجية الإعلان الناجح",
      items: [
        lang === "en"
          ? 'A good ad sells the "end result" and escape from pain, not the product itself.'
          : 'الإعلان الجيد لا يبيع المنتج، بل يبيع "النتيجة النهائية" والهروب من الألم.',
        lang === "en"
          ? "Make the first seconds a shock or unexpected question."
          : "الناس لا يقرؤون الإعلانات المملة، اجعل الثواني الأولى صدمة أو سؤالاً غير متوقع.",
        lang === "en"
          ? "Always use only ONE Call to Action (CTA)."
          : 'استخدم دائماً "نداء لاتخاذ إجراء" (CTA) واحد فقط.',
      ],
    },
  ];

  const selectedPlatObj = structure?.platforms?.find(
    (p) => p.id === selectedPlatform,
  );
  const ActivePlatIcon = platformIconsMap[selectedPlatform] || Share2;

  // --- STATE PERSISTENCE & HYDRATION ---
  const { cachedData, isLoadingCache, saveResult } = useToolCache(userData?.uid, "ad-creative");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!isLoadingCache && !isHydrated) {
      console.log(
        "RELOAD DETECTED - Reading from Firestore for ad-creative:",
        cachedData,
      );
      if (cachedData) {
        if (cachedData.analysisMode !== undefined)
          setAnalysisMode(cachedData.analysisMode);
        if (cachedData.activeAngleTab !== undefined)
          setActiveAngleTab(cachedData.activeAngleTab);

        if (cachedData.inputs) {
          setSelectedProduct(cachedData.inputs.selectedProduct || "");
          setSelectedPain(cachedData.inputs.selectedPain || "");
          setSelectedPlatform(cachedData.inputs.selectedPlatform || "");
          setSelectedDialect(cachedData.inputs.selectedDialect || "");
        }

        if (cachedData.result) {
          setResult(cachedData.result);
        }

        setIsNewlyGenerated(false);
      }
      setIsGenerating(false);
      setLoadingBadgeIndex(0);
      setIsHydrated(true);
    }
  }, [isLoadingCache, cachedData, isHydrated]);

  const handleResetSession = () => {
    setAnalysisMode("fast");
    setStructure(null);
    setSelectedProduct("");
    setSelectedPain("");
    setSelectedPlatform("");
    setSelectedDialect("");
    setIsGenerating(false);
    setResult(null);
    setActivePopover(null);
    setLoadingBadgeIndex(0);
    setActiveAngleTab("hook");
    saveResult({ inputs: null, result: null, analysisMode: "fast", activeAngleTab: "hook" });
  };
  // -------------------------------------

  if (isLoadingCache || !isHydrated) {
    return (
      <ToolDashboardLayout
        id="ad-creative"
        title={
          lang === "en"
            ? "Ad Creative 360° Studio"
            : "مختبر الإعلانات 360° (Ad Creative Studio)"
        }
        subtitle={
          lang === "en"
            ? "Loading saved workspace..."
            : "جاري تحميل مساحة العمل..."
        }
        stepNumber={stepNumber}
        accentColor="#6366F1"
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Sleek Skeleton Loader */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ height: "40px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "8px", animation: "pulse 1.5s infinite" }}></div>
            <div style={{ height: "40px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "8px", animation: "pulse 1.5s infinite" }}></div>
          </div>
          <div style={{ height: "100px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", animation: "pulse 1.5s infinite" }}></div>
          <div style={{ height: "300px", background: "rgba(255,255,255,0.01)", borderRadius: "16px", animation: "pulse 1.5s infinite", marginTop: "20px" }}></div>
        </div>
      </ToolDashboardLayout>
    );
  }

  return (
    <ToolDashboardLayout
      id="ad-creative"
      title={
        lang === "en"
          ? "Ad Creative 360° Studio"
          : "مختبر الإعلانات 360° (Ad Creative Studio)"
      }
      subtitle={
        lang === "en"
          ? "Command-bar studio canvas for rapid visual ad assembly and multi-angle script synthesis."
          : "شريط أوامر تفاعلي لبناء السكربتات الإعلانية الفيروسية والتوجيهات البصرية لجميع المنصات."
      }
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="45 - 90"
      bottomSections={bottomSections}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "15px 20px 0 20px",
        }}
      >
        <button
          onClick={handleResetSession}
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "#EF4444",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          }}
        >
          <RefreshCw size={14} />
          {(state?.language || "ar") === "en"
            ? "Reset / Start Fresh"
            : "إعادة ضبط / بدء من جديد"}
        </button>
      </div>
      <div className="ac-container" dir={isRtl ? "rtl" : "ltr"}>
        {/* ═══════════════ 1. TOP SECTION: FLOATING COMMAND RIBBON ═══════════════ */}
        <div className="ac-ribbon-wrapper">
          <div className="ac-command-ribbon">
            <div className="ac-ribbon-pills-row">
              {/* Product Type Pill */}
              <div
                onClick={() =>
                  setActivePopover(
                    activePopover === "product" ? null : "product",
                  )
                }
                className={`ac-command-pill ${activePopover === "product" ? "active" : ""}`}
              >
                <ShoppingBag size={16} style={{ color: "#6366F1" }} />
                <div className="ac-pill-label-value">
                  <span className="ac-pill-tag">
                    {lang === "en" ? "Product Type" : "نوع المنتج"}
                  </span>
                  <span className="ac-pill-val">
                    {structure?.products?.find(
                      (p) => p.id === selectedProduct,
                    )?.[lang === "en" ? "name_en" : "name_ar"] ||
                      selectedProduct ||
                      "..."}
                  </span>
                </div>
                <ChevronDown size={14} style={{ color: "#94A3B8" }} />
              </div>

              {/* Pain Point Pill */}
              <div
                onClick={() =>
                  setActivePopover(activePopover === "pain" ? null : "pain")
                }
                className={`ac-command-pill ${activePopover === "pain" ? "active" : ""}`}
              >
                <AlertCircle size={16} style={{ color: "#EF4444" }} />
                <div className="ac-pill-label-value">
                  <span className="ac-pill-tag">
                    {lang === "en" ? "Customer Pain" : "ألم العميل"}
                  </span>
                  <span className="ac-pill-val">
                    {structure?.painPoints?.find(
                      (p) => p.id === selectedPain,
                    )?.[lang === "en" ? "name_en" : "name_ar"] ||
                      selectedPain ||
                      "..."}
                  </span>
                </div>
                <ChevronDown size={14} style={{ color: "#94A3B8" }} />
              </div>

              {/* Target Platform Pill */}
              <div
                onClick={() =>
                  setActivePopover(
                    activePopover === "platform" ? null : "platform",
                  )
                }
                className={`ac-command-pill ${activePopover === "platform" ? "active" : ""}`}
              >
                <ActivePlatIcon
                  size={16}
                  style={{
                    color: platformColors[selectedPlatform] || "#38BDF8",
                  }}
                />
                <div className="ac-pill-label-value">
                  <span className="ac-pill-tag">
                    {lang === "en" ? "Platform" : "المنصة المستهدفة"}
                  </span>
                  <span className="ac-pill-val">
                    {selectedPlatObj?.[lang === "en" ? "name_en" : "name_ar"] ||
                      selectedPlatform ||
                      "..."}
                  </span>
                </div>
                <ChevronDown size={14} style={{ color: "#94A3B8" }} />
              </div>

              {/* Dialect Pill */}
              <div
                onClick={() =>
                  setActivePopover(
                    activePopover === "dialect" ? null : "dialect",
                  )
                }
                className={`ac-command-pill ${activePopover === "dialect" ? "active" : ""}`}
              >
                <Languages size={16} style={{ color: "#10B981" }} />
                <div className="ac-pill-label-value">
                  <span className="ac-pill-tag">
                    {lang === "en" ? "Script Dialect" : "اللهجة المستهدفة"}
                  </span>
                  <span className="ac-pill-val">
                    {structure?.dialects?.find(
                      (d) => d.id === selectedDialect,
                    )?.[lang === "en" ? "name_en" : "name_ar"] ||
                      selectedDialect ||
                      "..."}
                  </span>
                </div>
                <ChevronDown size={14} style={{ color: "#94A3B8" }} />
              </div>
            </div>
          </div>

          {/* FLOATING POPOVER DROPDOWN PANEL */}
          <AnimatePresence>
            {activePopover && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="ac-popover-dropdown"
              >
                <div className="ac-popover-grid">
                  {activePopover === "product" &&
                    structure?.products?.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(p.id);
                          setActivePopover(null);
                        }}
                        className={`ac-popover-btn ${selectedProduct === p.id ? "selected" : ""}`}
                      >
                        <ShoppingBag size={14} />
                        <span>{lang === "en" ? p.name_en : p.name_ar}</span>
                      </button>
                    ))}

                  {activePopover === "pain" &&
                    structure?.painPoints?.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPain(p.id);
                          setActivePopover(null);
                        }}
                        className={`ac-popover-btn ${selectedPain === p.id ? "selected" : ""}`}
                      >
                        <AlertCircle size={14} />
                        <span>{lang === "en" ? p.name_en : p.name_ar}</span>
                      </button>
                    ))}

                  {activePopover === "platform" &&
                    structure?.platforms?.map((p) => {
                      const PlatIcon = platformIconsMap[p.id] || Share2;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPlatform(p.id);
                            setActivePopover(null);
                          }}
                          className={`ac-popover-btn ${selectedPlatform === p.id ? "selected" : ""}`}
                        >
                          <PlatIcon size={14} />
                          <span>{lang === "en" ? p.name_en : p.name_ar}</span>
                        </button>
                      );
                    })}

                  {activePopover === "dialect" &&
                    structure?.dialects?.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedDialect(d.id);
                          setActivePopover(null);
                        }}
                        className={`ac-popover-btn ${selectedDialect === d.id ? "selected" : ""}`}
                      >
                        <Languages size={14} />
                        <span>{lang === "en" ? d.name_en : d.name_ar}</span>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════════ 2. CENTER SECTION: ACTION CORE & ENGINE ═══════════════ */}
        {!result && !isGenerating && (
          <div className="ac-action-core-section">
            <AnalysisModeSelector
              mode={analysisMode}
              onChange={setAnalysisMode}
              lang={lang}
              accentColor="#6366F1"
            />

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !structure}
              className="ac-assemble-btn"
            >
              <Zap size={20} />
              <span>
                {lang === "en"
                  ? "Assemble & Generate Ad"
                  : "تركيب وتوليد الإعلانات"}
              </span>
            </button>
          </div>
        )}

        {/* ═══════════════ ANIMATED STAGES ═══════════════ */}
        <AnimatePresence mode="wait">
          {/* AI SYNTHESIS LOADING STAGE */}
          {isGenerating ? (
            <motion.div
              key="loading-stage"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="ac-reactor-loading"
            >
              <div className="ac-reactor-wrap">
                <div className="ac-reactor-ring-1" />
                <div className="ac-reactor-ring-2" />
                <Sparkles size={34} className="ac-reactor-icon" />
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    color: "#F8FAFC",
                    margin: "0 0 8px 0",
                  }}
                >
                  {lang === "en"
                    ? "Synthesizing Viral 360° Ad Creative Deck..."
                    : "جاري تركيب وتوليد السكربت الإعلاني..."}
                </h3>
                <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>
                  {lang === "en"
                    ? "Formatting hooks, visual direction, script & alternative sales angles"
                    : "تأطير الخطافات، التوجيهات البصرية، والزوايا الإعلانية البديلة"}
                </p>
              </div>

              <div className="ac-loading-status-badge">
                <Activity
                  size={14}
                  className="td-spinner"
                  style={{ borderTopColor: "#6366F1" }}
                />
                <span>{loadingBadges[loadingBadgeIndex]}</span>
              </div>
            </motion.div>
          ) : result ? (
            /* DIGITAL AD MOCKUP VIEWPORT CANVAS */
            <motion.div
              key="mockup-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="ac-mockup-stage ac-custom-scroll"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              {/* Hook Angle Selector Bar */}
              <div className="ac-angle-selector-bar">
                <button
                  type="button"
                  onClick={() => setActiveAngleTab("hook")}
                  className={`ac-angle-pill ${activeAngleTab === "hook" ? "active" : ""}`}
                >
                  <Flame size={14} style={{ color: "#6366F1" }} />
                  <span>
                    {lang === "en"
                      ? "Angle 1: Hook (First 3s)"
                      : "الزاوية 1: الخطاف (أول 3 ثوانٍ)"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAngleTab("visual")}
                  className={`ac-angle-pill ${activeAngleTab === "visual" ? "active" : ""}`}
                >
                  <Film size={14} style={{ color: "#38BDF8" }} />
                  <span>
                    {lang === "en"
                      ? "Angle 2: Visual Prompt"
                      : "الزاوية 2: التوجيه البصري"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAngleTab("script")}
                  className={`ac-angle-pill ${activeAngleTab === "script" ? "active" : ""}`}
                >
                  <FileText size={14} style={{ color: "#10B981" }} />
                  <span>
                    {lang === "en"
                      ? "Angle 3: Full Video Script"
                      : "الزاوية 3: السكربت الكامل"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAngleTab("cta")}
                  className={`ac-angle-pill ${activeAngleTab === "cta" ? "active" : ""}`}
                >
                  <Zap size={14} style={{ color: "#F59E0B" }} />
                  <span>
                    {lang === "en"
                      ? "Angle 4: Call To Action"
                      : "الزاوية 4: نداء الإجراء"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAngleTab("angles")}
                  className={`ac-angle-pill ${activeAngleTab === "angles" ? "active" : ""}`}
                >
                  <Target size={14} style={{ color: "#818CF8" }} />
                  <span>
                    {lang === "en"
                      ? "5 Alternative Angles"
                      : "5 زوايا إعلانية بديلة"}
                  </span>
                </button>
              </div>

              {/* Live Digital Ad Mockup Viewport */}
              <div className="ac-mockup-frame">
                <div className="ac-mockup-header-row">
                  <div className="ac-mockup-badge">
                    <ActivePlatIcon
                      size={14}
                      style={{
                        color: platformColors[selectedPlatform] || "#818CF8",
                      }}
                    />
                    <span>
                      {selectedPlatObj?.[
                        lang === "en" ? "name_en" : "name_ar"
                      ] || "Live Ad Mockup"}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "11.5px",
                      color: "#94A3B8",
                      fontWeight: "800",
                    }}
                  >
                    {lang === "en" ? "Dialect:" : "اللهجة:"}{" "}
                    {
                      structure?.dialects?.find(
                        (d) => d.id === selectedDialect,
                      )?.[lang === "en" ? "name_en" : "name_ar"]
                    }
                  </span>
                </div>

                {/* Error Output Handing */}
                {result.error ? (
                  <div
                    className="ac-mockup-card"
                    style={{ borderColor: "#EF4444" }}
                  >
                    <p
                      style={{ color: "#EF4444", margin: 0, fontWeight: "800" }}
                    >
                      {result.error}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {/* Hook Line Card */}
                    {(activeAngleTab === "hook" ||
                      activeAngleTab === "all") && (
                      <div className="ac-mockup-card">
                        <div className="ac-card-label-row">
                          <h5 className="ac-card-title">
                            <Flame size={16} />
                            <span>
                              {lang === "en"
                                ? "The Hook (First 3 Seconds)"
                                : "الخطاف الترويجي (أول 3 ثوانٍ)"}
                            </span>
                          </h5>
                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                lang === "en" ? result.hook_en : result.hook_ar,
                                lang === "en" ? "Hook" : "الخطاف",
                              )
                            }
                            className="ac-copy-btn"
                          >
                            <Copy size={13} />
                            <span>
                              {lang === "en" ? "Copy Hook" : "نسخ الخطاف"}
                            </span>
                          </button>
                        </div>
                        <div
                          className="ac-card-body"
                          style={{ fontSize: "15px", fontWeight: "900" }}
                        >
                          "{lang === "en" ? result.hook_en : result.hook_ar}"
                        </div>
                      </div>
                    )}

                    {/* Full Script Card */}
                    {(activeAngleTab === "script" ||
                      activeAngleTab === "all") && (
                      <div className="ac-mockup-card">
                        <div className="ac-card-label-row">
                          <h5
                            className="ac-card-title"
                            style={{ color: "#10B981" }}
                          >
                            <FileText size={16} />
                            <span>
                              {lang === "en"
                                ? "Full Ad Script Body"
                                : "السكربت الإعلاني الكامل"}
                            </span>
                          </h5>
                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                lang === "en"
                                  ? result.script_en
                                  : result.script_ar,
                                lang === "en"
                                  ? "Full Script"
                                  : "السكربت الكامل",
                              )
                            }
                            className="ac-copy-btn"
                          >
                            <Copy size={13} />
                            <span>
                              {lang === "en" ? "Copy Script" : "نسخ السكربت"}
                            </span>
                          </button>
                        </div>
                        <div className="ac-card-body">
                          {lang === "en" ? result.script_en : result.script_ar}
                        </div>
                      </div>
                    )}

                    {/* CTA Card */}
                    {(activeAngleTab === "cta" || activeAngleTab === "all") && (
                      <div className="ac-mockup-card">
                        <div className="ac-card-label-row">
                          <h5
                            className="ac-card-title"
                            style={{ color: "#F59E0B" }}
                          >
                            <Zap size={16} />
                            <span>
                              {lang === "en"
                                ? "Call To Action (CTA)"
                                : "نداء اتخاذ الإجراء (CTA)"}
                            </span>
                          </h5>
                          <button
                            type="button"
                            onClick={() =>
                              copyText(
                                lang === "en" ? result.cta_en : result.cta_ar,
                                "CTA",
                              )
                            }
                            className="ac-copy-btn"
                          >
                            <Copy size={13} />
                            <span>
                              {lang === "en" ? "Copy CTA" : "نسخ الإجراء"}
                            </span>
                          </button>
                        </div>
                        <div
                          className="ac-card-body"
                          style={{ fontSize: "15px", fontWeight: "900" }}
                        >
                          {lang === "en" ? result.cta_en : result.cta_ar}
                        </div>
                      </div>
                    )}

                    {/* 5 Alternative Angles Card */}
                    {(activeAngleTab === "angles" ||
                      activeAngleTab === "all") &&
                      result.ad_angles &&
                      result.ad_angles.length > 0 && (
                        <div className="ac-mockup-card">
                          <h5
                            className="ac-card-title"
                            style={{ color: "#818CF8", marginBottom: "10px" }}
                          >
                            <Target size={16} />
                            <span>
                              {lang === "en"
                                ? "5 Alternative Ad Angles to Test"
                                : "5 زوايا إعلانية بديلة للاختبار والتوسع"}
                            </span>
                          </h5>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            {result.ad_angles.map((angle, i) => (
                              <div
                                key={i}
                                style={{
                                  background: "rgba(15, 23, 42, 0.7)",
                                  padding: "12px 14px",
                                  borderRadius: "12px",
                                  border: "1px solid rgba(255, 255, 255, 0.05)",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: "900",
                                    fontSize: "13px",
                                    color: "#818CF8",
                                    marginBottom: "3px",
                                  }}
                                >
                                  {i + 1}.{" "}
                                  {lang === "en"
                                    ? angle.angle_en
                                    : angle.angle_ar}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#CBD5E1",
                                    lineHeight: "1.6",
                                  }}
                                >
                                  {lang === "en"
                                    ? angle.desc_en
                                    : angle.desc_ar}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* FLOATING TACTICAL ACTION DOCK */}
              <div className="ac-tactical-dock">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      lang === "en" ? result?.script_en : result?.script_ar,
                      lang === "en" ? "Full Script" : "السكربت الكامل",
                    )
                  }
                  className="ac-dock-btn"
                >
                  <Copy size={15} />
                  <span>{lang === "en" ? "Copy Script" : "نسخ السكربت"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="ac-dock-btn"
                >
                  <Zap size={15} style={{ color: "#10B981" }} />
                  <span>
                    {lang === "en" ? "Re-Assemble Ad" : "إعادة تركيب الإعلان"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="ac-dock-btn primary"
                >
                  <Wrench size={15} />
                  <span>{lang === "en" ? "Edit Brief" : "تعديل التكليف"}</span>
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ToolDashboardLayout>
  );
}

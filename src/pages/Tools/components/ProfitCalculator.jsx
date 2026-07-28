import React, { useState, useEffect } from "react";
import { useApp } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { getProfitScenarioTemplate } from "../../../services/contentDbService";
import { parseTemplate } from "../../../utils/templateParser";
import { CURRENCY_SYMBOLS } from "../../../data/database";
import AnalysisModeSelector from "../../../components/common/AnalysisModeSelector";
import { dispatchLiveAiAnalysis } from "../../../services/liveAiService";
import ToolDashboardLayout from "./ToolDashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  DollarSign,
  ShoppingBag,
  Tag,
  Target,
  TrendingUp,
  Percent,
  MousePointerClick,
  CreditCard,
  Calculator,
  TrendingDown,
  Users,
  ShoppingCart,
  PieChart,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  Calendar,
  Zap,
  FileText,
  Compass,
  Award,
  Layers,
} from "lucide-react";
import "./ProfitCalculatorCommandCenter.css";

// Typewriter component for Live AI streaming output
function TypewriterText({ text, speed = 12 }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    if (!text) return;

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div
      style={{
        color: "#F8FAFC",
        fontSize: "14px",
        lineHeight: "1.8",
        whiteSpace: "pre-wrap",
      }}
    >
      {displayedText.split("\n").map((line, idx) => (
        <p key={idx} style={{ margin: "0 0 6px 0" }}>
          {line.replace(/\*/g, "")}
        </p>
      ))}
    </div>
  );
}

export default function ProfitCalculator({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const lang = state.language || "ar";
  const isRtl = lang === "ar";
  const currencySymbol =
    (CURRENCY_SYMBOLS[lang] && CURRENCY_SYMBOLS[lang][state.currency]) ||
    CURRENCY_SYMBOLS["ar"][state.currency] ||
    "$";

  // -- Mode Switcher ('daily' | 'monthly_target') --
  const [activeMode, setActiveMode] = useState("daily");
  const [focusedNode, setFocusedNode] = useState(1);
  const [analysisMode, setAnalysisMode] = useState("fast"); // 'fast' | 'live'

  // -- Product Economics Inputs (Shared) --
  const [salePrice, setSalePrice] = useState(49);
  const [productCost, setProductCost] = useState(15);

  // -- Daily Ad Campaign Inputs --
  const [dailyBudget, setDailyBudget] = useState(100);
  const [cpc, setCpc] = useState(0.8);
  const [cvr, setCvr] = useState(2.5); // 2.5%

  // -- AI State (Daily Mode) --
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [aiInsightsMode, setAiInsightsMode] = useState("fast");

  // -- Target-Driven Monthly Inputs (Monthly Mode) --
  const [monthlyBudget, setMonthlyBudget] = useState(3000);
  const [targetMonthlyProfit, setTargetMonthlyProfit] = useState(5000);
  const [customNotes, setCustomNotes] = useState("");
  const [isGeneratingMonthly, setIsGeneratingMonthly] = useState(false);
  const [monthlyPlanResult, setMonthlyPlanResult] = useState(null);

  // -- Accordion State --
  const [openAccordions, setOpenAccordions] = useState({ 0: true, 1: false });

  const toggleAccordion = (idx) => {
    setOpenAccordions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ----------------------------------------------------
  // ADVANCED CALCULATIONS (UNTOUCHED LOGIC)
  // ----------------------------------------------------
  const dailyVisitors = cpc > 0 ? dailyBudget / cpc : 0;
  const dailySales = dailyVisitors * (cvr / 100);

  const dailyRevenue = dailySales * salePrice;
  const dailyProductCosts = dailySales * productCost;

  // Cost Per Acquisition = Ad Spend / Sales
  const calculatedCpa = dailySales > 0 ? dailyBudget / dailySales : 0;

  const totalDailyCosts = dailyProductCosts + dailyBudget;
  const netProfitDaily = dailyRevenue - totalDailyCosts;

  const profitMargin =
    dailyRevenue > 0 ? (netProfitDaily / dailyRevenue) * 100 : 0;
  const roas = dailyBudget > 0 ? dailyRevenue / dailyBudget : 0;

  // Formatting helpers
  const fmtCurrency = (val) => `${currencySymbol} ${val.toFixed(2)}`;
  const fmtNumber = (val) => val.toFixed(0);

  // SVG Circular Arc Ring Smooth Fill Animation (from 0 to actual value)
  const strokeColor = roas >= 2 ? "#10B981" : roas >= 1 ? "#3B82F6" : "#EF4444";
  const ringDashArray = 565.48;
  const targetOffset =
    roas >= 2 ? 565.48 * 0.25 : roas >= 1 ? 565.48 * 0.5 : 565.48 * 0.75;
  const [animatedOffset, setAnimatedOffset] = useState(ringDashArray);

  useEffect(() => {
    setAnimatedOffset(ringDashArray);
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 60);
    return () => clearTimeout(timer);
  }, [roas, targetMonthlyProfit, activeMode]);

  // ----------------------------------------------------
  // DAILY SIMULATION HANDLER
  // ----------------------------------------------------
  const handleAnalyze = async () => {
    setIsGenerating(true);
    setAiInsights("");
    setAiInsightsMode(analysisMode);

    try {
      if (analysisMode === "live") {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: "profit-calculator",
          inputs: {
            salePrice,
            productCost,
            dailyBudget,
            cpc,
            cvr,
            roas: roas.toFixed(2),
            profitMargin: profitMargin.toFixed(1),
            netProfitDaily: netProfitDaily.toFixed(2),
          },
          context: { niche: state.niche, user: state.user },
          lang,
        });
        setAiInsights(liveResult);
        dispatch({
          type: "SAVE_TOOL_RESULT",
          toolId: "profit-calculator",
          data: {
            salePrice,
            productCost,
            dailyBudget,
            cpc,
            cvr,
            roas,
            profitMargin,
            netProfitDaily,
            result: liveResult,
            mode: "live",
          },
        });
        toast(
          lang === "en"
            ? "Live AI Financial Insights generated!"
            : "تم توليد التحليل المالي بالذكاء الاصطناعي الحي!",
          "success",
        );
      } else {
        await new Promise((r) => setTimeout(r, 400));

        let scenarioId = "profitable_general";
        if (roas >= 2 && profitMargin >= 30) {
          scenarioId = "profitable_scale";
        } else if (roas >= 2 && profitMargin > 0 && profitMargin < 30) {
          scenarioId = "profitable_low_margin";
        } else if (roas >= 1 && roas < 2 && cvr >= 2) {
          scenarioId = "breakeven_high_cvr";
        } else if (roas < 1 && cvr < 1) {
          scenarioId = "losing_low_cvr";
        } else if (
          roas < 1 &&
          cvr >= 1 &&
          salePrice - productCost < salePrice * 0.2
        ) {
          scenarioId = "losing_pricing_error";
        } else if (roas < 1 && cvr >= 1) {
          scenarioId = "losing_high_cpc";
        } else if (netProfitDaily < 0) {
          scenarioId = "losing_general";
        }

        const templateData = await getProfitScenarioTemplate(scenarioId);
        if (templateData && templateData[lang]) {
          const text = parseTemplate(templateData[lang], {
            margin: profitMargin.toFixed(1),
            roas: roas.toFixed(2),
            cvr: cvr.toFixed(1),
            cpc: cpc.toFixed(2),
            salePrice: salePrice.toFixed(2),
            productCost: productCost.toFixed(2),
          });
          setAiInsights(text);
          dispatch({
            type: "SAVE_TOOL_RESULT",
            toolId: "profit-calculator",
            data: {
              salePrice,
              productCost,
              dailyBudget,
              cpc,
              cvr,
              roas,
              profitMargin,
              netProfitDaily,
              result: text,
              mode: "fast",
            },
          });
          toast(
            lang === "en"
              ? "Financial analysis ready!"
              : "التحليل المالي جاهز!",
            "success",
          );
        } else {
          setAiInsights(
            lang === "en" ? "Template not found." : "لم يتم العثور على القالب.",
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast(
        lang === "en"
          ? "An error occurred during analysis."
          : "حدث خطأ أثناء التحليل.",
        "error",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ----------------------------------------------------
  // MONTHLY REVERSE-ENGINEERED STRATEGY HANDLER
  // ----------------------------------------------------
  const handleGenerateMonthlyPlan = async () => {
    setIsGeneratingMonthly(true);
    setMonthlyPlanResult(null);

    const marginPerUnit = salePrice - productCost;
    const reqOrders =
      marginPerUnit > 0
        ? Math.ceil((targetMonthlyProfit + monthlyBudget) / marginPerUnit)
        : 0;
    const reqDailyOrders = (reqOrders / 30).toFixed(1);
    const sugDailyBudget = (monthlyBudget / 30).toFixed(2);
    const maxCpa = reqOrders > 0 ? (monthlyBudget / reqOrders).toFixed(2) : 0;
    const reqRevenue = reqOrders * salePrice;

    try {
      if (analysisMode === "live") {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: "profit-calculator-monthly",
          inputs: {
            monthlyBudget,
            targetMonthlyProfit,
            salePrice,
            productCost,
            reqOrders,
            reqDailyOrders,
            sugDailyBudget,
            maxCpa,
            customNotes,
          },
          context: { niche: state.niche, user: state.user },
          lang,
        });

        const planObj = {
          reqOrders,
          reqDailyOrders,
          sugDailyBudget,
          maxCpa,
          reqRevenue,
          aiStrategy: liveResult,
          mode: "live",
        };

        setMonthlyPlanResult(planObj);
        dispatch({
          type: "SAVE_TOOL_RESULT",
          toolId: "profit-calculator-monthly",
          data: planObj,
        });
        toast(
          lang === "en"
            ? "Strategic Monthly Plan generated!"
            : "تم صياغة الخطة المالية الاستراتيجية الشهريّة بنجاح!",
          "success",
        );
      } else {
        await new Promise((r) => setTimeout(r, 600));

        let aiText =
          lang === "en"
            ? `### Monthly Strategic Execution Plan\n\n- Target Net Profit: ${currencySymbol} ${targetMonthlyProfit.toLocaleString()}\n- Monthly Ad Budget: ${currencySymbol} ${monthlyBudget.toLocaleString()}\n- Required Orders: ${reqOrders} orders (${reqDailyOrders} orders/day)\n- Max Allowable CPA: ${currencySymbol} ${maxCpa} per order\n- Daily Ad Spend Limit: ${currencySymbol} ${sugDailyBudget}/day\n\nStrategic Recommendations:\n1. Maintain your CPA strictly below ${currencySymbol} ${maxCpa} to achieve your profit target of ${currencySymbol} ${targetMonthlyProfit.toLocaleString()}.\n2. Optimize your landing page CVR to at least 2.5% to reduce acquisition costs.\n3. Implement post-purchase up-sells (Order Bumps) to increase your Average Order Value (AOV) above ${currencySymbol} ${salePrice.toFixed(2)}.`
            : `### الخطة الماليّة والتنفيذيّة لتحقيق الهدف الشهري\n\n- صافي الربح المستهدف: ${currencySymbol} ${targetMonthlyProfit.toLocaleString()}\n- ميزانية الإعلانات الشهرية: ${currencySymbol} ${monthlyBudget.toLocaleString()}\n- المبيعات المطلوبة: ${reqOrders} طلبية (بمعدل ${reqDailyOrders} طلب يومياً)\n- الحد الأقصى لتكلفة الاستحواذ (CPA): ${currencySymbol} ${maxCpa} لكل طلب\n- الميزانية اليومية المقترحة: ${currencySymbol} ${sugDailyBudget} يومياً\n\nتوصيات تنفيذية لتحقيق الهدف:\n1. حافظ على ألا تتجاوز تكلفة الاستحواذ (CPA) مبلغ ${currencySymbol} ${maxCpa} لضمان تحقيق صافي ربح ${currencySymbol} ${targetMonthlyProfit.toLocaleString()}.\n2. ارفع معدل التحويل (CVR) بصفحة الهبوط ليصل إلى 2.5% على الأقل لخفض تكلفة العميل.\n3. أضف عروضاً مكملة (Order Bumps) لزيادة متوسط قيمة الطلب فوق ${currencySymbol} ${salePrice.toFixed(2)}.`;

        if (customNotes) {
          aiText += `\n\n---\nCustom Business Constraints: ${customNotes}`;
        }

        const planObj = {
          reqOrders,
          reqDailyOrders,
          sugDailyBudget,
          maxCpa,
          reqRevenue,
          aiStrategy: aiText,
          mode: "fast",
        };

        setMonthlyPlanResult(planObj);
        dispatch({
          type: "SAVE_TOOL_RESULT",
          toolId: "profit-calculator-monthly",
          data: planObj,
        });
        toast(
          lang === "en"
            ? "Strategic Monthly Plan generated!"
            : "تم صياغة الخطة المالية الاستراتيجية الشهريّة بنجاح!",
          "success",
        );
      }
    } catch (error) {
      console.error(error);
      toast(
        lang === "en"
          ? "Failed to generate monthly plan"
          : "فشل توليد الخطة الشهرية",
        "error",
      );
    } finally {
      setIsGeneratingMonthly(false);
    }
  };

  const knowledgeSections = [
    {
      icon: (
        <ShieldCheck size={18} style={{ color: "#3B82F6", flexShrink: 0 }} />
      ),
      title:
        lang === "en"
          ? "Media Buying Secrets"
          : "أسرار الميديا بايينج المتقدمة",
      items: [
        lang === "en"
          ? "A small 1% increase in CVR can double your net profit without increasing ad budget."
          : "زيادة طفيفة بنسبة 1% في معدل التحويل (CVR) قد تضاعف صافي ربحك بدون زيادة ميزانية الإعلانات.",
        lang === "en"
          ? "ROAS below 2.0 often means you are losing money after product costs. Always track Net Profit."
          : "عائد الإعلانات (ROAS) أقل من 2.0 يعني غالباً أنك تخسر بعد خصم تكلفة المنتج. راقب دائماً صافي الربح.",
        lang === "en"
          ? "Increase your Sale Price or add Order Bumps to easily afford higher CPCs."
          : "ارفع سعر البيع أو أضف منتجات مكملة (Order Bumps) لتتمكن من تحمل تكلفة نقرة (CPC) أعلى والتغلب على المنافسين.",
      ],
    },
    {
      icon: (
        <TrendingDown size={18} style={{ color: "#EF4444", flexShrink: 0 }} />
      ),
      title:
        lang === "en" ? "Cost & Funnel Control" : "التحكم في التكاليف والمسار",
      items: [
        lang === "en"
          ? "High CPC means your ad creative is weak or targeting is too narrow."
          : "ارتفاع سعر النقرة (CPC) يعني أن الإعلان ضعيف (Creative) أو الاستهداف ضيق جداً.",
        lang === "en"
          ? "Low CVR means your landing page lacks trust, speed, or a strong offer."
          : "انخفاض معدل التحويل (CVR) يعني أن صفحة الهبوط تفتقر للثقة، السرعة، أو العرض القوي.",
        lang === "en"
          ? "Never rely solely on ROAS. A high ROAS with tiny volume does not scale a business."
          : "لا تعتمد على الـ ROAS فقط. عائد مرتفع مع حجم مبيعات ضعيف لا يبني مشروعاً كبيراً.",
      ],
    },
  ];

  return (
    <ToolDashboardLayout
      id="profit-calculator"
      title={
        lang === "en"
          ? "3D Financial Control Studio"
          : "منصة التحكم والاستوديو المالي الرقمي"
      }
      subtitle={
        lang === "en"
          ? "Interactive 3D HUD floating canvas for real-time daily profit simulation and reverse-engineered monthly strategy."
          : "واجهة تفاعلية ثلاثية الأبعاد لحساب وتوقع الأرباح اليومية والتخطيط العكسي للأهداف الشهرية."
      }
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="10 - 20"
    >
      <div className="pcc-3d-canvas" dir={isRtl ? "rtl" : "ltr"}>
        {/* ═══════════════ TOP GLASS MODE BAR WITH SLIDING PILL ═══════════════ */}
        <div className="pcc-3d-top-bar-wrap">
          <div className="pcc-3d-top-bar">
            <button
              type="button"
              className={`pcc-3d-tab-btn ${activeMode === "daily" ? "active" : ""}`}
              onClick={() => setActiveMode("daily")}
            >
              <Zap size={16} style={{ flexShrink: 0 }} />
              <span>
                {lang === "en" ? "Daily Funnel Engine" : "المحاكاة اليومية"}
              </span>
              {activeMode === "daily" && (
                <motion.div
                  layoutId="activeModePill"
                  className="pcc-active-pill-bg"
                  style={{
                    left: isRtl ? "auto" : 6,
                    right: isRtl ? 6 : "auto",
                    width: "48%",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>

            <button
              type="button"
              className={`pcc-3d-tab-btn ${activeMode === "monthly_target" ? "active" : ""}`}
              onClick={() => setActiveMode("monthly_target")}
            >
              <Target size={16} style={{ flexShrink: 0 }} />
              <span>
                {lang === "en"
                  ? "Monthly Goal Planner"
                  : "التخطيط بالهدف الشهري"}
              </span>
              {activeMode === "monthly_target" && (
                <motion.div
                  layoutId="activeModePill"
                  className="pcc-active-pill-bg"
                  style={{
                    left: isRtl ? 6 : "auto",
                    right: isRtl ? "auto" : 6,
                    width: "48%",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* ═══════════════ HERO CORE CIRCULAR SVG RING (SMOOTH FILL FROM 0 TO ACTUAL VALUE) ═══════════════ */}
        <div className="pcc-3d-core-stage">
          <div className="pcc-3d-ring-container">
            <svg className="pcc-3d-svg-ring" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={ringDashArray}
                strokeDashoffset={animatedOffset}
                strokeLinecap="round"
                style={{
                  transition:
                    "stroke-dashoffset 3.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.8s ease",
                }}
              />
            </svg>

            <div className="pcc-3d-core-center">
              <span className="pcc-3d-core-label">
                {activeMode === "daily"
                  ? lang === "en"
                    ? "Daily Net Profit"
                    : "صافي الربح اليومي"
                  : lang === "en"
                    ? "Target Monthly Profit"
                    : "الهدف الشهري"}
              </span>

              <div
                className={`pcc-3d-profit-val ${netProfitDaily >= 0 ? "positive" : "negative"}`}
              >
                {activeMode === "daily" ? (
                  <span>
                    {netProfitDaily < 0 ? "-" : ""}
                    {currencySymbol}
                    {Math.abs(netProfitDaily).toFixed(2)}
                  </span>
                ) : (
                  <span>
                    {currencySymbol}
                    {targetMonthlyProfit.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="pcc-3d-sub-badges">
                <span className="pcc-3d-badge">ROAS: {roas.toFixed(2)}x</span>
                <span className="pcc-3d-badge">
                  Margin: {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ RADIAL ORBITAL INPUT FLOATING CARDS (HORIZONTAL MATRIX) ═══════════════ */}
        <div className="pcc-3d-nodes-grid">
          {/* NODE 1: ECONOMICS & PRODUCT */}
          <motion.div
            className={`pcc-3d-node-card ${focusedNode === 1 ? "focused" : ""}`}
            onClick={() => setFocusedNode(1)}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="pcc-3d-node-header">
              <div className="pcc-3d-node-icon">
                <Package size={18} />
              </div>
              <h4 className="pcc-3d-node-title">
                {lang === "en"
                  ? "Node 1: Product Economics"
                  : "المحور 1: اقتصاديات المنتج"}
              </h4>
            </div>

            <div className="pcc-input-group">
              <label className="pcc-label">
                <Tag size={13} style={{ flexShrink: 0 }} />
                <span>{lang === "en" ? "Sale Price" : "سعر البيع"}</span>
              </label>
              <div className="pcc-input-wrap">
                <span className="pcc-input-symbol prefix">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="pcc-input has-prefix"
                />
              </div>
            </div>

            <div className="pcc-input-group">
              <label className="pcc-label">
                <ShoppingBag size={13} style={{ flexShrink: 0 }} />
                <span>{lang === "en" ? "Product Cost" : "تكلفة المنتج"}</span>
              </label>
              <div className="pcc-input-wrap">
                <span className="pcc-input-symbol prefix">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={productCost}
                  onChange={(e) => setProductCost(Number(e.target.value))}
                  className="pcc-input has-prefix"
                />
              </div>
            </div>
          </motion.div>

          {/* NODE 2: TRAFFIC ENGINE */}
          <motion.div
            className={`pcc-3d-node-card ${focusedNode === 2 ? "focused green" : ""}`}
            onClick={() => setFocusedNode(2)}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="pcc-3d-node-header">
              <div className="pcc-3d-node-icon green">
                <CreditCard size={18} />
              </div>
              <h4 className="pcc-3d-node-title">
                {lang === "en"
                  ? "Node 2: Traffic Engine"
                  : "المحور 2: محرك الإعلانات"}
              </h4>
            </div>

            <div className="pcc-input-group">
              <label className="pcc-label green">
                <CreditCard size={13} style={{ flexShrink: 0 }} />
                <span>
                  {lang === "en" ? "Daily Ad Budget" : "الميزانية اليومية"}
                </span>
              </label>
              <div className="pcc-input-wrap">
                <span className="pcc-input-symbol prefix">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="pcc-input green has-prefix"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div className="pcc-input-group">
                <label className="pcc-label green">
                  <MousePointerClick size={13} style={{ flexShrink: 0 }} />
                  <span>{lang === "en" ? "CPC" : "النقرة"}</span>
                </label>
                <div className="pcc-input-wrap">
                  <span className="pcc-input-symbol prefix">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    value={cpc}
                    onChange={(e) => setCpc(Number(e.target.value))}
                    className="pcc-input green has-prefix"
                  />
                </div>
              </div>

              <div className="pcc-input-group">
                <label className="pcc-label green">
                  <Percent size={13} style={{ flexShrink: 0 }} />
                  <span>{lang === "en" ? "CVR" : "التحويل"}</span>
                </label>
                <div className="pcc-input-wrap">
                  <input
                    type="number"
                    step="0.1"
                    value={cvr}
                    onChange={(e) => setCvr(Number(e.target.value))}
                    className="pcc-input green has-suffix"
                  />
                  <span className="pcc-input-symbol suffix">%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* NODE 3: MONTHLY GOAL & CLIENT NOTES */}
          <motion.div
            className={`pcc-3d-node-card ${focusedNode === 3 ? "focused" : ""}`}
            onClick={() => setFocusedNode(3)}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="pcc-3d-node-header">
              <div className="pcc-3d-node-icon">
                <Target size={18} />
              </div>
              <h4 className="pcc-3d-node-title">
                {lang === "en"
                  ? "Node 3: Goal & Constraints"
                  : "المحور 3: الهدف والقيود"}
              </h4>
            </div>

            {activeMode === "monthly_target" ? (
              <>
                <div className="pcc-input-group">
                  <label className="pcc-label">
                    <Target size={13} style={{ flexShrink: 0 }} />
                    <span>
                      {lang === "en"
                        ? "Target Monthly Profit"
                        : "الهدف الشهري الربحي"}
                    </span>
                  </label>
                  <div className="pcc-input-wrap">
                    <span className="pcc-input-symbol prefix">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={targetMonthlyProfit}
                      onChange={(e) =>
                        setTargetMonthlyProfit(Number(e.target.value))
                      }
                      className="pcc-input has-prefix"
                    />
                  </div>
                </div>

                <div className="pcc-input-group">
                  <label className="pcc-label">
                    <FileText size={13} style={{ flexShrink: 0 }} />
                    <span>
                      {lang === "en"
                        ? "Strategy Notes"
                        : "ملاحظات وتوجيهات المشروع"}
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder={
                      lang === "en"
                        ? "Enter project constraints..."
                        : "أدخل قيود المشروع..."
                    }
                    className="pcc-textarea"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="pcc-input-group">
                  <label className="pcc-label">
                    <ShoppingCart size={13} style={{ flexShrink: 0 }} />
                    <span>
                      {lang === "en" ? "Calculated CPA" : "تكلفة العميل (CPA)"}
                    </span>
                  </label>
                  <div
                    className="pcc-input"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span className="text-xs text-slate-400">
                      {lang === "en" ? "Est. CPA:" : "المحسوبة:"}
                    </span>
                    <span className="font-bold text-blue-400">
                      {fmtCurrency(calculatedCpa)}
                    </span>
                  </div>
                </div>

                <div className="pcc-input-group">
                  <label className="pcc-label">
                    <Users size={13} style={{ flexShrink: 0 }} />
                    <span>
                      {lang === "en"
                        ? "Est. Daily Visitors"
                        : "الزوار اليوميون"}
                    </span>
                  </label>
                  <div
                    className="pcc-input"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span className="text-xs text-slate-400">
                      {lang === "en" ? "Traffic:" : "الزوار:"}
                    </span>
                    <span className="font-bold text-slate-200">
                      {fmtNumber(dailyVisitors)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* ═══════════════ ANIMATED AI EXECUTION DRAWER DOCK (BOTTOM SLIDE-UP) ═══════════════ */}
        <div className="pcc-3d-drawer-dock">
          {/* Header Row: Title on one side, Generate Action Button on the other side */}
          <div className="pcc-drawer-header">
            <div className="flex items-center gap-3">
              <Bot
                size={24}
                style={{
                  color: activeMode === "daily" ? "#3B82F6" : "#10B981",
                  flexShrink: 0,
                }}
              />
              <div>
                <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>
                    {lang === "en"
                      ? "AI Financial Strategic Engine"
                      : "محرك الذكاء الاصطناعي للاستراتيجية المالية"}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeMode === "daily"
                    ? lang === "en"
                      ? "Analyze daily performance metrics"
                      : "تحليل وتوجيه الأداء اليومي للمسار الإعلاني"
                    : lang === "en"
                      ? "Reverse-engineer monthly strategic targets"
                      : "التخطيط العكسي وإعداد الخطة التنفيذية للهدف الشهري"}
                </p>
              </div>
            </div>

            <div>
              {activeMode === "daily" ? (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isGenerating}
                  className="pcc-pro-btn"
                >
                  <Sparkles size={16} style={{ flexShrink: 0 }} />
                  <span>
                    {isGenerating
                      ? lang === "en"
                        ? "Analyzing..."
                        : "جاري التحليل..."
                      : lang === "en"
                        ? "AI Business Insights"
                        : "توجيهات الذكاء الاصطناعي"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateMonthlyPlan}
                  disabled={isGeneratingMonthly}
                  className="pcc-pro-btn green"
                >
                  <Bot size={16} style={{ flexShrink: 0 }} />
                  <span>
                    {isGeneratingMonthly
                      ? lang === "en"
                        ? "Building Plan..."
                        : "جاري البناء..."
                      : lang === "en"
                        ? "Generate Strategic Plan"
                        : "توليد الخطة المالية الاستراتيجية"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Mode Selector Dedicated Glass Row - Zero Overlap! */}
          <div className="pcc-mode-selector-container">
            <AnalysisModeSelector
              mode={analysisMode}
              onChange={setAnalysisMode}
              lang={lang}
              accentColor={activeMode === "daily" ? "#3B82F6" : "#10B981"}
            />
          </div>

          {/* AI Outputs Panel Expansion (Typewriter streaming ONLY when mode === 'live') */}
          <AnimatePresence>
            {(aiInsights || monthlyPlanResult) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                style={{ overflow: "hidden" }}
              >
                {activeMode === "daily" && aiInsights && (
                  <div
                    className="pcc-insights-stage"
                    style={{ marginTop: "16px" }}
                  >
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: "800",
                        color: "#60A5FA",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        margin: "0 0 12px 0",
                      }}
                    >
                      <Sparkles
                        size={18}
                        style={{ color: "#60A5FA", flexShrink: 0 }}
                      />
                      <span>
                        {lang === "en"
                          ? "Daily Financial Analysis Result"
                          : "نتائج التحليل والتوجيه المالي اليومي"}
                      </span>
                    </h3>

                    {aiInsightsMode === "live" ? (
                      <div className="pcc-insights-body">
                        <TypewriterText text={aiInsights} speed={10} />
                      </div>
                    ) : (
                      <div className="pcc-insights-body">
                        {aiInsights.split("\n").map((line, i) => (
                          <p key={i} style={{ margin: "0 0 6px 0" }}>
                            {line.replace(/\*/g, "")}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeMode === "monthly_target" && monthlyPlanResult && (
                  <div
                    className="pcc-insights-stage green"
                    style={{ marginTop: "16px" }}
                  >
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: "800",
                        color: "#34D399",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        margin: "0 0 12px 0",
                      }}
                    >
                      <ShieldCheck
                        size={18}
                        style={{ color: "#34D399", flexShrink: 0 }}
                      />
                      <span>
                        {lang === "en"
                          ? "Reverse-Engineered Monthly Plan"
                          : "الخطة الشهريّة المحسوبة عكسياً"}
                      </span>
                    </h3>

                    <div
                      className="pcc-blueprint-grid"
                      style={{ marginBottom: "16px" }}
                    >
                      <div className="pcc-blueprint-card">
                        <span className="text-xs text-slate-400 font-semibold">
                          {lang === "en" ? "Daily Budget" : "الميزانية اليومية"}
                        </span>
                        <span
                          className="pcc-blueprint-val"
                          style={{ color: "#34D399" }}
                        >
                          {currencySymbol} {monthlyPlanResult.sugDailyBudget}
                        </span>
                      </div>
                      <div className="pcc-blueprint-card">
                        <span className="text-xs text-slate-400 font-semibold">
                          {lang === "en"
                            ? "Target Orders"
                            : "المبيعات المطلوبة"}
                        </span>
                        <span className="pcc-blueprint-val">
                          {monthlyPlanResult.reqOrders} (
                          {monthlyPlanResult.reqDailyOrders}/day)
                        </span>
                      </div>
                      <div className="pcc-blueprint-card">
                        <span className="text-xs text-slate-400 font-semibold">
                          {lang === "en" ? "Max Target CPA" : "أقصى تكلفة عميل"}
                        </span>
                        <span
                          className="pcc-blueprint-val"
                          style={{ color: "#60A5FA" }}
                        >
                          {currencySymbol} {monthlyPlanResult.maxCpa}
                        </span>
                      </div>
                    </div>

                    {monthlyPlanResult.mode === "live" ? (
                      <div className="pcc-insights-body">
                        <TypewriterText
                          text={monthlyPlanResult.aiStrategy}
                          speed={10}
                        />
                      </div>
                    ) : (
                      <div className="pcc-insights-body">
                        {monthlyPlanResult.aiStrategy
                          .split("\n")
                          .map((line, i) => (
                            <p key={i} style={{ margin: "0 0 6px 0" }}>
                              {line.replace(/\*/g, "")}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drawer Accordions */}
          <div className="pcc-drawer-accordions">
            {knowledgeSections.map((sec, idx) => {
              const isOpen = openAccordions[idx];
              return (
                <div key={idx} className="pcc-drawer-accordion-item">
                  <div
                    className="pcc-drawer-accordion-header"
                    onClick={() => toggleAccordion(idx)}
                  >
                    <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
                      {sec.icon}
                      <span>{sec.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp
                        size={16}
                        style={{ color: "#94A3B8", flexShrink: 0 }}
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        style={{ color: "#94A3B8", flexShrink: 0 }}
                      />
                    )}
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ padding: "0 20px 16px 20px" }}
                      >
                        <div className="flex flex-col gap-2 mt-2">
                          {sec.items.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed"
                            >
                              <CheckCircle2
                                size={14}
                                style={{
                                  color: "#3B82F6",
                                  flexShrink: 0,
                                  margin: "2px",
                                }}
                              />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolDashboardLayout>
  );
}

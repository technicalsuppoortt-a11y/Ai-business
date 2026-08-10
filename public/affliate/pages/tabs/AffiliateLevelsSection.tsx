// AffiliateLevelsSection.tsx
// Pure, focused page for Affiliate Level tracking and comparison.
// All sales thresholds are stored in USD base, displayed in the user's active currency.
// Currency changes trigger instant re-calculation via fmtMoney and CURRENT_RATES.
import React, { useMemo } from "react";
import {
  useAppState,
  computeUserLevel,
  computeNextLevel,
  computeFinalCommission,
  computeLevelProgress,
  CURRENT_RATES,
  CURRENCY_SYMBOLS,
} from "../../context/StateContext";
import type { AffiliateLevel } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { LevelIcon } from "../../components/LevelIcon";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  ChevronDown,
  Lock,
  CheckCircle2,
  Award,
  Shield,
  Crown,
  Gem,
  ArrowUpRight,
  Percent,
  Target,
} from "lucide-react";

// ---------- Animation Variants ----------
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 14 } },
} as const;

// ---------- Helper: convert USD threshold to active display currency ----------
function fmtThreshold(usdAmount: number | null, currency: string): string {
  if (usdAmount === null) return "\u221e"; // infinity symbol
  const rate = CURRENT_RATES[currency] || 1;
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  const converted = usdAmount * rate;
  if (converted >= 1_000_000) {
    return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
  } else if (converted >= 1_000) {
    return `${symbol}${(converted / 1_000).toFixed(0)}K`;
  }
  return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// ---------- Level icon helper ----------
function getLevelIcon(level: AffiliateLevel | null, className = "w-6 h-6") {
  if (!level) return <Shield className={className} />;
  const id = (level.id || "").toLowerCase();
  if (id === "diamond") return <Gem className={className} />;
  if (id === "gold") return <Crown className={className} />;
  if (id === "silver") return <Award className={className} />;
  return <Shield className={className} />;
}

// ---------- Main Component ----------
export default function AffiliateLevelsSection() {
  const { state, fmtMoney } = useAppState();
  const { userProfile } = useAuth();

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);
  const currency = state.settings.currency || "USD";

  // ---- Dynamic affiliate levels from state (synced from Firestore) ----
  const levels = useMemo(
    () => [...(state.affiliateLevels || [])].sort((a, b) => a.order - b.order),
    [state.affiliateLevels]
  );
  const featureDefs = state.affiliateLevelSettings?.features || [];
  const reviewDays = state.affiliateLevelSettings?.reviewDurationDays || 90;

  // ---- User's total revenue in USD (stored in USD in userProfile.revenue) ----
  const totalRevenueUSD = Number(userProfile?.revenue) || 0;

  // ---- Compute current & next level (pure functions, re-run when state/currency change) ----
  const currentLevel = useMemo(() => computeUserLevel(totalRevenueUSD, levels), [totalRevenueUSD, levels]);
  const nextLevel = useMemo(() => computeNextLevel(currentLevel, levels), [currentLevel, levels]);
  const progressPct = useMemo(
    () => computeLevelProgress(totalRevenueUSD, currentLevel, nextLevel),
    [totalRevenueUSD, currentLevel, nextLevel]
  );

  const currentLevelName = currentLevel ? (isRtl ? (currentLevel.name as any)?.ar || currentLevel.name : (currentLevel.name as any)?.en || currentLevel.name) : "";
  const nextLevelName = nextLevel ? (isRtl ? (nextLevel.name as any)?.ar || nextLevel.name : (nextLevel.name as any)?.en || nextLevel.name) : "";

  // ---- Remaining USD needed, displayed in active currency via CURRENT_RATES (live) ----
  const remainingUSD = nextLevel ? Math.max(0, nextLevel.minSalesUSD - totalRevenueUSD) : 0;
  const remainingFormatted = nextLevel ? fmtThreshold(remainingUSD, currency) : null;

  // ---- Retention countdown: rolling 90-day window ----
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysIntoWindow = dayOfYear % reviewDays;
  const daysRemaining = reviewDays - daysIntoWindow;

  // ---- Example package for commission illustration ----
  const examplePackage = state.packages.find((p) => p.active) || state.packages[0];
  const exampleBase = examplePackage?.commissionPercentage ?? 15;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ===== PAGE HEADER ===== */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-indigo-500" />
            <span>{t("مستويات الشراكة", "Affiliate Levels")}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t(
              "تابع تقدمك نحو المستوى التالي وقارن المزايا بين كل مستوى",
              "Track your progress to the next level and compare level benefits"
            )}
          </p>
        </div>
      </motion.div>

      {/* ===== TOP PROGRESS HERO CARD ===== */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-3xl overflow-hidden border shadow-2xl"
        style={{
          borderColor: currentLevel ? `${currentLevel.color}44` : "var(--line)",
          boxShadow: currentLevel ? `0 0 40px ${currentLevel.color}22` : undefined,
          backgroundColor: "var(--bg-2)",
        }}
      >
        {/* Decorative glow blob */}
        {currentLevel && (
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: currentLevel.color }}
          />
        )}

        <div className="relative z-10 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Left: Current Level + Sales */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: currentLevel ? `${currentLevel.color}22` : "#e2e8f0",
                  border: `2px solid ${currentLevel?.color || "#94a3b8"}55`,
                  boxShadow: currentLevel ? `0 0 24px ${currentLevel.color}55` : undefined,
                }}
              >
                <LevelIcon name={currentLevel?.icon || "Shield"} className="w-8 h-8" style={{ color: currentLevel?.color || "#64748b" }} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {t("مستواك الحالي", "Your Current Level")}
                </p>
                <h3
                  className="text-2xl font-extrabold mt-0.5"
                  style={{ color: currentLevel?.color || "var(--txt)" }}
                >
                  {currentLevel ? currentLevelName : t("برونز", "Bronze")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("مكافأة العمولة", "Commission Bonus")}:{" "}
                  <span className="font-bold" style={{ color: currentLevel?.color }}>
                    +{currentLevel?.bonusPercentage ?? 0}%
                  </span>
                </p>
              </div>
            </div>

            {/* Total sales card */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                {t("إجمالي الإيرادات المؤكدة", "Total Confirmed Revenue")}
              </p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
                {fmtMoney(totalRevenueUSD)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {t("يتحدث تلقائياً عند إغلاق الصفقات", "Auto-updates when deals close")}
              </p>
            </div>
          </div>

          {/* Right: Progress + Retention */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {nextLevel
                    ? t(
                        `للوصول: ${nextLevelName}`,
                        `Progress toward: ${nextLevelName}`
                      )
                    : t("\u2605 المستوى الأعلى", "\u2605 Top Level Achieved")}
                </span>
                <span
                  className="text-xs font-extrabold tabular-nums"
                  style={{ color: currentLevel?.color || "#10b981" }}
                >
                  {progressPct.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: currentLevel
                      ? `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel?.color || currentLevel.color}bb)`
                      : "#10b981",
                    boxShadow: currentLevel ? `0 0 14px ${currentLevel.color}88` : undefined,
                  }}
                />
              </div>

              {/* Threshold labels */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-slate-400 tabular-nums">
                  {fmtThreshold(currentLevel?.minSalesUSD ?? 0, currency)}
                </span>
                {nextLevel && (
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {fmtThreshold(nextLevel.minSalesUSD, currency)}
                  </span>
                )}
              </div>

              {/* Remaining to next level */}
              {remainingFormatted && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 text-xs">
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    {t("المتبقي للترقية", "Remaining to upgrade")}:{" "}
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {remainingFormatted}
                    </span>{" "}
                    {t(
                      `لفتح ${nextLevelName}`,
                      `to unlock ${nextLevelName}`
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Retention countdown */}
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
              <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {t("دورة التقييم الحالية", "Current Evaluation Period")}
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-500 mt-1 leading-relaxed">
                  {t(
                    `تنتهي خلال ${daysRemaining} يوم — حافظ على مستوى مبيعاتك للاحتفاظ بمستوى ${currentLevelName}!`,
                    `Ends in ${daysRemaining} days — keep your sales volume to maintain ${currentLevelName} status!`
                  )}
                </p>
                <p className="text-[10px] text-amber-400 dark:text-amber-600 mt-1">
                  {t(`دورة المراجعة: كل ${reviewDays} يوم`, `Review cycle: every ${reviewDays} days`)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== LEVELS COMPARISON MATRIX ===== */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          {t("مقارنة شاملة للمستويات", "Full Level Comparison")}
        </h3>

        <div
          className={`grid gap-4 ${
            levels.length <= 2
              ? "grid-cols-2"
              : levels.length === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          }`}
        >
          {levels.map((level) => {
            const isCurrentLevel = currentLevel?.id === level.id;
            const exampleFinal = computeFinalCommission(exampleBase, level.bonusPercentage);

            return (
              <motion.div
                key={level.id}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative rounded-[2rem] border-[1.5px] overflow-hidden transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl"
                style={{
                  borderColor: isCurrentLevel ? level.color : "var(--line)",
                  boxShadow: isCurrentLevel
                    ? `0 0 40px ${level.color}33, 0 8px 32px rgba(0,0,0,0.06)`
                    : "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                {/* Subtle gradient background based on level color */}
                <div 
                  className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${level.color}, transparent)` }}
                />
                {/* "Your Level" banner */}
                {isCurrentLevel && (
                  <div
                    className="text-center py-1.5 text-[10px] font-extrabold tracking-widest uppercase"
                    style={{ backgroundColor: level.color, color: "#fff" }}
                  >
                    \u2726 {t("مستواك الحالي", "Your Level")} \u2726
                  </div>
                )}

                <div className={`p-6 flex flex-col flex-1 relative ${isCurrentLevel ? "" : "pt-6"}`}>
                  {/* Level header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                      style={{
                        backgroundColor: `${level.color}15`,
                        border: `1px solid ${level.color}33`,
                        boxShadow: `inset 0 2px 10px ${level.color}20`
                      }}
                    >
                      <LevelIcon name={level.icon} className="w-7 h-7" style={{ color: level.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-black text-xl truncate tracking-tight"
                        style={{ color: isCurrentLevel ? level.color : "var(--txt)" }}
                      >
                        {isRtl ? (level.name?.ar || level.name as any) : (level.name?.en || level.name as any)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5 font-medium">
                        {fmtThreshold(level.minSalesUSD, currency)}
                        {level.maxSalesUSD !== null
                          ? ` \u2013 ${fmtThreshold(level.maxSalesUSD, currency)}`
                          : t(" فأكثر", " +")}
                      </p>
                    </div>
                  </div>

                  {/* Bonus badge */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black mb-5 self-start shadow-sm"
                    style={{ backgroundColor: `${level.color}15`, color: level.color, border: `1px solid ${level.color}30` }}
                  >
                    <Percent className="w-3.5 h-3.5" strokeWidth={3} />
                    {t(`مكافأة: +${level.bonusPercentage}%`, `Bonus: +${level.bonusPercentage}%`)}
                  </div>

                  {/* Commission example */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-800/60">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                      {t("مثال: باقة أساسها ", "Example: ")}
                      {exampleBase}%
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {exampleBase}%{" "}
                      <span className="text-slate-400">
                        + {level.bonusPercentage}%
                      </span>
                      {" = "}
                      <span className="font-extrabold text-sm" style={{ color: level.color }}>
                        {exampleFinal}%
                      </span>
                    </p>
                  </div>

                  {/* Feature checklist */}
                  {featureDefs.length > 0 && (
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {t("المزايا", "Features")}
                      </p>
                      {featureDefs.map((feat) => {
                        const isUnlocked = level.unlockedFeatureKeys.includes(feat.key);
                        return (
                          <div key={feat.key} className="flex items-center gap-2">
                            {isUnlocked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                            )}
                            <span
                              className={`text-[11px] leading-snug flex items-center gap-1.5 ${
                                isUnlocked
                                  ? "text-slate-700 dark:text-slate-300"
                                  : "text-slate-400 dark:text-slate-600 line-through decoration-slate-300 dark:decoration-slate-700"
                              }`}
                            >
                              {feat.icon && (
                                <LevelIcon
                                  name={feat.icon}
                                  className={`w-3.5 h-3.5 ${isUnlocked ? "text-indigo-500" : "text-slate-400"}`}
                                />
                              )}
                              {isRtl ? (feat.name?.ar || (feat as any).label) : (feat.name?.en || (feat as any).labelEn || (feat as any).label)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ===== REVIEW POLICY INFO ===== */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-5 flex items-start gap-4"
      >
        <ChevronDown className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="text-sm space-y-1">
          <p className="font-bold text-slate-700 dark:text-slate-300">
            {t("سياسة مراجعة المستوى والتراجع التدريجي", "Level Review & Soft Downgrade Policy")}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            {t(
              `كل ${reviewDays} يوم، يتم مراجعة إجمالي مبيعاتك خلال تلك الفترة. إذا كانت المبيعات تعادل الحد الأدنى للمستوى الحالي، تحتفظ بمستواك. أما إذا انخفضت عن الحد الأدنى، يتم تخفيضك تلقائياً مستوى واحد فقط (تراجع تدريجي).`,
              `Every ${reviewDays} days, your total sales volume for that period is reviewed. If sales meet the current level's minimum threshold, your level is maintained. If sales fall below the minimum, you are automatically dropped by one level only (soft fallback — not all the way to the bottom).`
            )}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

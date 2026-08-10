import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  Tag,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  UserX,
  Globe,
  Megaphone,
  Clock,
  Coins,
  Ban,
  RefreshCw,
  Calendar,
  Sparkles,
  FileCheck,
  Filter,
  Check,
  AlertOctagon,
  Scale,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAppState, AffiliateRule, mergeRulesWithInitial } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { db, firestore } from "../../config/firebase";

export default function RulesSection() {
  const { state } = useAppState();
  const { user, userProfile } = useAuth();
  const isRtl = state?.settings?.language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(() => {
    return localStorage.getItem("partner_rules_acknowledged") === "true";
  });

  // Sync state with userProfile when Firestore updates
  useEffect(() => {
    if (userProfile?.rulesAcknowledged !== undefined) {
      setHasAcknowledged(!!userProfile.rulesAcknowledged);
    }
  }, [userProfile?.rulesAcknowledged]);

  // Dynamically load rules from state merged with initial baseline rules
  const rulesList: AffiliateRule[] = useMemo(() => {
    return mergeRulesWithInitial(state?.rules || []);
  }, [state?.rules]);

  const categories = [
    { id: "all", labelAr: `كافة القواعد (${rulesList.length})`, labelEn: `All Rules (${rulesList.length})` },
    {
      id: "prohibited",
      labelAr: `الممنوعات (${rulesList.filter((r) => r.category === "prohibited").length})`,
      labelEn: `Prohibited (${rulesList.filter((r) => r.category === "prohibited").length})`,
    },
    {
      id: "required",
      labelAr: `المتطلبات (${rulesList.filter((r) => r.category === "required").length})`,
      labelEn: `Required (${rulesList.filter((r) => r.category === "required").length})`,
    },
    {
      id: "financial",
      labelAr: `المالية والعمولات (${rulesList.filter((r) => r.category === "financial").length})`,
      labelEn: `Financial (${rulesList.filter((r) => r.category === "financial").length})`,
    },
    {
      id: "policy",
      labelAr: `العقوبات والسياسات (${rulesList.filter((r) => r.category === "policy").length})`,
      labelEn: `Policy & Penalties (${rulesList.filter((r) => r.category === "policy").length})`,
    },
  ];

  const filteredRules = useMemo(() => {
    return rulesList.filter((rule) => {
      const matchesCategory =
        selectedCategory === "all" || rule.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        rule.titleAr.toLowerCase().includes(q) ||
        rule.titleEn.toLowerCase().includes(q) ||
        (rule.descriptionAr && rule.descriptionAr.toLowerCase().includes(q)) ||
        (rule.descriptionEn && rule.descriptionEn.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [rulesList, searchQuery, selectedCategory]);

  const toggleAcknowledge = async () => {
    const nextState = !hasAcknowledged;
    setHasAcknowledged(nextState);
    localStorage.setItem("partner_rules_acknowledged", String(nextState));

    if (user?.uid) {
      setIsSubmitting(true);
      try {
        const userRef = firestore.doc(db, "users", user.uid);
        await firestore.setDoc(
          userRef,
          {
            rulesAcknowledged: nextState,
            affiliateRulesAccepted: nextState,
            rulesAcknowledgedAt: Date.now(),
          },
          { merge: true }
        );

        if (nextState) {
          toast.success(
            isRtl ? "تم تسجيل الإقرار والتعهد بنجاح! 🛡️" : "Compliance Confirmed! 🛡️",
            {
              description: isRtl
                ? "تم حفظ توثيق قراءتك وإقرارك بالالتزام بجميع قواعد منصة جو بارتنر في حسابك الرسمي."
                : "Your acknowledgment of Joe Partner affiliate rules has been saved to your account.",
              duration: 5000,
            }
          );
        } else {
          toast.info(
            isRtl ? "تم إلغاء الإقرار بالقواعد" : "Rules Acknowledgment Canceled",
            {
              description: isRtl
                ? "تنويه: الالتزام بجميع القواعد شرط أساسي للحفاظ على استمرارية حسابك واستلام العمولات."
                : "Notice: Full compliance is required to maintain active account status and payouts.",
              duration: 4000,
            }
          );
        }
      } catch (err) {
        console.error("Error saving acknowledgment to Firestore:", err);
        toast.error(
          isRtl ? "حدث خطأ أثناء حفظ الإقرار بقاعدة البيانات" : "Failed to sync acknowledgment to Firebase"
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getRuleIcon = (rule: AffiliateRule) => {
    switch (rule.id) {
      case 1:
        return Tag;
      case 2:
        return Ban;
      case 3:
        return ShieldCheck;
      case 4:
        return FileText;
      case 5:
        return AlertTriangle;
      case 6:
        return UserX;
      case 7:
        return Globe;
      case 8:
        return Megaphone;
      case 9:
        return FileCheck;
      case 10:
        return AlertOctagon;
      case 11:
        return Lock;
      case 12:
        return Coins;
      case 13:
        return Calendar;
      case 14:
        return RefreshCw;
      default:
        if (rule.category === "prohibited") return Ban;
        if (rule.category === "required") return FileCheck;
        if (rule.category === "financial") return Coins;
        return Scale;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-1 sm:px-4">
      {/* ========================================================================= */}
      {/* 1. HIGH-VISIBILITY WARNING BOX AT VERY TOP (EXACT PROMPT REQUIREMENT)     */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border-2 bg-gradient-to-r from-red-950/40 via-red-900/30 to-amber-950/30 dark:from-red-950/70 dark:via-red-900/50 dark:to-rose-950/60 border-red-500/60 dark:border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.25)]"
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 animate-pulse" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-red-600/20 text-red-500 dark:text-red-400 border border-red-500/40 shrink-0 shadow-lg shadow-red-500/10 animate-bounce">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {isRtl ? "تنبيه صارم وحازم" : "STRICT WARNING"}
              </span>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <p className="text-base sm:text-lg md:text-xl font-black text-red-600 dark:text-red-300 leading-snug tracking-tight">
              {isRtl
                ? "⚠️ مخالفة هذه القواعد قد تؤدي إلى إيقاف الحساب وإلغاء جميع العمولات المستحقة."
                : "⚠️ Violating these rules may lead to account suspension and forfeiture of all due commissions."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-[#12141c]/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isRtl ? "شروط وقواعد التسويق بالعمولة" : "Affiliate Rules & Policies"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-3xl">
            {isRtl
              ? `يرجى الاطلاع والالتزام الكامل بكافة القواعد التالية (${rulesList.length} قاعدة معتمدة) لضمان حماية واستمرارية حسابك واستلام عمولاتك المستحقة دون تأخير.`
              : `Please read and strictly abide by all ${rulesList.length} official rules below to ensure continuous account status and seamless commission payouts.`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            {isRtl ? `${rulesList.length} قاعدة معتمدة` : `${rulesList.length} Verified Rules`}
          </span>
        </div>
      </div>

      {/* Controls Bar: Search & Category Chips */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isRtl
                  ? `ابحث في القواعد ${rulesList.length}...`
                  : `Search within the ${rulesList.length} rules...`
              }
              className="w-full pl-10 rtl:pl-4 rtl:pr-10 ltr:pr-4 ltr:pl-10 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Result Count Badge */}
          <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#12141c] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <Filter className="h-3.5 w-3.5" />
            <span>
              {isRtl
                ? `عرض ${filteredRules.length} من ${rulesList.length}`
                : `Showing ${filteredRules.length} of ${rulesList.length}`}
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                    : "bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
                }`}
              >
                {isRtl ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE OFFICIAL RULES GRID / CARDS                                       */}
      {/* ========================================================================= */}
      {filteredRules.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Search className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {isRtl
              ? "لم يتم العثور على نتائج تطابق البحث."
              : "No rules match your search parameters."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="text-xs font-bold text-emerald-500 hover:underline"
          >
            {isRtl ? "إعادة ضبط التصفية" : "Reset Filters"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule, idx) => {
            const IconComp = getRuleIcon(rule);
            const isCritical = rule.severity === "critical";
            const isWarning = rule.severity === "warning";

            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 group hover:shadow-xl ${
                  isCritical
                    ? "bg-white dark:bg-[#12141c] border-red-500/30 dark:border-red-900/40 hover:border-red-500/60"
                    : isWarning
                    ? "bg-white dark:bg-[#12141c] border-amber-500/30 dark:border-amber-900/40 hover:border-amber-500/60"
                    : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
                }`}
              >
                {/* Number Badge & Category */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-black text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        {rule.id < 10 ? `0${rule.id}` : rule.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          rule.category === "prohibited"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : rule.category === "required"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : rule.category === "financial"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                        }`}
                      >
                        {isRtl ? rule.categoryAr : rule.categoryEn}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        isCritical
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : isWarning
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-emerald-500 transition-colors">
                    {isRtl ? rule.titleAr : rule.titleEn}
                  </h3>

                  {/* Description if present */}
                  {(rule.descriptionAr || rule.descriptionEn) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4">
                      {isRtl ? rule.descriptionAr : rule.descriptionEn}
                    </p>
                  )}
                </div>

                {/* Special Penalty Steps if present */}
                {rule.steps && rule.steps.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                      {isRtl ? "تسلسل عقوبات التدرج:" : "Penalties Progression:"}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {rule.steps.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black text-center"
                        >
                          {sIdx + 1}. {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACKNOWLEDGMENT / CONFIRMATION BANNER                                   */}
      {/* ========================================================================= */}
      <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white dark:bg-[#12141c] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-right">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">
              {isRtl
                ? "إقرار المسوق وتعهده بالالتزام"
                : "Affiliate Compliance Agreement"}
            </h4>
            <p className="text-xs text-slate-400">
              {isRtl
                ? "قراءتك لهذه القواعد تعني موافقتك التامة والكاملة على شروط عمل منصة جو بارتنر."
                : "Reviewing these rules constitutes your full agreement with Joe Partner platform terms."}
            </p>
          </div>
        </div>

        <button
          onClick={toggleAcknowledge}
          disabled={isSubmitting}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 ${
            hasAcknowledged
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          ) : (
            <Check className={`h-4 w-4 ${hasAcknowledged ? "opacity-100" : "opacity-40"}`} />
          )}
          {hasAcknowledged
            ? isRtl
              ? "تم تأكيد قراءة القواعد ✓"
              : "Rules Confirmed ✓"
            : isRtl
            ? "أقر بقراءة والالتزام بالقواعد"
            : "I Acknowledge & Agree to Rules"}
        </button>
      </div>
    </div>
  );
}

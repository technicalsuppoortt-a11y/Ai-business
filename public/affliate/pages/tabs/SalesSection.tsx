// SalesSection.tsx
import { useState, useRef, useEffect } from "react";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { db, firestore } from "../../config/firebase";
import { Plus, X, Trash2, AlertTriangle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import DatePicker from "../../components/DatePicker";

// ---------- LOCAL CURRENCY FUNCTIONS ----------
const CURRENCY_LIST = ["USD", "AED", "SAR", "EGP", "KWD", "QAR", "EUR", "GBP"];
const CURRENT_RATES: Record<string, number> = {
  USD: 1,
  AED: 3.6725,
  SAR: 3.75,
  EGP: 49.5,
  KWD: 0.307,
  QAR: 3.64,
  EUR: 0.92,
  GBP: 0.79,
};
const HISTORICAL_RATES: Record<string, Record<string, number>> = {
  "2026-06-25": {
    USD: 1,
    AED: 3.6725,
    SAR: 3.75,
    EGP: 48.9,
    KWD: 0.3065,
    QAR: 3.64,
    EUR: 0.925,
    GBP: 0.792,
  },
  "2026-06-28": {
    USD: 1,
    AED: 3.672,
    SAR: 3.75,
    EGP: 49.1,
    KWD: 0.3068,
    QAR: 3.64,
    EUR: 0.923,
    GBP: 0.791,
  },
  "2026-06-29": {
    USD: 1,
    AED: 3.6722,
    SAR: 3.75,
    EGP: 49.2,
    KWD: 0.307,
    QAR: 3.64,
    EUR: 0.921,
    GBP: 0.79,
  },
  "2026-06-30": {
    USD: 1,
    AED: 3.673,
    SAR: 3.75,
    EGP: 49.3,
    KWD: 0.3072,
    QAR: 3.64,
    EUR: 0.92,
    GBP: 0.789,
  },
  "2026-07-01": {
    USD: 1,
    AED: 3.6725,
    SAR: 3.75,
    EGP: 49.5,
    KWD: 0.307,
    QAR: 3.64,
    EUR: 0.92,
    GBP: 0.79,
  },
  "2026-07-02": {
    USD: 1,
    AED: 3.6725,
    SAR: 3.75,
    EGP: 49.5,
    KWD: 0.307,
    QAR: 3.64,
    EUR: 0.919,
    GBP: 0.789,
  },
  "2026-07-03": {
    USD: 1,
    AED: 3.6725,
    SAR: 3.75,
    EGP: 49.6,
    KWD: 0.3071,
    QAR: 3.64,
    EUR: 0.918,
    GBP: 0.788,
  },
  "2026-07-04": {
    USD: 1,
    AED: 3.6725,
    SAR: 3.75,
    EGP: 49.6,
    KWD: 0.3071,
    QAR: 3.64,
    EUR: 0.917,
    GBP: 0.787,
  },
  "2026-07-05": {
    USD: 1,
    AED: 3.6725,
    SAR: 3.75,
    EGP: 49.7,
    KWD: 0.3072,
    QAR: 3.64,
    EUR: 0.916,
    GBP: 0.786,
  },
};

function rateOnDate(currency: string, dateStr: string): number {
  const table = HISTORICAL_RATES[dateStr] || CURRENT_RATES;
  return table[currency] || CURRENT_RATES[currency] || 1;
}

function toBaseUSD(amount: number, currency: string, dateStr: string): number {
  if (!currency || currency === "USD") return amount;
  return amount / rateOnDate(currency, dateStr || "2026-07-01");
}
// ---------- END LOCAL FUNCTIONS ----------

// ---------- CUSTOM SELECT COMPONENT ----------
interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = document.documentElement.dir === "rtl";

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white flex items-center justify-between transition focus:ring-2 focus:ring-purple-500 ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-slate-300 dark:hover:border-slate-700"
        }`}
        style={{ textAlign: isRtl ? "right" : "left" }}
      >
        <span className="truncate">{selectedOption?.label || placeholder || "اختر"}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ marginInlineStart: "0.5rem", flexShrink: 0 }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
          >
            <ul className="max-h-60 overflow-y-auto py-1.5">
              {options.map((opt) => (
                <li
                  key={String(opt.value)}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
                    opt.value === value
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ---------- END CUSTOM SELECT ----------

interface SalesSectionProps {
  defaultView?: "funnel" | "kanban";
}

const STAGES = ["Prospecting", "Meeting", "Proposal", "Negotiation", "Won", "Lost"];
const STAGE_LABELS_AR: Record<string, string> = {
  Prospecting: "استكشاف",
  Meeting: "اجتماع",
  Proposal: "عرض سعر",
  Negotiation: "تفاوض",
  Won: "مغلقة",
  Lost: "خسارة",
};
const STAGE_COLORS: Record<string, string> = {
  Prospecting: "#5aa9ff",
  Meeting: "#9b6bff",
  Proposal: "#ffb454",
  Negotiation: "#ff9d5c",
  Won: "#37d67a",
  Lost: "#ff5c7a",
};
const PAYMENT_METHODS = [
  "Vodafone Cash",
  "InstaPay",
  "Stripe",
  "PayPal",
  "Bitcoin",
  "Bank Transfer",
  "Cash",
];
const PAYMENT_ICONS: Record<string, string> = {
  "Vodafone Cash": "📱",
  InstaPay: "⚡",
  Stripe: "💳",
  PayPal: "🅿️",
  Bitcoin: "₿",
  "Bank Transfer": "🏦",
  Cash: "💵",
};

export default function SalesSection({ defaultView = "funnel" }: SalesSectionProps) {
  const { state, updateState, fmtMoney } = useAppState();
  const { isAdmin, user, users, userProfile } = useAuth();
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDealId, setEditingDealId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // Deal form state
  const [dealName, setDealName] = useState("");
  const [dealPackageId, setDealPackageId] = useState<number | null>(null);
  const [dealGrossAmount, setDealGrossAmount] = useState(0);
  const [dealCurrency, setDealCurrency] = useState("USD");
  const [dealPaymentMethod, setDealPaymentMethod] = useState("Bank Transfer");
  const [dealProbability, setDealProbability] = useState(50);
  const [dealStage, setDealStage] = useState("Prospecting");
  const [dealCloseDate, setDealCloseDate] = useState("2026-07-15");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [minRevenue, setMinRevenue] = useState<number | "">("");
  const [filterPackageId, setFilterPackageId] = useState<string>("All");

  const deals = state.deals;
  const packages = state.packages;

  const selectedPackage = packages.find((p) => p.id === dealPackageId);
  const commissionPercentage = selectedPackage
    ? selectedPackage.commissionPercentage !== undefined
      ? selectedPackage.commissionPercentage
      : 10
    : 0;
  const calculatedCommission = (dealGrossAmount * commissionPercentage) / 100;

  const filteredDeals = deals.filter((deal) => {
    if (searchQuery.trim() && !deal.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStage !== "All" && deal.stage !== filterStage) {
      return false;
    }
    if (minRevenue !== "" && Number(deal.value || 0) < Number(minRevenue)) {
      return false;
    }
    if (filterPackageId !== "All") {
      if (filterPackageId === "None") {
        if (deal.packageId !== undefined && deal.packageId !== null) return false;
      } else {
        if (String(deal.packageId) !== filterPackageId) return false;
      }
    }
    return true;
  });

  // Build option arrays for custom selects
  const packageOptions = [
    { value: "", label: t("— بدون باقة —", "— No package —") },
    ...packages.map((p) => ({
      value: p.id,
      label: `${p.icon} ${p.name} — ${fmtMoney(toBaseUSD(p.price, p.currency, "2026-07-01"))}`,
    })),
  ];

  const currencyOptions = CURRENCY_LIST.map((c) => ({ value: c, label: c }));
  const paymentOptions = (state.paymentMethods || []).map((pm) => ({
    value: pm.name,
    label: `💳 ${pm.name}`,
  }));
  const stageOptions = STAGES.map((s) => ({
    value: s,
    label: isRtl ? STAGE_LABELS_AR[s] : s,
  }));

  const filterPackageOptions = [
    { value: "All", label: t("كل الباقات", "All Packages") },
    { value: "None", label: t("بدون باقة", "No Package") },
    ...packages.map((p) => ({
      value: String(p.id),
      label: `${p.icon} ${p.name}`,
    })),
  ];

  const totalDeals = deals.length;
  const salesValue = deals
    .filter((d) => d.stage === "Won")
    .reduce((sum, d) => sum + Number(d.value || 0), 0);
  const avgProb = deals.length
    ? Math.round(deals.reduce((sum, d) => sum + Number(d.probability || 0), 0) / deals.length)
    : 0;
  const nearestClose = deals.length
    ? deals
        .slice()
        .sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime())[0]
        .closeDate
    : "—";

  const totalCommission = deals
    .filter((d) => d.stage === "Won")
    .reduce((sum, d) => {
      const commPct =
        d.appliedCommissionPercentage !== undefined ? d.appliedCommissionPercentage : 10;
      const commVal = ((d.grossAmount || d.value) * commPct) / 100;
      return sum + toBaseUSD(commVal, d.originalCurrency || "USD", d.closeDate);
    }, 0);

  // Funnel data
  const stageData = STAGES.map((st) => ({
    stage: st,
    count: deals.filter((d) => d.stage === st).length,
    value: deals.filter((d) => d.stage === st).reduce((sum, d) => sum + Number(d.value || 0), 0),
  }));
  const maxCount = Math.max(1, ...stageData.map((s) => s.count));

  // Revenue forecast by month
  const byMonth: Record<string, number> = {};
  deals.forEach((d) => {
    const m = d.closeDate?.slice(0, 7);
    if (m) byMonth[m] = (byMonth[m] || 0) + Number(d.value || 0);
  });
  const months = Object.keys(byMonth).sort();
  const maxMonthVal = Math.max(1, ...Object.values(byMonth));

  // Modal handlers
  const openNewDeal = () => {
    if (isAdmin) {
      toast.error(t("الآدمن لا يمكنه إضافة صفقات", "Admin cannot add deals"));
      return;
    }
    setEditingDealId(null);
    setDealName("");
    setDealPackageId(null);
    setDealGrossAmount(0);
    setDealCurrency("USD");
    setDealPaymentMethod(state.paymentMethods?.[0]?.name || "Bank Transfer");
    setDealProbability(50);
    setDealStage("Prospecting");
    setDealCloseDate("2026-07-15");
    setIsDealModalOpen(true);
  };

  const openEditDeal = (id: number) => {
    if (isAdmin) {
      toast.error(t("الآدمن لا يمكنه تعديل صفقات الشركاء", "Admin cannot edit partner deals"));
      return;
    }
    const deal = deals.find((d) => d.id === id);
    if (!deal) return;
    setEditingDealId(id);
    setDealName(deal.name);
    setDealPackageId(deal.packageId || null);
    setDealGrossAmount(deal.grossAmount || deal.value);
    setDealCurrency(deal.originalCurrency || "USD");
    setDealPaymentMethod(deal.paymentMethod || state.paymentMethods?.[0]?.name || "Bank Transfer");
    setDealProbability(deal.probability);
    setDealStage(deal.stage);
    setDealCloseDate(deal.closeDate);
    setIsDealModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (isAdmin) {
      toast.error(t("الآدمن لا يمكنه حذف صفقات الشركاء", "Admin cannot delete partner deals"));
      return;
    }
    if (deleteTargetId === null) return;

    const deal = deals.find((d) => d.id === deleteTargetId);
    if (deal && deal.stage === "Won") {
      try {
        const commPct = deal.appliedCommissionPercentage ?? 10;
        const commAmount = (deal.grossAmount * commPct) / 100;
        const commUSD = toBaseUSD(commAmount, deal.originalCurrency || "USD", deal.closeDate);

        const userRef = firestore.doc(db, "users", user?.uid || "");
        await firestore.updateDoc(userRef, {
          sales: firestore.increment(-1),
          revenue: firestore.increment(-commUSD),
          xp: firestore.increment(-150),
        });

        // Also delete transaction document
        const txId = `deal-comm-${deal.id}`;
        await firestore.deleteDoc(firestore.doc(db, "transactions", txId));
      } catch (err) {
        console.error("Error updating user stats on deal delete:", err);
      }
    }

    updateState((draft) => {
      draft.deals = draft.deals.filter((d) => d.id !== deleteTargetId);
    });
    toast.success(t("تم الحذف", "Deleted"));
    setDeleteTargetId(null);
  };

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      toast.error(t("غير مسموح للأدمن بحفظ الصفقات", "Admin is not allowed to save deals"));
      return;
    }
    if (!dealName.trim()) {
      toast.error(t("أدخل اسم الصفقة", "Enter deal name"));
      return;
    }

    const grossUSD = toBaseUSD(dealGrossAmount, dealCurrency, dealCloseDate);
    const stripeFee = dealPaymentMethod === "Stripe" ? grossUSD * 0.029 + 0.3 : 0;
    const netUSD = grossUSD - stripeFee;

    const commPct = selectedPackage
      ? selectedPackage.commissionPercentage !== undefined
        ? selectedPackage.commissionPercentage
        : 10
      : 0;
    const commAmount = (dealGrossAmount * commPct) / 100;
    const newCommUSD = toBaseUSD(commAmount, dealCurrency, dealCloseDate);

    const data = {
      name: dealName.trim(),
      packageId: dealPackageId ?? undefined,
      grossAmount: dealGrossAmount,
      originalCurrency: dealCurrency,
      paymentMethod: dealPaymentMethod,
      stripeFee,
      value: netUSD,
      probability: Number(dealProbability),
      stage: dealStage,
      closeDate: dealCloseDate,
      userId: user?.uid,
      appliedCommissionPercentage: commPct,
      calculatedCommissionAmount: commAmount,
    };

    const dealId = editingDealId !== null ? editingDealId : Date.now();

    // Check if transitioning to/from/within Won stage
    const oldDeal = editingDealId !== null ? state.deals.find((d) => d.id === editingDealId) : null;
    const wasWon = oldDeal?.stage === "Won";
    const isWon = dealStage === "Won";

    const oldCommUSD = oldDeal
      ? toBaseUSD(
          (oldDeal.grossAmount * (oldDeal.appliedCommissionPercentage ?? 10)) / 100,
          oldDeal.originalCurrency || "USD",
          oldDeal.closeDate,
        )
      : 0;

    let salesChange = 0;
    let revenueChange = 0;
    let xpChange = 0;

    if (!wasWon && isWon) {
      salesChange = 1;
      revenueChange = newCommUSD;
      xpChange = 150;
    } else if (wasWon && !isWon) {
      salesChange = -1;
      revenueChange = -oldCommUSD;
      xpChange = -150;
    } else if (wasWon && isWon) {
      // Remained won, check if commission amount changed
      revenueChange = newCommUSD - oldCommUSD;
    }

    if (salesChange !== 0 || revenueChange !== 0 || xpChange !== 0) {
      try {
        const userRef = firestore.doc(db, "users", user?.uid || "");
        const updateObj: any = {};
        if (salesChange !== 0) updateObj.sales = firestore.increment(salesChange);
        if (revenueChange !== 0) updateObj.revenue = firestore.increment(revenueChange);
        if (xpChange !== 0) updateObj.xp = firestore.increment(xpChange);

        await firestore.updateDoc(userRef, updateObj);

        if (!wasWon && isWon) {
          toast.success(
            t(
              "تهانينا! حصلت على +150 نقطة خبرة لنجاح الصفقة 🎉",
              "Congratulations! You earned +150 XP for winning the deal 🎉",
            ),
          );
        }
      } catch (err) {
        console.error("Error updating user stats on deal save:", err);
      }
    }

    // Sync transaction document in Firestore
    try {
      const txId = `deal-comm-${dealId}`;
      if (isWon) {
        await firestore.setDoc(firestore.doc(db, "transactions", txId), {
          id: dealId,
          docId: txId,
          type: "Commission",
          amount: newCommUSD,
          originalAmount: commAmount,
          originalCurrency: dealCurrency,
          status: "Approved",
          date: dealCloseDate,
          partner: userProfile?.name || user?.email || "Partner",
          userId: user?.uid,
          paymentMethod: dealPaymentMethod,
        });
      } else if (wasWon) {
        // Deleted transaction if no longer Won
        await firestore.deleteDoc(firestore.doc(db, "transactions", txId));
      }
    } catch (err) {
      console.error("Error syncing transaction document:", err);
    }

    updateState((draft) => {
      if (editingDealId !== null) {
        const idx = draft.deals.findIndex((d) => d.id === editingDealId);
        if (idx !== -1) {
          draft.deals[idx] = { ...draft.deals[idx], ...data };
        }
      } else {
        draft.deals.push({
          id: dealId,
          ...data,
        });
      }
    });

    toast.success(t("تم حفظ الصفقة", "Deal saved"));
    setIsDealModalOpen(false);
  };

  // Probability ring SVG component
  const ProbabilityRing = ({
    pct,
    color,
    size = 56,
  }: {
    pct: number;
    color: string;
    size?: number;
  }) => {
    const r = size / 2 - 5;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (pct / 100) * circumference;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--slate-200)"
          strokeWidth="4"
          className="dark:stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000 ease-out"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".35em"
          className="text-[11px] font-bold fill-current text-slate-800 dark:text-white"
        >
          {pct}%
        </text>
      </svg>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 12 },
    },
  } as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {t("المبيعات — Sales Funnel", "Sales — Funnel")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("متابعة الصفقات والتوقعات", "Deals pipeline & forecast")}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={openNewDeal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>{t("✦ صفقة جديدة", "✦ New Deal")}</span>
          </button>
        )}
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {[
          {
            label: t("إجمالي الصفقات", "Total Deals"),
            value: totalDeals.toString(),
            color: "emerald",
          },
          {
            label: t("قيمة المبيعات", "Sales Value"),
            value: fmtMoney(salesValue),
            color: "purple",
          },
          {
            label: t("متوسط الاحتمالية", "Avg Probability"),
            value: avgProb + "%",
            color: "orange",
          },
          {
            label: t("إجمالي العمولة", "Total Commission"),
            value: fmtMoney(totalCommission),
            color: "indigo",
          },
          {
            label: t("أقرب إغلاق", "Nearest Close"),
            value: nearestClose,
            color: "blue",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <div
              className={`text-2xl font-bold font-mono mt-1 text-${stat.color}-500 dark:text-${stat.color}-400`}
            >
              {stat.value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Funnel */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="text-lg">⚡</span> {t("Sales Funnel", "Sales Funnel")}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("تدفق الصفقات حسب المرحلة", "Live pipeline flow by stage")}
          </span>
        </div>
        <div className="space-y-4">
          {stageData.map((s, idx) => {
            const color = STAGE_COLORS[s.stage] || "#94a3b8";
            const pct = maxCount > 0 ? 30 + (s.count / maxCount) * 70 : 0;
            return (
              <div
                key={s.stage}
                className="flex items-center gap-3"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="w-20 md:w-28 flex-shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isRtl ? STAGE_LABELS_AR[s.stage] : s.stage}
                </div>
                <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800/60 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: idx * 0.08, ease: "easeOut" }}
                    className="h-full flex items-center px-3 text-[10px] font-bold text-white"
                    style={{
                      background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, white))`,
                      boxShadow: `0 0 12px -2px ${color}`,
                    }}
                  >
                    <span className="drop-shadow-sm">{s.count}</span>
                  </motion.div>
                </div>
                <div className="w-24 flex-shrink-0 text-right text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {fmtMoney(s.value)}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Revenue Forecast Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="text-lg">📈</span> {t("توقعات الإيرادات", "Revenue Forecast")}
          </h3>
        </div>
        {months.length === 0 ? (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
            {t("لا توجد صفقات لعرض التوقعات", "No deals to show forecast")}
          </div>
        ) : (
          <div className="flex items-end justify-around gap-4 h-48 pt-4">
            {months.map((m, i) => {
              const value = byMonth[m];
              const height = Math.max(20, (value / maxMonthVal) * 120);
              return (
                <div key={m} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex items-end h-36">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}px` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                      className="w-10 rounded-t-lg bg-gradient-to-t from-purple-500 to-lime-400 shadow-lg shadow-purple-500/20"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {fmtMoney(value)}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">{m}</span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("بحث باسم الصفقة...", "Search by deal name...")}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Stage Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={filterStage}
              onChange={(val) => setFilterStage(val as string)}
              options={[
                { value: "All", label: t("كل المراحل", "All Stages") },
                ...STAGES.map((s) => ({
                  value: s,
                  label: isRtl ? STAGE_LABELS_AR[s] : s,
                })),
              ]}
              placeholder={t("تصفية بالمرحلة", "Filter by stage")}
            />
          </div>

          {/* Package Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={filterPackageId}
              onChange={(val) => setFilterPackageId(val as string)}
              options={filterPackageOptions}
              placeholder={t("تصفية بالباقة", "Filter by package")}
            />
          </div>

          {/* Revenue Threshold */}
          <div className="relative w-full sm:w-48">
            <input
              type="number"
              value={minRevenue}
              onChange={(e) => setMinRevenue(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={t("الحد الأدنى للمبلغ...", "Min Amount...")}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery ||
          filterStage !== "All" ||
          minRevenue !== "" ||
          filterPackageId !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterStage("All");
              setMinRevenue("");
              setFilterPackageId("All");
            }}
            className="text-xs font-semibold text-purple-650 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition flex items-center gap-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t("إلغاء التصفية", "Clear Filters")}</span>
          </button>
        )}
      </motion.div>

      {isAdmin ? (
        /* High-Fidelity Table Layout for Admin */
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scroll">
            <table
              className="w-full text-left border-collapse min-w-[900px]"
              style={{ textAlign: isRtl ? "right" : "left" }}
            >
              <thead>
                <tr className="border-b border-slate-250 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
                  <th className="py-3.5 px-4">{t("الصفقة", "Deal")}</th>
                  <th className="py-3.5 px-4">{t("الشريك (المالك)", "Partner (Owner)")}</th>
                  <th className="py-3.5 px-4">{t("الباقة", "Package")}</th>
                  <th className="py-3.5 px-4 text-center">{t("المرحلة", "Stage")}</th>
                  <th className="py-3.5 px-4 text-center">{t("الاحتمالية", "Probability")}</th>
                  <th className="py-3.5 px-4 text-center">{t("طريقة الدفع", "Payment")}</th>
                  <th className="py-3.5 px-4 text-center">{t("تاريخ الإغلاق", "Close Date")}</th>
                  <th className="py-3.5 px-4 text-right pr-6">{t("القيمة", "Value")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-sm text-slate-500 dark:text-slate-400"
                    >
                      {t("لا توجد صفقات مطابقة", "No matching deals")}
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => {
                    const color = STAGE_COLORS[deal.stage] || "#94a3b8";
                    const pkg = deal.packageId
                      ? packages.find((p) => p.id === deal.packageId)
                      : null;
                    const payIcon = PAYMENT_ICONS[deal.paymentMethod] || "";
                    const stageLabel = isRtl ? STAGE_LABELS_AR[deal.stage] : deal.stage;

                    const ownerUser = users.find((u) => u.uid === (deal as any).userId);
                    const ownerPartner =
                      ownerUser ||
                      state.partners.find((p) => String(p.id) === String((deal as any).userId));
                    const ownerName = ownerPartner ? ownerPartner.name : t("غير معروف", "Unknown");

                    return (
                      <tr
                        key={deal.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group"
                      >
                        {/* Deal Name */}
                        <td className="py-3.5 px-4 font-bold text-xs text-slate-850 dark:text-slate-200">
                          {deal.name}
                        </td>
                        {/* Owner Partner */}
                        <td className="py-3.5 px-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-black shrink-0">
                              {ownerName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {ownerName}
                            </div>
                          </div>
                        </td>
                        {/* Package */}
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {pkg ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm shrink-0">{pkg.icon}</span>
                              <span className="truncate max-w-[120px]">{pkg.name}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        {/* Stage Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              backgroundColor: `${color}15`,
                              color: color,
                              border: `1px solid ${color}30`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mr-1.5 rtl:mr-0 rtl:ml-1.5 shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            {stageLabel}
                          </span>
                        </td>
                        {/* Probability */}
                        <td className="py-3.5 px-4 text-center text-xs font-bold font-mono text-slate-600 dark:text-slate-400">
                          {deal.probability}%
                        </td>
                        {/* Payment Method */}
                        <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <span>{payIcon}</span>
                            <span>{deal.paymentMethod}</span>
                          </span>
                        </td>
                        {/* Close Date */}
                        <td className="py-3.5 px-4 text-center text-xs font-bold font-mono text-slate-500 dark:text-slate-400">
                          {deal.closeDate}
                        </td>
                        {/* Value */}
                        <td className="py-3.5 px-4 text-right pr-6 text-xs font-black font-mono text-emerald-600 dark:text-emerald-450">
                          {fmtMoney(deal.value)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Deal Cards Grid */
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredDeals.length === 0 ? (
            <div className="col-span-full text-center text-sm text-slate-500 dark:text-slate-400 py-12">
              {t("لا توجد صفقات مطابقة", "No matching deals")}
            </div>
          ) : (
            filteredDeals.map((deal, i) => {
              const color = STAGE_COLORS[deal.stage] || "#94a3b8";
              const pkg = deal.packageId ? packages.find((p) => p.id === deal.packageId) : null;
              const payIcon = PAYMENT_ICONS[deal.paymentMethod] || "";
              const stageLabel = isRtl ? STAGE_LABELS_AR[deal.stage] : deal.stage;

              const ownerUser = users.find((u) => u.uid === (deal as any).userId);
              const ownerPartner =
                ownerUser ||
                state.partners.find((p) => String(p.id) === String((deal as any).userId));
              const ownerName = ownerPartner ? ownerPartner.name : t("غير معروف", "Unknown");

              return (
                <motion.div
                  key={deal.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm hover:shadow-[0_0_30px_-8px_rgba(255,213,77,0.5)] transition-all duration-300 relative overflow-hidden cursor-pointer group"
                  style={{ borderTop: `3px solid ${color}` }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                        {deal.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span
                          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${color}22`, color }}
                        >
                          {stageLabel}
                        </span>
                        {pkg && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            {pkg.icon} {pkg.name}
                          </span>
                        )}
                        {isAdmin && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">
                            👤 {ownerName}
                          </span>
                        )}
                      </div>
                    </div>
                    <ProbabilityRing pct={deal.probability} color={color} size={48} />
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-lg font-bold font-mono" style={{ color }}>
                        {fmtMoney(deal.value)}
                      </div>
                      {deal.stripeFee > 0 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {t("صافي بعد رسوم Stripe", "Net after Stripe fee")}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                      <div>📅 {deal.closeDate}</div>
                      {deal.paymentMethod && (
                        <div className="mt-0.5">
                          {payIcon} {deal.paymentMethod}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isAdmin && (
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDeal(deal.id);
                        }}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
                      >
                        {t("تعديل", "Edit")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(deal.id);
                        }}
                        className="text-xs font-medium text-red-500 hover:text-red-600 transition"
                      >
                        {t("حذف", "Delete")}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTargetId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {t("تأكيد الحذف", "Confirm Delete")}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {t(
                  "هل أنت متأكد من رغبتك في حذف هذه الصفقة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
                  "Are you sure you want to delete this deal permanently? This action cannot be undone.",
                )}
              </p>
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition"
                >
                  {t("حذف", "Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Add/Edit Deal with Custom Selects */}
      <AnimatePresence>
        {isDealModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDealModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-950 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {editingDealId ? t("تعديل الصفقة", "Edit Deal") : t("صفقة جديدة", "New Deal")}
                </h3>
                <button
                  onClick={() => setIsDealModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDeal} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t("اسم الصفقة", "Deal Name")}
                  </label>
                  <input
                    type="text"
                    value={dealName}
                    onChange={(e) => setDealName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder={t(
                      "مثال: باقة Elite — Yousef Adel",
                      "e.g., Elite Package — Yousef Adel",
                    )}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t("الباقة", "Package")}
                  </label>
                  <Select
                    value={dealPackageId ?? ""}
                    onChange={(val) => setDealPackageId(val === "" ? null : Number(val))}
                    options={packageOptions}
                    placeholder={t("اختر الباقة", "Select package")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      {t("المبلغ (الذي دفعه العميل)", "Amount (client paid)")}
                    </label>
                    <input
                      type="number"
                      value={dealGrossAmount}
                      onChange={(e) => setDealGrossAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      {t("العملة", "Currency")}
                    </label>
                    <Select
                      value={dealCurrency}
                      onChange={(val) => setDealCurrency(val as string)}
                      options={currencyOptions}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t("طريقة الدفع", "Payment Method")}
                  </label>
                  <Select
                    value={dealPaymentMethod}
                    onChange={(val) => setDealPaymentMethod(val as string)}
                    options={paymentOptions}
                  />
                </div>

                {dealPaymentMethod === "Stripe" && dealGrossAmount > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                    💳{" "}
                    {t(
                      "رسوم Stripe (2.9% + $0.30) ستُخصم تلقائياً",
                      "Stripe fee (2.9% + $0.30) will be deducted automatically",
                    )}
                  </div>
                )}

                {dealPackageId !== null && (
                  <div className="grid grid-cols-2 gap-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl p-3.5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400 block mb-0.5">
                        {t("نسبة العمولة", "Commission Rate")}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {commissionPercentage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400 block mb-0.5">
                        {t("العمولة المقدرة", "Estimated Commission")}
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {fmtMoney(toBaseUSD(calculatedCommission, dealCurrency, dealCloseDate))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      {t("الاحتمالية %", "Probability %")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={dealProbability}
                      onChange={(e) => setDealProbability(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      {t("المرحلة", "Stage")}
                    </label>
                    <Select
                      value={dealStage}
                      onChange={(val) => setDealStage(val as string)}
                      options={stageOptions}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t("تاريخ الإغلاق المتوقع", "Expected Close Date")}
                  </label>
                  <DatePicker value={dealCloseDate} onChange={(val) => setDealCloseDate(val)} />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsDealModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition"
                  >
                    {t("حفظ", "Save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { useAppState } from "../../context/StateContext";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Calendar,
  User,
  GraduationCap,
  Activity,
  PieChart,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// Helper: smooth line path for SVG
const smoothLinePath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return "";
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midX = (p0.x + p1.x) / 2;
    d += ` Q${p0.x},${p0.y} ${midX},${(p0.y + p1.y) / 2} T${p1.x},${p1.y}`;
  }
  return d;
};

// ============================================================
// Animated Number Component - counts from 0 to target
// ============================================================
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  suffix?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  format,
  suffix = "",
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // EaseOutCubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = value * eased;
      setDisplay(current);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  const formatted = format ? format(display) : String(Math.round(display));
  return (
    <>
      {formatted}
      {suffix}
    </>
  );
};

export default function AnalyticsSection() {
  const { state, fmtMoney } = useAppState();

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // --- Analytics Data ---
  const leadsAll = state.crmBoards.flatMap((b) =>
    b.leads.map((l) => ({ ...l, _boardId: b.id, _boardName: b.name })),
  );
  const totalLeads = leadsAll.length;
  const totalBookings = state.bookings.length;
  const totalPartners = state.partners.length;

  const academyItems = state.academyPhases.flatMap((p) => p.items);
  const totalAcademyItems = academyItems.length;
  const completedAcademyItems = academyItems.filter((i) => i.completed).length;
  const academyProgress =
    totalAcademyItems > 0 ? Math.round((completedAcademyItems / totalAcademyItems) * 100) : 0;

  // Board distribution translation helper
  const translateBoardName = (name: string) => {
    const dict: Record<string, { ar: string; en: string }> = {
      "general": { ar: "المبيعات الرئيسية", en: "General Sales" },
      "coaching": { ar: "جلسات كوتشينج واستشارات", en: "Coaching & Consulting" },
      "digitalproducts": { ar: "بيع منتجات رقمية", en: "Digital Products" },
      "agency": { ar: "خدمات شركات ومؤسسات (B2B)", en: "B2B Agency" },
      "saas": { ar: "بيع برمجيات واشتراكات (SaaS)", en: "SaaS Sales" },
      "freelance": { ar: "الخدمات الحرة", en: "Freelance" },
      
      "مبيعات عامة": { ar: "المبيعات الرئيسية", en: "General Sales" },
      "المبيعات الرئيسية": { ar: "المبيعات الرئيسية", en: "General Sales" },
      "الكوتشينج والدورات": { ar: "جلسات كوتشينج واستشارات", en: "Coaching & Consulting" },
      "جلسات كوتشينج واستشارات": { ar: "جلسات كوتشينج واستشارات", en: "Coaching & Consulting" },
      "المنتجات الرقمية": { ar: "بيع منتجات رقمية", en: "Digital Products" },
      "بيع منتجات رقمية": { ar: "بيع منتجات رقمية", en: "Digital Products" },
      "الوكالات وخدمات العملاء": { ar: "خدمات شركات ومؤسسات (B2B)", en: "B2B Agency" },
      "خدمات شركات ومؤسسات (B2B)": { ar: "خدمات شركات ومؤسسات (B2B)", en: "B2B Agency" },
      "SaaS / اشتراكات": { ar: "بيع برمجيات واشتراكات (SaaS)", en: "SaaS Sales" },
      "بيع برمجيات واشتراكات (SaaS)": { ar: "بيع برمجيات واشتراكات (SaaS)", en: "SaaS Sales" },
      "الخدمات الحرة": { ar: "الخدمات الحرة", en: "Freelance" },

      "General Sales": { ar: "المبيعات الرئيسية", en: "General Sales" },
      "Coaching & Consulting": { ar: "جلسات كوتشينج واستشارات", en: "Coaching & Consulting" },
      "Digital Products": { ar: "بيع منتجات رقمية", en: "Digital Products" },
      "B2B Agency": { ar: "خدمات شركات ومؤسسات (B2B)", en: "B2B Agency" },
      "SaaS Sales": { ar: "بيع برمجيات واشتراكات (SaaS)", en: "SaaS Sales" },
      "Freelance": { ar: "الخدمات الحرة", en: "Freelance" },
    };
    const norm = (name || "").trim();
    if (dict[norm]) return isRtl ? dict[norm].ar : dict[norm].en;
    const lower = norm.toLowerCase();
    if (dict[lower]) return isRtl ? dict[lower].ar : dict[lower].en;
    return name;
  };

  // Board distribution
  const boardCounts = state.crmBoards
    .map((b) => ({
      name: translateBoardName(b.name),
      color: b.color || "#8b5cf6",
      count: b.leads.length,
    }))
    .sort((a, b) => b.count - a.count);
  const totalBoardLeads = Math.max(
    1,
    boardCounts.reduce((s, b) => s + b.count, 0),
  );

  // Top performing partners
  const topPartners = state.partners
    .slice()
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Trend chart data
  const recentTx = [...state.transactions]
    .filter((t) => t.status === "Paid" || t.status === "Approved")
    .slice(0, 6)
    .reverse();
  const maxAmount = Math.max(...recentTx.map((t) => t.amount), 1000);
  const chartBars =
    recentTx.length >= 4
      ? recentTx.map((tx) => ({
          label: tx.date.split(",")[0] || tx.date,
          pct: Math.max(15, Math.min(100, Math.round((tx.amount / maxAmount) * 100))),
          amount: tx.amount,
        }))
      : [
          { label: t("السبت", "Sat"), pct: 40, amount: 480 },
          { label: t("الأحد", "Sun"), pct: 65, amount: 780 },
          { label: t("الإثنين", "Mon"), pct: 50, amount: 600 },
          { label: t("الثلاثاء", "Tue"), pct: 85, amount: 1020 },
          { label: t("الأربعاء", "Wed"), pct: 70, amount: 840 },
          { label: t("الخميس", "Thu"), pct: 95, amount: 1140 },
        ];

  const revenueSeries = chartBars.map((b) => b.amount);
  const bookingsSeries = revenueSeries.map((v) => Math.round(v * 0.4 + 200));

  // For the trend chart SVG
  const W = 640,
    H = 200,
    padL = 34,
    padB = 24,
    padT = 10;
  const maxVal = Math.max(...revenueSeries, ...bookingsSeries, 1) * 1.15;
  const stepX = (W - padL - 10) / (chartBars.length - 1 || 1);
  const toPts = (arr: number[]) =>
    arr.map((v, i) => ({
      x: padL + i * stepX,
      y: padT + (1 - v / maxVal) * (H - padT - padB),
    }));
  const revPts = toPts(revenueSeries);
  const bookPts = toPts(bookingsSeries);
  const revPath = smoothLinePath(revPts);
  const bookPath = smoothLinePath(bookPts);
  const revArea = `${revPath} L${revPts[revPts.length - 1]?.x || W},${H - padB} L${revPts[0]?.x || padL},${H - padB} Z`;

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
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 12 } },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
  } as const;

  // ============================================================
  // EXPORT FUNCTIONS (unchanged)
  // ============================================================
  const generateCSV = () => {
    const rows = [
      [t("المقياس", "Metric"), t("القيمة", "Value"), t("التفاصيل", "Details")],
      [t("إجمالي العملاء", "Total Leads"), String(totalLeads), ""],
      [t("إجمالي الحجوزات", "Total Bookings"), String(totalBookings), ""],
      [t("إجمالي الشركاء", "Total Partners"), String(totalPartners), ""],
      [t("تقدم الأكاديمية", "Academy Progress"), `${academyProgress}%`, ""],
      [],
      [t("لوحة CRM", "CRM Board"), t("العملاء", "Leads"), t("النسبة", "Percentage")],
      ...boardCounts.map((b) => [
        b.name,
        String(b.count),
        `${Math.round((b.count / totalBoardLeads) * 100)}%`,
      ]),
      [],
      [
        t("الترتيب", "Rank"),
        t("الاسم", "Name"),
        t("الإيرادات", "Revenue"),
        t("الصفقات", "Sales"),
        t("التحويل", "Conversion"),
      ],
      ...topPartners.map((p, i) => [
        String(i + 1),
        p.name,
        fmtMoney(p.revenue),
        String(p.sales),
        `${p.conversion}%`,
      ]),
      [],
      [
        t("المعرف", "ID"),
        t("النوع", "Type"),
        t("المبلغ", "Amount"),
        t("الحالة", "Status"),
        t("التاريخ", "Date"),
      ],
      ...state.transactions
        .slice(0, 10)
        .map((tx) => [`#${tx.id}`, tx.type, fmtMoney(tx.amount), tx.status, tx.date]),
    ];
    return rows.map((row) => row.join(",")).join("\n");
  };

  const generateJSON = () => {
    return {
      exportedAt: new Date().toISOString(),
      language: state.settings.language,
      currency: state.settings.currency,
      kpis: { totalLeads, totalBookings, totalPartners, academyProgress },
      crmDistribution: boardCounts.map((b) => ({
        name: b.name,
        count: b.count,
        percentage: Math.round((b.count / totalBoardLeads) * 100),
        color: b.color,
      })),
      topPartners: topPartners.map((p) => ({
        name: p.name,
        level: p.level,
        revenue: p.revenue,
        sales: p.sales,
        conversion: p.conversion,
        trend: p.trend,
        isMe: p.isMe,
      })),
      recentTransactions: state.transactions.slice(0, 10).map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        date: tx.date,
        partner: tx.partner || null,
      })),
      trendData: chartBars.map((bar, i) => ({
        label: bar.label,
        revenue: revenueSeries[i] || 0,
        bookings: bookingsSeries[i] || 0,
      })),
    };
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    try {
      const csv = generateCSV();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(csv, `analytics-report-${timestamp}.csv`, "text/csv;charset=utf-8;");
      toast.success(t("تم تصدير التقرير كـ CSV بنجاح", "Report exported as CSV successfully"));
    } catch (error) {
      toast.error(t("حدث خطأ أثناء تصدير التقرير", "Error exporting report"));
      console.error(error);
    }
  };

  const exportJSON = () => {
    try {
      const json = generateJSON();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(
        JSON.stringify(json, null, 2),
        `analytics-report-${timestamp}.json`,
        "application/json;charset=utf-8;",
      );
      toast.success(t("تم تصدير التقرير كـ JSON بنجاح", "Report exported as JSON successfully"));
    } catch (error) {
      toast.error(t("حدث خطأ أثناء تصدير التقرير", "Error exporting report"));
      console.error(error);
    }
  };

  const exportTXT = () => {
    try {
      const lines = [];
      const timestamp = new Date().toLocaleString(isRtl ? "ar-EG" : "en-US");
      lines.push("=".repeat(60));
      lines.push(t("تقرير التحليلات - Joe Partner", "Analytics Report - Joe Partner"));
      lines.push(`📅 ${t("التاريخ", "Date")}: ${timestamp}`);
      lines.push("=".repeat(60));
      lines.push("");
      lines.push(t("📊 المؤشرات الرئيسية", "📊 Key Performance Indicators"));
      lines.push("-".repeat(40));
      lines.push(`${t("إجمالي العملاء", "Total Leads")}: ${totalLeads}`);
      lines.push(`${t("إجمالي الحجوزات", "Total Bookings")}: ${totalBookings}`);
      lines.push(`${t("إجمالي الشركاء", "Total Partners")}: ${totalPartners}`);
      lines.push(`${t("تقدم الأكاديمية", "Academy Progress")}: ${academyProgress}%`);
      lines.push("");
      lines.push(t("📂 توزيع العملاء حسب اللوحة", "📂 CRM Distribution"));
      lines.push("-".repeat(40));
      boardCounts.forEach((b) => {
        const pct = Math.round((b.count / totalBoardLeads) * 100);
        lines.push(`  ${b.name}: ${b.count} (${pct}%)`);
      });
      lines.push("");
      lines.push(t("🏆 أفضل الشركاء أداءً", "🏆 Top Performing Partners"));
      lines.push("-".repeat(40));
      topPartners.forEach((p, i) => {
        lines.push(
          `  #${i + 1} ${p.name} - ${fmtMoney(p.revenue)} (${p.sales} ${t("صفقة", "sales")})`,
        );
      });
      lines.push("");
      lines.push(t("💳 آخر المعاملات", "💳 Recent Transactions"));
      lines.push("-".repeat(40));
      state.transactions.slice(0, 10).forEach((tx) => {
        lines.push(`  #${tx.id} ${tx.type} - ${fmtMoney(tx.amount)} (${tx.status})`);
      });
      lines.push("");
      lines.push("=".repeat(60));
      lines.push(t("تم التصدير بواسطة Joe Partner Dashboard", "Exported by Joe Partner Dashboard"));
      const content = lines.join("\n");
      const timestampFile = new Date().toISOString().slice(0, 10);
      downloadFile(content, `analytics-report-${timestampFile}.txt`, "text/plain;charset=utf-8;");
      toast.success(t("تم تصدير التقرير كـ TXT بنجاح", "Report exported as TXT successfully"));
    } catch (error) {
      toast.error(t("حدث خطأ أثناء تصدير التقرير", "Error exporting report"));
      console.error(error);
    }
  };

  const handleQuickDownload = () => {
    exportCSV();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 font-sans pb-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-6"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-500" />
            <span>{t("التحليلات والمقاييس", "Analytics & Metrics")}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(
              "نظرة شاملة على أداء فريقك ومقاييس النمو.",
              "Comprehensive overview of your team's performance and growth metrics.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleQuickDownload}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition group relative"
            title={t("تحميل سريع (CSV)", "Quick Download (CSV)")}
          >
            <Download className="h-4 w-4" />
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-500/20 transition">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{t("تصدير التقرير", "Export Report")}</span>
            </button>
            <div className="absolute right-0 mt-1 min-w-[180px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={exportCSV}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>{t("تصدير كـ CSV", "Export as CSV")}</span>
              </button>
              <button
                onClick={exportJSON}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <FileJson className="h-4 w-4 text-blue-500" />
                <span>{t("تصدير كـ JSON", "Export as JSON")}</span>
              </button>
              <button
                onClick={exportTXT}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <FileText className="h-4 w-4 text-purple-500" />
                <span>{t("تصدير كـ TXT", "Export as TXT")}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards with Animated Numbers */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t("إجمالي العملاء", "Total Leads"),
            value: totalLeads,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/20",
          },
          {
            label: t("إجمالي الحجوزات", "Total Bookings"),
            value: totalBookings,
            icon: Calendar,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-950/20",
          },
          {
            label: t("إجمالي الشركاء", "Total Partners"),
            value: totalPartners,
            icon: User,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-950/20",
          },
          {
            label: t("تقدم الأكاديمية", "Academy Progress"),
            value: academyProgress,
            icon: GraduationCap,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-950/20",
            suffix: "%",
          },
        ].map((kpi, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1.5 tracking-tight">
                  <AnimatedNumber value={kpi.value} duration={1200} suffix={kpi.suffix || ""} />
                </div>
              </div>
              <div
                className={`p-2.5 rounded-xl ${kpi.bg} group-hover:scale-110 transition-transform duration-300`}
              >
                <kpi.icon className={`h-4.5 w-4.5 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Performance Trend + CRM Distribution (unchanged) */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 backdrop-blur-md shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-purple-500" />
                {t("اتجاه الأداء", "Performance Trend")}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {t("آخر 6 معاملات", "Last 6 transactions")}
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-500 dark:text-slate-400">
                  {t("الإيرادات", "Revenue")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-500 dark:text-slate-400">
                  {t("الحجوزات", "Bookings")}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48 min-w-[400px]">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
                const y = padT + f * (H - padT - padB);
                return (
                  <line
                    key={i}
                    x1={padL}
                    y1={y}
                    x2={W}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3,4"
                  />
                );
              })}
              <path d={revArea} fill="url(#revGrad)" />
              <motion.path
                d={revPath}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1000"
                initial={{ strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <motion.path
                d={bookPath}
                fill="none"
                stroke="#03c3a8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1000"
                initial={{ strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
              {revPts.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="#8b5cf6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.08, type: "spring", stiffness: 200 }}
                />
              ))}
              {bookPts.map((p, i) => (
                <motion.circle
                  key={i + 100}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="#03c3a8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0 + i * 0.08, type: "spring", stiffness: 200 }}
                />
              ))}
              {chartBars.map((item, i) => (
                <text
                  key={i}
                  x={padL + i * stepX}
                  y={H - 4}
                  fontSize="9"
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              ))}
            </svg>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 backdrop-blur-md shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-4.5 w-4.5 text-purple-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {t("توزيع العملاء حسب اللوحة", "CRM Distribution")}
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {boardCounts.map((board, idx) => (
                <motion.div
                  key={idx}
                  initial={{ width: 0 }}
                  animate={{ width: `${(board.count / totalBoardLeads) * 100}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className="h-full"
                  style={{ backgroundColor: board.color }}
                />
              ))}
            </div>
            <div className="space-y-2">
              {boardCounts.map((board, idx) => {
                const pct = Math.round((board.count / totalBoardLeads) * 100);
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: board.color }}
                    />
                    <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">
                      {board.name}
                    </span>
                    <span className="font-bold text-slate-500 dark:text-slate-400">{pct}%</span>
                    <span className="text-slate-400 dark:text-slate-500">({board.count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Top Performing Partners (revenue numbers could be animated too, but keeping static for now) */}
      <motion.div
        variants={cardVariants}
        className="bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 backdrop-blur-md shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-4.5 w-4.5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {t("أفضل الشركاء أداءً", "Top Performing Partners")}
          </h3>
        </div>
        <div className="space-y-3">
          {topPartners.map((partner, idx) => {
            const isMe = partner.isMe;
            const trendIcon =
              partner.trend > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : partner.trend < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-slate-400" />
              );
            return (
              <div
                key={partner.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                  isMe
                    ? "bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-800/30"
                    : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                }`}
              >
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 text-center">
                  #{idx + 1}
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 dark:from-indigo-500/30 dark:to-fuchsia-500/30 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-300 shrink-0">
                  {partner.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {partner.name}
                    </span>
                    {isMe && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                        {t("أنت", "You")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>
                      {partner.sales} {t("صفقة", "sales")}
                    </span>
                    <span>•</span>
                    <span>
                      {partner.conversion}% {t("تحويل", "conv.")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {fmtMoney(partner.revenue)}
                  </div>
                  <div className="flex items-center justify-end gap-0.5 text-[10px] text-slate-400">
                    {trendIcon}{" "}
                    {partner.trend !== 0 && (
                      <span className="font-mono">{Math.abs(partner.trend)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

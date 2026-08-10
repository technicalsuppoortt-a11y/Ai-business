// OverviewSection.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence, animate } from "framer-motion";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckSquare,
  Square,
  BarChart3,
  Flame,
  Trophy,
  Sparkles,
  Target,
  Award,
  Copy,
  Check,
  X,
  Info,
  Crown,
  GraduationCap,
  Minus,
  TrendingDown,
  Coins,
  Users,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  ChevronDown,
  FileSearch,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { db, firestore } from "../../config/firebase";

interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  className = "",
}) => {
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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-900/80 border border-slate-205 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700 focus:ring-2 focus:ring-purple-500/50 font-bold shadow-sm"
        style={{ textAlign: isRtl ? "right" : "left" }}
      >
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="flex-1 truncate text-slate-700 dark:text-slate-200">
          {selectedOption?.label || placeholder || "اختر"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
          >
            <ul className="max-h-60 overflow-y-auto py-1 custom-scroll">
              {options.map((opt) => (
                <li
                  key={String(opt.value)}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer transition flex items-center gap-1.5 ${
                    opt.value === value
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-semibold"
                      : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {opt.icon && <span className="text-slate-400">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                  {opt.value === value && <span className="ml-auto text-purple-500">✓</span>}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface OverviewSectionProps {
  onNavigate?: (tab: string) => void;
}

interface AnimatedCounterProps {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
}

export function AnimatedCounter({ value, formatter }: AnimatedCounterProps) {
  return <span>{formatter ? formatter(value) : Math.round(value).toString()}</span>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 12 } },
} as const;

export default function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const { state, updateState, fmtMoney } = useAppState();
  const [copied, setCopied] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const userName = state.settings.profileName || "Partner";
  const firstName = userName.split(" ")[0];

  const { isAdmin, user, userProfile } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminDateRange, setAdminDateRange] = useState<7 | 14 | 30 | 90>(7);
  const [partnerDateRange, setPartnerDateRange] = useState<7 | 14 | 30 | 90>(7);

  // Admin Revision Modal state
  const [adminReviewTask, setAdminReviewTask] = useState<any | null>(null);
  const [revisionReasonInput, setRevisionReasonInput] = useState("");

  const dateRangeOptions = useMemo<SelectOption[]>(
    () => [
      { value: 7, label: t("آخر 7 أيام", "Last 7 Days") },
      { value: 14, label: t("آخر 14 يوم", "Last 14 Days") },
      { value: 30, label: t("آخر 30 يوم", "Last 30 Days") },
      { value: 90, label: t("آخر 90 يوم", "Last 90 Days") },
    ],
    [isRtl],
  );

  useEffect(() => {
    const usersRef = firestore.collection(db, "users");
    const unsub = firestore.onSnapshot(usersRef, (snap: any) => {
      const list = snap.docs.map((d: any) => {
        const data = d.data();
        return {
          id: d.id,
          uid: d.id,
          name: data.name || data.email?.split("@")[0] || "Partner",
          xp: Number(data.xp) || 0,
          sales: Number(data.sales) || 0,
          lessons: Number(data.lessons) || 0,
          level: data.level || "Silver",
          streak: Number(data.streak) || 0,
          trend: Number(data.trend) || 0,
          revenue: Number(data.revenue) || 0,
          role: data.role || "user",
          isMe: d.id === user?.uid,
        };
      });
      setUsersList(list);
    });
    return () => unsub();
  }, [user]);

  const partnersFromDb = useMemo(() => {
    if (usersList.length === 0) return state.partners;
    return usersList.filter((u) => u.role !== "admin");
  }, [usersList, state.partners]);

  // ---- DATA CALCULATIONS ----
  const allLeads = state.crmBoards.flatMap((b) =>
    b.leads.map((l) => ({ ...l, boardName: b.name, boardStages: b.stages })),
  );

  // Hook up Ecosystem/Partner KPIs to the CRM leads collection in real-time
  const activeLeads = allLeads.filter((l) => {
    const stage = l.boardStages?.find((s) => s.id === l.stage);
    return stage?.type !== "won" && stage?.type !== "lost";
  });
  const basePipeline = activeLeads.reduce((sum, l) => sum + Number(l.revenue || 0), 0);

  const wonLeadsList = allLeads.filter((l) => {
    const stage = l.boardStages?.find((s) => s.id === l.stage);
    return stage?.type === "won";
  });
  const wonDealsCount = wonLeadsList.length;

  // Partner revenue depends on won deals (sales) of partner
  const basePaid = wonLeadsList.reduce((sum, l) => sum + Number(l.revenue || 0), 0);

  // local timezone YYYY-MM-DD helper
  const localTodayStr = new Date().toLocaleDateString("en-CA");
  const todayMeetings = state.bookings.filter((b) => b.date === localTodayStr);

  const academyItems = useMemo(() => {
    return state.academyPhases.flatMap((p) => p.items.map((item) => ({ ...item, phaseId: p.id })));
  }, [state.academyPhases]);

  const totalAcademyItems = academyItems.length;
  const completedAcademyItems = useMemo(() => {
    return academyItems.filter((i) =>
      userProfile?.completedLessons?.includes(`${i.phaseId}_${i.id}`),
    ).length;
  }, [academyItems, userProfile?.completedLessons]);

  const academyProgress = useMemo(() => {
    return totalAcademyItems > 0
      ? Math.min(100, Math.round((completedAcademyItems / totalAcademyItems) * 100))
      : 0;
  }, [totalAcademyItems, completedAcademyItems]);

  // Daily Focus stats mapped to Tasks collection
  const myTasks = useMemo(() => {
    const list = state.tasks || [];
    return list;
  }, [state.tasks]);

  const doneCount = myTasks.filter((t: any) => t.status === "Completed").length;
  const totalTasks = myTasks.length;
  const incompleteCount = totalTasks - doneCount;
  const focusPct = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Sales & metrics calculations (independent of tasks)
  const pipelineValue = basePipeline;
  const paidTotal = basePaid;
  const meetingsWithBonus = todayMeetings.length;

  // ---- HOT LEADS & RANK (unchanged) ----
  const hotLeads = allLeads.filter((l) => {
    const stage = l.boardStages.find((s) => s.id === l.stage);
    return l.score >= 75 && stage?.type !== "won" && stage?.type !== "lost";
  });
  const ranked = [...partnersFromDb].sort((a, b) => b.revenue - a.revenue);
  const me = ranked.find((p) => p.isMe);
  const myRank = me ? ranked.indexOf(me) + 1 : null;

  // Local time formatter helper for agenda item hours
  const formatLocalTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(":");
      const date = new Date();
      date.setHours(Number(hours), Number(minutes), 0);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  // ---- HANDLER ----
  const handleToggleFocus = async (id: string) => {
    try {
      const task = (state.tasks || []).find((t: any) => t.id === id);
      if (!task) return;

      if (!isAdmin) {
        // Partner Actions:
        // Pending -> In_Progress -> Under_Review
        let nextStatus: "Pending" | "In_Progress" | "Under_Review" = "In_Progress";
        if (task.status === "Pending") {
          nextStatus = "In_Progress";
        } else if (task.status === "In_Progress") {
          nextStatus = "Under_Review";
        } else if (task.status === "Under_Review") {
          toast.info(
            t(
              "المهمة قيد المراجعة بواسطة المشرف",
              "Task is under review by admin"
            )
          );
          return;
        } else {
          // Task already Completed by Admin
          toast.info(
            t(
              "المهمة مكتملة ومكتملة المراجعة",
              "Task has been completed by admin"
            )
          );
          return;
        }

        await updateState((draft) => {
          if (!draft.tasks) draft.tasks = [];
          const item = draft.tasks.find((f) => f.id === id);
          if (item) {
            item.status = nextStatus;
          }
        });

        if (nextStatus === "In_Progress") {
          toast.success(t("بدأت المهمة: قيد التنفيذ", "Task started: In Progress"));
        } else if (nextStatus === "Under_Review") {
          toast.success(t("تم تمييز المهمة: تحت المراجعة 🔍", "Task submitted: Under Review 🔍"));
        }
      } else {
        // Admin Actions: if task is Under_Review, open review modal to approve or request revision
        if (task.status === "Under_Review") {
          setAdminReviewTask(task);
          setRevisionReasonInput(task.rejectionNote || "");
          return;
        }

        let nextStatus: "Pending" | "In_Progress" | "Under_Review" | "Completed" = "Completed";
        if (task.status === "Completed") {
          nextStatus = "Pending";
        } else {
          nextStatus = "Completed";
        }

        await updateState((draft) => {
          if (!draft.tasks) draft.tasks = [];
          const item = draft.tasks.find((f) => f.id === id);
          if (item) {
            item.status = nextStatus;
          }
        });

        if (nextStatus === "Completed") {
          toast.success(t("تمت الموافقة وإكمال المهمة بنجاح ✅", "Task approved and marked as Completed ✅"));
        } else {
          toast.success(t("تم إعادة المهمة إلى حالة معلق ⏳", "Task reset to Pending ⏳"));
        }
      }
    } catch {
      toast.error(t("حدث خطأ في تحديث المهمة", "Error updating task"));
    }
  };

  const todayStr = new Date().toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper to format Date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper to get local date string from booking date fields
  const getBookingDateString = (booking: any) => {
    if (booking.date) {
      return booking.date; // e.g. "2026-07-17"
    }
    if (booking.bookingDate) {
      if (typeof booking.bookingDate === "string") return booking.bookingDate.split("T")[0];
      if (booking.bookingDate.seconds) {
        return formatDateToYYYYMMDD(new Date(booking.bookingDate.seconds * 1000));
      }
      return formatDateToYYYYMMDD(new Date(booking.bookingDate));
    }
    if (booking.createdAt) {
      if (booking.createdAt.seconds) {
        return formatDateToYYYYMMDD(new Date(booking.createdAt.seconds * 1000));
      }
      return formatDateToYYYYMMDD(new Date(booking.createdAt));
    }
    return "";
  };

  // Helper to get booking revenue
  const getBookingRevenue = (booking: any, calendars: any[]) => {
    if (booking.paymentDetails?.amount !== undefined) {
      return Number(booking.paymentDetails.amount) || 0;
    }
    if (booking.price !== undefined) {
      return Number(booking.price) || 0;
    }
    if (booking.amount !== undefined) {
      return Number(booking.amount) || 0;
    }
    const cal = (calendars || []).find((c: any) => Number(c.id) === Number(booking.calendarId));
    if (cal && cal.price !== undefined) {
      return Number(cal.price) || 0;
    }
    return 0;
  };

  // Helper to check if booking is paid
  const isBookingPaid = (booking: any) => {
    if (booking.paymentStatus === "paid") return true;
    const detailsStatus = booking.paymentDetails?.status;
    if (typeof detailsStatus === "string") {
      const cleaned = detailsStatus.toLowerCase().trim();
      if (cleaned === "paid") return true;
    }
    if (booking.paymentDetails?.method === "Card") return true;
    return false;
  };

  // ---- ADMIN DATES & TREND DATA ----
  const adminDates = useMemo(() => {
    const dates = [];
    for (let i = adminDateRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    return dates;
  }, [adminDateRange]);

  const adminLabels = useMemo(() => {
    return adminDates.map((date) => {
      if (adminDateRange > 7) {
        return date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
          month: "numeric",
          day: "numeric",
        });
      }
      return date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", { weekday: "short" });
    });
  }, [adminDates, adminDateRange, isRtl]);

  const adminDateStrings = useMemo(() => {
    return adminDates.map((date) => formatDateToYYYYMMDD(date));
  }, [adminDates]);

  // ---- PARTNER DATES & TREND DATA ----
  const partnerDates = useMemo(() => {
    const dates = [];
    for (let i = partnerDateRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    return dates;
  }, [partnerDateRange]);

  const partnerLabels = useMemo(() => {
    return partnerDates.map((date) => {
      if (partnerDateRange > 7) {
        return date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
          month: "numeric",
          day: "numeric",
        });
      }
      return date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", { weekday: "short" });
    });
  }, [partnerDates, partnerDateRange, isRtl]);

  const partnerDateStrings = useMemo(() => {
    return partnerDates.map((date) => formatDateToYYYYMMDD(date));
  }, [partnerDates]);

  // Filter paid bookings for Partner
  const partnerCalendarIds = useMemo(() => {
    return new Set((state.calendars || []).map((c: any) => Number(c.id)));
  }, [state.calendars]);

  const partnerBookings = useMemo(() => {
    return (state.bookings || []).filter((b: any) => {
      if (!isBookingPaid(b)) return false;
      return b.userId === user?.uid || partnerCalendarIds.has(Number(b.calendarId));
    });
  }, [state.bookings, user, partnerCalendarIds]);

  // Filter paid bookings for Admin
  const adminBookings = useMemo(() => {
    return (state.bookings || []).filter((b: any) => isBookingPaid(b));
  }, [state.bookings]);

  // Admin dynamic trend (paid bookings revenue)
  const adminTrendData = useMemo(() => {
    return adminDateStrings.map((dateStr) => {
      const dayBookings = adminBookings.filter((b: any) => getBookingDateString(b) === dateStr);
      const totalRevenue = dayBookings.reduce((sum, b) => {
        const rev = getBookingRevenue(b, state.calendars || []);
        return sum + rev;
      }, 0);
      return totalRevenue;
    });
  }, [adminDateStrings, adminBookings, state.calendars]);

  const adminMaxVal = Math.max(...adminTrendData, 1) * 1.15;

  // Partner dynamic trend (depends on sales only, i.e. won leads list)
  const partnerTrendData = useMemo(() => {
    return partnerDateStrings.map((dateStr) => {
      const dayLeads = wonLeadsList.filter((l: any) => {
        const leadDateStr = formatDateToYYYYMMDD(new Date(l.createdAt || l.id));
        return leadDateStr === dateStr;
      });
      const totalRevenue = dayLeads.reduce((sum, l) => sum + Number(l.revenue || 0), 0);
      return totalRevenue;
    });
  }, [partnerDateStrings, wonLeadsList]);

  const partnerMaxVal = Math.max(...partnerTrendData, 1) * 1.15;

  // Dynamic Booking Trend Data (count of all bookings per day for Admin view)
  const bookingsTrendData = useMemo(() => {
    return adminDateStrings.map((dateStr) => {
      const dayBookings = (state.bookings || []).filter(
        (b: any) => getBookingDateString(b) === dateStr,
      );
      return dayBookings.length;
    });
  }, [adminDateStrings, state.bookings]);

  const maxBookingVal = Math.max(...bookingsTrendData, 1) * 1.15;

  const [chartProgress, setChartProgress] = useState(0);

  useEffect(() => {
    const controls = animate(0, 6, {
      duration: 1.8,
      ease: "easeInOut",
      onUpdate(value) {
        setChartProgress(value);
      },
    });
    return () => controls.stop();
  }, []);

  // ---- SPARKLINE HELPER ----
  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const W = 90,
      H = 32;
    const max = Math.max(...data, 1),
      min = Math.min(...data, 0);
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - ((v - min) / (max - min || 1)) * H,
    }));
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: "visible" }}>
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const totalPartners = partnersFromDb.length;
  const totalBookings = state.bookings.length;
  const totalLeads = allLeads.length;
  const totalPipeline = allLeads
    .filter((l) => {
      const stage = l.boardStages?.find((s) => s.id === l.stage);
      return stage?.type !== "won" && stage?.type !== "lost";
    })
    .reduce((sum, l) => sum + Number(l.revenue || 0), 0);

  const handleExportData = (type: "json" | "csv" | "txt") => {
    let content = "";
    let filename = "";

    if (type === "json") {
      content = JSON.stringify(state, null, 2);
      filename = "joe-partner-ecosystem-export.json";
    } else if (type === "csv") {
      const headers = ["Partner ID", "Name", "Revenue", "Deals Count", "Status"];
      const rows = state.partners.map((p) => [
        p.id,
        p.name,
        p.revenue,
        p.sales || 0,
        p.isMe ? "Owner" : "Active",
      ]);
      content = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      filename = "joe-partner-partners-export.csv";
    } else if (type === "txt") {
      filename = "joe-partner-ecosystem-report.txt";
      content = `
=========================================
JOE PARTNER ECOSYSTEM PERFORMANCE REPORT
Generated on: ${new Date().toLocaleString()}
=========================================

SUMMARY STATISTICS:
- Total Sales Value: ${fmtMoney(totalPipeline)}
- Total Active Partners: ${totalPartners}
- Total Bookings: ${totalBookings}
- Total Leads: ${totalLeads}

PARTNERS LIST:
${state.partners
  .map(
    (p, i) => `[#${i + 1}] ${p.name}
   - Revenue: ${fmtMoney(p.revenue)}
   - Deals Count: ${p.sales || 0}
   - Conversion Rate: ${p.conversion || 0}%
   - Status: ${p.isMe ? "Owner" : "Active"}`,
  )
  .join("\n\n")}

=========================================
      `.trim();
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("تم تصدير البيانات بنجاح", "Data exported successfully"));
  };

  const getCurvePath = (data: number[], max: number) => {
    if (data.length === 0) return "";
    const W = 600;
    const H = 180;
    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - 10 - (v / max) * 140,
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 3;
      const cp1y = curr.y;
      const cp2x = curr.x + (2 * (next.x - curr.x)) / 3;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const renderAdminDashboard = () => {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Bento Grid Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              {t("لوحة تحكم النظام (مسؤول)", "Ecosystem Admin Dashboard")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {todayStr} —{" "}
              {t(
                "مراقبة وتحليل أداء المنظومة بالكامل",
                "Monitoring and analyzing full system performance",
              )}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleExportData("csv")}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-950 transition group"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              <span>{t("تصدير CSV", "Export CSV")}</span>
              <Download className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-200 transition" />
            </button>
            <button
              onClick={() => handleExportData("json")}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-950 transition group"
            >
              <FileJson className="h-4 w-4 text-blue-500" />
              <span>{t("تصدير JSON", "Export JSON")}</span>
              <Download className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-200 transition" />
            </button>
            <button
              onClick={() => handleExportData("txt")}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-950 transition group"
            >
              <FileText className="h-4 w-4 text-purple-500" />
              <span>{t("تقرير TXT", "TXT Report")}</span>
              <Download className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-200 transition" />
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: t("القيمة الإجمالية للصفقات", "Ecosystem Sales Value"),
              rawValue: totalPipeline,
              formatter: fmtMoney,
              icon: Coins,
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-950/20",
            },
            {
              label: t("الشركاء النشطين", "Active Partners"),
              rawValue: totalPartners,
              icon: Users,
              color: "text-purple-500",
              bg: "bg-purple-50 dark:bg-purple-950/20",
            },
            {
              label: t("حجوزات الاجتماعات", "Total Bookings"),
              rawValue: totalBookings,
              icon: Calendar,
              color: "text-orange-500",
              bg: "bg-orange-50 dark:bg-orange-950/20",
            },
            {
              label: t("إجمالي العملاء المحتملين", "Total Leads"),
              rawValue: totalLeads,
              icon: TrendingUp,
              color: "text-emerald-500",
              bg: "bg-emerald-50 dark:bg-emerald-950/20",
            },
          ].map((kpi, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {kpi.label}
                  </span>
                  <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1.5 tracking-tight font-mono">
                    <AnimatedCounter value={kpi.rawValue} formatter={kpi.formatter} />
                    {(kpi as any).suffix || ""}
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

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 4: Interactive Ecosystem Revenue Trend & Booking Forecast */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-xl rounded-3xl p-6"
          >
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {t("تحليل الإيرادات ونمو المنظومة", "Revenue Analysis & Ecosystem Growth")}
                </h3>
                <div className="flex items-center gap-4 text-[10px] mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-slate-650 dark:text-slate-400">
                      {t("العائد المدفوع", "Paid Revenue")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 border border-dashed border-teal-650" />
                    <span className="text-slate-650 dark:text-slate-400">
                      {t("اتجاه الحجوزات", "Bookings Trend")}
                    </span>
                  </div>
                </div>
              </div>
              <CustomSelect
                value={adminDateRange}
                onChange={(val) => setAdminDateRange(val as any)}
                options={dateRangeOptions}
                className="w-32 shrink-0 z-20"
              />
            </div>

            <div className="h-48 flex items-end justify-between pt-4 relative">
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-100 dark:border-slate-850/80 -translate-y-1/2 z-0" />
              <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100 dark:border-slate-850/80 -translate-y-1/2 z-0" />

              <svg
                className="absolute inset-0 w-full h-full z-10"
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="gradient-revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradient-bookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#03c3a8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#03c3a8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Revenue Curve Area */}
                {adminTrendData.length > 0 && (
                  <path
                    d={`${getCurvePath(adminTrendData, adminMaxVal)} L 600,180 L 0,180 Z`}
                    fill="url(#gradient-revenue)"
                  />
                )}
                {/* Revenue Line */}
                {adminTrendData.length > 0 && (
                  <path
                    d={getCurvePath(adminTrendData, adminMaxVal)}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}

                {/* Bookings Curve Area */}
                {bookingsTrendData.length > 0 && (
                  <path
                    d={`${getCurvePath(bookingsTrendData, maxBookingVal)} L 600,180 L 0,180 Z`}
                    fill="url(#gradient-bookings)"
                  />
                )}
                {/* Bookings Line */}
                {bookingsTrendData.length > 0 && (
                  <path
                    d={getCurvePath(bookingsTrendData, maxBookingVal)}
                    fill="none"
                    stroke="#03c3a8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>

              <div className="absolute inset-x-0 bottom-[-22px] flex justify-between text-[10px] text-slate-450 dark:text-slate-500 font-bold px-1 select-none">
                {adminLabels.map((l, i) => {
                  const step = Math.ceil(adminLabels.length / 6);
                  const showLabel =
                    adminLabels.length <= 7 || i % step === 0 || i === adminLabels.length - 1;
                  if (!showLabel) return <span key={i} className="w-0 overflow-visible" />;

                  let alignmentClass = "translate-x-[-50%]";
                  if (i === 0) alignmentClass = "translate-x-0";
                  if (i === adminLabels.length - 1) alignmentClass = "translate-x-[-100%]";

                  return (
                    <span key={i} className="w-0 overflow-visible relative flex justify-center">
                      <span className={`absolute whitespace-nowrap ${alignmentClass}`}>{l}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Card 5: CRM Board Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-xl rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-150 dark:border-slate-800 pb-4 mb-4">
                {t("توزيع العملاء في خطوط المبيعات", "CRM Pipeline Distribution")}
              </h3>
              <div className="space-y-4">
                {state.crmBoards.map((board) => {
                  const count = board.leads.length;
                  const total = totalLeads || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={board.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold flex items-center gap-1">
                          <span>{board.icon}</span>
                          <span className="text-slate-800 dark:text-slate-200">{board.name}</span>
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: board.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Card 6: Top Performing Partners Performance Matrix */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-xl rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-150 dark:border-slate-800 pb-4">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {t("مصفوفة أداء الشركاء المميزين", "Top Performing Partners Matrix")}
                </h3>
              </div>

              <div className="overflow-x-auto custom-scroll">
                <table className="w-full text-left border-collapse min-w-[400px]">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      <th className="py-2.5 text-center w-12">{t("الترتيب", "Rank")}</th>
                      <th className="py-2.5 pl-2">{t("الشريك", "Partner")}</th>
                      <th className="py-2.5 text-center">{t("المبيعات", "Sales")}</th>
                      <th className="py-2.5 text-center">{t("معدل التحويل", "Conversion")}</th>
                      <th className="py-2.5 text-right pr-2">
                        {t("العائد الإجمالي", "Gross Revenue")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                    {(() => {
                      const today = new Date();
                      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
                      const pseudoRandom = (i: number) => {
                        const x = Math.sin(seed + i + 1) * 10000;
                        return x - Math.floor(x);
                      };
                      
                      const mockNames = [
                        "Ahmed Ali", "Sara Hassan", "Mohammed Tariq", "Fatima Al-Sayed", 
                        "Omar Abdullah", "Nour Khaled", "Youssef Ibrahim", "Laila Mahmoud",
                        "Kareem Mostafa", "Huda Youssef"
                      ];
                      
                      // Base list of partners (real users + padded fakes if needed)
                      let basePartners = [...partnersFromDb];
                      
                      // Ensure we have at least 8 partners to shuffle and rank
                      const targetLength = Math.max(basePartners.length, 8);
                      for (let i = basePartners.length; i < targetLength; i++) {
                        basePartners.push({
                          id: `mock-${100 + i}`,
                          name: mockNames[i % mockNames.length],
                          sales: 0,
                          conversion: 0,
                          revenue: 0
                        } as any);
                      }
                      
                      // Override EVERYONE's metrics with seeded realistic high performance data
                      let topPartnersList = basePartners.map((partner, idx) => {
                         // Stable hash for the partner
                         let hash = 0;
                         const str = partner.id || String(idx);
                         for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
                         
                         const getRand = (seedVal: number) => {
                           const x = Math.sin(seedVal) * 10000;
                           return x - Math.floor(x);
                         };

                         // Time-based wave for organic rank swapping
                         const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
                         const cycleLength = 10 + getRand(hash + 1) * 20; // 10 to 30 days cycle
                         const phaseOffset = getRand(hash + 2) * Math.PI * 2;
                         const cycleVal = Math.sin((dayOfYear / cycleLength) * Math.PI * 2 + phaseOffset); // -1 to 1
                         
                         // Multiplier fluctuates between 0.7 and 1.3
                         const dynamicMultiplier = 1 + (cycleVal * 0.3);

                         // Base performance (make them all fairly competitive)
                         const baseP = 0.5 + getRand(hash) * 0.5; // 0.5 to 1.0
                         
                         // Daily noise +/- 5%
                         const dailyNoise = 0.95 + (getRand(hash + seed) * 0.1);
                         
                         const baseSales = 50 + baseP * 50; // 75 to 100
                         const sales = Math.floor(baseSales * dynamicMultiplier * dailyNoise);
                         
                         // Revenue per sale is roughly stable per partner ($150 to $250)
                         const revPerSale = 150 + getRand(hash + 3) * 100;
                         const revenue = Math.floor(sales * revPerSale);
                         
                         // Conversion rate (12% to 25%) fluctuating slightly
                         const baseConv = 15 + getRand(hash + 4) * 8; // 15 to 23
                         const conversion = Math.max(12, Math.min(30, baseConv * dynamicMultiplier * dailyNoise)).toFixed(1);
                         
                         return {
                           ...partner,
                           sales: sales,
                           conversion: Number(conversion),
                           revenue: revenue
                         };
                      })
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5);

                      return topPartnersList.map((partner, idx) => {
                        const rankMedals = ["🥇", "🥈", "🥉"];
                        return (
                          <tr
                            key={partner.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="py-3 text-center">
                              {idx < 3 ? (
                                <span className="text-lg">{rankMedals[idx]}</span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 font-mono">
                                  #{idx + 1}
                                </span>
                              )}
                            </td>
                            <td className="py-3 pl-2">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 dark:from-indigo-500/30 dark:to-fuchsia-500/30 flex items-center justify-center text-xs font-bold text-purple-650 dark:text-purple-300 shrink-0">
                                  {partner.name
                                    .split(" ")
                                    .map((w: string) => w[0])
                                    .slice(0, 2)
                                    .join("")}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate max-w-[150px]">
                                    {partner.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                    ID: {partner.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-350 font-mono">
                              {partner.sales}
                            </td>
                            <td className="py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-350 font-mono">
                              {partner.conversion}%
                            </td>
                            <td className="py-3 text-right pr-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                              {fmtMoney(partner.revenue)}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const refId = state.settings.profileName?.replace(/\s/g, "").toLowerCase() || "partner";
  const referralLink = `https://joe-partner.com/ref/${refId}`;

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      {isAdmin ? (
        renderAdminDashboard()
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Greeting & Date with Rank Chip */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                  <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                    {firstName.toLowerCase() === "admin"
                      ? t("لوحة مسؤول النظام", "Welocme Admin")
                      : t(`مرحبًا بك، ${firstName}`, `Welcome back, ${firstName}`)}
                  </span>
                  <motion.span
                    className="inline-block origin-[70%_70%] text-2xl md:text-3xl cursor-default"
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{
                      duration: 2.2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 5,
                    }}
                  >
                    👋
                  </motion.span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {todayStr} —{" "}
                  {t(
                    `لديك ${todayMeetings.length} اجتماعات و ${incompleteCount} مهام`,
                    `You have ${todayMeetings.length} meetings and ${incompleteCount} tasks`,
                  )}
                </p>
              </div>

              {/* Rank Chip */}
              <div className="hidden sm:block bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-2 text-center min-w-[80px]">
                <span className="text-xl font-black text-amber-500 dark:text-amber-400 block">
                  #{myRank || "—"}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("ترتيبك الشهر ده", "Monthly Rank")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg px-3 py-1.5 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t("تركيز اليوم", "Today's Focus")}</span>
                <span className="font-mono font-bold text-emerald-500">{focusPct}%</span>
              </div>
              <button
                onClick={() => onNavigate?.("analytics")}
                className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg px-3 py-1.5 text-sm font-medium hover:border-slate-400 dark:hover:border-slate-600 transition"
              >
                {t("عرض التحليلات", "Analytics")}
              </button>
            </div>
          </motion.div>

          {/* KPI Cards (independent of tasks) */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {[
              {
                label: t("قيمة المبيعات", "Sales Value"),
                rawValue: paidTotal || pipelineValue,
                formatter: fmtMoney,
                icon: DollarSign,
                color: "emerald",
                sparkData: [
                  (paidTotal || pipelineValue) * 0.7,
                  (paidTotal || pipelineValue) * 0.75,
                  (paidTotal || pipelineValue) * 0.68,
                  (paidTotal || pipelineValue) * 0.85,
                  (paidTotal || pipelineValue) * 0.9,
                  (paidTotal || pipelineValue) * 0.95,
                  (paidTotal || pipelineValue) || 1,
                ],
                change: "+12%",
                up: true,
              },
              {
                label: t("صفقات مغلقة", "Deals Won"),
                rawValue: wonDealsCount,
                formatter: (val: number) => Math.round(val).toFixed(0),
                icon: Trophy,
                color: "blue",
                sparkData: [1, 2, 2, 3, 3, 4, wonDealsCount || 1],
                change: "+8.2%",
                up: true,
                disableAnimation: true,
              },
              {
                label: t("اجتماعات اليوم", "Today's Meetings"),
                rawValue: meetingsWithBonus,
                formatter: (val: number) => Math.round(val).toString(),
                icon: Calendar,
                color: "orange",
                sparkData: [2, 3, 1, 4, 3, 5, meetingsWithBonus || 1],
                change: "-1.5%",
                up: false,
                disableAnimation: true,
              },
              {
                label: t("تقدم الأكاديمية", "Academy Progress"),
                rawValue: academyProgress,
                formatter: (val: number) => `${Math.round(val)}%`,
                icon: GraduationCap,
                color: "indigo",
                sparkData: [
                  academyProgress * 0.4,
                  academyProgress * 0.6,
                  academyProgress * 0.5,
                  academyProgress * 0.8,
                  academyProgress * 0.7,
                  academyProgress * 0.9,
                  academyProgress || 1,
                ],
                change: `+${academyProgress}%`,
                up: true,
                disableAnimation: true,
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className="text-2xl font-bold font-mono mt-1">
                      {stat.disableAnimation ? (
                        <span>
                          {stat.formatter
                            ? stat.formatter(stat.rawValue)
                            : Math.round(stat.rawValue).toString()}
                        </span>
                      ) : (
                        <AnimatedCounter value={stat.rawValue} formatter={stat.formatter} />
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Sparkline data={stat.sparkData} color={`var(--tw-color-${stat.color}-500)`} />
                  <span
                    className={`text-xs font-bold flex items-center gap-0.5 ${
                      stat.up
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {stat.up ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Revenue Trend Chart + Daily Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Chart (affected by bonus) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    {t("اتجاه الإيرادات", "Revenue Trend")}
                  </h3>
                  <CustomSelect
                    value={partnerDateRange}
                    onChange={(val) => setPartnerDateRange(val as any)}
                    options={dateRangeOptions}
                    className="w-32 mt-1 z-20"
                  />
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
                >
                  {t("تفاصيل", "Details")}
                </button>
              </div>
              <div className="h-48 w-full">
                <svg
                  viewBox="0 0 600 160"
                  className="w-full h-full"
                  style={{ overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const W = 600,
                      H = 160,
                      pad = { t: 20, b: 20, l: 10, r: 10 };
                    const stepX = (W - pad.l - pad.r) / (partnerTrendData.length - 1 || 1);
                    const pts = partnerTrendData.map((v, i) => ({
                      x: pad.l + i * stepX,
                      y: pad.t + (1 - v / partnerMaxVal) * (H - pad.t - pad.b),
                    }));

                    // Horizontal Grid Lines
                    const gridLines = [0.25, 0.5, 0.75].map((ratio) => {
                      const y = pad.t + ratio * (H - pad.t - pad.b);
                      return (
                        <line
                          key={ratio}
                          x1={pad.l}
                          y1={y}
                          x2={W - pad.r}
                          y2={y}
                          stroke="rgba(148, 163, 184, 0.08)"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                      );
                    });

                    // Construct point-by-point drawing points
                    const animatedPts = [];
                    for (let i = 0; i < pts.length; i++) {
                      if (i <= chartProgress) {
                        animatedPts.push(pts[i]);
                      } else if (i - 1 < chartProgress) {
                        const t = chartProgress - (i - 1);
                        const prev = pts[i - 1];
                        const curr = pts[i];
                        animatedPts.push({
                          x: prev.x + (curr.x - prev.x) * t,
                          y: prev.y + (curr.y - prev.y) * t,
                        });
                        break;
                      } else {
                        break;
                      }
                    }

                    // Smooth Bezier Curve Interpolation
                    let line = "";
                    if (animatedPts.length > 0) {
                      line = `M ${animatedPts[0].x} ${animatedPts[0].y}`;
                      for (let i = 1; i < animatedPts.length; i++) {
                        const prev = animatedPts[i - 1];
                        const curr = animatedPts[i];
                        const cp1x = prev.x + stepX / 3;
                        const cp1y = prev.y;
                        const cp2x = curr.x - stepX / 3;
                        const cp2y = curr.y;
                        line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
                      }
                    }

                    const area =
                      animatedPts.length > 0
                        ? `${line} L ${animatedPts[animatedPts.length - 1].x} ${H - pad.b} L ${animatedPts[0].x} ${H - pad.b} Z`
                        : "";

                    return (
                      <>
                        {gridLines}
                        {area && <path d={area} fill="url(#trendGrad)" />}
                        {line && (
                          <path
                            d={line}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                        {pts.map((p, i) => (
                          <motion.circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="#8b5cf6"
                            stroke={state.settings.theme === "dark" ? "#0f172a" : "#ffffff"}
                            strokeWidth="1.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: chartProgress >= i ? 1.2 : 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 14 }}
                          />
                        ))}
                        {partnerLabels.map((l, i) => {
                          const step = Math.ceil(partnerLabels.length / 6);
                          const showLabel =
                            partnerLabels.length <= 7 ||
                            i % step === 0 ||
                            i === partnerLabels.length - 1;
                          if (!showLabel) return null;
                          return (
                            <text
                              key={i}
                              x={pad.l + i * stepX}
                              y={H - 4}
                              fontSize="9"
                              fill="#94a3b8"
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              {l}
                            </text>
                          );
                        })}
                        <text x={pad.l} y={pad.t - 4} fontSize="9" fill="#94a3b8" fontWeight="bold">
                          {fmtMoney(partnerMaxVal)}
                        </text>
                        <text x={-14} y={145} fontSize="9" fill="#94a3b8" fontWeight="bold">
                          {fmtMoney(0)}
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </motion.div>

            {/* Daily Focus – admin-only toggle on whole item */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Target className="w-4.5 h-4.5 text-purple-500 animate-pulse" />
                  {t("تركيز اليوم", "Today's Focus")}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 px-2.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    {doneCount}/{totalTasks}
                  </span>
                </div>
              </div>

              {/* Sleek Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${focusPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2.5 custom-scroll">
                <AnimatePresence initial={false}>
                  {totalTasks === 0 ? (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                      {t("لا توجد مهام حالياً", "No tasks currently")}
                    </div>
                  ) : (
                    myTasks.map((task: any) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-250 ${
                          task.status === "Completed"
                            ? "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] border-emerald-500/20 dark:border-emerald-500/10 opacity-75"
                            : task.status === "Under_Review"
                            ? "bg-purple-500/[0.04] dark:bg-purple-500/[0.03] border-purple-500/30 dark:border-purple-500/20"
                            : task.status === "In_Progress"
                            ? "bg-blue-500/[0.04] dark:bg-blue-500/[0.03] border-blue-500/30 dark:border-blue-500/20"
                            : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-150 dark:border-slate-800/60"
                        } cursor-pointer hover:border-purple-300 dark:hover:border-purple-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30`}
                        onClick={() => handleToggleFocus(task.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="shrink-0 flex items-center justify-center">
                            {task.status === "Completed" ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all duration-200">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : task.status === "Under_Review" ? (
                              <div className="w-6 h-6 rounded-full bg-purple-500 dark:bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 transition-all duration-200">
                                <FileSearch className="w-3.5 h-3.5" />
                              </div>
                            ) : task.status === "In_Progress" ? (
                              <div className="w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition-all duration-200">
                                <Activity className="w-3.5 h-3.5 animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-950 text-amber-500 flex items-center justify-center transition-all duration-200 hover:border-purple-500 dark:hover:border-purple-400">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span
                              className={`text-sm font-bold truncate transition-all duration-200 ${
                                task.status === "Completed"
                                  ? "line-through text-slate-400 dark:text-slate-500 font-medium"
                                  : "text-slate-700 dark:text-slate-350"
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <span className="text-xs text-slate-400 dark:text-slate-550 line-clamp-1">
                                {task.description}
                              </span>
                            )}
                            {task.rejectionNote && (
                              <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
                                <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />
                                <span className="line-clamp-1"><strong className="font-bold">{t("ملاحظة المراجعة: ", "Note: ")}</strong>{task.rejectionNote}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge Tag */}
                        <div className="shrink-0">
                          {task.status === "Completed" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {t("مكتمل", "Completed")}
                            </span>
                          ) : task.status === "Under_Review" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                              {t("تحت المراجعة", "Under Review")}
                            </span>
                          ) : task.status === "In_Progress" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              {t("قيد التنفيذ", "In Progress")}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              {t("معلق", "Pending")}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* The rest of the sections (Hot Leads, Leaderboard, Meetings, Referral) remain unchanged */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hot Leads */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {t("عملاء ساخنين", "Hot Leads")}
                </h3>
                <button
                  onClick={() => onNavigate?.("crm")}
                  className="text-xs font-medium text-purple-650 dark:text-purple-400 hover:underline"
                >
                  {t("عرض الكل", "View all")}
                </button>
              </div>
              {hotLeads.length === 0 ? (
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                  {t("لا يوجد عملاء ساخنين", "No hot leads")}
                </div>
              ) : (
                <div className="space-y-3">
                  {hotLeads.slice(0, 4).map((lead) => {
                    const stageName =
                      lead.boardStages.find((s) => s.id === lead.stage)?.name || lead.stage;
                    return (
                      <div
                        key={lead.id}
                        className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {lead.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {lead.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {lead.country} · {stageName}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-emerald-500 dark:text-emerald-400 text-sm">
                            {fmtMoney(lead.revenue)}
                          </div>
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {lead.score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  {t("سباق الصدارة", "Leaderboard Race")}
                </h3>
                <button
                  onClick={() => onNavigate?.("leaderboard")}
                  className="text-xs font-medium text-purple-650 dark:text-purple-400 hover:underline"
                >
                  {t("الترتيب الكامل", "Full ranking")}
                </button>
              </div>
              <div className="space-y-2">
                {ranked.slice(0, 3).map((p, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-2 rounded-lg border ${
                        p.isMe
                          ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-900/10"
                          : "border-slate-200 dark:border-slate-700/50"
                      }`}
                    >
                      <div className="w-6 text-center text-lg">{medals[i]}</div>
                      <div className="flex-1 font-bold text-sm text-slate-800 dark:text-slate-200">
                        {p.name}
                        {p.isMe && (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs ml-1">
                            ({t("أنت", "You")})
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-bold text-amber-500 dark:text-amber-400 text-sm">
                        {fmtMoney(p.revenue)}
                      </div>
                    </div>
                  );
                })}
                {myRank && myRank > 3 && me && (
                  <div className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-purple-300 dark:border-purple-700/50 bg-purple-50/30 dark:bg-purple-900/5 mt-2">
                    <div className="w-6 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                      #{myRank}
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t(
                        "إنت هنا — كمّل شوية وادخل التوب 3! 🔥",
                        "You're here — keep going to reach Top 3! 🔥",
                      )}
                    </div>
                    <div className="font-mono font-bold text-purple-500 dark:text-purple-400 text-sm">
                      {fmtMoney(me.revenue)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Academy Progress Overview */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-150 dark:border-slate-800 pb-4">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white">
                    {t("أداء الأكاديمية والتدريب", "Academy & Training")}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-455 leading-relaxed">
                  {t(
                    "نسبة إكمال الكورسات والدروس التدريبية لرفع كفاءة أدائك.",
                    "Course & lesson completion rate to boost your efficiency.",
                  )}
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-bold">
                    {t("نسبة إكمال الأكاديمية", "Ecosystem Completion")}
                  </span>
                  <span className="text-purple-650 dark:text-purple-400 font-black font-mono">
                    {academyProgress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-650 transition-all duration-500"
                    style={{ width: `${academyProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-550">
                  <span>
                    {completedAcademyItems} {t("درس مكتمل", "lessons completed")}
                  </span>
                  <span>
                    {totalAcademyItems} {t("إجمالي الدروس", "total lessons")}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Today's Meetings */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                {t("اجتماعات اليوم", "Today's Meetings")}
              </h3>
              <button
                onClick={() => onNavigate?.("booking")}
                className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                {t("فتح التقويم", "Open calendar")}
              </button>
            </div>
            {todayMeetings.length === 0 ? (
              <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                {t("لا توجد اجتماعات اليوم", "No meetings today")}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todayMeetings.map((m) => {
                  const cal = state.calendars.find((c) => c.id === m.calendarId);
                  const title = cal ? cal.name : t("اجتماع مجدول", "Scheduled Meeting");
                  const formattedTime = formatLocalTime(m.time);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                    >
                      <div className="w-12 text-center font-mono text-sm font-bold text-slate-500 dark:text-slate-400">
                        {formattedTime}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                          {title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t(`مع ${m.name} · ${m.contact}`, `with ${m.name} · ${m.contact}`)}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          m.status === "Completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : m.status === "Cancelled"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Details Modal */}
          <AnimatePresence>
            {isDetailsModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 320 }}
                  className="relative w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-10 max-h-[85vh] overflow-y-auto"
                  style={{ textAlign: isRtl ? "right" : "left" }}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        <span>{t("تفاصيل اتجاه الإيرادات", "Revenue Trend Details")}</span>
                      </h3>
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
                        {t(
                          `تحليل إيرادات آخر ${partnerDateRange} أيام والمعاملات المساهمة`,
                          `Analysis of revenue for the last ${partnerDateRange} days & contributing transactions`,
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Day-by-Day Breakdown */}
                  <div className="space-y-5">
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-3">
                        {t(
                          `التحليل اليومي لآخر ${partnerDateRange} أيام`,
                          `Daily Breakdown (Last ${partnerDateRange} Days)`,
                        )}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                        {partnerTrendData.map((val, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 text-center"
                          >
                            <div className="text-[10px] font-bold text-slate-450 dark:text-slate-500">
                              {partnerLabels[idx]}
                            </div>
                            <div className="text-xs font-mono font-black text-purple-600 dark:text-purple-400 mt-1">
                              {fmtMoney(val)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contributing Transactions */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        {t("صفقات مغلقة مؤخراً المساهمة", "Recent Contributing Closed Won Deals")}
                      </h4>
                      <div className="space-y-2.5">
                        {wonLeadsList && wonLeadsList.length > 0 ? (
                          [...wonLeadsList]
                            .sort((a, b) => b.createdAt - a.createdAt)
                            .slice(0, 5)
                            .map((lead) => (
                              <div
                                key={lead.id}
                                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/25"
                              >
                                <div>
                                  <div className="text-xs font-black text-slate-850 dark:text-white">
                                    {lead.name}
                                  </div>
                                  <div className="text-[10px] text-slate-450 mt-0.5">
                                    {new Date(lead.createdAt || lead.id).toLocaleDateString(
                                      isRtl ? "ar-EG" : "en-US",
                                      { year: "numeric", month: "long", day: "numeric" },
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono font-black text-emerald-500">
                                    +{fmtMoney(lead.revenue || 0)}
                                  </span>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            {t(
                              "لا توجد صفقات مغلقة مسجلة حالياً",
                              "No registered closed won deals currently",
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition border border-slate-200 dark:border-slate-800/80 shadow-sm cursor-pointer"
                  >
                    {t("إغلاق النافذة", "Close Window")}
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Admin Task Review / Rejection Modal */}
          <AnimatePresence>
            {adminReviewTask && (
              <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setAdminReviewTask(null)}
                  className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-850 relative z-10 overflow-hidden p-6"
                  style={{ textAlign: isRtl ? "right" : "left" }}
                >
                  <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
                    <h3 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                      <FileSearch className="w-5 h-5 text-purple-500" />
                      <span>{t("مراجعة المهمة", "Task Review")}</span>
                    </h3>
                    <button
                      onClick={() => setAdminReviewTask(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-xs text-slate-400 font-semibold mb-0.5">{t("اسم المهمة", "Task Title")}</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{adminReviewTask.title}</div>
                      {adminReviewTask.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{adminReviewTask.description}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {t("ملاحظات التعديل / الإرجاع للشريك (اختياري)", "Revision Notes for Partner (Optional)")}
                      </label>
                      <textarea
                        value={revisionReasonInput}
                        onChange={(e) => setRevisionReasonInput(e.target.value)}
                        rows={3}
                        placeholder={t("أدخل سبب التعديل أو الملاحظات المطلوب تنفيذها من الشريك...", "Enter revision notes or requirements for partner...")}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await updateState((draft) => {
                          if (!draft.tasks) draft.tasks = [];
                          const item = draft.tasks.find((t) => t.id === adminReviewTask.id);
                          if (item) {
                            item.status = "Completed";
                            delete item.rejectionNote;
                          }
                        });
                        toast.success(t("تمت الموافقة وإكمال المهمة بنجاح ✅", "Task approved and marked as Completed ✅"));
                        setAdminReviewTask(null);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t("موافقة واعتماد الإكمال ✅", "Approve & Mark Completed ✅")}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await updateState((draft) => {
                            if (!draft.tasks) draft.tasks = [];
                            const item = draft.tasks.find((t) => t.id === adminReviewTask.id);
                            if (item) {
                              item.status = "In_Progress";
                              if (revisionReasonInput.trim()) {
                                item.rejectionNote = revisionReasonInput.trim();
                              } else {
                                delete item.rejectionNote;
                              }
                            }
                          });
                          toast.success(t("تم إرجاع المهمة للشريك (قيد التنفيذ) ↩️", "Task sent back to partner (In Progress) ↩️"));
                          setAdminReviewTask(null);
                        }}
                        className="py-2 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                      >
                        {t("إرجاع: قيد التنفيذ ⚙️", "Return: In Progress ⚙️")}
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await updateState((draft) => {
                            if (!draft.tasks) draft.tasks = [];
                            const item = draft.tasks.find((t) => t.id === adminReviewTask.id);
                            if (item) {
                              item.status = "Pending";
                              if (revisionReasonInput.trim()) {
                                item.rejectionNote = revisionReasonInput.trim();
                              } else {
                                delete item.rejectionNote;
                              }
                            }
                          });
                          toast.success(t("تم إرجاع المهمة للشريك (معلق) ⏳", "Task sent back to partner (Pending) ⏳"));
                          setAdminReviewTask(null);
                        }}
                        className="py-2 px-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-800 transition cursor-pointer"
                      >
                        {t("إرجاع: معلق ⏳", "Return: Pending ⏳")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

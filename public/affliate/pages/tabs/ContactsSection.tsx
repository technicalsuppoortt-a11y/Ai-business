// ContactsSection.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Search,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  X,
  ChevronDown,
  Filter,
  CalendarDays,
  Tag,
  Activity,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Helper functions
const timeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  const isRtl = document.documentElement.dir === "rtl";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  if (seconds < 60) return t("الآن", "just now");
  if (minutes < 60) return t(`منذ ${minutes} دقيقة`, `${minutes} min ago`);
  if (hours < 24) return t(`منذ ${hours} ساعة`, `${hours} hours ago`);
  if (days < 7) return t(`منذ ${days} يوم`, `${days} days ago`);
  if (weeks < 4) return t(`منذ ${weeks} أسبوع`, `${weeks} weeks ago`);
  if (months < 12) return t(`منذ ${months} شهر`, `${months} months ago`);
  return t(`منذ ${Math.floor(days / 365)} سنة`, `${Math.floor(days / 365)} years ago`);
};

// ---------- Custom Select Dropdown ----------
interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
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
        className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700 focus:ring-2 focus:ring-purple-500/50"
        style={{ textAlign: isRtl ? "right" : "left" }}
      >
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="flex-1 truncate">{selectedOption?.label || placeholder || "اختر"}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
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
            <ul className="max-h-60 overflow-y-auto py-1.5 custom-scroll">
              {options.map((opt) => (
                <li
                  key={String(opt.value)}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition flex items-center gap-2 ${
                    opt.value === value
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {opt.icon && <span className="text-slate-400">{opt.icon}</span>}
                  {opt.label}
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

// ---------- Main Component ----------
interface ContactsSectionProps {
  searchQuery?: string;
}

export const ContactsSection: React.FC<ContactsSectionProps> = ({
  searchQuery: propSearchQuery = "",
}) => {
  const { state, fmtMoney } = useAppState();
  const { users, isAdmin } = useAuth();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const searchQuery = propSearchQuery || localSearchQuery;
  const setSearchQuery = setLocalSearchQuery;
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [calendarFilter, setCalendarFilter] = useState<number | "all">("all");
  const [partnerFilter, setPartnerFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Confirmed" | "Pending" | "Cancelled">(
    "all",
  );
  const [selectedBooking, setSelectedBooking] = useState<(typeof state.bookings)[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // Filter options
  const dateOptions: SelectOption[] = [
    { value: "all", label: t("الكل", "All"), icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { value: "today", label: t("اليوم", "Today"), icon: <Calendar className="w-3.5 h-3.5" /> },
    {
      value: "week",
      label: t("آخر 7 أيام", "Last 7 days"),
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      value: "month",
      label: t("آخر 30 يوم", "Last 30 days"),
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
  ];

  const calendarOptions: SelectOption[] = [
    {
      value: "all",
      label: t("كل التقويمات", "All Calendars"),
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    ...state.calendars.map((c) => ({
      value: c.id,
      label: c.name,
      icon: <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />,
    })),
  ];

  const partnerOptions: SelectOption[] = [
    {
      value: "all",
      label: t("كل الشركاء", "All Partners"),
      icon: <Users className="w-3.5 h-3.5" />,
    },
    ...users
      .filter((u) => u.role !== "admin")
      .map((u) => ({
        value: u.uid || "",
        label: u.name || u.email?.split("@")[0] || "Partner",
        icon: <Users className="w-3.5 h-3.5" />,
      })),
  ];

  const statusOptions: SelectOption[] = [
    {
      value: "all",
      label: t("كل الحالات", "All Status"),
      icon: <Activity className="w-3.5 h-3.5" />,
    },
    {
      value: "Confirmed",
      label: t("مؤكد", "Confirmed"),
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      value: "Pending",
      label: t("معلق", "Pending"),
      icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      value: "Cancelled",
      label: t("ملغي", "Cancelled"),
      icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
    },
  ];

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let bookings = [...state.bookings];

    const formatDateToYYYYMMDD = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const todayStr = formatDateToYYYYMMDD(new Date());

    const weekAgoDate = new Date();
    weekAgoDate.setDate(weekAgoDate.getDate() - 7);
    const weekAgoStr = formatDateToYYYYMMDD(weekAgoDate);

    const monthAgoDate = new Date();
    monthAgoDate.setDate(monthAgoDate.getDate() - 30);
    const monthAgoStr = formatDateToYYYYMMDD(monthAgoDate);

    if (dateFilter === "today") {
      bookings = bookings.filter((b) => b.date && b.date >= todayStr);
    } else if (dateFilter === "week") {
      bookings = bookings.filter((b) => b.date && b.date >= weekAgoStr);
    } else if (dateFilter === "month") {
      bookings = bookings.filter((b) => b.date && b.date >= monthAgoStr);
    }

    if (isAdmin) {
      if (partnerFilter !== "all") {
        bookings = bookings.filter((b) => b.userId === partnerFilter);
      }
    } else {
      if (calendarFilter !== "all") {
        bookings = bookings.filter((b) => b.calendarId === calendarFilter);
      }
    }

    if (statusFilter !== "all") {
      bookings = bookings.filter((b) => b.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      bookings = bookings.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(q) ||
          (b.contact || "").toLowerCase().includes(q) ||
          (b.source || "").toLowerCase().includes(q) ||
          Object.values(b.answers || {}).some((v) => String(v).toLowerCase().includes(q)),
      );
    }

    bookings.sort((a, b) => {
      if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.createdAt - a.createdAt;
    });

    return bookings;
  }, [
    state.bookings,
    searchQuery,
    dateFilter,
    calendarFilter,
    partnerFilter,
    statusFilter,
    isAdmin,
  ]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const confirmed = filteredBookings.filter((b) => b.status === "Confirmed").length;
    const pending = filteredBookings.filter((b) => b.status === "Pending").length;
    const cancelled = filteredBookings.filter((b) => b.status === "Cancelled").length;
    const withSource = filteredBookings.filter(
      (b) => b.source === "ads" || b.fromAd === true,
    ).length;
    return { total, confirmed, pending, cancelled, withSource };
  }, [filteredBookings]);

  const getCalendarName = (id: number) => {
    const cal = state.calendars.find((c) => c.id === id);
    return cal ? cal.name : t("محذوف", "Deleted");
  };

  const getCalendarColor = (id: number) => {
    const cal = state.calendars.find((c) => c.id === id);
    return cal ? cal.color : "#8b90a0";
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      Confirmed: {
        label: t("مؤكد", "Confirmed"),
        className:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      Pending: {
        label: t("معلق", "Pending"),
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: <Clock className="w-3 h-3" />,
      },
      Cancelled: {
        label: t("ملغي", "Cancelled"),
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: <AlertCircle className="w-3 h-3" />,
      },
    };
    const c = config[status] || config.Pending;
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${c.className}`}
      >
        {c.icon}
        {c.label}
      </span>
    );
  };

  const openDetail = (booking: (typeof state.bookings)[0]) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setCalendarFilter("all");
    setPartnerFilter("all");
    setStatusFilter("all");
    toast.success(t("تم إعادة تعيين الفلاتر", "Filters reset"));
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, calendarFilter, partnerFilter, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const handleExport = (format: "csv" | "json") => {
    if (filteredBookings.length === 0) {
      toast.error(t("لا توجد بيانات لتصديرها", "No data to export"));
      return;
    }

    let fileContent = "";
    let filename = `contacts_export_${Date.now()}`;
    let mimeType = "";

    if (format === "csv") {
      const headers = [
        t("التقويم", "Calendar"),
        t("الاسم", "Name"),
        t("البريد الإلكتروني", "Email"),
        t("رقم التواصل", "Contact Number"),
        t("التاريخ", "Date"),
        t("الوقت", "Time"),
        t("المصدر", "Source"),
        t("الحالة", "Status"),
      ];
      const rows = filteredBookings.map((b) => [
        getCalendarName(b.calendarId),
        b.name,
        b.email || "",
        b.whatsapp || b.contact || "",
        b.date,
        b.time,
        b.source || "Direct",
        b.status,
      ]);

      fileContent =
        "\uFEFF" +
        [
          headers.join(","),
          ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");
      filename += ".csv";
      mimeType = "text/csv;charset=utf-8;";
    } else {
      fileContent = JSON.stringify(
        filteredBookings.map((b) => ({
          calendar: getCalendarName(b.calendarId),
          name: b.name,
          email: b.email || "",
          phone: b.whatsapp || b.contact || "",
          date: b.date,
          time: b.time,
          source: b.source || "Direct",
          status: b.status,
        })),
        null,
        2,
      );
      filename += ".json";
      mimeType = "application/json;charset=utf-8;";
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("تم تصدير البيانات بنجاح", "Data exported successfully"));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  // Status badge for detail modal
  const DetailStatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; className: string }> = {
      Confirmed: {
        label: t("مؤكد", "Confirmed"),
        className:
          "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      },
      Pending: {
        label: t("معلق", "Pending"),
        className: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      },
      Cancelled: {
        label: t("ملغي", "Cancelled"),
        className: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
      },
    };
    const c = config[status] || config.Pending;
    return (
      <span className={`text-sm font-bold px-3 py-1 rounded-full ${c.className}`}>{c.label}</span>
    );
  };

  // Determine if there are any bookings at all
  const hasAnyBookings = state.bookings.length > 0;

  return (
    <div className="space-y-6 pb-12" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {t("العملاء", "Contacts")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("كل العملاء اللي سجلوا من أي تقويم", "Everyone who registered through any calendar")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Export Button Group */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-800 transition"
              title={t("تصدير ملف CSV", "Export CSV")}
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport("json")}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title={t("تصدير ملف JSON", "Export JSON")}
            >
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700"
          >
            {t("إعادة تعيين", "Reset")}
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
              {filteredBookings.length}
            </span>
            <span className="text-xs text-purple-500 dark:text-purple-400">
              {t("عميل", "contacts")}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Row with Custom Selects */}
      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("🔍 ابحث بالاسم أو التواصل...", "🔍 Search by name or contact...")}
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Date Filter */}
        <CustomSelect
          value={dateFilter}
          onChange={(val) => setDateFilter(val as typeof dateFilter)}
          options={dateOptions}
          icon={<Calendar className="w-4 h-4 text-slate-400" />}
          className="min-w-[140px]"
        />

        {/* Partner Filter (Admin only) or Calendar Filter */}
        {isAdmin ? (
          <CustomSelect
            value={partnerFilter}
            onChange={(val) => setPartnerFilter(String(val))}
            options={partnerOptions}
            icon={<Users className="w-4 h-4 text-slate-400" />}
            className="min-w-[160px]"
          />
        ) : (
          <CustomSelect
            value={calendarFilter === "all" ? "all" : calendarFilter}
            onChange={(val) => setCalendarFilter(val === "all" ? "all" : Number(val))}
            options={calendarOptions}
            icon={<Filter className="w-4 h-4 text-slate-400" />}
            className="min-w-[150px]"
          />
        )}

        {/* Status Filter */}
        <CustomSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as typeof statusFilter)}
          options={statusOptions}
          icon={<Tag className="w-4 h-4 text-slate-400" />}
          className="min-w-[130px]"
        />

        {/* Active filters indicator */}
        {(dateFilter !== "all" ||
          (isAdmin ? partnerFilter !== "all" : calendarFilter !== "all") ||
          statusFilter !== "all" ||
          searchQuery) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            {t("فلاتر نشطة", "Active filters")}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: t("إجمالي العملاء", "Total Contacts"),
            value: stats.total,
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
          },
          {
            label: t("مؤكدين", "Confirmed"),
            value: stats.confirmed,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
          },
          {
            label: t("معلقين", "Pending"),
            value: stats.pending,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
          },
          {
            label: t("ملغيين", "Cancelled"),
            value: stats.cancelled,
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className={`bg-white dark:bg-slate-900/80 border ${stat.bg} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Contacts Table */}
      <motion.div
        variants={containerVariants}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 contact-table p-2" // Added p-2 for gap
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("التقويم", "Calendar")}
                </th>
                {isAdmin && (
                  <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("الشريك", "Partner")}
                  </th>
                )}
                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الاسم", "Name")}
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("التواصل", "Contact")}
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الموعد", "Date")}
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("المصدر", "Source")}
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الحالة", "Status")}
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الإجراءات", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full">
                          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        {!hasAnyBookings ? (
                          <>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                              {t("لا يوجد عملاء حتى الآن", "No contacts yet")}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {t(
                                "عندما يسجل عميل جديد، سيظهر هنا",
                                "When someone books, they'll appear here",
                              )}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                              {t("لا يوجد عملاء مطابقين للفلاتر", "No contacts match the filters")}
                            </span>
                            <button
                              onClick={resetFilters}
                              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              {t("إعادة تعيين الفلاتر", "Reset filters")}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      layout
                      initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent dark:hover:from-purple-900/10 dark:hover:to-transparent transition-all duration-200 group"
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border"
                          style={{
                            backgroundColor: `${getCalendarColor(booking.calendarId)}15`,
                            color: getCalendarColor(booking.calendarId),
                            borderColor: `${getCalendarColor(booking.calendarId)}30`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: getCalendarColor(booking.calendarId) }}
                          />
                          {getCalendarName(booking.calendarId)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {users.find((u) => u.uid === booking.userId)?.name ||
                              booking.userId ||
                              t("غير معروف", "Unknown")}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {booking.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                          {booking.contact || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {booking.date}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {booking.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {booking.source ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            <TrendingUp className="w-3 h-3" />
                            {booking.source}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {t("مباشر", "Direct")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => openDetail(booking)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group-hover:scale-110"
                          title={t("عرض التفاصيل", "View details")}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer with pagination info */}
        {filteredBookings.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                `عرض ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                  currentPage * itemsPerPage,
                  filteredBookings.length,
                )} من ${filteredBookings.length} عميل`,
                `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                  currentPage * itemsPerPage,
                  filteredBookings.length,
                )} of ${filteredBookings.length} contacts`,
              )}
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5" dir="ltr">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  if (
                    totalPages > 5 &&
                    Math.abs(pNum - currentPage) > 1 &&
                    pNum !== 1 &&
                    pNum !== totalPages
                  ) {
                    if (pNum === 2 || pNum === totalPages - 1) {
                      return (
                        <span key={pNum} className="px-1.5 text-xs text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`min-w-[28px] h-7 text-xs font-bold rounded-lg transition-all ${
                        currentPage === pNum
                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                          : "border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {t("تم التحديث", "Updated")}{" "}
                {new Date().toLocaleTimeString(isRtl ? "ar-EG" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedBooking && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-950 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t("تفاصيل العميل", "Contact Details")}
                </h3>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-500/20">
                    {selectedBooking.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-800 dark:text-white">
                      {selectedBooking.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>{selectedBooking.contact || t("لا يوجد تواصل", "No contact")}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="text-xs">{timeAgo(selectedBooking.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {t("التقويم", "Calendar")}
                    </div>
                    <div className="mt-1.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: `${getCalendarColor(selectedBooking.calendarId)}15`,
                          color: getCalendarColor(selectedBooking.calendarId),
                          borderColor: `${getCalendarColor(selectedBooking.calendarId)}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getCalendarColor(selectedBooking.calendarId) }}
                        />
                        {getCalendarName(selectedBooking.calendarId)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3 h-3" />
                      {t("الحالة", "Status")}
                    </div>
                    <div className="mt-1.5">
                      <DetailStatusBadge status={selectedBooking.status} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {t("الموعد", "Date & Time")}
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {selectedBooking.date} · {selectedBooking.time}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      {t("المصدر", "Source")}
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {selectedBooking.source || t("مباشر", "Direct")}
                    </div>
                  </div>
                </div>

                {selectedBooking.fromAd !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      {t("هل مصدر الوصول من إعلان؟", "Source from Ads?")}
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {selectedBooking.fromAd ? t("نعم", "Yes") : t("لا", "No")}
                    </div>
                  </div>
                )}

                {/* Answers */}
                {selectedBooking.answers && Object.keys(selectedBooking.answers).length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {t("إجابات الفورم", "Form Answers")}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                      {Object.entries(selectedBooking.answers).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center py-2 first:pt-0 last:pb-0"
                        >
                          <span className="text-sm text-slate-500 dark:text-slate-400">{key}</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[60%] text-right">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created at footer */}
                <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {t("تم التسجيل", "Registered")} {timeAgo(selectedBooking.createdAt)}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

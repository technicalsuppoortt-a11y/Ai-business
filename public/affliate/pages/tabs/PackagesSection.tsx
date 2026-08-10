// PackagesSection.tsx - Fixed version with proper rendering
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAppState, computeUserLevel, computeFinalCommission, CURRENT_RATES as STATE_RATES, CURRENCY_SYMBOLS as STATE_SYMBOLS } from "../../context/StateContext";

import { useAuth } from "../../context/AuthContext";
import { LevelIcon } from "../../components/LevelIcon";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package as PackageIcon,
  Copy,
  Check,
  FileText,
  Sparkles,
  Star,
  Shield,
  Crown,
  CheckCircle2,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Filter,
  Tag,
  ChevronDown,
  ChevronUp,
  Layers,
  Gem,
  Award,
  Trophy,
  Rocket,
  Zap,
  Target,
  Activity,
  Briefcase,
  Gift,
  Compass,
  Heart,
  Globe,
  Cpu,
  Laptop,
  Smartphone,
  BookOpen,
  Mail,
  Calendar,
  Clock,
  Code,
  Database,
  Lock,
  Settings,
  Users,
  Flame,
  Brain,
  Lightbulb,
  HelpCircle,
  ShieldAlert,
  CreditCard,
  Coins,
  Percent,
  TrendingUp,
  MessageSquare,
  Video,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

// ---------- LOCAL CURRENCY FUNCTIONS ----------
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

function toBaseUSD(amount: number, currency: string, dateStr: string): number {
  if (!currency || currency === "USD") return amount;
  const rate = CURRENT_RATES[currency] || 1;
  return amount / rate;
}

// ---------- Animation Variants ----------
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
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 12 } },
} as const;

// ---------- Vector Icon Helper ----------
export const renderVectorIcon = (iconName: string, className = "w-6 h-6") => {
  const norm = (iconName || "").toLowerCase().trim();
  switch (norm) {
    case "package":
    case "📦":
      return <PackageIcon className={className} />;
    case "star":
    case "⭐":
      return <Star className={className} />;
    case "crown":
    case "👑":
      return <Crown className={className} />;
    case "shield":
      return <Shield className={className} />;
    case "sparkles":
    case "✨":
      return <Sparkles className={className} />;
    case "layers":
      return <Layers className={className} />;
    case "award":
    case "🥈":
    case "silver":
      return <Award className={className} />;
    case "trophy":
    case "🏆":
    case "🥇":
    case "gold":
      return <Trophy className={className} />;
    case "rocket":
    case "🚀":
      return <Rocket className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "target":
    case "🎯":
      return <Target className={className} />;
    case "gift":
    case "🎁":
      return <Gift className={className} />;
    case "globe":
    case "🌍":
      return <Globe className={className} />;
    case "cpu":
      return <Cpu className={className} />;
    case "laptop":
    case "💻":
      return <Laptop className={className} />;
    case "code":
      return <Code className={className} />;
    case "database":
    case "📊":
      return <Database className={className} />;
    case "lock":
    case "🔒":
      return <Lock className={className} />;
    case "settings":
    case "⚙️":
      return <Settings className={className} />;
    case "users":
    case "👥":
    case "🤝":
      return <Users className={className} />;
    case "activity":
      return <Activity className={className} />;
    case "briefcase":
      return <Briefcase className={className} />;
    case "compass":
      return <Compass className={className} />;
    case "heart":
    case "❤️":
      return <Heart className={className} />;
    case "smartphone":
    case "📱":
      return <Smartphone className={className} />;
    case "book-open":
      return <BookOpen className={className} />;
    case "mail":
    case "✉️":
      return <Mail className={className} />;
    case "calendar":
    case "📅":
      return <Calendar className={className} />;
    case "clock":
    case "🕐":
      return <Clock className={className} />;
    case "flame":
    case "🔥":
      return <Flame className={className} />;
    case "brain":
    case "🧠":
      return <Brain className={className} />;
    case "lightbulb":
    case "💡":
      return <Lightbulb className={className} />;
    case "help":
    case "❓":
      return <HelpCircle className={className} />;
    case "shield-check":
      return <ShieldCheck className={className} />;
    case "credit-card":
      return <CreditCard className={className} />;
    case "coins":
      return <Coins className={className} />;
    case "percent":
      return <Percent className={className} />;
    case "trending-up":
      return <TrendingUp className={className} />;
    case "message-square":
      return <MessageSquare className={className} />;
    case "video":
      return <Video className={className} />;
    case "shield-alert":
      return <ShieldAlert className={className} />;
    case "gem":
    case "💎":
    case "elite":
      return <Gem className={className} />;
    default:
      return <PackageIcon className={className} />;
  }
};

// ---------- Icon Options ----------
const ICON_OPTIONS = [
  { value: "package", label: "Package / باقة" },
  { value: "star", label: "Star / نجمة" },
  { value: "crown", label: "Crown / تاج" },
  { value: "shield", label: "Shield / درع" },
  { value: "sparkles", label: "Sparkles / لمعان" },
  { value: "layers", label: "Layers / طبقات" },
  { value: "award", label: "Award / وسام" },
  { value: "trophy", label: "Trophy / كأس" },
  { value: "gem", label: "Gem / جوهرة" },
  { value: "rocket", label: "Rocket / صاروخ" },
  { value: "zap", label: "Zap / برق" },
  { value: "target", label: "Target / هدف" },
  { value: "gift", label: "Gift / هدية" },
  { value: "globe", label: "Globe / عالمي" },
  { value: "cpu", label: "CPU / معالج" },
  { value: "laptop", label: "Laptop / حاسوب" },
  { value: "code", label: "Code / برمجة" },
  { value: "database", label: "Database / قاعدة بيانات" },
  { value: "lock", label: "Lock / قفل" },
  { value: "settings", label: "Settings / إعدادات" },
  { value: "users", label: "Users / مستخدمين" },
  { value: "activity", label: "Activity / نشاط" },
  { value: "briefcase", label: "Briefcase / حقيبة" },
  { value: "compass", label: "Compass / بوصلة" },
  { value: "heart", label: "Heart / قلب" },
  { value: "smartphone", label: "Smartphone / هاتف" },
  { value: "book-open", label: "Book / كتاب" },
  { value: "mail", label: "Mail / بريد" },
  { value: "calendar", label: "Calendar / تقويم" },
  { value: "clock", label: "Clock / ساعة" },
  { value: "flame", label: "Flame / لهب" },
  { value: "brain", label: "Brain / ذكاء" },
  { value: "lightbulb", label: "Idea / فكرة" },
  { value: "help", label: "Help / مساعدة" },
  { value: "shield-check", label: "Security / أمان" },
  { value: "credit-card", label: "Card / بطاقة" },
  { value: "coins", label: "Coins / عملات" },
  { value: "percent", label: "Discount / خصم" },
  { value: "trending-up", label: "Growth / نمو" },
  { value: "message-square", label: "Chat / محادثة" },
  { value: "video", label: "Video / فيديو" },
  { value: "shield-alert", label: "Alert / تنبيه" },
];

// ---------- Custom Select Component ----------
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

// ---------- Icon Picker Component ----------
interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isRtl = document.documentElement.dir === "rtl";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const selectedIcon = ICON_OPTIONS.find((opt) => opt.value === value);

  const getLocalizedLabel = (opt: (typeof ICON_OPTIONS)[0]) => {
    const parts = opt.label.split("/");
    if (parts.length === 2) {
      return isRtl ? parts[1].trim() : parts[0].trim();
    }
    return opt.label;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 flex items-center gap-3 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700 focus:ring-2 focus:ring-purple-500/50"
      >
        <span className="text-purple-650 dark:text-purple-400 shrink-0">
          {renderVectorIcon(value || "package", "w-5 h-5")}
        </span>
        <span className="flex-1 truncate" style={{ textAlign: isRtl ? "right" : "left" }}>
          {selectedIcon ? getLocalizedLabel(selectedIcon) : t("اختر أيقونة", "Choose Icon")}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
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
            <div className="grid grid-cols-5 gap-1.5 p-3 max-h-60 overflow-y-auto custom-scroll">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
                    value === opt.value
                      ? "bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500"
                      : ""
                  }`}
                  title={getLocalizedLabel(opt)}
                >
                  {renderVectorIcon(opt.value, "w-5 h-5 text-slate-600 dark:text-slate-400")}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Professional Toggle Switch ----------
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center gap-3">
      <label dir="ltr" className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`w-14 h-8 rounded-full transition-all duration-300 ${
            checked
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30"
              : "bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 shadow-inner"
          } peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-700`}
        >
          <div
            className={`absolute top-1 left-1 bg-white rounded-full h-6 w-6 transition-all duration-300 shadow-md ${
              checked ? "translate-x-6" : ""
            }`}
          />
        </div>
      </label>
      {label && (
        <span
          className={`text-sm font-semibold ${checked ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

// ---------- Package Card Styles ----------
const PACKAGE_STYLES = [
  {
    border: "border-emerald-200 dark:border-emerald-800/50",
    shadow: "shadow-emerald-100/20 dark:shadow-emerald-900/10",
    hoverShadow: "hover:shadow-emerald-200/40 dark:hover:shadow-emerald-800/30",
    gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20",
  },
  {
    border: "border-amber-200 dark:border-amber-800/50",
    shadow: "shadow-amber-100/20 dark:shadow-amber-900/10",
    hoverShadow: "hover:shadow-amber-200/40 dark:hover:shadow-amber-800/30",
    gradient: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20",
  },
  {
    border: "border-purple-200 dark:border-purple-800/50",
    shadow: "shadow-purple-100/20 dark:shadow-purple-900/10",
    hoverShadow: "hover:shadow-purple-200/40 dark:hover:shadow-purple-800/30",
    gradient: "from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20",
  },
];

// ---------- Main Component ----------
export default function PackagesSection() {
  const { state, updateState, fmtMoney } = useAppState();
  const [activeTab, setActiveTab] = useState<"packages" | "scripts">("packages");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"manual" | "newest" | "title-asc" | "title-desc">("manual");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isScriptOrderModalOpen, setIsScriptOrderModalOpen] = useState(false);
  const [editingScriptsOrder, setEditingScriptsOrder] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
    type: "package" | "script";
  } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    currency: "USD",
    period: "شهري",
    icon: "📦",
    active: true,
    features: [""],
    category: "",
    title: "",
    content: "",
    order: 1,
    commissionPercentage: 10,
    badge: "",
  });


  const { isAdmin, user, userProfile } = useAuth();
  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // Compute user's current affiliate level for hybrid commission display
  const affiliateLevels = state.affiliateLevels || [];
  const totalRevenueUSD = Number(userProfile?.revenue) || 0;
  const currentUserLevel = useMemo(
    () => computeUserLevel(totalRevenueUSD, affiliateLevels),
    [totalRevenueUSD, affiliateLevels]
  );
  const userBonusPct = currentUserLevel?.bonusPercentage ?? 0;


  // ---------- Translation Helpers ----------
  const translateCategory = (cat: string) => {
    if (isRtl) return cat;
    const map: Record<string, string> = {
      الافتتاح: "Opening",
      الاكتشاف: "Discovery",
      "تقديم العرض": "Presentation",
      "التعامل مع الاعتراضات": "Objections",
      الإغلاق: "Closing",
      المتابعة: "Follow-up",
    };
    return map[cat] || cat || "Uncategorized";
  };

  const translatePeriod = (period: string) => {
    if (isRtl) return period;
    const map: Record<string, string> = {
      شهري: "Monthly",
      "ربع سنوي": "Quarterly",
      سنوي: "Annual",
      "دفعة واحدة": "One-time",
    };
    return map[period] || period;
  };

  // ---------- Get Data ----------
  const packages = state.packages || [];
  const scripts = state.scripts || [];

  // Get unique categories
  const scriptCategories = Array.from(new Set(scripts.map((s) => s.category || "غير مصنف")));

  // Filter data
  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredScripts = scripts.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || (s.category || "غير مصنف") === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedScripts = useMemo(() => {
    const list = [...filteredScripts];
    if (sortBy === "manual") {
      list.sort((a, b) => {
        const orderA = typeof a.order === "number" ? a.order : a.id;
        const orderB = typeof b.order === "number" ? b.order : b.id;
        return orderA - orderB;
      });
    } else if (sortBy === "newest") {
      list.sort((a, b) => b.id - a.id);
    } else if (sortBy === "title-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      list.sort((a, b) => b.title.localeCompare(a.title));
    }
    return list;
  }, [filteredScripts, sortBy]);

  // ---------- Modal Handlers ----------
  const openPackageModal = (pkg?: any) => {
    if (pkg) {
      setEditingItem(pkg);
      setFormData({
        name: pkg.name,
        price: pkg.price,
        currency: pkg.currency || "USD",
        period: pkg.period,
        icon: pkg.icon || "📦",
        active: pkg.active !== undefined ? pkg.active : true,
        features: pkg.features || [""],
        category: "",
        title: "",
        content: "",
        order: 0,
        commissionPercentage: pkg.commissionPercentage !== undefined ? pkg.commissionPercentage : 10,
        badge: pkg.badge || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        price: 0,
        currency: "USD",
        period: "شهري",
        icon: "📦",
        active: true,
        features: [""],
        category: "",
        title: "",
        content: "",
        order: 0,
        commissionPercentage: 10,
        badge: "",
      });
    }
    setIsModalOpen(true);
  };


  const openScriptModal = (script?: any) => {
    setIsNewCategory(false);
    if (script) {
      setEditingItem(script);
      setFormData({
        name: "",
        price: 0,
        currency: "USD",
        period: "شهري",
        icon: "📦",
        active: true,
        features: [""],
        category: script.category || "",
        title: script.title || "",
        content: script.content || "",
        order: typeof script.order === "number" ? script.order : scripts.indexOf(script) + 1,
        commissionPercentage: 10,
        badge: "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        price: 0,
        currency: "USD",
        period: "شهري",
        icon: "📦",
        active: true,
        features: [""],
        category: scriptCategories[0] || "",
        title: "",
        content: "",
        order: scripts.length + 1,
        commissionPercentage: 10,
        badge: "",
      });
    }
    setIsModalOpen(true);
  };


  const handleSavePackage = () => {
    if (!formData.name.trim()) {
      toast.error(t("أدخل اسم الباقة", "Enter package name"));
      return;
    }
    const commPct = Number(formData.commissionPercentage);
    if (isNaN(commPct) || commPct < 0 || commPct > 100) {
      toast.error(t("يجب أن تكون النسبة المئوية للعمولة بين 0 و 100", "Commission percentage must be between 0 and 100"));
      return;
    }

    const data = {
      name: formData.name.trim(),
      price: Number(formData.price),
      currency: formData.currency,
      period: formData.period,
      icon: formData.icon || "📦",
      active: formData.active,
      features: formData.features.filter((f) => f.trim() !== ""),
      commissionPercentage: commPct,
      badge: (formData.badge || "").trim(),
    };


    updateState((draft) => {
      if (editingItem) {
        const idx = draft.packages.findIndex((p) => p.id === editingItem.id);
        if (idx !== -1) {
          draft.packages[idx] = { ...draft.packages[idx], ...data };
        }
        toast.success(t("تم تحديث الباقة", "Package updated"));
      } else {
        draft.packages.push({
          id: Date.now(),
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          ...data,
        });
        toast.success(t("تم إنشاء الباقة", "Package created"));
      }
    });
    setIsModalOpen(false);
  };

  const handleSaveScript = () => {
    if (!formData.title.trim()) {
      toast.error(t("أدخل عنوان السكريبت", "Enter script title"));
      return;
    }
    if (!formData.content.trim()) {
      toast.error(t("أدخل محتوى السكريبت", "Enter script content"));
      return;
    }

    const data = {
      category: formData.category,
      title: formData.title.trim(),
      content: formData.content.trim(),
      order: Number(formData.order) || 0,
    };

    updateState((draft) => {
      if (editingItem) {
        const idx = draft.scripts.findIndex((s) => s.id === editingItem.id);
        if (idx !== -1) {
          draft.scripts[idx] = { ...draft.scripts[idx], ...data };
        }
        toast.success(t("تم تحديث السكريبت", "Script updated"));
      } else {
        draft.scripts.push({
          id: Date.now(),
          ...data,
        });
        toast.success(t("تم إنشاء السكريبت", "Script created"));
      }
    });
    setIsModalOpen(false);
  };

  const handleDeletePackage = () => {
    if (!deleteTarget) return;
    updateState((draft) => {
      draft.packages = draft.packages.filter((p) => p.id !== deleteTarget.id);
    });
    toast.success(t("تم حذف الباقة", "Package deleted"));
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteScript = () => {
    if (!deleteTarget) return;
    updateState((draft) => {
      draft.scripts = draft.scripts.filter((s) => s.id !== deleteTarget.id);
    });
    toast.success(t("تم حذف السكريبت", "Script deleted"));
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const moveScript = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedScripts.length) return;

    const currentScript = sortedScripts[index];
    const targetScript = sortedScripts[targetIndex];

    updateState((draft) => {
      // 1. Sort draft.scripts by order first to align indices
      draft.scripts.sort((a, b) => {
        const orderA = typeof a.order === "number" ? a.order : a.id;
        const orderB = typeof b.order === "number" ? b.order : b.id;
        return orderA - orderB;
      });

      // 2. Find indices in the sorted array
      const idxA = draft.scripts.findIndex((s) => s.id === currentScript.id);
      const idxB = draft.scripts.findIndex((s) => s.id === targetScript.id);

      if (idxA !== -1 && idxB !== -1) {
        // 3. Swap array elements
        const temp = draft.scripts[idxA];
        draft.scripts[idxA] = draft.scripts[idxB];
        draft.scripts[idxB] = temp;

        // 4. Assign clean sequential order values
        draft.scripts.forEach((s, idx) => {
          s.order = idx + 1;
        });
      }
    });
    toast.success(t("تم تغيير الترتيب", "Sort order updated"));
  };

  const handleSaveScriptsOrder = () => {
    updateState((draft) => {
      const sortedResult = [...editingScriptsOrder].sort((a, b) => a.order - b.order);
      sortedResult.forEach((s, i) => {
        s.order = i + 1;
      });
      draft.scripts = sortedResult.map((s) => {
        const orig = draft.scripts.find((o) => o.id === s.id);
        return {
          ...orig,
          ...s,
          order: s.order,
        };
      });
    });
    toast.success(t("تم حفظ الترتيب بنجاح", "Scripts order saved successfully"));
    setIsScriptOrderModalOpen(false);
  };

  useEffect(() => {
    if (isScriptOrderModalOpen) {
      const list = [...scripts].sort((a, b) => {
        const orderA = typeof a.order === "number" ? a.order : a.id;
        const orderB = typeof b.order === "number" ? b.order : b.id;
        return orderA - orderB;
      });
      setEditingScriptsOrder(
        list.map((s, idx) => ({
          ...s,
          order: typeof s.order === "number" ? s.order : idx + 1,
        })),
      );
    }
  }, [isScriptOrderModalOpen, scripts]);

  const handleCopyScript = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(t("تم نسخ السكريبت", "Script copied"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Feature helpers
  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const requestDelete = (id: number, name: string, type: "package" | "script") => {
    setDeleteTarget({ id, name, type });
    setIsDeleteOpen(true);
  };

  const openDetail = (item: any, type: "package" | "script") => {
    setViewingItem({ ...item, type });
    setIsDetailOpen(true);
  };

  // Render functions
  const renderPackages = () => {
    if (filteredPackages.length === 0) {
      return (
        <div className="col-span-full text-center py-16">
          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full w-fit mx-auto mb-4">
            <PackageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {searchQuery
              ? t("لا توجد باقات مطابقة للبحث", "No packages match your search")
              : t("لا توجد باقات متاحة", "No packages available")}
          </p>
        </div>
      );
    }

    return filteredPackages.map((pkg, index) => {
      const style = PACKAGE_STYLES[index % PACKAGE_STYLES.length];
      return (
        <motion.div
          key={pkg.id}
          variants={itemVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className={`relative bg-white dark:bg-slate-900/80 border-2 ${style.border} rounded-2xl p-6 shadow-lg ${style.shadow} ${style.hoverShadow} transition-all duration-300 group overflow-hidden`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
          />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="text-purple-600 dark:text-purple-400 p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl shrink-0 flex items-center justify-center">
                {renderVectorIcon(pkg.icon || "package", "w-6 h-6")}
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-800 dark:text-white">
                  {pkg.name}
                </h4>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {translatePeriod(pkg.period)}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => openDetail(pkg, "package")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                title={t("عرض التفاصيل", "View details")}
              >
                <Eye className="w-4 h-4" />
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => openPackageModal(pkg)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                    title={t("تعديل", "Edit")}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => requestDelete(pkg.id, pkg.name, "package")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    title={t("حذف", "Delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 relative z-10">
            <span className="text-3xl font-black text-slate-800 dark:text-white">
              {fmtMoney(toBaseUSD(pkg.price, pkg.currency || "USD", "2026-07-01"))}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              /{translatePeriod(pkg.period)}
            </span>
          </div>

          {/* Commission Breakdown Tag */}
          {(() => {
            const base = pkg.commissionPercentage || 0;
            const finalPct = computeFinalCommission(base, userBonusPct);
            const priceUSD = toBaseUSD(pkg.price, pkg.currency || "USD", "2026-07-01");
            const earnUSD = priceUSD * (finalPct / 100);
            return (
              <div className="mt-3 relative z-10 space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <Percent className="w-2.5 h-2.5" />
                    {t("أساس", "Base")} {base}%
                  </span>
                  {userBonusPct > 0 && (
                    <>
                      <span className="text-[10px] text-slate-400">+</span>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                        style={{
                          backgroundColor: `${currentUserLevel?.color || "#6366f1"}22`,
                          color: currentUserLevel?.color || "#6366f1",
                        }}
                      >
                        <LevelIcon name={currentUserLevel?.icon || "Shield"} className="w-3.5 h-3.5" /> +{userBonusPct}%
                      </span>
                    </>
                  )}
                  <span className="text-[10px] text-slate-400">=</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    {t("إجمالي", "Total")} {finalPct}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {t("كسب محتمل", "Potential Earning")}:{" "}
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {fmtMoney(earnUSD)}{t("/عميل", "/client")}
                  </span>
                </p>
              </div>
            );
          })()}

          <ul className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4 relative z-10">
            {pkg.features.slice(0, 3).map((feat, i) => (
              <li
                key={i}
                className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
            {pkg.features.length > 3 && (
              <li className="text-xs text-slate-400 dark:text-slate-500">
                +{pkg.features.length - 3} {t("مميزات إضافية", "more features")}
              </li>
            )}
          </ul>

          {/* Copy Affiliate Link button (partner only) */}
          {!isAdmin && user?.uid && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 relative z-10">
              <button
                onClick={() => {
                  const link = `${window.location.origin}?ref=${user.uid}&pkg=${pkg.id}`;
                  navigator.clipboard.writeText(link);
                  toast.success(t("تم نسخ رابط الإحالة!", "Affiliate link copied!"));
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {t("نسخ رابط الإحالة", "Copy Affiliate Link")}
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 relative z-10">
              <ToggleSwitch
                checked={pkg.active}
                onChange={(val) => {
                  updateState((draft) => {
                    const idx = draft.packages.findIndex((p) => p.id === pkg.id);
                    if (idx !== -1) {
                      draft.packages[idx].active = val;
                    }
                  });
                  toast.success(
                    val
                      ? t("تم تفعيل الباقة", "Package activated")
                      : t("تم إيقاف الباقة", "Package deactivated"),
                  );
                }}
                label={pkg.active ? t("مفعّلة", "Active") : t("متوقفة", "Inactive")}
              />
            </div>
          )}
        </motion.div>
      );
    });
  };



  const renderScripts = () => {
    if (filteredScripts.length === 0) {
      return (
        <div className="col-span-full text-center py-16">
          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full w-fit mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {searchQuery
              ? t("لا توجد سكريبتات مطابقة للبحث", "No scripts match your search")
              : t("لا توجد سكريبتات متاحة", "No scripts available")}
          </p>
        </div>
      );
    }

    return sortedScripts.map((script, index) => (
      <motion.div
        key={script.id}
        layout
        variants={itemVariants}
        transition={{
          layout: { type: "spring", stiffness: 300, damping: 30 },
        }}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-shadow transition-colors duration-300 group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 shrink-0">
              {script.order || index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                {script.title}
              </h4>
              <span className="inline-block mt-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                {translateCategory(script.category || "غير مصنف")}
              </span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => handleCopyScript(script.content, script.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
              title={t("نسخ", "Copy")}
            >
              {copiedId === script.id ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => openDetail(script, "script")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              title={t("عرض التفاصيل", "View details")}
            >
              <Eye className="w-4 h-4" />
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => moveScript(index, "up")}
                  disabled={sortBy !== "manual" || index === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition disabled:opacity-30 disabled:pointer-events-none"
                  title={
                    sortBy !== "manual"
                      ? t(
                          "الترتيب اليدوي معطل عند اختيار الفرز",
                          "Manual sorting is disabled when filtering/sorting is applied",
                        )
                      : t("نقل لأعلى", "Move Up")
                  }
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveScript(index, "down")}
                  disabled={sortBy !== "manual" || index === sortedScripts.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition disabled:opacity-30 disabled:pointer-events-none"
                  title={
                    sortBy !== "manual"
                      ? t(
                          "الترتيب اليدوي معطل عند اختيار الفرز",
                          "Manual sorting is disabled when filtering/sorting is applied",
                        )
                      : t("نقل لأسفل", "Move Down")
                  }
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() => openScriptModal(script)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                  title={t("تعديل", "Edit")}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => requestDelete(script.id, script.title, "script")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title={t("حذف", "Delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 group-hover:shadow-inner transition-shadow duration-300">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800/60 max-h-20 overflow-hidden relative group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors duration-300">
            <pre className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono font-medium line-clamp-3">
              {script.content}
            </pre>
            {script.content.length > 150 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 to-transparent pointer-events-none" />
            )}
          </div>
        </div>

        {copiedId === script.id && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
          >
            <Check className="w-3.5 h-3.5" />
            {t("تم نسخ السكريبت", "Script copied")}
          </motion.div>
        )}
      </motion.div>
    ));
  };

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
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <Layers className="w-7 h-7 text-purple-500" />
            <span>{t("الباقات والسكريبتات", "Packages & Scripts")}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("مرجع ثابت للباقات وسكريبتات البيع", "Fixed catalog of packages and sales scripts")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && activeTab === "scripts" && (
            <button
              onClick={() => setIsScriptOrderModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold shadow-sm transition-all duration-200"
            >
              <Settings className="w-4 h-4 text-purple-500" />
              <span>{t("ترتيب السكريبتات", "Manage Order")}</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => (activeTab === "packages" ? openPackageModal() : openScriptModal())}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === "packages"
                  ? t("باقة جديدة", "New Package")
                  : t("سكريبت جديد", "New Script")}
              </span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 w-fit"
      >
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-5 py-2.5 text-sm font-bold rounded-lg transition flex items-center gap-2 ${
            activeTab === "packages"
              ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          {t("الباقات", "Packages")}
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
            {packages.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("scripts")}
          className={`px-5 py-2.5 text-sm font-bold rounded-lg transition flex items-center gap-2 ${
            activeTab === "scripts"
              ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FileText className="w-4 h-4" />
          {t("السكريبتات", "Scripts")}
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
            {scripts.length}
          </span>
        </button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm"
      >
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "packages"
                ? t("🔍 ابحث عن باقة...", "🔍 Search packages...")
                : t("🔍 ابحث عن سكريبت...", "🔍 Search scripts...")
            }
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {activeTab === "scripts" && scriptCategories.length > 0 && (
          <CustomSelect
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val as string)}
            options={[
              {
                value: "all",
                label: t("كل التصنيفات", "All Categories"),
                icon: <Tag className="w-3.5 h-3.5" />,
              },
              ...scriptCategories.map((cat) => ({
                value: cat,
                label: translateCategory(cat),
                icon: <Tag className="w-3.5 h-3.5" />,
              })),
            ]}
            icon={<Filter className="w-4 h-4 text-slate-400" />}
            className="min-w-[150px]"
          />
        )}

        {activeTab === "scripts" && (
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val as any)}
            options={[
              { value: "manual", label: t("الترتيب اليدوي", "Manual Order") },
              { value: "newest", label: t("الأحدث أولاً", "Newest First") },
              { value: "title-asc", label: t("الاسم تصاعدياً", "Title A-Z") },
              { value: "title-desc", label: t("الاسم تنازلياً", "Title Z-A") },
            ]}
            className="min-w-[150px]"
          />
        )}

        {(searchQuery ||
          (activeTab === "scripts" && (categoryFilter !== "all" || sortBy !== "manual"))) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            {t("فلاتر نشطة", "Active filters")}
          </div>
        )}
      </motion.div>

      {/* Content - Simple conditional rendering without AnimatePresence wrapping the grid */}
      <div
        className={
          activeTab === "packages"
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "grid gap-6 grid-cols-1 w-full"
        }
      >
        {activeTab === "packages" ? renderPackages() : renderScripts()}
      </div>

      {/* ---------- MODALS ---------- */}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {activeTab === "packages"
                    ? editingItem
                      ? t("تعديل الباقة", "Edit Package")
                      : t("باقة جديدة", "New Package")
                    : editingItem
                      ? t("تعديل السكريبت", "Edit Script")
                      : t("سكريبت جديد", "New Script")}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {activeTab === "packages" ? (
                  // Package Form
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          {t("اسم الباقة", "Package Name")}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                          placeholder={t("مثال: Gold", "e.g., Gold")}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          {t("اختر أيقونة", "Choose Icon")}
                        </label>
                        <IconPicker
                          value={formData.icon}
                          onChange={(val) => setFormData({ ...formData, icon: val })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          {t("السعر", "Price")}
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: Number(e.target.value) })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          {t("العملة", "Currency")}
                        </label>
                        <CustomSelect
                          value={formData.currency}
                          onChange={(val) => setFormData({ ...formData, currency: val as string })}
                          options={[
                            { value: "USD", label: "USD" },
                            { value: "AED", label: "AED" },
                            { value: "SAR", label: "SAR" },
                            { value: "EGP", label: "EGP" },
                            { value: "EUR", label: "EUR" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          {t("الدورة", "Period")}
                        </label>
                        <CustomSelect
                          value={formData.period}
                          onChange={(val) => setFormData({ ...formData, period: val as string })}
                          options={[
                            { value: "شهري", label: t("شهري", "Monthly") },
                            { value: "ربع سنوي", label: t("ربع سنوي", "Quarterly") },
                            { value: "سنوي", label: t("سنوي", "Annual") },
                            { value: "دفعة واحدة", label: t("دفعة واحدة", "One-time") },
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        {t("المميزات", "Features")}
                      </label>
                      <div className="space-y-2">
                        {formData.features.map((feat, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => updateFeature(index, e.target.value)}
                              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                              placeholder={t("مثال: دعم فني 24/7", "e.g., 24/7 Support")}
                            />
                            <button
                              onClick={() => removeFeature(index)}
                              className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addFeature}
                          className="w-full py-2.5 text-sm font-bold text-purple-600 dark:text-purple-400 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                        >
                          + {t("إضافة مميزة", "Add Feature")}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          {t("نسبة العمولة (%)", "Commission Percentage (%)")}
                        </label>
                        <input
                          type="number"
                          value={formData.commissionPercentage}
                          onChange={(e) =>
                            setFormData({ ...formData, commissionPercentage: Number(e.target.value) })
                          }
                          min={0}
                          max={100}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                          {t("حالة الباقة", "Package Status")}
                        </label>
                        <ToggleSwitch
                          checked={formData.active}
                          onChange={(val) => setFormData({ ...formData, active: val })}
                          label={formData.active ? t("مفعّلة", "Active") : t("متوقفة", "Inactive")}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  // Script Form
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {t("التصنيف", "Category")}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewCategory(!isNewCategory);
                            setFormData({ ...formData, category: "" });
                          }}
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {isNewCategory
                            ? t("اختر من الموجود", "Choose existing")
                            : t("+ تصنيف جديد", "+ New Category")}
                        </button>
                      </div>
                      {isNewCategory ? (
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                          placeholder={t("اكتب اسم التصنيف الجديد...", "Type new category name...")}
                        />
                      ) : (
                        <CustomSelect
                          value={formData.category}
                          onChange={(val) => setFormData({ ...formData, category: val as string })}
                          options={scriptCategories.map((cat) => ({
                            value: cat,
                            label: translateCategory(cat),
                          }))}
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        {t("عنوان السكريبت", "Script Title")}
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder={t("مثال: الاعتراض على السعر", "e.g., Price Objection")}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        {t("رقم السكريبت (الترتيب)", "Script Number (Order)")}
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) =>
                          setFormData({ ...formData, order: Number(e.target.value) })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="1"
                        min={1}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        {t("محتوى السكريبت", "Script Content")}
                      </label>
                      <textarea
                        rows={6}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none font-mono"
                        placeholder={t("أدخل نص السكريبت هنا...", "Enter script content here...")}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    onClick={activeTab === "packages" ? handleSavePackage : handleSaveScript}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition"
                  >
                    {t("حفظ", "Save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && viewingItem && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {viewingItem.type === "package"
                    ? t("تفاصيل الباقة", "Package Details")
                    : t("تفاصيل السكريبت", "Script Details")}
                </h3>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {viewingItem.type === "package" ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="text-purple-650 dark:text-purple-400 p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl shrink-0 flex items-center justify-center">
                        {renderVectorIcon(viewingItem.icon || "package", "w-8 h-8")}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                          {viewingItem.name}
                        </h4>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {translatePeriod(viewingItem.period)} ·{" "}
                          {viewingItem.active ? t("مفعّلة", "Active") : t("متوقفة", "Inactive")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {t("السعر", "Price")}
                        </div>
                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                          {fmtMoney(
                            toBaseUSD(
                              viewingItem.price,
                              viewingItem.currency || "USD",
                              "2026-07-01",
                            ),
                          )}
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {t("العملة", "Currency")}
                        </div>
                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                          {viewingItem.currency || "USD"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        {t("المميزات", "Features")}
                      </div>
                      <div className="space-y-1.5">
                        {viewingItem.features.map((feat: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                        {translateCategory(viewingItem.category || "غير مصنف")}
                      </span>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-2">
                        {viewingItem.title}
                      </h4>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                        {t("المحتوى", "Content")}
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                        <pre className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                          {viewingItem.content}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteOpen && deleteTarget && (
          <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6 text-center"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {t("تأكيد الحذف", "Confirm Delete")}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {t(
                  `هل أنت متأكد من حذف "${deleteTarget.name}" نهائياً؟`,
                  `Are you sure you want to delete "${deleteTarget.name}" permanently?`,
                )}
              </p>
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  onClick={
                    deleteTarget.type === "package" ? handleDeletePackage : handleDeleteScript
                  }
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition"
                >
                  {t("حذف", "Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scripts Order settings modal */}
      <AnimatePresence>
        {isScriptOrderModalOpen && (
          <div className="fixed inset-0 z-[1550] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScriptOrderModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t("ترتيب السكريبتات", "Scripts Order Settings")}
                </h3>
                <button
                  onClick={() => setIsScriptOrderModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SCRIPTS MANAGER */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scroll space-y-2 mb-4">
                {editingScriptsOrder.map((script, index) => (
                  <div
                    key={script.id}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 p-2 rounded-xl"
                  >
                    {/* Sort Arrows */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          const updated = [...editingScriptsOrder];
                          const temp = updated[index];
                          updated[index] = updated[index - 1];
                          updated[index - 1] = temp;
                          updated.forEach((s, idx) => {
                            s.order = idx + 1;
                          });
                          setEditingScriptsOrder(updated);
                        }}
                        className="p-0.5 text-slate-400 hover:text-purple-650 dark:hover:text-purple-400 disabled:opacity-20 disabled:pointer-events-none transition"
                        title={t("نقل لأعلى", "Move Up")}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === editingScriptsOrder.length - 1}
                        onClick={() => {
                          const updated = [...editingScriptsOrder];
                          const temp = updated[index];
                          updated[index] = updated[index + 1];
                          updated[index + 1] = temp;
                          updated.forEach((s, idx) => {
                            s.order = idx + 1;
                          });
                          setEditingScriptsOrder(updated);
                        }}
                        className="p-0.5 text-slate-400 hover:text-purple-650 dark:hover:text-purple-400 disabled:opacity-20 disabled:pointer-events-none transition"
                        title={t("نقل لأسفل", "Move Down")}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Order Number Input */}
                    <input
                      type="number"
                      value={script.order}
                      onChange={(e) => {
                        const nextVal = Number(e.target.value);
                        const updated = [...editingScriptsOrder];
                        updated[index].order = nextVal;
                        setEditingScriptsOrder(updated);
                      }}
                      className="w-14 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      min={1}
                      title={t("رقم الترتيب", "Order Number")}
                    />

                    {/* Script Title */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {script.title}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                        {translateCategory(script.category || "غير مصنف")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsScriptOrderModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  onClick={handleSaveScriptsOrder}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition"
                >
                  {t("حفظ الترتيب", "Save Order")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

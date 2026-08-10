// CRMSection.tsx – Full updated with all fixes
import React, { useState, useRef, useEffect } from "react";
import { useAppState, CrmLead } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { db, firestore } from "../../config/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Settings,
  Eye,
  Edit,
  ChevronRight,
  ChevronUp,
  Clock,
  LayoutGrid,
  List,
  Package as PackageIcon,
  Star,
  Crown,
  Shield,
  Sparkles,
  Layers,
  Award,
  Trophy,
  Gem,
  Rocket,
  Zap,
  Target,
  Gift,
  Globe,
  Cpu,
  Laptop,
  Code,
  Database,
  Lock,
  Users,
  Activity,
  Briefcase,
  Compass,
  Heart,
  Smartphone,
  BookOpen,
  Mail,
  Calendar,
  Flame,
  Brain,
  Lightbulb,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Coins,
  Percent,
  TrendingUp,
  MessageSquare,
  Video,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

// ---------- Types & Helpers ----------
interface Stage {
  id: string;
  name: string;
  type: "active" | "won" | "lost";
  color: string;
}

interface SelectOption {
  value: string | number;
  label: string;
  color?: string;
}

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

// ---------- Icon Options for Template Editor ----------
const ICON_OPTIONS = [
  { value: "package", label: "Package" },
  { value: "star", label: "Star" },
  { value: "crown", label: "Crown" },
  { value: "shield", label: "Shield" },
  { value: "sparkles", label: "Sparkles" },
  { value: "layers", label: "Layers" },
  { value: "award", label: "Award" },
  { value: "trophy", label: "Trophy" },
  { value: "gem", label: "Gem" },
  { value: "rocket", label: "Rocket" },
  { value: "zap", label: "Zap" },
  { value: "target", label: "Target" },
  { value: "gift", label: "Gift" },
  { value: "globe", label: "Globe" },
  { value: "cpu", label: "CPU" },
  { value: "laptop", label: "Laptop" },
  { value: "code", label: "Code" },
  { value: "database", label: "Database" },
  { value: "lock", label: "Lock" },
  { value: "settings", label: "Settings" },
  { value: "users", label: "Users" },
  { value: "activity", label: "Activity" },
  { value: "briefcase", label: "Briefcase" },
  { value: "compass", label: "Compass" },
  { value: "heart", label: "Heart" },
  { value: "smartphone", label: "Smartphone" },
  { value: "book-open", label: "Book" },
  { value: "mail", label: "Mail" },
  { value: "calendar", label: "Calendar" },
  { value: "clock", label: "Clock" },
  { value: "flame", label: "Flame" },
  { value: "brain", label: "Brain" },
  { value: "lightbulb", label: "Idea" },
  { value: "help", label: "Help" },
  { value: "shield-check", label: "Security" },
  { value: "credit-card", label: "Card" },
  { value: "coins", label: "Coins" },
  { value: "percent", label: "Discount" },
  { value: "trending-up", label: "Growth" },
  { value: "message-square", label: "Chat" },
  { value: "video", label: "Video" },
  { value: "shield-alert", label: "Alert" },
];

// ---------- Time Ago Helper ----------
function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const isRtl = document.documentElement.dir === "rtl";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  if (seconds < 60) return t("الآن", "just now");
  if (minutes < 60) return t(`منذ ${minutes} دقيقة`, `${minutes} min ago`);
  if (hours < 24) return t(`منذ ${hours} ساعة`, `${hours} hours ago`);
  if (days < 7) return t(`منذ ${days} يوم`, `${days} days ago`);
  if (weeks < 4) return t(`منذ ${weeks} أسبوع`, `${weeks} weeks ago`);
  if (months < 12) return t(`منذ ${months} شهر`, `${months} months ago`);
  return t(`منذ ${years} سنة`, `${years} years ago`);
}

// ---------- Custom Select ----------
const Select: React.FC<{
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}> = ({ value, onChange, options, placeholder, className = "", disabled = false, size = "md" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0 });
  const isRtl = document.documentElement.dir === "rtl";
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const updateCoords = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom,
          left: rect.left,
          right: window.innerWidth - rect.right,
          width: rect.width,
        });
      }
    };
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

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
    <div ref={containerRef} className={`relative ${className}`} dir={isRtl ? "rtl" : "ltr"}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-white flex items-center justify-between transition focus:ring-2 focus:ring-purple-500/50 ${
          size === "sm" ? "px-2.5 py-1.5 text-xs rounded-lg" : "px-4 py-2.5 text-sm rounded-xl"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-purple-300 dark:hover:border-purple-800/80"}`}
        style={{ textAlign: isRtl ? "right" : "left" }}
      >
        <span className="truncate flex items-center gap-1.5">
          {selectedOption?.color && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <span>{selectedOption?.label || placeholder || "اختر"}</span>
        </span>
        <ChevronDown
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
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
            className="fixed z-[9999] mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-2xl overflow-hidden"
            style={{
              top: `${coords.top}px`,
              width: `${coords.width}px`,
              ...(isRtl ? { right: `${coords.right}px` } : { left: `${coords.left}px` }),
            }}
          >
            <ul className="max-h-40 overflow-y-auto py-1 custom-scroll">
              {options.map((opt) => (
                <li
                  key={String(opt.value)}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1.5 text-xs cursor-pointer transition hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2 ${
                    opt.value === value
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                  style={{ textAlign: isRtl ? "right" : "left" }}
                >
                  {opt.color && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  <span>{opt.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Custom Select for Icons with Vector Icons ----------
interface IconSelectOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const IconSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: IconSelectOption[];
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, options, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0 });
  const isRtl = document.documentElement.dir === "rtl";
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const updateCoords = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom,
          left: rect.left,
          right: window.innerWidth - rect.right,
          width: rect.width,
        });
      }
    };
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

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
    <div ref={containerRef} className={`relative ${className}`} dir={isRtl ? "rtl" : "ltr"}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-white flex items-center justify-between transition focus:ring-2 focus:ring-purple-500/50 px-4 py-2.5 text-sm rounded-xl hover:border-purple-300 dark:hover:border-purple-800/80"
        style={{ textAlign: isRtl ? "right" : "left" }}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon && <span className="text-purple-500">{selectedOption.icon}</span>}
          <span>{selectedOption?.label || placeholder || "اختر أيقونة"}</span>
        </span>
        <ChevronDown
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} w-4 h-4`}
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
            className="fixed z-[9999] mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-2xl overflow-hidden"
            style={{
              top: `${coords.top}px`,
              width: `${coords.width}px`,
              ...(isRtl ? { right: `${coords.right}px` } : { left: `${coords.left}px` }),
            }}
          >
            <div className="grid grid-cols-5 gap-1.5 p-3 max-h-60 overflow-y-auto custom-scroll">
              {options.map((opt) => (
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
                  title={opt.label}
                >
                  <span className="text-slate-600 dark:text-slate-400">{opt.icon}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Main Component ----------
export const CRMSection = () => {
  const { state, updateState, fmtMoney } = useAppState();
  const { user, isAdmin, users } = useAuth();

  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateNameEn, setTemplateNameEn] = useState("");
  const [templateNameAr, setTemplateNameAr] = useState("");
  const [templateDescEn, setTemplateDescEn] = useState("");
  const [templateDescAr, setTemplateDescAr] = useState("");
  const [templateIcon, setTemplateIcon] = useState("package");
  const [templateColor, setTemplateColor] = useState("#3b82f6");
  const [templateStages, setTemplateStages] = useState<
    { nameAr: string; nameEn: string; type: "active" | "won" | "lost" }[]
  >([]);

  useEffect(() => {
    const templatesRef = firestore.collection(db, "crm_templates");
    const unsub = firestore.onSnapshot(templatesRef, async (snap: any) => {
      let list = snap.docs.map((d: any) => d.data());
      if (list.length === 0) {
        const initialTemplates = [
          {
            key: "general",
            nameAr: "المبيعات الرئيسية",
            nameEn: "General Sales",
            icon: "package",
            color: "#c8ff4d",
            descAr: "قالب عام للمبيعات والعملاء المحتملين",
            descEn: "General sales and leads",
            stageDefs: [
              { nameAr: "عميل جديد", nameEn: "New Lead", type: "active" },
              { nameAr: "تم التواصل", nameEn: "First Contact", type: "active" },
              { nameAr: "اجتماع محجوز", nameEn: "Meeting Scheduled", type: "active" },
              { nameAr: "عرض سعر", nameEn: "Proposal", type: "active" },
              { nameAr: "تفاوض", nameEn: "Negotiation", type: "active" },
              { nameAr: "تم الإغلاق", nameEn: "Closed Won", type: "won" },
              { nameAr: "خسارة", nameEn: "Closed Lost", type: "lost" },
            ],
            isDefault: true,
          },
          {
            key: "coaching",
            nameAr: "جلسات كوتشينج واستشارات",
            nameEn: "Coaching & Consulting",
            icon: "brain",
            color: "#ff84ff",
            descAr: "إدارة جلسات التدريب والمستفيدين",
            descEn: "Manage coaching clients",
            stageDefs: [
              { nameAr: "طلب جديد", nameEn: "New Booking Request", type: "active" },
              { nameAr: "تم التقييم والقبول", nameEn: "Assessment", type: "active" },
              { nameAr: "تم الدفع", nameEn: "Paid", type: "active" },
              { nameAr: "جلسات جارية", nameEn: "Sessions in Progress", type: "active" },
              { nameAr: "اكتمال الجلسات", nameEn: "Completed Sessions", type: "won" },
              { nameAr: "تم الإلغاء", nameEn: "Cancelled", type: "lost" },
            ],
            isDefault: true,
          },
          {
            key: "digitalproducts",
            nameAr: "بيع منتجات رقمية",
            nameEn: "Digital Products",
            icon: "laptop",
            color: "#ffa600",
            descAr: "مبيعات الكورسات، الكتب والاشتراكات",
            descEn: "Courses, books & subscriptions",
            stageDefs: [
              { nameAr: "زائر صفحة الهبوط", nameEn: "Landing Page Visitor", type: "active" },
              { nameAr: "تحميل هدية مجانية", nameEn: "Lead Magnet Download", type: "active" },
              { nameAr: "مهتم بالمنتج", nameEn: "Highly Interested", type: "active" },
              { nameAr: "محاولة شراء فاشلة", nameEn: "Checkout Started", type: "active" },
              { nameAr: "تم الشراء والتفعيل", nameEn: "Purchased & Active", type: "won" },
              { nameAr: "طلب استرجاع", nameEn: "Refunded", type: "lost" },
            ],
            isDefault: true,
          },
          {
            key: "agency",
            nameAr: "خدمات شركات ومؤسسات (B2B)",
            nameEn: "B2B Agency",
            icon: "briefcase",
            color: "#84a6ff",
            descAr: "إدارة صفقات وعقود الشركات الكبرى",
            descEn: "Deals and contracts for B2B",
            stageDefs: [
              { nameAr: "تواصل وارد", nameEn: "Inbound Inquiry", type: "active" },
              { nameAr: "مكالمة استكشافية", nameEn: "Discovery Call", type: "active" },
              { nameAr: "مرحلة تقييم الاحتياجات", nameEn: "Requirements Defined", type: "active" },
              { nameAr: "تم تقديم العرض المالي", nameEn: "Proposal Submitted", type: "active" },
              { nameAr: "توقيع العقد والدفع", nameEn: "Contract Signed", type: "won" },
              { nameAr: "عرض مرفوض", nameEn: "Proposal Rejected", type: "lost" },
            ],
            isDefault: true,
          },
          {
            key: "saas",
            nameAr: "بيع برمجيات واشتراكات (SaaS)",
            nameEn: "SaaS Sales",
            icon: "database",
            color: "#c84dff",
            descAr: "قالب مبيعات وتفعيل الاشتراكات البرمجية",
            descEn: "Software sales pipeline",
            stageDefs: [
              { nameAr: "تسجيل حساب تجريبي", nameEn: "Free Trial Signed Up", type: "active" },
              { nameAr: "تفعيل الحساب والبدء", nameEn: "Onboarded", type: "active" },
              { nameAr: "عرض مميزات النسخة المدفوعة", nameEn: "Feature Demo", type: "active" },
              { nameAr: "مرحلة اتخاذ القرار", nameEn: "Decision Maker Engaged", type: "active" },
              { nameAr: "ترقية لاشتراك مدفوع", nameEn: "Upgraded to Paid", type: "won" },
              { nameAr: "إلغاء الحساب", nameEn: "Churned", type: "lost" },
            ],
            isDefault: true,
          },
          {
            key: "freelance",
            nameAr: "الخدمات الحرة",
            nameEn: "Freelance",
            icon: "user",
            color: "#4fd6c8",
            descAr: "مشاريع فريلانس وخدمات مستقلة",
            descEn: "Freelance projects",
            stageDefs: [
              { nameAr: "استفسار", nameEn: "Inquiry", type: "active" },
              { nameAr: "عرض سعر", nameEn: "Quote", type: "active" },
              { nameAr: "دفعة مقدمة", nameEn: "Deposit", type: "active" },
              { nameAr: "قيد التنفيذ", nameEn: "In Progress", type: "active" },
              { nameAr: "تم التسليم", nameEn: "Delivered", type: "won" },
              { nameAr: "تم الإلغاء", nameEn: "Cancelled", type: "lost" },
            ],
            isDefault: true,
          },
        ];
        for (const t of initialTemplates) {
          const docKey = `template-${t.key}`;
          await firestore.setDoc(firestore.doc(db, "crm_templates", docKey), t);
        }
      } else {
        setTemplates(list);
      }
    });
    return () => unsub();
  }, []);

  const openTemplateEditor = (tmpl?: any) => {
    if (tmpl) {
      setEditingTemplate(tmpl);
      setTemplateNameEn(tmpl.nameEn || tmpl.name || "");
      setTemplateNameAr(tmpl.nameAr || tmpl.name || "");
      setTemplateDescEn(tmpl.descEn || tmpl.desc || "");
      setTemplateDescAr(tmpl.descAr || tmpl.desc || "");
      setTemplateIcon(tmpl.icon || "package");
      setTemplateColor(tmpl.color || "#3b82f6");
      setTemplateStages(
        tmpl.stageDefs.map((s: any) => ({
          nameAr: s.nameAr || s.name || "",
          nameEn: s.nameEn || s.name || "",
          type: s.type || "active",
        })),
      );
    } else {
      setEditingTemplate(null);
      setTemplateNameEn("");
      setTemplateNameAr("");
      setTemplateDescEn("");
      setTemplateDescAr("");
      setTemplateIcon("package");
      setTemplateColor("#3b82f6");
      setTemplateStages([
        { nameAr: "عميل جديد", nameEn: "New Lead", type: "active" },
        { nameAr: "تم التواصل", nameEn: "First Contact", type: "active" },
        { nameAr: "تم الإغلاق", nameEn: "Closed Won", type: "won" },
        { nameAr: "خسارة", nameEn: "Closed Lost", type: "lost" },
      ]);
    }
    setIsTemplateModalOpen(true);
  };

  const deleteTemplate = async (tmplKey: string) => {
    setConfirmDeleteTarget({
      type: "template",
      id: tmplKey,
      title: t("حذف القالب", "Delete Template"),
      description: t(
        "هل أنت متأكد من حذف هذا القالب؟ لن تتمكن من استخدامه لإنشاء لوحات جديدة.",
        "Are you sure you want to delete this template? You won't be able to use it to create new boards.",
      ),
      action: async () => {
        try {
          const docKey = `template-${tmplKey}`;
          await firestore.deleteDoc(firestore.doc(db, "crm_templates", docKey));
          toast.success(t("تم حذف القالب بنجاح", "Template deleted successfully"));
          setConfirmDeleteTarget(null);
        } catch (err) {
          console.error("Error deleting template:", err);
          toast.error(t("حدث خطأ أثناء حذف القالب", "Error deleting template"));
        }
      },
    });
  };

  const saveTemplate = async () => {
    if (!templateNameEn.trim() || !templateNameAr.trim()) {
      toast.error(
        t("يرجى كتابة اسم القالب باللغتين", "Please enter template name in both languages"),
      );
      return;
    }
    if (templateStages.length === 0) {
      toast.error(t("يرجى إضافة مرحلة واحدة على الأقل", "Please add at least one stage"));
      return;
    }

    // --- Copy-on-Write: Partner editing a global (admin) template ---
    // If the user is a partner and the template being edited is a global admin template,
    // save it as an isolated copy linked to this partner's userId instead.
    const isGlobalTemplate = editingTemplate && (editingTemplate.isDefault === true || !editingTemplate.userId);
    const partnerEditingGlobal = !isAdmin && isGlobalTemplate;

    let key: string;
    let isDefault = false;
    let ownerId: string | undefined = undefined;

    if (partnerEditingGlobal) {
      // Create a new copy owned by this partner — never touch the original
      key = `copy-${editingTemplate.key}-${user?.uid || ""}-${Date.now()}`;
      ownerId = user?.uid || "";
    } else if (editingTemplate) {
      // Editing own existing template
      key = editingTemplate.key;
      isDefault = editingTemplate.isDefault || false;
      ownerId = editingTemplate.userId || (isAdmin ? undefined : user?.uid || "");
    } else {
      // Creating brand new template
      key = `custom-${Date.now()}`;
      ownerId = isAdmin ? undefined : user?.uid || "";
    }

    const payload: any = {
      key,
      nameAr: templateNameAr.trim(),
      nameEn: templateNameEn.trim(),
      descAr: templateDescAr.trim(),
      descEn: templateDescEn.trim(),
      icon: templateIcon,
      color: templateColor,
      stageDefs: templateStages.map((s) => ({
        nameAr: s.nameAr.trim() || s.nameEn.trim(),
        nameEn: s.nameEn.trim() || s.nameAr.trim(),
        name: s.nameEn.trim(),
        type: s.type,
      })),
      isDefault,
    };
    if (ownerId) payload.userId = ownerId;
    if (partnerEditingGlobal && editingTemplate) {
      payload.originalKey = editingTemplate.key;
    }

    try {
      const docKey = `template-${key}`;
      await firestore.setDoc(firestore.doc(db, "crm_templates", docKey), payload);

      const updatedStages = templateStages.map((s, idx) => ({
        id: `s${idx}`,
        name: s.nameEn.trim() || s.nameAr.trim(),
        type: s.type,
        color:
          s.type === "won"
            ? "#37d67a"
            : s.type === "lost"
              ? "#ff5c7a"
              : `hsl(${idx * 45 + 200}, 70%, 60%)`,
      }));

      if (partnerEditingGlobal && editingTemplate) {
        // 1. Partner customized global template: copy-on-write
        // Find if this partner has a board using the global template
        const boardsQuery = firestore.query(
          firestore.collection(db, "crmBoards"),
          firestore.where("templateKey", "==", editingTemplate.key),
          firestore.where("userId", "==", user?.uid || "")
        );
        const boardsSnap = await firestore.getDocs(boardsQuery);
        const userBoard = boardsSnap.docs[0]?.data();

        if (userBoard) {
          const boardDocKey = `board-${userBoard.id}-${user?.uid || ""}`;
          await firestore.updateDoc(firestore.doc(db, "crmBoards", boardDocKey), {
            templateKey: key, // link to the new personalized copy
            stages: updatedStages,
          });

          // Migrate leads in deleted stages
          const remainingStageIds = updatedStages.map((s) => s.id);
          const firstStageId = remainingStageIds[0] || "";
          const leadsQuery = firestore.query(
            firestore.collection(db, "leads"),
            firestore.where("boardId", "==", userBoard.id)
          );
          const leadsSnap = await firestore.getDocs(leadsQuery);
          for (const docObj of leadsSnap.docs) {
            const lead = docObj.data();
            if (!remainingStageIds.includes(lead.stage)) {
              const leadDocKey = `lead-${lead.id}-${user?.uid || ""}`;
              await firestore.updateDoc(firestore.doc(db, "leads", leadDocKey), {
                stage: firstStageId,
                updatedAt: Date.now(),
              });
            }
          }
        }
      } else if (!isAdmin && editingTemplate) {
        // 2. Partner customized their own copy template
        const boardsQuery = firestore.query(
          firestore.collection(db, "crmBoards"),
          firestore.where("templateKey", "==", editingTemplate.key),
          firestore.where("userId", "==", user?.uid || "")
        );
        const boardsSnap = await firestore.getDocs(boardsQuery);
        const userBoard = boardsSnap.docs[0]?.data();

        if (userBoard) {
          const boardDocKey = `board-${userBoard.id}-${user?.uid || ""}`;
          await firestore.updateDoc(firestore.doc(db, "crmBoards", boardDocKey), {
            stages: updatedStages,
          });

          // Migrate leads in deleted stages
          const remainingStageIds = updatedStages.map((s) => s.id);
          const firstStageId = remainingStageIds[0] || "";
          const leadsQuery = firestore.query(
            firestore.collection(db, "leads"),
            firestore.where("boardId", "==", userBoard.id)
          );
          const leadsSnap = await firestore.getDocs(leadsQuery);
          for (const docObj of leadsSnap.docs) {
            const lead = docObj.data();
            if (!remainingStageIds.includes(lead.stage)) {
              const leadDocKey = `lead-${lead.id}-${user?.uid || ""}`;
              await firestore.updateDoc(firestore.doc(db, "leads", leadDocKey), {
                stage: firstStageId,
                updatedAt: Date.now(),
              });
            }
          }
        }
      } else if (isAdmin && editingTemplate && (editingTemplate.isDefault === true || !editingTemplate.userId)) {
        // 3. Admin updated a global template: propagate updates
        const templatesSnap = await firestore.getDocs(firestore.collection(db, "crm_templates"));
        const allTemplates = templatesSnap.docs.map((d: any) => d.data());

        const userIdsWithCopies = new Set<string>();
        allTemplates.forEach((t: any) => {
          if (t.userId && t.originalKey === key) {
            userIdsWithCopies.add(t.userId);
          }
        });

        const boardsQuery = firestore.query(
          firestore.collection(db, "crmBoards"),
          firestore.where("templateKey", "==", key)
        );
        const boardsSnap = await firestore.getDocs(boardsQuery);
        const boards = boardsSnap.docs.map((d: any) => d.data());

        for (const board of boards) {
          const boardOwnerId = board.userId;
          if (boardOwnerId && !userIdsWithCopies.has(boardOwnerId)) {
            const boardDocKey = `board-${board.id}-${boardOwnerId}`;
            await firestore.updateDoc(firestore.doc(db, "crmBoards", boardDocKey), {
              stages: updatedStages,
            });

            // Migrate leads in deleted stages
            const remainingStageIds = updatedStages.map((s) => s.id);
            const firstStageId = remainingStageIds[0] || "";
            const leadsQuery = firestore.query(
              firestore.collection(db, "leads"),
              firestore.where("boardId", "==", board.id)
            );
            const leadsSnap = await firestore.getDocs(leadsQuery);
            for (const docObj of leadsSnap.docs) {
              const lead = docObj.data();
              if (!remainingStageIds.includes(lead.stage)) {
                const leadDocKey = `lead-${lead.id}-${lead.userId || boardOwnerId}`;
                await firestore.updateDoc(firestore.doc(db, "leads", leadDocKey), {
                  stage: firstStageId,
                  updatedAt: Date.now(),
                });
              }
            }
          }
        }
      }

      if (partnerEditingGlobal) {
        toast.success(t("تم حفظ نسخة مستقلة من القالب لحسابك", "Saved as your own private copy of the template"));
      } else {
        toast.success(t("تم حفظ القالب بنجاح", "Template saved successfully"));
      }
      setIsTemplateModalOpen(false);
      setEditingTemplate(null);
    } catch (err) {
      console.error("Error saving template:", err);
      toast.error(t("حدث خطأ أثناء حفظ القالب", "Error saving template"));
    }
  };

  const getTemplateName = (tmpl: any) => {
    return isRtl ? tmpl.nameAr || tmpl.name : tmpl.nameEn || tmpl.name;
  };

  const getTemplateDesc = (tmpl: any) => {
    return isRtl ? tmpl.descAr || tmpl.desc : tmpl.descEn || tmpl.desc;
  };

  const [activeBoardId, setActiveBoardId] = useState<number>(state.crmBoards[0]?.id || 0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<CrmLead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [boardName, setBoardName] = useState("");
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<{
    type: "template" | "board" | "lead";
    id: string | number;
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // Admin view tab: "leads" (read-only master table) | "templates" (global templates CRUD)
  const [adminView, setAdminView] = useState<"leads" | "templates">("leads");

  const getLocalizedStageName = (name: string) => {
    const dict: Record<string, { ar: string; en: string }> = {
      "New Lead": { ar: "عميل جديد", en: "New Lead" },
      "عميل جديد": { ar: "عميل جديد", en: "New Lead" },
      "First Contact": { ar: "تم التواصل", en: "First Contact" },
      "تم التواصل": { ar: "تم التواصل", en: "First Contact" },
      "Meeting Scheduled": { ar: "اجتماع محجوز", en: "Meeting Scheduled" },
      "اجتماع محجوز": { ar: "اجتماع محجوز", en: "Meeting Scheduled" },
      Proposal: { ar: "عرض سعر", en: "Proposal" },
      "عرض سعر": { ar: "عرض سعر", en: "Proposal" },
      Negotiation: { ar: "تفاوض", en: "Negotiation" },
      تفاوض: { ar: "تفاوض", en: "Negotiation" },
      "Closed Won": { ar: "تم الإغلاق", en: "Closed Won" },
      "تم الإغلاق": { ar: "تم الإغلاق", en: "Closed Won" },
      "Closed Lost": { ar: "خسارة", en: "Closed Lost" },
      خسارة: { ar: "خسارة", en: "Closed Lost" },
      "New Booking Request": { ar: "طلب جديد", en: "New Booking Request" },
      "طلب جديد": { ar: "طلب جديد", en: "New Booking Request" },
      Assessment: { ar: "تم التقييم والقبول", en: "Assessment" },
      "تم التقييم والقبول": { ar: "تم التقييم والقبول", en: "Assessment" },
      Paid: { ar: "تم الدفع", en: "Paid" },
      "تم الدفع": { ar: "تم الدفع", en: "Paid" },
      "Sessions in Progress": { ar: "جلسات جارية", en: "Sessions in Progress" },
      "جلسات جارية": { ar: "جلسات جارية", en: "Sessions in Progress" },
      "Completed Sessions": { ar: "اكتمال الجلسات", en: "Completed Sessions" },
      "اكتمال الجلسات": { ar: "اكتمال الجلسات", en: "Completed Sessions" },
      Cancelled: { ar: "تم الإلغاء", en: "Cancelled" },
      "تم الإلغاء": { ar: "تم الإلغاء", en: "Cancelled" },
      "Landing Page Visitor": { ar: "زائر صفحة الهبوط", en: "Landing Page Visitor" },
      "زائر صفحة الهبوط": { ar: "زائر صفحة الهبوط", en: "Landing Page Visitor" },
      "Lead Magnet Download": { ar: "تحميل هدية مجانية", en: "Lead Magnet Download" },
      "تحميل هدية مجانية": { ar: "تحميل هدية مجانية", en: "Lead Magnet Download" },
      "Highly Interested": { ar: "مهتم بالمنتج", en: "Highly Interested" },
      "مهتم بالمنتج": { ar: "مهتم بالمنتج", en: "Highly Interested" },
      "Checkout Started": { ar: "محاولة شراء فاشلة", en: "Checkout Started" },
      "محاولة شراء فاشلة": { ar: "محاولة شراء فاشلة", en: "Checkout Started" },
      "Purchased & Active": { ar: "تم الشراء والتفعيل", en: "Purchased & Active" },
      "تم الشراء والتفعيل": { ar: "تم الشراء والتفعيل", en: "Purchased & Active" },
      Refunded: { ar: "طلب استرجاع", en: "Refunded" },
      "طلب استرجاع": { ar: "طلب استرجاع", en: "Refunded" },
      "Inbound Inquiry": { ar: "تواصل وارد", en: "Inbound Inquiry" },
      "تواصل وارد": { ar: "تواصل وارد", en: "Inbound Inquiry" },
      "Discovery Call": { ar: "مكالمة استكشافية", en: "Discovery Call" },
      "مكالمة استكشافية": { ar: "مكالمة استكشافية", en: "Discovery Call" },
      "Requirements Defined": { ar: "مرحلة تقييم الاحتياجات", en: "Requirements Defined" },
      "مرحلة تقييم الاحتياجات": { ar: "مرحلة تقييم الاحتياجات", en: "Requirements Defined" },
      "Proposal Submitted": { ar: "تم تقديم العرض المالي", en: "Proposal Submitted" },
      "تم تقديم العرض المالي": { ar: "تم تقديم العرض المالي", en: "Proposal Submitted" },
      "Contract Signed": { ar: "توقيع العقد والدفع", en: "Contract Signed" },
      "توقيع العقد والدفع": { ar: "توقيع العقد والدفع", en: "Contract Signed" },
      "Proposal Rejected": { ar: "عرض مرفوض", en: "Proposal Rejected" },
      "عرض مرفوض": { ar: "عرض مرفوض", en: "Proposal Rejected" },
      "Free Trial Signed Up": { ar: "تسجيل حساب تجريبي", en: "Free Trial Signed Up" },
      "تسجيل حساب تجريبي": { ar: "تسجيل حساب تجريبي", en: "Free Trial Signed Up" },
      Onboarded: { ar: "تفعيل الحساب والبدء", en: "Onboarded" },
      "تفعيل الحساب والبدء": { ar: "تفعيل الحساب والبدء", en: "Onboarded" },
      "Feature Demo": { ar: "عرض مميزات النسخة المدفوعة", en: "Feature Demo" },
      "عرض مميزات النسخة المدفوعة": { ar: "عرض مميزات النسخة المدفوعة", en: "Feature Demo" },
      "Decision Maker Engaged": { ar: "مرحلة اتخاذ القرار", en: "Decision Maker Engaged" },
      "مرحلة اتخاذ القرار": { ar: "مرحلة اتخاذ القرار", en: "Decision Maker Engaged" },
      "Upgraded to Paid": { ar: "ترقية لاشتراك مدفوع", en: "Upgraded to Paid" },
      "ترقية لاشتراك مدفوع": { ar: "ترقية لاشتراك مدفوع", en: "Upgraded to Paid" },
      Churned: { ar: "إلغاء الحساب", en: "Churned" },
      "إلغاء الحساب": { ar: "إلغاء الحساب", en: "Churned" },
      Inquiry: { ar: "استفسار", en: "Inquiry" },
      استفسار: { ar: "استفسار", en: "Inquiry" },
      Quote: { ar: "عرض سعر", en: "Quote" },
      Deposit: { ar: "دفعة مقدمة", en: "Deposit" },
      "دفعة مقدمة": { ar: "دفعة مقدمة", en: "Deposit" },
      "In Progress": { ar: "قيد التنفيذ", en: "In Progress" },
      "قيد التنفيذ": { ar: "قيد التنفيذ", en: "In Progress" },
      Delivered: { ar: "تم التسليم", en: "Delivered" },
      "تم التسليم": { ar: "تم التسليم", en: "Delivered" },
    };
    const match = dict[name];
    if (match) {
      return isRtl ? match.ar : match.en;
    }
    return name;
  };

  const getLocalizedBoardName = (board: any) => {
    const dict: Record<string, { ar: string; en: string }> = {
      general: { ar: "المبيعات الرئيسية", en: "General Sales" },
      coaching: { ar: "جلسات كوتشينج واستشارات", en: "Coaching & Consulting" },
      digitalproducts: { ar: "بيع منتجات رقمية", en: "Digital Products" },
      agency: { ar: "خدمات شركات ومؤسسات (B2B)", en: "B2B Agency" },
      saas: { ar: "بيع برمجيات واشتراكات (SaaS)", en: "SaaS Sales" },
      freelance: { ar: "الخدمات الحرة", en: "Freelance" },
    };
    if (board.templateKey) {
      const match = dict[board.templateKey];
      if (match) return isRtl ? match.ar : match.en;
    }
    if (board.name) {
      const match = dict[board.name];
      if (match) return isRtl ? match.ar : match.en;
    }
    return board.name;
  };

  // Template creation — writes directly to Firestore; onSnapshot reflects it instantly
  const createBoardFromTemplate = async (tmpl: any) => {
    setIsCreatingBoard(true);

    // No restriction on templates, allowing multiple boards from the same template

    const newId = Date.now();
    const newBoard = {
      id: newId,
      name: tmpl.name || tmpl.nameEn || tmpl.nameAr || "",
      icon: tmpl.icon || "package",
      color: tmpl.color || "#3b82f6",
      templateKey: tmpl.key,
      stages: (tmpl.stageDefs || []).map((s: any, i: number) => ({
        id: `s${i}`,
        name: s.name || s.nameEn || s.nameAr || "",
        type: s.type as "active" | "won" | "lost",
        color:
          s.type === "won"
            ? "#37d67a"
            : s.type === "lost"
              ? "#ff5c7a"
              : `hsl(${i * 45 + 200}, 70%, 60%)`,
      })),
      userId: user?.uid || "",
    };
    try {
      const docKey = `board-${newId}-${user?.uid || ""}`;
      await firestore.setDoc(firestore.doc(db, "crmBoards", docKey), newBoard);
      setActiveBoardId(newId);
      setIsTemplateGalleryOpen(false);
      toast.success(t("تم إنشاء اللوحة بنجاح", "Board created successfully"));
    } catch (err) {
      console.error("Error creating board:", err);
      toast.error(t("حدث خطأ أثناء إنشاء اللوحة", "Error creating board"));
    } finally {
      setIsCreatingBoard(false);
    }
  };

  // Form state
  const [leadName, setLeadName] = useState("");
  const [leadRevenue, setLeadRevenue] = useState<number | "">("");
  const [leadCountry, setLeadCountry] = useState("");
  const [leadScore, setLeadScore] = useState<number | "">("");
  const [leadNote, setLeadNote] = useState("");
  const [leadStage, setLeadStage] = useState("");

  useEffect(() => {
    if (state.crmBoards.length > 0) {
      const exists = state.crmBoards.some((b) => Number(b.id) === Number(activeBoardId));
      if (!exists || activeBoardId === 0) {
        setActiveBoardId(state.crmBoards[0].id);
      }
    } else {
      setActiveBoardId(0);
    }
  }, [state.crmBoards, activeBoardId]);

  const activeBoard =
    state.crmBoards.find((b) => Number(b.id) === Number(activeBoardId)) || state.crmBoards[0];

  const [editingStages, setEditingStages] = useState<Stage[]>([]);

  useEffect(() => {
    if (activeBoard) {
      setBoardName(getLocalizedBoardName(activeBoard));
      setEditingStages(
        activeBoard.stages
          ? activeBoard.stages.map((s) => ({
              ...s,
              name: getLocalizedStageName(s.name),
            }))
          : [],
      );
    }
  }, [activeBoard, isBoardSettingsOpen, isRtl]);

  if (!activeBoard) {
    return (
      <div className="space-y-6 pb-12" dir={isRtl ? "rtl" : "ltr"}>
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {t(
              "لا توجد لوحات CRM حالياً. قم بإنشاء أول لوحة للبدء.",
              "No CRM boards yet. Create your first board to get started.",
            )}
          </p>
          <button
            onClick={() => setIsTemplateGalleryOpen(true)}
            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            {t("فتح معرض القوالب", "Open Template Gallery")}
          </button>
        </div>

        {/* Template Gallery Modal */}
        <AnimatePresence>
          {isTemplateGalleryOpen && (
            <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isCreatingBoard && setIsTemplateGalleryOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-950 w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6"
              >
                {isCreatingBoard && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 rounded-2xl">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-850 dark:text-slate-100">
                      {t(
                        "جاري إنشاء اللوحة وإعداد المراحل...",
                        "Creating board and setting up stages...",
                      )}
                    </p>
                  </div>
                )}
                {renderTemplateGalleryContent()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Stage options for modal
  const stageOptions = activeBoard.stages.map((s) => ({
    value: s.id,
    label: getLocalizedStageName(s.name),
  }));

  const countryOptions = [
    { value: "السعودية", label: t("السعودية", "Saudi Arabia") },
    { value: "مصر", label: t("مصر", "Egypt") },
    { value: "الإمارات", label: t("الإمارات", "UAE") },
    { value: "الكويت", label: t("الكويت", "Kuwait") },
    { value: "قطر", label: t("قطر", "Qatar") },
    { value: "البحرين", label: t("البحرين", "Bahrain") },
  ];

  // Filter leads based on search
  const allFilteredLeads = () => {
    const leads = activeBoard.leads;
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.trim().toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.country || "").toLowerCase().includes(q) ||
        (l.note || "").toLowerCase().includes(q),
    );
  };

  const filteredLeads = (stageId: string) => {
    const leads = activeBoard.leads.filter((l) => l.stage === stageId);
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.trim().toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.country || "").toLowerCase().includes(q) ||
        (l.note || "").toLowerCase().includes(q),
    );
  };

  // Handlers
  const openAddLead = (defaultStage?: string) => {
    setSelectedLead(null);
    setLeadName("");
    setLeadRevenue("");
    setLeadCountry("");
    setLeadScore("");
    setLeadNote("");
    setLeadStage(defaultStage || activeBoard.stages[0]?.id || "");
    setIsAddLeadOpen(true);
  };

  const openEditLead = (lead: CrmLead) => {
    setSelectedLead(lead);
    setLeadName(lead.name);
    setLeadRevenue(lead.revenue);
    setLeadCountry(lead.country);
    setLeadScore(lead.score);
    setLeadNote(lead.note || "");
    setLeadStage(lead.stage);
    setIsAddLeadOpen(true);
  };

  const openDetailLead = (lead: CrmLead) => {
    setDetailLead(lead);
    setIsDetailOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) {
      toast.error(t("يرجى إدخال اسم العميل", "Please enter client name"));
      return;
    }
    const stageVal = leadStage || activeBoard.stages[0]?.id || "";
    if (!stageVal) {
      toast.error(t("يرجى اختيار المرحلة", "Please select a stage"));
      return;
    }

    setIsSavingLead(true);
    try {
      if (selectedLead) {
        const oldLead = activeBoard.leads.find((l) => l.id === selectedLead.id);
        const updatedHistory = [...(oldLead?.history || [])];
        const ownerUid = oldLead?.userId || activeBoard.userId || user?.uid || "";
        if (oldLead && oldLead.stage !== stageVal) {
          const oldStageName =
            activeBoard.stages.find((s) => s.id === oldLead.stage)?.name || oldLead.stage;
          const newStageName = activeBoard.stages.find((s) => s.id === stageVal)?.name || stageVal;
          updatedHistory.push(
            t(
              `تم نقل المرحلة من [${oldStageName}] إلى [${newStageName}]`,
              `Stage moved from [${oldStageName}] to [${newStageName}]`,
            ),
          );

          // Check if marked as Won
          const oldStage = activeBoard.stages.find((s) => s.id === oldLead.stage);
          const newStage = activeBoard.stages.find((s) => s.id === stageVal);
          const oldRevenue = Number(oldLead.revenue || 0);
          const newRevenue = Number(leadRevenue || 0);

          let salesInc = 0;
          let revenueInc = 0;
          let xpInc = 0;

          if (oldLead.stage !== stageVal) {
            const oldStageName = oldStage?.name || oldLead.stage;
            const newStageName = newStage?.name || stageVal;
            updatedHistory.push(
              t(
                `تم نقل المرحلة من [${oldStageName}] إلى [${newStageName}]`,
                `Stage moved from [${oldStageName}] to [${newStageName}]`,
              ),
            );

            // Stage changed
            if (newStage?.type === "won" && oldStage?.type !== "won") {
              salesInc = 1;
              revenueInc = 0;
              xpInc = 100;
            } else if (newStage?.type !== "won" && oldStage?.type === "won") {
              salesInc = -1;
              revenueInc = 0;
            }
          } else {
            // Stage is same, check if revenue changed for won deal
            if (oldStage?.type === "won") {
              revenueInc = 0;
            }
          }

          if (salesInc !== 0 || revenueInc !== 0 || xpInc !== 0) {
            const userRef = firestore.doc(db, "users", ownerUid);
            const updatePayload: any = {};
            if (salesInc !== 0) updatePayload.sales = firestore.increment(salesInc);
            if (revenueInc !== 0) updatePayload.revenue = firestore.increment(revenueInc);
            if (xpInc !== 0) updatePayload.xp = firestore.increment(xpInc);
            await firestore.updateDoc(userRef, updatePayload);

            if (xpInc > 0) {
              toast.success(
                t(
                  "تهانينا! حصلت على +100 نقطة خبرة لنجاح الصفقة 🎉",
                  "Congratulations! You earned +100 XP for winning the deal 🎉",
                ),
              );
            }
          }
        }
        const updatedLead = {
          ...oldLead,
          name: leadName,
          revenue: Number(leadRevenue),
          country: leadCountry,
          stage: stageVal,
          score: Number(leadScore),
          note: leadNote,
          history: updatedHistory,
          boardId: activeBoardId,
          userId: ownerUid,
        };
        const docKey = `lead-${selectedLead.id}-${ownerUid}`;
        await firestore.setDoc(firestore.doc(db, "leads", docKey), updatedLead);
        toast.success(t("تم تحديث العميل", "Lead updated"));
      } else {
        const newId = Date.now();
        const ownerUid = activeBoard.userId || user?.uid || "";
        const newLead = {
          id: newId,
          name: leadName,
          revenue: Number(leadRevenue),
          country: leadCountry,
          stage: stageVal,
          score: Number(leadScore),
          note: leadNote,
          createdAt: newId,
          history: [t("تم إنشاء العميل", "Lead created")],
          boardId: activeBoardId,
          userId: ownerUid,
        };
        const docKey = `lead-${newId}-${ownerUid}`;
        await firestore.setDoc(firestore.doc(db, "leads", docKey), newLead);

        // Check if created directly as Won
        const newStage = activeBoard.stages.find((s) => s.id === stageVal);
        if (newStage?.type === "won") {
          const userRef = firestore.doc(db, "users", ownerUid);
          await firestore.updateDoc(userRef, {
            sales: firestore.increment(1),
            xp: firestore.increment(100),
          });
          toast.success(
            t(
              "تهانينا! حصلت على +100 نقطة خبرة لنجاح الصفقة 🎉",
              "Congratulations! You earned +100 XP for winning the deal 🎉",
            ),
          );
        }

        toast.success(t("تم إضافة العميل", "Lead added"));
      }
      setIsAddLeadOpen(false);
    } catch (err) {
      console.error("Error saving lead:", err);
      toast.error(t("حدث خطأ أثناء الحفظ", "Error saving lead"));
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleDeleteLead = async () => {
    if (deleteTargetId === null) return;
    setIsDeletingLead(true);
    try {
      const lead = activeBoard.leads.find((l) => l.id === deleteTargetId);
      const ownerUid = lead?.userId || activeBoard.userId || user?.uid || "";
      if (lead) {
        const stage = activeBoard.stages.find((s) => s.id === lead.stage);
        if (stage?.type === "won") {
          const userRef = firestore.doc(db, "users", ownerUid);
          await firestore.updateDoc(userRef, {
            sales: firestore.increment(-1),
          });
        }
      }
      const docKey = `lead-${deleteTargetId}-${ownerUid}`;
      await firestore.deleteDoc(firestore.doc(db, "leads", docKey));
      toast.success(t("تم الحذف", "Deleted"));
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error(t("حدث خطأ أثناء الحذف", "Error deleting lead"));
    } finally {
      setIsDeletingLead(false);
    }
  };

  // Drag and drop (only for grid view)
  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    setDraggedId(leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedId === null) return;
    const lead = activeBoard.leads.find((l) => l.id === draggedId);
    if (lead && lead.stage !== targetStageId) {
      const oldStageName = activeBoard.stages.find((s) => s.id === lead.stage)?.name || lead.stage;
      const newStageName =
        activeBoard.stages.find((s) => s.id === targetStageId)?.name || targetStageId;
      const updatedHistory = [
        ...(lead.history || []),
        t(
          `تم نقل المرحلة من [${oldStageName}] إلى [${newStageName}]`,
          `Stage moved from [${oldStageName}] to [${newStageName}]`,
        ),
      ];

      updateState((draft) => {
        const board = draft.crmBoards.find((b) => b.id === activeBoardId);
        if (!board) return;
        const l = board.leads.find((x) => x.id === draggedId);
        if (l) {
          l.stage = targetStageId;
          l.history = updatedHistory;
        }
      });

      try {
        const ownerUid = lead.userId || activeBoard.userId || user?.uid || "";
        const docKey = `lead-${draggedId}-${ownerUid}`;
        await firestore.updateDoc(firestore.doc(db, "leads", docKey), {
          stage: targetStageId,
          history: updatedHistory,
        });

        // Check if marked as Won
        const oldStage = activeBoard.stages.find((s) => s.id === lead.stage);
        const newStage = activeBoard.stages.find((s) => s.id === targetStageId);
        
        let salesInc = 0;
        let revenueInc = 0;
        let xpInc = 0;

        if (newStage?.type === "won" && oldStage?.type !== "won") {
          salesInc = 1;
          revenueInc = 0;
          xpInc = 100;
        } else if (newStage?.type !== "won" && oldStage?.type === "won") {
          salesInc = -1;
          revenueInc = 0;
        }

        if (salesInc !== 0 || revenueInc !== 0 || xpInc !== 0) {
          const userRef = firestore.doc(db, "users", ownerUid);
          const updatePayload: any = {};
          if (salesInc !== 0) updatePayload.sales = firestore.increment(salesInc);
          if (revenueInc !== 0) updatePayload.revenue = firestore.increment(revenueInc);
          if (xpInc !== 0) updatePayload.xp = firestore.increment(xpInc);
          await firestore.updateDoc(userRef, updatePayload);

          if (xpInc > 0) {
            toast.success(
              t(
                "تهانينا! حصلت على +100 نقطة خبرة لنجاح الصفقة 🎉",
                "Congratulations! You earned +100 XP for winning the deal 🎉",
              ),
            );
          }
        }

        toast.success(t("تم نقل العميل", "Lead moved"));
      } catch (err) {
        console.error("Error moving lead:", err);
        toast.error(t("حدث خطأ أثناء النقل", "Error moving lead"));
      }
    }
    setDraggedId(null);
  };

  // Board settings
  const handleSaveBoardSettings = async () => {
    if (!boardName.trim()) {
      toast.error(t("أدخل اسم اللوحة", "Enter board name"));
      return;
    }
    if (editingStages.length === 0) {
      toast.error(t("يجب أن تكون هناك مرحلة واحدة على الأقل", "There must be at least one stage"));
      return;
    }
    try {
      const remainingStageIds = editingStages.map((s) => s.id);
      const firstStageId = remainingStageIds[0] || "";
      const leadsToUpdate = activeBoard.leads.filter((l) => !remainingStageIds.includes(l.stage));

      const ownerUid = activeBoard.userId || user?.uid || "";
      const docKey = `board-${activeBoardId}-${ownerUid}`;

      // Copy-on-Write: if the board is linked to a global template, fork it to a private partner template copy
      let nextTemplateKey = activeBoard.templateKey;
      const tmpl = (templates.length > 0 ? templates : CRM_TEMPLATES).find((t: any) => t.key === activeBoard.templateKey);
      const isGlobal = tmpl && (tmpl.isDefault === true || !tmpl.userId);
      if (!isAdmin && isGlobal && tmpl) {
        const newTmplKey = `copy-${activeBoard.templateKey}-${user?.uid || ""}-${Date.now()}`;
        const newTmplDocKey = `template-${newTmplKey}`;
        const newTmplPayload = {
          key: newTmplKey,
          originalKey: activeBoard.templateKey,
          nameAr: tmpl.nameAr || tmpl.name || "",
          nameEn: tmpl.nameEn || tmpl.name || "",
          descAr: tmpl.descAr || tmpl.desc || "",
          descEn: tmpl.descEn || tmpl.desc || "",
          icon: tmpl.icon || "package",
          color: tmpl.color || "#3b82f6",
          stageDefs: editingStages.map((s) => ({
            nameAr: s.name,
            nameEn: s.name,
            name: s.name,
            type: s.type,
          })),
          isDefault: false,
          userId: user?.uid || "",
        };
        await firestore.setDoc(firestore.doc(db, "crm_templates", newTmplDocKey), newTmplPayload);
        nextTemplateKey = newTmplKey;
      }

      await firestore.updateDoc(firestore.doc(db, "crmBoards", docKey), {
        name: boardName.trim(),
        stages: editingStages,
        templateKey: nextTemplateKey,
      });

      for (const lead of leadsToUpdate) {
        const leadDocKey = `lead-${lead.id}-${lead.userId || ownerUid}`;
        await firestore.updateDoc(firestore.doc(db, "leads", leadDocKey), {
          stage: firstStageId,
          updatedAt: Date.now(),
        });
      }

      toast.success(t("تم تحديث إعدادات اللوحة بنجاح", "Board settings updated successfully"));
    } catch (err) {
      console.error("Error updating board settings:", err);
      toast.error(t("حدث خطأ أثناء التحديث", "Error updating board"));
    }
    setIsBoardSettingsOpen(false);
  };

  const handleDeleteBoard = async () => {
    if (state.crmBoards.length === 1) {
      toast.error(t("لا يمكن حذف اللوحة الوحيدة", "Cannot delete the only board"));
      return;
    }
    setConfirmDeleteTarget({
      type: "board",
      id: activeBoardId,
      title: t("حذف اللوحة", "Delete Board"),
      description: t(
        "هل أنت متأكد من حذف اللوحة وجميع عملائها؟ هذا الإجراء لا يمكن التراجع عنه.",
        "Delete board and all its leads? This action cannot be undone.",
      ),
      action: async () => {
        try {
          const ownerUid = activeBoard.userId || user?.uid || "";
          await Promise.all(
            activeBoard.leads.map((lead) => {
              const docKey = `lead-${lead.id}-${lead.userId || ownerUid}`;
              return firestore.deleteDoc(firestore.doc(db, "leads", docKey));
            }),
          );
          const boardDocKey = `board-${activeBoardId}-${ownerUid}`;
          await firestore.deleteDoc(firestore.doc(db, "crmBoards", boardDocKey));
          setActiveBoardId(state.crmBoards.find((b) => b.id !== activeBoardId)?.id || 0);
          toast.success(t("تم حذف اللوحة", "Board deleted"));
          setConfirmDeleteTarget(null);
        } catch (err) {
          console.error("Error deleting board:", err);
          toast.error(t("حدث خطأ أثناء الحذف", "Error deleting board"));
        }
        setIsBoardSettingsOpen(false);
      },
    });
  };

  // Render lead card (used in grid view)
  const renderLeadCard = (lead: CrmLead) => {
    const scoreColor =
      lead.score >= 75
        ? "bg-lime-500/10 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400"
        : lead.score >= 50
          ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          : "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";

    const createdAgo = lead.createdAt ? timeAgo(lead.createdAt) : t("منذ فترة", "a while ago");

    return (
      <motion.div
        key={lead.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        draggable
        onDragStart={(e) => handleDragStart(e as any, lead.id)}
        className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-xl p-3.5 shadow-sm hover:shadow-md cursor-grab transition relative group"
        whileHover={{ y: -2 }}
        style={{ textAlign: isRtl ? "right" : "left" }}
      >
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition truncate">
            {lead.name}
          </h5>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-0.5 shrink-0">
            {lead.country}
          </span>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            {fmtMoney(lead.revenue)}
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${scoreColor}`}>
            {lead.score}%
          </span>
        </div>
        {lead.note && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 line-clamp-1 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            {lead.note}
          </p>
        )}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/40">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {createdAgo}
          </span>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetailLead(lead);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-blue-500 transition"
              title={t("عرض التفاصيل", "View details")}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {!isAdmin && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditLead(lead);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-purple-500 transition"
                  title={t("تعديل", "Edit")}
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(lead.id);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-red-500 transition"
                  title={t("حذف", "Delete")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Render list view row
  const renderListRow = (lead: CrmLead) => {
    const stageName = getLocalizedStageName(
      activeBoard.stages.find((s) => s.id === lead.stage)?.name || lead.stage,
    );
    const createdAgo = lead.createdAt ? timeAgo(lead.createdAt) : t("منذ فترة", "a while ago");
    const scoreColor =
      lead.score >= 75
        ? "text-lime-600 dark:text-lime-400"
        : lead.score >= 50
          ? "text-blue-600 dark:text-blue-400"
          : "text-orange-600 dark:text-orange-400";

    return (
      <motion.tr
        key={lead.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition group"
      >
        <td className="px-3 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 text-left rtl:text-center">
          {lead.name}
        </td>
        <td className="px-3 py-3 text-sm text-left rtl:text-center">
          <span
            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${activeBoard.stages.find((s) => s.id === lead.stage)?.color}22`,
              color: activeBoard.stages.find((s) => s.id === lead.stage)?.color,
            }}
          >
            {stageName}
          </span>
        </td>
        <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400 text-left rtl:text-center">
          {lead.country}
        </td>
        <td className="px-3 py-3 text-sm font-bold text-slate-800 dark:text-white text-left rtl:text-center">
          {fmtMoney(lead.revenue)}
        </td>
        <td className={`px-3 py-3 text-sm font-bold ${scoreColor} text-left rtl:text-center`}>
          {lead.score}%
        </td>
        <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400 text-left rtl:text-center">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {createdAgo}
          </span>
        </td>
        {/* Created By column - Admin only */}
        {isAdmin && (
          <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400 text-left rtl:text-center">
            {lead.userId ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[8px] font-bold text-purple-600 dark:text-purple-400">
                  {users
                    ?.find((u) => u.uid === lead.userId)
                    ?.name?.slice(0, 2)
                    .toUpperCase() || "??"}
                </span>
                {users?.find((u) => u.uid === lead.userId)?.name || lead.userId.slice(0, 8)}
              </span>
            ) : (
              <span className="text-slate-400">{t("غير معروف", "Unknown")}</span>
            )}
          </td>
        )}
        <td className="px-3 py-3 text-right rtl:text-center">
          <div className="flex gap-1 justify-end rtl:justify-center">
            <button
              onClick={() => openDetailLead(lead)}
              className="p-1 rounded-md text-slate-400 hover:text-blue-500 transition"
              title={t("عرض التفاصيل", "View details")}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {!isAdmin && (
              <>
                <button
                  onClick={() => openEditLead(lead)}
                  className="p-1 rounded-md text-slate-400 hover:text-purple-500 transition"
                  title={t("تعديل", "Edit")}
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(lead.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-red-500 transition"
                  title={t("حذف", "Delete")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </td>
      </motion.tr>
    );
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

  // ---------- Template Gallery Content ----------
  function renderTemplateGalleryContent() {
    // Partners see: global templates (isDefault or no userId) + their own templates
    const displayedTemplates = (templates.length > 0 ? templates : CRM_TEMPLATES).filter((tmpl: any) => {
      if (isAdmin) return true;
      return !tmpl.userId || tmpl.userId === user?.uid;
    });
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {t("اختار قالب CRM", "Choose CRM Template")}
            </h3>
            <button
              onClick={() => openTemplateEditor()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("قالب جديد", "New Template")}
            </button>
          </div>
          <button
            onClick={() => !isCreatingBoard && setIsTemplateGalleryOpen(false)}
            disabled={isCreatingBoard}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {t(
            "كل قالب بيعمل لوحة CRM مستقلة تمامًا — بياناتها ومراحلها لوحدها، منفصلة عن أي لوحة تانية",
            "Each template creates an independent CRM board with its own stages and leads, completely separate from others.",
          )}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedTemplates.map((tmpl) => {
            const isUsed = false;
            // Partners can only edit/delete templates they personally own, but can customize global templates
            const isOwnedByMe = !isAdmin && tmpl.userId === user?.uid;
            const isGlobal = tmpl.isDefault === true || !tmpl.userId;
            const canEdit = isAdmin || isGlobal || isOwnedByMe;
            const canDelete = isAdmin || isOwnedByMe;
            return (
              <div
                key={tmpl.key}
                onClick={() => {
                  if (!isCreatingBoard) createBoardFromTemplate(tmpl);
                }}
                className={`relative bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition group ${
                  isCreatingBoard
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-lg"
                }`}
                style={{ borderTop: `3px solid ${tmpl.color}` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-purple-500">
                      {renderVectorIcon(tmpl.icon || "package", "w-5 h-5")}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                      {getTemplateName(tmpl)}
                      {isUsed && (
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-normal">
                          {t("مستخدم", "Used")}
                        </span>
                      )}
                      {!isAdmin && tmpl.userId === user?.uid && (
                        <span className="text-[9px] bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-normal">
                          {t("خاص", "Mine")}
                        </span>
                      )}
                    </h4>
                  </div>
                  <div className="flex gap-1 z-10">
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTemplateEditor(tmpl);
                        }}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-650 transition"
                        title={isGlobal && !isAdmin ? t("تخصيص القالب", "Customize Template") : t("تعديل القالب", "Edit Template")}
                      >
                        {isGlobal && !isAdmin ? (
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Edit className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(tmpl.key);
                        }}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition"
                        title={t("حذف القالب", "Delete Template")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full">
                  <p className="text-xs text-slate-555 dark:text-slate-400 mb-3">
                    {getTemplateDesc(tmpl)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.stageDefs.map((s: any, i: number) => (
                      <span
                        key={i}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {isRtl ? s.nameAr || s.name : s.nameEn || s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  // ---------- CRM Templates for fallback ----------
  const CRM_TEMPLATES = [
    {
      key: "general",
      name: t("المبيعات الرئيسية", "General Sales"),
      icon: "package",
      color: "#c8ff4d",
      desc: t("قالب عام للمبيعات والعملاء المحتملين", "General sales and leads"),
      stageDefs: [
        { name: t("عميل جديد", "New Lead"), type: "active" },
        { name: t("تم التواصل", "First Contact"), type: "active" },
        { name: t("اجتماع محجوز", "Meeting Scheduled"), type: "active" },
        { name: t("عرض سعر", "Proposal"), type: "active" },
        { name: t("تفاوض", "Negotiation"), type: "active" },
        { name: t("تم الإغلاق", "Closed Won"), type: "won" },
        { name: t("خسارة", "Closed Lost"), type: "lost" },
      ],
    },
    {
      key: "coaching",
      name: t("جلسات كوتشينج واستشارات", "Coaching & Consulting"),
      icon: "brain",
      color: "#ff84ff",
      desc: t("إدارة جلسات التدريب والمستفيدين", "Manage coaching clients"),
      stageDefs: [
        { name: t("طلب جديد", "New Booking Request"), type: "active" },
        { name: t("تم التقييم والقبول", "Assessment"), type: "active" },
        { name: t("تم الدفع", "Paid"), type: "active" },
        { name: t("جلسات جارية", "Sessions in Progress"), type: "active" },
        { name: t("اكتمال الجلسات", "Completed Sessions"), type: "won" },
        { name: t("تم الإلغاء", "Cancelled"), type: "lost" },
      ],
    },
    {
      key: "digitalproducts",
      name: t("بيع منتجات رقمية", "Digital Products"),
      icon: "laptop",
      color: "#ffa600",
      desc: t("مبيعات الكورسات، الكتب والاشتراكات", "Courses, books & subscriptions"),
      stageDefs: [
        { name: t("زائر صفحة الهبوط", "Landing Page Visitor"), type: "active" },
        { name: t("تحميل هدية مجانية", "Lead Magnet Download"), type: "active" },
        { name: t("مهتم بالمنتج", "Highly Interested"), type: "active" },
        { name: t("محاولة شراء فاشلة", "Checkout Started"), type: "active" },
        { name: t("تم الشراء والتفعيل", "Purchased & Active"), type: "won" },
        { name: t("طلب استرجاع", "Refunded"), type: "lost" },
      ],
    },
    {
      key: "agency",
      name: t("خدمات شركات ومؤسسات (B2B)", "B2B Agency"),
      icon: "briefcase",
      color: "#84a6ff",
      desc: t("إدارة صفقات وعقود الشركات الكبرى", "Deals and contracts for B2B"),
      stageDefs: [
        { name: t("تواصل وارد", "Inbound Inquiry"), type: "active" },
        { name: t("مكالمة استكشافية", "Discovery Call"), type: "active" },
        { name: t("مرحلة تقييم الاحتياجات", "Requirements Defined"), type: "active" },
        { name: t("تم تقديم العرض المالي", "Proposal Submitted"), type: "active" },
        { name: t("توقيع العقد والدفع", "Contract Signed"), type: "won" },
        { name: t("عرض مرفوض", "Proposal Rejected"), type: "lost" },
      ],
    },
    {
      key: "saas",
      name: t("بيع برمجيات واشتراكات (SaaS)", "SaaS Sales"),
      icon: "database",
      color: "#c84dff",
      desc: t("قالب مبيعات وتفعيل الاشتراكات البرمجية", "Software sales pipeline"),
      stageDefs: [
        { name: t("تسجيل حساب تجريبي", "Free Trial Signed Up"), type: "active" },
        { name: t("تفعيل الحساب والبدء", "Onboarded"), type: "active" },
        { name: t("عرض مميزات النسخة المدفوعة", "Feature Demo"), type: "active" },
        { name: t("مرحلة اتخاذ القرار", "Decision Maker Engaged"), type: "active" },
        { name: t("ترقية لاشتراك مدفوع", "Upgraded to Paid"), type: "won" },
        { name: t("إلغاء الحساب", "Churned"), type: "lost" },
      ],
    },
    {
      key: "freelance",
      name: t("الخدمات الحرة", "Freelance"),
      icon: "user",
      color: "#4fd6c8",
      desc: t("مشاريع فريلانس وخدمات مستقلة", "Freelance projects"),
      stageDefs: [
        { name: t("استفسار", "Inquiry"), type: "active" },
        { name: t("عرض سعر", "Quote"), type: "active" },
        { name: t("دفعة مقدمة", "Deposit"), type: "active" },
        { name: t("قيد التنفيذ", "In Progress"), type: "active" },
        { name: t("تم التسليم", "Delivered"), type: "won" },
        { name: t("تم الإلغاء", "Cancelled"), type: "lost" },
      ],
    },
  ];

  // Flat list of ALL leads across ALL boards (for admin master view)
  const allLeadsFlat = state.crmBoards.flatMap((board) =>
    (board.leads || []).map((lead) => ({ ...lead, _boardName: getLocalizedBoardName(board) })),
  );

  return (
    <div className="space-y-6 pb-12" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {t("إدارة علاقات العملاء (CRM)", "CRM")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("سحب وإفلات لإدارة العملاء", "Drag & drop lead management")}
          </p>
        </div>

        {/* Admin view tab bar */}
        {isAdmin && (
          <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 gap-1">
            <button
              onClick={() => setAdminView("leads")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                adminView === "leads"
                  ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {t("كل العملاء", "All Leads")}
            </button>
            <button
              onClick={() => setAdminView("templates")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                adminView === "templates"
                  ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {t("القوالب", "Templates")}
            </button>
          </div>
        )}
      </div>

      {/* ======================== ADMIN: Templates Table ======================== */}
      {isAdmin && adminView === "templates" && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {t("قوالب CRM العالمية", "Global CRM Templates")}
            </h3>
            <button
              onClick={() => openTemplateEditor()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("قالب جديد", "New Template")}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-10" />
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("اسم القالب", "Template Name")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("عدد المراحل", "Stages")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("النوع", "Type")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("الإجراءات", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(templates.length > 0 ? templates : CRM_TEMPLATES)
                  .filter((tmpl: any) => tmpl.isDefault === true || !tmpl.userId)
                  .map((tmpl: any) => (
                  <tr
                    key={tmpl.key}
                    className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                  >
                    <td className="px-4 py-3">
                      <span className="text-purple-500">{renderVectorIcon(tmpl.icon || "package", "w-5 h-5")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tmpl.color }}
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-white">
                            {isRtl ? tmpl.nameAr || tmpl.name : tmpl.nameEn || tmpl.name}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            {isRtl ? tmpl.descAr || tmpl.desc || "" : tmpl.descEn || tmpl.desc || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(tmpl.stageDefs || []).slice(0, 4).map((s: any, i: number) => (
                          <span
                            key={i}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {isRtl ? s.nameAr || s.name : s.nameEn || s.name}
                          </span>
                        ))}
                        {(tmpl.stageDefs || []).length > 4 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            +{(tmpl.stageDefs || []).length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {tmpl.isDefault || !tmpl.userId ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          {t("عالمي", "Global")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {t("شريك", "Partner")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openTemplateEditor(tmpl)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                          title={t("تعديل", "Edit")}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(tmpl.key)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          title={t("حذف", "Delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================== ADMIN: Master Read-Only Leads Table ======================== */}
      {isAdmin && adminView === "leads" && (
        <>
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("🔍 ابحث بالاسم أو الدولة...", "🔍 Search by name or country...")}
              className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {t("جميع العملاء على المنصة", "All Platform Leads")}
              </h3>
              <span className="text-xs text-slate-400">
                {allLeadsFlat.filter((l) => {
                  const q = searchQuery.trim().toLowerCase();
                  return !q || l.name.toLowerCase().includes(q) || (l.country || "").toLowerCase().includes(q);
                }).length}{" "}
                {t("عميل", "leads")}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("الاسم", "Name")}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("اللوحة", "Board")}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("الدولة", "Country")}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("القيمة", "Value")}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("الدرجة", "Score")}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("تاريخ الإضافة", "Created")}</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("الشريك المنشئ", "Created By")}</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("عرض", "View")}</th>
                  </tr>
                </thead>
                <tbody>
                  {allLeadsFlat
                    .filter((l) => {
                      const q = searchQuery.trim().toLowerCase();
                      return !q || l.name.toLowerCase().includes(q) || (l.country || "").toLowerCase().includes(q);
                    })
                    .map((lead) => {
                      const partnerName = users?.find((u) => u.uid === lead.userId)?.name;
                      const scoreColor =
                        lead.score >= 75
                          ? "text-lime-600 dark:text-lime-400"
                          : lead.score >= 50
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-orange-500 dark:text-orange-400";
                      return (
                        <tr
                          key={`${lead.id}-${lead.userId}`}
                          className="border-b border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                        >
                          <td className="px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200">{lead.name}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{lead._boardName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{lead.country}</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-800 dark:text-white">{fmtMoney(lead.revenue)}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${scoreColor}`}>{lead.score}%</td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lead.createdAt ? timeAgo(lead.createdAt) : t("منذ فترة", "a while ago")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                            {partnerName ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[8px] font-bold text-purple-600 dark:text-purple-400">
                                  {partnerName.slice(0, 2).toUpperCase()}
                                </span>
                                {partnerName}
                              </span>
                            ) : (
                              <span className="text-slate-400">{t("غير معروف", "Unknown")}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openDetailLead(lead)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                              title={t("عرض التفاصيل", "View Details")}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {allLeadsFlat.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
                        {t("لا توجد عملاء على المنصة بعد", "No leads on the platform yet")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================== PARTNER VIEW ======================== */}
      {!isAdmin && (
        <>
          {/* Board tabs + view controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 overflow-x-auto custom-scroll flex-1 sm:flex-none">
                {state.crmBoards.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBoardId(b.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center shrink-0 ${
                      Number(activeBoardId) === Number(b.id)
                        ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    <span className={isRtl ? "ml-1.5" : "mr-1.5"}>
                      {renderVectorIcon(b.icon || "package", "w-4 h-4")}
                    </span>
                    {getLocalizedBoardName(b)}
                  </button>
                ))}
                <button
                  onClick={() => setIsTemplateGalleryOpen(true)}
                  className="px-4 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-purple-500 transition border border-dashed border-slate-300 dark:border-slate-700 shrink-0"
                >
                  +
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                    title={t("عرض شبكي", "Grid view")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                    title={t("عرض جدولي", "List view")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBoardSettingsOpen(true)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition border border-slate-200/50 dark:border-slate-850"
                    title={t("إعدادات اللوحة", "Board Settings")}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openAddLead()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t("عميل جديد", "New Lead")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                "🔍 ابحث بالاسم أو الدولة أو الملاحظة...",
                "🔍 Search by name, country or note...",
              )}
              className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Content with view switching */}
          <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 items-start w-full max-w-full scrollbar-thin"
          >
            {activeBoard.stages.map((stage) => {
              const stageLeads = filteredLeads(stage.id);
              const totalValue = stageLeads.reduce((sum, l) => sum + l.revenue, 0);
              const isExpanded = expandedColumns[stage.id] || false;
              const visibleLeads = isExpanded ? stageLeads : stageLeads.slice(0, 3);
              const hasMore = stageLeads.length > 3;

              return (
                <motion.div
                  key={stage.id}
                  variants={itemVariants}
                  className="bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-4 flex flex-col max-h-[70vh] w-80 shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-sm shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {getLocalizedStageName(stage.name)}
                      </h4>
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                        {stageLeads.length}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                      {fmtMoney(totalValue)}
                    </span>
                  </div>

                  {/* Leads list */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 custom-scroll">
                    <AnimatePresence initial={false}>
                      {visibleLeads.map((lead) => renderLeadCard(lead))}
                    </AnimatePresence>

                    {stageLeads.length === 0 && (
                      <div className="text-center text-[10px] text-slate-400 dark:text-slate-600 border border-dashed border-slate-200/50 dark:border-slate-800/80 rounded-xl py-6">
                        {t("لا توجد صفقات", "No leads")}
                      </div>
                    )}
                  </div>

                  {/* Show more / Show less button */}
                  {hasMore && (
                    <button
                      onClick={() => {
                        setExpandedColumns((prev) => ({
                          ...prev,
                          [stage.id]: !prev[stage.id],
                        }));
                      }}
                      className="mt-3 p-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition flex items-center justify-center gap-1 border border-dashed border-purple-300 dark:border-purple-700"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          {t("عرض أقل", "Show less")}
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-3.5 h-3.5" />
                          {t(
                            `عرض ${stageLeads.length - 3} أكثر`,
                            `Show ${stageLeads.length - 3} more`,
                          )}
                        </>
                      )}
                    </button>
                  )}

                  {/* Add lead button - Partners only */}
                  {!isAdmin && (
                    <button
                      onClick={() => openAddLead(stage.id)}
                      className="mt-3 p-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-purple-500 hover:text-purple-500 transition"
                    >
                      + {t("إضافة عميل", "Add lead")}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-3 text-left rtl:text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("الاسم", "Name")}
                    </th>
                    <th className="px-3 py-3 text-left rtl:text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("المرحلة", "Stage")}
                    </th>
                    <th className="px-3 py-3 text-left rtl:text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("الدولة", "Country")}
                    </th>
                    <th className="px-3 py-3 text-left rtl:text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("القيمة", "Value")}
                    </th>
                    <th className="px-3 py-3 text-left rtl:text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("الدرجة", "Score")}
                    </th>
                    <th className="px-3 py-3 text-left rtl:text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("تاريخ الإضافة", "Created")}
                    </th>
                    {isAdmin && (
                      <th className="px-3 py-3 text-left rtl:text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t("تم الإنشاء بواسطة", "Created By")}
                      </th>
                    )}
                    <th className="px-3 py-3 text-right rtl:text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("الإجراءات", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {allFilteredLeads().length === 0 ? (
                      <tr>
                        <td
                          colSpan={isAdmin ? 8 : 7}
                          className="text-center py-8 text-sm text-slate-500 dark:text-slate-400"
                        >
                          {t("لا توجد عملاء", "No leads found")}
                        </td>
                      </tr>
                    ) : (
                      allFilteredLeads().map((lead) => renderListRow(lead))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
          </AnimatePresence>
        </>
      )} {/* end !isAdmin partner view */}

      {/* ---------- MODALS ---------- */}

      {/* Board Settings Modal */}
      <AnimatePresence>
        {isBoardSettingsOpen && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBoardSettingsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t("إعدادات اللوحة", "Board Settings")}
                </h3>
                <button
                  onClick={() => setIsBoardSettingsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-655 dark:text-slate-350 block mb-1">
                    {t("اسم اللوحة", "Board Name")}
                  </label>
                  <input
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-slate-850 dark:text-white"
                  />
                </div>

                {/* STAGES MANAGER */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-855">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-350 block">
                    {t("مراحل اللوحة", "Board Stages")}
                  </label>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scroll">
                    {editingStages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 p-2 rounded-xl"
                      >
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const updated = [...editingStages];
                              const temp = updated[index];
                              updated[index] = updated[index - 1];
                              updated[index - 1] = temp;
                              setEditingStages(updated);
                            }}
                            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === editingStages.length - 1}
                            onClick={() => {
                              const updated = [...editingStages];
                              const temp = updated[index];
                              updated[index] = updated[index + 1];
                              updated[index + 1] = temp;
                              setEditingStages(updated);
                            }}
                            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: stage.color }}
                        />

                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => {
                            const updated = [...editingStages];
                            updated[index].name = e.target.value;
                            setEditingStages(updated);
                          }}
                          className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-855 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />

                        <Select
                          value={stage.type}
                          onChange={(val) => {
                            const updated = [...editingStages];
                            const nextType = val as "active" | "won" | "lost";
                            updated[index].type = nextType;
                            if (nextType === "won") updated[index].color = "#37d67a";
                            else if (nextType === "lost") updated[index].color = "#ff5c7a";
                            setEditingStages(updated);
                          }}
                          options={[
                            { value: "active", label: t("نشطة", "Active"), color: "#6366f1" },
                            { value: "won", label: t("ناجحة", "Won"), color: "#37d67a" },
                            { value: "lost", label: t("خسارة", "Lost"), color: "#ff5c7a" },
                          ]}
                          size="sm"
                          className="w-24 sm:w-28 shrink-0"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (editingStages.length <= 1) {
                              toast.error(
                                t(
                                  "يجب أن تحتوي اللوحة على مرحلة واحدة على الأقل",
                                  "Board must have at least 1 stage",
                                ),
                              );
                              return;
                            }
                            setEditingStages(editingStages.filter((_, i) => i !== index));
                          }}
                          className="p-1 text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center bg-purple-500/[0.03] dark:bg-purple-500/[0.01] border border-dashed border-purple-350 dark:border-purple-800/80 p-2 rounded-xl mt-2">
                    <input
                      type="text"
                      placeholder={t("مرحلة جديدة...", "New stage...")}
                      id="new-stage-name"
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (!val) return;
                          const newStage: Stage = {
                            id: `s-${Date.now()}`,
                            name: val,
                            type: "active",
                            color: `hsl(${editingStages.length * 40 + 200}, 75%, 60%)`,
                          };
                          setEditingStages([...editingStages, newStage]);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("new-stage-name") as HTMLInputElement;
                        const val = el?.value?.trim();
                        if (!val) {
                          toast.error(t("أدخل اسم المرحلة", "Enter stage name"));
                          return;
                        }
                        const newStage: Stage = {
                          id: `s-${Date.now()}`,
                          name: val,
                          type: "active",
                          color: `hsl(${editingStages.length * 40 + 200}, 75%, 60%)`,
                        };
                        setEditingStages([...editingStages, newStage]);
                        if (el) el.value = "";
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                    >
                      {t("إضافة", "Add")}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  {state.crmBoards.length > 1 && (
                    <button
                      onClick={handleDeleteBoard}
                      className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 transition"
                    >
                      {t("حذف اللوحة", "Delete Board")}
                    </button>
                  )}
                  <button
                    onClick={() => setIsBoardSettingsOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    onClick={handleSaveBoardSettings}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition"
                  >
                    {t("حفظ", "Save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Gallery Modal */}
      <AnimatePresence>
        {isTemplateGalleryOpen && (
          <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCreatingBoard && setIsTemplateGalleryOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6"
            >
              {isCreatingBoard && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 rounded-2xl">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-slate-850 dark:text-slate-100">
                    {t(
                      "جاري إنشاء اللوحة وإعداد المراحل...",
                      "Creating board and setting up stages...",
                    )}
                  </p>
                </div>
              )}
              {renderTemplateGalleryContent()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Lead Modal */}
      <AnimatePresence>
        {isAddLeadOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSavingLead && setIsAddLeadOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-950 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {selectedLead ? t("تعديل العميل", "Edit Lead") : t("عميل جديد", "New Lead")}
                </h3>
                <button
                  type="button"
                  onClick={() => !isSavingLead && setIsAddLeadOpen(false)}
                  disabled={isSavingLead}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLead} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t("الاسم", "Name")}
                  </label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    disabled={isSavingLead}
                    placeholder={t("الاسم الكامل", "Full name")}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      {t("القيمة ($)", "Value ($)")}
                    </label>
                    <input
                      type="number"
                      value={leadRevenue}
                      onChange={(e) =>
                        setLeadRevenue(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      disabled={isSavingLead}
                      placeholder={t("مثال: 1500", "e.g., 1500")}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      {t("الدولة", "Country")}
                    </label>
                    <input
                      type="text"
                      value={leadCountry}
                      onChange={(e) => setLeadCountry(e.target.value)}
                      disabled={isSavingLead}
                      placeholder={t("مثال: السعودية", "e.g., Saudi Arabia")}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      {t("درجة الجدية (0-100)", "Score (0-100)")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={leadScore}
                      onChange={(e) =>
                        setLeadScore(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      disabled={isSavingLead}
                      placeholder={t("مثال: 80", "e.g., 80")}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      {t("المرحلة", "Stage")}
                    </label>
                    <Select
                      value={leadStage}
                      onChange={(val) => setLeadStage(val as string)}
                      options={stageOptions}
                      disabled={isSavingLead}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t("ملاحظات", "Notes")}
                  </label>
                  <textarea
                    rows={3}
                    value={leadNote}
                    onChange={(e) => setLeadNote(e.target.value)}
                    disabled={isSavingLead}
                    placeholder={t(
                      "مثال: يفضل التواصل عبر الواتساب...",
                      "e.g., prefers WhatsApp...",
                    )}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none disabled:opacity-50"
                  />
                </div>

                {selectedLead && selectedLead.history && selectedLead.history.length > 0 && (
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {t("سجل التغييرات", "History")}
                    </span>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg max-h-20 overflow-y-auto space-y-1 text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono custom-scroll">
                      {selectedLead.history.map((h, idx) => (
                        <div key={idx}>• {h}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  {selectedLead && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetId(selectedLead.id);
                        setIsAddLeadOpen(false);
                      }}
                      disabled={isSavingLead}
                      className="text-sm font-semibold text-red-600 hover:text-red-700 transition disabled:opacity-50"
                    >
                      {t("حذف", "Delete")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAddLeadOpen(false)}
                    disabled={isSavingLead}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition disabled:opacity-50"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingLead}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingLead && (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {t("حفظ", "Save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeletingLead && setDeleteTargetId(null)}
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
                  "هل أنت متأكد من رغبتك في حذف هذا العميل نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
                  "Are you sure you want to delete this lead permanently? This action cannot be undone.",
                )}
              </p>
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => !isDeletingLead && setDeleteTargetId(null)}
                  disabled={isDeletingLead}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition disabled:opacity-50"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  onClick={handleDeleteLead}
                  disabled={isDeletingLead}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeletingLead && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {t("حذف", "Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && detailLead && (
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
              className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {t("تفاصيل العميل", "Lead Details")}
                </h3>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {detailLead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">
                      {detailLead.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {detailLead.country} ·{" "}
                      {detailLead.createdAt ? timeAgo(detailLead.createdAt) : ""}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-center">
                    <div className="text-sm font-bold text-emerald-500">
                      {fmtMoney(detailLead.revenue)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t("القيمة", "Value")}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-center">
                    <div className="text-sm font-bold">{detailLead.score}%</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t("الدرجة", "Score")}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-center">
                    <div className="text-sm font-bold text-purple-500">
                      {getLocalizedStageName(
                        activeBoard.stages.find((s) => s.id === detailLead.stage)?.name ||
                          detailLead.stage,
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t("المرحلة", "Stage")}
                    </div>
                  </div>
                </div>

                {detailLead.note && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {t("ملاحظات", "Notes")}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-300">
                      {detailLead.note}
                    </div>
                  </div>
                )}

                {detailLead.history && detailLead.history.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {t("سجل التغييرات", "History")}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1 text-xs text-slate-600 dark:text-slate-400 custom-scroll">
                      {detailLead.history.map((h, idx) => (
                        <div key={idx}>• {h}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition"
                  >
                    {t("إغلاق", "Close")}
                  </button>
                  {!isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setIsDetailOpen(false);
                          openEditLead(detailLead);
                        }}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition"
                      >
                        {t("تعديل", "Edit")}
                      </button>
                      <button
                        onClick={() => {
                          setIsDetailOpen(false);
                          setDeleteTargetId(detailLead.id);
                        }}
                        className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition"
                      >
                        {t("حذف", "Delete")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- TEMPLATE EDITOR MODAL ---------- */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scroll"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {editingTemplate
                      ? t("تعديل قالب CRM", "Edit CRM Template")
                      : t("إنشاء قالب CRM جديد", "Create New CRM Template")}
                  </h3>
                  <button
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-left">
                  {/* Row 1: Name En and Name Ar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                        {t("الاسم بالإنجليزية", "Name (EN)")}
                      </label>
                      <input
                        type="text"
                        value={templateNameEn}
                        onChange={(e) => setTemplateNameEn(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="e.g. Real Estate Sales"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                        {t("الاسم بالعربية", "Name (AR)")}
                      </label>
                      <input
                        type="text"
                        value={templateNameAr}
                        onChange={(e) => setTemplateNameAr(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-right transition"
                        placeholder="مثال: مبيعات العقارات"
                      />
                    </div>
                  </div>

                  {/* Row 2: Desc En and Desc Ar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                        {t("الوصف بالإنجليزية", "Description (EN)")}
                      </label>
                      <textarea
                        value={templateDescEn}
                        onChange={(e) => setTemplateDescEn(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition min-h-[70px] resize-none"
                        placeholder="Template description in English"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                        {t("الوصف بالعربية", "Description (AR)")}
                      </label>
                      <textarea
                        value={templateDescAr}
                        onChange={(e) => setTemplateDescAr(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-right transition min-h-[70px] resize-none"
                        placeholder="وصف القالب باللغة العربية"
                      />
                    </div>
                  </div>

                  {/* Row 3: Icon & Color - Using Vector Icons */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                        {t("الأيقونة", "Icon")}
                      </label>
                      <IconSelect
                        value={templateIcon}
                        onChange={(val) => setTemplateIcon(val)}
                        options={ICON_OPTIONS.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                          icon: renderVectorIcon(opt.value, "w-5 h-5"),
                        }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                        {t("لون القالب", "Color")}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={templateColor}
                          onChange={(e) => setTemplateColor(e.target.value)}
                          className="w-10 h-10 border-0 rounded-xl cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={templateColor}
                          onChange={(e) => setTemplateColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono uppercase focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Stages with professional dropdown */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {t("مراحل خط البيع (CRM Stages)", "CRM Stages")}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setTemplateStages([
                            ...templateStages,
                            { nameAr: "", nameEn: "", type: "active" },
                          ])
                        }
                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t("إضافة مرحلة", "Add Stage")}
                      </button>
                    </div>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scroll pr-1">
                      {templateStages.map((stage, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {/* Sort controls */}
                            <div className="flex flex-row sm:flex-col gap-1 sm:gap-0.5 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const copy = [...templateStages];
                                  const temp = copy[idx];
                                  copy[idx] = copy[idx - 1];
                                  copy[idx - 1] = temp;
                                  setTemplateStages(copy);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-20 transition"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === templateStages.length - 1}
                                onClick={() => {
                                  const copy = [...templateStages];
                                  const temp = copy[idx];
                                  copy[idx] = copy[idx + 1];
                                  copy[idx + 1] = temp;
                                  setTemplateStages(copy);
                                }}
                                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-20 transition"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={stage.nameEn}
                              onChange={(e) => {
                                const copy = [...templateStages];
                                copy[idx].nameEn = e.target.value;
                                setTemplateStages(copy);
                              }}
                              placeholder={t("اسم بالإنجليزية", "Name (EN)")}
                              className="flex-1 min-w-0 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              value={stage.nameAr}
                              onChange={(e) => {
                                const copy = [...templateStages];
                                copy[idx].nameAr = e.target.value;
                                setTemplateStages(copy);
                              }}
                              placeholder={t("اسم بالعربية", "Name (AR)")}
                              className="flex-1 min-w-0 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-right"
                            />
                          </div>

                          <div className="flex gap-2 items-center justify-between sm:justify-start shrink-0">
                            {/* Professional Stage Type Selector */}
                            <Select
                              value={stage.type}
                              onChange={(val) => {
                                const copy = [...templateStages];
                                copy[idx].type = val as "active" | "won" | "lost";
                                setTemplateStages(copy);
                              }}
                              options={[
                                { value: "active", label: t("نشطة", "Active"), color: "#6366f1" },
                                { value: "won", label: t("فوز", "Won"), color: "#37d67a" },
                                { value: "lost", label: t("خسارة", "Lost"), color: "#ff5c7a" },
                              ]}
                              size="sm"
                              className="w-28"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setTemplateStages(templateStages.filter((_, i) => i !== idx))
                              }
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:border-0 sm:bg-transparent transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={saveTemplate}
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition"
                  >
                    {t("حفظ القالب", "Save Template")}
                  </button>
                  <button
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Target Modal */}
      <AnimatePresence>
        {confirmDeleteTarget && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteTarget(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 p-6 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 mb-4 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {confirmDeleteTarget.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 px-2">
                {confirmDeleteTarget.description}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    confirmDeleteTarget.action();
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition-all duration-200"
                >
                  {t("تأكيد الحذف", "Confirm Delete")}
                </button>
                <button
                  onClick={() => setConfirmDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all duration-200"
                >
                  {t("إلغاء", "Cancel")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

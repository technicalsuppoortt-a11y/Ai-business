import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Layers,
  FileText,
  ShieldCheck,
  Ban,
  Tag,
  AlertOctagon,
  Coins,
  ListOrdered,
} from "lucide-react";
import { toast } from "sonner";
import { useAppState, AffiliateRule, INITIAL_RULES, mergeRulesWithInitial } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";

// Custom Premium Select Component with Portal support (renders outside overflow containers/modals)
interface CustomSelectOption {
  value: string;
  label: string;
  badgeColor?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  leftIcon?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

function CustomSelect({
  value,
  onChange,
  options,
  leftIcon,
  placeholder,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 200,
  });

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      updatePosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:border-purple-500/50 dark:hover:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-sm transition-all duration-200"
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span className="truncate">{selectedOpt?.label || placeholder}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-purple-500" : ""
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 100010,
            }}
            className="bg-white dark:bg-[#181b29] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 overflow-hidden backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto space-y-0.5 px-1 scrollbar-thin">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all text-right rtl:text-right ltr:text-left ${
                      isSelected
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-purple-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>,
          document.body
        )}
    </div>
  );
}

// Dynamic Penalty Steps Component (Add / Edit / Delete / Show)
interface DynamicStepsManagerProps {
  steps: string[];
  onChange: (steps: string[]) => void;
  isRtl: boolean;
}

function DynamicStepsManager({ steps, onChange, isRtl }: DynamicStepsManagerProps) {
  const [newStepText, setNewStepText] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingStepText, setEditingStepText] = useState("");

  const handleAddStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = newStepText.trim();
    if (!val) return;
    onChange([...steps, val]);
    setNewStepText("");
  };

  const handleRemoveStep = (indexToRemove: number) => {
    onChange(steps.filter((_, idx) => idx !== indexToRemove));
    if (editingIndex === indexToRemove) {
      setEditingIndex(null);
    }
  };

  const handleStartEdit = (index: number, currentVal: string) => {
    setEditingIndex(index);
    setEditingStepText(currentVal);
  };

  const handleSaveEdit = (index: number) => {
    const val = editingStepText.trim();
    if (!val) {
      handleRemoveStep(index);
    } else {
      const updated = [...steps];
      updated[index] = val;
      onChange(updated);
    }
    setEditingIndex(null);
    setEditingStepText("");
  };

  return (
    <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ListOrdered className="h-4 w-4 text-purple-500" />
          <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
            {isRtl ? `خطوات العقوبات التدريجية (${steps.length})` : `Penalty Steps (${steps.length})`}
          </label>
        </div>
        <span className="text-[10px] font-bold text-slate-400">
          {isRtl ? "إضافة / تعديل / حذف دائم" : "Dynamic Add / Edit / Delete"}
        </span>
      </div>

      {/* Add Step Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newStepText}
          onChange={(e) => setNewStepText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddStep();
            }
          }}
          placeholder={isRtl ? "اكتب تفاصيل الخطوة..." : "Type step details..."}
          className="flex-1 px-3 py-2 text-xs font-bold bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={() => handleAddStep()}
          disabled={!newStepText.trim()}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shrink-0 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isRtl ? "إضافة" : "Add"}</span>
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
        {steps.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic text-center py-2">
            {isRtl ? "لا توجد خطوات عقوبات محددة لهذه القاعدة" : "No penalty steps defined yet"}
          </p>
        ) : (
          steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-[#151824] border border-slate-200 dark:border-slate-800 rounded-xl text-xs shadow-2xs"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="h-5 w-5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[10px] font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                {editingIndex === idx ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingStepText}
                    onChange={(e) => setEditingStepText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEdit(idx);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-purple-500/50 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{step}</span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {editingIndex === idx ? (
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(idx)}
                    className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
                    title={isRtl ? "حفظ" : "Save"}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(idx, step)}
                    className="p-1 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={isRtl ? "تعديل" : "Edit"}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={isRtl ? "حذف" : "Delete"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminRulesSection() {
  const { state, updateState } = useAppState();
  const { userProfile, isAdmin } = useAuth();
  const isRtl = state?.settings?.language === "ar";

  const rules: AffiliateRule[] = useMemo(() => {
    return mergeRulesWithInitial(state?.rules || []);
  }, [state?.rules]);

  // Controls state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

  // Reset to page 1 on search or category filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AffiliateRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<AffiliateRule | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    id?: number;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    category: "prohibited" | "required" | "financial" | "policy";
    severity: "critical" | "warning" | "info";
    steps: string[];
  }>({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    category: "prohibited",
    severity: "critical",
    steps: [],
  });

  const categoryFilterOptions: CustomSelectOption[] = [
    { value: "all", label: isRtl ? "كافة التصنيفات" : "All Categories" },
    { value: "prohibited", label: isRtl ? "⛔ ممنوعات (Prohibited)" : "⛔ Prohibited" },
    { value: "required", label: isRtl ? "📋 متطلبات (Required)" : "📋 Required" },
    { value: "financial", label: isRtl ? "💰 مالية وعمولات (Financial)" : "💰 Financial" },
    { value: "policy", label: isRtl ? "⚖️ سياسات وعقوبات (Policies)" : "⚖️ Policies" },
  ];

  const modalCategoryOptions: CustomSelectOption[] = [
    { value: "prohibited", label: isRtl ? "⛔ ممنوعات (Prohibited)" : "⛔ Prohibited" },
    { value: "required", label: isRtl ? "📋 متطلبات إجبارية (Required)" : "📋 Required" },
    { value: "financial", label: isRtl ? "💰 المالية والعمولات (Financial)" : "💰 Financial" },
    { value: "policy", label: isRtl ? "⚖️ السياسات والعقوبات (Policy)" : "⚖️ Policy" },
  ];

  const modalSeverityOptions: CustomSelectOption[] = [
    { value: "critical", label: isRtl ? "🔴 صارم / حرج (Critical)" : "🔴 Critical" },
    { value: "warning", label: isRtl ? "🟠 تحذيري (Warning)" : "🟠 Warning" },
    { value: "info", label: isRtl ? "🔵 معلومات (Info)" : "🔵 Info" },
  ];

  // Category labels helper
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "prohibited":
        return { ar: "ممنوعات", en: "Prohibited", color: "bg-red-500/10 text-red-500 border-red-500/20" };
      case "required":
        return { ar: "متطلبات", en: "Required", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
      case "financial":
        return { ar: "مالية وعمولات", en: "Financial", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      case "policy":
        return { ar: "سياسات وعقوبات", en: "Policies", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
      default:
        return { ar: cat, en: cat, color: "bg-slate-500/10 text-slate-500 border-slate-500/20" };
    }
  };

  const getSeverityLabel = (sev?: string) => {
    switch (sev) {
      case "critical":
        return { ar: "صارم / حرج", en: "Critical", color: "bg-red-500/10 text-red-500 border-red-500/20" };
      case "warning":
        return { ar: "تنبيه مهم", en: "Warning", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      default:
        return { ar: "معلومات", en: "Info", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    }
  };

  // Filter rules
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
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
  }, [rules, searchQuery, selectedCategory]);

  // Paginated rules
  const totalPages = Math.max(1, Math.ceil(filteredRules.length / itemsPerPage));
  const paginatedRules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRules.slice(start, start + itemsPerPage);
  }, [filteredRules, currentPage, itemsPerPage]);

  // Handle open create modal
  const handleOpenCreate = () => {
    const nextId = rules.length > 0 ? Math.max(...rules.map((r) => r.id)) + 1 : 1;
    setFormData({
      id: nextId,
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      category: "prohibited",
      severity: "critical",
      steps: [],
    });
    setIsCreateOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (rule: AffiliateRule) => {
    setEditingRule(rule);
    setFormData({
      id: rule.id,
      titleAr: rule.titleAr,
      titleEn: rule.titleEn,
      descriptionAr: rule.descriptionAr || "",
      descriptionEn: rule.descriptionEn || "",
      category: rule.category,
      severity: rule.severity || "info",
      steps: rule.steps || [],
    });
  };

  // Submit Save / Create
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr.trim() || !formData.titleEn.trim()) {
      toast.error(isRtl ? "يرجى كتابة عنوان القاعدة بالعربية والإنجليزية" : "Please fill in title in both Arabic & English");
      return;
    }

    const catObj = getCategoryLabel(formData.category);
    const targetId = Number(formData.id) > 0 ? Number(formData.id) : Date.now();

    const newRuleObj: AffiliateRule = {
      id: targetId,
      titleAr: formData.titleAr.trim(),
      titleEn: formData.titleEn.trim(),
      category: formData.category,
      categoryAr: catObj.ar,
      categoryEn: catObj.en,
      severity: formData.severity,
      ...(formData.descriptionAr?.trim() ? { descriptionAr: formData.descriptionAr.trim() } : {}),
      ...(formData.descriptionEn?.trim() ? { descriptionEn: formData.descriptionEn.trim() } : {}),
      ...(formData.steps && formData.steps.length > 0 ? { steps: formData.steps } : {}),
    };

    try {
      await updateState((draft) => {
        const currentRules = mergeRulesWithInitial(draft.rules || []);
        let updatedRules: AffiliateRule[];
        if (editingRule) {
          updatedRules = currentRules.map((r) => (r.id === editingRule.id ? newRuleObj : r));
        } else {
          const withoutNew = currentRules.filter((r) => r.id !== newRuleObj.id);
          updatedRules = [...withoutNew, newRuleObj];
        }
        draft.rules = updatedRules.sort((a, b) => a.id - b.id);
      });

      toast.success(
        editingRule
          ? isRtl
            ? "تم تحديث القاعدة بنجاح"
            : "Rule updated successfully"
          : isRtl
          ? "تم إضافة القاعدة الجديدة بنجاح"
          : "New rule added successfully"
      );

      setIsCreateOpen(false);
      setEditingRule(null);
    } catch (err) {
      console.error("Error saving rule:", err);
      toast.error(isRtl ? "فشل حفظ التغييرات" : "Failed to save changes");
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingRule) return;

    try {
      await updateState((draft) => {
        const currentRules = mergeRulesWithInitial(draft.rules || []);
        draft.rules = currentRules.filter((r) => r.id !== deletingRule.id);
      });

      toast.success(isRtl ? "تم حذف القاعدة بنجاح" : "Rule deleted successfully");
      setDeletingRule(null);
    } catch (err) {
      toast.error("فشل حذف القاعدة");
    }
  };

  // Guard for Admin access
  if (userProfile?.role !== "admin" && !isAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#12141c] rounded-2xl border border-red-500/30 max-w-xl mx-auto my-12 space-y-4 shadow-xl">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500 w-16 h-16 mx-auto flex items-center justify-center">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          {isRtl ? "غير مسموح بالدخول" : "Access Denied"}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isRtl
            ? "هذه الصفحة مخصصة لمديري النظام فقط لإدارة قواعد الشركاء."
            : "This page is strictly restricted to Administrators for managing affiliate rules."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-1 sm:px-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-[#12141c]/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isRtl ? "إدارة القواعد" : "Rules Management"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-3xl">
            {isRtl
              ? "إدارة وإضافة وتحديث قواعد التسويق بالعمولة. التغييرات تنعكس فوراً على واجهة الشركاء."
              : "Manage, create, and update affiliate rules. Changes immediately reflect on partner dashboards."}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{isRtl ? "إضافة قاعدة جديدة" : "+ Add New Rule"}</span>
        </button>
      </div>

      {/* Controls Bar: Search & Ultra-Premium Custom Selectbox */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? "بحث في القواعد..." : "Search rules..."}
            className="w-full pl-10 rtl:pl-4 rtl:pr-10 ltr:pr-4 ltr:pl-10 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Custom Premium Category Filter Dropdown */}
        <CustomSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={categoryFilterOptions}
          leftIcon={<Filter className="h-4 w-4 text-purple-500" />}
          className="min-w-[220px] shrink-0"
        />
      </div>

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-16 text-center">#</th>
                <th className="px-4 py-3.5">{isRtl ? "عنوان القاعدة" : "Rule Title"}</th>
                <th className="px-4 py-3.5">{isRtl ? "خطوات العقوبات" : "Penalty Steps"}</th>
                <th className="px-4 py-3.5">{isRtl ? "التصنيف" : "Category"}</th>
                <th className="px-4 py-3.5">{isRtl ? "الأهمية" : "Severity"}</th>
                <th className="px-4 py-3.5 text-center w-28">{isRtl ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-bold">
                    {isRtl ? "لا يوجد قواعد تطابق البحث" : "No rules found matching search"}
                  </td>
                </tr>
              ) : (
                paginatedRules.map((rule) => {
                  const catObj = getCategoryLabel(rule.category);
                  const sevObj = getSeverityLabel(rule.severity);

                  return (
                    <tr
                      key={rule.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-center font-black text-slate-400">
                        {rule.id < 10 ? `0${rule.id}` : rule.id}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {rule.titleAr}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px] truncate">
                          {rule.titleEn}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {rule.steps && rule.steps.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1 max-w-xs">
                            {rule.steps.map((st, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-500/20 truncate max-w-[120px]"
                              >
                                #{idx + 1} {st}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {isRtl ? "لا توجد خطوات" : "None"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${catObj.color}`}>
                          {isRtl ? catObj.ar : catObj.en}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${sevObj.color}`}>
                          {isRtl ? sevObj.ar : sevObj.en}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(rule)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title={isRtl ? "تعديل" : "Edit"}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingRule(rule)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title={isRtl ? "حذف" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {filteredRules.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
            <div>
              {isRtl
                ? `عرض ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    filteredRules.length
                  )} من إجمالي ${filteredRules.length} قاعدة`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    filteredRules.length
                  )} of ${filteredRules.length} rules`}
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 rounded-lg text-xs font-black transition ${
                    currentPage === pageNum
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL WITH DYNAMIC STEPS BUILDER */}
      <AnimatePresence>
        {(isCreateOpen || editingRule) && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingRule(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    {editingRule ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingRule
                      ? isRtl
                        ? `تعديل القاعدة رقم #${editingRule.id}`
                        : `Edit Rule #${editingRule.id}`
                      : isRtl
                      ? "إضافة قاعدة جديدة"
                      : "Add New Rule"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingRule(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? "رقم القاعدة (#)" : "Rule ID Number"}
                    </label>
                    <input
                      type="number"
                      value={formData.id || 1}
                      onChange={(e) => setFormData({ ...formData, id: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>

                  {/* Custom Category Select */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isRtl ? "التصنيف الرئيسي *" : "Main Category *"}
                    </label>
                    <CustomSelect
                      value={formData.category}
                      onChange={(val: any) => setFormData({ ...formData, category: val })}
                      options={modalCategoryOptions}
                      leftIcon={<Layers className="h-4 w-4 text-purple-500" />}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isRtl ? "عنوان القاعدة باللغة العربية *" : "Arabic Title *"}
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="مثال: يمنع تعديل الأسعار"
                    className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isRtl ? "عنوان القاعدة باللغة الإنجليزية *" : "English Title *"}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Example: Price Modifications Prohibited"
                    className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isRtl ? "الوصف التفصيلي (عربي - اختياري)" : "Arabic Description (Optional)"}
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isRtl ? "الوصف التفصيلي (إنجليزي - اختياري)" : "English Description (Optional)"}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Severity Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isRtl ? "مستوى الأهمية *" : "Severity Level *"}
                  </label>
                  <CustomSelect
                    value={formData.severity}
                    onChange={(val: any) => setFormData({ ...formData, severity: val })}
                    options={modalSeverityOptions}
                    leftIcon={<ShieldAlert className="h-4 w-4 text-red-500" />}
                  />
                </div>

                {/* DYNAMIC PENALTY STEPS MANAGER */}
                <DynamicStepsManager
                  steps={formData.steps}
                  onChange={(newSteps) => setFormData({ ...formData, steps: newSteps })}
                  isRtl={isRtl}
                />

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingRule(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {isRtl ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/20"
                  >
                    {editingRule
                      ? isRtl
                        ? "حفظ التغييرات"
                        : "Save Changes"
                      : isRtl
                      ? "إضافة القاعدة"
                      : "Add Rule"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deletingRule && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setDeletingRule(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 text-center space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-500 w-14 h-14 mx-auto flex items-center justify-center">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isRtl ? "تأكيد حذف القاعدة" : "Confirm Rule Deletion"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isRtl
                    ? `هل أنت متاكد من رغبتك في حذف القاعدة رقم #${deletingRule.id} ("${deletingRule.titleAr}")؟`
                    : `Are you sure you want to delete Rule #${deletingRule.id} ("${deletingRule.titleEn}")?`}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingRule(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {isRtl ? "تراجع" : "Cancel"}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/20"
                >
                  {isRtl ? "نعم، احذف القاعدة" : "Yes, Delete Rule"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

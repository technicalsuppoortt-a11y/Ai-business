import React, { useState, useEffect } from "react";
import {
  AffiliateLevel,
  AffiliateLevelFeature,
  CURRENT_RATES,
  CURRENCY_SYMBOLS,
  useAppState
} from "../../context/StateContext";
import { LevelIcon } from "../../components/LevelIcon";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  Search,
  AlertTriangle,
  Sparkles,
  Settings
} from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_ICONS = [
  "Award", "Medal", "Crown", "Gem", "Star",
  "Shield", "Zap", "TrendingUp", "Trophy", "Heart",
  "Target", "Rocket", "Diamond", "Flame", "Lightning",
  "CheckCircle", "Briefcase", "Globe", "Layers", "Users",
  "Palette", "GraduationCap", "Bell", "Sparkles", "Gift"
];

export default function AdminAffiliateLevelsSection({
  isRtl,
  t,
}: {
  isRtl: boolean;
  t: (ar: string, en: string) => string;
}) {
  const { state, updateState, currency } = useAppState();

  const allLevels: AffiliateLevel[] = (state.affiliateLevels || []).slice().sort(
    (a: AffiliateLevel, b: AffiliateLevel) => a.order - b.order
  );
  const featureDefs: AffiliateLevelFeature[] = state.affiliateLevelSettings?.features || [];
  
  const [reviewDays, setReviewDays] = useState<number>(state.affiliateLevelSettings?.reviewDurationDays || 90);
  const [savingReview, setSavingReview] = useState(false);

  const [editingLevel, setEditingLevel] = useState<AffiliateLevel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [levelForm, setLevelForm] = useState<Partial<AffiliateLevel>>({});
  const [savingLevel, setSavingLevel] = useState(false);
  
  const [levelToDelete, setLevelToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<AffiliateLevelFeature | null>(null);
  const [featureForm, setFeatureForm] = useState<{
    key?: string;
    ar?: string;
    en?: string;
    icon?: string;
  }>({});

  // Migration script for old features
  useEffect(() => {
    if (state.affiliateLevelSettings?.features) {
      let needsMigration = false;
      const newFeatures = state.affiliateLevelSettings.features.map((f: any) => {
        if (f.label && !f.name) {
          needsMigration = true;
          return {
            ...f,
            name: {
              ar: f.label,
              en: f.labelEn || f.label
            },
            label: undefined,
            labelEn: undefined,
          };
        }
        return f;
      });
      
      const newLevels = (state.affiliateLevels || []).map((l: any) => {
        if (typeof l.name === 'string') {
          needsMigration = true;
          return {
            ...l,
            name: {
              ar: l.name,
              en: l.nameEn || l.name
            }
          };
        }
        return l;
      });

      if (needsMigration) {
        // Use a small timeout to avoid updating state during render if it's immediate
        setTimeout(() => {
          updateState((draft: any) => {
            draft.affiliateLevelSettings.features = newFeatures;
            draft.affiliateLevels = newLevels;
          });
        }, 0);
      }
    }
  }, [state.affiliateLevelSettings?.features, updateState]);

  const filteredLevels = allLevels.filter(lvl => 
    (lvl.name?.ar?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (lvl.name?.en?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  function fmtDisplay(usdAmount: number | null): string {
    if (usdAmount === null) return "∞";
    const rate = CURRENT_RATES[currency] || 1;
    const symbol = CURRENCY_SYMBOLS[currency] || "$";
    const converted = usdAmount * rate;
    if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
    if (converted >= 1_000) return `${symbol}${(converted / 1_000).toFixed(0)}K`;
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  const openAddLevel = () => {
    setEditingLevel(null);
    setLevelForm({
      id: `level_${Date.now()}`,
      name: { ar: "", en: "" },
      icon: "Award",
      color: "#6366f1",
      minSalesUSD: 0,
      maxSalesUSD: null,
      bonusPercentage: 0,
      unlockedFeatureKeys: [],
      order: allLevels.length,
    });
    setIsModalOpen(true);
  };

  const openEditLevel = (lvl: AffiliateLevel) => {
    setEditingLevel(lvl);
    setLevelForm({ ...lvl });
    setIsModalOpen(true);
  };

  const confirmDeleteLevel = (levelId: string) => {
    setLevelToDelete(levelId);
  };

  const handleDeleteLevel = () => {
    if (!levelToDelete) return;
    updateState((draft: any) => {
      draft.affiliateLevels = draft.affiliateLevels.filter((l: AffiliateLevel) => l.id !== levelToDelete);
    });
    toast.success(t("تم حذف المستوى بنجاح", "Level successfully deleted"));
    setLevelToDelete(null);
  };

  const handleSaveLevel = async () => {
    if (!levelForm.name?.ar?.trim() || !levelForm.name?.en?.trim()) {
      toast.error(t("أدخل اسم المستوى بالعربية والإنجليزية", "Enter level name in Arabic & English"));
      return;
    }
    const bonus = Number(levelForm.bonusPercentage);
    if (isNaN(bonus) || bonus < 0 || bonus > 100) {
      toast.error(t("نسبة المكافأة يجب أن تكون بين 0 و 100", "Bonus % must be between 0 and 100"));
      return;
    }
    setSavingLevel(true);
    try {
      await updateState((draft: any) => {
        const dLevels: AffiliateLevel[] = draft.affiliateLevels || [];
        const saveData: AffiliateLevel = {
          id: levelForm.id || `level_${Date.now()}`,
          name: {
            ar: levelForm.name!.ar.trim(),
            en: levelForm.name!.en.trim(),
          },
          icon: levelForm.icon || "Award",
          color: levelForm.color || "#6366f1",
          minSalesUSD: Number(levelForm.minSalesUSD) || 0,
          maxSalesUSD: levelForm.maxSalesUSD !== null && levelForm.maxSalesUSD !== undefined
            ? Number(levelForm.maxSalesUSD)
            : null,
          bonusPercentage: bonus,
          unlockedFeatureKeys: levelForm.unlockedFeatureKeys || [],
          order: Number(levelForm.order) ?? dLevels.length,
        };
        if (editingLevel) {
          const idx = dLevels.findIndex((l) => l.id === editingLevel.id);
          if (idx !== -1) dLevels[idx] = saveData;
        } else {
          dLevels.push(saveData);
        }
        draft.affiliateLevels = dLevels;
      });
      toast.success(editingLevel ? t("تم تحديث المستوى", "Level updated") : t("تم إنشاء المستوى", "Level created"));
      setIsModalOpen(false);
    } catch (err) {
      toast.error(t("حدث خطأ أثناء الحفظ", "Error saving level"));
    } finally {
      setSavingLevel(false);
    }
  };

  const handleSaveReviewDays = async () => {
    setSavingReview(true);
    try {
      await updateState((draft: any) => {
        if (!draft.affiliateLevelSettings) draft.affiliateLevelSettings = {};
        draft.affiliateLevelSettings.reviewDurationDays = reviewDays;
      });
      toast.success(t("تم حفظ مدة المراجعة بنجاح", "Review duration saved successfully"));
    } catch (e) {
      toast.error(t("خطأ في الحفظ", "Error saving"));
    } finally {
      setSavingReview(false);
    }
  };

  const toggleFeatureForLevel = (featureKey: string) => {
    setLevelForm((prev) => {
      const keys = prev.unlockedFeatureKeys || [];
      return {
        ...prev,
        unlockedFeatureKeys: keys.includes(featureKey)
          ? keys.filter((k) => k !== featureKey)
          : [...keys, featureKey],
      };
    });
  };

  // ==== Feature Handlers ====
  const openAddFeature = () => {
    setEditingFeature(null);
    setFeatureForm({
      key: `feat_${Date.now()}`,
      ar: "",
      en: "",
      icon: "CheckCircle"
    });
    setTimeout(() => {
      document.getElementById('feature-modal-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  const openEditFeature = (feat: AffiliateLevelFeature) => {
    setEditingFeature(feat);
    setFeatureForm({ key: feat.key, ar: feat.name.ar, en: feat.name.en, icon: feat.icon });
    setTimeout(() => {
      document.getElementById('feature-modal-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  const handleSaveFeature = () => {
    if (!featureForm.ar?.trim() || !featureForm.en?.trim()) {
      toast.error(t("يرجى إدخال اسم الميزة بالعربية والإنجليزية", "Please enter feature name in Arabic & English"));
      return;
    }
    updateState((draft: any) => {
      if (!draft.affiliateLevelSettings) draft.affiliateLevelSettings = { features: [] };
      if (!draft.affiliateLevelSettings.features) draft.affiliateLevelSettings.features = [];
      
      const features = draft.affiliateLevelSettings.features;
      const saveDat = {
        key: featureForm.key || `feat_${Date.now()}`,
        name: {
          ar: featureForm.ar.trim(),
          en: featureForm.en.trim(),
        },
        icon: featureForm.icon || "CheckCircle",
      };

      if (editingFeature) {
        const idx = features.findIndex((f: any) => f.key === editingFeature.key);
        if (idx !== -1) features[idx] = saveDat;
      } else {
        features.push(saveDat);
      }
    });
    setEditingFeature(null);
    setFeatureForm({});
    toast.success(editingFeature ? t("تم تحديث الميزة", "Feature updated") : t("تم إضافة الميزة", "Feature added"));
  };

  const handleDeleteFeature = () => {
    if (!featureToDelete) return;
    updateState((draft: any) => {
      draft.affiliateLevelSettings.features = draft.affiliateLevelSettings.features.filter((f: any) => f.key !== featureToDelete);
      draft.affiliateLevels.forEach((l: any) => {
        l.unlockedFeatureKeys = (l.unlockedFeatureKeys || []).filter((k: string) => k !== featureToDelete);
      });
    });
    toast.success(t("تم حذف الميزة بنجاح", "Feature deleted successfully"));
    setFeatureToDelete(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-500" />
          {t("إدارة مستويات الشراكة", "Manage Affiliate Levels")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            "تحكم في مستويات شركائك ومميزاتهم بناءً على مبيعاتهم.",
            "Control your partners levels and benefits based on their sales."
          )}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto flex-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 whitespace-nowrap">
              <span>{t("المستويات الحالية", "Current Levels")}</span>
            </h3>
            
            <div className="relative w-full sm:w-64 max-w-sm">
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("بحث باسم المستوى...", "Search by level name...")}
                className="w-full pl-9 pr-9 py-2.5 sm:py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-3 sm:top-2.5 h-4 w-4 text-slate-400`} />
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsFeatureModalOpen(true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
            >
              <Settings className="w-4 h-4" />
              {t("إدارة المزايا", "Manage Features")}
            </button>
            <button
              onClick={openAddLevel}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {t("مستوى جديد", "New Level")}
            </button>
          </div>
        </div>

        {/* Review Duration */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 md:p-5">
          <div className="flex-1">
            <label className="text-sm sm:text-xs font-bold text-amber-700 dark:text-amber-400">
              {t("مدة دورة المراجعة (أيام)", "Review Cycle Duration (days)")}
            </label>
            <p className="text-[11px] sm:text-[10px] text-amber-600 dark:text-amber-500 mt-1 sm:mt-0.5 leading-relaxed">
              {t("كل كم يوم يتم تقييم مستوى الشريك بناءً على مبيعاته؟", "How many days between level evaluations based on partner sales?")}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min={1}
              max={365}
              value={reviewDays}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0 && val <= 365) setReviewDays(val);
              }}
              className="w-full sm:w-20 text-center bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/50 rounded-lg px-3 py-2 sm:py-1.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
            />
            <button
              onClick={handleSaveReviewDays}
              disabled={savingReview}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap shadow-sm shadow-amber-500/20"
            >
              {savingReview ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {t("حفظ", "Save")}
            </button>
          </div>
        </div>

        {/* Levels list */}
        {filteredLevels.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
            {searchQuery 
              ? t("لا توجد مستويات مطابقة لبحثك.", "No levels match your search.")
              : t("لا توجد مستويات بعد. أضف مستوى الآن!", "No levels yet. Add one now!")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLevels.map((lvl) => (
              <div
                key={lvl.id}
                className="flex flex-col gap-4 rounded-2xl border-2 p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 bg-white dark:bg-slate-900 group"
                style={{ borderColor: `${lvl.color}44` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm"
                    style={{ backgroundColor: `${lvl.color}22`, border: `1.5px solid ${lvl.color}44` }}
                  >
                    <LevelIcon name={lvl.icon} className="w-7 h-7" style={{ color: lvl.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black truncate" style={{ color: lvl.color }}>
                      {isRtl ? (lvl.name?.ar || lvl.name as any) : (lvl.name?.en || lvl.name as any)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5 font-medium">
                      {fmtDisplay(lvl.minSalesUSD)} →{" "}
                      {lvl.maxSalesUSD !== null ? fmtDisplay(lvl.maxSalesUSD) : "∞"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <p className="text-xs font-extrabold bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm" style={{ color: lvl.color }}>
                    +{lvl.bonusPercentage}% {t("مكافأة", "Bonus")}
                  </p>
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditLevel(lvl)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDeleteLevel(lvl.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== Delete Confirmation Modal ====== */}
        <AnimatePresence>
          {levelToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
              onClick={() => setLevelToDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-md p-8 text-center relative overflow-hidden flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
                dir={isRtl ? "rtl" : "ltr"}
              >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-red-100 dark:bg-red-500/20 rounded-full animate-ping opacity-70" />
                  <div className="relative w-20 h-20 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 rounded-full flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
                    <AlertTriangle className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-800 dark:text-white text-2xl tracking-tight mb-3">
                  {t("تأكيد الحذف", "Confirm Deletion")}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto mb-8">
                  {t(
                    "هل أنت متأكد أنك تريد حذف هذا المستوى؟ لا يمكن التراجع عن هذا الإجراء وسيؤثر على الشركاء المنضمين له.",
                    "Are you sure you want to delete this level? This action cannot be undone and will affect associated partners."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => setLevelToDelete(null)}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    onClick={handleDeleteLevel}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("حذف نهائي", "Delete Permanently")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== Add / Edit Level Modal ====== */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
              onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
                dir={isRtl ? "rtl" : "ltr"}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="font-black text-slate-800 dark:text-white text-lg flex items-center gap-2">
                    {editingLevel ? <Edit className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                    {editingLevel
                      ? t("تعديل مستوى الشراكة", "Edit Affiliate Level")
                      : t("إضافة مستوى جديد", "Add New Level")}
                  </h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                    {/* Name */}
                    <div className="sm:col-span-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                        {t("اسم المستوى (عربي)", "Level Name (AR)")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={levelForm.name?.ar || ""}
                        onChange={(e) => setLevelForm((p: any) => ({ ...p, name: { ...p.name, ar: e.target.value } }))}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder={t("مثال: المستوى الذهبي", "e.g. Gold")}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                        {t("اسم المستوى (إنجليزي)", "Level Name (EN)")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={levelForm.name?.en || ""}
                        onChange={(e) => setLevelForm((p: any) => ({ ...p, name: { ...p.name, en: e.target.value } }))}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="e.g. Gold"
                      />
                    </div>

                    {/* Icon Visual Select Box */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                        {t("الأيقونة", "Icon")} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl">
                        {AVAILABLE_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            onClick={() => setLevelForm((p) => ({ ...p, icon: iconName }))}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
                              levelForm.icon === iconName
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900"
                                : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
                            }`}
                            title={iconName}
                          >
                            <LevelIcon name={iconName} className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                        {t("اللون المميّز", "Brand Color")}
                      </label>
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2 px-3 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                        <input
                          type="color"
                          value={levelForm.color || "#6366f1"}
                          onChange={(e) => setLevelForm((p) => ({ ...p, color: e.target.value }))}
                          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent p-0 flex-shrink-0"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-mono uppercase font-bold flex-1 text-center">
                          {levelForm.color}
                        </span>
                      </div>
                    </div>

                    {/* Bonus % */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                        {t("نسبة مكافأة العمولة %", "Commission Bonus %")}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={levelForm.bonusPercentage ?? 0}
                          onChange={(e) => setLevelForm((p) => ({ ...p, bonusPercentage: Number(e.target.value) }))}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <span className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-3 text-sm font-bold text-slate-400`}>%</span>
                      </div>
                    </div>

                    {/* Min / Max Thresholds in USD */}
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                          {t("الحد الأدنى للمبيعات (USD)", "Min Sales (USD)")}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={levelForm.minSalesUSD ?? 0}
                          onChange={(e) => setLevelForm((p) => ({ ...p, minSalesUSD: Number(e.target.value) }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-semibold">
                          ≈ {fmtDisplay(Number(levelForm.minSalesUSD) || 0)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                          {t("الحد الأقصى (USD)", "Max Sales (USD)")}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={levelForm.maxSalesUSD ?? ""}
                          onChange={(e) =>
                            setLevelForm((p) => ({
                              ...p,
                              maxSalesUSD: e.target.value === "" ? null : Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                          placeholder="∞"
                        />
                        {levelForm.maxSalesUSD !== null && levelForm.maxSalesUSD !== undefined && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-semibold">
                            ≈ {fmtDisplay(Number(levelForm.maxSalesUSD))}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                        {t("ترتيب العرض", "Display Order")}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={levelForm.order ?? 0}
                        onChange={(e) => setLevelForm((p) => ({ ...p, order: Number(e.target.value) }))}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Feature toggles */}
                  {featureDefs.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                      <label className="text-sm font-black text-slate-800 dark:text-white block mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        {t("المزايا والصلاحيات المتاحة", "Available Features & Perks")}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 rounded-xl">
                        {featureDefs.map((feat) => {
                          const checked = (levelForm.unlockedFeatureKeys || []).includes(feat.key);
                          return (
                            <label
                              key={feat.key}
                              className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl transition-all duration-200 group ${
                                checked
                                  ? "bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 shadow-sm"
                                  : "bg-slate-50 dark:bg-slate-800/30 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checked}
                                onChange={() => toggleFeatureForLevel(feat.key)}
                              />
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                                checked ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400"
                              }`}>
                                {checked && <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                              </div>
                              <span className={`text-sm font-bold flex items-center gap-2.5 ${checked ? "text-indigo-900 dark:text-indigo-200" : "text-slate-600 dark:text-slate-400"}`}>
                                {feat.icon && <LevelIcon name={feat.icon} className={`w-4 h-4 ${checked ? "text-indigo-500" : "text-slate-400"}`} />}
                                {isRtl ? feat.name?.ar || (feat as any).label : feat.name?.en || (feat as any).labelEn}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    onClick={handleSaveLevel}
                    disabled={savingLevel}
                    className="w-full sm:flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {savingLevel ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {t("حفظ المستوى", "Save Level")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== Manage Features Modal ====== */}
        <AnimatePresence>
          {isFeatureModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
              onClick={(e) => { if (e.target === e.currentTarget) setIsFeatureModalOpen(false); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                dir={isRtl ? "rtl" : "ltr"}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="font-black text-slate-800 dark:text-white text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    {t("إدارة المزايا", "Manage Features")}
                  </h3>
                  <button 
                    onClick={() => setIsFeatureModalOpen(false)}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div id="feature-modal-content" className="overflow-y-auto p-5 md:p-6 bg-slate-50/30 dark:bg-slate-900 flex-1">
                  
                  {/* Feature Editing Form */}
                  {(editingFeature !== null || featureForm.key) ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800/50 shadow-sm mb-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                        <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">
                          {editingFeature ? t("تعديل الميزة", "Edit Feature") : t("إضافة ميزة جديدة", "Add New Feature")}
                        </h4>
                        <button onClick={() => { setEditingFeature(null); setFeatureForm({}); }} className="text-slate-400 hover:text-slate-600 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            {t("اسم الميزة (عربي)", "Feature Name (AR)")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={featureForm.ar || ""}
                            onChange={(e) => setFeatureForm((p) => ({ ...p, ar: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={t("مثال: دعم فني على مدار الساعة", "e.g. 24/7 Support")}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            {t("اسم الميزة (إنجليزي)", "Feature Name (EN)")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            value={featureForm.en || ""}
                            onChange={(e) => setFeatureForm((p) => ({ ...p, en: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. 24/7 Priority Support"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
                            {t("الأيقونة", "Icon")}
                          </label>
                          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-h-40 overflow-y-auto">
                            {AVAILABLE_ICONS.map((iconName) => (
                              <button
                                key={`feat-icon-${iconName}`}
                                onClick={() => setFeatureForm((p) => ({ ...p, icon: iconName }))}
                                className={`p-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                  featureForm.icon === iconName
                                    ? "bg-indigo-500 text-white shadow-md"
                                    : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                <LevelIcon name={iconName} className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleSaveFeature}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {t("حفظ الميزة", "Save Feature")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <button
                        onClick={openAddFeature}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-300 dark:hover:text-indigo-400 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all font-bold text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        {t("إضافة ميزة جديدة للقائمة", "Add New Feature to List")}
                      </button>
                    </div>
                  )}

                  {/* Feature List */}
                  <div className="space-y-2">
                    {featureDefs.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        {t("القائمة فارغة. أضف مزايا جديدة لاستخدامها في مستويات الشراكة.", "List is empty. Add new features to use in affiliate levels.")}
                      </div>
                    ) : (
                      featureDefs.map((feat) => (
                        <div key={feat.key} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                              <LevelIcon name={feat.icon || "CheckCircle"} className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                                {isRtl ? (feat.name?.ar || (feat as any).label) : (feat.name?.en || (feat as any).labelEn || (feat as any).label)}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {isRtl ? (feat.name?.en || (feat as any).labelEn || (feat as any).label) : (feat.name?.ar || (feat as any).label)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => openEditFeature(feat)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setFeatureToDelete(feat.key)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 md:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <button
                    onClick={() => setIsFeatureModalOpen(false)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    {t("إغلاق", "Close")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== Delete Feature Confirmation Modal ====== */}
        <AnimatePresence>
          {featureToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
              onClick={() => setFeatureToDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-md p-8 text-center relative overflow-hidden flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
                dir={isRtl ? "rtl" : "ltr"}
              >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-red-100 dark:bg-red-500/20 rounded-full animate-ping opacity-70" />
                  <div className="relative w-20 h-20 bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 rounded-full flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
                    <AlertTriangle className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-800 dark:text-white text-2xl tracking-tight mb-3">
                  {t("تأكيد حذف الميزة", "Confirm Feature Deletion")}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto mb-8">
                  {t(
                    "هل أنت متأكد أنك تريد حذف هذه الميزة؟ سيتم إزالتها تلقائياً من أي مستويات تستخدمها حالياً ولن يمكن التراجع عن هذا الإجراء.",
                    "Are you sure you want to delete this feature? It will be removed from all levels currently using it and cannot be undone."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => setFeatureToDelete(null)}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    onClick={handleDeleteFeature}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("حذف نهائي", "Delete Permanently")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

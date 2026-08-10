import { useState, useEffect } from "react";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { db, firestore } from "../../config/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Check,
  X,
  Edit,
  Trash2,
  Copy,
  DollarSign,
  Building2,
  Wallet,
  Key,
  ShieldCheck,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 12 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// Stripe Config defaults
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_STRIPE = {
  enabled: false,
  publishableKey: "",
  secretKey: "",
  paymentLink: "",
  paymentLinkAnnual: "",
};

export default function PaymentMethodsSection() {
  const { state, updateState } = useAppState();
  const { isAdmin } = useAuth();

  const isRtl = state.settings?.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // ── Existing payment methods state ──
  const [newPayName, setNewPayName] = useState("");
  const [newPayValue, setNewPayValue] = useState("");
  const [editingPayId, setEditingPayId] = useState<string | null>(null);
  const [editingPayName, setEditingPayName] = useState("");
  const [editingPayValue, setEditingPayValue] = useState("");
  const [selectedPartnerPayment, setSelectedPartnerPayment] = useState<any>(null);
  const [isPayDetailOpen, setIsPayDetailOpen] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  // ── Stripe config state ──
  const [stripeConfig, setStripeConfig] = useState(DEFAULT_STRIPE);
  const [stripeSaving, setStripeSaving] = useState(false);
  const [stripeLoadError, setStripeLoadError] = useState("");

  const paymentMethodsList = state.paymentMethods || [];

  // Load existing Stripe config from Firestore
  useEffect(() => {
    if (!isAdmin) return;
    firestore
      .getDoc(firestore.doc(db, "tenants", "global"))
      .then((snap) => {
        if (snap.exists()) {
          const raw = snap.data()?.paymentMethods?.stripe;
          if (raw && typeof raw === "object") {
            setStripeConfig({
              enabled: raw.enabled ?? false,
              publishableKey: raw.publishableKey ?? "",
              secretKey: raw.secretKey ?? "",
              paymentLink: raw.paymentLink ?? "",
              paymentLinkAnnual: raw.paymentLinkAnnual ?? "",
            });
          }
        }
      })
      .catch(() =>
        setStripeLoadError(
          t("فشل تحميل إعدادات Stripe", "Failed to load Stripe settings")
        )
      );
  }, [isAdmin]);

  const handleStripeFieldChange = (
    field: keyof typeof DEFAULT_STRIPE,
    value: string | boolean
  ) => {
    setStripeConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveStripe = async () => {
    setStripeSaving(true);
    try {
      await firestore.setDoc(
        firestore.doc(db, "tenants", "global"),
        {
          paymentMethods: {
            stripe: {
              enabled: stripeConfig.enabled ?? false,
              publishableKey: (stripeConfig.publishableKey || "").trim(),
              secretKey: (stripeConfig.secretKey || "").trim(),
              paymentLink: (stripeConfig.paymentLink || "").trim(),
              paymentLinkAnnual: (stripeConfig.paymentLinkAnnual || "").trim(),
            },
          },
        },
        { merge: true }
      );
      toast.success(
        t("تم حفظ إعدادات Stripe بنجاح ✅", "Stripe settings saved successfully ✅")
      );
    } catch (err) {
      console.error("Failed to save Stripe config:", err);
      toast.error(t("فشل حفظ إعدادات Stripe", "Failed to save Stripe settings"));
    } finally {
      setStripeSaving(false);
    }
  };

  const handleResetStripe = () => {
    setStripeConfig(DEFAULT_STRIPE);
  };

  // Compute connection status
  const stripeStatus = !stripeConfig.secretKey
    ? "disconnected"
    : stripeConfig.secretKey.startsWith("sk_live")
      ? "live"
      : "test";

  const getProfessionalPaymentIcon = (name: string) => {
    const lowercaseName = (name || "").toLowerCase();
    
    if (lowercaseName.includes("vodafone") || lowercaseName.includes("فودافون")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold shrink-0">
          VF
        </div>
      );
    }
    
    if (lowercaseName.includes("binance") || lowercaseName.includes("usdt") || lowercaseName.includes("crypto")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold shrink-0">
          ₿
        </div>
      );
    }
    
    if (lowercaseName.includes("paypal") || lowercaseName.includes("باي بال")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
      );
    }
    
    if (lowercaseName.includes("instapay") || lowercaseName.includes("انستاباي") || lowercaseName.includes("bank") || lowercaseName.includes("بنك")) {
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-650 dark:text-purple-400 font-bold shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450 font-bold shrink-0">
        <Wallet className="w-4 h-4" />
      </div>
    );
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayName.trim() || !newPayValue.trim()) {
      toast.error(t("يرجى إدخال الاسم والتفاصيل", "Please enter both name and transfer details"));
      return;
    }

    setGlobalLoading(true);
    try {
      await updateState((draft) => {
        if (!draft.paymentMethods) {
          draft.paymentMethods = [];
        }
        draft.paymentMethods.push({
          id: "pay-" + Date.now(),
          name: newPayName.trim(),
          value: newPayValue.trim(),
        });
      });
      setNewPayName("");
      setNewPayValue("");
      toast.success(t("تم إضافة طريقة الدفع بنجاح", "Payment method added successfully"));
    } catch (err) {
      console.error("Failed to add payment method:", err);
      toast.error(t("فشل الإضافة", "Failed to add payment method"));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    setGlobalLoading(true);
    try {
      await updateState((draft) => {
        draft.paymentMethods = (draft.paymentMethods || []).filter((p) => p.id !== id);
      });
      toast.success(t("تم حذف طريقة الدفع", "Payment method deleted successfully"));
    } catch (err) {
      console.error("Failed to delete payment method:", err);
      toast.error(t("فشل الحذف", "Failed to delete payment method"));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleSaveEditPayment = async (id: string) => {
    if (!editingPayName.trim() || !editingPayValue.trim()) {
      toast.error(t("يرجى إدخال الاسم والتفاصيل", "Please enter both name and transfer details"));
      return;
    }
    setGlobalLoading(true);
    try {
      await updateState((draft) => {
        const item = (draft.paymentMethods || []).find((p) => p.id === id);
        if (item) {
          item.name = editingPayName.trim();
          item.value = editingPayValue.trim();
        }
      });
      setEditingPayId(null);
      toast.success(t("تم تعديل طريقة الدفع بنجاح", "Payment method updated successfully"));
    } catch (err) {
      console.error("Failed to update payment method:", err);
      toast.error(t("فشل التعديل", "Failed to update payment method"));
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12 font-sans"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-6"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span>{t("طرق الدفع", "Payment Methods")}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("إدارة وعرض طرق الدفع المتاحة", "Manage and view available payment methods")}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 backdrop-blur-md shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pb-4 mb-4">
          <CreditCard className="h-4.5 w-4.5 text-purple-500" />
          <span>{t("طرق الدفع المفعلة", "Configured Payment Methods")}</span>
        </h3>

        {isAdmin ? (
          <div className="space-y-6">
            <form onSubmit={handleAddPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {t("اسم طريقة الدفع (مثال: Vodafone Cash)", "Method Name (e.g. Vodafone Cash)")}
                </label>
                <input
                  type="text"
                  value={newPayName}
                  onChange={(e) => setNewPayName(e.target.value)}
                  placeholder={t("فودافون كاش", "Vodafone Cash")}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {t("رقم التحويل أو التفاصيل", "Transfer Value / Details")}
                </label>
                <input
                  type="text"
                  value={newPayValue}
                  onChange={(e) => setNewPayValue(e.target.value)}
                  placeholder="+201012345678"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/10 transition"
              >
                <Plus className="h-4 w-4" />
                <span>{t("إضافة", "Add Method")}</span>
              </button>
            </form>

            <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full border-collapse text-right" style={{ textAlign: isRtl ? "right" : "left" }}>
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3">{t("اسم الطريقة", "Method Name")}</th>
                    <th className="px-4 py-3">{t("بيانات التحويل", "Details / Value")}</th>
                    <th className="px-4 py-3 text-center">{t("إجراءات", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paymentMethodsList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-xs text-slate-400">
                        {t("لا توجد طرق دفع مسجلة حاليًا", "No payment methods configured.")}
                      </td>
                    </tr>
                  ) : (
                    paymentMethodsList.map((p: any) => {
                      const isEditing = editingPayId === p.id;
                      return (
                        <tr key={p.id} className="text-sm text-slate-755 dark:text-slate-350">
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingPayName}
                                onChange={(e) => setEditingPayName(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-white"
                              />
                            ) : (
                              <span className="font-bold">{p.name}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingPayValue}
                                onChange={(e) => setEditingPayValue(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-800 dark:text-white"
                              />
                            ) : (
                              <span className="font-mono text-xs">{p.value}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <div className="flex justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditPayment(p.id)}
                                  className="p-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition dark:bg-green-950/20 dark:hover:bg-green-950/40"
                                  title={t("حفظ", "Save")}
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPayId(null)}
                                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-650 transition dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400"
                                  title={t("إلغاء", "Cancel")}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPayId(p.id);
                                    setEditingPayName(p.name);
                                    setEditingPayValue(p.value);
                                  }}
                                  className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition dark:bg-purple-950/20 dark:hover:bg-purple-950/40"
                                  title={t("تعديل", "Edit")}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePayment(p.id)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition dark:bg-red-950/20 dark:hover:bg-red-950/40"
                                  title={t("حذف", "Delete")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
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
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t(
                "تتم إدارة طرق الدفع وقبول التحويلات بواسطة الإدارة. يُرجى مراجعة القائمة المتاحة لتحديد طريقة الدفع الملائمة لعملائك أثناء إنشاء الصفقات:",
                "Payment methods are configured centrally by the administration. Review the active channels you can request customers to use when finalizing deals:"
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethodsList.map((p: any) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getProfessionalPaymentIcon(p.name)}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-550 dark:text-slate-400 font-mono truncate max-w-[150px] sm:max-w-[200px]" dir="ltr">
                        {p.value}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(p.value);
                        toast.success(t("تم نسخ البيانات!", "Details copied!"));
                      }}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-purple-650 dark:hover:text-purple-400 transition"
                      title={t("نسخ القيمة", "Copy Value")}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedPartnerPayment(p);
                        setIsPayDetailOpen(true);
                      }}
                      className="px-2.5 py-1.5 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 text-purple-650 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800 transition"
                    >
                      {t("عرض التفاصيل", "Details")}
                    </button>
                  </div>
                </div>
              ))}
              {paymentMethodsList.length === 0 && (
                <div className="col-span-full p-6 text-center text-xs text-slate-400">
                  {t("لا توجد طرق دفع مفعلة حاليًا", "No active payment methods found.")}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Stripe Configuration Card (Admin only) ── */}
      {isAdmin && (
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 backdrop-blur-md shadow-sm"
        >
          {/* Card Header */}
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800/80">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              {t("إعدادات Stripe للدفع الإلكتروني", "Stripe Payment Configuration")}
            </span>
          </div>

          {stripeLoadError && (
            <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
              ⚠️ {stripeLoadError}
            </div>
          )}

          {/* Connection Status Banner */}
          <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      background:
                        stripeStatus === "live"
                          ? "#00d98b"
                          : stripeStatus === "test"
                            ? "#f59e0b"
                            : "#94a3b8",
                      boxShadow:
                        stripeStatus === "live"
                          ? "0 0 8px #00d98b"
                          : stripeStatus === "test"
                            ? "0 0 8px #f59e0b"
                            : "none",
                    }}
                  />
                  <span
                    style={{
                      color:
                        stripeStatus === "live"
                          ? "#00d98b"
                          : stripeStatus === "test"
                            ? "#f59e0b"
                            : undefined,
                    }}
                  >
                    {stripeStatus === "live"
                      ? t(
                          "متصل بـ Stripe (الإنتاج الحقيقي)",
                          "Connected to Live Stripe"
                        )
                      : stripeStatus === "test"
                        ? t(
                            "متصل بـ Stripe (وضع الاختبار)",
                            "Connected to Stripe (Test Mode)"
                          )
                        : t("Stripe غير متصل", "Stripe Not Connected")}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {stripeStatus === "live"
                    ? t(
                        "مفاتيح Stripe الحقيقية نشطة ومحفوظة.",
                        "Your live Stripe keys are active and saved."
                      )
                    : stripeStatus === "test"
                      ? t(
                          "مفاتيح Stripe التجريبية نشطة للاختبار.",
                          "Your test Stripe keys are active for testing."
                        )
                      : t(
                          "أدخل مفاتيح Stripe لتفعيل الدفع الإلكتروني.",
                          "Enter your Stripe API keys to accept payments."
                        )}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  window.open("https://dashboard.stripe.com/apikeys", "_blank")
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 transition shadow-sm"
              >
                🔑 {t("جلب المفاتيح من Stripe", "Get Stripe Keys")}
              </button>
            </div>
          </div>

          {/* Enable / Disable Toggle */}
          <div className="flex items-center justify-between mb-5 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">
                {t("تفعيل Stripe", "Enable Stripe Payments")}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  "عند التفعيل، سيتمكن المستخدمون من الدفع ببطاقة الائتمان عبر Stripe",
                  "When enabled, users can pay via Stripe credit card checkout"
                )}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={stripeConfig.enabled}
              onClick={() =>
                handleStripeFieldChange("enabled", !stripeConfig.enabled)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                stripeConfig.enabled
                  ? "bg-blue-600"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  stripeConfig.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Key Inputs (only shown when enabled) */}
          {stripeConfig.enabled && (
            <div className="space-y-4 mb-5">
              {/* Secret Key */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <Key className="h-3 w-3" />
                  {t(
                    "مفتاح السر (Stripe Secret Key)",
                    "Stripe Secret Key"
                  )}
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
                    style={{ [isRtl ? "right" : "left"]: "12px" }}
                  />
                  <input
                    type="text"
                    value={stripeConfig.secretKey}
                    onChange={(e) =>
                      handleStripeFieldChange("secretKey", e.target.value)
                    }
                    placeholder="sk_test_..."
                    dir="ltr"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                    style={{ paddingLeft: "36px", paddingRight: "14px" }}
                  />
                </div>
              </div>

              {/* Publishable Key */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <Key className="h-3 w-3" />
                  {t(
                    "مفتاح النشر (Stripe Publishable Key)",
                    "Stripe Publishable Key"
                  )}
                </label>
                <div className="relative">
                  <Key
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
                    style={{ [isRtl ? "right" : "left"]: "12px" }}
                  />
                  <input
                    type="text"
                    value={stripeConfig.publishableKey}
                    onChange={(e) =>
                      handleStripeFieldChange("publishableKey", e.target.value)
                    }
                    placeholder="pk_test_..."
                    dir="ltr"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                    style={{ paddingLeft: "36px", paddingRight: "14px" }}
                  />
                </div>
              </div>

              {/* Monthly Payment Link */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <span className="text-blue-500">🔗</span>
                  {t(
                    "رابط الدفع الشهري (Stripe Monthly Payment Link)",
                    "Stripe Monthly Payment Link"
                  )}
                </label>
                <input
                  type="text"
                  value={stripeConfig.paymentLink}
                  onChange={(e) =>
                    handleStripeFieldChange("paymentLink", e.target.value)
                  }
                  placeholder="https://buy.stripe.com/..."
                  dir="ltr"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* Annual Payment Link */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <span className="text-blue-500">🔗</span>
                  {t(
                    "رابط الدفع السنوي (Stripe Annual Payment Link)",
                    "Stripe Annual Payment Link"
                  )}
                </label>
                <input
                  type="text"
                  value={stripeConfig.paymentLinkAnnual}
                  onChange={(e) =>
                    handleStripeFieldChange("paymentLinkAnnual", e.target.value)
                  }
                  placeholder="https://buy.stripe.com/..."
                  dir="ltr"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveStripe}
              disabled={stripeSaving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition"
            >
              {stripeSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {stripeSaving
                ? t("جاري الحفظ...", "Saving...")
                : t("حفظ إعدادات Stripe", "Save Stripe Settings")}
            </button>
            <button
              type="button"
              onClick={handleResetStripe}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-xl transition"
              title={t("إعادة تعيين", "Reset")}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isPayDetailOpen && selectedPartnerPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsPayDetailOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getProfessionalPaymentIcon(selectedPartnerPayment.name)}
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                        {selectedPartnerPayment.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {t("بيانات التحويل", "Transfer Details")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPayDetailOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4">
                  <p className="font-mono text-sm text-slate-800 dark:text-white text-center tracking-wider break-all" dir="ltr">
                    {selectedPartnerPayment.value}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPartnerPayment.value);
                    toast.success(t("تم نسخ البيانات!", "Details copied!"));
                    setIsPayDetailOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-purple-500/20"
                >
                  <Copy className="w-4 h-4" />
                  <span>{t("نسخ القيمة", "Copy Value")}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

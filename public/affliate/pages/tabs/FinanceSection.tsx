import React, { useState, useRef, useEffect } from "react";
import { useAppState } from "../../context/StateContext";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "../../components/DatePicker";
import { db, firestore } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  DollarSign,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Wallet,
  TrendingUp,
  ArrowRight,
  X,
  Save,
  CreditCard,
  Receipt,
  Send,
  ChevronDown,
  Info,
  Search,
  Filter,
  ChevronUp,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 12 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 14 },
  },
} as const;

// Animated Number component
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

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}) => {
  const isRtl = document.documentElement.dir === "rtl";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 z-10 font-sans text-center"
          >
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center mb-4">
              <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{description}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {t("لا يمكن التراجع عن هذا الإجراء", "This action cannot be undone")}
            </p>
            <div className="flex gap-3 mt-6 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
              >
                {t("إلغاء", "Cancel")}
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition"
              >
                {t("حذف", "Delete")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Custom Select Component - FIXED z-index
interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const isRtl = document.documentElement.dir === "rtl";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} className={`relative ${className}`} style={{ zIndex: isOpen ? 50 : 1 }}>
      {label && (
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          {selectedOption?.label || "اختر"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div
            className="absolute z-[100000] mt-1 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1"
            style={{ maxHeight: "200px", overflowY: "auto", minWidth: "180px" }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-right hover:bg-slate-50 dark:hover:bg-slate-900 transition ${
                  opt.value === value
                    ? "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-bold"
                    : "text-slate-700 dark:text-slate-300"
                }`}
                style={{ textAlign: isRtl ? "right" : "left" }}
              >
                {opt.icon && <span>{opt.icon}</span>}
                {opt.label}
                {opt.value === value && <CheckCircle className="h-4 w-4 text-purple-500 ml-auto" />}
              </button>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main FinanceSection
export default function FinanceSection() {
  const { state, updateState, fmtMoney } = useAppState();
  const { user } = useAuth();

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // --- Finance Calculations ---
  const transactions = state.transactions || [];
  const pending = transactions
    .filter((t) => t.status === "Pending")
    .reduce((sum, t) => sum + t.amount, 0);
  const approved = transactions
    .filter((t) => t.status === "Approved")
    .reduce((sum, t) => sum + t.amount, 0);
  const paid = transactions
    .filter((t) => t.status === "Paid")
    .reduce((sum, t) => sum + t.amount, 0);
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = transactions
    .filter((t) => t.type === "Commission")
    .reduce((sum, t) => sum + t.amount, 0);

  // --- Filter and Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Modal and Delete State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: "Commission",
    amount: 0,
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
    partner: "",
    originalAmount: 0,
    originalCurrency: "USD",
    paymentMethod: "",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // --- Export State ---
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Transaction helpers ---
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Commission":
        return <DollarSign className="h-4 w-4" />;
      case "Bonus":
        return <Receipt className="h-4 w-4" />;
      case "Withdrawal":
        return <Send className="h-4 w-4" />;
      case "Refund":
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Commission":
        return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
      case "Bonus":
        return "text-purple-500 bg-purple-50 dark:bg-purple-950/20";
      case "Withdrawal":
        return "text-orange-500 bg-orange-50 dark:bg-orange-950/20";
      case "Refund":
        return "text-red-500 bg-red-50 dark:bg-red-950/20";
      default:
        return "text-slate-500 bg-slate-50 dark:bg-slate-800/50";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-3 w-3" />
            {t("مدفوع", "Paid")}
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Clock className="h-3 w-3" />
            {t("معتمد", "Approved")}
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-3 w-3" />
            {t("معلق", "Pending")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            <X className="h-3 w-3" />
            {t("ملغي", "Cancelled")}
          </span>
        );
    }
  };

  // --- Open/Close handlers ---
  const openAddModal = () => {
    setEditingTransaction(null);
    setFormData({
      type: "Commission",
      amount: 0,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      partner: "",
      originalAmount: 0,
      originalCurrency: "USD",
      paymentMethod: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tx: any) => {
    setEditingTransaction(tx);
    setFormData({
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      date: tx.date,
      partner: tx.partner || "",
      originalAmount: tx.originalAmount || tx.amount,
      originalCurrency: tx.originalCurrency || "USD",
      paymentMethod: tx.paymentMethod || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async () => {
    if (formData.amount <= 0) {
      toast.error(t("يجب أن يكون المبلغ أكبر من الصفر", "Amount must be greater than zero"));
      return;
    }

    const txId = editingTransaction ? editingTransaction.id : Date.now();
    const userId = user?.uid || "unknown-user";
    const txDocRef = firestore.doc(db, "transactions", `trans-${txId}-${userId}`);
    const userDocRef = firestore.doc(db, "users", userId);

    const newTx = {
      id: txId,
      userId: userId,
      type: formData.type as any,
      amount: Number(formData.amount),
      status: formData.status as any,
      date: formData.date,
      partner: formData.partner.trim() || "",
      originalAmount: Number(formData.originalAmount) || Number(formData.amount),
      originalCurrency: formData.originalCurrency,
      paymentMethod: formData.paymentMethod || "",
    };

    try {
      await firestore.runTransaction(db, async (transaction: any) => {
        const txDoc = await transaction.get(txDocRef);
        const userDoc = await transaction.get(userDocRef);

        let oldTx: any = null;
        if (txDoc.exists()) {
          oldTx = txDoc.data();
        }

        const getTxEffect = (type: string, amount: number, status: string) => {
          const effect = {
            pending: 0,
            approved: 0,
            paid: 0,
            revenue: 0,
          };
          if (type === "Commission" || type === "Bonus") {
            if (status === "Pending") effect.pending = amount;
            else if (status === "Approved") {
              effect.approved = amount;
              effect.revenue = amount;
            } else if (status === "Paid") {
              effect.paid = amount;
              effect.revenue = amount;
            }
          } else if (type === "Withdrawal" || type === "Refund") {
            const multiplier = -1;
            if (status === "Pending") effect.pending = amount * multiplier;
            else if (status === "Approved") {
              effect.approved = amount * multiplier;
              effect.revenue = amount * multiplier;
            } else if (status === "Paid") {
              effect.paid = amount * multiplier;
              effect.revenue = amount * multiplier;
            }
          }
          return effect;
        };

        const newEffect = getTxEffect(newTx.type, newTx.amount, newTx.status);
        const oldEffect = oldTx
          ? getTxEffect(oldTx.type, oldTx.amount, oldTx.status)
          : { pending: 0, approved: 0, paid: 0, revenue: 0 };

        const deltaPending = newEffect.pending - oldEffect.pending;
        const deltaApproved = newEffect.approved - oldEffect.approved;
        const deltaPaid = newEffect.paid - oldEffect.paid;
        const deltaRevenue = newEffect.revenue - oldEffect.revenue;

        // Save transaction doc
        transaction.set(txDocRef, newTx, { merge: true });

        // Update user balances
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentPending = Number(userData.pendingBalance) || 0;
          const currentApproved = Number(userData.approvedBalance) || 0;
          const currentPaid = Number(userData.paidBalance) || 0;
          const currentRevenue = Number(userData.revenue) || 0;

          transaction.update(userDocRef, {
            pendingBalance: currentPending + deltaPending,
            approvedBalance: currentApproved + deltaApproved,
            paidBalance: currentPaid + deltaPaid,
            revenue: currentRevenue + deltaRevenue,
          });
        }
      });

      // Update local state fallback to keep UI snappy
      updateState((draft) => {
        if (editingTransaction) {
          const index = draft.transactions.findIndex((t) => t.id === editingTransaction.id);
          if (index !== -1) {
            draft.transactions[index] = newTx;
          }
        } else {
          draft.transactions.unshift(newTx);
        }
      });

      toast.success(
        editingTransaction
          ? t("تم تحديث المعاملة بنجاح", "Transaction updated successfully")
          : t("تم إضافة المعاملة بنجاح", "Transaction added successfully"),
      );

      setIsModalOpen(false);
      setEditingTransaction(null);

      // Add notification for the partner user
      if (userId && userId !== "unknown-user") {
        try {
          const typeLabel = formData.type === "Commission" ? (isRtl ? "عمولة" : "Commission") : (formData.type === "Bonus" ? (isRtl ? "مكافأة" : "Bonus") : (isRtl ? "عملية مالية" : "Transaction"));
          const statusLabel = formData.status === "Paid" ? (isRtl ? "مدفوعة" : "Paid") : (formData.status === "Approved" ? (isRtl ? "معتمدة" : "Approved") : (isRtl ? "معلقة" : "Pending"));
          
          await firestore.addDoc(firestore.collection(db, "notifications"), {
            userId: userId,
            title: isRtl ? `تحديث مالي: ${typeLabel}` : `Financial Update: ${typeLabel}`,
            desc: isRtl 
              ? `تم تحديث حالة الـ ${typeLabel} بمبلغ ${formData.amount} إلى ${statusLabel}.`
              : `Your ${typeLabel} of ${formData.amount} has been updated to ${statusLabel}.`,
            icon: "DollarSign",
            read: false,
            isRead: false,
            createdAt: Date.now(),
            time: isRtl ? "الآن" : "Just now"
          });
        } catch (notifErr) {
          console.error("Failed to write transaction notification:", notifErr);
        }
      }
    } catch (error) {
      console.error("Error saving transaction via transaction wrapper:", error);
      toast.error(t("حدث خطأ أثناء حفظ المعاملة", "Error saving transaction"));
    }
  };

  const requestDelete = (id: number) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    const userId = user?.uid || "unknown-user";
    const txDocRef = firestore.doc(db, "transactions", `trans-${deleteTargetId}-${userId}`);
    const userDocRef = firestore.doc(db, "users", userId);

    try {
      await firestore.runTransaction(db, async (transaction: any) => {
        const txDoc = await transaction.get(txDocRef);
        const userDoc = await transaction.get(userDocRef);

        if (!txDoc.exists()) {
          throw new Error("Transaction document not found.");
        }

        const oldTx = txDoc.data();

        const getTxEffect = (type: string, amount: number, status: string) => {
          const effect = {
            pending: 0,
            approved: 0,
            paid: 0,
            revenue: 0,
          };
          if (type === "Commission" || type === "Bonus") {
            if (status === "Pending") effect.pending = amount;
            else if (status === "Approved") {
              effect.approved = amount;
              effect.revenue = amount;
            } else if (status === "Paid") {
              effect.paid = amount;
              effect.revenue = amount;
            }
          } else if (type === "Withdrawal" || type === "Refund") {
            const multiplier = -1;
            if (status === "Pending") effect.pending = amount * multiplier;
            else if (status === "Approved") {
              effect.approved = amount * multiplier;
              effect.revenue = amount * multiplier;
            } else if (status === "Paid") {
              effect.paid = amount * multiplier;
              effect.revenue = amount * multiplier;
            }
          }
          return effect;
        };

        const oldEffect = getTxEffect(oldTx.type, oldTx.amount, oldTx.status);

        // Delete transaction doc
        transaction.delete(txDocRef);

        // Subtract from user balances
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentPending = Number(userData.pendingBalance) || 0;
          const currentApproved = Number(userData.approvedBalance) || 0;
          const currentPaid = Number(userData.paidBalance) || 0;
          const currentRevenue = Number(userData.revenue) || 0;

          transaction.update(userDocRef, {
            pendingBalance: currentPending - oldEffect.pending,
            approvedBalance: currentApproved - oldEffect.approved,
            paidBalance: currentPaid - oldEffect.paid,
            revenue: currentRevenue - oldEffect.revenue,
          });
        }
      });

      // Update local state fallback to keep UI snappy
      updateState((draft) => {
        draft.transactions = draft.transactions.filter((t) => t.id !== deleteTargetId);
      });

      toast.success(t("تم حذف المعاملة بنجاح", "Transaction deleted successfully"));
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error("Error deleting transaction via transaction wrapper:", error);
      toast.error(t("حدث خطأ أثناء حذف المعاملة", "Error deleting transaction"));
    }
  };

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterStatus]);

  // --- Options ---
  const typeOptions = [
    { value: "all", label: t("الكل", "All Types") },
    {
      value: "commission",
      label: t("عمولة", "Commission"),
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      value: "bonus",
      label: t("مكافأة", "Bonus"),
      icon: <Receipt className="h-4 w-4" />,
    },
    {
      value: "withdrawal",
      label: t("سحب", "Withdrawal"),
      icon: <Send className="h-4 w-4" />,
    },
    {
      value: "refund",
      label: t("استرجاع", "Refund"),
      icon: <ArrowRight className="h-4 w-4" />,
    },
  ];

  const statusOptions = [
    { value: "all", label: t("الكل", "All Status") },
    {
      value: "pending",
      label: t("معلق", "Pending"),
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      value: "approved",
      label: t("معتمد", "Approved"),
      icon: <Clock className="h-4 w-4" />,
    },
    {
      value: "paid",
      label: t("مدفوع", "Paid"),
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  const currencyOptions = [
    { value: "USD", label: "USD ($)" },
    { value: "AED", label: "AED (د.إ)" },
    { value: "SAR", label: "SAR (ر.س)" },
    { value: "EGP", label: "EGP (ج.م)" },
    { value: "KWD", label: "KWD (د.ك)" },
    { value: "QAR", label: "QAR (ر.ق)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
  ];

  const typeOptionsModal = [
    {
      value: "Commission",
      label: t("عمولة", "Commission"),
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      value: "Bonus",
      label: t("مكافأة", "Bonus"),
      icon: <Receipt className="h-4 w-4" />,
    },
    {
      value: "Withdrawal",
      label: t("سحب", "Withdrawal"),
      icon: <Send className="h-4 w-4" />,
    },
    {
      value: "Refund",
      label: t("استرجاع", "Refund"),
      icon: <ArrowRight className="h-4 w-4" />,
    },
  ];

  const statusOptionsModal = [
    {
      value: "Pending",
      label: t("معلق", "Pending"),
      icon: <AlertCircle className="h-4 w-4" />,
    },
    {
      value: "Approved",
      label: t("معتمد", "Approved"),
      icon: <Clock className="h-4 w-4" />,
    },
    {
      value: "Paid",
      label: t("مدفوع", "Paid"),
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ];

  const paymentMethodOptions = [
    { value: "", label: t("بدون وسيلة دفع", "No Payment Method") },
    ...(state.paymentMethods || []).map((pm) => ({
      value: pm.name,
      label: `${pm.name} (${pm.value})`,
    })),
  ];

  // --- Filtered transactions - FIXED ---
  const filteredTransactions = transactions.filter((tx) => {
    const searchLower = searchQuery.toLowerCase().trim();

    // Type matching (case-insensitive) - using lowercase values
    const txType = (tx.type || "").toLowerCase();
    const filterTypeLower = filterType.toLowerCase();
    const matchesType = filterTypeLower === "all" || txType === filterTypeLower;

    // Status matching (case-insensitive) - using lowercase values
    const txStatus = (tx.status || "").toLowerCase();
    const filterStatusLower = filterStatus.toLowerCase();
    const matchesStatus = filterStatusLower === "all" || txStatus === filterStatusLower;

    // If there's no search query, just return type and status match
    if (!searchLower) {
      return matchesType && matchesStatus;
    }

    // Build searchable fields
    const txTypeOriginal = (tx.type || "").toLowerCase();
    const txStatusOriginal = (tx.status || "").toLowerCase();

    // Map Arabic terms to type
    let typeAr = "";
    if (txTypeOriginal === "commission") typeAr = "عمولة";
    else if (txTypeOriginal === "bonus") typeAr = "مكافأة";
    else if (txTypeOriginal === "withdrawal") typeAr = "سحب";
    else if (txTypeOriginal === "refund") typeAr = "استرجاع";

    // Map Arabic terms to status
    let statusAr = "";
    if (txStatusOriginal === "pending") statusAr = "معلق";
    else if (txStatusOriginal === "approved") statusAr = "معتمد";
    else if (txStatusOriginal === "paid") statusAr = "مدفوع";

    const partnerName = (tx.partner || state.settings.profileName || "").toLowerCase();
    const paymentMethod = (tx.paymentMethod || "").toLowerCase();
    const dateStr = tx.date || "";
    const idStr = String(tx.id || "");
    const amountStr = String(tx.amount || "");

    // Check if any field matches the search
    const matchesSearch =
      partnerName.includes(searchLower) ||
      dateStr.includes(searchLower) ||
      txTypeOriginal.includes(searchLower) ||
      typeAr.includes(searchLower) ||
      txStatusOriginal.includes(searchLower) ||
      statusAr.includes(searchLower) ||
      idStr.includes(searchLower) ||
      paymentMethod.includes(searchLower) ||
      amountStr.includes(searchLower);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort by transaction ID descending (last created appears first)
  const sortedFiltered = [...filteredTransactions].sort((a, b) => Number(b.id) - Number(a.id));

  const itemsPerPage = 8;
  const totalItems = sortedFiltered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedTransactions = sortedFiltered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // --- Export Functions ---
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

  const generateCSV = () => {
    const rows = [
      [
        t("المعرف", "ID"),
        t("النوع", "Type"),
        t("المبلغ", "Amount"),
        t("العملة الأصلية", "Original Currency"),
        t("المبلغ الأصلي", "Original Amount"),
        t("المستفيد", "Beneficiary"),
        t("التاريخ", "Date"),
        t("الحالة", "Status"),
      ],
      ...sortedFiltered.map((tx) => [
        `#${tx.id}`,
        tx.type,
        fmtMoney(tx.amount),
        tx.originalCurrency || "USD",
        tx.originalAmount || tx.amount,
        tx.partner || state.settings.profileName,
        tx.date,
        tx.status,
      ]),
    ];
    return rows.map((row) => row.join(",")).join("\n");
  };

  const generateJSON = () => {
    return {
      exportedAt: new Date().toISOString(),
      language: state.settings.language,
      currency: state.settings.currency,
      summary: {
        totalTransactions: transactions.length,
        filteredTransactions: filteredTransactions.length,
        pending: pending,
        approved: approved,
        paid: paid,
        total: total,
      },
      transactions: sortedFiltered.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        originalAmount: tx.originalAmount || tx.amount,
        originalCurrency: tx.originalCurrency || "USD",
        amountUSD: tx.amount,
        beneficiary: tx.partner || state.settings.profileName,
        date: tx.date,
        status: tx.status,
      })),
    };
  };

  const generateTXT = () => {
    const lines = [];
    const timestamp = new Date().toLocaleString(isRtl ? "ar-EG" : "en-US");
    lines.push("=".repeat(70));
    lines.push(
      t("تقرير المعاملات المالية - Joe Partner", "Financial Transactions Report - Joe Partner"),
    );
    lines.push(`📅 ${t("التاريخ", "Date")}: ${timestamp}`);
    lines.push("=".repeat(70));
    lines.push("");
    lines.push(t("📊 ملخص المعاملات", "📊 Transactions Summary"));
    lines.push("-".repeat(50));
    lines.push(`${t("إجمالي المعاملات", "Total Transactions")}: ${transactions.length}`);
    lines.push(
      `${t("المعاملات المطابقة للفلتر", "Filtered Transactions")}: ${filteredTransactions.length}`,
    );
    lines.push(`${t("معلق", "Pending")}: ${fmtMoney(pending)}`);
    lines.push(`${t("معتمد", "Approved")}: ${fmtMoney(approved)}`);
    lines.push(`${t("مدفوع", "Paid")}: ${fmtMoney(paid)}`);
    lines.push(`${t("الرصيد الكلي", "Total Balance")}: ${fmtMoney(total)}`);
    lines.push("");
    lines.push(t("📋 قائمة المعاملات", "📋 Transactions List"));
    lines.push("-".repeat(50));
    sortedFiltered.forEach((tx, i) => {
      lines.push(
        `  ${i + 1}. #${tx.id} | ${tx.type} | ${fmtMoney(tx.amount)} | ${tx.status} | ${tx.date}`,
      );
      if (tx.partner) lines.push(`     ${t("المستفيد", "Beneficiary")}: ${tx.partner}`);
    });
    lines.push("");
    lines.push("=".repeat(70));
    lines.push(t("تم التصدير بواسطة Joe Partner Dashboard", "Exported by Joe Partner Dashboard"));
    return lines.join("\n");
  };

  const exportCSV = () => {
    try {
      const csv = generateCSV();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(csv, `transactions-${timestamp}.csv`, "text/csv;charset=utf-8;");
      toast.success(
        t("تم تصدير المعاملات كـ CSV بنجاح", "Transactions exported as CSV successfully"),
      );
      setIsExportDropdownOpen(false);
    } catch (error) {
      toast.error(t("حدث خطأ أثناء التصدير", "Error exporting"));
      console.error(error);
    }
  };

  const exportJSON = () => {
    try {
      const json = generateJSON();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(
        JSON.stringify(json, null, 2),
        `transactions-${timestamp}.json`,
        "application/json;charset=utf-8;",
      );
      toast.success(
        t("تم تصدير المعاملات كـ JSON بنجاح", "Transactions exported as JSON successfully"),
      );
      setIsExportDropdownOpen(false);
    } catch (error) {
      toast.error(t("حدث خطأ أثناء التصدير", "Error exporting"));
      console.error(error);
    }
  };

  const exportTXT = () => {
    try {
      const txt = generateTXT();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(txt, `transactions-${timestamp}.txt`, "text/plain;charset=utf-8;");
      toast.success(
        t("تم تصدير المعاملات كـ TXT بنجاح", "Transactions exported as TXT successfully"),
      );
      setIsExportDropdownOpen(false);
    } catch (error) {
      toast.error(t("حدث خطأ أثناء التصدير", "Error exporting"));
      console.error(error);
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
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-6"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-purple-500" />
            <span>{t("المالية والمحفظة", "Finance & Wallet")}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(
              "إدارة أرباحك، عمولاتك، وسجل المعاملات المالية",
              "Manage your earnings, commissions, and financial transactions",
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Button */}
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition"
            >
              <Download className="h-4 w-4" />
              <span>{t("تصدير", "Export")}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExportDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {isExportDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 mt-1 min-w-[180px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>{t("معاملة جديدة", "New Transaction")}</span>
          </button>
        </div>
      </motion.div>

      {/* Wallet Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            label: t("معلق", "Pending"),
            value: pending,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-950/20",
            borderColor: "border-amber-200 dark:border-amber-800/50",
          },
          {
            label: t("معتمد", "Approved"),
            value: approved,
            icon: CheckCircle,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/20",
            borderColor: "border-blue-200 dark:border-blue-800/50",
          },
          {
            label: t("مدفوع", "Paid"),
            value: paid,
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-950/20",
            borderColor: "border-emerald-200 dark:border-emerald-800/50",
          },
          {
            label: t("إجمالي العمولات", "Total Commission"),
            value: totalCommission,
            icon: Wallet,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50/50 dark:bg-purple-950/10",
            borderColor: "border-purple-200 dark:border-purple-800/40",
          },
          {
            label: t("الرصيد الكلي", "Total Balance"),
            value: total,
            icon: TrendingUp,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-950/20",
            borderColor: "border-indigo-200 dark:border-indigo-800/50",
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            className={`bg-white dark:bg-slate-900/80 border ${stat.borderColor} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1.5 tracking-tight">
                  <AnimatedNumber value={stat.value} duration={1200} />
                </div>
              </div>
              <div
                className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Transaction Table with Search & Filter */}
      <motion.div
        variants={cardVariants}
        className="bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-850 rounded-2xl shadow-sm backdrop-blur-md relative"
        style={{ overflow: "visible" }}
      >
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Receipt className="h-4.5 w-4.5 text-purple-500" />
              {t("سجل المعاملات", "Transaction Log")}
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              ({filteredTransactions.length} / {transactions.length})
            </span>
          </div>
          <button
            onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <Filter className="h-4 w-4" />
            <span>
              {isFilterCollapsed
                ? t("إظهار الفلتر", "Show Filter")
                : t("إخفاء الفلتر", "Hide Filter")}
            </span>
            {isFilterCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Collapsible Filter Bar */}
        <AnimatePresence>
          {!isFilterCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/80 overflow-visible relative z-20"
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t(
                      "بحث بالمعرف، النوع، التاريخ، المستفيد",
                      "Search by ID, type, date, partner",
                    )}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Type Filter */}
                <CustomSelect
                  value={filterType}
                  onChange={(val) => setFilterType(val)}
                  options={typeOptions}
                  className="min-w-[140px]"
                />

                {/* Status Filter */}
                <CustomSelect
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                  options={statusOptions}
                  className="min-w-[140px]"
                />

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setFilterStatus("all");
                  }}
                  className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg transition"
                >
                  {t("مسح الكل", "Clear All")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center whitespace-nowrap">{t("المعرف", "ID")}</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">{t("النوع", "Type")}</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">
                  {t("المبلغ", "Amount")}
                </th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">
                  {t("المستفيد", "Beneficiary")}
                </th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">
                  {t("التاريخ", "Date")}
                </th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">
                  {t("الحالة", "Status")}
                </th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">
                  {t("الإجراءات", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500"
                  >
                    {t("لا توجد معاملات تطابق الفلتر", "No transactions match the filter")}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <motion.tr
                    key={tx.docId || tx.id}
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-300 transition"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 text-center">
                      #{tx.id}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${getTypeColor(
                          tx.type,
                        )}`}
                      >
                        {getTypeIcon(tx.type)}
                        {tx.type === "Commission"
                          ? t("عمولة", "Commission")
                          : tx.type === "Bonus"
                            ? t("مكافأة", "Bonus")
                            : tx.type === "Withdrawal"
                              ? t("سحب", "Withdrawal")
                              : t("استرجاع", "Refund")}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-xs text-slate-800 dark:text-white text-center">
                      {fmtMoney(tx.amount)}
                      {tx.originalCurrency && tx.originalCurrency !== "USD" && (
                        <div className="text-[9px] text-slate-400 font-normal">
                          {tx.originalAmount} {tx.originalCurrency}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
                      {tx.partner || state.settings.profileName}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-400 text-center">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3.5 text-center">{getStatusBadge(tx.status)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition"
                          title={t("تعديل", "Edit")}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => requestDelete(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                          title={t("حذف", "Delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 rounded-b-2xl">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {t(
                `عرض ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalItems)} من أصل ${totalItems} معاملة`,
                `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} transactions`,
              )}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t("السابق", "Previous")}
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isSelected = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      isSelected
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                        : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t("التالي", "Next")}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 z-10 font-sans max-h-[90vh] overflow-visible"
              style={{ textAlign: isRtl ? "right" : "left" }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-purple-500" />
                  {editingTransaction
                    ? t("تعديل المعاملة", "Edit Transaction")
                    : t("إضافة معاملة جديدة", "Add New Transaction")}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4 relative z-30">
                  <CustomSelect
                    label={t("النوع", "Type")}
                    value={formData.type}
                    onChange={(val) => setFormData({ ...formData, type: val })}
                    options={typeOptionsModal}
                  />
                  <CustomSelect
                    label={t("الحالة", "Status")}
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    options={statusOptionsModal}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-20">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {t("المبلغ", "Amount")}
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: Number(e.target.value),
                          originalAmount: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                    />
                  </div>
                  <CustomSelect
                    label={t("العملة", "Currency")}
                    value={formData.originalCurrency}
                    onChange={(val) => setFormData({ ...formData, originalCurrency: val })}
                    options={currencyOptions}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <DatePicker
                      label={t("التاريخ", "Date")}
                      value={formData.date}
                      onChange={(val) => setFormData({ ...formData, date: val })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {t("المستفيد (اختياري)", "Beneficiary (Optional)")}
                    </label>
                    <input
                      type="text"
                      value={formData.partner}
                      onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                      placeholder={t("اسم العميل أو الشريك", "Client or partner name")}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="relative z-[5]">
                  <CustomSelect
                    label={t("وسيلة الدفع (اختياري)", "Payment Method (Optional)")}
                    value={formData.paymentMethod}
                    onChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                    options={paymentMethodOptions}
                  />
                </div>

                {/* Currency Info Box */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      {t(
                        "💡 لو العملة غير USD، المبلغ هيتحول تلقائي بسعر الصرف في نفس تاريخ العملية بالضبط.",
                        "💡 If the currency is not USD, the amount will be automatically converted at the exchange rate on the exact date of the transaction.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    onClick={handleSaveTransaction}
                    className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t("حفظ", "Save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t("تأكيد الحذف", "Confirm Delete")}
        description={t(
          "هل أنت متأكد من حذف هذه المعاملة نهائياً؟",
          "Are you sure you want to delete this transaction permanently?",
        )}
      />
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { db, firestore } from "../../config/firebase";
import { toast } from "sonner";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";

interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  planDuration: string;
  planName?: string;
  receiptUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  approvedAt?: any;
}

export default function AdminPaymentsSection() {
  const { state } = useAppState();
  const { userProfile } = useAuth();
  const isRtl = state?.settings?.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [paymentToApprove, setPaymentToApprove] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Create a query ordered by createdAt descending
      // Depending on indexes, we might just fetch all and sort client-side if no index exists
      const snap = await firestore.getDocs(
        firestore.query(firestore.collection(db, "payments"))
      );
      
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRequest));
      
      // Sort client-side by date descending
      data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || a.createdAt || 0;
        const timeB = b.createdAt?.seconds || b.createdAt || 0;
        return timeB - timeA;
      });
      
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      toast.error(t("حدث خطأ أثناء جلب الطلبات", "Error fetching payment requests"));
    } finally {
      setLoading(false);
    }
  };

  const sendEmailNotification = async (payment: PaymentRequest, isApproved: boolean, reason?: string) => {
    try {
      const subject = isApproved 
        ? (isRtl ? "تم تفعيل اشتراكك بنجاح! 🎉" : "Your subscription is now active! 🎉")
        : (isRtl ? "مرفوض: فشل تأكيد الدفع الخاص بك" : "Rejected: Your payment could not be verified");

      let body = isApproved
        ? (isRtl 
            ? `مرحباً ${payment.userName}،\n\nلقد تم مراجعة إيصال التحويل الخاص بك وتم تفعيل اشتراكك (${payment.planName || "Pro"}) بنجاح.\n\nشكراً لك!` 
            : `Hello ${payment.userName},\n\nYour payment receipt has been verified and your subscription (${payment.planName || "Pro"}) is now active.\n\nThank you!`)
        : (isRtl
            ? `مرحباً ${payment.userName}،\n\nنأسف لإبلاغك بأنه لم نتمكن من التحقق من إيصال التحويل الذي أرسلته.`
            : `Hello ${payment.userName},\n\nWe regret to inform you that we could not verify the payment receipt you submitted.`);

      if (!isApproved && reason) {
        body += isRtl ? `\n\nسبب الرفض: ${reason}` : `\n\nReason: ${reason}`;
      }
      
      if (!isApproved) {
        body += isRtl ? `\n\nيرجى مراجعة بيانات الدفع الخاصة بك أو التواصل مع الدعم الفني.\n\nشكراً لك.` : `\n\nPlease check your payment details or contact support.\n\nThank you.`;
      }

      await firestore.addDoc(firestore.collection(db, "mail"), {
        to: [payment.userEmail],
        message: {
          subject,
          text: body,
          html: `<div style="font-family: sans-serif; padding: 20px;">
                  <h2>${subject}</h2>
                  <p>${body.replace(/\n/g, "<br>")}</p>
                 </div>`
        }
      });
    } catch (err) {
      console.error("Failed to queue email notification:", err);
    }
  };

  const handleApproveClick = (payment: PaymentRequest) => {
    setPaymentToApprove(payment);
    setApproveModalOpen(true);
  };

  const confirmApproval = async () => {
    if (!paymentToApprove) return;

    setProcessingId(paymentToApprove.id);
    try {
      // 1. Update Payment Document
      await firestore.updateDoc(firestore.doc(db, "payments", paymentToApprove.id), {
        status: "approved",
        approvedAt: new Date()
      });

      // 2. Determine expiration date
      const now = new Date();
      let expirationDate = new Date();
      if (paymentToApprove.planDuration === "annual") {
        expirationDate.setFullYear(now.getFullYear() + 1);
      } else if (paymentToApprove.planDuration === "one-time" || paymentToApprove.planDuration === "lifetime") {
        expirationDate.setFullYear(now.getFullYear() + 100); // effectively lifetime
      } else {
        expirationDate.setDate(now.getDate() + 30); // monthly default
      }

      // 3. Update User Document
      await firestore.updateDoc(firestore.doc(db, "users", paymentToApprove.userId), {
        role: "pro",
        "subscription.status": "pro",
        "subscription.planId": paymentToApprove.planName || "pro",
        "subscription.currentPeriodEnd": expirationDate,
      });

      // 4. Send Email Notification
      await sendEmailNotification(paymentToApprove, true);

      toast.success(t("تم تفعيل الاشتراك بنجاح", "Payment approved and user upgraded"));
      
      // Update local state
      setPayments(prev => prev.map(p => p.id === paymentToApprove.id ? { ...p, status: "approved" } : p));
      setApproveModalOpen(false);
      setPaymentToApprove(null);
    } catch (err) {
      console.error("Approval failed:", err);
      toast.error(t("حدث خطأ أثناء التفعيل", "Failed to approve payment"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (payment: PaymentRequest) => {
    setPaymentToReject(payment);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const confirmRejection = async () => {
    if (!paymentToReject) return;
    if (!rejectionReason.trim()) {
      toast.error(t("الرجاء إدخال سبب الرفض", "Please enter a rejection reason"));
      return;
    }

    setProcessingId(paymentToReject.id);
    try {
      // 1. Update Payment Document
      await firestore.updateDoc(firestore.doc(db, "payments", paymentToReject.id), {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
        rejectedAt: new Date()
      });

      // 2. Send Email Notification
      await sendEmailNotification(paymentToReject, false, rejectionReason.trim());

      toast.success(t("تم رفض الطلب", "Payment request rejected"));
      
      // Update local state
      setPayments(prev => prev.map(p => p.id === paymentToReject.id ? { ...p, status: "rejected" } : p));
      setRejectModalOpen(false);
      setPaymentToReject(null);
    } catch (err) {
      console.error("Rejection failed:", err);
      toast.error(t("حدث خطأ أثناء الرفض", "Failed to reject payment"));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = payments
    .filter(p => statusFilter === "all" || p.status === statusFilter)
    .filter(p => {
      const q = searchQuery.toLowerCase();
      return (
        p.userName?.toLowerCase().includes(q) ||
        p.userEmail?.toLowerCase().includes(q) ||
        p.paymentMethod?.toLowerCase().includes(q)
      );
    });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("مقبول", "Approved")}
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5" />
            {t("مرفوض", "Rejected")}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            {t("قيد الانتظار", "Pending")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-[#12141c]/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("طلبات الدفع اليدوية", "Manual Payment Requests")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
            {t(
              "قم بمراجعة إيصالات الدفع اليدوية (مثل فودافون كاش وإنستاباي) وتفعيل اشتراكات المستخدمين.",
              "Review manual payment receipts (e.g. Vodafone Cash, InstaPay) and activate user subscriptions."
            )}
          </p>
        </div>

        {/* Stats Snippet */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-500">
              {payments.filter(p => p.status === "pending").length}
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {t("قيد الانتظار", "Pending")}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <div className="text-2xl font-black text-slate-700 dark:text-slate-300">
              {payments.filter(p => p.status === "approved").length}
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {t("مكتمل", "Completed")}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("ابحث بالاسم، الإيميل، أو طريقة الدفع...", "Search name, email, or method...")}
            className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
          {(["pending", "approved", "rejected", "all"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {status === "all" ? t("الكل", "All") : 
               status === "pending" ? t("قيد الانتظار", "Pending") : 
               status === "approved" ? t("مقبول", "Approved") : 
               t("مرفوض", "Rejected")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" dir={isRtl ? "rtl" : "ltr"}>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">{t("المستخدم", "User")}</th>
                <th className="px-6 py-4">{t("الباقة والمبلغ", "Plan & Amount")}</th>
                <th className="px-6 py-4">{t("طريقة الدفع", "Method")}</th>
                <th className="px-6 py-4">{t("التاريخ", "Date")}</th>
                <th className="px-6 py-4">{t("الإيصال", "Receipt")}</th>
                <th className="px-6 py-4">{t("الحالة", "Status")}</th>
                <th className="px-6 py-4 text-center">{t("إجراءات", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    {t("لا توجد طلبات تطابق بحثك", "No payment requests found.")}
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredPayments.map((payment) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {payment.userName}
                        </div>
                        <div className="text-xs text-slate-500">{payment.userEmail}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          ${payment.amount} <span className="text-[10px] text-slate-400 font-normal uppercase">({payment.currency})</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {payment.planName || "Pro"} — {payment.planDuration === "annual" ? t("سنوي", "Annual") : t("شهري", "Monthly")}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {payment.paymentMethod}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        {formatDate(payment.createdAt)}
                      </td>
                      
                      <td className="px-6 py-4">
                        {payment.receiptUrl ? (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {t("عرض", "View")}
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {payment.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveClick(payment)}
                                disabled={processingId === payment.id}
                                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                title={t("قبول وتفعيل", "Approve & Activate")}
                              >
                                {processingId === payment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleRejectClick(payment)}
                                disabled={processingId === payment.id}
                                className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                title={t("رفض", "Reject")}
                              >
                                {processingId === payment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectModalOpen && paymentToReject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !processingId && setRejectModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {t("رفض الطلب", "Reject Request")}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {paymentToReject.userName} - ${paymentToReject.amount}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t("سبب الرفض (إلزامي)", "Reason for rejection (Required)")}
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t("مثال: صورة الإيصال غير واضحة", "e.g., Receipt image is blurry")}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white resize-none h-28"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={processingId === paymentToReject.id}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  type="button"
                  onClick={confirmRejection}
                  disabled={processingId === paymentToReject.id || !rejectionReason.trim()}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingId === paymentToReject.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t("تأكيد الرفض", "Confirm Rejection")
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {approveModalOpen && paymentToApprove && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !processingId && setApproveModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {t("تفعيل الاشتراك", "Approve & Activate")}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {paymentToApprove.userName} - ${paymentToApprove.amount}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  {t(
                    "هل أنت متأكد من تفعيل الاشتراك لهذا المستخدم؟ سيتم ترقية الحساب فوراً وإرسال بريد إلكتروني للتأكيد.",
                    "Are you sure you want to approve this payment? The user's account will be upgraded immediately and a confirmation email will be sent."
                  )}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-500">{t("الباقة", "Plan")}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{paymentToApprove.planName || "Pro"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">{t("المدة", "Duration")}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{paymentToApprove.planDuration}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(false)}
                  disabled={processingId === paymentToApprove.id}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  type="button"
                  onClick={confirmApproval}
                  disabled={processingId === paymentToApprove.id}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingId === paymentToApprove.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t("تأكيد التفعيل", "Confirm Approval")
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

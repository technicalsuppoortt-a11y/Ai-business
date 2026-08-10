import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Loader2,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Upload,
  Copy,
  CheckCheck,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAppState } from "../../context/StateContext";
import { db, firestore } from "../../config/firebase";
import { toast } from "sonner";
import StripePaymentButton from "../../components/StripePaymentButton";

// Firebase Functions base URL
const FUNCTIONS_BASE_URL =
  "https://us-central1-partner-os-e1f2e.cloudfunctions.net";

export interface SubscriptionPlan {
  id: string;
  titleEn: string;
  titleAr: string;
  price: number;
  billingCycle: "monthly" | "yearly" | "lifetime";
  featuresEn: string[];
  featuresAr: string[];
  isActive: boolean;
  targetLevel?: string;
}

// ─── Payment method helpers ───────────────────────────────────────────────────

type MethodKey = "stripe" | string; // stripe = card; others = manual (from state.paymentMethods)

interface ManualMethod {
  id: string;   // matches state.paymentMethods[].id
  name: string;
  value: string; // account number / address / email
}

function getMethodIcon(name: string, size = "h-5 w-5") {
  const n = (name || "").toLowerCase();
  if (n === "stripe" || n.includes("card") || n.includes("visa"))
    return <CreditCard className={size} />;
  if (n.includes("vodafone") || n.includes("فودافون"))
    return <Smartphone className={size} />;
  if (n.includes("instapay") || n.includes("انستاباي") || n.includes("bank"))
    return <Building2 className={size} />;
  if (n.includes("paypal") || n.includes("باي"))
    return <Wallet className={size} />;
  return <Wallet className={size} />;
}

function getMethodColor(name: string) {
  const n = (name || "").toLowerCase();
  if (n === "stripe") return "blue";
  if (n.includes("vodafone") || n.includes("فودافون")) return "red";
  if (n.includes("paypal")) return "indigo";
  return "purple";
}

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; border: string }> = {
  blue:   { ring: "ring-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",   border: "border-blue-500/30" },
  red:    { ring: "ring-red-500",    bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",    border: "border-red-500/30" },
  indigo: { ring: "ring-indigo-500", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/30" },
  purple: { ring: "ring-purple-500", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30" },
};

// ─────────────────────────────────────────────────────────────────────────────

export default function SubscriptionPlansSection() {
  const { userProfile, user } = useAuth();
  const { state } = useAppState();
  const isRtl = state?.settings?.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ─── Payment methods ──────────────────────────────────────────────────────
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripePaymentLink, setStripePaymentLink] = useState("");
  const [stripePaymentLinkAnnual, setStripePaymentLinkAnnual] = useState("");
  const [methodsLoading, setMethodsLoading] = useState(true);

  // manual methods from state.paymentMethods (admin-configured list)
  const manualMethods: ManualMethod[] = (state.paymentMethods || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    value: p.value,
  }));

  // Combined ordered list: stripe first (if enabled), then manual
  const allMethods: Array<{ key: string; label: string; labelAr: string; isStripe: boolean; manual?: ManualMethod }> = [
    ...(stripeEnabled
      ? [{ key: "stripe", label: "Credit Card", labelAr: "بطاقة ائتمان", isStripe: true }]
      : []),
    ...manualMethods.map((m) => ({
      key: m.id,
      label: m.name,
      labelAr: m.name,
      isStripe: false,
      manual: m,
    })),
  ];

  const [selectedMethodKey, setSelectedMethodKey] = useState<string>("");

  // Auto-select first method once loaded
  useEffect(() => {
    if (!methodsLoading && allMethods.length > 0 && !selectedMethodKey) {
      setSelectedMethodKey(allMethods[0].key);
    }
  }, [methodsLoading, stripeEnabled, state.paymentMethods]);

  // Load Stripe config from Firestore
  useEffect(() => {
    firestore
      .getDoc(firestore.doc(db, "tenants", "global"))
      .then((snap) => {
        if (snap.exists()) {
          const stripe = snap.data()?.paymentMethods?.stripe;
          setStripeEnabled(!!(stripe?.enabled && (stripe?.secretKey || stripe?.paymentLink)));
          if (stripe?.paymentLink) setStripePaymentLink(stripe.paymentLink);
          if (stripe?.paymentLinkAnnual) setStripePaymentLinkAnnual(stripe.paymentLinkAnnual);
        }
      })
      .catch(() => {/* silent – stripe stays disabled */})
      .finally(() => setMethodsLoading(false));
  }, []);

  // ─── Manual transfer state ────────────────────────────────────────────────
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Latest Payment Status ────────────────────────────────────────────────
  const [latestPayment, setLatestPayment] = useState<any>(null);
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(true);
  const [dismissedRejected, setDismissedRejected] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingPaymentStatus(false);
      return;
    }
    const fetchLatest = async () => {
      try {
        const q = firestore.query(
          firestore.collection(db, "payments"),
          firestore.where("userId", "==", user.uid)
        );
        const snap = await firestore.getDocs(q);
        const docs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        docs.sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || a.createdAt || 0;
          const timeB = b.createdAt?.seconds || b.createdAt || 0;
          return timeB - timeA;
        });
        if (docs.length > 0) {
          setLatestPayment(docs[0]);
        }
      } catch (err) {
        console.error("Error fetching latest payment:", err);
      } finally {
        setLoadingPaymentStatus(false);
      }
    };
    fetchLatest();
  }, [user?.uid, submitted]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t("تم نسخ التفاصيل!", "Details copied!"));
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      toast.error(t("يرجى إرفاق صورة إيصال التحويل", "Please attach a payment receipt screenshot"));
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    try {
      // Dynamically import Firebase storage (same pattern used elsewhere in project)
      const { storage } = await import("../../config/firebase");
      const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
      const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");

      const storageRef = ref(
        storage,
        `payments/${user!.uid}/receipt_${Date.now()}`
      );
      const uploadTask = uploadBytesResumable(storageRef, receiptFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setUploadProgress(
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          );
        },
        (err) => {
          console.error("Storage upload error:", err);
          toast.error(t("فشل رفع الإيصال. حاول مرة أخرى.", "Failed to upload receipt. Please try again."));
          setUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const activeMethod = allMethods.find((m) => m.key === selectedMethodKey);

          await addDoc(collection(db, "payments"), {
            userId: user!.uid,
            userName: userProfile?.name || user!.email?.split("@")[0] || "User",
            userEmail: user!.email || "",
            amount: selectedPlan?.price ?? 0,
            currency: "USD",
            paymentMethod: activeMethod?.label || selectedMethodKey,
            planDuration:
              selectedPlan?.billingCycle === "yearly"
                ? "annual"
                : selectedPlan?.billingCycle === "lifetime"
                  ? "one-time"
                  : "monthly",
            planName: selectedPlan ? (isRtl ? selectedPlan.titleAr : selectedPlan.titleEn) : "",
            receiptUrl: downloadUrl,
            status: "pending",
            createdAt: serverTimestamp(),
          });

          setUploading(false);
          setSubmitted(true);
          setReceiptFile(null);
          setUploadProgress(0);
          toast.success(t("تم إرسال إثبات الدفع بنجاح! ✅ بانتظار مراجعة الإدارة.", "Payment proof submitted! ✅ Awaiting admin review."));
          setTimeout(() => {
            setSubmitted(false);
            setShowPaymentModal(false);
          }, 3000);
        }
      );
    } catch (err: any) {
      console.error("Manual payment submission failed:", err);
      toast.error(err.message || t("فشل إرسال الإيصال", "Receipt submission failed"));
      setUploading(false);
    }
  };

  // ─── Stripe return URL param verification ────────────────────────────────
  const [stripeVerifying, setStripeVerifying] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeResult = params.get("stripe");
    const sessionId = params.get("session_id");

    if (stripeResult === "cancel") {
      toast.error(t("تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى.", "Payment cancelled. You can try again."));
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (stripeResult === "success" && sessionId) {
      setStripeVerifying(true);
      window.history.replaceState({}, "", window.location.pathname);

      const verify = async () => {
        try {
          const response = await fetch(
            `${FUNCTIONS_BASE_URL}/stripeVerifySession?session_id=${encodeURIComponent(sessionId)}&adminId=global`,
            { method: "GET" }
          );
          const data = await response.json();

          if (response.ok && data.success) {
            toast.success(
              t("🎉 تم تفعيل اشتراكك بنجاح! مرحباً بك في الباقة الاحترافية.", "🎉 Subscription activated! Welcome to Pro."),
              { duration: 6000 }
            );
            setTimeout(() => window.location.reload(), 2000);
          } else if (data.message === "Already verified") {
            toast.success(t("اشتراكك مفعّل بالفعل ✅", "Your subscription is already active ✅"));
          } else {
            throw new Error(data.error || "Verification failed");
          }
        } catch (err: any) {
          console.error("Stripe verify error:", err);
          toast.error(
            t(`فشل التحقق: ${err.message}. إذا تم الخصم، تواصل مع الدعم.`,
              `Verification failed: ${err.message}. If charged, contact support.`),
            { duration: 8000 }
          );
        } finally {
          setStripeVerifying(false);
        }
      };
      verify();
    }
  }, []);

  // ─── Fetch subscription plans ────────────────────────────────────────────
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const snap = await firestore.getDocs(firestore.collection(db, "subscriptionPlans"));
        const fetchedPlans = snap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as SubscriptionPlan)
        );

        if (fetchedPlans.length === 0) {
          const defaultPlan: Omit<SubscriptionPlan, "id"> = {
            titleEn: "Pro Plan",
            titleAr: "الباقة الاحترافية",
            price: 99,
            billingCycle: "monthly",
            featuresEn: ["Unlimited Access", "Priority Support", "Advanced Analytics", "Custom Domain"],
            featuresAr: ["وصول غير محدود", "دعم أولوية", "تحليلات متقدمة", "نطاق مخصص"],
            isActive: true,
          };
          const newDoc = await firestore.addDoc(firestore.collection(db, "subscriptionPlans"), defaultPlan);
          setPlans([{ id: newDoc.id, ...defaultPlan }]);
        } else {
          setPlans(fetchedPlans.filter((p) => p.isActive));
        }
      } catch (err) {
        console.error("Failed to fetch subscription plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setReceiptFile(null);
    setSubmitted(false);
    setUploadProgress(0);
    setShowPaymentModal(true);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setReceiptFile(null);
    setSubmitted(false);
    setUploading(false);
    setUploadProgress(0);
  };

  // ─── Active method resolved object ───────────────────────────────────────
  const activeMethod = allMethods.find((m) => m.key === selectedMethodKey);

  // ─── Security note text per method ───────────────────────────────────────
  const securityNote = activeMethod?.isStripe
    ? t("الدفع آمن ومشفر بالكامل عبر Stripe. لن يتم حفظ بيانات بطاقتك.", "Fully secure & encrypted via Stripe. Card details are never stored.")
    : t("يتم مراجعة التحويلات اليدوية وتفعيلها خلال 24 ساعة من قِبَل فريق الإدارة.", "Manual transfers are reviewed and activated within 24 hours by our admin team.");

  // ─── Early returns ───────────────────────────────────────────────────────
  if (stripeVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {t("جاري التحقق من حالة الدفع...", "Verifying your payment...")}
        </p>
        <p className="text-xs text-slate-400">
          {t("يرجى الانتظار بينما نقوم بتفعيل اشتراكك", "Please wait while we activate your subscription")}
        </p>
      </div>
    );
  }

  if (loading || loadingPaymentStatus) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // ─── Pending State ───────────────────────────────────────────────────────
  if (latestPayment?.status === "pending") {
    return (
      <div className="space-y-8 pb-12 max-w-4xl mx-auto animate-fade-in px-4 mt-8">
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-8 md:p-12 rounded-3xl text-center shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-100 dark:bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400">
              <Clock className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            {t("طلب الدفع قيد المراجعة", "Payment Request Under Review")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 max-w-lg mx-auto leading-relaxed">
            {t("جاري مراجعة إيصال الدفع الخاص بك من قبل فريقنا. سيتم تفعيل اشتراكك وإشعارك فور الانتهاء.", "Your payment request is currently under review by our team. You will be notified once approved.")}
          </p>
          
          <div className="inline-block bg-white dark:bg-[#12141c] p-6 rounded-2xl text-left border border-amber-100 dark:border-amber-900 shadow-sm w-full max-w-md" dir={isRtl ? "rtl" : "ltr"}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              {t("تفاصيل الطلب", "Request Details")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">{t("الباقة", "Plan")}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{latestPayment.planName || "Pro"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">{t("المبلغ", "Amount")}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">${latestPayment.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">{t("طريقة الدفع", "Method")}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{latestPayment.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isRejected = latestPayment?.status === "rejected" && !dismissedRejected;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto animate-fade-in px-4">
      {/* Rejected Alert Banner */}
      {isRejected && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl mt-1 md:mt-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                {t("تم رفض طلب الدفع الأخير", "Your last payment request was rejected")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {latestPayment.rejectionReason 
                  ? (isRtl ? `السبب: ${latestPayment.rejectionReason}` : `Reason: ${latestPayment.rejectionReason}`)
                  : t("لم يتم التحقق من إيصال الدفع. يرجى المراجعة والمحاولة مجدداً.", "We could not verify your receipt. Please review and try again.")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissedRejected(true)}
            className="whitespace-nowrap px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors w-full md:w-auto"
          >
            {t("المحاولة مرة أخرى", "Try Again")}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-[#12141c]/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Crown className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t("خطط الاشتراك", "Subscription Plans")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
            {t(
              "قم بترقية حسابك للوصول إلى كافة الميزات الاحترافية وتوسيع نطاق عملك",
              "Upgrade your account to access all professional features and scale your business."
            )}
          </p>
        </div>

        {/* Current Plan Status */}
        <div className="flex flex-col items-start md:items-end p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            {t("الحالة الحالية", "Current Status")}
          </span>
          {userProfile?.subscription?.status === "pro" ? (
            <div className="flex items-center gap-2 text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-black text-sm">{t("باقة احترافية نشطة", "Pro Plan Active")}</span>
            </div>
          ) : userProfile?.subscription?.status === "trial" ? (
            <div className="flex items-center gap-2 text-amber-500">
              <Crown className="h-5 w-5" />
              <span className="font-black text-sm">{t("فترة تجريبية", "Free Trial")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500">
              <Loader2 className="h-5 w-5" />
              <span className="font-black text-sm">{t("منتهي الصلاحية", "Expired")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-slate-800">
            <Crown className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("لا توجد خطط متاحة", "No Plans Available")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {t("الرجاء التواصل مع الإدارة", "Please contact support for plans.")}
            </p>
          </div>
        ) : (
          plans.map((plan, idx) => {
            const activePlanId = userProfile?.subscription?.planId;
            const isMatchingPlan = 
              activePlanId === plan.id || 
              activePlanId === plan.titleEn || 
              activePlanId === plan.titleAr || 
              (activePlanId?.toLowerCase() === "pro" && plan.titleEn.toLowerCase().includes("pro"));

            const currentEnd = userProfile?.subscription?.currentPeriodEnd;
            let isExpired = false;
            if (currentEnd) {
              const endDate = currentEnd.toDate ? currentEnd.toDate() : new Date(currentEnd);
              if (new Date() > endDate) isExpired = true;
            }

            const isCurrentPlan = userProfile?.subscription?.status === "pro" && isMatchingPlan && !isExpired;
            const isExpiredPlan = userProfile?.subscription?.status === "pro" && isMatchingPlan && isExpired;

            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col bg-white dark:bg-[#12141c] rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
                isCurrentPlan 
                  ? "border-emerald-500 shadow-xl shadow-emerald-500/10" 
                  : isExpiredPlan
                  ? "border-emerald-500/50 shadow-xl shadow-emerald-500/10"
                  : "border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10"
              }`}
            >
              {plan.targetLevel && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              )}
              <div className="p-6 md:p-8 flex-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {isRtl ? plan.titleAr : plan.titleEn}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-sm font-bold text-slate-400">
                    /{plan.billingCycle === "monthly" ? t("شهر", "mo") : plan.billingCycle === "yearly" ? t("سنة", "yr") : t("مدى الحياة", "lifetime")}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {(isRtl ? plan.featuresAr : plan.featuresEn).map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-snug">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <button
                  onClick={() => !isCurrentPlan && handleUpgrade(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-4 px-6 rounded-xl font-black text-sm transition-colors duration-300 flex items-center justify-center gap-2 group ${
                    isCurrentPlan
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-not-allowed border border-emerald-200 dark:border-emerald-500/20"
                      : isExpiredPlan
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-500"
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white"
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      {t("باقتك الحالية", "Current Plan")}
                    </>
                  ) : isExpiredPlan ? (
                    <>
                      {t("تجديد الباقة", "Renew Plan")}
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      {t("ترقية الآن", "Upgrade Now")}
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
            );
          })
        )}
      </div>

      {/* ─── Payment Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  {t("إتمام عملية الدفع", "Complete Payment")}
                </h3>
                <button
                  onClick={closeModal}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">

                {/* Plan summary chip */}
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <div>
                    <div className="font-bold text-sm">
                      {isRtl ? selectedPlan.titleAr : selectedPlan.titleEn}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-70">
                      {selectedPlan.billingCycle === "monthly"
                        ? t("اشتراك شهري", "Monthly subscription")
                        : selectedPlan.billingCycle === "yearly"
                          ? t("اشتراك سنوي", "Annual subscription")
                          : t("مدى الحياة", "Lifetime access")}
                    </div>
                  </div>
                  <span className="font-black text-xl">${selectedPlan.price}</span>
                </div>

                {/* ── Method Selector ── */}
                {methodsLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">{t("جاري تحميل طرق الدفع...", "Loading payment methods...")}</span>
                  </div>
                ) : allMethods.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    {t(
                      "لم يتم تكوين أي طريقة دفع بعد. تواصل مع الإدارة.",
                      "No payment methods configured yet. Please contact support."
                    )}
                  </div>
                ) : (
                  <>
                    {/* Method tabs */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                        {t("اختر طريقة الدفع", "Choose Payment Method")}
                      </p>
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(allMethods.length, 3)}, 1fr)` }}>
                        {allMethods.map((method) => {
                          const isActive = selectedMethodKey === method.key;
                          const color = getMethodColor(method.isStripe ? "stripe" : method.label);
                          const c = COLOR_MAP[color] || COLOR_MAP.purple;
                          return (
                            <button
                              key={method.key}
                              type="button"
                              onClick={() => {
                                setSelectedMethodKey(method.key);
                                setReceiptFile(null);
                                setSubmitted(false);
                              }}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150 text-center ${
                                isActive
                                  ? `${c.ring} ring-2 ${c.bg} ${c.text} ${c.border}`
                                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50"
                              }`}
                            >
                              {getMethodIcon(method.isStripe ? "stripe" : method.label, "h-5 w-5")}
                              <span className="text-[11px] font-bold leading-tight">
                                {isRtl ? method.labelAr : method.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Method Detail Panel ── */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedMethodKey}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* STRIPE panel */}
                        {activeMethod?.isStripe && (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                              {t(
                                "سيتم توجيهك إلى بوابة Stripe الآمنة لإتمام الدفع ببطاقتك الائتمانية.",
                                "You'll be redirected to Stripe's secure hosted checkout to pay with your card."
                              )}
                            </p>
                            
                            {user ? (
                              (() => {
                                const isAnnual = selectedPlan?.billingCycle === "yearly";
                                const linkToUse = isAnnual ? stripePaymentLinkAnnual || stripePaymentLink : stripePaymentLink;
                                
                                if (linkToUse) {
                                  // Direct Payment Link redirect
                                  const url = new URL(linkToUse);
                                  url.searchParams.set("client_reference_id", user.uid);
                                  // Ensure we can return to success/cancel
                                  // (Stripe payment links configure this in dashboard, but some support passing it)
                                  
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => { window.location.href = url.toString(); }}
                                      className="w-full py-4 px-6 rounded-xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                      <CreditCard className="h-4 w-4" /> {isRtl ? `الدفع الآن — $${selectedPlan.price}` : `Pay Now — $${selectedPlan.price}`}
                                    </button>
                                  );
                                } else {
                                  // Fallback to API Checkout Session (requires Secret Key)
                                  return (
                                    <StripePaymentButton
                                      amount={selectedPlan.price}
                                      currency="USD"
                                      planName={isRtl ? selectedPlan.titleAr : selectedPlan.titleEn}
                                      planDuration={
                                        isAnnual
                                          ? "annual"
                                          : selectedPlan?.billingCycle === "lifetime"
                                            ? "one-time"
                                            : "monthly"
                                      }
                                      userId={user.uid}
                                      adminId={userProfile?.uid}
                                      buttonText={isRtl ? `الدفع الآن — $${selectedPlan.price}` : `Pay Now — $${selectedPlan.price}`}
                                      isRtl={isRtl}
                                      className="w-full py-4 px-6 rounded-xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    />
                                  );
                                }
                              })()
                            ) : (
                              <div className="text-center py-3 text-sm text-red-500">
                                {t("يرجى تسجيل الدخول لإتمام الدفع", "Please log in to complete payment")}
                              </div>
                            )}
                          </div>
                        )}

                        {/* MANUAL METHOD panel */}
                        {activeMethod && !activeMethod.isStripe && activeMethod.manual && (
                          <form onSubmit={handleSubmitManual} className="space-y-4">
                            {/* Account / address box */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                                {t("تفاصيل التحويل", "Transfer Details")}
                              </p>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-black text-slate-800 dark:text-white font-mono tracking-wide break-all">
                                  {activeMethod.manual.value}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(activeMethod.manual!.value)}
                                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                                >
                                  {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                  {copied ? t("تم!", "Copied!") : t("نسخ", "Copy")}
                                </button>
                              </div>
                              <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                {t(
                                  `يرجى تحويل مبلغ $${selectedPlan.price} إلى الحساب أعلاه ثم ارفع صورة إيصال التحويل.`,
                                  `Please transfer $${selectedPlan.price} to the account above, then upload your transfer receipt.`
                                )}
                              </p>
                            </div>

                            {/* Receipt upload */}
                            <div>
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">
                                {t("إيصال التحويل (صورة)", "Transfer Receipt (Image)")}
                              </label>
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors ${
                                  receiptFile
                                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-500"
                                }`}
                              >
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      if (!f.type.startsWith("image/")) {
                                        toast.error(t("يرجى رفع صورة (PNG/JPG)", "Please upload an image (PNG/JPG)"));
                                        return;
                                      }
                                      setReceiptFile(f);
                                    }
                                  }}
                                />
                                {receiptFile ? (
                                  <>
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-center break-all">
                                      {receiptFile.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{t("انقر للتغيير", "Click to change")}</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-6 w-6 text-slate-400" />
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                      {t("انقر لرفع إيصال التحويل", "Click to upload receipt")}
                                    </span>
                                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Upload progress */}
                            {uploading && (
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px] text-slate-500">
                                  <span>{t("جاري الرفع...", "Uploading...")}</span>
                                  <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Success message */}
                            {submitted && (
                              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                                <CheckCheck className="h-4 w-4 shrink-0" />
                                {t("تم إرسال الإيصال بنجاح! بانتظار مراجعة الإدارة.", "Receipt submitted! Awaiting admin review.")}
                              </div>
                            )}

                            {/* Submit button */}
                            {!submitted && (
                              <button
                                type="submit"
                                disabled={uploading || !receiptFile}
                                className="w-full py-3.5 rounded-xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t(`جاري الإرسال (${uploadProgress}%)`, `Uploading (${uploadProgress}%)`)}
                                  </>
                                ) : (
                                  t("إرسال إثبات الدفع", "Submit Payment Proof")
                                )}
                              </button>
                            )}
                          </form>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </>
                )}

                {/* Security note — dynamic per method */}
                <div className="flex items-start gap-2 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{securityNote}</span>
                </div>
              </div>

              {/* Modal footer — cancel */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors text-sm"
                >
                  {t("إلغاء والعودة", "Cancel & Go Back")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

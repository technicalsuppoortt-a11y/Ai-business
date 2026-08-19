import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useApp } from "../../context/AppContext";
import { doc, getDoc, setDoc, collection, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import PhoneInput from "../../components/PhoneInput";
import Logo from "../../components/common/Logo";
import BrandedLoader from "../../components/common/BrandedLoader";
import TermsContent from "../../components/common/TermsContent";
import { useSystemBranding } from "../../context/SystemBrandingContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Check,
  Globe,
  LogIn,
  Sparkles,
  Shield,
  Zap,
  Star,
  Circle,
  Diamond,
  Crown,
  Key,
  X,
  Send,
  ShieldCheck,
} from "lucide-react";

const authTranslations = {
  ar: {
    portals: {
      user: {
        title: "AI Business",
        subtitle: "صفحة الأدوات",
        badgeText: "تسجيل دخول — أدوات",
      },
      admin: {
        title: "لوحة تحكم البراند",
        subtitle: "Admin Dashboard",
        badgeText: "تسجيل دخول — أدمن",
      },
      superadmin: {
        title: "لوحة التحكم الرئيسية",
        subtitle: "Super Admin Panel",
        badgeText: "تسجيل دخول — سوبر أدمن",
      },
    },
    loginTab: "تسجيل الدخول",
    registerTab: "إنشاء حساب جديد",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    nameLabel: "الاسم الكامل",
    namePlaceholder: "مثال: أحمد محمد",
    phoneLabel: "رقم الهاتف",
    phonePlaceholder: "مثال: 01066886844",
    loginBtn: "دخول ←",
    loggingIn: "جاري الدخول...",
    registerBtn: "إنشاء حساب تجريبي ←",
    registering: "جاري التسجيل...",
    whatsappPrompt: "هل تريد تفعيل اشتراكك الكامل؟ تواصل مع الإدارة",
    whatsappBtn: "تفعيل الاشتراك عن طريق الواتس اب",
    securedBy: "",
    inactiveSubscription:
      "عذراً، اشتراكك متوقف أو منتهي الصلاحية. يرجى التواصل مع الإدارة.",
    enterEmail: "أدخل البريد الإلكتروني",
    enterPassword: "أدخل كلمة المرور",
    enterName: "يرجى إدخال الاسم",
    enterPhone: "يرجى إدخال رقم الهاتف",
    weakPassword: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    cannotResolveBrand:
      "عذراً، لم نتمكن من تحديد البراند المشرف على هذا النطاق.",
    autoLoginSuccess: "تم الدخول التلقائي للمعاينة 🔑",
    welcome: "مرحباً بك! 🎉",
    registerSuccess: "تم إنشاء حسابك وبدء الفترة المجانية بنجاح! 🎉",
    roleMismatchAdmin: "هذا الحساب ليس أدمن. سجل من صفحة الأدوات.",
    roleMismatchSuper: "هذا الحساب ليس سوبر أدمن.",
    roleMismatchDefault: "ليس لديك صلاحية الدخول من هنا.",
    errors: {
      "auth/user-not-found": "البريد الإلكتروني غير مسجل",
      "auth/wrong-password": "كلمة المرور غير صحيحة",
      "auth/invalid-email": "صيغة البريد الإلكتروني غير صحيحة",
      "auth/too-many-requests": "محاولات كثيرة جداً، حاول لاحقاً",
      "auth/user-disabled": "هذا الحساب معطل",
      "auth/network-request-failed": "خطأ في الاتصال بالإنترنت",
      "auth/invalid-credential": "البريد أو كلمة المرور غير صحيحة",
      default: "حدث خطأ أثناء تسجيل الدخول",
      regDefault: "حدث خطأ أثناء إنشاء الحساب",
      "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل",
      "auth/weak-password": "كلمة المرور ضعيفة جداً",
    },
  },
  en: {
    portals: {
      user: {
        title: "AI Business",
        subtitle: "Tools Portal",
        badgeText: "Login — Tools",
      },
      admin: {
        title: "Brand Admin Panel",
        subtitle: "Admin Dashboard",
        badgeText: "Login — Admin",
      },
      superadmin: {
        title: "Main Control Panel",
        subtitle: "Super Admin Panel",
        badgeText: "Login — Super Admin",
      },
    },
    loginTab: "Login",
    registerTab: "Create New Account",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. John Doe",
    phoneLabel: "Phone Number",
    phonePlaceholder: "e.g. +201066886844",
    loginBtn: "Login →",
    loggingIn: "Logging in...",
    registerBtn: "Create Trial Account →",
    registering: "Registering...",
    whatsappPrompt: "Want to activate your full subscription? Contact Support",
    whatsappBtn: "Activate Subscription via WhatsApp",
    securedBy: "🔒 Secured by Firebase Authentication",
    inactiveSubscription:
      "Sorry, your subscription is suspended or expired. Please contact support.",
    enterEmail: "Please enter your email address",
    enterPassword: "Please enter your password",
    enterName: "Please enter your full name",
    enterPhone: "Please enter your phone number",
    weakPassword: "Password must be at least 6 characters",
    cannotResolveBrand:
      "Sorry, could not resolve the admin brand for this domain.",
    autoLoginSuccess: "Auto logged in for preview 🔑",
    welcome: "Welcome back! 🎉",
    registerSuccess: "Account created and free trial started successfully! 🎉",
    roleMismatchAdmin:
      "This account is not an admin. Please log in from the tools page.",
    roleMismatchSuper: "This account is not a super admin.",
    roleMismatchDefault: "You do not have access permission here.",
    errors: {
      "auth/user-not-found": "Email address is not registered",
      "auth/wrong-password": "Incorrect password",
      "auth/invalid-email": "Invalid email address format",
      "auth/too-many-requests": "Too many attempts, please try again later",
      "auth/user-disabled": "This account is disabled",
      "auth/network-request-failed": "Network connection error",
      "auth/invalid-credential": "Incorrect email or password",
      default: "An error occurred during login",
      regDefault: "An error occurred during registration",
      "auth/email-already-in-use": "Email is already in use by another account",
      "auth/weak-password": "Password is too weak",
    },
  },
};

/**
 * Unified Login Page — used for all 3 portals.
 */
export default function AuthPage({
  portal = "user",
  redirectTo = "/dashboard/onboarding",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeForm, setActiveForm] = useState("login");
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPhoneKey, setRegisterPhoneKey] = useState("+20");
  const [resolvedBrand, setResolvedBrand] = useState(null);
  const [adminPhone, setAdminPhone] = useState("");
  const [adminBrandName, setAdminBrandName] = useState("");

  const {
    login,
    logout,
    resetPassword,
    isAuthenticatedFor,
    getUserDataFor,
    isPortalLoading,
    loading,
  } = useAuth();
  const { state, dispatch } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { brandName: globalBrandName } = useSystemBranding();

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const activeTrans =
    authTranslations[state.language || "ar"] || authTranslations.ar;

  useEffect(() => {
    if (portal !== "user") return;

    const cacheKey = `resolved_brand_${window.location.host}_${window.location.search}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setResolvedBrand(parsed);
        setAdminPhone(parsed?.phoneNumber || "");
        setAdminBrandName(parsed?.brandName || "");
        return;
      } catch (e) {}
    }

    const resolveBrand = async () => {
      try {
        if (location.state?.resolvedBrand) {
          const adminData = location.state.resolvedBrand;
          setResolvedBrand(adminData);
          setAdminPhone(adminData.phoneNumber || "");
          setAdminBrandName(adminData.brandName || "");
          return;
        }

        const currentHref = window.location.href.toLowerCase();
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const urlSlugs = pathParts.map((p) =>
          p.replace(/-/g, " ").toLowerCase(),
        );
        const explicitTest = new URLSearchParams(window.location.search).get(
          "test",
        );

        const q = query(collection(db, "users"), where("role", "==", "admin"));
        const snap = await getDocs(q);

        let candidates = [];

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const brandUrlClean = data.brandUrl
            ? data.brandUrl.toLowerCase().trim()
            : "";
          const brandNameClean = data.brandName
            ? data.brandName.toLowerCase().trim()
            : "";

          let isMatch = false;
          let matchScore = 0;

          if (
            explicitTest &&
            (brandUrlClean === explicitTest || brandNameClean === explicitTest)
          ) {
            isMatch = true;
            matchScore = 1000;
          } else {
            if (
              brandUrlClean &&
              currentHref.includes(brandUrlClean.replace(/\s+/g, "-"))
            ) {
              isMatch = true;
              matchScore = brandUrlClean.length;
            } else if (
              brandNameClean &&
              currentHref.includes(brandNameClean.replace(/\s+/g, "-"))
            ) {
              isMatch = true;
              matchScore = brandNameClean.length;
            } else if (
              brandNameClean &&
              urlSlugs.some(
                (slug) =>
                  slug.includes(brandNameClean) ||
                  brandNameClean.includes(slug),
              )
            ) {
              isMatch = true;
              matchScore = brandNameClean.length;
            }
          }

          if (isMatch) {
            candidates.push({
              admin: { uid: docSnap.id, ...data },
              score: matchScore,
            });
          }
        });

        candidates.sort((a, b) => b.score - a.score);
        let matchedAdmin = candidates.length > 0 ? candidates[0].admin : null;

        if (matchedAdmin) {
          sessionStorage.setItem(cacheKey, JSON.stringify(matchedAdmin));
          setResolvedBrand(matchedAdmin);
          setAdminPhone(matchedAdmin.phoneNumber || "");
          setAdminBrandName(matchedAdmin.brandName || "");
        } else {
          setResolvedBrand(null);
          setAdminPhone("");
          setAdminBrandName("");
        }
      } catch (err) {
        console.error("Failed to resolve brand admin:", err);
      }
    };

    resolveBrand();
  }, [portal, location.state]);

  const isAuth = isAuthenticatedFor(portal);
  const userData = getUserDataFor(portal);
  const portalLoading = isPortalLoading ? isPortalLoading(portal) : loading;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "subscription_inactive") {
      toast(activeTrans.inactiveSubscription, "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!portalLoading && isAuth && userData) {
      const sub = userData?.subscription;
      const isStopped = sub?.status === "stopped";
      const isLifetime = sub?.type === "lifetime";
      const expiry = sub?.expiryDate?.toDate
        ? sub.expiryDate.toDate()
        : sub?.expiryDate
          ? new Date(sub.expiryDate)
          : null;
      const isExpired = !isLifetime && expiry && expiry < new Date();

      const hasCorrectRole =
        (portal === "superadmin" && userData.role === "superadmin") ||
        (portal === "admin" &&
          (userData.role === "admin" || userData.role === "superadmin")) ||
        portal === "user";

      if (
        hasCorrectRole &&
        (userData.role === "superadmin" || (!isStopped && !isExpired))
      ) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [
    isAuth,
    userData,
    portalLoading,
    navigate,
    redirectTo,
    portal,
    activeTrans.inactiveSubscription,
  ]);

  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (isIframe && portal === "user" && !isAuth && !portalLoading && !isLoading) {
      const savedEmail = sessionStorage.getItem("admin_e_token");
      const savedPassword = sessionStorage.getItem("admin_p_token");
      if (savedEmail && savedPassword) {
        setIsLoading(true);
        login(savedEmail, savedPassword, "user")
          .then(() => {
            toast(activeTrans.autoLoginSuccess, "success");
          })
          .catch((err) => {
            console.error("Auto login failed:", err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [portal, isAuth, portalLoading, isLoading, login, activeTrans.autoLoginSuccess]);

  if (portalLoading) {
    return (
      <BrandedLoader
        message={
          state.language === "en"
            ? "Verifying credentials..."
            : "جاري التحقق..."
        }
        lang={state.language || "ar"}
      />
    );
  }

  if (isAuth && userData) {
    const sub = userData?.subscription;
    const isStopped = sub?.status === "stopped";
    const isLifetime = sub?.type === "lifetime";
    const expiry = sub?.expiryDate?.toDate
      ? sub.expiryDate.toDate()
      : sub?.expiryDate
        ? new Date(sub.expiryDate)
        : null;
    const isExpired = !isLifetime && expiry && expiry < new Date();
    if (userData.role === "superadmin" || (!isStopped && !isExpired)) {
      return null;
    }
  }

  const portalConfig = {
    user: {
      title: adminBrandName || globalBrandName || activeTrans.portals.user.title,
      subtitle: activeTrans.portals.user.subtitle,
      badgeText: activeTrans.portals.user.badgeText,
      gradient: "linear-gradient(135deg, var(--accent), #7C3AED)",
      icon: "📦",
    },
    admin: {
      title: activeTrans.portals.admin.title,
      subtitle: activeTrans.portals.admin.subtitle,
      badgeText: activeTrans.portals.admin.badgeText,
      gradient: "linear-gradient(135deg, var(--accent), var(--green))",
      icon: "🛡",
    },
    superadmin: {
      title: activeTrans.portals.superadmin.title,
      subtitle: activeTrans.portals.superadmin.subtitle,
      badgeText: activeTrans.portals.superadmin.badgeText,
      gradient:
        "linear-gradient(135deg, var(--amber, #F59E0B), var(--red, #EF4444))",
      icon: "👑",
    },
  };

  const config = portalConfig[portal];

  const getFirebaseErrorMessage = (code) => {
    return activeTrans.errors[code] || activeTrans.errors.default;
  };

  const getRoleMismatchMessage = () => {
    if (portal === "admin") return activeTrans.roleMismatchAdmin;
    if (portal === "superadmin") return activeTrans.roleMismatchSuper;
    return activeTrans.roleMismatchDefault;
  };

  const handleForgotPasswordSubmit = async (e) => {
    e?.preventDefault();
    const targetEmail = (forgotPasswordEmail || email).trim();
    if (!targetEmail) {
      return toast(
        state.language === "en"
          ? "Please enter registered email address."
          : "يرجى إدخال البريد الإلكتروني المسجل.",
        "error",
      );
    }

    setIsSendingReset(true);
    try {
      await resetPassword(targetEmail, portal);
      toast(
        state.language === "en"
          ? `Password reset link sent to (${targetEmail})  `
          : `تم إرسال رابط إعادة تعيين كلمة المرور إلى (${targetEmail})`,
        "success",
      );
      setIsForgotPasswordOpen(false);
    } catch (err) {
      if (err.message === "ROLE_MISMATCH_ADMIN") {
        toast(
          state.language === "en"
            ? "This email is not authorized for Admin Password Recovery. Please use the User portal."
            : "هذا البريد غير مخول لاستعادة كلمة مرور الأدمن. يرجى استخدام بوابة المستخدمين.",
          "error",
        );
      } else if (err.message === "ROLE_MISMATCH_SUPER") {
        toast(
          state.language === "en"
            ? "This email is not authorized for Super Admin Password Recovery."
            : "هذا البريد غير مخول لاستعادة كلمة مرور السوبر أدمن.",
          "error",
        );
      } else if (err.code === "auth/user-not-found") {
        toast(
          state.language === "en"
            ? "Email address not registered."
            : "البريد الإلكتروني غير مسجل في النظام.",
          "error",
        );
      } else {
        const errorMsg = err.code ? getFirebaseErrorMessage(err.code) : (err.message || (state.language === "en" ? "An error occurred" : "حدث خطأ أثناء إرسال الرابط"));
        toast(errorMsg, "error");
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return toast(activeTrans.enterEmail, "error");
    if (!password.trim()) return toast(activeTrans.enterPassword, "error");

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password, portal);
      const uid = result.user.uid;

      let role = "user";
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          role = userDoc.data().role || "user";
        }
      } catch {
        /* default */
      }

      if (email.trim().toLowerCase() === "admin@brand.com") {
        role = "superadmin";
      }

      let allowed = false;
      if (portal === "user") {
        allowed = true;
      } else if (portal === "admin") {
        allowed = role === "admin" || role === "superadmin";
      } else if (portal === "superadmin") {
        allowed = role === "superadmin";
      }

      if (!allowed) {
        await logout(portal);
        toast(getRoleMismatchMessage(), "error");
        setIsLoading(false);
        return;
      }

      if (portal === "admin") {
        sessionStorage.setItem("admin_e_token", email.trim());
        sessionStorage.setItem("admin_p_token", password);
      }

      toast(activeTrans.welcome, "success");
      navigate(redirectTo);
    } catch (err) {
      console.error("Login error:", err);
      toast(getFirebaseErrorMessage(err.code), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return toast(activeTrans.enterName, "error");
    if (!registerEmail.trim()) return toast(activeTrans.enterEmail, "error");
    if (!registerPhone.trim()) return toast(activeTrans.enterPhone, "error");
    if (!registerPassword.trim() || registerPassword.length < 6) {
      return toast(activeTrans.weakPassword, "error");
    }
    if (!acceptedTerms) {
      return toast(lang?.startsWith('ar') ? "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة" : "You must accept the Terms & Conditions and Privacy Policy to continue", "error");
    }
    if (!resolvedBrand) {
      return toast(activeTrans.cannotResolveBrand, "error");
    }

    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        registerEmail.trim(),
        registerPassword,
      );
      const uid = cred.user.uid;

      const trialDays = resolvedBrand.freeTrialSettings?.days || 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(trialDays));

      await setDoc(doc(db, "users", uid), {
        email: registerEmail.trim().toLowerCase(),
        role: "user",
        ownerName: name.trim(),
        phoneNumber: `${registerPhoneKey}${registerPhone.trim().replace(/^\+/, "")}`,
        brandName: resolvedBrand.brandName || "",
        createdAt: serverTimestamp(),
        createdBy: resolvedBrand.uid || "",
        subscription: {
          type: "trial",
          expiryDate: expiryDate,
          status: "active",
          updatedAt: serverTimestamp(),
        },
      });

      toast(activeTrans.registerSuccess, "success");
      navigate(redirectTo);
    } catch (err) {
      console.error("Registration error:", err);
      const msgs = {
        "auth/email-already-in-use":
          activeTrans.errors["auth/email-already-in-use"],
        "auth/invalid-email": activeTrans.errors["auth/invalid-email"],
        "auth/weak-password": activeTrans.errors["auth/weak-password"],
      };
      toast(msgs[err.code] || activeTrans.errors.regDefault, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const lang = state.language || "ar";

  const themeColors = {
    user: {
      glow1: "rgba(99, 102, 241, 0.22)",
      glow2: "rgba(168, 85, 247, 0.25)",
      glow3: "rgba(6, 182, 212, 0.18)",
      glow4: "rgba(139, 92, 246, 0.15)",
      accent: "#06b6d4",
    },
    admin: {
      glow1: "rgba(59, 130, 246, 0.22)",
      glow2: "rgba(16, 185, 129, 0.25)",
      glow3: "rgba(6, 182, 212, 0.18)",
      glow4: "rgba(52, 211, 153, 0.15)",
      accent: "#10b981",
    },
    superadmin: {
      glow1: "rgba(245, 158, 11, 0.22)",
      glow2: "rgba(239, 68, 68, 0.25)",
      glow3: "rgba(236, 72, 153, 0.18)",
      glow4: "rgba(251, 191, 36, 0.15)",
      accent: "#f59e0b",
    },
  }[portal] || {
    glow1: "rgba(99, 102, 241, 0.22)",
    glow2: "rgba(168, 85, 247, 0.25)",
    glow3: "rgba(6, 182, 212, 0.18)",
    glow4: "rgba(139, 92, 246, 0.15)",
    accent: "#06b6d4",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#040712",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "24px 16px",
        boxSizing: "border-box",
        "--theme-accent": themeColors.accent,
        "--accent": themeColors.accent,
      }}
      dir={lang?.startsWith('ar') ? "rtl" : "ltr"}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-2deg); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-200px) translateX(50px); opacity: 0; }
        }

        .glass-card {
          background: rgba(4, 7, 18, 0.75) !important;
          backdrop-filter: blur(40px) saturate(200%) !important;
          -webkit-backdrop-filter: blur(40px) saturate(200%) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          box-shadow: 
            0 30px 80px -20px rgba(0, 0, 0, 0.8),
            inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
        }

        .glass-card-content::-webkit-scrollbar {
          width: 6px;
        }
        .glass-card-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .glass-card-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
        }
        .glass-card-content::-webkit-scrollbar-thumb:hover {
          background: var(--theme-accent);
        }

        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Animated gradient border - STATIC POSITION, NO MOVEMENT */
        .card-border-gradient {
          position: absolute;
          inset: -2px;
          border-radius: 28px;
          padding: 2px;
          background: linear-gradient(
            135deg,
            var(--theme-accent) 0%,
            transparent 25%,
            var(--theme-accent) 50%,
            transparent 75%,
            var(--theme-accent) 100%
          );
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 0;
          animation: gradientMove 6s ease-in-out infinite;
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.06) !important;
          color: #fff !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          backdrop-filter: blur(10px) !important;
        }
        .glass-input:hover {
          border-color: rgba(255, 255, 255, 0.12) !important;
          background: rgba(255, 255, 255, 0.04) !important;
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: var(--theme-accent) !important;
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.08), inset 0 1px 2px rgba(0,0,0,0.2) !important;
        }
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.25) !important;
        }

        /* Floating particles */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--theme-accent);
          border-radius: 50%;
          animation: particleFloat 8s ease-in-out infinite;
          opacity: 0;
        }

        /* Cut effect for register form */
        .register-cut-top {
          position: absolute;
          top: -1px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: var(--theme-accent);
          filter: blur(4px);
          opacity: 0.3;
          border-radius: 50%;
        }
        .register-cut-bottom {
          position: absolute;
          bottom: -1px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: var(--theme-accent);
          filter: blur(4px);
          opacity: 0.3;
          border-radius: 50%;
        }
      `}</style>

      {/* Background Stars & Nebula Effect */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Deep space stars */}
        {[...Array(80)].map((_, i) => (
          <div
            key={`star-${i}`}
            style={{
              position: "absolute",
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              background: "#fff",
              borderRadius: "50%",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.6 + 0.2,
              animation: `glowPulse ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}

        {/* Primary Aurora/Glow Orbs with enhanced animations */}
        <motion.div
          animate={{
            x: [0, 100, -50, 80, 0],
            y: [0, -80, 50, -30, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${themeColors.glow1} 0%, rgba(0,0,0,0) 70%)`,
            filter: "blur(130px)",
            top: "-20%",
            left: "-15%",
          }}
        />

        <motion.div
          animate={{
            x: [0, -80, 100, -60, 0],
            y: [0, 60, -90, 40, 0],
            scale: [1, 0.9, 1.1, 0.95, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: "750px",
            height: "750px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${themeColors.glow2} 0%, rgba(0,0,0,0) 70%)`,
            filter: "blur(130px)",
            bottom: "-25%",
            right: "-15%",
          }}
        />

        <motion.div
          animate={{
            x: [0, 60, -80, 40, 0],
            y: [0, -40, 60, -50, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${themeColors.glow3} 0%, rgba(0,0,0,0) 70%)`,
            filter: "blur(130px)",
            top: "25%",
            left: "30%",
          }}
        />

        <motion.div
          animate={{
            x: [0, -50, 70, -30, 0],
            y: [0, 50, -60, 30, 0],
            scale: [1, 1.05, 0.95, 1.02, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${themeColors.glow4} 0%, rgba(0,0,0,0) 70%)`,
            filter: "blur(120px)",
            top: "55%",
            left: "55%",
          }}
        />

        {/* Orbiting geometric shapes */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "300px",
            height: "300px",
            pointerEvents: "none",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`orbit-${i}`}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20 + i * 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: i % 2 === 0 ? "8px" : "12px",
                    height: i % 2 === 0 ? "8px" : "12px",
                    borderRadius: i % 2 === 0 ? "50%" : "30%",
                    background: `radial-gradient(circle, ${themeColors.accent}, transparent)`,
                    opacity: 0.15 + i * 0.05,
                    left: "50%",
                    top: "-10px",
                    transform: "translateX(-50%)",
                    boxShadow: `0 0 20px ${themeColors.accent}`,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="particle"
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDelay: Math.random() * 10 + "s",
              animationDuration: Math.random() * 8 + 6 + "s",
              width: Math.random() * 3 + 2 + "px",
              height: Math.random() * 3 + 2 + "px",
              opacity: 0,
            }}
          />
        ))}

        {/* Animated grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Language Toggle - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          position: "absolute",
          top: 24,
          right: lang?.startsWith('ar') ? "auto" : 24,
          left: lang?.startsWith('ar') ? 24 : "auto",
          zIndex: 20,
        }}
      >
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(255,255,255,0.05)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const nextLang = lang?.startsWith('ar') ? "en" : "ar";
            dispatch({ type: "SET_LANGUAGE", payload: nextLang });
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(4, 7, 18, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: 16,
            padding: "10px 20px",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          <Globe size={16} style={{ color: "var(--theme-accent)" }} />
          <span style={{ letterSpacing: "0.5px" }}>
            {lang?.startsWith('ar') ? "English" : "العربية"}
          </span>
          <motion.div
            animate={{ rotate: lang?.startsWith('ar') ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12l7-7 7 7" stroke="rgba(255,255,255,0.3)" />
            </svg>
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 28,
          position: "relative",
          overflow: "hidden",
          zIndex: 10,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Animated gradient border - STATIC POSITION */}
        <div className="card-border-gradient" />

        {/* Inner glow */}
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: `radial-gradient(circle, ${themeColors.accent}10, transparent 70%)`,
            pointerEvents: "none",
            borderRadius: "50%",
            zIndex: 1,
          }}
        />

        {/* Cut effects for register form - appears as cut from top and bottom */}
        {activeForm === "register" && portal === "user" && (
          <>
            <div className="register-cut-top" />
            <div className="register-cut-bottom" />
          </>
        )}

        {/* Content wrapper with relative z-index to sit above the border */}
        <div
          className="glass-card-content"
          style={{
            position: "relative",
            zIndex: 2,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "40px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* Decorative icons floating in card */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              opacity: 0.05,
              fontSize: 60,
              pointerEvents: "none",
            }}
          >
            {portal === "superadmin" ? "👑" : portal === "admin" ? "🛡️" : "✨"}
          </div>

          {/* Logo Section - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              justifyContent: "center",
              position: "relative",
            }}
          >
            {(() => {
              const brandData = resolvedBrand;
              const logoDisplayMode =
                brandData?.logoDisplayMode || state?.logoDisplayMode || "both";
              const showLogo =
                (brandData?.logoUrl ||
                  brandData?.logo ||
                  brandData?.photoURL) &&
                (logoDisplayMode === "both" || logoDisplayMode === "logo");
              const showText =
                logoDisplayMode === "both" || logoDisplayMode === "text";

              if (showLogo) {
                return (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <img
                      src={
                        brandData.logoUrl ||
                        brandData.logo ||
                        brandData.photoURL
                      }
                      alt="Brand Logo"
                      style={{
                        maxHeight: "52px",
                        maxWidth: "180px",
                        width: "auto",
                        objectFit: "contain",
                        borderRadius: "10px",
                        filter: "drop-shadow(0 0 20px rgba(255,255,255,0.05))",
                      }}
                    />
                    {showText && (
                      <span
                        style={{
                          fontSize: "22px",
                          fontWeight: 800,
                          background: `linear-gradient(135deg, #fff, ${themeColors.accent})`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {brandData?.brandName}
                      </span>
                    )}
                  </motion.div>
                );
              }
              return (
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Logo
                    size={48}
                    showText={showText}
                    lang={lang}
                    text={brandData?.brandName}
                  />
                </motion.div>
              );
            })()}
          </motion.div>

          {/* Portal badge indicator - Enhanced */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            style={{ textAlign: "center", marginBottom: 28 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background:
                  portal === "superadmin"
                    ? "rgba(245, 158, 11, 0.08)"
                    : portal === "admin"
                      ? "rgba(16, 185, 129, 0.08)"
                      : "rgba(99, 102, 241, 0.08)",
                border:
                  portal === "superadmin"
                    ? "1px solid rgba(245, 158, 11, 0.12)"
                    : portal === "admin"
                      ? "1px solid rgba(16, 185, 129, 0.12)"
                      : "1px solid rgba(99, 102, 241, 0.12)",
                borderRadius: 24,
                padding: "8px 20px",
                fontSize: 12,
                color:
                  portal === "superadmin"
                    ? "var(--amber, #F59E0B)"
                    : portal === "admin"
                      ? "var(--green)"
                      : "var(--accent)",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    portal === "superadmin"
                      ? "var(--amber, #F59E0B)"
                      : portal === "admin"
                        ? "var(--green)"
                        : "var(--accent)",
                  boxShadow: `0 0 12px ${portal === "superadmin" ? "#F59E0B" : portal === "admin" ? "#10B981" : "#6366F1"}`,
                }}
              />
              {config.badgeText}
            </motion.div>
          </motion.div>

          {/* Form selection Tab Toggle - Enhanced */}
          {portal === "user" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                borderRadius: 16,
                padding: "4px",
                marginBottom: "28px",
                gap: "4px",
                backdropFilter: "blur(10px)",
                position: "relative",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setActiveForm("login")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  background:
                    activeForm === "login"
                      ? `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.accent}dd)`
                      : "transparent",
                  color:
                    activeForm === "login" ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {activeForm === "login" && (
                  <motion.div
                    layoutId="activeTab"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.accent}dd)`,
                      borderRadius: "12px",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {activeTrans.loginTab}
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setActiveForm("register")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  background:
                    activeForm === "register"
                      ? `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.accent}dd)`
                      : "transparent",
                  color:
                    activeForm === "register"
                      ? "#fff"
                      : "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {activeForm === "register" && (
                  <motion.div
                    layoutId="activeTab"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.accent}dd)`,
                      borderRadius: "12px",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {activeTrans.registerTab}
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Forms Switcher with Animation */}
          <AnimatePresence mode="wait">
            {activeForm === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div className="field">
                  <label
                    style={{
                      fontWeight: "700",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 8,
                      display: "block",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {activeTrans.emailLabel}
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Mail
                      size={18}
                      style={{
                        position: "absolute",
                        [lang?.startsWith('ar') ? "right" : "left"]: "14px",
                        color: "rgba(255, 255, 255, 0.3)",
                        transition: "color 0.3s ease",
                      }}
                    />
                    <input
                      className="field-input glass-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      dir="ltr"
                      autoComplete="email"
                      disabled={isLoading}
                      style={{
                        textAlign: "left",
                        [lang?.startsWith('ar') ? "paddingRight" : "paddingLeft"]:
                          "46px",
                        height: "50px",
                        borderRadius: "14px",
                        width: "100%",
                        fontSize: "15px",
                      }}
                    />
                  </motion.div>
                </div>

                <div className="field">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <label
                      style={{
                        fontWeight: "700",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.7)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {activeTrans.passwordLabel}
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordEmail(email);
                        setIsForgotPasswordOpen(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: themeColors.accent,
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {lang?.startsWith('ar') ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                    </button>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Lock
                      size={18}
                      style={{
                        position: "absolute",
                        [lang?.startsWith('ar') ? "right" : "left"]: "14px",
                        color: "rgba(255, 255, 255, 0.3)",
                        transition: "color 0.3s ease",
                      }}
                    />
                    <input
                      className="field-input glass-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      autoComplete="current-password"
                      disabled={isLoading}
                      style={{
                        textAlign: "left",
                        [lang?.startsWith('ar') ? "paddingRight" : "paddingLeft"]:
                          "46px",
                        [lang?.startsWith('ar') ? "paddingLeft" : "paddingRight"]:
                          "46px",
                        height: "50px",
                        borderRadius: "14px",
                        width: "100%",
                        fontSize: "15px",
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        [lang?.startsWith('ar') ? "left" : "right"]: "14px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255, 255, 255, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        padding: 4,
                        transition: "color 0.3s ease",
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </motion.button>
                  </motion.div>
                </div>

                {portal === "superadmin" ? (
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow:
                        "0 0 40px rgba(245, 158, 11, 0.15), inset 0 0 20px rgba(255,255,255,0.02)",
                      borderColor: "rgba(245, 158, 11, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    style={{
                      marginTop: 12,
                      height: "52px",
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#FFFFFF",
                      background: "linear-gradient(135deg, #111827, #1F2937)",
                      border: "1px solid rgba(245, 158, 11, 0.15)",
                      borderRadius: "14px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                      position: "relative",
                      overflow: "hidden",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      letterSpacing: "0.5px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "10%",
                        right: "10%",
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)",
                        animation: "shimmer 3s linear infinite",
                        backgroundSize: "200% 100%",
                      }}
                    />

                    {isLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                        }}
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{ display: "flex" }}
                        >
                          <Sparkles
                            size={18}
                            style={{ color: "var(--amber, #F59E0B)" }}
                          />
                        </motion.span>
                        {activeTrans.loggingIn}
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Crown
                          size={18}
                          style={{ color: "var(--amber, #F59E0B)" }}
                        />
                        {activeTrans.loginBtn}
                      </span>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 0 40px ${themeColors.accent}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
                    }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={isLoading}
                    style={{
                      marginTop: 12,
                      height: "52px",
                      fontSize: 14,
                      fontWeight: 800,
                      opacity: isLoading ? 0.7 : 1,
                      background: config.gradient,
                      border: "none",
                      borderRadius: "14px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      color: "#fff",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                        transform: "translateX(-100%)",
                        animation: "shimmer 3s ease-in-out infinite",
                        backgroundSize: "200% 100%",
                      }}
                    />
                    {isLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                        }}
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{ display: "flex" }}
                        >
                          <Sparkles size={18} />
                        </motion.span>
                        {activeTrans.loggingIn}
                      </span>
                    ) : (
                      activeTrans.loginBtn
                    )}
                  </motion.button>
                )}
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div className="field">
                  <label
                    style={{
                      fontWeight: "700",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 8,
                      display: "block",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {activeTrans.nameLabel}
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <User
                      size={18}
                      style={{
                        position: "absolute",
                        [lang?.startsWith('ar') ? "right" : "left"]: "14px",
                        color: "rgba(255, 255, 255, 0.3)",
                      }}
                    />
                    <input
                      className="field-input glass-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={activeTrans.namePlaceholder}
                      disabled={isLoading}
                      style={{
                        [lang?.startsWith('ar') ? "paddingRight" : "paddingLeft"]:
                          "46px",
                        height: "50px",
                        borderRadius: "14px",
                        width: "100%",
                        fontSize: "15px",
                      }}
                    />
                  </motion.div>
                </div>

                <div className="field">
                  <label
                    style={{
                      fontWeight: "700",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 8,
                      display: "block",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {activeTrans.emailLabel}
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Mail
                      size={18}
                      style={{
                        position: "absolute",
                        [lang?.startsWith('ar') ? "right" : "left"]: "14px",
                        color: "rgba(255, 255, 255, 0.3)",
                      }}
                    />
                    <input
                      className="field-input glass-input"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="your@email.com"
                      dir="ltr"
                      autoComplete="email"
                      disabled={isLoading}
                      style={{
                        textAlign: "left",
                        [lang?.startsWith('ar') ? "paddingRight" : "paddingLeft"]:
                          "46px",
                        height: "50px",
                        borderRadius: "14px",
                        width: "100%",
                        fontSize: "15px",
                      }}
                    />
                  </motion.div>
                </div>

                <div className="field">
                  <label
                    style={{
                      fontWeight: "700",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 8,
                      display: "block",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {activeTrans.phoneLabel}
                  </label>
                  <PhoneInput
                    phoneKey={registerPhoneKey}
                    setPhoneKey={setRegisterPhoneKey}
                    phoneNumber={registerPhone}
                    setPhoneNumber={setRegisterPhone}
                    disabled={isLoading}
                    placeholder={activeTrans.phonePlaceholder}
                  />
                </div>

                <div className="field">
                  <label
                    style={{
                      fontWeight: "700",
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 8,
                      display: "block",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {activeTrans.passwordLabel}
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Lock
                      size={18}
                      style={{
                        position: "absolute",
                        [lang?.startsWith('ar') ? "right" : "left"]: "14px",
                        color: "rgba(255, 255, 255, 0.3)",
                      }}
                    />
                    <input
                      className="field-input glass-input"
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      autoComplete="new-password"
                      disabled={isLoading}
                      style={{
                        textAlign: "left",
                        [lang?.startsWith('ar') ? "paddingRight" : "paddingLeft"]:
                          "46px",
                        [lang?.startsWith('ar') ? "paddingLeft" : "paddingRight"]:
                          "46px",
                        height: "50px",
                        borderRadius: "14px",
                        width: "100%",
                        fontSize: "15px",
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        [lang?.startsWith('ar') ? "left" : "right"]: "14px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255, 255, 255, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        padding: 4,
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </motion.button>
                  </motion.div>
                </div>

                {/* TERMS CHECKBOX */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', marginTop: '10px' }}>
                  <div
                    onClick={() => setAcceptedTerms(!acceptedTerms)}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: `1.5px solid ${acceptedTerms ? 'var(--accent, #3B82F6)' : 'rgba(255,255,255,0.3)'}`,
                      background: acceptedTerms ? 'var(--accent, #3B82F6)' : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    {acceptedTerms && <Check size={14} color="#fff" />}
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                    {lang?.startsWith('ar') ? 'أوافق على ' : 'I agree to the '}
                    <span 
                      onClick={() => setShowTermsModal(true)}
                      style={{ color: 'var(--accent, #3B82F6)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {lang?.startsWith('ar') ? 'الشروط والأحكام وسياسة الخصوصية' : 'Terms & Conditions and Privacy Policy'}
                    </span>
                  </span>
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 0 40px ${themeColors.accent}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={isLoading}
                  style={{
                    marginTop: 12,
                    height: "52px",
                    fontSize: 14,
                    fontWeight: 800,
                    opacity: isLoading ? 0.7 : 1,
                    background: config.gradient,
                    border: "none",
                    borderRadius: "14px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    letterSpacing: "0.5px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                      transform: "translateX(-100%)",
                      animation: "shimmer 3s ease-in-out infinite",
                      backgroundSize: "200% 100%",
                    }}
                  />
                  {isLoading ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                      }}
                    >
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{ display: "flex" }}
                      >
                        <Sparkles size={18} />
                      </motion.span>
                      {activeTrans.registering}
                    </span>
                  ) : (
                    activeTrans.registerBtn
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* WhatsApp Activation Section - Enhanced */}
          {portal === "user" &&
            adminPhone &&
            resolvedBrand?.showWhatsappLoginBtn !== false && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  marginTop: "28px",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "10px",
                    letterSpacing: "0.5px",
                    fontWeight: 600,
                  }}
                >
                  {activeTrans.whatsappPrompt}
                </div>
                <motion.a
                  whileHover={{
                    scale: 1.02,
                    background: "rgba(16, 185, 129, 0.12)",
                    borderColor: "rgba(16, 185, 129, 0.3)",
                    boxShadow: "0 0 30px rgba(16, 185, 129, 0.05)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://wa.me/${adminPhone.replace(/\+/g, "").trim()}?text=${encodeURIComponent(
                    lang === "en"
                      ? `Hello, I want to activate my subscription in the platform ${adminBrandName}`
                      : `مرحباً، أريد تفعيل اشتراكي في منصة ${adminBrandName}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid rgba(16, 185, 129, 0.12)",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    color: "var(--green)",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease",
                    letterSpacing: "0.3px",
                  }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: "18px" }}
                  >
                    💬
                  </motion.span>
                  {activeTrans.whatsappBtn}
                </motion.a>
              </motion.div>
            )}

          {/* Footer - Enhanced */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: "0.3px",
            }}
          >
            <motion.span
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🔒
            </motion.span>
            <span>{activeTrans.securedBy}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* FORGOT PASSWORD RECOVERY MODAL */}
      {isForgotPasswordOpen && (
        <div
          className="es-confirm-backdrop"
          dir={lang?.startsWith('ar') ? "rtl" : "ltr"}
          onClick={() => setIsForgotPasswordOpen(false)}
        >
          <div
            className="es-modal-card"
            style={{
              maxWidth: "440px",
              background: "#0F172A",
              border: `1px solid ${themeColors.accent}`,
              borderRadius: "20px",
              padding: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="es-modal-header"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "10px",
                    background: `${themeColors.accent}20`,
                    color: themeColors.accent,
                  }}
                >
                  <Key size={20} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: "#FFF",
                      fontSize: "15px",
                      fontWeight: "800",
                    }}
                  >
                    {lang?.startsWith('ar')
                      ? "استعادة كلمة المرور"
                      : "Reset Account Password"}
                  </h3>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                    {portal === "superadmin"
                      ? "Super Admin Portal"
                      : portal === "admin"
                        ? "Admin Management Portal"
                        : "User Member Portal"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleForgotPasswordSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginTop: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#FFF",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  {lang?.startsWith('ar')
                    ? "البريد الإلكتروني المسجل:"
                    : "Registered Email Address:"}
                </label>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Mail
                    size={16}
                    color="#64748B"
                    style={{
                      position: "absolute",
                      [lang?.startsWith('ar') ? "right" : "left"]: "12px",
                    }}
                  />
                  <input
                    type="email"
                    className="field-input glass-input"
                    placeholder="name@company.com"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    dir="ltr"
                    style={{
                      width: "100%",
                      height: "46px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      [lang?.startsWith('ar') ? "paddingRight" : "paddingLeft"]: "38px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "11px",
                  color: "#94A3B8",
                  lineHeight: 1.5,
                }}
              >
                {lang?.startsWith('ar')
                  ? "سيتم فحص صلاحيات البريد مع نوع الحساب، ثم إرسال رابط الاستعادة الرسمي مباشرة إلى بريدك ."
                  : "Role authorization will be verified, then a secure password reset link will be dispatched "}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  style={{
                    flex: 1,
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    color: "#FFF",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  {lang?.startsWith('ar') ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={isSendingReset}
                  style={{
                    flex: 1.5,
                    height: "44px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${themeColors.accent}, #7C3AED)`,
                    border: "none",
                    color: "#FFF",
                    fontSize: "12px",
                    fontWeight: "900",
                    cursor: isSendingReset ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Send size={14} />
                  <span>
                    {isSendingReset
                      ? lang?.startsWith('ar')
                        ? "جاري الإرسال..."
                        : "Sending..."
                      : lang?.startsWith('ar')
                        ? "إرسال رابط الاستعادة"
                        : "Send Reset Link"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TERMS MODAL */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: 'var(--bg2, #0D1220)',
                width: '100%',
                maxWidth: '700px',
                borderRadius: '24px',
                border: '1px solid var(--line, rgba(255,255,255,0.08))',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '24px',
                borderBottom: '1px solid var(--line, rgba(255,255,255,0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--text, #fff)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--accent, #3B82F6)" />
                  {lang?.startsWith('ar') ? 'الشروط والأحكام وسياسة الخصوصية' : 'Terms & Conditions'}
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: 'var(--text2, #94A3B8)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text2, #94A3B8)'; }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="custom-scrollbar" style={{
                padding: '24px',
                maxHeight: '75vh',
                overflowY: 'auto'
              }}>
                <TermsContent isRtl={lang?.startsWith('ar')} />
              </div>
              
              {/* Modal Footer */}
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--line, rgba(255,255,255,0.08))',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setAcceptedTerms(true);
                    setShowTermsModal(false);
                  }}
                  style={{
                    background: 'var(--accent, #3B82F6)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Check size={16} />
                  {lang?.startsWith('ar') ? 'موافق' : 'I Agree'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

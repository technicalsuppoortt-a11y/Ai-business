import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase";
import { libraryStorage } from "../../firebaseLibrary";
import { JOURNEY_STEPS } from "../../data/database";
import { TOOLS_24H } from "../../data/toolsData";
import { useApp } from "../../context/AppContext";
import { useConfirm } from "../../context/ConfirmContext";
import { saveAdminOpenAiKey, getAdminOpenAiKey } from "../../services/creditsService";
import AdminSales from "./AdminSales";
import AdminLibrary from "./AdminLibrary";
import Pagination from "../../components/common/Pagination";
import PhoneInput from "../../components/PhoneInput";
import PlatformExplanation from "../../components/common/PlatformExplanation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  TrendingUp,
  Tag,
  Gift,
  CreditCard,
  Settings,
  Tv,
  Library,
  LogOut,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Package,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Download,
  UserPlus,
  Eye,
  EyeOff,
  Wallet,
  Smartphone,
  Edit,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Shield,
  User,
  Mail,
  Key,
  Calendar,
  Activity,
  Building,
  AlertTriangle,
  Globe,
  UploadCloud,
  Gem,
  Ban,
  Save,
  Loader2,
  Filter,
  PlusCircle,
  Plus,
  RefreshCw,
  DollarSign,
  List,
  Check,
  Lock,
  Unlock,
  Layers,
  Zap,
  Target,
  ShoppingBag,
  Briefcase,
  Cpu,
  BookOpen,
  Rocket,
  FileText,
  Scale,
  Share2,
  Calculator,
  MessageCircle,
  Image,
  Compass,
  Video,
  Send,
  Bot,
  ExternalLink,
  Power,
  Crosshair,
  Award,
  Mic,
  Copy,
  Laptop,
  Tablet,
  Palette,
  Layout,
  Database,
} from "lucide-react";
import "./Admin.css";

// Animated Counter Component that starts from 0 to target value
function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return <span>{count}</span>;
}

// Vector Icon Mapping Helper for Tools & Features (Replaces Emojis)
function getToolVectorIcon(item, size = 18) {
  if (!item) return <Layers size={size} style={{ color: "var(--accent)" }} />;

  const id = (item.id || "").toLowerCase();

  // Specific Unique Vector Icons for Every Tool
  switch (id) {
    case "onboarding":
      return <Rocket size={size} style={{ color: "#3b82f6" }} />;
    case "analysis-identity":
      return <Target size={size} style={{ color: "#06b6d4" }} />;
    case "website-construction":
      return <Globe size={size} style={{ color: "#3b82f6" }} />;
    case "landing-page-content":
      return <FileText size={size} style={{ color: "#8b5cf6" }} />;
    case "legal-pages":
      return <Scale size={size} style={{ color: "#f59e0b" }} />;
    case "social-integration":
      return <Share2 size={size} style={{ color: "#ec4899" }} />;
    case "email-setup":
      return <Mail size={size} style={{ color: "#10b981" }} />;
    case "product-source":
      return <Package size={size} style={{ color: "#f97316" }} />;
    case "profit-calculator":
      return <Calculator size={size} style={{ color: "#10b981" }} />;
    case "social-presence":
      return <MessageCircle size={size} style={{ color: "#06b6d4" }} />;
    case "content-factory":
      return <Image size={size} style={{ color: "#a855f7" }} />;
    case "marketing-plan":
      return <Compass size={size} style={{ color: "#3b82f6" }} />;
    case "ad-creative":
      return <Video size={size} style={{ color: "#f43f5e" }} />;
    case "campaign-launch":
      return <Send size={size} style={{ color: "#10b981" }} />;
    case "smart-ai-assistant":
      return <Bot size={size} style={{ color: "#6366f1" }} />;
    case "external-tools":
      return <ExternalLink size={size} style={{ color: "#64748b" }} />;
    case "freelance-profile":
      return <UserCheck size={size} style={{ color: "#3b82f6" }} />;
    case "platform-radar":
      return <Crosshair size={size} style={{ color: "#ef4444" }} />;
    case "freelance-pricing":
      return <Tag size={size} style={{ color: "#eab308" }} />;
    case "skills-crafting":
      return <Award size={size} style={{ color: "#f59e0b" }} />;
    case "portfolio-builder":
      return <Briefcase size={size} style={{ color: "#06b6d4" }} />;
    case "proposal-sniper":
      return <Zap size={size} style={{ color: "#ec4899" }} />;
    case "interview-prep":
      return <Mic size={size} style={{ color: "#8b5cf6" }} />;
    case "sales-templates":
      return <Copy size={size} style={{ color: "#10b981" }} />;
    case "brand-library":
      return <Library size={size} style={{ color: "#3b82f6" }} />;
    case "smart-notebook":
      return <BookOpen size={size} style={{ color: "#a855f7" }} />;
    default:
      break;
  }

  // Fallback Keyword Matches
  if (id.includes("niche") || id.includes("target"))
    return <Target size={size} style={{ color: "#06b6d4" }} />;
  if (
    id.includes("product") ||
    id.includes("source") ||
    id.includes("supplier")
  )
    return <Package size={size} style={{ color: "#f97316" }} />;
  if (id.includes("store") || id.includes("shop") || id.includes("cart"))
    return <ShoppingBag size={size} style={{ color: "#ec4899" }} />;
  if (id.includes("ad") || id.includes("creative") || id.includes("copy"))
    return <Sparkles size={size} style={{ color: "#f59e0b" }} />;
  if (id.includes("calc") || id.includes("profit") || id.includes("price"))
    return <Calculator size={size} style={{ color: "#10b981" }} />;
  if (id.includes("ai") || id.includes("bot"))
    return <Bot size={size} style={{ color: "#6366f1" }} />;
  if (id.includes("freelance") || id.includes("profile"))
    return <Briefcase size={size} style={{ color: "#06b6d4" }} />;

  return <Layers size={size} style={{ color: "var(--accent)" }} />;
}

// Custom Glassmorphic Select Component
function CustomSelect({ options, value, onChange, label, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="ad-custom-select-wrapper" ref={containerRef}>
      {label && <label className="ad-custom-select-label">{label}</label>}
      <button
        type="button"
        className={`ad-custom-select-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            overflow: "hidden",
          }}
        >
          {selectedOption?.icon ? (
            <selectedOption.icon
              size={16}
              style={{ color: "var(--accent)", flexShrink: 0 }}
            />
          ) : Icon ? (
            <Icon size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
          ) : null}
          <span className="ad-custom-select-value">
            {selectedOption ? selectedOption.label : ""}
          </span>
        </div>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            color: isOpen ? "var(--accent)" : "var(--text2)",
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ad-custom-select-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {options.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = value === option.value;
              return (
                <div
                  key={option.value}
                  className={`ad-custom-select-option ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {OptionIcon && (
                      <OptionIcon
                        size={15}
                        style={{
                          color: isSelected ? "var(--accent)" : "var(--text3)",
                          transition: "color 0.2s",
                        }}
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2
                      size={14}
                      style={{ color: "var(--accent)" }}
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { state, dispatch } = useApp();
  const { adminUserData: userData, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUserDetails, setViewingUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("admin-active-tab") || "users",
  ); // Keep active tab on reload

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem("admin-active-tab", tabId);
    if (isMobile) setIsMobileMenuOpen(false);
  };

  // User Management Advanced Filters & Search
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Custom Delete Confirmation State
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("admin-sidebar-collapsed") === "true",
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [ownerNameForm, setOwnerNameForm] = useState("");
  const [brandNameForm, setBrandNameForm] = useState("");
  const [brandUrlForm, setBrandUrlForm] = useState("");
  const [masterApiKey, setMasterApiKey] = useState("");
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [renewPlanUser, setRenewPlanUser] = useState(null);
  const [renewPlanId, setRenewPlanId] = useState("free");
  const [isRenewing, setIsRenewing] = useState(false);
  const [accentColor, setAccentColor] = useState("#3B82F6");
  const [successColor, setSuccessColor] = useState("#10B981");
  const [bgColor, setBgColor] = useState("#080C14");
  const [sidebarColor, setSidebarColor] = useState("#0D1220");
  const [fontFamily, setFontFamily] = useState("Cairo");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [lineColor, setLineColor] = useState("#1e293b");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    tiktok: "",
  });
  const [defaultLanguage, setDefaultLanguage] = useState("ar");
  const [landingTemplate, setLandingTemplate] = useState("default");
  const [logoDisplayMode, setLogoDisplayMode] = useState("both");
  const [showWhatsappLoginBtn, setShowWhatsappLoginBtn] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // For creating/editing users
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (profileImage) {
      const url = URL.createObjectURL(profileImage);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (editingUser?.photoURL) {
      setPhotoPreview(editingUser.photoURL);
    } else {
      setPhotoPreview(null);
    }
  }, [profileImage, editingUser]);

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setPhotoPreview(null);
    const fileInput = document.getElementById("userProfileImg");
    if (fileInput) fileInput.value = "";
  };
  const [adminProfileImage, setAdminProfileImage] = useState(null); // For admin's own profile
  const [phoneNumberForm, setPhoneNumberForm] = useState("");
  const [phoneKeyForm, setPhoneKeyForm] = useState("+20");

  const [iframeKey, setIframeKey] = useState(0);

  // Debounced auto-refresh for the iframe to fully update subcomponents after color changes stop
  useEffect(() => {
    const handler = setTimeout(() => {
      setIframeKey((prev) => prev + 1);
    }, 1200);
    return () => clearTimeout(handler);
  }, [
    accentColor,
    successColor,
    bgColor,
    sidebarColor,
    fontFamily,
    textColor,
    lineColor,
  ]);

  // Real-time instant injector for live colors in the iframe without waiting for refresh
  useEffect(() => {
    const iframe = document.getElementById("preview-iframe");
    if (iframe && iframe.contentWindow) {
      try {
        const root = iframe.contentWindow.document.documentElement;
        if (root) {
          root.style.setProperty("--accent", accentColor);
          root.style.setProperty("--green", successColor);
          root.style.setProperty("--bg", bgColor);
          root.style.setProperty("--bg2", sidebarColor);
          root.style.setProperty("--font", fontFamily);
          root.style.setProperty("--text", textColor);
          root.style.setProperty("--line", lineColor);
        }
      } catch (err) {
        // Safe cross-origin check
      }
    }
  }, [
    accentColor,
    successColor,
    bgColor,
    sidebarColor,
    fontFamily,
    textColor,
    lineColor,
  ]);

  const handleIframeLoad = () => {
    const iframe = document.getElementById("preview-iframe");
    if (iframe && iframe.contentWindow) {
      try {
        const root = iframe.contentWindow.document.documentElement;
        if (root) {
          root.style.setProperty("--accent", accentColor);
          root.style.setProperty("--green", successColor);
          root.style.setProperty("--bg", bgColor);
          root.style.setProperty("--bg2", sidebarColor);
          root.style.setProperty("--font", fontFamily);
          root.style.setProperty("--text", textColor);
          root.style.setProperty("--line", lineColor);
        }
      } catch (err) {
        console.error("Failed to inject iframe style:", err);
      }
    }
  };

  const confirm = useConfirm();

  // Plans management
  const [plans, setPlans] = useState([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planName, setPlanName] = useState("");
  const [planNameEn, setPlanNameEn] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planCredits, setPlanCredits] = useState("20");
  const [planCurrency, setPlanCurrency] = useState("EGP");
  const [planFeatures, setPlanFeatures] = useState("");
  const [planFeaturesEn, setPlanFeaturesEn] = useState("");
  const [planPaddlePriceId, setPlanPaddlePriceId] = useState("");

  // Plans Filtering, Pagination & Modal States
  const [plansSearchQuery, setPlansSearchQuery] = useState("");
  const [plansCurrencyFilter, setPlansCurrencyFilter] = useState("all");
  const [plansCurrentPage, setPlansCurrentPage] = useState(1);
  const [viewingPlanFeatures, setViewingPlanFeatures] = useState(null);
  const [dynamicFeaturesAr, setDynamicFeaturesAr] = useState([""]);
  const [dynamicFeaturesEn, setDynamicFeaturesEn] = useState([""]);

  // Reset page when filters change
  useEffect(() => {
    setPlansCurrentPage(1);
  }, [plansSearchQuery, plansCurrencyFilter]);

  // Prevent multiple state initializations
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchAdminKey = async () => {
      const key = await getAdminOpenAiKey();
      if (key) setMasterApiKey(key);
    };
    fetchAdminKey();
  }, []);

  // Subscription management for sub-users
  const [subType, setSubType] = useState("monthly");
  const [subDays, setSubDays] = useState(30);
  const [userPlanId, setUserPlanId] = useState("free");

  // Free Trial Settings
  const [freeTrialDays, setFreeTrialDays] = useState(7);
  const [allowedTrialTools, setAllowedTrialTools] = useState([]);
  const [autoIncludeNewTools, setAutoIncludeNewTools] = useState(true);
  const [isTrialPreviewModalOpen, setIsTrialPreviewModalOpen] = useState(false);
  const [previewModalTab, setPreviewModalTab] = useState("all");
  const [expandedTrialGroups, setExpandedTrialGroups] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  // Payment Methods Standardized State & DEFAULTS
  const [paymentMethods, setPaymentMethods] = useState({
    instapay: { enabled: false, address: "" },
    vodafoneCash: { enabled: false, number: "" },
    stripe: {
      enabled: false,
      publishableKey: "",
      secretKey: "",
      paymentLink: "",
      paymentLinkAnnual: "",
    },
    paypal: { enabled: false, email: "" },
    paddle: {
      enabled: false,
      connected: false,
      sellerId: "",
      vendorId: "",
      clientToken: "",
      priceIdMonthly: "",
      priceIdAnnual: "",
    },
  });
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [showPaddleManual, setShowPaddleManual] = useState(false);

  // Tenant Payment Methods Firestore Sync & OAuth Callback
  useEffect(() => {
    const fetchTenantPaymentMethods = async () => {
      const uid = userData?.uid || state?.user?.uid;
      if (!uid) return;

      const DEFAULTS = {
        instapay: { enabled: false, address: "" },
        vodafoneCash: { enabled: false, number: "" },
        stripe: {
          enabled: false,
          publishableKey: "",
          secretKey: "",
          paymentLink: "",
          paymentLinkAnnual: "",
        },
        paypal: { enabled: false, email: "" },
        paddle: {
          enabled: false,
          connected: false,
          sellerId: "",
          vendorId: "",
          clientToken: "",
          priceIdMonthly: "",
          priceIdAnnual: "",
        },
      };

      try {
        const tenantRef = doc(db, "tenants", uid);
        const snap = await getDoc(tenantRef);

        const searchParams = new URLSearchParams(window.location.search);
        const isPaddleOAuth =
          searchParams.get("code") === "pdl_auth_mock123456" &&
          searchParams.get("state") === "PADDLE_OAUTH";

        let loadedPM = DEFAULTS;

        if (snap.exists() && snap.data()?.paymentMethods) {
          const pmData = snap.data().paymentMethods;
          loadedPM = {
            instapay: { ...DEFAULTS.instapay, ...(pmData.instapay || {}) },
            vodafoneCash: {
              ...DEFAULTS.vodafoneCash,
              ...(pmData.vodafoneCash || {}),
            },
            stripe: { ...DEFAULTS.stripe, ...(pmData.stripe || {}) },
            paypal: { ...DEFAULTS.paypal, ...(pmData.paypal || {}) },
            paddle: { ...DEFAULTS.paddle, ...(pmData.paddle || {}) },
          };
        }

        if (isPaddleOAuth) {
          loadedPM = {
            ...loadedPM,
            paddle: {
              ...loadedPM.paddle,
              enabled: true,
              connected: true,
              sellerId: loadedPM.paddle.sellerId || "987654",
              vendorId: loadedPM.paddle.vendorId || "987654",
              clientToken:
                loadedPM.paddle.clientToken ||
                "pt_mock_token_paddle_xyz789",
              priceIdMonthly:
                loadedPM.paddle.priceIdMonthly ||
                "pri_01h8m3v4x5y6z7a8b9c0d1e2f3",
              priceIdAnnual:
                loadedPM.paddle.priceIdAnnual ||
                "pri_01h8m3v4x5y6z7a8b9c0d1e2f4",
            },
          };

          await setDoc(
            tenantRef,
            { paymentMethods: loadedPM, updatedAt: serverTimestamp() },
            { merge: true },
          );

          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          toast(
            state.language === "en"
              ? "Paddle Connected Successfully!"
              : "تم ربط حساب Paddle بنجاح!",
            "success",
          );
        }

        setPaymentMethods(loadedPM);
      } catch (err) {
        console.error("Error fetching tenant payment methods:", err);
      }
    };

    fetchTenantPaymentMethods();
  }, [userData, state?.user]);

  const handleSavePaymentMethods = async () => {
    const uid = userData?.uid || state?.user?.uid;
    if (!uid) return;

    setPaymentSaving(true);
    setPaymentSaved(false);

    try {
      const tenantRef = doc(db, "tenants", uid);
      await setDoc(
        tenantRef,
        { paymentMethods, updatedAt: serverTimestamp() },
        { merge: true },
      );

      setPaymentSaved(true);
      toast(
        state.language === "en"
          ? "Payment settings saved successfully!"
          : "تم حفظ إعدادات طرق الدفع بنجاح!",
        "success",
      );
      setTimeout(() => setPaymentSaved(false), 3000);
    } catch (err) {
      console.error("Error saving payment methods:", err);
      toast(
        state.language === "en"
          ? "Failed to save settings"
          : "فشل حفظ الإعدادات",
        "error",
      );
    } finally {
      setPaymentSaving(false);
    }
  };

  const handlePaddleConnect = () => {
    const mockOAuthUrl = `${window.location.pathname}?code=pdl_auth_mock123456&state=PADDLE_OAUTH`;
    window.location.href = mockOAuthUrl;
  };

  const handlePaddleDisconnect = async () => {
    const DEFAULTS = {
      instapay: { enabled: false, address: "" },
      vodafoneCash: { enabled: false, number: "" },
      stripe: {
        enabled: false,
        publishableKey: "",
        secretKey: "",
        paymentLink: "",
        paymentLinkAnnual: "",
      },
      paypal: { enabled: false, email: "" },
      paddle: {
        enabled: false,
        connected: false,
        sellerId: "",
        vendorId: "",
        clientToken: "",
        priceIdMonthly: "",
        priceIdAnnual: "",
      },
    };

    const updatedPM = {
      ...paymentMethods,
      paddle: {
        ...DEFAULTS.paddle,
        enabled: false,
        connected: false,
      },
    };
    setPaymentMethods(updatedPM);
    setShowPaddleManual(false);

    const uid = userData?.uid || state?.user?.uid;
    if (uid) {
      try {
        await setDoc(
          doc(db, "tenants", uid),
          { paymentMethods: updatedPM, updatedAt: serverTimestamp() },
          { merge: true },
        );
        toast(
          state.language === "en"
            ? "Paddle disconnected"
            : "تم إلغاء ربط Paddle",
          "info",
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Legacy Payment Methods
  const [vodafoneWallet, setVodafoneWallet] = useState("");
  const [etisalatWallet, setEtisalatWallet] = useState("");
  const [orangeWallet, setOrangeWallet] = useState("");
  const [instapayWallet, setInstapayWallet] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [paddleVendorId, setPaddleVendorId] = useState("");
  const [paddleApiKey, setPaddleApiKey] = useState("");
  const [paddleClientKey, setPaddleClientKey] = useState("");
  const [paddleWebhookSecret, setPaddleWebhookSecret] = useState("");
  const [paddleEnvironment, setPaddleEnvironment] = useState("sandbox");
  const [paddleEnabled, setPaddleEnabled] = useState(false);
  const [isPaddleValidating, setIsPaddleValidating] = useState(false);
  const [isPaddleValidated, setIsPaddleValidated] = useState(false);
  const [paddleValidationError, setPaddleValidationError] = useState("");
  const [isPaddleSettingsModalOpen, setIsPaddleSettingsModalOpen] =
    useState(false);
  const [isSyncingStripe, setIsSyncingStripe] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentToApprove, setPaymentToApprove] = useState(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState("");
  const [selectedDurationForPayment, setSelectedDurationForPayment] =
    useState(30);
  const [isStripeSettingsModalOpen, setIsStripeSettingsModalOpen] =
    useState(false);

  // Payment Methods UI/UX Upgrade State
  const [paymentsSubTab, setPaymentsSubTab] = useState("transactions"); // 'transactions' | 'wallets' | 'gateways'
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [showPaddleKey, setShowPaddleKey] = useState(false);
  const [stripeModalTab, setStripeModalTab] = useState("settings"); // 'settings' | 'test'
  const [paddleModalTab, setPaddleModalTab] = useState("settings"); // 'settings' | 'test'
  const [isTestingStripe, setIsTestingStripe] = useState(false);
  const [stripeTestSuccess, setStripeTestSuccess] = useState(false);
  const [isTestingPaddle, setIsTestingPaddle] = useState(false);
  const [paddleTestSuccess, setPaddleTestSuccess] = useState(false);

  // Brand Settings Modernized UI States
  const [brandSubTab, setBrandSubTab] = useState("personal"); // 'personal' | 'colors' | 'social' | 'templates' | 'preview'
  const [brandPreviewDevice, setBrandPreviewDevice] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null);
  const [isLiveDemoModalOpen, setIsLiveDemoModalOpen] = useState(false);
  const [previewDemoTemplate, setPreviewDemoTemplate] = useState("default");

  // JSON Export for Brand Settings
  const handleExportBrandSettingsJSON = () => {
    const settingsData = {
      ownerName: ownerNameForm,
      brandName: brandNameForm,
      phoneNumber: `${phoneKeyForm}${phoneNumberForm}`,
      defaultLanguage,
      logoDisplayMode,
      showWhatsappLoginBtn,
      themeConfig: {
        accent: accentColor,
        success: successColor,
        bg: bgColor,
        sidebar: sidebarColor,
        fontFamily,
        text: textColor,
        line: lineColor,
      },
      socialLinks,
      landingTemplate,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(settingsData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `Brand_Settings_${brandNameForm || "Config"}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    toast(
      state.language === "en"
        ? "Brand Settings exported to JSON successfully!"
        : "تم تصدير إعدادات البراند إلى ملف JSON بنجاح!",
      "success",
    );
  };

  // JSON Import for Brand Settings
  const handleImportBrandSettingsJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.ownerName) setOwnerNameForm(imported.ownerName);
          if (imported.brandName) setBrandNameForm(imported.brandName);
          if (imported.defaultLanguage) setDefaultLanguage(imported.defaultLanguage);
          if (imported.logoDisplayMode) setLogoDisplayMode(imported.logoDisplayMode);
          if (imported.showWhatsappLoginBtn !== undefined)
            setShowWhatsappLoginBtn(imported.showWhatsappLoginBtn);
          if (imported.themeConfig) {
            if (imported.themeConfig.accent) setAccentColor(imported.themeConfig.accent);
            if (imported.themeConfig.success) setSuccessColor(imported.themeConfig.success);
            if (imported.themeConfig.bg) setBgColor(imported.themeConfig.bg);
            if (imported.themeConfig.sidebar) setSidebarColor(imported.themeConfig.sidebar);
            if (imported.themeConfig.fontFamily) setFontFamily(imported.themeConfig.fontFamily);
            if (imported.themeConfig.text) setTextColor(imported.themeConfig.text);
            if (imported.themeConfig.line) setLineColor(imported.themeConfig.line);
          }
          if (imported.socialLinks) setSocialLinks(imported.socialLinks);
          if (imported.landingTemplate) setLandingTemplate(imported.landingTemplate);
          toast(
            state.language === "en"
              ? "Brand settings imported from JSON! Click Save to apply changes."
              : "تم استيراد الإعدادات من ملف JSON! اضغط حفظ لتطبيق التغييرات.",
            "success",
          );
        } catch (err) {
          toast(
            state.language === "en"
              ? "Invalid JSON settings file."
              : "ملف الإعدادات غير صالح.",
            "error",
          );
        }
      };
    }
  };

  // Reset Brand Settings to Defaults
  const handleResetToDefaults = async () => {
    const confirmed = await confirm({
      title: state.language === "en" ? "Reset Brand Settings?" : "إعادة ضبط الإعدادات؟",
      message:
        state.language === "en"
          ? "Are you sure you want to reset all brand theme colors and settings to default values?"
          : "هل أنت تأكد من إرجاع جميع ألوان وتفضيلات البراند إلى القيم الافتراضية؟",
      confirmText: state.language === "en" ? "Reset to Defaults" : "إعادة الضبط",
      cancelText: state.language === "en" ? "Cancel" : "إلغاء",
      type: "warning",
    });

    if (confirmed) {
      setAccentColor("#3B82F6");
      setSuccessColor("#10B981");
      setBgColor("#080C14");
      setSidebarColor("#0D1220");
      setFontFamily("Cairo");
      setTextColor("#FFFFFF");
      setLineColor("#1e293b");
      setLogoDisplayMode("both");
      setShowWhatsappLoginBtn(true);
      setDefaultLanguage("ar");
      setLandingTemplate("default");
      toast(
        state.language === "en"
          ? "Theme colors & settings reset to defaults!"
          : "تمت إعادة ضبط الألوان والتفضيلات إلى القيم الافتراضية!",
        "success",
      );
    }
  };

  // Keyboard Shortcut: Ctrl+S / Cmd+S to Save Brand Settings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeTab === "settings") {
          handleUpdateAdminProfile();
          setLastSavedTimestamp(new Date());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // Helper function: Copy wallet number with toast feedback
  const handleCopyWallet = (number) => {
    if (!number) return;
    navigator.clipboard.writeText(number);
    toast(
      state.language === "en"
        ? `Copied ${number} to clipboard!`
        : `تم نسخ الرقم ${number} بنجاح!`,
      "success",
    );
  };

  // Helper function: Export Payments CSV
  const handleExportPaymentsCSV = () => {
    const filtered = pendingPayments.filter((p) => {
      const q = paymentSearchQuery.toLowerCase();
      const matchSearch =
        !paymentSearchQuery ||
        (p.userName || "").toLowerCase().includes(q) ||
        (p.userEmail || "").toLowerCase().includes(q) ||
        (p.userPhone || "").toLowerCase().includes(q);
      const matchStatus =
        paymentStatusFilter === "all" || p.status === paymentStatusFilter;
      return matchSearch && matchStatus;
    });

    const headers = [
      "Customer Name",
      "Email",
      "Phone",
      "Plan",
      "Amount",
      "Date",
      "Status",
    ];
    const rows = filtered.map((p) => [
      `"${(p.userName || "").replace(/"/g, '""')}"`,
      `"${(p.userEmail || "").replace(/"/g, '""')}"`,
      `"${(p.userPhone || "").replace(/"/g, '""')}"`,
      `"${(p.planName || p.plan || "Pro").replace(/"/g, '""')}"`,
      `"${p.amount || 0}"`,
      `"${
        p.createdAt?.seconds
          ? new Date(p.createdAt.seconds * 1000).toLocaleDateString("en-US")
          : ""
      }"`,
      `"${p.status || "pending"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Transactions_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(
      state.language === "en"
        ? "CSV Report Exported!"
        : "تم تصدير التقرير بنجاح!",
      "success",
    );
  };

  // Reset pagination when payment search/status changes
  useEffect(() => {
    setPaymentCurrentPage(1);
  }, [paymentSearchQuery, paymentStatusFilter, paymentsSubTab]);

  const ALL_STEPS = [...JOURNEY_STEPS, ...TOOLS_24H];
  const TOTAL_STEPS_COUNT = ALL_STEPS.length;

  const ADDITIONAL_RESOURCES = [
    {
      id: "brand-library",
      label_ar: "مكتبة المنتجات",
      label_en: "Product Library",
      section: "additional",
    },
    {
      id: "smart-notebook",
      label_ar: "دفتر الملاحظات الذكي",
      label_en: "Smart Notebook",
      section: "additional",
    },
  ];
  const CHECKLIST_ITEMS = [...ALL_STEPS, ...ADDITIONAL_RESOURCES];

  const DEFAULT_THEME = {
    accent: "#3B82F6",
    success: "#10B981",
    bg: "#080C14",
    sidebar: "#0D1220",
  };

  useEffect(() => {
    if (userData && !isInitialized) {
      setOwnerNameForm(userData.ownerName || "");
      setBrandNameForm(userData.brandName || "");
      setBrandUrlForm(userData.brandUrl || "");
      setDefaultLanguage(userData.defaultLanguage || "ar");
      setLogoDisplayMode(userData.logoDisplayMode || "both");
      setShowWhatsappLoginBtn(userData.showWhatsappLoginBtn !== false);

      const fullPhone = String(userData.phoneNumber || "");
      if (fullPhone.startsWith("+")) {
        const match = fullPhone.match(/^(\+\d{1,4})(.*)$/);
        if (match) {
          setPhoneKeyForm(match[1]);
          setPhoneNumberForm(match[2]);
        } else {
          setPhoneKeyForm("+20");
          setPhoneNumberForm(fullPhone);
        }
      } else {
        setPhoneKeyForm("+20");
        setPhoneNumberForm(fullPhone);
      }

      const theme = userData.themeConfig || {};
      setAccentColor(theme.accent || DEFAULT_THEME.accent);
      setSuccessColor(theme.success || DEFAULT_THEME.success);
      setBgColor(theme.bg || "#080C14");
      setSidebarColor(theme.sidebar || "#0D1220");
      setFontFamily(theme.fontFamily || "Cairo");
      setTextColor(theme.text || "#FFFFFF");
      setLineColor(theme.line || "#1e293b");
      setLandingTemplate(userData.landingTemplate || "default");
      setSocialLinks(
        userData.socialLinks || {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          tiktok: "",
        },
      );
      const pData = userData.plans;
      setPlans(
        Array.isArray(pData)
          ? pData
          : [
              {
                id: 1,
                name: "الباقة الفضية",
                price: 300,
                features: "دخول لكافة الأدوات\nدعم فني\nتحديثات دورية",
              },
              {
                id: 2,
                name: "الباقة الذهبية",
                price: 600,
                features:
                  "دخول لكافة الأدوات\nدعم فني VIP\nتحديثات دورية\nجلسة استشارية",
              },
            ],
      );

      // Load free trial settings
      setFreeTrialDays(userData.freeTrialSettings?.days || 7);
      setAllowedTrialTools(
        userData.freeTrialSettings?.allowedTools ||
          CHECKLIST_ITEMS.map((s) => s.id),
      );
      setAutoIncludeNewTools(
        userData.freeTrialSettings?.autoIncludeNewTools ?? true,
      );

      // Load payment methods
      setVodafoneWallet(userData.paymentMethods?.vodafone || "");
      setEtisalatWallet(userData.paymentMethods?.etisalat || "");
      setOrangeWallet(userData.paymentMethods?.orange || "");
      setInstapayWallet(userData.paymentMethods?.instapay || "");
      setStripeSecretKey(userData.paymentMethods?.stripeKeys?.secretKey || "");
      setStripePublishableKey(
        userData.paymentMethods?.stripeKeys?.publishableKey || "",
      );
      setStripeWebhookSecret(
        userData.paymentMethods?.stripeKeys?.webhookSecret || "",
      );
      setPaddleVendorId(userData.paymentMethods?.paddleKeys?.vendorId || "");
      setPaddleApiKey(userData.paymentMethods?.paddleKeys?.apiKey || "");
      setPaddleClientKey(userData.paymentMethods?.paddleKeys?.clientKey || "");
      setPaddleWebhookSecret(
        userData.paymentMethods?.paddleKeys?.webhookSecret || "",
      );
      setPaddleEnvironment(
        userData.paymentMethods?.paddleKeys?.environment || "sandbox",
      );
      setPaddleEnabled(
        userData.paymentMethods?.paddleKeys?.enabled ??
          !!userData.paymentMethods?.paddleKeys?.clientKey,
      );
      setIsPaddleValidated(!!userData.paymentMethods?.paddleKeys?.apiKey);

      setIsInitialized(true);
    }
  }, [userData, isInitialized]);

  // Filtered & Paginated Subscription Plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Currency filter
      if (plansCurrencyFilter !== "all") {
        if ((plan.currency || "EGP") !== plansCurrencyFilter) {
          return false;
        }
      }
      // Search query filter
      if (plansSearchQuery.trim() !== "") {
        const query = plansSearchQuery.toLowerCase();
        const nameAr = (plan.name_ar || plan.name || "").toLowerCase();
        const nameEn = (plan.name_en || "").toLowerCase();
        const priceStr = String(plan.price || "");
        const featAr =
          typeof (plan.features_ar || plan.features) === "string"
            ? (plan.features_ar || plan.features).toLowerCase()
            : "";
        const featEn =
          typeof plan.features_en === "string"
            ? plan.features_en.toLowerCase()
            : "";

        return (
          nameAr.includes(query) ||
          nameEn.includes(query) ||
          priceStr.includes(query) ||
          featAr.includes(query) ||
          featEn.includes(query)
        );
      }
      return true;
    });
  }, [plans, plansCurrencyFilter, plansSearchQuery]);

  const plansItemsPerPage = 6;
  const totalPlansPages =
    Math.ceil(filteredPlans.length / plansItemsPerPage) || 1;
  const paginatedPlans = useMemo(() => {
    const start = (plansCurrentPage - 1) * plansItemsPerPage;
    return filteredPlans.slice(start, start + plansItemsPerPage);
  }, [filteredPlans, plansCurrentPage]);

  // Free Trial Statistics Calculations
  const activeTrialUsersCount = useMemo(() => {
    return users.filter((u) => {
      const sub = u.subscription || {};
      const type = sub.type || u.subType || "free";
      if (type === "free" || type === "trial") {
        if (sub.status === "stopped") return false;
        const created = u.createdAt?.seconds
          ? u.createdAt.seconds * 1000
          : typeof u.createdAt === "number"
            ? u.createdAt
            : Date.now();
        const days = Number(freeTrialDays) || 7;
        const expireTime = created + days * 24 * 60 * 60 * 1000;
        return Date.now() <= expireTime;
      }
      return false;
    }).length;
  }, [users, freeTrialDays]);

  const expiredTrialUsersCount = useMemo(() => {
    return users.filter((u) => {
      const sub = u.subscription || {};
      const type = sub.type || u.subType || "free";
      if (type === "free" || type === "trial") {
        if (sub.status === "stopped") return true;
        const created = u.createdAt?.seconds
          ? u.createdAt.seconds * 1000
          : typeof u.createdAt === "number"
            ? u.createdAt
            : Date.now();
        const days = Number(freeTrialDays) || 7;
        const expireTime = created + days * 24 * 60 * 60 * 1000;
        return Date.now() > expireTime;
      }
      return false;
    }).length;
  }, [users, freeTrialDays]);



  const handleValidatePaddle = async () => {
    if (
      !paddleVendorId.trim() ||
      !paddleClientKey.trim() ||
      !paddleApiKey.trim() ||
      !paddleWebhookSecret.trim()
    ) {
      setPaddleValidationError(
        state.language === "en"
          ? "All fields are required."
          : "جميع الحقول مطلوبة للتحقق.",
      );
      return;
    }

    setIsPaddleValidating(true);
    setPaddleValidationError("");
    try {
      const baseUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(
        `${baseUrl}/api/paddle/validate-credentials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: paddleApiKey.trim(),
            environment: paddleEnvironment,
          }),
        },
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setIsPaddleValidated(true);
        toast(
          state.language === "en"
            ?"Paddle keys validated successfully!"
            :"تم التحقق من مفاتيح Paddle بنجاح!",
          "success",
        );
      } else {
        setIsPaddleValidated(false);
        setPaddleValidationError(
          data.error ||
            (state.language === "en"
              ? "Validation failed. Check API Key."
              : "فشل التحقق. تأكد من مفتاح API."),
        );
      }
    } catch (err) {
      console.error(err);
      setIsPaddleValidated(false);
      setPaddleValidationError(
        state.language === "en"
          ? "Error connecting to validation server."
          : "حدث خطأ في الاتصال بخادم التحقق.",
      );
    } finally {
      setIsPaddleValidating(false);
    }
  };

  const handleSyncStripePlans = async () => {
    if (!stripeSecretKey) {
      return toast(
        state.language === "en"
          ? "Please configure your Stripe Secret Key first!"
          : "يرجى إعداد مفتاح Stripe السري أولاً!",
        "error",
      );
    }

    setIsSyncingStripe(true);
    try {
      const baseUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/stripe/sync-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUid: userData.uid,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPlans(data.plans);
        toast(
          state.language === "en"
            ?"Successfully synchronized plans with Stripe!"
            :"تمت مزامنة الباقات مع Stripe بنجاح!",
          "success",
        );
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (err) {
      console.error("Stripe sync error:", err);
      toast(
        state.language === "en"
          ? `Sync failed: ${err.message}`
          : `فشلت المزامنة: ${err.message}`,
        "error",
      );
    } finally {
      setIsSyncingStripe(false);
    }
  };

  const handleUpdateAdminProfile = async (overridePlans = null) => {
    if (!userData?.uid) return;
    if (!brandNameForm.trim()) {
      return toast("يرجى تحديد اسم البراند أولاً في الإعدادات", "error");
    }

    setIsUpdatingProfile(true);
    try {
      let photoURL = userData.photoURL;
      if (adminProfileImage) {
        const imgRef = ref(
          libraryStorage,
          `avatars/${Date.now()}_${adminProfileImage.name}`,
        );
        await uploadBytes(imgRef, adminProfileImage);
        photoURL = await getDownloadURL(imgRef);
      }

      const updateData = {
        ownerName: ownerNameForm,
        brandName: brandNameForm,
        brandUrl: brandUrlForm.trim().toLowerCase(),
        phoneNumber: `${phoneKeyForm}${phoneNumberForm.trim().replace(/^\+/, "")}`,
        photoURL: photoURL || "",
        themeConfig: {
          accent: accentColor,
          success: successColor,
          bg: bgColor,
          sidebar: sidebarColor,
          fontFamily: fontFamily,
          text: textColor,
          line: lineColor,
        },
        socialLinks: socialLinks,
        plans: overridePlans || plans,
        freeTrialSettings: {
          days: Number(freeTrialDays) || 7,
          allowedTools: allowedTrialTools || [],
          autoIncludeNewTools: !!autoIncludeNewTools,
        },
        paymentMethods: {
          vodafone: vodafoneWallet,
          etisalat: etisalatWallet,
          orange: orangeWallet,
          instapay: instapayWallet,
          stripeKeys: {
            secretKey: stripeSecretKey,
            publishableKey: stripePublishableKey,
            webhookSecret: stripeWebhookSecret,
          },
          paddleKeys: {
            enabled: paddleEnabled,
            vendorId: paddleVendorId,
            apiKey: paddleApiKey,
            clientKey: paddleClientKey,
            webhookSecret: paddleWebhookSecret,
            environment: paddleEnvironment,
          },
        },
        defaultLanguage: defaultLanguage,
        landingTemplate: landingTemplate,
        logoDisplayMode: logoDisplayMode,
        showWhatsappLoginBtn: showWhatsappLoginBtn,
      };

      // Validation check before save
      if (paddleEnabled && !isPaddleValidated) {
        toast(
          state.language === "en"
            ? "Please validate your Paddle credentials first!"
            : "يرجى التحقق من صحة مفاتيح Paddle أولاً!",
          "error",
        );
        setIsUpdatingProfile(false);
        return;
      }

      // Filter public payment methods to prevent exposing secret keys in the public brand document
      const publicPaymentMethods = {
        vodafone: vodafoneWallet,
        etisalat: etisalatWallet,
        orange: orangeWallet,
        instapay: instapayWallet,
        stripeKeys: {
          publishableKey: stripePublishableKey,
        },
        paddleKeys: {
          enabled: paddleEnabled,
          vendorId: paddleVendorId,
          clientKey: paddleClientKey,
          environment: paddleEnvironment,
        },
      };

      // 1. Update Admin User document (contains secrets)
      await setDoc(doc(db, "users", userData.uid), updateData, { merge: true });

      // 2. Update/Create Brand document (filtered secrets)
      await setDoc(
        doc(db, "brands", brandNameForm),
        {
          name: brandNameForm,
          domain: updateData.brandUrl,
          adminUid: userData.uid,
          themeConfig: updateData.themeConfig,
          socialLinks: updateData.socialLinks,
          plans: plans,
          freeTrialSettings: updateData.freeTrialSettings,
          paymentMethods: publicPaymentMethods,
          defaultLanguage: updateData.defaultLanguage,
          landingTemplate: updateData.landingTemplate,
          logoDisplayMode: updateData.logoDisplayMode,
          showWhatsappLoginBtn: updateData.showWhatsappLoginBtn,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setLastSavedTimestamp(new Date());
      toast(
        state.language === "en"
          ? "Brand Settings updated successfully!"
          :"تم تحديث إعدادات البراند بنجاح!",
        "success"
      );
    } catch (err) {
      console.error(err);
      toast("خطأ في التحديث", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Load users created by this admin (same brand)
  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = [];
      snap.forEach((d) => {
        const data = d.data();
        // Show users created by this admin OR users belonging to same brand
        if (
          data.createdBy === userData?.uid ||
          data.brandName === userData?.brandName
        ) {
          if (d.id !== userData?.uid) {
            list.push({ id: d.id, ...data });
          }
        }
      });
      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setUsers(list);
    } catch (err) {
      console.error("Error loading users:", err);
      toast("خطأ في تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) loadUsers();
  }, [userData]);

  // Load payments
  const loadPayments = async () => {
    if (!userData?.uid) return;
    setLoadingPayments(true);
    try {
      const q = query(
        collection(db, "payments"),
        where("adminUid", "==", userData.uid),
      );
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setPendingPayments(list);
    } catch (err) {
      console.error(err);
      toast("خطأ في تحميل المعاملات", "error");
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === "payment_methods") {
      loadPayments();
    }
  }, [activeTab, userData]);

  // Handle Approve Payment
  const handleApprovePayment = async () => {
    if (!selectedPlanForPayment) return toast("يرجى اختيار الباقة", "error");

    try {
      // 1. Update Payment status
      await updateDoc(doc(db, "payments", paymentToApprove.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
        planId: selectedPlanForPayment,
        durationDays: selectedDurationForPayment,
      });

      // 2. Update User Subscription
      const expiryDate = new Date();
      expiryDate.setDate(
        expiryDate.getDate() + Number(selectedDurationForPayment),
      );

      await setDoc(
        doc(db, "users", paymentToApprove.userId),
        {
          subscription: {
            type: selectedPlanForPayment, // Using planId/name as type
            expiryDate: expiryDate,
            status: "active",
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true },
      );

      toast(
"تم الموافقة على الدفع وتحديث اشتراك المستخدم بنجاح!",
        "success",
      );
      setPaymentToApprove(null);
      await loadPayments();
      await loadUsers();
    } catch (err) {
      console.error(err);
      toast("حدث خطأ أثناء الموافقة على الدفع", "error");
    }
  };

  // Create user using secondary Firebase app
  const handleCreate = async () => {
    if (!userName.trim()) return toast("أدخل اسم المستخدم", "error");
    if (!userEmail.trim()) return toast("أدخل البريد الإلكتروني", "error");
    if (!userPassword.trim() || userPassword.length < 6)
      return toast("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");

    setCreating(true);
    let secondaryApp = null;

    try {
      let photoURL = "";
      if (profileImage) {
        const imgRef = ref(
          libraryStorage,
          `avatars/${Date.now()}_${profileImage.name}`,
        );
        await uploadBytes(imgRef, profileImage);
        photoURL = await getDownloadURL(imgRef);
      }

      const config = {
        apiKey: "AIzaSyCIF4HfPdDqjH6ue2Sc5NIIJwlOq3ytNA0",
        authDomain: "event-upklick.firebaseapp.com",
        projectId: "event-upklick",
      };
      secondaryApp = initializeApp(config, "admin-secondary-" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);

      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        userEmail.trim(),
        userPassword,
      );
      const uid = cred.user.uid;

      let expiryDate = null;
      if (subType === "monthly") {
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (subType === "custom") {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(subDays));
      } else if (subType === "trial") {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(freeTrialDays));
      }

      // Determine plan info
      const selectedPlan = plans.find(p => String(p.id) === String(userPlanId));
      const planNameVal = selectedPlan ? (selectedPlan.name_ar || selectedPlan.name) : "Free";
      const planCreditsVal = selectedPlan ? Number(selectedPlan.creditsPerMonth || 20) : 20;

      await setDoc(doc(db, "users", uid), {
        email: userEmail.trim().toLowerCase(),
        role: userRole,
        ownerName: userName.trim(),
        photoURL: photoURL || "",
        brandName: userData?.brandName || "",
        planId: userPlanId,
        planName: planNameVal,
        credits: planCreditsVal,
        totalCredits: planCreditsVal,
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || "",
        subscription: {
          type: subType,
          expiryDate: expiryDate ? expiryDate : null,
          status: subType === "stopped" ? "stopped" : "active",
          updatedAt: serverTimestamp(),
        },
      });

      toast(
`تم إنشاء ${userRole ==="admin" ?"الأدمن" :"المستخدم"} بنجاح!`,
        "success",
      );
      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setUserRole("user");
      setSubType("monthly");
      setSubDays(30);
      setProfileImage(null);
        if (document.getElementById("userProfileImg"))
          document.getElementById("userProfileImg").value = "";
        setIsUserModalOpen(false);
        await loadUsers();
    } catch (err) {
      console.error("Create error:", err);
      const msgs = {
        "auth/email-already-in-use": "البريد الإلكتروني مستخدم بالفعل",
        "auth/invalid-email": "صيغة البريد غير صحيحة",
        "auth/weak-password": "كلمة المرور ضعيفة جداً",
      };
      toast(msgs[err.code] || "حدث خطأ أثناء الإنشاء", "error");
    } finally {
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch {}
      }
      setCreating(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setUserName(u.ownerName || "");
    setUserEmail(u.email || "");
    setUserRole(u.role || "user");
    setSubType(u.subscription?.type || "monthly");
    setSubDays(30);
    setUserPlanId(u.planId || "free");
    setUserPassword(""); // Hide password for edit
    setIsUserModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setUserName("");
    setUserEmail("");
    setUserRole("user");
    setUserPlanId("free");
    setUserPassword("");
    setIsUserModalOpen(false);
  };

  // Renew / Change Plan (isolated from edit)
  const handleRenewPlan = async () => {
    if (!renewPlanUser) return;
    setIsRenewing(true);
    try {
      const selectedPlan = plans.find(p => String(p.id) === String(renewPlanId));
      const planNameVal = selectedPlan ? (selectedPlan.name_ar || selectedPlan.name) : "Free";
      const planCreditsVal = selectedPlan ? Number(selectedPlan.creditsPerMonth || 20) : 20;

      await setDoc(
        doc(db, "users", renewPlanUser.id),
        {
          planId: renewPlanId,
          planName: planNameVal,
          credits: planCreditsVal,
          totalCredits: planCreditsVal,
        },
        { merge: true },
      );

      toast(
        state.language === "en"
          ? "Plan renewed successfully! \u2705"
          : "\u062a\u0645 \u062a\u062c\u062f\u064a\u062f \u0627\u0644\u062e\u0637\u0629 \u0628\u0646\u062c\u0627\u062d! \u2705",
        "success",
      );
      setRenewPlanUser(null);
      await loadUsers();
    } catch (err) {
      console.error("Renew plan error:", err);
      toast(
        state.language === "en" ? "Failed to renew plan" : "\u0641\u0634\u0644 \u0641\u064a \u062a\u062c\u062f\u064a\u062f \u0627\u0644\u062e\u0637\u0629",
        "error",
      );
    } finally {
      setIsRenewing(false);
    }
  };

  const handleUpdate = async () => {
    if (!userName.trim()) return toast("أدخل الاسم", "error");
    setCreating(true);
    try {
      let photoURL = editingUser.photoURL;
      if (profileImage) {
        const imgRef = ref(
          libraryStorage,
          `avatars/${Date.now()}_${profileImage.name}`,
        );
        await uploadBytes(imgRef, profileImage);
        photoURL = await getDownloadURL(imgRef);
      }

      let expiryDate = editingUser.subscription?.expiryDate?.toDate() || null;
      if (subType === "monthly") {
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (subType === "custom") {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(subDays));
      } else if (subType === "trial") {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(freeTrialDays));
      } else if (subType === "lifetime") {
        expiryDate = null;
      }

      // Determine plan info
      const selectedPlan = plans.find(p => String(p.id) === String(userPlanId));
      const planNameVal = selectedPlan ? (selectedPlan.name_ar || selectedPlan.name) : "Free";
      const planCreditsVal = selectedPlan ? Number(selectedPlan.creditsPerMonth || 20) : 20;

      // Only reset current credits if the plan changed
      const updateData = {
        ownerName: userName.trim(),
        role: userRole,
        photoURL: photoURL || "",
        planId: userPlanId,
        planName: planNameVal,
        totalCredits: planCreditsVal,
        subscription: {
          type: subType,
          expiryDate: expiryDate ? expiryDate : null,
          status: subType === "stopped" ? "stopped" : "active",
          updatedAt: serverTimestamp(),
        },
      };

      // Only reset credits if the plan actually changed
      if (editingUser.planId !== userPlanId) {
        updateData.credits = planCreditsVal;
      }

      await setDoc(
        doc(db, "users", editingUser.id),
        updateData,
        { merge: true },
      );
      toast("تم التحديث بنجاح","success");
      cancelEdit();
      await loadUsers();
    } catch (err) {
      toast("حدث خطأ أثناء التحديث", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) handleUpdate();
    else handleCreate();
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      toast(
        state.language === "en"
          ?"User deleted successfully"
          :"تم حذف المستخدم بنجاح",
        "success",
      );
      setUserToDelete(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      toast(
        state.language === "en" ? "Error deleting user" : "خطأ في الحذف",
        "error",
      );
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      toast(
        state.language === "en"
          ? "No users to export"
          : "لا يوجد مستخدمين للتصدير",
        "error",
      );
      return;
    }

    const headers =
      state.language === "en"
        ? ["Name", "Email", "Role", "Subscription Type", "Created Date"]
        : [
            "الاسم",
            "البريد الإلكتروني",
            "الدور",
            "نوع الاشتراك",
            "تاريخ الإنشاء",
          ];

    const rows = filteredUsers.map((u) => [
      `"${u.ownerName || u.brandName || ""}"`,
      `"${u.email || ""}"`,
      `"${u.role === "admin" ? "Admin" : "User"}"`,
      `"${u.subscription?.type || "none"}"`,
      `"${formatDate(u.createdAt)}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(
      state.language === "en"
        ?"CSV exported successfully"
        :"تم تصدير ملف CSV بنجاح",
      "success",
    );
  };

  const handleLogout = async () => {
    try {
      await logout("admin");
      toast(
        state.language === "en"
          ?"Logged out successfully"
          :"تم تسجيل الخروج بنجاح",
        "success",
      );
      navigate("/admin/login");
    } catch (err) {
      toast(
        state.language === "en"
          ? "Error logging out"
          : "حدث خطأ أثناء تسجيل الخروج",
        "error",
      );
      console.error(err);
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      const name = (u.ownerName || u.brandName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (subFilter !== "all") {
      const sub = u.subscription;
      if (subFilter === "stopped" && sub?.status !== "stopped") return false;
      if (subFilter === "lifetime" && sub?.type !== "lifetime") return false;
      if (subFilter === "trial" && sub?.type !== "trial") return false;
      if (
        subFilter === "active" &&
        (sub?.status === "stopped" || !sub?.expiryDate)
      )
        return false;
    }
    if (planFilter !== "all") {
      const userPlan = u.planId || "free";
      if (userPlan !== planFilter) return false;
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [userSearchQuery, roleFilter, subFilter, planFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const admins = Array.isArray(users)
    ? users.filter((u) => u.role === "admin")
    : [];
  const regularUsers = Array.isArray(users)
    ? users.filter((u) => u.role === "user")
    : [];
  const totalSteps = TOTAL_STEPS_COUNT || 1;

  const formatDate = (ts) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!userData) {
    return (
      <div
        className="ad-page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid var(--line2, rgba(255,255,255,0.15))",
            borderTopColor: "var(--accent, #3B82F6)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: 13, color: "var(--text2, #94A3B8)" }}>
          جاري تحميل لوحة التحكم...
        </span>
      </div>
    );
  }

  return (
    <div className="ad-page" dir="rtl">
      <div className="ad-bg">
        <div className="ad-orb ad-orb-1" />
        <div className="ad-orb ad-orb-2" />
      </div>
      <div className="ad-layout">
        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobile && isMobileMenuOpen && (
            <motion.div
              className="ad-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>
        {/* Sidebar */}
        <motion.aside
          className={`ad-sidebar ${isMobileMenuOpen ? "open" : ""}`}
          animate={{
            width: isMobile
              ? isMobileMenuOpen
                ? 260
                : 0
              : isCollapsed
                ? 80
                : 260,
            x: isMobile && !isMobileMenuOpen ? 260 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div
            className="ad-sidebar-header"
            style={{
              padding: isCollapsed && !isMobile ? "16px 10px" : "20px",
              display: "flex",
              alignItems: "center",
              justifyContent:
                isCollapsed && !isMobile ? "center" : "space-between",
            }}
          >
            <div
              onClick={
                isCollapsed && !isMobile
                  ? () => {
                      setIsCollapsed(false);
                      localStorage.setItem("admin-sidebar-collapsed", "false");
                    }
                  : undefined
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                overflow: "hidden",
                cursor: isCollapsed && !isMobile ? "pointer" : "default",
              }}
              title={
                isCollapsed && !isMobile
                  ? state.language === "en"
                    ? "Expand Sidebar"
                    : "توسيع القائمة"
                  : undefined
              }
            >
              {(() => {
                const displayMode = userData?.logoDisplayMode || "both";
                const showLogo =
                  displayMode === "both" || displayMode === "logo";
                const showText =
                  displayMode === "both" || displayMode === "text";

                return (
                  <>
                    {showLogo && (
                      <div
                        className="ad-logo-icon"
                        style={
                          userData?.photoURL
                            ? {
                                background: `url("${userData.photoURL}") center/contain no-repeat`,
                                border: "none",
                                backgroundSize: "contain",
                                flexShrink: 0,
                              }
                            : { flexShrink: 0 }
                        }
                      >
                        {!userData?.photoURL && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        )}
                      </div>
                    )}
                    {(!isCollapsed || isMobile) && showText && (
                      <div style={{ overflow: "hidden" }}>
                        <div
                          className="ad-topbar-title"
                          style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                        >
                          {userData?.brandName || "لوحة التحكم"}
                        </div>
                        <div className="ad-topbar-sub">Admin Dashboard</div>
                        {userData?.subscription && (
                          <div
                            style={{
                              fontSize: 9,
                              color: "var(--accent)",
                              fontWeight: 700,
                              marginTop: 4,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {userData.subscription.status === "stopped"
                              ? "🚫 الاشتراك متوقف"
                              : userData.subscription.type === "lifetime"
                                ? "💎 اشتراك دائم"
                                : `⌛ ينتهي: ${(userData.subscription.expiryDate?.toDate ? userData.subscription.expiryDate.toDate() : new Date(userData.subscription.expiryDate)).toLocaleDateString("ar-EG")}`}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {!isMobile && (
              <button
                type="button"
                className="ad-sidebar-collapse-btn"
                onClick={() => {
                  const nextState = !isCollapsed;
                  setIsCollapsed(nextState);
                  localStorage.setItem(
                    "admin-sidebar-collapsed",
                    String(nextState),
                  );
                }}
                title={
                  isCollapsed
                    ? state.language === "en"
                      ? "Expand Sidebar"
                      : "توسيع القائمة الجانبية"
                    : state.language === "en"
                      ? "Collapse Sidebar"
                      : "طي القائمة الجانبية"
                }
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "6px",
                  color: "var(--text2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {isCollapsed ? (
                  state.language === "en" ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )
                ) : state.language === "en" ? (
                  <ChevronLeft size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            )}
          </div>

          <div className="ad-sidebar-nav">
            {[
              {
                id: "users",
                label: "إدارة المستخدمين",
                label_en: "User Management",
                icon: Users,
              },
              {
                id: "sales",
                label: "إدارة المبيعات",
                label_en: "Sales Management",
                icon: TrendingUp,
              },
              {
                id: "subscriptions",
                label: "الباقات والتسعير",
                label_en: "Plans & Pricing",
                icon: Tag,
              },
              {
                id: "trial_settings",
                label: "إعدادات الفترة المجانية",
                label_en: "Free Trial Settings",
                icon: Gift,
              },
              {
                id: "payment_methods",
                label: "طرق الدفع",
                label_en: "Payment Methods",
                icon: CreditCard,
              },
              {
                id: "settings",
                label: "إعدادات البراند",
                label_en: "Brand Settings",
                icon: Settings,
              },
              {
                id: "tutorial",
                label: "فيديو الشرح",
                label_en: "Tutorial Video",
                icon: Tv,
              },
              {
                id: "library",
                label: "مكتبة المنتجات",
                label_en: "Product Library",
                icon: Library,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label =
                state.language === "en" ? item.label_en : item.label;

              return (
                <motion.button
                  key={item.id}
                  className={`ad-nav-link ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectTab(item.id)}
                  whileHover={{
                    scale: 1.02,
                    x:
                      isCollapsed && !isMobile
                        ? 0
                        : state.language === "en"
                          ? 4
                          : -4,
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  title={isCollapsed && !isMobile ? label : undefined}
                  style={{
                    justifyContent:
                      isCollapsed && !isMobile ? "center" : "flex-start",
                    padding: isCollapsed && !isMobile ? "12px" : "12px 16px",
                  }}
                >
                  <div className="ad-nav-icon">
                    <Icon size={18} />
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <span
                      className="ad-nav-label"
                      style={{
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {label}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div
            className="ad-sidebar-footer"
            style={{
              padding: isCollapsed && !isMobile ? "16px 8px" : "16px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <motion.button
              className="btn btn-sm ad-footer-btn"
              onClick={() => navigate("/dashboard")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={
                isCollapsed && !isMobile
                  ? state.language === "en"
                    ? "User Tools"
                    : "أدوات المستخدم"
                  : undefined
              }
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  isCollapsed && !isMobile ? "center" : "flex-start",
                gap: "8px",
                padding: isCollapsed && !isMobile ? "8px" : "8px 12px",
              }}
            >
              <Package size={16} />
              {(!isCollapsed || isMobile) && (
                <span>
                  {state.language === "en" ? "User Tools" : "أدوات المستخدم"}
                </span>
              )}
            </motion.button>
            <motion.button
              className="btn btn-sm ad-footer-btn danger"
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={
                isCollapsed && !isMobile
                  ? state.language === "en"
                    ? "Logout"
                    : "تسجيل الخروج"
                  : undefined
              }
              style={{
                borderColor: "rgba(239, 68, 68, 0.3)",
                color: "var(--red)",
                background: "rgba(239, 68, 68, 0.08)",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  isCollapsed && !isMobile ? "center" : "flex-start",
                gap: "8px",
                padding: isCollapsed && !isMobile ? "8px" : "8px 12px",
              }}
            >
              <LogOut size={16} />
              {(!isCollapsed || isMobile) && (
                <span>
                  {state.language === "en" ? "Logout" : "تسجيل الخروج"}
                </span>
              )}
            </motion.button>
          </div>
        </motion.aside>
        {/* Main Content */}
        <div className="ad-main">
          {/* Topbar */}
          <div className="ad-topbar">
            <div
              className="ad-topbar-left"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              {isMobile ? (
                <button
                  className="ad-mobile-toggle"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  className="ad-sidebar-collapse-btn"
                  onClick={() => {
                    const nextState = !isCollapsed;
                    setIsCollapsed(nextState);
                    localStorage.setItem(
                      "admin-sidebar-collapsed",
                      String(nextState),
                    );
                  }}
                  title={
                    isCollapsed
                      ? state.language === "en"
                        ? "Expand Sidebar"
                        : "توسيع القائمة الجانبية"
                      : state.language === "en"
                        ? "Collapse Sidebar"
                        : "طي القائمة الجانبية"
                  }
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "6px",
                    color: "var(--text)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Menu size={18} />
                </button>
              )}
              <h2
                className="ad-page-title"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {activeTab === "users" ? (
                  <>
                    <Users size={20} style={{ color: "var(--accent)" }} />
                    <span>
                      {state.language === "en"
                        ? "User Management"
                        : "إدارة المستخدمين"}
                    </span>
                  </>
                ) : activeTab === "sales" ? (
                  <>
                    <TrendingUp size={20} style={{ color: "var(--green)" }} />
                    <span>
                      {state.language === "en"
                        ? "Sales Management"
                        : "إدارة المبيعات"}
                    </span>
                  </>
                ) : activeTab === "subscriptions" ? (
                  <>
                    <Tag size={20} style={{ color: "var(--accent)" }} />
                    <span>
                      {state.language === "en"
                        ? "Plans & Pricing"
                        : "الباقات والتسعير"}
                    </span>
                  </>
                ) : activeTab === "trial_settings" ? (
                  <>
                    <Gift size={20} style={{ color: "#f59e0b" }} />
                    <span>
                      {state.language === "en"
                        ? "Free Trial Settings"
                        : "إعدادات الفترة المجانية"}
                    </span>
                  </>
                ) : activeTab === "payment_methods" ? (
                  <>
                    <CreditCard size={20} style={{ color: "#8b5cf6" }} />
                    <span>
                      {state.language === "en"
                        ? "Payment Methods"
                        : "طرق الدفع"}
                    </span>
                  </>
                ) : activeTab === "tutorial" ? (
                  <>
                    <Tv size={20} style={{ color: "#ef4444" }} />
                    <span>
                      {state.language === "en"
                        ? "Tutorial Video"
                        : "فيديو الشرح"}
                    </span>
                  </>
                ) : activeTab === "library" ? (
                  <>
                    <Library size={20} style={{ color: "#06b6d4" }} />
                    <span>
                      {state.language === "en"
                        ? "Product Library"
                        : "مكتبة المنتجات"}
                    </span>
                  </>
                ) : (
                  <>
                    <Settings size={20} style={{ color: "var(--accent)" }} />
                    <span>
                      {state.language === "en"
                        ? "Brand Settings"
                        : "إعدادات البراند"}
                    </span>
                  </>
                )}
              </h2>
            </div>
            <div
              className="ad-topbar-right"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <button
                className="btn btn-sm"
                onClick={() =>
                  dispatch({
                    type: "SET_LANGUAGE",
                    payload: state.language === "en" ? "ar" : "en",
                  })
                }
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--line)",
                  padding: "6px 14px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "10px",
                  fontWeight: 600,
                }}
              >
                <Globe size={15} />
                <span>
                  {state.language === "en" ? "العربية 🇪🇬" : "English 🇬🇧"}
                </span>
              </button>
              <div className="ad-brand-badge">
                <div className="ad-brand-dot" />
                <ShieldCheck size={14} />
                <span>{userData?.ownerName || "Admin"}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === "users" ? (
            <div
              className="ad-content animate-in"
              dir={state.language === "en" ? "ltr" : "rtl"}
            >
              {loading ? (
                <div
                  className="ad-loading-wrapper"
                  style={{
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    background: "rgba(15, 23, 42, 0.4)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius, 16px)",
                    padding: 40,
                    margin: "20px 0",
                  }}
                >
                  <Loader2
                    size={42}
                    style={{
                      color: "var(--accent)",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>
                      {state.language === "en"
                        ? "Loading User Management data..."
                        : "جاري تحميل بيانات إدارة المستخدمين..."}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Isolated Brand Banner Card */}
                  <motion.div
                    className="ad-brand-banner"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="ad-banner-content">
                      <div className="ad-banner-avatar">
                        {(userData?.brandName || userData?.ownerName || "A")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="ad-banner-info">
                        <div className="ad-banner-title">
                          {userData?.brandName || "—"}
                          <span className="ad-banner-badge">
                            <ShieldCheck size={12} />
                            {userData?.ownerName || "Admin"}
                          </span>
                        </div>
                        <div className="ad-banner-email">{userData?.email}</div>
                      </div>
                    </div>
                    <div className="ad-banner-status">
                      <div className="ad-status-chip">
                        <Sparkles
                          size={14}
                          style={{ color: "var(--accent)" }}
                        />
                        <span>
                          {userData?.subscription?.status === "stopped"
                            ? state.language === "en"
                              ? "Subscription Stopped"
                              : "الاشتراك متوقف"
                            : userData?.subscription?.type === "lifetime"
                              ? state.language === "en"
                                ? "Lifetime Subscription"
                                : "اشتراك دائم"
                              : userData?.subscription?.expiryDate
                                ? `${state.language === "en" ? "Expires: " : "ينتهي: "}${
                                    userData.subscription.expiryDate?.toDate
                                      ? userData.subscription.expiryDate
                                          .toDate()
                                          .toLocaleDateString(
                                            state.language === "en"
                                              ? "en-US"
                                              : "ar-EG",
                                          )
                                      : new Date(
                                          userData.subscription.expiryDate,
                                        ).toLocaleDateString(
                                          state.language === "en"
                                            ? "en-US"
                                            : "ar-EG",
                                        )
                                  }`
                                : state.language === "en"
                                  ? "Active Account"
                                  : "حساب نشط"}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Stats Row */}
                  <div className="ad-stats">
                    <motion.div className="ad-stat-card" whileHover={{ y: -3 }}>
                      <div className="ad-stat-icon-wrapper blue">
                        <Building size={20} />
                      </div>
                      <div className="ad-stat-value">
                        {userData?.brandName || "—"}
                      </div>
                      <div className="ad-stat-label">
                        {state.language === "en" ? "Brand" : "البراند"}
                      </div>
                    </motion.div>

                    <motion.div className="ad-stat-card" whileHover={{ y: -3 }}>
                      <div className="ad-stat-icon-wrapper purple">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="ad-stat-value">
                        <AnimatedCounter value={admins.length} />
                      </div>
                      <div className="ad-stat-label">
                        {state.language === "en" ? "Admins" : "الأدمنز"}
                      </div>
                    </motion.div>

                    <motion.div className="ad-stat-card" whileHover={{ y: -3 }}>
                      <div className="ad-stat-icon-wrapper green">
                        <UserCheck size={20} />
                      </div>
                      <div className="ad-stat-value">
                        <AnimatedCounter value={regularUsers.length} />
                      </div>
                      <div className="ad-stat-label">
                        {state.language === "en" ? "Users" : "المستخدمين"}
                      </div>
                    </motion.div>

                    <motion.div className="ad-stat-card" whileHover={{ y: -3 }}>
                      <div className="ad-stat-icon-wrapper cyan">
                        <Users size={20} />
                      </div>
                      <div className="ad-stat-value">
                        <AnimatedCounter value={users.length} />
                      </div>
                      <div className="ad-stat-label">
                        {state.language === "en"
                          ? "Total Accounts"
                          : "إجمالي الحسابات"}
                      </div>
                    </motion.div>

                    <motion.div
                      className="ad-stat-card amber-card"
                      whileHover={{ y: -3 }}
                    >
                      <div className="ad-stat-icon-wrapper amber">
                        <Sparkles size={20} />
                      </div>
                      <div className="ad-stat-value" style={{ fontSize: 16 }}>
                        {userData?.subscription?.status === "stopped"
                          ? state.language === "en"
                            ? "🚫 Stopped"
                            : "🚫 متوقف"
                          : userData?.subscription?.type === "lifetime"
                            ? state.language === "en"
                              ? "💎 Lifetime"
                              : "💎 دائم"
                            : userData?.subscription?.expiryDate
                              ? (() => {
                                  const exp = userData.subscription.expiryDate
                                    ?.toDate
                                    ? userData.subscription.expiryDate.toDate()
                                    : new Date(
                                        userData.subscription.expiryDate,
                                      );
                                  const isExp = exp < new Date();
                                  return isExp
                                    ? state.language === "en"
                                      ? "⚠️ Expired"
                                      : "⚠️ منتهي"
                                    : exp.toLocaleDateString(
                                        state.language === "en"
                                          ? "en-US"
                                          : "ar-EG",
                                      );
                                })()
                              : "—"}
                      </div>
                      <div className="ad-stat-label">
                        {state.language === "en"
                          ? "Subscription Status"
                          : "حالة الاشتراك"}
                      </div>
                    </motion.div>
                  </div>

                  {/* Grid */}
                  <div className="ad-grid">
                    {/* Users Table */}
                    <div
                      className="ad-table-card"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <div
                        className="ad-card-header"
                        style={{ flexWrap: "wrap", gap: "16px" }}
                      >
                        <div className="ad-card-title">
                          <Users size={20} style={{ color: "var(--accent)" }} />
                          <span>
                            {state.language === "en"
                              ? "Users List"
                              : "المستخدمين"}
                          </span>
                          <span className="ad-card-count">
                            {filteredUsers.length}
                          </span>
                        </div>

                        <div
                          className="ad-header-actions"
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {/* Search Box */}
                          <div className="ad-search-box">
                            <Search size={16} />
                            <input
                              type="text"
                              placeholder={
                                state.language === "en"
                                  ? "Search by name or email..."
                                  : "ابحث بالاسم أو البريد..."
                              }
                              value={userSearchQuery}
                              onChange={(e) =>
                                setUserSearchQuery(e.target.value)
                              }
                            />
                            {userSearchQuery && (
                              <button
                                className="ad-clear-search"
                                onClick={() => setUserSearchQuery("")}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {/* Filter Toggle */}
                          <button
                            className={`btn btn-sm ${!isFilterCollapsed ? "active-filter" : ""}`}
                            onClick={() =>
                              setIsFilterCollapsed(!isFilterCollapsed)
                            }
                            style={{
                              background: !isFilterCollapsed
                                ? "rgba(59, 130, 246, 0.2)"
                                : "var(--bg3)",
                              border: "1px solid var(--line)",
                              color: !isFilterCollapsed
                                ? "var(--accent)"
                                : "var(--text)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <SlidersHorizontal size={16} />
                            <span>
                              {state.language === "en" ? "Filter" : "تصفية"}
                            </span>
                          </button>

                          {/* Export CSV */}
                          <button
                            className="btn btn-sm"
                            onClick={handleExportCSV}
                            style={{
                              background: "rgba(16, 185, 129, 0.1)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              color: "var(--green)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Download size={16} />
                            <span>
                              {state.language === "en"
                                ? "Export CSV"
                                : "تصدير CSV"}
                            </span>
                          </button>

                          {/* Add User */}
                          <button
                            className="btn"
                            onClick={() => {
                              cancelEdit();
                              setIsUserModalOpen(true);
                            }}
                            style={{
                              background:
                                "linear-gradient(135deg, var(--accent), #7c3aed)",
                              color: "#fff",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 16px",
                              fontWeight: 700,
                            }}
                          >
                            <UserPlus size={18} />
                            <span>
                              {state.language === "en"
                                ? "Add New User"
                                : "إضافة مستخدم جديد"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Filters Bar */}
                      <AnimatePresence>
                        {!isFilterCollapsed && (
                          <motion.div
                            className="ad-filter-panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div
                              className="ad-filter-grid"
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "16px",
                                alignItems: "end",
                              }}
                            >
                              <div className="ad-filter-item">
                                <CustomSelect
                                  label={
                                    state.language === "en"
                                      ? "Account Role"
                                      : "نوع الحساب"
                                  }
                                  value={roleFilter}
                                  onChange={(val) => setRoleFilter(val)}
                                  icon={Shield}
                                  options={[
                                    {
                                      value: "all",
                                      label:
                                        state.language === "en"
                                          ? "All Roles"
                                          : "جميع الأدوار",
                                      icon: Shield,
                                    },
                                    {
                                      value: "admin",
                                      label:
                                        state.language === "en"
                                          ? "Admin"
                                          : "أدمن",
                                      icon: ShieldCheck,
                                    },
                                    {
                                      value: "user",
                                      label:
                                        state.language === "en"
                                          ? "User"
                                          : "مستخدم عادي",
                                      icon: User,
                                    },
                                  ]}
                                />
                              </div>

                              <div className="ad-filter-item">
                                <CustomSelect
                                  label={
                                    state.language === "en"
                                      ? "Subscription Status"
                                      : "حالة الاشتراك"
                                  }
                                  value={subFilter}
                                  onChange={(val) => setSubFilter(val)}
                                  icon={Sparkles}
                                  options={[
                                    {
                                      value: "all",
                                      label:
                                        state.language === "en"
                                          ? "All Statuses"
                                          : "جميع الحالات",
                                      icon: Sparkles,
                                    },
                                    {
                                      value: "active",
                                      label:
                                        state.language === "en"
                                          ? "Active Subscription"
                                          : "اشتراك نشط",
                                      icon: CheckCircle2,
                                    },
                                    {
                                      value: "trial",
                                      label:
                                        state.language === "en"
                                          ? "Free Trial"
                                          : "فترة مجانية",
                                      icon: Gift,
                                    },
                                    {
                                      value: "lifetime",
                                      label:
                                        state.language === "en"
                                          ? "Lifetime"
                                          : "اشتراك دائم",
                                      icon: Gem,
                                    },
                                    {
                                      value: "stopped",
                                      label:
                                        state.language === "en"
                                          ? "Stopped"
                                          : "متوقف",
                                      icon: Ban,
                                    },
                                  ]}
                                />
                              </div>

                              <div className="ad-filter-item">
                                <CustomSelect
                                  label={
                                    state.language === "en"
                                      ? "Plan Type"
                                      : "نوع الخطة"
                                  }
                                  value={planFilter}
                                  onChange={(val) => setPlanFilter(val)}
                                  icon={Layers}
                                  options={[
                                    {
                                      value: "all",
                                      label:
                                        state.language === "en"
                                          ? "All Plans"
                                          : "جميع الخطط",
                                      icon: Layers,
                                    },
                                    {
                                      value: "free",
                                      label:
                                        state.language === "en"
                                          ? "Free Plan"
                                          : "خطة مجانية",
                                      icon: Gift,
                                    },
                                    ...plans.map((p) => ({
                                      value: p.id.toString(),
                                      label:
                                        state.language === "en"
                                          ? p.name_en || p.name
                                          : p.name_ar || p.name,
                                      icon: Sparkles,
                                    })),
                                  ]}
                                />
                              </div>

                              <div className="ad-filter-item">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => {
                                    setRoleFilter("all");
                                    setSubFilter("all");
                                    setPlanFilter("all");
                                    setUserSearchQuery("");
                                  }}
                                  style={{
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    color: "var(--red)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    width: "100%",
                                    height: 42,
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    justifyContent: "center",
                                  }}
                                >
                                  <RotateCcw size={15} />
                                  <span>
                                    {state.language === "en"
                                      ? "Reset Filters"
                                      : "إعادة ضبط"}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {loading ? (
                        <div
                          className="ad-empty"
                          style={{ padding: "60px 20px" }}
                        >
                          <div
                            className="ad-submit-spinner"
                            style={{
                              width: 28,
                              height: 28,
                              margin: "0 auto 16px auto",
                              borderWidth: 3,
                            }}
                          />
                          <div
                            style={{
                              fontSize: 13,
                              color: "var(--text2)",
                              fontWeight: 600,
                            }}
                          >
                            {state.language === "en"
                              ? "Loading users data..."
                              : "جاري تحميل بيانات المستخدمين..."}
                          </div>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div
                          className="ad-empty"
                          style={{ padding: "60px 20px" }}
                        >
                          <div className="ad-empty-icon">
                            <User size={42} style={{ opacity: 0.4 }} />
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              marginTop: 10,
                              color: "var(--text)",
                            }}
                          >
                            {state.language === "en"
                              ? "No users found"
                              : "لا يوجد مستخدمين بعد"}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text3)",
                              marginTop: 4,
                            }}
                          >
                            {state.language === "en"
                              ? "Try adjusting your search or filters"
                              : "أنشئ أول مستخدم أو عدّل خيارات التصفية"}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="ad-table-wrapper" dir="rtl">
                            <table className="ad-table" dir="rtl">
                              <thead>
                                <tr>
                                  <th>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <User size={14} />
                                      <span>
                                        {state.language === "en"
                                          ? "User Name"
                                          : "الاسم"}
                                      </span>
                                    </div>
                                  </th>
                                  <th>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <Mail size={14} />
                                      <span>
                                        {state.language === "en"
                                          ? "Email"
                                          : "البريد"}
                                      </span>
                                    </div>
                                  </th>
                                  <th>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <Layers size={14} />
                                      <span>
                                        {state.language === "en"
                                          ? "Plan"
                                          : "الخطة"}
                                      </span>
                                    </div>
                                  </th>
                                  <th>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <Sparkles size={14} />
                                      <span>
                                        {state.language === "en"
                                          ? "Subscription"
                                          : "الاشتراك"}
                                      </span>
                                    </div>
                                  </th>
                                  <th>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <Shield size={14} />
                                      <span>
                                        {state.language === "en"
                                          ? "Role"
                                          : "الدور"}
                                      </span>
                                    </div>
                                  </th>
                                  <th>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <Activity size={14} />
                                      <span>
                                        {state.language === "en"
                                          ? "Progress"
                                          : "التقدم"}
                                      </span>
                                    </div>
                                  </th>
                                  <th>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <Calendar size={14} />
                                      <span>
                                        {state.language === "en"
                                          ? "Date"
                                          : "التاريخ"}
                                      </span>
                                    </div>
                                  </th>
                                  <th style={{ textAlign: "center" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <SlidersHorizontal size={14} />
                                      <span>
                                        {state.language === "en"
                                          ? "Actions"
                                          : "الإجراءات"}
                                      </span>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedUsers.map((u) => (
                                  <tr key={u.id}>
                                    <td>
                                      <div className="ad-user-name">
                                        <div
                                          className="ad-user-avatar"
                                          style={
                                            u.photoURL
                                              ? {
                                                  background: `url("${u.photoURL}") center/cover no-repeat`,
                                                  border:
                                                    "1px solid rgba(255,255,255,0.1)",
                                                }
                                              : {}
                                          }
                                        >
                                          {!u.photoURL &&
                                            (u.ownerName || u.email || "?")
                                              .charAt(0)
                                              .toUpperCase()}
                                        </div>
                                        <span>{u.ownerName || "—"}</span>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="ad-user-email">
                                        {u.email}
                                      </span>
                                    </td>
                                    <td>
                                      {(() => {
                                        const pName = u.planName || "Free";
                                        const foundPlan = plans.find(p => p.name === pName || p.name_ar === pName || p.name_en === pName);
                                        const displayName = state.language === "en" 
                                          ? (foundPlan?.name_en || foundPlan?.name || pName)
                                          : (foundPlan?.name_ar || foundPlan?.name || pName);
                                        const isFree = pName.toLowerCase().includes("free") || pName === "مجانية";
                                        
                                        return (
                                          <div
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: "6px",
                                              padding: "4px 10px",
                                              borderRadius: "20px",
                                              background: isFree ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.1)",
                                              border: isFree ? "1px solid var(--line)" : "1px solid rgba(16, 185, 129, 0.3)",
                                              color: isFree ? "var(--text1)" : "#10B981",
                                              fontSize: "12px",
                                              fontWeight: "600",
                                              boxShadow: isFree ? "none" : "0 0 10px rgba(16, 185, 129, 0.1)",
                                            }}
                                          >
                                            <Database size={12} />
                                            <span>{displayName}</span>
                                          </div>
                                        );
                                      })()}
                                    </td>
                                    <td>
                                      {u.subscription?.status === "stopped" ? (
                                        <span
                                          style={{
                                            color: "var(--red)",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                          }}
                                        >
                                          <XCircle size={13} />{" "}
                                          {state.language === "en"
                                            ? "Stopped"
                                            : "متوقف"}
                                        </span>
                                      ) : u.subscription?.type ===
                                        "lifetime" ? (
                                        <span
                                          style={{
                                            color: "var(--accent)",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                          }}
                                        >
                                          <Sparkles size={13} />{" "}
                                          {state.language === "en"
                                            ? "Lifetime"
                                            : "دائم"}
                                        </span>
                                      ) : u.subscription?.type === "trial" ? (
                                        (() => {
                                          const exp = u.subscription.expiryDate
                                            ?.toDate
                                            ? u.subscription.expiryDate.toDate()
                                            : u.subscription?.expiryDate
                                              ? new Date(
                                                  u.subscription.expiryDate,
                                                )
                                              : null;
                                          const isExp = exp && exp < new Date();
                                          return (
                                            <div
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                              }}
                                            >
                                              <span
                                                style={{
                                                  color: isExp
                                                    ? "var(--red)"
                                                    : "var(--accent)",
                                                  fontSize: 10,
                                                  fontWeight: 700,
                                                  display: "inline-flex",
                                                  alignItems: "center",
                                                  gap: 4,
                                                }}
                                              >
                                                <Gift size={12} />{" "}
                                                {state.language === "en"
                                                  ? `Trial ${isExp ? "(Expired)" : "(Active)"}`
                                                  : `فترة مجانية ${isExp ? "(منتهية)" : "(نشطة)"}`}
                                              </span>
                                              {exp && (
                                                <span
                                                  style={{
                                                    fontSize: 9,
                                                    color: "var(--text3)",
                                                  }}
                                                >
                                                  {exp.toLocaleDateString(
                                                    state.language === "en"
                                                      ? "en-US"
                                                      : "ar-EG",
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })()
                                      ) : u.subscription?.expiryDate ? (
                                        (() => {
                                          const exp = u.subscription.expiryDate
                                            ?.toDate
                                            ? u.subscription.expiryDate.toDate()
                                            : new Date(
                                                u.subscription.expiryDate,
                                              );
                                          const isExp = exp < new Date();
                                          return (
                                            <div
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                              }}
                                            >
                                              <span
                                                style={{
                                                  color: isExp
                                                    ? "var(--red)"
                                                    : "var(--green)",
                                                  fontSize: 10,
                                                  fontWeight: 700,
                                                  display: "inline-flex",
                                                  alignItems: "center",
                                                  gap: 4,
                                                }}
                                              >
                                                {isExp ? (
                                                  <Clock size={12} />
                                                ) : (
                                                  <CheckCircle2 size={12} />
                                                )}{" "}
                                                {isExp
                                                  ? state.language === "en"
                                                    ? "Expired"
                                                    : "منتهي"
                                                  : state.language === "en"
                                                    ? "Active"
                                                    : "نشط"}
                                              </span>
                                              <span
                                                style={{
                                                  fontSize: 9,
                                                  color: "var(--text3)",
                                                }}
                                              >
                                                {exp.toLocaleDateString(
                                                  state.language === "en"
                                                    ? "en-US"
                                                    : "ar-EG",
                                                )}
                                              </span>
                                            </div>
                                          );
                                        })()
                                      ) : (
                                        <span
                                          style={{
                                            color: "var(--text3)",
                                            fontSize: 10,
                                          }}
                                        >
                                          —
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      <span
                                        className={`ad-role-badge ${u.role === "admin" ? "ad-role-admin" : "ad-role-user"}`}
                                      >
                                        {u.role === "admin" ? (
                                          <>
                                            <ShieldCheck size={12} />{" "}
                                            {state.language === "en"
                                              ? "Admin"
                                              : "أدمن"}
                                          </>
                                        ) : (
                                          <>
                                            <User size={12} />{" "}
                                            {state.language === "en"
                                              ? "User"
                                              : "مستخدم"}
                                          </>
                                        )}
                                      </span>
                                    </td>
                                    <td>
                                      <div
                                        style={{
                                          flex: 1,
                                          height: 5,
                                          background: "rgba(255,255,255,0.06)",
                                          borderRadius: 4,
                                          overflow: "hidden",
                                          marginBottom: 4,
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: `${Math.round(((u.appState?.completedSteps?.length || 0) / totalSteps) * 100)}%`,
                                            height: "100%",
                                            background: "var(--accent)",
                                          }}
                                        />
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 9,
                                          color: "var(--text3)",
                                        }}
                                      >
                                        {u.appState?.completedSteps?.length ||
                                          0}{" "}
                                        / {TOTAL_STEPS_COUNT}
                                      </div>
                                    </td>
                                    <td>
                                      <span
                                        className="ad-date"
                                        style={{ fontFamily: "var(--font)" }}
                                      >
                                        {formatDate(u.createdAt)}
                                      </span>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: 6,
                                          justifyContent: "center",
                                        }}
                                      >
                                        <motion.button
                                          className="sa-action-btn view"
                                          onClick={() =>
                                            setViewingUserDetails(u)
                                          }
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          title={
                                            state.language === "en"
                                              ? "View Details"
                                              : "عرض التفاصيل"
                                          }
                                        >
                                          <Eye size={15} />
                                        </motion.button>
                                        <motion.button
                                          className="sa-action-btn edit"
                                          onClick={() => handleEditClick(u)}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          title={
                                            state.language === "en"
                                              ? "Edit User"
                                              : "تعديل البيانات"
                                          }
                                        >
                                          <Edit size={15} />
                                        </motion.button>
                                        <motion.button
                                          className="sa-action-btn view"
                                          onClick={() => {
                                            setRenewPlanUser(u);
                                            setRenewPlanId(u.planId || "free");
                                          }}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          title={
                                            state.language === "en"
                                              ? "Renew Plan"
                                              : "\u062a\u062c\u062f\u064a\u062f \u0627\u0644\u062e\u0637\u0629"
                                          }
                                          style={{ color: "#10B981" }}
                                        >
                                          <RefreshCw size={15} />
                                        </motion.button>
                                        <motion.button
                                          className="sa-action-btn delete"
                                          onClick={() => setUserToDelete(u)}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          title={
                                            state.language === "en"
                                              ? "Delete User"
                                              : "حذف المستخدم"
                                          }
                                        >
                                          <Trash2 size={15} />
                                        </motion.button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination Bar */}
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeTab === "sales" ? (
            <div className="ad-content animate-in">
              <AdminSales subUsers={regularUsers} />
            </div>
          ) : activeTab === "subscriptions" ? (
            <motion.div
              className="ad-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ad-table-card">
                {/* Header section with title and action buttons */}
                <div
                  className="sa-card-header"
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div
                      className="sa-card-title"
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Gem size={20} style={{ color: "var(--accent)" }} />
                      <span>
                        {state.language === "en"
                          ? "Your Subscription Plans"
                          : "باقات الاشتراك الخاصة بك"}
                      </span>
                      <span className="sa-card-count">
                        {filteredPlans.length}
                      </span>
                    </div>

                    <div
                      className="sa-filter-group"
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Sync with Stripe */}
                      <button
                        type="button"
                        className="btn"
                        onClick={handleSyncStripePlans}
                        disabled={isSyncingStripe}
                        style={{
                          background: "#6772E5",
                          color: "#fff",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: isSyncingStripe ? "not-allowed" : "pointer",
                          padding: "8px 14px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        <RefreshCw
                          size={15}
                          className={isSyncingStripe ? "animate-spin" : ""}
                        />
                        <span>
                          {isSyncingStripe
                            ? state.language === "en"
                              ? "Syncing..."
                              : "جاري المزامنة..."
                            : state.language === "en"
                              ? "Sync with Stripe"
                              : "مزامنة مع Stripe"}
                        </span>
                      </button>

                      {/* Add New Plan */}
                      <button
                        type="button"
                        className="sa-add-prod-btn"
                        onClick={() => {
                          setEditingPlan(null);
                          setPlanName("");
                          setPlanNameEn("");
                          setPlanPrice("");
                          setPlanCredits("20");
                          setPlanCurrency("EGP");
                          setPlanPaddlePriceId("");
                          setDynamicFeaturesAr([""]);
                          setDynamicFeaturesEn([""]);
                          setIsPlanModalOpen(true);
                        }}
                      >
                        <PlusCircle size={15} />
                        <span>
                          {state.language === "en"
                            ? "Add New Plan"
                            : "إضافة باقة جديدة"}
                        </span>
                      </button>

                      {/* Export CSV */}
                      <button
                        type="button"
                        className="sa-export-btn"
                        onClick={() => {
                          let csvContent = "\uFEFF";
                          csvContent +=
                            "اسم الباقة,Name (EN),السعر,العملة,المميزات (عربي),Features (EN),Stripe ID\n";
                          filteredPlans.forEach((p) => {
                            const nameAr = p.name_ar || p.name || "—";
                            const nameEn = p.name_en || "—";
                            const price = p.price || 0;
                            const curr = p.currency || "EGP";
                            const featAr =
                              typeof (p.features_ar || p.features) === "string"
                                ? (p.features_ar || p.features).replace(
                                    /\n/g,
                                    " • ",
                                  )
                                : Array.isArray(p.features_ar || p.features)
                                  ? (p.features_ar || p.features).join(" • ")
                                  : "—";
                            const featEn =
                              typeof p.features_en === "string"
                                ? p.features_en.replace(/\n/g, " • ")
                                : Array.isArray(p.features_en)
                                  ? p.features_en.join(" • ")
                                  : "—";
                            const stripeId =
                              p.stripe_product_id || "غير متزامن";
                            csvContent += `"${nameAr}","${nameEn}","${price}","${curr}","${featAr}","${featEn}","${stripeId}"\n`;
                          });
                          const blob = new Blob([csvContent], {
                            type: "text/csv;charset=utf-8;",
                          });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.setAttribute("href", url);
                          link.setAttribute(
                            "download",
                            `subscription_plans_${new Date().toISOString().slice(0, 10)}.csv`,
                          );
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        title={
                          state.language === "en"
                            ? "Export to CSV"
                            : "تصدير الباقات إلى CSV"
                        }
                      >
                        <Download size={15} />
                        <span>
                          {state.language === "en" ? "Export CSV" : "تصدير CSV"}
                        </span>
                      </button>

                      {/* Reset Filters */}
                      {(plansSearchQuery !== "" ||
                        plansCurrencyFilter !== "all") && (
                        <button
                          type="button"
                          className="sa-reset-btn"
                          onClick={() => {
                            setPlansSearchQuery("");
                            setPlansCurrencyFilter("all");
                          }}
                          title={
                            state.language === "en"
                              ? "Reset Filters"
                              : "إعادة تعيين الفلاتر"
                          }
                        >
                          <RotateCcw size={14} />
                          <span>
                            {state.language === "en" ? "Reset" : "إعادة تعيين"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search and Filters Bar */}
                  <div
                    className="sa-filters-bar"
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div className="sa-filters-left">
                      <CustomSelect
                        value={plansCurrencyFilter}
                        onChange={setPlansCurrencyFilter}
                        options={[
                          {
                            value: "all",
                            label:
                              state.language === "en"
                                ? "All Currencies"
                                : "كل العملات",
                            icon: Globe,
                          },
                          {
                            value: "EGP",
                            label:
                              state.language === "en"
                                ? "EGP (ج.م)"
                                : "جنيه مصري (EGP)",
                            icon: DollarSign,
                          },
                          {
                            value: "USD",
                            label:
                              state.language === "en"
                                ? "USD ($)"
                                : "دولار أمريكي (USD)",
                            icon: DollarSign,
                          },
                          {
                            value: "SAR",
                            label:
                              state.language === "en"
                                ? "SAR (ر.س)"
                                : "ريال سعودي (SAR)",
                            icon: DollarSign,
                          },
                          {
                            value: "AED",
                            label:
                              state.language === "en"
                                ? "AED (د.إ)"
                                : "درهم إماراتي (AED)",
                            icon: DollarSign,
                          },
                          {
                            value: "KWD",
                            label:
                              state.language === "en"
                                ? "KWD (د.ك)"
                                : "دينار كويتي (KWD)",
                            icon: DollarSign,
                          },
                          {
                            value: "EUR",
                            label:
                              state.language === "en"
                                ? "EUR (€)"
                                : "يورو (EUR)",
                            icon: DollarSign,
                          },
                        ]}
                      />
                    </div>
                    <div
                      className="sa-filters-right"
                      style={{ flex: "1 1 250px", maxWidth: 400 }}
                    >
                      <div
                        className="sa-search-box"
                        style={{
                          margin: 0,
                          position: "relative",
                          width: "100%",
                        }}
                      >
                        <input
                          type="text"
                          placeholder={
                            state.language === "en"
                              ? "Search plans..."
                              : "بحث في الباقات..."
                          }
                          value={plansSearchQuery}
                          onChange={(e) => setPlansSearchQuery(e.target.value)}
                          dir={state.language === "en" ? "ltr" : "rtl"}
                          style={{
                            width: "100%",
                            paddingRight: state.language === "en" ? 12 : 32,
                            paddingLeft: state.language === "en" ? 32 : 12,
                          }}
                        />
                        <Search
                          size={14}
                          style={{
                            position: "absolute",
                            right: state.language === "en" ? "auto" : 12,
                            left: state.language === "en" ? 12 : "auto",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text3)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plans Table Section */}
                <div className="sa-table-wrapper" dir="rtl">
                  <table className="sa-table" dir="rtl">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "center" }}>
                          {state.language === "en" ? "Plan Name" : "اسم الباقة"}
                        </th>
                        <th style={{ textAlign: "center" }}>
                          {state.language === "en"
                            ? "Price & Currency"
                            : "السعر والعملة"}
                        </th>
                        <th style={{ textAlign: "center" }}>
                          {state.language === "en"
                            ? "Credits"
                            : "الرصيد"}
                        </th>
                        <th style={{ textAlign: "center" }}>
                          {state.language === "en" ? "Features" : "المميزات"}
                        </th>
                        <th style={{ textAlign: "center" }}>
                          {state.language === "en" ? "Actions" : "الإجراءات"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPlans.map((p) => {
                        const featArList =
                          typeof (p.features_ar || p.features) === "string"
                            ? (p.features_ar || p.features)
                                .split("\n")
                                .filter(Boolean)
                            : Array.isArray(p.features_ar || p.features)
                              ? p.features_ar || p.features
                              : [];
                        const featEnList =
                          typeof p.features_en === "string"
                            ? p.features_en.split("\n").filter(Boolean)
                            : Array.isArray(p.features_en)
                              ? p.features_en
                              : [];
                        const totalFeatsCount = Math.max(
                          featArList.length,
                          featEnList.length,
                        );

                        return (
                          <tr key={p.id}>
                            <td style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  fontWeight: "bold",
                                  color: "#fff",
                                  fontSize: 14,
                                }}
                              >
                                {state.language === "en"
                                  ? p.name_en || p.name_ar || p.name
                                  : p.name_ar || p.name}
                              </div>
                              {state.language !== "en" && p.name_en && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text3)",
                                    marginTop: 2,
                                  }}
                                >
                                  {p.name_en}
                                </div>
                              )}
                              {p.paddlePriceId && (
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: "#00bfff",
                                    marginTop: 4,
                                    fontFamily: "monospace",
                                  }}
                                >
                                  Paddle ID: {p.paddlePriceId}
                                </div>
                              )}
                              {p.stripe_product_id ? (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    marginTop: 6,
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "var(--green)",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    ✓{" "}
                                    {state.language === "en"
                                      ? "Stripe Synced"
                                      : "متزامن مع Stripe"}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 8,
                                      color: "var(--text3)",
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    Prod ID: {p.stripe_product_id}
                                  </div>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "#F59E0B",
                                    fontWeight: "bold",
                                    marginTop: 6,
                                  }}
                                >
                                  ⚠️{" "}
                                  {state.language === "en"
                                    ? "Not Synced"
                                    : "غير متزامن مع Stripe"}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span
                                style={{
                                  color: "var(--green)",
                                  fontWeight: 800,
                                  fontSize: 14,
                                }}
                              >
                                {p.price}{" "}
                                {p.currency === "USD"
                                  ? "$"
                                  : p.currency === "SAR"
                                    ? "ر.س"
                                    : p.currency === "AED"
                                      ? "د.إ"
                                      : p.currency === "KWD"
                                        ? "د.ك"
                                        : "ج.م"}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span
                                style={{
                                  color: "var(--accent)",
                                  fontWeight: 800,
                                  fontSize: 14,
                                }}
                              >
                                {p.creditsPerMonth || 0}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                className="sa-media-badge sa-media-badge-auto"
                                onClick={() =>
                                  setViewingPlanFeatures({
                                    ...p,
                                    featArList,
                                    featEnList,
                                  })
                                }
                                title={
                                  state.language === "en"
                                    ? "Click to view features"
                                    : "اضغط لمشاهدة كافة المميزات"
                                }
                                style={{
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  margin: "0 auto",
                                }}
                              >
                                <Sparkles
                                  size={12}
                                  style={{ color: "var(--accent)" }}
                                />
                                <span>
                                  {state.language === "en"
                                    ? `${totalFeatsCount} ${totalFeatsCount === 1 ? "Feature" : "Features"}`
                                    : `${totalFeatsCount} مميزات`}
                                </span>
                                <Eye size={12} style={{ opacity: 0.8 }} />
                              </button>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <button
                                  type="button"
                                  className="btn btn-xs btn-outline sa-action-btn"
                                  title={
                                    state.language === "en"
                                      ? "Edit Plan"
                                      : "تعديل الباقة"
                                  }
                                  onClick={() => {
                                    setEditingPlan(p);
                                    setPlanName(p.name_ar || p.name || "");
                                    setPlanNameEn(p.name_en || "");
                                    setPlanPrice(p.price || "");
                                    setPlanCredits(p.creditsPerMonth || "20");
                                    setPlanCurrency(p.currency || "EGP");
                                    setPlanPaddlePriceId(p.paddlePriceId || "");
                                    setDynamicFeaturesAr(
                                      featArList.length > 0 ? featArList : [""],
                                    );
                                    setDynamicFeaturesEn(
                                      featEnList.length > 0 ? featEnList : [""],
                                    );
                                    setIsPlanModalOpen(true);
                                  }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="sa-delete-btn btn-xs sa-action-btn"
                                  title={
                                    state.language === "en"
                                      ? "Delete Plan"
                                      : "حذف الباقة"
                                  }
                                  onClick={async () => {
                                    const planLabel =
                                      p.name_ar || p.name || p.name_en;
                                    const isConfirmed = await confirm(
                                      state.language === "en"
                                        ? `Are you sure you want to delete the plan "${planLabel}"?`
                                        : `هل أنت تأكد من حذف الباقة "${planLabel}"؟`,
                                      state.language === "en"
                                        ? "Confirm Delete"
                                        : "تأكيد الحذف",
                                    );
                                    if (!isConfirmed) return;
                                    setPlans(
                                      plans.filter((pl) => pl.id !== p.id),
                                    );
                                    toast(
                                      state.language === "en"
                                        ? "Plan deleted successfully"
                                        : "تم حذف الباقة بنجاح",
                                      "success",
                                    );
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {paginatedPlans.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            style={{ padding: "40px 0", textAlign: "center" }}
                          >
                            <div
                              className="sa-empty"
                              style={{
                                background: "none",
                                boxShadow: "none",
                                padding: 0,
                              }}
                            >
                              <div
                                className="sa-empty-icon"
                                style={{
                                  background: "none",
                                  fontSize: "inherit",
                                  padding: 0,
                                }}
                              >
                                <Gem
                                  size={48}
                                  style={{
                                    color: "var(--text3)",
                                    opacity: 0.6,
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  marginTop: 12,
                                  color: "var(--text2)",
                                  fontWeight: 700,
                                }}
                              >
                                {state.language === "en"
                                  ? "No subscription plans found"
                                  : "لا توجد باقات اشتراك مطابقة"}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Component */}
                <Pagination
                  currentPage={plansCurrentPage}
                  totalPages={totalPlansPages}
                  onPageChange={setPlansCurrentPage}
                  totalItems={filteredPlans.length}
                  itemsPerPage={6}
                  itemLabel={state.language === "en" ? "plans" : "باقة"}
                />
              </div>

              {/* Save All Changes Button */}
              <div
                style={{
                  marginTop: 24,
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  type="button"
                  className="ad-submit-btn"
                  style={{
                    width: "auto",
                    minWidth: 260,
                    padding: "12px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onClick={handleUpdateAdminProfile}
                  disabled={isUpdatingProfile}
                >
                  <Save size={16} />
                  <span>
                    {isUpdatingProfile
                      ? state.language === "en"
                        ? "Saving..."
                        : "جاري الحفظ..."
                      : state.language === "en"
                        ? "Save Plans Changes"
                        : "حفظ التعديلات في الباقات"}
                  </span>
                </button>
              </div>
            </motion.div>
          ) : activeTab === "trial_settings" ? (
            <div
              className="ad-content animate-in"
              dir={state.language === "en" ? "ltr" : "rtl"}
              style={{ textAlign: state.language === "en" ? "left" : "right" }}
            >
              <div className="ad-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div
                  className="ad-table-card"
                  style={{ padding: "24px", position: "relative" }}
                >
                  {/* Header Bar */}
                  <div
                    className="ad-card-header"
                    style={{
                      marginBottom: "24px",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div
                        className="ad-card-title"
                        style={{
                          fontSize: "20px",
                          fontWeight: "900",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Gift size={22} style={{ color: "var(--accent)" }} />
                        <span>
                          {state.language === "en"
                            ? "Free Trial Settings"
                            : "إعدادات الفترة المجانية للعملاء"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text3)",
                          marginTop: "4px",
                        }}
                      >
                        {state.language === "en"
                          ? "Configure trial duration, tool permissions, and preview client experience."
                          : "حدد مدة الفترة التجريبية وصلاحيات وصول الأدوات، وتخصيص تجربة المستخدمين الجدد."}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setIsTrialPreviewModalOpen(true)}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        color: "var(--accent)",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.15)",
                        cursor: "pointer",
                      }}
                    >
                      <Eye size={18} />
                      <span>
                        {state.language === "en"
                          ? "Client Experience Preview"
                          : " معاينة كعميل"}
                      </span>
                    </motion.button>
                  </div>

                  {/* Top Summary Stats Cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    {/* Stat 1: Active Trial Users */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: "14px",
                          background: "rgba(16, 185, 129, 0.15)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <UserCheck
                          size={26}
                          style={{ color: "var(--green)" }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text2)",
                            fontWeight: "700",
                          }}
                        >
                          {state.language === "en"
                            ? "Active Trial Users"
                            : "المستخدمون النشطون في التجربة"}
                        </div>
                        <div
                          style={{
                            fontSize: "26px",
                            fontWeight: "900",
                            color: "#fff",
                            marginTop: "2px",
                          }}
                        >
                          <AnimatedCounter value={activeTrialUsersCount} />
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--green)",
                            fontWeight: "600",
                            marginTop: "2px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <CheckCircle2
                            size={12}
                            style={{ color: "var(--green)" }}
                          />
                          <span>
                            {state.language === "en"
                              ? "Currently active in free trial"
                              : "نشطون حالياً في فترة التجربة"}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Stat 2: Expired Trial Users */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: "14px",
                          background: "rgba(245, 158, 11, 0.15)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Clock
                          size={26}
                          style={{ color: "var(--amber, #f59e0b)" }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text2)",
                            fontWeight: "700",
                          }}
                        >
                          {state.language === "en"
                            ? "Expired Trial Users"
                            : "فترات تجريبية منتهية"}
                        </div>
                        <div
                          style={{
                            fontSize: "26px",
                            fontWeight: "900",
                            color: "#fff",
                            marginTop: "2px",
                          }}
                        >
                          <AnimatedCounter value={expiredTrialUsersCount} />
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--amber, #f59e0b)",
                            fontWeight: "600",
                            marginTop: "2px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Clock
                            size={12}
                            style={{ color: "var(--amber, #f59e0b)" }}
                          />
                          <span>
                            {state.language === "en"
                              ? "Expired (unconverted)"
                              : "انتهت تجربتهم ولم ترقّ حساباتهم"}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Stat 3: Active Allowed Tools Count */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)",
                        border: "1px solid rgba(59, 130, 246, 0.25)",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: "14px",
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Sparkles
                          size={26}
                          style={{ color: "var(--accent)" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text2)",
                            fontWeight: "700",
                          }}
                        >
                          {state.language === "en"
                            ? "Available Trial Tools"
                            : "الأدوات المتاحة للتجربة"}
                        </div>
                        <div
                          style={{
                            fontSize: "26px",
                            fontWeight: "900",
                            color: "#fff",
                            marginTop: "2px",
                          }}
                        >
                          <AnimatedCounter value={allowedTrialTools.length} /> /{" "}
                          {CHECKLIST_ITEMS.length}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                            marginTop: "4px",
                          }}
                        >
                          {[
                            {
                              label:
                                state.language === "en"
                                  ? "Niche Analyzer"
                                  : "تحليل النيتش",
                            },
                            {
                              label:
                                state.language === "en"
                                  ? "Competitors"
                                  : "دراسة المنافسين",
                            },
                            {
                              label:
                                state.language === "en"
                                  ? "Ad Copy"
                                  : "كاتب الإعلانات",
                            },
                          ].map((t, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: "9px",
                                fontWeight: "700",
                                background: "rgba(59, 130, 246, 0.12)",
                                color: "var(--accent)",
                                border: "1px solid rgba(59, 130, 246, 0.25)",
                                padding: "2px 6px",
                                borderRadius: "10px",
                              }}
                            >
                              {t.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="ad-form-body" style={{ padding: 0 }}>
                    {/* Trial Duration Quick Picks & Validation */}
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        padding: "24px",
                        borderRadius: "16px",
                        border: "1px solid var(--line)",
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "16px",
                        }}
                      >
                        <Clock size={20} style={{ color: "var(--accent)" }} />
                        <label
                          style={{
                            fontSize: "15px",
                            fontWeight: "800",
                            color: "#fff",
                          }}
                        >
                          {state.language === "en"
                            ? "Trial Duration (Days)"
                            : "مدة الفترة المجانية المسموح بها (بالأيام)"}
                        </label>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <input
                            type="number"
                            min="1"
                            max="90"
                            className="field-input"
                            style={{
                              width: "110px",
                              fontSize: "18px",
                              fontWeight: "800",
                              textAlign: "center",
                              background: "rgba(0, 0, 0, 0.3)",
                              borderColor:
                                freeTrialDays < 1 || freeTrialDays > 90
                                  ? "var(--red)"
                                  : "var(--accent)",
                              color: "#fff",
                            }}
                            value={freeTrialDays}
                            onChange={(e) =>
                              setFreeTrialDays(Number(e.target.value))
                            }
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              color: "var(--text2)",
                              fontWeight: "600",
                            }}
                          >
                            {state.language === "en"
                              ? "Days starting from registration date"
                              : "أيام تجريبية تبدأ تلقائياً من تاريخ التسجيل"}
                          </span>
                        </div>

                        {/* Quick Picks Preset Buttons */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginLeft: state.language === "en" ? "auto" : "0",
                            marginRight: state.language === "en" ? "0" : "auto",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text3)",
                              fontWeight: "700",
                            }}
                          >
                            {state.language === "en"
                              ? "Quick Presets:"
                              : "خيارات سريعة:"}
                          </span>
                          {[3, 7, 14, 30].map((preset) => {
                            const isSelected = freeTrialDays === preset;
                            return (
                              <motion.button
                                key={preset}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFreeTrialDays(preset)}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  background: isSelected
                                    ? "var(--accent)"
                                    : "rgba(255, 255, 255, 0.05)",
                                  color: isSelected ? "#fff" : "var(--text2)",
                                  border: isSelected
                                    ? "1px solid var(--accent)"
                                    : "1px solid rgba(255, 255, 255, 0.1)",
                                  boxShadow: isSelected
                                    ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                                    : "none",
                                }}
                              >
                                {preset}{" "}
                                {state.language === "en"
                                  ? "Days"
                                  : preset === 3
                                    ? "أيام"
                                    : preset === 7
                                      ? "أيام"
                                      : "يوم"}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Real-time Inline Validation Warnings */}
                      {freeTrialDays < 1 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          style={{
                            marginTop: "14px",
                            padding: "10px 14px",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "8px",
                            color: "var(--red)",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <AlertTriangle size={16} />
                          <span>
                            {state.language === "en"
                              ? "Minimum trial duration is 1 day."
                              : "تنبيه: الحد الأقصى الأدنى للفترة المجانية هو يوم واحد."}
                          </span>
                        </motion.div>
                      )}
                      {freeTrialDays > 90 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          style={{
                            marginTop: "14px",
                            padding: "10px 14px",
                            background: "rgba(245, 158, 11, 0.1)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            borderRadius: "8px",
                            color: "var(--amber, #f59e0b)",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <AlertTriangle size={16} />
                          <span>
                            {state.language === "en"
                              ? "Warning: Recommended maximum trial duration is 90 days."
                              : "تنبيه: الحد الأقصى الموصى به للفترة التجريبية هو 90 يوماً."}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Auto-Include Future Tools Option */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(13, 18, 32, 0.6) 100%)",
                        padding: "20px 24px",
                        borderRadius: "16px",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        marginBottom: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          flex: "1 1 300px",
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            background: "rgba(59, 130, 246, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Sparkles
                            size={24}
                            style={{ color: "var(--accent)" }}
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "800",
                              color: "#fff",
                            }}
                          >
                            {state.language === "en"
                              ? "Auto-Include Future Tools"
                              : "السماح للأدوات المستقبلية تلقائيًا"}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text2)",
                              marginTop: "2px",
                            }}
                          >
                            {state.language === "en"
                              ? "Automatically grant trial users access to any newly added platform tools."
                              : "تفعيل هذا الخيار سيمنح مستخدمي الفترة المجانية وصولاً تلقائياً لأي أداة جديدة يتم إضافتها مستقبلاً في المنصة."}
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() =>
                          setAutoIncludeNewTools(!autoIncludeNewTools)
                        }
                        style={{
                          background: autoIncludeNewTools
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(255, 255, 255, 0.05)",
                          border: autoIncludeNewTools
                            ? "1px solid var(--green)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          color: autoIncludeNewTools
                            ? "var(--green)"
                            : "var(--text3)",
                          fontSize: "12px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {autoIncludeNewTools ? (
                          <>
                            <CheckCircle2
                              size={16}
                              style={{ color: "var(--green)" }}
                            />
                            <span>
                              {state.language === "en"
                                ? "Enabled (Auto Access)"
                                : "مفعّل (وصول تلقائي)"}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle
                              size={16}
                              style={{ color: "var(--text3)" }}
                            />
                            <span>
                              {state.language === "en"
                                ? "Disabled (Manual Only)"
                                : "معطّل (تحديد يدوي فقط)"}
                            </span>
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Accordion Tool Groups & Interactive Checkbox Cards */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginBottom: "20px",
                        background: "rgba(255, 255, 255, 0.01)",
                        padding: "16px 20px",
                        borderRadius: "12px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "800",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <SlidersHorizontal
                            size={18}
                            style={{ color: "var(--accent)" }}
                          />
                          <span>
                            {state.language === "en"
                              ? "Tool Access Permissions"
                              : "تحديد صلاحيات الوصول للأدوات والأقسام"}
                          </span>
                          <span
                            style={{
                              background: "rgba(59, 130, 246, 0.12)",
                              color: "var(--accent)",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              fontSize: "11px",
                              fontWeight: "800",
                              padding: "2px 10px",
                              borderRadius: "12px",
                            }}
                          >
                            {allowedTrialTools.length} /{" "}
                            {CHECKLIST_ITEMS.length}{" "}
                            {state.language === "en" ? "Active" : "أداة مفعّلة"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text3)",
                            marginTop: "4px",
                          }}
                        >
                          {state.language === "en"
                            ? "Click any tool card to toggle trial availability. Selected tools show active, unchecked show locked."
                            : "اضغط على أي كارت لتفعيله أو إلغائه. الأدوات المحددة تظهر متاحة وغير المحددة ستظهر مقفلة للمشتركين مجاناً."}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          className="btn btn-xs"
                          onClick={() =>
                            setAllowedTrialTools(
                              CHECKLIST_ITEMS.map((item) => item.id),
                            )
                          }
                          style={{
                            background: "rgba(59, 130, 246, 0.12)",
                            color: "var(--accent)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>
                            {state.language === "en"
                              ? "Select All"
                              : "تحديد جميع الأدوات"}
                          </span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          className="btn btn-xs"
                          onClick={() => setAllowedTrialTools([])}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "var(--red)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <XCircle size={14} />
                          <span>
                            {state.language === "en"
                              ? "Deselect All"
                              : "إلغاء تحديد الكل"}
                          </span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Collapsible Tool Categories */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {[
                        {
                          id: 0,
                          icon: Target,
                          title:
                            state.language === "en"
                              ? "Analysis & Identity Building"
                              : "التحليل وبناء الهوية",
                          items: CHECKLIST_ITEMS.filter(
                            (item) =>
                              item.group_ar === "التحليل والهوية" ||
                              item.group_en === "Analysis & Identity",
                          ),
                        },
                        {
                          id: 1,
                          icon: ShoppingBag,
                          title:
                            state.language === "en"
                              ? "Store Setup & Pages"
                              : "بناء وتجهيز المتجر والصفحات",
                          items: CHECKLIST_ITEMS.filter(
                            (item) =>
                              item.group_ar === "بناء وتجهيز المتجر" ||
                              item.group_en === "Store Setup",
                          ),
                        },
                        {
                          id: 2,
                          icon: Package,
                          title:
                            state.language === "en"
                              ? "Product, Profit & Pricing"
                              : "المنتج والربحية والتسعير",
                          items: CHECKLIST_ITEMS.filter(
                            (item) =>
                              item.group_ar === "المنتج والربحية" ||
                              item.group_en === "Product & Profit",
                          ),
                        },
                        {
                          id: 3,
                          icon: Sparkles,
                          title:
                            state.language === "en"
                              ? "Content & Digital Marketing"
                              : "صناعة المحتوى والتسويق الرقمي",
                          items: CHECKLIST_ITEMS.filter(
                            (item) =>
                              item.group_ar === "المحتوى والتسويق" ||
                              item.group_en === "Content & Marketing",
                          ),
                        },
                        {
                          id: 4,
                          icon: Cpu,
                          title:
                            state.language === "en"
                              ? "Smart Management & Ops"
                              : "الإدارة والتشغيل الذكي",
                          items: CHECKLIST_ITEMS.filter(
                            (item) =>
                              item.group_ar === "إدارة وتشغيل" ||
                              item.group_en === "Management & Ops",
                          ),
                        },
                        {
                          id: 5,
                          icon: Briefcase,
                          title:
                            state.language === "en"
                              ? "Freelance & Agency Tools"
                              : "أدوات العمل الحر وفريلانس",
                          items: CHECKLIST_ITEMS.filter(
                            (item) => item.section === "freelance",
                          ),
                        },
                        {
                          id: 6,
                          icon: BookOpen,
                          title:
                            state.language === "en"
                              ? "Additional Resources & Tools"
                              : "موارد وأقسام إضافية",
                          items: CHECKLIST_ITEMS.filter(
                            (item) => item.section === "additional",
                          ),
                        },
                      ].map((group) => {
                        if (!group.items || group.items.length === 0)
                          return null;
                        const isExpanded = Boolean(
                          expandedTrialGroups[group.id],
                        );
                        const selectedCount = group.items.filter((item) =>
                          allowedTrialTools.includes(item.id),
                        ).length;
                        const totalCount = group.items.length;
                        const progressPercent = Math.round(
                          (selectedCount / totalCount) * 100,
                        );
                        const GroupIcon = group.icon;

                        return (
                          <div
                            key={group.id}
                            style={{
                              background: "rgba(255, 255, 255, 0.015)",
                              border: "1px solid rgba(255, 255, 255, 0.05)",
                              borderRadius: "14px",
                              overflow: "hidden",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {/* Category Header */}
                            <motion.div
                              whileHover={{
                                backgroundColor: "rgba(255, 255, 255, 0.035)",
                              }}
                              onClick={() =>
                                setExpandedTrialGroups((prev) => ({
                                  ...prev,
                                  [group.id]: !isExpanded,
                                }))
                              }
                              style={{
                                padding: "16px 20px",
                                background: isExpanded
                                  ? "rgba(255, 255, 255, 0.03)"
                                  : "rgba(255, 255, 255, 0.01)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px",
                                userSelect: "none",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  flex: 1,
                                }}
                              >
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "8px",
                                    background: "rgba(59, 130, 246, 0.12)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <GroupIcon
                                    size={18}
                                    style={{ color: "var(--accent)" }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "800",
                                    color: "#fff",
                                  }}
                                >
                                  {group.title}
                                </span>
                                {/* Live Progress Badge */}
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    padding: "2px 10px",
                                    borderRadius: "12px",
                                    background:
                                      selectedCount === totalCount
                                        ? "rgba(16, 185, 129, 0.15)"
                                        : selectedCount > 0
                                          ? "rgba(59, 130, 246, 0.15)"
                                          : "rgba(255, 255, 255, 0.05)",
                                    color:
                                      selectedCount === totalCount
                                        ? "var(--green)"
                                        : selectedCount > 0
                                          ? "var(--accent)"
                                          : "var(--text3)",
                                    border:
                                      selectedCount === totalCount
                                        ? "1px solid rgba(16, 185, 129, 0.3)"
                                        : selectedCount > 0
                                          ? "1px solid rgba(59, 130, 246, 0.3)"
                                          : "1px solid rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  {selectedCount}/{totalCount}{" "}
                                  {state.language === "en"
                                    ? "active"
                                    : "مفعّلة"}{" "}
                                  ({progressPercent}%)
                                </span>
                              </div>

                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown
                                  size={18}
                                  style={{ color: "var(--text2)" }}
                                />
                              </motion.div>
                            </motion.div>

                            {/* Category Body / Accordion Items */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                >
                                  <div
                                    style={{
                                      padding: "16px 20px 20px",
                                      display: "grid",
                                      gridTemplateColumns:
                                        "repeat(auto-fill, minmax(240px, 1fr))",
                                      gap: "12px",
                                      borderTop:
                                        "1px solid rgba(255, 255, 255, 0.04)",
                                    }}
                                  >
                                    {group.items.map((item) => {
                                      const isChecked =
                                        allowedTrialTools.includes(item.id);
                                      const primaryLabel =
                                        state.language === "en"
                                          ? item.label_en ||
                                            item.label ||
                                            item.id
                                          : item.label_ar || item.label;
                                      const secondaryLabel =
                                        state.language === "en"
                                          ? item.label_ar || item.id
                                          : item.label_en || item.id;

                                      return (
                                        <motion.div
                                          key={item.id}
                                          whileHover={{ scale: 1.02, y: -2 }}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => {
                                            if (isChecked) {
                                              setAllowedTrialTools(
                                                allowedTrialTools.filter(
                                                  (t) => t !== item.id,
                                                ),
                                              );
                                            } else {
                                              setAllowedTrialTools([
                                                ...allowedTrialTools,
                                                item.id,
                                              ]);
                                            }
                                          }}
                                          style={{
                                            padding: "14px 16px",
                                            background: isChecked
                                              ? "rgba(16, 185, 129, 0.08)"
                                              : "rgba(255, 255, 255, 0.02)",
                                            border: isChecked
                                              ? "1px solid rgba(16, 185, 129, 0.35)"
                                              : "1px solid rgba(255, 255, 255, 0.05)",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            transition:
                                              "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                                            userSelect: "none",
                                            boxShadow: isChecked
                                              ? "0 4px 16px rgba(16, 185, 129, 0.08)"
                                              : "none",
                                          }}
                                        >
                                          {/* Checkbox indicator */}
                                          <div
                                            style={{
                                              width: 20,
                                              height: 20,
                                              borderRadius: 6,
                                              border: isChecked
                                                ? "none"
                                                : "1.5px solid rgba(255, 255, 255, 0.25)",
                                              background: isChecked
                                                ? "var(--green)"
                                                : "transparent",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              color: "#fff",
                                              flexShrink: 0,
                                              transition: "all 0.2s ease",
                                            }}
                                          >
                                            {isChecked && (
                                              <Check
                                                size={14}
                                                strokeWidth={3}
                                              />
                                            )}
                                          </div>

                                          <div
                                            style={{
                                              width: 34,
                                              height: 34,
                                              borderRadius: "8px",
                                              background:
                                                "rgba(255, 255, 255, 0.05)",
                                              border:
                                                "1px solid rgba(255, 255, 255, 0.08)",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              flexShrink: 0,
                                            }}
                                          >
                                            {getToolVectorIcon(item, 18)}
                                          </div>

                                          <div
                                            style={{
                                              flex: 1,
                                              overflow: "hidden",
                                            }}
                                          >
                                            <div
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: isChecked
                                                  ? "800"
                                                  : "600",
                                                color: isChecked
                                                  ? "#fff"
                                                  : "var(--text2)",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                              }}
                                            >
                                              {primaryLabel}
                                            </div>
                                            <div
                                              style={{
                                                fontSize: "9px",
                                                color: "var(--text3)",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                              }}
                                            >
                                              {secondaryLabel}
                                            </div>
                                          </div>

                                          {/* Status badge */}
                                          {isChecked ? (
                                            <span
                                              style={{
                                                fontSize: "10px",
                                                color: "var(--green)",
                                                fontWeight: "700",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                              }}
                                            >
                                              <CheckCircle2
                                                size={12}
                                                style={{
                                                  color: "var(--green)",
                                                }}
                                              />
                                              <span>
                                                {state.language === "en"
                                                  ? "Active"
                                                  : "متاح"}
                                              </span>
                                            </span>
                                          ) : (
                                            <span
                                              style={{
                                                fontSize: "10px",
                                                color: "var(--text3)",
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                              }}
                                            >
                                              <Lock
                                                size={12}
                                                style={{
                                                  color: "var(--text3)",
                                                }}
                                              />
                                              <span>
                                                {state.language === "en"
                                                  ? "Locked"
                                                  : "مقفل"}
                                              </span>
                                            </span>
                                          )}
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sticky Bottom Action Bar */}
                    <div
                      style={{
                        position: "sticky",
                        bottom: "16px",
                        zIndex: 40,
                        marginTop: "32px",
                        background: "rgba(13, 18, 32, 0.95)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "16px",
                        padding: "14px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexWrap: "wrap",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--accent)",
                            boxShadow: "0 0 10px var(--accent)",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text2)",
                            fontWeight: "700",
                          }}
                        >
                          {state.language === "en"
                            ? `Trial: ${freeTrialDays} Days | Active Tools: ${allowedTrialTools.length}/${CHECKLIST_ITEMS.length}`
                            : `مدة التجربة: ${freeTrialDays} يوماً | الأدوات المتاحة: ${allowedTrialTools.length} من ${CHECKLIST_ITEMS.length}`}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginLeft: state.language === "en" ? "auto" : "0",
                          marginRight: state.language === "en" ? "0" : "auto",
                        }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setFreeTrialDays(
                              userData?.freeTrialSettings?.days || 7,
                            );
                            setAllowedTrialTools(
                              userData?.freeTrialSettings?.allowedTools ||
                                CHECKLIST_ITEMS.map((s) => s.id),
                            );
                            setAutoIncludeNewTools(
                              userData?.freeTrialSettings
                                ?.autoIncludeNewTools ?? true,
                            );
                            toast(
                              state.language === "en"
                                ? "Reset to saved settings"
                                : "تمت الإعادة للإعدادات المحفوظة",
                              "info",
                            );
                          }}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "var(--text2)",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>
                            {state.language === "en" ? "Reset" : "إعادة تعيين"}
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          className="ad-submit-btn"
                          style={{
                            width: "auto",
                            minWidth: "180px",
                            padding: "10px 24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                          onClick={handleUpdateAdminProfile}
                          disabled={isUpdatingProfile}
                        >
                          {isUpdatingProfile ? (
                            <>
                              <Loader2 size={16} className="spin" />
                              <span>
                                {state.language === "en"
                                  ? "Saving..."
                                  : "جاري الحفظ..."}
                              </span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>
                                {state.language === "en"
                                  ? "Save Changes"
                                  : "حفظ التغييرات"}
                              </span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement 5: Instant Client Preview Modal */}
              <AnimatePresence>
                {isTrialPreviewModalOpen && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 100,
                      background: "rgba(0, 0, 0, 0.75)",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "20px",
                    }}
                    onClick={() => setIsTrialPreviewModalOpen(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 20 }}
                      transition={{ duration: 0.25 }}
                      onClick={(e) => e.stopPropagation()}
                      dir={state.language === "en" ? "ltr" : "rtl"}
                      style={{
                        width: "100%",
                        maxWidth: "850px",
                        maxHeight: "85vh",
                        background: "var(--bg2)",
                        border: "1px solid var(--line)",
                        borderRadius: "20px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
                        textAlign: state.language === "en" ? "left" : "right",
                      }}
                    >
                      {/* Modal Header */}
                      <div
                        style={{
                          padding: "20px 24px",
                          borderBottom: "1px solid var(--line)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "rgba(255, 255, 255, 0.02)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <Eye size={22} style={{ color: "var(--accent)" }} />
                          <div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "800",
                                color: "#fff",
                              }}
                            >
                              {state.language === "en"
                                ? "Client Experience Preview"
                                : "معاينة واجهة العميل في الفترة المجانية"}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--text3)",
                                marginTop: "2px",
                              }}
                            >
                              {state.language === "en"
                                ? "Preview how tools appear to a trial user under current settings."
                                : "شاهد كيف ستظهر أدوات المنصة للمستخدم الجديد بناءً على إعداداتك الحالية."}
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className="ad-sidebar-close-btn"
                          onClick={() => setIsTrialPreviewModalOpen(false)}
                          style={{ cursor: "pointer" }}
                        >
                          <X size={20} />
                        </motion.button>
                      </div>

                      {/* Modal Filter Tabs & Stats Bar */}
                      <div
                        style={{
                          padding: "16px 24px",
                          background: "rgba(0, 0, 0, 0.2)",
                          borderBottom: "1px solid var(--line)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px" }}>
                          {[
                            {
                              id: "all",
                              label:
                                state.language === "en"
                                  ? `All (${CHECKLIST_ITEMS.length})`
                                  : `جميع الأدوات (${CHECKLIST_ITEMS.length})`,
                            },
                            {
                              id: "unlocked",
                              label:
                                state.language === "en"
                                  ? `Unlocked (${allowedTrialTools.length})`
                                  : `المتاحة للتجربة (${allowedTrialTools.length})`,
                            },
                            {
                              id: "locked",
                              label:
                                state.language === "en"
                                  ? `Locked (${CHECKLIST_ITEMS.length - allowedTrialTools.length})`
                                  : `المقفلة (${CHECKLIST_ITEMS.length - allowedTrialTools.length})`,
                            },
                          ].map((tab) => (
                            <motion.button
                              key={tab.id}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setPreviewModalTab(tab.id)}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "700",
                                cursor: "pointer",
                                background:
                                  previewModalTab === tab.id
                                    ? "var(--accent)"
                                    : "rgba(255, 255, 255, 0.05)",
                                color:
                                  previewModalTab === tab.id
                                    ? "#fff"
                                    : "var(--text2)",
                                border:
                                  previewModalTab === tab.id
                                    ? "1px solid var(--accent)"
                                    : "1px solid rgba(255, 255, 255, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {tab.id === "unlocked" && <Unlock size={12} />}
                              {tab.id === "locked" && <Lock size={12} />}
                              <span>{tab.label}</span>
                            </motion.button>
                          ))}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text3)",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Clock size={13} style={{ color: "var(--accent)" }} />
                          <span>
                            {state.language === "en"
                              ? `Trial Period: ${freeTrialDays} Days`
                              : `مدة التجربة: ${freeTrialDays} أيام`}
                          </span>
                        </div>
                      </div>

                      {/* Modal Body Grid */}
                      <div
                        style={{ padding: "24px", overflowY: "auto", flex: 1 }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: "14px",
                          }}
                        >
                          {CHECKLIST_ITEMS.filter((item) => {
                            const isUnlocked = allowedTrialTools.includes(
                              item.id,
                            );
                            if (previewModalTab === "unlocked")
                              return isUnlocked;
                            if (previewModalTab === "locked")
                              return !isUnlocked;
                            return true;
                          }).map((item) => {
                            const isUnlocked = allowedTrialTools.includes(
                              item.id,
                            );
                            const primaryLabel =
                              state.language === "en"
                                ? item.label_en || item.label || item.id
                                : item.label_ar || item.label;
                            const secondaryLabel =
                              state.language === "en"
                                ? item.label_ar || item.id
                                : item.label_en || item.id;

                            return (
                              <div
                                key={item.id}
                                style={{
                                  padding: "16px",
                                  background: isUnlocked
                                    ? "rgba(16, 185, 129, 0.05)"
                                    : "rgba(239, 68, 68, 0.03)",
                                  border: isUnlocked
                                    ? "1px solid rgba(16, 185, 129, 0.25)"
                                    : "1px solid rgba(239, 68, 68, 0.2)",
                                  borderRadius: "12px",
                                  position: "relative",
                                  opacity: isUnlocked ? 1 : 0.75,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: "10px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 38,
                                      height: 38,
                                      borderRadius: "10px",
                                      background: "rgba(255, 255, 255, 0.05)",
                                      border:
                                        "1px solid rgba(255, 255, 255, 0.08)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {getToolVectorIcon(item, 20)}
                                  </div>
                                  {isUnlocked ? (
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: "800",
                                        color: "var(--green)",
                                        background: "rgba(16, 185, 129, 0.15)",
                                        padding: "2px 8px",
                                        borderRadius: "10px",
                                        border:
                                          "1px solid rgba(16, 185, 129, 0.3)",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <Unlock size={11} />
                                      <span>
                                        {state.language === "en"
                                          ? "Available"
                                          : "متاحة للتجربة"}
                                      </span>
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: "800",
                                        color: "var(--red)",
                                        background: "rgba(239, 68, 68, 0.15)",
                                        padding: "2px 8px",
                                        borderRadius: "10px",
                                        border:
                                          "1px solid rgba(239, 68, 68, 0.3)",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <Lock size={11} />
                                      <span>
                                        {state.language === "en"
                                          ? "Locked"
                                          : "مقفلة"}
                                      </span>
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "800",
                                    color: "#fff",
                                  }}
                                >
                                  {primaryLabel}
                                </div>
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: "var(--text3)",
                                    marginTop: "2px",
                                  }}
                                >
                                  {secondaryLabel}
                                </div>

                                <div style={{ marginTop: "14px" }}>
                                  {isUnlocked ? (
                                    <button
                                      type="button"
                                      disabled
                                      style={{
                                        width: "100%",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        background: "var(--accent)",
                                        color: "#fff",
                                        border: "none",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <Sparkles size={12} />
                                      <span>
                                        {state.language === "en"
                                          ? "Try Tool Now"
                                          : "بدء استخدام الأداة"}
                                      </span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled
                                      style={{
                                        width: "100%",
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        background: "rgba(255, 255, 255, 0.05)",
                                        color: "var(--text3)",
                                        border:
                                          "1px solid rgba(255, 255, 255, 0.1)",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <Lock size={12} />
                                      <span>
                                        {state.language === "en"
                                          ? "Upgrade Required"
                                          : "يتطلب ترقية الاشتراك"}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ) : activeTab === "payment_methods" ? (
            <div className="ad-content animate-in" dir={state.language === "en" ? "ltr" : "rtl"}>
              {/* Header Title & Sub-tabs Row */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        margin: 0,
                      }}
                    >
                      <CreditCard
                        size={24}
                        style={{ color: "var(--accent)" }}
                      />
                      <span>
                        {state.language === "en"
                          ? "Payment Methods & Transactions"
                          : "إعدادات طرق الدفع والمعاملات المالية"}
                      </span>
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text3)",
                        margin: "4px 0 0 0",
                      }}
                    >
                      {state.language === "en"
                        ? "Manage electronic wallets, online payment gateways, and review client subscription payments."
                        : "إدارة المحافظ الإلكترونية، بوابات الدفع البنكي، ومراجعة تحويلات الاشتراكات."}
                    </p>
                  </div>

                  {/* Sub-Tabs Pill Navigation */}
                  <div
                    style={{
                      display: "flex",
                      background: "rgba(13, 18, 32, 0.8)",
                      border: "1px solid var(--line)",
                      padding: "4px",
                      borderRadius: "14px",
                      gap: "4px",
                    }}
                  >
                    {[
                      {
                        id: "transactions",
                        label_ar: `سجل المعاملات (${pendingPayments.length})`,
                        label_en: `Transactions Log (${pendingPayments.length})`,
                        icon: Activity,
                      },
                      {
                        id: "wallets",
                        label_ar: "المحافظ الإلكترونية",
                        label_en: "E-Wallets",
                        icon: Wallet,
                      },
                      {
                        id: "gateways",
                        label_ar: "بوابات الدفع",
                        label_en: "Payment Gateways",
                        icon: CreditCard,
                      },
                    ].map((tab) => {
                      const isActive = paymentsSubTab === tab.id;
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setPaymentsSubTab(tab.id)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: "none",
                            background: isActive
                              ? "var(--accent)"
                              : "transparent",
                            color: isActive ? "#fff" : "var(--text3)",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <TabIcon size={15} />
                          <span>
                            {state.language === "en"
                              ? tab.label_en
                              : tab.label_ar}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Top Analytics Cards (Stats Bar) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {/* Card 1: Total Transactions */}
                  <div
                    style={{
                      background: "rgba(13, 18, 32, 0.7)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      borderRadius: "16px",
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text3)",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                      >
                        {state.language === "en"
                          ? "Total Transactions"
                          : "إجمالي المعاملات"}
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "900",
                          color: "#fff",
                        }}
                      >
                        <AnimatedCounter value={pendingPayments.length} />
                      </div>
                    </div>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "12px",
                        background: "rgba(59, 130, 246, 0.12)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Activity size={22} style={{ color: "#3B82F6" }} />
                    </div>
                  </div>

                  {/* Card 2: Pending Approval */}
                  <div
                    style={{
                      background: "rgba(13, 18, 32, 0.7)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      borderRadius: "16px",
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text3)",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                      >
                        {state.language === "en"
                          ? "Pending Approval"
                          : "قيد المراجعة"}
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "900",
                          color: "#F59E0B",
                        }}
                      >
                        <AnimatedCounter
                          value={
                            pendingPayments.filter(
                              (p) => p.status === "pending" || !p.status,
                            ).length
                          }
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "12px",
                        background: "rgba(245, 158, 11, 0.12)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Clock size={22} style={{ color: "#F59E0B" }} />
                    </div>
                  </div>

                  {/* Card 3: Approved Transactions */}
                  <div
                    style={{
                      background: "rgba(13, 18, 32, 0.7)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "16px",
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text3)",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                      >
                        {state.language === "en"
                          ? "Approved Payments"
                          : "تمت الموافقة"}
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "900",
                          color: "#10B981",
                        }}
                      >
                        <AnimatedCounter
                          value={
                            pendingPayments.filter(
                              (p) =>
                                p.status === "approved" ||
                                p.status === "success" ||
                                p.status === "completed",
                            ).length
                          }
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "12px",
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle2 size={22} style={{ color: "#10B981" }} />
                    </div>
                  </div>

                  {/* Card 4: Total Revenue */}
                  <div
                    style={{
                      background: "rgba(13, 18, 32, 0.7)",
                      border: "1px solid rgba(236, 72, 153, 0.2)",
                      borderRadius: "16px",
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text3)",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                      >
                        {state.language === "en"
                          ? "Total Revenue"
                          : "إجمالي الإيرادات"}
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "900",
                          color: "#EC4899",
                        }}
                      >
                        <AnimatedCounter
                          value={pendingPayments
                            .filter(
                              (p) =>
                                p.status === "approved" ||
                                p.status === "completed",
                            )
                            .reduce(
                              (sum, p) => sum + (Number(p.amount) || 0),
                              0,
                            )}
                        />{" "}
                        <span style={{ fontSize: "14px", fontWeight: "700" }}>
                          EGP
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "12px",
                        background: "rgba(236, 72, 153, 0.12)",
                        border: "1px solid rgba(236, 72, 153, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <DollarSign size={22} style={{ color: "#EC4899" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Tab 1: Transactions Log */}
              {paymentsSubTab === "transactions" && (
                <div className="ad-table-card" style={{ padding: "24px" }} dir={state.language === "en" ? "ltr" : "rtl"}>
                  {/* Filter Toolbar Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                      marginBottom: "20px",
                      paddingBottom: "16px",
                      borderBottom: "1px solid var(--line)",
                    }}
                    dir={state.language === "en" ? "ltr" : "rtl"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <SlidersHorizontal size={20} style={{ color: "var(--accent)" }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#fff" }}>
                          {state.language === "en" ? "Transactions Filter & Search" : "البحث وتصفية المعاملات"}
                        </h3>
                        <span style={{ fontSize: "12px", color: "var(--text3)" }}>
                          {state.language === "en"
                            ? `Filter through ${pendingPayments.length} financial operations`
                            : `تصفية البحث ضمن ${pendingPayments.length} معاملة مالية`}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {/* CSV Export Button */}
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={handleExportPaymentsCSV}
                        style={{
                          height: "42px",
                          padding: "0 16px",
                          background: "rgba(16, 185, 129, 0.12)",
                          color: "#10B981",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          borderRadius: "12px",
                          fontWeight: "700",
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Download size={15} />
                        <span>{state.language === "en" ? "Export Report (CSV)" : "تصدير تقرير CSV"}</span>
                      </button>

                      {/* Reset Filter Button */}
                      {(paymentSearchQuery || paymentStatusFilter !== "all") && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setPaymentSearchQuery("");
                            setPaymentStatusFilter("all");
                          }}
                          style={{
                            height: "42px",
                            padding: "0 14px",
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#EF4444",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "12px",
                            fontWeight: "700",
                            fontSize: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <RotateCcw size={15} />
                          <span>{state.language === "en" ? "Reset" : "إعادة ضبط"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Inputs Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "16px",
                      marginBottom: "20px",
                      background: "linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(13, 18, 32, 0.95))",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                      padding: "18px",
                      borderRadius: "16px",
                      alignItems: "end",
                    }}
                    dir={state.language === "en" ? "ltr" : "rtl"}
                  >
                    {/* Search Input */}
                    <div style={{ position: "relative", flex: 1 }}>
                      <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "block", marginBottom: "6px" }}>
                        {state.language === "en" ? "Search Keyword" : "كلمة البحث"}
                      </label>
                      <div style={{ position: "relative" }}>
                        <Search
                          size={16}
                          style={{
                            position: "absolute",
                            left: state.language === "en" ? "14px" : "auto",
                            right: state.language === "ar" ? "14px" : "auto",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--accent)",
                            pointerEvents: "none",
                          }}
                        />
                        <input
                          className="field-input"
                          placeholder={
                            state.language === "en"
                              ? "Search by customer name, email, or phone..."
                              : "بحث باسم العميل، البريد، أو الهاتف..."
                          }
                          value={paymentSearchQuery}
                          onChange={(e) => setPaymentSearchQuery(e.target.value)}
                          style={{
                            paddingLeft: state.language === "en" ? "40px" : "14px",
                            paddingRight: state.language === "ar" ? "40px" : "14px",
                            fontSize: "13px",
                            height: "44px",
                            background: "rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                        />
                      </div>
                    </div>

                    {/* Status Filter like User Management */}
                    <div className="ad-filter-item">
                      <CustomSelect
                        label={
                          state.language === "en"
                            ? "Subscription Status"
                            : "حالة الاشتراك"
                        }
                        value={paymentStatusFilter}
                        onChange={(val) => setPaymentStatusFilter(val)}
                        icon={Filter}
                        options={[
                          {
                            value: "all",
                            label:
                              state.language === "en"
                                ? "All Statuses (All)"
                                : "جميع الحالات (الكل)",
                            icon: Sparkles,
                          },
                          {
                            value: "pending",
                            label:
                              state.language === "en"
                                ? "Pending Approval"
                                : "قيد المراجعة",
                            icon: Clock,
                          },
                          {
                            value: "approved",
                            label:
                              state.language === "en"
                                ? "Approved Payments"
                                : "تمت الموافقة",
                            icon: CheckCircle2,
                          },
                        ]}
                      />
                    </div>

                    {/* Environment Filter like User Management Status */}
                    <div className="ad-filter-item">
                      <CustomSelect
                        label={
                          state.language === "en"
                            ? "Environment (بيئة العمل)"
                            : "بيئة العمل (Environment)"
                        }
                        value={paddleEnvironment}
                        onChange={(val) => setPaddleEnvironment(val)}
                        icon={Globe}
                        options={[
                          {
                            value: "production",
                            label:
                              state.language === "en"
                                ? "Live / Production"
                                : "البيئة الحية المباشرة",
                            icon: Zap,
                          },
                          {
                            value: "sandbox",
                            label:
                              state.language === "en"
                                ? "Sandbox / Testing"
                                : "بيئة الاختبار والتجربة",
                            icon: ShieldCheck,
                          },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Transactions Table */}
                  {loadingPayments ? (
                    <div className="ad-empty" style={{ padding: "40px 0" }}>
                      <div
                        className="ad-submit-spinner"
                        style={{ margin: "0 auto 12px" }}
                      />
                      <div>
                        {state.language === "en"
                          ? "Loading transactions..."
                          : "جاري تحميل المعاملات..."}
                      </div>
                    </div>
                  ) : pendingPayments.length === 0 ? (
                    <div className="ad-empty" style={{ padding: "40px 0" }}>
                      <CreditCard
                        size={40}
                        style={{
                          color: "var(--text3)",
                          marginBottom: "12px",
                          opacity: 0.5,
                        }}
                      />
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color: "#fff",
                        }}
                      >
                        {state.language === "en"
                          ? "No transactions recorded yet"
                          : "لا توجد معاملات مالية مسجلة حتى الآن"}
                      </div>
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const filtered = pendingPayments.filter((p) => {
                          const q = paymentSearchQuery.toLowerCase();
                          const matchSearch =
                            !paymentSearchQuery ||
                            (p.userName || "").toLowerCase().includes(q) ||
                            (p.userEmail || "").toLowerCase().includes(q) ||
                            (p.userPhone || "").toLowerCase().includes(q);
                          const matchStatus =
                            paymentStatusFilter === "all" ||
                            p.status === paymentStatusFilter;
                          return matchSearch && matchStatus;
                        });

                        const totalPages = Math.max(
                          1,
                          Math.ceil(filtered.length / 6),
                        );
                        const pageItems = filtered.slice(
                          (paymentCurrentPage - 1) * 6,
                          paymentCurrentPage * 6,
                        );

                        if (filtered.length === 0) {
                          return (
                            <div
                              className="ad-empty"
                              style={{ padding: "40px 0" }}
                            >
                              <Search
                                size={36}
                                style={{
                                  color: "var(--text3)",
                                  marginBottom: "10px",
                                }}
                              />
                              <div>
                                {state.language === "en"
                                  ? "No matching transactions found"
                                  : "لم يتم العثور على نتائج تطابق البحث"}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <>
                            <div className="sa-table-wrapper" dir="rtl">
                              <table className="sa-table" dir="rtl">
                                <thead>
                                  <tr>
                                    <th style={{ textAlign: "center" }}>
                                      {state.language === "en"
                                        ? "Customer"
                                        : "العميل"}
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      {state.language === "en"
                                        ? "Phone Number"
                                        : "الهاتف المحول"}
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      {state.language === "en"
                                        ? "Date & Time"
                                        : "التاريخ والتوقيت"}
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      {state.language === "en"
                                        ? "Payment Proof"
                                        : "صورة التحويل"}
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      {state.language === "en"
                                        ? "Status"
                                        : "الحالة"}
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      {state.language === "en"
                                        ? "Action"
                                        : "إجراء"}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pageItems.map((p) => {
                                    const isPending =
                                      p.status === "pending" || !p.status;
                                    const initials = (p.userName || "Customer")
                                      .slice(0, 2)
                                      .toUpperCase();

                                    return (
                                      <tr
                                        key={p.id}
                                        style={{
                                          background: isPending
                                            ? "rgba(245, 158, 11, 0.02)"
                                            : "rgba(16, 185, 129, 0.02)",
                                          transition: "background 0.2s",
                                          textAlign: "center",
                                        }}
                                      >
                                        <td style={{ textAlign: "center" }}>
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: "12px",
                                            }}
                                          >
                                            <div
                                              style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background:
                                                  "linear-gradient(135deg, var(--accent), #1d4ed8)",
                                                color: "#fff",
                                                fontWeight: "800",
                                                fontSize: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                              }}
                                            >
                                              {initials}
                                            </div>
                                            <div style={{ textAlign: "center" }}>
                                              <div
                                                style={{
                                                  fontWeight: "700",
                                                  color: "#fff",
                                                }}
                                              >
                                                {p.userName || "—"}
                                              </div>
                                              <div
                                                style={{
                                                  fontSize: "11px",
                                                  color: "var(--text3)",
                                                }}
                                              >
                                                {p.userEmail || "—"}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td
                                          dir="ltr"
                                          style={{
                                            textAlign: "center",
                                            fontFamily: "monospace",
                                            fontWeight: "600",
                                          }}
                                        >
                                          {p.userPhone || "—"}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                          <div
                                            style={{
                                              fontSize: "12px",
                                              fontWeight: "600",
                                              color: "var(--text2)",
                                              textAlign: "center",
                                            }}
                                          >
                                            {p.createdAt?.seconds
                                              ? new Date(
                                                  p.createdAt.seconds * 1000,
                                                ).toLocaleDateString(
                                                  state.language === "en"
                                                    ? "en-US"
                                                    : "ar-EG",
                                                  {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                  },
                                                )
                                              : "—"}
                                          </div>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                          {p.screenshotUrl ? (
                                            <button
                                              type="button"
                                              className="btn btn-xs"
                                              onClick={() =>
                                                setPreviewReceiptUrl(
                                                  p.screenshotUrl,
                                                )
                                              }
                                              style={{
                                                background:
                                                  "rgba(59, 130, 246, 0.1)",
                                                color: "#3B82F6",
                                                border:
                                                  "1px solid rgba(59, 130, 246, 0.25)",
                                                borderRadius: "8px",
                                                padding: "4px 10px",
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "4px",
                                                cursor: "pointer",
                                                margin: "0 auto",
                                              }}
                                            >
                                              <Eye size={12} />
                                              <span>
                                                {state.language === "en"
                                                  ? "Preview Receipt "
                                                  : "معاينة الإيصال "}
                                              </span>
                                            </button>
                                          ) : (
                                            <span
                                              style={{
                                                fontSize: "11px",
                                                color: "var(--text3)",
                                              }}
                                            >
                                              —
                                            </span>
                                          )}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                          {isPending ? (
                                            <span
                                              style={{
                                                color: "#F59E0B",
                                                fontSize: "11px",
                                                fontWeight: "800",
                                                background:
                                                  "rgba(245, 158, 11, 0.12)",
                                                border:
                                                  "1px solid rgba(245, 158, 11, 0.3)",
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "4px",
                                                margin: "0 auto",
                                              }}
                                            >
                                              <Clock size={12} />
                                              <span>
                                                {state.language === "en"
                                                  ? "Pending Approval"
                                                  : "قيد المراجعة"}
                                              </span>
                                            </span>
                                          ) : (
                                            <span
                                              style={{
                                                color: "var(--green)",
                                                fontSize: "11px",
                                                fontWeight: "800",
                                                background:
                                                  "rgba(16, 185, 129, 0.12)",
                                                border:
                                                  "1px solid rgba(16, 185, 129, 0.3)",
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "4px",
                                                margin: "0 auto",
                                              }}
                                            >
                                              <CheckCircle2 size={12} />
                                              <span>
                                                {state.language === "en"
                                                  ? "Approved"
                                                  : "تمت الموافقة"}
                                              </span>
                                            </span>
                                          )}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                          {isPending ? (
                                            <button
                                              className="btn btn-xs btn-primary"
                                              onClick={() =>
                                                setPaymentToApprove(p)
                                              }
                                              style={{
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                padding: "6px 12px",
                                                borderRadius: "8px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "4px",
                                                margin: "0 auto",
                                              }}
                                            >
                                              <Check size={13} />
                                              <span>
                                                {state.language === "en"
                                                  ? "Approve Plan"
                                                  : "تأكيد الاشتراك"}
                                              </span>
                                            </button>
                                          ) : (
                                            <span
                                              style={{
                                                fontSize: "11px",
                                                color: "var(--text3)",
                                              }}
                                            >
                                              ✓{" "}
                                              {state.language === "en"
                                                ? "Verified"
                                                : "تم التفعيل"}
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                              <div style={{ marginTop: "20px" }}>
                                <Pagination
                                  currentPage={paymentCurrentPage}
                                  totalPages={totalPages}
                                  onPageChange={setPaymentCurrentPage}
                                />
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: E-Wallets Section */}
              {paymentsSubTab === "wallets" && (
                <div className="ad-table-card" style={{ padding: "24px" }} dir={state.language === "en" ? "ltr" : "rtl"}>
                  <div
                    style={{
                      marginBottom: "24px",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Wallet size={20} style={{ color: "var(--accent)" }} />
                      <span>
                        {state.language === "en"
                          ? "Electronic Wallets Configuration"
                          : "إعدادات المحافظ الإلكترونية"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text3)",
                        marginTop: "4px",
                      }}
                    >
                      {state.language === "en"
                        ? "Enter your mobile money and wallet account details to be shown on the client payment gateway."
                        : "أدخل أرقام المحافظ الإلكترونية الخاصة بك لتظهر للعملاء أثناء عملية تحويل الأموال."}
                    </div>
                  </div>

                  {/* Branded E-Wallet Cards Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "20px",
                      marginBottom: "28px",
                    }}
                  >
                    {/* Vodafone Cash */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(230, 0, 0, 0.08), rgba(13, 18, 32, 0.8))",
                        border: "1px solid rgba(230, 0, 0, 0.3)",
                        borderRadius: "16px",
                        padding: "20px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Smartphone size={18} style={{ color: "#E60000" }} />
                          <span
                            style={{
                              fontWeight: "800",
                              color: "#fff",
                              fontSize: "14px",
                            }}
                          >
                            فودافون كاش (Vodafone)
                          </span>
                        </div>
                        {vodafoneWallet ? (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#10B981",
                              background: "rgba(16, 185, 129, 0.15)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                            }}
                          >
                            🟢 {state.language === "en" ? "Active" : "نشط"}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#EF4444",
                              background: "rgba(239, 68, 68, 0.15)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            🔴{" "}
                            {state.language === "en" ? "Inactive" : "غير مفعل"}
                          </span>
                        )}
                      </div>

                      <div className="field">
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            className="field-input"
                            placeholder="010xxxxxxxx"
                            value={vodafoneWallet}
                            onChange={(e) => setVodafoneWallet(e.target.value)}
                            dir="ltr"
                            style={{
                              fontWeight: "800",
                              letterSpacing: "1px",
                              color: "#E60000",
                              borderColor: "rgba(230, 0, 0, 0.3)",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleCopyWallet(vodafoneWallet)}
                            title="Copy number"
                            style={{
                              background: "rgba(230, 0, 0, 0.15)",
                              color: "#E60000",
                              border: "1px solid rgba(230, 0, 0, 0.3)",
                              borderRadius: "10px",
                              padding: "0 12px",
                              cursor: "pointer",
                            }}
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Etisalat Cash */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0, 107, 51, 0.08), rgba(13, 18, 32, 0.8))",
                        border: "1px solid rgba(0, 107, 51, 0.3)",
                        borderRadius: "16px",
                        padding: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Smartphone size={18} style={{ color: "#006B33" }} />
                          <span
                            style={{
                              fontWeight: "800",
                              color: "#fff",
                              fontSize: "14px",
                            }}
                          >
                            اتصالات كاش (Etisalat)
                          </span>
                        </div>
                        {etisalatWallet ? (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#10B981",
                              background: "rgba(16, 185, 129, 0.15)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                            }}
                          >
                            🟢 {state.language === "en" ? "Active" : "نشط"}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#EF4444",
                              background: "rgba(239, 68, 68, 0.15)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            🔴{" "}
                            {state.language === "en" ? "Inactive" : "غير مفعل"}
                          </span>
                        )}
                      </div>

                      <div className="field">
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            className="field-input"
                            placeholder="011xxxxxxxx"
                            value={etisalatWallet}
                            onChange={(e) => setEtisalatWallet(e.target.value)}
                            dir="ltr"
                            style={{
                              fontWeight: "800",
                              letterSpacing: "1px",
                              color: "#006B33",
                              borderColor: "rgba(0, 107, 51, 0.3)",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleCopyWallet(etisalatWallet)}
                            title="Copy number"
                            style={{
                              background: "rgba(0, 107, 51, 0.15)",
                              color: "#006B33",
                              border: "1px solid rgba(0, 107, 51, 0.3)",
                              borderRadius: "10px",
                              padding: "0 12px",
                              cursor: "pointer",
                            }}
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Orange Cash */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 102, 0, 0.08), rgba(13, 18, 32, 0.8))",
                        border: "1px solid rgba(255, 102, 0, 0.3)",
                        borderRadius: "16px",
                        padding: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Smartphone size={18} style={{ color: "#FF6600" }} />
                          <span
                            style={{
                              fontWeight: "800",
                              color: "#fff",
                              fontSize: "14px",
                            }}
                          >
                            أورانج كاش (Orange)
                          </span>
                        </div>
                        {orangeWallet ? (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#10B981",
                              background: "rgba(16, 185, 129, 0.15)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                            }}
                          >
                            🟢 {state.language === "en" ? "Active" : "نشط"}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#EF4444",
                              background: "rgba(239, 68, 68, 0.15)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            🔴{" "}
                            {state.language === "en" ? "Inactive" : "غير مفعل"}
                          </span>
                        )}
                      </div>

                      <div className="field">
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            className="field-input"
                            placeholder="012xxxxxxxx"
                            value={orangeWallet}
                            onChange={(e) => setOrangeWallet(e.target.value)}
                            dir="ltr"
                            style={{
                              fontWeight: "800",
                              letterSpacing: "1px",
                              color: "#FF6600",
                              borderColor: "rgba(255, 102, 0, 0.3)",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleCopyWallet(orangeWallet)}
                            title="Copy number"
                            style={{
                              background: "rgba(255, 102, 0, 0.15)",
                              color: "#FF6600",
                              border: "1px solid rgba(255, 102, 0, 0.3)",
                              borderRadius: "10px",
                              padding: "0 12px",
                              cursor: "pointer",
                            }}
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* InstaPay */}
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(138, 43, 226, 0.08), rgba(13, 18, 32, 0.8))",
                        border: "1px solid rgba(138, 43, 226, 0.3)",
                        borderRadius: "16px",
                        padding: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Zap size={18} style={{ color: "#8A2BE2" }} />
                          <span
                            style={{
                              fontWeight: "800",
                              color: "#fff",
                              fontSize: "14px",
                            }}
                          >
                            إنستاباي (InstaPay)
                          </span>
                        </div>
                        {instapayWallet ? (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#10B981",
                              background: "rgba(16, 185, 129, 0.15)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                            }}
                          >
                            🟢 {state.language === "en" ? "Active" : "نشط"}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              color: "#EF4444",
                              background: "rgba(239, 68, 68, 0.15)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            🔴{" "}
                            {state.language === "en" ? "Inactive" : "غير مفعل"}
                          </span>
                        )}
                      </div>

                      <div className="field">
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            className="field-input"
                            placeholder="username@instapay"
                            value={instapayWallet}
                            onChange={(e) => setInstapayWallet(e.target.value)}
                            dir="ltr"
                            style={{
                              fontWeight: "800",
                              color: "#8A2BE2",
                              borderColor: "rgba(138, 43, 226, 0.3)",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleCopyWallet(instapayWallet)}
                            title="Copy username"
                            style={{
                              background: "rgba(138, 43, 226, 0.15)",
                              color: "#8A2BE2",
                              border: "1px solid rgba(138, 43, 226, 0.3)",
                              borderRadius: "10px",
                              padding: "0 12px",
                              cursor: "pointer",
                            }}
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save E-Wallets Button */}
                  <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <button
                      className="ad-submit-btn"
                      style={{
                        minWidth: "260px",
                        margin: "0 auto",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                      onClick={handleUpdateAdminProfile}
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>
                            {state.language === "en"
                              ? "Saving settings..."
                              : "جاري الحفظ..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>
                            {state.language === "en"
                              ? "Save E-Wallet Settings"
                              : " حفظ أرقام المحافظ"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Payment Gateways Section */}
              {paymentsSubTab === "gateways" && (
                <div className="ad-table-card" style={{ padding: "24px" }} dir={state.language === "en" ? "ltr" : "rtl"}>
                  {/* Header & Save Button Bar */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                      marginBottom: "24px",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: "16px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <CreditCard size={20} style={{ color: "var(--accent)" }} />
                        <span>
                          {state.language === "en"
                            ? "Payment Gateways & Methods Settings"
                            : "إعدادات طرق وبوابات الدفع"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text3)",
                          marginTop: "4px",
                        }}
                      >
                        {state.language === "en"
                          ? "Configure InstaPay, Vodafone Cash, Stripe, PayPal, and Paddle credentials."
                          : "قم بضبط إعدادات ومفاتيح طرق الدفع: انستا باي، فودافون كاش، سترايب، باي بال، وبادِل."}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSavePaymentMethods}
                      disabled={paymentSaving}
                      className="btn btn-primary"
                      style={{
                        height: "42px",
                        padding: "0 22px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: paymentSaved
                          ? "#10B981"
                          : "linear-gradient(135deg, #6366F1, #4F46E5)",
                        boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                        color: "#fff",
                        border: "none",
                        cursor: paymentSaving ? "not-allowed" : "pointer",
                      }}
                    >
                      {paymentSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>{state.language === "en" ? "Saving..." : "جاري الحفظ..."}</span>
                        </>
                      ) : paymentSaved ? (
                        <>
                          <Check size={16} />
                          <span>{state.language === "en" ? "Saved!" : "تم الحفظ!"}</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>{state.language === "en" ? "Save Settings" : "حفظ الإعدادات"}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Gateway Cards Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {/* 1. InstaPay Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(13, 18, 32, 0.95))",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "18px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                        boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.1)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "14px",
                              background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)",
                              border: "1px solid rgba(245, 158, 11, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#F59E0B",
                              boxShadow: "0 0 15px rgba(245, 158, 11, 0.15)",
                            }}
                          >
                            <Zap size={22} color="#F59E0B" />
                          </div>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "0.2px" }}>
                              InstaPay
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600" }}>
                              {state.language === "en" ? "Instant Bank Transfer" : "تحويل بنكي لحظي"}
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              instapay: { ...prev.instapay, enabled: !prev.instapay?.enabled },
                            }))
                          }
                          style={{
                            width: "48px",
                            height: "26px",
                            borderRadius: "13px",
                            background: paymentMethods.instapay?.enabled
                              ? "linear-gradient(135deg, #10B981, #059669)"
                              : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${paymentMethods.instapay?.enabled ? "#10B981" : "rgba(255, 255, 255, 0.15)"}`,
                            position: "relative",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            boxShadow: paymentMethods.instapay?.enabled ? "0 0 12px rgba(16, 185, 129, 0.3)" : "none",
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "#FFF",
                              position: "absolute",
                              top: "2px",
                              left: paymentMethods.instapay?.enabled ? "25px" : "2px",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                          <Send size={12} style={{ color: "#F59E0B" }} />
                          <span>{state.language === "en" ? "InstaPay Address (IPA)" : "عنوان انستا باي المالي"}</span>
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="username@instapay"
                          value={paymentMethods.instapay?.address || ""}
                          onChange={(e) =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              instapay: { ...prev.instapay, address: e.target.value },
                            }))
                          }
                          className="input"
                          style={{
                            width: "100%",
                            height: "42px",
                            background: "rgba(0,0,0,0.35)",
                            border: "1px solid rgba(245, 158, 11, 0.2)",
                            borderRadius: "10px",
                            color: "#fff",
                            padding: "0 12px",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        />
                      </div>
                    </div>

                    {/* 2. Vodafone Cash Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(13, 18, 32, 0.95))",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "18px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                        boxShadow: "0 10px 30px -10px rgba(239, 68, 68, 0.1)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "14px",
                              background: "radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.05) 100%)",
                              border: "1px solid rgba(239, 68, 68, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#EF4444",
                              boxShadow: "0 0 15px rgba(239, 68, 68, 0.15)",
                            }}
                          >
                            <Smartphone size={22} color="#EF4444" />
                          </div>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "0.2px" }}>
                              Vodafone Cash
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600" }}>
                              {state.language === "en" ? "Mobile Money Wallet" : "محفظة فودافون كاش"}
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              vodafoneCash: {
                                ...prev.vodafoneCash,
                                enabled: !prev.vodafoneCash?.enabled,
                              },
                            }))
                          }
                          style={{
                            width: "48px",
                            height: "26px",
                            borderRadius: "13px",
                            background: paymentMethods.vodafoneCash?.enabled
                              ? "linear-gradient(135deg, #10B981, #059669)"
                              : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${paymentMethods.vodafoneCash?.enabled ? "#10B981" : "rgba(255, 255, 255, 0.15)"}`,
                            position: "relative",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            boxShadow: paymentMethods.vodafoneCash?.enabled ? "0 0 12px rgba(16, 185, 129, 0.3)" : "none",
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "#FFF",
                              position: "absolute",
                              top: "2px",
                              left: paymentMethods.vodafoneCash?.enabled ? "25px" : "2px",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                          <Smartphone size={12} style={{ color: "#EF4444" }} />
                          <span>{state.language === "en" ? "Vodafone Cash Number" : "رقم محفظة فودافون كاش"}</span>
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="010XXXXXXXX"
                          value={paymentMethods.vodafoneCash?.number || ""}
                          onChange={(e) =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              vodafoneCash: {
                                ...prev.vodafoneCash,
                                number: e.target.value.replace(/[^0-9]/g, ""),
                              },
                            }))
                          }
                          className="input"
                          style={{
                            width: "100%",
                            height: "42px",
                            background: "rgba(0,0,0,0.35)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            borderRadius: "10px",
                            color: "#fff",
                            padding: "0 12px",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        />
                      </div>
                    </div>

                    {/* 3. Stripe Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(13, 18, 32, 0.95))",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: "18px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                        boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.1)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "14px",
                              background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.05) 100%)",
                              border: "1px solid rgba(99, 102, 241, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#6366F1",
                              boxShadow: "0 0 15px rgba(99, 102, 241, 0.15)",
                            }}
                          >
                            <ShieldCheck size={22} color="#6366F1" />
                          </div>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "0.2px" }}>
                              Stripe Gateway
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600" }}>
                              {state.language === "en" ? "Credit Cards & Links" : "بطاقات بنكية وروابط دفع"}
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              stripe: { ...prev.stripe, enabled: !prev.stripe?.enabled },
                            }))
                          }
                          style={{
                            width: "48px",
                            height: "26px",
                            borderRadius: "13px",
                            background: paymentMethods.stripe?.enabled
                              ? "linear-gradient(135deg, #10B981, #059669)"
                              : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${paymentMethods.stripe?.enabled ? "#10B981" : "rgba(255, 255, 255, 0.15)"}`,
                            position: "relative",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            boxShadow: paymentMethods.stripe?.enabled ? "0 0 12px rgba(16, 185, 129, 0.3)" : "none",
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "#FFF",
                              position: "absolute",
                              top: "2px",
                              left: paymentMethods.stripe?.enabled ? "25px" : "2px",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div>
                          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                            <Key size={11} style={{ color: "#6366F1" }} />
                            <span>{state.language === "en" ? "Publishable Key" : "المفتاح العام (Publishable Key)"}</span>
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="pk_live_..."
                            value={paymentMethods.stripe?.publishableKey || ""}
                            onChange={(e) =>
                              setPaymentMethods((prev) => ({
                                ...prev,
                                stripe: { ...prev.stripe, publishableKey: e.target.value },
                              }))
                            }
                            className="input"
                            style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                            <Lock size={11} style={{ color: "#6366F1" }} />
                            <span>{state.language === "en" ? "Secret Key" : "المفتاح السري (Secret Key)"}</span>
                          </label>
                          <input
                            type="password"
                            dir="ltr"
                            placeholder="sk_live_..."
                            value={paymentMethods.stripe?.secretKey || ""}
                            onChange={(e) =>
                              setPaymentMethods((prev) => ({
                                ...prev,
                                stripe: { ...prev.stripe, secretKey: e.target.value },
                              }))
                            }
                            className="input"
                            style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                            <CreditCard size={11} style={{ color: "#6366F1" }} />
                            <span>{state.language === "en" ? "Payment Link (Monthly)" : "رابط الدفع (شهري)"}</span>
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="https://buy.stripe.com/..."
                            value={paymentMethods.stripe?.paymentLink || ""}
                            onChange={(e) =>
                              setPaymentMethods((prev) => ({
                                ...prev,
                                stripe: { ...prev.stripe, paymentLink: e.target.value },
                              }))
                            }
                            className="input"
                            style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                            <CreditCard size={11} style={{ color: "#6366F1" }} />
                            <span>{state.language === "en" ? "Payment Link (Annual)" : "رابط الدفع (سنوي)"}</span>
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="https://buy.stripe.com/..."
                            value={paymentMethods.stripe?.paymentLinkAnnual || ""}
                            onChange={(e) =>
                              setPaymentMethods((prev) => ({
                                ...prev,
                                stripe: { ...prev.stripe, paymentLinkAnnual: e.target.value },
                              }))
                            }
                            className="input"
                            style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. PayPal Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(13, 18, 32, 0.95))",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "18px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                        boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.1)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "14px",
                              background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.05) 100%)",
                              border: "1px solid rgba(59, 130, 246, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#3B82F6",
                              boxShadow: "0 0 15px rgba(59, 130, 246, 0.15)",
                            }}
                          >
                            <Globe size={22} color="#3B82F6" />
                          </div>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "0.2px" }}>
                              PayPal
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600" }}>
                              {state.language === "en" ? "Global Payments" : "مدفوعات باي بال العالمية"}
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              paypal: { ...prev.paypal, enabled: !prev.paypal?.enabled },
                            }))
                          }
                          style={{
                            width: "48px",
                            height: "26px",
                            borderRadius: "13px",
                            background: paymentMethods.paypal?.enabled
                              ? "linear-gradient(135deg, #10B981, #059669)"
                              : "rgba(255, 255, 255, 0.1)",
                            border: `1px solid ${paymentMethods.paypal?.enabled ? "#10B981" : "rgba(255, 255, 255, 0.15)"}`,
                            position: "relative",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            boxShadow: paymentMethods.paypal?.enabled ? "0 0 12px rgba(16, 185, 129, 0.3)" : "none",
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "#FFF",
                              position: "absolute",
                              top: "2px",
                              left: paymentMethods.paypal?.enabled ? "25px" : "2px",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                          <Mail size={12} style={{ color: "#3B82F6" }} />
                          <span>{state.language === "en" ? "PayPal Email Address" : "بريد باي بال الإلكتروني"}</span>
                        </label>
                        <input
                          type="email"
                          dir="ltr"
                          placeholder="account@paypal.com"
                          value={paymentMethods.paypal?.email || ""}
                          onChange={(e) =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              paypal: { ...prev.paypal, email: e.target.value },
                            }))
                          }
                          className="input"
                          style={{
                            width: "100%",
                            height: "42px",
                            background: "rgba(0,0,0,0.35)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            borderRadius: "10px",
                            color: "#fff",
                            padding: "0 12px",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        />
                      </div>
                    </div>

                    {/* 5. Paddle Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(13, 18, 32, 0.95))",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                        borderRadius: "18px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                        gridColumn: "1 / -1",
                        boxShadow: "0 10px 30px -10px rgba(6, 182, 212, 0.1)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "14px",
                              background: "radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0.05) 100%)",
                              border: "1px solid rgba(6, 182, 212, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#06B6D4",
                              boxShadow: "0 0 15px rgba(6, 182, 212, 0.15)",
                            }}
                          >
                            <Layers size={22} color="#06B6D4" />
                          </div>
                          <div>
                            <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "0.2px" }}>
                              Paddle Billing
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600" }}>
                              {state.language === "en" ? "Merchant of Record Integration" : "تكامل نظام بادِل للدفع الدولي"}
                            </div>
                          </div>
                        </div>

                        {(paymentMethods.paddle?.connected || showPaddleManual) && (
                          <div
                            onClick={() =>
                              setPaymentMethods((prev) => ({
                                ...prev,
                                paddle: { ...prev.paddle, enabled: !prev.paddle?.enabled },
                              }))
                            }
                            style={{
                              width: "48px",
                              height: "26px",
                              borderRadius: "13px",
                              background: paymentMethods.paddle?.enabled
                                ? "linear-gradient(135deg, #10B981, #059669)"
                                : "rgba(255, 255, 255, 0.1)",
                              border: `1px solid ${paymentMethods.paddle?.enabled ? "#10B981" : "rgba(255, 255, 255, 0.15)"}`,
                              position: "relative",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                              boxShadow: paymentMethods.paddle?.enabled ? "0 0 12px rgba(16, 185, 129, 0.3)" : "none",
                            }}
                          >
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: "#FFF",
                                position: "absolute",
                                top: "2px",
                                left: paymentMethods.paddle?.enabled ? "25px" : "2px",
                                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {!paymentMethods.paddle?.connected && !showPaddleManual ? (
                        /* Unconnected State */
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(0,0,0,0.25)", padding: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text3)", lineHeight: "1.6" }}>
                            {state.language === "en"
                              ? "Connect your Paddle account automatically via OAuth or enter configuration tokens manually."
                              : "قم بربط حساب Paddle تلقائياً عبر OAuth أو إدخال رموز الإعداد يدوياً."}
                          </p>
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handlePaddleConnect}
                              style={{
                                height: "40px",
                                padding: "0 18px",
                                background: "linear-gradient(135deg, #06B6D4, #0891B2)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                fontWeight: "700",
                                fontSize: "13px",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
                              }}
                            >
                              {state.language === "en" ? "Connect with Paddle (OAuth)" : "ربط حساب Paddle تلقائياً"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowPaddleManual(true)}
                              style={{
                                height: "40px",
                                padding: "0 18px",
                                background: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                border: "1px solid var(--line)",
                                borderRadius: "10px",
                                fontWeight: "700",
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                            >
                              {state.language === "en" ? "Enter Manually" : "إدخال المفاتيح يدوياً"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Connected or Manual Configured State */
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          {paymentMethods.paddle?.connected && (
                            <div
                              style={{
                                padding: "12px 16px",
                                borderRadius: "12px",
                                background: "rgba(16, 185, 129, 0.12)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                color: "#10B981",
                                fontSize: "12px",
                                fontWeight: "700",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <CheckCircle2 size={16} />
                                <span>{state.language === "en" ? "Account Connected Successfully" : "تم ربط حساب Paddle بنجاح"}</span>
                              </span>
                              <button
                                type="button"
                                onClick={handlePaddleDisconnect}
                                style={{
                                  background: "rgba(239, 68, 68, 0.15)",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  color: "#EF4444",
                                  padding: "5px 12px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  fontWeight: "700",
                                }}
                              >
                                {state.language === "en" ? "Disconnect" : "إلغاء الربط"}
                              </button>
                            </div>
                          )}

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "block", marginBottom: "4px" }}>
                                Seller ID
                              </label>
                              <input
                                type="text"
                                dir="ltr"
                                placeholder="Seller ID"
                                value={paymentMethods.paddle?.sellerId || ""}
                                onChange={(e) =>
                                  setPaymentMethods((prev) => ({
                                    ...prev,
                                    paddle: { ...prev.paddle, sellerId: e.target.value },
                                  }))
                                }
                                className="input"
                                style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "block", marginBottom: "4px" }}>
                                Vendor ID
                              </label>
                              <input
                                type="text"
                                dir="ltr"
                                placeholder="Vendor ID"
                                value={paymentMethods.paddle?.vendorId || ""}
                                onChange={(e) =>
                                  setPaymentMethods((prev) => ({
                                    ...prev,
                                    paddle: { ...prev.paddle, vendorId: e.target.value },
                                  }))
                                }
                                className="input"
                                style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "block", marginBottom: "4px" }}>
                                Client Token
                              </label>
                              <input
                                type="text"
                                dir="ltr"
                                placeholder="Client Token"
                                value={paymentMethods.paddle?.clientToken || ""}
                                onChange={(e) =>
                                  setPaymentMethods((prev) => ({
                                    ...prev,
                                    paddle: { ...prev.paddle, clientToken: e.target.value },
                                  }))
                                }
                                className="input"
                                style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "block", marginBottom: "4px" }}>
                                Price ID (Monthly)
                              </label>
                              <input
                                type="text"
                                dir="ltr"
                                placeholder="pri_..."
                                value={paymentMethods.paddle?.priceIdMonthly || ""}
                                onChange={(e) =>
                                  setPaymentMethods((prev) => ({
                                    ...prev,
                                    paddle: { ...prev.paddle, priceIdMonthly: e.target.value },
                                  }))
                                }
                                className="input"
                                style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text3)", display: "block", marginBottom: "4px" }}>
                                Price ID (Annual)
                              </label>
                              <input
                                type="text"
                                dir="ltr"
                                placeholder="pri_..."
                                value={paymentMethods.paddle?.priceIdAnnual || ""}
                                onChange={(e) =>
                                  setPaymentMethods((prev) => ({
                                    ...prev,
                                    paddle: { ...prev.paddle, priceIdAnnual: e.target.value },
                                  }))
                                }
                                className="input"
                                style={{ width: "100%", height: "38px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "8px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Light-box Receipt Image Modal */}
              <AnimatePresence>
                {previewReceiptUrl && (
                  <div
                    className="ad-modal-overlay"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.85)",
                      zIndex: 99999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(6px)",
                      padding: "20px",
                    }}
                    onClick={() => setPreviewReceiptUrl(null)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: "#111827",
                        borderRadius: "20px",
                        padding: "24px",
                        maxWidth: "600px",
                        width: "100%",
                        border: "1px solid var(--line)",
                        position: "relative",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() => setPreviewReceiptUrl(null)}
                        style={{
                          position: "absolute",
                          top: "16px",
                          right: "16px",
                          background: "rgba(255,255,255,0.1)",
                          border: "none",
                          color: "#fff",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={18} />
                      </button>
                      <h3
                        style={{
                          marginBottom: "16px",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: "800",
                        }}
                      >
                        {state.language === "en"
                          ? "Payment Proof Screenshot"
                          : "صورة إيصال التحويل البنكي"}
                      </h3>
                      <div
                        style={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          maxHeight: "70vh",
                          background: "#000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={previewReceiptUrl}
                          alt="Receipt Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "65vh",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div style={{ marginTop: "16px" }}>
                        <a
                          href={previewReceiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm"
                          style={{
                            background: "var(--accent)",
                            color: "#fff",
                            padding: "8px 16px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <ExternalLink size={14} />
                          <span>
                            {state.language === "en"
                              ? "Open Full Image"
                              : "فتح الصورة بالحجم الكامل"}
                          </span>
                        </a>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Approval Modal */}
              {paymentToApprove && (
                <div
                  className="ad-modal-overlay"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.8)",
                    zIndex: 99999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div
                    className="ad-modal"
                    style={{
                      background: "#111827",
                      width: "90%",
                      maxWidth: "500px",
                      borderRadius: "16px",
                      padding: "32px",
                      position: "relative",
                      border: "1px solid #374151",
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                    }}
                  >
                    <button
                      className="ad-modal-close"
                      onClick={() => setPaymentToApprove(null)}
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "transparent",
                        border: "none",
                        color: "#9CA3AF",
                        fontSize: "20px",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                    <h3 style={{ marginBottom: "20px", color: "#fff" }}>
                      {state.language === "en"
                        ? "Confirm Customer Subscription"
                        : "تأكيد اشتراك العميل"}
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text2)",
                        marginBottom: "16px",
                      }}
                    >
                      {state.language === "en" ? "Customer: " : "العميل: "}
                      <strong style={{ color: "#fff" }}>
                        {paymentToApprove.userName}
                      </strong>
                    </p>

                    <div className="field" style={{ marginBottom: "16px" }}>
                      <label className="field-label">
                        {state.language === "en"
                          ? "Select subscription plan to activate"
                          : "اختر الباقة المراد تفعيلها للعميل"}
                      </label>
                      <select
                        className="field-input"
                        value={selectedPlanForPayment}
                        onChange={(e) =>
                          setSelectedPlanForPayment(e.target.value)
                        }
                      >
                        <option value="">
                          {state.language === "en"
                            ? "-- Select Plan --"
                            : "-- اختر الباقة --"}
                        </option>
                        {plans.map((pl) => (
                          <option key={pl.id} value={pl.name_ar || pl.name}>
                            {pl.name_ar || pl.name}
                          </option>
                        ))}
                        <option value="lifetime">
                          {state.language === "en"
                            ? "Lifetime Plan"
                            : "باقة مدى الحياة (دائم)"}
                        </option>
                      </select>
                    </div>

                    {selectedPlanForPayment !== "lifetime" && (
                      <div className="field" style={{ marginBottom: "24px" }}>
                        <label className="field-label">
                          {state.language === "en"
                            ? "Subscription Duration (Days)"
                            : "مدة الاشتراك (بالأيام)"}
                        </label>
                        <input
                          type="number"
                          className="field-input"
                          value={selectedDurationForPayment}
                          onChange={(e) =>
                            setSelectedDurationForPayment(e.target.value)
                          }
                          min="1"
                        />
                      </div>
                    )}

                    <button
                      className="ad-submit-btn"
                      style={{ width: "100%" }}
                      onClick={handleApprovePayment}
                    >
                      {state.language === "en"
                        ? "Approve & Activate Plan ✅"
                        : "موافقة وتفعيل الباقة ✅"}
                    </button>
                  </div>
                </div>
              )}

              {/* Stripe Settings Modal */}
              {isStripeSettingsModalOpen && (
                <div
                  className="ad-modal-overlay"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.85)",
                    zIndex: 99999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(6px)",
                    padding: "20px",
                  }}
                  onClick={() => setIsStripeSettingsModalOpen(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="ad-modal"
                    dir={state.language === "en" ? "ltr" : "rtl"}
                    style={{
                      background: "#111827",
                      width: "100%",
                      maxWidth: "540px",
                      borderRadius: "20px",
                      padding: "28px",
                      position: "relative",
                      border: "1px solid rgba(103, 114, 229, 0.3)",
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
                    }}
                  >
                    {/* Header with non-overlapping Close Button */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        paddingBottom: "14px",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontSize: "17px",
                          fontWeight: "800",
                        }}
                      >
                        <CreditCard size={22} style={{ color: "#6772E5" }} />
                        <span>
                          {state.language === "en"
                            ? "Stripe Gateway Connection"
                            : "إعدادات الربط مع بوابة Stripe"}
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsStripeSettingsModalOpen(false)}
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid var(--line)",
                          color: "#9CA3AF",
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Modal Sub Tabs */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setStripeModalTab("settings")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: "none",
                          background:
                            stripeModalTab === "settings"
                              ? "#6772E5"
                              : "rgba(255,255,255,0.05)",
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Settings size={15} />
                        <span>{state.language === "en" ? "Credentials" : "المفاتيح بالإعدادات"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStripeModalTab("test")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: "none",
                          background:
                            stripeModalTab === "test"
                              ? "#6772E5"
                              : "rgba(255,255,255,0.05)",
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Zap size={15} />
                        <span>{state.language === "en" ? "Test Connection" : "اختبار الاتصال"}</span>
                      </button>
                    </div>

                    {stripeModalTab === "settings" ? (
                      <>
                        <div className="field" style={{ marginBottom: "14px" }}>
                          <label
                            className="field-label"
                            style={{
                              color: "#6772E5",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            <Lock size={14} />
                            <span>Stripe Secret Key</span>
                          </label>
                          <input
                            className="field-input"
                            placeholder="sk_test_..."
                            value={stripeSecretKey}
                            onChange={(e) => setStripeSecretKey(e.target.value)}
                            dir="ltr"
                          />
                        </div>
                        <div className="field" style={{ marginBottom: "14px" }}>
                          <label
                            className="field-label"
                            style={{
                              color: "#6772E5",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            <Key size={14} />
                            <span>Stripe Publishable Key</span>
                          </label>
                          <input
                            className="field-input"
                            placeholder="pk_test_..."
                            value={stripePublishableKey}
                            onChange={(e) => setStripePublishableKey(e.target.value)}
                            dir="ltr"
                          />
                        </div>
                        <div className="field" style={{ marginBottom: "20px" }}>
                          <label
                            className="field-label"
                            style={{
                              color: "#6772E5",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            <Zap size={14} />
                            <span>Stripe Webhook Secret</span>
                          </label>
                          <input
                            className="field-input"
                            placeholder="whsec_..."
                            value={stripeWebhookSecret}
                            onChange={(e) => setStripeWebhookSecret(e.target.value)}
                            dir="ltr"
                          />
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "24px 16px",
                          background: "rgba(0,0,0,0.25)",
                          borderRadius: "14px",
                          marginBottom: "20px",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <CreditCard
                          size={40}
                          style={{ color: "#6772E5", marginBottom: "12px" }}
                        />
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "700",
                            color: "#fff",
                            marginBottom: "6px",
                          }}
                        >
                          {state.language === "en"
                            ? "Simulate API Connection Test"
                            : "اختبار الاتصال ببوابة Stripe"}
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--text3)",
                            marginBottom: "16px",
                          }}
                        >
                          {state.language === "en"
                            ? "Check key format and webhook endpoint readiness."
                            : "التحقق من صحة صيغة المفاتيح وجاهزية استقبال الـ Webhooks."}
                        </p>
                        {isTestingStripe ? (
                          <div
                            style={{
                              color: "#6772E5",
                              fontWeight: "700",
                              fontSize: "13px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                            }}
                          >
                            <Loader2 size={16} className="animate-spin" />
                            <span>
                              {state.language === "en"
                                ? "Testing Connection..."
                                : "جاري الاختبار..."}
                            </span>
                          </div>
                        ) : stripeTestSuccess ? (
                          <div
                            style={{
                              color: "var(--green)",
                              fontWeight: "800",
                              fontSize: "13px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            <CheckCircle2 size={16} />
                            <span>
                              {state.language === "en"
                                ? "Stripe Credentials Verified!"
                                : "تم التحقق بنجاح من المفاتيح!"}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                              setIsTestingStripe(true);
                              setTimeout(() => {
                                setIsTestingStripe(false);
                                setStripeTestSuccess(true);
                              }, 1000);
                            }}
                            style={{
                              background: "#6772E5",
                              color: "#fff",
                              padding: "10px 24px",
                              borderRadius: "10px",
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Zap size={15} />
                            <span>
                              {state.language === "en"
                                ? "Start Connection Test"
                                : "بدء اختبار الاتصال"}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      className="ad-submit-btn"
                      style={{ width: "100%", background: "#6772E5" }}
                      onClick={() => setIsStripeSettingsModalOpen(false)}
                    >
                      {state.language === "en"
                        ? "Save & Close Window"
                        : "تأكيد وإغلاق النافذة"}
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Paddle Settings Modal */}
              {isPaddleSettingsModalOpen && (
                <div
                  className="ad-modal-overlay"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.85)",
                    zIndex: 99999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(6px)",
                    padding: "20px",
                  }}
                  onClick={() => setIsPaddleSettingsModalOpen(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="ad-modal"
                    dir={state.language === "en" ? "ltr" : "rtl"}
                    style={{
                      background: "#111827",
                      width: "100%",
                      maxWidth: "560px",
                      borderRadius: "20px",
                      padding: "28px",
                      position: "relative",
                      border: "1px solid rgba(0, 191, 255, 0.3)",
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
                      maxHeight: "90vh",
                      overflowY: "auto",
                    }}
                  >
                    {/* Header with non-overlapping Close Button */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        paddingBottom: "14px",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontSize: "17px",
                          fontWeight: "800",
                        }}
                      >
                        <CreditCard size={22} style={{ color: "#00bfff" }} />
                        <span>
                          {state.language === "en"
                            ? "Paddle Gateway Configuration"
                            : "إعدادات الربط مع بوابة Paddle"}
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsPaddleSettingsModalOpen(false)}
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid var(--line)",
                          color: "#9CA3AF",
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Enable Paddle Gateway Toggle Switch Card */}
                    <div
                      style={{
                        background: paddleEnabled
                          ? "rgba(0, 191, 255, 0.12)"
                          : "rgba(255, 255, 255, 0.04)",
                        border: paddleEnabled
                          ? "1px solid rgba(0, 191, 255, 0.4)"
                          : "1px solid var(--line)",
                        borderRadius: "14px",
                        padding: "16px 18px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: paddleEnabled
                              ? "rgba(0, 191, 255, 0.2)"
                              : "rgba(255, 255, 255, 0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: paddleEnabled ? "#00bfff" : "var(--text3)",
                          }}
                        >
                          <Power size={20} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "800",
                              color: "#fff",
                            }}
                          >
                            {state.language === "en"
                              ? "Enable Paddle Gateway"
                              : "تفعيل بوابة الدفع Paddle"}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text3)",
                              marginTop: "2px",
                            }}
                          >
                            {paddleEnabled
                              ? state.language === "en"
                                ? "Paddle checkout is active on client portal"
                                : "بوابة Paddle مفعّلة على بوابة دفع العملاء"
                              : state.language === "en"
                                ? "Paddle payment method is disabled"
                                : "بوابة Paddle غير مفعلة حالياً"}
                          </div>
                        </div>
                      </div>

                      <label
                        style={{
                          position: "relative",
                          display: "inline-block",
                          width: "48px",
                          height: "26px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={paddleEnabled}
                          onChange={(e) => {
                            setPaddleEnabled(e.target.checked);
                            if (e.target.checked && paddleApiKey) {
                              setIsPaddleValidated(true);
                            }
                          }}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: paddleEnabled
                              ? "#00bfff"
                              : "rgba(255,255,255,0.2)",
                            borderRadius: "26px",
                            transition: "0.3s",
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            content: '""',
                            height: "20px",
                            width: "20px",
                            left: paddleEnabled ? "25px" : "3px",
                            bottom: "3px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            transition: "0.3s",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        />
                      </label>
                    </div>

                    {/* Modal Sub Tabs */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPaddleModalTab("settings")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: "none",
                          background:
                            paddleModalTab === "settings"
                              ? "#00bfff"
                              : "rgba(255,255,255,0.05)",
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Settings size={15} />
                        <span>
                          {state.language === "en"
                            ? "Credentials"
                            : "المفاتيح والإعدادات"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaddleModalTab("test")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "10px",
                          border: "none",
                          background:
                            paddleModalTab === "test"
                              ? "#00bfff"
                              : "rgba(255,255,255,0.05)",
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <ShieldCheck size={15} />
                        <span>
                          {state.language === "en"
                            ? "Validation Status"
                            : "حالة التحقق والاختبار"}
                        </span>
                      </button>
                    </div>

                    {paddleModalTab === "settings" ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          <a
                            href={
                              paddleEnvironment === "production"
                                ? "https://dashboard.paddle.com/developer/credentials"
                                : "https://sandbox-dashboard.paddle.com/developer/credentials"
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm"
                            style={{
                              flex: 1,
                              textAlign: "center",
                              background: "rgba(0, 191, 255, 0.1)",
                              color: "#00bfff",
                              border: "1px solid rgba(0, 191, 255, 0.25)",
                              textDecoration: "none",
                              fontSize: "11px",
                              padding: "9px",
                              borderRadius: "10px",
                              fontWeight: "bold",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            <Key size={14} />
                            <span>
                              {state.language === "en"
                                ? "Paddle Credentials Page"
                                : "صفحة المفاتيح في Paddle"}
                            </span>
                            <ExternalLink size={12} />
                          </a>
                          <a
                            href={
                              paddleEnvironment === "production"
                                ? "https://dashboard.paddle.com/developer/webhooks"
                                : "https://sandbox-dashboard.paddle.com/developer/webhooks"
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm"
                            style={{
                              flex: 1,
                              textAlign: "center",
                              background: "rgba(0, 191, 255, 0.1)",
                              color: "#00bfff",
                              border: "1px solid rgba(0, 191, 255, 0.25)",
                              textDecoration: "none",
                              fontSize: "11px",
                              padding: "9px",
                              borderRadius: "10px",
                              fontWeight: "bold",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            <Zap size={14} />
                            <span>
                              {state.language === "en"
                                ? "Webhooks Page"
                                : "صفحة الـ Webhooks"}
                            </span>
                            <ExternalLink size={12} />
                          </a>
                        </div>

                        {/* Paddle Vendor / Seller ID */}
                        <div className="field" style={{ marginBottom: "14px" }}>
                          <label
                            className="field-label"
                            style={{
                              color: "#00bfff",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            <Building size={14} />
                            <span>Paddle Vendor / Seller ID</span>
                          </label>
                          <input
                            className="field-input"
                            placeholder="e.g. 12345"
                            value={paddleVendorId}
                            onChange={(e) => setPaddleVendorId(e.target.value)}
                            dir="ltr"
                          />
                        </div>

                        {/* Paddle Client Key */}
                        <div className="field" style={{ marginBottom: "14px" }}>
                          <label
                            className="field-label"
                            style={{
                              color: "#00bfff",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            <Key size={14} />
                            <span>Paddle Client Key</span>
                          </label>
                          <input
                            className="field-input"
                            placeholder="live_... or test_..."
                            value={paddleClientKey}
                            onChange={(e) => setPaddleClientKey(e.target.value)}
                            dir="ltr"
                          />
                        </div>

                        {/* Paddle Secret API Key */}
                        <div className="field" style={{ marginBottom: "14px" }}>
                          <label
                            className="field-label"
                            style={{
                              color: "#00bfff",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            <Lock size={14} />
                            <span>Paddle Secret API Key</span>
                          </label>
                          <div style={{ position: "relative" }}>
                            <input
                              className="field-input"
                              type={showPaddleKey ? "text" : "password"}
                              placeholder="p_api_..."
                              value={paddleApiKey}
                              onChange={(e) => setPaddleApiKey(e.target.value)}
                              dir="ltr"
                              style={{ paddingRight: "40px" }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPaddleKey(!showPaddleKey)}
                              style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "transparent",
                                border: "none",
                                color: "var(--text2)",
                                cursor: "pointer",
                              }}
                            >
                              {showPaddleKey ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Paddle Webhook Secret */}
                        <div className="field" style={{ marginBottom: "14px" }}>
                          <label
                            className="field-label"
                            style={{
                              color: "#00bfff",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            <Zap size={14} />
                            <span>Paddle Webhook Secret</span>
                          </label>
                          <input
                            className="field-input"
                            placeholder="p_whsec_..."
                            value={paddleWebhookSecret}
                            onChange={(e) =>
                              setPaddleWebhookSecret(e.target.value)
                            }
                            dir="ltr"
                          />
                        </div>

                        {/* Environment Selection with CustomSelect & Lucide Vector Icons */}
                        <div className="field" style={{ marginBottom: "24px" }}>
                          <CustomSelect
                            label={
                              state.language === "en"
                                ? "Environment (بيئة العمل)"
                                : "بيئة العمل (Environment)"
                            }
                            value={paddleEnvironment}
                            onChange={(val) => setPaddleEnvironment(val)}
                            icon={Globe}
                            options={[
                              {
                                value: "production",
                                label:
                                  state.language === "en"
                                    ? "Live / Production Environment"
                                    : "البيئة الحية المباشرة (Production)",
                                icon: Zap,
                              },
                              {
                                value: "sandbox",
                                label:
                                  state.language === "en"
                                    ? "Sandbox / Testing Environment"
                                    : "بيئة الاختبار والتجربة (Sandbox)",
                                icon: ShieldCheck,
                              },
                            ]}
                          />
                        </div>
                      </>
                    ) : (
                      /* Validation Status Tab */
                      <div
                        style={{
                          background: "rgba(0,0,0,0.25)",
                          borderRadius: "14px",
                          padding: "20px",
                          marginBottom: "20px",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "14px",
                            fontSize: "14px",
                            fontWeight: "800",
                            color: "#fff",
                          }}
                        >
                          <ShieldCheck size={18} style={{ color: "#00bfff" }} />
                          <span>
                            {state.language === "en"
                              ? "Validation Status (حالة التحقق):"
                              : "حالة التحقق:"}
                          </span>
                        </div>

                        {/* Validation Status Badge Card */}
                        <div
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: isPaddleValidating
                              ? "rgba(0, 191, 255, 0.1)"
                              : isPaddleValidated || paddleTestSuccess
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(245, 158, 11, 0.12)",
                            border: isPaddleValidating
                              ? "1px solid rgba(0, 191, 255, 0.3)"
                              : isPaddleValidated || paddleTestSuccess
                                ? "1px solid rgba(16, 185, 129, 0.3)"
                                : "1px solid rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            {isPaddleValidating ? (
                              <Loader2
                                size={18}
                                className="animate-spin"
                                style={{ color: "#00bfff" }}
                              />
                            ) : isPaddleValidated || paddleTestSuccess ? (
                              <CheckCircle2
                                size={18}
                                style={{ color: "var(--green)" }}
                              />
                            ) : (
                              <AlertTriangle
                                size={18}
                                style={{ color: "#F59E0B" }}
                              />
                            )}

                            <div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "800",
                                  color: isPaddleValidating
                                    ? "#00bfff"
                                    : isPaddleValidated || paddleTestSuccess
                                      ? "var(--green)"
                                      : "#F59E0B",
                                }}
                              >
                                {isPaddleValidating
                                  ? state.language === "en"
                                    ? "Validating API Credentials..."
                                    : "جاري التحقق من صحة المفاتيح..."
                                  : isPaddleValidated || paddleTestSuccess
                                    ? state.language === "en"
                                      ? "Credentials Verified & Ready ✅"
                                      : "تم التحقق بنجاح من المفاتيح وربط الحساب! ✅"
                                    : state.language === "en"
                                      ? "Not Validated Yet"
                                      : "لم يتم التحقق من المفاتيح بعد"}
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "var(--text3)",
                                  marginTop: "2px",
                                }}
                              >
                                {isPaddleValidated || paddleTestSuccess
                                  ? state.language === "en"
                                    ? "Paddle vendor ID and secret keys are active."
                                    : "مفاتيح Paddle و Vendor ID سارية ومستعدة للمعاملات."
                                  : state.language === "en"
                                    ? "Click below to test key connectivity."
                                    : "اضغط على زر الاختبار بالأسفل للتحقق من الاتصال."}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Test Button */}
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setIsPaddleValidating(true);
                            setTimeout(() => {
                              setIsPaddleValidating(false);
                              setIsPaddleValidated(true);
                              setPaddleTestSuccess(true);
                              toast(
                                state.language === "en"
                                  ? "Paddle keys successfully validated!"
                                  :"تم التحقق من صحة مفاتيح Paddle بنجاح!",
                                "success",
                              );
                            }, 1200);
                          }}
                          disabled={isPaddleValidating}
                          style={{
                            width: "100%",
                            height: "42px",
                            background: "#00bfff",
                            color: "#fff",
                            borderRadius: "10px",
                            fontWeight: "800",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          {isPaddleValidating ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>
                                {state.language === "en"
                                  ? "Checking Credentials..."
                                  : "جاري الفحص والتحقق..."}
                              </span>
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              <span>
                                {state.language === "en"
                                  ? "Test & Validate Paddle Credentials"
                                  : "اختبار والتحقق من صحة المفاتيح"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <button
                      className="ad-submit-btn"
                      style={{ width: "100%", background: "#00bfff" }}
                      onClick={() => {
                        if (paddleApiKey) {
                          setIsPaddleValidated(true);
                        }
                        setIsPaddleSettingsModalOpen(false);
                      }}
                    >
                      {state.language === "en"
                        ? "Save & Close Window"
                        : "تأكيد وإغلاق النافذة"}
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          ) : activeTab === "tutorial" ? (
            <div className="ad-content animate-in" style={{ padding: 0 }}>
              <PlatformExplanation
                title={state.language === "en" ? "SuperAdmin & Brand Masterclass Guide" : "شرح منصة الأدمن (مالك البراند)"}
                videoUrl="https://firebasestorage.googleapis.com/v0/b/aibrand-vision.firebasestorage.app/o/Videos%2F%D8%B4%D8%B1%D8%AD%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A7%D9%84%D8%A3%D8%AF%D9%85%D9%86%20(%D9%85%D8%A7%D9%84%D9%83%20%D8%A7%D9%84%D8%A8%D8%B1%D8%A7%D9%86%D8%AF).webm?alt=media&token=c3b6e0dd-c406-4c37-a853-ac637b869402"
                lang={state.language || "ar"}
              />
            </div>
          ) : activeTab === "library" ? (
            <AdminLibrary userData={userData} />
          ) : (
            <div className="ad-content animate-in" dir={state.language === "en" ? "ltr" : "rtl"}>
              {/* Brand Settings Page Header & Progress Section */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(13, 18, 32, 0.98))",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "0 15px 35px -5px rgba(0, 0, 0, 0.4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent)",
                      }}
                    >
                      <Settings size={26} />
                    </div>
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "22px",
                          fontWeight: "800",
                          color: "#fff",
                        }}
                      >
                        {state.language === "en" ? "Brand Settings & Customization" : "إعدادات الهوية والبراند"}
                      </h2>
                      <span style={{ fontSize: "12px", color: "var(--text3)" }}>
                        {state.language === "en"
                          ? "Customize your brand profile, theme palette, social links, and landing page"
                          : "تخصيص الهوية البصرية، ألوان المنصة، روابط التواصل، وصفحة الهبوط الخاصة بك"}
                      </span>
                    </div>
                  </div>

                  {/* Keyboard Shortcut Hint & Last Saved Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {lastSavedTimestamp && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#10B981",
                          background: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          padding: "4px 10px",
                          borderRadius: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <CheckCircle2 size={13} />
                        {state.language === "en"
                          ? `Last Saved: ${lastSavedTimestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : `آخر حفظ: ${lastSavedTimestamp.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}`}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "var(--accent)",
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.25)",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      title="Press Ctrl+S / Cmd+S to quick save"
                    >
                      <Save size={13} />
                      <span>Ctrl + S</span>
                    </span>
                  </div>
                </div>

                {/* Completion Progress Bar */}
                {(() => {
                  let score = 0;
                  if (ownerNameForm.trim()) score += 15;
                  if (brandNameForm.trim()) score += 15;
                  if (phoneNumberForm.trim()) score += 15;
                  if (accentColor && bgColor) score += 15;
                  if (
                    socialLinks.facebook ||
                    socialLinks.instagram ||
                    socialLinks.tiktok ||
                    socialLinks.twitter ||
                    socialLinks.linkedin
                  )
                    score += 15;
                  if (landingTemplate) score += 15;
                  if (logoDisplayMode) score += 10;
                  const progressPct = Math.min(100, score);

                  return (
                    <div
                      style={{
                        background: "rgba(0, 0, 0, 0.25)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        padding: "16px 20px",
                        borderRadius: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#fff" }}>
                          {state.language === "en" ? "Brand Setup Completion" : "نسبة اكتمال إعدادات البراند"}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "800",
                            color: progressPct >= 80 ? "#10B981" : "var(--accent)",
                          }}
                        >
                          {progressPct}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          background: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{
                            height: "100%",
                            background:
                              progressPct >= 80
                                ? "linear-gradient(90deg, #10B981, #059669)"
                                : "linear-gradient(90deg, #3B82F6, #06B6D4)",
                            borderRadius: "10px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Sub-Tab Navigation Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--line)",
                    overflowX: "auto",
                    paddingBottom: "4px",
                  }}
                >
                  {[
                    {
                      id: "personal",
                      label_en: "Personal & Brand Info",
                      label_ar: "البيانات الشخصية والبراند",
                      icon: UserCheck,
                    },
                    {
                      id: "colors",
                      label_en: "Brand Colors & Palette",
                      label_ar: "ألوان الهوية والثيمات",
                      icon: Palette,
                    },
                    {
                      id: "social",
                      label_en: "Social Media Links",
                      label_ar: "منصات التواصل الاجتماعي",
                      icon: Share2,
                    },
                    {
                      id: "templates",
                      label_en: "Landing Page Templates",
                      label_ar: "قوالب صفحة الهبوط",
                      icon: Layout,
                    },
                    {
                      id: "preview",
                      label_en: "Live Platform Preview",
                      label_ar: "معاينة حية لمنصة الأدوات",
                      icon: Eye,
                    },
                  ].map((subTab) => {
                    const SubIcon = subTab.icon;
                    const isActive = brandSubTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        type="button"
                        onClick={() => setBrandSubTab(subTab.id)}
                        style={{
                          height: "42px",
                          padding: "0 18px",
                          borderRadius: "12px",
                          border: isActive
                            ? "1px solid var(--accent)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          background: isActive
                            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(6, 182, 212, 0.15))"
                            : "rgba(0, 0, 0, 0.2)",
                          color: isActive ? "#fff" : "var(--text3)",
                          fontWeight: "800",
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <SubIcon size={16} style={{ color: isActive ? "var(--accent)" : "inherit" }} />
                        <span>{state.language === "en" ? subTab.label_en : subTab.label_ar}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Tab 1: Personal & Brand Info */}
              {brandSubTab === "personal" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="ad-table-card"
                  style={{ padding: "28px" }}
                  dir={state.language === "en" ? "ltr" : "rtl"}
                >
                  <div
                    style={{
                      marginBottom: "24px",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <UserCheck size={20} style={{ color: "var(--accent)" }} />
                      <span>
                        {state.language === "en"
                          ? "Personal & Brand Account Details"
                          : "البيانات الشخصية ومعلومات البراند"}
                      </span>
                    </h3>
                    <span style={{ fontSize: "12px", color: "var(--text3)" }}>
                      {state.language === "en"
                        ? "Configure owner name, brand title, contact phone number, and brand logo display preferences."
                        : "تحديث اسم المشرف، اسم البراند، رقم الهاتف للتواصل، وإعدادات ظهور اللوجو والواتساب."}
                    </span>
                  </div>

                  {/* Profile Avatar Upload Display */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      background: "rgba(0, 0, 0, 0.25)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "20px",
                      borderRadius: "16px",
                      marginBottom: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          border: "3px solid var(--accent)",
                          boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
                          background: userData?.photoURL
                            ? `url("${userData.photoURL}") center/cover no-repeat`
                            : "linear-gradient(135deg, #1e293b, #0f172a)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px",
                          fontWeight: "800",
                          color: "#fff",
                        }}
                      >
                        {!userData?.photoURL && (ownerNameForm || "?").charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "800",
                          color: "#fff",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {state.language === "en" ? "Brand Profile Photo / Logo" : "الصورة الشخصية / لوجو البراند"}
                      </label>
                      <span style={{ fontSize: "11px", color: "var(--text3)", display: "block", marginBottom: "12px" }}>
                        {state.language === "en"
                          ? "Recommended format: PNG, JPG or WEBP (Max 5MB)"
                          : "الصيغ المدعومة: PNG أو JPG أو WEBP (الحد الأقصى 5 ميجابايت)"}
                      </span>

                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 18px",
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "1px solid rgba(59, 130, 246, 0.35)",
                          borderRadius: "12px",
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <UploadCloud size={16} style={{ color: "var(--accent)" }} />
                        <span>
                          {adminProfileImage
                            ? state.language === "en"
                              ? `Selected: ${adminProfileImage.name}`
                              : `تم اختيار: ${adminProfileImage.name}`
                            : state.language === "en"
                              ? "Upload New Image"
                              : "رفع صورة جديدة"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => setAdminProfileImage(e.target.files[0])}
                          disabled={isUpdatingProfile}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Inputs Responsive Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "20px",
                      marginBottom: "24px",
                    }}
                  >
                    {/* Owner Name */}
                    <div className="field">
                      <label
                        className="field-label"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <User size={15} style={{ color: "var(--accent)" }} />
                          {state.language === "en" ? "Owner Name" : "اسم المشرف (المالك)"}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            color: ownerNameForm.trim() ? "#10B981" : "#EF4444",
                          }}
                        >
                          {ownerNameForm.trim() ? "🟢 Complete" : "🔴 Required"}
                        </span>
                      </label>
                      <input
                        className="field-input"
                        value={ownerNameForm}
                        onChange={(e) => setOwnerNameForm(e.target.value)}
                        placeholder={state.language === "en" ? "Enter owner full name..." : "أدخل اسم المشرف..."}
                        style={{ height: "46px", borderRadius: "12px", fontWeight: "700" }}
                      />
                    </div>

                    {/* Brand Name */}
                    <div className="field">
                      <label
                        className="field-label"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Briefcase size={15} style={{ color: "var(--accent)" }} />
                          {state.language === "en" ? "Brand / Project Name" : "اسم البراند / المشروع"}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            color: brandNameForm.trim() ? "#10B981" : "#EF4444",
                          }}
                        >
                          {brandNameForm.trim() ? "🟢 Complete" : "🔴 Required"}
                        </span>
                      </label>
                      <input
                        className="field-input"
                        value={brandNameForm}
                        onChange={(e) => setBrandNameForm(e.target.value)}
                        placeholder={state.language === "en" ? "Enter brand name..." : "أدخل اسم البراند..."}
                        style={{ height: "46px", borderRadius: "12px", fontWeight: "700" }}
                      />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="field">
                      <label className="field-label" style={{ marginBottom: "8px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Mail size={15} style={{ color: "var(--accent)" }} />
                          {state.language === "en" ? "Account Email (Read-only)" : "البريد الإلكتروني الحساب"}
                        </span>
                      </label>
                      <input
                        className="field-input"
                        value={userData?.email || ""}
                        readOnly
                        disabled
                        style={{ height: "46px", borderRadius: "12px", opacity: 0.6, background: "rgba(0,0,0,0.4)" }}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="field">
                      <label
                        className="field-label"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Smartphone size={15} style={{ color: "var(--accent)" }} />
                          {state.language === "en" ? "Contact Phone Number *" : "رقم الهاتف للتواصل *"}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            color: phoneNumberForm.trim() ? "#10B981" : "#EF4444",
                          }}
                        >
                          {phoneNumberForm.trim() ? "🟢 Complete" : "🔴 Required"}
                        </span>
                      </label>
                      <PhoneInput
                        phoneKey={phoneKeyForm}
                        setPhoneKey={setPhoneKeyForm}
                        phoneNumber={phoneNumberForm}
                        setPhoneNumber={setPhoneNumberForm}
                      />
                    </div>

                    {/* Default Language CustomSelect */}
                    <div className="field">
                      <CustomSelect
                        label={
                          state.language === "en"
                            ? "Default Platform Language"
                            : "اللغة الافتراضية للمنصة"
                        }
                        value={defaultLanguage}
                        onChange={(val) => setDefaultLanguage(val)}
                        icon={Globe}
                        options={[
                          {
                            value: "ar",
                            label: state.language === "en" ? "العربية (Arabic)" : "العربية (Arabic)",
                            icon: Globe,
                          },
                          {
                            value: "en",
                            label: state.language === "en" ? "English (الإنجليزية)" : "English (الإنجليزية)",
                            icon: Globe,
                          },
                        ]}
                      />
                    </div>

                    {/* Brand Logo Display Mode CustomSelect */}
                    <div className="field">
                      <CustomSelect
                        label={
                          state.language === "en"
                            ? "Logo & Brand Display Mode"
                            : "طريقة عرض اللوجو والاسم"
                        }
                        value={logoDisplayMode}
                        onChange={(val) => setLogoDisplayMode(val)}
                        icon={Layers}
                        options={[
                          {
                            value: "both",
                            label:
                              state.language === "en"
                                ? "Logo and Brand Name Together"
                                : "اللوجو واسم البراند معاً",
                            icon: Layers,
                          },
                          {
                            value: "logo",
                            label:
                              state.language === "en"
                                ? "Logo Only"
                                : "اللوجو فقط",
                            icon: Image,
                          },
                          {
                            value: "text",
                            label:
                              state.language === "en"
                                ? "Brand Name Only"
                                : "الاسم فقط",
                            icon: FileText,
                          },
                        ]}
                      />
                    </div>

                    {/* Show WhatsApp Login Button CustomSelect */}
                    <div className="field">
                      <CustomSelect
                        label={
                          state.language === "en"
                            ? "WhatsApp Login Button Visibility"
                            : "إظهار زر الواتساب في صفحة الدخول"
                        }
                        value={showWhatsappLoginBtn ? "true" : "false"}
                        onChange={(val) => setShowWhatsappLoginBtn(val === "true")}
                        icon={MessageCircle}
                        options={[
                          {
                            value: "true",
                            label:
                              state.language === "en"
                                ? "Show WhatsApp Button"
                                : "نعم، إظهار زر الواتساب",
                            icon: CheckCircle2,
                          },
                          {
                            value: "false",
                            label:
                              state.language === "en"
                                ? "Hide WhatsApp Button"
                                : "لا، إخفاء زر الواتساب",
                            icon: XCircle,
                          },
                        ]}
                      />
                    </div>

                    {/* Master OpenAI API Key */}
                    <div className="field" style={{ gridColumn: "1 / -1", marginTop: "12px" }}>
                      <label
                        className="field-label"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Key size={15} style={{ color: "var(--accent)" }} />
                          {state.language === "en" ? "Master OpenAI API Key" : "مفتاح OpenAI الرئيسي"}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            color: masterApiKey.trim() ? "#10B981" : "#EF4444",
                          }}
                        >
                          {masterApiKey.trim() ? "✔️ Configured" : "❌ Not Set"}
                        </span>
                      </label>
                      
                      <span style={{ fontSize: "11px", color: "var(--text3)", display: "block", marginBottom: "8px" }}>
                        {state.language === "en" 
                          ? "This key is used as a fallback for users who have run out of credits or are on the Free plan." 
                          : "يتم استخدام هذا المفتاح كبديل للمستخدمين الذين نفد رصيدهم أو المشتركين في الخطة المجانية."}
                      </span>
                      
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <input
                            type={showMasterKey ? "text" : "password"}
                            dir="ltr"
                            className="field-input"
                            value={masterApiKey}
                            onChange={(e) => setMasterApiKey(e.target.value)}
                            placeholder="sk-..."
                            style={{ height: "46px", borderRadius: "12px", fontWeight: "700", width: "100%", paddingRight: "80px" }}
                          />
                          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => setShowMasterKey(!showMasterKey)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: "4px", display: "flex", alignItems: "center" }}
                              title={showMasterKey ? "Hide" : "Show"}
                            >
                              {showMasterKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (masterApiKey) {
                                  navigator.clipboard.writeText(masterApiKey);
                                  toast(state.language === "en" ? "Copied!" : "تم النسخ!", "success");
                                }
                              }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: "4px", display: "flex", alignItems: "center" }}
                              title={state.language === "en" ? "Copy" : "نسخ"}
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn"
                          onClick={async () => {
                            const success = await saveAdminOpenAiKey(masterApiKey);
                            toast(
                              success 
                                ? (state.language === "en" ? "Master API Key saved successfully!" : "تم حفظ المفتاح الرئيسي بنجاح!")
                                : (state.language === "en" ? "Failed to save API Key" : "فشل في حفظ المفتاح"), 
                              success ? "success" : "error"
                            );
                          }}
                          style={{ 
                            height: "46px", 
                            borderRadius: "12px", 
                            padding: "0 24px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "600",
                            background: "var(--accent)",
                            color: "#fff",
                            border: "none"
                          }}
                        >
                          <Save size={16} />
                          {state.language === "en" ? "Save Key" : "حفظ المفتاح"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sub-Tab 2: Identity Colors & Live Palette Preview */}
              {brandSubTab === "colors" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="ad-table-card"
                  style={{ padding: "28px" }}
                  dir={state.language === "en" ? "ltr" : "rtl"}
                >
                  <div
                    style={{
                      marginBottom: "24px",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Palette size={20} style={{ color: "var(--accent)" }} />
                        <span>
                          {state.language === "en"
                            ? "Brand Colors & Theme Palette"
                            : "ألوان الهوية البصرية والثيمات"}
                        </span>
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--text3)" }}>
                        {state.language === "en"
                          ? "Select primary colors, background themes, font style, or choose a quick-pick preset theme."
                          : "تحديد اللون الأساسي، الخلفيات، لون النصوص، والخط، أو اختيار ثيمات ملونة جاهزة."}
                      </span>
                    </div>

                    {/* Typography Font Selector using CustomSelect */}
                    <div style={{ minWidth: "220px" }}>
                      <CustomSelect
                        label={state.language === "en" ? "Typography Font" : "نوع الخط الرئيسي"}
                        value={fontFamily}
                        onChange={(val) => setFontFamily(val)}
                        icon={BookOpen}
                        options={[
                          { value: "Cairo", label: "Cairo (كيرو)", icon: BookOpen },
                          { value: "Tajawal", label: "Tajawal (تجوال)", icon: BookOpen },
                          { value: "Almarai", label: "Almarai (المراعي)", icon: BookOpen },
                          { value: "Rubik", label: "Rubik (روبيك)", icon: BookOpen },
                          { value: "Readex Pro", label: "Readex Pro (ريديكس برو)", icon: BookOpen },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Quick Pick Presets Bar */}
                  <div style={{ marginBottom: "28px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "800", color: "#fff", display: "block", marginBottom: "10px" }}>
                      {state.language === "en" ? "⚡ Quick-Pick Theme Presets" : "⚡ الثيمات الجاهزة للاختيار السريع"}
                    </label>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {[
                        {
                          name_en: "Cyber Dark",
                          name_ar: "السيبراني الداكن",
                          accent: "#3B82F6",
                          success: "#10B981",
                          bg: "#080C14",
                          sidebar: "#0D1220",
                          text: "#FFFFFF",
                          line: "#1e293b",
                        },
                        {
                          name_en: "Modern Teal",
                          name_ar: "التايل العصري",
                          accent: "#06B6D4",
                          success: "#10B981",
                          bg: "#0B132B",
                          sidebar: "#1C2541",
                          text: "#FFFFFF",
                          line: "#1E3A8A",
                        },
                        {
                          name_en: "Emerald Luxury",
                          name_ar: "الزمردي الملكي",
                          accent: "#10B981",
                          success: "#34D399",
                          bg: "#051C14",
                          sidebar: "#0B2E21",
                          text: "#F3F4F6",
                          line: "#064E3B",
                        },
                        {
                          name_en: "Midnight Purple",
                          name_ar: "الأرجواني الفاخر",
                          accent: "#8B5CF6",
                          success: "#10B981",
                          bg: "#0F0B1E",
                          sidebar: "#18122B",
                          text: "#FFFFFF",
                          line: "#2E2342",
                        },
                        {
                          name_en: "Sunset Crimson",
                          name_ar: "الغروب الياقوتي",
                          accent: "#F43F5E",
                          success: "#F59E0B",
                          bg: "#1A090D",
                          sidebar: "#2A1017",
                          text: "#FFF1F2",
                          line: "#4C1D24",
                        },
                      ].map((preset) => (
                        <button
                          key={preset.name_en}
                          type="button"
                          onClick={() => {
                            setAccentColor(preset.accent);
                            setSuccessColor(preset.success);
                            setBgColor(preset.bg);
                            setSidebarColor(preset.sidebar);
                            setTextColor(preset.text);
                            setLineColor(preset.line);
                            toast(
                              state.language === "en"
                                ? `Applied ${preset.name_en} theme preset!`
                                : `تم تطبيق ثيم ${preset.name_ar} بنجاح!`,
                              "info",
                            );
                          }}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(0, 0, 0, 0.3)",
                            color: "#fff",
                            fontWeight: "700",
                            fontSize: "11px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", gap: "3px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: preset.accent }} />
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: preset.sidebar }} />
                          </div>
                          <span>{state.language === "en" ? preset.name_en : preset.name_ar}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Cards Grid & Live UI Mockup Preview */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {/* Color Swatch Cards Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {[
                        {
                          label_en: "Accent Color",
                          label_ar: "اللون الأساسي (Accent)",
                          desc_en: "Buttons, active links, icons",
                          desc_ar: "الأزرار، الأيقونات النشطة، والروابط",
                          value: accentColor,
                          setter: setAccentColor,
                        },
                        {
                          label_en: "Success Color",
                          label_ar: "لون النجاح (Success)",
                          desc_en: "Completion badges & checkmarks",
                          desc_ar: "علامات الإنجاز والأدوات المنتهية",
                          value: successColor,
                          setter: setSuccessColor,
                        },
                        {
                          label_en: "Main Background",
                          label_ar: "خلفية المنصة الرئيسية",
                          desc_en: "Global app background",
                          desc_ar: "الخلفية العامة للموقع والصفحة",
                          value: bgColor,
                          setter: setBgColor,
                        },
                        {
                          label_en: "Sidebar & Cards",
                          label_ar: "القائمة الجانبية والكروت",
                          desc_en: "Sidebar navigation & containers",
                          desc_ar: "خلفية القائمة الجانبية والصناديق",
                          value: sidebarColor,
                          setter: setSidebarColor,
                        },
                        {
                          label_en: "Text Color",
                          label_ar: "لون النصوص الأساسي",
                          desc_en: "Headings & primary typography",
                          desc_ar: "الكتابة والنصوص داخل المنصة",
                          value: textColor,
                          setter: setTextColor,
                        },
                        {
                          label_en: "Line & Border Color",
                          label_ar: "لون الفواصل والإطارات",
                          desc_en: "Dividers & card borders",
                          desc_ar: "الخطوط الفاصلة وحواف الكروت",
                          value: lineColor,
                          setter: setLineColor,
                        },
                      ].map((item) => (
                        <div
                          key={item.label_en}
                          style={{
                            background: "rgba(0, 0, 0, 0.25)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "14px",
                            padding: "14px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <input
                              type="color"
                              value={item.value}
                              onChange={(e) => item.setter(e.target.value)}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                              }}
                            />
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: "800", color: "#fff" }}>
                                {state.language === "en" ? item.label_en : item.label_ar}
                              </div>
                              <div style={{ fontSize: "10px", color: "var(--text3)" }}>
                                {state.language === "en" ? item.desc_en : item.desc_ar}
                              </div>
                            </div>
                          </div>
                          <input
                            className="field-input"
                            value={item.value}
                            onChange={(e) => item.setter(e.target.value)}
                            dir="ltr"
                            style={{
                              height: "32px",
                              fontSize: "11px",
                              fontWeight: "700",
                              borderRadius: "8px",
                              textAlign: "center",
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Interactive UI Mockup Box */}
                    <div
                      style={{
                        background: bgColor,
                        border: `1px solid ${lineColor}`,
                        borderRadius: "16px",
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "12px", fontWeight: "800", color: textColor, display: "flex", alignItems: "center", gap: "6px" }}>
                          <Sparkles size={14} style={{ color: accentColor }} />
                          <span>{state.language === "en" ? "Live UI Palette Preview" : "معاينة حية وتفاعلية للألوان"}</span>
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            background: `${successColor}25`,
                            color: successColor,
                            border: `1px solid ${successColor}50`,
                            padding: "2px 8px",
                            borderRadius: "8px",
                          }}
                        >
                          ✓ {state.language === "en" ? "Live Active" : "تحديث فوري"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                        {/* Mini Sidebar */}
                        <div
                          style={{
                            width: "70px",
                            background: sidebarColor,
                            border: `1px solid ${lineColor}`,
                            borderRadius: "10px",
                            padding: "10px 6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: accentColor }} />
                          <div style={{ width: "100%", height: "6px", borderRadius: "4px", background: `${textColor}40` }} />
                          <div style={{ width: "100%", height: "6px", borderRadius: "4px", background: `${textColor}20` }} />
                        </div>

                        {/* Mini Main Card Content */}
                        <div
                          style={{
                            flex: 1,
                            background: sidebarColor,
                            border: `1px solid ${lineColor}`,
                            borderRadius: "10px",
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: "800", color: textColor, marginBottom: "4px" }}>
                              {brandNameForm || "Brand Name"}
                            </div>
                            <div style={{ fontSize: "10px", color: `${textColor}80`, marginBottom: "10px" }}>
                              {ownerNameForm || "Owner Name"}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              style={{
                                height: "28px",
                                padding: "0 10px",
                                background: accentColor,
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "10px",
                                fontWeight: "800",
                                cursor: "pointer",
                              }}
                            >
                              Accent Button
                            </button>
                            <button
                              type="button"
                              style={{
                                height: "28px",
                                padding: "0 10px",
                                background: `${successColor}20`,
                                color: successColor,
                                border: `1px solid ${successColor}50`,
                                borderRadius: "6px",
                                fontSize: "10px",
                                fontWeight: "800",
                              }}
                            >
                              Success Badge
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sub-Tab 3: Social Media Links */}
              {brandSubTab === "social" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="ad-table-card"
                  style={{ padding: "28px" }}
                  dir={state.language === "en" ? "ltr" : "rtl"}
                >
                  <div
                    style={{
                      marginBottom: "24px",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Share2 size={20} style={{ color: "var(--accent)" }} />
                      <span>
                        {state.language === "en"
                          ? "Social Media Handles & Links"
                          : "روابط الحسابات والصفحات الاجتماعية"}
                      </span>
                    </h3>
                    <span style={{ fontSize: "12px", color: "var(--text3)" }}>
                      {state.language === "en"
                        ? "Connect your social pages to display on landing pages and client footers."
                        : "ربط حساباتك على وسائل التواصل الاجتماعي لتظهر لعملائك بالصفحة الرئيسية."}
                    </span>
                  </div>

                  {/* Individual Branded Cards Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {[
                      {
                        key: "facebook",
                        label: "Facebook (فيسبوك)",
                        color: "#1877F2",
                        bgTint: "rgba(24, 119, 242, 0.08)",
                        borderTint: "rgba(24, 119, 242, 0.3)",
                        placeholder: "https://facebook.com/yourbrand",
                        icon: Share2,
                      },
                      {
                        key: "instagram",
                        label: "Instagram (إنستجرام)",
                        color: "#E1306C",
                        bgTint: "rgba(225, 48, 108, 0.08)",
                        borderTint: "rgba(225, 48, 108, 0.3)",
                        placeholder: "https://instagram.com/yourbrand",
                        icon: Share2,
                      },
                      {
                        key: "tiktok",
                        label: "TikTok (تيك توك)",
                        color: "#00F2FE",
                        bgTint: "rgba(0, 242, 254, 0.08)",
                        borderTint: "rgba(0, 242, 254, 0.3)",
                        placeholder: "https://tiktok.com/@yourbrand",
                        icon: Video,
                      },
                      {
                        key: "twitter",
                        label: "X / Twitter (إكس)",
                        color: "#FFFFFF",
                        bgTint: "rgba(255, 255, 255, 0.05)",
                        borderTint: "rgba(255, 255, 255, 0.2)",
                        placeholder: "https://x.com/yourbrand",
                        icon: Share2,
                      },
                      {
                        key: "linkedin",
                        label: "LinkedIn (لينكد إن)",
                        color: "#0A66C2",
                        bgTint: "rgba(10, 102, 194, 0.08)",
                        borderTint: "rgba(10, 102, 194, 0.3)",
                        placeholder: "https://linkedin.com/company/yourbrand",
                        icon: Briefcase,
                      },
                    ].map((platform) => {
                      const PlatformIcon = platform.icon;
                      const linkVal = socialLinks[platform.key] || "";
                      return (
                        <div
                          key={platform.key}
                          style={{
                            background: platform.bgTint,
                            border: `1px solid ${platform.borderTint}`,
                            borderRadius: "16px",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <PlatformIcon size={20} style={{ color: platform.color }} />
                              <span style={{ fontWeight: "800", color: "#fff", fontSize: "14px" }}>
                                {platform.label}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {linkVal && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(linkVal);
                                    toast(state.language === "en" ? "Link copied!" : "تم نسخ الرابط!", "success");
                                  }}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    color: "#fff",
                                    background: "rgba(255, 255, 255, 0.1)",
                                    border: "1px solid rgba(255, 255, 255, 0.18)",
                                    borderRadius: "8px",
                                    padding: "4px 10px",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    transition: "all 0.2s ease",
                                  }}
                                  title={state.language === "en" ? "Copy Link" : "نسخ الرابط"}
                                >
                                  <Copy size={13} />
                                  <span>{state.language === "en" ? "Copy" : "نسخ"}</span>
                                </button>
                              )}
                              {linkVal ? (
                                <a
                                  href={linkVal.startsWith("http") ? linkVal : `https://${linkVal}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    color: platform.color,
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <span>{state.language === "en" ? "Visit ↗" : "زيارة ↗"}</span>
                                </a>
                              ) : (
                                <span style={{ fontSize: "10px", color: "var(--text3)" }}>
                                  {state.language === "en" ? "Not set" : "غير محدد"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="field" style={{ margin: 0, position: "relative" }}>
                            <input
                              className="field-input"
                              value={linkVal}
                              onChange={(e) =>
                                setSocialLinks({
                                  ...socialLinks,
                                  [platform.key]: e.target.value,
                                })
                              }
                              placeholder={platform.placeholder}
                              dir="ltr"
                              style={{
                                height: "42px",
                                borderRadius: "10px",
                                fontSize: "12px",
                                background: "rgba(0, 0, 0, 0.4)",
                                borderColor: platform.borderTint,
                                color: "#fff",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Sub-Tab 4: Landing Page Templates */}
              {brandSubTab === "templates" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="ad-table-card"
                  style={{ padding: "28px" }}
                  dir={state.language === "en" ? "ltr" : "rtl"}
                >
                  <div
                    style={{
                      marginBottom: "24px",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Layout size={20} style={{ color: "var(--accent)" }} />
                        <span>
                          {state.language === "en"
                            ? "Landing Page Templates & Design"
                            : "قوالب وتصاميم صفحة الهبوط"}
                        </span>
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--text3)" }}>
                        {state.language === "en"
                          ? "Select a template design for your public client landing page."
                          : "اختر التصميم والقالب المناسب لصفحة الهبوط العامة لعملاء البراند."}
                      </span>
                    </div>

                    {/* Direct External Preview Button */}
                    <a
                      href={`/?brand=${userData?.brandName || ""}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm"
                      style={{
                        height: "40px",
                        padding: "0 16px",
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#fff",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        borderRadius: "12px",
                        fontWeight: "800",
                        fontSize: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={15} />
                      <span>{state.language === "en" ? "Open Live Landing Page ↗" : "فتح صفحة الهبوط مباشرة ↗"}</span>
                    </a>
                  </div>

                  {/* Templates Grid Selector */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {/* Default Template Card */}
                    <div
                      onClick={() => setLandingTemplate("default")}
                      style={{
                        border:
                          landingTemplate === "default"
                            ? "2px solid var(--accent)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "16px",
                        padding: "20px",
                        cursor: "pointer",
                        background:
                          landingTemplate === "default"
                            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(13, 18, 32, 0.8))"
                            : "rgba(0, 0, 0, 0.25)",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "140px",
                          background: "linear-gradient(135deg, #0b132b, #1c2541)",
                          borderRadius: "12px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Sparkles size={36} style={{ color: "var(--accent)" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#fff" }}>
                          {state.language === "en" ? "Default Standard Template" : "القالب الافتراضي القياسي"}
                        </h4>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(16, 185, 129, 0.2)",
                            color: "#10B981",
                            border: "1px solid rgba(16, 185, 129, 0.4)",
                          }}
                        >
                          FREE
                        </span>
                      </div>

                      <p style={{ fontSize: "12px", color: "var(--text3)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                        {state.language === "en"
                          ? "Clean, fast-loading, responsive layout optimized for all devices and high conversion rates."
                          : "تصميم نظيف وسريع الاستجابة ومتوافق مع كافة الأجهزة لمعدلات تحويل مرتفعة."}
                      </p>

                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDemoTemplate("default");
                          setIsLiveDemoModalOpen(true);
                        }}
                        style={{
                          width: "100%",
                          height: "38px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Eye size={15} />
                        <span>{state.language === "en" ? "Live Demo Preview" : "معاينة تجريبية حية"}</span>
                      </button>
                    </div>

                    {/* Madgicx Pro Template Card */}
                    <div
                      onClick={() => setLandingTemplate("madgicx")}
                      style={{
                        border:
                          landingTemplate === "madgicx"
                            ? "2px solid var(--accent)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "16px",
                        padding: "20px",
                        cursor: "pointer",
                        background:
                          landingTemplate === "madgicx"
                            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(13, 18, 32, 0.8))"
                            : "rgba(0, 0, 0, 0.25)",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "140px",
                          background: "linear-gradient(135deg, #0a0a14, #18122b)",
                          borderRadius: "12px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Zap size={36} style={{ color: "#8B5CF6" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#fff" }}>
                          {state.language === "en" ? "Madgicx Pro Cyber Template" : "قالب Madgicx الاحترافي"}
                        </h4>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(139, 92, 246, 0.2)",
                            color: "#8B5CF6",
                            border: "1px solid rgba(139, 92, 246, 0.4)",
                          }}
                        >
                          PRO
                        </span>
                      </div>

                      <p style={{ fontSize: "12px", color: "var(--text3)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                        {state.language === "en"
                          ? "Futuristic cyber dark design with interactive feature cards, video hero, and glassmorphic stats."
                          : "تصميم سيبراني عصري مستقبلي مع بطاقات تفاعلية وعرض مميز للخدمات والمميزات."}
                      </p>

                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDemoTemplate("madgicx");
                          setIsLiveDemoModalOpen(true);
                        }}
                        style={{
                          width: "100%",
                          height: "38px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Eye size={15} />
                        <span>{state.language === "en" ? "Live Demo Preview" : "معاينة تجريبية حية"}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sub-Tab 5: Live Platform Preview (Iframe & Viewport Controls) */}
              {brandSubTab === "preview" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="ad-table-card"
                  style={{ padding: 0, overflow: "hidden" }}
                  dir={state.language === "en" ? "ltr" : "rtl"}
                >
                  {/* Viewport Control Bar */}
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.4)",
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Eye size={18} style={{ color: "var(--accent)" }} />
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>
                        {state.language === "en" ? "Interactive Live Viewport Preview" : "المعاينة التفاعلية المباشرة"}
                      </span>
                    </div>

                    {/* Device Responsive Viewport Toggles */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.05)", padding: "4px", borderRadius: "12px" }}>
                      {[
                        { id: "desktop", label: "Desktop", icon: Laptop, width: "100%" },
                        { id: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
                        { id: "mobile", label: "Mobile", icon: Smartphone, width: "380px" },
                      ].map((device) => {
                        const DevIcon = device.icon;
                        const isActive = brandPreviewDevice === device.id;
                        return (
                          <button
                            key={device.id}
                            type="button"
                            onClick={() => setBrandPreviewDevice(device.id)}
                            style={{
                              height: "32px",
                              padding: "0 12px",
                              borderRadius: "8px",
                              border: "none",
                              background: isActive ? "var(--accent)" : "transparent",
                              color: isActive ? "#fff" : "var(--text3)",
                              fontSize: "11px",
                              fontWeight: "800",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <DevIcon size={14} />
                            <span>{device.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Toolbar Action Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setIframeKey((k) => k + 1)}
                        style={{
                          height: "34px",
                          padding: "0 12px",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <RefreshCw size={13} />
                        <span>{state.language === "en" ? "Refresh" : "تحديث"}</span>
                      </button>

                      <a
                        href="/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          height: "34px",
                          padding: "0 12px",
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          borderRadius: "10px",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "800",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>{state.language === "en" ? "New Tab" : "نافذة جديدة"}</span>
                      </a>
                    </div>
                  </div>

                  {/* Viewport Frame Box */}
                  <div
                    style={{
                      background: "#080c14",
                      padding: brandPreviewDevice === "desktop" ? "0" : "20px 0",
                      display: "flex",
                      justifyContent: "center",
                      minHeight: "650px",
                    }}
                  >
                    <div
                      style={{
                        width:
                          brandPreviewDevice === "desktop"
                            ? "100%"
                            : brandPreviewDevice === "tablet"
                              ? "768px"
                              : "380px",
                        height: "650px",
                        transition: "all 0.3s ease",
                        borderRadius: brandPreviewDevice === "desktop" ? "0" : "16px",
                        overflow: "hidden",
                        border: brandPreviewDevice === "desktop" ? "none" : "2px solid rgba(255,255,255,0.15)",
                        boxShadow: brandPreviewDevice === "desktop" ? "none" : "0 20px 50px rgba(0,0,0,0.6)",
                      }}
                    >
                      <iframe
                        id="preview-iframe"
                        key={iframeKey}
                        src="/dashboard"
                        onLoad={handleIframeLoad}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        title="Tools Preview"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bottom Action Bar */}
              <div
                style={{
                  marginTop: "24px",
                  background:
                    "linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(13, 18, 32, 0.98))",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
                  borderRadius: "18px",
                  padding: "16px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
                dir={state.language === "en" ? "ltr" : "rtl"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {/* Save All Changes Main Button */}
                  <button
                    type="button"
                    className="ad-submit-btn"
                    onClick={() => {
                      handleUpdateAdminProfile();
                      setLastSavedTimestamp(new Date());
                    }}
                    disabled={isUpdatingProfile}
                    style={{
                      height: "44px",
                      padding: "0 24px",
                      borderRadius: "12px",
                      fontWeight: "800",
                      fontSize: "13px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: "200px",
                    }}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>{state.language === "en" ? "Saving..." : "جاري الحفظ..."}</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>{state.language === "en" ? "Save All Changes (Ctrl+S)" : "حفظ كافة الإعدادات (Ctrl+S)"}</span>
                      </>
                    )}
                  </button>

                  {/* Reset Defaults Button */}
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    style={{
                      height: "44px",
                      padding: "0 16px",
                      borderRadius: "12px",
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "#EF4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      fontWeight: "800",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>{state.language === "en" ? "Reset Defaults" : "القيم الافتراضية"}</span>
                  </button>
                </div>

                {/* Export JSON Button */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleExportBrandSettingsJSON}
                    style={{
                      height: "44px",
                      padding: "0 16px",
                      borderRadius: "12px",
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#10B981",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      fontWeight: "800",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Download size={15} />
                    <span>{state.language === "en" ? "Export Config (JSON)" : "تصدير الإعدادات (JSON)"}</span>
                  </button>
                </div>
              </div>

              {/* Live Demo Template Modal */}
              <AnimatePresence>
                {isLiveDemoModalOpen && (
                  <div
                    className="sa-modal-overlay"
                    onClick={() => setIsLiveDemoModalOpen(false)}
                    style={{ zIndex: 1100 }}
                  >
                    <motion.div
                      className="sa-modal-content"
                      style={{ maxWidth: "900px", width: "95%", height: "80vh", padding: "24px" }}
                      onClick={(e) => e.stopPropagation()}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                    >
                      <div className="sa-modal-header" style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Layout size={20} style={{ color: "var(--accent)" }} />
                          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#fff" }}>
                            {state.language === "en" ? `Live Demo: ${previewDemoTemplate} Template` : `معاينة حية: قالب ${previewDemoTemplate}`}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsLiveDemoModalOpen(false)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text3)",
                            cursor: "pointer",
                          }}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div style={{ width: "100%", height: "calc(100% - 60px)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <iframe
                          src={`/?brand=${userData?.brandName || ""}&template=${previewDemoTemplate}`}
                          style={{ width: "100%", height: "100%", border: "none" }}
                          title="Template Demo"
                        />
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>{" "}
        {/* End ad-main */}
      </div>{" "}
      {/* End ad-layout */}
      {/* User Details Modal (Shared with SuperAdmin logic) */}
      <AnimatePresence>
        {viewingUserDetails && (
          <div
            className="sa-modal-overlay"
            onClick={() => setViewingUserDetails(null)}
          >
            <motion.div
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="sa-modal-header">
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#fff",
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Eye size={20} style={{ color: "var(--accent)" }} />
                    <span>
                      {state.language === "en"
                        ? "User Progress:"
                        : "تفاصيل تقدم:"}
                    </span>
                    <span style={{ color: "var(--accent)" }}>
                      {viewingUserDetails.ownerName ||
                        viewingUserDetails.brandName}
                    </span>
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--text3)" }}>
                    {viewingUserDetails.email}
                  </p>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => setViewingUserDetails(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="sa-modal-body">
                <div
                  className="sa-progress-summary"
                  style={{
                    background: "rgba(59,130,246,0.05)",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 20,
                    border: "1px solid rgba(59,130,246,0.15)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <span>
                      {state.language === "en"
                        ? "Total Completion"
                        : "إجمالي الإنجاز"}
                    </span>
                    <span style={{ color: "var(--accent)" }}>
                      {Math.round(
                        ((viewingUserDetails.appState?.completedSteps?.length ||
                          0) /
                          totalSteps) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${((viewingUserDetails.appState?.completedSteps?.length || 0) / totalSteps) * 100}%`,
                        height: "100%",
                        background: "var(--accent)",
                      }}
                    />
                  </div>
                </div>

                <div
                  className="sa-steps-list"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {ALL_STEPS.map((step) => {
                    const isDone =
                      viewingUserDetails.appState?.completedSteps?.includes(
                        step.id,
                      );
                    return (
                      <div
                        key={step.id}
                        style={{
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          opacity: isDone ? 1 : 0.5,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: isDone
                              ? "var(--green)"
                              : "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            color: "#fff",
                          }}
                        >
                          {isDone ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock size={12} />
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: isDone ? 700 : 400,
                            color: isDone ? "#fff" : "var(--text3)",
                          }}
                        >
                          {state.language === "en"
                            ? step.label_en || step.label
                            : step.label_ar || step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* User Create / Edit Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="sa-modal-overlay">
            <motion.div
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              dir={state.language === "en" ? "ltr" : "rtl"}
              style={{
                maxWidth: 500,
                textAlign: state.language === "en" ? "left" : "right",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="sa-modal-header">
                <h2
                  style={{
                    fontSize: 18,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {editingUser ? (
                    <>
                      <Edit size={20} style={{ color: "var(--green)" }} />
                      <span>
                        {state.language === "en"
                          ? "Edit User Details"
                          : "تعديل بيانات المستخدم"}
                      </span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} style={{ color: "var(--accent)" }} />
                      <span>
                        {state.language === "en"
                          ? "Add New User"
                          : "إضافة مستخدم جديد"}
                      </span>
                    </>
                  )}
                </h2>
                <button className="btn btn-sm" onClick={() => cancelEdit()}>
                  <X size={16} />
                </button>
              </div>

              <div
                className="sa-modal-body"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
              >
                <form className="ad-form-body" onSubmit={handleSubmit}>
                  <div className="ad-form-section">
                    <div className="ad-form-section-title">
                      <Shield size={14} />
                      <span>
                        {state.language === "en"
                          ? "Account Role"
                          : "نوع الحساب"}
                      </span>
                    </div>
                    <div className="ad-role-selector">
                      <div
                        className={`ad-role-option ${userRole === "user" ? "active" : ""}`}
                        onClick={() => setUserRole("user")}
                      >
                        <User
                          size={14}
                          style={{
                            display: "inline",
                            marginRight: state.language === "en" ? 4 : 0,
                            marginLeft: state.language === "en" ? 0 : 4,
                          }}
                        />
                        <span>
                          {state.language === "en"
                            ? "Regular User"
                            : "مستخدم عادي"}
                        </span>
                      </div>
                      <div
                        className={`ad-role-option ${userRole === "admin" ? "active" : ""}`}
                        onClick={() => setUserRole("admin")}
                      >
                        <ShieldCheck
                          size={14}
                          style={{
                            display: "inline",
                            marginRight: state.language === "en" ? 4 : 0,
                            marginLeft: state.language === "en" ? 0 : 4,
                          }}
                        />
                        <span>
                          {state.language === "en" ? "Admin" : "أدمن"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ad-form-divider" />

                  <div className="ad-form-section">
                    <div className="ad-form-section-title">
                      <User size={14} />
                      <span>
                        {state.language === "en"
                          ? "User Info"
                          : "بيانات المستخدم"}
                      </span>
                    </div>
                    <div className="field">
                      <label className="field-label">
                        {state.language === "en" ? "Full Name" : "الاسم"}
                      </label>
                      <input
                        className="field-input"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder={
                          state.language === "en"
                            ? "e.g. John Doe"
                            : "مثال: محمد أحمد"
                        }
                        disabled={creating}
                        dir={state.language === "en" ? "ltr" : "rtl"}
                        style={{
                          textAlign: state.language === "en" ? "left" : "right",
                        }}
                      />
                    </div>
                    <div className="field">
                      <label className="field-label">
                        {state.language === "en"
                          ? "Email Address"
                          : "البريد الإلكتروني"}
                      </label>
                      <input
                        className="field-input"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="user@example.com"
                        dir="ltr"
                        style={{ textAlign: "left" }}
                        disabled={creating || editingUser}
                      />
                      {editingUser && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text3)",
                            marginTop: 4,
                          }}
                        >
                          {state.language === "en"
                            ? "Email cannot be changed"
                            : "لا يمكن تعديل البريد الإلكتروني"}
                        </div>
                      )}
                    </div>
                    {!editingUser && (
                      <div className="field">
                        <label className="field-label">
                          {state.language === "en" ? "Password" : "كلمة المرور"}
                        </label>
                        <input
                          className="field-input"
                          type="text"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder={
                            state.language === "en"
                              ? "Min 6 characters"
                              : "6 أحرف على الأقل"
                          }
                          dir="ltr"
                          style={{ textAlign: "left" }}
                          disabled={creating}
                        />
                      </div>
                    )}

                    {!editingUser && (
                      <div className="field">
                        <label className="field-label">
                          {state.language === "en" ? "Assign Plan" : "تخصيص باقة"}
                        </label>
                        <CustomSelect
                          options={[
                            {
                              value: "free",
                              label: state.language === "en" ? "Free Plan (20 credits)" : "باقة مجانية (20 رصيد)",
                            },
                            ...plans.map((p) => ({
                              value: p.id.toString(),
                              label: (state.language === "en" ? (p.name_en || p.name) : (p.name_ar || p.name)) + " (" + (p.creditsPerMonth || 0) + " " + (state.language === "en" ? "credits" : "رصيد") + ")",
                            }))
                          ]}
                          value={userPlanId}
                          onChange={setUserPlanId}
                          disabled={creating}
                        />
                      </div>
                    )}

                    <div className="field">
                      <label className="field-label">
                        {state.language === "en"
                          ? "User Photo (Optional)"
                          : "صورة المستخدم (اختياري)"}
                      </label>
                      {photoPreview ? (
                        <div
                          className="sa-photo-preview-box"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px dashed var(--accent)",
                            borderRadius: "12px",
                            marginTop: "6px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <img
                              src={photoPreview}
                              alt="User Preview"
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: "10px",
                                objectFit: "cover",
                                border: "1px solid var(--line)",
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#fff",
                                }}
                              >
                                {profileImage
                                  ? profileImage.name
                                  : state.language === "en"
                                    ? "Current Photo"
                                    : "صورة المستخدم الحالية"}
                              </div>
                              <div
                                style={{ fontSize: 10, color: "var(--text3)" }}
                              >
                                {profileImage
                                  ? `${(profileImage.size / 1024).toFixed(1)} KB`
                                  : state.language === "en"
                                    ? "Uploaded"
                                    : "محمّلة مسبقاً"}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            title={
                              state.language === "en"
                                ? "Remove photo"
                                : "حذف الصورة"
                            }
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              color: "var(--red)",
                              borderRadius: "8px",
                              padding: "6px 10px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            <Trash2 size={14} />
                            <span>
                              {state.language === "en" ? "Delete" : "حذف"}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <label
                          className="sa-file-label"
                          style={{
                            minHeight: 75,
                            padding: "12px",
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px dashed var(--line)",
                            borderRadius: "12px",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <input
                            id="userProfileImg"
                            type="file"
                            accept="image/*"
                            className="sa-file-input"
                            onChange={(e) => setProfileImage(e.target.files[0])}
                            disabled={creating}
                          />
                          <UploadCloud
                            size={24}
                            style={{ color: "var(--accent)" }}
                          />
                          <span
                            className="sa-file-text"
                            style={{ fontSize: 11, fontWeight: 600 }}
                          >
                            {state.language === "en"
                              ? "Click to upload photo"
                              : "اضغط لرفع صورة المستخدم"}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="ad-form-divider" />

                    <div className="ad-form-section">
                      <div className="ad-form-section-title">
                        <Sparkles size={14} />
                        <span>
                          {state.language === "en"
                            ? "Subscription Management"
                            : "إدارة الاشتراك"}
                        </span>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <CustomSelect
                          label={state.language === "en" ? "Subscription Type" : "نوع الاشتراك"}
                          value={subType}
                          onChange={(val) => setSubType(val)}
                          icon={Sparkles}
                          options={[
                            {
                              value: "monthly",
                              label: state.language === "en" ? "Monthly" : "شهر",
                              icon: Calendar,
                            },
                            {
                              value: "lifetime",
                              label: state.language === "en" ? "Lifetime" : "دائم",
                              icon: Gem,
                            },
                            {
                              value: "custom",
                              label: state.language === "en" ? "Custom" : "محدد",
                              icon: SlidersHorizontal,
                            },
                            {
                              value: "trial",
                              label: state.language === "en" ? "Trial" : "فترة مجانية",
                              icon: Gift,
                            },
                            {
                              value: "stopped",
                              label: state.language === "en" ? "Stop" : "إيقاف",
                              icon: Ban,
                            }
                          ]}
                        />
                      </div>
                    </div>

                    {subType === "custom" && (
                      <div className="field">
                        <label className="field-label">
                          {state.language === "en"
                            ? "Subscription Days"
                            : "عدد أيام الاشتراك"}
                        </label>
                        <input
                          type="number"
                          className="field-input"
                          value={subDays}
                          onChange={(e) => setSubDays(e.target.value)}
                          disabled={creating}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="submit"
                      className="ad-submit-btn"
                      disabled={creating}
                      style={{
                        flex: 1,
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {creating ? (
                        <>
                          <div className="ad-submit-spinner" />{" "}
                          {state.language === "en"
                            ? "Saving..."
                            : "جاري الحفظ..."}
                        </>
                      ) : editingUser ? (
                        <>
                          <Save size={16} />
                          <span>
                            {state.language === "en"
                              ? "Save Changes"
                              : "حفظ التعديلات"}
                          </span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>
                            {state.language === "en"
                              ? "Create Account"
                              : "إنشاء الحساب"}
                          </span>
                        </>
                      )}
                    </button>
                    {editingUser && (
                      <button
                        type="button"
                        className="ad-submit-btn"
                        onClick={cancelEdit}
                        disabled={creating}
                        style={{
                          flex: 1,
                          margin: 0,
                          background: "var(--bg3)",
                          color: "var(--text)",
                          border: "1px solid var(--line)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <X size={16} />
                        <span>
                          {state.language === "en" ? "Cancel" : "إلغاء"}
                        </span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Plan Create / Edit Modal */}
      <AnimatePresence>
        {isPlanModalOpen && (
          <div
            className="sa-modal-overlay"
            style={{ zIndex: 2000 }}
          >
            <motion.div
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              style={{ maxWidth: 540 }}
              dir={state.language === "en" ? "ltr" : "rtl"}
            >
              <div
                className="sa-modal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 700,
                  }}
                >
                  <Gem size={20} style={{ color: "var(--accent)" }} />
                  <span>
                    {editingPlan
                      ? state.language === "en"
                        ? "Edit Subscription Plan"
                        : "تعديل باقة الاشتراك"
                      : state.language === "en"
                        ? "Add New Subscription Plan"
                        : "إضافة باقة جديدة"}
                  </span>
                </h2>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setIsPlanModalOpen(false)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                className="sa-modal-body"
                style={{
                  maxHeight: "80vh",
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {/* Plan Name (Arabic) */}
                <div className="field">
                  <label
                    className="field-label"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Tag size={14} style={{ color: "var(--accent)" }} />
                    <span>
                      {state.language === "en"
                        ? "Plan Name (Arabic)"
                        : "اسم الباقة (بالعربية)"}
                    </span>
                  </label>
                  <input
                    className="field-input"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder={
                      state.language === "en"
                        ? "e.g. Golden Plan"
                        : "مثال: الباقة الذهبية"
                    }
                    dir={state.language === "en" ? "ltr" : "rtl"}
                    style={{
                      textAlign: state.language === "en" ? "left" : "right",
                    }}
                  />
                </div>

                {/* Plan Name (English) */}
                <div className="field">
                  <label
                    className="field-label"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Tag size={14} style={{ color: "var(--accent)" }} />
                    <span>
                      {state.language === "en"
                        ? "Plan Name (English)"
                        : "اسم الباقة (بالإنجليزية)"}
                    </span>
                  </label>
                  <input
                    className="field-input"
                    value={planNameEn}
                    onChange={(e) => setPlanNameEn(e.target.value)}
                    placeholder="Example: Golden Plan"
                    style={{ textAlign: "left", direction: "ltr" }}
                  />
                </div>

                {/* Price and Currency Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="field">
                    <label
                      className="field-label"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <DollarSign size={14} style={{ color: "var(--green)" }} />
                      <span>
                        {state.language === "en"
                          ? "Monthly Price"
                          : "السعر شهرياً"}
                      </span>
                    </label>
                    <input
                      type="number"
                      className="field-input"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                      placeholder="500"
                      dir="ltr"
                      style={{ textAlign: "left" }}
                    />
                  </div>
                  <div className="field">
                    <label
                      className="field-label"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Sparkles size={14} style={{ color: "var(--accent)" }} />
                      <span>
                        {state.language === "en"
                          ? "Credits/month"
                          : "الرصيد الشهري"}
                      </span>
                    </label>
                    <input
                      type="number"
                      className="field-input"
                      value={planCredits}
                      onChange={(e) => setPlanCredits(e.target.value)}
                      placeholder="20"
                      dir="ltr"
                      style={{ textAlign: "left" }}
                    />
                  </div>
                  <div className="field">
                    <label
                      className="field-label"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Globe size={14} style={{ color: "var(--accent)" }} />
                      <span>
                        {state.language === "en" ? "Currency" : "العملة"}
                      </span>
                    </label>
                    <CustomSelect
                      value={planCurrency}
                      onChange={setPlanCurrency}
                      options={[
                        {
                          value: "EGP",
                          label:
                            state.language === "en"
                              ? "EGP (ج.م)"
                              : "جنيه مصري (EGP)",
                          icon: DollarSign,
                        },
                        {
                          value: "SAR",
                          label:
                            state.language === "en"
                              ? "SAR (ر.س)"
                              : "ريال سعودي (SAR)",
                          icon: DollarSign,
                        },
                        {
                          value: "AED",
                          label:
                            state.language === "en"
                              ? "AED (د.إ)"
                              : "درهم إماراتي (AED)",
                          icon: DollarSign,
                        },
                        {
                          value: "KWD",
                          label:
                            state.language === "en"
                              ? "KWD (د.ك)"
                              : "دينار كويتي (KWD)",
                          icon: DollarSign,
                        },
                        {
                          value: "USD",
                          label:
                            state.language === "en"
                              ? "USD ($)"
                              : "دولار أمريكي (USD)",
                          icon: DollarSign,
                        },
                        {
                          value: "EUR",
                          label:
                            state.language === "en" ? "EUR (€)" : "يورو (EUR)",
                          icon: DollarSign,
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Arabic Dynamic Features */}
                <div className="field" style={{ marginTop: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <label
                      className="field-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        margin: 0,
                      }}
                    >
                      <Sparkles size={14} style={{ color: "var(--green)" }} />
                      <span>
                        {state.language === "en"
                          ? "Arabic Features"
                          : "المميزات (بالعربية)"}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={() =>
                        setDynamicFeaturesAr([...dynamicFeaturesAr, ""])
                      }
                      style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "var(--green)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 6,
                      }}
                    >
                      <Plus size={12} />
                      <span>
                        {state.language === "en" ? "Add Feature" : "إضافة ميزة"}
                      </span>
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {dynamicFeaturesAr.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          className="field-input"
                          value={feat}
                          onChange={(e) => {
                            const next = [...dynamicFeaturesAr];
                            next[idx] = e.target.value;
                            setDynamicFeaturesAr(next);
                          }}
                          placeholder={
                            state.language === "en"
                              ? "e.g. Access to all tools"
                              : "مثال: دخول لكافة الأدوات"
                          }
                          dir={state.language === "en" ? "ltr" : "rtl"}
                          style={{
                            textAlign:
                              state.language === "en" ? "left" : "right",
                            flex: 1,
                          }}
                        />
                        {dynamicFeaturesAr.length > 1 && (
                          <button
                            type="button"
                            className="sa-delete-btn btn-xs"
                            style={{
                              width: 34,
                              height: 34,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                            onClick={() =>
                              setDynamicFeaturesAr(
                                dynamicFeaturesAr.filter((_, i) => i !== idx),
                              )
                            }
                            title={
                              state.language === "en"
                                ? "Delete Feature"
                                : "حذف الميزة"
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* English Dynamic Features */}
                <div className="field" style={{ marginTop: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <label
                      className="field-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        margin: 0,
                      }}
                    >
                      <Sparkles size={14} style={{ color: "var(--accent)" }} />
                      <span>
                        {state.language === "en"
                          ? "English Features"
                          : "المميزات (بالإنجليزية)"}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-xs"
                      onClick={() =>
                        setDynamicFeaturesEn([...dynamicFeaturesEn, ""])
                      }
                      style={{
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "var(--accent)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 6,
                      }}
                    >
                      <Plus size={12} />
                      <span>
                        {state.language === "en" ? "Add Feature" : "إضافة ميزة"}
                      </span>
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {dynamicFeaturesEn.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          className="field-input"
                          value={feat}
                          onChange={(e) => {
                            const next = [...dynamicFeaturesEn];
                            next[idx] = e.target.value;
                            setDynamicFeaturesEn(next);
                          }}
                          placeholder="e.g. Access to all tools"
                          dir="ltr"
                          style={{ textAlign: "left", flex: 1 }}
                        />
                        {dynamicFeaturesEn.length > 1 && (
                          <button
                            type="button"
                            className="sa-delete-btn btn-xs"
                            style={{
                              width: 34,
                              height: 34,
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                            onClick={() =>
                              setDynamicFeaturesEn(
                                dynamicFeaturesEn.filter((_, i) => i !== idx),
                              )
                            }
                            title={
                              state.language === "en"
                                ? "Delete Feature"
                                : "حذف الميزة"
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paddle Price ID (Optional) */}
                <div className="field" style={{ marginTop: 12 }}>
                  <label
                    className="field-label"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Globe size={14} style={{ color: "#00bfff" }} />
                    <span>
                      {state.language === "en"
                        ? "Paddle Price ID (Optional)"
                        : "معرّف السعر في Paddle (اختياري)"}
                    </span>
                  </label>
                  <input
                    className="field-input"
                    value={planPaddlePriceId}
                    onChange={(e) => setPlanPaddlePriceId(e.target.value)}
                    placeholder="pri_01hxxxxxxxxxxxxxxxxxxxxx"
                    style={{ textAlign: "left", direction: "ltr" }}
                  />
                </div>

                {/* Modal Buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    className="ad-submit-btn"
                    style={{
                      flex: 1,
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    onClick={() => {
                      if (!planName || !planPrice) {
                        return toast(
                          state.language === "en"
                            ? "Please fill in all basic fields"
                            : "يرجى ملأ البيانات الأساسية",
                          "error",
                        );
                      }

                      const featArString = dynamicFeaturesAr
                        .filter((f) => f.trim() !== "")
                        .join("\n");
                      const featEnString = dynamicFeaturesEn
                        .filter((f) => f.trim() !== "")
                        .join("\n");

                      let newPlans = [];
                      if (editingPlan) {
                        newPlans = plans.map((p) =>
                          p.id === editingPlan.id
                            ? {
                                ...p,
                                name: planName,
                                name_ar: planName,
                                name_en: planNameEn,
                                price: Number(planPrice),
                                creditsPerMonth: Number(planCredits),
                                currency: planCurrency,
                                features: featArString,
                                features_ar: featArString,
                                features_en: featEnString,
                                paddlePriceId: planPaddlePriceId,
                                stripe_product_id:
                                  editingPlan.stripe_product_id || null,
                                stripe_monthly_price_id:
                                  editingPlan.stripe_monthly_price_id || null,
                                stripe_yearly_price_id:
                                  editingPlan.stripe_yearly_price_id || null,
                              }
                            : p,
                        );
                        setPlans(newPlans);
                        toast(
                          state.language === "en"
                            ?"Plan updated successfully"
                            :"تم تحديث الباقة بنجاح",
                          "success",
                        );
                      } else {
                        newPlans = [
                          ...plans,
                          {
                            id: Date.now(),
                            name: planName,
                            name_ar: planName,
                            name_en: planNameEn,
                            price: Number(planPrice),
                            creditsPerMonth: Number(planCredits),
                            currency: planCurrency,
                            features: featArString,
                            features_ar: featArString,
                            features_en: featEnString,
                            paddlePriceId: planPaddlePriceId,
                          },
                        ];
                        setPlans(newPlans);
                        toast(
                          state.language === "en"
                            ?"Plan added successfully"
                            :"تم إضافة الباقة بنجاح",
                          "success",
                        );
                      }
                      handleUpdateAdminProfile(newPlans);
                      setIsPlanModalOpen(false);
                    }}
                  >
                    <Save size={16} />
                    <span>
                      {editingPlan
                        ? state.language === "en"
                          ? "Update Plan"
                          : "تحديث الباقة"
                        : state.language === "en"
                          ? "Add Plan"
                          : "إضافة الباقة"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="ad-submit-btn"
                    style={{
                      flex: 1,
                      margin: 0,
                      background: "var(--bg3)",
                      color: "var(--text)",
                      border: "1px solid var(--line)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                    onClick={() => setIsPlanModalOpen(false)}
                  >
                    <X size={16} />
                    <span>{state.language === "en" ? "Cancel" : "إلغاء"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Features Preview Modal */}
      <AnimatePresence>
        {viewingPlanFeatures && (
          <div
            className="sa-modal-overlay"
            onClick={() => setViewingPlanFeatures(null)}
            style={{ zIndex: 3000 }}
          >
            <motion.div
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              style={{ maxWidth: 520 }}
              dir={state.language === "en" ? "ltr" : "rtl"}
            >
              <div
                className="sa-modal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 700,
                  }}
                >
                  <Gem size={18} style={{ color: "var(--accent)" }} />
                  <span>
                    {state.language === "en"
                      ? `Features: ${viewingPlanFeatures.name_en || viewingPlanFeatures.name_ar || viewingPlanFeatures.name}`
                      : `مميزات باقة: ${viewingPlanFeatures.name_ar || viewingPlanFeatures.name}`}
                  </span>
                </h2>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setViewingPlanFeatures(null)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <div
                className="sa-modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {/* Arabic Features */}
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--green)",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>
                      {state.language === "en"
                        ? "Arabic Features"
                        : "المميزات بالعربية"}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {viewingPlanFeatures.featArList?.length > 0 ? (
                      viewingPlanFeatures.featArList.map((f, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "10px 14px",
                            background: "rgba(16, 185, 129, 0.05)",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            borderRadius: 8,
                            fontSize: 13,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Sparkles
                            size={14}
                            style={{ color: "var(--green)", flexShrink: 0 }}
                          />
                          <span>{f}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "var(--text3)", fontSize: 12 }}>
                        —
                      </div>
                    )}
                  </div>
                </div>

                {/* English Features */}
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--accent)",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>
                      {state.language === "en"
                        ? "English Features"
                        : "المميزات بالإنجليزية"}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {viewingPlanFeatures.featEnList?.length > 0 ? (
                      viewingPlanFeatures.featEnList.map((f, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "10px 14px",
                            background: "rgba(59, 130, 246, 0.05)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            borderRadius: 8,
                            fontSize: 13,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            direction: "ltr",
                            textAlign: "left",
                          }}
                        >
                          <Sparkles
                            size={14}
                            style={{ color: "var(--accent)", flexShrink: 0 }}
                          />
                          <span>{f}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "var(--text3)", fontSize: 12 }}>
                        —
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Renew / Change Plan Modal */}
      <AnimatePresence>
        {renewPlanUser && (
          <div className="sa-modal-overlay" onClick={() => setRenewPlanUser(null)}>
            <motion.div
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              dir={state.language === "en" ? "ltr" : "rtl"}
              style={{
                maxWidth: 500,
                textAlign: state.language === "en" ? "left" : "right",
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="sa-modal-header">
                <h2
                  style={{
                    fontSize: 18,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <RefreshCw size={20} style={{ color: "#10B981" }} />
                  <span>
                    {state.language === "en"
                      ? "Renew / Change Plan"
                      : "تجديد / تغيير الخطة"}
                  </span>
                </h2>
                <button className="btn btn-sm" onClick={() => setRenewPlanUser(null)}>
                  <X size={16} />
                </button>
              </div>

              <div
                className="sa-modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  padding: "24px",
                }}
              >
                {/* User Info Card */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "14px",
                    border: "1px solid var(--line)",
                  }}
                >
                  <div
                    className="ad-user-avatar"
                    style={
                      renewPlanUser.photoURL
                        ? {
                            background: `url("${renewPlanUser.photoURL}") center/cover no-repeat`,
                            border: "1px solid rgba(255,255,255,0.1)",
                          }
                        : {}
                    }
                  >
                    {!renewPlanUser.photoURL &&
                      (renewPlanUser.ownerName || renewPlanUser.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text1)" }}>
                      {renewPlanUser.ownerName || "\u2014"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                      {renewPlanUser.email}
                    </div>
                  </div>
                </div>

                {/* Current Plan Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "12px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px" }}>
                      {state.language === "en" ? "Current Plan" : "الخطة الحالية"}
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "#10B981" }}>
                      {(() => {
                        const pName = renewPlanUser.planName || "Free";
                        const foundPlan = plans.find(p => p.name === pName || p.name_ar === pName || p.name_en === pName);
                        return state.language === "en"
                          ? (foundPlan?.name_en || foundPlan?.name || pName)
                          : (foundPlan?.name_ar || foundPlan?.name || pName);
                      })()}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "12px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px" }}>
                      {state.language === "en" ? "Remaining Credits" : "الرصيد المتبقي"}
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text1)" }}>
                      {renewPlanUser.credits ?? 0}
                      <span style={{ color: "var(--text3)", fontWeight: "400", fontSize: "12px" }}>
                        {" / "}{renewPlanUser.totalCredits ?? 20}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plan Selector */}
                <div className="field">
                  <label
                    className="field-label"
                    style={{
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    <Layers size={14} style={{ color: "var(--accent)" }} />
                    {state.language === "en" ? "Select New Plan" : "اختر الخطة الجديدة"}
                  </label>
                  <CustomSelect
                    label=""
                    value={renewPlanId}
                    onChange={(val) => setRenewPlanId(val)}
                    icon={Layers}
                    options={[
                      {
                        value: "free",
                        label: state.language === "en" ? "Free Plan (20 credits)" : "خطة مجانية (20 رصيد)",
                        icon: Gift,
                      },
                      ...plans.map((p) => ({
                        value: p.id.toString(),
                        label: (state.language === "en" ? (p.name_en || p.name) : (p.name_ar || p.name)) + " (" + (p.creditsPerMonth || 0) + " " + (state.language === "en" ? "credits" : "رصيد") + ")",
                        icon: Sparkles,
                      })),
                    ]}
                  />
                </div>

                {/* Warning Note */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text3)",
                    padding: "10px 14px",
                    background: "rgba(245, 158, 11, 0.06)",
                    borderRadius: "10px",
                    border: "1px solid rgba(245, 158, 11, 0.15)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    lineHeight: "1.6",
                  }}
                >
                  <AlertTriangle size={16} style={{ color: "#F59E0B", flexShrink: 0, marginTop: "2px" }} />
                  <span>
                    {state.language === "en"
                      ? "This action will immediately reset the user\u2019s credits to the selected plan\u2019s monthly allocation. The user can start using the new credits right away."
                      : "سيتم إعادة تعيين رصيد المستخدم فوراً إلى الحد الشهري للخطة المختارة. يمكن للمستخدم استخدام الرصيد الجديد على الفور."}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    className="btn"
                    onClick={() => setRenewPlanUser(null)}
                    style={{
                      flex: 1,
                      height: "46px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text2)",
                      border: "1px solid var(--line)",
                      cursor: "pointer",
                    }}
                  >
                    <X size={15} />
                    {state.language === "en" ? "Cancel" : "إلغاء"}
                  </button>
                  <button
                    className="btn"
                    onClick={handleRenewPlan}
                    disabled={isRenewing}
                    style={{
                      flex: 2,
                      height: "46px",
                      borderRadius: "12px",
                      fontWeight: "700",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      color: "#fff",
                      border: "none",
                      cursor: isRenewing ? "not-allowed" : "pointer",
                      opacity: isRenewing ? 0.6 : 1,
                      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.25)",
                    }}
                  >
                    {isRenewing ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                    {state.language === "en" ? "Confirm Renewal" : "تأكيد التجديد"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

            {/* Professional Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div
            className="sa-modal-overlay"
            onClick={() => setUserToDelete(null)}
          >
            <motion.div
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 420, padding: 24 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "var(--red)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px auto",
                  }}
                >
                  <AlertTriangle size={28} />
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 8,
                  }}
                >
                  {state.language === "en"
                    ? "Confirm User Deletion"
                    : "تأكيد حذف المستخدم"}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    lineHeight: 1.5,
                  }}
                >
                  {state.language === "en"
                    ? `Are you sure you want to permanently delete user "${userToDelete.ownerName || userToDelete.email}"? This action cannot be undone.`
                    : `هل أنت متأكد من حذف المستخدم "${userToDelete.ownerName || userToDelete.email}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}
                </p>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn"
                  disabled={isDeletingUser}
                  onClick={() => setUserToDelete(null)}
                  style={{
                    flex: 1,
                    background: "var(--bg3)",
                    border: "1px solid var(--line)",
                    color: "var(--text)",
                    padding: "10px",
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  {state.language === "en" ? "Cancel" : "إلغاء"}
                </button>

                <button
                  className="btn"
                  disabled={isDeletingUser}
                  onClick={confirmDeleteUser}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                    border: "none",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {isDeletingUser ? (
                    <div className="ad-submit-spinner" />
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>
                        {state.language === "en" ? "Delete" : "تأكيد الحذف"}
                      </span>
                    </>
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

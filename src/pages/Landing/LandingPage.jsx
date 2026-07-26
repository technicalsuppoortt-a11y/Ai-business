import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { landingTranslations } from "./LandingTranslations";
import MadgicxTemplate from "./MadgicxTemplate";
import VideoShowcaseSection from "../../components/common/VideoShowcaseSection";
import Logo from "../../components/common/Logo";
import BrandedLoader from "../../components/common/BrandedLoader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
  Layers,
  Bot,
  Send,
  Check,
  ChevronDown,
  Play,
  Star,
  Target,
  Laptop,
  Megaphone,
  Cpu,
  RefreshCw,
  Award,
  AlertTriangle,
  TrendingDown,
  Clock,
  XCircle,
  AlertCircle,
  ZapOff,
  DollarSign,
  PieChart,
  BarChart3,
  Sliders,
  MessageSquare,
  Building2,
  Workflow,
  GitBranch,
  Repeat,
  BrainCircuit,
  Headphones,
  PenTool,
  FileText,
  Share2,
  Video,
  Activity,
  Shield,
  Rocket,
  Compass,
  Palette,
  Type,
} from "lucide-react";
import "./Landing.css";

// Typewriter Animated Text Component
function TypewriterText({ text, speed = 70 }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="typewriter-text">
      {displayedText}
      <span className="typewriter-cursor">|</span>
    </span>
  );
}

// Full Headline Letter-by-Letter Typewriter Component
function FullHeroTypewriter({ lang }) {
  const isAr = lang === "ar";
  const line1 = isAr ? "من فكرة إلى" : "From Idea to";
  const line2 = isAr ? "براند ناجح" : "Successful Brand";
  const line3 = isAr ? "بخطوات ذكية" : "with Smart Steps";

  const fullText = `${line1} ${line2} ${line3}`;
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setCharIndex(0);
    const len = fullText.length;
    let i = 0;
    const timer = setInterval(() => {
      if (i <= len) {
        setCharIndex(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 55);
    return () => clearInterval(timer);
  }, [fullText]);

  const len1 = line1.length;
  const len2 = line2.length;

  const char1Count = Math.min(charIndex, len1);
  const char2Count = Math.max(0, Math.min(charIndex - (len1 + 1), len2));
  const char3Count = Math.max(0, charIndex - (len1 + 1 + len2 + 1));

  const text1 = line1.substring(0, char1Count);
  const text2 = line2.substring(0, char2Count);
  const text3 = line3.substring(0, char3Count);

  const cursorOnLine1 = charIndex <= len1;
  const cursorOnLine2 = charIndex > len1 && charIndex <= len1 + 1 + len2;
  const cursorOnLine3 = charIndex > len1 + 1 + len2;

  return (
    <h1 className="lp-hero-title">
      <span className="lp-title-line">
        {isAr ? (
          <>
            {text1.startsWith("من ") ? (
              <>
                من{" "}
                <span className="lp-highlight">
                  {text1.slice(3, Math.min(text1.length, 7))}
                </span>
                {text1.slice(7)}
              </>
            ) : (
              text1
            )}
          </>
        ) : (
          <>
            {text1.startsWith("From ") ? (
              <>
                From{" "}
                <span className="lp-highlight">
                  {text1.slice(5, Math.min(text1.length, 9))}
                </span>
                {text1.slice(9)}
              </>
            ) : (
              text1
            )}
          </>
        )}
        {cursorOnLine1 && <span className="typewriter-cursor">|</span>}
      </span>

      <span className="lp-title-line lp-gradient-text">
        {text2}
        {cursorOnLine2 && <span className="typewriter-cursor">|</span>}
      </span>

      <span className="lp-title-line">
        {text3}
        {cursorOnLine3 && <span className="typewriter-cursor">|</span>}
      </span>
    </h1>
  );
}

// CountUp Animated Number Component
function AnimatedCountUp({ target, duration = 2 }) {
  const [count, setCount] = useState(0);
  const isInfinity = target === "∞";
  const numericTarget = isInfinity
    ? 0
    : parseInt(target.replace(/\D/g, ""), 10) || 0;
  const suffix = isInfinity ? "" : target.replace(/[0-9]/g, "");

  useEffect(() => {
    if (isInfinity) {
      setCount("∞");
      return;
    }
    if (numericTarget === 0) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min(
        (timestamp - startTimestamp) / (duration * 1000),
        1,
      );
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * numericTarget));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [numericTarget, duration, isInfinity]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

const sanitizePhoneForWhatsapp = (phone) => {
  if (!phone) return "201066886844";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11 && clean.startsWith("01")) {
    return "20" + clean.slice(1);
  }
  if (clean.startsWith("00")) {
    return clean.slice(2);
  }
  return clean;
};

/** Normalize a URL to be completely protocol, www, and trailing slash agnostic */
const superNormalizeUrl = (url) => {
  if (!url) return "";
  let cleaned = url.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, ""); // remove http:// or https://
  cleaned = cleaned.replace(/^www\./, ""); // remove www.
  cleaned = cleaned.replace(/\/+$/, ""); // remove trailing slashes
  return cleaned;
};

/** Extract domain/hostname from a URL string, protocol and www agnostic */
const extractDomain = (url) => {
  if (!url) return "";
  try {
    let clean = url.trim().toLowerCase();
    if (!clean.includes("://")) {
      clean = "https://" + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, "");
  } catch (e) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/:]+)/i);
    return match ? match[1].toLowerCase() : url.trim().toLowerCase();
  }
};

/** Generate all possible variations of a given raw URL for Firestore 'in' query matching */
const generateUrlCandidates = (raw) => {
  if (!raw) return [];
  const candidates = new Set();

  const clean = raw.trim().toLowerCase();
  const naked = clean.replace(/^https?:\/\//, "");
  const noWww = naked.replace(/^www\./, "");

  const bases = [naked, noWww, "www." + noWww];

  const versions = [];
  for (const base of bases) {
    if (!base) continue;
    const withoutSlash = base.replace(/\/+$/, "");
    const withSlash = withoutSlash + "/";
    versions.push(withoutSlash, withSlash);
  }

  for (const v of versions) {
    candidates.add(v);
    candidates.add("http://" + v);
    candidates.add("https://" + v);
  }

  // Try to extract host (domain only) candidates
  let host = "";
  try {
    host = new URL(clean.includes("://") ? clean : "https://" + clean).host;
  } catch (e) {}

  if (host) {
    const cleanHost = host.toLowerCase().replace(/^www\./, "");
    const hostBases = [cleanHost, "www." + cleanHost];
    for (const hb of hostBases) {
      candidates.add(hb);
      candidates.add(hb + "/");
      candidates.add("http://" + hb);
      candidates.add("http://" + hb + "/");
      candidates.add("https://" + hb);
      candidates.add("https://" + hb + "/");
    }
  }

  return [...candidates].filter(Boolean);
};

export default function LandingPage() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();
  const toast = useToast();
  const t =
    landingTranslations[state.language || "ar"] || landingTranslations.ar;

  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [brandError, setBrandError] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});
  const togglePlanExpand = (planId) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  // ─── STATE VARIABLES FOR INTERACTIVE WIDGETS ──────────────────────────────
  const [activeNiche, setActiveNiche] = useState("ecommerce");
  const [presetIdx, setPresetIdx] = useState(0);

  const brandPresets = [
    {
      name: "Glamour Deco",
      slogan: state.language === "ar" ? "الفخامة والتصميم العصري" : "Luxury & Modern Design",
      colors: ["#F43F5E", "#8B5CF6", "#3B82F6", "#F59E0B"],
      colorRoles: state.language === "ar" ? ["الرئيسي", "التألق", "السطح", "التمييز"] : ["Primary", "Glow", "Surface", "Accent"],
      font: "Outfit / Inter",
      vibe: state.language === "ar" ? "فاخر · أملس" : "Luxury · Sleek"
    },
    {
      name: "FitPulse AI",
      slogan: state.language === "ar" ? "طاقتك وأداؤك بدون حدود" : "Limitless Energy & Performance",
      colors: ["#10B981", "#06B6D4", "#6366F1", "#F59E0B"],
      colorRoles: state.language === "ar" ? ["النشاط", "المنعش", "العمق", "التحفيز"] : ["Energy", "Fresh", "Depth", "Boost"],
      font: "Plus Jakarta Sans",
      vibe: state.language === "ar" ? "رياضي · ديناميكي" : "Sporty · Dynamic"
    },
    {
      name: "LearnSphere",
      slogan: state.language === "ar" ? "مستقبل التعليم الرقمي التفاعلي" : "The Future of E-Learning",
      colors: ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981"],
      colorRoles: state.language === "ar" ? ["الإبداع", "الحيوية", "الثقة", "النجاح"] : ["Creative", "Vibrant", "Trust", "Success"],
      font: "Inter / Roboto",
      vibe: state.language === "ar" ? "تعليمي · موثوق" : "Educational · Trusted"
    },
    {
      name: "Aroma Arabia",
      slogan: state.language === "ar" ? "أصالة العطور الشرقية بروح حديثة" : "Authentic Eastern Perfumes",
      colors: ["#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"],
      colorRoles: state.language === "ar" ? ["الأصالة", "الملكي", "الجاذبية", "الفخامة"] : ["Heritage", "Royal", "Allure", "Luxury"],
      font: "Amiri / Outfit",
      vibe: state.language === "ar" ? "عربي · راقي" : "Oriental · Premium"
    }
  ];

  const currentBrandPreset = brandPresets[presetIdx % brandPresets.length];

  const handleGenerateIdentity = () => {
    setPresetIdx((prev) => prev + 1);
  };

  const [setupStep, setSetupStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSetupStep((s) => (s + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Live Calculator State
  const [calcPrice, setCalcPrice] = useState(49); // Price per product
  const [calcAdSpend, setCalcAdSpend] = useState(15); // Ad Spend per purchase
  const [calcSalesCount, setCalcSalesCount] = useState(120); // Monthly Sales

  // Computed values
  const calcTotalRevenue = calcPrice * calcSalesCount;
  const calcTotalCosts =
    calcAdSpend * calcSalesCount + calcPrice * 0.15 * calcSalesCount; // Ad spend + 15% Product Cost
  const calcNetProfit = calcTotalRevenue - calcTotalCosts;
  const calcRoas = (calcPrice / (calcAdSpend || 1)).toFixed(1);

  const [factoryCategory, setFactoryCategory] = useState("design");

  const [proposalStep, setProposalStep] = useState(0);
  const proposalTexts =
    state.language === "en"
      ? [
          "Analyzing client requirements for the job...",
          "Client skills and price expectations successfully identified.",
          "A custom financial and technical proposal has been generated...",
        ]
      : [
          "جاري تحليل متطلبات العميل للوظيفة...",
          "تم تحديد مهارات العميل وتوقعات السعر بنجاح.",
          "تم توليد عرض مالي وفني مخصص يتناسب مع متجرك...",
        ];
  useEffect(() => {
    const interval = setInterval(() => {
      setProposalStep((s) => (s + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [chatMessages, setChatMessages] = useState([
    {
      sender: "assistant",
      text: "أهلاً بك! أنا مساعدك الذكي لتأسيس البراند. اختر أي استعلام أدناه لرؤية كيف أعمل بشكل فوري!",
    },
  ]);
  const [chatTyping, setChatTyping] = useState(false);

  useEffect(() => {
    setChatMessages([
      {
        sender: "assistant",
        text:
          state.language === "en"
            ? "Welcome! I am your smart brand assistant. Choose any query below to see how I work instantly!"
            : "أهلاً بك! أنا مساعدك الذكي لتأسيس البراند. اختر أي استعلام أدناه لرؤية كيف أعمل بشكل فوري!",
      },
    ]);
  }, [state.language]);

  const handleChatPreset = (queryText, responseText) => {
    if (chatTyping) return;
    setChatMessages((prev) => [...prev, { sender: "user", text: queryText }]);
    setChatTyping(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "assistant", text: responseText },
      ]);
      setChatTyping(false);
    }, 1200);
  };

  useEffect(() => {
    const cleanSlug = brandSlug
      ? brandSlug.replace(/\/$/, "").split("/").pop()
      : "";
    let alreadyFetched = false; // guard against double invocation

    // ─── STEP 1: Detect parent page URL immediately ────────────────────────────
    // Method A: document.referrer — FULL URL with path (best for path-based matching)
    let immediateParentUrl = null;
    if (document.referrer) {
      immediateParentUrl = document.referrer.replace(/\/+$/, "");
    }

    // Method B: ancestorOrigins — Chrome/Edge only, gives origin only (no path)
    let ancestorOriginOnly = null;
    try {
      if (window.location.ancestorOrigins?.length > 0) {
        ancestorOriginOnly = window.location.ancestorOrigins[0];
      }
    } catch (e) {}

    // ─── fetchBrand — defined FIRST so it can be called from anywhere ─────────
    const fetchBrand = async (parentUrl) => {
      if (alreadyFetched) return;
      alreadyFetched = true;

      try {
        setLoading(true);
        let matchedDoc = null;

        // Parse search query parameters
        const searchParams = new URLSearchParams(location.search);

        // 1. Explicit Brand/Slug from path or query params
        const explicitSlug =
          cleanSlug ||
          searchParams.get("brand") ||
          searchParams.get("slug") ||
          searchParams.get("b") ||
          searchParams.get("brandSlug") ||
          "";

        const slugCandidates = new Set();
        if (explicitSlug) {
          const cleanExp = explicitSlug
            .trim()
            .replace(/\/$/, "")
            .split("/")
            .pop();
          if (cleanExp) {
            slugCandidates.add(cleanExp);
            slugCandidates.add(cleanExp.toLowerCase());
          }
        }

        // 2. Implicit URL sources
        const queryUrl =
          searchParams.get("url") ||
          searchParams.get("site") ||
          searchParams.get("domain");
        const currentUrl = window.location.href;
        const rawUrls = [
          queryUrl,
          currentUrl,
          parentUrl,
          ancestorOriginOnly,
        ].filter(Boolean);

        // Generate comprehensive spelling candidates for Firestore query
        const externalUrls = new Set();
        for (const raw of rawUrls) {
          generateUrlCandidates(raw).forEach((candidate) =>
            externalUrls.add(candidate),
          );
        }

        console.debug("[LandingPage] explicitSlug detected:", explicitSlug);
        console.debug("[LandingPage] slugCandidates:", [...slugCandidates]);
        console.debug("[LandingPage] rawUrls detected:", rawUrls);
        console.debug("[LandingPage] externalUrls candidates:", [
          ...externalUrls,
        ]);

        // ─── STAGE 1: URL/DOMAIN MATCHING (Highest Priority) ───
        if (externalUrls.size > 0) {
          console.debug(
            "[LandingPage] 🎯 Running Stage 1: URL/Domain Matching...",
          );
          const urlArr = [...externalUrls].filter(Boolean);
          const urlBatches = [];
          for (let i = 0; i < urlArr.length; i += 30)
            urlBatches.push(urlArr.slice(i, i + 30));

          let allCandidates = [];

          for (const batch of urlBatches) {
            const snapUrl = await getDocs(
              query(
                collection(db, "users"),
                where("role", "==", "admin"),
                where("brandUrl", "in", batch),
              ),
            );
            if (!snapUrl.empty) {
              allCandidates.push(...snapUrl.docs);
            }
          }

          if (allCandidates.length > 0) {
            const normalizedRaws = rawUrls
              .map((u) => superNormalizeUrl(u))
              .filter(Boolean);

            // Intelligent ranking to solve cross-origin stripped referrers (e.g. upklick.co)
            const rankedDocs = [...allCandidates].sort((a, b) => {
              const aData = a.data();
              const bData = b.data();

              const aUrlNorm = superNormalizeUrl(aData.brandUrl);
              const bUrlNorm = superNormalizeUrl(bData.brandUrl);

              const aHasPlans = aData.plans && aData.plans.length > 0 ? 1 : 0;
              const bHasPlans = bData.plans && bData.plans.length > 0 ? 1 : 0;

              // Priority 1: Match with plans (highly likely to be the correct commercial tenant brand)
              if (aHasPlans !== bHasPlans) {
                return bHasPlans - aHasPlans; // prefer the one with plans
              }

              // Priority 2: More specific URL (longer URL, indicating it's a specific sub-path/brand page rather than a root domain)
              if (aUrlNorm.length !== bUrlNorm.length) {
                return bUrlNorm.length - aUrlNorm.length; // prefer longer, more specific URL
              }

              // Priority 3: Perfect exact normalized match with rawUrls
              let aExactIndex = -1;
              let bExactIndex = -1;
              for (let i = 0; i < normalizedRaws.length; i++) {
                if (aUrlNorm === normalizedRaws[i]) aExactIndex = i;
                if (bUrlNorm === normalizedRaws[i]) bExactIndex = i;
              }
              if (aExactIndex !== -1 && bExactIndex === -1) return -1;
              if (bExactIndex !== -1 && aExactIndex === -1) return 1;
              if (aExactIndex !== -1 && bExactIndex !== -1)
                return aExactIndex - bExactIndex;

              return 0;
            });

            matchedDoc = rankedDocs[0];
            console.debug(
              "[LandingPage] ✅ matched by ranked brandUrl in Stage 1:",
              matchedDoc.data().brandUrl,
            );
          }

          // B. Client-side fallback for Domain/URL Matching (in case domain matches but path differs or exact match failed)
          if (!matchedDoc) {
            console.debug(
              "[LandingPage] 📡 Running Client-Side Fallback for Domain/URL Matching...",
            );
            const allAdminsSnap = await getDocs(
              query(collection(db, "users"), where("role", "==", "admin")),
            );
            if (!allAdminsSnap.empty) {
              const visitorDomains = rawUrls
                .map((url) => extractDomain(url))
                .filter(Boolean);

              if (visitorDomains.length > 0) {
                for (const docSnap of allAdminsSnap.docs) {
                  const adminData = docSnap.data();
                  if (adminData.brandUrl) {
                    const adminDomain = extractDomain(adminData.brandUrl);
                    if (adminDomain && visitorDomains.includes(adminDomain)) {
                      matchedDoc = docSnap;
                      console.debug(
                        "[LandingPage] ✅ matched by domain in Client-Side fallback:",
                        adminData.brandUrl,
                      );
                      break;
                    }
                  }
                }
              }
            }
          }
        }

        // ─── STAGE 2: EXPLICIT SLUG MATCHING (Fallback) ───
        if (!matchedDoc && slugCandidates.size > 0) {
          console.debug(
            "[LandingPage] 📡 Running Stage 2: Explicit Slug Matching...",
          );
          const targets = [...slugCandidates];

          // A. Firestore exact queries
          for (const target of targets) {
            let snap = await getDocs(
              query(
                collection(db, "users"),
                where("role", "==", "admin"),
                where("brandUrl", "==", target),
              ),
            );
            if (snap.empty)
              snap = await getDocs(
                query(
                  collection(db, "users"),
                  where("role", "==", "admin"),
                  where("brandUrl", "==", `/${target}`),
                ),
              );
            if (snap.empty)
              snap = await getDocs(
                query(
                  collection(db, "users"),
                  where("role", "==", "admin"),
                  where("brandName", "==", target),
                ),
              );
            if (snap.empty)
              snap = await getDocs(
                query(
                  collection(db, "users"),
                  where("role", "==", "admin"),
                  where("ownerName", "==", target),
                ),
              );
            if (!snap.empty) {
              matchedDoc = snap.docs[0];
              console.debug(
                "[LandingPage] ✅ matched by explicit slug in Firestore query:",
                target,
              );
              break;
            }
          }

          // B. Client-side comparison matching the slug against trailing path components of Firestore brandUrl
          if (!matchedDoc) {
            console.debug(
              "[LandingPage] 📡 Running Client-Side Fallback for Slug Matching...",
            );
            const allAdminsSnap = await getDocs(
              query(collection(db, "users"), where("role", "==", "admin")),
            );
            if (!allAdminsSnap.empty) {
              for (const docSnap of allAdminsSnap.docs) {
                const adminData = docSnap.data();

                // Extract slug/path from brandUrl
                let brandUrlSlug = "";
                if (adminData.brandUrl) {
                  try {
                    const cleanUrl = adminData.brandUrl.trim().toLowerCase();
                    const urlObj = new URL(
                      cleanUrl.includes("://")
                        ? cleanUrl
                        : "https://" + cleanUrl,
                    );
                    brandUrlSlug = urlObj.pathname
                      .replace(/\/+$/, "")
                      .split("/")
                      .pop();
                  } catch (e) {
                    brandUrlSlug = adminData.brandUrl
                      .replace(/\/+$/, "")
                      .split("/")
                      .pop();
                  }
                  brandUrlSlug = brandUrlSlug
                    ? brandUrlSlug.trim().toLowerCase()
                    : "";
                }

                const dbSlugNormalized = (
                  superNormalizeUrl(adminData.brandName) || ""
                )
                  .trim()
                  .toLowerCase();
                const dbOwnerNormalized = (
                  superNormalizeUrl(adminData.ownerName) || ""
                )
                  .trim()
                  .toLowerCase();

                const isSlugMatch = targets.some((target) => {
                  const t = target.trim().toLowerCase();
                  return (
                    t &&
                    (t === brandUrlSlug ||
                      t === dbSlugNormalized ||
                      t === dbOwnerNormalized)
                  );
                });

                if (isSlugMatch) {
                  matchedDoc = docSnap;
                  console.debug(
                    "[LandingPage] ✅ matched by slug in Client-Side fallback:",
                    adminData.brandName,
                  );
                  break;
                }
              }
            }
          }
        }

        if (matchedDoc) {
          const data = matchedDoc.data();
          setBrandData(data);
          if (data.plans && data.plans.length > 0) setPlans(data.plans);
          if (data.themeConfig) {
            const { accent, bg, sidebar } = data.themeConfig;
            if (accent)
              document.documentElement.style.setProperty("--accent", accent);
            if (bg)
              document.documentElement.style.setProperty(
                "--green",
                data.themeConfig.success || "#10B981",
              );
            if (bg) document.documentElement.style.setProperty("--bg", bg);
            if (sidebar)
              document.documentElement.style.setProperty("--bg2", sidebar);
          }

          if (data.brandName) {
            document.title = data.brandName;
          }
          if (data.defaultLanguage) {
            dispatch({ type: "SET_LANGUAGE", payload: data.defaultLanguage });
          }
          const brandLogo = data.logoUrl || data.logo;
          if (brandLogo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.head.appendChild(link);
            }
            link.href = brandLogo;
          }

          setBrandError(null);
        } else {
          console.debug(
            "[LandingPage] ⚠️ No matching brand found. Fallback disabled.",
          );
          setBrandData(null);
          setPlans([]);
          setBrandError(
            "لم يتم العثور على أي براند مطابق للرابط الحالي أو معرّف البراند.",
          );
        }
      } catch (err) {
        console.error("[LandingPage] Error:", err);
      } finally {
        setLoading(false);
      }
    };

    // ─── STEP 2: Try postMessage first (most reliable with companion script) ───
    let fetchTimeout = null;

    const handleMessage = (event) => {
      if (event.data?.type === "PARENT_URL" && event.data?.url) {
        console.debug("[LandingPage] postMessage received:", event.data.url);
        clearTimeout(fetchTimeout);
        fetchBrand(event.data.url); // fetchBrand is already defined above ✅
      }
    };

    window.addEventListener("message", handleMessage);

    // Ask the parent frame for its URL
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "REQUEST_PARENT_URL" }, "*");
      }
    } catch (e) {}

    // Wait 800ms for postMessage, then fall back to referrer/ancestorOrigins
    fetchTimeout = setTimeout(() => {
      fetchBrand(immediateParentUrl); // will no-op if already fetched via postMessage
    }, 800);

    // ─── HARD FAILSAFE: Force hide loading after 6 seconds no matter what ──────
    // This prevents the loading overlay from blocking the page indefinitely
    const hardFailsafe = setTimeout(() => {
      setLoading(false);
    }, 6000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(fetchTimeout);
      clearTimeout(hardFailsafe);
    };
  }, [brandSlug, location.search]);

  const goAuth = () =>
    navigate("/auth", { state: { resolvedBrand: brandData } });

  if (!loading && brandData?.landingTemplate === "madgicx") {
    return (
      <MadgicxTemplate
        brandData={brandData}
        plans={plans}
        goAuth={goAuth}
        state={state}
        t={t}
      />
    );
  }

  return (
    <div className="landing-page" dir={state.language === "ar" ? "rtl" : "ltr"}>
      {/* Loading Overlay */}
      {loading && (
        <BrandedLoader
          message={
            state.language === "en"
              ? "Loading workspace..."
              : "جاري تحميل مساحة العمل..."
          }
          lang={state.language || "ar"}
        />
      )}

      {/* Animated Digital Tech BG */}
      <div className="lp-bg">
        <div className="lp-digital-bg" />
        <div className="lp-orb lp-orb1" />
        <div className="lp-orb lp-orb2" />
        <div className="lp-orb lp-orb3" />
        <div className="lp-grid" />
      </div>

      {/* Nav */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            {(() => {
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <img
                      src={
                        brandData.logoUrl ||
                        brandData.logo ||
                        brandData.photoURL
                      }
                      alt="Brand Logo"
                      className="lp-logo-img"
                      style={{
                        maxHeight: "38px",
                        maxWidth: "160px",
                        width: "auto",
                        objectFit: "contain",
                        borderRadius: "4px",
                      }}
                    />
                    {showText && (
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "var(--text, #FFF)",
                        }}
                      >
                        {brandData?.brandName}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <Logo
                  size={32}
                  showText={showText}
                  lang={state.language || "ar"}
                  text={brandData?.brandName}
                />
              );
            })()}
          </div>
          <div className="lp-nav-actions">
            <button
              className="lp-lang-btn"
              onClick={() => {
                const nextLang = state.language === "ar" ? "en" : "ar";
                dispatch({ type: "SET_LANGUAGE", payload: nextLang });
              }}
            >
              <Globe size={16} />
              <span>{state.language === "ar" ? "English" : "العربية"}</span>
            </button>
            <button className="btn" onClick={goAuth}>
              {t.nav.login}
            </button>
            <button className="btn btn-primary" onClick={goAuth}>
              {t.nav.startFree}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="lp-hero"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-hero-grid">
          {/* Left Column: Hero Content */}
          <div
            className="lp-hero-content"
            style={{
              textAlign: state.language === "ar" ? "right" : "left",
              direction: state.language === "ar" ? "rtl" : "ltr",
            }}
          >
            <motion.div
              className="lp-hero-badge"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="lp-badge-dot" />
              <Sparkles size={14} style={{ color: "var(--accent)" }} />
              <span>{t.hero.badge}</span>
            </motion.div>

            {/* Letter-by-Letter Typewriter Headline */}
            <FullHeroTypewriter lang={state.language} />

            <motion.p
              className="lp-hero-sub"
              style={{ margin: "0 0 32px 0" }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t.hero.subtitle.split("\n").map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < t.hero.subtitle.split("\n").length - 1 && <br />}
                </span>
              ))}
            </motion.p>

            <motion.div
              className="lp-hero-actions"
              style={{
                justifyContent:
                  state.language === "ar" ? "flex-start" : "flex-start",
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.button
                className="lp-cta-main lp-cta-glow-btn"
                onClick={goAuth}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{t.hero.cta}</span>
                {state.language === "ar" ? (
                  <ArrowLeft size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
              </motion.button>
              <motion.button
                className="btn btn-secondary btn-lg"
                onClick={goAuth}
                style={{ padding: "16px 28px", fontSize: 15, borderRadius: 14 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {t.nav.login}
              </motion.button>
            </motion.div>

            {/* Professional Hero Stats Cards with CountUp */}
            <motion.div
              className="lp-hero-stats-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="lp-hero-stat-card"
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="stat-card-icon blue">
                  <Zap size={20} />
                </div>
                <div className="stat-card-content">
                  <div className="lp-stat-num">
                    <AnimatedCountUp target={t.hero.stat1Num} />
                  </div>
                  <div className="lp-stat-lbl">{t.hero.stat1Label}</div>
                </div>
              </motion.div>

              <motion.div
                className="lp-hero-stat-card"
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="stat-card-icon purple">
                  <Target size={20} />
                </div>
                <div className="stat-card-content">
                  <div className="lp-stat-num purple">
                    <AnimatedCountUp target={t.hero.stat2Num} />
                  </div>
                  <div className="lp-stat-lbl">{t.hero.stat2Label}</div>
                </div>
              </motion.div>

              <motion.div
                className="lp-hero-stat-card"
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="stat-card-icon green">
                  <Sparkles size={20} />
                </div>
                <div className="stat-card-content">
                  <div className="lp-stat-num green">
                    <AnimatedCountUp target={t.hero.stat3Num} />
                  </div>
                  <div className="lp-stat-lbl">{t.hero.stat3Label}</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Floating Glassmorphic Product Canvas */}
          <div className="lp-hero-visual">
            <motion.div
              className="lp-hero-product-preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="preview-topbar">
                <div className="preview-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="preview-title">
                  <Bot size={14} style={{ color: "var(--accent)" }} />
                  <span>AI Brand Vision OS</span>
                </div>
                <div className="preview-status-pill">
                  <Activity size={12} className="pulse-icon" />
                  <span>SYSTEM READY</span>
                </div>
              </div>

              <div className="preview-body">
                {/* Metrics Bar inside Mockup */}
                <div className="preview-metrics-row">
                  <div className="preview-metric-box">
                    <div className="metric-icon blue">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <div className="metric-val">+125%</div>
                      <div className="metric-lbl">
                        {state.language === "ar" ? "معدل النمو" : "Growth Rate"}
                      </div>
                    </div>
                  </div>
                  <div className="preview-metric-box">
                    <div className="metric-icon green">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div className="metric-val">99.8%</div>
                      <div className="metric-lbl">
                        {state.language === "ar"
                          ? "دقة الذكاء الاصطناعي"
                          : "AI Precision"}
                      </div>
                    </div>
                  </div>
                  <div className="preview-metric-box">
                    <div className="metric-icon purple">
                      <Zap size={16} />
                    </div>
                    <div>
                      <div className="metric-val">3.2s</div>
                      <div className="metric-lbl">
                        {state.language === "ar" ? "سرعة التجهيز" : "Gen Speed"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Co-pilot Prompt Animation Box */}
                <div
                  className="preview-prompt-box"
                  style={{
                    direction: state.language === "ar" ? "rtl" : "ltr",
                    textAlign: state.language === "ar" ? "right" : "left",
                  }}
                >
                  <div className="prompt-header">
                    <Sparkles size={14} style={{ color: "var(--accent)" }} />
                    <span>
                      {state.language === "ar"
                        ? "مساعد التخطيط الاستراتيجي"
                        : "Strategic AI Co-Pilot"}
                    </span>
                  </div>
                  <div className="prompt-text">
                    "
                    {state.language === "ar"
                      ? "إنشاء هوية بصرية كاملة + حملة إعلانية مميزة لمشروعي الجديد..."
                      : "Generate full visual identity + high ROAS ad campaign for my brand..."}
                    "
                  </div>
                  <div className="prompt-progress-bar">
                    <motion.div
                      className="prompt-progress-fill"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating Micro-Cards */}
              <motion.div
                className="lp-hero-float-card card-1"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="float-card-icon green">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="float-card-title">
                    {state.language === "ar"
                      ? "تم معالجة الهوية ✅"
                      : "AI Processing Complete ✅"}
                  </div>
                  <div className="float-card-sub">
                    {state.language === "ar"
                      ? "جاهز للتنزيل بنقرة"
                      : "100% Ready to Deploy"}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="lp-hero-float-card card-2"
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="float-card-icon blue">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="float-card-title">
                    {state.language === "ar"
                      ? "الأرباح +125% 📈"
                      : "Revenue +125% 📈"}
                  </div>
                  <div className="float-card-sub">
                    {state.language === "ar"
                      ? "نمو أسبوعي مستمر"
                      : "Consistent Weekly Growth"}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="lp-hero-float-card card-3"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="float-card-icon amber">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="float-card-title">
                    {state.language === "ar"
                      ? "أتمتة ذكية متفاعلة ⚡"
                      : "Live AI Automation ⚡"}
                  </div>
                  <div className="float-card-sub">
                    {state.language === "ar"
                      ? "تشغيل تلقائي 24/7"
                      : "Running 24/7 Autopilot"}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Problem Section: Why Do Most Brands Fail? */}
      <motion.section
        className="lp-section lp-problem-sec"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="lp-section-tag lp-tag-red">
            <AlertCircle
              size={12}
              style={{ display: "inline", marginInlineEnd: 6 }}
            />
            {t.problem.tag}
          </div>
          <h2 className="lp-section-title">{t.problem.title}</h2>
          <div className="lp-problems-grid">
            {t.problem.cards.map((p, i) => {
              const ProblemIcon =
                [AlertTriangle, TrendingDown, Clock, ZapOff][i % 4] ||
                AlertTriangle;
              return (
                <motion.div
                  className="lp-problem-card"
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div
                    className="lp-problem-icon-wrap"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: "rgba(239, 68, 68, 0.12)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      color: "#EF4444",
                    }}
                  >
                    <ProblemIcon size={22} />
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="lp-solution-arrow">
            <div className="lp-arrow-line" />
            <div className="lp-arrow-label">
              <Sparkles
                size={14}
                style={{
                  display: "inline",
                  marginInlineEnd: 6,
                  color: "var(--accent)",
                }}
              />
              {t.problem.arrow.replace(
                "AI Brand Vision",
                brandData?.brandName || "AI Brand Vision",
              )}
            </div>
            <div className="lp-arrow-line" />
          </div>
        </div>
      </motion.section>

      {/* ─── VIDEO SHOWCASE DEMO SECTION ─────────────────────────────────── */}
      <VideoShowcaseSection isArabic={state.language === "ar"} />

      {/* ─── 9 PREMIUM INTERACTIVE SHOWCASE SECTIONS ────────────────────────── */}

      {/* SECTION 1: رادار النيش الذكي */}
      <motion.section
        className="lp-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">{t.section1.tag}</div>
              <h2 className="lp-section-title">{t.section1.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section1.desc}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{ color: "var(--accent)", flexShrink: 0 }}
                  />{" "}
                  {t.section1.bullet1}
                </li>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{ color: "var(--accent)", flexShrink: 0 }}
                  />{" "}
                  {t.section1.bullet2}
                </li>
              </ul>
            </div>

            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "#fff",
                  textAlign: state.language === "ar" ? "right" : "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Target size={16} style={{ color: "var(--accent)" }} />
                <span>{t.section1.liveRadar}</span>
              </div>
              <div className="niche-radar-options">
                {[
                  {
                    id: "ecommerce",
                    label: t.section1.niches.ecommerce,
                    score: "94%",
                    demand: t.section1.veryHigh,
                  },
                  {
                    id: "saas",
                    label: t.section1.niches.saas,
                    score: "89%",
                    demand: t.section1.high,
                  },
                  {
                    id: "fitness",
                    label: t.section1.niches.fitness,
                    score: "82%",
                    demand: t.section1.medium,
                  },
                ].map((n) => (
                  <div
                    className={`niche-radar-item ${activeNiche === n.id ? "active" : ""}`}
                    key={n.id}
                    onClick={() => setActiveNiche(n.id)}
                    style={{
                      direction: state.language === "ar" ? "rtl" : "ltr",
                    }}
                  >
                    <div
                      className="niche-radar-badge"
                      style={{
                        marginRight: state.language === "ar" ? "auto" : "0",
                        marginLeft: state.language === "ar" ? "0" : "auto",
                      }}
                    >
                      {n.score} {t.section1.success}
                    </div>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}
                    >
                      {n.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="radar-stat-box">
                <div>
                  <div className="radar-stat-num">
                    {activeNiche === "ecommerce"
                      ? "12%"
                      : activeNiche === "saas"
                        ? "8%"
                        : "18%"}
                  </div>
                  <div className="radar-stat-lbl">{t.section1.compRate}</div>
                </div>
                <div style={{ width: 1, background: "var(--line)" }} />
                <div>
                  <div
                    className="radar-stat-num"
                    style={{ color: "var(--green)" }}
                  >
                    {activeNiche === "ecommerce"
                      ? t.section1.veryHigh
                      : activeNiche === "saas"
                        ? t.section1.high
                        : t.section1.medium}
                  </div>
                  <div className="radar-stat-lbl">{t.section1.demandVol}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 2: استوديو الهوية البصرية والأسماء */}
      <motion.section
        className="lp-section"
        style={{ background: "rgba(255,255,255,0.01)" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid">
            {/* Left Column: Info & Feature Bullets */}
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">
                <Palette size={14} style={{ display: "inline", marginInlineEnd: 6 }} />
                {t.section2.tag}
              </div>
              <h2 className="lp-section-title">{t.section2.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section2.desc}
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0" }}>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{ color: "var(--accent)", flexShrink: 0 }}
                  />
                  <span>
                    {state.language === "ar"
                      ? "توليد أسماء تجارية مبتكرة في ثوانٍ بالذكاء الاصطناعي"
                      : "AI-Powered Unique Brand Name Generator"}
                  </span>
                </li>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  <Palette
                    size={16}
                    style={{ color: "#8B5CF6", flexShrink: 0 }}
                  />
                  <span>
                    {state.language === "ar"
                      ? "تناسق ألوان سيكولوجي متوافق مع الفئة المستهدفة"
                      : "Harmonious Visual Identity & Psychological Palettes"}
                  </span>
                </li>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  <Type
                    size={16}
                    style={{ color: "#10B981", flexShrink: 0 }}
                  />
                  <span>
                    {state.language === "ar"
                      ? "توصيات الخطوط والطابع البصري لترسيخ علاماتك التجارية"
                      : "Typography & Brand Personality Guidelines"}
                  </span>
                </li>
              </ul>

              <motion.button
                className="lp-cta-main lp-cta-glow-btn"
                onClick={handleGenerateIdentity}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                style={{ padding: "14px 28px", fontSize: 14 }}
              >
                <RefreshCw size={16} />
                <span>{t.section2.cta}</span>
              </motion.button>
            </div>

            {/* Right Column: Advanced Interactive Brand Studio Canvas */}
            <div className="tool-interactive-stage">
              <div
                className="glow-overlay-orb"
                style={{
                  background:
                    "radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)",
                }}
              />
              <div className="brand-studio-card">
                {/* Studio Topbar */}
                <div className="preview-topbar">
                  <div className="preview-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <div className="preview-title">
                    <Sparkles size={14} style={{ color: "#8B5CF6" }} />
                    <span>BRAND_STUDIO_AI_v3.0</span>
                  </div>
                  <div className="preview-status-pill">
                    <span className="pulse-icon">⚡</span>
                    <span>AI READY</span>
                  </div>
                </div>

                {/* Brand Identity Main Showcase Card */}
                <div className="brand-identity-body">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentBrandPreset.name}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="brand-showcase-box"
                      style={{
                        borderTop: `3px solid ${currentBrandPreset.colors[0]}`,
                      }}
                    >
                      <div className="brand-emblem-wrapper">
                        <div
                          className="brand-emblem-badge"
                          style={{
                            background: `linear-gradient(135deg, ${currentBrandPreset.colors[0]}, ${currentBrandPreset.colors[1]})`,
                            boxShadow: `0 8px 24px ${currentBrandPreset.colors[0]}40`,
                          }}
                        >
                          <Sparkles size={22} style={{ color: "#FFF" }} />
                        </div>
                      </div>

                      <div className="brand-title-text">{currentBrandPreset.name}</div>
                      <div className="brand-slogan-text">{currentBrandPreset.slogan}</div>

                      {/* Brand Typography & Vibe Bar */}
                      <div className="brand-meta-pills">
                        <span className="meta-pill">
                          <Type size={12} /> {currentBrandPreset.font}
                        </span>
                        <span className="meta-pill">
                          <Layers size={12} /> {currentBrandPreset.vibe}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Interactive Color Swatch Grid */}
                  <div className="palette-header-row">
                    <Palette size={14} style={{ color: "#8B5CF6" }} />
                    <span>{t.section2.paletteTitle}</span>
                  </div>

                  <div className="identity-color-swatch-grid">
                    {currentBrandPreset.colors.map((color, i) => (
                      <motion.div
                        className="color-swatch-card"
                        key={color + i}
                        whileHover={{ y: -3, scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="swatch-color-box"
                          style={{
                            background: color,
                            boxShadow: `0 4px 14px ${color}35`,
                          }}
                        />
                        <div className="swatch-meta">
                          <span className="swatch-role">
                            {currentBrandPreset.colorRoles[i]}
                          </span>
                          <span className="swatch-hex">{color}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: هندسة بناء المواقع */}
      <motion.section
        className="lp-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">{t.section3.tag}</div>
              <h2 className="lp-section-title">{t.section3.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section3.desc}
              </p>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>
                {t.section3.note}
              </div>
            </div>

            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "#fff",
                  textAlign: state.language === "ar" ? "right" : "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Laptop size={16} style={{ color: "var(--accent)" }} />
                <span>{t.section3.liveStatus}</span>
              </div>
              <div className="setup-builder-mock">
                {[
                  { label: t.section3.steps[0], idx: 0 },
                  { label: t.section3.steps[1], idx: 1 },
                  { label: t.section3.steps[2], idx: 2 },
                ].map((step) => (
                  <div
                    className={`setup-step-row ${setupStep === step.idx ? "active" : ""}`}
                    key={step.idx}
                    style={{
                      direction: state.language === "ar" ? "rtl" : "ltr",
                    }}
                  >
                    <div className="setup-step-num">{step.idx + 1}</div>
                    <div className="setup-step-label">{step.label}</div>
                  </div>
                ))}
                <div
                  className="setup-live-preview"
                  style={{
                    textAlign: state.language === "ar" ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      color: "var(--accent)",
                      fontWeight: 800,
                      marginBottom: 4,
                    }}
                  >
                    {setupStep === 0
                      ? t.section3.statusHosting
                      : setupStep === 1
                        ? t.section3.statusCss
                        : t.section3.statusReady}
                  </div>
                  <div style={{ color: "var(--text3)", fontSize: 10 }}>
                    {setupStep === 0
                      ? "STATUS: RESOLVING DNS"
                      : setupStep === 1
                        ? "STATUS: INJECTING TAILORED STYLES"
                        : "STATUS: SYSTEM READY & ONLINE"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 4: الحاسبة التفاعلية للأرباح */}
      <motion.section
        className="lp-section"
        style={{ background: "rgba(255,255,255,0.01)" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid">
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">{t.section4.tag}</div>
              <h2 className="lp-section-title">{t.section4.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section4.desc}
              </p>
              <div
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  padding: "12px 18px",
                  borderRadius: 12,
                  color: "var(--green)",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{t.section4.note}</span>
              </div>
            </div>

            <div className="tool-interactive-stage">
              <div
                className="glow-overlay-orb"
                style={{
                  background:
                    "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)",
                }}
              />
              <div className="calc-widget">
                <div className="calc-metric-display">
                  <div className="calc-metric-val">
                    ${calcNetProfit.toLocaleString()}
                  </div>
                  <div className="calc-metric-lbl">{t.section4.netProfit}</div>
                </div>
                <div className="calc-slider-group">
                  <div className="calc-slider-row">
                    <div
                      className="calc-slider-header"
                      style={{
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span className="calc-slider-val">${calcPrice}</span>
                      <span>{t.section4.sellPrice}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(Number(e.target.value))}
                      className="calc-input-slider"
                    />
                  </div>
                  <div className="calc-slider-row">
                    <div
                      className="calc-slider-header"
                      style={{
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span className="calc-slider-val">${calcAdSpend}</span>
                      <span>{t.section4.adSpend}</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={calcAdSpend}
                      onChange={(e) => setCalcAdSpend(Number(e.target.value))}
                      className="calc-input-slider"
                    />
                  </div>
                  <div className="calc-slider-row">
                    <div
                      className="calc-slider-header"
                      style={{
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span className="calc-slider-val">
                        {calcSalesCount} {t.section4.salesLabel}
                      </span>
                      <span>{t.section4.salesCount}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      value={calcSalesCount}
                      onChange={(e) =>
                        setCalcSalesCount(Number(e.target.value))
                      }
                      className="calc-input-slider"
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 20,
                    fontSize: 12,
                    borderTop: "1px solid var(--line)",
                    paddingTop: 14,
                    flexDirection:
                      state.language === "ar" ? "row" : "row-reverse",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--accent)", fontWeight: 800 }}>
                      {calcRoas}x
                    </span>
                    <span
                      style={{
                        color: "var(--text3)",
                        marginRight: state.language === "ar" ? 6 : 0,
                        marginLeft: state.language === "ar" ? 0 : 6,
                      }}
                    >
                      {t.section4.roas}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#fff", fontWeight: 800 }}>
                      ${calcTotalRevenue}
                    </span>
                    <span
                      style={{
                        color: "var(--text3)",
                        marginRight: state.language === "ar" ? 6 : 0,
                        marginLeft: state.language === "ar" ? 0 : 6,
                      }}
                    >
                      {t.section4.totalRevenue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 5: مصنع المحتوى الذكي */}
      <motion.section
        className="lp-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">
                <Megaphone
                  size={14}
                  style={{ display: "inline", marginInlineEnd: 6 }}
                />
                {t.section5.tag}
              </div>
              <h2 className="lp-section-title">{t.section5.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section5.desc}
              </p>
              <div className="factory-tabs">
                {[
                  { id: "design", icon: PenTool },
                  { id: "ads", icon: Video },
                  { id: "writing", icon: FileText },
                ].map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <button
                      className={`factory-tab-btn ${factoryCategory === cat.id ? "active" : ""}`}
                      onClick={() => setFactoryCategory(cat.id)}
                      key={cat.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <IconComp size={14} />
                      <span>{t.section5.tabs[cat.id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontStyle: "normal",
                  marginBottom: 16,
                  color: "#fff",
                  textAlign: state.language === "ar" ? "right" : "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Share2 size={16} style={{ color: "var(--accent)" }} />
                <span>{t.section5.liveTemplates}</span>
              </div>
              <div className="factory-preview-cards">
                {factoryCategory === "design" ? (
                  <>
                    <div
                      className="factory-mock-card"
                      style={{
                        textAlign: state.language === "ar" ? "right" : "left",
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span
                        className="factory-mock-tag"
                        style={{
                          alignSelf:
                            state.language === "ar" ? "flex-start" : "flex-end",
                        }}
                      >
                        POST TEMPLATE
                      </span>
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          margin: "8px 0",
                        }}
                      >
                        {state.language === "en"
                          ? "Coaching & Fitness: How to Start Your Day with the Perfect Protein"
                          : "كوتشينج ورشاقة: كيف تبدأ يومك ببروتين مثالي"}
                      </div>
                      <div style={{ color: "var(--text3)", fontSize: 9 }}>
                        {state.language === "en"
                          ? "Dimensions 1080x1080 · Ready to Download"
                          : "أبعاد 1080x1080 · جاهز للتنزيل"}
                      </div>
                    </div>
                    <div
                      className="factory-mock-card"
                      style={{
                        textAlign: state.language === "ar" ? "right" : "left",
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span
                        className="factory-mock-tag"
                        style={{
                          background: "rgba(16,185,129,0.1)",
                          color: "var(--green)",
                          alignSelf:
                            state.language === "ar" ? "flex-start" : "flex-end",
                        }}
                      >
                        STORY
                      </span>
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          margin: "8px 0",
                        }}
                      >
                        {state.language === "en"
                          ? "This Week's Loyal Customer Reviews"
                          : "تقييمات عملائنا الأوفياء لهذا الأسبوع"}
                      </div>
                      <div style={{ color: "var(--text3)", fontSize: 9 }}>
                        {state.language === "en"
                          ? "Dimensions 1080x1920 · Ready to Download"
                          : "أبعاد 1080x1920 · جاهز للتنزيل"}
                      </div>
                    </div>
                  </>
                ) : factoryCategory === "ads" ? (
                  <>
                    <div
                      className="factory-mock-card"
                      style={{
                        textAlign: state.language === "ar" ? "right" : "left",
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span
                        className="factory-mock-tag"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          color: "var(--accent2)",
                          alignSelf:
                            state.language === "ar" ? "flex-start" : "flex-end",
                        }}
                      >
                        Tiktok/Reels Hook
                      </span>
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          margin: "8px 0",
                        }}
                      >
                        {state.language === "en"
                          ? '"3 Common Mistakes That Destroy Your Ad Budget!"'
                          : '"3 أخطاء شائعة تدمر ميزانيتك الإعلانية!"'}
                      </div>
                      <div style={{ color: "var(--text3)", fontSize: 9 }}>
                        {state.language === "en"
                          ? "Short Video Script Ideas"
                          : "أفكار سكريبت فيديو قصيرة"}
                      </div>
                    </div>
                    <div
                      className="factory-mock-card"
                      style={{
                        textAlign: state.language === "ar" ? "right" : "left",
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span
                        className="factory-mock-tag"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "var(--red)",
                          alignSelf:
                            state.language === "ar" ? "flex-start" : "flex-end",
                        }}
                      >
                        UGC Concept
                      </span>
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          margin: "8px 0",
                        }}
                      >
                        {state.language === "en"
                          ? "Genuine digital product review and how it changed our business"
                          : "ريفيو حقيقي لمنتج رقمي وكيف غير عملنا"}
                      </div>
                      <div style={{ color: "var(--text3)", fontSize: 9 }}>
                        {state.language === "en"
                          ? "Original content shooting scenario"
                          : "سيناريو تصوير محتوى أصلي"}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="factory-mock-card"
                      style={{
                        textAlign: state.language === "ar" ? "right" : "left",
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span
                        className="factory-mock-tag"
                        style={{
                          alignSelf:
                            state.language === "ar" ? "flex-start" : "flex-end",
                        }}
                      >
                        Ad Copy
                      </span>
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          margin: "8px 0",
                        }}
                      >
                        {state.language === "en"
                          ? '"Goodbye to random design. Get your visual identity with high efficiency..."'
                          : '"وداعاً للتصميم العشوائي. احصل على هويتك البصرية بكفاءة عالية..."'}
                      </div>
                      <div style={{ color: "var(--text3)", fontSize: 9 }}>
                        {state.language === "en"
                          ? "AIDA Marketing Formula"
                          : "صيغة AIDA التسويقية"}
                      </div>
                    </div>
                    <div
                      className="factory-mock-card"
                      style={{
                        textAlign: state.language === "ar" ? "right" : "left",
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <span
                        className="factory-mock-tag"
                        style={{
                          alignSelf:
                            state.language === "ar" ? "flex-start" : "flex-end",
                        }}
                      >
                        E-mail newsletter
                      </span>
                      <div
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          margin: "8px 0",
                        }}
                      >
                        {state.language === "en"
                          ? '"Your complete plan for digital transformation and establishing freelance work for 2026..."'
                          : '"خطتك الكاملة للتحول الرقمي وتأسيس العمل الحر لعام 2026..."'}
                      </div>
                      <div style={{ color: "var(--text3)", fontSize: 9 }}>
                        {state.language === "en"
                          ? "Interactive Newsletter Template"
                          : "قالب نشرة بريدية تفاعلية"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 6: قناص المقترحات */}
      <motion.section
        className="lp-section"
        style={{ background: "rgba(255,255,255,0.01)" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid">
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">{t.section6.tag}</div>
              <h2 className="lp-section-title">{t.section6.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section6.desc}
              </p>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>
                {t.section6.note}
              </div>
            </div>

            <div className="tool-interactive-stage">
              <div
                className="glow-overlay-orb"
                style={{
                  background:
                    "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
                }}
              />
              <div className="proposal-console-mock">
                <div
                  className="proposal-console-header"
                  style={{
                    flexDirection:
                      state.language === "ar" ? "row" : "row-reverse",
                  }}
                >
                  <div
                    className="console-dot"
                    style={{ background: "#ef4444" }}
                  />
                  <div
                    className="console-dot"
                    style={{ background: "#f59e0b" }}
                  />
                  <div
                    className="console-dot"
                    style={{ background: "#10b981" }}
                  />
                  <span
                    style={{
                      marginRight: state.language === "ar" ? "auto" : "0",
                      marginLeft: state.language === "ar" ? "0" : "auto",
                      color: "var(--text3)",
                      fontSize: 10,
                    }}
                  >
                    PROPOSAL_SNIPER_v2.0
                  </span>
                </div>
                <div
                  className="proposal-console-body"
                  style={{
                    textAlign: state.language === "ar" ? "right" : "left",
                    direction: state.language === "ar" ? "rtl" : "ltr",
                  }}
                >
                  {proposalTexts[proposalStep]}
                  <div
                    style={{
                      marginTop: 14,
                      color: "var(--accent)",
                      fontSize: 9,
                      textAlign: "left",
                      direction: "ltr",
                    }}
                  >
                    [SYSTEM_LOG]: Matching user skills against description...
                    100% OK
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 7: رادار منصات العمل الحر */}
      <motion.section
        className="lp-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">{t.section7.tag}</div>
              <h2 className="lp-section-title">{t.section7.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section7.desc}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{ color: "var(--accent)", flexShrink: 0 }}
                  />{" "}
                  {t.section7.bullet1}
                </li>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: "var(--text2)",
                    marginBottom: 12,
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{ color: "var(--accent)", flexShrink: 0 }}
                  />{" "}
                  {t.section7.bullet2}
                </li>
              </ul>
            </div>

            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "#fff",
                  textAlign: state.language === "ar" ? "right" : "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Globe size={16} style={{ color: "var(--accent)" }} />
                <span>{t.section7.liveRadar}</span>
              </div>
              <div className="radar-platforms-mock">
                {[
                  {
                    name: "Upwork",
                    fee:
                      state.language === "en" ? "10% commission" : "10% عمولة",
                    active:
                      state.language === "en" ? "Premium Global" : "عالمي مميز",
                  },
                  {
                    name: "Fiverr",
                    fee:
                      state.language === "en" ? "20% commission" : "20% عمولة",
                    active:
                      state.language === "en" ? "Microservices" : "خدمات مصغرة",
                  },
                  {
                    name: "Mostaqel",
                    fee: state.language === "en" ? "Full Arabic" : "عربي كامل",
                    active:
                      state.language === "en" ? "Middle East" : "الشرق الأوسط",
                  },
                  {
                    name: "Khamsat",
                    fee:
                      state.language === "en"
                        ? "$5 per service"
                        : "5 دولار للخدمة",
                    active:
                      state.language === "en"
                        ? "Quick Services"
                        : "خدمات سريعة",
                  },
                ].map((plat) => (
                  <div
                    className="radar-platform-card"
                    key={plat.name}
                    style={{
                      direction: state.language === "ar" ? "rtl" : "ltr",
                    }}
                  >
                    <div
                      className="platform-logo-mock"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Globe size={18} style={{ color: "var(--accent)" }} />
                    </div>
                    <div>
                      <div
                        style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}
                      >
                        {plat.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)" }}>
                        {plat.fee} · {plat.active}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 8: محرك أتمتة التسويق */}
      <motion.section
        className="lp-section"
        style={{ background: "rgba(255,255,255,0.01)" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid">
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">
                <Workflow
                  size={14}
                  style={{ display: "inline", marginInlineEnd: 6 }}
                />
                {t.section8.tag}
              </div>
              <h2 className="lp-section-title">{t.section8.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section8.desc}
              </p>
              <div
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  padding: "12px 18px",
                  borderRadius: 12,
                  color: "var(--accent)",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Cpu size={16} style={{ flexShrink: 0 }} />
                <span>{t.section8.note}</span>
              </div>
            </div>

            <div className="tool-interactive-stage">
              <div
                className="glow-overlay-orb"
                style={{
                  background:
                    "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
                }}
              />
              <div className="flow-diagram-mock">
                {t.section8.steps.map((node, i) => {
                  const StepIcon =
                    [Zap, GitBranch, Cpu, Repeat][i % 4] || Workflow;
                  return (
                    <div
                      className="flow-diagram-node"
                      key={i}
                      style={{
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          background: "rgba(59,130,246,0.15)",
                          border: "1px solid rgba(59,130,246,0.25)",
                          display: "flex",
                          alignItems: "center",
                          color: "var(--accent)",
                          flexShrink: 0,
                          justifyContent: "center",
                        }}
                      >
                        <StepIcon size={16} />
                      </div>
                      <div
                        style={{
                          textAlign: state.language === "ar" ? "right" : "left",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {node.title}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text3)",
                            marginTop: 2,
                          }}
                        >
                          {node.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 9: المساعد الشخصي الفوري */}
      <motion.section
        className="lp-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div
              className="tool-showcase-info"
              style={{
                textAlign: state.language === "ar" ? "right" : "left",
                direction: state.language === "ar" ? "rtl" : "ltr",
              }}
            >
              <div className="lp-section-tag">
                <Bot
                  size={14}
                  style={{ display: "inline", marginInlineEnd: 6 }}
                />
                {t.section9.tag}
              </div>
              <h2 className="lp-section-title">{t.section9.title}</h2>
              <p className="lp-hero-sub" style={{ margin: "0 0 24px 0" }}>
                {t.section9.desc}
              </p>
              <div className="chat-presets">
                {t.section9.presets.map((pr, index) => (
                  <button
                    key={index}
                    className="chat-preset-btn"
                    onClick={() => handleChatPreset(pr.query, pr.response)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Sparkles size={12} style={{ color: "var(--accent)" }} />
                    <span>{pr.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 14,
                  color: "#fff",
                  textAlign: state.language === "ar" ? "right" : "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <BrainCircuit size={18} style={{ color: "var(--accent)" }} />
                <span>
                  {state.language === "ar"
                    ? "المساعد الشخصي الذكي"
                    : "Instant AI Assistant"}
                </span>
              </div>
              <div className="chat-widget-mock">
                <div className="chat-window">
                  {chatMessages.map((msg, i) => (
                    <div
                      className={`chat-bubble ${msg.sender}`}
                      key={i}
                      style={{
                        alignSelf:
                          msg.sender === "user"
                            ? state.language === "ar"
                              ? "flex-start"
                              : "flex-end"
                            : state.language === "ar"
                              ? "flex-end"
                              : "flex-start",
                        borderBottomLeftRadius:
                          msg.sender === "user"
                            ? state.language === "ar"
                              ? "2px"
                              : "12px"
                            : "12px",
                        borderBottomRightRadius:
                          msg.sender === "assistant"
                            ? state.language === "ar"
                              ? "2px"
                              : "12px"
                            : "12px",
                        textAlign:
                          msg.sender === "user"
                            ? state.language === "ar"
                              ? "left"
                              : "right"
                            : state.language === "ar"
                              ? "right"
                              : "left",
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {chatTyping && (
                    <div
                      className="chat-bubble assistant"
                      style={{
                        fontStyle: "italic",
                        color: "var(--text3)",
                        alignSelf:
                          state.language === "ar" ? "flex-end" : "flex-start",
                        textAlign: state.language === "ar" ? "right" : "left",
                        direction: state.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      {t.section9.typingMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        className="lp-section"
        id="pricing"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-section-inner">
          <div className="lp-section-tag">{t.pricing.tag}</div>
          <h2 className="lp-section-title">{t.pricing.title}</h2>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text3)",
                marginTop: "40px",
              }}
            >
              <div
                className="ad-submit-spinner"
                style={{ margin: "0 auto 15px" }}
              />
              <div>{t.pricing.loading}</div>
            </div>
          ) : plans && plans.length > 0 ? (
            <div className="lp-pricing-grid">
              {plans.map((p, i) => {
                const displayName =
                  state.language === "en"
                    ? p.name_en || p.name
                    : p.name_ar || p.name;
                const rawFeatures =
                  state.language === "en"
                    ? p.features_en || p.features
                    : p.features_ar || p.features;

                return (
                  <motion.div
                    className="lp-pricing-card"
                    key={p.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ y: -6 }}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 24,
                      padding: 40,
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      {displayName}
                    </div>
                    <div
                      style={{
                        fontSize: 48,
                        fontWeight: 900,
                        color: "var(--accent)",
                        marginBottom: 8,
                      }}
                    >
                      {p.price}{" "}
                      <span style={{ fontSize: 16, color: "var(--text3)" }}>
                        {p.currency
                          ? (p.currency === "USD"
                              ? "$"
                              : p.currency === "SAR"
                                ? state.language === "en"
                                  ? "SAR"
                                  : "ر.س"
                                : p.currency === "AED"
                                  ? state.language === "en"
                                    ? "AED"
                                    : "د.إ"
                                  : p.currency === "KWD"
                                    ? state.language === "en"
                                      ? "KWD"
                                      : "د.ك"
                                    : state.language === "en"
                                      ? "EGP"
                                      : "ج.م") +
                            (state.language === "ar" ? " / شهر" : " / month")
                          : t.pricing.currency}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,0.05)",
                        margin: "24px 0",
                      }}
                    />
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "0 0 32px 0",
                        textAlign: state.language === "ar" ? "right" : "left",
                      }}
                    >
                      {(() => {
                        const featuresList = Array.isArray(rawFeatures)
                          ? rawFeatures
                          : typeof rawFeatures === "string"
                            ? rawFeatures.split("\n")
                            : [];
                        const showExpandButton = featuresList.length > 4;
                        const isExpanded = !!expandedPlans[p.id || i];
                        const visibleFeatures = isExpanded
                          ? featuresList
                          : featuresList.slice(0, 4);

                        const paddedFeatures = [...visibleFeatures];
                        if (!isExpanded && paddedFeatures.length < 4) {
                          while (paddedFeatures.length < 4) {
                            paddedFeatures.push({ isPlaceholder: true });
                          }
                        }

                        return (
                          <>
                            {paddedFeatures.map((f, idx) => {
                              if (f && f.isPlaceholder) {
                                return (
                                  <li
                                    key={`placeholder-${idx}`}
                                    style={{
                                      fontSize: 14,
                                      marginBottom: 12,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                      visibility: "hidden",
                                      userSelect: "none",
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        background:
                                          "linear-gradient(135deg, #10B981, #059669)",
                                        color: "#fff",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 10,
                                        fontWeight: "bold",
                                        flexShrink: 0,
                                      }}
                                    >
                                      ✓
                                    </span>
                                    Placeholder
                                  </li>
                                );
                              }
                              return (
                                <li
                                  key={idx}
                                  style={{
                                    fontSize: 14,
                                    color: "var(--text2)",
                                    marginBottom: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: "50%",
                                      background:
                                        "linear-gradient(135deg, #10B981, #059669)",
                                      color: "#fff",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 10,
                                      fontWeight: "bold",
                                      flexShrink: 0,
                                      boxShadow:
                                        "0 2px 6px rgba(16, 185, 129, 0.3)",
                                    }}
                                  >
                                    ✓
                                  </span>
                                  {f}
                                </li>
                              );
                            })}

                            {showExpandButton && (
                              <button
                                onClick={() => togglePlanExpand(p.id || i)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--accent)",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  padding: "4px 0",
                                  margin:
                                    state.language === "ar"
                                      ? "8px 0 0 auto"
                                      : "8px auto 0 0",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                {isExpanded
                                  ? t.pricing.showLess
                                  : t.pricing.readMore}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </ul>
                    <a
                      href={`https://wa.me/${sanitizePhoneForWhatsapp(brandData?.phoneNumber)}?text=${encodeURIComponent(`${state.language === "en" ? t.pricing.waSubscribeMsg : "أهلاً، أود الاشتراك في "}${displayName}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="lp-cta-main"
                      style={{
                        width: "100%",
                        fontSize: 16,
                        padding: "14px",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <span>{t.pricing.subscribe}</span>
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.886 9.886m8.415-18.3a11.311 11.311 0 00-8.415-3.483C5.307 0 0 5.303 0 11.819c0 2.083.541 4.117 1.57 5.923L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.505 0 11.81-5.304 11.813-11.82a11.32 11.32 0 00-3.483-8.42" />
                      </svg>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--text3)",
                marginTop: "40px",
              }}
            >
              {t.pricing.noPlans}
            </div>
          )}
        </div>
      </motion.section>

      {/* CTA Final */}
      <motion.section
        className="lp-cta-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-cta-inner">
          <div className="lp-cta-orb" />
          <h2 className="lp-cta-title">{t.ctaFinal.title}</h2>
          <p className="lp-cta-sub">{t.ctaFinal.subtitle}</p>
          <motion.button
            className="lp-cta-main"
            style={{ padding: "18px 48px", fontSize: 18 }}
            onClick={goAuth}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {t.ctaFinal.cta}
          </motion.button>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 14 }}>
            {t.ctaFinal.bullets}
          </div>
        </div>
      </motion.section>

      {/* Simple Clean Footer without links */}
      <footer className="lp-footer">
        <div
          className="lp-footer-simple-inner"
          style={{
            flexDirection: state.language === "ar" ? "row-reverse" : "row",
          }}
        >
          <div className="lp-footer-brand-wrap">
            <Logo
              size={26}
              showText={true}
              lang={state.language || "ar"}
              text={brandData?.brandName || "AI Brand Vision"}
            />
            <span className="lp-footer-copyright-text">
              {t.footer.copyright}
            </span>
          </div>

          <div className="lp-footer-actions-wrap">
            <button
              className="lp-lang-btn"
              onClick={() => {
                const nextLang = state.language === "ar" ? "en" : "ar";
                dispatch({ type: "SET_LANGUAGE", payload: nextLang });
              }}
            >
              <Globe size={15} />
              <span>{state.language === "ar" ? "English" : "العربية"}</span>
            </button>
            <button className="btn btn-sm" onClick={goAuth}>
              {t.nav.login}
            </button>
          </div>
        </div>
      </footer>
      {/* Floating WhatsApp Button */}
      {brandData?.phoneNumber && (
        <>
          <style>{`
            @keyframes lp-whatsapp-pulse {
              0% {
                box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4), 0 0 0 0px rgba(37, 211, 102, 0.4);
              }
              70% {
                box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4), 0 0 0 12px rgba(37, 211, 102, 0);
              }
              100% {
                box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4), 0 0 0 0px rgba(37, 211, 102, 0);
              }
            }
            @media (max-width: 600px) {
              .floating-wa-btn {
                right: 16px !important;
                bottom: 16px !important;
                width: 52px !important;
                height: 52px !important;
              }
              .floating-wa-btn svg {
                width: 28px !important;
                height: 28px !important;
              }
            }
          `}</style>
          <a
            href={`https://wa.me/${sanitizePhoneForWhatsapp(brandData.phoneNumber)}?text=${encodeURIComponent(t.whatsapp.waMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="floating-wa-btn"
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              width: "60px",
              height: "60px",
              backgroundColor: "#25D366",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(37, 211, 102, 0.4)",
              zIndex: 99999,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              animation: "lp-whatsapp-pulse 2s infinite",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1) translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(37, 211, 102, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(37, 211, 102, 0.4)";
            }}
          >
            <svg viewBox="0 0 24 24" width="34" height="34" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.886 9.886m8.415-18.3a11.311 11.311 0 00-8.415-3.483C5.307 0 0 5.303 0 11.819c0 2.083.541 4.117 1.57 5.923L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.505 0 11.81-5.304 11.813-11.82a11.32 11.32 0 00-3.483-8.42" />
            </svg>
          </a>
        </>
      )}
    </div>
  );
}

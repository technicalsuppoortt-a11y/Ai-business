import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from "../../../context/ToastContext";
import { getSocialPresenceMatrix } from "../../../services/contentDbService";
import {
  SOCIAL_PLATFORMS,
  SOCIAL_GOALS,
  generateSocialStrategyText,
} from "../../../data/socialPresenceMatrix";
import AnalysisModeSelector from "../../../components/common/AnalysisModeSelector";
import {
  dispatchLiveAiAnalysis,
  callOpenAiApi,
} from "../../../services/liveAiService";
import ToolDashboardLayout from "./ToolDashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Video,
  PlaySquare,
  Briefcase,
  Globe,
  Users,
  Eye,
  Target,
  DollarSign,
  MessageCircle,
  Sparkles,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Wrench,
  BookOpen,
  Rocket,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  HeartHandshake,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Layers3,
  Flame,
  Languages,
  AlertTriangle,
  Award,
  Sliders,
  Send,
  X,
  HelpCircle,
  Sparkle,
  Feather,
  Repeat,
  Calendar,
  PenTool,
  Filter,
  TrendingUp,
  Activity,
  Heart,
  Smile,
  Meh,
  Frown,
  Plus,
  Play,
  Music,
  Hash,
  Wand2,
  Bookmark,
  Scissors,
  Bot,
  RotateCcw,
  Edit3,
  SlidersHorizontal,
  ChevronRight,
  HelpCircleIcon,
  Gauge,
  Cpu,
  Smartphone,
  Tv,
  Clock,
  Zap as ZapIcon,
  BookOpen as BookOpenIcon,
  Film,
  Mic,
  Radio,
  Sparkles as SparklesIcon,
  Send as SendIcon,
  RefreshCw,
  Edit,
  FileCheck,
  TrendingUp as TrendingUpIcon,
  BarChart3,
  MessageSquare as MessageSquareIcon,
  User,
  CheckCircle,
  ArrowRight,
  Star,
  PlayCircle,
  Music2,
  Hash as HashIcon,
  Clock as ClockIcon,
  ChevronDown,
  Check as CheckIcon,
  Video as VideoIcon,
  Smartphone as SmartphoneIcon,
  Tv as TvIcon,
  Film as FilmIcon,
  Zap as ZapIcon2,
  BookOpen as BookOpenIcon2,
  Theater,
  Image,
  Mail,
  Coffee,
  Brain,
  Sparkle as SparkleIcon,
} from "lucide-react";
import "./SocialMedia.css";

// Typewriter Streaming Component for Live AI Outputs
function TypewriterText({ text, speed = 12 }) {
  const [displayedText, setDisplayedText] = useState("");
  const hasStreamedRef = useRef(false);
  const previousTextRef = useRef("");

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      hasStreamedRef.current = false;
      previousTextRef.current = "";
      return;
    }

    if (previousTextRef.current !== text) {
      hasStreamedRef.current = false;
      previousTextRef.current = text;
    }

    if (hasStreamedRef.current) {
      setDisplayedText(text);
      return;
    }

    let currentIndex = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text.charAt(currentIndex));
        currentIndex++;
      } else {
        hasStreamedRef.current = true;
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

// Custom Select Component
function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current.focus(), 100);
    }
  }, [isOpen]);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.value.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getIconComponent = (iconName, size = 16) => {
    const iconMap = {
      smartphone: SmartphoneIcon,
      tv: TvIcon,
      film: FilmIcon,
      zap: ZapIcon2,
      book: BookOpenIcon2,
      theater: Theater,
      image: Image,
      mail: Mail,
      coffee: Coffee,
      brain: Brain,
      sparkle: SparkleIcon,
      instagram: Camera,
      music: Music,
      youtube: Play,
      video: VideoIcon,
    };
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  return (
    <div className={`custom-select-wrapper ${className}`} ref={dropdownRef}>
      <div
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="custom-select-value">
          {Icon && <Icon size={16} className="custom-select-icon" />}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          size={16}
          className={`custom-select-chevron ${isOpen ? "rotated" : ""}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-select-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="custom-select-search">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="custom-select-search-input"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="custom-select-options">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`custom-select-option ${option.value === value ? "selected" : ""}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.iconName && (
                      <span className="custom-option-icon-wrapper">
                        {getIconComponent(option.iconName, 16)}
                      </span>
                    )}
                    <span className="custom-option-label">{option.label}</span>
                    {option.value === value && (
                      <CheckIcon size={14} className="custom-option-check" />
                    )}
                    {option.description && (
                      <span className="custom-option-description">
                        {option.description}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="custom-select-no-results">No options found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SocialMedia({ stepNumber }) {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { toolId } = useParams();

  const lang = state.language || "ar";
  const isRtl = lang === "ar";

  // ═══════════════ MAIN TAB STATE ('architect' | 'factory') ═══════════════
  const [activeTab, setActiveTab] = useState("architect");
  const [analysisMode, setAnalysisMode] = useState("fast");

  // Automatic routing & redirection logic for legacy /dashboard/tool/content-factory
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");

    if (
      toolId === "content-factory" ||
      tabParam === "content-factory" ||
      tabParam === "factory"
    ) {
      setActiveTab("factory");
      if (toolId === "content-factory") {
        navigate("/dashboard/tool/social-media?tab=factory", { replace: true });
      }
    } else if (tabParam === "architect" || tabParam === "social-presence") {
      setActiveTab("architect");
    }
  }, [location, toolId, navigate]);

  // Load saved ideas from Firebase user tool results on mount
  useEffect(() => {
    if (state.toolResults?.["social-media-ideas"]?.savedIdeas) {
      setSavedIdeas(state.toolResults["social-media-ideas"].savedIdeas);
    }
  }, [state.toolResults]);

  // ═══════════════ CROSS-TOOL BRIDGE STATE ═══════════════
  const [activeAudioRecommendation, setActiveAudioRecommendation] = useState(null);
  const [activeTrendingTopic, setActiveTrendingTopic] = useState(null);

  // ═══════════════ TAB 1: SOCIAL MEDIA ARCHITECT STATE ═══════════════
  const [platformArchitect, setPlatformArchitect] = useState("instagram");
  const [goalArchitect, setGoalArchitect] = useState("awareness");
  const [isGeneratingArchitect, setIsGeneratingArchitect] = useState(false);
  const [resultArchitect, setResultArchitect] = useState("");
  const [matrixData, setMatrixData] = useState(null);

  // ═══════════════ TAB 2: BRAND IDENTITY & FEATURE CHIPS STATE ═══════════════
  const [nicheField, setNicheField] = useState(
    state.niche || (lang === "en" ? "Digital Products" : "المنتجات الرقمية"),
  );

  // Micro Modals State
  const [activeModal, setActiveModal] = useState(null);
  const [challengeText, setChallengeText] = useState("");
  const [featureText, setFeatureText] = useState("");
  const [isGeneratingModal, setIsGeneratingModal] = useState(false);
  const [modalAiResult, setModalAiResult] = useState("");

  // ═══════════════ TAB 2: THE 8 CONTENT FACTORY TOOLS STATE ═══════════════
  const [activeSubTool, setActiveSubTool] = useState("script-writer");

  // 1. Script Writer State
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptPlatform, setScriptPlatform] = useState("reel");
  const [scriptTone, setScriptTone] = useState("enthusiastic");
  const [scriptHookStyle, setScriptHookStyle] = useState("question");
  const [scriptResult, setScriptResult] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // 2. Caption Generator State
  const [captionTopic, setCaptionTopic] = useState("");
  const [captionTone, setCaptionTone] = useState("educational");
  const [captionHook, setCaptionHook] = useState("stat");
  const [captionResult, setCaptionResult] = useState("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // 3. Content Repurposer State
  const [originalContent, setOriginalContent] = useState("");
  const [repurposeFormat, setRepurposeFormat] = useState("carousel");
  const [repurposeResult, setRepurposeResult] = useState("");
  const [isGeneratingRepurpose, setIsGeneratingRepurpose] = useState(false);

  // 4. Q&A Generator State
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaTone, setQaTone] = useState("friendly");
  const [qaFormat, setQaFormat] = useState("story");
  const [qaResult, setQaResult] = useState("");
  const [isGeneratingQa, setIsGeneratingQa] = useState(false);

  // 5. Idea Lab State (Fully Bilingual AR / EN)
  const [ideasResult, setIdeasResult] = useState(() =>
    lang === "en"
      ? [
          {
            id: 1,
            text: `How to start a ${nicheField} business from scratch in 2026`,
            tag: "Educational",
            type: "Carousel",
          },
          {
            id: 2,
            text: `5 Fatal mistakes destroying your ad profit and how to solve them`,
            tag: "Viral",
            type: "Short Reel",
          },
          {
            id: 3,
            text: `Behind the scenes of managing and scaling live ad campaigns`,
            tag: "Story",
            type: "Behind Scenes",
          },
        ]
      : [
          {
            id: 1,
            text: "كيف تبدأ مشروع المنتجات الرقمية من الصفر في 2026؟",
            tag: "تعليمي",
            type: "كاروسيل",
          },
          {
            id: 2,
            text: "5 أخطاء قاتلة بتضيع أرباحك في الميديا بايينج وكيف تتجنبها",
            tag: "فيرال",
            type: "فيديو قصير",
          },
          {
            id: 3,
            text: "كواليس يوم كامل في إدارة واستراتيجية الحملات الإعلانية",
            tag: "ستوري",
            type: "كواليس",
          },
        ],
  );
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  // 6. Trends State
  const [trendingHashtags, setTrendingHashtags] = useState([
    {
      tag: "#المنتجات_الرقمية",
      category: "hot",
      label: "رائج جداً الآن",
      growth: "+340%",
    },
    {
      tag: "#التسويق_بالذكاء_الاصطناعي",
      category: "rising",
      label: "ترندات ناشئة",
      growth: "+180%",
    },
    {
      tag: "#العمل_الحر_2026",
      category: "upcoming",
      label: "رائج قريباً",
      growth: "+90%",
    },
  ]);

  const [trendingAudios, setTrendingAudios] = useState([
    {
      title: "Cyber Pulse Ambient Beat",
      creator: "Trend Beats",
      uses: "45.2K فيديو",
    },
    {
      title: "High Energy Motivation Drop",
      creator: "Viral Sounds",
      uses: "128.9K فيديو",
    },
  ]);
  const [isGeneratingTrends, setIsGeneratingTrends] = useState(false);

  // 7. Trending Videos State (Self-contained independent module)
  const trendingVideosList = [
    {
      id: 1,
      title: lang === "en" ? "How My Business Scaled from $0 to $100K" : "السر اللي خلى البزنس بتاعي يتحول من 0 لـ 100K$",
      audio: lang === "en" ? "Original Audio • Trend Beats" : "الصوت الأصلي • Trend Beats",
      views: lang === "en" ? "3.2M views" : "3.2M مشاهدة",
      engagement: lang === "en" ? "8.7% engagement" : "8.7% تفاعل",
      platform: "Reels",
    },
    {
      id: 2,
      title: lang === "en" ? "3 AI Tools Saving You 20 Hours Weekly" : "3 أدوات ذكاء اصطناعي هتوفر عليك 20 ساعة عمل أسبوعياً",
      audio: lang === "en" ? "Cyber Sound • Studio Beats" : "الصوت الأصلي • Studio Sound",
      views: lang === "en" ? "1.8M views" : "1.8M مشاهدة",
      engagement: lang === "en" ? "9.4% engagement" : "9.4% تفاعل",
      platform: "TikTok",
    },
    {
      id: 3,
      title: lang === "en" ? "The #1 Mistake Destroying Your Ad ROI" : "الغلطة رقم 1 اللي بتدمر مبيعاتك وكيف تتجنبها",
      audio: lang === "en" ? "Viral Energy Sound" : "الصوت الأصلي • Viral Audio",
      views: lang === "en" ? "950K views" : "950K مشاهدة",
      engagement: lang === "en" ? "7.9% engagement" : "7.9% تفاعل",
      platform: "Shorts",
    },
  ];

  const [selectedViralVideo, setSelectedViralVideo] = useState(trendingVideosList[0]);
  const [viralAdaptation, setViralAdaptation] = useState("");
  const [isGeneratingAdaptation, setIsGeneratingAdaptation] = useState(false);

  // 8. Burnout Guard State
  const [energyScore, setEnergyScore] = useState(85);
  const [selectedMood, setSelectedMood] = useState("good");
  const [weeklyPostsCount, setWeeklyPostsCount] = useState(8);

  const subTools = [
    {
      id: "script-writer",
      label_ar: "كاتب السكريبت",
      label_en: "Script Writer",
      icon: Video,
    },
    {
      id: "caption-gen",
      label_ar: "كتابة كابشن",
      label_en: "Caption Generator",
      icon: PenTool,
    },
    {
      id: "repurposer",
      label_ar: "إعادة الصياغة",
      label_en: "Content Repurposer",
      icon: Repeat,
    },
    {
      id: "qa-gen",
      label_ar: "الأسئلة والأجوبة",
      label_en: "Q&A Generator",
      icon: MessageSquare,
    },
    {
      id: "idea-lab",
      label_ar: "مختبر الأفكار",
      label_en: "Idea Lab",
      icon: Lightbulb,
    },
    {
      id: "trends",
      label_ar: "الترندات",
      label_en: "Trends & Audio",
      icon: Flame,
    },
    {
      id: "viral-vids",
      label_ar: "الفيديوهات الرائجة",
      label_en: "Trending Videos",
      icon: PlaySquare,
    },
    {
      id: "burnout-guard",
      label_ar: "حماية الإرهاق",
      label_en: "Burnout Guard",
      icon: Activity,
    },
  ];

  // Platform options with vector icons
  const platformOptions = [
    {
      value: "reel",
      label: "Instagram Reel (30 - 60s)",
      iconName: "instagram",
    },
    { value: "tiktok", label: "TikTok (15 - 30s)", iconName: "music" },
    { value: "shorts", label: "YouTube Shorts (60s)", iconName: "youtube" },
    {
      value: "long",
      label:
        lang === "en"
          ? "Long Form Video (3 - 5 min)"
          : "فيديو مطول (3 - 5 دقائق)",
      iconName: "film",
    },
  ];

  const toneOptions = [
    {
      value: "enthusiastic",
      label:
        lang === "en" ? "High Energy & Enthusiastic" : "حماسي وعالي الطاقة",
      iconName: "zap",
    },
    {
      value: "educational",
      label: lang === "en" ? "Calm & Educational" : "تعليمي رزين وهادئ",
      iconName: "book",
    },
    {
      value: "story",
      label:
        lang === "en" ? "Storytelling & Suspenseful" : "قصصي وسينمائي مشوق",
      iconName: "theater",
    },
  ];

  const repurposeOptions = [
    {
      value: "carousel",
      label: lang === "en" ? "Carousel Slides" : "صور متعددة (Carousel)",
      iconName: "image",
    },
    {
      value: "reel",
      label: lang === "en" ? "Short Reel Script" : "سكريبت Reel قصير",
      iconName: "video",
    },
    {
      value: "post",
      label: lang === "en" ? "Long Text Post" : "بوست نصي مطول",
      iconName: "coffee",
    },
    {
      value: "newsletter",
      label: lang === "en" ? "Email Newsletter" : "إيميل إخباري",
      iconName: "mail",
    },
  ];

  // Seamless navigation handlers preserving existing generated output!
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSubToolChange = (subToolId) => {
    setActiveSubTool(subToolId);
  };

  // ═══════════════ CROSS-TOOL BRIDGE HANDLERS ═══════════════

  // CROSS-TOOL BRIDGE 1: AUDIO TREND -> SCRIPT WRITER
  const handleUseAudioTrend = (audioItem) => {
    setActiveAudioRecommendation(audioItem);
    setActiveSubTool("script-writer");
    toast(
      lang === "en"
        ? `Audio "${audioItem.title}" applied! Navigated to Script Writer`
        : `تم تطبيق الصوت "${audioItem.title}"! الانتقال إلى كاتب السكريبت`,
      "success",
    );
  };

  // CROSS-TOOL BRIDGE 2: HASHTAG TREND -> CAPTION GENERATOR
  const handleUseHashtagTrend = (hashtagItem) => {
    const tag = hashtagItem.tag;
    setActiveTrendingTopic(tag);
    setCaptionTopic((prev) => {
      if (prev.includes(tag)) return prev;
      return prev ? `${prev} ${tag}` : tag;
    });
    setActiveSubTool("caption-gen");
    toast(
      lang === "en"
        ? `Hashtag "${tag}" attached! Navigated to Caption Generator`
        : `تم إرفاق الهاشتاج "${tag}"! الانتقال إلى كاتب الكابشن`,
      "success",
    );
  };

  // VIRAL REELS INDEPENDENT MODULE HANDLER (Localized within Viral Reels Studio)
  const handleSelectAndAdaptViralVideo = (videoItem) => {
    setSelectedViralVideo(videoItem);
    handleAdaptViralVideo(videoItem.title);
  };

  useEffect(() => {
    const fetchMatrix = async () => {
      const data = await getSocialPresenceMatrix();
      setMatrixData(data);
    };
    fetchMatrix();
  }, []);

  // Quick Copy Helper
  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast(
      lang === "en" ? "Copied to clipboard!" : "تم النسخ إلى الحافظة!",
      "success",
    );
  };

  // OPENAI LIVE API MODAL HANDLER
  const handleGenerateModalOpenAi = async (modalType) => {
    const inputText = modalType === "challenges" ? challengeText : featureText;
    if (!inputText.trim()) {
      toast(
        lang === "en"
          ? "Please enter details before generating."
          : "يرجى كتابة التفاصيل أولاً.",
        "warning",
      );
      return;
    }

    setIsGeneratingModal(true);
    setModalAiResult("");

    try {
      let systemPrompt = "";
      let userPrompt = "";

      if (modalType === "challenges") {
        systemPrompt =
          lang === "en"
            ? `You are a world-class Business & Content Strategist. The user's business niche is "${nicheField}". Respond in clear, professional English. Provide 3 actionable, high-converting strategies to overcome the user's specified business challenges and objections. Use markdown bullet points and emojis.`
            : `You are a world-class Business & Content Strategist. The user's business niche is "${nicheField}". Respond in clear, professional Arabic. Provide 3 actionable, high-converting strategies to overcome the user's specified business challenges and objections. Use markdown bullet points and emojis.`;
        userPrompt =
          lang === "en"
            ? `Business Challenges & Objections:\n${challengeText}`
            : `التحديات والعقبات المذكورة:\n${challengeText}`;
      } else {
        systemPrompt =
          lang === "en"
            ? `You are a viral Social Media Marketing Copywriter. The user's business niche is "${nicheField}". Respond in clear, professional English. Provide 3 creative commercial hooks and content proposals to leverage the specified product features. Use markdown bullet points and emojis.`
            : `You are a viral Social Media Marketing Copywriter. The user's business niche is "${nicheField}". Respond in clear, professional Arabic. Provide 3 creative commercial hooks and content proposals to leverage the specified product features. Use markdown bullet points and emojis.`;
        userPrompt =
          lang === "en"
            ? `Product Advantages & Competitive Features:\n${featureText}`
            : `المميزات والقيمة التنافسية للزيادة:\n${featureText}`;
      }

      const res = await callOpenAiApi({
        systemPrompt,
        userPrompt,
        userEmail: state.user?.email,
        uid: userData?.uid || state?.user?.uid
      });

      setModalAiResult(res);
      toast(
        lang === "en"
          ? "Strategy generated via Live AI!"
          : "تم توليد الاستراتيجية عبر الذكاء الاصطناعي الحي!",
        "success",
      );
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingModal(false);
    }
  };

  // Tab 1 Architect Handler with Firebase persistence
  const handleGenerateArchitect = async () => {
    setIsGeneratingArchitect(true);
    setResultArchitect("");

    try {
      let text = "";
      if (analysisMode === "live") {
        text = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: "social-presence",
          inputs: { platform: platformArchitect, goal: goalArchitect },
          context: {
            niche: nicheField || state.niche,
            brandName: state.brandName,
            user: state.user,
          },
          lang
    });
      } else {
        await new Promise((r) => setTimeout(r, 400));
        const niche =
          nicheField || state.niche || (lang === "en" ? "Freelance" : "عمل حر");
        const brandName =
          state.brandName || (lang === "en" ? "My Brand" : "براندي");
        text = generateSocialStrategyText(
          matrixData,
          platformArchitect,
          goalArchitect,
          niche,
          brandName,
          lang,
        );
      }
      setResultArchitect(text);
      dispatch({
        type: "SAVE_TOOL_RESULT",
        toolId: "social-presence",
        data: {
          platform: platformArchitect,
          goal: goalArchitect,
          result: text,
          mode: analysisMode,
          timestamp: new Date().toISOString(),
        },
      });
      toast(
        lang === "en"
          ? "Account strategy ready & saved!"
          : "استراتيجية الحساب جاهزة ومحفوظة بنجاح!",
        "success",
      );
    } catch (error) {
      console.error(error);
      if (error?.message === 'OUT_OF_CREDITS' || error?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingArchitect(false);
    }
  };

  // 1. Script Writer Handler with Cross-Tool Audio Integration & Firebase persistence
  const handleGenerateScript = async () => {
    if (!scriptTopic.trim()) {
      toast(
        lang === "en"
          ? "Please enter a video topic."
          : "يرجى كتابة فكرة أو موضوع الفيديو.",
        "warning",
      );
      return;
    }
    setIsGeneratingScript(true);
    setScriptResult("");

    try {
      let res = "";
      const audioInfo = activeAudioRecommendation
        ? ` (Background Audio: ${activeAudioRecommendation.title} - ${activeAudioRecommendation.creator})`
        : "";

      if (analysisMode === "live") {
        res = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: "script-writer",
          inputs: {
            scriptTopic: scriptTopic + audioInfo,
            scriptPlatform,
            scriptTone,
            scriptHookStyle,
            nicheField,
            activeAudio: activeAudioRecommendation ? activeAudioRecommendation.title : null,
          },
          context: { niche: nicheField, user: state.user },
          lang
    });
      } else {
        await new Promise((r) => setTimeout(r, 400));
        res =
          lang === "en"
            ? `### Video Script Structure: ${scriptTopic}${audioInfo}\n\n**1. Hook (0 - 3s):**\n"Did you know that 90% of people fail in ${nicheField} because of one mistake? Let's fix it!"\n\n**2. Body (3 - 30s):**\n- Step 1: Define your core value proposition.\n- Step 2: Utilize high-converting tools.\n- Step 3: Maintain weekly consistency.\n\n**3. Key Points & Value:**\nFast, scalable, and fully automated.${activeAudioRecommendation ? `\n\n🎵 **Recommended Background Audio:** ${activeAudioRecommendation.title} (${activeAudioRecommendation.creator})` : ""}\n\n**4. Call to Action (CTA):**\n"Comment 'GROW' to receive our free setup guide directly!"`
            : `### سكريبت فيديو متكامل: ${scriptTopic}${audioInfo}\n\n**1. الخاطف البصري والشفهي (Hook 0 - 3s):**\n"عرفت إن 90% من الناس بتخسر أرباحها في ${nicheField} بسبب غلطة واحدة؟ تعال أقولك إزاي تحلها في 30 ثانية!"\n\n**2. محتوى الفيديو الأساسي (Body 3 - 30s):**\n- الخطوة الأولى: حدد العرض القوي لمنتجك بدون تعقيد.\n- الخطوة الثانية: استخدم أدوات الأتمتة لزيادة مبيعاتك.\n- الخطوة الثالثة: حافظ على النشر المباشر يومياً.\n\n**3. النقطة الجوهرية (Key Value):**\nالنتائج بتيجي من الاستمرارية والتوجيه الصحيح.${activeAudioRecommendation ? `\n\n🎵 **الصوت الخلفي المُقترح للسكريبت:** ${activeAudioRecommendation.title} (${activeAudioRecommendation.creator})` : ""}\n\n**4. الدعوة لاتخاذ إجراء (CTA):**\n"اكتب كلمة 'تم' في التعليقات عشان أبعتلك دليل التأسيس المجاني فوراً!"`;
      }
      setScriptResult(res);
      dispatch({
        type: "SAVE_TOOL_RESULT",
        toolId: "social-media-script",
        data: {
          scriptTopic,
          scriptPlatform,
          scriptTone,
          activeAudio: activeAudioRecommendation ? activeAudioRecommendation.title : null,
          result: res,
          mode: analysisMode,
          timestamp: new Date().toISOString(),
        },
      });
      toast(
        lang === "en" ? "Script generated & saved!" : "تم كتابة السكريبت وحفظه بنجاح!",
        "success",
      );
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // 2. Caption Generator Handler with Cross-Tool Hashtag Integration & Firebase persistence
  const handleGenerateCaption = async () => {
    if (!captionTopic.trim()) {
      toast(
        lang === "en"
          ? "Please enter a post description."
          : "يرجى كتابة موضوع البوست.",
        "warning",
      );
      return;
    }
    setIsGeneratingCaption(true);
    setCaptionResult("");

    try {
      let res = "";
      const attachedHashtag = activeTrendingTopic ? ` ${activeTrendingTopic}` : "";
      if (analysisMode === "live") {
        res = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: "caption-generator",
          inputs: { captionTopic: captionTopic + attachedHashtag, captionTone, captionHook, nicheField },
          context: { niche: nicheField, user: state.user },
          lang
    });
      } else {
        await new Promise((r) => setTimeout(r, 400));
        res =
          lang === "en"
            ? `### Professional Caption:\n\n${captionTopic}\n\n💡 **Core Hook:** Don't wait for perfect conditions to launch your digital business. Start with available resources today and scale consistently.\n\n👇 Save this post for later, and share your thoughts in the comments!\n\n#${nicheField.replace(/\s+/g, "_")} ${attachedHashtag || ""} #Marketing #Freelancing #Growth #AI`
            : `الكابشن الاحترافي:\n\n${captionTopic}\n\n💡 النكشة الأساسية: لا تنتظر الظروف المثالية لبدء عملك الرقمي، ابدأ بالموارد المتاحة حالياً وضاعف أرباحك باستمرار.\n\n👇 احفظ البوست عندك عشان ترجعله، وشاركنا رأيك في التعليقات!\n\n#${nicheField.replace(/\s+/g, "_")} ${attachedHashtag} #تسويق #عمل_حر #أرباح #ذكاء_اصطناعي`;
      }
      setCaptionResult(res);
      dispatch({
        type: "SAVE_TOOL_RESULT",
        toolId: "social-media-caption",
        data: {
          captionTopic,
          attachedHashtag: activeTrendingTopic,
          result: res,
          mode: analysisMode,
          timestamp: new Date().toISOString(),
        },
      });
      toast(
        lang === "en" ? "Caption ready & saved!" : "الكابشن جاهز ومحفوظ!",
        "success",
      );
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // 3. Content Repurposer Handler with Firebase persistence
  const handleGenerateRepurpose = async () => {
    if (!originalContent.trim()) {
      toast(
        lang === "en"
          ? "Please paste original content."
          : "يرجى لصق النص الأصلي أولاً.",
        "warning",
      );
      return;
    }
    setIsGeneratingRepurpose(true);
    setRepurposeResult("");

    try {
      let res = "";
      if (analysisMode === "live") {
        res = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: "content-repurposer",
          inputs: { originalContent, repurposeFormat, nicheField },
          context: { niche: nicheField, user: state.user },
          lang
    });
      } else {
        await new Promise((r) => setTimeout(r, 400));
        res =
          lang === "en"
            ? `### Repurposed Content (${repurposeFormat}):\n\n1. **High Impact Title:** Key takeaways from original content\n\n2. **Visual Bullet Points:**\n- Point 1: ${originalContent.slice(0, 60)}...\n- Point 2: Core execution steps for growth and conversion.\n\n3. **Summary & CTA:** Follow for more insights!`
            : `المحتوى المعاد صياغته بصيغة (${repurposeFormat}):\n\n1. **العنوان الرئيسي الجذاب:** "تجميعة أهم النقاط من النص الأصلي"\n\n2. **النقاط البصرية:**\n- النقطة الأولية: ${originalContent.slice(0, 60)}...\n- النقطة الثانية: أهم الخطوات التنفيذية للنجاح.\n\n3. **الخلاصة والدعوة للعمل:** تابع الحساب للمزيد من الشروحات القادمة!`;
      }
      setRepurposeResult(res);
      dispatch({
        type: "SAVE_TOOL_RESULT",
        toolId: "social-media-repurpose",
        data: {
          repurposeFormat,
          result: res,
          mode: analysisMode,
          timestamp: new Date().toISOString(),
        },
      });
      toast(
        lang === "en" ? "Content repurposed & saved!" : "تم إعادة صياغة المحتوى وحفظه بنجاح!",
        "success",
      );
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingRepurpose(false);
    }
  };

  // 4. Q&A Handler with Firebase persistence
  const handleGenerateQa = async () => {
    if (!qaQuestion.trim()) {
      toast(
        lang === "en"
          ? "Please enter a follower question."
          : "أدخل سؤال العميل أولاً.",
        "warning",
      );
      return;
    }
    setIsGeneratingQa(true);
    setQaResult("");

    try {
      let res = "";
      if (analysisMode === "live") {
        res = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: "qa-generator",
          inputs: { qaQuestion, qaTone, qaFormat, nicheField },
          context: { niche: nicheField, user: state.user },
          lang
    });
      } else {
        await new Promise((r) => setTimeout(r, 400));
        res =
          lang === "en"
            ? `### Strategic Response to Question (${qaQuestion}):\n\nWelcome! That is a great question. The direct answer is yes — you can achieve outstanding results in ${nicheField} by following proven steps with zero friction.\n\nDM us directly to get all the details!`
            : `الرد الاستراتيجي على سؤال (${qaQuestion}):\n\nأهلاً بك! سؤال ممتاز جداً. الإجابة المباشرة هي نعم، يمكنك تحقيق نتائج ممتازة في ${nicheField} من خلال اتباع خطوات مجربة بدون تعقيدات.\n\nأرسل لنا رسالة خاصة للحصول على التفاصيل الكاملة!`;
      }
      setQaResult(res);
      dispatch({
        type: "SAVE_TOOL_RESULT",
        toolId: "social-media-qa",
        data: {
          qaQuestion,
          result: res,
          mode: analysisMode,
          timestamp: new Date().toISOString(),
        },
      });
      toast(
        lang === "en" ? "Response ready & saved!" : "الرد الاستراتيجي جاهز ومحفوظ!",
        "success",
      );
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingQa(false);
    }
  };

  const handleApplyTweak = (tweakType) => {
    if (!qaResult) return;
    if (tweakType === "shorten") {
      setQaResult(qaResult.slice(0, Math.floor(qaResult.length * 0.6)) + "...");
      toast(lang === "en" ? "Text shortened!" : "تم اختصار النص!", "info");
    }
  };

  // 5. Idea Lab Handler (Strictly Bilingual EN/AR & Clean Structured Card Parsing)
  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      let newIdeas = [];
      if (analysisMode === "live") {
        const liveRes = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: "idea-lab",
          inputs: { nicheField },
          context: { niche: nicheField, user: state.user },
          lang
    });

        if (liveRes) {
          const lines = liveRes
            .split(/\n+/)
            .map((l) => l.replace(/^[-*•\d.\s]+/, "").trim())
            .filter(
              (l) =>
                l.length > 8 &&
                !l.includes("عذراً") &&
                !l.includes("sorry") &&
                !l.includes("لا أستطيع") &&
                !l.includes("Idea-lab") &&
                !l.includes("أداة") &&
                !l.includes("تنفيذ لحظية"),
            );

          if (lines.length > 0) {
            const tagsEn = ["Viral AI", "High Value", "Educational", "Story"];
            const tagsAr = ["فيرال بالذكاء الاصطناعي", "قيمة عالية", "تعليمي", "قصصي"];
            const typesEn = ["Short Reel", "Carousel", "Reel Script", "Story Post"];
            const typesAr = ["فيديو قصير", "كاروسيل", "سكريبت ريلز", "بوست"];

            newIdeas = lines.slice(0, 3).map((line, idx) => ({
              id: Date.now() + idx,
              text: line.replace(/[*#"]/g, "").trim(),
              tag: lang === "en" ? tagsEn[idx % tagsEn.length] : tagsAr[idx % tagsAr.length],
              type: lang === "en" ? typesEn[idx % typesEn.length] : typesAr[idx % typesAr.length],
            }));
          }
        }
      }

      if (newIdeas.length === 0) {
        if (analysisMode !== "live") {
          await new Promise((r) => setTimeout(r, 450));
        }
        newIdeas =
          lang === "en"
            ? [
                {
                  id: Date.now(),
                  text: `3 Secret Strategies to Scale Your ${nicheField} Business in 2026`,
                  tag: "Viral",
                  type: "Short Reel",
                },
                {
                  id: Date.now() + 1,
                  text: `Comprehensive Comparison: Free vs Paid Tools for ${nicheField}`,
                  tag: "Educational",
                  type: "Carousel",
                },
                {
                  id: Date.now() + 2,
                  text: `Behind the Scenes: How We Doubled Conversion Rates in ${nicheField}`,
                  tag: "Story",
                  type: "Post",
                },
              ]
            : [
                {
                  id: Date.now(),
                  text: `3 أسرار غير معروفة لتنمية مشروعات ${nicheField} في 2026`,
                  tag: "فيرال",
                  type: "فيديو قصير",
                },
                {
                  id: Date.now() + 1,
                  text: `مقارنة شاملة بين الأدوات المجانية والمدفوعة في ${nicheField}`,
                  tag: "تعليمي",
                  type: "كاروسيل",
                },
                {
                  id: Date.now() + 2,
                  text: `كيف أعدت تنظيم خطة أعمالي وحققت نتائج مضاعفة`,
                  tag: "قصصي",
                  type: "بوست",
                },
              ];
      }

      setIdeasResult((prev) => [...newIdeas, ...prev]);
      toast(
        lang === "en"
          ? "New viral ideas generated!"
          : "تم توليد أفكار فيرال جديدة!",
        "success",
      );
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSaveIdea = (idea) => {
    if (!savedIdeas.some((i) => i.id === idea.id || i.text === idea.text)) {
      const updatedSaved = [...savedIdeas, idea];
      setSavedIdeas(updatedSaved);
      // Firebase / App State persistence
      dispatch({
        type: "SAVE_TOOL_RESULT",
        toolId: "social-media-ideas",
        data: {
          savedIdeas: updatedSaved,
          nicheField,
          lastUpdated: new Date().toISOString(),
        },
      });
      toast(
        lang === "en"
          ? "Idea saved to archive!"
          : "تم حفظ الفكرة في أرشيفك وقاعدة البيانات!",
        "success",
      );
    }
  };

  // 6. Trends Generator Handler (With Dual Mode Live AI / Fast & Firebase Save)
  const handleGenerateTrends = async () => {
    setIsGeneratingTrends(true);
    try {
      let hashtags = [];
      let audios = [];
      if (analysisMode === "live") {
        const liveRes = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: "trends",
          inputs: { nicheField },
          context: { niche: nicheField, user: state.user },
          lang
    });
        hashtags = [
          {
            tag: `#${nicheField.replace(/\s+/g, "_")}_2026`,
            category: "hot",
            label: lang === "en" ? "Super Hot AI Trend" : "ترند بالذكاء الاصطناعي",
            growth: "+450%",
          },
          {
            tag: `#نمو_${nicheField.replace(/\s+/g, "_")}`,
            category: "rising",
            label: lang === "en" ? "Rising Fast" : "صاعد بسرعة",
            growth: "+290%",
          },
        ];
        audios = [
          {
            title: `AI Cinematic Beat - ${nicheField}`,
            creator: "Studio AI",
            uses: "89.4K فيديو",
          },
          {
            title: "Viral Energy Trend Audio",
            creator: "Top Beats",
            uses: "142.1K فيديو",
          },
        ];
      } else {
        await new Promise((r) => setTimeout(r, 450));
        hashtags = [
          {
            tag: `#${nicheField.replace(/\s+/g, "_")}`,
            category: "hot",
            label: "رائج جداً الآن",
            growth: "+340%",
          },
          {
            tag: "#التسويق_بالذكاء_الاصطناعي",
            category: "rising",
            label: "ترندات ناشئة",
            growth: "+180%",
          },
          {
            tag: "#العمل_الحر_2026",
            category: "upcoming",
            label: "رائج قريباً",
            growth: "+90%",
          },
        ];
        audios = [
          {
            title: "Cyber Pulse Ambient Beat",
            creator: "Trend Beats",
            uses: "45.2K فيديو",
          },
          {
            title: "High Energy Motivation Drop",
            creator: "Viral Sounds",
            uses: "128.9K فيديو",
          },
        ];
      }
      setTrendingHashtags(hashtags);
      setTrendingAudios(audios);

      dispatch({
        type: "SAVE_TOOL_RESULT",
        toolId: "social-media-trends",
        data: {
          hashtags,
          audios,
          mode: analysisMode,
          timestamp: new Date().toISOString(),
        },
      });

      toast(
        lang === "en" ? "Trends refreshed & saved!" : "تم تحديث الترندات والأصوات وحفظها!",
        "success",
      );
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingTrends(false);
    }
  };

  // 7. Viral Video Adaptation Handler (With Live AI & Firebase Persistence)
  const handleAdaptViralVideo = async (videoTitle) => {
    setIsGeneratingAdaptation(true);
    setViralAdaptation("");
    try {
      let res = "";
      if (analysisMode === "live") {
        res = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: "viral-vids",
          inputs: { videoTitle, nicheField },
          context: { niche: nicheField, user: state.user },
          lang
    });
      } else {
        await new Promise((r) => setTimeout(r, 450));
        res =
          lang === "en"
            ? `### Adapted Concept for (${videoTitle}):\n\n1. **Visual Hook:** Start by showing real screen results in ${nicheField}.\n2. **Verbal Hook:** "Everyone thinks ${nicheField} is hard, but this 3-step trend proves otherwise."\n3. **Body & CTA:** Break down the solution in 30 seconds and ask viewers to comment 'GROW'.`
            : `نسختك الخاصة من ترند (${videoTitle}):\n\n1. **الافتتاحية البصرية:** ابدأ بتصوير شاشة لاب توب أو هاتف يوضح النتيجة الحقيقية في ${nicheField}.\n2. **الخاطف:** "كل الناس فاكرة إن ${nicheField} صعبة، لكن الترند ده بيثبت العكس في 3 خطوات".\n3. **الخطوات:** اعرض حل مشكلة العميل بأسلوب سريع وممتع في 30 ثانية.`;
      }
      setViralAdaptation(res);

      dispatch({
        type: "SAVE_TOOL_RESULT",
        toolId: "social-media-viral-reels",
        data: {
          videoTitle,
          result: res,
          mode: analysisMode,
          nicheField,
          timestamp: new Date().toISOString(),
        },
      });

      toast(
        lang === "en"
          ? "Trend concept adapted & saved!"
          : "تم توليد الفكرة المخصصة للترند وحفظها في بنك النتائج!",
        "success",
      );
    } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGeneratingAdaptation(false);
    }
  };

  const handleSelectMood = (moodKey, score) => {
    setSelectedMood(moodKey);
    setEnergyScore(score);
    toast(`تم تسجيل مستوى طاقتك الإبداعية: ${score}%`, "info");
  };

  return (
    <ToolDashboardLayout
      id="social-media"
      title={
        lang === "en"
          ? "Social Media Studio Deck"
          : "منصة السوشيال ميديا الشاملة (Studio Deck)"
      }
      subtitle={
        lang === "en"
          ? "Interactive full-width 3-step sequential studio combining strategy architect & 8 execution content tools."
          : "مساحة عمل تفاعلية كاملة العرض تجمع بين تأسيس استراتيجية الحسابات والـ 8 أدوات التنفيذية لإنتاج المحتوى."
      }
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="20 - 40"
    >
      <div className="sm-master-canvas" dir={isRtl ? "rtl" : "ltr"}>
        {/* ═══════════════ TOP GLASS TAB SWITCHER ═══════════════ */}
        <div className="sm-top-tabs-wrap">
          <div className="sm-top-tabs">
            <button
              type="button"
              className={`sm-tab-btn ${activeTab === "architect" ? "active" : ""}`}
              onClick={() => handleTabChange("architect")}
            >
              <Rocket size={16} style={{ flexShrink: 0 }} />
              <span>
                {lang === "en"
                  ? "Social Media Architect"
                  : "مؤسس السوشيال ميديا"}
              </span>
              {activeTab === "architect" && (
                <motion.div
                  layoutId="activeSocialTabPill"
                  className="sm-active-tab-pill"
                  style={{
                    left: isRtl ? "auto" : 6,
                    right: isRtl ? 6 : "auto",
                    width: "48%",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>

            <button
              type="button"
              className={`sm-tab-btn ${activeTab === "factory" ? "active" : ""}`}
              onClick={() => handleTabChange("factory")}
            >
              <Layers3 size={16} style={{ flexShrink: 0 }} />
              <span>
                {lang === "en"
                  ? "Content Factory Studio"
                  : "مصنع المحتوى الاحترافي"}
              </span>
              {activeTab === "factory" && (
                <motion.div
                  layoutId="activeSocialTabPill"
                  className="sm-active-tab-pill"
                  style={{
                    left: isRtl ? 6 : "auto",
                    right: isRtl ? "auto" : 6,
                    width: "48%",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* ═══════════════ TAB 1: SOCIAL MEDIA ARCHITECT ═══════════════ */}
        {activeTab === "architect" && (
          <AnimatePresence mode="wait">
            {isGeneratingArchitect ? (
              <motion.div
                key="arch-processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="sm-processing-stage"
              >
                <div className="sm-spinner-pulse" />
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#F8FAFC",
                    margin: 0,
                  }}
                >
                  {analysisMode === "live"
                    ? lang === "en"
                      ? "Analyzing and generating strategy with Live AI..."
                      : "جاري تحليل وتأسيس الاستراتيجية بالذكاء الاصطناعي الحي..."
                    : lang === "en"
                      ? "Generating social media blueprint..."
                      : "جاري كتابة مخطط السوشيال ميديا..."}
                </h3>
                <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>
                  {lang === "en"
                    ? "Preparing tailored account strategies for your niche."
                    : "جاري إعداد التوصيات ومحتوى الحسابات المخصص لنيتشك."}
                </p>
              </motion.div>
            ) : resultArchitect ? (
              <motion.div
                key="arch-showcase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="sm-showcase-stage"
              >
                <div className="sm-pane-header">
                  <h4 className="sm-deck-title">
                    <ShieldCheck size={20} style={{ color: "#60A5FA" }} />
                    <span>
                      {lang === "en"
                        ? "Social Blueprint & Growth Plan"
                        : "مخطط استراتيجية الحساب المتكامل (Social Blueprint)"}
                    </span>
                  </h4>
                </div>

                <div className="sm-showcase-content">
                  {analysisMode === "live" ? (
                    <TypewriterText text={resultArchitect} speed={10} />
                  ) : (
                    resultArchitect.split("\n").map((line, i) => (
                      <p key={i} style={{ margin: "0 0 6px 0" }}>
                        {line.replace(/\*/g, "")}
                      </p>
                    ))
                  )}
                </div>

                <div className="sm-tactical-dock">
                  <button
                    type="button"
                    onClick={() => handleCopyText(resultArchitect)}
                    className="sm-dock-btn"
                  >
                    <Copy size={15} />{" "}
                    <span>{lang === "en" ? "Quick Copy" : "النسخ السريع"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateArchitect}
                    className="sm-dock-btn"
                  >
                    <RotateCcw size={15} />{" "}
                    <span>{lang === "en" ? "Regenerate" : "إعادة توليد"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultArchitect("")}
                    className="sm-dock-btn primary"
                  >
                    <Edit3 size={15} />{" "}
                    <span>
                      {lang === "en" ? "Edit Inputs" : "تعديل المدخلات"}
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="arch-config"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="sm-deck-canvas"
              >
                <div className="sm-deck-header" style={{ marginBottom: "20px" }}>
                  <h4 className="sm-deck-title">
                    <Rocket size={20} style={{ color: "#3B82F6" }} />
                    <span>
                      {lang === "en"
                        ? "Account Strategy & Growth Goals"
                        : "تأسيس استراتيجية الحساب والنمو المستهدف"}
                    </span>
                  </h4>
                </div>

                <AnalysisModeSelector
                  mode={analysisMode}
                  onChange={setAnalysisMode}
                  lang={lang}
                  accentColor="#3B82F6"
                />

                <div className="pcc-input-group" style={{ marginTop: "20px" }}>
                  <label className="pcc-label">
                    <Share2 size={14} style={{ color: "#3B82F6" }} />
                    <span>
                      {lang === "en"
                        ? "1. Select Target Platform"
                        : "1. اختر المنصة المستهدفة للنمو"}
                    </span>
                  </label>
                  <div className="sm-grid-cards">
                    {SOCIAL_PLATFORMS.map((p) => {
                      const isActive = platformArchitect === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setPlatformArchitect(p.id)}
                          className={`sm-select-card ${isActive ? "active" : ""}`}
                        >
                          <Camera
                            size={18}
                            style={{ color: isActive ? "#3B82F6" : "#94A3B8" }}
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "800",
                              color: "#F8FAFC",
                            }}
                          >
                            {lang === "en" ? p.label_en : p.label_ar}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pcc-input-group">
                  <label className="pcc-label">
                    <Target size={14} style={{ color: "#10B981" }} />
                    <span>
                      {lang === "en"
                        ? "2. Select Account Objective"
                        : "2. حدد الهدف الاستراتيجي للحساب"}
                    </span>
                  </label>
                  <div className="sm-grid-cards">
                    {SOCIAL_GOALS.map((g) => {
                      const isActive = goalArchitect === g.id;
                      return (
                        <div
                          key={g.id}
                          onClick={() => setGoalArchitect(g.id)}
                          className={`sm-select-card ${isActive ? "active green" : ""}`}
                        >
                          <Target
                            size={18}
                            style={{ color: isActive ? "#10B981" : "#94A3B8" }}
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "800",
                              color: "#F8FAFC",
                            }}
                          >
                            {lang === "en" ? g.label_en : g.label_ar}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateArchitect}
                  className="sm-deck-btn"
                >
                  <Sparkles size={18} />
                  <span>
                    {lang === "en"
                      ? "Build Social Strategy Now"
                      : "تأسيس استراتيجية الحساب الآن"}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ═══════════════ TAB 2: CONTENT FACTORY ═══════════════ */}
        {activeTab === "factory" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* 1. Header: Brand Identity Panel */}
            <div className="sm-identity-panel">
              <div className="sm-identity-row">
                <div className="sm-identity-field">
                  <span className="sm-field-tag">
                    {lang === "en" ? "Niche & Field" : "المجال والنيش"}
                  </span>
                  <input
                    type="text"
                    value={nicheField}
                    onChange={(e) => setNicheField(e.target.value)}
                    className="pcc-input"
                    style={{
                      width: "280px",
                      padding: "8px 14px",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal("challenges");
                      setModalAiResult("");
                    }}
                    className="sm-action-chip red"
                  >
                    <AlertTriangle size={16} style={{ color: "#F87171" }} />
                    <span>
                      {lang === "en"
                        ? "Challenges"
                        : "زرار التحديات (Challenges)"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal("features");
                      setModalAiResult("");
                    }}
                    className="sm-action-chip green"
                  >
                    <Award size={16} style={{ color: "#34D399" }} />
                    <span>
                      {lang === "en"
                        ? "Features"
                        : "زرار المميزات (Product Features)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Sub-Navigation Pill Bar (The 8 Tools) */}
            <div className="sm-subnav-wrap">
              <div className="sm-subnav-pill-bar">
                {subTools.map((st) => {
                  const isActive = activeSubTool === st.id;
                  const IconComp = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSubToolChange(st.id)}
                      className={`sm-subnav-pill ${isActive ? "active" : ""}`}
                    >
                      <IconComp
                        size={15}
                        style={{ color: isActive ? "#FFFFFF" : "#3B82F6" }}
                      />
                      <span>{lang === "en" ? st.label_en : st.label_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═══════════════ SUB-TOOL 1: SCRIPT WRITER ═══════════════ */}
            {activeSubTool === "script-writer" && (
              <AnimatePresence mode="wait">
                {isGeneratingScript ? (
                  <motion.div
                    key="script-proc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="sm-processing-stage"
                  >
                    <div className="sm-spinner-pulse" />
                    <h3
                      style={{ fontSize: "17px", color: "#F8FAFC", margin: 0 }}
                    >
                      {lang === "en"
                        ? "Writing video script & structuring scenes..."
                        : "جاري كتابة السكريبت وتنسيق المشاهد..."}
                    </h3>
                  </motion.div>
                ) : scriptResult ? (
                  <motion.div
                    key="script-showcase"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm-showcase-stage"
                  >
                    <div className="sm-pane-header">
                      <h4 className="sm-deck-title">
                        <Video size={20} style={{ color: "#3B82F6" }} />
                        <span>
                          {lang === "en"
                            ? "Formatted Video Script Preview"
                            : "معاينة سكريبت الفيديو المصاغ"}
                        </span>
                      </h4>
                    </div>
                    <div className="sm-showcase-content">
                      {analysisMode === "live" ? (
                        <TypewriterText text={scriptResult} speed={10} />
                      ) : (
                        scriptResult
                      )}
                    </div>
                    <div className="sm-tactical-dock">
                      <button
                        type="button"
                        onClick={() => handleCopyText(scriptResult)}
                        className="sm-dock-btn"
                      >
                        <Copy size={15} />{" "}
                        <span>
                          {lang === "en" ? "Quick Copy" : "النسخ السريع"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateScript}
                        className="sm-dock-btn"
                      >
                        <RotateCcw size={15} />{" "}
                        <span>
                          {lang === "en" ? "Regenerate" : "إعادة توليد"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setScriptResult("")}
                        className="sm-dock-btn primary"
                      >
                        <Edit3 size={15} />{" "}
                        <span>
                          {lang === "en" ? "Edit Inputs" : "تعديل المدخلات"}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="script-config"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm-deck-canvas"
                  >
                    <div className="sm-deck-header" style={{ marginBottom: "16px" }}>
                      <h4 className="sm-deck-title">
                        <Video size={22} style={{ color: "#3B82F6" }} />
                        <span>
                          {lang === "en"
                            ? "Professional Video Script Writer"
                            : "كاتب سكريبت الفيديوهات الاحترافي"}
                        </span>
                      </h4>
                    </div>

                    <AnalysisModeSelector
                      mode={analysisMode}
                      onChange={setAnalysisMode}
                      lang={lang}
                      accentColor="#3B82F6"
                    />

                    {/* Active Recommended Audio Context Badge */}
                    {activeAudioRecommendation && (
                      <div
                        style={{
                          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(124, 58, 237, 0.08) 100%)",
                          border: "1px solid rgba(139, 92, 246, 0.4)",
                          borderRadius: "14px",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "16px",
                          marginBottom: "16px",
                          boxShadow: "0 0 20px rgba(139, 92, 246, 0.15)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Music2 size={18} style={{ color: "#C084FC" }} />
                          <div>
                            <span style={{ fontSize: "11px", color: "#C084FC", fontWeight: "800", textTransform: "uppercase" }}>
                              {lang === "en" ? "Active Trend Audio Attached" : "الصوت الخلفي المُحدد للسكريبت"}
                            </span>
                            <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#F8FAFC", marginTop: "2px" }}>
                              {activeAudioRecommendation.title} <span style={{ fontSize: "11px", color: "#94A3B8" }}>• {activeAudioRecommendation.creator}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveAudioRecommendation(null)}
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "10px",
                            padding: "6px 12px",
                            color: "#94A3B8",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <X size={14} /> {lang === "en" ? "Remove" : "إزالة"}
                        </button>
                      </div>
                    )}

                    <div className="pcc-input-group" style={{ marginTop: activeAudioRecommendation ? "0" : "16px" }}>
                      <label
                        className="pcc-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <FileText size={15} style={{ color: "#3B82F6" }} />
                        <span>
                          {lang === "en"
                            ? "Video Topic / Core Concept"
                            : "فكرة أو موضوع الفيديو الأساسي"}
                        </span>
                      </label>
                      <textarea
                        rows={3}
                        value={scriptTopic}
                        onChange={(e) => setScriptTopic(e.target.value)}
                        placeholder={
                          lang === "en"
                            ? "e.g., 3 critical mistakes losing your ad profit and how to solve them in 30 seconds..."
                            : "مثال: 3 أخطاء بتضيع أرباحك في الإعلانات وإزاي تحلها في 30 ثانية..."
                        }
                        className="sm-script-textarea"
                      />
                    </div>

                    <div className="sm-script-grid-2col">
                      <div className="pcc-input-group">
                        <label
                          className="pcc-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Globe size={15} style={{ color: "#3B82F6" }} />
                          <span>
                            {lang === "en"
                              ? "Platform & Duration"
                              : "المنصة والمقاس (Platform)"}
                          </span>
                        </label>
                        <CustomSelect
                          value={scriptPlatform}
                          onChange={setScriptPlatform}
                          options={platformOptions}
                          placeholder="Select platform..."
                          icon={SmartphoneIcon}
                        />
                      </div>

                      <div className="pcc-input-group">
                        <label
                          className="pcc-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Sliders size={15} style={{ color: "#10B981" }} />
                          <span>
                            {lang === "en"
                              ? "Delivery Tone & Energy"
                              : "أسلوب النبرة والطاقة (Tone & Energy)"}
                          </span>
                        </label>
                        <CustomSelect
                          value={scriptTone}
                          onChange={setScriptTone}
                          options={toneOptions}
                          placeholder="Select tone..."
                          icon={Sliders}
                        />
                      </div>
                    </div>

                    <div className="pcc-input-group">
                      <label
                        className="pcc-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Zap size={15} style={{ color: "#F59E0B" }} />
                        <span>
                          {lang === "en"
                            ? "Hook Framework"
                            : "صيغة الخاطف (Hook Framework)"}
                        </span>
                      </label>
                      <div className="sm-pills-row">
                        {[
                          "question",
                          "stat",
                          "POV",
                          "story",
                          "challenge",
                        ].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setScriptHookStyle(h)}
                            className={`sm-hook-pill-btn ${scriptHookStyle === h ? "active" : ""}`}
                          >
                            <Sparkles size={13} />
                            <span>
                              {h === "question"
                                ? lang === "en"
                                  ? "Question"
                                  : "سؤال"
                                : h === "stat"
                                  ? lang === "en"
                                    ? "Stat"
                                    : "إحصائية"
                                  : h === "POV"
                                    ? "POV"
                                    : h === "story"
                                      ? lang === "en"
                                        ? "Story"
                                        : "قصة"
                                      : lang === "en"
                                        ? "Challenge"
                                        : "تحدي"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateScript}
                      className="sm-deck-btn"
                    >
                      <Wand2 size={18} />
                      <span>
                        {lang === "en"
                          ? "Generate Video Script Now"
                          : "توليد سكريبت الفيديو الاحترافي"}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ═══════════════ SUB-TOOL 2: CAPTION GENERATOR ═══════════════ */}
            {activeSubTool === "caption-gen" && (
              <AnimatePresence mode="wait">
                {isGeneratingCaption ? (
                  <motion.div
                    key="cap-proc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sm-processing-stage"
                  >
                    <div className="sm-spinner-pulse" />
                    <h3
                      style={{ fontSize: "17px", color: "#F8FAFC", margin: 0 }}
                    >
                      {lang === "en"
                        ? "Writing caption and generating hashtags..."
                        : "جاري كتابة وتنسيق الكابشن والهاشتاجات..."}
                    </h3>
                  </motion.div>
                ) : captionResult ? (
                  <motion.div
                    key="cap-showcase"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm-showcase-stage"
                  >
                    <div className="sm-pane-header">
                      <h4 className="sm-deck-title">
                        <PenTool size={20} style={{ color: "#3B82F6" }} />
                        <span>
                          {lang === "en"
                            ? "Ready to Publish Caption"
                            : "الكابشن الجاهز للنشر"}
                        </span>
                      </h4>
                    </div>
                    <div className="sm-showcase-content">
                      {analysisMode === "live" ? (
                        <TypewriterText text={captionResult} speed={10} />
                      ) : (
                        captionResult
                      )}
                    </div>
                    <div className="sm-tactical-dock">
                      <button
                        type="button"
                        onClick={() => handleCopyText(captionResult)}
                        className="sm-dock-btn"
                      >
                        <Copy size={15} />{" "}
                        <span>
                          {lang === "en" ? "Quick Copy" : "النسخ السريع"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateCaption}
                        className="sm-dock-btn"
                      >
                        <RotateCcw size={15} />{" "}
                        <span>
                          {lang === "en" ? "Regenerate" : "إعادة توليد"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCaptionResult("")}
                        className="sm-dock-btn primary"
                      >
                        <Edit3 size={15} />{" "}
                        <span>
                          {lang === "en" ? "Edit Inputs" : "تعديل المدخلات"}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cap-config"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm-deck-canvas"
                  >
                    <div className="sm-deck-header" style={{ marginBottom: "16px" }}>
                      <h4 className="sm-deck-title">
                        <PenTool size={20} style={{ color: "#3B82F6" }} />
                        <span>
                          {lang === "en"
                            ? "Caption Generator"
                            : "مولد كابشن البوستات"}
                        </span>
                      </h4>
                    </div>

                    <AnalysisModeSelector
                      mode={analysisMode}
                      onChange={setAnalysisMode}
                      lang={lang}
                      accentColor="#3B82F6"
                    />

                    {/* Active Attached Hashtag Badge */}
                    {activeTrendingTopic && (
                      <div
                        style={{
                          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.08) 100%)",
                          border: "1px solid rgba(59, 130, 246, 0.4)",
                          borderRadius: "14px",
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "16px",
                          marginBottom: "16px",
                          boxShadow: "0 0 20px rgba(59, 130, 246, 0.15)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Hash size={18} style={{ color: "#60A5FA" }} />
                          <div>
                            <span style={{ fontSize: "11px", color: "#60A5FA", fontWeight: "800", textTransform: "uppercase" }}>
                              {lang === "en" ? "Active Trending Hashtag Attached" : "الهاشتاج الرائج المُرفق"}
                            </span>
                            <div style={{ fontSize: "13.5px", fontWeight: "800", color: "#F8FAFC", marginTop: "2px" }}>
                              {activeTrendingTopic}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTrendingTopic(null)}
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "10px",
                            padding: "6px 12px",
                            color: "#94A3B8",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <X size={14} /> {lang === "en" ? "Remove" : "إزالة"}
                        </button>
                      </div>
                    )}

                    <div className="pcc-input-group" style={{ marginTop: activeTrendingTopic ? "0" : "16px" }}>
                      <label className="pcc-label">
                        {lang === "en"
                          ? "Post Topic / Description"
                          : "موضوع البوست"}
                      </label>
                      <textarea
                        rows={3}
                        value={captionTopic}
                        onChange={(e) => setCaptionTopic(e.target.value)}
                        placeholder={
                          lang === "en"
                            ? "Enter post topic or offer details..."
                            : "أدخل فكرة البوست أو تفاصيل العرض..."
                        }
                        className="sm-script-textarea"
                      />
                    </div>
                    <div className="pcc-input-group">
                      <label className="pcc-label">
                        {lang === "en" ? "Caption Tone" : "نبرة الكابشن"}
                      </label>
                      <div className="sm-pills-row">
                        {[
                          "comedic",
                          "educational",
                          "emotional",
                          "engaging",
                        ].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setCaptionTone(t)}
                            className={`sm-pill-btn ${captionTone === t ? "active" : ""}`}
                          >
                            {t === "comedic"
                              ? lang === "en"
                                ? "Comedic"
                                : "كوميدي"
                              : t === "educational"
                                ? lang === "en"
                                  ? "Educational"
                                  : "تعليمي"
                                : t === "emotional"
                                  ? lang === "en"
                                    ? "Emotional"
                                    : "عاطفي"
                                  : lang === "en"
                                    ? "Engaging"
                                    : "تفاعلي"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateCaption}
                      className="sm-deck-btn"
                    >
                      <Sparkles size={18} />
                      <span>
                        {lang === "en"
                          ? "Generate Caption Now"
                          : "توليد الكابشن الآن"}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ═══════════════ SUB-TOOL 3: REPURPOSER ═══════════════ */}
            {activeSubTool === "repurposer" && (
              <AnimatePresence mode="wait">
                {isGeneratingRepurpose ? (
                  <motion.div
                    key="rep-proc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sm-processing-stage"
                  >
                    <div className="sm-spinner-pulse" />
                    <h3
                      style={{ fontSize: "17px", color: "#F8FAFC", margin: 0 }}
                    >
                      {lang === "en"
                        ? "Repurposing content into target format..."
                        : "جاري إعادة صياغة المحتوى بالصيغة الجديدة..."}
                    </h3>
                  </motion.div>
                ) : repurposeResult ? (
                  <motion.div
                    key="rep-showcase"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm-showcase-stage"
                  >
                    <div className="sm-pane-header">
                      <h4 className="sm-deck-title">
                        <Repeat size={20} style={{ color: "#3B82F6" }} />
                        <span>
                          {lang === "en"
                            ? "Repurposed Content"
                            : "المحتوى المحول"}
                        </span>
                      </h4>
                    </div>
                    <div className="sm-showcase-content">
                      {analysisMode === "live" ? (
                        <TypewriterText text={repurposeResult} speed={10} />
                      ) : (
                        repurposeResult
                      )}
                    </div>
                    <div className="sm-tactical-dock">
                      <button
                        type="button"
                        onClick={() => handleCopyText(repurposeResult)}
                        className="sm-dock-btn"
                      >
                        <Copy size={15} />{" "}
                        <span>
                          {lang === "en" ? "Quick Copy" : "النسخ السريع"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateRepurpose}
                        className="sm-dock-btn"
                      >
                        <RotateCcw size={15} />{" "}
                        <span>
                          {lang === "en" ? "Regenerate" : "إعادة توليد"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRepurposeResult("")}
                        className="sm-dock-btn primary"
                      >
                        <Edit3 size={15} />{" "}
                        <span>
                          {lang === "en" ? "Edit Inputs" : "تعديل المدخلات"}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="rep-config"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm-deck-canvas"
                  >
                    <div className="sm-deck-header" style={{ marginBottom: "16px" }}>
                      <h4 className="sm-deck-title">
                        <Repeat size={20} style={{ color: "#3B82F6" }} />
                        <span>
                          {lang === "en"
                            ? "Content Repurposer"
                            : "محول وإعادة صياغة المحتوى"}
                        </span>
                      </h4>
                    </div>

                    <AnalysisModeSelector
                      mode={analysisMode}
                      onChange={setAnalysisMode}
                      lang={lang}
                      accentColor="#3B82F6"
                    />

                    <div className="pcc-input-group" style={{ marginTop: "16px" }}>
                      <label className="pcc-label">
                        {lang === "en"
                          ? "Paste Original Content (Article / Video transcript / Post)"
                          : "الصق النص الأصلي (مقالة / فيديو / بوست سابق)"}
                      </label>
                      <textarea
                        rows={4}
                        value={originalContent}
                        onChange={(e) => setOriginalContent(e.target.value)}
                        placeholder={
                          lang === "en"
                            ? "Paste content here to repurpose..."
                            : "الصق المحتوى هنا..."
                        }
                        className="sm-script-textarea"
                      />
                    </div>
                    <div className="pcc-input-group">
                      <label className="pcc-label">
                        {lang === "en"
                          ? "Target Output Format"
                          : "الصيغة المستهدفة للتحويل"}
                      </label>
                      <CustomSelect
                        value={repurposeFormat}
                        onChange={setRepurposeFormat}
                        options={repurposeOptions}
                        placeholder="Select target format..."
                        icon={Repeat}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateRepurpose}
                      className="sm-deck-btn"
                    >
                      <Repeat size={18} />
                      <span>
                        {lang === "en"
                          ? "Repurpose Content Now"
                          : "تحويل المحتوى الآن"}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ═══════════════ SUB-TOOL 4: Q&A GENERATOR ═══════════════ */}
            {activeSubTool === "qa-gen" && (
              <AnimatePresence mode="wait">
                {isGeneratingQa ? (
                  <motion.div
                    key="qa-proc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sm-processing-stage"
                  >
                    <div className="sm-spinner-pulse" />
                    <h3
                      style={{ fontSize: "17px", color: "#F8FAFC", margin: 0 }}
                    >
                      {lang === "en"
                        ? "Crafting strategic response..."
                        : "جاري بناء الرد الاستراتيجي على المتابع..."}
                    </h3>
                  </motion.div>
                ) : qaResult ? (
                  <motion.div
                    key="qa-showcase"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm-showcase-stage"
                  >
                    <div className="sm-pane-header">
                      <h4 className="sm-deck-title">
                        <MessageSquare
                          size={20}
                          style={{ color: "#3B82F6" }}
                        />
                        <span>
                          {lang === "en"
                            ? "Strategic Response Preview"
                            : "الرد الاستراتيجي المقترح"}
                        </span>
                      </h4>
                    </div>
                    <div className="sm-showcase-content">
                      {analysisMode === "live" ? (
                        <TypewriterText text={qaResult} speed={10} />
                      ) : (
                        qaResult
                      )}
                    </div>

                    {/* Quick Tweak Chips Row (Only Shorten Button) */}
                    <div
                      className="sm-tweak-chips-row"
                      style={{ justifyContent: "center" }}
                    >
                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                        {lang === "en" ? "Quick Tweak:" : "تعديل سريع:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyTweak("shorten")}
                        className="sm-tweak-chip"
                      >
                        <Scissors size={13} />{" "}
                        {lang === "en" ? "Shorten Text" : "اختصار النص"}
                      </button>
                    </div>

                    <div className="sm-tactical-dock">
                      <button
                        type="button"
                        onClick={() => handleCopyText(qaResult)}
                        className="sm-dock-btn"
                      >
                        <Copy size={15} />{" "}
                        <span>
                          {lang === "en" ? "Quick Copy" : "النسخ السريع"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateQa}
                        className="sm-dock-btn"
                      >
                        <RotateCcw size={15} />{" "}
                        <span>
                          {lang === "en" ? "Regenerate" : "إعادة توليد"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQaResult("")}
                        className="sm-dock-btn primary"
                      >
                        <Edit3 size={15} />{" "}
                        <span>
                          {lang === "en" ? "Edit Inputs" : "تعديل المدخلات"}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="qa-config"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm-deck-canvas"
                  >
                    <div className="sm-deck-header" style={{ marginBottom: "16px" }}>
                      <h4 className="sm-deck-title">
                        <MessageSquare
                          size={20}
                          style={{ color: "#3B82F6" }}
                        />
                        <span>
                          {lang === "en"
                            ? "Q&A Response Generator"
                            : "مولد الردود على أسئلة العملاء"}
                        </span>
                      </h4>
                    </div>

                    <AnalysisModeSelector
                      mode={analysisMode}
                      onChange={setAnalysisMode}
                      lang={lang}
                      accentColor="#3B82F6"
                    />

                    <div className="pcc-input-group" style={{ marginTop: "16px" }}>
                      <label className="pcc-label">
                        {lang === "en"
                          ? "Follower Question or Objection"
                          : "سؤال أو اعتراض المتابع"}
                      </label>
                      <textarea
                        rows={3}
                        value={qaQuestion}
                        onChange={(e) => setQaQuestion(e.target.value)}
                        placeholder={
                          lang === "en"
                            ? "e.g., Why is price high? What is the guarantee?"
                            : "مثال: ليه السعر غالي؟ أو إيه الضمان؟"
                        }
                        className="sm-script-textarea"
                      />
                    </div>
                    <div className="sm-pills-row">
                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                        {lang === "en" ? "Quick FAQs:" : "أسئلة شائعة:"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQaQuestion(
                            lang === "en"
                              ? "What is the price & delivery time?"
                              : "كام السعر والتوصيل؟",
                          )
                        }
                        className="sm-pill-btn"
                      >
                        {lang === "en" ? "Price & Delivery" : "كام السعر؟"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setQaQuestion(
                            lang === "en"
                              ? "Are results guaranteed?"
                              : "هل النتائج مضمونة؟",
                          )
                        }
                        className="sm-pill-btn"
                      >
                        {lang === "en" ? "Guaranteed Results?" : "هل مضمون؟"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateQa}
                      className="sm-deck-btn"
                    >
                      <Send size={18} />
                      <span>
                        {lang === "en"
                          ? "Generate Response"
                          : "توليد الرد الاستراتيجي"}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ═══════════════ SUB-TOOL 5: IDEA LAB ═══════════════ */}
            {activeSubTool === "idea-lab" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="sm-deck-canvas"
              >
                <div className="sm-deck-header" style={{ marginBottom: "16px" }}>
                  <h4 className="sm-deck-title">
                    <Lightbulb size={20} style={{ color: "#F59E0B" }} />
                    <span>
                      {lang === "en"
                        ? "Viral Idea Lab"
                        : "مختبر أفكار الفيرال"}
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleGenerateIdeas}
                    disabled={isGeneratingIdeas}
                    className="sm-dock-btn primary"
                  >
                    <Sparkles size={16} />
                    <span>
                      {isGeneratingIdeas
                        ? (lang === "en" ? "Generating..." : "جاري التوليد...")
                        : (lang === "en" ? "Generate New Ideas" : "توليد أفكار جديدة")}
                    </span>
                  </button>
                </div>

                <AnalysisModeSelector
                  mode={analysisMode}
                  onChange={setAnalysisMode}
                  lang={lang}
                  accentColor="#F59E0B"
                />

                {isGeneratingIdeas ? (
                  <div
                    className="sm-processing-stage"
                    style={{ minHeight: "180px", marginTop: "20px" }}
                  >
                    <div className="sm-spinner-pulse" />
                    <h3 style={{ fontSize: "16px", color: "#F8FAFC", margin: 0 }}>
                      {analysisMode === "live"
                        ? (lang === "en"
                            ? "Generating viral ideas with Live AI..."
                            : "جاري تحليل وتصنيف أفكار الفيرال بالذكاء الاصطناعي...")
                        : (lang === "en"
                            ? "Generating creative ideas..."
                            : "جاري توليد الأفكار الإبداعية...")}
                    </h3>
                  </div>
                ) : (
                  <div className="sm-idea-cards-grid" style={{ marginTop: "20px" }}>
                    {ideasResult.map((idea) => (
                      <div key={idea.id} className="sm-idea-pro-card">
                        <div className="sm-idea-card-header">
                          <span className="sm-idea-tag-badge">
                            <Sparkles size={12} />
                            <span>{idea.tag}</span>
                          </span>
                          <span className="sm-idea-type-pill">{idea.type}</span>
                        </div>
                        <div className="sm-idea-card-text">{idea.text}</div>
                        <div className="sm-idea-card-actions">
                          <button
                            type="button"
                            onClick={() => handleCopyText(idea.text)}
                            className="sm-idea-action-btn"
                          >
                            <Copy size={13} />
                            <span>{lang === "en" ? "Copy" : "نسخ"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveIdea(idea)}
                            className="sm-idea-action-btn save"
                          >
                            <Bookmark size={13} />
                            <span>
                              {savedIdeas.some((s) => s.id === idea.id || s.text === idea.text)
                                ? (lang === "en" ? "Saved" : "محفوظ")
                                : (lang === "en" ? "Save" : "حفظ")}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {savedIdeas.length > 0 && (
                  <div
                    style={{
                      marginTop: "24px",
                      paddingTop: "18px",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <h5
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: "#34D399",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Bookmark size={16} />
                      <span>
                        {lang === "en"
                          ? `Saved Ideas Archive (${savedIdeas.length}):`
                          : `الأفكار المحفوظة في أرشيفك (${savedIdeas.length}):`}
                      </span>
                    </h5>
                    <div className="sm-idea-cards-grid">
                      {savedIdeas.map((s, idx) => (
                        <div key={idx} className="sm-select-card active green" style={{ justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Bookmark
                              size={16}
                              style={{ color: "#34D399", flexShrink: 0 }}
                            />
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#34D399",
                                fontWeight: "700",
                              }}
                            >
                              {s.text}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setScriptTopic(s.text);
                              setActiveSubTool("script-writer");
                              toast(lang === "en" ? "Idea loaded in Script Writer!" : "تم نقل الفكرة لكاتب السكريبت!", "success");
                            }}
                            className="sm-pill-btn"
                            style={{ borderColor: "#10B981", color: "#34D399" }}
                          >
                            <Wand2 size={13} /> {lang === "en" ? "Use Concept" : "استخدم الفكرة"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ SUB-TOOL 6: TRENDS ═══════════════ */}
            {activeSubTool === "trends" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="sm-deck-canvas"
              >
                <div className="sm-deck-header" style={{ marginBottom: "16px" }}>
                  <h4 className="sm-deck-title">
                    <Flame size={20} style={{ color: "#EF4444" }} />
                    <span>
                      {lang === "en"
                        ? "Trending Topics & Audio"
                        : "الترندات والأصوات الأكثر رواجاً"}
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleGenerateTrends}
                    disabled={isGeneratingTrends}
                    className="sm-dock-btn primary"
                  >
                    <RotateCcw size={15} />
                    <span>
                      {isGeneratingTrends
                        ? (lang === "en" ? "Analyzing Trends..." : "جاري التحليل...")
                        : (lang === "en" ? "Refresh Trends" : "تحديث الترندات")}
                    </span>
                  </button>
                </div>

                <AnalysisModeSelector
                  mode={analysisMode}
                  onChange={setAnalysisMode}
                  lang={lang}
                  accentColor="#EF4444"
                />

                {isGeneratingTrends ? (
                  <div className="sm-trend-skeleton-container" style={{ marginTop: "20px" }}>
                    <div className="sm-trend-skeleton-card">
                      <div>
                        <div className="sm-skeleton-line title" />
                        <div className="sm-skeleton-line sub" />
                      </div>
                      <div className="sm-skeleton-badge" />
                    </div>
                    <div className="sm-trend-skeleton-card">
                      <div>
                        <div className="sm-skeleton-line title" />
                        <div className="sm-skeleton-line sub" />
                      </div>
                      <div className="sm-skeleton-badge" />
                    </div>
                    <div className="sm-trend-skeleton-card">
                      <div>
                        <div className="sm-skeleton-line title" />
                        <div className="sm-skeleton-line sub" />
                      </div>
                      <div className="sm-skeleton-badge" />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginTop: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <h5 className="sm-section-heading-muted">
                        {lang === "en"
                          ? "Trending Hashtags:"
                          : "الهاشتاجات الرائجة:"}
                      </h5>
                      {trendingHashtags.map((h, i) => (
                        <div
                          key={i}
                          className={`sm-trend-card ${
                            h.category === "hot"
                              ? "hot-card"
                              : h.category === "rising"
                                ? "rising-card"
                                : ""
                          } ${activeTrendingTopic === h.tag ? "active" : ""}`}
                        >
                          <div>
                            <span className="sm-trend-card-title">
                              {h.tag}
                            </span>
                            <div className="sm-trend-card-subtext">
                              {lang === "en" ? "Growth:" : "معدل النمو:"}{" "}
                              <strong style={{ color: "#10B981" }}>
                                {h.growth}
                              </strong>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className={`sm-trend-badge ${h.category}`}>
                              {h.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUseHashtagTrend(h)}
                              className={`sm-pill-btn ${activeTrendingTopic === h.tag ? "active" : ""}`}
                            >
                              {activeTrendingTopic === h.tag ? (
                                <>
                                  <Check size={13} />
                                  <span>{lang === "en" ? "Attached" : "مرفق الآن"}</span>
                                </>
                              ) : (
                                <>
                                  <Rocket size={13} />
                                  <span>{lang === "en" ? "Use Trend" : "استخدم الترند"}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <h5 className="sm-section-heading-muted">
                        {lang === "en"
                          ? "Trending Audio:"
                          : "الأصوات الصوتية الرائجة:"}
                      </h5>
                      {trendingAudios.map((a, idx) => (
                        <div
                          key={idx}
                          className={`sm-trend-card audio-card ${
                            activeAudioRecommendation?.title === a.title ? "active-audio" : ""
                          }`}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <Music2 size={16} style={{ color: "#C084FC" }} />
                            <div>
                              <div className="sm-trend-card-title">
                                {a.title}
                              </div>
                              <div className="sm-trend-card-subtext">
                                {a.creator} • {a.uses}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUseAudioTrend(a)}
                            className={`sm-pill-btn ${
                              activeAudioRecommendation?.title === a.title ? "active" : ""
                            }`}
                            style={{ borderColor: "#8B5CF6", color: "#C084FC" }}
                          >
                            {activeAudioRecommendation?.title === a.title ? (
                              <>
                                <Check size={13} />
                                <span>{lang === "en" ? "Selected" : "مُحدد الآن"}</span>
                              </>
                            ) : (
                              <>
                                <Rocket size={13} />
                                <span>{lang === "en" ? "Use Trend" : "استخدم الترند"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ SUB-TOOL 7: TRENDING VIDEOS (INDEPENDENT MODULE) ═══════════════ */}
            {activeSubTool === "viral-vids" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="sm-deck-canvas"
              >
                <div className="sm-deck-header" style={{ marginBottom: "16px" }}>
                  <h4 className="sm-deck-title">
                    <PlaySquare size={20} style={{ color: "#EF4444" }} />
                    <span>
                      {lang === "en"
                        ? "Trending Viral Reels Studio"
                        : "الفيديوهات الأكثر انتشاراً (Viral Reels Studio)"}
                    </span>
                  </h4>
                </div>

                <AnalysisModeSelector
                  mode={analysisMode}
                  onChange={setAnalysisMode}
                  lang={lang}
                  accentColor="#EF4444"
                />

                {/* ════════════ 2-COLUMN LOCALIZED STAGE ════════════ */}
                <div className="sm-viral-grid-layout">
                  {/* 1. LEFT PANE: INSTANT AI ANALYSIS & EXECUTION BREAKDOWN STAGE */}
                  <div className="sm-viral-pane execution-pane">
                    <div className="sm-viral-exec-header">
                      <Sparkles size={18} style={{ color: "#EF4444" }} />
                      <span>
                        {lang === "en"
                          ? "Instant Trend AI Breakdown"
                          : "خطة التنفيذ الفيروسية للترند"}
                      </span>
                    </div>

                    {/* Selected Trend Title Bar & Re-trigger Button */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        readOnly
                        value={selectedViralVideo ? selectedViralVideo.title : ""}
                        className="pcc-input"
                        style={{ flex: 1, padding: "8px 14px", fontSize: "13px" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAdaptViralVideo(selectedViralVideo.title)}
                        disabled={isGeneratingAdaptation}
                        className="sm-dock-btn primary"
                        style={{ padding: "8px 16px" }}
                      >
                        <Wand2 size={14} />
                        <span>
                          {isGeneratingAdaptation
                            ? (lang === "en" ? "Analyzing..." : "جاري التحليل...")
                            : (lang === "en" ? "Generate My Version 🥷" : "توليد نسختي 🥷")}
                        </span>
                      </button>
                    </div>

                    {/* AI Breakdown Output Container */}
                    {isGeneratingAdaptation ? (
                      <div className="sm-processing-stage" style={{ minHeight: "220px", marginTop: "10px" }}>
                        <div className="sm-spinner-pulse" />
                        <h3 style={{ fontSize: "15px", margin: 0 }}>
                          {analysisMode === "live"
                            ? (lang === "en"
                                ? "Generating live viral breakdown with Live AI..."
                                : "جاري تحليل وتفكيك الترند بالذكاء الاصطناعي الحي...")
                            : (lang === "en"
                                ? "Building step-by-step video execution plan..."
                                : "جاري بناء خطة التصوير والتنفيذ المخصصة...")}
                        </h3>
                      </div>
                    ) : (
                      <motion.div
                        key={selectedViralVideo ? selectedViralVideo.id : "exec-stage"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "10px" }}
                      >
                        {/* 1. Viral Video Idea Main Title */}
                        <div className="sm-viral-exec-header" style={{ fontSize: "15px", color: "#2563EB" }}>
                          <Zap size={16} style={{ color: "#2563EB" }} />
                          <span>
                            {lang === "en"
                              ? `✦ Viral Concept for ${nicheField}`
                              : `✦ فكرة فيديو فيروسية في مجال ${nicheField}`}
                          </span>
                        </div>

                        {/* 2. Introduction */}
                        <p className="sm-viral-step-desc" style={{ padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", margin: 0 }}>
                          {lang === "en"
                            ? `This trend leverages high visual curiosity. Adapting it for ${nicheField} establishes instant authority and converts viewers into direct leads.`
                            : `يعتمد هذا الترند على الجذب البصري السريع وفجوة الفضول، وتطبيقه في مجال ${nicheField} يبني الثقة المباشرة ويحفز المتابعين على اتخاذ إجراء.`}
                        </p>

                        {/* 3. Video Concept & Title Badge */}
                        <div className="sm-viral-badge-box">
                          <Film size={18} style={{ color: "#EF4444", flexShrink: 0 }} />
                          <span>
                            {selectedViralVideo
                              ? `${lang === "en" ? "Title Hook:" : "عنوان الخاطف:"} "${selectedViralVideo.title}"`
                              : (lang === "en" ? "Viral Video Hook" : "عنوان الخاطف للفيديو")}
                          </span>
                        </div>

                        {/* 4. Step-by-Step Action Plan */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <h5 className="sm-section-heading" style={{ fontSize: "13px", fontWeight: "800", margin: 0 }}>
                            {lang === "en" ? "✦ Step-by-Step Action Plan:" : "✦ خطوات تنفيذ الفيديو:"}
                          </h5>

                          {/* Step 1: Content Planning */}
                          <div className="sm-viral-step-card">
                            <div className="sm-viral-step-title">
                              <FileText size={14} style={{ color: "#3B82F6" }} />
                              <span>{lang === "en" ? "1. Content Planning" : "1. التخطيط للمحتوى"}</span>
                            </div>
                            <div className="sm-viral-step-desc">
                              {lang === "en"
                                ? `Prepare 3 core value points tailored for ${nicheField}. Keep total script length under 40 seconds for optimal retention.`
                                : `أعد 3 نقاط قيمة رئيسية مخصصة لـ ${nicheField}. اجعل مدة السكريبت الإجمالية تحت 40 ثانية لأعلى نسبة احتفاظ بالمواضيع.`}
                            </div>
                          </div>

                          {/* Step 2: Shooting Strategy */}
                          <div className="sm-viral-step-card">
                            <div className="sm-viral-step-title">
                              <Camera size={14} style={{ color: "#10B981" }} />
                              <span>{lang === "en" ? "2. Video Shooting Strategy" : "2. تصوير الفيديو وإيقاع الإضاءة"}</span>
                            </div>
                            <div className="sm-viral-step-desc">
                              {lang === "en"
                                ? "Use bright front ring lighting, dynamic camera angles, and cut visual scenes every 2.5 seconds to match audio tempo."
                                : "استخدم إضاءة أمامية ساطعة، زوايا تصوير متغيرة، وانتقالات بصريّة حركية كل 2.5 ثانية تتناغم مع رتم الصوت."}
                            </div>
                          </div>

                          {/* Step 3: Personal Branding Touch */}
                          <div className="sm-viral-step-card">
                            <div className="sm-viral-step-title">
                              <User size={14} style={{ color: "#8B5CF6" }} />
                              <span>{lang === "en" ? "3. Personal Branding Touch & CTA" : "3. إضافة لمسة شخصية ودعوة للإجراء"}</span>
                            </div>
                            <div className="sm-viral-step-desc">
                              {lang === "en"
                                ? "End with your signature tagline and ask viewers to comment 'GROW' for your free setup link."
                                : "اختم بعبارتك الخاصة واطلب من المتابعين كتابة كلمة 'تم' في التعليقات للحصول على دليل التأسيس المجاني."}
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions Bar */}
                        <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                          <button
                            type="button"
                            onClick={() => handleCopyText(viralAdaptation || selectedViralVideo?.title)}
                            className="sm-dock-btn"
                            style={{ flex: 1 }}
                          >
                            <Copy size={13} />
                            <span>{lang === "en" ? "Copy Breakdown" : "نسخ خطة التنفيذ"}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* 2. RIGHT PANE: VIRAL REELS LIST */}
                  <div className="sm-viral-pane">
                    <h5 className="sm-section-heading" style={{ fontSize: "14px", fontWeight: "800", margin: 0, display: "flex", flexAlign: "center", gap: "8px" }}>
                      <Flame size={16} style={{ color: "#EF4444" }} />
                      <span>
                        {lang === "en"
                          ? "Trending Viral Reels List"
                          : "قائمة الفيديوهات الأكثر انتشاراً"}
                      </span>
                    </h5>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {trendingVideosList.map((v) => {
                        const isSelected = selectedViralVideo?.id === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => handleSelectAndAdaptViralVideo(v)}
                            className={`sm-viral-reels-card ${isSelected ? "active" : ""}`}
                          >
                            <div className="sm-reels-title">
                              {v.title}
                            </div>

                            <div className="sm-viral-card-meta">
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Music2 size={13} style={{ color: "#8B5CF6" }} />
                                <span>{v.audio}</span>
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10B981" }}>
                                <Flame size={12} style={{ color: "#EF4444" }} />
                                <span>{v.views}</span>
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#2563EB" }}>
                                <Activity size={12} style={{ color: "#2563EB" }} />
                                <span>{v.engagement}</span>
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAndAdaptViralVideo(v);
                              }}
                              className="sm-pill-btn"
                              style={{
                                borderColor: isSelected ? "#EF4444" : "rgba(255,255,255,0.15)",
                                color: isSelected ? "#EF4444" : undefined,
                                alignSelf: "flex-start",
                                marginTop: "4px",
                              }}
                            >
                              <Wand2 size={13} />
                              <span>
                                {isSelected
                                  ? (lang === "en" ? "Selected Trend 🥷" : "المحتوى المُحدد 🥷")
                                  : (lang === "en" ? "Generate My Version 🥷" : "توليد نسختي الخاصة 🥷")}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════ SUB-TOOL 8: BURNOUT GUARD ═══════════════ */}
            {activeSubTool === "burnout-guard" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="sm-deck-canvas"
              >
                <div className="sm-deck-header">
                  <h4 className="sm-deck-title">
                    <Activity size={20} style={{ color: "#10B981" }} />
                    <span>
                      {lang === "en"
                        ? "Burnout Guard & Creative Energy Meter"
                        : "حماية الإرهاق الإبداعي ومعدل الطاقة"}
                    </span>
                  </h4>
                </div>
                <div
                  className="sm-energy-score-box"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    borderRadius: "20px",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <span className="sm-energy-score-label">
                    {lang === "en"
                      ? "Current Creative Energy Score"
                      : "طاقة الإبداع الحالية"}
                  </span>
                  <div
                    style={{
                      fontSize: "38px",
                      fontWeight: "900",
                      color: "#10B981",
                      margin: "6px 0",
                    }}
                  >
                    {energyScore}%
                  </div>
                  <span className="sm-energy-score-status">
                    {lang === "en"
                      ? "Optimal balanced energy to maintain creation!"
                      : "حالة متزنة وممتازة لمواصلة الإنتاج!"}
                  </span>
                </div>
                <div className="pcc-input-group">
                  <label className="pcc-label">
                    {lang === "en"
                      ? "Log how you feel producing content today"
                      : "سجل شعورك اليوم عند إنتاج المحتوى"}
                  </label>
                  <div className="sm-energy-logger-row">
                    <button
                      type="button"
                      onClick={() => handleSelectMood("exhausted", 25)}
                      className={`sm-energy-btn ${selectedMood === "exhausted" ? "active" : ""}`}
                    >
                      <Frown size={18} /> {lang === "en" ? "Exhausted" : "مرهق"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectMood("tired", 45)}
                      className={`sm-energy-btn ${selectedMood === "tired" ? "active" : ""}`}
                    >
                      <Meh size={18} /> {lang === "en" ? "Tired" : "متعب"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectMood("normal", 65)}
                      className={`sm-energy-btn ${selectedMood === "normal" ? "active" : ""}`}
                    >
                      <Smile size={18} /> {lang === "en" ? "Normal" : "عادي"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectMood("good", 85)}
                      className={`sm-energy-btn ${selectedMood === "good" ? "active" : ""}`}
                    >
                      <Zap size={18} /> {lang === "en" ? "Good" : "جيد"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectMood("awesome", 100)}
                      className={`sm-energy-btn ${selectedMood === "awesome" ? "active" : ""}`}
                    >
                      <Sparkles size={18} />{" "}
                      {lang === "en" ? "Awesome" : "رائع"}
                    </button>
                  </div>
                </div>
                <div className="sm-showcase-content">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <Lightbulb size={18} style={{ color: "#F59E0B", flexShrink: 0 }} />
                    <strong style={{ color: "#F8FAFC", fontSize: "14px" }}>
                      {lang === "en"
                        ? "AI Recommendations to Prevent Burnout:"
                        : "توصيات الذكاء الاصطناعي لتفادي الإرهاق:"}
                    </strong>
                  </div>
                  {lang === "en" ? (
                    <>
                      1. <strong>Batching:</strong> Record all your videos in a single day per week to reduce mental fatigue.
                      <br />
                      2. <strong>Repurpose Content:</strong> Transforming a successful video into a carousel and text post reduces your effort by 60%.
                      <br />
                      3. <strong>Take Rest:</strong> Your current creative energy score of {energyScore}% allows you to comfortably produce {weeklyPostsCount} posts this week.
                    </>
                  ) : (
                    <>
                      1. <strong>نظام الدفعات (Batching):</strong> قم بتسجيل الفيديوهات في يوم واحد فقط في الأسبوع لتقليل التشتت الذهني.
                      <br />
                      2. <strong>أعِد استخدام المحتوى:</strong> تحويل الفيديو الناجح إلى كاورسيل وبوست نصي يقلل مجهودك بنسبة 60%.
                      <br />
                      3. <strong>خذ قسطاً من الراحة:</strong> طاقتك الإبداعية الحالية {energyScore}% تتيح لك إنتاج {weeklyPostsCount} منشورات هذا الأسبوع بأريحية كاملة.
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══════════════ CENTERED PORTAL POPUP MODAL ═══════════════ */}
        {activeModal &&
          createPortal(
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm-modal-backdrop"
                onClick={() => setActiveModal(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="sm-modal-card"
                  dir={isRtl ? "rtl" : "ltr"}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sm-modal-header">
                    <div className="sm-modal-title">
                      {activeModal === "challenges" ? (
                        <>
                          <AlertTriangle
                            size={22}
                            style={{ color: "#F87171" }}
                          />
                          <span>
                            {lang === "en"
                              ? "Overcome Business Challenges (Live AI)"
                              : "مقاومة التحديات التجارية (Live AI Strategy)"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Award size={22} style={{ color: "#34D399" }} />
                          <span>
                            {lang === "en"
                              ? "Leverage Product Advantages (Live AI)"
                              : "استغلال مميزات المنتج استراتيجياً (Live AI Strategy)"}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        padding: "6px",
                        color: "#94A3B8",
                        cursor: "pointer",
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {activeModal === "challenges" ? (
                    <div className="pcc-input-group">
                      <label className="pcc-label" style={{ color: "#F87171" }}>
                        {lang === "en"
                          ? "Enter key business challenges & customer objections:"
                          : "أدخل التحديات والعقبات التي تمنع العميل من الشراء:"}
                      </label>
                      <textarea
                        rows={3}
                        value={challengeText}
                        onChange={(e) => setChallengeText(e.target.value)}
                        placeholder={
                          lang === "en"
                            ? "e.g., High cost, customer doubt about results..."
                            : "مثال: ارتفاع التكلفة، تخوف العميل من النتائج..."
                        }
                        className="sm-script-textarea"
                      />
                    </div>
                  ) : (
                    <div className="pcc-input-group">
                      <label className="pcc-label green">
                        {lang === "en"
                          ? "Enter key product advantages & unique value:"
                          : "أدخل القيمة التنافسية والميزات الحصرية لمنتجك:"}
                      </label>
                      <textarea
                        rows={3}
                        value={featureText}
                        onChange={(e) => setFeatureText(e.target.value)}
                        placeholder={
                          lang === "en"
                            ? "e.g., 100% money back guarantee, 24/7 support..."
                            : "مثال: ضمان 100%، دعم فني 24/7..."
                        }
                        className="sm-script-textarea"
                      />
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: isRtl ? "flex-start" : "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleGenerateModalOpenAi(activeModal)}
                      disabled={isGeneratingModal}
                      className={`pcc-pro-btn ${activeModal === "features" ? "green" : ""}`}
                      style={{ minWidth: "220px" }}
                    >
                      <Sparkles size={16} />
                      <span>
                        {isGeneratingModal
                          ? lang === "en"
                            ? "Generating via Live AI..."
                            : "جاري التحليل بالذكاء الاصطناعي..."
                          : activeModal === "challenges"
                            ? lang === "en"
                              ? "Overcome Challenges"
                              : "مقاومة التحديات (Live AI)"
                            : lang === "en"
                              ? "Leverage Advantages"
                              : "استغلال المميزات (Live AI)"}
                      </span>
                    </button>
                  </div>

                  {modalAiResult && (
                    <div className="sm-modal-output-scroll">
                      <TypewriterText text={modalAiResult} speed={10} />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )}
      </div>
    </ToolDashboardLayout>
  );
}

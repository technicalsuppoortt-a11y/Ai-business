import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { JOURNEY_STEPS } from "../../data/database";
import { TOOLS_24H } from "../../data/toolsData";
import Logo from "../common/Logo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Target,
  Search,
  Sparkles,
  Palette,
  Package,
  Layout,
  FileText,
  Video,
  TrendingUp,
  Megaphone,
  Send,
  Radar,
  Zap,
  Users,
  MessageSquare,
  Calculator,
  Briefcase,
  Bot,
  DollarSign,
  Share2,
  BookOpen,
  Library,
  Settings,
  PlayCircle,
  Shield,
  CheckCircle2,
  Lock,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import "./Sidebar.css";

// Lucide icon mapping for steps and tools
const STEP_ICON_MAP = {
  onboarding: Compass,
  "analysis-identity": Target,
  "niche-selection": Search,
  "brand-naming": Sparkles,
  "visual-identity": Palette,
  "product-source": Package,
  "website-construction": Layout,
  "landing-page-content": FileText,
  "content-factory": Video,
  "marketing-plan": TrendingUp,
  "ad-creative": Megaphone,
  "proposal-sniper": Send,
  "platform-radar": Radar,
  "skills-crafter": Zap,
  "skills-crafting": Zap,
  "interview-prep": Users,
  "sales-templates": MessageSquare,
  "freelance-pricing": Calculator,
  "portfolio-builder": Briefcase,
  "freelance-profile": UserCheck,
  "smart-ai-assistant": Bot,
  "profit-calculator": DollarSign,
  "social-presence": Share2,
  "social-media": Share2,
  "content-factory": Share2,
  "smart-notebook": BookOpen,
  "brand-library": Library,
  "external-tools": ExternalLink,
  settings: Settings,
  tutorial: PlayCircle,
};

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { state } = useApp();
  const { userData, logout, brandData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const lang = state.language || "ar";
  const isRtl = lang === "ar";

  const [hoveredStep, setHoveredStep] = useState(null);

  const currentPath =
    location.pathname.replace("/dashboard/", "").replace("/dashboard", "") ||
    "onboarding";

  // State to track expanded groups in AI Tools
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    const activeItem = TOOLS_24H.find(
      (step) => currentPath === step.id || currentPath === `tool/${step.id}`,
    );
    if (activeItem && activeItem.group_en) {
      initial[activeItem.group_en] = true;
    } else {
      initial["Analysis & Identity"] = true;
    }
    return initial;
  });

  useEffect(() => {
    const activeItem = TOOLS_24H.find(
      (step) => currentPath === step.id || currentPath === `tool/${step.id}`,
    );
    if (activeItem && activeItem.group_en) {
      setExpandedGroups((prev) => ({
        ...prev,
        [activeItem.group_en]: true,
      }));
    }
  }, [currentPath]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const isTrial = userData?.subscription?.type === "trial";
  const allowedTools =
    userData?.freeTrialSettings?.allowedTools ||
    brandData?.freeTrialSettings?.allowedTools ||
    [];

  const isStepLocked = (stepId) => {
    if (stepId === "onboarding") return false;
    if (!isTrial) return false;
    if (stepId === "analysis-identity") {
      return (
        !allowedTools.includes("analysis-identity") &&
        !allowedTools.includes("niche-selection") &&
        !allowedTools.includes("brand-naming") &&
        !allowedTools.includes("visual-identity")
      );
    }
    return !allowedTools.includes(stepId);
  };

  const handleNav = (stepId, isTool = false) => {
    if (isTool) {
      navigate(`/dashboard/tool/${stepId}`);
    } else {
      navigate(`/dashboard/${stepId}`);
    }
  };

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const confirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate("/auth");
    toast(
      lang === "en" ? "Logged out successfully" : "تم تسجيل الخروج بنجاح",
      "info",
    );
  };

  const renderNavItem = (step) => {
    const isDone = state.completedSteps.includes(step.id);
    const isActive =
      currentPath === step.id || currentPath === `tool/${step.id}`;
    const label =
      lang === "en" && step.label_en
        ? step.label_en
        : step.label_ar || step.label;
    const isLocked = isStepLocked(step.id);

    const IconComponent = STEP_ICON_MAP[step.id] || Sparkles;

    return (
      <div
        key={step.id}
        style={{ position: "relative" }}
        onMouseEnter={() => isCollapsed && setHoveredStep(step.id)}
        onMouseLeave={() => isCollapsed && setHoveredStep(null)}
      >
        <motion.div
          className={`nav-item ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${isLocked ? "locked" : ""} ${isCollapsed ? "collapsed-item" : ""}`}
          whileHover={{ scale: 1.02, x: isCollapsed ? 0 : isRtl ? -4 : 4 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => {
            if (isLocked) {
              toast(
                lang === "en"
                  ? "Sorry, this tool is locked during the free trial."
                  : "عذراً، هذه الأداة غير متاحة في الفترة المجانية.",
                "warning",
              );
              return;
            }
            handleNav(
              step.id,
              step.section === "tools" || step.section === "freelance",
            );
          }}
        >
          <div
            className={`nav-icon-badge ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${isLocked ? "locked" : ""}`}
          >
            {isLocked ? (
              <Lock size={14} strokeWidth={1.5} />
            ) : isDone ? (
              <CheckCircle2 size={14} strokeWidth={1.5} />
            ) : (
              <IconComponent size={14} strokeWidth={1.5} />
            )}
          </div>

          {!isCollapsed && <span className="nav-item-label">{label}</span>}
        </motion.div>

        {/* Collapsed Mode Floating Tooltip */}
        <AnimatePresence>
          {isCollapsed && hoveredStep === step.id && (
            <motion.div
              className={`sidebar-floating-tooltip ${isRtl ? "rtl" : "ltr"}`}
              initial={{ opacity: 0, x: isRtl ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRtl ? 10 : -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <span>{label}</span>
              {isLocked && (
                <span className="tooltip-status locked">
                  {lang === "en" ? "Locked" : "مغلق"}
                </span>
              )}
              {isDone && (
                <span className="tooltip-status done">
                  {lang === "en" ? "Done ✓" : "مكتمل ✓"}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const totalStepsCount = JOURNEY_STEPS.length + TOOLS_24H.length;
  const progressPct =
    Math.round((state.completedSteps.length / totalStepsCount) * 100) || 0;

  const displayName =
    userData?.ownerName ||
    userData?.brandName ||
    state.user.name ||
    (lang === "en" ? "User" : "مستخدم");
  const displayEmail = userData?.email || "";

  const navSections = [
    {
      label: lang === "en" ? "Start" : "البداية",
      items: JOURNEY_STEPS.filter((s) => s.section === "start"),
    },
    {
      label: lang === "en" ? "Foundation" : "التأسيس",
      items: JOURNEY_STEPS.filter((s) => s.section === "foundation"),
    },
    {
      label: lang === "en" ? "Growth" : "النمو",
      items: JOURNEY_STEPS.filter((s) => s.section === "growth"),
    },
    {
      label: lang === "en" ? "Scale" : "التوسع",
      items: JOURNEY_STEPS.filter((s) => s.section === "scale"),
    },
    {
      label: lang === "en" ? "AI Tools" : "أدوات ذكية (AI)",
      items: TOOLS_24H.filter((s) => s.section === "tools"),
    },
    // {
    //   label: lang === "en" ? "Freelance Tools" : "أدوات العمل الحر",
    //   items: TOOLS_24H.filter((s) => s.section === "freelance"),
    // },
  ].filter((section) => section.items.length > 0);

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Sidebar Top Logo */}
      <div className="sidebar-logo-bar">
        <Logo size={32} showText={!isCollapsed} lang={lang} />
      </div>

      {/* Progress Bar (Hidden when collapsed) */}
      {!isCollapsed && (
        <div className="sidebar-progress">
          <div className="progress-label">
            <span>{lang === "en" ? "Progress" : "تقدمك"}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => {
          const isAiTools =
            section.label.includes("AI") ||
            section.label.includes("ذكية") ||
            section.label.includes("Freelance") ||
            section.label.includes("العمل الحر");

          return (
            <div className="nav-section" key={section.label}>
              {!isCollapsed && <div className="nav-label">{section.label}</div>}
              {isCollapsed && <div className="nav-section-divider" />}

              {isAiTools
                ? (() => {
                    const groups = [];
                    section.items.forEach((step) => {
                      const groupKey = step.group_en || "Other";
                      const groupLabel =
                        lang === "en"
                          ? step.group_en || "Other"
                          : step.group_ar || "أخرى";

                      let existingGroup = groups.find(
                        (g) => g.key === groupKey,
                      );
                      if (!existingGroup) {
                        existingGroup = {
                          key: groupKey,
                          label: groupLabel,
                          items: [],
                        };
                        groups.push(existingGroup);
                      }
                      existingGroup.items.push(step);
                    });

                    return groups.map((group) => {
                      const isExpanded = !!expandedGroups[group.key];
                      return (
                        <div key={group.key} className="nav-group-container">
                          {!isCollapsed && (
                            <div
                              className={`nav-sublabel-toggle ${isExpanded ? "expanded" : ""}`}
                              onClick={() => toggleGroup(group.key)}
                            >
                              <span className="nav-sublabel-title">
                                {group.label}
                              </span>
                              <ChevronDown size={14} className="chevron-icon" />
                            </div>
                          )}
                          <div
                            className={`nav-group-items-wrapper ${isExpanded || isCollapsed ? "expanded" : ""}`}
                          >
                            <div className="nav-group-items-inner">
                              {group.items.map((step) => renderNavItem(step))}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()
                : section.items.map((step) => renderNavItem(step))}
            </div>
          );
        })}

        <div className="nav-divider" />

        {/* Tools Section */}
        <div className="nav-section">
          {!isCollapsed && (
            <div className="nav-label">{lang === "en" ? "Tools" : "أدوات"}</div>
          )}

          {renderNavItem({
            id: "brand-library",
            label_ar: "مكتبة المنتجات",
            label_en: "Product Library",
            section: "tools",
          })}

          {renderNavItem({
            id: "settings",
            label_ar: "الإعدادات",
            label_en: "Settings",
            section: "",
          })}

          {renderNavItem({
            id: "tutorial",
            label_ar: "فيديو الشرح",
            label_en: "Tutorial",
            section: "",
          })}

          {(userData?.role === "admin" || userData?.role === "superadmin") && (
            <div
              className={`nav-item admin-link ${isCollapsed ? "collapsed-item" : ""}`}
              onClick={() => navigate("/admin")}
            >
              <div className="nav-icon-badge admin-badge">
                <Shield size={16} />
              </div>
              {!isCollapsed && (
                <span>{lang === "en" ? "Admin Panel" : "لوحة الأدمن"}</span>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer / Collapse Toggle / Profile Pill & Logout */}
      <div className="sidebar-bottom-bar">
        {/* User Card & Logout Button Controls */}
        <div className="sidebar-bottom-controls">
          <div
            className={`sidebar-user-card ${isCollapsed ? "collapsed" : ""}`}
            onClick={() => navigate("/dashboard/profile")}
            title={displayName}
          >
            <div
              className="avatar"
              style={
                userData?.photoURL
                  ? { backgroundImage: `url("${userData.photoURL}")` }
                  : {}
              }
            >
              {!userData?.photoURL &&
                (displayName.charAt(0).toUpperCase() || "U")}
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <div className="name">{displayName}</div>
                <div className="email">{displayEmail}</div>
              </div>
            )}
          </div>

          <button
            className="sidebar-logout-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsLogoutModalOpen(true);
            }}
            title={lang === "en" ? "Logout" : "تسجيل الخروج"}
          >
            <LogOut size={16} color="#EF4444" />
          </button>
        </div>

        {/* Desktop Collapse Button */}
        <button
          className="sidebar-collapse-btn desktop-only"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={
            isCollapsed
              ? lang === "en"
                ? "Expand Sidebar"
                : "توسيع القائمة"
              : lang === "en"
                ? "Collapse Sidebar"
                : "طي القائمة"
          }
        >
          {isCollapsed ? (
            isRtl ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )
          ) : isRtl ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
          {!isCollapsed && (
            <span>{lang === "en" ? "Collapse Sidebar" : "طي القائمة"}</span>
          )}
        </button>
      </div>

      {/* PROFESSIONAL LOGOUT CONFIRMATION MODAL */}
      {createPortal(
        <AnimatePresence>
          {isLogoutModalOpen && (
            <div
              className="sidebar-logout-backdrop"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              <motion.div
                className="sidebar-logout-modal-box"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="logout-modal-header">
                  <div className="logout-icon-glow">
                    <LogOut size={24} color="#EF4444" />
                  </div>
                  <div>
                    <h3 className="logout-modal-title">
                      {lang === "en"
                        ? "Confirm Logout?"
                        : "تأكيد تسجيل الخروج؟"}
                    </h3>
                    <p className="logout-modal-user">
                      {displayName} ({displayEmail})
                    </p>
                  </div>
                </div>

                <p className="logout-modal-desc">
                  {lang === "en"
                    ? "Are you sure you want to log out from your account? You will need to sign in again to access your business strategy tools."
                    : "هل أنت متأكد من رغبتك في تسجيل الخروج؟ ستحتاج إلى إعادة تسجيل الدخول لاحقاً للوصول إلى أدوات لوحة التحكم."}
                </p>

                <div className="logout-modal-actions">
                  <button
                    className="logout-cancel-btn"
                    onClick={() => setIsLogoutModalOpen(false)}
                  >
                    {lang === "en" ? "Cancel" : "إلغاء"}
                  </button>
                  <button
                    className="logout-confirm-btn"
                    onClick={confirmLogout}
                  >
                    <LogOut size={16} />
                    <span>
                      {lang === "en" ? "Logout Account" : "تسجيل الخروج"}
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </aside>
  );
}

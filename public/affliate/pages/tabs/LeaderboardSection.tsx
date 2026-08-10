// LeaderboardSection.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useAppState, computeUserLevel, AffiliateLevel } from "../../context/StateContext";

import { useAuth } from "../../context/AuthContext";
import { db, firestore } from "../../config/firebase";
import { LevelIcon } from "../../components/LevelIcon";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  TrendingUp,
  TrendingDown,
  Search,
  Award,
  Crown,
  Star,
  Medal,
  Users,
  Shield,
  Lock,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";

// ---------- Animation Variants ----------
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

const podiumVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 15,
      staggerChildren: 0.15,
    },
  },
} as const;

const podiumItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
} as const;

export default function LeaderboardSection() {
  const { state, fmtMoney } = useAppState();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const [searchQuery, setSearchQuery] = useState("");

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // Real-time Firestore subscription to users collection
  useEffect(() => {
    const usersRef = firestore.collection(db, "users");
    const unsub = firestore.onSnapshot(usersRef, (snap: any) => {
      const list = snap.docs.map((d: any) => {
        const data = d.data();
        return {
          id: d.id,
          uid: d.id,
          name: data.name || data.email?.split("@")[0] || "Partner",
          xp: Number(data.xp) || 0,
          sales: Number(data.sales) || 0,
          lessons: Number(data.lessons) || 0,
          level: data.level || "Silver",
          streak: Number(data.streak) || 0,
          trend: Number(data.trend) || 0,
          revenue: Number(data.revenue) || 0,
          role: data.role || "user",
          isMe: d.id === user?.uid,
        };
      });
      setUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Dynamic affiliate levels from state
  const affiliateLevels = useMemo(
    () =>
      [...(state.affiliateLevels || [])].sort(
        (a: AffiliateLevel, b: AffiliateLevel) => a.order - b.order,
      ),
    [state.affiliateLevels],
  );

  // Process users to have dynamic levels
  const processedUsers = useMemo(() => {
    return users.map((u) => {
      const dynamicLvl = computeUserLevel(u.revenue || 0, affiliateLevels);
      return {
        ...u,
        levelObj: dynamicLvl,
        level: dynamicLvl ? dynamicLvl.id : u.level, // Update level property to dynamic ID for filters
      };
    });
  }, [users, affiliateLevels]);

  // Sort partners by XP descending, filtering out admin users who aren't participating (have 0 XP)
  const sortedPartners = [...processedUsers]
    .filter((u) => u.role !== "admin" || u.xp > 0)
    .sort((a, b) => b.xp - a.xp);

  // Find current user's rank
  const currentUser = sortedPartners.find((p) => p.isMe);
  const currentUserRank = currentUser ? sortedPartners.indexOf(currentUser) + 1 : null;

  // Filter partners
  const filteredPartners = sortedPartners.filter((p) => {
    const matchesLevel = levelFilter === "all" || p.level === levelFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Podium positions (Top 3)
  const top1 = sortedPartners[0];
  const top2 = sortedPartners[1];
  const top3 = sortedPartners[2];

  // Dynamic badge icon — renders the LevelIcon using the icon string
  const getBadgeIcon = (levelObj: AffiliateLevel | null, fallbackLevelName: string) => {
    if (levelObj)
      return (
        <LevelIcon name={levelObj.icon} className="h-4 w-4" style={{ color: levelObj.color }} />
      );
    return <LevelIcon name="Shield" className="h-4 w-4 text-slate-500" />;
  };

  // Dynamic level color — uses the level's hex color from state
  const getLevelColor = (levelObj: AffiliateLevel | null) => {
    if (levelObj) return "border"; // dynamic color handled by inline style
    return "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400";
  };

  const getLevelLabel = (levelObj: AffiliateLevel | null, fallbackLevelName: string) => {
    if (levelObj)
      return isRtl
        ? (levelObj.name as any)?.ar || levelObj.name
        : (levelObj.name as any)?.en || levelObj.name;
    return fallbackLevelName;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ChevronUp className="w-3.5 h-3.5 text-emerald-500" />;
    } else if (trend < 0) {
      return <ChevronDown className="w-3.5 h-3.5 text-red-500" />;
    }
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getTrendLabel = (trend: number) => {
    if (trend > 0) {
      return t(`▲ ${trend}`, `▲ ${trend}`);
    } else if (trend < 0) {
      return t(`▼ ${Math.abs(trend)}`, `▼ ${Math.abs(trend)}`);
    }
    return t("– ثابت", "– Stable");
  };

  const getTrendBadge = (trend: number) => {
    if (trend > 0) {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    } else if (trend < 0) {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
    return "bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400";
  };

  // Calculate XP progress for a partner using dynamic affiliate level thresholds
  const getLevelProgress = (revenueUSD: number, levelObj: AffiliateLevel | null) => {
    if (!levelObj) return 0;
    const sorted = [...affiliateLevels].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((l) => l.id === levelObj.id);
    const nextLvl = idx > -1 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
    if (!nextLvl) return 100;
    const range = nextLvl.minSalesUSD - levelObj.minSalesUSD;
    if (range <= 0) return 100;
    const progress = ((revenueUSD - levelObj.minSalesUSD) / range) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  };

  const getNextLevelLabel = (levelObj: AffiliateLevel | null) => {
    if (!levelObj) return t("أعلى مستوى 🏆", "Top level 🏆");
    const sorted = [...affiliateLevels].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((l) => l.id === levelObj.id);
    const nextLvl = idx > -1 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
    if (nextLvl)
      return t(
        `للوصول: ${(nextLvl.name as any)?.ar || nextLvl.name} ${nextLvl.icon}`,
        `to reach: ${(nextLvl.name as any)?.en || nextLvl.name} ${nextLvl.icon}`,
      );
    return t("أعلى مستوى 🏆", "Top level 🏆");
  };

  const getRemainingAmount = (revenueUSD: number, levelObj: AffiliateLevel | null) => {
    if (!levelObj) return 0;
    const sorted = [...affiliateLevels].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((l) => l.id === levelObj.id);
    const nextLvl = idx > -1 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
    if (nextLvl) return Math.max(0, nextLvl.minSalesUSD - revenueUSD);
    return 0;
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px] gap-4"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="w-10 h-10 border-4 border-purple-650 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-550 dark:text-slate-400">
          {t("جاري تحميل بيانات لوحة الصدارة...", "Loading leaderboard data...")}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>{t("لوحة الصدارة", "Leaderboard")}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("ترتيب الشركاء", "Partner rankings")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Current Rank Chip - Like HTML */}
          {currentUserRank && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t("مركزك الحالي", "Your Current Rank")}
              </span>
              <span className="font-mono font-bold text-amber-500 dark:text-amber-400 text-lg">
                #{currentUserRank}
              </span>
              {currentUser && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTrendBadge(currentUser.trend)}`}
                >
                  {getTrendLabel(currentUser.trend)}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {sortedPartners.length}
            </span>
            <span className="text-xs text-amber-500 dark:text-amber-400">
              {t("شريك", "partners")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Info Card - Like HTML */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-xl p-4 border border-slate-700/50 flex items-center gap-3"
      >
        <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="text-sm text-slate-300">
          {t(
            " الترتيب ده بيتحدث تلقائيًا من أداء كل شريك الحقيقي جوه النظام — مفيش تعديل يدوي",
            " This ranking updates automatically from each partner's real performance in the system — no manual editing",
          )}
        </span>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm"
      >
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("🔍 ابحث عن شريك...", "🔍 Search partner...")}
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 flex-wrap gap-0.5">
          <button
            onClick={() => setLevelFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              levelFilter === "all"
                ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            {t("الكل", "All")}
          </button>
          {affiliateLevels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setLevelFilter(lvl.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                levelFilter === lvl.id
                  ? "bg-white dark:bg-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
              style={levelFilter === lvl.id ? { color: lvl.color } : undefined}
            >
              <LevelIcon name={lvl.icon} className="w-3.5 h-3.5" />
              {isRtl ? (lvl.name as any)?.ar || lvl.name : (lvl.name as any)?.en || lvl.name}
            </button>
          ))}
        </div>

        {(searchQuery || levelFilter !== "all") && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            {t("فلاتر نشطة", "Active filters")}
          </div>
        )}
      </motion.div>

      {/* Podium - Top 3 with Animation */}
      {searchQuery === "" && levelFilter === "all" && sortedPartners.length >= 3 && (
        <motion.div
          variants={podiumVariants}
          initial="hidden"
          animate="show"
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm overflow-hidden"
        >
          <div className="flex items-end justify-center gap-4 md:gap-8 pt-4 pb-2">
            {/* 2nd Place */}
            {top2 && (
              <motion.div
                variants={podiumItemVariants}
                className="flex flex-col items-center order-1"
              >
                <div className="relative group">
                  <motion.div
                    className="absolute inset-0 bg-slate-300/20 rounded-full blur-xl group-hover:scale-110 transition duration-300"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-xl shadow-lg relative">
                    {top2.name.slice(0, 2).toUpperCase()}
                    <div className="absolute -top-2 -right-2 bg-slate-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-slate-900">
                      2
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-sm">
                    <Medal className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {top2.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {getLevelLabel(top2.levelObj, top2.level)}
                  </div>
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {top2.xp} XP
                  </div>
                </div>
                <motion.div
                  className="w-20 h-16 mt-2 bg-gradient-to-t from-slate-200 to-transparent dark:from-slate-800/50 rounded-t-lg"
                  animate={{ height: [16, 18, 16] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            )}

            {/* 1st Place */}
            {top1 && (
              <motion.div
                variants={podiumItemVariants}
                className="flex flex-col items-center order-2 -mt-4 z-10"
              >
                <div className="relative group">
                  <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="w-8 h-8 text-amber-500 fill-amber-400" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-amber-500/30 relative">
                    {top1.name.slice(0, 2).toUpperCase()}
                    <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold text-white border-2 border-white dark:border-slate-900">
                      1
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-1 justify-center">
                    {top1.name}
                    {top1.isMe && (
                      <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded">
                        {t("أنت", "You")}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {getLevelLabel(top1.levelObj, top1.level)}
                  </div>
                  <div className="text-sm font-bold text-emerald-500 dark:text-emerald-400 mt-1">
                    {top1.xp} XP
                  </div>
                </div>
                <motion.div
                  className="w-24 h-20 mt-2 bg-gradient-to-t from-amber-400/20 to-transparent dark:from-amber-500/10 rounded-t-lg"
                  animate={{ height: [20, 22, 20] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <motion.div
                variants={podiumItemVariants}
                className="flex flex-col items-center order-3"
              >
                <div className="relative group">
                  <motion.div
                    className="absolute inset-0 bg-amber-700/15 rounded-full blur-lg group-hover:scale-110 transition duration-300"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                  />
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-xl shadow-lg relative">
                    {top3.name.slice(0, 2).toUpperCase()}
                    <div className="absolute -top-2 -right-2 bg-amber-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-slate-900">
                      3
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-sm">
                    <Medal className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {top3.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {getLevelLabel(top3.levelObj, top3.level)}
                  </div>
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {top3.xp} XP
                  </div>
                </div>
                <motion.div
                  className="w-20 h-12 mt-2 bg-gradient-to-t from-amber-700/20 to-transparent dark:from-amber-700/10 rounded-t-lg"
                  animate={{ height: [12, 14, 12] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Leaderboard Table - Like HTML with Progress Bar and Streak */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الترتيب", "Rank")}
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الشريك", "Partner")}
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("المستوى", "Level")}
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("التقدم", "Progress")}
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الخبرة", "XP")}
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("العمولة", "Commission")}
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("المبيعات", "Sales")}
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t("الدروس", "Lessons")}
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full">
                          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {t("لا يوجد شركاء مطابقين", "No partners match")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner, index) => {
                    const globalIndex = sortedPartners.findIndex((p) => p.id === partner.id) + 1;
                    const medalEmoji =
                      globalIndex === 1
                        ? "🥇"
                        : globalIndex === 2
                          ? "🥈"
                          : globalIndex === 3
                            ? "🥉"
                            : `#${globalIndex}`;

                    const progress = getLevelProgress(partner.revenue, partner.levelObj);
                    const remaining = getRemainingAmount(partner.revenue, partner.levelObj);
                    const nextLabel = getNextLevelLabel(partner.levelObj);

                    return (
                      <motion.tr
                        key={partner.id}
                        initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent dark:hover:from-purple-900/10 dark:hover:to-transparent transition-all duration-200 group ${
                          partner.isMe
                            ? "bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {medalEmoji}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                globalIndex === 1
                                  ? "bg-gradient-to-br from-amber-400 to-amber-500"
                                  : globalIndex === 2
                                    ? "bg-gradient-to-br from-slate-300 to-slate-400"
                                    : globalIndex === 3
                                      ? "bg-gradient-to-br from-amber-600 to-amber-700"
                                      : "bg-purple-600"
                              }`}
                            >
                              {partner.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {partner.name}
                              {partner.isMe && (
                                <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  {t("أنت", "You")}
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${getLevelColor(partner.levelObj)}`}
                            style={
                              partner.levelObj
                                ? {
                                    backgroundColor: `${partner.levelObj.color}15`,
                                    color: partner.levelObj.color,
                                    borderColor: `${partner.levelObj.color}30`,
                                  }
                                : undefined
                            }
                          >
                            {getBadgeIcon(partner.levelObj, partner.level)}
                            {getLevelLabel(partner.levelObj, partner.level)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex flex-col items-center gap-1 min-w-[120px]">
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, delay: index * 0.05 }}
                                className={`h-full rounded-full ${
                                  partner.level === "Elite"
                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                    : partner.level === "Gold"
                                      ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                      : "bg-gradient-to-r from-slate-400 to-slate-500"
                                }`}
                              />
                            </div>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400">
                              {remaining > 0
                                ? t(`${remaining} XP ${nextLabel}`, `${remaining} XP ${nextLabel}`)
                                : t("أعلى مستوى 🏆", "Top level 🏆")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                            {partner.xp} XP
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            {fmtMoney(partner.revenue)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300">
                            {partner.sales}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                            {partner.lessons}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredPartners.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                `عرض ${filteredPartners.length} شريك`,
                `Showing ${filteredPartners.length} partners`,
              )}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t("تم التحديث", "Updated")}{" "}
              {new Date().toLocaleTimeString(isRtl ? "ar-EG" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </motion.div>

      {/* Footer Note */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400"
      >
        <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          {t(
            "الترتيب ده بيتحدث تلقائيًا من أداء كل شريك الحقيقي جوه النظام — مفيش تعديل يدوي",
            " This ranking updates automatically from each partner's real performance in the system — no manual editing",
          )}
        </span>
      </motion.div>
    </motion.div>
  );
}

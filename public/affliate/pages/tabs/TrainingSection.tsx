// TrainingSection.tsx - Complete Partner Academy with fixed switch
import React, { useState } from "react";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { db, firestore } from "../../config/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Circle,
  Video,
  BookOpen,
  Sparkles,
  Trophy,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Phone,
  Award,
  Star,
  Crown,
  Zap,
  Target,
  Brain,
  Users,
  Rocket,
  Flame,
  Check,
  X,
  Lock,
  Unlock,
  BarChart3,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
  Settings,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
} as const;

// ---------- FIXED TOGGLE SWITCH (matches Booking page implementation) ----------
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  subLabel?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, subLabel, disabled }) => {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div>
        {label && (
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
        )}
        {subLabel && <div className="text-xs text-slate-400">{subLabel}</div>}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        dir="ltr"
        className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-200 focus:outline-none ${
          checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

// ---------- Small Toggle Switch for item completion (matches Booking page) ----------
interface SmallToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const SmallToggleSwitch: React.FC<SmallToggleSwitchProps> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      dir="ltr"
      className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 focus:outline-none ${
        checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
};

// Helper to generate Google Drive embed URL
const getDriveEmbedUrl = (url: string) => {
  if (!url) return "";
  const matchD = url.match(/\/file\/d\/([\w-]+)/);
  if (matchD) return `https://drive.google.com/file/d/${matchD[1]}/preview`;
  const matchId = url.match(/[?&]id=([\w-]+)/);
  if (matchId) return `https://drive.google.com/file/d/${matchId[1]}/preview`;
  return url;
};


export default function TrainingSection() {
  const { state, updateState } = useAppState();
  const { isAdmin, user, userProfile, users } = useAuth();
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<number[]>([0, 1, 2]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    phaseId: number;
    itemId: number;
    title: string;
  } | null>(null);
  const [itemFormData, setItemFormData] = useState({
    title: "",
    videoUrl: "",
    completed: false,
  });

  // Admin and SubTab state
  const [activeSubTab, setActiveSubTab] = useState<"content" | "analytics">("content");
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<any | null>(null);
  const [phaseFormData, setPhaseFormData] = useState({
    title: "",
    phaseNum: 0,
    unit: "lessons", // "lessons" | "scripts" | "calls"
  });
  const [isPhaseDeleteConfirmOpen, setIsPhaseDeleteConfirmOpen] = useState(false);
  const [phaseDeleteTarget, setPhaseDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isDeleteAllPhasesConfirmOpen, setIsDeleteAllPhasesConfirmOpen] = useState(false);

  const isRtl = state.settings.language === "ar";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  // Translation helpers
  const translatePhaseTitle = (title: string) => {
    if (isRtl) return title;
    const map: Record<string, string> = {
      Welcome: "Welcome & Onboarding",
      "System Setup": "System Configuration",
      "Product Mastery": "Product Mastery",
      "Sales Psychology": "Sales Psychology & Mindset",
      "Sales Process": "Sales Process Framework",
      Scripts: "Scripts Library",
      "Real Calls": "Real Call Analysis",
      CRM: "CRM Mastery",
      Marketing: "Marketing Strategies",
      Growth: "Growth & Scaling",
      Graduation: "Graduation & Certification",
    };
    return map[title] || title;
  };

  const translateUnit = (unit: string) => {
    if (isRtl) return unit;
    const map: Record<string, string> = {
      lessons: "Lessons",
      scripts: "Scripts",
      calls: "Calls",
    };
    return map[unit] || unit;
  };

  // Calculate stats
  const allItems = state.academyPhases.flatMap((p) => p.items.map((i) => ({ ...i, phaseId: p.id })));
  const totalItems = allItems.length;
  const completedItems = allItems.filter((i) =>
    userProfile?.completedLessons?.includes(`${i.phaseId}_${i.id}`)
  ).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const togglePhase = (phaseId: number) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId) ? prev.filter((id) => id !== phaseId) : [...prev, phaseId],
    );
  };

  const handleToggleLesson = async (phaseId: number, itemId: number) => {
    const phase = state.academyPhases.find((p) => p.id === phaseId);
    const item = phase?.items.find((i) => i.id === itemId);
    if (!item) return;

    const lessonKey = `${phaseId}_${itemId}`;
    const isCompleted = userProfile?.completedLessons?.includes(lessonKey) || false;
    const newCompleted = !isCompleted;

    try {
      const userRef = firestore.doc(db, "users", user?.uid || "");
      const lessonProgressRef = firestore.doc(db, "users", user?.uid || "", "academy_progress", lessonKey);
      const { arrayUnion, arrayRemove } = await import("firebase/firestore");
      
      if (newCompleted) {
        // Write to subcollection (Partner write permission target)
        await firestore.setDoc(lessonProgressRef, {
          completed: true,
          completedAt: Date.now()
        });

        // Also update parent document for metrics and compatibility
        await firestore.updateDoc(userRef, {
          completedLessons: arrayUnion(lessonKey),
          lessons: firestore.increment(1),
          xp: firestore.increment(50),
        });
        toast.success(t("تهانينا! حصلت على +50 نقطة خبرة لإتمام الدرس 🎉", "Congratulations! You earned +50 XP for completing the lesson 🎉"));
      } else {
        // Remove from subcollection
        await firestore.deleteDoc(lessonProgressRef);

        // Also update parent document
        await firestore.updateDoc(userRef, {
          completedLessons: arrayRemove(lessonKey),
          lessons: firestore.increment(-1),
          xp: firestore.increment(-50),
        });
        toast.info(t("تم إلغاء إتمام الدرس وخصم 50 نقطة خبرة", "Lesson marked incomplete, 50 XP deducted"));
      }
    } catch (err) {
      console.error("Error updating user XP/lessons metrics:", err);
      toast.error(t("حدث خطأ أثناء تحديث حالة الدرس", "Error updating lesson status"));
    }
  };

  // ---------- Phase CRUD Operations (Admin Only) ----------
  const openAddPhaseModal = () => {
    if (!isAdmin) return;
    setEditingPhase(null);
    const nextPhaseNum = state.academyPhases.length > 0
      ? Math.max(...state.academyPhases.map(p => p.phaseNum)) + 1
      : 1;
    setPhaseFormData({
      title: "",
      phaseNum: nextPhaseNum,
      unit: "lessons",
    });
    setIsPhaseModalOpen(true);
  };

  const openEditPhaseModal = (phase: any) => {
    if (!isAdmin) return;
    setEditingPhase(phase);
    setPhaseFormData({
      title: phase.title,
      phaseNum: phase.phaseNum,
      unit: phase.unit || "lessons",
    });
    setIsPhaseModalOpen(true);
  };

  const handleSavePhase = async () => {
    if (!isAdmin) {
      toast.error(t("غير مسموح للشركاء بتعديل المراحل", "Partners are not allowed to edit phases"));
      return;
    }
    if (!phaseFormData.title.trim()) {
      toast.error(t("يرجى إدخال عنوان المرحلة", "Please enter phase title"));
      return;
    }
    try {
      const targetId = editingPhase ? editingPhase.id : Date.now();
      const payload = {
        id: targetId,
        title: phaseFormData.title.trim(),
        phaseNum: Number(phaseFormData.phaseNum),
        unit: phaseFormData.unit,
        items: editingPhase ? editingPhase.items : [],
      };
      await firestore.setDoc(firestore.doc(db, "academy_courses", `phase-${targetId}`), payload);
      toast.success(editingPhase ? t("تم تحديث المرحلة بنجاح", "Phase updated successfully") : t("تم إضافة المرحلة بنجاح", "Phase added successfully"));
      
      if (!editingPhase) {
        try {
          const partnersList = (users || []).filter((u: any) => u.role !== "admin");
          const promises = partnersList.map((partner) => {
            return firestore.addDoc(firestore.collection(db, "notifications"), {
              userId: partner.uid,
              title: isRtl ? `مرحلة تدريبية جديدة: ${payload.title}` : `New Training Phase: ${payload.title}`,
              desc: isRtl 
                ? `تمت إضافة مرحلة جديدة "${payload.title}" في الأكاديمية.` 
                : `A new phase "${payload.title}" has been added to the Academy.`,
              icon: "GraduationCap",
              read: false,
              isRead: false,
              createdAt: Date.now(),
              time: isRtl ? "الآن" : "Just now"
            });
          });
          await Promise.all(promises);
        } catch (notifErr) {
          console.error("Failed to send new phase notifications:", notifErr);
        }
      }

      setIsPhaseModalOpen(false);
      setEditingPhase(null);
    } catch (err) {
      console.error("Error saving phase:", err);
      toast.error(t("فشل في حفظ المرحلة", "Failed to save phase"));
    }
  };

  const requestDeletePhase = (phaseId: number, title: string) => {
    setPhaseDeleteTarget({ id: phaseId, title });
    setIsPhaseDeleteConfirmOpen(true);
  };

  const confirmDeletePhase = async () => {
    if (!isAdmin) {
      toast.error(t("غير مسموح للشركاء بحذف المراحل", "Partners are not allowed to delete phases"));
      return;
    }
    if (!phaseDeleteTarget) return;
    try {
      await firestore.deleteDoc(firestore.doc(db, "academy_courses", `phase-${phaseDeleteTarget.id}`));
      toast.success(t("تم حذف المرحلة بنجاح", "Phase deleted successfully"));
    } catch (err) {
      console.error("Error deleting phase:", err);
      toast.error(t("فشل في حذف المرحلة", "Failed to delete phase"));
    }
    setIsPhaseDeleteConfirmOpen(false);
    setPhaseDeleteTarget(null);
  };

  const requestDeleteAllPhases = () => {
    if (!isAdmin) {
      toast.error(t("غير مسموح للشركاء بحذف المراحل", "Partners are not allowed to delete phases"));
      return;
    }
    setIsDeleteAllPhasesConfirmOpen(true);
  };

  const confirmDeleteAllPhases = async () => {
    if (!isAdmin) {
      toast.error(t("غير مسموح للشركاء بحذف المراحل", "Partners are not allowed to delete phases"));
      return;
    }
    try {
      const promises = state.academyPhases.map((phase) =>
        firestore.deleteDoc(firestore.doc(db, "academy_courses", `phase-${phase.id}`))
      );
      await Promise.all(promises);
      toast.success(t("تم حذف جميع المراحل بنجاح", "All phases deleted successfully"));
    } catch (err) {
      console.error("Error deleting all phases:", err);
      toast.error(t("فشل في حذف المراحل", "Failed to delete phases"));
    }
    setIsDeleteAllPhasesConfirmOpen(false);
  };

  const handleMovePhase = async (phaseId: number, direction: "up" | "down") => {
    if (!isAdmin) return;
    const phases = [...state.academyPhases].sort((a, b) => a.phaseNum - b.phaseNum);
    const currentIndex = phases.findIndex((p) => p.id === phaseId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= phases.length) return;

    const currentPhase = phases[currentIndex];
    const targetPhase = phases[targetIndex];

    const tempNum = currentPhase.phaseNum;

    try {
      await Promise.all([
        firestore.updateDoc(firestore.doc(db, "academy_courses", `phase-${currentPhase.id}`), {
          phaseNum: targetPhase.phaseNum,
        }),
        firestore.updateDoc(firestore.doc(db, "academy_courses", `phase-${targetPhase.id}`), {
          phaseNum: tempNum,
        }),
      ]);
      toast.success(t("تم تغيير ترتيب المرحلة", "Phase reordered successfully"));
    } catch (err) {
      console.error("Error reordering phases:", err);
      toast.error(t("فشل في إعادة ترتيب المراحل", "Failed to reorder phases"));
    }
  };

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoSource, setVideoSource] = useState<"file" | "youtube" | "drive">("file");

  // ---------- Item CRUD Operations ----------
  const openAddItemModal = (phaseId: number) => {
    if (!isAdmin) {
      toast.error(t("غير مسموح للشركاء بإضافة عناصر جديدة", "Partners are not allowed to add new items"));
      return;
    }
    setEditingPhaseId(phaseId);
    setEditingItemId(null);
    setVideoFile(null);
    setUploadProgress(null);
    setIsUploading(false);
    setVideoSource("file");
    setItemFormData({ title: "", videoUrl: "", completed: false });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (phaseId: number, itemId: number) => {
    if (!isAdmin) {
      toast.error(t("غير مسموح للشركاء بتعديل العناصر", "Partners are not allowed to edit items"));
      return;
    }
    const phase = state.academyPhases.find((p) => p.id === phaseId);
    if (!phase) return;
    const item = phase.items.find((i) => i.id === itemId);
    if (!item) return;
    setEditingPhaseId(phaseId);
    setEditingItemId(itemId);
    setVideoFile(null);
    setUploadProgress(null);
    setIsUploading(false);
    const isYoutube = item.videoUrl && (item.videoUrl.includes("youtube.com") || item.videoUrl.includes("youtu.be") || item.videoUrl.includes("vimeo.com"));
    const isDrive = item.videoUrl && item.videoUrl.includes("drive.google.com");
    if (isYoutube) {
      setVideoSource("youtube");
    } else if (isDrive) {
      setVideoSource("drive");
    } else {
      setVideoSource("file");
    }
    setItemFormData({
      title: item.title,
      videoUrl: item.videoUrl || "",
      completed: item.completed,
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!isAdmin) {
      toast.error(t("غير مسموح للشركاء بحفظ العناصر", "Partners are not allowed to save items"));
      return;
    }
    if (!itemFormData.title.trim()) {
      toast.error(t("أدخل عنوان العنصر", "Enter item title"));
      return;
    }

    let finalVideoUrl = itemFormData.videoUrl;

    if (videoFile && videoSource === "file") {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const { mediaStorage, isFirebaseMocked } = await import("../../config/firebase");
        if (mediaStorage && !isFirebaseMocked) {
          const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
          const storageRef = ref(mediaStorage, `academy_videos/${Date.now()}_${videoFile.name}`);
          const uploadTask = uploadBytesResumable(storageRef, videoFile);

          await new Promise<void>((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setUploadProgress(progress);
              },
              (error) => {
                console.error("Firebase upload error:", error);
                reject(error);
              },
              async () => {
                try {
                  finalVideoUrl = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve();
                } catch (err) {
                  reject(err);
                }
              }
            );
          });
        } else {
          // Simulated professional upload progress
          const simulatedSteps = [12, 28, 45, 63, 81, 95, 100];
          for (const step of simulatedSteps) {
            await new Promise((r) => setTimeout(r, 200));
            setUploadProgress(step);
          }
          // Stock professional videos for simulated upload to prevent broken URLs on page refresh
          const mockVideos = [
            "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-laptop-49035-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-animation-of-a-logo-with-a-blue-and-purple-gradient-background-50266-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4",
          ];
          const randomIdx = Math.floor(Math.random() * mockVideos.length);
          finalVideoUrl = mockVideos[randomIdx];
        }
      } catch (error) {
        toast.error(t("فشل تحميل الفيديو", "Failed to upload video"));
        setIsUploading(false);
        setUploadProgress(null);
        return;
      }
      setIsUploading(false);
      setUploadProgress(null);
    }

    try {
      const phase = state.academyPhases.find((p) => p.id === editingPhaseId);
      if (!phase) return;

      let updatedItems = [...phase.items];
      if (editingItemId !== null) {
        updatedItems = updatedItems.map((item) =>
          item.id === editingItemId
            ? { ...item, title: itemFormData.title.trim(), videoUrl: finalVideoUrl.trim(), completed: itemFormData.completed }
            : item
        );
      } else {
        const maxId = Math.max(0, ...phase.items.map((i) => i.id));
        updatedItems.push({
          id: maxId + 1,
          title: itemFormData.title.trim(),
          videoUrl: finalVideoUrl.trim(),
          completed: itemFormData.completed,
        });
      }

      const updatedPhase = {
        ...phase,
        items: updatedItems,
      };

      await firestore.setDoc(firestore.doc(db, "academy_courses", `phase-${editingPhaseId}`), updatedPhase);
      
      if (editingItemId !== null) {
        toast.success(t("تم تحديث العنصر بنجاح", "Item updated successfully"));
      } else {
        toast.success(t("تم إضافة العنصر بنجاح", "Item added successfully"));
        
        try {
          const partnersList = (users || []).filter((u: any) => u.role !== "admin");
          const promises = partnersList.map((partner) => {
            return firestore.addDoc(firestore.collection(db, "notifications"), {
              userId: partner.uid,
              title: isRtl ? `درس جديد: ${itemFormData.title}` : `New Lesson: ${itemFormData.title}`,
              desc: isRtl 
                ? `تمت إضافة درس جديد "${itemFormData.title}" في المرحلة "${phase.title}".` 
                : `A new lesson "${itemFormData.title}" has been added to phase "${phase.title}".`,
              icon: "BookOpen",
              read: false,
              isRead: false,
              createdAt: Date.now(),
              time: isRtl ? "الآن" : "Just now"
            });
          });
          await Promise.all(promises);
        } catch (notifErr) {
          console.error("Failed to send new lesson notifications:", notifErr);
        }
      }
    } catch (err) {
      console.error("Error saving academy item:", err);
      toast.error(t("فشل في حفظ العنصر", "Failed to save item"));
    }

    setIsItemModalOpen(false);
    setEditingPhaseId(null);
    setEditingItemId(null);
    setVideoFile(null);
    setItemFormData({ title: "", videoUrl: "", completed: false });
  };

  const requestDeleteItem = (phaseId: number, itemId: number, title: string) => {
    setDeleteTarget({ phaseId, itemId, title });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!isAdmin) {
      toast.error(t("غير مسموح للشركاء بحذف العناصر", "Partners are not allowed to delete items"));
      return;
    }
    if (!deleteTarget) return;

    try {
      const phase = state.academyPhases.find((p) => p.id === deleteTarget.phaseId);
      if (phase) {
        const updatedItems = phase.items.filter((i) => i.id !== deleteTarget.itemId);
        const updatedPhase = {
          ...phase,
          items: updatedItems,
        };
        await firestore.setDoc(firestore.doc(db, "academy_courses", `phase-${deleteTarget.phaseId}`), updatedPhase);
        toast.success(t("تم حذف العنصر بنجاح", "Item deleted successfully"));
      }
    } catch (err) {
      console.error("Error deleting academy item:", err);
      toast.error(t("فشل في حذف العنصر", "Failed to delete item"));
    }

    setIsDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  const getUnitIcon = (unit: string) => {
    switch (unit) {
      case "lessons":
        return <BookOpen className="w-4 h-4" />;
      case "scripts":
        return <FileText className="w-4 h-4" />;
      case "calls":
        return <Phone className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getPhaseIcon = (phaseNum: number) => {
    const icons = [
      <Rocket className="w-5 h-5" />,
      <Settings className="w-5 h-5" />,
      <Target className="w-5 h-5" />,
      <Brain className="w-5 h-5" />,
      <Users className="w-5 h-5" />,
      <FileText className="w-5 h-5" />,
      <Phone className="w-5 h-5" />,
      <Layers className="w-5 h-5" />,
      <TrendingUp className="w-5 h-5" />,
      <Rocket className="w-5 h-5" />,
      <Award className="w-5 h-5" />,
    ];
    return icons[phaseNum % icons.length] || <Sparkles className="w-5 h-5" />;
  };

  const getPhaseColor = (phaseNum: number) => {
    const colors = [
      "from-emerald-500 to-teal-500",
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-indigo-500",
      "from-pink-500 to-rose-500",
      "from-orange-500 to-amber-500",
      "from-violet-500 to-purple-500",
      "from-cyan-500 to-sky-500",
      "from-indigo-500 to-blue-500",
      "from-rose-500 to-pink-500",
      "from-amber-500 to-yellow-500",
      "from-emerald-500 to-green-500",
    ];
    return colors[phaseNum % colors.length];
  };

  const getPhaseEmoji = (phaseNum: number) => {
    const emojis = ["🚀", "⚙️", "🎯", "🧠", "👥", "📜", "📞", "📊", "📈", "🌟", "🏆"];
    return emojis[phaseNum % emojis.length];
  };

  // Analytics Calculations
  const partnersList = (users || []).filter((u: any) => u.role !== "admin");

  const averageProgress = partnersList.length > 0
    ? Math.round(
        partnersList.reduce((acc: number, curr: any) => {
          const completedCount = curr.lessons !== undefined ? curr.lessons : (curr.completedLessons || []).length;
          const userProgress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;
          return acc + userProgress;
        }, 0) / partnersList.length
      )
    : 0;

  let mostActivePhaseName = t("لا يوجد", "None");
  let maxCompletions = -1;
  state.academyPhases.forEach((phase) => {
    let completionsCount = 0;
    partnersList.forEach((partner: any) => {
      const completedKeys = partner.completedLessons || [];
      const completedInPhase = phase.items.filter((item) =>
        completedKeys.includes(`${phase.id}_${item.id}`)
      ).length;
      completionsCount += completedInPhase;
    });
    if (completionsCount > maxCompletions && completionsCount > 0) {
      maxCompletions = completionsCount;
      mostActivePhaseName = `${t("المرحلة", "Phase")} ${phase.phaseNum}: ${translatePhaseTitle(phase.title)}`;
    }
  });

  const getPartnerActivePhase = (partner: any) => {
    const completedKeys = partner.completedLessons || [];
    if (completedKeys.length === 0) return t("المرحلة 0 (التهيئة)", "Phase 0 (Onboarding)");
    
    let maxPhaseNum = -1;
    let activePhaseName = t("المرحلة 0 (التهيئة)", "Phase 0 (Onboarding)");
    
    state.academyPhases.forEach((phase) => {
      const hasCompletedInPhase = phase.items.some((item) =>
        completedKeys.includes(`${phase.id}_${item.id}`)
      );
      if (hasCompletedInPhase && phase.phaseNum > maxPhaseNum) {
        maxPhaseNum = phase.phaseNum;
        activePhaseName = `${t("المرحلة", "Phase")} ${phase.phaseNum}: ${translatePhaseTitle(phase.title)}`;
      }
    });
    return activePhaseName;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Background Glow */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-20 left-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4 relative z-10"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-600 to-slate-600 dark:from-white dark:via-purple-300 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-purple-500" />
            <span>{t("أكاديمية الشركاء", "Partner Academy")}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t(
              "مسار التدريب الكامل - من البداية حتى التخرج",
              "Full learning path - From start to graduation",
            )}
          </p>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
              <Trophy className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
                {progressPercentage}%
              </span>
              <span className="text-xs text-purple-500 dark:text-purple-400">
                {t("مكتمل", "Complete")}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Admin SubTab Toggle and Add Phase Button */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 relative z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab("content")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeSubTab === "content"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              {t("المحتوى التدريبي", "Training Content")}
            </button>
            <button
              onClick={() => setActiveSubTab("analytics")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeSubTab === "analytics"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              {t("تحليلات الأكاديمية", "Academy Insights")}
            </button>
          </div>
          {activeSubTab === "content" && (
            <div className="flex gap-2">
              {state.academyPhases.length > 0 && (
                <button
                  onClick={requestDeleteAllPhases}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all duration-200 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t("حذف جميع المراحل", "Delete All Phases")}</span>
                </button>
              )}
              <button
                onClick={openAddPhaseModal}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all duration-200 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t("إضافة مرحلة جديدة", "Add New Phase")}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Progress Overview - Premium Card */}
      {!isAdmin && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-900/40 dark:via-indigo-900/40 dark:to-blue-900/40 p-6 shadow-xl shadow-purple-500/20 dark:shadow-purple-500/10"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000" />
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t("رحلة التعلم", "Your Learning Journey")}
                </h3>
                <p className="text-sm text-white/80">
                  {t(
                    `${completedItems} من ${totalItems} عنصر مكتمل`,
                    `${completedItems} of ${totalItems} items completed`,
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span className="text-xs text-white/70">
                    {progressPercentage >= 100
                      ? t(
                          "🎉 تهانينا! أكملت جميع المراحل!",
                          "🎉 Congratulations! You've completed all phases!",
                        )
                      : progressPercentage >= 70
                        ? t(
                            "🔥 أنت في المراحل المتقدمة! استمر!",
                            "🔥 You're in the advanced stages! Keep going!",
                          )
                        : progressPercentage >= 40
                          ? t(
                              "💪 تقدم رائع! واصل بنفس الوتيرة!",
                              "💪 Great progress! Keep up the pace!",
                            )
                          : t("🌟 ابدأ رحلتك اليوم!", "🌟 Start your journey today!")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{progressPercentage}%</div>
                <div className="text-xs text-white/70">{t("التقدم الكلي", "Overall Progress")}</div>
              </div>
              <div className="w-40 h-2.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-300 via-white to-yellow-300 rounded-full shadow-lg"
                  style={{
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s infinite linear",
                  }}
                />
              </div>
              <div className="text-xs text-white/70">
                {t(
                  `${totalItems - completedItems} متبقي`,
                  `${totalItems - completedItems} remaining`,
                )}
              </div>
            </div>
          </div>

          {/* Progress bar shimmer animation */}
          <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </motion.div>
      )}

      {/* Academy Phases - Phase numbering starts at 0 */}
      {(!isAdmin || activeSubTab === "content") && (
        <motion.div variants={containerVariants} className="space-y-4 relative z-10">
          {state.academyPhases.map((phase, index) => {
          const phaseTotal = phase.items.length;
          const phaseCompleted = phase.items.filter((item) =>
            userProfile?.completedLessons?.includes(`${phase.id}_${item.id}`)
          ).length;
          const phaseProgress =
            phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
          const isExpanded = expandedPhases.includes(phase.id);
          const hasItems = phaseTotal > 0;
          const isCompleted = phaseProgress === 100 && hasItems;
          const isInProgress = phaseProgress > 0 && phaseProgress < 100 && hasItems;

          return (
            <motion.div
              key={phase.id}
              variants={cardVariants}
              className={`bg-white dark:bg-slate-900/80 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                isCompleted && !isAdmin
                  ? "border-emerald-200 dark:border-emerald-800/60"
                  : isInProgress && !isAdmin
                    ? "border-amber-200 dark:border-amber-800/60"
                    : "border-slate-200 dark:border-slate-800/80"
              }`}
            >
              {/* Phase Header - Shows Phase 0 for Welcome */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPhaseColor(
                      phase.phaseNum,
                    )} flex items-center justify-center text-white shadow-lg shrink-0 relative ${
                      isCompleted && !isAdmin
                        ? "ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900"
                        : ""
                    }`}
                  >
                    {getPhaseIcon(phase.phaseNum)}
                    {isCompleted && !isAdmin && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t(`المرحلة ${phase.phaseNum}`, `Phase ${phase.phaseNum}`)}
                      </span>
                      {hasItems && !isAdmin && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : isInProgress
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
                          }`}
                        >
                          {phaseProgress}%
                        </span>
                      )}
                      {isCompleted && !isAdmin && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          {t("مكتمل", "Complete")}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {getPhaseEmoji(phase.phaseNum)} {translatePhaseTitle(phase.title)}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {getUnitIcon(phase.unit)}
                        {hasItems
                          ? t(
                              `${phaseTotal} ${translateUnit(phase.unit)}`,
                              `${phaseTotal} ${translateUnit(phase.unit)}`,
                            )
                          : t("لا يوجد محتوى", "No content")}
                      </span>
                      {isInProgress && !isAdmin && (
                        <span className="text-[10px] text-amber-500 flex items-center gap-0.5 animate-pulse">
                          <Zap className="w-3 h-3" />
                          {t("قيد التقدم", "In progress")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {phaseProgress === 100 && hasItems && !isAdmin && (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold hidden sm:inline">
                        {t("مكتمل", "Done")}
                      </span>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex items-center gap-1.5 mr-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMovePhase(phase.id, "up")}
                        disabled={index === 0}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 transition"
                        title={t("نقل لأعلى", "Move Up")}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMovePhase(phase.id, "down")}
                        disabled={index === state.academyPhases.length - 1}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 transition"
                        title={t("نقل لأسفل", "Move Down")}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditPhaseModal(phase)}
                        className="p-1 rounded bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 transition"
                        title={t("تعديل المرحلة", "Edit Phase")}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => requestDeletePhase(phase.id, phase.title)}
                        className="p-1 rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition"
                        title={t("حذف المرحلة", "Delete Phase")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Phase Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                      {/* Add Item Button */}
                      {isAdmin && (
                        <button
                          onClick={() => openAddItemModal(phase.id)}
                          className="w-full mb-4 py-3 text-sm font-bold text-purple-600 dark:text-purple-400 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] group"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            {t(
                              `إضافة ${translateUnit(phase.unit)}`,
                              `Add ${translateUnit(phase.unit)}`,
                            )}
                          </span>
                        </button>
                      )}

                      {hasItems ? (
                        <div className="space-y-2.5">
                          {phase.items.map((item, itemIndex) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: isRtl ? -10 : 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: itemIndex * 0.05 }}
                              className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group/item ${
                                userProfile?.completedLessons?.includes(`${phase.id}_${item.id}`) && !isAdmin
                                  ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30"
                                  : "bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* SmallToggleSwitch - GREEN when active */}
                                {!isAdmin && (
                                  <SmallToggleSwitch
                                    checked={userProfile?.completedLessons?.includes(`${phase.id}_${item.id}`) || false}
                                    onChange={() => handleToggleLesson(phase.id, item.id)}
                                  />
                                )}

                                <div className="flex-1 min-w-0">
                                  <span
                                    className={`text-sm font-medium ${
                                      userProfile?.completedLessons?.includes(`${phase.id}_${item.id}`) && !isAdmin
                                        ? "line-through text-slate-400 dark:text-slate-500"
                                        : "text-slate-800 dark:text-slate-200"
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                  {item.videoUrl && (
                                    <span className="ml-2 text-[10px] text-purple-500 flex items-center gap-0.5">
                                      <Video className="w-3 h-3" />
                                      {t("فيديو", "Video")}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity">
                                {item.videoUrl && (
                                  <button
                                    onClick={() => setVideoModalUrl(item.videoUrl)}
                                    className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 hover:scale-110"
                                    title={t("مشاهدة الفيديو", "Watch video")}
                                  >
                                    <Play className="w-4 h-4" />
                                  </button>
                                )}
                                {isAdmin && (
                                  <>
                                    <button
                                      onClick={() => openEditItemModal(phase.id, item.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 hover:scale-110"
                                      title={t("تعديل", "Edit")}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => requestDeleteItem(phase.id, item.id, item.title)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                                      title={t("حذف", "Delete")}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full w-fit mx-auto mb-3">
                            <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {t("لا يوجد محتوى في هذه المرحلة بعد", "No content in this phase yet")}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {t(
                              "أضف أول عنصر بالضغط على الزر أعلاه",
                              "Add your first item using the button above",
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        </motion.div>
      )}

      {/* Footer Stats */}
      {!isAdmin && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 relative z-10"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {completedItems}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t("مكتمل", "Completed")}
                </div>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {totalItems}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t("إجمالي", "Total")}
                </div>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {progressPercentage}%
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t("التقدم", "Progress")}
                </div>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {
                    state.academyPhases.filter(
                      (p) => p.items.length > 0 && p.items.every((i) => i.completed),
                    ).length
                  }
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t("مراحل مكتملة", "Phases Done")}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>
              {t("آخر تحديث", "Last updated")}{" "}
              {new Date().toLocaleTimeString(isRtl ? "ar-EG" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </motion.div>
      )}

      {/* Academy Insights Analytics Panel */}
      {isAdmin && activeSubTab === "analytics" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 relative z-10"
        >
          {/* Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Total Active Learners */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3 group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {t("إجمالي الشركاء النشطين", "Total Active Learners")}
                  </span>
                  <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-1">
                    {partnersList.filter(u => (u.lessons && u.lessons > 0) || (u.completedLessons && u.completedLessons.length > 0)).length}
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 block">
                    {t(`من إجمالي ${partnersList.length} شريك مسجل`, `Out of ${partnersList.length} total partners`)}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Overall Progress Rate */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3 group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {t("معدل الإنجاز الكلي", "Overall Progress Rate")}
                  </span>
                  <h3 className="text-2xl font-black text-slate-850 dark:text-white mt-1">
                    {averageProgress}%
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 block">
                    {t("متوسط التقدم عبر المنصة", "Average academy progress rate")}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Most Active Phase */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3 group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {t("المرحلة الأكثر تفاعلاً", "Most Active Phase")}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2 line-clamp-1">
                    {mostActivePhaseName}
                  </h3>
                  <span className="text-[10px] text-slate-550 dark:text-slate-400 mt-1 block">
                    {t("أعلى مشاركة وإتمام للدروس", "Highest participation and lesson completion")}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Partner Progress Table */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-805 dark:text-white">
                {t("جدول تقدم الشركاء", "Partner Progress Tracking")}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("متابعة تفصيلية لمستوى إتمام الدروس والمرحلة النشطة لكل شريك", "Detailed view of each partner's active training stage and completion metrics")}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse" style={{ textAlign: isRtl ? "right" : "left" }}>
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3">{t("الاسم", "Name")}</th>
                    <th className="px-5 py-3">{t("المرحلة النشطة", "Active Phase")}</th>
                    <th className="px-5 py-3">{t("نسبة التقدم", "Progress Percentage")}</th>
                    <th className="px-5 py-3">{t("آخر نشاط", "Last Active")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {partnersList.length > 0 ? (
                    partnersList.map((partner) => {
                      const completedCount = partner.lessons !== undefined ? partner.lessons : (partner.completedLessons || []).length;
                      const partnerProgress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
                      
                      return (
                        <tr key={partner.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-sm ring-2 ring-purple-100 dark:ring-purple-950/50 shrink-0">
                                {partner.name ? partner.name.charAt(0).toUpperCase() : (partner.email ? partner.email.charAt(0).toUpperCase() : "?")}
                              </div>
                              <div className="flex flex-col text-right" style={{ textAlign: isRtl ? "right" : "left" }}>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {partner.name || t("شريك مجهول", "Anonymous Partner")}
                                </span>
                                {partner.email && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                                    {partner.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                            {getPartnerActivePhase(partner)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-8 shrink-0">
                                {partnerProgress}%
                              </span>
                              <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                  style={{ width: `${partnerProgress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {partner.lastActive
                              ? new Date(partner.lastActive).toLocaleString(isRtl ? "ar-EG" : "en-US")
                              : partner.createdAt
                              ? new Date(partner.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")
                              : t("غير متاح", "N/A")}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-400">
                        {t("لا يوجد شركاء مسجلين بعد", "No registered partners found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------- PHASE ADD/EDIT MODAL ---------- */}
      <AnimatePresence>
        {isPhaseModalOpen && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhaseModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  <span>
                    {editingPhase ? t("تعديل المرحلة", "Edit Phase") : t("إضافة مرحلة جديدة", "Add New Phase")}
                  </span>
                </h3>
                <button
                  onClick={() => setIsPhaseModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t("عنوان المرحلة", "Phase Title")}
                  </label>
                  <input
                    type="text"
                    value={phaseFormData.title}
                    onChange={(e) => setPhaseFormData({ ...phaseFormData, title: e.target.value })}
                    placeholder={t("مثال: إعداد النظام", "e.g. System Setup")}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                    {t("رقم المرحلة (للترتيب)", "Phase Number (For Ordering)")}
                  </label>
                  <input
                    type="number"
                    value={phaseFormData.phaseNum}
                    onChange={(e) => setPhaseFormData({ ...phaseFormData, phaseNum: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>


              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsPhaseModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  onClick={handleSavePhase}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all"
                >
                  {t("حفظ", "Save")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- PHASE DELETE CONFIRM MODAL ---------- */}
      <AnimatePresence>
        {isPhaseDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhaseDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                {t("حذف المرحلة التدريبية؟", "Delete Training Phase?")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {t(
                  `هل أنت متأكد من حذف المرحلة "${phaseDeleteTarget?.title}"؟ سيتم حذف كافة الدروس والملفات التابعة لها نهائياً.`,
                  `Are you sure you want to delete phase "${phaseDeleteTarget?.title}"? All associated lessons and files will be permanently deleted.`
                )}
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsPhaseDeleteConfirmOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  {t("تراجع", "Cancel")}
                </button>
                <button
                  onClick={confirmDeletePhase}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {t("تأكيد الحذف", "Confirm Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- DELETE ALL PHASES CONFIRM MODAL ---------- */}
      <AnimatePresence>
        {isDeleteAllPhasesConfirmOpen && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteAllPhasesConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                {t("حذف جميع المراحل التدريبية؟", "Delete All Training Phases?")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {t(
                  "هل أنت متأكد من حذف جميع المراحل والدروس التابعة لها نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
                  "Are you sure you want to delete all phases and their associated lessons permanently? This action cannot be undone."
                )}
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsDeleteAllPhasesConfirmOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                >
                  {t("تراجع", "Cancel")}
                </button>
                <button
                  onClick={confirmDeleteAllPhases}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("حذف الكل", "Delete All")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- ITEM MODAL (Add/Edit) with GREEN SWITCH ---------- */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsItemModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {editingItemId !== null
                    ? t("تعديل العنصر", "Edit Item")
                    : t("إضافة عنصر جديد", "Add New Item")}
                </h3>
                <button
                  onClick={() => !isUploading && setIsItemModalOpen(false)}
                  disabled={isUploading}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    {t("العنوان", "Title")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemFormData.title}
                    onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                    placeholder={t("أدخل عنوان العنصر", "Enter item title")}
                    disabled={isUploading}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                    {t("مصدر الفيديو", "Video Source")}
                  </label>
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 w-fit mb-3">
                    <button
                      type="button"
                      onClick={() => setVideoSource("file")}
                      disabled={isUploading}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        videoSource === "file"
                          ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      {t("رفع ملف", "Upload File")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSource("youtube")}
                      disabled={isUploading}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        videoSource === "youtube"
                          ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      {t("يوتيوب", "YouTube URL")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSource("drive")}
                      disabled={isUploading}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        videoSource === "drive"
                          ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      {t("رابط درايف", "Drive Link")}
                    </button>
                  </div>

                  {videoSource === "file" ? (
                    <div>
                      <div className="relative group/file">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVideoFile(file);
                              const localUrl = URL.createObjectURL(file);
                              setItemFormData({ ...itemFormData, videoUrl: localUrl });
                            }
                          }}
                          disabled={isUploading}
                          className="hidden"
                          id="academy-video-upload"
                        />
                        <label
                          htmlFor={isUploading ? undefined : "academy-video-upload"}
                          className={`w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/40 transition-all duration-200 ${
                            isUploading
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-purple-500 cursor-pointer"
                          } text-center`}
                        >
                          <div className="p-2.5 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl mb-1.5 transition-transform">
                            <Video className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block truncate max-w-full px-2">
                            {videoFile ? videoFile.name : (itemFormData.videoUrl ? t("تغيير الفيديو", "Change Video") : t("اختر ملف فيديو", "Choose Video File"))}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                            {videoFile
                              ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`
                              : t("يدعم ملفات MP4, WebM", "Supports MP4, WebM files")}
                          </span>
                        </label>
                      </div>
                      {itemFormData.videoUrl && (
                        <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate max-w-[80%]">{videoFile ? t("فيديو محلي محمل", "Local uploaded video") : itemFormData.videoUrl}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFile(null);
                              setItemFormData({ ...itemFormData, videoUrl: "" });
                            }}
                            disabled={isUploading}
                            className="text-red-500 hover:text-red-600 font-bold shrink-0 disabled:opacity-50"
                          >
                            {t("إزالة", "Remove")}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : videoSource === "youtube" ? (
                    <div>
                      <input
                        type="text"
                        value={itemFormData.videoUrl}
                        onChange={(e) => setItemFormData({ ...itemFormData, videoUrl: e.target.value })}
                        placeholder={t("مثال: https://www.youtube.com/watch?v=...", "e.g., https://www.youtube.com/watch?v=...")}
                        disabled={isUploading}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
                      />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {t("يدعم روابط YouTube أو Vimeo", "Supports YouTube or Vimeo links")}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={itemFormData.videoUrl}
                        onChange={(e) => setItemFormData({ ...itemFormData, videoUrl: e.target.value })}
                        placeholder={t("مثال: https://drive.google.com/file/d/.../view", "e.g., https://drive.google.com/file/d/.../view")}
                        disabled={isUploading}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
                      />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {t("يدعم روابط Google Drive لمشاركة الفيديو", "Supports Google Drive links")}
                      </span>
                    </div>
                  )}
                </div>

                {isUploading && uploadProgress !== null && (
                  <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-purple-700 dark:text-purple-400">
                      <span>{t("جاري تحميل ملف الفيديو...", "Uploading video file...")}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* SWITCH for Completed - Standardized RTL ToggleSwitch */}
                <div className="pt-2">
                  <ToggleSwitch
                    checked={itemFormData.completed}
                    onChange={(val) => !isUploading && setItemFormData({ ...itemFormData, completed: val })}
                    disabled={isUploading}
                    label={t("حالة إتمام الدرس", "Lesson Completion Status")}
                    subLabel={
                      itemFormData.completed
                        ? t("✅ مكتمل", "✅ Completed")
                        : t("⏳ غير مكتمل", "⏳ Not completed")
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    disabled={isUploading}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition disabled:opacity-50"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    onClick={handleSaveItem}
                    disabled={isUploading}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isUploading ? t("جاري الرفع...", "Uploading...") : t("حفظ", "Save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
      <AnimatePresence>
        {isDeleteConfirmOpen && deleteTarget && (
          <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 p-6 text-center"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {t("تأكيد الحذف", "Confirm Delete")}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {t(
                  `هل أنت متأكد من حذف "${deleteTarget.title}" نهائياً؟`,
                  `Are you sure you want to delete "${deleteTarget.title}" permanently?`,
                )}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {t("لا يمكن التراجع عن هذا الإجراء", "This action cannot be undone")}
              </p>
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                >
                  {t("إلغاء", "Cancel")}
                </button>
                <button
                  onClick={confirmDeleteItem}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("حذف", "Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- VIDEO MODAL ---------- */}
      <AnimatePresence>
        {videoModalUrl && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoModalUrl(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 overflow-hidden"
            >
              <div className="relative aspect-video bg-black">
                {videoModalUrl.includes("youtube.com") || videoModalUrl.includes("youtu.be") ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${
                      videoModalUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)?.[1] ||
                      videoModalUrl
                    }`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoModalUrl.includes("vimeo.com") ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${videoModalUrl.match(/vimeo\.com\/(\d+)/)?.[1] || videoModalUrl}`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoModalUrl.includes("drive.google.com") ? (
                  <iframe
                    src={getDriveEmbedUrl(videoModalUrl)}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video src={videoModalUrl} controls className="w-full h-full" />
                )}
                <button
                  onClick={() => setVideoModalUrl(null)}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-all duration-200 hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-500" />
                  {t("مشاهدة الدرس", "Lesson Video")}
                </span>
                <button
                  onClick={() => setVideoModalUrl(null)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("إغلاق", "Close")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

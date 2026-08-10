import React, { useState, useEffect, useMemo } from "react";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { db, firestore, mediaStorage } from "../../config/firebase";
import { Creative } from "../../types/creative";
import { AdminCreativeSection } from "./AdminCreativeSection";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Film,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Copy,
  ExternalLink,
  AlertTriangle,
  X,
  FolderKanban,
  User,
  HardDrive,
  Video,
} from "lucide-react";
import { toast } from "sonner";

// Helper function to format Google Drive URLs for embedded streaming
export const formatDriveUrl = (url: string) => {
  if (!url) return url;
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/file\/d\/([^\/]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  return url;
};

export const CreativeLibrary: React.FC = () => {
  const { state } = useAppState();
  const { userProfile, isAdmin } = useAuth();
  const isRtl = state.settings.language === "ar";

  // Role Guard: If user is Admin, render the Admin View Architecture
  if (isAdmin || userProfile?.role === "admin") {
    return <AdminCreativeSection />;
  }

  // Translation helper
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"official" | "mine">("official");
  const [filterChip, setFilterChip] = useState<"all" | "official" | "mine" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Creative | null>(null);

  // Professional Delete Modal State
  const [deletingItem, setDeletingItem] = useState<Creative | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Asset Modal State
  const [editingItem, setEditingItem] = useState<Creative | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<"image" | "video">("image");
  const [editVideoSource, setEditVideoSource] = useState<"local" | "drive">("local");
  const [editUrl, setEditUrl] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [uploadVideoSource, setUploadVideoSource] = useState<"local" | "drive">("local");
  const [uploadUrl, setUploadUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Real-time Firestore Listener
  useEffect(() => {
    setLoading(true);
    const colRef = firestore.collection(db, "creatives");

    const unsubscribe = firestore.onSnapshot(
      colRef,
      (snapshot: any) => {
        const list: Creative[] = snapshot.docs.map((docSnap: any) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setCreatives(list);
        setLoading(false);
      },
      (error: any) => {
        console.error("Error listening to Firestore creatives collection:", error);
        setCreatives([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle File Selection for Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error(t("حجم الملف كبير جداً (الأقصى 50 ميجابايت)", "File size too large (max 50MB)"));
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("video/")) {
      setUploadType("video");
      setUploadVideoSource("local");
    } else if (file.type.startsWith("image/")) {
      setUploadType("image");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Upload Form
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      toast.error(t("يرجى إدخال عنوان للتصميم", "Please enter a title for the creative"));
      return;
    }

    if (uploadType === "video" && uploadVideoSource === "drive") {
      if (!uploadUrl.trim()) {
        toast.error(t("يرجى وضع رابط فيديو Google Drive أو الرابط الخارجي", "Please provide a Google Drive video link"));
        return;
      }
    } else {
      if (!selectedFile && !uploadUrl.trim()) {
        toast.error(t("يرجى اختيار ملف أو وضع رابط الوسائط", "Please select a file or provide a media URL"));
        return;
      }
    }

    setIsUploading(true);
    try {
      let finalFileUrl = uploadUrl.trim();

      if (uploadType === "video" && uploadVideoSource === "drive") {
        finalFileUrl = formatDriveUrl(uploadUrl.trim());
      } else if (selectedFile) {
        const { isFirebaseMocked } = await import("../../config/firebase");
        if (mediaStorage && !isFirebaseMocked) {
          const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
          const storageRef = ref(mediaStorage, `creatives/${Date.now()}_${selectedFile.name}`);
          await uploadBytes(storageRef, selectedFile);
          finalFileUrl = await getDownloadURL(storageRef);
        } else {
          finalFileUrl = filePreview || URL.createObjectURL(selectedFile);
        }
      }

      const newCreative: Creative = {
        id: `creative-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: uploadTitle.trim(),
        fileUrl: finalFileUrl,
        type: uploadType,
        category: "mine",
        status: "pending",
        uploadedBy: {
          userId: userProfile?.uid || "user-partner",
          userName: userProfile?.name || userProfile?.email || "Partner User",
        },
        createdAt: Date.now(),
      };

      const docRef = firestore.doc(db, `creatives/${newCreative.id}`);
      await firestore.setDoc(docRef, newCreative);

      toast.success(
        t(
          "تم رفع التصميم بنجاح وهو الآن قيد مراجعة الإدارة",
          "Creative uploaded successfully and is now pending admin review"
        )
      );

      setUploadTitle("");
      setUploadUrl("");
      setSelectedFile(null);
      setFilePreview(null);
      setIsUploadOpen(false);
      setActiveTab("mine");
    } catch (err: any) {
      console.error("Error uploading creative to Firestore:", err);
      toast.error(t("حدث خطأ أثناء رفع التصميم", "Error uploading creative"));
    } finally {
      setIsUploading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (creative: Creative) => {
    setEditingItem(creative);
    setEditTitle(creative.title);
    setEditType(creative.type);
    setEditVideoSource(creative.fileUrl.includes("drive.google.com") ? "drive" : "local");
    setEditUrl(creative.fileUrl);
    setEditFile(null);
    setEditPreview(null);
  };

  // Submit Edit Asset Changes
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editTitle.trim()) {
      toast.error(t("يرجى إدخال عنوان للتصميم", "Please enter a title for the creative"));
      return;
    }

    setIsEditing(true);
    try {
      let finalFileUrl = editUrl.trim();

      if (editType === "video" && editVideoSource === "drive") {
        finalFileUrl = formatDriveUrl(editUrl.trim());
      } else if (editFile) {
        const { isFirebaseMocked } = await import("../../config/firebase");
        if (mediaStorage && !isFirebaseMocked) {
          const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
          const storageRef = ref(mediaStorage, `creatives/${Date.now()}_${editFile.name}`);
          await uploadBytes(storageRef, editFile);
          finalFileUrl = await getDownloadURL(storageRef);
        } else {
          finalFileUrl = editPreview || URL.createObjectURL(editFile);
        }
      }

      const docRef = firestore.doc(db, `creatives/${editingItem.id}`);
      await firestore.updateDoc(docRef, {
        title: editTitle.trim(),
        type: editType,
        fileUrl: finalFileUrl,
      });

      toast.success(t("تم تحديث بيانات التصميم بنجاح", "Creative updated successfully"));
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating creative:", err);
      toast.error(t("حدث خطأ أثناء تحديث التصميم", "Error updating creative"));
    } finally {
      setIsEditing(false);
    }
  };

  // Professional Delete Confirmation Handler
  const confirmDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      const docRef = firestore.doc(db, `creatives/${deletingItem.id}`);
      await firestore.deleteDoc(docRef);
      toast.success(t("تم حذف التصميم بنجاح", "Creative deleted successfully"));
      setDeletingItem(null);
    } catch (err) {
      console.error("Error deleting creative from Firestore:", err);
      toast.error(t("حدث خطأ أثناء الحذف", "Failed to delete creative"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Logic for Partner View
  const filteredCreatives = useMemo(() => {
    return creatives.filter((item) => {
      if (activeTab === "official" && item.category !== "official") return false;
      if (activeTab === "mine") {
        if (item.category !== "mine" || item.uploadedBy.userId !== userProfile?.uid) return false;
      }

      if (filterChip === "official" && item.category !== "official") return false;
      if (filterChip === "mine" && item.category !== "mine") return false;
      if (filterChip === "pending" && item.status !== "pending") return false;
      if (filterChip === "approved" && item.status !== "approved") return false;
      if (filterChip === "rejected" && item.status !== "rejected") return false;

      if (typeFilter !== "all" && item.type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const authorMatch = item.uploadedBy.userName.toLowerCase().includes(q);
        if (!titleMatch && !authorMatch) return false;
      }

      return true;
    });
  }, [creatives, activeTab, filterChip, typeFilter, searchQuery, userProfile]);

  // Status Badge Component
  const renderStatusBadge = (status: Creative["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            {t("مقبول", "Approved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            {t("مرفوض", "Rejected")}
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            {t("قيد المراجعة", "Pending Review")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#12141c] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("مكتبة المحتوى الإبداعي", "Creative Library")}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t(
                  "تصفح المواد التسويقية الرسمية، وقم برفع تصاميمك المخصصة للمراجعة والاعتماد",
                  "Browse official marketing assets and upload custom creatives for review and approval"
                )}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t("رفع تصميم جديد", "Upload Asset")}
        </button>
      </div>

      {/* 2. DUAL VIEW TABS (Official Assets vs My Assets) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setActiveTab("official");
            setFilterChip("all");
          }}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "official"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          {t("الأصول الرسمية (Official Assets)", "Official Assets")}
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {creatives.filter((c) => c.category === "official").length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("mine");
            setFilterChip("all");
          }}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "mine"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <User className="w-4 h-4" />
          {t("أصولي وتصاميمي (My Assets)", "My Assets")}
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {creatives.filter((c) => c.category === "mine" && c.uploadedBy.userId === userProfile?.uid).length}
          </span>
        </button>
      </div>

      {/* 3. FILTERS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#12141c] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("بحث باسم التصميم...", "Search by title...")}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Media Type Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#181a24] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              typeFilter === "all"
                ? "bg-white dark:bg-[#202433] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {t("الكل", "All Types")}
          </button>
          <button
            onClick={() => setTypeFilter("image")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              typeFilter === "image"
                ? "bg-white dark:bg-[#202433] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {t("صور", "Images")}
          </button>
          <button
            onClick={() => setTypeFilter("video")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              typeFilter === "video"
                ? "bg-white dark:bg-[#202433] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            {t("فيديوهات", "Videos")}
          </button>
        </div>
      </div>

      {/* 4. FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          {t("التصفية:", "Filter:")}
        </span>

        {[
          { id: "all", labelAr: "الكل", labelEn: "All Items" },
          { id: "official", labelAr: "رسمي", labelEn: "Official" },
          { id: "mine", labelAr: "أصولي", labelEn: "My Uploads" },
          { id: "pending", labelAr: "قيد المراجعة", labelEn: "Pending Review" },
          { id: "approved", labelAr: "مقبول", labelEn: "Approved" },
          { id: "rejected", labelAr: "مرفوض", labelEn: "Rejected" },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setFilterChip(chip.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              filterChip === chip.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-[#12141c] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#181a24] border border-slate-200 dark:border-slate-800"
            }`}
          >
            {isRtl ? chip.labelAr : chip.labelEn}
          </button>
        ))}
      </div>

      {/* 5. ASSET CARDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/50 animate-pulse border border-slate-300 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredCreatives.length === 0 ? (
        <div className="bg-white dark:bg-[#12141c] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {t("لا توجد تصاميم في مكتبة البيانات", "No creative assets found in Firestore")}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {activeTab === "mine"
              ? t("لم تقم برفع أية تصاميم مخصصة بعد. يمكنك الضغط على زر رفع تصميم جديد بالفي الأعلى.", "You haven't uploaded any custom assets yet. Click '+ Upload Asset' above to submit your first creative.")
              : t("لم يتم العثور على أية أصول تسويقية تنطبق عليها معايير البحث والتصفية.", "No marketing materials match your current tab or filter selections.")}
          </p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredCreatives.map((creative) => (
              <motion.div
                key={creative.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Media Preview Container */}
                <div className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center group">
                  {creative.type === "video" ? (
                    creative.fileUrl.includes("drive.google.com") ? (
                      <iframe
                        src={creative.fileUrl}
                        className="w-full h-full pointer-events-none"
                        title={creative.title}
                      />
                    ) : (
                      <video
                        src={creative.fileUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        muted
                        preload="metadata"
                      />
                    )
                  ) : (
                    <img
                      src={creative.fileUrl}
                      alt={creative.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop";
                      }}
                    />
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                    {creative.type === "video" ? (
                      creative.fileUrl.includes("drive.google.com") ? (
                        <>
                          <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                          {t("درايف", "Drive")}
                        </>
                      ) : (
                        <>
                          <Film className="w-3.5 h-3.5 text-amber-400" />
                          {t("فيديو", "Video")}
                        </>
                      )
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        {t("صورة", "Image")}
                      </>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPreviewMedia(creative)}
                      className="p-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-transform duration-150 transform hover:scale-110 shadow-lg"
                      title={t("معاينة", "Preview")}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={creative.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-transform duration-150 transform hover:scale-110 shadow-lg"
                      title={t("فتح الرابط", "Open Link")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {renderStatusBadge(creative.status)}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(creative.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug group-hover:text-emerald-500 transition-colors">
                      {creative.title}
                    </h3>
                  </div>

                  {/* Rejection Reason Banner */}
                  {creative.status === "rejected" && creative.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{t("سبب الرفض:", "Rejection Reason:")}</span>
                      </div>
                      <p className="leading-relaxed text-[11px] opacity-90">{creative.rejectionReason}</p>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[120px]">{creative.uploadedBy.userName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(creative.fileUrl);
                          toast.success(t("تم نسخ رابط الملف", "Link copied to clipboard"));
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        title={t("نسخ الرابط", "Copy Link")}
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {creative.category !== "official" && creative.uploadedBy.userId === userProfile?.uid && (
                        <>
                          <button
                            onClick={() => openEditModal(creative)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                            title={t("تعديل", "Edit Asset")}
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingItem(creative)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title={t("حذف", "Delete Asset")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 6. UPLOAD MODAL WITH LOCAL VIDEO VS DRIVE LINK OPTIONS */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#12141c] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      {t("رفع تصميم تسويقي جديد", "Upload New Creative")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t("سيتم إرسال المحتوى إلى فريق الإدارة للمراجعة والاعتماد", "Asset will be submitted for admin review")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("عنوان التصميم / الاسم", "Asset Title")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={t("مثال: بنر حملة الصيف التسويقية", "e.g. Summer Special Offer Banner")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Main Content Type Selector (Image vs Video) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("نوع المحتوى", "Content Type")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUploadType("image")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                        uploadType === "image"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      {t("صورة (Image)", "Image")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType("video")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                        uploadType === "video"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Film className="w-4 h-4" />
                      {t("فيديو (Video)", "Video")}
                    </button>
                  </div>
                </div>

                {/* DUAL VIDEO SOURCE OPTIONS WHEN VIDEO IS SELECTED */}
                {uploadType === "video" ? (
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t("مصدر الفيديو (Video Source Options)", "Video Source Options")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUploadVideoSource("local")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                          uploadVideoSource === "local"
                            ? "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm"
                            : "border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Video className="w-4 h-4 text-emerald-500" />
                        {t("فيديو من الجهاز (Local Video)", "Local Video File")}
                      </button>

                      <button
                        type="button"
                        onClick={() => setUploadVideoSource("drive")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                          uploadVideoSource === "drive"
                            ? "border-blue-500 bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <HardDrive className="w-4 h-4 text-blue-500" />
                        {t("رابط Google Drive", "Drive Link")}
                      </button>
                    </div>

                    {uploadVideoSource === "local" ? (
                      <div className="space-y-1.5 pt-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t("اختيار ملف الفيديو من الجهاز", "Select Local Video File")}
                        </label>
                        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center hover:border-emerald-500 transition-colors bg-white dark:bg-[#12141c]">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          {filePreview ? (
                            <div className="space-y-2">
                              <video src={filePreview} className="max-h-36 mx-auto rounded-lg shadow-md" controls />
                              <p className="text-xs text-emerald-600 font-medium">{selectedFile?.name}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Film className="w-8 h-8 mx-auto text-emerald-500" />
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                {t("اضغط هنا لاختيار فيديو من جهازك", "Click to choose video from device")}
                              </p>
                              <p className="text-[11px] text-slate-400">MP4, MOV, WEBM (Max 50MB)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <HardDrive className="w-4 h-4 text-blue-500" />
                          {t("رابط Google Drive للفيديو", "Google Drive Video URL")} *
                        </label>
                        <input
                          type="url"
                          required
                          value={uploadUrl}
                          onChange={(e) => setUploadUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                        <p className="text-[11px] text-slate-400">
                          {t(
                            "يدعم روابط المشاركة المباشرة من Google Drive ويتم تحويلها تلقائياً للمعاينة المباشرة.",
                            "Supports Google Drive sharing links and automatically transforms them for stream preview."
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* IMAGE UPLOAD MODE */
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t("رفع صورة من الجهاز", "Upload Image File")}
                      </label>
                      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-[#181a24]/50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />

                        {filePreview ? (
                          <div className="space-y-2">
                            <img src={filePreview} alt="Preview" className="max-h-36 mx-auto rounded-lg shadow-md object-contain" />
                            <p className="text-xs text-emerald-600 font-medium">{selectedFile?.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="w-8 h-8 mx-auto text-slate-400" />
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              {t("اضغط هنا لاختيار صورة من جهازك", "Click to select image file")}
                            </p>
                            <p className="text-[11px] text-slate-400">PNG, JPG, WEBP, GIF (Max 50MB)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t("أو وضع رابط مباشر للصورة (Image URL)", "Or Direct Image URL")}
                      </label>
                      <input
                        type="url"
                        value={uploadUrl}
                        onChange={(e) => setUploadUrl(e.target.value)}
                        placeholder="https://example.com/image.png"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all"
                  >
                    {isUploading ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        {t("جاري الرفع...", "Uploading...")}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {t("إرسال للمراجعة", "Submit for Review")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. EDIT ASSET MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#12141c] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-blue-500">
                  <Edit className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t("تعديل بيانات التصميم", "Edit Creative Asset")}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("عنوان التصميم", "Asset Title")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("نوع المحتوى", "Content Type")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditType("image")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        editType === "image"
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {t("صورة", "Image")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditType("video")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        editType === "video"
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-slate-200 dark:border-slate-800 text-slate-500"
                      }`}
                    >
                      {t("فيديو", "Video")}
                    </button>
                  </div>
                </div>

                {editType === "video" && (
                  <div className="space-y-2 p-3 bg-slate-50 dark:bg-[#181a24] rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t("مصدر الفيديو", "Video Source")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditVideoSource("local")}
                        className={`p-2 rounded-lg text-xs font-semibold border ${
                          editVideoSource === "local" ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-slate-300 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        {t("فيديو محلي", "Local File")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditVideoSource("drive")}
                        className={`p-2 rounded-lg text-xs font-semibold border ${
                          editVideoSource === "drive" ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-slate-300 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        {t("رابط Google Drive", "Drive Link")}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("رابط الملف / URL الحالي", "Current Media URL / Google Drive Link")}
                  </label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                {editVideoSource === "local" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t("أو استبدال الملف بملف جديد من الجهاز", "Or Replace File from Device")}
                    </label>
                    <input
                      type="file"
                      accept={editType === "image" ? "image/*" : "video/*"}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setEditFile(file);
                        const r = new FileReader();
                        r.onloadend = () => setEditPreview(r.result as string);
                        r.readAsDataURL(file);
                      }}
                      className="w-full text-xs text-slate-400"
                    />
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md"
                  >
                    {isEditing ? t("جاري الحفظ...", "Saving...") : t("حفظ التعديلات", "Save Changes")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. PROFESSIONAL DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#12141c] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    {t("تأكيد حذف التصميم", "Confirm Deletion")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t("عملية الحذف نهائية ولا يمكن استرجاع الملف لاحقاً", "This action cannot be undone")}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#181a24] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">{deletingItem.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t("المُنشئ:", "By:")} {deletingItem.uploadedBy.userName}
                </p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t(
                  "هل أنت محتأكد من رغبتك في حذف هذا التصميم الإبداعي من المكتبة بشكل نهائي؟",
                  "Are you sure you want to permanently delete this creative asset from the library?"
                )}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  {t("إلغاء", "Cancel")}
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      {t("جاري الحذف...", "Deleting...")}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {t("تأكيد الحذف النهائي", "Confirm Delete")}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. PREVIEW MEDIA MODAL */}
      <AnimatePresence>
        {previewMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#12141c] w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {renderStatusBadge(previewMedia.status)}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate max-w-md">
                    {previewMedia.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-black flex items-center justify-center max-h-[70vh] p-2 overflow-hidden">
                {previewMedia.type === "video" ? (
                  previewMedia.fileUrl.includes("drive.google.com") ? (
                    <iframe
                      src={previewMedia.fileUrl}
                      className="w-full h-[60vh] rounded-lg"
                      allow="autoplay"
                      title={previewMedia.title}
                    />
                  ) : (
                    <video src={previewMedia.fileUrl} controls autoPlay className="max-h-[65vh] w-auto rounded-lg" />
                  )
                ) : (
                  <img src={previewMedia.fileUrl} alt={previewMedia.title} className="max-h-[65vh] w-auto object-contain rounded-lg" />
                )}
              </div>

              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-500">
                    {t("المُنشئ:", "Uploaded by:")} <strong className="text-slate-800 dark:text-slate-200">{previewMedia.uploadedBy.userName}</strong>
                  </p>
                  {previewMedia.rejectionReason && (
                    <p className="text-rose-500 font-medium">
                      {t("سبب الرفض:", "Reason:")} {previewMedia.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewMedia.fileUrl);
                      toast.success(t("تم نسخ رابط الملف", "Link copied"));
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {t("نسخ الرابط", "Copy Link")}
                  </button>

                  <a
                    href={previewMedia.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    {t("تحميل الملف", "Download")}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

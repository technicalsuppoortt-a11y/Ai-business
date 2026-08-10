import React, { useState, useEffect, useMemo } from "react";
import { useAppState } from "../../context/StateContext";
import { useAuth } from "../../context/AuthContext";
import { db, firestore, mediaStorage } from "../../config/firebase";
import { Creative } from "../../types/creative";
import { formatDriveUrl } from "./CreativeLibrary";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Image as ImageIcon,
  Film,
  Trash2,
  Edit,
  Eye,
  X,
  AlertTriangle,
  Search,
  Plus,
  User,
  FolderKanban,
  Check,
  Copy,
  ExternalLink,
  HardDrive,
  Video,
} from "lucide-react";
import { toast } from "sonner";

export const AdminCreativeSection: React.FC = () => {
  const { state } = useAppState();
  const { userProfile } = useAuth();
  const isRtl = state.settings.language === "ar";

  // Translation helper
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);

  // 2 Main Admin Sections: 'review-queue' & 'official-manager'
  const [mainAdminTab, setMainAdminTab] = useState<"review-queue" | "official-manager">("review-queue");

  // Review Queue Sub-Filter (pending, approved, rejected)
  const [reviewStatusFilter, setReviewStatusFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState<Creative | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

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

  // Admin Official Asset Upload State
  const [isUploadOfficialOpen, setIsUploadOfficialOpen] = useState(false);
  const [officialTitle, setOfficialTitle] = useState("");
  const [officialType, setOfficialType] = useState<"image" | "video">("image");
  const [officialVideoSource, setOfficialVideoSource] = useState<"local" | "drive">("local");
  const [officialUrl, setOfficialUrl] = useState("");
  const [officialFile, setOfficialFile] = useState<File | null>(null);
  const [officialPreview, setOfficialPreview] = useState<string | null>(null);
  const [isUploadingOfficial, setIsUploadingOfficial] = useState(false);

  // Preview Media Modal
  const [previewMedia, setPreviewMedia] = useState<Creative | null>(null);

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
        console.error("Error fetching creatives snapshot:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Approve Creative Action
  const handleApprove = async (creative: Creative) => {
    try {
      const docRef = firestore.doc(db, `creatives/${creative.id}`);
      await firestore.updateDoc(docRef, {
        status: "approved",
        rejectionReason: "",
      });

      try {
        const notifRef = firestore.collection(db, "notifications");
        await firestore.addDoc(notifRef, {
          userId: creative.uploadedBy.userId,
          title: t("تمت الموافقة على تصميمك", "Creative Submission Approved"),
          titleAr: "تمت الموافقة على تصميمك",
          titleEn: "Creative Submission Approved",
          message: t(
            `تمت الموافقة على تصميمك "${creative.title}" من قبل الإدارة.`,
            `Your creative submission "${creative.title}" was approved by admin.`
          ),
          messageAr: `تمت الموافقة على تصميمك "${creative.title}" من قبل الإدارة.`,
          messageEn: `Your creative submission "${creative.title}" was approved by admin.`,
          type: "creative_approved",
          read: false,
          createdAt: Date.now(),
        });
      } catch (e) {
        console.error("Error pushing notification:", e);
      }

      toast.success(t("تم قبول التصميم بنجاح وإرسال إشعار للمسوق", "Creative approved and partner notified"));
    } catch (err) {
      console.error("Error approving creative:", err);
      toast.error(t("حدث خطأ أثناء الموافقة على التصميم", "Error approving creative"));
    }
  };

  // Confirm Rejection Action
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;

    if (!rejectionReasonInput.trim()) {
      toast.error(t("يرجى كتابة سبب الرفض لتوضيحه للمسوق", "Please enter a rejection reason"));
      return;
    }

    setIsSubmittingReject(true);
    try {
      const docRef = firestore.doc(db, `creatives/${rejectingItem.id}`);
      await firestore.updateDoc(docRef, {
        status: "rejected",
        rejectionReason: rejectionReasonInput.trim(),
      });

      try {
        const notifRef = firestore.collection(db, "notifications");
        await firestore.addDoc(notifRef, {
          userId: rejectingItem.uploadedBy.userId,
          title: t("تم رفض التصميم التسويقي", "Creative Submission Rejected"),
          titleAr: "تم رفض التصميم التسويقي",
          titleEn: "Creative Submission Rejected",
          message: t(
            `تم رفض تصميمك "${rejectingItem.title}". السبب: ${rejectionReasonInput.trim()}`,
            `Your creative submission "${rejectingItem.title}" was rejected. Reason: ${rejectionReasonInput.trim()}`
          ),
          messageAr: `تم رفض تصميمك "${rejectingItem.title}". السبب: ${rejectionReasonInput.trim()}`,
          messageEn: `Your creative submission "${rejectingItem.title}" was rejected. Reason: ${rejectionReasonInput.trim()}`,
          type: "creative_rejected",
          read: false,
          createdAt: Date.now(),
        });
      } catch (e) {
        console.error("Error pushing notification:", e);
      }

      toast.success(t("تم رفض التصميم وإرسال ملاحظاتك للمسوق", "Creative rejected and notification sent to partner"));
      setRejectingItem(null);
      setRejectionReasonInput("");
    } catch (err) {
      console.error("Error rejecting creative:", err);
      toast.error(t("حدث خطأ أثناء رفض التصميم", "Error rejecting creative"));
    } finally {
      setIsSubmittingReject(false);
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

      toast.success(t("تم تحديث التصميم بنجاح", "Asset updated successfully"));
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating asset:", err);
      toast.error(t("حدث خطأ أثناء التحديث", "Error updating asset"));
    } finally {
      setIsEditing(false);
    }
  };

  // Confirm Delete Handler
  const confirmDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      const docRef = firestore.doc(db, `creatives/${deletingItem.id}`);
      await firestore.deleteDoc(docRef);
      toast.success(t("تم حذف التصميم بنجاح", "Creative asset deleted successfully"));
      setDeletingItem(null);
    } catch (err) {
      console.error("Error deleting asset:", err);
      toast.error(t("حدث خطأ أثناء الحذف", "Failed to delete creative asset"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Upload Official Asset Action
  const handleOfficialUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialTitle.trim()) {
      toast.error(t("يرجى إدخال عنوان للأصل الرسمي", "Please enter a title for official asset"));
      return;
    }

    if (officialType === "video" && officialVideoSource === "drive") {
      if (!officialUrl.trim()) {
        toast.error(t("يرجى وضع رابط فيديو Google Drive", "Please provide a Google Drive video link"));
        return;
      }
    } else {
      if (!officialFile && !officialUrl.trim()) {
        toast.error(t("يرجى اختيار ملف أو وضع رابط الوسائط", "Please select a file or provide a media URL"));
        return;
      }
    }

    setIsUploadingOfficial(true);
    try {
      let finalUrl = officialUrl.trim();

      if (officialType === "video" && officialVideoSource === "drive") {
        finalUrl = formatDriveUrl(officialUrl.trim());
      } else if (officialFile) {
        const { isFirebaseMocked } = await import("../../config/firebase");
        if (mediaStorage && !isFirebaseMocked) {
          const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
          const storageRef = ref(mediaStorage, `creatives/official_${Date.now()}_${officialFile.name}`);
          await uploadBytes(storageRef, officialFile);
          finalUrl = await getDownloadURL(storageRef);
        } else {
          finalUrl = officialPreview || URL.createObjectURL(officialFile);
        }
      }

      const newOfficialAsset: Creative = {
        id: `official-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: officialTitle.trim(),
        fileUrl: finalUrl,
        type: officialType,
        category: "official",
        status: "approved",
        uploadedBy: {
          userId: userProfile?.uid || "admin-system",
          userName: userProfile?.name || "Admin Team",
        },
        createdAt: Date.now(),
      };

      const docRef = firestore.doc(db, `creatives/${newOfficialAsset.id}`);
      await firestore.setDoc(docRef, newOfficialAsset);

      toast.success(t("تم إضافة المحتوى الرسمي بنجاح لجميع الشركاء", "Official asset published to all partners"));

      setOfficialTitle("");
      setOfficialUrl("");
      setOfficialFile(null);
      setOfficialPreview(null);
      setIsUploadOfficialOpen(false);
    } catch (err) {
      console.error("Error uploading official asset:", err);
      toast.error(t("حدث خطأ أثناء الرفع", "Failed to upload official asset"));
    } finally {
      setIsUploadingOfficial(false);
    }
  };

  // Pending Count & Official Count
  const pendingCount = useMemo(
    () => creatives.filter((c) => c.status === "pending" && c.category !== "official").length,
    [creatives]
  );

  const officialCount = useMemo(
    () => creatives.filter((c) => c.category === "official").length,
    [creatives]
  );

  // Filtered List
  const filteredCreatives = useMemo(() => {
    return creatives.filter((item) => {
      if (mainAdminTab === "review-queue") {
        if (item.category === "official") return false;
        if (item.status !== reviewStatusFilter) return false;
      } else if (mainAdminTab === "official-manager") {
        if (item.category !== "official") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const authorMatch = item.uploadedBy.userName.toLowerCase().includes(q);
        if (!titleMatch && !authorMatch) return false;
      }

      return true;
    });
  }, [creatives, mainAdminTab, reviewStatusFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. ADMIN TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/20 via-indigo-900/10 to-transparent p-6 rounded-2xl border border-purple-500/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("لوحة تحكم الإدارة - التصاميم الإبداعية", "Admin Creative Management")}
              </h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 animate-bounce">
                  {pendingCount} {t("طلب جديد", "New")}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t(
                "مراجعة تصميمات الشركاء وإدارة المحتوى التسويقي الرسمي المنشور للجميع",
                "Review partner creative submissions and manage official marketing assets"
              )}
            </p>
          </div>
        </div>

        {mainAdminTab === "official-manager" && (
          <button
            onClick={() => setIsUploadOfficialOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            {t("إضافة محتوى رسمي جديد", "Add Official Asset")}
          </button>
        )}
      </div>

      {/* 2. ADMIN MAIN TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setMainAdminTab("review-queue")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            mainAdminTab === "review-queue"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <Clock className="w-4 h-4" />
          {t("طابور مراجعة تصاميم الشركاء (Review Queue)", "Partner Submissions Review Queue")}
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-slate-950 font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setMainAdminTab("official-manager")}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            mainAdminTab === "official-manager"
              ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/5"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          {t("إدارة المحتوى الرسمي (Official Assets Manager)", "Official Assets Manager")}
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
            {officialCount}
          </span>
        </button>
      </div>

      {/* 3. SUB-FILTERS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#12141c] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("بحث باسم التصميم أو اسم المسوق...", "Search by title or partner name...")}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {mainAdminTab === "review-queue" && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#181a24] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setReviewStatusFilter("pending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                reviewStatusFilter === "pending"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {t("قيد المراجعة", "Pending")} ({creatives.filter((c) => c.status === "pending" && c.category !== "official").length})
            </button>
            <button
              onClick={() => setReviewStatusFilter("approved")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                reviewStatusFilter === "approved"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {t("المقبولة", "Approved")}
            </button>
            <button
              onClick={() => setReviewStatusFilter("rejected")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                reviewStatusFilter === "rejected"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              {t("المرفوضة", "Rejected")}
            </button>
          </div>
        )}
      </div>

      {/* 4. QUEUE GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : filteredCreatives.length === 0 ? (
        <div className="bg-white dark:bg-[#12141c] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {t("لا توجد تصاميم في هذا القسم حالياً", "No creative items found")}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {mainAdminTab === "review-queue" && reviewStatusFilter === "pending"
              ? t("تم الانتهاء من مراجعة كافة تصاميم الشركاء بنجاح!", "All partner submissions in the review queue have been processed!")
              : t("لا توجد نتائج تطابق خيارات التصفية الحالية.", "No items match your filter criteria.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreatives.map((creative) => (
            <div
              key={creative.id}
              className="flex flex-col bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Media Preview Box */}
              <div className="relative h-48 bg-slate-950 flex items-center justify-center group overflow-hidden">
                {creative.type === "video" ? (
                  creative.fileUrl.includes("drive.google.com") ? (
                    <iframe
                      src={creative.fileUrl}
                      className="w-full h-full pointer-events-none"
                      title={creative.title}
                    />
                  ) : (
                    <video src={creative.fileUrl} className="w-full h-full object-cover" muted preload="metadata" />
                  )
                ) : (
                  <img
                    src={creative.fileUrl}
                    alt={creative.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop";
                    }}
                  />
                )}

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
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

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPreviewMedia(creative)}
                    className="p-2.5 rounded-full bg-white text-slate-900 hover:scale-110 transition-transform shadow-lg"
                    title={t("معاينة", "Preview")}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={creative.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-white text-slate-900 hover:scale-110 transition-transform shadow-lg"
                    title={t("فتح الرابط", "Open Link")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Info Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      {creative.uploadedBy.userName}
                    </span>
                    <span className="text-slate-400">
                      {new Date(creative.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                    {creative.title}
                  </h3>

                  {creative.rejectionReason && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                      <strong>{t("سبب الرفض:", "Reason:")}</strong> {creative.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Admin Actions Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {mainAdminTab === "official-manager" ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md">
                        {t("محتوى رسمي عام", "Official Public Asset")}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(creative)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                          title={t("تعديل", "Edit Asset")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(creative)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title={t("حذف", "Delete Asset")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(creative)}
                        disabled={creative.status === "approved"}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        {t("قبول", "Approve")}
                      </button>

                      <button
                        onClick={() => {
                          setRejectingItem(creative);
                          setRejectionReasonInput(creative.rejectionReason || "");
                        }}
                        disabled={creative.status === "rejected"}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <X className="w-4 h-4" />
                        {t("رفض مع سبب", "Reject")}
                      </button>

                      <button
                        onClick={() => openEditModal(creative)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title={t("تعديل", "Edit Asset")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingItem(creative)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title={t("حذف", "Delete Asset")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. EDIT ASSET MODAL */}
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
                    {t("تعديل بيانات التصميم (Admin)", "Edit Asset (Admin)")}
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
                      {t("أو استبدال الملف بملف جديد", "Or Replace File")}
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

      {/* 6. MANDATORY REJECTION REASON MODAL */}
      <AnimatePresence>
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#12141c] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t("سبب رفض التصميم", "Rejection Reason")}
                  </h3>
                </div>
                <button onClick={() => setRejectingItem(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t("اكتب ملاحظات الرفض والتعديلات المطلوبة للمسوق", "Enter rejection comments & feedback")} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder={t(
                      "مثال: الدقة منخفضة والشعار غير واضح، يرجى رفع ملف بدقة 1080p عالية الوضوح.",
                      "e.g. Resolution is too low and logo is not clear. Please re-upload high resolution asset."
                    )}
                    className="w-full p-3 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRejectingItem(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReject}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-all"
                  >
                    {isSubmittingReject ? t("جاري الرفض...", "Rejecting...") : t("تأكيد الرفض وإرسال الإشعار", "Confirm Rejection")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. PROFESSIONAL DELETE CONFIRMATION DIALOG */}
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
                    {t("تأكيد حذف التصميم (Admin)", "Confirm Admin Deletion")}
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
                  "هل أنت محتأكد من رغبتك في حذف هذا التصميم من النظام بشكل نهائي؟",
                  "Are you sure you want to permanently delete this asset from the system?"
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

      {/* 8. UPLOAD OFFICIAL ASSET MODAL WITH LOCAL VIDEO VS DRIVE LINK OPTIONS */}
      <AnimatePresence>
        {isUploadOfficialOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#12141c] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-purple-500">
                  <Plus className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {t("إضافة محتوى إبداعي رسمي", "Add Official Marketing Asset")}
                  </h3>
                </div>
                <button onClick={() => setIsUploadOfficialOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleOfficialUpload} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("العنوان", "Asset Title")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={officialTitle}
                    onChange={(e) => setOfficialTitle(e.target.value)}
                    placeholder={t("مثال: حزمة الهوية البصرية المعتمدة", "e.g. Official Brand Kit 2026")}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("النوع", "Type")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOfficialType("image")}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        officialType === "image"
                          ? "border-purple-500 bg-purple-500/10 text-purple-400"
                          : "border-slate-700 text-slate-400"
                      }`}
                    >
                      {t("صورة", "Image")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfficialType("video")}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        officialType === "video"
                          ? "border-purple-500 bg-purple-500/10 text-purple-400"
                          : "border-slate-700 text-slate-400"
                      }`}
                    >
                      {t("فيديو", "Video")}
                    </button>
                  </div>
                </div>

                {officialType === "video" ? (
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t("مصدر الفيديو الرسمي", "Official Video Source")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOfficialVideoSource("local")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                          officialVideoSource === "local"
                            ? "border-purple-500 bg-purple-500/20 text-purple-400 shadow-sm"
                            : "border-slate-700 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <Video className="w-4 h-4 text-purple-400" />
                        {t("فيديو من الجهاز", "Local Video File")}
                      </button>

                      <button
                        type="button"
                        onClick={() => setOfficialVideoSource("drive")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                          officialVideoSource === "drive"
                            ? "border-blue-500 bg-blue-500/20 text-blue-400 shadow-sm"
                            : "border-slate-700 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        {t("رابط Google Drive", "Drive Link")}
                      </button>
                    </div>

                    {officialVideoSource === "local" ? (
                      <div className="space-y-1 pt-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t("ملف الوسائط المحلي", "Local Media File")}
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setOfficialFile(file);
                            const r = new FileReader();
                            r.onloadend = () => setOfficialPreview(r.result as string);
                            r.readAsDataURL(file);
                          }}
                          className="w-full text-xs text-slate-400"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <HardDrive className="w-4 h-4 text-blue-400" />
                          {t("رابط Google Drive للفيديو", "Google Drive Video Link")} *
                        </label>
                        <input
                          type="url"
                          required
                          value={officialUrl}
                          onChange={(e) => setOfficialUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                          className="w-full px-3 py-2 bg-white dark:bg-[#12141c] border border-slate-700 rounded-xl text-sm text-white"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t("ملف الوسائط", "Media File")}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setOfficialFile(file);
                          const r = new FileReader();
                          r.onloadend = () => setOfficialPreview(r.result as string);
                          r.readAsDataURL(file);
                        }}
                        className="w-full text-xs text-slate-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t("أو الرابط المباشر", "Or Direct URL")}
                      </label>
                      <input
                        type="url"
                        value={officialUrl}
                        onChange={(e) => setOfficialUrl(e.target.value)}
                        placeholder="https://example.com/asset.png"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#181a24] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsUploadOfficialOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500"
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingOfficial}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md"
                  >
                    {isUploadingOfficial ? t("جاري الرفع...", "Uploading...") : t("نشر للجميع", "Publish Asset")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. MEDIA PREVIEW MODAL */}
      <AnimatePresence>
        {previewMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white dark:bg-[#12141c] w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{previewMedia.title}</h3>
                <button onClick={() => setPreviewMedia(null)} className="text-slate-400 hover:text-white">
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

              <div className="flex items-center justify-between pt-2 text-xs">
                <p className="text-slate-400">
                  {t("المُنشئ:", "By:")} <span className="text-white">{previewMedia.uploadedBy.userName}</span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewMedia.fileUrl);
                      toast.success(t("تم نسخ رابط الملف", "Link copied"));
                    }}
                    className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-white hover:bg-slate-700"
                  >
                    {t("نسخ الرابط", "Copy Link")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { useState, useEffect, useMemo, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { libraryDb, libraryStorage } from "../../firebaseLibrary";
import { useToast } from "../../context/ToastContext";
import { useApp } from "../../context/AppContext";
import { useConfirm } from "../../context/ConfirmContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  FileText,
  Bot,
  Image as ImageIcon,
  Tag,
  Layers,
  X,
  UploadCloud,
  Save,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

// Custom Glassmorphic Dropdown Component
function CustomSelect({
  options,
  value,
  onChange,
  label,
  icon: Icon,
  placeholder,
  style,
}) {
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
    <div
      className="ad-custom-select-wrapper"
      ref={containerRef}
      style={{ minWidth: 160, ...style }}
    >
      {label && (
        <label
          className="ad-custom-select-label"
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "var(--text2)",
            marginBottom: "4px",
            display: "block",
          }}
        >
          {label}
        </label>
      )}
      <button
        type="button"
        className={`ad-custom-select-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: "42px",
          borderRadius: "12px",
          background: "rgba(15, 23, 42, 0.8)",
          border: isOpen
            ? "1px solid var(--accent)"
            : "1px solid rgba(255, 255, 255, 0.12)",
          color: "#fff",
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
          transition: "all 0.2s ease",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflow: "hidden",
          }}
        >
          {selectedOption?.icon ? (
            <selectedOption.icon
              size={15}
              style={{ color: "var(--accent)", flexShrink: 0 }}
            />
          ) : Icon ? (
            <Icon size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
          ) : null}
          <span
            className="ad-custom-select-value"
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: selectedOption ? "#fff" : "var(--text3)",
            }}
          >
            {selectedOption ? selectedOption.label : placeholder || ""}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            color: isOpen ? "var(--accent)" : "var(--text3)",
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ad-custom-select-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 99999,
              background: "rgba(13, 18, 32, 0.98)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              borderRadius: "12px",
              padding: "6px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
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
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: isSelected ? "var(--accent)" : "var(--text2)",
                    background: isSelected
                      ? "rgba(59, 130, 246, 0.2)"
                      : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {OptionIcon && (
                      <OptionIcon
                        size={14}
                        style={{
                          color: isSelected ? "var(--accent)" : "var(--text3)",
                        }}
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2
                      size={13}
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

export default function AdminLibrary({ userData }) {
  const { state } = useApp();
  const lang = state?.language || "ar";
  const isEn = lang === "en";

  const toast = useToast();
  const confirm = useConfirm();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Filters & Search
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Collapsible Filter Panel Toggle State
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);

  // Pagination (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("pdf"); // 'pdf' | 'automation'
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [automationFiles, setAutomationFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Image Lightbox View
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  // Dropdown Options
  const categoryFilterOptions = useMemo(
    () => [
      {
        value: "all",
        label: isEn ? "All Categories" : "جميع الأقسام",
        icon: Filter,
      },
      { value: "كتاب", label: isEn ? "E-Books (كتب)" : "كتب", icon: BookOpen },
      {
        value: "قوالب",
        label: isEn ? "Templates (قوالب)" : "قوالب",
        icon: Layers,
      },
    ],
    [isEn],
  );

  const typeFilterOptions = useMemo(
    () => [
      { value: "all", label: isEn ? "All Types" : "جميع الأنواع", icon: Tag },
      { value: "pdf", label: isEn ? "PDF File" : "ملف PDF", icon: FileText },
      {
        value: "automation",
        label: isEn ? "Automation Template" : "قالب أتوميشن",
        icon: Bot,
      },
    ],
    [isEn],
  );

  const modalCategoryOptions = useMemo(
    () => [
      {
        value: "",
        label: isEn ? "Select Category..." : "اختر التصنيف...",
        icon: Tag,
      },
      { value: "كتاب", label: isEn ? "E-Book (كتاب)" : "كتاب", icon: BookOpen },
      {
        value: "قوالب",
        label: isEn ? "Templates (قوالب)" : "قوالب",
        icon: Layers,
      },
    ],
    [isEn],
  );

  const modalTypeOptions = useMemo(
    () => [
      {
        value: "pdf",
        label: isEn ? "PDF Document" : "ملف PDF",
        icon: FileText,
      },
      {
        value: "automation",
        label: isEn ? "Automation Template" : "قالب أتوميشن (مجموعة صور)",
        icon: Bot,
      },
    ],
    [isEn],
  );

  const handleEdit = (b) => {
    setEditingId(b.id);
    setName(b.title || b.name || "");
    setDesc(b.description || "");
    setCategory(b.category || "");
    setType(b.type || "pdf");
    setImageFile(null);
    setPdfFile(null);
    setAutomationFiles([]);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDesc("");
    setCategory("");
    setType("pdf");
    setImageFile(null);
    setPdfFile(null);
    setAutomationFiles([]);
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterType("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filterCategory !== "all" || filterType !== "all" || searchQuery !== "";

  const loadLibrary = async () => {
    if (!userData?.uid) return;
    try {
      const snap = await getDocs(collection(libraryDb, "brandLibrary"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Admin only sees their own private products
      const myProducts = list.filter((p) => p.adminUid === userData.uid);
      myProducts.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setBrands(myProducts);
    } catch (err) {
      console.error(err);
      toast(
        isEn
          ? "Error fetching product library data"
          : "خطأ في جلب بيانات المكتبة",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, [userData]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name.trim())
      return toast(
        isEn ? "Please enter product name" : "أدخل اسم المنتج",
        "error",
      );
    if (!desc.trim())
      return toast(
        isEn ? "Please enter product description" : "أدخل وصف المنتج",
        "error",
      );
    if (!category.trim())
      return toast(isEn ? "Please enter category" : "أدخل التصنيف", "error");

    if (!editingId && !imageFile)
      return toast(
        isEn ? "Please select cover image" : "اختر صورة الغلاف",
        "error",
      );
    if (!editingId && type === "pdf" && !pdfFile)
      return toast(
        isEn ? "Please select PDF file" : "اختر ملف الـ PDF",
        "error",
      );
    if (!editingId && type === "automation" && automationFiles.length === 0)
      return toast(
        isEn ? "Please select template images" : "اختر صور القالب",
        "error",
      );

    setUploading(true);
    try {
      let imageUrl = editingId
        ? brands.find((b) => b.id === editingId)?.imageUrl
        : "";
      let pdfUrl = editingId
        ? brands.find((b) => b.id === editingId)?.pdfUrl
        : "";
      let automationUrls = editingId
        ? brands.find((b) => b.id === editingId)?.automationImages || []
        : [];

      // 1. Upload Cover Image (if new)
      if (imageFile) {
        const imgRef = ref(
          libraryStorage,
          `library/images/${Date.now()}_${imageFile.name}`,
        );
        await uploadBytes(imgRef, imageFile);
        imageUrl = await getDownloadURL(imgRef);
      }

      if (type === "pdf") {
        // 2. Upload PDF (if new)
        if (pdfFile) {
          const pdfRef = ref(
            libraryStorage,
            `library/pdfs/${Date.now()}_${pdfFile.name}`,
          );
          await uploadBytes(pdfRef, pdfFile);
          pdfUrl = await getDownloadURL(pdfRef);
        }
      } else {
        // 3. Upload Multiple Automation Images (if new set)
        if (automationFiles.length > 0) {
          automationUrls = [];
          for (const file of automationFiles) {
            const fileRef = ref(
              libraryStorage,
              `library/automation/${Date.now()}_${file.name}`,
            );
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            automationUrls.push(url);
          }
        }
        // 4. Upload Optional PDF for Automation
        if (pdfFile) {
          const pdfRef = ref(
            libraryStorage,
            `library/pdfs/${Date.now()}_${pdfFile.name}`,
          );
          await uploadBytes(pdfRef, pdfFile);
          pdfUrl = await getDownloadURL(pdfRef);
        }
      }

      const data = {
        title: name.trim(),
        description: desc.trim(),
        category: category.trim(),
        type,
        imageUrl,
        pdfUrl: pdfUrl || null,
        automationImages: type === "automation" ? automationUrls : null,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(libraryDb, "brandLibrary", editingId), data);
        toast(
          isEn
            ?"Product updated successfully!"
            :"تم تحديث المنتج بنجاح",
          "success",
        );
      } else {
        await addDoc(collection(libraryDb, "brandLibrary"), {
          ...data,
          createdAt: serverTimestamp(),
          isPrivate: true,
          adminUid: userData.uid,
          brandName:
            userData.brandName || userData.ownerName || "Unknown Brand",
        });
        toast(
          isEn
            ?"Private product added successfully!"
            :"تم إضافة المنتج الخاص بك بنجاح",
          "success",
        );
      }

      resetForm();
      if (document.getElementById("libImg"))
        document.getElementById("libImg").value = "";
      if (document.getElementById("libPdf"))
        document.getElementById("libPdf").value = "";
      if (document.getElementById("libAuto"))
        document.getElementById("libAuto").value = "";

      await loadLibrary();
    } catch (err) {
      console.error(err);
      toast(
        editingId
          ? isEn
            ? "Error updating product"
            : "حدث خطأ أثناء التحديث"
          : isEn
            ? "Error uploading product"
            : "حدث خطأ أثناء الرفع",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (b) => {
    const isConfirmed = await confirm(
      isEn
        ? `Are you sure you want to delete "${b.title || b.name}"?`
        : `هل تريد حذف "${b.title || b.name}"؟`,
      isEn ? "Confirm Product Deletion" : "تأكيد حذف المنتج",
    );
    if (!isConfirmed) return;

    try {
      await deleteDoc(doc(libraryDb, "brandLibrary", b.id));
      toast(
        isEn ? "Product deleted successfully" : "تم الحذف بنجاح",
        "success",
      );
      await loadLibrary();
    } catch (err) {
      console.error(err);
      toast(isEn ? "Failed to delete product" : "خطأ في الحذف", "error");
    }
  };

  // Filter products
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchesCategory =
        filterCategory === "all" || b.category === filterCategory;
      const matchesType = filterType === "all" || b.type === filterType;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (b.title || b.name || "").toLowerCase().includes(query) ||
        (b.description || "").toLowerCase().includes(query) ||
        (b.category || "").toLowerCase().includes(query);
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [brands, filterCategory, filterType, searchQuery]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterType, searchQuery]);

  // Paginated products (6 per page)
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage) || 1;
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(start, start + itemsPerPage);
  }, [filteredBrands, currentPage, itemsPerPage]);

  // Export CSV Report
  const handleExportCSV = () => {
    if (filteredBrands.length === 0) {
      return toast(
        isEn ? "No products available to export" : "لا توجد منتجات للتصدير",
        "warning",
      );
    }
    const headers = [
      isEn ? "Title" : "عنوان المنتج",
      isEn ? "Category" : "التصنيف",
      isEn ? "Type" : "النوع",
      isEn ? "Description" : "الوصف",
      "Image URL",
    ];
    const rows = filteredBrands.map((b) => [
      `"${(b.title || b.name || "").replace(/"/g, '""')}"`,
      `"${(b.category || "").replace(/"/g, '""')}"`,
      `"${b.type}"`,
      `"${(b.description || "").replace(/"/g, '""')}"`,
      `"${b.imageUrl || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Products_Library_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(
      isEn ? "CSV Exported successfully!" : "تم تصدير ملف CSV بنجاح!",
      "success",
    );
  };

  // Image Preview calculation for modal
  const coverImagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (editingId)
      return brands.find((b) => b.id === editingId)?.imageUrl || null;
    return null;
  }, [imageFile, editingId, brands]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="ad-content animate-in"
      dir={isEn ? "ltr" : "rtl"}
    >
      <div className="ad-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div
          className="ad-table-card"
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            overflow: "hidden",
          }}
        >
          {/* Header & Controls Bar - Professional Desktop Layout */}
          <div
            className="ad-card-header"
            style={{
              padding: "24px 28px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              justify: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "18px",
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98))",
            }}
          >
            {/* Title & Badge */}
            <div
              className="ad-card-title"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                fontSize: "19px",
                fontWeight: "800",
                color: "#fff",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(124, 58, 237, 0.15))",
                  border: "1px solid rgba(59, 130, 246, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.2)",
                }}
              >
                <Library size={22} style={{ color: "var(--accent)" }} />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span>
                    {isEn
                      ? "Private Brand Product Library"
                      : "منتجات البراند الخاصة"}
                  </span>
                  <span
                    className="ad-card-count"
                    style={{
                      padding: "3px 12px",
                      borderRadius: "20px",
                      background: "rgba(59, 130, 246, 0.18)",
                      color: "var(--accent)",
                      fontSize: "12px",
                      fontWeight: "800",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    {filteredBrands.length}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text3)",
                    fontWeight: "600",
                  }}
                >
                  {isEn
                    ? "Manage and organize your private product resources"
                    : "إدارة وتنظيم موارد منتجاتك الخاصة للعملاء"}
                </span>
              </div>
            </div>

            {/* Desktop Controls Toolbar */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Instant Search Input */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0, 0, 0, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  padding: "6px 14px",
                  height: "42px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <Search size={16} style={{ color: "var(--accent)" }} />
                <input
                  type="text"
                  placeholder={
                    isEn ? "Search products..." : "بحث في منتجاتك..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  dir={isEn ? "ltr" : "rtl"}
                  style={{
                    width: "160px",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    outline: "none",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text3)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Collapsible Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
                title={
                  isEn ? "Toggle Filter Panel" : "إظهار/إخفاء لوحة التصفية"
                }
                style={{
                  height: "42px",
                  padding: "0 16px",
                  borderRadius: "12px",
                  background: !isFilterCollapsed
                    ? "rgba(59, 130, 246, 0.22)"
                    : "rgba(0, 0, 0, 0.45)",
                  border: !isFilterCollapsed
                    ? "1px solid var(--accent)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
                  color: !isFilterCollapsed ? "var(--accent)" : "#fff",
                  fontWeight: "800",
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <SlidersHorizontal size={16} />
                <span>{isEn ? "Filters" : "التصفية"}</span>
                {hasActiveFilters && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      boxShadow: "0 0 8px var(--accent)",
                    }}
                  />
                )}
              </button>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                title={isEn ? "Export CSV" : "تصدير التقرير"}
                style={{
                  height: "42px",
                  padding: "0 14px",
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
                <span>{isEn ? "Export CSV" : "تصدير CSV"}</span>
              </button>

              {/* Add New Product Primary Button */}
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                style={{
                  height: "42px",
                  padding: "0 18px",
                  background: "linear-gradient(135deg, var(--accent), #7c3aed)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 18px rgba(59, 130, 246, 0.35)",
                  transition: "all 0.2s ease",
                }}
              >
                <Plus size={16} />
                <span>{isEn ? "Add Product" : "إضافة منتج جديد"}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          <AnimatePresence>
            {!isFilterCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "rgba(13, 18, 32, 0.95)",
                  borderBottom: "1px solid var(--line)",
                  padding: "18px 28px",
                  overflow: "visible",
                  position: "relative",
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    alignItems: "flex-end",
                  }}
                >
                  {/* Category Filter CustomSelect */}
                  <CustomSelect
                    label={isEn ? "Category Filter" : "تصفية حسب التصنيف"}
                    options={categoryFilterOptions}
                    value={filterCategory}
                    onChange={setFilterCategory}
                    icon={Filter}
                    style={{ width: "100%" }}
                  />

                  {/* Type Filter CustomSelect */}
                  <CustomSelect
                    label={isEn ? "Type Filter" : "تصفية حسب النوع"}
                    options={typeFilterOptions}
                    value={filterType}
                    onChange={setFilterType}
                    icon={Tag}
                    style={{ width: "100%" }}
                  />

                  {/* Reset Filter Action */}
                  {hasActiveFilters && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={resetFilters}
                        style={{
                          height: "42px",
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
                          width: "100%",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <RotateCcw size={15} />
                        <span>
                          {isEn
                            ? "Reset All Filters"
                            : "إعادة ضبط كافة الفلاتر"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sub Notice Bar */}
          <div
            style={{
              padding: "12px 28px",
              fontSize: "12px",
              color: "var(--text2)",
              background: "rgba(0, 0, 0, 0.3)",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Sparkles size={15} style={{ color: "var(--accent)" }} />
            <span>
              {isEn
                ? "Notice: Products created here are private and exclusively visible to your clients."
                : "💡 تنويه: المنتجات التي تضيفها هنا تظهر لعملائك فقط وبشكل خاص."}
            </span>
          </div>

          {/* Table Body & Loading States - ALWAYS RTL (dir="rtl") */}
          {loading ? (
            <div className="ad-empty" style={{ padding: "60px 20px" }}>
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "var(--accent)", margin: "0 auto 12px" }}
              />
              <div style={{ fontSize: "14px", color: "var(--text2)" }}>
                {isEn ? "Loading product library..." : "جاري التحميل..."}
              </div>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div
              className="ad-empty"
              style={{ padding: "60px 20px", textAlign: "center" }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <BookOpen size={28} style={{ color: "var(--text3)" }} />
              </div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "800",
                  color: "#fff",
                  marginBottom: "4px",
                }}
              >
                {isEn ? "No products found" : "لم يتم العثور على منتجات"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)" }}>
                {isEn
                  ? "Try adjusting your search query or create a new private product."
                  : "جرب تغيير كلمة البحث أو أضف منتجاً خاصاً جديداً."}
              </div>
            </div>
          ) : (
            <div className="ad-table-wrapper" dir="rtl">
              <table
                className="ad-table"
                dir="rtl"
                style={{ textAlign: "right" }}
              >
                <thead>ٌ
                  <tr>
                    <th style={{ textAlign: "right" }}>
                      {isEn ? "Product Details" : "المنتج والغلاف"}
                    </th>
                    <th style={{ textAlign: "center" }}>
                      {isEn ? "Category" : "التصنيف"}
                    </th>
                    <th style={{ textAlign: "center" }}>
                      {isEn ? "Product Type" : "نوع المنتج"}
                    </th>
                    <th style={{ textAlign: "center" }}>
                      {isEn ? "Actions" : "الإجراءات"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBrands.map((b) => (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Product Thumbnail & Title */}
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                          }}
                        >
                          <div
                            onClick={() => setPreviewModalUrl(b.imageUrl)}
                            title={
                              isEn
                                ? "Click to view image"
                                : "اضغط لمعاينة الصورة"
                            }
                            style={{
                              width: "46px",
                              height: "46px",
                              borderRadius: "10px",
                              overflow: "hidden",
                              background: "rgba(0, 0, 0, 0.4)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              cursor: "pointer",
                              flexShrink: 0,
                              position: "relative",
                            }}
                          >
                            {b.imageUrl ? (
                              <img
                                src={b.imageUrl}
                                alt={b.title || b.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ImageIcon
                                  size={20}
                                  style={{ color: "var(--text3)" }}
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <strong
                              style={{
                                color: "#fff",
                                fontSize: "14px",
                                display: "block",
                                marginBottom: "2px",
                              }}
                            >
                              {b.title || b.name}
                            </strong>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--text3)",
                                display: "block",
                                maxWidth: "280px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {b.description ||
                                (isEn ? "No description" : "لا يوجد وصف")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            background: "rgba(59, 130, 246, 0.12)",
                            color: "#3B82F6",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Tag size={12} />
                          <span>
                            {b.category || (isEn ? "General" : "عام")}
                          </span>
                        </span>
                      </td>

                      {/* Product Type Badge */}
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            background:
                              b.type === "automation"
                                ? "rgba(139, 92, 246, 0.12)"
                                : "rgba(16, 185, 129, 0.12)",
                            color:
                              b.type === "automation" ? "#8B5CF6" : "#10B981",
                            border: `1px solid ${b.type === "automation" ? "rgba(139, 92, 246, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          {b.type === "automation" ? (
                            <Bot size={13} />
                          ) : (
                            <FileText size={13} />
                          )}
                          <span>
                            {b.type === "automation"
                              ? isEn
                                ? "Automation Template"
                                : "قالب أتوميشن"
                              : isEn
                                ? "PDF Document"
                                : "ملف PDF"}
                          </span>
                        </span>
                      </td>

                      {/* Table Actions (Icons Only without Labels) */}
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* View Asset Button */}
                          {(b.pdfUrl || b.imageUrl) && (
                            <a
                              href={b.pdfUrl || b.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              title={
                                isEn ? "View Asset ↗" : "فتح و معاينة الملف ↗"
                              }
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "10px",
                                background: "rgba(16, 185, 129, 0.12)",
                                color: "#10B981",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s ease",
                                textDecoration: "none",
                              }}
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleEdit(b)}
                            title={isEn ? "Edit Product" : "تعديل المنتج"}
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "10px",
                              background: "rgba(59, 130, 246, 0.12)",
                              color: "#3B82F6",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(b)}
                            title={isEn ? "Delete Product" : "حذف المنتج"}
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "10px",
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "#EF4444",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Bar (6 Items per page) */}
              {totalPages > 1 && (
                <div
                  style={{
                    padding: "16px 24px",
                    borderTop: "1px solid var(--line)",
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    background: "rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text3)",
                      fontWeight: "700",
                    }}
                  >
                    {isEn
                      ? `Page ${currentPage} of ${totalPages} (${filteredBrands.length} Total Items)`
                      : `صفحة ${currentPage} من ${totalPages} (إجمالي ${filteredBrands.length} عنصر)`}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      style={{
                        height: "34px",
                        padding: "0 12px",
                        borderRadius: "8px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: currentPage === 1 ? "var(--text3)" : "#fff",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: "800",
                      }}
                    >
                      <ChevronRight size={16} />
                      <span>{isEn ? "Previous" : "السابق"}</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "8px",
                            background:
                              currentPage === p
                                ? "var(--accent)"
                                : "rgba(255, 255, 255, 0.05)",
                            border: `1px solid ${currentPage === p ? "var(--accent)" : "rgba(255, 255, 255, 0.1)"}`,
                            color: "#fff",
                            fontWeight: "800",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          {p}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      style={{
                        height: "34px",
                        padding: "0 12px",
                        borderRadius: "8px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color:
                          currentPage === totalPages ? "var(--text3)" : "#fff",
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: "800",
                      }}
                    >
                      <span>{isEn ? "Next" : "التالي"}</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {previewModalUrl && (
          <div
            className="sa-modal-overlay"
            onClick={() => setPreviewModalUrl(null)}
            style={{
              zIndex: 11000,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "600px",
                padding: "16px",
                background: "#0b132b",
                border: "1px solid var(--line)",
                borderRadius: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ImageIcon size={16} style={{ color: "var(--accent)" }} />
                  <span>
                    {isEn ? "Cover Image Preview" : "معاينة صورة الغلاف"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "8px",
                    width: "30px",
                    height: "30px",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <img
                src={previewModalUrl}
                alt="Cover Preview"
                style={{
                  width: "100%",
                  maxHeight: "480px",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Popup Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="sa-modal-overlay"
            onClick={resetForm}
            style={{
              zIndex: 10000,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="sa-modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "620px",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background:
                  "linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(13, 18, 32, 0.99))",
                padding: "28px",
                boxShadow: "0 30px 70px rgba(0, 0, 0, 0.6)",
              }}
              dir={isEn ? "ltr" : "rtl"}
            >
              {/* Modal Header */}
              <div
                className="sa-modal-header"
                style={{
                  borderBottom: "1px solid var(--line)",
                  paddingBottom: "16px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#fff",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {editingId ? (
                    <Edit2 size={20} style={{ color: "var(--accent)" }} />
                  ) : (
                    <Plus size={20} style={{ color: "var(--accent)" }} />
                  )}
                  <span>
                    {editingId
                      ? isEn
                        ? "Edit Private Product"
                        : "تعديل المنتج الخاص"
                      : isEn
                        ? "Add Private Product"
                        : "إضافة منتج خاص جديد"}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    color: "#fff",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <X size={15} />
                  <span>{isEn ? "Close" : "إغلاق"}</span>
                </button>
              </div>

              {/* Modal Body */}
              <div
                className="sa-modal-body"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  paddingRight: isEn ? "0" : "4px",
                  paddingLeft: isEn ? "4px" : "0",
                }}
              >
                <form onSubmit={handleUpload}>
                  {/* Product Title Input */}
                  <div className="field" style={{ marginBottom: "18px" }}>
                    <label
                      className="field-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: "8px",
                      }}
                    >
                      <FileText size={15} style={{ color: "var(--accent)" }} />
                      <span>{isEn ? "Product Name" : "اسم المنتج"}</span>
                    </label>
                    <input
                      className="field-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        isEn
                          ? "e.g. E-Commerce Mastery Guide"
                          : "مثال: كتاب دليل التجار المتقدم"
                      }
                      disabled={uploading}
                      dir={isEn ? "ltr" : "rtl"}
                      style={{
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  {/* Product Description Input */}
                  <div className="field" style={{ marginBottom: "18px" }}>
                    <label
                      className="field-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: "8px",
                      }}
                    >
                      <Layers size={15} style={{ color: "var(--accent)" }} />
                      <span>{isEn ? "Product Description" : "وصف المنتج"}</span>
                    </label>
                    <textarea
                      className="field-input"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder={
                        isEn
                          ? "Write a clear, persuasive overview for your clients..."
                          : "اكتب وصفاً مختصراً وواضحاً لعملائك..."
                      }
                      style={{
                        minHeight: "85px",
                        borderRadius: "12px",
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#fff",
                        fontSize: "13px",
                        resize: "vertical",
                      }}
                      disabled={uploading}
                      dir={isEn ? "ltr" : "rtl"}
                    />
                  </div>

                  {/* Category Dropdown (CustomSelect) */}
                  <div className="field" style={{ marginBottom: "18px" }}>
                    <label
                      className="field-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: "8px",
                      }}
                    >
                      <Tag size={15} style={{ color: "var(--accent)" }} />
                      <span>
                        {isEn ? "Category (Section)" : "التصنيف (القسم)"}
                      </span>
                    </label>
                    <CustomSelect
                      options={modalCategoryOptions}
                      value={category}
                      onChange={setCategory}
                      icon={Tag}
                      placeholder={
                        isEn ? "Select Category..." : "اختر التصنيف..."
                      }
                      style={{ width: "100%" }}
                    />
                  </div>

                  {/* Product Type Dropdown (CustomSelect) */}
                  <div className="field" style={{ marginBottom: "22px" }}>
                    <label
                      className="field-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: "8px",
                      }}
                    >
                      <Bot size={15} style={{ color: "var(--accent)" }} />
                      <span>{isEn ? "Product Type" : "نوع المنتج"}</span>
                    </label>
                    <CustomSelect
                      options={modalTypeOptions}
                      value={type}
                      onChange={setType}
                      icon={Bot}
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div
                    className="sa-form-divider"
                    style={{
                      height: "1px",
                      background: "var(--line)",
                      margin: "20px 0",
                    }}
                  />

                  {/* Cover Image Upload & Live Preview */}
                  <div className="field" style={{ marginBottom: "20px" }}>
                    <label
                      className="field-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "#fff",
                        marginBottom: "8px",
                      }}
                    >
                      <ImageIcon size={15} style={{ color: "var(--accent)" }} />
                      <span>
                        {isEn
                          ? "Cover Image (Thumbnail)"
                          : "صورة الغلاف (Cover Image)"}
                      </span>
                    </label>

                    <label
                      className="sa-file-label"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed rgba(59, 130, 246, 0.3)",
                        borderRadius: "16px",
                        padding: "24px",
                        cursor: "pointer",
                        background: "rgba(59, 130, 246, 0.04)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        id="libImg"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => setImageFile(e.target.files[0])}
                        disabled={uploading}
                      />

                      {coverImagePreview ? (
                        <div style={{ textAlign: "center" }}>
                          <img
                            src={coverImagePreview}
                            alt="Cover Preview"
                            style={{
                              width: "90px",
                              height: "90px",
                              objectFit: "cover",
                              borderRadius: "12px",
                              border: "2px solid var(--accent)",
                              marginBottom: "10px",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "800",
                              color: "#10B981",
                              display: "block",
                            }}
                          >
                            {imageFile
                              ? isEn
                                ? `Selected: ${imageFile.name}`
                                : `تم اختيار: ${imageFile.name}`
                              : isEn
                                ? "Current Image Active (Click to replace)"
                                : "الصورة الحالية نشطة (اضغط للتغيير)"}
                          </span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud
                            size={32}
                            style={{
                              color: "var(--accent)",
                              marginBottom: "10px",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "800",
                              color: "#fff",
                            }}
                          >
                            {isEn
                              ? "Click to upload cover image"
                              : "اضغط هنا لاختيار صورة الغلاف"}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text3)",
                              marginTop: "4px",
                            }}
                          >
                            {isEn
                              ? "PNG, JPG or WebP"
                              : "يدعم صيغ PNG, JPG, WebP"}
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* PDF or Automation Files Section */}
                  {type === "pdf" ? (
                    <div className="field" style={{ marginBottom: "20px" }}>
                      <label
                        className="field-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          fontWeight: "800",
                          color: "#fff",
                          marginBottom: "8px",
                        }}
                      >
                        <FileText size={15} style={{ color: "#10B981" }} />
                        <span>
                          {isEn
                            ? "PDF Document File (Required)"
                            : "ملف الـ PDF (أساسي)"}
                        </span>
                      </label>
                      <label
                        className="sa-file-label"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px dashed rgba(16, 185, 129, 0.3)",
                          borderRadius: "16px",
                          padding: "20px",
                          cursor: "pointer",
                          background: "rgba(16, 185, 129, 0.04)",
                        }}
                      >
                        <input
                          id="libPdf"
                          type="file"
                          accept=".pdf"
                          style={{ display: "none" }}
                          onChange={(e) => setPdfFile(e.target.files[0])}
                          disabled={uploading}
                        />
                        <FileText
                          size={28}
                          style={{ color: "#10B981", marginBottom: "8px" }}
                        />
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#fff",
                          }}
                        >
                          {pdfFile
                            ? pdfFile.name
                            : isEn
                              ? "Click to select PDF document"
                              : "اضغط لاختيار ملف PDF"}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <>
                      {/* Automation Image Files */}
                      <div className="field" style={{ marginBottom: "20px" }}>
                        <label
                          className="field-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#fff",
                            marginBottom: "8px",
                          }}
                        >
                          <Bot size={15} style={{ color: "#8B5CF6" }} />
                          <span>
                            {isEn
                              ? "Automation Template Images"
                              : "صور القالب (مجموعة صور)"}
                          </span>
                        </label>
                        <label
                          className="sa-file-label"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px dashed rgba(139, 92, 246, 0.3)",
                            borderRadius: "16px",
                            padding: "20px",
                            cursor: "pointer",
                            background: "rgba(139, 92, 246, 0.04)",
                          }}
                        >
                          <input
                            id="libAuto"
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={(e) =>
                              setAutomationFiles(Array.from(e.target.files))
                            }
                            disabled={uploading}
                          />
                          <Bot
                            size={28}
                            style={{ color: "#8B5CF6", marginBottom: "8px" }}
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "800",
                              color: "#fff",
                            }}
                          >
                            {automationFiles.length > 0
                              ? isEn
                                ? `${automationFiles.length} Images Selected`
                                : `تم اختيار ${automationFiles.length} صور`
                              : isEn
                                ? "Click to select automation images set"
                                : "اضغط لاختيار مجموعة صور القالب"}
                          </span>
                        </label>
                      </div>

                      {/* Optional PDF File */}
                      <div className="field" style={{ marginBottom: "20px" }}>
                        <label
                          className="field-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: "800",
                            color: "#fff",
                            marginBottom: "8px",
                          }}
                        >
                          <FileText
                            size={15}
                            style={{ color: "var(--text3)" }}
                          />
                          <span>
                            {isEn
                              ? "Optional Guide (PDF)"
                              : "ملف شرح إضافي (PDF اختياري)"}
                          </span>
                        </label>
                        <label
                          className="sa-file-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            border: "1px dashed rgba(255, 255, 255, 0.15)",
                            borderRadius: "12px",
                            padding: "14px",
                            cursor: "pointer",
                            background: "rgba(255, 255, 255, 0.02)",
                          }}
                        >
                          <input
                            id="libPdf"
                            type="file"
                            accept=".pdf"
                            style={{ display: "none" }}
                            onChange={(e) => setPdfFile(e.target.files[0])}
                            disabled={uploading}
                          />
                          <FileText
                            size={18}
                            style={{ color: "var(--text3)" }}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text2)",
                              fontWeight: "700",
                            }}
                          >
                            {pdfFile
                              ? pdfFile.name
                              : isEn
                                ? "Attach Optional PDF Guide"
                                : "اضغط لإضافة ملف شرح PDF"}
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Submit / Action Buttons */}
                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "28px" }}
                  >
                    <button
                      type="submit"
                      disabled={uploading}
                      style={{
                        flex: 1,
                        height: "46px",
                        background: "var(--accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "800",
                        fontSize: "13px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: uploading ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 18px rgba(59, 130, 246, 0.35)",
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>
                            {isEn
                              ? "Saving Product..."
                              : "جاري الحفظ والرفع..."}
                          </span>
                        </>
                      ) : (
                        <>
                          {editingId ? (
                            <Save size={18} />
                          ) : (
                            <UploadCloud size={18} />
                          )}
                          <span>
                            {editingId
                              ? isEn
                                ? "Save Changes"
                                : "حفظ التعديلات"
                              : isEn
                                ? "Upload Product"
                                : "رفع المنتج"}
                          </span>
                        </>
                      )}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        style={{
                          flex: 0.4,
                          height: "46px",
                          borderRadius: "12px",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        {isEn ? "Cancel" : "إلغاء"}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import {
  Edit2,
  Trash2,
  Globe,
  Plus,
  Search,
  RotateCcw,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  Info,
  X,
  Layout,
  Sparkles,
  ShoppingBag,
  Palette,
  Code,
  Smartphone,
  Rocket,
  Heart,
  BookOpen,
  Layers,
  FileCode,
  Sliders,
  Star,
  Briefcase,
  MessageSquare,
  Image,
  Video,
  Music,
  Phone,
  Mail,
  MapPin,
  Users,
  Settings,
  Shield,
  CreditCard,
  Activity,
  Gift,
  Coffee,
  Zap,
  Bell,
} from "lucide-react";

const iconMap = {
  layout: Layout,
  globe: Globe,
  sparkles: Sparkles,
  shopping: ShoppingBag,
  palette: Palette,
  code: Code,
  mobile: Smartphone,
  rocket: Rocket,
  heart: Heart,
  book: BookOpen,
  layers: Layers,
  star: Star,
  briefcase: Briefcase,
  message: MessageSquare,
  image: Image,
  video: Video,
  music: Music,
  phone: Phone,
  mail: Mail,
  map: MapPin,
  calendar: Calendar,
  users: Users,
  settings: Settings,
  shield: Shield,
  creditCard: CreditCard,
  activity: Activity,
  search: Search,
  gift: Gift,
  coffee: Coffee,
  zap: Zap,
  bell: Bell,
};

function renderTemplateIcon(iconName, size = 20) {
  const IconComp = iconMap[iconName];
  if (IconComp)
    return <IconComp size={size} style={{ color: "var(--accent)" }} />;
  return <span style={{ fontSize: size }}>{iconName || "🎨"}</span>;
}

function CustomFilterSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value) || options[0];
  const Icon = selectedOption.icon;

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isOpen]);

  return (
    <div
      className="sa-custom-select-container"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={`sa-custom-select-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ minWidth: 150 }}
      >
        <span className="sa-custom-select-trigger-content">
          {Icon && <Icon size={14} className="sa-custom-select-icon" />}
          <span>{selectedOption?.label || selectedOption?.value || value}</span>
        </span>
        <ChevronDown
          size={14}
          className="sa-custom-select-chevron"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {isOpen && (
        <div
          className="sa-custom-select-dropdown"
          style={{ minWidth: 170, maxHeight: 240, overflowY: "auto" }}
        >
          {options.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                className={`sa-custom-select-option ${opt.value === value ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {OptIcon && <OptIcon size={12} />}
                  <span>{opt.label}</span>
                </span>
                {opt.value === value && (
                  <Check size={12} className="sa-custom-select-check" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SuperAdminLandingPages() {
  const toast = useToast();
  const confirm = useConfirm();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [icon, setIcon] = useState("layout");
  const [codeAr, setCodeAr] = useState("");
  const [codeEn, setCodeEn] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters & Search States
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);

  // Modals / Details Views
  const [viewingCode, setViewingCode] = useState(null); // { title: string, code: string }
  const [viewingDetails, setViewingDetails] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, searchQuery]);

  const handlePreview = (code) => {
    if (!code) return toast("لا يوجد كود للمعاينة", "error");

    let processedCode = code
      .replace(/{{brandName}}/g, "GigSniper Brand")
      .replace(/{{colorHex}}/g, "#3B82F6")
      .replace(/{{secondaryColor}}/g, "#0f172a")
      .replace(/{{nicheName}}/g, "Marketing Agency");

    if (!processedCode.includes("<html")) {
      processedCode = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
          <style>body { font-family: 'Cairo', sans-serif; }</style>
        </head>
        <body class="bg-slate-50">
          ${processedCode}
        </body>
        </html>
      `;
    }

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(processedCode);
      win.document.close();
    } else {
      toast("تم حظر النافذة المنبثقة! يرجى السماح بها للمعاينة", "error");
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        collection(db, "tc_website_templates_gallery"),
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTemplates(list);
    } catch (err) {
      console.error(err);
      toast("خطأ في تحميل القوالب", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNameAr("");
    setNameEn("");
    setDescAr("");
    setDescEn("");
    setIcon("layout");
    setCodeAr("");
    setCodeEn("");
    setCategory("");
    setNewCategory("");
    setIsModalOpen(false);
  };

  const handleEdit = (tpl) => {
    setEditingId(tpl.id);
    setNameAr(tpl.name_ar || "");
    setNameEn(tpl.name_en || "");
    setDescAr(tpl.description_ar || "");
    setDescEn(tpl.description_en || "");
    setIcon(tpl.icon || "layout");
    setCodeAr(tpl.code_ar || "");
    setCodeEn(tpl.code_en || "");
    setCategory(tpl.category || "");
    setNewCategory("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameAr || !nameEn || !codeAr || !codeEn) {
      return toast("يرجى ملء جميع الحقول الأساسية (الاسم والكود)", "error");
    }

    setSaving(true);
    try {
      const data = {
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
        description_ar: descAr.trim(),
        description_en: descEn.trim(),
        icon: icon.trim(),
        code_ar: codeAr.trim(),
        code_en: codeEn.trim(),
        category: newCategory.trim() || category || "عام",
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await setDoc(doc(db, "tc_website_templates_gallery", editingId), data, {
          merge: true,
        });
        toast("تم تحديث القالب بنجاح ✅", "success");
      } else {
        await addDoc(collection(db, "tc_website_templates_gallery"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast("تم إضافة القالب بنجاح ✅", "success");
      }

      resetForm();
      await loadTemplates();
    } catch (err) {
      console.error(err);
      toast("حدث خطأ أثناء الحفظ", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tpl) => {
    const isConfirmed = await confirm(`هل تريد حذف قالب "${tpl.name_ar}"؟`);
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(db, "tc_website_templates_gallery", tpl.id));
      toast("تم الحذف بنجاح", "success");
      await loadTemplates();
    } catch (err) {
      toast("خطأ في الحذف", "error");
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast("تم نسخ الكود البرمجي بنجاح 📋", "success");
  };

  const handleDownloadCode = (code, filename) => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "template_code.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("تم بدء تحميل الملف 📥", "success");
  };

  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel Arabic compatibility
    csvContent +=
      "اسم القالب (عربي),اسم القالب (EN),التصنيف,الوصف (عربي),الوصف (EN)\n";

    filteredTemplates.forEach((t) => {
      const nameAr = t.name_ar || "—";
      const nameEn = t.name_en || "—";
      const category = t.category || "عام";
      const descAr = t.description_ar || "—";
      const descEn = t.description_en || "—";

      csvContent += `"${nameAr}","${nameEn}","${category}","${descAr}","${descEn}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `templates_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("تم تصدير البيانات بنجاح 📊", "success");
  };

  const handleResetFilters = () => {
    setFilterCategory("All");
    setSearchQuery("");
  };

  // Filtered Templates logic
  const getFilteredTemplates = () => {
    return templates.filter((t) => {
      if (filterCategory !== "All") {
        if (t.category !== filterCategory) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameAr = (t.name_ar || "").toLowerCase();
        const nameEn = (t.name_en || "").toLowerCase();
        const descAr = (t.description_ar || "").toLowerCase();
        const descEn = (t.description_en || "").toLowerCase();
        if (
          !nameAr.includes(q) &&
          !nameEn.includes(q) &&
          !descAr.includes(q) &&
          !descEn.includes(q)
        )
          return false;
      }

      return true;
    });
  };

  const filteredTemplates = getFilteredTemplates();
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const categoryFilterOptions = [
    { value: "All", label: "كل الأقسام", icon: Layers },
    ...[...new Set(templates.map((t) => t.category).filter(Boolean))].map(
      (cat) => ({
        value: cat,
        label: cat,
        icon: Layers,
      }),
    ),
  ];

  const modalCategoryOptions = [
    { value: "", label: "اختر قسم موجود...", icon: Layers },
    ...[...new Set(templates.map((t) => t.category).filter(Boolean))].map(
      (cat) => ({
        value: cat,
        label: cat,
        icon: Layers,
      }),
    ),
  ];

  const hasActiveFilters = filterCategory !== "All" || searchQuery !== "";

  return (
    <div className="sa-grid" style={{ gridTemplateColumns: "1fr" }}>
      {/* Templates List */}
      <div className="sa-table-card">
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
              <Globe size={20} style={{ color: "var(--accent)" }} />
              <span>صفحات الهبوط (قوالب الموقع)</span>
              <span className="sa-card-count">{filteredTemplates.length}</span>
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
              <button
                type="button"
                className="sa-add-prod-btn"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>إضافة قالب جديد</span>
              </button>

              <button
                type="button"
                className="sa-export-btn"
                onClick={handleExportCSV}
                title="تصدير القوالب إلى CSV"
              >
                <Download size={16} />
                <span>تصدير CSV</span>
              </button>

              <button
                type="button"
                className="sa-export-btn"
                onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                style={{
                  background: isFiltersCollapsed
                    ? "transparent"
                    : "rgba(59, 130, 246, 0.1)",
                  borderColor: isFiltersCollapsed
                    ? "var(--line)"
                    : "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Sliders size={16} />
                <span>خيارات البحث</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="sa-reset-btn"
                  onClick={handleResetFilters}
                  title="إعادة تعيين الفلاتر"
                >
                  <RotateCcw size={14} />
                  <span>إعادة تعيين</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Filtering and Search Controls */}
          {!isFiltersCollapsed && (
            <div className="sa-filters-bar">
              <div className="sa-filters-left">
                <CustomFilterSelect
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={categoryFilterOptions}
                />
              </div>

              <div className="sa-filters-right">
                <div
                  className="sa-search-box"
                  style={{ width: "100%", maxWidth: 260, margin: 0 }}
                >
                  <input
                    type="text"
                    placeholder="بحث باسم القالب أو الوصف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", paddingRight: 32 }}
                  />
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      right: 12,
                      color: "var(--text3)",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div
            style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}
          >
            <div
              className="sa-submit-spinner"
              style={{ margin: "20px auto" }}
            />
            <span>جاري التحميل...</span>
          </div>
        ) : paginatedTemplates.length === 0 ? (
          <div className="sa-empty" style={{ padding: "60px 0" }}>
            <div
              className="sa-empty-icon"
              style={{ background: "none", fontSize: "inherit", padding: 0 }}
            >
              <FolderOpen
                size={48}
                style={{ color: "var(--text3)", opacity: 0.6 }}
              />
            </div>
            <div
              style={{ marginTop: 12, color: "var(--text2)", fontWeight: 700 }}
            >
              لا توجد قوالب تطابق خيارات البحث الحالية
            </div>
          </div>
        ) : (
          <>
            <div className="sa-table-wrapper">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>القالب</th>
                    <th>القسم</th>
                    <th>الوصف</th>
                    <th>الأكواد</th>
                    <th>معاينة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTemplates.map((tpl) => (
                    <tr key={tpl.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--line)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {renderTemplateIcon(tpl.icon, 18)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: "#fff" }}>
                              {tpl.name_ar}
                            </div>
                            <div
                              style={{ fontSize: 10, color: "var(--text3)" }}
                            >
                              {tpl.name_en}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="sa-role-badge sa-role-user"
                          style={{ fontSize: 10 }}
                        >
                          {tpl.category || "عام"}
                        </span>
                      </td>
                      <td>
                        <div
                          onClick={() => setViewingDetails(tpl)}
                          style={{
                            maxWidth: 200,
                            fontSize: 11,
                            color: "var(--text2)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                          title="انقر لعرض كامل التفاصيل"
                        >
                          <Info
                            size={12}
                            style={{ color: "var(--accent)", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              textDecoration: "underline",
                              textDecorationStyle: "dotted",
                            }}
                          >
                            {tpl.description_ar || "—"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-xs btn-outline"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onClick={() =>
                              setViewingCode({
                                title: `كود ${tpl.name_ar} (عربي)`,
                                code: tpl.code_ar,
                              })
                            }
                          >
                            <FileCode size={10} />
                            <span>عربي</span>
                          </button>
                          <button
                            className="btn btn-xs btn-outline"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onClick={() =>
                              setViewingCode({
                                title: `كود ${tpl.name_en} (English)`,
                                code: tpl.code_en,
                              })
                            }
                          >
                            <FileCode size={10} />
                            <span>EN</span>
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-xs"
                            style={{
                              borderColor: "var(--green)",
                              color: "var(--green)",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onClick={() => handlePreview(tpl.code_ar)}
                          >
                            <Eye size={10} />
                            <span>عربي</span>
                          </button>
                          <button
                            className="btn btn-xs"
                            style={{
                              borderColor: "var(--green)",
                              color: "var(--green)",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onClick={() => handlePreview(tpl.code_en)}
                          >
                            <Eye size={10} />
                            <span>EN</span>
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-xs btn-outline sa-action-btn"
                            onClick={() => handleEdit(tpl)}
                            title="تعديل"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="sa-delete-btn btn-xs sa-action-btn"
                            onClick={() => handleDelete(tpl)}
                            title="حذف"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                className="sa-pagination"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderTop: "1px solid var(--line)",
                  marginTop: 12,
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--text2)" }}>
                  عرض {startIndex + 1} -{" "}
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredTemplates.length,
                  )}{" "}
                  من {filteredTemplates.length} قالب
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <ChevronRight size={14} /> السابق
                  </button>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    التالي <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload/Edit Template Modal */}
      {isModalOpen && (
        <div className="sa-modal-overlay" onClick={resetForm}>
          <div
            className="sa-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 750 }}
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
                {editingId ? (
                  <>
                    <Edit2 size={16} style={{ color: "var(--accent)" }} />
                    <span>تعديل قالب الهبوط</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} style={{ color: "var(--accent)" }} />
                    <span>إضافة قالب هبوط جديد</span>
                  </>
                )}
              </h2>
              <button className="btn btn-sm" onClick={resetForm}>
                <X size={14} />
              </button>
            </div>
            <div
              className="sa-modal-body"
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                padding: "10px 5px",
              }}
            >
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div className="field">
                    <label className="field-label">الاسم (عربي)</label>
                    <input
                      className="field-input"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder="مثال: متجر إلكتروني عصري"
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">الاسم (EN)</label>
                    <input
                      className="field-input"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Modern Store"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div className="field">
                    <label className="field-label">الوصف (عربي)</label>
                    <input
                      className="field-input"
                      value={descAr}
                      onChange={(e) => setDescAr(e.target.value)}
                      placeholder="وصف قصير..."
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">الوصف (EN)</label>
                    <input
                      className="field-input"
                      value={descEn}
                      onChange={(e) => setDescEn(e.target.value)}
                      placeholder="Short description..."
                      dir="ltr"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label className="field-label" style={{ marginBottom: 8 }}>
                      الأيقونة
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        background: "rgba(255, 255, 255, 0.02)",
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid var(--line)",
                        maxHeight: "140px",
                        overflowY: "auto",
                      }}
                    >
                      {Object.keys(iconMap).map((key) => {
                        const IconComponent = iconMap[key];
                        const isSelected = icon === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setIcon(key)}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: isSelected
                                ? "rgba(59, 130, 246, 0.15)"
                                : "rgba(255,255,255,0.03)",
                              border: isSelected
                                ? "1px solid var(--accent)"
                                : "1px solid var(--line)",
                              cursor: "pointer",
                              color: isSelected
                                ? "var(--accent)"
                                : "var(--text2)",
                              transition: "all 0.2s ease",
                            }}
                            title={key}
                          >
                            <IconComponent size={18} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="field" style={{ gridColumn: "span 2" }}>
                    <label className="field-label">القسم (التصنيف)</label>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <CustomFilterSelect
                          value={category}
                          onChange={(val) => {
                            setCategory(val);
                            if (val) setNewCategory("");
                          }}
                          options={modalCategoryOptions}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <input
                          className="field-input"
                          value={newCategory}
                          onChange={(e) => {
                            setNewCategory(e.target.value);
                            if (e.target.value) setCategory("");
                          }}
                          placeholder="أو اكتب اسم قسم جديد..."
                          style={{ height: 42 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sa-form-divider" />

                <div className="field">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <label className="field-label" style={{ margin: 0 }}>
                      الكود البرمجي (عربي)
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePreview(codeAr)}
                      style={{
                        fontSize: 10,
                        background: "none",
                        border: "1px solid var(--green)",
                        color: "var(--green)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Eye size={10} />
                      <span>معاينة</span>
                    </button>
                  </div>
                  <textarea
                    className="field-input"
                    value={codeAr}
                    onChange={(e) => setCodeAr(e.target.value)}
                    placeholder="ألصق كود الـ HTML هنا..."
                    style={{
                      minHeight: 120,
                      fontFamily: "monospace",
                      fontSize: 11,
                      direction: "ltr",
                      textAlign: "left",
                    }}
                  />
                </div>

                <div className="field">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <label className="field-label" style={{ margin: 0 }}>
                      الكود البرمجي (EN)
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePreview(codeEn)}
                      style={{
                        fontSize: 10,
                        background: "none",
                        border: "1px solid var(--green)",
                        color: "var(--green)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Eye size={10} />
                      <span>Preview</span>
                    </button>
                  </div>
                  <textarea
                    className="field-input"
                    value={codeEn}
                    onChange={(e) => setCodeEn(e.target.value)}
                    placeholder="Paste HTML code here..."
                    style={{
                      minHeight: 120,
                      fontFamily: "monospace",
                      fontSize: 11,
                      direction: "ltr",
                      textAlign: "left",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                  <button
                    type="submit"
                    className="sa-submit-btn"
                    disabled={saving}
                    style={{
                      flex: 2,
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Check size={16} />
                    <span>
                      {saving
                        ? "جاري الحفظ..."
                        : editingId
                          ? "حفظ التعديلات"
                          : "إضافة القالب"}
                    </span>
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="sa-submit-btn"
                      onClick={resetForm}
                      style={{
                        flex: 1,
                        margin: 0,
                        background: "var(--bg3)",
                        color: "#fff",
                      }}
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Viewer Modal */}
      {viewingDetails && (
        <div
          className="sa-modal-overlay"
          onClick={() => setViewingDetails(null)}
        >
          <div
            className="sa-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 600 }}
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
                <Info size={18} style={{ color: "var(--accent)" }} />
                <span>تفاصيل قالب الهبوط</span>
              </h2>
              <button
                className="btn btn-sm"
                onClick={() => setViewingDetails(null)}
              >
                <X size={14} />
              </button>
            </div>
            <div
              className="sa-modal-body"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  background: "rgba(255,255,255,0.02)",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {renderTemplateIcon(viewingDetails.icon, 24)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#fff",
                      marginBottom: 2,
                    }}
                  >
                    {viewingDetails.name_ar}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>
                    {viewingDetails.name_en}
                  </div>
                </div>
              </div>

              <div className="field">
                <label
                  className="field-label"
                  style={{ color: "var(--accent)", fontWeight: 700 }}
                >
                  القسم / التصنيف
                </label>
                <span
                  className="sa-role-badge sa-role-user"
                  style={{ padding: "4px 10px", fontSize: 12 }}
                >
                  {viewingDetails.category || "عام"}
                </span>
              </div>

              <div className="field">
                <label
                  className="field-label"
                  style={{ color: "var(--accent)", fontWeight: 700 }}
                >
                  الوصف باللغة العربية
                </label>
                <div
                  style={{
                    padding: 12,
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: 8,
                    color: "var(--text2)",
                    fontSize: 13,
                    lineHeight: "1.6",
                  }}
                >
                  {viewingDetails.description_ar || "لا يوجد وصف عربي"}
                </div>
              </div>

              <div className="field">
                <label
                  className="field-label"
                  style={{ color: "var(--accent)", fontWeight: 700 }}
                >
                  الوصف باللغة الإنجليزية
                </label>
                <div
                  style={{
                    padding: 12,
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: 8,
                    color: "var(--text2)",
                    fontSize: 13,
                    lineHeight: "1.6",
                    direction: "ltr",
                    textAlign: "left",
                  }}
                >
                  {viewingDetails.description_en || "No English description"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Viewer Modal */}
      {viewingCode && (
        <div
          className="sa-modal-overlay"
          style={{ zIndex: 9999 }}
          onClick={() => setViewingCode(null)}
        >
          <div
            className="sa-modal-content"
            style={{ maxWidth: 800, border: "1px solid var(--accent)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sa-modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FileCode size={18} />
                <span>{viewingCode.title}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleCopyCode(viewingCode.code)}
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    color: "var(--accent)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Copy size={12} />
                  <span>نسخ الكود</span>
                </button>
                <button
                  onClick={() =>
                    handleDownloadCode(
                      viewingCode.code,
                      `${viewingCode.title.replace(/\s+/g, "_")}.txt`,
                    )
                  }
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "var(--green)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Download size={12} />
                  <span>تحميل كملف نصي</span>
                </button>
                <button
                  onClick={() => setViewingCode(null)}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "var(--red)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  إغلاق ×
                </button>
              </div>
            </div>
            <div
              className="sa-modal-body"
              style={{ background: "#080c14", padding: 0 }}
            >
              <pre
                style={{
                  margin: 0,
                  color: "#10B981",
                  fontSize: 12,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  direction: "ltr",
                  textAlign: "left",
                  padding: 24,
                }}
              >
                {viewingCode.code}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

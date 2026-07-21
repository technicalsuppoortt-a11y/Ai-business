import { useState, useEffect } from "react";
import {
  Edit2,
  Trash2,
  BookOpen,
  Plus,
  Search,
  RotateCcw,
  Filter,
  Layers,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileText,
  Sliders,
  Upload,
  Info,
  X,
  Check,
  Globe,
  Lock,
  Download,
  Image as ImageIcon
} from "lucide-react";
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
import { useConfirm } from "../../context/ConfirmContext";
import Pagination from "../../components/common/Pagination";

function CustomFilterSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];
  const Icon = selectedOption.icon;

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isOpen]);

  return (
    <div className="sa-custom-select-container" onClick={(e) => e.stopPropagation()}>
      <button 
        type="button"
        className={`sa-custom-select-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sa-custom-select-trigger-content">
          {Icon && <Icon size={14} className="sa-custom-select-icon" />}
          <span>{selectedOption.label}</span>
        </span>
        <ChevronDown 
          size={14} 
          className="sa-custom-select-chevron" 
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease"
          }}
        />
      </button>

      {isOpen && (
        <div className="sa-custom-select-dropdown">
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
                {opt.value === value && <Check size={12} className="sa-custom-select-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SuperAdminLibrary() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  // Filters
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("public"); // 'public' | 'private'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("pdf"); // 'pdf' | 'automation'
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [automationFiles, setAutomationFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingAutomationImages, setViewingAutomationImages] = useState(null);

  const viewModeOptions = [
    { value: "public", label: "منتجات عامة", icon: Globe },
    { value: "private", label: "منتجات خاصة", icon: Lock }
  ];

  const categoryOptions = [
    { value: "all", label: "الكل", icon: Layers },
    { value: "كتاب", label: "كتاب", icon: FileText },
    { value: "قوالب", label: "قوالب", icon: Sliders }
  ];

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, searchQuery, viewMode]);

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

  const loadLibrary = async () => {
    try {
      const snap = await getDocs(collection(libraryDb, "brandLibrary"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setBrands(list);
    } catch (err) {
      console.error(err);
      toast("خطأ في جلب بيانات المكتبة", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast("أدخل اسم البراند", "error");
    if (!desc.trim()) return toast("أدخل وصف البراند", "error");
    if (!category.trim()) return toast("أدخل التصنيف", "error");

    if (!editingId && !imageFile) return toast("اختر صورة الغلاف", "error");
    if (!editingId && type === "pdf" && !pdfFile)
      return toast("اختر ملف الـ PDF", "error");
    if (!editingId && type === "automation" && automationFiles.length === 0)
      return toast("اختر صور القالب", "error");

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
          automationUrls = []; // Reset if uploading a new set
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
        // 4. Upload Optional PDF for Automation (if new)
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
        toast("تم تحديث المنتج بنجاح ✅", "success");
      } else {
        await addDoc(collection(libraryDb, "brandLibrary"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast("تم رفع المنتج للمكتبة بنجاح ✅", "success");
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
        editingId ? "حدث خطأ أثناء التحديث" : "حدث خطأ أثناء الرفع",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (b) => {
    const isConfirmed = await confirm(`هل تريد حذف "${b.title || b.name}"؟`);
    if (!isConfirmed) return;
    try {
      await deleteDoc(doc(libraryDb, "brandLibrary", b.id));
      toast("تم الحذف بنجاح", "success");
      await loadLibrary();
    } catch (err) {
      toast("خطأ في الحذف", "error");
    }
  };

  const handleMakePublic = async (b) => {
    const isConfirmed = await confirm(
      `هل تريد جعل "${b.title || b.name}" منتجاً عاماً لجميع البراندات؟`
    );
    if (!isConfirmed) return;
    try {
      await updateDoc(doc(libraryDb, "brandLibrary", b.id), {
        isPrivate: false,
      });
      toast("تم تحويل المنتج إلى عام بنجاح ✅", "success");
      await loadLibrary();
    } catch (err) {
      toast("حدث خطأ في تحديث حالة المنتج", "error");
    }
  };

  const handleExportCSV = () => {
    // CSV export of current filtered products
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel Arabic compatibility
    csvContent +=
      "اسم المنتج,التصنيف,نوع المنتج,حالة المنتج,عدد صور قالب الأتوميشن,رابط ملف PDF,رابط صورة الغلاف,تاريخ التحديث\n";

    filteredBrands.forEach((b) => {
      const title = b.title || b.name || "—";
      const category = b.category || "عام";
      const type = b.type === "pdf" ? "ملف PDF" : "قالب أتوميشن";
      const status = b.isPrivate ? "خاص بالبراند" : "عام للجميع";
      const autoImagesCount = b.automationImages?.length || 0;
      const pdfUrl = b.pdfUrl || "—";
      const imageUrl = b.imageUrl || "—";
      
      let dateString = "—";
      if (b.updatedAt?.seconds) {
        dateString = new Date(b.updatedAt.seconds * 1000).toISOString().slice(0, 10);
      } else if (b.createdAt?.seconds) {
        dateString = new Date(b.createdAt.seconds * 1000).toISOString().slice(0, 10);
      }

      csvContent += `"${title}","${category}","${type}","${status}","${autoImagesCount}","${pdfUrl}","${imageUrl}","${dateString}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `library_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products
  const filteredBrands = brands.filter((b) => {
    const matchesCategory =
      filterCategory === "all" || b.category === filterCategory;
    const matchesSearch = (b.title || b.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesMode =
      viewMode === "private" ? b.isPrivate : !b.isPrivate;
    return matchesCategory && matchesSearch && matchesMode;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrands = filteredBrands.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="sa-content">
      <div className="sa-grid" style={{ gridTemplateColumns: "1fr" }}>
        {/* Table */}
        <div className="sa-table-card">
          <div className="sa-card-header" style={{ flexWrap: "wrap", gap: 16 }}>
            <div className="sa-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={20} style={{ color: "var(--accent)" }} />
              <span>مكتبة المنتجات</span>
              <span className="sa-card-count">{filteredBrands.length}</span>
            </div>
            
            <div className="sa-filter-group">
              <button
                className="sa-add-prod-btn"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>إضافة منتج جديد</span>
              </button>

              <button
                type="button"
                className="sa-export-btn"
                onClick={handleExportCSV}
                title="تصدير المنتجات إلى ملف CSV"
              >
                <Download size={16} />
                <span>تصدير CSV</span>
              </button>

              {/* View Mode Filter */}
              <CustomFilterSelect
                value={viewMode}
                onChange={setViewMode}
                options={viewModeOptions}
              />

              {/* Category Filter */}
              <CustomFilterSelect
                value={filterCategory}
                onChange={setFilterCategory}
                options={categoryOptions}
              />

              {/* Search Box */}
              <div className="sa-search-box" style={{ margin: 0 }}>
                <input
                  type="text"
                  placeholder="بحث في المكتبة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: 180, paddingRight: 32 }}
                />
                <Search size={14} style={{ position: "absolute", right: 12, color: "var(--text3)" }} />
              </div>

              {/* Reset Filter Button */}
              {(filterCategory !== "all" || searchQuery !== "" || viewMode !== "public") && (
                <button
                  className="sa-reset-btn"
                  onClick={() => {
                    setFilterCategory("all");
                    setSearchQuery("");
                    setViewMode("public");
                  }}
                  title="إعادة تعيين الفلاتر"
                >
                  <RotateCcw size={14} />
                  <span>إعادة تعيين</span>
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="sa-empty">
              <div
                className="sa-submit-spinner"
                style={{ margin: "20px auto" }}
              />
              <div>جاري التحميل...</div>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="sa-empty">
              <div className="sa-empty-icon" style={{ background: "none", fontSize: "inherit", padding: 0 }}>
                <FolderOpen size={48} style={{ color: "var(--text3)", opacity: 0.6 }} />
              </div>
              <div style={{ marginTop: 12, color: "var(--text2)", fontWeight: 700 }}>
                لا توجد منتجات مطابقة في المكتبة
              </div>
            </div>
          ) : (
            <>
              <div className="sa-table-wrapper">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      {viewMode === "private" && <th>البراند</th>}
                      <th>التصنيف</th>
                      <th>النوع والملفات</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBrands.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div 
                              className="sa-table-thumbnail-wrapper"
                              onClick={() => window.open(b.imageUrl, "_blank")}
                              title="اضغط لمعاينة صورة الغلاف كاملة"
                            >
                              <img
                                src={b.imageUrl}
                                alt={b.title || b.name}
                                className="sa-table-thumbnail"
                              />
                            </div>
                            <strong style={{ color: "var(--text)" }}>
                              {b.title || b.name}
                            </strong>
                          </div>
                        </td>
                        {viewMode === "private" && (
                          <td>
                            <span
                              className="sa-role-badge sa-role-admin"
                              style={{ fontSize: 10 }}
                            >
                              {b.brandName || b.adminUid || "—"}
                            </span>
                          </td>
                        )}
                        <td>
                          <span
                            className="sa-role-badge sa-role-user"
                            style={{ fontSize: 10 }}
                          >
                            {b.category || "عام"}
                          </span>
                        </td>
                        <td>
                          {b.type === "pdf" ? (
                            b.pdfUrl ? (
                              <a
                                href={b.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="sa-media-badge sa-media-badge-pdf"
                                title="عرض ملف PDF في علامة تبويب جديدة"
                              >
                                <FileText size={12} style={{ marginLeft: 4 }} />
                                <span>ملف PDF (معاينة)</span>
                              </a>
                            ) : (
                              <div className="sa-media-badge" style={{ color: "var(--text3)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--line)" }}>
                                <FileText size={12} style={{ marginLeft: 4 }} />
                                <span>ملف PDF (غير مرفق)</span>
                              </div>
                            )
                          ) : (
                            <button 
                              type="button"
                              className="sa-media-badge sa-media-badge-auto" 
                              onClick={() => setViewingAutomationImages(b.automationImages || [])}
                              title="اضغط لمعاينة صور القالب"
                              style={{ cursor: "pointer" }}
                            >
                              <Sliders size={12} style={{ marginLeft: 4 }} />
                              <span>قالب أتوميشن ({b.automationImages?.length || 0} صور)</span>
                            </button>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {viewMode === "private" && (
                              <button
                                className="btn btn-xs"
                                style={{
                                  background: "var(--green)",
                                  color: "#fff",
                                  border: "none",
                                }}
                                onClick={() => handleMakePublic(b)}
                                title="جعل المنتج عاماً لجميع البراندات"
                              >
                                ✨ جعل عام
                              </button>
                            )}
                            <button
                              className="btn btn-xs btn-outline sa-action-btn"
                              onClick={() => handleEdit(b)}
                              title="تعديل"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="sa-delete-btn btn-xs sa-action-btn"
                              onClick={() => handleDelete(b)}
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredBrands.length}
                itemsPerPage={itemsPerPage}
                itemLabel="منتج"
              />
            </>
          )}
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="sa-modal-overlay" onClick={resetForm}>
          <div
            className="sa-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 620 }}
          >
            <div className="sa-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                {editingId ? <Edit2 size={18} style={{ color: "var(--accent)" }} /> : <Upload size={18} style={{ color: "var(--accent)" }} />}
                <span>{editingId ? "تعديل بيانات المنتج" : "رفع منتج جديد للمكتبة"}</span>
              </h2>
              <button 
                className="btn btn-xs" 
                onClick={resetForm}
                style={{ 
                  background: "rgba(255,255,255,0.05)", 
                  border: "1px solid var(--line)", 
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px"
                }}
              >
                <X size={12} />
                <span>إغلاق</span>
              </button>
            </div>
            
            <div
              className="sa-modal-body"
              style={{
                maxHeight: "75vh",
                overflowY: "auto",
              }}
            >
              <form onSubmit={handleUpload}>
                {/* Product Name */}
                <div className="field">
                  <label className="field-label">اسم المنتج</label>
                  <div className="sa-input-icon-wrapper">
                    <FileText size={16} />
                    <input
                      className="field-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: Tech Vision"
                      disabled={uploading}
                    />
                  </div>
                </div>

                {/* Product Description */}
                <div className="field">
                  <label className="field-label">وصف المنتج</label>
                  <div className="sa-input-icon-wrapper">
                    <Info size={16} style={{ top: 14 }} />
                    <textarea
                      className="field-input"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="اكتب وصفاً مختصراً للمنتج..."
                      style={{ minHeight: 80, resize: "vertical" }}
                      disabled={uploading}
                    />
                  </div>
                </div>

                {/* Category selection */}
                <div className="field">
                  <label className="field-label">التصنيف (القسم)</label>
                  <div className="sa-input-icon-wrapper">
                    <Layers size={16} />
                    <select
                      className="field-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={uploading}
                    >
                      <option value="">اختر التصنيف...</option>
                      <option value="كتاب">كتاب</option>
                      <option value="قوالب">قوالب</option>
                    </select>
                  </div>
                </div>

                {/* Product Type (Segmented control) */}
                <div className="field">
                  <label className="field-label">نوع المنتج</label>
                  <div className="sa-segmented-control">
                    <button
                      type="button"
                      className={`sa-segmented-option ${type === "pdf" ? "active" : ""}`}
                      onClick={() => setType("pdf")}
                      disabled={uploading}
                    >
                      <FileText size={16} />
                      <span>📄 ملف PDF</span>
                    </button>
                    <button
                      type="button"
                      className={`sa-segmented-option ${type === "automation" ? "active" : ""}`}
                      onClick={() => setType("automation")}
                      disabled={uploading}
                    >
                      <Sliders size={16} />
                      <span>🤖 قالب أتوميشن</span>
                    </button>
                  </div>
                </div>

                <div className="sa-form-divider" />

                {/* Cover Image Upload & Preview */}
                <div className="field">
                  <label className="field-label">صورة الغلاف (Cover Image)</label>
                  <label className="sa-file-label" style={{ border: "1px dashed var(--line)", background: "rgba(255,255,255,0.01)" }}>
                    <input
                      id="libImg"
                      type="file"
                      accept="image/*"
                      className="sa-file-input"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      disabled={uploading}
                    />
                    <span className="sa-file-icon" style={{ display: "inline-flex", alignItems: "center" }}><ImageIcon size={18} /></span>
                    <span className="sa-file-text">
                      {imageFile ? "تم اختيار صورة جديدة" : "اضغط لاختيار صورة الغلاف"}
                    </span>
                  </label>
                  
                  {/* Real-time Cover Image Preview */}
                  {(imageFile || (editingId && brands.find((b) => b.id === editingId)?.imageUrl)) && (
                    <div className="sa-cover-preview-container">
                      <div className="sa-cover-preview-frame">
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : brands.find((b) => b.id === editingId)?.imageUrl} 
                          alt="Cover Preview" 
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                          <ImageIcon size={14} style={{ color: "var(--accent)" }} />
                          <span>{imageFile ? "صورة غلاف جديدة" : "صورة الغلاف الحالية"}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                          {imageFile ? `${imageFile.name} (${Math.round(imageFile.size / 1024)} KB)` : "مرفقة مسبقاً بالمنتج"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* PDF File Upload */}
                {type === "pdf" ? (
                  <div className="field">
                    <label className="field-label">ملف الـ PDF (أساسي)</label>
                    <label className="sa-file-label" style={{ border: "1px dashed var(--line)", background: "rgba(255,255,255,0.01)" }}>
                      <input
                        id="libPdf"
                        type="file"
                        accept=".pdf"
                        className="sa-file-input"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                        disabled={uploading}
                      />
                      <span className="sa-file-icon" style={{ display: "inline-flex", alignItems: "center" }}><FileText size={18} /></span>
                      <span className="sa-file-text">
                        {pdfFile ? "تم اختيار الملف بنجاح" : "اضغط لاختيار ملف PDF"}
                      </span>
                      {pdfFile && (
                        <span className="sa-file-name" style={{ fontSize: 10 }}>{pdfFile.name}</span>
                      )}
                    </label>
                  </div>
                ) : (
                  <>
                    {/* Automation Images Upload */}
                    <div className="field">
                      <label className="field-label">صور القالب (مجموعة صور)</label>
                      <label className="sa-file-label" style={{ border: "1px dashed var(--line)", background: "rgba(255,255,255,0.01)" }}>
                        <input
                          id="libAuto"
                          type="file"
                          accept="image/*"
                          multiple
                          className="sa-file-input"
                          onChange={(e) =>
                            setAutomationFiles(Array.from(e.target.files))
                          }
                          disabled={uploading}
                        />
                        <span className="sa-file-icon" style={{ display: "inline-flex", alignItems: "center" }}><Sliders size={18} /></span>
                        <span className="sa-file-text">
                          {automationFiles.length > 0
                            ? `تم اختيار ${automationFiles.length} صور`
                            : "اضغط لاختيار مجموعة صور"}
                        </span>
                        {automationFiles.length > 0 && (
                          <span
                            className="sa-file-name"
                            style={{ fontSize: 9 }}
                          >
                            {automationFiles.map((f) => f.name).join(" ، ")}
                          </span>
                        )}
                      </label>
                    </div>
                    
                    {/* Optional Explanation PDF */}
                    <div className="field">
                      <label className="field-label">
                        ملف شرح إضافي (PDF اختياري)
                      </label>
                      <label
                        className="sa-file-label"
                        style={{ minHeight: 80, padding: 15, border: "1px dashed var(--line)", background: "rgba(255,255,255,0.01)" }}
                      >
                        <input
                          id="libPdf"
                          type="file"
                          accept=".pdf"
                          className="sa-file-input"
                          onChange={(e) => setPdfFile(e.target.files[0])}
                          disabled={uploading}
                        />
                        <span className="sa-file-icon" style={{ display: "inline-flex", alignItems: "center" }}>
                          <FileText size={18} />
                        </span>
                        <span className="sa-file-text" style={{ fontSize: 10 }}>
                          {pdfFile
                            ? "تم اختيار الشرح"
                            : "اضغط لإضافة ملف شرح PDF"}
                        </span>
                        {pdfFile && (
                          <span className="sa-file-name">{pdfFile.name}</span>
                        )}
                      </label>
                    </div>
                  </>
                )}

                {/* Form Buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  <button
                    type="submit"
                    className="sa-submit-btn"
                    disabled={uploading}
                    style={{ flex: 1, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {uploading ? (
                      <>
                        <div className="sa-submit-spinner" />
                        <span>جاري حفظ البيانات...</span>
                      </>
                    ) : (
                      <>
                        {editingId ? <Check size={16} /> : <Upload size={16} />}
                        <span>{editingId ? "حفظ التعديلات" : "رفع المنتج للمكتبة"}</span>
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn"
                      onClick={resetForm}
                      style={{ flex: 0.4, height: 46, background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)", color: "#fff" }}
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

      {/* Automation Images Preview Modal */}
      {viewingAutomationImages && (
        <div className="sa-modal-overlay" onClick={() => setViewingAutomationImages(null)} style={{ zIndex: 3000 }}>
          <div
            className="sa-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 700 }}
          >
            <div className="sa-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                <ImageIcon size={18} style={{ color: "var(--accent)" }} />
                <span>معاينة صور قالب الأتوميشن</span>
              </h2>
              <button 
                className="btn btn-xs" 
                onClick={() => setViewingAutomationImages(null)}
                style={{ 
                  background: "rgba(255,255,255,0.05)", 
                  border: "1px solid var(--line)", 
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px"
                }}
              >
                <X size={12} />
                <span>إغلاق</span>
              </button>
            </div>
            <div
              className="sa-modal-body"
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                padding: "20px"
              }}
            >
              {viewingAutomationImages.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text3)", padding: 20 }}>
                  لا توجد صور في هذا القالب
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                  {viewingAutomationImages.map((url, idx) => (
                    <div 
                      key={idx}
                      className="sa-table-thumbnail-wrapper"
                      style={{ width: "100%", height: 130, border: "1px solid var(--line)" }}
                      onClick={() => window.open(url, "_blank")}
                      title="اضغط لمشاهدة الصورة بالحجم الكامل"
                    >
                      <img 
                        src={url} 
                        alt={`Automation Slide ${idx + 1}`} 
                        className="sa-table-thumbnail"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

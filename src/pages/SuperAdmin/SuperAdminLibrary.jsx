import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { libraryDb, libraryStorage } from '../../firebaseLibrary';
import { useToast } from '../../context/ToastContext';

export default function SuperAdminLibrary() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  // Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('public'); // 'public' | 'private'

  // Form
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('pdf'); // 'pdf' | 'automation'
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [automationFiles, setAutomationFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (b) => {
    setEditingId(b.id);
    setName(b.title || b.name || '');
    setDesc(b.description || '');
    setCategory(b.category || '');
    setType(b.type || 'pdf');
    setImageFile(null);
    setPdfFile(null);
    setAutomationFiles([]);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDesc('');
    setCategory('');
    setType('pdf');
    setImageFile(null);
    setPdfFile(null);
    setAutomationFiles([]);
    setIsModalOpen(false);
  };

  const loadLibrary = async () => {
    try {
      const snap = await getDocs(collection(libraryDb, 'brandLibrary'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBrands(list);
    } catch (err) {
      console.error(err);
      toast('خطأ في جلب بيانات المكتبة', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLibrary(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast('أدخل اسم البراند', 'error');
    if (!desc.trim()) return toast('أدخل وصف البراند', 'error');
    if (!category.trim()) return toast('أدخل التصنيف', 'error');
    
    if (!editingId && !imageFile) return toast('اختر صورة الغلاف', 'error');
    if (!editingId && type === 'pdf' && !pdfFile) return toast('اختر ملف الـ PDF', 'error');
    if (!editingId && type === 'automation' && automationFiles.length === 0) return toast('اختر صور القالب', 'error');

    setUploading(true);
    try {
      let imageUrl = editingId ? brands.find(b => b.id === editingId)?.imageUrl : '';
      let pdfUrl = editingId ? brands.find(b => b.id === editingId)?.pdfUrl : '';
      let automationUrls = editingId ? brands.find(b => b.id === editingId)?.automationImages || [] : [];

      // 1. Upload Cover Image (if new)
      if (imageFile) {
        const imgRef = ref(libraryStorage, `library/images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imgRef, imageFile);
        imageUrl = await getDownloadURL(imgRef);
      }

      if (type === 'pdf') {
        // 2. Upload PDF (if new)
        if (pdfFile) {
          const pdfRef = ref(libraryStorage, `library/pdfs/${Date.now()}_${pdfFile.name}`);
          await uploadBytes(pdfRef, pdfFile);
          pdfUrl = await getDownloadURL(pdfRef);
        }
      } else {
        // 3. Upload Multiple Automation Images (if new set)
        if (automationFiles.length > 0) {
          automationUrls = []; // Reset if uploading a new set
          for (const file of automationFiles) {
            const fileRef = ref(libraryStorage, `library/automation/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            automationUrls.push(url);
          }
        }
        // 4. Upload Optional PDF for Automation (if new)
        if (pdfFile) {
          const pdfRef = ref(libraryStorage, `library/pdfs/${Date.now()}_${pdfFile.name}`);
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
        automationImages: type === 'automation' ? automationUrls : null,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(libraryDb, 'brandLibrary', editingId), data);
        toast('تم تحديث المنتج بنجاح ✅', 'success');
      } else {
        await addDoc(collection(libraryDb, 'brandLibrary'), { ...data, createdAt: serverTimestamp() });
        toast('تم رفع المنتج للمكتبة بنجاح ✅', 'success');
      }
      
      resetForm();
      if (document.getElementById('libImg')) document.getElementById('libImg').value = '';
      if (document.getElementById('libPdf')) document.getElementById('libPdf').value = '';
      if (document.getElementById('libAuto')) document.getElementById('libAuto').value = '';

      await loadLibrary();
    } catch (err) {
      console.error(err);
      toast(editingId ? 'حدث خطأ أثناء التحديث' : 'حدث خطأ أثناء الرفع', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (b) => {
    if (!confirm(`هل تريد حذف "${b.title || b.name}"؟`)) return;
    try {
      await deleteDoc(doc(libraryDb, 'brandLibrary', b.id));
      toast('تم الحذف بنجاح', 'success');
      await loadLibrary();
    } catch (err) {
      toast('خطأ في الحذف', 'error');
    }
  };

  const handleMakePublic = async (b) => {
    if (!confirm(`هل تريد جعل "${b.title || b.name}" منتجاً عاماً لجميع البراندات؟`)) return;
    try {
      await updateDoc(doc(libraryDb, 'brandLibrary', b.id), { isPrivate: false });
      toast('تم تحويل المنتج إلى عام بنجاح ✅', 'success');
      await loadLibrary();
    } catch (err) {
      toast('حدث خطأ في تحديث حالة المنتج', 'error');
    }
  };

  return (
    <div className="sa-content">
      <div className="sa-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Table */}
        <div className="sa-table-card">
          <div className="sa-card-header">
            <div className="sa-card-title">
              📚 مكتبة المنتجات
              <span className="sa-card-count">{brands.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
               <button className="btn" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', fontWeight: 800 }}>
                 ➕ إضافة منتج جديد
               </button>
               <div className="sa-filter-select">
                  <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                     <option value="public">منتجات عامة</option>
                     <option value="private">منتجات خاصة</option>
                  </select>
               </div>
               <div className="sa-filter-select">
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                     <option value="all">الكل</option>
                     <option value="كتاب">كتاب</option>
                     <option value="قوالب">قوالب</option>
                  </select>
               </div>
               <div className="sa-search-box">
                  <input 
                    type="text" 
                    placeholder="بحث في المكتبة..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ width: 180 }}
                  />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
               </div>
            </div>
          </div>
          {loading ? (
            <div className="sa-empty">
              <div className="sa-submit-spinner" style={{ margin: '20px auto' }} />
              <div>جاري التحميل...</div>
            </div>
          ) : brands.length === 0 ? (
            <div className="sa-empty">
              <div className="sa-empty-icon">📂</div>
              <div>لا توجد منتجات في المكتبة</div>
            </div>
          ) : (
            <div className="sa-table-wrapper">
               <table className="sa-table">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    {viewMode === 'private' && <th>البراند</th>}
                    <th>التصنيف</th>
                    <th>النوع</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                 <tbody>
                  {brands
                    .filter(b => {
                      const matchesCategory = filterCategory === 'all' || b.category === filterCategory;
                      const matchesSearch = (b.title || b.name || '').toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesMode = viewMode === 'private' ? b.isPrivate : !b.isPrivate;
                      return matchesCategory && matchesSearch && matchesMode;
                    })
                    .map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={b.imageUrl} alt={b.title || b.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          <strong style={{ color: 'var(--text)' }}>{b.title || b.name}</strong>
                        </div>
                      </td>
                      {viewMode === 'private' && (
                        <td>
                          <span className="sa-role-badge sa-role-admin" style={{ fontSize: 10 }}>{b.brandName || b.adminUid || '—'}</span>
                        </td>
                      )}
                      <td>
                        <span className="sa-role-badge sa-role-user" style={{ fontSize: 10 }}>{b.category || 'عام'}</span>
                      </td>
                      <td>
                         <span style={{ fontSize: 11, color: 'var(--text2)' }}>
                            {b.type === 'automation' ? '🤖 قالب أتوميشن' : '📄 ملف PDF'}
                         </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {viewMode === 'private' && (
                            <button className="btn btn-xs" style={{ background: 'var(--green)', color: '#fff', border: 'none' }} onClick={() => handleMakePublic(b)}>✨ جعل عام</button>
                          )}
                          <button className="btn btn-xs" onClick={() => handleEdit(b)}>✏️ تعديل</button>
                          <button className="sa-delete-btn" onClick={() => handleDelete(b)}>🗑️ حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="sa-modal-overlay" onClick={resetForm}>
          <div className="sa-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>{editingId ? '✏️ تعديل المنتج' : '📤 رفع منتج جديد للمكتبة'}</h2>
              <button className="btn btn-sm" onClick={resetForm}>إغلاق</button>
            </div>
            <div className="sa-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '10px 5px' }}>
              <form onSubmit={handleUpload}>
                <div className="field">
                  <label className="field-label">اسم المنتج</label>
                  <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: Tech Vision" disabled={uploading} />
                </div>
                
                <div className="field">
                  <label className="field-label">وصف المنتج</label>
                  <textarea className="field-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="اكتب وصفاً مختصراً..." style={{ minHeight: 80, resize: 'vertical' }} disabled={uploading} />
                </div>

                <div className="field">
                  <label className="field-label">التصنيف (القسم)</label>
                  <select className="field-select" value={category} onChange={e => setCategory(e.target.value)} disabled={uploading}>
                    <option value="">اختر التصنيف...</option>
                    <option value="كتاب">كتاب</option>
                    <option value="قوالب">قوالب</option>
                  </select>
                </div>

                <div className="field">
                   <label className="field-label">نوع المنتج</label>
                   <select className="field-select" value={type} onChange={e => setType(e.target.value)} disabled={uploading}>
                      <option value="pdf">📄 ملف PDF</option>
                      <option value="automation">🤖 قالب أتوميشن (مجموعة صور)</option>
                   </select>
                </div>

                <div className="sa-form-divider" />

                <div className="field">
                  <label className="field-label">صورة الغلاف (Cover Image)</label>
                  <label className="sa-file-label">
                     <input id="libImg" type="file" accept="image/*" className="sa-file-input" onChange={e => setImageFile(e.target.files[0])} disabled={uploading} />
                     <span className="sa-file-icon">🖼️</span>
                     <span className="sa-file-text">{imageFile ? 'تم اختيار الصورة' : 'اضغط لاختيار صورة الغلاف'}</span>
                     {imageFile && <span className="sa-file-name">{imageFile.name}</span>}
                  </label>
                </div>

                {type === 'pdf' ? (
                   <div className="field">
                      <label className="field-label">ملف الـ PDF (أساسي)</label>
                      <label className="sa-file-label">
                         <input id="libPdf" type="file" accept=".pdf" className="sa-file-input" onChange={e => setPdfFile(e.target.files[0])} disabled={uploading} />
                         <span className="sa-file-icon">📄</span>
                         <span className="sa-file-text">{pdfFile ? 'تم اختيار الملف' : 'اضغط لاختيار ملف PDF'}</span>
                         {pdfFile && <span className="sa-file-name">{pdfFile.name}</span>}
                      </label>
                   </div>
                ) : (
                   <>
                      <div className="field">
                         <label className="field-label">صور القالب (مجموعة صور)</label>
                         <label className="sa-file-label">
                            <input id="libAuto" type="file" accept="image/*" multiple className="sa-file-input" onChange={e => setAutomationFiles(Array.from(e.target.files))} disabled={uploading} />
                            <span className="sa-file-icon">🤖</span>
                            <span className="sa-file-text">{automationFiles.length > 0 ? `تم اختيار ${automationFiles.length} صور` : 'اضغط لاختيار مجموعة صور'}</span>
                            {automationFiles.length > 0 && (
                               <span className="sa-file-name" style={{ fontSize: 9 }}>
                                  {automationFiles.map(f => f.name).join(' ، ')}
                               </span>
                            )}
                         </label>
                      </div>
                      <div className="field">
                         <label className="field-label">ملف شرح إضافي (PDF اختياري)</label>
                         <label className="sa-file-label" style={{ minHeight: 80, padding: 15 }}>
                            <input id="libPdf" type="file" accept=".pdf" className="sa-file-input" onChange={e => setPdfFile(e.target.files[0])} disabled={uploading} />
                            <span className="sa-file-icon" style={{ fontSize: 18 }}>📄</span>
                            <span className="sa-file-text" style={{ fontSize: 10 }}>{pdfFile ? 'تم اختيار الشرح' : 'اضغط لإضافة ملف شرح PDF'}</span>
                            {pdfFile && <span className="sa-file-name">{pdfFile.name}</span>}
                         </label>
                      </div>
                   </>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                  <button type="submit" className="sa-submit-btn" disabled={uploading} style={{ flex: 1, margin: 0 }}>
                    {uploading ? (
                      <><div className="sa-submit-spinner" /> جاري الحفظ...</>
                    ) : (
                      <>{editingId ? '💾 حفظ التعديلات' : '📤 رفع المنتج'}</>
                    )}
                  </button>
                  {editingId && (
                    <button type="button" className="btn" onClick={resetForm} style={{ flex: 0.5, height: 46 }}>إلغاء</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

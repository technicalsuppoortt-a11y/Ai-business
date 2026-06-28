import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';

export default function SuperAdminLandingPages() {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [icon, setIcon] = useState('🎨');
  const [codeAr, setCodeAr] = useState('');
  const [codeEn, setCodeEn] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [viewingCode, setViewingCode] = useState(null); // { title: string, code: string }

  const handlePreview = (code) => {
    if (!code) return toast('لا يوجد كود للمعاينة', 'error');
    
    // 1. Replace variables with placeholders for preview
    let processedCode = code
      .replace(/{{brandName}}/g, 'GigSniper Brand')
      .replace(/{{colorHex}}/g, '#3B82F6')
      .replace(/{{secondaryColor}}/g, '#0f172a')
      .replace(/{{nicheName}}/g, 'Marketing Agency');

    // 2. Wrap in full HTML if it's just a fragment
    if (!processedCode.includes('<html')) {
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

    // 3. Open in new window
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(processedCode);
      win.document.close();
    } else {
      toast('تم حظر النافذة المنبثقة! يرجى السماح بها للمعاينة', 'error');
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tc_website_templates_gallery'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTemplates(list);
    } catch (err) {
      console.error(err);
      toast('خطأ في تحميل القوالب', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setNameAr('');
    setNameEn('');
    setDescAr('');
    setDescEn('');
    setIcon('🎨');
    setCodeAr('');
    setCodeEn('');
    setCategory('');
    setNewCategory('');
    setIsModalOpen(false);
  };

  const handleEdit = (tpl) => {
    setEditingId(tpl.id);
    setNameAr(tpl.name_ar || '');
    setNameEn(tpl.name_en || '');
    setDescAr(tpl.description_ar || '');
    setDescEn(tpl.description_en || '');
    setIcon(tpl.icon || '🎨');
    setCodeAr(tpl.code_ar || '');
    setCodeEn(tpl.code_en || '');
    setCategory(tpl.category || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameAr || !nameEn || !codeAr || !codeEn) {
      return toast('يرجى ملء جميع الحقول الأساسية (الاسم والكود)', 'error');
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
        category: (newCategory.trim() || category || 'عام'),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await setDoc(doc(db, 'tc_website_templates_gallery', editingId), data, { merge: true });
        toast('تم تحديث القالب بنجاح ✅', 'success');
      } else {
        await addDoc(collection(db, 'tc_website_templates_gallery'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast('تم إضافة القالب بنجاح ✅', 'success');
      }

      resetForm();
      await loadTemplates();
    } catch (err) {
      console.error(err);
      toast('حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tpl) => {
    if (!confirm(`هل تريد حذف قالب "${tpl.name_ar}"؟`)) return;
    try {
      await deleteDoc(doc(db, 'tc_website_templates_gallery', tpl.id));
      toast('تم الحذف بنجاح', 'success');
      await loadTemplates();
    } catch (err) {
      toast('خطأ في الحذف', 'error');
    }
  };

  return (
    <div className="sa-content">
      <div className="sa-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Templates List */}
        <div className="sa-table-card">
          <div className="sa-card-header">
            <div className="sa-card-title">
              🌐 صفحات الهبوط (قوالب الموقع)
              <span className="sa-card-count">{templates.length}</span>
            </div>
            <div className="sa-card-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
               <button className="btn" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', fontWeight: 800 }}>
                 ➕ إضافة قالب جديد
               </button>
               <select 
                 className="field-select" 
                 style={{ width: 150, padding: '4px 8px', fontSize: 12 }}
                 value={filterCategory}
                 onChange={e => setFilterCategory(e.target.value)}
               >
                  <option value="All">كل الأقسام</option>
                  {[...new Set(templates.map(t => t.category).filter(Boolean))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
               </select>
            </div>
          </div>
          {loading ? (
            <div className="sa-empty">
              <div className="sa-submit-spinner" style={{ margin: '20px auto' }} />
              <div>جاري التحميل...</div>
            </div>
          ) : templates.length === 0 ? (
            <div className="sa-empty">
              <div className="sa-empty-icon">🎨</div>
              <div>لا توجد قوالب مخزنة حالياً</div>
            </div>
          ) : (
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
                  {templates
                    .filter(t => filterCategory === 'All' || t.category === filterCategory)
                    .map(tpl => (
                    <tr key={tpl.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 24 }}>{tpl.icon}</span>
                          <div>
                            <div style={{ fontWeight: 800, color: '#fff' }}>{tpl.name_ar}</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{tpl.name_en}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="sa-role-badge ad-role-user" style={{ fontSize: 10 }}>{tpl.category || 'عام'}</span>
                      </td>
                      <td>
                        <div style={{ maxWidth: 200, fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tpl.description_ar}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-xs" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)' }} onClick={() => setViewingCode({ title: `كود ${tpl.name_ar} (AR)`, code: tpl.code_ar })}>AR</button>
                          <button className="btn btn-xs" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#C084FC' }} onClick={() => setViewingCode({ title: `كود ${tpl.name_en} (EN)`, code: tpl.code_en })}>EN</button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-xs" style={{ borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => handlePreview(tpl.code_ar)}>AR</button>
                          <button className="btn btn-xs" style={{ borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => handlePreview(tpl.code_en)}>EN</button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-xs" onClick={() => handleEdit(tpl)}>✏️</button>
                          <button className="sa-delete-btn" style={{ padding: '4px 8px' }} onClick={() => handleDelete(tpl)}>🗑️</button>
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

      {/* Upload/Edit Template Modal */}
      {isModalOpen && (
        <div className="sa-modal-overlay" onClick={resetForm}>
          <div className="sa-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 750 }}>
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>{editingId ? '✏️ تعديل قالب الهبوط' : '➕ إضافة قالب هبوط جديد'}</h2>
              <button className="btn btn-sm" onClick={resetForm}>إغلاق</button>
            </div>
            <div className="sa-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '10px 5px' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label className="field-label">الاسم (عربي)</label>
                    <input className="field-input" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: متجر إلكتروني عصري" />
                  </div>
                  <div className="field">
                    <label className="field-label">الاسم (EN)</label>
                    <input className="field-input" value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. Modern Store" dir="ltr" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label className="field-label">الوصف (عربي)</label>
                    <input className="field-input" value={descAr} onChange={e => setDescAr(e.target.value)} placeholder="وصف قصير..." />
                  </div>
                  <div className="field">
                    <label className="field-label">الوصف (EN)</label>
                    <input className="field-input" value={descEn} onChange={e => setDescEn(e.target.value)} placeholder="Short description..." dir="ltr" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label className="field-label">الأيقونة (Emoji)</label>
                    <input className="field-input" value={icon} onChange={e => setIcon(e.target.value)} placeholder="🎨" style={{ textAlign: 'center' }} />
                  </div>
                  <div className="field">
                    <label className="field-label">القسم (التصنيف)</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select 
                        className="field-input" 
                        value={category} 
                        onChange={e => { setCategory(e.target.value); if(e.target.value) setNewCategory(''); }}
                        style={{ flex: 1 }}
                      >
                        <option value="">اختر قسم موجود...</option>
                        {[...new Set(templates.map(t => t.category).filter(Boolean))].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <input 
                        className="field-input" 
                        value={newCategory} 
                        onChange={e => { setNewCategory(e.target.value); if(e.target.value) setCategory(''); }} 
                        placeholder="أو أدخل قسم جديد" 
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="sa-form-divider" />

                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                     <label className="field-label" style={{ margin: 0 }}>الكود البرمجي (عربي)</label>
                     <button type="button" onClick={() => handlePreview(codeAr)} style={{ fontSize: 10, background: 'none', border: '1px solid var(--green)', color: 'var(--green)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>👁️ معاينة</button>
                  </div>
                  <textarea 
                    className="field-input" 
                    value={codeAr} 
                    onChange={e => setCodeAr(e.target.value)} 
                    placeholder="ألصق كود الـ HTML هنا..." 
                    style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 11, direction: 'ltr', textAlign: 'left' }}
                  />
                </div>

                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                     <label className="field-label" style={{ margin: 0 }}>الكود البرمجي (EN)</label>
                     <button type="button" onClick={() => handlePreview(codeEn)} style={{ fontSize: 10, background: 'none', border: '1px solid var(--green)', color: 'var(--green)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>👁️ Preview</button>
                  </div>
                  <textarea 
                    className="field-input" 
                    value={codeEn} 
                    onChange={e => setCodeEn(e.target.value)} 
                    placeholder="Paste HTML code here..." 
                    style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 11, direction: 'ltr', textAlign: 'left' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="submit" className="sa-submit-btn" disabled={saving} style={{ flex: 2, margin: 0 }}>
                    {saving ? <div className="sa-submit-spinner" /> : (editingId ? '💾 حفظ التعديلات' : '✨ إضافة القالب')}
                  </button>
                  {editingId && (
                    <button type="button" className="sa-submit-btn" onClick={resetForm} style={{ flex: 1, margin: 0, background: 'var(--bg3)', color: '#fff' }}>
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Code Viewer Modal */}
      {viewingCode && (
        <div className="sa-modal-overlay" style={{ zIndex: 9999 }} onClick={() => setViewingCode(null)}>
          <div className="sa-modal-content" style={{ maxWidth: 1000, border: '1px solid var(--accent)' }} onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header" style={{ padding: '16px 24px', position: 'relative' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent)' }}>{viewingCode.title}</div>
              <button 
                onClick={() => setViewingCode(null)}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', 
                  color: 'var(--red)', padding: '6px 14px', borderRadius: '8px', 
                  fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' 
                }}
              >
                إغلاق ×
              </button>
            </div>
            <div className="sa-modal-body" style={{ background: '#080c14', padding: 0 }}>
              <pre style={{ 
                margin: 0, color: '#10B981', fontSize: 12, fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap', maxHeight: '70vh', overflowY: 'auto', 
                direction: 'ltr', textAlign: 'left', padding: 24 
              }}>
                {viewingCode.code}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

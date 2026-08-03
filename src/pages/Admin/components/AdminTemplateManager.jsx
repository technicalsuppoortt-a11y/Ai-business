import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, CheckCircle2, XCircle, Plus, Edit2, Trash2, LayoutTemplate, Image as ImageIcon, Code, Copy, Eye, EyeOff,
  MonitorSmartphone, ShoppingBag, Stethoscope, Wrench, Home, Palette, Pizza, Rocket, Briefcase, RefreshCcw,
  ChevronDown, Search, Filter, GraduationCap, Dumbbell, Camera, Car, Plane, Music, Scissors, Heart, Coffee, Brush
} from 'lucide-react';
import { 
  getAllWebsiteTemplateCategories, saveTemplateCategory, deleteTemplateCategory, 
  getAllWebsiteGalleryTemplates, saveWebsiteTemplate, deleteWebsiteTemplate 
} from '../../../services/contentDbService';
import { useToast } from '../../../context/ToastContext';
import { useApp } from '../../../context/AppContext';
import './AdminTemplateManager.css';

const AtmSelect = ({ name, options, value, defaultValue, onChange, renderOption, isEn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalVal, setInternalVal] = useState(defaultValue || (options[0] ? options[0].value : ''));
  const val = value !== undefined ? value : internalVal;
  const selectedOpt = options.find(o => o.value === val) || options[0];

  const handleSelect = (optVal) => {
    if (value === undefined) setInternalVal(optVal);
    if (onChange) onChange(optVal);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: '160px' }} className="atm-custom-select">
      {name && <input type="hidden" name={name} value={val} />}
      <div 
        className="atm-form-input" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--bg-main)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {renderOption ? renderOption(selectedOpt) : (selectedOpt ? (isEn ? selectedOpt.label_en : selectedOpt.label_ar) : '')}
        </div>
        <ChevronDown size={16} style={{ color: 'var(--text3)' }} />
      </div>
      <AnimatePresence>
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setIsOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            style={{ 
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
              background: 'var(--bg-card)', border: '1px solid rgba(128, 128, 128, 0.25)', 
              borderRadius: '12px', marginTop: '8px', padding: '8px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)', 
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              maxHeight: '220px', overflowY: 'auto'
            }}>
            {options.map(opt => (
              <div 
                key={opt.value}
                style={{ 
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: opt.value === val ? 'var(--bg-main)' : 'transparent',
                  color: opt.value === val ? 'var(--accent)' : 'var(--text1)',
                  fontWeight: opt.value === val ? '600' : '400',
                  fontSize: '14px', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { if (opt.value !== val) e.currentTarget.style.background = 'var(--bg-main)'; }}
                onMouseLeave={(e) => { if (opt.value !== val) e.currentTarget.style.background = 'transparent'; }}
                onClick={() => handleSelect(opt.value)}
              >
                {renderOption ? renderOption(opt) : (isEn ? opt.label_en : opt.label_ar)}
              </div>
            ))}
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminTemplateManager() {
  const { state } = useApp();
  const lang = state.language || 'en';
  const isEn = lang === 'en';
  const toast = useToast();

  const getVectorIcon = (iconStr, cat) => {
    const c = cat ? cat.toLowerCase() : '';
    if (iconStr?.includes('📱') || c.includes('saas') || c.includes('tech')) return <MonitorSmartphone size={20} className="text-indigo-400" />;
    if (iconStr?.includes('🛍') || iconStr?.includes('🛒') || c.includes('commerce') || c.includes('متجر')) return <ShoppingBag size={20} className="text-pink-400" />;
    if (iconStr?.includes('🏥') || c.includes('health') || c.includes('صحة')) return <Stethoscope size={20} className="text-emerald-400" />;
    if (iconStr?.includes('🔧') || c.includes('service') || c.includes('خدمات')) return <Wrench size={20} className="text-slate-400" />;
    if (iconStr?.includes('🏠') || c.includes('real') || c.includes('عقار')) return <Home size={20} className="text-amber-400" />;
    if (iconStr?.includes('🎨') || c.includes('art') || c.includes('فاشون')) return <Palette size={20} className="text-purple-400" />;
    if (iconStr?.includes('🍔') || c.includes('food') || c.includes('مطعم')) return <Pizza size={20} className="text-orange-400" />;
    if (iconStr?.includes('🚀') || c.includes('startup')) return <Rocket size={20} className="text-blue-400" />;
    if (iconStr?.includes('💼') || c.includes('corporate') || c.includes('أعمال')) return <Briefcase size={20} className="text-sky-400" />;
    if (iconStr?.includes('🎓') || c.includes('education') || c.includes('تعليم')) return <GraduationCap size={20} className="text-indigo-500" />;
    if (iconStr?.includes('💪') || c.includes('fitness') || c.includes('جيم')) return <Dumbbell size={20} className="text-slate-500" />;
    if (iconStr?.includes('📸') || c.includes('photo') || c.includes('تصوير')) return <Camera size={20} className="text-purple-500" />;
    if (iconStr?.includes('🚗') || c.includes('auto') || c.includes('سيارات')) return <Car size={20} className="text-red-400" />;
    if (iconStr?.includes('✈️') || c.includes('travel') || c.includes('سفر')) return <Plane size={20} className="text-sky-500" />;
    if (iconStr?.includes('🎵') || c.includes('music') || c.includes('موسيقى')) return <Music size={20} className="text-pink-500" />;
    if (iconStr?.includes('✂️') || c.includes('salon') || c.includes('صالون')) return <Scissors size={20} className="text-rose-400" />;
    if (iconStr?.includes('❤️') || c.includes('charity') || c.includes('خيرية')) return <Heart size={20} className="text-red-500" />;
    if (iconStr?.includes('☕') || c.includes('coffee') || c.includes('قهوة')) return <Coffee size={20} className="text-amber-600" />;
    if (iconStr?.includes('🧹') || c.includes('clean') || c.includes('تنظيف')) return <Brush size={20} className="text-teal-400" />;
    
    return <LayoutTemplate size={20} className="text-indigo-400" />;
  };

  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'categories'
  
  // Data State
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal/Form State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, type: null, title: '' });

  // Search & Filter State
  const [categorySearch, setCategorySearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, tpls] = await Promise.all([
        getAllWebsiteTemplateCategories(),
        getAllWebsiteGalleryTemplates()
      ]);
      setCategories(cats);
      setTemplates(tpls);
    } catch (err) {
      toast(isEn ? "Error loading template data." : "حدث خطأ أثناء تحميل البيانات.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Category Actions ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const catData = {
      label_ar: formData.get('label_ar'),
      label_en: formData.get('label_en'),
      isVisible: formData.get('isVisible') === 'on'
    };

    try {
      if (editingCategory?.id) {
        await saveTemplateCategory(catData, editingCategory.id);
        toast(isEn ? "Category updated successfully." : "تم تحديث التصنيف بنجاح.", "success");
      } else {
        await saveTemplateCategory(catData);
        toast(isEn ? "Category created successfully." : "تم إنشاء التصنيف بنجاح.", "success");
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      loadData();
    } catch (err) {
      toast(isEn ? "Error saving category." : "خطأ في حفظ التصنيف.", "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteTemplateCategory(id);
      toast(isEn ? "Category deleted." : "تم الحذف بنجاح.", "success");
      setDeleteConfirm({ isOpen: false, id: null, type: null, title: '' });
      loadData();
    } catch (err) {
      toast(isEn ? "Error deleting category." : "خطأ في الحذف.", "error");
    }
  };

  const handleToggleCategoryVisibility = async (cat) => {
    try {
      await saveTemplateCategory({ isVisible: !cat.isVisible }, cat.id);
      loadData();
      toast(isEn ? "Visibility updated." : "تم تحديث حالة الظهور.", "success");
    } catch (err) {
      toast(isEn ? "Error updating visibility." : "خطأ في تحديث الظهور.", "error");
    }
  };

  // --- Template Actions ---
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tplData = {
      id: formData.get('id') || `tpl_${Date.now()}`,
      name_ar: formData.get('name_ar'),
      name_en: formData.get('name_en'),
      category: formData.get('category'),
      icon: formData.get('icon') || '✨',
      description_ar: formData.get('description_ar'),
      description_en: formData.get('description_en'),
      code_ar: formData.get('code_ar'),
      code_en: formData.get('code_en'),
      previewUrl: formData.get('previewUrl'),
      status: formData.get('status')
    };

    try {
      if (editingTemplate?.id) {
        await saveWebsiteTemplate(tplData, editingTemplate.id);
        toast(isEn ? "Template updated successfully." : "تم تحديث القالب بنجاح.", "success");
      } else {
        await saveWebsiteTemplate(tplData);
        toast(isEn ? "Template created successfully." : "تم إنشاء القالب بنجاح.", "success");
      }
      setIsTemplateModalOpen(false);
      setEditingTemplate(null);
      loadData();
    } catch (err) {
      toast(isEn ? "Error saving template." : "خطأ في حفظ القالب.", "error");
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteWebsiteTemplate(id);
      toast(isEn ? "Template deleted." : "تم الحذف بنجاح.", "success");
      setDeleteConfirm({ isOpen: false, id: null, type: null, title: '' });
      loadData();
    } catch (err) {
      toast(isEn ? "Error deleting template." : "خطأ في الحذف.", "error");
    }
  };

  const handleDuplicateTemplate = async (tpl) => {
    try {
      const duplicated = {
        ...tpl,
        id: `tpl_${Date.now()}`,
        name_en: `${tpl.name_en} (Copy)`,
        name_ar: `${tpl.name_ar} (نسخة)`,
        status: 'draft' // Duplicates start as draft
      };
      await saveWebsiteTemplate(duplicated);
      toast(isEn ? "Template duplicated." : "تم نسخ القالب بنجاح.", "success");
      loadData();
    } catch (err) {
      toast(isEn ? "Error duplicating template." : "خطأ في النسخ.", "error");
    }
  };

  return (
    <div className="admin-templates-container animate-in" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="atm-header">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text1)' }}>
            {isEn ? "Ready-Made Templates" : "إدارة القوالب الجاهزة"}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            {isEn ? "Manage dynamic templates and categories for the user library." : "إدارة القوالب الديناميكية وتصنيفاتها لمكتبة المستخدمين."}
          </p>
        </div>
        <div className="atm-tabs">
          <button 
            className={`atm-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Layers size={16} />
            {isEn ? "Categories" : "التصنيفات"}
          </button>
          <button 
            className={`atm-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <LayoutTemplate size={16} />
            {isEn ? "Templates" : "القوالب"}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: 'inline-block', marginBottom: '16px' }}>
            <LayoutTemplate size={32} style={{ color: 'var(--accent)' }} />
          </motion.div>
          <div>{isEn ? "Loading Data..." : "جاري تحميل البيانات..."}</div>
        </div>
      ) : activeTab === 'categories' ? (
        // ================= CATEGORIES VIEW =================
        <div className="atm-card animate-in">
          <div className="atm-card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <h3 className="text-lg font-bold m-0" style={{ color: 'var(--text1)' }}>
              {isEn ? "Template Categories" : "تصنيفات القوالب"}
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexGrow: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: isEn ? '12px' : 'auto', right: !isEn ? '12px' : 'auto', color: 'var(--text3)' }} />
                <input 
                  type="text" 
                  className="atm-form-input"
                  style={{ paddingLeft: isEn ? '36px' : '16px', paddingRight: !isEn ? '36px' : '16px', margin: 0 }}
                  placeholder={isEn ? "Search categories..." : "البحث في التصنيفات..."}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
              <button 
                className="atm-btn-primary"
                onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
              >
                <Plus size={16} />
                {isEn ? "Add Category" : "إضافة تصنيف"}
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {categories.length === 0 ? (
              <div className="atm-empty-state">
                <div className="atm-empty-icon"><Layers size={32} /></div>
                <h3 className="atm-empty-title">{isEn ? "No Categories Yet" : "لا توجد تصنيفات بعد"}</h3>
                <p className="atm-empty-desc">{isEn ? "Create your first category to organize your templates." : "قم بإنشاء أول تصنيف لتنظيم قوالبك بطريقة احترافية."}</p>
                <button className="atm-btn-primary" onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}>
                  <Plus size={16} /> {isEn ? "Add First Category" : "أضف أول تصنيف"}
                </button>
              </div>
            ) : (
              <table className="atm-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: isEn ? 'left' : 'right' }}>{isEn ? "English Label" : "الاسم (انجليزي)"}</th>
                    <th style={{ textAlign: isEn ? 'left' : 'right' }}>{isEn ? "Arabic Label" : "الاسم (عربي)"}</th>
                    <th style={{ textAlign: 'center' }}>{isEn ? "Visibility" : "الظهور"}</th>
                    <th style={{ textAlign: 'center' }}>{isEn ? "Actions" : "إجراءات"}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.filter(c => 
                    (c.label_en?.toLowerCase().includes(categorySearch.toLowerCase()) || 
                     c.label_ar?.toLowerCase().includes(categorySearch.toLowerCase()))
                  ).map(cat => (
                    <tr key={cat.id}>
                      <td className="font-medium">{cat.label_en}</td>
                      <td className="font-medium">{cat.label_ar}</td>
                      <td align="center">
                        <button 
                          onClick={() => handleToggleCategoryVisibility(cat)} 
                          className={`atm-badge ${cat.isVisible ? 'visible' : 'hidden'}`}
                          style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                        >
                          {cat.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                          {cat.isVisible ? (isEn ? "Visible" : "مرئي") : (isEn ? "Hidden" : "مخفي")}
                        </button>
                      </td>
                      <td align="center">
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button className="atm-action-btn edit" onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }} title={isEn ? "Edit" : "تعديل"}>
                            <Edit2 size={16} />
                          </button>
                          <button className="atm-action-btn delete" onClick={() => setDeleteConfirm({ isOpen: true, id: cat.id, type: 'category', title: isEn ? cat.label_en : cat.label_ar })} title={isEn ? "Delete" : "حذف"}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        // ================= TEMPLATES VIEW =================
        <div className="atm-card animate-in">
          <div className="atm-card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <h3 className="text-lg font-bold m-0" style={{ color: 'var(--text1)' }}>
              {isEn ? "Funnels & Templates" : "القوالب ومسارات الموقع"}
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexGrow: 1, justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
              
              { (templateFilter !== 'All' || statusFilter !== 'All' || templateSearch !== '') && (
                <button 
                  onClick={() => { setTemplateFilter('All'); setStatusFilter('All'); setTemplateSearch(''); }}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444', borderRadius: '12px', padding: '0 12px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s' }}
                >
                  <RefreshCcw size={14} /> {isEn ? "Reset Filters" : "إعادة ضبط"}
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', width: '42px', background: 'var(--bg-main)', border: '1px solid rgba(128, 128, 128, 0.25)', borderRadius: '12px' }}>
                  <Filter size={18} style={{ color: 'var(--text3)' }} />
                </div>
                <AtmSelect 
                  isEn={isEn}
                  value={templateFilter}
                  onChange={setTemplateFilter}
                  options={[
                    { value: 'All', label_en: 'All Categories', label_ar: 'جميع التصنيفات' },
                    { value: 'عام', label_en: 'General', label_ar: 'عام' },
                    ...categories.map(c => ({ value: c.label_en, label_en: c.label_en, label_ar: c.label_ar }))
                  ]}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AtmSelect 
                  isEn={isEn}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  renderOption={(opt) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'flex' }}>{opt.iconEl}</span>
                      <span>{isEn ? opt.label_en : opt.label_ar}</span>
                    </div>
                  )}
                  options={[
                    { value: 'All', label_en: 'All Statuses', label_ar: 'حالة النشر', iconEl: <Layers size={14} className="text-slate-400" /> },
                    { value: 'published', label_en: 'Published', label_ar: 'منشور', iconEl: <CheckCircle2 size={14} className="text-emerald-400" /> },
                    { value: 'draft', label_en: 'Draft', label_ar: 'مسودة', iconEl: <Edit2 size={14} className="text-amber-400" /> },
                  ]}
                />
              </div>
              <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: isEn ? '12px' : 'auto', right: !isEn ? '12px' : 'auto', color: 'var(--text3)' }} />
                <input 
                  type="text" 
                  className="atm-form-input"
                  style={{ paddingLeft: isEn ? '36px' : '16px', paddingRight: !isEn ? '36px' : '16px', margin: 0, height: '42px' }}
                  placeholder={isEn ? "Search templates..." : "البحث في القوالب..."}
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                />
              </div>
              <button 
                className="atm-btn-primary"
                style={{ height: '42px' }}
                onClick={() => { setEditingTemplate(null); setIsTemplateModalOpen(true); }}
              >
                <Plus size={16} />
                {isEn ? "Add Template" : "إضافة قالب"}
              </button>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="atm-empty-state">
              <div className="atm-empty-icon"><LayoutTemplate size={32} /></div>
              <h3 className="atm-empty-title">{isEn ? "No Templates Available" : "لا توجد قوالب حتى الآن"}</h3>
              <p className="atm-empty-desc">{isEn ? "Start building your professional template library for your users." : "ابدأ ببناء مكتبة القوالب الاحترافية لمستخدميك لتسهيل إنشاء مواقعهم."}</p>
              <button className="atm-btn-primary" onClick={() => { setEditingTemplate(null); setIsTemplateModalOpen(true); }}>
                <Plus size={16} /> {isEn ? "Add First Template" : "أضف أول قالب"}
              </button>
            </div>
          ) : (
            (() => {
              const filteredTemplates = templates.filter(t => 
                (templateFilter === 'All' || t.category === templateFilter || (templateFilter === 'عام' && !t.category)) &&
                (statusFilter === 'All' || (statusFilter === 'published' && t.status !== 'draft') || (statusFilter === 'draft' && t.status === 'draft')) &&
                (t.name_en?.toLowerCase().includes(templateSearch.toLowerCase()) || 
                 t.name_ar?.toLowerCase().includes(templateSearch.toLowerCase()))
              );

              if (filteredTemplates.length === 0) {
                return (
                  <div className="atm-empty-state" style={{ padding: '60px 20px', background: 'transparent', border: 'none' }}>
                    <div className="atm-empty-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}><Search size={32} /></div>
                    <h3 className="atm-empty-title">{isEn ? "No Results Found" : "لا توجد نتائج"}</h3>
                    <p className="atm-empty-desc">{isEn ? "Try adjusting your filters or search terms." : "حاول تغيير كلمات البحث أو التصنيفات للوصول لنتائج."}</p>
                    <button 
                      className="atm-btn-primary" 
                      style={{ background: 'transparent', color: 'var(--text1)', border: '1px solid rgba(128,128,128,0.25)', boxShadow: 'none' }}
                      onClick={() => { setTemplateFilter('All'); setStatusFilter('All'); setTemplateSearch(''); }}
                    >
                      <RefreshCcw size={16} /> {isEn ? "Clear Filters" : "إلغاء الفلاتر"}
                    </button>
                  </div>
                );
              }

              return (
                <div className="atm-grid">
                  {filteredTemplates.map(tpl => {
                    const matchedCategory = categories.find(c => c.label_en === tpl.category || c.id === tpl.category);
                    const categoryLabel = matchedCategory ? (isEn ? matchedCategory.label_en : matchedCategory.label_ar) : (tpl.category || (isEn ? 'General' : 'عام'));
                    
                    return (
                      <div key={tpl.id} className="atm-template-card">
                    <div className="atm-template-cover">
                      {tpl.previewUrl ? (
                        <img src={tpl.previewUrl} alt={tpl.name_en} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      ) : null}
                      <div className="atm-template-cover-fallback" style={{ display: tpl.previewUrl ? 'none' : 'flex' }}>
                        <ImageIcon size={32} />
                        <span>{isEn ? "No Preview" : "لا يوجد غلاف"}</span>
                      </div>
                      <div className="atm-template-category-tag">
                        <Layers size={14} />
                        {categoryLabel}
                      </div>
                    </div>
                    
                    <div className="atm-template-body">
                      <h4 className="atm-template-title">
                        <span>{getVectorIcon(tpl.icon, tpl.category)}</span>
                        {isEn ? tpl.name_en : tpl.name_ar}
                      </h4>
                      <p className="atm-template-desc">
                        {isEn ? tpl.description_en : tpl.description_ar}
                      </p>
                      
                      <div className="atm-template-footer">
                        <span className={`atm-badge ${tpl.status === 'published' ? 'published' : 'draft'}`}>
                          {tpl.status === 'published' ? <CheckCircle2 size={14} /> : <Edit2 size={14} />}
                          {tpl.status === 'published' ? (isEn ? 'Published' : 'منشور') : (isEn ? 'Draft' : 'مسودة')}
                        </span>
                        
                        <div className="atm-template-actions">
                          <button className="atm-action-btn duplicate" onClick={() => handleDuplicateTemplate(tpl)} title={isEn ? "Duplicate" : "نسخ"}>
                            <Copy size={16} />
                          </button>
                          <button className="atm-action-btn edit" onClick={() => { setEditingTemplate(tpl); setIsTemplateModalOpen(true); }} title={isEn ? "Edit" : "تعديل"}>
                            <Edit2 size={16} />
                          </button>
                          <button className="atm-action-btn delete" onClick={() => setDeleteConfirm({ isOpen: true, id: tpl.id, type: 'template', title: isEn ? tpl.name_en : tpl.name_ar })} title={isEn ? "Delete" : "حذف"}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            );
          })()
        )}
      </div>
    )}

      {/* ================= MODALS ================= */}
      
      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="atm-modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} 
              className="atm-modal-content"
              dir={isEn ? 'ltr' : 'rtl'}
            >
              <div className="atm-modal-header">
                <h3 className="atm-modal-title">
                  <Layers size={20} className="text-indigo-400" />
                  {editingCategory ? (isEn ? 'Edit Category' : 'تعديل التصنيف') : (isEn ? 'New Category' : 'تصنيف جديد')}
                </h3>
                <button type="button" className="atm-modal-close" onClick={() => setIsCategoryModalOpen(false)}>
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveCategory}>
                <div className="atm-modal-body">
                  <div className="atm-form-group">
                    <label className="atm-form-label">{isEn ? 'English Label' : 'الاسم (انجليزي)'}</label>
                    <input name="label_en" className="atm-form-input" defaultValue={editingCategory?.label_en} required placeholder="e.g. SaaS / Real Estate" />
                  </div>
                  <div className="atm-form-group">
                    <label className="atm-form-label">{isEn ? 'Arabic Label' : 'الاسم (عربي)'}</label>
                    <input name="label_ar" className="atm-form-input" defaultValue={editingCategory?.label_ar} required placeholder="مثال: عقارات / متاجر" />
                  </div>
                  <label className="atm-toggle-label">
                    <input type="checkbox" name="isVisible" className="atm-toggle-input" defaultChecked={editingCategory ? editingCategory.isVisible : true} />
                    <span className="font-medium" style={{ color: 'var(--text1)' }}>{isEn ? 'Visible to Users in Workspace' : 'مرئي للمستخدمين في مساحة العمل'}</span>
                  </label>
                </div>
                <div className="atm-modal-footer">
                  <button type="button" className="atm-btn-cancel" onClick={() => setIsCategoryModalOpen(false)}>
                    {isEn ? 'Cancel' : 'إلغاء'}
                  </button>
                  <button type="submit" className="atm-btn-submit">
                    {isEn ? 'Save Category' : 'حفظ التصنيف'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Modal */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="atm-modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} 
              className="atm-modal-content large"
              dir={isEn ? 'ltr' : 'rtl'}
            >
              <div className="atm-modal-header">
                <h3 className="atm-modal-title">
                  <LayoutTemplate size={20} className="text-indigo-400" />
                  {editingTemplate ? (isEn ? 'Edit Template' : 'تعديل القالب') : (isEn ? 'New Template' : 'قالب جديد')}
                </h3>
                <button type="button" className="atm-modal-close" onClick={() => setIsTemplateModalOpen(false)}>
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveTemplate}>
                <div className="atm-modal-body">
                  <input type="hidden" name="id" value={editingTemplate?.id || ''} />
                  
                  <div className="atm-form-row">
                    <div className="atm-form-group">
                      <label className="atm-form-label">{isEn ? 'English Title' : 'العنوان (انجليزي)'}</label>
                      <input name="name_en" className="atm-form-input" defaultValue={editingTemplate?.name_en} required placeholder="e.g. Modern Landing Page" />
                    </div>
                    <div className="atm-form-group">
                      <label className="atm-form-label">{isEn ? 'Arabic Title' : 'العنوان (عربي)'}</label>
                      <input name="name_ar" className="atm-form-input" defaultValue={editingTemplate?.name_ar} required placeholder="مثال: صفحة هبوط عصرية" />
                    </div>
                  </div>

                  <div className="atm-form-row">
                    <div className="atm-form-group">
                      <label className="atm-form-label">{isEn ? 'Category' : 'التصنيف'}</label>
                      <AtmSelect 
                        name="category"
                        isEn={isEn}
                        defaultValue={editingTemplate?.category}
                        options={[
                          { value: 'عام', label_en: 'General', label_ar: 'عام' },
                          ...categories.map(c => ({ value: c.label_en, label_en: c.label_en, label_ar: c.label_ar }))
                        ]}
                      />
                    </div>
                    <div className="atm-form-group">
                      <label className="atm-form-label">{isEn ? 'Icon (Vector)' : 'أيقونة (فيكتور)'}</label>
                      <AtmSelect 
                        name="icon"
                        isEn={isEn}
                        defaultValue={editingTemplate?.icon || '✨'}
                        renderOption={(opt) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--accent)', display: 'flex' }}>{opt.iconEl}</span>
                            <span>{isEn ? opt.label_en : opt.label_ar}</span>
                          </div>
                        )}
                        options={[
                          { value: '✨', label_en: 'General', label_ar: 'عام', iconEl: <LayoutTemplate size={16} /> },
                          { value: '📱', label_en: 'Tech / SaaS', label_ar: 'تقنية / ساس', iconEl: <MonitorSmartphone size={16} /> },
                          { value: '🛍️', label_en: 'Commerce', label_ar: 'متجر', iconEl: <ShoppingBag size={16} /> },
                          { value: '🏥', label_en: 'Health', label_ar: 'صحة', iconEl: <Stethoscope size={16} /> },
                          { value: '🔧', label_en: 'Service', label_ar: 'خدمات', iconEl: <Wrench size={16} /> },
                          { value: '🏠', label_en: 'Real Estate', label_ar: 'عقار', iconEl: <Home size={16} /> },
                          { value: '🎨', label_en: 'Art / Fashion', label_ar: 'فن / فاشون', iconEl: <Palette size={16} /> },
                          { value: '🍔', label_en: 'Food', label_ar: 'طعام', iconEl: <Pizza size={16} /> },
                          { value: '🚀', label_en: 'Startup', label_ar: 'شركة ناشئة', iconEl: <Rocket size={16} /> },
                          { value: '💼', label_en: 'Corporate', label_ar: 'أعمال', iconEl: <Briefcase size={16} /> },
                          { value: '🎓', label_en: 'Education', label_ar: 'تعليم', iconEl: <GraduationCap size={16} /> },
                          { value: '💪', label_en: 'Fitness / Gym', label_ar: 'لياقة / جيم', iconEl: <Dumbbell size={16} /> },
                          { value: '📸', label_en: 'Photography', label_ar: 'تصوير', iconEl: <Camera size={16} /> },
                          { value: '🚗', label_en: 'Automotive', label_ar: 'سيارات', iconEl: <Car size={16} /> },
                          { value: '✈️', label_en: 'Travel', label_ar: 'سفر', iconEl: <Plane size={16} /> },
                          { value: '🎵', label_en: 'Music / DJ', label_ar: 'موسيقى', iconEl: <Music size={16} /> },
                          { value: '✂️', label_en: 'Salon', label_ar: 'صالون', iconEl: <Scissors size={16} /> },
                          { value: '❤️', label_en: 'Charity', label_ar: 'جمعية خيرية', iconEl: <Heart size={16} /> },
                          { value: '☕', label_en: 'Cafe / Coffee', label_ar: 'مقهى / قهوة', iconEl: <Coffee size={16} /> },
                          { value: '🧹', label_en: 'Cleaning Services', label_ar: 'خدمات تنظيف', iconEl: <Brush size={16} /> },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="atm-form-group">
                    <label className="atm-form-label">{isEn ? 'Cover Image / Preview URL' : 'رابط صورة الغلاف'}</label>
                    <input name="previewUrl" className="atm-form-input" defaultValue={editingTemplate?.previewUrl} placeholder="https://firebasestorage.googleapis.com/.../preview.jpg" />
                  </div>

                  <div className="atm-form-group">
                    <label className="atm-form-label">{isEn ? 'English Description' : 'الوصف (انجليزي)'}</label>
                    <textarea name="description_en" className="atm-form-textarea" defaultValue={editingTemplate?.description_en} placeholder="Brief description of the template..."></textarea>
                  </div>
                  <div className="atm-form-group">
                    <label className="atm-form-label">{isEn ? 'Arabic Description' : 'الوصف (عربي)'}</label>
                    <textarea name="description_ar" className="atm-form-textarea" defaultValue={editingTemplate?.description_ar} placeholder="وصف قصير لمميزات القالب..."></textarea>
                  </div>

                  <div className="atm-form-group">
                    <label className="atm-form-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Code size={16} /> {isEn ? 'HTML / Tailwind Payload (EN)' : 'كود القالب (انجليزي)'}
                    </label>
                    <textarea name="code_en" className="atm-form-textarea code" defaultValue={editingTemplate?.code_en} required placeholder="<div class='bg-white...'>...</div>"></textarea>
                  </div>
                  <div className="atm-form-group">
                    <label className="atm-form-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Code size={16} /> {isEn ? 'HTML / Tailwind Payload (AR)' : 'كود القالب (عربي)'}
                    </label>
                    <textarea name="code_ar" className="atm-form-textarea code" defaultValue={editingTemplate?.code_ar} required placeholder="<div class='bg-white...' dir='rtl'>...</div>"></textarea>
                  </div>

                  <div className="atm-form-group" style={{ marginBottom: 0 }}>
                    <label className="atm-form-label">{isEn ? 'Publish Status' : 'حالة النشر'}</label>
                    <AtmSelect 
                      name="status"
                      isEn={isEn}
                      defaultValue={editingTemplate?.status || 'published'}
                      renderOption={(opt) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'flex' }}>{opt.iconEl}</span>
                          <span>{isEn ? opt.label_en : opt.label_ar}</span>
                        </div>
                      )}
                      options={[
                        { value: 'published', label_en: 'Published (Visible to Users)', label_ar: 'منشور (يظهر للمستخدمين)', iconEl: <CheckCircle2 size={16} className="text-emerald-400" /> },
                        { value: 'draft', label_en: 'Draft (Hidden)', label_ar: 'مسودة (مخفي)', iconEl: <Edit2 size={16} className="text-amber-400" /> },
                      ]}
                    />
                  </div>
                </div>
                <div className="atm-modal-footer">
                  <button type="button" className="atm-btn-cancel" onClick={() => setIsTemplateModalOpen(false)}>
                    {isEn ? 'Cancel' : 'إلغاء'}
                  </button>
                  <button type="submit" className="atm-btn-submit">
                    {isEn ? 'Save Template Payload' : 'حفظ القالب والكود'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="atm-modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} 
              className="atm-modal-content"
              style={{ maxWidth: '400px' }}
              dir={isEn ? 'ltr' : 'rtl'}
            >
              <div className="atm-modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
                  <Trash2 size={24} />
                  <h3 className="atm-modal-title" style={{ color: '#ef4444' }}>
                    {isEn ? 'Confirm Delete' : 'تأكيد الحذف'}
                  </h3>
                </div>
              </div>
              <div className="atm-modal-body" style={{ paddingTop: '16px', color: 'var(--text1)' }}>
                <p style={{ margin: 0, fontSize: '15px' }}>
                  {isEn 
                    ? `Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.` 
                    : `هل أنت متأكد من حذف "${deleteConfirm.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                </p>
              </div>
              <div className="atm-modal-footer" style={{ borderTop: 'none', paddingTop: 0, background: 'transparent' }}>
                <button type="button" className="atm-btn-cancel" onClick={() => setDeleteConfirm({ isOpen: false, id: null, type: null, title: '' })}>
                  {isEn ? 'Cancel' : 'إلغاء'}
                </button>
                <button 
                  type="button" 
                  className="atm-btn-submit" 
                  style={{ background: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}
                  onClick={() => {
                    if (deleteConfirm.type === 'category') handleDeleteCategory(deleteConfirm.id);
                    if (deleteConfirm.type === 'template') handleDeleteTemplate(deleteConfirm.id);
                  }}
                >
                  {isEn ? 'Delete' : 'حذف'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

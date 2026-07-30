import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { createPortal } from 'react-dom';
import { collection, getDocs } from 'firebase/firestore';
import { libraryDb } from '../../../firebaseLibrary';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Layers,
  FileCode,
  Bot,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  FolderOpen,
  Eye,
  Download,
  Search
} from 'lucide-react';
import './BrandLibrary.css';

export default function BrandLibrary({ isMobile }) {
  const toast = useToast();
  const { state } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedAutomationImages, setSelectedAutomationImages] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedBrandDetails, setSelectedBrandDetails] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const snap = await getDocs(collection(libraryDb, 'brandLibrary'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Filter out private products unless they belong to this user's brand
        const visibleList = list.filter(p => {
          if (!p.isPrivate) return true;
          return p.adminUid === userData?.createdBy || p.brandName === userData?.brandName;
        });

        visibleList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setBrands(visibleList);
      } catch (err) {
      console.error(err);
      if (err?.message === 'OUT_OF_CREDITS' || err?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [lang, userData]);

  const categories = ['الكل', ...new Set(brands.map(b => b.category).filter(Boolean))];

  const filteredBrands = brands.filter(b => {
    const matchesCategory = selectedCategory === 'الكل' || b.category === selectedCategory;
    if (!searchQuery.trim()) return matchesCategory;

    const q = searchQuery.toLowerCase().trim();
    const title = (b.title || b.name || '').toLowerCase();
    const desc = (b.description || '').toLowerCase();
    const category = (b.category || '').toLowerCase();

    const matchesSearch = title.includes(q) || desc.includes(q) || category.includes(q);
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (cat) => {
    if (lang === 'en') {
      if (cat === 'الكل') return 'All';
      if (cat === 'كتاب') return 'Books';
      if (cat === 'قوالب') return 'Templates';
      return cat;
    }
    return cat;
  };

  const getCategoryIcon = (cat) => {
    if (cat === 'كتاب') return BookOpen;
    if (cat === 'قوالب') return FileCode;
    return Layers;
  };

  const openAutomation = (images) => {
    setSelectedAutomationImages(images);
    setCurrentImageIndex(0);
  };

  const closeAutomation = () => {
    setSelectedAutomationImages(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % selectedAutomationImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + selectedAutomationImages.length) % selectedAutomationImages.length);
  };

  return (
    <div className="bl-container" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="bl-header">
        <h1 className="bl-title">
          <BookOpen size={24} color="#3B82F6" />
          <span>{lang === 'en' ? 'Product & Resource Library' : 'مكتبة المنتجات والأتوميشن'}</span>
        </h1>
        <p className="bl-subtitle">
          {lang === 'en' 
            ? 'Browse available ready-to-use digital products, guidebooks, and automation templates to scale your business.' 
            : 'استعرض المنتجات الرقمية، أدلة العمل، وقوالب الأتوميشن الجاهزة لتطوير عملك وسرعة النمو.'}
        </p>
      </div>

      {/* ═══════════════ ADVANCED SEARCH BAR ═══════════════ */}
      {!loading && brands.length > 0 && (
        <div className="bl-search-wrap">
          <Search size={16} className="bl-search-icon" />
          <input 
            type="text"
            className="bl-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search products, books, automation templates...' : 'ابحث في المنتجات، الكتب، وقوالب الأتوميشن...'}
          />
          {searchQuery && (
            <button className="bl-search-clear-btn" onClick={() => setSearchQuery('')} title={lang === 'en' ? 'Clear search' : 'مسح البحث'}>
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ═══════════════ FILTER BAR ═══════════════ */}
      {!loading && brands.length > 0 && (
        <div className="bl-filter-bar">
          {categories.map(cat => {
            const CatIcon = getCategoryIcon(cat);
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`bl-filter-pill ${isActive ? 'active' : ''}`}
              >
                <CatIcon size={14} />
                <span>{getCategoryLabel(cat)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════ GRID CONTENT STATES ═══════════════ */}
      {loading ? (
        <div className="bl-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bl-card skeleton-shimmer" style={{ height: 380, opacity: 0.7 }}>
              <div style={{ height: 190, background: 'var(--bg3, rgba(30, 41, 59, 0.6))' }} />
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 20, background: 'var(--bg3, rgba(30, 41, 59, 0.6))', borderRadius: 6, width: '65%' }} />
                <div style={{ height: 14, background: 'var(--bg3, rgba(30, 41, 59, 0.6))', borderRadius: 6, width: '85%' }} />
                <div style={{ height: 14, background: 'var(--bg3, rgba(30, 41, 59, 0.6))', borderRadius: 6, width: '45%' }} />
                <div style={{ height: 42, background: 'var(--bg3, rgba(30, 41, 59, 0.6))', borderRadius: 12, marginTop: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: 24, borderRadius: 16, textAlign: 'center', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg2, rgba(15, 23, 42, 0.6))', borderRadius: 24, border: '1px solid var(--line, rgba(255, 255, 255, 0.08))' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FolderOpen size={28} />
          </div>
          <div style={{ color: 'var(--text, #F8FAFC)', fontWeight: 800, fontSize: '15px' }}>
            {searchQuery 
              ? (lang === 'en' ? `No results found for "${searchQuery}"` : `لا توجد نتائج تطابق "${searchQuery}"`)
              : (lang === 'en' ? 'The library is currently empty' : 'المكتبة فارغة حالياً')}
          </div>
          <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '12.5px', marginTop: 4 }}>
            {searchQuery 
              ? (lang === 'en' ? 'Try searching with different keywords or clear the search.' : 'جرب البحث بكلمات أخرى أو قم بإلغاء البحث.')
              : (lang === 'en' ? 'New digital resources will be uploaded soon.' : 'سيتم إضافة موارد رقمية وقوالب جديدة قريباً.')}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            className="bl-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filteredBrands.map(brand => (
              <div key={brand.id} className="bl-card">
                
                {/* Image Thumbnail */}
                <div 
                  className="bl-card-thumb-wrap"
                  onClick={() => setSelectedBrandDetails(brand)}
                >
                  <img 
                    src={brand.imageUrl} 
                    alt={brand.title || brand.name} 
                    onError={(e) => { 
                      e.target.style.display = 'none'; 
                      e.target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748B;font-weight:900;font-size:28px;">${(brand.title || brand.name || '?').charAt(0)}</div>`; 
                    }}
                  />

                  {brand.type === 'automation' && (
                    <div className="bl-badge-automation">
                      <Bot size={12} />
                      <span>{lang === 'en' ? 'Automation Template' : 'قالب أتوميشن'}</span>
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="bl-card-body">
                  <div 
                    className="bl-card-header"
                    onClick={() => setSelectedBrandDetails(brand)}
                  >
                    <h3 className="bl-card-item-title">{brand.title || brand.name}</h3>
                    <span className="bl-category-tag">
                      {getCategoryLabel(brand.category)}
                    </span>
                  </div>

                  <p 
                    className="bl-card-desc"
                    onClick={() => setSelectedBrandDetails(brand)}
                  >
                    {brand.description}
                  </p>

                  <button 
                    className="bl-read-more-btn"
                    onClick={() => setSelectedBrandDetails(brand)}
                  >
                    <span>{lang === 'en' ? 'Read Details' : 'عرض التفاصيل'}</span>
                    {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
                  </button>

                  <div style={{ marginTop: 'auto' }}>
                    {brand.type === 'automation' ? (
                      <>
                        <button 
                          onClick={() => openAutomation(brand.automationImages)}
                          className="bl-btn-primary-action"
                        >
                          <Bot size={16} />
                          <span>{lang === 'en' ? 'View Automation Template' : 'عرض قالب الأتوميشن'}</span>
                        </button>
                        
                        {brand.pdfUrl && (
                          <a 
                            href={brand.pdfUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bl-btn-secondary-action"
                          >
                            <FileText size={14} />
                            <span>{lang === 'en' ? 'Download Guide (PDF)' : 'تحميل ملف الشرح (PDF)'}</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <a 
                        href={brand.pdfUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bl-btn-pdf-action"
                      >
                        <FileText size={16} />
                        <span>{lang === 'en' ? 'View or Download PDF' : 'عرض أو تحميل الـ PDF'}</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ═══════════════ BRAND DETAILS MODAL ═══════════════ */}
      {selectedBrandDetails && createPortal((
        <div 
          className="bl-modal-overlay"
          onClick={() => setSelectedBrandDetails(null)}
        >
          <div 
            className="bl-modal-card"
            onClick={e => e.stopPropagation()}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div style={{ height: 210, background: '#0F172A', position: 'relative' }}>
              <img 
                src={selectedBrandDetails.imageUrl} 
                alt={selectedBrandDetails.title || selectedBrandDetails.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                  e.target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748B;font-weight:900;font-size:32px;">${(selectedBrandDetails.title || selectedBrandDetails.name || '?').charAt(0)}</div>`; 
                }}
              />
              <button 
                onClick={() => setSelectedBrandDetails(null)} 
                className="bl-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text, #F8FAFC)', margin: 0 }}>
                  {selectedBrandDetails.title || selectedBrandDetails.name}
                </h2>
                <span className="bl-category-tag">
                  {getCategoryLabel(selectedBrandDetails.category)}
                </span>
              </div>

              <p style={{ fontSize: 13.5, color: 'var(--text2, #94A3B8)', lineHeight: 1.8, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
                {selectedBrandDetails.description}
              </p>
              
              <div style={{ marginTop: 'auto' }}>
                {selectedBrandDetails.type === 'automation' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button 
                      onClick={() => openAutomation(selectedBrandDetails.automationImages)}
                      className="bl-btn-primary-action"
                    >
                      <Bot size={16} />
                      <span>{lang === 'en' ? 'View Automation Template' : 'عرض قالب الأتوميشن'}</span>
                    </button>
                    
                    {selectedBrandDetails.pdfUrl && (
                      <a 
                        href={selectedBrandDetails.pdfUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bl-btn-secondary-action"
                      >
                        <FileText size={14} />
                        <span>{lang === 'en' ? 'Download Guide (PDF)' : 'تحميل ملف الشرح (PDF)'}</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <a 
                    href={selectedBrandDetails.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bl-btn-pdf-action"
                  >
                    <FileText size={16} />
                    <span>{lang === 'en' ? 'View or Download PDF' : 'عرض أو تحميل الـ PDF'}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ), document.body)}

      {/* ═══════════════ AUTOMATION VIEWER MODAL ═══════════════ */}
      {selectedAutomationImages && createPortal((
        <div 
          className="bl-modal-overlay" 
          style={{ background: 'rgba(0, 0, 0, 0.95)', zIndex: 10000 }}
          onClick={closeAutomation}
        >
          <button 
            style={{
              position: 'absolute', top: 20, insetInlineEnd: 20, background: 'rgba(255, 255, 255, 0.1)', border: 'none',
              color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', zIndex: 2001,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} 
            onClick={closeAutomation}
          >
            <X size={20} />
          </button>

          <div 
            style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', alignItems: 'center' }} 
            onClick={e => e.stopPropagation()}
          >
            {selectedAutomationImages.length > 1 && (
              <button 
                style={{
                  position: 'absolute', insetInlineStart: -56, background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)'
                }} 
                onClick={prevImage}
              >
                {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            )}

            <img 
              src={selectedAutomationImages[currentImageIndex]} 
              alt="Automation Step" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} 
            />

            {selectedAutomationImages.length > 1 && (
              <button 
                style={{
                  position: 'absolute', insetInlineEnd: -56, background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)'
                }} 
                onClick={nextImage}
              >
                {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}

            <div style={{
              position: 'absolute', bottom: -36, left: 0, right: 0, textAlign: 'center',
              color: '#fff', fontSize: 13, fontWeight: 800
            }}>
              {currentImageIndex + 1} / {selectedAutomationImages.length}
            </div>
          </div>
        </div>
      ), document.body)}

    </div>
  );
}

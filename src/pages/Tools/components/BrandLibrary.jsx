import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs } from 'firebase/firestore';
import { libraryDb } from '../../../firebaseLibrary';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';

export default function BrandLibrary({ isMobile }) {
  const { state } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('الكل');

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
        console.error("Error fetching brand library:", err);
        setError(lang === 'en' ? 'Failed to load product library' : 'تعذر تحميل مكتبة المنتجات');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [lang, userData]);

  const categories = ['الكل', ...new Set(brands.map(b => b.category).filter(Boolean))];

  const filteredBrands = selectedCategory === 'الكل' 
    ? brands 
    : brands.filter(b => b.category === selectedCategory);

  const getCategoryLabel = (cat) => {
    if (lang === 'en') {
      if (cat === 'الكل') return 'All';
      if (cat === 'كتاب') return 'Books';
      if (cat === 'قوالب') return 'Templates';
      return cat;
    }
    return cat;
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
    <div className="tool-content" style={{ padding: isMobile ? 8 : 20, paddingBottom: 100 }}>
      <div className="tool-header" style={{ marginBottom: 16 }}>
        <h1 className="tool-title" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          {lang === 'en' ? '📚 Product Library' : '📚 مكتبة المنتجات'}
        </h1>
        <p className="tool-desc" style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 600 }}>
          {lang === 'en' 
            ? 'Browse available files and automation templates to grow your business.' 
            : 'استعرض الملفات المتاحة وقوالب الأتوميشن لتطوير عملك.'}
        </p>
      </div>

      {/* Filter Bar */}
      {!loading && brands.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                background: selectedCategory === cat ? 'var(--accent)' : 'var(--bg2)',
                color: selectedCategory === cat ? '#fff' : 'var(--text2)',
                border: `1px solid ${selectedCategory === cat ? 'var(--accent)' : 'var(--line)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="sa-submit-spinner" style={{ borderTopColor: 'var(--accent)', margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--text2)' }}>
            {lang === 'en' ? 'Loading library...' : 'جاري تحميل المكتبة...'}
          </div>
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', padding: 24, borderRadius: 12, textAlign: 'center', fontWeight: 600 }}>
          {error}
        </div>
      ) : brands.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--line)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📂</div>
          <div style={{ color: 'var(--text2)', fontWeight: 600 }}>
            {lang === 'en' ? 'The library is currently empty' : 'المكتبة فارغة حالياً'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredBrands.map(brand => (
            <div key={brand.id} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div 
                style={{ height: 180, background: '#111', position: 'relative', cursor: 'pointer' }}
                onClick={() => setSelectedBrandDetails(brand)}
              >
                <img 
                  src={brand.imageUrl} 
                  alt={brand.title || brand.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-weight:bold;font-size:24px;">' + (brand.title || brand.name || '?').charAt(0) + '</div>'; }}
                />
                {brand.type === 'automation' && (
                   <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 6 }}>
                      {lang === 'en' ? '🤖 Automation Template' : '🤖 قالب أتوميشن'}
                   </div>
                )}
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => setSelectedBrandDetails(brand)}
                >
                   <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{brand.title || brand.name}</h3>
                   <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4 }}>
                     {getCategoryLabel(brand.category)}
                   </span>
                </div>
                <div 
                  style={{ cursor: 'pointer', flex: 1, marginBottom: 24 }}
                  onClick={() => setSelectedBrandDetails(brand)}
                >
                  <p style={{ 
                    fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, margin: 0,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {brand.description}
                  </p>
                  <span style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4, display: 'inline-block', fontWeight: 600 }}>
                    {lang === 'en' ? 'Read more' : 'قراءة المزيد'}
                  </span>
                </div>
                
                {brand.type === 'automation' ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button 
                        onClick={() => openAutomation(brand.automationImages)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)',
                          padding: '12px', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)',
                          fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <span>🤖</span> {lang === 'en' ? 'View Automation Template' : 'عرض قالب الأتوميشن'}
                      </button>
                      
                      {brand.pdfUrl && (
                         <a 
                           href={brand.pdfUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           style={{
                             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                             background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text2)',
                             padding: '10px', borderRadius: 8, border: '1px solid var(--line)',
                             textDecoration: 'none', fontWeight: 600, fontSize: 12, transition: 'all 0.2s'
                           }}
                         >
                           <span>📄</span> {lang === 'en' ? 'Download Explanation (PDF)' : 'تحميل ملف الشرح (PDF)'}
                         </a>
                      )}
                   </div>
                ) : (
                  <a 
                    href={brand.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)',
                      padding: '12px', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.2)',
                      textDecoration: 'none', fontWeight: 700, fontSize: 14, transition: 'all 0.2s'
                    }}
                  >
                    <span>📄</span> {lang === 'en' ? 'View or Download PDF' : 'عرض أو تحميل الـ PDF'}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brand Details Modal */}
      {selectedBrandDetails && createPortal((
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          backdropFilter: 'blur(5px)'
        }} onClick={() => setSelectedBrandDetails(null)}>
          <div style={{
            background: 'var(--panel)', width: '100%', maxWidth: 500, borderRadius: 20,
            overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 200, background: '#111', position: 'relative' }}>
              <img 
                src={selectedBrandDetails.imageUrl} 
                alt={selectedBrandDetails.title || selectedBrandDetails.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-weight:bold;font-size:24px;">' + (selectedBrandDetails.title || selectedBrandDetails.name || '?').charAt(0) + '</div>'; }}
              />
              <button onClick={() => setSelectedBrandDetails(null)} style={{
                position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: 'none',
                color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
              }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{selectedBrandDetails.title || selectedBrandDetails.name}</h2>
                 <span style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>
                   {getCategoryLabel(selectedBrandDetails.category)}
                 </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
                {selectedBrandDetails.description}
              </p>
              
              {selectedBrandDetails.type === 'automation' ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                    <button 
                      onClick={() => openAutomation(selectedBrandDetails.automationImages)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)',
                        padding: '14px', borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)',
                        fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <span>🤖</span> {lang === 'en' ? 'View Automation Template' : 'عرض قالب الأتوميشن'}
                    </button>
                    
                    {selectedBrandDetails.pdfUrl && (
                       <a 
                         href={selectedBrandDetails.pdfUrl} 
                         target="_blank" 
                         rel="noreferrer"
                         style={{
                           display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                           background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text2)',
                           padding: '14px', borderRadius: 12, border: '1px solid var(--line)',
                           textDecoration: 'none', fontWeight: 600, fontSize: 14, transition: 'all 0.2s'
                         }}
                       >
                         <span>📄</span> {lang === 'en' ? 'Download Explanation (PDF)' : 'تحميل ملف الشرح (PDF)'}
                       </a>
                    )}
                 </div>
              ) : (
                <a 
                  href={selectedBrandDetails.pdfUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)', marginTop: 'auto',
                    padding: '14px', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.2)',
                    textDecoration: 'none', fontWeight: 700, fontSize: 15, transition: 'all 0.2s'
                  }}
                >
                  <span>📄</span> {lang === 'en' ? 'View or Download PDF' : 'عرض أو تحميل الـ PDF'}
                </a>
              )}
            </div>
          </div>
        </div>
      ), document.body)}

      {/* Automation Viewer Modal */}
      {selectedAutomationImages && createPortal((
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.95)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={closeAutomation}>
          
          <button style={{
            position: 'absolute', top: 20, right: 20, background: 'none', border: 'none',
            color: '#fff', fontSize: 32, cursor: 'pointer', zIndex: 2001
          }} onClick={closeAutomation}>×</button>

          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            
            {selectedAutomationImages.length > 1 && (
               <button style={{
                  position: 'absolute', left: -60, background: 'rgba(255,255,255,0.1)',
                  border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%',
                  cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
               }} onClick={prevImage}>❮</button>
            )}

            <img 
              src={selectedAutomationImages[currentImageIndex]} 
              alt="Automation Step" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} 
            />

            {selectedAutomationImages.length > 1 && (
               <button style={{
                  position: 'absolute', right: -60, background: 'rgba(255,255,255,0.1)',
                  border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%',
                  cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
               }} onClick={nextImage}>❯</button>
            )}

            <div style={{
               position: 'absolute', bottom: -40, left: 0, right: 0, textAlign: 'center',
               color: '#fff', fontSize: 14, fontWeight: 700
            }}>
               {currentImageIndex + 1} / {selectedAutomationImages.length}
            </div>
          </div>
        </div>
      ), document.body)}

      <style dangerouslySetInnerHTML={{ __html: `
         .sa-submit-spinner {
            width: 24px; height: 24px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top: 3px solid #fff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
         }
         @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}


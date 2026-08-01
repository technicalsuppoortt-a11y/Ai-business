import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import useToolCache from '../../../hooks/useToolCache';
import { useRef } from 'react';
import { getBrandNames, getBrandNichesDef } from '../../../services/contentDbService';
import ToolDashboardLayout from './ToolDashboardLayout';

const BRAND_CATEGORIES = [
  { id: 'ecom', label_ar: 'التجارة الإلكترونية', label_en: 'E-commerce', sub_ar: 'منتجات ملموسة', sub_en: 'Physical Products', icon: '🛒' },
  { id: 'digital', label_ar: 'المنتجات الرقمية', label_en: 'Digital Products', sub_ar: 'كورسات، قوالب', sub_en: 'Courses, Templates', icon: '💎' },
  { id: 'services', label_ar: 'الخدمات والأعمال', label_en: 'Services', sub_ar: 'تسويق، استشارات', sub_en: 'Marketing, Consulting', icon: '💼' }
];

export default function BrandNaming({ stepNumber }) {
  const toast = useToast();
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const lang = state.language || 'ar';

  const { cachedData: cached, isLoadingCache, saveResult } = useToolCache(userData?.uid, 'brand-naming');
  const hydratedRef = useRef(false);

  // All state starts empty — set from Firestore after load completes
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCatalogs, setGeneratedCatalogs] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ecom');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedCatalogs, setSelectedCatalogs] = useState([]);
  const [nameLanguage, setNameLanguage] = useState('all');
  const [dynamicStyles, setDynamicStyles] = useState({});

  // === SINGLE INIT: runs once when Firestore finishes loading ===
  // Fetches style definitions AND restores saved state in one atomic step
  useEffect(() => {
    if (isLoadingCache || hydratedRef.current) return;
    hydratedRef.current = true;

    const ts = cached?.updatedAt ? new Date(cached.updatedAt?.seconds * 1000).toLocaleString() : 'NO DATA';
    console.log(`[Firestore Status]: Connected | User: ${userData?.uid} | Tool: brand-naming | Last Loaded: ${ts}`);

    (async () => {
      try {
        const defs = await getBrandNichesDef();
        setDynamicStyles(defs || {});

        if (cached?.inputs) {
          // Pre-seed prevStyleRef BEFORE calling setSelectedStyle so the reset
          // effect does NOT treat this hydration set as a user-triggered style change
          prevStyleRef.current = cached.inputs.selectedStyle ?? null;

          if (cached.inputs.selectedCategory) setSelectedCategory(cached.inputs.selectedCategory);
          if (cached.inputs.selectedStyle)    setSelectedStyle(cached.inputs.selectedStyle);
          if (cached.inputs.selectedCatalogs) setSelectedCatalogs(cached.inputs.selectedCatalogs);
          if (cached.inputs.nameLanguage)     setNameLanguage(cached.inputs.nameLanguage);
        } else if (defs?.ecom?.length > 0) {
          // Fresh user — set default style (pre-seed ref so reset effect skips)
          prevStyleRef.current = defs.ecom[0].id;
          setSelectedStyle(defs.ecom[0].id);
        }

        if (cached?.result) {
          setGeneratedCatalogs(cached.result);
        }
      } catch (err) {
        console.error('[BrandNaming] init error:', err);
      }
    })();
  }, [isLoadingCache]); // eslint-disable-line react-hooks/exhaustive-deps
  // NOTE: No auto-save effect. saveResult is called ONLY inside generateBrandNames.

  const currentStyles = dynamicStyles[selectedCategory] || [];
  const currentCatalogs = currentStyles.find(s => s.id === selectedStyle)?.catalogs || [];

  // Reset style when category changes — only after hydration
  const prevStyleRef = useRef(undefined);
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (currentStyles.length > 0 && !currentStyles.find(s => s.id === selectedStyle)) {
      setSelectedStyle(currentStyles[0].id);
    }
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset catalogs + results when style changes — only after hydration, only on real user change
  useEffect(() => {
    if (prevStyleRef.current === undefined) { prevStyleRef.current = selectedStyle; return; }
    if (prevStyleRef.current === selectedStyle) return;
    prevStyleRef.current = selectedStyle;
    if (hydratedRef.current) { setSelectedCatalogs([]); setGeneratedCatalogs(null); }
  }, [selectedStyle]);

  const toggleCatalog = (catId) => {
    if (selectedCatalogs.includes(catId)) {
      setSelectedCatalogs(prev => prev.filter(id => id !== catId));
    } else {
      setSelectedCatalogs(prev => [...prev, catId]);
    }
  };

  const handleNameChange = (name) => {
    dispatch({ type: 'SET_FIELD', field: 'brandName', value: name });
  };

  const generateBrandNames = async () => {
    if (selectedCatalogs.length === 0) {
      alert(lang === 'en' ? 'Please select at least one catalog.' : 'الرجاء تحديد كتالوج واحد على الأقل.');
      return;
    }

    setIsGenerating(true);
    setGeneratedCatalogs(null);

    try {
      await new Promise(r => setTimeout(r, 800)); // Simulate processing

      const dbResult = await getBrandNames(selectedStyle);
      
      if (dbResult && dbResult.catalogs) {
        const results = {};
        
        // Helper to get 25 random items
        const getRandom25 = (arr) => {
          if (!arr || arr.length === 0) return [];
          const filteredArr = arr.filter(item => {
            if (nameLanguage === 'ar') return item.type === 'ar' || item.type === 'hybrid';
            if (nameLanguage === 'en') return item.type === 'en' || item.type === 'hybrid';
            return true; // 'all'
          });
          const shuffled = [...filteredArr].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, 25);
        };

        // Process only the selected catalogs
        for (const catId of selectedCatalogs) {
          if (dbResult.catalogs[catId]) {
            results[catId] = getRandom25(dbResult.catalogs[catId]);
          }
        }

        setGeneratedCatalogs(results);
        saveResult({
          inputs: { selectedCategory, selectedStyle, selectedCatalogs, nameLanguage },
          result: results
        });
      } else {
        const errorResult = { raw: lang === 'en' ? 'Could not find brand names for this selection.' : 'لم يتم العثور على أسماء مقترحة لهذا التخصص.' };
        setGeneratedCatalogs(errorResult);
        saveResult({
          inputs: { selectedCategory, selectedStyle, selectedCatalogs, nameLanguage },
          result: errorResult
        });
      }
    } catch (error) {
      console.error(error);
      if (error?.message === 'OUT_OF_CREDITS' || error?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const renderNameCard = (item, colorClass) => {
    // Determine language badge
    let typeLabel = '';
    let badgeColor = '';
    if (item.type === 'en') { typeLabel = 'English'; badgeColor = '#3B82F6'; }
    else if (item.type === 'ar') { typeLabel = lang === 'en' ? 'Arabic' : 'عربي'; badgeColor = '#10B981'; }
    else { typeLabel = 'Hybrid'; badgeColor = '#8B5CF6'; }

    return (
      <div 
        key={item.name} 
        className="td-result-card"
        style={{ borderLeftColor: lang === 'en' ? badgeColor : 'transparent', borderRightColor: lang === 'ar' ? badgeColor : 'transparent', background: 'rgba(13, 18, 32, 0.8)' }}
        onClick={() => handleNameChange(item.name)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h5 style={{ fontSize: '18px', fontWeight: 900, color: '#f0f4fc', margin: 0 }}>{item.name}</h5>
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', color: badgeColor, border: `1px solid ${badgeColor}50`, backgroundColor: `${badgeColor}10` }}>
            {typeLabel}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#8B96A8', margin: 0, lineHeight: 1.6 }}>"{lang === 'en' ? item.meaning_en : item.meaning_ar}"</p>
      </div>
    );
  };

  // === BLOCKING SKELETON: render nothing until Firestore read is complete ===
  if (isLoadingCache) {
    return (
      <ToolDashboardLayout
        id="brand-naming"
        title={lang === 'en' ? 'Brand Naming' : 'تسمية العلامة التجارية (Brand Naming)'}
        subtitle={lang === 'en' ? 'Loading saved workspace...' : 'جاري تحميل مساحة العمل...'}
        stepNumber={stepNumber}
        accentColor="#8B5CF6"
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ height: "400px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", animation: "pulse 1.5s infinite" }}></div>
        </div>
      </ToolDashboardLayout>
    );
  }

  return (
    <ToolDashboardLayout
      id="brand-naming"
      title={lang === 'en' ? 'Brand Naming Catalogs' : 'كتالوجات أسماء البراندات'}
      subtitle={lang === 'en' ? 'Explore a massive database of over 1000 premium brand names tailored exactly to your specific niche.' : 'تصفح قاعدة بيانات عملاقة تحتوي على آلاف الأسماء التجارية الفخمة والمصممة خصيصاً لمجالك الدقيق.'}
      stepNumber={stepNumber}
      accentColor="#EC4899"
      timeEstimate="10 - 20"
    >

      {/* ═══════════════ FEATURED CATEGORIES ═══════════════ */}
      <div className="td-featured-grid grid-3">
        {BRAND_CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`td-featured-card ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
            style={{ '--td-accent': '#EC4899' }}
          >
            <div className="td-featured-icon">{cat.icon}</div>
            <div className="td-featured-title">{lang === 'en' ? cat.label_en : cat.label_ar}</div>
            <div className="td-featured-sub">{lang === 'en' ? cat.sub_en : cat.sub_ar}</div>
          </div>
        ))}
      </div>

      <div className="td-grid cols-2" style={{ marginBottom: '36px', alignItems: 'start' }}>
        
        {/* ═══════════════ SUB-STYLES (Niches) ═══════════════ */}
        <div>
          <div className="td-section-title">
            <div className="td-section-bar" style={{ background: '#EC4899' }} />
            {lang === 'en' ? 'Select Domain Detail:' : 'اختر المجال (بالتفصيل):'}
          </div>
          <div className="grid-2" style={{ gap: '12px' }}>
            {currentStyles.length > 0 ? currentStyles.map(s => (
              <div
                key={s.id}
                className={`td-card ${selectedStyle === s.id ? 'active' : ''}`}
                onClick={() => setSelectedStyle(s.id)}
                style={{ '--td-accent': '#EC4899', padding: '16px' }}
              >
                <div className="td-card-icon" style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                <div className="td-card-label" style={{ fontSize: '13px' }}>{lang === 'en' ? s.label_en : s.label_ar}</div>
              </div>
            )) : (
              <div style={{ color: '#8B96A8', fontSize: '14px', gridColumn: 'span 2', textAlign: 'center', padding: '20px' }}>
                {lang === 'en' ? 'Loading niches from database...' : 'جاري تحميل النيشات من قاعدة البيانات...'}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════ CATALOGS SELECTION ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(236, 72, 153, 0.2)', background: 'rgba(236, 72, 153, 0.05)' }}>
          <div className="td-section-title" style={{ marginBottom: '16px' }}>
            <div className="td-section-bar" style={{ background: '#EC4899' }} />
            {lang === 'en' ? 'Select Target Catalogs:' : 'حدد كتالوجات الأسماء المناسبة:'}
          </div>
          <p style={{ fontSize: '12px', color: '#8B96A8', marginBottom: '20px', lineHeight: 1.6 }}>
            {lang === 'en' 
              ? 'Select one or more catalogs. We will generate 25 premium names from each selected catalog.' 
              : 'يمكنك اختيار كتالوج أو أكثر. سيتم استخراج 25 اسم احترافي عشوائياً من كل كتالوج تحدده.'}
          </p>

          {/* Language Selection */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f0f4fc', marginBottom: '8px' }}>
              {lang === 'en' ? 'Brand Name Language:' : 'لغة اسم البراند:'}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'all', label_en: 'Mixed (All)', label_ar: 'مختلط (الكل)' },
                { id: 'ar', label_en: 'Arabic', label_ar: 'عربي فقط' },
                { id: 'en', label_en: 'English', label_ar: 'إنجليزي فقط' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setNameLanguage(opt.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: nameLanguage === opt.id ? '#EC4899' : 'rgba(0,0,0,0.3)',
                    color: nameLanguage === opt.id ? '#fff' : '#8B96A8',
                    border: `1px solid ${nameLanguage === opt.id ? '#EC4899' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {lang === 'en' ? opt.label_en : opt.label_ar}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {currentCatalogs.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCatalog(cat.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  background: selectedCatalogs.includes(cat.id) ? '#EC4899' : 'rgba(0,0,0,0.4)',
                  color: selectedCatalogs.includes(cat.id) ? '#fff' : '#8B96A8',
                  border: `1px solid ${selectedCatalogs.includes(cat.id) ? '#EC4899' : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ 
                  width: '16px', height: '16px', borderRadius: '4px', border: '2px solid rgba(255,255,255,0.5)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selectedCatalogs.includes(cat.id) ? '#fff' : 'transparent'
                }}>
                  {selectedCatalogs.includes(cat.id) && <span style={{ color: '#EC4899', fontSize: '12px' }}>✔</span>}
                </div>
                {lang === 'en' ? cat.label_en : cat.label_ar}
              </button>
            ))}
            {currentCatalogs.length === 0 && (
              <span style={{ color: '#8B96A8', fontSize: '13px' }}>{lang === 'en' ? 'Select a domain to see catalogs.' : 'حدد مجالاً لعرض الكتالوجات.'}</span>
            )}
          </div>

          <button
            onClick={generateBrandNames}
            disabled={isGenerating || selectedCatalogs.length === 0}
            className="td-btn-primary"
            style={{ 
              background: isGenerating || selectedCatalogs.length === 0 ? 'rgba(236, 72, 153, 0.2)' : '#EC4899',
              color: isGenerating || selectedCatalogs.length === 0 ? '#8B96A8' : '#fff',
              marginTop: 'auto'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" />
                {lang === 'en' ? 'Extracting from Database...' : 'جاري استخراج الأسماء...'}
              </span>
            ) : (
              <span>📚 {lang === 'en' ? 'Open Selected Catalogs' : 'فتح الكتالوجات المحددة'}</span>
            )}
          </button>
        </div>
      </div>

      {/* ═══════════════ GENERATED RESULTS ═══════════════ */}
      {generatedCatalogs && !generatedCatalogs.raw && Object.keys(generatedCatalogs).map(catId => {
        const catDef = currentCatalogs.find(c => c.id === catId);
        const catName = catDef ? (lang === 'en' ? catDef.label_en : catDef.label_ar) : catId;
        const names = generatedCatalogs[catId];
        
        if (!names || names.length === 0) return null;

        return (
          <div key={catId} style={{ marginBottom: '36px' }}>
            <div className="td-results-section" style={{ background: 'transparent', padding: 0 }}>
              <div className="td-results-label" style={{ color: '#EC4899', fontSize: '18px', marginBottom: '20px' }}>
                <span className="td-results-line" style={{ background: '#EC4899', height: '100%', width: '4px' }} />
                📦 {lang === 'en' ? 'Catalog:' : 'كتالوج:'} {catName} <span style={{ fontSize: '12px', opacity: 0.6, marginLeft: '8px' }}>({names.length} names)</span>
              </div>
              
              <div className="td-grid grid-3" style={{ marginBottom: 0 }}>
                {names.map(item => renderNameCard(item, '#EC4899'))}
              </div>
            </div>
          </div>
        );
      })}

      {generatedCatalogs?.raw && (
        <div className="td-raw-output">
          {generatedCatalogs.raw}
        </div>
      )}

      {/* ═══════════════ FINAL NAME INPUT ═══════════════ */}
      <div style={{ marginBottom: '36px', marginTop: '40px' }}>
        <div className="td-section-title" style={{ color: '#EC4899' }}>
          <div className="td-section-bar" style={{ background: '#EC4899' }} />
          {lang === 'en' ? 'Confirm Brand Name' : 'تأكيد اسم البراند النهائي'}
        </div>
        <div className="td-info-panel bn-final-container">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👑</div>
          <div style={{ width: '100%', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#8B96A8', marginBottom: '12px', textAlign: 'center' }}>
              {lang === 'en' ? 'Selected Name (Click on any card to fill, or type manually)' : 'الاسم المختار (اضغط على أي كارت ليتم اختياره أو اكتبه يدوياً)'}
            </label>
            <input 
              type="text" 
              className="td-input" 
              value={state.brandName || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={lang === 'en' ? 'e.g., NovaTrend' : 'مثال: رونق'}
              style={{ fontSize: '24px', fontWeight: '900', color: '#EC4899', textAlign: 'center', height: '70px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.05)', border: '2px solid rgba(236, 72, 153, 0.2)' }}
            />
          </div>
          <button 
            onClick={() => dispatch({ type: 'COMPLETE_STEP', payload: 'brand-naming' })}
            disabled={!state.brandName}
            className="td-btn-primary"
            style={{ 
              background: state?.completedSteps?.includes('brand-naming') ? '#10B981' : (state.brandName ? '#EC4899' : 'rgba(236,72,153,0.3)'), 
              width: '100%', 
              height: '56px',
              fontSize: '16px',
              fontWeight: '900'
            }}
          >
            {state?.completedSteps?.includes('brand-naming') 
              ? (lang === 'en' ? 'Confirmed ✅' : 'تم التأكيد ✅')
              : (lang === 'en' ? 'Confirm Choice' : 'اعتماد الاسم')}
          </button>
        </div>
      </div>

    </ToolDashboardLayout>
  );
}

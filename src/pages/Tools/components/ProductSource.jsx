import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../../context/AppContext';
import { getProductIdeasStructure, getProductIdeasV2 } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function ProductSource({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  const [structure, setStructure] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedEffort, setSelectedEffort] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getProductIdeasStructure();
      if (data) {
        setStructure(data);
        if (data.productTypes?.length) setSelectedType(data.productTypes[0].id);
        if (data.niches?.length) setSelectedNiche(data.niches[0].id);
        if (data.effortLevels?.length) setSelectedEffort(data.effortLevels[0].id);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIdeas(null);
    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'product-source',
          inputs: { selectedType, selectedNiche, selectedEffort },
          context: { niche: state.niche, user: state.user },
          lang
        });

        const rawList = (typeof liveResult === 'object' && Array.isArray(liveResult.ideas)) 
          ? liveResult.ideas 
          : [liveResult];

        const formattedIdeas = rawList.map((item, idx) => {
          const title = typeof item === 'string' ? item : (item.name || item.name_en || item.name_ar || item.title || `Live AI Product Idea ${idx + 1}`);
          const description = typeof item === 'string' ? item : (item.desc || item.desc_en || item.desc_ar || item.fullDescription || item.description || title);
          const cost = typeof item === 'string' ? '$49 - $149' : (item.price || item.price_en || item.price_ar || item.pricing || '$49 - $149');

          return {
            id: item.id || `live_${idx + 1}`,
            name_ar: item.name_ar || item.name || title,
            name_en: item.name_en || item.name || title,
            name: title,
            desc_ar: item.desc_ar || item.desc || description,
            desc_en: item.desc_en || item.desc || description,
            desc: description,
            price_ar: item.price_ar || item.price || cost,
            price_en: item.price_en || item.price || cost,
            price: cost,
            effort: item.effort || selectedEffort || 'medium'
          };
        });

        setIdeas(formattedIdeas);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'product-source',
          data: { selectedType, selectedNiche, selectedEffort, result: formattedIdeas, mode: 'live' }
        });
      } else {
        await new Promise(r => setTimeout(r, 500));
        const dbResult = await getProductIdeasV2(selectedType, selectedNiche, selectedEffort);
        if (dbResult && dbResult.ideas && dbResult.ideas.length > 0) {
          setIdeas(dbResult.ideas);
        } else {
          setIdeas([]);
        }
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error generating product ideas.' : 'حدث خطأ أثناء التوليد.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'en' ? 'Copied!' : 'تم النسخ!');
  };

  const renderSelector = (title, items, selectedId, setId) => {
    if (!items) return null;
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#F43F5E', marginBottom: '12px' }}>{title}</label>
        <div style={{ display: 'grid', gridTemplateColumns: items.length <= 3 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '8px' }}>
          {items.map(item => (
            <button key={item.id} onClick={() => setId(item.id)} style={{
              background: selectedId === item.id ? 'rgba(244,63,94,0.15)' : 'rgba(13,18,32,0.6)',
              border: `1px solid ${selectedId === item.id ? '#F43F5E' : 'rgba(255,255,255,0.05)'}`,
              color: selectedId === item.id ? '#F0F4FC' : '#8B96A8',
              padding: '12px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              boxShadow: selectedId === item.id ? '0 4px 12px rgba(244,63,94,0.1)' : 'none',
            }}>
              {lang === 'en' ? item.name_en : item.name_ar}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const cardColors = ['#F43F5E', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#EF4444', '#22C55E', '#A855F7', '#F97316', '#06B6D4', '#D946EF', '#84CC16'];
  const cardIcons = ['📦', '🎯', '💡', '🚀', '⭐', '💎', '🔥', '🏆', '✨', '🎁', '💰', '📊', '🛒', '🧩', '🌟'];

  const bottomSections = [
    {
      icon: '💡',
      title: lang === 'en' ? 'Where to find PLR products?' : 'أين تجد المنتجات (PLR)؟',
      items: [
        lang === 'en' ? 'Etsy: Search for (PLR eBook) or (PLR Planner).' : 'Etsy: ابحث عن (PLR eBook) أو (PLR Planner) وتأكد من حقوق إعادة البيع.',
        lang === 'en' ? 'Gumroad: Some creators sell with Master Resell Rights.' : 'Gumroad: بعض المبدعين يبيعون مع حقوق إعادة البيع (MRR).',
        lang === 'en' ? 'PLR.me for ready articles and books.' : 'PLR.me للحصول على مقالات وكتب جاهزة.',
      ]
    },
  ];

  return (
    <>
      <ToolDashboardLayout
        id="product-source"
        title={lang === 'en' ? 'Product Ideas Matrix' : 'مصفوفة أفكار المنتجات'}
        subtitle={lang === 'en' ? 'Discover profitable digital products tailored to your niche, type, and effort level.' : 'اكتشف منتجات رقمية مربحة مصممة حسب مجالك، نوع المنتج، ومستوى المجهود المتاح.'}
        stepNumber={stepNumber}
        accentColor="#F43F5E"
        timeEstimate="30 - 60"
        bottomSections={bottomSections}
      >

        <div className="td-grid cols-2" style={{ marginBottom: '36px', alignItems: 'start' }}>

          {/* INPUTS */}
          <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(244,63,94,0.2)', background: 'rgba(244,63,94,0.05)' }}>
            {structure ? (
              <>
                {renderSelector(lang === 'en' ? '1. Product Type' : '1. نوع المنتج', structure.productTypes, selectedType, setSelectedType)}
                {renderSelector(lang === 'en' ? '2. Your Niche' : '2. مجالك', structure.niches, selectedNiche, setSelectedNiche)}
                {renderSelector(lang === 'en' ? '3. Effort Level' : '3. مستوى المجهود', structure.effortLevels, selectedEffort, setSelectedEffort)}
              </>
            ) : (
              <div style={{ color: '#8B96A8', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                {lang === 'en' ? 'Loading...' : 'جاري تحميل الهيكل...'}
              </div>
            )}
            {/* Dual Mode Selector */}
            <AnalysisModeSelector 
              mode={analysisMode} 
              onChange={setAnalysisMode} 
              lang={lang} 
              accentColor="#F43F5E" 
            />

            <button onClick={handleGenerate} disabled={isGenerating || !structure} className="td-btn-primary"
              style={{ background: isGenerating ? 'rgba(244,63,94,0.2)' : '#F43F5E', color: isGenerating ? '#8B96A8' : '#fff', marginTop: '16px', width: '100%' }}>
              {isGenerating
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><span className="td-spinner" /> {lang === 'en' ? 'Searching...' : 'جاري البحث عن أفكار...'}</span>
                : <span>✨ {lang === 'en' ? 'Find Product Ideas' : 'ابحث عن أفكار منتجات'}</span>}
            </button>

            {/* Quick Links */}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: '#8B96A8', fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>
                {lang === 'en' ? 'Quick Links:' : 'روابط سريعة:'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[{ name: 'Etsy', url: 'https://etsy.com', c: '#F97316' }, { name: 'Gumroad', url: 'https://gumroad.com', c: '#EC4899' }, { name: 'PLR.me', url: 'https://plr.me', c: '#10B981' }].map(link => (
                  <a key={link.name} href={link.url} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', textAlign: 'center', color: '#E8EDF5', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none' }}>
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* OUTPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!ideas && !isGenerating && (
              <div className="td-info-panel" style={{ margin: 0, background: 'rgba(13,18,32,0.6)', borderStyle: 'dashed', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>📦</div>
                <p style={{ color: '#8B96A8', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                  {lang === 'en' ? 'Select your parameters to discover profitable product ideas.' : 'حدد المعطيات لاكتشاف أفكار منتجات مربحة مناسبة لمجالك.'}
                </p>
              </div>
            )}

            {ideas && ideas.length === 0 && (
              <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(239,68,68,0.2)' }}>
                <p style={{ color: '#EF4444', fontSize: '14px', margin: 0 }}>
                  {lang === 'en' ? 'No ideas found for this combination yet.' : 'لا توجد أفكار لهذا التكوين بعد. جرب تكويناً آخر.'}
                </p>
              </div>
            )}

            {ideas && ideas.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ color: '#F43F5E', fontSize: '16px', fontWeight: '900', margin: 0 }}>
                    {lang === 'en' ? `${ideas.length} Product Ideas Found` : `تم العثور على ${ideas.length} فكرة منتج`}
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {ideas.map((idea, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedIdea(idea)}
                      style={{
                        background: 'rgba(13,18,32,0.8)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '14px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        borderTop: `3px solid ${cardColors[i % cardColors.length]}`,
                        position: 'relative',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${cardColors[i % cardColors.length]}22`; e.currentTarget.style.borderColor = cardColors[i % cardColors.length] + '44'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    >
                      <div style={{ fontSize: '22px', marginBottom: '10px' }}>{cardIcons[i % cardIcons.length]}</div>
                      <h4 style={{ color: '#F0F4FC', fontSize: '12px', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.5 }}>
                        {lang === 'en' && idea.name_en ? idea.name_en : (idea.name_ar || idea.name)}
                      </h4>
                      <span style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, color: '#10B981' }}>
                        💰 {lang === 'en' && idea.price_en ? idea.price_en : (idea.price_ar || idea.price)}
                      </span>
                      <div style={{ position: 'absolute', top: '12px', left: '12px', width: '6px', height: '6px', borderRadius: '50%', background: cardColors[i % cardColors.length], boxShadow: `0 0 8px ${cardColors[i % cardColors.length]}` }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>

      </ToolDashboardLayout>

      {/* POPUP MODAL - RENDERED VIA PORTAL TO BODY ROOT */}
      {selectedIdea && createPortal(
        <div
          onClick={() => setSelectedIdea(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
            margin: 0,
            direction: lang === 'en' ? 'ltr' : 'rtl'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(20,25,45,1) 0%, rgba(13,18,32,1) 100%)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '36px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              animation: 'modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              fontFamily: 'Cairo, sans-serif'
            }}
          >
            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                <div>
                  <h2 style={{ color: '#F0F4FC', fontSize: '18px', fontWeight: 900, margin: 0, lineHeight: 1.4 }}>
                    {lang === 'en' && selectedIdea.name_en ? selectedIdea.name_en : (selectedIdea.name_ar || selectedIdea.name)}
                  </h2>
                  <span style={{ fontSize: '11px', color: '#8B96A8' }}>{lang === 'en' ? 'Product Details' : 'تفاصيل المنتج'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedIdea(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8B96A8', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            {/* Description */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: '#F43F5E', fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>📝 {lang === 'en' ? 'Description' : 'الوصف'}</h4>
              <p style={{ color: '#C4CAD6', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                {lang === 'en' && selectedIdea.desc_en ? selectedIdea.desc_en : (selectedIdea.desc_ar || selectedIdea.desc)}
              </p>
            </div>

            {/* Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ fontSize: '10px', color: '#8B96A8', fontWeight: 700, marginBottom: '6px' }}>💰 {lang === 'en' ? 'Price Range' : 'متوسط التسعير'}</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981' }}>
                  {lang === 'en' && selectedIdea.price_en ? selectedIdea.price_en : (selectedIdea.price_ar || selectedIdea.price)}
                </div>
              </div>
              <div style={{ background: 'rgba(99,102,241,0.06)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div style={{ fontSize: '10px', color: '#8B96A8', fontWeight: 700, marginBottom: '6px' }}>📍 {lang === 'en' ? 'Source' : 'المصدر'}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#818CF8' }}>
                  {lang === 'en' && selectedIdea.source_en ? selectedIdea.source_en : (selectedIdea.source_ar || selectedIdea.source)}
                </div>
              </div>
            </div>

            {/* Target Audience */}
            {selectedIdea.audience && (
              <div style={{ background: 'rgba(244,63,94,0.04)', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(244,63,94,0.1)' }}>
                <h4 style={{ color: '#F43F5E', fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>🎯 {lang === 'en' ? 'Target Audience' : 'الفئة المستهدفة'}</h4>
                <p style={{ color: '#C4CAD6', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                  {lang === 'en' && selectedIdea.audience_en ? selectedIdea.audience_en : (selectedIdea.audience_ar || selectedIdea.audience)}
                </p>
              </div>
            )}

            {/* Features */}
            {(lang === 'en' && selectedIdea.features_en ? selectedIdea.features_en : (selectedIdea.features_ar || selectedIdea.features))?.length > 0 && (
              <div style={{ background: 'rgba(59,130,246,0.04)', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(59,130,246,0.1)' }}>
                <h4 style={{ color: '#3B82F6', fontSize: '12px', fontWeight: 800, marginBottom: '12px' }}>⭐ {lang === 'en' ? 'Features & Benefits' : 'المميزات والفوائد'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(lang === 'en' && selectedIdea.features_en ? selectedIdea.features_en : (selectedIdea.features_ar || selectedIdea.features)).map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: '#3B82F6', fontSize: '10px', marginTop: '4px' }}>●</span>
                      <span style={{ color: '#C4CAD6', fontSize: '13px', lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {(lang === 'en' && selectedIdea.tips_en ? selectedIdea.tips_en : (selectedIdea.tips_ar || selectedIdea.tips))?.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.04)', borderRadius: '14px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(245,158,11,0.1)' }}>
                <h4 style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 800, marginBottom: '12px' }}>💡 {lang === 'en' ? 'Pro Tips' : 'نصائح احترافية'}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(lang === 'en' && selectedIdea.tips_en ? selectedIdea.tips_en : (selectedIdea.tips_ar || selectedIdea.tips)).map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: '#F59E0B', fontSize: '10px', marginTop: '4px' }}>▸</span>
                      <span style={{ color: '#C4CAD6', fontSize: '13px', lineHeight: 1.6 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={() => {
                const name = lang === 'en' && selectedIdea.name_en ? selectedIdea.name_en : (selectedIdea.name_ar || selectedIdea.name);
                const price = lang === 'en' && selectedIdea.price_en ? selectedIdea.price_en : (selectedIdea.price_ar || selectedIdea.price);
                const source = lang === 'en' && selectedIdea.source_en ? selectedIdea.source_en : (selectedIdea.source_ar || selectedIdea.source);
                const desc = lang === 'en' && selectedIdea.desc_en ? selectedIdea.desc_en : (selectedIdea.desc_ar || selectedIdea.desc);
                const audience = lang === 'en' && selectedIdea.audience_en ? selectedIdea.audience_en : (selectedIdea.audience_ar || selectedIdea.audience);
                copyText(`${name}\n${lang === 'en' ? 'Price' : 'السعر'}: ${price}\n${lang === 'en' ? 'Source' : 'المصدر'}: ${source}\n${desc}${audience ? '\n' + (lang === 'en' ? 'Audience' : 'الفئة') + ': ' + audience : ''}`);
              }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #F43F5E, #E11D48)', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              📋 {lang === 'en' ? 'Copy Product Details' : 'نسخ تفاصيل المنتج'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

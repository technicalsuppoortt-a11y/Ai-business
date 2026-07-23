import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { getProductIdeasStructure, getProductIdeasV2 } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Target,
  Sparkles,
  DollarSign,
  Award,
  Zap,
  TrendingUp,
  Compass,
  Layers,
  Box,
  ExternalLink,
  Copy,
  X,
  Lightbulb,
  CheckCircle2,
  Flame,
  Star,
  Gem,
  Tag,
  Users
} from 'lucide-react';
import './ProductSource.css';

export default function ProductSource({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
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
        toast(lang === 'en' ? 'Live AI Ideas generated! ✨' : 'تم توليد الأفكار بالذكاء الاصطناعي الحي! ✨', 'success');
      } else {
        await new Promise(r => setTimeout(r, 400));
        const dbResult = await getProductIdeasV2(selectedType, selectedNiche, selectedEffort);
        if (dbResult && dbResult.ideas && dbResult.ideas.length > 0) {
          setIdeas(dbResult.ideas);
          toast(lang === 'en' ? 'Product ideas found! 🚀' : 'تم العثور على أفكار المنتجات! 🚀', 'success');
        } else {
          setIdeas([]);
          toast(lang === 'en' ? 'No pre-set ideas found. Try Live AI mode!' : 'لم نجد أفكاراً بالمعطيات المحددة. جرب الوضع الحي!', 'warning');
        }
      }
    } catch (error) {
      console.error(error);
      toast(lang === 'en' ? 'Error generating product ideas.' : 'حدث خطأ أثناء التوليد.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast(lang === 'en' ? 'Product details copied! ✅' : 'تم نسخ تفاصيل المنتج إلى الحافظة! ✅', 'success');
  };

  const renderSelector = (title, items, selectedId, setId, IconComp) => {
    if (!items) return null;
    return (
      <div className="ps-selector-group">
        <label className="ps-selector-label">
          {IconComp && <IconComp size={15} color="#F43F5E" />}
          <span>{title}</span>
        </label>
        <div 
          className="ps-selector-grid" 
          style={{ gridTemplateColumns: items.length <= 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)' }}
        >
          {items.map(item => {
            const isSelected = selectedId === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setId(item.id)} 
                className={`ps-option-btn ${isSelected ? 'active' : ''}`}
              >
                <span>{lang === 'en' ? item.name_en : item.name_ar}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const cardColors = ['#F43F5E', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#EF4444', '#22C55E', '#A855F7', '#F97316', '#06B6D4', '#D946EF', '#84CC16'];
  const cardLucideIcons = [Package, Target, Sparkles, DollarSign, Award, Zap, TrendingUp, Compass, Layers, Box, Flame, Star, Gem, Tag, Users];

  const bottomSections = [
    {
      icon: <Lightbulb size={18} color="#F59E0B" />,
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
        <div className="ps-container" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="ps-main-grid">

            {/* ═══════════════ PARAMETERS INPUT PANEL ═══════════════ */}
            <div className="ps-panel">
              <div className="ps-panel-header">
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.12)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="ps-panel-title">
                    <span>{lang === 'en' ? 'Product Target Criteria' : 'معايير واستهداف المنتج'}</span>
                  </h3>
                  <p className="ps-panel-subtitle">
                    {lang === 'en' ? 'Select product parameters to discover relevant product ideas.' : 'حدد نوع المنتج ومجالك ومستوى التفرغ لتوليد الأفكار المناسبة.'}
                  </p>
                </div>
              </div>

              {structure ? (
                <>
                  {renderSelector(lang === 'en' ? '1. Product Type' : '1. نوع المنتج', structure.productTypes, selectedType, setSelectedType, Layers)}
                  {renderSelector(lang === 'en' ? '2. Your Niche' : '2. مجالك المستهدف', structure.niches, selectedNiche, setSelectedNiche, Target)}
                  {renderSelector(lang === 'en' ? '3. Effort Level' : '3. مستوى المجهود والتفرغ', structure.effortLevels, selectedEffort, setSelectedEffort, Zap)}
                </>
              ) : (
                <div style={{ color: 'var(--text2, #8B96A8)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                  {lang === 'en' ? 'Loading structure parameters...' : 'جاري تحميل المعايير...'}
                </div>
              )}

              {/* Dual Mode Selector */}
              <div style={{ marginTop: '16px' }}>
                <AnalysisModeSelector 
                  mode={analysisMode} 
                  onChange={setAnalysisMode} 
                  lang={lang} 
                  accentColor="#F43F5E" 
                />
              </div>

              <button 
                onClick={handleGenerate} 
                disabled={isGenerating || !structure} 
                className="ps-generate-btn"
              >
                {isGenerating ? (
                  <>
                    <span className="td-spinner" /> 
                    <span>{lang === 'en' ? 'Searching Ideas...' : 'جاري البحث عن أفكار...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> 
                    <span>{lang === 'en' ? 'Find Product Ideas' : 'ابحث عن أفكار منتجات'}</span>
                  </>
                )}
              </button>

              {/* Quick External Links */}
              <div className="ps-quick-links">
                <h4 style={{ color: 'var(--text2, #8B96A8)', fontSize: '12px', fontWeight: '800', margin: '0 0 12px 0' }}>
                  {lang === 'en' ? 'Quick Marketplaces & Sources:' : 'روابط سريعة لأشهر الأسواق والمنصات:'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { name: 'Etsy', url: 'https://etsy.com' }, 
                    { name: 'Gumroad', url: 'https://gumroad.com' }, 
                    { name: 'PLR.me', url: 'https://plr.me' }
                  ].map(link => (
                    <a 
                      key={link.name} 
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="ps-quick-link-item"
                    >
                      <span>{link.name}</span>
                      <ExternalLink size={11} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══════════════ PRODUCT IDEAS DISPLAY ═══════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!ideas && !isGenerating && (
                <div className="ps-panel" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Box size={28} />
                  </div>
                  <p style={{ color: 'var(--text2, #94A3B8)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    {lang === 'en' ? 'Select your parameters on the left to discover profitable digital product ideas.' : 'حدد المعطيات والمعايير على اليسار لاكتشاف أفكار منتجات مربحة مناسبة لمجالك.'}
                  </p>
                </div>
              )}

              {ideas && ideas.length === 0 && (
                <div className="ps-panel" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                  <p style={{ color: '#EF4444', fontSize: '13.5px', margin: 0, fontWeight: 700 }}>
                    {lang === 'en' ? 'No pre-set ideas found for this exact combination. Try switching to Live AI Mode!' : 'لا توجد أفكار مسجلة لهذا التكوين. جرب التبديل للوضع الحي الذكي!'}
                  </p>
                </div>
              )}

              {ideas && ideas.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ color: 'var(--text, #F8FAFC)', fontSize: '16px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#F43F5E" />
                      <span>{lang === 'en' ? `${ideas.length} Product Ideas Found` : `تم العثور على ${ideas.length} فكرة منتج`}</span>
                    </h3>
                  </div>

                  <div className="ps-cards-grid">
                    <AnimatePresence>
                      {ideas.map((idea, i) => {
                        const ItemIcon = cardLucideIcons[i % cardLucideIcons.length];
                        const currentColor = cardColors[i % cardColors.length];
                        return (
                          <motion.div
                            key={idea.id || i}
                            onClick={() => setSelectedIdea(idea)}
                            className="ps-product-card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ y: -4 }}
                            style={{
                              borderTop: `3px solid ${currentColor}`,
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${currentColor}15`, color: currentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <ItemIcon size={20} />
                                </div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentColor, boxShadow: `0 0 8px ${currentColor}` }} />
                              </div>

                              <h4 className="ps-card-title">
                                {lang === 'en' && idea.name_en ? idea.name_en : (idea.name_ar || idea.name)}
                              </h4>
                            </div>

                            <div>
                              <span className="ps-price-badge">
                                <DollarSign size={12} />
                                <span>{lang === 'en' && idea.price_en ? idea.price_en : (idea.price_ar || idea.price)}</span>
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </ToolDashboardLayout>

      {/* ═══════════════ DETAILED POPUP MODAL VIA PORTAL ═══════════════ */}
      {selectedIdea && createPortal(
        <AnimatePresence>
          <div
            className="ps-modal-overlay"
            onClick={() => setSelectedIdea(null)}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <motion.div
              className="ps-modal-card"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 style={{ color: 'var(--text, #F8FAFC)', fontSize: '18px', fontWeight: 900, margin: 0, lineHeight: 1.4 }}>
                      {lang === 'en' && selectedIdea.name_en ? selectedIdea.name_en : (selectedIdea.name_ar || selectedIdea.name)}
                    </h2>
                    <span style={{ fontSize: '12px', color: 'var(--text2, #94A3B8)' }}>
                      {lang === 'en' ? 'Product Specifications & Sourcing Guide' : 'تفاصيل ودليل توريد المنتج'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedIdea(null)} 
                  className="ps-modal-close-btn"
                  title={lang === 'en' ? 'Close' : 'إغلاق'}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Description */}
              <div className="ps-modal-desc-box">
                <h4 style={{ color: '#F43F5E', fontSize: '12.5px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} />
                  <span>{lang === 'en' ? 'Description & Concept' : 'الوصف والأنسب للبيع'}</span>
                </h4>
                <p style={{ color: 'var(--text, #F8FAFC)', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                  {lang === 'en' && selectedIdea.desc_en ? selectedIdea.desc_en : (selectedIdea.desc_ar || selectedIdea.desc)}
                </p>
              </div>

              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <DollarSign size={14} />
                    <span>{lang === 'en' ? 'Target Price Range' : 'متوسط التسعير المقترح'}</span>
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#10B981' }}>
                    {lang === 'en' && selectedIdea.price_en ? selectedIdea.price_en : (selectedIdea.price_ar || selectedIdea.price)}
                  </div>
                </div>

                <div style={{ background: 'rgba(99, 102, 241, 0.08)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: '#6366F1', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Compass size={14} />
                    <span>{lang === 'en' ? 'Recommended Source' : 'أفضل مصدر للتوريد'}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text, #F8FAFC)' }}>
                    {lang === 'en' && selectedIdea.source_en ? selectedIdea.source_en : (selectedIdea.source_ar || selectedIdea.source || 'Etsy PLR / Gumroad')}
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              {selectedIdea.audience && (
                <div style={{ background: 'rgba(244, 63, 94, 0.06)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <h4 style={{ color: '#F43F5E', fontSize: '12.5px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Target size={14} />
                    <span>{lang === 'en' ? 'Target Audience' : 'الفئة المستهدفة الشغوفة'}</span>
                  </h4>
                  <p style={{ color: 'var(--text, #F8FAFC)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                    {lang === 'en' && selectedIdea.audience_en ? selectedIdea.audience_en : (selectedIdea.audience_ar || selectedIdea.audience)}
                  </p>
                </div>
              )}

              {/* Features List */}
              {(lang === 'en' && selectedIdea.features_en ? selectedIdea.features_en : (selectedIdea.features_ar || selectedIdea.features))?.length > 0 && (
                <div style={{ background: 'rgba(59, 130, 246, 0.06)', borderRadius: '14px', padding: '18px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <h4 style={{ color: '#3B82F6', fontSize: '12.5px', fontWeight: 800, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} />
                    <span>{lang === 'en' ? 'Features & Benefits' : 'المميزات والفوائد الأساسية'}</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(lang === 'en' && selectedIdea.features_en ? selectedIdea.features_en : (selectedIdea.features_ar || selectedIdea.features)).map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <CheckCircle2 size={14} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: 'var(--text, #F8FAFC)', fontSize: '13px', lineHeight: 1.6 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy Action Button */}
              <button
                onClick={() => {
                  const name = lang === 'en' && selectedIdea.name_en ? selectedIdea.name_en : (selectedIdea.name_ar || selectedIdea.name);
                  const price = lang === 'en' && selectedIdea.price_en ? selectedIdea.price_en : (selectedIdea.price_ar || selectedIdea.price);
                  const source = lang === 'en' && selectedIdea.source_en ? selectedIdea.source_en : (selectedIdea.source_ar || selectedIdea.source);
                  const desc = lang === 'en' && selectedIdea.desc_en ? selectedIdea.desc_en : (selectedIdea.desc_ar || selectedIdea.desc);
                  const audience = lang === 'en' && selectedIdea.audience_en ? selectedIdea.audience_en : (selectedIdea.audience_ar || selectedIdea.audience);
                  
                  copyText(`${name}\n${lang === 'en' ? 'Price' : 'السعر'}: ${price}\n${lang === 'en' ? 'Source' : 'المصدر'}: ${source}\n${desc}${audience ? '\n' + (lang === 'en' ? 'Audience' : 'الفئة') + ': ' + audience : ''}`);
                }}
                className="ps-generate-btn"
                style={{ marginTop: 0 }}
              >
                <Copy size={16} />
                <span>{lang === 'en' ? 'Copy Product Details' : 'نسخ تفاصيل المنتج'}</span>
              </button>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

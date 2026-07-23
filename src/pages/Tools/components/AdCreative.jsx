import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { getAdLabStructure, getAdLabTemplate } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  AlertCircle,
  Share2,
  Languages,
  Sparkles,
  Copy,
  Clapperboard,
  Film,
  FileText,
  Flame,
  Target,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  Video,
  Zap,
  Brain,
  Lightbulb,
  PlaySquare,
  Camera,
  Globe
} from 'lucide-react';
import './AdCreative.css';

export default function AdCreative({ stepNumber }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const savedState = state.toolResults['ad-creative'] || {};

  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  const [structure, setStructure] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(savedState.selectedProduct || '');
  const [selectedPain, setSelectedPain] = useState(savedState.selectedPain || '');
  const [selectedPlatform, setSelectedPlatform] = useState(savedState.selectedPlatform || '');
  const [selectedDialect, setSelectedDialect] = useState(savedState.selectedDialect || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(savedState.result || null);

  const platformColors = { 
    tiktok: '#25F4EE', 
    facebook: '#1877F2', 
    youtube: '#FF0000',
    instagram: '#E1306C',
    linkedin: '#0A66C2'
  };

  const platformIconsMap = {
    tiktok: Video,
    facebook: Globe,
    youtube: PlaySquare,
    instagram: Camera,
    linkedin: Share2
  };

  useEffect(() => {
    const load = async () => {
      const data = await getAdLabStructure();
      if (data) {
        setStructure(data);
        if (data.products?.length && !savedState.selectedProduct) setSelectedProduct(data.products[0].id);
        if (data.painPoints?.length && !savedState.selectedPain) setSelectedPain(data.painPoints[0].id);
        if (data.platforms?.length && !savedState.selectedPlatform) setSelectedPlatform(data.platforms[0].id);
        if (data.dialects?.length && !savedState.selectedDialect) setSelectedDialect(data.dialects[0].id);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'ad-creative',
          inputs: { selectedProduct, selectedPain, selectedPlatform, selectedDialect },
          context: { niche: state.niche },
          lang
        });

        const formattedResult = (typeof liveResult === 'object' && liveResult !== null) ? {
          hook_ar: liveResult.hook_ar || liveResult.hook || '',
          hook_en: liveResult.hook_en || liveResult.hook || '',
          visual_ar: liveResult.visual_ar || liveResult.visualNotes || liveResult.visual || '',
          visual_en: liveResult.visual_en || liveResult.visualNotes || liveResult.visual || '',
          script_ar: liveResult.script_ar || liveResult.body || liveResult.script || '',
          script_en: liveResult.script_en || liveResult.body || liveResult.script || '',
          cta_ar: liveResult.cta_ar || liveResult.cta || '',
          cta_en: liveResult.cta_en || liveResult.cta || '',
          ad_angles: liveResult.ad_angles || [],
          tip_ar: liveResult.tip_ar || liveResult.pro_tip_ar || '',
          tip_en: liveResult.tip_en || liveResult.pro_tip_en || ''
        } : {
          hook_ar: String(liveResult),
          hook_en: String(liveResult),
          visual_ar: 'Live AI visual direction',
          visual_en: 'Live AI visual direction',
          script_ar: String(liveResult),
          script_en: String(liveResult),
          cta_ar: 'اشترِ الآن واستفد من العرض',
          cta_en: 'Shop Now & Claim Offer'
        };

        setResult(formattedResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'ad-creative',
          data: {
            selectedProduct,
            selectedPain,
            selectedPlatform,
            selectedDialect,
            result: formattedResult,
            mode: 'live'
          }
        });
        toast(lang === 'en' ? 'Live AI Ad Script generated! ✨' : 'تم توليد السكربت الإعلاني بالذكاء الاصطناعي الحي! ✨', 'success');
      } else {
        await new Promise(r => setTimeout(r, 500));
        const dbResult = await getAdLabTemplate(selectedProduct, selectedPain, selectedPlatform, selectedDialect);
        if (dbResult && dbResult.content) {
          setResult(dbResult.content);
          dispatch({
            type: 'SAVE_TOOL_RESULT',
            toolId: 'ad-creative',
            data: {
              selectedProduct,
              selectedPain,
              selectedPlatform,
              selectedDialect,
              result: dbResult.content,
              mode: 'fast'
            }
          });
          toast(lang === 'en' ? 'Ad script ready! 🚀' : 'السكربت الإعلاني جاهز للإنتاج! 🚀', 'success');
        } else {
          setResult({ error: lang === 'en' ? 'Template not found for this configuration.' : 'لم يتم العثور على قالب لهذا التكوين.' });
          toast(lang === 'en' ? 'Try switching to Live AI mode for custom script!' : 'جرب التبديل للوضع الحي للحصول على نتائج مخصصة!', 'warning');
        }
      }
    } catch (error) {
      console.error(error);
      toast(lang === 'en' ? 'Error generating ad. Try again.' : 'حدث خطأ أثناء التوليد. حاول مرة أخرى.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast(lang === 'en' ? `${label} copied to clipboard! ✅` : `تم نسخ ${label} إلى الحافظة! ✅`, 'success');
  };

  const renderSelector = (title, icon, items, selectedId, setId, getLabel) => {
    if (!items) return null;
    const IconComponent = icon;

    return (
      <div className="ac-form-group">
        <label className="ac-label">
          <IconComponent size={14} color="#EC4899" />
          <span>{title}</span>
        </label>
        
        <div className="ac-option-grid" style={{ gridTemplateColumns: items.length <= 3 ? 'repeat(auto-fit, minmax(110px, 1fr))' : 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          {items.map(item => {
            const isActive = selectedId === item.id;
            const PlatIcon = platformIconsMap[item.id] || null;

            return (
              <button 
                key={item.id} 
                onClick={() => setId(item.id)} 
                className={`ac-option-btn ${isActive ? 'active' : ''}`}
              >
                {PlatIcon && <PlatIcon size={14} color={isActive ? '#EC4899' : 'var(--text2, #94A3B8)'} />}
                <span>{getLabel ? getLabel(item) : (lang === 'en' ? item.name_en : item.name_ar)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const bottomSections = [
    {
      icon: <Brain size={18} color="#EC4899" />,
      title: lang === 'en' ? 'Psychology of a Successful Ad' : 'سيكولوجية الإعلان الناجح',
      items: [
        lang === 'en' ? 'A good ad sells the "end result" and escape from pain, not the product itself.' : 'الإعلان الجيد لا يبيع المنتج، بل يبيع "النتيجة النهائية" والهروب من الألم.',
        lang === 'en' ? 'Make the first seconds a shock or unexpected question.' : 'الناس لا يقرؤون الإعلانات المملة، اجعل الثواني الأولى صدمة أو سؤالاً غير متوقع.',
        lang === 'en' ? 'Always use only ONE Call to Action (CTA).' : 'استخدم دائماً "نداء لاتخاذ إجراء" (CTA) واحد فقط.'
      ]
    }
  ];

  return (
    <ToolDashboardLayout
      id="ad-creative"
      title={lang === 'en' ? 'Ad Creative Lab' : 'مختبر الإعلانات (Ad Creative)'}
      subtitle={lang === 'en' ? 'Generate scenario-specific ad scripts with hooks, visuals, and CTAs based on your product, pain point, and platform.' : 'توليد سكربتات إعلانية مخصصة بالكامل بناءً على نوع منتجك، ألم العميل، والمنصة المستهدفة.'}
      stepNumber={stepNumber}
      accentColor="#EC4899"
      timeEstimate="45 - 90"
      bottomSections={bottomSections}
    >
      <div className="ac-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="ac-main-grid">

          {/* ═══════════════ INPUTS FORM PANEL ═══════════════ */}
          <div className="ac-panel">
            <div className="ac-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clapperboard size={20} />
              </div>
              <div>
                <h3 className="ac-panel-title">
                  <span>{lang === 'en' ? 'Ad Configuration' : 'تكوين الإعلان المموال'}</span>
                </h3>
                <p className="ac-panel-subtitle">
                  {lang === 'en' ? 'Select product type, customer pain point, target platform, and dialect.' : 'حدد نوع المنتج وألم العميل والمنصة المستهدفة لتوليد السكربت.'}
                </p>
              </div>
            </div>

            {structure ? (
              <>
                {renderSelector(
                  lang === 'en' ? '1. Product / Service Type' : '1. نوع المنتج أو الخدمة',
                  ShoppingBag,
                  structure.products, 
                  selectedProduct, 
                  setSelectedProduct
                )}

                {renderSelector(
                  lang === 'en' ? '2. Customer\'s Biggest Pain' : '2. أكبر مشكلة يعاني منها العميل',
                  AlertCircle,
                  structure.painPoints, 
                  selectedPain, 
                  setSelectedPain
                )}

                {renderSelector(
                  lang === 'en' ? '3. Target Platform' : '3. المنصة المستهدفة',
                  Share2,
                  structure.platforms, 
                  selectedPlatform, 
                  setSelectedPlatform
                )}

                {renderSelector(
                  lang === 'en' ? '4. Script Dialect' : '4. اللهجة المستهدفة',
                  Languages,
                  structure.dialects, 
                  selectedDialect, 
                  setSelectedDialect
                )}
              </>
            ) : (
              <div style={{ color: 'var(--text2, #8B96A8)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                <span className="td-spinner" style={{ margin: '0 auto 12px' }} />
                <p>{lang === 'en' ? 'Loading Ad Matrix Structure...' : 'جاري تحميل الهيكل...'}</p>
              </div>
            )}

            {/* Dual Mode Selector */}
            <div style={{ marginTop: '16px' }}>
              <AnalysisModeSelector 
                mode={analysisMode} 
                onChange={setAnalysisMode} 
                lang={lang} 
                accentColor="#EC4899" 
              />
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || !structure} 
              className="ac-generate-btn"
            >
              {isGenerating ? (
                <>
                  <span className="td-spinner" /> 
                  <span>{lang === 'en' ? 'Brainstorming Ad Script...' : 'جاري العصف الذهني...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{lang === 'en' ? 'Generate Ad Script' : 'توليد السكربت الإعلاني'}</span>
                </>
              )}
            </button>
          </div>

          {/* ═══════════════ AI OUTPUT PANEL ═══════════════ */}
          <div className="ac-panel">
            <div className="ac-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Film size={20} />
              </div>
              <div>
                <h3 className="ac-panel-title">
                  <span>{lang === 'en' ? 'Production-Ready Ad Creative' : 'السكربت الإعلاني للإنتاج'}</span>
                </h3>
                <p className="ac-panel-subtitle">
                  {lang === 'en' ? 'Hook line, visual direction, full video script, CTA & alternative angles.' : 'الخطاف الشديد، التوجيه البصري، السكربت الكامل، ودافع الشراء.'}
                </p>
              </div>
            </div>

            <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
              {!result && !isGenerating && (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Clapperboard size={28} />
                  </div>
                  <p style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text, #F8FAFC)', margin: '0 0 6px 0' }}>
                    {lang === 'en' ? 'Select product, pain point, and platform then click generate' : 'حدد المنتج والمشكلة والمنصة ثم اضغط توليد'}
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text2, #94A3B8)', margin: 0 }}>
                    {lang === 'en' ? 'Get custom Hook, Visual Direction, Full Script, and Call to Action.' : 'احصل على خطاف قوي، توجيه بصري، سكربت كامل، ودافع شراء.'}
                  </p>
                </div>
              )}

              {isGenerating && (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div className="td-spinner" style={{ width: '42px', height: '42px', borderWidth: '4px', borderColor: 'rgba(236, 72, 153, 0.2)', borderTopColor: '#EC4899', margin: '0 auto 16px' }} />
                  <p style={{ color: '#EC4899', fontWeight: '800', fontSize: '14px', margin: 0 }}>
                    {lang === 'en' ? 'Drafting viral ad script tailored to your niche...' : 'جاري كتابة السكربت الإعلاني المخصص...'}
                  </p>
                </div>
              )}

              {result && result.error && (
                <div className="ac-result-card" style={{ '--card-accent': '#EF4444' }}>
                  <p style={{ color: '#EF4444', margin: 0, fontWeight: '800' }}>{result.error}</p>
                </div>
              )}

              {result && !result.error && !isGenerating && (
                <AnimatePresence mode="wait">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    {/* The Hook */}
                    <div className="ac-result-card" style={{ '--card-accent': '#EC4899' }}>
                      <div className="ac-card-header">
                        <h4 className="ac-card-title">
                          <Flame size={16} />
                          <span>{lang === 'en' ? 'The Hook (First Line)' : 'الخطاف (أول 3 ثوانٍ)'}</span>
                        </h4>
                        <button 
                          onClick={() => copyText(lang === 'en' ? result.hook_en : result.hook_ar, lang === 'en' ? 'Hook' : 'الخطاف')} 
                          className="ac-copy-btn"
                        >
                          <Copy size={13} />
                          <span>{lang === 'en' ? 'Copy' : 'نسخ'}</span>
                        </button>
                      </div>
                      <div className="ac-card-content" style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text, #F8FAFC)' }}>
                        "{lang === 'en' ? result.hook_en : result.hook_ar}"
                      </div>
                    </div>

                    {/* Visual Direction */}
                    <div className="ac-result-card" style={{ '--card-accent': platformColors[selectedPlatform] || '#3B82F6' }}>
                      <div className="ac-card-header">
                        <h4 className="ac-card-title" style={{ color: platformColors[selectedPlatform] || '#3B82F6' }}>
                          <Film size={16} />
                          <span>{lang === 'en' ? 'Visual Direction (Scene Notes)' : 'التوجيه البصري (مشهد بالفيديو)'}</span>
                        </h4>
                        <button 
                          onClick={() => copyText(lang === 'en' ? result.visual_en : result.visual_ar, lang === 'en' ? 'Visual Direction' : 'التوجيه البصري')} 
                          className="ac-copy-btn"
                        >
                          <Copy size={13} />
                          <span>{lang === 'en' ? 'Copy' : 'نسخ'}</span>
                        </button>
                      </div>
                      <div className="ac-card-content">
                        {lang === 'en' ? result.visual_en : result.visual_ar}
                      </div>
                    </div>

                    {/* Full Script */}
                    <div className="ac-result-card" style={{ '--card-accent': '#10B981' }}>
                      <div className="ac-card-header">
                        <h4 className="ac-card-title" style={{ color: '#10B981' }}>
                          <FileText size={16} />
                          <span>{lang === 'en' ? 'Full Ad Script' : 'السكربت الإعلاني الكامل'}</span>
                        </h4>
                        <button 
                          onClick={() => copyText(lang === 'en' ? result.script_en : result.script_ar, lang === 'en' ? 'Full Script' : 'السكربت الكامل')} 
                          className="ac-copy-btn"
                        >
                          <Copy size={13} />
                          <span>{lang === 'en' ? 'Copy' : 'نسخ'}</span>
                        </button>
                      </div>
                      <div className="ac-card-content">
                        {lang === 'en' ? result.script_en : result.script_ar}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="ac-result-card" style={{ '--card-accent': '#F59E0B' }}>
                      <div className="ac-card-header">
                        <h4 className="ac-card-title" style={{ color: '#F59E0B' }}>
                          <Zap size={16} />
                          <span>{lang === 'en' ? 'Call To Action (CTA)' : 'نداء اتخاذ الإجراء (CTA)'}</span>
                        </h4>
                        <button 
                          onClick={() => copyText(lang === 'en' ? result.cta_en : result.cta_ar, 'CTA')} 
                          className="ac-copy-btn"
                        >
                          <Copy size={13} />
                          <span>{lang === 'en' ? 'Copy' : 'نسخ'}</span>
                        </button>
                      </div>
                      <div className="ac-card-content" style={{ fontSize: '15px', fontWeight: '900' }}>
                        {lang === 'en' ? result.cta_en : result.cta_ar}
                      </div>
                    </div>

                    {/* Alternative Angles */}
                    {result.ad_angles && result.ad_angles.length > 0 && (
                      <div className="ac-result-card" style={{ '--card-accent': '#8B5CF6' }}>
                        <h4 className="ac-card-title" style={{ color: '#8B5CF6', marginBottom: '14px' }}>
                          <Target size={16} />
                          <span>{lang === 'en' ? '5 Alternative Ad Angles' : '5 زوايا إعلانية بديلة للاختبار'}</span>
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {result.ad_angles.map((angle, i) => (
                            <div key={i} style={{ background: 'var(--bg2, rgba(15, 23, 42, 0.7))', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--line, rgba(255, 255, 255, 0.05))' }}>
                              <div style={{ fontWeight: '900', fontSize: '13px', color: '#8B5CF6', marginBottom: '3px' }}>
                                {i + 1}. {lang === 'en' ? angle.angle_en : angle.angle_ar}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text2, #94A3B8)', lineHeight: '1.6' }}>
                                {lang === 'en' ? angle.desc_en : angle.desc_ar}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pro Tip */}
                    {(lang === 'en' ? result.tip_en : result.tip_ar) && (
                      <div className="ac-result-card" style={{ '--card-accent': '#EC4899', background: 'rgba(236, 72, 153, 0.06)' }}>
                        <h4 className="ac-card-title" style={{ color: '#EC4899', marginBottom: '8px' }}>
                          <Lightbulb size={16} />
                          <span>{lang === 'en' ? 'Pro Execution Tip' : 'نصيحة تنفيذية ذهبية'}</span>
                        </h4>
                        <div style={{ fontSize: '12.5px', color: 'var(--text, #F8FAFC)', lineHeight: '1.7' }}>
                          {lang === 'en' ? result.tip_en : result.tip_ar}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>
      </div>
    </ToolDashboardLayout>
  );
}

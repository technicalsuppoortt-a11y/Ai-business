import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getAdLabStructure, getAdLabTemplate } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function AdCreative({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';

  const savedState = state.toolResults['ad-creative'] || {};

  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'

  const [structure, setStructure] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(savedState.selectedProduct || '');
  const [selectedPain, setSelectedPain] = useState(savedState.selectedPain || '');
  const [selectedPlatform, setSelectedPlatform] = useState(savedState.selectedPlatform || '');
  const [selectedDialect, setSelectedDialect] = useState(savedState.selectedDialect || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(savedState.result || null);

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
          pro_tip_ar: liveResult.pro_tip_ar || '',
          pro_tip_en: liveResult.pro_tip_en || ''
        } : {
          hook_ar: String(liveResult),
          hook_en: String(liveResult),
          visual_ar: 'Live AI visual direction',
          visual_en: 'Live AI visual direction',
          script_ar: String(liveResult),
          script_en: String(liveResult),
          cta_ar: 'Shop Now',
          cta_en: 'Shop Now'
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
      } else {
        await new Promise(r => setTimeout(r, 700));
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
        } else {
          setResult({ error: lang === 'en' ? 'Template not found.' : 'لم يتم العثور على قالب لهذا التكوين.' });
        }
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error generating ad.' : 'حدث خطأ. يرجى رفع البيانات أولاً.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'en' ? 'Copied!' : 'تم النسخ!');
  };

  const platformColors = { tiktok: '#25F4EE', facebook: '#1877F2', youtube: '#FF0000' };
  const platformIcons = { tiktok: '📱', facebook: '📘', youtube: '▶️' };

  const renderSelector = (title, items, selectedId, setId, getLabel) => {
    if (!items) return null;
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#EC4899', marginBottom: '12px' }}>{title}</label>
        <div style={{ display: 'grid', gridTemplateColumns: items.length <= 3 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '8px' }}>
          {items.map(item => (
            <button key={item.id} onClick={() => setId(item.id)} style={{
              background: selectedId === item.id ? 'rgba(236, 72, 153, 0.15)' : 'rgba(13, 18, 32, 0.6)',
              border: `1px solid ${selectedId === item.id ? '#EC4899' : 'rgba(255,255,255,0.05)'}`,
              color: selectedId === item.id ? '#F0F4FC' : '#8B96A8',
              padding: '12px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              boxShadow: selectedId === item.id ? '0 4px 12px rgba(236,72,153,0.1)' : 'none',
            }}>
              {getLabel ? getLabel(item) : (lang === 'en' ? item.name_en : item.name_ar)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const bottomSections = [
    {
      icon: '🧠',
      title: lang === 'en' ? 'Psychology of a Successful Ad' : 'سيكولوجية الإعلان الناجح',
      items: [
        lang === 'en' ? 'A good ad sells the "end result" and escape from pain, not the product itself.' : 'الإعلان الجيد لا يبيع المنتج، بل يبيع "النتيجة النهائية" والهروب من الألم.',
        lang === 'en' ? 'Make the first seconds a shock or unexpected question.' : 'الناس لا يقرؤون الإعلانات المملة، اجعل الثواني الأولى صدمة أو سؤالاً غير متوقع.',
        lang === 'en' ? 'Always use only ONE Call to Action (CTA).' : 'استخدم دائماً "نداء لاتخاذ إجراء" (CTA) واحد فقط.',
      ]
    },
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

      <div className="td-grid cols-2" style={{ marginBottom: '36px', alignItems: 'start' }}>

        {/* INPUTS */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(236,72,153,0.2)', background: 'rgba(236,72,153,0.05)' }}>
          {structure ? (
            <>
              {renderSelector(lang === 'en' ? '1. Product / Service Type' : '1. نوع المنتج أو الخدمة', structure.products, selectedProduct, setSelectedProduct)}
              {renderSelector(lang === 'en' ? '2. Customer\'s Biggest Pain' : '2. أكبر مشكلة يعاني منها العميل', structure.painPoints, selectedPain, setSelectedPain)}
              {renderSelector(lang === 'en' ? '3. Target Platform' : '3. المنصة المستهدفة', structure.platforms, selectedPlatform, setSelectedPlatform,
                (item) => `${platformIcons[item.id] || '📣'} ${lang === 'en' ? item.name_en : item.name_ar}`
              )}
              {renderSelector(lang === 'en' ? '4. Script Dialect' : '4. اللهجة المستهدفة', structure.dialects, selectedDialect, setSelectedDialect)}
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
            accentColor="#EC4899" 
          />

          <button onClick={handleGenerate} disabled={isGenerating || !structure} className="td-btn-primary"
            style={{ background: isGenerating ? 'rgba(236,72,153,0.2)' : '#EC4899', color: isGenerating ? '#8B96A8' : '#fff', marginTop: '16px', width: '100%' }}>
            {isGenerating
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><span className="td-spinner" /> {lang === 'en' ? 'Brainstorming...' : 'جاري العصف الذهني...'}</span>
              : <span>✨ {lang === 'en' ? 'Generate Ad Script' : 'توليد السكربت الإعلاني'}</span>}
          </button>
        </div>

        {/* OUTPUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!result && (
            <div className="td-info-panel" style={{ margin: 0, background: 'rgba(13,18,32,0.6)', borderStyle: 'dashed', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>🎞️</div>
              <p style={{ color: '#8B96A8', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {lang === 'en' ? 'Select product, pain point, and platform then click generate.' : 'حدد المنتج والمشكلة والمنصة ثم اضغط توليد لتحصل على سكربت مخصص.'}
              </p>
            </div>
          )}

          {result && result.error && (
            <div className="td-raw-output" style={{ borderTop: '3px solid #EF4444' }}>{result.error}</div>
          )}

          {result && !result.error && (
            <>
              {/* Hook */}
              <div className="td-info-panel" style={{ margin: 0, borderLeft: '4px solid #EC4899', background: 'rgba(13,18,32,0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: '#EC4899', fontSize: '15px', fontWeight: 900, margin: 0 }}>
                    🎣 {lang === 'en' ? 'The Hook (First Line)' : 'الخطاف (أول جملة)'}
                  </h4>
                  <button onClick={() => copyText(lang === 'en' ? result.hook_en : result.hook_ar)} style={{ background: 'none', border: 'none', color: '#8B96A8', cursor: 'pointer', fontSize: '16px' }}>📋</button>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#F0F4FC', lineHeight: 1.6 }}>"{lang === 'en' ? result.hook_en : result.hook_ar}"</div>
              </div>

              {/* Visual Direction */}
              <div className="td-info-panel" style={{ margin: 0, borderLeft: `4px solid ${platformColors[selectedPlatform] || '#6366F1'}`, background: 'rgba(13,18,32,0.8)' }}>
                <h4 style={{ color: platformColors[selectedPlatform] || '#6366F1', fontSize: '15px', fontWeight: 900, margin: '0 0 12px' }}>
                  🎬 {lang === 'en' ? 'Visual Direction' : 'التوجيه البصري (Visual)'}
                </h4>
                <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{lang === 'en' ? result.visual_en : result.visual_ar}</div>
              </div>

              {/* Main Script */}
              <div className="td-info-panel" style={{ margin: 0, borderLeft: '4px solid #10B981', background: 'rgba(13,18,32,0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: '#10B981', fontSize: '15px', fontWeight: 900, margin: 0 }}>
                    📝 {lang === 'en' ? 'Full Ad Script' : 'السكربت الإعلاني الكامل'}
                  </h4>
                  <button onClick={() => copyText(lang === 'en' ? result.script_en : result.script_ar)} style={{ background: 'none', border: 'none', color: '#8B96A8', cursor: 'pointer', fontSize: '16px' }}>📋</button>
                </div>
                <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{lang === 'en' ? result.script_en : result.script_ar}</div>
              </div>

              {/* CTA */}
              <div className="td-info-panel" style={{ margin: 0, borderLeft: '4px solid #F59E0B', background: 'rgba(245,158,11,0.05)' }}>
                <h4 style={{ color: '#F59E0B', fontSize: '15px', fontWeight: 900, margin: '0 0 12px' }}>
                  🔥 {lang === 'en' ? 'Call To Action' : 'نداء الإجراء (CTA)'}
                </h4>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#F0F4FC' }}>{lang === 'en' ? result.cta_en : result.cta_ar}</div>
              </div>

              {/* Ad Angles */}
              {result.ad_angles && (
                <div className="td-info-panel" style={{ margin: 0, borderLeft: '4px solid #8B5CF6', background: 'rgba(13,18,32,0.8)' }}>
                  <h4 style={{ color: '#8B5CF6', fontSize: '15px', fontWeight: 900, margin: '0 0 16px' }}>
                    🎯 {lang === 'en' ? '5 Alternative Ad Angles' : '5 زوايا إعلانية بديلة للاختبار'}
                  </h4>
                  {result.ad_angles.map((angle, i) => (
                    <div key={i} style={{ marginBottom: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
                      <div style={{ fontWeight: 900, fontSize: '13px', color: '#C4B5FD', marginBottom: '4px' }}>{i + 1}. {lang === 'en' ? angle.angle_en : angle.angle_ar}</div>
                      <div style={{ fontSize: '12px', color: '#8B96A8', lineHeight: 1.6 }}>{lang === 'en' ? angle.desc_en : angle.desc_ar}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pro Tip */}
              {(lang === 'en' ? result.tip_en : result.tip_ar) && (
                <div className="td-info-panel" style={{ margin: 0, background: 'rgba(236,72,153,0.05)', borderColor: 'rgba(236,72,153,0.2)' }}>
                  <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: 1.8 }}>{lang === 'en' ? result.tip_en : result.tip_ar}</div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </ToolDashboardLayout>
  );
}

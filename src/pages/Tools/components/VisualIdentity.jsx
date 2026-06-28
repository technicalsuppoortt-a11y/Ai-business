import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getColorAnalysis } from '../../../services/contentDbService';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function VisualIdentity({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  
  const [logoPreview, setLogoPreview] = useState(state?.logo || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [colorAnalysis, setColorAnalysis] = useState(null);

  const allPalettes = [
    { name: "Neon", primary: "#06b6d4", secondary: "#0f172a" }, 
    { name: "Purple", primary: "#8b5cf6", secondary: "#1e1b4b" },
    { name: "Green", primary: "#10b981", secondary: "#064e3b" }, 
    { name: "Blue", primary: "#1e40af", secondary: "#f8fafc" },
    { name: "Gold", primary: "#d4af37", secondary: "#171717" }, 
    { name: "Orange", primary: "#f97316", secondary: "#fff7ed" },
    { name: "Teal", primary: "#0f766e", secondary: "#f0fdfa" }, 
    { name: "Slate", primary: "#475569", secondary: "#f1f5f9" },
    { name: "Red", primary: "#ef4444", secondary: "#fef2f2" }, 
    { name: "Yellow", primary: "#eab308", secondary: "#422006" },
    { name: "Mint", primary: "#14b8a6", secondary: "#ccfbf1" }, 
    { name: "Pink", primary: "#ec4899", secondary: "#fdf2f8" }
  ];

  const updateColors = (p, s) => {
    dispatch({ type: 'SET_FIELD', field: 'primaryColor', value: p });
    dispatch({ type: 'SET_FIELD', field: 'secondaryColor', value: s });
    setColorAnalysis(null);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoPreview(ev.target.result);
        dispatch({ type: 'SET_FIELD', field: 'logo', value: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeColors = async () => {
    setIsGenerating(true);
    setColorAnalysis(null);

    try {
      await new Promise(r => setTimeout(r, 600)); // Simulate processing

      // Find the name of the active palette based on primaryColor
      const activePal = allPalettes.find(p => p.primary === state.primaryColor) || { name: 'blue' };
      const dbResult = await getColorAnalysis(activePal.name.toLowerCase());
      
      if (dbResult && (dbResult.psychology_ar || dbResult.psychology_en)) {
        setColorAnalysis(dbResult);
      } else {
         setColorAnalysis({ error: true });
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error analyzing colors.' : 'حدث خطأ أثناء التحليل.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ToolDashboardLayout
      id="visual-identity"
      title={lang === 'en' ? 'Visual Identity' : 'الهوية البصرية (Visual Identity)'}
      subtitle={lang === 'en' ? 'Colors and logo are the foundation of your website. Choose colors that reflect your brand personality.' : 'الألوان واللوجو هما أساس تصميم موقعك لاحقاً. اختر ألواناً تعكس شخصية البراند واستخدم الذكاء الاصطناعي لتحليل تأثيرها النفسي.'}
      stepNumber={stepNumber}
      accentColor={state.primaryColor || '#10B981'}
      timeEstimate="15 - 30"
    >
      
      {/* ═══════════════ COLOR PALETTES ═══════════════ */}
      <div className="td-section-title">
        <div className="td-section-bar" style={{ background: state.primaryColor || '#10B981' }} />
        {lang === 'en' ? 'Suggested Color Palettes (12 Options)' : 'باليت ألوان مقترحة (12 خيار)'}
      </div>
      
      <div className="td-swatch-grid">
        {allPalettes.map((pal, i) => {
          const isActive = state.primaryColor === pal.primary;
          return (
            <div 
              key={i} 
              className={`td-swatch ${isActive ? 'active' : ''}`}
              onClick={() => updateColors(pal.primary, pal.secondary)}
              style={{ '--td-accent': pal.primary }}
            >
              <div className="td-swatch-colors">
                <div className="td-swatch-circle" style={{ backgroundColor: pal.primary }}></div>
                <div className="td-swatch-circle" style={{ backgroundColor: pal.secondary, marginLeft: '-8px' }}></div>
              </div>
              <span className="td-swatch-name" style={{ color: isActive ? pal.primary : '#6B7A8D' }}>{pal.name}</span>
            </div>
          );
        })}
      </div>

      {/* ═══════════════ MANUAL CUSTOMIZATION & AI ANALYSIS ═══════════════ */}
      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        
        {/* Manual Colors */}
        <div className="td-info-panel" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#E8EDF5', marginBottom: '16px' }}>
            {lang === 'en' ? 'Manual Customization' : 'التخصيص اليدوي'}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="color" 
                value={state.primaryColor || '#10B981'} 
                onChange={(e) => updateColors(e.target.value, state.secondaryColor)}
                style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#8B96A8', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'Primary Color' : 'اللون الأساسي'}
                </div>
                <div style={{ fontSize: '14px', color: '#fff', fontFamily: 'monospace' }}>{state.primaryColor || '#10B981'}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="color" 
                value={state.secondaryColor || '#0f172a'} 
                onChange={(e) => updateColors(state.primaryColor, e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#8B96A8', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'Secondary Color' : 'اللون الثانوي'}
                </div>
                <div style={{ fontSize: '14px', color: '#fff', fontFamily: 'monospace' }}>{state.secondaryColor || '#0f172a'}</div>
              </div>
            </div>
          </div>

          <button 
            onClick={analyzeColors}
            disabled={isGenerating || !state.primaryColor}
            className="td-btn-primary"
            style={{ 
              marginTop: '20px', 
              background: isGenerating ? 'rgba(255,255,255,0.1)' : (state.primaryColor || '#10B981'),
              color: isGenerating ? '#8B96A8' : '#fff'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" /> {lang === 'en' ? 'Analyzing Psychology...' : 'جاري التحليل السيكولوجي...'}
              </span>
            ) : (
              <span>🤖 {lang === 'en' ? 'Analyze Brand Color Psychology' : 'تحليل سيكولوجية الألوان لمشروعك'}</span>
            )}
          </button>
        </div>

        {/* AI Output */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#E8EDF5', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✨</span> {lang === 'en' ? 'Color Psychology Intelligence' : 'سيكولوجية الألوان المختارة'}
          </h3>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', opacity: 0.5 }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🧠</span>
              <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{lang === 'en' ? 'Colors have strong psychological effects.' : 'الألوان لها تأثير نفسي قوي.'}</p>
              <p style={{ fontSize: '10px' }}>{lang === 'en' ? 'Select colors and click analyze to see results.' : 'اختر الألوان واضغط على التحليل السيكولوجي.'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* ═══════════════ AI ANALYSIS RESULTS (RICH CARDS) ═══════════════ */}
      {colorAnalysis && !colorAnalysis.error && (
        <div style={{ marginBottom: '36px' }}>
          <div className="td-section-title" style={{ marginBottom: '16px' }}>
            <div className="td-section-bar" style={{ background: state.primaryColor || '#10B981' }} />
            {lang === 'en' ? '✨ Brand Identity Analysis' : '✨ دليل الهوية المصغر'}
          </div>

          <div className="td-grid cols-2" style={{ gap: '16px' }}>
            
            {/* Psychology & Tone */}
            <div className="td-result-card" style={{ borderLeftColor: state.primaryColor, borderRightColor: state.primaryColor, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>🧠</span>
                <h4 style={{ color: state.primaryColor, margin: 0, fontSize: '16px' }}>
                  {lang === 'en' ? 'Psychology & Tone' : 'السيكولوجية ونبرة الصوت'}
                </h4>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.8, color: '#E8EDF5', marginBottom: '12px' }}>
                {lang === 'en' ? colorAnalysis.psychology_en : colorAnalysis.psychology_ar}
              </p>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>🎙️</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#8B96A8', marginBottom: '2px' }}>{lang === 'en' ? 'Brand Voice' : 'نبرة صوت البراند'}</div>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>
                    {lang === 'en' ? colorAnalysis.brand_tone_en : colorAnalysis.brand_tone_ar}
                  </div>
                </div>
              </div>
            </div>

            {/* Fonts & Industries */}
            <div className="td-result-card" style={{ borderLeftColor: state.primaryColor, borderRightColor: state.primaryColor, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>📝</span>
                  <h4 style={{ color: state.primaryColor, margin: 0, fontSize: '15px' }}>
                    {lang === 'en' ? 'Suggested Fonts' : 'تنسيق الخطوط المقترح'}
                  </h4>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px', fontSize: '13px', color: '#E8EDF5', fontFamily: 'monospace' }}>
                  {lang === 'en' ? colorAnalysis.font_pairings_en : colorAnalysis.font_pairings_ar}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🏢</span>
                  <h4 style={{ color: state.primaryColor, margin: 0, fontSize: '15px' }}>
                    {lang === 'en' ? 'Best For Industries' : 'يتألق في مجالات'}
                  </h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(lang === 'en' ? colorAnalysis.recommended_industries_en : colorAnalysis.recommended_industries_ar)?.map((ind, i) => (
                    <span key={i} style={{ background: `${state.primaryColor}20`, color: '#fff', border: `1px solid ${state.primaryColor}50`, padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Do's and Don'ts - Full Width */}
            <div className="td-result-card" style={{ gridColumn: '1 / -1', borderLeftColor: state.primaryColor, borderRightColor: state.primaryColor, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <h4 style={{ color: state.primaryColor, margin: 0, fontSize: '16px' }}>
                  {lang === 'en' ? "Pro Tips (Do's & Don'ts)" : "نصائح ذهبية للمصمم (افعل ولا تفعل)"}
                </h4>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.8, color: '#E8EDF5', whiteSpace: 'pre-line' }}>
                {lang === 'en' ? colorAnalysis.dos_and_donts_en : colorAnalysis.dos_and_donts_ar}
              </div>
            </div>

          </div>
        </div>
      )}

      {colorAnalysis?.error && (
        <div className="td-result-card" style={{ borderLeftColor: '#ef4444', borderRightColor: '#ef4444', marginBottom: '36px' }}>
           <h4 style={{ color: '#ef4444', margin: 0, fontSize: '14px' }}>
             {lang === 'en' ? "No detailed analysis found for this color yet." : "لم يتم العثور على تحليل مفصل مخصص لهذا اللون بعد. قم بتحديث قاعدة البيانات."}
           </h4>
        </div>
      )}

      {/* ═══════════════ BRAND SIMULATOR (MOCKUP) ═══════════════ */}
      <div className="td-section-title">
        <div className="td-section-bar" style={{ background: state.primaryColor || '#10B981' }} />
        {lang === 'en' ? 'Brand Simulator' : 'محاكاة الهوية (Brand Simulator)'}
      </div>

      <div style={{ background: 'rgba(13, 18, 32, 0.4)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '20px', padding: '24px', marginBottom: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          
          {/* Logo Upload Area */}
          <div style={{ position: 'relative', border: '2px dashed rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', minHeight: '200px', cursor: 'pointer', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
            {!logoPreview ? (
              <>
                <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '24px' }}>☁️</div>
                <p style={{ fontSize: '12px', color: '#8B96A8', fontWeight: 'bold' }}>
                  {lang === 'en' ? 'Click to upload logo for mockup' : 'اضغط لرفع اللوجو لمعاينة التصميم'}
                </p>
              </>
            ) : (
              <img src={logoPreview} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '16px', zIndex: 0 }} alt="Logo" />
            )}
          </div>

          {/* Website Mockup Preview */}
          <div style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '220px' }}>
            <div style={{ background: '#0f172a', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
            </div>
            
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {/* Fake Navbar */}
              <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: state.secondaryColor || '#0f172a' }}>
                <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
                  {logoPreview ? <img src={logoPreview} style={{ height: '100%', objectFit: 'contain' }} /> : <div style={{ width: '60px', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '30px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
                  <div style={{ width: '30px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
                </div>
              </div>
              
              {/* Fake Hero Section */}
              <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', borderRadius: '50%', background: state.primaryColor || '#10B981', filter: 'blur(80px)', opacity: 0.15, pointerEvents: 'none' }}></div>
                
                <h4 style={{ fontSize: '20px', fontWeight: '900', color: state.primaryColor || '#10B981', marginBottom: '16px' }}>{state.brandName || (lang === 'en' ? 'Your Website Headline' : 'عنوان موقعك الاحترافي')}</h4>
                <div style={{ padding: '8px 24px', borderRadius: '30px', fontSize: '11px', fontWeight: 'bold', color: '#fff', background: state.primaryColor || '#10B981', cursor: 'pointer' }}>{lang === 'en' ? 'Shop Now' : 'اشترِ الآن'}</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </ToolDashboardLayout>
  );
}

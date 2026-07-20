import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getNiches, seedNiches } from '../../../services/nicheService';
import { getNicheAnalysis } from '../../../services/contentDbService';
import ToolDashboardLayout from './ToolDashboardLayout';

const NICHE_THEMES = {
  ai: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  business: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  marketing: { color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.1)' },
  fitness: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  realestate: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  creative: { color: '#D946EF', bg: 'rgba(217, 70, 239, 0.1)' }
};

const DEFAULT_THEME = { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };

export default function NicheSelection({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nicheAnalysis, setNicheAnalysis] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Force seed once to make sure bilingual fields are updated, 
        // in a real app we'd only do it if fields are missing, but here it's safe.
        await seedNiches();
        let data = await getNiches();
        setNiches(data);
        if (state.niche) {
          const found = data.find(n => n.id === state.niche);
          if (found) setSelectedNiche(found);
        }
      } catch (err) {
        console.error("Error loading niches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [state.niche]);

  const handleSelect = (n) => {
    setSelectedNiche(n);
    dispatch({ type: 'SET_FIELD', field: 'niche', value: n.id });
    setNicheAnalysis('');
  };

  const fillNicheInput = (text) => {
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: text });
    setNicheAnalysis('');
  };

  const handleAnalyze = async () => {
    if (!state.subNiche) {
      alert(lang === 'en' ? 'Please select a micro-niche first.' : 'الرجاء اختيار تخصص دقيق (Micro-Niche) أولاً.');
      return;
    }

    setIsGenerating(true);
    setNicheAnalysis('');

    try {
      // UX delay to simulate AI processing
      await new Promise(r => setTimeout(r, 800));
      
      // Find the index of the sub-niche in the ideas list of selectedNiche
      let subNicheKey = state.subNiche;
      if (selectedNiche) {
        let index = (selectedNiche.ideas_en || []).indexOf(state.subNiche);
        if (index === -1) {
          index = (selectedNiche.ideas_ar || []).indexOf(state.subNiche);
        }
        if (index !== -1) {
          subNicheKey = index.toString(); // e.g. "0", "1", "2"
        }
      }
      
      // We pass the parent niche and the resolved subNiche key (the index as string) to the database
      const dbResult = await getNicheAnalysis(selectedNiche?.id, subNicheKey);
      
      if (dbResult) {
        setNicheAnalysis(lang === 'en' ? (dbResult.analysis_en || dbResult.analysis_ar) : dbResult.analysis_ar);
      } else {
        setNicheAnalysis(lang === 'en' 
          ? "Analysis not found for this specific niche yet. Please try another or continue building your brand." 
          : "لم يتم العثور على تحليل مخصص لهذا النيتش بعد. يمكنك تجربة تخصص آخر أو الاستمرار في بناء علامتك التجارية.");
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error analyzing niche.' : 'حدث خطأ أثناء تحليل التخصص.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getLabel = (niche) => lang === 'en' ? niche.label_en : niche.label_ar;
  const getIdeas = (niche) => lang === 'en' ? (niche.ideas_en || []) : (niche.ideas_ar || []);

  return (
    <ToolDashboardLayout
      id="niche-selection"
      title={lang === 'en' ? 'Strategic Niche Selection' : 'اختيار التخصص الاستراتيجي (Niche)'}
      subtitle={lang === 'en' ? "Don't just be 'another freelancer'. Choose your niche carefully to dominate the market." : "لا تكن مجرد 'مستقل آخر'. اختر تخصصك بدقة لنرشدك كيف تهيمن على السوق وتجذب العملاء الكبار."}
      stepNumber={stepNumber}
      accentColor={selectedNiche ? NICHE_THEMES[selectedNiche.id]?.color : '#8B5CF6'}
      timeEstimate="10 - 20"
    >
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div 
              key={i} 
              className="td-card skeleton-shimmer" 
              style={{ height: '110px', borderRadius: 'var(--radius)', opacity: 0.15 }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* ═══════════════ NICHES GRID ═══════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {niches.map((n) => {
              const theme = NICHE_THEMES[n.id] || DEFAULT_THEME;
              const isSelected = state.niche === n.id;
              
              return (
                <div 
                  key={n.id}
                  className={`td-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelect(n)}
                  style={{ '--td-accent': theme.color }}
                >
                  <div className="td-card-icon" style={{ fontSize: '28px', background: isSelected ? theme.color : 'rgba(255,255,255,0.05)', color: isSelected ? '#fff' : theme.color, borderColor: isSelected ? 'transparent' : 'rgba(255,255,255,0.08)' }}>
                    {n.icon}
                  </div>
                  <div className="td-card-label" style={{ color: isSelected ? '#fff' : '#B0BAC8' }}>{getLabel(n)}</div>
                </div>
              );
            })}
          </div>

          {/* ═══════════════ MICRO-NICHE SELECTION ═══════════════ */}
          {selectedNiche && (
            <div className="td-info-panel" style={{ borderColor: `${NICHE_THEMES[selectedNiche.id]?.color}40`, background: 'rgba(13, 18, 32, 0.6)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{selectedNiche.icon}</span>
                {lang === 'en' ? `Explore ${getLabel(selectedNiche)} Micro-Niches` : `استكشاف تخصصات ${getLabel(selectedNiche)} الدقيقة`}
              </h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {getIdeas(selectedNiche).map((idea, i) => {
                  const isActive = state.subNiche === idea;
                  const color = NICHE_THEMES[selectedNiche.id]?.color;
                  return (
                    <button 
                      key={i}
                      onClick={() => fillNicheInput(idea)}
                      style={{
                        background: isActive ? `${color}20` : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
                        color: isActive ? '#fff' : '#B0BAC8',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ color: isActive ? color : '#6B7A8D' }}>#</span>
                      {idea}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#8B96A8', marginBottom: '10px' }}>
                  {lang === 'en' ? 'The Micro-Niche you will build your empire on:' : 'التخصص الدقيق الذي ستبني عليه إمبراطوريتك:'}
                </label>
                <input 
                  type="text" 
                  readOnly 
                  value={state.subNiche || ''}
                  placeholder={lang === 'en' ? "Select a micro-niche from above..." : "اختر تخصصاً من القائمة أعلاه..."}
                  className="td-input"
                  style={{ borderColor: state.subNiche ? NICHE_THEMES[selectedNiche.id]?.color : 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 'bold' }}
                />
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isGenerating || !state.subNiche}
                className="td-btn-primary"
                style={{ 
                  background: isGenerating || !state.subNiche ? 'rgba(255,255,255,0.1)' : NICHE_THEMES[selectedNiche.id]?.color,
                  color: isGenerating || !state.subNiche ? '#8B96A8' : '#fff'
                }}
              >
                {isGenerating ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span className="td-spinner" />
                    {lang === 'en' ? 'Analyzing strategic opportunities...' : 'جاري تحليل الفرص الاستراتيجية...'}
                  </span>
                ) : (
                  <span>🤖 {lang === 'en' ? 'Analyze Niche & Discover Ideal Client' : 'تحليل التخصص واكتشاف العميل المثالي'}</span>
                )}
              </button>
            </div>
          )}

          {/* ═══════════════ AI ANALYSIS RESULTS ═══════════════ */}
          {nicheAnalysis && !isGenerating && (
            <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: NICHE_THEMES[selectedNiche?.id]?.color || '#8B5CF6', fontWeight: '900', fontSize: '16px' }}>
                <span>✨</span> {lang === 'en' ? 'Strategic Intelligence' : 'الذكاء الاستراتيجي للمجال'}
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const blocks = nicheAnalysis.split(/\n\n(?=\*\*)/);
                  const mainTitle = blocks.shift()?.replace(/## /g, '');
                  const themeColor = NICHE_THEMES[selectedNiche?.id]?.color || '#8B5CF6';
                  
                  return (
                    <>
                      {mainTitle && (
                         <div style={{ background: themeColor, color: '#fff', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginBottom: '8px' }}>
                           {mainTitle}
                         </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                        {blocks.map((block, index) => {
                          const lines = block.split('\n');
                          const title = lines[0].replace(/\*\*/g, '');
                          const content = lines.slice(1).join('\n');
                          
                          // Quick check for icons based on keywords
                          const getIcon = (t) => {
                            if (t.includes('الفرصة') || t.includes('Opportunity')) return '🚀';
                            if (t.includes('العميل') || t.includes('Customer')) return '👤';
                            if (t.includes('نقاط التمييز') || t.includes('USP')) return '💎';
                            if (t.includes('التسعير') || t.includes('Pricing')) return '💰';
                            if (t.includes('النمو') || t.includes('Growth') || t.includes('قنوات')) return '📈';
                            return '💡';
                          };
                          
                          return (
                            <div key={index} style={{ background: 'rgba(0, 0, 0, 0.2)', border: `1px solid ${themeColor}40`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                              <h4 style={{ color: themeColor, fontSize: '14px', marginBottom: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{getIcon(title)}</span> {title.replace(':', '')}
                              </h4>
                              <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.8', flex: 1 }}>
                                {content.split('\n').map((line, i) => {
                                  // Formatting for bullet points and bold
                                  let formattedLine = line.trim();
                                  if (formattedLine.startsWith('-')) {
                                    formattedLine = formattedLine.substring(1).trim();
                                    return (
                                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ color: themeColor, opacity: 0.7 }}>•</span>
                                        <span>
                                          {formattedLine.split(/(\*\*.*?\*\*)/).map((part, j) => 
                                            part.startsWith('**') && part.endsWith('**') 
                                              ? <strong key={j} style={{ color: '#fff' }}>{part.replace(/\*\*/g, '')}</strong> 
                                              : part
                                          )}
                                        </span>
                                      </div>
                                    );
                                  } else if (formattedLine.match(/^\d+\./)) {
                                    return (
                                      <div key={i} style={{ marginBottom: '6px', fontWeight: 'bold' }}>
                                        {formattedLine}
                                      </div>
                                    );
                                  } else if (formattedLine) {
                                    return <p key={i} style={{ margin: '0 0 6px 0' }}>{formattedLine}</p>;
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </ToolDashboardLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getSocialPresenceMatrix } from '../../../services/contentDbService';
import { SOCIAL_PLATFORMS, SOCIAL_GOALS, generateSocialStrategyText } from '../../../data/socialPresenceMatrix';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function SocialPresence({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  
  // Inputs
  const [platform, setPlatform] = useState('instagram');
  const [goal, setGoal] = useState('awareness');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [matrixData, setMatrixData] = useState(null);

  const platforms = SOCIAL_PLATFORMS;
  const goals = SOCIAL_GOALS;

  useEffect(() => {
    const fetchMatrix = async () => {
      const data = await getSocialPresenceMatrix();
      setMatrixData(data);
    };
    fetchMatrix();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'social-presence',
          inputs: { platform, goal },
          context: { niche: state.niche, brandName: state.brandName, user: state.user },
          lang
        });
        setResult(liveResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'social-presence',
          data: {
            platform,
            goal,
            result: liveResult,
            mode: 'live'
          }
        });
      } else {
        await new Promise(r => setTimeout(r, 500));

        const niche = state.subNiche || state.niche || (lang === 'en' ? 'Freelance' : 'عمل حر');
        const brandName = state.brandName || (lang === 'en' ? 'My Brand' : 'براندي');
        
        const text = generateSocialStrategyText(matrixData, platform, goal, niche, brandName, lang);
        setResult(text);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'social-presence',
          data: {
            platform,
            goal,
            result: text,
            mode: 'fast'
          }
        });
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error generating strategy. Try again.' : 'حدث خطأ أثناء التوليد. حاول مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert(lang === 'en' ? 'Copied successfully!' : 'تم النسخ بنجاح!');
  };

  const bottomSections = [
    {
      icon: '📱',
      title: lang === 'en' ? 'The Importance of Social Presence' : 'أهمية التواجد الاجتماعي',
      items: [
        lang === 'en' ? 'Social media is your virtual storefront, it must look professional from day one.' : 'السوشيال ميديا هي واجهة محلك الافتراضي، يجب أن تبدو احترافية من اليوم الأول.',
        lang === 'en' ? 'The Bio is the first thing customers see, make it clear (what you do and how it benefits them).' : 'البايو (Bio) هو أول ما يراه العميل، اجعله يوضح (ماذا تفعل وكيف تفيده).',
        lang === 'en' ? 'Do not be on every platform! Choose one or two where your target audience hangs out and focus on them.' : 'لا تكن موجوداً على كل المنصات! اختر منصة أو اثنتين يتواجد فيها جمهورك المستهدف وركز عليها.'
      ]
    },
    {
      icon: '🎯',
      title: lang === 'en' ? 'Strategy Tips' : 'نصائح للاستراتيجية',
      items: [
        lang === 'en' ? 'Awareness: Focus on short-form videos (Reels/TikTok) and shareable content.' : 'الوعي (Awareness): ركز على الفيديوهات القصيرة (Reels/TikTok) والمحتوى القابل للمشاركة.',
        lang === 'en' ? 'Leads: Offer something free (Lead Magnet) in exchange for an email in your bio link.' : 'الـ Leads: قدم شيئاً مجانياً (Lead Magnet) مقابل الإيميل في رابط البايو.',
        lang === 'en' ? 'Sales: Use success stories (Testimonials) and direct offers.' : 'المبيعات: استخدم قصص النجاح (Testimonials) والعروض المباشرة.'
      ]
    }
  ];

  return (
    <ToolDashboardLayout
      id="social-presence"
      title={lang === 'en' ? 'Social Media Setup & Strategy' : 'مؤسس السوشيال ميديا (Social Setup)'}
      subtitle={lang === 'en' ? 'Set up your accounts professionally. Get Bio ideas, content strategy, and first 5 post ideas tailored to your niche and chosen platform.' : 'جهّز حساباتك باحترافية. احصل على أفكار للـ Bio، استراتيجية المحتوى، وأول 5 بوستات مخصصة لنيتشك والمنصة التي تختارها.'}
      stepNumber={stepNumber}
      accentColor="#3B82F6"
      timeEstimate="20 - 40"
      bottomSections={bottomSections}
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {lang === 'en' ? 'Choose Platform' : 'اختر المنصة'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: platform === p.id ? `${p.color}20` : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${platform === p.id ? p.color : 'rgba(255,255,255,0.05)'}`,
                    color: platform === p.id ? '#fff' : '#8B96A8',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: lang === 'en' ? 'left' : 'right',
                    flexDirection: lang === 'en' ? 'row' : 'row'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{p.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{lang === 'en' ? p.label_en : p.label_ar}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {lang === 'en' ? 'Primary Goal of Presence' : 'الهدف الأساسي من التواجد'}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {goals.map(g => (
                <label key={g.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: goal === g.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${goal === g.id ? '#3B82F6' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexDirection: lang === 'en' ? 'row' : 'row'
                }}>
                  <input 
                    type="radio" 
                    name="goal" 
                    value={g.id}
                    checked={goal === g.id}
                    onChange={() => setGoal(g.id)}
                    style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }}
                  />
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: goal === g.id ? '#fff' : '#8B96A8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{g.icon}</span>
                    {lang === 'en' ? g.label_en : g.label_ar}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Dual Mode Selector */}
          <AnalysisModeSelector 
            mode={analysisMode} 
            onChange={setAnalysisMode} 
            lang={lang} 
            accentColor="#3B82F6" 
          />

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="td-btn-primary"
            style={{ 
              background: isGenerating ? 'rgba(59, 130, 246, 0.2)' : '#3B82F6',
              color: isGenerating ? '#8B96A8' : '#fff'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" /> {lang === 'en' ? 'Drafting strategy...' : 'جاري رسم الاستراتيجية...'}
              </span>
            ) : (
              <span>✨ {lang === 'en' ? 'Generate Account Strategy' : 'توليد استراتيجية الحساب'}</span>
            )}
          </button>
        </div>

        {/* ═══════════════ AI OUTPUT ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📱</span> {lang === 'en' ? 'Platform Strategy' : 'استراتيجية المنصة'}
            </h3>
            {result && !isGenerating && (
              <button 
                onClick={handleCopy}
                style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 {lang === 'en' ? 'Copy Strategy' : 'نسخ الاستراتيجية'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: result && !isGenerating ? 'flex-start' : 'center', justifyContent: result && !isGenerating ? 'flex-start' : 'center' }}>
            {!result && !isGenerating ? (
              <div style={{ textAlign: 'center', opacity: 0.4 }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📱</span>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E8EDF5' }}>
                  {lang === 'en' ? 'Select platform and goal to draft your starting plan' : 'حدد المنصة والهدف لنرسم لك خطة البداية'}
                </p>
                <p style={{ fontSize: '12px', color: '#8B96A8', marginTop: '8px' }}>
                  {lang === 'en' ? 'Bio, Content pillars, and first 5 post ideas.' : 'بايو، استراتيجية محتوى، وأول 5 أفكار للبوستات.'}
                </p>
              </div>
            ) : isGenerating ? (
               <div style={{ textAlign: 'center' }}>
                 <div className="td-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6', marginBottom: '16px' }}></div>
                 <p style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '14px' }}>
                   {lang === 'en' ? 'Building custom strategy for your account...' : 'يتم الآن بناء الاستراتيجية المخصصة لحسابك...'}
                 </p>
               </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const blocks = result.split(/\n\n(?=\*\*)/);
                  const mainTitle = blocks.shift()?.replace(/### /g, '');
                  return (
                    <>
                      {mainTitle && (
                         <div style={{ background: '#3B82F6', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>
                           {mainTitle}
                         </div>
                      )}
                      {blocks.map((block, index) => {
                        const lines = block.split('\n');
                        const title = lines[0].replace(/\*\*/g, '');
                        const content = lines.slice(1).join('\n');
                        
                        return (
                          <div key={index} style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '16px' }}>
                            <h4 style={{ color: '#3B82F6', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{index === 0 ? '🛠️' : index === 1 ? '📚' : '🚀'}</span> {title}
                            </h4>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', color: '#E8EDF5', fontSize: '13px', lineHeight: '1.8', direction: lang === 'en' ? 'ltr' : 'rtl', textAlign: lang === 'en' ? 'left' : 'right', border: '1px solid rgba(255,255,255,0.05)' }}>
                              {content.split('\n').map((line, i) => {
                                // Basic formatting for bold text
                                const formattedLine = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j} style={{ color: '#60A5FA' }}>{part.replace(/\*\*/g, '')}</strong>;
                                  }
                                  return part;
                                });
                                return <p key={i} style={{ margin: '0 0 6px 0' }}>{formattedLine}</p>;
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </div>

    </ToolDashboardLayout>
  );
}

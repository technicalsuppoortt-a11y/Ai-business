import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getSocialPresenceMatrix } from '../../../services/contentDbService';
import { SOCIAL_PLATFORMS, SOCIAL_GOALS, generateSocialStrategyText } from '../../../data/socialPresenceMatrix';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Video,
  PlaySquare,
  Briefcase,
  Globe,
  Users,
  Eye,
  Target,
  DollarSign,
  MessageCircle,
  Sparkles,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Wrench,
  BookOpen,
  Rocket,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import './SocialPresence.css';

export default function SocialPresence({ stepNumber }) {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang?.startsWith('ar');
  const [analysisMode, setAnalysisMode] = useState(savedState.mode || 'fast'); // 'fast' | 'live'
  
  // Inputs
  const [platform, setPlatform] = useState('instagram');
  const [goal, setGoal] = useState('awareness');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [matrixData, setMatrixData] = useState(null);

  const platforms = SOCIAL_PLATFORMS;
  const goals = SOCIAL_GOALS;

  // Icon mapping for platforms using Lucide icons
  const platformIconsMap = {
    instagram: { IconComp: Camera, color: '#E1306C' },
    tiktok: { IconComp: Video, color: '#EE1D52' },
    youtube: { IconComp: PlaySquare, color: '#FF0000' },
    linkedin: { IconComp: Briefcase, color: '#0A66C2' },
    x: { IconComp: Share2, color: '#38BDF8' },
    facebook: { IconComp: Globe, color: '#1877F2' }
  };

  // Icon mapping for goals
  const goalIconsMap = {
    awareness: Eye,
    leads: Target,
    sales: DollarSign,
    engagement: MessageCircle
  };

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
        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
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
        toast(lang ==='en' ?'Live AI Strategy generated!' :'تم توليد الاستراتيجية بالذكاء الاصطناعي الحي!','success');
      } else {
        await new Promise(r => setTimeout(r, 400));

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
        toast(lang ==='en' ?'Account strategy ready!' :'استراتيجية الحساب جاهزة!','success');
      }
    } catch (error) {
      console.error(error);
      toast(lang === 'en' ? 'Error generating strategy. Try again.' : 'حدث خطأ أثناء التوليد. حاول مرة أخرى.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast(lang ==='en' ?'Strategy copied to clipboard!' :'تم نسخ الاستراتيجية إلى الحافظة!','success');
  };

  const bottomSections = [
    {
      icon: <Share2 size={18} color="#3B82F6" />,
      title: lang === 'en' ? 'The Importance of Social Presence' : 'أهمية التواجد الاجتماعي',
      items: [
        lang === 'en' ? 'Social media is your virtual storefront, it must look professional from day one.' : 'السوشيال ميديا هي واجهة محلك الافتراضي، يجب أن تبدو احترافية من اليوم الأول.',
        lang === 'en' ? 'The Bio is the first thing customers see, make it clear (what you do and how it benefits them).' : 'البايو (Bio) هو أول ما يراه العميل، اجعله يوضح (ماذا تفعل وكيف تفيده).',
        lang === 'en' ? 'Do not be on every platform! Choose one or two where your target audience hangs out and focus on them.' : 'لا تكن موجوداً على كل المنصات! اختر منصة أو اثنتين يتواجد فيها جمهورك المستهدف وركز عليها.'
      ]
    },
    {
      icon: <Target size={18} color="#10B981" />,
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
      <div className="sp-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="sp-main-grid">
          
          {/* ═══════════════ INPUTS FORM PANEL ═══════════════ */}
          <div className="sp-panel">
            <div className="sp-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="sp-panel-title">
                  <span>{lang === 'en' ? 'Platform & Goal Selection' : 'اختيار المنصة والهدف'}</span>
                </h3>
                <p className="sp-panel-subtitle">
                  {lang === 'en' ? 'Select your focus social platform and primary marketing objective.' : 'اختر المنصة التي تركز عليها وهدفك التسويقي منها.'}
                </p>
              </div>
            </div>

            {/* Platform Grid */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                {lang === 'en' ? '1. Choose Target Platform' : '1. اختر المنصة المستهدفة'}
              </label>

              <div className="sp-platform-grid">
                {platforms.map(p => {
                  const platMeta = platformIconsMap[p.id] || { IconComp: Share2, color: '#3B82F6' };
                  const IconComponent = platMeta.IconComp;
                  const isActive = platform === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`sp-platform-btn ${isActive ? 'active' : ''}`}
                      style={{
                        '--plat-color': platMeta.color,
                        '--plat-bg': `${platMeta.color}20`
                      }}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeSocialPlatformHighlight" 
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: `${platMeta.color}15`,
                            border: `1px solid ${platMeta.color}`,
                            borderRadius: '14px',
                            zIndex: 0
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      
                      <div className="sp-platform-icon" style={{ zIndex: 1 }}>
                        <IconComponent size={18} />
                      </div>

                      <span style={{ fontSize: '12.5px', fontWeight: '800', zIndex: 1 }}>
                        {lang === 'en' ? p.label_en : p.label_ar}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                {lang === 'en' ? '2. Primary Goal of Presence' : '2. الهدف الأساسي من التواجد'}
              </label>

              <div className="sp-goals-list">
                {goals.map(g => {
                  const GoalIcon = goalIconsMap[g.id] || Target;
                  const isActive = goal === g.id;

                  return (
                    <div 
                      key={g.id} 
                      onClick={() => setGoal(g.id)}
                      className={`sp-goal-item ${isActive ? 'active' : ''}`}
                    >
                      <div className="sp-radio-indicator">
                        {isActive && <div className="sp-radio-inner" />}
                      </div>

                      <GoalIcon size={16} color={isActive ? '#3B82F6' : 'var(--text2, #94A3B8)'} />

                      <span style={{ fontWeight: '800', fontSize: '13px', color: isActive ? 'var(--text, #F8FAFC)' : 'var(--text2, #94A3B8)' }}>
                        {lang === 'en' ? g.label_en : g.label_ar}
                      </span>
                    </div>
                  );
                })}
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
              className="sp-generate-btn"
            >
              {isGenerating ? (
                <>
                  <span className="td-spinner" /> 
                  <span>{lang === 'en' ? 'Drafting Account Strategy...' : 'جاري رسم الاستراتيجية...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{lang === 'en' ? 'Generate Account Strategy' : 'توليد استراتيجية الحساب'}</span>
                </>
              )}
            </button>
          </div>

          {/* ═══════════════ STRATEGY OUTPUT PANEL ═══════════════ */}
          <div className="sp-panel">
            <div className="sp-panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Rocket size={20} />
                </div>
                <div>
                  <h3 className="sp-panel-title">
                    <span>{lang === 'en' ? 'Generated Account Roadmap' : 'خارطة طريق الحساب'}</span>
                  </h3>
                  <p className="sp-panel-subtitle">
                    {lang === 'en' ? 'Bio formulas, content pillars, and initial post concepts.' : 'البايو المعتمد، ركائز المحتوى، وأول 5 أفكار للبوستات.'}
                  </p>
                </div>
              </div>

              {result && !isGenerating && (
                <button onClick={handleCopy} className="sp-copy-btn" title={lang === 'en' ? 'Copy Strategy' : 'نسخ الاستراتيجية'}>
                  <Copy size={14} />
                  <span>{lang === 'en' ? 'Copy Strategy' : 'نسخ الاستراتيجية'}</span>
                </button>
              )}
            </div>

            <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
              {!result && !isGenerating ? (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <BookOpen size={28} />
                  </div>
                  <p style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text, #F8FAFC)', margin: '0 0 6px 0' }}>
                    {lang === 'en' ? 'Select platform and goal to draft your starting plan' : 'حدد المنصة والهدف لنرسم لك خطة البداية'}
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text2, #94A3B8)', margin: 0 }}>
                    {lang === 'en' ? 'Get custom Bio, Content pillars, and first 5 post ideas.' : 'احصل على بايو احترافي، ركائز محتوى، وأول 5 أفكار للبوستات.'}
                  </p>
                </div>
              ) : isGenerating ? (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div className="td-spinner" style={{ width: '42px', height: '42px', borderWidth: '4px', borderColor: 'rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6', margin: '0 auto 16px' }} />
                  <p style={{ color: '#3B82F6', fontWeight: '800', fontSize: '14px', margin: 0 }}>
                    {lang === 'en' ? 'Building custom strategy for your account...' : 'يتم الآن بناء الاستراتيجية المخصصة لحسابك...'}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    {(() => {
                      const blocks = result.split(/\n\n(?=\*\*)/);
                      const mainTitle = blocks.shift()?.replace(/### /g, '');
                      const blockIcons = [Wrench, BookOpen, Rocket, Sparkles, CheckCircle2];

                      return (
                        <>
                          {mainTitle && (
                            <div style={{ background: '#3B82F6', color: '#FFFFFF', padding: '12px 18px', borderRadius: '12px', fontWeight: '900', fontSize: '14px', textAlign: 'center', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>
                              {mainTitle}
                            </div>
                          )}

                          {blocks.map((block, index) => {
                            const lines = block.split('\n');
                            const title = lines[0].replace(/\*\*/g, '');
                            const content = lines.slice(1).join('\n');
                            const BlockIconComp = blockIcons[index % blockIcons.length];

                            return (
                              <div key={index} className="sp-strategy-block">
                                <h4 className="sp-strategy-title">
                                  <BlockIconComp size={16} />
                                  <span>{title}</span>
                                </h4>

                                <div className="sp-strategy-content">
                                  {content.split('\n').map((line, i) => {
                                    const formattedLine = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={j} style={{ color: '#3B82F6', fontWeight: 800 }}>{part.replace(/\*\*/g, '')}</strong>;
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

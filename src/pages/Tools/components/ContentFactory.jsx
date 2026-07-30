import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getContentPlan, getCanonicalNiche } from '../../../services/contentDbService';
import { generatePostContent } from '../../../services/seedPart9_contentPlans';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  HeartHandshake,
  GraduationCap,
  Globe,
  Video,
  Layers,
  FileText,
  Camera,
  Share2,
  PlaySquare,
  Zap,
  Sparkles,
  Copy,
  CheckCircle2,
  Wrench,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Layers3,
  Flame,
  ShieldCheck,
  Languages
} from 'lucide-react';
import './ContentFactory.css';

export default function ContentFactory({ stepNumber }) {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';
  
  const savedState = state.toolResults['content-factory'] || {};

  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  
  const audiences = [
    { id: 'beginners', label_ar: 'المبتدئين / الهواة', label_en: 'Beginners / Amateurs', IconComp: GraduationCap },
    { id: 'professionals', label_ar: 'المحترفين / أصحاب الأعمال', label_en: 'Professionals / Business Owners', IconComp: Briefcase },
    { id: 'parents', label_ar: 'الآباء والأمهات', label_en: 'Parents', IconComp: HeartHandshake },
    { id: 'students', label_ar: 'الطلاب / الخريجين', label_en: 'Students / Grads', IconComp: Users },
    { id: 'general', label_ar: 'الجمهور العام', label_en: 'General Audience', IconComp: Globe }
  ];

  const dialects = [
    { id: 'fusha', label_ar: 'الفصحى', label_en: 'MSA' },
    { id: 'egy', label_ar: 'المصرية', label_en: 'Egyptian' },
    { id: 'gulf', label_ar: 'الخليجية', label_en: 'Gulf' }
  ];

  const [targetAudience, setTargetAudience] = useState(savedState.targetAudience || 'general');
  const [platform, setPlatform] = useState(savedState.platform || 'instagram');
  const [contentFormat, setContentFormat] = useState(savedState.contentFormat || 'video'); // video, carousel, text
  const [selectedDialect, setSelectedDialect] = useState(savedState.selectedDialect || 'egy');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(savedState.result || '');

  const platforms = [
    { id: 'instagram', label_ar: 'إنستجرام', label_en: 'Instagram', IconComp: Camera },
    { id: 'tiktok', label_ar: 'تيك توك', label_en: 'TikTok', IconComp: Video },
    { id: 'linkedin', label_ar: 'لينكد إن', label_en: 'LinkedIn', IconComp: Briefcase },
    { id: 'twitter', label_ar: 'إكس (تويتر)', label_en: 'X (Twitter)', IconComp: Share2 },
    { id: 'facebook', label_ar: 'فيسبوك', label_en: 'Facebook', IconComp: Globe },
    { id: 'youtube', label_ar: 'يوتيوب', label_en: 'YouTube', IconComp: PlaySquare },
    { id: 'snapchat', label_ar: 'سناب شات', label_en: 'Snapchat', IconComp: Zap },
    { id: 'pinterest', label_ar: 'بينتريست', label_en: 'Pinterest', IconComp: Layers }
  ];

  const formats = [
    { id: 'video', label_ar: 'فيديو قصير (Reels/Shorts)', label_en: 'Short Video (Reels/Shorts)', IconComp: Video },
    { id: 'carousel', label_ar: 'صور متعددة (Carousel)', label_en: 'Multiple Images (Carousel)', IconComp: Layers },
    { id: 'text', label_ar: 'نص مقروء (بوست عادي)', label_en: 'Text Post (Standard)', IconComp: FileText }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');

    try {
      let dbResult = null;

      if (analysisMode === 'live') {
        dbResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
          toolId: 'content-factory',
          inputs: { targetAudience, platform, contentFormat, selectedDialect },
          context: { niche: state.niche, user: state.user },
          lang
        });
        toast(lang === 'en' ? 'Live AI Content Plan generated! ✨' : 'تم توليد خطة المحتوى بالذكاء الاصطناعي الحي! ✨', 'success');
      } else {
        await new Promise(r => setTimeout(r, 400));

        dbResult = await getContentPlan(state.niche || 'general', platform, contentFormat, targetAudience);
        
        // Fallback: If no plan is found in DB, generate one dynamically locally
        if (!dbResult || !dbResult.posts || dbResult.posts.length === 0) {
          const canonical = getCanonicalNiche(state.niche || 'general');
          dbResult = {
            id: `fallback_${canonical}_${platform}_${contentFormat}`,
            platform,
            format: contentFormat,
            niche: canonical,
            posts: [
              generatePostContent(canonical, platform, contentFormat, 'story', targetAudience),
              generatePostContent(canonical, platform, contentFormat, 'edu', targetAudience),
              generatePostContent(canonical, platform, contentFormat, 'myth', targetAudience),
              generatePostContent(canonical, platform, contentFormat, 'bts', targetAudience),
              generatePostContent(canonical, platform, contentFormat, 'proof', targetAudience),
              generatePostContent(canonical, platform, contentFormat, 'pitch', targetAudience)
            ],
            hooks: [
              { ar: "سر محدش هيقولك عليه...", en: "A secret nobody will tell you..." },
              { ar: "أكبر غلطة بتعملها...", en: "The biggest mistake you're making..." },
              { ar: "تخيل لو قلتلك...", en: "Imagine if I told you..." }
            ]
          };
        }
        toast(lang === 'en' ? 'Content plan ready! 🚀' : 'خطة المحتوى جاهزة للإنتاج! 🚀', 'success');
      }
      
      if (dbResult && dbResult.posts && dbResult.posts.length > 0) {
        setResult(dbResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'content-factory',
          data: {
            targetAudience,
            platform,
            contentFormat,
            selectedDialect,
            result: dbResult,
            mode: analysisMode
          }
        });
      } else {
        setResult(null);
        toast(lang === 'en' ? "No specific content plan found for this configuration." : "لم يتم العثور على خطة محتوى مخصصة لهذا التكوين بعد.", 'warning');
      }
    } catch (error) {
      console.error(error);
      toast(lang === 'en' ? 'Error generating ideas. Try again.' : 'حدث خطأ أثناء التوليد. حاول مرة أخرى.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result || !result.posts) return;
    let text = `## ${lang === 'en' ? 'Your Content Plan' : 'خطة المحتوى الخاصة بك'}\n\n`;
    result.posts.forEach((post, i) => {
      const title = lang === 'en' && post.title_en ? post.title_en : (post[`title_ar_${selectedDialect}`] || post.title_ar_egy || post.title_ar);
      const caption = lang === 'en' && post.caption_en ? post.caption_en : (post[`caption_ar_${selectedDialect}`] || post.caption_ar_egy || post.caption_ar);
      text += `### 📝 ${lang === 'en' ? 'Idea' : 'فكرة'} ${i + 1}: ${title}\n`;
      text += `**${lang === 'en' ? 'Caption/Script' : 'النص/السكريبت'}:**\n${caption}\n\n`;
    });
    if (result.hooks && result.hooks.length > 0) {
      text += `---\n### 🎣 ${lang === 'en' ? 'Bonus Hooks' : 'خطافات (Hooks) إضافية'}\n`;
      result.hooks.forEach(h => {
         text += `- ${lang === 'en' ? (h.en || h.ar) : (h[`ar_${selectedDialect}`] || h.ar)}\n`;
      });
    }
    navigator.clipboard.writeText(text);
    toast(lang === 'en' ? 'Content plan copied to clipboard! ✅' : 'تم نسخ خطة المحتوى إلى الحافظة! ✅', 'success');
  };

  const bottomSections = [
    {
      icon: <Lightbulb size={18} color="#14B8A6" />,
      title: lang === 'en' ? 'Content Creator Mindset' : 'عقلية صانع المحتوى',
      items: [
        lang === 'en' ? 'Consistency beats intermittent high quality. Post regularly.' : 'الاستمرارية تهزم الجودة العالية المتقطعة. انشر بشكل دوري.',
        lang === 'en' ? 'The first 3 seconds (Hook) determine the success or failure of the entire video.' : 'أول 3 ثوانٍ (الـ Hook) تحدد نجاح أو فشل الفيديو بالكامل.',
        lang === 'en' ? 'Don\'t sell in every post. Make 80% of content for value and education, and only 20% for direct sales (Pareto Principle).' : 'لا تبع في كل بوست. اجعل 80% من المحتوى للقيمة والتعليم و 20% فقط للبيع المباشر (قاعدة باريتو).'
      ]
    },
    {
      icon: <Wrench size={18} color="#F59E0B" />,
      title: lang === 'en' ? 'Production Speed Tips' : 'نصائح لسرعة الإنتاج',
      items: [
        lang === 'en' ? 'Dedicate one day a week to shoot or design the entire week\'s content (Batching).' : 'خصّص يوماً واحداً في الأسبوع لتصوير أو تصميم محتوى الأسبوع بالكامل (Batching).',
        lang === 'en' ? 'Use scheduling tools (like Meta Business Suite) to automate publishing.' : 'استخدم أدوات الجدولة (مثل Meta Business Suite) لجدولة النشر تلقائياً.',
        lang === 'en' ? 'Repurpose content: A successful video idea can become a text post (Carousel) on another day.' : 'أعد تدوير المحتوى: الفكرة الناجحة في فيديو يمكن أن تصبح بوست نصي (Carousel) في يوم آخر.'
      ]
    }
  ];

  return (
    <ToolDashboardLayout
      id="content-factory"
      title={lang === 'en' ? 'Content Factory' : 'مصنع المحتوى (Content Factory)'}
      subtitle={lang === 'en' ? 'Don\'t overthink. Get 6 strong, production-ready content ideas tailored specifically for your audience and preferred platform.' : 'لا تفكر كثيراً. احصل على 6 أفكار محتوى قوية وجاهزة للإنتاج مباشرة، مصممة خصيصاً لجمهورك ولمنصتك المفضلة.'}
      stepNumber={stepNumber}
      accentColor="#14B8A6"
      timeEstimate="60 - 120"
      bottomSections={bottomSections}
    >
      <div className="cf-container" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="cf-main-grid">
          
          {/* ═══════════════ INPUTS FORM PANEL ═══════════════ */}
          <div className="cf-panel">
            <div className="cf-panel-header">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.12)', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers3 size={20} />
              </div>
              <div>
                <h3 className="cf-panel-title">
                  <span>{lang === 'en' ? 'Content Factory Parameters' : 'معايير وإنتاج المحتوى'}</span>
                </h3>
                <p className="cf-panel-subtitle">
                  {lang === 'en' ? 'Specify target audience, platform format, and dialect.' : 'حدد الجمهور والمنصة والصيغة واللهجة لإنشاء سكريبتات فيرال.'}
                </p>
              </div>
            </div>

            {/* Target Audience */}
            <div className="cf-section-group">
              <label className="cf-section-label">
                <Users size={14} color="#14B8A6" />
                <span>{lang === 'en' ? '1. Who is your target audience?' : '1. من هو جمهورك المستهدف؟'}</span>
              </label>

              <div className="cf-option-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                {audiences.map(aud => {
                  const AudIcon = aud.IconComp;
                  const isActive = targetAudience === aud.id;
                  return (
                    <button
                      key={aud.id}
                      onClick={() => setTargetAudience(aud.id)}
                      className={`cf-option-btn ${isActive ? 'active' : ''}`}
                    >
                      <AudIcon size={15} />
                      <span>{lang === 'en' ? aud.label_en : aud.label_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dialect */}
            <div className="cf-section-group">
              <label className="cf-section-label">
                <Languages size={14} color="#14B8A6" />
                <span>{lang === 'en' ? '2. Dialect' : '2. اللهجة المستخدمة'}</span>
              </label>

              <div className="cf-option-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {dialects.map(d => {
                  const isActive = selectedDialect === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDialect(d.id)}
                      className={`cf-option-btn ${isActive ? 'active' : ''}`}
                    >
                      <span>{lang === 'en' ? d.label_en : d.label_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Platform */}
            <div className="cf-section-group">
              <label className="cf-section-label">
                <Share2 size={14} color="#14B8A6" />
                <span>{lang === 'en' ? '3. Target Platform' : '3. المنصة المستهدفة'}</span>
              </label>

              <div className="cf-option-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
                {platforms.map(p => {
                  const PlatIcon = p.IconComp;
                  const isActive = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`cf-option-btn ${isActive ? 'active' : ''}`}
                    >
                      <PlatIcon size={14} />
                      <span>{lang === 'en' ? p.label_en : p.label_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Format */}
            <div className="cf-section-group">
              <label className="cf-section-label">
                <Video size={14} color="#14B8A6" />
                <span>{lang === 'en' ? '4. Content Format' : '4. نوع المحتوى (Format)'}</span>
              </label>

              <div className="cf-option-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                {formats.map(f => {
                  const FormatIcon = f.IconComp;
                  const isActive = contentFormat === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setContentFormat(f.id)}
                      className={`cf-option-btn ${isActive ? 'active' : ''}`}
                    >
                      <FormatIcon size={16} />
                      <span>{lang === 'en' ? f.label_en : f.label_ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Mode Selector */}
            <div style={{ marginTop: '16px' }}>
              <AnalysisModeSelector 
                mode={analysisMode} 
                onChange={setAnalysisMode} 
                lang={lang} 
                accentColor="#14B8A6" 
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="cf-generate-btn"
            >
              {isGenerating ? (
                <>
                  <span className="td-spinner" /> 
                  <span>{lang === 'en' ? 'Brainstorming Content Plan...' : 'جاري العصف الذهني (AI)...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{lang === 'en' ? 'Generate 6 Strong Content Ideas' : 'توليد 6 أفكار محتوى قوية'}</span>
                </>
              )}
            </button>
          </div>

          {/* ═══════════════ AI CONTENT OUTPUT PANEL ═══════════════ */}
          <div className="cf-panel">
            <div className="cf-panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.12)', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="cf-panel-title">
                    <span>{lang === 'en' ? 'Content Plan (Week 1)' : 'خطة المحتوى (الأسبوع الأول)'}</span>
                  </h3>
                  <p className="cf-panel-subtitle">
                    {lang === 'en' ? '6 production-ready post concepts and viral scripts.' : '6 أفكار وتطبيقات جاهزة للإنتاج مباشرة.'}
                  </p>
                </div>
              </div>

              {result && !isGenerating && (
                <button onClick={handleCopy} className="sp-copy-btn" style={{ background: '#14B8A6' }} title={lang === 'en' ? 'Copy Ideas' : 'نسخ الأفكار'}>
                  <Copy size={14} />
                  <span>{lang === 'en' ? 'Copy Ideas' : 'نسخ الأفكار'}</span>
                </button>
              )}
            </div>

            <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
              {!result && !isGenerating ? (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Layers size={28} />
                  </div>
                  <p style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text, #F8FAFC)', margin: '0 0 6px 0' }}>
                    {lang === 'en' ? 'Select your parameters to generate the week\'s ideas' : 'حدد جمهورك ومنصتك لنولد لك أفكار الأسبوع'}
                  </p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text2, #94A3B8)', margin: 0 }}>
                    {lang === 'en' ? 'Diverse ideas engineered to rank on algorithms.' : 'أفكار متنوعة تناسب الخوارزميات وتجذب العملاء.'}
                  </p>
                </div>
              ) : isGenerating ? (
                <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 20px' }}>
                  <div className="td-spinner" style={{ width: '42px', height: '42px', borderWidth: '4px', borderColor: 'rgba(20, 184, 166, 0.2)', borderTopColor: '#14B8A6', margin: '0 auto 16px' }} />
                  <p style={{ color: '#14B8A6', fontWeight: '800', fontSize: '14px', margin: 0 }}>
                    {lang === 'en' ? 'Designing viral content tailored to your niche...' : 'يتم الآن تصميم محتوى فيرال مخصص لنيشك...'}
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
                    {result.posts && result.posts.map((post, index) => (
                      <div key={index} className="cf-post-card">
                        <h4 className="cf-post-title">
                          <Sparkles size={16} />
                          <span>
                            {lang === 'en' ? `Idea ${index + 1}` : `فكرة ${index + 1}`}: {lang === 'en' && post.title_en ? post.title_en : (post[`title_ar_${selectedDialect}`] || post.title_ar_egy || post.title_ar)}
                          </span>
                        </h4>

                        <div className="cf-post-content">
                          {lang === 'en' && post.caption_en ? post.caption_en : (post[`caption_ar_${selectedDialect}`] || post.caption_ar_egy || post.caption_ar)}
                        </div>
                      </div>
                    ))}
                    
                    {result.hooks && result.hooks.length > 0 && (
                      <div className="cf-hooks-box">
                        <h4 style={{ color: '#F43F5E', fontSize: '14px', margin: '0 0 10px 0', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Flame size={16} />
                          <span>{lang === 'en' ? 'Bonus Viral Hooks' : 'خطافات إضافية (Bonus Hooks)'}</span>
                        </h4>

                        <ul style={{ paddingInlineStart: '20px', color: 'var(--text, #F8FAFC)', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                          {result.hooks.map((h, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>
                              {lang === 'en' ? (h.en || h.ar) : (h[`ar_${selectedDialect}`] || h.ar)}
                            </li>
                          ))}
                        </ul>
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

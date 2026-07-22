import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getContentPlan, getCanonicalNiche } from '../../../services/contentDbService';
import { generatePostContent } from '../../../services/seedPart9_contentPlans';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function ContentFactory({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  
  const savedState = state.toolResults['content-factory'] || {};

  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  
  const audiences = [
    { id: 'beginners', label_ar: 'المبتدئين / الهواة', label_en: 'Beginners / Amateurs' },
    { id: 'professionals', label_ar: 'المحترفين / أصحاب الأعمال', label_en: 'Professionals / Business Owners' },
    { id: 'parents', label_ar: 'الآباء والأمهات', label_en: 'Parents' },
    { id: 'students', label_ar: 'الطلاب / الخريجين', label_en: 'Students / Grads' },
    { id: 'general', label_ar: 'الجمهور العام', label_en: 'General Audience' }
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
    { id: 'instagram', label_ar: 'إنستجرام', label_en: 'Instagram' },
    { id: 'tiktok', label_ar: 'تيك توك', label_en: 'TikTok' },
    { id: 'linkedin', label_ar: 'لينكد إن', label_en: 'LinkedIn' },
    { id: 'twitter', label_ar: 'إكس (تويتر)', label_en: 'X (Twitter)' },
    { id: 'facebook', label_ar: 'فيسبوك', label_en: 'Facebook' },
    { id: 'youtube', label_ar: 'يوتيوب', label_en: 'YouTube' },
    { id: 'snapchat', label_ar: 'سناب شات', label_en: 'Snapchat' },
    { id: 'pinterest', label_ar: 'بينتريست', label_en: 'Pinterest' }
  ];

  const formats = [
    { id: 'video', label_ar: 'فيديو قصير (Reels/Shorts)', label_en: 'Short Video (Reels/Shorts)', icon: '📱' },
    { id: 'carousel', label_ar: 'صور متعددة (Carousel)', label_en: 'Multiple Images (Carousel)', icon: '🖼️' },
    { id: 'text', label_ar: 'نص مقروء (بوست عادي)', label_en: 'Text Post (Standard)', icon: '📝' }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');

    try {
      let dbResult = null;

      if (analysisMode === 'live') {
        dbResult = await dispatchLiveAiAnalysis({
          toolId: 'content-factory',
          inputs: { targetAudience, platform, contentFormat, selectedDialect },
          context: { niche: state.niche, user: state.user },
          lang
        });
      } else {
        await new Promise(r => setTimeout(r, 600));

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
        alert(lang === 'en' ? "No specific content plan found for this platform/format yet." : "لم يتم العثور على خطة محتوى مخصصة لهذه المنصة/النوع بعد.");
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error generating ideas. Try again.' : 'حدث خطأ أثناء التوليد. حاول مرة أخرى.');
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
         text += `- ${lang === 'en' ? h.en : h[`ar_${selectedDialect}`]}\n`;
      });
    }
    navigator.clipboard.writeText(text);
    alert(lang === 'en' ? 'Copied successfully!' : 'تم النسخ بنجاح!');
  };

  const bottomSections = [
    {
      icon: '🧠',
      title: lang === 'en' ? 'Content Creator Mindset' : 'عقلية صانع المحتوى',
      items: [
        lang === 'en' ? 'Consistency beats intermittent high quality. Post regularly.' : 'الاستمرارية تهزم الجودة العالية المتقطعة. انشر بشكل دوري.',
        lang === 'en' ? 'The first 3 seconds (Hook) determine the success or failure of the entire video.' : 'أول 3 ثوانٍ (الـ Hook) تحدد نجاح أو فشل الفيديو بالكامل.',
        lang === 'en' ? 'Don\'t sell in every post. Make 80% of content for value and education, and only 20% for direct sales (Pareto Principle).' : 'لا تبع في كل بوست. اجعل 80% من المحتوى للقيمة والتعليم و 20% فقط للبيع المباشر (قاعدة باريتو).'
      ]
    },
    {
      icon: '⚙️',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(20, 184, 166, 0.2)', background: 'rgba(20, 184, 166, 0.05)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Who is your target audience?' : 'من هو جمهورك المستهدف؟'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {audiences.map(aud => (
                <button
                  key={aud.id}
                  onClick={() => setTargetAudience(aud.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: targetAudience === aud.id ? 'rgba(20, 184, 166, 0.2)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${targetAudience === aud.id ? '#14B8A6' : 'rgba(255,255,255,0.05)'}`,
                    color: targetAudience === aud.id ? '#fff' : '#8B96A8',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  {lang === 'en' ? aud.label_en : aud.label_ar}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Dialect' : 'اللهجة'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {dialects.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDialect(d.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: selectedDialect === d.id ? 'rgba(20, 184, 166, 0.2)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${selectedDialect === d.id ? '#14B8A6' : 'rgba(255,255,255,0.05)'}`,
                    color: selectedDialect === d.id ? '#fff' : '#8B96A8',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  {lang === 'en' ? d.label_en : d.label_ar}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {lang === 'en' ? 'Target Platform' : 'المنصة المستهدفة'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: platform === p.id ? 'rgba(20, 184, 166, 0.2)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${platform === p.id ? '#14B8A6' : 'rgba(255,255,255,0.05)'}`,
                    color: platform === p.id ? '#fff' : '#8B96A8',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {lang === 'en' ? p.label_en : p.label_ar}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {lang === 'en' ? 'Content Format' : 'نوع المحتوى (Format)'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {formats.map(f => (
                <label key={f.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: contentFormat === f.id ? 'rgba(20, 184, 166, 0.2)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${contentFormat === f.id ? '#14B8A6' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}>
                  <input 
                    type="radio" 
                    name="format" 
                    value={f.id}
                    checked={contentFormat === f.id}
                    onChange={() => setContentFormat(f.id)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '18px' }}>{f.icon}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: contentFormat === f.id ? '#fff' : '#8B96A8' }}>
                    {lang === 'en' ? f.label_en : f.label_ar}
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
            accentColor="#14B8A6" 
          />

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="td-btn-primary"
            style={{ 
              background: isGenerating ? 'rgba(20, 184, 166, 0.2)' : '#14B8A6',
              color: isGenerating ? '#8B96A8' : '#fff'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" /> {lang === 'en' ? 'Brainstorming (AI)...' : 'جاري العصف الذهني (AI)...'}
              </span>
            ) : (
              <span>✨ {lang === 'en' ? 'Generate 6 Strong Content Ideas' : 'توليد 6 أفكار محتوى قوية'}</span>
            )}
          </button>
        </div>

        {/* ═══════════════ AI OUTPUT ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#14B8A6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📝</span> {lang === 'en' ? 'Content Plan (Week 1)' : 'خطة المحتوى (الأسبوع الأول)'}
            </h3>
            {result && !isGenerating && (
              <button 
                onClick={handleCopy}
                style={{ background: '#14B8A6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 {lang === 'en' ? 'Copy Ideas' : 'نسخ الأفكار'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: result && !isGenerating ? 'flex-start' : 'center', justifyContent: result && !isGenerating ? 'flex-start' : 'center' }}>
            {!result && !isGenerating ? (
              <div style={{ textAlign: 'center', opacity: 0.4 }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🖼️</span>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E8EDF5' }}>
                  {lang === 'en' ? 'Select your audience and platform to generate the week\'s ideas' : 'حدد جمهورك ومنصتك لنولد لك أفكار الأسبوع'}
                </p>
                <p style={{ fontSize: '12px', color: '#8B96A8', marginTop: '8px' }}>
                  {lang === 'en' ? 'Diverse ideas that suit algorithms and attract customers.' : 'أفكار متنوعة تناسب الخوارزميات وتجذب العملاء.'}
                </p>
              </div>
            ) : isGenerating ? (
               <div style={{ textAlign: 'center' }}>
                 <div className="td-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(20, 184, 166, 0.2)', borderTopColor: '#14B8A6', marginBottom: '16px' }}></div>
                 <p style={{ color: '#14B8A6', fontWeight: 'bold', fontSize: '14px' }}>
                   {lang === 'en' ? 'Designing viral content tailored to your niche...' : 'يتم الآن تصميم محتوى فيرال مخصص لنيشك...'}
                 </p>
               </div>
            ) : (
             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {result.posts && result.posts.map((post, index) => (
                 <div key={index} style={{ background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '12px', padding: '16px' }}>
                   <h4 style={{ color: '#14B8A6', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>
                     💡 {lang === 'en' ? `Idea ${index + 1}` : `فكرة ${index + 1}`}: {lang === 'en' && post.title_en ? post.title_en : (post[`title_ar_${selectedDialect}`] || post.title_ar_egy || post.title_ar)}
                   </h4>
                   <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', color: '#E8EDF5', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.05)' }}>
                     {lang === 'en' && post.caption_en ? post.caption_en : (post[`caption_ar_${selectedDialect}`] || post.caption_ar_egy || post.caption_ar)}
                   </div>
                 </div>
               ))}
               
               {result.hooks && result.hooks.length > 0 && (
                 <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
                   <h4 style={{ color: '#F43F5E', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>
                     🎣 {lang === 'en' ? 'Bonus Hooks' : 'خطافات إضافية (Hooks)'}
                   </h4>
                   <ul style={{ paddingInlineStart: '20px', color: '#E8EDF5', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                     {result.hooks.map((h, i) => (
                       <li key={i} style={{ marginBottom: '6px' }}>{lang === 'en' ? (h.en || h.ar) : h.ar}</li>
                     ))}
                   </ul>
                 </div>
               )}
             </div>
            )}
          </div>
        </div>

      </div>

    </ToolDashboardLayout>
  );
}

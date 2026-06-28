import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getHeyGenScriptTemplate } from '../../../services/contentDbService';
import { parseTemplate } from '../../../utils/templateParser';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function HeyGenGuide({ stepNumber }) {
  const { state } = useApp();
  const lang = state.language || 'ar';
  
  const [videoGoal, setVideoGoal] = useState('welcome'); // welcome, explainer, sales
  const [videoDuration, setVideoDuration] = useState('short'); // short, long
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  const goals = [
    { id: 'welcome', label_ar: 'فيديو ترحيبي للصفحة الرئيسية', label_en: 'Homepage Welcome Video' },
    { id: 'explainer', label_ar: 'شرح المنتج / الخدمة', label_en: 'Product / Service Explainer' },
    { id: 'sales', label_ar: 'فيديو إعلاني (للإعلانات الممولة)', label_en: 'Promo Video (For Paid Ads)' }
  ];

  const durations = [
    { id: 'short', label_ar: 'قصير (أقل من 30 ثانية)', label_en: 'Short (Under 30 seconds)' },
    { id: 'long', label_ar: 'طويل (دقيقة فأكثر)', label_en: 'Long (1 minute or more)' }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');

    try {
      await new Promise(r => setTimeout(r, 400));
      
      const brandName = state.brandName || (lang === 'en' ? 'Our Brand' : 'براندي');
      const niche = state.subNiche || state.niche || (lang === 'en' ? 'our services' : 'خدماتنا');

      const templateData = await getHeyGenScriptTemplate(videoGoal, videoDuration);
      if (templateData && templateData[lang]) {
        const text = parseTemplate(templateData[lang], { brandName, niche });
        setResult(text);
      } else {
        setResult(lang === 'en' ? 'Template not found.' : 'لم يتم العثور على القالب.');
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'en' ? 'Error generating script. Try again.' : 'حدث خطأ أثناء التوليد. حاول مرة أخرى.');
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
      icon: '🗣️',
      title: lang === 'en' ? 'Why AI Avatars?' : 'لماذا الـ AI Avatars؟',
      items: [
        lang === 'en' ? 'They allow you to produce professional videos without needing a camera, lighting, or even showing up yourself.' : 'تجعلك تنتج فيديوهات احترافية بدون الحاجة لكاميرا، إضاءة، أو حتى الظهور بنفسك.',
        lang === 'en' ? 'You can edit the script and update the video in minutes with the exact same character and background.' : 'يمكنك تعديل السكربت وتحديث الفيديو في دقائق وبنفس الشخصية والخلفية.',
        lang === 'en' ? 'They support multiple languages and accents to reach a global audience.' : 'تدعم لغات متعددة بلهجات مختلفة للوصول لجمهور عالمي.'
      ]
    },
    {
      icon: '🎬',
      title: lang === 'en' ? 'Tips for Using HeyGen' : 'نصائح لاستخدام HeyGen',
      items: [
        lang === 'en' ? 'Choose an Avatar that looks like your target audience to increase familiarity and trust.' : 'اختر شخصية (Avatar) تشبه جمهورك المستهدف لزيادة الألفة والثقة.',
        lang === 'en' ? 'Write the script in simple, spoken language, avoiding overly long sentences so it sounds natural.' : 'اكتب السكربت بلغة بسيطة ومحكية، وتجنب الجمل الطويلة جداً لتبدو طبيعية أكثر.',
        lang === 'en' ? 'Use gestures if the tool supports them to add life to the video.' : 'استخدم حركات اليد (Gestures) إذا كانت الأداة تدعمها لإضافة حيوية للفيديو.'
      ]
    }
  ];

  return (
    <ToolDashboardLayout
      id="heygen-guide"
      title={lang === 'en' ? 'AI Avatar Presenter' : 'المتحدث الافتراضي (AI Avatar)'}
      subtitle={lang === 'en' ? 'Write a professional script for an AI presenter (like HeyGen) to read in your marketing videos.' : 'اكتب سكربت احترافي ليقرأه متحدث ذكاء اصطناعي (مثل HeyGen) في فيديوهاتك التسويقية.'}
      stepNumber={stepNumber}
      accentColor="#8B5CF6"
      timeEstimate="30 - 60"
      bottomSections={bottomSections}
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(139, 92, 246, 0.2)', background: 'rgba(139, 92, 246, 0.05)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {lang === 'en' ? 'Video Goal' : 'الهدف من الفيديو'}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {goals.map(g => (
                <label key={g.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: videoGoal === g.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${videoGoal === g.id ? '#8B5CF6' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexDirection: lang === 'en' ? 'row' : 'row'
                }}>
                  <input 
                    type="radio" 
                    name="videoGoal" 
                    value={g.id}
                    checked={videoGoal === g.id}
                    onChange={() => setVideoGoal(g.id)}
                    style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                  />
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: videoGoal === g.id ? '#fff' : '#8B96A8' }}>
                    {lang === 'en' ? g.label_en : g.label_ar}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {lang === 'en' ? 'Video Duration' : 'مدة الفيديو'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {durations.map(d => (
                <button
                  key={d.id}
                  onClick={() => setVideoDuration(d.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: videoDuration === d.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${videoDuration === d.id ? '#8B5CF6' : 'rgba(255,255,255,0.05)'}`,
                    color: videoDuration === d.id ? '#fff' : '#8B96A8',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {lang === 'en' ? d.label_en : d.label_ar}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="td-btn-primary"
            style={{ 
              background: isGenerating ? 'rgba(139, 92, 246, 0.2)' : '#8B5CF6',
              color: isGenerating ? '#8B96A8' : '#fff'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" /> {lang === 'en' ? 'Generating (AI)...' : 'جاري التوليد (AI)...'}
              </span>
            ) : (
              <span>✨ {lang === 'en' ? 'Write Script for Presenter' : 'كتابة السكربت للمتحدث'}</span>
            )}
          </button>
        </div>

        {/* ═══════════════ AI OUTPUT ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗣️</span> {lang === 'en' ? 'Ready Script' : 'السكربت الجاهز'}
            </h3>
            {result && !isGenerating && (
              <button 
                onClick={handleCopy}
                style={{ background: '#8B5CF6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 {lang === 'en' ? 'Copy Script' : 'نسخ السكربت'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: result && !isGenerating ? 'flex-start' : 'center', justifyContent: result && !isGenerating ? 'flex-start' : 'center' }}>
            {!result && !isGenerating ? (
              <div style={{ textAlign: 'center', opacity: 0.4 }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎬</span>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E8EDF5' }}>
                  {lang === 'en' ? 'Select goal and duration to generate the video script' : 'حدد الهدف والمدة لإنشاء سكربت الفيديو'}
                </p>
                <p style={{ fontSize: '12px', color: '#8B96A8', marginTop: '8px' }}>
                  {lang === 'en' ? 'Ready to copy into voice generation or Avatar platforms.' : 'جاهز للنسخ إلى منصات التوليد الصوتي أو الـ Avatars.'}
                </p>
              </div>
            ) : isGenerating ? (
               <div style={{ textAlign: 'center' }}>
                 <div className="td-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(139, 92, 246, 0.2)', borderTopColor: '#8B5CF6', marginBottom: '16px' }}></div>
                 <p style={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: '14px' }}>
                   {lang === 'en' ? 'Writing professional script...' : 'يتم الآن كتابة السيناريو الاحترافي...'}
                 </p>
               </div>
            ) : (
              <div className="td-raw-output" style={{ margin: 0, width: '100%', borderTop: '3px solid #8B5CF6' }}>
                <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.9', direction: lang === 'en' ? 'ltr' : 'rtl', textAlign: lang === 'en' ? 'left' : 'right' }}>
                  {result.split('\n').map((line, i) => (
                    <p key={i} style={{ marginBottom: '8px' }}>{line.replace(/\*/g, '')}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </ToolDashboardLayout>
  );
}

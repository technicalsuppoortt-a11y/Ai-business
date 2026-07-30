import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getChatbotScriptTemplate } from '../../../services/contentDbService';
import { parseTemplate } from '../../../utils/templateParser';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function ChatbotSetup({ stepNumber }) {
  const toast = useToast();
  const { state } = useApp();
  const lang = state.language || 'ar';
  
  // Inputs
  const [tone, setTone] = useState('friendly'); // friendly, professional, humorous
  const [mainOffer, setMainOffer] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  const tones = [
    { id: 'friendly', label_ar: 'ودود ومرحاب', label_en: 'Friendly & Welcoming', icon: '😊' },
    { id: 'professional', label_ar: 'رسمي واحترافي', label_en: 'Formal & Professional', icon: '👔' },
    { id: 'humorous', label_ar: 'طريف وخفيف', label_en: 'Humorous & Light', icon: '😄' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');

    try {
      await new Promise(r => setTimeout(r, 400));
      
      const brandName = state.brandName || (lang === 'en' ? 'Our Brand' : 'براندي');
      const offer = mainOffer || (lang === 'en' ? 'our services' : 'خدماتنا');

      const templateData = await getChatbotScriptTemplate(tone);
      if (templateData && templateData[lang]) {
        const text = parseTemplate(templateData[lang], { brandName, offer });
        setResult(text);
      } else {
        setResult(lang === 'en' ? 'Template not found.' : 'لم يتم العثور على القالب.');
      }
    } catch (error) {
      console.error(error);
      if (error?.message === 'OUT_OF_CREDITS' || error?.message?.includes('OUT_OF_CREDITS')) {
        toast(lang === 'en' ? 'Monthly Credits Exhausted. Please add your Personal API Key in Settings.' : 'لقد نفد رصيدك الشهري. يرجى إضافة مفتاح الـ API الخاص بك في الإعدادات.', 'error');
      } else {
        toast(lang === 'en' ? 'Error generating AI response.' : 'حدث خطأ أثناء التوليد.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert(lang === 'en' ? 'Copied successfully!' : 'تم النسخ بنجاح!');
  };

  return (
    <ToolDashboardLayout
      id="chatbot-setup"
      title={lang === 'en' ? 'Chatbot Training (AI Bot)' : 'تدريب الشات بوت (AI Bot)'}
      subtitle={lang === 'en' ? "Don't keep your customer waiting. Use AI to write welcome messages and automated FAQ replies matching your brand's personality." : "لا تترك عميلك ينتظر. استخدم الذكاء الاصطناعي لكتابة رسائل ترحيب وردود آلية للأسئلة الشائعة تناسب شخصية براندك."}
      stepNumber={stepNumber}
      accentColor="#8B5CF6"
      timeEstimate="15 - 20"
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(139, 92, 246, 0.2)', background: 'rgba(139, 92, 246, 0.05)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'What is the main product or offer?' : 'ما هو المنتج أو العرض الأساسي؟'}
            </label>
            <input 
              type="text" 
              className="td-input"
              value={mainOffer}
              onChange={(e) => setMainOffer(e.target.value)}
              placeholder={lang === 'en' ? 'e.g., Marketing consulting or clothing store' : 'مثال: استشارات تسويقية أو متجر ملابس'}
              style={{ borderColor: mainOffer ? '#8B5CF6' : 'rgba(255, 255, 255, 0.08)' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {lang === 'en' ? 'Chatbot Personality (Tone of Voice)' : 'شخصية الشات بوت (نبرة الصوت)'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {tones.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  style={{
                    background: tone === t.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${tone === t.id ? '#8B5CF6' : 'rgba(255,255,255,0.05)'}`,
                    color: tone === t.id ? '#fff' : '#8B96A8',
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{t.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                    {lang === 'en' ? t.label_en : t.label_ar}
                  </span>
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
                <span className="td-spinner" /> {lang === 'en' ? 'Programming chatbot...' : 'جاري برمجة الشات بوت...'}
              </span>
            ) : (
              <span>✨ {lang === 'en' ? 'Generate Chatbot Scenarios' : 'توليد سيناريوهات الشات بوت'}</span>
            )}
          </button>
        </div>

        {/* ═══════════════ AI OUTPUT ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', background: 'rgba(13, 18, 32, 0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🤖</span> {lang === 'en' ? 'Ready Chatbot Scripts' : 'نصوص الشات بوت الجاهزة'}
            </h3>
            {result && !isGenerating && (
              <button 
                onClick={handleCopy}
                style={{ background: '#8B5CF6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 {lang === 'en' ? 'Copy Scripts' : 'نسخ النصوص'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: result && !isGenerating ? 'flex-start' : 'center', justifyContent: result && !isGenerating ? 'flex-start' : 'center' }}>
            {!result && !isGenerating ? (
              <div style={{ textAlign: 'center', opacity: 0.4 }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🤖</span>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E8EDF5' }}>
                  {lang === 'en' ? 'Select tone of voice and we will write bot replies for you' : 'حدد نبرة الصوت وسنقوم بكتابة ردود البوت لك'}
                </p>
                <p style={{ fontSize: '12px', color: '#8B96A8', marginTop: '8px' }}>
                  {lang === 'en' ? 'Ready to copy and paste into your chatbot tool.' : 'جاهزة للنسخ واللصق في أداة الشات بوت الخاصة بك.'}
                </p>
              </div>
            ) : isGenerating ? (
               <div style={{ textAlign: 'center' }}>
                 <div className="td-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(139, 92, 246, 0.2)', borderTopColor: '#8B5CF6', marginBottom: '16px' }}></div>
                 <p style={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: '14px' }}>
                   {lang === 'en' ? 'Building conversation flow and auto replies...' : 'يتم الآن بناء تدفق المحادثة والردود الآلية...'}
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
                         <div style={{ background: '#8B5CF6', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>
                           {mainTitle}
                         </div>
                      )}
                      {blocks.map((block, index) => {
                        const lines = block.split('\n');
                        const title = lines[0].replace(/\*\*/g, '');
                        const content = lines.slice(1).join('\n');
                        
                        // Check if it's a Q&A block
                        const isQA = title.startsWith('Q') || title.startsWith('س');
                        
                        return (
                          <div key={index} style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '16px' }}>
                            <h4 style={{ color: '#8B5CF6', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{isQA ? '❓' : index === 0 ? '👋' : '💬'}</span> {title}
                            </h4>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', color: '#E8EDF5', fontSize: '13px', lineHeight: '1.8', direction: lang === 'en' ? 'ltr' : 'rtl', textAlign: lang === 'en' ? 'left' : 'right', border: '1px solid rgba(255,255,255,0.05)' }}>
                              {content.split('\n').map((line, i) => {
                                // Basic formatting for bold and italic text
                                const formattedLine = line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j} style={{ color: '#C4B5FD' }}>{part.replace(/\*\*/g, '')}</strong>;
                                  }
                                  if (part.startsWith('*') && part.endsWith('*')) {
                                    return <em key={j} style={{ color: '#A78BFA' }}>{part.replace(/\*/g, '')}</em>;
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

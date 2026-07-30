import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getEmailSeqStructure, getEmailSeqTemplate } from '../../../services/contentDbService';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function EmailAutomation({ stepNumber }) {
  const toast = useToast();
  const { state } = useApp();
  const lang = state.language || 'ar';

  const [structure, setStructure] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getEmailSeqStructure();
      if (data) {
        setStructure(data);
        if (data.goals?.length) setSelectedGoal(data.goals[0].id);
        if (data.audiences?.length) setSelectedAudience(data.audiences[0].id);
        if (data.tones?.length) setSelectedTone(data.tones[0].id);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);
    try {
      await new Promise(r => setTimeout(r, 600));
      const dbResult = await getEmailSeqTemplate(selectedGoal, selectedAudience, selectedTone);
      if (dbResult && dbResult.content) {
        setResult(dbResult.content);
      } else {
        setResult({ error: lang === 'en' ? 'Template not found.' : 'لم يتم العثور على قالب لهذا التكوين. يرجى رفع البيانات.' });
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

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'en' ? 'Copied!' : 'تم النسخ!');
  };

  const renderSelector = (title, items, selectedId, setId) => {
    if (!items) return null;
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#8B5CF6', marginBottom: '12px' }}>{title}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {items.map(item => (
            <button key={item.id} onClick={() => setId(item.id)} style={{
              background: selectedId === item.id ? 'rgba(139,92,246,0.15)' : 'rgba(13,18,32,0.6)',
              border: `1px solid ${selectedId === item.id ? '#8B5CF6' : 'rgba(255,255,255,0.05)'}`,
              color: selectedId === item.id ? '#F0F4FC' : '#8B96A8',
              padding: '12px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              boxShadow: selectedId === item.id ? '0 4px 12px rgba(139,92,246,0.1)' : 'none',
            }}>
              {lang === 'en' ? item.name_en : item.name_ar}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const emailColors = ['#8B5CF6', '#10B981', '#F59E0B'];
  const emailIcons = ['📧', '📨', '📩'];
  const emailLabels = [
    lang === 'en' ? 'Email 1 — The Opening' : 'الإيميل الأول — الافتتاح',
    lang === 'en' ? 'Email 2 — Value & Proof' : 'الإيميل الثاني — القيمة والإثبات',
    lang === 'en' ? 'Email 3 — The Close' : 'الإيميل الثالث — الإغلاق والبيع',
  ];

  const bottomSections = [
    {
      icon: '📧',
      title: lang === 'en' ? 'The Power of Email Marketing' : 'قوة الإيميل ماركتنج',
      items: [
        lang === 'en' ? 'Your email list is the only asset you own 100%.' : 'قائمة الإيميلات هي الأصل الوحيد الذي تملكه 100%.',
        lang === 'en' ? 'Email ROI is the highest of any marketing channel.' : 'العائد على الاستثمار (ROI) للإيميل هو الأعلى.',
        lang === 'en' ? 'Build it once and it works for years (Automation).' : 'ابنها مرة واحدة وتعمل لك سنوات (Automation).',
      ]
    },
  ];

  return (
    <ToolDashboardLayout
      id="email-automation"
      title={lang === 'en' ? 'Email Sequence Matrix' : 'مصفوفة أتمتة الإيميلات'}
      subtitle={lang === 'en' ? 'Generate a 3-email sequence tailored to your goal, audience type, and tone. Ready to paste into Mailchimp or Klaviyo.' : 'ولّد سلسلة 3 إيميلات مصممة حسب هدفك، نوع جمهورك، ونبرة صوتك. جاهزة للنسخ في Mailchimp أو Klaviyo.'}
      stepNumber={stepNumber}
      accentColor="#8B5CF6"
      timeEstimate="40 - 80"
      bottomSections={bottomSections}
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px', alignItems: 'start' }}>

        {/* INPUTS */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.05)' }}>
          {structure ? (
            <>
              {renderSelector(lang === 'en' ? '1. Email Goal' : '1. هدف السلسلة', structure.goals, selectedGoal, setSelectedGoal)}
              {renderSelector(lang === 'en' ? '2. Audience Type' : '2. نوع الجمهور', structure.audiences, selectedAudience, setSelectedAudience)}
              {renderSelector(lang === 'en' ? '3. Tone of Voice' : '3. نبرة الصوت', structure.tones, selectedTone, setSelectedTone)}
            </>
          ) : (
            <div style={{ color: '#8B96A8', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
              {lang === 'en' ? 'Loading...' : 'جاري تحميل الهيكل...'}
            </div>
          )}
          <button onClick={handleGenerate} disabled={isGenerating || !structure} className="td-btn-primary"
            style={{ background: isGenerating ? 'rgba(139,92,246,0.2)' : '#8B5CF6', color: isGenerating ? '#8B96A8' : '#fff', marginTop: '16px', width: '100%' }}>
            {isGenerating
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><span className="td-spinner" /> {lang === 'en' ? 'Generating...' : 'جاري التوليد...'}</span>
              : <span>✨ {lang === 'en' ? 'Generate 3-Email Sequence' : 'توليد سلسلة 3 إيميلات'}</span>}
          </button>
        </div>

        {/* OUTPUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!result && (
            <div className="td-info-panel" style={{ margin: 0, background: 'rgba(13,18,32,0.6)', borderStyle: 'dashed', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>📧</div>
              <p style={{ color: '#8B96A8', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {lang === 'en' ? 'Select your parameters and generate a complete email sequence.' : 'حدد المعطيات واضغط توليد للحصول على سلسلة إيميلات كاملة.'}
              </p>
            </div>
          )}

          {result && result.error && (
            <div className="td-raw-output" style={{ borderTop: '3px solid #EF4444' }}>{result.error}</div>
          )}

          {result && !result.error && result.emails && result.emails.map((email, i) => (
            <div key={i} className="td-info-panel" style={{ margin: 0, borderLeft: `4px solid ${emailColors[i]}`, background: 'rgba(13,18,32,0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ color: emailColors[i], fontSize: '15px', fontWeight: 900, margin: 0 }}>
                  {emailIcons[i]} {emailLabels[i]}
                </h4>
                <button onClick={() => copyText(`Subject: ${lang === 'en' && email.subject_en ? email.subject_en : email.subject_ar}\n\n${lang === 'en' && email.body_en ? email.body_en : email.body_ar}`)} style={{ background: 'none', border: 'none', color: '#8B96A8', cursor: 'pointer', fontSize: '16px' }}>📋</button>
              </div>

              {/* Timing badge */}
              <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', color: emailColors[i], fontWeight: 800, marginBottom: '12px', border: `1px solid ${emailColors[i]}30` }}>
                ⏰ {lang === 'en' && email.send_timing_en ? email.send_timing_en : (email.send_timing_ar || email.send_timing)}
              </div>

              {/* Subject */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: '#8B96A8', fontWeight: 800 }}>{lang === 'en' ? 'Subject:' : 'الموضوع:'}</span>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#F0F4FC', marginTop: '4px' }}>
                  {lang === 'en' && email.subject_en ? email.subject_en : email.subject_ar}
                </div>
              </div>

              {/* Body */}
              <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                {lang === 'en' && email.body_en ? email.body_en : email.body_ar}
              </div>
            </div>
          ))}

          {/* Tips */}
          {result && !result.error && (lang === 'en' && result.tips_en ? result.tips_en : (result.tips_ar || result.tips)) && (
            <div className="td-info-panel" style={{ margin: 0, background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.2)' }}>
              <h4 style={{ color: '#8B5CF6', fontSize: '14px', fontWeight: 900, margin: '0 0 12px' }}>
                💡 {lang === 'en' ? 'Pro Tips' : 'نصائح احترافية'}
              </h4>
              {(lang === 'en' && result.tips_en ? result.tips_en : (result.tips_ar || result.tips)).map((tip, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#8B96A8', lineHeight: 1.7, marginBottom: '8px' }}>{tip}</div>
              ))}
            </div>
          )}
        </div>

      </div>

    </ToolDashboardLayout>
  );
}

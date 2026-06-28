import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getFreelanceAIStructure, getFreelanceAITemplate } from '../../../services/contentDbService';
import ToolDashboardLayout from './ToolDashboardLayout';

export default function SmartAIAssistant({ stepNumber }) {
  const { state } = useApp();
  const lang = state.language || 'ar';
  
  const [structure, setStructure] = useState(null);
  
  // Selection states
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadStructure = async () => {
      const data = await getFreelanceAIStructure();
      if (data) {
        setStructure(data);
        // Default selections
        if (data.goals?.length) setSelectedGoal(data.goals[0].id);
        if (data.channels?.length) setSelectedChannel(data.channels[0].id);
        if (data.clients?.length) setSelectedClient(data.clients[0].id);
        if (data.tones?.length) setSelectedTone(data.tones[0].id);
      }
    };
    loadStructure();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      await new Promise(r => setTimeout(r, 600)); // Visual delay
      const dbResult = await getFreelanceAITemplate(selectedGoal, selectedChannel, selectedClient, selectedTone);
      
      if (dbResult && dbResult.content) {
        setResult(dbResult.content);
      } else {
        setResult({ error: lang === 'en' ? 'Template not found for this combination.' : 'لم يتم العثور على قالب لهذا التكوين.' });
      }
    } catch (error) {
      console.error('Generation Error:', error);
      alert(lang === 'en' ? 'Error generating content. Please seed the database.' : 'حدث خطأ أثناء التوليد. الرجاء رفع البيانات أولاً.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'en' ? 'Copied successfully!' : 'تم النسخ بنجاح!');
  };

  const bottomSections = [
    {
      icon: '🧠',
      title: lang === 'en' ? 'AI Prompting Tips' : 'نصائح للتعامل مع الذكاء الاصطناعي',
      items: [
        lang === 'en' ? 'Be highly specific: AI loves context. The more details you provide, the better the result.' : 'كن دقيقاً: الذكاء الاصطناعي يعشق السياق. الاستراتيجية المخصصة دائماً تتفوق على العامة.',
        lang === 'en' ? 'Do not copy blindly: Always add your human touch to the generated text.' : 'لا تنسخ بشكل أعمى: أضف دائماً لمستك الإنسانية وأسماء عملائك الحقيقية في الفراغات.',
        lang === 'en' ? 'Use the templates as a starting framework to break the blank page syndrome.' : 'استخدم هذه المصفوفات المتقدمة لتسريع عملك ولتجنب أخطاء التسعير أو الردود الضعيفة.'
      ]
    }
  ];

  const renderSelector = (title, items, selectedId, setSelectedId) => {
    if (!items) return null;
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '900', color: '#6366F1', marginBottom: '12px' }}>
          {title}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                background: selectedId === item.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(13, 18, 32, 0.6)',
                border: `1px solid ${selectedId === item.id ? '#6366F1' : 'rgba(255,255,255,0.05)'}`,
                color: selectedId === item.id ? '#F0F4FC' : '#8B96A8',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                boxShadow: selectedId === item.id ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              {lang === 'en' ? item.name_en : item.name_ar}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ToolDashboardLayout
      id="smart-ai-assistant"
      title={lang === 'en' ? 'Freelance AI Strategist' : 'الخبير الاستراتيجي للعمل الحر'}
      subtitle={lang === 'en' ? 'Generate massive customized scripts, follow-ups, and objection handlers based on specific scenarios.' : 'توليد سيناريوهات ضخمة مخصصة تشمل الرسائل، خطط المتابعة، والرد على الاعتراضات بخطوات بسيطة.'}
      stepNumber={stepNumber}
      accentColor="#6366F1"
      timeEstimate="5 - 15"
      bottomSections={bottomSections}
    >

      <div className="td-grid cols-2" style={{ marginBottom: '36px', alignItems: 'start' }}>
        
        {/* ═══════════════ INPUTS FORM (4 SELECTORS) ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(99, 102, 241, 0.2)', background: 'rgba(99, 102, 241, 0.05)' }}>
          
          {structure ? (
            <>
              {renderSelector(lang === 'en' ? '1. Main Goal' : '1. الهدف الرئيسي', structure.goals, selectedGoal, setSelectedGoal)}
              {renderSelector(lang === 'en' ? '2. Communication Channel' : '2. قناة التواصل', structure.channels, selectedChannel, setSelectedChannel)}
              {renderSelector(lang === 'en' ? '3. Client Type' : '3. نوع العميل المستهدف', structure.clients, selectedClient, setSelectedClient)}
              {renderSelector(lang === 'en' ? '4. Tone of Voice' : '4. نبرة الصوت', structure.tones, selectedTone, setSelectedTone)}
            </>
          ) : (
            <div style={{ color: '#8B96A8', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
              {lang === 'en' ? 'Loading database structure...' : 'جاري تحميل هيكل قاعدة البيانات...'}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !structure}
            className="td-btn-primary"
            style={{ 
              background: isGenerating ? 'rgba(99, 102, 241, 0.2)' : '#6366F1',
              color: isGenerating ? '#8B96A8' : '#fff',
              marginTop: '16px',
              width: '100%'
            }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} /> {lang === 'en' ? 'Generating Massive Matrix...' : 'جاري توليد المصفوفة الضخمة...'}
              </span>
            ) : (
              <span>🚀 {lang === 'en' ? 'Generate AI Strategy' : 'توليد الاستراتيجية الشاملة'}</span>
            )}
          </button>
        </div>

        {/* ═══════════════ OUTPUT DISPLAY ═══════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {!result && (
            <div className="td-info-panel" style={{ margin: 0, background: 'rgba(13, 18, 32, 0.6)', borderStyle: 'dashed', textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>🤖</div>
              <p style={{ color: '#8B96A8', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {lang === 'en' 
                  ? 'Select your parameters on the left and click generate to instantly receive a massive, scenario-specific freelance toolkit.'
                  : 'حدد المعطيات الخاصة بك من القائمة الجانبية، واضغط توليد لتحصل فوراً على أدوات واستراتيجيات ضخمة مخصصة لموقفك.'}
              </p>
            </div>
          )}

          {result && result.error && (
            <div className="td-raw-output" style={{ borderTop: '3px solid #EF4444' }}>
              {result.error}
            </div>
          )}

          {result && !result.error && (
            <>
              {/* Main Script Box */}
              <div className="td-info-panel" style={{ margin: 0, borderLeft: '4px solid #6366F1', background: 'rgba(13, 18, 32, 0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: '#6366F1', fontSize: '15px', fontWeight: '900', margin: 0 }}>
                    {lang === 'en' ? 'Core Communication Script' : 'الرسالة / السكريبت الأساسي'}
                  </h4>
                  <button onClick={() => copyToClipboard(lang === 'en' && result.script_en ? result.script_en : result.script_ar)} style={{ background: 'none', border: 'none', color: '#8B96A8', cursor: 'pointer', fontSize: '16px' }}>📋</button>
                </div>
                {(lang === 'en' ? result.subject_en : (result.subject_ar || result.subject_en)) && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', color: '#E8EDF5' }}>
                    <strong style={{ color: '#8B96A8' }}>{lang === 'en' ? 'Subject / Hook:' : 'الموضوع / الخطاف:'}</strong> {lang === 'en' ? result.subject_en : (result.subject_ar || result.subject_en)}
                  </div>
                )}
                <div style={{ color: '#E8EDF5', fontSize: '14px', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
                  {lang === 'en' && result.script_en ? result.script_en : result.script_ar}
                </div>
              </div>

              {/* Psychological Hook Box */}
              <div className="td-info-panel" style={{ margin: 0, borderLeft: '4px solid #F59E0B', background: 'rgba(245, 158, 11, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: '#F59E0B', fontSize: '15px', fontWeight: '900', margin: 0 }}>
                    {lang === 'en' ? 'Psychological Hook' : 'الزاوية النفسية للعميل'}
                  </h4>
                </div>
                <div style={{ color: '#E8EDF5', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {lang === 'en' && result.hook_en 
                    ? result.hook_en.replace(/### 🎣.*\n\n/, '')
                    : result.hook_ar.replace(/### 🎣.*\n\n/, '')}
                </div>
              </div>

              {/* Follow-ups Box */}
              <div className="td-info-panel" style={{ margin: 0, borderLeft: '4px solid #10B981', background: 'rgba(13, 18, 32, 0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: '#10B981', fontSize: '15px', fontWeight: '900', margin: 0 }}>
                    {lang === 'en' ? 'Follow-up Sequence' : 'خطة المتابعة التسلسلية (Follow-ups)'}
                  </h4>
                  <button onClick={() => copyToClipboard(lang === 'en' && result.followups_en ? result.followups_en : result.followups_ar)} style={{ background: 'none', border: 'none', color: '#8B96A8', cursor: 'pointer', fontSize: '16px' }}>📋</button>
                </div>
                <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
                  {lang === 'en' && result.followups_en ? result.followups_en : result.followups_ar}
                </div>
              </div>

              {/* Objection Handling Box */}
              <div className="td-info-panel" style={{ margin: 0, borderLeft: '4px solid #EF4444', background: 'rgba(13, 18, 32, 0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: '#EF4444', fontSize: '15px', fontWeight: '900', margin: 0 }}>
                    {lang === 'en' ? 'Objection Handling Matrix' : 'مصفوفة الرد على الاعتراضات'}
                  </h4>
                  <button onClick={() => copyToClipboard(lang === 'en' && result.objections_en ? result.objections_en : result.objections_ar)} style={{ background: 'none', border: 'none', color: '#8B96A8', cursor: 'pointer', fontSize: '16px' }}>📋</button>
                </div>
                <div style={{ color: '#E8EDF5', fontSize: '13px', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
                  {lang === 'en' && result.objections_en 
                    ? result.objections_en.replace(/### 🛡️.*\n\n/, '')
                    : result.objections_ar.replace(/### 🛡️.*\n\n/, '')}
                </div>
              </div>

            </>
          )}
        </div>

      </div>

    </ToolDashboardLayout>
  );
}

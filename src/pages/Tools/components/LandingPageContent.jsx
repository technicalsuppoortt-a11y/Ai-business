import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import ToolDashboardLayout from './ToolDashboardLayout';
import { getLandingMatrixSection } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';

export default function LandingPageContent({ stepNumber }) {
  const { state, dispatch } = useApp();
  const lang = state.language || 'ar';
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  
  // Base Inputs
  const [productName, setProductName] = useState('');
  const [audience, setAudience] = useState(state.niche || '');
  
  // Matrix Dropdowns
  const [objective, setObjective] = useState('direct_sales');
  const [awareness, setAwareness] = useState('problem_aware');
  const [pricePoint, setPricePoint] = useState('low_ticket');
  const [emotion, setEmotion] = useState('urgency');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleGenerate = async () => {
    if (!productName || !audience) {
      alert(lang === 'en' ? 'Please enter Product Name and Target Audience.' : 'يرجى إدخال اسم المنتج والجمهور المستهدف.');
      return;
    }
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({
          toolId: 'landing-page-content',
          inputs: { productName, audience, objective, awareness, pricePoint, emotion },
          context: { niche: audience || state.niche, brandName: productName },
          lang
        });

        const ensureArray = (val) => Array.isArray(val) ? val : (val ? [String(val)] : []);

        if (typeof liveResult === 'object' && liveResult !== null) {
          setGeneratedContent({
            hero: ensureArray(liveResult.hero),
            problem: ensureArray(liveResult.problem),
            offer: ensureArray(liveResult.offer),
            proof: ensureArray(liveResult.proof),
            cta: ensureArray(liveResult.cta)
          });
        } else {
          setGeneratedContent({
            hero: [String(liveResult)],
            problem: [],
            offer: [],
            proof: [],
            cta: []
          });
        }

        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'landing-page-content',
          data: { productName, audience, objective, awareness, pricePoint, emotion, result: liveResult, mode: 'live' }
        });
      } else {
        // Fetch matrix from Firebase
        const heroMatrix = await getLandingMatrixSection('hero_sections');
        const problemMatrix = await getLandingMatrixSection('problem_sections');
        const offerMatrix = await getLandingMatrixSection('offer_sections');
        const proofMatrix = await getLandingMatrixSection('proof_sections');
        const ctaMatrix = await getLandingMatrixSection('cta_sections');

        // Keys to lookup
        const heroKey = `${awareness}_${emotion}`;
        const problemKey = `${awareness}`;
        const offerKey = `${pricePoint}_${emotion}`;
        const proofKey = `${pricePoint}_${objective}`;
        const ctaKey = `${objective}_${emotion}`;

        // Helper to safely get ideas array
        const getIdeas = (matrix, key) => {
          if (!matrix) return [];
          if (matrix[key] && matrix[key].ideas) return matrix[key].ideas;
          const firstKey = Object.keys(matrix)[0];
          return matrix[firstKey]?.ideas || [];
        };

        // Helper to replace variables
        const replaceVars = (text) => {
          if (!text) return '';
          return text
            .replace(/\{\{productName\}\}/g, productName)
            .replace(/\{\{audience\}\}/g, audience)
            .replace(/\{\{niche\}\}/g, audience)
            .replace(/\{\{percent\}\}/g, Math.floor(Math.random() * (95 - 60) + 60))
            .replace(/\{\{hours\}\}/g, 24)
            .replace(/\{\{number\}\}/g, '1,000')
            .replace(/\{\{multiplier\}\}/g, '5')
            .replace(/\{\{price\}\}/g, '$99');
        };

        const formatIdea = (idea) => {
          if (idea.headline_ar) {
            return lang === 'en' 
              ? `${replaceVars(idea.headline_en)}\n\n${replaceVars(idea.sub_en)}`
              : `${replaceVars(idea.headline_ar)}\n\n${replaceVars(idea.sub_ar)}`;
          }
          return lang === 'en' ? replaceVars(idea.en) : replaceVars(idea.ar);
        };

        const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

        const hIdea = pickRandom(getIdeas(heroMatrix, heroKey));
        const pIdea = pickRandom(getIdeas(problemMatrix, problemKey));
        const oIdea = pickRandom(getIdeas(offerMatrix, offerKey));
        const prIdea = pickRandom(getIdeas(proofMatrix, proofKey));
        const cIdea = pickRandom(getIdeas(ctaMatrix, ctaKey));

        const content = {
          hero: hIdea ? formatIdea(hIdea) : 'Hero Section',
          problem: pIdea ? formatIdea(pIdea) : 'Problem Section',
          offer: oIdea ? formatIdea(oIdea) : 'Offer Section',
          proof: prIdea ? formatIdea(prIdea) : 'Social Proof Section',
          cta: cIdea ? formatIdea(cIdea) : 'CTA Section'
        };

        setGeneratedContent(content);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'landing-page-content',
          data: { productName, audience, objective, awareness, pricePoint, emotion, result: content, mode: 'fast' }
        });
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'en' ? 'Error generating content' : 'حدث خطأ أثناء التوليد');
    } finally {
      setIsGenerating(false);
    }
  };

  const copySection = (text) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'en' ? 'Section copied!' : 'تم نسخ القسم!');
  };

  return (
    <ToolDashboardLayout
      id="landing-page-content"
      title={lang === 'en' ? 'Landing Page Content Matrix' : 'مصفوفة محتوى صفحة الهبوط'}
      subtitle={lang === 'en' ? 'Generate highly targeted, multi-variable landing page copy based on 4 psychological dimensions.' : 'أنشئ محتوى مخصص بالكامل لصفحة الهبوط بناءً على 4 أبعاد نفسية واستراتيجية.'}
      stepNumber={stepNumber}
      accentColor="#F43F5E"
      timeEstimate="10 - 20"
    >
      <div className="td-grid cols-2" style={{ marginBottom: '36px', alignItems: 'start' }}>
        
        {/* ═══════════════ INPUTS FORM ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, borderColor: 'rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.05)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#F43F5E', textTransform: 'uppercase', marginBottom: '8px' }}>
                {lang === 'en' ? 'Product / Offer Name' : 'اسم المنتج أو العرض'}
              </label>
              <input 
                type="text" 
                className="td-input"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., The Profit System' : 'مثال: نظام الأرباح'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#F43F5E', textTransform: 'uppercase', marginBottom: '8px' }}>
                {lang === 'en' ? 'Target Audience' : 'الجمهور المستهدف'}
              </label>
              <input 
                type="text" 
                className="td-input"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., Graphic Designers' : 'مثال: المصممين'}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(244, 63, 94, 0.2)', margin: '20px 0' }} />

          {/* 4 Dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Objective */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#F43F5E', marginBottom: '8px' }}>
                1. {lang === 'en' ? 'Page Objective' : 'الهدف من الصفحة'}
              </label>
              <select className="td-input" value={objective} onChange={(e) => setObjective(e.target.value)} style={{ padding: '10px' }}>
                <option value="direct_sales">{lang === 'en' ? 'Direct Sales (Sell Product)' : 'بيع مباشر (منتج/دورة)'}</option>
                <option value="lead_gen">{lang === 'en' ? 'Lead Generation (Collect Data)' : 'جمع بيانات (Lead Gen)'}</option>
                <option value="booking">{lang === 'en' ? 'Booking / Consultation' : 'حجز استشارة / مكالمة'}</option>
              </select>
            </div>

            {/* Awareness */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#F43F5E', marginBottom: '8px' }}>
                2. {lang === 'en' ? 'Audience Awareness' : 'مستوى وعي الجمهور'}
              </label>
              <select className="td-input" value={awareness} onChange={(e) => setAwareness(e.target.value)} style={{ padding: '10px' }}>
                <option value="unaware">{lang === 'en' ? 'Unaware (No idea)' : 'غير واعي (يحتاج توعية)'}</option>
                <option value="problem_aware">{lang === 'en' ? 'Problem Aware' : 'واعي بالمشكلة'}</option>
                <option value="solution_aware">{lang === 'en' ? 'Solution Aware (Comparing)' : 'واعي بالحلول (يقارن)'}</option>
                <option value="product_aware">{lang === 'en' ? 'Product Aware (Knows you)' : 'واعي بالمنتج (يعرفك)'}</option>
              </select>
            </div>

            {/* Price Point */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#F43F5E', marginBottom: '8px' }}>
                3. {lang === 'en' ? 'Offer Price/Complexity' : 'الفئة السعرية / التعقيد'}
              </label>
              <select className="td-input" value={pricePoint} onChange={(e) => setPricePoint(e.target.value)} style={{ padding: '10px' }}>
                <option value="low_ticket">{lang === 'en' ? 'Free / Low Ticket' : 'مجاني / سعر منخفض'}</option>
                <option value="mid_ticket">{lang === 'en' ? 'Mid Ticket' : 'سعر متوسط'}</option>
                <option value="high_ticket">{lang === 'en' ? 'High Ticket / Premium' : 'سعر مرتفع (فاخر)'}</option>
              </select>
            </div>

            {/* Emotional Driver */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#F43F5E', marginBottom: '8px' }}>
                4. {lang === 'en' ? 'Emotional Driver' : 'الدافع العاطفي (Tone)'}
              </label>
              <select className="td-input" value={emotion} onChange={(e) => setEmotion(e.target.value)} style={{ padding: '10px' }}>
                <option value="urgency">{lang === 'en' ? 'Urgency & FOMO' : 'إلحاح وندرة (Urgency)'}</option>
                <option value="aspirational">{lang === 'en' ? 'Aspirational & Status' : 'طموح ومكانة'}</option>
                <option value="logical">{lang === 'en' ? 'Logical & Data' : 'منطقي ولغة أرقام'}</option>
                <option value="empathetic">{lang === 'en' ? 'Empathetic / Pain-Relief' : 'تعاطف وحل ألم'}</option>
              </select>
            </div>
          </div>

          {/* Dual Mode Selector */}
          <AnalysisModeSelector 
            mode={analysisMode} 
            onChange={setAnalysisMode} 
            lang={lang} 
            accentColor="#F43F5E" 
          />

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="td-btn-primary"
            style={{ background: isGenerating ? 'rgba(244, 63, 94, 0.2)' : '#F43F5E', color: isGenerating ? '#8B96A8' : '#fff' }}
          >
            {isGenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="td-spinner" /> {lang === 'en' ? 'Assembling Matrix...' : 'جاري تجميع المصفوفة...'}
              </span>
            ) : (
              <span>✨ {lang === 'en' ? 'Generate Intelligent Content' : 'توليد محتوى ذكي وموجه'}</span>
            )}
          </button>
        </div>

        {/* ═══════════════ OUTPUT DISPLAY ═══════════════ */}
        <div className="td-info-panel" style={{ margin: 0, background: 'rgba(13, 18, 32, 0.6)' }}>
          {!generatedContent && !isGenerating ? (
             <div style={{ textAlign: 'center', opacity: 0.4, padding: '40px 0' }}>
               <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🧩</span>
               <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E8EDF5' }}>
                 {lang === 'en' ? 'Set the 4 dimensions to generate the perfect structure' : 'حدد الأبعاد الأربعة لتوليد الهيكل المثالي'}
               </p>
               <p style={{ fontSize: '12px', color: '#8B96A8', marginTop: '8px' }}>
                 {lang === 'en' ? 'Our matrix adapts Hero, Problem, Offer, and CTA to match your scenario.' : 'مصفوفتنا تقوم بتعديل العناوين، المشكلة، والعرض ليطابق السيناريو الخاص بك.'}
               </p>
             </div>
          ) : isGenerating ? (
             <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <div className="td-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(244, 63, 94, 0.2)', borderTopColor: '#F43F5E', marginBottom: '16px' }}></div>
               <p style={{ color: '#F43F5E', fontWeight: 'bold', fontSize: '14px' }}>
                 {lang === 'en' ? 'Extracting matching patterns from database...' : 'يتم استخراج الأنماط المطابقة من قاعدة البيانات...'}
               </p>
             </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <ContentSection title={lang === 'en' ? '1. Hero Section (Headline & Sub)' : '1. قسم البطل (العنوان الرئيسي)'} ideas={generatedContent.hero} onCopy={copySection} lang={lang} />
               <ContentSection title={lang === 'en' ? '2. The Problem / Agitation' : '2. توضيح المشكلة والألم'} ideas={generatedContent.problem} onCopy={copySection} lang={lang} />
               <ContentSection title={lang === 'en' ? '3. The Offer & Benefits' : '3. العرض والفوائد الأساسية'} ideas={generatedContent.offer} onCopy={copySection} lang={lang} />
               <ContentSection title={lang === 'en' ? '4. Social Proof / Credibility' : '4. الإثبات الاجتماعي والمصداقية'} ideas={generatedContent.proof} onCopy={copySection} lang={lang} />
               <ContentSection title={lang === 'en' ? '5. Call to Action (CTA)' : '5. النداء لاتخاذ إجراء (CTA)'} ideas={generatedContent.cta} onCopy={copySection} lang={lang} />
             </div>
          )}
        </div>

      </div>
    </ToolDashboardLayout>
  );
}

function ContentSection({ title, ideas, onCopy, lang }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!ideas) return null;
  const ideasList = Array.isArray(ideas) ? ideas : [ideas];
  if (ideasList.length === 0 || (ideasList.length === 1 && !ideasList[0])) return null;

  return (
    <div style={{ border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ color: '#F43F5E', margin: 0, fontSize: '13px', fontWeight: '800' }}>{title}</h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          {ideasList.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(i)}
              style={{ 
                background: activeTab === i ? '#F43F5E' : 'transparent', 
                color: activeTab === i ? '#fff' : '#F43F5E',
                border: '1px solid #F43F5E',
                borderRadius: '4px',
                fontSize: '10px',
                padding: '2px 8px',
                cursor: 'pointer'
              }}
            >
              {lang === 'en' ? `Idea ${i+1}` : `فكرة ${i+1}`}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px', position: 'relative' }}>
        <button 
          onClick={() => onCopy(ideasList[activeTab])}
          style={{ position: 'absolute', top: '16px', right: lang === 'ar' ? 'auto' : '16px', left: lang === 'ar' ? '16px' : 'auto', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6 }}
          title="Copy"
        >
          📋
        </button>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px', color: '#E8EDF5', lineHeight: '1.7', paddingRight: lang === 'en' ? '30px' : '0', paddingLeft: lang === 'ar' ? '30px' : '0' }}>
          {ideasList[activeTab]}
        </pre>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { TOOL_GUIDES } from '../../../data/toolGuides';
import './ToolDashboard.css';

/**
 * ToolDashboardLayout — Shared Full-Width Dashboard Layout for ALL tools.
 * Fetches dynamic Arabic/English content from Firebase based on state.language.
 */
export default function ToolDashboardLayout({
  id,
  title: defaultTitle,
  subtitle: defaultSubtitle,
  stepNumber,
  accentColor = '#3B82F6',
  timeEstimate = '10 - 25',
  children,
  bottomSections: defaultBottomSections = [],
}) {
  const { state, dispatch } = useApp();
  const { brandData, adminUserData, superAdminUserData, userData } = useAuth();
  
  // Resolve global brand color
  const theme = brandData?.themeConfig || adminUserData?.themeConfig || superAdminUserData?.themeConfig || userData?.themeConfig;
  const globalAccent = theme?.accent || '#3B82F6';
  
  // Visual Identity uses its own color, everything else uses the Admin's brand color
  const actualAccentColor = id === 'visual-identity' ? accentColor : globalAccent;

  const isCompleted = state.completedSteps?.includes(id);

  const [dbData, setDbData] = useState(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'tool_data', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDbData(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching tool data:", err);
      } finally {
        setLoadingDb(false);
      }
    };
    fetchData();
  }, [id]);

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: id });
  };

  const lang = state.language || 'ar';

  const guide = TOOL_GUIDES[id];
  const guideData = guide ? guide[lang] || guide['ar'] : null;
  
  // Decide what to show
  let displayTitle = defaultTitle;
  let displaySubtitle = defaultSubtitle;
  let displayBottomSections = defaultBottomSections;

  if (dbData) {
    const content = lang === 'en' ? dbData.content_en : dbData.content_ar;
    if (content) {
      if (content.title) displayTitle = content.title;
      if (content.subtitle) displaySubtitle = content.subtitle;
      
      // Merge DB tips with default sections if they exist, or just use DB tips
      if (content.tips && content.tips.length > 0 && defaultBottomSections.length === 0) {
        displayBottomSections = [
          {
            icon: '💡',
            title: lang === 'en' ? 'Pro Tips' : 'نصائح ذهبية',
            items: content.tips
          }
        ];
      }
    }
  }

  // Handle translation for generic UI elements
  const stepLabel = lang === 'en' ? 'Step' : 'الخطوة';
  const timeLabel = lang === 'en' ? 'Estimated Time:' : 'الوقت المقدر:';
  const minsLabel = lang === 'en' ? 'mins' : 'دقيقة';
  const completeLabel = lang === 'en' ? 'Confirm: I have successfully completed this step' : 'تأكيد: لقد أكملت هذه الخطوة بنجاح';

  return (
    <div className="td-page" dir={lang === 'en' ? 'ltr' : 'rtl'} style={{ '--td-accent': actualAccentColor }}>

      {/* ═══ STEP HEADER ═══ */}
      <div className="td-header">
        <div className="td-header-content">
          <div className="td-step-badge">
            <div className="td-step-check" style={{ background: actualAccentColor }}>✓</div>
            <span style={{ color: actualAccentColor, background: `${actualAccentColor}15`, borderColor: `${actualAccentColor}30` }}>
              {stepLabel} {stepNumber}
            </span>
          </div>
          <h1 className="td-title">{loadingDb ? '...' : displayTitle}</h1>
          <p className="td-subtitle">{loadingDb ? '...' : displaySubtitle}</p>
        </div>
      </div>

      {/* ═══ MAIN CONTENT (from each tool) ═══ */}
      {children}

      {/* ═══ COMPLETION ═══ */}
      <div className="td-completion">
        <label className="td-complete-label">
          <div className={`td-check-box ${isCompleted ? 'checked' : ''}`}>
            {isCompleted && <span>✓</span>}
          </div>
          <input
            type="checkbox"
            hidden
            checked={isCompleted || false}
            onChange={handleComplete}
          />
          <span className={`td-complete-text ${isCompleted ? 'done' : ''}`}>
            ✅ {completeLabel}
          </span>
        </label>
      </div>

      {/* ═══ TIME ESTIMATE ═══ */}
      <div className="td-time-bar">
        <span>⏱️ {timeLabel} {timeEstimate} {minsLabel}</span>
      </div>

      {/* ═══ FLOATING HELP BUTTON ═══ */}
      {guideData && (
        <>
          <button
            className={`td-help-fab ${guideOpen ? 'open' : ''}`}
            onClick={() => setGuideOpen(!guideOpen)}
            title={lang === 'en' ? 'How to use this tool' : 'كيف تستخدم هذه الأداة؟'}
          >
            {guideOpen ? '✕' : (lang === 'en' ? 'Guide' : 'شرح')}
          </button>

          <div className={`td-guide-overlay ${guideOpen ? 'show' : ''}`} onClick={() => setGuideOpen(false)} />

          <div className={`td-guide-drawer ${guideOpen ? 'show' : ''}`}>
            <div className="td-guide-drawer-header">
              <h3><span>📖</span> {guideData.title}</h3>
              <button className="td-guide-close" onClick={() => setGuideOpen(false)}>✕</button>
            </div>
            <div className="td-guide-body">
              <div className="td-guide-desc">{guideData.description}</div>

              <div className="td-guide-section-title">
                <span>📋</span> {lang === 'en' ? 'Usage Steps' : 'خطوات الاستخدام'}
              </div>
              <ul className="td-guide-steps">
                {guideData.steps.map((step, i) => (
                  <li key={i}>
                    <div className="td-guide-step-num">{i + 1}</div>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>

              {guideData.hasInputs && (
                <>
                  <div className="td-guide-section-title">
                    <span>⚡</span> {lang === 'en' ? 'Inputs & Outputs' : 'المدخلات والمخرجات'}
                  </div>
                  <div className="td-guide-io">
                    <div className="td-guide-io-box inputs">
                      <div className="td-guide-io-title">
                        <span>📥</span> {lang === 'en' ? 'Inputs' : 'المدخلات'}
                      </div>
                      <ul className="td-guide-io-list">
                        {guideData.inputs?.map((inp, i) => <li key={i}>{inp}</li>)}
                      </ul>
                    </div>
                    <div className="td-guide-io-box outputs">
                      <div className="td-guide-io-title">
                        <span>📤</span> {lang === 'en' ? 'Outputs' : 'المخرجات'}
                      </div>
                      <ul className="td-guide-io-list">
                        {guideData.outputs?.map((out, i) => <li key={i}>{out}</li>)}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {/* ═══ TIPS (from bottomSections) ═══ */}
              {displayBottomSections.length > 0 && (
                <>
                  <div className="td-guide-section-title" style={{ marginTop: '20px' }}>
                    <span>💡</span> {lang === 'en' ? 'Pro Tips' : 'نصائح ذهبية'}
                  </div>
                  {displayBottomSections.map((section, i) => (
                    <div key={i} style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#E8EDF5', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{section.icon}</span> {section.title}
                      </div>
                      <ul className="td-guide-io-list">
                        {section.items.map((item, j) => (
                          <li key={j} style={{ lineHeight: '1.7', marginBottom: '6px' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

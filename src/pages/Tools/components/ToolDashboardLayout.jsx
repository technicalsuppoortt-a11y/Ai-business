import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { TOOL_GUIDES } from '../../../data/toolGuides';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  BookOpen,
  X,
  Sparkles,
  ListOrdered,
  CheckCircle2,
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
  Zap,
  Check,
  Clock
} from 'lucide-react';
import './ToolDashboard.css';

/**
 * ToolDashboardLayout — Shared Full-Width Dashboard Layout for ALL tools.
 * Fetches dynamic Arabic/English content from Firebase based on state.language.
 * Includes a professional Framer Motion Guide Popup / Drawer with Lucide React icons.
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
  const isRtl = lang === 'ar';

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
            icon: <Lightbulb size={16} color="#F59E0B" />,
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
    <div className="td-page" dir={isRtl ? 'rtl' : 'ltr'} style={{ '--td-accent': actualAccentColor }}>

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
            {isCompleted && <Check size={16} />}
          </div>
          <input
            type="checkbox"
            hidden
            checked={isCompleted || false}
            onChange={handleComplete}
          />
          <span className={`td-complete-text ${isCompleted ? 'done' : ''}`}>
            {completeLabel}
          </span>
        </label>
      </div>

      {/* ═══ TIME ESTIMATE ═══ */}
      <div className="td-time-bar">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} color="var(--text2, #94A3B8)" />
          {timeLabel} {timeEstimate} {minsLabel}
        </span>
      </div>

      {/* ═══ PROFESSIONAL FLOATING HELP BUTTON & GUIDE POPUP MODAL ═══ */}
      {guideData && (
        <>
          <motion.button
            className={`td-help-fab ${guideOpen ? 'open' : ''}`}
            onClick={() => setGuideOpen(!guideOpen)}
            title={lang === 'en' ? 'How to use this tool' : 'كيف تستخدم هذه الأداة؟'}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{ '--td-accent': actualAccentColor }}
          >
            {guideOpen ? (
              <X size={18} />
            ) : (
              <>
                <BookOpen size={16} />
                <span>{lang === 'en' ? 'Guide' : 'الشرح'}</span>
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {guideOpen && (
              <>
                {/* Backdrop Overlay */}
                <motion.div 
                  className="td-guide-overlay show"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setGuideOpen(false)}
                />

                {/* Glassmorphic Guide Drawer / Modal */}
                <motion.div 
                  className={`td-guide-drawer show ${isRtl ? 'rtl' : 'ltr'}`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  initial={{ x: isRtl ? '-100%' : '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isRtl ? '-100%' : '100%', opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  style={{ '--td-accent': actualAccentColor }}
                >
                  {/* Header */}
                  <div className="td-guide-drawer-header">
                    <h3>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${actualAccentColor}20`, color: actualAccentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={20} />
                      </div>
                      <span>{guideData.title}</span>
                    </h3>
                    <motion.button 
                      className="td-guide-close" 
                      onClick={() => setGuideOpen(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={16} />
                    </motion.button>
                  </div>

                  {/* Body */}
                  <div className="td-guide-body">
                    {/* Description Card */}
                    <div className="td-guide-desc">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: actualAccentColor, fontWeight: '900', fontSize: '13px' }}>
                        <Sparkles size={16} />
                        <span>{lang === 'en' ? 'Overview' : 'نبذة عن الأداة'}</span>
                      </div>
                      <p style={{ margin: 0 }}>{guideData.description}</p>
                    </div>

                    {/* Usage Steps */}
                    <div className="td-guide-section-title" style={{ color: actualAccentColor }}>
                      <ListOrdered size={16} color={actualAccentColor} />
                      <span>{lang === 'en' ? 'Usage Steps' : 'خطوات الاستخدام'}</span>
                    </div>
                    <ul className="td-guide-steps">
                      {guideData.steps.map((step, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 + 0.1 }}
                        >
                          <div className="td-guide-step-num" style={{ background: actualAccentColor }}>{i + 1}</div>
                          <span>{step}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Inputs & Outputs Grid */}
                    {guideData.hasInputs && (
                      <>
                        <div className="td-guide-section-title" style={{ color: actualAccentColor }}>
                          <Zap size={16} color={actualAccentColor} />
                          <span>{lang === 'en' ? 'Inputs & Outputs' : 'المدخلات والمخرجات'}</span>
                        </div>
                        <div className="td-guide-io">
                          <div className="td-guide-io-box inputs">
                            <div className="td-guide-io-title">
                              <ArrowDownRight size={14} color="#3B82F6" />
                              <span>{lang === 'en' ? 'Inputs' : 'المدخلات'}</span>
                            </div>
                            <ul className="td-guide-io-list">
                              {guideData.inputs?.map((inp, i) => (
                                <li key={i}>
                                  <CheckCircle2 size={12} color="#3B82F6" style={{ flexShrink: 0 }} />
                                  <span>{inp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="td-guide-io-box outputs">
                            <div className="td-guide-io-title">
                              <ArrowUpRight size={14} color="#10B981" />
                              <span>{lang === 'en' ? 'Outputs' : 'المخرجات'}</span>
                            </div>
                            <ul className="td-guide-io-list">
                              {guideData.outputs?.map((out, i) => (
                                <li key={i}>
                                  <CheckCircle2 size={12} color="#10B981" style={{ flexShrink: 0 }} />
                                  <span>{out}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Pro Tips Section */}
                    {displayBottomSections.length > 0 && (
                      <>
                        <div className="td-guide-section-title" style={{ marginTop: '24px', color: '#F59E0B' }}>
                          <Lightbulb size={16} color="#F59E0B" />
                          <span>{lang === 'en' ? 'Pro Tips' : 'نصائح ذهبية'}</span>
                        </div>
                        {displayBottomSections.map((section, i) => (
                          <div key={i} className="td-guide-tips-card">
                            <ul className="td-guide-io-list">
                              {section.items.map((item, j) => (
                                <li key={j} style={{ lineHeight: '1.7', marginBottom: '6px' }}>
                                  <Sparkles size={13} color="#F59E0B" style={{ flexShrink: 0 }} />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getBioTemplate } from '../../../services/contentDbService';
import AnalysisModeSelector from '../../../components/common/AnalysisModeSelector';
import { dispatchLiveAiAnalysis } from '../../../services/liveAiService';
import { FREELANCE_DB } from '../../../data/freelanceData';
import {
  User,
  Briefcase,
  Sparkles,
  Award,
  Bot,
  Copy,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Share2,
  Zap,
  Compass,
  ShieldCheck,
  Check,
  Target,
  Download,
  FileText,
  Lightbulb,
  Plus
} from 'lucide-react';
import './FreelanceProfileStudio.css';

export default function FreelanceProfile({ stepNumber }) {
  const { state, dispatch } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [activeStep, setActiveStep] = useState(1);
  const [analysisMode, setAnalysisMode] = useState('fast'); // 'fast' | 'live'
  const [isGenerating, setIsGenerating] = useState(false);
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('1');

  // Next / Back Icon directional logic for RTL and LTR
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  const steps = [
    { id: 1, title_ar: 'المسمى والهوية', title_en: 'Identity & Title', icon: User },
    { id: 2, title_ar: 'الخبرة والنيش', title_en: 'Experience & Niche', icon: Briefcase },
    { id: 3, title_ar: 'استوديو الذكاء', title_en: 'AI Bio Studio', icon: Bot },
    { id: 4, title_ar: 'بطاقة التصدير', title_en: 'Card & Export', icon: ShieldCheck }
  ];

  const handleGenBio = async () => {
    setIsGenerating(true);
    setBio('');
    
    try {
      if (analysisMode === 'live') {
        const liveResult = await dispatchLiveAiAnalysis({ uid: userData?.uid || state?.user?.uid, 
      toolId: 'freelance-profile',
          inputs: { experience, title: state.exactTitle },
          context: { niche: state.niche, user: state.user },
          lang,
      uid: userData?.uid || state?.user?.uid
    });
        setBio(liveResult);
        dispatch({
          type: 'SAVE_TOOL_RESULT',
          toolId: 'freelance-profile',
          data: { experience, title: state.exactTitle, result: liveResult, mode: 'live' }
        });
      } else {
        await new Promise(r => setTimeout(r, 600));
        
        let expLevel = 'intermediate';
        if (experience === 'fresh' || experience === '1') expLevel = 'beginner';
        if (experience === '5+') expLevel = 'expert';

        const dbResult = await getBioTemplate(state.niche || 'general', expLevel);
        
        if (dbResult && (dbResult.bio_ar || dbResult.bio_en)) {
          const bioText = lang === 'en' ? (dbResult.bio_en || dbResult.bio_ar) : dbResult.bio_ar;
          const tipStr = lang === 'en' ? (dbResult.tip_en || dbResult.tip_ar) : dbResult.tip_ar;
          
          let text = `${lang === 'en' ? 'Professional Bio Template' : 'قالب النبذة الاحترافية'}\n\n`;
          text += `*(${lang === 'en' ? 'Adjust the parts in brackets to match your details:' : 'قم بتعديل الأجزاء بين الأقواس لتناسب تفاصيلك:'})*\n\n`;
          text += bioText;
          
          if (tipStr) {
            text += `\n\n---\n${lang === 'en' ? 'Pro Tip' : 'نصيحة ذهبية'}: ${tipStr}`;
          }
          setBio(text);
          dispatch({
            type: 'SAVE_TOOL_RESULT',
            toolId: 'freelance-profile',
            data: { experience, title: state.exactTitle, result: text, mode: 'fast' }
          });
        } else {
          setBio(lang === 'en' 
            ? "No bio template found for this combination. We are constantly adding new templates." 
            : "لم يتم العثور على قالب نبذة لهذا الاختيار بعد. نحن نضيف قوالب جديدة باستمرار.");
        }
      }
      toast(lang === 'en' ? 'Bio generated successfully!' : 'تم صياغة النبذة بنجاح!', 'success');
      setActiveStep(4);
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

  const isCompleted = state?.completedSteps?.includes('freelance-profile') || false;

  const handleToggleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'freelance-profile' });
    toast(
      isCompleted
        ? (lang === 'en' ? 'Step marked as in-progress' : 'تم تغيير الحالة إلى قيد الإعداد')
        : (lang === 'en' ? 'Profile completed successfully!' : 'تم إكمال ملفك المهني بنجاح!'),
      'success'
    );
  };

  const handleCopyBio = () => {
    if (!bio) return;
    navigator.clipboard.writeText(bio);
    toast(lang === 'en' ? 'Bio copied to clipboard!' : 'تم نسخ النبذة إلى المحفظة!', 'success');
  };

  const handleExportCard = () => {
    if (!bio && !state.exactTitle) {
      toast(lang === 'en' ? 'Please generate a bio first before exporting' : 'يرجى توليد النبذة أولاً قبل التصدير', 'warning');
      return;
    }

    const titleStr = state.exactTitle || (lang === 'en' ? 'Specialized Consultant' : 'مستشار متخصص');
    const nameStr = state.user?.name || (lang === 'en' ? 'Professional Freelancer' : 'مستقل محترف');
    const nicheStr = state.niche || (lang === 'en' ? 'General' : 'عام');
    
    const cardContent = `==================================================
👤 ${nameStr.toUpperCase()} - FREELANCER DIGITAL CARD
==================================================
💼 ${lang === 'en' ? 'Title' : 'المسمى'}: ${titleStr}
🎯 ${lang === 'en' ? 'Niche' : 'النيش'}: ${nicheStr}
⚡ ${lang === 'en' ? 'Experience' : 'الخبرة'}: ${experience} ${lang === 'en' ? 'Years' : 'سنوات'}
Status: Verified Profile ✅

--------------------------------------------------
📝 ${lang === 'en' ? 'BIO CONTENT' : 'محتوى النبذة التعريفية'}:
--------------------------------------------------
${bio || (lang === 'en' ? 'No bio generated yet.' : 'لم يتم توليد نبذة بعد.')}

==================================================
Exported via AI Business Platform
==================================================`;

    const blob = new Blob([cardContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nameStr.replace(/\s+/g, '_')}_Freelancer_Profile.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(lang === 'en' ? 'Profile Card exported successfully!' : 'تم تصدير بطاقة الملف بنجاح!', 'success');
  };

  const experienceOptions = [
    { id: 'fresh', label_ar: 'أبدأ رحلتي من الصفر', label_en: 'Just Starting' },
    { id: '1', label_ar: 'سنة واحدة (مبتدئ)', label_en: '1 Year (Beginner)' },
    { id: '2-3', label_ar: '2-3 سنوات (متوسط)', label_en: '2-3 Years (Intermediate)' },
    { id: '5+', label_ar: 'أكثر من 5 سنوات (خبير)', label_en: '5+ Years (Expert)' }
  ];

  const suggestedTitles = (FREELANCE_DB.jobTitles && FREELANCE_DB.jobTitles[state.niche]) || [
    'UI/UX Designer',
    'Full Stack Developer',
    'Digital Marketing Specialist',
    'Copywriter & Content Strategist',
    'Motion Graphics Designer'
  ];

  return (
    <div className="fps-canvas" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Floating Spatial Node Bar */}
      <nav className="fps-node-bar">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = activeStep === step.id;
          const isDone = activeStep > step.id || isCompleted;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`fps-node-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="fps-node-badge">
                  {isDone ? <Check size={14} /> : <StepIcon size={14} />}
                </div>
                <span>{lang === 'en' ? step.title_en : step.title_ar}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`fps-node-connector ${isDone ? 'active' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Central Dynamic Stage Canvas */}
      <div className="fps-stage">
        <AnimatePresence mode="wait">
          {/* STEP 1: IDENTITY & TITLE */}
          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="fps-card"
            >
              <div className="fps-card-header">
                <h2 className="fps-card-title">
                  <User size={22} style={{ color: '#3B82F6' }} />
                  {lang === 'en' ? 'Exact Job Title & Identity' : 'المسمى الوظيفي والهوية المهنية'}
                </h2>
                <p className="fps-card-subtitle">
                  {lang === 'en'
                    ? 'Define your specialized role to attract high-paying clients on global freelance platforms.'
                    : 'حدد مسماك الوظيفي الدقيق لاستهداف العملاء الجادين والمشاريع عالية القيمة.'}
                </p>
              </div>

              <div className="fps-input-group">
                <label className="fps-input-label">
                  <Sparkles size={14} />
                  {lang === 'en' ? 'Your Professional Title' : 'المسمى الوظيفي الدقيق'}
                </label>
                <input
                  type="text"
                  value={state.exactTitle || ''}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'exactTitle', value: e.target.value })}
                  placeholder={lang === 'en' ? 'e.g. Senior UI/UX Designer & Product Specialist' : 'مثال: مصمم واجهات مستخدم وخبير منتجات'}
                  className="fps-input"
                />
              </div>

              <div className="fps-input-group">
                <label className="fps-input-label">
                  <Award size={14} />
                  {lang === 'en' ? 'Recommended Titles for Your Niche' : 'مسميات مقترحة لمجالك'}
                </label>
                <div className="fps-pills-grid">
                  {suggestedTitles.slice(0, 6).map((title) => {
                    const isSelected = state.exactTitle === title;
                    return (
                      <button
                        key={title}
                        type="button"
                        className={`fps-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => dispatch({ type: 'SET_FIELD', field: 'exactTitle', value: title })}
                      >
                        <Plus size={12} />
                        <span>{title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EXPERIENCE & NICHE */}
          {activeStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="fps-card"
            >
              <div className="fps-card-header">
                <h2 className="fps-card-title">
                  <Briefcase size={22} style={{ color: '#3B82F6' }} />
                  {lang === 'en' ? 'Experience Level & Field Context' : 'مستوى الخبرة ونطاق العمل'}
                </h2>
                <p className="fps-card-subtitle">
                  {lang === 'en'
                    ? 'Tailor your AI bio language tone according to your seniority level.'
                    : 'حدد مستوى خبرتك لضبط نبرة صياغة الذكاء الاصطناعي بما يلائم مستواك الحقيقي.'}
                </p>
              </div>

              <div className="fps-input-group">
                <label className="fps-input-label">
                  <Zap size={14} />
                  {lang === 'en' ? 'Select Experience Seniority' : 'اختر سنوات الخبرة'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {experienceOptions.map((exp) => {
                    const isSelected = experience === exp.id;
                    return (
                      <div
                        key={exp.id}
                        onClick={() => setExperience(exp.id)}
                        className={`fps-pill ${isSelected ? 'selected' : ''}`}
                        style={{ padding: '16px', borderRadius: '16px', justifyContent: 'space-between' }}
                      >
                        <span className="font-bold text-sm">{lang === 'en' ? exp.label_en : exp.label_ar}</span>
                        {isSelected && <CheckCircle2 size={18} style={{ color: '#3B82F6' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {state.niche && (
                <div className="fps-input-group mt-4">
                  <label className="fps-input-label">
                    <Compass size={14} />
                    {lang === 'en' ? 'Active Project Niche' : 'مجال المشروع النشط'}
                  </label>
                  <div className="fps-pill selected" style={{ width: 'fit-content', padding: '10px 18px' }}>
                    <Target size={14} />
                    <span>{state.niche} {state.subNiche ? `(${state.subNiche})` : ''}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: AI BIO STUDIO */}
          {activeStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="fps-card"
            >
              <div className="fps-card-header">
                <h2 className="fps-card-title">
                  <Bot size={22} style={{ color: '#3B82F6' }} />
                  {lang === 'en' ? 'AI Bio Generation Studio' : 'استوديو توليد النبذة الذكية'}
                </h2>
                <p className="fps-card-subtitle">
                  {lang === 'en'
                    ? 'Generate a magnetic bio using instant structured DB templates or real-time Live AI analysis.'
                    : 'ولّد نبذة بيعية احترافية باستخدام القوالب المباشرة أو التحليل الفوري بالذكاء الاصطناعي.'}
                </p>
              </div>

              <div className="mb-6">
                <AnalysisModeSelector
                  mode={analysisMode}
                  onChange={setAnalysisMode}
                  lang={lang}
                  accentColor="#3B82F6"
                />
              </div>

              {bio ? (
                <div className="fps-input-group">
                  <label className="fps-input-label" style={{ color: '#3B82F6' }}>
                    <Sparkles size={14} />
                    {lang === 'en' ? 'Generated Bio Content' : 'محتوى النبذة المولدة'}
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={8}
                    className="fps-input"
                    style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}
                  />
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <Bot size={48} style={{ color: '#3B82F6', margin: '0 auto 12px auto', opacity: 0.7 }} />
                  <p className="text-slate-400 text-sm font-semibold">
                    {lang === 'en'
                      ? 'Click "Generate Bio with AI" in the bottom dock to craft your profile.'
                      : 'اضغط على "توليد النبذة بالذكاء الاصطناعي" في الشريط السفلي للبدء.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: CARD PREVIEW & PROFESSIONAL EXPORT */}
          {activeStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="fps-card"
            >
              <div className="fps-card-header">
                <h2 className="fps-card-title">
                  <ShieldCheck size={22} style={{ color: '#10B981' }} />
                  {lang === 'en' ? 'Live Freelancer Digital Profile Card' : 'بطاقة معاينة الملف المهني المباشرة'}
                </h2>
                <p className="fps-card-subtitle">
                  {lang === 'en'
                    ? 'Review and export your digital profile card ready for freelancing platforms.'
                    : 'عاين وصدّر بطاقة ملفك المهني الرقمية الجاهزة للنشر على المنصات.'}
                </p>
              </div>

              {/* Digital Profile Card */}
              <div className="fps-profile-card">
                <div className="fps-profile-card-header">
                  <div className="fps-profile-identity">
                    <div className="fps-avatar-glow">
                      <div className="fps-avatar-inner">
                        {(state.user?.name || state.exactTitle || 'F').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <span>{state.user?.name || (lang === 'en' ? 'Professional Freelancer' : 'مستقل محترف')}</span>
                        <ShieldCheck size={16} style={{ color: '#10B981' }} />
                      </h3>
                      <p className="text-sm text-blue-400 font-semibold mt-0.5">
                        {state.exactTitle || (lang === 'en' ? 'Specialized Consultant' : 'مستشار متخصص')}
                      </p>
                    </div>
                  </div>

                  <div className="fps-badge-status">
                    <CheckCircle2 size={13} />
                    <span>{lang === 'en' ? 'Verified Profile' : 'ملف موثق'}</span>
                  </div>
                </div>

                {/* Card Metadata Grid */}
                <div className="fps-card-meta-grid">
                  <div className="fps-card-meta-box">
                    <div className="fps-card-meta-icon">
                      <Zap size={18} />
                    </div>
                    <div>
                      <div className="fps-card-meta-label">{lang === 'en' ? 'Experience Level' : 'مستوى الخبرة'}</div>
                      <div className="fps-card-meta-value">{experience} {lang === 'en' ? 'Years' : 'سنوات'}</div>
                    </div>
                  </div>

                  {state.niche && (
                    <div className="fps-card-meta-box">
                      <div className="fps-card-meta-icon green">
                        <Target size={18} />
                      </div>
                      <div>
                        <div className="fps-card-meta-label">{lang === 'en' ? 'Specialized Niche' : 'النيش التخصصي'}</div>
                        <div className="fps-card-meta-value">{state.niche}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio Box */}
                <div className="fps-bio-box">
                  {bio || (lang === 'en' ? 'Your AI Generated Bio will appear here...' : 'ستظهر نبذتك التعريفية المولدة هنا...')}
                </div>

                {/* Card Action Footer */}
                <div className="fps-card-footer">
                  <button
                    type="button"
                    onClick={handleCopyBio}
                    className="fps-card-action-btn secondary"
                  >
                    <Copy size={16} />
                    <span>{lang === 'en' ? 'Copy Text' : 'نسخ النص'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCard}
                    className="fps-card-action-btn primary"
                  >
                    <Download size={16} />
                    <span>{lang === 'en' ? 'Export Profile Card' : 'تصدير بطاقة الملف'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Bottom Control Dock */}
      <div className="fps-action-dock">
        {activeStep > 1 && (
          <button
            type="button"
            className="fps-dock-btn secondary"
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
          >
            <BackIcon size={16} />
            <span>{lang === 'en' ? 'Back' : 'السابق'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleGenBio}
          disabled={isGenerating || !state.exactTitle}
          className="fps-dock-btn primary"
        >
          <Sparkles size={16} />
          <span>
            {isGenerating
              ? (lang === 'en' ? 'Crafting Bio...' : 'جاري الصياغة...')
              : (lang === 'en' ? 'AI Generate Bio' : 'توليد النبذة بالذكاء الاصطناعي')}
          </span>
        </button>

        {activeStep < 4 ? (
          <button
            type="button"
            className="fps-dock-btn secondary"
            onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
          >
            <span>{lang === 'en' ? 'Next Node' : 'التالي'}</span>
            <NextIcon size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`fps-dock-btn ${isCompleted ? 'green' : 'secondary'}`}
          >
            <CheckCircle2 size={16} />
            <span>{isCompleted ? (lang === 'en' ? 'Completed ✓' : 'مكتمل ✓') : (lang === 'en' ? 'Mark Completed' : 'تحديد كمكتمل')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

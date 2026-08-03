import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Play,
  Sparkles,
  Target,
  Laptop,
  Megaphone,
  Cpu,
  Rocket,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Layers,
  BookOpen,
  SlidersHorizontal,
  Bot,
  ExternalLink
} from 'lucide-react';
import './PlatformExplanation.css';

const PlatformExplanation = ({ videoUrl, title, lang = 'ar' }) => {
  const isEn = lang === 'en';
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !Number.isFinite(timeInSeconds)) return "--:--";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleLoadedMetadata = (e) => {
    const video = e.target;
    if (video.duration === Infinity) {
      // Trick Chrome into fetching duration for streamed/blob webm by seeking temporarily
      video.currentTime = 1e101;
      video.addEventListener('timeupdate', function forceDuration() {
        video.removeEventListener('timeupdate', forceDuration);
        if (Number.isFinite(video.duration)) {
          setDuration(video.duration);
        }
        video.currentTime = 0; // Reset to start
      });
    } else if (Number.isFinite(video.duration)) {
      setDuration(video.duration);
    }
  };

  const sections = [
    {
      id: 'analysis',
      category: 'analysis',
      icon: Target,
      iconColor: '#3B82F6',
      badgeTint: 'rgba(59, 130, 246, 0.15)',
      badgeBorder: 'rgba(59, 130, 246, 0.3)',
      title_ar: 'التحليل والهوية التجارية',
      title_en: 'Analysis & Brand Identity',
      desc_ar: 'نقطة الانطلاق الشاملة. نساعدك في اكتشاف النيش المربح، اختيار اسم براند جذاب، وبناء هوية بصرية كاملة تميز مشروعك في السوق.',
      desc_en: 'The starting point. Discover a high-converting niche, construct a powerful brand name, and generate a full visual brand identity system.',
      tools_ar: ['اختيار النيش المربح', 'توليد اسم البراند', 'الهوية البصرية والمودبورد'],
      tools_en: ['Niche Selection', 'Brand Naming AI', 'Visual Identity System']
    },
    {
      id: 'setup',
      category: 'setup',
      icon: Laptop,
      iconColor: '#10B981',
      badgeTint: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.3)',
      title_ar: 'بناء وتجهيز المتجر الإلكتروني',
      title_en: 'Store Construction & Tech Setup',
      desc_ar: 'نحول أفكارك لوظائف عملية. نوفر لك أدوات بناء الموقع، صياغة المحتوى التسويقي، توليد الصفحات القانونية، وربط كافة البكسلات.',
      desc_en: 'Turning strategic ideas into live execution. Website creation tools, persuasive page copy, legal agreement generators, and pixel setups.',
      tools_ar: ['بناء صفحات المتجر', 'المحتوى والصفحات القانونية', 'أتمتة البريد الإلكتروني'],
      tools_en: ['Store Page Builder', 'Legal & Copywriting Engine', 'Email Marketing Automation']
    },
    {
      id: 'marketing',
      category: 'marketing',
      icon: Megaphone,
      iconColor: '#F59E0B',
      badgeTint: 'rgba(245, 158, 11, 0.15)',
      badgeBorder: 'rgba(245, 158, 11, 0.3)',
      title_ar: 'صناعة المحتوى والإعلانات',
      title_en: 'Content Factory & Growth Marketing',
      desc_ar: 'هنا يتسارع نمو الأرباح. نولد لك أفكار إعلانية إبداعية عالية التحويل، خطط تسويق استراتيجية، ومحتوى سوشيال ميديا مخصص.',
      desc_en: 'Accelerate profitable growth. Generate high-converting ad scripts, strategic multi-channel marketing blueprints, and social content.',
      tools_ar: ['أفكار وتصميم الإعلانات', 'الخطة التسويقية المجهزة', 'مصنع المحتوى التفاعلي'],
      tools_en: ['Ad Creative Engine', 'Marketing Strategy Plan', 'Social Content Factory']
    },
    {
      id: 'ops',
      category: 'ops',
      icon: Cpu,
      iconColor: '#8B5CF6',
      badgeTint: 'rgba(139, 92, 246, 0.15)',
      badgeBorder: 'rgba(139, 92, 246, 0.3)',
      title_ar: 'الإدارة والتشغيل الذكي (AI Ops)',
      title_en: 'Smart Operations & AI Scaling',
      desc_ar: 'تحكم بمنصتك وأعمالك بكل ذكاء. مساعدك الذكي متاح على مدار الساعة، بالإضافة لرادار المنصات وحاسبة الربحية لضبط أرقامك.',
      desc_en: 'Master your platform with AI intelligence. 24/7 AI business co-pilot, multi-platform market radar, and automated profit calculators.',
      tools_ar: ['المساعد الذكي 24/7', 'حاسبة صافي الأرباح', 'رادار تحليل المنافسين'],
      tools_en: ['24/7 AI Business Co-Pilot', 'Profit Margin Calculator', 'Competitor Platform Radar']
    }
  ];

  const categories = [
    { id: 'all', label_ar: 'الكل (4 مراحل)', label_en: 'All Modules (4 Phases)' },
    { id: 'analysis', label_ar: 'التحليل والهوية', label_en: 'Analysis & Identity' },
    { id: 'setup', label_ar: 'تجهيز المتجر', label_en: 'Store Setup' },
    { id: 'marketing', label_ar: 'التسويق والإعلانات', label_en: 'Marketing & Ads' },
    { id: 'ops', label_ar: 'التشغيل والذكاء', label_en: 'Smart Ops & AI' }
  ];

  const filteredSections = sections.filter(
    (sec) => activeCategoryFilter === 'all' || sec.category === activeCategoryFilter
  );

  return (
    <section className="platform-explanation-section" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="pe-container">
        
        {/* Modern Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pe-header"
        >
          <div className="pe-badge">
            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            <span>{isEn ? 'Platform Mastery Guide' : 'دليل المنصة والتجهيز الشامل'}</span>
          </div>

          <h2 className="pe-title">
            {title || (isEn ? 'Complete Platform Video Masterclass' : 'شرح المنصة التفاعلي المتقدم')}
          </h2>

          <p className="pe-subtitle">
            {isEn
              ? 'Watch the video overview below to master all AI tools, business setups, and automated brand workflows.'
              : 'شاهد الشرح التوضيحي أدناه للاستفادة القصوى من كافة أدوات الذكاء الاصطناعي وخطوات بناء مشروعك الناجح.'}
          </p>

          <div className="pe-line"></div>
        </motion.div>

        {/* Professional Glassmorphic Video Showcase Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="pe-video-container"
        >
          <div className="pe-video-wrapper">
            {/* Window Top Bar Mockup */}
            <div className="pe-video-topbar">
              <div className="pe-video-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="pe-video-title-badge">
                <Video size={14} style={{ color: 'var(--accent)' }} />
                <span>{isEn ? 'Official Video Masterclass (1080p HD)' : 'فيديو الشرح التفاعلي الرسمي (1080p)'}</span>
              </div>
              <div className="pe-video-meta">
                <Clock size={13} style={{ color: 'var(--text3)' }} />
                <span>{isEn ? 'Full Walkthrough' : 'شرح شامل'}</span>
              </div>
            </div>

            {/* Video Player */}
            <div className="pe-video-inner">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                preload="metadata"
                className="pe-video-player"
                poster=""
                onTimeUpdate={(e) => {
                  setCurrentTime(e.target.currentTime);
                  if (Number.isNaN(duration) && Number.isFinite(e.target.duration)) {
                    setDuration(e.target.duration);
                  }
                }}
                onLoadedMetadata={handleLoadedMetadata}
                onDurationChange={(e) => {
                  if (Number.isFinite(e.target.duration)) {
                    setDuration(e.target.duration);
                  }
                }}
              />
              
              {/* Custom Overlay Controls for Time & Speed */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.6)', padding: '10px 16px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ letterSpacing: '1px' }}>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        if (videoRef.current) videoRef.current.playbackRate = speed;
                      }}
                      style={{
                        background: playbackSpeed === speed ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                        color: playbackSpeed === speed ? '#fff' : '#ccc',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Glow Effect */}
          <div className="pe-video-glow"></div>
        </motion.div>

        {/* Interactive Modules Section Header & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="pe-filter-header"
        >
          <div className="pe-filter-title-group">
            <h3 className="pe-section-heading">
              <Layers size={22} style={{ color: 'var(--accent)' }} />
              <span>{isEn ? 'Core Platform Mastery Pillars' : 'أركان المنصة والرحلة العملية'}</span>
            </h3>
            <span className="pe-section-sub">
              {isEn ? 'Explore how each phase accelerates your brand journey' : 'استعرض تفاصيل كل مرحلة وكيف تخدم نمو أرباحك'}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="pe-filter-pills">
            {categories.map((cat) => {
              const isActive = activeCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`pe-filter-pill ${isActive ? 'active' : ''}`}
                >
                  <span>{isEn ? cat.label_en : cat.label_ar}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Modules Grid with Framer Motion */}
        <div className="pe-content">
          <motion.div layout className="pe-grid">
            <AnimatePresence mode="popLayout">
              {filteredSections.map((section, index) => {
                const IconComp = section.icon;
                return (
                  <motion.div
                    layout
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    whileHover={{ y: -8 }}
                    className="pe-card"
                    style={{
                      borderTop: `3px solid ${section.iconColor}`
                    }}
                  >
                    {/* Header Row */}
                    <div className="pe-card-top">
                      <div
                        className="pe-card-icon-wrapper"
                        style={{
                          background: section.badgeTint,
                          border: `1px solid ${section.badgeBorder}`
                        }}
                      >
                        <IconComp size={24} style={{ color: section.iconColor }} />
                      </div>

                      <span
                        className="pe-card-phase-badge"
                        style={{
                          background: section.badgeTint,
                          color: section.iconColor,
                          border: `1px solid ${section.badgeBorder}`
                        }}
                      >
                        {isEn ? `Phase 0${index + 1}` : `المرحلة 0${index + 1}`}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="pe-card-title">
                      {isEn ? section.title_en : section.title_ar}
                    </h3>
                    
                    <p className="pe-card-desc">
                      {isEn ? section.desc_en : section.desc_ar}
                    </p>

                    {/* Checkmark Feature Tags */}
                    <div className="pe-card-tags">
                      {(isEn ? section.tools_en : section.tools_ar).map((tool, i) => (
                        <span key={i} className="pe-tag">
                          <CheckCircle2 size={12} style={{ color: section.iconColor }} />
                          <span>{tool}</span>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* High-End Footer CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pe-footer"
        >
          <div className="pe-footer-card">
            <div className="pe-footer-icon-glow">
              <Rocket size={34} style={{ color: '#10B981' }} />
            </div>
            
            <h4>{isEn ? 'Ready to Launch Your Brand Empire?' : 'جاهز لانطلاق مشروعك كترند حقيقي؟'}</h4>
            
            <p>
              {isEn
                ? 'All the smart tools, AI generators, and strategic workflows you need are ready inside your dashboard.'
                : 'كل الأدوات الذكية، المساعدين الرقميين، والأنظمة التلقائية المجهزة التي تحتاجها متوفرة في مكان واحد لتنطلق مباشرة.'}
            </p>

            <div className="pe-footer-badges">
              <span className="pe-foot-badge">
                <ShieldCheck size={14} style={{ color: '#3B82F6' }} />
                <span>{isEn ? '100% Automated Workflow' : 'أنظمة مؤتمتة 100%'}</span>
              </span>
              <span className="pe-foot-badge">
                <Bot size={14} style={{ color: '#8B5CF6' }} />
                <span>{isEn ? 'AI Co-Pilot Included' : 'مساعد ذكي متكامل'}</span>
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PlatformExplanation;

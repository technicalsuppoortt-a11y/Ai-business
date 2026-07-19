import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { JOURNEY_STEPS, CURRENCY_SYMBOLS } from '../../data/database';
import { TOOLS_24H } from '../../data/toolsData';
import SmartNotebook from '../../pages/Tools/components/SmartNotebook';
import './Sidebar.css';

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { userData, logout, brandData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = state.language || 'ar';

  const currentPath = location.pathname.replace('/dashboard/', '').replace('/dashboard', '') || 'onboarding';

  // State to track expanded groups
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    // Find active step
    const activeItem = TOOLS_24H.find(step => {
      return currentPath === step.id || currentPath === `tool/${step.id}`;
    });
    if (activeItem && activeItem.group_en) {
      initial[activeItem.group_en] = true;
    } else {
      // Default to expand the first group
      initial['Analysis & Identity'] = true;
    }
    return initial;
  });

  // Auto-expand group of active item on route change
  useEffect(() => {
    const activeItem = TOOLS_24H.find(step => {
      return currentPath === step.id || currentPath === `tool/${step.id}`;
    });
    if (activeItem && activeItem.group_en) {
      setExpandedGroups(prev => ({
        ...prev,
        [activeItem.group_en]: true
      }));
    }
  }, [currentPath]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const isTrial = userData?.subscription?.type === 'trial';
  const allowedTools = brandData?.freeTrialSettings?.allowedTools || [];
  
  const isStepLocked = (stepId) => {
    if (stepId === 'onboarding') return false;
    if (!isTrial) return false;
    if (stepId === 'analysis-identity') {
      return !allowedTools.includes('analysis-identity') && 
             !allowedTools.includes('niche-selection') && 
             !allowedTools.includes('brand-naming') && 
             !allowedTools.includes('visual-identity');
    }
    return !allowedTools.includes(stepId);
  };
  
  const renderNavItem = (step) => {
    const isDone = state.completedSteps.includes(step.id);
    const isActive = currentPath === step.id || currentPath === `tool/${step.id}`;
    const label = lang === 'en' && step.label_en ? step.label_en : step.label_ar || step.label;
    const isLocked = isStepLocked(step.id);
    
    return (
      <div
        key={step.id}
        className={`nav-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''}`}
        onClick={() => {
          if (isLocked) {
            toast(
              lang === 'en' 
                ? 'Sorry, this tool is locked during the free trial.' 
                : 'عذراً، هذه الأداة غير متاحة في الفترة المجانية.',
              'warning'
            );
            return;
          }
          handleNav(step.id, step.section === 'tools' || step.section === 'freelance');
        }}
      >
        <div className={`nav-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''}`}>
          {isLocked ? '🔒' : (isDone ? '✓' : step.icon)}
        </div>
        <span>{label}</span>
      </div>
    );
  };

  const totalStepsCount = JOURNEY_STEPS.length + TOOLS_24H.length;
  const progressPct = Math.round((state.completedSteps.length / totalStepsCount) * 100) || 0;

  const badges = { 
    beginner: lang === 'en' ? 'Beginner' : 'مبتدئ', 
    medium: lang === 'en' ? 'Intermediate' : 'متوسط', 
    pro: lang === 'en' ? 'Pro' : 'محترف' 
  };
  const badgeClass = { beginner: 'badge-green', medium: 'badge-amber', pro: 'badge-blue' };

  const navSections = [
    { label: lang === 'en' ? 'Start' : 'البداية', items: JOURNEY_STEPS.filter(s => s.section === 'start') },
    { label: lang === 'en' ? 'Foundation' : 'التأسيس', items: JOURNEY_STEPS.filter(s => s.section === 'foundation') },
    { label: lang === 'en' ? 'Growth' : 'النمو', items: JOURNEY_STEPS.filter(s => s.section === 'growth') },
    { label: lang === 'en' ? 'Scale' : 'التوسع', items: JOURNEY_STEPS.filter(s => s.section === 'scale') },
    { label: lang === 'en' ? 'AI Tools' : 'أدوات ذكية (AI)', items: TOOLS_24H.filter(s => s.section === 'tools') },
  ].filter(section => section.items.length > 0);

  const handleNav = (stepId, isTool = false) => {
    if (isTool) {
      navigate(`/dashboard/tool/${stepId}`);
    } else {
      navigate(`/dashboard/${stepId}`);
    }
  };

  const handleLogout = async () => {
    if (confirm(lang === 'en' ? 'Logout?' : 'تسجيل خروج؟')) {
      await logout();
      navigate('/auth');
    }
  };

  // Use Firebase user data for display
  const displayName = userData?.ownerName || userData?.brandName || state.user.name || (lang === 'en' ? 'New User' : 'مستخدم جديد');
  const displayEmail = userData?.email || '';
  const displayRole = userData?.role === 'admin' 
    ? (lang === 'en' ? 'Admin' : 'أدمن') 
    : (lang === 'en' ? 'User' : 'مستخدم');

  return (
    <aside className="sidebar">
      {/* Settings Controls */}
      <div className="sidebar-controls">
        <button 
          onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'ar' ? 'en' : 'ar' })}
          title="تغيير لغة المخرجات (العربية / English)"
        >
          <span>🌍</span> {state.language === 'ar' ? 'English' : 'العربية'}
        </button>

        <button 
          className={`note-global-btn ${isStepLocked('smart-notebook') ? 'locked' : ''}`}
          onClick={() => {
            if (isStepLocked('smart-notebook')) {
              toast(
                lang === 'en' 
                  ? 'Sorry, the Smart Notebook is locked during the free trial.' 
                  : 'عذراً، دفتر الملاحظات غير متاح في الفترة المجانية.',
                'warning'
              );
              return;
            }
            navigate('/dashboard/tool/smart-notebook');
          }}
          title={lang === 'en' ? 'Quick Notes' : 'ملاحظات سريعة'}
        >
          <span>{isStepLocked('smart-notebook') ? '🔒' : '📓'}</span> {lang === 'en' ? 'Note' : 'ملاحظة'}
        </button>

        <select
          className="field-select"
          value={state.currency}
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'currency', value: e.target.value })}
        >
          {Object.entries(CURRENCY_SYMBOLS[lang] || CURRENCY_SYMBOLS['ar']).map(([code, sym]) => (
            <option key={code} value={code}>{sym} {code}</option>
          ))}
        </select>
      </div>

      {/* Progress moved to TOP */}
      <div className="sidebar-progress" style={{ padding: '16px 20px 0' }}>
        <div className="progress-label">
          <span>{lang === 'en' ? 'Progress' : 'تقدمك'}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map(section => {
          const isAiTools = section.label.includes('AI') || section.label.includes('ذكية');
          
          return (
            <div className="nav-section" key={section.label}>
              <div className="nav-label">{section.label}</div>
              
              {isAiTools ? (
                // Group items for AI Tools
                (() => {
                  const groups = [];
                  section.items.forEach(step => {
                    const groupKey = step.group_en || 'Other';
                    const groupLabel = lang === 'en' ? (step.group_en || 'Other') : (step.group_ar || 'أخرى');
                    
                    let existingGroup = groups.find(g => g.key === groupKey);
                    if (!existingGroup) {
                      existingGroup = {
                        key: groupKey,
                        label: groupLabel,
                        items: []
                      };
                      groups.push(existingGroup);
                    }
                    existingGroup.items.push(step);
                  });
                  
                  return groups.map(group => {
                    const isExpanded = !!expandedGroups[group.key];
                    return (
                      <div key={group.key} className="nav-group-container">
                        <div 
                          className={`nav-sublabel-toggle ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => toggleGroup(group.key)}
                        >
                          <span className="nav-sublabel-title">{group.label}</span>
                          <svg 
                            className="chevron-icon" 
                            viewBox="0 0 24 24" 
                            width="12" 
                            height="12" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                        <div className={`nav-group-items-wrapper ${isExpanded ? 'expanded' : ''}`}>
                          <div className="nav-group-items-inner">
                            {group.items.map(step => renderNavItem(step))}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                // Normal rendering for other sections
                section.items.map(step => renderNavItem(step))
              )}
            </div>
          );
        })}

        <div className="nav-divider" />
        <div className="nav-section">
          <div className="nav-label">{lang === 'en' ? 'Tools' : 'أدوات'}</div>
          <div 
            className={`nav-item ${currentPath === 'brand-library' || currentPath === 'tool/brand-library' ? 'active' : ''} ${isStepLocked('brand-library') ? 'locked' : ''}`} 
            onClick={() => {
              if (isStepLocked('brand-library')) {
                toast(
                  lang === 'en' 
                    ? 'Sorry, this section is locked during the free trial.' 
                    : 'عذراً، هذا القسم غير متاح في الفترة المجانية.',
                  'warning'
                );
                return;
              }
              handleNav('brand-library', true);
            }}
          >
            <div className="nav-step">{isStepLocked('brand-library') ? '🔒' : '📚'}</div>
            <span>{lang === 'en' ? 'Product Library' : 'مكتبة المنتجات'}</span>
          </div>
          <div className={`nav-item ${currentPath === 'settings' ? 'active' : ''}`} onClick={() => handleNav('settings')}>
            <div className="nav-step">⚙</div>
            <span>{lang === 'en' ? 'Settings' : 'الإعدادات'}</span>
          </div>
          <div className={`nav-item ${currentPath === 'tutorial' ? 'active' : ''}`} onClick={() => handleNav('tutorial')}>
            <div className="nav-step">📺</div>
            <span>{lang === 'en' ? 'Tutorial' : 'فيديو الشرح'}</span>
          </div>
          {(userData?.role === 'admin' || userData?.role === 'superadmin') && (
            <div className="nav-item" onClick={() => navigate('/admin')} style={{ borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 8 }}>
              <div className="nav-step" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent)' }}>🛡</div>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{lang === 'en' ? 'Admin Panel' : 'لوحة الأدمن'}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Fixed Bottom Section: Profile + API + Footer */}
      <div style={{ borderTop: '1px solid var(--line)', background: 'var(--panel)', paddingBottom: 10 }}>
        {/* User Profile fixed below navigation */}
        <div className="user-card" onClick={() => handleNav('profile')} style={{ margin: '12px 12px 8px' }}>
          <div className="user-card-inner">
            <div className="user-avatar" style={userData?.photoURL ? { background: `url("${userData.photoURL}") center/cover no-repeat` } : {}}>
              {!userData?.photoURL && (displayName?.charAt(0) || 'م')}
            </div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-meta" style={{ fontSize: 10, opacity: 0.7 }}>{displayEmail}</div>
              <div className="user-meta">{state.exactTitle || state.subNiche || displayRole}</div>
            </div>
          </div>
          <div className={`badge ${badgeClass[state.user.level] || 'badge-green'}`} style={{ marginTop: 6 }}>
            {badges[state.user.level] || (lang === 'en' ? 'Beginner' : 'مبتدئ')}
          </div>
        </div>

        {/* API Status */}
        <div className="api-status" style={{ padding: '0 16px 8px' }}>
          <div className={`api-dot ${state.apiKey ? 'active' : ''}`} />
          <span style={{ fontSize: 9 }}>{state.apiKey ? (lang === 'en' ? 'AI Active ✓' : 'AI نشط ✓') : (lang === 'en' ? 'No API · Local AI' : 'بدون API · ذكاء محلي')}</span>
        </div>

        {/* Social Links */}
        {brandData?.socialLinks && Object.values(brandData.socialLinks).some(link => link) && (
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', padding: '0 16px 8px' }}>
            {brandData.socialLinks.facebook && <a href={brandData.socialLinks.facebook} target="_blank" rel="noreferrer" style={{color: 'var(--text2)', transition: 'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text2)'}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-1.1 0-2 .9-2 2v1h3l-1 3h-2v6.8c4.56-.93 8-4.96 8-9.8z"/></svg></a>}
            {brandData.socialLinks.instagram && <a href={brandData.socialLinks.instagram} target="_blank" rel="noreferrer" style={{color: 'var(--text2)', transition: 'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text2)'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>}
            {brandData.socialLinks.tiktok && <a href={brandData.socialLinks.tiktok} target="_blank" rel="noreferrer" style={{color: 'var(--text2)', transition: 'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text2)'}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.39-2.9 5.82-1.63 1.34-3.87 1.96-5.96 1.77-2.07-.18-4.04-1.19-5.38-2.73C.96 20.15.31 18.2.33 16.21c.02-2.15.82-4.3 2.27-5.92 1.41-1.57 3.51-2.43 5.67-2.39v4.06c-1.53.04-3.08.73-3.99 1.97-.83 1.11-1.13 2.6-.74 3.94.39 1.35 1.45 2.5 2.77 3.02 1.31.53 2.87.51 4.14-.14 1.25-.64 2.19-1.85 2.45-3.24.27-1.42.12-2.87.12-4.32V.02h3.5z"/></svg></a>}
            {brandData.socialLinks.twitter && <a href={brandData.socialLinks.twitter} target="_blank" rel="noreferrer" style={{color: 'var(--text2)', transition: 'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text2)'}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>}
            {brandData.socialLinks.linkedin && <a href={brandData.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{color: 'var(--text2)', transition: 'color 0.2s'}} onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text2)'}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM20.45 20.45h-3.56v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.96v5.7h-3.56V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/></svg></a>}
          </div>
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-btn" onClick={() => handleNav('settings')}>⚙ {lang === 'en' ? 'Settings' : 'إعدادات'}</div>
          <div className="footer-btn danger" onClick={handleLogout}>
            <span>🚪</span> {lang === 'en' ? 'Logout' : 'تسجيل الخروج'}
          </div>
        </div>
      </div>
    </aside>
  );
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CURRENCY_SYMBOLS } from '../../data/database';
import { TOOLS_24H } from '../../data/toolsData';
import { 
  Globe, 
  Sun, 
  Moon, 
  Coins, 
  BookOpen, 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  User, 
  LogOut, 
  Settings, 
  Sparkles,
  ChevronDown,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './DashboardNavbar.css';

export default function DashboardNavbar({ 
  isCollapsed, 
  onToggleCollapse, 
  onOpenMobileMenu 
}) {
  const { state, dispatch } = useApp();
  const { userData, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [theme, setTheme] = useState(() => {
    return document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
  });

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const root = document.documentElement;
    if (nextTheme === 'light') {
      root.classList.add('light-mode');
      root.style.removeProperty('--bg');
      root.style.removeProperty('--bg2');
      root.style.removeProperty('--text');
      root.style.removeProperty('--line');
    } else {
      root.classList.remove('light-mode');
      root.style.setProperty('--bg', '#080C14');
      root.style.setProperty('--bg2', '#0D1220');
      root.style.setProperty('--text', '#FFFFFF');
      root.style.setProperty('--line', 'rgba(255,255,255,0.08)');
    }
    localStorage.setItem('ui_theme', nextTheme);
    setTheme(nextTheme);
  };

  // Extract current page title
  const currentPath = location.pathname.replace('/dashboard/', '').replace('/dashboard', '') || 'onboarding';
  
  const currentTool = TOOLS_24H.find(t => t.id === currentPath || `tool/${t.id}` === currentPath);
  const pageTitle = currentTool 
    ? (lang === 'en' ? (currentTool.label_en || currentTool.label) : (currentTool.label_ar || currentTool.label))
    : (currentPath === 'settings' 
        ? (lang === 'en' ? 'Settings' : 'الإعدادات') 
        : (currentPath === 'profile' 
            ? (lang === 'en' ? 'Profile' : 'الملف الشخصي')
            : (currentPath === 'brand-library' 
                ? (lang === 'en' ? 'Product Library' : 'مكتبة المنتجات')
                : (currentPath === 'tutorial'
                    ? (lang === 'en' ? 'Tutorial' : 'فيديو الشرح')
                    : (lang === 'en' ? 'Dashboard' : 'لوحة التحكم')))));

  const displayName = userData?.ownerName || userData?.brandName || state.user.name || (lang === 'en' ? 'User' : 'مستخدم');
  const displayEmail = userData?.email || '';

  const isTrial = userData?.subscription?.type === 'trial';
  const allowedTools = userData?.freeTrialSettings?.allowedTools || brandData?.freeTrialSettings?.allowedTools || [];
  const isNotebookLocked = isTrial && !allowedTools.includes('smart-notebook');

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const confirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate('/auth');
    toast(lang === 'en' ? 'Logged out successfully' : 'تم تسجيل الخروج بنجاح', 'info');
  };

  const currencyList = Object.entries(CURRENCY_SYMBOLS[lang] || CURRENCY_SYMBOLS['ar']);

  return (
    <header className="db-navbar" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* LEFT / START: MOBILE MENU + COLLAPSE TOGGLE + TITLE */}
      <div className="db-navbar-start">
        {/* Mobile Hamburger Toggle */}
        <button 
          className="db-nav-icon-btn mobile-only"
          onClick={onOpenMobileMenu}
          title={lang === 'en' ? 'Open Menu' : 'فتح القائمة'}
        >
          <Menu size={20} />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button 
          className="db-nav-icon-btn desktop-only"
          onClick={onToggleCollapse}
          title={isCollapsed 
            ? (lang === 'en' ? 'Expand Sidebar' : 'توسيع القائمة') 
            : (lang === 'en' ? 'Collapse Sidebar' : 'طي القائمة')}
        >
          {isCollapsed ? (
            isRtl ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />
          ) : (
            isRtl ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />
          )}
        </button>

        {/* Page Context Indicator / Breadcrumb */}
        <div className="db-navbar-title-wrap">
          <span className="db-navbar-badge">
            <Sparkles size={13} className="sparkle-icon" />
            <span>AI Business</span>
          </span>
          <h1 className="db-navbar-page-title">{pageTitle}</h1>
        </div>
      </div>

      {/* RIGHT / END: CONTROLS & DROPDOWNS */}
      <div className="db-navbar-end">
        {/* Smart Notebook Quick Access */}
        <button
          className={`db-nav-chip-btn notebook-btn ${isNotebookLocked ? 'locked' : ''}`}
          onClick={() => {
            if (isNotebookLocked) {
              toast(
                lang === 'en' 
                  ? 'Smart Notebook is locked during free trial.' 
                  : 'دفتر الملاحظات غير متاح في الفترة المجانية.',
                'warning'
              );
              return;
            }
            navigate('/dashboard/tool/smart-notebook');
          }}
          title={lang === 'en' ? 'Smart Notebook' : 'دفتر الملاحظات الذكي'}
        >
          {isNotebookLocked ? <Lock size={14} /> : <BookOpen size={14} />}
          <span className="btn-label">{lang === 'en' ? 'Notes' : 'الملاحظات'}</span>
        </button>

        {/* Currency Dropdown */}
        <div className="db-nav-dropdown-wrap">
          <button 
            className="db-nav-chip-btn"
            onClick={() => {
              setCurrencyDropdownOpen(!currencyDropdownOpen);
              setLangDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            title={lang === 'en' ? 'Select Currency' : 'اختر العملة'}
          >
            <Coins size={14} />
            <span className="btn-label">{state.currency}</span>
            <ChevronDown size={12} className={`chevron ${currencyDropdownOpen ? 'open' : ''}`} />
          </button>

          <AnimatePresence>
            {currencyDropdownOpen && (
              <motion.div 
                className="db-nav-dropdown-menu"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="dropdown-header">{lang === 'en' ? 'Select Currency' : 'عملة الحساب'}</div>
                {currencyList.map(([code, sym]) => (
                  <button
                    key={code}
                    className={`dropdown-item ${state.currency === code ? 'active' : ''}`}
                    onClick={() => {
                      dispatch({ type: 'SET_FIELD', field: 'currency', value: code });
                      setCurrencyDropdownOpen(false);
                    }}
                  >
                    <span className="sym">{sym}</span>
                    <span className="code">{code}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Dropdown */}
        <div className="db-nav-dropdown-wrap">
          <button 
            className="db-nav-chip-btn"
            onClick={() => {
              setLangDropdownOpen(!langDropdownOpen);
              setCurrencyDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            title={lang === 'en' ? 'Switch Language' : 'تغيير اللغة'}
          >
            <Globe size={14} />
            <span className="btn-label">{lang === 'ar' ? 'العربية' : 'English'}</span>
            <ChevronDown size={12} className={`chevron ${langDropdownOpen ? 'open' : ''}`} />
          </button>

          <AnimatePresence>
            {langDropdownOpen && (
              <motion.div 
                className="db-nav-dropdown-menu"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  className={`dropdown-item ${lang === 'ar' ? 'active' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'SET_LANGUAGE', payload: 'ar' });
                    setLangDropdownOpen(false);
                  }}
                >
                  <span>🇸🇦</span>
                  <span>العربية (RTL)</span>
                </button>
                <button
                  className={`dropdown-item ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'SET_LANGUAGE', payload: 'en' });
                    setLangDropdownOpen(false);
                  }}
                >
                  <span>🇺🇸</span>
                  <span>English (LTR)</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark / Light Theme Mode Toggle */}
        <button 
          className="db-nav-icon-btn"
          onClick={toggleTheme}
          title={lang === 'en' ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : (theme === 'light' ? 'الوضع الداكن' : 'الوضع المضيء')}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="db-nav-dropdown-wrap">
          <button 
            className="db-nav-profile-btn"
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setLangDropdownOpen(false);
              setCurrencyDropdownOpen(false);
            }}
          >
            <div className="avatar" style={userData?.photoURL ? { backgroundImage: `url("${userData.photoURL}")` } : {}}>
              {!userData?.photoURL && (displayName.charAt(0).toUpperCase() || 'U')}
            </div>
            <span className="user-name desktop-only">{displayName}</span>
            <ChevronDown size={12} className={`chevron desktop-only ${userDropdownOpen ? 'open' : ''}`} />
          </button>

          <AnimatePresence>
            {userDropdownOpen && (
              <motion.div 
                className="db-nav-dropdown-menu profile-menu"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="user-info-card">
                  <div className="name">{displayName}</div>
                  <div className="email">{displayEmail}</div>
                </div>

                <div className="dropdown-divider" />

                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/dashboard/profile');
                    setUserDropdownOpen(false);
                  }}
                >
                  <User size={14} />
                  <span>{lang === 'en' ? 'My Profile' : 'حسابي الشخصي'}</span>
                </button>

                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/dashboard/settings');
                    setUserDropdownOpen(false);
                  }}
                >
                  <Settings size={14} />
                  <span>{lang === 'en' ? 'Settings' : 'الإعدادات'}</span>
                </button>

                <div className="dropdown-divider" />

                <button 
                  className="dropdown-item danger"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                >
                  <LogOut size={14} />
                  <span>{lang === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PROFESSIONAL NAVBAR LOGOUT CONFIRMATION MODAL */}
      {createPortal(
        <AnimatePresence>
          {isLogoutModalOpen && (
            <div className="navbar-logout-backdrop" onClick={() => setIsLogoutModalOpen(false)}>
              <motion.div
                className="navbar-logout-modal-box"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="nav-logout-header">
                  <div className="nav-logout-icon-glow">
                    <LogOut size={24} color="#EF4444" />
                  </div>
                  <div>
                    <h3 className="nav-logout-title">
                      {lang === 'en' ? 'Confirm Logout?' : 'تأكيد تسجيل الخروج؟'}
                    </h3>
                    <p className="nav-logout-user">
                      {displayName} ({displayEmail})
                    </p>
                  </div>
                </div>

                <p className="nav-logout-desc">
                  {lang === 'en'
                    ? 'Are you sure you want to log out from your account? You will need to sign in again to access your business strategy tools.'
                    : 'هل أنت متأكد من رغبتك في تسجيل الخروج؟ ستحتاج إلى إعادة تسجيل الدخول لاحقاً للوصول إلى أدوات لوحة التحكم.'}
                </p>

                <div className="nav-logout-actions">
                  <button
                    className="nav-logout-cancel-btn"
                    onClick={() => setIsLogoutModalOpen(false)}
                  >
                    {lang === 'en' ? 'Cancel' : 'إلغاء'}
                  </button>
                  <button
                    className="nav-logout-confirm-btn"
                    onClick={confirmLogout}
                  >
                    <LogOut size={16} />
                    <span>{lang === 'en' ? 'Logout Account' : 'تسجيل الخروج'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}

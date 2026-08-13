import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/Landing/LandingPage';
import AuthPage from './pages/Auth/AuthPage';
import SuperAdminPage from './pages/SuperAdmin/SuperAdminPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import OnboardingPage from './pages/Onboarding/OnboardingPage';
import SettingsPage from './pages/Settings/SettingsPage';
import ToolPage from './pages/Tools/ToolPage';
import ProfilePage from './pages/Profile/ProfilePage';
import TutorialPage from './pages/Tutorial/TutorialPage';
import TermsPage from './pages/Terms/TermsPage';
import SubscriptionPlansPage from './pages/Subscription/SubscriptionPlansPage';
import MarketingTrackingPage from './pages/Tracking/MarketingTrackingPage';

import ResetPasswordPage from './pages/Auth/ResetPasswordPage';

import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { useEffect } from 'react';
import { useTrackingScripts } from './hooks/useTrackingScripts';
import React from 'react';
import PwaInstallModal from './components/common/PwaInstallModal';

export default function App() {
  const { brandData, userData, adminUserData, superAdminUserData } = useAuth();
  const { state, dispatch } = useApp();

  useTrackingScripts();

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('ui_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, []);

  // PWA Install Prompt Capture
  useEffect(() => {
    // Catch if it was already stored globally early in index.html
    if (window.deferredPWAInstallPrompt) {
      dispatch({ type: 'SET_PWA_PROMPT', payload: window.deferredPWAInstallPrompt });
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPWAInstallPrompt = e;
      dispatch({ type: 'SET_PWA_PROMPT', payload: e });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dispatch]);

  // Dynamic Brand Title and Manifest for PWA
  useEffect(() => {
    const dynamicBrandName = brandData?.name || brandData?.brandName || "AI Brand Vision";
    
    // 1. Update Document Title & Apple Meta Tag
    if (dynamicBrandName && dynamicBrandName !== "AI Brand Vision") {
      document.title = dynamicBrandName;
      let metaTag = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'apple-mobile-web-app-title';
        document.head.appendChild(metaTag);
      }
      metaTag.content = dynamicBrandName;
      
      // 2. Generate Data URI Manifest to update native prompt dynamically
      let currentFavicon = "/favicon.svg";
      const iconTag = document.querySelector("link[rel~='icon']");
      if (iconTag && iconTag.href) {
        currentFavicon = iconTag.href;
      }
      const rawLogo = brandData?.logoUrl || brandData?.logo || currentFavicon;
      
      // CRITICAL: Relative URLs in a data: URI manifest fail to resolve. Must make them absolute.
      const getAbsoluteUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return window.location.origin + (url.startsWith('/') ? '' : '/') + url;
      };
      
      const dynamicBrandLogo = getAbsoluteUrl(rawLogo);

      const dynamicManifest = {
        id: "/",
        name: dynamicBrandName,
        short_name: dynamicBrandName,
        description: `${dynamicBrandName} Platform`,
        start_url: window.location.origin + "/",
        scope: window.location.origin + "/",
        display: "standalone",
        background_color: "#080C14",
        theme_color: "#3B82F6",
        icons: [
          {
            src: dynamicBrandLogo,
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: dynamicBrandLogo,
            sizes: "192x192",
            purpose: "any maskable"
          },
          {
            src: dynamicBrandLogo,
            sizes: "512x512",
            purpose: "any maskable"
          }
        ]
      };

      const manifestString = JSON.stringify(dynamicManifest);
      // Use Data URI instead of Blob (which is blocked)
      const dataUri = `data:application/manifest+json;charset=utf-8,${encodeURIComponent(manifestString)}`;
      
      let manifestTag = document.querySelector('link[rel="manifest"]');
      if (manifestTag) {
        manifestTag.href = dataUri;
      }
    }
  }, [brandData]);


  // Apply Default Language based on Auth data
  useEffect(() => {
    const defaultLang = brandData?.defaultLanguage || adminUserData?.defaultLanguage || superAdminUserData?.defaultLanguage || userData?.defaultLanguage;
    if (defaultLang && state.language !== defaultLang) {
      dispatch({ type: 'SET_LANGUAGE', payload: defaultLang });
    }
  }, [brandData?.defaultLanguage, adminUserData?.defaultLanguage, superAdminUserData?.defaultLanguage, userData?.defaultLanguage, dispatch]);

  // Apply Brand Theme
  useEffect(() => {
    const theme = brandData?.themeConfig || adminUserData?.themeConfig || superAdminUserData?.themeConfig || userData?.themeConfig;
    const isLightMode = document.documentElement.classList.contains('light-mode');
    
    const root = document.documentElement;
    if (theme) {
      if (theme.accent) root.style.setProperty('--accent', theme.accent);
      if (theme.success) root.style.setProperty('--green', theme.success);
      if (theme.font) {
        root.style.setProperty('--font-family', `"${theme.font}", sans-serif`);
        root.style.fontFamily = `"${theme.font}", sans-serif`;
      }
      if (!isLightMode) {
        if (theme.bg) root.style.setProperty('--bg', theme.bg);
        if (theme.sidebar) root.style.setProperty('--bg2', theme.sidebar);
        if (theme.text) root.style.setProperty('--text', theme.text);
        if (theme.line) root.style.setProperty('--line', theme.line);
      } else {
        root.style.removeProperty('--bg');
        root.style.removeProperty('--bg2');
        root.style.removeProperty('--text');
        root.style.removeProperty('--line');
      }
    } else {
      root.style.setProperty('--accent', '#3B82F6');
      root.style.setProperty('--green', '#10B981');
      if (!isLightMode) {
        root.style.setProperty('--bg', '#080C14');
        root.style.setProperty('--bg2', '#0D1220');
        root.style.setProperty('--text', '#FFFFFF');
        root.style.setProperty('--line', 'rgba(255,255,255,0.08)');
      } else {
        root.style.removeProperty('--bg');
        root.style.removeProperty('--bg2');
        root.style.removeProperty('--text');
        root.style.removeProperty('--line');
      }
    }

    root.style.setProperty('--line2', 'rgba(255,255,255,0.15)');
    root.style.setProperty('--text2', '#94A3B8');
    root.style.setProperty('--text3', '#64748B');
    root.style.setProperty('--radius', '16px');
    root.style.setProperty('--radius-sm', '10px');
    
  }, [brandData?.themeConfig, adminUserData?.themeConfig, superAdminUserData?.themeConfig, userData?.themeConfig]);

  return (
    <React.Fragment>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* === LOGIN PAGES (independent) === */}
      <Route path="/auth" element={<AuthPage portal="user" redirectTo="/dashboard/onboarding" />} />
      <Route path="/admin/login" element={<AuthPage portal="admin" redirectTo="/admin" />} />
      <Route path="/superadmin/login" element={<AuthPage portal="superadmin" redirectTo="/superadmin" />} />

      {/* === PROTECTED: Super Admin === */}
      <Route path="/superadmin" element={
        <ProtectedRoute requiredRole="superadmin" requiredPortal="superadmin" loginPath="/superadmin/login">
          <SuperAdminPage />
        </ProtectedRoute>
      } />

      {/* === PROTECTED: Admin Dashboard === */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin" requiredPortal="admin" loginPath="/admin/login">
          <AdminDashboardPage />
        </ProtectedRoute>
      } />

      {/* === PROTECTED: Tools Dashboard (any user) === */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="user" requiredPortal="user" loginPath="/auth">
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="onboarding" replace />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="tracking" element={<MarketingTrackingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="tutorial" element={<TutorialPage />} />
        <Route path="subscription" element={<SubscriptionPlansPage />} />
        <Route path="tool/:toolId" element={<ToolPage />} />
      </Route>

      <Route path="/b/:brandSlug" element={<LandingPage />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

      {/* Global PWA Install Modal */}
      <PwaInstallModal 
        isOpen={state.pwaModalOpen} 
        onClose={() => dispatch({ type: 'SET_PWA_MODAL', payload: false })} 
      />
    </React.Fragment>
  );
}

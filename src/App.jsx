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

import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { useEffect } from 'react';

export default function App() {
  const { brandData, userData, adminUserData, superAdminUserData } = useAuth();
  const { state, dispatch } = useApp();

  // Apply Default Language based on Auth data
  useEffect(() => {
    const defaultLang = brandData?.defaultLanguage || adminUserData?.defaultLanguage || superAdminUserData?.defaultLanguage || userData?.defaultLanguage;
    if (defaultLang && state.language !== defaultLang) {
      dispatch({ type: 'SET_LANGUAGE', payload: defaultLang });
    }
  }, [brandData?.defaultLanguage, adminUserData?.defaultLanguage, superAdminUserData?.defaultLanguage, userData?.defaultLanguage, dispatch]);

  // Apply Brand Theme
  useEffect(() => {
    // Priority: Specific Brand Page > Admin Portal > Super Admin > User Portal > Default
    const theme = brandData?.themeConfig || adminUserData?.themeConfig || superAdminUserData?.themeConfig || userData?.themeConfig;
    
    const root = document.documentElement;
    if (theme) {
      if (theme.accent) root.style.setProperty('--accent', theme.accent);
      if (theme.success) root.style.setProperty('--green', theme.success);
      if (theme.bg) root.style.setProperty('--bg', theme.bg);
      if (theme.sidebar) root.style.setProperty('--bg2', theme.sidebar);
      if (theme.text) root.style.setProperty('--text', theme.text);
      if (theme.line) root.style.setProperty('--line', theme.line);
      if (theme.font) {
        root.style.setProperty('--font-family', `"${theme.font}", sans-serif`);
        root.style.fontFamily = `"${theme.font}", sans-serif`;
      }
    } else {
      root.style.setProperty('--accent', '#3B82F6');
      root.style.setProperty('--green', '#10B981');
      root.style.setProperty('--bg', '#080C14');
      root.style.setProperty('--bg2', '#0D1220');
      root.style.setProperty('--text', '#FFFFFF');
      root.style.setProperty('--line', 'rgba(255,255,255,0.08)');
    }
    // Always ensure base variables are set if not provided by theme
    if (!theme?.line) root.style.setProperty('--line', 'rgba(255,255,255,0.08)');
    if (!theme?.line2) root.style.setProperty('--line2', 'rgba(255,255,255,0.15)');
    if (!theme?.text) root.style.setProperty('--text', '#FFFFFF');
    if (!theme?.text2) root.style.setProperty('--text2', '#94A3B8');
    if (!theme?.text3) root.style.setProperty('--text3', '#64748B');
    root.style.setProperty('--radius', '16px');
    root.style.setProperty('--radius-sm', '10px');
    
  }, [brandData?.themeConfig, adminUserData?.themeConfig, superAdminUserData?.themeConfig, userData?.themeConfig]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

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
        <Route path="profile" element={<ProfilePage />} />
        <Route path="tutorial" element={<TutorialPage />} />
        <Route path="tool/:toolId" element={<ToolPage />} />
      </Route>

      <Route path="/b/:brandSlug" element={<LandingPage />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

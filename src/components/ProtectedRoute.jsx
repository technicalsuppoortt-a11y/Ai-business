import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — checks auth + role + portal independence.
 * @param {string} requiredRole - 'user' | 'admin' | 'superadmin'
 * @param {string} requiredPortal - 'user' | 'admin' | 'superadmin'
 * @param {string} loginPath - redirect path if not authenticated
 */
export default function ProtectedRoute({ children, requiredRole = 'user', requiredPortal = 'user', loginPath = '/auth' }) {
  const { loading, isAuthenticatedFor, getUserDataFor } = useAuth();
  
  const isAuth = isAuthenticatedFor(requiredPortal);
  const userData = getUserDataFor(requiredPortal);

  // Show loading while Firebase auth is initializing
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg, #080C14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid rgba(255,255,255,0.15)',
          borderTopColor: 'var(--accent, #3B82F6)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 13, color: 'var(--text2, #94A3B8)' }}>جاري التحقق...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // Not logged in to THIS portal
  if (!isAuth) {
    return <Navigate to={loginPath} replace />;
  }

  // CRITICAL: Auth is confirmed but user data is still loading from Firestore.
  // This happens because onAuthStateChanged fires before onSnapshot resolves.
  // We must wait for userData before checking roles.
  if (isAuth && !userData) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'var(--bg, #080C14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid rgba(255,255,255,0.15)',
          borderTopColor: 'var(--accent, #3B82F6)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 13, color: 'var(--text2, #94A3B8)' }}>جاري تحميل البيانات...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // Check role hierarchy within this portal's user data
  if (requiredRole === 'superadmin' && userData?.role !== 'superadmin') {
    return <Navigate to="/?error=not_superadmin" replace />;
  }

  if (requiredRole === 'admin' && userData?.role !== 'admin' && userData?.role !== 'superadmin') {
    return <Navigate to="/?error=not_admin" replace />;
  }
  
  // Subscription Check (Excluding Admin & Super Admin)
  if (userData?.role !== 'superadmin' && userData?.role !== 'admin') {
    const sub = userData?.subscription;
    const isStopped = sub?.status === 'stopped';
    const isLifetime = sub?.type === 'lifetime';
    const expiry = sub?.expiryDate?.toDate ? sub.expiryDate.toDate() : (sub?.expiryDate ? new Date(sub.expiryDate) : null);
    const isExpired = !isLifetime && expiry && expiry < new Date();

    if (isStopped || isExpired) {
       return <Navigate to={`${loginPath}?error=subscription_inactive`} replace />;
    }
  }

  return children;
}


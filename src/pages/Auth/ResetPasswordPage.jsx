import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth, adminAuth } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Server
} from 'lucide-react';

export default function ResetPasswordPage({ portal = 'user' }) {
  const { state } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [oobCode, setOobCode] = useState('');
  const [email, setEmail] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [invalidCode, setInvalidCode] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const authInstance = portal === 'admin' ? adminAuth : auth;
  const loginPath = portal === 'admin' ? '/admin/login' : '/auth';

  // Extract and verify oobCode from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('oobCode');

    if (!code) {
      setVerifying(false);
      setInvalidCode(true);
      return;
    }

    setOobCode(code);

    verifyPasswordResetCode(authInstance, code)
      .then((accountEmail) => {
        setEmail(accountEmail || '');
        setVerifying(false);
      })
      .catch((err) => {
        console.error('Verify password reset code error:', err);
        setVerifying(false);
        setInvalidCode(true);
      });
  }, [location.search, authInstance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      return toast(lang === 'en' ? 'Please enter a new password.' : 'يرجى إدخال كلمة المرور الجديدة.', 'error');
    }
    if (newPassword.length < 6) {
      return toast(lang === 'en' ? 'Password must be at least 6 characters.' : 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.', 'error');
    }
    if (newPassword !== confirmPassword) {
      return toast(lang === 'en' ? 'Passwords do not match.' : 'كلمتا المرور غير متطابقتين.', 'error');
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(authInstance, oobCode, newPassword.trim());
      setResetSuccess(true);
      toast(
        lang === 'en'
          ? 'Password updated successfully! You can now log in. 🔑'
          : 'تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول. 🔑',
        'success'
      );
    } catch (err) {
      console.error('Confirm password reset error:', err);
      toast(
        lang === 'en'
          ? `Error updating password: ${err.message}`
          : 'حدث خطأ أثناء تحديث كلمة المرور. قد يكون الرابط منتهياً.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: '#0B0F17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Segoe UI', Roboto, sans-serif"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(16px)'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(124, 58, 237, 0.2))',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#818CF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}
          >
            <Key size={26} />
          </div>

          <h2 style={{ color: '#FFFFFF', margin: '0 0 6px 0', fontSize: '20px', fontWeight: '900' }}>
            {lang === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة المرور'}
          </h2>

          <div style={{ fontSize: '12px', color: '#94A3B8' }}>
            {portal === 'admin'
              ? (lang === 'en' ? 'Admin Management Portal' : 'بوابة إدارة الأدمن')
              : (lang === 'en' ? 'User Account Portal' : 'بوابة أفراد المستخدمين')}
          </div>
        </div>

        {/* Verification Loader */}
        {verifying && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', color: '#6366F1' }}
            >
              <Sparkles size={32} />
            </motion.div>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '12px' }}>
              {lang === 'en' ? 'Verifying security recovery link...' : 'جاري التحقق من صلاحية رابط الاستعادة...'}
            </p>
          </div>
        )}

        {/* Invalid or Expired Code Card */}
        {!verifying && invalidCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                color: '#EF4444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={32} />
              <div style={{ fontWeight: '900', fontSize: '14px', color: '#FFF' }}>
                {lang === 'en' ? 'Invalid or Expired Action Link' : 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية'}
              </div>
              <div style={{ fontSize: '11px', color: '#FCA5A5', lineHeight: 1.5 }}>
                {lang === 'en'
                  ? 'This password reset link is invalid or has expired. Please request a new link from the login page.'
                  : 'عفواً، انتهت صلاحية هذا الرابط أو تم استخدامه سابقاً. يرجى طلب رابط جديد من صفحة الدخول.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(loginPath)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: '#6366F1',
                color: '#FFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{lang === 'en' ? 'Return to Login Page' : 'العودة لصفحة تسجيل الدخول'}</span>
            </button>
          </div>
        )}

        {/* Reset Success State Card */}
        {!verifying && resetSuccess && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                color: '#10B981',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={36} />
              <div style={{ fontWeight: '900', fontSize: '15px', color: '#FFF' }}>
                {lang === 'en' ? 'Password Reset Successfully!' : 'تم تغيير كلمة المرور بنجاح! 🔑'}
              </div>
              <div style={{ fontSize: '12px', color: '#6EE7B7', lineHeight: 1.5 }}>
                {lang === 'en'
                  ? 'Your account password has been updated. You can now log in with your new credentials.'
                  : 'تم تحديث كلمة المرور الخاصة بحسابك بنجاح. يمكنك الآن تسجيل الدخول بالحساب جديداً.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(loginPath)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: '900',
                cursor: 'pointer'
              }}
            >
              {lang === 'en' ? 'Proceed to Login Portal →' : 'التوجه لصفحة الدخول ←'}
            </button>
          </div>
        )}

        {/* Reset Password Input Form */}
        {!verifying && !invalidCode && !resetSuccess && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {email && (
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', color: '#FFF', fontWeight: '800' }}>
                👤 {email}
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#FFF', marginBottom: '6px', display: 'block' }}>
                {lang === 'en' ? 'New Password:' : 'كلمة المرور الجديدة:'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#64748B" style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="field-input glass-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  dir="ltr"
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    [isRtl ? 'paddingRight' : 'paddingLeft']: '38px',
                    [isRtl ? 'paddingLeft' : 'paddingRight']: '38px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFF'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', [isRtl ? 'left' : 'right']: '12px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#FFF', marginBottom: '6px', display: 'block' }}>
                {lang === 'en' ? 'Confirm New Password:' : 'تأكيد كلمة المرور الجديدة:'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="#64748B" style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="field-input glass-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  dir="ltr"
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    [isRtl ? 'paddingRight' : 'paddingLeft']: '38px',
                    [isRtl ? 'paddingLeft' : 'paddingRight']: '38px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFF'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                color: '#FFF',
                border: 'none',
                fontSize: '14px',
                fontWeight: '900',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
            >
              <ShieldCheck size={18} />
              <span>{isSubmitting ? (lang === 'en' ? 'Updating Password...' : 'جاري التحديث...') : (lang === 'en' ? 'Update Password Now 🔑' : 'حفظ كلمة المرور الجديدة 🔑')}</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

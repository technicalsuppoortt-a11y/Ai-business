import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import PhoneInput from '../../components/PhoneInput';

const authTranslations = {
  ar: {
    portals: {
      user: {
        title: 'AI Brand Vision',
        subtitle: 'صفحة الأدوات',
        badgeText: 'تسجيل دخول — أدوات',
      },
      admin: {
        title: 'لوحة تحكم البراند',
        subtitle: 'Admin Dashboard',
        badgeText: 'تسجيل دخول — أدمن',
      },
      superadmin: {
        title: 'لوحة التحكم الرئيسية',
        subtitle: 'Super Admin Panel',
        badgeText: 'تسجيل دخول — سوبر أدمن',
      }
    },
    loginTab: 'تسجيل الدخول',
    registerTab: 'إنشاء حساب جديد',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    nameLabel: 'الاسم الكامل',
    namePlaceholder: 'مثال: أحمد محمد',
    phoneLabel: 'رقم الهاتف',
    phonePlaceholder: 'مثال: 01066886844',
    loginBtn: 'دخول ←',
    loggingIn: 'جاري الدخول...',
    registerBtn: 'إنشاء حساب تجريبي ←',
    registering: 'جاري التسجيل...',
    whatsappPrompt: 'هل تريد تفعيل اشتراكك الكامل؟ تواصل مع الإدارة',
    whatsappBtn: 'تفعيل الاشتراك عن طريق الواتس اب',
    securedBy: '🔒 محمي بتقنية Firebase Authentication',
    inactiveSubscription: 'عذراً، اشتراكك متوقف أو منتهي الصلاحية. يرجى التواصل مع الإدارة.',
    // Validation & Messages
    enterEmail: 'أدخل البريد الإلكتروني',
    enterPassword: 'أدخل كلمة المرور',
    enterName: 'يرجى إدخال الاسم',
    enterPhone: 'يرجى إدخال رقم الهاتف',
    weakPassword: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    cannotResolveBrand: 'عذراً، لم نتمكن من تحديد البراند المشرف على هذا النطاق.',
    autoLoginSuccess: 'تم الدخول التلقائي للمعاينة 🔑',
    welcome: 'مرحباً بك! 🎉',
    registerSuccess: 'تم إنشاء حسابك وبدء الفترة المجانية بنجاح! 🎉',
    roleMismatchAdmin: 'هذا الحساب ليس أدمن. سجل من صفحة الأدوات.',
    roleMismatchSuper: 'هذا الحساب ليس سوبر أدمن.',
    roleMismatchDefault: 'ليس لديك صلاحية الدخول من هنا.',
    errors: {
      'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
      'auth/wrong-password': 'كلمة المرور غير صحيحة',
      'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة',
      'auth/too-many-requests': 'محاولات كثيرة جداً، حاول لاحقاً',
      'auth/user-disabled': 'هذا الحساب معطل',
      'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت',
      'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
      default: 'حدث خطأ أثناء تسجيل الدخول',
      regDefault: 'حدث خطأ أثناء إنشاء الحساب',
      'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
      'auth/weak-password': 'كلمة المرور ضعيفة جداً'
    }
  },
  en: {
    portals: {
      user: {
        title: 'AI Brand Vision',
        subtitle: 'Tools Portal',
        badgeText: 'Login — Tools',
      },
      admin: {
        title: 'Brand Admin Panel',
        subtitle: 'Admin Dashboard',
        badgeText: 'Login — Admin',
      },
      superadmin: {
        title: 'Main Control Panel',
        subtitle: 'Super Admin Panel',
        badgeText: 'Login — Super Admin',
      }
    },
    loginTab: 'Login',
    registerTab: 'Create New Account',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g. John Doe',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'e.g. +201066886844',
    loginBtn: 'Login →',
    loggingIn: 'Logging in...',
    registerBtn: 'Create Trial Account →',
    registering: 'Registering...',
    whatsappPrompt: 'Want to activate your full subscription? Contact Support',
    whatsappBtn: 'Activate Subscription via WhatsApp',
    securedBy: '🔒 Secured by Firebase Authentication',
    inactiveSubscription: 'Sorry, your subscription is suspended or expired. Please contact support.',
    // Validation & Messages
    enterEmail: 'Please enter your email address',
    enterPassword: 'Please enter your password',
    enterName: 'Please enter your full name',
    enterPhone: 'Please enter your phone number',
    weakPassword: 'Password must be at least 6 characters',
    cannotResolveBrand: 'Sorry, could not resolve the admin brand for this domain.',
    autoLoginSuccess: 'Auto logged in for preview 🔑',
    welcome: 'Welcome back! 🎉',
    registerSuccess: 'Account created and free trial started successfully! 🎉',
    roleMismatchAdmin: 'This account is not an admin. Please log in from the tools page.',
    roleMismatchSuper: 'This account is not a super admin.',
    roleMismatchDefault: 'You do not have access permission here.',
    errors: {
      'auth/user-not-found': 'Email address is not registered',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address format',
      'auth/too-many-requests': 'Too many attempts, please try again later',
      'auth/user-disabled': 'This account is disabled',
      'auth/network-request-failed': 'Network connection error',
      'auth/invalid-credential': 'Incorrect email or password',
      default: 'An error occurred during login',
      regDefault: 'An error occurred during registration',
      'auth/email-already-in-use': 'Email is already in use by another account',
      'auth/weak-password': 'Password is too weak'
    }
  }
};

/**
 * Unified Login Page — used for all 3 portals.
 * Props:
 *   portal: 'user' | 'admin' | 'superadmin'
 *   redirectTo: where to go after login
 */
export default function AuthPage({ portal = 'user', redirectTo = '/dashboard/onboarding' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [activeForm, setActiveForm] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPhoneKey, setRegisterPhoneKey] = useState('+20');
  const [resolvedBrand, setResolvedBrand] = useState(null);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminBrandName, setAdminBrandName] = useState('');

  const { login, logout, isAuthenticatedFor, getUserDataFor, loading } = useAuth();
  const { state, dispatch } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTrans = authTranslations[state.language || 'ar'] || authTranslations.ar;

  useEffect(() => {
    if (portal !== 'user') return;
    
    const resolveBrand = async () => {
      try {
        const cleanUrl = (url) => {
          if (!url) return '';
          return url
            .toLowerCase()
            .replace(/^(https?:\/\/)?(www\.)?/, '')
            .replace(/\/$/, '')
            .trim();
        };

        // 1. FIRST PRIORITY: Read from React Router state (passed from LandingPage)
        if (location.state?.resolvedBrand) {
          const adminData = location.state.resolvedBrand;
          setResolvedBrand(adminData);
          setAdminPhone(adminData.phoneNumber || '');
          setAdminBrandName(adminData.brandName || '');
          return; // Exit early! No need to query Firebase again.
        }

        const currentHref = window.location.href.toLowerCase();
        // Extract possible slugs from path (e.g., ai-brand-vision-page -> ai brand vision page)
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const urlSlugs = pathParts.map(p => p.replace(/-/g, ' ').toLowerCase());
        
        // Check for explicit query parameter (?test=mybrand)
        const explicitTest = new URLSearchParams(window.location.search).get('test');

        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const q = query(collection(db, 'users'), where('role', '==', 'admin'));
        const snap = await getDocs(q);
        
        let candidates = [];
        
        snap.forEach(docSnap => {
          const data = docSnap.data();
          const brandUrlClean = data.brandUrl ? data.brandUrl.toLowerCase().trim() : '';
          const brandNameClean = data.brandName ? data.brandName.toLowerCase().trim() : '';
          
          let isMatch = false;
          let matchScore = 0;
          
          // 1. Explicit ?test= param is highest priority
          if (explicitTest && (brandUrlClean === explicitTest || brandNameClean === explicitTest)) {
            isMatch = true;
            matchScore = 1000;
          } 
          // 2. Exact URL or Slug matching
          else {
            if (brandUrlClean && currentHref.includes(brandUrlClean.replace(/\s+/g, '-'))) {
              isMatch = true;
              matchScore = brandUrlClean.length;
            } 
            else if (brandNameClean && currentHref.includes(brandNameClean.replace(/\s+/g, '-'))) {
              isMatch = true;
              matchScore = brandNameClean.length;
            }
            // Check if the path segments match the brand name (with spaces replacing hyphens)
            else if (brandNameClean && urlSlugs.some(slug => slug.includes(brandNameClean) || brandNameClean.includes(slug))) {
              isMatch = true;
              matchScore = brandNameClean.length;
            }
          }
          
          if (isMatch) {
            candidates.push({
              admin: { uid: docSnap.id, ...data },
              score: matchScore
            });
          }
        });
        
        // Sort candidates by score descending to prioritize the most specific match
        candidates.sort((a, b) => b.score - a.score);
        
        let matchedAdmin = candidates.length > 0 ? candidates[0].admin : null;
        
        // We NO LONGER fallback to the first random admin. If no match is found, it stays null.
        // This ensures we never show an incorrect brand name (like 'abdelrhamn samy').
        if (matchedAdmin) {
          setResolvedBrand(matchedAdmin);
          setAdminPhone(matchedAdmin.phoneNumber || '');
          setAdminBrandName(matchedAdmin.brandName || '');
        } else {
          setResolvedBrand(null);
          setAdminPhone('');
          setAdminBrandName('');
        }
      } catch (err) {
        console.error('Failed to resolve brand admin:', err);
      }
    };
    
    resolveBrand();
  }, [portal]);

  const isAuth = isAuthenticatedFor(portal);
  const userData = getUserDataFor(portal);

  // Combined effect for redirects and error handling
  useEffect(() => {
    // 1. Handle URL errors (e.g. from ProtectedRoute)
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'subscription_inactive') {
      toast(activeTrans.inactiveSubscription, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Handle automatic redirect if already logged in for THIS portal
    if (!loading && isAuth && userData) {
      const sub = userData?.subscription;
      const isStopped = sub?.status === 'stopped';
      const isLifetime = sub?.type === 'lifetime';
      const expiry = sub?.expiryDate?.toDate ? sub.expiryDate.toDate() : (sub?.expiryDate ? new Date(sub.expiryDate) : null);
      const isExpired = !isLifetime && expiry && expiry < new Date();

      // Ensure the user has the correct role for THIS portal before redirecting
      const hasCorrectRole = (portal === 'superadmin' && userData.role === 'superadmin') ||
                             (portal === 'admin' && (userData.role === 'admin' || userData.role === 'superadmin')) ||
                             (portal === 'user');

      if (hasCorrectRole && (userData.role === 'superadmin' || (!isStopped && !isExpired))) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [isAuth, userData, loading, navigate, redirectTo, portal, activeTrans.inactiveSubscription]);

  // Automatic login in iframe
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (isIframe && portal === 'user' && !isAuth && !loading && !isLoading) {
      const savedEmail = sessionStorage.getItem('admin_e_token');
      const savedPassword = sessionStorage.getItem('admin_p_token');
      if (savedEmail && savedPassword) {
        setIsLoading(true);
        login(savedEmail, savedPassword, 'user')
          .then(() => {
            toast(activeTrans.autoLoginSuccess, 'success');
          })
          .catch((err) => {
            console.error('Auto login failed:', err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [portal, isAuth, loading, isLoading, login, activeTrans.autoLoginSuccess]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ad-submit-spinner" />
      </div>
    );
  }

  // Prevent flash of content if we are about to redirect
  if (isAuth && userData) {
    const sub = userData?.subscription;
    const isStopped = sub?.status === 'stopped';
    const isLifetime = sub?.type === 'lifetime';
    const expiry = sub?.expiryDate?.toDate ? sub.expiryDate.toDate() : (sub?.expiryDate ? new Date(sub.expiryDate) : null);
    const isExpired = !isLifetime && expiry && expiry < new Date();
    if (userData.role === 'superadmin' || (!isStopped && !isExpired)) {
      return null;
    }
  }

  const portalConfig = {
    user: {
      title: adminBrandName || activeTrans.portals.user.title,
      subtitle: activeTrans.portals.user.subtitle,
      badgeText: activeTrans.portals.user.badgeText,
      gradient: 'linear-gradient(135deg, var(--accent), #7C3AED)',
      icon: '📦',
    },
    admin: {
      title: activeTrans.portals.admin.title,
      subtitle: activeTrans.portals.admin.subtitle,
      badgeText: activeTrans.portals.admin.badgeText,
      gradient: 'linear-gradient(135deg, var(--accent), var(--green))',
      icon: '🛡',
    },
    superadmin: {
      title: activeTrans.portals.superadmin.title,
      subtitle: activeTrans.portals.superadmin.subtitle,
      badgeText: activeTrans.portals.superadmin.badgeText,
      gradient: 'linear-gradient(135deg, var(--amber), var(--red))',
      icon: '👑',
    },
  };

  const config = portalConfig[portal];

  const getFirebaseErrorMessage = (code) => {
    return activeTrans.errors[code] || activeTrans.errors.default;
  };

  const getRoleMismatchMessage = () => {
    if (portal === 'admin') return activeTrans.roleMismatchAdmin;
    if (portal === 'superadmin') return activeTrans.roleMismatchSuper;
    return activeTrans.roleMismatchDefault;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return toast(activeTrans.enterEmail, 'error');
    if (!password.trim()) return toast(activeTrans.enterPassword, 'error');

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password, portal);
      const uid = result.user.uid;

      // Verify role matches portal
      let role = 'user';
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          role = userDoc.data().role || 'user';
        }
      } catch { /* default */ }

      if (email.trim().toLowerCase() === 'admin@brand.com') {
        role = 'superadmin';
      }

      // Validate role for portal
      let allowed = false;
      if (portal === 'user') {
        allowed = true; // any role can access tools
      } else if (portal === 'admin') {
        allowed = role === 'admin' || role === 'superadmin';
      } else if (portal === 'superadmin') {
        allowed = role === 'superadmin';
      }

      if (!allowed) {
        // Sign out — role doesn't match portal
        await logout(portal);
        toast(getRoleMismatchMessage(), 'error');
        setIsLoading(false);
        return;
      }

      if (portal === 'admin') {
        sessionStorage.setItem('admin_e_token', email.trim());
        sessionStorage.setItem('admin_p_token', password);
      }

      toast(activeTrans.welcome, 'success');
      navigate(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      toast(getFirebaseErrorMessage(err.code), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return toast(activeTrans.enterName, 'error');
    if (!registerEmail.trim()) return toast(activeTrans.enterEmail, 'error');
    if (!registerPhone.trim()) return toast(activeTrans.enterPhone, 'error');
    if (!registerPassword.trim() || registerPassword.length < 6) {
      return toast(activeTrans.weakPassword, 'error');
    }
    if (!resolvedBrand) {
      return toast(activeTrans.cannotResolveBrand, 'error');
    }

    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, registerEmail.trim(), registerPassword);
      const uid = cred.user.uid;

      const trialDays = resolvedBrand.freeTrialSettings?.days || 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(trialDays));

      await setDoc(doc(db, 'users', uid), {
        email: registerEmail.trim().toLowerCase(),
        role: 'user',
        ownerName: name.trim(),
        phoneNumber: `${registerPhoneKey}${registerPhone.trim().replace(/^\+/, '')}`,
        brandName: resolvedBrand.brandName || '',
        createdAt: serverTimestamp(),
        createdBy: resolvedBrand.uid || '',
        subscription: {
          type: 'trial',
          expiryDate: expiryDate,
          status: 'active',
          updatedAt: serverTimestamp()
        }
      });

      toast(activeTrans.registerSuccess, 'success');
      navigate(redirectTo);
    } catch (err) {
      console.error('Registration error:', err);
      const msgs = {
        'auth/email-already-in-use': activeTrans.errors['auth/email-already-in-use'],
        'auth/invalid-email': activeTrans.errors['auth/invalid-email'],
        'auth/weak-password': activeTrans.errors['auth/weak-password'],
      };
      toast(msgs[err.code] || activeTrans.errors.regDefault, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.4s ease',
    }} dir={state.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Floating Language Toggle */}
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        right: state.language === 'ar' ? 'auto' : 20, 
        left: state.language === 'ar' ? 20 : 'auto', 
        zIndex: 10 
      }}>
        <button
          onClick={() => {
            const nextLang = state.language === 'ar' ? 'en' : 'ar';
            dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg2)',
            border: '1px solid var(--line2)',
            borderRadius: 12,
            padding: '8px 14px',
            color: 'var(--text)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--line2)';
            e.currentTarget.style.background = 'var(--bg2)';
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{state.language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '15%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'orbFloat 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'orbFloat 10s ease-in-out infinite reverse',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: 420, padding: 40,
        background: 'var(--bg2)',
        border: '1px solid var(--line2)',
        borderRadius: 20,
        boxShadow: 'var(--shadow)',
        position: 'relative', overflow: 'hidden', zIndex: 1,
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, justifyContent: 'center' }}>
          {(() => {
            const brandData = resolvedBrand;
            const logoDisplayMode = brandData?.logoDisplayMode || state?.logoDisplayMode || 'both';
            const showLogo = (brandData?.logoUrl || brandData?.logo || brandData?.photoURL) && (logoDisplayMode === 'both' || logoDisplayMode === 'logo');
            const showText = logoDisplayMode === 'both' || logoDisplayMode === 'text';
            return (
              <>
                {showLogo && (
                  <img 
                    src={brandData.logoUrl || brandData.logo || brandData.photoURL} 
                    alt="Brand Logo" 
                    style={{ maxHeight: '48px', maxWidth: '160px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} 
                  />
                )}
                {!showLogo && !showText && (
                  <div style={{
                    width: 48, height: 48,
                    background: config.gradient,
                    borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(59,130,246,0.2)',
                    fontSize: 22,
                  }}>
                    {config.icon}
                  </div>
                )}
                {showText && (
                  <div>
                    <h1 style={{ fontSize: 20, fontWeight: 800 }}>
                      {brandData?.brandName || activeTrans.portals.user.title}
                    </h1>
                    <span style={{ fontSize: 10, color: 'var(--text2)', display: 'block', marginTop: -2, letterSpacing: '.05em' }}>
                      {config.subtitle}
                    </span>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 20, padding: '4px 14px',
            fontSize: 11, color: 'var(--accent)', fontWeight: 600,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)',
            }} />
            {config.badgeText}
          </div>
        </div>

        {/* Portal Register/Login Tab Toggle */}
        {portal === 'user' && (
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '20px',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => setActiveForm('login')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeForm === 'login' ? 'var(--accent)' : 'transparent',
                color: '#fff',
                fontSize: '11px',
                fontWeight: activeForm === 'login' ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {activeTrans.loginTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('register')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeForm === 'register' ? 'var(--accent)' : 'transparent',
                color: '#fff',
                fontSize: '11px',
                fontWeight: activeForm === 'register' ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {activeTrans.registerTab}
            </button>
          </div>
        )}

        {/* Forms Container */}
        {activeForm === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label className="field-label">{activeTrans.emailLabel}</label>
              <input className="field-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" dir="ltr" autoComplete="email"
                disabled={isLoading} style={{ textAlign: 'left' }} />
            </div>

            <div className="field">
              <label className="field-label">{activeTrans.passwordLabel}</label>
              <div style={{ position: 'relative' }}>
                <input className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" dir="ltr" autoComplete="current-password"
                  disabled={isLoading} style={{ textAlign: 'left', paddingLeft: 40 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text3)', fontSize: 14, padding: 4,
                  }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full"
              disabled={isLoading}
              style={{
                marginTop: 12, padding: 14, fontSize: 14,
                opacity: isLoading ? 0.7 : 1,
                background: config.gradient, borderColor: 'transparent',
              }}>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                    display: 'inline-block',
                  }} />
                  {activeTrans.loggingIn}
                </span>
              ) : activeTrans.loginBtn}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="field">
              <label className="field-label">{activeTrans.nameLabel}</label>
              <input className="field-input" type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder={activeTrans.namePlaceholder}
                disabled={isLoading} />
            </div>

            <div className="field">
              <label className="field-label">{activeTrans.emailLabel}</label>
              <input className="field-input" type="email" value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                placeholder="your@email.com" dir="ltr" autoComplete="email"
                disabled={isLoading} style={{ textAlign: 'left' }} />
            </div>

            <div className="field">
              <label className="field-label">{activeTrans.phoneLabel}</label>
              <PhoneInput
                phoneKey={registerPhoneKey}
                setPhoneKey={setRegisterPhoneKey}
                phoneNumber={registerPhone}
                setPhoneNumber={setRegisterPhone}
                disabled={isLoading}
                placeholder={activeTrans.phonePlaceholder}
              />
            </div>

            <div className="field">
              <label className="field-label">{activeTrans.passwordLabel}</label>
              <div style={{ position: 'relative' }}>
                <input className="field-input"
                  type={showPassword ? 'text' : 'password'}
                  value={registerPassword} onChange={e => setRegisterPassword(e.target.value)}
                  placeholder="••••••••" dir="ltr" autoComplete="new-password"
                  disabled={isLoading} style={{ textAlign: 'left', paddingLeft: 40 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text3)', fontSize: 14, padding: 4,
                  }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full"
              disabled={isLoading}
              style={{
                marginTop: 12, padding: 14, fontSize: 14,
                opacity: isLoading ? 0.7 : 1,
                background: config.gradient, borderColor: 'transparent',
              }}>
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                    display: 'inline-block',
                  }} />
                  {activeTrans.registering}
                </span>
              ) : activeTrans.registerBtn}
            </button>
          </form>
        )}

        {/* WhatsApp Activation Button */}
        {portal === 'user' && adminPhone && resolvedBrand?.showWhatsappLoginBtn !== false && (
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--line)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>
              {activeTrans.whatsappPrompt}
            </div>
            <a 
              href={`https://wa.me/${adminPhone.replace(/\+/g, '').trim()}?text=${encodeURIComponent(
                state.language === 'en'
                  ? `Hello, I want to activate my subscription in the platform ${adminBrandName}`
                  : `مرحباً، أريد تفعيل اشتراكي في منصة ${adminBrandName}`
              )}`}
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                padding: '10px 18px',
                color: 'var(--green)',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                width: '100%',
                boxSizing: 'border-box'
              }}
              className="whatsapp-activation-btn"
            >
              <span style={{ fontSize: '16px' }}>💬</span>
              {activeTrans.whatsappBtn}
            </a>
          </div>
        )}

        <div style={{
          textAlign: 'center', marginTop: 20,
          fontSize: 10, color: 'var(--text3)', lineHeight: 1.8,
        }}>
          {activeTrans.securedBy}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

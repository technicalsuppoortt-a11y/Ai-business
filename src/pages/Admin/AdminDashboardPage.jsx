import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase';
import { libraryStorage } from '../../firebaseLibrary';
import { JOURNEY_STEPS } from '../../data/database';
import { TOOLS_24H } from '../../data/toolsData';
import { useApp } from '../../context/AppContext';
import AdminSales from './AdminSales';
import AdminLibrary from './AdminLibrary';
import PhoneInput from '../../components/PhoneInput';
import PlatformExplanation from '../../components/common/PlatformExplanation';
import './Admin.css';

export default function AdminDashboardPage() {
  const { state, dispatch } = useApp();
  const { adminUserData: userData, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUserDetails, setViewingUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'settings' | 'sales' | 'subscriptions'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [ownerNameForm, setOwnerNameForm] = useState('');
  const [brandNameForm, setBrandNameForm] = useState('');
  const [brandUrlForm, setBrandUrlForm] = useState('');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [successColor, setSuccessColor] = useState('#10B981');
  const [bgColor, setBgColor] = useState('#080C14');
  const [sidebarColor, setSidebarColor] = useState('#0D1220');
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [lineColor, setLineColor] = useState('#1e293b');
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', twitter: '', linkedin: '', tiktok: '' });
  const [defaultLanguage, setDefaultLanguage] = useState('ar');
  const [landingTemplate, setLandingTemplate] = useState('default');
  const [logoDisplayMode, setLogoDisplayMode] = useState('both');
  const [showWhatsappLoginBtn, setShowWhatsappLoginBtn] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // For creating/editing users
  const [adminProfileImage, setAdminProfileImage] = useState(null); // For admin's own profile
  const [phoneNumberForm, setPhoneNumberForm] = useState('');
  const [phoneKeyForm, setPhoneKeyForm] = useState('+20');

  const [iframeKey, setIframeKey] = useState(0);

  // Debounced auto-refresh for the iframe to fully update subcomponents after color changes stop
  useEffect(() => {
    const handler = setTimeout(() => {
      setIframeKey(prev => prev + 1);
    }, 1200);
    return () => clearTimeout(handler);
  }, [accentColor, successColor, bgColor, sidebarColor, fontFamily, textColor, lineColor]);

  // Real-time instant injector for live colors in the iframe without waiting for refresh
  useEffect(() => {
    const iframe = document.getElementById('preview-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        const root = iframe.contentWindow.document.documentElement;
        if (root) {
          root.style.setProperty('--accent', accentColor);
          root.style.setProperty('--green', successColor);
          root.style.setProperty('--bg', bgColor);
          root.style.setProperty('--bg2', sidebarColor);
          root.style.setProperty('--font', fontFamily);
          root.style.setProperty('--text', textColor);
          root.style.setProperty('--line', lineColor);
        }
      } catch (err) {
        // Safe cross-origin check
      }
    }
  }, [accentColor, successColor, bgColor, sidebarColor, fontFamily, textColor, lineColor]);

  const handleIframeLoad = () => {
    const iframe = document.getElementById('preview-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        const root = iframe.contentWindow.document.documentElement;
        if (root) {
          root.style.setProperty('--accent', accentColor);
          root.style.setProperty('--green', successColor);
          root.style.setProperty('--bg', bgColor);
          root.style.setProperty('--bg2', sidebarColor);
          root.style.setProperty('--font', fontFamily);
          root.style.setProperty('--text', textColor);
          root.style.setProperty('--line', lineColor);
        }
      } catch (err) {
        console.error('Failed to inject iframe style:', err);
      }
    }
  };

  // Plans management
  const [plans, setPlans] = useState([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planName, setPlanName] = useState('');
  const [planNameEn, setPlanNameEn] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planCurrency, setPlanCurrency] = useState('EGP');
  const [planFeatures, setPlanFeatures] = useState('');
  const [planFeaturesEn, setPlanFeaturesEn] = useState('');

  // Prevent multiple state initializations
  const [isInitialized, setIsInitialized] = useState(false);

  // Subscription management for sub-users
  const [subType, setSubType] = useState('monthly');
  const [subDays, setSubDays] = useState(30);

  // Free Trial Settings
  const [freeTrialDays, setFreeTrialDays] = useState(7);
  const [allowedTrialTools, setAllowedTrialTools] = useState([]);

  // Payment Methods
  const [vodafoneWallet, setVodafoneWallet] = useState('');
  const [etisalatWallet, setEtisalatWallet] = useState('');
  const [orangeWallet, setOrangeWallet] = useState('');
  const [instapayWallet, setInstapayWallet] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentToApprove, setPaymentToApprove] = useState(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState('');
  const [selectedDurationForPayment, setSelectedDurationForPayment] = useState(30);
  const [isStripeSettingsModalOpen, setIsStripeSettingsModalOpen] = useState(false);

  const ALL_STEPS = [...JOURNEY_STEPS, ...TOOLS_24H];
  const TOTAL_STEPS_COUNT = ALL_STEPS.length;

  const ADDITIONAL_RESOURCES = [
    { id: 'brand-library', label_ar: 'مكتبة المنتجات', label_en: 'Product Library', section: 'additional' },
    { id: 'smart-notebook', label_ar: 'دفتر الملاحظات الذكي', label_en: 'Smart Notebook', section: 'additional' }
  ];
  const CHECKLIST_ITEMS = [...ALL_STEPS, ...ADDITIONAL_RESOURCES];

  const DEFAULT_THEME = {
    accent: '#3B82F6',
    success: '#10B981',
    bg: '#080C14',
    sidebar: '#0D1220'
  };

  useEffect(() => {
    if (userData && !isInitialized) {
      setOwnerNameForm(userData.ownerName || '');
      setBrandNameForm(userData.brandName || '');
      setBrandUrlForm(userData.brandUrl || '');
      setDefaultLanguage(userData.defaultLanguage || 'ar');
      setLogoDisplayMode(userData.logoDisplayMode || 'both');
      setShowWhatsappLoginBtn(userData.showWhatsappLoginBtn !== false);

      const fullPhone = String(userData.phoneNumber || '');
      if (fullPhone.startsWith('+')) {
        const match = fullPhone.match(/^(\+\d{1,4})(.*)$/);
        if (match) {
          setPhoneKeyForm(match[1]);
          setPhoneNumberForm(match[2]);
        } else {
          setPhoneKeyForm('+20');
          setPhoneNumberForm(fullPhone);
        }
      } else {
        setPhoneKeyForm('+20');
        setPhoneNumberForm(fullPhone);
      }

      const theme = userData.themeConfig || {};
      setAccentColor(theme.accent || DEFAULT_THEME.accent);
      setSuccessColor(theme.success || DEFAULT_THEME.success);
      setBgColor(theme.bg || '#080C14');
      setSidebarColor(theme.sidebar || '#0D1220');
      setFontFamily(theme.fontFamily || 'Cairo');
      setTextColor(theme.text || '#FFFFFF');
      setLineColor(theme.line || '#1e293b');
      setLandingTemplate(userData.landingTemplate || 'default');
      setSocialLinks(userData.socialLinks || { facebook: '', instagram: '', twitter: '', linkedin: '', tiktok: '' });
      const pData = userData.plans;
      setPlans(Array.isArray(pData) ? pData : [
        { id: 1, name: 'الباقة الفضية', price: 300, features: 'دخول لكافة الأدوات\nدعم فني\nتحديثات دورية' },
        { id: 2, name: 'الباقة الذهبية', price: 600, features: 'دخول لكافة الأدوات\nدعم فني VIP\nتحديثات دورية\nجلسة استشارية' }
      ]);

      // Load free trial settings
      setFreeTrialDays(userData.freeTrialSettings?.days || 7);
      setAllowedTrialTools(userData.freeTrialSettings?.allowedTools || CHECKLIST_ITEMS.map(s => s.id));

      // Load payment methods
      setVodafoneWallet(userData.paymentMethods?.vodafone || '');
      setEtisalatWallet(userData.paymentMethods?.etisalat || '');
      setOrangeWallet(userData.paymentMethods?.orange || '');
      setInstapayWallet(userData.paymentMethods?.instapay || '');
      setStripeSecretKey(userData.paymentMethods?.stripeKeys?.secretKey || '');
      setStripePublishableKey(userData.paymentMethods?.stripeKeys?.publishableKey || '');
      setStripeWebhookSecret(userData.paymentMethods?.stripeKeys?.webhookSecret || '');

      setIsInitialized(true);
    }
  }, [userData, isInitialized]);

  // Reset initialization when user logs out/switches
  useEffect(() => {
    if (!userData) {
      setIsInitialized(false);
    }
  }, [userData]);

  const handleResetToDefaults = () => {
    if (!confirm('هل أنت متأكد من العودة للقيم الافتراضية؟')) return;
    setAccentColor(DEFAULT_THEME.accent);
    setSuccessColor(DEFAULT_THEME.success);
    setBgColor(DEFAULT_THEME.bg);
    setSidebarColor(DEFAULT_THEME.sidebar);
    setFontFamily('Cairo');
    setTextColor('#FFFFFF');
    setLineColor('#1e293b');
  };

  const handleUpdateAdminProfile = async () => {
    if (!userData?.uid) return;
    if (!brandNameForm.trim()) {
      return toast('يرجى تحديد اسم البراند أولاً في الإعدادات', 'error');
    }

    setIsUpdatingProfile(true);
    try {
      let photoURL = userData.photoURL;
      if (adminProfileImage) {
        const imgRef = ref(libraryStorage, `avatars/${Date.now()}_${adminProfileImage.name}`);
        await uploadBytes(imgRef, adminProfileImage);
        photoURL = await getDownloadURL(imgRef);
      }

      const updateData = {
        ownerName: ownerNameForm,
        brandName: brandNameForm,
        brandUrl: brandUrlForm.trim().toLowerCase(),
        phoneNumber: `${phoneKeyForm}${phoneNumberForm.trim().replace(/^\+/, '')}`,
        photoURL: photoURL || '',
        themeConfig: {
          accent: accentColor,
          success: successColor,
          bg: bgColor,
          sidebar: sidebarColor,
          fontFamily: fontFamily,
          text: textColor,
          line: lineColor
        },
        socialLinks: socialLinks,
        plans: plans,
        freeTrialSettings: {
          days: Number(freeTrialDays) || 7,
          allowedTools: allowedTrialTools || []
        },
        paymentMethods: {
          vodafone: vodafoneWallet,
          etisalat: etisalatWallet,
          orange: orangeWallet,
          instapay: instapayWallet,
          stripeKeys: {
            secretKey: stripeSecretKey,
            publishableKey: stripePublishableKey,
            webhookSecret: stripeWebhookSecret
          }
        },
        defaultLanguage: defaultLanguage,
        landingTemplate: landingTemplate,
        logoDisplayMode: logoDisplayMode,
        showWhatsappLoginBtn: showWhatsappLoginBtn
      };

      // 1. Update Admin User document
      await setDoc(doc(db, 'users', userData.uid), updateData, { merge: true });

      // 2. Update/Create Brand document
      await setDoc(doc(db, 'brands', brandNameForm), {
        name: brandNameForm,
        domain: updateData.brandUrl,
        adminUid: userData.uid,
        themeConfig: updateData.themeConfig,
        socialLinks: updateData.socialLinks,
        plans: plans,
        freeTrialSettings: updateData.freeTrialSettings,
        paymentMethods: updateData.paymentMethods,
        defaultLanguage: updateData.defaultLanguage,
        landingTemplate: updateData.landingTemplate,
        logoDisplayMode: updateData.logoDisplayMode,
        showWhatsappLoginBtn: updateData.showWhatsappLoginBtn,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast('تم تحديث إعدادات البراند بنجاح! ✓', 'success');
    } catch (err) {
      console.error(err);
      toast('خطأ في التحديث', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Load users created by this admin (same brand)
  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = [];
      snap.forEach(d => {
        const data = d.data();
        // Show users created by this admin OR users belonging to same brand
        if (data.createdBy === userData?.uid || data.brandName === userData?.brandName) {
          if (d.id !== userData?.uid) {
            list.push({ id: d.id, ...data });
          }
        }
      });
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUsers(list);
    } catch (err) {
      console.error('Error loading users:', err);
      toast('خطأ في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) loadUsers();
  }, [userData]);

  // Load payments
  const loadPayments = async () => {
    if (!userData?.uid) return;
    setLoadingPayments(true);
    try {
      const q = query(collection(db, 'payments'), where('adminUid', '==', userData.uid));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPendingPayments(list);
    } catch (err) {
      console.error(err);
      toast('خطأ في تحميل المعاملات', 'error');
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payment_methods') {
      loadPayments();
    }
  }, [activeTab, userData]);

  // Handle Approve Payment
  const handleApprovePayment = async () => {
    if (!selectedPlanForPayment) return toast('يرجى اختيار الباقة', 'error');
    
    try {
      // 1. Update Payment status
      await updateDoc(doc(db, 'payments', paymentToApprove.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        planId: selectedPlanForPayment,
        durationDays: selectedDurationForPayment
      });

      // 2. Update User Subscription
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(selectedDurationForPayment));

      await setDoc(doc(db, 'users', paymentToApprove.userId), {
        subscription: {
          type: selectedPlanForPayment, // Using planId/name as type
          expiryDate: expiryDate,
          status: 'active',
          updatedAt: serverTimestamp()
        }
      }, { merge: true });

      toast('تم الموافقة على الدفع وتحديث اشتراك المستخدم بنجاح! ✅', 'success');
      setPaymentToApprove(null);
      await loadPayments();
      await loadUsers();
    } catch (err) {
      console.error(err);
      toast('حدث خطأ أثناء الموافقة على الدفع', 'error');
    }
  };

  // Create user using secondary Firebase app
  const handleCreate = async () => {
    if (!userName.trim()) return toast('أدخل اسم المستخدم', 'error');
    if (!userEmail.trim()) return toast('أدخل البريد الإلكتروني', 'error');
    if (!userPassword.trim() || userPassword.length < 6) return toast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');

    setCreating(true);
    let secondaryApp = null;

    try {
      let photoURL = '';
      if (profileImage) {
        const imgRef = ref(libraryStorage, `avatars/${Date.now()}_${profileImage.name}`);
        await uploadBytes(imgRef, profileImage);
        photoURL = await getDownloadURL(imgRef);
      }

      const config = {
        apiKey: "AIzaSyCIF4HfPdDqjH6ue2Sc5NIIJwlOq3ytNA0",
        authDomain: "event-upklick.firebaseapp.com",
        projectId: "event-upklick",
      };
      secondaryApp = initializeApp(config, 'admin-secondary-' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);

      const cred = await createUserWithEmailAndPassword(secondaryAuth, userEmail.trim(), userPassword);
      const uid = cred.user.uid;

      let expiryDate = null;
      if (subType === 'monthly') {
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (subType === 'custom') {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(subDays));
      } else if (subType === 'trial') {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(freeTrialDays));
      }

      await setDoc(doc(db, 'users', uid), {
        email: userEmail.trim().toLowerCase(),
        role: userRole,
        ownerName: userName.trim(),
        photoURL: photoURL || '',
        brandName: userData?.brandName || '',
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || '',
        subscription: {
          type: subType,
          expiryDate: expiryDate ? expiryDate : null,
          status: subType === 'stopped' ? 'stopped' : 'active',
          updatedAt: serverTimestamp()
        }
      });

      toast(`تم إنشاء ${userRole === 'admin' ? 'الأدمن' : 'المستخدم'} بنجاح! ✅`, 'success');
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserRole('user');
      setSubType('monthly');
      setSubDays(30);
      setProfileImage(null);
      if (document.getElementById('userProfileImg')) document.getElementById('userProfileImg').value = '';
      await loadUsers();
    } catch (err) {
      console.error('Create error:', err);
      const msgs = {
        'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
        'auth/invalid-email': 'صيغة البريد غير صحيحة',
        'auth/weak-password': 'كلمة المرور ضعيفة جداً',
      };
      toast(msgs[err.code] || 'حدث خطأ أثناء الإنشاء', 'error');
    } finally {
      if (secondaryApp) {
        try { await deleteApp(secondaryApp); } catch { }
      }
      setCreating(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setUserName(u.ownerName || '');
    setUserEmail(u.email || '');
    setUserRole(u.role || 'user');
    setSubType(u.subscription?.type || 'monthly');
    setSubDays(30);
    setUserPassword(''); // Hide password for edit
    setIsUserModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserRole('user');
    setUserPassword('');
    setIsUserModalOpen(false);
  };

  const handleUpdate = async () => {
    if (!userName.trim()) return toast('أدخل الاسم', 'error');
    setCreating(true);
    try {
      let photoURL = editingUser.photoURL;
      if (profileImage) {
        const imgRef = ref(libraryStorage, `avatars/${Date.now()}_${profileImage.name}`);
        await uploadBytes(imgRef, profileImage);
        photoURL = await getDownloadURL(imgRef);
      }

      let expiryDate = editingUser.subscription?.expiryDate?.toDate() || null;
      if (subType === 'monthly') {
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (subType === 'custom') {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(subDays));
      } else if (subType === 'trial') {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(freeTrialDays));
      } else if (subType === 'lifetime') {
        expiryDate = null;
      }

      await setDoc(doc(db, 'users', editingUser.id), {
        ownerName: userName.trim(),
        role: userRole,
        photoURL: photoURL || '',
        subscription: {
          type: subType,
          expiryDate: expiryDate ? expiryDate : null,
          status: subType === 'stopped' ? 'stopped' : 'active',
          updatedAt: serverTimestamp()
        }
      }, { merge: true });
      toast('تم التحديث بنجاح ✅', 'success');
      cancelEdit();
      await loadUsers();
    } catch (err) {
      toast('حدث خطأ أثناء التحديث', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) handleUpdate();
    else handleCreate();
  };

  const handleDelete = async (u) => {
    if (!confirm(`هل تريد حذف "${u.ownerName || u.email}"؟`)) return;
    try {
      await deleteDoc(doc(db, 'users', u.id));
      toast('تم الحذف ✅', 'success');
      await loadUsers();
    } catch {
      toast('خطأ في الحذف', 'error');
    }
  };

  const handleLogout = async () => {
    await logout('admin');
    navigate('/admin/login');
  };

  const admins = Array.isArray(users) ? users.filter(u => u.role === 'admin') : [];
  const regularUsers = Array.isArray(users) ? users.filter(u => u.role === 'user') : [];
  const totalSteps = TOTAL_STEPS_COUNT || 1;

  const formatDate = (ts) => {
    if (!ts?.seconds) return '—';
    return new Date(ts.seconds * 1000).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (!userData) {
    return (
      <div className="ad-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: 44, height: 44,
          border: '3px solid var(--line2, rgba(255,255,255,0.15))',
          borderTopColor: 'var(--accent, #3B82F6)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 13, color: 'var(--text2, #94A3B8)' }}>جاري تحميل لوحة التحكم...</span>
      </div>
    );
  }

  return (
    <div className="ad-page" dir="rtl">
      <div className="ad-bg">
        <div className="ad-orb ad-orb-1" />
        <div className="ad-orb ad-orb-2" />
      </div>

      <div className="ad-layout">
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div className="ad-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`ad-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="ad-sidebar-header">
            {(() => {
              const displayMode = userData?.logoDisplayMode || 'both';
              const showLogo = displayMode === 'both' || displayMode === 'logo';
              const showText = displayMode === 'both' || displayMode === 'text';

              return (
                <>
                  {showLogo && (
                    <div className="ad-logo-icon" style={userData?.photoURL ? { background: `url("${userData.photoURL}") center/contain no-repeat`, border: 'none', backgroundSize: 'contain' } : {}}>
                      {!userData?.photoURL && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      )}
                    </div>
                  )}
                  {showText && (
                    <div>
                      <div className="ad-topbar-title">{userData?.brandName || 'لوحة التحكم'}</div>
                      <div className="ad-topbar-sub">Admin Dashboard</div>
                      {userData?.subscription && (
                        <div style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>
                          {userData.subscription.status === 'stopped' ? '🚫 الاشتراك متوقف' :
                            userData.subscription.type === 'lifetime' ? '💎 اشتراك دائم' :
                              `⌛ ينتهي في: ${(userData.subscription.expiryDate?.toDate ? userData.subscription.expiryDate.toDate() : new Date(userData.subscription.expiryDate)).toLocaleDateString('ar-EG')}`}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <div className="ad-sidebar-nav">
            <button className={`ad-nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}>
              <span className="ad-nav-num">1</span> {state.language === 'en' ? 'User Management' : 'إدارة المستخدمين'}
            </button>
            <button className={`ad-nav-link ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => { setActiveTab('sales'); setIsMobileMenuOpen(false); }}>
              <span className="ad-nav-num">2</span> {state.language === 'en' ? 'Sales Management' : 'إدارة المبيعات'}
            </button>
            <button className={`ad-nav-link ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => { setActiveTab('subscriptions'); setIsMobileMenuOpen(false); }}>
              <span className="ad-nav-num">3</span> {state.language === 'en' ? 'Plans & Pricing' : 'الباقات والتسعير'}
            </button>
            <button className={`ad-nav-link ${activeTab === 'trial_settings' ? 'active' : ''}`} onClick={() => { setActiveTab('trial_settings'); setIsMobileMenuOpen(false); }}>
              <span className="ad-nav-num">4</span> {state.language === 'en' ? 'Free Trial Settings' : 'إعدادات الفترة المجانية'}
            </button>
            <button className={`ad-nav-link ${activeTab === 'payment_methods' ? 'active' : ''}`} onClick={() => { setActiveTab('payment_methods'); setIsMobileMenuOpen(false); }}>
              <span className="ad-nav-num">5</span> {state.language === 'en' ? 'Payment Methods' : 'طرق الدفع'}
            </button>
            <button className={`ad-nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}>
              <span className="ad-nav-num">6</span> {state.language === 'en' ? 'Brand Settings' : 'إعدادات البراند'}
            </button>
            <button className={`ad-nav-link ${activeTab === 'tutorial' ? 'active' : ''}`} onClick={() => { setActiveTab('tutorial'); setIsMobileMenuOpen(false); }}>
              <span className="ad-nav-num">7</span> {state.language === 'en' ? 'Tutorial Video' : 'فيديو الشرح'}
            </button>
            <button className={`ad-nav-link ${activeTab === 'library' ? 'active' : ''}`} onClick={() => { setActiveTab('library'); setIsMobileMenuOpen(false); }}>
              <span className="ad-nav-num">8</span> {state.language === 'en' ? 'Product Library' : 'مكتبة المنتجات'}
            </button>
          </div>

          <div className="ad-sidebar-footer">
            <button className="btn btn-sm" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginBottom: '8px' }}>
              📦 {state.language === 'en' ? 'Tools' : 'الأدوات'}
            </button>
            <button className="btn btn-sm" onClick={handleLogout} style={{ borderColor: 'rgba(239,68,68,.3)', color: 'var(--red)', width: '100%' }}>
              {state.language === 'en' ? 'Logout' : 'خروج'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="ad-main">
          {/* Topbar */}
          <div className="ad-topbar">
            <div className="ad-topbar-left">
              <button className="ad-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                ☰
              </button>
              <h2 className="ad-page-title">
                {activeTab === 'users' ? (state.language === 'en' ? '👥 User Management' : '👥 إدارة المستخدمين') :
                  activeTab === 'sales' ? (state.language === 'en' ? '💰 Sales Management' : '💰 إدارة المبيعات') :
                    activeTab === 'subscriptions' ? (state.language === 'en' ? '💎 Plans & Pricing' : '💎 الباقات والتسعير') :
                      activeTab === 'trial_settings' ? (state.language === 'en' ? '🎁 Free Trial Settings' : '🎁 إعدادات الفترة المجانية') :
                        activeTab === 'payment_methods' ? (state.language === 'en' ? '💳 Payment Methods' : '💳 طرق الدفع') :
                          activeTab === 'tutorial' ? (state.language === 'en' ? '📺 Tutorial Video' : '📺 فيديو الشرح') : 
                            activeTab === 'library' ? (state.language === 'en' ? '📚 Product Library' : '📚 مكتبة المنتجات') :
                            (state.language === 'en' ? '⚙️ Brand Settings' : '⚙️ إعدادات البراند')}
              </h2>
            </div>
            <div className="ad-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn btn-sm" 
                onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'ar' : 'en' })}
                style={{ background: 'var(--bg2)', border: '1px solid var(--line)', padding: '6px 12px', fontSize: '13px' }}
              >
                {state.language === 'en' ? 'العربية 🇪🇬' : 'English 🇬🇧'}
              </button>
              <div className="ad-brand-badge">
                <div className="ad-brand-dot" />
                🛡 {userData?.ownerName || 'Admin'}
              </div>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'users' ? (
            <div className="ad-content animate-in">
              {/* Stats */}
              <div className="ad-stats">
                <div className="ad-stat-card">
                  <div className="ad-stat-icon">🏢</div>
                  <div className="ad-stat-value">{userData?.brandName || '—'}</div>
                  <div className="ad-stat-label">البراند</div>
                </div>
                <div className="ad-stat-card">
                  <div className="ad-stat-icon">🛡</div>
                  <div className="ad-stat-value">{admins.length}</div>
                  <div className="ad-stat-label">أدمنز</div>
                </div>
                <div className="ad-stat-card">
                  <div className="ad-stat-icon">👥</div>
                  <div className="ad-stat-value">{regularUsers.length}</div>
                  <div className="ad-stat-label">مستخدمين</div>
                </div>
                <div className="ad-stat-card">
                  <div className="ad-stat-icon">📊</div>
                  <div className="ad-stat-value">{users.length}</div>
                  <div className="ad-stat-label">إجمالي</div>
                </div>
                <div className="ad-stat-card" style={{ border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.02)' }}>
                  <div className="ad-stat-icon">⌛</div>
                  <div className="ad-stat-value" style={{ fontSize: 18 }}>
                    {userData?.subscription?.status === 'stopped' ? '🚫 متوقف' :
                      userData?.subscription?.type === 'lifetime' ? '💎 دائم' :
                        userData?.subscription?.expiryDate ? (() => {
                          const exp = userData.subscription.expiryDate?.toDate ? userData.subscription.expiryDate.toDate() : new Date(userData.subscription.expiryDate);
                          const isExp = exp < new Date();
                          return isExp ? '⚠️ منتهي' : exp.toLocaleDateString('ar-EG');
                        })() : '—'}
                  </div>
                  <div className="ad-stat-label">حالة الاشتراك</div>
                </div>
              </div>

              {/* Grid */}
              <div className="ad-grid">
                {/* Users Table */}
                <div className="ad-table-card" style={{ gridColumn: '1 / -1' }}>
                  <div className="ad-card-header">
                    <div className="ad-card-title">
                      👥 المستخدمين
                      <span className="ad-card-count">{users.length}</span>
                    </div>
                    <button className="btn" onClick={() => { cancelEdit(); setIsUserModalOpen(true); }} style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}>
                      ➕ إضافة مستخدم جديد
                    </button>
                  </div>
                  {loading ? (
                    <div className="ad-empty">
                      <div className="ad-submit-spinner" style={{ margin: '20px auto' }} />
                      <div>جاري التحميل...</div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="ad-empty">
                      <div className="ad-empty-icon">👤</div>
                      <div>لا يوجد مستخدمين بعد</div>
                      <div style={{ fontSize: 11, marginTop: 4 }}>أنشئ أول مستخدم من النموذج</div>
                    </div>
                  ) : (
                    <div className="ad-table-wrapper">
                      <table className="ad-table">
                        <thead>
                          <tr>
                            <th>الاسم</th>
                            <th>البريد</th>
                            <th>الاشتراك</th>
                            <th>الدور</th>
                            <th>التقدم</th>
                            <th>التاريخ</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id}>
                              <td>
                                <div className="ad-user-name">
                                  <div className="ad-user-avatar" style={u.photoURL ? { background: `url("${u.photoURL}") center/cover no-repeat`, border: '1px solid rgba(255,255,255,0.1)' } : {}}>
                                    {!u.photoURL && (u.ownerName || u.email || '?').charAt(0).toUpperCase()}
                                  </div>
                                  {u.ownerName || '—'}
                                </div>
                              </td>
                              <td><span className="ad-user-email">{u.email}</span></td>
                              <td>
                                {u.subscription?.status === 'stopped' ? (
                                  <span style={{ color: 'var(--red)', fontSize: 10, fontWeight: 700 }}>🚫 متوقف</span>
                                ) : u.subscription?.type === 'lifetime' ? (
                                  <span style={{ color: 'var(--accent)', fontSize: 10, fontWeight: 700 }}>💎 دائم</span>
                                ) : u.subscription?.type === 'trial' ? (() => {
                                  const exp = u.subscription.expiryDate?.toDate ? u.subscription.expiryDate.toDate() : (u.subscription?.expiryDate ? new Date(u.subscription.expiryDate) : null);
                                  const isExp = exp && exp < new Date();
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ color: isExp ? 'var(--red)' : 'var(--accent)', fontSize: 10, fontWeight: 700 }}>
                                        🎁 فترة مجانية {isExp ? '(منتهية)' : '(نشطة)'}
                                      </span>
                                      {exp && <span style={{ fontSize: 8, color: 'var(--text3)' }}>{exp.toLocaleDateString('ar-EG')}</span>}
                                    </div>
                                  );
                                })() : u.subscription?.expiryDate ? (() => {
                                  const exp = u.subscription.expiryDate?.toDate ? u.subscription.expiryDate.toDate() : new Date(u.subscription.expiryDate);
                                  const isExp = exp < new Date();
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ color: isExp ? 'var(--red)' : 'var(--green)', fontSize: 10, fontWeight: 700 }}>
                                        {isExp ? '⌛ منتهي' : '✅ نشط'}
                                      </span>
                                      <span style={{ fontSize: 8, color: 'var(--text3)' }}>{exp.toLocaleDateString('ar-EG')}</span>
                                    </div>
                                  );
                                })() : (
                                  <span style={{ color: 'var(--text3)', fontSize: 10 }}>—</span>
                                )}
                              </td>
                              <td>
                                <span className={`ad-role-badge ${u.role === 'admin' ? 'ad-role-admin' : 'ad-role-user'}`}>
                                  {u.role === 'admin' ? '🛡 أدمن' : '👤 يوزر'}
                                </span>
                              </td>
                              <td>
                                <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                                  <div style={{
                                    width: `${Math.round(((u.appState?.completedSteps?.length || 0) / totalSteps) * 100)}%`,
                                    height: '100%',
                                    background: 'var(--accent)'
                                  }} />
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--text3)' }}>{u.appState?.completedSteps?.length || 0} / {TOTAL_STEPS_COUNT}</div>
                              </td>
                              <td><span className="ad-date" style={{ fontFamily: 'Cairo, sans-serif' }}>{formatDate(u.createdAt)}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="btn btn-xs" onClick={() => setViewingUserDetails(u)}>🔍 تفاصيل</button>
                                  <button className="btn btn-xs" onClick={() => handleEditClick(u)}>✏️</button>
                                  <button className="ad-delete-btn" onClick={() => handleDelete(u)}>🗑️</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'sales' ? (
            <AdminSales subUsers={regularUsers} />
          ) : activeTab === 'subscriptions' ? (
            <div className="ad-content animate-in">
              <div className="ad-table-card">
                <div className="ad-card-header">
                  <div className="ad-card-title">
                    💎 باقات الاشتراك الخاصة بك
                    <span className="sa-card-count">{plans.length}</span>
                  </div>
                  <button className="btn" onClick={() => { setEditingPlan(null); setPlanName(''); setPlanNameEn(''); setPlanPrice(''); setPlanCurrency('EGP'); setPlanFeatures(''); setPlanFeaturesEn(''); setIsPlanModalOpen(true); }} style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}>
                    ➕ إضافة باقة جديدة
                  </button>
                </div>
                <div className="sa-table-wrapper">
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>اسم الباقة</th>
                        <th>السعر والعملة</th>
                        <th>المميزات</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{p.name_ar || p.name}</div>
                            {p.name_en && <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{p.name_en}</div>}
                          </td>
                          <td><span style={{ color: 'var(--green)', fontWeight: 800 }}>{p.price} {p.currency === 'USD' ? '$' : p.currency === 'SAR' ? 'ر.س' : p.currency === 'AED' ? 'د.إ' : p.currency === 'KWD' ? 'د.ك' : 'ج.م'}</span></td>
                          <td style={{ maxWidth: 300, fontSize: 11, color: 'var(--text3)' }}>
                            <div style={{ direction: 'rtl', textAlign: 'right' }}>{typeof (p.features_ar || p.features) === 'string' ? (p.features_ar || p.features).split('\n').join(' • ') : Array.isArray(p.features_ar || p.features) ? (p.features_ar || p.features).join(' • ') : ''}</div>
                            {p.features_en && <div style={{ direction: 'ltr', textAlign: 'left', color: 'var(--accent)', marginTop: '4px', fontSize: 10 }}>{typeof p.features_en === 'string' ? p.features_en.split('\n').join(' • ') : Array.isArray(p.features_en) ? p.features_en.join(' • ') : ''}</div>}
                          </td>
                          <td>
                            <button className="btn btn-xs" style={{ marginLeft: 8 }} onClick={() => {
                              setEditingPlan(p);
                              setPlanName(p.name_ar || p.name || '');
                              setPlanNameEn(p.name_en || '');
                              setPlanPrice(p.price || '');
                              setPlanCurrency(p.currency || 'EGP');
                              setPlanFeatures(p.features_ar || p.features || '');
                              setPlanFeaturesEn(p.features_en || '');
                              setIsPlanModalOpen(true);
                            }}>تعديل</button>
                            <button className="sa-delete-btn" onClick={() => setPlans(plans.filter(pl => pl.id !== p.id))}>حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button className="ad-submit-btn" style={{ width: 250 }} onClick={handleUpdateAdminProfile} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات في الباقات'}
                </button>
              </div>
            </div>
          ) : activeTab === 'trial_settings' ? (
            <div className="ad-content animate-in">
              <div className="ad-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="ad-table-card" style={{ padding: '24px' }}>
                  <div className="ad-card-header" style={{ marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
                    <div>
                      <div className="ad-card-title" style={{ fontSize: '18px', fontWeight: '800' }}>🎁 إعدادات الفترة المجانية للعملاء</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
                        حدد مدة الفترة التجريبية والأدوات/الأقسام المتاحة للمستخدمين المشتركين بنوع "فترة مجانية"
                      </div>
                    </div>
                  </div>

                  <div className="ad-form-body">
                    {/* Duration settings card */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                          <label className="field-label" style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                            ⏳ عدد أيام الفترة المجانية المسموح بها
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              min="1"
                              max="90"
                              className="field-input"
                              style={{ width: '120px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}
                              value={freeTrialDays}
                              onChange={e => setFreeTrialDays(Math.max(1, Number(e.target.value)))}
                            />
                            <span style={{ fontSize: '14px', color: 'var(--text2)' }}>أيام تجريبية تبدأ تلقائياً من تاريخ إنشاء الحساب</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checklist tools and resources */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>🛠️ تحديد صلاحيات الوصول للأدوات والأقسام</span>
                          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                            اختر الأدوات التي ستكون متاحة للاستخدام. الأدوات غير المحددة ستظهر مقفلة 🔒 للمشتركين مجاناً.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => setAllowedTrialTools(CHECKLIST_ITEMS.map(item => item.id))}
                            style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px' }}
                          >
                            ✓ تحديد الكل
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs"
                            onClick={() => setAllowedTrialTools([])}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px' }}
                          >
                            ✗ إلغاء تحديد الكل
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[
                          {
                            title: "🎯 التحليل وبناء الهوية",
                            items: CHECKLIST_ITEMS.filter(item => item.group_ar === 'التحليل والهوية' || item.group_en === 'Analysis & Identity')
                          },
                          {
                            title: "💻 بناء وتجهيز المتجر والصفحات",
                            items: CHECKLIST_ITEMS.filter(item => item.group_ar === 'بناء وتجهيز المتجر' || item.group_en === 'Store Setup')
                          },
                          {
                            title: "📦 المنتج والربحية والتسعير",
                            items: CHECKLIST_ITEMS.filter(item => item.group_ar === 'المنتج والربحية' || item.group_en === 'Product & Profit')
                          },
                          {
                            title: "📣 صناعة المحتوى والتسويق الرقمي",
                            items: CHECKLIST_ITEMS.filter(item => item.group_ar === 'المحتوى والتسويق' || item.group_en === 'Content & Marketing')
                          },
                          {
                            title: "🤖 الإدارة والتشغيل الذكي",
                            items: CHECKLIST_ITEMS.filter(item => item.group_ar === 'إدارة وتشغيل' || item.group_en === 'Management & Ops')
                          },
                          {
                            title: "💼 أدوات العمل الحر وفريلانس",
                            items: CHECKLIST_ITEMS.filter(item => item.section === 'freelance')
                          },
                          {
                            title: "📚 موارد وأقسام إضافية",
                            items: CHECKLIST_ITEMS.filter(item => item.section === 'additional')
                          }
                        ].map((group, idx) => {
                          if (group.items.length === 0) return null;
                          return (
                            <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '16px' }}>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px', marginBottom: '12px' }}>
                                {group.title} ({group.items.filter(item => allowedTrialTools.includes(item.id)).length} / {group.items.length})
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                {group.items.map(item => {
                                  const isChecked = allowedTrialTools.includes(item.id);
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => {
                                        if (isChecked) {
                                          setAllowedTrialTools(allowedTrialTools.filter(t => t !== item.id));
                                        } else {
                                          setAllowedTrialTools([...allowedTrialTools, item.id]);
                                        }
                                      }}
                                      style={{
                                        padding: '10px 12px',
                                        background: isChecked ? 'rgba(59, 130, 246, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                                        border: isChecked ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.03)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.15s ease',
                                        userSelect: 'none'
                                      }}
                                    >
                                      <div style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: 4,
                                        border: isChecked ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                                        background: isChecked ? 'var(--accent)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 9,
                                        color: '#fff'
                                      }}>
                                        {isChecked && '✓'}
                                      </div>
                                      <span style={{ fontSize: '16px' }}>{item.icon || '📁'}</span>
                                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                        <span style={{ fontSize: '11px', fontWeight: isChecked ? 'bold' : 'normal', color: isChecked ? '#fff' : 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {item.label_ar || item.label}
                                        </span>
                                        <span style={{ fontSize: '8px', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {item.label_en || item.id}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                      <button
                        className="ad-submit-btn"
                        style={{ width: '250px', margin: '0 auto' }}
                        onClick={handleUpdateAdminProfile}
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? '⏳ جاري الحفظ...' : '💾 حفظ إعدادات الفترة المجانية'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'payment_methods' ? (
            <div className="ad-content animate-in">
              <div className="ad-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="ad-table-card" style={{ padding: '24px' }}>
                  <div className="ad-card-header" style={{ marginBottom: '24px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
                    <div>
                      <div className="ad-card-title" style={{ fontSize: '18px', fontWeight: '800' }}>💳 طرق الدفع (المحافظ الإلكترونية)</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
                        أدخل أرقام المحافظ الإلكترونية الخاصة بك. ستظهر هذه الأرقام للمستخدمين في صفحة الدفع.
                      </div>
                    </div>
                  </div>

                  <div className="ad-form-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                      <div className="field">
                        <label className="field-label" style={{ color: '#E60000', fontWeight: 'bold' }}>فودافون كاش (Vodafone Cash)</label>
                        <input className="field-input" placeholder="010xxxxxxxx" value={vodafoneWallet} onChange={e => setVodafoneWallet(e.target.value)} dir="ltr" />
                      </div>
                      <div className="field">
                        <label className="field-label" style={{ color: '#006B33', fontWeight: 'bold' }}>اتصالات كاش (Etisalat Cash)</label>
                        <input className="field-input" placeholder="011xxxxxxxx" value={etisalatWallet} onChange={e => setEtisalatWallet(e.target.value)} dir="ltr" />
                      </div>
                      <div className="field">
                        <label className="field-label" style={{ color: '#FF6600', fontWeight: 'bold' }}>أورانج كاش (Orange Cash)</label>
                        <input className="field-input" placeholder="012xxxxxxxx" value={orangeWallet} onChange={e => setOrangeWallet(e.target.value)} dir="ltr" />
                      </div>
                      <div className="field">
                        <label className="field-label" style={{ color: '#8A2BE2', fontWeight: 'bold' }}>إنستاباي (InstaPay)</label>
                        <input className="field-input" placeholder="username@instapay" value={instapayWallet} onChange={e => setInstapayWallet(e.target.value)} dir="ltr" />
                      </div>
                      <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => setIsStripeSettingsModalOpen(true)}
                          style={{ 
                            width: '100%', 
                            height: '42px', 
                            background: '#6772E5', 
                            color: '#fff', 
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 'bold'
                          }}
                        >
                          💳 إعدادات بوابة الدفع Stripe
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                      <button className="ad-submit-btn" style={{ width: '250px', margin: '0 auto' }} onClick={handleUpdateAdminProfile} disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? '⏳ جاري الحفظ...' : '💾 حفظ أرقام المحافظ'}
                      </button>
                    </div>

                    {/* Pending Payments Table */}
                    <div className="ad-card-header" style={{ marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
                      <div className="ad-card-title" style={{ fontSize: '16px', fontWeight: '800' }}>
                        🧾 المعاملات المالية 
                        <span className="sa-card-count">{pendingPayments.length}</span>
                      </div>
                    </div>

                    {loadingPayments ? (
                      <div className="ad-empty">
                        <div className="ad-submit-spinner" style={{ margin: '20px auto' }} />
                        <div>جاري التحميل...</div>
                      </div>
                    ) : pendingPayments.length === 0 ? (
                      <div className="ad-empty">
                        <div className="ad-empty-icon">💳</div>
                        <div>لا توجد معاملات مالية حتى الآن</div>
                      </div>
                    ) : (
                      <div className="sa-table-wrapper">
                        <table className="sa-table">
                          <thead>
                            <tr>
                              <th>العميل</th>
                              <th>الهاتف (المُحوِّل)</th>
                              <th>التاريخ</th>
                              <th>صورة التحويل</th>
                              <th>الحالة</th>
                              <th>إجراء</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingPayments.map(p => (
                              <tr key={p.id}>
                                <td>
                                  <div style={{ fontWeight: 'bold', color: '#fff' }}>{p.userName}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{p.userEmail}</div>
                                </td>
                                <td dir="ltr" style={{ textAlign: 'right' }}>{p.userPhone}</td>
                                <td>{p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString('ar-EG') : '—'}</td>
                                <td>
                                  {p.screenshotUrl ? (
                                    <a href={p.screenshotUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                                      عرض الصورة 🖼️
                                    </a>
                                  ) : '—'}
                                </td>
                                <td>
                                  {p.status === 'pending' ? (
                                    <span style={{ color: 'var(--orange, #F59E0B)', fontSize: '11px', fontWeight: 'bold', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                      قيد المراجعة ⏳
                                    </span>
                                  ) : p.status === 'approved' ? (
                                    <span style={{ color: 'var(--green)', fontSize: '11px', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                      تمت المراجعة ✅
                                    </span>
                                  ) : (
                                    <span>{p.status}</span>
                                  )}
                                </td>
                                <td>
                                  {p.status === 'pending' && (
                                    <button className="btn btn-xs btn-primary" onClick={() => setPaymentToApprove(p)}>
                                      تأكيد الاشتراك
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Approval Modal */}
              {paymentToApprove && (
                <div className="ad-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <div className="ad-modal" style={{ background: '#111827', width: '90%', maxWidth: '500px', borderRadius: '16px', padding: '32px', position: 'relative', border: '1px solid #374151', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                    <button className="ad-modal-close" onClick={() => setPaymentToApprove(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                    <h3 style={{ marginBottom: '20px', color: '#fff' }}>تأكيد اشتراك العميل</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '16px' }}>
                      العميل: <strong style={{ color: '#fff' }}>{paymentToApprove.userName}</strong>
                    </p>
                    
                    <div className="field" style={{ marginBottom: '16px' }}>
                      <label className="field-label">اختر الباقة المراد تفعيلها للعميل</label>
                      <select 
                        className="field-input" 
                        value={selectedPlanForPayment} 
                        onChange={e => setSelectedPlanForPayment(e.target.value)}
                      >
                        <option value="">-- اختر الباقة --</option>
                        {plans.map(pl => (
                          <option key={pl.id} value={pl.name_ar || pl.name}>{pl.name_ar || pl.name}</option>
                        ))}
                        <option value="lifetime">باقة مدى الحياة (دائم)</option>
                      </select>
                    </div>

                    {selectedPlanForPayment !== 'lifetime' && (
                      <div className="field" style={{ marginBottom: '24px' }}>
                        <label className="field-label">مدة الاشتراك (بالأيام)</label>
                        <input 
                          type="number" 
                          className="field-input" 
                          value={selectedDurationForPayment} 
                          onChange={e => setSelectedDurationForPayment(e.target.value)} 
                          min="1"
                        />
                      </div>
                    )}

                    <button 
                      className="ad-submit-btn" 
                      style={{ width: '100%' }}
                      onClick={handleApprovePayment}
                    >
                      موافقة وتفعيل الباقة ✅
                    </button>
                  </div>
                </div>
              )}

              {/* Stripe Settings Modal */}
              {isStripeSettingsModalOpen && (
                <div className="ad-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <div className="ad-modal" style={{ background: '#111827', width: '90%', maxWidth: '500px', borderRadius: '16px', padding: '32px', position: 'relative', border: '1px solid #374151', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                    <button className="ad-modal-close" onClick={() => setIsStripeSettingsModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                    <h3 style={{ marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#6772E5' }}>💳</span> إعدادات الربط مع Stripe
                    </h3>
                    
                    <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px', lineHeight: '1.6' }}>
                      أدخل مفاتيح الربط الخاصة بحسابك في Stripe ليتمكن العملاء من الدفع مباشرة بالبطاقات البنكية، وسيتم تفعيل اشتراكاتهم تلقائياً.
                    </p>

                    <div className="field" style={{ marginBottom: '16px' }}>
                      <label className="field-label" style={{ color: '#6772E5', fontWeight: 'bold' }}>Stripe Secret Key</label>
                      <input className="field-input" placeholder="sk_test_..." value={stripeSecretKey} onChange={e => setStripeSecretKey(e.target.value)} dir="ltr" />
                    </div>
                    <div className="field" style={{ marginBottom: '16px' }}>
                      <label className="field-label" style={{ color: '#6772E5', fontWeight: 'bold' }}>Stripe Publishable Key</label>
                      <input className="field-input" placeholder="pk_test_..." value={stripePublishableKey} onChange={e => setStripePublishableKey(e.target.value)} dir="ltr" />
                    </div>
                    <div className="field" style={{ marginBottom: '24px' }}>
                      <label className="field-label" style={{ color: '#6772E5', fontWeight: 'bold' }}>Stripe Webhook Secret</label>
                      <input className="field-input" placeholder="whsec_..." value={stripeWebhookSecret} onChange={e => setStripeWebhookSecret(e.target.value)} dir="ltr" />
                    </div>

                    <button 
                      className="ad-submit-btn" 
                      style={{ width: '100%', background: '#6772E5' }}
                      onClick={() => setIsStripeSettingsModalOpen(false)}
                    >
                      تأكيد وإغلاق النافذة
                    </button>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', marginTop: '12px' }}>
                      ملاحظة: لا تنسَ الضغط على "حفظ أرقام المحافظ" في الصفحة الرئيسية ليتم حفظ هذه التعديلات.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'tutorial' ? (
            <div className="ad-content animate-in" style={{ padding: 0 }}>
              <PlatformExplanation
                title="شرح منصة الأدمن (مالك البراند)"
                videoUrl="https://firebasestorage.googleapis.com/v0/b/aibrand-vision.firebasestorage.app/o/Videos%2F%D8%B4%D8%B1%D8%AD%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A7%D9%84%D8%A3%D8%AF%D9%85%D9%86%20(%D9%85%D8%A7%D9%84%D9%83%20%D8%A7%D9%84%D8%A8%D8%B1%D8%A7%D9%86%D8%AF).webm?alt=media&token=c3b6e0dd-c406-4c37-a853-ac637b869402"
                lang="ar"
              />
            </div>
          ) : activeTab === 'library' ? (
            <AdminLibrary userData={userData} />
          ) : (
            <div className="ad-content animate-in">
              <div className="ad-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Profile Settings */}
                <div className="ad-table-card">
                  <div className="ad-card-header">
                    <div className="ad-card-title">👤 البيانات الشخصية</div>
                  </div>
                  <div className="ad-form-body">
                    <div className="field">
                      <label className="field-label">اسم المشرف (المالك)</label>
                      <input className="field-input" value={ownerNameForm} onChange={e => setOwnerNameForm(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">اسم البراند / المشروع</label>
                      <input className="field-input" value={brandNameForm} onChange={e => setBrandNameForm(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">البريد الإلكتروني (للمراسلة)</label>
                      <input className="field-input" value={userData?.email} readOnly disabled style={{ opacity: 0.6 }} />
                    </div>

                    <div className="field">
                      <label className="field-label">رقم الهاتف *</label>
                      <PhoneInput
                        phoneKey={phoneKeyForm}
                        setPhoneKey={setPhoneKeyForm}
                        phoneNumber={phoneNumberForm}
                        setPhoneNumber={setPhoneNumberForm}
                      />
                    </div>
                    <div className="field">
                      <label className="field-label">اللغة الافتراضية (Default Language)</label>
                      <select className="field-input" value={defaultLanguage} onChange={e => setDefaultLanguage(e.target.value)}>
                        <option value="ar">العربية (Arabic)</option>
                        <option value="en">English (الإنجليزية)</option>
                      </select>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                        * يحدد اللغة الرئيسية لصفحة الهبوط ومنصة الأدوات الخاصة بالبراند.
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">شكل عرض البراند (اللوجو والاسم)</label>
                      <select className="field-input" value={logoDisplayMode} onChange={e => setLogoDisplayMode(e.target.value)}>
                        <option value="both">اللوجو واسم البراند معاً</option>
                        <option value="logo">اللوجو فقط</option>
                        <option value="text">الاسم فقط</option>
                      </select>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                        * اختر كيف يظهر البراند الخاص بك في صفحة الهبوط.
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">إظهار زر الواتساب في صفحة الدخول</label>
                      <select className="field-input" value={showWhatsappLoginBtn ? 'true' : 'false'} onChange={e => setShowWhatsappLoginBtn(e.target.value === 'true')}>
                        <option value="true">نعم، إظهاره</option>
                        <option value="false">لا، إخفاؤه</option>
                      </select>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                        * التحكم في ظهور زر تفعيل الاشتراك عبر الواتساب في صفحة الدخول.
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">تغيير الصورة الشخصية</label>
                      <label className="sa-file-label" style={{ minHeight: 80, padding: '12px', background: 'rgba(255,255,255,0.02)' }}>
                        <input type="file" accept="image/*" className="sa-file-input" onChange={e => setAdminProfileImage(e.target.files[0])} disabled={isUpdatingProfile} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="ad-user-avatar" style={userData?.photoURL ? { background: `url("${userData.photoURL}") center/cover no-repeat`, width: 40, height: 40 } : { width: 40, height: 40 }}>
                            {!userData?.photoURL && (userData?.ownerName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="sa-file-text" style={{ fontSize: 11, display: 'block' }}>{adminProfileImage ? 'تم اختيار صورة جديدة' : 'اضغط لتغيير صورتك الشخصية'}</span>
                            {adminProfileImage && <span className="sa-file-name" style={{ fontSize: 9 }}>{adminProfileImage.name}</span>}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Theme Settings */}
                <div className="ad-table-card">
                  <div className="ad-card-header">
                    <div className="ad-card-title">🎨 ألوان الهوية</div>
                  </div>
                  <div className="ad-form-body">
                    <div className="field">
                      <label className="field-label">نوع الخط (Font)</label>
                      <select className="field-input" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                        <option value="Cairo">Cairo (كيرو)</option>
                        <option value="Tajawal">Tajawal (تجوال)</option>
                        <option value="Almarai">Almarai (المراعي)</option>
                        <option value="Rubik">Rubik (روبيك)</option>
                        <option value="Readex Pro">Readex Pro (ريديكس برو)</option>
                      </select>
                    </div>
                    <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>اللون الأساسي (Accent)</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>يؤثر على الأزرار، الأيقونات النشطة، والخطوط الرئيسية.</div>
                      </div>
                    </div>
                    <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="color" value={successColor} onChange={e => setSuccessColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>لون النجاح (Success)</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>يؤثر على علامات الإنجاز والأدوات التي تم إنهاؤها.</div>
                      </div>
                    </div>
                    <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>لون الخلفية الرئيسي</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>يغير لون الخلفية العامة للموقع.</div>
                      </div>
                    </div>
                    <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="color" value={sidebarColor} onChange={e => setSidebarColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>لون القائمة الجانبية والكروت</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>يغير خلفية القائمة الجانبية والصناديق (Cards).</div>
                      </div>
                    </div>
                    <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>لون النصوص الأساسية (Text Color)</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>يغير لون الكتابة والنصوص داخل المنصة.</div>
                      </div>
                    </div>
                    <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>لون الفواصل والإطارات (Borders/Lines)</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>يغير ألوان الخطوط الفاصلة وحواف الكروت.</div>
                      </div>
                    </div>

                    <div style={{ padding: 12, background: 'rgba(59,130,246,0.05)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.1)', marginTop: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--accent)' }}>💡 معاينة الألوان</div>
                      <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.4 }}>
                        سيتم تطبيق هذه الألوان على حسابك وحسابات جميع المستخدمين التابعين للبراند الخاص بك.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links Settings */}
                <div className="ad-table-card" style={{ gridColumn: '1 / -1', marginTop: 24 }}>
                  <div className="ad-card-header">
                    <div className="ad-card-title">🌐 منصات التواصل الاجتماعي</div>
                  </div>
                  <div className="ad-form-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div className="field">
                      <label className="field-label">فيسبوك (Facebook)</label>
                      <input className="field-input" value={socialLinks.facebook} onChange={e => setSocialLinks({ ...socialLinks, facebook: e.target.value })} placeholder="رابط الصفحة..." dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                    <div className="field">
                      <label className="field-label">إنستجرام (Instagram)</label>
                      <input className="field-input" value={socialLinks.instagram} onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })} placeholder="رابط الحساب..." dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                    <div className="field">
                      <label className="field-label">تيك توك (TikTok)</label>
                      <input className="field-input" value={socialLinks.tiktok} onChange={e => setSocialLinks({ ...socialLinks, tiktok: e.target.value })} placeholder="رابط الحساب..." dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                    <div className="field">
                      <label className="field-label">إكس (Twitter/X)</label>
                      <input className="field-input" value={socialLinks.twitter} onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })} placeholder="رابط الحساب..." dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                    <div className="field">
                      <label className="field-label">لينكد إن (LinkedIn)</label>
                      <input className="field-input" value={socialLinks.linkedin} onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} placeholder="رابط الحساب..." dir="ltr" style={{ textAlign: 'left' }} />
                    </div>
                  </div>
                </div>

                {/* Landing Page Templates */}
                <div className="ad-table-card" style={{ gridColumn: '1 / -1', marginTop: 24 }}>
                  <div className="ad-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="ad-card-title">🖥️ قوالب صفحة الهبوط</div>
                    <a 
                      href={`/?brand=${userData?.brandName}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-sm"
                      style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}
                    >
                      👁️ معاينة صفحة الهبوط
                    </a>
                  </div>
                  <div className="ad-form-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div 
                        onClick={() => setLandingTemplate('default')}
                        style={{ 
                          border: landingTemplate === 'default' ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px', padding: '16px', cursor: 'pointer', background: landingTemplate === 'default' ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ width: '100%', height: '120px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--line)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '24px' }}>✨</span>
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>القالب الافتراضي</div>
                      </div>
                      
                      <div 
                        onClick={() => setLandingTemplate('madgicx')}
                        style={{ 
                          border: landingTemplate === 'madgicx' ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px', padding: '16px', cursor: 'pointer', background: landingTemplate === 'madgicx' ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ width: '100%', height: '120px', background: '#0a0a14', borderRadius: '8px', border: '1px solid var(--line)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                           <div style={{ width: '40%', height: '60%', background: '#1c1c2e', borderRadius: '8px', marginLeft: 'auto', marginRight: '10%' }}></div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>قالب الاحترافي (Madgicx)</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button className="ad-submit-btn" style={{ width: 250 }} onClick={handleUpdateAdminProfile} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? '⏳ جاري الحفظ...' : '💾 حفظ كافة الإعدادات'}
                </button>
                <button className="ad-submit-btn" style={{ width: 180, background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--line)' }} onClick={handleResetToDefaults}>
                  🔄 القيم الافتراضية
                </button>
              </div>

              {/* Premium Live Tools Preview */}
              <div className="ad-table-card" style={{ gridColumn: '1 / -1', marginTop: 24, padding: 0, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius)' }}>
                <div className="ad-card-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <div className="ad-card-title" style={{ fontSize: 16, fontWeight: 800 }}>🖥️ معاينة حية لمنصة الأدوات</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>معاينة فورية تفاعلية للوحة تحكم المستخدم بالألوان الجديدة</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className="sa-role-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: 10, borderRadius: 20, padding: '4px 10px' }}>
                        🔑 متصل تلقائياً
                      </span>
                      <span className="sa-role-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: 10, borderRadius: 20, padding: '4px 10px' }}>
                        🔄 تحديث تلقائي مع تغيير الألوان
                      </span>
                    </div>
                  </div>
                </div>

                {/* Browser Mockup Bar */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                  </div>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 8, direction: 'ltr', textAlign: 'left' }}>
                    <span>🔒</span>
                    <span style={{ color: 'var(--text2)' }}>{userData?.brandUrl || `${window.location.origin}/?brand=${userData?.brandName || ''}`}</span>
                  </div>
                  <button
                    onClick={() => setIframeKey(k => k + 1)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                  >
                    🔄 تحديث
                  </button>
                </div>

                {/* Iframe Viewport */}
                <div style={{ background: '#080c14', position: 'relative', height: 600 }}>
                  <iframe
                    id="preview-iframe"
                    key={iframeKey}
                    src="/dashboard"
                    onLoad={handleIframeLoad}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Tools Preview"
                  />
                </div>
              </div>
            </div>
          )}

        </div> {/* End ad-main */}
      </div> {/* End ad-layout */}

      {/* User Details Modal (Shared with SuperAdmin logic) */}
      {viewingUserDetails && (
        <div className="sa-modal-overlay" onClick={() => setViewingUserDetails(null)}>
          <div className="sa-modal-content" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                  📊 تفاصيل تقدم: <span style={{ color: 'var(--accent)' }}>{viewingUserDetails.ownerName || viewingUserDetails.brandName}</span>
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>{viewingUserDetails.email}</p>
              </div>
              <button className="btn btn-sm" onClick={() => setViewingUserDetails(null)}>إغلاق</button>
            </div>

            <div className="sa-modal-body">
              <div className="sa-progress-summary" style={{ background: 'rgba(59,130,246,0.05)', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid rgba(59,130,246,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
                  <span>إجمالي الإنجاز</span>
                  <span style={{ color: 'var(--accent)' }}>{Math.round(((viewingUserDetails.appState?.completedSteps?.length || 0) / totalSteps) * 100)}%</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${((viewingUserDetails.appState?.completedSteps?.length || 0) / totalSteps) * 100}%`, height: '100%', background: 'var(--accent)' }} />
                </div>
              </div>

              <div className="sa-steps-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ALL_STEPS.map(step => {
                  const isDone = viewingUserDetails.appState?.completedSteps?.includes(step.id);
                  return (
                    <div key={step.id} style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      opacity: isDone ? 1 : 0.5
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: isDone ? 'var(--green)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff'
                      }}>
                        {isDone ? '✓' : '○'}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: isDone ? 700 : 400, color: isDone ? '#fff' : 'var(--text3)' }}>
                        {step.label_ar || step.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="sa-modal-overlay" onClick={() => cancelEdit()}>
          <div className="sa-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>
                {editingUser ? '✏️ تعديل بيانات المستخدم' : '➕ إضافة مستخدم جديد'}
              </h2>
              <button className="btn btn-sm" onClick={() => cancelEdit()}>إغلاق</button>
            </div>
            <div className="sa-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <form className="ad-form-body" onSubmit={handleSubmit}>
                <div className="ad-form-section">
                  <div className="ad-form-section-title">نوع الحساب</div>
                  <div className="ad-role-selector">
                    <div className={`ad-role-option ${userRole === 'user' ? 'active' : ''}`} onClick={() => setUserRole('user')}>
                      👤 مستخدم عادي
                    </div>
                    <div className={`ad-role-option ${userRole === 'admin' ? 'active' : ''}`} onClick={() => setUserRole('admin')}>
                      🛡 أدمن
                    </div>
                  </div>
                </div>

                <div className="ad-form-divider" />

                <div className="ad-form-section">
                  <div className="ad-form-section-title">بيانات المستخدم</div>
                  <div className="field">
                    <label className="field-label">الاسم</label>
                    <input className="field-input" value={userName} onChange={e => setUserName(e.target.value)} placeholder="مثال: محمد أحمد" disabled={creating} />
                  </div>
                  <div className="field">
                    <label className="field-label">البريد الإلكتروني</label>
                    <input className="field-input" type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="user@example.com" dir="ltr" style={{ textAlign: 'left' }} disabled={creating || editingUser} />
                    {editingUser && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>لا يمكن تعديل البريد الإلكتروني</div>}
                  </div>
                  {!editingUser && (
                    <div className="field">
                      <label className="field-label">كلمة المرور</label>
                      <input className="field-input" type="text" value={userPassword} onChange={e => setUserPassword(e.target.value)} placeholder="6 أحرف على الأقل" dir="ltr" style={{ textAlign: 'left' }} disabled={creating} />
                    </div>
                  )}

                  <div className="field">
                    <label className="field-label">صورة المستخدم (اختياري)</label>
                    <label className="sa-file-label" style={{ minHeight: 70, padding: '10px' }}>
                      <input id="userProfileImg" type="file" accept="image/*" className="sa-file-input" onChange={e => setProfileImage(e.target.files[0])} disabled={creating} />
                      <span className="sa-file-icon" style={{ fontSize: 16 }}>🖼️</span>
                      <span className="sa-file-text" style={{ fontSize: 10 }}>{profileImage ? 'تم اختيار الصورة' : 'اضغط لرفع صورة المستخدم'}</span>
                      {profileImage && <span className="sa-file-name" style={{ fontSize: 8 }}>{profileImage.name}</span>}
                    </label>
                  </div>

                  <div className="ad-form-divider" />

                  <div className="ad-form-section">
                    <div className="ad-form-section-title">إدارة الاشتراك</div>
                    <div className="ad-role-selector" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                      <div className={`ad-role-option ${subType === 'monthly' ? 'active' : ''}`} onClick={() => setSubType('monthly')}>🗓 شهر</div>
                      <div className={`ad-role-option ${subType === 'lifetime' ? 'active' : ''}`} onClick={() => setSubType('lifetime')}>💎 دائم</div>
                      <div className={`ad-role-option ${subType === 'custom' ? 'active' : ''}`} onClick={() => setSubType('custom')}>⚙️ محدد</div>
                      <div className={`ad-role-option ${subType === 'trial' ? 'active' : ''}`} onClick={() => setSubType('trial')}>🎁 فترة مجانية</div>
                      <div className={`ad-role-option ${subType === 'stopped' ? 'active' : ''}`} onClick={() => setSubType('stopped')} style={{ color: 'var(--red)' }}>🚫 إيقاف</div>
                    </div>
                  </div>

                  {subType === 'custom' && (
                    <div className="field">
                      <label className="field-label">عدد أيام الاشتراك</label>
                      <input type="number" className="field-input" value={subDays} onChange={e => setSubDays(e.target.value)} disabled={creating} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" className="ad-submit-btn" disabled={creating} style={{ flex: 1, margin: 0 }}>
                    {creating ? (
                      <><div className="ad-submit-spinner" /> جاري الحفظ...</>
                    ) : (
                      <>{editingUser ? '💾 حفظ التعديلات' : '✨ إنشاء الحساب'}</>
                    )}
                  </button>
                  {editingUser && (
                    <button type="button" className="ad-submit-btn" onClick={cancelEdit} disabled={creating} style={{ flex: 1, margin: 0, background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--line)' }}>
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {isPlanModalOpen && (
        <div className="sa-modal-overlay" onClick={() => setIsPlanModalOpen(false)}>
          <div className="sa-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>{editingPlan ? '✏️ تعديل باقة' : '➕ إضافة باقة جديدة'}</h2>
              <button className="btn btn-sm" onClick={() => setIsPlanModalOpen(false)}>إغلاق</button>
            </div>
            <div className="sa-modal-body">
              <div className="field">
                <label className="field-label">اسم الباقة (بالعربية)</label>
                <input className="field-input" value={planName} onChange={e => setPlanName(e.target.value)} placeholder="مثال: الباقة الذهبية" />
              </div>
              <div className="field">
                <label className="field-label">اسم الباقة (بالإنجليزية - English Name)</label>
                <input className="field-input" value={planNameEn} onChange={e => setPlanNameEn(e.target.value)} placeholder="Example: Golden Plan" style={{ textAlign: 'left', direction: 'ltr' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="field">
                  <label className="field-label">السعر شهرياً</label>
                  <input type="number" className="field-input" value={planPrice} onChange={e => setPlanPrice(e.target.value)} placeholder="مثال: 500" />
                </div>
                <div className="field">
                  <label className="field-label">العملة</label>
                  <select className="field-input" value={planCurrency} onChange={e => setPlanCurrency(e.target.value)}>
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="KWD">دينار كويتي (KWD)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">المميزات بالعربية (ميزة في كل سطر)</label>
                <textarea className="field-input" rows="4" value={planFeatures} onChange={e => setPlanFeatures(e.target.value)} placeholder="دخول لكافة الأدوات&#10;دعم فني&#10;تحديثات دورية" style={{ resize: 'none' }} />
              </div>
              <div className="field">
                <label className="field-label">المميزات بالإنجليزية (ميزة في كل سطر - English Features)</label>
                <textarea className="field-input" rows="4" value={planFeaturesEn} onChange={e => setPlanFeaturesEn(e.target.value)} placeholder="Access all tools&#10;Tech support&#10;Regular updates" style={{ resize: 'none', textAlign: 'left', direction: 'ltr' }} />
              </div>
              <button className="ad-submit-btn" style={{ marginTop: 20 }} onClick={() => {
                if (!planName || !planPrice) return toast('يرجى ملأ البيانات الأساسية', 'error');
                if (editingPlan) {
                  setPlans(plans.map(p => p.id === editingPlan.id ? {
                    ...p,
                    name: planName,
                    name_ar: planName,
                    name_en: planNameEn,
                    price: planPrice,
                    currency: planCurrency,
                    features: planFeatures,
                    features_ar: planFeatures,
                    features_en: planFeaturesEn
                  } : p));
                } else {
                  setPlans([...plans, {
                    id: Date.now(),
                    name: planName,
                    name_ar: planName,
                    name_en: planNameEn,
                    price: planPrice,
                    currency: planCurrency,
                    features: planFeatures,
                    features_ar: planFeatures,
                    features_en: planFeaturesEn
                  }]);
                }
                setIsPlanModalOpen(false);
              }}>
                {editingPlan ? 'تحديث الباقة' : 'إضافة الباقة'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

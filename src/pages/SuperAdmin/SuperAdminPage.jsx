import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase';
import { libraryStorage } from '../../firebaseLibrary';
import { JOURNEY_STEPS } from '../../data/database';
import { TOOLS_24H } from '../../data/toolsData';
import SuperAdminLibrary from './SuperAdminLibrary';
import SuperAdminSettings from './SuperAdminSettings';
import SuperAdminLandingPages from './SuperAdminLandingPages';
import SuperAdminEmployees from './SuperAdminEmployees';
import SuperAdminSales from './SuperAdminSales';
import PhoneInput from '../../components/PhoneInput';
import './SuperAdmin.css';

export default function SuperAdminPage() {
  const { superAdminUserData: userData, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const lang = 'ar'; // Assuming Arabic as primary

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Form state
  const [brandName, setBrandName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [brandUrl, setBrandUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneKey, setPhoneKey] = useState('+20');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'library' | 'landing-pages' | 'settings' | 'employees'
  const [viewingUserDetails, setViewingUserDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all' | 'admin' | 'user'

  // Subscription state
  const [subType, setSubType] = useState('monthly'); // 'monthly' | 'lifetime' | 'custom' | 'stopped'
  const [subDays, setSubDays] = useState(30);

  const ALL_STEPS = [...JOURNEY_STEPS, ...TOOLS_24H];
  const TOTAL_STEPS_COUNT = ALL_STEPS.length;
  const totalSteps = TOTAL_STEPS_COUNT || 1;

  // Load brands/users from Firestore
  const loadBrands = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = [];
      snap.forEach(d => {
        const data = d.data();
        const isMainAdmin = userData?.email === 'admin@brand.com';
        if (isMainAdmin || data.role !== 'superadmin' || d.id === userData.uid) {
          list.push({ id: d.id, ...data });
        }
      });
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBrands(list);
    } catch (err) {
      console.error('Error loading brands:', err);
      toast('خطأ في تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBrands(); }, []);

  const handleCreate = async () => {
    if (role === 'admin' && !brandName.trim()) return toast('أدخل اسم البراند', 'error');
    if (!ownerName.trim()) return toast('أدخل اسم المالك', 'error');
    if (!email.trim()) return toast('أدخل البريد الإلكتروني', 'error');
    if (!password.trim() || password.length < 6) return toast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
    if (role === 'admin' && !brandUrl.trim()) return toast('أدخل رابط الموقع', 'error');
    if (!phoneNumber.trim()) return toast('أدخل رقم الهاتف', 'error');

    // التحقق من عدم تكرار الرابط (للبراند فقط)
    setCreating(true);
    if (role === 'admin') {
      try {
        const qUrl = query(collection(db, 'users'), where('brandUrl', '==', brandUrl.trim()));
        const snapUrl = await getDocs(qUrl);
        if (!snapUrl.empty) {
          setCreating(false);
          return toast('رابط الموقع هذا مسجل بالفعل لبراند آخر', 'error');
        }
      } catch (err) {
        console.error('Error checking unique URL:', err);
      }
    }

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
      secondaryApp = initializeApp(config, 'secondary-' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);

      const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
      const uid = cred.user.uid;

      let expiryDate = null;
      if (subType === 'monthly') {
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (subType === 'custom') {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Number(subDays));
      }

      await setDoc(doc(db, 'users', uid), {
        email: email.trim().toLowerCase(),
        role,
        brandName: role === 'admin' ? brandName.trim() : '',
        ownerName: ownerName.trim(),
        brandUrl: role === 'admin' ? brandUrl.trim() : '',
        phoneNumber: `${phoneKey}${phoneNumber.trim().replace(/^\+/, '')}`,
        photoURL: photoURL || '',
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || 'superadmin',
        subscription: {
          type: subType,
          expiryDate: expiryDate ? expiryDate : null,
          status: subType === 'stopped' ? 'stopped' : 'active',
          updatedAt: serverTimestamp()
        }
      });

      if (role === 'admin') {
        await setDoc(doc(db, 'brands', brandName.trim()), {
          name: brandName.trim(),
          adminUid: uid,
          themeConfig: { accent: '#3B82F6', success: '#10B981' },
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      toast(`تم إنشاء ${role === 'admin' ? 'البراند' : 'المستخدم'} بنجاح! ✅`, 'success');
      setBrandName('');
      setOwnerName('');
      setEmail('');
      setPassword('');
      setBrandUrl('');
      setPhoneNumber('');
      setIsAddModalOpen(false);
      await loadBrands(); 
      setProfileImage(null);
    } catch (err) {
      console.error('Create error:', err);
      toast('حدث خطأ أثناء الإنشاء', 'error');
    } finally {
      if (secondaryApp) { try { await deleteApp(secondaryApp); } catch {} }
      setCreating(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setBrandName(u.brandName || '');
    setOwnerName(u.ownerName || '');
    setEmail(u.email || '');
    setRole(u.role || 'admin');
    setBrandUrl(u.brandUrl || '');
    // Refined logic to split key and number
    const fullPhone = u.phoneNumber || '';
    if (fullPhone.startsWith('+')) {
      const match = fullPhone.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        setPhoneKey(match[1]);
        setPhoneNumber(match[2]);
      } else {
        setPhoneKey('+20');
        setPhoneNumber(fullPhone);
      }
    } else {
      setPhoneKey('+20');
      setPhoneNumber(fullPhone);
    }
    setSubType(u.subscription?.type || 'monthly');
    setSubDays(30);
    setIsAddModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setBrandName('');
    setOwnerName('');
    setEmail('');
    setBrandUrl('');
    setPhoneNumber('');
    setIsAddModalOpen(false);
  };

  const handleUpdate = async () => {
    if (role === 'admin' && !brandName.trim()) return toast('أدخل اسم البراند', 'error');
    if (!ownerName.trim()) return toast('أدخل اسم المالك', 'error');
    if (role === 'admin' && !brandUrl.trim()) return toast('أدخل رابط الموقع', 'error');
    if (!phoneNumber.trim()) return toast('أدخل رقم الهاتف', 'error');
    
    setCreating(true);
    if (role === 'admin') {
      try {
        // التحقق من عدم تكرار الرابط
        const qUrl = query(collection(db, 'users'), where('brandUrl', '==', brandUrl.trim()));
        const snapUrl = await getDocs(qUrl);
        const duplicate = snapUrl.docs.find(d => d.id !== editingUser.id);
        if (duplicate) {
          setCreating(false);
          return toast('رابط الموقع هذا مسجل بالفعل لبراند آخر', 'error');
        }
      } catch (err) {
        console.error('Error checking unique URL:', err);
      }
    }
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
      } else if (subType === 'lifetime') {
        expiryDate = null;
      }

      await updateDoc(doc(db, 'users', editingUser.id), {
        brandName: role === 'admin' ? brandName.trim() : '',
        ownerName: ownerName.trim(),
        brandUrl: role === 'admin' ? brandUrl.trim() : '',
        phoneNumber: `${phoneKey}${phoneNumber.trim().replace(/^\+/, '')}`,
        role: role,
        photoURL: photoURL || '',
        subscription: {
          type: subType,
          expiryDate: expiryDate ? expiryDate : null,
          status: subType === 'stopped' ? 'stopped' : 'active',
          updatedAt: serverTimestamp()
        }
      });
      toast('تم التحديث بنجاح ✅', 'success');
      cancelEdit();
      await loadBrands();
    } catch (err) {
      toast('حدث خطأ أثناء التحديث', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) handleUpdate(); else handleCreate();
  };

  const handleDelete = async (brand) => {
    if (!confirm(`هل تريد حذف "${brand.brandName || brand.email}"؟`)) return;
    try {
      await deleteDoc(doc(db, 'users', brand.id));
      toast('تم الحذف ✅', 'success');
      await loadBrands();
    } catch (err) {
      toast('خطأ في الحذف', 'error');
    }
  };

  const handleLogout = async () => {
    await logout('superadmin');
    navigate('/superadmin/login');
  };

  const admins = brands.filter(b => b.role === 'admin');
  const users = brands.filter(b => b.role === 'user');
  const employees = brands.filter(b => b.role === 'superadmin' && b.email !== 'admin@brand.com');
  const isMainAdmin = userData?.email === 'admin@brand.com';

  const formatDate = (ts) => {
    if (!ts?.seconds) return '—';
    return new Date(ts.seconds * 1000).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (!userData) {
    return (
      <div className="sa-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', height: '100vh' }}>
         <div className="ad-submit-spinner" />
      </div>
    );
  }

  return (
    <div className="sa-page" dir="rtl">
      <div className="sa-bg">
        <div className="sa-orb sa-orb-1" />
        <div className="sa-orb sa-orb-2" />
      </div>

      {/* Sidebar Navigation */}
      <div className="sa-sidebar">
        <div className="sa-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="sa-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="sa-topbar-title">لوحة التحكم</div>
              <div className="sa-topbar-sub">Super Admin</div>
            </div>
          </div>
        </div>

        <div className="sa-nav-links">
          <button className={`sa-nav-link ${activeTab === 'users' && !selectedBrand ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setSelectedBrand(null); }}>
            <span className="sa-nav-num">1</span> قسم البراندات
          </button>
          <button className={`sa-nav-link ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
            <span className="sa-nav-num">2</span> مكتبة المنتجات
          </button>
          <button className={`sa-nav-link ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
            <span className="sa-nav-num">3</span> إدارة المبيعات
          </button>
          <button className={`sa-nav-link ${activeTab === 'landing-pages' ? 'active' : ''}`} onClick={() => setActiveTab('landing-pages')}>
            <span className="sa-nav-num">4</span> صفحات الهبوط
          </button>
          {isMainAdmin && (
            <button className={`sa-nav-link ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
              <span className="sa-nav-num">5</span> الموظفين
            </button>
          )}
          <button className={`sa-nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <span className="sa-nav-num">6</span> الإعدادات
          </button>
        </div>

        <div className="sa-sidebar-footer">
          <button className="sa-logout-btn" onClick={handleLogout}>
            🚪 تسجيل خروج
          </button>
        </div>
      </div>

      <div className="sa-main">
        {/* Topbar */}
        <div className="sa-topbar">
          <div className="sa-topbar-left">
             <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text2)' }}>
                {activeTab === 'users' ? 'إدارة البراندات والمستخدمين' : 
                 activeTab === 'library' ? 'مكتبة محتوى البراندات' : 
                 activeTab === 'landing-pages' ? 'قوالب صفحات الهبوط' : 
                 activeTab === 'sales' ? 'إدارة المبيعات والإيرادات' :
                 activeTab === 'employees' ? 'إدارة فريق العمل' : 'إعدادات النظام'}
             </div>
          </div>
          <div className="sa-topbar-right">
            <div className="sa-user-badge">
              <div className="sa-user-dot" />
              مسؤول النظام
            </div>
          </div>
        </div>

        <div className="sa-content">
          {activeTab === 'library' ? (
            <SuperAdminLibrary />
          ) : activeTab === 'landing-pages' ? (
            <SuperAdminLandingPages />
          ) : activeTab === 'sales' ? (
            <SuperAdminSales allUsers={brands} />
          ) : activeTab === 'employees' && isMainAdmin ? (
            <SuperAdminEmployees 
              employees={employees} 
              allUsers={brands} 
              onAdd={() => { setEditingUser(null); setRole('superadmin'); setIsAddModalOpen(true); }}
              onEdit={(u) => { handleEditClick(u); setActiveTab('employees'); }}
              onDelete={handleDelete}
              formatDate={formatDate}
              totalSteps={TOTAL_STEPS_COUNT}
            />
          ) : activeTab === 'settings' ? (
            <SuperAdminSettings />
          ) : (
            <>
              {/* Stats */}
              <div className="sa-stats">
                {!selectedBrand ? (
                  <>
                    <div className="sa-stat-card">
                      <div className="sa-stat-icon">🏢</div>
                      <div className="sa-stat-value">{admins.length}</div>
                      <div className="sa-stat-label">براندات (أدمن)</div>
                    </div>
                    <div className="sa-stat-card">
                      <div className="sa-stat-icon">👥</div>
                      <div className="sa-stat-value">{users.length}</div>
                      <div className="sa-stat-label">مستخدمين</div>
                    </div>
                    <div className="sa-stat-card">
                      <div className="sa-stat-icon">📊</div>
                      <div className="sa-stat-value">{brands.length}</div>
                      <div className="sa-stat-label">إجمالي الحسابات</div>
                    </div>
                  </>
                ) : (() => {
                  const brandUsers = brands.filter(u => u.role === 'user' && (u.createdBy === selectedBrand.id || u.brandName === selectedBrand.brandName));
                  const totalUsers = brandUsers.length;
                  const completedAll = brandUsers.filter(u => (u.appState?.completedSteps?.length || 0) >= TOTAL_STEPS_COUNT).length;
                  const avgProgress = totalUsers > 0 
                    ? Math.round(brandUsers.reduce((acc, u) => acc + (u.appState?.completedSteps?.length || 0), 0) / (totalUsers * TOTAL_STEPS_COUNT) * 100) 
                    : 0;

                  return (
                    <>
                      <div className="sa-stat-card">
                        <div className="sa-stat-icon">👥</div>
                        <div className="sa-stat-value">{totalUsers}</div>
                        <div className="sa-stat-label">إجمالي المستخدمين</div>
                      </div>
                      <div className="sa-stat-card">
                        <div className="sa-stat-icon">📈</div>
                        <div className="sa-stat-value">{avgProgress}%</div>
                        <div className="sa-stat-label">متوسط إنجاز الفريق</div>
                      </div>
                      <div className="sa-stat-card">
                        <div className="sa-stat-icon">🏆</div>
                        <div className="sa-stat-value">{completedAll}</div>
                        <div className="sa-stat-label">أتموا كافة المراحل</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Grid: Table + Form */}
              {selectedBrand ? (
                <div className="sa-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="sa-table-card">
                    <div className="sa-card-header">
                      <div className="sa-card-title">
                        <button className="btn btn-sm" onClick={() => setSelectedBrand(null)} style={{ marginLeft: 16 }}>
                          &rarr; رجوع
                        </button>
                        👥 إدارة براند: <span style={{ color: 'var(--accent)' }}>{selectedBrand.brandName || selectedBrand.ownerName}</span>
                      </div>
                    </div>
                    <div className="sa-table-wrapper">
                      <table className="sa-table">
                        <thead>
                          <tr>
                            <th>الاسم</th>
                            <th>البريد</th>
                            <th>الدور</th>
                            <th>التقدم المنجز</th>
                            <th>التاريخ</th>
                            <th>الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {brands
                            .filter(u => (u.id === selectedBrand.id) || (u.createdBy === selectedBrand.id || u.brandName === selectedBrand.brandName))
                            .map(u => (
                              <tr key={u.id}>
                                <td>
                                  <div className="sa-brand-name">
                                    <div className="sa-brand-avatar" style={{ background: u.role === 'admin' ? 'var(--accent)' : 'var(--green)' }}>
                                      {(u.ownerName || u.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                    {u.ownerName || '—'}
                                  </div>
                                </td>
                                <td><span className="sa-brand-email">{u.email}</span></td>
                                <td>
                                  <span className={`sa-role-badge ${u.role === 'admin' ? 'sa-role-admin' : 'sa-role-user'}`}>
                                    {u.role === 'admin' ? '🛡 أدمن' : '👤 يوزر'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                                        <div style={{ 
                                            width: `${Math.round(((u.appState?.completedSteps?.length || 0) / TOTAL_STEPS_COUNT) * 100)}%`, 
                                            height: '100%', 
                                            background: 'var(--accent)' 
                                        }} />
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>
                                      {u.appState?.completedSteps?.length || 0} / {TOTAL_STEPS_COUNT}
                                    </span>
                                  </div>
                                </td>
                                <td><span className="sa-date">{formatDate(u.createdAt)}</span></td>
                                <td>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="btn btn-xs" onClick={() => setViewingUserDetails(u)}>🔍 تفاصيل التقدم</button>
                                    <button className="btn btn-xs" onClick={() => {
                                      handleEditClick(u);
                                      setSelectedBrand(null);
                                    }}>✏️ تعديل</button>
                                    <button className="sa-delete-btn" onClick={() => handleDelete(u)}>🗑️ حذف</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sa-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="sa-table-card">
                    <div className="sa-card-header">
                      <div className="sa-card-title">
                        📋 جدول أصحاب البراندات
                        <span className="sa-card-count">{brands.filter(b => b.role === 'admin').length}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button className="btn" onClick={() => { setEditingUser(null); setIsAddModalOpen(true); }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', fontWeight: 800 }}>
                          ➕ إضافة براند جديد
                        </button>
                        <div className="sa-search-box">
                          <input type="text" placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                      </div>
                    </div>
                    <div className="sa-table-wrapper">
                      <table className="sa-table">
                        <thead>
                          <tr>
                            <th>البراند</th>
                            <th>المالك</th>
                            <th>البريد</th>
                            <th>رقم الهاتف</th>
                            <th>الموقع</th>
                            <th>الاشتراك</th>
                            <th>الدور</th>
                            <th>التقدم</th>
                            <th>الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {brands.filter(b => {
                            const q = searchQuery.toLowerCase();
                            return b.role === 'admin' && (b.brandName?.toLowerCase().includes(q) || b.ownerName?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q));
                          }).map(b => (
                            <tr key={b.id} onClick={() => setSelectedBrand(b)} style={{ cursor: 'pointer' }}>
                              <td>
                                <div className="sa-brand-name">
                                  <div className="sa-brand-avatar" style={b.photoURL ? { background: `url("${b.photoURL}") center/cover no-repeat` } : {}}>
                                    {!b.photoURL && (b.brandName || b.email || '?').charAt(0).toUpperCase()}
                                  </div>
                                  {b.brandName || '—'}
                                </div>
                              </td>
                              <td>{b.ownerName || '—'}</td>
                              <td><span className="sa-brand-email">{b.email}</span></td>
                              <td><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', fontFamily: 'Cairo' }}>{b.phoneNumber || '—'}</span></td>
                              <td onClick={e => e.stopPropagation()}>
                                {b.brandUrl ? (
                                  <a href={b.brandUrl} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: 'var(--accent)', textDecoration: 'underline' }}>
                                    {b.brandUrl.replace(/^https?:\/\//, '').substring(0, 20)}...
                                  </a>
                                ) : '—'}
                              </td>
                              <td>
                                {b.subscription?.status === 'stopped' ? (
                                  <span style={{ color: 'var(--red)', fontSize: 11, fontWeight: 700 }}>🚫 متوقف</span>
                                ) : b.subscription?.type === 'lifetime' ? (
                                  <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700 }}>💎 دائم</span>
                                ) : b.subscription?.expiryDate ? (() => {
                                  const exp = b.subscription.expiryDate.toDate();
                                  const isExp = exp < new Date();
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ color: isExp ? 'var(--red)' : 'var(--green)', fontSize: 11, fontWeight: 700 }}>
                                        {isExp ? '⌛ منتهي' : '✅ نشط'}
                                      </span>
                                      <span style={{ fontSize: 9, color: 'var(--text3)' }}>{exp.toLocaleDateString('ar-EG')}</span>
                                    </div>
                                  );
                                })() : (
                                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>—</span>
                                )}
                              </td>
                              <td><span className="sa-role-badge sa-role-admin">🛡 أدمن</span></td>
                              <td>
                                <div style={{ width: 80 }}>
                                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                                        <div style={{ width: `${Math.round(((b.appState?.completedSteps?.length || 0) / totalSteps) * 100)}%`, height: '100%', background: 'var(--accent)' }} />
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>{b.appState?.completedSteps?.length || 0} / {TOTAL_STEPS_COUNT}</div>
                                </div>
                              </td>
                              <td onClick={e => e.stopPropagation()}>
                                <button className="btn btn-xs" style={{ marginLeft: 8 }} onClick={() => setSelectedBrand(b)}>المستخدمين</button>
                                <button className="btn btn-xs" style={{ marginLeft: 8 }} onClick={() => handleEditClick(b)}>تعديل</button>
                                <button className="sa-delete-btn" onClick={() => handleDelete(b)}>حذف</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      {isAddModalOpen && (
        <div className="sa-modal-overlay" onClick={cancelEdit}>
          <div className="sa-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>{editingUser ? '✏️ تعديل الحساب' : '➕ إنشاء حساب جديد'}</h2>
              <button className="btn btn-sm" onClick={cancelEdit}>إغلاق</button>
            </div>
            <div className="sa-modal-body">
              <form onSubmit={handleSubmit}>
                {!(role === 'superadmin' && activeTab === 'employees') && (
                  <div className="sa-form-section">
                    <div className="sa-form-section-title">نوع الحساب</div>
                    <div className="sa-role-selector">
                      <div className={`sa-role-option ${role === 'admin' ? 'active' : ''}`} onClick={() => setRole('admin')}>🛡 أدمن (براند)</div>
                      <div className={`sa-role-option ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>👤 مستخدم مستقل</div>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: role === 'admin' ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {role === 'admin' && (
                    <div className="field">
                      <label className="field-label">اسم البراند</label>
                      <input className="field-input" value={brandName} onChange={e => setBrandName(e.target.value)} disabled={creating} placeholder="اسم النشاط التجاري" />
                    </div>
                  )}
                  <div className="field">
                    <label className="field-label">{role === 'superadmin' ? 'اسم الموظف' : role === 'user' ? 'اسم المستخدم' : 'اسم المالك'}</label>
                    <input className="field-input" value={ownerName} onChange={e => setOwnerName(e.target.value)} disabled={creating} placeholder="الاسم الكامل" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label className="field-label">البريد الإلكتروني</label>
                    <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={creating || editingUser} placeholder="email@example.com" />
                  </div>
                  {!editingUser && (
                    <div className="field">
                      <label className="field-label">كلمة المرور</label>
                      <input className="field-input" type="text" value={password} onChange={e => setPassword(e.target.value)} disabled={creating} placeholder="6 رموز على الأقل" />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: role === 'admin' ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {role === 'admin' && (
                    <div className="field">
                      <label className="field-label">رابط الموقع (URL) *</label>
                      <input className="field-input" value={brandUrl} onChange={e => setBrandUrl(e.target.value)} disabled={creating} placeholder="https://example.com" dir="ltr" />
                    </div>
                  )}
                  <div className="field">
                    <label className="field-label">رقم الهاتف *</label>
                    <PhoneInput 
                      phoneKey={phoneKey} 
                      setPhoneKey={setPhoneKey} 
                      phoneNumber={phoneNumber} 
                      setPhoneNumber={setPhoneNumber} 
                      disabled={creating}
                    />
                  </div>
                </div>

                {role !== 'superadmin' && (
                  <>
                    <div className="sa-form-divider" />
                    
                    <div className="sa-form-section">
                      <div className="sa-form-section-title">خطة الاشتراك</div>
                      <div className="sa-role-selector" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        <div className={`sa-role-option ${subType === 'monthly' ? 'active' : ''}`} onClick={() => setSubType('monthly')}>🗓 شهر</div>
                        <div className={`sa-role-option ${subType === 'lifetime' ? 'active' : ''}`} onClick={() => setSubType('lifetime')}>💎 دائم</div>
                        <div className={`sa-role-option ${subType === 'custom' ? 'active' : ''}`} onClick={() => setSubType('custom')}>⚙️ محدد</div>
                        <div className={`sa-role-option ${subType === 'stopped' ? 'active' : ''}`} onClick={() => setSubType('stopped')} style={{ color: 'var(--red)' }}>🚫 إيقاف</div>
                      </div>
                    </div>

                    {subType === 'custom' && (
                      <div className="field">
                        <label className="field-label">عدد الأيام المسموح بها</label>
                        <input type="number" className="field-input" value={subDays} onChange={e => setSubDays(e.target.value)} disabled={creating} />
                      </div>
                    )}
                  </>
                )}

                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="sa-submit-btn" disabled={creating}>
                    {creating ? (
                      <><div className="ad-submit-spinner" /> جاري الحفظ...</>
                    ) : (
                      '💾 حفظ بيانات الحساب'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {viewingUserDetails && (
        <div className="sa-modal-overlay" onClick={() => setViewingUserDetails(null)}>
          <div className="sa-modal-content" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 style={{ fontSize: 18, color: '#fff' }}>📊 تفاصيل: {viewingUserDetails.brandName}</h2>
              <button className="btn btn-sm" onClick={() => setViewingUserDetails(null)}>إغلاق</button>
            </div>
            <div className="sa-modal-body">
               <div className="sa-steps-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ALL_STEPS.map(step => {
                    const isDone = viewingUserDetails.appState?.completedSteps?.includes(step.id);
                    return (
                      <div key={step.id} style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 10, opacity: isDone ? 1 : 0.5 }}>
                        {isDone ? '✓' : '○'} {step.label_ar || step.label}
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { libraryStorage } from '../../firebaseLibrary';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { JOURNEY_STEPS } from '../../data/database';
import { TOOLS_24H } from '../../data/toolsData';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Award,
  Trophy,
  Star,
  Target,
  Calendar,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Edit3,
  Camera,
  ExternalLink,
  Grid,
  List as ListIcon,
  Filter,
  Activity,
  Briefcase,
  ShieldCheck,
  ArrowUpRight,
  X,
  Layers,
  BookOpen,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import './ProfilePage.css';

// Reusable Animated Counter Component
function AnimatedCounter({ value, duration = 1.2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (start === end) {
      setCount(end);
      return;
    }
    const totalMs = duration * 1000;
    const incrementMs = 25;
    const steps = Math.ceil(totalMs / incrementMs);
    const stepVal = (end - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += stepVal;
      if ((stepVal > 0 && current >= end) || (stepVal < 0 && current <= end)) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, incrementMs);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

export default function ProfilePage() {
  const { state } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [uploading, setUploading] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'completed' | 'pending'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Modals State
  const [selectedStepModal, setSelectedStepModal] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  // Edit Profile Form State
  const [editName, setEditName] = useState(userData?.ownerName || '');
  const [editBrand, setEditBrand] = useState(userData?.brandName || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const allSteps = [...JOURNEY_STEPS, ...TOOLS_24H];
  const completedCount = state.completedSteps?.length || 0;
  const totalCount = allSteps.length;
  const progressPct = Math.round((completedCount / totalCount) * 100) || 0;

  // Calculate Days on Platform
  const createdAtMs = userData?.createdAt?.seconds ? userData.createdAt.seconds * 1000 : Date.now();
  const daysOnPlatform = Math.max(1, Math.floor((Date.now() - createdAtMs) / (1000 * 60 * 60 * 24)));

  // Trigger Milestone Confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getLabel = (item) => {
    if (lang === 'en') return item.label_en || item.label_ar || item.label;
    return item.label_ar || item.label_en || item.label;
  };

  const getToolValue = (stepId) => {
    switch (stepId) {
      case 'analysis-identity':
        return state.niche && state.brandName ? (
          <div>
            <div>{lang === 'en' ? 'Niche:' : 'النيش:'} {state.niche} ({state.subNiche || ''})</div>
            <div>{lang === 'en' ? 'Brand:' : 'اسم البراند:'} {state.brandName}</div>
          </div>
        ) : null;
      case 'niche-selection':
        return state.niche ? `${state.niche} (${state.subNiche || ''})` : null;
      case 'brand-naming':
        return state.brandName || null;
      case 'visual-identity':
        return state.primaryColor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: state.primaryColor }} />
            {state.primaryColor}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  // Profile Edit Save
  const handleSaveProfile = async () => {
    if (!userData?.uid) return;
    setIsSavingProfile(true);
    try {
      await setDoc(doc(db, 'users', userData.uid), {
        ownerName: editName,
        brandName: editBrand
      }, { merge: true });
      toast(lang ==='en' ?'Profile updated successfully!' :'تم تحديث بيانات الملف الشخصي بنجاح!','success');
      setIsEditProfileOpen(false);
      triggerConfetti();
    } catch (err) {
      console.error(err);
      toast(lang === 'en' ? 'Error saving profile' : 'حدث خطأ أثناء التحديث', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filtered Roadmap Steps
  const filteredSteps = allSteps.filter(s => {
    const isDone = state.completedSteps?.includes(s.id);
    if (filterMode === 'completed') return isDone;
    if (filterMode === 'pending') return !isDone;
    return true;
  });

  return (
    <div className="profile-page animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* HERO HEADER GLASS CARD */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <label className="profile-avatar-wrapper">
            <input type="file" hidden accept="image/*" onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setUploading(true);
              try {
                const imgRef = ref(libraryStorage, `avatars/${Date.now()}_${file.name}`);
                await uploadBytes(imgRef, file);
                const photoURL = await getDownloadURL(imgRef);
                await setDoc(doc(db, 'users', userData.uid), { photoURL }, { merge: true });
                toast(lang ==='en' ?'Profile photo updated!' :'تم تحديث الصورة الشخصية!','success');
              } catch (err) {
                toast(lang === 'en' ? 'Error uploading photo' : 'حدث خطأ أثناء رفع الصورة', 'error');
              } finally {
                setUploading(false);
              }
            }} disabled={uploading} />
            <div className={`profile-avatar ${uploading ? 'uploading' : ''}`} style={userData?.photoURL ? { backgroundImage: `url("${userData.photoURL}")` } : {}}>
              {!userData?.photoURL && (userData?.ownerName?.charAt(0).toUpperCase() || userData?.email?.charAt(0).toUpperCase() || 'U')}
              <div className="online-indicator" title={lang === 'en' ? 'Online Active' : 'نشط الآن'} />
              {uploading ? <div className="avatar-spinner" /> : <div className="avatar-edit-overlay"><Camera size={20} /></div>}
            </div>
          </label>

          <div className="profile-hero-details">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="profile-name">{userData?.ownerName || (lang === 'en' ? 'Guest User' : 'مستخدم جديد')}</h1>
              <button 
                className="profile-edit-btn"
                onClick={() => {
                  setEditName(userData?.ownerName || '');
                  setEditBrand(userData?.brandName || '');
                  setIsEditProfileOpen(true);
                }}
                title={lang === 'en' ? 'Edit Profile' : 'تعديل الملف الشخصي'}
              >
                <Edit3 size={14} />
              </button>
            </div>
            <p className="profile-email">{userData?.email}</p>
            <div className="profile-hero-badges">
              <span className="hero-role-badge">
                <ShieldCheck size={13} />
                {userData?.role === 'admin' ? (lang === 'en' ? 'Brand Founder' : 'مؤسس براند') : (lang === 'en' ? 'AI Strategist' : 'خبير مستقل')}
              </span>
              {userData?.subscription?.type && (
                <span className="hero-level-badge">
                  <Trophy size={13} />
                  {userData.subscription.type.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hero Right: Overall Progress Indicator */}
        <div className="profile-hero-right">
          <div className="hero-progress-label">
            <span>{lang === 'en' ? 'Overall Roadmap Progress' : 'نسبة إنجاز خريطة الطريق'}</span>
            <strong>{progressPct}%</strong>
          </div>
          <div className="hero-progress-track">
            <div className="hero-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: 6, textAlign: isRtl ? 'left' : 'right' }}>
            {completedCount} {lang === 'en' ? 'of' : 'من'} {totalCount} {lang === 'en' ? 'modules completed' : 'وحدة مكتملة'}
          </span>
        </div>
      </div>

      {/* DYNAMIC STATS BAR */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-number">
              <AnimatedCounter value={completedCount} />
              <span className="stat-sub"> / {totalCount}</span>
            </div>
            <div className="stat-title">{lang === 'en' ? 'Completed Modules' : 'الوحدات المكتملة'}</div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
            <Target size={22} />
          </div>
          <div>
            <div className="stat-number">
              <AnimatedCounter value={progressPct} />
              <span className="stat-sub">%</span>
            </div>
            <div className="stat-title">{lang === 'en' ? 'Strategy Execution' : 'معدل إنجاز الخطة'}</div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-number">
              <AnimatedCounter value={daysOnPlatform} />
              <span className="stat-sub"> {lang === 'en' ? 'Days' : 'يوم'}</span>
            </div>
            <div className="stat-title">{lang === 'en' ? 'Active Membership' : 'أيام النشاط بالمنصة'}</div>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className="stat-number" style={{ fontSize: 18 }}>
              {state.niche ? (lang === 'en' ? 'Configured' : 'مُجهّز') : (lang === 'en' ? 'Not Set' : 'غير محدد')}
            </div>
            <div className="stat-title">{lang === 'en' ? 'Niche & Strategy' : 'حالة النيش والبراند'}</div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="profile-main-grid">
        
        {/* LEFT COLUMN: ROADMAP STEP CARDS */}
        <div>
          {/* Controls Bar */}
          <div className="roadmap-controls-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={20} color="#6366F1" />
              <h2 className="section-title-text" style={{ margin: 0 }}>
                {lang === 'en' ? 'Interactive Business Roadmap' : 'خريطة الطريق التفاعلية'}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Filter Tabs */}
              <div className="roadmap-filter-tabs">
                <button className={`tab-btn ${filterMode === 'all' ? 'active' : ''}`} onClick={() => setFilterMode('all')}>
                  {lang === 'en' ? 'All' : 'الكل'}
                </button>
                <button className={`tab-btn ${filterMode === 'completed' ? 'active' : ''}`} onClick={() => setFilterMode('completed')}>
                  {lang === 'en' ? 'Completed' : 'المكتملة'}
                </button>
                <button className={`tab-btn ${filterMode === 'pending' ? 'active' : ''}`} onClick={() => setFilterMode('pending')}>
                  {lang === 'en' ? 'Pending' : 'المتبقية'}
                </button>
              </div>

              {/* View Switcher */}
              <div className="roadmap-view-switcher">
                <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                  <Grid size={15} />
                </button>
                <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                  <ListIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Roadmap Cards Grid / List */}
          <div className={`roadmap-container ${viewMode === 'list' ? 'list-layout' : 'grid-layout'}`}>
            {filteredSteps.map(step => {
              const isDone = state.completedSteps?.includes(step.id);
              const val = getToolValue(step.id);

              return (
                <motion.div
                  key={step.id}
                  className={`roadmap-card ${isDone ? 'done' : ''}`}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedStepModal(step)}
                >
                  <div className="card-status-badge">
                    {isDone ? (
                      <span className="status-tag done">
                        <CheckCircle2 size={12} /> {lang === 'en' ? 'Completed' : 'مكتمل'}
                      </span>
                    ) : (
                      <span className="status-tag pending">
                        <Clock size={12} /> {lang === 'en' ? 'Pending' : 'قيد الانتظار'}
                      </span>
                    )}
                  </div>

                  <h3 className="roadmap-card-title">{getLabel(step)}</h3>

                  {isDone && val ? (
                    <div className="roadmap-card-value">
                      <strong>{lang === 'en' ? 'Configured:' : 'النتيجة:'}</strong> {val}
                    </div>
                  ) : (
                    <p className="roadmap-card-desc">
                      {lang === 'en' ? 'Click to open tool and execute step.' : 'اضغط للفتح الفوري وتنفيذ هذه الخطوة.'}
                    </p>
                  )}

                  <div className="roadmap-card-footer">
                    <span>{lang === 'en' ? 'View Details' : 'عرض التفاصيل'}</span>
                    {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: REAL DATA SIDEBAR */}
        <div className="profile-sidebar-col">
          
          {/* Active Strategy Highlights Card */}
          <div className="profile-panel-card">
            <h3 className="panel-card-title">
              <Sparkles size={18} color="#6366F1" />
              <span>{lang === 'en' ? 'Current Business Profile' : 'بيانات البراند الاستراتيجية'}</span>
            </h3>

            <div className="info-detail-row">
              <span className="label">{lang === 'en' ? 'Niche:' : 'مجال العمل (النيش):'}</span>
              <span className="val">{state.niche || '—'}</span>
            </div>
            {state.subNiche && (
              <div className="info-detail-row">
                <span className="label">{lang === 'en' ? 'Sub-Niche:' : 'الفرع التخصصي:'}</span>
                <span className="val">{state.subNiche}</span>
              </div>
            )}
            <div className="info-detail-row">
              <span className="label">{lang === 'en' ? 'Brand Name:' : 'اسم البراند:'}</span>
              <span className="val">{state.brandName || userData?.brandName || '—'}</span>
            </div>
            {state.primaryColor && (
              <div className="info-detail-row">
                <span className="label">{lang === 'en' ? 'Brand Color:' : 'لون البراند:'}</span>
                <span className="val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: state.primaryColor }} />
                  {state.primaryColor}
                </span>
              </div>
            )}
          </div>

          {/* Account Metadata Card */}
          <div className="profile-panel-card">
            <h3 className="panel-card-title">
              <User size={18} color="#10B981" />
              <span>{lang === 'en' ? 'Account Metadata' : 'تفاصيل الحساب الأساسية'}</span>
            </h3>

            <div className="info-detail-row">
              <span className="label">{lang === 'en' ? 'Owner Name:' : 'اسم المستخدم:'}</span>
              <span className="val">{userData?.ownerName || '—'}</span>
            </div>
            <div className="info-detail-row">
              <span className="label">{lang === 'en' ? 'Email:' : 'البريد الإلكتروني:'}</span>
              <span className="val">{userData?.email || '—'}</span>
            </div>
            <div className="info-detail-row">
              <span className="label">{lang === 'en' ? 'Member Since:' : 'عضو منذ:'}</span>
              <span className="val">{userData?.createdAt?.seconds ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : '—'}</span>
            </div>
            <div className="info-detail-row">
              <span className="label">{lang === 'en' ? 'Default Currency:' : 'العملة المعتمدة:'}</span>
              <span className="val">{state.currency || 'USD'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* STEP PREVIEW MODAL */}
      {createPortal(
        <AnimatePresence>
          {selectedStepModal && (
            <div className="profile-modal-backdrop" onClick={() => setSelectedStepModal(null)}>
              <motion.div
                className="profile-modal-box"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Sparkles size={20} color="#6366F1" />
                    <h3 className="modal-title">{getLabel(selectedStepModal)}</h3>
                  </div>
                  <button className="modal-close-btn" onClick={() => setSelectedStepModal(null)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body">
                  <div style={{ marginBottom: 16 }}>
                    <span className={`status-tag ${state.completedSteps?.includes(selectedStepModal.id) ? 'done' : 'pending'}`}>
                      {state.completedSteps?.includes(selectedStepModal.id) 
                        ? (lang === 'en' ? 'Completed Step ✓' : 'خطوة منجزة بنجاح ✓') 
                        : (lang === 'en' ? 'Pending Execution' : 'قيد الانتظار للتنفيذ')}
                    </span>
                  </div>

                  {getToolValue(selectedStepModal.id) && (
                    <div className="modal-value-box">
                      <strong style={{ color: '#10B981', fontSize: 12, display: 'block', marginBottom: 4 }}>
                        💡 {lang === 'en' ? 'Saved Result & Config:' : 'النتائج المحفوظة بالمنصة:'}
                      </strong>
                      {getToolValue(selectedStepModal.id)}
                    </div>
                  )}

                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                    {lang === 'en' 
                      ? 'Execute or edit this strategy module using our direct live AI tools.' 
                      : 'قم بفتح الأداة الذكية مباشرة لتأطير أو تعديل مخرجات هذه الخطوة بالذكاء الاصطناعي.'}
                  </p>
                </div>

                <div className="modal-footer">
                  <button 
                    className="profile-primary-btn"
                    onClick={() => {
                      const stepId = selectedStepModal.id;
                      const isTool = selectedStepModal.section === 'tools' || selectedStepModal.section === 'freelance';
                      setSelectedStepModal(null);
                      if (isTool) {
                        navigate(`/dashboard/tool/${stepId}`);
                      } else {
                        navigate(`/dashboard/${stepId}`);
                      }
                    }}
                  >
                    <span>{lang === 'en' ? 'Open Module' : 'فتح الأداة مباشرة'}</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* EDIT PROFILE MODAL */}
      {createPortal(
        <AnimatePresence>
          {isEditProfileOpen && (
            <div className="profile-modal-backdrop" onClick={() => setIsEditProfileOpen(false)}>
              <motion.div
                className="profile-modal-box"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3 className="modal-title">{lang === 'en' ? 'Edit Profile' : 'تعديل البيانات الشخصية'}</h3>
                  <button className="modal-close-btn" onClick={() => setIsEditProfileOpen(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>
                      {lang === 'en' ? 'Full Name / Owner Name' : 'الاسم الكامل'}
                    </label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>
                      {lang === 'en' ? 'Brand / Company Name' : 'اسم البراند أو الشركة'}
                    </label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      value={editBrand}
                      onChange={e => setEditBrand(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="modal-cancel-btn" onClick={() => setIsEditProfileOpen(false)}>
                    {lang === 'en' ? 'Cancel' : 'إلغاء'}
                  </button>
                  <button 
                    className="profile-primary-btn"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    style={{ width: 'auto' }}
                  >
                    {isSavingProfile ? '...' : (lang === 'en' ? 'Save Changes' : 'حفظ والتعديل')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}

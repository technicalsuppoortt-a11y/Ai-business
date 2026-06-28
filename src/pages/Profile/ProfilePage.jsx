import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { libraryStorage } from '../../firebaseLibrary';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { JOURNEY_STEPS } from '../../data/database';
import { TOOLS_24H } from '../../data/toolsData';
import { useToast } from '../../context/ToastContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { state } = useApp();
  const { userData } = useAuth();
  const toast = useToast();
  const [uploading, setUploading] = React.useState(false);
  const lang = state.language || 'ar';

  const allSteps = [...JOURNEY_STEPS, ...TOOLS_24H];
  const completedCount = state.completedSteps?.length || 0;
  const totalCount = allSteps.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  // Helper to get labels based on language
  const getLabel = (item) => {
    if (lang === 'en') return item.label_en || item.label_ar || item.label;
    return item.label_ar || item.label_en || item.label;
  };

  const getToolValue = (stepId) => {
    switch (stepId) {
      case 'niche-selection':
        return state.niche ? `${state.niche} (${state.subNiche || ''})` : null;
      case 'brand-naming':
        return state.brandName || null;
      case 'visual-identity':
        return state.primaryColor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: state.primaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
            {state.primaryColor}
          </div>
        ) : null;
      case 'skills-crafting':
        return state.skills?.length > 0 ? state.skills.map(s => s.label).join(', ') : null;
      case 'freelance-pricing':
        return state.targetMonthlyIncome ? `${state.targetMonthlyIncome} ${state.currency || 'USD'}` : null;
      default:
        return null;
    }
  };

  return (
    <div className="profile-page animate-fade-in" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <div className="profile-header">
        <div className="profile-user-info">
          <label className="profile-avatar-wrapper" style={{ cursor: 'pointer' }}>
            <input type="file" hidden accept="image/*" onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setUploading(true);
              try {
                const imgRef = ref(libraryStorage, `avatars/${Date.now()}_${file.name}`);
                await uploadBytes(imgRef, file);
                const photoURL = await getDownloadURL(imgRef);
                await setDoc(doc(db, 'users', userData.uid), { photoURL }, { merge: true });
                toast('تم تحديث الصورة الشخصية ✅', 'success');
              } catch (err) {
                toast('حدث خطأ أثناء رفع الصورة', 'error');
              } finally {
                setUploading(false);
              }
            }} disabled={uploading} />
            <div className={`profile-avatar ${uploading ? 'uploading' : ''}`} style={userData?.photoURL ? { background: `url("${userData.photoURL}") center/cover no-repeat` } : {}}>
              {!userData?.photoURL && (userData?.ownerName?.charAt(0) || userData?.email?.charAt(0) || 'U')}
              {uploading && <div className="avatar-spinner" />}
              <div className="avatar-edit-overlay"><span>📷</span></div>
            </div>
          </label>
          <div>
            <h1 className="profile-name">{userData?.ownerName || (lang === 'en' ? 'Guest User' : 'مستخدم')}</h1>
            <p className="profile-email">{userData?.email}</p>
            <div className="profile-badge">
               {userData?.role === 'admin' ? (lang === 'en' ? 'Brand Owner' : 'صاحب براند') : (lang === 'en' ? 'Freelancer' : 'مستقل')}
            </div>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-value">{progressPct}%</div>
            <div className="stat-label">{lang === 'en' ? 'Total Progress' : 'التقدم الكلي'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{completedCount}/{totalCount}</div>
            <div className="stat-label">{lang === 'en' ? 'Steps Completed' : 'خطوات منجزة'}</div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">
            <span>🚀</span> {lang === 'en' ? 'Business Roadmap Details' : 'تفاصيل خريطة الطريق'}
          </h2>
          
          <div className="roadmap-list">
            {allSteps.map((step) => {
              const isDone = state.completedSteps?.includes(step.id);
              const value = getToolValue(step.id);
              
              return (
                <div key={step.id} className={`roadmap-item ${isDone ? 'done' : ''}`}>
                  <div className="roadmap-icon">{isDone ? '✅' : '⏳'}</div>
                  <div className="roadmap-info">
                    <div className="roadmap-step-name">{getLabel(step)}</div>
                    {isDone && value && (
                      <div className="roadmap-step-value">
                        <span>{lang === 'en' ? 'Your Choice:' : 'اختيارك:'}</span> {value}
                      </div>
                    )}
                  </div>
                  <div className="roadmap-status">
                    {isDone ? (lang === 'en' ? 'Completed' : 'مكتمل') : (lang === 'en' ? 'Pending' : 'قيد الانتظار')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="profile-sidebar">
           <div className="profile-card">
              <h3>{lang === 'en' ? 'Account Details' : 'تفاصيل الحساب'}</h3>
              <div className="detail-row">
                <span>{lang === 'en' ? 'Brand Name:' : 'اسم البراند:'}</span>
                <strong>{userData?.brandName || '—'}</strong>
              </div>
              <div className="detail-row">
                <span>{lang === 'en' ? 'Member Since:' : 'عضو منذ:'}</span>
                <strong>{userData?.createdAt?.seconds ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : '—'}</strong>
              </div>
              <div className="detail-row">
                <span>{lang === 'en' ? 'Language:' : 'اللغة المفضل:'}</span>
                <strong>{lang === 'en' ? 'English' : 'العربية'}</strong>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

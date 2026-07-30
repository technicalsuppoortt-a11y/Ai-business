import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, adminAuth, superAdminAuth, db } from '../firebase';
import { sendEmailViaResend } from '../services/emailCrmService';

const AuthContext = createContext(null);

const SUPERADMIN_EMAIL = 'admin@brand.com';

export function AuthProvider({ children }) {
  // === USER PORTAL STATE ===
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [brandData, setBrandData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // === ADMIN PORTAL STATE ===
  const [adminUser, setAdminUser] = useState(null);
  const [adminUserData, setAdminUserData] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  // === SUPER ADMIN PORTAL STATE ===
  const [superAdminUser, setSuperAdminUser] = useState(null);
  const [superAdminUserData, setSuperAdminUserData] = useState(null);
  const [loadingSuper, setLoadingSuper] = useState(true);

  // Helper to get auth instance
  const getAuthInstance = (portal) => {
    if (portal === 'admin') return adminAuth;
    if (portal === 'superadmin') return superAdminAuth;
    return auth;
  };

  // 1. Listen to USER Portal Auth
  useEffect(() => {
    let unsubscribeDoc = null;
    let unsubscribeBrand = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoadingUser(true);
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // --- Monthly Reset Cycle ---
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const lastReset = data.lastCreditResetDate || '';
            
            if (!lastReset.startsWith(currentMonthStr)) {
               const maxCredits = data.totalCredits !== undefined ? data.totalCredits : (data.creditsPerMonth !== undefined ? data.creditsPerMonth : 20);
               try {
                 const userRef = doc(db, 'users', firebaseUser.uid);
                 await updateDoc(userRef, { 
                   credits: maxCredits, 
                   lastCreditResetDate: `${currentMonthStr}-01` 
                 });
                 // The onSnapshot will fire again with the updated data, so we can return here
                 return; 
               } catch (err) {
                 console.error("Error resetting monthly credits:", err);
               }
            }
            // ---------------------------

            setUserData({ uid: firebaseUser.uid, ...data });
            if (data.brandName) {
              if (unsubscribeBrand) unsubscribeBrand();
              unsubscribeBrand = onSnapshot(doc(db, 'brands', data.brandName), (bSnap) => {
                if (bSnap.exists()) setBrandData(bSnap.data());
                else setBrandData({ name: data.brandName, themeConfig: data.themeConfig || null });
              });
            }
          } else {
            setUserData({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'user' });
          }
          setLoadingUser(false);
        }, (error) => {
          console.error('User Firestore snapshot error:', error);
          setUserData({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'user' });
          setLoadingUser(false);
        });
      } else {
        setUser(null); setUserData(null); setBrandData(null);
        if (unsubscribeDoc) unsubscribeDoc();
        if (unsubscribeBrand) unsubscribeBrand();
        setLoadingUser(false);
      }
    });
    return () => { unsubscribeAuth(); if (unsubscribeDoc) unsubscribeDoc(); if (unsubscribeBrand) unsubscribeBrand(); };
  }, []);

  // 2. Listen to ADMIN Portal Auth
  useEffect(() => {
    let unsubscribeDoc = null;
    const unsubscribeAuth = onAuthStateChanged(adminAuth, async (firebaseUser) => {
      if (firebaseUser) {
        setAdminUser(firebaseUser);
        // Reset loading while we fetch user data from Firestore
        setLoadingAdmin(true);
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setAdminUserData({ uid: firebaseUser.uid, ...docSnap.data() });
          } else {
            setAdminUserData({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'admin' });
          }
          setLoadingAdmin(false);
        }, (error) => {
          console.error('Admin Firestore snapshot error:', error);
          setAdminUserData({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'admin' });
          setLoadingAdmin(false);
        });
      } else {
        setAdminUser(null); setAdminUserData(null);
        if (unsubscribeDoc) unsubscribeDoc();
        setLoadingAdmin(false);
      }
    });
    return () => { unsubscribeAuth(); if (unsubscribeDoc) unsubscribeDoc(); };
  }, []);

  // 3. Listen to SUPER ADMIN Portal Auth
  useEffect(() => {
    let unsubscribeDoc = null;
    const unsubscribeAuth = onAuthStateChanged(superAdminAuth, async (firebaseUser) => {
      if (firebaseUser) {
        setSuperAdminUser(firebaseUser);
        setLoadingSuper(true);
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Force superadmin role if it's the master email
            const role = firebaseUser.email === SUPERADMIN_EMAIL ? 'superadmin' : (data.role || 'superadmin');
            setSuperAdminUserData({ uid: firebaseUser.uid, ...data, role });
          } else {
            setSuperAdminUserData({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'superadmin' });
          }
          setLoadingSuper(false);
        }, (error) => {
          console.error('SuperAdmin Firestore snapshot error:', error);
          setSuperAdminUserData({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'superadmin' });
          setLoadingSuper(false);
        });
      } else {
        setSuperAdminUser(null); setSuperAdminUserData(null);
        if (unsubscribeDoc) unsubscribeDoc();
        setLoadingSuper(false);
      }
    });
    return () => { unsubscribeAuth(); if (unsubscribeDoc) unsubscribeDoc(); };
  }, []);

  const login = async (email, password, portal) => {
    const authInstance = getAuthInstance(portal);
    return await signInWithEmailAndPassword(authInstance, email, password);
  };

  const logout = async (portal) => {
    const authInstance = getAuthInstance(portal);
    await signOut(authInstance);
  };

  // Helper to check auth based on portal
  const isAuthenticatedFor = (portal) => {
    if (portal === 'superadmin') return !!superAdminUser;
    if (portal === 'admin') return !!adminUser;
    return !!user;
  };

  const getUserDataFor = (portal) => {
    if (portal === 'superadmin') return superAdminUserData;
    if (portal === 'admin') return adminUserData;
    return userData;
  };

  const resetPassword = async (email, portal = 'user') => {
    const authInstance = getAuthInstance(portal);
    const cleanEmail = email.trim().toLowerCase();

    let role = portal;
    // Role authorization check in Firestore for admin/superadmin portals
    if (cleanEmail !== 'admin@brand.com') {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', cleanEmail));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const userData = snap.docs[0].data();
        role = userData.role || 'user';

        if (portal === 'admin' && role !== 'admin' && role !== 'superadmin') {
          throw new Error('ROLE_MISMATCH_ADMIN');
        }
        if (portal === 'superadmin' && role !== 'superadmin') {
          throw new Error('ROLE_MISMATCH_SUPER');
        }
      }
    }

    // Role-based dynamic Action URL Settings
    const redirectPath = (role === 'admin' || role === 'superadmin') ? '/admin/resetpassword' : '/auth/resetpassword';
    const actionCodeSettings = {
      url: `https://digital-product-3a97c.web.app${redirectPath}`,
      handleCodeInApp: true,
    };

    // 1. Firebase Auth Password Reset Email Link Generation
    let firebaseErr = null;
    try {
      await sendPasswordResetEmail(authInstance, cleanEmail, actionCodeSettings);
    } catch (err) {
      firebaseErr = err;
      console.warn('Firebase Auth sendPasswordResetEmail notice:', err);
    }

    // 2. Custom Branded Email via Resend API
    try {
      const portalName = portal === 'superadmin' ? 'Super Admin' : portal === 'admin' ? 'Admin' : 'User';
      const actionUrl = `https://digital-product-3a97c.web.app${redirectPath}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #0B0F17; color: #FFFFFF; padding: 24px;">
          <div style="max-width: 540px; margin: 0 auto; background: #151C2C; border: 1px solid #6366F1; border-radius: 16px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="color: #6366F1; margin-top: 0;">🔐 Reset Your ${portalName} Password</h2>
            <p style="color: #94A3B8; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password for account <code>${cleanEmail}</code> (${portalName} Portal).
            </p>
            <div style="text-align: center; margin: 26px 0;">
              <a href="${actionUrl}" style="background: linear-gradient(135deg, #6366F1, #7C3AED); color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(99,102,241,0.4);">
                Reset Password / إعادة تعيين كلمة المرور
              </a>
            </div>
            <div style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 10px; padding: 12px; margin: 20px 0; color: #CBD5E1; font-size: 12px; word-break: break-all;">
              Target Recovery URL: <a href="${actionUrl}" style="color: #818CF8;">${actionUrl}</a>
            </div>
            <p style="color: #64748B; font-size: 11px; margin-bottom: 0;">
              If you did not request this password reset, please ignore this email.
            </p>
          </div>
        </body>
        </html>
      `;

      await sendEmailViaResend({
        to: cleanEmail,
        subject: `🔐 Password Reset Request - ${portalName} Portal`,
        html: htmlContent
      });
    } catch (resendErr) {
      console.warn('Resend API notice:', resendErr);
    }

    if (firebaseErr && firebaseErr.code === 'auth/user-not-found') {
      throw firebaseErr;
    }

    return { success: true };
  };

  const isPortalLoading = (portal) => {
    if (portal === 'superadmin') return loadingSuper;
    if (portal === 'admin') return loadingAdmin;
    return loadingUser;
  };

  return (
    <AuthContext.Provider value={{
      // Users
      user, userData, brandData,
      adminUser, adminUserData,
      superAdminUser, superAdminUserData,
      
      // Flags
      loading: loadingUser || loadingAdmin || loadingSuper,
      loadingUser,
      loadingAdmin,
      loadingSuper,
      isPortalLoading,
      isSuperAdmin: !!superAdminUserData,
      isAdmin: !!adminUserData || !!superAdminUserData,
      isUser: !!userData,

      // Methods
      login,
      logout,
      resetPassword,
      isAuthenticatedFor,
      getUserDataFor,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

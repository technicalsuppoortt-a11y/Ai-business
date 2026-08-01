import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const SystemBrandingContext = createContext(null);

const DEFAULT_BRAND_NAME = "AI Business";
const DEFAULT_LOGO_URL = null; // Will fallback to default SVG/PNG in the Logo component

export function SystemBrandingProvider({ children }) {
  // Initialize from localStorage for instantaneous rendering to prevent flickering
  const [brandName, setBrandName] = useState(() => {
    return localStorage.getItem('system_brandName') || DEFAULT_BRAND_NAME;
  });
  
  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem('system_logoUrl') || DEFAULT_LOGO_URL;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firestore for global branding settings
  useEffect(() => {
    const docRef = doc(db, 'system_settings', 'branding');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newBrandName = data.brandName || DEFAULT_BRAND_NAME;
        const newLogoUrl = data.logoUrl || DEFAULT_LOGO_URL;
        
        setBrandName(newBrandName);
        setLogoUrl(newLogoUrl);
        
        // Cache to localStorage
        localStorage.setItem('system_brandName', newBrandName);
        if (newLogoUrl) {
          localStorage.setItem('system_logoUrl', newLogoUrl);
        } else {
          localStorage.removeItem('system_logoUrl');
        }
      } else {
        // Document doesn't exist, we fallback to defaults
        setBrandName(DEFAULT_BRAND_NAME);
        setLogoUrl(DEFAULT_LOGO_URL);
        localStorage.setItem('system_brandName', DEFAULT_BRAND_NAME);
        localStorage.removeItem('system_logoUrl');
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching system branding:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update document title globally when brandName changes
  useEffect(() => {
    // Only update if it's not the Super Admin dashboard (since super admin shouldn't be affected)
    if (!window.location.pathname.startsWith('/superadmin')) {
      document.title = `${brandName} - AI Platform`;
    }
  }, [brandName]);

  // Method for Super Admin to update global settings
  const updateBranding = async (newName, newLogoUrl) => {
    const docRef = doc(db, 'system_settings', 'branding');
    await setDoc(docRef, {
      brandName: newName,
      logoUrl: newLogoUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  const resetBranding = async () => {
    await updateBranding(DEFAULT_BRAND_NAME, DEFAULT_LOGO_URL);
  };

  return (
    <SystemBrandingContext.Provider value={{
      brandName,
      logoUrl,
      isLoading,
      updateBranding,
      resetBranding,
      DEFAULT_BRAND_NAME
    }}>
      {children}
    </SystemBrandingContext.Provider>
  );
}

export function useSystemBranding() {
  const ctx = useContext(SystemBrandingContext);
  if (!ctx) throw new Error('useSystemBranding must be used within SystemBrandingProvider');
  return ctx;
}

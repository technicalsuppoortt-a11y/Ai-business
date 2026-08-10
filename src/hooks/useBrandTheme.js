import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useBrandTheme() {
  const { userData, brandData, adminUserData } = useAuth();
  
  // Default fallback branding
  const DEFAULT_BRAND_NAME = "Ai Business";
  const DEFAULT_LOGO_URL = null;

  // Determine the active user based on portal (user or admin)
  const activeUser = userData || adminUserData;

  // State to hold the resolved branding
  const [branding, setBranding] = useState({
    brandName: DEFAULT_BRAND_NAME,
    logoUrl: DEFAULT_LOGO_URL,
    isLoading: true
  });

  useEffect(() => {
    if (!activeUser) {
      setBranding({ brandName: DEFAULT_BRAND_NAME, logoUrl: DEFAULT_LOGO_URL, isLoading: false });
      return;
    }

    // 1. If the logged in user IS an admin (Brand Owner), use their direct user doc data
    if (activeUser.role === 'admin') {
      setBranding({
        brandName: activeUser.brandName || activeUser.ownerName || DEFAULT_BRAND_NAME,
        logoUrl: activeUser.photoURL || DEFAULT_LOGO_URL,
        isLoading: false
      });
      return;
    }

    // 2. If the logged in user is a standard user belonging to a brand
    if (activeUser.role === 'user' && activeUser.brandName) {
      if (brandData) {
        setBranding({
          brandName: brandData.name || activeUser.brandName || DEFAULT_BRAND_NAME,
          logoUrl: brandData.logoUrl || brandData.photoURL || DEFAULT_LOGO_URL,
          isLoading: false
        });
      } else {
        setBranding({
          brandName: activeUser.brandName || DEFAULT_BRAND_NAME,
          logoUrl: DEFAULT_LOGO_URL,
          isLoading: false
        });
      }
      return;
    }

    // 3. Fallback for any other scenario
    setBranding({ brandName: DEFAULT_BRAND_NAME, logoUrl: DEFAULT_LOGO_URL, isLoading: false });
    
  }, [activeUser, brandData]);

  useEffect(() => {
    // Update document title
    document.title = branding.brandName || "Ai Business";

    // Update favicon
    const faviconElement = document.getElementById('dynamic-favicon');
    if (faviconElement) {
      if (branding.logoUrl) {
        faviconElement.href = branding.logoUrl;
      } else {
        // Fallback to default Ai Business SVG icon
        faviconElement.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cpath d='M20 2L35 11V29L20 38L5 29V11L20 2Z' fill='none' stroke='%233B82F6' stroke-width='2.5'/%3E%3Ccircle cx='20' cy='11' r='3.5' fill='%23E8EDF5'/%3E%3Ccircle cx='11' cy='25' r='3.5' fill='%23E8EDF5'/%3E%3Ccircle cx='29' cy='25' r='3.5' fill='%23E8EDF5'/%3E%3Cpolygon points='20,15 25,23 15,23' fill='%233B82F6'/%3E%3Ccircle cx='20' cy='20.5' r='2' fill='%23FFF'/%3E%3C/svg%3E";
      }
    }
  }, [branding.logoUrl, branding.brandName]);

  return branding;
}

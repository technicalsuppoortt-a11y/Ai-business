import React from 'react';
import MarketingTrackingSection from '../../components/Marketing/MarketingTrackingSection';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function MarketingTrackingPage() {
  const { userData } = useAuth();
  const { state } = useApp();
  const isRtl = state.language === 'ar';
  
  return (
    <div style={{ padding: '24px' }}>
      <MarketingTrackingSection 
        isAdmin={false} 
        userId={userData?.uid} 
        isRtl={isRtl} 
        t={(ar, en) => isRtl ? ar : en} 
      />
    </div>
  );
}

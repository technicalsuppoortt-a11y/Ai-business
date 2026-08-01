import React, { useState } from 'react';
import { useSystemBranding } from '../../context/SystemBrandingContext';

export default function Logo({ className = '', size = 32, showText = true, lang = 'ar', text, forceDefault = false }) {
  const { brandName, logoUrl, DEFAULT_BRAND_NAME } = useSystemBranding();
  const [imgError, setImgError] = useState(false);

  const isSuperAdmin = window.location.pathname.startsWith('/superadmin') || forceDefault;
  const activeLogoUrl = isSuperAdmin ? null : logoUrl;
  const activeBrandName = isSuperAdmin ? DEFAULT_BRAND_NAME : (text || brandName || DEFAULT_BRAND_NAME);

  const renderDefaultSvg = () => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent, #3B82F6)" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Hexagon Outline */}
        <path
          d="M20 2L35 11V29L20 38L5 29V11L20 2Z"
          fill="rgba(59, 130, 246, 0.04)"
          stroke="url(#logoGrad)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        
        {/* Tech Nodes */}
        <circle cx="20" cy="11" r="3.5" fill="var(--text, #E8EDF5)" />
        <circle cx="11" cy="25" r="3.5" fill="var(--text, #E8EDF5)" />
        <circle cx="29" cy="25" r="3.5" fill="var(--text, #E8EDF5)" />
        
        {/* Connection paths */}
        <line x1="20" y1="11" x2="11" y2="25" stroke="var(--text, #E8EDF5)" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="20" y1="11" x2="29" y2="25" stroke="var(--text, #E8EDF5)" strokeWidth="1.5" strokeOpacity="0.3" />
        <line x1="11" y1="25" x2="29" y2="25" stroke="var(--text, #E8EDF5)" strokeWidth="1.5" strokeOpacity="0.3" />

        {/* Central glowing triangle / rocket spark */}
        <polygon
          points="20,15 25,23 15,23"
          fill="url(#logoGrad)"
          filter="url(#logoGlow)"
        />
        <circle cx="20" cy="20.5" r="2" fill="#FFF" />
      </svg>
  );

  return (
    <div className={`flex-center gap-8 ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      {activeLogoUrl && !imgError ? (
        <img 
          src={activeLogoUrl} 
          alt={activeBrandName} 
          style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} 
          onError={() => setImgError(true)}
        />
      ) : (
        renderDefaultSvg()
      )}
      
      {showText && (
        <span style={{ fontSize: size * 0.5, fontWeight: 800, color: 'var(--text, #FFF)', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>
          {activeBrandName}
        </span>
      )}
    </div>
  );
}

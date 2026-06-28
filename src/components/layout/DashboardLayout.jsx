import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';

export default function DashboardLayout() {
  const { state } = useApp();
  const lang = state.language || 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-toggle"
        onClick={() => setMobileMenuOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'show' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar with mobile class */}
      <div className={`sidebar-wrapper ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Sidebar />
      </div>

      <div className="main-content">
        <div className="content-area">
          <Outlet />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .app-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg);
        }
        .main-content {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: var(--bg);
        }
        .mobile-toggle {
          position: fixed;
          top: 12px;
          ${lang === 'ar' ? 'right' : 'left'}: 12px;
          z-index: 900;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .mobile-toggle svg { width: 20px; height: 20px; }

        @media (max-width: 1024px) {
          .mobile-toggle { display: flex !important; }
          .sidebar-wrapper {
            position: fixed;
            ${lang === 'ar' ? 'right' : 'left'}: 0;
            top: 0;
            bottom: 0;
            z-index: 1000;
            transform: translateX(${lang === 'ar' ? '100%' : '-100%'});
            transition: transform 0.3s ease;
          }
          .sidebar-wrapper.mobile-open {
            transform: translateX(0);
          }
        }
        @media (min-width: 1025px) {
          .sidebar-wrapper {
            width: 260px;
            flex-shrink: 0;
            border-${lang === 'ar' ? 'left' : 'right'}: 1px solid var(--line);
          }
        }
      `}} />
    </div>
  );
}

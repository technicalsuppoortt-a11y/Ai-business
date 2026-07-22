import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const { state } = useApp();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-layout" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mobile Drawer Backdrop Overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'show' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Responsive Sidebar Drawer Wrapper */}
      <div className={`sidebar-wrapper ${mobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      </div>

      {/* Main Page Column: Top Navbar + Scrollable Content */}
      <div className="main-content">
        <DashboardNavbar 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <div className="content-area" style={{ minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .app-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg);
        }

        .sidebar-wrapper {
          height: 100vh;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 900;
        }

        .main-content {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 950;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .sidebar-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }

        @media (max-width: 1024px) {
          .sidebar-wrapper {
            position: fixed;
            top: 0;
            bottom: 0;
            ${isRtl ? 'right' : 'left'}: 0;
            z-index: 1000;
            transform: translateX(${isRtl ? '100%' : '-100%'});
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .sidebar-wrapper.mobile-open {
            transform: translateX(0);
          }
        }
      `}} />
    </div>
  );
}

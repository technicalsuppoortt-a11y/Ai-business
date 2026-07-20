import React from 'react';
import Logo from './Logo';

export default function BrandedLoader({ message = 'جاري التحميل...', size = 'full', lang = 'ar' }) {
  if (size === 'component') {
    return (
      <div 
        className="flex-center flex-column gap-12 skeleton" 
        style={{ 
          padding: 32, 
          justifyContent: 'center', 
          borderRadius: 'var(--radius)', 
          minHeight: 180,
          background: 'var(--bg2)',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{
          width: 32, height: 32,
          border: '3.5px solid var(--line2)',
          borderTopColor: 'var(--accent, #3B82F6)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 12, color: 'var(--text2, #8B96A8)', fontWeight: 600 }}>{message}</span>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'var(--bg, #080C14)',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Background decorations matching the premium theme */}
      <div className="lp-bg" style={{ opacity: 0.5 }}>
        <div className="lp-orb lp-orb1" />
        <div className="lp-orb lp-orb2" />
        <div className="lp-orb lp-orb3" />
        <div className="lp-grid" />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Pulsing logo */}
        <div className="logo-pulse-container" style={{ marginBottom: 24 }}>
          <Logo size={56} showText={false} />
        </div>
        
        {/* Sleek progress line */}
        <div style={{
          width: '160px',
          height: '3.5px',
          background: 'var(--line, rgba(255,255,255,0.06))',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: 16,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '50%',
            background: 'linear-gradient(90deg, var(--accent, #3B82F6), #8B5CF6)',
            borderRadius: '10px',
            animation: 'slide-progress 1.5s infinite ease-in-out'
          }} />
        </div>

        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text2, #8B96A8)',
          letterSpacing: '0.4px'
        }}>
          {message}
        </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-progress {
          0% { left: -50%; }
          100% { left: 100%; }
        }
        .logo-pulse-container {
          animation: logoPulse 2s infinite ease-in-out;
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.15)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.45)); }
        }
      `}} />
    </div>
  );
}

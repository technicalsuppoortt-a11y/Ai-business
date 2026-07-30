import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'info') => {
    setToasts(prev => {
      // Deduplicate: do not show if identical toast is currently visible
      if (prev.some(t => t.msg === msg && t.type === type)) {
        return prev;
      }
      const id = Date.now() + Math.random();
      setTimeout(() => {
        setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
      }, 4000);
      return [...prev, { id, msg, type }];
    });
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} style={{ color: '#10B981', flexShrink: 0 }} />;
      case 'error': return <XCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />;
      case 'warning': return <AlertTriangle size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />;
      default: return <Info size={18} style={{ color: '#3B82F6', flexShrink: 0 }} />;
    }
  };

  const getGlowColor = (type) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.15)';
      case 'error': return 'rgba(239, 68, 68, 0.15)';
      case 'warning': return 'rgba(245, 158, 11, 0.15)';
      default: return 'rgba(59, 130, 246, 0.15)';
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.25)';
      case 'error': return 'rgba(239, 68, 68, 0.25)';
      case 'warning': return 'rgba(245, 158, 11, 0.25)';
      default: return 'rgba(59, 130, 246, 0.25)';
    }
  };

  const getLeftBorderColor = (type) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 80, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              layout
              style={{
                background: 'rgba(10, 16, 32, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${getBorderColor(t.type)}`,
                borderLeft: `4px solid ${getLeftBorderColor(t.type)}`,
                borderRadius: '12px',
                padding: '14px 18px',
                fontSize: '13px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                pointerEvents: 'auto',
                boxShadow: `0 10px 30px -5px rgba(0,0,0,0.5), 0 0 20px 0 ${getGlowColor(t.type)}`,
                minWidth: '320px',
                maxWidth: '450px',
                fontFamily: 'Cairo, sans-serif',
                position: 'relative',
                overflow: 'hidden',
                direction: 'rtl'
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                {getIcon(t.type)}
              </div>
              <div style={{ flex: 1, fontWeight: '600', letterSpacing: '0.1px', lineHeight: 1.4 }}>{t.msg}</div>
              
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  marginLeft: '-4px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none' }}
              >
                <X size={14} />
              </button>

              {/* Timeout Progress Bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: getLeftBorderColor(t.type),
                  opacity: 0.8
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

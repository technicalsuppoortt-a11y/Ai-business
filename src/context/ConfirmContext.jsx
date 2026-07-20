import { createContext, useContext, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const resolveRef = useRef(null);

  const confirm = (message, title = 'تأكيد الإجراء') => {
    setConfig({ message, title });
    setIsOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleClose = (value) => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: 'rgba(5, 8, 16, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => handleClose(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--bg2, #0D1426)',
                border: '1px solid var(--line, #1E293B)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--red, #EF4444)',
              }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
                {config.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text2, #94A3B8)', marginBottom: '24px', lineHeight: '1.6' }}>
                {config.message}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleClose(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--line, #1E293B)',
                    background: 'transparent',
                    color: 'var(--text2, #94A3B8)',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleClose(true)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--red, #EF4444), #B91C1C)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                  }}
                >
                  تأكيد
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
}

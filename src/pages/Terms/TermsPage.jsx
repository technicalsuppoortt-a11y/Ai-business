import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsContent from '../../components/common/TermsContent';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TermsPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const lang = state.language || 'ar';
  const isRtl = lang === 'ar';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #080C14)', color: 'var(--text, #fff)' }}>
      {/* Simple Header */}
      <div style={{
        padding: '20px 40px',
        borderBottom: '1px solid var(--line, rgba(255,255,255,0.08))',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: 'var(--bg2, #0D1220)'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#fff',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          {isRtl ? 'الشروط والأحكام' : 'Terms & Conditions'}
        </h1>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          background: 'var(--bg2, #0D1220)',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid var(--line, rgba(255,255,255,0.08))',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <TermsContent isRtl={isRtl} />
        </div>
      </div>
    </div>
  );
}

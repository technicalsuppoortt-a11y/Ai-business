import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { OFFER_STRUCTURES } from '../../data/database';
import Topbar from '../../components/layout/Topbar';

export default function OffersPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const lang = state.language || 'ar';

  const proceed = () => {
    dispatch({ type: 'COMPLETE_STEP', step: 'offers' });
    toast(lang ==='en' ?'Offers ready! Let\'s move to ads' :'العروض جاهزة! لننتقل للإعلانات','success');
    navigate('/dashboard/ads');
  };

  return (
    <>
      <Topbar
        title={lang === 'en' ? '💰 Offers & Pricing' : '💰 العروض والأسعار'}
        subtitle={lang === 'en' ? 'Smart offer structures — with psychological and strategic explanation for each type' : 'هياكل عروض ذكية — بشرح نفسي واستراتيجي لكل نوع'}
      />
      <div className="content-area view-enter">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{lang === 'en' ? 'Strategic Offer Structures' : 'هياكل العروض الاستراتيجية'}</div>
              <div className="card-sub">{lang === 'en' ? 'Each offer is built on purchase psychology — choose what suits your project' : 'كل عرض مبني على علم نفس الشراء — اختر ما يناسب مشروعك'}</div>
            </div>
            <div className="badge badge-amber">{lang === 'en' ? 'Step 5' : 'الخطوة 5'}</div>
          </div>
          <div className="grid-2">
            {OFFER_STRUCTURES.map(o => (
              <div key={o.id} style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 18, transition: 'all .2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{lang === 'en' ? o.name_en : o.name_ar}</div>
                  <span className="badge badge-green" style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>{o.priceRange}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 10 }}>{lang === 'en' ? o.description_en : o.description_ar}</div>
                <div style={{ background: 'rgba(139,92,246,0.06)', borderRight: '2px solid var(--purple)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', padding: '8px 12px', marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--purple)', marginBottom: 2 }}>🧠 {lang === 'en' ? 'Psychology' : 'علم النفس'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>{lang === 'en' ? o.psychology_en : o.psychology_ar}</div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>🎯 {lang === 'en' ? 'Best for:' : 'الأفضل لـ:'} <span style={{ color: 'var(--text2)' }}>{lang === 'en' ? o.bestFor_en : o.bestFor_ar}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={proceed}>
            {lang === 'en' ? 'Proceed to Ads' : 'الانتقال للإعلانات'}
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}

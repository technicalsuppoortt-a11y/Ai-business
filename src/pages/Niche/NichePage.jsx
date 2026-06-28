import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { NICHES } from '../../data/database';
import Topbar from '../../components/layout/Topbar';

export default function NichePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const lang = state.language || 'ar';

  const selectNiche = (id) => {
    dispatch({ type: 'SET_FIELD', field: 'niche', value: id });
  };

  const proceed = () => {
    if (!state.niche) return toast(lang === 'en' ? 'Choose a niche first' : 'اختر نيتش أولاً', 'error');
    dispatch({ type: 'COMPLETE_STEP', step: 'niche' });
    toast(lang === 'en' ? 'Excellent! Let\'s go to the Product Library 📚' : 'ممتاز! لننتقل إلى مكتبة المنتجات 📚', 'success');
    navigate('/dashboard/brand-library');
  };

  return (
    <>
      <Topbar
        title={lang === 'en' ? '🎯 Niche & Market' : '🎯 النيتش والسوق'}
        subtitle={lang === 'en' ? 'Choose your field — the system fully specializes based on your choice' : 'اختر مجالك — النظام يتخصص بالكامل حسب اختيارك'}
      />
      <div className="content-area view-enter">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{lang === 'en' ? 'Choose your primary field' : 'اختر مجالك الأساسي'}</div>
              <div className="card-sub">
                {lang === 'en'
                  ? 'Every tool in the system will specialize based on the niche you choose — content, offers, names, all will be customized for you'
                  : 'كل أداة في النظام ستتخصص حسب النيتش الذي تختاره — المحتوى، العروض، الأسماء، كلها ستكون مخصصة لك'}
              </div>
            </div>
            <div className="badge badge-blue">{lang === 'en' ? 'Step 2' : 'الخطوة 2'}</div>
          </div>
          <div className="grid-3">
            {NICHES.map(n => (
              <div
                key={n.id}
                onClick={() => selectNiche(n.id)}
                style={{
                  background: state.niche === n.id ? 'rgba(59,130,246,0.08)' : 'var(--bg3)',
                  border: `1px solid ${state.niche === n.id ? 'rgba(59,130,246,0.4)' : 'var(--line)'}`,
                  borderRadius: 'var(--radius)', padding: 16, cursor: 'pointer',
                  transition: 'all .25s', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{n.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: state.niche === n.id ? 'var(--accent)' : 'var(--text)' }}>
                  {lang === 'en' ? n.label_en.replace(n.icon + ' ', '') : n.label_ar.replace(n.icon + ' ', '')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {state.niche && (
          <div className="card" style={{ background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
              {lang === 'en' ? '✓ System ready for your niche' : '✓ النظام جاهز لتخصصك'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.7 }}>
              {lang === 'en'
                ? `System will be customized for ${NICHES.find(n => n.id === state.niche)?.label_en || state.niche}. You won't be asked to repeat this choice.`
                : `سيتم تخصيص النظام لـ ${NICHES.find(n => n.id === state.niche)?.label_ar || state.niche}. لن يُطلب منك تكرار هذا الاختيار.`}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={proceed}>
            {lang === 'en' ? 'Proceed to Product Library' : 'الانتقال لمكتبة المنتجات'}
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}

import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Topbar from '../../components/layout/Topbar';

export default function GrowthPage() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const lang = state.language || 'ar';

  const strategies = [
    { title: 'Referral System', icon: '🤝', desc_ar: 'حوّل كل عميل راضي لمصدر عملاء جدد — خصم 10-15% لكل إحالة ناجحة', desc_en: 'Turn every satisfied customer into a new lead source — 10-15% discount for each successful referral', impact_ar: 'مرتفع', impact_en: 'High' },
    { title: lang === 'en' ? 'Organic Content' : 'المحتوى العضوي', icon: '🌱', desc_ar: 'انشر 3-5 مرات أسبوعياً — محتوى قيمة يجذب جمهور عضوي بدون إعلانات', desc_en: 'Publish 3-5 times weekly — value content that attracts organic audience without ads', impact_ar: 'طويل المدى', impact_en: 'Long Term' },
    { title: 'Retainer Clients', icon: '🔄', desc_ar: 'حوّل العملاء لاشتراكات شهرية — دخل متكرر ومستقر', desc_en: 'Convert clients to monthly subscriptions — recurring and stable income', impact_ar: 'مرتفع جداً', impact_en: 'Very High' },
    { title: 'Community Building', icon: '👥', desc_ar: 'ابنِ مجتمع حول البراند — Telegram أو Discord — قيمة مجانية ثم بيع', desc_en: 'Build a community around the brand — Telegram or Discord — free value then sell', impact_ar: 'مرتفع', impact_en: 'High' },
    { title: 'LinkedIn Strategy', icon: '💼', desc_ar: 'انشر يومياً على LinkedIn — جذب عملاء B2B بجودة عالية', desc_en: 'Post daily on LinkedIn — attract high-quality B2B clients', impact_ar: 'متوسط-مرتفع', impact_en: 'Medium-High' },
    { title: 'Email Sequences', icon: '📧', desc_ar: 'أتمتة تسلسلات بريدية — تبيع حتى وأنت نائم', desc_en: 'Automate email sequences — sells even while you sleep', impact_ar: 'مرتفع', impact_en: 'High' },
  ];

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', step: 'growth' });
    toast(lang ==='en' ?' Congratulations! You completed all the steps' :' مبروك! أكملت كل الخطوات','success');
  };

  return (
    <>
      <Topbar
        title={lang === 'en' ? '📈 Growth' : '📈 النمو'}
        subtitle={lang === 'en' ? 'Proven growth strategies to scale your business' : 'استراتيجيات نمو مثبتة لتوسيع مشروعك'}
      />
      <div className="content-area view-enter">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{lang === 'en' ? 'Smart Growth Strategies' : 'استراتيجيات النمو الذكية'}</div>
              <div className="card-sub">{lang === 'en' ? 'Sorted by impact — start from the highest impact' : 'مرتبة حسب التأثير — ابدأ من الأعلى تأثيراً'}</div>
            </div>
            <div className="badge badge-green">{lang === 'en' ? 'Step 7' : 'الخطوة 7'}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {strategies.map((s, i) => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.title}</div>
                    <span className="badge badge-green">{lang === 'en' ? 'Impact:' : 'التأثير:'} {lang === 'en' ? s.impact_en : s.impact_ar}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>{lang === 'en' ? s.desc_en : s.desc_ar}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleComplete}>
            🎉 {lang === 'en' ? 'Complete the Journey' : 'إنهاء الرحلة'}
          </button>
        </div>
      </div>
    </>
  );
}

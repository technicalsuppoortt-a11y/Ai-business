import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Topbar from '../../components/layout/Topbar';

export default function AdsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const lang = state.language || 'ar';

  const adIdeas = [
    {
      type: 'Hook Ad',
      icon: '🎣',
      desc_ar: 'إعلان يبدأ بسؤال صادم أو إحصائية مفاجئة',
      desc_en: 'An ad that starts with a shocking question or a surprising statistic',
      ctr_ar: 'عالي', ctr_en: 'High',
      bestFor_ar: 'التوعية وجذب الانتباه',
      bestFor_en: 'Awareness & attention grabbing'
    },
    {
      type: 'Testimonial Ad',
      icon: '⭐',
      desc_ar: 'إعلان يعتمد على شهادة عميل حقيقي',
      desc_en: 'An ad based on a real customer testimonial',
      ctr_ar: 'متوسط-عالي', ctr_en: 'Medium-High',
      bestFor_ar: 'بناء الثقة والتحويل',
      bestFor_en: 'Trust building & conversion'
    },
    {
      type: 'Before/After',
      icon: '🔄',
      desc_ar: 'إعلان يُظهر التحول الحقيقي',
      desc_en: 'An ad that shows the real transformation',
      ctr_ar: 'عالي جداً', ctr_en: 'Very High',
      bestFor_ar: 'الخدمات والمنتجات التحولية',
      bestFor_en: 'Transformative services & products'
    },
    {
      type: 'Urgency Ad',
      icon: '⏰',
      desc_ar: 'إعلان بعنصر الاستعجال — عرض محدود',
      desc_en: 'An ad with urgency element — limited offer',
      ctr_ar: 'عالي', ctr_en: 'High',
      bestFor_ar: 'التحويل المباشر',
      bestFor_en: 'Direct conversion'
    },
    {
      type: 'Story Ad',
      icon: '📖',
      desc_ar: 'إعلان يحكي قصة حقيقية',
      desc_en: 'An ad that tells a real story',
      ctr_ar: 'متوسط', ctr_en: 'Medium',
      bestFor_ar: 'الارتباط العاطفي',
      bestFor_en: 'Emotional connection'
    },
    {
      type: 'Authority Ad',
      icon: '🏆',
      desc_ar: 'إعلان يعرض الأرقام والإنجازات',
      desc_en: 'An ad showcasing numbers and achievements',
      ctr_ar: 'متوسط-عالي', ctr_en: 'Medium-High',
      bestFor_ar: 'B2B والمحترفين',
      bestFor_en: 'B2B & professionals'
    },
  ];

  const proceed = () => {
    dispatch({ type: 'COMPLETE_STEP', step: 'ads' });
    toast(lang ==='en' ?'Ads ready! Let\'s talk about growth' :'الإعلانات جاهزة! لنتحدث عن النمو','success');
    navigate('/dashboard/growth');
  };

  return (
    <>
      <Topbar
        title={lang === 'en' ? '📣 Ads' : '📣 الإعلانات'}
        subtitle={lang === 'en' ? 'Smart ad ideas tailored for your niche' : 'أفكار إعلانية ذكية مخصصة لمجالك'}
      />
      <div className="content-area view-enter">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{lang === 'en' ? 'Smart Ad Types' : 'أنواع الإعلانات الذكية'}</div>
              <div className="card-sub">{lang === 'en' ? 'Each type with expected CTR info and best use case' : 'كل نوع بمعلومات الـ CTR المتوقع والاستخدام الأفضل'}</div>
            </div>
            <div className="badge badge-blue">{lang === 'en' ? 'Step 6' : 'الخطوة 6'}</div>
          </div>
          <div className="grid-3">
            {adIdeas.map((ad, i) => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, transition: 'all .2s' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{ad.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ad.type}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>
                  {lang === 'en' ? ad.desc_en : ad.desc_ar}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                  📊 CTR: <span style={{ color: 'var(--green)' }}>{lang === 'en' ? ad.ctr_en : ad.ctr_ar}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                  🎯 {lang === 'en' ? 'Best for:' : 'الأفضل لـ:'} <span style={{ color: 'var(--text2)' }}>{lang === 'en' ? ad.bestFor_en : ad.bestFor_ar}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={proceed}>
            {lang === 'en' ? 'Proceed to Growth Strategy' : 'الانتقال لاستراتيجية النمو'}
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { getBrandNames } from '../../services/dataService';
import Topbar from '../../components/layout/Topbar';

const STYLE_LABELS = {
  short: '⚡ قصير', premium: '👑 فاخر', arabic: '🕌 عربي',
  startup: '🚀 ستارت أب', emotional: '💫 عاطفي', bold: '🔥 جريء',
};
const STYLE_LABELS_EN = {
  short: '⚡ Short', premium: '👑 Premium', arabic: '🕌 Arabic',
  startup: '🚀 Startup', emotional: '💫 Emotional', bold: '🔥 Bold',
};
const BADGE_COLORS = {
  short: 'blue', premium: 'amber', arabic: 'green',
  startup: 'purple', emotional: 'pink', bold: 'red',
};

const BRAND_TYPES = [
  { id: 'local', title_ar: 'براند محلي / عربي', title_en: 'Local / Arabic Brand', sub_ar: 'للجمهور الخليجي والعربي الأصيل', sub_en: 'For Gulf & Arab audiences', icon: '🕌' },
  { id: 'global', title_ar: 'براند عالمي / تقني', title_en: 'Global / Tech Brand', sub_ar: 'للتوسع والشركات الناشئة والمجال التقني', sub_en: 'For startups, global expansion & tech fields', icon: '🌐' },
];

export default function BrandingPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const lang = state.language || 'ar';
  const [allNames, setAllNames] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedType, setSelectedType] = useState('local');
  const [loading, setLoading] = useState(true);

  const niche = state.niche || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getBrandNames(niche);
        setAllNames(data);
      } catch (err) {
        console.error('Failed to load brand names:', err);
        toast(lang === 'en' ? 'Error loading data' : 'خطأ في تحميل البيانات', 'error');
      }
      setLoading(false);
    }
    load();
  }, [niche]);

  const generateNames = useCallback(() => {
    let pool = [...allNames];
    if (selectedStyle) pool = pool.filter(n => n.style === selectedStyle);
    // Shuffle & pick 8
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 8);
    setResults(shuffled);
    if (shuffled.length === 0) toast(lang === 'en' ? 'No names for this category yet' : 'لا توجد أسماء لهذا التصنيف حالياً', 'info');
  }, [allNames, selectedStyle]);

  const proceed = () => {
    dispatch({ type: 'COMPLETE_STEP', step: 'branding' });
    toast(lang === 'en' ? 'Brand ready! Let\'s create content ✍️' : 'البراند جاهز! لنصنع المحتوى ✍️', 'success');
    navigate('/dashboard/content');
  };

  const styles = [...new Set(allNames.map(n => n.style))];

  return (
    <>
      <Topbar title={lang === 'en' ? '🏷️ Branding' : '🏷️ البراندينج'} subtitle={lang === 'en' ? 'Brand name + Visual identity + Positioning' : 'اسم البراند + الهوية البصرية + التموضع'} />
      <div className="content-area view-enter">
        <div className="step-container">
          
          {/* Step Header */}
          <div className="step-header">
            <div className="step-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div className="step-badge">
                  <div className="step-badge-dot" />
                  {lang === 'en' ? 'Step 3' : 'الخطوة 3'}
                </div>
                <div style={{ background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: 12 }}>✓</div>
              </div>
              <h2>{lang === 'en' ? 'Brand Name & Identity' : 'اسم البراند والهوية'}</h2>
              <p>{lang === 'en' ? 'The cornerstone of your project identity. Choose the style that reflects your vision and we will generate smart options customized for you and your audience.' : 'حجر الأساس لهوية مشروعك. اختر النمط الذي يعكس رؤيتك وسنقوم بتوليد خيارات ذكية مخصصة لك ولجمهورك.'}</p>
            </div>
          </div>

          {/* Featured Selection */}
          <div className="featured-grid">
            {BRAND_TYPES.map(t => (
              <div 
                key={t.id} 
                className={`featured-card ${selectedType === t.id ? 'active' : ''}`}
                onClick={() => setSelectedType(t.id)}
              >
                <div className="featured-icon">{t.icon}</div>
                <div className="featured-title">{lang === 'en' ? t.title_en : t.title_ar}</div>
                <div className="featured-sub">{lang === 'en' ? t.sub_en : t.sub_ar}</div>
              </div>
            ))}
          </div>

          {/* Sub Selection (Styles) */}
          <div className="sub-selection-title">{lang === 'en' ? 'Choose Name Style' : 'اختر نمط الاسم (Style)'}</div>
          <div className="selection-grid">
            <div className={`selection-card ${!selectedStyle ? 'active' : ''}`} onClick={() => setSelectedStyle(null)}>
              <div className="selection-icon">🌐</div>
              <div className="selection-label">{lang === 'en' ? 'All' : 'الكل'}</div>
            </div>
            {styles.map(s => (
              <div 
                key={s} 
                className={`selection-card ${selectedStyle === s ? 'active' : ''}`} 
                onClick={() => setSelectedStyle(s)}
              >
                <div className="selection-icon">{STYLE_LABELS[s]?.split(' ')[0] || '✨'}</div>
                <div className="selection-label">{lang === 'en' ? (STYLE_LABELS_EN[s]?.split(' ')[1] || s) : (STYLE_LABELS[s]?.split(' ')[1] || s)}</div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div style={{ marginBottom: 32 }}>
            <button className="btn btn-ai btn-full" onClick={generateNames} disabled={loading} style={{ padding: '16px', fontSize: '15px' }}>
              {loading ? (lang === 'en' ? '⏳ Loading...' : '⏳ جاري التحميل...') : (lang === 'en' ? '✦ Suggest Smart Names Based on My Choice' : '✦ اقتراح أسماء ذكية بناءً على اختياري')}
            </button>
          </div>

          {/* Results Grid */}
          {results.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div className="sub-selection-title">{lang === 'en' ? 'Suggested Results for You' : 'النتائج المقترحة لك'}</div>
              <div className="grid-2">
                {results.map((r, i) => (
                  <div key={i} className="card" style={{ marginBottom: 0, background: 'var(--bg3)', border: '1px solid var(--line2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{r.name}</div>
                      <div className={`badge badge-${BADGE_COLORS[r.style] || 'blue'}`}>{STYLE_LABELS[r.style] || r.styleAr || r.style}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>
                      {r.feeling && <div style={{ marginBottom: 4 }}>🎭 {lang === 'en' ? 'Feeling:' : 'الإحساس:'} <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.feeling}</span></div>}
                      {r.audience && <div style={{ marginBottom: 4 }}>👥 {lang === 'en' ? 'Audience:' : 'الجمهور:'} <span style={{ color: 'var(--text)' }}>{r.audience}</span></div>}
                      {r.suitableFor && <div>🏢 {lang === 'en' ? 'Suitable for:' : 'مناسب لـ:'} <span style={{ color: 'var(--text)' }}>{r.suitableFor}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Details Section */}
          <div className="bottom-sections">
            <div className="bottom-card">
              <div className="bottom-card-header">
                <div className="bottom-card-icon">👥</div>
                <div className="bottom-card-title">العميل المستهدف</div>
              </div>
              <ul className="bottom-list">
                <li>عشاق الفخامة والتميز الباحثين عن تجربة فريدة.</li>
                <li>الباحثون عن حلول ذكية تسهل حياتهم اليومية.</li>
                <li>الشباب المهتم بالتقنيات الحديثة والبراندات العصرية.</li>
                <li>العملاء الذين يقدرون الجودة والسرعة في الخدمة.</li>
              </ul>
            </div>
            <div className="bottom-card">
              <div className="bottom-card-header">
                <div className="bottom-card-icon" style={{ color: 'var(--red)' }}>⚠️</div>
                <div className="bottom-card-title">أهم المشاكل</div>
              </div>
              <ul className="bottom-list">
                <li>صعوبة العثور على براند يجمع بين الجودة والسعر المناسب.</li>
                <li>افتقار السوق لخدمات مخصصة تلبي احتياجات العميل بدقة.</li>
                <li>تعقيد إجراءات الطلب والتوصيل في المنافسين.</li>
                <li>غياب الثقة في العلامات التجارية الجديدة غير الواضحة.</li>
              </ul>
            </div>
          </div>

          {/* Navigation Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40, paddingBottom: 60 }}>
            <button className="btn btn-primary" onClick={proceed} style={{ padding: '12px 32px', fontSize: '14px' }}>
              {lang === 'en' ? 'Save & Proceed to Content →' : 'حفظ والانتقال للمحتوى ←'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

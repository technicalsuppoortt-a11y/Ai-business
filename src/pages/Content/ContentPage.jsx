import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { getHooks, getContentFrameworks } from '../../services/dataService';
import Topbar from '../../components/layout/Topbar';

const EMOTION_ICONS = { curiosity: '🔍', shock: '😱', authority: '👑', emotional: '💫', challenge: '🎯', luxury: '✨' };
const EMOTION_COLORS = { curiosity: 'blue', shock: 'red', authority: 'amber', emotional: 'pink', challenge: 'green', luxury: 'purple' };

export default function ContentPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const lang = state.language || 'ar';
  const [hooks, setHooks] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('hooks'); // hooks | frameworks

  const niche = state.niche || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [h, f] = await Promise.all([getHooks(niche), getContentFrameworks(niche)]);
        setHooks(h);
        setFrameworks(f);
      } catch (err) {
        console.error(err);
        toast(lang === 'en' ? 'Error loading data' : 'خطأ في التحميل', 'error');
      }
      setLoading(false);
    }
    load();
  }, [niche]);

  const generateHooks = useCallback(() => {
    let pool = [...hooks];
    if (selectedEmotion) pool = pool.filter(h => h.emotion === selectedEmotion);
    setResults(pool.sort(() => Math.random() - 0.5).slice(0, 6));
  }, [hooks, selectedEmotion]);

  const emotions = [...new Set(hooks.map(h => h.emotion))];

  const proceed = () => {
    dispatch({ type: 'COMPLETE_STEP', step: 'content' });
    toast(lang === 'en' ? 'Content ready! Let\'s build offers 💰' : 'المحتوى جاهز! لنبني العروض 💰', 'success');
    navigate('/dashboard/offers');
  };

  return (
    <>
      <Topbar title={lang === 'en' ? '✍️ Content' : '✍️ المحتوى'} subtitle={lang === 'en' ? 'Hooks + Content frameworks + Publishing strategies' : 'هوكات + أطر محتوى + استراتيجيات نشر'} />
      <div className="content-area view-enter">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <div className={`chip ${tab === 'hooks' ? 'active' : ''}`} onClick={() => setTab('hooks')}>🎣 {lang === 'en' ? 'Hooks' : 'هوكات'} ({hooks.length})</div>
          <div className={`chip ${tab === 'frameworks' ? 'active' : ''}`} onClick={() => setTab('frameworks')}>📐 {lang === 'en' ? 'Content Frameworks' : 'أطر المحتوى'} ({frameworks.length})</div>
        </div>

        {tab === 'hooks' && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{lang === 'en' ? 'Smart Hooks Generator' : 'مولّد الهوكات الذكي'}</div>
                <div className="card-sub">{hooks.length} {lang === 'en' ? 'hooks in the database — classified by emotions and platforms' : 'هوك في القاعدة — مصنفة بالمشاعر والمنصات'}</div>
              </div>
              <div className="badge badge-green">🔥 Firebase</div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              <div className={`chip ${!selectedEmotion ? 'active' : ''}`} onClick={() => setSelectedEmotion(null)}>🌐 {lang === 'en' ? 'All' : 'الكل'}</div>
              {emotions.map(e => (
                <div key={e} className={`chip ${selectedEmotion === e ? 'active' : ''}`} onClick={() => setSelectedEmotion(e)}>
                  {EMOTION_ICONS[e] || '📌'} {e}
                </div>
              ))}
            </div>

            <button className="btn btn-ai" onClick={generateHooks} disabled={loading} style={{ marginBottom: 16 }}>
              {loading ? '⏳ جاري التحميل...' : '✦ ولّد هوكات'}
            </button>

            {results.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.map((r, i) => (
                  <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.6 }}>{r.text}</div>
                      <div className={`badge badge-${EMOTION_COLORS[r.emotion] || 'blue'}`} style={{ flexShrink: 0, marginRight: 8 }}>
                        {EMOTION_ICONS[r.emotion]} {r.emotion}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text3)' }}>
                      <span>🎭 {r.tone}</span>
                      <span>📱 {r.platform}</span>
                      <span>🎯 {r.goal}</span>
                      <span>🔥 Viral: {r.viralScore}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'frameworks' && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{lang === 'en' ? 'Professional Content Frameworks' : 'أطر المحتوى الاحترافية'}</div>
                <div className="card-sub">{lang === 'en' ? 'Proven frameworks for creating content that delivers results' : 'أُطر مجربة لصناعة محتوى يحقق نتائج'}</div>
              </div>
            </div>
            {loading ? <div style={{ color: 'var(--text2)', padding: 20 }}>⏳ {lang === 'en' ? 'Loading...' : 'جاري التحميل...'}</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {frameworks.map((f, i) => (
                  <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>{f.name} — {f.nameAr}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{f.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
                      <strong style={{ color: 'var(--text2)' }}>{lang === 'en' ? 'Steps:' : 'الخطوات:'}</strong>
                      {(f.steps || []).map((s, j) => <div key={j} style={{ paddingRight: 8 }}>→ {s}</div>)}
                    </div>
                    {f.example && (
                      <div style={{ background: 'var(--bg2)', padding: '8px 12px', borderRadius: 8, fontSize: 11, color: 'var(--green)', marginTop: 6 }}>
                        💡 {lang === 'en' ? 'Example:' : 'مثال:'} {f.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-primary" onClick={proceed}>{lang === 'en' ? 'Proceed to Offers →' : 'الانتقال للعروض ←'}</button>
        </div>
      </div>
    </>
  );
}

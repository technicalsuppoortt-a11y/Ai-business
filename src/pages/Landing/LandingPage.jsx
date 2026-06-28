import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { landingTranslations } from './LandingTranslations';
import MadgicxTemplate from './MadgicxTemplate';
import './Landing.css';

const sanitizePhoneForWhatsapp = (phone) => {
  if (!phone) return '201066886844';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11 && clean.startsWith('01')) {
    return '20' + clean.slice(1);
  }
  if (clean.startsWith('00')) {
    return clean.slice(2);
  }
  return clean;
};

/** Normalize a URL to be completely protocol, www, and trailing slash agnostic */
const superNormalizeUrl = (url) => {
  if (!url) return '';
  let cleaned = url.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, ''); // remove http:// or https://
  cleaned = cleaned.replace(/^www\./, '');        // remove www.
  cleaned = cleaned.replace(/\/+$/, '');         // remove trailing slashes
  return cleaned;
};

/** Extract domain/hostname from a URL string, protocol and www agnostic */
const extractDomain = (url) => {
  if (!url) return '';
  try {
    let clean = url.trim().toLowerCase();
    if (!clean.includes('://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/:]+)/i);
    return match ? match[1].toLowerCase() : url.trim().toLowerCase();
  }
};


/** Generate all possible variations of a given raw URL for Firestore 'in' query matching */
const generateUrlCandidates = (raw) => {
  if (!raw) return [];
  const candidates = new Set();
  
  const clean = raw.trim().toLowerCase();
  const naked = clean.replace(/^https?:\/\//, '');
  const noWww = naked.replace(/^www\./, '');
  
  const bases = [naked, noWww, 'www.' + noWww];
  
  const versions = [];
  for (const base of bases) {
    if (!base) continue;
    const withoutSlash = base.replace(/\/+$/, '');
    const withSlash = withoutSlash + '/';
    versions.push(withoutSlash, withSlash);
  }
  
  for (const v of versions) {
    candidates.add(v);
    candidates.add('http://' + v);
    candidates.add('https://' + v);
  }
  
  // Try to extract host (domain only) candidates
  let host = '';
  try {
    host = new URL(clean.includes('://') ? clean : 'https://' + clean).host;
  } catch (e) {}
  
  if (host) {
    const cleanHost = host.toLowerCase().replace(/^www\./, '');
    const hostBases = [cleanHost, 'www.' + cleanHost];
    for (const hb of hostBases) {
      candidates.add(hb);
      candidates.add(hb + '/');
      candidates.add('http://' + hb);
      candidates.add('http://' + hb + '/');
      candidates.add('https://' + hb);
      candidates.add('https://' + hb + '/');
    }
  }
  
  return [...candidates].filter(Boolean);
};

export default function LandingPage() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();
  const toast = useToast();
  const t = landingTranslations[state.language || 'ar'] || landingTranslations.ar;

  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [brandError, setBrandError] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});
  const togglePlanExpand = (planId) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  // ─── STATE VARIABLES FOR INTERACTIVE WIDGETS ──────────────────────────────
  const [activeNiche, setActiveNiche] = useState('ecommerce');
  const [brandIdentityName, setBrandIdentityName] = useState('Glamour Deco');
  const [brandIdentityColors, setBrandIdentityColors] = useState(['#F43F5E', '#10B981', '#3B82F6', '#F59E0B']);
  
  const brandNamesPreset = ['Glamour Deco', 'FitPulse', 'AgriGrowth', 'LearnSphere', 'PetPalace', 'ByteShield', 'AromaArabia'];
  const colorPalettesPreset = [
    ['#F43F5E', '#10B981', '#3B82F6', '#F59E0B'],
    ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'],
    ['#10B981', '#06B6D4', '#6366F1', '#F59E0B'],
    ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6']
  ];
  
  const handleGenerateIdentity = () => {
    const randomName = brandNamesPreset[Math.floor(Math.random() * brandNamesPreset.length)];
    const randomPalette = colorPalettesPreset[Math.floor(Math.random() * colorPalettesPreset.length)];
    setBrandIdentityName(randomName);
    setBrandIdentityColors(randomPalette);
  };

  const [setupStep, setSetupStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSetupStep(s => (s + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Live Calculator State
  const [calcPrice, setCalcPrice] = useState(49); // Price per product
  const [calcAdSpend, setCalcAdSpend] = useState(15); // Ad Spend per purchase
  const [calcSalesCount, setCalcSalesCount] = useState(120); // Monthly Sales

  // Computed values
  const calcTotalRevenue = calcPrice * calcSalesCount;
  const calcTotalCosts = (calcAdSpend * calcSalesCount) + (calcPrice * 0.15 * calcSalesCount); // Ad spend + 15% Product Cost
  const calcNetProfit = calcTotalRevenue - calcTotalCosts;
  const calcRoas = (calcPrice / (calcAdSpend || 1)).toFixed(1);

  const [factoryCategory, setFactoryCategory] = useState('design');

  const [proposalStep, setProposalStep] = useState(0);
  const proposalTexts = state.language === 'en'
    ? [
        "Analyzing client requirements for the job...",
        "Client skills and price expectations successfully identified.",
        "A custom financial and technical proposal has been generated..."
      ]
    : [
        "جاري تحليل متطلبات العميل للوظيفة...",
        "تم تحديد مهارات العميل وتوقعات السعر بنجاح.",
        "تم توليد عرض مالي وفني مخصص يتناسب مع متجرك..."
      ];
  useEffect(() => {
    const interval = setInterval(() => {
      setProposalStep(s => (s + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: 'أهلاً بك! أنا مساعدك الذكي لتأسيس البراند. اختر أي استعلام أدناه لرؤية كيف أعمل بشكل فوري!' }
  ]);
  const [chatTyping, setChatTyping] = useState(false);

  useEffect(() => {
    setChatMessages([
      { 
        sender: 'assistant', 
        text: state.language === 'en' 
          ? 'Welcome! I am your smart brand assistant. Choose any query below to see how I work instantly!'
          : 'أهلاً بك! أنا مساعدك الذكي لتأسيس البراند. اختر أي استعلام أدناه لرؤية كيف أعمل بشكل فوري!' 
      }
    ]);
  }, [state.language]);

  const handleChatPreset = (queryText, responseText) => {
    if (chatTyping) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    setChatTyping(true);
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'assistant', text: responseText }]);
      setChatTyping(false);
    }, 1200);
  };

  useEffect(() => {
    const cleanSlug = brandSlug ? brandSlug.replace(/\/$/, '').split('/').pop() : '';
    let alreadyFetched = false; // guard against double invocation

    // ─── STEP 1: Detect parent page URL immediately ────────────────────────────
    // Method A: document.referrer — FULL URL with path (best for path-based matching)
    let immediateParentUrl = null;
    if (document.referrer) {
      immediateParentUrl = document.referrer.replace(/\/+$/, '');
    }

    // Method B: ancestorOrigins — Chrome/Edge only, gives origin only (no path)
    let ancestorOriginOnly = null;
    try {
      if (window.location.ancestorOrigins?.length > 0) {
        ancestorOriginOnly = window.location.ancestorOrigins[0];
      }
    } catch (e) {}

    // ─── fetchBrand — defined FIRST so it can be called from anywhere ─────────
    const fetchBrand = async (parentUrl) => {
      if (alreadyFetched) return;
      alreadyFetched = true;

      try {
        setLoading(true);
        let matchedDoc = null;

        // Parse search query parameters
        const searchParams = new URLSearchParams(location.search);
        
        // 1. Explicit Brand/Slug from path or query params
        const explicitSlug = cleanSlug || 
                             searchParams.get('brand') || 
                             searchParams.get('slug') || 
                             searchParams.get('b') || 
                             searchParams.get('brandSlug') || 
                             '';

        const slugCandidates = new Set();
        if (explicitSlug) {
          const cleanExp = explicitSlug.trim().replace(/\/$/, '').split('/').pop();
          if (cleanExp) {
            slugCandidates.add(cleanExp);
            slugCandidates.add(cleanExp.toLowerCase());
          }
        }

        // 2. Implicit URL sources
        const queryUrl = searchParams.get('url') || searchParams.get('site') || searchParams.get('domain');
        const currentUrl = window.location.href;
        const rawUrls = [queryUrl, currentUrl, parentUrl, ancestorOriginOnly].filter(Boolean);
        
        // Generate comprehensive spelling candidates for Firestore query
        const externalUrls = new Set();
        for (const raw of rawUrls) {
          generateUrlCandidates(raw).forEach(candidate => externalUrls.add(candidate));
        }

        console.debug('[LandingPage] explicitSlug detected:', explicitSlug);
        console.debug('[LandingPage] slugCandidates:', [...slugCandidates]);
        console.debug('[LandingPage] rawUrls detected:', rawUrls);
        console.debug('[LandingPage] externalUrls candidates:', [...externalUrls]);

        // ─── STAGE 1: URL/DOMAIN MATCHING (Highest Priority) ───
        if (externalUrls.size > 0) {
          console.debug('[LandingPage] 🎯 Running Stage 1: URL/Domain Matching...');
          const urlArr = [...externalUrls].filter(Boolean);
          const urlBatches = [];
          for (let i = 0; i < urlArr.length; i += 30) urlBatches.push(urlArr.slice(i, i + 30));

          let allCandidates = [];

          for (const batch of urlBatches) {
            const snapUrl = await getDocs(query(
              collection(db, 'users'),
              where('role', '==', 'admin'),
              where('brandUrl', 'in', batch)
            ));
            if (!snapUrl.empty) {
              allCandidates.push(...snapUrl.docs);
            }
          }

          if (allCandidates.length > 0) {
            const normalizedRaws = rawUrls.map(u => superNormalizeUrl(u)).filter(Boolean);
            
            // Intelligent ranking to solve cross-origin stripped referrers (e.g. upklick.co)
            const rankedDocs = [...allCandidates].sort((a, b) => {
              const aData = a.data();
              const bData = b.data();
              
              const aUrlNorm = superNormalizeUrl(aData.brandUrl);
              const bUrlNorm = superNormalizeUrl(bData.brandUrl);
              
              const aHasPlans = aData.plans && aData.plans.length > 0 ? 1 : 0;
              const bHasPlans = bData.plans && bData.plans.length > 0 ? 1 : 0;

              // Priority 1: Match with plans (highly likely to be the correct commercial tenant brand)
              if (aHasPlans !== bHasPlans) {
                return bHasPlans - aHasPlans; // prefer the one with plans
              }

              // Priority 2: More specific URL (longer URL, indicating it's a specific sub-path/brand page rather than a root domain)
              if (aUrlNorm.length !== bUrlNorm.length) {
                return bUrlNorm.length - aUrlNorm.length; // prefer longer, more specific URL
              }

              // Priority 3: Perfect exact normalized match with rawUrls
              let aExactIndex = -1;
              let bExactIndex = -1;
              for (let i = 0; i < normalizedRaws.length; i++) {
                if (aUrlNorm === normalizedRaws[i]) aExactIndex = i;
                if (bUrlNorm === normalizedRaws[i]) bExactIndex = i;
              }
              if (aExactIndex !== -1 && bExactIndex === -1) return -1;
              if (bExactIndex !== -1 && aExactIndex === -1) return 1;
              if (aExactIndex !== -1 && bExactIndex !== -1) return aExactIndex - bExactIndex;

              return 0;
            });

            matchedDoc = rankedDocs[0];
            console.debug('[LandingPage] ✅ matched by ranked brandUrl in Stage 1:', matchedDoc.data().brandUrl);
          }

          // B. Client-side fallback for Domain/URL Matching (in case domain matches but path differs or exact match failed)
          if (!matchedDoc) {
            console.debug('[LandingPage] 📡 Running Client-Side Fallback for Domain/URL Matching...');
            const allAdminsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
            if (!allAdminsSnap.empty) {
              const visitorDomains = rawUrls.map(url => extractDomain(url)).filter(Boolean);
              
              if (visitorDomains.length > 0) {
                for (const docSnap of allAdminsSnap.docs) {
                  const adminData = docSnap.data();
                  if (adminData.brandUrl) {
                    const adminDomain = extractDomain(adminData.brandUrl);
                    if (adminDomain && visitorDomains.includes(adminDomain)) {
                      matchedDoc = docSnap;
                      console.debug('[LandingPage] ✅ matched by domain in Client-Side fallback:', adminData.brandUrl);
                      break;
                    }
                  }
                }
              }
            }
          }
        }

        // ─── STAGE 2: EXPLICIT SLUG MATCHING (Fallback) ───
        if (!matchedDoc && slugCandidates.size > 0) {
          console.debug('[LandingPage] 📡 Running Stage 2: Explicit Slug Matching...');
          const targets = [...slugCandidates];
          
          // A. Firestore exact queries
          for (const target of targets) {
            let snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin'), where('brandUrl', '==', target)));
            if (snap.empty) snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin'), where('brandUrl', '==', `/${target}`)));
            if (snap.empty) snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin'), where('brandName', '==', target)));
            if (snap.empty) snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin'), where('ownerName', '==', target)));
            if (!snap.empty) {
              matchedDoc = snap.docs[0];
              console.debug('[LandingPage] ✅ matched by explicit slug in Firestore query:', target);
              break;
            }
          }

          // B. Client-side comparison matching the slug against trailing path components of Firestore brandUrl
          if (!matchedDoc) {
            console.debug('[LandingPage] 📡 Running Client-Side Fallback for Slug Matching...');
            const allAdminsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
            if (!allAdminsSnap.empty) {
              for (const docSnap of allAdminsSnap.docs) {
                const adminData = docSnap.data();
                
                // Extract slug/path from brandUrl
                let brandUrlSlug = '';
                if (adminData.brandUrl) {
                  try {
                    const cleanUrl = adminData.brandUrl.trim().toLowerCase();
                    const urlObj = new URL(cleanUrl.includes('://') ? cleanUrl : 'https://' + cleanUrl);
                    brandUrlSlug = urlObj.pathname.replace(/\/+$/, '').split('/').pop();
                  } catch (e) {
                    brandUrlSlug = adminData.brandUrl.replace(/\/+$/, '').split('/').pop();
                  }
                  brandUrlSlug = brandUrlSlug ? brandUrlSlug.trim().toLowerCase() : '';
                }

                const dbSlugNormalized = (superNormalizeUrl(adminData.brandName) || '').trim().toLowerCase();
                const dbOwnerNormalized = (superNormalizeUrl(adminData.ownerName) || '').trim().toLowerCase();

                const isSlugMatch = targets.some(target => {
                  const t = target.trim().toLowerCase();
                  return t && (
                    t === brandUrlSlug || 
                    t === dbSlugNormalized || 
                    t === dbOwnerNormalized
                  );
                });

                if (isSlugMatch) {
                  matchedDoc = docSnap;
                  console.debug('[LandingPage] ✅ matched by slug in Client-Side fallback:', adminData.brandName);
                  break;
                }
              }
            }
          }
        }

        if (matchedDoc) {
          const data = matchedDoc.data();
          setBrandData(data);
          if (data.plans && data.plans.length > 0) setPlans(data.plans);
          if (data.themeConfig) {
            const { accent, bg, sidebar } = data.themeConfig;
            if (accent) document.documentElement.style.setProperty('--accent', accent);
            if (bg) document.documentElement.style.setProperty('--green', data.themeConfig.success || '#10B981');
            if (bg) document.documentElement.style.setProperty('--bg', bg);
            if (sidebar) document.documentElement.style.setProperty('--bg2', sidebar);
          }
          
          if (data.brandName) {
            document.title = data.brandName;
          }
          if (data.defaultLanguage) {
            dispatch({ type: 'SET_LANGUAGE', payload: data.defaultLanguage });
          }
          const brandLogo = data.logoUrl || data.logo;
          if (brandLogo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = brandLogo;
          }
          
          setBrandError(null);
        } else {
          console.debug('[LandingPage] ⚠️ No matching brand found. Fallback disabled.');
          setBrandData(null);
          setPlans([]);
          setBrandError('لم يتم العثور على أي براند مطابق للرابط الحالي أو معرّف البراند.');
        }
      } catch (err) {
        console.error('[LandingPage] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    // ─── STEP 2: Try postMessage first (most reliable with companion script) ───
    let fetchTimeout = null;

    const handleMessage = (event) => {
      if (event.data?.type === 'PARENT_URL' && event.data?.url) {
        console.debug('[LandingPage] postMessage received:', event.data.url);
        clearTimeout(fetchTimeout);
        fetchBrand(event.data.url); // fetchBrand is already defined above ✅
      }
    };

    window.addEventListener('message', handleMessage);

    // Ask the parent frame for its URL
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'REQUEST_PARENT_URL' }, '*');
      }
    } catch (e) {}

    // Wait 800ms for postMessage, then fall back to referrer/ancestorOrigins
    fetchTimeout = setTimeout(() => {
      fetchBrand(immediateParentUrl); // will no-op if already fetched via postMessage
    }, 800);

    // ─── HARD FAILSAFE: Force hide loading after 6 seconds no matter what ──────
    // This prevents the loading overlay from blocking the page indefinitely
    const hardFailsafe = setTimeout(() => {
      setLoading(false);
    }, 6000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(fetchTimeout);
      clearTimeout(hardFailsafe);
    };
  }, [brandSlug, location.search]);


  const goAuth = () => navigate('/auth', { state: { resolvedBrand: brandData } });

  if (!loading && brandData?.landingTemplate === 'madgicx') {
    return <MadgicxTemplate brandData={brandData} plans={plans} goAuth={goAuth} state={state} t={t} />;
  }

  return (
    <div className="landing-page" dir={state.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--bg, #080C14)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.3s ease'
        }}>
          {/* Animated BG for loader */}
          <div className="lp-bg" style={{ opacity: 0.6 }}>
            <div className="lp-orb lp-orb1" />
            <div className="lp-orb lp-orb2" />
            <div className="lp-orb lp-orb3" />
            <div className="lp-grid" />
          </div>
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#fff' }}>
            <div className="ad-submit-spinner" style={{ margin: '0 auto 24px', width: '48px', height: '48px', borderWidth: '4px', borderTopColor: 'var(--accent, #3B82F6)' }} />
            <div style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '0.5px' }}>
              {state.language === 'en' ? 'Loading workspace...' : 'جاري تحميل مساحة العمل...'}
            </div>
          </div>
        </div>
      )}

      {/* Animated BG */}
      <div className="lp-bg">
        <div className="lp-orb lp-orb1" />
        <div className="lp-orb lp-orb2" />
        <div className="lp-orb lp-orb3" />
        <div className="lp-grid" />
      </div>

      {/* Nav */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            {(() => {
              const logoDisplayMode = brandData?.logoDisplayMode || state?.logoDisplayMode || 'both';
              const showLogo = (brandData?.logoUrl || brandData?.logo || brandData?.photoURL) && (logoDisplayMode === 'both' || logoDisplayMode === 'logo');
              const showText = logoDisplayMode === 'both' || logoDisplayMode === 'text';
              console.debug('[LandingPage] Display Settings:', { logoDisplayMode, showLogo, showText, brandData });
              return (
                <>
                  {showLogo && (
                    <img 
                      src={brandData.logoUrl || brandData.logo || brandData.photoURL} 
                      alt="Brand Logo" 
                      className="lp-logo-img" 
                      style={{ maxHeight: '38px', maxWidth: '160px', width: 'auto', objectFit: 'contain', borderRadius: '4px' }} 
                    />
                  )}
                  {!showLogo && !showText && (
                    <div className="lp-logo-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                  )}
                  {showText && (
                    <span>
                      {brandData?.brandName ? (
                        <strong>{brandData.brandName}</strong>
                      ) : (
                        <>AI Brand <strong>{t.nav.vision}</strong></>
                      )}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
          <div className="lp-nav-actions">
            <button 
              className="lp-lang-btn" 
              onClick={() => {
                const nextLang = state.language === 'ar' ? 'en' : 'ar';
                dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{state.language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            <button className="btn" onClick={goAuth}>{t.nav.login}</button>
            <button className="btn btn-primary" onClick={goAuth}>{t.nav.startFree}</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-badge">
          <span className="lp-badge-dot" />
          {t.hero.badge}
        </div>
        <h1 className="lp-hero-title">
          <span className="lp-title-line">{t.hero.title1}<span className="lp-highlight">{t.hero.titleHighlight}</span>{t.hero.title2}</span>
          <span className="lp-title-line lp-gradient-text">{t.hero.titleGradient}</span>
          <span className="lp-title-line">{t.hero.title3}</span>
        </h1>
        <p className="lp-hero-sub">
          {t.hero.subtitle.split('\n').map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < t.hero.subtitle.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
        <div className="lp-hero-actions">
          <button className="lp-cta-main" onClick={goAuth}>
            <span>{t.hero.cta}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d={state.language === 'ar' ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
            </svg>
          </button>
        </div>
        <div className="lp-hero-stats">
          <div className="lp-stat"><div className="lp-stat-num">{t.hero.stat1Num}</div><div className="lp-stat-lbl">{t.hero.stat1Label}</div></div>
          <div className="lp-stat-div" />
          <div className="lp-stat"><div className="lp-stat-num">{t.hero.stat2Num}</div><div className="lp-stat-lbl">{t.hero.stat2Label}</div></div>
          <div className="lp-stat-div" />
          <div className="lp-stat"><div className="lp-stat-num">{t.hero.stat3Num}</div><div className="lp-stat-lbl">{t.hero.stat3Label}</div></div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="lp-section lp-problem-sec">
        <div className="lp-section-inner">
          <div className="lp-section-tag lp-tag-red">{t.problem.tag}</div>
          <h2 className="lp-section-title">{t.problem.title}</h2>
          <div className="lp-problems-grid">
            {t.problem.cards.map((p, i) => (
              <div className="lp-problem-card" key={i}>
                <div className="lp-problem-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="lp-solution-arrow">
            <div className="lp-arrow-line" />
            <div className="lp-arrow-label">
              {t.problem.arrow.replace('AI Brand Vision', brandData?.brandName || 'AI Brand Vision')}
            </div>
            <div className="lp-arrow-line" />
          </div>
        </div>
      </section>

      {/* ─── 9 PREMIUM INTERACTIVE SHOWCASE SECTIONS ────────────────────────── */}
      
      {/* SECTION 1: رادار النيش الذكي */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section1.tag}</div>
              <h2 className="lp-section-title">{t.section1.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section1.desc}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
                  <span style={{ color: 'var(--accent)' }}>✦</span> {t.section1.bullet1}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
                  <span style={{ color: 'var(--accent)' }}>✦</span> {t.section1.bullet2}
                </li>
              </ul>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#fff', textAlign: state.language === 'ar' ? 'right' : 'left' }}>{t.section1.liveRadar}</div>
              <div className="niche-radar-options">
                {[
                  { id: 'ecommerce', label: t.section1.niches.ecommerce, score: '94%', demand: t.section1.veryHigh },
                  { id: 'saas', label: t.section1.niches.saas, score: '89%', demand: t.section1.high },
                  { id: 'fitness', label: t.section1.niches.fitness, score: '82%', demand: t.section1.medium }
                ].map(n => (
                  <div 
                    className={`niche-radar-item ${activeNiche === n.id ? 'active' : ''}`} 
                    key={n.id}
                    onClick={() => setActiveNiche(n.id)}
                    style={{ direction: state.language === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    <div className="niche-radar-badge" style={{
                      marginRight: state.language === 'ar' ? 'auto' : '0',
                      marginLeft: state.language === 'ar' ? '0' : 'auto'
                    }}>{n.score} {t.section1.success}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{n.label}</div>
                  </div>
                ))}
              </div>
              <div className="radar-stat-box">
                <div>
                  <div className="radar-stat-num">
                    {activeNiche === 'ecommerce' ? '12%' : activeNiche === 'saas' ? '8%' : '18%'}
                  </div>
                  <div className="radar-stat-lbl">{t.section1.compRate}</div>
                </div>
                <div style={{ width: 1, background: 'var(--line)' }} />
                <div>
                  <div className="radar-stat-num" style={{ color: 'var(--green)' }}>
                    {activeNiche === 'ecommerce' ? t.section1.veryHigh : activeNiche === 'saas' ? t.section1.high : t.section1.medium}
                  </div>
                  <div className="radar-stat-lbl">{t.section1.demandVol}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: استوديو الهوية البصرية والأسماء */}
      <section className="lp-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="lp-section-inner">
          <div className="tool-showcase-grid">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section2.tag}</div>
              <h2 className="lp-section-title">{t.section2.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section2.desc}
              </p>
              <button className="btn btn-secondary btn-sm" onClick={handleGenerateIdentity}>
                {t.section2.cta}
              </button>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)' }} />
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#fff', textAlign: state.language === 'ar' ? 'right' : 'left' }}>{t.section2.liveStudio}</div>
              <div className="brand-identity-mock">
                <div className="name-gen-stage">
                  <div className="brand-name-box">
                    {brandIdentityName}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>{t.section2.paletteTitle}</div>
                <div className="identity-color-row">
                  {brandIdentityColors.map((color, i) => (
                    <div className="identity-color-bubble" style={{ background: color }} key={i}>
                      <span className="identity-color-label">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: هندسة بناء المواقع */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section3.tag}</div>
              <h2 className="lp-section-title">{t.section3.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section3.desc}
              </p>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                {t.section3.note}
              </div>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#fff', textAlign: state.language === 'ar' ? 'right' : 'left' }}>{t.section3.liveStatus}</div>
              <div className="setup-builder-mock">
                {[
                  { label: t.section3.steps[0], idx: 0 },
                  { label: t.section3.steps[1], idx: 1 },
                  { label: t.section3.steps[2], idx: 2 }
                ].map(step => (
                  <div 
                    className={`setup-step-row ${setupStep === step.idx ? 'active' : ''}`} 
                    key={step.idx}
                    style={{ direction: state.language === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    <div className="setup-step-num">{step.idx + 1}</div>
                    <div className="setup-step-label">{step.label}</div>
                  </div>
                ))}
                <div className="setup-live-preview" style={{ textAlign: state.language === 'ar' ? 'right' : 'left' }}>
                  <div style={{ color: 'var(--accent)', fontWeight: 800, marginBottom: 4 }}>
                    {setupStep === 0 ? t.section3.statusHosting : setupStep === 1 ? t.section3.statusCss : t.section3.statusReady}
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: 10 }}>
                    {setupStep === 0 ? 'STATUS: RESOLVING DNS' : setupStep === 1 ? 'STATUS: INJECTING TAILORED STYLES' : 'STATUS: SYSTEM READY & ONLINE'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: الحاسبة التفاعلية للأرباح */}
      <section className="lp-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="lp-section-inner">
          <div className="tool-showcase-grid">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section4.tag}</div>
              <h2 className="lp-section-title">{t.section4.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section4.desc}
              </p>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', padding: '12px 18px', borderRadius: 12, color: 'var(--green)', fontSize: 13, fontWeight: 700 }}>
                {t.section4.note}
              </div>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)' }} />
              <div className="calc-widget">
                <div className="calc-metric-display">
                  <div className="calc-metric-val">${calcNetProfit.toLocaleString()}</div>
                  <div className="calc-metric-lbl">{t.section4.netProfit}</div>
                </div>
                <div className="calc-slider-group">
                  <div className="calc-slider-row">
                    <div className="calc-slider-header" style={{ direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="calc-slider-val">${calcPrice}</span>
                      <span>{t.section4.sellPrice}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      value={calcPrice} 
                      onChange={(e) => setCalcPrice(Number(e.target.value))} 
                      className="calc-input-slider"
                    />
                  </div>
                  <div className="calc-slider-row">
                    <div className="calc-slider-header" style={{ direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="calc-slider-val">${calcAdSpend}</span>
                      <span>{t.section4.adSpend}</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="50" 
                      value={calcAdSpend} 
                      onChange={(e) => setCalcAdSpend(Number(e.target.value))} 
                      className="calc-input-slider"
                    />
                  </div>
                  <div className="calc-slider-row">
                    <div className="calc-slider-header" style={{ direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="calc-slider-val">{calcSalesCount} {t.section4.salesLabel}</span>
                      <span>{t.section4.salesCount}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="1000" 
                      value={calcSalesCount} 
                      onChange={(e) => setCalcSalesCount(Number(e.target.value))} 
                      className="calc-input-slider"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, fontSize: 12, borderTop: '1px solid var(--line)', paddingTop: 14, flexDirection: state.language === 'ar' ? 'row' : 'row-reverse' }}>
                  <div>
                    <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{calcRoas}x</span>
                    <span style={{ color: 'var(--text3)', marginRight: state.language === 'ar' ? 6 : 0, marginLeft: state.language === 'ar' ? 0 : 6 }}>{t.section4.roas}</span>
                  </div>
                  <div>
                    <span style={{ color: '#fff', fontWeight: 800 }}>${calcTotalRevenue}</span>
                    <span style={{ color: 'var(--text3)', marginRight: state.language === 'ar' ? 6 : 0, marginLeft: state.language === 'ar' ? 0 : 6 }}>{t.section4.totalRevenue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: مصنع المحتوى الذكي */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section5.tag}</div>
              <h2 className="lp-section-title">{t.section5.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section5.desc}
              </p>
              <div className="factory-tabs">
                {['design', 'ads', 'writing'].map(cat => (
                  <button 
                    className={`factory-tab-btn ${factoryCategory === cat ? 'active' : ''}`} 
                    onClick={() => setFactoryCategory(cat)}
                    key={cat}
                  >
                    {t.section5.tabs[cat]}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div style={{ fontSize: 14, fontWeight: 700, fontStyle: 'normal', marginBottom: 16, color: '#fff', textAlign: state.language === 'ar' ? 'right' : 'left' }}>{t.section5.liveTemplates}</div>
              <div className="factory-preview-cards">
                {factoryCategory === 'design' ? (
                  <>
                    <div className="factory-mock-card" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="factory-mock-tag" style={{ alignSelf: state.language === 'ar' ? 'flex-start' : 'flex-end' }}>POST TEMPLATE</span>
                      <div style={{ color: '#fff', fontWeight: 700, margin: '8px 0' }}>
                        {state.language === 'en' ? 'Coaching & Fitness: How to Start Your Day with the Perfect Protein' : 'كوتشينج ورشاقة: كيف تبدأ يومك ببروتين مثالي'}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: 9 }}>
                        {state.language === 'en' ? 'Dimensions 1080x1080 · Ready to Download' : 'أبعاد 1080x1080 · جاهز للتنزيل'}
                      </div>
                    </div>
                    <div className="factory-mock-card" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="factory-mock-tag" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green)', alignSelf: state.language === 'ar' ? 'flex-start' : 'flex-end' }}>STORY</span>
                      <div style={{ color: '#fff', fontWeight: 700, margin: '8px 0' }}>
                        {state.language === 'en' ? "This Week's Loyal Customer Reviews" : 'تقييمات عملائنا الأوفياء لهذا الأسبوع'}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: 9 }}>
                        {state.language === 'en' ? 'Dimensions 1080x1920 · Ready to Download' : 'أبعاد 1080x1920 · جاهز للتنزيل'}
                      </div>
                    </div>
                  </>
                ) : factoryCategory === 'ads' ? (
                  <>
                    <div className="factory-mock-card" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="factory-mock-tag" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent2)', alignSelf: state.language === 'ar' ? 'flex-start' : 'flex-end' }}>Tiktok/Reels Hook</span>
                      <div style={{ color: '#fff', fontWeight: 700, margin: '8px 0' }}>
                        {state.language === 'en' ? '"3 Common Mistakes That Destroy Your Ad Budget!"' : '"3 أخطاء شائعة تدمر ميزانيتك الإعلانية!"'}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: 9 }}>
                        {state.language === 'en' ? 'Short Video Script Ideas' : 'أفكار سكريبت فيديو قصيرة'}
                      </div>
                    </div>
                    <div className="factory-mock-card" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="factory-mock-tag" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', alignSelf: state.language === 'ar' ? 'flex-start' : 'flex-end' }}>UGC Concept</span>
                      <div style={{ color: '#fff', fontWeight: 700, margin: '8px 0' }}>
                        {state.language === 'en' ? 'Genuine digital product review and how it changed our business' : 'ريفيو حقيقي لمنتج رقمي وكيف غير عملنا'}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: 9 }}>
                        {state.language === 'en' ? 'Original content shooting scenario' : 'سيناريو تصوير محتوى أصلي'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="factory-mock-card" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="factory-mock-tag" style={{ alignSelf: state.language === 'ar' ? 'flex-start' : 'flex-end' }}>Ad Copy</span>
                      <div style={{ color: '#fff', fontWeight: 700, margin: '8px 0' }}>
                        {state.language === 'en' ? '"Goodbye to random design. Get your visual identity with high efficiency..."' : '"وداعاً للتصميم العشوائي. احصل على هويتك البصرية بكفاءة عالية..."'}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: 9 }}>
                        {state.language === 'en' ? 'AIDA Marketing Formula' : 'صيغة AIDA التسويقية'}
                      </div>
                    </div>
                    <div className="factory-mock-card" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                      <span className="factory-mock-tag" style={{ alignSelf: state.language === 'ar' ? 'flex-start' : 'flex-end' }}>E-mail newsletter</span>
                      <div style={{ color: '#fff', fontWeight: 700, margin: '8px 0' }}>
                        {state.language === 'en' ? '"Your complete plan for digital transformation and establishing freelance work for 2026..."' : '"خطتك الكاملة للتحول الرقمي وتأسيس العمل الحر لعام 2026..."'}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: 9 }}>
                        {state.language === 'en' ? 'Interactive Newsletter Template' : 'قالب نشرة بريدية تفاعلية'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: قناص المقترحات */}
      <section className="lp-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="lp-section-inner">
          <div className="tool-showcase-grid">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section6.tag}</div>
              <h2 className="lp-section-title">{t.section6.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section6.desc}
              </p>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                {t.section6.note}
              </div>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)' }} />
              <div className="proposal-console-mock">
                <div className="proposal-console-header" style={{ flexDirection: state.language === 'ar' ? 'row' : 'row-reverse' }}>
                  <div className="console-dot" style={{ background: '#ef4444' }} />
                  <div className="console-dot" style={{ background: '#f59e0b' }} />
                  <div className="console-dot" style={{ background: '#10b981' }} />
                  <span style={{ 
                    marginRight: state.language === 'ar' ? 'auto' : '0', 
                    marginLeft: state.language === 'ar' ? '0' : 'auto',
                    color: 'var(--text3)', 
                    fontSize: 10 
                  }}>PROPOSAL_SNIPER_v2.0</span>
                </div>
                <div className="proposal-console-body" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                  {proposalTexts[proposalStep]}
                  <div style={{ marginTop: 14, color: 'var(--accent)', fontSize: 9, textAlign: 'left', direction: 'ltr' }}>
                    [SYSTEM_LOG]: Matching user skills against description... 100% OK
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: رادار منصات العمل الحر */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section7.tag}</div>
              <h2 className="lp-section-title">{t.section7.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section7.desc}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
                  <span style={{ color: 'var(--accent)' }}>✦</span> {t.section7.bullet1}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
                  <span style={{ color: 'var(--accent)' }}>✦</span> {t.section7.bullet2}
                </li>
              </ul>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#fff', textAlign: state.language === 'ar' ? 'right' : 'left' }}>{t.section7.liveRadar}</div>
              <div className="radar-platforms-mock">
                {[
                  { name: 'Upwork', fee: state.language === 'en' ? '10% commission' : '10% عمولة', active: state.language === 'en' ? 'Premium Global' : 'عالمي مميز' },
                  { name: 'Fiverr', fee: state.language === 'en' ? '20% commission' : '20% عمولة', active: state.language === 'en' ? 'Microservices' : 'خدمات مصغرة' },
                  { name: 'Mostaqel', fee: state.language === 'en' ? 'Full Arabic' : 'عربي كامل', active: state.language === 'en' ? 'Middle East' : 'الشرق الأوسط' },
                  { name: 'Khamsat', fee: state.language === 'en' ? '$5 per service' : '5 دولار للخدمة', active: state.language === 'en' ? 'Quick Services' : 'خدمات سريعة' }
                ].map(plat => (
                  <div className="radar-platform-card" key={plat.name} style={{ direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                    <div className="platform-logo-mock">🌐</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{plat.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{plat.fee} · {plat.active}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: محرك أتمتة التسويق */}
      <section className="lp-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="lp-section-inner">
          <div className="tool-showcase-grid">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section8.tag}</div>
              <h2 className="lp-section-title">{t.section8.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section8.desc}
              </p>
              <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', padding: '12px 18px', borderRadius: 12, color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>
                {t.section8.note}
              </div>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)' }} />
              <div className="flow-diagram-mock">
                {t.section8.steps.map((node, i) => (
                  <div className="flow-diagram-node" key={i} style={{ direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, justifyContent: 'center' }}>
                      {i + 1}
                    </div>
                    <div style={{ textAlign: state.language === 'ar' ? 'right' : 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{node.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{node.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: المساعد الشخصي الفوري */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="tool-showcase-grid alternate">
            <div className="tool-showcase-info" style={{ textAlign: state.language === 'ar' ? 'right' : 'left', direction: state.language === 'ar' ? 'rtl' : 'ltr' }}>
              <div className="lp-section-tag">{t.section9.tag}</div>
              <h2 className="lp-section-title">{t.section9.title}</h2>
              <p className="lp-hero-sub" style={{ margin: '0 0 24px 0' }}>
                {t.section9.desc}
              </p>
              <div className="chat-presets">
                {t.section9.presets.map((pr, index) => (
                  <button 
                    key={index}
                    className="chat-preset-btn"
                    onClick={() => handleChatPreset(pr.query, pr.response)}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="tool-interactive-stage">
              <div className="glow-overlay-orb" />
              <div className="chat-widget-mock">
                <div className="chat-window">
                  {chatMessages.map((msg, i) => (
                    <div 
                      className={`chat-bubble ${msg.sender}`} 
                      key={i}
                      style={{
                        alignSelf: msg.sender === 'user'
                          ? (state.language === 'ar' ? 'flex-start' : 'flex-end')
                          : (state.language === 'ar' ? 'flex-end' : 'flex-start'),
                        borderBottomLeftRadius: msg.sender === 'user' ? (state.language === 'ar' ? '2px' : '12px') : '12px',
                        borderBottomRightRadius: msg.sender === 'assistant' ? (state.language === 'ar' ? '2px' : '12px') : '12px',
                        textAlign: msg.sender === 'user' ? (state.language === 'ar' ? 'left' : 'right') : (state.language === 'ar' ? 'right' : 'left'),
                        direction: state.language === 'ar' ? 'rtl' : 'ltr'
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {chatTyping && (
                    <div className="chat-bubble assistant" style={{ 
                      fontStyle: 'italic', 
                      color: 'var(--text3)',
                      alignSelf: state.language === 'ar' ? 'flex-end' : 'flex-start',
                      textAlign: state.language === 'ar' ? 'right' : 'left',
                      direction: state.language === 'ar' ? 'rtl' : 'ltr'
                    }}>
                      {t.section9.typingMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="lp-section" id="pricing">
        <div className="lp-section-inner">
          <div className="lp-section-tag">{t.pricing.tag}</div>
          <h2 className="lp-section-title">{t.pricing.title}</h2>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: '40px' }}>
              <div className="ad-submit-spinner" style={{ margin: '0 auto 15px' }} />
              <div>{t.pricing.loading}</div>
            </div>
          ) : plans && plans.length > 0 ? (
            <div className="lp-pricing-grid">
              {plans.map((p, i) => {
                const displayName = state.language === 'en' ? (p.name_en || p.name) : (p.name_ar || p.name);
                const rawFeatures = state.language === 'en' ? (p.features_en || p.features) : (p.features_ar || p.features);
                
                return (
                  <div className="lp-pricing-card" key={p.id || i} style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 24,
                    padding: 40,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{displayName}</div>
                    <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--accent)', marginBottom: 8 }}>
                      {p.price} <span style={{ fontSize: 16, color: 'var(--text3)' }}>
                        {p.currency 
                          ? (p.currency === 'USD' ? '$' 
                             : p.currency === 'SAR' ? (state.language === 'en' ? 'SAR' : 'ر.س') 
                             : p.currency === 'AED' ? (state.language === 'en' ? 'AED' : 'د.إ') 
                             : p.currency === 'KWD' ? (state.language === 'en' ? 'KWD' : 'د.ك') 
                             : (state.language === 'en' ? 'EGP' : 'ج.م')) + (state.language === 'ar' ? ' / شهر' : ' / month')
                          : t.pricing.currency}
                      </span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', textAlign: state.language === 'ar' ? 'right' : 'left' }}>
                      {(() => {
                        const featuresList = Array.isArray(rawFeatures) ? rawFeatures : (typeof rawFeatures === 'string' ? rawFeatures.split('\n') : []);
                        const showExpandButton = featuresList.length > 4;
                        const isExpanded = !!expandedPlans[p.id || i];
                        const visibleFeatures = isExpanded ? featuresList : featuresList.slice(0, 4);
                        
                        const paddedFeatures = [...visibleFeatures];
                        if (!isExpanded && paddedFeatures.length < 4) {
                          while (paddedFeatures.length < 4) {
                            paddedFeatures.push({ isPlaceholder: true });
                          }
                        }

                        return (
                          <>
                            {paddedFeatures.map((f, idx) => {
                              if (f && f.isPlaceholder) {
                                  return (
                                    <li key={`placeholder-${idx}`} style={{ 
                                      fontSize: 14, 
                                      marginBottom: 12, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 10,
                                      visibility: 'hidden',
                                      userSelect: 'none'
                                    }}>
                                      <span style={{ 
                                        width: 20, 
                                        height: 20, 
                                        borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #10B981, #059669)',
                                        color: '#fff', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                      }}>
                                        ✓
                                      </span>
                                      Placeholder
                                    </li>
                                  );
                              }
                              return (
                                <li key={idx} style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ 
                                    width: 20, 
                                    height: 20, 
                                    borderRadius: '50%', 
                                    background: 'linear-gradient(135deg, #10B981, #059669)', 
                                    color: '#fff', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: 10,
                                    fontWeight: 'bold',
                                    flexShrink: 0,
                                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                                  }}>
                                    ✓
                                  </span>
                                  {f}
                                </li>
                              );
                            })}
                            
                            {showExpandButton && (
                              <button 
                                onClick={() => togglePlanExpand(p.id || i)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent)',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  padding: '4px 0',
                                  margin: state.language === 'ar' ? '8px 0 0 auto' : '8px auto 0 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                {isExpanded ? t.pricing.showLess : t.pricing.readMore}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </ul>
                    <a 
                      href={`https://wa.me/${sanitizePhoneForWhatsapp(brandData?.phoneNumber)}?text=${encodeURIComponent(`${state.language === 'en' ? t.pricing.waSubscribeMsg : 'أهلاً، أود الاشتراك في '}${displayName}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="lp-cta-main" 
                      style={{ width: '100%', fontSize: 16, padding: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <span>{t.pricing.subscribe}</span>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.886 9.886m8.415-18.3a11.311 11.311 0 00-8.415-3.483C5.307 0 0 5.303 0 11.819c0 2.083.541 4.117 1.57 5.923L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.505 0 11.81-5.304 11.813-11.82a11.32 11.32 0 00-3.483-8.42" />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: '40px' }}>
              {t.pricing.noPlans}
            </div>
          )}
        </div>
      </section>

      {/* CTA Final */}
      <section className="lp-cta-section">
        <div className="lp-cta-inner">
          <div className="lp-cta-orb" />
          <h2 className="lp-cta-title">{t.ctaFinal.title}</h2>
          <p className="lp-cta-sub">{t.ctaFinal.subtitle}</p>
          <button className="lp-cta-main" style={{ padding: '18px 48px', fontSize: 18 }} onClick={goAuth}>
            {t.ctaFinal.cta}
          </button>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 14 }}>{t.ctaFinal.bullets}</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner" style={{ flexDirection: state.language === 'ar' ? 'row-reverse' : 'row' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>{brandData?.brandName || "AI Brand Vision"}</span>
          <span style={{ 
            fontSize: 12, 
            color: 'var(--text3)', 
            marginRight: state.language === 'ar' ? 'auto' : '0',
            marginLeft: state.language === 'ar' ? '0' : 'auto'
          }}>{t.footer.copyright}</span>
          <button className="btn btn-sm" onClick={goAuth}>{t.footer.login}</button>
        </div>
      </footer>
      {/* Floating WhatsApp Button */}
      {brandData?.phoneNumber && (
        <>
          <style>{`
            @keyframes lp-whatsapp-pulse {
              0% {
                box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4), 0 0 0 0px rgba(37, 211, 102, 0.4);
              }
              70% {
                box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4), 0 0 0 12px rgba(37, 211, 102, 0);
              }
              100% {
                box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4), 0 0 0 0px rgba(37, 211, 102, 0);
              }
            }
            @media (max-width: 600px) {
              .floating-wa-btn {
                right: 16px !important;
                bottom: 16px !important;
                width: 52px !important;
                height: 52px !important;
              }
              .floating-wa-btn svg {
                width: 28px !important;
                height: 28px !important;
              }
            }
          `}</style>
          <a 
            href={`https://wa.me/${sanitizePhoneForWhatsapp(brandData.phoneNumber)}?text=${encodeURIComponent(t.whatsapp.waMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="floating-wa-btn"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '60px',
              height: '60px',
              backgroundColor: '#25D366',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
              zIndex: 99999,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              animation: 'lp-whatsapp-pulse 2s infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 211, 102, 0.4)';
            }}
          >
            <svg viewBox="0 0 24 24" width="34" height="34" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.886 9.886m8.415-18.3a11.311 11.311 0 00-8.415-3.483C5.307 0 0 5.303 0 11.819c0 2.083.541 4.117 1.57 5.923L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.505 0 11.81-5.304 11.813-11.82a11.32 11.32 0 00-3.483-8.42" />
            </svg>
          </a>
        </>
      )}
    </div>
  );
}

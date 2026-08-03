import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import VideoShowcaseSection from '../../components/common/VideoShowcaseSection';

export default function MadgicxTemplate({ brandData, plans, goAuth }) {
  const { state, dispatch } = useApp();
  const isArabic = state.language === 'ar';
  const toggleLanguage = () => {
    dispatch({ type: 'SET_LANGUAGE', payload: isArabic ? 'en' : 'ar' });
  };
  
  const displayPlans = plans && plans.length > 0 ? plans : [
    { name: 'Pro Complete', price: '45', features: 'Automation\nTargeting\nAnalytics\nAd Management', name_ar: 'الباقة الاحترافية', features_ar: 'أتمتة\nاستهداف\nتحليلات\nإدارة الإعلانات' }
  ];

  const [activeIndex, setActiveIndex] = useState(displayPlans.length > 0 ? displayPlans.length - 1 : 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const selectedPlan = displayPlans[activeIndex] || displayPlans[0];
  const selectedPlanName = isArabic ? selectedPlan?.name_ar || selectedPlan?.name : selectedPlan?.name;
  const rawFeats = isArabic ? selectedPlan?.features_ar || selectedPlan?.features : selectedPlan?.features;
  const featureList = Array.isArray(rawFeats) ? rawFeats : (typeof rawFeats === 'string' ? rawFeats.split('\n').filter(Boolean) : []);

  useEffect(() => {
    // Inject Madgicx Webflow CSS to achieve a 100% pixel-perfect match
    const link = document.createElement('link');
    link.href = "https://cdn.prod.website-files.com/614069317241cba124a0dd3b/css/madgicx-dev.webflow.shared.a512de211.min.css";
    link.rel = "stylesheet";
    link.id = "madgicx-webflow-css";
    document.head.appendChild(link);
    
    const style = document.createElement('style');
    style.id = "madgicx-inline-css";
    style.innerHTML = `
      .cat_component input:checked + span {
        background-color: var(--surface--brand-primary);
        color: #ffffff;
      }
      .plan-new_summary-list {
        list-style-image: url("https://global-uploads.webflow.com/614069317241cba124a0dd3b/618a836ad08b29407ee33220_check-nav.svg");
      }
      .plans_tab-link input:checked + span {
        background-color: #515FBC;
        color: #ffffff;
      }
      /* Prevent overall site background from changing if viewed in iframe */
      body { background-color: #07070F !important; }
      
      /* Fix scrolling issues and apply Cairo font */
      html, body, #root {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        height: auto !important;
        scroll-behavior: smooth !important;
      }
      .page-wrapper {
        overflow: visible !important;
        height: auto !important;
      }
      * {
        font-family: "Cairo", sans-serif !important;
      }
      
      /* Mobile Responsiveness Overrides */
      @media screen and (max-width: 991px) {
        .half-grid, .w-layout-grid {
          grid-template-columns: 1fr !important;
          gap: 32px !important;
        }
        .nav2_container {
          flex-direction: row !important;
          flex-wrap: wrap !important;
          padding: 16px !important;
          gap: 0px !important;
        }
        .nav2_brand {
          width: 100% !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
        .nav2_menuu {
          display: none !important;
          width: 100% !important;
          flex-direction: column !important;
          align-items: center !important;
          padding-top: 16px !important;
        }
        .nav2_menuu.mobile-open {
          display: flex !important;
        }
        .nav2_linkss {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 16px !important;
          width: 100% !important;
        }
        .nav2_mobile-buttons {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap: 12px !important;
          width: 100% !important;
          margin-top: 16px !important;
        }
        .hamburger-icon {
          display: flex !important;
        }
        .nav2_main-links {
          display: none !important;
        }
        .pricing-new-heading {
          font-size: 2.2rem !important;
          text-align: center !important;
        }
        .pricing-par {
          text-align: center !important;
        }
        .pricing_input {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
        }
        .form-label, select.form_input {
          text-align: center !important;
        }
        .plans-new_menu {
          justify-content: center !important;
        }
        .plan_title-wrap {
          justify-content: center !important;
        }
        .plan-new_summary-list {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
        }
        .plan_price {
          justify-content: center !important;
        }
        .logos_gird {
          display: flex !important;
          flex-wrap: wrap !important;
          justify-content: center !important;
          gap: 20px !important;
        }
        .logos_logo {
          height: 30px !important;
        }
        .tools-section-custom {
          padding: 30px 16px !important;
        }
        .tools-card {
          text-align: center !important;
        }
        .tools-icon-wrap {
          margin: 0 auto 24px auto !important;
        }
        .footer_grid {
          justify-content: center !important;
          text-align: center !important;
        }
        .footer_logo-img {
          margin: 0 auto !important;
        }
        .testimonials_item {
          text-align: center !important;
        }
        .testimonial_content {
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
        }
      }
      
      .hamburger-icon {
        display: none;
        cursor: pointer;
        padding: 8px;
        background: transparent;
        border: none;
        color: white;
      }
      .hamburger-icon svg {
        width: 32px;
        height: 32px;
      }
      
      .tools-section-custom {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        height: auto !important;
        min-height: 500px !important;
        position: relative !important;
        z-index: 999999 !important;
        margin-top: 50px !important;
        margin-bottom: 50px !important;
        background-color: #07070F !important;
      }
      
      /* Animated Logo Border */
      @keyframes logoGlow {
        0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.4); border-color: rgba(139, 92, 246, 0.4); }
        50% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); border-color: rgba(59, 130, 246, 1); }
        100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.4); border-color: rgba(139, 92, 246, 0.4); }
      }
      .animated-logo-border {
        border: 2px solid rgba(139, 92, 246, 0.5);
        border-radius: 8px;
        padding: 0px; /* Removed padding so it's perfectly tight */
        animation: logoGlow 3s infinite alternate ease-in-out;
        transition: transform 0.3s ease;
        background: transparent;
      }
      .animated-logo-border:hover {
        transform: scale(1.05);
      }
      .nav2_image {
        height: 38px !important;
        max-height: 38px !important;
        max-width: 160px !important;
        width: auto !important;
      }
      .footer_logo-img {
        height: 45px !important;
        max-height: 45px !important;
        max-width: 180px !important;
        width: auto !important;
      }
      .nav2_brand-link, .footer_logo {
        height: auto !important;
        max-height: none !important;
        display: flex !important;
        align-items: center !important;
      }
      .nav2_component, .nav2_padding, .nav2_container, .nav2_brand {
        height: auto !important;
        min-height: 65px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById('madgicx-webflow-css');
      if (el) el.remove();
      const st = document.getElementById('madgicx-inline-css');
      if (st) st.remove();
    }
  }, []);

  const whatsappNumber = brandData?.phoneNumber || '+201000000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;
  const logoUrl = brandData?.logoUrl || brandData?.logo || brandData?.photoURL || state?.logoUrl || state?.logo || state?.photoURL || null;
  const brandName = brandData?.brandName || state?.brandName || "Madgicx";
  const logoDisplayMode = brandData?.logoDisplayMode || state?.logoDisplayMode || 'both';
  const showLogo = logoUrl && (logoDisplayMode === 'both' || logoDisplayMode === 'logo');
  const showText = logoDisplayMode === 'both' || logoDisplayMode === 'text';

  console.debug('[MadgicxTemplate] Display Settings:', { logoDisplayMode, showLogo, showText, logoUrl, brandName });

  return (
    <div className="page-wrapper" dir="ltr">
      
      {/* NAVBAR */}
      <div className="nav2_component">
        <div className="nav2_padding w-nav" style={{ background: 'transparent' }}>
          <div className="nav2_container w-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nav2_brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="#" className="nav2_brand-link w-nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                {showLogo && <img src={logoUrl} loading="lazy" alt="Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} className="nav2_image animated-logo-border"/>}
                {showText && <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>{brandName}</span>}
              </a>
              <button className="hamburger-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? (
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            </div>
            <nav className={`nav2_menuu w-nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              <div className="nav2_linkss">
                <a href="#tools" onClick={() => setIsMobileMenuOpen(false)} className="nav2_link w-nav-link" style={{ textDecoration: 'none', color: '#fff' }}>{isArabic ? 'الأدوات' : 'Tools'}</a>
                <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="nav2_link w-nav-link" style={{ textDecoration: 'none', color: '#fff' }}>{isArabic ? 'أراء العملاء' : 'Testimonials'}</a>
                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="nav2_link w-nav-link" style={{ textDecoration: 'none', color: '#fff' }}>{isArabic ? 'الأسعار' : 'Pricing'}</a>
                
                <div className="nav2_mobile-buttons">
                  <button onClick={toggleLanguage} className="nav2_link w-nav-link" style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}>
                    {isArabic ? 'English' : 'عربي'}
                  </button>
                  <button onClick={goAuth} className="button is-100 w-button" style={{ border: 'none', cursor: 'pointer' }}>{isArabic ? 'جرب مجاناً' : 'Try for Free'}</button>
                  <button onClick={goAuth} className="nav2_link w-nav-link" style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}>{isArabic ? 'تسجيل الدخول' : 'Login'}</button>
                </div>
              </div>
            </nav>
            <div className="nav2_main-links">
              <button onClick={toggleLanguage} className="nav2_link w-nav-link" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isArabic ? 'English' : 'عربي'}
              </button>
              <button onClick={goAuth} className="nav2_link w-nav-link" style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>{isArabic ? 'تسجيل الدخول' : 'Login'}</button>
              <button onClick={goAuth} className="button w-button" style={{ cursor: 'pointer', border: 'none' }}>{isArabic ? 'جرب مجاناً' : 'Try for Free'}</button>
            </div>
          </div>
        </div>
      </div>

      <main className="main-wrapper">
        <section id="pricing" className="section_pricing-header">
          <div className="padding-global">
            <div className="container-large">
              <div className="z-index-1">
                <div className="padding-section-large">
                  <div className="w-layout-grid half-grid is-centered">
                    
                    {/* LEFT SIDE */}
                    <div id="w-node-d8c0be1b-d9d0-2376-8b53-68130474fc84-1280bc0f">
                      <h1 className="pricing-new-heading">{isArabic ? 'ابدأ مجاناً، اختر باقتك لاحقاً' : 'Start for Free, Choose Your Plan Later'}</h1>
                      <p className="pricing-par">
                        {isArabic 
                          ? `${brandName} توفر لك جميع الأدوات التي تحتاجها لتحقيق أفضل النتائج (ROAS). بدلاً من تقديم حلول متفرقة مثل منافسينا، لدينا كل شيء في مكان واحد.`
                          : `${brandName} is the first Ecom Ad Cloud, providing you with all the tools you need to drive kickass ROAS. Instead of offering point solutions like our 45+ competitors, we have everything in one place.`
                        }
                      </p>
                      <div className="pricing_input w-embed">
                        <label htmlFor="ad-spend-input" className="form-label" style={{ color: '#fff', marginBottom: '8px', display: 'block' }}>{isArabic ? 'ما هو استهلاكك الشهري؟ (USD)' : "What's your monthly ad spend (USD)?"}</label>
                        <select id="ad-spend-input" name="ad-spend" className="form_input max-width-full">
                          <option value="1000">{isArabic ? 'أقل من $1K' : 'Less than $1K'}</option>
                          <option value="2500">$1K - $2.5K</option>
                          <option value="5000">$2.5K - $5K</option>
                        </select>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div id="w-node-d8c0be1b-d9d0-2376-8b53-68130474fc8a-1280bc0f">
                      <div className="plans-new_nav w-form">
                        <form className="plans-new_menu" style={{ overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '8px' }}>
                          {displayPlans.map((plan, idx) => (
                            <label key={idx} className="cat_component is-pricing w-radio" style={{ margin: 0 }}>
                              <input 
                                type="radio" 
                                name="Interval" 
                                className="w-form-formradioinput display-none w-radio-input" 
                                checked={activeIndex === idx}
                                onChange={() => setActiveIndex(idx)}
                              />
                              <span className="cat_label w-form-label" style={{ padding: '8px 20px', cursor: 'pointer' }}>
                                {isArabic ? plan.name_ar || plan.name : plan.name}
                              </span>
                            </label>
                          ))}
                        </form>
                      </div>

                      <div id="best-value-plan" className="plan-new w-node-d8c0be1b-d9d0-2376-8b53-68130474fca1-1280bc0f">
                        <div className="plan_title-wrap">
                          <h2 className="plan_title is-white">{selectedPlanName}</h2>
                          <div className="plan_ai">with AI</div>
                        </div>
                        <p className="text-align-center">
                          {isArabic 
                            ? `الخطة المثالية إذا كنت ترغب في الاستمتاع بكل ما تقدمه ${brandName} والاستفادة من أحدث تقنيات الذكاء الاصطناعي في جميع المجالات:`
                            : `The ultimate plan if you wish to enjoy everything ${brandName} offers and leverage the most cutting-edge AI tech in all areas:`
                          }
                        </p>
                        
                        <ul role="list" className="plan-new_summary-list">
                          {featureList.map((f, i) => (
                            <li key={i} className="plan-new_sumary-list-item" style={{ color: '#d4d4d8' }}><div>{f}</div></li>
                          ))}
                        </ul>

                        <div className="plan_price is-white" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <div style={{ fontSize: '0.5em', fontWeight: 'bold' }}>
                            {selectedPlan?.currency 
                              ? (selectedPlan.currency === 'USD' ? '$' 
                                 : selectedPlan.currency === 'SAR' ? (isArabic ? 'ر.س' : 'SAR') 
                                 : selectedPlan.currency === 'AED' ? (isArabic ? 'د.إ' : 'AED') 
                                 : selectedPlan.currency === 'KWD' ? (isArabic ? 'د.ك' : 'KWD') 
                                 : (isArabic ? 'ج.م' : 'EGP'))
                              : (isArabic ? 'ج.م' : '$')}
                          </div>
                          <div>{selectedPlan?.price || 0}</div>
                          <div className="plan_price-small">{isArabic ? '/شهر' : '/mo'}</div>
                        </div>
                        
                        <button onClick={goAuth} className="button is-100 w-inline-block" style={{ cursor: 'pointer', border: 'none', width: '100%' }}>
                          <div className="button_text-wrap is-plans">
                            <div className="button_text is-first">{isArabic ? 'جرب مجاناً' : 'Try for free'}</div>
                            <div className="button_text is-second">{isArabic ? 'جرب مجاناً' : 'Start free trial'}</div>
                          </div>
                        </button>
                        
                        <div className="plan_no-credit">{isArabic ? 'جرب مجاناً 100% لمدة 7 أيام. يمكنك الإلغاء في أي وقت.' : 'Try 100% free for 7 days. Cancel Anytime'}</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-m_component">
            <div className="bg-m_wrap">
              <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/6734a960b6efdb04370a3b1f_bg-m.png" loading="eager" alt="" className="bg-m_image"/>
            </div>
          </div>
        </section>

        {/* LOGOS SECTION */}
        <div id="partners" className="padding-section-large padding-bottom" style={{ backgroundColor: '#07070F' }}>
          <div className="logos_component" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* TOOLS SECTION (Moved inside Logos section to guarantee visibility) */}
            <div id="tools" className="tools-section-custom" style={{ padding: '40px 24px', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '24px', background: 'rgba(0,0,0,0.5)', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                  <h2 style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '900', letterSpacing: '-0.5px' }}>
                    {isArabic ? 'كل أدوات الذكاء الاصطناعي في مكان واحد' : 'All the AI Tools You Need in One Place'}
                  </h2>
                  <p style={{ color: '#a1a1aa', fontSize: '16px', marginTop: '16px', maxWidth: '600px', margin: '16px auto 0', lineHeight: '1.6' }}>
                    {isArabic ? 'قم بإدارة كل شيء من صناعة المحتوى إلى إطلاق الإعلانات وتحليلها عبر منصة واحدة متكاملة.' : 'Manage everything from content creation to launching and analyzing ads on one unified platform.'}
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                  {/* Tool 1 */}
                  <div className="tools-card" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', textAlign: isArabic ? 'right' : 'left', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'}}>
                    <div className="tools-icon-wrap" style={{ width: '56px', height: '56px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', marginLeft: isArabic ? 'auto' : '0', marginRight: isArabic ? '0' : 'auto' }}>
                      <span style={{ fontSize: '24px' }}>✍️</span>
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>{isArabic ? 'مصنع المحتوى' : 'Content Factory'}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.7' }}>{isArabic ? 'قم بتوليد نصوص إعلانية وصور احترافية بضغطة زر باستخدام أقوى نماذج الذكاء الاصطناعي.' : 'Generate ad copy and professional images instantly using powerful AI models.'}</p>
                  </div>

                  {/* Tool 2 */}
                  <div className="tools-card" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', textAlign: isArabic ? 'right' : 'left', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'}}>
                    <div className="tools-icon-wrap" style={{ width: '56px', height: '56px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', marginLeft: isArabic ? 'auto' : '0', marginRight: isArabic ? '0' : 'auto' }}>
                      <span style={{ fontSize: '24px' }}>🚀</span>
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>{isArabic ? 'مُطلق الإعلانات' : 'Ads Launcher'}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.7' }}>{isArabic ? 'أطلق حملاتك الإعلانية على فيسبوك وإنستجرام مباشرة من المنصة دون الحاجة لمدير الإعلانات.' : 'Launch your Facebook and Instagram campaigns directly from the platform without Ads Manager.'}</p>
                  </div>

                  {/* Tool 3 */}
                  <div className="tools-card" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', textAlign: isArabic ? 'right' : 'left', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'}}>
                    <div className="tools-icon-wrap" style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', marginLeft: isArabic ? 'auto' : '0', marginRight: isArabic ? '0' : 'auto' }}>
                      <span style={{ fontSize: '24px' }}>📊</span>
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>{isArabic ? 'تحليلات الأداء الذكية' : 'Smart Analytics'}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.7' }}>{isArabic ? 'اكتشف الإعلانات الرابحة والخاسرة بدقة من خلال تقارير أداء فورية وتوصيات تحسين آلية.' : 'Discover winning and losing ads precisely with real-time performance reports and automated optimization recommendations.'}</p>
                  </div>

                  {/* Tool 4 */}
                  <div className="tools-card" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', textAlign: isArabic ? 'right' : 'left', transition: 'all 0.3s', cursor: 'default' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(236, 72, 153, 0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'}}>
                    <div className="tools-icon-wrap" style={{ width: '56px', height: '56px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', marginLeft: isArabic ? 'auto' : '0', marginRight: isArabic ? '0' : 'auto' }}>
                      <span style={{ fontSize: '24px' }}>🤖</span>
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>{isArabic ? 'المساعد الذكي' : 'AI Copilot'}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.7' }}>{isArabic ? 'دردش مع المساعد الذكي للحصول على خطط تسويقية، أفكار إعلانية، واستشارات مخصصة لمجالك.' : 'Chat with the AI Copilot to get marketing plans, ad ideas, and personalized consultations for your niche.'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="logos_meta">
              <div className="logos_cap-text">Business Partner</div>
            </div>
            <div className="logos_rows">
              <div className="logos_gird">
                <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/6734adc5bda90a923dc7e5dc_heights.svg" loading="lazy" alt="" height="40" className="logos_logo"/>
                <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/6734adc5f36c652826594eea_guess.svg" loading="lazy" alt="" height="40" className="logos_logo"/>
                <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/6734adc5a63af56e11ae1db4_nood.svg" loading="lazy" alt="" height="40" className="logos_logo"/>
                <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/6734adc520470c1825d92d7a_noah.svg" loading="lazy" alt="" className="logos_logo"/>
                <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/6734adc5da67ea2bf3c557fd_pedal.svg" loading="lazy" alt="" className="logos_logo"/>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="separator_component" style={{ backgroundColor: '#07070F' }}>
          <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/6734b2ee71ca549e23203fd0_separator.avif" loading="eager" alt="" className="separator_img is-desktop"/>
        </div>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="section_testimonials" style={{ backgroundColor: '#07070F', color: '#fff' }}>
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-large padding-top">
                <h2 className="text-align-center" style={{ color: '#fff' }}>{isArabic ? 'انضم إلى أكثر من 200,000 مُعلن ناجح' : 'Join 200,000+ successful advertisers'}</h2>
                <div className="margin-top margin-small">
                  <p className="text-size-large text-align-center" style={{ color: '#a1a1aa' }}>{isArabic ? `شاهد ما يقوله المعلنون حول العالم عن ${brandName}.` : `See what advertisers worldwide say about ${brandName}.`}</p>
                </div>
                
                <div className="margin-top margin-medium">
                  <div className="testimonials_component w-dyn-list">
                    <div role="list" className="testimonials_list w-dyn-items" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      
                      <div role="listitem" className="testimonials_item w-dyn-item" style={{ background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="testimonial_txt w-richtext">
                          <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>{isArabic ? "أدوات الذكاء الاصطناعي في المنصة غيرت طريقة عملي تماماً. بفضل 'مصنع المحتوى' و'المساعد الذكي'، أصبحت أُطلق إعلانات احترافية في دقائق بدلاً من ساعات." : "\"The AI tools changed my entire workflow. Thanks to the 'Content Factory' and 'AI Copilot', I now launch professional ads in minutes instead of hours.\""}</p>
                        </div>
                        <div className="testimonial_content">
                          <img alt="" loading="lazy" src="https://cdn.prod.website-files.com/614b3e8cafbd9789234c277e/62d81b47c21bdfba58064b45_Klaus%20Schmitt%201%20(2)%20(1)%20(1)%20(1).avif" className="testimonial_avatar"/>
                          <div className="testimonial_text-wrrap">
                            <div className="testimonials_name" style={{ color: '#fff' }}>Klaus Schmitt</div>
                            <div className="testimonials_position">CEO of upjers.com</div>
                            <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/622737da5c43e205d92da4f9_stars-testimonial.svg" loading="lazy" alt="" className="testimonials_stars"/>
                          </div>
                        </div>
                      </div>

                      <div role="listitem" className="testimonials_item w-dyn-item" style={{ background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="testimonial_txt w-richtext">
                          <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>{isArabic ? "تحليلات الأداء الذكية ومُطلق الإعلانات وفّرت علي الكثير من الجهد والمال. حققت زيادة في المبيعات بنسبة 300% في الشهر الأول بفضل تحسينات الذكاء الاصطناعي التلقائية!" : "\"Smart Analytics and the Ads Launcher saved me so much time and money. I achieved a 300% increase in sales in month 1 thanks to the automated AI optimizations!\""}</p>
                        </div>
                        <div className="testimonial_content">
                          <img alt="" loading="lazy" src="https://cdn.prod.website-files.com/614b3e8cafbd9789234c277e/6242cb3e65cbd9f49d62f70e_Peter.avif" className="testimonial_avatar"/>
                          <div className="testimonial_text-wrrap">
                            <div className="testimonials_name" style={{ color: '#fff' }}>Peter Murphy Lewis</div>
                            <div className="testimonials_position">CSO</div>
                            <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/622737da5c43e205d92da4f9_stars-testimonial.svg" loading="lazy" alt="" className="testimonials_stars"/>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VIDEO SHOWCASE SECTION */}
        <VideoShowcaseSection isArabic={isArabic} />

        {/* CTA */}
        <section className="section_cta" style={{ backgroundColor: '#07070F' }}>
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-new-cta">
                <div className="z-index-1">
                  <div className="text-block_component">
                    <div className="text-block_text">
                      <div className="max-width-large">
                        <h2 className="text-align-center" style={{ color: '#fff' }}>{isArabic ? 'قم بتجربة المنصة اليوم' : 'You scrolled so far. You want this. Trust us.'}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="spacer-large"></div>
                  <div className="buttons_component" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="animated-button">
                      <button onClick={goAuth} className="button w-button" style={{ cursor: 'pointer', border: 'none' }}>{isArabic ? 'جرب مجاناً' : 'Try for Free ($0 Trial)'}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer_component" style={{ backgroundColor: '#07070F' }}>
        <div className="footer_separator">
          <img src="https://cdn.prod.website-files.com/614069317241cba124a0dd3b/6734b2ee71ca549e23203fd0_separator.avif" loading="eager" className="footer_separator-img" alt=""/>
        </div>
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-large">
              <div className="footer_grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div className="footer_top" style={{ flex: 'none', width: 'auto' }}>
                  <a href="#" className="footer_logo w-inline-block" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    {showLogo && <img src={logoUrl} loading="lazy" width="117" alt="Logo" className="footer_logo-img" style={{ objectFit: 'contain', height: '45px', width: 'auto' }}/>}
                    {showText && <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>{brandName}</span>}
                  </a>
                </div>
                <div style={{ color: '#71717a' }}>
                   © {new Date().getFullYear()} {brandName}. {isArabic ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <a href={brandData?.socialLinks?.facebook || "https://facebook.com"} target="_blank" rel="noreferrer" style={{ color: "#71717a", transition: "color 0.2s", display: "flex", alignItems: "center" }} onMouseOver={(e) => e.currentTarget.style.color = "#1877F2"} onMouseOut={(e) => e.currentTarget.style.color = "#71717a"}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href={brandData?.socialLinks?.instagram || "https://instagram.com"} target="_blank" rel="noreferrer" style={{ color: "#71717a", transition: "color 0.2s", display: "flex", alignItems: "center" }} onMouseOver={(e) => e.currentTarget.style.color = "#E1306C"} onMouseOut={(e) => e.currentTarget.style.color = "#71717a"}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href={brandData?.socialLinks?.twitter || "https://twitter.com"} target="_blank" rel="noreferrer" style={{ color: "#71717a", transition: "color 0.2s", display: "flex", alignItems: "center" }} onMouseOver={(e) => e.currentTarget.style.color = "#1DA1F2"} onMouseOut={(e) => e.currentTarget.style.color = "#71717a"}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </a>
                  <a href={brandData?.socialLinks?.linkedin || "https://linkedin.com"} target="_blank" rel="noreferrer" style={{ color: "#71717a", transition: "color 0.2s", display: "flex", alignItems: "center" }} onMouseOver={(e) => e.currentTarget.style.color = "#0A66C2"} onMouseOut={(e) => e.currentTarget.style.color = "#71717a"}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href={brandData?.socialLinks?.tiktok || "https://tiktok.com"} target="_blank" rel="noreferrer" style={{ color: "#71717a", transition: "color 0.2s", display: "flex", alignItems: "center" }} onMouseOver={(e) => e.currentTarget.style.color = "#00F2FE"} onMouseOut={(e) => e.currentTarget.style.color = "#71717a"}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#25D366',
          color: 'white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          zIndex: 9999,
          textDecoration: 'none',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}

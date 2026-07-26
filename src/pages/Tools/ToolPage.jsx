import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TOOLS_CONTENT } from '../../data/toolsData';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import './ToolPage.css';

import NicheSelection from './components/NicheSelection';
import BrandNaming from './components/BrandNaming';
import VisualIdentity from './components/VisualIdentity';
import AnalysisIdentity from './components/AnalysisIdentity';
import WebsiteConstruction from './components/WebsiteConstruction';
import LandingPageContent from './components/LandingPageContent';
import LegalPages from './components/LegalPages';
import StandardTool from './components/StandardTool';
import EmailSetup from './components/EmailSetup';
import SocialIntegration from './components/SocialIntegration';
import SocialPresence from './components/SocialPresence';

import ProductSource from './components/ProductSource';
import ProfitCalculator from './components/ProfitCalculator';
import ContentFactory from './components/ContentFactory';
import MarketingPlan from './components/MarketingPlan';
import AdCreative from './components/AdCreative';
import CampaignLaunch from './components/CampaignLaunch';
import PlatformRadar from './components/PlatformRadar';
import FreelancePricing from './components/FreelancePricing';
import SkillsCrafter from './components/SkillsCrafter';
import PortfolioBuilder from './components/PortfolioBuilder';
import ProposalSniper from './components/ProposalSniper';
import InterviewPrep from './components/InterviewPrep';
import SalesTemplates from './components/SalesTemplates';
import FreelanceProfile from './components/FreelanceProfile';
import SmartAIAssistant from './components/SmartAIAssistant';
import BrandLibrary from './components/BrandLibrary';
import SmartNotebook from './components/SmartNotebook';
import ExternalTools from './components/ExternalTools';
import PaymentModal from './components/PaymentModal';

export default function ToolPage() {
  const { toolId } = useParams();
  const { state, dispatch } = useApp();
  const { userData, brandData } = useAuth();
  const lang = state.language || 'ar';
  const [content, setContent] = useState(null);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminBrandName, setAdminBrandName] = useState('');
  const [adminUid, setAdminUid] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Normalize toolId to handle spaces or typos (e.g., 'brand naming' -> 'brand-naming')
  const normalizedId = toolId?.trim().replace(/\s+/g, '-');

  useEffect(() => {
    if (normalizedId && TOOLS_CONTENT[normalizedId]) {
      setContent(TOOLS_CONTENT[normalizedId]);
    }
  }, [normalizedId]);

  useEffect(() => {
    if (!userData?.brandName) return;
    setAdminBrandName(userData.brandName);

    const fetchAdminPhone = async () => {
      try {
        let currentAdminUid = brandData?.adminUid;
        if (!currentAdminUid && userData.createdBy) {
          currentAdminUid = userData.createdBy;
        }

        if (currentAdminUid) {
          setAdminUid(currentAdminUid);
          const { doc, getDoc } = await import('firebase/firestore');
          const adminDoc = await getDoc(doc(db, 'users', currentAdminUid));
          if (adminDoc.exists()) {
            setAdminPhone(adminDoc.data().phoneNumber || '');
            return;
          }
        }

        // Fallback
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const q = query(collection(db, 'users'), where('role', '==', 'admin'), where('brandName', '==', userData.brandName));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAdminUid(snap.docs[0].id);
          setAdminPhone(snap.docs[0].data().phoneNumber || '');
        }
      } catch (err) {
        console.error('Error fetching admin phone:', err);
      }
    };

    fetchAdminPhone();
  }, [userData, brandData]);

  const isTrial = userData?.subscription?.type === 'trial';
  const allowedTools = brandData?.freeTrialSettings?.allowedTools || [];
  const isLocked = isTrial && normalizedId !== 'onboarding' && (
    normalizedId === 'analysis-identity'
      ? !allowedTools.includes('analysis-identity') && !allowedTools.includes('niche-selection') && !allowedTools.includes('brand-naming') && !allowedTools.includes('visual-identity')
      : !allowedTools.includes(normalizedId)
  );

  if (isLocked) {
    return (
      <div className="lock-screen-wrapper">
        <div className="lock-screen-card animate-slide-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="lock-icon-container">
            🔒
          </div>
          <h2 className="lock-title">
            {lang === 'ar' ? 'هذه الأداة مقفلة في الفترة المجانية' : 'This Tool is Locked During the Free Trial'}
          </h2>
          <p className="lock-subtitle">
            {lang === 'ar'
              ? 'تفضل بتفعيل اشتراكك الكامل للوصول إلى كافة الأدوات المتطورة والحصرية والبدء في تنمية أعمالك!'
              : 'Activate your full subscription to access premium features, all professional tools, and start scaling your business!'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
            {adminPhone && (
              <a
                href={`https://wa.me/${adminPhone.replace(/\+/g, '').trim()}?text=${encodeURIComponent(
                  lang === 'ar'
                    ? `مرحباً، أريد تفعيل اشتراكي بالكامل في منصة ${adminBrandName}`
                    : `Hello, I want to activate my full subscription in ${adminBrandName} platform`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-lock-btn"
              >
                <span>💬</span>
                {lang === 'ar' ? 'الاشتراك عن طريق الواتساب' : 'Subscribe via WhatsApp'}
              </a>
            )}
            
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', borderRadius: '12px' }}
            >
              <span>💳</span>
              {lang === 'ar' ? 'الدفع والاشتراك (المحافظ الإلكترونية)' : 'Pay and Subscribe (E-Wallets)'}
            </button>
          </div>
        </div>

        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          paymentMethods={brandData?.paymentMethods || {}}
          plans={brandData?.plans || []}
          userData={userData}
          adminUid={adminUid}
          adminBrandName={adminBrandName}
          lang={lang}
        />
      </div>
    );
  }

  if (!content) return <div className="tool-not-found">{lang === 'en' ? 'Tool not found:' : 'الأداة غير موجودة:'} {toolId}</div>;

  // Exact Components Mapping (From tools.html)
  const toolComponents = {
    'analysis-identity': <AnalysisIdentity />,
    'niche-selection': <NicheSelection stepNumber={1} />,
    'brand-naming': <AnalysisIdentity />,
    'visual-identity': <AnalysisIdentity />,
    'website-construction': <WebsiteConstruction stepNumber={5} />,
    'landing-page-content': <LandingPageContent stepNumber={6} />,
    'legal-pages': <LegalPages stepNumber={7} />,
    'social-integration': <SocialIntegration stepNumber={10} />,
    'email-setup': <EmailSetup stepNumber={11} />,
    'product-source': <ProductSource stepNumber={12} />,
    'profit-calculator': <ProfitCalculator stepNumber={14} />,
    'social-presence': <SocialPresence stepNumber={15} />,
    'content-factory': <ContentFactory stepNumber={16} />,

    'marketing-plan': <MarketingPlan stepNumber={20} />,
    'ad-creative': <AdCreative stepNumber={21} />,
    'campaign-launch': <CampaignLaunch stepNumber={22} />,
    'smart-ai-assistant': <SmartAIAssistant stepNumber={23} />,
    'freelance-profile': <FreelanceProfile stepNumber={24} />,
    'platform-radar': <PlatformRadar stepNumber={25} />,
    'freelance-pricing': <FreelancePricing stepNumber={26} />,
    'skills-crafting': <SkillsCrafter stepNumber={27} />,
    'portfolio-builder': <PortfolioBuilder stepNumber={28} />,
    'proposal-sniper': <ProposalSniper stepNumber={29} />,
    'interview-prep': <InterviewPrep stepNumber={30} />,
    'sales-templates': <SalesTemplates stepNumber={31} />,
    'brand-library': <BrandLibrary />,
    'smart-notebook': <SmartNotebook />,
    'external-tools': <ExternalTools />,
  };

  const currentComponent = toolComponents[normalizedId];

  // Resolve bilingual title/description
  const title = lang === 'en' ? (content.title_en || content.title_ar) : (content.title_ar || content.title);
  const description = lang === 'en' ? (content.description_en || content.description_ar) : (content.description_ar || content.description);
  const steps = lang === 'en' ? (content.steps_en || content.steps) : (content.steps_ar || content.steps);

  return (
    <div className="tool-page-container animate-fade-in">
      {currentComponent ? (
        currentComponent
      ) : (
        <div className="tool-main-card">
          <div className="tool-header">
            <div className="tool-title-group">
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          </div>
          {content.video && (
            <div className="tool-video-wrapper">
              <iframe src={content.video} title={title} allowFullScreen></iframe>
            </div>
          )}
          {steps && (
            <div className="tool-steps-list">
              {steps.map((step, index) => (
                <label key={index} className="tool-step-item">
                  <input type="checkbox" />
                  <span>{step}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

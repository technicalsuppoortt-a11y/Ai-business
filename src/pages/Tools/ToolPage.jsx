import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TOOLS_CONTENT } from '../../data/toolsData';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
import SocialMedia from './components/SocialMedia';

import ProductSource from './components/ProductSource';
import ProfitCalculator from './components/ProfitCalculator';
import ContentFactory from './components/ContentFactory';
import MarketingPlan from './components/MarketingPlan';
import AdCreative from './components/AdCreative';
import CampaignLaunch from './components/CampaignLaunch';
import SmartAIAssistant from './components/SmartAIAssistant';
import BrandLibrary from './components/BrandLibrary';
import SmartNotebook from './components/SmartNotebook';
import ExternalTools from './components/ExternalTools';
import PaymentModal from './components/PaymentModal';

export default function ToolPage() {
  const { toolId } = useParams();
  const { state, dispatch } = useApp();
  const { userData, brandData } = useAuth();
  const toast = useToast();
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

  // ── UNIVERSAL PERMISSION GUARD ──────────────────────────────────────────────
  // STRICT SEPARATION: Trial Users vs Paid Plan Users
  const resolveAllowedTools = () => {
    const rootPlanId = userData?.planId;
    const subPlanId = userData?.subscription?.planId;
    
    const isValidId = (id) => id && id !== "free_trial" && id !== "trial" && id !== "free";
    
    const hasValidPaidPlan = 
      isValidId(rootPlanId) || 
      isValidId(subPlanId) || 
      (userData?.subscription?.status === 'active' && userData?.subscription?.type !== 'trial');
    
    // User is ONLY trial if they don't have a valid paid plan AND their sub/plan indicates trial
    const isTrial = !hasValidPaidPlan && (
      userData?.subscription?.type === "trial" ||
      !rootPlanId ||
      rootPlanId === "free_trial" ||
      rootPlanId === "trial" ||
      rootPlanId === "free" ||
      userData?.isTrial === true
    );

    const activePlanId = isValidId(rootPlanId) ? rootPlanId : (isValidId(subPlanId) ? subPlanId : null);

    console.log("[Auth/Permissions - ToolPage] Active Plan ID:", activePlanId, "| Computed isTrial:", isTrial);
    
    if (isTrial) {
      // 1. FREE TRIAL LOGIC (Strictly for Trial Users)
      // Read from LIVE brandData root first to avoid stale user cache
      const trialTools =
        brandData?.freeTrialSettings?.allowedTools ||
        userData?.freeTrialSettings?.allowedTools;
      
      if (Array.isArray(trialTools)) return trialTools;
    } else {
      // 2. PAID PLAN LOGIC (Strictly for Paid/Lifetime Users)
      // Live lookup against brandData FIRST for instant plan updates
      if (activePlanId && Array.isArray(brandData?.plans)) {
        const matchedPlan = brandData.plans.find(
          (p) => String(p.id) === String(activePlanId)
        );
        if (matchedPlan && Array.isArray(matchedPlan.allowedTools)) {
          return matchedPlan.allowedTools;
        }
      }
      // Fallback to snapshot on user doc
      if (Array.isArray(userData?.allowedTools)) {
        return userData.allowedTools;
      }
      // Read from embedded subscription snapshot
      if (Array.isArray(userData?.subscription?.allowedTools)) {
        return userData.subscription.allowedTools;
      }
    }
    return null; // null = no restrictions defined
  };

  const resolvedAllowedTools = resolveAllowedTools();
  
  // Strict Lock Enforcement: If not explicitly allowed, it MUST be locked.
  const isAllowed = Array.isArray(resolvedAllowedTools) && resolvedAllowedTools.includes(normalizedId);
  const isLocked = !isAllowed;

  console.log('[ToolPage] toolId:', normalizedId, '| resolvedAllowedTools:', resolvedAllowedTools, '| isLocked:', isLocked);

  useEffect(() => {
    if (isLocked) {
      toast(
        lang === 'en'
          ? "🔒 This tool is not included in your current plan. Please upgrade!"
          : "🔒 هذه الأداة غير متاحة في باقتك الحالية. يرجى ترقية الباقة!",
        "error"
      );
    }
  }, [isLocked, lang, toast]);

  if (isLocked) {
    return <Navigate to="/dashboard/subscription" replace />;
  }


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
    'social-presence': <SocialMedia stepNumber={15} />,
    'content-factory': <SocialMedia stepNumber={16} />,
    'social-media': <SocialMedia stepNumber={15} />,

    'marketing-plan': <MarketingPlan stepNumber={20} />,
    'ad-creative': <AdCreative stepNumber={21} />,
    'campaign-launch': <CampaignLaunch stepNumber={22} />,
    'smart-ai-assistant': <SmartAIAssistant stepNumber={23} />,

    'brand-library': <BrandLibrary />,
    'smart-notebook': <SmartNotebook />,
    'external-tools': <ExternalTools />,
  };

  const currentComponent = toolComponents[normalizedId];

  if (!content && !currentComponent) return <div className="tool-not-found">{lang === 'en' ? 'Tool not found:' : 'الأداة غير موجودة:'} {toolId}</div>;

  // Resolve bilingual title/description
  const title = content ? (lang === 'en' ? (content.title_en || content.title_ar) : (content.title_ar || content.title)) : '';
  const description = content ? (lang === 'en' ? (content.description_en || content.description_ar) : (content.description_ar || content.description)) : '';
  const steps = content ? (lang === 'en' ? (content.steps_en || content.steps) : (content.steps_ar || content.steps)) : null;

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

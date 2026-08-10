import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import PlatformExplanation from '../../components/common/PlatformExplanation';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function TutorialPage() {
  const { state } = useApp();
  const { userData, brandData } = useAuth();
  const toast = useToast();
  const lang = state.language || 'ar';

  // ── UNIVERSAL PERMISSION GUARD ──────────────────────────────────────────────
  const resolveAllowedTools = () => {
    const rootPlanId = userData?.planId;
    const subPlanId = userData?.subscription?.planId;
    
    const isValidId = (id) => id && id !== "free_trial" && id !== "trial" && id !== "free";
    
    const hasValidPaidPlan = 
      isValidId(rootPlanId) || 
      isValidId(subPlanId) || 
      (userData?.subscription?.status === 'active' && userData?.subscription?.type !== 'trial');
    
    const isTrial = !hasValidPaidPlan && (
      userData?.subscription?.type === "trial" ||
      !rootPlanId ||
      rootPlanId === "free_trial" ||
      rootPlanId === "trial" ||
      rootPlanId === "free" ||
      userData?.isTrial === true
    );

    const activePlanId = isValidId(rootPlanId) ? rootPlanId : (isValidId(subPlanId) ? subPlanId : null);

    if (isTrial) {
      // Read from LIVE brandData root first to avoid stale user cache
      const trialTools = brandData?.freeTrialSettings?.allowedTools || userData?.freeTrialSettings?.allowedTools;
      if (Array.isArray(trialTools)) return trialTools;
    } else {
      if (activePlanId && Array.isArray(brandData?.plans)) {
        const matchedPlan = brandData.plans.find((p) => String(p.id) === String(activePlanId));
        if (matchedPlan && Array.isArray(matchedPlan.allowedTools)) return matchedPlan.allowedTools;
      }
      if (Array.isArray(userData?.allowedTools)) return userData.allowedTools;
      if (Array.isArray(userData?.subscription?.allowedTools)) return userData.subscription.allowedTools;
    }
    return null;
  };

  const resolvedAllowedTools = resolveAllowedTools();
  
  // Strict Lock Enforcement: If not explicitly allowed, it MUST be locked.
  const isAllowed = Array.isArray(resolvedAllowedTools) && resolvedAllowedTools.includes('tutorial');
  const isLocked = !isAllowed;

  useEffect(() => {
    if (isLocked) {
      toast(lang === 'en' ? "🔒 Tutorial is not included in your current plan. Please upgrade!" : "🔒 فيديو الشرح غير متاح في باقتك الحالية. يرجى ترقية الباقة!", "error");
    }
  }, [isLocked, lang, toast]);

  if (isLocked) {
    return <Navigate to="/dashboard" replace />;
  }
  // ─────────────────────────────────────────────────────────────────────────
  
  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '100%', overflowX: 'hidden' }}>
      <PlatformExplanation
        title={lang === 'ar' ? "شرح منصة الأدوات" : "Platform Tutorial"}
        videoUrl="https://firebasestorage.googleapis.com/v0/b/aibrand-vision.firebasestorage.app/o/Videos%2F%D8%B4%D8%B1%D8%AD%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A7%D9%84%D8%A3%D8%AF%D9%88%D8%A7%D8%AA.webm?alt=media&token=7ae6e2bd-ad81-4483-a78b-4ac1d058e670"
        lang={lang}
      />
    </div>
  );
}

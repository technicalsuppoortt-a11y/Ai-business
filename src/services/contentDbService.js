/**
 * contentDbService.js
 * ====================================
 * Unified Content Database Service
 * Queries Firebase Firestore for pre-built tool content
 * with smart fallback to closest matching niche.
 * ====================================
 */
import { db } from '../firebase';
import { doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// ─── Collection Names ───────────────────────────────────────────────────────
export const COL = {
  NICHE_ANALYSIS:      'tc_niche_analysis',
  BRAND_NAMES:         'tc_brand_names',
  COLOR_ANALYSIS:      'tc_color_analysis',
  CONTENT_PLANS:       'tc_content_plans',
  AD_CREATIVES:        'tc_ad_creatives',
  MARKETING_PLANS:     'tc_marketing_plans',
  PLATFORM_STRATEGIES: 'tc_platform_strategies',
  PROPOSAL_TEMPLATES:  'tc_proposal_templates',
  BIO_TEMPLATES:       'tc_bio_templates',
  SALES_REPLIES:       'tc_sales_replies',
  INTERVIEW_QUESTIONS: 'tc_interview_questions',
  SKILL_PROPOSITIONS:  'tc_skill_propositions',
  CASE_STUDY_FRAMES:   'tc_case_study_frameworks',
  TASK_TEMPLATES:      'tc_task_templates',
  // Dynamic Templates
  WEBSITE_TEMPLATES:   'tc_website_templates',
  WEBSITE_TEMPLATES_GALLERY: 'tc_website_templates_gallery',
  WEBSITE_TEMPLATE_CATEGORIES: 'tc_website_template_categories',
  DOMAIN_IDEAS:        'tc_domain_ideas',
  FREELANCE_AI:        'tc_freelance_ai',
  SOCIAL_PRESENCE:     'tc_social_presence',
  PROFIT_ADVICE:       'tc_profit_advice',
  PRODUCT_IDEAS:       'tc_product_ideas',
  HEYGEN_SCRIPTS:      'tc_heygen_scripts',
  PRICING_ANALYSIS:    'tc_pricing_analysis',
  EMAIL_SEQUENCES:     'tc_email_sequences',
  CHATBOT_SCRIPTS:     'tc_chatbot_scripts',
  AD_CREATIVES_V2:     'tc_ad_creatives_v2',
  EMAIL_SEQUENCES_V2:  'tc_email_sequences_v2',
  PRODUCT_IDEAS_V2:    'tc_product_ideas_v2',
  PROFIT_SCENARIOS:    'tc_profit_scenarios',
};

// ─── Niche Similarity Map (Fallback) ────────────────────────────────────────
const NICHE_GROUPS = {
  // E-commerce group
  ecom: ['dropshipping', 'print_on_demand', 'handmade', 'fashion', 'beauty_products', 'electronics', 'home_decor', 'pet_supplies'],
  // Tech group
  saas: ['mobile_apps', 'web_dev', 'ai_tools', 'cybersecurity', 'blockchain'],
  // Coaching group
  life_coaching: ['business_coaching', 'career_coaching', 'relationship_coaching', 'financial_consulting'],
  // Health group
  fitness: ['nutrition', 'mental_health', 'yoga', 'medical_clinics'],
  // Food group
  restaurants: ['healthy_food', 'baking', 'coffee_shops'],
  // Real estate group
  realestate_sales: ['property_management', 'interior_design', 'cleaning_services'],
  // Education group
  online_courses: ['language_learning', 'tutoring', 'skill_building'],
  // Marketing group
  digital_marketing: ['seo_agency', 'content_creation', 'pr_agency'],
  // Creative group
  personal_brand: ['photography', 'videography', 'graphic_design', 'music_production', 'writing_publishing'],
  // Finance group
  personal_finance: ['trading', 'crypto_investment'],
  // Aligning UI parent niches
  ai: [],
  business: [],
  marketing: [],
  realestate: [],
  creative: [],
};

// Build reverse map: subNiche → parentNiche
const NICHE_PARENT = {};
Object.entries(NICHE_GROUPS).forEach(([parent, children]) => {
  children.forEach(child => { NICHE_PARENT[child] = parent; });
});

/**
 * Get the canonical niche key for fallback.
 * If exact niche not found, returns the group parent.
 */
export const getCanonicalNiche = (nicheId) => {
  if (!nicheId) return 'ecom';
  if (NICHE_GROUPS[nicheId]) return nicheId; // is a parent
  if (NICHE_PARENT[nicheId]) return NICHE_PARENT[nicheId]; // map to parent
  return 'ecom'; // ultimate fallback
};

// ─── Core Fetch Helper ──────────────────────────────────────────────────────
/**
 * Fetch a document, with automatic fallback to canonical niche version.
 * @param {string} colName - Firestore collection name
 * @param {string} docId - Primary document ID to try
 * @param {string} fallbackDocId - Fallback document ID
 * @returns {object|null} document data or null
 */
const fetchWithFallback = async (colName, docId, fallbackDocId = null) => {
  try {
    console.log(`[ContentDB] Fetching from ${colName}: primary=${docId}, fallback=${fallbackDocId}`);
    const primaryRef = doc(db, colName, docId);
    const primarySnap = await getDoc(primaryRef);
    if (primarySnap.exists()) {
      console.log(`[ContentDB] Found primary: ${docId}`);
      return primarySnap.data();
    }

    if (fallbackDocId && fallbackDocId !== docId) {
      console.log(`[ContentDB] Primary not found, trying fallback: ${fallbackDocId}`);
      const fallbackRef = doc(db, colName, fallbackDocId);
      const fallbackSnap = await getDoc(fallbackRef);
      if (fallbackSnap.exists()) {
        console.log(`[ContentDB] Found fallback: ${fallbackDocId}`);
        return fallbackSnap.data();
      }
    }
    console.log(`[ContentDB] Neither primary nor fallback found for ${docId}`);
    return null;
  } catch (error) {
    console.error(`[ContentDB] Error fetching ${colName}/${docId}:`, error);
    return null;
  }
};

// ─── Tool-Specific Query Functions ──────────────────────────────────────────

/**
 * 1. Niche Analysis
 * @param {string} nicheId - e.g. 'ecom', 'saas', 'fitness'
 * @param {string} subNicheId - e.g. 'fashion', 'mobile_apps'
 */
export const getNicheAnalysis = async (nicheId, subNicheId = null) => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = subNicheId ? `${nicheId}_${subNicheId}` : nicheId;
  const fallbackId = subNicheId ? canonical : getCanonicalNiche(nicheId);
  return await fetchWithFallback(COL.NICHE_ANALYSIS, primaryId, fallbackId);
};

/**
 * 2a. Brand Niches Definitions
 * Returns the structure of niches (ecom, digital, service) and their sub-niches
 */
export const getBrandNichesDef = async () => {
  const { brandNichesDef } = await import('./seedPart6_brands');
  return brandNichesDef;
};

/**
 * 2b. Brand Names (Categorized)
 * @param {string} subNicheId - e.g. 'fashion', 'saas', 'ebooks'
 */
export const getBrandNames = async (subNicheId) => {
  const primaryId = `brands_${subNicheId}`;
  const data = await fetchWithFallback(COL.BRAND_NAMES, primaryId, null);
  if (!data) {
    // Last resort fallback if not found
    return await fetchWithFallback(COL.BRAND_NAMES, `brands_marketing`, null);
  }
  return data;
};

/**
 * 3. Color / Visual Identity Analysis
 * @param {string} colorId - e.g. 'neon', 'purple', 'gold'
 */
export const getColorAnalysis = async (colorId) => {
  return await fetchWithFallback(COL.COLOR_ANALYSIS, colorId, 'blue');
};

/**
 * 4. Content Plan (Weekly)
 * @param {string} nicheId
 * @param {string} platform - 'instagram' | 'tiktok' | 'linkedin' | 'twitter'
 * @param {string} format - 'video' | 'carousel' | 'text'
 */
export const getContentPlan = async (nicheId, platform, format = 'video', audience = 'general') => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = `${nicheId}_${platform}_${format}_${audience}`;
  const fallbackId = `${canonical}_${platform}_${format}_${audience}`;
  const secondFallbackId = `${canonical}_${platform}_video_${audience}`;
  let data = await fetchWithFallback(COL.CONTENT_PLANS, primaryId, fallbackId);
  if (!data) {
    data = await fetchWithFallback(COL.CONTENT_PLANS, secondFallbackId, null);
  }
  return data;
};

/**
 * 5. Ad Creative
 * @param {string} nicheId
 * @param {string} platform - 'tiktok' | 'facebook' | 'youtube'
 * @param {string} adType - 'awareness' | 'conversion' | 'retargeting'
 */
export const getAdCreative = async (nicheId, platform, adType = 'conversion') => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = `${nicheId}_${platform}_${adType}`;
  const fallbackId = `${canonical}_${platform}_${adType}`;
  let data = await fetchWithFallback(COL.AD_CREATIVES, primaryId, fallbackId);
  if (!data) {
    data = await fetchWithFallback(COL.AD_CREATIVES, `${canonical}_${platform}_conversion`, null);
  }
  return data;
};

/**
 * 6. Marketing Plan
 * @param {string} nicheId
 * @param {string} budgetTier - 'starter' | 'growth' | 'scale'
 */
export const getMarketingPlan = async (nicheId, budgetTier = 'starter', goal = 'sales', clientLevel = 'beginner') => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = `${nicheId}_${budgetTier}_${goal}_${clientLevel}`;
  const fallbackId = `${canonical}_${budgetTier}_${goal}_${clientLevel}`;
  let data = await fetchWithFallback(COL.MARKETING_PLANS, primaryId, fallbackId);
  if (!data) {
    // If not found, fallback to ecom generic
    data = await fetchWithFallback(COL.MARKETING_PLANS, `ecom_${budgetTier}_${goal}_${clientLevel}`, null);
  }
  return data;
};

/**
 * 7. Platform Strategy (Freelance)
 * @param {string} platformId - 'upwork' | 'fiverr' | 'khamsat' | 'mostaql' | 'freelancer'
 * @param {string} nicheId
 */
export const getPlatformStrategy = async (platformId, nicheId) => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = `${platformId}_${nicheId}`;
  const fallbackId = `${platformId}_${canonical}`;
  const genericId = `${platformId}_general`;
  let data = await fetchWithFallback(COL.PLATFORM_STRATEGIES, primaryId, fallbackId);
  if (!data) {
    data = await fetchWithFallback(COL.PLATFORM_STRATEGIES, genericId, null);
  }
  return data;
};

/**
 * 8. Proposal Template (Freelance)
 * @param {string} nicheId
 * @param {string} tone - 'professional' | 'friendly' | 'confident' | 'consultative'
 * @param {string} clientType - 'startup' | 'corporate' | 'individual' | 'agency'
 */
export const getProposalTemplate = async (nicheId, tone, clientType = 'individual') => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = `${nicheId}_${tone}_${clientType}`;
  const fallbackId = `${canonical}_${tone}_${clientType}`;
  const simpleFallback = `${canonical}_${tone}_individual`;
  let data = await fetchWithFallback(COL.PROPOSAL_TEMPLATES, primaryId, fallbackId);
  if (!data) {
    data = await fetchWithFallback(COL.PROPOSAL_TEMPLATES, simpleFallback, null);
  }
  return data;
};

/**
 * 9. Freelance Bio Template
 * @param {string} nicheId
 * @param {string} experience - 'beginner' | 'intermediate' | 'expert'
 */
export const getBioTemplate = async (nicheId, experience = 'intermediate') => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = `${nicheId}_${experience}`;
  const fallbackId = `${canonical}_${experience}`;
  return await fetchWithFallback(COL.BIO_TEMPLATES, primaryId, fallbackId);
};

/**
 * 10. Sales Reply Template
 * @param {string} situationId - e.g. 'discount_request' | 'slow_response' | 'out_of_scope'
 * @param {string} tone - 'professional' | 'friendly' | 'persuasive' | 'diplomatic'
 */
export const getSalesReply = async (situationId, tone) => {
  const primaryId = `${situationId}_${tone}`;
  const fallbackId = `${situationId}_professional`;
  return await fetchWithFallback(COL.SALES_REPLIES, primaryId, fallbackId);
};

/**
 * 11. Interview Questions
 * @param {string} clientType - 'startup' | 'corporate' | 'individual' | 'agency'
 * @param {string} nicheId
 */
export const getInterviewQuestions = async (clientType, nicheId) => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = `${clientType}_${nicheId}`;
  const fallbackId = `${clientType}_${canonical}`;
  const genericId = `${clientType}_general`;
  let data = await fetchWithFallback(COL.INTERVIEW_QUESTIONS, primaryId, fallbackId);
  if (!data) {
    data = await fetchWithFallback(COL.INTERVIEW_QUESTIONS, genericId, null);
  }
  return data;
};

/**
 * 12. Skill Value Propositions
 * @param {string} skillId - skill ID from FREELANCE_DB
 */
export const getSkillProposition = async (skillId) => {
  return await fetchWithFallback(COL.SKILL_PROPOSITIONS, skillId, 'general');
};

/**
 * 13. Case Study Framework
 * @param {string} nicheId
 */
export const getCaseStudyFramework = async (nicheId) => {
  const canonical = getCanonicalNiche(nicheId);
  return await fetchWithFallback(COL.CASE_STUDY_FRAMES, nicheId, canonical);
};

/**
 * 14. AI Task Template (SmartAIAssistant)
 * @param {string} taskType - 'ads' | 'content' | 'sales' | 'cold-email'
 * @param {string} nicheId
 */
export const getTaskTemplate = async (taskType, nicheId) => {
  const canonical = getCanonicalNiche(nicheId);
  const primaryId = `${taskType}_${nicheId}`;
  const fallbackId = `${taskType}_${canonical}`;
  const genericId = `${taskType}_general`;
  let data = await fetchWithFallback(COL.TASK_TEMPLATES, primaryId, fallbackId);
  if (!data) {
    data = await fetchWithFallback(COL.TASK_TEMPLATES, genericId, null);
  }
  return data;
};

/**
 * 15. Website Construction Templates
 * @param {string} nicheId
 */
export const getWebsiteTemplate = async (nicheId) => {
  const canonical = getCanonicalNiche(nicheId);
  return await fetchWithFallback(COL.WEBSITE_TEMPLATES, nicheId, canonical);
};

/**
 * 15b. Get All Website Gallery Templates
 * Returns the array of available premium templates.
 */
export const getAllWebsiteGalleryTemplates = async () => {
  try {
    const q = query(collection(db, COL.WEBSITE_TEMPLATES_GALLERY));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    
    const templates = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      templates.push({
        ...data,
        status: data.status || 'published',
        category: data.category || 'عام'
      });
    });
    return templates;
  } catch (error) {
    console.error('[ContentDB] Error fetching gallery templates:', error);
    return [];
  }
};

/**
 * 16. Domain Ideas Templates
 * @param {string} nicheId
 */
export const getDomainIdeasTemplate = async (nicheId) => {
  const canonical = getCanonicalNiche(nicheId);
  let data = await fetchWithFallback(COL.DOMAIN_IDEAS, nicheId, canonical);
  if (!data) {
    data = await fetchWithFallback(COL.DOMAIN_IDEAS, 'general', null);
  }
  return data;
};

/**
 * 17. Social Presence Templates (Matrix)
 * @param {string} platform - 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'facebook' | 'youtube' | 'pinterest' | 'snapchat'
 * @param {string} goal - 'awareness' | 'engagement' | 'leads' | 'sales'
 */
export const getSocialPresenceMatrix = async () => {
  try {
    const docRef = doc(db, 'tc_social_presence_matrix', 'all_platforms');
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error(`[ContentDB] Error fetching Social Presence Matrix:`, error);
    return null;
  }
};

/**
 * 18. Profit Advice Templates
 * @param {string} marginLevel - 'low' | 'good' | 'excellent'
 */
export const getProfitAdviceTemplate = async (marginLevel) => {
  return await fetchWithFallback(COL.PROFIT_ADVICE, marginLevel, 'good');
};

/**
 * 18b. Advanced Profit Scenarios
 * @param {string} scenarioId - Evaluated bottleneck scenario
 */
export const getProfitScenarioTemplate = async (scenarioId) => {
  return await fetchWithFallback(COL.PROFIT_SCENARIOS, scenarioId, 'losing_general');
};

/**
 * 19. Product Ideas Templates
 * @param {string} productType - 'plr' | 'service' | 'custom'
 * @param {string} effortLevel - 'low' | 'medium' | 'high'
 */
export const getProductIdeasTemplate = async (productType, effortLevel) => {
  const primaryId = `${productType}_${effortLevel}`;
  return await fetchWithFallback(COL.PRODUCT_IDEAS, primaryId, `${productType}_medium`);
};

/**
 * 20. HeyGen Scripts Templates
 * @param {string} videoGoal - 'welcome' | 'explainer' | 'sales'
 * @param {string} videoDuration - 'short' | 'long'
 */
export const getHeyGenScriptTemplate = async (videoGoal, videoDuration) => {
  const primaryId = `${videoGoal}_${videoDuration}`;
  return await fetchWithFallback(COL.HEYGEN_SCRIPTS, primaryId, `${videoGoal}_short`);
};

/**
 * 21. Pricing Analysis Templates
 * @param {string} rateLevel - 'low' | 'competitive' | 'premium'
 */
export const getPricingAnalysisTemplate = async (rateLevel) => {
  return await fetchWithFallback(COL.PRICING_ANALYSIS, rateLevel, 'competitive');
};

/**
 * 22. Email Sequences Templates
 * @param {string} nicheId
 */
export const getEmailSequenceTemplate = async (nicheId) => {
  const canonical = getCanonicalNiche(nicheId);
  return await fetchWithFallback(COL.EMAIL_SEQUENCES, nicheId, canonical);
};

/**
 * 23. Chatbot Scripts Templates
 * @param {string} tone - 'friendly' | 'professional' | 'humorous'
 */
export const getChatbotScriptTemplate = async (tone) => {
  return await fetchWithFallback(COL.CHATBOT_SCRIPTS, tone, 'professional');
};

/**
 * 24. Landing Page Content Matrix
 * Fetches a specific matrix section (e.g., 'hero_sections', 'problem_sections')
 */
export const getLandingMatrixSection = async (sectionDocId) => {
  try {
    const docRef = doc(db, 'tc_landing_content_matrix', sectionDocId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error(`[ContentDB] Error fetching landing matrix section ${sectionDocId}:`, error);
    return null;
  }
};

/**
 * 25. Freelance AI Matrix
 */
export const getFreelanceAIStructure = async () => {
  try {
    const docRef = doc(db, COL.FREELANCE_AI, 'structure_def');
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error('[ContentDB] Error fetching Freelance AI Structure:', error);
    return null;
  }
};

export const getFreelanceAITemplate = async (goalId, channelId, clientId, toneId) => {
  const docId = `${goalId}_${channelId}_${clientId}_${toneId}`;
  try {
    const docRef = doc(db, COL.FREELANCE_AI, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error(`[ContentDB] Error fetching Freelance AI Template ${docId}:`, error);
    return null;
  }
};

/**
 * 26. Ad Lab V2 Matrix
 */
export const getAdLabStructure = async () => {
  try {
    const docRef = doc(db, COL.AD_CREATIVES_V2, 'structure_def');
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error('[ContentDB] Error fetching Ad Lab Structure:', error);
    return null;
  }
};

export const getAdLabTemplate = async (productId, painId, platformId, dialectId = 'standard') => {
  const docId = `${productId}_${painId}_${platformId}_${dialectId}`;
  try {
    const docRef = doc(db, COL.AD_CREATIVES_V2, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    
    // Fallback to standard if dialect is not found
    if (dialectId !== 'standard') {
      return await getAdLabTemplate(productId, painId, platformId, 'standard');
    }
    
    return null;
  } catch (error) {
    console.error(`[ContentDB] Error fetching Ad Lab Template ${docId}:`, error);
    return null;
  }
};

/**
 * 27. Email Sequences V2 Matrix
 */
export const getEmailSeqStructure = async () => {
  try {
    const docRef = doc(db, COL.EMAIL_SEQUENCES_V2, 'structure_def');
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error('[ContentDB] Error fetching Email Seq Structure:', error);
    return null;
  }
};

export const getEmailSeqTemplate = async (goalId, audienceId, toneId) => {
  const docId = `${goalId}_${audienceId}_${toneId}`;
  try {
    const docRef = doc(db, COL.EMAIL_SEQUENCES_V2, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error(`[ContentDB] Error fetching Email Seq Template ${docId}:`, error);
    return null;
  }
};

/**
 * 28. Product Ideas V2 Matrix
 */
export const getProductIdeasStructure = async () => {
  try {
    const docRef = doc(db, COL.PRODUCT_IDEAS_V2, 'structure_def');
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error('[ContentDB] Error fetching Product Ideas Structure:', error);
    return null;
  }
};

export const getProductIdeasV2 = async (typeId, nicheId, effortId) => {
  const docId = `${typeId}_${nicheId}_${effortId}`;
  try {
    const docRef = doc(db, COL.PRODUCT_IDEAS_V2, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (error) {
    console.error(`[ContentDB] Error fetching Product Ideas ${docId}:`, error);
    return null;
  }
};

// ─── Dynamic Templates & Funnel Management (Admin & User) ──────────────

export const getAllWebsiteTemplateCategories = async () => {
  try {
    const q = query(collection(db, COL.WEBSITE_TEMPLATE_CATEGORIES));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    
    const categories = [];
    snapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return categories;
  } catch (error) {
    console.error('[ContentDB] Error fetching template categories:', error);
    return [];
  }
};

export const saveTemplateCategory = async (categoryData, categoryId = null) => {
  try {
    if (categoryId) {
      const docRef = doc(db, COL.WEBSITE_TEMPLATE_CATEGORIES, categoryId);
      await updateDoc(docRef, categoryData);
      return categoryId;
    } else {
      const docRef = await addDoc(collection(db, COL.WEBSITE_TEMPLATE_CATEGORIES), categoryData);
      return docRef.id;
    }
  } catch (error) {
    console.error('[ContentDB] Error saving template category:', error);
    throw error;
  }
};

export const deleteTemplateCategory = async (categoryId) => {
  try {
    await deleteDoc(doc(db, COL.WEBSITE_TEMPLATE_CATEGORIES, categoryId));
  } catch (error) {
    console.error('[ContentDB] Error deleting template category:', error);
    throw error;
  }
};

export const saveWebsiteTemplate = async (templateData, templateId = null) => {
  try {
    if (templateId) {
      const docRef = doc(db, COL.WEBSITE_TEMPLATES_GALLERY, templateId);
      await updateDoc(docRef, templateData);
      return templateId;
    } else {
      if (templateData.id) {
        await setDoc(doc(db, COL.WEBSITE_TEMPLATES_GALLERY, templateData.id), templateData);
        return templateData.id;
      } else {
        const docRef = await addDoc(collection(db, COL.WEBSITE_TEMPLATES_GALLERY), templateData);
        return docRef.id;
      }
    }
  } catch (error) {
    console.error('[ContentDB] Error saving website template:', error);
    throw error;
  }
};

export const deleteWebsiteTemplate = async (templateId) => {
  try {
    await deleteDoc(doc(db, COL.WEBSITE_TEMPLATES_GALLERY, templateId));
  } catch (error) {
    console.error('[ContentDB] Error deleting website template:', error);
    throw error;
  }
};

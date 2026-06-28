import { seedNicheAnalysis } from './seedPart1_niches';
import { seedPlatformStrategies, seedProposalTemplates, seedBioTemplates } from './seedPart2_platforms';
import { seedSalesReplies, seedInterviewQuestions, seedAdCreatives } from './seedPart3_sales';
import { seedMiscData } from './seedPart4_misc';
import { seedDynamicTemplates } from './seedPart5_dynamic';
import { seedCategorizedBrands } from './seedPart6_brands';
import { seedGalleryTemplates } from './seedPart7_seeder';
import { seedLandingContentMatrix } from './seedPart8_seeder';
import { seedContentPlans } from './seedPart9_contentPlans';
import { seedMarketingPlansMatrix } from './seedPart10_marketingPlans';
import { seedDomainIdeas } from './seedPart11_domains';
import { seedFreelanceAIMatrix } from './seedPart12_freelanceAI';
import { seedAdCreativesV2 } from './seedPart13_adLab';
import { seedEmailSequencesV2 } from './seedPart14_emailSequences';
import { seedProductIdeasV2 } from './seedPart15_productIdeas';
import { seedProfitScenarios } from './seedPart18_profitScenarios';
import { seedSocialPresence } from './seedSocialPresence';

export const SEED_MODULES = [
  { id: 'niches', name_ar: 'تحليل النيتشات (Part 1)', name_en: 'Niche Analysis', fn: seedNicheAnalysis },
  { id: 'platforms', name_ar: 'استراتيجيات المنصات (Part 2)', name_en: 'Platform Strategies', fn: async () => { await seedPlatformStrategies(); await seedProposalTemplates(); await seedBioTemplates(); } },
  { id: 'sales', name_ar: 'المبيعات والردود (Part 3)', name_en: 'Sales & Replies', fn: async () => { await seedSalesReplies(); await seedInterviewQuestions(); await seedAdCreatives(); } },
  { id: 'misc', name_ar: 'البيانات العامة (Part 4)', name_en: 'Misc Data', fn: seedMiscData },
  { id: 'dynamic', name_ar: 'القوالب الديناميكية (Part 5)', name_en: 'Dynamic Templates', fn: seedDynamicTemplates },
  { id: 'brands', name_ar: 'تصنيفات البراندات (Part 6)', name_en: 'Brand Categories', fn: seedCategorizedBrands },
  { id: 'gallery', name_ar: 'معرض القوالب (Part 7)', name_en: 'Template Gallery', fn: seedGalleryTemplates },
  { id: 'landing', name_ar: 'مصفوفة المحتوى (Part 8)', name_en: 'Landing Matrix', fn: seedLandingContentMatrix },
  { id: 'content_plans', name_ar: 'خطط المحتوى (Part 9)', name_en: 'Content Plans', fn: seedContentPlans },
  { id: 'marketing_plans', name_ar: 'خطط التسويق (Part 10)', name_en: 'Marketing Plans', fn: seedMarketingPlansMatrix },
  { id: 'domains', name_ar: 'أفكار الدومينات (Part 11)', name_en: 'Domain Ideas', fn: seedDomainIdeas },
  { id: 'freelance_ai', name_ar: 'مصفوفة العمل الحر (Part 12)', name_en: 'Freelance AI Matrix', fn: seedFreelanceAIMatrix },
  { id: 'ad_lab', name_ar: 'مختبر الإعلانات (Part 13)', name_en: 'Ad Lab', fn: seedAdCreativesV2 },
  { id: 'email_sequences', name_ar: 'تسلسلات الإيميل (Part 14)', name_en: 'Email Sequences', fn: seedEmailSequencesV2 },
  { id: 'product_ideas', name_ar: 'أفكار المنتجات (Part 15)', name_en: 'Product Ideas', fn: seedProductIdeasV2 },
  { id: 'profit_scenarios', name_ar: 'سيناريوهات الربح (Part 18)', name_en: 'Profit Scenarios', fn: seedProfitScenarios },
  { id: 'social_presence', name_ar: 'التواجد الاجتماعي', name_en: 'Social Presence Matrix', fn: seedSocialPresence },
];

export const runFullContentSeed = async () => {
  console.log('🚀 Starting Full Content Database Seeding...');
  
  try {
    for (const module of SEED_MODULES) {
      console.log(`📡 Seeding Module: ${module.name_en}...`);
      await module.fn();
    }
    
    console.log('✅ ALL Database Seeds Completed Successfully!');
    alert('✅ تم رفع جميع بيانات المحتوى إلى Firebase بنجاح!');
  } catch (error) {
    console.error('❌ Error during full seeding:', error);
    alert('❌ حدث خطأ أثناء رفع البيانات. راجع الكونسول.');
  }
};

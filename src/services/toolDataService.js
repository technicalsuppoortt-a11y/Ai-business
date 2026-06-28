import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

const BRAND_NAMES_COL = 'brand_names';
const MARKETING_PLANS_COL = 'marketing_plans';
const AD_CREATIVES_COL = 'ad_creatives';

/**
 * Seed initial brand names for each niche
 */
export const seedBrandNames = async () => {
  const brandData = [
    // AI Niche
    { name: 'MindLink AI', niches: ['ai'], description: 'براند يركز على الربط بين العقل والذكاء الاصطناعي.' },
    { name: 'NeuralCraft', niches: ['ai'], description: 'صناعة الحلول الذكية باحترافية.' },
    { name: 'VisionaryAI', niches: ['ai'], description: 'رؤية مستقبلية مدعومة بالذكاء.' },
    { name: 'Synthetix', niches: ['ai'], description: 'توليد المحتوى والبيانات بذكاء.' },
    
    // Business Niche
    { name: 'ProfitFlow', niches: ['business'], description: 'إدارة التدفقات المالية والأرباح.' },
    { name: 'EliteAdvisors', niches: ['business'], description: 'استشارات نخبوية لرواد الأعمال.' },
    { name: 'ScaleUp Masters', niches: ['business'], description: 'خبراء التوسع والنمو السريع.' },
    { name: 'BizCore', niches: ['business'], description: 'جوهر الأعمال والنجاح المؤسسي.' },
    
    // Marketing Niche
    { name: 'ViralPulse', niches: ['marketing'], description: 'نبض الانتشار والوصول للملايين.' },
    { name: 'GrowthHacker Kit', niches: ['marketing'], description: 'أدوات النمو السريع للمسوقين.' },
    { name: 'SocialWave', niches: ['marketing'], description: 'ركوب موجة السوشيال ميديا بنجاح.' },
    { name: 'AdVantage AI', niches: ['marketing'], description: 'ميزة إعلانية تنافسية بالذكاء.' },

    // Fitness Niche
    { name: 'FitPulse', niches: ['fitness'], description: 'نبض اللياقة والحياة الصحية.' },
    { name: 'IronSpirit', niches: ['fitness'], description: 'روح الحديد والقوة البدنية.' },
    { name: 'ZenBody', niches: ['fitness'], description: 'توازن الجسم والعقل.' },
    
    // Real Estate
    { name: 'EstatePro', niches: ['realestate'], description: 'احترافية العقارات والوساطة.' },
    { name: 'PrimeHabitat', niches: ['realestate'], description: 'مسكنك المثالي في مكان متميز.' }
  ];

  for (const item of brandData) {
    const id = item.name.toLowerCase().replace(/\s+/g, '-');
    await setDoc(doc(db, BRAND_NAMES_COL, id), item);
  }
};

/**
 * Fetch brand names by niche
 */
export const getBrandNamesByNiche = async (nicheId) => {
  try {
    const q = query(collection(db, BRAND_NAMES_COL), where('niches', 'array-contains', nicheId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching brand names:', error);
    return [];
  }
};

/**
 * Fetch content ideas based on niche and category
 */
export const getContentIdeas = async (nicheId, category) => {
  // This is a simplified version, ideally we'd have a collection for this
  const mockData = {
    design: [
      { title: 'بوست تعليمي', desc: 'شرح فكرة معقدة بتبسيط بصري.' },
      { title: 'إنفوجرافيك نتائج', desc: 'عرض أرقام ونجاحات البراند.' },
      { title: 'اقتباس ملهم', desc: 'مقولة لرواد أعمال في مجال ' + nicheId },
      { title: 'مقارنة قبل وبعد', desc: 'كيف يغير منتجك حياة العميل.' },
      { title: 'خريطة طريق', desc: 'خطوات البدء في هذا المجال.' },
      { title: 'سؤال تفاعلي', desc: 'إشراك الجمهور في نقاش حول ' + nicheId }
    ],
    ads: [
      { title: 'إعلان مباشر', desc: 'عرض المنتج بوضوح مع CTA قوي.' },
      { title: 'إعلان قصة نجاح', desc: 'عرض تجربة عميل حقيقي.' },
      { title: 'إعلان "هل تعاني من؟"', desc: 'استهداف نقطة ألم العميل مباشرة.' }
    ]
  };
  return mockData[category] || [];
};

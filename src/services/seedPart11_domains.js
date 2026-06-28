import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const COL = 'tc_domain_ideas';

const generateDomainMatrix = (nicheId) => {
  // Common action verbs
  const actionPrefixesEn = ['get', 'try', 'use', 'join', 'hello', 'go'];
  const actionPrefixesAr = ['احصل على', 'جرب', 'استخدم', 'انضم إلى', 'مرحباً', 'ابدأ'];

  let nicheExtensions = [];
  let descriptionEn = '';
  let descriptionAr = '';

  switch (nicheId) {
    case 'ecom':
    case 'ecom_fashion':
    case 'ecom_electronics':
    case 'dropshipping':
      nicheExtensions = ['.store', '.shop', '.market', '.boutique', '.cart'];
      descriptionEn = 'E-commerce focused extensions indicating a retail business.';
      descriptionAr = 'امتدادات مخصصة للمتاجر الإلكترونية لزيادة ثقة المشتري.';
      break;
    case 'agency':
    case 'freelance':
      nicheExtensions = ['.agency', '.studio', '.digital', '.media', '.creative'];
      descriptionEn = 'Creative and agency extensions showing professionalism.';
      descriptionAr = 'امتدادات إبداعية تبرز احترافية الوكالة وتخصصها.';
      break;
    case 'consulting':
      nicheExtensions = ['.consulting', '.expert', '.pro', '.advisors', '.partners'];
      descriptionEn = 'Professional extensions to build authority and trust.';
      descriptionAr = 'امتدادات رسمية لبناء الثقة والموثوقية العالية.';
      break;
    case 'local':
    case 'local_cafe':
      nicheExtensions = ['.sa', '.ae', '.us', '.city', '.cafe', '.local'];
      descriptionEn = 'Location-based or business-type specific extensions.';
      descriptionAr = 'امتدادات محلية أو مخصصة للنشاط لتعزيز التواجد الجغرافي.';
      break;
    case 'affiliate':
      nicheExtensions = ['.deals', '.review', '.guide', '.best', '.tips'];
      descriptionEn = 'Extensions optimized for SEO and affiliate reviews.';
      descriptionAr = 'امتدادات مناسبة لتحسين محركات البحث والمراجعات.';
      break;
    default:
      nicheExtensions = ['.co', '.io', '.net', '.online', '.biz'];
      descriptionEn = 'Modern standard extensions.';
      descriptionAr = 'امتدادات عصرية عامة.';
      break;
  }

  return {
    classic: {
      title_en: 'The Classics (Trust & Authority)',
      title_ar: 'الامتدادات الكلاسيكية (الثقة)',
      extensions: ['.com', '.net', '.co'],
      formats: [
        '{{brandName}}{ext}',
        '{{brandName}}hq{ext}',
        'the{{brandName}}{ext}',
        'my{{brandName}}{ext}'
      ]
    },
    action: {
      title_en: 'Action-Oriented (High Conversion)',
      title_ar: 'أفعال الحث (معدل تحويل عالي)',
      extensions: ['.com', '.co'],
      prefixesEn: actionPrefixesEn,
      prefixesAr: actionPrefixesAr,
      formats: [
        '{prefix}{{brandName}}{ext}'
      ]
    },
    niche: {
      title_en: 'Niche-Specific Extensions',
      title_ar: 'امتدادات التخصص الدقيق',
      desc_en: descriptionEn,
      desc_ar: descriptionAr,
      extensions: nicheExtensions,
      formats: [
        '{{brandName}}{ext}'
      ]
    }
  };
};

export const seedDomainIdeas = async () => {
  console.log('🌱 Generating Smart Domain Ideas Matrix Database...');
  
  const niches = [
    'ecom', 'ecom_fashion', 'ecom_electronics', 'dropshipping',
    'agency', 'freelance', 'consulting', 'local', 'local_cafe', 'affiliate'
  ];

  let count = 0;

  try {
    for (const nicheId of niches) {
      const matrix = generateDomainMatrix(nicheId);
      
      await setDoc(doc(db, COL, nicheId), {
        id: nicheId,
        matrix: matrix,
        updatedAt: new Date().toISOString()
      });
      count++;
    }

    // Default general fallback
    await setDoc(doc(db, COL, 'general'), {
      id: 'general',
      matrix: generateDomainMatrix('general'),
      updatedAt: new Date().toISOString()
    });
    count++;

    console.log(`✅ Successfully seeded ${count} Domain Matrices to '${COL}'`);
    return count;
  } catch (error) {
    console.error('❌ Error seeding domains:', error);
    throw error;
  }
};

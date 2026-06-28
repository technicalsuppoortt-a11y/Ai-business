import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const COL = 'tc_product_ideas_v2';

const productTypes = [
  { id: 'plr', name_en: 'PLR / MRR Products', name_ar: 'منتجات جاهزة للبيع (PLR/MRR)' },
  { id: 'digital', name_en: 'Custom Digital Product', name_ar: 'منتج رقمي مصنوع بنفسك' },
  { id: 'service', name_en: 'Productized Service', name_ar: 'خدمة كمنتج (Productized)' },
  { id: 'template', name_en: 'Templates & Tools', name_ar: 'قوالب وأدوات جاهزة' },
];

const niches = [
  { id: 'marketing', name_en: 'Marketing & Ads', name_ar: 'تسويق وإعلانات' },
  { id: 'design', name_en: 'Design & Branding', name_ar: 'تصميم وهوية بصرية' },
  { id: 'coaching', name_en: 'Coaching & Training', name_ar: 'تدريب واستشارات' },
  { id: 'ecom', name_en: 'E-Commerce', name_ar: 'تجارة إلكترونية' },
  { id: 'tech', name_en: 'Tech & Programming', name_ar: 'برمجة وتقنية' },
];

const effortLevels = [
  { id: 'easy', name_en: 'Quick & Easy', name_ar: 'سريع وسهل (مبتدئ)' },
  { id: 'medium', name_en: 'Medium Effort', name_ar: 'مجهود متوسط' },
  { id: 'hard', name_en: 'Professional (High Effort)', name_ar: 'احترافي (مجهود عالي)' },
];

const baseTopics = {
  marketing: [
    { ar: 'محتوى السوشيال ميديا', en: 'Social Media Content' },
    { ar: 'سلاسل البريد الإلكتروني', en: 'Email Sequences' },
    { ar: 'خطافات إعلانية (Ad Hooks)', en: 'Ad Hooks' },
    { ar: 'خرائط مسارات البيع (Funnels)', en: 'Sales Funnels' },
    { ar: 'أدلة تحسين محركات البحث (SEO)', en: 'SEO Guides' },
    { ar: 'تقويم المحتوى السنوي', en: 'Annual Content Calendar' },
    { ar: 'ملفات نصوص تسويقية (Swipe Files)', en: 'Swipe Files' },
    { ar: 'قوالب التواصل مع المؤثرين', en: 'Influencer Outreach Templates' },
    { ar: 'بيانات صحفية (PR)', en: 'Press Releases (PR)' },
    { ar: 'استراتيجيات زيادة التحويل', en: 'Conversion Optimization Strategies' },
    { ar: 'لوحات تحليل البيانات', en: 'Data Analytics Dashboards' },
    { ar: 'خطط إطلاق المنتجات', en: 'Product Launch Plans' },
    { ar: 'أدلة إدارة المجتمعات', en: 'Community Management Guides' },
    { ar: 'قوالب جذب العملاء (Lead Magnets)', en: 'Lead Magnet Templates' },
    { ar: 'تصميمات إعلانية جاهزة', en: 'Ready-made Ad Designs' }
  ],
  design: [
    { ar: 'حزم الشعارات الاحترافية', en: 'Professional Logo Packs' },
    { ar: 'أدلة الهوية البصرية', en: 'Brand Identity Guides' },
    { ar: 'قوالب منشورات انستجرام', en: 'Instagram Post Templates' },
    { ar: 'عروض تقديمية (Pitch Decks)', en: 'Pitch Decks' },
    { ar: 'مكتبات واجهات المستخدم (UI Kits)', en: 'UI Kits' },
    { ar: 'مجموعات الأيقونات', en: 'Icon Sets' },
    { ar: 'تنسيقات الخطوط الاحترافية', en: 'Professional Font Pairings' },
    { ar: 'قوالب العرض (Mockups)', en: 'Mockup Templates' },
    { ar: 'حزم الرسومات التوضيحية', en: 'Illustration Packs' },
    { ar: 'إعلانات البانر للمواقع', en: 'Website Banner Ads' },
    { ar: 'تصاميم بطاقات العمل', en: 'Business Card Designs' },
    { ar: 'قوالب النشرات البريدية', en: 'Newsletter Templates' },
    { ar: 'ثيمات Notion الجمالية', en: 'Aesthetic Notion Themes' },
    { ar: 'أغلفة الكتب الإلكترونية', en: 'eBook Covers' },
    { ar: 'فلاتر صور احترافية (Presets)', en: 'Professional Photo Presets' }
  ],
  coaching: [
    { ar: 'مخططات الأهداف', en: 'Goal Planners' },
    { ar: 'بطاقات التأكيدات الإيجابية', en: 'Positive Affirmation Cards' },
    { ar: 'جداول تتبع العادات', en: 'Habit Trackers' },
    { ar: 'حقائب الورش التدريبية', en: 'Workshop Toolkits' },
    { ar: 'نماذج استقبال العملاء', en: 'Client Onboarding Forms' },
    { ar: 'كتيبات تمارين تفاعلية (Workbooks)', en: 'Interactive Workbooks' },
    { ar: 'شرائح العروض التدريبية (Masterclass)', en: 'Masterclass Presentation Slides' },
    { ar: 'خطط العمل التنفيذية', en: 'Action Plans' },
    { ar: 'جداول المحاسبة الذاتية', en: 'Accountability Trackers' },
    { ar: 'يوميات تطوير العقلية', en: 'Mindset Journals' },
    { ar: 'أطر إدارة الوقت', en: 'Time Management Frameworks' },
    { ar: 'أدوات قياس التقدم', en: 'Progress Measurement Tools' },
    { ar: 'ألعاب كسر الجليد للتدريب', en: 'Training Icebreakers' },
    { ar: 'أسئلة التأمل الذاتي', en: 'Self-Reflection Prompts' },
    { ar: 'باقات الترحيب بالعملاء الجدد', en: 'Welcome Packets for New Clients' }
  ],
  ecom: [
    { ar: 'نصوص وصف المنتجات', en: 'Product Description Copy' },
    { ar: 'قوائم المنتجات الرابحة', en: 'Winning Product Lists' },
    { ar: 'ثيمات متاجر شوبيفاي', en: 'Shopify Store Themes' },
    { ar: 'إيميلات استرجاع السلة المتروكة', en: 'Abandoned Cart Email Sequences' },
    { ar: 'سياسات الاسترجاع والاستبدال', en: 'Return and Exchange Policies' },
    { ar: 'أدلة الموردين والمصانع', en: 'Supplier and Manufacturer Guides' },
    { ar: 'جداول تتبع المخزون', en: 'Inventory Tracking Spreadsheets' },
    { ar: 'بطاقات شكر للعملاء (Inserts)', en: 'Customer Thank You Cards (Inserts)' },
    { ar: 'نصوص خدمة العملاء للرد', en: 'Customer Service Response Scripts' },
    { ar: 'استراتيجيات البيع المتقاطع', en: 'Cross-Selling Strategies' },
    { ar: 'حاسبات تسعير المنتجات', en: 'Product Pricing Calculators' },
    { ar: 'أدلة تصوير المنتجات بالهاتف', en: 'Smartphone Product Photography Guides' },
    { ar: 'قوائم استهدافات الإعلانات', en: 'Ad Targeting Lists' },
    { ar: 'قوائم فحص متاجر تيك توك', en: 'TikTok Shop Checklists' },
    { ar: 'تقويم العروض الموسمية', en: 'Seasonal Promotion Calendars' }
  ],
  tech: [
    { ar: 'مكتبات الأكواد الجاهزة (Snippets)', en: 'Code Snippet Libraries' },
    { ar: 'هياكل المشاريع (Boilerplates)', en: 'Project Boilerplates' },
    { ar: 'أدوات سطر الأوامر (CLI)', en: 'Command Line Tools (CLI)' },
    { ar: 'ملازم سريعة (Cheat Sheets)', en: 'Quick Cheat Sheets' },
    { ar: 'حزم تأسيس مشاريع الـ SaaS', en: 'SaaS Starter Kits' },
    { ar: 'مخططات قواعد البيانات', en: 'Database Schemas' },
    { ar: 'قوالب توثيق الواجهات (API)', en: 'API Documentation Templates' },
    { ar: 'ملفات إعداد Docker', en: 'Docker Configuration Files' },
    { ar: 'مسارات عمل GitHub Actions', en: 'GitHub Actions Workflows' },
    { ar: 'معالجات الربط (Webhooks)', en: 'Webhook Handlers' },
    { ar: 'قوالب اختبار الأكواد', en: 'Code Testing Templates' },
    { ar: 'لوحات تحكم برمجية (Dashboards)', en: 'Admin Dashboards' },
    { ar: 'سكربتات النشر التلقائي', en: 'Automated Deployment Scripts' },
    { ar: 'قوائم مراجعة جودة الكود', en: 'Code Quality Checklists' },
    { ar: 'مخططات البنية التحتية (Architecture)', en: 'Infrastructure Architecture Diagrams' }
  ]
};

const audiences = {
  marketing: { ar: 'أصحاب المشاريع، المسوقين، ورواد الأعمال الرقمية الذين يبحثون عن مضاعفة مبيعاتهم.', en: 'Business owners, marketers, and digital entrepreneurs looking to double their sales.' },
  design: { ar: 'المصممين، وكالات الدعاية، وأصحاب المتاجر الذين يبحثون عن مظهر احترافي لعلاماتهم.', en: 'Designers, advertising agencies, and store owners looking for a professional look for their brands.' },
  coaching: { ar: 'المدربين، المستشارين، والأشخاص المهتمين بالتطوير الذاتي وتحقيق أهدافهم.', en: 'Coaches, consultants, and individuals interested in self-development and achieving their goals.' },
  ecom: { ar: 'أصحاب المتاجر الإلكترونية، تجار الدروبشيبينغ، والباحثين عن الاستقلال المالي.', en: 'E-commerce store owners, dropshippers, and those seeking financial independence.' },
  tech: { ar: 'المبرمجين، مؤسسي الـ SaaS، والشركات التقنية الناشئة لتقليل وقت التطوير.', en: 'Programmers, SaaS founders, and tech startups looking to reduce development time.' }
};

function generateIdea(typeId, nicheId, effortId, topic, index) {
    let topicAr = topic.ar;
    let topicEn = topic.en;
    
    let prefixAr = ''; let prefixEn = '';
    let priceAr = ''; let priceEn = '';
    let effortDescAr = ''; let effortDescEn = '';
    
    if (effortId === 'easy') {
        prefixAr = ['كتيب: ', 'قائمة: ', 'ملف: ', 'حزمة بسيطة لـ '][index % 4];
        prefixEn = ['Booklet: ', 'Checklist: ', 'File: ', 'Simple Kit for '][index % 4];
        priceAr = ['9$ - 19$', 'مجاني (Lead Magnet)', '5$ - 10$'][index % 3];
        priceEn = ['$9 - $19', 'Free (Lead Magnet)', '$5 - $10'][index % 3];
        effortDescAr = 'سهل وسريع الإعداد بمساعدة أدوات الذكاء الاصطناعي.';
        effortDescEn = 'Quick and easy to set up with the help of AI tools.';
    } else if (effortId === 'medium') {
        prefixAr = ['دليل شامل: ', 'قالب احترافي: ', 'كورس مصغر: ', 'نظام عمل: '][index % 4];
        prefixEn = ['Comprehensive Guide: ', 'Pro Template: ', 'Mini Course: ', 'System: '][index % 4];
        priceAr = ['29$ - 49$', '19$ - 39$', '49$ - 99$'][index % 3];
        priceEn = ['$29 - $49', '$19 - $39', '$49 - $99'][index % 3];
        effortDescAr = 'يتطلب بعض الوقت للتنظيم وإضافة خبراتك العملية.';
        effortDescEn = 'Requires some time to organize and add your practical expertise.';
    } else {
        prefixAr = ['برنامج متكامل: ', 'أكاديمية: ', 'نظام أتمتة: ', 'خدمة مخصصة: '][index % 4];
        prefixEn = ['Full Program: ', 'Academy: ', 'Automation System: ', 'Custom Service: '][index % 4];
        priceAr = ['99$ - 199$', '199$ - 499$', '500$+'][index % 3];
        priceEn = ['$99 - $199', '$199 - $499', '$500+'][index % 3];
        effortDescAr = 'مشروع عالي القيمة يتطلب تخطيط وتطوير عميق، ومثالي كمصدر دخل رئيسي.';
        effortDescEn = 'High-value project requiring deep planning, ideal as a primary income source.';
    }

    let typeDescAr = ''; let typeDescEn = '';
    if (typeId === 'plr') {
        typeDescAr = 'منتج جاهز بحقوق إعادة البيع (PLR/MRR)، يمكنك شراءه وتغيير الغلاف ووضع شعارك عليه ثم بيعه مباشرة.';
        typeDescEn = 'Ready-made product with resell rights (PLR/MRR). Buy it, rebrand and sell directly.';
    } else if (typeId === 'digital') {
        typeDescAr = 'منتج رقمي يحمل مرة واحدة ويباع مرات غير محدودة.';
        typeDescEn = 'Digital product created once and sold unlimited times.';
    } else if (typeId === 'template') {
        typeDescAr = 'قوالب جاهزة توفر ساعات من العمل وتصلح للاستخدام الفوري.';
        typeDescEn = 'Ready templates saving hours of work, suitable for instant use.';
    } else if (typeId === 'service') {
        typeDescAr = 'خدمة تقدم للعميل إما بشكل استشاري أو أتمتة مستمرة.';
        typeDescEn = 'Service provided either as consulting or ongoing automation.';
    }

    let nameAr = prefixAr + topicAr;
    let nameEn = prefixEn + topicEn;
    let sourceAr = 'صُنع باستخدام ChatGPT / Canva / Notion';
    let sourceEn = 'Made with ChatGPT / Canva / Notion';
    const audience = audiences[nicheId];

    return {
        id: `idea_${typeId}_${nicheId}_${effortId}_${index}`,
        name_ar: nameAr,
        name_en: nameEn,
        price_ar: priceAr,
        price_en: priceEn,
        source_ar: sourceAr,
        source_en: sourceEn,
        desc_ar: `هذا المنتج يركز على تزويد العميل بـ "${topicAr}" بأعلى جودة ممكنة. ${typeDescAr} ${effortDescAr}`,
        desc_en: `This product focuses on providing the client with the highest quality "${topicEn}". ${typeDescEn} ${effortDescEn}`,
        audience_ar: audience.ar,
        audience_en: audience.en,
        features_ar: [
            `توفير الوقت والجهد على العميل عبر توفير ${topicAr} جاهز للاستخدام أو التطبيق.`,
            `تصميم وإعداد قابل للتخصيص ليتناسب مع احتياجات كل فرد.`,
            `يأتي مع تعليمات مبسطة أو دليل استخدام يضمن تحقيق أقصى استفادة.`,
            typeId === 'service' ? 'دخل شهري متكرر وعلاقة مستمرة مع العميل.' : 'إمكانية تحقيق دخل سلبي (Passive Income) بمجرد رفع المنتج للبيع.'
        ],
        features_en: [
            `Saving the client's time and effort by providing a ready-to-use ${topicEn}.`,
            `Customizable design and setup tailored to individual needs.`,
            `Comes with simplified instructions or a user guide ensuring maximum benefit.`,
            typeId === 'service' ? 'Recurring monthly revenue and an ongoing client relationship.' : 'Potential to achieve passive income simply by listing the product for sale.'
        ],
        tips_ar: [
            `أضف لمستك الشخصية وهوية علامتك التجارية حتى لو كان المنتج جاهزاً لزيادة الثقة.`,
            `قم بتسعير المنتج بناءً على "القيمة المضافة والنتائج" وليس فقط الجهد المبذول في إعداده.`,
            `استخدم وسائل التواصل (Instagram/TikTok) لعرض أجزاء مجانية من ${topicAr} كتشويق لجذب العملاء.`
        ],
        tips_en: [
            `Add your personal touch and brand identity, even to ready-made products, to build trust.`,
            `Price the product based on "added value and results", not just the effort put into making it.`,
            `Use social media (Instagram/TikTok) to showcase free snippets of ${topicEn} to attract clients.`
        ]
    };
}

export const seedProductIdeasV2 = async () => {
  console.log('🌱 Generating Product Ideas V2 Matrix dynamically...');
  let count = 0;

  await setDoc(doc(db, COL, 'structure_def'), { id: 'structure_def', productTypes, niches, effortLevels });

  for (const type of productTypes) {
    for (const niche of niches) {
      for (const effort of effortLevels) {
        const docId = `${type.id}_${niche.id}_${effort.id}`;
        
        const ideas = [];
        const topics = baseTopics[niche.id] || [];
        // Generate exactly 15 ideas per combination
        for (let i = 0; i < 15; i++) {
            ideas.push(generateIdea(type.id, niche.id, effort.id, topics[i], i));
        }

        await setDoc(doc(db, COL, docId), {
          id: docId, 
          type: type.id, 
          niche: niche.id, 
          effort: effort.id,
          ideas: ideas, 
          updatedAt: new Date().toISOString(),
        });
        count++;
      }
    }
  }
  console.log(`✅ Seeded ${count} Product Idea Scenarios (with 15 ideas each) to '${COL}'`);
  return count;
};

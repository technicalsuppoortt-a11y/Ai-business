import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const NICHES_COLLECTION = 'niches';

export const getNiches = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, NICHES_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting niches: ', error);
    return [];
  }
};

// Seed function to populate Firestore if it's empty
export const seedNiches = async () => {
  const initialNiches = [
    {
      id: 'ai',
      label_ar: 'الذكاء الاصطناعي',
      label_en: 'Artificial Intelligence',
      icon: '🤖',
      ideas_ar: [
        'وكالة تسويق AI Influencers',
        'تطوير نماذج لغوية متخصصة للمجالات (Domain LLMs)',
        'أمن الذكاء الاصطناعي والدفاع ضد التزييف العميق',
        'حلول أنظمة الوكيل الذكي (Agentic AI)',
        'تحسين محركات البحث للذكاء الاصطناعي (GEO)',
        'أتمتة سير العمل بالذكاء الاصطناعي للشركات',
        'خدمات التعليق الصوتي والدبلجة بالـ AI',
        'تحليل البيانات والتوقعات بالذكاء الاصطناعي',
        'صناعة الفيديو والوسائط الاصطناعية بالـ AI',
        'استشارات وهندسة الأوامر (Prompt Engineering)',
        'بوتات دردشة مخصصة للمجال الطبي أو القانوني',
        'توليد الصور بالذكاء الاصطناعي للبراندات',
        'أدوات التعليم المخصص بالذكاء الاصطناعي',
        'تدقيق الأخلاقيات والامتثال لأنظمة AI',
        'تطوير برمجيات سحابية (SaaS) مدعومة بـ AI'
      ],
      ideas_en: [
        'AI Influencer Marketing Agency',
        'Domain-Specific LLM Development',
        'AI Security & Deepfake Defense',
        'Agentic AI Solutions',
        'Generative Engine Optimization (GEO)',
        'AI Workflow Automation for Business',
        'AI Voiceover & Multilingual Dubbing',
        'AI Data Analysis & Predictive Insights',
        'AI Video Creation & Synthetic Media',
        'Prompt Engineering & Consulting',
        'Custom AI Chatbot for Medical/Legal',
        'AI Image Generation for Branding',
        'AI Personalized Education Tools',
        'Ethics & AI Compliance Auditing',
        'AI-Powered SaaS Development'
      ]
    },
    {
      id: 'business',
      label_ar: 'البزنس والتدريب',
      label_en: 'Business & Training',
      icon: '💼',
      ideas_ar: [
        'إطلاق الكورسات عالية القيمة (High Ticket)',
        'خدمات المدير التشغيلي بنظام الكسر (Fractional COO)',
        'أنظمة وثقافة العمل عن بعد للشركات',
        'براندينج شخصي للمدراء التنفيذيين',
        'عروض الشركات الناشئة وجذب الاستثمارات',
        'استراتيجية وبناء منظومة المنتجات الرقمية',
        'أنظمة أتمتة المبيعات للشركات B2B',
        'تحول الأعمال المستدام والأخضر',
        'استراتيجية ونمو الشركات البرمجية المصغرة',
        'استراتيجية نجاح العملاء والاحتفاظ بهم',
        'عافية الشركات والوقاية من الاحتراق الوظيفي',
        'استشارات تحسين سلاسل الإمداد',
        'استراتيجية دمج الذكاء الاصطناعي في فرق العمل',
        'الربح من حقوق الملكية الفكرية وبراءات الاختراع',
        'التحضير لبيع الشركات والاندماج والاستحواذ'
      ],
      ideas_en: [
        'High-Ticket Online Course Launch',
        'Fractional COO/CMO Services',
        'Remote Team Culture & Systems',
        'Executive Personal Branding',
        'Startup Pitch Deck & Fundraising',
        'Digital Product Strategy & Ecosystems',
        'B2B Sales Automation Systems',
        'Sustainable Business Transformation',
        'Micro-SaaS Strategy & Growth',
        'Customer Success & Retention Strategy',
        'Corporate Wellness & Burnout Prevention',
        'Supply Chain Optimization Consulting',
        'AI Integration Strategy for Teams',
        'Intellectual Property Monetization',
        'Business Exit & M&A Preparation'
      ]
    },
    {
      id: 'marketing',
      label_ar: 'التسويق والفريلانس',
      label_en: 'Marketing & Freelance',
      icon: '📢',
      ideas_ar: [
        'تحسين الظهور في محركات بحث الذكاء الاصطناعي',
        'استراتيجية محتوى UGC للتيك توك والريلز',
        'التسويق عبر الإيميل فائق التخصيص',
        'نمو وتحقيق الربح من البودكاست',
        'تسويق Pinterest لمتاجر التجارة الإلكترونية',
        'إدارة ونمو المجتمعات الرقمية',
        'كتابة الإعلانات بنظام الاستجابة المباشرة',
        'إدارة علاقات المؤثرين للبراندات',
        'إدارة الإعلانات المدفوعة (Paid Media)',
        'تصميم وهيكلة أقماع البيع (Sales Funnels)',
        'إعادة تدوير المحتوى وتوزيعه بكثافة',
        'بناء قصة البراند والسرد القصصي',
        'تحسين محركات البحث للشركات المحلية (Local SEO)',
        'صناعة فيديوهات البيع الاستراتيجية (VSL)',
        'رصد السوشيال ميديا وتحليل الانطباعات'
      ],
      ideas_en: [
        'Generative Engine Optimization (GEO)',
        'UGC Content Strategy for TikTok/Reels',
        'Hyper-Personalized Email Marketing',
        'Podcast Growth & Monetization',
        'Pinterest Marketing for E-commerce',
        'Community Management & Growth',
        'Direct Response Copywriting',
        'Influencer Relationship Management',
        'Paid Media Management (Ads)',
        'Sales Funnel Architecture',
        'Content Atomization & Repurposing',
        'Brand Narrative & Storytelling',
        'SEO for Local Businesses',
        'Video Sales Letter (VSL) Creation',
        'Social Media Listening & Insights'
      ]
    },
    {
      id: 'fitness',
      label_ar: 'اللياقة والصحة',
      label_en: 'Fitness & Health',
      icon: '💪',
      ideas_ar: [
        'كوتشينج طول العمر والبايوهاكينج (Longevity)',
        'اللياقة الذهنية والعافية العصبية',
        'التدريب المتوافق مع الدورة الشهرية للنساء',
        'اللياقة البدنية للمهنيين العاملين عن بعد',
        'تأهيل ما بعد الإصابات وحركية الجسم',
        'التغذية النباتية للأداء الرياضي العالي',
        'تدريب القوة الوظيفي للحياة اليومية',
        'متخصص الحركية وصحة المفاصل (Mobility)',
        'اللياقة البدنية لمستخدمي أدوية التخسيس',
        'كوتشينج تحسين جودة النوم (Sleep Coach)',
        'إدارة التوتر من خلال الحركة والرياضة',
        'برامج اللياقة البدنية والنشاط للشركات',
        'اللياقة البدنية التكتيكية (شرطة وجيش)',
        'القوة والحركة لكبار السن (Seniors)',
        'تطوير الأداء الرياضي للناشئين والشباب'
      ],
      ideas_en: [
        'Longevity & Biohacking Coaching',
        'Mental Fitness & Neurowellness',
        'Cycle-Synced Training for Women',
        'Fitness for Remote Professionals',
        'Post-Injury Rehab & Movement',
        'Plant-Based High Performance Nutrition',
        'Functional Strength Training',
        'Mobility & Joint Health Specialist',
        'Fitness for GLP-1/Weight Loss Meds',
        'Sleep Optimization Coaching',
        'Stress Management through Movement',
        'Corporate Fitness Programs',
        'Tactical Fitness (Police/Military)',
        'Seniors Strength & Mobility',
        'Youth Athletic Development'
      ]
    },
    {
      id: 'realestate',
      label_ar: 'العقارات والتمويل',
      label_en: 'Real Estate & Finance',
      icon: '🏠',
      ideas_ar: [
        'الربح من تأجير العقارات (Airbnb Arbitrage)',
        'بيع العقارات المتنازع عليها أو المتعثرة',
        'الاستثمار العقاري المجزأ (Fractional)',
        'ضرائب العملات الرقمية والامتثال المالي',
        'تطوير المنازل المستدامة والموفرة للطاقة',
        'التأثيث الافتراضي للوكلاء العقاريين',
        'وكالة تسويق متخصصة للمشاريع العقارية',
        'استراتيجية العقارات التجارية متعددة الوحدات',
        'متخصص انتقال العسكريين والمحاربين القدامى',
        'تطوير حلول التكنولوجيا العقارية (PropTech)',
        'الثقافة المالية للجيل الجديد والمراهقين',
        'استراتيجية الاستثمار في وحدات التخزين الذاتي',
        'الأسواق العقارية الفاخرة والمطلة على البحر',
        'تحليل صناديق الاستثمار العقاري (REITs)',
        'شراء وتطوير وبيع الأراضي (Land Flipping)'
      ],
      ideas_en: [
        'Airbnb Arbitrage & Short-term Rentals',
        'Probate & Distressed Property Sales',
        'Fractional Real Estate Investing',
        'Crypto Tax & Assets Compliance',
        'Sustainable & Passive House Dev',
        'Virtual Staging for Realtors',
        'Real Estate Marketing Agency',
        'Commercial Multi-family Strategy',
        'Military & Veteran Relocation Specialist',
        'PropTech Solutions Development',
        'Financial Literacy for Gen Z/Teens',
        'Self-Storage Investment Strategy',
        'Waterfront & Luxury Niche Markets',
        'Real Estate Investment Trust (REIT) Analysis',
        'Land Flipping & Development'
      ]
    },
    {
      id: 'creative',
      label_ar: 'الفنون والإبداع',
      label_en: 'Arts & Creative',
      icon: '🎨',
      ideas_ar: [
        'صناعة الأدوات الرقمية للمبدعين (فرش وقوالب)',
        'تصميم البراندات القائم على الفنون اليدوية',
        'التصميم الداخلي الحيوي (دمج الطبيعة)',
        'الرسم القصصي والتوضيحي القائم على السرد',
        'تصميم واجهات الويب 3 والميتافيرس',
        'تحريك ستوب موشن والأنيميشن الإبداعي',
        'الخط العربي في الهويات البصرية الحديثة',
        'التصميم للطباعة ثلاثية الأبعاد والنماذج',
        'الكتابة الإبداعية وبناء العوالم القصصية',
        'التصوير الفني والسرد البصري',
        'الفن التوليدي والبرمجة الإبداعية',
        'تصميم الأزياء والمنسوجات المستدام',
        'تصميم الألعاب وفن المفاهيم (Concept Art)',
        'تصميم العبوات وتجربة فتح المنتج',
        'فنون التجهيزات التفاعلية'
      ],
      ideas_en: [
        'Digital Tool Creation for Creatives',
        'Tactile & Craft-Based Brand Design',
        'Biophilic Interior Design',
        'Story-Driven Illustration & Narrative',
        'UI/UX Design for Web3 & Metaverse',
        'Stop-Motion & Creative Animation',
        'Arabic Calligraphy in Modern Branding',
        '3D Printing Design & Prototyping',
        'Creative Writing & World Building',
        'Artistic Photography & Visual Storytelling',
        'Generative Art & Creative Coding',
        'Sustainable Fashion & Textile Design',
        'Game Design & Concept Art',
        'Package Design & Unboxing Experience',
        'Interactive Installation Art'
      ]
    }
  ];

  for (const niche of initialNiches) {
    await setDoc(doc(db, NICHES_COLLECTION, niche.id), niche);
  }
};

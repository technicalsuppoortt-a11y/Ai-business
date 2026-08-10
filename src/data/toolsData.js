import {
  Target,
  Monitor,
  FileText,
  Scale,
  Link,
  Mail,
  Package,
  Calculator,
  Share2,
  Map,
  Film,
  Rocket,
  Bot,
  Globe,
  Radar
} from 'lucide-react';

export const TOOLS_24H = [
  { 
    id: 'analysis-identity', label_ar: 'التحليل والهوية', label_en: 'Analysis & Identity', icon: Target, section: 'tools', group_ar: 'التحليل والهوية', group_en: 'Analysis & Identity',
    liveAiFeatures: [
      { key: 'costNicheAutoGenerate', label_en: 'Niche Auto Generate', label_ar: 'التوليد التلقائي (Niche)', defaultCost: 10, groupHeader_ar: 'تحديد النيش', groupHeader_en: 'Niche Selection' },
      { key: 'costMicroNicheIdea', label_en: 'Micro-Niche Idea Generate', label_ar: 'أفكار المايكرو نيش', defaultCost: 15, groupHeader_ar: 'تحديد النيش', groupHeader_en: 'Niche Selection' },
      { key: 'costSubnicheAutoGenerate', label_en: 'Subniche Auto Generate', label_ar: 'التوليد التلقائي (Subniche)', defaultCost: 10, groupHeader_ar: 'تحديد النيش', groupHeader_en: 'Niche Selection' },
      { key: 'costDeepStrategicAnalysis', label_en: 'Deep Strategic Analysis', label_ar: 'التحليل الاستراتيجي العميق', defaultCost: 50, groupHeader_ar: 'تحديد النيش', groupHeader_en: 'Niche Selection' },
      { key: 'costBrandNamingStudio', label_en: 'Brand Naming Studio', label_ar: 'استوديو ابتكار الأسماء', defaultCost: 25, groupHeader_ar: 'بناء واستوديو الهوية', groupHeader_en: 'Identity Studio' },
      { key: 'costVisualIdentity', label_en: 'Visual Identity', label_ar: 'الهوية البصرية', defaultCost: 35, groupHeader_ar: 'بناء واستوديو الهوية', groupHeader_en: 'Identity Studio' }
    ]
  },
  { 
    id: 'website-construction', label_ar: 'بناء وتجهيز الموقع', label_en: 'Website Setup & Build', icon: Monitor, section: 'tools', group_ar: 'بناء وتجهيز المتجر', group_en: 'Store Setup',
    liveAiFeatures: [
      { key: 'costWebsiteConstruction', label_en: 'Smart Website Builder', label_ar: 'المبني الذكي للموقع', defaultCost: 50 }
    ]
  },
  { 
    id: 'landing-page-content', label_ar: 'محتوى الموقع', label_en: 'Page Content', icon: FileText, section: 'tools', group_ar: 'بناء وتجهيز المتجر', group_en: 'Store Setup',
    liveAiFeatures: [
      { key: 'costLandingPageContent', label_en: 'Generate Page Content', label_ar: 'توليد محتوى الصفحة', defaultCost: 30 }
    ]
  },
  { id: 'legal-pages', label_ar: 'الصفحات القانونية', label_en: 'Legal Pages', icon: Scale, section: 'tools', group_ar: 'بناء وتجهيز المتجر', group_en: 'Store Setup' },
  { id: 'social-integration', label_ar: 'ربط السوشيال', label_en: 'Social Integration', icon: Link, section: 'tools', group_ar: 'بناء وتجهيز المتجر', group_en: 'Store Setup' },
  { id: 'email-setup', label_ar: 'التسويق عبر الإيميل', label_en: 'Email Marketing', icon: Mail, section: 'tools', group_ar: 'بناء وتجهيز المتجر', group_en: 'Store Setup' },
  { 
    id: 'product-source', label_ar: 'مصدر المنتج', label_en: 'Product Source', icon: Package, section: 'tools', group_ar: 'المنتج والربحية', group_en: 'Product & Profit',
    liveAiFeatures: [
      { key: 'costProductSource', label_en: 'Etsy Top Ideas Generate', label_ar: 'توليد أفكار المنتجات', defaultCost: 20 },
      { key: 'costBuildMyVersion', label_en: 'Build My Version', label_ar: 'إنشاء نسختي', defaultCost: 10 }
    ]
  },
  { 
    id: 'profit-calculator', label_ar: 'حاسبة الأرباح', label_en: 'Profit Calculator', icon: Calculator, section: 'tools', group_ar: 'المنتج والربحية', group_en: 'Product & Profit',
    liveAiFeatures: [
      { key: 'costDailyFunnel', label_en: 'Daily Funnel Engine', label_ar: 'محرك القمع اليومي', defaultCost: 10 },
      { key: 'costMonthlyGoalPlanner', label_en: 'Monthly Goal Planner', label_ar: 'مخطط الأهداف الشهرية', defaultCost: 10 }
    ]
  },
  { 
    id: 'social-media', label_ar: 'منصة السوشيال ميديا', label_en: 'Social Media', icon: Share2, section: 'tools', group_ar: 'المحتوى والتسويق', group_en: 'Content & Marketing',
    liveAiFeatures: [
      { key: 'costScriptWriter', label_en: 'Script Writer', label_ar: 'كاتب السكريبت', defaultCost: 15 },
      { key: 'costCaptionGenerator', label_en: 'Caption Generator', label_ar: 'كاتب الكابشن', defaultCost: 10 },
      { key: 'costViralReels', label_en: 'Viral Reels Studio', label_ar: 'استوديو الريلز', defaultCost: 20 },
      { key: 'costContentRepurposer', label_en: 'Content Rewriter', label_ar: 'إعادة صياغة المحتوى', defaultCost: 10 },
      { key: 'costQaGenerator', label_en: 'Q&A Generator', label_ar: 'توليد الأسئلة والأجوبة', defaultCost: 10 },
      { key: 'costIdeaLab', label_en: 'Idea Lab', label_ar: 'مختبر الأفكار', defaultCost: 15 },
      { key: 'costTrends', label_en: 'Trends Tracker', label_ar: 'متتبع التريندات', defaultCost: 15 },
      { key: 'costSocialMedia', label_en: 'General Social AI', label_ar: 'الذكاء العام للسوشيال', defaultCost: 3 }
    ]
  },
  { 
    id: 'marketing-plan', label_ar: 'مخطط الحملات', label_en: 'Campaign planner', icon: Map, section: 'tools', group_ar: 'المحتوى والتسويق', group_en: 'Content & Marketing',
    liveAiFeatures: [
      { key: 'costMarketingPlan', label_en: 'Generate Marketing Plan', label_ar: 'توليد خطة التسويق', defaultCost: 35 }
    ]
  },
  { 
    id: 'ad-creative', label_ar: 'أفكار الإعلانات', label_en: 'Ad Creative', icon: Film, section: 'tools', group_ar: 'المحتوى والتسويق', group_en: 'Content & Marketing',
    liveAiFeatures: [
      { key: 'costAdCreative', label_en: 'Generate Ad Ideas', label_ar: 'توليد أفكار الإعلانات', defaultCost: 25 }
    ]
  },
  { id: 'campaign-launch', label_ar: 'إطلاق الحملة', label_en: 'Campaign Launch', icon: Rocket, section: 'tools', group_ar: 'المحتوى والتسويق', group_en: 'Content & Marketing' },
  { 
    id: 'tracking', label_ar: 'التسويق والتتبع', label_en: 'Marketing & Tracking', icon: Radar, section: 'tools', group_ar: 'المحتوى والتسويق', group_en: 'Content & Marketing',
  },
  { 
    id: 'smart-ai-assistant', label_ar: 'المساعد الذكي', label_en: 'AI Assistant', icon: Bot, section: 'tools', group_ar: 'إدارة وتشغيل', group_en: 'Management & Ops',
    liveAiFeatures: [
      { key: 'costSmartAiAssistant', label_en: 'General AI Queries', label_ar: 'استفسارات الذكاء الاصطناعي', defaultCost: 5 }
    ]
  },
  { id: 'external-tools', label_ar: 'أدوات خارجية', label_en: 'External Tools', icon: Globe, section: 'tools', group_ar: 'إدارة وتشغيل', group_en: 'Management & Ops' },
];

export const TOOLS_CONTENT = {
  'analysis-identity': {
    title_ar: 'التحليل والهوية',
    title_en: 'Analysis & Identity',
    description_ar: 'اختر نيش مشروعك، ابتكار اسم براند فخم، وحدد ألوان هويتك البصرية في مكان واحد.',
    description_en: 'Select your project niche, generate a premium brand name, and define your identity colors all in one place.',
    type: 'analysis-identity',
  },
  'website-construction': {
    title_ar: 'بناء وتجهيز الموقع',
    title_en: 'Website Construction & Setup',
    description_ar: '3 خطوات أساسية: تصميم الموقع، ضبط الإعدادات العامة، وإعداد البنية التحتية المتكاملة.',
    description_en: '3 essential steps: Website Design, General Settings, and full Infrastructure Setup.',
    type: 'build-method',
  },
  'landing-page-content': {
    title_ar: 'محتوى صفحة الهبوط (Content)',
    title_en: 'Landing Page Content',
    description_ar: 'اكتب المحتوى الذي يحول الزوار إلى عملاء دائمين.',
    description_en: 'Write content that converts visitors into permanent customers.',
    steps_ar: [
      'رفع صور وملفات المنتج على الموقع',
      'كتابة الوصف التسويقي (مميزات، فوائد، ضمان)',
      'نشر الصفحة والتأكد من أنها Live'
    ],
    steps_en: [
      'Upload product images and files to the site',
      'Write marketing description (features, benefits, guarantee)',
      'Publish the page and confirm it is live'
    ]
  },
  'legal-pages': {
    title_ar: 'المصداقية والصفحات القانونية',
    title_en: 'Credibility & Legal Pages',
    description_ar: 'احمِ نفسك وابنِ ثقة مع عملائك بالصفحات القانونية الأساسية.',
    description_en: 'Protect yourself and build trust with customers through essential legal pages.',
    steps_ar: [
      'إنشاء صفحة سياسة الخصوصية',
      'إنشاء صفحة الشروط والأحكام',
      'إضافة سياسة الاسترجاع'
    ],
    steps_en: [
      'Create Privacy Policy page',
      'Create Terms & Conditions page',
      'Add Refund Policy'
    ]
  },
  'social-integration': {
    title_ar: 'ربط السوشيال ميديا',
    title_en: 'Social Media Integration',
    description_ar: 'اربط متجرك بمنصات التواصل لتتبع النتائج.',
    description_en: 'Connect your store to social platforms to track results.',
    steps_ar: [
      'ربط حسابات فيسبوك وانستجرام بـ UpKlick',
      'إضافة كود البيكسل (Pixel/Tracking)'
    ],
    steps_en: [
      'Connect Facebook and Instagram accounts to UpKlick',
      'Add Pixel/Tracking code'
    ]
  },
  'email-setup': {
    title_ar: 'التسويق عبر الإيميل والأتمتة (Email Marketing)',
    title_en: 'Email Marketing & Automation',
    description_ar: 'تصميم قوالب الإيميل، إطلاق حملات أتمتة الرسائل الجماعية، وتوثيق سجلات الدومين.',
    description_en: 'Design email templates, launch automated bulk campaigns, and authenticate domain DNS records.',
    steps_ar: [
      'إعداد وتوثيق الدومين للإرسال',
      'إنشاء قوائم المشتركين'
    ],
    steps_en: [
      'Configure and authenticate domain for sending',
      'Create subscriber lists'
    ]
  },
  'product-source': {
    title_ar: 'مصدر المنتج',
    title_en: 'Product Source',
    description_ar: 'من أين ستحصل على منتجك الرقمي؟',
    description_en: 'Where will you get your digital product from?',
    links: [
      { label: 'Etsy (شراء وإعادة بيع)', url: 'https://www.etsy.com' },
      { label: 'Digital Kanz Drive', url: 'https://drive.google.com' }
    ]
  },
  'profit-calculator': {
    title_ar: 'حاسبة الأرباح الذكية',
    title_en: 'Smart Profit Calculator',
    description_ar: 'احسب أرباحك الصافية بعد خصم تكاليف الإعلانات.',
    description_en: 'Calculate your net profits after deducting advertising costs.',
    type: 'calculator',
  },
  'social-presence': {
    title_ar: 'حسابات السوشيال ميديا',
    title_en: 'Social Media Presence',
    description_ar: 'تأكد من وجود براندك على جميع المنصات المهمة.',
    description_en: 'Make sure your brand is present on all important platforms.',
    steps: ['Facebook Page', 'Instagram', 'TikTok', 'YouTube Channel']
  },
  'content-factory': {
    title_ar: 'مصنع المحتوى (6 تصميمات)',
    title_en: 'Content Factory (6 Designs)',
    description_ar: 'أفكار محتوى جاهزة للنيش الخاص بك.',
    description_en: 'Ready content ideas tailored for your niche.',
    type: 'dynamic-content',
    category: 'design'
  },
  'social-media': {
    title_ar: 'منصة السوشيال ميديا الشاملة',
    title_en: 'Social Media Hub',
    description_ar: 'تأسيس استراتيجية الحسابات وإنتاج المحتوى الاحترافي المخصص لجميع المنصات.',
    description_en: 'Social media strategy setup and customized professional content factory.',
    type: 'social-media'
  },


  'marketing-plan': {
    title_ar: 'مخطط الحملات',
    title_en: 'Campaign planner',
    description_ar: 'خطة تسويق مفصلة مع الاستهداف والميزانية.',
    description_en: 'Detailed marketing plan with targeting and budget.',
    type: 'marketing-generator',
  },
  'ad-creative': {
    title_ar: 'أفكار الإعلانات (Creative)',
    title_en: 'Ad Creative Ideas',
    description_ar: 'أفكار إبداعية لإعلاناتك القادمة.',
    description_en: 'Creative ideas for your upcoming ads.',
    type: 'dynamic-content',
    category: 'ads'
  },
  'campaign-launch': {
    title_ar: 'إطلاق الحملة الإعلانية',
    title_en: 'Campaign Launch',
    description_ar: 'الخطوة الأخيرة: أطلق مشروعك للعالم.',
    description_en: 'The final step: launch your project to the world.',
    type: 'launch-pad',
  },
  'smart-ai-assistant': {
    title_ar: 'المساعد الذكي (AI)',
    title_en: 'Smart AI Assistant',
    description_ar: 'خطوتك الأولى لتخصيص المنصة. ولد الإعلانات، خطط المحتوى، والردود بضغطة واحدة.',
    description_en: 'Your first step to customizing the platform. Generate ads, content plans, and replies with one click.',
    type: 'ai-generator',
  },
  'platform-radar': {
    title_ar: 'رادار المنصات الكامل',
    title_en: 'Full Platform Radar',
    description_ar: 'كل منصات الفريلانس في العالم — مصنفة حسب مستواك ومنطقتك.',
    description_en: 'All freelance platforms in the world — categorized by your level and region.',
    type: 'freelance-tool',
  },
  'freelance-profile': {
    title_ar: 'الملف المهني الذكي',
    title_en: 'Smart Freelance Profile',
    description_ar: 'حدد هويتك المهنية وولد نبذة تعريفية (Bio) احترافية بالذكاء الاصطناعي.',
    description_en: 'Define your professional identity and generate a professional bio using AI.',
    type: 'freelance-tool',
  },
  'freelance-pricing': {
    title_ar: 'حاسبة التسعير الاستراتيجية',
    title_en: 'Strategic Pricing Calculator',
    description_ar: 'احسب سعرك الأدنى بناءً على هدفك المالي والوقت المتاح ودولتك.',
    description_en: 'Calculate your minimum price based on your financial goal, available time, and country.',
    type: 'freelance-tool',
  },
  'skills-crafting': {
    title_ar: 'صياغة المهارات بأسلوب بيعي',
    title_en: 'Skills Crafting (Sales Style)',
    description_ar: 'العميل يشتري النتائج، مش المهارات. اختر مهاراتك وسنحولها لعروض قيمة.',
    description_en: 'Clients buy results, not skills. Choose your skills and we\'ll turn them into value propositions.',
    type: 'freelance-tool',
  },
  'portfolio-builder': {
    title_ar: 'معرض الأعمال — دراسات الحالة',
    title_en: 'Portfolio Builder — Case Studies',
    description_ar: 'حوّل أي مشروع سابق لقصة نجاح تبيع نفسها أمام العميل.',
    description_en: 'Turn any past project into a success story that sells itself to clients.',
    type: 'freelance-tool',
  },
  'proposal-sniper': {
    title_ar: 'قناص العروض (Proposal Sniper)',
    title_en: 'Proposal Sniper',
    description_ar: 'الصق إعلان الوظيفة — يحلله ويشخص العميل ويكتب عرضاً بصوتك بدقة خارقة.',
    description_en: 'Paste the job listing — it analyzes it, profiles the client, and writes a proposal in your voice with razor precision.',
    type: 'freelance-tool',
  },
  'interview-prep': {
    title_ar: 'التحضير للمقابلات',
    title_en: 'Interview Prep',
    description_ar: 'أسئلة ذكية تضعك في موضع القيادة أثناء المكالمة مع العميل.',
    description_en: 'Smart questions that put you in a leadership position during client calls.',
    type: 'freelance-tool',
  },
  'sales-templates': {
    title_ar: 'نماذج الردود والمبيعات',
    title_en: 'Sales & Response Templates',
    description_ar: 'ردود جاهزة لكل موقف — انسخ وعدّل.',
    description_en: 'Ready-made replies for every situation — copy and customize.',
    type: 'freelance-tool',
  },
  'brand-library': {
    title_ar: 'مكتبة المنتجات',
    title_en: 'Product Library',
    description_ar: 'استعرض الملفات المتاحة وقوالب الأتوميشن لتطوير عملك وحمل مستندات الـ PDF.',
    description_en: 'Browse available files, automation templates, and download PDF documents.',
    type: 'library',
  },
  'smart-notebook': {
    title_ar: 'دفتر الملاحظات الذكي',
    title_en: 'Note Book',
    description_ar: 'مساحة عمل متكاملة لحفظ ملاحظاتك، تنظيم أفكارك، وإدارة مهامك بكل احترافية.',
    description_en: 'A complete workspace to save notes, organize ideas, and manage tasks professionally.',
    type: 'notebook',
  },
  'external-tools': {
    title_ar: 'أدوات خارجية',
    title_en: 'External Tools',
    description_ar: 'روابط وأدوات خارجية مساعدة لإدارة وتشغيل أعمالك.',
    description_en: 'External tools and links to help manage and operate your business.',
    type: 'external-tools',
  }
};

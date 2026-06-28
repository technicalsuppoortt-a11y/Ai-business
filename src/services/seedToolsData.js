import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const TOOLS_COLLECTION = 'tool_data';

const toolsData = [
  // ================= Phase 2: Core Brand Tools =================
  {
    id: "niche-selection",
    content_ar: { title: "اختيار المجال (Niche)", subtitle: "اختر المجال الأنسب لخبراتك والمطلوب بقوة في السوق.", tips: ["اختر مجالاً تحبه وتفهم فيه", "تأكد من وجود طلب وقوة شرائية في السوق"] },
    content_en: { title: "Niche Selection", subtitle: "Choose the niche that best fits your expertise and market demand.", tips: ["Choose a niche you love and understand", "Ensure there is market demand and purchasing power"] },
    categories: [
      { id: "ai", label_ar: "الذكاء الاصطناعي", label_en: "AI", icon: "🤖" },
      { id: "business", label_ar: "البزنس والتدريب", label_en: "Business & Training", icon: "💼" },
      { id: "marketing", label_ar: "التسويق والفريلانس", label_en: "Marketing & Freelance", icon: "📢" },
      { id: "fitness", label_ar: "اللياقة والصحة", label_en: "Fitness & Health", icon: "💪" },
      { id: "realestate", label_ar: "العقارات", label_en: "Real Estate", icon: "🏠" },
      { id: "creative", label_ar: "الفنون والإبداع", label_en: "Creative Arts", icon: "🎨" }
    ],
    metadata: { timeEstimate: "10 - 20", accentColor: "#8B5CF6" }
  },
  {
    id: "brand-naming",
    content_ar: { title: "توليد اسم البراند", subtitle: "استخدم الذكاء الاصطناعي لتوليد اسم براند مميز ولا ينسى.", tips: ["اختر اسماً يسهل نطقه وكتابته", "تأكد من توفر الدومين (يفضل .com أو .net)"] },
    content_en: { title: "Brand Naming", subtitle: "Use AI to generate a memorable and unique brand name.", tips: ["Choose an easy-to-pronounce and spell name", "Check domain availability (preferably .com or .net)"] },
    categories: [
      { id: "modern", label_ar: "عصري وتكنولوجي", label_en: "Modern & Tech", icon: "🚀" },
      { id: "luxury", label_ar: "فخم وراقي", label_en: "Luxury & Premium", icon: "💎" },
      { id: "creative", label_ar: "مبتكر وفني", label_en: "Creative & Artistic", icon: "🎨" }
    ],
    metadata: { timeEstimate: "5 - 15", accentColor: "#EC4899" }
  },
  {
    id: "visual-identity",
    content_ar: { title: "الهوية البصرية", subtitle: "الألوان واللوجو هما أساس تصميم موقعك. اختر ألواناً تعكس شخصية البراند.", tips: ["اختر ألواناً تناسب سيكولوجية العميل المستهدف", "استخدم لونين إلى 3 ألوان كحد أقصى للحفاظ على الاحترافية"] },
    content_en: { title: "Visual Identity", subtitle: "Colors and logo are the foundation of your site design. Choose colors that reflect your brand personality.", tips: ["Choose colors that suit target customer psychology", "Use 2 to 3 colors maximum to maintain professionalism"] },
    options: [
      { name: "Neon", primary: "#06b6d4", secondary: "#0f172a" }, { name: "Purple", primary: "#8b5cf6", secondary: "#1e1b4b" }, { name: "Green", primary: "#10b981", secondary: "#064e3b" },
      { name: "Blue", primary: "#1e40af", secondary: "#f8fafc" }, { name: "Gold", primary: "#d4af37", secondary: "#171717" }, { name: "Orange", primary: "#f97316", secondary: "#fff7ed" }
    ],
    metadata: { timeEstimate: "15 - 30", accentColor: "#10B981" }
  },
  {
    id: "upklick-setup",
    content_ar: { title: "البنية التحتية (UpKlick)", subtitle: "قم بإعداد حسابك وربط الدومين الخاص بك ليكون موقعك جاهزاً للانطلاق.", tips: ["راجع بيانات التسجيل بدقة", "لا تتخطى فيديو ربط الدومين لتجنب الأخطاء التقنية"] },
    content_en: { title: "UpKlick Setup", subtitle: "Set up your account and connect your domain to get your site ready to launch.", tips: ["Review registration details carefully", "Do not skip the domain connection video to avoid technical errors"] },
    metadata: { timeEstimate: "10 - 20", accentColor: "#F59E0B" }
  },
  {
    id: "website-construction",
    content_ar: { title: "بناء الموقع", subtitle: "اختر طريقة بناء موقعك: هل تفضل السرعة عبر الذكاء الاصطناعي أم التحكم عبر القوالب الجاهزة؟", tips: ["الذكاء الاصطناعي ممتاز للبداية السريعة", "قوالب UpKlick مصممة لزيادة التحويلات (Conversion)"] },
    content_en: { title: "Website Construction", subtitle: "Choose your website building method: Do you prefer speed via AI or control via pre-made templates?", tips: ["AI is great for a quick start", "UpKlick templates are designed to increase conversions"] },
    metadata: { timeEstimate: "30 - 60", accentColor: "#3B82F6" }
  },

  // ================= Phase 3: Setup & Config Tools =================
  {
    id: "landing-page-content",
    content_ar: { title: "محتوى صفحة الهبوط", subtitle: "أضف النصوص والصور القوية التي ستقنع الزائر بالشراء.", tips: ["استخدم عناوين قصيرة ومباشرة", "ركز على الفوائد (Benefits) وليس الميزات (Features) فقط"] },
    content_en: { title: "Landing Page Content", subtitle: "Add the strong copy and images that will persuade visitors to buy.", tips: ["Use short and direct headlines", "Focus on benefits, not just features"] },
    checklist: [
      { id: "upload_images", label_ar: "رفع الصور عالية الجودة", label_en: "Upload High Quality Images" },
      { id: "write_copy", label_ar: "كتابة النصوص الإعلانية (Copywriting)", label_en: "Write Ad Copy" },
      { id: "publish_page", label_ar: "نشر الصفحة المحدثة", label_en: "Publish Updated Page" }
    ],
    metadata: { timeEstimate: "20 - 40", accentColor: "#F43F5E" }
  },
  {
    id: "legal-pages",
    content_ar: { title: "الصفحات القانونية", subtitle: "قم بإنشاء صفحات الشروط والخصوصية لحماية عملك قانونياً وكسب ثقة بوابات الدفع.", tips: ["ضرورية جداً لقبول الإعلانات (Facebook Ads)", "مطلوبة لربط بوابات الدفع مثل Stripe"] },
    content_en: { title: "Legal Pages", subtitle: "Create terms and privacy pages to protect your business and gain payment gateway trust.", tips: ["Crucial for ad approval (Facebook Ads)", "Required for Stripe integration"] },
    checklist: [
      { id: "privacy", label_ar: "إنشاء صفحة سياسة الخصوصية", label_en: "Create Privacy Policy Page" },
      { id: "terms", label_ar: "إنشاء صفحة الشروط والأحكام", label_en: "Create Terms & Conditions Page" },
      { id: "refund", label_ar: "إنشاء سياسة الاسترجاع (إذا لزم الأمر)", label_en: "Create Refund Policy Page (If needed)" }
    ],
    metadata: { timeEstimate: "10 - 15", accentColor: "#8B5CF6" }
  },
  {
    id: "upklick-settings",
    content_ar: { title: "الإعدادات العامة", subtitle: "تأكد من تحديث اللوجو، الألوان، واسم الموقع في إعدادات المنصة.", tips: ["تأكد من تحديث الـ Favicon", "أضف وصفاً دقيقاً للموقع لأجل الـ SEO"] },
    content_en: { title: "General Settings", subtitle: "Ensure logo, colors, and site name are updated in platform settings.", tips: ["Make sure to update Favicon", "Add an accurate meta description for SEO"] },
    checklist: [
      { id: "update_logo", label_ar: "تحديث الشعار والـ Favicon", label_en: "Update Logo and Favicon" },
      { id: "update_colors", label_ar: "اعتماد ألوان الهوية البصرية الأساسية", label_en: "Apply Visual Identity Colors" }
    ],
    metadata: { timeEstimate: "5 - 10", accentColor: "#10B981" }
  },
  {
    id: "chatbot-setup",
    content_ar: { title: "إعداد الشات بوت", subtitle: "قم بإعداد زر الواتساب أو الدردشة المباشرة لزيادة المبيعات من خلال الرد السريع.", tips: ["الرد السريع يزيد المبيعات بنسبة تصل لـ 40%", "تأكد من عمل الزر على الموبايل"] },
    content_en: { title: "Chatbot Setup", subtitle: "Set up WhatsApp or live chat to increase sales via quick responses.", tips: ["Fast replies increase sales up to 40%", "Ensure the button works well on mobile"] },
    checklist: [
      { id: "whatsapp", label_ar: "إضافة زر الواتساب العائم", label_en: "Add Floating WhatsApp Button" },
      { id: "train_bot", label_ar: "تدريب الردود الآلية المبدئية", label_en: "Train Basic Automated Replies" }
    ],
    metadata: { timeEstimate: "15 - 20", accentColor: "#22C55E" }
  },
  {
    id: "social-integration",
    content_ar: { title: "ربط السوشيال ميديا", subtitle: "اربط حسابات السوشيال ميديا والبيكسل لتتبع زوارك.", tips: ["البيكسل هو العقل المدبر لحملاتك الإعلانية", "الربط المبكر يجمع لك الداتا من اليوم الأول"] },
    content_en: { title: "Social Integration", subtitle: "Connect your social accounts and pixels to track your visitors.", tips: ["The Pixel is the brain of your ad campaigns", "Early connection gathers data from day 1"] },
    checklist: [
      { id: "pixel", label_ar: "ربط Facebook/TikTok Pixel", label_en: "Connect Facebook/TikTok Pixel" },
      { id: "social_links", label_ar: "إضافة روابط صفحات السوشيال ميديا", label_en: "Add Social Media Page Links" }
    ],
    metadata: { timeEstimate: "20 - 30", accentColor: "#3B82F6" }
  },
  {
    id: "email-setup",
    content_ar: { title: "إعدادات الإيميل", subtitle: "قم بربط إيميلك الاحترافي وضبط سجلات الـ DNS لضمان وصول رسائلك.", tips: ["استخدم إيميل باسم الدومين الخاص بك", "اختبر الإرسال قبل إطلاق الحملات"] },
    content_en: { title: "Email Setup", subtitle: "Connect your professional email and configure DNS records to ensure delivery.", tips: ["Use a domain-based custom email", "Test sending before launching campaigns"] },
    checklist: [
      { id: "dns_records", label_ar: "إضافة سجلات DNS الخاصة بالإيميل", label_en: "Add Email DNS Records" },
      { id: "email_list", label_ar: "إنشاء أول قائمة بريدية (Email List)", label_en: "Create First Email List" }
    ],
    metadata: { timeEstimate: "15 - 25", accentColor: "#F59E0B" }
  }
  // ================= Phase 4: Content & Marketing Tools =================
  {
    id: "product-source",
    content_ar: { title: "تجهيز المنتجات", subtitle: "حدد مصدر منتجاتك سواء كانت رقمية أو ملموسة وقم بإضافتها لمتجرك.", tips: ["المنتجات الرقمية هامش ربحها 100%", "تأكد من جودة صور المنتجات"] },
    content_en: { title: "Product Sourcing", subtitle: "Determine your product sources (digital or physical) and add them to your store.", tips: ["Digital products have 100% profit margin", "Ensure high-quality product images"] },
    checklist: [
      { id: "source_products", label_ar: "تحديد مصدر المنتجات وتجهيزها", label_en: "Determine Product Sources" },
      { id: "add_to_store", label_ar: "إضافة المنتجات في لوحة تحكم UpKlick", label_en: "Add Products to UpKlick" },
      { id: "write_desc", label_ar: "كتابة وصف جذاب لكل منتج", label_en: "Write Catchy Product Descriptions" }
    ],
    metadata: { timeEstimate: "30 - 60", accentColor: "#F43F5E" }
  },
  {
    id: "profit-calculator",
    content_ar: { title: "حاسبة الأرباح", subtitle: "احسب هوامش الربح وتكاليف الإعلانات لمعرفة نقطة التعادل (Break-even).", tips: ["لا تنس حساب رسوم بوابات الدفع", "حدد ميزانية الإعلانات بناءً على هامش الربح"] },
    content_en: { title: "Profit Calculator", subtitle: "Calculate profit margins and ad costs to find your break-even point.", tips: ["Don't forget payment gateway fees", "Set ad budget based on profit margin"] },
    checklist: [
      { id: "calc_costs", label_ar: "حساب إجمالي التكاليف (المنتج + المنصة)", label_en: "Calculate Total Costs" },
      { id: "set_price", label_ar: "تحديد سعر البيع النهائي", label_en: "Set Final Selling Price" },
      { id: "calc_cpa", label_ar: "حساب الحد الأقصى لتكلفة الاستحواذ (Max CPA)", label_en: "Calculate Max CPA" }
    ],
    metadata: { timeEstimate: "15 - 30", accentColor: "#10B981" }
  },
  {
    id: "social-presence",
    content_ar: { title: "التواجد الاجتماعي", subtitle: "جهز صفحاتك على السوشيال ميديا باللوجو والكوفر ونبذة احترافية.", tips: ["استخدم نفس اللوجو في كل المنصات", "النبذة (Bio) يجب أن توضح ماذا تبيع بوضوح"] },
    content_en: { title: "Social Presence", subtitle: "Set up your social media pages with logo, cover, and professional bio.", tips: ["Use the same logo across all platforms", "Your Bio should clearly state what you sell"] },
    checklist: [
      { id: "create_pages", label_ar: "إنشاء صفحات المنصات الأساسية (FB, IG, TikTok)", label_en: "Create Core Pages" },
      { id: "upload_assets", label_ar: "رفع الشعار والكوفر", label_en: "Upload Logo & Cover" },
      { id: "write_bio", label_ar: "كتابة الـ Bio في كل منصة", label_en: "Write Bio for Each Platform" }
    ],
    metadata: { timeEstimate: "20 - 40", accentColor: "#3B82F6" }
  },
  {
    id: "content-factory",
    content_ar: { title: "مصنع المحتوى", subtitle: "خطط وجهز محتوى الشهر الأول لصفحاتك باستخدام الذكاء الاصطناعي.", tips: ["الاستمرارية أهم من الكمالية", "نوّع بين المحتوى التعليمي والبيعي"] },
    content_en: { title: "Content Factory", subtitle: "Plan and prepare your first month's content using AI.", tips: ["Consistency beats perfection", "Vary between educational and sales content"] },
    checklist: [
      { id: "generate_ideas", label_ar: "توليد 10 أفكار للمحتوى", label_en: "Generate 10 Content Ideas" },
      { id: "write_captions", label_ar: "كتابة الـ Captions", label_en: "Write Captions" },
      { id: "design_posts", label_ar: "تصميم البوستات أو تصوير الفيديوهات", label_en: "Design Posts / Shoot Videos" }
    ],
    metadata: { timeEstimate: "60 - 120", accentColor: "#EC4899" }
  },
  {
    id: "heygen-guide",
    content_ar: { title: "دليل HeyGen", subtitle: "استخدم الذكاء الاصطناعي (HeyGen) لإنشاء فيديوهات تسويقية بشخصيات افتراضية.", tips: ["اكتب السكريبت بشكل تفاعلي", "اختر شخصية (Avatar) تناسب جمهورك"] },
    content_en: { title: "HeyGen Guide", subtitle: "Use AI (HeyGen) to create marketing videos with virtual avatars.", tips: ["Write an interactive script", "Choose an avatar that fits your audience"] },
    checklist: [
      { id: "write_script", label_ar: "كتابة سكريبت الفيديو", label_en: "Write Video Script" },
      { id: "generate_video", label_ar: "توليد الفيديو عبر HeyGen", label_en: "Generate Video via HeyGen" }
    ],
    metadata: { timeEstimate: "30 - 60", accentColor: "#F59E0B" }
  },
  {
    id: "email-automation",
    content_ar: { title: "أتمتة الإيميل", subtitle: "جهز رسائل الترحيب وسلة المتروكات (Abandoned Cart) لزيادة الأرباح أوتوماتيكياً.", tips: ["سلة المتروكات تسترجع 10% من المبيعات الضائعة", "قدم كود خصم في الرسالة الثانية"] },
    content_en: { title: "Email Automation", subtitle: "Set up welcome and abandoned cart emails to increase profits automatically.", tips: ["Abandoned cart emails recover 10% of lost sales", "Offer a discount code in the second email"] },
    checklist: [
      { id: "welcome_flow", label_ar: "إعداد سلسلة رسائل الترحيب", label_en: "Set Up Welcome Flow" },
      { id: "abandoned_cart", label_ar: "إعداد سلسلة سلة المتروكات", label_en: "Set Up Abandoned Cart Flow" }
    ],
    metadata: { timeEstimate: "40 - 80", accentColor: "#8B5CF6" }
  }
  // ================= Phase 5: Launch & Ads Tools =================
  {

    id: "marketing-plan",
    content_ar: { title: "خطة الإطلاق", subtitle: "حدد ميزانيتك، جمهورك المستهدف، وأهداف الحملة الإعلانية الأولى.", tips: ["ابدأ بميزانية تجريبية صغيرة", "لا تغير الإعلان قبل مرور 3 أيام"] },
    content_en: { title: "Marketing Plan", subtitle: "Determine your budget, target audience, and goals for the first ad campaign.", tips: ["Start with a small test budget", "Don't change ads before 3 days"] },
    checklist: [
      { id: "set_budget", label_ar: "تحديد ميزانية الاختبار (Testing Budget)", label_en: "Set Testing Budget" },
      { id: "define_audience", label_ar: "تحديد الاستهداف الأولي (Interests/Broad)", label_en: "Define Initial Targeting" }
    ],
    metadata: { timeEstimate: "30 - 45", accentColor: "#3B82F6" }
  },
  {
    id: "ad-creative",
    content_ar: { title: "تصميم الإعلانات", subtitle: "جهز الفيديوهات والصور الإعلانية التي ستجذب انتباه العملاء.", tips: ["الـ Hook (أول 3 ثواني) هو الأهم", "صمم 3 أشكال مختلفة لنفس الإعلان لاختبارها"] },
    content_en: { title: "Ad Creative", subtitle: "Prepare the videos and images that will grab customer attention.", tips: ["The Hook (first 3s) is crucial", "Design 3 variations to test"] },
    checklist: [
      { id: "write_ad_copy", label_ar: "كتابة نصوص الإعلانات (Ad Copy)", label_en: "Write Ad Copy" },
      { id: "design_visuals", label_ar: "تجهيز 3 فيديوهات/صور للاختبار", label_en: "Prepare 3 Visuals for Testing" }
    ],
    metadata: { timeEstimate: "45 - 90", accentColor: "#EC4899" }
  },
  {
    id: "campaign-launch",
    content_ar: { title: "إطلاق الحملة", subtitle: "اطلق حملتك الأولى، وراقب الأرقام (CPA, ROAS) لاتخاذ قرارات مبنية على الداتا.", tips: ["راقب تكلفة النقرة (CPC) في اليوم الأول", "لا توقف الحملة مبكراً دع الخوارزمية تتعلم"] },
    content_en: { title: "Campaign Launch", subtitle: "Launch your first campaign and monitor numbers (CPA, ROAS) for data-driven decisions.", tips: ["Monitor CPC on day one", "Don't stop early, let the algorithm learn"] },
    checklist: [
      { id: "launch_ads", label_ar: "إطلاق حملة الـ Conversion / Sales", label_en: "Launch Conversion Campaign" },
      { id: "monitor_data", label_ar: "مراقبة الأرقام بعد 48 ساعة", label_en: "Monitor Data after 48h" }
    ],
    metadata: { timeEstimate: "20 - 40", accentColor: "#10B981" }
  }
];

export const seedAllTools = async () => {
  console.log("Starting to seed tools data (Phase 2 & 3)...");
  for (const tool of toolsData) {
    try {
      await setDoc(doc(db, TOOLS_COLLECTION, tool.id), tool);
      console.log(`✅ Seeded tool: ${tool.id}`);
    } catch (error) {
      console.error(`❌ Error seeding ${tool.id}:`, error);
    }
  }
  console.log("🎉 Seeding complete!");
};

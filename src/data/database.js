/* =============================================
   STATIC DATABASE — Smart Dynamic Intelligence
   =============================================
   Categories + Styles + Angles + Psychology +
   Intent + Tone + Audience + Goal
   ============================================= */

export const NICHES = [
  // E-commerce & Retail
  { id: 'ecom', label_ar: '🛒 التجارة الإلكترونية العامة', label_en: '🛒 General E-commerce', icon: '🛒' },
  { id: 'dropshipping', label_ar: '📦 دروبشيبينغ', label_en: '📦 Dropshipping', icon: '📦' },
  { id: 'print_on_demand', label_ar: '🖨️ الطباعة عند الطلب', label_en: '🖨️ Print on Demand', icon: '🖨️' },
  { id: 'handmade', label_ar: '🧶 منتجات يدوية وحرفية', label_en: '🧶 Handmade & Crafts', icon: '🧶' },
  { id: 'fashion', label_ar: '👗 الأزياء والموضة', label_en: '👗 Fashion & Apparel', icon: '👗' },
  { id: 'beauty_products', label_ar: '💄 منتجات التجميل والعناية', label_en: '💄 Beauty & Skincare', icon: '💄' },
  { id: 'electronics', label_ar: '📱 إلكترونيات وإكسسوارات', label_en: '📱 Electronics & Accessories', icon: '📱' },
  { id: 'home_decor', label_ar: '🛋️ ديكور وأثاث منزلي', label_en: '🛋️ Home Decor & Furniture', icon: '🛋️' },
  { id: 'pet_supplies', label_ar: '🐾 مستلزمات الحيوانات الأليفة', label_en: '🐾 Pet Supplies', icon: '🐾' },
  
  // Software & Tech
  { id: 'saas', label_ar: '💻 SaaS / برمجيات كخدمة', label_en: '💻 SaaS / Software as a Service', icon: '💻' },
  { id: 'mobile_apps', label_ar: '📱 تطبيقات الهواتف الذكية', label_en: '📱 Mobile Apps', icon: '📱' },
  { id: 'web_dev', label_ar: '🌐 تطوير المواقع', label_en: '🌐 Web Development', icon: '🌐' },
  { id: 'ai_tools', label_ar: '🤖 أدوات الذكاء الاصطناعي', label_en: '🤖 AI Tools', icon: '🤖' },
  { id: 'cybersecurity', label_ar: '🔐 الأمن السيبراني', label_en: '🔐 Cybersecurity', icon: '🔐' },
  { id: 'blockchain', label_ar: '⛓️ بلوك تشين وكريبتو', label_en: '⛓️ Blockchain & Crypto', icon: '⛓️' },
  
  // Coaching & Consulting
  { id: 'life_coaching', label_ar: '🌟 لايف كوتشينج', label_en: '🌟 Life Coaching', icon: '🌟' },
  { id: 'business_coaching', label_ar: '📈 كوتشينج الأعمال', label_en: '📈 Business Coaching', icon: '📈' },
  { id: 'career_coaching', label_ar: '💼 كوتشينج المسار المهني', label_en: '💼 Career Coaching', icon: '💼' },
  { id: 'relationship_coaching', label_ar: '❤️ استشارات العلاقات', label_en: '❤️ Relationship Coaching', icon: '❤️' },
  { id: 'financial_consulting', label_ar: '📊 استشارات مالية', label_en: '📊 Financial Consulting', icon: '📊' },
  
  // Health & Fitness
  { id: 'fitness', label_ar: '💪 اللياقة البدنية والرياضة', label_en: '💪 Fitness & Sports', icon: '💪' },
  { id: 'nutrition', label_ar: '🥗 التغذية والدايت', label_en: '🥗 Nutrition & Diet', icon: '🥗' },
  { id: 'mental_health', label_ar: '🧘 الصحة النفسية والتأمل', label_en: '🧘 Mental Health & Meditation', icon: '🧘' },
  { id: 'yoga', label_ar: '🪷 يوجا وبيلاتس', label_en: '🪷 Yoga & Pilates', icon: '🪷' },
  { id: 'medical_clinics', label_ar: '🏥 عيادات طبية', label_en: '🏥 Medical Clinics', icon: '🏥' },
  
  // Food & Beverage
  { id: 'restaurants', label_ar: '🍔 مطاعم وكافيهات', label_en: '🍔 Restaurants & Cafes', icon: '🍔' },
  { id: 'healthy_food', label_ar: '🥑 طعام صحي ووجبات دايت', label_en: '🥑 Healthy Food & Meal Prep', icon: '🥑' },
  { id: 'baking', label_ar: '🧁 مخابز وحلويات', label_en: '🧁 Bakeries & Sweets', icon: '🧁' },
  { id: 'coffee_shops', label_ar: '☕ مقاهي مختصة', label_en: '☕ Specialty Coffee Shops', icon: '☕' },
  
  // Real Estate & Home
  { id: 'realestate_sales', label_ar: '🏠 بيع وشراء العقارات', label_en: '🏠 Real Estate Sales', icon: '🏠' },
  { id: 'property_management', label_ar: '🏢 إدارة الأملاك', label_en: '🏢 Property Management', icon: '🏢' },
  { id: 'interior_design', label_ar: '🎨 تصميم داخلي', label_en: '🎨 Interior Design', icon: '🎨' },
  { id: 'cleaning_services', label_ar: '🧹 خدمات تنظيف', label_en: '🧹 Cleaning Services', icon: '🧹' },
  
  // Education & Courses
  { id: 'online_courses', label_ar: '📚 كورسات تعليمية', label_en: '📚 Online Courses', icon: '📚' },
  { id: 'language_learning', label_ar: '🗣️ تعليم اللغات', label_en: '🗣️ Language Learning', icon: '🗣️' },
  { id: 'tutoring', label_ar: '👨‍🏫 دروس خصوصية', label_en: '👨‍🏫 Tutoring', icon: '👨‍🏫' },
  { id: 'skill_building', label_ar: '🛠️ تطوير المهارات التقنية', label_en: '🛠️ Tech Skill Building', icon: '🛠️' },
  
  // Marketing & Agency
  { id: 'digital_marketing', label_ar: '📱 تسويق رقمي وإعلانات', label_en: '📱 Digital Marketing & Ads', icon: '📱' },
  { id: 'seo_agency', label_ar: '🔍 تحسين محركات البحث (SEO)', label_en: '🔍 SEO Agency', icon: '🔍' },
  { id: 'content_creation', label_ar: '✍️ صناعة المحتوى', label_en: '✍️ Content Creation', icon: '✍️' },
  { id: 'pr_agency', label_ar: '📢 علاقات عامة (PR)', label_en: '📢 PR Agency', icon: '📢' },
  
  // Personal & Creative
  { id: 'personal_brand', label_ar: '👤 براند شخصي / مؤثر', label_en: '👤 Personal Brand / Influencer', icon: '👤' },
  { id: 'photography', label_ar: '📸 تصوير فوتوغرافي', label_en: '📸 Photography', icon: '📸' },
  { id: 'videography', label_ar: '🎥 تصوير وإنتاج فيديو', label_en: '🎥 Videography & Production', icon: '🎥' },
  { id: 'graphic_design', label_ar: '🎨 تصميم جرافيك', label_en: '🎨 Graphic Design', icon: '🎨' },
  { id: 'music_production', label_ar: '🎵 إنتاج موسيقي', label_en: '🎵 Music Production', icon: '🎵' },
  { id: 'writing_publishing', label_ar: '📖 كتابة ونشر', label_en: '📖 Writing & Publishing', icon: '📖' },
  
  // Finance & Investment
  { id: 'personal_finance', label_ar: '💰 التمويل الشخصي', label_en: '💰 Personal Finance', icon: '💰' },
  { id: 'trading', label_ar: '📈 تداول وأسهم', label_en: '📈 Trading & Stocks', icon: '📈' },
  { id: 'crypto_investment', label_ar: '🪙 استثمار العملات الرقمية', label_en: '🪙 Crypto Investment', icon: '🪙' },
  
  // Travel & Events
  { id: 'travel_agency', label_ar: '✈️ وكالات سفر وسياحة', label_en: '✈️ Travel & Tourism Agencies', icon: '✈️' },
  { id: 'event_planning', label_ar: '🎉 تنظيم فعاليات', label_en: '🎉 Event Planning', icon: '🎉' },
  { id: 'wedding_planning', label_ar: '💍 تنظيم حفلات زفاف', label_en: '💍 Wedding Planning', icon: '💍' },
];

export const BRAND_NAME_STYLES = [
  { id: 'short', label_ar: 'قصير وجريء', label_en: 'Short & Bold', description_ar: '3-5 أحرف — سهل التذكر والتهجئة', description_en: '3-5 letters — easy to remember and spell', examples: ['Zara', 'Nike', 'Uber'] },
  { id: 'premium', label_ar: 'فاخر وراقي', label_en: 'Premium & Elegant', description_ar: 'يعطي إحساس الفخامة والتميز', description_en: 'Gives a sense of luxury and exclusivity', examples: ['Lumière', 'Aether', 'Velour'] },
  { id: 'arabic', label_ar: 'عربي أصيل', label_en: 'Authentic Arabic', description_ar: 'اسم عربي فصيح بمعنى عميق', description_en: 'Classical Arabic name with deep meaning', examples: ['بيان', 'صفوة', 'نبع'] },
  { id: 'hybrid', label_ar: 'مزيج عربي-إنجليزي', label_en: 'Arabic-English Hybrid', description_ar: 'جمع بين الثقافتين', description_en: 'Combining two cultures', examples: ['Najma Tech', 'Rawaq Studio'] },
  { id: 'modern', label_ar: 'عصري وتقني', label_en: 'Modern & Techy', description_ar: 'يعكس التكنولوجيا والابتكار', description_en: 'Reflects technology and innovation', examples: ['Synth', 'Pixl', 'Nuvio'] },
  { id: 'emotional', label_ar: 'عاطفي ومؤثر', label_en: 'Emotional & Moving', description_ar: 'يلمس المشاعر ويخلق ارتباط', description_en: 'Touches emotions and creates connection', examples: ['Bloom', 'Haven', 'Embrace'] },
  { id: 'bold', label_ar: 'جريء ومباشر', label_en: 'Bold & Direct', description_ar: 'يفرض حضوره بقوة', description_en: 'Imposes its presence strongly', examples: ['Strike', 'Apex', 'Titan'] },
  { id: 'startup', label_ar: 'ستارت أب', label_en: 'Startup Vibe', description_ar: 'خفيف ومبتكر وغير تقليدي', description_en: 'Light, innovative, and unconventional', examples: ['Stacko', 'Flowise', 'Kyte'] },
];

export const HOOKS_DATABASE = [
  // Curiosity
  { text_ar: 'ليش 90% من البراندات تفشل في أول سنة؟', text_en: 'Why do 90% of brands fail in their first year?', emotion: 'curiosity', tone: 'questioning', platform: 'all', audience: 'beginner', goal: 'awareness', viralScore: 8 },
  { text_ar: 'الشيء الوحيد اللي يفرق بين البراند الناجح والفاشل...', text_en: 'The one thing that separates a successful brand from a failing one...', emotion: 'curiosity', tone: 'mysterious', platform: 'instagram', audience: 'all', goal: 'engagement', viralScore: 9 },
  { text_ar: 'لو عرفت هالمعلومة من سنة، كان وفرت على نفسي $10,000', text_en: 'If I knew this a year ago, I would have saved $10,000', emotion: 'curiosity', tone: 'personal', platform: 'all', audience: 'intermediate', goal: 'authority', viralScore: 7 },
  { text_ar: 'سر المبيعات اللي مستحيل تسمعه من الخبراء...', text_en: 'The sales secret you will never hear from experts...', emotion: 'curiosity', tone: 'secretive', platform: 'tiktok', audience: 'beginner', goal: 'awareness', viralScore: 9 },
  { text_ar: 'ليش منافسك يبيع أكثر منك رغم إن منتجك أفضل؟', text_en: 'Why your competitor sells more even though your product is better?', emotion: 'curiosity', tone: 'pain_point', platform: 'linkedin', audience: 'advanced', goal: 'trust', viralScore: 8 },
  
  // Shock & Pattern Interrupt
  { text_ar: 'توقفت عن التسويق تماماً... والمبيعات تضاعفت', text_en: 'I stopped marketing completely... and sales doubled', emotion: 'shock', tone: 'contrarian', platform: 'linkedin', audience: 'advanced', goal: 'authority', viralScore: 9 },
  { text_ar: 'حذفت 80% من المحتوى... وهذا اللي صار', text_en: 'I deleted 80% of my content... and this is what happened', emotion: 'shock', tone: 'bold', platform: 'instagram', audience: 'all', goal: 'engagement', viralScore: 8 },
  { text_ar: 'أكبر كذبة في عالم التسويق الرقمي هي...', text_en: 'The biggest lie in the digital marketing world is...', emotion: 'shock', tone: 'controversial', platform: 'tiktok', audience: 'all', goal: 'awareness', viralScore: 10 },
  { text_ar: 'لا تبدأ بزنس قبل ما تشوف هذا الفيديو!', text_en: 'Do not start a business before watching this video!', emotion: 'shock', tone: 'warning', platform: 'youtube', audience: 'beginner', goal: 'awareness', viralScore: 9 },
  
  // Authority & Expertise
  { text_ar: 'بعد 500+ عميل، هذي الـ 3 أسرار اللي ما حد يقولها', text_en: 'After 500+ clients, these are the 3 secrets no one tells you', emotion: 'authority', tone: 'expert', platform: 'all', audience: 'all', goal: 'trust', viralScore: 8 },
  { text_ar: '7 سنوات في التسويق علمتني شيء واحد مهم', text_en: '7 years in marketing taught me one important thing', emotion: 'authority', tone: 'storytelling', platform: 'linkedin', audience: 'intermediate', goal: 'trust', viralScore: 7 },
  { text_ar: 'كيف ضاعفت مبيعات عميلي 3 مرات في 30 يوم', text_en: 'How I 3xed my client\'s sales in 30 days', emotion: 'authority', tone: 'case_study', platform: 'linkedin', audience: 'advanced', goal: 'conversion', viralScore: 8 },
  { text_ar: 'الخطة الكاملة اللي استخدمتها للوصول لأول $10K', text_en: 'The exact blueprint I used to hit my first $10K', emotion: 'authority', tone: 'educational', platform: 'instagram', audience: 'beginner', goal: 'trust', viralScore: 9 },
  
  // Emotional & Connection
  { text_ar: 'في يوم قررت أوقف كل شي وأبدأ من الصفر', text_en: 'One day I decided to stop everything and start from scratch', emotion: 'emotional', tone: 'storytelling', platform: 'instagram', audience: 'all', goal: 'connection', viralScore: 9 },
  { text_ar: 'أول مرة حسيت إني فعلاً بنيت شي يستاهل', text_en: 'The first time I felt I truly built something worthwhile', emotion: 'emotional', tone: 'personal', platform: 'all', audience: 'beginner', goal: 'inspiration', viralScore: 7 },
  { text_ar: 'أسوأ لحظة في مشروعي (وكيف تجاوزتها)', text_en: 'The worst moment in my project (and how I overcame it)', emotion: 'emotional', tone: 'vulnerable', platform: 'linkedin', audience: 'all', goal: 'connection', viralScore: 8 },
  
  // Luxury & Premium
  { text_ar: 'الفرق بين براند يبيع بـ$10 وبراند يبيع بـ$1000 هو...', text_en: 'The difference between a brand that sells for $10 and one that sells for $1000 is...', emotion: 'luxury', tone: 'premium', platform: 'all', audience: 'advanced', goal: 'positioning', viralScore: 8 },
  { text_ar: 'ليش عميلك يدفع 5 أضعاف السعر وهو يبتسم؟', text_en: 'Why your customer pays 5x the price and smiles?', emotion: 'luxury', tone: 'value', platform: 'instagram', audience: 'advanced', goal: 'education', viralScore: 7 },
  
  // Challenge & Action
  { text_ar: 'جرب هالشي لمدة 7 أيام وشوف الفرق بنفسك', text_en: 'Try this for 7 days and see the difference yourself', emotion: 'challenge', tone: 'direct', platform: 'tiktok', audience: 'beginner', goal: 'engagement', viralScore: 9 },
  { text_ar: 'تحدي: غير هذي الجملة في موقعك وشوف المبيعات', text_en: 'Challenge: Change this sentence on your site and watch the sales', emotion: 'challenge', tone: 'actionable', platform: 'all', audience: 'all', goal: 'conversion', viralScore: 8 },
  
  // Pain Point & Solution
  { text_ar: 'تتعب على المحتوى وما في تفاعل؟ هذا هو السبب', text_en: 'Working hard on content with no engagement? This is why', emotion: 'pain', tone: 'empathetic', platform: 'instagram', audience: 'beginner', goal: 'education', viralScore: 8 },
  { text_ar: 'تصرف آلاف على الإعلانات بدون نتيجة؟ الحل هنا', text_en: 'Spending thousands on ads with no results? The solution is here', emotion: 'pain', tone: 'solution', platform: 'facebook', audience: 'intermediate', goal: 'conversion', viralScore: 7 },
];

export const OFFER_STRUCTURES = [
  { id: 'lowticket', name_ar: 'عرض منخفض التكلفة (Low Ticket)', name_en: 'Low Ticket Offer', priceRange: '$27-97', description_ar: 'منتج رقمي أو خدمة سريعة — نقطة الدخول', description_en: 'Digital product or quick service — entry point', psychology_ar: 'يخفض حاجز الشراء ويبني الثقة الأولى', psychology_en: 'Lowers buying friction and builds initial trust', bestFor_ar: 'المبتدئين وبناء القائمة البريدية', bestFor_en: 'Beginners and building an email list' },
  { id: 'premium', name_ar: 'باقة متميزة (Premium)', name_en: 'Premium Package', priceRange: '$500-2000', description_ar: 'خدمة شاملة مع متابعة ونتائج مضمونة', description_en: 'Comprehensive service with follow-up and guaranteed results', psychology_ar: 'يجذب العملاء الجادين اللي يدفعون مقابل النتيجة', psychology_en: 'Attracts serious clients who pay for results', bestFor_ar: 'الاستشاريين والمدربين', bestFor_en: 'Consultants and coaches' },
  { id: 'subscription', name_ar: 'اشتراك شهري', name_en: 'Monthly Subscription', priceRange: '$29-199/شهر', description_ar: 'قيمة مستمرة مع دخل متكرر', description_en: 'Continuous value with recurring income', psychology_ar: 'يخلق التزام طويل ويبني مجتمع', psychology_en: 'Creates long-term commitment and builds community', bestFor_ar: 'SaaS، كورسات، مجتمعات', bestFor_en: 'SaaS, Courses, Communities' },
  { id: 'transformation', name_ar: 'عرض التحول الجذري', name_en: 'Transformation Offer', priceRange: '$2000-10000', description_ar: 'رحلة تحول كاملة من A إلى Z', description_en: 'A complete transformation journey from A to Z', psychology_ar: 'العميل يشتري النسخة الأفضل من نفسه', psychology_en: 'The customer buys the best version of themselves', bestFor_ar: 'الكوتشينج وبرامج التحول', bestFor_en: 'Coaching and transformation programs' },
  { id: 'bundle', name_ar: 'باقة مجمعة (Bundle)', name_en: 'Bundle Package', priceRange: 'متغير (Variable)', description_ar: 'مجموعة خدمات/منتجات بسعر مخفض', description_en: 'Group of services/products at a discounted price', psychology_ar: 'إحساس القيمة العالية مقابل السعر', psychology_en: 'Sense of high value for money', bestFor_ar: 'التجارة الإلكترونية والخدمات', bestFor_en: 'E-commerce and services' },
  { id: 'guarantee', name_ar: 'عرض بضمان النتائج', name_en: 'Guarantee-Based Offer', priceRange: 'مرتفع (High)', description_ar: 'ادفع فقط عند تحقق النتيجة', description_en: 'Pay only upon achieving the result', psychology_ar: 'يزيل المخاطرة ويبني ثقة فورية', psychology_en: 'Removes risk and builds instant trust', bestFor_ar: 'الوكالات ومقدمي الخدمات الواثقين', bestFor_en: 'Agencies and confident service providers' },
];

export const CONTENT_GOALS = [
  { id: 'awareness', label_ar: 'توعية', label_en: 'Awareness', icon: '📢', color: 'blue' },
  { id: 'engagement', label_ar: 'تفاعل', label_en: 'Engagement', icon: '💬', color: 'green' },
  { id: 'trust', label_ar: 'ثقة', label_en: 'Trust', icon: '🤝', color: 'amber' },
  { id: 'conversion', label_ar: 'تحويل/بيع', label_en: 'Conversion/Sales', icon: '💰', color: 'purple' },
  { id: 'authority', label_ar: 'سلطة', label_en: 'Authority', icon: '👑', color: 'gold' },
  { id: 'viral', label_ar: 'انتشار', label_en: 'Viral', icon: '🔥', color: 'red' },
];

export const CURRENCY_SYMBOLS = {
  ar: { USD: '$', EGP: 'ج.م', SAR: 'ر.س', AED: 'د.إ', EUR: '€', GBP: '£', KWD: 'د.ك', QAR: 'ر.ق' },
  en: { USD: '$', EGP: 'EGP', SAR: 'SAR', AED: 'AED', EUR: '€', GBP: '£', KWD: 'KWD', QAR: 'QAR' }
};

export const JOURNEY_STEPS = [
  { id: 'onboarding', label_ar: 'البداية', label_en: 'Onboarding', icon: '🚀', section: 'start' },
];

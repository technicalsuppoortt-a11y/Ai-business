// seedPart1_niches.js — Comprehensive Niche Analysis Seed Data for 90 Micro-Niches
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const COL = 'tc_niche_analysis';

const LEGACY_FALLBACKS = [
  {
    id: 'ecom',
    niche_ar: 'التجارة الإلكترونية العامة',
    niche_en: 'General E-Commerce',
    analysis_ar: `## 🎯 تحليل نيتش التجارة الإلكترونية

**الفرصة:** سوق يتجاوز 6 تريليون دولار عالمياً. المشتري العربي يتزايد بسرعة كبيرة.

**العميل المثالي:**
- عمر 20-45 سنة، يتسوق أونلاين أسبوعياً
- يبحث عن جودة + سعر منافس + شحن سريع
- يتأثر بالتقييمات والـ UGC

**نقاط التمييز الأساسية (USP):**
- ضمان الجودة + سياسة استرجاع واضحة
- تجربة شراء سلسة بخطوات قليلة
- خدمة عملاء فورية (واتساب)

**استراتيجية التسعير:**
- ابدأ بهامش ربح 40-60%
- سعر الاستحواذ (CPA) لا يتجاوز 30% من سعر البيع
- قدم حزم توفير لرفع متوسط الطلب

**قنوات النمو:**
1. TikTok Ads (أفضل ROAS حالياً)
2. Facebook/Instagram Retargeting
3. Email Marketing (أعلى ROI)`,

    analysis_en: `## 🎯 E-Commerce Niche Analysis

**Opportunity:** A $6+ trillion global market. Arab online shoppers are growing rapidly.

**Ideal Customer:**
- Ages 20-45, shops online weekly
- Looking for quality + competitive pricing + fast shipping
- Influenced by reviews and UGC

**Key USPs:**
- Quality guarantee + clear return policy
- Smooth checkout experience in few steps
- Instant customer service (WhatsApp)

**Pricing Strategy:**
- Start with 40-60% profit margin
- CPA should not exceed 30% of selling price
- Offer bundle deals to increase AOV

**Growth Channels:**
1. TikTok Ads (best ROAS currently)
2. Facebook/Instagram Retargeting
3. Email Marketing (highest ROI)`,

    ideal_client_ar: 'متسوق عربي بين 20-45 سنة، يشتري عبر الهاتف، يبحث عن الجودة والسعر المناسب.',
    usp_ar: 'ضمان الجودة + خدمة عملاء فورية + شحن سريع',
    pricing_ar: 'هامش ربح 40-60% | CPA أقل من 30% من سعر البيع',
    channels_ar: ['TikTok Ads', 'Facebook Retargeting', 'Email Marketing'],
  },
  {
    id: 'ecom_fashion',
    niche_ar: 'الأزياء والموضة',
    niche_en: 'Fashion & Clothing',
    analysis_ar: `## 👗 تحليل نيتش الأزياء والموضة

**الفرصة:** قطاع الموضة العربية ينمو 15% سنوياً. الطلب على الأزياء المحتشمة والـ Modest Fashion في ارتفاع عالمي.

**العميل المثالي:**
- سيدات 18-40 سنة
- تتابع المؤثرات في الموضة
- تهتم بالتفاصيل والـ Styling
- تشتري بناءً على الصورة والهوية

**نقاط التمييز:**
- تنوع المقاسات (Inclusive Sizing)
- صور عالية الجودة تُظهر التفاصيل
- محتوى Styling يُلهم العميلة

**التسعير:**
- منتجات Entry: 50-150 ريال/جنيه
- Premium: 200-500 ريال/جنيه
- استخدم Flash Sales لتسريع المخزون

**محتوى يُحقق مبيعات:**
- فيديوهات "كيف أنسق؟" (Styling Reels)
- مقارنات "قبل وبعد"
- UGC من عميلات حقيقيات`,

    analysis_en: `## 👗 Fashion & Clothing Niche Analysis

**Opportunity:** Arab fashion market grows 15% annually. Global demand for modest fashion is rising.

**Ideal Customer:**
- Women 18-40 years old
- Follows fashion influencers
- Cares about details and styling
- Buys based on image and identity

**Key USPs:**
- Inclusive sizing range
- High-quality product imagery
- Inspiring styling content

**Pricing:**
- Entry products: $15-40
- Premium: $60-150
- Use flash sales to move inventory fast

**Converting Content:**
- "How to style?" Reels
- Before/After comparisons
- Real customer UGC`,

    ideal_client_ar: 'سيدات 18-40 سنة، مهتمات بالموضة والستايل، تتسوق بناءً على المحتوى الإلهامي.',
    usp_ar: 'تنوع المقاسات + صور احترافية + محتوى Styling',
    pricing_ar: 'Entry: 50-150 | Premium: 200-500 | Flash Sales لتسريع المخزون',
    channels_ar: ['Instagram Reels', 'TikTok', 'Pinterest'],
  },
  {
    id: 'ecom_beauty_products',
    niche_ar: 'منتجات التجميل والعناية',
    niche_en: 'Beauty & Skincare',
    analysis_ar: `## 💄 تحليل نيتش التجميل والعناية

**الفرصة:** سوق التجميل العربي $30+ مليار. معدل تكرار الشراء أعلى من أي قطاع آخر.

**العميل المثالي:**
- نساء 18-45 سنة
- تبحث عن حلول لمشاكل محددة (بشرة، شعر)
- تثق بالتجارب الحقيقية أكثر من الإعلانات
- مستعدة للدفع أكثر للجودة

**نقاط التمييز:**
- مكونات طبيعية/حلال (ميزة تنافسية كبيرة)
- ضمان استرجاع بدون أسئلة
- قبل وبعد حقيقي من العملاء

**التسعير:**
- لا تنافس بالسعر المنخفض
- الجودة الواضحة تسمح بأسعار أعلى
- حزم Routine (صباح + مساء) = AOV أعلى`,

    analysis_en: `## 💄 Beauty & Skincare Niche Analysis

**Opportunity:** Arab beauty market $30B+. Highest repeat purchase rate of any sector.

**Ideal Customer:**
- Women 18-45
- Seeking solutions for specific problems (skin, hair)
- Trusts real experiences over ads
- Willing to pay more for quality

**Key USPs:**
- Natural/Halal ingredients (big competitive advantage)
- No-questions return policy
- Real before/after from customers

**Pricing:**
- Don't compete on low price
- Clear quality justifies premium pricing
- Bundle routines (AM + PM) = higher AOV`,

    ideal_client_ar: 'نساء 18-45 يبحثن عن حلول لمشاكل بشرة وشعر محددة، يثقن بالتجارب الحقيقية.',
    usp_ar: 'مكونات طبيعية/حلال + ضمان استرجاع + نتائج حقيقية',
    pricing_ar: 'لا تنافس بسعر منخفض | حزم Routine ترفع AOV',
    channels_ar: ['YouTube Reviews', 'Instagram Before/After', 'TikTok Tutorials'],
  },
  {
    id: 'saas',
    niche_ar: 'SaaS / برمجيات كخدمة',
    niche_en: 'SaaS / Software as a Service',
    analysis_ar: `## 💻 تحليل نيتش الـ SaaS

**الفرصة:** الشركات تبحث عن أدوات تُوفر وقتاً ومالاً. هامش الربح 70-90%.

**العميل المثالي:**
- صاحب شركة صغيرة أو متوسطة
- يبحث عن حل لمشكلة محددة في عمله
- يُفضل الاشتراك الشهري على الشراء الكامل

**نقاط التمييز:**
- Onboarding سريع (أقل من 5 دقائق)
- Free Trial (14 يوم) لإثبات القيمة
- دعم فني ممتاز بالعربية

**استراتيجية النمو:**
- SEO Content (مقالات تحل مشاكل العميل)
- Product Hunt Launch
- الشراكة مع مؤثرين في الـ Business`,

    analysis_en: `## 💻 SaaS Niche Analysis

**Opportunity:** Businesses seek tools that save time and money. Profit margins 70-90%.

**Ideal Customer:**
- Small-medium business owner
- Seeking solution for specific business problem
- Prefers monthly subscription over one-time purchase

**Key USPs:**
- Fast onboarding (under 5 minutes)
- Free Trial (14 days) to prove value
- Excellent Arabic-language support

**Growth Strategy:**
- SEO Content (articles solving customer problems)
- Product Hunt Launch
- Business influencer partnerships`,

    ideal_client_ar: 'صاحب شركة صغيرة/متوسطة يبحث عن حل لمشكلة محددة في عمله.',
    usp_ar: 'Onboarding سريع + Trial مجاني + دعم عربي',
    pricing_ar: 'اشتراك شهري | Freemium → Paid conversion',
    channels_ar: ['Content Marketing / SEO', 'LinkedIn Ads', 'Product Hunt'],
  },
  {
    id: 'life_coaching',
    niche_ar: 'لايف كوتشينج',
    niche_en: 'Life Coaching',
    analysis_ar: `## 🌟 تحليل نيتش اللايف كوتشينج

**الفرصة:** الوعي بالتطوير الذاتي يرتفع بسرعة في العالم العربي. العميل يدفع للنتيجة لا للجلسة.

**العميل المثالي:**
- أعمار 25-45
- يشعر بالعالق في مكانه (مهنياً أو شخصياً)
- جرّب كتباً ومقاطع يوتيوب بدون نتيجة
- مستعد للاستثمار في نفسه

**نقاط التمييز:**
- نتيجة محددة وقابلة للقياس
- ليس جلسات كلام — بل تحول حقيقي
- ضمان النتيجة (يبني الثقة)

**التسعير:**
- برنامج 3 أشهر: 3000-8000 ريال/جنيه
- لا تبيع جلسات منفردة — بيع تحولاً
- الـ ROI للعميل يُبرر السعر`,

    analysis_en: `## 🌟 Life Coaching Niche Analysis

**Opportunity:** Personal development awareness rising rapidly in Arab world. Client pays for outcomes, not sessions.

**Ideal Customer:**
- Ages 25-45
- Feels stuck (professionally or personally)
- Tried books and YouTube without results
- Ready to invest in themselves

**Key USPs:**
- Specific, measurable outcomes
- Not talk sessions — real transformation
- Results guarantee (builds trust)

**Pricing:**
- 3-month program: $800-2000
- Don't sell individual sessions — sell transformation
- Client ROI justifies the price`,

    ideal_client_ar: 'شخص 25-45 يشعر بالعالق، جرّب الحلول المجانية بدون نتيجة، مستعد للاستثمار.',
    usp_ar: 'نتيجة محددة قابلة للقياس + ضمان التحول',
    pricing_ar: 'برنامج 3 أشهر 3000-8000 | لا تبيع جلسات منفردة',
    channels_ar: ['YouTube / Podcast', 'Instagram Stories', 'Webinars مجانية'],
  },
  {
    id: 'digital_marketing',
    niche_ar: 'تسويق رقمي وإعلانات',
    niche_en: 'Digital Marketing & Ads',
    analysis_ar: `## 📱 تحليل نيتش التسويق الرقمي

**الفرصة:** كل شركة تحتاج تسويق رقمي. الطلب يفوق العرض في السوق العربي.

**العميل المثالي:**
- صاحب نشاط تجاري يريد عملاء أونلاين
- لديه منتج/خدمة ولكن لا يعرف كيف يسوّق
- سبق وأضاع مالاً على إعلانات بدون نتيجة

**نقاط التمييز:**
- نتائج واضحة (Leads / Sales / ROAS)
- تقارير شفافية كل أسبوع
- لا عقود طويلة — نتائج تُثبت نفسها

**التسعير:**
- إدارة إعلانات: 1500-5000$/شهر
- Retainer + نسبة من النتائج
- لا تعمل بسعر رخيص — جودتك هي قيمتك`,

    analysis_en: `## 📱 Digital Marketing Niche Analysis

**Opportunity:** Every business needs digital marketing. Demand exceeds supply in Arab market.

**Ideal Customer:**
- Business owner wanting online clients
- Has product/service but doesn't know how to market
- Has wasted money on ads without results before

**Key USPs:**
- Clear results (Leads / Sales / ROAS)
- Transparent weekly reporting
- No long contracts — results speak for themselves

**Pricing:**
- Ad Management: $1500-5000/month
- Retainer + performance percentage
- Don't work cheap — quality is your value`,

    ideal_client_ar: 'صاحب نشاط لديه منتج/خدمة ويبحث عن نتائج حقيقية من التسويق الرقمي.',
    usp_ar: 'نتائج قابلة للقياس + تقارير شفافة + بدون عقود إجبارية',
    pricing_ar: 'إدارة إعلانات 1500-5000$/شهر | Retainer + performance',
    channels_ar: ['Cold Email', 'LinkedIn', 'الإحالات (Referrals)'],
  },
  {
    id: 'fitness',
    niche_ar: 'اللياقة البدنية والرياضة',
    niche_en: 'Fitness & Sports',
    analysis_ar: `## 💪 تحليل نيتش اللياقة البدنية

**الفرصة:** 70%+ من العرب يريدون فقدان وزن. الكورسات الأونلاين كسرت حاجز الجيم الجغرافي.

**العميل المثالي:**
- رجال/نساء 20-40 سنة
- جرّبوا حميات ودايت كثيرة بدون نتيجة
- يريدون خطة شخصية محددة
- مشغولون — يحتاجون برنامج يناسب وقتهم

**نقاط التمييز:**
- برنامج مخصص (ليس عام)
- دعم يومي عبر واتساب
- نتائج في 30 يوم أو المال يُرد

**التسعير:**
- برنامج 12 أسبوع: 500-2000 ريال
- App Subscription: 99-299 ريال/شهر
- قدّم نتائج قبل/بعد حقيقية`,

    analysis_en: `## 💪 Fitness & Sports Niche Analysis

**Opportunity:** 70%+ of Arabs want to lose weight. Online courses broke geographical gym barriers.

**Ideal Customer:**
- Men/Women 20-40 years old
- Tried many diets without results
- Want a personalized specific plan
- Busy — need a program fitting their schedule

**Key USPs:**
- Personalized program (not generic)
- Daily support via WhatsApp
- Results in 30 days or money back

**Pricing:**
- 12-week program: $150-500
- App subscription: $30-80/month
- Show real before/after results`,

    ideal_client_ar: 'رجال/نساء 20-40 جربوا حميات كثيرة، يريدون خطة شخصية ودعم مستمر.',
    usp_ar: 'برنامج مخصص + دعم يومي + ضمان النتيجة',
    pricing_ar: '12 أسبوع: 500-2000 ريال | App: 99-299 ريال/شهر',
    channels_ar: ['Instagram Before/After', 'TikTok Workout Videos', 'YouTube Challenges'],
  },
  {
    id: 'realestate_sales',
    niche_ar: 'بيع وشراء العقارات',
    niche_en: 'Real Estate Sales',
    analysis_ar: `## 🏠 تحليل نيتش العقارات

**الفرصة:** القرارات الكبيرة تحتاج ثقة. من يبني الثقة الرقمية يأخذ العملاء.

**العميل المثالي:**
- مشتري: 28-50 سنة، يبحث 3-6 أشهر قبل الشراء
- بائع: يريد أعلى سعر + أسرع وقت
- مستثمر: يريد ROI واضح

**نقاط التمييز:**
- معرفة محلية عميقة بالمنطقة
- تقارير السوق الشهرية تبني الثقة
- فيديوهات Virtual Tour تُرسّخ الاحترافية

**التسعير:**
- عمولة: 2-3% من قيمة الصفقة
- استشارة استثمارية: 500-2000 ريال
- لا تعطِ خدماتك مجاناً`,

    analysis_en: `## 🏠 Real Estate Sales Niche Analysis

**Opportunity:** Big decisions need trust. Whoever builds digital trust wins the clients.

**Ideal Customer:**
- Buyer: 28-50, researches 3-6 months before purchase
- Seller: wants highest price + fastest time
- Investor: wants clear ROI

**Key USPs:**
- Deep local area knowledge
- Monthly market reports build trust
- Virtual tour videos establish professionalism

**Pricing:**
- Commission: 2-3% of deal value
- Investment consultation: $150-500
- Never give services for free`,

    ideal_client_ar: 'مشتري باحث 28-50 سنة يريد أمان القرار | مستثمر يريد ROI واضح.',
    usp_ar: 'معرفة محلية + Virtual Tours + تقارير السوق',
    pricing_ar: 'عمولة 2-3% | استشارة استثمارية 500-2000 ريال',
    channels_ar: ['YouTube Virtual Tours', 'Facebook Groups', 'Google Ads نية شراء'],
  },
  {
    id: 'graphic_design',
    niche_ar: 'تصميم جرافيك',
    niche_en: 'Graphic Design',
    analysis_ar: `## 🎨 تحليل نيتش تصميم الجرافيك

**الفرصة:** كل شركة تحتاج تصميم. المنافسة عالية ولكن المصمم المتخصص يفوز دائماً.

**العميل المثالي:**
- أصحاب شركات ناشئة يحتاجون هوية بصرية
- وكالات تسويق تحتاج freelancer موثوق
- شركات تحتاج تصميمات بتسليم سريع

**نقاط التمييز:**
- التخصص في نيتش معين (F&B، Health، Tech)
- تسليم سريع مع مراجعات غير محدودة
- معرض أعمال بنتائج قابلة للقياس

**التسعير:**
- هوية بصرية: 500-3000 ريال
- بوستات شهرية: 800-3000 ريال/شهر
- لا تبيع ساعات — بيع نتائج`,

    analysis_en: `## 🎨 Graphic Design Niche Analysis

**Opportunity:** Every company needs design. Competition is high but specialized designers always win.

**Ideal Customer:**
- Startup owners needing visual identity
- Marketing agencies needing reliable freelancers
- Companies needing fast-turnaround designs

**Key USPs:**
- Specialize in specific niche (F&B, Health, Tech)
- Fast delivery with unlimited revisions
- Portfolio with measurable results

**Pricing:**
- Visual identity: $150-800
- Monthly social posts: $200-800/month
- Don't sell hours — sell results`,

    ideal_client_ar: 'شركات ناشئة + وكالات تسويق + شركات تحتاج تسليم سريع وجودة عالية.',
    usp_ar: 'تخصص في نيتش + تسليم سريع + نتائج قابلة للقياس',
    pricing_ar: 'هوية بصرية 500-3000 | بوستات شهرية 800-3000 ريال',
    channels_ar: ['Behance', 'Upwork', 'LinkedIn'],
  },
];

const RAW_NICHES = {
  ai: [
    {
      n_ar: "وكالة تسويق AI Influencers",
      n_en: "AI Influencer Marketing Agency",
      opp_ar: "سوق الإنفلونسرز الافتراضيين ينمو بنسبة 35% سنويًا مع طلب متزايد من براندات الجيل Z لتقليل التكاليف وضمان الاستمرارية.",
      opp_en: "Virtual influencer market growing 35% annually, driven by Gen-Z brands seeking 24/7 engagement and lower campaign costs.",
      client_ar: "براندات التجارة الإلكترونية، شركات التجميل، وماركات الأزياء الموجهة للشباب.",
      client_en: "E-commerce platforms, beauty brands, and apparel brands targeting Gen-Z consumers.",
      usp_ar: "تصميم شخصيات افتراضية مخصصة للبراند تعكس قيمه وتتفاعل بلغات ولهجات متعددة مع إدارة متكاملة للمحتوى.",
      usp_en: "Bespoke CGI/AI characters tailored to brand identity, multilingual interactions, and full-stack social management.",
      pricing_ar: "باقة أساسية: 1500$/شهرياً (شخصية واحدة + 5 منشورات) | باقة متكاملة: 4000$/شهرياً + نسبة من مبيعات الكود.",
      pricing_en: "Starter: $1500/mo (1 avatar + 5 posts) | Pro: $4000/mo + sales commission from affiliate codes.",
      growth_ar: "إرسال عينات محتوى لشركات التجميل والـ D2C، استعراض دراسات حالة لزيادة الـ CTR على تيك توك وإنستغرام.",
      growth_en: "Direct outreach to D2C/beauty brands with interactive prototypes; publish video case studies highlighting high CTR on TikTok."
    },
    {
      n_ar: "تطوير نماذج لغوية متخصصة للمجالات (Domain LLMs)",
      n_en: "Domain-Specific LLM Development",
      opp_ar: "حاجة الشركات الطبية والقانونية لنماذج ذكاء اصطناعي مغلقة وآمنة تحفظ خصوصية البيانات بنسبة 100%.",
      opp_en: "Medical, legal, and financial firms require private, 100% secure custom LLMs trained on domain-specific data.",
      client_ar: "المستشفيات الخاصة، شركات المحاماة الكبرى، ومؤسسات التمويل.",
      client_en: "Private hospitals, corporate law firms, and financial institutions.",
      usp_ar: "تدريب النماذج على بيانات متخصصة للغاية مع ضمان السرية والأمن التام داخل خوادم العميل.",
      usp_en: "Domain expertise training, high compliance, local server deployment, and top-tier data security.",
      pricing_ar: "مشاريع تبدأ من 10,000$ إلى 50,000$ للتدريب والدمج مع رسوم صيانة دورية.",
      pricing_en: "Projects from $10,000 to $50,000 including custom fine-tuning and integration, plus support fees.",
      growth_ar: "مؤتمرات B2B، لينكد إن، والتسويق عبر العلاقات العامة للمؤسسات واستعراض حالات الاستخدام الأمنية.",
      growth_en: "B2B tech conferences, LinkedIn professional networks, and targeted executive outreach highlighting security compliance."
    },
    {
      n_ar: "أمن الذكاء الاصطناعي والدفاع ضد التزييف العميق",
      n_en: "AI Security & Deepfake Defense",
      opp_ar: "ارتفاع عمليات الاحتيال بالتزييف العميق بنسبة 200%، مما يخلق حاجة ماسة لحماية الهويات المؤسسية.",
      opp_en: "Deepfake fraud rising by 200%, creating an urgent need to protect corporate identities and executive voices.",
      client_ar: "البنوك، القنوات الإخبارية، والمسؤولون التنفيذيون في الشركات الكبرى.",
      client_en: "Banks, media broadcasting channels, and high-profile corporate executives.",
      usp_ar: "أنظمة تدقيق وحماية فوري ضد تزييف الصوت والفيديو مع تقديم شهادات موثوقية رقمية.",
      usp_en: "Real-time voice/video authentication systems and digital verification certificates for executive communications.",
      pricing_ar: "اشتراك شهري للمؤسسات يبدأ من 3000$ لحماية هويات الإدارة التنفيذية.",
      pricing_en: "Corporate retainer starting at $3000/mo for continuous executive identity protection.",
      growth_ar: "ورش عمل أمنية للشركات، حملات توعية عبر لينكد إن حول مخاطر الهندسة الاجتماعية المدعومة بالذكاء الاصطناعي.",
      growth_en: "Corporate security workshops, LinkedIn content campaigns about AI social engineering risks."
    },
    {
      n_ar: "حلول أنظمة الوكيل الذكي (Agentic AI)",
      n_en: "Agentic AI Solutions",
      opp_ar: "الانتقال من مجرد المحادثة إلى الوكلاء المستقلين الذين ينفذون مهام كاملة مثل حجز المواعيد وإدارة العمليات.",
      opp_en: "Shift from passive chatbots to autonomous agents executing multi-step workflows like booking and operations.",
      client_ar: "شركات الخدمات، مكاتب الاستشارات، ومواقع التجارة الإلكترونية الكبرى.",
      client_en: "Service companies, consulting firms, and enterprise e-commerce systems.",
      usp_ar: "بناء وكلاء أذكياء يتكاملون مع أنظمة CRM والبريد لتنفيذ المهام بشكل آلي بالكامل دون تدخل بشري.",
      usp_en: "Custom autonomous agents integrated with CRM, email, and ERP to perform end-to-end business logic.",
      pricing_ar: "تطوير الوكيل يبدأ من 5000$ + رسوم استهلاك سحابية شهرية 200$.",
      pricing_en: "Agent development from $5000 + monthly cloud infrastructure management fee of $200.",
      growth_ar: "فيديوهات مسجلة تستعرض قيام الوكيل بإنهاء مهام تستغرق ساعات في ثوانٍ معدودة.",
      growth_en: "Screen-share demo videos showing the AI agent completing hours of human tasks in seconds."
    },
    {
      n_ar: "تحسين محركات البحث للذكاء الاصطناعي (GEO)",
      n_en: "Generative Engine Optimization (GEO)",
      opp_ar: "تزايد اعتماد المستخدمين على ChatGPT وPerplexity في البحث بدلاً من جوجل، مما يتطلب استراتيجيات أرشفة جديدة.",
      opp_en: "Users increasingly search via ChatGPT, Gemini, and Perplexity instead of Google, requiring brand-new indexing strategies.",
      client_ar: "شركات الـ SaaS، المتاجر الكبرى، والمؤسسات الخدمية الباحثة عن عملاء متوقعين.",
      client_en: "SaaS startups, enterprise e-commerce, and high-end service providers seeking warm leads.",
      usp_ar: "صناعة محتوى مهيكل ومصمم لكي تذكره روبوتات ومحركات الذكاء الاصطناعي كأفضل خيار للمستخدم.",
      usp_en: "Structuring brand data and references specifically to be cited by generative engines as top recommendations.",
      pricing_ar: "عقد استشاري يبدأ من 2000$/شهرياً لتحسين الظهور في إجابات الـ AI.",
      pricing_en: "Consulting retainer starting at $2000/mo for optimizing brand presence in generative engine answers.",
      growth_ar: "تقديم تقارير تحليلية مجانية للشركات توضح مدى ظهورهم في إجابات ChatGPT مقارنة بمنافسيهم.",
      growth_en: "Offer free brand footprint audits showing companies how often they are recommended by ChatGPT vs competitors."
    },
    {
      n_ar: "أتمتة سير العمل بالذكاء الاصطناعي للشركات",
      n_en: "AI Workflow Automation for Business",
      opp_ar: "الشركات تهدر 30% من وقتها في مهام إدارية مكررة يمكن ربطها وأتمتتها عبر Make وZapier وAI.",
      opp_en: "Companies waste 30% of their time on manual, repetitive administrative tasks that can be fully automated via Make, Zapier, and AI.",
      client_ar: "الشركات المتوسطة، وكالات التسويق، وأصحاب المتاجر الإلكترونية النشطة.",
      client_en: "Medium-sized businesses, digital agencies, and busy e-commerce founders.",
      usp_ar: "تصميم لوحات تحكم متكاملة تربط جميع أدوات العمل وتعتمد على الـ AI في فرز وتوزيع المهام تلقائياً.",
      usp_en: "Custom integrations that link disparate tools and use AI to automatically parse, tag, and assign tasks.",
      pricing_ar: "أتمتة النظام بالكامل: 3000$ - 7000$ حسب تعقيد الربط.",
      pricing_en: "Workflow build-outs: $3000 - $7000 depending on integrations and AI decision complexity.",
      growth_ar: "دراسات حالة 'قبل وبعد' توضح توفير 20+ ساعة أسبوعياً لفرق العمل.",
      growth_en: "Publish 'Before/After' case studies demonstrating 20+ hours saved per week for operations teams."
    },
    {
      n_ar: "خدمات التعليق الصوتي والدبلجة بالـ AI",
      n_en: "AI Voiceover & Multilingual Dubbing",
      opp_ar: "صناع المحتوى والشركات يرغبون في التوسع عالمياً ودبلجة محتواهم بعدة لغات دون تكلفة الاستوديوهات الباهظة.",
      opp_en: "Content creators and brands want to expand globally by dubbing their assets into multiple languages without high studio costs.",
      client_ar: "منصات التعليم الإلكتروني، قنوات اليوتيوب الكبرى، وشركات التدريب العالمية.",
      client_en: "E-learning platforms, high-traffic YouTube channels, and corporate training departments.",
      usp_ar: "استنساخ أصوات المتحدثين الطبيعية ودبلجتها بدقة عالية مع مزامنة حركة الشفاه بالذكاء الاصطناعي.",
      usp_en: "High-fidelity voice cloning, localized native emotional tones, and AI lip-sync adjustments.",
      pricing_ar: "15$ إلى 30$ لكل دقيقة فيديو مدبلجة، أو اشتراك شهري للشركات.",
      pricing_en: "$15 to $30 per minute of fully dubbed video, or custom monthly enterprise packaging.",
      growth_ar: "ترجمة عينة مجانية مدتها 30 ثانية لأهم فيديوهات العميل وإرسالها له مباشرة ليرى النتيجة بنفسه.",
      growth_en: "Send a free, 30-second localized demo video of the client's own voice to show them the immediate impact."
    },
    {
      n_ar: "تحليل البيانات والتوقعات بالذكاء الاصطناعي",
      n_en: "AI Data Analysis & Predictive Insights",
      opp_ar: "تمتلك الشركات كميات هائلة من البيانات المهملة التي يمكن للذكاء الاصطناعي استخراج توقعات مبيعات وسلوكيات عملاء منها.",
      opp_en: "Businesses sit on goldmines of unstructured data that AI can analyze to forecast sales and discover hidden customer behavior.",
      client_ar: "شركات التجزئة، تطبيق الموبايل، والشركات الناشئة الممولة.",
      client_en: "Retail chains, mobile applications, and funded tech startups.",
      usp_ar: "تحويل جداول البيانات المعقدة إلى لوحات تحكم تفاعلية توضح فرص النمو والجمهور الأكثر ربحية بدقة.",
      usp_en: "Translating raw spreadsheets into clean dashboard graphics and predictive insights that map profitable trends.",
      pricing_ar: "تحليل لمرة واحدة: 2500$ | اشتراك مستمر للتحليل الشهري: 1200$/شهرياً.",
      pricing_en: "One-off setup and audit: $2500 | Ongoing predictive analytics retainer: $1200/mo.",
      growth_ar: "نشر تحليلات دورية لاتجاهات السوق على لينكد إن لكسب سلطة معرفية في مجالك.",
      growth_en: "Share industry-specific predictive market trends on LinkedIn to establish unmatched authority."
    },
    {
      n_ar: "صناعة الفيديو والوسائط الاصطناعية بالـ AI",
      n_en: "AI Video Creation & Synthetic Media",
      opp_ar: "سرعة استهلاك المحتوى المرئي تتطلب إنتاجاً مستمراً وسريعاً للفيديوهات التسويقية والتعليمية.",
      opp_en: "High content consumption rates require brands to produce continuous educational and marketing videos quickly.",
      client_ar: "وكالات التسويق، أقسام الموارد البشرية (فيديوهات تدريبية)، ومنشئو المحتوى.",
      client_en: "Digital marketing agencies, corporate HR departments (onboarding), and social content creators.",
      usp_ar: "إنتاج فيديوهات تسويقية وتوضيحية احترافية باستخدام الأفاتار وتوليد المشاهد دون الحاجة لكاميرات أو استوديوهات.",
      usp_en: "Producing cinematic, engaging promotional videos using AI avatars and synthetic generation, saving 80% on production.",
      pricing_ar: "باقة 10 فيديوهات قصيرة: 800$/شهرياً | فيديو توضيحي طويل: 300$ للفيديو.",
      pricing_en: "Shorts Package (10 videos): $800/mo | Enterprise explainer: $300 per finished minute.",
      growth_ar: "صناعة فيديوهات تجريبية للشركات ونشرها كـ Reels وتيك توك لاستعراض سرعة وجودة الإنتاج.",
      growth_en: "Create quick, catchy demo promos for target companies and tag them on social to spark viral interest."
    },
    {
      n_ar: "استشارات وهندسة الأوامر (Prompt Engineering)",
      n_en: "Prompt Engineering & Consulting",
      opp_ar: "اشترت العديد من الشركات اشتراكات ChatGPT ولكن موظفيها لا يعرفون كيفية صياغة الأوامر للحصول على نتائج دقيقة.",
      opp_en: "Many businesses paid for ChatGPT/Claude licenses, but employees lack the skills to prompt effectively for high-quality outputs.",
      client_ar: "المكاتب الاستشارية، شركات الدعم الفني، وأقسام كتابة المحتوى والترجمة.",
      client_en: "Consulting offices, customer support agencies, and content localization firms.",
      usp_ar: "بناء مكتبة أوامر برمجية مخصصة للشركة وتدريب الموظفين لرفع إنتاجيتهم بنسبة 300% في مهامهم اليومية.",
      usp_en: "Creating custom, battle-tested prompt libraries for enterprise teams and conducting intensive hands-on workshops.",
      pricing_ar: "ورشة عمل وتجهيز الأوامر: 1500$ إلى 3500$ حسب عدد الموظفين والملفات.",
      pricing_en: "Interactive workshop & custom prompt catalog: $1500 to $3500 depending on team size.",
      growth_ar: "نشر نماذج أوامر مجانية فائقة القوة لحل مشاكل شائعة تجعل العملاء يتواصلون معك للتخصيص.",
      growth_en: "Share highly optimized, free cheat sheets of complex prompts on social channels to generate high-intent inbound leads."
    },
    {
      n_ar: "بوتات دردشة مخصصة للمجال الطبي أو القانوني",
      n_en: "Custom AI Chatbot for Medical/Legal",
      opp_ar: "يبحث المرضى والعملاء القانونيون عن إجابات فورية واستشارات أولية دقيقة على مدار الساعة قبل الذهاب للعيادة أو المكتب.",
      opp_en: "Patients and legal clients demand instant, highly accurate preliminary answers before booking expensive physical appointments.",
      client_ar: "العيادات والمراكز الطبية الخاصة، ومكاتب الاستشارات القانونية والمحاماة.",
      client_en: "Private medical clinics, aesthetic centers, and boutique law firms.",
      usp_ar: "بوتات دردشة مخصصة مدربة على كتب وأنظمة سرية ومراجعة بدقة لمنع الهلوسة البرمجية مع الحفاظ على الخصوصية.",
      usp_en: "Developing highly secure, compliant chatbots trained strictly on reviewed documents to prevent any AI hallucination.",
      pricing_ar: "بناء وتكامل البوت: 3000$ + رسوم صيانة دورية 150$/شهرياً.",
      pricing_en: "Bespoke chatbot setup: $3000 upfront + $150/mo maintenance and API optimization retainer.",
      growth_ar: "عرض نسخة تجريبية للبوت على موقع العيادة يفرز الحالات ويقدم توعية فورية للمرضى.",
      growth_en: "Provide a working demo widget customized with the clinic's FAQ to let doctors experience the triage process."
    },
    {
      n_ar: "توليد الصور بالذكاء الاصطناعي للبراندات",
      n_en: "AI Image Generation for Branding",
      opp_ar: "تكاليف جلسات التصوير الاحترافية للبراندات باهظة جداً وتأخذ أسابيع، بينما يمكن للذكاء الاصطناعي توليدها في دقائق.",
      opp_en: "Professional branding photoshoot costs are exorbitant and take weeks of planning, which AI can bypass in minutes.",
      client_ar: "متاجر الـ D2C، براندات التجميل، ومصممو المجوهرات والمنتجات الفاخرة.",
      client_en: "D2C brands, boutique cosmetics, and luxury jewelry/fashion startups.",
      usp_ar: "توليد صور واقعية لمنتجات حقيقية في بيئات خيالية وفخمة للغاية متوافقة تماماً مع الهوية البصرية للبراند.",
      usp_en: "Creating hyper-realistic product imagery placed in premium context settings using advanced stable diffusion/Midjourney.",
      pricing_ar: "باقة 20 صورة منتج فخمة: 600$ | باقة متكاملة للحملات الإعلانية: 1500$.",
      pricing_en: "20 high-fashion product scenes: $600 | Full ad campaign creative generation asset pack: $1500.",
      growth_ar: "إعادة تصميم صور رديئة لمنتجات براندات ناشئة مجاناً وإرسالها لهم كهدية تعارف لكسب العقد.",
      growth_en: "Redesign low-quality product photos of scaling brands and send them the premium AI version to demonstrate potential."
    },
    {
      n_ar: "أدوات التعليم المخصص بالذكاء الاصطناعي",
      n_en: "AI Personalized Education Tools",
      opp_ar: "التعليم التقليدي الموحد للجميع لم يعد فعالاً، والطلاب يبحثون عن مناهج تتكيف مع سرعتهم واهتماماتهم الفردية.",
      opp_en: "One-size-fits-all education is declining. Students and parents seek platforms that adapt dynamically to individual speeds.",
      client_ar: "المدارس الخاصة، منصات الكورسات الكبرى، والمؤسسات التعليمية غير الربحية.",
      client_en: "Private schools, corporate academies, and major e-learning platforms.",
      usp_ar: "بناء أنظمة ذكاء اصطناعي تحلل مستوى الطالب وتقوم بإنشاء اختبارات ومناهج مخصصة لعلاج نقاط ضعفه فوراً.",
      usp_en: "Building adaptive learning algorithms that analyze performance and dynamically construct personalized study paths.",
      pricing_ar: "مشاريع برمجية تبدأ من 8000$ إلى 20,000$ حسب تعقيد المناهج والتكامل.",
      pricing_en: "Enterprise adaptive engine integration: $8000 to $20,000 based on curricula structure.",
      growth_ar: "استهداف مديري التعليم والمدارس الخاصة عبر دراسات حالة لزيادة معدل نجاح الطلاب وتفاعلهم.",
      growth_en: "Reach out to private school directors showing them data on how personalization boosts student engagement."
    },
    {
      n_ar: "تدقيق الأخلاقيات والامتثال لأنظمة AI",
      n_en: "Ethics & AI Compliance Auditing",
      opp_ar: "مع إقرار قوانين صارمة للذكاء الاصطناعي (مثل قانون الاتحاد الأوروبي)، تحتاج الشركات لتدقيق خوارزمياتها لتجنب الغرامات.",
      opp_en: "As governments pass strict AI laws (like the EU AI Act), companies must audit algorithms to avoid massive regulatory fines.",
      client_ar: "مؤسسات التكنولوجيا المالية، شركات البرمجيات، والشركات العالمية الكبرى.",
      client_en: "Fintech startups, corporate software companies, and multinational enterprises using AI automation.",
      usp_ar: "توفير شهادات امتثال قانونية وأخلاقية تؤكد خلو خوارزميات العميل من التحيز وحمايتها لخصوصية المستخدمين.",
      usp_en: "Providing legal-technical audits to certify algorithms are bias-free, secure, and fully compliant with global regulations.",
      pricing_ar: "تقرير التدقيق والامتثال: يبدأ من 4000$ كخدمة لمرة واحدة.",
      pricing_en: "Bespoke compliance audit & report: starts at $4000 depending on algorithm complexity.",
      growth_ar: "نشر محتوى قانوني وتحليلي على لينكد إن يستعرض الثغرات القانونية في تطبيقات الذكاء الاصطناعي الشهيرة.",
      growth_en: "Publish insightful breakdowns of global AI regulations and compliance risks on LinkedIn."
    },
    {
      n_ar: "تطوير برمجيات سحابية (SaaS) مدعومة بـ AI",
      n_en: "AI-Powered SaaS Development",
      opp_ar: "المستثمرون والمستخدمون يبحثون عن أدوات برمجية تحل المشاكل بالكامل باستخدام الذكاء الاصطناعي بدلاً من البرمجيات التقليدية.",
      opp_en: "Users and VC funds actively look for micro-SaaS applications that natively embed AI to solve narrow corporate pain points.",
      client_ar: "رواد الأعمال، الشركات الناشئة المبتدئة، والشركات التقليدية الباحثة عن الابتكار.",
      client_en: "Independent founders, early-stage startups, and traditional enterprises wanting digital tools.",
      usp_ar: "تطوير نماذج أولية سريعة (MVP) لمنتجات برمجية ذكية بأعلى أداء وفي وقت قياسي باستخدام المكونات الحديثة.",
      usp_en: "Rapid MVP prototyping and development of highly scalable SaaS utilities with native API integrations in record time.",
      pricing_ar: "بناء النموذج الأولي (MVP): 6000$ - 15,000$ حسب تعقيد المزايا.",
      pricing_en: "MVP Build-out: $6000 to $15,000 based on functional workflows and integrations.",
      growth_ar: "إطلاق المنتجات على Product Hunt وتوثيق رحلة البناء التقنية (Build in Public) لجذب الأنظار.",
      growth_en: "Launch on Product Hunt, leverage 'Build in Public' on X/Twitter and LinkedIn to capture immediate user signups."
    }
  ],
  business: [
    {
      n_ar: "إطلاق الكورسات عالية القيمة (High Ticket)",
      n_en: "High-Ticket Online Course Launch",
      opp_ar: "طلب متزايد على التعليم المتخصص والنتائج المضمونة؛ العملاء مستعدون لدفع مبالغ كبيرة للوصول المباشر للخبراء.",
      opp_en: "High demand for specialized, transformational learning. Clients pay top dollar for direct access to expert systems.",
      client_ar: "الاستشاريون، الكوتشز، والمدراء التنفيذيون الذين يريدون تسييل معرفتهم.",
      client_en: "Consultants, expert coaches, and senior executives looking to monetize their deep domain knowledge.",
      usp_ar: "تصميم المناهج وبناء نظام مبيعات يعتمد على المقابلات وحجز المكالمات بدلاً من أقماع المبيعات التقليدية الرخيصة.",
      usp_en: "Designing transformation-first curricula and setting up high-conversion application-based sales funnels.",
      pricing_ar: "البرنامج: 1500$ - 5000$ لكل طالب | رسوم الخدمة لبناء النظام: 5000$ أو نسبة شراكة.",
      pricing_en: "Student Price: $1500 - $5000 | Setup Fee: $5000 plus percentage of launch revenue.",
      growth_ar: "إعلانات إعادة استهداف موجهة لـ VSL مدته 15 دقيقة يؤدي لحجز مكالمة استشارية.",
      growth_en: "Run hyper-targeted ads pointing to a 15-minute value-first VSL, driving direct calls with qualified leads."
    },
    {
      n_ar: "خدمات المدير التشغيلي بنظام الكسر (Fractional COO)",
      n_en: "Fractional COO/CMO Services",
      opp_ar: "الشركات الناشئة التي تنمو بسرعة لا تملك ميزانية كافية لتوظيف مدير تشغيلي بدوام كامل بمراتب ضخم ولكنها تحتاج لخبرته.",
      opp_en: "Fast-growing startups cannot afford the $150k+ salary of a full-time COO/CMO but desperately need operational leadership.",
      client_ar: "الشركات الناشئة في مرحلة البذور (Seed) أو النمو المالي المتسارع التي تضم 10-50 موظفاً.",
      client_en: "Seed-stage or Series A startups with 10-50 employees seeking execution management.",
      usp_ar: "تنظيم العمليات، هيكلة الفرق، ورفع كفاءة تسليم المشاريع بـ 15 ساعة عمل أسبوعياً فقط.",
      usp_en: "Instilling operational hygiene, restructuring internal processes, and boosting output in just 15 hours a week.",
      pricing_ar: "اشتراك شهري (Retainer): 2500$ - 5000$/شهر للمتابعة التشغيلية ووضع الخطط.",
      pricing_en: "Monthly retainer: $2500 - $5000 depending on business complexity and team size.",
      growth_ar: "التسويق بالمحتوى المتخصص في هيكلة الشركات وتحسين العمليات على لينكد إن، واستخلاص العبر من إخفاقات الشركات الأخرى.",
      growth_en: "Write detailed breakdown posts about process bottlenecks and team structure on LinkedIn to capture CEO interest."
    },
    {
      n_ar: "أنظمة وثقافة العمل عن بعد للشركات",
      n_en: "Remote Team Culture & Systems",
      opp_ar: "تواجه الشركات صعوبات في الحفاظ على إنتاجية وترابط الموظفين في بيئات العمل عن بعد.",
      opp_en: "Companies struggle to maintain high productivity, alignment, and team morale in fully remote setups.",
      client_ar: "الشركات التقنية والخدمية التي تتبنى نموذج العمل عن بعد بالكامل.",
      client_en: "Tech and digital service businesses with fully distributed global workforces.",
      usp_ar: "تجهيز وتصميم أنظمة توثيق وتواصل واضحة (Asynchronous Work) تنهي الاجتماعات غير الضرورية.",
      usp_en: "Building clean async collaboration structures and documentation systems that eliminate meeting fatigue.",
      pricing_ar: "تطوير الأنظمة وتدريب الإدارة: 4000$ إلى 9000$.",
      pricing_en: "System setup, tool migration, and management training: $4000 to $9000.",
      growth_ar: "مخاطبة أصحاب الأعمال بتقرير يوضح انخفاض التكاليف وزيادة الاحتفاظ بالموظفين بنسبة 40% عند تطبيق العمل غير المتزامن.",
      growth_en: "Promote whitepapers demonstrating a 40% boost in talent retention and drop in overhead through modern async workflows."
    },
    {
      n_ar: "براندينج شخصي للمدراء التنفيذيين",
      n_en: "Executive Personal Branding",
      opp_ar: "يبني الناس الثقة مع الأشخاص وليس الشعارات؛ يبحث التنفيذيون عن حضور قوي على لينكد إن لجذب المواهب والعملاء.",
      opp_en: "People trust individuals more than logos. Senior executives seek powerful social presence to attract top talent and clients.",
      client_ar: "المدراء التنفيذيون، المؤسسون، والشركاء في مكاتب المحاماة والاستشارات.",
      client_en: "C-suite executives, tech startup founders, and managing partners in consulting firms.",
      usp_ar: "إدارة متكاملة للحساب (Ghostwriting) تستخلص أفكار العميل وخبراته وتحولها إلى محتوى متفاعل وراقٍ ومؤثر.",
      usp_en: "End-to-end profile optimization and ghostwriting that extracts executive thoughts into high-authority social content.",
      pricing_ar: "باقة كاملة تشمل المحتوى والتفاعل: 2000$ - 4000$/شهرياً.",
      pricing_en: "Premium ghostwriting & engagement retainer: $2000 - $4000/mo depending on output frequency.",
      growth_ar: "تحديد قائمة بالتنفيذيين ذوي الحسابات الضعيفة وإرسال منشورين مخصصين ومصاغين بأسلوبهم لإظهار الفرق.",
      growth_en: "Identify executives with outdated profiles and pitch them with 2 pre-written high-quality posts tailored to their style."
    },
    {
      n_ar: "عروض الشركات الناشئة وجذب الاستثمارات",
      n_en: "Startup Pitch Deck & Fundraising",
      opp_ar: "تمتلك الكثير من الشركات الناشئة أفكاراً ممتازة ولكنها تخسر الاستثمار بسبب ضعف عرض الفكرة وهيكلتها المالية للجمهور.",
      opp_en: "Brilliant tech startups fail to raise capital simply because they present weak stories and unoptimized financial models.",
      client_ar: "مؤسسو الشركات الناشئة في مرحلة التمويل المبكر (Pre-seed / Seed).",
      client_en: "Early-stage startup founders preparing for pre-seed or seed fundraising rounds.",
      usp_ar: "دمج السرد القصصي المقنع مع الهيكلة المالية الدقيقة وتصميم عروض بصرية مذهلة تجذب انتباه المستثمرين.",
      usp_en: "Crafting compelling narratives combined with solid financial models and premium visual presentations that secure term sheets.",
      pricing_ar: "تصميم وهيكلة العرض بالكامل: 3000$ إلى 6000$.",
      pricing_en: "Comprehensive pitch deck strategy, content design, and financial narrative: $3000 - $6000.",
      growth_ar: "التواجد في مساحات العمل المشتركة وحاضنات الأعمال، وتقديم ورش عمل مجانية حول أساسيات مقابلة المستثمر.",
      growth_en: "Partner with incubator programs and co-working spaces to deliver workshops on pitch-deck fundamentals."
    },
    {
      n_ar: "استراتيجية وبناء منظومة المنتجات الرقمية",
      n_en: "Digital Product Strategy & Ecosystems",
      opp_ar: "رغبة الشركات في تنويع مصادر دخلها عبر بناء منتجات رقمية (أدلة، قوالب، دورات مسجلة) سهلة التوسع وهامش ربحها 100%.",
      opp_en: "Companies want to diversify revenue streams by building highly scalable digital assets (templates, tools, pre-recorded guides).",
      client_ar: "الشركات الخدمية، صناع المحتوى أصحاب الجماهير الكبيرة، ووكالات الاستشارات.",
      client_en: "B2B service providers, high-reach content creators, and corporate training agencies.",
      usp_ar: "تصميم وبناء عائلة منتجات متكاملة تقود العميل بسلاسة من المنتجات المجانية إلى المنتجات عالية القيمة تلقائياً.",
      usp_en: "Structuring value ladders and backend automated sales flows that maximize customer lifetime value (LTV).",
      pricing_ar: "استراتيجية وتدشين منظومة المنتجات: تبدأ من 5000$.",
      pricing_en: "Product strategy and funnel ecosystem build-out: starts at $5000 upfront.",
      growth_ar: "استعراض لوحات تحكم وأرقام مبيعات حقيقية لمنتجات رقمية تعمل بالخلفية وتدر أرباحاً سلبية متنامية.",
      growth_en: "Publish analytics screenshots demonstrating passive income and lead capture generated by backend digital ecosystems."
    },
    {
      n_ar: "أنظمة أتمتة المبيعات للشركات B2B",
      n_en: "B2B Sales Automation Systems",
      opp_ar: "تقضي فرق المبيعات B2B نصف وقتها في إرسال رسائل المتابعة يدوياً، مما يؤدي إلى خسارة صفقات هامة وضياع الفرص.",
      opp_en: "B2B sales reps spend half their days sending follow-up emails, resulting in slow sales cycles and lost opportunities.",
      client_ar: "شركات الـ SaaS، وكالات التسويق، ومقدمو الخدمات الاحترافية للمؤسسات.",
      client_en: "SaaS startups, enterprise agencies, and professional corporate service providers.",
      usp_ar: "بناء أقماع مبيعات إلكترونية متكاملة للمراسلات الباردة (Outbound Systems) تأتي بمكالمات مؤهلة تلقائياً.",
      usp_en: "Setting up fully automated cold email, CRM pipeline, and booking workflows that schedule warm sales meetings.",
      pricing_ar: "بناء وتجهيز النظام بالكامل: 4000$ + باقة إدارة شهرية 1000$.",
      pricing_en: "Sales infrastructure setup: $4000 + monthly optimization and lead-scraping management package: $1000/mo.",
      growth_ar: "إطلق حملات مراسلة باردة فائقة التخصيص تستهدف صناع القرار وتستعرض كفاءة النظام عملياً.",
      growth_en: "Run ultra-personalized outbound sequences targeting corporate executives, illustrating the tool's effectiveness live."
    },
    {
      n_ar: "تحول الأعمال المستدام والأخضر",
      n_en: "Sustainable Business Transformation",
      opp_ar: "أصبح المستهلكون يفضلون الشركات الصديقة للبيئة، بالإضافة لفرض الحكومات شروط استدامة جديدة على الشركات.",
      opp_en: "Global consumer preference shifting toward eco-friendly brands, combined with strict corporate environmental regulations.",
      client_ar: "شركات التصنيع الغذائي، براندات التعبئة والتغليف، والمتاجر التقليدية الكبرى.",
      client_en: "Food manufacturers, packaging companies, and scaling retail brands aiming for green certification.",
      usp_ar: "مساعدة الشركات على تقليل بصمتها الكربونية وإعادة هيكلة سلاسل الإمداد لتصبح خضراء ومربحة في آن واحد.",
      usp_en: "Structuring audit plans that reduce waste, source sustainable packaging, and lower production costs concurrently.",
      pricing_ar: "استشارة وتخطيط التحول المستدام: 5000$ - 12,000$.",
      pricing_en: "Sustainability auditing and brand alignment blueprint: $5000 to $12,000 based on operations.",
      growth_ar: "استعراض قصص نجاح لشركات قللت تكاليف الطاقة والتعبئة بفضل التحول الأخضر بنسب واضحة.",
      growth_en: "Publish green case studies highlighting how sustainability cuts material costs and boosts brand loyalty."
    },
    {
      n_ar: "استراتيجية ونمو الشركات البرمجية المصغرة",
      n_en: "Micro-SaaS Strategy & Growth",
      opp_ar: "سهولة تطوير الأدوات البرمجية المصغرة تعني أن التحدي الحقيقي أصبح في إطلاقها والتسويق لها بشكل مربح وسريع.",
      opp_en: "Low build barriers mean the primary challenge for micro-SaaS is distribution, user retention, and pricing optimization.",
      client_ar: "المبرمجون المستقلون ورواد الأعمال أصحاب المنتجات البرمجية المصغرة.",
      client_en: "Solo developers and boot-strapped micro-SaaS founders seeking product-market fit.",
      usp_ar: "هندسة التسعير الذكي، بناء برامج الولاء وإحالة المستخدمين، وصياغة خطة نمو منخفضة التكاليف (Organic Growth).",
      usp_en: "Structuring viral loops, optimizing monthly/annual pricing plans, and mapping zero-ad distribution strategies.",
      pricing_ar: "بناء خطة الإطلاق والنمو: 3000$ أو شراكة بنسبة من العوائد المتكررة (MRR).",
      pricing_en: "Growth strategy consulting: $3000 one-off or performance equity based on MRR growth.",
      growth_ar: "نشر ومشاركة تقارير أسبوعية تفصيلية لنمو منتجاتنا على منصات رواد الأعمال والمجتمعات التقنية.",
      growth_en: "Share highly transparent 'Build in Public' reports on X/Twitter and SaaS growth communities."
    },
    {
      n_ar: "استراتيجية نجاح العملاء والاحتفاظ بهم",
      n_en: "Customer Success & Retention Strategy",
      opp_ar: "تكلفة اكتساب عميل جديد تضاعفت 5 مرات؛ الشركات تفقد أرباحها بسبب ضعف استبقاء العملاء الحاليين.",
      opp_en: "Customer acquisition cost (CAC) has surged 5x. Businesses bleed profit because of poor post-purchase retention (churn).",
      client_ar: "شركات البرمجيات ذات الاشتراكات، متاجر البيع الدوري، ومنصات الخدمات المستمرة.",
      client_en: "Subscription box companies, SaaS platforms, and recurring agency service providers.",
      usp_ar: "تصميم رحلة onboarding مذهلة للعميل تقلل إلغاء الاشتراكات بنسبة 30% وترفع القيمة الإجمالية للعميل.",
      usp_en: "Re-engineering the customer onboarding journey and setting up automatic feedback loops that drive down churn.",
      pricing_ar: "استشارة وتدشين نظام استبقاء العملاء: تبدأ من 3500$.",
      pricing_en: "Retention audit and automated customer success setup: starts at $3500.",
      growth_ar: "مخاطبة الرؤساء التنفيذيين بتقرير مقارنة يوضح أثر زيادة الاستبقاء بنسبة 5% على أرباحهم الصافية.",
      growth_en: "Publish ROI models showing how a small 5% decrease in churn doubles a company's bottom-line profitability."
    },
    {
      n_ar: "عافية الشركات والوقاية من الاحتراق الوظيفي",
      n_en: "Corporate Wellness & Burnout Prevention",
      opp_ar: "تخسر الشركات ملايين الدولارات سنوياً بسبب الغيابات الناتجة عن التوتر والاحتراق الوظيفي لفرق العمل.",
      opp_en: "Enterprises lose millions annually due to sick leaves and low productivity caused by severe employee burnout.",
      client_ar: "شركات التكنولوجيا الكبرى، الوكالات الإبداعية، والشركات ذات ضغط العمل المرتفع.",
      client_en: "Fast-paced tech organizations, top-tier creative agencies, and high-pressure sales corporations.",
      usp_ar: "برامج تفاعلية متكاملة تجمع بين الصحة النفسية والجسدية للموظفين لزيادة الكفاءة والإنتاجية بنسب حقيقية.",
      usp_en: "Designing dynamic wellness frameworks that blend mental health, stress management workshops, and team ergonomics.",
      pricing_ar: "عقد رعاية وعافية للشركات: يبدأ من 2000$/شهرياً للشركات المتوسطة.",
      pricing_en: "Corporate wellness retainer: starts at $2000/mo including custom workshops and feedback surveys.",
      growth_ar: "نشر استطلاعات رأي ودراسات حول بيئات العمل الصحية وأثرها في بقاء أفضل المواهب في شركتك.",
      growth_en: "Deliver LinkedIn posts contrasting toxic work environments vs high-retention empathetic corporate cultures."
    },
    {
      n_ar: "استشارات تحسين سلاسل الإمداد",
      n_en: "Supply Chain Optimization Consulting",
      opp_ar: "تقلبات السوق العالمي تتطلب من الشركات تنويع مصادر توريدها وتخفيض تكاليف الشحن والتخزين لضمان المنافسة.",
      opp_en: "Global supply chain disruptions force businesses to diversify suppliers and optimize inventory overheads to compete.",
      client_ar: "شركات التجارة الإلكترونية التي تصنع منتجاتها، وموزعو المنتجات المادية.",
      client_en: "Private label e-commerce brands, physical product manufacturers, and mid-sized distributors.",
      usp_ar: "إعادة التفاوض مع الموردين، وإدخال تقنيات التنبؤ بالمخزون لتقليل الهدر المالي والتخزيني بنسبة 25%.",
      usp_en: "Sourcing alternative factories, implementing automated inventory forecasting, and slashing logistics costs by 25%.",
      pricing_ar: "مشروع تحسين متكامل: يبدأ من 6000$ أو نسبة من تكاليف الشحن الموفرة.",
      pricing_en: "Comprehensive logistics audit and optimization setup: $6000 or 15% of verified logistics savings.",
      growth_ar: "نشر تحليلات لأزمات الشحن الحالية وكيفية التغلب عليها لحماية هوامش أرباح التجار.",
      growth_en: "Publish regular supply chain and shipping market updates explaining how brands can bypass major freight backlogs."
    },
    {
      n_ar: "استراتيجية دمج الذكاء الاصطناعي في فرق العمل",
      n_en: "AI Integration Strategy for Teams",
      opp_ar: "رغبة الإدارات في خفض التكاليف وتوظيف الذكاء الاصطناعي، ولكنهم يفتقرون للرؤية لتطبيقه عملياً دون تعطيل الإنتاج.",
      opp_en: "B2B leaders want to adopt AI systems to cut costs but lack a pragmatic roadmap to implement it safely without friction.",
      client_ar: "الشركات المتوسطة التي ترغب في تدريب موظفيها على دمج أدوات الـ AI في مهامهم اليومية.",
      client_en: "Traditional service firms and mid-market corporations looking to upskill their teams.",
      usp_ar: "مخطط طريق مخصص لدمج أدوات الـ AI لكل موظف وتحديد الفرص الواضحة لتوفير الوقت في كل قسم.",
      usp_en: "Bespoke department-by-department AI blueprint mapping specific tool sets and workflows to drive down operational time.",
      pricing_ar: "تصميم الاستراتيجية وتدريب الفريق: 5000$ - 12,000$ حسب حجم الشركة.",
      pricing_en: "Bespoke audit, workflow design, and employee training: $5000 to $12,000 based on head count.",
      growth_ar: "مشاركة فيديوهات دراسات حالة توضح كيف تحول موظفو المحاسبة أو التسويق إلى كفاءات خارقة بفضل الـ AI.",
      growth_en: "Publish video walkthroughs highlighting traditional teams doubling output using modern custom-tailored AI processes."
    },
    {
      n_ar: "الربح من حقوق الملكية الفكرية وبراءات الاختراع",
      n_en: "Intellectual Property Monetization",
      opp_ar: "تمتلك العديد من الشركات والمبتكرين أصولاً فكرية وبراءات اختراع مهملة يمكن ترخيصها وبيعها لجهات كبرى.",
      opp_en: "Many innovators and established firms own unused intellectual property, designs, and patents that can be highly profitable to license.",
      client_ar: "المخترعون، براءات الاختراع الناشئة، والشركات التقنية الباحثة عن تسييل أصولها غير الملموسة.",
      client_en: "Independent inventors, early-stage patent holders, and legacy firms with underutilized proprietary tech.",
      usp_ar: "هيكلة صفقات الترخيص والمفاوضات القانونية لضمان عائدات مادية مستمرة (Royalties) بأمان تام.",
      usp_en: "Structuring rock-solid licensing deals, valuing proprietary IP assets, and handling high-stakes corporate negotiations.",
      pricing_ar: "عقد استشاري: 5000$ مقدم + نسبة 10% من صفقات الترخيص الناجحة.",
      pricing_en: "Upfront advisory retainer: $5000 + 10% performance fee on successfully brokered licensing deals.",
      growth_ar: "نشر محتوى قانوني تجاري على لينكد إن يوضح كيفية تقييم الأصول الرقمية والفكرية باحترافية.",
      growth_en: "Write educational articles detailing IP evaluation methods and historic successful patent licensing deals."
    },
    {
      n_ar: "التحضير لبيع الشركات والاندماج والاستحواذ",
      n_en: "Business Exit & M&A Preparation",
      opp_ar: "يرغب العديد من أصحاب الشركات في بيع مشاريعهم والخروج منها، ولكنهم يخسرون نصف قيمتها بسبب عدم التحضير المنظم للبيع.",
      opp_en: "Founder exits are surging, yet business owners leave millions on the table due to poor corporate prep and chaotic bookkeeping.",
      client_ar: "مؤسسو الشركات وأصحاب المشاريع الذين يخططون للبيع والخروج خلال 1-3 سنوات قادمة.",
      client_en: "SMB founders and digital business owners seeking profitable exits within the next 12 to 36 months.",
      usp_ar: "تنظيف العمليات والمالية وتنظيم الهيكل القانوني لرفع قيمة التقييم وجذب المشترين الكبار.",
      usp_en: "De-risking operations, cleaning up financial statements, and packaging assets to secure maximum valuation multiples.",
      pricing_ar: "عقد تجهيز متكامل: يبدأ من 8000$ + نسبة من قيمة صفقة البيع الناجحة.",
      pricing_en: "Exit readiness retainer: starts at $8000 + 1.5% to 3% broker success fee upon acquisition completion.",
      growth_ar: "تقديم استشارات تقييم سرية ومجانية لأصحاب الشركات لبناء علاقة ثقة وجذب صفقات دسمة.",
      growth_en: "Conduct highly confidential, free value-multiplier assessments for high-net-worth business owners."
    }
  ],
  marketing: [
    {
      n_ar: "تحسين الظهور في محركات بحث الذكاء الاصطناعي",
      n_en: "Generative Engine Optimization (GEO)",
      opp_ar: "مع التحول نحو محركات الذكاء الاصطناعي في البحث، تبحث الشركات عن مصممي استراتيجيات لضمان ظهور منتجاتها في ترشيحات الـ AI.",
      opp_en: "As search transforms into AI-generated synthesis, companies seek specialized agencies to ensure their placement in AI citations.",
      client_ar: "شركات الـ SaaS، ومقدمو الخدمات الفاخرة، ومتاجر التجزئة المرموقة.",
      client_en: "SaaS startups, premium agency providers, and high-end consumer brands.",
      usp_ar: "بناء ملفات تعريفية وبيانات مهيكلة وصديقة لخوارزميات LLMs لضمان ذكر اسمك كخيار أول في المحادثات.",
      usp_en: "Creating custom semantic networks, structured data architectures, and positive reference footprints that LLMs favor.",
      pricing_ar: "عقد شهري: 2500$ لتطوير ومراقبة حضور العلامة التجارية في محركات الـ AI.",
      pricing_en: "Strategic retainer starting at $2500/mo for optimizing and tracking search footprint in LLM indexes.",
      growth_ar: "مقارنة ظهور البراند بالذكاء الاصطناعي مع منافسيه، وتوضيح الخلل المالي الناتج عن الغياب عن هذه الترشيحات.",
      growth_en: "Send tailored video audits showcasing how competitors capture AI mentions while the prospect is left out."
    },
    {
      n_ar: "استراتيجية محتوى UGC للتيك توك والريلز",
      n_en: "UGC Content Strategy for TikTok/Reels",
      opp_ar: "المستهلكون يثقون في الناس الحقيقيين؛ تحتاج المتاجر لتغذية مستمرة بفيديوهات UGC لإنستغرام وتيك توك للحملات الإعلانية.",
      opp_en: "Modern buyers trust real faces. E-commerce stores require a constant stream of high-converting UGC assets for ad platforms.",
      client_ar: "متاجر التجارة الإلكترونية D2C، وتطبيقات الجوال، وعلامات نمط الحياة (Lifestyle).",
      client_en: "D2C e-commerce stores, consumer mobile apps, and direct-to-consumer lifestyle brands.",
      usp_ar: "إدارة متكاملة لشبكة صناع محتوى UGC وكتابة نصوص البيع الإعلانية (Hooks) لضمان تحقيق أعلى عائد إعلاني ROAS.",
      usp_en: "Handling writer-scripts, hiring creators, editing hooks, and delivering high-ROI organic-feeling ad creatives.",
      pricing_ar: "باقة 10 فيديوهات UGC جاهزة للإعلانات: 1500$/شهرياً.",
      pricing_en: "10 edited, high-converting UGC video assets: $1500/mo.",
      growth_ar: "عرض فيديوهات قصيرة مع مقارنة أداء إعلانات الصور التقليدية مقابل فيديوهات الـ UGC من حيث تكلفة النقرة والتحويل.",
      growth_en: "Publish visual breakdowns showing massive CPA drops when switching from static ads to structured UGC scripts."
    },
    {
      n_ar: "التسويق عبر الإيميل فائق التخصيص",
      n_en: "Hyper-Personalized Email Marketing",
      opp_ar: "تمتلك المتاجر الإلكترونية قوائم بريدية ضخمة ولكنها مهملة ولا ترسل سوى رسائل عامة مزعجة تؤدي لنتائج متدنية.",
      opp_en: "E-commerce stores sit on large subscriber lists but only send spammy, batch-and-blast newsletters that yield tiny sales.",
      client_ar: "متاجر شوبيفاي النشطة التي تدر أكثر من 20,000$ شهرياً.",
      client_en: "Active Shopify stores generating $20k+ in monthly revenue seeking optimized retention.",
      usp_ar: "تصميم رحلات بريدية مؤتمتة فائقة التخصيص بناءً على سلوك العميل لرفع مبيعات البريد بنسبة 30%.",
      usp_en: "Building behavioral-triggered flows (cart abandon, post-purchase, VIP) that unlock 30%+ of total store revenue.",
      pricing_ar: "تجهيز وتصميم الرسائل التلقائية: 2000$ + رسوم إدارة شهرية 1200$ أو نسبة من المبيعات.",
      pricing_en: "Initial flows setup: $2000 + monthly campaign management retainer of $1200 or revenue-share split.",
      growth_ar: "تقديم تدقيق مجاني لحساب Klaviyo للعميل وتحديد الأموال الضائعة بسبب غياب بعض رسائل المتابعة الأساسية.",
      growth_en: "Offer a free 5-point Klaviyo flow audit showing founders the exact amount of abandoned cart revenue they currently leak."
    },
    {
      n_ar: "نمو وتحقيق الربح من البودكاست",
      n_en: "Podcast Growth & Monetization",
      opp_ar: "أصبح البودكاست أداة قوية لبناء السلطة والولاء، ولكن أصحابه يعانون من صعوبة الانتشار والحصول على رعايات حقيقية.",
      opp_en: "Podcasts build massive customer intimacy and brand authority, yet creators struggle with distribution and securing major sponsorships.",
      client_ar: "الشركات الكبرى، أصحاب العلامات الشخصية، ورواد الأعمال أصحاب البودكاست الناشئ.",
      client_en: "B2B corporations, established personal brands, and independent high-production podcasters.",
      usp_ar: "إعادة تعبئة حلقة البودكاست إلى 20 فيديو قصير وتدوينات ومنشورات لينكد إن لضمان انتشارها، مع جذب الرعاة الرسميين.",
      usp_en: "Content atomization (cutting episodes into 20+ viral short clips) and pitching premium sponsors using media kits.",
      pricing_ar: "إدارة وتحرير وتسويق البودكاست: تبدأ من 1500$/شهرياً لحل متكامل.",
      pricing_en: "Full podcast production, editing, and distribution package: starts at $1500/mo.",
      growth_ar: "نشر عينات قصيرة ومبهرة (Clips) ذات جودة سينمائية على يوتيوب شورتس وإنستغرام لجذب ملايين المشاهدات للبودكاست.",
      growth_en: "Showcase cinematic audiograms and short hooks on TikTok and Reels, pointing viewers back to full episodes."
    },
    {
      n_ar: "تسويق Pinterest لمتاجر التجارة الإلكترونية",
      n_en: "Pinterest Marketing for E-commerce",
      opp_ar: "منصة بينترست هي منجم ذهب مهمل؛ مستخدموها يدخلون بنية شراء عالية جداً مقارنة بأي منصة تواصل أخرى.",
      opp_en: "Pinterest is an untapped traffic source. Users browse with very high purchase intent compared to other scroll-heavy networks.",
      client_ar: "متاجر الديكور المنزلي، الأزياء والمجوهرات، منتجات الأطفال، والبراندات الفنية الإبداعية.",
      client_en: "Home decor, lifestyle fashion, arts & crafts, and parenting D2C e-commerce brands.",
      usp_ar: "تصميم صور (Pins) جذابة متوافقة مع محركات البحث تجلب زيارات مجانية ومبيعات مستمرة للمتجر لسنوات.",
      usp_en: "SEO-optimized visual rich pins and automated catalog syncs that generate high-value organic referral sales.",
      pricing_ar: "إدارة وتصميم حساب Pinterest: 1000$ - 1800$/شهرياً حسب حجم المنتجات.",
      pricing_en: "Pinterest visual management & SEO pinning retainer: $1000 - $1800/mo.",
      growth_ar: "استعراض لوحات تحكم وحجم الزيارات المجانية التي تأتي للمتاجر من Pinterest لسنوات من صورة واحدة فقط.",
      growth_en: "Share analytics screenshots displaying massive referral traffic spikes generated entirely by organic pin indexing."
    },
    {
      n_ar: "إدارة ونمو المجتمعات الرقمية",
      n_en: "Community Management & Growth",
      opp_ar: "تتحول العلامات التجارية من منصات بث أحادية الاتجاه إلى بناء مجتمعات تفاعلية حية تضمن أعلى درجات الولاء.",
      opp_en: "Brands are shifting from one-way publishing to building highly engaged interactive digital communities to secure loyalty.",
      client_ar: "مبتكرو منصات التعليم الرقمي، شركات الـ SaaS، والجمعيات المهنية التخصصية.",
      client_en: "E-learning platform creators, high-growth SaaS companies, and professional membership networks.",
      usp_ar: "إدارة نشطة وتفعيل النقاشات وحل مشكلات الأعضاء على مدار الساعة عبر سكايل (Skool) أو ديسكورد أو فيسبوك.",
      usp_en: "Setting up custom onboarding, designing gamified milestones, and maintaining 24/7 moderation (Skool, Discord, Slack).",
      pricing_ar: "إدارة وتنمية المجتمع الرقمي: 1200$ - 2500$/شهرياً حسب النشاط والأعضاء.",
      pricing_en: "Digital community design, moderation, and gamification retainer: $1200 - $2500/mo.",
      growth_ar: "دعوة جمهور العميل العام إلى أحداث مباشرة مجانية ومتميزة وورش عمل حية لتسهيل تحولهم إلى أعضاء مجتمع فعالين.",
      growth_en: "Host highly interactive monthly live workshops and events to smoothly transition casual audience into community members."
    },
    {
      n_ar: "كتابة الإعلانات بنظام الاستجابة المباشرة",
      n_en: "Direct Response Copywriting",
      opp_ar: "تصرف الشركات آلاف الدولارات على إعلانات جميلة لا تؤدي إلى أي مبيعات حقيقية لغياب نصوص البيع المقنعة.",
      opp_en: "Brands waste massive budgets running beautiful ads that fail to convert due to a complete lack of persuasive sales copy.",
      client_ar: "صفحات الهبوط للمنتجات الفردية، حملات البريد الإلكتروني الإعلانية، ومروجو الكورسات والخدمات الكبرى.",
      client_en: "Funnel designers, course creators, and D2C brands launching high-conversion advertising campaigns.",
      usp_ar: "كتابة نصوص تسويقية تعتمد على علم النفس الشرائي والـ Hooks القوية لتحفيز العميل على اتخاذ قرار الشراء الفوري.",
      usp_en: "Writing high-converting sales letters, email funnels, and video hooks based on deep buyer psychology principles.",
      pricing_ar: "صفحة هبوط كاملة: 800$ - 2000$ | باقة رسائل بريد إعلانية: 500$.",
      pricing_en: "Full long-form sales page copy: $800 - $2000 | Custom promotional email sequence: $500.",
      growth_ar: "إعادة كتابة عناوين ونصوص إعلانية رديئة للعميل المتوقع وعرض النسخة الجديدة المحدثة عليه مع شرح الفوائد النفسية.",
      growth_en: "Analyze a client's current underperforming ad, rewrite the hook for free, and pitch them the conversion science behind it."
    },
    {
      n_ar: "إدارة علاقات المؤثرين للبراندات",
      n_en: "Influencer Relationship Management",
      opp_ar: "إدارة حملات المؤثرين والتفاوض معهم عملية مرهقة وتأكل الوقت، وتفشل الشركات فيها غالباً لضعف الاختيار والمتابعة.",
      opp_en: "Influencer sourcing, outreach, and negotiation is exhausting. Brands struggle to select high-ROI authentic partners.",
      client_ar: "براندات الأزياء والتجميل، والأغذية والمشروبات الفاخرة (F&B) الموجهة للمستهلكين.",
      client_en: "Consumer D2C brands, luxury skincare startups, and retail F&B franchises.",
      usp_ar: "اختيار دقيق للمؤثرين المتوافقين مع هوية العلامة التجارية وإدارة تفاوض احترافية تضمن أفضل الأسعار وحقوق المحتوى.",
      usp_en: "Data-driven micro-influencer selection, negotiating cost-effective content usage rights, and seamless campaign management.",
      pricing_ar: "رسوم الإدارة: 15% من ميزانية حملة المؤثرين، أو باقة ثابتة تبدأ من 1500$/شهرياً.",
      pricing_en: "Influencer management retainer starting at $1500/mo, or 15% of the total monthly campaign budget.",
      growth_ar: "إرسال تقرير تحليلي يوضح تزييف أرقام بعض المؤثرين المقترحين لحماية ميزانية العميل وتوفير البدائل الحقيقية.",
      growth_en: "Provide value audits for prospects exposing fake follower statistics on their current roster, offering authentic alternatives."
    },
    {
      n_ar: "إدارة الإعلانات المدفوعة (Paid Media)",
      n_en: "Paid Media Management (Ads)",
      opp_ar: "تزايد الطلب على خبراء الإعلانات المدفوعة القادرين على توليد عملاء ومبيعات حقيقية بذكاء بدلاً من مجرد إهدار المال.",
      opp_en: "Brands require world-class performance marketers who generate actual pipeline sales instead of wasting budget on vanity metrics.",
      client_ar: "أصحاب المتاجر الإلكترونية، ومقدمو الخدمات الاستشارية الكبرى الباحثون عن نمو رقمي حقيقي.",
      client_en: "Established D2C brands, e-commerce stores, and high-ticket service firms.",
      usp_ar: "تحليل وتتبع دقيق للمبيعات، وتحسين مستمر للحملات على فيسبوك وجوجل وتيك توك لتحقيق أعلى ROAS ممكن.",
      usp_en: "Robust pixel/server attribution tracking, strict daily testing methodology, and media scaling optimized for net margin.",
      pricing_ar: "اشتراك شهري: 1500$ أو 10% من الإنفاق الإعلاني شهرياً (أيهما أكبر).",
      pricing_en: "Monthly retainer: $1500/mo or 10% of monthly ad spend (whichever is higher).",
      growth_ar: "تحديد ثغرات الاستهداف وحملات الـ Retargeting الضائعة لدى العميل وكيف سنقوم بحلها لمضاعفة عائداته فوراً.",
      growth_en: "Provide a quick video audit identifying tracking leaks and ad waste in their current Meta/Google ad accounts."
    },
    {
      n_ar: "تصميم وهيكلة أقماع البيع (Sales Funnels)",
      n_en: "Sales Funnel Architecture",
      opp_ar: "المواقع التقليدية لا تبيع؛ تحتاج الشركات إلى مسارات مبيعات خطوة بخطوة تقود العميل للشراء وتزيد متوسط الطلب AOV.",
      opp_en: "Static websites do not sell. Modern businesses need step-by-step conversion funnels that maximize average order value (AOV).",
      client_ar: "بائعو الكورسات الرقمية، ومقدمو الاشتراكات السنوية، والخدمات عالية القيمة.",
      client_en: "Digital course creators, B2B service firms, and high-ticket service professionals.",
      usp_ar: "تصميم رحلات بيع متكاملة تشمل عروض مغرية لزيادة المبيعات (Upsells / Downsells) وتكامل مع بوابات الدفع تلقائياً.",
      usp_en: "Structuring and designing beautiful interactive funnels featuring optimized order bumps, checkout downsells, and CRM syncs.",
      pricing_ar: "تصميم وبناء قمع البيع المتكامل: 2500$ - 6000$ حسب عدد الصفحات والتكامل البرمجي.",
      pricing_en: "Complete funnel build (copy + design + integration): $2500 to $6000 depending on workflow stages.",
      growth_ar: "استعراض ومشاركة مخططات بصرية واضحة لأقماع مبيعات ناجحة وأرقام التحويل الحقيقية التي حققتها.",
      growth_en: "Share high-resolution diagram blueprints of winning funnel systems and the conversion metrics they generate."
    },
    {
      n_ar: "إعادة تدوير المحتوى وتوزيعه بكثافة",
      n_en: "Content Atomization & Repurposing",
      opp_ar: "تجد الشركات الكبرى صعوبة في تغذية قنواتها المتعددة بالمحتوى اليومي، رغم امتلاكها لأصول محتوى طويلة وثرية.",
      opp_en: "Brands struggle to stay active across 5+ social platforms, yet they already sit on vast libraries of long-form video and text.",
      client_ar: "الشركات التي تنتج ويبينارات دورية، وصناع المحتوى أصحاب الفيديوهات الطويلة.",
      client_en: "B2B firms conducting monthly webinars, active YouTube creators, and high-output personal brands.",
      usp_ar: "تحويل فيديو واحد طويل إلى 15 مقطع تيك توك وتغريدات ومقالات للينكد إن لضمان الظهور المكثف والانتشار.",
      usp_en: "Slicing 1 long video into a monthly calendar of 20 short clips, email newsletters, and highly optimized LinkedIn carousel posts.",
      pricing_ar: "باقة شهرية لإعادة التدوير والنشر: 1200$ - 2200$/شهرياً حسب المنصات.",
      pricing_en: "Monthly repurposing & multi-channel publishing retainer: $1200 - $2200/mo.",
      growth_ar: "تجهيز 3 فيديوهات قصيرة مبهرة وبوست لينكد إن من أحد فيديوهات العميل الطويلة مجاناً وعرضها عليه.",
      growth_en: "Take a client's old YouTube video, edit it into 3 viral vertical shorts for free, and pitch them the retainer package."
    },
    {
      n_ar: "بناء قصة البراند والسرد القصصي",
      n_en: "Brand Narrative & Storytelling",
      opp_ar: "تتشابه المنتجات والميزات الفنية؛ الفائز الحقيقي في السوق هو من يمتلك قصة براند عاطفية تجعل العميل يرتبط به للأبد.",
      opp_en: "Features and products are easily copied. The brand that wins is the one with an emotional narrative that builds community.",
      client_ar: "الشركات الناشئة التي تبحث عن تميز حقيقي في الأسواق المزدحمة، وبراندات المنتجات الفاخرة.",
      client_en: "D2C startups entering highly crowded categories, premium lifestyle brands, and high-growth founders.",
      usp_ar: "صياغة الهوية السردية والكتاب المقدس للبراند (Brand Bible) الذي يحدد نبرة الصوت ورسائل التسويق بوضوح.",
      usp_en: "Developing a complete core brand story, vocabulary guidelines, emotional hook strategies, and messaging playbook.",
      pricing_ar: "تطوير كتاب الهوية السردية الكامل للبراند: 2000$ - 5000$.",
      pricing_en: "Comprehensive brand strategy & narrative guidelines manual: $2000 to $5000.",
      growth_ar: "نشر تحليلات تسويقية لنجاح شركات عالمية بفضل قصتها وسردها البصري والعاطفي لكسب ثقة أصحاب الشركات.",
      growth_en: "Publish detailed breakdowns of viral, emotion-driven brand campaigns on LinkedIn to attract design-conscious founders."
    },
    {
      n_ar: "تحسين محركات البحث للشركات المحلية (Local SEO)",
      n_en: "SEO for Local Businesses",
      opp_ar: "تبحث المحلات والخدمات المحلية (أطباء، مطاعم، مكاتب) عن تصدر خرائط جوجل لأنها تجلب 80% من اتصالات العملاء المباشرة.",
      opp_en: "Local clinics, dentists, lawyers, and retail stores generate 80% of warm customer calls through high rankings on Google Maps.",
      client_ar: "عيادات الأسنان والتجميل الخاصة، المطاعم الفاخرة، ومكاتب المحاماة والاستشارات الإقليمية.",
      client_en: "Private clinics, aesthetic salons, luxury dining venues, and regional boutique law offices.",
      usp_ar: "تصدر نتائج خرائط جوجل وبناء شبكة تقييمات قوية وكلمات بحث محلية متخصصة تضمن تدفق الاتصالات.",
      usp_en: "Optimizing Google Business Profile, building localized citation clusters, and capturing high-intent nearby searches.",
      pricing_ar: "تهيئة الحساب وتحسين الترتيب: 800$/شهرياً كعقد مستمر.",
      pricing_en: "Local Google Maps optimization & ongoing local ranking management: $800/mo.",
      growth_ar: "إظهار الأخطاء القاتلة في ملفات جوجل للعيادات المحلية القريبة وكيف تجعلهم يفقدون عملاء يوميين للمنافسين.",
      growth_en: "Send localized video audits showing nearby dentists how minor profile errors lose them high-paying patients daily."
    },
    {
      n_ar: "صناعة فيديوهات البيع الاستراتيجية (VSL)",
      n_en: "Video Sales Letter (VSL) Creation",
      opp_ar: "تريد الشركات تحويل زوار موقعها إلى مكالمات مبيعات محجوزة فوراً عبر فيديو بيع استراتيجي ومقنع مدته 10 دقائق.",
      opp_en: "Businesses struggle to convert passive website traffic into direct sales calls without a highly engaging 10-minute VSL script.",
      client_ar: "شركات الاستشارات، الكوتشز الكبار، وشركات الـ SaaS الموجهة للمؤسسات B2B.",
      client_en: "Consulting programs, premium coaching cohorts, and B2B high-ticket service companies.",
      usp_ar: "صياغة سيناريوهات VSL تعتمد على علم النفس الإقناعي وحل الاعتراضات مسبقاً لضمان حجز المكالمات بجودة عالية.",
      usp_en: "Writing high-retention persuasive VSL scripts, directing presentation visuals, and optimizing call-to-action hooks.",
      pricing_ar: "كتابة وتصميم فيديو البيع الاستراتيجي: 1500$ - 3500$.",
      pricing_en: "Complete VSL script, visual storyboard slide decks, and funnel integration: $1500 to $3500.",
      growth_ar: "مشاركة إحصائيات لزيادة معدل حجز المكالمات بنسبة 150% بعد دمج الـ VSL في صفحات الهبوط.",
      growth_en: "Publish landing page split-test results demonstrating a 150% boost in booked calls when adding a structured VSL."
    },
    {
      n_ar: "رصد السوشيال ميديا وتحليل الانطباعات",
      n_en: "Social Media Listening & Insights",
      opp_ar: "تريد الشركات الكبرى معرفة رأي الناس الحقيقي في منتجاتها ومنافسيها عبر السوشيال ميديا للتدخل السريع وتحسين السمعة.",
      opp_en: "Enterprises need to track brand mentions, reviews, and sentiment across social channels in real-time to manage reputation.",
      client_ar: "الشركات الاستهلاكية الكبرى، البنوك، والمؤسسات الخدمية والتعليمية الكبرى.",
      client_en: "Consumer brands, corporate banks, fast-scaling digital startups, and public institutions.",
      usp_ar: "رصد يومي مستمر للعلامة التجارية والمنافسين وتحليل انطباعات الجمهور الفورية لمنع أي أزمات علاقات عامة.",
      usp_en: "24/7 brand monitoring using advanced web scraping and sentiment analytics, delivering weekly proactive strategy reports.",
      pricing_ar: "اشتراك شهري للرصد والتقارير: يبدأ من 2500$/شهرياً للمؤسسات الكبرى.",
      pricing_en: "Enterprise sentiment auditing & social listening dashboard management: starts at $2500/mo.",
      growth_ar: "تقديم عينات تقارير توضح ما قاله الناس عن إطلاق منتج حديث لأحد المنافسين وكيف يمكن للعميل الاستفادة منه.",
      growth_en: "Provide a quick social audit showing a prospect exactly what their customers complain about most online."
    }
  ],
  fitness: [
    {
      n_ar: "كوتشينج طول العمر والبايوهاكينج (Longevity)",
      n_en: "Longevity & Biohacking Coaching",
      opp_ar: "تزايد اهتمام رواد الأعمال الأثرياء بالحفاظ على طاقتهم الشبابية وصحتهم الخلوية وإطالة العمر الصحي.",
      opp_en: "High-earning executives and founders are obsessed with cellular health, biological age reduction, and mental energy.",
      client_ar: "المدراء التنفيذيون، أصحاب الأعمال، والمستثمرون فوق سن الـ 35.",
      client_en: "High-net-worth business owners, venture capitalists, and busy executives over 35.",
      usp_ar: "تصميم خطط مخصصة مبنية على تحاليل الدم الجينية وجودة النوم وتوازن الهرمونات لرفع الطاقة اليومية لأقصى مدى.",
      usp_en: "Bespoke programs combining biometric sleep tracking, genetic lab interpretations, and science-backed supplement protocols.",
      pricing_ar: "برنامج 3 أشهر مكثف: 2500$ - 6000$ تشمل المتابعة الطبية والتحاليل والمكملات.",
      pricing_en: "3-month longevity protocol: $2500 - $6000 including biological age test kits and daily expert tracking.",
      growth_ar: "كتابة مقالات علمية مبسطة حول كواليس بايوهاكينج نوم التنفيذيين وطاقتهم الذهنية على لينكد إن لجذب المستثمرين.",
      growth_en: "Write detailed scientific breakdowns on LinkedIn detailing sleep biohacks and cellular repair to attract high-earning leaders."
    },
    {
      n_ar: "اللياقة الذهنية والعافية العصبية",
      n_en: "Mental Fitness & Neurowellness",
      opp_ar: "التوتر والقلق المستمر يعطلان القدرة على اتخاذ القرارات الصحيحة؛ يبحث المحترفون عن تدريب مرونة عصبية وذهنية.",
      opp_en: "Chronic high stress impairs decision making. Busy professionals actively seek cognitive fitness and neuro-training.",
      client_ar: "المتداولون، قادة الفرق، ورواد الأعمال الذين يعيشون في بيئات عالية الضغط المالي والعملي.",
      client_en: "Financial traders, executive leaders, and solo founders in high-stakes industries.",
      usp_ar: "دمج تدريب التنفس العلمي (Breathwork) مع تدريب التركيز وإدارة ضغط العمل العصبي لضمان الهدوء واتخاذ قرارات حاسمة.",
      usp_en: "Combining somatic breathwork, cognitive focus exercises, and heart rate variability (HRV) training for mental clarity.",
      pricing_ar: "اشتراك كوتشينج ذهني مستمر: 800$ - 1500$/شهرياً لجلسات فردية.",
      pricing_en: "1-on-1 premium neurowellness coaching: $800 - $1500/mo including custom somatic blueprints.",
      growth_ar: "تقديم ويبينار مجاني حول كيفية خفض هرمون الكورتيزول والتوتر في 5 دقائق وسط ساعات التداول والعمل الشاقة.",
      growth_en: "Deliver free masterclasses showing traders how to slash cortisol levels and clear brain fog in 5 minutes."
    },
    {
      n_ar: "التدريب المتوافق مع الدورة الشهرية للنساء",
      n_en: "Cycle-Synced Training for Women",
      opp_ar: "تبحث النساء عن تمارين وخطط تغذية تحترم طبيعتهن البيولوجية وتقلبات هرموناتهن الشهرية بدلاً من التمرين القاسي الموحد.",
      opp_en: "Women seek training and nutrition plans adapted to their hormonal phases rather than exhaustive masculine fitness routines.",
      client_ar: "النساء المهتمات بالصحة الشمولية وعلاج مشاكل الخصوبة والهرمونات بطرق طبيعية.",
      client_en: "Health-conscious women, professional female leaders, and those addressing PCOS/hormonal imbalances.",
      usp_ar: "برامج رياضية وغذائية مخصصة تتغير أسبوعياً لتتوافق مع كل مرحلة من مراحل الدورة الشهرية الأربعة للمرأة.",
      usp_en: "Step-by-step training and nutritional plans that dynamically sync with the four phases of the female menstrual cycle.",
      pricing_ar: "برنامج 12 أسبوع مخصص بالكامل: 300$ - 700$.",
      pricing_en: "12-week customized cycle-synced program: $300 - $700.",
      growth_ar: "نشر محتوى توعوي حول هرمونات النساء وعلاقة بعض التمارين في أوقات خاطئة بزيادة التوتر وثبات الوزن.",
      growth_en: "Share educational reels detailing why standard workout programs cause hormonal exhaustion and weight retention in women."
    },
    {
      n_ar: "اللياقة البدنية للمهنيين العاملين عن بعد",
      n_en: "Fitness for Remote Professionals",
      opp_ar: "يعاني ملايين الموظفين عن بعد من الخمول وآلام الظهر والرقبة بسبب الجلوس الطويل أمام الشاشات لساعات متصلة.",
      opp_en: "Millions of remote workers experience chronic back pain, poor posture, and sluggishness from sitting all day.",
      client_ar: "المبرمجون، المصممون، وصناع المحتوى الذين يعملون من مكاتبهم المنزلية.",
      client_en: "Software engineers, digital creators, and remote employees sitting 8+ hours a day.",
      usp_ar: "تصميم تمارين قصيرة وذكية (Desk Workouts) وأدوات تصحيح قوام الجسم يمكن دمجها بسلاسة وسط جدول العمل اليومي.",
      usp_en: "Ultra-convenient 'micro-workouts' (5-10 minutes) and posture corrective exercises built directly into a remote workday.",
      pricing_ar: "برنامج حركي وتدريبي شهري: 120$ - 250$ مع متابعة واتساب يومية.",
      pricing_en: "Monthly posture & mobility coaching: $120 - $250 including desk stretch videos and daily habit tracking.",
      growth_ar: "نشر تحديات قوام ومقاومة لآلام الظهر على منصات لينكد إن حيث يتواجد المهنيون بكثافة.",
      growth_en: "Launch ergonomic posture challenges on LinkedIn where remote professionals discuss workspace optimization."
    },
    {
      n_ar: "تأهيل ما بعد الإصابات وحركية الجسم",
      n_en: "Post-Injury Rehab & Movement",
      opp_ar: "يحتاج الكثيرون بعد إتمام العلاج الطبيعي لإصابات المفاصل أو الظهر لتأهيل حركي آمن ومستمر للعودة لحياتهم الطبيعية.",
      opp_en: "Athletes and active adults completing physical therapy require expert transitional training to safely return to full mobility.",
      client_ar: "الرياضيون الهواة، كبار السن النشطون، والذين يعانون من آلاف المفاصل المزمنة.",
      client_en: "Amateur athletes, active adults over 40, and individuals recovering from joint/tendon surgeries.",
      usp_ar: "كوتشينج تأهيل حركي آمن للغاية يركز على تصحيح الميكانيكا الحركية وتقوية العضلات المحيطة بالإصابة لمنع الانتكاس.",
      usp_en: "Highly scientific biomechanical retraining and targeted joint strengthening built to eliminate fear of re-injury.",
      pricing_ar: "باقة 12 جلسة تأهيل وتعديل حركة فردية: 600$ - 1200$.",
      pricing_en: "12-session private transitional rehab package: $600 - $1200 depending on injury severity.",
      growth_ar: "نشر فيديوهات واقعية توضح رحلة استعادة العميل لحركته الطبيعية وقدرته على ممارسة هواياته بحرية وأمان.",
      growth_en: "Publish detailed video journals documenting clients' journeys from joint pain to full pain-free functional squats."
    },
    {
      n_ar: "التغذية النباتية للأداء الرياضي العالي",
      n_en: "Plant-Based High Performance Nutrition",
      opp_ar: "يرغب العديد من الرياضيين في تبني نظام غذائي نباتي لأسباب صحية أو بيئية ولكنهم يخشون نقص البروتين وضعف الأداء.",
      opp_en: "Athletes want to adopt plant-based lifestyles but fear protein deficiencies and losing raw muscular output.",
      client_ar: "العداؤون، لاعبو بناء الأجسام النباتيون، والمهتمون برفع طاقتهم الرياضية طبيعياً.",
      client_en: "Vegan/vegetarian athletes, runners, and hybrid fitness enthusiasts seeking athletic edge naturally.",
      usp_ar: "تصميم خطط تغذية نباتية علمية ومحسوبة بالجرام لضمان بناء العضلات والتعافي السريع دون أي تضحية بالأداء.",
      usp_en: "Formulating scientifically backed plant-based diet protocols that guarantee muscle protein synthesis and quick recovery.",
      pricing_ar: "تجهيز خطة التغذية النباتية والمتابعة الشهرية: 150$ - 300$/شهرياً.",
      pricing_en: "Custom plant-based macro plan & weekly check-in retainer: $150 - $300/mo.",
      growth_ar: "مشاركة وجبات نباتية غنية بالبروتين واستعراض نتائج تحاليل دم لرياضيين نباتيين يتمتعون بصحة فائقة.",
      growth_en: "Post delicious high-protein vegan meal prep recipes and showcase elite plant-based athlete biometrics."
    },
    {
      n_ar: "تدريب القوة الوظيفي للحياة اليومية",
      n_en: "Functional Strength Training",
      opp_ar: "يبحث الناس العاديون عن تمارين تزيد قدرتهم على أداء مهام الحياة اليومية (حمل أكياس، صعود درج) دون آلام.",
      opp_en: "Average busy adults seek fitness that prepares them for daily tasks (carrying weight, lifting children) without chronic pain.",
      client_ar: "الآباء والأمهات، الموظفون في منتصف العمر، والباحثون عن صحة مستدامة لا ضخامة عضلية شكلية.",
      client_en: "Busy parents, middle-aged office workers, and adults prioritizing longevity and pain-free joints.",
      usp_ar: "تمارين قوة تحاكي الحركات اليومية الحقيقية وتركز على عضلات الجذع (Core) والتوازن لمنع الإصابات المفاجئة.",
      usp_en: "Developing core stability, multi-planar movement patterns, and functional strength adapted to real-world tasks.",
      pricing_ar: "اشتراك شهري للتدريب الشخصي أو عبر تطبيق خاص: 100$ - 250$.",
      pricing_en: "Ongoing functional coaching subscription via custom fitness application: $100 - $250/mo.",
      growth_ar: "فيديوهات قصيرة تستعرض تصحيح طريقة حمل الأشياء الثقيلة يومياً ومخاطر العادات الخاطئة على الظهر.",
      growth_en: "Create quick visual reels showing the correct, safe biomechanics for picking up heavy objects off the floor."
    },
    {
      n_ar: "متخصص الحركية وصحة المفاصل (Mobility)",
      n_en: "Mobility & Joint Health Specialist",
      opp_ar: "تصلب المفاصل يقلل جودة الحياة؛ يبحث الملايين عن استعادة مرونتهم وقدرتهم الحركية الطبيعية والتخلص من الخمول المفصلي.",
      opp_en: "Joint stiffness ruins lifestyle quality. Millions actively search for stretching and mobility systems to restore fluid movement.",
      client_ar: "الموظفون الذين يعانون من قلة الحركة، ولاعبو الجيم الذين يشتكون من قصر مدى الحركة العضلية.",
      client_en: "Office executives with sedentary routines, and lifters suffering from restricted active range of motion.",
      usp_ar: "بروتوكولات إطالة حركية متخصصة (FST / CARs) تفتح المفاصل المتصلبة وتزيد المرونة وتريح الجسم فوراً.",
      usp_en: "Structured active joint flexibility protocols (CARs, FRC) that release locked hips, tight shoulders, and lower back pressure.",
      pricing_ar: "كورس حركي متخصص أو باقة تدريب حية: 200$ - 500$.",
      pricing_en: "Targeted hip/shoulder mobility video course or private live coaching package: $200 - $500.",
      growth_ar: "فيديوهات 'اختبار مرونة مفصل الورك أو الكتف' تدفع المستخدمين لتجربة مرونتهم والتواصل معك لحل مشاكلهم.",
      growth_en: "Post interactive '10-Second Hip Mobility Tests' that engage viewers and highlight their need for joint training."
    },
    {
      n_ar: "اللياقة البدنية لمستخدمي أدوية التخسيس",
      n_en: "Fitness for GLP-1/Weight Loss Meds",
      opp_ar: "الانفجار العالمي في استخدام أدوية التخسيس (مثل Ozempic) يتطلب تمارين تغذية خاصة لمنع فقدان الكتلة العضلية والترهلات.",
      opp_en: "The global surge in GLP-1 (Ozempic/Wegovy) weight loss drug use creates critical demand for targeted lean muscle preservation.",
      client_ar: "الأشخاص الذين يستخدمون إبر التخسيس ويبحثون عن قوام مشدود وصحي دون ترهل أو ضعف عضلي.",
      client_en: "Patients currently on GLP-1 medications looking to sculpt their bodies and avoid the 'Ozempic face/sagging skin' look.",
      usp_ar: "برامج قوة مخصصة وتغذية عالية البروتين لحماية العضلات والعظام أثناء فقدان الوزن السريع لضمان صحة مثالية.",
      usp_en: "High-protein dietary tracking combined with progressive resistance training designed strictly to lock in muscle mass.",
      pricing_ar: "باقة مرافقة طبية رياضية متكاملة: 250$ - 500$/شهرياً.",
      pricing_en: "Premium clinical-fitness coaching package: $250 - $500/mo including custom protein tracking.",
      growth_ar: "نشر محتوى طبي توعوي حول مخاطر فقدان العضلات السريع وأهمية تمارين المقاومة خلال استخدام هذه الأدوية.",
      growth_en: "Target weight loss online forums with educational content exposing the dangers of sarcopenia (muscle loss) on GLP-1."
    },
    {
      n_ar: "كوتشينج تحسين جودة النوم (Sleep Coach)",
      n_en: "Sleep Optimization Coaching",
      opp_ar: "الأرق وقلة النوم يدمران الإنتاجية والصحة العامة؛ العميل يدفع بسخاء لمن يضمن له نوماً عميقاً ومريحاً يومياً.",
      opp_en: "Insomnia and poor sleep quality ruin executive focus. Professionals pay premium rates to secure restorative deep sleep.",
      client_ar: "رواد الأعمال، المدراء، وأصحاب الأداء العالي الذين يعانون من الأرق والتوتر الليلي المستمر.",
      client_en: "High-stress corporate executives, tech founders, and professionals battling chronic insomnia.",
      usp_ar: "بروتوكولات نوم علمية متكاملة تضبط الساعة البيولوجية والبيئة المحيطة والغذاء والتنفس لضمان النوم السريع والعميق.",
      usp_en: "Comprehensive circadian rhythm tuning, light hygiene engineering, and custom wind-down routine design.",
      pricing_ar: "برنامج إعادة هيكلة النوم والتخلص من الأرق (4 أسابيع): 400$ - 900$.",
      pricing_en: "4-week deep sleep restoration program: $400 - $900 with biometric Oura/Whoop tracking analysis.",
      growth_ar: "مخططات بيانية توضح الارتباط المباشر بين جودة النوم العميق وزيادة الأرباح والتركيز الفكري للتنفيذيين.",
      growth_en: "Publish LinkedIn diagrams showing the mathematical correlation between deep sleep cycles and executive focus."
    },
    {
      n_ar: "إدارة التوتر من خلال الحركة والرياضة",
      n_en: "Stress Management through Movement",
      opp_ar: "البحث عن حلول طبيعية لتفريغ شحنات الغضب والتوتر اليومي المتراكم دون اللجوء للمهدئات الدوائية.",
      opp_en: "Modern workers actively search for somatic physical methods to release daily stress and corporate anxiety naturally.",
      client_ar: "الموظفون في بيئات العمل عالية الضغط والسرعة، والباحثون عن سلام داخلي وصحة بدنية متوازنة.",
      client_en: "Busy executives, customer support leads, and professionals in demanding agency settings.",
      usp_ar: "دمج تمارين الكارديو وتدريب الملاكمة واليوجا والتنفس في حصة واحدة تفرغ شحنات التوتر وتجدد طاقة الجسم بالكامل.",
      usp_en: "Bespoke somatic physical routines that blend boxing, mobility flows, and bio-energetic grounding exercises.",
      pricing_ar: "اشتراك شهري أو جلسات جماعية حية: 100$ - 200$/شهرياً.",
      pricing_en: "Ongoing private movement stress-release sessions: $100 - $200/mo.",
      growth_ar: "مشاركة تجارب لعملاء تخلصوا من التوتر المزمن وصداع التوتر بفضل تفريغ الطاقة الحركية بانتظام.",
      growth_en: "Publish short videos on how deep physical somatic movements instantly drop active blood pressure and relieve neck tension."
    },
    {
      n_ar: "برامج اللياقة البدنية والنشاط للشركات",
      n_en: "Corporate Fitness Programs",
      opp_ar: "ترغب الشركات في بناء بيئات عمل تفاعلية وزيادة ترابط فرقها عبر توفير حصص لياقة بدنية وتغذية مشتركة وصحية.",
      opp_en: "HR teams seek active wellness initiatives to build company camaraderie and reduce employee medical claims.",
      client_ar: "أقسام الموارد البشرية (HR) في الشركات الكبرى والمتوسطة التي تهتم بسعادة موظفيها.",
      client_en: "HR executives and operations directors in tech, banking, and creative startups with 50+ staff.",
      usp_ar: "تحديات لياقة تفاعلية جماعية وتصميم برامج تغذية مخصصة داخل الشركة لرفع الحيوية والإنتاجية وخفض الغيابات.",
      usp_en: "Interactive team step challenges, weekly group lunch-and-learns, and fully branded company fitness platforms.",
      pricing_ar: "عقد رعاية الشركة اللياقي: يبدأ من 1500$ إلى 4000$/شهرياً حسب عدد الموظفين.",
      pricing_en: "Enterprise health package starting at $1500/mo to $4000/mo depending on employee enrollment.",
      growth_ar: "إرسال تقارير وعروض توضح العائد المالي المباشر للاستثمار في صحة الموظفين وزيادة ولائهم وإنتاجيتهم للشركة.",
      growth_en: "Pitch HR leaders with corporate statistics linking regular physical challenges to lower churn and high retention."
    },
    {
      n_ar: "اللياقة البدنية التكتيكية (شرطة وجيش)",
      n_en: "Tactical Fitness (Police/Military)",
      opp_ar: "يحتاج منتسبو الأجهزة الأمنية والجيش للياقة بدنية وقوة استثنائية تؤهلهم لتجاوز الاختبارات الصعبة والتعامل مع المهام الخطرة.",
      opp_en: "First responders, police academy applicants, and military personnel need specialized physical preparedness for high-risk duties.",
      client_ar: "ضباط الشرطة، أفراد الجيش، ورجال الإطفاء، والمتقدمون لاختبارات القبول العسكرية.",
      client_en: "First responders, active police officers, military recruits, and security specialists.",
      usp_ar: "برامج تدريب قوة وتحمل قاسية تحاكي الظروف الميدانية الحقيقية وتضمن تجاوز أصعب اختبارات القبول العسكرية بأمان.",
      usp_en: "Specialized conditioning modules focused on loaded carries, high-durability cardiovascular capacity, and explosive force.",
      pricing_ar: "برنامج تدريبي مغلق ومكثف لتجاوز اختبارات القبول (8 أسابيع): 200$ - 450$.",
      pricing_en: "8-week high-intensity physical tactical test preparation blueprint: $200 - $450.",
      growth_ar: "مشاركة قصص نجاح وتبريكات لعملاء نجحوا في اجتياز اختبارات القبول الصعبة وحصلوا على رتبهم العسكرية بفضل البرنامج.",
      growth_en: "Share highly motivating success stories of clients scoring perfect marks on physical academy entry assessments."
    },
    {
      n_ar: "القوة والحركة لكبار السن (Seniors)",
      n_en: "Seniors Strength & Mobility",
      opp_ar: "يرغب كبار السن في الحفاظ على استقلاليتهم وقدرتهم على اللعب مع أحفادهم دون خوف من السقوط أو كسور العظام الآخذة بالازدياد.",
      opp_en: "Aging baby-boomers demand specialized, safe resistance training to avoid sarcopenia, retain balance, and play with grandchildren.",
      client_ar: "الرجال والنساء فوق سن الـ 60 الباحثون عن حياة نشطة وصحية خالية من الآلام والإصابات والاعتماد المالي.",
      client_en: "Active aging adults (60+) looking to preserve functional independence and bone density.",
      usp_ar: "تدريب قوة آمن للغاية يركز على زيادة التوازن وحماية كثافة العظام ومرونة المفاصل لمنع حوادث السقوط والكسور.",
      usp_en: "Extremely gentle, safe resistance training using bands and chairs to maximize bone density, joint range, and spatial balance.",
      pricing_ar: "جلسات تدريب شخصية منزلية أو عبر زووم: 50$ - 90$ للجلسة.",
      pricing_en: "Private 1-on-1 home or virtual zoom balance-and-bone training: $50 - $90 per active session.",
      growth_ar: "استهداف أبناء كبار السن بتقرير يوضح أهمية تدريب القوة في حماية آبائهم وأمهاتهم وضمان صحتهم الدائمة.",
      growth_en: "Target adult children on social platforms explaining why progressive loading is the best gift they can give their aging parents."
    },
    {
      n_ar: "تطوير الأداء الرياضي للناشئين والشباب",
      n_en: "Youth Athletic Development",
      opp_ar: "يبحث الآباء الطموحون عن كوتشز محترفين لتطوير سرعة وقوة ومهارة أبنائهم الرياضية لمساعدتهم على التميز وحصد الميداليات.",
      opp_en: "Ambitious parents actively look for specialized coaches to build their children's athletic foundations for competitive sports.",
      client_ar: "الآباء والأمهات الذين يمارس أبناؤهم (أعمار 10-18) رياضات تنافسية (كرة قدم، تنس، سباحة).",
      client_en: "Parents of competitive student-athletes (ages 10-18) aiming for sports academy scholarships or club career starts.",
      usp_ar: "تطوير أسس الحركة والسرعة والقوة البدنية بطرق علمية آمنة تناسب نمو الأطفال وتمنع الإصابات الرياضية المبكرة.",
      usp_en: "Formulating safe, scientific long-term athletic blueprints focused on speed, agility, and fundamental body control.",
      pricing_ar: "اشتراك شهري للناشئين: 150$ - 300$ يتضمن حصصاً تدريبية وتغذية مناسبة للنمو.",
      pricing_en: "Bespoke youth conditioning and recovery coaching package: $150 - $300/mo.",
      growth_ar: "التعاون مع الأندية والمدارس الرياضية المحلية، وعرض فيديوهات توضح تحسن سرعة ومهارة الناشئين بشكل ملحوظ.",
      growth_en: "Deliver free speed clinics at local youth clubs to showcase agility drills and attract parent enrollment."
    }
  ],
  realestate: [
    {
      n_ar: "الربح من تأجير العقارات (Airbnb Arbitrage)",
      n_en: "Airbnb Arbitrage & Short-term Rentals",
      opp_ar: "تأجير العقارات السياحي عبر Airbnb يدر أرباحاً تفوق الإيجار التقليدي بـ 3 أضعاف دون الحاجة لامتلاك العقار بالضرورة.",
      opp_en: "Short-term vacation rentals on Airbnb yield 3x higher revenues than traditional long-term leasing without needing property ownership.",
      client_ar: "ملاك العقارات الراغبون في زيادة دخلهم، والمستثمرون الشباب الباحثون عن دخل سلبي مستمر.",
      client_en: "Property owners wanting passive hands-off profits, and young investors building arbitrage cash flow empires.",
      usp_ar: "إدارة تشغيلية وتأثيث فندقي ذكي وحملات تسويقية متكاملة تضمن أعلى نسبة إشغال وتقييمات 5 نجوم دائمة.",
      usp_en: "Professional guest screening, premium interior styling on a budget, and dynamic pricing algorithms that maximize booking rates.",
      pricing_ar: "نسبة من أرباح التشغيل: 15% - 25% من عوائد الإيجار الشهري الكلي للعقار.",
      pricing_en: "Property management retainer of 15% to 25% of total gross monthly rental revenues.",
      growth_ar: "عرض دراسات حالة وعينات أرباح حقيقية لعقارات تحولت من إيجار سنوي عادي إلى أرباح Airbnb ضخمة.",
      growth_en: "Publish detailed case studies comparing standard annual rent vs optimized short-term booking monthly payouts."
    },
    {
      n_ar: "بيع العقارات المتنازع عليها أو المتعثرة",
      n_en: "Probate & Distressed Property Sales",
      opp_ar: "يعاني الورثة والملاك المتعثرون مالياً من صعوبة بيع عقاراتهم بسرعة وبسعر عادل لتسوية النزاعات والديون القانونية.",
      opp_en: "Inherited heirs and distressed owners struggle to liquidate real estate quickly to resolve legal/financial liabilities.",
      client_ar: "المحامون، الورثة، الملاك المهددون بالحجز العقاري، والمستثمرون الباحثون عن صفقات سريعة.",
      client_en: "Estate attorneys, distressed property heirs, default mortgage holders, and cash buyer investors.",
      usp_ar: "شراء عقارات كاش فوراً أو تسهيل بيعها خلال أقل من 14 يوماً مع تسوية كامل النزاعات القانونية والضرائب مع الشركاء.",
      usp_en: "Assisting with title clearing, probate legal navigations, and securing rapid all-cash buyers in under 14 days.",
      pricing_ar: "عمولة ووساطة وحل قانوني: 4% - 6% من قيمة الصفقة الإجمالية للعقار.",
      pricing_en: "Specialist transaction and legal brokerage fee: 4% to 6% of the final sale price.",
      growth_ar: "بناء علاقات متينة مع مكاتب المحاماة المتخصصة في قضايا الميراث والديون للحصول على إحالات مباشرة وموثوقة.",
      growth_en: "Establish direct referral partnerships with local probate and bankruptcy lawyers by offering streamlined asset liquidation."
    },
    {
      n_ar: "الاستثمار العقاري المجزأ (Fractional)",
      n_en: "Fractional Real Estate Investing",
      opp_ar: "رغبة صغار المستثمرين في دخول السوق العقاري بمبالغ بسيطة للاستفادة من عوائد الإيجار ونمو رأس المال الآمن.",
      opp_en: "Micro-investors want exposure to commercial and residential real estate without high down payments or credit checks.",
      client_ar: "الشباب، صغار المستثمرين، والموظفون الراغبون في بناء محفظة عقارية بمدخراتهم البسيطة.",
      client_en: "Millennials, retail investors, and salary earners looking to build passive property portfolios with small savings.",
      usp_ar: "تقسيم ملكية العقارات الكبيرة عبر منصات آمنة تتيح الاستثمار بمبالغ تبدأ من 100$ فقط مع عوائد شهرية موزعة تلقائياً.",
      usp_en: "Bypassing bank loans by tokenizing premium rental assets, letting retail buyers purchase fractions with monthly payouts.",
      pricing_ar: "رسوم إدارة وتجهيز المنصة: 1.5% - 3% سنوياً من إجمالي الأصول المدارة.",
      pricing_en: "Asset setup and ongoing portfolio management platform fee: 1.5% to 3% annually of assets under management (AUM).",
      growth_ar: "حملات تسويق رقمي مركزة تركز على فكرة 'كن صاحب عقار بـ 500 ريال' مع نشر تقارير الأرباح الشهرية.",
      growth_en: "Run high-concept education ads explaining 'How to buy a piece of a Dubai apartment for $100' on YouTube/Instagram."
    },
    {
      n_ar: "ضرائب العملات الرقمية والامتثال المالي",
      n_en: "Crypto Tax & Assets Compliance",
      opp_ar: "يحتاج متداولو العملات الرقمية الذين حققوا ثروات إلى إدخال أموالهم في النظام المالي التقليدي وشراء عقارات بأمان وقانونية.",
      opp_en: "Crypto investors who generated massive gains need to off-ramp into traditional physical assets like real estate legally.",
      client_ar: "مستثمرو الكريبتو، المتداولون الكبار، والشركات الناشئة في مجال الويب 3.",
      client_en: "Crypto high-net-worth individuals, Web3 founders, and traders seeking legal real estate off-ramps.",
      usp_ar: "مستشارون ماليون وقانونيون يضمنون شرعية وامتثال مصادر أموال الكريبتو وتحويلها بسلاسة لشراء عقارات فخمة بلا مسائلة.",
      usp_en: "Expert forensic accounting, source-of-wealth auditing, and legally compliant direct real estate off-ramp transaction mapping.",
      pricing_ar: "استشارة وتسهيل الصفقة: يبدأ من 3000$ أو نسبة 1% من قيمة العقار المشترى.",
      pricing_en: "Compliance packaging and off-ramp advisory fee: starts at $3000 or 1% of the property value.",
      growth_ar: "التواجد في مجتمعات الكريبتو، وتوضيح كيفية تفادي الضرائب والغرامات بطرق قانونية آمنة وذكية.",
      growth_en: "Deliver targeted compliance guides and write-ups in online crypto investor channels and Telegram groups."
    },
    {
      n_ar: "تطوير المنازل المستدامة والموفرة للطاقة",
      n_en: "Sustainable & Passive House Dev",
      opp_ar: "زيادة تكاليف الطاقة تجعل المشترين يفضلون المنازل المستدامة (Passive Houses) التي توفر 80% من فواتير الكهرباء والتبريد.",
      opp_en: "Soaring electricity and climate control costs drive buyers toward certified energy-efficient passive homes.",
      client_ar: "العائلات الطموحة، المستثمرون الواعون بالبيئة، والمطورون العقاريون الصغار.",
      client_en: "Eco-conscious homebuyers, luxury villa builders, and forward-thinking boutique property developers.",
      usp_ar: "تصميم وبناء بيوت تعتمد على العزل الحراري الذكي والطاقة الشمسية لتوفير مالي هائل وراحة صحية فائقة.",
      usp_en: "Certified passive house design and sustainable engineering that slashes HVAC energy bills by 80% guaranteed.",
      pricing_ar: "تكاليف التصميم والاستشارة: تبدأ من 5000$ أو نسبة 8% من قيمة مشروع البناء الكلية.",
      pricing_en: "Sustainable architectural planning and consulting fee: starts at $5000 or 8% of build budget.",
      growth_ar: "فيديوهات تستعرض مقارنة فواتير كهرباء حقيقية بين منزل تقليدي ومنزل مستدام خلال شهور الصيف الحارقة.",
      growth_en: "Publish side-by-side energy bill comparisons between traditional homes and certified passive houses in hot summers."
    },
    {
      n_ar: "التأثيث الافتراضي للوكلاء العقاريين",
      n_en: "Virtual Staging for Realtors",
      opp_ar: "تباع العقارات الفارغة بصعوبة بالغة وبأسعار أقل، بينما يكلف التأثيث الحقيقي آلاف الدولارات ويأخذ أسابيع.",
      opp_en: "Empty homes sit on the market longer and sell for less, yet physical furniture staging costs thousands of dollars.",
      client_ar: "الوكلاء العقاريون، شركات الوساطة، ومطورو المشاريع السكنية.",
      client_en: "Independent real estate agents, high-volume brokerages, and residential developers.",
      usp_ar: "تأثيث افتراضي ثلاثي الأبعاد فائق الواقعية باستخدام الذكاء الاصطناعي يُظهر جمال العقار وإمكاناته خلال 24 ساعة فقط.",
      usp_en: "Hyper-realistic 3D CGI interior styling rendered in under 24 hours at a fraction of physical staging cost.",
      pricing_ar: "35$ إلى 60$ لكل صورة عقار مؤثثة افتراضياً بجودة عالية.",
      pricing_en: "$35 to $60 per high-resolution virtually staged photo, with bulk agency packages available.",
      growth_ar: "أخذ صور لعقارات فارغة معروضة على مواقع البيع، تأثيثها افتراضياً مجاناً كعينة إقناع وإرسالها للوكيل العقاري.",
      growth_en: "Find active empty listings, stage 1 photo for free, and send it to the listing agent showing the instant aesthetic upgrade."
    },
    {
      n_ar: "وكالة تسويق متخصصة للمشاريع العقارية",
      n_en: "Real Estate Marketing Agency",
      opp_ar: "ينفق المطورون ملايين الدولارات على إعلانات تقليدية فاشلة للبحث عن عملاء مهتمين بشراء العقارات الفخمة دون جدوى.",
      opp_en: "Property developers waste massive ad spend running generic lead generation campaigns that yield fake phone numbers.",
      client_ar: "مطور العقارات، الوكالات العقارية الفاخرة، ومسوقو المشاريع الجديدة (Off-Plan).",
      client_en: "Mid-sized residential developers, luxury boutique brokers, and agents selling off-plan projects.",
      usp_ar: "حملات إعلانية متكاملة تستهدف أثرياء العالم وتضمن الحصول على عملاء مؤهلين للشراء فوراً بنسبة تحويل مرتفعة.",
      usp_en: "High-intent client capture funnels, international wealthy buyer targeting, and premium video tour ad creatives.",
      pricing_ar: "اشتراك شهري (Retainer): 2000$ - 4500$/شهرياً + نسبة من عمولات البيع المباشرة.",
      pricing_en: "Monthly retainer starting at $2000 - $4500/mo + small performance percentage of successfully closed sales.",
      growth_ar: "مشاركة قصص نجاح توضح كيف قمنا ببيع مشروع سكني بالكامل قبل اكتمال بنائه بفضل الإعلانات الذكية.",
      growth_en: "Publish case studies outlining how targeted video sales funnels sold out boutique off-plan projects ahead of schedule."
    },
    {
      n_ar: "استراتيجية العقارات التجارية متعددة الوحدات",
      n_en: "Commercial Multi-family Strategy",
      opp_ar: "يبحث كبار المستثمرين عن عوائد مستقرة ومقاومة للتضخم عبر شراء مباني وعقارات تجارية متعددة العوائد.",
      opp_en: "Accredited investors seek stable, inflation-resistant cash flows by investing in multi-family apartment complexes.",
      client_ar: "صناديق الاستثمار الخاصة، المستثمرون الأثرياء، والمكاتب العائلية الاستثمارية.",
      client_en: "High-net-worth investment syndicates, multi-family investors, and real estate family offices.",
      usp_ar: "تحليل مالي دقيق يحدد المباني ذات الفرص المخفية لزيادة أرباحها عبر تحسين الإدارة ورفع كفاءة التأجير.",
      usp_en: "Underwriting market opportunities, sourcing off-market multi-family buildings, and restructuring operations to boost NOI.",
      pricing_ar: "عمولة تحليل وتسهيل الاستحواذ: 1% - 2% من قيمة الصفقة التجارية الكلية.",
      pricing_en: "Acquisition advisory & syndication fee: 1% to 2% of the commercial purchase price.",
      growth_ar: "كتابة تقارير مفصلة لتحليل عوائد الاستثمار في مناطق جغرافية واعدة ونشرها في مجتمعات المستثمرين والماليين.",
      growth_en: "Publish deep underwriting breakdowns of active commercial regions on LinkedIn, building trust with family offices."
    },
    {
      n_ar: "متخصص انتقال العسكريين والمحاربين القدامى",
      n_en: "Military & Veteran Relocation Specialist",
      opp_ar: "ينتقل العسكريون باستمرار ويحتاجون إلى وكلاء يفهمون حقوقهم المالية ومزايا القروض العسكرية (VA Loans) لتسهيل الشراء.",
      opp_en: "Active duty military personnel and veterans relocate frequently, requiring agents who understand VA home loan benefits.",
      client_ar: "أفراد الجيش النشطون، المحاربون القدامى، وعائلاتهم التي تتنقل بين القواعد العسكرية.",
      client_en: "Active duty service members, military veterans, and their relocating families.",
      usp_ar: "تأمين منازل ممتازة دون دفعة أولى (0% Down) مع تسهيل كامل الإجراءات الورقية العسكرية المعقدة بسرعة.",
      usp_en: "Specialized VA loan packaging, rapid virtual showings for remote buyers, and seamless base-to-base transfer logistics.",
      pricing_ar: "عمولة وساطة عقارية معتادة: 2.5% - 3% مغطاة بالكامل من طرف البائع.",
      pricing_en: "Standard buyer agency commission (2.5% to 3%) fully covered by the seller side.",
      growth_ar: "تقديم ندوات تثقيفية مجانية داخل القواعد العسكرية القريبة حول كيفية استغلال قروض VA لشراء وتملك المنازل بأمان.",
      growth_en: "Deliver free educational webinars and distribute brochures at veteran support offices and local bases."
    },
    {
      n_ar: "تطوير حلول التكنولوجيا العقارية (PropTech)",
      n_en: "PropTech Solutions Development",
      opp_ar: "لا يزال السوق العقاري يعتمد على ورقيات وطرق تقليدية؛ تبحث الشركات عن برمجيات تسرع البيع وتسهل إدارة الأملاك.",
      opp_en: "The traditional real estate sector relies on outdated paper systems, creating huge opportunities for automation software.",
      client_ar: "شركات إدارة الأملاك الكبرى، وكالات الوساطة العقارية العملاقة، ومطورو العقارات.",
      client_en: "Enterprise property management firms, high-volume brokerages, and real estate developers.",
      usp_ar: "بناء تطبيقات سحابية متقدمة لإدارة الصيانة التلقائية وتوقيع العقود الرقمية وتتبع تحصيل الإيجارات بذكاء.",
      usp_en: "Developing secure SaaS portals that automate rent collection, tenant screening, and digital leasing agreements.",
      pricing_ar: "مشاريع تطوير مخصصة: تبدأ من 10,000$ إلى 40,000$ حسب المزايا المطلوبة.",
      pricing_en: "PropTech custom build: $10,000 to $40,000 based on modules and database complexity.",
      growth_ar: "عرض لوحة تحكم تفاعلية توفر 70% من وقت إدارة العقارات والصيانة وتجربتها مجاناً للعملاء المحتملين.",
      growth_en: "Build a highly engaging interactive wireframe mockup and pitch it directly to real estate operations directors."
    },
    {
      n_ar: "الثقافة المالية للجيل الجديد والمراهقين",
      n_en: "Financial Literacy for Gen Z/Teens",
      opp_ar: "يرغب الآباء في تعليم أبنائهم المراهقين كيفية الادخار والاستثمار العقاري والمالي مبكراً لبناء مستقبل آمن.",
      opp_en: "Parents are highly anxious to teach their teenagers critical money habits, budgeting, and investment strategies early.",
      client_ar: "الآباء والأمهات الحريصون على المستقبل المالي لأولادهم، والمدارس الخاصة الراقية.",
      client_en: "Middle and upper-class parents, high schools seeking enrichment programs, and teen students.",
      usp_ar: "ألعاب تفاعلية وورش عمل مسلية تعلم المراهقين إدارة الميزانية والاستثمار في الأصول بأسلوب يناسب لغتهم واهتماماتهم.",
      usp_en: "Gamified finance apps, animated study plans, and live workshops that turn complex economics into fun teen challenges.",
      pricing_ar: "اشتراك في النادي المالي أو التطبيق التفاعلي: 49$ - 99$/شهرياً للطفل.",
      pricing_en: "Teen Financial Club monthly enrollment fee: $49 - $99/mo including digital simulator access.",
      growth_ar: "تقديم محاضرات مجانية تفاعلية في المدارس الخاصة والنوادي حول كواليس الذكاء المالي وتوليد الثروات مبكراً.",
      growth_en: "Deliver guest talks on 'How to double your allowance through smart investing' at premium schools."
    },
    {
      n_ar: "استراتيجية الاستثمار في وحدات التخزين الذاتي",
      n_en: "Self-Storage Investment Strategy",
      opp_ar: "الاستثمار في مخازن التخزين الذاتي (Self-Storage) يمتلك هوامش ربح خيالية ومقاومة شديدة للركود مقارنة بالمكاتب.",
      opp_en: "Investing in self-storage facilities offers massive profit margins and high recession resistance compared to commercial offices.",
      client_ar: "المستثمرون العقاريون الباحثون عن تنويع أصولهم، والمطورون الصغار الراغبون في استغلال الأراضي الرخيصة.",
      client_en: "Retail property investors looking for diversification, and land owners wanting high yield on low build costs.",
      usp_ar: "تحديد الأراضي المناسبة وإدارة بناء المخازن وأتمتة بوابات الدفع والدخول الذاتي بالكامل دون الحاجة لموظفين.",
      usp_en: "Underwriting local demand, securing zoning permits, and deploying 100% keyless automated facility software systems.",
      pricing_ar: "دراسة وتأسيس استراتيجية المشروع: 4000$ - 9000$.",
      pricing_en: "Full feasibility study, site selection underwriting, and tech integration package: $4000 - $9000.",
      growth_ar: "نشر إحصائيات تقارن تكلفة صيانة المباني السكنية المتعبة مقابل صيانة مخازن التخزين البسيطة والربحية.",
      growth_en: "Publish LinkedIn posts comparing high-maintenance residential units vs near-zero maintenance self-storage setups."
    },
    {
      n_ar: "الأسواق العقارية الفاخرة والمطلة على البحر",
      n_en: "Waterfront & Luxury Niche Markets",
      opp_ar: "يبحث أثرياء العالم والمستثمرون الأجانب عن عقارات فاخرة مطلة على البحر كاستثمار آمن ورمز للمكانة الاجتماعية الفخمة.",
      opp_en: "Ultra-high-net-worth buyers and international expats actively search for premium beachfront assets as secure investments.",
      client_ar: "أثرياء العالم، كبار التنفيذيين، والمستثمرون الأجانب الباحثون عن الإقامة الذهبية.",
      client_en: "Global UHNWIs, high-income expats, and institutional luxury collectors.",
      usp_ar: "وصول حصري لعقارات فاخرة غير معروضة للعامة (Off-Market) مع تقديم خدمات كونسيرج واستشارات قانونية متكاملة.",
      usp_en: "Exclusive off-market villa access, private luxury yacht showings, and full VIP golden visa citizenship packaging.",
      pricing_ar: "عمولة شراء العقارات الفاخرة: 2% - 3% مدفوعة بالكامل من طرف مطور المشروع.",
      pricing_en: "Premium agency acquisition commission (2% to 3%) fully settled by the property developer.",
      growth_ar: "إنتاج فيديوهات جولات سينمائية فخمة للغاية للعقارات ونشرها على يوتيوب وإنستغرام لاستهداف النخبة الباحثة.",
      growth_en: "Create cinematic, high-production architectural walkthrough videos on YouTube targeting luxury buyers."
    },
    {
      n_ar: "تحليل صناديق الاستثمار العقاري (REITs)",
      n_en: "Real Estate Investment Trust (REIT) Analysis",
      opp_ar: "يرغب المستثمرون في جني أرباح العقارات من خلال البورصة عبر صناديق الـ REITs ولكنهم يعانون من اختيار أفضل الصناديق ربحية.",
      opp_en: "Investors want real estate cash flow via public markets (REITs) but struggle to identify underpriced dividend yields.",
      client_ar: "مستثمرو الأسهم، المتقاعدون، والباحثون عن توزيعات أرباح شهرية مستقرة وآمنة.",
      client_en: "Dividend investors, retirees, and retail stock buyers looking to build reliable monthly cash flows.",
      usp_ar: "تقارير مالية متخصصة ومبسطة تقارن بين الصناديق وتحدد الأفضل بناءً على نسب الإشغال والديون وجودة العقارات.",
      usp_en: "Providing granular underwriting reports, active portfolio audits, and direct buy/sell ratings for public REITs.",
      pricing_ar: "تقرير تحليل المحفظة العقارية: 300$ | اشتراك شهري للتقارير الاستثمارية: 49$/شهرياً.",
      pricing_en: "One-off stock portfolio analysis: $300 | Monthly advisory newsletter and buy/sell alerts: $49/mo.",
      growth_ar: "نشر مقارنات أداء دورية بين صناديق الاستثمار العقاري ومؤشرات السوق العامة لكسب سلطة معرفية في مجالك.",
      growth_en: "Publish regular dividend performance tracking charts comparing top REIT indices against the S&P 500."
    },
    {
      n_ar: "شراء وتطوير وبيع الأراضي (Land Flipping)",
      n_en: "Land Flipping & Development",
      opp_ar: "شراء الأراضي المهملة بأسعار رخيصة وتجزئتها أو استخراج رخص بناء لها ثم إعادة بيعها يدر أرباحاً خيالية في وقت قياسي.",
      opp_en: "Buying raw vacant land at a discount, securing zoning approvals, and flipping it to homebuilders yields massive returns.",
      client_ar: "مطور العقارات، المقاولون، والمستثمرون الباحثون عن صفقات سريعة بلا مشاكل صيانة المباني المزعجة.",
      client_en: "Boutique developers, custom homebuilders, and speculative land investors.",
      usp_ar: "خبرة واسعة في استخراج رخص التنظيم والتقسيم وتحديد الأراضي ذات المستقبل الواعد قبل ارتفاع سعرها.",
      usp_en: "Unlocking hidden land values through professional rezoning, utility mapping, and direct marketing to local homebuilders.",
      pricing_ar: "استشارة وتسهيل الاستحواذ: 5000$ مقدم + نسبة 15% من صافي أرباح بيع الأرض بعد التطوير.",
      pricing_en: "Land acquisition structuring: $5000 upfront fee + 15% share of net development/flip profits.",
      growth_ar: "مشاركة قصص نجاح مدعومة بالخرائط والصور لأراضٍ غير مطورة تم بيعها بضعف سعرها بعد استخراج الرخص القانونية.",
      growth_en: "Share map-based video breakdowns of raw dirt tracks flipped for 100%+ gains via smart rezoning strategies."
    }
  ],
  creative: [
    {
      n_ar: "صناعة الأدوات الرقمية للمبدعين (فرش وقوالب)",
      n_en: "Digital Tool Creation for Creatives",
      opp_ar: "يبحث ملايين المصممين والرسامين يومياً عن أدوات توفر وقتهم (مثل فرش فوتوشوب وقوالب موشن) لتسريع وتيرة عملهم.",
      opp_en: "Millions of digital artists, video editors, and creators pay for premade asset packs to speed up client workflows.",
      client_ar: "المصممون المستقلون، الرسامون الرقميون، ووكالات المونتاج وصناعة الفيديو النشطة.",
      client_en: "Freelance graphic designers, digital painters, and boutique video editing agencies.",
      usp_ar: "أدوات وقوالب برمجية احترافية ومبتكرة للغاية تزيد كفاءة العمل وتقدم نتائج جمالية ساحرة بضغطة زر.",
      usp_en: "Designing premium custom brushes, video asset packs, and UI templates that save hours of execution time.",
      pricing_ar: "باقة أدوات رقمية: 29$ - 99$ للتنزيل المباشر | اشتراك سنوي للمبدعين: 149$/سنوياً.",
      pricing_en: "Bespoke asset bundles: $29 - $99 digital download | Annual creative VIP asset access pass: $149/yr.",
      growth_ar: "نشر فيديوهات سريعة وجذابة (Tutorials) على تيك توك وتويتر تستعرض سهولة وجمال النتيجة عند استخدام أدواتنا.",
      growth_en: "Share high-speed tutorials on Instagram Reels and TikTok showcasing instant stunning results using our asset packs."
    },
    {
      n_ar: "تصميم البراندات القائم على الفنون اليدوية",
      n_en: "Tactile & Craft-Based Brand Design",
      opp_ar: "في عصر التصاميم الرقمية الباردة والمتكررة، تبحث العلامات التجارية المتميزة عن هويات دافئة وفنون مرسومة يدوياً تميزها.",
      opp_en: "In a world of sterile, generic corporate designs, high-end brands seek authentic hand-crafted artistic branding.",
      client_ar: "المقاهي الفاخرة، براندات الأغذية العضوية والمشروبات، والمطاعم الراقية المتفردة.",
      client_en: "Artisan bakeries, organic tea/coffee brands, and boutique eco-luxury cosmetic labels.",
      usp_ar: "رسم شعارات وهويات بصرية يدوياً بالكامل باستخدام الألوان المائية والخطوط الكلاسيكية لتعكس الدفء واللمسة الإنسانية.",
      usp_en: "Creating bespoke tactile brand identities, custom watercolor illustrations, and hand-drawn typography that tell a warm human story.",
      pricing_ar: "تصميم هوية بصرية كاملة يدوية: 1500$ - 3500$ للمشروع الفردي.",
      pricing_en: "Bespoke tactile branding package (hand-made illustrations + print guidelines): $1500 - $3500.",
      growth_ar: "مشاركة كواليس الرسم اليدوي واختيار الألوان الطبيعية بالفيديو (Behind the Scenes) لجذب أصحاب الذوق الرفيع.",
      growth_en: "Post aesthetic 'behind-the-scenes' painting and sketching reels to capture design-focused company founders."
    },
    {
      n_ar: "التصميم الداخلي الحيوي (دمج الطبيعة)",
      n_en: "Biophilic Interior Design",
      opp_ar: "تزايد رغبة الشركات وأصحاب المنازل في تصميم مساحات تدمج الطبيعة (النباتات، الإضاءة الطبيعية) لتقليل التوتر وزيادة الإبداع.",
      opp_en: "Soaring corporate and residential demand for layouts that integrate live plants, natural light, and organic textures.",
      client_ar: "الشركات الكبرى الباحثة عن مساحات عمل صحية لموظفيها، وأصحاب الفلل والشقق الفاخرة.",
      client_en: "Tech companies building green office spaces, aesthetic wellness spas, and eco-conscious luxury homeowners.",
      usp_ar: "تصاميم ذكية تحسن جودة الهواء وتقلل التوتر عبر الدمج الفني للنباتات والمواد الطبيعية لبيئة صحية متكاملة.",
      usp_en: "Scientific, certified biophilic zoning that improves indoor air quality, maximizes circadian lighting, and reduces workplace stress.",
      pricing_ar: "مشاريع التصميم الداخلي: تبدأ من 3000$ أو نسبة 10% من ميزانية التنفيذ والتشطيب الكلية.",
      pricing_en: "Bespoke interior design blueprint: starts at $3000 or 10% of total physical fit-out budget.",
      growth_ar: "نشر دراسات حالة وصور مبهرة تظهر أثر النباتات الطبيعية وتوزيع الإضاءة على زيادة حيوية ونشاط الموظفين.",
      growth_en: "Publish striking 'Before/After' visual transformations of spaces optimized with lush vertical plant walls."
    },
    {
      n_ar: "الرسم القصصي والتوضيحي القائم على السرد",
      n_en: "Story-Driven Illustration & Narrative",
      opp_ar: "تبحث دور النشر والشركات عن رسامين قادرين على تحويل نصوص الكتب ورسائل البراند إلى رسومات قصصية تعبيرية ملهمة للجمهور.",
      opp_en: "Publishing houses and corporate marketing teams require narrative-driven illustrators to bring books and campaigns to life.",
      client_ar: "دور نشر كتب الأطفال واليافعين، والوكالات الإعلانية التي تصمم حملات سردية تفاعلية.",
      client_en: "Children's book publishers, narrative game studios, and corporate marketing teams building emotional campaigns.",
      usp_ar: "رسم شخصيات ومشاهد مذهلة تحمل أبعاداً عاطفية عميقة وتعبر عن النص المكتوب بأسلوب فني متفرد ومؤثر.",
      usp_en: "Bespoke illustration sets with deep emotional resonance, consistent custom character design, and distinctive visual styles.",
      pricing_ar: "رسم كتاب أطفال كامل (16 صفحة): 1500$ - 3500$ حسب التفاصيل الفنية المطلوبة.",
      pricing_en: "Full children's book illustration package (16 pages): $1500 - $3500 depending on style complexity.",
      growth_ar: "نشر خطوات بناء الشخصيات ورسم القصص بالفيديو على منصات التواصل لجذب انتباه دور النشر والمؤلفين الطموحين.",
      growth_en: "Post speed-paint process clips highlighting how a story sketch transitions into a beautifully polished cover."
    },
    {
      n_ar: "تصميم واجهات الويب 3 والميتافيرس",
      n_en: "UI/UX Design for Web3 & Metaverse",
      opp_ar: "تعاني مشاريع الكريبتو والميتافيرس من تعقيد الواجهات وصعوبة الاستخدام؛ هناك حاجة ماسة لمصممي تجربة مستخدم لتبسيطها.",
      opp_en: "Crypto and Web3 applications suffer from complex, confusing user flows. There is massive demand for simplified UI/UX designs.",
      client_ar: "منصات تداول العملات الرقمية، ألعاب الويب 3، ومشاريع الـ NFT والتقنيات اللامركزية.",
      client_en: "Decentralized finance (DeFi) networks, crypto wallets, Web3 gaming platforms, and NFT projects.",
      usp_ar: "تبسيط العمليات المعقدة (مثل ربط المحافظ ودفع الغاز) في واجهات تفاعلية مذهلة وسهلة الاستخدام لغير الخبراء.",
      usp_en: "Translating complex blockchain concepts (wallet bridging, gas fees) into clean, gorgeous, and accessible mobile interfaces.",
      pricing_ar: "تصميم واجهات وتجربة المستخدم للمشروع: 3500$ - 8000$ حسب عدد الشاشات والتعقيد.",
      pricing_en: "Web3/DeFi app UI/UX design: $3500 - $8000 depending on total wireframe views and interactive components.",
      growth_ar: "إعادة تصميم واجهة معقدة لأحد المشاريع المشهورة ونشرها كدراسة حالة تبسيطية على منصة لينكد إن وتويتر.",
      growth_en: "Publish UX audit case studies on X/Twitter and Behance showcasing simplified interfaces for popular crypto products."
    },
    {
      n_ar: "تحريك ستوب موشن والأنيميشن الإبداعي",
      n_en: "Stop-Motion & Creative Animation",
      opp_ar: "تبحث البراندات عن محتوى إعلاني ساحر ومختلف يجذب انتباه المستخدم وسط زحام الفيديوهات المتكررة على منصات التواصل.",
      opp_en: "Brands struggle with short attention spans. They pay top dollar for nostalgic, highly tactile stop-motion animation.",
      client_ar: "براندات المنتجات الغذائية، الألعاب، المتاجر الإلكترونية الإبداعية، والبراندات الفاخرة.",
      client_en: "Artisan food brands, toy companies, creative agency campaigns, and e-commerce stores.",
      usp_ar: "إنتاج فيديوهات إعلانية مبهرة بالتحريك اليدوي لمنتجات حقيقية تضفي سحراً وروحاً خاصة للبراند وتزيد المبيعات.",
      usp_en: "Crafting beautiful stop-motion ads using real products and tactile clay, creating instantly viral high-retention visuals.",
      pricing_ar: "فيديو إعلاني ستوب موشن مدته 15 ثانية: 600$ - 1500$ شامل التصوير والمونتاج وصناعة المؤثرات.",
      pricing_en: "15-second customized stop-motion product ad: $600 - $1500 depending on prop styling.",
      growth_ar: "صناعة فيديو ستوب موشن تجريبي قصير لبراند شهير ونشره على تيك توك للإشارة لقدرتك على التميز والإبداع الفني.",
      growth_en: "Create a 10-second clay-motion spec ad for a famous consumer brand, tagging them to demonstrate your visual skill."
    },
    {
      n_ar: "الخط العربي في الهويات البصرية الحديثة",
      n_en: "Arabic Calligraphy in Modern Branding",
      opp_ar: "ترغب الشركات العربية الراقية في إبراز أصالتها وثقافتها عبر دمج الخط العربي الكلاسيكي في شعاراتها الحديثة بشكل أنيق.",
      opp_en: "Arabian luxury brands and cultural initiatives seek modern identities that elegantly weave classic calligraphy.",
      client_ar: "الفنادق الفاخرة، العطور الشرقية المرموقة، المطاعم الفخمة، والمؤسسات الثقافية الحكومية.",
      client_en: "Boutique high-end hotels, perfume houses, luxury Middle Eastern cafes, and cultural foundations.",
      usp_ar: "كتابة وتصميم شعارات وهويات بصرية فريدة تجمع بين أصالة الخط العربي القديم وبساطة التصميم العالمي الحديث.",
      usp_en: "Hand-crafting bespoke Arabic logotypes that blend high calligraphy with minimalist, global modern design structures.",
      pricing_ar: "تصميم شعار خطي فريد ومطور: 800$ - 2000$ | هوية بصرية كاملة متكاملة: 3000$.",
      pricing_en: "Bespoke Arabic logotype: $800 - $2000 | Complete luxury visual identity manual: $3000.",
      growth_ar: "مشاركة فيديوهات لكتابة الحروف بالخط العربي والمراحل الفنية لتطويرها لشعار رقمي فخم على إنستغرام ولينكد إن.",
      growth_en: "Publish calming calligraphy sketching videos showing the transformation from ink to a luxury vector asset."
    },
    {
      n_ar: "التصميم للطباعة ثلاثية الأبعاد والنماذج",
      n_en: "3D Printing Design & Prototyping",
      opp_ar: "تبحث الشركات والمبتكرون عن مصممي ثلاثي أبعاد لتصميم وتجهيز نماذج أولية سريعة لمنتجاتهم قابلة للطباعة المادية الفورية.",
      opp_en: "Inventors and product engineers require expert 3D modelers to design printable physical prototypes in record time.",
      client_ar: "المخترعون، مصممو الإكسسوارات والمجوهرات، والشركات الصناعية والطبية الناشئة.",
      client_en: "Product designers, jewelry makers, boutique hardware startups, and medical tool developers.",
      usp_ar: "تصميم ملفات ثلاثية أبعاد دقيقة للغاية ومتوافقة تماماً مع جميع متطلبات طابعات الـ 3D لضمان خروج المنتج بلا عيوب مادية.",
      usp_en: "Designing error-free, mathematically precise CAD files ready for flawless SLS/FDM 3D printing outputs.",
      pricing_ar: "تصميم النموذج الأولي: 400$ - 1500$ حسب تعقيد الأجزاء الهندسية والتحمل المطلوب.",
      pricing_en: "Product 3D CAD modeling & print testing: $400 - $1500 depending on mechanical assembly.",
      growth_ar: "عرض فيديوهات توضح تحول الفكرة المرسومة على ورق لنموذج مادي حقيقي بين يديك مطبوع بالكامل في يوم واحد.",
      growth_en: "Share time-lapse videos of a 3D printer bringing one of your complex custom models to life."
    },
    {
      n_ar: "الكتابة الإبداعية وبناء العوالم القصصية",
      n_en: "Creative Writing & World Building",
      opp_ar: "تبحث شركات الألعاب والأفلام عن كتاب مبدعين لبناء حبكات قصصية عميقة وعوالم خيالية متكاملة تجذب تفاعل المتابعين.",
      opp_en: "Gaming studios and production houses seek world-class creative writers to craft immersive stories and characters.",
      client_ar: "استوديوهات تطوير الألعاب، شركات الإنتاج السينمائي والدرامي، ومنصات الروايات التفاعلية.",
      client_en: "Indie game development studios, animation production houses, and interactive audio platforms.",
      usp_ar: "صياغة عوالم خيالية متكاملة وقوانين تاريخية وحوارات شخصيات غنية بالعمق تضمن اندماج الجمهور وتفاعله الدائم.",
      usp_en: "Structuring entire custom lore guides, branching narrative dialogue trees, and deep, emotionally rich character backgrounds.",
      pricing_ar: "بناء ملف القصة والعالم (Lore Bible): 2500$ - 6000$ حسب تشعب وسياق القصة والأحداث.",
      pricing_en: "Comprehensive world-building lore bible & dialogue assets package: $2500 to $6000.",
      growth_ar: "نشر مقتطفات من قصصك المشوقة وبناء عوالم خيالية غامضة على منصات الكتاب والمبدعين والمخرجين الرقميين.",
      growth_en: "Publish fascinating snippets of fantasy world designs and complex character conflict maps on writer forums."
    },
    {
      n_ar: "التصوير الفني والسرد البصري",
      n_en: "Artistic Photography & Visual Storytelling",
      opp_ar: "تبحث الفنادق والبراندات الفاخرة عن مصورين مبدعين يوثقون تجاربهم بأسلوب فني سينمائي يروي قصة جمالية مغرية للعملاء.",
      opp_en: "Luxury brands and hotels seek artistic photographers who capture their experiences in cinematic visual essays.",
      client_ar: "الفنادق الفاخرة والمقاصد السياحية الكبرى، ومصممو الأزياء والمجوهرات الفاخرة.",
      client_en: "Boutique travel destinations, high-fashion houses, and premium lifestyle product brands.",
      usp_ar: "التقاط صور ذات زوايا إبداعية تعتمد على الإضاءة الطبيعية والظلال لتروي قصة عاطفية تجعل المشاهد يرغب في عيش التجربة.",
      usp_en: "Cinematic, atmosphere-rich visual staging that emphasizes raw emotion, editorial lighting, and editorial composition.",
      pricing_ar: "جلسة تصوير يوم كامل متكامل وتعديل فني: 1200$ - 3000$ تشمل تسليم 30 صورة احترافية.",
      pricing_en: "Full-day editorial photoshoot session, styling, and art direction: $1200 - $3000.",
      growth_ar: "نشر مقالات بصرية لقصص وثقت بها فنادق ريفية أو رحلات برية بأسلوب سينمائي يبرز جمالية وسحر الطبيعة للجميع.",
      growth_en: "Share highly curated aesthetic photo essays of high-end travel properties on Instagram and Behance."
    },
    {
      n_ar: "الفن التوليدي والبرمجة الإبداعية",
      n_en: "Generative Art & Creative Coding",
      opp_ar: "تبحث المعارض الرقمية والبراندات الحديثة عن لوحات فنية وتصاميم تفاعلية تولدها الخوارزميات البرمجية بشكل مبدع وغير متكرر.",
      opp_en: "Digital art galleries and modern brands seek algorithmic, interactive designs that render dynamically via code.",
      client_ar: "متاحف الفن المعاصر، مصممو واجهات المعارض الرقمية التفاعلية، ومبتكرو مشاريع الفن الرقمي الفريد.",
      client_en: "Modern art spaces, digital museum experience designers, and generative NFT platform developers.",
      usp_ar: "برمجة لوحات فنية متكاملة تتفاعل حركياً مع الموسيقى أو حركة الزوار في المكان باستخدام لغات برمجة إبداعية (P5.js).",
      usp_en: "Coding beautiful generative art layouts and real-time interactive projection systems using Processing, p5.js, and WebGL.",
      pricing_ar: "تطوير لوحة خوارزمية أو عرض تفاعلي للمعرض: 3000$ - 8000$ حسب تفاعل الأنظمة والبرمجيات.",
      pricing_en: "Generative script design or interactive gallery projection programming project: $3000 - $8000.",
      growth_ar: "عرض مقاطع فيديو قصيرة وحية تظهر تفاعل اللوحات البرمجية مع حركة يدك أو نبضات الموسيقى المحيطة بك.",
      growth_en: "Post hypnotizing, real-time screen-capture loops of generative algorithms reacting to touch or audio inputs."
    },
    {
      n_ar: "تصميم الأزياء والمنسوجات المستدام",
      n_en: "Sustainable Fashion & Textile Design",
      opp_ar: "يتزايد وعي الجمهور بضرورة تجنب الموضة السريعة المدمرة للبيئة، وتبحث المتاجر عن تصاميم أزياء صديقة للبيئة وفريدة.",
      opp_en: "Consumer backlash against fast-fashion drives massive demand for eco-friendly, slow-fashion clothing concepts.",
      client_ar: "متاجر الأزياء الصديقة للبيئة D2C، وبراندات المنسوجات المنزلية الفاخرة والعضوية.",
      client_en: "Sustainable fashion labels, boutique organic cotton linen brands, and green apparel startups.",
      usp_ar: "تصميم ملابس عصرية وراقية باستخدام أقمشة طبيعية وعضوية معاد تدويرها وصباغتها بألوان نباتية آمنة 100%.",
      usp_en: "Designing chic, durable garments using zero-waste pattern-making, organic linens, and non-toxic botanical dyes.",
      pricing_ar: "تصميم خط أزياء مصغر (5 قطع بالباترونات والـ Tech Packs): 1500$ - 3500$.",
      pricing_en: "Custom apparel collection design (5 pieces with patterns and technical packs): $1500 - $3500.",
      growth_ar: "توثيق كواليس صباغة الأقمشة بأوراق الورد والكركم بالفيديو لإظهار الأصالة واللمسة الطبيعية الصديقة للبيئة.",
      growth_en: "Share satisfying videos of raw organic fabrics dyed using real botanical flowers, highlighting clean slow-fashion."
    },
    {
      n_ar: "تصميم الألعاب وفن المفاهيم (Concept Art)",
      n_en: "Game Design & Concept Art",
      opp_ar: "تحتاج استوديوهات الألعاب بشكل مستمر إلى رسامي فن مفاهيم (Concept Artists) لتصميم شكل الشخصيات والعوالم لتسهيل برمجتها.",
      opp_en: "Game studios need world-class concept artists to establish the visual style of characters, props, and backgrounds.",
      client_ar: "استوديوهات الألعاب المستقلة (Indie Studios)، ومطورو ألعاب الهواتف الذكية التفاعلية.",
      client_en: "Indie game studios, mobile game publishers, and visual novel production teams.",
      usp_ar: "رسم وتصميم مفاهيم فنية مبتكرة للغاية ترسم روح وجو اللعبة وتسهل على النحاتين ومصممي الـ 3D بنائها بسهولة.",
      usp_en: "Bespoke character turnaround sheets, environment keys, and prop layouts designed strictly for quick 3D model translations.",
      pricing_ar: "باقة 5 شخصيات وبيئتين مفاهيمية للعبة: 2000$ - 5000$.",
      pricing_en: "Comprehensive concept art set (5 characters + 2 environments): $2000 - $5000.",
      growth_ar: "نشر خطوات تصميم الوحوش أو المحاربين من اسكتش بدائي إلى شخصية سينمائية كاملة على منصات مجتمعات الألعاب.",
      growth_en: "Publish character-creation time-lapses showcasing how a basic gesture drawing becomes a terrifying monster boss."
    },
    {
      n_ar: "تصميم العبوات وتجربة فتح المنتج",
      n_en: "Package Design & Unboxing Experience",
      opp_ar: "تباع المنتجات بجمال تغليفها؛ تبحث المتاجر عن تصاميم عبوات مبتكرة تجعل العميل يصور تجربة فتح المنتج وينشرها فخوراً.",
      opp_en: "Product sales are heavily driven by visual appeal. Brands invest heavily to make their unboxing viral on TikTok/Instagram.",
      client_ar: "متاجر التجارة الإلكترونية الفاخرة، براندات الهدايا والتجميل، والأغذية والحلويات الفاخرة.",
      client_en: "D2C cosmetic brands, high-end confectionery startups, and premium lifestyle subscription box businesses.",
      usp_ar: "تصميم عبوات بمقاسات ذكية ومواد صديقة للبيئة تضمن أمان المنتج وتقدم متعة بصرية ولمسة فنية مذهلة عند فتحها.",
      usp_en: "Designing structurally intelligent, zero-plastic packaging tailored for an incredibly satisfying tactile unboxing experience.",
      pricing_ar: "تصميم عبوة منتج متكاملة (3D Render + ملفات الطباعة): 800$ - 1800$.",
      pricing_en: "Packaging design project (structural die-lines + 3D product renders + print-ready files): $800 - $1800.",
      growth_ar: "أخذ منتجات تغليفها سيئ وتصميم عبوات ساحرة ومبتكرة لها بالفيديو ومشاركتها مع ملاك البراندات كعينة لقدراتك.",
      growth_en: "Redesign basic packaging of scaling online brands, post the conceptual 3D unboxing, and pitch it directly to the founders."
    },
    {
      n_ar: "فنون التجهيزات التفاعلية",
      n_en: "Interactive Installation Art",
      opp_ar: "تبحث المهرجانات الوطنية والمراكز التجارية الكبرى عن مجسمات وتجهيزات فنية تفاعلية تجذب العائلات وتصنع صدى إعلامياً كبيراً.",
      opp_en: "National festivals and major retail centers look for massive interactive art installations that captivate crowds.",
      client_ar: "اللجان الحكومية للمهرجانات والفعاليات، المعارض التجارية الفاخرة، والشركات العقارية لمشاريع نمط الحياة.",
      client_en: "Government cultural ministries, retail center developers, and creative event coordination agencies.",
      usp_ar: "تصميم مجسمات فنية ضخمة تدمج الضوء والرياح والصوت والتفاعل الحركي لتخلق دهشة وسحراً بصرياً لا يُنسى للزوار.",
      usp_en: "Scaling custom public installations that blend kinetics, sensor tech, and modern projection mapping to stun and delight crowds.",
      pricing_ar: "استشارة وتصميم الفكرة والمخططات الهندسية للمجسم: 5000$ - 15,000$.",
      pricing_en: "Bespoke structural concept design, 3D simulation, and engineering blueprint package: $5000 - $15,000.",
      growth_ar: "نشر محاكاة ثلاثية أبعاد بالفيديو لتجهيزات فنية تفاعلية تخلق رغبة شديدة لدى منظمي الفعاليات لتنفيذها عملياً.",
      growth_en: "Publish cinematic 3D simulations of interactive light forests and kinetic sculptures to catch high-budget event managers."
    }
  ]
};

// Compile raw data into the rich Firestore document schema expected by getNicheAnalysis
export const nicheAnalysisData = [];

// 1. Add Parent Niche fallbacks (ecom, saas, life_coaching, fitness, realestate_sales, graphic_design)
// to make sure standard fallbacks still resolve successfully
nicheAnalysisData.push(...LEGACY_FALLBACKS);

// 2. Loop and generate the 90 custom sub-niches using index mapping
Object.entries(RAW_NICHES).forEach(([parentId, subList]) => {
  subList.forEach((n, index) => {
    const docId = `${parentId}_${index}`;
    
    const analysis_ar = `## 🎯 تحليل نيتش ${n.n_ar}

**🎯 الفرصة:**
- ${n.opp_ar}

**👤 العميل المثالي:**
- ${n.client_ar}

**💎 نقاط التمييز:**
- ${n.usp_ar}

**💰 استراتيجية التسعير:**
- ${n.pricing_ar}

**📈 قنوات النمو:**
- ${n.growth_ar}`;

    const analysis_en = `## 🎯 Strategic Analysis: ${n.n_en}

**🎯 Opportunity:**
- ${n.opp_en}

**👤 Ideal Customer:**
- ${n.client_en}

**💎 Key USPs:**
- ${n.usp_en}

**💰 Pricing Strategy:**
- ${n.pricing_en}

**📈 Growth Channels:**
- ${n.growth_en}`;

    nicheAnalysisData.push({
      id: docId,
      niche_ar: n.n_ar,
      niche_en: n.n_en,
      analysis_ar,
      analysis_en,
      ideal_client_ar: n.client_ar,
      usp_ar: n.usp_ar,
      pricing_ar: n.pricing_ar,
      channels_ar: [n.growth_ar.split('،')[0] || n.growth_ar]
    });
  });
});

export const seedNicheAnalysis = async () => {
  console.log('🌱 Seeding niche analysis database (90 Custom + Fallbacks)...');
  let count = 0;
  for (const item of nicheAnalysisData) {
    try {
      const { id, ...data } = item;
      await setDoc(doc(db, COL, id), { ...data, updatedAt: new Date() });
      count++;
    } catch (e) {
      console.error(`  ❌ Error seeding ${item.id}:`, e.message);
    }
  }
  console.log(`✅ Niche analysis seeding completed successfully! Wrote ${count} documents.`);
};

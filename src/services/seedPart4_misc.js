// seedPart4_misc.js — Brand Names + Colors + Content Plans + Marketing Plans
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// ─── BRAND NAMES ────────────────────────────────────────────────────────────
const BRAND_COL = 'tc_brand_names';

const brandNamesData = [
  {
    id: 'ecom_modern',
    names: [
      { name: 'Trendify', meaning_ar: 'التحول للموضة والأشياء الرائجة', meaning_en: 'Turning into trends', domain_tip: 'trendify.shop' },
      { name: 'AuraCart', meaning_ar: 'عربة التسوق ذات الهالة والجاذبية', meaning_en: 'Shopping cart with an aura', domain_tip: 'auracart.com' },
      { name: 'SwiftBuy', meaning_ar: 'الشراء السريع والسهل', meaning_en: 'Fast and easy buying', domain_tip: 'swiftbuy.net' }
    ],
    taglines: [
      { ar: 'تسوق المستقبل اليوم.', en: 'Shop the future today.' },
      { ar: 'أسلوبك، بسرعتك.', en: 'Your style, your speed.' }
    ]
  },
  {
    id: 'ecom_luxury',
    names: [
      { name: 'LuxeCartel', meaning_ar: 'نخبة الفخامة', meaning_en: 'The elite of luxury', domain_tip: 'luxecartel.com' },
      { name: 'Aethel', meaning_ar: 'كلمة قديمة تعني النبيل', meaning_en: 'Old English for noble', domain_tip: 'aethel.co' }
    ],
    taglines: [
      { ar: 'الفخامة التي تستحقها.', en: 'The luxury you deserve.' }
    ]
  },
  {
    id: 'saas_modern',
    names: [
      { name: 'FlowStack', meaning_ar: 'تكدس التدفق والإنتاجية', meaning_en: 'Stacking flow and productivity', domain_tip: 'flowstack.io' },
      { name: 'SyncHub', meaning_ar: 'مركز المزامنة والترابط', meaning_en: 'Synchronization hub', domain_tip: 'synchub.app' }
    ],
    taglines: [
      { ar: 'أنجز أكثر، بجهد أقل.', en: 'Do more, with less effort.' }
    ]
  },
  {
    id: 'general_modern', // Fallback
    names: [
      { name: 'NovaCore', meaning_ar: 'النواة الجديدة للنجاح', meaning_en: 'New core for success', domain_tip: 'novacore.io' },
      { name: 'VibeMatrix', meaning_ar: 'مصفوفة الحيوية والنشاط', meaning_en: 'Matrix of vibes', domain_tip: 'vibematrix.com' }
    ],
    taglines: [
      { ar: 'طريقك للقمة.', en: 'Your path to the top.' }
    ]
  }
];

// ─── COLOR ANALYSIS ──────────────────────────────────────────────────────────
const COLOR_COL = 'tc_color_analysis';

const colorAnalysisData = [
  {
    id: 'neon',
    psychology_ar: 'يُشير النيون إلى الابتكار، التكنولوجيا المتقدمة، والطاقة العالية جداً. يجذب الانتباه فوراً ويخلق شعوراً بالسرعة والمستقبل.',
    psychology_en: 'Neon indicates innovation, advanced technology, and extreme high energy. It grabs immediate attention and creates a futuristic feel.',
    brand_tone_ar: 'جريء، مستقبلي، وسريع الإيقاع.',
    brand_tone_en: 'Bold, futuristic, and fast-paced.',
    recommended_industries_ar: ['الذكاء الاصطناعي وSaaS', 'الألعاب (Gaming)', 'العملات الرقمية', 'التكنولوجيا المالية'],
    recommended_industries_en: ['AI & SaaS', 'Gaming', 'Crypto', 'FinTech'],
    font_pairings_ar: 'Cairo (عريض) + IBM Plex Sans Arabic',
    font_pairings_en: 'Space Grotesk + Inter',
    dos_and_donts_ar: '✅ افعل: استخدمه على خلفيات داكنة (Dark Mode) كإضاءة تبرز الأزرار.\n❌ تجنب: استخدامه في النصوص الطويلة لأنه يرهق العين بشدة.',
    dos_and_donts_en: '✅ Do: Use it on dark backgrounds (Dark Mode) to highlight buttons.\n❌ Don\'t: Use it for body text as it causes severe eye strain.'
  },
  {
    id: 'purple',
    psychology_ar: 'يرمز البنفسجي للفخامة، الخيال، الحكمة، والروحانية. يجمع بين طاقة الأحمر وهدوء وثقة الأزرق، مما يعطيه طابعاً ملكياً وإبداعياً.',
    psychology_en: 'Purple symbolizes luxury, imagination, wisdom, and spirituality. It blends red\'s energy with blue\'s stability, giving a royal and creative vibe.',
    brand_tone_ar: 'ملهم، راقٍ، وغامض.',
    brand_tone_en: 'Inspiring, premium, and mysterious.',
    recommended_industries_ar: ['الكوتشينج والتطوير الذاتي', 'منتجات التجميل الفاخرة', 'الوكالات الإبداعية'],
    recommended_industries_en: ['Life Coaching', 'Luxury Beauty', 'Creative Agencies'],
    font_pairings_ar: 'Tajawal + Aref Ruqaa',
    font_pairings_en: 'Playfair Display + Lato',
    dos_and_donts_ar: '✅ افعل: ادمجه مع الذهبي أو الفضي لإعطاء طابع الفخامة المطلقة.\n❌ تجنب: استخدامه لعلامات تجارية تبيع منتجات رخيصة أو استهلاكية سريعة.',
    dos_and_donts_en: '✅ Do: Pair it with gold or silver for an ultimate luxury feel.\n❌ Don\'t: Use it for discount brands or fast-moving consumer goods.'
  },
  {
    id: 'green',
    psychology_ar: 'الأخضر لون الطبيعة، الصحة، النمو، والثروة. يبعث على الراحة النفسية، الاسترخاء، ويشير إلى الأمان والنجاح المالي.',
    psychology_en: 'Green is the color of nature, health, growth, and wealth. It promotes psychological comfort, relaxation, and indicates safety and financial success.',
    brand_tone_ar: 'عضوي، مطمئن، ومزدهر.',
    brand_tone_en: 'Organic, reassuring, and prosperous.',
    recommended_industries_ar: ['الصحة والعافية', 'المنتجات العضوية والطبيعية', 'الاستشارات المالية', 'البيئة'],
    recommended_industries_en: ['Health & Wellness', 'Organic Products', 'Financial Consulting', 'Eco-friendly'],
    font_pairings_ar: 'Almarai + Noto Sans Arabic',
    font_pairings_en: 'Lora + Open Sans',
    dos_and_donts_ar: '✅ افعل: استخدمه للإشارة للنمو المالي أو المنتجات الطبيعية.\n❌ تجنب: استخدامه مع الألوان الفاقعة جداً التي تكسر هدوءه الطبيعي.',
    dos_and_donts_en: '✅ Do: Use it to indicate financial growth or natural products.\n❌ Don\'t: Pair it with overly loud colors that break its natural calmness.'
  },
  {
    id: 'blue',
    psychology_ar: 'الأزرق هو ملك الألوان للشركات؛ يرمز للثقة، الأمان، الموثوقية، والاحترافية. هو اللون الأكثر أماناً لبناء ثقة طويلة الأمد.',
    psychology_en: 'Blue is the king of corporate colors; it symbolizes trust, security, reliability, and professionalism. It\'s the safest color to build long-term trust.',
    brand_tone_ar: 'احترافي، جدير بالثقة، وواضح.',
    brand_tone_en: 'Professional, trustworthy, and clear.',
    recommended_industries_ar: ['الشركات (B2B)', 'التأمين والصحة', 'العقارات', 'الاستشارات والمحاماة'],
    recommended_industries_en: ['Corporate (B2B)', 'Insurance & Health', 'Real Estate', 'Legal & Consulting'],
    font_pairings_ar: 'Cairo + Readex Pro',
    font_pairings_en: 'Montserrat + Roboto',
    dos_and_donts_ar: '✅ افعل: استخدم الأزرق الداكن للثقة المؤسسية، والفاتح للابتكار.\n❌ تجنب: استخدامه في مجال الطعام أو المطاعم (لأنه يقلل الشهية).',
    dos_and_donts_en: '✅ Do: Use dark blue for corporate trust, and light blue for tech innovation.\n❌ Don\'t: Use it in food or restaurant industries (it suppresses appetite).'
  },
  {
    id: 'gold',
    psychology_ar: 'الذهبي يعبر عن الثراء، الانتصار، القيمة العالية، والجودة الاستثنائية. لون النخبة الذي لا يقبل المساومة.',
    psychology_en: 'Gold expresses wealth, victory, high value, and exceptional quality. The elite color that accepts no compromises.',
    brand_tone_ar: 'حصري، فاخر، ولا مثيل له.',
    brand_tone_en: 'Exclusive, luxurious, and unparalleled.',
    recommended_industries_ar: ['العقارات الفاخرة', 'المجوهرات والساعات', 'الخدمات الممتازة (VIP)'],
    recommended_industries_en: ['Luxury Real Estate', 'Jewelry & Watches', 'VIP Services'],
    font_pairings_ar: 'Amiri + Changa',
    font_pairings_en: 'Cinzel + Proxima Nova',
    dos_and_donts_ar: '✅ افعل: استخدمه كـ (Accent) مع الأسود الكاحل لأقصى درجات الفخامة.\n❌ تجنب: استخدامه كلون خلفية رئيسي لأنه يبدو مزعجاً وغير مريح.',
    dos_and_donts_en: '✅ Do: Use it as an accent with deep black for maximum luxury.\n❌ Don\'t: Use it as a main background color as it can look garish and uncomfortable.'
  },
  {
    id: 'orange',
    psychology_ar: 'البرتقالي يجمع بين طاقة الأحمر وسعادة الأصفر. هو لون المغامرة، الحماس، الإبداع، والدعوة المباشرة للعمل (CTA).',
    psychology_en: 'Orange combines the energy of red and the happiness of yellow. It\'s the color of adventure, enthusiasm, creativity, and direct Call-To-Action (CTA).',
    brand_tone_ar: 'ودود، نشيط، ومحفز.',
    brand_tone_en: 'Friendly, energetic, and motivating.',
    recommended_industries_ar: ['التجارة الإلكترونية', 'الرياضة واللياقة', 'الطعام والوجبات السريعة', 'التوصيل'],
    recommended_industries_en: ['E-Commerce', 'Fitness', 'Food & Fast Food', 'Delivery Services'],
    font_pairings_ar: 'Lalezar + Tajawal',
    font_pairings_en: 'Oswald + Roboto',
    dos_and_donts_ar: '✅ افعل: استخدمه في أزرار "اشترِ الآن" (CTA) لأنه يجذب العين ويحفز النقر.\n❌ تجنب: استخدامه للعلامات التجارية التي تتسم بالجدية المفرطة أو الفخامة الهادئة.',
    dos_and_donts_en: '✅ Do: Use it in "Buy Now" (CTA) buttons because it draws the eye and encourages clicks.\n❌ Don\'t: Use it for brands that are overly serious or quietly luxurious.'
  },
  {
    id: 'teal',
    psychology_ar: 'تيل (الأزرق المخضر) يجمع بين احترافية الأزرق ونمو الأخضر. يعكس الوضوح الفكري، التوازن، والتواصل الفعّال.',
    psychology_en: 'Teal combines the professionalism of blue and the growth of green. It reflects mental clarity, balance, and effective communication.',
    brand_tone_ar: 'متوازن، هادئ، وعصري.',
    brand_tone_en: 'Balanced, calm, and modern.',
    recommended_industries_ar: ['التعليم الأونلاين', 'العيادات الطبية', 'التكنولوجيا النظيفة'],
    recommended_industries_en: ['Online Education', 'Medical Clinics', 'Clean Tech'],
    font_pairings_ar: 'Rubik + IBM Plex Sans Arabic',
    font_pairings_en: 'Poppins + Nunito',
    dos_and_donts_ar: '✅ افعل: استخدمه للمنصات التي تعتمد على التركيز وصفاء الذهن.\n❌ تجنب: خلطه مع ألوان دافئة قوية (كالأحمر) بطريقة متساوية.',
    dos_and_donts_en: '✅ Do: Use it for platforms that rely on focus and mental clarity.\n❌ Don\'t: Mix it equally with strong warm colors (like red).'
  },
  {
    id: 'slate',
    psychology_ar: 'اللون الرمادي المزرق (Slate) يعكس الحيادية، التطور التقني، والعملية. هو لون التصميمات الحديثة النظيفة.',
    psychology_en: 'Slate (blue-gray) reflects neutrality, technical sophistication, and practicality. It\'s the color of modern, clean designs.',
    brand_tone_ar: 'حيادي، ذكي، وبسيط (Minimalist).',
    brand_tone_en: 'Neutral, smart, and minimalist.',
    recommended_industries_ar: ['تصميم الجرافيك والـ UI/UX', 'وكالات التسويق', 'برامج الإنتاجية'],
    recommended_industries_en: ['Graphic Design & UI/UX', 'Marketing Agencies', 'Productivity Software'],
    font_pairings_ar: 'Alexandria + Cairo',
    font_pairings_en: 'Outfit + Inter',
    dos_and_donts_ar: '✅ افعل: استخدمه كأساس قوي لعلامة تجارية تعتمد على البساطة (Minimalism).\n❌ تجنب: جعله اللون الوحيد في الهوية لكي لا تبدو العلامة التجارية باهتة أو مملة.',
    dos_and_donts_en: '✅ Do: Use it as a solid foundation for a minimalist brand.\n❌ Don\'t: Make it the ONLY color in the identity so the brand doesn\'t look dull or boring.'
  },
  {
    id: 'red',
    psychology_ar: 'الأحمر هو لون الشغف، الخطر، القوة، والطاقة العالية جداً. يزيد من نبضات القلب ويعتبر أقوى لون للفت الانتباه وتحفيز الشهية.',
    psychology_en: 'Red is the color of passion, danger, power, and extreme high energy. It increases heart rate and is the strongest color for grabbing attention and stimulating appetite.',
    brand_tone_ar: 'عاطفي، قوي، ولافت.',
    brand_tone_en: 'Passionate, powerful, and striking.',
    recommended_industries_ar: ['الطعام والمطاعم', 'الأخبار والإعلام', 'السيارات', 'التسوق والتخفيضات'],
    recommended_industries_en: ['Food & Restaurants', 'News & Media', 'Automotive', 'Shopping & Sales'],
    font_pairings_ar: 'Almarai + Changa',
    font_pairings_en: 'Bebas Neue + Roboto',
    dos_and_donts_ar: '✅ افعل: استخدمه بذكاء لتسليط الضوء على خصومات أو أزرار هامة جداً.\n❌ تجنب: الإفراط فيه لأنه قد يوحي بالخطر أو الخطأ أو العدوانية.',
    dos_and_donts_en: '✅ Do: Use it smartly to highlight discounts or very important buttons.\n❌ Don\'t: Overuse it as it can imply danger, error, or aggression.'
  },
  {
    id: 'yellow',
    psychology_ar: 'الأصفر يرمز للشمس، السعادة، التفاؤل، والوضوح. هو لون يجذب العين أسرع من أي لون آخر.',
    psychology_en: 'Yellow symbolizes the sun, happiness, optimism, and clarity. It catches the eye faster than any other color.',
    brand_tone_ar: 'متفائل، مرح، وشبابي.',
    brand_tone_en: 'Optimistic, cheerful, and youthful.',
    recommended_industries_ar: ['خدمات التوصيل', 'ألعاب الأطفال', 'الرحلات والسفر', 'الخدمات اللوجستية'],
    recommended_industries_en: ['Delivery Services', 'Kids Toys', 'Travel & Tourism', 'Logistics'],
    font_pairings_ar: 'Zain + Tajawal',
    font_pairings_en: 'Nunito + Open Sans',
    dos_and_donts_ar: '✅ افعل: استخدمه كلون للعلامة التجارية لتبدو ودودة ومشرقة.\n❌ تجنب: كتابة النصوص باللون الأصفر على خلفية بيضاء لأنه سيكون مستحيلاً للقراءة.',
    dos_and_donts_en: '✅ Do: Use it as a brand color to look friendly and bright.\n❌ Don\'t: Write text in yellow on a white background as it will be impossible to read.'
  },
  {
    id: 'mint',
    psychology_ar: 'النعناعي (Mint) يوفر إحساساً بالانتعاش، النظافة، الحداثة، والتجدد. لون خفيف ولطيف جداً على العين.',
    psychology_en: 'Mint provides a sense of freshness, cleanliness, modernity, and renewal. It\'s a light and very soothing color to the eye.',
    brand_tone_ar: 'منعش، لطيف، وعصري.',
    brand_tone_en: 'Fresh, gentle, and modern.',
    recommended_industries_ar: ['العناية الشخصية', 'عيادات التجميل والأسنان', 'التجارة الإلكترونية للملابس الصيفية'],
    recommended_industries_en: ['Personal Care', 'Beauty & Dental Clinics', 'Summer Fashion E-commerce'],
    font_pairings_ar: 'Harmattan + Cairo',
    font_pairings_en: 'Quicksand + Lato',
    dos_and_donts_ar: '✅ افعل: استخدمه لخلق جو من النظافة والهدوء والانتعاش.\n❌ تجنب: استخدامه في مجالات جادة جداً كالمحاماة أو البنوك.',
    dos_and_donts_en: '✅ Do: Use it to create an atmosphere of cleanliness, calm, and freshness.\n❌ Don\'t: Use it in very serious industries like law or banking.'
  },
  {
    id: 'pink',
    psychology_ar: 'الوردي يعكس الأنوثة، الرعاية، اللطف، والرومانسية. وفي درجاته الفاقعة (مثل Magenta) يعكس الجرأة والتمرد.',
    psychology_en: 'Pink reflects femininity, care, kindness, and romance. In its vibrant shades (like Magenta), it reflects boldness and rebellion.',
    brand_tone_ar: 'حنون، أنثوي، أو جريء (حسب الدرجة).',
    brand_tone_en: 'Affectionate, feminine, or bold (depending on shade).',
    recommended_industries_ar: ['مستحضرات التجميل', 'الأزياء النسائية', 'المخبوزات والحلويات', 'منتجات الأطفال'],
    recommended_industries_en: ['Cosmetics', 'Women\'s Fashion', 'Bakery & Sweets', 'Baby Products'],
    font_pairings_ar: 'Lemonada + Readex Pro',
    font_pairings_en: 'Pacifico + Montserrat',
    dos_and_donts_ar: '✅ افعل: استخدم الدرجات الهادئة للرعاية، والدرجات الفاقعة لاستهداف المراهقين والشباب.\n❌ تجنب: استخدامه إذا كان جمهورك المستهدف الأساسي من الرجال.',
    dos_and_donts_en: '✅ Do: Use soft shades for care, and bright shades for targeting teens and youth.\n❌ Don\'t: Use it if your primary target audience is male.'
  }
];

// ─── CONTENT PLANS ──────────────────────────────────────────────────────────
const CONTENT_COL = 'tc_content_plans';

const contentPlansData = [
  {
    id: 'ecom_instagram_video',
    posts: [
      {
        title_ar: 'فيديو ما وراء الكواليس (تجهيز الطلبات)',
        title_en: 'Behind The Scenes (Packing Orders)',
        caption_ar: 'شاهدوا كيف نجهز طلباتكم بحب! شكراً لثقتكم بنا ❤️ #تجهيز_الطلبات #متجرنا',
        caption_en: 'Watch how we pack your orders with love! Thanks for your trust ❤️ #PackingOrders #OurStore'
      },
      {
        title_ar: 'تحدي تريند سريع بمنتجك',
        title_en: 'Quick Trend Challenge with your product',
        caption_ar: 'منتجنا يواكب التريند! إيه رأيكم؟ 🔥 #تريند #موضة',
        caption_en: 'Our product keeps up with the trend! What do you think? 🔥 #Trend #Fashion'
      }
    ],
    hooks: [
      { ar: 'مش هتصدق اللي حصل لما جربت المنتج ده...', en: 'You won\'t believe what happened when I tried this product...' },
      { ar: 'سر صغير هيغير طريقتك في...', en: 'A little secret that will change how you...' }
    ]
  },
  {
    id: 'digital_marketing_linkedin_text',
    posts: [
      {
        title_ar: 'قصة فشل وكيف تجاوزناها',
        title_en: 'A Failure Story & How We Overcame It',
        caption_ar: 'خسرنا 50% من ميزانية الإعلان في يومين، وهذا ما تعلمناه...\n\nالدرس الأول: الاختبار المستمر أهم من التوقعات.',
        caption_en: 'We lost 50% of the ad budget in two days, here is what we learned...\n\nLesson one: Continuous testing is more important than assumptions.'
      }
    ],
    hooks: [
      { ar: 'التسويق لم يعد كما كان...', en: 'Marketing is no longer the same...' }
    ]
  }
];

// ─── MARKETING PLANS ────────────────────────────────────────────────────────
const MARKETING_COL = 'tc_marketing_plans';

const marketingPlansData = [
  {
    id: 'ecom_starter',
    niche: 'ecom', budgetTier: 'starter',
    plan_ar: `## 🚀 خطة التسويق: البداية (Starter) للتجارة الإلكترونية

**الميزانية:** منخفضة ($100 - $300)
**الهدف:** التحقق من السوق (Proof of Concept) وجلب أول 5-10 مبيعات

**الاستراتيجية:**
1. **المحتوى العضوي (Organic TikTok/Reels):**
   - نشر 2-3 فيديوهات يومياً.
   - التركيز على مشكلة العميل وكيف يحلها المنتج.
2. **الإعلانات المدفوعة (Testing):**
   - تخصيص 70% من الميزانية للإعلانات على منصة واحدة (يفضل TikTok أو Meta).
   - اختبار 3 تصميمات إعلانية مختلفة بميزانية يومية $10-$20.
3. **التأثير (Micro-Influencers):**
   - التعاون مع 2-3 مؤثرين صغار مقابل المنتج (Barter Deal).

**نصيحة ذهبية:** لا تركز على الأرباح الآن، ركز على جمع البيانات ومعرفة "ما الذي يجعل العميل ينقر".`,
    plan_en: `## 🚀 Marketing Plan: Starter for E-Commerce

**Budget:** Low ($100 - $300)
**Goal:** Market Validation (Proof of Concept) and first 5-10 sales

**Strategy:**
1. **Organic Content (TikTok/Reels):**
   - Post 2-3 videos daily.
   - Focus on the customer's problem and how the product solves it.
2. **Paid Ads (Testing):**
   - Allocate 70% of budget to ads on one platform (preferably TikTok or Meta).
   - Test 3 different ad creatives with $10-$20 daily budget.
3. **Influence (Micro-Influencers):**
   - Collaborate with 2-3 micro-influencers in exchange for the product (Barter Deal).

**Golden Tip:** Don't focus on profits now, focus on gathering data and knowing "what makes the customer click".`
  }
];

export const seedMiscData = async () => {
  console.log('🌱 Seeding brand names...');
  for (const item of brandNamesData) {
    const { id, ...data } = item;
    await setDoc(doc(db, BRAND_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }

  console.log('🌱 Seeding color analysis...');
  for (const item of colorAnalysisData) {
    const { id, ...data } = item;
    await setDoc(doc(db, COLOR_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }

  console.log('🌱 Seeding content plans...');
  for (const item of contentPlansData) {
    const { id, ...data } = item;
    await setDoc(doc(db, CONTENT_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }

  console.log('🌱 Seeding marketing plans...');
  for (const item of marketingPlansData) {
    const { id, ...data } = item;
    await setDoc(doc(db, MARKETING_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }
};

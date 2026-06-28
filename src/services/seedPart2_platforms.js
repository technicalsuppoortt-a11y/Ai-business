// seedPart2_platforms.js — Platform Strategies + Proposals + Bio Templates
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// ─── PLATFORM STRATEGIES ────────────────────────────────────────────────────
const PLATFORM_COL = 'tc_platform_strategies';

const platformStrategiesData = [
  {
    id: 'upwork_general',
    platform: 'upwork', platformName: 'Upwork',
    conquest_plan_ar: `## 🚀 خطة اختراق Upwork

**المرحلة 1: الإعداد (أسبوع 1-2)**
- أكمل الملف الشخصي 100% — الخوارزمية تُكافئ الملفات الكاملة
- اكتب Bio بلغة العميل (فوائد، ليس مهارات)
- ارفع 3-5 نماذج عمل قوية مع نتائج حقيقية

**المرحلة 2: الاختراق (أسبوع 3-6)**
- أرسل 5 عروض يومياً على وظائف تطابق مهاراتك بدقة 80%+
- استهدف وظائف بأقل من 20 عرضاً (منافسة أقل)
- أول 3 عملاء: اقبل بسعر أقل مقابل تقييم ⭐⭐⭐⭐⭐

**المرحلة 3: النمو (شهر 2-3)**
- رفع السعر 20-30% بعد أول 5 تقييمات
- استهداف Job Invitations فقط
- التخصص في نيتش واحد يرفع معدل القبول 3X`,

    conquest_plan_en: `## 🚀 Upwork Conquest Plan

**Phase 1: Setup (Week 1-2)**
- Complete profile 100% — the algorithm rewards complete profiles
- Write Bio in client language (benefits, not skills)
- Upload 3-5 strong portfolio pieces with real results

**Phase 2: Breakthrough (Week 3-6)**
- Send 5 proposals daily on jobs matching your skills 80%+
- Target jobs with less than 20 proposals (less competition)
- First 3 clients: accept lower rate in exchange for ⭐⭐⭐⭐⭐ review

**Phase 3: Growth (Month 2-3)**
- Raise rates 20-30% after first 5 reviews
- Target Job Invitations only
- Specializing in one niche increases acceptance rate 3X`,

    golden_tip_ar: 'العروض القصيرة (150-200 كلمة) تُحقق معدل قبول أعلى من العروض الطويلة.',
    golden_tip_en: 'Short proposals (150-200 words) achieve higher acceptance rates than long ones.',
    commission: '20% (drops to 10% after $500 earned with client)',
    successRate: '⭐⭐⭐⭐',
    difficulty: 'متوسط',
    bestFor_ar: 'مستقلون محترفون يتحدثون إنجليزية',
  },
  {
    id: 'fiverr_general',
    platform: 'fiverr', platformName: 'Fiverr',
    conquest_plan_ar: `## 🚀 خطة اختراق Fiverr

**المرحلة 1: بناء الـ Gig المثالي**
- اكتب عنواناً يتضمن الكيوورد الأساسي (ما يبحث عنه العميل)
- الصورة المصغرة (Thumbnail) = 60% من قرار النقر
- ابدأ بـ 3 Gigs في نفس التخصص لاختبار ما يُحقق مبيعات

**المرحلة 2: المبيعات الأولى**
- سعر بداية منخفض ($5-$15) لجذب أول 10 طلبات
- الرد خلال ساعة يرفع ترتيبك في الخوارزمية
- اطلب Review بعد كل طلب مكتمل

**المرحلة 3: الارتفاع**
- بعد 20 تقييم: ارفع السعر 2-3X
- أضف Gig Extras لرفع متوسط قيمة الطلب
- Fiverr Pro: احترافية بمستوى أعلى وأسعار أعلى`,

    conquest_plan_en: `## 🚀 Fiverr Conquest Plan

**Phase 1: Build the Perfect Gig**
- Write a title containing your main keyword (what client searches for)
- Thumbnail = 60% of the click decision
- Start with 3 Gigs in the same specialty to test what sells

**Phase 2: First Sales**
- Low starting price ($5-$15) to attract first 10 orders
- Reply within 1 hour boosts your algorithm ranking
- Request review after every completed order

**Phase 3: Rise**
- After 20 reviews: raise price 2-3X
- Add Gig Extras to increase average order value
- Fiverr Pro: higher professionalism, higher prices`,

    golden_tip_ar: 'الـ Thumbnail هو أهم عنصر في Gig — استثمر في تصميم احترافي.',
    golden_tip_en: 'The Thumbnail is the most important Gig element — invest in a professional design.',
    commission: '20%',
    successRate: '⭐⭐⭐⭐⭐',
    difficulty: 'سهل للبداية',
    bestFor_ar: 'خدمات قابلة للتحزيم (Packaged Services)',
  },
  {
    id: 'khamsat_general',
    platform: 'khamsat', platformName: 'خمسات',
    conquest_plan_ar: `## 🚀 خطة اختراق خمسات

**المرحلة 1: بناء الملف**
- صورة شخصية احترافية ووصف واضح للخدمات
- ابدأ بـ 5 خدمات متنوعة في تخصصك
- الصور احترافية = ميزة تنافسية كبيرة في خمسات

**المرحلة 2: التقييمات الأولى**
- قدم خدمة بـ 5$ مبدئياً لجذب طلبات سريعة
- التسليم قبل الموعد المحدد = تقييم ممتاز
- تواصل مع العملاء باستمرار أثناء التنفيذ

**المرحلة 3: الاحتراف**
- بعد 20 تقييم: ارفع السعر تدريجياً
- أضف تطويرات (خدمات إضافية) لكل خدمة
- خمسات Plus: للمستقلين المحترفين`,

    conquest_plan_en: `## 🚀 Khamsat (خمسات) Conquest Plan

**Phase 1: Build Profile**
- Professional photo and clear service descriptions
- Start with 5 varied services in your specialty
- Professional images = big competitive advantage on Khamsat

**Phase 2: First Reviews**
- Offer service at $5 initially to attract quick orders
- Deliver before deadline = excellent review
- Communicate consistently with clients during execution

**Phase 3: Professionalism**
- After 20 reviews: raise price gradually
- Add upgrades (extras) to each service
- Khamsat Plus: for professional freelancers`,

    golden_tip_ar: 'العميل العربي يقرأ الوصف بالكامل — اجعل خدماتك واضحة ومفصّلة.',
    golden_tip_en: 'Arab clients read the full description — make your services clear and detailed.',
    commission: '20%',
    successRate: '⭐⭐⭐⭐',
    difficulty: 'سهل (السوق عربي)',
    bestFor_ar: 'خدمات باللغة العربية والسوق العربي',
  },
  {
    id: 'mostaql_general',
    platform: 'mostaql', platformName: 'مستقل',
    conquest_plan_ar: `## 🚀 خطة اختراق مستقل.com

**الميزة:** يمكنك أنت أن تتقدم للمشاريع (بدلاً من الانتظار).

**المرحلة 1: الملف القوي**
- أكمل ملفك الشخصي 100% بمعرض أعمال قوي
- احصل على "موثّق" — يرفع مصداقيتك فوراً

**المرحلة 2: التقديم الذكي**
- قدّم على مشاريع في تخصصك الدقيق فقط
- اكتب عرضاً مخصصاً يُثبت أنك قرأت المشروع
- أرسل نموذج عمل مشابه في نفس التقديم

**المرحلة 3: بناء السمعة**
- التسليم في الوقت = التقييم الذهبي
- اطلب من العميل الراضي الإحالة لآخرين`,

    conquest_plan_en: `## 🚀 Mostaql (مستقل) Conquest Plan

**Advantage:** You can bid on projects (instead of waiting).

**Phase 1: Strong Profile**
- Complete profile 100% with strong portfolio
- Get "Verified" status — instantly boosts credibility

**Phase 2: Smart Bidding**
- Bid only on projects matching your exact specialty
- Write a custom proposal proving you read the project
- Send a similar work sample in the same proposal

**Phase 3: Build Reputation**
- On-time delivery = golden review
- Ask satisfied clients to refer others`,

    golden_tip_ar: 'العرض المخصص الذي يُثبت فهم المشروع يفوز دائماً على العرض الأرخص.',
    golden_tip_en: 'A custom proposal proving project understanding always beats the cheapest bid.',
    commission: '15%',
    successRate: '⭐⭐⭐⭐',
    difficulty: 'متوسط',
    bestFor_ar: 'مشاريع طويلة المدى والتقني والإبداعي',
  },
];

// ─── PROPOSAL TEMPLATES ─────────────────────────────────────────────────────
const PROPOSAL_COL = 'tc_proposal_templates';

const proposalTemplatesData = [
  {
    id: 'graphic_design_professional_individual',
    niche: 'graphic_design', tone: 'professional', clientType: 'individual',
    template_ar: `مرحباً {clientName}،

لاحظت أن مشروعك يحتاج إلى {projectNeed}، وهذا بالضبط ما أتخصص فيه.

في السنوات {yearsExperience} الماضية، ساعدت عملاء في {niche} على {mainResult}. آخر مشروع مشابه أنجزته كان لـ {similarClient}، وقد حقق {specificResult}.

**ما ستحصل عليه:**
- {deliverable1}
- {deliverable2}
- {deliverable3}

**الجدول الزمني:** {timeline}
**الاستثمار:** {price}

هل لديك 15 دقيقة لمناقشة التفاصيل؟

مع التقدير،
{yourName}`,

    template_en: `Hi {clientName},

I noticed your project requires {projectNeed}, which is exactly my specialty.

Over the past {yearsExperience} years, I've helped clients in {niche} achieve {mainResult}. My last similar project was for {similarClient}, which resulted in {specificResult}.

**What you'll receive:**
- {deliverable1}
- {deliverable2}
- {deliverable3}

**Timeline:** {timeline}
**Investment:** {price}

Do you have 15 minutes to discuss the details?

Best regards,
{yourName}`,

    fields: ['clientName', 'projectNeed', 'yearsExperience', 'niche', 'mainResult', 'similarClient', 'specificResult', 'deliverable1', 'deliverable2', 'deliverable3', 'timeline', 'price', 'yourName'],
    tip_ar: 'اذكر رقماً محدداً من تجربتك السابقة — الأرقام تبني الثقة أكثر من الكلام.',
  },
  {
    id: 'digital_marketing_confident_startup',
    niche: 'digital_marketing', tone: 'confident', clientType: 'startup',
    template_ar: `مرحباً {clientName}،

شركتكم الناشئة في {niche} تمتلك منتجاً قوياً — المشكلة ليست في المنتج، بل في الوصول للعميل الصح.

هذا بالضبط ما أحله.

في آخر 6 أشهر، ساعدت {numberOfClients} شركة ناشئة على تحقيق {averageResult} من الإعلانات الرقمية.

**الخطة للشهر الأول:**
1. تدقيق إعلاني كامل (الأسبوع الأول)
2. اختبار 3 Creatives مختلفة (الأسبوع الثاني)
3. تحسين وضخ الميزانية على الفائز (الأسبوع 3-4)

**الاستثمار:** {price}/شهر + ميزانية الإعلانات
**ضمان:** إذا لم تصل لـ {kpi} في 30 يوماً، الشهر الثاني مجاناً.

متى يناسبك نتحدث؟`,

    template_en: `Hi {clientName},

Your startup in {niche} has a strong product — the problem isn't the product, it's reaching the right customer.

That's exactly what I solve.

In the last 6 months, I helped {numberOfClients} startups achieve {averageResult} from digital advertising.

**Month 1 Plan:**
1. Full ad audit (Week 1)
2. Test 3 different Creatives (Week 2)
3. Optimize and scale budget on winner (Week 3-4)

**Investment:** {price}/month + ad budget
**Guarantee:** If we don't reach {kpi} in 30 days, month 2 is free.

When can we talk?`,

    fields: ['clientName', 'niche', 'numberOfClients', 'averageResult', 'price', 'kpi'],
    tip_ar: 'الـ Guarantee يُزيل الخوف من المخاطرة ويُسرّع القرار.',
  },
  {
    id: 'saas_consultative_corporate',
    niche: 'saas', tone: 'consultative', clientType: 'corporate',
    template_ar: `مرحباً {clientName}،

بعد قراءة متطلبات مشروعكم، لديّ بعض الأسئلة قبل أن أقترح حلاً:

1. هل تحاولون أتمتة عملية {processName} الحالية أم بناء شيء من الصفر؟
2. كم عدد المستخدمين الذين سيستخدمون الحل؟
3. ما هو الجدول الزمني المثالي لكم؟

السبب في أنني أسأل: سبق أن طوّرت حلاً مشابهاً لـ {similarCompany}، وكانت أهم درس تعلمناه أن {lessonLearned}.

بناءً على إجاباتكم، يمكنني تقديم خطة تنفيذ دقيقة مع تقدير واقعي للتكلفة والوقت.

هل يمكنني حجز 20 دقيقة لمناقشة هذا؟`,

    template_en: `Hi {clientName},

After reading your project requirements, I have some questions before proposing a solution:

1. Are you trying to automate your current {processName} process or build from scratch?
2. How many users will use the solution?
3. What is your ideal timeline?

The reason I ask: I previously developed a similar solution for {similarCompany}, and the most important lesson we learned was {lessonLearned}.

Based on your answers, I can provide a precise implementation plan with realistic cost and time estimates.

Can I book 20 minutes to discuss this?`,

    fields: ['clientName', 'processName', 'similarCompany', 'lessonLearned'],
    tip_ar: 'طرح الأسئلة يُظهرك كمستشار لا كمنفذ — هذا يبرر أسعاراً أعلى.',
  },
];

// ─── BIO TEMPLATES ──────────────────────────────────────────────────────────
const BIO_COL = 'tc_bio_templates';

const bioTemplatesData = [
  {
    id: 'graphic_design_intermediate',
    niche: 'graphic_design', experience: 'intermediate',
    bio_ar: `مصمم جرافيك متخصص في {niche} | أحوّل أفكار الشركات إلى هويات بصرية تبيع.

ساعدت {numberOfClients}+ عميل على بناء حضور بصري احترافي يميزهم في السوق.

ما أقدمه:
✦ هوية بصرية كاملة (لوجو + ألوان + خطوط)
✦ تصميم سوشيال ميديا شهري
✦ مواد تسويقية احترافية

التسليم: خلال {turnaround} مع مراجعات غير محدودة.
الضمان: {guarantee}

{callToAction}`,

    bio_en: `Graphic Designer specialized in {niche} | I turn business ideas into visual identities that sell.

Helped {numberOfClients}+ clients build a professional visual presence that stands out in the market.

What I offer:
✦ Complete visual identity (logo + colors + fonts)
✦ Monthly social media design
✦ Professional marketing materials

Delivery: Within {turnaround} with unlimited revisions.
Guarantee: {guarantee}

{callToAction}`,

    fields: ['niche', 'numberOfClients', 'turnaround', 'guarantee', 'callToAction'],
    tip_ar: 'اذكر تخصصك الدقيق — "مصمم" عام، "مصمم F&B" خبير.',
  },
  {
    id: 'digital_marketing_expert',
    niche: 'digital_marketing', experience: 'expert',
    bio_ar: `مسوّق رقمي متخصص في {niche} | أحوّل الإعلانات من تكلفة إلى استثمار.

خلفيتي: {yearsExperience} سنوات، {totalAdSpend}+ في ميزانيات إعلانية مُدارة، متوسط ROAS {averageROAS}X.

التخصص:
- Facebook & TikTok Ads (Lead Gen & E-Commerce)
- بناء Funnels تحويلية كاملة
- تحليل البيانات واتخاذ قرارات مبنية على الأرقام

لا أقبل أكثر من {maxClients} عملاء في نفس الوقت لضمان الجودة.

هل أنت جاهز لنتائج حقيقية؟`,

    bio_en: `Digital Marketer specialized in {niche} | I turn ads from cost to investment.

Background: {yearsExperience} years, {totalAdSpend}+ in managed ad budgets, average ROAS {averageROAS}X.

Specializations:
- Facebook & TikTok Ads (Lead Gen & E-Commerce)
- Building complete conversion funnels
- Data analysis and numbers-based decisions

I accept no more than {maxClients} clients at a time to ensure quality.

Ready for real results?`,

    fields: ['niche', 'yearsExperience', 'totalAdSpend', 'averageROAS', 'maxClients'],
    tip_ar: 'الأرقام المحددة في البايو تقنع أكثر من 10 صفحات وصف.',
  },
  {
    id: 'life_coaching_beginner',
    niche: 'life_coaching', experience: 'beginner',
    bio_ar: `كوتش تطوير ذاتي متخصص في {niche}.

أساعد {targetClient} على {mainTransformation} خلال {timeframe}.

قصتي: {personalStory}

الأسلوب: {methodology}

الخطوة التالية: {nextStep}`,

    bio_en: `Personal Development Coach specialized in {niche}.

I help {targetClient} to {mainTransformation} within {timeframe}.

My story: {personalStory}

Methodology: {methodology}

Next step: {nextStep}`,

    fields: ['niche', 'targetClient', 'mainTransformation', 'timeframe', 'personalStory', 'methodology', 'nextStep'],
    tip_ar: 'القصة الشخصية تبني ارتباطاً عاطفياً — اجعلها حقيقية وقصيرة.',
  },
];

export const seedPlatformStrategies = async () => {
  console.log('🌱 Seeding platform strategies...');
  for (const item of platformStrategiesData) {
    const { id, ...data } = item;
    await setDoc(doc(db, PLATFORM_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }
};

export const seedProposalTemplates = async () => {
  console.log('🌱 Seeding proposal templates...');
  for (const item of proposalTemplatesData) {
    const { id, ...data } = item;
    await setDoc(doc(db, PROPOSAL_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }
};

export const seedBioTemplates = async () => {
  console.log('🌱 Seeding bio templates...');
  for (const item of bioTemplatesData) {
    const { id, ...data } = item;
    await setDoc(doc(db, BIO_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }
};

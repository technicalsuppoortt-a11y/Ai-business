// seedPart3_sales.js — Sales Replies + Interview Questions + Content Plans + Ad Creatives
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// ─── SALES REPLIES ──────────────────────────────────────────────────────────
const SALES_COL = 'tc_sales_replies';

const salesRepliesData = [
  {
    id: 'discount_request_professional',
    situationId: 'discount_request', tone: 'professional',
    situation_ar: 'العميل يطلب خصم كبير',
    reply_ar: `شكراً لتواصلك معي {clientName}.

أُقدّر ثقتك، وأودّ أن أكون صريحاً معك:

سعري الحالي محسوب بدقة ليعكس جودة التسليم والوقت المُخصَّص لكل مشروع. تقليل السعر سيعني — بصراحة — تقليل جودة النتيجة، وهذا ما لا أريده لك.

ما يمكنني فعله بدلاً من ذلك:
✦ تقسيم المدفوعات على {installments} دفعات
✦ تقليل نطاق العمل ليناسب ميزانيتك ({reducedScope})

أي من الخيارين يناسبك أكثر؟`,

    reply_en: `Thank you for reaching out {clientName}.

I appreciate your trust, and I want to be straightforward with you:

My current pricing is precisely calculated to reflect delivery quality and time dedicated to each project. Reducing the price would — honestly — mean reducing the quality of results, which is not what I want for you.

What I can do instead:
✦ Split payments into {installments} installments
✦ Reduce scope to fit your budget ({reducedScope})

Which option works better for you?`,

    fields: ['clientName', 'installments', 'reducedScope'],
    tone_label_ar: 'احترافي وحازم',
    tip_ar: 'لا تنكسر أمام طلب الخصم — قدّم بدائل بدلاً من تخفيض السعر.',
  },
  {
    id: 'discount_request_friendly',
    situationId: 'discount_request', tone: 'friendly',
    situation_ar: 'العميل يطلب خصم كبير',
    reply_ar: `أهلاً {clientName} 😊

أفهم تماماً أن الميزانية مهمة، وأنا دايماً أحاول أساعد عملائي.

الحقيقة؟ سعري الحالي هو حد أدنى للجودة اللي أقدمها — لو نزلت أقل من كده مش هيكون العمل اللي تستاهله.

بس عندي فكرة 💡
لو قدرنا نُعدّل نطاق الشغل شوية، ممكن نوصل للرقم اللي في بالك. تقدر تقولي:
- إيه أهم جزء في المشروع بالنسبالك؟
- إيه اللي ممكن ينتظر مرحلة تانية؟

كده نبدأ بالأساسي دلوقتي وأكمل معاك الباقي لما الوقت يناسبك 🤝`,

    reply_en: `Hey {clientName} 😊

I totally understand budget matters, and I always try to help my clients.

The truth? My current price is the minimum for the quality I deliver — going lower wouldn't give you what you deserve.

But I have an idea 💡
If we can adjust the project scope a bit, we can reach your number. Can you tell me:
- What's the most important part of the project for you?
- What can wait for a later phase?

This way we start with the essentials now and I can complete the rest when timing works for you 🤝`,

    fields: ['clientName'],
    tone_label_ar: 'ودود ومتفهم',
    tip_ar: 'النبرة الودية تُحافظ على العلاقة بينما تحمي حقك في نفس الوقت.',
  },
  {
    id: 'out_of_scope_professional',
    situationId: 'out_of_scope', tone: 'professional',
    situation_ar: 'طلب تعديلات خارج الاتفاق',
    reply_ar: `مرحباً {clientName}،

أُقدّر ثقتك وأريد مساعدتك على الوصول للنتيجة المثلى.

بالنظر إلى طلبك الأخير، هذا الإضافة يتجاوز نطاق العمل المتفق عليه في العقد ({originalScope}).

يسعدني تنفيذ هذا الطلب الإضافي بـ {additionalCost} خلال {additionalTimeline}.

بدلاً من ذلك، يمكنك إدراجه في المرحلة التالية من التعاون.

ما رأيك؟`,

    reply_en: `Hi {clientName},

I appreciate your trust and want to help you reach the optimal result.

Looking at your latest request, this addition goes beyond the agreed project scope ({originalScope}).

I'd be happy to implement this additional request for {additionalCost} within {additionalTimeline}.

Alternatively, we can include it in the next phase of our collaboration.

What do you think?`,

    fields: ['clientName', 'originalScope', 'additionalCost', 'additionalTimeline'],
    tone_label_ar: 'احترافي وحازم',
    tip_ar: 'وثّق نطاق العمل دائماً قبل البدء — سيحميك من هذه المواقف.',
  },
  {
    id: 'price_increase_persuasive',
    situationId: 'price_increase', tone: 'persuasive',
    situation_ar: 'تبرير رفع الأسعار',
    reply_ar: `مرحباً {clientName}،

بعد تعاوننا لمدة {collaborationPeriod}، أودّ مشاركتك قرار مهم.

اعتباراً من {newStartDate}، سيتم تعديل أسعاري لتكون {newPrice} بدلاً من {oldPrice}.

لماذا؟
خلال الفترة الماضية، زادت مهاراتي في {skillSet}، وأصبح عملائي يحصلون على نتائج أفضل بمتوسط {resultImprovement}. هذه القيمة المضافة تستحق استثماراً أعلى.

كعميل أُقدّره، ستستمر بالسعر الحالي حتى {graceDate} — وأتطلع لمواصلة تحقيق نتائج استثنائية معاً.`,

    reply_en: `Hi {clientName},

After {collaborationPeriod} of working together, I'd like to share an important decision.

Starting {newStartDate}, my rates will be adjusted to {newPrice} from {oldPrice}.

Why?
Over this period, my skills in {skillSet} have grown significantly, and my clients are now achieving {resultImprovement} better results on average. This added value warrants a higher investment.

As a valued client, you'll continue at the current rate until {graceDate} — and I look forward to continuing to deliver exceptional results together.`,

    fields: ['clientName', 'collaborationPeriod', 'newStartDate', 'newPrice', 'oldPrice', 'skillSet', 'resultImprovement', 'graceDate'],
    tone_label_ar: 'مقنع وبيعي',
    tip_ar: 'ارفع أسعارك كل 6-12 شهر — هذا ليس جشعاً، هذا نمو مهني.',
  },
  {
    id: 'slow_client_professional',
    situationId: 'slow_response', tone: 'professional',
    situation_ar: 'العميل تأخر في الرد',
    reply_ar: `مرحباً {clientName}،

أتمنى أن تكون بخير.

أودّ التذكير بأن المشروع في انتظار موافقتك على {pendingItem} منذ {daysPending} أيام.

للحفاظ على الجدول الزمني المتفق عليه والتسليم في {deliveryDate}، أحتاج ردك خلال {responseDeadline}.

في حال تأخر الرد لأكثر من {maxDelay}، سيكون من الضروري تعديل الجدول الزمني وقد يترتب عليه تكاليف إضافية.

أنا متاح لأي استفسار في أي وقت.`,

    reply_en: `Hi {clientName},

Hope you're doing well.

I'd like to remind you that the project is waiting for your approval on {pendingItem} for {daysPending} days.

To maintain the agreed timeline and deliver on {deliveryDate}, I need your response within {responseDeadline}.

If response is delayed beyond {maxDelay}, it will be necessary to adjust the timeline and may incur additional costs.

I'm available for any questions at any time.`,

    fields: ['clientName', 'pendingItem', 'daysPending', 'deliveryDate', 'responseDeadline', 'maxDelay'],
    tone_label_ar: 'احترافي وحازم',
    tip_ar: 'حدّد مواعيد نهائية واضحة للردود في العقد لتجنب هذه المواقف.',
  },
];

// ─── INTERVIEW QUESTIONS ─────────────────────────────────────────────────────
const INTERVIEW_COL = 'tc_interview_questions';

const interviewQuestionsData = [
  {
    id: 'startup_general',
    clientType: 'startup',
    questions_ar: [
      {
        q: 'ما هي المشكلة الأساسية التي تحاول حلها، وكيف تتحقق أن هذه المشكلة حقيقية للعميل؟',
        why_ar: 'يكشف مدى وضوح رؤيتهم ونضج التفكير. المؤسس الذي لا يعرف الإجابة يعطيك إشارة خطر.',
      },
      {
        q: 'من هو عميلكم المستهدف بالتحديد، وهل تحدثتم مع 10+ منهم قبل البدء؟',
        why_ar: 'يكشف إذا كانوا يبنون على افتراضات أم على بيانات حقيقية.',
      },
      {
        q: 'ما ميزانيتكم المخصصة لهذا المشروع، وكيف تقيسون النجاح؟',
        why_ar: 'يكشف الميزانية الحقيقية ومعيار القبول — الأهم في أي مفاوضة.',
      },
      {
        q: 'ما هو جدولكم الزمني الحقيقي، وما الذي سيحدث لو تأخرتم 2-3 أسابيع؟',
        why_ar: 'يكشف مدى إلحاح المشروع والضغط الذي ستواجهه.',
      },
      {
        q: 'من صاحب القرار النهائي في الموافقة على التسليمات؟',
        why_ar: 'يوفّر عليك التعامل مع "كومات" من المراجعات من أشخاص مختلفين.',
      },
    ],
    questions_en: [
      {
        q: 'What is the core problem you\'re trying to solve, and how do you validate this problem is real for customers?',
        why_en: 'Reveals clarity of vision and thinking maturity. A founder who doesn\'t know the answer gives you a red flag.',
      },
      {
        q: 'Who exactly is your target customer, and have you talked to 10+ of them before starting?',
        why_en: 'Reveals if they\'re building on assumptions or real data.',
      },
      {
        q: 'What is your budget for this project, and how do you measure success?',
        why_en: 'Reveals the real budget and acceptance criteria — most important in any negotiation.',
      },
      {
        q: 'What\'s your real timeline, and what happens if you\'re delayed 2-3 weeks?',
        why_en: 'Reveals project urgency and pressure you\'ll face.',
      },
      {
        q: 'Who is the final decision maker for approving deliverables?',
        why_en: 'Saves you from dealing with endless revisions from multiple people.',
      },
    ],
  },
  {
    id: 'corporate_general',
    clientType: 'corporate',
    questions_ar: [
      {
        q: 'ما هي عملية الموافقة الداخلية على الإبداعات والتسليمات، وكم تستغرق؟',
        why_ar: 'الشركات الكبيرة = بيروقراطية. اعرف الوقت الحقيقي قبل الوعد بمواعيد.',
      },
      {
        q: 'هل سبق أن عملتم مع مستقل قبلاً، وما الذي نجح أو فشل في تلك التجربة؟',
        why_ar: 'يكشف التوقعات المسبقة ونقاط الألم التي يجب تجنبها.',
      },
      {
        q: 'من هو نقطة التواصل الأساسية، وما صلاحياته في اتخاذ القرار؟',
        why_ar: 'يحدد من تتعامل معه فعلاً ومدى سلطته.',
      },
      {
        q: 'هل هناك إرشادات العلامة التجارية (Brand Guidelines) يجب الالتزام بها؟',
        why_ar: 'يوفّر عليك المراجعات غير المتوقعة بسبب تعارض مع الهوية البصرية.',
      },
      {
        q: 'ما ميزانيتكم المخصصة لهذا النوع من المشاريع في العادة؟',
        why_ar: 'الشركات الكبيرة لديها ميزانيات محددة — معرفتها مبكراً يوفر الوقت.',
      },
    ],
    questions_en: [
      {
        q: 'What is your internal approval process for creatives and deliverables, and how long does it take?',
        why_en: 'Large companies = bureaucracy. Know the real timeline before promising deadlines.',
      },
      {
        q: 'Have you worked with a freelancer before, and what worked or didn\'t work in that experience?',
        why_en: 'Reveals existing expectations and pain points to avoid.',
      },
      {
        q: 'Who is the primary point of contact, and what decision-making authority do they have?',
        why_en: 'Determines who you\'re really dealing with and their authority level.',
      },
      {
        q: 'Are there brand guidelines that must be followed?',
        why_en: 'Saves you from unexpected revisions due to visual identity conflicts.',
      },
      {
        q: 'What budget do you typically allocate for this type of project?',
        why_en: 'Large companies have set budgets — knowing early saves everyone time.',
      },
    ],
  },
];

// ─── AD CREATIVES ────────────────────────────────────────────────────────────
const AD_COL = 'tc_ad_creatives';

const adCreativesData = [
  {
    id: 'ecom_tiktok_conversion',
    niche: 'ecom', platform: 'tiktok', adType: 'conversion',
    ads_ar: [
      {
        title: 'إعلان "مشكلة → حل" الكلاسيكي',
        hook_ar: 'هل سبق ما طلبت {productType} وجاك مش زي ما توقعت؟ 😤',
        visual_ar: 'افتح الكاميرا على المنتج مباشرة — أظهر التفاصيل والجودة بوضوح',
        script_ar: `[ثانية 0-3]: {hook}
[ثانية 3-8]: "أنا كنت زيك — كل ما أطلب يجيني مخيب... لحد ما جربت {brandName}"
[ثانية 8-15]: اعرض المنتج بشكل قريب جداً مع إبراز أفضل ميزاتين
[ثانية 15-20]: قبل/بعد أو عميل حقيقي يتكلم
[ثانية 20-25]: "اطلب دلوقتي وجرّب الفرق — التوصيل في {deliveryTime}"`,
        cta_ar: 'اطلب دلوقتي — شحن مجاني فوق {freeShippingThreshold}',
      },
      {
        title: 'إعلان الـ UGC (مراجعة عميل حقيقي)',
        hook_ar: 'صاحبتي قالتلي جربي ده — مصدقتهاش 😱',
        visual_ar: 'شخص حقيقي يتكلم أمام الكاميرا بشكل طبيعي وغير مُعدّ',
        script_ar: `[ثانية 0-3]: {hook} — بداية بالصدمة أو المفاجأة
[ثانية 3-12]: "أنا اشتريت {productName} من {brandName} وكنت متردد... بس لما وصل..."
[ثانية 12-20]: أظهر المنتج وهو يُستخدم فعلاً
[ثانية 20-27]: النتيجة والفرق الحقيقي
[ثانية 27-30]: CTA طبيعي`,
        cta_ar: 'جرّب زيي — الرابط في البايو',
      },
    ],
    tip_ar: 'أفضل TikTok Ads تبدأ بثانية واحدة تُجمّد الـ Scroll.',
  },
  {
    id: 'digital_marketing_facebook_conversion',
    niche: 'digital_marketing', platform: 'facebook', adType: 'conversion',
    ads_ar: [
      {
        title: 'إعلان "الألم المالي"',
        hook_ar: 'كم صرفت على إعلانات الشهر الماضي؟ والنتائج؟',
        visual_ar: 'صورة واضحة: أرقام إعلانات عالية + نتائج ضعيفة (قبل) vs أرقام أفضل (بعد)',
        script_ar: `الـ Hook (السطر الأول في النص):
"لو إعلاناتك بتصرف من غير ما تشوف عملاء حقيقيين — في مشكلة في الاستهداف."

الجسم:
معظم الشركات بتخسر 40-60% من ميزانية إعلاناتها على جمهور غلط.

أنا {yourName}، ساعدت {numberOfClients} شركة في {niche} على تحسين ROAS بمتوسط {averageROAS}X خلال {timeframe}.

الطريقة: {shortMethodology}

السطر الختامي: نتائج حقيقية أو لا شيء.`,
        cta_ar: 'احجز استشارة مجانية 20 دقيقة',
      },
    ],
    tip_ar: 'Facebook Ads النصية الطويلة تُحقق أحياناً نتائج أفضل من القصيرة — جرّب الاثنين.',
  },
];

export const seedSalesReplies = async () => {
  console.log('🌱 Seeding sales replies...');
  for (const item of salesRepliesData) {
    const { id, ...data } = item;
    await setDoc(doc(db, SALES_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }
};

export const seedInterviewQuestions = async () => {
  console.log('🌱 Seeding interview questions...');
  for (const item of interviewQuestionsData) {
    const { id, ...data } = item;
    await setDoc(doc(db, INTERVIEW_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }
};

export const seedAdCreatives = async () => {
  console.log('🌱 Seeding ad creatives...');
  for (const item of adCreativesData) {
    const { id, ...data } = item;
    await setDoc(doc(db, AD_COL, id), { ...data, updatedAt: new Date() });
    console.log(`  ✅ ${id}`);
  }
};

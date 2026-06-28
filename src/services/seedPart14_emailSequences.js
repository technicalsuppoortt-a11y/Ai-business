import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const COL = 'tc_email_sequences_v2';

const goals = [
  { id: 'welcome', name_en: 'Welcome & Nurture', name_ar: 'ترحيب وبناء ثقة' },
  { id: 'sell', name_en: 'Sell a Product/Service', name_ar: 'بيع منتج أو خدمة' },
  { id: 'recover', name_en: 'Recover Lost Leads', name_ar: 'استعادة عملاء مفقودين' },
  { id: 'upsell', name_en: 'Upsell / Cross-sell', name_ar: 'بيع إضافي (Upsell)' },
];

const audiences = [
  { id: 'cold', name_en: 'Cold Lead (New)', name_ar: 'عميل بارد (جديد)' },
  { id: 'warm', name_en: 'Warm Lead (Engaged)', name_ar: 'عميل دافئ (متفاعل)' },
  { id: 'buyer', name_en: 'Existing Buyer', name_ar: 'مشتري حالي' },
  { id: 'dormant', name_en: 'Dormant / Inactive', name_ar: 'خامل (لم يتفاعل)' },
];

const tones = [
  { id: 'professional', name_en: 'Professional', name_ar: 'رسمي واحترافي' },
  { id: 'friendly', name_en: 'Friendly & Casual', name_ar: 'ودي وقريب' },
  { id: 'urgency', name_en: 'Urgency & Scarcity', name_ar: 'إلحاح وندرة' },
  { id: 'storytelling', name_en: 'Storytelling', name_ar: 'سرد قصصي' },
];

const generateSequence = (goal, audience, tone) => {
  // Subject lines per goal
  const subjects = {
    welcome: {
      professional: {
        ar: ['مرحباً بك في عائلتنا — هذه هديتك الحصرية', 'ثلاث خطوات لتبدأ رحلتك معنا', 'آخر شيء — عرض خاص لأنك انضممت اليوم'],
        en: ['Welcome to our family — here is your exclusive gift', 'Three steps to begin your journey with us', 'One last thing — a special offer for joining today']
      },
      friendly: {
        ar: ['أهلاً! 👋 وصلت هديتك', 'نصيحة سريعة من صديق 💡', 'مفاجأة صغيرة لأنك هنا 🎁'],
        en: ['Hey! 👋 Your gift has arrived', 'A quick tip from a friend 💡', 'A little surprise just because you are here 🎁']
      },
      urgency: {
        ar: ['هديتك المجانية جاهزة — حمّلها الآن!', '⏰ ينتهي خلال 48 ساعة', '🔥 آخر فرصة — العرض يختفي الليلة'],
        en: ['Your free gift is ready — download it now!', '⏰ Expires in 48 hours', '🔥 Last chance — the offer disappears tonight']
      },
      storytelling: {
        ar: ['بدأت قصتي من الصفر... مثلك تماماً', 'الخطأ الذي غيّر كل شيء', 'النهاية السعيدة — وكيف تكتب قصتك أنت'],
        en: ['My story started from scratch... just like you', 'The mistake that changed everything', 'The happy ending — and how to write your own story']
      },
    },
    sell: {
      professional: {
        ar: ['حل احترافي لمشكلة [المشكلة]', 'نتائج عملائنا تتحدث — اقرأ بنفسك', 'عرض حصري لمدة 72 ساعة فقط'],
        en: ['A professional solution for [Problem]', 'Our clients results speak for themselves — read it yourself', 'Exclusive offer for 72 hours only']
      },
      friendly: {
        ar: ['حاسس إنك تحتاج هذا... 😉', 'شوف إيش صار مع عملائنا! 🚀', 'آخر يوم على العرض — لا تفوتها! 🎯'],
        en: ['Feeling like you might need this... 😉', 'Look what happened with our clients! 🚀', 'Last day for the offer — dont miss out! 🎯']
      },
      urgency: {
        ar: ['⚠️ المقاعد تنفذ — سجل الآن', '24 ساعة فقط على هذا السعر', '🔴 تم حجز 80% — المتبقي محدود'],
        en: ['⚠️ Seats are running out — register now', 'Only 24 hours left at this price', '🔴 80% already booked — remaining spots are limited']
      },
      storytelling: {
        ar: ['كنت أعاني من نفس مشكلتك بالضبط...', 'العميل الذي تحولت حياته في 30 يوم', 'هل تريد أن تكون البطل التالي في قصتنا؟'],
        en: ['I used to struggle with your exact same problem...', 'The client whose life transformed in 30 days', 'Do you want to be the next hero in our story?']
      },
    },
    recover: {
      professional: {
        ar: ['لاحظنا غيابك — نود سماع رأيك', 'هل يمكننا المساعدة في شيء؟', 'عرض خاص لإعادة التواصل'],
        en: ['We noticed your absence — we would love to hear your feedback', 'Can we help you with anything?', 'A special offer to reconnect']
      },
      friendly: {
        ar: ['وحشتنا! 😢 وين رحت؟', 'جهزنالك مفاجأة لأنك غبت عنا 🎁', 'تعال نبدأ من جديد — بدون أي التزام 🤝'],
        en: ['We missed you! 😢 Where did you go?', 'We prepared a surprise for you since you were away 🎁', 'Lets start over — no strings attached 🤝']
      },
      urgency: {
        ar: ['⏰ هذا العرض لن يتكرر مرة أخرى', '🔥 خصم 40% لمدة 24 ساعة فقط — لأنك وحشتنا', 'آخر فرصة للعودة بهذا السعر'],
        en: ['⏰ This offer will not be repeated again', '🔥 40% off for 24 hours only — because we missed you', 'Last chance to return at this price']
      },
      storytelling: {
        ar: ['تذكر أول مرة انضممت لنا؟', 'عميلنا فلان عاد بعد 6 شهور... وهذا ما حصل', 'باب العودة مفتوح — ونحن في انتظارك'],
        en: ['Remember the first time you joined us?', 'Our client X returned after 6 months... and here is what happened', 'The door is open to return — and we are waiting for you']
      },
    },
    upsell: {
      professional: {
        ar: ['ارتقِ بنتائجك للمستوى التالي', 'حصرياً لعملائنا — الإصدار المتقدم', 'خصم ترقية خاص لعملائنا الحاليين'],
        en: ['Elevate your results to the next level', 'Exclusive for our clients — The Advanced Edition', 'Special upgrade discount for our current clients']
      },
      friendly: {
        ar: ['جاهز للمرحلة القادمة؟ 🚀', 'اكتشف الأداة السرية اللي يستخدمها أفضل عملائنا 🔑', 'مفاجأة: خصم ترقية 30% لك خصيصاً! 🎉'],
        en: ['Ready for the next stage? 🚀', 'Discover the secret tool used by our best clients 🔑', 'Surprise: A 30% upgrade discount just for you! 🎉']
      },
      urgency: {
        ar: ['⏰ عرض الترقية ينتهي خلال 48 ساعة', '🔴 تبقى 15 مقعد فقط في البرنامج المتقدم', '💰 وفر 50% اليوم فقط على الباقة الاحترافية'],
        en: ['⏰ Upgrade offer expires in 48 hours', '🔴 Only 15 seats left in the advanced program', '💰 Save 50% today only on the professional package']
      },
      storytelling: {
        ar: ['كيف انتقل عميلنا من المستوى الأول للاحتراف', 'السر الذي يفصل المبتدئين عن المحترفين', 'قصة نجاح: من الباقة الأساسية لأرباح 10 أضعاف'],
        en: ['How our client moved from level one to professional', 'The secret separating beginners from professionals', 'Success Story: From basic package to 10x profits']
      },
    },
  };

  const getBody = (emailIndex, goal, audience, tone, lang = 'ar') => {
    // Email 1 - Opening
    if (emailIndex === 0) {
      if (goal.id === 'welcome') {
        if (tone.id === 'professional') return lang === 'en' 
          ? `Welcome,\n\nWe are thrilled to have you join us. You have taken a smart step towards [The goal the client seeks].\n\nIn this email, you will find:\n✦ The exclusive gift we promised you: [Download Link]\n✦ Quick Start Guide: [3 Practical Steps]\n✦ How to reach us directly if you need any help\n\nWe are here to ensure your success.\nBest regards,\n[Brand Name]`
          : `مرحباً بك،\n\nيسعدنا انضمامك إلينا. لقد اتخذت خطوة ذكية نحو [الهدف الذي يسعى له العميل].\n\nفي هذا الإيميل، ستجد:\n✦ الهدية الحصرية التي وعدناك بها: [رابط التحميل]\n✦ دليل البداية السريعة: [3 خطوات عملية]\n✦ طريقة التواصل المباشر معنا إذا احتجت أي مساعدة\n\nنحن هنا لضمان نجاحك.\nتحياتنا،\n[اسم البراند]`;
        if (tone.id === 'friendly') return lang === 'en'
          ? `Welcome! 👋\n\nWe are so happy you are here with us! 🎉\n\nFirst things first — your gift is ready: [Download Link]\n\nA quick tip: The best way to benefit is to start with [The simple first step]. Take it step by step and you will see the difference.\n\nIf you have any questions — reply directly to this email. We are real people and we reply! 😊\n\nSee you in the next email!`
          : `أهلاً وسهلاً! 👋\n\nسعيدين جداً إنك هنا معانا! 🎉\n\nقبل أي شيء — هديتك جاهزة: [رابط التحميل]\n\nنصيحة سريعة: أفضل طريقة تستفيد هي إنك تبدأ بـ [الخطوة الأولى البسيطة]. خذها خطوة خطوة وبتشوف الفرق.\n\nلو عندك أي سؤال — رد على هذا الإيميل مباشرة. نحن ناس حقيقيين وبنرد! 😊\n\nنشوفك في الإيميل القادم!`;
        if (tone.id === 'urgency') return lang === 'en'
          ? `Registration successful! ⚡\n\nYour exclusive gift is ready to download now: [Download Link]\n\n⚠️ Important Alert: This link is valid for 48 hours only.\n\nAdditionally, we have prepared a special offer for new subscribers only:\n🔥 [X]% OFF on [Product/Service] — expires in [Time]\n\nDont miss this opportunity.\n[Offer Link]`
          : `تم التسجيل بنجاح! ⚡\n\nهديتك الحصرية جاهزة للتحميل الآن: [رابط التحميل]\n\n⚠️ تنبيه مهم: هذا الرابط صالح لمدة 48 ساعة فقط.\n\nبالإضافة لذلك، أعددنا لك عرضاً خاصاً للمشتركين الجدد فقط:\n🔥 خصم [X]% على [المنتج/الخدمة] — ينتهي خلال [الوقت]\n\nلا تضيع هذه الفرصة.\n[رابط العرض]`;
        return lang === 'en'
          ? `My story began [Time ago]...\n\nI was in your exact same position — [Describe the pain or challenge]. Every day trying and failing, feeling lost every time.\n\nBut everything changed when I discovered [The Solution/Method]. The result? [Amazing Result].\n\nToday I want to share the same secret with you — and its in the attached gift: [Download Link]\n\nOpen it now... and in the next email I will tell you exactly how to apply it.`
          : `بدأت قصتي قبل [فترة]...\n\nكنت في نفس موقفك بالضبط — [وصف الألم أو التحدي]. كل يوم أحاول وأفشل، وكل مرة أحس إني ضائع.\n\nلكن كل شيء تغير عندما اكتشفت [الحل/الطريقة]. والنتيجة؟ [النتيجة المذهلة].\n\nاليوم أريد أشاركك نفس السر — وهو في الهدية المرفقة: [رابط التحميل]\n\nافتحها الآن... وفي الإيميل القادم سأحكيلك بالتفصيل كيف تطبقها.`;
      }
      if (goal.id === 'sell') {
        return lang === 'en'
          ? `Are you struggling with [The Core Problem]?\n\nMost [Audience Type] go through the exact same challenge:\n- [Pain point 1]\n- [Pain point 2]\n- [Pain point 3]\n\nThe solution? [Product/Service Name] designed specifically to solve this problem in [Timeframe].\n\n✦ [Feature 1 solves Pain 1]\n✦ [Feature 2 solves Pain 2]\n✦ [Feature 3 solves Pain 3]\n\nDiscover details: [Product Link]`
          : `هل تعاني من [المشكلة الأساسية]؟\n\nأغلب [نوع الجمهور] يمرون بنفس التحدي:\n- [نقطة ألم 1]\n- [نقطة ألم 2]\n- [نقطة ألم 3]\n\nالحل؟ [اسم المنتج/الخدمة] الذي صُمم خصيصاً لحل هذه المشكلة في [الإطار الزمني].\n\n✦ [ميزة 1 تحل ألم 1]\n✦ [ميزة 2 تحل ألم 2]\n✦ [ميزة 3 تحل ألم 3]\n\nاكتشف التفاصيل: [رابط المنتج]`;
      }
      if (goal.id === 'recover') {
        return lang === 'en'
          ? `Hello [Name],\n\nWe noticed you havent interacted with us in a while, and we hope you are doing well.\n\nWe just wanted to remind you that we are here to help you with [The goal they registered for].\n\nWhats new with us since your last visit?\n✦ [New update or feature 1]\n✦ [New update or feature 2]\n✦ [New free content]\n\nWould you like us to help you with anything specific? Reply to this email and let us know.`
          : `مرحباً [الاسم]،\n\nلاحظنا أنك لم تتفاعل معنا منذ فترة، ونتمنى أن تكون بخير.\n\nأردنا فقط تذكيرك بأننا هنا لمساعدتك في [الهدف الذي سجل من أجله].\n\nما الجديد عندنا منذ آخر زيارة؟\n✦ [تحديث أو ميزة جديدة 1]\n✦ [تحديث أو ميزة جديدة 2]\n✦ [محتوى مجاني جديد]\n\nهل تريد أن نساعدك في شيء محدد؟ رد على هذا الإيميل وأخبرنا.`;
      }
      return lang === 'en'
        ? `Hello [Name],\n\nSince you are a current client and we provided you with [First Product]...\n\nWe wanted to let you know that we have something new that will take your results to the next level:\n\n🚀 [Advanced Product/Package Name]\n\nThis product builds on what you learned with us and adds:\n✦ [Advanced feature 1]\n✦ [Advanced feature 2]\n✦ [Additional result]\n\nAs a current client, you have an exclusive discount: [X]% — [Upgrade Link]`
        : `مرحباً [الاسم]،\n\nبما أنك عميل حالي وقدمنا لك [المنتج الأول]...\n\nأردنا إخبارك أن لدينا شيء جديد سيأخذ نتائجك للمستوى التالي:\n\n🚀 [اسم المنتج/الباقة المتقدمة]\n\nهذا المنتج يبني على ما تعلمته معنا ويضيف:\n✦ [ميزة متقدمة 1]\n✦ [ميزة متقدمة 2]\n✦ [نتيجة إضافية]\n\nكعميل حالي، لديك خصم حصري: [X]% — [رابط الترقية]`;
    }

    // Email 2 - Social Proof + Value
    if (emailIndex === 1) {
      return lang === 'en'
        ? `In the previous email, we talked about [Topic].\n\nToday I want to share real proof with you:\n\n📊 Case Study: [Client Name / Niche]\n- Situation before: [Pain/Problem]\n- What we did: [Applied Solution]\n- The Result: [Tangible real numbers]\n\nThe same result is possible for you — because your circumstances are similar.\n\n💡 Immediately actionable tip:\n[Free practical tip that can be applied without buying]\n\nIn the next email... I will reveal the final offer to you.`
        : `في الإيميل السابق تحدثنا عن [الموضوع].\n\nاليوم أريد أشاركك دليلاً حقيقياً:\n\n📊 دراسة حالة: [اسم العميل / النيش]\n- الوضع قبل: [الألم/المشكلة]\n- ما فعلناه: [الحل المطبق]\n- النتيجة: [أرقام حقيقية ملموسة]\n\nنفس النتيجة ممكنة لك — لأن ظروفك مشابهة.\n\n💡 نصيحة قابلة للتطبيق فوراً:\n[نصيحة عملية مجانية يمكن تطبيقها بدون شراء]\n\nفي الإيميل القادم... سأكشف لك عن العرض النهائي.`;
    }

    // Email 3 - CTA / Close
    return lang === 'en'
      ? `This is the last email in the sequence.\n\nTo summarize what we talked about:\n✦ Email 1: [One line summary]\n✦ Email 2: [One line summary]\n\nNow its time to make a decision.\n\n🔥 The Final Offer:\n[Clear offer description]\n- Price: [Price] (instead of [Original Price])\n- Duration: Expires in [Timeframe]\n- Guarantee: [Money back guarantee / Free trial]\n\n👉 [Purchase / Registration Link]\n\nThis offer will not be repeated with the same terms.\n\nIf you have any questions — reply directly to this email.\n\nGood luck!\n[Brand Name]`
      : `هذا آخر إيميل في السلسلة.\n\nلنلخص ما تحدثنا عنه:\n✦ إيميل 1: [ملخص سطر واحد]\n✦ إيميل 2: [ملخص سطر واحد]\n\nالآن حان وقت اتخاذ القرار.\n\n🔥 العرض النهائي:\n[وصف العرض بوضوح]\n- السعر: [السعر] (بدلاً من [السعر الأصلي])\n- المدة: ينتهي خلال [الفترة]\n- الضمان: [ضمان استرجاع / تجربة مجانية]\n\n👉 [رابط الشراء / التسجيل]\n\nهذا العرض لن يتكرر بنفس الشروط.\n\nإذا كان لديك أي سؤال — رد على هذا الإيميل مباشرة.\n\nبالتوفيق!\n[اسم البراند]`;
  };

  const subjectList = subjects/[goal.id]?.[tone.id] || subjects.welcome.professional;

  const emails = [0, 1, 2].map(i => ({
    subject_ar: subjectList[i]?.ar || `إيميل ${i + 1}`,
    subject_en: subjectList[i]?.en || `Email ${i + 1}`,
    body_ar: getBody(i, goal, audience, tone, 'ar'),
    body_en: getBody(i, goal, audience, tone, 'en'),
    send_timing_ar: i === 0 ? 'فوراً بعد التسجيل' : i === 1 ? 'بعد يومين (48 ساعة)' : 'بعد 5 أيام',
    send_timing_en: i === 0 ? 'Immediately after registration' : i === 1 ? 'After 2 days (48 hours)' : 'After 5 days',
    send_timing: i === 0 ? 'فوراً بعد التسجيل' : i === 1 ? 'بعد يومين (48 ساعة)' : 'بعد 5 أيام',
  }));

  const tips_ar = [
    `💎 نصيحة: اجعل عنوان الإيميل الأول شخصياً جداً — استخدم اسم المشترك إن أمكن.`,
    `⚡ مهم: لا تبع في أول إيميل إذا كان الجمهور بارداً. ابنِ الثقة أولاً ثم اعرض.`,
    `📊 قاعدة: 80% قيمة مجانية + 20% بيع = المعادلة المثالية لسلاسل الإيميل.`,
  ];
  const tips_en = [
    `💎 Tip: Make the first email subject highly personal — use the subscribers name if possible.`,
    `⚡ Important: Do not sell in the first email if the audience is cold. Build trust first, then pitch.`,
    `📊 Rule: 80% free value + 20% selling = The perfect formula for email sequences.`,
  ];

  return { emails, tips: tips_ar, tips_ar, tips_en };
};

export const seedEmailSequencesV2 = async () => {
  console.log('🌱 Generating Email Sequences V2 Matrix (64 Scenarios)...');
  let count = 0;

  await setDoc(doc(db, COL, 'structure_def'), { id: 'structure_def', goals, audiences, tones });

  for (const goal of goals) {
    for (const audience of audiences) {
      for (const tone of tones) {
        const docId = `${goal.id}_${audience.id}_${tone.id}`;
        const content = generateSequence(goal, audience, tone);
        await setDoc(doc(db, COL, docId), {
          id: docId, goal: goal.id, audience: audience.id, tone: tone.id,
          content, updatedAt: new Date().toISOString(),
        });
        count++;
      }
    }
  }
  console.log(`✅ Seeded ${count} Email Sequence Scenarios to '${COL}'`);
  return count;
};

/**
 * seedPart5_dynamic.js
 * ======================================================
 * Seeding data for the 9 Dynamic Tools
 * These templates contain {{placeholders}} that will be parsed by templateParser.js
 * ======================================================
 */
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const WEBSITE_TEMPLATES = {
  // We'll store a generic one for 'ecom', but you can add more niches
  ecom: {
    en: `<div class="font-sans antialiased bg-gray-50 text-gray-900">
  <!-- Hero Section -->
  <header style="background-color: {{colorHex}};" class="text-white">
    <div class="max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        Welcome to <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{{brandName}}</span>
      </h1>
      <p class="text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-10 opacity-90">
        We specialize in premium {{nicheName}} solutions designed to scale your success.
      </p>
      <div class="flex gap-4">
        <button class="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1">
          Get Started
        </button>
        <button class="bg-transparent border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-all">
          Learn More
        </button>
      </div>
    </div>
  </header>
</div>`,
    ar: `<div class="font-sans antialiased bg-gray-50 text-gray-900" dir="rtl">
  <!-- Hero Section -->
  <header style="background-color: {{colorHex}};" class="text-white">
    <div class="max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        مرحباً بك في <span class="text-transparent bg-clip-text bg-gradient-to-l from-white to-gray-300">{{brandName}}</span>
      </h1>
      <p class="text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-10 opacity-90">
        نحن متخصصون في تقديم حلول {{nicheName}} استثنائية لدعم نموك ونجاحك.
      </p>
      <div class="flex gap-4">
        <button class="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1">
          ابدأ الآن
        </button>
        <button class="bg-transparent border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-all">
          اعرف المزيد
        </button>
      </div>
    </div>
  </header>
</div>`
  }
};

export const DOMAIN_IDEAS = {
  ecom: {
    en: `### 🌐 Top Domain Strategies for {{brandName}}\n\n` +
      `**1. The ".com" variations (Most Trusted)**\n` +
      `- get{{brandName}}.com\n` +
      `- try{{brandName}}.com\n` +
      `- {{brandName}}hq.com\n\n` +
      `**2. Action-Oriented Domains**\n` +
      `- join{{brandName}}.com\n` +
      `- use{{brandName}}.com\n\n` +
      `**3. Modern TLDs (Trending in {{niche}})**\n` +
      `- {{brandName}}.co (Great for startups)\n` +
      `- {{brandName}}.io (Great for tech/software)\n` +
      `- {{brandName}}.store (Perfect for e-commerce)`,
    ar: `### 🌐 أفضل استراتيجيات الدومين لـ {{brandName}}\n\n` +
      `**1. بدائل الـ (.com) الاحترافية**\n` +
      `- get{{brandName}}.com\n` +
      `- try{{brandName}}.com\n` +
      `- {{brandName}}hq.com\n\n` +
      `**2. دومينات تعتمد على الأفعال (معدل تحويل عالي)**\n` +
      `- join{{brandName}}.com\n` +
      `- use{{brandName}}.com\n\n` +
      `**3. امتدادات حديثة (مشهورة في مجال {{niche}})**\n` +
      `- {{brandName}}.co (ممتاز للشركات الناشئة)\n` +
      `- {{brandName}}.io (ممتاز للتقنية والتطبيقات)\n` +
      `- {{brandName}}.store (مثالي للمتاجر الإلكترونية)`
  }
};

export const SOCIAL_PRESENCE = {
  instagram_general: {
    en: `### 📱 Instagram Strategy for {{brandName}}\n\n` +
        `**1. Profile Optimization:**\n` +
        `- **Name:** {{brandName}} | {{niche}}\n` +
        `- **Bio:** Helping you achieve success in {{niche}}. We provide the best solutions. Click below to start! 👇\n` +
        `- **Link:** Your website or Linktree.\n\n` +
        `**2. Content Pillars:**\n` +
        `- **Educational:** Tips and tricks related to {{niche}}.\n` +
        `- **Social Proof:** Client testimonials and success stories.\n` +
        `- **Behind the Scenes:** Show the process of building {{brandName}}.\n\n` +
        `**3. Your First 3 Posts:**\n` +
        `1. **Post 1 (Reel):** Introduce yourself and why you started {{brandName}}.\n` +
        `2. **Post 2 (Carousel):** 3 common mistakes people make in {{niche}}.\n` +
        `3. **Post 3 (Image):** A powerful quote or statistic about {{niche}}.`,
    ar: `### 📱 استراتيجية إنستجرام لـ {{brandName}}\n\n` +
        `**1. تحسين الحساب (Profile):**\n` +
        `- **الاسم:** {{brandName}} | {{niche}}\n` +
        `- **البايو:** نساعدك على التميز في {{niche}}. نقدم لك أفضل الحلول المبتكرة. اضغط الرابط للبدء! 👇\n` +
        `- **الرابط:** موقعك أو Linktree.\n\n` +
        `**2. أعمدة المحتوى (Content Pillars):**\n` +
        `- **تعليمي:** نصائح وأسرار في مجال {{niche}}.\n` +
        `- **إثبات اجتماعي:** آراء العملاء وقصص النجاح.\n` +
        `- **خلف الكواليس:** شارك كيف تعمل في {{brandName}}.\n\n` +
        `**3. أول 3 منشورات للبدء:**\n` +
        `1. **منشور 1 (ريلز):** عرّف عن نفسك ولماذا أطلقت {{brandName}}.\n` +
        `2. **منشور 2 (كاروسيل):** 3 أخطاء شائعة يقع فيها الناس في {{niche}}.\n` +
        `3. **منشور 3 (صورة):** إحصائية أو مقولة ملهمة عن {{niche}}.`
  }
};

export const PROFIT_ADVICE = {
  good: {
    en: `### 📊 Profitability Analysis\n\n` +
        `**Margin Assessment:**\n` +
        `Your profit margin of **{{margin}}%** is very healthy. This gives you excellent room to invest in growth.\n\n` +
        `**Strategic Recommendations:**\n` +
        `1. **Reinvest in Acquisition:** Allocate 20-30% of your net profit back into Paid Ads (Facebook/TikTok) to scale faster.\n` +
        `2. **Improve LTV:** Since your margins are good, focus on getting your current customers to buy again (Email marketing, loyalty programs).\n` +
        `3. **Optimize Operations:** Look into automating repetitive tasks so you can handle more volume without increasing fixed costs.`,
    ar: `### 📊 تحليل الأرباح\n\n` +
        `**تقييم هامش الربح:**\n` +
        `هامش الربح الخاص بك **{{margin}}%** يعتبر ممتازاً وصحياً جداً. هذا يمنحك مساحة ممتازة للاستثمار في النمو.\n\n` +
        `**توصيات استراتيجية:**\n` +
        `1. **إعادة الاستثمار في التسويق:** خصص 20-30% من صافي أرباحك للحملات الإعلانية (فيسبوك/تيك توك) لتسريع النمو.\n` +
        `2. **زيادة القيمة الدائمة للعميل (LTV):** ركز على جعل عملائك الحاليين يشترون مرة أخرى عبر الإيميل ماركتنج أو برامج الولاء.\n` +
        `3. **أتمتة العمليات:** ابحث عن طرق لأتمتة المهام المكررة لتتمكن من استقبال طلبات أكثر بدون زيادة التكاليف الثابتة.`
  }
};

export const PRODUCT_IDEAS = {
  plr_medium: {
    en: `### 📦 Digital Product Ideas (PLR / Templates)\n\n` +
        `Since you are in **{{nicheName}}**, here are 3 high-converting digital products you can create once and sell forever:\n\n` +
        `1. **The Ultimate {{nicheName}} Planner/Tracker (Notion or Excel):**\n` +
        `A ready-to-use template that helps your audience organize their workflow or track their progress in {{nicheName}}.\n\n` +
        `2. **The {{nicheName}} Starter Kit (Bundle):**\n` +
        `A collection of checklists, templates, and a quick-start guide. Perfect for beginners in {{nicheName}}.\n\n` +
        `3. **100+ {{nicheName}} Prompts/Ideas (PDF):**\n` +
        `A swipe file or resource guide that saves your audience hours of brainstorming. High perceived value, easy to create.`,
    ar: `### 📦 أفكار منتجات رقمية (قوالب / PLR)\n\n` +
        `بما أنك في مجال **{{nicheName}}**، إليك 3 منتجات رقمية يمكنك تصميمها مرة واحدة وبيعها إلى الأبد:\n\n` +
        `1. **ملف المتابعة والتخطيط الشامل لـ {{nicheName}} (Notion أو Excel):**\n` +
        `قالب جاهز يساعد جمهورك على تنظيم عملهم أو تتبع نتائجهم في {{nicheName}} بسهولة.\n\n` +
        `2. **حزمة البداية (Starter Kit) في {{nicheName}}:**\n` +
        `مجموعة من قوائم التحقق (Checklists) والقوالب ودليل سريع للبدء. منتج مثالي للمبتدئين في مجالك.\n\n` +
        `3. **100+ فكرة/قالب حصري في {{nicheName}} (ملف PDF):**\n` +
        `ملف يختصر على العميل ساعات من التفكير. قيمته عالية جداً في نظر العميل وسهل جداً في تنفيذه.`
  }
};

export const HEYGEN_SCRIPTS = {
  welcome_short: {
    en: `### 🎬 AI Avatar Script\n\n` +
        `*(Goal: Homepage Welcome Video | Duration: Short)*\n\n` +
        `**1. Visual Prompts & Tone:**\n` +
        `- **Avatar:** Friendly, professional young adult in business-casual attire.\n` +
        `- **Background:** Clean, bright office or solid color matching your brand.\n` +
        `- **Voice Tone:** Enthusiastic, confident, and welcoming.\n\n` +
        `**2. The Script:**\n` +
        `*Hook (0-5s):* "Welcome to {{brandName}}! We're thrilled to have you here."\n` +
        `*Body (5-20s):* "If you're looking for the best in {{niche}}, you're in the right place. We help you achieve your goals faster and easier."\n` +
        `*CTA (20-30s):* "Click the button below to explore our services. Let's get started!"\n`,
    ar: `### 🎬 سكربت المتحدث الافتراضي\n\n` +
        `*(الهدف: فيديو ترحيبي | المدة: قصير)*\n\n` +
        `**1. التوجيهات البصرية والنبرة:**\n` +
        `- **الشخصية (Avatar):** شخص بملابس عمل عصرية (Business Casual)، ملامح ودودة ومريحة.\n` +
        `- **الخلفية:** مكتب مشرق أو خلفية بلون هويتك البصرية الأساسي.\n` +
        `- **نبرة الصوت:** حماسية، واثقة، وترحيبية.\n\n` +
        `**2. السكربت الفعلي:**\n` +
        `*الخطفة (0-5 ثوان):* "أهلاً بك في {{brandName}}! نحن سعداء جداً بزيارتك."\n` +
        `*المحتوى (5-20 ثانية):* "إذا كنت تبحث عن التميز في {{niche}}، فأنت في المكان الصحيح. نحن هنا لنساعدك على تحقيق أهدافك بأسرع وأسهل طريقة."\n` +
        `*النداء (20-30 ثانية):* "اضغط على الزر بالأسفل لتكتشف خدماتنا. دعنا نبدأ!"\n`
  }
};

export const PRICING_ANALYSIS = {
  competitive: {
    en: `### 💰 Pricing Strategy Analysis\n\n` +
        `**1. Price Assessment:**\n` +
        `Your rate of {{curr}}{{rate}}/hr is highly competitive for a professional in {{nicheName}}. It shows you are experienced but accessible.\n\n` +
        `**2. How to Justify Your Price (Sales Sentences):**\n` +
        `- *"My rate reflects the speed and quality I deliver; I get it right the first time, saving you the cost of re-doing the work later."*\n` +
        `- *"Think of this as an investment in your business growth. The results from this {{nicheName}} project will easily cover the initial cost."*\n`,
    ar: `### 💰 تحليل استراتيجية التسعير\n\n` +
        `**1. تقييم السعر المقترح:**\n` +
        `سعرك المقترح ({{rate}} {{curr}}/للساعة) تنافسي جداً ومناسب لمحترف في {{nicheName}}. يعكس خبرتك الجيدة وفي نفس الوقت يظل في متناول شريحة واسعة.\n\n` +
        `**2. كيف تقنع العميل بالسعر (جمل بيعية):**\n` +
        `- *"هذا السعر يعكس السرعة والجودة التي سأقدمها لك؛ أنا أنفذ العمل بدقة من المرة الأولى، مما يوفر عليك تكلفة التعديل أو إعادة العمل لاحقاً."*\n` +
        `- *"اعتبر هذا المبلغ استثماراً مباشراً في نمو عملك. العائد الذي ستحصل عليه من هذا العمل في {{nicheName}} سيغطي هذه التكلفة بأضعاف."*\n`
  }
};

export const EMAIL_SEQUENCES = {
  ecom: {
    en: `### 📧 Welcome Email Sequence\n\n` +
        `**✉️ Email 1 (Immediate Delivery)**\n` +
        `**Subject:** Here is your {{offerName}} as promised! 🎉\n\n` +
        `Hi [Name],\n\n` +
        `Welcome to {{brandName}}! I'm so glad you're here. As promised, here is the link to access your **{{offerName}}**.\n\n` +
        `👉 [Download / Access Link Here]\n\n` +
        `This resource is designed to help you {{offerValue}}. Take your time to go through it, and let me know if you have any questions.\n\n` +
        `Best,\n{{brandName}} Team\n\n` +
        `---\n\n` +
        `**✉️ Email 2 (After 2 Days - Building Trust)**\n` +
        `**Subject:** A quick question about {{offerName}}...\n\n` +
        `Hi [Name],\n\n` +
        `It's been a couple of days since you downloaded {{offerName}}. Have you had a chance to check it out yet?\n\n` +
        `When I first started out in {{niche}}, I struggled a lot. I created this resource specifically so you wouldn't have to make the same mistakes I did.\n\n` +
        `*Quick tip:* The most important part of getting results is consistency. Don't rush it, just take it one step at a time.\n\n` +
        `Talk soon,\n{{brandName}} Team\n\n` +
        `---\n\n` +
        `**✉️ Email 3 (After 4 Days - Transition to Sale)**\n` +
        `**Subject:** Ready to take the next big step? 🚀\n\n` +
        `Hi [Name],\n\n` +
        `By now, you understand the basics of achieving {{offerValue}}.\n\n` +
        `But what if you could reach your goals twice as fast, without the guesswork?\n\n` +
        `That's exactly what we do at {{brandName}}. Our premium services are designed for people who are serious about dominating {{niche}}.\n\n` +
        `If you're ready to level up, click the link below to see how we can work together.\n\n` +
        `👉 [Link to your Product / Service]\n\n` +
        `Cheers,\n{{brandName}} Team`,
    ar: `### 📧 سلسلة البريد الترحيبية\n\n` +
        `**✉️ الإيميل الأول (توصيل فوري)**\n` +
        `**العنوان:** إليك طلبك: {{offerName}} كما وعدناك! 🎉\n\n` +
        `أهلاً [الاسم]،\n\n` +
        `مرحباً بك في عالم {{brandName}}! سعيد جداً بانضمامك لنا. كما وعدتك، هذا هو رابط الوصول المباشر لـ **{{offerName}}** الخاص بك.\n\n` +
        `👉 [ضع رابط التحميل أو الدخول هنا]\n\n` +
        `هذا المصدر صُمم خصيصاً ليساعدك في تحقيق {{offerValue}}. خذ وقتك في الاطلاع عليه، ولا تتردد في الرد على هذا الإيميل إذا كان لديك أي سؤال.\n\n` +
        `أطيب التحيات،\nفريق {{brandName}}\n\n` +
        `---\n\n` +
        `**✉️ الإيميل الثاني (بعد يومين - بناء الثقة)**\n` +
        `**العنوان:** سؤال سريع بخصوص {{offerName}}...\n\n` +
        `أهلاً [الاسم]،\n\n` +
        `مرت بضعة أيام منذ حصولك على {{offerName}}. هل أتيحت لك الفرصة للاطلاع عليه؟\n\n` +
        `عندما بدأت مسيرتي في مجال {{niche}}، واجهت الكثير من الصعوبات. لقد صممت هذا المصدر خصيصاً لتجنبك الوقوع في نفس الأخطاء التي وقعت فيها في بداياتي.\n\n` +
        `*نصيحة سريعة:* أهم سر للحصول على نتائج حقيقية هو الاستمرارية، لا تتعجل النتائج، فقط خذ خطوة واحدة كل يوم.\n\n` +
        `نلتقي قريباً،\nفريق {{brandName}}\n\n` +
        `---\n\n` +
        `**✉️ الإيميل الثالث (بعد 4 أيام - الانتقال للبيع)**\n` +
        `**العنوان:** هل أنت مستعد للخطوة الكبرى التالية؟ 🚀\n\n` +
        `أهلاً [الاسم]،\n\n` +
        `الآن، أنت تفهم الأساسيات المطلوبة لتحقيق {{offerValue}}.\n\n` +
        `لكن ماذا لو كان بإمكانك الوصول لهدفك بسرعة مضاعفة، وبدون أي تخمين؟\n\n` +
        `هذا بالضبط ما نفعله في {{brandName}}. خدماتنا المتقدمة مصممة للأشخاص الجادين في التميز في مجال {{niche}}.\n\n` +
        `إذا كنت مستعداً لنقل عملك للمستوى التالي، اضغط على الرابط بالأسفل لترى كيف يمكننا مساعدتك.\n\n` +
        `👉 [رابط الخدمة أو المنتج المدفوع]\n\n` +
        `بالتوفيق،\nفريق {{brandName}}`
  }
};

export const CHATBOT_SCRIPTS = {
  professional: {
    en: `### 🤖 Chatbot Auto-Reply Script\n\n` +
        `**1. Welcome Message:**\n` +
        `*Welcome to {{brandName}}. Thank you for reaching out regarding {{offer}}. Please select an option from the menu below to direct your inquiry:\n\n1. Service Details\n2. Customer Support\n(Reply with the corresponding number)*\n\n` +
        `**2. FAQ Auto-Replies:**\n` +
        `**Q1: How much does {{offer}} cost?**\n` +
        `*A1:* Our pricing is tailored to fit your specific needs. Please check our website or reply with 'Pricing' to get a detailed breakdown.\n\n` +
        `**Q2: How long does it take to get started?**\n` +
        `*A2:* Usually, we can get you onboarded and running within 24-48 hours once everything is confirmed!\n\n` +
        `**Q3: Do you offer refunds?**\n` +
        `*A3:* Yes, we have a clear refund policy. If you aren't satisfied within the first 14 days, let us know.\n\n` +
        `**Q4: Can I customize {{offer}}?**\n` +
        `*A4:* Absolutely! We love custom projects. Just let us know exactly what you need.\n\n` +
        `**3. Fallback / Transfer to Human:**\n` +
        `*I'm still learning and didn't quite catch that! 😅 Let me connect you with one of our human experts. Please wait a moment while I transfer you...*`,
    ar: `### 🤖 سكربت الشات بوت (الرد الآلي)\n\n` +
        `**1. رسالة الترحيب:**\n` +
        `*مرحباً بكم في {{brandName}}. شكراً لتواصلكم بخصوص {{offer}}. يرجى اختيار أحد الأرقام التالية لتوجيه استفساركم للقسم المختص:\n\n1. تفاصيل الخدمة\n2. الدعم الفني\n(أرسل الرقم المقابل)*\n\n` +
        `**2. الأسئلة الشائعة (Auto-Replies):**\n` +
        `**س1: ما هي أسعار {{offer}}؟**\n` +
        `*ج1:* أسعارنا مصممة لتناسب احتياجاتك بدقة. يرجى زيارة موقعنا أو كتابة "أسعار" للحصول على القائمة المفصلة.\n\n` +
        `**س2: كم يستغرق وقت التنفيذ / البدء؟**\n` +
        `*ج2:* عادةً، نكون جاهزين للبدء والتسليم خلال 24 إلى 48 ساعة بعد تأكيد الطلب!\n\n` +
        `**س3: هل توجد سياسة استرجاع؟**\n` +
        `*ج3:* نعم بكل تأكيد. لدينا ضمان رضا للعملاء، يمكنك الاسترجاع خلال أول 14 يوم وفقاً للشروط.\n\n` +
        `**س4: هل يمكنني طلب تخصيص لـ {{offer}}؟**\n` +
        `*ج4:* بالطبع! نحن نعشق المشاريع المخصصة. فقط أخبرنا بتفاصيل طلبك وسنقوم بتفصيله لك.\n\n` +
        `**3. في حال عدم الفهم / التحويل لموظف:**\n` +
        `*عذراً، أنا ما زلت أتعلم ولم أفهم سؤالك جيداً! 😅 ثواني وسأقوم بتحويلك لأحد خبرائنا البشريين لمساعدتك. يرجى الانتظار...*`
  }
};

export const seedDynamicTemplates = async () => {
  console.log("Seeding Dynamic Templates...");
  
  const tasks = [
    { col: 'tc_website_templates', data: WEBSITE_TEMPLATES },
    { col: 'tc_domain_ideas', data: DOMAIN_IDEAS },
    { col: 'tc_social_presence', data: SOCIAL_PRESENCE },
    { col: 'tc_profit_advice', data: PROFIT_ADVICE },
    { col: 'tc_product_ideas', data: PRODUCT_IDEAS },
    { col: 'tc_heygen_scripts', data: HEYGEN_SCRIPTS },
    { col: 'tc_pricing_analysis', data: PRICING_ANALYSIS },
    { col: 'tc_email_sequences', data: EMAIL_SEQUENCES },
    { col: 'tc_chatbot_scripts', data: CHATBOT_SCRIPTS },
  ];

  for (const task of tasks) {
    for (const [docId, docData] of Object.entries(task.data)) {
      await setDoc(doc(db, task.col, docId), docData);
    }
  }

  console.log("Dynamic Templates seeded successfully!");
};

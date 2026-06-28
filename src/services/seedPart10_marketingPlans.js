// seedPart10_marketingPlans.js — Advertising Plan Factory
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const COL = 'tc_marketing_plans';

const niches = [
  { id: 'ecom', name_en: 'General E-Commerce', name_ar: 'التجارة الإلكترونية' },
  { id: 'ecom_fashion', name_en: 'Fashion E-Commerce', name_ar: 'متجر أزياء وموضة' },
  { id: 'ecom_electronics', name_en: 'Electronics', name_ar: 'الإلكترونيات والتقنية' },
  { id: 'dropshipping', name_en: 'Dropshipping', name_ar: 'الدروبشيبينغ' },
  { id: 'agency', name_en: 'Marketing Agency', name_ar: 'وكالة تسويق' },
  { id: 'freelance', name_en: 'Freelance Services', name_ar: 'العمل الحر' },
  { id: 'consulting', name_en: 'Consulting & Coaching', name_ar: 'الاستشارات والتدريب' },
  { id: 'local', name_en: 'Local Business', name_ar: 'نشاط تجاري محلي' },
  { id: 'local_cafe', name_en: 'Cafe / Restaurant', name_ar: 'مقهى / مطعم' },
  { id: 'affiliate', name_en: 'Affiliate Marketing', name_ar: 'التسويق بالعمولة' },
];

const budgetTiers = [
  { id: 'starter', name_en: 'Starter (Under $300)', name_ar: 'مبتدئ (أقل من 300$)' },
  { id: 'growth', name_en: 'Growth ($300 - $1000)', name_ar: 'نمو (300$ - 1000$)' },
  { id: 'scale', name_en: 'Scale (Over $1000)', name_ar: 'توسع (أكثر من 1000$)' }
];

const goals = [
  { id: 'sales', name_en: 'Direct Sales', name_ar: 'مبيعات مباشرة' },
  { id: 'leads', name_en: 'Lead Generation', name_ar: 'جمع عملاء محتملين' },
  { id: 'awareness', name_en: 'Brand Awareness', name_ar: 'وعي بالعلامة التجارية' }
];

const clientLevels = [
  { id: 'beginner', name_en: 'Beginner', name_ar: 'مبتدئ' },
  { id: 'intermediate', name_en: 'Intermediate', name_ar: 'متوسط' },
  { id: 'professional', name_en: 'Professional', name_ar: 'محترف' }
];

const generateMarketingPlan = (niche, budget, goal, clientLevel) => {
  // Strategy & Setup based on Client Level
  let strategyEn = '';
  let strategyAr = '';

  if (clientLevel.id === 'beginner') {
    strategyEn = `**1. Foundation & Setup (Beginner Level):**\n- **Pixel & Tracking:** Ensure Meta/TikTok Pixel is installed correctly. No complex server-side tracking yet.\n- **Campaign Structure:** Keep it simple. One Campaign > Two Ad Sets (Broad vs Interests) > 3 Ads each.\n- **Trust Building:** Make sure social profiles look active. Add basic reviews to landing pages.`;
    strategyAr = `**1. التأسيس والبنية التحتية (مستوى المبتدئ):**\n- **البيكسل والتتبع:** تأكد من تركيب Meta/TikTok Pixel الأساسي بطريقة صحيحة. لا تشغل نفسك بالتتبع المتقدم (Server-side) الآن.\n- **هيكلة الحملة:** ابقها بسيطة جداً. حملة واحدة (CBO/ABO) > مجموعتين إعلانيتين (استهداف عام Broad، واستهداف اهتمامات) > 3 إعلانات داخل كل مجموعة.\n- **بناء الثقة:** تأكد أن الحسابات الاجتماعية تبدو نشطة ولها صورة احترافية. أضف آراء عملاء أساسية في صفحة الهبوط.`;
  } else if (clientLevel.id === 'intermediate') {
    strategyEn = `**1. Optimization & Scaling (Intermediate Level):**\n- **Advanced Tracking:** Implement Server-Side Tracking (CAPI) to recover lost iOS data.\n- **Retargeting Funnel:** Build specific audiences: (Viewed 50% Video, Added to Cart 7 Days, IG Engagers 30 Days).\n- **Offer Enhancement:** Introduce a "Bump Offer" or simple Upsell to increase AOV (Average Order Value).`;
    strategyAr = `**1. التحسين والنمو (مستوى المتوسط):**\n- **التتبع المتقدم (CAPI):** تركيب الـ Server-Side Tracking لاسترجاع البيانات المفقودة بسبب تحديثات iOS.\n- **قمع إعادة الاستهداف (Retargeting Funnel):** بناء جماهير مخصصة: (من شاهد 50% من الفيديو، من أضاف للسلة في آخر 7 أيام، المتفاعلين على إنستجرام آخر 30 يوماً).\n- **تحسين العرض:** إضافة عرض إضافي سريع (Bump Offer) أو (Upsell) لزيادة متوسط قيمة الطلب (AOV).`;
  } else {
    strategyEn = `**1. Omnichannel Scaling & Aggressive Growth (Professional Level):**\n- **MER & LTV Focus:** Stop looking at just ROAS. Monitor Marketing Efficiency Ratio (MER) and Customer Lifetime Value (LTV).\n- **Omnichannel Synergy:** Coordinate ads across Meta, TikTok, and Google Ads (PMax + Search) with cohesive messaging.\n- **Advanced Bid Strategies:** Use Cost-Cap / Bid-Cap for stable scaling during high-volume periods.`;
    strategyAr = `**1. التوسع الشامل والسيطرة (مستوى المحترف):**\n- **التركيز على MER و LTV:** توقف عن الاعتماد الكلي على الـ ROAS. راقب كفاءة التسويق الإجمالية (MER) والقيمة الدائمة للعميل (LTV).\n- **التواجد الشامل (Omnichannel):** تنسيق الحملات بين Meta و TikTok و Google (PMax + Search) لضرب العميل من كل الاتجاهات برسائل مترابطة.\n- **استراتيجيات المزايدة:** استخدام (Cost-Cap) و (Bid-Cap) لضمان استقرار التكلفة عند ضخ ميزانيات ضخمة.`;
  }

  // Logic to determine allocation
  let allocationEn = '';
  let allocationAr = '';
  
  if (budget.id === 'starter') {
    allocationEn = `**2. Budget Allocation (${budget.name_en}):**\n- **80% Testing Phase:** Focus strictly on finding 1-2 winning creatives.\n  - *Action:* Test totally different visual angles, not just text changes.\n- **20% Retargeting:** Capture low-hanging fruit (Website visitors, Cart Abandoners).`;
    allocationAr = `**2. توزيع الميزانية (${budget.name_ar}):**\n- **80% مرحلة الاختبار (Testing):** التركيز حصراً على العثور على إعلان أو إعلانين رابحين.\n  - *إجراء تنفيذي:* اختبر زوايا بصرية مختلفة تماماً، لا تغير فقط النص المكتوب.\n- **20% إعادة الاستهداف:** لاقتناص العملاء الذين أبدوا اهتماماً ولم يشتروا (زوار الموقع، التاركين للسلة).`;
  } else if (budget.id === 'growth') {
    allocationEn = `**2. Budget Allocation (${budget.name_en}):**\n- **60% Scaling:** Pushing budget into proven winning ads to maximize immediate returns.\n- **20% Continuous Testing:** Dedicate this strictly to test new hooks and creatives to avoid ad fatigue.\n- **20% Omnichannel Retargeting:** Strong retargeting across Meta and Google (Display/YouTube).`;
    allocationAr = `**2. توزيع الميزانية (${budget.name_ar}):**\n- **60% التوسع (Scaling):** ضخ الميزانية بقوة في الإعلانات الرابحة لتعظيم العوائد الفورية.\n- **20% الاختبار المستمر:** ميزانية معزولة للبحث عن خطافات (Hooks) وأفكار جديدة لتجنب موت الإعلانات القديمة.\n- **20% إعادة استهداف شامل:** ملاحقة العملاء عبر Meta و Google Display.`;
  } else {
    allocationEn = `**2. Budget Allocation (${budget.name_en}):**\n- **70% Broad Scaling:** Going broad (Advantage+ / PMax) to let algorithms reach a massive audience.\n- **15% Radical Testing:** Testing completely radical, out-of-the-box concepts or new platforms.\n- **15% High-Value Retargeting:** Aggressive, personalized follow-up based on specific user actions.`;
    allocationAr = `**2. توزيع الميزانية (${budget.name_ar}):**\n- **70% التوسع الواسع:** استخدام استهداف مفتوح (Advantage+) لإعطاء الخوارزميات حرية جلب آلاف العملاء يومياً.\n- **15% اختبار مفاهيم جريئة:** اختبار أفكار مجنونة خارج الصندوق، أو منصات جديدة كلياً.\n- **15% إعادة استهداف عالي القيمة:** ملاحقة شرسة برسائل مخصصة حسب الإجراء الذي اتخذه العميل (مثال: إعلان خاص لمن وصل لصفحة الدفع).`;
  }

  // Targeting Angles
  const targetingEn = `**3. High-Priority Targeting Angles:**\n- **Direct / Broad:** Trusting the AI. Broad targeting without limitations.\n- **Lookalike Value-Based:** Creating 1-3% LAL of your highest-paying customers.\n- **Competitor/Niche specific:** Targeting people who interact with massive pages in the ${niche.name_en} industry.\n- **Behavioral/Intent:** Targeting based on recent online purchase behaviors.`;
  
  const targetingAr = `**3. زوايا الاستهداف ذات الأولوية القصوى:**\n- **الاستهداف المفتوح (Broad):** ترك الخوارزميات (خاصة في Meta و TikTok) تبحث عن المشتري بدون تضييق النطاق.\n- **جمهور مشابه مبني على القيمة (Value-Based LAL):** بناء جمهور مشابه (1-3%) لأكثر عملائك دفعاً للأموال.\n- **المنافسين المباشرين:** استهداف المهتمين بالعلامات التجارية الكبيرة في قطاع ${niche.name_ar}.\n- **السلوك الشرائي (Behavioral):** استهداف من قاموا بعمليات شراء أونلاين مؤخراً (Engaged Shoppers).`;

  // Goal specifics
  let kpisEn = '';
  let kpisAr = '';

  if (goal.id === 'sales') {
    kpisEn = `**4. Critical KPIs to Monitor (${goal.name_en}):**\n- **Primary Metric (ROAS / CPA):** Keep CPA strictly below your break-even margin.\n- **Secondary Metrics:**\n  - *Link CTR:* Must be > 1.5%.\n  - *Add to Cart Rate:* Target > 8% (If lower, product page needs work).\n  - *Checkout Completion:* Target > 40% (If lower, shipping costs or trust issues exist).`;
    kpisAr = `**4. مؤشرات الأداء الحاسمة (${goal.name_ar}):**\n- **المؤشر الأساسي (ROAS و CPA):** يجب أن تظل تكلفة الاستحواذ (CPA) أقل من هامش ربحك الصافي.\n- **المؤشرات الثانوية (لتحديد مكان المشكلة):**\n  - *نسبة النقر للرابط (Link CTR):* يجب أن تتجاوز 1.5%.\n  - *نسبة الإضافة للسلة:* هدفك > 8% (إذا كانت أقل، صفحة المنتج ضعيفة أو السعر غير مناسب).\n  - *نسبة إكمال الدفع:* هدفك > 40% (إذا كانت أقل، غالباً المشكلة في تكلفة الشحن أو قلة الثقة).`;
  } else if (goal.id === 'leads') {
    kpisEn = `**4. Critical KPIs to Monitor (${goal.name_en}):**\n- **Primary Metric (CPL & Quality):** Balance low Cost Per Lead with high show-up/qualification rate.\n- **Secondary Metrics:**\n  - *Form/Landing Page Conversion Rate:* Target > 15-20%.\n  - *Lead to Call/Appointment Rate:* Target > 60%.\n  - *Sales Closing Rate:* Monitor how many leads actually become paying clients.`;
    kpisAr = `**4. مؤشرات الأداء الحاسمة (${goal.name_ar}):**\n- **المؤشر الأساسي (CPL وجودة البيانات):** موازنة تكلفة العميل المحتمل مع جودة رده واستعداده للدفع.\n- **المؤشرات الثانوية:**\n  - *نسبة تحويل صفحة الهبوط/الفورم:* هدفك > 15-20%.\n  - *نسبة الرد / حجز المواعيد:* هدفك > 60%.\n  - *نسبة الإغلاق البيعي (Closing Rate):* مراقبة عدد الـ Leads الذين يتحولون فعلياً لعملاء دافعين.`;
  } else {
    kpisEn = `**4. Critical KPIs to Monitor (${goal.name_en}):**\n- **Primary Metric (CPM & Reach):** Ensure you are reaching the maximum qualified audience at the lowest cost.\n- **Secondary Metrics:**\n  - *Video ThruPlay/View Rate:* Target > 30% retention at 3 seconds.\n  - *Frequency:* Maintain between 2-4 per user to build memory without fatigue.\n  - *Engagement Quality:* Monitor saves, shares, and positive comments.`;
    kpisAr = `**4. مؤشرات الأداء الحاسمة (${goal.name_ar}):**\n- **المؤشر الأساسي (CPM والوصول):** ضمان الوصول لأكبر عدد من الجمهور المستهدف بأقل تكلفة ممكنة.\n- **المؤشرات الثانوية:**\n  - *نسبة مشاهدة الفيديو:* هدفك بقاء > 30% من المشاهدين لأول 3 ثواني.\n  - *تكرار الإعلان (Frequency):* بين 2 إلى 4 مرات للمستخدم لزرع العلامة في عقله دون إزعاجه.\n  - *جودة التفاعل:* مراقبة الحفظ (Saves)، المشاركات (Shares)، والتعليقات الإيجابية.`;
  }

  // 5 Ad Creatives
  const adsEn = `**5. Top-Performing Creative Concepts:**\n- **The "Us vs. Them" Comparison (Image/Video):**\n  - Split screen showing your solution vs traditional frustrating solutions.\n  - *Why it works:* Instantly positions you as the superior, logical choice.\n- **The Educational Hook (Video):**\n  - "Stop doing [Common Mistake], do this instead."\n  - *Why it works:* Provides immediate value and builds authority before pitching the product.\n- **User Generated Content (UGC):**\n  - Authentic, unpolished selfie-style review highlighting a specific emotional transformation.\n  - *Why it works:* Breaks through "ad blindness" and feels like advice from a friend.\n- **The Direct Offer / Unboxing (Carousel/Video):**\n  - Fast-paced showcase of the product features, irresistible offer, and clear pricing.\n  - *Why it works:* Converts high-intent audiences instantly.\n- **The Objection-Crusher (Video/Image):**\n  - Address the #1 reason people hesitate to buy from you head-on in the ad copy.\n  - *Why it works:* Removes friction and builds massive trust.`;

  const adsAr = `**5. أقوى 5 مفاهيم إعلانية (Concepts) يجب إنتاجها:**\n- **إعلان المقارنة (نحن ضدهم):**\n  - صورة أو فيديو (شاشة مقسومة) تقارن بين حلك الذكي، والطرق التقليدية المتعبة.\n  - *لماذا ينجح؟* يبرز منتجك كخيار منطقي ومتفوق على الفور.\n- **إعلان "تصحيح الأخطاء" التعليمي:**\n  - "توقف عن فعل [الخطأ الشائع]، وافعل هذا بدلاً منه..."\n  - *لماذا ينجح؟* يعطي قيمة مجانية فورية، ويجعل العميل ينظر لك كخبير قبل أن تبيع له أي شيء.\n- **محتوى رأي العميل العفوي (UGC):**\n  - فيديو بسيط غير متكلف (سيلفي) لعميل يشرح كيف تغيرت حياته/يومه بفضل خدمتك.\n  - *لماذا ينجح؟* يكسر حاجز "العمى الإعلاني" ويبدو كنصيحة صادقة من صديق.\n- **العرض المباشر الساحق:**\n  - استعراض سريع وقوي للمنتج وعرض لا يمكن رفضه (خصم أو باقة) وسعر واضح.\n  - *لماذا ينجح؟* يغلق البيعة فوراً للعملاء الجاهزين للشراء (High-Intent).\n- **إعلان "تدمير المخاوف" (Objection-Crusher):**\n  - اكتب أكثر سبب يمنع الناس من الشراء منك، وقم بالرد عليه وتفنيده داخل الإعلان نفسه.\n  - *لماذا ينجح؟* يزيل التردد والشك ويبني ثقة جبارة بينك وبين العميل.`;

  const planEn = `## 🗺️ Master Advertising Plan: ${niche.name_en} (${clientLevel.name_en})\n\n${strategyEn}\n\n${allocationEn}\n\n${targetingEn}\n\n${kpisEn}\n\n${adsEn}`;
  
  const planAr = `## 🗺️ الخطة الإعلانية الشاملة: ${niche.name_ar} (مستوى ${clientLevel.name_ar})\n\n${strategyAr}\n\n${allocationAr}\n\n${targetingAr}\n\n${kpisAr}\n\n${adsAr}`;

  return { plan_en: planEn, plan_ar: planAr };
};

export const seedMarketingPlansMatrix = async () => {
  console.log('🌱 Generating Marketing Plans Matrix Database (270 Scenarios)...');
  let count = 0;

  for (const niche of niches) {
    for (const budget of budgetTiers) {
      for (const goal of goals) {
        for (const level of clientLevels) {
          const docId = `${niche.id}_${budget.id}_${goal.id}_${level.id}`;
          const planData = generateMarketingPlan(niche, budget, goal, level);
          
          await setDoc(doc(db, COL, docId), {
            id: docId,
            niche: niche.id,
            budgetTier: budget.id,
            goal: goal.id,
            clientLevel: level.id,
            ...planData,
            createdAt: new Date().toISOString()
          });
          count++;
        }
      }
    }
  }

  console.log(`✅ Successfully seeded ${count} Marketing Plans to '${COL}'`);
  return count;
};

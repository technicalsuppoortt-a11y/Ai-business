import { AppState, CrmStage, AcademyItem, AcademyPhase, Script, AffiliateLevel, AffiliateLevelSettings } from "./StateContext";


export const STAGES: CrmStage[] = [
  { id: "new", name: "عميل جديد", color: "#5aa9ff", type: "active" },
  { id: "contacted", name: "تم التواصل", color: "#c8ff4d", type: "active" },
  { id: "meeting", name: "اجتماع محجوز", color: "#9b6bff", type: "active" },
  { id: "proposal", name: "عرض سعر", color: "#ffb454", type: "active" },
  { id: "negotiation", name: "تفاوض", color: "#ff9d5c", type: "active" },
  { id: "won", name: "تم الإغلاق", color: "#37d67a", type: "won" },
  { id: "lost", name: "خسارة", color: "#ff5c7a", type: "lost" },
];

export const STAGE_PALETTE = ["#5aa9ff", "#c8ff4d", "#9b6bff", "#ffb454", "#ff9d5c", "#37d67a", "#ff5c7a", "#4fd6c8"];

export const CRM_TEMPLATES = [
  { key: "general", name: "مبيعات عامة", icon: "💼", color: "#c8ff4d", desc: "قالب عام للمبيعات والعملاء المحتملين", stageDefs: [{ name: "عميل جديد", type: "active" }, { name: "تم التواصل", type: "active" }, { name: "اجتماع محجوز", type: "active" }, { name: "عرض سعر", type: "active" }, { name: "تفاوض", type: "active" }, { name: "تم الإغلاق", type: "won" }, { name: "خسارة", type: "lost" }] },
  { key: "coaching", name: "الكوتشينج والدورات", icon: "🎓", color: "#9b6bff", desc: "بيع باقات كوتشينج وبرامج تدريبية", stageDefs: [{ name: "عميل جديد", type: "active" }, { name: "مكالمة اكتشاف", type: "active" }, { name: "عرض الباقة", type: "active" }, { name: "تفاوض", type: "active" }, { name: "مشترك", type: "won" }, { name: "خسارة", type: "lost" }] },
  { key: "digitalproducts", name: "المنتجات الرقمية", icon: "📦", color: "#ffb454", desc: "بيع كورسات وتيمبليتس ومنتجات رقمية", stageDefs: [{ name: "زائر مهتم", type: "active" }, { name: "عربة نشطة", type: "active" }, { name: "عربة متروكة", type: "active" }, { name: "تم الدفع", type: "won" }, { name: "تم الاسترجاع", type: "lost" }] },
  { key: "agency", name: "الوكالات وخدمات العملاء", icon: "🎯", color: "#ff7ab8", desc: "إدارة عملاء الخدمات والوكالات", stageDefs: [{ name: "استفسار", type: "active" }, { name: "مكالمة اكتشاف", type: "active" }, { name: "عرض مُرسل", type: "active" }, { name: "تعاقد موقّع", type: "active" }, { name: "عميل نشط", type: "won" }, { name: "خسارة", type: "lost" }] },
  { key: "saas", name: "SaaS / اشتراكات", icon: "💻", color: "#5aa9ff", desc: "مبيعات برمجيات واشتراكات شهرية", stageDefs: [{ name: "تجربة مجانية", type: "active" }, { name: "عرض توضيحي", type: "active" }, { name: "عرض سعر", type: "active" }, { name: "تفاوض", type: "active" }, { name: "مشترك", type: "won" }, { name: "ألغى الاشتراك", type: "lost" }] },
  { key: "freelance", name: "الخدمات الحرة", icon: "🧑‍💻", color: "#4fd6c8", desc: "مشاريع فريلانس وخدمات مستقلة", stageDefs: [{ name: "استفسار", type: "active" }, { name: "عرض سعر", type: "active" }, { name: "دفعة مقدمة", type: "active" }, { name: "قيد التنفيذ", type: "active" }, { name: "تم التسليم", type: "won" }, { name: "ألغى", type: "lost" }] },
];

export function buildStages(defs: any[]): CrmStage[] {
  return defs.map((d, i) => ({
    id: "s" + i,
    name: d.name,
    type: d.type,
    color: d.type === "won" ? "#37d67a" : d.type === "lost" ? "#ff5c7a" : STAGE_PALETTE[i % STAGE_PALETTE.length]
  }));
}

function genAcademyItems(n: number, prefix: string, completedPct: number): AcademyItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    title: `${prefix} ${i + 1}`,
    videoUrl: "",
    completed: i < Math.round((n * completedPct) / 100)
  }));
}

export function buildAcademyPhases(): AcademyPhase[] {
  return [
    { id: 0, phaseNum: 0, title: "Welcome", unit: "lessons", items: genAcademyItems(1, "مقدمة ترحيبية", 100) },
    { id: 1, phaseNum: 1, title: "System Setup", unit: "lessons", items: genAcademyItems(7, "إعداد النظام", 100) },
    { id: 2, phaseNum: 2, title: "Product Mastery", unit: "lessons", items: genAcademyItems(12, "إتقان المنتج", 75) },
    { id: 3, phaseNum: 3, title: "Sales Psychology", unit: "lessons", items: genAcademyItems(9, "سيكولوجية البيع", 40) },
    { id: 4, phaseNum: 4, title: "Sales Process", unit: "lessons", items: genAcademyItems(15, "عملية البيع", 10) },
    { id: 5, phaseNum: 5, title: "Scripts", unit: "scripts", items: genAcademyItems(36, "سكريبت", 0) },
    { id: 6, phaseNum: 6, title: "Real Calls", unit: "calls", items: genAcademyItems(54, "مكالمة حقيقية", 0) },
    { id: 7, phaseNum: 7, title: "CRM", unit: "lessons", items: [] },
    { id: 8, phaseNum: 8, title: "Marketing", unit: "lessons", items: [] },
    { id: 9, phaseNum: 9, title: "Growth", unit: "lessons", items: [] },
    { id: 10, phaseNum: 10, title: "Graduation", unit: "lessons", items: [] },
  ];
}



export function mergeRulesWithInitial(firestoreRules: any[]): any[] {
  const map = new Map<number, any>();

  // 1. First seed with the 14 official rules
  INITIAL_RULES.forEach((rule) => {
    map.set(Number(rule.id), rule);
  });

  // 2. Merge rules from Firestore (which can override existing rules or append new ones like Rule #15)
  if (Array.isArray(firestoreRules)) {
    firestoreRules.forEach((rule) => {
      if (rule) {
        const idNum = Number(rule.id);
        if (!isNaN(idNum) && idNum > 0) {
          map.set(idNum, { ...rule, id: idNum });
        }
      }
    });
  }

  // 3. Return array sorted by ID
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}

export const INITIAL_RULES: any[] = [
  {
    id: 1,
    titleAr: "يمنع تعديل الأسعار",
    titleEn: "Price Modifications Prohibited",
    descriptionAr: "يلتزم المسوق بالأسعار الرسمية المحددة في المنصة دون زيادة أو نقصان تحت أي ظرف.",
    descriptionEn: "Affiliates must strictly adhere to the official prices listed on the platform without markup or discount.",
    category: "prohibited",
    categoryAr: "ممنوعات",
    categoryEn: "Prohibited",
    severity: "critical",
  },
  {
    id: 2,
    titleAr: "يمنع تقديم عروض غير معتمدة",
    titleEn: "Unauthorized Offers Prohibited",
    descriptionAr: "غير مسموح بتقديم خصومات أو هدايا أو عروض ترويجية من تلقاء نفسك دون إذن كتابي مسبق.",
    descriptionEn: "Providing self-made discounts, bonuses, or promotional bundles without prior written approval is forbidden.",
    category: "prohibited",
    categoryAr: "ممنوعات",
    categoryEn: "Prohibited",
    severity: "critical",
  },
  {
    id: 3,
    titleAr: "يمنع استخدام شعار محمد جو بطريقة مختلفة",
    titleEn: "Brand Logo Misuse Prohibited",
    descriptionAr: "يجب الالتزام التام بإرشادات الهوية البصرية لشعار محمد جو وعدم التعديل على الألوان أو الأبعاد.",
    descriptionEn: "Strict compliance with Mohamed Joe brand guidelines is required. Modifying logo colors or proportions is strictly forbidden.",
    category: "prohibited",
    categoryAr: "ممنوعات",
    categoryEn: "Prohibited",
    severity: "warning",
  },
  {
    id: 4,
    titleAr: "يمنع حذف أو تعديل أي Disclaimer",
    titleEn: "Disclaimer Alteration Prohibited",
    descriptionAr: "جميع إخلاءات المسؤولية والشروط القانونية المرفقة بالمواد الإعلانية يجب أن تبقى كما هي دون حذف أو تحريف.",
    descriptionEn: "All legal disclaimers and terms attached to promotional assets must remain intact without modification or deletion.",
    category: "prohibited",
    categoryAr: "ممنوعات",
    categoryEn: "Prohibited",
    severity: "critical",
  },
  {
    id: 5,
    titleAr: "يمنع عمل نتائج مضللة (مثال: \"هتكسب مليون\")",
    titleEn: "Misleading Earnings Claims Prohibited",
    descriptionAr: "يمنع صياغة وعود خيالية أو نتائج مضللة وغير واقعية للعملاء لضمان المصداقية والأخلاقيات التجارية.",
    descriptionEn: "Making unrealistic promises or exaggerated earnings claims (e.g., 'Make Millions Overnight') is strictly forbidden.",
    category: "prohibited",
    categoryAr: "ممنوعات",
    categoryEn: "Prohibited",
    severity: "critical",
  },
  {
    id: 6,
    titleAr: "يمنع انتحال شخصية فريق محمد جو",
    titleEn: "Impersonating Mohamed Joe Team Prohibited",
    descriptionAr: "يُحظر تماماً الادعاء بأنك موظف رسمي أو ممثل مباشر لمحمد جو؛ صفة العمل هي مسوق بالعمولة مستقل فقط.",
    descriptionEn: "Falsely claiming to be an official employee or direct representative of Mohamed Joe's team is strictly prohibited. You are an independent affiliate.",
    category: "prohibited",
    categoryAr: "ممنوعات",
    categoryEn: "Prohibited",
    severity: "critical",
  },
  {
    id: 7,
    titleAr: "يمنع استخدام صفحات مزيفة",
    titleEn: "Fake Landing Pages Prohibited",
    descriptionAr: "يمنع إنشاء صفحات هبوط وهمية أو تضليلية للعملاء توحي بكونها الموقع الرسمي بشكل غير مستند.",
    descriptionEn: "Creating unauthorized fake pages or phishing/imposter domains mimicking official portals is banned.",
    category: "prohibited",
    categoryAr: "ممنوعات",
    categoryEn: "Prohibited",
    severity: "critical",
  },
  {
    id: 8,
    titleAr: "يمنع تشغيل حملات مخالفة لسياسات Meta",
    titleEn: "Meta Advertising Policy Violations Prohibited",
    descriptionAr: "يجب الالتزام بسياسات Meta الإعلانية (Facebook & Instagram) وتجنب أي ممارسات إعلانية محظورة.",
    descriptionEn: "All ad campaigns run on Meta platforms (Facebook & Instagram) must strictly abide by Meta Ads Guidelines.",
    category: "prohibited",
    categoryAr: "ممنوعات",
    categoryEn: "Prohibited",
    severity: "warning",
  },
  {
    id: 9,
    titleAr: "أي Creative جديد لازم يكون Pending Review",
    titleEn: "New Creatives Require Pending Review",
    descriptionAr: "أي تصاميم أو فيديوهات أو نصوص إعلانية جديدة يجب تقديمها للمراجعة واعتمادها من الفريق قبل إطلاقها.",
    descriptionEn: "All new ad designs, videos, or scripts must be submitted for review and approval prior to launch.",
    category: "required",
    categoryAr: "متطلبات إجبارية",
    categoryEn: "Required",
    severity: "info",
  },
  {
    id: 10,
    titleAr: "أي مخالفة قد تؤدي إلى: (إنذار - إيقاف العمولات - إيقاف الحساب - الحظر النهائي)",
    titleEn: "Violations Lead to Progressive Penalties",
    descriptionAr: "تتدرج العقوبات بحسب جسامة المخالفة لضمان بيئة عمل عادلة وآمنة للجميع.",
    descriptionEn: "Violations trigger progressive enforcement according to severity to ensure fair compliance.",
    category: "policy",
    categoryAr: "السياسات والعقوبات",
    categoryEn: "Policies",
    severity: "critical",
    steps: ["إنذار أول", "إيقاف العمولات", "إيقاف الحساب", "الحظر النهائي"],
  },
  {
    id: 11,
    titleAr: "أي محاولة غش أو Leads وهمية تلغي العمولات",
    titleEn: "Fraud & Fake Leads Forfeit Commissions",
    descriptionAr: "سيتم فحص جودة البيانات آلياً ويدوياً، وتؤدي أي بيانات زنيفة أو إحالات وهمية لإلغاء كافة الأرباح فورا.",
    descriptionEn: "Automated & manual quality validation is conducted. Fraudulent leads immediately forfeit all commissions.",
    category: "financial",
    categoryAr: "المالية والعمولات",
    categoryEn: "Financial",
    severity: "critical",
  },
  {
    id: 12,
    titleAr: "العمولة تصبح مستحقة فقط بعد انتهاء فترة الضمان وعدم وجود Refund",
    titleEn: "Commission Due After Guarantee Period & No Refund",
    descriptionAr: "يتم التأكيد النهائي للعمولة بعد انقضاء المهلة المحددة للاسترجاع وتأكيد استمرار اشتراك العميل.",
    descriptionEn: "Commissions mature after the refund window expires and no refund request has been initiated.",
    category: "financial",
    categoryAr: "المالية والعمولات",
    categoryEn: "Financial",
    severity: "info",
  },
  {
    id: 13,
    titleAr: "التحويلات تتم آخر كل شهر",
    titleEn: "Payouts Executed End of Every Month",
    descriptionAr: "تُصرف العمولات المستحقة المعتمدة بانتظام في نهاية كل شهر ميلادي وفق وسائل الدفع المعتمدة.",
    descriptionEn: "Approved mature commissions are disbursed regularly at the end of each calendar month.",
    category: "financial",
    categoryAr: "المالية والعمولات",
    categoryEn: "Financial",
    severity: "info",
  },
  {
    id: 14,
    titleAr: "الشركة يحق لها تعديل السياسات وسيظهر إشعار داخل النظام",
    titleEn: "Right to Update Policies with In-App Notice",
    descriptionAr: "تحتفظ إدارة الشركة بحق تحديث وتطوير هذه القواعد عند الحاجة، مع إرسال تنبيه شفاف لجميع المسوقين.",
    descriptionEn: "The company reserves the right to amend policies as needed; notifications will be displayed inside the portal.",
    category: "policy",
    categoryAr: "السياسات والعقوبات",
    categoryEn: "Policies",
    severity: "info",
  },
];

export const DEFAULT_AFFILIATE_FEATURES: AffiliateLevelSettings["features"] = [
  { key: "dashboard", name: { ar: "لوحة التحكم", en: "Dashboard" }, icon: "BarChart3" },
  { key: "crm", name: { ar: "إدارة العملاء (CRM)", en: "CRM System" }, icon: "Users" },
  { key: "landing_pages", name: { ar: "صفحات الهبوط", en: "Landing Pages" }, icon: "Globe" },
  { key: "creative_library", name: { ar: "مكتبة المحتوى الإبداعي", en: "Creative Library" }, icon: "Palette" },
  { key: "priority_support", name: { ar: "الدعم الأولوي", en: "Priority Support" }, icon: "Star" },
  { key: "early_creatives", name: { ar: "وصول مبكر للتصاميم الجديدة", en: "Early Access to New Creatives" }, icon: "Zap" },
  { key: "account_manager", name: { ar: "مدير حساب مخصص", en: "Dedicated Account Manager" }, icon: "Briefcase" },
  { key: "custom_training", name: { ar: "تدريب مخصص", en: "Custom Training" }, icon: "GraduationCap" },
  { key: "early_offers", name: { ar: "وصول مبكر للعروض", en: "Early Access to Offers" }, icon: "Bell" },
  { key: "in_system_badges", name: { ar: "شارات داخل النظام", en: "In-System Badges" }, icon: "Award" },
];

export const DEFAULT_AFFILIATE_LEVELS: AffiliateLevel[] = [
  {
    id: "bronze",
    name: { ar: "برونز", en: "Bronze" },
    icon: "Award",
    color: "#cd7f32",
    minSalesUSD: 0,
    maxSalesUSD: 4040, // ~200,000 EGP at 49.5 rate
    bonusPercentage: 0,
    unlockedFeatureKeys: ["dashboard", "creative_library", "in_system_badges"],
    order: 0,
  },
  {
    id: "silver",
    name: { ar: "فضي", en: "Silver" },
    icon: "Medal",
    color: "#aaaaaa",
    minSalesUSD: 4040, // ~200,000 EGP
    maxSalesUSD: 14141, // ~700,000 EGP
    bonusPercentage: 5,
    unlockedFeatureKeys: ["dashboard", "crm", "landing_pages", "creative_library", "in_system_badges"],
    order: 1,
  },
  {
    id: "gold",
    name: { ar: "ذهبي", en: "Gold" },
    icon: "Crown",
    color: "#ffb454",
    minSalesUSD: 14141, // ~700,000 EGP
    maxSalesUSD: 30303, // ~1,500,000 EGP
    bonusPercentage: 10,
    unlockedFeatureKeys: ["dashboard", "crm", "landing_pages", "creative_library", "priority_support", "early_creatives", "in_system_badges"],
    order: 2,
  },
  {
    id: "diamond",
    name: { ar: "داياموند", en: "Diamond" },
    icon: "Gem",
    color: "#6366f1",
    minSalesUSD: 30303, // ~1,500,000 EGP
    maxSalesUSD: null,  // unlimited
    bonusPercentage: 15,
    unlockedFeatureKeys: ["dashboard", "crm", "landing_pages", "creative_library", "priority_support", "early_creatives", "account_manager", "custom_training", "early_offers", "in_system_badges"],
    order: 3,
  },
];

export function defaultState(): AppState {
  return {
    crmBoards: [],
    packages: [
      { id: 1, name: "Silver", price: 1800, currency: "USD", period: "شهري", color: "#c8d0dc", icon: "🥈", active: true, features: ["استشارة تعريفية واحدة شهريًا", "دخول لمجتمع الشركاء", "مكتبة السكريبتات الأساسية", "دعم عبر الإيميل خلال 48 ساعة"], commissionPercentage: 10 },
      { id: 2, name: "Gold", price: 2500, currency: "USD", period: "شهري", color: "#ffb454", icon: "🥇", active: true, features: ["استشارتين شهريًا", "دخول كامل لـ Partner Academy", "مراجعة مكالمات حقيقية شهريًا", "دعم واتساب خلال 24 ساعة", "تقرير أداء شهري"], commissionPercentage: 15 },
      { id: 3, name: "Elite", price: 4200, currency: "USD", period: "شهري", color: "#9b6bff", icon: "💎", active: true, features: ["جلسات أسبوعية 1:1", "مراجعة كل مكالماتك مع AI Coach", "أولوية في الدعم (خلال ساعات)", "وصول مبكر لكل الميزات الجديدة", "خطة نمو مخصصة كل ربع سنة"], commissionPercentage: 20 },
    ],
    deals: [],
    meetings: [],
    academyPhases: buildAcademyPhases(),
    transactions: [],
    partners: [],
    calendars: [],
    bookings: [],
    channels: [
      { id: "general", name: "عام", icon: "💬", category: "نصي" },
      { id: "wins", name: "نجاحات", icon: "🎉", category: "نصي" },
      { id: "help", name: "مساعدة", icon: "🆘", category: "نصي" },
      { id: "scripts", name: "سكريبتات", icon: "📜", category: "نصي" },
    ],
    channelMessages: {
      general: [],
      wins: [],
      help: [],
      scripts: [],
    },
    dms: {},
    scripts: [
      { id: 1, category: "الافتتاح", title: "افتتاح مكالمة الاستكشاف", content: "إزيك يا [الاسم]، أنا [اسمك] من فريق Joe Partner. شكرًا إنك حجزت الوقت ده — الهدف من المكالمة النهاردة إني أفهم وضعك أكتر وأشوف هل احنا مناسبين نساعدك ولا لأ. تمام أبدأ بسؤال بسيط؟" },
      { id: 2, category: "الاكتشاف", title: "أسئلة اكتشاف الاحتياج", content: "إيه أكبر تحدي بتواجهه دلوقتي في البيزنس؟\nإيه اللي جربته قبل كده وماشتغلش؟\nلو الموضوع اتحل، شكل النجاح عندك هيبقى إيه بالظتقد؟" },
      { id: 3, category: "الاكتشاف", title: "تحديد الميزانية بذكاء", content: "قبل ما أقولك تفاصيل الأسعار، حابب أفهم: هل عندكم ميزانية مخصصة للحاجة دي، ولا لسه بتقيّموا الخيارات؟" },
      { id: 4, category: "تقديم العرض", title: "ربط العرض بالمشكلة", content: "بناءً على اللي قولته عن [مشكلته]، الباقة اللي هتناسبك هي [اسم الباقة] لأنها بتحل بالظبط [النقطة دي]. عايزك تسمع إزاي شركاء تانيين استخدموها ووصلوا لنتيجة X." },
      { id: 5, category: "التعامل مع الاعتراضات", title: "اعتراض: السعر غالي", content: "فاهم إن السعر مهم. بس خليني أسألك: لو الاستثمار ده هيرجعلك [X] في [مدة]، هيفرق مع القرار ولا لسه؟" },
      { id: 6, category: "التعامل مع الاعتراضات", title: "اعتراض: محتاج أفكر", content: "أكيد، قرار مهم يستاهل تفكير. بس عايز أفهم بس: إيه بالظبط اللي محتاج تفكر فيه؟ السعر، التوقيت، ولا لسه مش متأكد إن ده الحل الصح؟" },
      { id: 7, category: "الإغلاق", title: "إغلاق مباشر", content: "من كل اللي اتكلمنا فيه، أنا شايف إن الباقة دي مناسبة ليك. تحب نبدأ إمتى؟" },
      { id: 8, category: "الإغلاق", title: "إغلاق بديل (Assumptive Close)", content: "تفضّل تبدأ بالباقة الشهرية ولا السنوية بالخصم؟" },
      { id: 9, category: "المتابعة", title: "متابعة بعد 24 ساعة بدون رد", content: "إزيك يا [الاسم]، حابب أتأكد إنك شفت رسالتي. عندك أي سؤال عن العرض قبل ما نكمل?" },
    ],
    notifications: [],
    messages: [],
    dailyFocus: [],
    tasks: [],
    rules: INITIAL_RULES,
    affiliateLevels: DEFAULT_AFFILIATE_LEVELS,
    affiliateLevelSettings: {
      reviewDurationDays: 90,
      features: DEFAULT_AFFILIATE_FEATURES,
    },
    paymentMethods: [
      { id: "1", name: "Vodafone Cash", value: "+201012345678" },
      { id: "2", name: "InstaPay", value: "joe@instapay" },
      { id: "3", name: "Bank Transfer", value: "Account: 1234-5678-9012, Swift: ABCDEF" }
    ],
    settings: {
      companyName: "",
      language: "ar",
      currency: "USD",
      notifEmail: true,
      notifWhatsapp: true,
      profileName: "",
      profileRole: "",
      avatarDataUrl: "",
      theme: "light",
      adminMode: false,
      integrations: {
        stripe: { connected: false, key: "" },
        whatsapp: { connected: false, key: "" },
        googleCalendar: { connected: false, key: "" },
        zapier: { connected: false, key: "" },
        facebookAds: { connected: false, key: "" },
        slack: { connected: false, key: "" },
      },
    },
  };
}
